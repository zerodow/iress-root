import firebase from '../../firebase';
import { dataStorage, func } from '../../storage';
import {
    logAndReport,
    getUniqueList,
    logDevice,
    getRelatedSymbol,
    getSymbolInfoApi,
    createTagNewsStringQuerry
} from '../../lib/base/functionUtil';
import filterType from '../../constants/filter_type';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';
import * as Util from '../../util'
import config from '~/config';
import * as NewsBusiness from '../../streaming/news'
import * as Business from '../../business'
import Enum from '../../enum'
import * as Controller from '../../memory/controller'
import * as Emitter from '@lib/vietnam-emitter'
import * as manageSymbolRelated from '../../manage/manageRelatedSymbol'
import * as newsControl from './controller'
import TIME_ZONE from '~/constants/time_zone'
import moment from 'moment'

const { FILTER_TYPE_NEWS, LOCATION, SUB_ENVIRONMENT } = Enum
const momentTimeZone = require('moment-timezone');

let userId = null;
var perf = null;
let isLoading = false;
const pageSize = 10;

export function loadRelatedNewsData({ urlNewsInQuery, urlNewsInday, cb }) {
    // Staging trỏ vào mac dinh no data
    if (config.environment === 'STAGING' && config.subEnvironment === SUB_ENVIRONMENT.EQUIX_DEMO) {
        const defaultData = {
            total_count: 0,
            total_pages: 0,
            current_page: 1,
            data: []
        }
        const currentTag = newsControl.getCurrentTab();
        return cb && cb(defaultData, currentTag)
    }
    const listPromise = [
        getRelatedNewsInday(urlNewsInday),
        getRelatedNewsInquery(urlNewsInQuery)
    ]

    Promise.all(listPromise)
        .then(response => {
            const newsInday = response[0] || []
            const newsInquery = response[1] || []
            const data = { ...newsInday, ...newsInquery }

            const res = data.data || [];
            const listNewsInday = data.data_inday || []
            const listNewsReaded = data.data_readed || []
            const totalNewsUnread = data.total_count_unread || 0

            Util.updateDicNewsInday(listNewsInday)
            Util.updateDicNewsReaded(listNewsReaded)

            const channel = Enum.CHANNEL_COUNT.TAB_RELATED_NEWS
            const channelMenu = Enum.CHANNEL_COUNT.MENU_NEWS
            newsControl.setTotalCountUnRead(totalNewsUnread)
            NewsBusiness.updateNumberNewsUnread(channel, totalNewsUnread)
            NewsBusiness.updateNumberNewsUnread(channelMenu, totalNewsUnread)
            // C2R update number unread on menu
            // if (filterTypeNew === filterType.ALL) {
            //     const channelMenu = Enum.CHANNEL_COUNT.MENU_NEWS
            //     NewsBusiness.updateNumberNewsUnread(channelMenu, totalNewsUnread)
            // }

            cb && cb(data, 'relatedNews')
        })
        .catch(err => {
            console.log('loadRelatedNewsData error', err)
            const defaultData = {
                total_count: 0,
                total_pages: 0,
                current_page: 1,
                data: []
            }
            const currentTag = newsControl.getCurrentTab();
            cb && cb(defaultData, currentTag)
        })
}

export function loadAllNewsData({ urlNewsInQuery, cb, currentTag }) {
    // Staging trỏ vào mac dinh no data
    if (config.environment === 'STAGING' && config.subEnvironment === SUB_ENVIRONMENT.EQUIX_DEMO) {
        return cb && cb({
            total_count: 0,
            total_pages: 0,
            current_page: 1,
            data: []
        }, currentTag)
    }
    getRelatedNewsInquery(urlNewsInQuery)
        .then(res => {
            const totalNewsUnread = newsControl.getTotalCountUnRead()
            const channel = Enum.CHANNEL_COUNT.TAB_RELATED_NEWS
            NewsBusiness.updateNumberNewsUnread(channel, totalNewsUnread)
            cb && cb(res, currentTag)
        })
        .catch(err => {
            cb && cb({
                total_count: 0,
                total_pages: 0,
                current_page: 1,
                data: []
            }, currentTag)
        })
}

export function loadNewsData(cb) {
    const currentTag = newsControl.getCurrentTab();
    try {
        const check = checkSymbolRelatedNews(cb);
        if (!check) return;
        const symbol = newsControl.getSymbolSearch();
        const stringQuery = getStringQuerryFromDataStorage(symbol)
        const tag = ''
        const urlNewsInQuery = createUrlNews();
        const urlNewsInday = api.getNewsInday(tag, stringQuery)
        if (currentTag === 'relatedNews') {
            return loadRelatedNewsData({
                urlNewsInQuery,
                urlNewsInday,
                cb,
                currentTag
            })
        }
        return loadAllNewsData({
            urlNewsInQuery,
            cb,
            currentTag
        })
    } catch (error) {
        cb && cb({
            total_count: 0,
            total_pages: 0,
            current_page: 1,
            data: []
        }, currentTag)
        console.log('error loadNews Data', error)
        logDevice('info', `load News data exception: ${error}`);
    }
}
export function setStateLoading(status) {
    isLoading = status
    return isLoading
}
export function getStateLoading() {
    return isLoading
}
export function checkSymbolRelatedNews(cb, symbol) {
    symbol = symbol || newsControl.getSymbolSearch();
    const currentTag = newsControl.getCurrentTab();
    const isLoadAnalys = dataStorage.isLoadAnalys;
    if (!isLoadAnalys) analysSymbol();
    const dicRelatedSymbol = dataStorage.dicRelatedSymbol
    if (currentTag === 'relatedNews') {
        if ((symbol && !dicRelatedSymbol.includes(symbol)) || !dicRelatedSymbol.length) {
            cb && cb({
                total_count: 0,
                total_pages: 0,
                current_page: 1,
                data: []
            }, currentTag)
            return false;
        }
    }
    return true;
}
export function loadUnreadNews(cb) {
    // return dispatch => {
    try {
        const url = createUrlNews();
        console.log('url ========> news is', url)
        cb && cb()
    } catch (error) {
        console.log('error loadNews Data', error)
        logDevice('info', `load News data exception: ${error}`);
    }
    // }
}

export function getFromToByDuration({ duration }) {
    const location = LOCATION.AU
    let distance = 0
    const eodAU = momentTimeZone.tz(new Date().getTime(), location).endOf('day').valueOf()
    const sodAU = momentTimeZone.tz(new Date().getTime(), location).startOf('day').valueOf()
    // const eodLocal = moment(new Date().getTime()).endOf('day').valueOf()
    // const sodLocal = moment(new Date().getTime()).startOf('day').valueOf()
    switch (duration) {
        case Enum.DURATION_NEWS.DAY:
            distance = 0
            break;
        case Enum.DURATION_NEWS.WEEK:
            distance = 6
            break;
        case Enum.DURATION_NEWS.MONTH:
            distance = 30
            break;
        case Enum.DURATION_NEWS.QUARTER:
            distance = 90
            break;
        case Enum.DURATION_NEWS.YEAR:
            distance = 364
            break;
        default:
            // All
            distance = 364
            break;
    }
    return {
        from: sodAU - (distance * 24 * 60 * 60 * 1000),
        to: eodAU
    }
}

export function createUrlNews() {
    let urlNewsInQuery = '';
    let urlBySymbol = '';
    let urlByTime = '';

    const duration = newsControl.getDuration();
    const tag = newsControl.getTagNews();
    const currentTag = newsControl.getCurrentTab()
    const symbol = newsControl.getSymbolSearch();
    const pageID = newsControl.getPageId();
    const stringTag = createTagNewsStringQuerry(Object.keys(tag));
    const urlByPage = api.getNewsUrlByPageSize(pageID, pageSize);
    const urlByTag = api.getNewsUrlByTag(stringTag);

    urlBySymbol = currentTag === 'relatedNews'
        ? getUrlStringQuerryFromDataStorage(symbol)
        : getStringQuerrySymbol(symbol)
    if (duration.type === 'custom') {
        urlByTime = `&fromdate=${duration.from}&todate=${duration.to}`
    } else {
        const { from, to } = getFromToByDuration({ duration: duration.type })
        urlByTime = `&fromdate=${from}&todate=${to}`
    }

    urlNewsInQuery = `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/news/inquery?${urlByPage}${urlByTag}${urlBySymbol}${urlByTime}`;
    return urlNewsInQuery;
}
// export function getData(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration) {
//     const isOnWatchlist = newType === Enum.TYPE_NEWS.RELATED
//     if (isOnWatchlist) {
//         getRelatedNews(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration)
//     } else {
//         getEverythingNews(dispatch, newType, filterTypeNew, pageID, pageSize, isLoadMore, isChangeTab, symbol, duration)
//     }
// }
async function analysSymbol(cb) {
    const url = api.getRelatedSymbolUrl()
    await api.requestData(url)
        .then(res => {
            console.log('----------update Data analys symbol success-----------');
            if (res && res.length) {
                dataStorage.dicRelatedSymbol = res
            } else {
                dataStorage.dicRelatedSymbol = []
            }
            cb && cb()
        })
        .catch(err => {
            dataStorage.dicRelatedSymbol = [];
            cb && cb([])
        })
}
function getUrlStringQuerryFromDataStorage(symbol) {
    let stringQuery = '';
    const dicRelated = dataStorage.dicRelatedSymbol;
    if (symbol) {
        const checkRelated = dicRelated.includes(symbol)
        if (checkRelated) {
            const encodeSymbol = Util.encodeSymbol(symbol)
            stringQuery += `${encodeSymbol}`
            return `&symbol=${stringQuery}`
        } else {
            return ''
        }
    } else {
        if (dicRelated.length) {
            dicRelated.map(symbol => {
                const encodeSymbol = Util.encodeSymbol(symbol)
                stringQuery += `${encodeSymbol},`
            })
        } else {
            return ''
        }
        if (stringQuery) {
            stringQuery = stringQuery.replace(/.$/, '');
        }
        return `&symbol=${stringQuery}`
    }
}
export function getStringQuerryFromDataStorage(symbol) {
    let stringQuery = '';
    const dicRelated = dataStorage.dicRelatedSymbol;
    if (symbol) {
        const checkRelated = dicRelated.includes(symbol)
        if (checkRelated) {
            const encodeSymbol = Util.encodeSymbol(symbol)
            stringQuery += `${encodeSymbol}`
            return stringQuery
        } else {
            return ''
        }
    } else {
        if (dicRelated.length) {
            dicRelated.map(symbol => {
                const encodeSymbol = Util.encodeSymbol(symbol)
                stringQuery += `${encodeSymbol},`
            })
        } else {
            return ''
        }
        if (stringQuery) {
            stringQuery = stringQuery.replace(/.$/, '');
        }
        return stringQuery
    }
}
function getStringQuerrySymbol(symbol) {
    let stringQuery = '';
    if (symbol) {
        const encodeSymbol = Util.encodeSymbol(symbol)
        stringQuery += `${encodeSymbol}`
        return `&symbol=${stringQuery}`
    }
    return ''
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

function getFromDateToDate() {
    // News truyền thêm from to còn không thì lấy news trong ngày -> to = thời điểm hiện tại - from = lùi về 0:00 7h ngày trước VD: from = 0h00 1/8 -> 7/8
    const to = new Date().getTime();
    const from = Util.getStartPreviousDay(to, 6)
    return {
        from,
        to
    }
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
    return new Promise((resolve, reject) => {
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
        }).catch(e => {
            reject()
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
