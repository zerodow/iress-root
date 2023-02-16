import TYPE from './constants'
export function changeLoadingButtonConfirm(payload) {
    return {
        type: TYPE.CONFIRM_PLACE_ORDER_CHANGE_LOADING_BUTTON_CONFIRM,
        payload
    }
}
export function resetStateConfirmOrder() {
    return {
        type: TYPE.CONFIRM_PLACE_ORDER_RESET_STATE
    }
}
export function changeLoadingInitialMargin(isLoading) {
    return {
        type: TYPE.CONFIRM_PLACE_ORDER_CHANGE_LOADING_INITIAL_MARGIN,
        payload: isLoading
    }
}
export function dismissModalPlaceOrder(isDismiss) {
    return {
        type: TYPE.DISMISS_MODAL_PLACE_ORDER,
        payload: isDismiss
    }
}
