import TYPE from './constants'
export function changeErrorSystemLoading(isloading) {
    return {
        type: TYPE.ERROR_SYSTEM_CHANGE_LOADING,
        payload: isloading
    }
}
