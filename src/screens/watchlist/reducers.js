import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

import SCREEN from './screenEnum';
import I18n from '~/modules/language';
import Enum from '~/enum';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	watchListSetTitle: ['subTitle', 'mainTitle'],
	watchListSetScreenActived: ['scr', 'params'],
	watchListGetNewToday: ['listSymbol', 'cb'],
	watchListChangeNewToday: ['data'],
	watchListChangeInfoSelected: ['data'],
	watchListChangeLoadingState: ['isLoading', 'isState'],
	watchListChangeDetailLoadingState: ['isLoading'],
	watchListChangeSortType: ['sortType'],
	watchListReset: null,
	watchListSearchSymbol: ['textSearch'],
	watchListChangeNewOrderLoadingState: ['isLoading'],
	setDelayData: ['data']
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	listSymbol: [],
	subTitle: '',
	mainTitle: I18n.t('WatchListTitle'),
	screenSelected: SCREEN.WATCHLIST,
	screenParams: {},
	newsToday: {},
	infoSelected: 'changePercent',
	isLoading: true,
	isLoadingState: true,
	detailLoading: true,
	newOrderLoading: false,
	sortType: -1,
	textSearch: '',
	delayData: []
});
/* ------------- Reducers ------------- */
export const watchListChangeSortType = (state, { sortType }) =>
	state.merge({ sortType });

export const watchListSetTitle = (state, { subTitle, mainTitle }) => {
	const obj = {};
	if (subTitle || subTitle === '') {
		obj.subTitle = subTitle;
	}
	if (mainTitle || mainTitle === '') {
		obj.mainTitle = mainTitle;
	}
	return state.merge(obj);
};

export const watchListSetScreenActived = (state, { scr, params }) => {
	const curScr = scr || SCREEN.WATCHLIST;
	if (params) {
		const obj = {};
		obj[curScr] = params;
		return state.merge(
			{ screenSelected: curScr, screenParams: obj },
			{ deep: true }
		);
	}
	return state.merge({ screenSelected: curScr });
};

export const watchListChangeNewToday = (state, { data }) =>
	state.merge(
		{
			newsToday: data
		},
		{ deep: true }
	);

export const watchListChangeInfoSelected = (state, { data }) => {
	if (data) {
		return state.merge({
			infoSelected: data
		});
	}
	let result = null;
	switch (state.infoSelected) {
		case 'changePoint':
			result = 'changePercent';
			break;
		case 'changePercent':
			result = 'quantity';
			break;
		case 'quantity':
			result = 'changePoint';
			break;
		default:
			break;
	}

	return state.merge({
		infoSelected: result || state.infoSelected
	});
};
export const watchListGetNewToday = (state) => state;

export const watchListChangeLoadingState = (state, { isLoading, isState }) => {
	if (isLoading !== state.isLoadingState && isState) {
		return state.merge({ isLoadingState: isLoading });
	}
	if (isLoading !== state.isLoading) return state.merge({ isLoading });
	return state;
};
export const watchListChangeNewOrderLoadingState = (state, { isLoading }) => {
	return state.merge({ newOrderLoading: isLoading });
};
export const watchListChangeDetailLoadingState = (state, { isLoading }) =>
	state.merge({ detailLoading: isLoading });

export const watchListReset = (state) => INITIAL_STATE;
export const watchListSearchSymbol = (state, { textSearch }) => {
	return state.merge({ textSearch });
};

export const setDelayData = (state, { data }) => {
	return state.merge({ delayData: data });
};

export const reducer = createReducer(INITIAL_STATE, {
	[Types.WATCH_LIST_SET_TITLE]: watchListSetTitle,
	[Types.WATCH_LIST_SET_SCREEN_ACTIVED]: watchListSetScreenActived,

	[Types.WATCH_LIST_GET_NEW_TODAY]: watchListGetNewToday,
	[Types.WATCH_LIST_CHANGE_NEW_TODAY]: watchListChangeNewToday,
	[Types.WATCH_LIST_CHANGE_INFO_SELECTED]: watchListChangeInfoSelected,
	[Types.WATCH_LIST_CHANGE_LOADING_STATE]: watchListChangeLoadingState,
	[Types.WATCH_LIST_CHANGE_DETAIL_LOADING_STATE]: watchListChangeDetailLoadingState,
	[Types.WATCH_LIST_CHANGE_NEW_ORDER_LOADING_STATE]: watchListChangeNewOrderLoadingState,
	[Types.WATCH_LIST_CHANGE_SORT_TYPE]: watchListChangeSortType,
	[Types.WATCH_LIST_RESET]: watchListReset,
	[Types.WATCH_LIST_SEARCH_SYMBOL]: watchListSearchSymbol,
	[Types.SET_DELAY_DATA]: setDelayData
});
