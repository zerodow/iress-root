import Immutable from 'seamless-immutable';
import Enum from '~/enum'
import TYPE from './constants'
export const INITIAL_STATE = Immutable({
    isLoadingButtonConfirm: false,
    isLoadingInitialMargin: true,
    dismissModalPlaceOrder: false
});
export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPE.CONFIRM_PLACE_ORDER_CHANGE_LOADING_BUTTON_CONFIRM:
            return state.merge({ isLoadingButtonConfirm: action.payload })
        case TYPE.CONFIRM_PLACE_ORDER_RESET_STATE:
            return state.merge({
                isLoadingButtonConfirm: false
            })
        case TYPE.CONFIRM_PLACE_ORDER_CHANGE_LOADING_INITIAL_MARGIN:
            return state.merge({
                isLoadingInitialMargin: action.payload
            })
        case TYPE.DISMISS_MODAL_PLACE_ORDER:
            return state.merge({
                dismissModalPlaceOrder: action.payload
            })
        default:
            return state
    }
}
