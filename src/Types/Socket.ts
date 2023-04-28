
import { AxiosRequestConfig } from 'axios'
import type { Agent } from 'https'
import type { Logger } from 'pino'
import type { URL } from 'url'
import { proto } from '../../WAProto'
import { AuthenticationState, SignalAuthState, TransactionCapabilityOptions } from './Auth'
import { MediaConnInfo } from './Message'
import { SignalRepository } from './Signal'

export type WAVersion = [number, number, number]
export type WABrowserDescription = [string, string, string]

export type CacheStore = {
    /** Obtenga una clave en caché y cambie las estadísticas */
    get<T>(key: string): T | undefined
    /** Establecer una llave en el caché */
    set<T>(key: string, value: T): void
    /** Eliminar una llave del caché */
    del(key: string): void
    /** Ajuste todos los datos */
    flushAll(): void
}

export type SocketConfig = {
    /** la URL WS para conectarse a WA */
    waWebSocketUrl: string | URL
    /** Falla la conexión si el socket se desprende en este intervalo */
    connectTimeoutMs: number
    /** Tiempo de espera predeterminado para consultas, indefinido sin tiempo de espera */
    defaultQueryTimeoutMs: number | undefined
    /** intervalo de ping-pong para conexión WS */
    keepAliveIntervalMs: number
    /** agente proxy */
    agent?: Agent
    /** maderero de pino*/
    logger: Logger
    /** versión para conectarse con */
    version: WAVersion
    /** anular la configuración del navegador */
    browser: WABrowserDescription
    /**Agente utilizado para solicitar solicitudes -- uploading/downloading para los medios */
    fetchAgent?: Agent
    /** Si el QR se imprime en la terminal */
    printQRInTerminal: boolean
    /** ¿Deberían emitirse eventos para las acciones realizadas por esta conexión de socket? */
    emitOwnEvents: boolean
    /** Hosts de carga personalizado para cargar medios a */
    customUploadHosts: MediaConnInfo['hosts']
    /** Es hora de esperar entre enviar nuevas solicitudes de reintento */
    retryRequestDelayMs: number
    /** Es hora de esperar la generación del próximo QR en MS */
    qrTimeout?: number
    /** Proporcione un objeto de estado de autenticación para mantener el estado de autores */
    auth: AuthenticationState
    /** Administrar el procesamiento del historial con este control;Por defecto sincronizará todo*/
    shouldSyncHistoryMessage: (msg: proto.Message.IHistorySyncNotification) => boolean
    /** Opciones de capacidad de transacción para SignalKeyStore */
    transactionOpts: TransactionCapabilityOptions
    /** marca al cliente como en línea cada vez que el socket se conecta correctamente */
    markOnlineOnConnect: boolean

    /** Proporcione un caché para almacenar medios, por lo que no tiene que volver a cargar */
    mediaCache?: CacheStore
    /**
     * mapa para almacenar los recuentos de reintento para mensajes fallidos;
     * utilizado para determinar si volver a intentar un mensaje o no */
    msgRetryCounterCache?: CacheStore
    /** Proporcione un caché para almacenar la lista de dispositivos de un usuario */
    userDevicesCache?: CacheStore
    /** Ofertas de llamada para almacenar en caché para almacenar */
    callOfferCache?: CacheStore
    /** Ancho para imágenes de vista previa de enlace */
    linkPreviewImageThumbnailWidth: number
    /** Si Baileys solicita al teléfono el historial completo, se recibirá async */
    syncFullHistory: boolean
    /** Si baileys activa las consultas de inicio automáticamente, el valor predeterminado es true */
    fireInitQueries: boolean
    /**
     * generar una vista previa de enlaces de alta calidad,
     * implica cargar el jpegThumbnail a WA
     * */
    generateHighQualityLinkPreview: boolean

    /**
     * Devuelve si se ignora un JID,
     * No se activará ningún evento para ese JID.
     * Los mensajes de ese Jid tampoco se descifrarán
     * */
    shouldIgnoreJid: (jid: string) => boolean | undefined

    /**
     * Opcionalmente parche el mensaje antes de enviar
     * */
    patchMessageBeforeSending: (
        msg: proto.IMessage,
        recipientJids: string[],
    ) => Promise<proto.IMessage> | proto.IMessage

    /** Verificar el estado de la aplicación en MACs */
    appStateMacVerification: {
        patch: boolean
        snapshot: boolean
    }

    /** opciones para axios */
    options: AxiosRequestConfig<{}>
    /**
     * Obtener un mensaje de su store
     * Implementar esto para que los mensajes no pudieran enviar
     * (resuelve el problema de "este mensaje puede llevar un tiempo")
     * */
    getMessage: (key: proto.IMessageKey) => Promise<proto.IMessage | undefined>

    makeSignalRepository: (auth: SignalAuthState) => SignalRepository
}
