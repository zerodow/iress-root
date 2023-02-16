import React, { Component } from 'react'
import { View, Text, Animated } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter';
import PropTypes from 'prop-types';
import Enum from '../../enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent';

const PTC_CHANNEL = Enum.PTC_CHANNEL;
const TREND_VALUE = Enum.TREND_VALUE;

export default class XFlash extends XComponent {
    static propTypes = {
        colorUp: PropTypes.string,
        colorDown: PropTypes.string,
        value: PropTypes.string,
        trend: PropTypes.oneOf([TREND_VALUE.DOWN, TREND_VALUE.UP, TREND_VALUE.NONE]),
        style: PropTypes.object,
        styleText: PropTypes.object
    };

    init() {
        this.dic = {
            opacityFadeOut: new Animated.Value(1),
            opacityFadeIn: new Animated.Value(0),
            timeFlashing: this.props.timeFlashing || Enum.TIME_FLASHING,
            trend: this.props.trend || TREND_VALUE.UP,
            color: null,
            style: this.props.style || {},
            styleText: this.props.styleText || {}
        }
        this.changeColor()
    }

    componentDidMount() {
        super.componentDidMount()
        this.startFlashing()
    }

    componentDidUpdate() {
        this.startFlashing()
    }

    changeColor() {
        switch (this.dic.trend) {
            case TREND_VALUE.UP:
                this.dic.color = this.props.colorUp
                break
            case TREND_VALUE.DOWN:
                this.dic.color = this.props.colorDown
                break
            case TREND_VALUE.NONE:
                this.dic.color = this.dic.color || this.props.colorUp
                break
            default:
                break
        }
    }

    startFlashing() {
        this.dic.opacityFadeOut.setValue(1)
        this.dic.opacityFadeIn.setValue(0)
        this.fadeOutAnim && this.fadeOutAnim.stop()
        this.fadeInAnim && this.fadeInAnim.stop()

        this.fadeOutAnim = Animated.timing(this.dic.opacityFadeOut, {
            toValue: 0,
            duration: this.dic.timeFlashing,
            useNativeDriver: true
        })
        this.fadeInAnim = Animated.timing(this.dic.opacityFadeIn, {
            toValue: 1,
            duration: this.dic.timeFlashing,
            useNativeDriver: true
        })
        Animated.parallel([this.fadeOutAnim, this.fadeInAnim]).start()
    }

    render() {
        return (
            <View style={this.dic.style}>
                <Animated.View
                    style={{
                        opacity: this.dic.opacityFadeOut,
                        backgroundColor: this.dic.color,
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}>
                    <Text
                        style={[
                            this.dic.styleText,
                            {
                                color: '#fff'
                            }
                        ]}>{this.props.value}</Text>
                </Animated.View>
                <Animated.View
                    style={{
                        opacity: this.dic.opacityFadeIn,
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}>
                    <Text
                        style={[
                            this.dic.styleText,
                            { color: this.dic.color }
                        ]}>{this.props.value}</Text>
                </Animated.View>
            </View>
        )
    }
}
