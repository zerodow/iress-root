import { Platform } from 'react-native'
export const model = {
    layout: 'ADVANCE',
    depth: 'LAST',
    maxHeight: 334,
    rowDepthHeight: Platform.OS === 'android' ? 29.5 : 31.5,
    priceInfoHeight: 0,
    isDisableTabBuySell: false,
    changeMaxHeight: () => { }
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
export function resetContingentPricebase() {
    model.layout = 'ADVANCE'
    model.depth = 'LAST'
    model.changeMaxHeight = () => { }
    model.maxHeight = 334
    model.isDisableTabBuySell = false
}
export function setHeightDepthRow(h) {
    model.rowDepthHeight = h
}
