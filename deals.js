import axios from 'axios'
import Config from './config.js'
import { Client } from '@hubspot/api-client'

/**
 * Gets ids all Deals which are not in dealstage
 * "closed won" or "closed lost"
 *
 * @param client {Client}
 * @returns {Promise<string[]>}
 */
export async function getOpenDealIds(client) {
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
		limit: Config.PAGE_SIZE,
	}

	const res = await client.crm.deals.searchApi.doSearch(searchBody)

	return res.results.map((r) => r.id)
}
