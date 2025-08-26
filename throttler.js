export class ApiThrottler {
	constructor(limit = 100, windowMs = 10000) {
		this.limit = limit
		this.windowMs = windowMs
		this.timestamps = []
		this.queue = []
		this.processing = false
		this.totalRequests = 0
	}

	// pushes function and args onto queue
	async call(fn, ...args) {
		return new Promise((resolve, reject) => {
			this.queue.push({ fn, args, resolve, reject })
			this._processQueue()
		})
	}

	async _processQueue() {
		if (this.processing) return
		this.processing = true

		while (this.queue.length > 0) {
			const now = Date.now()

			// remove timestamps older than limit time (10_000ms)
			this.timestamps = this.timestamps.filter(
				(ts) => now - ts < this.windowMs
			)

			if (this.timestamps.length >= this.limit) {
				// wait until the oldest timestamp expires
				const waitTime = this.windowMs - (now - this.timestamps[0])
				console.log(`approaching api limit, waiting for ${waitTime}ms`)
				await new Promise((res) => setTimeout(res, waitTime))
				continue
			}

			// safe to run next request
			const { fn, args, resolve, reject } = this.queue.shift()
			this.timestamps.push(Date.now())
			this.totalRequests++

			try {
				const result = await fn(...args)
				resolve(result)
			} catch (err) {
				reject(err)
			}
		}

		this.processing = false
	}
}

async function testApiThrottler() {
	async function fakeApiCall(id) {
		return `result ${id}`
	}

	const throttler = new ApiThrottler(100, 10000)

	for (let i = 1; i <= 250; i++) {
		const res = await throttler.call(fakeApiCall, i)
	}

	console.log(`total requests: ${throttler.totalRequests}`)
	console.log('test passed')
}
