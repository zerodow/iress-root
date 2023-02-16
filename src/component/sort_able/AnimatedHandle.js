import React from 'react'
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State, FlatList } from 'react-native-gesture-handler'

const { Value, eq, set, call, onChange, block, useCode, cond, add, divide, round, diff, greaterThan, greaterOrEq, lessThan, multiply, sub, and, or, abs, lessOrEq, floor } = Animated

export const DIRECTION = {
    UP: 1,
    UNDERTIMIND: 0,
    DOWN: -1
}
export const useDetectedDirectionY = ({ translationY, isMoveUp }) => {
    const preTranslationY = new Value(0)
    const nextTranslationY = new Value(0)
    return useCode(block([
        onChange(translationY, block([
            set(preTranslationY, nextTranslationY),
            set(nextTranslationY, translationY),
            cond(greaterThan(sub(nextTranslationY, preTranslationY), 0), set(isMoveUp, DIRECTION.DOWN), set(isMoveUp, DIRECTION.UP))
        ]))
    ]), [])
}
export const useReleaseTouched = ({ panState, cbRelease = () => { } }) => {
    return useCode(block([
        onChange(panState, block([
            cond(or(
                eq(panState, State.END),
                eq(panState, State.CANCELLED),
                eq(panState, State.FAILED)
            ), [call([], cbRelease)])
        ]))
    ]), [])
}
export const useLog = ({ nodes, cb }) => {
    return call(nodes, cb)
}
const Threshold = 2
export const HandleAutoScrollUp = ({ autoScrollUp, translateY, startAutoScrollUp, stopAutoScrollUp }) => {
    return <Animated.Code
        exec={block([
            cond(
                and(
                    eq(autoScrollUp, 0), // Chua autoScrollUp thi ms check
                    lessOrEq(add(translateY, Threshold), 0)
                ),
                [
                    set(autoScrollUp, 1),
                    call([], () => {
                        console.info('DCM startAutoScrollUp')
                        startAutoScrollUp && startAutoScrollUp()
                    })
                ]),
            cond(
                and(
                    eq(autoScrollUp, 1),
                    greaterOrEq(translateY, 0)),
                [
                    // New dang autoScrollUp ma vuot xuong thi cho den khi translateY lon hon 0 thi disable autoScroll de drag hoverCom
                    set(autoScrollUp, 0),
                    call([], () => {
                        console.info('DCM stopAutoScrollUp')
                        stopAutoScrollUp && stopAutoScrollUp()
                    })
                ])
        ])}
    />
}
export const HandleAutoScrollDown = ({ autoScrollDown, translateY, listViewHeightAni, itemHeight, startAutoScrollDown, stopAutoScrollDown }) => {
    const triggerValueAutoScrollDown = sub(listViewHeightAni, itemHeight)
    return <Animated.Code
        exec={block([
            cond(
                and(
                    eq(autoScrollDown, 0),
                    greaterOrEq(sub(translateY, Threshold), triggerValueAutoScrollDown)
                ),
                [
                    set(autoScrollDown, 1),
                    call([triggerValueAutoScrollDown, listViewHeightAni, translateY], ([a, b, c]) => {
                        console.info('DCM startAutoScrollDown', a, b, c)
                        startAutoScrollDown && startAutoScrollDown()
                    })
                ]
            ),
            cond(
                and(
                    eq(autoScrollDown, 1),
                    lessOrEq(translateY, triggerValueAutoScrollDown)
                ),
                [
                    set(autoScrollDown, 0),
                    call([], () => {
                        console.info('DCM stopAutoScrollDown')
                        stopAutoScrollDown && stopAutoScrollDown()
                    })
                ]
            )
        ])}
    />
}
