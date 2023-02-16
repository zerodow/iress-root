import * as ENUM from '../../utilities/enum';

// Main functions

export function getOrderListByAccountId(symbol, accountId, tag, startTime, endTime) {
	if (startTime && endTime) {
		return {
			query: {
				bool: {
					must: [
						{
							term: {
								[ENUM.ORDER.SYMBOL]: {
									value: symbol
								}
							}
						},
						{
							term: {
								[ENUM.ORDER.ACCOUNT_ID]: {
									value: accountId
								}
							}
						},
						{
							term: {
								[ENUM.ORDER.ORDER_TAG]: {
									value: tag
								}
							}
						},
						{
							range: {
								[ENUM.ORDER.UPDATED]: {
									from: startTime,
									to: endTime
								}
							}
						}
					]
				}
			},
			sort: [sortField(ENUM.ORDER.UPDATED, ENUM.SORTING_ORDER.DESC)]
		}
	} else {
		return {
			query: {
				bool: {
					must: [
						{
							term: {
								[ENUM.ORDER.SYMBOL]: {
									value: symbol
								}
							}
						},
						{
							term: {
								[ENUM.ORDER.ACCOUNT_ID]: {
									value: accountId
								}
							}
						},
						{
							term: {
								[ENUM.ORDER.ORDER_TAG]: {
									value: tag
								}
							}
						}
					]
				}
			},
			sort: [sortField(ENUM.ORDER.UPDATED, ENUM.SORTING_ORDER.DESC)]
		}
	}
}

// End of main functions

// Utility functions

export function getOrderUrl(pageSize, pageId) {
	return `https://om-dev3.equixapp.com/v3/search/order?page_size=${pageSize}&page_id=${pageId}`
}

export function sortField(field, order) {
	return {
		[field]: {
			order: order
		}
	}
}

// End of utility functions
