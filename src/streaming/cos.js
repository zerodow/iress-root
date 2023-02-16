import * as StreamingBusiness from './streaming_business';
import * as StreamingStorage from './streaming_storage'
import * as Util from '../util';
import * as Api from '../api';
import * as Emitter from '@lib/vietnam-emitter';
import Nchan from '../nchan.1';
import Enum from '../enum';

const DEFAULT_VAL = Enum.DEFAULT_VAL;
const OBJ = Util.OBJ;
const MAX_LENGTH_COS = Enum.MAX_LENGTH_COS

let isConnected = true;
const nchanObj = {};
const dicData = {};
let listMsgBeforeSnapshot = [];
let listMsgLostConnect = [];

const sendItemChange = (exchange, symbol, item) => {
    const emitterName = StreamingBusiness.getChannelCos(exchange, symbol);
    Emitter.emit(emitterName, [...item]);
};

export function processData(newData, symbol, exchange) {
    if (!isConnected || listMsgLostConnect.length > 0) {
        listMsgLostConnect = newData.concat(listMsgLostConnect)
        return;
    }
    if (!hasSnapshot(symbol, exchange)) {
        listMsgBeforeSnapshot = newData.concat(listMsgBeforeSnapshot)
        return;
    }

    insertOrUpdateData(newData, symbol, exchange, sendItemChange);
};

const onDataSub = listData => {
    const dicData = {};
    for (const item of listData) {
        if (!item.id || !item.symbol || !item.exchange) continue;
        const key = `${item.symbol}##${item.exchange}##${item.id}`;
        dicData[key] = dicData[key]
            ? {
                ...dicData[key],
                ...item
            }
            : item;
    }
    Object.keys(dicData).map(key => processData(dicData[key]));
};

const mergeMsgRealtimePrev = (listData, symbol, exchange) => {
    if (listData.length === 0 || !symbol || !exchange) return
    const dataTemp = [...listData, ...dicData[exchange][symbol]]
    const data = dataTemp.slice(0, MAX_LENGTH_COS)

    sendItemChange(exchange, symbol, data)
    listData.length = 0;
    dataTemp.length = 0;
    data.length = 0;
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

    syncCosStreaming(listSymbol)
        .then(() => {
            mergeMsgRealtimePrev(listMsgLostConnect);
        });
};

const syncDataHasNetwork = dataReq => {
    const symbol = dataReq.symbol;
    const exchange = dataReq.exchange;

    if (!dataReq || !symbol || !exchange) return dataReq;
    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = {};
    dataReq.data.map(item => {
        dicData[exchange][symbol][item.id] = item;
    });
    return dataReq;
};

const syncCosStreaming = listObjSymbol => {
    return new Promise((resolve) => {
        getCosSnapshot(listObjSymbol)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? updateDicData(bodyData)
                    : [];
                resolve(mergeData);
            });
    });
};

const connectNchan = (exchange, symbol) => {
    const stringSymbol = encodeURIComponent(symbol);
    return new Promise(resolve => {
        const newNchanObj = new Nchan({
            url: Api.getAllStreamingMarketUrl(stringSymbol),
            fnGetOption: StreamingBusiness.getOptionStream,
            onData: processData,
            reconnectTime: 3000,
            onConnect: () => {
                nchanObj[exchange] = nchanObj[exchange] || {};
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
    if (dicSub && Util.OBJ.getVal(dicSub, [exchange, symbol, idSub])) {
        delete dicSub[exchange][symbol][idSub];
        if (!Util.objHasKeys(dicSub[exchange][symbol])) delete dicSub[exchange][symbol];
        if (!Util.objHasKeys(dicSub[exchange])) delete dicSub[exchange];
    }

    if (dicData && Util.OBJ.getVal(dicData, [exchange, symbol])) {
        delete dicData[exchange][symbol];
        if (!Util.objHasKeys(dicData[exchange])) delete dicData[exchange];
    }

    if (dicSnapshot && Util.OBJ.getVal(dicSnapshot, [exchange, symbol])) {
        delete dicSnapshot[exchange][symbol];
        if (!Util.objHasKeys(dicSnapshot[exchange])) delete dicSnapshot[exchange];
    }
};

const mergeDataWithRealtime = item => {
    if (!item || !item.symbol || !item.symbol) return null;

    const symbol = item.symbol;
    const exchange = item.exchange;
    const newItem = {
        symbol,
        exchange
    };

    newItem.data = item.data.map(dataReq => {
        if (!dataReq.id) return null;
        dicData[exchange] = dicData[exchange] || {};
        dicData[exchange][symbol] = dicData[exchange][symbol] || {};
        dicData[exchange][symbol][dataReq.id] = dataReq;
        return dataReq;
    });

    return newItem;
};

const updateDicData = response => {
    const obj = response[0] || {}
    const data = obj.data || []
    const { exchange, symbol } = obj
    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = data;
    return response
}

export const updateDicDataAOI = (exchange, symbol, trades = []) => {
    const data = Util.getValueObject(trades)
    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = data;
}

const updateDicDataRealtime = (exchange, symbol, newData) => {
    console.log('before slice', dicData[exchange][symbol].length)
    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = dicData[exchange][symbol] || []
    dicData[exchange][symbol] = newData.concat(dicData[exchange][symbol])
    dicData[exchange][symbol] = dicData[exchange][symbol].slice(0, MAX_LENGTH_COS)
}

const insertOrUpdateData = (newData, symbol, exchange, cb) => {
    updateDicDataRealtime(exchange, symbol, newData)
    console.log('after slice', dicData[exchange][symbol].length)
    cb && cb(exchange, symbol, [{
        exchange,
        symbol,
        data: dicData[exchange][symbol]
    }]);
};

const hasSnapshot = (symbol, exchange) => {
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    return dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES] && dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange] && dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange][symbol];
};

const markSnapshot = listObjSymbol => {
    if (!Util.arrayHasItem(listObjSymbol)) return;
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    listObjSymbol.map(item => {
        if (!item || !item.exchange || !item.symbol) return;
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES] || {}
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][item.exchange] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][item.exchange] || {};
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][item.exchange][item.symbol] = true;
    });
    StreamingStorage.setDicSnapshot(dicSnapshot)
};

const getCurrentData = (symbol, exchange) => {
    return dicData[exchange] && dicData[exchange][symbol]
        ? dicData[exchange][symbol]
        : null;
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

export function getCosSnapshot(listObjSymbol) {
    return new Promise((resolve, reject) => {
        const dicExchange = {};
        listObjSymbol.map(item => {
            dicExchange[item.exchange] = dicExchange[item.exchange] || [];
            dicExchange[item.exchange].push(item.symbol);
        });

        const listPromise = [];
        Object.keys(dicExchange).map(exchange => {
            const listSymbolString = StreamingBusiness.getStringSymbol(dicExchange[exchange]);
            listSymbolString.map(strSymbol => {
                const url = Api.getCosSnapshot(exchange, strSymbol);
                listPromise.push(
                    new Promise(resolve => {
                        Api.requestData(url)
                            .then(bodyData => {
                                if (!bodyData) return resolve([]);
                                const parseData = bodyData.map(symbolData => {
                                    return {
                                        ...symbolData,
                                        data: Util.getValueObject(symbolData.data)
                                    };
                                });
                                resolve(parseData);
                            })
                            .catch(() => resolve([]));
                    }))
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

export function getCosStreaming(listObjSymbol) {
    return new Promise((resolve, reject) => {
        const listSymbolHasSnapshot = [];
        const listSymbolNotSnapshot = [];
        listObjSymbol.map(item => {
            hasSnapshot(item.symbol, item.exchange)
                ? listSymbolHasSnapshot.push(item)
                : listSymbolNotSnapshot.push(item);
        });

        getCosSnapshot(listSymbolNotSnapshot)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? updateDicData(bodyData)
                    : []
                const objData = mergeData[0] || {}
                const { symbol, exchange } = objData
                markSnapshot(bodyData);
                mergeMsgRealtimePrev(listMsgBeforeSnapshot, symbol, exchange);

                listSymbolHasSnapshot.map(item => {
                    mergeData.push({
                        symbol: item.symbol,
                        exchange: item.exchange,
                        data: getCurrentData(item.symbol, item.exchange)
                    });
                });
                resolve([...mergeData]);
            });
    });
};

export function getCos(listObjSymbol, forceSub) {
    return forceSub
        ? getCosStreaming(listObjSymbol)
        : getCosSnapshot(listObjSymbol);
};

export function sub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    Promise
        .all(listSymbolObj.map(obj => subWithExchange(obj.exchange, obj.symbol, idSub)))
        .then(onOpen);
    // Util.fakeCos(listSymbolObj, processData);
    // onOpen();
};

export function unsub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    Promise
        .all(listSymbolObj.map(obj => unsubWithExchange(obj.exchange, obj.symbol, idSub)))
        .then(onOpen);
};
