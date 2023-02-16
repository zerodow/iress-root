'use strict';
import Big from 'big.js';
import initialState from '../../reducers/initialState';
import { func } from '../../storage';
import * as Controller from '../../memory/controller'
import * as api from '../../api';
import { logDevice } from '../../lib/base/functionUtil';

export const order = (state = initialState.order, action) => {
  switch (action.type) {
    case 'ORDER_CHANGE_TAB_SCROLL':
      return {
        ...state,
        tabInfo: action.payload
      }
    case 'CHANGE_TRAILING_STOP_PRICE':
      return {
        ...state,
        trailingStopPrice: action.payload
      }
    case 'CHANGE_TRAILING_AMOUNT':
      return {
        ...state,
        trailingAmount: action.payload
      }
    case 'CHANGE_TRAILING_PERCENT':
      return {
        ...state,
        trailingPercent: action.payload
      }
    case 'CHANGE_ORDER_TRIGGER_TYPE':
      return {
        ...state,
        triggerType: action.payload
      }
    case 'CHANGE_ORDER_VOLUME':
      return {
        ...state,
        volume: action.payload
      }
    case 'NEW_ORDER_SETUP_DATA_LOADER':
      return {
        ...state,
        volume: action.initData.volume,
        exchange: action.initData.exchange,
        orderType: 'MARKET TO LIMIT'
      }
    case 'CHANGE_ORDER_TYPE':
      return {
        ...state,
        orderType: (action.orderType + '').toUpperCase()
      }
    case 'NEW_ORDER_SEND_REQUEST':
      return {
        ...state,
        isSendOrder: true
      }
    case 'NEW_ORDER_CHANGE_VOLUME':
      return {
        ...state,
        volume: action.volume
      }
    case 'NEW_ORDER_CHANGE_LIMIT_PRICE':
      return {
        ...state,
        limitPrice: action.value
      }
    case 'NEW_ORDER_CHANGE_STOP_PRICE':
      return {
        ...state,
        stopPrice: action.value
      }
    case 'ORDER_WRITE_DATA_REQUEST':
      return {
        ...state,
        isLoading: true
      };
    case 'ORDER_WRITE_DATA_SUCCESS':
      return {
        ...state,
        isLoading: false
      };
    case 'ORDER_WRITE_DATA_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'CHANGE_BUY_SELL':
      return {
        ...state,
        tradeType: action.tradeType
      }
    case 'CHANGE_TRAIL':
      return {
        ...state,
        trail: action.trail
      }
    case 'NEW_ORDER_CHANGE_EXCHANGE':
      return {
        ...state,
        exchange: action.exchange
      }
    case 'NEW_ORDER_CHANGE_LIST_LIMIT_PRICE':
      return {
        ...state,
        listLimitPrice: action.listData
      }
    case 'NEW_ORDER_CHANGE_LIST_STOP_PRICE':
      return {
        ...state,
        listStopPrice: action.listData
      }
    case 'SAVE_HISTORY_SEARCH_SYMBOL':
      const userId = func.getUserId();
      const urlGet = api.getUrlUserSettingByUserId(userId, 'get');
      api.requestData(urlGet, true).then(setting => {
        if (setting) {
          const lang = setting.lang || 'en';
          Controller.setLang(lang)
          const newSetting = setting;
          let listSearch = setting.order_history || [];
          const data = action.payload;
          let checkExist = listSearch.filter(function (obj, i) {
            return obj.symbol === data.symbol;
          });
          if (checkExist.length === 0) {
            if (listSearch.length < 10) {
              listSearch = [data, ...listSearch];
            } else {
              listSearch.slice(0, 9);
              listSearch = [data, ...listSearch];
            }
          } else {
            listSearch = listSearch.filter(obj => {
              return obj.symbol !== data.symbol;
            });
            listSearch = [data, ...listSearch];
          }
          newSetting['order_history'] = listSearch;
          const urlPut = api.getUrlUserSettingByUserId(userId, 'put');
          api.putData(urlPut, { data: newSetting }).then(data => {
            logDevice('info', 'save symbol search to order history success')
          }).catch(error => {
            logDevice('info', 'cannot save code search to order history')
          })
          return {
            ...state,
            listHistory: listSearch
          }
        }
      })
      return state;
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        volume: 0,
        // exchange: action.payload ? 'ASX:TM' : 'US Market',
        duration: 'Good Till Cancelled',
        limitPrice: 0,
        stopPrice: 0,
        triggerType: 'Percent',
        trailingPercent: 0,
        trailingStopPrice: 0,
        trailingAmount: 0
        // orderType: action.payload ? 'MARKET TO LIMIT' : 'MARKET'
      }
    default:
      return state;
  }
}
