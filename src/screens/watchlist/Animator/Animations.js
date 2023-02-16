import React, { PureComponent } from 'react';
import Animated, { Easing } from 'react-native-reanimated';
import uuid from 'react-native-uuid';

const {
    and,
    Clock,
    Value,
    block,
    call,
    clockRunning,
    cond,
    greaterThan,
    lessOrEq,
    set,
    startClock,
    stopClock,
    timing,
    onChange,
    sub,
    add,
    eq,
    Code
} = Animated;

export const STATE = {
    UNDETERMINED: 0,
    BEGAN: 1,
    ACTIVE: 2,
    END: 3,
    REVERSE: 5,
    CANCELLED: 4,
    RESET: 6
};

export default class Animations extends PureComponent {
    constructor(props) {
        super(props);
        this.id = uuid.v4();

        const { duration, animations, value, easing, callback } = props;
        const _value = new Value(0);
        const _easing = easing || Easing.linear;
        const _clock = new Clock();

        this._state = new Value(STATE.END);

        if (animations === 'timing') {
            const state = {
                finished: new Value(0),
                position: _value,
                time: new Value(0),
                frameTime: new Value(0)
            };

            const config = {
                duration: duration,
                toValue: new Value(duration),
                easing: _easing
            };

            const reset = [
                set(state.finished, 0),
                set(state.time, 0),
                set(state.frameTime, 0)
            ];

            this._animations = block([
                cond(eq(this._state, STATE.BEGAN), [
                    set(this._state, STATE.ACTIVE),
                    ...reset,
                    set(state.position, 0),
                    set(config.toValue, duration),
                    startClock(_clock)
                ]),
                cond(eq(this._state, STATE.REVERSE), [
                    set(this._state, STATE.ACTIVE),
                    ...reset,
                    set(config.toValue, 0),
                    startClock(_clock)
                ]),

                cond(eq(this._state, STATE.CANCELLED), set(state.finished, 1)),
                cond(eq(this._state, STATE.RESET), [
                    ...reset,
                    set(state.finished, 1),
                    set(state.position, 0)
                ]),

                // we run the step here that is going to update position
                timing(_clock, state, config),
                // if the animation is over we stop the clock
                cond(state.finished, [
                    stopClock(_clock),
                    call([], this.callBack),
                    set(this._state, STATE.END)
                ]),

                set(value, state.position),
                // we made the block return the updated position
                state.position
            ]);
        }
    }

    callBack = this.callBack.bind(this);
    callBack() {
        if (this.props.onEnd) {
            this.props.onEnd();
        }
    }

    start = this.start.bind(this);
    start() {
        this._state.setValue(STATE.BEGAN);
    }

    reverse = this.reverse.bind(this);
    reverse() {
        this._state.setValue(STATE.REVERSE);
    }

    stop = this.stop.bind(this);
    stop() {
        this._state.setValue(STATE.CANCELLED);
    }

    reset = this.reset.bind(this);
    reset() {
        this._state.setValue(STATE.RESET);
    }

    render() {
        return <Code exec={this._animations} key={this.id} />;
    }
}

Animations.defaultProps = {
    animations: 'timing',
    duration: 1000
};
