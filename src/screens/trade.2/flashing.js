import { func } from '../../storage'
import { View, Text, Animated } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter'
import * as StreamingBusiness from '../../streaming/streaming_business'
import Enum from '../../enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import XComponent from '../../component/xComponent/xComponent'

const PTC_CHANNEL = Enum.PTC_CHANNEL;
const TREND_VALUE = Enum.TREND_VALUE;

export default class Flashing extends XComponent {
    static propTypes = {
        data: PropTypes.object,
        timeFlashing: PropTypes.number
    }

    init() {
        this.dic = {
            trend: TREND_VALUE.UP,
            data: this.props.data || {},
            opacityFadeOut: new Animated.Value(1),
            timeFlashing: this.props.timeFlashing || Enum.TIME_FLASHING
        }
    }

    componentDidMount() {
        super.componentDidMount()

        const symbol = this.props.data.symbol
        const exchange = func.getExchangeSymbol(symbol)
        const channelName = StreamingBusiness.getChannelLv1(exchange, symbol)
        Emitter.addListener(channelName, this.id, this.onValueChange)

        this.startFlashing()
    }

    isChange() {
        return true
    }

    updateTrend() { }

    formatData() {
        return null
    }

    onValueChange(data) {
        if (this.isChange(this.dic.data, data)) {
            this.dic.trend = this.updateTrend(this.dic.value, data)
            this.dic.value = PureFunc.clone(data)
            this.preRender()
        } else {
            this.dic.value = PureFunc.clone(data)
        }
    }

    startFlashing() {
        this.dic.opacityFadeOut.setValue(1)
        this.fadeOutAnim && this.fadeOutAnim.stop()

        this.fadeOutAnim = Animated.timing(this.dic.opacityFadeOut, {
            toValue: 0,
            useNativeDriver: true,
            duration: this.dic.timeFlashing
        })
        this.fadeOutAnim.start()
    }

    getColor(trend) {
        return trend === TREND_VALUE.UP
            ? CommonStyle.fontGreen
            : CommonStyle.fontRed
    }

    renderFlashing() {
        const color = this.getColor(this.dic.trend)
        const value = this.formatData(this.dic.data)

        return (
            <View style={{ flex: 1 }}>
                <Animated.View
                    style={{
                        top: 0,
                        right: 0,
                        position: 'absolute',
                        paddingHorizontal: 4,
                        backgroundColor: color,
                        opacity: this.dic.opacityFadeOut
                    }}>
                    <Text
                        style={[
                            CommonStyle.textMainNoColor,
                            {
                                opacity: CommonStyle.opacity1,
                                color: '#fff'
                            }
                        ]}>{value}</Text>
                </Animated.View>
                <View
                    style={{
                        top: 0,
                        right: 0,
                        position: 'absolute',
                        paddingHorizontal: 4
                    }}>
                    <Text
                        style={[
                            CommonStyle.textMainNoColor,
                            {
                                opacity: CommonStyle.opacity1,
                                color
                            }
                        ]}>{value}</Text>
                </View>
            </View>
        )
    }

    renderNoneValue() {
        return (
            <Text
                style={[
                    this.props.defaultStyle,
                    this.props.noneValueStyle || { paddingHorizontal: 4, textAlign: 'right' }
                ]}>
                {this.props.defaultValue || '--'}
            </Text>
        )
    }

    render() {
        return this.dic.value[this.props.field]
            ? this.renderFlashing()
            : this.renderNoneValue()
    }
}
