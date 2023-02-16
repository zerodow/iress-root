import { getAccActive } from '~s/portfolio/Model/PortfolioAccountModel'
import { getUrlOrderByTag, requestData, getUrlOrderByOrderID } from '~/api'
import { setOrders, changeLoadingState, changeSyncDataStatus, changeSyncSymbolInfoStatus } from '~s/orders/Redux/actions'
import { changeAnimationType } from '~/component/loading_component/Redux/actions'
import { syncDicOrdersRealtime, syncOrdersRealTimeSeq } from '~s/orders/Model/OrdersStreaming'
import { getAccessToken, dispatch } from '~/memory/controller'
import { getSymbolInfoApi } from '~/lib/base/functionUtil'
import Moment from 'moment'
import {
    setDataOrders, getOriginalDataOrders, getSideFilter, getVolumeFilter,
    getTimeFilter, getOrderTagString, getTextSearch, setOriginalDataOrders, getContingentFilter
} from '~s/orders/Model/OrdersModel'
import { dataStorage } from '~/storage'
import ENUM from '~/enum'
import _ from 'lodash'
import { clone } from '~/utils/pure_func'
import { getPortfolioTypeAndLastAccount } from '~/screens/portfolio/Controller/PortfolioAccountController.js'
import { isErrorSystemByCode } from '~/component/error_system/Controllers/ErrorSystem.js'
import DURATION from '~/constants/durationString'
const { FILTER_CIRCLE_STATUS, ORDERS_SDIE, ANIMATION_TYPE, DURATION_CODE } = ENUM
export function getDisplayLifeTime({ duration, expiryTime }) {
    if (duration === DURATION_CODE.GTD) {
        return Moment(expiryTime).utc().format('D MMM YYYY')
    }
    return DURATION[duration] || ''
}

export function getOrdersSymbolInfo(data, cbSyncSymbolInfo) {
    if (data && data.length) {
        let dicSymbol = {}
        let stringQuery = '';
        _.forEach(data, ({ symbol, exchange }) => {
            const strCheck = symbol + '#' + exchange;
            if (!dataStorage.symbolEquity[strCheck] && !dicSymbol[strCheck]) {
                stringQuery += symbol + '.' + exchange + ',';
                dicSymbol[strCheck] = true
            }
        });
        if (stringQuery) {
            stringQuery = stringQuery.replace(/.$/, '');
        }
        getSymbolInfoApi(stringQuery, cbSyncSymbolInfo);
    }
}

export function getOrders({ isSortUpdated = false, isSortAllCondition = false } = {}) {
    const orderTag = getOrderTagString()
    const accountId = getAccActive()
    if (accountId && accountId !== '') { // Neu lay duoc portfolio type
        const url = getUrlOrderByTag({ orderTag, accountId })
        requestData(url, true, null, true)
            .then(res => {
                if (isErrorSystemByCode(res)) return
                if (res) {
                    if (res.length) {
                        const cbSyncSymbolInfo = () => {
                            dispatch(changeSyncSymbolInfoStatus(true)) // Update khi call symbol info xong
                        }
                        dispatch(changeSyncSymbolInfoStatus(false)) // Reset khi bắt đầu call symbol info
                        getOrdersSymbolInfo(res, cbSyncSymbolInfo)
                        syncDicOrdersRealtime({ data: res }) // Sync dic order realtime
                        syncOrdersRealTimeSeq({ data: res }) // Sync dic order realtime
                        // Sort updated newest -> oldest
                        let sortData = clone(res)
                        sortData = sortData.sort((a, b) => {
                            return b.updated - a.updated
                        })
                        setOriginalDataOrders(sortData) // Set Filter data
                        if (isSortUpdated) {
                            return dispatch(setOrders(sortData))
                        }
                        // Không sort data
                        return isSortAllCondition
                            ? sortAllCondition()
                            : dispatch(setOrders(res))
                    }
                    // Data rỗng
                    setDataOrders([])
                    syncDicOrdersRealtime({ data: [] }) // Sync dic order realtime
                    syncOrdersRealTimeSeq({ data: [] }) // Sync dic order realtime
                    return dispatch(setOrders([]))
                }
                // Data NULL
                setDataOrders([])
                syncDicOrdersRealtime({ data: [] }) // Sync dic order realtime
                syncOrdersRealTimeSeq({ data: [] }) // Sync dic order realtime
                return dispatch(setOrders([]))
            })
            .catch(err => {
                // Exception
                setDataOrders([])
                syncDicOrdersRealtime({ data: [] }) // Sync dic order realtime
                syncOrdersRealTimeSeq({ data: [] }) // Sync dic order realtime
                return dispatch(setOrders([]))
            })
    } else {
        // Neu khong lay duoc portfolio type thi call lai de lay
        getPortfolioTypeAndLastAccount().then(() => {
            const accountIdTmp = getAccActive()
            const urlTmp = getUrlOrderByTag({ orderTag, accountId: accountIdTmp })
            requestData(urlTmp, true, null, true)
                .then(res => {
                    if (res) {
                        if (res.length) {
                            const cbSyncSymbolInfo = () => {
                                dispatch(changeSyncSymbolInfoStatus(true)) // Update khi call symbol info xong
                            }
                            dispatch(changeSyncSymbolInfoStatus(false)) // Reset khi bắt đầu call symbol info
                            getOrdersSymbolInfo(res, cbSyncSymbolInfo)
                            syncDicOrdersRealtime({ data: res }) // Sync dic order realtime
                            syncOrdersRealTimeSeq({ data: res }) // Sync dic order realtime
                            // Sort updated newest -> oldest
                            let sortData = clone(res)
                            sortData = sortData.sort((a, b) => {
                                return b.updated - a.updated
                            })
                            setOriginalDataOrders(sortData) // Set Filter data
                            if (isSortUpdated) {
                                return dispatch(setOrders(sortData))
                            }
                            // Không sort data
                            return isSortAllCondition
                                ? sortAllCondition()
                                : dispatch(setOrders(res))
                        }
                        // Data rỗng
                        setDataOrders([])
                        syncDicOrdersRealtime({ data: [] }) // Sync dic order realtime
                        syncOrdersRealTimeSeq({ data: [] }) // Sync dic order realtime
                        return dispatch(setOrders([]))
                    }
                    // Data NULL
                    setDataOrders([])
                    syncDicOrdersRealtime({ data: [] }) // Sync dic order realtime
                    syncOrdersRealTimeSeq({ data: [] }) // Sync dic order realtime
                    return dispatch(setOrders([]))
                })
                .catch(err => {
                    // Exception
                    setDataOrders([])
                    syncDicOrdersRealtime({ data: [] }) // Sync dic order realtime
                    syncOrdersRealTimeSeq({ data: [] }) // Sync dic order realtime
                    return dispatch(setOrders([]))
                })
        })
    }
}

export function sortBySideAndTextSearch(filterData) {
    const { buy: filterBuy, sell: filterSell } = getSideFilter()
    const textSearch = getTextSearch()
    // Filter theo SIDE và text search
    filterData = filterData.filter((item) => {
        let { symbol = '', order_id: orderID = '', side } = item
        symbol = symbol.toLowerCase()
        orderID = orderID.toString().toLowerCase()
        const searchCondition = symbol.includes(textSearch.toLowerCase()) || orderID.includes(textSearch.toLowerCase())
        const sideCondition = (filterBuy && filterSell) || (!filterBuy && !filterSell)
            ? true
            : filterBuy
                ? side === ORDERS_SDIE.BUY
                : side === ORDERS_SDIE.SELL
        return searchCondition && sideCondition
    })
    return filterData
}

export function sortAllCondition() {
    // Sort side + volume + time + search
    let originalData = getOriginalDataOrders() // Data nay da sort theo updated
    let dataFilter = originalData
    const { buy: filterBuy, sell: filterSell } = getSideFilter()
    const textSearch = getTextSearch()
    const contingentFilter = getContingentFilter()
    // Nếu off all thì lấy original data từ API
    const noneContingentFilter = contingentFilter === FILTER_CIRCLE_STATUS.NONE
    const noneSideCond = (filterBuy && filterSell) || (!filterBuy && !filterSell)
    const noneTextSearchCond = !textSearch
    if (noneSideCond && noneTextSearchCond && noneContingentFilter) {
        return dispatch(setOrders(dataFilter)) // Set to redux data filter
    }
    // Filter theo SIDE và text search
    dataFilter = dataFilter.filter((item) => {
        let { symbol = '', order_id: orderID = '', side,
            stoploss_order_info: stopLossOrderInfo,
            takeprofit_order_info: takeprofitOrderInfo
        } = item
        symbol = symbol.toLowerCase()
        orderID = orderID.toString().toLowerCase()
        const contingentCondition = noneContingentFilter || stopLossOrderInfo || takeprofitOrderInfo
        const searchCondition = symbol.includes(textSearch.toLowerCase()) || orderID.includes(textSearch.toLowerCase())
        const sideCondition = (filterBuy && filterSell) || (!filterBuy && !filterSell)
            ? true
            : filterBuy
                ? side === ORDERS_SDIE.BUY
                : side === ORDERS_SDIE.SELL
        return searchCondition && sideCondition && contingentCondition
    })
    return dispatch(setOrders(dataFilter)) // Set to redux data filter
}

export function syncNewestOrdersData() {
    const isSyncData = true
    dispatch(changeSyncDataStatus(isSyncData))
}

// export function getOrderByOrderID(orderID) {
//     const originalData = getOriginalDataOrders()
//     const data = originalData.filter(item => {
//         return item.order_id === orderID
//     })
//     return data[0]
// }

export function getOrderByOrderID(orderID) {
    return new Promise(resolve => {
        const url = getUrlOrderByOrderID(orderID)
        requestData(url, true, null, true)
            .then(res => {
                if (res) {
                    console.info('getOrderByOrderID', res)
                    if (res.length) {

                    }
                    // Data rỗng
                    return resolve(null)
                }
                // Data NULL
                return resolve(null)
            })
            .catch(err => {
                // Exception
                return resolve(null)
            })
    })
}
