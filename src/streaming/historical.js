import * as Api from '../api';
import * as Emitter from '@lib/vietnam-emitter';
import * as StreamingBusiness from './streaming_business';
import VietNamQueue from '@lib/vietnam-queue';
import * as Util from '../util';
import Enum from '../enum';
import Nchan from '../nchan.1';

const HistoricalQueue = new VietNamQueue();
const DEFAULT_VAL = Enum.DEFAULT_VAL;
const OBJ = Util.OBJ;

const NchanObj = {};
const NchanObjTemp = {};
const DicSub = {};

const onDataSub = listData => {
    if (!Util.arrayHasItem(listData)) return;

    const dicTemp = {};
    listData.map(newData => {
        if (!newData || !newData.exchange || !newData.symbol || !newData.interval) return;
        const key = `${newData.exchange}##${newData.symbol}##${newData.interval}`;
        dicTemp[key] = dicTemp[key]
            ? {
                ...dicTemp[key],
                ...newData
            }
            : newData;
    });
    Object.keys(dicTemp).map(key => {
        const newData = dicTemp[key];
        const emitterName = StreamingBusiness.getChannelHistorical(newData.exchange, newData.symbol, newData.interval);
        newData.updated = newData.time;
        Emitter.emit(emitterName, newData);
    });
};

const connectNchan = (interval, exchange, stringSymbol) => {
    return new Promise(resolve => {
        const newNchanObj = new Nchan({
            url: Api.getHistoricalStreamingUrl(exchange, stringSymbol, interval),
            fnGetOption: StreamingBusiness.getOptionStream,
            onData: onDataSub,
            reconnectTime: 3000,
            timePushBlob: 500,
            onConnect: () => {
                Util.OBJ.setObjectable(NchanObj, interval);
                Util.OBJ.setArrayable(NchanObj[interval], exchange);
                NchanObj[interval][exchange].push(newNchanObj);
                resolve();
            }
        });
    });
};

const removeSymbolUnsub = (interval, exchange, listSymbol, idSub) => {
    if (!Util.OBJ.getVal(DicSub, [interval, exchange])) return;
    listSymbol.map(symbol => {
        Util.OBJ.clearLastProp(DicSub, [interval, exchange, symbol, idSub]);
        Util.OBJ.clearIfObjEmpty(DicSub, [interval, exchange, symbol]);
    });
    Util.OBJ.clearIfObjEmpty(DicSub, [interval, exchange]);
    Util.OBJ.clearIfObjEmpty(DicSub, [interval]);
};

const subWithExchange = (interval, exchange, listSymbol, idSub) => {
    return new Promise(resolve => {
        const isSubAll = StreamingBusiness.checkSymbolSubHistorical({
            idSub,
            exchange,
            interval,
            listSymbol,
            dicObj: DicSub
        });
        if (isSubAll) return resolve();

        if (Util.OBJ.getVal(NchanObj, [interval, exchange])) {
            Util.OBJ.setObjectable(NchanObjTemp, interval);
            NchanObjTemp[interval][exchange] = Util.OBJ.getVal(NchanObj, [interval, exchange]) || [];
            Util.OBJ.clearLastProp(NchanObj, [interval, exchange]);
            Util.OBJ.clearIfObjEmpty(NchanObj, [interval]);
        }

        const listSymbolString = StreamingBusiness.getStringSymbol(Object.keys(DicSub[interval][exchange]));
        const listPromise = listSymbolString.map(str => connectNchan(interval, exchange, str));
        Promise.all(listPromise).then(() => {
            const listNchan = Util.OBJ.getVal(NchanObjTemp, [interval, exchange]);
            if (listNchan) {
                listNchan.map(item => {
                    item && item.close && item.close();
                });
                Util.OBJ.clearLastProp(NchanObjTemp, [interval, exchange]);
                Util.OBJ.clearIfObjEmpty(NchanObjTemp, [interval]);
            }
            resolve();
        });
    });
};

const unsubWithExchange = (interval, exchange, listSymbol, idSub) => {
    return new Promise(async resolve => {
        if (!DicSub[interval] || !DicSub[interval][exchange]) return resolve();
        removeSymbolUnsub(interval, exchange, listSymbol, idSub);

        if (Util.OBJ.getVal(NchanObj, [interval, exchange])) {
            Util.OBJ.setObjectable(NchanObjTemp, interval);
            NchanObjTemp[interval][exchange] = Util.OBJ.getVal(NchanObj, [interval, exchange]) || [];
            Util.OBJ.clearLastProp(NchanObj, [interval, exchange]);
            Util.OBJ.clearIfObjEmpty(NchanObj, [interval]);
        }

        if (Util.OBJ.getVal(DicSub, [interval, exchange])) {
            const listSubSymbol = Object.keys(DicSub[interval][exchange]);
            const listSymbolString = StreamingBusiness.getStringSymbol(listSubSymbol);
            const listPromise = listSymbolString.map(str => connectNchan(interval, exchange, str));
            await Promise.all(listPromise);
        }

        const listNchan = Util.OBJ.getVal(NchanObjTemp, [interval, exchange]);
        if (listNchan && listNchan.length > 0) {
            listNchan.map(item => {
                item && item.close && item.close();
            });
            Util.OBJ.clearLastProp(NchanObjTemp, [interval, exchange]);
            Util.OBJ.clearIfObjEmpty(NchanObjTemp, [interval]);
        }
        return resolve();
    });
};

function subQueue({ listSymbolObj, idSub, onOpen }) {
    return new Promise(resolve => {
        const dicInterval = {};
        const listPromise = [];

        listSymbolObj.map(obj => {
            const exchange = obj.exchange;
            const symbol = obj.symbol;
            const interval = obj.interval;
            if (!exchange || !symbol || !interval) return;
            Util.OBJ.setObjectable(dicInterval, interval);
            Util.OBJ.setArrayable(dicInterval[interval], exchange);
            dicInterval[interval][exchange].push(symbol);
        });

        Object.keys(dicInterval).map(interval => {
            Object.keys(dicInterval[interval]).map(exchange => {
                listPromise.push(subWithExchange(interval, exchange, dicInterval[interval][exchange], idSub));
            });
        });

        Promise.all(listPromise).then(() => {
            resolve();
            onOpen();
        });
    });
};

function unsubQueue({ listSymbolObj, idSub, onOpen }) {
    return new Promise(resolve => {
        const dicInterval = {};
        const listPromise = [];

        listSymbolObj.map(obj => {
            const exchange = obj.exchange;
            const symbol = obj.symbol;
            const interval = obj.interval;
            if (!exchange || !symbol || !interval) return;
            Util.OBJ.setObjectable(dicInterval, interval);
            Util.OBJ.setArrayable(dicInterval[interval], exchange);
            dicInterval[interval][exchange].push(symbol);
        });

        Object.keys(dicInterval).map(interval => {
            Object.keys(dicInterval[interval]).map(exchange => {
                listPromise.push(unsubWithExchange(interval, exchange, dicInterval[interval][exchange], idSub));
            });
        });

        Promise.all(listPromise).then(() => {
            resolve();
            onOpen();
        });
    });
};

export function sub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    HistoricalQueue.push(subQueue, { listSymbolObj, idSub, onOpen });

    // Util.fakeHistorical(listSymbolObj, onDataSub);
};

export function unsub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
    HistoricalQueue.push(unsubQueue, { listSymbolObj, idSub, onOpen });
};
