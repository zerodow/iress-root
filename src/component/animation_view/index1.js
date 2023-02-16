import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
const { height: heightDevices, width: widthDevices } = Dimensions.get('window')
const {
    set,
    cond,
    startClock,
    stopClock,
    clockRunning,
    block,
    timing,
    debug,
    Value,
    Clock,
    divide,
    concat,
    call,
    eq,
    interpolate,
    Extrapolate
} = Animated;

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.clock = new Clock()
        this.config = {
            duration: 500,
            toValue: new Value(0),
            easing: Easing.inOut(Easing.ease)
        }
        this.animationState = {
            finished: new Value(0),
            position: new Value(0),
            time: new Value(0),
            frameTime: new Value(0)
        }
        this.stateRunAni = new Value(0)
        this.translateY = this.runTiming(new Value(heightDevices + 100), new Value(0))
    }
    componentWillMount() {
        // this.transY = this.runTiming(new Value(0), new Value(1))
    }
    runTiming = (value, toValue) => {
        const onDone = this.props
        const reset = [
            set(this.animationState.finished, 0),
            set(this.animationState.time, 0),
            set(this.animationState.frameTime, 0)
        ]
        return block([
            cond(clockRunning(this.clock), 0, [
                // Neu Clock not running. Reset state and set Config value
                ...reset,
                set(this.config.toValue, toValue),
                set(this.animationState.position, value),
                startClock(this.clock)
            ]),
            timing(this.clock, this.animationState, this.config),
            cond(this.animationState.finished, [
                stopClock(this.clock),
                call([], () => {
                    this.endAnimation()
                })
            ]),
            this.animationState.position
        ])
    }
    endAnimation = () => {
        console.log('DCM time open new order3', new Date().getSeconds())
    }
    hide = this.hide.bind(this)
    hide() {
        this.translateY = this.runTiming(this.translateY, new Value(heightDevices + 100))
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Animated.View style={{
                    flex: 1,
                    transform: [
                        {
                            translateY: this.translateY
                        }
                    ]
                }}>
                    {this.props.children}
                </Animated.View>
                {/* <Animated.Code
                    exec={block([
                        cond(
                            eq(this.stateRunAni, new Value(1)),
                            [
                                // loading true
                                set(
                                    this.animatedVal,
                                    this.runTiming(this.animatedVal, new Value(1))
                                )
                            ],
                            [

                            ]
                        )
                    ])}
                /> */}
            </View>
        );
    }
}
