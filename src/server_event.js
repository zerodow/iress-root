import { applyPatch } from 'fast-json-patch';
// import 'event-source-any-where';
import config from './config';
import AppState from './lib/base/helper/appState';
import EventSource from 'react-native-eventsource';
import Operator from './operator';
import { func } from './storage';
import { EventEmitter } from 'fbemitter';
import userType from './constants/user_type';
import { getPriceSource } from './lib/base/functionUtil';
require('event-source-any-where');

export const emitter = new EventEmitter();
export const dicRegister = {
}
export function resetType(type) {
  dicRegister[type] = null;
}
export const dicData = {
}

function setValueToDic(type, listCode) {
  if (!listCode) return;
  let count = 0;
  const typeTemp = {};
  if (listCode && listCode.length && listCode.length > 0) {
    for (let index = 0; index < listCode.length; index++) {
      count++;
      const element = listCode[index];
      typeTemp[element] = element;
    }
  } else {
    count++;
    typeTemp[listCode] = listCode;
  }

  dicRegister[type] = {
    data: typeTemp,
    count: count
  };
}

function setDataToDic(type, pattern, dataObj) {
  const data = dataObj.val() || {};
  const valType = dicData[type] || {};
  const dataPattern = valType[pattern] || {};
  dataPattern[data._key] = data;
  valType[pattern] = dataPattern;
  dicData[type] = valType;
}

function getDataFromDic(type, pattern, key) {
  const valType = dicData[type] || {};
  const dataPattern = valType[pattern] || {};
  const data = dataPattern[key];
  return {
    val: () => data
  };
}

function checkExists(type, listCheck) {
  const dataTemp = dicRegister[type] || {};
  const dataVal = dataTemp.data || {};
  const dataCheck = {};
  if (listCheck && listCheck.length > 0) {
    if (listCheck.length !== dataTemp.count) {
      return false;
    } else {
      for (let o = 0; o < listCheck.length; o++) {
        const check = listCheck[o];
        if (!dataVal[check]) {
          return false;
        }
      }
    }
  } else {
    if (!dataVal[listCheck]) {
      return false;
    }
  }
  return true;
}

const ServerEvent = class {
  constructor(opt) {
    const newOpt = opt || {};
    const { pattern, callbackFn, type, oneTime, useAppState, userEventSource, listCode, isGet, code } = newOpt;
    this.callbackFn = callbackFn;
    this.code = code || '';
    this.listCode = listCode || [code]
    this.patternNoCode = pattern || '';
    this.type = type || '';
    this.data = null;
    this.isConnected = false;
    this.isGet = isGet || false;
    this.isGet = true;
    this.oneTime = oneTime || false;
    this.useAppState = useAppState || false;
    this.userEventSource = userEventSource || false;
    this.stringMulti = this.getMultiplexPath(this.listCode);
    this.pattern = (pattern || '') + '/' + (this.listCode && this.listCode.length > 0 ? this.stringMulti : code);
    this.path = `${config.sseConfig.url}${config.sseConfig.port ? ':' + config.sseConfig.port : ''}/${this.pattern}`;
    this.sub = null;
    this.operator = null;
    this.isRegister = false;
    this.idListener = null;
    this.appState = null;
    this.fileName = null;
    this.subscriberType = 'eventsource';// 'longpoll', 'eventsource', or 'websocket',
    if (func.getUserPriceSource() !== userType.ClickToRefresh) {
      this.registerEvent();
    }
    this.on();
  }

  getMultiplexPath(list) {
    let stringReturn = '';
    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      stringReturn += element + ',';
    }
    stringReturn = stringReturn.replace(/.$/, '');
    return stringReturn;
  }
  getEventName(type, pattern, code) {
    if (!type || !pattern) return null;
    return `${type}|${pattern}|${code}`;
  }

  on() {
    if (this.pattern.startsWith('snapshot')) {
      this.operator = new Operator({
        type: this.type,
        pattern: this.patternNoCode,
        code: this.code,
        listCode: this.listCode,
        callbackFn: this.callbackFn
      });
    } else {
      if (this.useAppState) {
        this.appState = new AppState(this.createConnection.bind(this), this.off.bind(this));
      } else {
        this.createConnection();
      }
    }
  }
  createListener() {
    if (this.callbackFn) {
      const eventName = this.getEventName(this.type, this.patternNoCode, this.code);
      this.idListener = emitter.addListener(eventName, this.callbackEvent.bind(this));
      const data = getDataFromDic(this.type, this.patternNoCode, this.code);
      emitter.emit(eventName, data)
    }
  }

  callbackEvent(objData) {
    this.callbackFn && this.callbackFn(objData);
  }

  registerEvent() {
    if (checkExists(this.type, this.listCode)) {
    } else {
      resetType(this.type);
      setValueToDic(this.type, this.listCode);
      this.isRegister = true;
    }
    this.createListener();
  }

  createConnection() {
    return null;
  }

  returnData() {
    const eventName = this.getEventName(this.type, this.patternNoCode, this.data ? this.data._key : '');
    const dataObj = {
      type: this.pattern,
      val: () => this.data
    }
    setDataToDic(this.type, this.patternNoCode, dataObj);
    emitter.emit(eventName, dataObj);
    // this.callbackFn && this.callbackFn(dataObj);
    return dataObj;
  }

  handlerMessage(dataResponse) {
    const dataJson = dataResponse ? JSON.parse(dataResponse) : {};
    this.data = dataJson;
    this.returnData();
  }

  off() {
    if (this.sub) {
      this.sub.stop && this.sub.stop();
      this.sub.close && this.sub.close();
      this.sub = null;
    }
    if (this.idListener) {
      this.idListener.remove();
    }
    if (this.operator) {
      this.operator.off && this.operator.off();
      this.operator = null;
    }
  }
}
export default ServerEvent;

export function initData(type, path, symbols) {
  const listSymbol = [];
  for (const key in symbols) {
    const symbol = symbols[key];
    listSymbol.push(symbol.code)
  }
  const pathPrice = getPriceSource(path);
  const newData = new ServerEvent({
    code: '',
    type: type,
    pattern: `${pathPrice}`,
    listCode: listSymbol
  });
  return newData;
}
