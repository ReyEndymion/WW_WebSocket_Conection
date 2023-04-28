import { Boom } from '@hapi/boom'
import { promisify } from 'util'
import WebSocket from 'ws'
import { proto } from '../../WAProto'
import { DEF_CALLBACK_PREFIX, DEF_TAG_PREFIX, DEFAULT_ORIGIN, INITIAL_PREKEY_COUNT, MIN_PREKEY_COUNT } from '../Defaults'
import { DisconnectReason, SocketConfig } from '../Types'
import { addTransactionCapability, bindWaitForConnectionUpdate, configureSuccessfulPairing, Curve, generateLoginNode, generateMdTagPrefix, generateRegistrationNode, getCodeFromWSError, getErrorCodeFromStreamError, getNextPreKeysNode, makeNoiseHandler, printQRIfNecessaryListener, promiseTimeout } from '../Utils'
import { makeEventBuffer } from '../Utils/event-buffer'
import { assertNodeErrorFree, BinaryNode, encodeBinaryNode, getBinaryNodeChild, getBinaryNodeChildren, S_WHATSAPP_NET } from '../WABinary'

/**
 * Connects to WA servers and performs:
 * - simple queries (no retry mechanism, wait for connection establishment)
 * - listen to messages and emit events
 * - query phone connection
 */
export const makeSocket = ({
	waWebSocketUrl,
	connectTimeoutMs,
	logger,
	agent,
	keepAliveIntervalMs,
	version,
	browser,
	auth: authState,
	printQRInTerminal,
	defaultQueryTimeoutMs,
	syncFullHistory,
	transactionOpts,
	qrTimeout,
	options,
	makeSignalRepository
}: SocketConfig) => {
	const ws = new WebSocket(waWebSocketUrl, undefined, {
		origin: DEFAULT_ORIGIN,
		headers: options.headers as {},
		handshakeTimeout: connectTimeoutMs,
		timeout: connectTimeoutMs,
		agent
	})
	ws.setMaxListeners(0)

	const ev = makeEventBuffer(logger)
	/** Par de clave efímera utilizado para cifrar/descifrar la comunicación.Único para cada conexión */
	const ephemeralKeyPair = Curve.generateKeyPair()
	/** WA Wrapper de protocolo de ruido */
	const noise = makeNoiseHandler(ephemeralKeyPair, logger)

	const { creds } = authState
	// Agregar capacidad de transacción
	const keys = addTransactionCapability(authState.keys, logger, transactionOpts)
	const signalRepository = makeSignalRepository({ creds, keys })

	let lastDateRecv: Date
	let epoch = 1
	let keepAliveReq: NodeJS.Timeout
	let qrTimer: NodeJS.Timeout
	let closed = false

	const uqTagId = generateMdTagPrefix()
	const generateMessageTag = () => `${uqTagId}${epoch++}`

	const sendPromise = promisify<void>(ws.send)
	/** Enviar un búfer en bruto */
	const sendRawMessage = async(data: Uint8Array | Buffer) => {
		if(ws.readyState !== ws.OPEN) {
			throw new Boom('Connection Closed', { statusCode: DisconnectReason.connectionClosed })
		}

		const bytes = noise.encodeFrame(data)
		await promiseTimeout<void>(
			connectTimeoutMs,
			async(resolve, reject) => {
				try {
					await sendPromise.call(ws, bytes)
					resolve()
				} catch(error) {
					reject(error)
				}
			}
		)
	}

	/** enviar un nodo binario */
	const sendNode = (frame: BinaryNode) => {
		if(logger.level === 'trace') {
			logger.trace({ msgId: frame.attrs.id, fromMe: true, frame }, 'communication')
		}

		const buff = encodeBinaryNode(frame)
		return sendRawMessage(buff)
	}

	/** Registre y procese cualquier error inesperado */
	const onUnexpectedError = (err: Error | Boom, msg: string) => {
		logger.error(
			{ err },
			`unexpected error in '${msg}'`
		)
	}

	/** espera el próximo mensaje entrante */
	const awaitNextMessage = async<T>(sendMsg?: Uint8Array) => {
		if(ws.readyState !== ws.OPEN) {
			throw new Boom('Connection Closed', {
				statusCode: DisconnectReason.connectionClosed
			})
		}

		let onOpen: (data: T) => void
		let onClose: (err: Error) => void

		const result = promiseTimeout<T>(connectTimeoutMs, (resolve, reject) => {
			onOpen = resolve
			onClose = mapWebSocketError(reject)
			ws.on('frame', onOpen)
			ws.on('close', onClose)
			ws.on('error', onClose)
		})
			.finally(() => {
				ws.off('frame', onOpen)
				ws.off('close', onClose)
				ws.off('error', onClose)
			})

		if(sendMsg) {
			sendRawMessage(sendMsg).catch(onClose!)
		}

		return result
	}

	/**
     * Espere a que se reciba un mensaje con una determinada etiqueta
     * @param tag la etiqueta de mensaje para esperar
     * @param json consulta que fue enviada
     * @param timeoutMs tiempo de espera después de lo cual la promesa rechazará
     */
	 const waitForMessage = async<T>(msgId: string, timeoutMs = defaultQueryTimeoutMs) => {
		let onRecv: (json) => void
		let onErr: (err) => void
		try {
			const result = await promiseTimeout<T>(timeoutMs,
				(resolve, reject) => {
					onRecv = resolve
					onErr = err => {
						reject(err || new Boom('Connection Closed', { statusCode: DisconnectReason.connectionClosed }))
					}

					ws.on(`TAG:${msgId}`, onRecv)
					ws.on('close', onErr) // Si se cierra el socket, nunca recibirá el mensaje
					ws.off('error', onErr)
				},
			)
			return result
		} finally {
			ws.off(`TAG:${msgId}`, onRecv!)
			ws.off('close', onErr!) // Si se cierra el socket, nunca recibirá el mensaje
			ws.off('error', onErr!)
		}
	}

	/** Envíe una consulta y espere su respuesta.General automático ID de mensaje si no se proporciona */
	const query = async(node: BinaryNode, timeoutMs?: number) => {
		if(!node.attrs.id) {
			node.attrs.id = generateMessageTag()
		}

		const msgId = node.attrs.id
		const wait = waitForMessage(msgId, timeoutMs)

		await sendNode(node)

		const result = await (wait as Promise<BinaryNode>)
		if('tag' in result) {
			assertNodeErrorFree(result)
		}

		return result
	}

	/** apretón de manos de conexión */
	const validateConnection = async() => {
		let helloMsg: proto.IHandshakeMessage = {
			clientHello: { ephemeral: ephemeralKeyPair.public }
		}
		helloMsg = proto.HandshakeMessage.fromObject(helloMsg)

		logger.info({ browser, helloMsg }, 'connected to WA Web')

		const init = proto.HandshakeMessage.encode(helloMsg).finish()

		const result = await awaitNextMessage<Uint8Array>(init)
		const handshake = proto.HandshakeMessage.decode(result)

		logger.trace({ handshake }, 'handshake recv from WA Web')

		const keyEnc = noise.processHandshake(handshake, creds.noiseKey)

		const config = { version, browser, syncFullHistory }

		let node: proto.IClientPayload
		if(!creds.me) {
			node = generateRegistrationNode(creds, config)
			logger.info({ node }, 'not logged in, attempting registration...')
		} else {
			node = generateLoginNode(creds.me!.id, config)
			logger.info({ node }, 'logging in...')
		}

		const payloadEnc = noise.encrypt(
			proto.ClientPayload.encode(node).finish()
		)
		await sendRawMessage(
			proto.HandshakeMessage.encode({
				clientFinish: {
					static: keyEnc,
					payload: payloadEnc,
				},
			}).finish()
		)
		noise.finishInit()
		startKeepAliveRequest()
	}

	const getAvailablePreKeysOnServer = async() => {
		const result = await query({
			tag: 'iq',
			attrs: {
				id: generateMessageTag(),
				xmlns: 'encrypt',
				type: 'get',
				to: S_WHATSAPP_NET
			},
			content: [
				{ tag: 'count', attrs: { } }
			]
		})
		const countChild = getBinaryNodeChild(result, 'count')
		return +countChild!.attrs.value
	}

	/** genera y carga un conjunto de pre-keys al servidor */
	const uploadPreKeys = async(count = INITIAL_PREKEY_COUNT) => {
		await keys.transaction(
			async() => {
				logger.info({ count }, 'uploading pre-keys')
				const { update, node } = await getNextPreKeysNode({ creds, keys }, count)

				await query(node)
				ev.emit('creds.update', update)

				logger.info({ count }, 'uploaded pre-keys')
			}
		)
	}

	const uploadPreKeysToServerIfRequired = async() => {
		const preKeyCount = await getAvailablePreKeysOnServer()
		logger.info(`${preKeyCount} pre-keys found on server`)
		if(preKeyCount <= MIN_PREKEY_COUNT) {
			await uploadPreKeys()
		}
	}

	const onMessageRecieved = (data: Buffer) => {
		noise.decodeFrame(data, frame => {
			// Restablecer el tiempo de espera de ping
			lastDateRecv = new Date()

			let anyTriggered = false

			anyTriggered = ws.emit('frame', frame)
			// Si es un nodo binario
			if(!(frame instanceof Uint8Array)) {
				const msgId = frame.attrs.id

				if(logger.level === 'trace') {
					logger.trace({ msgId, fromMe: false, frame }, 'communication')
				}

				/* Compruebe si se trata de una respuesta a un mensaje que enviamos */
				anyTriggered = ws.emit(`${DEF_TAG_PREFIX}${msgId}`, frame) || anyTriggered
				/* Compruebe si este es una respuesta a un mensaje que esperamos */
				const l0 = frame.tag
				const l1 = frame.attrs || { }
				const l2 = Array.isArray(frame.content) ? frame.content[0]?.tag : ''

				Object.keys(l1).forEach(key => {
					anyTriggered = ws.emit(`${DEF_CALLBACK_PREFIX}${l0},${key}:${l1[key]},${l2}`, frame) || anyTriggered
					anyTriggered = ws.emit(`${DEF_CALLBACK_PREFIX}${l0},${key}:${l1[key]}`, frame) || anyTriggered
					anyTriggered = ws.emit(`${DEF_CALLBACK_PREFIX}${l0},${key}`, frame) || anyTriggered
				})
				anyTriggered = ws.emit(`${DEF_CALLBACK_PREFIX}${l0},,${l2}`, frame) || anyTriggered
				anyTriggered = ws.emit(`${DEF_CALLBACK_PREFIX}${l0}`, frame) || anyTriggered

				if(!anyTriggered && logger.level === 'debug') {
					logger.debug({ unhandled: true, msgId, fromMe: false, frame }, 'communication recv')
				}
			}
		})
	}

	const end = (error: Error | undefined) => {
		if(closed) {
			logger.trace({ trace: error?.stack }, 'connection already closed')
			return
		}

		closed = true
		logger.info(
			{ trace: error?.stack },
			error ? 'connection errored' : 'connection closed'
		)

		clearInterval(keepAliveReq)
		clearTimeout(qrTimer)

		ws.removeAllListeners('close')
		ws.removeAllListeners('error')
		ws.removeAllListeners('open')
		ws.removeAllListeners('message')

		if(ws.readyState !== ws.CLOSED && ws.readyState !== ws.CLOSING) {
			try {
				ws.close()
			} catch{ }
		}

		ev.emit('connection.update', {
			connection: 'close',
			lastDisconnect: {
				error,
				date: new Date()
			}
		})
		ev.removeAllListeners('connection.update')
	}

	const waitForSocketOpen = async() => {
		if(ws.readyState === ws.OPEN) {
			return
		}

		if(ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
			throw new Boom('Connection Closed', { statusCode: DisconnectReason.connectionClosed })
		}

		let onOpen: () => void
		let onClose: (err: Error) => void
		await new Promise((resolve, reject) => {
			onOpen = () => resolve(undefined)
			onClose = mapWebSocketError(reject)
			ws.on('open', onOpen)
			ws.on('close', onClose)
			ws.on('error', onClose)
		})
			.finally(() => {
				ws.off('open', onOpen)
				ws.off('close', onClose)
				ws.off('error', onClose)
			})
	}

	const startKeepAliveRequest = () => (
		keepAliveReq = setInterval(() => {
			if(!lastDateRecv) {
				lastDateRecv = new Date()
			}

			const diff = Date.now() - lastDateRecv.getTime()
			/*
                Verifique si ha sido una cantidad de tiempo sospechosa desde que el servidor respondió con nuestro último visto
                podría ser que la red esté abajo
            */
			if(diff > keepAliveIntervalMs + 5000) {
				end(new Boom('Connection was lost', { statusCode: DisconnectReason.connectionLost }))
			} else if(ws.readyState === ws.OPEN) {
				// Si todo está bien, envíe una solicitud de mantenimiento vivo
				query(
					{
						tag: 'iq',
						attrs: {
							id: generateMessageTag(),
							to: S_WHATSAPP_NET,
							type: 'get',
							xmlns: 'w:p',
						},
						content: [{ tag: 'ping', attrs: { } }]
					}
				)
					.catch(err => {
						logger.error({ trace: err.stack }, 'error in sending keep alive')
					})
			} else {
				logger.warn('keep alive called when WS not open')
			}
		}, keepAliveIntervalMs)
	)
	/** No tengo idea de por qué existe esto.por favor me iluminen */
	const sendPassiveIq = (tag: 'passive' | 'active') => (
		query({
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				xmlns: 'passive',
				type: 'set',
			},
			content: [
				{ tag, attrs: { } }
			]
		})
	)

	/** Cerrar sesión e invalidar la conexión */
	const logout = async(msg?: string) => {
		const jid = authState.creds.me?.id
		if(jid) {
			await sendNode({
				tag: 'iq',
				attrs: {
					to: S_WHATSAPP_NET,
					type: 'set',
					id: generateMessageTag(),
					xmlns: 'md'
				},
				content: [
					{
						tag: 'remove-companion-device',
						attrs: {
							jid,
							reason: 'user_initiated'
						}
					}
				]
			})
		}

		end(new Boom(msg || 'Intentional Logout', { statusCode: DisconnectReason.loggedOut }))
	}

	ws.on('message', onMessageRecieved)
	ws.on('open', async() => {
		try {
			await validateConnection()
		} catch(err) {
			logger.error({ err }, 'error in validating connection')
			end(err)
		}
	})
	ws.on('error', mapWebSocketError(end))
	ws.on('close', () => end(new Boom('Connection Terminated', { statusCode: DisconnectReason.connectionClosed })))
	// El servidor terminó la conexión
	ws.on('CB:xmlstreamend', () => end(new Boom('Connection Terminated by Server', { statusCode: DisconnectReason.connectionClosed })))
	// Gen QR
	ws.on('CB:iq,type:set,pair-device', async(stanza: BinaryNode) => {
		const iq: BinaryNode = {
			tag: 'iq',
			attrs: {
				to: S_WHATSAPP_NET,
				type: 'result',
				id: stanza.attrs.id,
			}
		}
		await sendNode(iq)

		const pairDeviceNode = getBinaryNodeChild(stanza, 'pair-device')
		const refNodes = getBinaryNodeChildren(pairDeviceNode, 'ref')
		const noiseKeyB64 = Buffer.from(creds.noiseKey.public).toString('base64')
		const identityKeyB64 = Buffer.from(creds.signedIdentityKey.public).toString('base64')
		const advB64 = creds.advSecretKey

		let qrMs = qrTimeout || 60_000 // El tiempo de vida de un QR
		const genPairQR = () => {
			if(ws.readyState !== ws.OPEN) {
				return
			}

			const refNode = refNodes.shift()
			if(!refNode) {
				end(new Boom('QR refs attempts ended', { statusCode: DisconnectReason.timedOut }))
				return
			}

			const ref = (refNode.content as Buffer).toString('utf-8')
			const qr = [ref, noiseKeyB64, identityKeyB64, advB64].join(',')

			ev.emit('connection.update', { qr })

			qrTimer = setTimeout(genPairQR, qrMs)
			qrMs = qrTimeout || 20_000 // QRS posterior más corto
		}

		genPairQR()
	})
	// dispositivo emparejado por primera vez
	// Si el dispositivo se combina con éxito, el servidor pide reiniciar la conexión
	ws.on('CB:iq,,pair-success', async(stanza: BinaryNode) => {
		logger.debug('pair success recv')
		try {
			const { reply, creds: updatedCreds } = configureSuccessfulPairing(stanza, creds)

			logger.info(
				{ me: updatedCreds.me, platform: updatedCreds.platform },
				'pairing configured successfully, expect to restart the connection...'
			)

			ev.emit('creds.update', updatedCreds)
			ev.emit('connection.update', { isNewLogin: true, qr: undefined })

			await sendNode(reply)
		} catch(error) {
			logger.info({ trace: error.stack }, 'error in pairing')
			end(error)
		}
	})
	// Iniciar sesión completo
	ws.on('CB:success', async() => {
		await uploadPreKeysToServerIfRequired()
		await sendPassiveIq('active')

		logger.info('opened connection to WA')
		clearTimeout(qrTimer) // nunca sucederá con toda probabilidad, pero en caso de que WA envíe éxito al primer intento

		ev.emit('connection.update', { connection: 'open' })
	})

	ws.on('CB:stream:error', (node: BinaryNode) => {
		logger.error({ node }, 'stream errored out')

		const { reason, statusCode } = getErrorCodeFromStreamError(node)

		end(new Boom(`Stream Errored (${reason})`, { statusCode, data: node }))
	})
	// Falta de flujo de transmisión, Posible cierre de sesión
	ws.on('CB:failure', (node: BinaryNode) => {
		const reason = +(node.attrs.reason || 500)
		end(new Boom('Connection Failure', { statusCode: reason, data: node.attrs }))
	})

	ws.on('CB:ib,,downgrade_webclient', () => {
		end(new Boom('Multi-device beta not joined', { statusCode: DisconnectReason.multideviceMismatch }))
	})

	let didStartBuffer = false
	process.nextTick(() => {
		if(creds.me?.id) {
			// Comience a amortiguar eventos importantes
			// Si estamos conectados
			ev.buffer()
			didStartBuffer = true
		}

		ev.emit('connection.update', { connection: 'connecting', receivedPendingNotifications: false, qr: undefined })
	})

	// llamado cuando se manejan todos los notifics fuera de línea
	ws.on('CB:ib,,offline', (node: BinaryNode) => {
		const child = getBinaryNodeChild(node, 'offline')
		const offlineNotifs = +(child?.attrs.count || 0)

		logger.info(`handled ${offlineNotifs} offline messages/notifications`)
		if(didStartBuffer) {
			ev.flush()
			logger.trace('flushed events for initial buffer')
		}

		ev.emit('connection.update', { receivedPendingNotifications: true })
	})

	// Actualizar credenciales cuando sea necesario
	ev.on('creds.update', update => {
		const name = update.me?.name
		// Si se acaba de recibir el nombre
		if(creds.me?.name !== name) {
			logger.debug({ name }, 'updated pushName')
			sendNode({
				tag: 'presence',
				attrs: { name: name! }
			})
				.catch(err => {
					logger.warn({ trace: err.stack }, 'error in sending presence update on name change')
				})
		}

		Object.assign(creds, update)
	})

	if(printQRInTerminal) {
		printQRIfNecessaryListener(ev, logger)
	}

	return {
		type: 'md' as 'md',
		ws,
		ev,
		authState: { creds, keys },
		signalRepository,
		get user() {
			return authState.creds.me
		},
		generateMessageTag,
		query,
		waitForMessage,
		waitForSocketOpen,
		sendRawMessage,
		sendNode,
		logout,
		end,
		onUnexpectedError,
		uploadPreKeys,
		uploadPreKeysToServerIfRequired,
		/**Espera a que la conexión a WA llegue a un estado */
		waitForConnectionUpdate: bindWaitForConnectionUpdate(ev),
	}
}

/**
 * Mapee el error de WebSocket al tipo correcto
 * Entonces la persona que llama puede volver
 * */
function mapWebSocketError(handler: (err: Error) => void) {
	return (error: Error) => {
		handler(
			new Boom(
				`WebSocket Error (${error.message})`,
				{ statusCode: getCodeFromWSError(error), data: error }
			)
		)
	}
}

export type Socket = ReturnType<typeof makeSocket>
