import axios from "axios";
import Config from "./config.js";

/**
 * Takes Deal Id and gets associated Line Item Ids
 *
 * @param {string} dealId
 * @returns {Promise<string[]>}
 */
export async function getLineItemIdsOnDeal(dealId) {
  const lineItemIds = new Set();

  const res = await axios.get(
    `${Config.HUBSPOT_BASE_URL}/crm/v3/objects/deals/${dealId}?associations=line_items`,
    { headers: Config.HEADERS },
  );

  const lineItems = res.data.associations?.["line items"]?.results || [];
  for (const lineItem of lineItems) {
    lineItemIds.add(lineItem.id);
  }

  return Array.from(lineItemIds);
}

/**
 * Gets Product Id of Line Item
 *
 * @param {string} lineItemId
 * @returns {Promise<string>}
 */
export async function getProductIdOfLineItem(lineItemId) {
  const res = await axios.get(
    `${Config.HUBSPOT_BASE_URL}/crm/v3/objects/line_items/${lineItemId}?properties=hs_product_id`,
    { headers: Config.HEADERS },
  );

  return res.data.properties.hs_product_id;
}

/**
 * Updates Line Item with new Product description
 *
 * @param {string} lineItemId
 * @param {string} description
 * @returns {Promise<void>}
 */
export async function updateLineItemDescription(lineItemId, newDescription) {
  const url = `${Config.HUBSPOT_BASE_URL}/crm/v3/objects/line_items/${lineItemId}`;

  await axios.patch(
    url,
    {
      properties: {
        description: newDescription,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${Config.API_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  console.log(`Updated line item ${lineItemId}`);
}
