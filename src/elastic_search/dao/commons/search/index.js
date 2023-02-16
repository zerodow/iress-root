/**
 * Get query object to search the whole database for documents that contains keyword
 * @param keyword
 * @returns {{query: {query_string: {query: string}}}}
 */
export function quickSearch(keyword) {
	return {
		query: {
			query_string: {
				query: `*${keyword}*`
			}
		}
	};
}

/**
 * Get the ElasticSearch query object, with 2 fields: query and sort
 * @example
 * - For query:
 * getBodyData(
 * 		and(
 * 			equal('symbol', 'ANZ'),
 * 			or(
 * 				like('account_id', 123457),
 * 				not(
 * 					gte('updated', 1568865879451)
 * 				)
 * 			)
 * 		),
 * 		sort({
 * 	    	'updated': 'desc'
 * 		})
 * )
 * - we will have object
 * {
    "query": {
        "bool": {
            "must": [
                {
                    "term": {
                        "symbol": {
                            "value": "ANZ"
                        }
                    }
                },
                {
                    "bool": {
                        "should": [
                            {
                                "wildcard": {
                                    "account_id": {
                                        "wildcard": 123457
                                    }
                                }
                            },
                            {
                                "bool": {
                                    "must_not": [
                                        {
                                            "range": {
                                                "updated": {
                                                    "gte": 1568865879451
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    "sort": [
        {
            "updated": {
                "order": "desc"
            }
        }
    ]
}
 * @param QUERY
 * @param SORT
 * @returns {{query: *, sort: *}}
 */
export function getBodyData(QUERY, SORT) {
	let { sort } = SORT;
	return sort
		? {
			query: QUERY,
			sort
		}
		: {
			query: QUERY
		}
}

/**
 * Return the sort object for sort field in query.
 * @example
 * sort({
 *     'updated': 'desc',
 *     'symbol': 'asc'
 * })
 * @param params
 * @returns {{sort: Array}}
 */
export function sort(params) {
	if (!params) {
		return {
			sort: null
		}
	}
	let orders = [];
	const keys = Object.keys(params);
	for (let i = 0; i < keys.length; i++) {
		orders.push({
			[keys[i]]: {
				order: params[keys[i]]
			}
		})
	}
	return {
		sort: orders
	}
}

/**
 * Get AND expression
 * @example
 * and(
 * 		equal('symbol', 'ANZ'),
 * 		like('order_tag', 'open')
 * )
 * @param params
 * @returns {{bool: {must: *[]}}}
 */
export function and(...params) {
	return {
		bool: {
			must: params
		}
	}
}

/**
 * Get OR expression
 * @example
 * or(
 * 		equal('symbol', 'ANZ'),
 * 		like('order_tag', 'open')
 * )
 * @param params
 * @returns {{bool: {should: *[]}}}
 */
export function or(...params) {
	return {
		bool: {
			should: params
		}
	}
}

/**
 * Get NOT expression
 * @example
 * not(
 * 		equal('symbol', 'ANZ'),
 * 		like('order_tag', 'open')
 * )
 * @param params
 * @returns {{bool: {must_not: *[]}}}
 */
export function not(...params) {
	return {
		bool: {
			must_not: params
		}
	}
}

/**
 * Get equal constraint
 * @param field
 * @param value
 * @returns {{term: {}}}
 */
export function equal(field, value) {
	return {
		term: {
			[field]: {
				value: value
			}
		}
	}
}

/**
 * Get like constraint
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function like(field, value) {
	return {
		wildcard: {
			[field]: {
				wildcard: `*${value}*`
			}
		}
	}
}

/**
 * Get greater-than-or-equal constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function gte(field, value) {
	return {
		range: {
			[field]: {
				gte: value
			}
		}
	}
}

/**
 * Get greater-than constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function gt(field, value) {
	return {
		range: {
			[field]: {
				gt: value
			}
		}
	}
}

/**
 * Get less-than-or-equal constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function lte(field, value) {
	return {
		range: {
			[field]: {
				lte: value
			}
		}
	}
}

/**
 * Get less-than constraint
 * @param field
 * @param value
 * @returns {{range: {}}}
 */
export function lt(field, value) {
	return {
		range: {
			[field]: {
				lt: value
			}
		}
	}
}

/**
 * Get document whose field starts with value
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function startsWith(field, value) {
	return {
		wildcard: {
			[field]: {
				wildcard: `${value}*`
			}
		}
	}
}

/**
 * Get document whose field ends with value
 * @param field
 * @param value
 * @returns {{wildcard: {}}}
 */
export function endsWith(field, value) {
	return {
		wildcard: {
			[field]: {
				wildcard: `*${value}`
			}
		}
	}
}
