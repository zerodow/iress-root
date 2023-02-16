import firebase from './firebase';
import { getKey, func, dataStorage } from './storage';
import { getFeedUrl, getNewsUrl, requestData, getSymbolUrl, getExchangeUrl } from './api';
import * as util from './util';
import Enum from './enum'
const init = {};
let check = {};

const REDUX_EVENT_TYPE = Enum.REDUX_EVENT_TYPE

export function initData(props) {
    return (dispatch) => {
        init[`symbol_equity`] = `symbol_equity`;
        init[`exchange`] = `exchange`;
        check = {};
        getSymbolApi(props);
        getKey('symbol_equity', props.keys.symbol_equity, getSymbol, dispatch, props);
        getKey('mapping_trading_market', props.keys.exchange, getExchange, dispatch, props);
        getExchanges(props);
    }
}

export function nextState(key, dispatch) {
    check[key] = key;
    let isOk = true;
    for (var code in init) {
        if (!check[code]) {
            isOk = false;
            break;
        }
    }
    if (isOk) {
        dispatch(initFinishHandler())
    }
}

export function getExchanges(app) {
    let url = getExchangeUrl();
    requestData(url).then(data => {
        if (data) {
            let obj = {};
            data.map((e, i) => {
                if (e && e.exchange) {
                    obj[e.exchange] = e;
                }
            })
            exchangeResponse(obj)
        } else {
        }
    }).catch(error => {
    })
}

export function exchangeResponse(data) {
    return {
        type: 'APP_EXCHANGE_API_RESPONSE',
        payload: data
    };
}

export function saveVersion(payload) {
    return {
        type: 'APP_SAVE_VERSION',
        payload
    };
}

export function getExchange(keyVal, currentKey, dispatch, props) {
    // if (keyVal === currentKey) {
    //     func.setDataStorage(`exchange`, props.values.exchange, nextState, dispatcordh);
    // } else {
    const refSymbol = firebase.database().ref(`mapping_trading_market`);
    refSymbol.once('value', function (snap) {
        const val = snap.val();
        func.setDataStorage(`exchange`, val, nextState, dispatch);
        dispatch(exchangeResponseHandler(val, keyVal));
    });
    // }
}

export function getSymbol(keyVal, currentKey, dispatch, props) {
    if (keyVal === currentKey) {
        func.setDataStorage(`symbol_equity`, props.values.symbol_equity, nextState, dispatch);
    } else {
        const refSymbol = firebase.database().ref(`symbol_equity`);
        refSymbol.once('value', function (snap) {
            const val = snap.val();
            func.setDataStorage(`symbol_equity`, val, nextState, dispatch);
            dispatch(symbolResponseHandler(val, keyVal));
        });
    }
}

export function getSymbolInfo(symbol, funcCallback) {
    return dispatch => {
        const newSymbol = util.encodeSymbol(symbol);
        let url = `${getSymbolUrl()}${newSymbol}.AU`
        requestData(url).then(data => {
            if (data && data.status === 'active') {
                let obj = {};
                obj[symbol] = data;
                funcCallback && funcCallback(data);
                dispatch(symbolApiResponse(obj))
            }
        })
    }
}

export function changeConnection(isConnected) {
    return {
        type: REDUX_EVENT_TYPE.APP_CHANGE_CONNECTION,
        payload: isConnected
    };
}

export function checkReviewAccount(isReviewAccount) {
    return {
        type: 'APP_CHANGE_ACCOUNT',
        payload: isReviewAccount
    }
}

export function setLoginUserType(userType) {
    return {
        type: 'SET_LOGIN_USER_TYPE',
        userType
    }
}

export function initFinishHandler() {
    return {
        type: 'APP_INIT_FINISHED'
    };
}

export function symbolResponseHandler(data, key) {
    return {
        type: 'APP_SYMBOL_RESPONSE',
        data,
        key
    };
}

export function getSymbolApi(props) {
    func.setSymbols(props.listSymbolApi);
}

export function symbolApiResponse(data) {
    return {
        type: 'APP_SYMBOL_API_RESPONSE',
        payload: data
    };
}
export function updateFirstOpen() {
    return {
        type: 'UPDATE_FIRST_OPEN'
    };
}
export function updateClearStorage() {
    return {
        type: 'UPDATE_CLEAR_STORAGE'
    };
}

export function exchangeResponseHandler(data, key) {
    return {
        type: 'APP_EXCHANGE_RESPONSE',
        data,
        key
    };
}
