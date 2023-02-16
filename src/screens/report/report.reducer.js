
import initialState from '../../reducers/initialState';
export const report = (state = initialState.report, action) => {
    switch (action.type) {
        case 'SET_LANG':
            return {
                ...state,
                lang: action.payload
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
        case 'SET_VIBRATION_PREFERENCE':
            return {
                ...state,
                vibration: action.payload
            };
        default:
            return state
    }
}
