import moment from 'moment';
import initialState from '../../reducers/initialState';
export const overview = (state = initialState.overview, action) => {
    switch (action.type) {
        case 'OVERVIEW_USER_TYPE_RESPONSE':
            return {
                ...state,
                userType: action.payload
            }
        case 'GET_MARKET_INDEX_LIST':
            return {
                ...state,
                loading: true,
                data: []
            }
        case 'CLOSE_MARKET_INDEX_LIST':
            return {
                ...state,
                data: []
            }
        case 'OVERVIEW_WRITE_DATA_REQUEST':
            return {
                ...state,
                isLoading: true
            };
        case 'OVERVIEW_CLEAR_DATA':
            return {
                ...state,
                data: []
            };
        case 'OVERVIEW_WRITE_DATA_SUCCESS':
            action.setRightButton && action.setRightButton(false)
            return {
                ...state,
                isLoading: false
            };
        case 'OVERVIEW_WRITE_DATA_ERROR':
            action.setRightButton && action.setRightButton(false)
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };
        case 'RESPONSE_MARKET_INDEX_LIST':
            return {
                ...state,
                loading: false,
                data: action.payload
            }
        case 'RESPONSE_MARKET_INDEX_LIST_TOP_5':
            return {
                ...state,
                loading: false,
                dataTop5: action.payload
            }
        default:
            return state
    }
}
