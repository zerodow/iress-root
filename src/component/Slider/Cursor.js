import React, { useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types'

import {
    clamp,
    onGestureEvent,
    timing
} from '~/lib/redash/index.js';
import Animated from 'react-native-reanimated';
import IconCustom from '~/component/svg_icon/SvgIcon.js'
import { PanGestureHandler, State } from 'react-native-gesture-handler';
const PADDING = 8
const WIDTH_DARG_ICON = 25
const {
    Value,
    round,
    divide,
    concat,
    add,
    cond,
    eq,
    floor,
    lessThan,
    modulo,
    set,
    useCode,
    multiply,
    call,
    block,
    min
} = Animated;
function useInitValue({ minValue, maxValue, step, widthRange }) {
    const points = Math.ceil(((maxValue - minValue) / step)) + 1
    const size = widthRange / (points - 1)
    return useMemo(() => {
        return {
            offset: new Value(0),
            translationX: new Value(0),
            state: new Value(State.UNDETERMINED),
            size,
            points,
            needMapValue: new Value(State.UNDETERMINED)
        }
    }, [])
}
function useInitGesture({ state, translationX }) {
    return useMemo(() => {
        return onGestureEvent({ state, translationX });
    }, [])
}
function useInitReduceTranslateX({ offset, translationX }) {
    return useMemo(() => {
        return add(offset, translationX)
    }, [])
}
function useInitBoundTranslateX({ reduceTranslateX, state, offset, size, widthRange }) {
    return useMemo(() => {
        return clamp(
            cond(
                eq(state, State.END),
                set(
                    offset,
                    timing({
                        from: reduceTranslateX,
                        to: multiply(round(divide(reduceTranslateX, size)), size)
                    })
                ),
                reduceTranslateX
            ),
            0,
            widthRange
        )
    }, [])
}
function useInitIndexPoint({ boundTranslateX, size }) {
    return useMemo(() => {
        return round(divide(boundTranslateX, size))
    }, [])
}
function useOnListenInitValue({ minValue, initValue, step, size, color, translationX, offset, state }) {
    return useEffect(() => {
        const index = initValue < minValue ? 0 : Math.round((initValue - minValue) / step)
        const needTranslateX = index * size
        state.setValue(State.UNDETERMINED)
        offset.setValue(needTranslateX)
        translationX.setValue(0)
    }, [initValue, color])
}
function useListenStateGesture({ state, needMapValue }) {
    return useCode(block([
        cond(eq(state, State.ACTIVE), set(needMapValue, State.ACTIVE), []),
        cond(eq(state, State.END), set(needMapValue, State.UNDETERMINED), [])
    ]), [])
}
function useListenReset({ isReset, state, offset, translationX }) {
    return useEffect(() => {
        state.setValue(State.UNDETERMINED)
        offset.setValue(0)
        translationX.setValue(0)
    }, [isReset])
}
const Cursor = ({
    initValue,
    minValue,
    maxValue,
    step,
    widthRange,
    color,
    referenceValue,
    isReset,
    cursor = {
        width: 25,
        height: 20
    }
}) => {
    const { state, offset, translationX, size, needMapValue } = useInitValue({ minValue, maxValue, step, widthRange })
    const gestureHandler = useInitGesture({ state, translationX })
    const reduceTranslateX = useInitReduceTranslateX({ offset, translationX, state, widthRange })
    const boundTranslateX = useInitBoundTranslateX({ reduceTranslateX, widthRange, state, offset, size })
    const index = useInitIndexPoint({ boundTranslateX, size })

    useListenStateGesture({ state, needMapValue })
    useOnListenInitValue({ minValue, initValue, step, size, color, translationX, offset, state })
    useListenReset({ isReset, state, offset, translationX })

    useCode(block([
        cond(eq(needMapValue, State.ACTIVE), set(referenceValue, min(add(multiply(index, step), minValue), maxValue)), 0)
    ]), [referenceValue])
    return (
        <React.Fragment>
            <PanGestureHandler {...gestureHandler}>
                <Animated.View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        height: cursor.height,
                        width: cursor.width,
                        position: 'absolute',
                        top: -8,
                        transform: [{ translateX: boundTranslateX }]
                    }}
                >
                    <IconCustom color={color} name={'dragSlider'} />
                </Animated.View>
            </PanGestureHandler>
        </React.Fragment>
    );
};
Cursor.propTypes = {
    initValue: PropTypes.string,
    minValue: PropTypes.number.isRequired,
    maxValue: PropTypes.number.isRequired,
    step: PropTypes.number.isRequired,
    widthRange: PropTypes.number.isRequired,
    color: PropTypes.string,
    referenceValue: PropTypes.object,
    isReset: PropTypes.string
};
Cursor.defaultProps = {}
export default Cursor;
