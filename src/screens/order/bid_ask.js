import React, { Component } from 'react';
import {
    View, Text, Dimensions
} from 'react-native';
// Enum
import Enum from '../../enum';
// Storage
import { func, dataStorage } from '../../storage';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Business
import * as FuncUtil from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import * as Util from '../../util';
// Component
import Flashing from '../../component/flashing/flashing.1';
import FlashingWrapper from './flashing'
import XComponent from '../../component/xComponent/xComponent';
import Quantity from './quantity'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import TextLoadingCustom from '~/component/loading_component/text.1'
import ViewLoadReAni from '~/component/loading_component/view1'
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const FLASHING_FIELD = Enum.FLASHING_FIELD

export default class BidAsk extends XComponent {
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
        this.isBidSizeChange = this.isBidSizeChange.bind(this)
        this.isBidPriceChange = this.isBidPriceChange.bind(this)
        this.isAskPriceChange = this.isAskPriceChange.bind(this)
        this.isAskSizeChange = this.isAskSizeChange.bind(this)
        this.formatBidPrice = this.formatBidPrice.bind(this)
        this.formatAskPrice = this.formatAskPrice.bind(this)
        this.formatBidSize = this.formatBidSize.bind(this)
        this.formatAskSize = this.formatAskSize.bind(this)
        this.updateBidPriceTrend = this.updateBidPriceTrend.bind(this)
        this.updateAskPriceTrend = this.updateAskPriceTrend.bind(this)
    }

    isBidSizeChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.bid_size === undefined ||
            oldData.bid_size === null ||
            oldData.bid_size !== newData.bid_size) &&
            newData.bid_size !== undefined &&
            newData.bid_size !== null
    }

    isBidPriceChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.bid_price === undefined ||
            oldData.bid_price === null ||
            oldData.bid_price !== newData.bid_price) &&
            newData.bid_price !== undefined &&
            newData.bid_price !== null
    }

    isAskPriceChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.ask_price === undefined ||
            oldData.ask_price === null ||
            oldData.ask_price !== newData.ask_price) &&
            newData.ask_price !== undefined &&
            newData.ask_price !== null
    }

    isAskSizeChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.ask_size === undefined ||
            oldData.ask_size === null ||
            oldData.ask_size !== newData.ask_size) &&
            newData.ask_size !== undefined &&
            newData.ask_size !== null
    }

    formatBidSize(value, isLoading) {
        return (
            <View style={{ flex: 2, alignSelf: 'flex-start' }}>
                <ViewLoadReAni styleContainer={{ alignSelf: 'flex-start' }} isLoading={isLoading}>
                    <Text style={[CommonStyle.textSubDark, {
                        fontSize: CommonStyle.fontSizeXS
                    }]}>
                        {
                            isLoading
                                ? value.bid_size === undefined || value.bid_size === null ? '00.0000' : FuncUtil.formatNumber(value.bid_size)
                                : value.bid_size === undefined || value.bid_size === null
                                    ? '--'
                                    : FuncUtil.formatNumber(value.bid_size)
                        }
                    </Text>
                </ViewLoadReAni>
            </View>

        )
        return (
            <View style={{ flex: 2, alignSelf: 'flex-start' }}>

                <TextLoadingCustom styleViewLoading={{
                    alignSelf: 'flex-start'
                }} formatTextAbs={'00,000'} isLoading={isLoading} style={[CommonStyle.textSubDark, {
                    fontSize: CommonStyle.fontSizeXS
                }]}>

                </TextLoadingCustom>
            </View>

        )
    }

    formatBidPrice(value) {
        return FuncUtil.formatNumberNew2(value.bid_price, PRICE_DECIMAL.PRICE)
    }

    formatAskPrice(value) {
        return FuncUtil.formatNumberNew2(value.ask_price, PRICE_DECIMAL.PRICE)
    }

    formatAskSize(value, isLoading) {
        return (
            <View style={{ flex: 2, alignSelf: 'flex-start' }}>
                <ViewLoadReAni styleContainer={{ alignSelf: 'flex-start' }} isLoading={isLoading}>
                    <Text style={[CommonStyle.textSubDark, {
                        fontSize: CommonStyle.fontSizeXS,
                        textAlign: 'left'
                    }]}>
                        {
                            isLoading ? value.ask_size === undefined || value.ask_size === null ? '00.0000' : FuncUtil.formatNumber(value.ask_size)
                                : value.ask_size === undefined || value.ask_size === null
                                    ? '--'
                                    : FuncUtil.formatNumber(value.ask_size)
                        }
                    </Text>
                </ViewLoadReAni>
            </View>
        )
        return (
            <View style={{ flex: 2, alignSelf: 'flex-start' }}>
                <TextLoadingCustom styleViewLoading={{
                    alignSelf: 'flex-start'
                }} formatTextAbs={'00,000'} isLoading={isLoading} style={[CommonStyle.textSubDark, {
                    fontSize: CommonStyle.fontSizeXS,
                    textAlign: 'left'
                }]}>

                </TextLoadingCustom>
            </View>
        )
    }

    updateBidPriceTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(newData.bid_price, oldData.bid_price);
    }

    updateAskPriceTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(newData.ask_price, oldData.ask_price);
    }

    render() {
        return (
            <View style={{ paddingHorizontal: 16, paddingBottom: 19, borderBottomRightRadius: CommonStyle.borderBottomRightRadius }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[CommonStyle.textSubDark, {
                        fontSize: CommonStyle.fontSizeXS,
                        marginBottom: 7,
                        flex: 2,
                        opacity: 0.6
                    }]}>{I18n.t('bidVol')}</Text>

                    <Text style={[CommonStyle.textSubDark, {
                        fontSize: CommonStyle.fontSizeXS,
                        marginBottom: 7,
                        flex: 3,
                        opacity: 0.6
                    }]}>{I18n.t('bidPrice')}</Text>

                    <Text style={[CommonStyle.textSubDark, {
                        fontSize: CommonStyle.fontSizeXS,
                        marginBottom: 7,
                        textAlign: 'left',
                        flex: 3,
                        opacity: 0.6
                    }]}>{I18n.t('offerPrice')}</Text>

                    <Text style={[CommonStyle.textSubDark, {
                        fontSize: CommonStyle.fontSizeXS,
                        marginBottom: 7,
                        textAlign: 'left',
                        flex: 2,
                        opacity: 0.6
                    }]}>{I18n.t('askVol')}</Text>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Quantity
                        value={this.dic.value}
                        channelLoadingOrder={this.props.channelLoadingOrder}
                        channelPriceOrder={this.props.channelPriceOrder}
                        isLoading={this.dic.isLoading}
                        isValueChange={this.isBidSizeChange}
                        formatFunc={this.formatBidSize}
                    />

                    <View style={{ flex: 3, alignItems: 'flex-start' }}>
                        <FlashingWrapper
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            isLoading={this.dic.isLoading}
                        >
                            <Flashing
                                value={this.dic.value}
                                channelLv1FromComponent={this.props.channelPriceOrder}
                                field={FLASHING_FIELD.BID_PRICE}
                                style={{
                                    ...CommonStyle.textMainNoColor,
                                    opacity: CommonStyle.opacity1,
                                    textAlign: 'left',
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    fontSize: CommonStyle.fontSizeXS
                                }}
                                isValueChange={this.isBidPriceChange}
                                updateTrend={this.updateBidPriceTrend}
                                formatFunc={this.formatBidPrice}
                            />
                        </FlashingWrapper>

                    </View>

                    <View style={{ flex: 3, alignItems: 'flex-start' }}>
                        <FlashingWrapper
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            isLoading={this.dic.isLoading}
                        >
                            <Flashing
                                value={this.dic.value}
                                channelLv1FromComponent={this.props.channelPriceOrder}
                                field={FLASHING_FIELD.ASK_PRICE}
                                style={{
                                    ...CommonStyle.textMainNoColor,
                                    opacity: CommonStyle.opacity1,
                                    textAlign: 'right',
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    fontSize: CommonStyle.fontSizeXS
                                }}
                                isValueChange={this.isAskPriceChange}
                                updateTrend={this.updateAskPriceTrend}
                                formatFunc={this.formatAskPrice}
                            />
                        </FlashingWrapper>
                    </View>

                    <Quantity
                        value={this.dic.value}
                        channelLoadingOrder={this.props.channelLoadingOrder}
                        channelPriceOrder={this.props.channelPriceOrder}
                        isLoading={this.dic.isLoading}
                        isValueChange={this.isAskSizeChange}
                        formatFunc={this.formatAskSize}
                    />
                </View>
            </View >
        )
    }
}
