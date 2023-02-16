import Enum from '~/enum'
const { SLTP_ORDER_STATUS } = Enum
const model = {
    type: Enum.AMEND_TYPE.DEFAULT,
    isBuy: true,
    orderDetail: {}
}
export function setIsBuy(isBuy) {
    model.isBuy = isBuy
}
export function getIsBuy() {
    return model.isBuy
}
export function getOrderDetail() {
    return model.orderDetail
}
export function setOrderDetail(orderDetail) {
    model.orderDetail = orderDetail
}
export function setType(type) {
    model.type = type
}
export function getType() {
    return model.type
}
export function isAmend() {
    return !(getType() === Enum.AMEND_TYPE.DEFAULT)
}
export function checkDisabledChangeAccount() {
    return getType() !== Enum.AMEND_TYPE.DEFAULT
}
export function checkDisabledChangeInput() {
    return getType() === Enum.AMEND_TYPE.AMEND_TRADING_STRATEGIES || getType() === Enum.AMEND_TYPE.AMEND_TRADING_STOPPRICE || getType() === Enum.AMEND_TYPE.AMEND_TRADING_PROFITLOSS
}
export function checkDisabledStopPrice() {
    let disabled = false
    if (getType() === Enum.AMEND_TYPE.DEFAULT) {
        return false
    }
    try {
        const { stoploss_order_info: stoplossOrderInfo } = model.orderDetail
        if (stoplossOrderInfo) {
            const { stoploss_order_status: slOrderStatus } = stoplossOrderInfo
            switch (slOrderStatus) {
                case SLTP_ORDER_STATUS.TRIGGERED:
                case SLTP_ORDER_STATUS.TRIGGERED_INACTIVE:
                    disabled = true
                    break;
                default:
                    break;
            }
        }
    } catch (error) {

    }
    return disabled
}
export function checkDisabledTakeProfitPrice() {
    let disabled = false
    try {
        const { takeprofit_order_info: takeprofitOrderInfo } = model.orderDetail
        if (takeprofitOrderInfo) {
            const { takeprofit_order_status: tpOrderStatus } = takeprofitOrderInfo
            switch (tpOrderStatus) {
                case SLTP_ORDER_STATUS.TRIGGERED:
                case SLTP_ORDER_STATUS.TRIGGERED_INACTIVE:
                    disabled = true
                    break;
                default:
                    break;
            }
        }
    } catch (error) {

    }
    return disabled
}
export function reset() {
    model.type = Enum.AMEND_TYPE.DEFAULT
    model.orderDetail = {}
    model.isBuy = true
}
