import * as Api from '~/api';
import _ from 'lodash';
import Time from '~/constants/time';
import { setLoadNotification } from '~s/alertLog/Model/AlertLogModel'
export const createAlertLog = async (dispatch, { body, onSuccess, onError }, rootState) => {
    try {
        const url = Api.getUrlAlertLog()
        const response = await Api.postData(url, { data: body }, Time.TIMEOUT);
        if (response.id) {
            onSuccess && onSuccess()
        } else {
            onError && onError()
        }
        console.info('CREATE NEW ALERT', response)
    } catch (error) {
        onError && onError()
        console.info('ERROR NEW ALERT', error)
    }
}

export const getAlertLog = async (dispatch) => {
    try {
        const url = Api.getUrlAlertLog()
        const response = await Api.requestData1(url);
        dispatch.alertLog.changeLoadingAlertLog(false)
        dispatch.alertLog.changeReloadAlert(false)
        dispatch.alertLog.changeDataAlertLog(response.alerts || {});
    } catch (error) {
        dispatch.alertLog.changeDataAlertLog({});
        dispatch.alertLog.changeReloadAlert(false)
        console.info('Error Get Alert', error)
    }
}
export const getListNotification = async (dispatch, { page, onSuccess, onError, requestId }) => {
    try {
        // console.log('response Notification: ')
        let url = Api.getUrlNotification(page)
        if (requestId) {
            url = `${url}&request_id=${requestId}`
        }
        const response = await Api.requestData1(url);
        // console.log('response Notification: ', response)
        if (response) {
            dispatch.alertLog.changeLoadingAlertLog(false)
            dispatch.alertLog.changeReloadAlert(false)
            dispatch.alertLog.changeNotificationAlertLog(response || {});
            onSuccess && onSuccess()
        } else {
            onError && onError()
            dispatch.alertLog.changeLoadingAlertLog(false)
            dispatch.alertLog.changeReloadAlert(false)
            dispatch.alertLog.changeNotificationAlertLog({});
            console.info('getListNotification onError')
        }
    } catch (error) {
        dispatch.alertLog.changeNotificationAlertLog({});
        dispatch.alertLog.changeLoadingAlertLog(false)
        console.info('ERROR GET NOTI ERROR', error)
    }
}
export const deleteAlertLog = async (dispatch, { alertID, onSuccess, onError }) => {
    const url = Api.getUrlDeleteAlertLog(alertID)
    const response = await Api.deleteData(url);
    if (response.errorCode === 'SUCCESS') {
        // onSuccess && onSuccess()
    } else {
        // onError && onError()
    }
}
export const readNotification = async (dispatch, { listAlertId, onSuccess, onError }) => {
    if (_.isEmpty(listAlertId)) {
        return null;
    }
    const url = Api.getUrlDeleteAllNotifications()
    const response = await Api.postData(url, { data: ['@'] }, Time.TIMEOUT);
    if (response.errorCode === 'SUCCESS') {
        onSuccess && onSuccess()
    } else {
        onError && onError()
    }
}
export const putNotificationAlerts = async (dispatch, { alertID, body, onSuccess, onError }) => {
    const url = Api.getUrlputNotificationAlerts(alertID)
    const response = await Api.putData(url, { data: body }, Time.TIMEOUT)
    if (response.errorCode === 'SUCCESS') {
        console.info('putNotificationAlerts SUCCESS ')
        onSuccess && onSuccess()
    } else {
        onError && onError()
        console.info('putNotificationAlerts ERROR ')
    }
}
