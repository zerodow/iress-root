import { EventEmitter } from 'fbemitter';
import Mongo from './lib/base/mongo';
import config from './config';
import { func } from './storage';
import { logDevice } from './lib/base/functionUtil';
import * as Util from './util';
import Big from 'big.js';
// import request from 'request';

export const emitter = new EventEmitter();
export const dicRegister = {
}
export const dicCheck = {
}
export let interval = null;
export function resetType(type) {
    dicRegister[type] = null;
}

export const calculate = Util.calculate;

function getEventName(type, pattern, code) {
    if (!type || !pattern) return null;
    return `${type}|${pattern}|${code}`;
}

function addRegister(type, pattern, code, eventName) {
    const dicType = dicRegister[type];
    let dataType = dicType || {};
    let dataPattern = dataType[pattern] || {};
    let dataCode = dataPattern[code];
    if (dataCode) {
    } else {
        if (!dicType) {
            emitter.addListener(`${type}_FORM`, click2Refresh)
        }
        dataPattern[code] = eventName;
        dataType[pattern] = dataPattern;
        dicRegister[type] = dataType;
    }
}

function setupDataLoader(type) {
    const mongo = new Mongo('updated');
    for (const key1 in dicRegister) {
        const element = dicRegister[key1];
        if (element) {
            const current = new Date().getTime();
            const eventUpdate = `${type}_updated`;
            // delete dicRegister[key1];
            emitter.emit(eventUpdate, {
                'val': () => current
            });
            mongo.findOnce({
                'path': eventUpdate
            }).then(val => {
                if (val) {
                    mongo.update({ _id: val._id }, { 'path': eventUpdate, 'val': current });
                } else {
                    mongo.insert({ 'path': eventUpdate, 'val': current });
                }
            });
        }
    }
}

export function getUpdateTime(type, callback) {
    const eventName = `${type}_updated`;
    emitter.addListener(eventName, callback);
    const mongo = new Mongo('updated');
    mongo.findOnce({
        'path': eventName
    }).then(val => {
        emitter.emit(eventName, {
            'val': () => val ? val.val : new Date().getTime()
        });
    });
}

function getDataMultiplex(contentType, text, req) {
    // const contentType = 'multipart/mixed; boundary=WwTx2Kh7tslEMQ5UhWrVFgt61Iu5VdI1';
    let m = contentType && contentType.match(/^multipart\/mixed;\s+boundary=(.*)$/);
    if (!m) {
        if (contentType === 'application/json') {
            return [text];
        }
        return [];
    }
    const boundary = m[1];
    let msgs = text.split('--' + boundary);

    if (msgs[0] !== '' || !msgs[msgs.length - 1].match(/--\r?\n/)) {
        console.log('weird multipart/mixed split');
        return [];
    }
    msgs = msgs.slice(1, -1);
    const listData = [];
    for (const i in msgs) {
        m = msgs[i].match(/^(.*)\r?\n\r?\n([\s\S]*)\r?\n$/m);
        const hdrs = m[1].split('\n');
        const meta = {};
        for (const j in hdrs) {
            const hdr = hdrs[j].match(/^([^:]+):\s+(.*)/);
            if (hdr && hdr[1] === 'Content-Type') {
                meta['content-type'] = hdr[2];
            }
        }
        if (i === msgs.length - 1) {
            meta['id'] = this.msgIdFromResponseHeaders(req);
        }
        listData.push(m[2]);
        //   this.emit("message", m[2], meta);
    }
    return listData;
}

function getNewData(type, keyPattern, stringCode) {
    // this.subscriberType = 'longpoll';
    // opt = {
    //     subscriber: this.subscriberType
    // }
    // this.pattern = keyPattern;
    // this.path = `${config.sseConfig.url}${config.sseConfig.port ? ':' + config.sseConfig.port : ''}/${this.pattern}/${stringCode}`;
    // // this.path = 'http://10.0.3.246:443/snapshot/level1/ALL,BHP,ANZ';
    // this.sub = new NchanSubscriber(this.path, opt);
    // console.log('send request');
    // this.sub.on('message', dataResponse => {
    //     console.log('response');
    //     const dataJson = dataResponse ? JSON.parse(dataResponse) : {};
    //     const eventName = getEventName(type, keyPattern, dataJson._key);
    //     const preVal = dicCheck[type];
    //     dicCheck[type] = true;
    //     if (preVal === false) {
    //         setTimeout(() => {
    //             setupDataLoader(type);
    //         }, 1000);
    //     }

    //     emitter.emit(eventName, {
    //         type: this.pattern + '/' + dataJson._key,
    //         'val': () => dataJson
    //     });
    // });

    // this.sub.on('error', (errorCode, errorDescription) => {
    //     console.log('errorCode: ', errorCode);
    // });

    // this.sub.start();
}

export function click2Refresh(type) {
    return '';
}

export default class Operator {
    constructor(opt) {
        const newOpt = opt || {};
        const { type, pattern, code, callbackFn, listCode } = newOpt;
        this.callbackFn = callbackFn;
        this.pattern = pattern || '';
        this.type = type || '';
        this.code = code || '';
        this.listCode = listCode || [];
        this.data = null;
        this.error = null;
        this.isConnected = false;
        this.mongo = new Mongo(this.type);
        this.mongoData = null;
        this.ref = null;
        this.eventName = getEventName(this.type, this.pattern, this.code);
        this.register();
    }

    register() {
        if (this.code) {
            this.registerEvent(this.eventName);
            const item = dicRegister[this.type];
            addRegister(this.type, this.pattern, this.code, this.eventName);
            this.getDataFromMongo();
            if ((this.listCode && this.listCode.length > 1) || item) {
            } else {
                click2Refresh(this.type);
            }
        } else {
            for (let index = 0; index < this.listCode.length; index++) {
                const element = this.listCode[index];
                const eventName = getEventName(this.type, this.pattern, element);
                addRegister(this.type, this.pattern, element, eventName);
            }
            this.registerEvent(`${this.type}_FORM_RESPONSE`);
            click2Refresh(this.type);
        }
    }

    registerEvent(eventName) {
        this.ref = emitter.addListener(eventName, (data) => {
            const val = data.val();
            if (!data.isResponse) {
                this.callbackFn(data);
            } else {
                this.insertOrUpdateMongo(val);
            }
        });
    }

    insertOrUpdateMongo(data) {
        // if (this.mongoData) {
        //     this.mongo.update({ _id: this.mongoData._id }, { _id: this.mongoData._id, path: this.pattern + '/' + this.code, 'val': this.data }).then((numberRow) => {
        //         console.log('success: ', numberRow);
        //     }).catch(error1 => {
        //         console.log('error: ', error1);
        //     });
        // } else {
        const path = this.pattern + '/' + data ? data._key : '';
        console.log('path: ', path);
        this.mongo.insert({ 'path': path, 'val': data }).then((newDocs) => {
            console.log('success');
        }).catch(error1 => {
            console.log('error: ', error1);
        });
        // }
    }
    emitterData() {
        emitter.emit(this.eventName, {
            type: this.pattern + '/' + this.code,
            'val': () => this.data,
            error: this.error,
            isMongo: true
        });
    }

    getDataFromMongo() {
        this.mongo.findOnce({
            'path': this.pattern + '/' + this.code
        }).then(val => {
            this.error = null;
            this.data = val ? val.val : null;
            this.mongoData = val;
            // this.data = { "code": "BHP", "updated": 1511849617209, "ask_price": 27.21, "ask_size": 100090, "bid_price": 27.2, "bid_size": 3211, "close": 27.21, "company": "BHP BLT FPO", "high": 30.37, "low": 26.5, "open": 27.61, "total_volume": 2614589, "trade_price": 27.265, "trade_size": 792, "value_trade": 72007299, "trend": "Up", "change_point": 0.055, "change_percent": 0.2021315692760015, "change_value": "1_010002021" }
            this.emitterData();
        }).catch(err => {
            this.data = null;
            this.error = err;
            this.emitterData();
        });
    }

    off() {
        if (this.ref) {
            this.ref.remove && this.ref.remove();
        }
    }
}
