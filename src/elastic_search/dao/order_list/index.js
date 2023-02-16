import * as ENUM from '../../utilities/enum';
import { and, equal, getBodyData, sort, gte, lte } from '../commons/search/index';
import * as Controller from '~/memory/controller'

// Main functions

export function getOrderListByAccountId(symbol, accountId, tag, startTime, endTime) {
	if (startTime && endTime) {
		return (
			getBodyData(
				and(
					equal(ENUM.ORDER.SYMBOL, symbol),
					equal(ENUM.ORDER.ACCOUNT_ID, accountId),
					equal(ENUM.ORDER.ORDER_TAG, tag),
					gte(ENUM.ORDER.UPDATED, startTime),
					lte(ENUM.ORDER.UPDATED, endTime)
				),
				sort({
					[ENUM.ORDER.UPDATED]: ENUM.SORTING_ORDER.DESC
				})
			)
		);
	} else {
		return (
			getBodyData(
				and(
					equal(ENUM.ORDER.SYMBOL, symbol),
					equal(ENUM.ORDER.ACCOUNT_ID, accountId),
					equal(ENUM.ORDER.ORDER_TAG, tag)
				),
				sort({
					[ENUM.ORDER.UPDATED]: ENUM.SORTING_ORDER.DESC
				})
			)
		);
	}
}

// End of main functions

// Utility functions

/**
 * Get the url of order list with specific page size and page id.
 * @param pageSize
 * @param pageId
 * @returns {string}
 */
export function getOrderUrl(pageSize, pageId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/search/order?page_size=${pageSize}&page_id=${pageId}`;
}
// End of utility functions
