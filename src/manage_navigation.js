import * as PureFunc from './utils/pure_func'
import Enum from './enum'

const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE
const ANIMATED_TYPE = Enum.ANIMATED_TYPE

let stackStep = []
let isBacking = false
let destinationId = null

export function pushStep({ screenId, type }) {
    if (!screenId || !type) return
    stackStep.push({ screenId, type })
}

export function pushStepAndShow(navigation, nextScreenObj, type, onlyShow) {
    if (!navigation || !nextScreenObj || !type) return

    !onlyShow && stackStep.push({ screenObj: nextScreenObj, type })

    type === NAVIGATION_TYPE.MODAL
        ? navigation.showModal(nextScreenObj)
        : navigation.push(nextScreenObj)
}

export function startBacking(destinationScreenId) {
    isBacking = true
    destinationId = destinationScreenId
}

export function checkIsBacking() {
    return isBacking
}

export function getDestinationScreenId() {
    return destinationId
}

export function checkIsDestinationScreenId(destinationScreenId) {
    return destinationId === destinationScreenId
}

export function doneBacking() {
    isBacking = false
    destinationId = null
}

export function pop() {
    return stackStep.pop()
}

export function popAndClose(navigation, screenId, animated = false, animationType) {
    const item = pop()

    if (!navigation || !item || !item.screenObj || item.screenObj.screen !== screenId) return null
    if (animated && !animationType) {
        animationType = item.type === NAVIGATION_TYPE.MODAL ? ANIMATED_TYPE.SLIDE_DOWN : ANIMATED_TYPE.SLIDE_HORIZONTAL
    }

    item.type === NAVIGATION_TYPE.MODAL
        ? navigation.dismissModal({
            animated,
            animationType
        })
        : navigation.pop({
            animated,
            animationType
        })
}

export function resetStack() {
    stackStep = []
}

export function getPreviousScreen() {
    if (!stackStep || stackStep.length < 2) return null
    const previousItem = stackStep[stackStep.length - 2]
    return PureFunc.clone(previousItem)
}
