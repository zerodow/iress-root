export function changePLState(plState) {
    return {
        type: 'CHANGE_PL_STATE',
        payload: plState
    }
}
export function changeAccActive(accId) {
    return {
        type: 'CHANGE_ACC_ACTIVE',
        payload: accId
    }
}

export function storePortfolioTotal(data) {
    return {
        type: 'STORE_PORTFOLIO_TOTAL',
        payload: data
    }
}

export function changeLoadingState(loading) {
    return {
        type: 'CHANGE_LOADING_STATE',
        payload: loading
    }
}

export function resetPLState() {
    return {
        type: 'RESET_PL_STATE'
    }
}
export function changeIsSelector(isSelected) {
    return {
        type: 'CHANGE_IS_SELECTOR',
        payload: isSelected
     }
}
