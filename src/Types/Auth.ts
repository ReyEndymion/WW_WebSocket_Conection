import type { proto } from '../../WAProto'
import type { Contact } from './Contact'
import type { MinimalMessage } from './Message'

export type KeyPair = { public: Uint8Array, private: Uint8Array }
export type SignedKeyPair = {
    keyPair: KeyPair
    signature: Uint8Array
    keyId: number
    timestampS?: number
}

export type ProtocolAddress = {
	name: string // jid
	deviceId: number
}
export type SignalIdentity = {
	identifier: ProtocolAddress
	identifierKey: Uint8Array
}

export type LTHashState = {
    version: number
    hash: Buffer
    indexValueMap: {
        [indexMacBase64: string]: { valueMac: Uint8Array | Buffer }
    }
}

export type SignalCreds = {
    readonly signedIdentityKey: KeyPair
    readonly signedPreKey: SignedKeyPair
    readonly registrationId: number
}

export type AccountSettings = {
    /** chats desencadenantes cuando se recibe un nuevo mensaje */
    unarchiveChats: boolean
    /** el modo predeterminado para iniciar nuevas conversaciones con */
    defaultDisappearingMode?: Pick<proto.IConversation, 'ephemeralExpiration' | 'ephemeralSettingTimestamp'>
}

export type AuthenticationCreds = SignalCreds & {
    readonly noiseKey: KeyPair
    readonly advSecretKey: string

    me?: Contact
    account?: proto.IADVSignedDeviceIdentity
    signalIdentities?: SignalIdentity[]
    myAppStateKeyId?: string
    firstUnuploadedPreKeyId: number
    nextPreKeyId: number

    lastAccountSyncTimestamp?: number
    platform?: string

    processedHistoryMessages: MinimalMessage[]
    /** Número de veces que se ha sincronizado el historial y el estado de la aplicación */
    accountSyncCounter: number
    accountSettings: AccountSettings
}

export type SignalDataTypeMap = {
    'pre-key': KeyPair
    'session': Uint8Array
    'sender-key': Uint8Array
    'sender-key-memory': { [jid: string]: boolean }
    'app-state-sync-key': proto.Message.IAppStateSyncKeyData
    'app-state-sync-version': LTHashState
}

export type SignalDataSet = { [T in keyof SignalDataTypeMap]?: { [id: string]: SignalDataTypeMap[T] | null } }

type Awaitable<T> = T | Promise<T>

export type SignalKeyStore = {
    get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]): Awaitable<{ [id: string]: SignalDataTypeMap[T] }>
    set(data: SignalDataSet): Awaitable<void>
    /** borrar todos los datos en el store */
    clear?(): Awaitable<void>
}

export type SignalKeyStoreWithTransaction = SignalKeyStore & {
    isInTransaction: () => boolean
    transaction<T>(exec: () => Promise<T>): Promise<T>
}

export type TransactionCapabilityOptions = {
	maxCommitRetries: number
	delayBetweenTriesMs: number
}

export type SignalAuthState = {
    creds: SignalCreds
    keys: SignalKeyStore | SignalKeyStoreWithTransaction
}

export type AuthenticationState = {
    creds: AuthenticationCreds
    keys: SignalKeyStore
}