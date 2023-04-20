# WW_WebSocket_Conection - Typescript/Javascript W.W. API
 
  WW_WebSocket_Conection no requiere que Selenium ni ningún otro navegador tenga una interfaz con W.W., lo hace directamente mediante un **WebSocket**. No ejecutar Selenium o Chromimum te ahorra como **medio giga** de RAM :/

  WW_WebSocket_Conection admite la interacción con las versiones web y multidispositivo de W.

  Gracias a [@pokearaujo](https://github.com/pokearaujo/multidevice) por escribir sus observaciones sobre el funcionamiento de W Multi-Device. Además, gracias a [@Sigalor](https://github.com/sigalor/whatsapp-web-reveng) por escribir sus observaciones sobre el funcionamiento de W.W. y gracias a [@Rhymen](https://github. com/Rhymen/go-whatsapp/) para la implementación de __go__.
  y sobre todo a [@adiwajshing] por la idea, aunque le ubiera ido mejor formando una empresa y apoyarse en la ley antimonopolios de EE.UU

  WW_WebSocket_Conection es de tipo seguro, extensible y fácil de usar. Si necesita más funciones que las provistas, es muy fácil escribir una extensión. Más sobre esto [aquí](#WritingCustomFunctionality).
 
  Si está interesado en crear un bot de W, puede consultar [WhatsAppInfoBot](https://github.com/adiwajshing/WhatsappInfoBot) y un bot real creado con él, [Messcat](https://github. com/ashokatechmin/Messcat).

  **Lea los documentos [aquí](https://ReyEndymion.github.io/WW_WebSocket_Conection)**
  **Únete a Discord [aquí](https://discord.gg/WeJM5FP9GG)**

## Ejemplo

Consulte y ejecute [example.ts](https://github.com/ReyEndymion/WW_WebSocket_Conection/blob/master/Example/example.ts) para ver un ejemplo de uso de la biblioteca.
El script cubre los casos de uso más comunes.
Para ejecutar el script de ejemplo, descargue o clone el repositorio y luego escriba lo siguiente en una terminal:
1. ``` cd path/to/WW_WebSocket_Conection ```
2. ``` yarn ```
3. ``` yarn example ```

## Instalar

Usa la versión estable:
```
yarn add @ReyEndymion/WW_WebSocket_Conection
```

Use la versión de borde (sin garantía de estabilidad, pero con las últimas correcciones y características)
```
yarn add github:ReyEndymion/WW_WebSocket_Conection
```

Luego importa tu código usando:
``` ts
import makeWASocket from '@ReyEndymion/WW_WebSocket_Conection'
```

## Pruebas unitarias

TODO

## Conectando

``` ts
import makeWASocket, { DisconnectReason } from '@ReyEndymion/WW_WebSocket_Conection'
import { Boom } from '@hapi/boom'

async function connectToW () {
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', m => {
        console.log(JSON.stringify(m, undefined, 2))

        console.log('replying to', m.messages[0].key.remoteJid)
        await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    })
}
// run in main file
connectToW()
```

Si la conexión es exitosa, verás un código QR impreso en la pantalla de tu terminal, escanéalo con W en tu teléfono y ¡habrás iniciado sesión!

**Nota:** instale `qrcode-terminal` usando `yarn add qrcode-terminal` para imprimir automáticamente el código QR en la terminal.

**Nota:** el código para admitir la versión heredada de WA Web (antes de varios dispositivos) se eliminó en v5. Ahora solo se admite la conexión estándar de varios dispositivos. Esto se hace porque WA parece haber eliminado por completo el soporte para la versión heredada.

## Configuración de la conexión

Puede configurar la conexión pasando un objeto `SocketConfig`.

Toda la estructura `SocketConfig` se menciona aquí con valores predeterminados:
``` ts
tipo SocketConfig = {
     /** la URL de WS para conectarse a WA */
     waWebSocketUrl: string | URL
     /** La conexión falla si el socket expira en este intervalo */
connectTimeoutMs: number
     /** Tiempo de espera predeterminado para consultas, indefinido sin tiempo de espera */
     defaultQueryTimeoutMs: number | undefined
     /** Intervalo de ping-pong para conexión WS */
     keepAliveIntervalMs: number
     /** agente proxy */
agent?: Agent
     /** registrador pino */
registrador: registrador
     /** versión con la que conectarse */
     versión: Versión WA
     /** anula la configuración del navegador */
navegador: WABbrowserDescripción
/** agente utilizado para solicitudes de obtención -- carga/descarga de medios */
fetchAgent?: Agent
     /** si el QR debe estar impreso en la terminal */
     printQRInTerminal: boolean
     /** deben emitirse eventos para las acciones realizadas por esta conexión de socket */
     emitOwnEvents: boolean
     /** proporciona un caché para almacenar medios, por lo que no es necesario volver a cargarlo */
     mediaCache?: NodeCache
     /** hosts de carga personalizados para cargar medios */
     customUploadHosts: MediaConnInfo['hosts']
     /** tiempo de espera entre el envío de nuevas solicitudes de reintento */
     retryRequestDelayMs: number
     /** tiempo de espera para la generación del siguiente QR en ms */
     qrTimeout?: number;
     /** proporcionar un objeto de estado de autenticación para mantener el estado de autenticación */
     autenticación: estado de autenticación
     /** administrar el procesamiento del historial con este control; por defecto sincronizará todo */
     shouldSyncHistoryMessage: (msg: proto.Message.IHistorySyncNotification) => boolean
     /** opciones de capacidad de transacción para SignalKeyStore */
     TransactionOpts: TransacciónCapabilityOptions
     /** proporcionar un caché para almacenar la lista de dispositivos de un usuario */
     userDevicesCache?: NodeCache
     /** marca al cliente como en línea cada vez que el socket se conecta con éxito */
     markOnlineOnConnect: boolean
     /**
      * mapa para almacenar los recuentos de reintentos de mensajes fallidos;
      * utilizado para determinar si se debe volver a intentar un mensaje o no */
     msgRetryCounterMap?: MessageRetryMap
     /** ancho para imágenes de vista previa de enlaces */
     linkPreviewImageThumbnailWidth: number
     /** Si WW_WebSocket_Conection solicita al teléfono el historial completo, se recibirá asíncrono */
     syncFullHistory: boolean
     /** Si WW_WebSocket_Conection activa las consultas de inicio automáticamente, por defecto es true */
     fireInitQueries: boolean
     /**
      * generar una vista previa de enlace de alta calidad,
      * implica subir el jpegThumbnail a WA
      * */
     generateHighQualityLinkPreview: boolean

     /** opciones para axios */
     options: AxiosRequestConfig<any>
     /**
      * obtener un mensaje de su tienda
      * implemente esto para que los mensajes que no se enviaron (resuelva el problema "este mensaje puede tardar un tiempo") se puedan volver a intentar
      * */
     getMessage: (key: proto.IMessageKey) => Promise<proto.IMessage | undefined>
}
```

### Emulación de la aplicación de escritorio en lugar de la web

1. WW_WebSocket_Conection, por defecto, emula una sesión web de Chrome
2. Si desea emular una conexión de escritorio (y recibir más historial de mensajes), agregue esto a su configuración de Socket:
     ``` ts
     const conn = makeWASocket({
        ...otherOpts,
         // puede usar Windows, Ubuntu aquí también
         browser: Browsers.macOS('Desktop'),
        syncFullHistory: true
     })
     ```

## Guardar y restaurar sesiones

Obviamente, no desea seguir escaneando el código QR cada vez que desea conectarse.

Entonces, puede cargar las credenciales para volver a iniciar sesión:
``` ts
import makeWASocket, { BufferJSON, useMultiFileAuthState } from '@ReyEndymion/WW_WebSocket_Conection'
import * as fs from 'fs'

// función de utilidad para ayudar a guardar el estado de autenticación en una sola carpeta
// esta función sirve como una buena guía para ayudar a escribir estados clave y de autenticación para bases de datos SQL/no-SQL, que recomendaría en cualquier sistema de grado de producción
const { state, saveCreds } = await useMultiFileAuthState('auth_info_WW_WebSocket_Conection')
// usará el estado dado para conectarse
// entonces, si hay credenciales válidas disponibles, se conectará sin QR
const conn = makeWASocket({autorización: estado})
// esto se llamará tan pronto como se actualicen las credenciales
conn.ev.on ('creds.update', saveCreds)
```

**Nota:** Cuando se recibe/envía un mensaje, debido a sesiones de señal que necesitan actualización, las claves de autenticación (`authState.keys`) se actualizarán. Siempre que eso suceda, debe guardar las claves actualizadas (se llama `authState.keys.set()`). No hacerlo evitará que sus mensajes lleguen al destinatario y causará otras consecuencias inesperadas. La función `useMultiFileAuthState` automáticamente se ocupa de eso, pero para cualquier otra implementación seria, deberá tener mucho cuidado con la administración del estado clave.

## Escuchar actualizaciones de conexión

WW_WebSocket_Conection ahora activa el evento `connection.update` para informarle que algo se ha actualizado en la conexión. Estos datos tienen la siguiente estructura:
``` ts
escriba Estado de conexión = {
/** la conexión ahora está abierta, conectándose o cerrada */
conexión: WAConnectionState
/** el error que provocó el cierre de la conexión */
última desconexión?: {
error: Error
fecha: fecha
}
/** es este un nuevo inicio de sesión */
isNewLogin?: booleano
/** el código QR actual */
qr?: cadena
/** el dispositivo recibió todas las notificaciones pendientes mientras estaba fuera de línea */
¿Notificaciones pendientes recibidas?: booleano
}
```

**Nota:** esto también ofrece actualizaciones del QR

## Manejo de eventos

WW_WebSocket_Conection usa la sintaxis EventEmitter para eventos.
Todos están bien escritos, por lo que no debería tener problemas con un editor de Intellisense como VS Code.

Los eventos se escriben como se menciona aquí:

``` ts

tipo de exportación WW_WebSocket_ConectionEventMap = {
     /** el estado de la conexión ha sido actualizado -- WS cerrado, abierto, conectando, etc. */
'conexión.actualización': Parcial<ConnectionState>
     /** credenciales actualizadas -- algunos metadatos, claves o algo */
     'creds.update': Parcial<AuthenticationCreds>
     /** sincronización del historial, todo se ordena cronológicamente a la inversa */
     'historial de mensajes.set': {
         charlas: Charla[]
         contactos: Contacto[]
         mensajes: WAMessage[]
         esLatest: booleano
     }
     /** conversaciones alteradas */
     'chats.upsert': Chat[]
     /** actualizar los chats dados */
     'chats.update': Parcial<Chat>[]
     /**