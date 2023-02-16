import React, { PureComponent } from 'react';
import Animated, { Easing } from 'react-native-reanimated';
import uuid from 'react-native-uuid';

const {
    and,
    Clock,
    Value,
    block,
    call,
    cond,
    set,
    startClock,
    stopClock,
    timing,
    eq,
    neq,
    Code
} = Animated;

export const STATE = {
    UNDETERMINED: 0,
    BEGAN: 1,
    ACTIVE: 2,
    END: 3,
    REVERSE: 5,
    CANCELLED: 4,
    STOP: 6,
    RESET: 5
};

export const TRIGGER = {
    START: 1,
    STOP: 2,
    REVERSE: 3,
    CANCELLED: 4,
    RESET: 5
};

const handleOnce = ({
    state,
    c, // cond
    b // block
}) => {
    const once = new Value(1);
    return block([
        cond(and(eq(state, c), once), [b, set(once, 0)]),
        cond(neq(state, c), set(once, 1))
    ]);
};

export default class Animations extends PureComponent {
    constructor(props) {
        super(props);
        this.id = uuid.v4();

        this._state = new Value(STATE.UNDETERMINED);

        this._animations = this.createAnimatations(props.animations);
    }

    componentDidMount() {
        if (this.props.startAtFirst) {
            this.trigger(TRIGGER.START);
        }
    }

    callBack = this.callBack.bind(this);
    callBack() {
        if (this.props.onEnd) {
            this.props.onEnd();
        }
    }

    trigger = this.trigger.bind(this);
    trigger(type) {
        switch (type) {
            case TRIGGER.START:
                this._state.setValue(STATE.BEGAN);
                break;
            case TRIGGER.REVERSE:
                this._state.setValue(STATE.REVERSE);
                break;
            case TRIGGER.STOP:
                this._state.setValue(STATE.STOP);
                break;
            case TRIGGER.CANCELLED:
                this._state.setValue(STATE.CANCELLED);
                break;
            case TRIGGER.RESET:
                this._state.setValue(STATE.RESET);
                break;
            default:
                break;
        }
    }

    createAnimatations(type) {
        switch (type) {
            case 'timing':
                return this.createTiming();
            default:
        }
    }

    createTiming() {
        const {
            duration,
            _value: value,
            easing,
            start,
            end,
            initValue
        } = this.props;

        const startValue = start || 0;
        const endValue = end || duration;

        const _value = new Value(initValue || startValue);
        const _easing = easing || Easing.linear;
        const _clock = new Clock();

        const state = {
            finished: new Value(0),
            position: _value,
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: duration,
            toValue: new Value(endValue),
            easing: _easing
        };

        const reset = [
            set(state.finished, 0),
            set(state.time, 0),
            set(state.frameTime, 0)
        ];

        return block([
            handleOnce({
                state: this._state,
                c: STATE.BEGAN,
                b: [...reset, set(config.toValue, endValue), startClock(_clock)]
            }),
            handleOnce({
                state: this._state,
                c: STATE.REVERSE,
                b: [
                    ...reset,
                    set(config.toValue, startValue),
                    startClock(_clock)
                ]
            }),

            handleOnce({
                state: this._state,
                c: STATE.CANCELLED,
                b: set(state.finished, 1)
            }),
            handleOnce({
                state: this._state,
                c: STATE.STOP,
                b: [set(state.finished, 1), set(state.position, config.toValue)]
            }),
            handleOnce({
                state: this._state,
                c: STATE.RESET,
                b: [set(state.finished, 1), set(state.position, startValue)]
            }),

            timing(_clock, state, config),
            cond(state.finished, [
                stopClock(_clock),
                call([], this.callBack),
                set(this._state, STATE.END)
            ]),

            set(value, state.position),

            state.position
        ]);
    }

    render() {
        if (!this._animations) return null;
        return <Code exec={this._animations} key={this.id} />;
    }
}

Animations.defaultProps = {
    animations: 'timing',
    duration: 1000
};
