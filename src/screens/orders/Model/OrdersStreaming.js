import * as Controller from '~/memory/controller'
import { setOrders } from '~s/orders/Redux/actions'
import ENUM from '~/enum'
import * as Emitter from '@lib/vietnam-emitter'
import * as Channel from '~/streaming/channel'
import _ from 'lodash'
import {
    getOrderTag, getOriginalDataOrders, setOriginalDataOrders,
    getSideFilter, getTextSearch
} from '~s/orders/Model/OrdersModel'
import {
    logDevice
} from '~/lib/base/functionUtil';
import {
    sortBySideAndTextSearch
} from '~s/orders/Controller/OrdersController'
import { errorSettingModel } from '~/screens/setting/main_setting/error_system_setting.js'
const { ORDER_TAG, ORDERS_SDIE, FILL_STATUS, ST_TP_ORDER_ACTION, SLTP_ORDER_STATUS, ACTION_STATUS, ORDER_TAG_STRING } = ENUM
let dicOrdersRealtime = {}
let dicOrdersRealtimeSeq = {}

export function syncDicOrdersRealtime({ data }) {
    // data la 1 list
    dicOrdersRealtime = {} // reset
    _.forEach(data, (item, index) => {
        const { order_id: orderId } = item
        dicOrdersRealtime[orderId] = item
    })
}

export function syncOrdersRealTimeSeq({ data }) {
    // data la 1 list
    dicOrdersRealtimeSeq = {} // reset
    _.forEach(data, (item, index) => {
        const { order_id: orderId } = item
        dicOrdersRealtimeSeq[orderId] = item
    })
    syncDataOrderDetail() // Khi getSnapShot cung se ghi vao orderDetail(VD: Case an app)
}

export function setOrdersRealTime({ data }) {
    const { order_id: orderId } = data
    dicOrdersRealtime[orderId] = data
}

export function getOrdersRealTime() {
    return dicOrdersRealtime
}

export function setOrdersRealTimeSeq({ data }) {
    const { order_id: orderId, server_time: serverTime } = data
    const tmp = dicOrdersRealtimeSeq[orderId]
    if (tmp && tmp.server_time) {
        const nextSeverTime = serverTime
        const preServerTime = tmp.server_time
        if (nextSeverTime < preServerTime) return // Neu message have serverTime later serverTime of dicOrderDetail then return
    }
    dicOrdersRealtimeSeq[orderId] = data
}

export function getOrdersRealTimeSeq() {
    return dicOrdersRealtimeSeq
}

// export function updateSingleOrdersRealtime({ key, data }) {
//     const { seq_num: oldSeq } = dicOrdersRealtime[key]
//     const { seq_num: seq } = data
//     // nếu sequence number > old sequence number thì update
//     if (seq > oldSeq) {
//         dicOrdersRealtime[key] = data
//     }
// }

// export function updateSingleOrdersRealtimeSeq({ key, data }) {
//     dicOrdersRealtimeSeq[key] = data
// }

export function removeKeyOrdersRealTime({ key }) {
    delete dicOrdersRealtime[key]
}

export function removeKeyOrdersRealTimeSeq({ key }) {
    delete dicOrdersRealtimeSeq[key]
}

export function clearOrdersRealTime() {
    dicOrdersRealtime = {}
}

export function clearOrdersRealTimeSeq() {
    dicOrdersRealtimeSeq = {}
}

export function checkExistOrdersRealtime({ key }) {
    if (dicOrdersRealtime[key]) {
        return true
    }
    return false
}

export function checkExistOrders(originalData, findOrderId) {
    const findIndex = originalData.findIndex(item => {
        const { order_id: orderId } = item
        return orderId === findOrderId
    })
    if (findIndex > -1) {
        return true
    }
    return false
}

export function checkChildOrders({ hasSL, hasTP, orderId, parentOrderId, rootParentOrderId }) {
    if (hasSL || hasTP) {
        return false
        // return rootParentOrderId !== parentOrderId
    }
    return orderId !== rootParentOrderId
}

// export function checkExistOrdersRealtimeSeq({ key }) {
//     if (dicOrdersRealtimeSeq[key]) {
//         return true
//     }
//     return false
// }

export function processNewData(originalData, dicNewData) {
    if (!dicNewData || !Object.keys(dicNewData).length) return
    const listNewData = _.values(dicNewData)
    originalData = listNewData.concat(originalData)
    setOriginalDataOrders(originalData)
}

export function processDeleteData(originalData, dicDeleteData) {
    if (!dicDeleteData || !Object.keys(dicDeleteData).length) return
    // Có reference với list ban đầu
    originalData.map((item, index) => {
        const { order_id: orderId } = item
        if (dicDeleteData[orderId]) {
            originalData.splice(index, 1)
        }
    })
    setOriginalDataOrders(originalData)
}

export function processUpdateData(originalData, dicUpdateData) {
    if (!dicUpdateData || !Object.keys(dicUpdateData).length) return
    // Có reference với list ban đầu
    originalData.map((item, index) => {
        const { order_id: orderId } = item
        if (dicUpdateData[orderId]) {
            originalData[index] = _.merge(originalData[index], dicUpdateData[orderId])
            // originalData[index] = dicUpdateData[orderId]
        }
    })
    setOriginalDataOrders(originalData)
}
export function getOrderActionAndActionStatusST({ stOrderInfo }) {
    const { stoploss_order_action: stopLossOrderAction, stoploss_action_status: stoplossActionStatus } = stOrderInfo
    return { stopLossOrderAction, stoplossActionStatus }
}
export function getOrderActionAndActionStatusTP({ tpOrderInfo }) {
    const { takeprofit_order_action: takeprofitOrderAction, takeprofit_action_status: takeprofitActionStatus } = tpOrderInfo
    return { takeprofitOrderAction, takeprofitActionStatus }
}
export function isCANCELOKSTTP({ orderAction, actionStatus }) {
    if (orderAction === ST_TP_ORDER_ACTION.CANCEL && actionStatus === ACTION_STATUS.OK) return true
    return false
}
export function hardCodeGetOrderTag({ data }) {
    let { fill_status: fillStatus, has_stoploss: hasSL, has_takeprofit: hasTP, order_tag: orderTag } = data
    if ((hasSL || hasTP) && fillStatus === FILL_STATUS.FILLED) {
        const { stoploss_order_info: stOrderInfo, takeprofit_order_info: tpOrderInfo } = data
        if (hasSL && hasTP) {
            const { stopLossOrderAction, stoplossActionStatus } = getOrderActionAndActionStatusST({ stOrderInfo })
            const isCancelOkST = isCANCELOKSTTP({ orderAction: stopLossOrderAction, actionStatus: stoplossActionStatus })
            const { takeprofitOrderAction, takeprofitActionStatus } = getOrderActionAndActionStatusTP({ tpOrderInfo })
            const isCancelOkTP = isCANCELOKSTTP({ orderAction: takeprofitOrderAction, actionStatus: takeprofitActionStatus })
            if (isCancelOkST && isCancelOkTP) return ORDER_TAG_STRING[ORDER_TAG.EXECUTED]
        }
        if (hasSL && !hasTP) {
            const { stopLossOrderAction, stoplossActionStatus } = getOrderActionAndActionStatusST({ stOrderInfo })
            const isCancelOkST = isCANCELOKSTTP({ orderAction: stopLossOrderAction, actionStatus: stoplossActionStatus })
            if (isCancelOkST) return ORDER_TAG_STRING[ORDER_TAG.EXECUTED]
        }
        if (!hasSL && hasTP) {
            const { takeprofitOrderAction, takeprofitActionStatus } = getOrderActionAndActionStatusTP({ tpOrderInfo })
            const isCancelOkTP = isCANCELOKSTTP({ orderAction: takeprofitOrderAction, actionStatus: takeprofitActionStatus })
            if (isCancelOkTP) return ORDER_TAG_STRING[ORDER_TAG.EXECUTED]
        }
    }
    return orderTag
}
export function processOrdersRealtime({ data }) {
    if (errorSettingModel.code) return
    if (!data || !data.length) return
    // Data là 1 list order realtime
    try {
        logDevice('info', `processOrdersRealtime: ${JSON.stringify({ data })}`);
    } catch (error) {
        console.info('processOrdersRealtime log ERROR', error)
    }
    const dicNewData = {}
    const dicDeleteData = {} // Lệnh đã không còn ở tab hiện tại
    const dicUpdateData = {} // Update thông tin data
    const dicInCorrectFilter = {}
    let originalData = getOriginalDataOrders()
    const curOrderTag = getOrderTag()
    _.forEach(data, (item, index) => {
        let {
            order_id: orderId,
            order_tag: orderTag,
            root_parent_order_id: rootParentOrderId,
            parent_order_id: parentOrderId,
            has_stoploss: hasSL,
            has_takeprofit: hasTP
        } = item
        orderTag = hardCodeGetOrderTag({ data: item })
        // const isExist = checkExistOrders(originalData, orderId)
        const isExistRealtime = checkExistOrdersRealtime({ key: orderId })
        // const isChildOrder = checkChildOrders({ hasSL, hasTP, orderId, parentOrderId, rootParentOrderId })
        // if (isChildOrder) return // Nếu là lệnh con thì không ghi nhận
        const isCorrectTab = checkRealtimeCorrectTab(curOrderTag, orderTag)
        // Check Correct filter
        // const isCorrectFilter = checkRealtimeCorrectFilter({ data: item })
        // if (!isCorrectFilter) {
        //     dicInCorrectFilter[orderId] = true
        // }
        if (isExistRealtime) {
            if (isCorrectTab) {
                if (dicNewData[orderId]) {
                    dicNewData[orderId] = item
                } else {
                    dicUpdateData[orderId] = item
                }
            } else {
                dicDeleteData[orderId] = item
            }
        } else {
            if (isCorrectTab) {
                dicNewData[orderId] = item
            }
        }
        // Update dic order realtime
        isCorrectTab && setOrdersRealTime({ data: item })
        setOrdersRealTimeSeq({ data: item })
    })
    // Process new data
    processNewData(originalData, dicNewData)
    // Process delete data
    processDeleteData(originalData, dicDeleteData)
    // Process update data
    processUpdateData(originalData, dicUpdateData)
    return pubRealtimeOrder()
}

export function pubRealtimeOrder() {
    let filterData = getOriginalDataOrders()
    filterData = sortBySideAndTextSearch(filterData)
    filterData = filterData.sort((a, b) => b.updated - a.updated)
    Controller.dispatch(setOrders(filterData))
    // Sync data for order detail
    syncOrdersRealTimeSeq({data : filterData})
    // syncDataOrderDetail()
}

export function syncDataOrderDetail() {
    const channel = Channel.getChannelUpdateOrderDetail()
    Emitter.emit(channel)
}

function checkRealtimeCorrectTab(curOrderTag, orderTag) {
    const orderTagNumber = ORDER_TAG[(orderTag + '').toUpperCase()]
    return curOrderTag === orderTagNumber
}

function checkRealtimeCorrectFilter({ data }) {
    let { side, order_id: orderId, symbol } = data
    symbol = (symbol + '').toLowerCase()
    orderId = (orderId + '').toLowerCase()
    const sideFilter = getSideFilter()
    const { buy: buyFilter, sell: sellFilter } = sideFilter // true - false
    const textSearch = getTextSearch()
    const conditionSide = (buyFilter && sellFilter) || (!buyFilter && !sellFilter)
        ? true
        : buyFilter
            ? side === ORDERS_SDIE.BUY
            : side === ORDERS_SDIE.SELL
    const conditionSearch = symbol.includes(textSearch.toLowerCase()) || orderId.includes(textSearch.toLowerCase())
    return conditionSide && conditionSearch
}

export function getDataRealtimeByKey({ key }) {
    return dicOrdersRealtimeSeq[key]
}

// function checkRealtimeCorrectSide({ listFilter, data }) {
//     const { is_buy: isBuy } = data
//     const listSide = []
//     LIST_FILTER_BY_ORDER_SIDE.map(item => {
//         if (listFilter[item]) {
//             listSide.push(item)
//         }
//     })
//     if (!listSide.length) {
//         // Không filter gì => lấy all => return true
//         return true
//     }
//     if (listSide.length === 2) {
//         // Tích cả Buy / Sell => lấy all => return true
//         return true
//     }
//     const isBuyFilter = listSide[0] === 'BUY' ? 1 : 0
//     return isBuy === isBuyFilter
// }

// function checkRealtimeCorrectOrderType({ listFilter, data }) {
//     const { order_type: orderType } = data
//     const listOrderType = []
//     LIST_FILTER_BY_ORDER_TYPE.map(item => {
//         if (listFilter[item]) {
//             listOrderType.push(item)
//         }
//     })
//     if (!listOrderType.length) {
//         // Không tích gì => lấy all => return true
//         return true
//     }
//     return listOrderType.includes(orderType)
// }

// function checkRealtimeCorrectFilter({ data }) {
//     const listFilter = getListFilterOrdersId()
//     if (!checkRealtimeCorrectSide({ listFilter, data })) {
//         return false
//     }
//     if (!checkRealtimeCorrectOrderType({ listFilter, data })) {
//         return false
//     }
//     return true
// }

// function checkRealtimeCorrectDuration({ data }) {
//     const { updated } = data
//     const { startTime, endTime } = getStartEndTime()
//     return updated >= startTime && updated <= endTime
// }

// export function pubRealtimeOrderDetail({ data }) {
//     const channel = Channel.getChannelRealtimeOrderDetail()
//     Emitter.emit(channel, data)
// }

// function realtimeDataCorrectTab({ data }) {
//     Controller.dispatch(updateRealtimeRedux({ data, isCorrectTab: true }))
// }

// function realtimeDataNotCorrectTab({ data }) {
//     Controller.dispatch(updateRealtimeRedux({ data, isCorrectTab: false }))
// }
