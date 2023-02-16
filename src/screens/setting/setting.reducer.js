
import initialState from '../../reducers/initialState';
export const setting = (state = initialState.setting, action) => {
    switch (action.type) {
        case 'SET_LANG':
            return {
                ...state,
                lang: action.payload
            }
        case 'SET_TEXT_FONT_SIZE':
            return {
                ...state,
                textFontSize: action.payload
            }
            break;
        case 'SET_HOME_SCREEN':
            return {
                ...state,
                homeScreen: action.payload
            }
            break;
        case 'SETTING_RESPONSE':
            return {
                ...state,
                lang: action.payload.lang,
                noti: action.payload.noti,
                notiSound: action.payload.notiSound,
                vibration: action.payload.vibration,
                news: action.payload.news,
                order: action.payload.order,
                homeScreen: action.payload.homeScreen,
                pinSetting: action.payload.pinSetting,
                userPriceSource: action.payload.userPriceSource,
                everything_type_news: action.payload.everything_type_news,
                related_type_news: action.payload.related_type_news,
                search_history: action.payload.search_history,
                alert_history: action.payload.alert_history,
                timeZone: action.payload.timeZone,
                textFontSize: action.payload.textFontSize,
                order_history: action.payload.order_history,
                account_history: action.payload.account_history,
                watchlist_history: action.payload.watchlist_history
            }
        case 'SET_NOTI_PREFERENCE':
            return {
                ...state,
                noti: action.payload
            };
        case 'SET_NOTI_SOUND_PREFERENCE':
            return {
                ...state,
                notiSound: action.payload
            };
        case 'SET_LOGIN_PASSWORD_PREFERENCE':
            return {
                ...state,
                loginWithPassword: action.payload
            };
        case 'SET_VIBRATION_PREFERENCE':
            return {
                ...state,
                vibration: action.payload
            };
        case 'SET_BIOMETRIC':
            return {
                ...state,
                biometric: action.payload
            };
        case 'SET_NOTIFICATION_ALERT':
            return {
                ...state,
                notiAlert: action.payload
            };
        default:
            return state
    }
}
