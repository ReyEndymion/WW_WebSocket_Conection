/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Alias comunes
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Espacio de nombres raíz exportado
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.groupproto = (function() {

    /**
     * Espacio de nombres Groupproto.
     * @exports groupproto
     * @namespace
     */
    var groupproto = {};

    groupproto.SenderKeyMessage = (function() {

        /**
         * Propiedades de un SenderKeyMessage.
         * @memberof groupproto
         * @interface ISenderKeyMessage
         * @property {number|null} [id] SenderKeyMessage id
         * @property {number|null} [iteration] SenderKeyMessage iteration
         * @property {Uint8Array|null} [ciphertext] SenderKeyMessage ciphertext
         */

        /**
         * Construye un nuevo SenderKeyMessage.
         * @memberof groupproto
         * @classdesc Representa un SenderKeyMessage.
         * @implements ISenderKeyMessage
         * @constructor
         * @param {groupproto.ISenderKeyMessage=} [properties] Propiedades para establecer
         */
        function SenderKeyMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderKeyMessage id.
         * @member {number} id
         * @memberof groupproto.SenderKeyMessage
         * @instance
         */
        SenderKeyMessage.prototype.id = 0;

        /**
         * SenderKeyMessage iteration.
         * @member {number} iteration
         * @memberof groupproto.SenderKeyMessage
         * @instance
         */
        SenderKeyMessage.prototype.iteration = 0;

        /**
         * SenderKeyMessage ciphertext.
         * @member {Uint8Array} ciphertext
         * @memberof groupproto.SenderKeyMessage
         * @instance
         */
        SenderKeyMessage.prototype.ciphertext = $util.newBuffer([]);

        /**
         * Crea una nueva instancia de ServKeyMessage utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {groupproto.ISenderKeyMessage=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderKeyMessage} SenderKeyMessage instance
         */
        SenderKeyMessage.create = function create(properties) {
            return new SenderKeyMessage(properties);
        };

        /**
         * Codifica el mensaje especificado SenderKeyMessage. No implícitamente mensajes  {@link groupproto.SenderKeyMessage.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {groupproto.ISenderKeyMessage} message Mensaje de SenderkeyMessage o objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.iteration != null && Object.hasOwnProperty.call(message, "iteration"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.iteration);
            if (message.ciphertext != null && Object.hasOwnProperty.call(message, "ciphertext"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.ciphertext);
            return writer;
        };

        /**
         * Codifica el mensaje SenderKeyMessage especificado, longitud delimitada.No implícitamente mensajes {@link groupproto.SenderKeyMessage.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {groupproto.ISenderKeyMessage} message Mensaje de SenderkeyMessage o objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderKeyMessage del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderKeyMessage} SenderKeyMessage
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderKeyMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.iteration = reader.uint32();
                    break;
                case 3:
                    message.ciphertext = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderKeyMessage del lector o búfer especificado, delimitado por longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderKeyMessage} SenderKeyMessage
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderKeyMessage.
         * @function verify
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderKeyMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                if (!$util.isInteger(message.iteration))
                    return "iteration: integer expected";
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                if (!(message.ciphertext && typeof message.ciphertext.length === "number" || $util.isString(message.ciphertext)))
                    return "ciphertext: buffer expected";
            return null;
        };

        /**
         * Crea un mensaje SenderKeyMessage de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderKeyMessage} SenderKeyMessage
         */
        SenderKeyMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderKeyMessage)
                return object;
            var message = new $root.groupproto.SenderKeyMessage();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.iteration != null)
                message.iteration = object.iteration >>> 0;
            if (object.ciphertext != null)
                if (typeof object.ciphertext === "string")
                    $util.base64.decode(object.ciphertext, message.ciphertext = $util.newBuffer($util.base64.length(object.ciphertext)), 0);
                else if (object.ciphertext.length)
                    message.ciphertext = object.ciphertext;
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderKeyMessage. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderKeyMessage
         * @static
         * @param {groupproto.SenderKeyMessage} message SenderKeyMessage
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderKeyMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = 0;
                object.iteration = 0;
                if (options.bytes === String)
                    object.ciphertext = "";
                else {
                    object.ciphertext = [];
                    if (options.bytes !== Array)
                        object.ciphertext = $util.newBuffer(object.ciphertext);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                object.iteration = message.iteration;
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                object.ciphertext = options.bytes === String ? $util.base64.encode(message.ciphertext, 0, message.ciphertext.length) : options.bytes === Array ? Array.prototype.slice.call(message.ciphertext) : message.ciphertext;
            return object;
        };

        /**
         * Convierte este SenderKeyMessage a JSON.
         * @function toJSON
         * @memberof groupproto.SenderKeyMessage
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderKeyMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderKeyMessage;
    })();

    groupproto.SenderKeyDistributionMessage = (function() {

        /**
         * Propiedades de un SenderKeyDistributionMessage.
         * @memberof groupproto
         * @interface ISenderKeyDistributionMessage
         * @property {number|null} [id] SenderKeyDistributionMessage id
         * @property {number|null} [iteration] SenderKeyDistributionMessage iteration
         * @property {Uint8Array|null} [chainKey] SenderKeyDistributionMessage chainKey
         * @property {Uint8Array|null} [signingKey] SenderKeyDistributionMessage signingKey
         */

        /**
         * Construye un nuevo SenderKeyDistributionMessage.
         * @memberof groupproto
         * @classdesc Representa un SenderKeyDistributionMessage.
         * @implements ISenderKeyDistributionMessage
         * @constructor
         * @param {groupproto.ISenderKeyDistributionMessage=} [properties] Propiedades a configurar
         */
        function SenderKeyDistributionMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderKeyDistributionMessage id.
         * @member {number} id
         * @memberof groupproto.SenderKeyDistributionMessage
         * @instance
         */
        SenderKeyDistributionMessage.prototype.id = 0;

        /**
         * SenderKeyDistributionMessage iteration.
         * @member {number} iteration
         * @memberof groupproto.SenderKeyDistributionMessage
         * @instance
         */
        SenderKeyDistributionMessage.prototype.iteration = 0;

        /**
         * SenderKeyDistributionMessage chainKey.
         * @member {Uint8Array} chainKey
         * @memberof groupproto.SenderKeyDistributionMessage
         * @instance
         */
        SenderKeyDistributionMessage.prototype.chainKey = $util.newBuffer([]);

        /**
         * SenderKeyDistributionMessage signingKey.
         * @member {Uint8Array} signingKey
         * @memberof groupproto.SenderKeyDistributionMessage
         * @instance
         */
        SenderKeyDistributionMessage.prototype.signingKey = $util.newBuffer([]);

        /**
         * Crea una nueva Instancia de SenderKeyDistributionMessage utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {groupproto.ISenderKeyDistributionMessage=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderKeyDistributionMessage} Instancia de SenderKeyDistributionMessage
         */
        SenderKeyDistributionMessage.create = function create(properties) {
            return new SenderKeyDistributionMessage(properties);
        };

        /**
         * Codifica el especificado mensaje SenderKeyDistributionMessage. No implícitamente mensajes {@link groupproto.SenderKeyDistributionMessage.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {groupproto.ISenderKeyDistributionMessage} message mensaje SenderKeyDistributionMessage u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyDistributionMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
            if (message.iteration != null && Object.hasOwnProperty.call(message, "iteration"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.iteration);
            if (message.chainKey != null && Object.hasOwnProperty.call(message, "chainKey"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.chainKey);
            if (message.signingKey != null && Object.hasOwnProperty.call(message, "signingKey"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.signingKey);
            return writer;
        };

        /**
         * Codifica el especificado mensaje SenderKeyDistributionMessage, delimitado por longitud. No implícitamente mensajes {@link groupproto.SenderKeyDistributionMessage.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {groupproto.ISenderKeyDistributionMessage} message mensaje SenderKeyDistributionMessage u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyDistributionMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderKeyDistributionMessage del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderKeyDistributionMessage} SenderKeyDistributionMessage
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyDistributionMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderKeyDistributionMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint32();
                    break;
                case 2:
                    message.iteration = reader.uint32();
                    break;
                case 3:
                    message.chainKey = reader.bytes();
                    break;
                case 4:
                    message.signingKey = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderKeyDistributionMessage del lector o búfer especificado, delimitado por la longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderKeyDistributionMessage} SenderKeyDistributionMessage
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyDistributionMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderKeyDistributionMessage.
         * @function verify
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderKeyDistributionMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id))
                    return "id: integer expected";
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                if (!$util.isInteger(message.iteration))
                    return "iteration: integer expected";
            if (message.chainKey != null && message.hasOwnProperty("chainKey"))
                if (!(message.chainKey && typeof message.chainKey.length === "number" || $util.isString(message.chainKey)))
                    return "chainKey: buffer expected";
            if (message.signingKey != null && message.hasOwnProperty("signingKey"))
                if (!(message.signingKey && typeof message.signingKey.length === "number" || $util.isString(message.signingKey)))
                    return "signingKey: buffer expected";
            return null;
        };

        /**
         * Crea un mensaje SenderKeyDistributionMessage de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderKeyDistributionMessage} SenderKeyDistributionMessage
         */
        SenderKeyDistributionMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderKeyDistributionMessage)
                return object;
            var message = new $root.groupproto.SenderKeyDistributionMessage();
            if (object.id != null)
                message.id = object.id >>> 0;
            if (object.iteration != null)
                message.iteration = object.iteration >>> 0;
            if (object.chainKey != null)
                if (typeof object.chainKey === "string")
                    $util.base64.decode(object.chainKey, message.chainKey = $util.newBuffer($util.base64.length(object.chainKey)), 0);
                else if (object.chainKey.length)
                    message.chainKey = object.chainKey;
            if (object.signingKey != null)
                if (typeof object.signingKey === "string")
                    $util.base64.decode(object.signingKey, message.signingKey = $util.newBuffer($util.base64.length(object.signingKey)), 0);
                else if (object.signingKey.length)
                    message.signingKey = object.signingKey;
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderKeyDistributionMessage. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderKeyDistributionMessage
         * @static
         * @param {groupproto.SenderKeyDistributionMessage} message SenderKeyDistributionMessage
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderKeyDistributionMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = 0;
                object.iteration = 0;
                if (options.bytes === String)
                    object.chainKey = "";
                else {
                    object.chainKey = [];
                    if (options.bytes !== Array)
                        object.chainKey = $util.newBuffer(object.chainKey);
                }
                if (options.bytes === String)
                    object.signingKey = "";
                else {
                    object.signingKey = [];
                    if (options.bytes !== Array)
                        object.signingKey = $util.newBuffer(object.signingKey);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                object.iteration = message.iteration;
            if (message.chainKey != null && message.hasOwnProperty("chainKey"))
                object.chainKey = options.bytes === String ? $util.base64.encode(message.chainKey, 0, message.chainKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.chainKey) : message.chainKey;
            if (message.signingKey != null && message.hasOwnProperty("signingKey"))
                object.signingKey = options.bytes === String ? $util.base64.encode(message.signingKey, 0, message.signingKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.signingKey) : message.signingKey;
            return object;
        };

        /**
         * Convierte este SenderKeyDistributionMessage a JSON.
         * @function toJSON
         * @memberof groupproto.SenderKeyDistributionMessage
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderKeyDistributionMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderKeyDistributionMessage;
    })();

    groupproto.SenderChainKey = (function() {

        /**
         * Propiedades de un SenderChainKey.
         * @memberof groupproto
         * @interface ISenderChainKey
         * @property {number|null} [iteration] SenderChainKey iteration
         * @property {Uint8Array|null} [seed] SenderChainKey seed
         */

        /**
         * Construye un nuevo SenderChainKey.
         * @memberof groupproto
         * @classdesc Representa un SenderChainKey.
         * @implements ISenderChainKey
         * @constructor
         * @param {groupproto.ISenderChainKey=} [properties] Propiedades a configurar
         */
        function SenderChainKey(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderChainKey iteration.
         * @member {number} iteration
         * @memberof groupproto.SenderChainKey
         * @instance
         */
        SenderChainKey.prototype.iteration = 0;

        /**
         * SenderChainKey seed.
         * @member {Uint8Array} seed
         * @memberof groupproto.SenderChainKey
         * @instance
         */
        SenderChainKey.prototype.seed = $util.newBuffer([]);

        /**
         * Crea una nueva SenderChainKey instance utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {groupproto.ISenderChainKey=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderChainKey} SenderChainKey instance
         */
        SenderChainKey.create = function create(properties) {
            return new SenderChainKey(properties);
        };

        /**
         * Codifica el especificado mensaje SenderChainKey. No implícitamente mensajes {@link groupproto.SenderChainKey.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {groupproto.ISenderChainKey} message mensaje SenderChainKey u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderChainKey.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.iteration != null && Object.hasOwnProperty.call(message, "iteration"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.iteration);
            if (message.seed != null && Object.hasOwnProperty.call(message, "seed"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.seed);
            return writer;
        };

        /**
         * Codifica el especificado mensaje SenderChainKey, delimitado por longitud. No implícitamente mensajes {@link groupproto.SenderChainKey.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {groupproto.ISenderChainKey} message mensaje SenderChainKey u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderChainKey.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderChainKey del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderChainKey} SenderChainKey
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderChainKey.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderChainKey();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.iteration = reader.uint32();
                    break;
                case 2:
                    message.seed = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderChainKey del lector o búfer especificado, delimitado por la longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderChainKey} SenderChainKey
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderChainKey.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderChainKey.
         * @function verify
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderChainKey.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                if (!$util.isInteger(message.iteration))
                    return "iteration: integer expected";
            if (message.seed != null && message.hasOwnProperty("seed"))
                if (!(message.seed && typeof message.seed.length === "number" || $util.isString(message.seed)))
                    return "seed: buffer expected";
            return null;
        };

        /**
         * Crea un mensaje SenderChainKey de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderChainKey} SenderChainKey
         */
        SenderChainKey.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderChainKey)
                return object;
            var message = new $root.groupproto.SenderChainKey();
            if (object.iteration != null)
                message.iteration = object.iteration >>> 0;
            if (object.seed != null)
                if (typeof object.seed === "string")
                    $util.base64.decode(object.seed, message.seed = $util.newBuffer($util.base64.length(object.seed)), 0);
                else if (object.seed.length)
                    message.seed = object.seed;
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderChainKey. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderChainKey
         * @static
         * @param {groupproto.SenderChainKey} message SenderChainKey
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderChainKey.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.iteration = 0;
                if (options.bytes === String)
                    object.seed = "";
                else {
                    object.seed = [];
                    if (options.bytes !== Array)
                        object.seed = $util.newBuffer(object.seed);
                }
            }
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                object.iteration = message.iteration;
            if (message.seed != null && message.hasOwnProperty("seed"))
                object.seed = options.bytes === String ? $util.base64.encode(message.seed, 0, message.seed.length) : options.bytes === Array ? Array.prototype.slice.call(message.seed) : message.seed;
            return object;
        };

        /**
         * Convierte este SenderChainKey a JSON.
         * @function toJSON
         * @memberof groupproto.SenderChainKey
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderChainKey.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderChainKey;
    })();

    groupproto.SenderMessageKey = (function() {

        /**
         * Propiedades de un SenderMessageKey.
         * @memberof groupproto
         * @interface ISenderMessageKey
         * @property {number|null} [iteration] SenderMessageKey iteration
         * @property {Uint8Array|null} [seed] SenderMessageKey seed
         */

        /**
         * Construye un nuevo SenderMessageKey.
         * @memberof groupproto
         * @classdesc Representa un SenderMessageKey.
         * @implements ISenderMessageKey
         * @constructor
         * @param {groupproto.ISenderMessageKey=} [properties] Propiedades a configurar
         */
        function SenderMessageKey(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderMessageKey iteration.
         * @member {number} iteration
         * @memberof groupproto.SenderMessageKey
         * @instance
         */
        SenderMessageKey.prototype.iteration = 0;

        /**
         * SenderMessageKey seed.
         * @member {Uint8Array} seed
         * @memberof groupproto.SenderMessageKey
         * @instance
         */
        SenderMessageKey.prototype.seed = $util.newBuffer([]);

        /**
         * Crea una nueva instancia de SenderMessageKey utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {groupproto.ISenderMessageKey=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderMessageKey} instancia de SenderMessageKey
         */
        SenderMessageKey.create = function create(properties) {
            return new SenderMessageKey(properties);
        };

        /**
         * Codifica el especificado mensaje SenderMessageKey. No implícitamente mensajes {@link groupproto.SenderMessageKey.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {groupproto.ISenderMessageKey} message mensaje SenderMessageKey u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderMessageKey.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.iteration != null && Object.hasOwnProperty.call(message, "iteration"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.iteration);
            if (message.seed != null && Object.hasOwnProperty.call(message, "seed"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.seed);
            return writer;
        };

        /**
         * Codifica el especificado mensaje SenderMessageKey, delimitado por longitud. No implícitamente mensajes {@link groupproto.SenderMessageKey.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {groupproto.ISenderMessageKey} message mensaje SenderMessageKey u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderMessageKey.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderMessageKey del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderMessageKey} SenderMessageKey
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderMessageKey.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderMessageKey();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.iteration = reader.uint32();
                    break;
                case 2:
                    message.seed = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderMessageKey del lector o búfer especificado, delimitado por la longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderMessageKey} SenderMessageKey
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderMessageKey.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderMessageKey.
         * @function verify
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderMessageKey.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                if (!$util.isInteger(message.iteration))
                    return "iteration: integer expected";
            if (message.seed != null && message.hasOwnProperty("seed"))
                if (!(message.seed && typeof message.seed.length === "number" || $util.isString(message.seed)))
                    return "seed: buffer expected";
            return null;
        };

        /**
         * Crea un mensaje SenderMessageKey de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderMessageKey} SenderMessageKey
         */
        SenderMessageKey.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderMessageKey)
                return object;
            var message = new $root.groupproto.SenderMessageKey();
            if (object.iteration != null)
                message.iteration = object.iteration >>> 0;
            if (object.seed != null)
                if (typeof object.seed === "string")
                    $util.base64.decode(object.seed, message.seed = $util.newBuffer($util.base64.length(object.seed)), 0);
                else if (object.seed.length)
                    message.seed = object.seed;
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderMessageKey. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderMessageKey
         * @static
         * @param {groupproto.SenderMessageKey} message SenderMessageKey
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderMessageKey.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.iteration = 0;
                if (options.bytes === String)
                    object.seed = "";
                else {
                    object.seed = [];
                    if (options.bytes !== Array)
                        object.seed = $util.newBuffer(object.seed);
                }
            }
            if (message.iteration != null && message.hasOwnProperty("iteration"))
                object.iteration = message.iteration;
            if (message.seed != null && message.hasOwnProperty("seed"))
                object.seed = options.bytes === String ? $util.base64.encode(message.seed, 0, message.seed.length) : options.bytes === Array ? Array.prototype.slice.call(message.seed) : message.seed;
            return object;
        };

        /**
         * Convierte este SenderMessageKey a JSON.
         * @function toJSON
         * @memberof groupproto.SenderMessageKey
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderMessageKey.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderMessageKey;
    })();

    groupproto.SenderSigningKey = (function() {

        /**
         * Propiedades de un SenderSigningKey.
         * @memberof groupproto
         * @interface ISenderSigningKey
         * @property {Uint8Array|null} ["public"] SenderSigningKey public
         * @property {Uint8Array|null} ["private"] SenderSigningKey private
         */

        /**
         * Construye un nuevo SenderSigningKey.
         * @memberof groupproto
         * @classdesc Representa un SenderSigningKey.
         * @implements ISenderSigningKey
         * @constructor
         * @param {groupproto.ISenderSigningKey=} [properties] Propiedades a configurar
         */
        function SenderSigningKey(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderSigningKey public.
         * @member {Uint8Array} public
         * @memberof groupproto.SenderSigningKey
         * @instance
         */
        SenderSigningKey.prototype["public"] = $util.newBuffer([]);

        /**
         * SenderSigningKey private.
         * @member {Uint8Array} private
         * @memberof groupproto.SenderSigningKey
         * @instance
         */
        SenderSigningKey.prototype["private"] = $util.newBuffer([]);

        /**
         * Crea una nueva SenderSigningKey instance utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {groupproto.ISenderSigningKey=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderSigningKey} SenderSigningKey instance
         */
        SenderSigningKey.create = function create(properties) {
            return new SenderSigningKey(properties);
        };

        /**
         * Codifica el especificado mensaje SenderSigningKey. No implícitamente mensajes {@link groupproto.SenderSigningKey.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {groupproto.ISenderSigningKey} message mensaje SenderSigningKey u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderSigningKey.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message["public"] != null && Object.hasOwnProperty.call(message, "public"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message["public"]);
            if (message["private"] != null && Object.hasOwnProperty.call(message, "private"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message["private"]);
            return writer;
        };

        /**
         * Codifica el especificado mensaje SenderSigningKey, delimitado por longitud. No implícitamente mensajes {@link groupproto.SenderSigningKey.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {groupproto.ISenderSigningKey} message mensaje SenderSigningKey u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderSigningKey.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderSigningKey del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderSigningKey} SenderSigningKey
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderSigningKey.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderSigningKey();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message["public"] = reader.bytes();
                    break;
                case 2:
                    message["private"] = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderSigningKey del lector o búfer especificado, delimitado por la longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderSigningKey} SenderSigningKey
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderSigningKey.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderSigningKey.
         * @function verify
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderSigningKey.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message["public"] != null && message.hasOwnProperty("public"))
                if (!(message["public"] && typeof message["public"].length === "number" || $util.isString(message["public"])))
                    return "public: buffer expected";
            if (message["private"] != null && message.hasOwnProperty("private"))
                if (!(message["private"] && typeof message["private"].length === "number" || $util.isString(message["private"])))
                    return "private: buffer expected";
            return null;
        };

        /**
         * Crea un mensaje SenderSigningKey de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderSigningKey} SenderSigningKey
         */
        SenderSigningKey.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderSigningKey)
                return object;
            var message = new $root.groupproto.SenderSigningKey();
            if (object["public"] != null)
                if (typeof object["public"] === "string")
                    $util.base64.decode(object["public"], message["public"] = $util.newBuffer($util.base64.length(object["public"])), 0);
                else if (object["public"].length)
                    message["public"] = object["public"];
            if (object["private"] != null)
                if (typeof object["private"] === "string")
                    $util.base64.decode(object["private"], message["private"] = $util.newBuffer($util.base64.length(object["private"])), 0);
                else if (object["private"].length)
                    message["private"] = object["private"];
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderSigningKey. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderSigningKey
         * @static
         * @param {groupproto.SenderSigningKey} message SenderSigningKey
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderSigningKey.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object["public"] = "";
                else {
                    object["public"] = [];
                    if (options.bytes !== Array)
                        object["public"] = $util.newBuffer(object["public"]);
                }
                if (options.bytes === String)
                    object["private"] = "";
                else {
                    object["private"] = [];
                    if (options.bytes !== Array)
                        object["private"] = $util.newBuffer(object["private"]);
                }
            }
            if (message["public"] != null && message.hasOwnProperty("public"))
                object["public"] = options.bytes === String ? $util.base64.encode(message["public"], 0, message["public"].length) : options.bytes === Array ? Array.prototype.slice.call(message["public"]) : message["public"];
            if (message["private"] != null && message.hasOwnProperty("private"))
                object["private"] = options.bytes === String ? $util.base64.encode(message["private"], 0, message["private"].length) : options.bytes === Array ? Array.prototype.slice.call(message["private"]) : message["private"];
            return object;
        };

        /**
         * Convierte este SenderSigningKey a JSON.
         * @function toJSON
         * @memberof groupproto.SenderSigningKey
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderSigningKey.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderSigningKey;
    })();

    groupproto.SenderKeyStateStructure = (function() {

        /**
         * Propiedades de un SenderKeyStateStructure.
         * @memberof groupproto
         * @interface ISenderKeyStateStructure
         * @property {number|null} [senderKeyId] SenderKeyStateStructure senderKeyId
         * @property {groupproto.ISenderChainKey|null} [senderChainKey] SenderKeyStateStructure senderChainKey
         * @property {groupproto.ISenderSigningKey|null} [senderSigningKey] SenderKeyStateStructure senderSigningKey
         * @property {Array.<groupproto.ISenderMessageKey>|null} [senderMessageKeys] SenderKeyStateStructure senderMessageKeys
         */

        /**
         * Construye un nuevo SenderKeyStateStructure.
         * @memberof groupproto
         * @classdesc Representa un SenderKeyStateStructure.
         * @implements ISenderKeyStateStructure
         * @constructor
         * @param {groupproto.ISenderKeyStateStructure=} [properties] Propiedades a configurar
         */
        function SenderKeyStateStructure(properties) {
            this.senderMessageKeys = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderKeyStateStructure senderKeyId.
         * @member {number} senderKeyId
         * @memberof groupproto.SenderKeyStateStructure
         * @instance
         */
        SenderKeyStateStructure.prototype.senderKeyId = 0;

        /**
         * SenderKeyStateStructure senderChainKey.
         * @member {groupproto.ISenderChainKey|null|undefined} senderChainKey
         * @memberof groupproto.SenderKeyStateStructure
         * @instance
         */
        SenderKeyStateStructure.prototype.senderChainKey = null;

        /**
         * SenderKeyStateStructure senderSigningKey.
         * @member {groupproto.ISenderSigningKey|null|undefined} senderSigningKey
         * @memberof groupproto.SenderKeyStateStructure
         * @instance
         */
        SenderKeyStateStructure.prototype.senderSigningKey = null;

        /**
         * SenderKeyStateStructure senderMessageKeys.
         * @member {Array.<groupproto.ISenderMessageKey>} senderMessageKeys
         * @memberof groupproto.SenderKeyStateStructure
         * @instance
         */
        SenderKeyStateStructure.prototype.senderMessageKeys = $util.emptyArray;

        /**
         * Crea una nueva SenderKeyStateStructure instance utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {groupproto.ISenderKeyStateStructure=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderKeyStateStructure} SenderKeyStateStructure instance
         */
        SenderKeyStateStructure.create = function create(properties) {
            return new SenderKeyStateStructure(properties);
        };

        /**
         * Codifica el especificado mensaje SenderKeyStateStructure. No implícitamente mensajes {@link groupproto.SenderKeyStateStructure.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {groupproto.ISenderKeyStateStructure} message mensaje SenderKeyStateStructure u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyStateStructure.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.senderKeyId != null && Object.hasOwnProperty.call(message, "senderKeyId"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.senderKeyId);
            if (message.senderChainKey != null && Object.hasOwnProperty.call(message, "senderChainKey"))
                $root.groupproto.SenderChainKey.encode(message.senderChainKey, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.senderSigningKey != null && Object.hasOwnProperty.call(message, "senderSigningKey"))
                $root.groupproto.SenderSigningKey.encode(message.senderSigningKey, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.senderMessageKeys != null && message.senderMessageKeys.length)
                for (var i = 0; i < message.senderMessageKeys.length; ++i)
                    $root.groupproto.SenderMessageKey.encode(message.senderMessageKeys[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Codifica el especificado mensaje SenderKeyStateStructure, delimitado por longitud. No implícitamente mensajes {@link groupproto.SenderKeyStateStructure.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {groupproto.ISenderKeyStateStructure} message mensaje SenderKeyStateStructure u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyStateStructure.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderKeyStateStructure del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderKeyStateStructure} SenderKeyStateStructure
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyStateStructure.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderKeyStateStructure();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.senderKeyId = reader.uint32();
                    break;
                case 2:
                    message.senderChainKey = $root.groupproto.SenderChainKey.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.senderSigningKey = $root.groupproto.SenderSigningKey.decode(reader, reader.uint32());
                    break;
                case 4:
                    if (!(message.senderMessageKeys && message.senderMessageKeys.length))
                        message.senderMessageKeys = [];
                    message.senderMessageKeys.push($root.groupproto.SenderMessageKey.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderKeyStateStructure del lector o búfer especificado, delimitado por la longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderKeyStateStructure} SenderKeyStateStructure
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyStateStructure.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderKeyStateStructure.
         * @function verify
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderKeyStateStructure.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.senderKeyId != null && message.hasOwnProperty("senderKeyId"))
                if (!$util.isInteger(message.senderKeyId))
                    return "senderKeyId: integer expected";
            if (message.senderChainKey != null && message.hasOwnProperty("senderChainKey")) {
                var error = $root.groupproto.SenderChainKey.verify(message.senderChainKey);
                if (error)
                    return "senderChainKey." + error;
            }
            if (message.senderSigningKey != null && message.hasOwnProperty("senderSigningKey")) {
                var error = $root.groupproto.SenderSigningKey.verify(message.senderSigningKey);
                if (error)
                    return "senderSigningKey." + error;
            }
            if (message.senderMessageKeys != null && message.hasOwnProperty("senderMessageKeys")) {
                if (!Array.isArray(message.senderMessageKeys))
                    return "senderMessageKeys: array expected";
                for (var i = 0; i < message.senderMessageKeys.length; ++i) {
                    var error = $root.groupproto.SenderMessageKey.verify(message.senderMessageKeys[i]);
                    if (error)
                        return "senderMessageKeys." + error;
                }
            }
            return null;
        };

        /**
         * Crea un mensaje SenderKeyStateStructure de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderKeyStateStructure} SenderKeyStateStructure
         */
        SenderKeyStateStructure.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderKeyStateStructure)
                return object;
            var message = new $root.groupproto.SenderKeyStateStructure();
            if (object.senderKeyId != null)
                message.senderKeyId = object.senderKeyId >>> 0;
            if (object.senderChainKey != null) {
                if (typeof object.senderChainKey !== "object")
                    throw TypeError(".groupproto.SenderKeyStateStructure.senderChainKey: object expected");
                message.senderChainKey = $root.groupproto.SenderChainKey.fromObject(object.senderChainKey);
            }
            if (object.senderSigningKey != null) {
                if (typeof object.senderSigningKey !== "object")
                    throw TypeError(".groupproto.SenderKeyStateStructure.senderSigningKey: object expected");
                message.senderSigningKey = $root.groupproto.SenderSigningKey.fromObject(object.senderSigningKey);
            }
            if (object.senderMessageKeys) {
                if (!Array.isArray(object.senderMessageKeys))
                    throw TypeError(".groupproto.SenderKeyStateStructure.senderMessageKeys: array expected");
                message.senderMessageKeys = [];
                for (var i = 0; i < object.senderMessageKeys.length; ++i) {
                    if (typeof object.senderMessageKeys[i] !== "object")
                        throw TypeError(".groupproto.SenderKeyStateStructure.senderMessageKeys: object expected");
                    message.senderMessageKeys[i] = $root.groupproto.SenderMessageKey.fromObject(object.senderMessageKeys[i]);
                }
            }
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderKeyStateStructure. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderKeyStateStructure
         * @static
         * @param {groupproto.SenderKeyStateStructure} message SenderKeyStateStructure
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderKeyStateStructure.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.senderMessageKeys = [];
            if (options.defaults) {
                object.senderKeyId = 0;
                object.senderChainKey = null;
                object.senderSigningKey = null;
            }
            if (message.senderKeyId != null && message.hasOwnProperty("senderKeyId"))
                object.senderKeyId = message.senderKeyId;
            if (message.senderChainKey != null && message.hasOwnProperty("senderChainKey"))
                object.senderChainKey = $root.groupproto.SenderChainKey.toObject(message.senderChainKey, options);
            if (message.senderSigningKey != null && message.hasOwnProperty("senderSigningKey"))
                object.senderSigningKey = $root.groupproto.SenderSigningKey.toObject(message.senderSigningKey, options);
            if (message.senderMessageKeys && message.senderMessageKeys.length) {
                object.senderMessageKeys = [];
                for (var j = 0; j < message.senderMessageKeys.length; ++j)
                    object.senderMessageKeys[j] = $root.groupproto.SenderMessageKey.toObject(message.senderMessageKeys[j], options);
            }
            return object;
        };

        /**
         * Convierte este SenderKeyStateStructure a JSON.
         * @function toJSON
         * @memberof groupproto.SenderKeyStateStructure
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderKeyStateStructure.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderKeyStateStructure;
    })();

    groupproto.SenderKeyRecordStructure = (function() {

        /**
         * Propiedades de un SenderKeyRecordStructure.
         * @memberof groupproto
         * @interface ISenderKeyRecordStructure
         * @property {Array.<groupproto.ISenderKeyStateStructure>|null} [senderKeyStates] SenderKeyRecordStructure senderKeyStates
         */

        /**
         * Construye un nuevo SenderKeyRecordStructure.
         * @memberof groupproto
         * @classdesc Representa un SenderKeyRecordStructure.
         * @implements ISenderKeyRecordStructure
         * @constructor
         * @param {groupproto.ISenderKeyRecordStructure=} [properties] Propiedades a configurar
         */
        function SenderKeyRecordStructure(properties) {
            this.senderKeyStates = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SenderKeyRecordStructure senderKeyStates.
         * @member {Array.<groupproto.ISenderKeyStateStructure>} senderKeyStates
         * @memberof groupproto.SenderKeyRecordStructure
         * @instance
         */
        SenderKeyRecordStructure.prototype.senderKeyStates = $util.emptyArray;

        /**
         * Crea una nueva instancia de SenderKeyRecordStructure utilizando las propiedades especificadas.
         * @function create
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {groupproto.ISenderKeyRecordStructure=} [properties] Propiedades a configurar
         * @returns {groupproto.SenderKeyRecordStructure} instancia de SenderKeyRecordStructure
         */
        SenderKeyRecordStructure.create = function create(properties) {
            return new SenderKeyRecordStructure(properties);
        };

        /**
         * Codifica el especificado mensaje SenderKeyRecordStructure. No implícitamente mensajes {@link groupproto.SenderKeyRecordStructure.verify|verify}.
         * @function encode
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {groupproto.ISenderKeyRecordStructure} message mensaje SenderKeyRecordStructure u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyRecordStructure.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.senderKeyStates != null && message.senderKeyStates.length)
                for (var i = 0; i < message.senderKeyStates.length; ++i)
                    $root.groupproto.SenderKeyStateStructure.encode(message.senderKeyStates[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Codifica el especificado mensaje SenderKeyRecordStructure, delimitado por longitud. No implícitamente mensajes {@link groupproto.SenderKeyRecordStructure.verify|verify}.
         * @function encodeDelimited
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {groupproto.ISenderKeyRecordStructure} message mensaje SenderKeyRecordStructure u objeto simple para codificar
         * @param {$protobuf.Writer} [writer] Writer para codificar
         * @returns {$protobuf.Writer} Writer
         */
        SenderKeyRecordStructure.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodifica un mensaje SenderKeyRecordStructure del lector o búfer especificado.
         * @function decode
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @param {number} [length] Longitud del mensaje si se conoce de antemano
         * @returns {groupproto.SenderKeyRecordStructure} SenderKeyRecordStructure
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyRecordStructure.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.groupproto.SenderKeyRecordStructure();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.senderKeyStates && message.senderKeyStates.length))
                        message.senderKeyStates = [];
                    message.senderKeyStates.push($root.groupproto.SenderKeyStateStructure.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodifica un mensaje SenderKeyRecordStructure del lector o búfer especificado, delimitado por la longitud.
         * @function decodeDelimited
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader o  buffer para decodificar desde
         * @returns {groupproto.SenderKeyRecordStructure} SenderKeyRecordStructure
         * @throws {Error} Si la carga útil no es un lector o un búfer válido
         * @throws {$protobuf.util.ProtocolError} Si faltan campos requeridos
         */
        SenderKeyRecordStructure.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifica un mensaje SenderKeyRecordStructure.
         * @function verify
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {Object.<string,*>} message Objeto simple para verificar
         * @returns {string|null} `null` si es válido, de lo contrario, la razón por la que no lo es
         */
        SenderKeyRecordStructure.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.senderKeyStates != null && message.hasOwnProperty("senderKeyStates")) {
                if (!Array.isArray(message.senderKeyStates))
                    return "senderKeyStates: array expected";
                for (var i = 0; i < message.senderKeyStates.length; ++i) {
                    var error = $root.groupproto.SenderKeyStateStructure.verify(message.senderKeyStates[i]);
                    if (error)
                        return "senderKeyStates." + error;
                }
            }
            return null;
        };

        /**
         * Crea un mensaje SenderKeyRecordStructure de un objeto simple. También convierte valores a sus respectivos tipos internos.
         * @function fromObject
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {Object.<string,*>} object objeto simple
         * @returns {groupproto.SenderKeyRecordStructure} SenderKeyRecordStructure
         */
        SenderKeyRecordStructure.fromObject = function fromObject(object) {
            if (object instanceof $root.groupproto.SenderKeyRecordStructure)
                return object;
            var message = new $root.groupproto.SenderKeyRecordStructure();
            if (object.senderKeyStates) {
                if (!Array.isArray(object.senderKeyStates))
                    throw TypeError(".groupproto.SenderKeyRecordStructure.senderKeyStates: array expected");
                message.senderKeyStates = [];
                for (var i = 0; i < object.senderKeyStates.length; ++i) {
                    if (typeof object.senderKeyStates[i] !== "object")
                        throw TypeError(".groupproto.SenderKeyRecordStructure.senderKeyStates: object expected");
                    message.senderKeyStates[i] = $root.groupproto.SenderKeyStateStructure.fromObject(object.senderKeyStates[i]);
                }
            }
            return message;
        };

        /**
         * Crea un objeto simple a partir de un mensaje SenderKeyRecordStructure. También convierte valores a otros tipos si se especifica.
         * @function toObject
         * @memberof groupproto.SenderKeyRecordStructure
         * @static
         * @param {groupproto.SenderKeyRecordStructure} message SenderKeyRecordStructure
         * @param {$protobuf.IConversionOptions} [options] Opciones de conversión
         * @returns {Object.<string,*>} objeto simple
         */
        SenderKeyRecordStructure.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.senderKeyStates = [];
            if (message.senderKeyStates && message.senderKeyStates.length) {
                object.senderKeyStates = [];
                for (var j = 0; j < message.senderKeyStates.length; ++j)
                    object.senderKeyStates[j] = $root.groupproto.SenderKeyStateStructure.toObject(message.senderKeyStates[j], options);
            }
            return object;
        };

        /**
         * Convierte este SenderKeyRecordStructure a JSON.
         * @function toJSON
         * @memberof groupproto.SenderKeyRecordStructure
         * @instance
         * @returns {Object.<string,*>} objeto JSON
         */
        SenderKeyRecordStructure.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SenderKeyRecordStructure;
    })();

    return groupproto;
})();

module.exports = $root;
