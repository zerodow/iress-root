import _ from 'lodash';

import Enum from '~/enum';

const PREFIX = Enum.WATCHLIST.PREFIX;
const { USER_WATCHLIST } = Enum.WATCHLIST;
const { TYPE_PRICEBOARD } = Enum;

// #region reducers
export const changeSelectedPriceBoard = (state, id) => {
	let typePriceBoard = '';

	if (state.userPriceBoard[id] || !id) {
		typePriceBoard = TYPE_PRICEBOARD.PERSONAL;
	} else {
		typePriceBoard = TYPE_PRICEBOARD.IRESS;
	}
	state.priceBoardSelected = id;
	state.typePriceBoard = typePriceBoard;

	return state;
};

export const changePriceBoardData = (
	state,
	{ newPriceBoard, typePriceBoard }
) => {
	if (typePriceBoard === TYPE_PRICEBOARD.PERSONAL) {
		state.userPriceBoard = newPriceBoard;
	} else {
		state.staticPriceBoard = newPriceBoard;
	}
	return state;
};

export const updatePriceBoardData = (state, payload) => {
	const { newPriceBoard, typePriceBoard = state.typePriceBoard } =
		payload || {};
	const { watchlist: id, value } = newPriceBoard || {};

	if (typePriceBoard === TYPE_PRICEBOARD.PERSONAL) {
		const curData = state.userPriceBoard[PREFIX + id];
		state.userPriceBoard[PREFIX + id] = curData || newPriceBoard;
		state.userPriceBoard[PREFIX + id].value = value;
	} else {
		const curData = state.staticPriceBoard[id];
		state.staticPriceBoard[id] = curData || newPriceBoard;
		state.staticPriceBoard[id].value = value;
	}
	return state;
};

export const updateListSymbolInPriceBoard = (
	state,
	{ symbol, exchange, isDelete, priceboardId }
) => {
	const { userPriceBoard, staticPriceBoard } = state;

	const priceBoardDetail =
		userPriceBoard[PREFIX + priceboardId] || staticPriceBoard[priceboardId];
	if (!priceBoardDetail.value) {
		priceBoardDetail.value = [];
	}
	const { value } = priceBoardDetail;

	const indexOfItemDel = _.findIndex(
		value,
		(item) => item.symbol === symbol && item.exchange === exchange
	);

	if (isDelete) {
		value.splice(indexOfItemDel, 1);
	} else {
		indexOfItemDel === -1 &&
			value.unshift({
				symbol,
				exchange,
				rank: new Date().getTime()
			});
	}

	return state;
};

export const updateAfterDeletePriceBoard = (state, { priceBoardId }) => {
	const { userPriceBoard } = state;
	delete userPriceBoard[priceBoardId];
	return state;
};
export const updateTypePriceBoard = (state, payload) => {
	state.typePriceBoard = payload;
	return state;
};

export const changeSymbolInfo = (state, payload) => {
	// state.typePriceBoard = payload;
	_.map(payload, ({ symbol, company, exchanges }) => {
		const exchange = exchanges[0];
		state.symbolInfo[symbol + '#' + exchange] = company;
	});
	return state;
};
// #endregion
