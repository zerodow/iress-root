import TYPE from './constants'

export function changeLoading(isLoading) {
    return {
        type: TYPE.ADD_SYMBOL_CHANGE_LOADING,
        payload: isLoading
    }
}
export function changeTextSearch(text = '') {
    return {
        type: TYPE.ADD_SYMBOL_CHANGE_TEXT,
        payload: text
    }
}
export function changeClassFilter(classFilter) {
    return {
        type: TYPE.ADD_SYMBOL_CHANGE_CLASS_FITLER,
        payload: classFilter
    }
}
export function changeDicSymbolSelected(key, isSelected) {
    return {
        type: TYPE.ADD_SYMBOL_CHANGE_DIC_SELECTED_SYMBOL,
        payload: { key, isSelected }
    }
}
export function initDicSymbolSelected(payload) {
    return {
        type: TYPE.ADD_SYMBOL_INIT_DIC_SELECTED_SYMBOL,
        payload
    }
}
