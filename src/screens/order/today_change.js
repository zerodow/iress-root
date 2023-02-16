import React, { Component } from 'react';
import {
    View, Text, Dimensions
} from 'react-native';
import {
    logDevice, formatNumberNew2
} from '../../lib/base/functionUtil';
import styles from './style/order';
import { func, dataStorage } from '../../storage';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Icon from 'react-native-vector-icons/Ionicons';
import Enum from '../../enum';
import * as Util from '../../util';
import XComponent from '../../component/xComponent/xComponent';
import ChangePoint from './change_point'
import ChangePercent from './change_percent'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import ChangePointPercent from './change_point_percent'
export default class TodayChange extends XComponent {
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
            isLoading: this.props.isLoading || false
        }
    }

    bindAllFunc() {

    }

    render() {
        return (
            <View style={[styles.rowExpand]}>
                <View style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Text
                        style={[CommonStyle.textSubDark, { fontSize: CommonStyle.fontSizeXS, opacity: 0.6 }]}
                    >
                        {`${I18n.t('todayChange')}`}
                    </Text>
                    <ChangePointPercent
                        channelLoadingOrder={this.props.channelLoadingOrder}
                        isLoading={this.dic.isLoading}
                    >
                        <ChangePoint
                            colorUp={CommonStyle.hightLightColorUp}
                            colorDown={CommonStyle.hightLightColorDown}
                            value={this.dic.value}
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            channelPriceOrder={this.props.channelPriceOrder}
                            isLoading={this.dic.isLoading}
                        />
                        <ChangePercent
                            colorUp={CommonStyle.hightLightColorUp}
                            colorDown={CommonStyle.hightLightColorDown}
                            value={this.dic.value}
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            channelPriceOrder={this.props.channelPriceOrder}
                            isLoading={this.dic.isLoading}
                        />
                    </ChangePointPercent>
                </View>
            </View>
        )
    }
}
