import { Contact } from './Contact'

export type WAConnectionState = 'open' | 'connecting' | 'close'

export type ConnectionState = {
	/** La conexión ahora está abierta, conectando o cerrada */
	connection: WAConnectionState
	/** el error que hizo que la conexión se cerrara */
	lastDisconnect?: {
		error: Error | undefined
		date: Date
	}
	/** ¿Es este un nuevo inicio de sesión? */
	isNewLogin?: boolean
	/** el código QR actual */
	qr?: string
	/**¿Ha recibido el dispositivo todas las notificaciones pendientes mientras estaba fuera de línea? */
	receivedPendingNotifications?: boolean
	/** Opciones de conexión heredada */
	legacy?: {
		phoneConnected: boolean
		user?: Contact
	}
	/**
	 * Si el cliente se muestra como un cliente activo en línea.
* Si esto es false, El teléfono principal y otros dispositivos recibirán notificaciones
	 * */
	isOnline?: boolean
}