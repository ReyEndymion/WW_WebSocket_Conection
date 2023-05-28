import { Boom } from '@hapi/boom'
import NodeCache from 'node-cache'
import makeWASocket, { AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, makeCacheableSignalKeyStore, makeInMemoryStore, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey } from '../src'
import MAIN_LOGGER from '../src/Utils/logger'

const logger = MAIN_LOGGER.child({ })
logger.level = 'trace'

const useStore = !process.argv.includes('--no-store')
const doReplies = !process.argv.includes('--no-reply')

//mapa externo para almacenar recuentos de reintentos de mensajes cuando falla el descifrado/cifrado
// mantener esto fuera del socket en sí, para evitar un ciclo de descifrado/cifrado de mensajes en los reinicios del socket
const msgRetryCounterCache = new NodeCache()

// el almacén mantiene los datos de la conexión WA en la memoria
// puede escribirse en un archivo y leerse desde él
const store = useStore ? makeInMemoryStore({ logger }) : undefined
store?.readFromFile('./baileys_store_multi.json')
// guarde cada 10s
setInterval(() => {
	store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

// iniciar una conexión
const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	// Obtenga la última versión de WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

	const sock = makeWASocket({
		version,
		logger,
		printQRInTerminal: true,
		auth: {
			creds: state.creds,
			/** el almacenamiento en caché hace que el almacén sea más rápido para enviar/recibir mensajes */
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		msgRetryCounterCache,
		generateHighQualityLinkPreview: true,
		// Ignorar todos los mensajes de transmisión: recibir lo mismo
		// Comenta la línea a continuación
		// shouldIgnoreJid: jid => isJidBroadcast(jid),
		// Implementar para manejar reintentos y actualizaciones de encuestas
		getMessage,
	})

	store?.bind(sock.ev)

	const sendMessageWTyping = async(msg: AnyMessageContent, jid: string) => {
		await sock.presenceSubscribe(jid)
		await delay(500)

		await sock.sendPresenceUpdate('composing', jid)
		await delay(2000)

		await sock.sendPresenceUpdate('paused', jid)

		await sock.sendMessage(jid, msg)
	}

	// La función de proceso le permite procesar todos los eventos que acaban de ocurrir
	// eficientemente en un lote
	sock.ev.process(
		// Los eventos son un mapa para el nombre del evento => datos del evento
		async(events) => {
			// Algo sobre la conexión cambió
			// Tal vez cerró, o recibimos todo el mensaje o conexión de conexión abierta
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect } = update
				if(connection === 'close') {
					// Vuelva a conectar si no se registra
					if((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
						startSock()
					} else {
						console.log('Connection closed. You are logged out.')
					}
				}

				console.log('connection update', update)
			}

			// Credenciales actualizadas: guárdelas
			if(events['creds.update']) {
				await saveCreds()
			}

			if(events['labels.association']) {
				console.log(events['labels.association'])
			}


			if(events['labels.edit']) {
				console.log(events['labels.edit'])
			}

			if(events.call) {
				console.log('recv call event', events.call)
			}

			// Historia recibida
			if(events['messaging-history.set']) {
				const { chats, contacts, messages, isLatest } = events['messaging-history.set']
				console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`)
			}

			// Recibí un nuevo mensaje
			if(events['messages.upsert']) {
				const upsert = events['messages.upsert']
				console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

				if(upsert.type === 'notify') {
					for(const msg of upsert.messages) {
						if(!msg.key.fromMe && doReplies) {
							console.log('replying to', msg.key.remoteJid)
							await sock!.readMessages([msg.key])
							await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid!)
						}
					}
				}
			}

			// Mensajes actualizados como estado entregado, mensaje eliminado, etc.
			if(events['messages.update']) {
				console.log(
					JSON.stringify(events['messages.update'], undefined, 2)
				)

				for(const { key, update } of events['messages.update']) {
					if(update.pollUpdates) {
						const pollCreation = await getMessage(key)
						if(pollCreation) {
							console.log(
								'got poll update, aggregation: ',
								getAggregateVotesInPollMessage({
									message: pollCreation,
									pollUpdates: update.pollUpdates,
								})
							)
						}
					}
				}
			}

			if(events['message-receipt.update']) {
				console.log(events['message-receipt.update'])
			}

			if(events['messages.reaction']) {
				console.log(events['messages.reaction'])
			}

			if(events['presence.update']) {
				console.log(events['presence.update'])
			}

			if(events['chats.update']) {
				console.log(events['chats.update'])
			}

			if(events['contacts.update']) {
				for(const contact of events['contacts.update']) {
					if(typeof contact.imgUrl !== 'undefined') {
						const newUrl = contact.imgUrl === null
							? null
							: await sock!.profilePictureUrl(contact.id!).catch(() => null)
						console.log(
							`contact ${contact.id} has a new profile pic: ${newUrl}`,
						)
					}
				}
			}

			if(events['chats.delete']) {
				console.log('chats deleted ', events['chats.delete'])
			}
		}
	)

	return sock

	async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
		if(store) {
			const msg = await store.loadMessage(key.remoteJid!, key.id!)
			return msg?.message || undefined
		}

		// Solo si la tienda está presente
		return proto.Message.fromObject({})
	}
}

startSock()