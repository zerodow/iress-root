import { takeLatest, all, takeEvery, fork } from 'redux-saga/effects';

import {
	priceChartChangeFilterType,
	priceChartChangeChartType,
	priceChartGetSnapshot,
	priceChartGetSnapshotSuccess,
	mergeNewDataHistorical
} from '@unis/detail/price/price_chart.saga';

import { getNewData } from '@unis/detail/new/search_new.saga';
import { loadDataOrders } from '@unis/detail/order/search_order.saga';
import { getDataPortfolio } from '@unis/detail/portfolio/search_portfolio.saga';
import {
	getCompany,
	priceUniListenHalt,
	priceUniSubHistorical,
	priceUniListenPrice,
	priceUniDeletePriceListener,
	updateHalt as priceUniUpdateHalt,
	updatePrice as priceUniUpdatePrice,
	checkUserWatchList,
	priceUniCheckNewsToday,
	priceUniUnsubHistorical,
	priceUniGetAnnouncement,
	priceUniOnPressWatchList,
	priceUniSubFavorites
} from '@unis/detail/price/price.saga';

import {
	subMarketDepth,
	updateMarketDepth,
	getMarketSnapshot
} from '../screens/market_depth/swiper_market_depth.saga';

import {
	getAllDataSearchDetail,
	subRealtimeSearchDetail,
	unSubRealtimeSearchDetail,
	searchDetailSubRealtime,
	searchDetailUnSubRealtime
} from '@unis/detail/search_detail.saga';

import {
	subSwiper10Trade,
	updateSwiper10Trade,
	getSnapshotSwiper10Trade
} from '../screens/market_depth/swiper_10_trades.saga';

import {
	listenWatchlist,
	listenPriceboard,
	initWatchlistComp,
	getPriceSnapshot,
	reloadWatchlistFromBg,
	updateLoadingPriceState,
	appChangeState,
	unSubAll
} from '../screens/trade.1/trade.saga';

import { getTopOrderTransaction } from '../screens/open_price/new_open_price.saga';
import {
	uniSearchGetHistory,
	uniSearchGetResult,
	uniSearchSetSymbolClass
} from '@unis/universal/search_universal.saga';

import {
	watchlistChangeScreen,
	getNewsToday
} from '../screens/watchlist/sagas.js';

import {
	getMarketExchange,
	getMarketGroup,
	getMarketWatchlist
} from '../screens/marketActivity/sagas.js';
import sagaNewOrder from '~/screens/new_order/Redux/saga.js'
export default function* root() {
	yield all([
		takeLatest('PRICE_CHART_CHANGE_CHART_TYPE', priceChartChangeChartType),
		takeLatest(
			'PRICE_CHART_CHANGE_FILTER_TYPE',
			priceChartChangeFilterType
		),
		takeLatest('PRICE_CHART_GET_SNAPSHOT', priceChartGetSnapshot),
		takeLatest('MERGE_NEW_DATA_HISTORICAL', mergeNewDataHistorical),
		takeLatest(
			'PRICE_CHART_GET_SNAPSHOT_SUCCESS',
			priceChartGetSnapshotSuccess
		),
		takeLatest(['GET_NEW_DATA', 'LOAD_MORE_NEW_DATA'], getNewData),
		takeEvery(['LOAD_DATA_ORDERS', 'LOAD_MORE_ORDER_DATA'], loadDataOrders),
		takeLatest('GET_DATA_PORTFOLIO', getDataPortfolio),
		takeLatest('GET_COMPANY', getCompany),
		takeLatest('GET_ALL_DATA_SEARCH_DETAIL', getAllDataSearchDetail),
		takeLatest('PRICE_UNI_LISTEN_HALT', priceUniListenHalt),
		takeLatest('PRICE_UNI_UPDATE_HALT', priceUniUpdateHalt),
		takeLatest('PRICE_UNI_UPDATE_PRICE', priceUniUpdatePrice),
		takeLatest('PRICE_UNI_UNSUB_HISTORICAL', priceUniUnsubHistorical),

		takeLatest('PRICE_UNI_SUB_HISTORICAL', priceUniSubHistorical),

		takeLatest('PRICE_UNI_LISTEN_PRICE', priceUniListenPrice),
		takeLatest(
			'PRICE_UNI_DELETE_PRICE_LISTENER',
			priceUniDeletePriceListener
		),

		takeLatest('CHECK_USER_WATCH_LIST', checkUserWatchList),
		takeLatest('PRICE_UNI_CHECK_NEWS_TODAY', priceUniCheckNewsToday),
		takeLatest('PRICE_UNI_GET_ANNOUNCEMENT', priceUniGetAnnouncement),
		takeLatest('PRICE_UNI_ON_PRESS_WATCH_LIST', priceUniOnPressWatchList),
		takeLatest('PRICE_UNI_SUB_FAVORITES', priceUniSubFavorites),

		takeLatest('SUB_MARKET_DEPTH', subMarketDepth),

		takeLatest('UPDATE_MARKET_DEPTH', updateMarketDepth),
		takeLatest('GET_MARKET_SNAPSHOT', getMarketSnapshot),

		takeLatest('SUB_SWIPER_TEN_TRADE', subSwiper10Trade),
		takeLatest('UPDATE_SWIPER_TEN_TRADE', updateSwiper10Trade),
		takeLatest('GET_SNAPSHOT_SWIPER_TEN_TRADE', getSnapshotSwiper10Trade),

		takeLatest('INIT_WATCHLIST_COMP', initWatchlistComp),
		takeLatest('UPDATE_PRICE_BOARD', getPriceSnapshot),
		takeLatest('GET_PRICE_SNAPSHOT', getPriceSnapshot),
		takeLatest('LISTEN_WATCHLIST', listenWatchlist),
		takeLatest('LISTEN_PRICEBOARD', listenPriceboard),

		takeLatest('SET_NAV_BUTTON_WATCHLIST', listenPriceboard),
		takeLatest('RELOAD_WATCHLIST_FROM_BG', reloadWatchlistFromBg),
		takeLatest('UPDATE_LOADING_PRICE_STATE', updateLoadingPriceState),
		takeLatest('APP_CHANGE_CONNECTION', appChangeState),
		takeLatest('UN_SUB_ALL', unSubAll),

		takeLatest('GET_TOP_ORDER_TRANSACTION', getTopOrderTransaction),

		takeLatest('SUB_REALTIME_SEARCH_DETAIL', subRealtimeSearchDetail),
		takeLatest('UN_SUB_REALTIME_SEARCH_DETAIL', unSubRealtimeSearchDetail),
		takeLatest('SEARCH_DETAIL_SUB_REALTIME', searchDetailSubRealtime),
		takeLatest('SEARCH_DETAIL_UN_SUB_REALTIME', searchDetailUnSubRealtime),

		takeLatest('UNI_SEARCH_GET_HISTORY', uniSearchGetHistory),
		takeLatest('UNI_SEARCH_GET_RESULT', uniSearchGetResult),
		takeLatest('UNI_SEARCH_SET_SYMBOL_CLASS', uniSearchSetSymbolClass),

		takeLatest('WATCH_LIST_SET_SCREEN_ACTIVED', watchlistChangeScreen),
		takeLatest('WATCH_LIST_GET_NEW_TODAY', getNewsToday),
		takeLatest('GET_MARKET_EXCHANGE', getMarketExchange),
		takeLatest('GET_MARKET_GROUP', getMarketGroup),
		takeLatest('GET_MARKET_WATCHLIST', getMarketWatchlist),
		fork(sagaNewOrder)
	]);
}
//
