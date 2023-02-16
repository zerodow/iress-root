import React, { Component } from 'react'
import { Animated } from 'react-native'
import Enum from '../../enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent';
import * as Util from '../../util'

export default class Flashing extends XComponent {
    constructor(props) {
        super(props)

        this.startFlashing = this.startFlashing.bind(this);
        this.renderNoneValue = this.renderNoneValue.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onAllowRender = this.onAllowRender.bind(this);
        this.resetFlashing = this.resetFlashing.bind(this);
        this.updateTrend = this.updateTrend.bind(this);
        this.preRender = this.preRender.bind(this);

        this.timeFlashing = this.props.timeFlashing || Enum.TIME_FLASHING;
        this.value = this.props.value || {};
        this.opacityFadeOut = new Animated.Value(1);
        this.opacityFadeIn = new Animated.Value(0);
        this.trend = 'u';
        this.waitRender = false;
        this.allowRender = this.props.allowRender == null ? true : this.props.allowRender;
        this.isLoading = false;
        this.isFlashing = false;
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    updateTrend(newVal, oldVal) {
        this.trend = Util.getTrendCompareWithOld(newVal, oldVal);
    }

    updateIsFlashing(val) {
        this.isFlashing = !this.isLoading && val != null;
    }

    onAllowRenderChange(data) {
        if (this.allowRender === data) return;
        this.allowRender = data;
        if (this.allowRender && this.waitRender) {
            this.waitRender = false;
            this.setState({}, this.startFlashing);
        }
    }

    onLoading(data) {
        if (this.isLoading === data) return;
        this.isLoading = data;
        if (this.isLoading) this.setState();
    }

    preRender() {
        this.allowRender
            ? this.setState()
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
            ? CommonStyle.fontGreen
            : CommonStyle.fontRed;
    }

    onValueChange() {
        this.isLoading = false;
        //  TO DO: event value change
    }

    isValueChange() {
        //  TO DO: this function check whether oldValue difference newValue
    }

    onParentCall() {
        //  TO DO: parent call to this function
    }

    renderNoneValue() {
        //  TO DO: render item when no data
    }

    renderFlashing() {
        //  TO DO: render item when has data
    }

    render() {
        //  TO DO: render item
    }
};
