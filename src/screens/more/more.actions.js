import firebase from '../../firebase';
import { dataStorage, func } from '../../storage';
import FirebaseManager from '../../lib/base/firebase_manager';
import { logDevice } from '../../../src/lib/base/functionUtil'
import * as Controller from '../../../src/memory/controller'
// import { iconsMap, iconsLoaded } from './utils/AppIcons';

export function logout(navigation, callback = null) {
  return dispatch => {
    dispatch(logoutRequest());
    console.log('remove success');
    return firebase.auth().signOut()
      .then(res => {
        console.log('More actions sign out - firebase signout success')
        dispatch(logoutSuccess());
        dataStorage.isNewOverview = true;
        dataStorage.user_id = null;
        func.setAccountId(null);
        logDevice('info', 'More actions sign out - set isLocked to true');
        Controller.setLoginStatus(false)
        func.setLoginConfig(false);
        callback && callback();
        dataStorage.startApp();
        console.log('start app')
        logDevice('info', 'More actions sign out - sign out firebase');
      })
      .catch(err => {
        console.warn('logout error')
        dispatch(logoutError(err));
      });
  };
}

export function logoutRequest(params) {
  return {
    type: 'LOGOUT_REQUEST'
  };
}

export function logoutError() {
  return {
    type: 'LOGOUT_ERROR'
  };
}
export function logoutSuccess() {
  dataStorage.is_logout = true
  return {
    type: 'LOGOUT_SUCCESS'
  };
}
