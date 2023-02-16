import TYPE from './constants'

export function changeLoading(isLoading) {
    return {
        type: TYPE.SEARCH_SYMBOL_CHANGE_LOADING,
        payload: isLoading
    }
}
export function changeTextSearch(text = '') {
    return {
        type: TYPE.SEARCH_SYMBOL_CHANGE_TEXT,
        payload: text
    }
}
export function changeClassFilter(classFilter) {
    return {
        type: TYPE.SEARCH_SYMBOL_CHANGE_CLASS_FITLER,
        payload: classFilter
    }
}
export function resetSearchSymbol(classFilter) {
    return {
        type: TYPE.SEARCH_SYMBOL_RESET,
        payload: classFilter
    }
}
