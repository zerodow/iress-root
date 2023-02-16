import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';
/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	getAllDataSearchDetail: null,
	getAllDataSearchDetailSuccess: null,
	setSymbolSearchDetail: ['symbol'],
	subRealtimeSearchDetail: null,
	unSubRealtimeSearchDetail: null,
	changeSubChannel: ['channel'],
	onOpenSearchDetail: null,
	searchDetailSubRealtime: null,
	searchDetailSubRealtimeSuccess: ['channel'],
	searchDetailUnSubRealtime: ['symbol'],
	searchDetailUnSubRealtimeSuccess: null
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	symbol: '',
	isLoading: true,
	subChannel: null,
	realtimeChannel: null
});
/* ------------- Reducers ------------- */
export const getAllDataSearchDetail = state => state.merge({ isLoading: true });
export const setSymbolSearchDetail = (state, { symbol }) =>
	state.merge({ symbol });
export const subRealtimeSearchDetail = state => state;
export const unSubRealtimeSearchDetail = state => state;
export const onOpenSearchDetail = state => state;
export const searchDetailSubRealtime = state => state;
export const searchDetailUnSubRealtime = state => state;

export const changeSubChannel = (state, { channel }) =>
	state.merge({ subChannel: channel });

export const getAllDataSearchDetailSuccess = state =>
	state.merge({ isLoading: false });

export const searchDetailSubRealtimeSuccess = (state, { channel }) =>
	state.merge({ realtimeChannel: channel });
export const searchDetailUnSubRealtimeSuccess = state =>
	state.merge({ realtimeChannel: null });

export const reducer = createReducer(INITIAL_STATE, {
	[Types.GET_ALL_DATA_SEARCH_DETAIL]: getAllDataSearchDetail,
	[Types.GET_ALL_DATA_SEARCH_DETAIL_SUCCESS]: getAllDataSearchDetailSuccess,
	[Types.SET_SYMBOL_SEARCH_DETAIL]: setSymbolSearchDetail,
	[Types.SUB_REALTIME_SEARCH_DETAIL]: subRealtimeSearchDetail,
	[Types.UN_SUB_REALTIME_SEARCH_DETAIL]: unSubRealtimeSearchDetail,
	[Types.CHANGE_SUB_CHANNEL]: changeSubChannel,
	[Types.ON_OPEN_SEARCH_DETAIL]: onOpenSearchDetail,
	[Types.SEARCH_DETAIL_SUB_REALTIME]: searchDetailSubRealtime,
	[Types.SEARCH_DETAIL_SUB_REALTIME_SUCCESS]: searchDetailSubRealtimeSuccess,
	[Types.SEARCH_DETAIL_UN_SUB_REALTIME]: searchDetailUnSubRealtime,
	[Types.SEARCH_DETAIL_UN_SUB_REALTIME_SUCCESS]: searchDetailUnSubRealtimeSuccess
});
