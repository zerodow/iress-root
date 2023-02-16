import initialState from '../../reducers/initialState';
export const overviewRowEvent = (state = initialState.overviewRowEvent, action) => {
    switch (action.type) {
        case 'OVERVIEW_OPEN_HANDLER':
            return {
                ...state,
                codeOld: state.codeCurrent,
                codeCurrent: action.payload
            }
        default:
            return state
    }
}
