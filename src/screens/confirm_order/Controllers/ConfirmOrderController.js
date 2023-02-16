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
import { getOrderDetail, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import {
    logDevice,
    getReason
} from '~/lib/base/functionUtil';
import { checkErrorModify, checkError, checkErrorOrderStopLostTakeprofit, checkErrorStopLostTakeprofit } from '~s/confirm_order/Controllers/ContentController'
import * as Api from '~/api'
import Time from '~/constants/time';
import { dataAccountFake } from '~/component/search_account/Views/Content';

const ERR = ENUM.ERROR_CODE;
const ACTION = ENUM.ACTION_ORD;
const STATUS = ENUM.STATUS_ORD;
const TITLE_NOTI = ENUM.TITLE_NOTI;
const { STATUS_ORD, ACTION_ORD, AMEND_TYPE } = ENUM
const Json = Util.json;
export function amendOrder({
    objectOrder,
    cbError,
    cbSuccess
}) {
    const enableIress = Controller.getIressStatus()
    amendOrdIress({
        objectOrder,
        cbError,
        cbSuccess
    });
}
export function getOrderId() {
    const orderDetail = getOrderDetail()
    const type = getType()
    return orderDetail.order_id
}
export async function amendOrdIress({
    objectOrder,
    cbError,
    cbSuccess
}) {
    const timeConfirmOrder = new Date().getTime()
    const orderId = getOrderId()
    const orderDetail = getOrderDetail()
    const orderState = orderDetail.order_state
    const urlPlaceOrder = Api.getUrlOrder(orderId)
    console.log('body amend', urlPlaceOrder)
    console.log('body amend', JSON.stringify({ data: objectOrder }))

    await Api.putData(urlPlaceOrder, { data: objectOrder }, Time.TIMEOUT)
        .then(resopnse => {
            let data = []
            console.log('AMEND ORDER DATA', resopnse)
            if (orderState === 'Inactive') {
                data = resopnse.filter(function (item) {
                    return item.stoploss_order_id || item.takeprofit_order_id
                });
            } else {
                data = resopnse.filter(function (item) {
                    return item
                });
            }
            const objectError = checkErrorModify(data)
            const typeError = 'Amend'
            if (data == null) return cbError && cbError(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return cbError && cbError({ error: getReason(ERR.TIMEOUT) });
            if (Util.arrayHasItem(data.errorCode)) return cbError && cbError({ error: getReason(data.errorCode[0]) });
            if (data.length === 3) {
                checkErrorOrderStopLostTakeprofit({ objectError, cbSuccess, cbError, typeError })
            } else if (data.length === 2) {
                checkErrorStopLostTakeprofit({ objectError, cbSuccess, cbError, typeError })
            } else {
                checkError({ objectError, cbSuccess, cbError, typeError })
            }
        })
        .catch((error) => {
            return cbError && cbError({ error: getReason(ERR.ERR_INTERNAL_CLI) })
        });
}
export async function amendOrdParitech(objectOrder, timeout) {
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

export async function amendOrdSaxo(orderObj) {
    const timeConfirmOrder = new Date().getTime()
    try {
        const urlPlaceOrder = Api.getUrlPlaceOrder()
        setTimeout(() => {
            cbError && cbError({ error: getReason(ERR.TIMEOUT) });
        }, 2000);
        return
    } catch (error) {
        return cbShowError(ERR.ERR_INTERNAL_CLI);
    }
}
