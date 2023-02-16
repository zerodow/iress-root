import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { getInitValueTranslateX, getInitValueTranslateY, getInitValueOpacity, delay } from './common'
const { height: heightDevices, width: widthDevices } = Dimensions.get('window');
export const ENUM = {
    SLIDE_IN_UP: 'SLIDE_IN_UP',
    SLIDE_IN_DOWN: 'SLIDE_IN_DOWN',
    SLIDE_IN_LEFT: 'SLIDE_IN_LEFT',
    SLIDE_IN_RIGHT: 'SLIDE_IN_RIGHT',
    FADE_IN: 'FADE_IN',
    FADE_OUT: 'FADE_OUT',
    SLIDE_OUT_DOWN: 'SLIDE_OUT_DOWN'
};
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
    not,
    interpolate,
    Extrapolate,
    neq,
    and
} = Animated;
export const TYPE = {
    SLIDE_IN_LEFT: new Value(0),
    SLIDE_IN_RIGHT: new Value(1),
    SLIDE_IN_DOWN: new Value(2),
    SLIDE_IN_UP: new Value(3),
    FADE_IN: new Value(4),
    FADE_OUT: new Value(5),
    SLIDE_OUT_DOWN: new Value(6)
}
class AnimtedCode extends PureComponent {
    render() {
        return (
            <Animated.Code exec={block([this.props.withRunAnimation(), this.props.withInterpolate()])} />
        )
    }
}
const DURATION = 500
export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.clock = new Clock();
        this.config = {
            duration: DURATION,
            toValue: new Value(0),
            easing: Easing.linear
        };
        this.animationState = {
            finished: new Value(0),
            position: new Value(0),
            time: new Value(0),
            frameTime: new Value(0)
        };
        this.stateRunAni = new Value(0);
        this.animatedVal = new Value(0);
        this.delay = new Value(this.props.index ? this.getDelay2() : 0);
        this.stateRunDelay = new Value(1);
        this.state = {
            type: this.props.type
        };

        this.type = this.mapToType()
        this.preType = new Value()
        // Out put interpolate transilateX
        this.leftTranslateX = new Value(0)
        this.rightTranslateX = new Value(0)
        // Out put interpolate transilateY
        this.leftTranslateY = new Value(0)
        this.rightTranslateY = new Value(0)
        // Out put interpolate opacity
        this.leftOpacity = getInitValueOpacity('left', this.props.type)
        this.rightOpacity = getInitValueOpacity('right', this.props.type)
        this.refTest = null
    }
    mapToType = () => {
        switch (this.props.type) {
            case ENUM.SLIDE_IN_LEFT:
                return new Value(0)
            case ENUM.SLIDE_IN_RIGHT:
                return new Value(1)
            case ENUM.SLIDE_IN_DOWN:
                return new Value(2)
            case ENUM.SLIDE_IN_UP:
                return new Value(3)
            case ENUM.FADE_IN:
                return new Value(4)
            case ENUM.FADE_OUT:
                return new Value(5)
            default:
                return new Value(1)
                break;
        }
    }
    getDelay = () => {
        const index = this.props.index || 0;
        if (this.props.index > 15) return 0
        return 100 + (index * 500) / 5;
    };
    getDelay2 = () => {
        const { totalItem, totalTime, index } = this.props
        if (!totalItem || !totalTime) return this.getDelay()
        const deltal = (totalTime - DURATION) / totalItem
        return index * deltal
    }
    callBackDone = this.callBackDone.bind(this)
    callBackDone() {
        this.props.onDone && this.props.onDone()
        this.done && this.done()
    }
    resetOpacity = () => {
        return block([
            cond(eq(this.type, TYPE.FADE_IN), [
                set(this.leftOpacity, 0),
                set(this.rightOpacity, 1)
            ]),
            cond(eq(this.type, TYPE.FADE_OUT), [
                set(this.leftOpacity, 1),
                set(this.rightOpacity, 0)
            ]),
            cond(and(neq(this.type, TYPE.FADE_IN), neq(this.type, TYPE.FADE_OUT)), [
                set(this.leftOpacity, 1),
                set(this.rightOpacity, 1)
            ])
        ])
    }
    runTiming = (value, toValue, type = new Value()) => {
        const reset = [
            set(this.animationState.finished, 0),
            set(this.animationState.time, 0),
            set(this.animationState.frameTime, 0)
        ];
        const resetOutPutInterpolate = [
            this.resetOpacity(),
            set(this.leftTranslateX, 0),
            set(this.rightTranslateX, 0),
            set(this.leftTranslateY, 0),
            set(this.rightTranslateY, 0)
        ]
        const cb = this.callBackDone
        let currentType = new Value(type._value)
        return block([
            cond(clockRunning(this.clock), [
                cond(neq(currentType, this.type), [
                    // Neu clock is running and change type then reset and start clock tu dau chu ko tiep tuc chay tu luc reset
                    stopClock(this.clock),
                    ...reset,
                    ...resetOutPutInterpolate,
                    set(this.config.toValue, toValue),
                    set(this.animationState.position, value),
                    set(currentType, this.type),
                    startClock(this.clock)
                ], [])
            ], [
                // Neu Clock not running. Reset state and set Config value
                ...reset,
                ...resetOutPutInterpolate,
                set(this.config.toValue, toValue),
                set(this.animationState.position, value),
                set(currentType, this.type),
                startClock(this.clock)
            ]),
            timing(this.clock, this.animationState, this.config),
            cond(this.animationState.finished, [
                stopClock(this.clock),
                set(this.stateRunAni, 0),
                call([], () => {
                    cb && cb()
                })
            ]),
            this.animationState.position
        ]);
    };
    getTransXInterpolate = () => {
        return interpolate(this.animatedVal, {
            inputRange: [0, 1],
            outputRange: [this.leftTranslateX, this.rightTranslateX],
            extrapolate: Extrapolate.CLAMP
        })
    };
    getTransYInterpolate = () => {
        return interpolate(this.animatedVal, {
            inputRange: [0, 1],
            outputRange: [this.leftTranslateY, this.rightTranslateY],
            extrapolate: Extrapolate.CLAMP
        })
    };
    getOpacityInterpolate = () => {
        return interpolate(this.animatedVal, {
            inputRange: [0, 1],
            outputRange: [this.leftOpacity, this.rightOpacity],
            extrapolate: Extrapolate.CLAMP
        })
    };
    // action slide
    // 1.Slide up
    slideInDown = this.slideInDown.bind(this);
    slideInDown() {
        this.animatedVal.setValue(0);
        this.stateRunDelay.setValue(1);
        this.setState({
            type: ENUM.SLIDE_IN_DOWN
        });
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    slideInRight = () => {
        this.animatedVal.setValue(0);
        this.type.setValue(1)
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    slideInLeft = () => {
        this.animatedVal.setValue(0);
        this.type.setValue(0)
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    slideInUp = () => {
        this.animatedVal.setValue(0);
        this.type.setValue(3)
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    slideInDown = () => {
        this.animatedVal.setValue(0);
        this.type.setValue(2)
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    // 2.Fade
    fadeIn = this.fadeIn.bind(this);
    fadeIn() {
        this.animatedVal.setValue(0);
        this.type.setValue(4)
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    fadeOut = this.fadeOut.bind(this);
    fadeOut() {
        this.animatedVal.setValue(0);
        this.type.setValue(5)
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    resetTranslateValue = () => {
        this.leftTranslateX.setValue(0)
        this.rightTranslateX.setValue(0)
        this.leftTranslateY.setValue(0)
        this.rightTranslateY.setValue(0)
    }
    resetOpacityValue = () => {
        this.leftOpacity.setValue(1)
        this.rightOpacity.setValue(1)
    }
    resetValue = (type) => {
        switch (type) {
            case ENUM.SLIDE_IN_LEFT:
                this.resetOpacity()
                break
            case ENUM.SLIDE_IN_RIGHT:
                this.resetOpacity()
                break
            case ENUM.SLIDE_IN_DOWN:
                this.resetOpacity()
                break
            case ENUM.SLIDE_IN_UP:
                this.resetOpacity()
                break
            case ENUM.FADE_IN:
                this.resetTranslateValue()
                break
            case ENUM.FADE_OUT:
                this.resetTranslateValue()
                break
            default:
        }
    }
    convertType = (type) => {
        switch (type) {
            case ENUM.SLIDE_IN_LEFT:
                return TYPE.SLIDE_IN_LEFT
            case ENUM.SLIDE_IN_RIGHT:
                return TYPE.SLIDE_IN_RIGHT
            case ENUM.SLIDE_IN_DOWN:
                return TYPE.SLIDE_IN_DOWN
            case ENUM.SLIDE_IN_UP:
                return TYPE.SLIDE_IN_UP
            case ENUM.FADE_IN:
                return TYPE.FADE_IN
            case ENUM.FADE_OUT:
                return TYPE.FADE_OUT
            case ENUM.SLIDE_OUT_DOWN:
                return TYPE.SLIDE_OUT_DOWN
            default:
                return new Value(1)
                break;
        }
    }
    animate = this.animate.bind(this);
    animate({ type, duration }) {
        this.resetValue(type)
        this.animatedVal.setValue(0);
        this.type.setValue(this.convertType(type))
        this.stateRunDelay.setValue(1);
        return new Promise(resolve => {
            this.done = () => {
                resolve()
            }
        })
    }
    withRunAnimation = () => {
        return block([
            cond(eq(this.stateRunDelay, 1), [
                delay([
                    set(this.stateRunAni, new Value(1))
                ], this.delay)
            ]),
            cond(
                eq(this.stateRunAni, new Value(1)),
                [
                    set(this.animatedVal, this.runTiming(this.animatedVal, new Value(1), this.type)),
                    set(this.stateRunDelay, 0)
                ],
                []
            )
        ]);
    };
    setInterpolateTranslateX = () => {
        return block([
            cond(eq(this.type, TYPE.SLIDE_IN_LEFT), [
                set(this.leftTranslateX, -widthDevices),
                set(this.rightTranslateX, 0)
            ]),
            cond(eq(this.type, TYPE.SLIDE_IN_RIGHT), [
                set(this.leftTranslateX, widthDevices),
                set(this.rightTranslateX, 0)
            ])
        ])
    }
    setInterpolateTranslateY = () => {
        return block([
            cond(eq(this.type, TYPE.SLIDE_IN_DOWN), [
                set(this.leftTranslateY, -heightDevices),
                set(this.rightTranslateY, 0)
            ]),
            cond(eq(this.type, TYPE.SLIDE_IN_UP), [
                set(this.leftTranslateY, heightDevices),
                set(this.rightTranslateY, 0)
            ]),
            cond(eq(this.type, TYPE.SLIDE_OUT_DOWN), [
                set(this.leftTranslateY, 0),
                set(this.rightTranslateY, heightDevices)
            ])
        ])
    }
    setInterpolateOpacity = () => {
        return block([
            cond(eq(this.type, TYPE.FADE_IN), [
                set(this.leftOpacity, 0),
                set(this.rightOpacity, 1)
            ]),
            cond(eq(this.type, TYPE.FADE_OUT), [
                set(this.leftOpacity, 1),
                set(this.rightOpacity, 0)
            ])
        ])
    }
    withInterpolate = () => {
        return block([
            this.setInterpolateTranslateX(),
            this.setInterpolateTranslateY(),
            this.setInterpolateOpacity()
        ])
    }

    render() {
        const translateX = this.getTransXInterpolate();
        const translateY = this.getTransYInterpolate();
        const opacity = this.getOpacityInterpolate();
        return (
            <View pointerEvents={'box-none'} style={[this.props.style, { overflow: 'hidden' }, this.props.forceStyle]}>
                <Animated.View
                    pointerEvents={'box-none'}
                    style={[
                        { flex: 1 },
                        this.props.styleContent,
                        {

                            transform: [
                                {
                                    translateX: translateX,
                                    translateY: translateY
                                }
                            ],
                            opacity: opacity
                        }
                    ]}>
                    {this.props.children}
                    <AnimtedCode withInterpolate={this.withInterpolate} withRunAnimation={this.withRunAnimation} />
                </Animated.View>
            </View>

        );
    }
}
