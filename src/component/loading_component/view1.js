import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput
} from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
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
    eq,
    divide,
    concat,
    call,
    not,
    Extrapolate,
    color
} = Animated;
class HandleAnimation extends PureComponent {
    render() {
        return (
            <Animated.Code
                exec={block([
                    cond(
                        eq(this.props.stateLoading, new Value(1)),
                        [
                            // loading true
                            set(
                                this.props.loadingVal,
                                this.props.runTiming(this.props.loadingVal, new Value(1))
                            )
                        ],
                        [
                            set(
                                this.props.loadingVal,
                                this.props.runTiming(this.props.loadingVal, new Value(0))
                            )
                        ]
                    )
                ])}
            />
        );
    }
}

export default class ViewLoading extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.loadingVal = new Value(0);
        this.stateLoading = new Value(0);
        this.clock = new Clock();
        this.config = {
            duration: 200,
            toValue: new Value(0),
            easing: Easing.inOut(Easing.ease)
        };
        this.stateAni = {
            finished: new Value(0),
            position: new Value(0),
            time: new Value(0),
            frameTime: new Value(0)
        };
    }
    createTiming = (value, dest) => {
        return block([
            cond(
                clockRunning(this.clock),
                [
                    cond(
                        eq(this.config.toValue, dest),
                        [],
                        [
                            stopClock(this.clock),
                            set(this.stateAni.finished, 0),
                            set(this.stateAni.time, 0),
                            set(this.stateAni.position, value),
                            set(this.stateAni.frameTime, 0),
                            set(this.config.toValue, dest),
                            startClock(this.clock)
                        ]
                    )
                ],
                [
                    set(this.stateAni.finished, 0),
                    set(this.stateAni.time, 0),
                    set(this.stateAni.position, value),
                    set(this.stateAni.frameTime, 0),
                    set(this.config.toValue, dest),
                    startClock(this.clock)
                ]
            ),
            timing(this.clock, this.stateAni, this.config),
            cond(this.stateAni.finished, debug('stop clock', stopClock(this.clock))),
            this.stateAni.position
        ]);
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoading && this.props.isLoading !== nextProps.isLoading) {
            this.stateLoading.setValue(1);
        }
        if (!nextProps.isLoading && this.props.isLoading !== nextProps.isLoading) {
            setTimeout(() => {
                this.stateLoading.setValue(0);
            }, 100);
        }
    }

    render() {
        const backgroundColor = color(
            255,
            255,
            255,
            Animated.interpolate(this.loadingVal, {
                inputRange: [0, 1],
                outputRange: [0, 0.3]
            })
        );
        const opacity = Animated.interpolate(this.loadingVal, {
            inputRange: [0, 1],
            outputRange: [1, 0]
        });
        return (
            <Animated.View
                style={[{ backgroundColor: backgroundColor, borderRadius: 4 }, this.props.styleContainer]}
            >
                <Animated.View style={[{ opacity: opacity }, this.props.style]}>
                    {this.props.children}
                </Animated.View>
                <HandleAnimation
                    clock={this.clock}
                    stateLoading={this.stateLoading}
                    loadingVal={this.loadingVal}
                    runTiming={this.createTiming}
                />
            </Animated.View>
        );
    }
}
const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center'
    },
    buttom: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: 'red',
        alignSelf: 'center',
        marginTop: 100
    }
})
