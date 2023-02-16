import { useEffect, useRef, useState, useCallback } from 'react'
import Animated, { Easing } from 'react-native-reanimated'
const STATE_ANIM = {
    UNDETERMINE: 0,
    START: 1,
    STOP: 2
}
const {
    Value,
    block,
    cond,
    clockRunning,
    set,
    startClock,
    stopClock,
    timing,
    eq,
    call,
    and,
    neq,
    sub
} = Animated

export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function useTiming({
    clock,
    value,
    dest,
    stateAnim,
    duration = 200,
    onEndAnimation = () => {
        console.log('ANIMATION END')
    }
}
) {
    const state = {
        finished: new Value(0),
        position: value,
        time: new Value(0),
        frameTime: new Value(0)
    };

    const config = {
        duration,
        toValue: dest,
        easing: Easing.inOut(Easing.ease)
    };

    return block([
        cond(
            eq(stateAnim, STATE_ANIM.START),
            [
                cond(clockRunning(clock),
                    [],
                    [
                        // If the clock isn't running we reset all the animation params and start the clock
                        set(state.finished, 0),
                        set(state.time, 0),
                        set(state.position, value),
                        set(state.frameTime, 0),
                        set(config.toValue, dest),
                        startClock(clock)
                    ])
            ]),
        // we run the step here that is going to update position
        timing(clock, state, config),
        // if the animation is over we stop the clock
        cond(state.finished, [
            set(stateAnim, STATE_ANIM.UNDETERMINE),
            stopClock(clock)
        ]),
        cond(
            and(
                neq(state.position, 0),
                eq(state.position, dest),
                [call([], onEndAnimation)]
            )
        ),
        // we made the block return the updated position
        set(value, state.position),
        state.position
    ]);
}

export function useLayout(cb) {
    const onLayout = useCallback(event => {
        const { layout } = event.nativeEvent
        cb && cb(layout)
    }, [])
    return [onLayout]
}
