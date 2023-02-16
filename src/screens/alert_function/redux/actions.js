import Constans from './constans'
export function changeScreenActive(payload) {
    return {
        payload,
        type: Constans.CHANGE_SCREEN_ACTIVE
    }
}
export function updateStatusButtonConfirm(payload) {
    return {
        payload,
        type: Constans.UPDATE_STATUS_BUTTON_CONFIRM
    }
}
export function setLoading(payload) {
    return {
        payload,
        type: Constans.ALERT_SET_LOADING
    }
}
export function setLoadingEditAlertList(payload) {
    return {
        payload,
        type: Constans.EDIT_ALERT_LIST_SET_LOADING
    }
}
