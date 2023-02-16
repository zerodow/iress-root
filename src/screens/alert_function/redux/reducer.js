import Constans from './constans'
import Immutable from 'seamless-immutable';
import ENUM from '~/enum'
const SCREEN_ACTIVE = ENUM.ALERT_SCREEN
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
    screen_actived: SCREEN_ACTIVE.LIST_ALERT,
    isDisableButtonConfirm: true,
    isLoading: false,
    isLoadingEditAlertList: false
});
export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constans.CHANGE_SCREEN_ACTIVE:
            return state.merge({ screen_actived: action.payload })
        case Constans.UPDATE_STATUS_BUTTON_CONFIRM:
            return state.merge({ isDisableButtonConfirm: action.payload })
        case Constans.ALERT_SET_LOADING:
            return state.merge({ isLoading: action.payload })
        case Constans.EDIT_ALERT_LIST_SET_LOADING:
            return state.merge({ isLoadingEditAlertList: action.payload })
        default:
            return state
    }
}
