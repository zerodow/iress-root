
import initialState from '../../../reducers/initialState';
export const authSetting = (state = initialState.authSetting, action) => {
    switch (action.type) {
        case 'SET_PIN_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: ''
            }
        case 'SET_PIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                error: ''
            }
        case 'SET_PIN_ERROR':
            return {
                ...state,
                isLoading: false,
                error: 'create new pin fail'
            }
        case 'SET_PIN_CANCEL':
            return {
                ...state,
                isLoading: false,
                error: ''
        }
        case 'CHANGE_PIN_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: ''
        }
        case 'CHANGE_PIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                error: ''
        }
        case 'CHANGE_PIN_ERROR':
            return {
                ...state,
                isLoading: false,
                error: 'create new pin fail'
        }
        case 'CHANGE_PIN_CANCEL':
            return {
                ...state,
                isLoading: false,
                error: ''
        }
        case 'TURN_ON_TOUCH_ID':
            return {
                ...state,
                isTurnOnTouchID: true
        }
        case 'TURN_OFF_TOUCH_ID':
            return {
                ...state,
                isTurnOnTouchID: false
        }
        case 'SET_ENABLE_TOUCH_ID':
            return {
                ...state,
                isTurnOnTouchID: action.enableTouchIDStatus
        }
        case 'BACK_TO_SET_PIN':
            return {
                ...state,
                isLoading: false
            }
        default:
            return state
    }
}
