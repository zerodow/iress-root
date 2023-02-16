
import initialState from '../../reducers/initialState';
import config from '../../config';
export const login = (state = initialState.login, action) => {
    switch (action.type) {
        case 'LOGIN_CLEAR_ERROR':
            return {
                ...state,
                error: ''
            };
        case 'LOAD_LOGIN':
            return {
                ...state,
                isLoading: false
            };
        case 'LOGIN_SAVE_ACCOUNT_INFO':
            return {
                ...state,
                accountInfo: action.payload
            };
        case 'LOGIN_SAVE_TOKEN':
            return {
                ...state,
                loginObj: action.payload
            };
        // case 'CLOSE_LOGIN':
        //     return state;
        case 'SET_LAST_EMAIL':
            return {
                ...state,
                lastEmail: action.email
            };
        case 'LOGIN_REQUEST':
            return {
                ...state,
                isLoading: true,
                isLocked: false,
                email: (action.login.email + '').toLowerCase(),
                error: ''
            };
        case 'LOGIN_REQUEST_GUEST':
            return {
                ...state,
                isLoading: true
            };
        case 'LOGIN_CANCEL':
            return {
                ...state,
                isLoading: false,
                isLocked: false,
                email: '',
                error: ''
            };
        case 'LOGIN_CANCEL_LOADING':
            return {
                ...state,
                isLoading: false
            };
        case 'LOGIN_SET_TOKEN':
            return {
                ...state,
                token: action.token
            };
        case 'LOGIN_CLEAR_TOKEN':
            return {
                ...state,
                loginObj: null
            };
        case 'LOGIN_SET_ACCOUNTID':
            return {
                ...state,
                accountId: action.accountId
            };
        case 'FORGOT_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: ''
            };
        case 'FORGOT_ERROR':
            return {
                ...state,
                isLoading: false,
                error: 'Incorrect email !'
            };
        case 'FORGOT_SUCCESS':
            return {
                ...state,
                isLoading: false,
                forgotPass: false
            };
        case 'FORGET_PASSWORD':
            return {
                ...state,
                forgotPass: !state.forgotPass
            };
        case 'LOGOUT_REQUEST':
            return {
                ...state,
                token: '',
                isLoading: true
            };
        case 'LOGIN_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.error
            };
        case 'LOGIN_ERROR_WITH_ACCOUNT_INACTIVE':
            return {
                ...state,
                isLoading: false,
                error: 'This account is inactive !'
            };
        case 'ACCOUNT_HAVE_BEEN_LOCKED':
            return {
                ...state,
                isLocked: true
            };
        case 'ACCOUNT_HAVE_BEEN_UNLOCKED':
            return {
                ...state,
                isLocked: false
            };
        case 'DISCLAIMER_DISPLAY':
            return {
                ...state,
                checked: action.checked
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                error: '',
                isLoading: false,
                isLogin: true,
                version: config.version,
                isLocked: false,
                token: ''
            };
        case 'LOGIN_APP_SUCCESS':
            return {
                ...state,
                isLoading: false
            };
        case 'LOGOUT_SUCCESS':
            return {
                ...state,
                isLogin: false,
                loginObj: null,
                accountId: null
            };
        case 'SET_LOGIN_FAILED':
            return {
                ...state,
                isLogin: false
            };
        case 'LOGIN_RESET':
            return {
                ...state,
                error: ''
            };
        case 'LOGOUT_ERROR':
            return {
                ...state,
                isLoading: false
            };
        case 'LOGIN_CHANGE_EMAIL':
            return {
                ...state,
                email: action.email,
                error: ''
            };
        case 'LOGIN_CHANGE_PASSWORD':
            return {
                ...state,
                password: action.payload,
                error: ''
            };
        case 'CHANGE_BROKER_NAME':
            return {
                ...state,
                brokerName: action.brokerName,
                error: ''
            };
        case 'AUTH_REQUEST':
            return {
                ...state,
                isAuthLoading: true,
                errorAuth: ''
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                isAuthLoading: false,
                errorAuth: ''
            };
        case 'AUTH_ERROR':
            return {
                ...state,
                isAuthLoading: false,
                errorAuth: 'Incorect password!'
            };
        case 'AUTH_CANCEL':
            return {
                ...state,
                isAuthLoading: false,
                errorAuth: ''
            };
        default:
            return state
    }
}
