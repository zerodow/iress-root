import initialState from '~/reducers/initialState';
export const categoriesWL = (state = initialState.categoriesWL, action) => {
    const { type, payload } = action
    switch (type) {
        case 'SET_MANAGE_BUTTON_STATUS':
            return {
                ...state,
                manageBtnStatus: payload
            }
        case 'SET_DELETE_BUTTON_STATUS':
            return {
                ...state,
                deleteBtnStatus: payload
            }
        case 'UPDATE_LIST_SYMBOL_ADDED':
            return {
                ...state,
                dicSymbolAdded: payload,
                firstIndex: Object.keys(payload)[0]
            }
        case 'SET_FIRST_INDEX':
            return {
                ...state,
                firstIndex: payload
            }
        case 'RE_RANGER_LIST_SYMBOL_ADDED':
            delete state.dicSymbolAdded[payload]
            const newDicSymbolAdded = { [payload]: true, ...state.dicSymbolAdded }
            return {
                ...state,
                dicSymbolAdded: newDicSymbolAdded,
                firstIndex: payload
            }
        default:
            return state
    }
}
