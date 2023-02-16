import firebase from '../../firebase';
import { logAndReport, logDevice } from '../../lib/base/functionUtil';
import { dataStorage, func } from '../../storage';
import { Alert } from 'react-native';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';
import * as Controller from '../../memory/controller'

let navigation;
const userId = func.getUserId();
let perf = null;

export function save(info) {
    return dispatch => {
        try {
            dispatch(updateUserRequest(info));
            // const fbUser = firebase.database().ref('user_info/' + info.user_id);
            // return fbUser.set(info).then(() => {
            const userId = Controller.getUserId()
            const url = api.getUrlUserInfoByUserId(`${userId}`)
            return api.putData(url, info).then(() => {
                dispatch(updateUserSuccess());
            }).catch((error) => {
                dispatch(updateUserError(error));
            });
        } catch (error) {
            logAndReport('save userAction exception', error, 'save userAction');
        }
    };
}

export function userInfoResponse(payload) {
    return {
        type: 'USER_LOAD_FORM_RESPONSE',
        payload
    };
}

export function userInfoData(data, dispatch) {
    dataStorage.timeoutUserInfo && clearTimeout(dataStorage.timeoutUserInfo)
    dataStorage.timeoutUserInfo = setTimeout(() => {
        dispatch(userInfoResponse(data));
    }, 200)
}

export function loadDataFrom() {
    return dispatch => {
        try {
            perf = new Perf(performanceEnum.get_user_info);
            perf && perf.start();
            dispatch(loadFromRequest());
            // const userId = func.getUserId();
            const url = api.getAccountInfo(`${dataStorage.accountId}`);
            return api.requestData(url, true)
                .then(data => {
                    perf && perf.stop();
                    if (data && data.length) {
                        userInfoData(data[0], dispatch);
                    } else {
                        userInfoData({}, dispatch)
                    }
                })
                .catch(err => {
                    console.log(err)
                    logDevice('err', `GET USER INFO ERROR: ${err}`)
                });
        } catch (error) {
            logDevice('err', `GET USER INFO EXCEPTION: ${error}`)
        }
    };
}

export function changedProperty(field, val) {
    return dispatch => {
        dispatch(changedField({
            field,
            val
        }));
    };
}

export function changedField(payload) {
    return {
        type: 'USER_CHANGED_FIELD',
        payload
    };
}

export function loadFromRequest() {
    return {
        type: 'USER_LOAD_FORM_REQUEST'
    };
}

export function updateUserRequest(userInfo) {
    return {
        type: 'UPDATE_USER_REQUEST',
        user: userInfo
    };
}

export function updateUserError(err) {
    return {
        type: 'UPDATE_USER_ERROR',
        error: err
    };
}

export function updateUserSuccess() {
    return {
        type: 'UPDATE_USER_SUCCESS'
    };
}
