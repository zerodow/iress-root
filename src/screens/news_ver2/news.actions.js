import firebase from '../../firebase';
import { dataStorage, func } from '../../storage';
import { logAndReport, getUniqueList, logDevice, getRelatedSymbol, getSymbolInfoApi } from '../../lib/base/functionUtil';
import filterType from '../../constants/filter_type';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';
import * as Util from '../../util'
import * as NewsBusiness from '../../streaming/news'
import * as Business from '../../business'
import Enum from '../../enum'
import * as Controller from '../../memory/controller'
import * as Emitter from '@lib/vietnam-emitter'
import * as manageSymbolRelated from '../../manage/manageRelatedSymbol'

const { TAB_NEWS } = Enum

let userId = null;
var perf = null;
export function loadNewsData(newType, filterTypeNew = Enum.FILTER_TYPE_NEWS.ALL, pageID, pageSize, isLoadMore, loading = false, isChangeTab, symbol, duration = { type: 'week', from: '', to: '' }) {
    return dispatch => {
        try {
            if (!duration.from || !duration.to) {
                const today = new Date().getTime();
                const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000;
                duration.from = oneWeekAgo;
                duration.to = today;
            }
            const isOnWatchlist = newType === Enum.TYPE_NEWS.RELATED
            loading && dispatch(loadNewsDataRequest(isOnWatchlist, isLoadMore));
            logDevice('info', `LOAD NEWS WITH TYPE = ${filterTypeNew}`)
            getData(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration);
        } catch (error) {
            logDevice('info', `load News data exception: ${error}`);
        }
    }
}

export function getData(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration) {
    const isOnWatchlist = newType === Enum.TYPE_NEWS.RELATED
    if (isOnWatchlist) {
        getRelatedNews(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration)
    } else {
        getEverythingNews(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration)
    }
}
async function analysSymbol() {
    const url = api.getRelatedSymbolUrl()
    await api.requestData(url)
        .then(res => {
            console.log('----------update Data analys symbol success-----------');
            if (res && res.length) {
                dataStorage.dicRelatedSymbol = res
            } else {
                dataStorage.dicRelatedSymbol = []
            }
        })
        .catch(err => {
            dataStorage.dicRelatedSymbol = [];
        })
}
function getStringQuerryFromDataStorage(symbol) {
    let stringQuery = '';
    const dicRelated = dataStorage.dicRelatedSymbol;
    if (symbol) {
        const checkRelated = dicRelated.includes(symbol)
        if (checkRelated) {
            const encodeSymbol = Util.encodeSymbol(symbol)
            stringQuery += `${encodeSymbol}`
            return stringQuery;
        } else {
            return null
        }
    } else {
        if (dicRelated.length) {
            dicRelated.map(symbol => {
                const encodeSymbol = Util.encodeSymbol(symbol)
                stringQuery += `${encodeSymbol},`
            })
        }
        if (stringQuery) {
            stringQuery = stringQuery.replace(/.$/, '');
        }
        return stringQuery;
    }
}
function getRelatedSymbolFromDic(isLoadMore, cb, isChangeTab, symbol, duration) {
    if (!isLoadMore && !isChangeTab && !symbol) {
        analysSymbol()
            .then(() => {
                // // const dicRelated = manageSymbolRelated.getDicSymbolRelated();
                const stringQuery = getStringQuerryFromDataStorage()
                console.log('----------handle string querry news firtTime-----------', stringQuery);
                cb && cb(stringQuery, isLoadMore, isChangeTab, duration);
            })
            .catch(error => console.log('error at getRelatedSymbolfromDic'));
    } else {
        const stringQuery = getStringQuerryFromDataStorage(symbol)
        console.log('----------handle string querry news LoadMore-----------', stringQuery);
        cb && cb(stringQuery, isLoadMore, isChangeTab, duration);
    }
}

function renderNoneRelatedNews(dispatch, filterTypeNew, pageID, isLoadMore) {
    // C2R update number unread on menu
    if (filterTypeNew === filterType.ALL) {
        const channelMenu = Enum.CHANNEL_COUNT.MENU_NEWS
        NewsBusiness.updateNumberNewsUnread(channelMenu, 0)
    }
    dispatch(newsOnWatchlistResponse([], filterTypeNew, pageID, isLoadMore))
}

function renderNoneEverythingNews(dispatch, filterTypeNew, pageID, isLoadMore) {
    dispatch(newsResponse([], filterTypeNew, pageID, isLoadMore));
}

function getFromDateToDate() {
    // News truyền thêm from to còn không thì lấy news trong ngày -> to = thời điểm hiện tại - from = lùi về 0:00 7h ngày trước VD: from = 0h00 1/8 -> 7/8
    const to = new Date().getTime();
    const from = Util.getStartPreviousDay(to, 6)
    return {
        from,
        to
    }
}

function getRelatedNews(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration) {
    let urlNewsInQuery = '';
    const cb = (stringQuery, isLoadMore, isChangeTab, duration) => {
        if (!stringQuery) {
            return renderNoneRelatedNews(dispatch, filterTypeNew, pageID, isLoadMore)
        }
        urlNewsInQuery = api.getNewsUrl(newType, filterTypeNew, stringQuery, pageID, pageSize);
        if (duration.type === 'custom') {
            urlNewsInQuery = `${urlNewsInQuery}&fromdate=${duration.from}&todate=${duration.to}`
        } else {
            urlNewsInQuery = `${urlNewsInQuery}&duration=${duration.type}`
        }
        logDevice('info', `LOAD NEWS ONWATCHLIST URL: ${urlNewsInQuery}`)
        let urlNewsInday = api.getNewsInday(filterTypeNew, stringQuery)
        if (!isLoadMore && !isChangeTab && Controller.getLoginStatus()) {
            // Unsub news realtime
            NewsBusiness.unSubNewByScreen('news', TAB_NEWS.ALL)
            NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED)
            // Sub news realtime
            const listSymbolObject = Util.getListSymbolObject(stringQuery);
            const ID_FORM = Util.getRandomKey();
            // Set dic IDFORM nad listSymbolObject by name
            func.setDicIDForm('news', ID_FORM)
            func.setDicListSymbolObject('news', listSymbolObject)
            NewsBusiness.sub(TAB_NEWS.RELATED, listSymbolObject, ID_FORM, () => {
            });
        }
        getDataRelatedNews(dispatch, urlNewsInQuery, urlNewsInday, filterTypeNew, pageID, pageSize, isLoadMore, stringQuery)
    }
    getRelatedSymbolFromDic(isLoadMore, cb, isChangeTab, symbol, duration)
}

function getRelatedNewsInday(url) {
    return new Promise(resolve => {
        api.requestData(url).then(data => {
            if (data) {
                if (data.errorCode) {
                    resolve({})
                } else {
                    let res = data || {};
                    resolve(res)
                }
            } else {
                resolve({})
            }
        })
    })
}

function getRelatedNewsInquery(url) {
    return new Promise(resolve => {
        api.requestData(url).then(data => {
            if (data) {
                if (data.errorCode) {
                    resolve({})
                } else {
                    let res = data || {};
                    resolve(res)
                }
            } else {
                resolve({})
            }
        })
    })
}

function getSymbolInfoAllNew(data) {
    return new Promise(resolve => {
        try {
            let stringQuery = ''
            for (let i = 0; i < data.length; i++) {
                const symbol = data[i].symbol;
                if (!dataStorage.symbolEquity[symbol]) {
                    stringQuery += `${symbol},`;
                }
            }
            if (stringQuery) {
                stringQuery = stringQuery.replace(/.$/, '');
            }
            getSymbolInfoApi(stringQuery, resolve)
        } catch (error) {
            logDevice('error', `getSymbolInfoAllNew exception: ${error}`)
            resolve()
        }
    })
}

function getSymbolInfo(stringQuery) {
    return new Promise(resolve => {
        getSymbolInfoApi(stringQuery, resolve)
    })
}

function getDataRelatedNews(dispatch, urlNewsInQuery, urlNewsInday, filterTypeNew, pageID, pageSize, isLoadMore, stringQuery) {
    try {
        perf = new Perf(performanceEnum.load_data_news);
        perf && perf.start();

        const listPromise = [
            getRelatedNewsInday(urlNewsInday),
            getRelatedNewsInquery(urlNewsInQuery),
            getSymbolInfo(stringQuery)
        ]

        Promise.all(listPromise)
            .then(response => {
                const newsInday = response[0] || []
                const newsInquery = response[1] || []
                const data = { ...newsInday, ...newsInquery }

                perf && perf.stop();
                logDevice('info', `GET DATA RELATED NEWS RESPONSE: ${data ? JSON.stringify(data) : 'DATA IS NULL'}`)

                const res = data.data || [];
                const listNewsInday = data.data_inday || []
                const listNewsReaded = data.data_readed || []
                const totalNewsUnread = data.total_count_unread || 0

                Util.updateDicNewsInday(listNewsInday)
                Util.updateDicNewsReaded(listNewsReaded)

                const channel = Enum.CHANNEL_COUNT.TAB_RELATED_NEWS
                NewsBusiness.updateNumberNewsUnread(channel, totalNewsUnread)

                // C2R update number unread on menu
                if (filterTypeNew === filterType.ALL) {
                    const channelMenu = Enum.CHANNEL_COUNT.MENU_NEWS
                    NewsBusiness.updateNumberNewsUnread(channelMenu, totalNewsUnread)
                }

                dispatch(newsOnWatchlistResponse(res, filterTypeNew, pageID, isLoadMore));
                logDevice('info', `GET DATA ONWATCHLIST NEWS RESPONSE: ${res ? JSON.stringify(res) : 'NULL'}`)
            })
            .catch(err => {
                console.log(err)
            })
    } catch (error) {
        logDevice('info', `get data News exception: ${error}`);
        return renderNoneRelatedNews(dispatch, filterTypeNew, pageSize, isLoadMore)
    }
}

function getEverythingNews(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration) {
    let url = '';
    const stringQuery = ''
    // News truyền thêm from to còn không thì lấy news trong ngày -> to = thời điểm hiện tại - from = lùi về 0:00 7h ngày trước VD: from = 0h00 1/8 -> 7/8
    url = api.getNewsUrl(newType, filterTypeNew, stringQuery, pageID, pageSize, symbol);
    if (duration.type === 'custom') {
        url = `${url}&fromdate=${duration.from}&todate=${duration.to}`
    } else {
        url = `${url}&duration=${duration.type}`
    }
    logDevice('info', `LOAD NEWS EVERYTHING URL: ${url}`)
    if (!isLoadMore && !isChangeTab && Controller.getLoginStatus()) {
        // Unsub news realtime
        NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED)
        NewsBusiness.unSubNewByScreen('news', TAB_NEWS.ALL)
        // Sub news realtime
        const ID_FORM = Util.getRandomKey();
        NewsBusiness.sub(TAB_NEWS.ALL, [], ID_FORM, () => {
        });
    }
    getDataEverythingNews(dispatch, url, filterTypeNew, pageID, pageSize, isLoadMore)
}

function getDataEverythingNews(dispatch, url, filterTypeNew, pageID, pageSize, isLoadMore) {
    try {
        perf = new Perf(performanceEnum.load_data_news);
        perf && perf.start();
        api.requestData(url).then(data => {
            if (data && data.errorCode) {
                return renderNoneEverythingNews(dispatch, filterTypeNew, pageID, isLoadMore)
            }

            let res = data.data || [];
            getSymbolInfoAllNew(res)
                .then(() => {
                    perf && perf.stop();
                    logDevice('info', `GET DATA EVERYTHING NEWS RESPONSE: ${res ? JSON.stringify(res) : 'NULL'}`)
                    return dispatch(newsResponse(res, filterTypeNew, pageID, isLoadMore));
                })
                .catch(err => {
                    logDevice('error', `getSymbolInfoAllNew exception: ${err}`)
                    return renderNoneEverythingNews(dispatch, filterTypeNew, pageID, isLoadMore)
                })
        }).catch(error => {
            logDevice('error', `get data News exception: ${error}`);
            return renderNoneEverythingNews(dispatch, filterTypeNew, pageID, isLoadMore)
        })
    } catch (error) {
        logDevice('error', `get data News exception: ${error}`);
        return renderNoneEverythingNews(dispatch, filterTypeNew, pageID, isLoadMore)
    }
}

export function setNewsStatus(data) {
    return {
        type: 'SET_NEWS_STATUS',
        payload: data
    };
}

export function newsOnWatchlistResponse(data, filterTypeNew, relatedPageID, isLoadMore) {
    let obj = {};
    obj.data = data;
    obj.type = filterTypeNew;
    return {
        type: 'NEWS_ON_WATCHLIST_RESPONSE',
        payload: obj,
        relatedPageID,
        isLoadMore
    };
}

export function newsResponse(data, filterTypeNew, everythingPageID, isLoadMore) {
    let obj = {};
    obj.data = data;
    obj.type = filterTypeNew;
    return {
        type: 'NEWS_RESPONSE',
        payload: obj,
        everythingPageID,
        isLoadMore
    };
}
export function resetTopNew(isOnWatchlist) {
    return {
        type: 'NEWS_RESET_TOP',
        isOnWatchlist
    }
}

export function updateNotiStatus(payload) {
    return {
        type: 'NEWS_UPDATE_NOTI_STATUS',
        payload
    }
}

export function resetNotiNews() {
    return {
        type: 'NEWS_RESET_NOTI'
    }
}

export function setNewsType(data, typeNew) {
    return {
        type: 'NEWS_SET_NEWS_TYPE',
        payload: data,
        typeNew
    };
}

export function loadNewsDataRequest(isOnWatchlist, isLoadMore) {
    return {
        type: 'NEWS_LOAD_NEWS_DATA_REQUEST',
        payload: isOnWatchlist,
        isLoadMore
    };
}

export function resetLoadingNews() {
    return {
        type: 'NEWS_RESET_LOADING_NEWS'
    };
}

export function newsSearchResponse(data, textSearch) {
    return {
        type: 'NEWS_SEARCH_RESPONSE',
        payload: data,
        textSearch
    };
}

export function searchRequest() {
    return {
        type: 'NEWS_SEARCH_REQUEST'
    };
}

export function stopLoad(typeNew) {
    return {
        type: 'NEWS_STOP_LOAD',
        typeNew
    };
}

export function searchNews(filterNewType, textSearch) {
    return dispatch => {
        let url = api.getNewsSearchUrl(filterNewType, textSearch)
        if (textSearch !== '') {
            // News truyền thêm from to còn không thì lấy news trong ngày -> to = thời điểm hiện tại - from = lùi về 0:00 7h ngày trước VD: from = 0h00 1/8 -> 7/8
            url = `${url}&duration=year`

            getDataSearch(url, dispatch, textSearch);
        } else {
            dispatch(newsSearchResponse([], textSearch))
        }
    }
}

export function getDataSearch(url, dispatch, textSearch) {
    api.requestData(url).then(data => {
        logDevice('info', `search news api url: ${url}`)
        let res = data.data || []
        if (res.errorCode) {
            dispatch(newsSearchResponse([], textSearch));
        } else {
            logDevice('info', `search news data: ${data}`)
            dispatch(newsSearchResponse(res, textSearch));
        }
    }).catch(error => {
        console.log('search news api failed: ', error);
        logDevice('info', `search news api failed: ${error}`)
        dispatch(newsSearchResponse([], textSearch));
    })
}

export function setFilter(relatedFilterType, everythingFilterType) {
    return {
        type: 'NEWS_SET_FILTER',
        relatedFilterType,
        everythingFilterType
    }
}

export function mergeNewsRealtime(realtimeData, typeNew) {
    return {
        type: typeNew === TAB_NEWS.ALL ? 'MERGE_NEWS_REALTIME' : 'MERGE_RELATED_NEWS_REALTIME',
        realtimeData
    }
}

export function setLoading(isLoading) {
    return {
        type: 'NEWS_SET_LOADING',
        payload: isLoading
    }
}
