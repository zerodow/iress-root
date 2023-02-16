import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';
import { func } from '~/storage';
import Enum from '~/enum';
import produce from 'immer';
import { object } from 'prop-types';

/* ------------- Types and Action Creators ------------- */

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;

const MAX_SIZE_TRADE = 20;

const { Types, Creators } = createActions({
    changeQuoteData: ['data', 'isStreaming'],
    changeDepthData: ['data'],
    changeTradesData: ['data', 'isStreaming'],
    changeChartData: ['objData', 'isNotDeep'],
    changeChartDetailData: ['objData', 'symbol', 'exchange', 'filterType'],
    changeTradingPeriodData: ['data']
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = {
    marketData: {},
    chartData: {},
    chartDetail: {},
    tradingPeriod: {}
};
/* ------------- Reducers ------------- */
const withoutEmptyData = (state, symbol, exchange) => {
    if (!state[exchange]) {
        state[exchange] = {};
    }

    if (!state[exchange][symbol]) {
        state[exchange][symbol] = {};
    }
};

const withoutEmptyData2 = (state, symbol, exchange) => {
    if (!state[exchange]) {
        state[exchange] = {};
    }

    if (!state[exchange][symbol]) {
        state[exchange][symbol] = [];
    }
};

const withoutEmptyData3 = (state, symbol, exchange) => {
    if (!state[exchange]) {
        state[exchange] = {};
    }

    if (!state[exchange][symbol]) {
        state[exchange][symbol] = {};
    }

    if (!state[exchange][symbol].trades) {
        state[exchange][symbol].trades = {
            symbol,
            exchange
        };
    }
};

export const changeQuoteData = (state, { data, isStreaming }) => {
    const newChartData = {};

    const result = produce(state, (draftState) => {
        _.forEach(data, (draftData) => {
            if (!draftData) return;
            const {
                updated: draftUpdatedTime = 1,
                symbol,
                exchange
            } = draftData;
            withoutEmptyData(draftState.marketData, symbol, exchange);

            const { quote: curQuote } = draftState.marketData[exchange][symbol];
            const { updated: curUpdatedTime = 0 } = curQuote || {};

            if (draftUpdatedTime >= curUpdatedTime) {
                newChartData[symbol] = draftData;
                draftState.marketData[exchange][symbol].quote = {
                    ...curQuote,
                    ...draftData
                };
            } else {
                draftState.marketData[exchange][symbol].quote = {
                    ...draftData,
                    ...curQuote
                };
            }
        });
    });

    if (isStreaming && !_.isEmpty(newChartData)) {
        return changeChartData(result, { objData: newChartData });
    }
    return result;
};

export const changeDepthData = (state, { data }) => {
    const result = produce(state, (draftState) => {
        _.forEach(data, (draftData) => {
            if (!draftData) return;
            const {
                updated: draftUpdatedTime = 1,
                symbol,
                exchange
            } = draftData;
            withoutEmptyData(draftState.marketData, symbol, exchange);

            const { depth: curDepth } = draftState.marketData[exchange][symbol];
            const { updated: curUpdatedTime = 0 } = curDepth || {};

            if (draftUpdatedTime >= curUpdatedTime) {
                draftState.marketData[exchange][symbol].depth = {
                    ...curDepth,
                    ...draftData
                };
            } else {
                draftState.marketData[exchange][symbol].depth = {
                    ...draftData,
                    ...curDepth
                };
            }
        });
    });

    return result;
};
export const changeTradesData = (state, { data, isStreaming }) => {
    const result = produce(state, (draftState) => {
        _.forEach(data, (draftData) => {
            if (!draftData) return;
            const { trade, symbol, exchange } = draftData;
            const newTrade = _.values(trade);
            withoutEmptyData3(draftState.marketData, symbol, exchange);

            const { trades } = draftState.marketData[exchange][symbol];
            const { trade: curTrade = [] } = trades;

            if (isStreaming) {
                const sortData = _.orderBy(
                    [...newTrade, ...curTrade],
                    ['time'],
                    ['desc']
                );
                draftState.marketData[exchange][symbol].trades.trade = sortData;
            } else {
                draftState.marketData[exchange][symbol].trades.trade = newTrade;
            }

            const sliceData = _.slice(
                draftState.marketData[exchange][symbol].trades.trade,
                0,
                MAX_SIZE_TRADE
            );

            draftState.marketData[exchange][symbol].trades.trade = sliceData;
        });
    });

    return result;
};

export const changeChartData = (state, { objData }) => {
    return produce(state, (draftState) => {
        _.forEach(objData, (item, symbol) => {
            const { trade_price: tradePrice, exchange } = item || {};
            if (!symbol || !exchange || !tradePrice) return;

            withoutEmptyData2(draftState.chartData, symbol, exchange);

            draftState.chartData[exchange][symbol].push(tradePrice);
            draftState.chartData[exchange][symbol] = _.takeRight(
                draftState.chartData[exchange][symbol],
                10
            );
        });
    });
};

export const changeChartDetailData = (
    state,
    { objData, symbol, exchange, filterType = PRICE_FILL_TYPE._1D }
) => {
    if (!symbol || _.isEmpty(objData)) return state;

    return produce(state, (draftState) => {
        withoutEmptyData(draftState.chartDetail, symbol, exchange);
        if (!draftState.chartDetail[exchange][symbol][filterType]) {
            draftState.chartDetail[exchange][symbol][filterType] = objData;
        } else {
            const curData =
                draftState.chartDetail[exchange][symbol][filterType];

            draftState.chartDetail[exchange][symbol][filterType] = {
                ...curData,
                ...objData
            };
        }
    });
};

export const changeTradingPeriodData = (state, { data }) => {
    // if (_.isEmpty(data)) return state;
    // const result = {};
    // _.forEach(data, (item) => {
    //     const period = item && item[0];
    //     const { exchange } = period || {};
    //     if (exchange) {
    //         result[exchange] = period;
    //     }
    // });

    // return state.merge({ tradingPeriod: result });
    return state;
};

export const reducer = createReducer(INITIAL_STATE, {
    [Types.CHANGE_QUOTE_DATA]: changeQuoteData,
    [Types.CHANGE_DEPTH_DATA]: changeDepthData,
    [Types.CHANGE_TRADES_DATA]: changeTradesData,
    [Types.CHANGE_CHART_DATA]: changeChartData,
    [Types.CHANGE_CHART_DETAIL_DATA]: changeChartDetailData,
    [Types.CHANGE_TRADING_PERIOD_DATA]: changeTradingPeriodData
});
