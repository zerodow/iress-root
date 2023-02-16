import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
    getMarketExchange: null,
    getMarketExchangeSuccess: ['data'],
    getMarketExchangeFailure: ['error'],

    getMarketGroup: null,
    getMarketGroupSuccess: ['data'],
    getMarketGroupFailure: ['error'],

    getMarketWatchlist: ['exchange', 'marketGroup', 'watchlist'],
    getMarketWatchlistSuccess: ['data', 'typeWatchlist'],
    getMarketWatchlistFailure: ['error']
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
    exchanges: [],
    marketGroup: [],
    marketWatchlist: [],
    typeWatchlist: '',

    isLoading: true,
    error: null
});
/* ------------- Reducers ------------- */

export const getMarketExchange = (state) =>
    state.merge({ isLoading: true, error: null });
export const getMarketExchangeSuccess = (state, { data }) =>
    state.merge({ isLoading: false, error: null, exchanges: data });
export const getMarketExchangeFailure = (state, { error }) =>
    state.merge({ isLoading: false, error });

export const getMarketGroup = (state) =>
    state.merge({ isLoading: true, error: null });
export const getMarketGroupSuccess = (state, { data }) =>
    state.merge({ isLoading: false, error: null, marketGroup: data });
export const getMarketGroupFailure = (state, { error }) =>
    state.merge({ isLoading: false, error });

export const getMarketWatchlist = (state) =>
    state.merge({ isLoading: true, error: null });
export const getMarketWatchlistSuccess = (state, { data, typeWatchlist }) =>
    state.merge({
        isLoading: false,
        error: null,
        marketWatchlist: data,
        typeWatchlist
    });
export const getMarketWatchlistFailure = (state, { error }) =>
    state.merge({ isLoading: false, error });

export const reducer = createReducer(INITIAL_STATE, {
    [Types.GET_MARKET_EXCHANGE]: getMarketExchange,
    [Types.GET_MARKET_EXCHANGE_SUCCESS]: getMarketExchangeSuccess,
    [Types.GET_MARKET_EXCHANGE_FAILURE]: getMarketExchangeFailure,

    [Types.GET_MARKET_GROUP]: getMarketGroup,
    [Types.GET_MARKET_GROUP_SUCCESS]: getMarketGroupSuccess,
    [Types.GET_MARKET_GROUP_FAILURE]: getMarketGroupFailure,

    [Types.GET_MARKET_WATCHLIST]: getMarketWatchlist,
    [Types.GET_MARKET_WATCHLIST_SUCCESS]: getMarketWatchlistSuccess,
    [Types.GET_MARKET_WATCHLIST_FAILURE]: getMarketWatchlistFailure
});
