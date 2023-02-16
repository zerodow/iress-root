import TYPE from './constants'
export function initialState(state) {
    return {
        payload: state,
        type: TYPE.INITIAL_STATE
    }
}
export function updateDataSelected(dataSelected) {
    return {
        payload: dataSelected,
        type: TYPE.UPDATE_SELECTED
    }
}
export function updatePriceboard(priceBoard) {
    return {
        payload: priceBoard,
        type: TYPE.UPDATE_PRICEBOARD
    }
}
export function updateListSymbol(listSymbol) {
    return {
        payload: listSymbol,
        type: TYPE.UPDATE_LIST_SYMBOL
    }
}
export function updateListSymbolAndResetDataSelected(listSymbol) {
    const startSymbol = listSymbol[0]
    const keyTop = startSymbol ? `${startSymbol.exchange}#${startSymbol.symbol}` : null
    return {
        payload: { listSymbol, keyTop },
        type: TYPE.UPDATE_LIST_SYMBOL_BY_DELETE
    }
}
export function updateKeyTopIndex({ keyTopIndex, listSymbol }) {
    return {
        payload: { keyTopIndex, listSymbol },
        type: TYPE.UPDATE_TOP_INDEX
    }
}
export function resetState() {
    return {
        type: TYPE.RESET_STATE
    }
}
