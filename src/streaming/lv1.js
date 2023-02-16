import * as Api from '../api';
import * as StreamingBusiness from './streaming_business';
import * as StreamingStorage from './streaming_storage'
import * as Util from '../util';
import Enum from '../enum';
import Nchan from '../nchan.1';
import VietNamQueue from '@lib/vietnam-queue';
import * as Emitter from '@lib/vietnam-emitter';

const DEFAULT_VAL = Enum.DEFAULT_VAL;

let isConnected = true;
const nchanObj = {};
const nchanObjTemp = {};
const dicData = {};
const listMsgBeforeSnapshot = [];
const listMsgLostConnect = [];
const HistoricalQueue = new VietNamQueue();

const sendItemChange = (exchange, symbol, item) => {
    const emitterName = StreamingBusiness.getChannelLv1(exchange, symbol);
    Emitter.emit(emitterName, { ...item });
};

export function processData(newData) {
    if (!newData.symbol || !newData.exchange) return;
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

const mergeMsgRealtimePrev = listData => {
    const dicRealtime = {};
    listData.map(newData => {
        if (!newData) return;

        const key = `${newData.exchange}##${newData.symbol}`;
        dicRealtime[key] = dicRealtime[key]
            ? {
                ...dicRealtime[key],
                ...newData
            }
            : newData;
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
    const dicSub = StreamingStorage.getDicSub()
    const listSymbol = [];
    Object.keys(dicSub).map(exchange => {
        Object.keys(dicSub[exchange]).map(symbol => {
            listSymbol.push({ exchange, symbol });
        });
    });

    syncLv1Streaming(listSymbol)
        .then(() => {
            mergeMsgRealtimePrev(listMsgLostConnect);
        });
};

const connectNchan = (exchange, stringSymbol) => {
    return new Promise(resolve => {
        const newNchanObj = new Nchan({
            url: Api.getLv1StreamingUrl(exchange, stringSymbol),
            fnGetOption: StreamingBusiness.getOptionStream,
            onData: processData,
            timeout: 20000,
            reconnectTime: 1000,
            onConnect: () => {
                nchanObj[exchange] = nchanObj[exchange] || [];
                nchanObj[exchange].push(newNchanObj);
                resolve();
            },
            onError: () => {
                resolve();
            },
            onChangeNetwork
        });
    });
};

const removeSymbolUnsub = (exchange, listSymbol, idSub) => {
    const dicSub = StreamingStorage.getDicSub()
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    listSymbol.map(symbol => {
        try {
            if (!dicSub || !dicSub[exchange] || !dicSub[exchange][symbol] || !dicSub[exchange][symbol][idSub]) return;

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
        } catch (error) {
            console.log(error);
        }
    });
};

export const mergeDataWithRealtime = dataReq => {
    const symbol = dataReq.symbol;
    const exchange = dataReq.exchange;

    if (dataReq && symbol && exchange) {
        dicData[exchange] = dicData[exchange] || {};
        dicData[exchange][symbol] = dataReq;
    }
    return dataReq;
};

const syncDataHasNetwork = dataReq => {
    if (!dataReq || !dataReq.symbol || !dataReq.exchange) return dataReq;

    const symbol = dataReq.symbol;
    const exchange = dataReq.exchange;

    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = dataReq;

    return dataReq;
};

const hasSnapshot = (symbol, exchange) => {
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    return dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE] && dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange] && dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange][symbol];
};

const getCurrentData = (symbol, exchange) => {
    return dicData[exchange] && dicData[exchange][symbol]
        ? { ...dicData[exchange][symbol] }
        : null;
};

const insertOrUpdateData = (newData, cb) => {
    dicData[newData.exchange] = dicData[newData.exchange] || {};
    dicData[newData.exchange][newData.symbol] = dicData[newData.exchange][newData.symbol]
        ? {
            ...dicData[newData.exchange][newData.symbol],
            ...newData
        }
        : newData;
    cb && cb(newData.exchange, newData.symbol, dicData[newData.exchange][newData.symbol]);
};

const markSnapshot = listObjSymbol => {
    if (!Util.arrayHasItem(listObjSymbol)) return;
    const dicSnapshot = StreamingStorage.getDicSnapshot()
    listObjSymbol.map(item => {
        if (!item || !item.exchange || !item.symbol) return;
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE] || {}
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][item.exchange] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][item.exchange] || {};
        dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][item.exchange][item.symbol] = true;
    });
    StreamingStorage.setDicSnapshot(dicSnapshot)
}

export function getLv1Snapshot(listObjSymbol) {
    return new Promise((resolve, reject) => {
        if (!Util.arrayHasItem(listObjSymbol)) return resolve([]);

        const dicExchange = {};
        listObjSymbol.map(item => {
            dicExchange[item.exchange] = dicExchange[item.exchange] || [];
            dicExchange[item.exchange].push(item.symbol);
        });

        const listPromise = [];
        Object.keys(dicExchange).map(exchange => {
            const listSymbolString = StreamingBusiness.getStringSymbol(dicExchange[exchange]);
            listSymbolString.map(strSymbol => {
                const url = Api.getLv1Snapshot(exchange, strSymbol);
                listPromise.push(
                    new Promise(resolve => {
                        Api.requestData(url)
                            .then(bodyData => resolve(bodyData || []))
                            .catch(() => resolve([]));
                    }));
            });
        });
        Promise.all(listPromise)
            .then(response => {
                const listPrice = [];
                response.map(result => {
                    listPrice.push(...result);
                });
                resolve(listPrice);
            })
            .catch(err => reject(err));
    });
};

const syncLv1Streaming = listObjSymbol => {
    return new Promise((resolve, reject) => {
        getLv1Snapshot(listObjSymbol)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? bodyData.map(obj => syncDataHasNetwork(obj))
                    : [];
                resolve(mergeData);
            });
    });
};

export function getLv1Streaming(listObjSymbol) {
    return new Promise(resolve => {
        const listSymbolHasSnapshot = [];
        const listSymbolNotSnapshot = [];
        listObjSymbol.map(item => {
            hasSnapshot(item.symbol, item.exchange)
                ? listSymbolHasSnapshot.push(item)
                : listSymbolNotSnapshot.push(item);
        });

        getLv1Snapshot(listSymbolNotSnapshot)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? bodyData.map(obj => mergeDataWithRealtime(obj))
                    : [];

                markSnapshot(bodyData);
                mergeMsgRealtimePrev(listMsgBeforeSnapshot);

                listSymbolHasSnapshot.map(item => {
                    if (!item || !item.symbol || !item.exchange) return;
                    mergeData.push(getCurrentData(item.symbol, item.exchange));
                });
                resolve([...mergeData]);
            });
    });
};

const subWithExchange = (exchange, listSymbol, idSub) => {
    return new Promise(resolve => {
        const dicSub = StreamingStorage.getDicSub()
        const isSubAll = StreamingBusiness.checkSymbolSub({
            idSub,
            exchange,
            listSymbol,
            dicObj: dicSub
        });
        if (isSubAll) return resolve();

        const listSymbolString = StreamingBusiness.getStringSymbol(Object.keys(dicSub[exchange]));
        const listPromise = listSymbolString.map(str => connectNchan(exchange, str));
        Promise.all(listPromise).then(() => {
            nchanObjTemp[exchange] && nchanObjTemp[exchange].map(item => {
                item && item.close && item.close();
            });
            nchanObjTemp[exchange] = [];
            resolve();
        });
    });
};

const unsubWithExchange = (exchange, listSymbol, idSub) => {
    return new Promise(resolve => {
        const dicSub = StreamingStorage.getDicSub()
        if (!dicSub[exchange]) return resolve();
        removeSymbolUnsub(exchange, listSymbol, idSub);

        if (Util.objHasKeys(dicSub[exchange])) {
            const listSymbolString = StreamingBusiness.getStringSymbol(Object.keys(dicSub[exchange]));
            const listPromise = listSymbolString.map(str => connectNchan(exchange, str));
            Promise.all(listPromise).then(() => {
                nchanObjTemp[exchange] && nchanObjTemp[exchange].map(item => {
                    item && item.close && item.close();
                });
                nchanObjTemp[exchange] = [];
                return resolve();
            });
        } else {
            nchanObjTemp[exchange].map(item => {
                item && item.close && item.close();
            });
            nchanObjTemp[exchange] = [];
            return resolve();
        }
    });
};

export function getLv1(listObjSymbol, forceSub) {
    return forceSub
        ? getLv1Streaming(listObjSymbol)
        : getLv1Snapshot(listObjSymbol);
};

function subQueue({ listSymbolObj, idSub, onOpen }) {
    return new Promise(resolve => {
        const dicExchange = {};
        const listPromise = [];

        listSymbolObj.map(obj => {
            const exchange = obj.exchange;
            const symbol = obj.symbol;
            if (!dicExchange[exchange]) dicExchange[exchange] = [];
            dicExchange[exchange].push(symbol);
        });

        Object.keys(dicExchange).map(exchange => {
            nchanObjTemp[exchange] = nchanObj[exchange] || [];
            nchanObj[exchange] = [];
            listPromise.push(subWithExchange(exchange, dicExchange[exchange], idSub));
        });

        Promise.all(listPromise).then(() => {
            resolve();
            onOpen();
        });
    });
};

function unsubQueue({ listSymbolObj, idSub, onOpen }) {
    return new Promise(resolve => {
        const dicExchange = {};
        const listPromise = [];
        listSymbolObj.map(obj => {
            if (!obj || !obj.exchange || !obj.symbol) return;

            const exchange = obj.exchange;
            const symbol = obj.symbol;
            dicExchange[exchange] = dicExchange[exchange] || [];
            dicExchange[exchange].push(symbol);
        });

        Object.keys(dicExchange).map(exchange => {
            nchanObjTemp[exchange] = nchanObj[exchange] || [];
            nchanObj[exchange] = [];
            listPromise.push(unsubWithExchange(exchange, dicExchange[exchange], idSub));
        });

        Promise.all(listPromise).then(() => {
            resolve();
            onOpen();
        });
    });
};

export function sub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    HistoricalQueue.push(subQueue, { listSymbolObj, idSub, onOpen });

    // Util.fakeLv1(listSymbolObj, processData);
};

export function unsub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    HistoricalQueue.push(unsubQueue, { listSymbolObj, idSub, onOpen });
};
