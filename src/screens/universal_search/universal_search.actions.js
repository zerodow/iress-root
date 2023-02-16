import { logAndReport, countC2RTimes } from '../../lib/base/functionUtil';
import firebase from '../../firebase';
import { click2Refresh } from '../../operator';
import { func } from '../../storage';

let dispatchGlobal = null;

export function saveHistory(listHistory) {
  return {
    type: 'SAVE_HISTORY_UNIVERSAL_SEARCH',
    payload: listHistory
  };
}

export function dispatchSuccess() {
  dispatchGlobal(writeDataSuccess());
}

export function dispatchError() {
  dispatchGlobal(writeDataError());
}

export function writeDataRequest() {
  return dispatch => {
    dispatchGlobal = dispatch;
    try {
      dispatch(writeDataEvent());
      const fcb1 = func.getFuncReload('universal_search_price');
      fcb1 && fcb1();
      const fcb2 = func.getFuncReload('universal_search_depth');
      fcb2 && fcb2();
      const fcb3 = func.getFuncReload('universal_search_cos');
      fcb3 && fcb3();
    } catch (error) {
      logAndReport('writeDataRequest tradeAction exception', error, 'writeDataRequest tradeAction');
    }
  };
}

export function writeDataEvent() {
  return {
    type: 'SEARCH_WRITE_DATA_REQUEST'
  };
}
export function writeDataSuccess() {
  return {
    type: 'SEARCH_WRITE_DATA_SUCCESS'
  };
}

export function writeDataError(error) {
  return {
    type: 'SEARCH_WRITE_DATA_ERROR',
    payload: error
  };
}
