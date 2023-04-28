import EventEmitter from 'events'
import { createReadStream } from 'fs'
import { writeFile } from 'fs/promises'
import { createInterface } from 'readline'
import type { BaileysEventEmitter } from '../Types'
import { delay } from './generics'
import { makeMutex } from './make-mutex'

/**
 * Captura eventos de un emisor de eventos de Baileys y los almacena en un archivo
 * @param ev El emisor del evento para leer eventos de
 * @param filename Archivo para guardar
 */
export const captureEventStream = (ev: BaileysEventEmitter, filename: string) => {
	const oldEmit = ev.emit
	// Escribir mutex para que los datos se adhieran en orden
	const writeMutex = makeMutex()
	// Monkey Patch EventEmister para capturar todos los eventos
	ev.emit = function(...args: any[]) {
		const content = JSON.stringify({ timestamp: Date.now(), event: args[0], data: args[1] }) + '\n'
		const result = oldEmit.apply(ev, args)

		writeMutex.mutex(
			async() => {
				await writeFile(filename, content, { flag: 'a' })
			}
		)

		return result
	}
}

/**
 * Lea el archivo de eventos y los eventos de emitir desde allí
 * @param filename nombre de archivo que contiene datos de eventos
 * @param delayIntervalMs Retraso entre cada emit de eventos
 */
export const readAndEmitEventStream = (filename: string, delayIntervalMs: number = 0) => {
	const ev = new EventEmitter() as BaileysEventEmitter

	const fireEvents = async() => {
		// from: https://stackoverflow.com/questions/6156501/read-a-file-one-line-at-a-time-in-node-js
		const fileStream = createReadStream(filename)

		const rl = createInterface({
			input: fileStream,
			crlfDelay: Infinity
		})
		// Nota: Usamos la opción CRLFDELAY para reconocer todas las instancias de CR LF
		// ('\r\n') in input.txt as a single line break.
		for await (const line of rl) {
			if(line) {
				const { event, data } = JSON.parse(line)
				ev.emit(event, data)
				delayIntervalMs && await delay(delayIntervalMs)
			}
		}

		fileStream.close()
	}

	return {
		ev,
		task: fireEvents()
	}
}