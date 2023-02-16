import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';
/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	setTypeForm: ['isOrder'],
	getMarketSnapshot: null,
	subMarketDepth: ['id'],
	updateMarketDepth: null,
	setListAskBid: ['ask', 'bid'],
	setAutionPrice: ['indicative_price', 'surplus_volume', 'side'],
	changeMarketDepthData: ['listData'],
	changeDepthLoadingState: ['isLoading']
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	listData: null,
	typeForm: 'modifyOrder_depth',
	indicativePrice: null,
	surplusVolume: null,
	side: null,
	listAsk: [],
	listBid: [],
	quantity: 10,
	isLoading: true
});
/* ------------- Reducers ------------- */
export const getMarketSnapshot = state => state;
export const setTypeForm = (state, { isOrder }) =>
	state.merge({ typeForm: isOrder ? 'newOrder_depth' : 'modifyOrder_depth' });
export const subMarketDepth = state => state;
export const updateMarketDepth = state => state;
export const changeMarketDepthData = (state, { listData }) =>
	state.merge({ listData });
export const setListAskBid = (state, { ask, bid }) =>
	state.merge({
		listAsk: ask,
		listBid: bid
	});
export const setAutionPrice = (
	state,
	{ indicative_price: indicativePrice, surplus_volume: surplusVolume, side }
) =>
	state.merge({
		indicativePrice,
		surplusVolume,
		side
	});

export const changeDepthLoadingState = (state, { isLoading }) =>
	state.merge({ isLoading });

export const reducer = createReducer(INITIAL_STATE, {
	[Types.GET_MARKET_SNAPSHOT]: getMarketSnapshot,
	[Types.SET_TYPE_FORM]: setTypeForm,
	[Types.SUB_MARKET_DEPTH]: subMarketDepth,
	[Types.UPDATE_MARKET_DEPTH]: updateMarketDepth,
	[Types.SET_LIST_ASK_BID]: setListAskBid,
	[Types.SET_AUTION_PRICE]: setAutionPrice,
	[Types.CHANGE_MARKET_DEPTH_DATA]: changeMarketDepthData,
	[Types.CHANGE_DEPTH_LOADING_STATE]: changeDepthLoadingState
});
