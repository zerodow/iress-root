import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import AnimatedBezier from 'react-native-reanimated/src/core/AnimatedBezier';
import { State } from 'react-native-gesture-handler';

const {
    add,
    cond,
    diff,
    divide,
    eq,
    min,
    lessThan,
    and,
    block,
    multiply,
    set,
    abs,
    clockRunning,
    greaterThan,
    startClock,
    stopClock,
    sub,
    Clock,
    Value,
    decay,
    timing,
    or,
    call
} = Animated;

const P = (android, ios) => (Platform.OS === 'ios' ? ios : android);

const magic = {
    deceleration: 0.997,
    velocityFactor: P(1, 1.2)
};

const { deceleration, velocityFactor } = magic;

const CANCEL_VALUE = 5;
export const swipeBounce = (t) => new AnimatedBezier(t, 0.25, 0.46, 0.45, 0.94);

export const getSpaceTop = (props) => {
    const { spaceTop } = props;
    if (typeof spaceTop === 'number') {
        return new Value(spaceTop);
    }
    return spaceTop;
};

export const handleVelocity = (_state, _velocityY) => {
    const velocityClock = new Clock();
    const curVelocity = new Value(0);
    return block([
        set(curVelocity, _velocityY),
        cond(
            eq(_state, State.BEGAN),
            clockRunning(velocityClock),
            cond(greaterThan(diff(velocityClock), 100), set(curVelocity, 0))
        ),
        cond(eq(_state, State.END), stopClock(velocityClock)),
        curVelocity
    ]);
};

export const preAdditiveOffset = (
    _gesture,
    _state,
    _translateY,
    _velocityY,
    { minPos, maxPos } = {}
) => {
    const prev = new Value(0);
    const offset = new Value(0);
    const newPos = new Value(0);

    let velocityClock = null;

    let handleVelocity = [];
    if (_velocityY) {
        velocityClock = new Clock();
        handleVelocity = cond(
            greaterThan(diff(velocityClock), 100),
            set(_velocityY, 0)
        );
    }

    let handleLimit = [];
    if (minPos && maxPos) {
        handleLimit = cond(
            or(greaterThan(newPos, minPos), lessThan(newPos, maxPos)),
            set(newPos, add(_translateY, divide(offset, 3)))
        );
    }

    return [
        cond(
            eq(_state, State.BEGAN),
            [
                velocityClock ? clockRunning(velocityClock) : [],
                set(prev, _gesture)
            ],
            [
                handleVelocity,
                set(offset, sub(_gesture, prev)),
                set(newPos, add(_translateY, offset)),
                handleLimit,
                cond(
                    eq(_state, State.END),
                    [
                        // Tren android khi focus text input thay doi STATE.END dan den noi dung bi giat giat. Khi STATE.END khong khi nhan newPos
                    ],
                    [set(_translateY, newPos)]
                ),
                set(prev, _gesture)
            ]
        ),
        velocityClock
            ? cond(eq(_state, State.END), [stopClock(velocityClock)])
            : []
    ];
};

// #region decaying

export const isGreateThanMinVelocity = (_velocityY) => {
    return greaterThan(abs(multiply(_velocityY, velocityFactor)), CANCEL_VALUE);
};

export const isOutOfLimitPos = (_translateY, { minPos, maxPos }) => {
    const detal = new Value(0);

    return block([
        set(detal, 0),
        cond(
            greaterThan(_translateY, minPos),
            set(detal, sub(_translateY, minPos))
        ),
        cond(
            lessThan(_translateY, maxPos),
            set(detal, sub(maxPos, _translateY))
        ),
        lessThan(detal, 50)
    ]);
};

export const startDecay = (
    _translateY,
    _velocityY,
    decayClock,
    stateDecay,
    wasStartedFromBegin
) => {
    const config = { deceleration };
    const reset = [
        set(stateDecay.finished, 0),
        set(stateDecay.velocity, multiply(_velocityY, velocityFactor)),
        set(stateDecay.position, _translateY),
        set(stateDecay.time, 0)
    ];
    return block([
        cond(clockRunning(decayClock), 0, [
            cond(wasStartedFromBegin, 0, [
                set(wasStartedFromBegin, 1),
                ...reset,
                startClock(decayClock)
            ])
        ]),
        cond(clockRunning(decayClock), decay(decayClock, stateDecay, config)),
        cond(stateDecay.finished, [stopClock(decayClock)]),
        stateDecay.position
    ]);
};

export const cancelDecay = (
    decayClock,
    stateDecay,
    _panState,
    wasStartedFromBegin
) => {
    return [
        stopClock(decayClock),
        set(stateDecay.finished, 1),
        cond(eq(_panState, State.BEGAN), [set(wasStartedFromBegin, 0)])
    ];
};

export const decaying = (
    _translateY,
    _velocityY,
    _timingFinished,
    { _panState, _tapState },
    { minPos, maxPos }
) => {
    // since there might be moar than one clock
    const wasStartedFromBegin = new Value(0);
    const decayClock = new Clock(0);

    const stateDecay = {
        finished: new Value(0),
        velocity: new Value(0),
        position: new Value(0),
        time: new Value(0)
    };

    return block([
        cond(
            and(
                _timingFinished,
                eq(_panState, State.END),
                or(eq(_tapState, State.FAILED), eq(_tapState, State.CANCELLED)),
                isGreateThanMinVelocity(_velocityY),
                isOutOfLimitPos(_translateY, {
                    minPos,
                    maxPos
                })
            ),
            set(
                _translateY,
                startDecay(
                    _translateY,
                    _velocityY,
                    decayClock,
                    stateDecay,
                    wasStartedFromBegin
                )
            ),
            cancelDecay(decayClock, stateDecay, _panState, wasStartedFromBegin)
        ),
        stateDecay.finished
    ]);
};

// #endregion

// #region snap bounce
export const snapTo2 = (toValue, _value, duration = 300) => {
    const timingClock = new Clock(0);
    const stateTiming = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0)
    };
    const configTiming = {
        duration: new Value(300),
        toValue: new Value(0),
        easing: swipeBounce
    };

    return block([
        cond(
            clockRunning(timingClock),
            [
                // if the clock is already running we update the toValue, in case a new dest has been passed in
            ],
            [
                // if the clock isn't running we reset all the animation params and start the clock
                set(stateTiming.finished, 0),
                set(stateTiming.time, 0),
                set(stateTiming.position, _value),
                set(stateTiming.frameTime, 0),
                set(configTiming.duration, duration),
                set(configTiming.toValue, toValue),
                startClock(timingClock)
            ]
        ),
        timing(timingClock, stateTiming, configTiming),
        set(_value, stateTiming.position),
        cond(stateTiming.finished, stopClock(timingClock)),
        stateTiming.finished
    ]);
};

export const snapTo = (
    value,
    _translateY,
    timingClock,
    stateTiming,
    configTiming
) => {
    return cond(
        clockRunning(timingClock),
        [
            // if the clock is already running we update the toValue, in case a new dest has been passed in
        ],
        [
            // if the clock isn't running we reset all the animation params and start the clock
            set(stateTiming.finished, 0),
            set(stateTiming.time, 0),
            set(stateTiming.position, _translateY),
            set(stateTiming.frameTime, 0),
            set(
                configTiming.duration,
                min(multiply(abs(sub(_translateY, value)), 3), 390)
            ),
            set(configTiming.toValue, value),
            startClock(timingClock)
        ]
    );
};

export const snapBounce = (
    _translateY,
    _decayFinished,
    _panState,
    { minPos, maxPos }
) => {
    const timingClock = new Clock(0);
    const stateTiming = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0)
    };

    const configTiming = {
        duration: new Value(5000),
        toValue: new Value(0),
        easing: swipeBounce
    };

    const reset = (value) =>
        snapTo(value, _translateY, timingClock, stateTiming, configTiming);

    return block([
        cond(
            and(
                or(
                    // out of limit position
                    greaterThan(_translateY, minPos),
                    lessThan(_translateY, maxPos)
                ),
                // without decay
                _decayFinished, // =>

                // end drag
                eq(_panState, State.END)
            ),
            [
                cond(greaterThan(_translateY, minPos), reset(minPos)),
                cond(lessThan(_translateY, maxPos), reset(maxPos)),

                timing(timingClock, stateTiming, configTiming),
                cond(stateTiming.finished, stopClock(timingClock)),
                set(_translateY, stateTiming.position)
            ]
        ),
        cond(eq(_panState, State.BEGAN), [
            stopClock(timingClock),
            set(stateTiming.finished, 1)
        ]),
        stateTiming.finished
    ]);
};

// #endregion
