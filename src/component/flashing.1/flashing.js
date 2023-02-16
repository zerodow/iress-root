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
        value: PropTypes.object,
        field: PropTypes.string,
        symbol: PropTypes.string,
        indexInList: PropTypes.any,
        allowRender: PropTypes.bool,
        defaultValue: PropTypes.string,
        channelAllowRender: PropTypes.string,
        formatFunc: PropTypes.func.isRequired,
        updateTrend: PropTypes.func.isRequired,
        isValueChange: PropTypes.func.isRequired,
        channelLv1FromComponent: PropTypes.string,
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        defaultStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        trend: PropTypes.oneOf([TREND_VALUE.DOWN, TREND_VALUE.UP, TREND_VALUE.NONE])
    };

    constructor(props) {
        super(props)

        this.onValueChange = this.onValueChange.bind(this);
        this.renderFlashing = this.renderFlashing.bind(this);
        this.renderNoneValue = this.renderNoneValue.bind(this);
        this.resetFlashing = this.resetFlashing.bind(this);
        this.startFlashing = this.startFlashing.bind(this);
        this.getColor = this.getColor.bind(this);
        this.preRender = this.preRender.bind(this);

        this.dic = {
            opacityFadeOut: new Animated.Value(1),
            opacityFadeIn: new Animated.Value(0),
            value: this.props.value || {},
            style: this.props.style || {},
            defaultStyle: this.props.defaultStyle || this.props.style || {},
            timeFlashing: this.props.timeFlashing || Enum.TIME_FLASHING,
            trend: this.props.trend || TREND_VALUE.UP
        }
    }

    componentDidMount() {
        super.componentDidMount();

        const exchange = func.getExchangeSymbol(this.props.symbol)
        const channel = StreamingBusiness.getChannelLv1(exchange, this.props.symbol)
        Emitter.addListener(channel, this.id, this.onValueChange)
        this.startFlashing()
    }

    onValueChange(data) {
        if (!data) return;
        if (this.props.isValueChange(this.dic.value, data)) {
            this.dic.trend = this.props.updateTrend(this.dic.value, data);
            this.dic.value = data;
            this.preRender();
        } else {
            this.dic.value = data;
        }
    }

    preRender() {
        return this.dic.value[this.props.field]
            ? this.setStateLowPriority({}, this.startFlashing)
            : this.setStateLowPriority();
    }

    resetFlashing() {
        this.dic.opacityFadeOut.setValue(1);
        this.dic.opacityFadeIn.setValue(0);
        this.fadeOutAnim && this.fadeOutAnim.stop();
        this.fadeInAnim && this.fadeInAnim.stop();
        this.dic.value = {};
        this.dic.trend = this.props.trend || TREND_VALUE.UP;
    }

    onParentCall({ type }) {
        switch (type) {
            case PTC_CHANNEL.RESET_FLASHING:
                return this.resetFlashing();
            default:
                break;
        }
    }

    startFlashing() {
        this.dic.opacityFadeOut.setValue(1);
        this.dic.opacityFadeIn.setValue(0);
        this.fadeOutAnim && this.fadeOutAnim.stop();
        this.fadeInAnim && this.fadeInAnim.stop();

        this.fadeOutAnim = Animated.timing(this.dic.opacityFadeOut, {
            toValue: 0,
            duration: this.dic.timeFlashing,
            useNativeDriver: true
        });
        this.fadeInAnim = Animated.timing(this.dic.opacityFadeIn, {
            toValue: 1,
            duration: this.dic.timeFlashing,
            useNativeDriver: true
        });
        Animated.parallel([this.fadeOutAnim, this.fadeInAnim]).start();
    }

    getColor(trend) {
        return trend === TREND_VALUE.UP
            ? CommonStyle.color.buy
            : CommonStyle.color.sell;
    }

    renderNoneValue() {
        return (<Text style={[this.props.defaultStyle, this.props.noneValueStyle ? this.props.noneValueStyle : { paddingHorizontal: 4, textAlign: 'right' }]}>
            {this.props.defaultValue == null ? '--' : this.props.defaultValue}
        </Text>);
    }

    renderFlashing(color) {
        const value = this.props.formatFunc(this.dic.value);
        const position = this.props.position ? this.props.position : 'right'
        let positionStyle = {
            right: 0
        }
        if (position === 'left') {
            positionStyle = {
                left: 0
            }
        }
        return (
            <View style={{ flex: 1 }}>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            paddingHorizontal: 4,
                            top: 0,
                            opacity: this.dic.opacityFadeOut,
                            backgroundColor: color
                        },
                        positionStyle]}>
                    <Text style={[this.props.style, { color: '#fff' }]}>{value}</Text>
                </Animated.View>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            paddingHorizontal: 4,
                            top: 0,
                            opacity: this.dic.opacityFadeIn
                        },
                        positionStyle]}>
                    <Text style={[this.props.style, { color }]}>{value}</Text>
                </Animated.View>
            </View>
        )
    }

    render() {
        let color = this.getColor(this.dic.trend);
        return this.dic.value[this.props.field]
            ? this.renderFlashing(color)
            : this.renderNoneValue();
    }
}
