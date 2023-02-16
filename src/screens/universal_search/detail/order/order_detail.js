import React, { Component } from 'react'
import {
    View, Text, TouchableOpacity, TouchableWithoutFeedback,
    Keyboard, Platform
} from 'react-native'

// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// ENUM
import ENUM from '~/enum'
// Redux
import { connect } from 'react-redux';
// Component
// import XComponent from '@component/xComponent/xComponent'
// import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '~/modules/language/'
// import OrdersDetailHistory from './orders_detail.history'

// Storage
// import { dataStorage, func } from '~/storage'
import * as FunctionUtil from '~/lib/base/functionUtil'
import * as Business from '~/business'
// import * as Util from '~/util'
// import * as OrderStreamingBusiness from '~/streaming/order_streaming_business'
// Constant
// import userType from '~/constants/user_type'
// import loginUserType from '~/constants/login_user_type';

const { FLASHING_FIELD, PRICE_DECIMAL } = ENUM

export default class OrderDetail extends Component {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.init()
    }
    init() {
        this.dic = {}
        this.state = {
            data: this.props.data || {}
        }
    }
    checkEmptyObject = (obj) => {
        if (!obj) return false;
        if (Object.keys(obj).length === 0 && obj.constructor === Object) return false;
        return true;
    }
    componentWillReceiveProps(props) {
        this.setState({
            data: props.data || {}
        })
    }
    funcParseJson = (json) => {
        try {
            return JSON.parse(json)
        } catch (error) {
            return {}
        }
    }
    renderRowVertical({ label, value }) {
        return <View style={{ width: '100%', paddingVertical: 8 }}>
            <View style={{ width: '100%' }}>
                <Text
                    numberOfLines={1}
                    style={CommonStyle.textFloatingLabel}>
                    {label}
                </Text>
            </View>

            <View
                style={[{
                    width: '100%',
                    paddingLeft: 0,
                    paddingTop: 8,
                    minHeight: 17.5,
                    borderBottomWidth: 1,
                    paddingBottom: 4,
                    borderColor: CommonStyle.fontBorderGray
                }]}>
                <Text
                    style={CommonStyle.textSubMedium}>
                    {value}
                </Text>
            </View>
        </View>
    }

    renderRowHorizontal({ label, value }) {
        return <View style={{
            width: '100%',
            paddingVertical: 8,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: CommonStyle.fontBorderGray
        }}>
            <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text
                    numberOfLines={1}
                    style={[CommonStyle.themeTxtContent, { opacity: CommonStyle.opacity1 }]}>
                    {label}
                </Text>
            </View>

            <View
                style={[{
                    flex: 7,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    minHeight: 17.5
                }]}>
                <Text
                    style={CommonStyle.textSubMedium}>
                    {value}
                </Text>
            </View>
        </View>
    }

    renderParentOrderID() {
        const label = I18n.t('parentOrderID')
        const value = this.state.data.origin_broker_order_id || '--'
        return this.renderRowHorizontal({ label, value })
    }

    renderOrderID() {
        const label = I18n.t('orderID')
        const value = this.state.data.broker_order_id || '--'
        return this.renderRowHorizontal({ label, value })
    }

    renderDestination() {
        const label = I18n.t('destination')
        const value = this.state.data.actor_changed || '--'
        return this.renderRowHorizontal({ label, value })
    }

    renderEntryTime() {
        const label = I18n.t('entryTime')
        const { init_time: entryTime } = this.state.data
        const value = this.state.data.init_time ? FunctionUtil.renderTime(entryTime) : '--'
        return this.renderRowHorizontal({ label, value })
    }

    renderClass() {
        const { symbol } = this.state.data
        const symbolClass = Business.getSymbolClass({ symbol })
        const label = I18n.t('Product')
        const value = (symbolClass + '').toUpperCase()
        return this.renderRowHorizontal({ label, value })
    }
    renderStatus() {
        const label = I18n.t('Status')
        const value = Business.getStatusString(this.state.data.order_status);
        const colorBg = Business.getBgColorOrderTypeTag(this.state.data.order_status);
        return < View style={{
            width: '100%',
            paddingVertical: 8,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: CommonStyle.fontBorderGray
        }
        }>
            <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text
                    numberOfLines={1}
                    style={[CommonStyle.themeTxtContent, { opacity: CommonStyle.opacity1 }]}>
                    {label}
                </Text>
            </View>

            <View
                style={[{
                    flex: 7,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    minHeight: 17.5
                }]}>
                <View style={{
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    backgroundColor: colorBg,
                    borderRadius: 4
                }}>
                    <Text
                        style={[CommonStyle.textSubMedium, { color: CommonStyle.fontWhite }]}>
                        {I18n.t(value + '').toUpperCase()}
                    </Text>
                </View>
            </View>
        </View >
    }

    renderSide() {
        const label = I18n.t('side_txt');
        const isBuy = this.state.data && this.state.data.is_buy + '' === '1';
        return <View style={{
            width: '100%',
            paddingVertical: 8,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: CommonStyle.fontBorderGray
        }}>
            <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text
                    numberOfLines={1}
                    style={[CommonStyle.themeTxtContent, { opacity: CommonStyle.opacity1 }]}>
                    {label}
                </Text>
            </View>

            <View
                style={[{
                    flex: 7,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    minHeight: 17.5
                }]}>
                <View style={{
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    backgroundColor: isBuy
                        ? CommonStyle.fontGreen
                        : CommonStyle.fontRed,
                    borderRadius: 4
                }}>
                    <Text
                        style={[CommonStyle.textSubMedium, { color: CommonStyle.fontWhite }]}>
                        {
                            isBuy
                                ? I18n.t('buyUpper')
                                : I18n.t('sellUpper')
                        }
                    </Text>
                </View>
            </View>
        </View>
    }

    renderQuantity() {
        const label = I18n.t('quantity')
        const value = FunctionUtil.formatNumberNew2(this.state.data.volume, PRICE_DECIMAL.VOLUME)
        return this.renderRowHorizontal({ label, value })
    }

    renderFilledQuantity() {
        const label = I18n.t('filled')
        const value = FunctionUtil.formatNumberNew2(this.state.data.filled_quantity, PRICE_DECIMAL.VOLUME)
        return this.renderRowHorizontal({ label, value })
    }

    renderLimitPrice() {
        const label = I18n.t('limitPrice')
        const value = FunctionUtil.formatNumberNew2(this.state.data.limit_price, PRICE_DECIMAL.PRICE)
        return this.renderRowHorizontal({ label, value })
    }

    renderTriggerPrice() {
        const label = I18n.t('triggerPrice')
        const value = FunctionUtil.formatNumberNew2(this.state.data.trigger_price, PRICE_DECIMAL.PRICE)
        return this.renderRowHorizontal({ label, value })
    }

    renderFilledPrice() {
        const label = I18n.t('filledPrice')
        const value = FunctionUtil.formatNumberNew2(this.state.data.avg_price, PRICE_DECIMAL.PRICE)
        return this.renderRowHorizontal({ label, value })
    }

    renderOrderType() {
        const label = I18n.t('orderType')
        const value = Business.getOrderTypeString(this.state.data.order_type)
        const str = I18n.t(this.state.data.order_type)
        return this.renderRowHorizontal({ label, str })
    }

    renderDuration() {
        const label = I18n.t('duration')
        const value = this.state.data.duration || ' --'
        return this.renderRowHorizontal({ label, value })
    }

    renderExchange() {
        const label = I18n.t('exchange_txt')
        const value = this.state.data.exchange
        return this.renderRowHorizontal({ label, value })
    }

    renderEstFee() {
        const orderAction = this.funcParseJson(this.state.data.order_action) || {};
        const label = I18n.t('estFee')
        const value = FunctionUtil.formatNumberNew2(orderAction.estimated_fees, PRICE_DECIMAL.PRICE)
        return this.renderRowHorizontal({ label, value })
    }

    renderEstTotal() {
        const label = I18n.t('estTotal')
        const orderAction = this.funcParseJson(this.state.data.order_action) || {};
        const value = FunctionUtil.formatNumberNew2(orderAction.total_convert, PRICE_DECIMAL.PRICE)
        return this.renderRowHorizontal({ label, value })
    }

    render() {
        const checkObj = this.checkEmptyObject(this.state.data)
        if (!checkObj) return <View><Text>No Data</Text></View>
        return <View style={{ marginHorizontal: 16 }}>
            {this.renderParentOrderID()}
            {this.renderOrderID()}
            {this.renderDestination()}
            {this.renderEntryTime()}
            {this.renderClass()}
            {this.renderStatus()}
            {this.renderSide()}
            {this.renderQuantity()}
            {this.renderFilledQuantity()}
            {this.renderLimitPrice()}
            {this.renderTriggerPrice()}
            {this.renderFilledPrice()}
            {this.renderOrderType()}
            {this.renderDuration()}
            {this.renderExchange()}
            {this.renderEstFee()}
            {this.renderEstTotal()}
        </View>
    }
}
