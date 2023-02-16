import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';
import * as Emitter from '@lib/vietnam-emitter';

import { dataStorage, func } from '../../storage';
import * as StreamingBusiness from '../../streaming/channel';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	initWatchlistComp: ['id'],
	listenWatchlist: null,
	listenPriceboard: null,
	updatePriceBoard: ['priceBoardDetail'],
	updateNewsToday: ['newsToday'],
	updateListPrice: ['listPrice'],
	setSubTitleWatchlist: ['param'],
	setNavButtonWatchlist: ['param'],
	getPriceSnapshot: null,
	updateLoadingFormState: ['isLoading'],
	updateLoadingPriceState: ['isLoading'],
	unSubAll: null,
	reloadWatchlistFromBg: null
});

export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
	idForm: null,
	watchlistChannel: null,
	priceBoardChannel: null,

	priceBoardDetail: {},
	listPrice: [],
	isLoadingForm: true,
	isLoadingPrice: false,
	newsToday: {},
	navSetSub: () => null,
	navSetButton: () => null
});

/* ------------- Reducers ------------- */
// request the avatar for a user
export const listenWatchlist = (state, { id }) => {
	const { watchlistChannel, priceBoardDetail: { watchlist } = {} } = state;
	if (watchlistChannel) {
		Emitter.deleteListener(watchlistChannel, id);
	}

	const newChannel = StreamingBusiness.getChannelWatchlistChanged(watchlist);
	return state.merge({ watchlistChannel: newChannel });
};

export const listenPriceboard = (state, { id }) => {
	const { priceBoardChannel } = state;
	if (priceBoardChannel) {
		Emitter.deleteListener(priceBoardChannel, id);
	}

	const newChannel = StreamingBusiness.getChannelSelectedPriceboard();
	return state.merge({ priceBoardChannel: newChannel });
};

export const setSubTitleWatchlist = (state, { param }) => {
	if (_.isFunction(param)) {
		return state.merge({ navSetSub: param });
	} else {
		const { watchlist } = state.priceBoardDetail || {};
		const subtitle = param || func.getPriceboardNameInPriceBoard(watchlist);

		state.navSetSub(subtitle);
		return state;
	}
};

export const setNavButtonWatchlist = (state, { param }) => {
	if (_.isFunction(param)) {
		return state.merge({ navSetButton: param });
	}
	return state;
};

export const updatePriceBoard = (state, { priceBoardDetail }) =>
	state.merge({ priceBoardDetail });
export const updateNewsToday = (state, { newsToday }) =>
	state.merge({ newsToday });
export const getPriceSnapshot = state => state;
export const updateListPrice = (state, { listPrice }) =>
	state.merge({ listPrice, isLoadingForm: false });

export const initWatchlistComp = (state, { id }) => state.merge({ idForm: id });

export const updateLoadingFormState = (state, { isLoading }) =>
	state.merge({ isLoadingForm: isLoading });

export const updateLoadingPriceState = (state, { isLoading }) =>
	state.merge({ isLoadingPrice: isLoading });

export const unSubAll = state => state;
export const reloadWatchlistFromBg = state => state;

export const reducer = createReducer(INITIAL_STATE, {
	[Types.LISTEN_WATCHLIST]: listenWatchlist,
	[Types.LISTEN_PRICEBOARD]: listenPriceboard,

	[Types.UPDATE_PRICE_BOARD]: updatePriceBoard,
	[Types.UPDATE_NEWS_TODAY]: updateNewsToday,
	[Types.UPDATE_LIST_PRICE]: updateListPrice,
	[Types.SET_SUB_TITLE_WATCHLIST]: setSubTitleWatchlist,
	[Types.SET_NAV_BUTTON_WATCHLIST]: setNavButtonWatchlist,
	[Types.GET_PRICE_SNAPSHOT]: getPriceSnapshot,

	[Types.INIT_WATCHLIST_COMP]: initWatchlistComp,

	[Types.UPDATE_LOADING_FORM_STATE]: updateLoadingFormState,
	[Types.UPDATE_LOADING_PRICE_STATE]: updateLoadingPriceState,

	[Types.RELOAD_WATCHLIST_FROM_BG]: reloadWatchlistFromBg,

	[Types.UN_SUB_ALL]: unSubAll
});
