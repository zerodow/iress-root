const model = {
    msg: '',
    orderId: null
}
export function getMessageErrorOrder() {
    return model.msg
}
export function setMessageErrorOrder({ error }) {
    model.msg = error
}

export function getOrderId() {
    return model.orderId
}
export function setOrderId({ orderId }) {
    model.orderId = orderId
}

export function resetOrderId() {
    model.orderId = null
}
