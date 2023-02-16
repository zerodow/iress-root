import enumType from './enum';
import Mongo from './lib/base/mongo';
import { dataStorage, func } from './storage';
import {
    getUrlCache,
    requestData,
    getUrlFilterOrders,
    getUrlOrderByTag,
    getUserWatchList,
    getApiUrl,
    getUrlUserWatchList,
    getNewTotalPortfolio,
    getUrlUserPositionByAccountId,
    getUrlTopOrderTransaction,
    getAllHoldingUrl,
    getPriceBoard
} from './api';
import {
    getParams,
    getPaths,
    logDevice,
    saveDicPersonal,
    setWatchListCache,
    getWatchListCache,
    getSymbolInfoFromListObjectSymbol
} from './lib/base/functionUtil';
import * as DateTime from './lib/base/dateTime';
import PriceDisplay from './constants/price_display_type';
import * as Controller from './memory/controller';
import * as Model from './memory/model';
import WatchlistActions from '~s/watchlist/reducers';

const TIME_CHECK_CHANGE = 30 * 1000;
const TABLE_NAME = enumType.TABLE_NAME;

export function getMongoInstance(name) {
    if (!name) return null;
    const instance = dataStorage.mongoConnection[name];
    if (instance) {
        return instance;
    }
    const iTemp = new Mongo(`${name}`);
    dataStorage.mongoConnection[name] = iTemp;
    return iTemp;
}

export function getCacheType(url = '') {
    if (!url) return null;
    const isDemo = Controller.isDemo();
    const baseUrl = `${Controller.getBaseUrl()}${Controller.getVersion(
        'version'
    )}`;
    const params = getParams(url);
    const paths = getPaths(url);
    const subPath = {};
    let cacheType = '';
    let table = '';
    let originTable = '';
    if (url.indexOf(`/market-info/symbol/company_name`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SYMBOL_SEARCH_BY_COMPANY;
        table = `${isDemo ? 'demo' : 'prod'}_${
            enumType.TABLE_NAME.symbol_search
        }`;
        originTable = enumType.TABLE_NAME.symbol;
    } else if (url.indexOf(`/market-info/symbol/search/`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SYMBOL_SEARCH;
        table = `${isDemo ? 'demo' : 'prod'}_${
            enumType.TABLE_NAME.symbol_search
        }`;
        originTable = enumType.TABLE_NAME.symbol;
    } else if (url.indexOf(`/market-info/symbol/`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SYMBOL_INFO;
        const symbolList = paths.length > 0 ? paths[paths.length - 1] : '';
        if (symbolList) {
            const listSymbol = symbolList.split(',');
            const listSet = [];
            for (let t = 0; t < listSymbol.length; t++) {
                const item = listSymbol[t];
                if (item) {
                    listSet.push(item);
                }
            }
            subPath.symbols = listSet;
            table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.symbol}`;
            originTable = enumType.TABLE_NAME.symbol;
        }
    } else if (url.indexOf(`/order?`) >= 0) {
        if (/\/order\?order_id=.*&detail=true/.test(url)) {
            cacheType = enumType.CACHE_TYPE.ORDERS_DETAIL;
            table = `${isDemo ? 'demo' : 'prod'}_${
                enumType.TABLE_NAME.orders_detail
            }`;
            originTable = enumType.TABLE_NAME.orders_detail;
        } else if (
            params &&
            params.tag === enumType.ORDERS_TYPE_FILTER.open &&
            params.account_id === dataStorage.accountId
        ) {
            cacheType = enumType.CACHE_TYPE.ORDERS_OPEN;
            table = `${isDemo ? 'demo' : 'prod'}_${params.account_id}_${
                enumType.TABLE_NAME.open_order
            }`;
            originTable = enumType.TABLE_NAME.open_order;
        } else if (
            params &&
            params.tag === enumType.ORDERS_TYPE_FILTER.stoploss &&
            params.account_id === dataStorage.accountId
        ) {
            cacheType = enumType.CACHE_TYPE.ORDERS_STOPLOSS;
            table = `${isDemo ? 'demo' : 'prod'}_${params.account_id}_${
                enumType.TABLE_NAME.open_stoploss_order
            }`;
            originTable = enumType.TABLE_NAME.open_stoploss_order;
        } else if (
            params &&
            params.tag === enumType.ORDERS_TYPE_FILTER.filled &&
            params.account_id === dataStorage.accountId
        ) {
            cacheType = enumType.CACHE_TYPE.ORDERS_FILLED;
            table = `${isDemo ? 'demo' : 'prod'}_${params.account_id}_${
                enumType.TABLE_NAME.filled_order
            }`;
            originTable = enumType.TABLE_NAME.filled_order;
        } else if (
            params &&
            params.tag === enumType.ORDERS_TYPE_FILTER.cancelled &&
            params.account_id === dataStorage.accountId
        ) {
            cacheType = enumType.CACHE_TYPE.ORDERS_CANCELLED;
            table = `${isDemo ? 'demo' : 'prod'}_${params.account_id}_${
                enumType.TABLE_NAME.cancelled_order
            }`;
            originTable = enumType.TABLE_NAME.cancelled_order;
        }
    } else if (url.indexOf(`/user-watchlist/`) >= 0) {
        cacheType = enumType.CACHE_TYPE.PERSONAL;
        table = `${isDemo ? 'demo' : 'prod'}_${func.getUserId()}_${
            enumType.TABLE_NAME.personal
        }`;
        originTable = enumType.TABLE_NAME.personal;
    } else if (url.indexOf(`/top-asx-20/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SP20;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/top-asx-50/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SP50;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/top-asx-100/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SP100;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/top-asx-200/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.SP200;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NYSE-01/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NYSE1;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NYSE-02/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NYSE2;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NYSE-03/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NYSE3;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NYSE-04/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NYSE4;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NYSE-05/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NYSE5;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NASDAQ-01/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NASDAQ1;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-NASDAQ-02/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.NASDAQ2;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-XASE/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.XASE;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/tradable-ARCX/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.ARCX;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.top}`;
        originTable = enumType.TABLE_NAME.top;
    } else if (url.indexOf(`/top-price-gainer/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.TOPGAINERS;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.topGainer}`;
        originTable = enumType.TABLE_NAME.topGainer;
    } else if (url.indexOf(`/top-price-loser/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.TOPLOSERS;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.topLoser}`;
        originTable = enumType.TABLE_NAME.topLoser;
    } else if (url.indexOf(`/top-price-market-value/0`) >= 0) {
        cacheType = enumType.CACHE_TYPE.TOPVALUE;
        table = `${isDemo ? 'demo' : 'prod'}_${enumType.TABLE_NAME.topValue}`;
        originTable = enumType.TABLE_NAME.topValue;
    } else if (url.indexOf(`/transactions/`) >= 0) {
        cacheType = enumType.CACHE_TYPE.ORDER_TRANSACTIONS;
        table = `${isDemo ? 'demo' : 'prod'}_order_transaction`;
        originTable = ``;
    }
    const shortUrl = url.replace(baseUrl, '');

    return {
        cacheType,
        params,
        subPath,
        url: shortUrl,
        table,
        originTable
    };
}

function setDataCache(obj = {}) {
    const objTemp = {};
    for (const key in obj) {
        const listSplit = key.split('.') || [];
        const newKey = listSplit.length > 1 ? listSplit[1] : '';
        objTemp[newKey] = obj[key];
    }
    dataStorage.dicCheckChange = objTemp;
}

export function registerOrdersHandler(type, cbFn) {
    const stateCheck = dataStorage.dicOrdersStatus[type];
    if (!stateCheck) {
        const handlers = dataStorage.dicOrdersRegister[type] || [];
        handlers.push(cbFn);
        dataStorage.dicOrdersRegister[type] = handlers;
    } else {
        cbFn();
    }
}
export function deleteEveryYear() {
    const timeYearAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 366;
    const mongoInstance = getMongoInstance(TABLE_NAME.orders_detail);
    mongoInstance.removeMulti({ exchange_updated: { $lt: timeYearAgo } });
}
export function initCacheOrders() {
    syncOrdersFromDic();
    dataStorage.dicOrdersStatus = {};
    getOrders(enumType.ORDERS_TYPE_FILTER.open);
    getOrders(enumType.ORDERS_TYPE_FILTER.stoploss);
    setTimeout(() => {
        getOrders(enumType.ORDERS_TYPE_FILTER.cancelled);
        getOrders(enumType.ORDERS_TYPE_FILTER.filled);
    }, 1000);
    removeOrdersOverYear();
    deleteEveryYear();
}

export function initCachePortfolio() {
    getTotalPortfolio();
}

export function initCacheOrderTransactions(listPosition) {
    // if (listPosition) {
    //     return getOrderTransactionByListPositions(listPosition)
    // }
    // return getOrderTransactions()
    return getUserPosition();
}

export function initCachePersonal() {
    // syncPersonalFromDic();
    dataStorage.dicPersonalStatus = {};
    getPriceBoard(dataStorage.user_id);
    try {
        const dispatch = Model.getDispathchFunc();
        dispatch.marketActivity.getMarketExchange();
        dispatch.marketActivity.getMarketGroup();
    } catch (error) {
        console.info('error', error);
    }

    // func.getLastestPriceBoard(dataStorage.user_id)
    //     .then(watchlist => {
    //         console.log('WATCHLIST GET LASTEST PRICEBOARD', watchlist)
    //         Controller.dispatch(WatchlistActions.watchListSetPriceBoardSelected(watchlist))
    //     })
    // getPersonal(PriceDisplay.PERSONAL)
    // getPersonal(PriceDisplay.SP20)
    // getPersonal(PriceDisplay.SP50)
    // getPersonal(PriceDisplay.SP100)
    // getPersonal(PriceDisplay.SP200)
    // getPersonal(PriceDisplay.NYSE1)
    // getPersonal(PriceDisplay.NYSE2)
    // getPersonal(PriceDisplay.NYSE3)
    // getPersonal(PriceDisplay.NYSE4)
    // getPersonal(PriceDisplay.NYSE5)
    // getPersonal(PriceDisplay.NASDAQ1)
    // getPersonal(PriceDisplay.NASDAQ2)
    // getPersonal(PriceDisplay.XASE)
    // getPersonal(PriceDisplay.ARCX)
}

export function getUserPositionByAccountID(accountID) {
    return new Promise((resolve) => {
        const urlUserPosition = getUrlUserPositionByAccountId(accountID);
        requestData(urlUserPosition, true)
            .then((data) => {
                const listSymbol = Object.keys(data);
                if (data && listSymbol.length) {
                    resolve(listSymbol);
                } else {
                    resolve([]);
                }
            })
            .catch((error) => {
                resolve([]);
                logDevice(
                    'error',
                    `getUserPosition by account id error: ${error}`
                );
            });
    });
}

export function callOrdersHandler(type, isOk = true) {
    try {
        const handlers = dataStorage.dicOrdersRegister[type] || [];
        for (let i = 0; i < handlers.length; i++) {
            const cbFn = handlers[i];
            cbFn(isOk);
        }
        dataStorage.dicOrdersRegister[type] = [];
    } catch (error) {
        logDevice(
            'info',
            `CACHE ==> Error: throw exception in callback function: ${error}`
        );
    }
}

export function callPersonalHandler(type, isOk = true) {
    try {
        const handlers = dataStorage.dicPersonalRegister[type] || [];
        for (let i = 0; i < handlers.length; i++) {
            const cbFn = handlers[i];
            cbFn(isOk);
        }
        dataStorage.dicPersonalRegister[type] = [];
    } catch (error) {
        logDevice(
            'info',
            `CACHE ==> Error: throw exception in callback function: ${error}`
        );
    }
}

export function syncOrdersFromDic() {
    dataStorage.syncInterval && clearInterval(dataStorage.syncInterval);
    dataStorage.dicOrdersRealTimeCache = {};
    console.log('syncOrdersFromDic', dataStorage.dicOrdersRealTimeCache);
    // dataStorage.syncInterval = setInterval(() => {
    //     const listOpen = [];
    //     const listStoploss = [];
    //     const listFilled = [];
    //     const listCancelled = [];
    //     const queryOldData = { $or: [] };
    //     const dicData = dataStorage.dicOrdersRealTimeCache;

    //     // console.log(`ALL ===> dicData: ${JSON.stringify(dicData)}`);
    //     for (const key in dicData) {
    //         const itemRealTime = dicData[key];
    //         queryOldData.$or.push({ client_order_id: itemRealTime.client_order_id });
    //         if (itemRealTime.order_tag === enumType.ORDERS_TYPE_FILTER.filled) {
    //             listFilled.push(itemRealTime);
    //         } else if (itemRealTime.order_tag === enumType.ORDERS_TYPE_FILTER.cancelled) {
    //             listCancelled.push(itemRealTime);
    //         } else {
    //             if (itemRealTime.condition_name && itemRealTime.condition_name.toLocaleUpperCase() === enumType.ORDER_TYPE_ORIGIN_UPPER.STOPLOSS) {
    //                 listStoploss.push(itemRealTime);
    //             } else {
    //                 listOpen.push(itemRealTime);
    //             }
    //         }
    //     }
    //     // dataStorage.dicOrdersRealTimeCache = {};
    //     // syncOrdersToDatabase(enumType.TABLE_NAME.open_order, queryOldData, listOpen);
    //     // syncOrdersToDatabase(enumType.TABLE_NAME.open_stoploss_order, queryOldData, listStoploss);
    //     // syncOrdersToDatabase(enumType.TABLE_NAME.cancelled_order_intraday, queryOldData, listCancelled);
    //     // syncOrdersToDatabase(enumType.TABLE_NAME.filled_order_intraday, queryOldData, listFilled);
    // }, 30000)
}

export function syncPersonalFromDic() {
    // dataStorage.syncInterval && clearInterval(dataStorage.syncInterval);
    dataStorage.dicPersonalRealTimeCache = {};
}

function syncOrdersToDatabase(fileName, query, listData) {
    const openOrdersInstance = getMongoInstance(
        `${dataStorage.accountId}_${fileName}`
    );
    openOrdersInstance.findAll().then((data) => {
        console.log(`ALL ===> fileName:${fileName} DATA: `, data);
    });
    if (!query || !query.$or || !query.$or.length) return;
    const dicCheck = {};
    openOrdersInstance
        .find(query)
        .then((result) => {
            for (let r = 0; r < result.length; r++) {
                const element = result[r];
                dicCheck[element.client_order_id] = element;
            }
            const updateItem = {};
            const insertItem = {};
            for (let t = 0; t < listData.length; t++) {
                const element = listData[t];
                const oldItem = dicCheck[element.client_order_id];
                if (oldItem) {
                    updateItem[element.client_order_id] = {
                        newData: element,
                        oldData: oldItem
                    };
                } else {
                    insertItem[element.client_order_id] = element;
                }
            }

            const deleteItem = {};
            for (let r = 0; r < result.length; r++) {
                const element = result[r];
                if (
                    !updateItem[element.client_order_id] &&
                    !insertItem[element.client_order_id]
                ) {
                    deleteItem[element.client_order_id] = element;
                }
            }
            const listInsert = [];
            for (const key1 in insertItem) {
                const element = insertItem[key1];
                listInsert.push(element);
            }
            if (listInsert.length > 0) {
                // console.log(`ORDER CACHE ==>  INSERT ORDERS: ${JSON.stringify(listInsert)}`);
                openOrdersInstance
                    .insert(listInsert)
                    .then((result) => {
                        logDevice(
                            'info',
                            `CACHE ==> INSERT SUCCESS: ${JSON.stringify(
                                result
                            )}`
                        );
                        // console.log(`ORDER CACHE ==>  INSERT ORDERS SUCCESS: - ${fileName}`);
                    })
                    .catch((e) => {
                        logDevice(
                            'info',
                            `CACHE ==>  UPDATE ORDER_ID: ${element.oldData._id} ERROR`
                        );
                        // console.log(`ORDER CACHE ==>  INSERT ORDERS ERROR - ${fileName}`);
                    });
            }

            const queryDel = { $or: [] };
            for (const key2 in deleteItem) {
                const element = deleteItem[key2];
                queryDel.$or.push({ client_order_id: element.client_order_id });
            }
            if (queryDel.$or.length > 0) {
                // console.log(`ORDER CACHE ==>  DELETE ORDERS: ${JSON.stringify(queryDel.$or)}`);
                openOrdersInstance
                    .remove(queryDel)
                    .then(() => {
                        logDevice('info', `CACHE ==>  DELETE SUCCESS`);
                        // console.log(`ORDER CACHE ==>  DELETE ORDERS SUCCESS - ${fileName}`);
                    })
                    .catch((e) => {
                        logDevice(
                            'info',
                            `CACHE ==>  UPDATE ORDER_ID: ${element.oldData._id} ERROR`
                        );
                        // console.log(`ORDER CACHE ==>  DELETE ORDERS ERROR - ${fileName}`);
                    });
            }

            for (const key3 in updateItem) {
                const element = updateItem[key3];
                // console.log(`ORDER CACHE ==>  UPDATE ORDERS: ${JSON.stringify(element)}`);
                openOrdersInstance
                    .update(element.newData, { _id: element.oldData._id })
                    .then(() => {
                        logDevice(
                            'info',
                            `CACHE ==>  UPDATE ORDER_ID: ${element.oldData._id} SUCCESS`
                        );
                        // console.log(`ORDER CACHE ==>  DELETE ORDERS SUCCESS: ${key3} - ${fileName}`);
                    })
                    .catch((e) => {
                        logDevice(
                            'info',
                            `CACHE ==>  UPDATE ORDER_ID: ${element.oldData._id} ERROR`
                        );
                        // console.log(`ORDER CACHE ==>  ERR ORDERS ERROR: ${key3} - ${fileName}`);
                    });
            }
        })
        .catch((e) => {
            logDevice('info', `CACHE ==>  UPDATE ERROR syncOrdersToDatabase`);
        });
}

export function setRequestOrderState(type, state = true) {
    dataStorage.dicOrdersStatus[type] = state;
}

export function setRequestPersonalState(typePrice, state = true) {
    dataStorage.dicPersonalStatus[typePrice] = state;
}

function getOrderCacheKey(data) {
    const symbol = data.symbol;
    const brokerOrderID = data.broker_order_id;
    if (!symbol || !brokerOrderID) return '';
    const prefix = isParitech(symbol) ? 'AU' : 'US';
    return `${prefix}_${brokerOrderID}`;
}

function isParitech(symbol) {
    try {
        if (symbol === '...' || symbol === 'OTHERS') {
            return null;
        }
        const currency =
            symbol &&
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].currency
                ? dataStorage.symbolEquity[symbol].currency
                : enumType.CURRENCY.AUD;
        return currency === enumType.CURRENCY.AUD;
    } catch (error) {
        logDevice(
            `error`,
            `Func isParitech error: ${JSON.stringify(
                error
            )} with symbol: ${symbol}`
        );
        return null;
    }
}

export function setNewDataCaching(type, fileName, listData) {
    for (let u = 0; u < listData.length; u++) {
        const element = listData[u];
        const orderCacheKey = getOrderCacheKey(element);
        dataStorage.dicOrdersRealTimeCache[orderCacheKey] = element;
        console.log(
            `setNewDataCaching dataStorage.dicOrdersRealTimeCache[${orderCacheKey}]`,
            dataStorage.dicOrdersRealTimeCache[orderCacheKey]
        );
    }
    // console.log('base orders cache', Object.keys(dataStorage.dicOrdersRealTimeCache).length)
    setRequestOrderState(type);
    callOrdersHandler(type);

    // logDevice('info', `CACHE ==> SET DATA ${type} file NAME:  ${fileName} listData  ${listData ? JSON.stringify(listData) : ''}`);
    // const openOrdersInstance = getMongoInstance(`${dataStorage.accountId}_${fileName}`);
    // openOrdersInstance.removeAll().then(() => {
    //     if (listData.length) {
    //         openOrdersInstance.insert(listData).then(() => {
    //             logDevice('info', `CACHE ==> INSERT OPEN ORDER SUCCESS ${type} file NAME:  ${fileName}`);
    //             setRequestOrderState(type);
    //             callOrdersHandler(type)
    //         }).catch(e => {
    //             logDevice('info', `CACHE ==> INSERT OPEN ORDER ERROR ${type} file NAME:  ${fileName}`);
    //             logDevice('info', e);
    //             setRequestOrderState(type);
    //             callOrdersHandler(type, false)
    //         })
    //     } else {
    //         logDevice('info', `CACHE ==> CALL REQUEST STATE TYPE: ${type} file NAME:  ${fileName}`);
    //         setRequestOrderState(type);
    //         callOrdersHandler(type, false)
    //     }
    // });
}

export function setNewPersonalCaching(typePrice, fileName, listData) {
    dataStorage.dicPersonalRealTimeCache[typePrice] =
        dataStorage.dicPersonalRealTimeCache[typePrice] || {};
    for (let u = 0; u < listData.length; u++) {
        const element = listData[u];
        // eslint-disable-next-line standard/computed-property-even-spacing
        dataStorage.dicPersonalRealTimeCache[typePrice][
            element.symbol
        ] = element;
    }
    console.log(
        'dataStorage.dicPersonalRealTimeCache[typePrice]',
        dataStorage.dicPersonalRealTimeCache[typePrice]
    );
    setRequestPersonalState(typePrice);
    callPersonalHandler(typePrice);
}

function removeDataCache(fileName) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const newDate = new Date(year, month, date);
    const startTime = DateTime.addMonthsToTime(newDate, -12);
    const query = { exchange_updated: { $lt: startTime.getTime() } };
    const openOrdersInstance = getMongoInstance(
        `${dataStorage.accountId}_${fileName}`
    );
    openOrdersInstance
        .remove(query)
        .then((res) => {
            logDevice(
                'info',
                `CACHE ==> REMOVE CACHE DATA SUCCESS BEFORE ${startTime.getTime()}`
            );
        })
        .catch((err) => {
            logDevice(
                'info',
                `CACHE ==> REMOVE CACHE DATA ERROR BEFORE ${startTime.getTime()}`
            );
        });
}

export function removeOrdersOverYear() {
    removeDataCache(enumType.TABLE_NAME.filled_order);
    removeDataCache(enumType.TABLE_NAME.cancelled_order);
}
export function getOrders(type) {
    try {
        const now = new Date().getTime();
        const startTime = DateTime.convertLocationToStartDaySettingTime(now);
        const endTime = startTime + 24 * 60 * 60 * 1000 - 1;
        let openOrdersUrl = '';

        if (type === enumType.ORDERS_TYPE_FILTER.filled) {
            openOrdersUrl = getUrlOrderByTag(
                type,
                dataStorage.accountId,
                startTime,
                endTime
            );
        } else if (type === enumType.ORDERS_TYPE_FILTER.cancelled) {
            openOrdersUrl = getUrlOrderByTag(
                type,
                dataStorage.accountId,
                startTime,
                endTime
            );
        } else if (type === enumType.ORDERS_TYPE_FILTER.open) {
            openOrdersUrl = getUrlOrderByTag(type, dataStorage.accountId);
        } else if (type === enumType.ORDERS_TYPE_FILTER.stoploss) {
            openOrdersUrl = getUrlOrderByTag(type, dataStorage.accountId);
        }

        logDevice(
            'info',
            `CACHE ==> GET DATA WITH URL ${openOrdersUrl} input type: ${type}`
        );
        requestData(openOrdersUrl, false, null, true)
            .then((res) => {
                const newRes = res || [];
                if (type === enumType.ORDERS_TYPE_FILTER.filled) {
                    setNewDataCaching(
                        type,
                        enumType.TABLE_NAME.filled_order_intraday,
                        newRes
                    );
                } else if (type === enumType.ORDERS_TYPE_FILTER.cancelled) {
                    setNewDataCaching(
                        type,
                        enumType.TABLE_NAME.cancelled_order_intraday,
                        newRes
                    );
                } else if (type === enumType.ORDERS_TYPE_FILTER.open) {
                    console.log('setNewDataCaching working');
                    setNewDataCaching(
                        enumType.ORDERS_TYPE_FILTER.open,
                        enumType.TABLE_NAME.open_order,
                        newRes
                    );
                } else if (type === enumType.ORDERS_TYPE_FILTER.stoploss) {
                    setNewDataCaching(
                        enumType.ORDERS_TYPE_FILTER.stoploss,
                        enumType.TABLE_NAME.open_stoploss_order,
                        newRes
                    );
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (error) {
        console.error(error);
    }
}

export function getTotalPortfolio() {
    try {
        const accountID = dataStorage.accountId;
        const url = getNewTotalPortfolio(accountID);

        logDevice(
            'info',
            `CACHE ORDER TRANSACTIONS ==> GET DATA WITH URL ${url}`
        );
        requestData(url, false, null, true)
            .then((res) => {
                if (res) {
                    console.log('GET DATA PORTFOLIO FIRST', res);
                    dataStorage.dicTotalPortfolio = res;
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (error) {
        console.error(error);
    }
}

function getUserPosition() {
    return new Promise((resolve) => {
        const accountId = dataStorage.accountId;
        const urlUserPosition = getUrlUserPositionByAccountId(accountId);
        requestData(urlUserPosition, true)
            .then((data) => {
                if (data && Object.keys(data).length) {
                    dataStorage.dicPosition = {};
                    Object.keys(data).map((e) => {
                        if (data[e]) {
                            dataStorage.dicPosition[`${e}`] = true;
                        }
                    });
                    resolve();
                } else {
                    resolve();
                }
            })
            .catch((error) => {
                resolve();
                logDevice('error', `getUserPosition error: ${error}`);
            });
    });
}

function getTopOrderTransactionBySymbol(accountID, symbol) {
    return new Promise((resolve) => {
        const urlOrderTransaction = getUrlTopOrderTransaction(
            accountID,
            symbol
        );
        requestData(urlOrderTransaction, true, null, true).then((val) => {
            let listTransaction = [];
            if (val) {
                listTransaction = val;
                listTransaction.sort(function (a, b) {
                    return b.updated - a.updated;
                });
            }
            let objTransaction = {};
            objTransaction[symbol] = listTransaction;
            resolve(objTransaction);
        });
    });
}

export function getOrderTransactionByListPositions(listPositions) {
    const accountID = dataStorage.accountId;
    let dicPosition = {};
    let listPromise = [];
    for (let i = 0; i < listPositions.length; i++) {
        const data = listPositions[i];
        const symbol = data.symbol;
        if (symbol) {
            dicPosition[symbol] = true;
            listPromise.push(getTopOrderTransactionBySymbol(accountID, symbol));
        }
        if (dicPosition && Object.keys(dicPosition).length) {
            dataStorage.dicPosition = dicPosition;
        }
    }

    Promise.all(listPromise)
        .then((response) => {
            const transactionObj = {};
            response.map((result) => {
                const symbol = Object.keys(result);
                transactionObj[symbol] = result[symbol];
            });
            if (Object.keys(transactionObj).length) {
                dataStorage.dicOrderTransaction = transactionObj;
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

export function getOrderTransactions() {
    try {
        const accountID = dataStorage.accountId;
        // GET USER POSITION
        getUserPosition().then(() => {
            if (
                dataStorage.dicPosition &&
                Object.keys(dataStorage.dicPosition).length
            ) {
                let listPromise = [];
                Object.keys(dataStorage.dicPosition).map((symbol) => {
                    listPromise.push(
                        getTopOrderTransactionBySymbol(accountID, symbol)
                    );
                });
                Promise.all(listPromise)
                    .then((response) => {
                        const transactionObj = {};
                        response.map((result) => {
                            const symbol = Object.keys(result);
                            transactionObj[symbol] = result[symbol];
                        });
                        if (Object.keys(transactionObj).length) {
                            dataStorage.dicOrderTransaction = transactionObj;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        });
    } catch (error) {
        console.error(error);
    }
}

export function getPersonal(typePrice) {
    try {
        let url = '';
        if (typePrice === PriceDisplay.PERSONAL) {
            const userID = Controller.getUserId();
            url = getUrlUserWatchList(userID, 'user-watchlist');
        } else if (typePrice === PriceDisplay.SP20) {
            const type = 'top-asx-20/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.SP50) {
            const type = 'top-asx-50/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.SP100) {
            const type = 'top-asx-100/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.SP200) {
            const type = 'top-asx-200/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NYSE1) {
            const type = 'tradable-NYSE-01/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NYSE2) {
            const type = 'tradable-NYSE-02/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NYSE3) {
            const type = 'tradable-NYSE-03/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NYSE4) {
            const type = 'tradable-NYSE-04/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NYSE5) {
            const type = 'tradable-NYSE-05/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NASDAQ1) {
            const type = 'tradable-NASDAQ-01/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.NASDAQ2) {
            const type = 'tradable-NASDAQ-02/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.XASE) {
            const type = 'tradable-XASE/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.ARCX) {
            const type = 'tradable-ARCX/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.TOPGAINERS) {
            const type = 'top-price-gainer/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.TOPLOSERS) {
            const type = 'top-price-loser/0';
            url = getApiUrl(null, type);
        } else if (typePrice === PriceDisplay.TOPVALUE) {
            const type = 'top-price-market-value/0';
            url = getApiUrl(null, type);
        }
        logDevice(
            'info',
            `CACHE ==> GET DATA WITH URL ${url} input type: ${typePrice}`
        );
        requestData(url, true, null, true)
            .then((res) => {
                if (res) {
                    // Cache symbol info
                    const newRes = res.value || [];
                    getSymbolInfoFromListObjectSymbol(newRes);
                    if (typePrice === PriceDisplay.PERSONAL) {
                        saveDicPersonal(res);
                        setNewPersonalCaching(
                            typePrice,
                            enumType.TABLE_NAME.personal,
                            newRes
                        );
                    } else if (typePrice === PriceDisplay.SP20) {
                        setNewPersonalCaching(
                            typePrice,
                            `${enumType.TABLE_NAME.top}20`,
                            newRes
                        );
                    } else if (typePrice === PriceDisplay.SP50) {
                        setNewPersonalCaching(
                            typePrice,
                            `${enumType.TABLE_NAME.top}50`,
                            newRes
                        );
                    } else if (typePrice === PriceDisplay.SP100) {
                        setNewPersonalCaching(
                            typePrice,
                            `${enumType.TABLE_NAME.top}100`,
                            newRes
                        );
                    } else if (typePrice === PriceDisplay.SP200) {
                        setNewPersonalCaching(
                            typePrice,
                            `${enumType.TABLE_NAME.top}200`,
                            newRes
                        );
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (error) {
        console.error(error);
    }
}

export function getCheckChange() {
    return new Promise((resolve) => {
        const cacheUrl = getUrlCache();
        requestData(cacheUrl)
            .then((res) => {
                const newData = res || {};
                setDataCache(newData);
                resolve();
            })
            .catch((err) => {
                console.log(err);
                setDataCache({});
                resolve();
            });
    });
}

export function autoCheckChange(interval = TIME_CHECK_CHANGE) {
    if (Controller.getLoginStatus()) {
        const cacheUrl = getUrlCache();
        dataStorage.intervalCache && clearInterval(dataStorage.intervalCache);
        dataStorage.intervalCache = setInterval(() => {
            requestData(cacheUrl)
                .then((res) => {
                    const newData = res || {};
                    setDataCache(newData);
                })
                .catch((err) => {
                    setDataCache({});
                });
        }, interval);
    }
}
