import { Boom } from '@hapi/boom'
import { proto } from '../../WAProto'
import { PROCESSABLE_HISTORY_TYPES } from '../Defaults'
import { ALL_WA_PATCH_NAMES, ChatModification, ChatMutation, LTHashState, MessageUpsertType, PresenceData, SocketConfig, WABusinessHoursConfig, WABusinessProfile, WAMediaUpload, WAMessage, WAPatchCreate, WAPatchName, WAPresence, WAPrivacyOnlineValue, WAPrivacyValue, WAReadReceiptsValue } from '../Types'
import { chatModificationToAppPatch, ChatMutationMap, decodePatches, decodeSyncdSnapshot, encodeSyncdPatch, extractSyncdPatches, generateProfilePicture, getHistoryMsg, newLTHashState, processSyncAction } from '../Utils'
import { makeMutex } from '../Utils/make-mutex'
import processMessage from '../Utils/process-message'
import { BinaryNode, getBinaryNodeChild, getBinaryNodeChildren, jidNormalizedUser, reduceBinaryNodeToDictionary, S_WHATSAPP_NET } from '../WABinary'
import { makeSocket } from './socket'

const MAX_SYNC_ATTEMPTS = 2

export const makeChatsSocket = (config: SocketConfig) => {
	const {
		logger,
		markOnlineOnConnect,
		fireInitQueries,
		appStateMacVerification,
		shouldIgnoreJid,
		shouldSyncHistoryMessage,
	} = config
	const sock = makeSocket(config)
	const {
		ev,
		ws,
		authState,
		generateMessageTag,
		sendNode,
		query,
		onUnexpectedError,
	} = sock

	let privacySettings: { [_: string]: string } | undefined
	let needToFlushWithAppStateSync = false
	let pendingAppStateSync = false
	/** Este mutex asegura que las notificaciones (recibos, mensajes, etc.) se procesen en orden */
	const processingMutex = makeMutex()

	/** Función auxiliar para obtener la clave de sincronización de estado de la aplicación dada */
	const getAppStateSyncKey = async(keyId: string) => {
		const { [keyId]: key } = await authState.keys.get('app-state-sync-key', [keyId])
		return key
	}

	const fetchPrivacySettings = async(force: boolean = false) => {
		if(!privacySettings || force) {
			const { content } = await query({
				tag: 'iq',
				attrs: {
					xmlns: 'privacy',
					to: S_WHATSAPP_NET,
					type: 'get'
				},
				content: [
					{ tag: 'privacy', attrs: { } }
				]
			})
			privacySettings = reduceBinaryNodeToDictionary(content?.[0] as BinaryNode, 'category')
		}

		return privacySettings
	}

	/** función auxiliar para ejecutar una consulta de IQ de privacidad */
	const privacyQuery = async(name: string, value: string) => {
		await query({
			tag: 'iq',
			attrs: {
				xmlns: 'privacy',
				to: S_WHATSAPP_NET,
				type: 'set'
			},
			content: [{
				tag: 'privacy',
				attrs: {},
				content: [
					{
						tag: 'category',
						attrs: { name, value }
					}
				]
			}]
		})
	}

	const updateLastSeenPrivacy = async(value: WAPrivacyValue) => {
		await privacyQuery('last', value)
	}

	const updateOnlinePrivacy = async(value: WAPrivacyOnlineValue) => {
		await privacyQuery('online', value)
	}

	const updateProfilePicturePrivacy = async(value: WAPrivacyValue) => {
		await privacyQuery('profile', value)
	}

	const updateStatusPrivacy = async(value: WAPrivacyValue) => {
		await privacyQuery('status', value)
	}

	const updateReadReceiptsPrivacy = async(value: WAReadReceiptsValue) => {
		await privacyQuery('readreceipts', value)
	}

	const updateGroupsAddPrivacy = async(value: WAPrivacyValue) => {
		await privacyQuery('groupadd', value)
	}

	const updateDefaultDisappearingMode = async(duration: number) => {
		await query({
			tag: 'iq',
			attrs: {
				xmlns: 'disappearing_mode',
				to: S_WHATSAPP_NET,
				type: 'set'
			},
			content: [{
				tag: 'disappearing_mode',
				attrs: {
					duration : duration.toString()
				}
			}]
		})
	}

	/** función auxiliar para ejecutar una consulta genérica de IQ */
	const interactiveQuery = async(userNodes: BinaryNode[], queryNode: BinaryNode) => {
		const result = await query({
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				type: 'get',
				xmlns: 'usync',
			},
			content: [
				{
					tag: 'usync',
					attrs: {
						sid: generateMessageTag(),
						mode: 'query',
						last: 'true',
						index: '0',
						context: 'interactive',
					},
					content: [
						{
							tag: 'query',
							attrs: {},
							content: [queryNode]
						},
						{
							tag: 'list',
							attrs: {},
							content: userNodes
						}
					]
				}
			],
		})

		const usyncNode = getBinaryNodeChild(result, 'usync')
		const listNode = getBinaryNodeChild(usyncNode, 'list')
		const users = getBinaryNodeChildren(listNode, 'user')

		return users
	}

	const onWhatsApp = async(...jids: string[]) => {
		const query = { tag: 'contact', attrs: {} }
		const list = jids.map((jid) => ({
			tag: 'user',
			attrs: {},
			content: [{
				tag: 'contact',
				attrs: {},
				content: jid,
			}],
		}))
		const results = await interactiveQuery(list, query)

		return results.map(user => {
			const contact = getBinaryNodeChild(user, 'contact')
			return { exists: contact?.attrs.type === 'in', jid: user.attrs.jid }
		}).filter(item => item.exists)
	}

	const fetchStatus = async(jid: string) => {
		const [result] = await interactiveQuery(
			[{ tag: 'user', attrs: { jid } }],
			{ tag: 'status', attrs: {} }
		)
		if(result) {
			const status = getBinaryNodeChild(result, 'status')
			return {
				status: status?.content!.toString(),
				setAt: new Date(+(status?.attrs.t || 0) * 1000)
			}
		}
	}

	/** Actualice la foto de perfil para usted o un grupo */
	const updateProfilePicture = async(jid: string, content: WAMediaUpload) => {
		const { img } = await generateProfilePicture(content)
		await query({
			tag: 'iq',
			attrs: {
				to: jidNormalizedUser(jid),
				type: 'set',
				xmlns: 'w:profile:picture'
			},
			content: [
				{
					tag: 'picture',
					attrs: { type: 'image' },
					content: img
				}
			]
		})
	}

	/** eliminar la imagen de perfil para usted o un grupo */
	const removeProfilePicture = async(jid: string) => {
		await query({
			tag: 'iq',
			attrs: {
				to: jidNormalizedUser(jid),
				type: 'set',
				xmlns: 'w:profile:picture'
			}
		})
	}

	/** update the profile status for yourself */
	const updateProfileStatus = async(status: string) => {
		await query({
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				type: 'set',
				xmlns: 'status'
			},
			content: [
				{
					tag: 'status',
					attrs: {},
					content: Buffer.from(status, 'utf-8')
				}
			]
		})
	}

	const updateProfileName = async(name: string) => {
		await chatModify({ pushNameSetting: name }, '')
	}

	const fetchBlocklist = async() => {
		const result = await query({
			tag: 'iq',
			attrs: {
				xmlns: 'blocklist',
				to: S_WHATSAPP_NET,
				type: 'get'
			}
		})

		const listNode = getBinaryNodeChild(result, 'list')
		return getBinaryNodeChildren(listNode, 'item')
			.map(n => n.attrs.jid)
	}

	const updateBlockStatus = async(jid: string, action: 'block' | 'unblock') => {
		await query({
			tag: 'iq',
			attrs: {
				xmlns: 'blocklist',
				to: S_WHATSAPP_NET,
				type: 'set'
			},
			content: [
				{
					tag: 'item',
					attrs: {
						action,
						jid
					}
				}
			]
		})
	}

	const getBusinessProfile = async(jid: string): Promise<WABusinessProfile | void> => {
		const results = await query({
			tag: 'iq',
			attrs: {
				to: 's.whatsapp.net',
				xmlns: 'w:biz',
				type: 'get'
			},
			content: [{
				tag: 'business_profile',
				attrs: { v: '244' },
				content: [{
					tag: 'profile',
					attrs: { jid }
				}]
			}]
		})

		const profileNode = getBinaryNodeChild(results, 'business_profile')
		const profiles = getBinaryNodeChild(profileNode, 'profile')
		if(profiles) {
			const address = getBinaryNodeChild(profiles, 'address')
			const description = getBinaryNodeChild(profiles, 'description')
			const website = getBinaryNodeChild(profiles, 'website')
			const email = getBinaryNodeChild(profiles, 'email')
			const category = getBinaryNodeChild(getBinaryNodeChild(profiles, 'categories'), 'category')
			const businessHours = getBinaryNodeChild(profiles, 'business_hours')
			const businessHoursConfig = businessHours
				? getBinaryNodeChildren(businessHours, 'business_hours_config')
				: undefined
			const websiteStr = website?.content?.toString()
			return {
				wid: profiles.attrs?.jid,
				address: address?.content?.toString(),
				description: description?.content?.toString() || '',
				website: websiteStr ? [websiteStr] : [],
				email: email?.content?.toString(),
				category: category?.content?.toString(),
				'business_hours': {
					timezone: businessHours?.attrs?.timezone,
					'business_config': businessHoursConfig?.map(({ attrs }) => attrs as unknown as WABusinessHoursConfig)
				}
			}
		}
	}

	const updateAccountSyncTimestamp = async(fromTimestamp: number | string) => {
		logger.info({ fromTimestamp }, 'requesting account sync')
		await sendNode({
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				type: 'set',
				xmlns: 'urn:xmpp:whatsapp:dirty',
				id: generateMessageTag(),
			},
			content: [
				{
					tag: 'clean',
					attrs: {
						type: 'account_sync',
						timestamp: fromTimestamp.toString(),
					}
				}
			]
		})
	}

	const newAppStateChunkHandler = (isInitialSync: boolean) => {
		return {
			onMutation(mutation: ChatMutation) {
				processSyncAction(
					mutation,
					ev,
					authState.creds.me!,
					isInitialSync ? { accountSettings: authState.creds.accountSettings } : undefined,
					logger
				)
			}
		}
	}

	const resyncAppState = ev.createBufferedFunction(async(collections: readonly WAPatchName[], isInitialSync: boolean) => {
// usamos esto para determinar qué eventos disparar
// de lo contrario, cuando resincronicemos desde cero, todas las notificaciones se activarán
		const initialVersionMap: { [T in WAPatchName]?: number } = {}
		const globalMutationMap: ChatMutationMap = {}

		await authState.keys.transaction(
			async() => {
				const collectionsToHandle = new Set<string>(collections)
				// En caso de que algo salga mal, asegúrese de no ingresar a un bucle que no se pueda salir
				const attemptsMap: { [T in WAPatchName]?: number } = { }
				// Siga ejecutando hasta que se realicen todas las colecciones
				// A veces, una solicitud de parche no devolverá todos los parches (Dios sabe por qué)
				// Así que buscamos hasta que todos hayan terminado (esto está determinado por el indicador "Has_More_Patches")
				while(collectionsToHandle.size) {
					const states = {} as { [T in WAPatchName]: LTHashState }
					const nodes: BinaryNode[] = []

					for(const name of collectionsToHandle) {
						const result = await authState.keys.get('app-state-sync-version', [name])
						let state = result[name]

						if(state) {
							if(typeof initialVersionMap[name] === 'undefined') {
								initialVersionMap[name] = state.version
							}
						} else {
							state = newLTHashState()
						}

						states[name] = state

						logger.info(`resyncing ${name} from v${state.version}`)

						nodes.push({
							tag: 'collection',
							attrs: {
								name,
								version: state.version.toString(),
								// Devuelva la instantánea si se sincroniza desde cero
								'return_snapshot': (!state.version).toString()
							}
						})
					}

					const result = await query({
						tag: 'iq',
						attrs: {
							to: S_WHATSAPP_NET,
							xmlns: 'w:sync:app:state',
							type: 'set'
						},
						content: [
							{
								tag: 'sync',
								attrs: {},
								content: nodes
							}
						]
					})

					// Extracto del nodo binario
					const decoded = await extractSyncdPatches(result, config?.options)
					for(const key in decoded) {
						const name = key as WAPatchName
						const { patches, hasMorePatches, snapshot } = decoded[name]
						try {
							if(snapshot) {
								const { state: newState, mutationMap } = await decodeSyncdSnapshot(
									name,
									snapshot,
									getAppStateSyncKey,
									initialVersionMap[name],
									appStateMacVerification.snapshot
								)
								states[name] = newState
								Object.assign(globalMutationMap, mutationMap)

								logger.info(`restored state of ${name} from snapshot to v${newState.version} with mutations`)

								await authState.keys.set({ 'app-state-sync-version': { [name]: newState } })
							}

							// solo proceso si hay parches sincronizados
							if(patches.length) {
								const { state: newState, mutationMap } = await decodePatches(
									name,
									patches,
									states[name],
									getAppStateSyncKey,
									config.options,
									initialVersionMap[name],
									logger,
									appStateMacVerification.patch
								)

								await authState.keys.set({ 'app-state-sync-version': { [name]: newState } })

								logger.info(`synced ${name} to v${newState.version}`)
								initialVersionMap[name] = newState.version

								Object.assign(globalMutationMap, mutationMap)
							}

							if(hasMorePatches) {
								logger.info(`${name} has more patches...`)
							} else { // La colección se realiza con sincronización
								collectionsToHandle.delete(name)
							}
						} catch(error) {
							// Si vuelve a intentar los intentos de los intentos
							// o llave no encontrada
							const isIrrecoverableError = attemptsMap[name]! >= MAX_SYNC_ATTEMPTS
								|| error.output?.statusCode === 404
								|| error.name === 'TypeError'
							logger.info(
								{ name, error: error.stack },
								`failed to sync state from version${isIrrecoverableError ? '' : ', removing and trying from scratch'}`
							)
							await authState.keys.set({ 'app-state-sync-version': { [name]: null } })
							// Incremento número de reintentos
							attemptsMap[name] = (attemptsMap[name] || 0) + 1

							if(isIrrecoverableError) {
								// Deja de volver a intentar
								collectionsToHandle.delete(name)
							}
						}
					}
				}
			}
		)

		const { onMutation } = newAppStateChunkHandler(isInitialSync)
		for(const key in globalMutationMap) {
			onMutation(globalMutationMap[key])
		}
	})

	/**
     * Obtenga la foto de perfil de un usuario/grupo
     * type = "preview" para una imagen de baja resolución
     * type = "Imagen" para la imagen de alta resolución
     */
	const profilePictureUrl = async(jid: string, type: 'preview' | 'image' = 'preview', timeoutMs?: number) => {
		jid = jidNormalizedUser(jid)
		const result = await query({
			tag: 'iq',
			attrs: {
				to: jid,
				type: 'get',
				xmlns: 'w:profile:picture'
			},
			content: [
				{ tag: 'picture', attrs: { type, query: 'url' } }
			]
		}, timeoutMs)
		const child = getBinaryNodeChild(result, 'picture')
		return child?.attrs?.url
	}

	const sendPresenceUpdate = async(type: WAPresence, toJid?: string) => {
		const me = authState.creds.me!
		if(type === 'available' || type === 'unavailable') {
			if(!me!.name) {
				logger.warn('no name present, ignoring presence update request...')
				return
			}

			ev.emit('connection.update', { isOnline: type === 'available' })

			await sendNode({
				tag: 'presence',
				attrs: {
					name: me!.name,
					type
				}
			})
		} else {
			await sendNode({
				tag: 'chatstate',
				attrs: {
					from: me!.id!,
					to: toJid!,
				},
				content: [
					{
						tag: type === 'recording' ? 'composing' : type,
						attrs: type === 'recording' ? { media: 'audio' } : {}
					}
				]
			})
		}
	}

	/**
	 * @param toJid el Jid para suscribirse a
	 * @param tcToken Token para suscripción, use si está presente
	 */
	const presenceSubscribe = (toJid: string, tcToken?: Buffer) => (
		sendNode({
			tag: 'presence',
			attrs: {
				to: toJid,
				id: generateMessageTag(),
				type: 'subscribe'
			},
			content: tcToken
				? [
					{
						tag: 'tctoken',
						attrs: {},
						content: tcToken
					}
				]
				: undefined
		})
	)

	const handlePresenceUpdate = ({ tag, attrs, content }: BinaryNode) => {
		let presence: PresenceData | undefined
		const jid = attrs.from
		const participant = attrs.participant || attrs.from

		if(shouldIgnoreJid(jid)) {
			return
		}

		if(tag === 'presence') {
			presence = {
				lastKnownPresence: attrs.type === 'unavailable' ? 'unavailable' : 'available',
				lastSeen: attrs.last && attrs.last !== 'deny' ? +attrs.last : undefined
			}
		} else if(Array.isArray(content)) {
			const [firstChild] = content
			let type = firstChild.tag as WAPresence
			if(type === 'paused') {
				type = 'available'
			}

			if(firstChild.attrs?.media === 'audio') {
				type = 'recording'
			}

			presence = { lastKnownPresence: type }
		} else {
			logger.error({ tag, attrs, content }, 'recv invalid presence node')
		}

		if(presence) {
			ev.emit('presence.update', { id: jid, presences: { [participant]: presence } })
		}
	}

	const appPatch = async(patchCreate: WAPatchCreate) => {
		const name = patchCreate.type
		const myAppStateKeyId = authState.creds.myAppStateKeyId
		if(!myAppStateKeyId) {
			throw new Boom('App state key not present!', { statusCode: 400 })
		}

		let initial: LTHashState
		let encodeResult: { patch: proto.ISyncdPatch, state: LTHashState }

		await processingMutex.mutex(
			async() => {
				await authState.keys.transaction(
					async() => {
						logger.debug({ patch: patchCreate }, 'applying app patch')

						await resyncAppState([name], false)

						const { [name]: currentSyncVersion } = await authState.keys.get('app-state-sync-version', [name])
						initial = currentSyncVersion || newLTHashState()

						encodeResult = await encodeSyncdPatch(
							patchCreate,
							myAppStateKeyId,
							initial,
							getAppStateSyncKey,
						)
						const { patch, state } = encodeResult

						const node: BinaryNode = {
							tag: 'iq',
							attrs: {
								to: S_WHATSAPP_NET,
								type: 'set',
								xmlns: 'w:sync:app:state'
							},
							content: [
								{
									tag: 'sync',
									attrs: {},
									content: [
										{
											tag: 'collection',
											attrs: {
												name,
												version: (state.version - 1).toString(),
												'return_snapshot': 'false'
											},
											content: [
												{
													tag: 'patch',
													attrs: {},
													content: proto.SyncdPatch.encode(patch).finish()
												}
											]
										}
									]
								}
							]
						}
						await query(node)

						await authState.keys.set({ 'app-state-sync-version': { [name]: state } })
					}
				)
			}
		)

		if(config.emitOwnEvents) {
			const { onMutation } = newAppStateChunkHandler(false)
			const { mutationMap } = await decodePatches(
				name,
				[{ ...encodeResult!.patch, version: { version: encodeResult!.state.version }, }],
				initial!,
				getAppStateSyncKey,
				config.options,
				undefined,
				logger,
			)
			for(const key in mutationMap) {
				onMutation(mutationMap[key])
			}
		}
	}

	/** Enviar los accesorios de ABT puede arreglar el fallo de escaneo QR si el servidor espera */
	const fetchAbt = async() => {
		const abtNode = await query({
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				xmlns: 'abt',
				type: 'get',
			},
			content: [
				{ tag: 'props', attrs: { protocol: '1' } }
			]
		})

		const propsNode = getBinaryNodeChild(abtNode, 'props')

		let props: { [_: string]: string } = {}
		if(propsNode) {
			props = reduceBinaryNodeToDictionary(propsNode, 'prop')
		}

		logger.debug('fetched abt')

		return props
	}

	/** El envío de accesorios que no son ABT pueden arreglar el fallo de escaneo QR si el servidor espera */
	const fetchProps = async() => {
		const resultNode = await query({
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				xmlns: 'w',
				type: 'get',
			},
			content: [
				{ tag: 'props', attrs: {} }
			]
		})

		const propsNode = getBinaryNodeChild(resultNode, 'props')

		let props: { [_: string]: string } = {}
		if(propsNode) {
			props = reduceBinaryNodeToDictionary(propsNode, 'prop')
		}

		logger.debug('fetched props')

		return props
	}

	/**
     * Modificar un chat - Marca sin leer, leer, etc.
     * Los últimos Mensajes deben clasificarse en reversa cronológicamente
     * Requiere los últimos mensajes hasta que reciba el último mensaje;requerido para el archivo y no leído
    */
	const chatModify = (mod: ChatModification, jid: string) => {
		const patch = chatModificationToAppPatch(mod, jid)
		return appPatch(patch)
	}

	/**
	 * Agrega etiqueta para los chats.
	 */
	const addChatLabel = (jid: string, labelId: string) => {
		return chatModify({
			addChatLabel: {
				labelId
			}
		}, jid)
	}

	/**
	 * Elimina la etiqueta para el chat.
	 */
	const removeChatLabel = (jid: string, labelId: string) => {
		return chatModify({
			removeChatLabel: {
				labelId
			}
		}, jid)
	}

	/**
	 * Agrega una etiqueta para el mensaje.
	 */
	const addMessageLabel = (jid: string, messageId: string, labelId: string) => {
		return chatModify({
			addMessageLabel: {
				messageId,
				labelId
			}
		}, jid)
	}

	/**
	 * Elimina la etiqueta del mensaje.
	 */
	const removeMessageLabel = (jid: string, messageId: string, labelId: string) => {
		return chatModify({
			removeMessageLabel: {
				messageId,
				labelId
			}
		}, jid)
	}
	/**
	 * Las consultas deben ser disparadas en la conexión abierta
	 * Ayuda a garantizar la paridad con WA Web
	 * */
	const executeInitQueries = async() => {
		await Promise.all([
			fetchAbt(),
			fetchProps(),
			fetchBlocklist(),
			fetchPrivacySettings(),
		])
	}

	const upsertMessage = ev.createBufferedFunction(async(msg: WAMessage, type: MessageUpsertType) => {
		ev.emit('messages.upsert', { messages: [msg], type })

		if(!!msg.pushName) {
			let jid = msg.key.fromMe ? authState.creds.me!.id : (msg.key.participant || msg.key.remoteJid)
			jid = jidNormalizedUser(jid!)

			if(!msg.key.fromMe) {
				ev.emit('contacts.update', [{ id: jid, notify: msg.pushName, verifiedName: msg.verifiedBizName! }])
			}

			// Actualice nuestro pushname también
			if(msg.key.fromMe && msg.pushName && authState.creds.me?.name !== msg.pushName) {
				ev.emit('creds.update', { me: { ...authState.creds.me!, name: msg.pushName! } })
			}
		}

		const historyMsg = getHistoryMsg(msg.message!)
		const shouldProcessHistoryMsg = historyMsg
			? (
				shouldSyncHistoryMessage(historyMsg)
				&& PROCESSABLE_HISTORY_TYPES.includes(historyMsg.syncType!)
			)
			: false

		if(historyMsg && !authState.creds.myAppStateKeyId) {
			logger.warn('skipping app state sync, as myAppStateKeyId is not set')
			pendingAppStateSync = true
		}

		await Promise.all([
			(async() => {
				if(
					historyMsg
					&& authState.creds.myAppStateKeyId
				) {
					pendingAppStateSync = false
					await doAppStateSync()
				}
			})(),
			processMessage(
				msg,
				{
					shouldProcessHistoryMsg,
					ev,
					creds: authState.creds,
					keyStore: authState.keys,
					logger,
					options: config.options,
					getMessage: config.getMessage,
				}
			)
		])

		if(
			msg.message?.protocolMessage?.appStateSyncKeyShare
			&& pendingAppStateSync
		) {
			await doAppStateSync()
			pendingAppStateSync = false
		}

		async function doAppStateSync() {
			if(!authState.creds.accountSyncCounter) {
				logger.info('doing initial app state sync')
				await resyncAppState(ALL_WA_PATCH_NAMES, true)

				const accountSyncCounter = (authState.creds.accountSyncCounter || 0) + 1
				ev.emit('creds.update', { accountSyncCounter })

				if(needToFlushWithAppStateSync) {
					logger.debug('flushing with app state sync')
					ev.flush()
				}
			}
		}
	})

	ws.on('CB:presence', handlePresenceUpdate)
	ws.on('CB:chatstate', handlePresenceUpdate)

	ws.on('CB:ib,,dirty', async(node: BinaryNode) => {
		const { attrs } = getBinaryNodeChild(node, 'dirty')!
		const type = attrs.type
		switch (type) {
		case 'account_sync':
			if(attrs.timestamp) {
				let { lastAccountSyncTimestamp } = authState.creds
				if(lastAccountSyncTimestamp) {
					await updateAccountSyncTimestamp(lastAccountSyncTimestamp)
				}

				lastAccountSyncTimestamp = +attrs.timestamp
				ev.emit('creds.update', { lastAccountSyncTimestamp })
			}

			break
		default:
			logger.info({ node }, 'received unknown sync')
			break
		}
	})

	ev.on('connection.update', ({ connection, receivedPendingNotifications }) => {
		if(connection === 'open') {
			if(fireInitQueries) {
				executeInitQueries()
					.catch(
						error => onUnexpectedError(error, 'init queries')
					)
			}

			sendPresenceUpdate(markOnlineOnConnect ? 'available' : 'unavailable')
				.catch(
					error => onUnexpectedError(error, 'presence update requests')
				)
		}

		if(receivedPendingNotifications) {
			// Si no tenemos la clave de estado de la aplicación
			// seguimos amortiguando los eventos hasta que finalmente tengamos
			// la clave y puede sincronizar los mensajes
			if(!authState.creds?.myAppStateKeyId) {
				ev.buffer()
				needToFlushWithAppStateSync = true
			}
		}
	})

	return {
		...sock,
		processingMutex,
		fetchPrivacySettings,
		upsertMessage,
		appPatch,
		sendPresenceUpdate,
		presenceSubscribe,
		profilePictureUrl,
		onWhatsApp,
		fetchBlocklist,
		fetchStatus,
		updateProfilePicture,
		removeProfilePicture,
		updateProfileStatus,
		updateProfileName,
		updateBlockStatus,
		updateLastSeenPrivacy,
		updateOnlinePrivacy,
		updateProfilePicturePrivacy,
		updateStatusPrivacy,
		updateReadReceiptsPrivacy,
		updateGroupsAddPrivacy,
		updateDefaultDisappearingMode,
		getBusinessProfile,
		resyncAppState,
		chatModify,
		addChatLabel,
		removeChatLabel,
		addMessageLabel,
		removeMessageLabel
	}
}
