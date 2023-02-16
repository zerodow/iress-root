import ENUM from '~/enum'

const {
    ORDERS_SDIE
} = ENUM

export function changeLoadingState(loading) {
    return {
        type: 'CHANGE_ORDERS_LOADING_STATE',
        payload: loading
    }
}

export function changeSyncDataStatus(status) {
    return {
        type: 'CHANGE_ORDERS_SYNC_DATA_STATUS',
        payload: status
    }
}

export function changeSyncSymbolInfoStatus(status) {
    return {
        type: 'CHANGE_ORDERS_SYNC_SYMBOL_INFO_STATUS',
        payload: status
    }
}

export function changeVolumeFilter(status) {
    return {
        type: 'CHANGE_ORDERS_VOLUME_FILTER',
        payload: status
    }
}
export function changeTimeFilter(status) {
    return {
        type: 'CHANGE_ORDERS_TIME_FILTER',
        payload: status
    }
}

export function changeSideFilter({ side, status }) {
    let type = 'CHANGE_ORDERS_BUY_FILTER'
    if (side === ORDERS_SDIE.SELL) {
        type = 'CHANGE_ORDERS_SELL_FILTER'
    }
    return {
        type,
        payload: status
    }
}

export function setOrders(data) {
    return {
        type: 'SET_ORDERS_DATA',
        payload: data
    }
}
export function resetFilterOrders() {
    return {
        type: 'RESET_FILTER_ORDERS'
    }
}
