import { dataStorage, func } from '../../storage';
import {
    logAndReport, getUniqueList, logDevice, getSymbolInfoApi, getAccountInfoApi
} from '../../lib/base/functionUtil';
import * as api from '../../api';

let perf = null;

export function loadBusinessLogData(duration, action, pageSize, pageId, isLoadMore = false, getDataComplete, customDuration = null) {
    return dispatch => {
        try {
            let url
            getDataComplete && getDataComplete(true);
            if (isLoadMore) {
                dispatch(setIsLoadMore(isLoadMore))
            } else {
                dispatch(loadBusinessLogDataRequest())
            }
            if ((duration + '').toUpperCase() === 'CUSTOM') {
                url = api.getBusinessLogUrl(duration.toLowerCase(), action, pageSize, pageId, customDuration)
            } else {
                url = api.getBusinessLogUrl(duration.toLowerCase(), action, pageSize, pageId)
            }
            api.requestData(url).then(data => {
                if (!data) {
                    return dispatch(businessLogResponse([], getDataComplete));
                } else {
                    if (data && data.errorCode) {
                        logDevice('info', `ERROR CODE: ${data.errorCode}`);
                        return dispatch(businessLogResponse([], getDataComplete));
                    } else {
                        let res = data.data || [];
                        if (res.length) {
                            res = res.sort(function (a, b) {
                                return b.time - a.time;
                            });
                            let stringQuery = '';
                            for (let i = 0; i < res.length; i++) {
                                const symbol = res[i].symbol;
                                if (symbol && symbol !== '#' && !dataStorage.symbolEquity[symbol]) {
                                    stringQuery += symbol + ',';
                                }
                            }
                            if (stringQuery) {
                                stringQuery = stringQuery.replace(/.$/, '')
                            }

                            getSymbolInfoApi(stringQuery, () => {
                                dispatch(businessLogResponse(res, getDataComplete));
                            })
                        } else {
                            return dispatch(businessLogResponse([], getDataComplete));
                        }
                        perf && perf.stop();
                    }
                }
            }).catch(error => {
                logDevice('info', `get data Contract note exception: ${error}`);
                return dispatch(businessLogResponse([], getDataComplete));
            })
        } catch (error) {
            dispatch(businessLogResponse([], getDataComplete))
            logDevice('info', `load Contract note data exception: ${error}`);
        }
    }
}

export function businessLogResponse(data, getDataComplete) {
    getDataComplete && getDataComplete();
    return {
        type: 'BUSINESS_LOG_RESPONSE',
        data
    };
}

export function resetBusinessLog() {
    return {
        type: 'BUSINESS_LOG_RESET'
    }
}

export function resetBusinessLogAll() {
    return {
        type: 'BUSINESS_LOG_RESET_ALL'
    }
}

export function updateDuration(duration) {
    return {
        type: 'BUSINESS_LOG_UPDATE_DURATION',
        duration
    }
}

export function updateCustomDuration(customDuration) {
    return {
        type: 'BUSINESS_LOG_UPDATE_CUSTOM_DURATION',
        customDuration
    }
}

export function updateAction(payload) {
    return {
        type: 'BUSINESS_LOG_UPDATE_ACTION',
        payload
    }
}

export function loadBusinessLogDataRequest(isLoadMore) {
    return {
        type: 'BUSINESS_LOG_LOAD_DATA_REQUEST'
    };
}

export function businessLogSearchResponse(data) {
    return {
        type: 'BUSINESS_LOG_SEARCH_RESPONSE',
        payload: data
    };
}

export function searchRequest() {
    return {
        type: 'BUSINESS_LOG_SEARCH_REQUEST'
    };
}

export function searchBusinessLog(accountId, duration, textSearch) {
    return dispatch => {
        let url = api.getBusinessLogSearchUrl(accountId, duration, textSearch);
        if (textSearch !== '') {
            getDataSearch(url, dispatch, textSearch);
        } else {
            dispatch(businessLogSearchResponse([]))
        }
    }
}

export function getDataSearch(url, dispatch, textSearch) {
    api.requestData(url).then(data => {
        let res = [];
        if (!data) {
            logDevice('info', `DATA IS NULL`);
            return dispatch(businessLogSearchResponse(res));
        } else {
            if (data && data.errorCode) {
                logDevice('info', `ERROR: ${data.errorCode}`);
                return dispatch(businessLogSearchResponse(res));
            } else {
                logDevice('info', `search contract note api url: ${url}`)
                let responce = data.data
                if (responce && responce.length) {
                    logDevice('info', `search contract note data: ${responce}`)
                    res = responce.sort(function (a, b) {
                        return b.time - a.time;
                    });
                    let stringQuery = '';
                    for (let i = 0; i < res.length; i++) {
                        const symbol = res[i].symbol;
                        if (symbol && symbol !== '#' && !dataStorage.symbolEquity[symbol]) {
                            stringQuery += symbol + ',';
                        }
                    }
                    if (stringQuery) {
                        stringQuery = stringQuery.replace(/.$/, '')
                    }
                    getSymbolInfoApi(stringQuery, () => {
                        dispatch(businessLogSearchResponse(res));
                    })
                } else {
                    let res = []
                    dispatch(businessLogSearchResponse(res));
                }
            }
        }
    }).catch(error => {
        let res = []
        console.log('search contract note api failed: ', error);
        logDevice('info', `search contract note api failed: ${error}`)
        dispatch(businessLogSearchResponse(res));
    })
}

export function setIsLoadMore(isLoadMore) {
    return {
        type: 'BUSINESS_LOG_LOAD_MORE',
        isLoadMore
    }
}
