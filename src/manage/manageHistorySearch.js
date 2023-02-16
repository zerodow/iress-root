import * as PureFunc from '~/utils/pure_func'
import * as Controller from '~/memory/controller'
import ENUM from '~/enum'
import { dataStorage } from '~/storage'
import DeviceInfo from 'react-native-device-info';
import { logDevice } from '~/lib/base/functionUtil'
import {
    requestData1, putData, getUrlUserSettingByUserId, getAccountInfo
} from '~/api'
import {
    getChannelSyncHistorySearchAccount,
    getChannelSyncHistorySearchWLPriceboard,
    getChannelSyncHistorySearchSymbol
} from '~/streaming/channel'
import * as Emitter from '~/lib/base/vietnam-emitter'
import {
    checkListAccountAvailabelOperator,
    checkLastAccountRetail
} from '~/util'

const {
    USER_TYPE,
    NUMBER_HISTORY_SEARCH_ACCOUNT,
    NUMBER_HISTORY_SEARCH_SYMBOL,
    NUMBER_HISTORY_SEARCH_WATCHLIST,
    ACCOUNT_STATE
} = ENUM
let listAccount = []
let listWLPriceboard = []
let listSymbol = []
const deviceID = dataStorage.deviceId

export function saveHistorySearchSymbol({ data, symbolInfo }) {
    let listData = PureFunc.clone(data)
    const historySymbol = getSymbolSaveHistory(symbolInfo)
    const checkSymbolExist = checkSymbolHistoryExist({ dic: listData, symbolInfo: historySymbol })
    if (!checkSymbolExist) {
        // Lấy ra symbol cần lưu lại history, nếu là thằng con thì lưu thằng cha
        if (listData.length < ENUM.NUMBER_HISTORY_SEARCH_SYMBOL) {
            listData.unshift(historySymbol)
        } else {
            listData.pop()
            listData.unshift(historySymbol)
        }
    } else {
        // Lấy ra symbol cần lưu lại history, nếu là thằng con thì lưu thằng cha
        if (listData.length < ENUM.NUMBER_HISTORY_SEARCH_SYMBOL) {
            listData = listData.filter(item => {
                return item.symbol !== historySymbol.symbol
            })
            listData.unshift(historySymbol)
        } else {
            listData = listData.filter(item => {
                return item.symbol !== historySymbol.symbol
            })
            listData.unshift(historySymbol)
        }
    }
    storeHistorySearchSymbolLocal(listData)
    storeHistorySearchSymbolApi()
    return listData
}

export function checkSymbolHistoryExist({ dic, symbolInfo }) {
    let exist = false
    for (i = 0; i < dic.length; i++) {
        if (dic[i].symbol === symbolInfo.symbol) {
            exist = true
            break;
        }
    }
    return exist
}

export function getSymbolSaveHistory(symbolInfo = {}) {
    let { master_code: masterCode, class: symbolClass, has_child: hasChild, exchanges = [] } = symbolInfo
    const company = symbolInfo.security_name || symbolInfo.company_name || symbolInfo.company
    let symbol = symbolInfo.symbol
    if (masterCode) {
        // Lưu thằng cha
        symbol = masterCode
        masterCode = null
        hasChild = false
    }
    return {
        master_code: masterCode,
        has_child: hasChild,
        exchanges,
        symbol,
        company,
        symbolClass
    }
}

export function setAndSyncAccount(newListAccount, isSync) {
    // Filter active account
    setHistorySearchAccount(newListAccount)
    isSync && syncHistorySearchAccountSSE(getHistorySearchAccount(NUMBER_HISTORY_SEARCH_ACCOUNT))
}

export function setHistorySearch({ userSetting = {}, isSync = false, isCheckActiveAcc = false }) {
    const {
        account_history: newListAccount = [],
        order_history: newListSymbol = [],
        watchlist_history: newListWLPriceboard = []
    } = userSetting
    // Set account
    if (isCheckActiveAcc) {
        filterHistorySearchActiveAccountApi(newListAccount)
            .then(res => {
                setAndSyncAccount(res, isSync)
                storeHistorySearchAccountApi() // Lưu lại vào setting sau khi filter
            })
            .catch(e => {
                console.log('DCM setHistorySearch error', e)
                setAndSyncAccount(newListAccount, isSync)
            })
    } else {
        setAndSyncAccount(newListAccount, isSync)
    }
    // Set WL, symbol
    setHistorySearchWLPriceboard(newListWLPriceboard)
    setHistorySearchSymbol(newListSymbol)
    // Sync
    isSync && syncHistorySearchWLPriceboardSSE(getHistorySearchWLPriceboard(NUMBER_HISTORY_SEARCH_WATCHLIST))
    isSync && syncHistorySearchSymbolSSE(getHistorySearchSymbol(NUMBER_HISTORY_SEARCH_SYMBOL))
}

export function setHistorySearchAccount(newListAccount) {
    listAccount = newListAccount
}

export function setHistorySearchWLPriceboard(newListWLPriceboard) {
    listWLPriceboard = newListWLPriceboard
}

export function setHistorySearchSymbol(newListSymbol) {
    listSymbol = newListSymbol.filter(e => {
        return Object.keys(e).length && e.symbol
    })
}

export function getHistorySearchAccount(numberAccount) {
    const currentListAccount = PureFunc.clone(listAccount)
    if (numberAccount) {
        return currentListAccount.splice(0, numberAccount)
    }
    return currentListAccount
}
export function getHistorySearchWLPriceboard(numberWLPriceboard) {
    const currentListWLPriceboard = PureFunc.clone(listWLPriceboard)
    if (numberWLPriceboard) {
        return currentListWLPriceboard.splice(0, numberWLPriceboard)
    }
    return currentListWLPriceboard
}
export function getHistorySearchSymbol(numberSymbol) {
    const currentListSymbol = PureFunc.clone(listSymbol)
    if (numberSymbol) {
        return currentListSymbol.splice(0, numberSymbol)
    }
    return currentListSymbol
}

export function filterHistorySearchActiveAccountApi(newListAccount) {
    return new Promise((resolve, reject) => {
        getAccInfo(newListAccount)
            .then(res => {
                if (res && res.length) {
                    const listAccountActive = res.filter(e => {
                        const status = e.status || 'active'
                        return status === ACCOUNT_STATE.ACTIVE
                    })
                    console.log('DCM filterHistorySearchActiveAccountApi list account active', listAccountActive)
                    return resolve(listAccountActive)
                }
                return reject('list account is null')
            })
            .catch(e => {
                console.log('filterHistorySearchActiveAccountApi error', e)
                reject(e)
            })
    })
}

export function filterHistorySearchActiveAccountLocal() {
    return listAccount.filter(e => {
        const status = e.status || 'active'
        return status === ACCOUNT_STATE.ACTIVE
    })
}

export function getAccountAvailable() {
    return new Promise(resolve => {
        const userType = Controller.getUserType()
        if (userType === USER_TYPE.OPERATOR || userType === USER_TYPE.ADVISOR) {
            // Operator resolve ben kia
            checkListAccountAvailabelOperator(listAccount, resolve)
        } else if (userType === USER_TYPE.RETAIL) {
            const listAccountAvailabel = []
            for (let i = 0; i < listAccount.length; i++) {
                const params = Controller.getAllListAccount()
                if (checkLastAccountRetail(listAccount[i], params)) {
                    listAccountAvailabel.push(listAccount[i])
                }
            }
            resolve(listAccountAvailabel)
        }
    })
}

export function getAccInfo(newListAccount) {
    let stringAcc = ''
    newListAccount.map(item => {
        const { account_id: accountID } = item
        if (accountID) {
            stringAcc += `${accountID},`
        }
    })
    stringAcc = stringAcc.replace(/.$/, '')
    const urlAccInfo = getAccountInfo(stringAcc)
    return new Promise((resolve, reject) => {
        requestData1(urlAccInfo)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })
}

export function filterHistorySearchAccountWithApi() {
    /*
        1> Cần check xem còn mapping hay không
        2> Cần check có account nào inactive -> loại bỏ
    */
    getAccountAvailable()
        .then(res => {
            res && setHistorySearchAccount(res)
        })
        .catch(err => {
            console.log('DCM filterHistorySearchAccountWithApi error', err)
        })
}

export function storeHistorySearchAccountLocal(newListAccount) {
    const listAccount = PureFunc.clone(newListAccount)
    setHistorySearchAccount(listAccount)
}

export function storeHistorySearchSymbolLocal(newListSymbol) {
    const listSymbol = PureFunc.clone(newListSymbol)
    setHistorySearchSymbol(listSymbol)
}

export function storeHistorySearchWLPriceboardLocal(newListWL) {
    const listWL = PureFunc.clone(newListWL)
    setHistorySearchWLPriceboard(listWL)
}

export function storeHistorySearchAccountApi() {
    // Lưu vào db setting
    const userId = Controller.getUserId();
    const newObj = PureFunc.clone(Controller.getSettingApp())
    newObj['account_history'] = listAccount
    newObj['deviceId'] = deviceID;
    const urlPut = getUrlUserSettingByUserId(userId, 'put');
    putData(urlPut, { data: newObj })
        .then()
        .catch(error => {
            console.log('error', `storeHistorySearchAccountApi error: ${error}`)
        })
}

export function storeHistorySearchSymbolApi() {
    // Lưu vào db setting
    const userId = Controller.getUserId();
    const newObj = PureFunc.clone(Controller.getSettingApp())
    newObj['order_history'] = listSymbol
    newObj['deviceId'] = deviceID;
    const urlPut = getUrlUserSettingByUserId(userId, 'put');
    putData(urlPut, { data: newObj })
        .then()
        .catch(error => {
            console.log('error', `storeHistorySearchSymbolApi error: ${error}`)
        })
}

export function storeHistorySearchWlPriceboardApi() {
    // Lưu vào db setting
    const userId = Controller.getUserId();
    const newObj = PureFunc.clone(Controller.getSettingApp())
    newObj['watchlist_history'] = listWLPriceboard
    newObj['deviceId'] = deviceID;
    const urlPut = getUrlUserSettingByUserId(userId, 'put');
    putData(urlPut, { data: newObj }).then()
        .catch(error => {
            console.log('error', `storeHistorySearchWlPriceboardApi error: ${error}`)
        })
}

export function syncHistorySearchAccountSSE(newListAccount) {
    if (!newListAccount) return
    const listAccount = PureFunc.clone(newListAccount)
    const channelSyncHistorySearchAccount = getChannelSyncHistorySearchAccount()
    Emitter.emit(channelSyncHistorySearchAccount, listAccount)
}

export function syncHistorySearchWLPriceboardSSE(newListWLPriceboard) {
    if (!newListWLPriceboard) return false
    const listWLPriceboard = PureFunc.clone(newListWLPriceboard)
    const channelSyncHistorySearchWLPriceboard = getChannelSyncHistorySearchWLPriceboard()
    Emitter.emit(channelSyncHistorySearchWLPriceboard, listWLPriceboard)
}

export function syncHistorySearchSymbolSSE(newListSymbol) {
    if (!newListSymbol) return false
    const listSymbol = PureFunc.clone(newListSymbol)
    const channelSyncHistorySearchSymbol = getChannelSyncHistorySearchSymbol()
    Emitter.emit(channelSyncHistorySearchSymbol, listSymbol)
}

export function checkWLDeletedAndSync(priceBoardId) {
    if (!priceBoardId) return
    const newListWLPriceboard = listWLPriceboard.filter(item => {
        return item.watchlist !== priceBoardId
    })
    // Có thay đổi length thì update lại trên setting
    if (newListWLPriceboard.length < listWLPriceboard.length) {
        storeHistorySearchWLPriceboardLocal(newListWLPriceboard)
        storeHistorySearchWlPriceboardApi()
    }
}

export function checkWLExistAndSync(newListWLPriceboard) {
    if (newListWLPriceboard.length !== listWLPriceboard.length) {
        storeHistorySearchWLPriceboardLocal(newListWLPriceboard)
        storeHistorySearchWlPriceboardApi()
    }
}

export function clearAllHistorySearch() {
    listAccount.length = 0
    listWLPriceboard.length = 0
    listSymbol.length = 0
}
