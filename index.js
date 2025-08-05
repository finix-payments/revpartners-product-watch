import { getOpenDealIds } from "./deals.js";
import {
  getProductIdOfLineItem,
  getLineItemIdsOnDeal,
  updateLineItemDescription,
} from "./lineitems.js";

/**
 * Main Lambda Handler function for processing incoming webhook events
 *
 * @param {{ body: string }} event - The event object containing the HTTP request.
 * @returns {Promise<{ statusCode: number }>} An object with HTTP status code.
 */
export const productEventHandler = async (event) => {
  /** @type {PropertyChangeEvent[]} */
  const body = JSON.parse(event.body);

  // validate req body
  if (body.length == 0) {
    console.log("invalid webhook request body");
    return { statusCode: 400 };
  }
  const productId = body[0].objectId.toString();
  const newDescription = body[0].propertyValue;
  if (!productId || !newDescription) {
    console.log("invalid webhook request body");
    return { statusCode: 400 };
  }

  try {
    await updateProductDescriptionInOpenDeals(productId, newDescription);
  } catch (error) {
    console.log(error);
    return { statusCode: 500 };
  }

  console.log("updates completed successfully");
  return { statusCode: 200 };
};

/**
 * Updates Product description on Line Items with same Product Id
 *
 * @param {string} productId
 * @param {string} newDescription
 * @returns {Promise<void>}
 */
async function updateProductDescriptionInOpenDeals(productId, newDescription) {
  const dealIds = await getOpenDealIds();

  for (const dealId of dealIds) {
    const lineItemIds = await getLineItemIdsOnDeal(dealId);

    for (const lineItemId of lineItemIds) {
      const lineItemProductId = await getProductIdOfLineItem(lineItemId);

      if (lineItemProductId == productId) {
        await updateLineItemDescription(lineItemId, newDescription);
      }
    }
  }
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
