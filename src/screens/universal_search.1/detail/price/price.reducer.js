import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

import { logDevice } from '~/lib/base/functionUtil';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	changePrice: ['priceObject'],
	changeSymbolInfo: ['symbolInfo'],
	changePriceLoadingState: ['isLoading'],
	changeChartListData: ['listData'],
	getCompany: null,
	changeCompany: ['company'],
	changePlusTitle: ['title', 'isSelect'],
	setSymbolUse: ['symbol'],

	changeTradingHalt: ['tradingHalt'],
	priceUniListenHalt: ['id'],
	priceUniUpdateHalt: null,

	priceUniSubHistorical: ['id'],
	priceUniUnsubHistorical: ['id'],

	priceUniUpdatePrice: null,
	priceUniListenPrice: ['id'],
	priceUniDeletePriceListener: ['id'],
	priceUniCheckNewsToday: null,
	checkUserWatchList: null,
	changeNewsToday: ['isNewsToday'],
	priceUniGetAnnouncement: null,
	priceUniOnPressWatchList: null,
	priceUniCheckNewsTodaySuccess: null,
	priceUniSubFavorites: ['id']
});

export const PriceTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
	priceObject: {},
	symbolInfo: {},
	isLoading: true,
	listData: [],
	company: null,
	plusButton: '',
	isSelect: false,
	tradingHalt: false,
	isNewsToday: false
});

/* ------------- Reducers ------------- */
// request the avatar for a user
export const changePrice = (state, { priceObject, type }) => {
	const { exchange, symbol } = priceObject || {};
	if (exchange === state.priceObject.exchange && symbol === state.priceObject.symbol) {
		return state.merge({ priceObject, type }, { deep: true });
	}
	return state.merge({ priceObject, type });
};

export const changeSymbolInfo = (state, { symbolInfo, type }) =>
	state.merge({ symbolInfo, type });
export const changePriceLoadingState = (state, { isLoading, type }) => {
	if (isLoading) {
		return state.merge({ priceObject: {}, isLoading, type });
	}
	return state.merge({ isLoading, type });
};
export const changeChartListData = (state, { listData, type }) =>
	state.merge({ listData, type });
export const changeCompany = (state, { company, type }) =>
	state.merge({ company, type });
export const changePlusTitle = (state, { title, isSelect, type }) => {
	const curIsSelect = _.isUndefined(isSelect) ? state.isSelect : isSelect;
	return state.merge({ plusButton: title, isSelect: curIsSelect, type });
};
export const changeTradingHalt = (state, { tradingHalt, type }) => {
	logDevice('info', `Updated Halt of ${state.symbol}: ${tradingHalt}`);
	return state.merge({ tradingHalt, type });
};

export const changeNewsToday = (state, { isNewsToday, type }) =>
	state.merge({ isNewsToday, type });

export const getCompany = (state, { type }) => state.merge({ type });
export const priceUniListenHalt = (state, { type }) => state.merge({ type });
export const priceUniSubHistorical = (state, { type }) => state.merge({ type });
export const priceUniUnsubHistorical = (state, { type }) =>
	state.merge({ type });

export const priceUniListenPrice = (state, { type }) => state.merge({ type });
export const priceUniDeletePriceListener = (state, { type }) =>
	state.merge({ type });

export const priceUniUpdateHalt = (state, { type }) => state.merge({ type });
export const priceUniUpdatePrice = (state, { type }) =>
	state.merge({
		priceObject: {},
		type
	});
export const checkUserWatchList = (state, { type }) => state.merge({ type });
export const priceUniGetAnnouncement = (state, { type }) =>
	state.merge({ type });
export const priceUniCheckNewsToday = (state, { type }) =>
	state.merge({ type });
export const priceUniOnPressWatchList = (state, { type }) =>
	state.merge({ type });
export const priceUniSubFavorites = (state, { type }) => state.merge({ type });
export const priceUniCheckNewsTodaySuccess = (state, { type }) =>
	state.merge({ type });

export const reducer = createReducer(INITIAL_STATE, {
	[Types.CHANGE_PRICE]: changePrice,
	[Types.CHANGE_PRICE_LOADING_STATE]: changePriceLoadingState,
	[Types.CHANGE_CHART_LIST_DATA]: changeChartListData,
	[Types.GET_COMPANY]: getCompany,
	[Types.CHANGE_COMPANY]: changeCompany,
	[Types.CHANGE_PLUS_TITLE]: changePlusTitle,
	[Types.CHANGE_TRADING_HALT]: changeTradingHalt,
	[Types.PRICE_UNI_LISTEN_HALT]: priceUniListenHalt,
	[Types.PRICE_UNI_SUB_HISTORICAL]: priceUniSubHistorical,
	[Types.PRICE_UNI_UNSUB_HISTORICAL]: priceUniUnsubHistorical,

	[Types.PRICE_UNI_LISTEN_PRICE]: priceUniListenPrice,
	[Types.PRICE_UNI_DELETE_PRICE_LISTENER]: priceUniDeletePriceListener,

	[Types.PRICE_UNI_UPDATE_HALT]: priceUniUpdateHalt,
	[Types.PRICE_UNI_UPDATE_PRICE]: priceUniUpdatePrice,
	[Types.PRICE_UNI_CHECK_NEWS_TODAY]: priceUniCheckNewsToday,
	[Types.PRICE_UNI_CHECK_NEWS_TODAY_SUCCESS]: priceUniCheckNewsTodaySuccess,
	[Types.CHANGE_NEWS_TODAY]: changeNewsToday,
	[Types.CHECK_USER_WATCH_LIST]: checkUserWatchList,
	[Types.PRICE_UNI_GET_ANNOUNCEMENT]: priceUniGetAnnouncement,
	[Types.PRICE_UNI_ON_PRESS_WATCH_LIST]: priceUniOnPressWatchList,
	[Types.PRICE_UNI_SUB_FAVORITES]: priceUniSubFavorites
});
