import { put, call, select, delay } from 'redux-saga/effects';
import _ from 'lodash';

import MarketExchangeActions from './reducer';
import * as Business from '~/business'

import {
    requestData,
    getUrlExchange,
    getUrlMarketGroup,
    getUrlMarketWatchlist
} from '~/api';

export function* getMarketExchange() {
    const url = getUrlExchange();
    try {
        const res = yield call(requestData, url);
        yield put(MarketExchangeActions.getMarketExchangeSuccess(res));
    } catch (error) {
        yield put(MarketExchangeActions.getMarketExchangeFailure());
    }
}

export function* getMarketGroup() {
    const url = getUrlMarketGroup();
    try {
        const res = yield call(requestData, url);
        yield put(MarketExchangeActions.getMarketGroupSuccess(res));
    } catch (error) {
        yield put(MarketExchangeActions.getMarketGroupFailure());
    }
}

export function* getMarketWatchlist({ exchange, marketGroup, watchlist }) {
    const url = getUrlMarketWatchlist(watchlist, exchange, marketGroup);
    try {
        const res = yield call(requestData, url);
        // yield getSymbolInfo(res.value || [])
        yield put(
            MarketExchangeActions.getMarketWatchlistSuccess(
                res.value,
                res.watchlist
            )
        );
    } catch (error) {
        yield put(MarketExchangeActions.getMarketWatchlistFailure());
    }
}

function* getSymbolInfo(value) {
    if (!value.length) return Promise.resolve()
    const listSymbol = []
    _.forEach(value, (item) => {
        if (item && item.symbol) {
            listSymbol.push(`${item.symbol}.${item.exchange}`);
        }
    });

    Business.getSymbolInfoMultiExchange1(listSymbol);
}
