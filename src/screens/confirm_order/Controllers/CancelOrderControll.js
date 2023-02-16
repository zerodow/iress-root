import * as Business from '~/business';
import orderTypeEnum from '~/constants/order_type';
import orderTypeString from '~/constants/order_type_string';
import * as Translate from '~/invert_translate';
import * as Util from '~/util';
import ENUM from '~/enum'
import moment from 'moment'
import { dataStorage } from '~/storage'
import I18n from '~/modules/language/'
import * as Emitter from '@lib/vietnam-emitter'
import * as StreamingBusiness from '~/streaming/streaming_business'
import * as Controller from '~/memory/controller'
import { getOrderDetail, getType } from '~/screens/confirm_order/ConfirmCancelOrder/Model/CancelModel'
import { checkErrorModify, checkError, checkErrorOrderStopLostTakeprofit, checkErrorStopLostTakeprofit } from '~s/confirm_order/Controllers/ContentController'
import {
    logDevice,
    getReason
} from '~/lib/base/functionUtil';

import * as Api from '~/api'
import Time from '~/constants/time';
const ERR = ENUM.ERROR_CODE;
const ACTION = ENUM.ACTION_ORD;
const STATUS = ENUM.STATUS_ORD;
const TITLE_NOTI = ENUM.TITLE_NOTI;
const { CANCEL_TYPE } = ENUM
const Json = Util.json;
export function getOrderId() {
    const orderDetail = getOrderDetail()
    const type = getType()
    switch (type) {
        case CANCEL_TYPE.CANCEL_ORDER_STOP_LOSS:
            return orderDetail.stoploss_order_info.stoploss_order_id
        case CANCEL_TYPE.CANCEL_ORDER_TAKE_PROFIT:
            return orderDetail.takeprofit_order_info.takeprofit_order_id
        default:
            return orderDetail.order_id
    }
}
export const getStopLossId = (orderDetail) => {
    return (orderDetail.stoploss_order_info && orderDetail.stoploss_order_info.stoploss_order_id)
        ? orderDetail.stoploss_order_info.stoploss_order_id.toString() : null
}
export const getTakeprofitId = (orderDetail) => {
    return (orderDetail.takeprofit_order_info && orderDetail.takeprofit_order_info.takeprofit_order_id)
        ? orderDetail.takeprofit_order_info.takeprofit_order_id.toString() : null
}
export function getObjectOrderCancel() {
    const orderDetail = getOrderDetail()
    const type = getType()
    const bodyCancel = {}
    switch (type) {
        case CANCEL_TYPE.CANCEL_ORDER_ORIGINAL:
            bodyCancel.order_id = orderDetail.order_id.toString()
            bodyCancel.stoploss_order_id = getStopLossId(orderDetail)
            bodyCancel.takeprofit_order_id = getTakeprofitId(orderDetail)
            bodyCancel['cancel_parent'] = true
            return bodyCancel
        case CANCEL_TYPE.CANCEL_ORDER_STOP_LOSS:
            bodyCancel.order_id = orderDetail.order_id.toString()
            bodyCancel.stoploss_order_id = getStopLossId(orderDetail)
            bodyCancel.takeprofit_order_id = getTakeprofitId(orderDetail)
            bodyCancel['cancel_parent'] = false
            return bodyCancel
        case CANCEL_TYPE.CANCEL_ORDER_TAKE_PROFIT:
            bodyCancel.order_id = orderDetail.order_id.toString()
            bodyCancel.stoploss_order_id = getStopLossId(orderDetail)
            bodyCancel.takeprofit_order_id = getTakeprofitId(orderDetail)
            bodyCancel['cancel_parent'] = false
            return bodyCancel
        default:
            bodyCancel.order_id = orderDetail.order_id.toString()
            bodyCancel.stoploss_order_id = getStopLossId(orderDetail)
            bodyCancel.takeprofit_order_id = getTakeprofitId(orderDetail)
            bodyCancel['cancel_parent'] = true
            return bodyCancel
    }
}
export function cancelOrder({
    cbError,
    cbSuccess
}) {
    const enableIress = Controller.getIressStatus()
    cancelOrdIress({
        cbError,
        cbSuccess
    });
}

export async function cancelOrdIress({
    cbError,
    cbSuccess
}) {
    try {
        const timeConfirmOrder = new Date().getTime()
        const bodyCancel = getObjectOrderCancel()
        const urlCancelOrder = Api.getUrlCancelOrder()
        console.log('LOG URL BODY DATA', urlCancelOrder, bodyCancel)
        const data = await Api.postData(urlCancelOrder, { data: bodyCancel }, Time.TIMEOUT)
        const objectError = checkErrorModify(data)
        const typeError = 'Cancel'
        // console.log('LOG DATA CANCEL', data)
        if (data == null) return cbError && cbError(ERR.ERR_INTERNAL_CLI);
        if (data.errorCode === ERR.TIMEOUT) return cbError && cbError({ error: getReason(ERR.TIMEOUT) });
        if (Util.arrayHasItem(data.errorCode)) return cbError && cbError({ error: getReason(data.errorCode[0]) });
        if (data.length === 3) {
            checkErrorOrderStopLossTakeprofit({ objectError, cbSuccess, cbError, typeError })
        } else if (data.length === 2) {
            checkErrorStopLostTakeprofit({ objectError, cbSuccess, cbError, typeError })
        } else {
            checkError({ objectError, cbSuccess, cbError, typeError })
        }
    } catch (error) {
        console.log('cancelOrdIress exception', error)
        return cbError && cbError({ error: getReason(ERR.ERR_INTERNAL_CLI) })
    }
}
export async function cancelOrdParitech(timeout) {
    return new Promise(async (resolve, reject) => {
        try {
            const urlPlaceOrder = Api.getUrlPlaceOrder()
            const data = await Api.postData(urlPlaceOrder, { data: orderObject }, timeout, false, false, accessToken);
            resolve(data)
        } catch (error) {
            reject()
        }
    })
}

export async function cancelOrdSaxo(orderObj) {
    const timeConfirmOrder = new Date().getTime()
    try {
        const urlPlaceOrder = Api.getUrlPlaceOrder()
        setTimeout(() => {
            cbError && cbError({ error: getReason(ERR.TIMEOUT) });
        }, 2000);
        return
        const data = await Api.postData(urlPlaceOrder, { data: objectOrder }, Time.TIMEOUT);
        if (data == null) return cbError && cbError(ERR.ERR_INTERNAL_CLI);
        if (data.errorCode === ERR.TIMEOUT) return cbError && cbError({ error: getReason(ERR.TIMEOUT) });
        if (Util.arrayHasItem(data.errorCode)) return cbError && cbError({ error: getReason(data.errorCode[0]) });
        if (data.errorCode !== ERR.SUCCESS) return cbError && cbError({ error: getReason(data.errorCode) });
        return cbSuccess({ error: Business.getOrdConfirm(STATUS.SUCCESS, ACTION.PLACE).txt || 'Place success' })
    } catch (error) {
        return cbShowError(ERR.ERR_INTERNAL_CLI);
    }
}
export function getOrderIdByType(orderDetail) {
    try {
        const typeHeader = getType()
        switch (typeHeader) {
            case CANCEL_TYPE.CANCEL_ORDER_STOP_LOSS:
                return orderDetail.stoploss_order_info && orderDetail.stoploss_order_info.stoploss_order_id
            case CANCEL_TYPE.CANCEL_ORDER_TAKE_PROFIT:
                return orderDetail.takeprofit_order_info && orderDetail.takeprofit_order_info.take_profit_order_id
            default:
                return orderDetail.order_id
        }
    } catch (error) {
        return null
    }
}
