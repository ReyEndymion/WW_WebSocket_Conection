# WW_WebSocket_Conection - Typescript/Javascript W.W. API
 
  WW_WebSocket_Conection no requiere que Selenium ni ningún otro navegador tenga una interfaz con W.W., lo hace directamente mediante un **WebSocket**. No ejecutar Selenium o Chromimum te ahorra como **medio giga** de RAM :/

  WW_WebSocket_Conection admite la interacción con las versiones web y multidispositivo de W.

  Gracias a [@pokearaujo](https://github.com/pokearaujo/multidevice) por escribir sus observaciones sobre el funcionamiento de W Multi-Device. Además, gracias a [@Sigalor](https://github.com/sigalor/W-web-reveng) por escribir sus observaciones sobre el funcionamiento de W.W. y gracias a [@Rhymen](https://github. com/Rhymen/go-W/) para la implementación de __go__.
  y sobre todo a [@adiwajshing] por la idea, aunque le ubiera ido mejor formando una empresa y apoyarse en la ley antimonopolios de EE.UU

  WW_WebSocket_Conection es de tipo seguro, extensible y fácil de usar. Si necesita más funciones que las provistas, es muy fácil escribir una extensión. Más sobre esto [aquí](#WritingCustomFunctionality).
 
  Si está interesado en crear un bot de W, puede consultar [WInfoBot](https://github.com/adiwajshing/WInfoBot) y un bot real creado con él, [Messcat](https://github. com/ashokatechmin/Messcat).

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
                connectToW()
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
     /** Tiempo de await predeterminado para consultas, indefinido sin tiempo de await */
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
     /** tiempo de await entre el envío de nuevas solicitudes de reintento */
     retryRequestDelayMs: number
     /** tiempo de await para la generación del siguiente QR en ms */
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
      * obtener un mensaje de su store
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

**Nota:** Cuando se recibe/envía un mensaje, debido a sesiones de señal que necesitan actualización, las claves de autenticación (`authState.keys`) se actualizarán. Siempre que eso suceda, debe guardar las claves actualizadas (se llama `authState.keys.set()`). No hacerlo evitará que sus mensajes lleguen al destinatario y causará otras consecuencias inawaitdas. La función `useMultiFileAuthState` automáticamente se ocupa de eso, pero para cualquier otra implementación seria, deberá tener mucho cuidado con la administración del estado clave.

## Escuchar actualizaciones de conexión

WW_WebSocket_Conection ahora activa el evento `connection.update` para informarle que algo se ha actualizado en la conexión. Estos datos tienen la siguiente estructura:
``` ts
type ConnectionState = {
/** la conexión ahora está abierta, conectándose o cerrada */
connection: WAConnectionState
/** el error que provocó el cierre de la conexión */
lastDisconnect?: {
error: Error
date: Date
}
/** es este un nuevo inicio de sesión */
isNewLogin?: booleano
/** el código QR actual */
qr?: string
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

export type WW_WebSocket_ConectionEventMap = {
     /** el estado de la conexión ha sido actualizado -- WS cerrado, abierto, conectando, etc. */
'connection.update': Partial<ConnectionState>
     /** credenciales actualizadas -- algunos metadatos, claves o algo */
     'creds.update': Partial<AuthenticationCreds>
     /** sincronización del historial, todo se ordena cronológicamente a la inversa */
     'messaging-history.set': {
        chats: Chat[]
        contacts: Contact[]
        messages: WAMessage[]
        isLatest: boolean
    }
     /** conversaciones alteradas */
     'chats.upsert': Chat[]
     /** actualizar los chats dados */
     'chats.update': Partial<Chat>[]
     /** eliminar chats con ID dado */
     'chats.delete': string[]
     /** presencia de contacto en un chat actualizado */
    'presence.update': { id: string, presences: { [participant: string]: PresenceData } }

    'contacts.upsert': Contact[]
    'contacts.update': Partial<Contact>[]

    'messages.delete': { keys: WAMessageKey[] } | { jid: string, all: true }
    'messages.update': WAMessageUpdate[]
    'messages.media-update': { key: WAMessageKey, media?: { ciphertext: Uint8Array, iv: Uint8Array }, error?: Boom }[]
     /**
      * añadir/actualizar los mensajes dados. Si se recibieron mientras la conexión estaba en línea,
      * la actualización tendrá tipo: "notificar"
      * */
     'messages.upsert': { messages: WAMessage[], type: MessageUpsertType }
     /** se reaccionó al mensaje. Si se eliminó la reacción, entonces "reaction.text" será false */
     'messages.reaction': { key: WAMessageKey, reaction: proto.IReaction }[]

     'mensaje-recibo.update': MessageUserReceiptUpdate[]

     'groups.upsert': GroupMetadata[]
     'groups.update': Partial<GroupMetadata>[]
     /** aplicar una acción a los participantes de un grupo */
     'group-participants.update': { id: string, participantes: string[], action: ParticipantAction }

     'blocklist.set': { blocklist: string[] }
    'blocklist.update': { blocklist: string[], type: 'add' | 'remove' }
     /** Reciba una actualización de una llamada, incluso cuándo se recibió, rechazó o aceptó la llamada */
     'call': WACallEvent[]
}
```

Puedes escuchar estos eventos así:
``` ts

const sock = makeWASocket()
sock.ev.on('messages.upsert', ({ messages }) => {
    console.log('got messages', messages)
})

```

## Implementación de un almacén de datos

WW_WebSocket_Conection no viene con un almacenamiento de facto para chats, contactos o mensajes. Sin embargo, se ha proporcionado una implementación sencilla en memoria. La store escucha actualizaciones de chat, mensajes nuevos, actualizaciones de mensajes, etc., para tener siempre una versión actualizada de los datos.

Se puede utilizar de la siguiente manera:

``` ts
import makeWASocket, { makeInMemoryStore } from '@ReyEndymion/WW_WebSocket_Conection'
// la store mantiene los datos de la conexión WA en memoria
// se puede escribir en un archivo y leer de él
const almacenar = hacerAlmacénDeMemoria({ })
// se puede leer desde un archivo
store.readFromFile('./WW_WebSocket_Conection_store.json')
// guarda el estado en un archivo cada 10s
establecerIntervalo(() => {
     store.writeToFile('./WW_WebSocket_Conection_store.json')
}, 10_000)

const calcetín = hacerWASocket({ })
// escuchará desde este socket
// la store puede escuchar desde un nuevo socket una vez que el socket actual supera su vida útil
store.bind(sock.ev)

sock.ev.on('chats.set', () => {
     // puede usar "store.chats" como quiera, incluso después de que el socket se apague
     // "chats" => una instancia KeyedDB
    console.log('got chats', store.chats.all())
})

sock.ev.on('contacts.set', () => {
    console.log('got contacts', Object.values(store.contacts))
})

```

La store también proporciona algunas funciones simples como `loadMessages` que utilizan la store para acelerar la recuperación de datos.

**Nota:** Recomiendo encarecidamente crear su propio almacén de datos, especialmente para las conexiones de MD, ya que almacenar todo el historial de chat de alguien en la memoria es una terrible pérdida de RAM.

## Enviando mensajes

**Envía todo tipo de mensajes con una sola función:**

### Mensajes no multimedia

``` ts
import { MessageType, MessageOptions, Mimetype } from '@ReyEndymion/WW_WebSocket_Conection'

const id = 'abcd@s.W.net' // el ID de W
// enviar un mensaje de texto simple!
const sentMsg = await sock.sendMessage(id, { text: 'oh hola' })
// enviar un mensaje de respuesta
const sentMsg = await sock.sendMessage(id, { text: 'oh hola' }, { citado: mensaje })
// enviar un mensaje de menciones
const sentMsg = await sock.sendMessage(id, { text: '@12345678901', menciones: ['12345678901@s.W.net'] })
// enviar una ubicación!
const sentMsg = await sock.sendMessage(
     identificación,
     { ubicación: { grados Latitud: 24.121231, grados Longitud: 55.1121221 } }
)
// enviar un contacto!
const vcard = 'BEGIN:VCARD\n' // metadatos de la tarjeta de contacto
             + 'VERSIÓN:3.0\n'
             + 'FN:Rey Endymion\n' // nombre completo
             + 'ORG:ANI MX SCANS;\n' // la organización del contacto
             + 'TEL;type=CELL;type=VOICE;waid=911234567890:+91 12345 67890\n' // ID de W + número de teléfono
             + 'FIN:VCARD'
const sentMsg = await sock.sendMessage(
     identificación,
     {
         contactos: {
             displayName: 'Jeff',
             contactos: [{ vcard }]
         }
     }
)

// enviar un mensaje de botones!
const buttons = [
  {buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
  {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
  {buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
]

const buttonMessage = {
    text: "Hi it's button message",
    footer: 'Hello World',
    buttons: buttons,
    headerType: 1
}

const sendMsg = await sock.sendMessage(id, buttonMessage)

// enviar un mensaje de plantilla!
const templateButtons = [
    {index: 1, urlButton: {displayText: '⭐ ¡Estrella para WW_WebSocket_Conection en GitHub!', url: 'https://github.com/ReyEndymion/WW_WebSocket_Conection'}},
    {index: 2, callButton: {displayText: '¡Llámame!', phoneNumber: '+1 (234) 5678-901'}},
    {index: 3, quickReplyButton: {displayText: '¡Esta es una respuesta, como los botones normales!', id: 'id-like-buttons-message'}},
]

const templateMessage = {
    text: "Hola, es un mensaje de plantilla",
    footer: 'Hola Mundo',
    templateButtons: templateButtons
}

const sendMsg = await sock.sendMessage(id, templateMessage)

// enviar un mensaje de lista!
const sections = [
    {
	title: "Sección 1",
rows: [
{title: "Opción 1", rowId: "opción1"},
{title: "Opción 2", rowId: "opción2", description: "Esta es una descripción"}
]
     },
    {
title: "Sección 2",
filas: [
{title: "Opción 3", rowId: "opción3"},
{title: "Opción 4", rowId: "opción 4", description: "Esta es una descripción V2"}
]
     },
]

const listMessage = {
  text: "Esta es una lista",
   footer: "buen pie de página, enlace: https://google.com",
   title: "Increíble título de lista en negrita",
   buttonText: "Requerido, texto en el botón para ver la lista",
   sections
}

const sendMsg = await sock.sendMessage(id, listMessage)

const reactionMessage = {
    react: {
        text: "💖", // usa una cadena vacía para eliminar la reacción
         clave: mensaje.clave
     }
}

const sendMsg = await sock.sendMessage(id, reactionMessage)
```

### Envío de mensajes con vistas previas de enlaces

1. Por defecto, WA MD no tiene generación de enlaces cuando se envía desde la web
2. WW_WebSocket_Conection tiene una función para generar el contenido de estas vistas previas de enlaces
3. Para habilitar el uso de esta función, agregue `link-preview-js` como una dependencia a su proyecto con `yarn add link-preview-js`
4. Envía un enlace:
``` ts
// enviar un enlace
const sentMsg = await sock.sendMessage(id, { text: 'Hola, esto fue enviado usando https://github.com/ReyEndymion/WW_WebSocket_Conection' })
```

### Mensajes multimedia

Enviar medios (video, pegatinas, imágenes) es más fácil y eficiente que nunca.
- Puede especificar un búfer, una URL local o incluso una URL remota.
- Al especificar una URL de medios, WW_WebSocket_Conection nunca carga todo el búfer en la memoria; incluso encripta los medios como un flujo legible.

``` ts
import { MessageType, MessageOptions, Mimetype } from '@ReyEndymion/WW_WebSocket_Conection'
// Enviando gifs
await sock.sendMessage(
    id, 
    { 
        video: fs.readFileSync("Media/ma_gif.mp4"), 
        caption: "¡Hola!",
         gifPlayback: true
     }
)

await sock.sendMessage(
    id,
     {
         video: "./Media/ma_gif.mp4",
         caption: "¡Hola!",
         gifPlayback: true
     }
)

// enviar un archivo de audio
await sock.sendMessage(
    id, 
    { audio: { url: "./Media/audio.mp3" }, mimetype: 'audio/mp4' }
    { url: "Media/audio.mp3" }, // puede enviar mp3, mp4 y ogg
)

// enviar un mensaje de botones con encabezado de imagen!
const buttons = [
  {buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
  {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
  {buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
]

const buttonMessage = {
    image: {url: 'https://example.com/image.jpeg'},
     caption: "Hola, es el mensaje del botón",
     footer: 'Hola Mundo',
     buttons: botones,
     headerType: 4
}

const sendMsg = await sock.sendMessage(id, buttonMessage)

//envía un mensaje de plantilla con una imagen **adjunta**!
const templateButtons = [
  {index: 1, urlButton: {displayText: '⭐ ¡Estrella para WW_WebSocket_Conection en GitHub!', url: 'https://github.com/ReyEndymion/WW_WebSocket_Conection'}},
   {index: 2, callButton: {displayText: '¡Llámame!', phoneNumber: '+1 (234) 5678-901'}},
   {index: 3, quickReplyButton: {displayText: '¡Esta es una respuesta, como los botones normales!', id: 'id-like-buttons-message'}},
]

const buttonMessage = {
     text: "Hola, es un mensaje de plantilla",
     footer: 'Hola Mundo',
     templateButtons: templateButtons,
     image: {url: 'https://example.com/image.jpeg'}
}

const sendMsg = await sock.sendMessage(id, templateMessage)
```

### Notas

- `id` es el ID de W de la persona o grupo al que le estás enviando el mensaje.
     - Debe tener el formato ```[código de país][número de teléfono]@s.W.net```
- Ejemplo para personas: ```+19999999999@s.W.net```.
- Para grupos, debe tener el formato ``` 123456789-123345@g.us ```.
     - Para las listas de difusión, es `[marca de tiempo de creación]@emisión`.
     - Para las historias, el ID es `status@broadcast`.
- Para los mensajes multimedia, la miniatura se puede generar automáticamente para las imágenes y los adhesivos, siempre que agregue `jimp` o `sharp` como una dependencia en su proyecto utilizando `yarn add jimp` o `yarn add sharp`. Las miniaturas de los videos también se pueden generar automáticamente, sin embargo, debe tener `ffmpeg` instalado en su sistema.
- **MiscGenerationOptions**: información adicional sobre el mensaje. Puede tener los siguientes valores __opcional__:
     ``` ts
     const info: MessageOptions = {
         quoted: mensajecitado, // el mensaje que desea citar
         contextInfo: {forwardingScore: 2, isForwarded: true}, // alguna información de contexto aleatoria (también puede mostrar un mensaje reenviado con esto)
         timestamp: Date(), // opcional, si desea configurar manualmente la marca de tiempo del mensaje
         caption: "¡Hola!", // (para mensajes de medios) el subtítulo para enviar con los medios (aunque no se puede enviar con calcomanías)
         jpegThumbnail: "23GD#4/==", /* (para mensajes de ubicación y medios) tiene que ser un JPEG codificado en base 64 si desea enviar una miniatura personalizada,
                                     o configúrelo como nulo si no desea enviar una miniatura.
                                     No ingrese este campo si desea generar automáticamente un pulgar
                                 */
         mimetype: Mimetype.pdf, /* (para mensajes de medios) especifica el tipo de medios (opcional para todos los tipos de medios excepto documentos),
                                     import {Mimetype} from '@ReyEndymion/WW_WebSocket_Conection'
                                 */
         fileName: 'somefile.pdf', // (para mensajes de medios) nombre de archivo para los medios
         /* enviará mensajes de audio como notas de voz, si se establece en true */
         ptt: true,
         /** Debería enviarse como mensajes que desaparecen.
          * Por defecto, 'chat', que sigue la configuración del chat */
         ephemeralExpiration: WA_DEFAULT_EPHEMERAL
     }
     ```
## Reenvío de mensajes

``` ts
const msg = getMessageFromStore('455@s.W.net', 'HSJHJWH7323HSJSJ') // implemente esto por su parte
await sock.sendMessage('1234@s.W.net', { forward: msg }) // ¡WA reenvía el mensaje!
```

## Lectura de mensajes

Un conjunto de claves de mensaje debe marcarse explícitamente como leído ahora.
En dispositivos múltiples, no puede marcar una lectura de "chat" completa como si fuera con Baileys Web.
Esto significa que debe realizar un seguimiento de los mensajes no leídos.

``` ts
const key = {
    remoteJid: '1234-123@g.us',
    id: 'AHASHH123123AHGA',  // id del mensaje que desea leer
     participant: '912121232@s.W.net' // ID del usuario que envió el mensaje (indefinido para chats individuales)
}
// pasar a la función leerMensajes
// también puede pasar varias claves para leer varios mensajes
await sock.readMessages([clave])
```

El ID del mensaje es el identificador único del mensaje que está marcando como leído.
En un `WAMessage`, se puede acceder al `messageID` usando ```messageID = message.key.id```.

## Actualizar presencia

``` ts
await sock.sendPresenceUpdate('available', id)

```
Esto le permite a la persona/grupo con ``` id ``` saber si estás en línea, fuera de línea, escribiendo, etc.

``` presence ``` puede ser uno de los siguientes:
``` ts
type WAPresence = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
```

La presencia expira después de unos 10 segundos.

**Nota:** En la versión multidispositivo de W, si un cliente de escritorio está activo, WA no envía notificaciones automáticas al dispositivo. Si desea recibir dichas notificaciones, marque su cliente de Baileys fuera de línea usando `sock.sendPresenceUpdate('unavailable')`

## Descarga de mensajes multimedia

Si desea guardar los medios que recibió
``` ts
import { writeFile } from 'fs/promises'
import { downloadMediaMessage } from  '@ReyEndymion/WW_WebSocket_Conection'

sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]

    if (!m.message) return // si no hay mensaje de texto o multimedia
     const messageType = Object.keys (m.message)[0]// obtener qué tipo de mensaje es: texto, imagen, video
     // si el mensaje es una imagen
     if (messageType === 'ImagenMensaje') {
         // descarga el mensaje
         const buffer = await downloadMediaMessage(
            m,
            'buffer',
             { },
             {
                 logger,
                 // pasa esto para que baileys pueda solicitar una recarga de medios
                 // que ha sido borrado
                 reuploadRequest: sock.updateMediaMessage
             }
         )
         // Guardar en archivo
         await writeFile('./my-download.jpeg', buffer)
     }
}
```

**Nota:** W elimina automáticamente los medios antiguos de sus servidores. Para que el dispositivo acceda a dicho medio, otro dispositivo que lo tenga debe volver a cargarlo. Esto se puede lograr usando:
``` ts
const updateMediaMsg = await sock.updateMediaMessage(msg)
```

## Eliminación de mensajes

``` ts
const jid = '1234@s.W.net' // también puede ser un grupo
const response = await sock.sendMessage(jid, { text: '¡hola!' }) // enviar un mensaje
// envía un mensaje para eliminar el mensaje dado
// esto borra el mensaje para todos
await sock.sendMessage(jid, {delete: response.key})
```

**Nota:** la eliminación por uno mismo es compatible a través de `chatModify` (siguiente sección)

## Modificación de chats

WA utiliza una forma de comunicación encriptada para enviar actualizaciones de chat/aplicaciones. Esto se ha implementado en su mayoría y puede enviar las siguientes actualizaciones:

- Archivar un chat
   ``` ts
   const lastMsgInChat = await getLastMessageInChat('123456@s.whatsapp.net') // implemente esto en su extremo
   await sock.chatModify({archive: true, lastMessages: [lastMsgInChat]}, '123456@s.whatsapp.net')
   ```
- Silenciar/activar un chat
   ``` ts
   // silencio por 8 horas
   await sock.chatModify({mute: 8*60*60*1000 }, '123456@s.whatsapp.net', [])
   // activar el silencio
   await sock.chatModify({mute: null}, '123456@s.whatsapp.net', [])
   ```
- Marcar un chat como leído/no leído
   ``` ts
   const lastMsgInChat = await getLastMessageInChat('123456@s.whatsapp.net') // implemente esto en su extremo
   // marcarlo como no leído
   await sock.chatModify({ markRead: false, lastMessages: [lastMsgInChat] }, '123456@s.whatsapp.net')
   ```

- Eliminar un mensaje para mí
   ``` ts
   await sock.chatModify(
    { clear: { messages: [{ id: 'ATWYHDNNWU81732J', fromMe: true, timestamp: "1654823909" }] } }, 
    '123456@s.whatsapp.net', 
    []
    )

   ```

- Eliminar un chat
   ``` ts
   const lastMsgInChat = await getLastMessageInChat('123456@s.whatsapp.net') // implemente esto en su extremo
   await sock.chatModify({
    delete: true,
    lastMessages: [{ key: lastMsgInChat.key, messageTimestamp: lastMsgInChat.messageTimestamp }]
  },
  '123456@s.whatsapp.net')
   ```

- Anclar/desanclar un chat
   ``` ts
   await sock.chatModify({
    pin: true // o `falso` para desanclar
   },
   '123456@s.whatsapp.net')
   ```

**Nota:** si estropeas una de tus actualizaciones, WA puede desconectarte de todos tus dispositivos y tendrás que volver a iniciar sesión.

## Mensajes que desaparecen

``` ts
const jid = '1234@s.whatsapp.net' // también puede ser un grupo
// activa los mensajes que desaparecen
await sock.sendMessage(
    jid,
     // Esto es 1 semana en segundos: cuánto tiempo desea que aparezcan los mensajes
     { disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL }
)
// se enviará como un mensaje que desaparece
await sock.sendMessage(jid, { text: 'hola' }, { ephemeralExpiration: WA_DEFAULT_EPHEMERAL })
// desactivar los mensajes que desaparecen
await sock.sendMessage(
    jid, 
    { disappearingMessagesInChat: false }
)

```

## Varios

- Para verificar si una identificación dada está en WhatsApp
     ``` ts
     const id = '123456'
     const [result] = esperar calcetín.onWhatsApp(id)
     if (result.exists) console.log (`${id} existe en WhatsApp, como jid: ${result.jid}`)
     ```
- Para consultar el historial de chat en un grupo o con alguien
     TODO, si es posible
- Para obtener el estado de alguna persona
     ``` ts
     const status = await sock.fetchStatus("xyz@s.whatsapp.net")
    console.log("status: " + status)
     ```
- Para cambiar el estado de su perfil
     ``` ts
     const status = '¡Hola mundo!'
     await sock.updateProfileStatus(status)
     ```
- Para cambiar su nombre de perfil
     ``` ts
     const name = 'My name'
    await sock.updateProfileName(name)
     ```
- Para obtener la imagen de visualización de alguna persona/grupo
     ``` ts
     // para imagen de baja resolución
     const ppUrl = await sock.profilePictureUrl("xyz@g.us")
    console.log("download profile picture from: " + ppUrl)
     // para imagen de alta resolución
     const ppUrl = await sock.profilePictureUrl("xyz@g.us", 'image')
     ```
- Para cambiar su imagen de visualización o la de un grupo
     ``` ts
     const jid = '111234567890-1594482450@g.us' // también puede ser tuyo
     await sock.updateProfilePicture(jid, { url: './nueva-imagen-de-perfil.jpeg' })
     ```
- Para obtener la presencia de alguien (si está escribiendo o en línea)
     ``` ts
     // la actualización de presencia se busca y llama aquí
     sock.ev.on('presence-update', json => console.log(json))
     // solicitar actualizaciones para un chat
     await sock.presenceSubscribe("xyz@s.whatsapp.net")
     ```
- Para bloquear o desbloquear usuario
     ``` ts
     await sock.updateBlockStatus("xyz@s.whatsapp.net", "block") // Bloquear usuario
     await sock.updateBlockStatus("xyz@s.whatsapp.net", "unblock") // Desbloquear usuario
     ```
- Para obtener un perfil comercial, como descripción o categoría
     ```ts
     const profile = await sock.getBusinessProfile("xyz@s.whatsapp.net")
    console.log("business description: " + profile.description + ", category: " + profile.category)
     ```
Por supuesto, reemplace ``` xyz ``` con una ID real.

## Grupos
- Para crear un grupo
     ``` ts
     // título y participantes
     const group = await sock.groupCreate("Mi grupo fabuloso", ["1234@s.whatsapp.net", "4564@s.whatsapp.net"])
     console.log ("grupo creado con id: " + group.gid)
     sock.sendMessage(group.id, { text: 'hola' }) // saluda a todos en el grupo
     ```
- Para agregar/eliminar personas a un grupo o degradar/promocionar personas
     ``` ts
     // id y personas para agregar al grupo (arrojará un error si falla)
     const response = await sock.groupParticipantsUpdate(
        "abcd-xyz@g.us", 
        ["abcd@s.whatsapp.net", "efgh@s.whatsapp.net"],
        "add" // replace this parameter with "remove", "demote" or "promote"
     )
     ```
- Para cambiar el tema del grupo
     ``` ts
     await sock.groupUpdateSubject("abcd-xyz@g.us", "¡Nuevo asunto!")
     ```
- Para cambiar la descripción del grupo
     ``` ts
     await sock.groupUpdateDescription("abcd-xyz@g.us", "¡Nueva descripción!")
     ```
- Para cambiar la configuración del grupo
     ``` ts
     // solo permitir que los administradores envíen mensajes
     await sock.groupSettingUpdate("abcd-xyz@g.us", 'announcement')
     // permitir que todos envíen mensajes
     await sock.groupSettingUpdate("abcd-xyz@g.us", 'not_announcement')
     // permitir que todos modifiquen la configuración del grupo, como mostrar la imagen, etc.
     await sock.groupSettingUpdate("abcd-xyz@g.us", 'unlocked')
     // solo permitir que los administradores modifiquen la configuración del grupo
     esperar sock.groupSettingUpdate("abcd-xyz@g.us", 'bloqueado')
     ```
- Para salir de un grupo
     ``` ts
     await sock.groupLeave("abcd-xyz@g.us") // (arrojará un error si falla)
     ```
- Para obtener el código de invitación para un grupo
     ``` ts
     const code = await sock.groupInviteCode("abcd-xyz@g.us")
    console.log("group code: " + code)
     ```
- Para revocar el código de invitación en un grupo
     ```ts
     const code = await sock.groupRevokeInvite("abcd-xyz@g.us")
    console.log("New group code: " + code)
     ```
- Para consultar los metadatos de un grupo
     ``` ts
     const metadata = await sock.groupMetadata("abcd-xyz@g.us") 
    console.log(metadata.id + ", title: " + metadata.subject + ", description: " + metadata.desc)
     ```
- Para unirse al grupo usando el código de invitación
     ``` ts
     const response = await sock.groupAcceptInvite("xxx")
     console.log("unido a: " + response)
     ```
     Por supuesto, reemplaza ``` xxx ``` con el código de invitación.
- Para obtener información del grupo por código de invitación
     ```ts
     const response = await sock.groupGetInviteInfo("xxx")
     console.log("información del grupo: " + response)
     ```
- Para unirse al grupo usando groupInviteMessage
     ``` ts
     const response = await sock.groupAcceptInviteV4("abcd@s.whatsapp.net", groupInviteMessage)
     console.log("unido a: " + response)
     ```
   Por supuesto, reemplaza ``` xxx ``` con el código de invitación.
  
## Listas de difusión e historias

**Nota:** actualmente no se pueden enviar mensajes a listas de difusión desde la versión MD.

- Puede enviar mensajes a listas de difusión de la misma manera que envía mensajes a grupos y chats individuales.
- En este momento, WA Web no admite la creación de listas de transmisión, pero aún puede eliminarlas.
- Los ID de transmisión tienen el formato `12345678@broadcast`
- Para consultar los destinatarios y el nombre de una lista de difusión:
     ``` ts
     const bList = await sock.getBroadcastListInfo("1234@broadcast")
     console.log (`nombre de la lista: ${bList.name}, recps: ${bList.recipients}`)
     ```

## Escritura de funcionalidad personalizada
Baileys está escrito con la funcionalidad personalizada en mente. En lugar de bifurcar el proyecto y reescribir las partes internas, simplemente puede escribir sus propias extensiones.

Primero, habilite el registro de mensajes no manejados de WhatsApp configurando:
``` ts
const sock = makeWASocket({
    logger: P({ level: 'debug' }),
})
```
Esto le permitirá ver todo tipo de mensajes que envía WhatsApp en la consola.

Algunos ejemplos:

1. Funcionalidad para rastrear el porcentaje de batería de su teléfono.
     Habilitas el registro y verás un mensaje emergente sobre tu batería en la consola:
     ```{"level":10,"fromMe":false,"frame":{"tag":"ib","attrs":{"from":"@s.whatsapp.net"},"content":[{"tag":"edge_routing","attrs":{},"content":[{"tag":"routing_info","attrs":{},"content":{"type":"Buffer","data":[8,2,8,5]}}]}]},"msg":"communication"} ```
    
    El "marco" es lo que es el mensaje recibido, tiene tres componentes:
    - `tag` -- de qué se trata este marco (p. ej., el mensaje tendrá "mensaje")
    - `attrs`: un par clave-valor de cadena con algunos metadatos (normalmente contiene el ID del mensaje)
    - `content`: los datos reales (p. ej., un nodo de mensaje tendrá el contenido del mensaje real)
    - lea más sobre este formato [aquí](/src/WABinary/readme.md)

     Puede registrar una devolución de llamada para un evento usando lo siguiente:
     ``` ts
     // para cualquier mensaje con la etiqueta 'edge_routing'
     sock.ws.on(`CB:edge_routing`, (`CB:edge_routing`, (node: BinaryNode) => { })
     // para cualquier mensaje con la etiqueta 'edge_routing' y el atributo id = abcd
     sock.ws.on(`CB:edge_routing,id:abcd`, (node: BinaryNode) => { })
     // para cualquier mensaje con la etiqueta 'edge_routing', atributo de identificación = abcd y primer nodo de contenido routing_info
     sock.ws.on(`CB:edge_routing,id:abcd,routing_info`, (node: BinaryNode) => { })
     ```

### Nota

  Esta biblioteca fue originalmente un proyecto de [@adiwajshing] para **CS-2362 en la Universidad de Ashoka** y de ninguna manera está afiliada a W. Úselo a su propia discreción. No envíe spam a la gente con esto.

  Además, este repositorio ahora tiene licencia GPL 3 ya que usa [libsignal-node](https://git.questbook.io/backend/service-coderunner/-/merge_requests/1)