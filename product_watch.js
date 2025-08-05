import "dotenv/config";

const API_TOKEN = process.env.API_TOKEN;
console.log(API_TOKEN);

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

/** @type {PropertyChangeEvent} */
const event = {};

/**
 * Handles a HubSpot product property update webhook payload.
 *
 * @param {PropertyChangeEvent} payload - The webhook payload representing the property change event.
 * @returns {Promise<void>} Resolves when the update is handled.
 */
async function handleProductUpdate(payload) {
  // Logic here
}

/**
 * AWS Lambda-style handler function for processing incoming webhook events.
 *
 * @param {{ body: string }} event - The event object containing the HTTP request.
 * @returns {Promise<{ statusCode: number }>} An object with HTTP status code.
 */
export const productEventHandler = async (event) => {
  const body = JSON.parse(event.body);
  await handleProductUpdate(body);
  return { statusCode: 200 };
};
