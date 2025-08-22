import 'dotenv/config'
const API_TOKEN = process.env.API_TOKEN

/** @type {Config} */
const Config = {
	API_TOKEN,
	PAGE_SIZE: 100,
	HUBSPOT_BASE_URL: 'https://api.hubapi.com',
	HEADERS: {
		Authorization: `Bearer ${API_TOKEN}`,
		'Content-Type': 'application/json',
	},
}

/**
 * @typedef {Object} Config
 * @property {string} API_TOKEN
 * @property {number} PAGE_SIZE
 * @property {string} HUBSPOT_BASE_URL
 * @property {Object} HEADERS
 */

export default Config
