import React, { Component } from 'react';
import _ from 'lodash';
import { Text, PixelRatio, View, Animated, TouchableOpacity, Platform } from 'react-native';
import { connect } from 'react-redux'

// Func
import { func, dataStorage } from '../../../storage';
import I18n from '~/modules/language';
import filterType from '~/constants/filter_type';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Emitter from '@lib/vietnam-emitter'
import {
    formatNumberNew2, formatNumberNew2ClearZero,
    logAndReport, checkPropsStateShouldUpdate, renderTime
} from '../../../lib/base/functionUtil';
import * as Controller from '../../../memory/controller'
import Enum from '../../../enum'
import * as Util from '../../../util';
import styles from './style/details';
import Icon from 'react-native-vector-icons/Ionicons';
import Flag from '../../../component/flags/flag';
import TouchableOpacityOpt from '../../../component/touchableOpacityOpt';
import Flashing from '../../../component/flashing/flashing.1';

import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import ChangePoint from './change_point';
import ChangePercent from './change_percent';
import * as Business from '../../../business';
import History from './history';
import OrderDetail from './order/order_detail';
import XComponent from '../../../component/xComponent/xComponent';
import PriceTradeHeader from './price/price_tradeHeader';
import PriceTradeInfo from './price/price_tradeInfo';
import PriceTradeButton from './price/price_tradeButton';
import * as OrderStreamingBusiness from '../../../streaming/order_streaming_business'
const FLASHING_FIELD = Enum.FLASHING_FIELD;
const {
    USER_TYPE, SCREEN, TITLE_FORM, ID_ELEMENT, ICON_NAME,
    SPECIAL_STRING, PRICE_DECIMAL, USER_TYPE_ROLE_SHOW_ORDER_STATE
} = Enum
export class PriceTradeComp extends Component {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.dic = {
            channelPriceOrder: OrderStreamingBusiness.getChannelPriceOrder()
        }
    }
    init() {
        console.log('enter');
    }
    renderLastTradePrice = () => {
        return (
            <Flashing
                value={this.props.priceObject || 0 || 0}
                channelLv1FromComponent={this.dic.channelPriceOrder}
                field={FLASHING_FIELD.TRADE_PRICE}
                style={{
                    ...CommonStyle.textMainNoColor,
                    textAlign: 'left',
                    fontFamily: 'HelveticaNeue-Medium',
                    fontSize: CommonStyle.fontSizeXS,
                    opacity: CommonStyle.opacity1
                }}
                containerStyle={{ flex: 4 }}
                positionStyle={{ left: 0 }}
                isValueChange={this.isTradePriceChange}
                updateTrend={this.updateTrend}
                formatFunc={this.formatTradePrice}
            />
        );
    }
    renderChangePoint = () => {
        return (
            <ChangePoint
                isNoneIcon={true}
                value={this.props.priceObject || 0}
                // containerStyle={{ flex: 3, justifyContent: 'flex-end' }}
                style={{ fontSize: CommonStyle.fontSizeXS, textAlign: 'right', opacity: 1, fontWeight: '500', fontFamily: 'HelveticaNeue-Medium' }}
                channelLoadingOrder={this.dic.channelLoadingOrder}
                channelPriceOrder={this.dic.channelPriceOrder}
                isLoading={this.dic.isLoadingPrice}
            />
        );
    }

    renderChangePercent = () => {
        return (
            <ChangePercent
                // containerStyle={{ flex: 3 }}
                value={this.props.priceObject || 0}
                style={{ fontSize: CommonStyle.fontSizeXS, opacity: 1, fontWeight: '500', fontFamily: 'HelveticaNeue-Medium' }}
                channelLoadingOrder={this.dic.channelLoadingOrder}
                channelPriceOrder={this.dic.channelPriceOrder}
                isLoading={this.dic.isLoadingPrice}
            />
        );
    }
    renderBidPrice = () => {
        return (
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'right', color: CommonStyle.fontNearDark2, marginRight: 4 }]}>{I18n.t('bidPrice')}</Text>
                <Flashing
                    value={this.props.priceObject || 0}
                    channelLv1FromComponent={this.dic.channelPriceOrder}
                    field={FLASHING_FIELD.BID_PRICE}
                    style={{
                        ...CommonStyle.textMainNoColor,
                        opacity: CommonStyle.opacity1,
                        fontSize: CommonStyle.fontSizeXS,
                        fontFamily: 'HelveticaNeue-Medium'
                    }}
                    isValueChange={this.isBidPriceChange}
                    updateTrend={this.updateBidPriceTrend}
                    formatFunc={this.formatBidPrice}
                />
            </View>
        );
    }

    renderAskPrice = () => {
        try {
            return (
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'right', color: CommonStyle.fontNearDark2, marginRight: 4 }]}>{I18n.t('offerPrice')}</Text>
                    <Flashing
                        value={this.props.priceObject || 0}
                        channelLv1FromComponent={this.dic.channelPriceOrder}
                        field={FLASHING_FIELD.ASK_PRICE}
                        style={{
                            ...CommonStyle.textMainNoColor,
                            opacity: CommonStyle.opacity1,
                            fontSize: CommonStyle.fontSizeXS,
                            fontFamily: 'HelveticaNeue-Medium'
                        }}
                        isValueChange={this.isAskPriceChange}
                        updateTrend={this.updateAskPriceTrend}
                        formatFunc={this.formatAskPrice}
                    />
                </View>
            );
        } catch (error) {
            console.log('error at render renderAskPrice', error)
        }
    }
    render() {
        return <View style={{
            marginHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: CommonStyle.fontBorderGray,
            paddingBottom: 8
        }}>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    {this.renderLastTradePrice()}
                </View>

                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {this.renderChangePoint()}
                    {this.renderChangePercent()}
                </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {this.renderBidPrice()}
                {this.renderAskPrice()}
            </View>
        </View>
    }
}
const mapStateToProps = state => ({
    priceObject: state.price.priceObject,
    isLoading: state.price.isLoading
});
export default connect(
    mapStateToProps
)(PriceTradeComp);
