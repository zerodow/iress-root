import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';
/* ------------- Types and Action Creators ------------- */

const PAGE = 10;

const { Types, Creators } = createActions({
	subSwiperTenTrade: ['id'],
	changeTenTradeLoadingState: ['isLoading'],
	getSnapshotSwiperTenTrade: null,
	updateSwiperTenTrade: ['data'],
	changeSwiperTenTrade: ['listData'],
	loadMoreSwiperTenTrade: null,
	initSwiperTenTrade: null
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	listData: [],
	listDataShow: [],
	isMore: false,
	quantity: PAGE,
	isLoading: true
});
/* ------------- Reducers ------------- */

export const subSwiperTenTrade = state => state;
export const updateSwiperTenTrade = state => state;
export const getSnapshotSwiperTenTrade = state =>
	state.merge({
		listData: [],
		listDataShow: [],
		isMore: false
	});
export const changeSwiperTenTrade = (state, { listData }) => {
	const { quantity } = state;
	const listDataShow = _.take(listData, quantity);
	const isMore = quantity < _.size(listData);
	return state.merge({
		listData,
		listDataShow,
		isMore
	});
};

export const loadMoreSwiperTenTrade = state => {
	const { listData, quantity } = state;
	const newQuantity = quantity + PAGE;
	const newListDataShow = _.take(listData, newQuantity);
	const newIsMore = newQuantity < _.size(listData);
	return state.merge({
		quantity: newQuantity,
		listDataShow: newListDataShow,
		isMore: newIsMore
	});
};

export const initSwiperTenTrade = state =>
	state.merge({
		listData: [],
		listDataShow: [],
		quantity: PAGE
	});

export const changeTenTradeLoadingState = (state, { isLoading }) =>
	state.merge({ isLoading });

export const reducer = createReducer(INITIAL_STATE, {
	[Types.SUB_SWIPER_TEN_TRADE]: subSwiperTenTrade,
	[Types.GET_SNAPSHOT_SWIPER_TEN_TRADE]: getSnapshotSwiperTenTrade,
	[Types.UPDATE_SWIPER_TEN_TRADE]: updateSwiperTenTrade,
	[Types.LOAD_MORE_SWIPER_TEN_TRADE]: loadMoreSwiperTenTrade,
	[Types.CHANGE_SWIPER_TEN_TRADE]: changeSwiperTenTrade,
	[Types.INIT_SWIPER_TEN_TRADE]: initSwiperTenTrade,
	[Types.CHANGE_TEN_TRADE_LOADING_STATE]: changeTenTradeLoadingState
});
