
import CommonStyle from '~/theme/theme_controller'
import Enum from '~/enum';
import { getPreAndAlertTag } from '~s/alertLog/Model/AlertLogModel'
import * as Api from '~/api';
import * as Business from '~/business'
import * as Controller from '~/memory/controller';

const { ANIMATION_TYPE } = Enum
const TIMEOUT = 15000
export const getBodyCreateAlert = ({ symbol, exchange, alertType, trigger, targetValue }) => {
    try {
        const objCreateAlert = {};
        objCreateAlert['symbol'] = symbol + '.' + exchange;
        objCreateAlert['alert_type'] = alertType.key;
        objCreateAlert['trigger'] = trigger.key
        if (trigger.key !== Enum.TRIGGER_ALERT.IS_MARKET_SENSITIVE) {
            objCreateAlert['value'] = targetValue;
        }
        return objCreateAlert
    } catch (error) {
        console.info('ERROR CREATE BODY ALERT')
    }
}

export const getDisplayNameAlertLog = (value) => {
    switch (value) {
        case 'NEWS':
            return 'News'
        case 'TODAY_VOLUME':
            return 'Today Volume'
        case 'ASK_PRICE':
            return 'Ask Price'
        case 'BID_PRICE':
            return 'Bid Price'
        case 'CHANGE_PERCENT':
            return '% Movement'
        case 'CHANGE_POINT':
            return 'Movement'
        case 'LAST_PRICE':
            return 'Last Price'
        case 'AT_OR_BELOW':
            return 'At or Below'
        case 'AT_OR_ABOVE':
            return 'At or Above'
        case 'ABOVE':
            return 'Above'
        case 'AT':
            return 'At'
        case 'FROM_LAST_TRADE':
            return 'From Last Trade'
        case 'BELOW':
            return 'Below'
        case 'CONTAINS':
            return 'Headline Contains'
        case 'IS_MARKET_SENSITIVE':
            return 'Market Sensitive'
        case 'TRADE_PRICE':
            return 'Trade Price'
        case 'TRADE_VOLUME':
            return 'Trade Volume'
        case 'TRADE_VALUE':
            return 'Trade Value'
        default:
            break;
    }
}
export const getAlertStatusByAlertType = (value) => {
    switch (value) {
        case 'NEWS':
            return { nameAlert: 'News Alert', color: CommonStyle.color.modify }
        default:
            return { nameAlert: 'Price Alert', color: CommonStyle.color.warning }
    }
}

export function getAnimationTypeByTag() {
    const { preAlertTag, alertTag } = getPreAndAlertTag()
    if (preAlertTag === null) {
        return ANIMATION_TYPE.FADE_IN
    }
    if (alertTag > preAlertTag) {
        return ANIMATION_TYPE.FADE_IN_RIGHT
    }
    if (alertTag < preAlertTag) {
        return ANIMATION_TYPE.FADE_IN_LEFT
    }
}
export async function registerNotification({ enable = true, cbSuccess, cbError }) {
    const url = Api.subNotifyAlert()
    const fcmToken = Controller.getFCMToken()
    const body = {
        token: fcmToken + '',
        subscribe: enable
    }
    const response = await Api.postData(url, { data: body }, TIMEOUT);
    if (response.errorCode === 'SUCCESS') {
        cbSuccess && cbSuccess()
    } else {
        cbError && cbError()
    }
}
export async function unRegisterNotification({ enable = false, cbSuccess, cbError }) {
    const url = Api.subNotifyAlert()
    const fcmToken = Controller.getFCMToken()
    const body = {
        token: fcmToken + '',
        subscribe: enable
    }
    const response = await Api.postData(url, { data: body }, TIMEOUT);
    if (response.errorCode === 'SUCCESS') {
        cbSuccess && cbSuccess()
    } else {
        cbError && cbError()
    }
}
