import { filter, pickBy, uniqWith, clone, forEach } from 'lodash'
import Enum from '~/enum'
const data = {
    priceBoards: [],
    priceBoardSelected: null,
    priceBoard: {
        watchlist: null,
        watchlist_name: null,
        init_time: null,
        value: [],
        use_id: null
    },
    priceBoardRemote: {},
    dicSymbolDeleted: {},
    dicSymbolAdded: {},
    typePriceBoard: null,
    isInit: false
}
//
export function resetModel() {
    data.priceBoardRemote = {}
    data.priceBoardSelected = {}
    data.priceBoards = {}

    data.dicSymbolDeleted = {}
    data.dicSymbolAdded = {}
    data.typePriceBoard = {}

    data.priceBoard = {
        watchlist: null,
        watchlist_name: null,
        init_time: null,
        value: [],
        use_id: null
    }
    data.isInit = false
}

export function getTypePriceBoard() {
    return data.typePriceBoard
}
export function getPriceBoardRemote() {
    return data.priceBoardRemote
}
export function getWatchlistName() {
    return data.priceBoard.watchlist_name
}
export function getOldWatchlistName() {
    return data.priceBoardRemote.watchlist_name
}
export function setWatchlistName(newWatchlistName) {
    data.priceBoard.watchlist_name = newWatchlistName
}
export function setPriceBoards(priceBoards) {
    return data.priceBoards = priceBoards
}
export function getPriceBoards() {
    return data.priceBoards
}
export function getPriceBoardSelectedkey() {
    return data.priceBoardSelected
}
export function initData({ priceBoards, priceBoardSelected, typePriceBoard, priceBoard }) {
    if (data.isInit) return
    data.isInit = true
    data.priceBoards = priceBoards
    data.priceBoardSelected = priceBoardSelected
    data.priceBoard = priceBoard
    data.priceBoardRemote = priceBoards[priceBoardSelected]
    data.typePriceBoard = typePriceBoard
    if (typePriceBoard === Enum.TYPE_PRICEBOARD.IRESS) {
        // Neu Bang gia system thi set name == ''
        data.priceBoard.watchlist_name = ''
    }
}
export function getPriceBoardCurrentPriceBoard() {
    return data.priceBoard
}
export function setPriceBoardCurrentPriceBoard(priceBoard) {
    data.priceBoard = priceBoard
}
export function setListSymbol(listSymbol) {
    data.priceBoard.value = listSymbol
}
export function updatePriceBoard(newPriceBoard = []) {
    if (!newPriceBoard) return
    return data.priceBoards[data.priceBoardSelected] = newPriceBoard
}
export function addSymbolToPriceBoard(listSymbolExchange = { 'ASX#BHP': true }) {
    let currentSymbols = data.priceBoard.value
    try {
        listSymbolExchange = pickBy(listSymbolExchange, (e) => {
            return e
        });
        listSymbolExchange = Object.keys(listSymbolExchange).map((el, key) => {
            const [symbol, exchange] = el.split('#')
            return {
                symbol,
                exchange,
                rank: key
            }
        })

        data.priceBoard.value = listSymbolExchange
        return listSymbolExchange
    } catch (error) {
        return currentSymbols
    }
}
export function deletePriceBoard(listSymbolExchange = { 'ASX#BHP': false }) {
    let currentSymbols = data.priceBoard.value
    listSymbolExchange = pickBy(listSymbolExchange, (e) => {
        return e
    });
    listSymbolExchange = Object.keys(listSymbolExchange)
    if (listSymbolExchange.length === 0) {
        data.priceBoard.value = []
        return []
    } // Delete All
    try {
        currentSymbols = currentSymbols.filter(el => {
            const key = `${el.exchange}#${el.symbol}`
            if (listSymbolExchange.includes(key)) {
                return false
            } else {
                return true
            }
        })
        data.priceBoard.value = currentSymbols
        return currentSymbols
    } catch (error) {
        return currentSymbols
    }
}
export function getKey({ symbol, exchange }) {
    return `${symbol}#${exchange}`
}
export function getDicSymbolSelected(priceBoard) {
    let currentSymbols = priceBoard ? priceBoard.value || [] : data.priceBoardRemote.value
    let dicSelected = {}
    for (let index = 0; index < currentSymbols.length; index++) {
        const element = currentSymbols[index];
        const { symbol, exchange } = element
        dicSelected[getKey({ symbol, exchange })] = true
    }
    return dicSelected
}
export function extractObjectdata(priceBoard) {
    let currentSymbols = priceBoard ? priceBoard.value : data.priceBoardRemote.value
    if (!currentSymbols) return {}
    let dicSelected = {}
    for (let index = 0; index < currentSymbols.length; index++) {
        const element = currentSymbols[index];
        const { symbol, exchange } = element
        dicSelected[getKey({ symbol, exchange })] = element
    }
    return dicSelected
}
//
export function extractDicAddedAndDeleted() {
    const dicRemoteSelected = extractObjectdata()
    const dicLocalSelected = extractObjectdata(data.priceBoard)
    return {
        listSymbolDeleted: getListDelete({
            local: dicLocalSelected,
            remote: dicRemoteSelected
        }),
        listSymbolAdded: getListAdded({
            local: dicLocalSelected,
            remote: dicRemoteSelected
        })
    }
}
export function getListDelete({
    local,
    remote
}) {
    let result = {}
    forEach(remote, function (value, key) {
        if (!local[key]) {
            result[key] = value
        }
    });
    return result
}
export function getListAdded({
    local,
    remote
}) {
    let result = {}
    forEach(local, function (value, key) {
        if (!remote[key]) {
            result[key] = value
        }
    });
    return result
}
