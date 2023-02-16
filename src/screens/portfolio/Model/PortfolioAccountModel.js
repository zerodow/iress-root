import { dispatch } from '~/memory/controller'
import { changeAccActive } from '~s/portfolio/Redux/actions'
import * as Controller from '~/memory/controller'
import { changeIsSearch } from '~/component/search_account/redux/actions.js'
import { func } from 'prop-types'
let accActive = null
let lastAccActive = null
let accessMode = 0
let listPortfolioType = null
let dicPortfolioType = {}
let isSearchAccount = false
let toCurrency = null // Currency by Account
let fromCurrency = null // Currency by Symbol
export function setIsSearchAccount(isSearch = false) {
    Controller.dispatch(changeIsSearch(isSearch))
    isSearchAccount = isSearch
}
export function getIsSearchAccount() {
    return isSearchAccount
}
export function setReduxAccActive(acc) {
    dispatch(changeAccActive(acc))
}

export function setAccActive(acc) {
    accActive = acc
}

export function getAccActive() {
    return accActive
}

export function setLastAccActive(acc) {
    lastAccActive = acc
}

export function getLastAccActive() {
    return lastAccActive
}

export function setAccessMode(newAccessMode = 0) {
    accessMode = newAccessMode
}

export function getAccessMode() {
    return accessMode
}

export function setListPortfolioType(newListPortfolioType, isUpdateAccActive = true) {
    if (!newListPortfolioType) return
    listPortfolioType = newListPortfolioType
    newListPortfolioType.map((item, index) => {
        if (index === 0 && isUpdateAccActive) {
            setReduxAccActive(item.portfolio_id)
            setAccActive(item.portfolio_id)
        }
        const { portfolio_id: portfolioCode } = item
        dicPortfolioType[portfolioCode] = item
    })
}

export function filterListPortfolioType(text) {
    if (!text) return []
    return listPortfolioType.filter((item, index) => {
        const { portfolio_id: portfolioCode, portfolio_name: portfolioName = '' } = item
        return portfolioCode.includes(text) || portfolioName.toLowerCase().includes(text.toLowerCase())
    })
}

export function getListPortfolioType() {
    return listPortfolioType
}

export function getDicPortfolioType(portfolioCode) {
    return dicPortfolioType[portfolioCode] || {}
}

export function getPorfolioTypeByCode(portfolioCode) {
    return (dicPortfolioType[portfolioCode] || {}).portfolio_type
}

export function getPortfolioName(portfolioCode) {
    return (dicPortfolioType[portfolioCode] || {}).portfolio_name
}

export function destroy() {
    accActive = null
    lastAccActive = null
    accessMode = 0
    listPortfolioType = null
    dicPortfolioType = {}
}
export function setToCurrency(newCurrency) {
    if (newCurrency) {
        toCurrency = newCurrency
    } else {
        toCurrency = '--'
    }
}
export function getToCurrency() {
    return toCurrency
}
export function setFromCurrency(newCurrency) {
    if (newCurrency) {
        fromCurrency = newCurrency
    } else {
        fromCurrency = '--'
    }
}
export function getFromCurrency() {
    return fromCurrency
}
