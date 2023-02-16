export const model = {
    layout: 'ADVANCE',
    depth: 'GREATER_OR_EQUAL',
    maxHeight: 268,
    priceInfoHeight: 0,
    isDisableTabBuySell: false,
    isDisableCondition : false, 
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
export function resetContingentCondition() {
    model.layout = 'ADVANCE'
    model.depth = 'GREATER_OR_EQUAL'
    model.changeMaxHeight = () => { }
    model.maxHeight = 268
    model.isDisableTabBuySell = false
    model.isDisableCondition = false
}
export function setHeightDepthRow(h) {
    model.rowDepthHeight = h
}
