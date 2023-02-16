let initValue = {
    listPreSymbol: {}
}
export function updateListPreSymbol({ symbols }) {
    let tmp = {}
    for (let index = 0; index < symbols.length; index++) {
        const element = symbols[index];
        tmp[element] = element
    }
    initValue.listPreSymbol = tmp
}
export function getListPreSymbol() {
    return initValue.listPreSymbol
}
