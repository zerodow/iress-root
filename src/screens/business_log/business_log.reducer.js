
import initialState from '../../reducers/initialState';
import { getUniqueList, dateDistance } from '../../lib/base/functionUtil';
import { dataStorage, func } from '../../storage';
import ENUM from '../../enum'

let top1 = null;
export const bLog = (state = initialState.bLog, action) => {
    switch (action.type) {
        case 'BUSINESS_LOG_RESPONSE':
            let listData = [];
            listData = [...state.listData, ...action.data]
            return {
                ...state,
                isLoading: false,
                isLoadMore: false,
                listData
            }
        case 'BUSINESS_LOG_RESET_LOADING':
            return {
                ...state,
                isLoading: true
            };
        case 'BUSINESS_LOG_RESET':
            return {
                ...state,
                listData: []
            }
        case 'BUSINESS_LOG_RESET_ALL':
            return {
                ...state,
                listData: [],
                duration: ENUM.LIST_FILTER_TIME.week,
                action: 'all'
            }
        case 'BUSINESS_LOG_UPDATE_DURATION':
            return {
                ...state,
                duration: action.duration
            }
        case 'BUSINESS_LOG_UPDATE_ACTION':
            return {
                ...state,
                action: action.payload
            }
        case 'BUSINESS_LOG_SEARCH_REQUEST':
            return {
                ...state,
                isSearchLoading: true
            };
        case 'BUSINESS_LOG_SEARCH_RESPONSE':
            let listData1 = action.payload || [];
            return {
                ...state,
                listDataSearch: listData1,
                isSearchLoading: false
            };
        case 'BUSINESS_LOG_LOAD_DATA_REQUEST':
            return {
                ...state,
                isLoading: true
            }
        case 'BUSINESS_LOG_LOAD_MORE':
            return {
                ...state,
                isLoadMore: action.isLoadMore
            }
        case 'BUSINESS_LOG_UPDATE_CUSTOM_DURATION':
            return {
                ...state,
                customDuration: action.customDuration
            }
        default:
            return state
    }
}
