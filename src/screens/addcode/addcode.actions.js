import firebase from '../../firebase';
import { func } from '../../storage';
import FirebaseManager from '../../lib/base/firebase_manager';
import { logAndReport } from '../../lib/base/functionUtil';
let firebaseManager;
let newItems = false;

export function loadFormHandler() {
  return {
    type: 'LOAD_ADD_CODE'
  };
}

export function addUserSymbolEvent(data) {
  try {
    if (!newItems) return;
    if (!firebaseManager) return;
    return dispatch => {
      dispatch(addSymbolEvent(data));
      return Promise.resolve()
    }
  } catch (error) {
    console.log('addUserSymbolEvent addcodeAction logAndReport exception: ', error)
    logAndReport('addUserSymbolEvent addcodeAction exception', error, 'addUserSymbolEvent addcodeAction');
  }
}

export function addSymbolEvent(payload) {
  return {
    type: 'USER_SYMBOL_ADDED',
    payload
  };
}

export function removeUserSymbolEvent(data, dispatch) {
  dispatch(removeSymbolEvent(data));
}

export function removeSymbolEvent(payload) {
  return {
    type: 'USER_SYMBOL_REMOVED',
    payload
  };
}

export function userSymbolRequest(params) {
  return {
    type: 'USER_SYMBOL_REQUEST'
  };
}
export function userSymbolRefresh(params) {
  return {
    type: 'USER_SYMBOL_REFRESH'
  };
}

export function userSymbolResponse(payload) {
  return {
    type: 'USER_SYMBOL_RESPONSE',
    payload
  };
}

export function addUserSymbol(payload) {
  return {
    type: 'ADD_USER_SYMBOL',
    payload
  };
}

export function priceChanged(payload) {
  return {
    type: 'PRICE_RESPONSE',
    payload
  };
}
