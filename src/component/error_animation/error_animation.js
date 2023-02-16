import React, { Component } from 'react';
import {
    View,
    Animated,
    Text
} from 'react-native';
import { declareAnimation } from '../../lib/base/functionUtil'

export default class ErrorAnimation extends Component {
    constructor(props) {
        super(props);

        this.error = ''
        this.timeoutHideError = null;
        this.heightError = 0
        this.heightAnimation = new Animated.Value(0)

        this.state = {
            isExpand: false
        }

        this.hideError = this.hideError.bind(this)
        this.getHeightAnimatedView = this.getHeightAnimatedView.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isExpand !== this.state.isExpand) {
            this.setState({
                isExpand: nextProps.isExpand
            })
        }
    }

    getHeightAnimatedView(event) {
        const { height } = event.nativeEvent.layout;
        if (height === 0) return;
        Animated.timing(
            this.heightAnimation,
            {
                toValue: height,
                duration: this.props.duration || 0
            }
        ).start();

        const timeOutErrorHidden = this.props.timeOutErrorHidden || 2000
        this.hideError(timeOutErrorHidden)
    }

    hideError(timeOutErrorHidden) {
        this.timeoutHideError && clearTimeout(this.timeoutHideError)
        this.timeoutHideError = setTimeout(() => {
            declareAnimation(
                this.heightAnimation,
                0,
                this.props.duration || 0
            ).start(() => {
                this.props.callbackHideError && this.props.callbackHideError('')
            });
        }, timeOutErrorHidden)
    }

    render() {
        const { textStyle } = this.props
        const errorStyle = !this.state.isExpand
            ? {}
            : [
                this.props.errorStyle,
                {
                    height: this.heightAnimation,
                    overflow: 'scroll'
                }]
        return (
            <Animated.View style={errorStyle}>
                <View onLayout={event => {
                    this.getHeightAnimatedView(event);
                }}>
                    {
                        this.state.isExpand
                            ? <Text style={textStyle}>{this.props.errorText}</Text>
                            : <View />
                    }
                </View>
            </Animated.View >
        )
    }
}
