import { Client } from '@hubspot/api-client'
import Config from './config.js'
import { ApiThrottler } from './throttler.js'

/**
 * Takes Deal Id and gets associated Line Item Ids
 *
 * @param {Client} client
 * @param {string[]} dealIds
 * @param {ApiThrottler} apiThrottler
 * @returns {Promise<string[]>}
 */
export async function getLineItemIdsOnOpenDeals(client, dealIds, apiThrottler) {
	const lineItemIds = new Set()

	for (const dealId of dealIds) {
		const res = await apiThrottler.call(
			client.crm.deals.basicApi.getById,
			dealId,
			undefined,
			undefined,
			['line_items']
		)

		const lineItems = res.associations?.['line items']?.results || []
		for (const lineItem of lineItems) {
			lineItemIds.add(lineItem.id)
		}
	}

	return Array.from(lineItemIds)
}

/**
 * Gets Product Id of Line Item
 *
 * @param {Client} client
 * @param {string} lineItemId
 * @param {ApiThrottler} apiThrottler
 * @returns {Promise<string>}
 */
export async function getProductIdOfLineItem(client, lineItemId, apiThrottler) {
	const res = await apiThrottler.call(
		client.crm.lineItems.basicApi.getById,
		lineItemId,
		'hs_product_id'
	)

	return res.properties?.hs_product_id || null
}

/**
 * Gets Product Id of Line Item
 *
 * @param {Client} client
 * @param {string[]} lineItemIds
 * @param {ApiThrottler} apiThrottler
 * @returns {Promise<{id: string, productId: string}[]>}
 */
export async function getProductIdOfLineItems(
	client,
	lineItemIds,
	apiThrottler
) {
	const batchInput = { inputs: lineItemIds.map((id) => ({ id })) }

	const res = await apiThrottler.call(
		client.crm.lineItems.batchApi.read,
		batchInput,
		'hs_product_id'
	)

	/** @type {{id: string, productId: string}[]} */
	const results = res.results.map((item) => ({
		id: item.id,
		productId: item.properties?.hs_product_id || '',
	}))

	return results
}

/**
 * Updates multiple Line Items with a new Product description,
 * sending requests in batches of up to 100.
 *
 * @param {Client} client
 * @param {string[]} lineItemIds
 * @param {string} newDescription
 * @param {ApiThrottler} apiThrottler
 * @returns {Promise<void>}
 */
export async function updateLineItemsDescription(
	client,
	lineItemIds,
	newDescription,
	apiThrottler
) {
	for (let i = 0; i < lineItemIds.length; i += Config.PAGE_SIZE) {
		const batchIds = lineItemIds.slice(i, i + Config.PAGE_SIZE)

		const batchInput = {
			inputs: batchIds.map((id) => ({
				id,
				properties: { description: newDescription },
			})),
		}

		await apiThrottler.call(
			client.crm.lineItems.batchApi.update,
			batchInput
		)
	}
}
