import OrderTypeString from '~/constants/order_type_string.js'
import OrderTypeEnum from '~/constants/order_type'
import DurationString from '~/constants/durationString.js'
import { getPriceByRule, getVolAndOrderPriceWhenChangeOrderType } from '~/screens/new_order/Controller/InputController.js'
import { getOrderDetail, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import Enum from '~/enum'
import { getDispathchFunc } from '~/memory/model'
import { changeStepOrderValue } from '~s/new_order/Redux/actions'
import { dataStorage } from '~/storage'
const { AMEND_TYPE, FILL_STATUS, ORDER_INPUT_TYPE } = Enum
const model = {
    lastPrice: 0,
    limitPrice: 0,
    tabTradingStategySelected: {},
    orderType: OrderTypeEnum.LIMIT
}
export function setLastPrice(lastPrice) {
    model.lastPrice = lastPrice
    return true
}
export function setLimitPrice(limitPrice) {
    model.limitPrice = limitPrice
    return true
}
export function getLastPrice() {
    const fillStatus = getOrderDetail().fill_status
    const typeOrder = getType()
    if (fillStatus && typeOrder !== AMEND_TYPE.DEFAULT) {
        // Case Amend Neu lenh da fill het thi khi amend gia trigger se tinh theo gia lastTrade
        switch (fillStatus) {
            case FILL_STATUS.UNFILLED:
            case FILL_STATUS.PARTIALLY_FILLED:
                break
            case FILL_STATUS.FILLED:
                return model.lastPrice
            default:
                break;
        }
    }
    return model.orderType === OrderTypeEnum.LIMIT ? model.limitPrice : model.lastPrice
    /**
     * Neu nhap limitPrice thi se lay gia limit lam gia tinh orderValue nguoc lai lay gia lastTrade
     */
    if (model.limitPrice) {
        return model.orderType === OrderTypeEnum.LIMIT ? model.limitPrice : model.lastPrice
    }
    return model.lastPrice
}
export function getOrderPriceAndVolWhenChangeOrderType({ quantity, orderPrice, isTypeValue }) {
    if (model.orderType !== OrderTypeEnum.LIMIT) {
        if (isTypeValue) {
            return getVolAndOrderPriceWhenChangeOrderType({
                volume: quantity,
                value: orderPrice,
                type: ORDER_INPUT_TYPE.ORDER_VALUE,
                step: dataStorage.stepQuantity,
                isIncrease: true
            })
        } else {
            return getVolAndOrderPriceWhenChangeOrderType({
                volume: quantity,
                value: orderPrice,
                type: ORDER_INPUT_TYPE.ORDER_QUANTITY,
                step: dataStorage.stepQuantity,
                isIncrease: true
            })
        }
    } else {
        if (isTypeValue) {
            return getVolAndOrderPriceWhenChangeOrderType({
                volume: quantity,
                value: orderPrice,
                type: ORDER_INPUT_TYPE.ORDER_VALUE,
                step: dataStorage.stepQuantity,
                isIncrease: true
            })
        } else {
            return getVolAndOrderPriceWhenChangeOrderType({
                volume: quantity,
                value: orderPrice,
                type: ORDER_INPUT_TYPE.ORDER_QUANTITY,
                step: dataStorage.stepQuantity,
                isIncrease: true
            })
        }
    }
}
export function setOrderType(orderTypeKey) {
    model.orderType = orderTypeKey
}
export function getOrderType() {
    return model.orderType
}
export function reset() {
    model.lastPrice = 0
    model.limitPrice = 0
    model.orderType = OrderTypeEnum.LIMIT
    model.tabTradingStategySelected = {}
}
export function resetPriceModelWhenChangeAccount() {
    model.limitPrice = 0
    model.orderType = OrderTypeEnum.LIMIT
    model.tabTradingStategySelected = {}
}
export default model
