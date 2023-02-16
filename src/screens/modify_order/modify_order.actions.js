import firebase from '../../firebase';
import { func, dataStorage } from '../../storage';
import FirebaseManager from '../../lib/base/firebase_manager';
import { logAndReport, logDevice } from '../../lib/base/functionUtil';
import orderTypeString from '../../constants/order_type_string';
import { click2Refresh } from '../../operator';
export function setupDataLoader(initData) {
  return {
    type: 'SETUP_DATA_LOADER',
    initData
  }
}

export function writeDataRequest() {
  return dispatch => {
    try {
      dispatch(writeDataEvent());
      const fcb1 = func.getFuncReload('modify_order');
      fcb1 && fcb1();
      const fcb2 = func.getFuncReload('modifyOrder_depth');
      fcb2 && fcb2();
      const fcb3 = func.getFuncReload('modifyOrder_Cos');
      fcb3 && fcb3();
    } catch (error) {
      console.log('writeDataRequest modifyOrderAction logAndReport exception: ', error)
      logAndReport('writeDataRequest modifyOrderAction exception', error, 'writeDataRequest modifyOrderAction');
      logDevice('info', `writeDataRequest modifyOrderAction exception ${error}`);
    }
  };
}

export function writeDataEvent() {
  return {
    type: 'MODIFY_ORDER_WRITE_DATA_REQUEST'
  };
}
export function writeDataSuccess() {
  return {
    type: 'MODIFY_ORDER_WRITE_DATA_SUCCESS'
  };
}

export function writeDataError(error) {
  return {
    type: 'MODIFY_ORDER_WRITE_DATA_ERROR',
    payload: error
  };
}

export function sendOrder() {
  return {
    type: 'MODIFY_ORDER_SEND_REQUEST'
  }
}
export function changeOrderVolume(volume) {
  return {
    type: 'MODIFY_ORDER_CHANGE_VOLUME',
    volume
  }
}

export function changePrice(priceType, value) {
  try {
    switch (priceType) {
      case orderTypeString.LIMIT:
        return {
          type: 'MODIFY_ORDER_CHANGE_LIMIT_PRICE',
          value
        }
      case orderTypeString.STOP_MARKET:
        return {
          type: 'MODIFY_ORDER_CHANGE_STOP_PRICE',
          value
        }
    }
  } catch (error) {
    console.log('changePrice modifyOrderAction logAndReport exception: ', error)
    logAndReport('changePrice modifyOrderAction exception', error, 'changePrice modifyOrderAction');
  }
}

export function changeTrail(trail) {
  return {
    type: 'CHANGE_TRAIL_MODIFY_ORDER',
    trail
  }
}

export function changeTrailValue(value, trailType) {
  switch (trailType) {
    case '%':
      return {
        type: 'CHANGE_TRAIL_PERCENT_MODIFY_ORDER',
        value
      }
    case 'AMT':
      return {
        type: 'CHANGE_TRAIL_AMOUNT_MODIFY_ORDER',
        value
      }
  }
}

export function resetInitialOrder() {
  return {
    type: 'RESET_INITIAL_MODIFY_ORDER'
  }
}

export function changeListLimitPrice(listPrice) {
  return {
    type: 'MODIFY_ORDER_CHANGE_LIST_LIMIT_PRICE',
    listData: listPrice
  }
}

export function changeListStopPrice(listPrice) {
  return {
    type: 'MODIFY_ORDER_CHANGE_LIST_STOP_PRICE',
    listData: listPrice
  }
}

export function changeTrailingPercent(percent) {
  return {
    type: 'MODIFY_ORDER_CHANGE_TRAILING_PERCENT',
    payload: percent
  }
}

export function changeTrailingAmount(value) {
  return {
    type: 'MODIFY_ORDER_CHANGE_TRAILING_AMOUNT',
    payload: value
  }
}

export function changeTrailingStopPrice(value) {
  return {
    type: 'MODIFY_ORDER_CHANGE_TRAILING_STOP_PRICE',
    payload: value
  }
}
