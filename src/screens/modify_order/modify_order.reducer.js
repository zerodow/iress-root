import Big from 'big.js';
import initialState from '../../reducers/initialState';

export const modifyOrder = (state = initialState.modifyOrder, action) => {
  switch (action.type) {
    case 'MODIFY_ORDER_CHANGE_TRAILING_STOP_PRICE':
      return {
        ...state,
        trailingStopPrice: action.payload
      }
    case 'MODIFY_ORDER_CHANGE_TRAILING_AMOUNT':
      return {
        ...state,
        trailingAmount: action.payload
      }
    case 'MODIFY_ORDER_CHANGE_TRAILING_PERCENT':
      return {
        ...state,
        trailingPercent: action.payload
      }
    case 'MODIFY_ORDER_WRITE_DATA_REQUEST':
      return {
        ...state,
        isLoading: true
      };
    case 'MODIFY_ORDER_WRITE_DATA_SUCCESS':
      return {
        ...state,
        isLoading: false
      };
    case 'MODIFY_ORDER_WRITE_DATA_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'SETUP_DATA_LOADER':
      return {
        ...state,
        limitPrice: action.initData.limit_price,
        stopPrice: action.initData.stop_price,
        price: action.initData.price,
        trailPercent: action.initData.trail_percent,
        trailAmount: action.initData.trail_amount,
        volume: action.initData.volume,
        filledQuantity: action.initData.filled_quantity
      }
    case 'MODIFY_ORDER_SEND_REQUEST':
      return {
        ...state,
        isSending: true
      }
    case 'MODIFY_ORDER_CHANGE_VOLUME':
      return {
        ...state,
        volume: action.volume
      }
    case 'MODIFY_ORDER_CHANGE_LIMIT_PRICE':
      return {
        ...state,
        limitPrice: action.value
      }
    case 'MODIFY_ORDER_CHANGE_STOP_PRICE':
      return {
        ...state,
        stopPrice: action.value
      }
    case 'CHANGE_TRAIL_MODIFY_ORDER':
      return {
        ...state,
        trail: action.trail
      }
    case 'CHANGE_TRAIL_PERCENT_MODIFY_ORDER':
      return {
        ...state,
        trailPercent: action.value
      }
    case 'CHANGE_TRAIL_AMOUNT_MODIFY_ORDER':
      return {
        ...state,
        trailAmount: action.value
      }
    case 'MODIFY_ORDER_CHANGE_LIST_LIMIT_PRICE':
      return {
        ...state,
        listLimitPrice: action.listData
      }
    case 'MODIFY_ORDER_CHANGE_LIST_STOP_PRICE':
      return {
        ...state,
        listStopPrice: action.listData
      }
    case 'RESET_INITIAL_MODIFY_ORDER':
      return {
        ...state,
        limitPrice: 0,
        stopPrice: 0,
        volume: 0,
        price: 0,
        trail: '%',
        trailPercent: 0,
        trailAmount: 0
      }
    default:
      return state;
  }
}
