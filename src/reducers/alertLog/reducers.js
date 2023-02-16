import { getAnimationTypeByTag } from '~s/alertLog/Controller/AlertController'
export const changeAnimationType = (state, payload) => {
    const animationType = payload || getAnimationTypeByTag()
    state.animationType = animationType
    return state;
}
export const changeAlertType = (state, payload) => {
    state.alertType = payload
    return state
}
export const changeTrigger = (state, payload) => {
    state.trigger = payload
    return state;
}
export const changeTargetValue = (state, payload) => {
    state.targetValue = payload
    return state;
}
export const changeError = (state, payload) => {
    state.error = payload
    return state;
}
export const changeDataAlertLog = (state, payload) => {
    state.data = payload
    return state;
}
export const changeReloadAlert = (state, payload) => {
    state.reload = payload
    return state;
}
export const resetBodyAlert = (state, payload) => {
    state.alertType = {
        label: 'Last Price',
        key: 'LAST_PRICE'
    };
    state.trigger = {
        label: 'AT',
        key: 'AT'
    };
    state.targetValue = 0;
    state.reload = true;

    return state;
}
export const clearTargetValue = (state, payload) => {
    state.targetValue = '0';
    return state;
}

export const changeLoading = (state, payload) => {
    state.isLoading = payload;
    return state;
}
export const changeAlertTab = (state, payload) => {
    state.alertTag = payload;
    return state;
}
export const changeNotificationAlertLog = (state, payload) => {
    if (!payload.request_id) return state
    if (payload.request_id !== state.listNotification.request_id) {
        state.listNotification = payload
    } else {
        const listDataObj = [...state.listNotification.data];
        state.listNotification = {
            data: [...listDataObj, ...payload.data],
            request_id: payload.request_id
        }
    }
    return state;
}

export const changeLoadingAlertLog = (state, payload) => {
    state.loading = payload
    return state;
}

export const handleDeleteExcuted = (state, payload) => {
    state.deleteExcuted = payload
    return state;
}
