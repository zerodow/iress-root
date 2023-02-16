import React, { Component, useCallback, PureComponent, useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import Animated, { Easing } from 'react-native-reanimated';

const { Clock, Value, set, cond, startClock, clockRunning, timing, debug, stopClock, block, eq, call } = Animated
export const STATE = {
    NONE: 0,
    ACTIVE: 1,
    DE_ACTIVE: 2

}
function runTiming(clock, value, dest) {
    const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0)
    };

    const config = {
        duration: 300,
        toValue: new Value(0),
        easing: Easing.inOut(Easing.ease)
    };

    return block([
        cond(clockRunning(clock), [
            // if the clock is already running we update the toValue, in case a new dest has been passed in
            set(config.toValue, dest)
        ], [
            // if the clock isn't running we reset all the animation params and start the clock
            set(state.finished, 0),
            set(state.time, 0),
            set(state.position, value),
            set(state.frameTime, 0),
            set(config.toValue, dest),
            startClock(clock)
        ]),
        // we run the step here that is going to update position
        timing(clock, state, config),
        // if the animation is over we stop the clock
        cond(state.finished, debug('stop clock', stopClock(clock))),
        // we made the block return the updated position
        state.position
    ]);
}
/**
 * animationValue dung de interpolate
 * isLoading dung de check dieu kien chay animation
 * loadingState dung de check va set dieu kien chay animation. Vi du gia tri loading trong redux
 */
const HandleLoading = ({ animatedValue, isLoading, loadingState }) => {
    // we create a clock node
    let clock = new Clock();
    useEffect(() => {
        if (loadingState) {
            isLoading && isLoading.setValue(STATE.ACTIVE)
        } else {
            isLoading && isLoading.setValue(STATE.DE_ACTIVE)
        }
    }, [loadingState])
    return (
        <PureAnimatedCode renderCode={() => {
            return (
                <Animated.Code>
                    {() => {
                        return block([
                            cond(eq(isLoading, STATE.ACTIVE), [
                                set(animatedValue, runTiming(clock, 0, 1)),
                                cond(eq(animatedValue, 1), [
                                    set(isLoading, new Value(STATE.NONE))
                                ], [])
                            ], []),
                            cond(eq(isLoading, STATE.DE_ACTIVE), [
                                set(animatedValue, runTiming(clock, 1, 0)),
                                cond(eq(animatedValue, 0), [
                                    set(isLoading, new Value(STATE.NONE))
                                ], [])
                            ], [])
                        ])
                    }}
                </Animated.Code>
            )
        }} />
    )
    // and use runTiming method defined above to create a node that is going to be mapped
    // to the translateX transform.
}
export const PureAnimatedCode = React.memo(({ renderCode }) => {
    const reCode = useCallback(() => {
        return renderCode && renderCode()
    }, [])
    return reCode()
}, () => true)
export default HandleLoading
