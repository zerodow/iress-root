import firebase from '../../firebase';
import { dataStorage, func } from '../../storage';
import orderTypeString from '../../constants/order_type_string';
import { roundFloat, formatNumber, logAndReport, logDevice } from '../../lib/base/functionUtil';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';

let dispatchGlobal = null;
let perf = null;

export function changeOrderType(orderType) {
  return {
    type: 'CHANGE_ORDER_TYPE',
    orderType
  }
}

export function setupDataLoader(initData) {
  return {
    type: 'NEW_ORDER_SETUP_DATA_LOADER',
    initData
  }
}

export function sendOrderRequest(order, timeStamp) {
  return dispatch => {
    try {
      perf = new Perf(performanceEnum.send_order_request);
      perf && perf.start();
      const userId = func.getUserId();
      dispatch(sendOrder());
      const keyNewOrder = `order_request/${userId}/${timeStamp}`;
      logDevice('info', `NewOrder - START SEND ORDER REQUEST: ${order ? JSON.stringify(order) : ''} - KEY: ${keyNewOrder}`)
      const refOrder = firebase.database().ref(keyNewOrder);
      return refOrder.set(order).then(() => {
        perf && perf.stop();
        logDevice('info', 'NewOrder - SEND ORDER SUCCESS');
      }).catch((error) => {
        perf && perf.stop();
        logDevice('info', `NewOrder - SEND ORDER ERROR:  ${error}`);
      });
    } catch (error) {
      logAndReport('sendOrderRequest orderAction exception', error, 'sendOrderRequest orderAction');
      logDevice('info', `NewOrder - SEND ORDER ERROR:  ${error}`);
    }
  };
}
export function sendOrder() {
  return {
    type: 'NEW_ORDER_SEND_REQUEST'
  }
}
export function changeOrderVolume(volume) {
  return {
    type: 'NEW_ORDER_CHANGE_VOLUME',
    volume
  }
}

export function changePrice(priceType, value) {
  switch (priceType) {
    case orderTypeString.LIMIT:
      return {
        type: 'NEW_ORDER_CHANGE_LIMIT_PRICE',
        value
      }
    // case orderTypeString.STOPLOSS:
    //   return {
    //     type: 'NEW_ORDER_CHANGE_STOP_PRICE',
    //     value
    //   }
    case orderTypeString.STOP_MARKET:
      return {
        type: 'NEW_ORDER_CHANGE_STOP_PRICE',
        value
      }
  }
}

export function writeDataRequest() {
  return dispatch => {
    dispatchGlobal = dispatch;
    try {
      dispatch(writeDataEvent());
      const fcb1 = func.getFuncReload('order');
      fcb1 && fcb1(true);
      // dispatch(writeDataSuccess())
    } catch (error) {
      logAndReport('writeDataRequest orderAction exception', error, 'writeDataRequest orderAction');
      logDevice('info', `NewOrder - writeDataRequest:  ${error}`);
    }
  };
}

export function dispatchSuccess() {
  dispatchGlobal(writeDataSuccess());
}

export function dispatchError() {
  return dispatch => {
    if (dispatchGlobal) {
      dispatchGlobal(writeDataError());
    } else {
      dispatch(writeDataError())
    }
  }
}

export function saveHistory(listHistory) {
  return {
    type: 'SAVE_HISTORY_SEARCH_SYMBOL',
    payload: listHistory
  };
}

export function clearAllData(isParitech) {
  return {
    type: 'CLEAR_ALL_DATA',
    payload: isParitech
  }
}

export function writeDataEvent() {
  return {
    type: 'ORDER_WRITE_DATA_REQUEST'
  };
}

export function writeDataSuccess() {
  return {
    type: 'ORDER_WRITE_DATA_SUCCESS'
  };
}

export function writeDataError(error) {
  return {
    type: 'ORDER_WRITE_DATA_ERROR',
    payload: error
  };
}

export function changeBuySell(tradeType) {
  return {
    type: 'CHANGE_BUY_SELL',
    tradeType
  }
}

export function changeTrail(trail) {
  return {
    type: 'CHANGE_TRAIL',
    trail
  }
}

export function changeExchange(exchange) {
  return {
    type: 'NEW_ORDER_CHANGE_EXCHANGE',
    exchange
  }
}

export function changeDuration(duration) {
  return {
    type: 'NEW_ORDER_CHANGE_DURATION',
    duration
  }
}

export function changeTriggerType(type) {
  return {
    type: 'CHANGE_ORDER_TRIGGER_TYPE',
    payload: type
  }
}

export function resetInitialOrder() {
  return {
    type: 'RESET_INITIAL_ORDER'
  }
}

export function changeVolume(volume) {
  return {
    type: 'CHANGE_ORDER_VOLUME',
    payload: volume
  }
}

export function changeListLimitPrice(listPrice) {
  return {
    type: 'NEW_ORDER_CHANGE_LIST_LIMIT_PRICE',
    listData: listPrice
  }
}

export function changeListStopPrice(listPrice) {
  return {
    type: 'NEW_ORDER_CHANGE_LIST_STOP_PRICE',
    listData: listPrice
  }
}

export function changeTrailingPercent(percent) {
  return {
    type: 'CHANGE_TRAILING_PERCENT',
    payload: percent
  }
}

export function changeTrailingAmount(value) {
  return {
    type: 'CHANGE_TRAILING_AMOUNT',
    payload: value
  }
}

export function changeTrailingStopPrice(value) {
  return {
    type: 'CHANGE_TRAILING_STOP_PRICE',
    payload: value
  }
}

export function changeTabScroll(value) {
  return {
    type: 'ORDER_CHANGE_TAB_SCROLL',
    payload: value
  }
}
