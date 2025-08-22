import { Client } from '@hubspot/api-client'

/**
 * Takes Deal Id and gets associated Line Item Ids
 *
 * @param {Client} client
 * @param {string[]} dealIds
 * @returns {Promise<string[]>}
 */
export async function getLineItemIdsOnOpenDeals(client, dealIds) {
	const lineItemIds = new Set()

	for (const dealId of dealIds) {
		const res = await client.crm.deals.basicApi.getById(
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
 * @returns {Promise<string>}
 */
export async function getProductIdOfLineItem(client, lineItemId) {
	const res = await client.crm.lineItems.basicApi.getById(lineItemId, [
		'hs_product_id',
	])

	return res.properties?.hs_product_id || null
}

/**
 * Gets Product Id of Line Item
 *
 * @param {Client} client
 * @param {string[]} lineItemIds
 * @returns {Promise<{id: string, productId: string}[]>}
 */
export async function getProductIdOfLineItems(client, lineItemIds) {
	const batchInput = { inputs: lineItemIds.map((id) => ({ id })) }

	const res = await client.crm.lineItems.batchApi.read(batchInput, [
		'hs_product_id',
	])

	/** @type {{id: string, productId: string}[]} */
	const results = res.results.map((item) => ({
		id: item.id,
		productId: item.properties?.hs_product_id || '',
	}))

	return results
}

/**
 * Updates multiple Line Items with a new Product description
 *
 * @param {Client} client
 * @param {string[]} lineItemIds
 * @param {string} newDescription
 * @returns {Promise<void>}
 */
export async function updateLineItemsDescription(
	client,
	lineItemIds,
	newDescription
) {
	const batchInput = {
		inputs: lineItemIds.map((id) => ({
			id,
			properties: { description: newDescription },
		})),
	}

	await client.crm.lineItems.batchApi.update(batchInput)
}
