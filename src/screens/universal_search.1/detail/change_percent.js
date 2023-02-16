import React from 'react';
import {
    View, Text
} from 'react-native';
import {
    formatNumberNew2
} from '../../../lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller'
import Enum from '../../../enum';
import * as Util from '../../../util';
import XComponent from '../../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class ChangePercent extends XComponent {
    constructor(props) {
        super(props)

        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
    }

    init() {
        this.dic = {
            value: this.props.value || {},
            id: Util.getRandomKey(),
            isLoading: this.props.isLoading || false
        }
    }

    bindAllFunc() {
        this.onLoading = this.onLoading.bind(this)
        this.onValueChange = this.onValueChange.bind(this)
    }

    componentDidMount() {
        super.componentDidMount()
        Emitter.addListener(this.props.channelLoadingOrder, this.dic.id, this.onLoading)
        Emitter.addListener(this.props.channelPriceOrder, this.dic.id, this.onValueChange)
    }

    onLoading(data) {
        if (this.dic.isLoading === data) return;
        this.dic.isLoading = data;
        this.setStateLowPriority();
    }

    onValueChange(newData) {
        if (!newData) return;
        if (
            this.dic.value === undefined ||
            this.dic.value === null ||
            this.dic.value.change_percent === undefined ||
            this.dic.value.change_percent === null ||
            this.dic.value.change_percent !== newData.change_percent
        ) {
            this.dic.value = newData;
            this.setStateLowPriority();
        } else {
            this.dic.value = newData;
        }
    }

    render() {
        return (
            <View style={this.props.containerStyle}>
                <Text testID={`newOrderSearchBarText`} style={[CommonStyle.textSubBlack, {
                    fontSize: CommonStyle.fontSizeM,
                    fontWeight: '300',
                    color: this.dic.value.change_percent > 0 ? CommonStyle.todayChangeUpTextColor : this.dic.value.change_percent < 0 ? CommonStyle.todayChangeDownTextColor : CommonStyle.todayChangeEqualTextColor
                }, this.props.style]}>
                    {` (${this.dic.isLoading
                        ? '--'
                        : this.dic.value.trade_price !== undefined && this.dic.value.trade_price !== null
                            ? `${formatNumberNew2(this.dic.value.change_percent, PRICE_DECIMAL.PERCENT)}%`
                            : '--'})`}
                </Text>
            </View>
        )
    }
}
