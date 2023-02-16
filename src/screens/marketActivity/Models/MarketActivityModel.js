let dicInteractable = {}
let dicAllowStreaming = false
export function registerInteractable({ index, fn }) {
    // Close all interactable before
    Object.keys(dicInteractable).map((item) => {
        const closeInteractableFn = dicInteractable[item]
        closeInteractableFn && closeInteractableFn()
        delete dicInteractable[item]
    })
    dicInteractable[index] = fn
}
export function clearInteractable() {
    Object.keys(dicInteractable).map((item) => {
        console.info('item', item)
        const closeInteractableFn = dicInteractable[item]
        closeInteractableFn && closeInteractableFn()
        delete dicInteractable[item]
    })
}
export function updateAllowStreaming(status) {
    dicAllowStreaming = status
}
export function getStatusAllowStreaming() {
    return dicAllowStreaming
}
export function detroy() {
    dicInteractable = {}
    dicAllowStreaming = false
}
