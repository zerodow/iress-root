'use strict';
import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

import * as Business from '~/business';
import ENUM from '~/enum';
import { mergeArrayOfObject } from '~/lib/base/functionUtil';

const { SYMBOL_CLASS } = ENUM;

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	uniSearchReset: null,
	uniSearchGetResult: ['text', 'isLoading'],
	uniSearchGetResultSuccess: ['listData', 'isUnique'],
	uniSearchGetHistory: ['textSearch'],
	uniSearchGetHistoryFailure: ['error'],
	uniSearchFilterHistoryByClass: ['searchHistory'],
	uniSearchUpdateHistory: ['newRecord'],
	uniSearchSetSymbolClass: ['symbolClass']
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	selectedClass: SYMBOL_CLASS.ALL_TYPES,
	textSearch: '',
	isLoading: true,
	error: null,
	historyByClass: {},
	listData: [],
	isUnique: false
});
/* ------------- Reducers ------------- */
export const uniSearchGetResult = (state, { text, isLoading = true }) =>
	state.merge({ isLoading, textSearch: text });

export const uniSearchGetResultSuccess = (state, { listData }) =>
	state.merge({
		listData,
		symbol: '',
		isLoading: false,
		isUnique: _.size(listData) === 1
	});
export const uniSearchGetHistory = (state, { textSearch }) =>
	state.merge({ textSearch });
export const uniSearchGetHistoryFailure = (state, { error }) =>
	state.merge({
		error,
		isLoading: false
	});

export const uniSearchFilterHistoryByClass = (state, { searchHistory }) =>
	state.merge({
		historyByClass: Business.filterSymbolByClass(searchHistory)
	});

export const uniSearchUpdateHistory = (state, { newRecord }) => {
	const curListHistory = Immutable.asMutable(state.historyByClass, { deep: true });
	const listData = curListHistory[state.selectedClass] || []
	curListHistory[state.selectedClass] = mergeArrayOfObject(newRecord, listData, 'symbol', 30)
	return state.merge({
		historyByClass: curListHistory
	});
}

export const uniSearchSetSymbolClass = (state, { symbolClass }) =>
	state.merge({ selectedClass: symbolClass });

export const uniSearchReset = () => INITIAL_STATE;

export const reducer = createReducer(INITIAL_STATE, {
	[Types.UNI_SEARCH_RESET]: uniSearchReset,
	[Types.UNI_SEARCH_GET_RESULT]: uniSearchGetResult,
	[Types.UNI_SEARCH_GET_RESULT_SUCCESS]: uniSearchGetResultSuccess,
	[Types.UNI_SEARCH_GET_HISTORY]: uniSearchGetHistory,
	[Types.UNI_SEARCH_GET_HISTORY_FAILURE]: uniSearchGetHistoryFailure,
	[Types.UNI_SEARCH_FILTER_HISTORY_BY_CLASS]: uniSearchFilterHistoryByClass,
	[Types.UNI_SEARCH_UPDATE_HISTORY]: uniSearchUpdateHistory,
	[Types.UNI_SEARCH_SET_SYMBOL_CLASS]: uniSearchSetSymbolClass
});
