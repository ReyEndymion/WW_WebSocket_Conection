import { randomBytes } from 'crypto'
import NodeCache from 'node-cache'
import type { Logger } from 'pino'
import { DEFAULT_CACHE_TTLS } from '../Defaults'
import type { AuthenticationCreds, CacheStore, SignalDataSet, SignalDataTypeMap, SignalKeyStore, SignalKeyStoreWithTransaction, TransactionCapabilityOptions } from '../Types'
import { Curve, signedKeyPair } from './crypto'
import { delay, generateRegistrationId } from './generics'

/**
 * Agrega la capacidad de almacenamiento en caché a una tienda de letreros
 * @param store Para agregar almacenamiento en caché a la store
 * @param logger Para registrar los eventos de rastreo
 * @param _cache para usar la caché de store
 */
export function makeCacheableSignalKeyStore(
	store: SignalKeyStore,
	logger: Logger,
	_cache?: CacheStore
): SignalKeyStore {
	const cache = _cache || new NodeCache({
		stdTTL: DEFAULT_CACHE_TTLS.SIGNAL_STORE, // 5 minutes
		useClones: false,
		deleteOnExpire: true,
	})

	function getUniqueId(type: string, id: string) {
		return `${type}.${id}`
	}

	return {
		async get(type, ids) {
			const data: { [_: string]: SignalDataTypeMap[typeof type] } = { }
			const idsToFetch: string[] = []
			for(const id of ids) {
				const item = cache.get<SignalDataTypeMap[typeof type]>(getUniqueId(type, id))
				if(typeof item !== 'undefined') {
					data[id] = item
				} else {
					idsToFetch.push(id)
				}
			}

			if(idsToFetch.length) {
				logger.trace({ items: idsToFetch.length }, 'loading from store')
				const fetched = await store.get(type, idsToFetch)
				for(const id of idsToFetch) {
					const item = fetched[id]
					if(item) {
						data[id] = item
						cache.set(getUniqueId(type, id), item)
					}
				}
			}

			return data
		},
		async set(data) {
			let keys = 0
			for(const type in data) {
				for(const id in data[type]) {
					cache.set(getUniqueId(type, id), data[type][id])
					keys += 1
				}
			}

			logger.trace({ keys }, 'updated cache')

			await store.set(data)
		},
		async clear() {
			cache.flushAll()
			await store.clear?.()
		}
	}
}

/**
 * Agrega DB como capacidad de transacción (https://en.wikipedia.org/wiki/Database_transaction) al almacén de claves de señal, * Esto permite operaciones de lectura y escritura de lotes y mejora el rendimiento del lib
 * @param state la clave store para aplicar esta capacidad a
 * @param logger Logger para registrar eventos
 * @returns SignalKeyStore con capacidad de transacción
 */
export const addTransactionCapability = (
	state: SignalKeyStore,
	logger: Logger,
	{ maxCommitRetries, delayBetweenTriesMs }: TransactionCapabilityOptions
): SignalKeyStoreWithTransaction => {
	// Número de consultas realizadas a la DB durante la transacción
// Solo allí para fines de registro
	let dbQueriesInTransaction = 0
	let transactionCache: SignalDataSet = { }
	let mutations: SignalDataSet = { }

	let transactionsInProgress = 0

	return {
		get: async(type, ids) => {
			if(isInTransaction()) {
				const dict = transactionCache[type]
				const idsRequiringFetch = dict
					? ids.filter(item => typeof dict[item] === 'undefined')
					: ids
				// Solo busca si hay algún elemento para buscar
				if(idsRequiringFetch.length) {
					dbQueriesInTransaction += 1
					const result = await state.get(type, idsRequiringFetch)

					transactionCache[type] ||= {}
					Object.assign(
						transactionCache[type]!,
						result
					)
				}

				return ids.reduce(
					(dict, id) => {
						const value = transactionCache[type]?.[id]
						if(value) {
							dict[id] = value
						}

						return dict
					}, { }
				)
			} else {
				return state.get(type, ids)
			}
		},
		set: data => {
			if(isInTransaction()) {
				logger.trace({ types: Object.keys(data) }, 'caching in transaction')
				for(const key in data) {
					transactionCache[key] = transactionCache[key] || { }
					Object.assign(transactionCache[key], data[key])

					mutations[key] = mutations[key] || { }
					Object.assign(mutations[key], data[key])
				}
			} else {
				return state.set(data)
			}
		},
		isInTransaction,
		async transaction(work) {
			let result: Awaited<ReturnType<typeof work>>
			transactionsInProgress += 1
			if(transactionsInProgress === 1) {
				logger.trace('entering transaction')
			}

			try {
				result = await work()
				// Comprometer si esta es la transacción más externa
				if(transactionsInProgress === 1) {
					if(Object.keys(mutations).length) {
						logger.trace('committing transaction')
						// Reintento de mecanismo para garantizar que tengamos cierta recuperación
						// En caso de que una transacción falle en el primer intento
						let tries = maxCommitRetries
						while(tries) {
							tries -= 1
							try {
								await state.set(mutations)
								logger.trace({ dbQueriesInTransaction }, 'committed transaction')
								break
							} catch(error) {
								logger.warn(`failed to commit ${Object.keys(mutations).length} mutations, tries left=${tries}`)
								await delay(delayBetweenTriesMs)
							}
						}
					} else {
						logger.trace('no mutations in transaction')
					}
				}
			} finally {
				transactionsInProgress -= 1
				if(transactionsInProgress === 0) {
					transactionCache = { }
					mutations = { }
					dbQueriesInTransaction = 0
				}
			}

			return result
		}
	}

	function isInTransaction() {
		return transactionsInProgress > 0
	}
}

export const initAuthCreds = (): AuthenticationCreds => {
	const identityKey = Curve.generateKeyPair()
	return {
		noiseKey: Curve.generateKeyPair(),
		signedIdentityKey: identityKey,
		signedPreKey: signedKeyPair(identityKey, 1),
		registrationId: generateRegistrationId(),
		advSecretKey: randomBytes(32).toString('base64'),
		processedHistoryMessages: [],
		nextPreKeyId: 1,
		firstUnuploadedPreKeyId: 1,
		accountSyncCounter: 0,
		accountSettings: {
			unarchiveChats: false
		}
	}
}