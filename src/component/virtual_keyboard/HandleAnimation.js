import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
const {
    add,
    multiply,
    neq,
    spring,
    cond,
    eq,
    event,
    lessThan,
    greaterThan,
    and,
    call,
    set,
    clockRunning,
    startClock,
    stopClock,
    Clock,
    Value,
    concat,
    interpolate,
    Extrapolate
} = Animated
export function runSpring(clock, value, dest) {
    const state = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    };

    const config = {
        damping: 20,
        mass: 1,
        stiffness: 100,
        overshootClamping: false,
        restSpeedThreshold: 1,
        restDisplacementThreshold: 0.5,
        toValue: new Value(0)
    };

    return [
        cond(clockRunning(clock), 0, [
            set(state.finished, 0),
            set(state.velocity, 0),
            set(state.position, value),
            set(config.toValue, dest),
            startClock(clock)
        ]),
        spring(clock, state, config),
        cond(state.finished, stopClock(clock)),
        state.position
    ];
}
