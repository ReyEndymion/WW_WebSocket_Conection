import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto'
import HKDF from 'futoin-hkdf'
import * as libsignal from 'libsignal'
import { KEY_BUNDLE_TYPE } from '../Defaults'
import { KeyPair } from '../Types'

/** Byte de versión de prefijo para las teclas de pub, requeridas para algunas funciones de criptográfico de curva */
export const generateSignalPubKey = (pubKey: Uint8Array | Buffer) => (
	pubKey.length === 33
		? pubKey
		: Buffer.concat([ KEY_BUNDLE_TYPE, pubKey ])
)

export const Curve = {
	generateKeyPair: (): KeyPair => {
		const { pubKey, privKey } = libsignal.curve.generateKeyPair()
		return {
			private: Buffer.from(privKey),
			// eliminar la versión byte
			public: Buffer.from((pubKey as Uint8Array).slice(1))
		}
	},
	sharedKey: (privateKey: Uint8Array, publicKey: Uint8Array) => {
		const shared = libsignal.curve.calculateAgreement(generateSignalPubKey(publicKey), privateKey)
		return Buffer.from(shared)
	},
	sign: (privateKey: Uint8Array, buf: Uint8Array) => (
		libsignal.curve.calculateSignature(privateKey, buf)
	),
	verify: (pubKey: Uint8Array, message: Uint8Array, signature: Uint8Array) => {
		try {
			libsignal.curve.verifySignature(generateSignalPubKey(pubKey), message, signature)
			return true
		} catch(error) {
			return false
		}
	}
}

export const signedKeyPair = (identityKeyPair: KeyPair, keyId: number) => {
	const preKey = Curve.generateKeyPair()
	const pubKey = generateSignalPubKey(preKey.public)

	const signature = Curve.sign(identityKeyPair.private, pubKey)

	return { keyPair: preKey, signature, keyId }
}

const GCM_TAG_LENGTH = 128 >> 3

/**
 * encriptar AES 256 GCM;
 * Donde la etiqueta se sufre en el texto cifrado
 * */
export function aesEncryptGCM(plaintext: Uint8Array, key: Uint8Array, iv: Uint8Array, additionalData: Uint8Array) {
	const cipher = createCipheriv('aes-256-gcm', key, iv)
	cipher.setAAD(additionalData)
	return Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()])
}

/**
 * descifrar AES 256 GCM;
 * Donde la etiqueta de autenticación se sufre al texto cifrado
 * */
export function aesDecryptGCM(ciphertext: Uint8Array, key: Uint8Array, iv: Uint8Array, additionalData: Uint8Array) {
	const decipher = createDecipheriv('aes-256-gcm', key, iv)
	// descifrar adata adicional
	const enc = ciphertext.slice(0, ciphertext.length - GCM_TAG_LENGTH)
	const tag = ciphertext.slice(ciphertext.length - GCM_TAG_LENGTH)
	// Establecer datos adicionales
	decipher.setAAD(additionalData)
	decipher.setAuthTag(tag)

	return Buffer.concat([ decipher.update(enc), decipher.final() ])
}

/** descifrar AES 256 CBC; donde el IV tiene prefijo al búfer */
export function aesDecrypt(buffer: Buffer, key: Buffer) {
	return aesDecryptWithIV(buffer.slice(16, buffer.length), key, buffer.slice(0, 16))
}

/** descifrar AES 256 CBC */
export function aesDecryptWithIV(buffer: Buffer, key: Buffer, IV: Buffer) {
	const aes = createDecipheriv('aes-256-cbc', key, IV)
	return Buffer.concat([aes.update(buffer), aes.final()])
}

// encriptar AES 256 CBC; donde un IV aleatorio se prefijas al búfer
export function aesEncrypt(buffer: Buffer | Uint8Array, key: Buffer) {
	const IV = randomBytes(16)
	const aes = createCipheriv('aes-256-cbc', key, IV)
	return Buffer.concat([IV, aes.update(buffer), aes.final()]) // prefix IV to the buffer
}

// encriptar AES 256 CBC con un IV dado
export function aesEncrypWithIV(buffer: Buffer, key: Buffer, IV: Buffer) {
	const aes = createCipheriv('aes-256-cbc', key, IV)
	return Buffer.concat([aes.update(buffer), aes.final()]) // prefijo IV al búfer
}

// firmar HMAC usando SHA 256
export function hmacSign(buffer: Buffer | Uint8Array, key: Buffer | Uint8Array, variant: 'sha256' | 'sha512' = 'sha256') {
	return createHmac(variant, key).update(buffer).digest()
}

export function sha256(buffer: Buffer) {
	return createHash('sha256').update(buffer).digest()
}

// HKDF expansión clave
export function hkdf(buffer: Uint8Array | Buffer, expandedLength: number, info: { salt?: Buffer, info?: string }) {
	return HKDF(!Buffer.isBuffer(buffer) ? Buffer.from(buffer) : buffer, expandedLength, info)
}