import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js';
import { filter, pickBy, uniqWith, clone, forEach, map } from 'lodash';
import * as Business from '~/business';
import CONFIG from '~/config';
import Enum from '~/enum';
import * as Util from '~/util';
import WatchlistActions from '~s/watchlist/reducers';
import { getDispathchFunc } from '~/memory/model';

import * as Controller from '~/memory/controller';
import { getUpdatePriceBoardUrl, deleteData } from '~/api';
const { WATCHLIST } = Enum;
export function checkChangeWLName() {
	const oldWLName = PriceBoardModel.getOldWatchlistName();
	const wlName = PriceBoardModel.getWatchlistName();
	console.log('WL NAME', oldWLName, wlName);
	return !(oldWLName === wlName);
}
export function handleDoneEdit(onSuccess, onError) {
	const typePriceBoard = PriceBoardModel.getTypePriceBoard();
	const localPriceBoard = PriceBoardModel.getPriceBoardCurrentPriceBoard();
	const dispatch = getDispathchFunc();
	const isChangeWLName = checkChangeWLName();
	const isRecallApi = false;
	if (typePriceBoard === Enum.TYPE_PRICEBOARD.IRESS) {
		// Bang gia system di vao case nay se la clone bang gia
		dispatch.priceBoard.changeTypePriceBoard(Enum.TYPE_PRICEBOARD.PERSONAL);
		return createNewWatchlist();
	}
	const {
		watchlist: priceboardId,
		watchlist_name: wlName,
		value
	} = localPriceBoard;
	const payload = {
		watchlistName: wlName,
		watchlist: priceboardId,
		value: value.map((el, index) => {
			delete el.key;
			return { ...el, rank: index };
		}),
		isChangeWLName,
		isRecallApi
	};
	dispatch.priceBoard.updateSpecifyPriceBoard(payload);
}
export function createBodyData({
	listSymbol = {
		'ANN#ASX': {
			symbol: 'ESS',
			exchange: 'ASX',
			rank: 0
		}
	},
	isAdd = false
}) {
	try {
		const userId = 'iressuser';
		const priceBoardDetail = {
			...PriceBoardModel.getPriceBoardCurrentPriceBoard()
		};
		delete priceBoardDetail.init_time;
		const curPriceBoard = PriceBoardModel.getPriceBoardCurrentPriceBoard();
		const priceboardId = curPriceBoard['watchlist'];

		let count = 0;
		const value = map(listSymbol, (value, key) => {
			const [symbol, exchange] = key.split('#');
			return {
				symbol,
				exchange,
				rank: count++
			};
		});
		const param = {
			priceboardId,
			data: {
				...priceBoardDetail,
				user_id: userId,
				value: value
			}
		};

		return {
			priceboardId,
			body: param
		};
	} catch (error) {}
}
export function addSymbolToWatchlist(listSymbol = { 'BHP#ASX': true }) {
	const { priceboardId, body } = createBodyData({ listSymbol, isAdd: true });
	return Business.addSymbolPriceBoard(body);
}
export function deleteSymbolFromWatchlist(listSymbol) {
	const { priceboardId, body } = createBodyData({ listSymbol });
	return Business.removeSymbolPriceBoard(body);
}
export function reNameWatchlist(newWatchlistName) {
	const userId = 'iressuser';
	const priceBoardDetail = {
		...PriceBoardModel.getPriceBoardCurrentPriceBoard()
	};
	delete priceBoardDetail.init_time;
	const curPriceBoard = PriceBoardModel.getPriceBoardCurrentPriceBoard();
	const priceboardId = curPriceBoard['watchlist'];
	return Business.pushUpdatePriceboardName(
		priceboardId,
		userId,
		newWatchlistName.trim()
	);
}
export function deleteUserWL(cb) {
	const curPriceBoard = PriceBoardModel.getPriceBoardCurrentPriceBoard();
	const priceboardId = curPriceBoard['watchlist'];
	const dispatch = getDispathchFunc();
	const payload = { watchlist: priceboardId };

	cb &&
		cb({
			updateRedux: () => {
				dispatch.priceBoard.deletePriceBoard(payload);
			}
		});
}

export function createNewWatchlist() {
	const dispatch = getDispathchFunc();
	const isRecallApi = false;
	const listSymbolSelected = PriceBoardModel.getDicSymbolSelected(
		PriceBoardModel.getPriceBoardCurrentPriceBoard()
	);
	const { body } = createBodyData({
		listSymbol: listSymbolSelected,
		isAdd: true
	});
	const payload = {
		watchlistName: body.data.watchlist_name,
		// watchlist: body.data.watchlist_name,
		value: body.data.value,
		isRecallApi
	};
	dispatch.priceBoard.createPriceBoard(payload);
}
