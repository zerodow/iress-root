import React, { Component } from 'react';
import { View, Text, KeyboardAvoidingView, TextInput, Keyboard, Platform, Animated, StyleSheet } from 'react-native';
export default class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.heightSpace = new Animated.Value(0)
    }
    componentWillMount() {
        const showListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(showListener, this.handleKeyboardShow),
            Keyboard.addListener(hideListener, this.handleKeyboardHide)
        ];
    }
    handleKeyboardShow = (e) => {
        const keyboardHeight = e.endCoordinates.height || 0;
        if (Platform.OS === 'android') return
        Animated.timing(this.heightSpace, {
            toValue: keyboardHeight,
            duration: 300
        }).start()
    }
    handleKeyboardHide = () => {
        Animated.timing(this.heightSpace, {
            toValue: 0,
            duration: 300
        }).start()
    }
    componentWillUnmount() {
        this._listeners.forEach(listener => listener.remove());
    }
    render() {
        return (
            <View style={[{ flex: 1 }, this.props.style]}>
                <View onMoveShouldSetResponder={Keyboard.dismiss} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    {this.props.children}
                </View>
                <Animated.View style={{ height: this.heightSpace }}>

                </Animated.View>
            </View>
        );
    }
}
