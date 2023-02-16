import React, { Component } from 'react'
import { View, Text, Animated } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter';
import PropTypes from 'prop-types';
import Enum from '../../enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent';
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business'

const PTC_CHANNEL = Enum.PTC_CHANNEL;
const TREND_VALUE = Enum.TREND_VALUE;

class InternalFlashing extends XComponent {
    static propTypes = {
        value: PropTypes.object,
        channelLv1FromComponent: PropTypes.string,
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        positionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        isValueChange: PropTypes.func.isRequired,
        formatFunc: PropTypes.func.isRequired,
        updateTrend: PropTypes.func.isRequired,
        trend: PropTypes.oneOf([TREND_VALUE.DOWN, TREND_VALUE.UP, TREND_VALUE.NONE]),
        field: PropTypes.string,
        defaultValue: PropTypes.string,
        defaultStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
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
        this.channelLoadingOrder = OrderStreamingBusiness.getChannelLoadingOrder()

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
        Emitter.addListener(this.props.channelLv1FromComponent, this.id, this.onValueChange);
        this.startFlashing();
    }

    onValueChange({ data, isMerge = true }) {
        if (!data) return;
        if (this.props.isValueChange(this.dic.value, data)) {
            this.dic.trend = this.props.updateTrend(this.dic.value, data);
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data;
            }
            this.preRender();
        } else {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data;
            }
            const flashing = false
            this.preRender(flashing);
        }
    }

    preRender(flashing = true) {
        if (!flashing) return this.setStateLowPriority(); // Không flashing nhưng vẫn render
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
            ? CommonStyle.hightLightColorUp
            : CommonStyle.hightLightColorDown;
    }

    renderNoneValue() {
        return <Text style={[
            // this.props.defaultStyle,
            {
                paddingHorizontal: 4,
                // paddingTop: 2,
                textAlign: 'right',
                color: CommonStyle.fontColor

            },
            // this.props.noneValueStyle,
            {
                fontFamily: CommonStyle.fontPoppinsRegular,
                alignItems: 'center',
                justifyContent: 'center'

            },
            this.props.style
        ]}>
            {this.props.defaultValue == null ? '--' : this.props.defaultValue}
        </Text>
    }

    renderFlashing(color) {
        const value = (this.props && this.props.formatFunc && this.props.formatFunc(this.dic.value)) || 0;
        return (
            <View>
                <Text style={[this.props.style, { opacity: 0 }]}>
                    {value}
                </Text>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            top: 0,
                            opacity: this.dic.opacityFadeOut,
                            backgroundColor: color
                        }]}>
                    <Text style={[this.props.style, { color: CommonStyle.fontWhite }]}>{value}</Text>
                </Animated.View>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            top: 0,
                            opacity: this.dic.opacityFadeIn
                        }]}>
                    {
                        <Text style={[this.props.style, { color, opacity: CommonStyle.opacity }]}>{value}</Text>
                    }

                </Animated.View>
            </View>
        )
    }

    render() {
        const color = this.getColor(this.dic.trend);
        return this.dic.value[this.props.field]
            ? this.renderFlashing(color)
            : this.renderNoneValue();
    }
}

export default class Flashing extends Component {
    static propTypes = {
        value: PropTypes.object,
        channelLv1FromComponent: PropTypes.string,
        // style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        isValueChange: PropTypes.func.isRequired,
        formatFunc: PropTypes.func.isRequired,
        updateTrend: PropTypes.func.isRequired,
        trend: PropTypes.oneOf([TREND_VALUE.DOWN, TREND_VALUE.UP, TREND_VALUE.NONE]),
        field: PropTypes.string,
        defaultValue: PropTypes.string,
        defaultStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
    };

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (<InternalFlashing {...this.props} />);
    }
};
