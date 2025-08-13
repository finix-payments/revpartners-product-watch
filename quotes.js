import axios from 'axios'
import Config from './config.js'

/**
 * Takes Deal Id and gets associated Quote Ids
 *
 * @param {string} dealId
 * @returns {Promise<string[]>}
 */
export async function getQuotesOnDealId(dealId) {
	const url = `${Config.HUBSPOT_BASE_URL}/crm/v3/objects/deals/${dealId}/associations/quotes`
	const res = await axios.get(url, { headers: Config.HEADERS })
	console.log(res.data)
	return res.data.results.map((id) => id)
}
