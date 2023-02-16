
import initialState from '../../reducers/initialState';
import { getUniqueList } from '../../lib/base/functionUtil';
import Enum from '~/enum'
const { TAB_NEWS } = Enum

export const news = (state = initialState.news, action) => {
    switch (action.type) {
        case 'NEWS_UPDATE_NOTI_STATUS':
            return {
                ...state,
                notiStatus: action.payload
            }
        case 'NEWS_SET_FILTER':
            return {
                ...state,
                relatedFilterType: action.relatedFilterType,
                everythingFilterType: action.everythingFilterType
            }
        case 'NEWS_RESET_NOTI':
            return {
                ...state,
                unread: 0,
                listUnread: [],
                readOverview: false,
                listNewsOnWatchlist: []
            }
        case 'NEWS_RESPONSE':
            let listData = [];
            let listDataMergeRealtime = []
            if (action.isLoadMore) {
                listData = [...state.listData, ...action.payload.data]
                listDataMergeRealtime = [...state.listDataMergeRealtime, ...action.payload.data]
            } else {
                listData = action.payload.data
            }
            let reduxState = {}
            if (action.isLoadMore) {
                reduxState = {
                    ...state,
                    isLoading: false,
                    isLoadMore: false,
                    listData,
                    listDataMergeRealtime,
                    everythingPageID: action.everythingPageID
                }
            } else {
                reduxState = {
                    ...state,
                    isLoading: false,
                    isLoadMore: false,
                    listData,
                    listDataMergeRealtime: listData,
                    everythingPageID: action.everythingPageID
                }
            }
            return reduxState
        case 'NEWS_RESET_LOADING_NEWS':
            return {
                ...state,
                isLoading: true
            };
        case 'NEWS_STOP_LOAD':
            if (action.typeNew === TAB_NEWS.RELATED) {
                return {
                    ...state,
                    isRelatedLoadMore: false
                };
            }
            return {
                ...state,
                isLoadMore: false
            };
        case 'NEWS_RESET_TOP':
            let rState = {
                ...state,
                everythingPageID: 1
            }
            if (action.isOnWatchlist) {
                rState = {
                    ...state,
                    relatedPageID: 1
                }
            }
            return rState;
        case 'NEWS_SEARCH_REQUEST':
            return {
                ...state,
                isSearchLoading: true
            };
        case 'NEWS_SEARCH_RESPONSE':
            let listData1 = action.payload || [];
            return {
                ...state,
                listDataSearch: listData1,
                isSearchLoading: false,
                textSearch: action.textSearch
            };
        case 'SET_NEWS_STATUS':
            return {
                ...state,
                unread: action.payload.unread,
                listUnread: action.payload.listUnread,
                readOverview: action.payload.readOverview
            };
        case 'NEWS_SET_NEWS_TYPE':
            if (action.typeNew === TAB_NEWS.RELATED) {
                return {
                    ...state,
                    relatedFilterType: action.payload
                };
            }
            return {
                ...state,
                everythingFilterType: action.payload
            };
        case 'NEWS_ON_WATCHLIST_RESPONSE':
            let listData2 = [];
            let listNewsMergeRealtimeOnWatchlist = [];
            let tmp = action.payload.data || [];
            let rdState = {}
            if (action.isLoadMore) {
                listData2 = [...state.listNewsOnWatchlist, ...tmp]
                listNewsMergeRealtimeOnWatchlist = [...state.listNewsMergeRealtimeOnWatchlist, ...tmp]
            } else {
                listData2 = tmp
            }
            if (action.isLoadMore) {
                rdState = {
                    ...state,
                    listNewsOnWatchlist: listData2,
                    listNewsMergeRealtimeOnWatchlist,
                    isLoadingOnWatchlist: false,
                    isRelatedLoadMore: false,
                    relatedPageID: action.relatedPageID
                }
            } else {
                rdState = {
                    ...state,
                    listNewsOnWatchlist: listData2,
                    listNewsMergeRealtimeOnWatchlist: listData2,
                    isLoadingOnWatchlist: false,
                    isRelatedLoadMore: false,
                    relatedPageID: action.relatedPageID
                }
            }
            return rdState;
        case 'MERGE_NEWS_REALTIME':
            const { realtimeData } = action
            const currentData = state.listData
            let newData = [...realtimeData, ...currentData]
            newData = getUniqueList(newData, 'news_id')
            return {
                ...state,
                listDataMergeRealtime: newData
            }
        case 'MERGE_RELATED_NEWS_REALTIME':
            const { allNewRealtimeData } = action
            const allCurrentData = state.listNewsOnWatchlist
            let allNewData = [...allNewRealtimeData, ...allCurrentData]
            allNewsData = getUniqueList(allNewData, 'news_id')
            return {
                ...state,
                listNewsMergeRealtimeOnWatchlist: allNewData
            }
        case 'NEWS_LOAD_NEWS_DATA_REQUEST':
            if (action.isLoadMore) {
                return {
                    ...state,
                    isLoadMore: action.isLoadMore,
                    isRelatedLoadMore: action.isLoadMore
                }
            }
            return {
                ...state,
                relatedPageID: 1,
                everythingPageID: 1,
                isLoadingOnWatchlist: action.payload,
                isLoading: action.payload ? true : (action.isLoadMore ? false : !action.payload),
                isLoadMore: action.isLoadMore,
                isRelatedLoadMore: action.isLoadMore
            };
        default:
            return state
    }
}
