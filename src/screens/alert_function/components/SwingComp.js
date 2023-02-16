import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import React, { Component } from 'react';

const {
    Value,
    cond,
    clockRunning,
    startClock,
    set,
    timing,
    debug,
    stopClock,
    block,
    Clock,
    eq,
    call,
    and,
    interpolate
} = Animated;
function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function runTiming(clock, value, dest) {
    const state = {
        finished: new Value(1),
        position: new Value(value),
        time: new Value(0),
        frameTime: new Value(0)
    };

    const config = {
        duration: 200,
        toValue: new Value(0),
        easing: Easing.linear
    };

    const reset = [
        set(state.finished, 0),
        set(state.time, 0),
        set(state.frameTime, 0)
    ];

    return block([
        cond(and(state.finished, eq(state.position, value)), [
            ...reset,
            set(config.toValue, dest)
        ]),
        cond(and(state.finished, eq(state.position, dest)), [
            ...reset,
            set(config.toValue, value)
        ]),
        cond(clockRunning(clock), 0, startClock(clock)),
        timing(clock, state, config),
        state.position
    ]);
}

const PLAYER_STATE = {
    PAUSED: 0,
    PLAYING: 1
};

export default class SimplePlayer extends Component {
    constructor() {
        super();
        this.clock = new Clock();
        this.trans = new Value(0);
        this.playingState = new Value(PLAYER_STATE.PAUSED);
        this.base = runTiming(this.clock, -1, 1);
        this._transX = interpolate(this.base, {
            inputRange: [-1, 1],
            outputRange: [-0.01, 0.01]
        });
        console.log('DCM random ', randomNumber(-1, 1))
        this.playingState.setValue(PLAYER_STATE.PAUSED);
    }
    stop = () => {
        this.playingState.setValue(PLAYER_STATE.PAUSED);
    }
    start = () => {
        this.playingState.setValue(PLAYER_STATE.PLAYING);
    }
    render() {
        return (
            <Animated.View style={{ transform: [{ rotate: this._transX }] }}>
                <Animated.Code>
                    {() =>
                        block([
                            cond(eq(this.playingState, PLAYER_STATE.PAUSED), [
                                stopClock(this.clock)
                                // set(this.bases, 0)
                            ]),
                            cond(eq(this.playingState, PLAYER_STATE.PLAYING), [
                                runTiming(this.clock, -1, 1)
                            ])
                        ])
                    }
                </Animated.Code>
                {this.props.children}
            </Animated.View>
        );
    }
}

const BOX_SIZE = 100;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    box: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        borderColor: '#F5FCFF',
        alignSelf: 'center',
        backgroundColor: 'plum',
        margin: BOX_SIZE / 2
    }
});
