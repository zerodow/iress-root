import _ from 'lodash'

let dicAdded = {}
let dicAdd = {}
let dicRemoved = {}
let symbol = ''
let exchange = ''

export function getDicAdded() {
    return dicAdded
}

export function getDicAdd() {
    return dicAdd
}

export function getDicRemoved() {
    return dicRemoved
}

export function setDicAdded(data) {
    dicAdded = data
}

export function setSymbolInfo(symbolInfo) {
    symbol = symbolInfo.symbol
    exchange = symbolInfo.exchange
}

export function getSymbolInfo() {
    return {
        symbol,
        exchange
    }
}

export function filterDicAdded({ userWL, symbol, exchange }) {
    if (!userWL || !Object.keys(userWL).length) return {}
    const dicAdded = {}
    _.forEach(userWL, (v, k) => {
        const { value, watchlist: watchlistId } = v || {}
        let isInclude = false;
        _.forEach(value, (item) => {
            isInclude = symbol === item.symbol && exchange === item.exchange;
        });
        if (isInclude) {
            dicAdded[watchlistId] = true
        }
    })
    return dicAdded
}

export function updateDicAdd({ watchlistId }) {
    // // Nếu đang ở trong list đã added thì phải xóa khỏi dic và thêm vào dic remove
    // if (dicAdded[watchlistId]) {
    //     dicRemoved[watchlistId] = true
    //     return delete dicAdded[watchlistId]
    // }
    // // Nếu đang ở trong list remove thì sẽ xóa ở dic Remove và thêm ở dic Add
    // if (dicRemoved[watchlistId]) {
    //     dicAdd[watchlistId] = true
    //     return delete dicRemoved[watchlistId]
    // }
    const hasOwnProperty = dicAdd.hasOwnProperty(watchlistId)
    if (hasOwnProperty) {
        dicAdd[watchlistId] = !dicAdd[watchlistId]
    } else {
        dicAdd[watchlistId] = true
    }
}

export function reset() {
    symbol = ''
    exchange = ''
    dicAdded = {}
    dicAdd = {}
    dicRemoved = {}
}
