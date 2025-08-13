import axios from 'axios'
import Config from './config.js'
import { Client } from '@hubspot/api-client'
import { SimplePublicObjectInput } from '@hubspot/api-client/lib/codegen/crm/companies/index.js'

/**
 * Takes Deal Id and gets associated Line Item Ids
 *
 * @param client {Client}
 * @param {string} dealId
 * @returns {Promise<string[]>}
 */
export async function getLineItemIdsOnDeal(client, dealId) {
	const lineItemIds = new Set()

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

	return Array.from(lineItemIds)
}

/**
 * Gets Product Id of Line Item
 *
 * @param client {Client}
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
 * Updates Line Item with new Product description
 *
 * @param client {Client}
 * @param {string} lineItemId
 * @param {string} description
 * @returns {Promise<void>}
 */
export async function updateLineItemDescription(
	client,
	lineItemId,
	newDescription
) {
	await client.crm.lineItems.basicApi.update(lineItemId, {
		properties: {
			description: newDescription,
		},
	})

	console.log(`Updated line item ${lineItemId}`)
}
