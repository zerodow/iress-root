import {
	call,
	put,
	select,
	take,
	takeLatest,
	race,
	flush
} from 'redux-saga/effects';
import { channel as sagaChannel, buffers } from 'redux-saga';
import _ from 'lodash';
import * as Emitter from '@lib/vietnam-emitter';

import I18n from '~/modules/language/';
import * as StreamingBusiness from '~/streaming/streaming_business';
import Enum from '~/enum';
import { func, dataStorage } from '~/storage';
import {
	getSymbolInfoApi,
	logDevice,
	checkTradingHalt,
	deleteNotiNewsByCode,
	logAndReport
} from '~/lib/base/functionUtil';
import PriceActions from './price.reducer';
import PriceChartActions from './price_chart.reducer';
import * as streamChannel from '~/streaming/channel';
import * as Business from '~/business';
import * as Historical from '~/streaming/historical';
import * as api from '~/api';
import * as Util from '~/util';
import * as Controller from '~/memory/controller';
import * as UserPriceSource from '~/userPriceSource';
import MarketActions from '~s/market_depth/swiper_market_depth.reducer';

const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;
const STREAMING_MARKET_TYPE = Enum.STREAMING_MARKET_TYPE;

export function* takeEvery(requestChan, cb) {
	while (true) {
		const action = yield take(requestChan);
		const { task, cancel } = yield race({
			task: call(cb, action),
			cancel: take(requestChan)
		});

		if (cancel !== undefined) {
			const actions = yield flush(requestChan);
			// Don't need these actions, do nothing.
		}
	}
}

export function* getCompany() {
	const { symbol } = yield select(state => state.searchDetail);

	let company = '';
	let equity = dataStorage.symbolEquity[symbol] || {};
	if (_.isEmpty(equity)) {
		const cbChannel = yield call(sagaChannel, buffers.sliding(3));
		yield call(getSymbolInfoApi, symbol, () =>
			cbChannel.put('CALL_GET_COMPANY_CB')
		);
		yield take(cbChannel);
		equity = dataStorage.symbolEquity[symbol] || {};
	}
	company = equity.company_name || equity.company || '';
	// put
	yield put(PriceActions.changeCompany(company));
}

function* getBaseInfo() {
	const { filterType } = yield select(state => state.priceChart);
	const { symbol } = yield select(state => state.searchDetail);
	const exchange = func.getExchangeSymbol(symbol);
	const interval = BAR_BY_PRICE_TYPE[filterType];
	return {
		symbol,
		exchange,
		interval
	};
}

function* childAdded() {
	const { lang } = yield select(state => state.setting);
	yield put(
		PriceActions.changePlusTitle(
			`- ${I18n.t('favorites', { locale: lang })}`,
			true
		)
	);
}

function* childRemoved() {
	const { lang } = yield select(state => state.setting);
	yield put(
		PriceActions.changePlusTitle(
			`+ ${I18n.t('favorites', { locale: lang })}`,
			false
		)
	);
}

function* checkUsrWatchListCB({ type }) {
	if (type === 'USER_WATCH_LIST_CHILD_ADDED') {
		yield childAdded();
	} else yield childRemoved();
}

export function* checkUserWatchList() {
	const { symbol } = yield select(state => state.searchDetail);
	const userId = Controller.getUserId();
	const cbChannel = yield call(sagaChannel, buffers.sliding(3));

	const apiType = 'check-exist';

	api.actionUserWatchListSymbol(
		userId,
		symbol,
		apiType,
		() => cbChannel.put({ type: 'USER_WATCH_LIST_CHILD_ADDED' }),
		() => cbChannel.put({ type: 'USER_WATCH_LIST_CHILD_REMOVED' })
	);
	yield takeLatest(cbChannel, checkUsrWatchListCB);
}

export function* priceUniCheckNewsToday() {
	const { symbol } = yield select(state => state.searchDetail);
	try {
		const checkUrl = yield call(api.checkNewsTodayUrl, symbol);
		const data = yield call(api.requestData, checkUrl);
		const firstKey = _.keys(data)[0] || '';
		const isNewsToday = data[firstKey];
		if (isNewsToday) {
			dataStorage.listNewsToday[firstKey] = true;
		}
		yield put(PriceActions.changeNewsToday(isNewsToday));
		yield put(PriceActions.priceUniCheckNewsTodaySuccess());
	} catch (error) {}
}

// handle TradingHalt
function* getChangeHalt() {
	const { symbol } = yield select(state => state.searchDetail);
	return StreamingBusiness.getChannelHalt(symbol);
}

export function* updateHalt({ data }) {
	const { symbol } = yield select(state => state.searchDetail);
	logDevice(
		'info',
		`updateHalt for row_news with data: ${data ? JSON.stringify(data) : ''}`
	);
	let tradingHalt = {};
	try {
		tradingHalt = yield call(checkTradingHalt, symbol);
	} catch (error) {
		logDevice('info', `PRICE UNIVERSAL TRADING HALT ERROR: ${error}`);
		console.log(error);
	}
	yield put(PriceActions.changeTradingHalt(tradingHalt, symbol));
}

export function* priceUniListenHalt({ id = 'priceUniID1_Halt' }) {
	const channel = yield getChangeHalt();

	const cbChannel = yield call(sagaChannel, buffers.sliding(3));
	Emitter.deleteByIdEvent(id);
	Emitter.addListener(channel, id, data => {
		cbChannel.put({
			type: 'CALL_HALT_CB',
			data
		});
	});
	yield takeEvery(cbChannel, updateHalt);
}

// handle Historical

function* getChangeHistorical() {
	const { symbol, exchange, interval } = yield getBaseInfo();
	if (!symbol || !exchange || !interval) return;

	const channel = yield call(
		StreamingBusiness.getChannelHistorical,
		exchange,
		symbol,
		interval
	);

	return channel;
}

function* updateHistorical({ data }) {
	const { isConnected } = yield select(state => state.app);
	if (!isConnected) return;
	yield put(PriceChartActions.mergeNewDataHistorical(data));
}

export function* priceUniListenHistorical({ id }) {
	const channel = yield getChangeHistorical();
	if (!channel) return;

	const cbChannel = yield call(sagaChannel, buffers.sliding(3));

	Emitter.addListener(channel, id, data => {
		cbChannel.put({
			type: 'CALL_HISTORICAL_CB',
			data
		});
	});
	yield takeEvery(cbChannel, updateHistorical);
}

export function* priceUniSubHistorical({ id = 'priceUniID' }) {
	const { symbol, exchange, interval } = yield getBaseInfo();
	if (!symbol || !exchange || !interval) return;
	yield priceUniUnsubHistorical({ id });

	yield priceUniListenHistorical({ id });

	Historical.sub(
		[
			{
				symbol,
				exchange,
				interval
			}
		],
		id,
		() => null
	);
}

export function* priceUniUnsubHistorical({ id }) {
	const { symbol, exchange, interval } = yield getBaseInfo();
	if (!symbol || !exchange || !interval) return;

	const channel = yield call(
		StreamingBusiness.getChannelHistorical,
		exchange,
		symbol,
		interval
	);
	Emitter.deleteListener(channel, id);

	Historical.unsub(
		[
			{
				symbol,
				exchange,
				interval
			}
		],
		id
	);
}

// handle Price

function* getChannelPrice() {
	const { symbol, exchange } = yield getBaseInfo();
	if (!symbol || !exchange) return;
	const channel = yield call(
		StreamingBusiness.getChannelLv1,
		exchange,
		symbol
	);

	return channel;
}

export function* priceUniListenPrice({ id = 'priceUniID1' }) {
	const channel = yield getChannelPrice();
	const cbChannel = yield call(sagaChannel, buffers.sliding(3));

	// Emitter.deleteByIdEvent(id);

	Emitter.addListener(channel, id, data => {
		cbChannel.put({
			type: 'CALL_LV1_CB',
			data
		});
	});

	const changePrice = function*({ data = {} }) {
		const {
			indicative_price: indicativePrice,
			surplus_volume: surplusVolume,
			side
		} = data;
		yield put(
			MarketActions.setAutionPrice(indicativePrice, surplusVolume, side)
		);
		yield put(PriceActions.changePrice(data));
	};
	// while (true) {
	// 	const rs = yield take(cbChannel);
	// 	yield changePrice(rs);
	// }
	yield takeEvery(cbChannel, changePrice);
}

export function* priceUniDeletePriceListener({ id }) {
	const channel = yield getChannelPrice();
	Emitter.addListener(channel, id);
}

export function* updatePrice() {
	const { symbol, exchange } = yield getBaseInfo();
	if (!symbol || !exchange) return;

	const isPriceStreaming = Controller.isPriceStreaming();
	const arrPrice = yield call(
		UserPriceSource.loadDataPrice,
		STREAMING_MARKET_TYPE.QUOTE,
		[{ symbol, exchange }]
	);
	const priceObj = (arrPrice && arrPrice[0]) || {};
	yield put(PriceActions.changePrice(priceObj));
}
// -------

export function* priceUniGetAnnouncement() {
	const { symbol } = yield select(state => state.searchDetail);
	const newTxt = yield call(Util.encodeSymbol, symbol);
	const newType = Enum.TYPE_NEWS.RELATED;
	const pageID = 1;
	const pageSize = 3; // top 3
	let url = yield call(api.getNewsUrl, newType, '', newTxt, pageID, pageSize);
	url = `${url}&duration=week`;
	yield call(api.requestData, url);
	yield call(deleteNotiNewsByCode, symbol);
}

function* getText(text) {
	const { lang } = yield select(state => state.setting);
	return I18n.t(text, { locale: lang });
}

function* successCbOnAddToWatchList({ type, error }) {
	if (type === 'CB_ON_ADD_WATCH_LIST') {
		const { isSelect: isRemove } = yield select(state => state.price);
		const strFavorites = yield getText('favorites');
		if (isRemove) {
			yield put(PriceActions.changePlusTitle(`+ ${strFavorites}`, false));
		} else {
			yield put(PriceActions.changePlusTitle(`- ${strFavorites}`, true));
		}
	} else {
		// console.log(error);
	}
}

export function* priceUniOnPressWatchList() {
	const { symbol } = yield select(state => state.searchDetail);
	const { isSelect: isRemove } = yield select(state => state.price);
	try {
		const strRemoved = yield getText('Removed');
		const strAdded = yield getText('Added');
		yield put(
			PriceActions.changePlusTitle(isRemove ? strRemoved : strAdded)
		);
		if (isRemove) {
			yield call(Business.removeSymbolInFavorites, symbol, true);
		} else {
			yield call(Business.addSymbolToFavorites, symbol, true);
		}
		// const watchListName = 'Personal';
		// const cbChannel = yield call(sagaChannel);

		// api.updateUserWatchList(
		// 	Enum.WATCHLIST.USER_WATCHLIST,
		// 	watchListName,
		// 	[symbol],
		// 	() => cbChannel.put({ type: 'CB_ON_ADD_WATCH_LIST' }),
		// 	error => cbChannel.put({ type: 'CB_ERROR_ADD_WATCH_LIST', error }),
		// 	action,
		// 	index
		// );
		// yield takeLatest(cbChannel, successCbOnAddToWatchList);
	} catch (error) {
		logAndReport(
			'onAddToWatchList price exception',
			error,
			'onAddToWatchList price'
		);
	}
}
// Favorites

function* updateFavorites() {
	const { symbol } = yield select(state => state.searchDetail);
	const { isSelect } = yield select(state => state.price);
	const isSymbolInWatchlist = yield call(
		func.checkSymbolInPriceboardFavorites,
		symbol
	);

	logDevice(
		'info',
		` func updateFavorites isSymbolInWatchlist : ${isSymbolInWatchlist} , isSelect : ${isSelect}`
	);

	if (isSymbolInWatchlist === isSelect) return;
	const strFavories = yield getText('favorites');

	if (isSymbolInWatchlist) {
		yield put(PriceActions.changePlusTitle(`- ${strFavories}`, true));
	} else {
		yield put(PriceActions.changePlusTitle(`+ ${strFavories}`, false));
	}
}
export function* priceUniSubFavorites() {
	const channelName = yield call(
		streamChannel.getChannelWatchlistChanged,
		Enum.WATCHLIST.USER_WATCHLIST
	);

	const cbChannel = yield call(sagaChannel, buffers.sliding(3));

	Emitter.deleteByIdEvent('priceOptID');
	Emitter.addListener(channelName, 'priceOptID', () =>
		cbChannel.put('CALL_FAVORIES_CB')
	);

	yield takeEvery(cbChannel, updateFavorites);
}
