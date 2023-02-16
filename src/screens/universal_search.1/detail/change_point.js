import React from 'react';
import {
    View, Text
} from 'react-native';
import { formatNumberNew2 } from '../../../lib/base/functionUtil';
import styles from './style/details';
import CommonStyle, { register } from '~/theme/theme_controller'
import Icon from 'react-native-vector-icons/Ionicons';
import Enum from '../../../enum';
import * as Util from '../../../util';
import XComponent from '../../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class ChangePoint extends XComponent {
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
            isLoading: this.props.isLoading,
            id: Util.getRandomKey()
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
            this.dic.value.change_point === undefined ||
            this.dic.value.change_point === null ||
            this.dic.value.change_point !== newData.change_point
        ) {
            this.dic.value = newData;
            this.setStateLowPriority();
        } else {
            this.dic.value = newData;
        }
    }

    render() {
        return (
            <View style={[this.props.containerStyle, { flexDirection: 'row' }]}>
                {
                    this.props.isNoneIcon ? null : (this.dic.value.change_point > 0
                        ? <CommonStyle.icons.arrowUp name='md-arrow-dropup'
                            color={CommonStyle.fontGreen}
                            style={[styles.iconPickerUp, { color: CommonStyle.fontGreen, marginRight: 5 }]} />
                        : this.dic.value.change_point < 0
                            ? <CommonStyle.icons.arrowDown name='md-arrow-dropdown'
                                color={CommonStyle.fontRed}
                                style={[styles.iconPickerDown, {
                                    color: CommonStyle.fontRed,
                                    marginRight: 2
                                }]} />
                            : <View />)
                }
                <Text style={[CommonStyle.textSubBlack, {
                    fontSize: CommonStyle.fontSizeM,
                    fontWeight: '300',
                    color: this.dic.value.change_point > 0 ? CommonStyle.todayChangeUpTextColor : this.dic.value.change_point < 0 ? CommonStyle.todayChangeDownTextColor : CommonStyle.todayChangeEqualTextColor
                }, this.props.style]}>{this.dic.isLoading ? '--' : (this.dic.value.trade_price !== undefined && this.dic.value.trade_price !== null ? formatNumberNew2(this.dic.value.change_point, PRICE_DECIMAL.PRICE) : '--')}</Text>
            </View>
        )
    }
}
