import Animated, { Easing } from 'react-native-reanimated';
import { ENUM } from './index'
const {
    Clock,
    Value,
    block,
    cond,
    stopClock,
    set,
    startClock,
    clockRunning,
    not,
    and,
    timing: reTiming,
    decay: reDecay,
    spring: reSpring
} = Animated;
const onInit = (clock, sequence) =>
    cond(not(clockRunning(clock)), sequence);

const animate = ({
    fn,
    clock,
    state,
    config,
    from
}) =>
    block([
        onInit(clock, [
            set(state.finished, 0),
            set(state.time, 0),
            set(state.position, from),
            startClock(clock)
        ]),
        fn(clock, state, config),
        cond(state.finished, stopClock(clock)),
        state.position
    ]);

export const timing = (params) => {
    const { clock, easing, duration, from, to } = {
        clock: new Clock(),
        easing: Easing.linear,
        duration: 250,
        from: 0,
        to: 1,
        ...params
    };

    const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0)
    };

    const config = {
        toValue: new Value(0),
        duration,
        easing
    };

    return block([
        onInit(clock, [set(config.toValue, to), set(state.frameTime, 0)]),
        animate({
            clock,
            fn: reTiming,
            state,
            config,
            from
        })
    ]);
};

export const delay = (node, duration) => {
    const clock = new Clock();
    return block([
        timing({ clock, from: 0, to: 1, duration }),
        cond(not(clockRunning(clock)), node)
    ]);
};
export const getInitValueOpacity = (direction = 'left', type = ENUM.FADE_IN) => {
    return new Value(1)
    if (type === ENUM.FADE_IN || type === ENUM.FADE_OUT) {
        if (type === ENUM.FADE_IN) {
            return new Value(direction === 'left' ? 0 : 1)
        } else {
            return new Value(direction === 'left' ? 1 : 0)
        }
    }
}
