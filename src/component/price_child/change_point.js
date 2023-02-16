import React, { Component } from 'react';
import {
    View, Text
} from 'react-native';
// Util
import * as FunctionUtil from '../../lib/base/functionUtil';

// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import Icon from 'react-native-vector-icons/Ionicons';
import ENUM from '../../enum';
import * as Util from '../../util';

// Component
import XComponent from '../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';

const { PRICE_DECIMAL } = ENUM

export default class ChangePoint extends XComponent {
    init() {
        this.dic = {
            value: this.props.value || {},
            isLoading: this.props.isLoading
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
                this.dic.value.change_point === undefined ||
                this.dic.value.change_point === null ||
                this.dic.value.change_point !== data.change_point) &&
            data.change_point !== undefined &&
            data.change_point !== null
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
            return this.dic.value.change_point !== undefined && this.dic.value.change_point !== null ? FunctionUtil.formatNumberNew2(this.dic.value.change_point, PRICE_DECIMAL.PRICE) : '0.0000'
        }
        return this.dic.value.change_point !== undefined && this.dic.value.change_point !== null ? FunctionUtil.formatNumberNew2(this.dic.value.change_point, PRICE_DECIMAL.PRICE) : '--'
    }
    render() {
        const { colorUp, colorDown } = this.props
        return (
            <View style={{ flexDirection: 'row' }}>
                {
                    this.dic.value.change_point > 0
                        ? <CommonStyle.icons.arrowUp name='md-arrow-dropup'
                            color= {colorUp || CommonStyle.fontGreen}
                            style={[CommonStyle.iconPickerUp, { color: colorUp || CommonStyle.fontGreen, marginRight: 5, alignSelf: 'center' }]} />
                        : this.dic.value.change_point < 0
                            ? <CommonStyle.icons.arrowDown name='md-arrow-dropdown'
                                color={colorDown || CommonStyle.fontRed}
                                style={[CommonStyle.iconPickerDown, {
                                    color: colorDown || CommonStyle.fontRed,
                                    marginRight: 2,
                                    alignSelf: 'center'
                                }]} />
                            : <View />
                }
                <Text
                    style={[
                        CommonStyle.textSubNumber,
                        {
                            fontSize: CommonStyle.fontSizeM,
                            fontWeight: '300',
                            color: this.dic.value.change_point > 0
                                ? colorUp || CommonStyle.todayChangeUpTextColor
                                : this.dic.value.change_point < 0
                                    ? colorDown || CommonStyle.todayChangeDownTextColor
                                    : CommonStyle.todayChangeEqualTextColor
                        },
                        this.props.textStyle
                    ]}>{
                        this.getDisplay()
                    }</Text>
            </View>
        )
    }
}
