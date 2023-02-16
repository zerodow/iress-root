import React, { Component } from 'react';
import {
    View, Text
} from 'react-native';
// Enum
import Enum from '../../enum'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import styles from './style/order';
// Storage
import { func, dataStorage } from '../../storage';
// Business
import I18n from '../../modules/language/';
import * as Util from '../../util';
import * as FuncUtil from '../../lib/base/functionUtil'
// Component
import Flashing from '../../component/flashing/flashing.1';
import XComponent from '../../component/xComponent/xComponent';
import Quantity from './quantity'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import ViewLoadingReAni from '~/component/loading_component/view1'
import FlashingWrapper from './flashing'
const FLASHING_FIELD = Enum.FLASHING_FIELD
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class LastTrade extends XComponent {
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
        this.isTradePriceChange = this.isTradePriceChange.bind(this)
        this.isTradeSizeChange = this.isTradeSizeChange.bind(this)
        this.formatTradePrice = this.formatTradePrice.bind(this)
        this.formatTradeSize = this.formatTradeSize.bind(this)
        this.updateTrend = this.updateTrend.bind(this)
    }

    isTradePriceChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.trade_price === undefined ||
            oldData.trade_price === null ||
            oldData.trade_price !== newData.trade_price) &&
            newData.trade_price !== undefined &&
            newData.trade_price !== null
    }

    isTradeSizeChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.trade_size === undefined ||
            oldData.trade_size === null ||
            oldData.trade_size !== newData.trade_size) &&
            newData.trade_size !== undefined &&
            newData.trade_size !== null
    }

    formatTradePrice(value) {
        return FuncUtil.formatNumberNew2(value.trade_price, PRICE_DECIMAL.PRICE)
    }

    formatTradeSize(value, isLoading) {
        return (
            <ViewLoadingReAni isLoading={isLoading} styleContainer={{ marginLeft: 8 }}>
                <Text style={[CommonStyle.textSubDark, {
                    fontSize: CommonStyle.fontSizeM
                }]}>
                    {
                        isLoading ? value.trade_size === undefined || value.trade_size === null ? '(39)' : `(${FuncUtil.formatNumber(value.trade_size)})`
                            : value.trade_size === undefined || value.trade_size === null
                                ? '--'
                                : `(${FuncUtil.formatNumber(value.trade_size)})`
                    }
                </Text>
            </ViewLoadingReAni>
        )
        return (
            <TextLoad isLoading={isLoading} containerStyle={{ marginLeft: 8 }} style={[CommonStyle.textSubDark, {
                fontSize: CommonStyle.fontSizeM
            }]}>

            </TextLoad>
        )
    }

    updateTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(newData.trade_price, oldData.trade_price);
    }

    render() {
        return (
            <View style={[styles.rowExpand]}>
                <View style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Text
                        style={[CommonStyle.textSubDark, { fontSize: CommonStyle.fontSizeXS, opacity: 0.6 }]}>
                        {`${I18n.t('lastTrade')} (${I18n.t('quantity')})`}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <FlashingWrapper
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            channelPriceOrder={this.props.channelPriceOrder}
                            isLoading={this.dic.isLoading}
                        >
                            <Flashing
                                value={this.dic.value}
                                channelLv1FromComponent={this.props.channelPriceOrder}
                                field={FLASHING_FIELD.TRADE_PRICE}
                                style={{
                                    ...CommonStyle.textMainNoColor,
                                    opacity: CommonStyle.opacity1,
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    fontSize: CommonStyle.fontSizeL
                                }}
                                noneValueStyle={{ fontSize: CommonStyle.fontSizeXS, fontWeight: '300', fontFamily: CommonStyle.fontPoppinsRegular }}
                                isValueChange={this.isTradePriceChange}
                                updateTrend={this.updateTrend}
                                formatFunc={this.formatTradePrice}
                            />
                        </FlashingWrapper>

                        <Quantity
                            value={this.dic.value}
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            channelPriceOrder={this.props.channelPriceOrder}
                            isLoading={this.dic.isLoading}
                            isValueChange={this.isTradeSizeChange}
                            formatFunc={this.formatTradeSize}
                        />
                    </View>
                </View>
            </View>
        )
    }
}
