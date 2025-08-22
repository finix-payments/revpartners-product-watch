import { Client } from '@hubspot/api-client'

/**
 * Gets ids all Deals which are not in dealstage
 * "closed won" or "closed lost"
 *
 * @param {Client} client
 * @param {number} pageSize
 * @returns {Promise<string[]>}
 */
export async function getOpenDealIds(client, pageSize) {
	let allDeals = []
	let after = undefined

	do {
		const searchBody = {
			filterGroups: [
				{
					filters: [
						{
							propertyName: 'dealstage',
							operator: 'NOT_IN',
							values: ['closedwon', 'closedlost'],
						},
						{
							propertyName: 'hs_num_of_associated_line_items',
							operator: 'GT',
							value: '0',
						},
					],
				},
			],
			properties: ['hs_object_id'],
			limit: pageSize,
			after,
		}

		const res = await client.crm.deals.searchApi.doSearch(searchBody)

		allDeals.push(...res.results)

		// if next page cursor, use it
		after = res.paging?.next?.after
	} while (after)

	return allDeals.map((deal) => deal.id)
}
