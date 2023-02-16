import { Dimensions } from 'react-native';

import * as Business from '~/business';
import CONFIG from '~/config';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

export const DELETE_WIDTH = 68;
export const ACTIONS_WIDTH = DEVICE_WIDTH / 2;

export const getKey = (item) => {
	const { symbol, exchange } = item || {};
	let key = '';
	if (!symbol || !exchange) {
		key = 'row_rendered';
	} else {
		key = symbol + '.' + exchange;
	}

	return key;
};

export const onChangeData = (
	priceBoardInfo = {},
	symbol,
	exchange,
	isDelete
) => {
	const rank = new Date().getTime();
	const userId = 'iressuser';
	let { watchlist: id, watchlist_name: name } = priceBoardInfo || {};
	if (!name) {
		name = id;
	}
	let data = {
		watchlist: id,
		watchlist_name: name,
		user_id: userId,
		value: [
			{
				symbol,
				exchange,
				rank
			}
		]
	};
	if (!isDelete) {
		data.row_number = [0];
	}
	const param = {
		priceboardId: id,
		data
	};

	if (isDelete) {
		Business.removeSymbolPriceBoard(param);
	} else {
		Business.addSymbolPriceBoard(param);
	}
};

export const getSnapPoint = (isIress, damping = 0.3, tension = 300) => {
	if (isIress) {
		return [
			{
				x: 0,
				damping: 1 - damping,
				tension: tension
			},

			{
				x: ACTIONS_WIDTH,
				damping: 1 - damping,
				tension: tension
			}
		];
	}

	return [
		{
			x: -DELETE_WIDTH,
			damping: 1 - damping,
			tension: tension
		},
		{
			x: 0,
			damping: 1 - damping,
			tension: tension
		},

		{
			x: ACTIONS_WIDTH,
			damping: 1 - damping,
			tension: tension
		}
	];
};
