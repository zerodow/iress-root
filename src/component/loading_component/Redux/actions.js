import { getAnimationTypeByTag } from '~s/orders/Controller/AnimationController'
export function changeAnimationType(animation) {
    const animationType = animation || getAnimationTypeByTag()
    return {
        type: 'CHANGE_LOADING_ANIMATION_TYPE',
        payload: animationType
    }
}
