import firebase from './firebase';
import { dataStorage, func } from './storage';
import { logFirebase, logDevice } from './lib/base/functionUtil';
export function initApp(callback, ...params) {
    logDevice('info', '===> call function initApp');
    const dataParams = params;
    callback && callback(dataParams);
    return;
    // callback && callback(dataParams);
    // return;
    const userId = func.getUserId();
    const listPath = [{
        path: `user_price_source/${userId}`,
        key: 'user_price_source'
    }];

    const objCheck = {};
    const checkData = function (path) {
        logFirebase('start check path: ' + path);
        logDevice('info', `iniStorage - start check path ${path}`);
        objCheck[path] = true;
        for (const key in objCheck) {
            const element = objCheck[key];
            if (!element) return;
        }
        logFirebase('start callbackDefault');
        logDevice('info', 'Init App Or Price Source Changed');
        // setTimeout(() => {
        callback && callback(dataParams);
        // }, 500)
    }

    const getData = function (element) {
        // firebase.database().ref(element.path).on('value', function (params) {
        //     logDevice('info', 'Init App Or Price Source Changed - get data');
        //     const val = params.val();
        //     func.setDataStorage(element.key, val);
        //     checkData(element.path);
        // });
    }

    for (let index = 0; index < listPath.length; index++) {
        const element = listPath[index];
        objCheck[element.path] = false;
    }

    for (let index = 0; index < listPath.length; index++) {
        const element = listPath[index];
        getData(element);
    }
}
