import firebase from '../../firebase';
import { func, dataStorage } from '../../storage';
import {
    logAndReport, getPriceSource, countC2RTimes, logDevice,
    getSymbolInfoApi, getPriceMultiExchange, checkNewsToday
} from '../../lib/base/functionUtil';
import PriceDisplay from '../../constants/price_display_type';
import { click2Refresh } from '../../operator';
import ServerEvent, { initData } from '../../server_event';
import { getApiUrl, requestData, getFeedUrl, getSymbolUrl, getUserWatchList } from '../../api';
import { connect2Nchan, mergeData } from '../../nchan';
import { emitters, newEmitter, addListener, emit, deleteEmitter } from '../../emitter';
import performanceEnum from '../../constants/performance';
import ScreenId from '../../constants/screen_id';
import Perf from '../../lib/base/performance_monitor';
import * as Util from '../../util'
import * as Lv1 from '../../streaming/lv1';
import * as Business from '../../business'
import * as Controller from '../../memory/controller'

let refEventTrade = null;
let newItems = false;
let userWatchList = null;
let addUserSymbolEvent = null;
let removeUserSymbolEvent = null;
let symbols = {};
let dispatchGlobal = null;
let perf = null;

export function closeForm() {
    return dispatch => {
        dispatch(closeFormHandler());
    };
}

export function closeFormHandler() {
    return {
        type: 'CLOSE_TRADE'
    };
}
export function nextPage() {
    return dispatch => {
        dispatch(nextPageEvent());
    }
}
export function nextPageEvent() {
    return {
        type: 'TRADE_NEXT_PAGE'
    };
}

export function getTopCompany(type, cb) {
    try {
        perf = new Perf(performanceEnum.get_top_company);
        perf && perf.start();
        const url = `${getApiUrl(null, type)}`;
        requestData(url)
            .then(bodyData => {
                const data = bodyData && bodyData.value ? bodyData.value : [];
                dataStorage.isGetTop = true;
                logDevice('info', `getTopCompany with type ${type.toUpperCase()} and data ${data ? JSON.stringify(data) : ''}`)
                cb(data);
                perf && perf.stop();
            })
            .catch(error => {
                const response = {
                    errorCode: error
                }
                cb(response)
            })
    } catch (error) {
        logAndReport('getTopCompany tradeAction exception', error, 'getTopCompany tradeAction');
        logDevice('info', `getTopCompany tradeAction exception ${error}`)
    }
}

export function getLv1(listSymbols, stringQuery, dispatch) {
    const isPriceStreaming = Controller.isPriceStreaming();
    // Sub symbol
    const listSymbolObject = Util.getListSymbolObject(stringQuery);
    const numberSymbolUserWatchList = listSymbols.length;
    let expireSymbol = [];
    let isContain = false;
    if (isPriceStreaming) {
        // Unsub before sub
        Business.unSubByScreen('watchlist')
        const ID_FORM = Util.getRandomKey();
        // Set dic IDFORM nad listSymbolObject by name
        func.setDicIDForm('watchlist', ID_FORM)
        func.setDicListSymbolObject('watchlist', listSymbolObject)
        logDevice('info', `LIST SYMBOL SUB: ${JSON.stringify(listSymbolObject)}`)
        Business.subNewSymbol(listSymbolObject, ID_FORM)
            .then(() => {
                Lv1.getLv1(listSymbolObject, isPriceStreaming)
                    .then(bodyData => {
                        let newData = [];
                        if (bodyData.length !== numberSymbolUserWatchList) {
                            // Không lấy được đủ giá của thằng personal -> fill object fake
                            expireSymbol = listSymbols.filter((v, k) => {
                                const userWatchListSymbol = v.symbol;
                                for (let i = 0; i < bodyData.length; i++) {
                                    const priceSymbol = bodyData[i].symbol;
                                    if (userWatchListSymbol === priceSymbol) {
                                        isContain = true
                                    }
                                }
                                if (isContain) {
                                    isContain = false;
                                    return false
                                }
                                return true
                            })
                        }

                        newData = [...bodyData, ...expireSymbol];
                        // sort lai theo user watchlist
                        let bodyDataSortByUserWatchList = []
                        for (let i = 0; i < listSymbols.length; i++) {
                            const symbol = listSymbols[i].symbol;
                            const newArr = newData.filter((e, i) => {
                                return e.symbol === symbol;
                            })
                            bodyDataSortByUserWatchList.push(newArr[0]);
                        }
                        dispatch(userSymbolResponse(bodyDataSortByUserWatchList));
                        logDevice('info', `Trade - REPONSE LIST SYMBOL WITH DATA: ${bodyDataSortByUserWatchList}`);
                        dataStorage.countC2rWatchlist = false;
                    });
            })
            .catch(err => {
                console.log(err)
            })
    } else {
        Lv1.getLv1(listSymbolObject, isPriceStreaming)
            .then(bodyData => {
                let newData = [];
                if (bodyData.length !== numberSymbolUserWatchList) {
                    // Không lấy được đủ giá của thằng personal -> fill object fake
                    expireSymbol = listSymbols.filter((v, k) => {
                        const userWatchListSymbol = v.symbol;
                        for (let i = 0; i < bodyData.length; i++) {
                            const priceSymbol = bodyData[i].symbol;
                            if (userWatchListSymbol === priceSymbol) {
                                isContain = true
                            }
                        }
                        if (isContain) {
                            isContain = false;
                            return false
                        }
                        return true
                    })
                }

                newData = [...bodyData, ...expireSymbol];
                // sort lai theo user watchlist
                let bodyDataSortByUserWatchList = []
                for (let i = 0; i < listSymbols.length; i++) {
                    const symbol = listSymbols[i].symbol;
                    const newArr = newData.filter((e, i) => {
                        return e.symbol === symbol;
                    })
                    bodyDataSortByUserWatchList.push(newArr[0]);
                }
                dispatch(userSymbolResponse(bodyDataSortByUserWatchList));
                logDevice('info', `Trade - REPONSE LIST SYMBOL WITH DATA: ${bodyDataSortByUserWatchList}`);
                dataStorage.countC2rWatchlist = false;
            });
    }
}

export function loadDataFromApi(type) {
    dataStorage.countC2rWatchlist = true;
    return dispatch => {
        dispatchGlobal = dispatch;
        try {
            perf = new Perf(performanceEnum.load_data_from_api_watch_list);
            perf && perf.start();
            const dataUserWatchListChange = function (data) {
                if (data && data.errorCode) return dispatch(writeDataError(data.errorCode))
                if (data.length === 0) {
                    dispatch(userSymbolResponse(data));
                } else {
                    logDevice('info', `Trade - REPONSE LIST SYMBOL`);
                    if (dataStorage.watchListScreenId !== PriceDisplay.PERSONAL && !dataStorage.isGetTop) {
                        logDevice('error', `Trade - RETURN FALSE & NOT RENDER NEW SYMBOL `);
                        return;
                    }
                    dataStorage.isGetTop = false;
                    newItems = true;
                    let val;
                    let arr = [];
                    if (data.length) {
                        val = data || [];
                        arr = val.sort(function (a, b) {
                            return a.rank - b.rank;
                        });
                    } else {
                        val = data.val() || {};
                        arr = Object.keys(val).map((k) => val[k]).sort(function (a, b) {
                            return a.rank - b.rank;
                        });
                    }
                    logDevice('info', `Trade - REPONSE LIST SYMBOL WITH LENGTH: ${data.length}`);
                    // const dicUserWatchlist = {};
                    let stringQuery = '';
                    let symbolQuery = '';
                    let symbolSubQuery = '';
                    let exampleCode = null;
                    const encodeSplash = encodeURIComponent('/');
                    for (let index = 0; index < arr.length; index++) {
                        const element = arr[index];
                        let symbolOrigin = element.symbol ? element.symbol : element.code;
                        // const symbol = symbolOrigin.replace(/\//g, encodeSplash); // replace / -> %2F
                        const symbol = symbolOrigin
                        if (Controller.isPriceStreaming()) {
                            if (symbol.indexOf('/') < 0) {
                                symbolSubQuery += symbol + ',';
                            }
                        } else {
                            symbolSubQuery += symbol + ',';
                        }
                        stringQuery += symbol + ',';
                        // query get multi symbol
                        exampleCode = symbol;
                        if (!dataStorage.symbolEquity[symbol]) {
                            symbolQuery += symbol + ',';
                            exampleCode = symbol;
                        }
                    }
                    if (stringQuery) {
                        stringQuery = stringQuery.replace(/.$/, '')
                    }
                    if (symbolQuery) {
                        symbolQuery = symbolQuery.replace(/.$/, '')
                    }
                    if (symbolSubQuery) {
                        symbolSubQuery = symbolSubQuery.replace(/.$/, '')
                    }
                    let exchange = (dataStorage.symbolEquity[exampleCode] && dataStorage.symbolEquity[exampleCode].exchanges[0]) || 'ASX';
                    // check new trong ngay
                    checkNewsToday(stringQuery)
                        .then(() => {
                            logDevice('info', `CHECK NEWS TO DAY TRADE SCREEN SUCCESS`)
                        })
                        .catch(error => {
                            logDevice('error', `CHECK NEWS TO DAY TRADE SCREEN FAILED`)
                        });
                    getSymbolInfoApi(symbolQuery, () => {
                        getLv1(arr, symbolSubQuery, dispatch)
                    })
                }
            }

            const typePrice = type;
            logDevice('info', `Trade - GET SYMBOL TYPE: ${typePrice}`);
            switch (typePrice) {
                case PriceDisplay.SP20:
                    getTopCompany('top-asx-20/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.SP50:
                    getTopCompany('top-asx-50/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.SP100:
                    getTopCompany('top-asx-100/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.SP200:
                    getTopCompany('top-asx-200/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE1:
                    getTopCompany('tradable-NYSE-01/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE2:
                    getTopCompany('tradable-NYSE-02/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE3:
                    getTopCompany('tradable-NYSE-03/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE4:
                    getTopCompany('tradable-NYSE-04/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE5:
                    getTopCompany('tradable-NYSE-05/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NASDAQ1:
                    getTopCompany('tradable-NASDAQ-01/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.NASDAQ2:
                    getTopCompany('tradable-NASDAQ-02/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.XASE:
                    getTopCompany('tradable-XASE/0', dataUserWatchListChange);
                    break;
                case PriceDisplay.ARCX:
                    getTopCompany('tradable-ARCX/0', dataUserWatchListChange);
                    break;
                default:
                    if (!emitters['realTimeWatchList']) {
                        newEmitter('realTimeWatchList');
                        addListener('realTimeWatchList', 'onWatchList', (byPassCache) => getUserWatchList(dataUserWatchListChange, byPassCache))
                    }
                    emit('realTimeWatchList', 'onWatchList')
                    break;
            }
        } catch (error) {
            logAndReport('loadDataFromApi tradeAction exception', error, 'loadDataFromApi tradeAction');
            logDevice('info', `loadDataFromApi tradeAction exception ${error}`);
        }
    }
}

export function getDataListCodeUpdated(userWatchList, userType, stringQuery) {
    return dispatch => {
        let code = stringQuery.split(',')[0];
        let exchange = (dataStorage.symbolEquity[code] && dataStorage.symbolEquity[code].exchanges[0]) || 'ASX';
        const numberSymbolUserWatchList = userWatchList.length;
        let expireSymbol = [];
        let isContain = false;
        getSymbolInfoApi(stringQuery, () => {
            getPriceMultiExchange(stringQuery, userType, (bodyData) => {
                let newData = [];
                if (bodyData.length !== numberSymbolUserWatchList) {
                    // Không lấy được đủ giá của thằng personal -> fill object fake
                    expireSymbol = userWatchList.filter((v, k) => {
                        const userWatchListSymbol = v.symbol;
                        for (let i = 0; i < bodyData.length; i++) {
                            const priceSymbol = bodyData[i].symbol;
                            if (userWatchListSymbol === priceSymbol) {
                                isContain = true
                            }
                        }
                        if (isContain) {
                            isContain = false;
                            return false
                        }
                        return true
                    })
                }

                newData = [...bodyData, ...expireSymbol];
                perf && perf.stop();
                let bodyDataSortByUserWatchList = []
                for (let i = 0; i < userWatchList.length; i++) {
                    const symbol = userWatchList[i].symbol;
                    const arr = newData.filter((e, i) => {
                        return e.symbol === symbol;
                    })
                    bodyDataSortByUserWatchList.push(arr[0]);
                }
                dispatch(getDataListCodeUpdatedResponse(bodyDataSortByUserWatchList));
                logDevice('info', `Trade - REPONSE LIST SYMBOL WITH DATA: ${bodyDataSortByUserWatchList}`);
            });
        })
    }
}

export function dispatchSuccess() {
    dataStorage.countC2rWatchlist = false;
    if (dispatchGlobal) {
        dispatchGlobal(writeDataSuccess());
    } else {
        return dispatch => {
            dispatch(writeDataSuccess());
        }
    }
}

export function dispatchError() {
    dataStorage.countC2rWatchlist = false;
    if (dispatchGlobal) {
        dispatchGlobal(writeDataError());
    } else {
        return dispatch => {
            dispatch(writeDataError());
        }
    }
}

export function setReloadSuccess() {
    return dispatch => {
        dispatch(writeDataSuccess());
    }
}

export function writeDataRequest(type, isRefresh) {
    return dispatch => {
        try {
            isRefresh && dispatch(writeDataEvent());
            if (type === PriceDisplay.PERSONAL ||
                type === PriceDisplay.INDICES ||
                type === PriceDisplay.SP20 ||
                type === PriceDisplay.SP50 ||
                type === PriceDisplay.SP100 ||
                type === PriceDisplay.SP200 ||
                type === PriceDisplay.NASDAQ1 ||
                type === PriceDisplay.NASDAQ2 ||
                type === PriceDisplay.NYSE1 ||
                type === PriceDisplay.NYSE2 ||
                type === PriceDisplay.NYSE3 ||
                type === PriceDisplay.NYSE4 ||
                type === PriceDisplay.NYSE5 ||
                type === PriceDisplay.XASE ||
                type === PriceDisplay.ARCX
            ) {
                const fcb = func.getFuncReload('trade');
                fcb && fcb();
            } else {
                const fcb = func.getFuncReload(type);
                fcb && fcb();
            }
        } catch (error) {
            logAndReport('writeDataRequest tradeAction exception', error, 'writeDataRequest tradeAction');
            logDevice('info', `writeDataRequest tradeAction exception ${error}`)
        }
    };
}

export function clearDataWatchList() {
    return {
        type: 'CLEAR_DATA'
    }
}

export function writeDataEvent() {
    return {
        type: 'TRADE_WRITE_DATA_REQUEST'
    };
}

export function reloadForm() {
    return {
        type: 'TRADE_RELOAD_FORM'
    };
}
export function writeDataSuccess() {
    return {
        type: 'TRADE_WRITE_DATA_SUCCESS'
    };
}

export function writeDataError(error) {
    return {
        type: 'TRADE_WRITE_DATA_ERROR',
        payload: error
    };
}

export function addSymbolEvent(payload) {
    return {
        type: 'USER_SYMBOL_ADDED',
        payload
    };
}

export function changedSymbolEvent(payload) {
    return {
        type: 'USER_SYMBOL_CHANGED',
        payload
    };
}

export function removeSymbolEvent(payload) {
    return {
        type: 'USER_SYMBOL_REMOVED',
        payload
    };
}

export function userSymbolRequest(params) {
    return {
        type: 'USER_SYMBOL_REQUEST'
    };
}

export function userTypeRequest(params) {
    return {
        type: 'TRADE_USER_TYPE_REQUEST'
    };
}

export function userTypeResponse(payload) {
    return {
        type: 'TRADE_USER_TYPE_RESPONSE',
        payload
    };
}

export function userSymbolRefresh(params) {
    return {
        type: 'USER_SYMBOL_REFRESH'
    };
}

export function userSymbolResponse(data) {
    return {
        type: 'USER_SYMBOL_RESPONSE',
        payload: data
    };
}

export function getDataListCodeUpdatedResponse(data) {
    return {
        type: 'TRADE_GET_DATA_LIST_CODE_UPDATED_RESPONSE',
        payload: data
    };
}
