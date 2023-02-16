
import initialState from '../../reducers/initialState';
import { getUniqueList, dateDistance } from '../../lib/base/functionUtil';
import { dataStorage, func } from '../../storage';
import ENUM from '../../enum'

let top1 = null;
export const cnotes = (state = initialState.cnotes, action) => {
    switch (action.type) {
        case 'CNOTES_UPDATE_NOTI_STATUS':
            return {
                ...state,
                notiStatus: action.payload
            }
        case 'CNOTES_SET_FILTER':
            return {
                ...state,
                cnoteFilterType: action.cnoteFilterType
            }
        case 'CNOTES_RESET_NOTI':
            return {
                ...state,
                unread: 0,
                listUnread: [],
                readOverview: false,
                listNewsOnWatchlist: []
            }
        case 'CNOTES_RESPONSE':
            let listData = [];
            const oldData = [...state.listData]
            if (oldData.length >= 20) {
                const page = Math.floor(oldData.length / 20)
                oldData.length = page * 20
            } else if (oldData.length < 20) {
                oldData.length = 0
            }

            if (action.isRefresh) {
                listData = [...oldData, ...action.data]
            } else {
                listData = [...state.listData, ...action.data]
            }
            return {
                ...state,
                isLoading: action.isLoading,
                isLoadMore: false,
                isRefresh: false,
                listData
            }
        case 'CNOTES_RESET_LOADING':
            return {
                ...state,
                isLoading: true
            };
        case 'CNOTES_RESET':
            return {
                ...state,
                listData: [],
                isLoading: true
            }
        case 'CNOTES_RESET_ALL':
            return {
                ...state,
                listData: [],
                duration: ENUM.CNOTE_FILTER_TYPE.Week
            }
        case 'CNOTES_UPDATE_DURATION':
            return {
                ...state,
                duration: action.duration
            }
        case 'CNOTES_SEARCH_REQUEST':
            return {
                ...state,
                isLoading: true,
                isRefresh: action.payload
            };
        case 'CNOTES_SEARCH_RESPONSE':
            let listData1 = action.payload || [];
            return {
                ...state,
                listData: listData1,
                isLoading: false,
                isRefresh: false
            };
        case 'CNOTES_LOAD_CNOTES_DATA_REQUEST':
            return {
                ...state,
                isLoading: true,
                isRefresh: action.payload
            }
        case 'CNOTE_LOAD_MORE':
            return {
                ...state,
                isLoadMore: action.isLoadMore
            }
        case 'CNOTS_SET_CUSTOM_DURATION':
            return {
                ...state,
                customDuration: action.payload
            }
        case 'CNOTE_RESET_DATA_AFTER_CHANGE_DURATION':
            return {
                ...state,
                listData: [],
                isLoading: true,
                duration: action.payload && action.payload.duration,
                ...(action.payload && action.payload.customDuration ? { customDuration: action.payload.customDuration } : {})
            }
        default:
            return state
    }
}
