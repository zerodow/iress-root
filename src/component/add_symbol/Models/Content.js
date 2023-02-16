import { filter, pickBy, uniqWith } from 'lodash'
import * as Controller from '~/memory/controller'
import { initDicSymbolSelected } from '~/component/add_symbol/Redux/actions.js'
const Content = {
    dataSelected: {}
}
export function init(dataSelected) {
    // Sync redux = model. Check xem co su thay doi khi thao tac an tich hoac untich. Update button done
    // Controller.dispatch(
    //     initDicSymbolSelected(dataSelected)
    // );
    Content.dataSelected = dataSelected
}
function getKey({ symbol, exchange }) {
    return `${symbol}#${exchange}`
}
export function isSelected({ symbol, exchange }) {
    return !!Content.dataSelected[getKey({ symbol, exchange })]
}
export function addSymbolSelected({ symbol, exchange, isSelected }) {
    if (!isSelected) {
        delete Content.dataSelected[getKey({ symbol, exchange })]
    } else {
        let tmp = {}
        tmp[getKey({ symbol, exchange })] = isSelected
        Content.dataSelected = { ...tmp, ...Content.dataSelected }
    }
}
export function getSymbolSelected() {
    return Content.dataSelected
}
export function getSymbolSelected2() {
    return filter(Content.dataSelected, (el, key) => el)
}
export function clearSymbolSelected() {
    // Content.dataSelected = {}
}
