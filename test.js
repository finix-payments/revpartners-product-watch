import express from 'express'
const PORT = 3100

// productEventHandler is the main exported function
// to be used in lambda;
// lambda simulated here with express for local testing
import { productEventHandler } from './index.js'

const app = express()
app.use(express.json())

app.post('/', async (req, res) => {
	// console.log("Webhook received: ", req.body);
	console.log('Webhook received')

	let code = 500
	try {
		const { statusCode } = await productEventHandler({
			body: JSON.stringify(req.body),
		})
		code = statusCode
	} catch (e) {
		console.log(e)
	}

	res.sendStatus(code)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
