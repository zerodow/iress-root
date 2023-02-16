const Content = {
    dataSelected: {}
}
function getKey({ symbol, exchange }) {
    return `${exchange}#${symbol}`
}
export function isSelected({ symbol, exchange }) {
    return !!Content.dataSelected[getKey({ symbol, exchange })]
}
export function addSymbolSelected({ symbol, exchange, isSelected }) {
    Content.dataSelected[getKey({ symbol, exchange })] = isSelected
}
export function clearSymbolSelected() {
    Content.dataSelected = {}
}
