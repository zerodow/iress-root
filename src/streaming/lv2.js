import * as StreamingBusiness from './streaming_business';
import * as StreamingStorage from './streaming_storage'
import * as Util from '../util';
import * as Api from '../api';
import * as Emitter from '@lib/vietnam-emitter';
import Nchan from '../nchan.1';
import Enum from '../enum';

const DEFAULT_VAL = Enum.DEFAULT_VAL;

let isConnected = true;
const nchanObj = {};
const dicData = {};
const listMsgBeforeSnapshot = [];
const listMsgLostConnect = [];

const sendItemChange = (exchange, symbol, item) => {
    const emitterName = StreamingBusiness.getChannelLv2(exchange, symbol);
    Emitter.emit(emitterName, { ...item });
};

export function processData(newData) {
    if (!isConnected || listMsgLostConnect.length > 0) {
        listMsgLostConnect.push(newData);
        return;
    }
    if (!hasSnapshot(newData.symbol, newData.exchange)) {
        listMsgBeforeSnapshot.push(newData);
        return;
    }

    insertOrUpdateData(newData, sendItemChange);
};

const onDataSub = newData => {
    const firstItem = newData['0'];
    if (!firstItem || !firstItem.exchanges || !firstItem.symbol || !firstItem.side) return;
    const item = {
        symbol: firstItem.symbol,
        exchange: firstItem.exchanges,
        side: firstItem.side,
        data: Util.getValueObject(newData)
    };
    processData(item);
};

const mergeMsgRealtimePrev = listData => {
    const dicRealtime = {};
    listData.map(newData => {
        const key = `${newData.exchange}##${newData.symbol}`;
        dicRealtime[key] = newData;
    });
    Object.keys(dicRealtime).map(key => processData(dicRealtime[key]));
    listData.length = 0;
};

export function onChangeNetwork(cnn) {
    isConnected = cnn;
    if (!isConnected) {
        listMsgLostConnect.length = 0;
        return;
    }
    const listSymbol = [];
    const dicSub = StreamingStorage.getDicSub()
    Object.keys(dicSub).map(exchange => {
        Object.keys(dicSub[exchange]).map(symbol => {
            listSymbol.push({ exchange, symbol });
        });
    });

    syncLv2Streaming(listSymbol)
        .then(() => {
            mergeMsgRealtimePrev(listMsgLostConnect);
        });
};

const syncLv2Streaming = listObjSymbol => {
    return new Promise((resolve, reject) => {
        getLv2Snapshot(listObjSymbol)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? bodyData.map(obj => syncDataHasNetwork(obj))
                    : [];
                resolve(mergeData);
            });
    });
};

const syncDataHasNetwork = newItem => {
    const symbol = newItem.symbol;
    const exchange = newItem.exchange;

    if (!newItem || !symbol || !exchange) return null;
    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = {
        symbol,
        exchange,
        'Bid': newItem.Bid || [],
        'Ask': newItem.Ask || []
    };
    return newItem;
};

const connectNchan = (exchange, symbol) => {
    const stringSymbol = encodeURIComponent(symbol);
    return new Promise(resolve => {
        const newNchanObj = new Nchan({
            url: Api.getLv2StreamingUrl(exchange, stringSymbol),
            fnGetOption: StreamingBusiness.getOptionStream,
            onData: onDataSub,
            reconnectTime: 3000,
            onConnect: () => {
                nchanObj[exchange] = nchanObj[exchange] || [];
                nchanObj[exchange][symbol] = newNchanObj;
                resolve();
            },
            onChangeNetwork
        });
    });
};

const removeSymbolUnsub = (exchange, symbol, idSub) => {
    const dicSub = StreamingStorage.getDicSub()
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    delete dicSub[exchange][symbol][idSub];
    if (!Util.objHasKeys(dicSub[exchange][symbol])) delete dicSub[exchange][symbol];
    if (!Util.objHasKeys(dicSub[exchange])) delete dicSub[exchange];

    if (dicData && dicData[exchange] && dicData[exchange][symbol]) {
        delete dicData[exchange][symbol];
        if (!Util.objHasKeys(dicData[exchange])) delete dicData[exchange];
    }

    if (dicSnapshot && dicSnapshot[exchange] && dicSnapshot[exchange][symbol]) {
        delete dicSnapshot[exchange][symbol];
        if (!Util.objHasKeys(dicSnapshot[exchange])) delete dicSnapshot[exchange];
    }
};

const mergeDataWithRealtime = listData => {
    return listData.map(symbolObj => {
        const symbol = symbolObj.symbol;
        const exchange = symbolObj.exchange;

        if (!symbolObj || !symbol || !exchange) return dataReq;
        dicData[exchange] = dicData[exchange] || {};
        dicData[exchange][symbol] = dicData[exchange][symbol] || {};
        dicData[exchange][symbol]['Bid'] = symbolObj.Bid || [];
        dicData[exchange][symbol]['Ask'] = symbolObj.Ask || [];

        return {
            symbol,
            exchange,
            Bid: dicData[exchange][symbol].Bid,
            Ask: dicData[exchange][symbol].Ask
        };
    });
};

const insertOrUpdateData = (newData, cb) => {
    const symbol = newData.symbol;
    const exchange = newData.exchange;

    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = dicData[exchange][symbol] || {};
    if (newData && newData.ask) {
        dicData[newData.exchange][newData.symbol].Ask = Util.getValueObject(newData.ask);
    }
    if (newData && newData.bid) {
        dicData[newData.exchange][newData.symbol].Bid = Util.getValueObject(newData.bid);
    }
    cb && cb(newData.exchange, newData.symbol, {
        symbol,
        exchange,
        Ask: dicData[newData.exchange][newData.symbol].Ask,
        Bid: dicData[newData.exchange][newData.symbol].Bid
    });
};

const hasSnapshot = (symbol, exchange) => {
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    return dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH] && dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange] && dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange][symbol];
};

const markSnapshot = listObjSymbol => {
    if (!Util.arrayHasItem(listObjSymbol)) return;
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    listObjSymbol.map(item => {
        if (!item || !item.exchange || !item.symbol) return;
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH] || {}
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][item.exchange] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][item.exchange] || {};
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][item.exchange][item.symbol] = true;
    });
    StreamingStorage.setDicSnapshot(dicSnapshot)
};

const getCurrentData = (symbol, exchange) => {
    return dicData[exchange] && dicData[exchange][symbol]
        ? {
            symbol,
            exchange,
            Bid: dicData[exchange][symbol].Bid,
            Ask: dicData[exchange][symbol].Ask
        }
        : null;
};

export function getLv2Snapshot(listObjSymbol) {
    return new Promise((resolve, reject) => {
        const dicExchange = {};
        listObjSymbol.map(item => {
            if (!dicExchange[item.exchange]) dicExchange[item.exchange] = [];
            dicExchange[item.exchange].push(item.symbol);
        });

        const listPromise = [];
        Object.keys(dicExchange).map(exchange => {
            const listSymbolString = StreamingBusiness.getStringSymbol(dicExchange[exchange]);
            listSymbolString.map(strSymbol => {
                const url = Api.getLv2Snapshot(exchange, strSymbol);
                listPromise.push(
                    new Promise(resolve => {
                        Api.requestData(url)
                            .then(bodyData => {
                                if (!bodyData) return resolve([]);
                                resolve(bodyData.map(symbolObj => {
                                    return {
                                        ...symbolObj,
                                        Bid: symbolObj.Bid
                                            ? Util.getValueObject(symbolObj.Bid)
                                            : [],
                                        Ask: symbolObj.Ask
                                            ? Util.getValueObject(symbolObj.Ask)
                                            : []
                                    }
                                }));
                            })
                            .catch(() => resolve([]));
                    }));
            });
        });
        Promise.all(listPromise)
            .then(response => {
                let listPrice = [];
                response.map(result => listPrice = [...listPrice, ...result]);
                resolve(listPrice);
            })
            .catch(err => {
                reject(err);
            });
    });
};

export function getLv2Streaming(listObjSymbol) {
    return new Promise((resolve, reject) => {
        const listSymbolHasSnapshot = [];
        const listSymbolNotSnapshot = [];
        listObjSymbol.map(item => {
            hasSnapshot(item.symbol, item.exchange)
                ? listSymbolHasSnapshot.push(item)
                : listSymbolNotSnapshot.push(item);
        });

        getLv2Snapshot(listSymbolNotSnapshot)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? mergeDataWithRealtime(bodyData)
                    : [];

                markSnapshot(bodyData);
                mergeMsgRealtimePrev(listMsgBeforeSnapshot);

                listSymbolHasSnapshot.map(item => {
                    mergeData.push(getCurrentData(item.symbol, item.exchange));
                });
                resolve([...mergeData]);
            });
    });
};

const subWithExchange = (exchange, symbol, idSub) => {
    if (!exchange || !symbol || !idSub) return;
    return new Promise(resolve => {
        const dicSub = StreamingStorage.getDicSub()
        if (dicSub[exchange] && dicSub[exchange][symbol]) {
            dicSub[exchange][symbol][idSub] = true;
            return resolve();
        } else {
            dicSub[exchange] = dicSub[exchange] || {};
            dicSub[exchange][symbol] = dicSub[exchange][symbol] || {};
            dicSub[exchange][symbol][idSub] = true;
            return connectNchan(exchange, symbol).then(resolve);
        }
    });
};

const unsubWithExchange = (exchange, symbol, idSub) => {
    const dicSub = StreamingStorage.getDicSub()
    if (!dicSub[exchange] ||
        !dicSub[exchange][symbol] ||
        !dicSub[exchange][symbol][idSub]) return;

    removeSymbolUnsub(exchange, symbol, idSub);

    if (!nchanObj[exchange] || !nchanObj[exchange][symbol]) return;
    const currentNchan = nchanObj[exchange][symbol];
    currentNchan.close && currentNchan.close();

    delete nchanObj[exchange][symbol];
    if (!Util.objHasKeys(nchanObj[exchange])) delete nchanObj[exchange];
};

export function getLv2(listObjSymbol, forceSub) {
    return forceSub
        ? getLv2Streaming(listObjSymbol)
        : getLv2Snapshot(listObjSymbol);
};

export function sub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    Promise
        .all(listSymbolObj.map(obj => subWithExchange(obj.exchange, obj.symbol, idSub)))
        .then(onOpen);
    // Util.fakeLv2(listSymbolObj, processData);
    // onOpen();
};

export function unsub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    Promise
        .all(listSymbolObj.map(obj => unsubWithExchange(obj.exchange, obj.symbol, idSub)))
        .then(onOpen);
};
