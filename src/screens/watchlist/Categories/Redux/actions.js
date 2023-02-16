export function setManageButtonStatus(status) {
    return {
        type: 'SET_MANAGE_BUTTON_STATUS',
        payload: status
    }
}

export function setDeleteButtonStatus(status) {
    return {
        type: 'SET_DELETE_BUTTON_STATUS',
        payload: status
    }
}

export function updateListSymbolAdded(dicSymbolAdded) {
    return {
        type: 'UPDATE_LIST_SYMBOL_ADDED',
        payload: dicSymbolAdded
    }
}

export function reRangerListSymbolAdded(key) {
    return {
        type: 'RE_RANGER_LIST_SYMBOL_ADDED',
        payload: key
    }
}

export function setFirstIndex(key) {
    // key exp: ANZ#ASX
    return {
        type: 'SET_FIRST_INDEX',
        payload: key
    }
}
