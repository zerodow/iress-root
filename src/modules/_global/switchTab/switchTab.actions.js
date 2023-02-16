
export function switchTab(screen) {
    return dispatch => {
        dispatch(switchTabHandler(screen));
    };
}

export function switchTabHandler(screen) {
    return {
        type: 'SWITCH_TAB',
        screen
    };
}
