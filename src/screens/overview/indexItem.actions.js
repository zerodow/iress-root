export function openHandler(code) {
    return dispatch => {
        dispatch(changeIndex(code))
    }
}

export function changeIndex(payload) {
    return {
        type: 'OVERVIEW_OPEN_HANDLER',
        payload
    }
}
