import TYPE from './constants'

export function changeLoading(isLoading) {
    return {
        type: TYPE.SEARCH_ACCOUNT_CHANGE_LOADING,
        payload: isLoading
    }
}
export function changeTextSearch(text = '') {
    return {
        type: TYPE.SEARCH_ACCOUNT_CHANGE_TEXT,
        payload: text
    }
}
export function changeIsSearch(isSearch) {
    return {
        type: TYPE.SEARCH_ACCOUNT_CHANGE_IS_SEARCH,
        payload: isSearch
    }
}
