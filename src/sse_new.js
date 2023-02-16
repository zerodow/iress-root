
import EventSource from '@lib/simple-eventsource'
import { AppState } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import { dataStorage } from './storage';
import actionType from './constants/actions_type_enum';
import { logDevice, getLastTimeRenewToken } from './lib/base/functionUtil';
import { getAccountStreamingUrl } from './api'
import * as Util from './util';
import { initCacheOrders } from './cache';
import * as Controller from './memory/controller'
import * as ManageConnection from '../src/manage/manageConnection';
import * as Channel from './streaming/streaming_business';
import * as Business from './business'
import ScreenId from './constants/screen_id'
import Enum from './enum';

let date = null;
const EVENT = {
    MESSAGE: 'message'
};
const JSON = Util.json;

function addType(url, type, cbFn) {
    let itemDic = dataStorage.typeRegisters[url];

    if (!itemDic) {
        itemDic = {};
    }

    let itemType = itemDic[type];
    if (!itemType) {
        itemType = [];
    }

    itemType.push(cbFn);
    itemDic[type] = itemType;
    dataStorage.typeRegisters[url] = itemDic;
}

function getTypeFromTitle(title = '') {
    // ORDER_DETAIL#INSERT#00000000_0000_0000_bb71_5b03b4f20071
    const listSplit = title.split('#');
    if (listSplit.length > 0) return (listSplit[0] + '').toUpperCase();
    return '';
}
function getActionFromTitle(title = '') {
    // ORDER_DETAIL#INSERT#00000000_0000_0000_bb71_5b03b4f20071
    const listSplit = title.split('#');
    const action = (listSplit[1] + '').toUpperCase();
    return actionType[action];
}

const getHeader = () => {
    return { headers: { Authorization: `Bearer ${Controller.getAccessToken()}` } };
};

export function subcriber(url, callbackFn, types = '', isAddAccessToken = false) {
    const newUrl = url;
    const addAccessToken = isAddAccessToken
    let accessToken = Controller.getAccessToken()
    let sseUrl = addAccessToken ? `${newUrl}&access_token=${accessToken}` : newUrl
    const newCallbackFn = callbackFn;
    const newTypes = types.toUpperCase();

    //  check duplicate
    const dicByUrl = dataStorage.typeRegisters[newUrl] || {};
    const dicByType = dicByUrl[newTypes] || [];
    const index = dicByType.indexOf(callbackFn);
    if (index >= 0) return

    // objectParse.notification.title
    const listType = Array.isArray(newTypes) ? newTypes : [newTypes]
    for (let t = 0; t < listType.length; t++) {
        addType(newUrl, listType[t], newCallbackFn);
    }
    let eventSource = dataStorage.sseRegisters[newUrl];
    let connected = false;
    let intervalId = null;

    const recoverMessage = () => {
        const currentScreeen = dataStorage.currentScreenId
        let channel = ''
        switch (currentScreeen) {
            case ScreenId.CONFIRM_PLACE_ORDER:
                channel = Channel.getChannelOrderReconnectSSE(Enum.ACTION_ORD.PLACE)
                Emitter.emit(channel)
                break;
            case ScreenId.CONFIRM_MODIFY_ORDER:
                channel = Channel.getChannelOrderReconnectSSE(Enum.ACTION_ORD.MODIFY)
                Emitter.emit(channel)
                break;
            case ScreenId.CONFIRM_CANCEL_ORDER:
                channel = Channel.getChannelOrderReconnectSSE(Enum.ACTION_ORD.CANCEL)
                Emitter.emit(channel)
                break;
            case ScreenId.PORTFOLIO:
                ManageConnection.dicConnection.getSnapshot && ManageConnection.dicConnection.getSnapshot();
                break;
            case ScreenId.ORDERS:
                // initCacheOrders() // Cache lại orders list
                // Business.reloadOrderList() // reload order details
                break;
            default:
                ManageConnection.dicConnection.getSnapshot && ManageConnection.dicConnection.getSnapshot();
                break;
        }
    }

    const pingMessageAccount = (objectParse) => {
        if (objectParse.data && objectParse.data.ping && newUrl.indexOf('streaming-data') >= 0) {
            if (dataStorage.sseTimeoutID[newUrl]) {
                clearTimeout(dataStorage.sseTimeoutID[newUrl]);
                delete dataStorage.sseTimeoutID[newUrl];
            }

            dataStorage.sseTimeoutID[newUrl] = setTimeout(() => {
                const isConnected = ManageConnection.getStateConnection();
                const nextStateApp = ManageConnection.getAppState();

                if (isConnected && nextStateApp === 'active') {
                    // console.warn('true SSE CHECK Account Reconnect', newUrl);
                    // registerSse(true);
                    // recoverMessage()
                } else if (!isConnected && nextStateApp === 'active') {
                    const channel = Channel.getChannelReconnectSSE('Account');
                    console.warn('false SSE CHECK Account Reconnect', newUrl);
                    Emitter.deleteEvent(channel);
                    Emitter.addListener(channel, Util.getRandomKey(), () => {
                        registerSse(true);
                        recoverMessage()
                    })
                }
            }, Enum.TIME_DURATION);
        }
    }

    const onMessage = (data) => {
        date = new Date().getTime();
        if (data && data.data) {
            const objectParse = data;
            pingMessageAccount(objectParse);

            if (objectParse && !objectParse.ping) {
                const objNotification = data
                if (objNotification && objNotification.data && objNotification.data.object_changed) {
                    const notif = objectParse.data;
                    let title = objectParse.data.title
                    if (title === 'USER_RESET_PASSWORD#' || title === 'USER_RESET_PASSWORD') {
                        title = 'AUTH'
                    }
                    const typeNotify = getTypeFromTitle(title);

                    const actionNotify = getActionFromTitle(title);
                    const dicByUrl = dataStorage.typeRegisters[newUrl] || {};
                    const dicByType = dicByUrl[typeNotify] || [];
                    const dicAll = dicByUrl['ALL'] || [];
                    const objData = Util.json.parse(objNotification.data.object_changed);
                    for (let t = 0; t < dicByType.length; t++) {
                        const cbType = dicByType[t];
                        cbType && cbType(objData, actionNotify)
                    }
                    for (let u = 0; u < dicAll.length; u++) {
                        const itemCB = dicAll[u];
                        itemCB && itemCB(notif, actionNotify)
                    }
                }
            }
        }
    }

    const onErrorMessage = (error) => {
        const endTime = new Date().getTime() - date;
        logDevice('info', `time process ${endTime} - Error addEventListener url ${newUrl} - Error ${error ? Util.json.stringify(error) : ''}`);
        console.warn(`time process ${endTime}`);
        console.warn(`Error addEventListener`, error);
        connected = false;
        intervalId && clearInterval(intervalId);
        intervalId = setInterval(() => {
            const store = Controller.getGlobalState()
            const isConnected = store.app.isConnected;
            if (!isConnected) return;

            if (connected) {
                clearInterval(intervalId);
                return;
            }
            registerSse(true);
        }, 3000);
    }

    const registerSse = async (reconnect) => {
        if (reconnect) {
            logDevice('', `SSE RECONNECT ${newUrl}`);
            eventSource && eventSource.close();
            eventSource = null;
            if (addAccessToken) {
                await new Promise(resolve => {
                    getLastTimeRenewToken(() => {
                        accessToken = Controller.getAccessToken()
                        sseUrl = `${newUrl}&access_token=${accessToken}`
                        resolve()
                    })
                })
            }
        }
        const options = getHeader();
        eventSource = new EventSource(sseUrl, options);
        dataStorage.sseRegisters[newUrl] = eventSource;

        eventSource.addEventListener('message', data => onMessage(data));
        eventSource.addEventListener('error', error => onErrorMessage(error));
        eventSource.addEventListener('open', (...arg) => {
            const channel = Channel.getChannelReconnectSSE('Account');
            intervalId && clearInterval(intervalId);
            Emitter.deleteEvent(channel);
            connected = true;
            const urlAccountRegister = `${getAccountStreamingUrl(dataStorage.accountId)}&access_token=${accessToken}`;
            if (reconnect && eventSource && eventSource.url === urlAccountRegister) {
                // initCacheOrders();
            }
            logDevice('info', `SSE connected ${arg}`);
        });
    }

    if (!eventSource) {
        registerSse();
    }
}

export function unregister(url, callbackFn, type) {
    const newUrl = url;
    const newCallbackFn = callbackFn;
    const newTypes = type.toUpperCase();

    const dicByUrl = dataStorage.typeRegisters[newUrl] || {};
    const dicByType = dicByUrl[newTypes] || [];
    const index = dicByType.indexOf(callbackFn);
    if (index >= 0) {
        dicByType.splice(index, 1);
    }
    dicByUrl[newTypes] = dicByType;
    dataStorage.typeRegisters[newUrl] = dicByUrl;
}

export function unregisterAll(url) {
    delete dataStorage.typeRegisters[url];
    dataStorage.sseTimeoutID[url] && clearTimeout(dataStorage.sseTimeoutID[url])
    const eventSource = dataStorage.sseRegisters[url];
    if (eventSource) {
        eventSource.close();
        delete dataStorage.sseRegisters[url];
    }
}
