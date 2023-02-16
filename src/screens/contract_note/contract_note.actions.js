import { dataStorage, func } from '../../storage';
import { logAndReport, getUniqueList, logDevice, getSymbolInfoApi } from '../../lib/base/functionUtil';
import * as api from '../../api';
import * as DateTime from '../../lib/base/dateTime';
import * as translate from '../../../src/invert_translate';
import * as Controller from '../../../src/memory/controller'

let perf = null;

export function loadCnotesData(duration, pageSize, pageId, isLoadMore = false, getDataComplete, customDuration = null, symbol = '', isRefresh = false) {
    return dispatch => {
        try {
            let url
            const location = Controller.getLocation().location
            getDataComplete && getDataComplete(true);
            // loading && dispatch(loadCnoteDataRequest(isLoadMore));
            const accountId = dataStorage.accountId;
            if (!accountId) {
                return dispatch(cnotesResponse([], getDataComplete));
            }
            if (isLoadMore) {
                dispatch(setIsLoadMore(isLoadMore))
            } else {
                dispatch(loadCnoteDataRequest(isRefresh))
            }
            if (!accountId) {
                return dispatch(cnotesResponse([], getDataComplete, false, isRefresh));
            }
            if (duration === 'Custom') {
                try {
                    const fromDateUTC = DateTime.convertToUtcDateByTimeStamp({ timeStamp: customDuration.fromDate, startDay: true, location })
                    const toDateUTC = DateTime.convertToUtcDateByTimeStamp({ timeStamp: customDuration.toDate, startDay: false, location })
                    logDevice('info', `CUSTOM DURATION CONTRACT NOTES fromDate: ${fromDateUTC} toDate: ${toDateUTC}`)
                    url = api.getCnoteUrlCustom(accountId, symbol, fromDateUTC, toDateUTC, pageSize, pageId)
                } catch (error) {
                    console.log(error)
                }
            } else {
                const timeStamp = new Date().getTime()
                const timeStampByLocation = DateTime.getTimeStampEndDayByLocation(timeStamp, location)
                const durationTranslate = translate.getKeyTranslate(duration).toLowerCase();
                if (durationTranslate === 'alltypes' || durationTranslate === 'all') {
                    url = api.getCnoteUrl(accountId, symbol, 'all', pageSize, pageId)
                } else {
                    const objectDuration = DateTime.convertToUtcDateByTimeStampAndDuration({ timeStamp: timeStampByLocation, location, duration: durationTranslate })
                    url = api.getCnoteUrlCustom(accountId, symbol, objectDuration.fromDate, objectDuration.toDate, pageSize, pageId)
                }
            }
            api.requestData(url, null, null, null).then(data => {
                logDevice('info', `GET DATA CONTRACT NOTE RESPONSE: ${data ? JSON.stringify(data) : 'DATA IS NULL'}`);
                if (data.errorCode) {
                    logDevice('info', `DATA IS NULL`);
                    return dispatch(cnotesResponse([], getDataComplete));
                } else {
                    let res = data.data || [];
                    if (res.length) {
                        res = res.sort(function (a, b) {
                            return b.updated - a.updated;
                        });
                        let symbolQuery = '';
                        const encodeSplash = encodeURIComponent('/');
                        const encodeHash = encodeURIComponent('#');
                        for (let index = 0; index < res.length; index++) {
                            const element = res[index];
                            let symbolOrigin = element.symbol;
                            let symbol = symbolOrigin.replace(/\//g, encodeSplash); // replace / -> %2F
                            symbol = symbol.replace(/#/g, encodeHash); // replace / -> %2F
                            // query get multi symbol
                            if (!dataStorage.symbolEquity[symbol]) {
                                symbolQuery += symbol + ',';
                            }
                        }
                        if (symbolQuery) {
                            symbolQuery = symbolQuery.replace(/.$/, '')
                        }
                        getSymbolInfoApi(symbolQuery, () => {
                            dispatch(cnotesResponse(res, getDataComplete, false, isRefresh));
                        });
                    } else {
                        logDevice('info', `DATA IS NULL`);
                        return dispatch(cnotesResponse([], getDataComplete, false, isRefresh));
                    }
                    perf && perf.stop();
                    logDevice('info', `GET DATA CNOTE RESPONSE: ${res ? JSON.stringify(res) : 'NULL'}`)
                }
            }).catch(error => {
                logDevice('info', `get data Contract note exception: ${error}`);
                return dispatch(cnotesResponse([], getDataComplete, false, isRefresh));
            })
        } catch (error) {
            dispatch(cnotesResponse([], getDataComplete, false, isRefresh))
            logDevice('info', `load Contract note data exception: ${error}`);
        }
    }
}

export function setNewsStatus(data) {
    return {
        type: 'SET_CNOTES_STATUS',
        payload: data
    };
}

export function cnotesResponse(data, getDataComplete, isLoading = false, isRefresh = false) {
    getDataComplete && getDataComplete();
    return {
        type: 'CNOTES_RESPONSE',
        data,
        isLoading,
        isRefresh
    };
}

export function resetContractNote() {
    return {
        type: 'CNOTES_RESET'
    }
}

export function resetContractNoteAll() {
    return {
        type: 'CNOTES_RESET_ALL'
    }
}

export function updateDuration(duration) {
    return {
        type: 'CNOTES_UPDATE_DURATION',
        duration
    }
}

export function updateNotiStatus(payload) {
    return {
        type: 'CNOTES_UPDATE_NOTI_STATUS',
        payload
    }
}

export function resetNotiNews() {
    return {
        type: 'CNOTES_RESET_NOTI'
    }
}

export function setNewsType(data, typeNew) {
    return {
        type: 'CNOTES_SET_CNOTES_TYPE',
        payload: data,
        typeNew
    };
}

export function loadCnoteDataRequest(isRefresh) {
    return {
        type: 'CNOTES_LOAD_CNOTES_DATA_REQUEST',
        payload: isRefresh
    };
}

export function cnoteSearchResponse(data) {
    return {
        type: 'CNOTES_SEARCH_RESPONSE',
        payload: data
    };
}

export function searchRequest(isRefresh) {
    return {
        type: 'CNOTES_SEARCH_REQUEST',
        payload: isRefresh
    };
}

export function stopLoad(typeNew) {
    return {
        type: 'CNOTES_STOP_LOAD',
        typeNew
    };
}

export function setCustomDuration(customDuration) {
    return {
        type: 'CNOTS_SET_CUSTOM_DURATION',
        payload: customDuration
    }
}

export function searchCnotes(accountId, duration, textSearch, isRefresh) {
    return dispatch => {
        let url = api.getCnoteSearchUrl(accountId, duration, textSearch);
        if (textSearch !== '') {
            getDataSearch(url, dispatch, isRefresh);
        } else {
            dispatch(cnoteSearchResponse([]))
        }
    }
}

export function getDataSearch(url, dispatch, isRefresh) {
    dispatch(searchRequest(isRefresh))
    api.requestData(url, null, null, null, 1500).then(data => {
        logDevice('info', `search contract note api url: ${url}`)
        let res = [];
        let responce = data && data.data
        if (responce && responce.length) {
            logDevice('info', `search contract note data: ${responce}`)
            res = responce.sort(function (a, b) {
                return b.updated - a.updated;
            });
            dispatch(cnoteSearchResponse(res));
        } else {
            dispatch(cnoteSearchResponse([]));
        }
    }).catch(error => {
        console.log('search contract note api failed: ', error);
        logDevice('info', `search contract note api failed: ${error}`)
        dispatch(cnoteSearchResponse([]));
    })
}

export function setFilter(cnoteFilterType) {
    return {
        type: 'CNOTES_SET_FILTER',
        cnoteFilterType
    }
}

export function setIsLoadMore(isLoadMore) {
    return {
        type: 'CNOTE_LOAD_MORE',
        isLoadMore
    }
}

export function resetDataAfterChangeDuration(payload) {
    return {
        type: 'CNOTE_RESET_DATA_AFTER_CHANGE_DURATION',
        payload
    }
}
