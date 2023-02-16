import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	getDataPortfolio: null,
	getDataPortfolioSuccess: ['dataPorfolio']
});
export const SearchPortfolioTypes = Types;
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	isLoading: true,
	book_value: null,
	book_value_aud: null,
	listProfitPercent: {},
	listProfitVal: {},
	listTodayChangePercent: {},
	listTodayChangeVal: {},
	profitPercent: 0,
	symbol: '',
	isEmptyDataPort: false
});

export const getDataPortfolio = state =>
	state.merge({
		isLoading: true,
		book_value: null,
		book_value_aud: null,
		listProfitPercent: {},
		listProfitVal: {},
		listTodayChangePercent: {},
		listTodayChangeVal: {},
		profitPercent: 0
		// symbol: ''
	});

export const getDataPortfolioSuccess = (state, { dataPorfolio }) =>
	INITIAL_STATE.merge({
		...dataPorfolio,
		isLoading: false
	});
/* ------------- Reducers ------------- */
export const reducer = createReducer(INITIAL_STATE, {
	[Types.GET_DATA_PORTFOLIO]: getDataPortfolio,
	[Types.GET_DATA_PORTFOLIO_SUCCESS]: getDataPortfolioSuccess
});
