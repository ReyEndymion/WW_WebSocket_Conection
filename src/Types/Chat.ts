import type { proto } from '../../WAProto'
import type { AccountSettings } from './Auth'
import type { BufferedEventData } from './Events'
import type { MinimalMessage } from './Message'

/** Configuración de privacidad en WhatsApp Web */
export type WAPrivacyValue = 'all' | 'contacts' | 'contact_blacklist' | 'none'

export type WAPrivacyOnlineValue = 'all' | 'match_last_seen'

export type WAReadReceiptsValue = 'all' | 'none'

/** conjunto de estados visibles para otras personas; ver updatePresence() en WhatsAppWeb.Send */
export type WAPresence = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'

export const ALL_WA_PATCH_NAMES = [
	'critical_block',
	'critical_unblock_low',
	'regular_high',
	'regular_low',
	'regular'
] as const

export type WAPatchName = typeof ALL_WA_PATCH_NAMES[number]

export interface PresenceData {
    lastKnownPresence: WAPresence
    lastSeen?: number
}

export type ChatMutation = {
    syncAction: proto.ISyncActionData
    index: string[]
}

export type WAPatchCreate = {
    syncAction: proto.ISyncActionValue
    index: string[]
    type: WAPatchName
    apiVersion: number
    operation: proto.SyncdMutation.SyncdOperation
}

export type Chat = proto.IConversation & {
    /** Unix TimeStamp de cuándo se recibió el último mensaje en el chat */
    lastMessageRecvTimestamp?: number
}

export type ChatUpdate = Partial<Chat & {
    /**
     * Si se especifica en la actualización,
     * El búfer EV verificará si la condición se cumple antes de aplicar la actualización
     * En este momento, utilizado para determinar cuándo lanzar un evento de sincronización de estado de la aplicación
     *
     * @returns Es true si la actualización se aplica;
     * false si se puede descartar;
     * undefined si la condición aún no se ha cumplido
     * */
    conditional: (bufferedData: BufferedEventData) => boolean | undefined
}>

/**
 *Los últimos mensajes en un chat, ordenados reverso-cronológicamente.Es decir, el último mensaje debe ser el primero en el chat.
 * Para las modificaciones de MD, el último mensaje en la matriz (es decir, el mensaje delantero) debe ser el último mensaje Recivido en el chat
 * */
export type LastMessageList = MinimalMessage[] | proto.SyncActionValue.ISyncActionMessageRange

export type ChatModification =
    {
        archive: boolean
        lastMessages: LastMessageList
    }
    | { pushNameSetting: string }
    | { pin: boolean }
    | {
        /**silenciar para la duración o proporcionar una marca de tiempo de silencio para eliminar*/
        mute: number | null
    }
    | {
        clear: 'all' | { messages: {id: string, fromMe?: boolean, timestamp: number}[] }
    }
    | {
        star: {
            messages: { id: string, fromMe?: boolean }[]
            star: boolean
        }
    }
    | {
        markRead: boolean
        lastMessages: LastMessageList
    }
    | { delete: true, lastMessages: LastMessageList }

export type InitialReceivedChatsState = {
    [jid: string]: {
        /** el último mensaje recibido de la otra parte */
        lastMsgRecvTimestamp?: number
        /** el último mensaje absoluto en el chat */
        lastMsgTimestamp: number
    }
}

export type InitialAppStateSyncOptions = {
    accountSettings: AccountSettings
}