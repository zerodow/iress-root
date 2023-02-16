
export const findIndexActive = ({ item, viewableItems, keyExtractor }) => {
    const key = keyExtractor(item)
    let activeItem = null
    let activeIndex = null

    viewableItems.forEach((element, index) => {
        if (keyExtractor(element.item) === key) {
            activeItem = element;
            activeIndex = index
        }
    });
    return {
        activeItem,
        activeIndex
    }
}
export const swap = ({ data, indexStart, indexEnd }) => {
    const left = data.slice(0, indexStart)
    const mid = data.slice(indexStart, indexEnd - 1)
    const end = data.slice(indexEnd + 1, data.length)
    const itemTop = data[indexStart]
    const itemBottom = data[indexEnd]
    return {
        newData: [...left, itemBottom, ...mid, itemTop, ...end],
        itemTop,
        itemBottom
    }
}
export function extraData({ data = [], viewableItems = [] }) {
    const startItem = viewableItems[0]
    const endItem = viewableItems[viewableItems.length - 1]
    const leftData = data.slice(0, startItem.index)
    const rightData = data.slice(endItem.index + 1, data.length)
    return { leftData, rightData }
}
