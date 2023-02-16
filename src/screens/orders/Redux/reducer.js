
import initialState from '~/reducers/initialState';
import ENUM from '~/enum'
import { clone } from '~/utils/pure_func'
import { resetFilter } from '~s/orders/Model/OrdersModel'

const { FILTER_CIRCLE_STATUS } = ENUM
export const orders = (state = initialState.orders, action) => {
    switch (action.type) {
        case 'CHANGE_ORDERS_LOADING_STATE':
            return {
                ...state,
                isLoading: action.payload
            }
        case 'CHANGE_ORDERS_SYNC_DATA_STATUS':
            return {
                ...state,
                isSyncData: action.payload
            }
        case 'CHANGE_ORDERS_SYNC_SYMBOL_INFO_STATUS':
            return {
                ...state,
                isSyncSymbolinfo: action.payload
            }
        case 'CHANGE_ORDERS_VOLUME_FILTER':
            return {
                ...state,
                volumeFilter: action.payload
            }
        case 'CHANGE_ORDERS_TIME_FILTER':
            return {
                ...state,
                timeFilter: action.payload
            }
        case 'CHANGE_ORDERS_BUY_FILTER':
            return {
                ...state,
                buyFilter: action.payload
            }
        case 'CHANGE_ORDERS_SELL_FILTER':
            return {
                ...state,
                sellFilter: action.payload
            }
        case 'SET_ORDERS_DATA':
            return {
                ...state,
                data: clone(action.payload),
                isLoading: false
            }
        case 'RESET_FILTER_ORDERS':
            resetFilter()
            return {
                ...state,
                buyFilter: false,
                sellFilter: false,
                volumeFilter: FILTER_CIRCLE_STATUS.NONE,
                timeFilter: FILTER_CIRCLE_STATUS.DOWN
            }
        default:
            return state
    }
}
