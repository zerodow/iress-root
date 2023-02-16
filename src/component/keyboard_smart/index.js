import React, { Component } from 'react';
import { View, Text, Keyboard, TextInput, Platform, Dimensions, StatusBar } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
const {
    Value,
    add,
    cond,
    diff,
    divide,
    eq,
    event,
    min,
    lessThan,
    and,
    block,
    multiply,
    set,
    abs,
    clockRunning,
    greaterThan,
    startClock,
    stopClock,
    sub,
    Clock,
    decay,
    timing,
    call,
    debug,
    or,
    not,
    neq } = Animated
const STATE_KEYBOARD = {
    SHOW: new Value(1),
    HIDE: new Value(0)
}
const { height: heightDevices } = Dimensions.get('window')

function runTiming(clock, value, dest) {
    const state = {
        finished: new Value(0),
        position: value,
        time: new Value(0),
        frameTime: new Value(0)
    };

    const config = {
        duration: 1000,
        toValue: dest,
        easing: Easing.inOut(Easing.ease)
    };

    return block([
        cond(clockRunning(clock), 0, [
            // If the clock isn't running we reset all the animation params and start the clock
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
        // cond(state.finished, debug('stop clock', stopClock(clock))),
        // we made the block return the updated position
        state.position
    ]);
}
export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.translateY = new Value(0)
        this.eventKeyboard = null
        this.handleKeyboardShow = this.handleKeyboardShow.bind(this);
        this.handleKeyboardHide = this.handleKeyboardHide.bind(this);
        this._scrollContentValue = this.props._scrollContentValue
        this.isUpdate = new Value(0)
        this.isKeyboardShow = new Value(0)
        this.timingClock = new Clock()
        this.clock = new Clock()
        this.needTransLateY = new Value(0) // value tinh toan do lenh vs keyboard
        this.destinationValue = new Value(0) // Value sau khi tinh toan cong tru
        this.stateAni = {
            finished: new Value(0),
            position: new Value(0),
            time: new Value(0),
            frameTime: new Value(0)
        };
        this.clock = new Clock();
        this.config = {
            duration: 200,
            toValue: new Value(0),
            easing: Easing.inOut(Easing.ease)
        };
    }
    createTiming = (value, dest, cb) => {
        return block([
            cond(
                clockRunning(this.clock),
                [
                    // cond(
                    //     eq(this.config.toValue, dest),
                    //     [],
                    //     [
                    //         stopClock(this.clock),
                    //         set(this.stateAni.finished, 0),
                    //         set(this.stateAni.time, 0),
                    //         set(this.stateAni.position, value),
                    //         set(this.stateAni.frameTime, 0),
                    //         set(this.config.toValue, dest),
                    //         startClock(this.clock)
                    //     ]
                    // )
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
            cond(this.stateAni.finished, [
                stopClock(this.clock),
                call([], () => {
                    cb && cb()
                })
            ]),
            this.stateAni.position
        ]);
    };
    componentDidMount() {
        const showListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(showListener, this.handleKeyboardShow),
            Keyboard.addListener(hideListener, this.handleKeyboardHide)
        ];
    }
    handleKeyboardShow(event) {
        this.eventKeyboard = event
        this.isShowKeyBoard = true
    }
    handleUpdateLayout = this.handleUpdateLayout.bind(this)
    handleUpdateLayout(pageYTextInput = 0, heightTextInput = 0) {
        setTimeout(() => {
            if (!this.eventKeyboard) {
                console.log('DCM handleUpdateLayout chua lay duoc keyboard')
                return
            }
            let { screenY: pageYKeyBoard } = this.eventKeyboard && this.eventKeyboard.endCoordinates
            const heightStatusBar = Platform.OS === 'android' ? StatusBar.currentHeight : 0
            pageYKeyBoard = pageYKeyBoard - heightStatusBar
            console.log('DCM handleUpdateLayout pageYTextInput', pageYTextInput)
            console.log('DCM handleUpdateLayout heightTextInput', heightTextInput)
            console.log('DCM handleUpdateLayout pageYKeyBoard', pageYKeyBoard)
            let transY = 0
            if (pageYTextInput + heightTextInput < pageYKeyBoard - heightStatusBar) return
            transY = pageYTextInput - pageYKeyBoard + heightTextInput + 16
            console.log('DCM handleUpdateLayout transY', transY)
            this.isHandleUpdateWhenHide = true
            this.transY = transY
            this.needTransLateY.setValue(transY)
            this.isUpdate.setValue(1)
            this.isKeyboardShow.setValue(1)
        }, 300);
    }
    handleKeyboardHide(event) {
        this.isShowKeyBoard = false
        if (!this.isHandleUpdateWhenHide) return
        this.isUpdate.setValue(1)
        this.isKeyboardShow.setValue(0)
        this.isHandleUpdateWhenHide = false
    }
    componentWillUnmount() {
        this._listeners.forEach(listener => listener.remove());
    }
    callBackShow = () => {
        this.isUpdate.setValue(0)
    }
    callBackHide = () => {
        this.isUpdate.setValue(0)
        this.needTransLateY.setValue(0)
        this.destinationValue.setValue(0)
    }
    updateLayout = () => {
        return [
            cond(
                eq(this.isUpdate, STATE_KEYBOARD.SHOW),
                cond(eq(this.isKeyboardShow, STATE_KEYBOARD.HIDE),
                    [
                        set(this.destinationValue, add(this._scrollContentValue, this.needTransLateY)),
                        // runTiming(this.clock, this._scrollContentValue, this.destinationValue),
                        set(this._scrollContentValue, this.createTiming(this._scrollContentValue, this.destinationValue, this.callBackHide))
                    ],
                    [
                        // set(this.isUpdate, new Value(0)),
                        set(this.destinationValue, sub(this._scrollContentValue, this.needTransLateY)),
                        set(this._scrollContentValue, this.createTiming(this._scrollContentValue, this.destinationValue, this.callBackShow))
                        // runTiming(this.clock, this._scrollContentValue, this.destinationValue)
                    ]
                ),
                []
            )
        ]
    }
    render() {
        return (
            <Animated.View
                style={[
                    { flex: 1 },
                    this.props.style
                ]}
                {...this.props}
                // onMoveShouldSetResponder={Keyboard.dismiss}
                onMoveShouldSetResponderCapture={
                    () => {
                        if (this.isShowKeyBoard) {
                            setTimeout(() => {
                                Keyboard.dismiss()
                            }, 200);
                        }
                        return false
                    }
                }
            >
                {this.props.children}
                <Animated.Code
                    exec={block([
                        this.updateLayout()
                    ])}
                />
            </Animated.View>
        );
    }
}
