
import initialState from './reducers/initialState';
import { func, dataStorage } from './storage';
import * as Controller from './memory/controller';
import Enum from './enum';

const REDUX_EVENT_TYPE = Enum.REDUX_EVENT_TYPE

export const app = (state = initialState.app, action) => {
    switch (action.type) {
        case 'APP_SYMBOL_RESPONSE':
            const keys = state.keys;
            keys[`symbol_equity`] = action.key;
            const values = state.values;
            values[`symbol_equity`] = action.data;
            return {
                ...state,
                keys,
                values
            };
        case 'APP_EXCHANGE_RESPONSE':
            const keysExchange = state.keys;
            keysExchange[`exchange`] = action.key;
            const valuesExchange = state.values;
            valuesExchange[`exchange`] = action.data;
            return {
                ...state,
                keys: keysExchange,
                values: valuesExchange
            };
        case REDUX_EVENT_TYPE.APP_CHANGE_CONNECTION:
            return {
                ...state,
                isConnected: action.payload
            };
        case 'APP_CHANGE_ACCOUNT':
            return {
                ...state,
                isReviewAccount: action.payload
            };
        case 'SET_LOGIN_USER_TYPE':
            dataStorage.loginUserType = action.userType;
            return {
                ...state,
                loginUserType: action.userType
            };
        case 'APP_EXCHANGE_API_RESPONSE':
            return {
                ...state,
                exchanges: action.payload
            };
        case 'UPDATE_FIRST_OPEN':
            return {
                ...state,
                fisrt_open: false,
                clear_storage: false
            };
        case 'UPDATE_CLEAR_STORAGE':
            return {
                ...state,
                clear_storage: false
            };
        case 'APP_SAVE_VERSION':
            Controller.setIsDemo(action.payload)
            return {
                ...state,
                isDemo: action.payload
            };
        case 'APP_SYMBOL_API_RESPONSE':
            let symbols = Object.assign(state.listSymbolApi, action.payload);
            func.setSymbols(symbols);
            return {
                ...state,
                listSymbolApi: symbols
            };
        default:
            return state
    }
}
