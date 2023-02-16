import { getPreAndOrderTag } from '~s/orders/Model/OrdersModel'
import ENUM from '~/enum'

const { ANIMATION_TYPE } = ENUM

export function getAnimationTypeByTag() {
    const { preOrderTag, orderTag } = getPreAndOrderTag()
    if (preOrderTag === null) {
        return ANIMATION_TYPE.FADE_IN
    }
    if (orderTag > preOrderTag) {
        return ANIMATION_TYPE.FADE_IN_RIGHT
    }
    if (orderTag < preOrderTag) {
        return ANIMATION_TYPE.FADE_IN_LEFT
    }
}
export function getAnimationTypeByIndex({ preIndex, nextIndex }) {
    if (preIndex === null) {
        return ANIMATION_TYPE.FADE_IN
    }
    if (nextIndex > preIndex) {
        return ANIMATION_TYPE.FADE_IN_RIGHT
    }
    if (nextIndex < preIndex) {
        return ANIMATION_TYPE.FADE_IN_LEFT
    }
}
