import { all, call, put, select, take } from 'redux-saga/effects';

import { channel as sagaChannel, buffers } from 'redux-saga';
import _ from 'lodash';
import * as Emitter from '@lib/vietnam-emitter';

import { logDevice } from '../../lib/base/functionUtil';
import { dataStorage, func } from '../../storage';
import WatchListActions, { reducer } from './trade.reducer';
import { takeEvery } from '../price/price.saga';
import { iconsMap } from '../../utils/AppIcons';
import * as Business from '../../business';
import * as Api from '../../api';
import * as NewsBusiness from '../../streaming/news';
import * as Controller from '../../memory/controller';
import * as AllMarket from '../../streaming/all_market';
import * as UserPriceSource from '../../userPriceSource';
import * as StreamingBusiness from '../../streaming/streaming_business';
import Enum from '../../enum';
const { TAB_NEWS } = Enum

const BROWSER_OUTLINE_BTN = {
	icon: iconsMap['ios-browsers-outline'],
	id: 'left_filter',
	testID: 'left_filter_button'
};
const ADD_BTN = {
	title: 'Add',
	id: 'add',
	icon: iconsMap['ios-create-outline']
};
const REFRESH_BTN = {
	title: 'Refresh',
	id: 'trade_refresh',
	icon: iconsMap['ios-refresh-outline'],
	testID: 'trade_refresh'
};
const REFRESHING_BTN = {
	id: 'custom-button-watchlist',
	component: 'equix.CustomButtonWatchlist'
};

function* getListCode() {
	const { priceBoardDetail: { value = [] } = {} } = yield select(
		state => state.trade
	);
	return _.map(value, item => item.symbol);
}

function* unsubLv1Realtime(id) {
	const listSymbol = yield getListCode();
	const isPriceStreaming = Controller.isPriceStreaming();
	const listSymbolObj = listSymbol.map(symbol => ({
		exchange: func.getExchangeSymbol(symbol),
		symbol
	}));
	if (isPriceStreaming) {
		const cbChannel = yield call(sagaChannel, buffers.sliding(3));
		AllMarket.unsub(listSymbolObj, id, () =>
			cbChannel.put('UNSUB_LV1_REALTIME')
		);

		yield take(cbChannel);
	}
}

function* subLv1Realtime(id) {
	const listSymbol = yield getListCode();
	const isPriceStreaming = Controller.isPriceStreaming();
	const listSymbolObj = listSymbol.map(symbol => ({
		exchange: func.getExchangeSymbol(symbol),
		symbol
	}));
	if (isPriceStreaming) {
		AllMarket.setIsAIO(false)
		AllMarket.sub(listSymbolObj, id, () => null);
	}
}

function* changeWatchlist({ data: id }) {
	const { priceBoardDetail: { watchlist: priceBoardId } = {} } = yield select(
		state => state.trade
	);
	const currentPriceBoard = func.getPriceboardDetailInPriceBoard(
		priceBoardId
	);

	if (!_.isEqual(currentPriceBoard, priceBoardDetail)) {
		yield unsubLv1Realtime(id);

		yield put(WatchListActions.setSubTitleWatchlist());

		// #region reloadWhenPriceboardChange
		yield put(WatchListActions.setNavButtonWatchlist());

		// getSymbolInfoAndCheckNewsToday
		const listSymbol = yield getListCode();
		yield all([
			call(Business.getSymbolInfoMultiExchange, listSymbol),
			checkNewsToday()
		]);

		yield subLv1Realtime(id);

		yield put(WatchListActions.updatePriceBoard(currentPriceBoard)); //  as snapshot
		// #endregion
		// feature :  wait done => timeUpdatedRef
	}
}

function* getNavButton() {
	const {
		isLoadingPrice,
		priceBoardDetail: { watchlist } = {}
	} = yield select(state => state.trade);

	const rightButtons = [BROWSER_OUTLINE_BTN];
	if (isLoadingPrice && Controller.isPriceStreaming()) {
		rightButtons.unshift(REFRESHING_BTN);
	}
	if (!isLoadingPrice && Controller.isPriceStreaming()) {
		rightButtons.unshift(REFRESH_BTN);
	}
	if (
		!func.checkCurrentPriceboardIsStatic(watchlist) &&
		Controller.getLoginStatus()
	) {
		rightButtons.push(ADD_BTN);
	}

	return rightButtons;
}

function* checkNewsToday() {
	const listSymbol = yield getListCode();
	const stringQuery = listSymbol.join(',');

	const checkUrl = yield call(Api.checkNewsTodayUrl, stringQuery);
	const newsToday = yield call(Api.requestData, checkUrl);
	yield put(WatchListActions.updateNewsToday(newsToday));
	yield call(NewsBusiness.subNewsBySymbol, stringQuery);
}

function* reloadData({ priceBoardId }) {
	const { id } = yield select(state => state.trade);
	yield unsubLv1Realtime(id);

	const isStatic = func.checkCurrentPriceboardIsStatic(priceBoardId);
	let currentPriceBoard = {};
	if (isStatic) {
		currentPriceBoard = yield getPriceBoardInStatic(priceBoardId);
	} else {
		currentPriceBoard = func.getPriceboardDetailInPriceBoard(priceboardId);
	}

	yield put(WatchListActions.listenWatchlist());

	// getSymbolInfoAndCheckNewsToday
	const listSymbol = yield getListCode();
	yield all([
		call(Business.getSymbolInfoMultiExchange, listSymbol),
		checkNewsToday()
	]);

	yield subLv1Realtime(id);

	yield put(WatchListActions.updatePriceBoard(currentPriceBoard)); //  as snapshot
}

function* changePriceboard({ data: priceBoardId }) {
	const { priceBoardDetail: { watchlist } = {} } = yield select(
		state => state.trade
	);

	if (priceBoardId === watchlist) return;

	const newTitle = func.getPriceboardNameInPriceBoard(priceBoardId);
	yield put(WatchListActions.setSubTitleWatchlist(newTitle));

	yield put(WatchListActions.updateLoadingFormState(true));

	yield put(WatchListActions.setNavButtonWatchlist());

	// reloadDataWhenSelectedPriceboardOrReconnectSuccess
	yield reloadData({ priceBoardId });
}

function* getPriceBoardInStatic(priceBoardId) {
	// processPriceboardStatic
	const data = yield call(Business.getSymbolPriceboardStatic, priceBoardId);
	const defaultPriceboardStatic = yield call(
		func.getPriceboardStaticById,
		priceBoardId
	);

	return {
		...defaultPriceboardStatic,
		...data
	};
}

function* getPriceBoardInPersonal(priceBoardId) {
	const userId = dataStorage.user_id;

	// loadPriceBoard from Api
	const { data: priceBoard } = yield call(Api.getPriceBoard, userId);
	// return priceBoard with id === priceBoardId
	let result = _.find(priceBoard, item => item.watchlist === priceBoardId);
	if (result) return result;

	// if not find with default priceBoardId
	const defaultPriceBoard = yield call(func.getPriceboardDefault);
	const { watchlist: defaultPriceBoardId } = defaultPriceBoard;
	result = _.find(priceBoard, item => item.watchlist === defaultPriceBoardId);
	if (result) return result;

	// if not create priceBoardDetail as default
	const item = {
		...defaultPriceBoard,
		user_id: userId,
		value: []
	};

	const data = yield call(Business.createPriceBoardDetail, userId, item);
	if (data.errorCode) {
		logDevice(
			'info',
			`createPriceBoardDefault fail with data: ${JSON.stringify(item)}`
		);
		return {};
	}
	yield call(func.storeLastestPriceBoard, userId, data.watchlist);
	return data;
}

export function* setNavButtonWatchlist({ param }) {
	if (_.isEmpty(param)) {
		const navButton = yield getNavButton();
		yield put(WatchListActions.setNavButtonWatchlist(navButton));
	}
}

export function* listenWatchlist() {
	try {
		const { watchlistChannel, idForm: id } = yield select(
			state => state.trade
		);
		const cbChannel = yield call(sagaChannel, buffers.sliding(3));

		Emitter.addListener(watchlistChannel, id, () =>
			cbChannel.put({
				type: 'WATCHLIST_CB',
				data: id
			})
		);

		yield takeEvery(cbChannel, changeWatchlist);
	} catch (error) { }
}

export function* getPriceSnapshot(params) {
	const { priceBoardDetail: { value = [] } = {} } =
		params || (yield select(state => state.trade));
	const newPriceBoardValue = _.orderBy(value, ['rank'], ['desc']);

	if (!_.isEmpty(newPriceBoardValue)) {
		// get Snapshot Price
		const listSymbolObj = _.map(newPriceBoardValue, ({ symbol }) => ({
			exchange: func.getExchangeSymbol(symbol),
			symbol
		}));
		const snapshot = yield call(
			UserPriceSource.loadDataPrice,
			Enum.STREAMING_MARKET_TYPE.QUOTE,
			listSymbolObj
		);

		// get new ListPrice
		const dicPrice = {};
		_.forEach(
			snapshot,
			item => item.symbol && (dicPrice[item.symbol] = item)
		);

		const newListPrice = [];
		_.forEach(newPriceBoardValue, ({ symbol }) => {
			newListPrice.push(dicPrice[symbol] || { symbol });
		});

		yield put(WatchListActions.updateListPrice(newListPrice));
	}
}

export function* listenPriceboard() {
	const {
		priceBoardChannel,
		priceBoardDetail: { watchlist } = {},
		idForm: id
	} = yield select(state => state.trade);
	const cbChannel = yield call(sagaChannel, buffers.sliding(3));

	Emitter.addListener(priceBoardChannel, id, priceBoardId => {
		if (priceBoardId !== watchlist) {
			cbChannel.put({
				type: 'PRICEBOARD_CB',
				data: priceBoardId
			});
		}
	});

	yield takeEvery(cbChannel, changePriceboard);
}

export function* initWatchlistComp({ id }) {
	let priceBoardDetail = {};

	// #region getCurrentPriceBoard

	// get lastest PriceBoardId
	let priceBoardId = Enum.PRICEBOARD_STATIC_ID.SP_20;

	const isLogged = yield call(Controller.getLoginStatus);
	if (isLogged) {
		const latestPriceBoardId = yield call(
			func.getLastestPriceBoard,
			dataStorage.user_id
		);
		const defaultPriceBoardId = Enum.WATCHLIST.USER_WATCHLIST;

		priceBoardId = latestPriceBoardId || defaultPriceBoardId;
	}

	// check priceBoardId is static and get priceBoardDetail
	const isStatic = func.checkCurrentPriceboardIsStatic(priceBoardId);
	if (isStatic) {
		priceBoardDetail = yield getPriceBoardInStatic(priceBoardId);
	} else {
		priceBoardDetail = yield getPriceBoardInPersonal(priceBoardId);
	}

	const { watchlist } = priceBoardDetail;
	yield call(func.setCurrentPriceboardId, watchlist, true);

	const newTitle = func.getPriceboardNameInPriceBoard(watchlist);
	yield put(WatchListActions.setSubTitleWatchlist(newTitle));

	// #endregion

	yield put(WatchListActions.listenWatchlist());
	yield put(WatchListActions.listenPriceboard());

	// getSymbolInfoAndCheckNewsToday
	const listSymbol = yield getListCode();
	yield all([
		call(Business.getSymbolInfoMultiExchange, listSymbol),
		checkNewsToday()
	]);

	yield subLv1Realtime(id);

	yield put(WatchListActions.updatePriceBoard(priceBoardDetail)); //  as snapshot
}

export function* reloadWatchlistFromBg() {
	const channelLoadingTrade = StreamingBusiness.getChannelLoadingTrade();
	yield put(WatchListActions.updateLoadingPriceState(true));
	Emitter.emit(channelLoadingTrade, true);
	yield call(getPriceSnapshot);
	yield put(WatchListActions.updateLoadingPriceState(false));
	Emitter.emit(channelLoadingTrade, false);
	// feature :  wait done => timeUpdatedRef
}

export function* updateLoadingPriceState() {
	yield put(WatchListActions.setNavButtonWatchlist());
}

export function* appChangeState({ isConnected }) {
	if (isConnected) {
		const currentPriceBoardId = func.getCurrentPriceboardId();
		yield reloadData({ priceBoardId: currentPriceBoardId });
	}
}

export function* unSubAll() {
	const { idForm: id } = yield select(state => state.trade);
	yield unsubLv1Realtime(id);
	yield call(NewsBusiness.unSubNewByScreen, 'news', TAB_NEWS.RELATED);
}
