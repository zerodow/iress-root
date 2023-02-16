import * as InvertTraslate from '~/invert_translate'
import * as api from '~/api';
import Moment from 'moment'

import orderTypeString from '~/constants/order_type_string'
import Enum from '~/enum'
import { getOrderDetail, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import I18n from '~/modules/language/index';
import { isErrorSystemByCode } from '~/component/error_system/Controllers/ErrorSystem.js'
import { getExchange } from '~s/new_order/Model/AttributeModel'
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js'

const { DURATION_STRING, EXCHANGE_DETAIL, ERROR_MODIFY_CANCEL_ORDERS, ERROR_MODIFY_AMEND_ORDERS, DURATION_CODE, EXCHANGE } = Enum
export function getOrderTypeString(orderType) {
    const orderTypeString = getOrderType(orderType)
    return InvertTraslate.getInvertTranslate(orderTypeString)
}
export function getLifeTimeDisplay({ newOrder = {} }) {
    try {
        const duration = newOrder.duration
        if (duration.key === DURATION_CODE.DATE || duration.key === DURATION_CODE.GTD) {
            return Moment(newOrder.date).format('DD MMM YYYY')
        }
        return duration.label
    } catch (e) {
        return ''
    }
}
export function getOrderType(orderType) {
    try {
        orderType = (orderType + '').toUpperCase();
        const newKey = (orderType + '').replace('_ORDER', '');
        if (orderTypeString[newKey] === orderTypeString.STOPLIMIT) return orderTypeString.STOPLOSS
        const stringReturn = orderTypeString[newKey];
        if (!stringReturn) return '--'
        return stringReturn;
    } catch (error) {
        console.log('getOrderType listContent logAndReport exception: ', error)
        return ''
    }
}
export function getDisplayDuration({ duration }) {
    return DURATION_STRING[duration]
}
export function getDisplayDestination({ destination }) {
    try {
        const result = destination.split(':')[1]
        if (result) {
            return result
        }
        const keyTrans = EXCHANGE_DETAIL[destination].displayExchange
        return I18n.t(keyTrans) || destination
    } catch (error) {
        return ''
    }
}
export async function getFees({ orderObj }) {
    return new Promise(async resolve => {
        try {
            const feesUrl = api.getUrlFee();
            api.postData(feesUrl, { data: orderObj })
                .then((data) => {
                    if (isErrorSystemByCode(data)) return
                    resolve(data);
                })
                .catch((err) => {
                    resolve({});
                });
        } catch (error) {
            resolve({})
        }
    })
}
export function convertedCurrentcyFormat(value) {
    const exchange = getExchange()
    if (exchange === EXCHANGE.ASX) {
        return value
    } else {
        return value
    }
}
export function convertPrice(value) {
    const newValue = getDecimalPriceByRule() === 1 ? value / 100 : value
    return newValue
}
export function checkErrorModify(data) {
    const objError = {}
    // console.log('DATA', data)
    data.forEach(e => {
        if (e.order_id && e.errorCode === '200') {
            objError['original_error'] = true
        }
        if (e.order_id && e.errorCode !== '200') {
            objError['original_error'] = false
        }
        if (e.stoploss_order_id && e.errorCode === '200') {
            objError['stoploss_error'] = true
        }
        if (e.stoploss_order_id && e.errorCode !== '200') {
            objError['stoploss_error'] = false
        }
        if (e.takeprofit_order_id && e.errorCode === '200') {
            objError['takeprofit_error'] = true
        }
        if (e.takeprofit_order_id && e.errorCode !== '200') {
            objError['takeprofit_error'] = false
        }
    });
    return objError
}
export function checkErrorOrderStopLostTakeprofit({ objectError, cbSuccess, cbError, typeError }) {
    const originalError = objectError.original_error
    const stoplossError = objectError.stoploss_error
    const takeprofitError = objectError.takeprofit_error
    if (typeError === 'Cancel') {
        if (originalError && stoplossError && takeprofitError) return cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_SUCCESS_ST_TP_SUCCESS })
        if (originalError && stoplossError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_ST_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_FAILED })]
        if (originalError && !stoplossError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_FAILED })]
        if (originalError && !stoplossError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_ST_FAILED })]
        if (!originalError && stoplossError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED })]
        if (!originalError && !stoplossError && !takeprofitError) return cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED_ST_TP_FAILED })
        if (!originalError && stoplossError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED_TP_FAILED })]
        if (!originalError && !stoplossError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED_ST_FAILED })]
    } else {
        if (originalError && stoplossError && takeprofitError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_SUCCESS_ST_TP_SUCCESS })
        if (originalError && stoplossError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_ST_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.TP_FAILED })]
        if (originalError && !stoplossError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ST_FAILED })]
        if (originalError && !stoplossError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.TP_ST_FAILED })]
        if (!originalError && stoplossError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ST_TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED })]
        if (!originalError && !stoplossError && !takeprofitError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED_ST_TP_FAILED })
        if (!originalError && stoplossError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ST_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED_TP_FAILED })]
        if (!originalError && !stoplossError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED_ST_FAILED })]
    }
}
export function checkErrorStopLostTakeprofit({ objectError, cbSuccess, cbError, typeError }) {
    const originalError = objectError.original_error
    const stoplossError = objectError.stoploss_error
    const takeprofitError = objectError.takeprofit_error
    if (typeError === 'Cancel') {
        if (takeprofitError && stoplossError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ST_TP_SUCCESS })
        if (!takeprofitError && !stoplossError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ST_TP_FAILED })
        if (originalError && stoplossError) return cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_ST_SUCCESS })
        if (originalError && takeprofitError) return cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_TP_SUCCESS })
        if (originalError && !stoplossError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_FAILED })]
        if (originalError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_FAILED })]
        if (!originalError && stoplossError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED })]
        if (!originalError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED })]
        if (!originalError && !takeprofitError) return cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED_TP_FAILED })
        if (!originalError && !stoplossError) return cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED_ST_FAILED })
    } else {
        if (takeprofitError && stoplossError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ST_TP_SUCCESS })
        if (!takeprofitError && !stoplossError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ST_TP_FAILED })
        if (originalError && stoplossError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_ST_SUCCESS })
        if (originalError && takeprofitError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_TP_SUCCESS })
        if (originalError && !stoplossError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ST_FAILED })]
        if (originalError && !takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.TP_FAILED })]
        if (!originalError && stoplossError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ST_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED })]
        if (!originalError && takeprofitError) return [cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.TP_SUCCESS }), cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED })]
        if (!originalError && !takeprofitError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED_TP_FAILED })
        if (!originalError && !stoplossError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED_ST_FAILED })
    }
}
export function checkError({ objectError, cbSuccess, cbError, typeError }) {
    const originalError = objectError.original_error
    const stoplossError = objectError.stoploss_error
    const takeprofitError = objectError.takeprofit_error
    if (typeError === 'Cancel') {
        if (originalError) return cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_SUCCESS })
        if (stoplossError) return cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_SUCCESS })
        if (takeprofitError) return cbSuccess({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_SUCCESS })
        if (!originalError) return cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ORIGINAL_FAILED })
        if (!stoplossError) return cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.ST_FAILED })
        if (!takeprofitError) return cbError && cbError({ error: ERROR_MODIFY_CANCEL_ORDERS.TP_FAILED })
    } else {
        if (originalError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_SUCCESS })
        if (stoplossError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.ST_SUCCESS })
        if (takeprofitError) return cbSuccess({ error: ERROR_MODIFY_AMEND_ORDERS.TP_SUCCESS })
        if (!originalError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ORIGINAL_FAILED })
        if (!stoplossError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.ST_FAILED })
        if (!takeprofitError) return cbError && cbError({ error: ERROR_MODIFY_AMEND_ORDERS.TP_FAILED })
    }
}
