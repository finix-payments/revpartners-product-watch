import { getOpenDealIds } from './deals.js'
import {
	getProductIdOfLineItem,
	getLineItemIdsOnDeal,
	updateLineItemDescription,
} from './lineitems.js'
import { Client } from '@hubspot/api-client'
import Config from './config.js'
import AWS from 'aws-sdk'

const sm = new AWS.SecretsManager();

const SECRET_ID = process.env.SECRET_ID;
let cachedToken = null;

const API_TOKEN = await getApiToken();

const hsClient = new Client({
	accessToken: API_TOKEN,
	numberOfApiCallRetries: 3,
})

/**
 * Main Lambda Handler function for processing incoming webhook events
 *
 * @param {{ body: string }} event - The event object containing the HTTP request.
 * @returns {Promise<{ statusCode: number }>} An object with HTTP status code.
 */
export const productEventHandler = async (event) => {
	/** @type {PropertyChangeEvent[]} */
	const body = JSON.parse(event.body)

	// validate req body
	if (body.length == 0) {
		console.log('invalid webhook request body')
		return { statusCode: 400 }
	}

	// get product id and new description from body
	const productId = body[0].objectId.toString()
	const newDescription = body[0].propertyValue
	if (!productId || !newDescription) {
		console.log('invalid webhook request body')
		return { statusCode: 400 }
	}

	try {
		await updateProductDescriptionInOpenDeals(
			hsClient,
			productId,
			newDescription
		)
	} catch (error) {
		console.log(error)
		return { statusCode: 500 }
	}

	console.log('updates completed successfully')
	return { statusCode: 200 }
}

/**
 * Updates Product description on Line Items with same Product Id
 *
 * 1. Get all open deals
 * 2. Get line items on those deals
 * 3. Get product id of each line item
 * 4. Update line item if product id matches
 *
 * @param hsClient {Client}
 * @param {string} productId
 * @param {string} newDescription
 * @returns {Promise<void>}
 */
async function updateProductDescriptionInOpenDeals(
	hsClient,
	productId,
	newDescription
) {
	// get open deals ids
	const dealIds = await getOpenDealIds(hsClient)

	for (const dealId of dealIds) {
		// get line item ids on open deals
		const lineItemIds = await getLineItemIdsOnDeal(hsClient, dealId)

		// get product id of each line item
		for (const lineItemId of lineItemIds) {
			const lineItemProductId = await getProductIdOfLineItem(
				hsClient,
				lineItemId
			)

			// if line item's product id is same as updated product,
			// update line item description
			if (lineItemProductId == productId) {
				await updateLineItemDescription(
					hsClient,
					lineItemId,
					newDescription
				)
			}
		}
	}
}

/**
 * Function to read Hubspot API Token from SecretsManager
 *
 * @returns {Promise<string>} The HubSpot API token string.
 */
async function getApiToken() {
  if (cachedToken) return cachedToken;

  const resp = await sm.getSecretValue({ SecretId: SECRET_ID }).promise();

  // Secret may be a raw string or JSON object; support both
  if (resp.SecretString) {
    try {
      const obj = JSON.parse(resp.SecretString);
      cachedToken = obj.API_TOKEN ?? resp.SecretString;
    } catch {
      cachedToken = resp.SecretString;
    }
  } else if (resp.SecretBinary) {
    cachedToken = Buffer.from(resp.SecretBinary, 'base64').toString('utf-8');
  } else {
    throw new Error('Secret has no value');
  }
  return cachedToken;
}

/**
 * Represents a HubSpot webhook event for a property change on a product object.
 *
 * @typedef {Object} PropertyChangeEvent
 * @property {number} eventId - Unique identifier for the webhook event.
 * @property {number} subscriptionId - ID of the webhook subscription that triggered this event.
 * @property {number} portalId - ID of the HubSpot portal where the event occurred.
 * @property {number} appId - ID of the app that registered the webhook.
 * @property {number} occurredAt - Timestamp (in milliseconds since epoch) when the event occurred.
 * @property {string} subscriptionType - Type of event subscription (e.g., "product.propertyChange").
 * @property {number} attemptNumber - Number of times this event has been attempted for delivery.
 * @property {number} objectId - ID of the object (e.g., product) whose property was changed.
 * @property {string} propertyName - Name of the property that was changed.
 * @property {string} propertyValue - New value of the changed property.
 * @property {string} changeSource - Source of the change (e.g., "CRM_UI", "API").
 * @property {string} sourceId - Identifier of the source that made the change (e.g., user ID or integration ID).
 */
