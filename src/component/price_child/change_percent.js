import React, { Component } from 'react';
import {
    Text
} from 'react-native';
// Util
import * as FunctionUtil from '../../lib/base/functionUtil';

// Style
import CommonStyle, { register } from '~/theme/theme_controller'

import ENUM from '../../enum';
import * as Util from '../../util';
// Component
import XComponent from '../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';

const { PRICE_DECIMAL } = ENUM

export default class ChangePercent extends XComponent {
    init() {
        this.dic = {
            value: this.props.value || {},
            isLoading: this.props.isLoading || false
        }
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
        if (
            (this.dic.value === undefined ||
                this.dic.value === null ||
                this.dic.value.change_percent === undefined ||
                this.dic.value.change_percent === null ||
                this.dic.value.change_percent !== data.change_percent) &&
            data.change_percent !== undefined &&
            data.change_percent !== null
        ) {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data
            }
            this.setStateLowPriority();
        } else {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data
            }
        }
    }
    getDisplay = () => {
        if (this.dic.isLoading) {
            return this.dic.value.change_percent !== undefined && this.dic.value.change_percent !== null ? ` (${FunctionUtil.formatNumberNew2(this.dic.value.change_percent, PRICE_DECIMAL.PERCENT)}%)` : '(0.00%)'
        }
        return this.dic.value.change_percent !== undefined && this.dic.value.change_percent !== null ? ` (${FunctionUtil.formatNumberNew2(this.dic.value.change_percent, PRICE_DECIMAL.PERCENT)}%)` : '(--)'
    }
    render() {
        const { colorUp, colorDown } = this.props
        return (
            <Text
                testID={`newOrderSearchBarText`}
                style={[
                    CommonStyle.textSubNumber,
                    {
                        fontSize: CommonStyle.fontSizeM,
                        fontWeight: '300',
                        color: this.dic.value.change_percent > 0
                            ? colorUp || CommonStyle.todayChangeUpTextColor
                            : this.dic.value.change_percent < 0
                                ? colorDown || CommonStyle.todayChangeDownTextColor
                                : CommonStyle.todayChangeEqualTextColor
                    },
                    this.props.textStyle
                ]}>
                {this.getDisplay()}
            </Text>
        )
    }
}
