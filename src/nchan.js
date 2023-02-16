import { EventEmitter } from 'fbemitter';
import Mongo from './lib/base/mongo';
// import NchanSubscriber from 'nchan';
import config from './config';
import { func } from './storage';
import { logDevice } from './lib/base/functionUtil';
export const emitter = new EventEmitter();
export const dicData = {
}
export const dicRegister = {
}
export const dicCheck = {
}

function getEventName(type, pattern, code) {
    if (!type || !pattern) return null;
    return `${type}|${pattern}|${code}`;
}
export function unregister(opt = {}) {
    const { type, pattern, code, registerToken } = opt;
    const eventName = getEventName(type, pattern, code);
    let listRegis = dicRegister[eventName] || [];
    const indexOfItem = listRegis.indexOf(registerToken);
    if (indexOfItem >= 0) {
        const itemH = listRegis[indexOfItem];
        itemH.remove();
        listRegis = listRegis.slice(listRegis, 1);
    }
    dicRegister[eventName] = listRegis;
    if (listRegis.length < 0) {
        delete dicData[type + pattern];
        const sub = dicCheck[type + pattern];
        sub && sub.stop();
        delete dicCheck[type + pattern];
    }
    // dicData[type + pattern] = null;
}
export function register(opt = {}) {
    const { type, pattern, code, callback } = opt;
    const eventName = getEventName(type, pattern, code);
    const dataTemp = dicData[type + pattern] || {};
    const data = dataTemp.data || {};
    const dataLevel2 = data[code];
    const listRegis = dicRegister[eventName] || [];
    const itemH = emitter.addListener(eventName, callback);
    listRegis.push(itemH);
    dicRegister[eventName] = listRegis;
    if (dataLevel2) {
        emitter.emit(eventName, dataLevel2);
    }
    return itemH;
}

export function mergeData(type, keyPattern, dicResponse, keyP) {
    try {
        const dataReturn = {};
        const dataTemp = dicData[type + keyPattern] || {};
        const data = dataTemp.data || {};
        for (const key in dicResponse) {
            let dataDic = dicResponse[key];
            const dataList = data[key] || [];
            for (let t = 0; t < dataList.length; t++) {
                const element = dataList[t];
                dataDic = assignData(dataDic, element);
            }
            const eventName = getEventName(type, keyPattern, keyP || getKeyVal(dataDic));
            // if (dataDic.symbol === 'ADV.AU') {
            //     console.log('dataDic:', dataDic);
            // }
            emitter.emit(eventName, dataDic);
            dataReturn[key] = dataDic;
        }
        for (const key1 in data) {
            const listTemp = data[key1] || [];
            if (!dicResponse[key1]) {
                let dataDic1 = {};
                for (let y = 0; y < listTemp.length; y++) {
                    const element1 = listTemp[y];
                    dataDic1 = assignData(dataDic1, element1);
                }
                const eventName1 = getEventName(type, keyPattern, getKeyVal(dataDic1));
                emitter.emit(eventName1, dataDic1);
                dataReturn[key1] = dataDic1;
            }
        }
        dataTemp.reponsed = true;
        dataTemp.data = dataReturn;
        dicData[type + keyPattern] = dataTemp;
        return dataReturn;
    } catch (error) {
        console.warn('merge Data Error: ', error);
    }
    return null;
}
function getKeyVal(data) {
    return data._key || data.symbol || data.code;
}
function assignData(oldData, newData) {
    let dataReturn = null;
    if (Array.isArray(oldData) || Array.isArray(newData)) {
        dataReturn = [...oldData, ...newData];
    } else {
        dataReturn = { ...oldData, ...newData };
    }
    return dataReturn;
}
export async function connect2Nchan(type, keyPattern, stringCode, noReponse1, key) {
    return;
    return new Promise((resolve, reject) => {
        const subscriberType = 'eventsource'; // websocket, longpoll, eventsource
        const opt = {
            subscriber: subscriberType
        }
        const noReponse = noReponse1;

        const pattern = keyPattern;
        const path = `${pattern}/${stringCode}`;
        console.log('send request');
        if (dicCheck[type + pattern]) {
            const dataTemp = dicData[type + pattern] || {};
            if (dataTemp.reponsed || noReponse) {
                const eventName = getEventName(type, keyPattern, key || getKeyVal(dataJson));
                const data = dataTemp.data || {};
                let dataLevel2 = data[key || getKeyVal(dataJson)] || {};
                data[key || getKeyVal(dataLevel2)] = dataLevel2;
                dataTemp.data = data;
                dicData[type + pattern] = dataTemp;
                emitter.emit(eventName, dataLevel2);
            }
            return resolve();
        } else {
            console.log('connecting to nchan: ', path);
            const sub = new NchanSubscriber(path, opt);
            sub.on('message', dataResponse => {
                console.log('message: ', dataResponse);
                const dataJson = dataResponse ? JSON.parse(dataResponse) : {};
                const dataTemp = dicData[type + pattern] || {};
                if (dataTemp.reponsed || noReponse) {
                    const eventName = getEventName(type, keyPattern, key || getKeyVal(dataJson));
                    const data = dataTemp.data || {};
                    let dataLevel2 = data[key || getKeyVal(dataJson)] || {};
                    dataLevel2 = assignData(dataLevel2, dataJson);

                    data[key || getKeyVal(dataJson)] = dataLevel2;
                    dataTemp.data = data;
                    dicData[type + pattern] = dataTemp;
                    emitter.emit(eventName, dataJson);
                } else {
                    const data = dataTemp.data || {};
                    const dataLevel2 = data[key || getKeyVal(dataJson)] || [];
                    dataLevel2.push(dataJson);
                    data[key || getKeyVal(dataJson)] = dataLevel2;
                    dataTemp.data = data;
                    dicData[type + pattern] = dataTemp;
                }

                return resolve();
            });
            sub.on('connect', function (evt) {
                console.log('nchan connected');
            });

            sub.on('disconnect', function (evt) {
                console.log('nchan disconnected');
            });

            sub.on('error', (errorCode, errorDescription) => {
                console.log('errorCode: ', errorCode);
            });
            dicData[type + pattern] = { reponsed: false, data: {} };
            dicCheck[type + pattern] = sub;
            sub.start();
        }
    });
}
