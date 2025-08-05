import axios from "axios";
import Config from "./config.js";

/**
 * Gets ids all Deals which are not in dealstage
 * "closed won" or "closed lost"
 *
 * @returns {Promise<string[]>}
 */
export async function getOpenDealIds() {
  const searchBody = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: "dealstage",
            operator: "NOT_IN",
            values: ["closedwon", "closedlost"],
          },
          {
            propertyName: "hs_num_of_associated_line_items",
            operator: "GT",
            value: "0",
          },
        ],
      },
    ],
    properties: ["hs_object_id"],
    limit: Config.PAGE_SIZE,
  };

  const res = await axios.post(
    `${Config.HUBSPOT_BASE_URL}/crm/v3/objects/deals/search`,
    searchBody,
    {
      headers: Config.HEADERS,
    },
  );

  return res.data.results.map((r) => r.id);
}
