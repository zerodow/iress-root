import {
	requestData,
	getUrlPriceboardStatic,
	getUrlPriceboardPersonal,
	getAllPriceBoardUrl,
	getAllStaticPriceBoardUrl
} from '~/api';
import _ from 'lodash';

import Enum from '~/enum';
import { func } from '~/storage';
import * as Controller from '~/memory/controller';
import * as Business from '~/business';
import CONFIG from '~/config';
import * as Util from '~/util';

const { TYPE_PRICEBOARD, WATCHLIST } = Enum;
const { USER_WATCHLIST, PREFIX } = WATCHLIST;

// #region support functions
const getPriceBoardData = (priceBoardId, isIress) => {
	if (!priceBoardId) return;
	const url = isIress
		? getUrlPriceboardStatic(priceBoardId)
		: getUrlPriceboardPersonal(encodeURIComponent(priceBoardId));
	return requestData(url);
};

const handlePrefix = (id, isIress) => {
	if (!isIress && !_.includes(id, PREFIX) && !!id) {
		return PREFIX + id;
	} else return id;
};

// #endregion
// #region effects

export const getSymbolInfo = async (dispatch, value) => {
	const listSymbol = [];
	_.forEach(value || {}, (item) => {
		if (item && item.symbol) {
			listSymbol.push(`${item.symbol}#${item.exchange}`);
		}
	});
	const listSymbolInfoData = await Business.getSymbolInfoMultiExchange1(
		listSymbol
	);

	dispatch.priceBoard.changeSymbolInfo(listSymbolInfoData);
};

export const selectPriceBoard = async (dispatch, priceBoardId, state) => {
	dispatch.subWatchlist.resetContent2();

	let newPriceBoard = null;
	let typePriceBoard;

	const isIress = !!state.priceBoard.staticPriceBoard[priceBoardId];
	let id = handlePrefix(priceBoardId, isIress);
	if (!state.priceBoard.userPriceBoard[id] && !isIress) {
		id = _.keys(state.priceBoard.userPriceBoard)[0];
	}

	dispatch.priceBoard.changeSelectedPriceBoard(id);

	if (isIress) {
		typePriceBoard = TYPE_PRICEBOARD.IRESS;
	} else {
		typePriceBoard = TYPE_PRICEBOARD.PERSONAL;
	}

	const userPriceBoard = state.priceBoard.userPriceBoard[id];
	if (id === USER_WATCHLIST && !userPriceBoard) {
		// newPriceBoard = await createDefaultPriceBoard(id);
	} else {
		const priceBoardId = isIress ? id : userPriceBoard.watchlist;
		newPriceBoard = await getPriceBoardData(priceBoardId, isIress);
	}
	// Remove symbol không có symbol / exchange
	if (newPriceBoard.value && newPriceBoard.value.length) {
		newPriceBoard.value = newPriceBoard.value.filter((item) => {
			const { symbol, exchange } = item;
			return symbol && exchange;
		});
	}
	console.info('newPriceBoard', newPriceBoard);
	if (newPriceBoard) {
		dispatch.priceBoard.getSymbolInfo(newPriceBoard);
		dispatch.priceBoard.updatePriceBoardData({
			newPriceBoard,
			typePriceBoard
		});
	}
};

export const getUserPriceBoard = async (dispatch, cb, rootState) => {
	try {
		const userId = Controller.getUserId();
		const url = getAllPriceBoardUrl(userId);
		const response = (await requestData(url)) || {};
		const lastPriceBoard = await func.getStoragePriceBoard();
		console.info('getUserPriceBoard', response);
		let data = [];
		let isInUserWL = false;
		// let isShowLastPriceBoard = ''
		if (_.isEmpty(response.data)) {
			// data.push(func.getPriceboardDefault());
		} else {
			data = response.data;
		}

		const newUserPriceBoard = {};

		_.forEach(data, (item = {}) => {
			const { watchlist: id, watchlist_name: name } = item;
			newUserPriceBoard[PREFIX + id] = {
				...item,
				watchlist_name: name || id
			};
			if (
				(lastPriceBoard + '').toUpperCase() ===
				(PREFIX + id + '').toUpperCase()
			) {
				isInUserWL = true;
			}
		});
		dispatch.priceBoard.changePriceBoardData({
			newPriceBoard: newUserPriceBoard,
			typePriceBoard: TYPE_PRICEBOARD.PERSONAL
		});

		const { priceBoardSelected } = rootState.priceBoard;
		if (lastPriceBoard === '' || !lastPriceBoard || !isInUserWL) {
			dispatch.priceBoard.selectPriceBoard(priceBoardSelected);
			dispatch.priceBoard.getSymbolInfo(
				newUserPriceBoard[priceBoardSelected]
			);
		} else {
			dispatch.priceBoard.selectPriceBoard(lastPriceBoard);
			dispatch.priceBoard.getSymbolInfo(
				newUserPriceBoard[lastPriceBoard]
			);
		}

		cb && cb();
	} catch (error) {
		console.log('getUserPriceboard error', error);
	}
};

export const getStaticPriceBoard = async (dispatch) => {
	const url = getAllStaticPriceBoardUrl();
	const response = await requestData(url);

	const newStaticPriceBoard = {};
	_.forEach(response && response.data, (item) => {
		const { watchlist: id, watchlist_name: name } = item || {};
		const newKey = id;
		newStaticPriceBoard[newKey] = item || {};
		newStaticPriceBoard[newKey].watchlist_name = (name || '').replace(
			/\s\s+/g,
			' '
		);
	});

	dispatch.priceBoard.changePriceBoardData({
		newPriceBoard: newStaticPriceBoard,
		typePriceBoard: TYPE_PRICEBOARD.IRESS
	});
};

export const createPriceBoard = async (dispatch, payload, rootState) => {
	const userId = 'iressuser';
	const { watchlistName, callback, value = [], isRecallApi } = payload || {};

	const watchlist = payload.watchlist || watchlistName || Util.getRandomKey();

	const newPriceBoard = {
		user_id: userId,
		watchlist_name: watchlistName,
		value,
		watchlist
	};

	// newPriceBoard.init_time = new Date().getTime();

	dispatch.priceBoard.updatePriceBoardData({
		newPriceBoard,
		typePriceBoard: TYPE_PRICEBOARD.PERSONAL
	});

	if (isRecallApi) {
		dispatch.priceBoard.selectPriceBoard(PREFIX + watchlist);
	} else {
		dispatch.priceBoard.changeSelectedPriceBoard(PREFIX + watchlist);
		dispatch.subWatchlist.resetContent2();
	}
	// delete newPriceBoard['init_time'] // BE validate trường này
	const data = await Business.createUserPriceboard(userId, newPriceBoard);
	callback && callback(data);
	await func.setStoragePriceBoard(PREFIX + watchlist);
};

export const updatePriceBoard = async (dispatch, payload, rootState) => {
	const userId = 'iressuser';
	const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
		rootState.priceBoard;
	const curPriceBoard =
		userPriceBoard[priceBoardSelected] ||
		staticPriceBoard[priceBoardSelected] ||
		{};

	const {
		watchlistName = curPriceBoard.watchlist_name,
		callback,
		watchlist = curPriceBoard.watchlist,
		value = curPriceBoard.value || []
	} = payload || {};

	const newPriceBoard = {
		user_id: userId,
		watchlist_name: watchlistName,
		value,
		watchlist
	};

	const data = await Business.updatePriceBoardDetail(
		watchlist,
		userId,
		newPriceBoard
	);
	callback && callback(data);

	dispatch.priceBoard.updatePriceBoardData({
		newPriceBoard
	});
	dispatch.priceBoard.selectPriceBoard(PREFIX + watchlist);
};

export const updateSpecifyPriceBoard = async (dispatch, payload, rootState) => {
	const userId = 'iressuser';
	const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
		rootState.priceBoard;
	const curPriceBoard =
		userPriceBoard[priceBoardSelected] ||
		staticPriceBoard[priceBoardSelected] ||
		{};

	const {
		watchlistName = curPriceBoard.watchlist_name,
		callback,
		watchlist = curPriceBoard.watchlist,
		value = [],
		isChangeWLName = false,
		isRecallApi = true
	} = payload || {};

	const newPriceBoard = {
		user_id: userId,
		watchlist_name: watchlistName,
		value,
		watchlist
	};

	dispatch.priceBoard.updatePriceBoardData({
		newPriceBoard
	});
	if (isRecallApi) {
		dispatch.priceBoard.selectPriceBoard(PREFIX + watchlist);
	} else {
		dispatch.subWatchlist.resetContent2();
	}

	const data = await Business.updatePriceBoardSpecify({
		priceboardId: watchlist,
		data: newPriceBoard,
		isChangeWLName
	});
	callback && callback(data);
};

export const updatePriceBoardSelected = async (
	dispatch,
	{ priceBoardId },
	rootState
) => {
	const { priceBoardSelected, userPriceBoard } = rootState.priceBoard;
	if (priceBoardId === priceBoardSelected) {
		// chuyen ve bang gia dau tien
		const firstPriceBoardId = _.keys(userPriceBoard)[0];
		if (firstPriceBoardId) {
			dispatch.priceBoard.selectPriceBoard(firstPriceBoardId);
		} else {
			// reset reducer state
			dispatch.priceBoard.changeSelectedPriceBoard(null);
		}
	}
};

export const deletePriceBoard = async (dispatch, payload, rootState) => {
	const userId = 'iressuser';
	const { watchlist } = payload;

	const priceBoardId = PREFIX + watchlist;
	dispatch.priceBoard.updateAfterDeletePriceBoard({
		priceBoardId
	});
	dispatch.priceBoard.updatePriceBoardSelected({
		priceBoardId
	});

	await Business.deletePriceboard(watchlist, userId);
};
export function changeTypePriceBoard(dispatch, typePriceBoard) {
	dispatch.priceBoard.updateTypePriceBoard(typePriceBoard);
}
export const addOrRemoveSymbol = async (dispatch, payload, rootState) => {
	const {
		symbol,
		exchange,
		isDelete,
		priceboardId: payloadId
	} = payload || {};
	const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
		rootState.priceBoard;

	const isIress = !!staticPriceBoard[payloadId || priceBoardSelected];

	const priceboardId = handlePrefix(payloadId || priceBoardSelected, isIress);
	const priceBoardDetail =
		userPriceBoard[priceboardId] || staticPriceBoard[priceboardId];
	const {
		watchlist: id,
		watchlist_name: watchlistName,
		value = []
	} = priceBoardDetail || {};

	const name = watchlistName || id;

	let isDeleteActions = isDelete;
	if (_.isNil(isDelete)) {
		isDeleteActions = !!_.find(
			value,
			(item) => item.symbol === symbol && item.exchange === exchange
		);
	}

	dispatch.priceBoard.updateListSymbolInPriceBoard({
		symbol,
		exchange,
		isDelete: isDeleteActions,
		priceboardId: id
	});

	// commit to server
	const userId = 'iressuser';
	let data = {
		watchlist: id,
		watchlist_name: name,
		user_id: userId,
		value: [
			{
				symbol,
				exchange,
				rank: new Date().getTime()
			}
		]
	};

	if (!isDeleteActions) {
		data.row_number = [0];
	}
	const param = {
		priceboardId: id,
		data
	};

	if (isDeleteActions) {
		await Business.removeSymbolPriceBoard(param);
	} else {
		await Business.addSymbolPriceBoard(param);
	}
};
// #endregion
