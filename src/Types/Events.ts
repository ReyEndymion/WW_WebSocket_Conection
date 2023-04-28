import type { Boom } from '@hapi/boom'
import { proto } from '../../WAProto'
import { AuthenticationCreds } from './Auth'
import { WACallEvent } from './Call'
import { Chat, ChatUpdate, PresenceData } from './Chat'
import { Contact } from './Contact'
import { GroupMetadata, ParticipantAction } from './GroupMetadata'
import { MessageUpsertType, MessageUserReceiptUpdate, WAMessage, WAMessageKey, WAMessageUpdate } from './Message'
import { ConnectionState } from './State'

export type BaileysEventMap = {
    /** El estado de conexión se ha actualizado: WS cerrado, abierto, conectado, etc. */
	'connection.update': Partial<ConnectionState>
    /** Credenciales actualizadas: algunos metadatos, claves o algo */
    'creds.update': Partial<AuthenticationCreds>
    /** Establecer chats (History Sync), todo está revertido cronológicamente*/
    'messaging-history.set': {
        chats: Chat[]
        contacts: Contact[]
        messages: WAMessage[]
        isLatest: boolean
    }
    /** chats de upsert */
    'chats.upsert': Chat[]
    /** Actualizar los chats dados*/
    'chats.update': ChatUpdate[]
    /** Eliminar chats con identificación dada */
    'chats.delete': string[]
    /** Presencia de contacto en un chat actualizado */
    'presence.update': { id: string, presences: { [participant: string]: PresenceData } }

    'contacts.upsert': Contact[]
    'contacts.update': Partial<Contact>[]

    'messages.delete': { keys: WAMessageKey[] } | { jid: string, all: true }
    'messages.update': WAMessageUpdate[]
    'messages.media-update': { key: WAMessageKey, media?: { ciphertext: Uint8Array, iv: Uint8Array }, error?: Boom }[]
    /**
     * add/update los mensajes dados.Si fueron recibidos mientras la conexión estaba en línea,
     * La actualización tendrá type: "notify"
     *  */
    'messages.upsert': { messages: WAMessage[], type: MessageUpsertType }
    /** el mensaje fue reaccionado.Si la reacción fue removed -- entonces "reaction.text" será falsey */
    'messages.reaction': { key: WAMessageKey, reaction: proto.IReaction }[]

    'message-receipt.update': MessageUserReceiptUpdate[]

    'groups.upsert': GroupMetadata[]
    'groups.update': Partial<GroupMetadata>[]
    /** apply an action to participants in a group */
    'group-participants.update': { id: string, participants: string[], action: ParticipantAction }

    'blocklist.set': { blocklist: string[] }
    'blocklist.update': { blocklist: string[], type: 'add' | 'remove' | 'leave'}
    /** Recibir una actualización de una llamada, incluso cuando se recibió, rechazó, aceptó la llamada*/
    'call': WACallEvent[]
}

export type BufferedEventData = {
    historySets: {
        chats: { [jid: string]: Chat }
        contacts: { [jid: string]: Contact }
        messages: { [uqId: string]: WAMessage }
        empty: boolean
        isLatest: boolean
    }
    chatUpserts: { [jid: string]: Chat }
    chatUpdates: { [jid: string]: ChatUpdate }
    chatDeletes: Set<string>
    contactUpserts: { [jid: string]: Contact }
    contactUpdates: { [jid: string]: Partial<Contact> }
    messageUpserts: { [key: string]: { type: MessageUpsertType, message: WAMessage } }
    messageUpdates: { [key: string]: WAMessageUpdate }
    messageDeletes: { [key: string]: WAMessageKey }
    messageReactions: { [key: string]: { key: WAMessageKey, reactions: proto.IReaction[] } }
    messageReceipts: { [key: string]: { key: WAMessageKey, userReceipt: proto.IUserReceipt[] } }
    groupUpdates: { [jid: string]: Partial<GroupMetadata> }
}

export type BaileysEvent = keyof BaileysEventMap

export interface BaileysEventEmitter {
	on<T extends keyof BaileysEventMap>(event: T, listener: (arg: BaileysEventMap[T]) => void): void
    off<T extends keyof BaileysEventMap>(event: T, listener: (arg: BaileysEventMap[T]) => void): void
    removeAllListeners<T extends keyof BaileysEventMap>(event: T): void
	emit<T extends keyof BaileysEventMap>(event: T, arg: BaileysEventMap[T]): boolean
}