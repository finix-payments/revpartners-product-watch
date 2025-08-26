import { getOpenDealIds } from './deals.js'
import {
	getProductIdOfLineItems,
	getLineItemIdsOnOpenDeals,
	updateLineItemsDescription,
} from './lineitems.js'
import { Client } from '@hubspot/api-client'
import Config from './config.js'
import 'dotenv/config'
import { ApiThrottler } from './throttler.js'


import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient()
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
export async function productEventHandler(event) {
	// check for API_TOKEN
	if (API_TOKEN === '' || API_TOKEN === undefined) {
		console.log('error: API_TOKEN missing')
		return 500
	}

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

	const apiThrottler = new ApiThrottler()
	try {
		await updateProductDescriptionInOpenDeals(
			hsClient,
			productId,
			newDescription,
			apiThrottler
		)
	} catch (error) {
		console.log(error)
		return { statusCode: 500 }
	}

	console.log('success')
	console.log(`total api requests: ${apiThrottler.totalRequests}`)
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
 * @param {Client} hsClient
 * @param {string} productId
 * @param {string} newDescription
 * @param {ApiThrottler} apiThrottler
 * @returns {Promise<void>}
 */
async function updateProductDescriptionInOpenDeals(
	hsClient,
	productId,
	newDescription,
	apiThrottler
) {
	// get Open Deal ids
	console.log('[1/4] searching open deals...')
	const dealIds = await getOpenDealIds(
		hsClient,
		Config.PAGE_SIZE,
		apiThrottler
	)
	if (dealIds.length == 0) {
		console.log('no open deals found, exiting early\n')
		return
	}
	console.log(`${dealIds.length} open deals found`)
	console.log()

	// get associated Line Item ids
	console.log('[2/4] searching for associated Line Items...')
	const lineItemIds = await getLineItemIdsOnOpenDeals(
		hsClient,
		dealIds,
		apiThrottler
	)
	if (lineItemIds.length == 0) {
		console.log('no associated Line Items found, exiting early\n')
		return
	}
	console.log(`Associated Line Items found: ${lineItemIds.length}`)
	console.log()

	// query for Product Ids of Line Items
	console.log('[3/4] matching Product Id of Line Items...')
	const lineItemProductIds = await getProductIdOfLineItems(
		hsClient,
		lineItemIds,
		apiThrottler
	)
	// match Product Id to original changed Product Id
	const matchedLineItemIds = lineItemProductIds
		.filter((item) => item.productId === productId)
		.map((item) => item.id)
	console.log(`matching Line Items found: ${matchedLineItemIds.length}`)
	if (matchedLineItemIds.length == 0) {
		console.log('no matching Line Items found, exiting early\n')
		return
	}
	console.log()

	// update matched Line Items
	console.log('[4/4] updating line items...')
	await updateLineItemsDescription(
		hsClient,
		matchedLineItemIds,
		newDescription,
		apiThrottler
	)
	console.log(matchedLineItemIds.join('\n'))
	console.log(`sucessfully updated Line Items: ${matchedLineItemIds.length}`)
	console.log()
}

/**
 * Function to read Hubspot API Token from SecretsManager
 *
 * @returns {Promise<string>} The HubSpot API token string.
 */
async function getApiToken() {
  if (cachedToken) return cachedToken;

  const resp = await sm.send(
    new GetSecretValueCommand({ SecretId: SECRET_ID })
  );

  let str;
  if (resp.SecretString) {
    str = resp.SecretString;
  } else if (resp.SecretBinary) {
    str = Buffer.from(resp.SecretBinary, "base64").toString("utf-8");
  } else {
    throw new Error("Secret has no value");
  }

  try {
    const obj = JSON.parse(str);
    cachedToken = obj.API_TOKEN ?? str;
  } catch {
    cachedToken = str;
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
