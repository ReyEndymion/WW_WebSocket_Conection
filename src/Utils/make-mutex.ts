export const makeMutex = () => {
	let task = Promise.resolve() as Promise<any>

	let taskTimeout: NodeJS.Timeout | undefined

	return {
		mutex<T>(code: () => Promise<T> | T): Promise<T> {
			task = (async() => {
				// Espere a que complete la tarea anterior
// Si hay un error, nos tragamos para no bloquear la cola
				try {
					await task
				} catch{ }

				try {
					// Ejecutar la tarea actual
					const result = await code()
					return result
				} finally {
					clearTimeout(taskTimeout)
				}
			})()
			// Reemplazamos la tarea existente, agregando la nueva obra de ejecución.
// Entonces, la próxima tarea tendrá que esperar a que termine esta
			return task
		},
	}
}

export type Mutex = ReturnType<typeof makeMutex>

export const makeKeyedMutex = () => {
	const map: { [id: string]: Mutex } = {}

	return {
		mutex<T>(key: string, task: () => Promise<T> | T): Promise<T> {
			if(!map[key]) {
				map[key] = makeMutex()
			}

			return map[key].mutex(task)
		}
	}
}