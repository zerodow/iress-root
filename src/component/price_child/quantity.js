import React, { Component } from 'react';
import {
    Dimensions
} from 'react-native';

// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Constant
import orderConditionString from '../../constants/order_condition_string';
import ENUM from '../../enum';
import * as Util from '../../util';
// Component
import XComponent from '../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';

export default class Quantity extends XComponent {
    init() {
        this.dic = {
            value: this.props.value || {},
            isLoading: this.props.isLoading || false
        }
    }

    bindAllFunc() {
        this.onLoading = this.onLoading.bind(this)
        this.onValueChange = this.onValueChange.bind(this)
    }

    componentDidMount() {
        super.componentDidMount()
        Emitter.addListener(this.props.channelLoading, this.id, this.onLoading)
        Emitter.addListener(this.props.channelPrice, this.id, this.onValueChange)
    }

    onLoading(data) {
        if (this.dic.isLoading === data) return;
        this.dic.isLoading = data;
        this.setStateLowPriority();
    }

    onValueChange({ data, isMerge = true }) {
        if (!data) return;
        if (this.props.isValueChange(this.dic.value, data)) {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data;
            }
            this.setStateLowPriority();
        } else {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data;
            }
        }
    }

    render() {
        return this.props.formatFunc(this.dic.value, this.dic.isLoading)
    }
}
