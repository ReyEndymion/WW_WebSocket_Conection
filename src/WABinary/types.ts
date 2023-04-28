import * as constants from './constants'
/**
 * El nodo binario WA usa internamente para la comunicación
 *
 * Esto se manipula Soley como un objeto y no tiene ninguna función.
 * Esto se hace para una fácil serialización, para evitar que se encuentren con problemas con los prototipos y
 * Para mantener la estructura de código funcional
 * */
export type BinaryNode = {
    tag: string
    attrs: { [key: string]: string }
	content?: BinaryNode[] | string | Uint8Array
}
export type BinaryNodeAttributes = BinaryNode['attrs']
export type BinaryNodeData = BinaryNode['content']

export type BinaryNodeCodingOptions = typeof constants