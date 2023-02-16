import * as Api from '../api';
import * as Emitter from '@lib/vietnam-emitter'
import * as StreamingBusiness from './streaming_business';
import * as Util from '../util';
import Enum from '../enum';
import Nchan from '../nchan.1';
import VietNamQueue from '@lib/vietnam-queue';
import { dataStorage, func } from '../storage'
import ScreenId from '~/constants/screen_id';
import * as newsControl from '~/screens/news_ver2/controller'
import {
    updateCountNewRealtime
} from '../../src/lib/base/functionUtil'
import * as WrapperContentController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_content_controller.js'
import * as NewsHeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'

const { DEFAULT_VAL, TAB_NEWS } = Enum;
let isConnected = true;
const nchanObj = {};
const nchanObjTemp = {};
const dicSub = {};
const dicData = {};
const dicSnapshot = {};
let listSymbolSub = [];
const listMsgBeforeSnapshot = [];
const listMsgLostConnect = [];
const HistoricalQueue = new VietNamQueue();
let intervalFakeAllNews = null
let intervalFakeRelatedNews = null

let randomNum = 0

const storeListSymbolSub = newListSymbolSub => {
    listSymbolSub = newListSymbolSub
}

const clearListSymbolSub = () => {
    listSymbolSub.length = 0
}

const getListSymbolSub = () => {
    return listSymbolSub
}

const sendItemChange = (type, item) => {
    // Realtime news
    const emitterName = StreamingBusiness.getChannelNews(type);
    Emitter.emit(emitterName, { ...item });
};

const processData = newData => {
    const symbol = newData.symbol;
    const source = newData.exchange || newData.source
    if (!symbol || !source) return;
    if (!isConnected || listMsgLostConnect.length > 0) {
        listMsgLostConnect.push(newData);
        return;
    }

    insertOrUpdateData(newData, sendItemChange, type = TAB_NEWS.RELATED);
};

const processDataAll = (newData, type) => {
    sendItemChange(type, newData)
};

const mergeMsgRealtimePrev = listData => {
    const dicRealtime = {};
    listData.map(newData => {
        if (!newData) return;

        const key = `${newData.exchange}##${newData.symbol}`;
        dicRealtime[key] = dicRealtime[key]
            ? {
                ...dicRealtime[key],
                ...newData
            }
            : newData;
    });
    Object.keys(dicRealtime).map(key => processData(dicRealtime[key]));
    listData.length = 0;
};

const onChangeNetwork = cnn => {
    isConnected = cnn;
    if (!isConnected) {
        listMsgLostConnect.length = 0;
        return;
    }
    const listSymbol = [];
    Object.keys(dicSub).map(exchange => {
        Object.keys(dicSub[exchange]).map(symbol => {
            listSymbol.push({ exchange, symbol });
        });
    });

    syncNewsStreaming(listSymbol)
        .then(() => {
            mergeMsgRealtimePrev(listMsgLostConnect);
        });
};

const connectNchan = (exchange, stringSymbol, type = TAB_NEWS.ALL) => {
    const vendorSelectedObj = NewsHeaderModel.getListVendorIdSelected()
    const listVendorCode = Object.keys(vendorSelectedObj)
    if (!listVendorCode || !listVendorCode.length) {
        return Promise.resolve()
    }
    return new Promise(resolve => {
        const newNchanObj = new Nchan({
            url: Api.getNewStreamingUrlIress(stringSymbol, type, listVendorCode),
            fnGetOption: StreamingBusiness.getOptionStream,
            onData: type === TAB_NEWS.ALL ? processDataAll : processData,
            timeout: 20000,
            onConnect: () => {
                nchanObj[exchange] = nchanObj[exchange] || [];
                nchanObj[exchange].push(newNchanObj);
                resolve();
            },
            onError: () => {
                resolve();
            },
            onChangeNetwork
        });
    });
};

const removeSymbolUnsub = (exchange, listSymbol) => {
    listSymbol.map(symbol => {
        try {
            // if (!dicSub || !dicSub[exchange] || !dicSub[exchange][symbol] || !dicSub[exchange][symbol]) return;

            // if (!Util.objHasKeys(dicSub[exchange][symbol])) delete dicSub[exchange][symbol];
            // if (!Util.objHasKeys(dicSub[exchange])) delete dicSub[exchange];

            if (dicData && dicData[exchange] && dicData[exchange][symbol]) {
                delete dicData[exchange][symbol];
                if (!Util.objHasKeys(dicData[exchange])) delete dicData[exchange];
            }

            if (dicSnapshot && dicSnapshot[exchange] && dicSnapshot[exchange][symbol]) {
                delete dicSnapshot[exchange][symbol];
                if (!Util.objHasKeys(dicSnapshot[exchange])) delete dicSnapshot[exchange];
            }
        } catch (error) {
            console.log(error);
        }
    });
};

const mergeDataWithRealtime = dataReq => {
    const symbol = dataReq.symbol;
    const exchange = dataReq.exchange;

    if (dataReq && symbol && exchange) {
        dicData[exchange] = dicData[exchange] || {};
        dicData[exchange][symbol] = dataReq;
    }
    return dataReq;
};

const syncDataHasNetwork = dataReq => {
    if (!dataReq || !dataReq.symbol || !dataReq.exchange) return dataReq;

    const symbol = dataReq.symbol;
    const exchange = dataReq.exchange;

    dicData[exchange] = dicData[exchange] || {};
    dicData[exchange][symbol] = dataReq;

    return dataReq;
};

const hasSnapshot = (symbol, exchange) => {
    return dicSnapshot[exchange] && dicSnapshot[exchange][symbol];
};

const getCurrentData = (symbol, exchange) => {
    return dicData[exchange] && dicData[exchange][symbol]
        ? { ...dicData[exchange][symbol] }
        : null;
};

const insertOrUpdateData = (newData, cb, type = TAB_NEWS.ALL) => {
    dicData[newData.exchange] = dicData[newData.exchange] || {};
    dicData[newData.exchange][newData.symbol] = dicData[newData.exchange][newData.symbol]
        ? {
            ...dicData[newData.exchange][newData.symbol],
            ...newData
        }
        : newData;
    cb && cb(type, dicData[newData.exchange][newData.symbol]);
};

const markSnapshot = listObjSymbol => {
    if (!Util.arrayHasItem(listObjSymbol)) return;
    listObjSymbol.map(item => {
        if (!item || !item.exchange || !item.symbol) return;
        dicSnapshot[item.exchange] = dicSnapshot[item.exchange] || {};
        dicSnapshot[item.exchange][item.symbol] = true;
    });
}

const getNewSnapshot = listObjSymbol => {
    return new Promise((resolve, reject) => {
        if (!Util.arrayHasItem(listObjSymbol)) return resolve([]);

        const dicExchange = {};
        listObjSymbol.map(item => {
            dicExchange[item.exchange] = dicExchange[item.exchange] || [];
            dicExchange[item.exchange].push(item.symbol);
        });

        const listPromise = [];
        Object.keys(dicExchange).map(exchange => {
            const listSymbolString = StreamingBusiness.getStringSymbol(dicExchange[exchange]);
            listSymbolString.map(strSymbol => {
                const url = Api.getLv1Snapshot(exchange, strSymbol);
                listPromise.push(
                    new Promise(resolve => {
                        Api.requestData(url)
                            .then(bodyData => resolve(bodyData || []))
                            .catch(() => resolve([]));
                    }));
            });
        });
        Promise.all(listPromise)
            .then(response => {
                const listPrice = [];
                response.map(result => {
                    listPrice.push(...result);
                });
                resolve(listPrice);
            })
            .catch(err => reject(err));
    });
};

const syncNewsStreaming = listObjSymbol => {
    return new Promise((resolve, reject) => {
        getNewSnapshot(listObjSymbol)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? bodyData.map(obj => syncDataHasNetwork(obj))
                    : [];
                resolve(mergeData);
            });
    });
};

const getNewStreaming = listObjSymbol => {
    return new Promise(resolve => {
        const listSymbolHasSnapshot = [];
        const listSymbolNotSnapshot = [];
        listObjSymbol.map(item => {
            hasSnapshot(item.symbol, item.exchange)
                ? listSymbolHasSnapshot.push(item)
                : listSymbolNotSnapshot.push(item);
        });

        getNewSnapshot(listSymbolNotSnapshot)
            .then(bodyData => {
                const mergeData = Util.arrayHasItem(bodyData)
                    ? bodyData.map(obj => mergeDataWithRealtime(obj))
                    : [];

                markSnapshot(bodyData);
                mergeMsgRealtimePrev(listMsgBeforeSnapshot);

                listSymbolHasSnapshot.map(item => {
                    if (!item || !item.symbol || !item.exchange) return;
                    mergeData.push(getCurrentData(item.symbol, item.exchange));
                });
                resolve([...mergeData]);
            });
    });
};

const subWithExchange = (exchange, listSymbol, type = TAB_NEWS.ALL) => {
    return new Promise(resolve => {
        const listSymbolString = StreamingBusiness.getStringSymbol(listSymbol);
        const listPromise = listSymbolString.map(str => connectNchan(exchange, str, type));
        Promise.all(listPromise).then(() => {
            nchanObjTemp[exchange] && nchanObjTemp[exchange].map(item => {
                item && item.close && item.close();
            });
            nchanObjTemp[exchange] = [];
            resolve();
        });
    });
};

const unsubWithExchange = (exchange, listSymbol, type = TAB_NEWS.ALL) => {
    return new Promise(resolve => {
        removeSymbolUnsub(exchange, listSymbol);
        nchanObjTemp[exchange] && nchanObjTemp[exchange].map(item => {
            item && item.close && item.close();
        });
        nchanObjTemp[exchange] = [];
        return resolve();
    });
};

export function getNew(listObjSymbol, forceSub) {
    return forceSub
        ? getNewStreaming(listObjSymbol)
        : getNewSnapshot(listObjSymbol);
};

function subQueue({ type, listSymbolObj, onOpen }) {
    return new Promise(resolve => {
        if (type === TAB_NEWS.ALL) {
            connectNchan('news_all', '', type)
                .then(() => {
                    resolve()
                    onOpen()
                })
        } else {
            const dicExchange = {};
            const listPromise = [];

            listSymbolObj.map(obj => {
                const exchange = obj.exchange;
                const symbol = obj.symbol;
                if (!dicExchange[exchange]) dicExchange[exchange] = [];
                dicExchange[exchange].push(symbol);
            });

            Object.keys(dicExchange).map(exchange => {
                nchanObjTemp[exchange] = nchanObj[exchange] || [];
                nchanObj[exchange] = [];
                listPromise.push(subWithExchange(exchange, dicExchange[exchange], type));
            });

            Promise.all(listPromise).then(() => {
                // Sub thành công lưu lại listSymbolSub
                storeListSymbolSub(listSymbolObj)
                resolve();
                onOpen();
            });
        }
    });
};

function unsubQueue({ type, listSymbolObj, onOpen }) {
    return new Promise(resolve => {
        if (type === TAB_NEWS.ALL) {
            if (nchanObj && nchanObj['news_all']) {
                nchanObj['news_all'].map(item => {
                    item && item.close && item.close();
                });
                nchanObj['news_all'] = [];
                resolve();
                onOpen()
            } else {
                resolve()
                onOpen();
            }
        } else {
            const dicExchange = {};
            const listPromise = [];
            listSymbolObj.map(obj => {
                if (!obj || !obj.exchange || !obj.symbol) return;

                const exchange = obj.exchange;
                const symbol = obj.symbol;
                dicExchange[exchange] = dicExchange[exchange] || [];
                dicExchange[exchange].push(symbol);
            });

            Object.keys(dicExchange).map(exchange => {
                nchanObjTemp[exchange] = nchanObj[exchange] || [];
                nchanObj[exchange] = [];
                listPromise.push(unsubWithExchange(exchange, dicExchange[exchange], type));
            });

            Promise.all(listPromise).then(() => {
                resolve();
                onOpen();
            });
        }
    });
};

export function sub(type = TAB_NEWS.ALL, listSymbolObj = [], onOpen = DEFAULT_VAL.FUNC) {
    HistoricalQueue.push(subQueue, { listSymbolObj, onOpen, type });
};

export function unsub(type = TAB_NEWS.ALL, listSymbolObj = [], onOpen = DEFAULT_VAL.FUNC) {
    HistoricalQueue.push(unsubQueue, { listSymbolObj, onOpen, type });
};

export function unSubNewByScreen(name, type = TAB_NEWS.ALL, onOpen = DEFAULT_VAL.FUNC) {
    let listSymbolObject = []
    if (type === TAB_NEWS.RELATED) {
        listSymbolObject = getListSymbolSub()
    }
    unSubNewSymbol(listSymbolObject, type, onOpen);
}

export function unSubNewSymbol(listSymbolObj, type = TAB_NEWS.ALL, onOpen) {
    unsub(type, listSymbolObj, onOpen);
}

export function getChannelLiveNews() {
    return `live_news`
}

export function getChannelUserInfoNew() {
    return `user_info_new`
}

export function getChannelNewsUnread(channel) {
    return `news_unread##${channel}`
}

export function getChannelNewsReaded(newID) {
    return `news_readed##${newID}`
}

export function getChannelAnnouncementIcon(symbol) {
    return `announcement_icon##${symbol}`
}

export function updateNewsReadedByNewID(newID) {
    const event = getChannelNewsReaded(newID)
    const readed = true
    Emitter.emit(event, readed)
}

export function updateNumberNewsUnread(channel, totalNewsUnread = 0) {
    newsControl.setTotalCountUnRead(totalNewsUnread)
    const event = getChannelNewsUnread(channel)
    Emitter.emit(event, totalNewsUnread)
}

export function getCountAndUpdateTotalUnreaded(channel, tag) {
    const dicRelated = dataStorage.dicRelatedSymbol
    const channelTab = Enum.CHANNEL_COUNT.TAB_RELATED_NEWS
    const channelMenu = Enum.CHANNEL_COUNT.MENU_NEWS
    const encodeSplash = encodeURIComponent('/');
    const encodeHash = encodeURIComponent('#');
    let stringQuery = ''
    if (dicRelated.length) {
        dicRelated.map(symbol => {
            let encodeSymbol = symbol.replace(/\//g, encodeSplash); // replace / -> %2F
            encodeSymbol = encodeSymbol.replace(/#/g, encodeHash); // replace # -> %2F
            stringQuery += `${encodeSymbol},`
        })

        stringQuery = stringQuery.replace(/.$/, '')
        const urlGetCountNews = Api.getNewsInday(tag, stringQuery)
        Api.requestData(urlGetCountNews, true)
            .then(res => {
                if (res) {
                    if (res.errorCode) {
                        console.log(res.errorCode)
                    } else {
                        const totalNewsUnread = res.total_count_unread || 0
                        newsControl.setTotalCountUnRead(totalNewsUnread)
                        if (dataStorage.currentScreenId === ScreenId.NEWS) {
                            updateNumberNewsUnread(channelTab, totalNewsUnread)
                        }
                        updateNumberNewsUnread(channelMenu, totalNewsUnread)
                    }
                } else {
                    console.log('GET COUNT NEWS DATA IS NULL')
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
}

export function updateAnnouncementIcon(symbol) {
    const event = getChannelAnnouncementIcon(symbol)
    const isNewsToday = true
    Emitter.emit(event, isNewsToday)
}

export function subNewsBySymbol(stringQuery) {
    // Unsub news realtime
    unSubNewByScreen('news', TAB_NEWS.RELATED)

    // Sub news realtime
    const listSymbolObject = Util.getListSymbolObject(stringQuery);
    const ID_FORM = Util.getRandomKey();

    // Set dic IDFORM nad listSymbolObject by name
    func.setDicIDForm('news', ID_FORM)
    func.setDicListSymbolObject('news', listSymbolObject)
    sub(TAB_NEWS.RELATED, listSymbolObject, () => {
        console.log(`SUB NEWS BY SYMBOL: ${stringQuery}`)
    });
}

function getRelatedNewsInday(url) {
    return new Promise(resolve => {
        Api.requestData(url).then(data => {
            if (data) {
                if (data.errorCode) {
                    resolve({})
                } else {
                    const res = data || {};
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
        Api.requestData(url).then(data => {
            if (data) {
                if (data.errorCode) {
                    resolve({})
                } else {
                    const res = data || {};
                    resolve(res)
                }
            } else {
                resolve({})
            }
        })
    })
}

function getNewsIndayUrl(filterTypeNew = 'All', stringQuery) {
    const url = Api.getNewsInday('', stringQuery)
    return url
}

function getNewsInqueryUrl(filterTypeNew = 'All', stringQuery, pageID, pageSize = 20) {
    const newType = Enum.TYPE_NEWS.RELATED
    let url = Api.getNewsUrl(newType, '', stringQuery, pageID, pageSize)
    url = `${url}&duration=year`
    return url
}
function getNewsIressUrl(symbol, lastId, pageSize = 10) {
    let { fromGTD, toGTD } = WrapperContentController.getTimeByDuration(NewsHeaderModel.CONSTANTS.DURATION.YEAR)
    fromGTD = WrapperContentController.fomatDate(new Date(fromGTD))
    toGTD = WrapperContentController.fomatDate(new Date(toGTD))
    stringQuery = `from_date=${fromGTD}&to_date=${toGTD}&symbol=${symbol}&page_size=10`
    if (lastId) {
        stringQuery += `&last_id=${lastId}`
    }
    return Api.getNewsIress(stringQuery)
}
function getAllDataRelatedNews(params, resolve) {
    const { urlNewsInday, urlNewsInQuery } = params

    const listPromise = [
        getRelatedNewsInday(urlNewsInday),
        getRelatedNewsInquery(urlNewsInQuery)
    ]

    Promise.all(listPromise)
        .then(response => {
            const newsInday = response[0]
            const newsInquery = response[1]
            const data = { ...newsInday, ...newsInquery }

            resolve(data)
        })
}

function getAllDataEverythingNews(params, resolve) {
    const { urlNewsInQuery } = params
    getRelatedNewsInquery(urlNewsInQuery)
        .then(data => {
            resolve(data)
        })
}
function getAllDataIressNews(url, resolve) {
    getRelatedNewsInquery(url)
        .then(data => {
            console.log('getAllDataIressNews', data)
            resolve(data)
        }).catch(e => {
            resolve({
                'last_id': 1038017311455314400,
                'page_size': 20,
                'data': []
            })
        })
}
function isRelatedNewBySymbol(symbol) {
    return dataStorage.dicRelatedSymbol.indexOf(symbol) > -1
}

export function getAllDataNews(filterTypeNew = 'All', stringQuery, lastId, pageSize = 10) {
    return new Promise(resolve => {
        const urlNewsIress = getNewsIressUrl(stringQuery, lastId, pageSize)
        getAllDataIressNews(urlNewsIress, resolve)
    })
}
export function getSnapshotRelativeNews(listSymbol) {
    const listSymbolObj = getListSymbolObj(listSymbol)
    console.log('DCM getSnapShot listSymbolObj', listSymbolObj)
    return new Promise((resolve, reject) => {
        ContentController.getIressFeedSnapshot(listSymbol).then((data) => {
            resolve(getObjectDataSnapShot(data))
        }).catch(e => {
            reject(e)
        })
    })
}
