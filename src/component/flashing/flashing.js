import React, { Component } from 'react'
import { View, Text, Animated } from 'react-native'
import { formatNumberNew2 } from '../../lib/base/functionUtil'
import Enum from '../../enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import FlashingStyle from './flashing_style';
import XComponent from '../../component/xComponent/xComponent';
import { func } from '../../storage'
import * as Controller from '../../memory/controller'

const PTC_CHANNEL = Enum.PTC_CHANNEL;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

class InternalFlashing extends XComponent {
    constructor(props) {
        super(props)

        this.startFlashing = this.startFlashing.bind(this);
        this.renderNoneValue = this.renderNoneValue.bind(this);
        this.onTradePriceChange = this.onTradePriceChange.bind(this);
        this.onAllowRender = this.onAllowRender.bind(this);
        this.resetFlashing = this.resetFlashing.bind(this);

        this.timeFlashing = this.props.timeFlashing || Enum.TIME_FLASHING;
        this.value = this.props.value || null;
        this.opacityFadeOut = new Animated.Value(1);
        this.opacityFadeIn = new Animated.Value(0);
        this.trend = 'u';
        this.waitRender = false;
        this.hasRender = this.props.hasRender == null ? true : this.props.hasRender;
        this.field = this.props.field;
        this.style = this.getStyleByForm(this.props.typeFormRealtime)
    }

    getStyleByForm(typeForm) {
        return FlashingStyle[typeForm] || {};
    }

    componentDidMount() {
        super.componentDidMount();
        this.startFlashing();
    }

    onAllowRender(data) {
        this.hasRender = data;
        if (this.hasRender && this.waitRender) this.renderWhenStreaming();
        this.waitRender = false;
    }

    onTradePriceChange(data = 0) {
        if (this.value === data) return;
        this.trend = data > this.value ? 'u' : 'd';
        this.value = data;

        this.hasRender
            ? this.renderWhenStreaming()
            : this.waitRender = true;
    }

    resetFlashing() {
        this.opacityFadeOut.setValue(1);
        this.opacityFadeIn.setValue(0);
        this.fadeOutAnim && this.fadeOutAnim.stop();
        this.fadeInAnim && this.fadeInAnim.stop();
        this.value = null;
        this.trend = 'u';
    }

    onParentCall({ type, data }) {
        switch (type) {
            case this.field:
                return this.onTradePriceChange(data);
            case PTC_CHANNEL.ALLOW_RENDER:
                return this.onAllowRender(data);
            case PTC_CHANNEL.RESET_FLASHING:
                return this.resetFlashing();
            default:
                break;
        }
    }

    renderWhenStreaming() {
        this.setState({}, this.startFlashing);
    }

    startFlashing() {
        this.opacityFadeOut.setValue(1);
        this.opacityFadeIn.setValue(0);
        this.fadeOutAnim && this.fadeOutAnim.stop();
        this.fadeInAnim && this.fadeInAnim.stop();

        this.fadeOutAnim = Animated.timing(this.opacityFadeOut, {
            toValue: 0,
            duration: this.timeFlashing,
            useNativeDriver: true
        });
        this.fadeInAnim = Animated.timing(this.opacityFadeIn, {
            toValue: 1,
            duration: this.timeFlashing,
            useNativeDriver: true
        });
        Animated.parallel([this.fadeOutAnim, this.fadeInAnim]).start();
    }

    getColor(trend) {
        return trend === 'u'
            ? CommonStyle.hightLightColorUp
            : CommonStyle.hightLightColorDown;
    }

    renderNoneValue() {
        return (<Text style={[this.style.text, { paddingHorizontal: 4, textAlign: 'right' }, this.props.noneValueStyle]}>
            {this.props.defaultValue != null ? this.props.defaultValue : '--'}
        </Text>);
    }

    renderFlashing(color) {
        const decimalPrice = this.props.decimalPrice || PRICE_DECIMAL.PRICE
        return (
            <React.Fragment>
                <View style={{ paddingLeft: 8 }}>
                    <Text style={[this.style.text, { textAlign: 'right', opacity: 0 }]}>
                        {formatNumberNew2(this.value, decimalPrice)}
                    </Text>
                </View>
                <Animated.View style={[this.style.animatedView, { opacity: this.opacityFadeOut, backgroundColor: color }]}>
                    <Text style={[this.style.text, { color: CommonStyle.fontWhite, textAlign: 'right' }]}>
                        {formatNumberNew2(this.value, decimalPrice)}
                    </Text>
                </Animated.View>
                <Animated.View style={[this.style.animatedView, { opacity: this.opacityFadeIn }]}>
                    <Text style={[this.style.text, { color, textAlign: 'right' }]}>
                        {formatNumberNew2(this.value, decimalPrice)}
                    </Text>
                </Animated.View>
            </React.Fragment>
        )
    }

    shouldComponentUpdate(nextProps) {
        if (!Controller.isPriceStreaming()) {
            if (nextProps.value !== this.value) {
                this.onTradePriceChange(nextProps.value);
                return true;
            }
        }
        return false
    }

    render() {
        let color = this.getColor(this.trend);
        return this.value
            ? this.renderFlashing(color)
            : this.renderNoneValue();
    }
}

export default class Flashing extends Component {
    shouldComponentUpdate(nextProps) {
        if (!Controller.isPriceStreaming()) {
            return true;
        }
        return false
    }

    render() {
        return (<InternalFlashing
            decimalPrice={this.props.decimalPrice}
            noneValueStyle={this.props.noneValueStyle}
            value={this.props.value}
            defaultValue={this.props.defaultValue}
            parentID={this.props.parentID}
            hasRender={this.props.hasRender}
            field={this.props.field}
            isLoading={this.props.isLoading}
            typeFormRealtime={this.props.typeFormRealtime}
        />);
    }
};
