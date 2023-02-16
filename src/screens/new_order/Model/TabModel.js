import { Dimensions, Platform } from 'react-native'
export const model = {
    layout: 'BASIC',
    depth: 'ALL',
    trading: {
        STOPLOSS: false,
        MORE_STOPLOSS: false,
        TAKE_PROFIT: false,
        MORE_TAKE_PROFIT: false
    },
    maxHeight: 334,
    rowDepthHeight: Platform.OS === 'android' ? 29.5 : 31.5,
    priceInfoHeight: 0,
    isDisableTabBuySell: false,
    isDisableTab : false, 
    changeMaxHeight: () => { }
}
export function setTabTrading(tabs) {
    model.trading = { ...model.trading, ...tabs }
    if (model.trading.MORE_STOPLOSS && model.trading.MORE_TAKE_PROFIT) {
        model.changeMaxHeight({ isShowAll: true })
    } else {
        model.changeMaxHeight({ isShowAll: false })
    }
}

export function getTabTrading() {
    return model.trading
}
export function setDisableTabBuySell(isDisabled) {
    model.isDisableTabBuySell = isDisabled
}
export function getDisableTabBuySell() {
    return model.isDisableTabBuySell
}
export function setTabLayout(key) {
    model.layout = key
}
export function setDepthTab(key) {
    model.depth = key
}
export function reset() {
    model.layout = 'BASIC'
    model.depth = 'ALL'
    model.trading = {
        STOPLOSS: false,
        TAKE_PROFIT_LOSS: false
    }
    model.changeMaxHeight = () => { }
    model.trading = {
        STOPLOSS: false,
        MORE_STOPLOSS: false,
        TAKE_PROFIT: false,
        MORE_TAKE_PROFIT: false
    }
    model.maxHeight = 334
    model.isDisableTabBuySell = false
    model.isDisableTab = false
}
export function setHeightDepthRow(h) {
    model.rowDepthHeight = h
}
