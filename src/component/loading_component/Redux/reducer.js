
import initialState from '~/reducers/initialState';

export const loadingList = (state = initialState.loadingList, action) => {
    switch (action.type) {
        case 'CHANGE_LOADING_ANIMATION_TYPE':
            return {
                ...state,
                animationType: action.payload
            }
        default:
            return state
    }
}
