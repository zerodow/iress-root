import React, { useImperativeHandle, useRef, useMemo, useCallback } from 'react'
import Animated, { Easing } from 'react-native-reanimated'

const {
    Value,
    Clock,
    Code,
    block,
    startClock,
    stopClock,
    set,
    timing,
    cond,
    clockRunning
} = Animated

const AnimationComp = React.forwardRef((props, ref) => {
    const { value, dest } = props
    const show = useCallback(() => {
        dest.setValue(24 + 8)
    }, [])
    const hide = useCallback(() => {
        dest.setValue(0)
    }, [])
    useImperativeHandle(ref, () => {
        return {
            show,
            hide
        }
    })
    const dic = useRef({
        clockWidth: new Clock()
    })
    const _value = useMemo(() => {
        return new Value(0)
    }, [])
    const runTiming = useCallback((clock, dest) => {
        const state = {
            finished: new Value(0),
            position: _value,
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: 200,
            toValue: dest,
            easing: Easing.inOut(Easing.ease)
        };

        return block([
            cond(clockRunning(clock), 0, [
                // If the clock isn't running we reset all the animation params and start the clock
                set(state.finished, 0),
                set(state.time, 0),
                set(state.position, _value),
                set(state.frameTime, 0),
                set(config.toValue, dest),
                startClock(clock)
            ]),
            // we run the step here that is going to update position
            timing(clock, state, config),
            // if the animation is over we stop the clock
            cond(state.finished, stopClock(clock)),
            // we made the block return the updated position
            set(value, state.position),
            state.position
        ]);
    }, [])
    return <Code exec={runTiming(dic.current.clockWidth, dest)} />
})

export default React.memo(AnimationComp, () => true)
