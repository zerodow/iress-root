import * as Controller from '~/memory/controller';
import * as settingActions from '~s/setting/setting.actions';
import { func, dataStorage } from '~/storage';

import ENUM from '~/enum'

let dicInteractable = {}
let heightKeyboard = null
let body = {}
let topic = ''
let listAlertID = []
let preAlertTag = null
let alertTag = ENUM.ALERT_TAG.ALERT
let isShowNotification = false

let loadNoti = {
    requestId: '',
    statusCode: null
}
export function registerInteractable({ index, fn }) {
    // Close all interactable before
    Object.keys(dicInteractable).map((item) => {
        const closeInteractableFn = dicInteractable[item]
        closeInteractableFn && closeInteractableFn()
        delete dicInteractable[item]
    })
    dicInteractable[index] = fn
}
export function setHeightKeyBoard(newHeight) {
    heightKeyboard = newHeight
}
export function getHeightKeyBoard() {
    return heightKeyboard
}

export function setBodyAlert(newBody) {
    body = newBody
}
export function getBodyAlert() {
    return body
}
export function setSubTopic(newTopic) {
    topic = newTopic
}
export function getUnSubTopic() {
    return topic
}
export function setListAlertID(newAlertId) {
    newAlertId.filter((item) => {
        if (!item.acknowledged) {
            listAlertID.push(item.alert_id)
        }
    })
}
export function getListAlertID() {
    return listAlertID
}
export function setAlertTag(newAlertTag) {
    preAlertTag = alertTag
    alertTag = newAlertTag
}
export function getAlertTag() {
    return alertTag
}
export function getPreAndAlertTag() {
    return {
        preAlertTag,
        alertTag
    }
}
export function destroy() {
    preAlertTag = null
    alertTag = ENUM.ALERT_TAG.ALERT
}
export function setLoadNotification({ newRequestID, newStatusCode }) {
    loadNoti = {
        requestId: newRequestID,
        statusCode: newStatusCode
    }
}
export function getLoadNotification() {
    return loadNoti
}
export function setCacheNotification(notiAlert) {
    func.setCacheNotification(notiAlert)
    isShowNotification = notiAlert
    Controller.dispatch(settingActions.setNotificationAlert(notiAlert))
}
export function getCacheNotification() {
    return isShowNotification
}
