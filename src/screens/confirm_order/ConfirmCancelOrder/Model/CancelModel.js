import Enum from '~/enum'
const model = {
    type: Enum.CANCEL_TYPE.CANCEL_ORDER_DEFAULT,
    orderDetail: {}
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
export function reset() {
    model.type = Enum.CANCEL_TYPE.CANCEL_ORDER_DEFAULT
    model.orderDetail = {}
}
export function getIsBuy() {
    return model.orderDetail.side === 'buy'
}
