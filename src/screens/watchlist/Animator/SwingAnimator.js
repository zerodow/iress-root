
import React, { Component } from 'react'
import Animation, { Easing } from 'react-native-reanimated'
const { block, cond, and, Value, Clock, set, eq, timing, concat, clockRunning, startClock } = Animation

export default class SwingAnimator extends Component {
    getAniStyles() {
        const clock = new Clock()
        const baseValue = 0
        const value = 0.3;
        const duration = 300

        const state = {
            finished: new Value(1),
            position: new Value(baseValue),
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: duration / 2,
            toValue: new Value(0),
            easing: Easing.linear
        };

        const reset = [
            set(state.finished, 0),
            set(state.time, 0),
            set(state.frameTime, 0)
        ];

        const rotate = block([
            cond(and(state.finished, eq(state.position, baseValue)), [
                ...reset,
                set(config.duration, duration / 2),
                set(config.toValue, value)
            ]),
            cond(and(state.finished, eq(state.position, value)), [
                ...reset,
                set(config.duration, duration),
                set(config.toValue, -value)
            ]),
            cond(and(state.finished, eq(state.position, -value)), [
                ...reset,
                set(config.duration, duration),
                set(config.toValue, value)
            ]),
            cond(clockRunning(clock), 0, startClock(clock)),
            timing(clock, state, config),
            concat(state.position, 'deg')
        ]);
        return ({
            transform: [{ rotate }]
        })
    }

    render() {
        return (
            <Animation.View {...this.props} style={[...this.props.style, this.getAniStyles()]} />
        )
    }
}
