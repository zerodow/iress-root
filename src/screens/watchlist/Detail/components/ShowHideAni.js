import React, { Component } from 'react'
import Animated, { Easing } from 'react-native-reanimated'

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
    not,
    eq,
    and,
    call
} = Animated;

const STATE = {
    UNDETERMINED: 0,
    SHOW: 1,
    HIDE: 2
}

export default class ShowHideAni extends Component {
    constructor(props) {
        super(props);
        this._aniState = new Value(STATE.UNDETERMINED)
        this.timingClock = new Clock()
        this.stateTiming = {
            finished: new Value(0),
            position: new Value(props.initValue || 0),
            time: new Value(0),
            frameTime: new Value(0)
        };
        this.configTiming = {
            duration: new Value(100),
            toValue: new Value(0),
            easing: Easing.linear
        };

        this._trans = new Value(0)
        this._opa = new Value(props.initValue || 0)
    }
    show() {
        this._aniState.setValue(STATE.SHOW)
    }
    hide() {
        this._aniState.setValue(STATE.HIDE)
    }

    createTiming(value) {
        return cond(
            clockRunning(this.timingClock),
            [
                // if the clock is already running we update the toValue, in case a new dest has been passed in
                set(this.stateTiming.finished, 0),
                set(this.stateTiming.frameTime, 0),
                set(this.stateTiming.time, 0),
                set(this.configTiming.toValue, value)
            ],
            [
                // if the clock isn't running we reset all the animation params and start the clock
                set(this.stateTiming.finished, 0),
                set(this.stateTiming.time, 0),
                // set(this.stateTiming.position, this.translateY),
                set(this.stateTiming.frameTime, 0),
                set(this.configTiming.toValue, value),
                startClock(this.timingClock)
            ]
        )
    }

    render() {
        const { isShow, isHide, style, withTrans } = this.props
        return (
            <Animated.View style={[
                style,
                {
                    transform: [{ translateY: this._trans }],
                    opacity: this._opa
                }
            ]}>
                <Animated.Code exec={
                    block([
                        cond(
                            and(
                                isShow,
                                not(eq(this._aniState, STATE.SHOW))
                            ),
                            [
                                set(this._aniState, STATE.SHOW),
                                this.createTiming(1),
                                set(this._trans, 0)
                            ]
                        ),
                        cond(
                            and(
                                isHide,
                                not(eq(this._aniState, STATE.HIDE))
                            ),
                            [
                                set(this._aniState, STATE.HIDE),
                                this.createTiming(0)
                            ]
                        ),
                        timing(this.timingClock, this.stateTiming, this.configTiming),
                        cond(this.stateTiming.finished, [
                            stopClock(this.timingClock),
                            withTrans ? cond(isHide, set(this._trans, withTrans)) : []
                        ]),
                        set(this._opa, this.stateTiming.position)
                    ])
                } />
                {this.props.children}
            </Animated.View >
        )
    }
}
