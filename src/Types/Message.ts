import { AxiosRequestConfig } from 'axios'
import type { Logger } from 'pino'
import type { Readable } from 'stream'
import type { URL } from 'url'
import { proto } from '../../WAProto'
import { MEDIA_HKDF_KEY_MAPPING } from '../Defaults'
import type { GroupMetadata } from './GroupMetadata'
import { CacheStore } from './Socket'

// export the WAMessage Prototypes
export { proto as WAProto }
export type WAMessage = proto.IWebMessageInfo
export type WAMessageContent = proto.IMessage
export type WAContactMessage = proto.Message.IContactMessage
export type WAContactsArrayMessage = proto.Message.IContactsArrayMessage
export type WAMessageKey = proto.IMessageKey
export type WATextMessage = proto.Message.IExtendedTextMessage
export type WAContextInfo = proto.IContextInfo
export type WALocationMessage = proto.Message.ILocationMessage
export type WAGenericMediaMessage = proto.Message.IVideoMessage | proto.Message.IImageMessage | proto.Message.IAudioMessage | proto.Message.IDocumentMessage | proto.Message.IStickerMessage
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export import WAMessageStubType = proto.WebMessageInfo.StubType
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export import WAMessageStatus = proto.WebMessageInfo.Status
export type WAMediaUpload = Buffer | { url: URL | string } | { stream: Readable }
/** Conjunto de tipos de mensajes compatibles con la biblioteca */
export type MessageType = keyof proto.Message

export type DownloadableMessage = { mediaKey?: Uint8Array | null, directPath?: string | null, url?: string | null }

export type MessageReceiptType = 'read' | 'read-self' | 'hist_sync' | 'peer_msg' | 'sender' | 'inactive' | 'played' | undefined

export type MediaConnInfo = {
    auth: string
    ttl: number
    hosts: { hostname: string, maxContentLengthBytes: number }[]
    fetchDate: Date
}

export interface WAUrlInfo {
    'canonical-url': string
    'matched-text': string
    title: string
    description?: string
    jpegThumbnail?: Buffer
    highQualityThumbnail?: proto.Message.IImageMessage
    originalThumbnailUrl?: string
}

// tipos para generar mensajes WA
type Mentionable = {
    /** Lista de JID que se mencionan en el texto que lo acompaña */
    mentions?: string[]
}
type ViewOnce = {
    viewOnce?: boolean
}

type Buttonable = {
    /** Agregar botones al mensaje  */
    buttons?: proto.Message.ButtonsMessage.IButton[]
}
type Templatable = {
    /** Agregar botones al mensaje (conflictos con botones normales)*/
    templateButtons?: proto.IHydratedTemplateButton[]

    footer?: string
}
type Editable = {
  edit?: WAMessageKey
}
type Listable = {
    /**Secciones de la lista */
    sections?: proto.Message.ListMessage.ISection[]

    /** Título de un mensaje de lista solamente*/
    title?: string

    /** Texto del Bnutton en la lista (requerido) */
    buttonText?: string
}
type WithDimensions = {
    width?: number
    height?: number
}

export type PollMessageOptions = {
    name: string
    selectableCount?: number
    values: string[]
    /** Mensaje Secreto 32 byte para encriptar Selecciones de encuestas */
    messageSecret?: Uint8Array
}

export type MediaType = keyof typeof MEDIA_HKDF_KEY_MAPPING
export type AnyMediaMessageContent = (
    ({
        image: WAMediaUpload
        caption?: string
        jpegThumbnail?: string
    } & Mentionable & Buttonable & Templatable & WithDimensions)
    | ({
        video: WAMediaUpload
        caption?: string
        gifPlayback?: boolean
        jpegThumbnail?: string
    } & Mentionable & Buttonable & Templatable & WithDimensions)
    | {
        audio: WAMediaUpload
        /** Si se establece en True, enviará como un `nota de voz` */
        ptt?: boolean
        /** Opcionalmente, diga la duración del audio */
        seconds?: number
    }
    | ({
        sticker: WAMediaUpload
        isAnimated?: boolean
    } & WithDimensions) | ({
        document: WAMediaUpload
        mimetype: string
        fileName?: string
        caption?: string
    } & Buttonable & Templatable))
    & { mimetype?: string } & Editable

export type ButtonReplyInfo = {
    displayText: string
    id: string
    index: number
}

export type WASendableProduct = Omit<proto.Message.ProductMessage.IProductSnapshot, 'productImage'> & {
    productImage: WAMediaUpload
}

export type AnyRegularMessageContent = (
    ({
	    text: string
        linkPreview?: WAUrlInfo | null
    }
    & Mentionable & Buttonable & Templatable & Listable & Editable)
    | AnyMediaMessageContent
    | ({
        poll: PollMessageOptions
    } & Mentionable & Buttonable & Templatable & Editable)
    | {
        contacts: {
            displayName?: string
            contacts: proto.Message.IContactMessage[]
        }
    }
    | {
        location: WALocationMessage
    }
    | { react: proto.Message.IReactionMessage }
    | {
        buttonReply: ButtonReplyInfo
        type: 'template' | 'plain'
    }
    | {
        listReply: Omit<proto.Message.IListResponseMessage, 'contextInfo'>
    }
    | {
        product: WASendableProduct
        businessOwnerJid?: string
        body?: string
        footer?: string
    }
) & ViewOnce

export type AnyMessageContent = AnyRegularMessageContent | {
	forward: WAMessage
	force?: boolean
} | {
    /**Elimine su mensaje o el mensaje de cualquier persona en un grupo (requerido por el administrador) */
	delete: WAMessageKey
} | {
	disappearingMessagesInChat: boolean | number
}

export type GroupMetadataParticipants = Pick<GroupMetadata, 'participants'>

type MinimalRelayOptions = {
    /**anular la ID del mensaje con una cadena personalizada proporcionada */
    messageId?: string
    /** metadatos grupales en caché, uso para evitar solicitudes redundantes para WA y acelerar el envío de MSG*/
    cachedGroupMetadata?: (jid: string) => Promise<GroupMetadataParticipants | undefined>
}

export type MessageRelayOptions = MinimalRelayOptions & {
    /** solo envíe a un participante específico;utilizado cuando un descifrado de un mensaje falla para un solo usuario */
    participant?: { jid: string, count: number }
    /** Atributos adicionales para agregar al nodo binario WA*/
    additionalAttributes?: { [_: string]: string }
    /** ¿Deberíamos usar el caché de dispositivos o obtener de nuevo desde el servidor;predeterminado se supone que es "true" */
    useUserDevicesCache?: boolean
}

export type MiscMessageGenerationOptions = MinimalRelayOptions & {
    /** Opcional, si desea establecer manualmente la marca de tiempo del mensaje*/
	timestamp?: Date
    /** El mensaje que desea citar */
	quoted?: WAMessage
    /** Configuración de mensajes que desaparecen */
    ephemeralExpiration?: number | string
    /** Tiempo de espera para la carga de medios en el servidor WA */
    mediaUploadTimeoutMs?: number
}
export type MessageGenerationOptionsFromContent = MiscMessageGenerationOptions & {
	userJid: string
}

export type WAMediaUploadFunction = (readStream: Readable, opts: { fileEncSha256B64: string, mediaType: MediaType, timeoutMs?: number }) => Promise<{ mediaUrl: string, directPath: string }>

export type MediaGenerationOptions = {
	logger?: Logger
    mediaTypeOverride?: MediaType
    upload: WAMediaUploadFunction
    /** Medios para caché, por lo que no tiene que volver a cargarse */
    mediaCache?: CacheStore

    mediaUploadTimeoutMs?: number

    options?: AxiosRequestConfig
}
export type MessageContentGenerationOptions = MediaGenerationOptions & {
	getUrlInfo?: (text: string) => Promise<WAUrlInfo | undefined>
}
export type MessageGenerationOptions = MessageContentGenerationOptions & MessageGenerationOptionsFromContent

/**
 * Tipo de mensaje Upsert
 * 1. notify => notify el usuario, este mensaje acaba de recibir
 * 2. append => append El mensaje del historial de chat, no se requiere notificación
 */
export type MessageUpsertType = 'append' | 'notify'

export type MessageUserReceipt = proto.IUserReceipt

export type WAMessageUpdate = { update: Partial<WAMessage>, key: proto.IMessageKey }

export type WAMessageCursor = { before: WAMessageKey | undefined } | { after: WAMessageKey | undefined }

export type MessageUserReceiptUpdate = { key: proto.IMessageKey, receipt: MessageUserReceipt }

export type MediaDecryptionKeyInfo = {
    iv: Buffer
    cipherKey: Buffer
    macKey?: Buffer
}

export type MinimalMessage = Pick<proto.IWebMessageInfo, 'key' | 'messageTimestamp'>
