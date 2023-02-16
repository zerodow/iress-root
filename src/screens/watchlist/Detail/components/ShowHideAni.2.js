import React, { useState } from 'react';
import Animated, { Easing } from 'react-native-reanimated';

const {
    cond,
    block,
    set,
    clockRunning,
    startClock,
    stopClock,
    Value,
    timing,
    Clock,
    neq,
    and
} = Animated;

const STATE = {
    UNDETERMINED: 0,
    SHOW: 1,
    HIDE: 2
};

let HandleAnimated = ({ _trans, _opacity, _isShow, _isHide, endPosition }) => {
    const _state = new Value(STATE.UNDETERMINED);

    const timingClock = new Clock();
    const stateTiming = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0)
    };

    const configTiming = {
        duration: new Value(100),
        toValue: new Value(0),
        easing: Easing.linear
    };

    const resetState = (toValue) =>
        cond(
            clockRunning(timingClock),
            [
                // if the clock is already running we update the toValue, in case a new dest has been passed in
                set(stateTiming.finished, 0),
                set(stateTiming.frameTime, 0),
                set(stateTiming.time, 0),
                set(configTiming.toValue, toValue)
            ],
            [
                // if the clock isn't running we reset all the animation params and start the clock
                set(stateTiming.finished, 0),
                set(stateTiming.time, 0),
                // set(this.stateTiming.position, this.translateY),
                set(stateTiming.frameTime, 0),
                set(configTiming.toValue, toValue),
                startClock(timingClock)
            ]
        );

    const handleShowEffect = cond(and(_isShow, neq(_state, STATE.SHOW)), [
        set(_state, STATE.SHOW),
        resetState(1),
        set(_trans, 0)
    ]);

    const handleHideEffect = cond(and(_isHide, neq(_state, STATE.HIDE)), [
        set(_state, STATE.HIDE),
        resetState(0)
    ]);

    return (
        <Animated.Code
            exec={block([
                handleShowEffect,
                handleHideEffect,
                timing(timingClock, stateTiming, configTiming),
                cond(stateTiming.finished, [
                    stopClock(timingClock),
                    endPosition ? cond(_isHide, set(_trans, endPosition)) : []
                ]),
                set(_opacity, stateTiming.position)
            ])}
        />
    );
};

HandleAnimated = React.memo(HandleAnimated);

const ShowHideComp = ({ children, ...props }) => {
    const [opacity] = useState(() => new Value(0));
    const [translateY] = useState(() => new Value(0));

    return (
        <Animated.View
            style={{
                transform: [{ translateY }],
                opacity
            }}
        >
            <HandleAnimated _trans={translateY} _opacity={opacity} {...props} />
            {children}
        </Animated.View>
    );
};

export default ShowHideComp;
