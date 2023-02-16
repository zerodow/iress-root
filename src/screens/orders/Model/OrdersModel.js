import ENUM from '~/enum'
import { clone } from '~/utils/pure_func'
const { ORDER_TAG, ORDER_TAG_STRING, FILTER_CIRCLE_STATUS } = ENUM

let preOrderTag = null
let orderTag = ORDER_TAG.ACTIVE
let sideFilter = {
    buy: false,
    sell: false
}
let timeFilter = FILTER_CIRCLE_STATUS.DOWN // 0: NONE - 1: UP - 2:DOWN
let volumeFilter = FILTER_CIRCLE_STATUS.NONE // 0: NONE - 1: UP - 2:DOWN
let contingentFilter = FILTER_CIRCLE_STATUS.NONE
let textSearch = ''
let originalData = []
let data = []
let dicInteractable = {}
export function setContingentFilter(filter) {
    contingentFilter = filter
}
export function getContingentFilter() {
    return contingentFilter
}
export function changeSideFilter({ side, status }) {
    sideFilter[side] = status
}

export function changeTimeFilter({ status }) {
    timeFilter = status
}

export function changeVolumeFilter({ status }) {
    volumeFilter = status
}

export function changeTextSearch(text) {
    if (text === null || text === undefined) return
    textSearch = text.trim()
}

export function getTextSearch() {
    return textSearch
}

export function getSideFilter(side) {
    if (side) {
        // Filter side
        return sideFilter[side]
    }
    // Filter all side
    return sideFilter
}

export function setDataOrders(newData) {
    originalData = newData
}

export function setOrderTag(newOrderTag) {
    preOrderTag = orderTag
    orderTag = newOrderTag
}

export function setOriginalDataOrders(newData) {
    originalData = newData
}

export function getOriginalDataOrders() {
    return originalData
}

export function getTimeFilter() {
    return timeFilter
}

export function getVolumeFilter() {
    return volumeFilter
}

export function getPreAndOrderTag() {
    return {
        preOrderTag,
        orderTag
    }
}

export function getOrderTag() {
    return orderTag
}

export function getOrderTagString() {
    return ORDER_TAG_STRING[orderTag]
}
export function clearInteractable() {
    Object.keys(dicInteractable).map((item) => {
        const closeInteractableFn = dicInteractable[item]
        closeInteractableFn && closeInteractableFn()
        delete dicInteractable[item]
    })
}
export function registerInteractable({ index, fn }) {
    // Close all interactable before
    Object.keys(dicInteractable).map((item) => {
        const closeInteractableFn = dicInteractable[item]
        closeInteractableFn && closeInteractableFn()
        delete dicInteractable[item]
    })
    dicInteractable[index] = fn
}
export function resetFilter() {
    textSearch = ''
    sideFilter = {}
}
export function destroy() {
    preOrderTag = null
    orderTag = ORDER_TAG.ACTIVE
    textSearch = ''
    sideFilter = {}
    timeFilter = FILTER_CIRCLE_STATUS.DOWN
    volumeFilter = FILTER_CIRCLE_STATUS.NONE
    data = []
    originalData = []
    dicInteractable = {}
    contingentFilter = FILTER_CIRCLE_STATUS.NONE
}
