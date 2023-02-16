import { channel } from 'redux-saga';
import _ from 'lodash';
import {
	select,
	put,
	takeEvery,
	call,
	take,
	retry,
	debounce,
	cancel,
	fork
} from 'redux-saga/effects';
import filterType from '~/constants/filter_type';
import * as Api from '~/api';
import * as AllMarket from '~/streaming/all_market';
import * as Lv1 from '~/streaming/lv1';
import * as Lv2 from '~/streaming/lv2';
import * as Cos from '~/streaming/cos';

import { func } from '~/storage';
import searchDetailActions from './search_detail.reducer';
import searchOrderActions, {
	SearchOrderTypes
} from './order/search_order.reducer';
import SearchNewActions, { SearchNewTypes } from './new/search_new.reducer';
import PortfolioActions, {
	SearchPortfolioTypes
} from './portfolio/search_portfolio.reducer';

import PriceActions, { PriceTypes } from './price/price.reducer';
import PriceChartActions, { ChartTypes } from './price/price_chart.reducer';
import * as UserPriceSource from '~/userPriceSource';
import * as StreamingBusiness from '~/streaming/streaming_business';
import MarketActions from '~s/market_depth/swiper_market_depth.reducer';
import SwiperActions from '~s/market_depth/swiper_10_trades.reducer';
import * as Util from '~/util';
import * as Controller from '~/memory/controller';

const { WORKING, STOPLOSS, FILLED, CANCELLED } = filterType;

let isLoadingChart = true;
let isCheckingNews = true;

const TIME_OUT = 20000;
const RECONNECT_TIME = 1000;

function* childLoaded() {
	const {
		searchNews,
		searchPortfolio,
		searchOrder,
		price,
		priceChart
	} = yield select(state => state);
	const { isLoadingNews } = searchNews;

	const { isLoading: isLoadingPortfolio } = searchPortfolio;

	const { listOrderData } = searchOrder;
	const { isLoading: isLoadingWork } = listOrderData[WORKING];
	const { isLoading: isLoadingStop } = listOrderData[STOPLOSS];
	const { isLoading: isLoadingFill } = listOrderData[FILLED];
	const { isLoading: isLoadingCancel } = listOrderData[CANCELLED];

	const { isLoading: isLoadingPrice, type: priceType } = price;
	const { type: chartType } = priceChart;

	if (priceType === PriceTypes.PRICE_UNI_CHECK_NEWS_TODAY_SUCCESS) {
		isCheckingNews = false;
	}

	if (chartType === ChartTypes.PRICE_CHART_SET_DATA) {
		isLoadingChart = false;
	}

	if (
		!isLoadingNews &&
		// !isLoadingPortfolio &&
		// !isLoadingWork &&
		// !isLoadingStop &&
		// !isLoadingFill &&
		// !isLoadingCancel &&
		!isLoadingPrice &&
		!isCheckingNews &&
		!isLoadingChart
	) {
		// yield cancel();
		yield put(searchDetailActions.getAllDataSearchDetailSuccess());
	}
}

export function* getAllDataSearchDetail() {
	const { symbol } = yield select(state => state.searchDetail);
	if (_.isNil(symbol) || symbol === '') {
		yield put(searchDetailActions.getAllDataSearchDetailSuccess());
	}
	isLoadingChart = true;
	isCheckingNews = true;

	yield put(PriceActions.priceUniCheckNewsToday());
	// wait loaded is change isLoading
	yield takeEvery(
		[
			SearchOrderTypes.SET_LIST_ORDER_DATA,
			SearchOrderTypes.RESET_ORDER_DATA,
			SearchNewTypes.GET_NEW_DATA_SUCCESS,
			SearchPortfolioTypes.GET_DATA_PORTFOLIO_SUCCESS,
			PriceTypes.CHANGE_PRICE,
			PriceTypes.PRICE_UNI_CHECK_NEWS_TODAY_SUCCESS,
			ChartTypes.PRICE_CHART_SET_DATA
		],
		childLoaded
	);

	// Get snapshot quote, depth, trades
	// set loading state to True
	yield put(PriceActions.changePriceLoadingState(true));
	yield put(SwiperActions.changeTenTradeLoadingState(true));
	yield put(MarketActions.changeDepthLoadingState(true));

	const data = yield call(UserPriceSource.loadDataAOIPrice, [
		{
			exchange: func.getExchangeSymbol(symbol),
			symbol
		}
	]);

	const allData = data[0] || {};
	const { quote, depth, trades } = allData;

	// set loading state to False
	yield put(PriceActions.changePriceLoadingState(false));
	yield put(SwiperActions.changeTenTradeLoadingState(false));
	yield put(MarketActions.changeDepthLoadingState(false));

	// #region update data
	yield put(PriceActions.changePrice(quote));

	const {
		indicative_price: indicativePrice,
		surplus_volume: surplusVolume,
		side
	} = quote || {};

	const { Ask, ask = [], Bid, bid = [] } = depth || {};
	yield put(MarketActions.setListAskBid(Ask || ask, Bid || bid));
	yield put(
		MarketActions.setAutionPrice(indicativePrice, surplusVolume, side)
	);
	yield put(MarketActions.updateMarketDepth());

	yield put(SwiperActions.updateSwiperTenTrade(trades));
	// #endregion
}

let isKeeping = null;

export function* searchDetailSubRealtime() {
	if (!Controller.isPriceStreaming()) return;

	const { realtimeChannel, symbol } = yield select(
		state => state.searchDetail
	);
	if (isKeeping === symbol) return;
	isKeeping = symbol;
	setTimeout(() => {
		isKeeping = null;
	}, 100);

	if (realtimeChannel) {
		yield put(searchDetailActions.searchDetailUnSubRealtime());
		yield take('SEARCH_DETAIL_UN_SUB_REALTIME_SUCCESS');
	}

	const exchange = func.getExchangeSymbol(symbol);

	if (!symbol || !exchange) return;

	const cbChannel = yield channel();
	AllMarket.setIsAIO(true);
	AllMarket.sub([{ symbol, exchange }], 'SearchDetailIdForm', () =>
		cbChannel.put('CB_SUB_REALTIME')
	);

	yield take(cbChannel);
	yield put(
		searchDetailActions.searchDetailSubRealtimeSuccess({
			symbol,
			exchange
		})
	);
}

export function* searchDetailUnSubRealtime({ symbol: symbolAsParams }) {
	if (!Controller.isPriceStreaming()) return;

	let symbol;
	let exchange;
	if (_.isNil(symbolAsParams)) {
		const { realtimeChannel = {} } = yield select(
			state => state.searchDetail
		);
		symbol = realtimeChannel.symbol;
		exchange = realtimeChannel.exchange;
	} else {
		symbol = symbolAsParams;
		exchange = func.getExchangeSymbol(symbol);
	}
	if (!symbol || !exchange) return;

	const cbChannel = yield channel();
	AllMarket.unsub([{ symbol, exchange }], 'SearchDetailIdForm', () =>
		cbChannel.put('CB_UN_SUB_REALTIME')
	);

	yield take(cbChannel);
	yield put(searchDetailActions.searchDetailUnSubRealtimeSuccess());
}

// #region new Request

function* longPollingRequest(cbChannel, url, Authorization) {
	const xhr = new XMLHttpRequest();
	let firstTime = true;

	xhr.open('GET', url, true);
	xhr.onreadystatechange = () => {
		switch (xhr.readyState) {
			case 2:
				if (!firstTime) return;
				firstTime = false;
				cbChannel.put({
					type: 'CB_ON_OPEN_SEARCH_DETAIL',
					data: xhr || {}
				});
				break;
			case 3:
				cbChannel.put({
					type: 'CB_ON_PROGRESS_SEARCH_DETAIL',
					data: xhr || {}
				});
				break;
			case 4:
				if (xhr.status !== 200) return;
				cbChannel.put({
					type: 'CB_ON_ERROR_SEARCH_DETAIL',
					data: xhr.responseText || ''
				});
				break;
			default:
				break;
		}
	};

	xhr.addEventListener('error', error =>
		cbChannel.put({
			type: 'CB_ON_ERROR_SEARCH_DETAIL',
			data: error
		})
	);
	xhr.setRequestHeader('Authorization', Authorization);
	xhr.setRequestHeader('Accept', 'text/event-stream');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.send();
}

const LIMIT_BUFFERS = 3;

function resetResponseXhr(xhr, txt = '') {
	xhr._response = txt;
}

function* processMsg(xhr, onMessage) {
	let responseText = xhr._response || '';
	responseText = responseText.trim();
	responseText = responseText.replace(/id:\s.*\n/g, '');
	const parts = responseText.split('\n');
	const lastIndex = parts.length - 1;

	for (let i = 0; i <= lastIndex; i++) {
		const line = parts[i];
		if (line.length === 0) continue;
		if (/^data:\s/.test(line)) {
			try {
				const obj = JSON.parse(line.replace(/^data:\s*/, ''));
				if (obj.time && obj.type === 'ping') continue;
				yield onMessage(obj);
				continue;
			} catch (error) {
				if (i === lastIndex) {
					return resetResponseXhr(xhr, line);
				}
			}
		}
		if (i !== lastIndex) continue;
		return line === ': hi' || /^id:\s/.test(line) || /^retry:\s/.test(line)
			? resetResponseXhr(xhr)
			: resetResponseXhr(xhr, line);
	}
	return resetResponseXhr(xhr);
}

function* controlRequest(cbChannel, url, Authorization, { type, data }) {
	// index += 1;
	switch (type) {
		case 'CB_ON_OPEN_SEARCH_DETAIL':
			yield put(searchDetailActions.onOpenSearchDetail());
			break;
		case 'CB_ON_PROGRESS_SEARCH_DETAIL':
			yield processMsg(data, function* (obj) {
				const {
					quote,
					depth,
					trades = [],
					symbol = '',
					exchange = ''
				} = obj;
				quote && Lv1.processData(quote);
				trades.length && Cos.processData(tradeData, symbol, exchange);
				if (depth.ask || depth.bid) {
					depth['symbol'] = symbol;
					depth['exchange'] = exchange;
					Lv2.processData(depth);
				}
			});
			yield longPollingRequest(cbChannel, url, Authorization);
			break;
		case 'CB_ON_ERROR_SEARCH_DETAIL':
			yield reconnect(cbChannel, url, Authorization);
			break;
		default:
			break;
	}
}

let dicForkFunc = null;

function* reconnect(cbChannel, url, Authorization) {
	const numCount = TIME_OUT / RECONNECT_TIME + 1;
	if (dicForkFunc) {
		yield cancel(dicForkFunc);
		dicForkFunc = null;
	}
	dicForkFunc = yield fork(function* () {
		yield retry(numCount, RECONNECT_TIME, function* () {
			yield longPollingRequest(cbChannel, url, Authorization);
			yield take('ON_OPEN_SEARCH_DETAIL');
			return 'connected';
		});
	});
}

// let index = 0;

// function* networkChange(cbChannel, url, Authorization) {
// 	const { isConnected } = yield select(state => state.app);
// 	if (isConnected) {
// 	}
// }

export function* subRealtimeSearchDetail() {
	// goi lai tu dung huy cac tac vu truoc do(tu unsub)

	//  #region request firstTime
	const { symbol } = yield select(state => state.searchDetail);
	const exchange = yield call(func.getExchangeSymbol, symbol);
	let enSymbol = encodeURIComponent(symbol);
	// Cập nhật link streaming business market data /price/v2 (ANZ -> ANZ.ASX)
	if (exchange && exchange === 'ASX') {
		enSymbol = `${enSymbol}.ASX`;
	}
	const url = yield call(Api.getAllStreamingMarketUrl, enSymbol);

	const {
		headers: { Authorization }
	} = yield call(StreamingBusiness.getOptionStream);

	const cbChannel = yield call(channel);
	Util.fakeLv1(
		[
			{
				symbol,
				exchange
			}
		],
		function (obj) {
			const {
				quote,
				depth = {},
				trades = [],
				symbol = '',
				exchange = ''
			} = obj;
			quote && Lv1.processData(quote);
			trades.length && Cos.processData(tradeData, symbol, exchange);
			if (depth.ask || depth.bid) {
				depth['symbol'] = symbol;
				depth['exchange'] = exchange;
				Lv2.processData(depth);
			}
		}
	);

	yield longPollingRequest(cbChannel, url, Authorization);
	//  #endregion

	const arrChannel = [];

	// #region listen status change of request
	const subChannel = yield takeEvery(
		cbChannel,
		controlRequest,
		cbChannel,
		url,
		Authorization
	);
	arrChannel.push(subChannel);
	// #endregion

	// #region reconnect if time out
	const timeoutChannel = yield debounce(
		TIME_OUT,
		cbChannel,
		reconnect,
		cbChannel,
		url,
		Authorization
	);
	arrChannel.push(timeoutChannel);
	// #endregion

	// sub change network =>  reconnect
	// const networkChannel = yield takeEvery(
	// 	'APP_CHANGE_CONNECTION',
	// 	networkChange,
	// 	cbChannel,
	// 	url,
	// 	Authorization
	// );

	// luu channel de huy
	yield put(searchDetailActions.changeSubChannel(arrChannel));
}

export function* unSubRealtimeSearchDetail() {
	const { arrChannel } = yield select(state => state.searchDetail);
	if (subChannel) {
		yield cancel(arrChannel);
		yield put(searchDetailActions.changeSubChannel(null));
	}
}

// #endregion
