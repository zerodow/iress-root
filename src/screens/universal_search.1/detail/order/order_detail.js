import React, { Component } from 'react'
import {
    View, Text
} from 'react-native'
import XComponent from '@component/xComponent/xComponent'

// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// ENUM
import ENUM from '~/enum'
// Redux
import I18n from '~/modules/language/'
import * as FunctionUtil from '~/lib/base/functionUtil'
import * as Business from '~/business';
import * as Util from '~/util'
import * as InvertTraslate from '~/invert_translate'
import filterType from '~/constants/filter_type';
import originationEnum from '~/constants/origination'
import * as StreamingBusiness from '~/streaming/streaming_business'
import * as Emitter from '@lib/vietnam-emitter';
import moment from 'moment';
import orderTypeString from '~/constants/order_type_string'

const { PRICE_DECIMAL, DURATION_CODE } = ENUM

export default class OrderDetail extends XComponent {
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

    renderRowHorizontal({ label, value, labelStyle = {}, valueStyle = {} }) {
        return <View style={{
            width: '100%',
            paddingVertical: 16,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: CommonStyle.fontBorderGray
        }}>
            <View style={[{ flex: 3, justifyContent: 'center' }, labelStyle]}>
                <Text
                    numberOfLines={1}
                    style={[CommonStyle.themeTxtContent, { opacity: CommonStyle.opacity1 }]}>
                    {label || '--'}
                </Text>
            </View>

            <View
                style={[{
                    flex: 7,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    minHeight: 17.5
                }, valueStyle]}>
                <Text
                    style={CommonStyle.textSubMedium}>
                    {value || '--'}
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
        const { destination } = this.state.data
        const label = I18n.t('destination')
        const value = destination || '--'
        return this.renderRowHorizontal({ label, value })
    }
    renderOrigination() {
        const { origination } = this.state.data
        const label = I18n.t('origination')
        const value = origination && originationEnum[origination] ? originationEnum[origination] : '--'
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
        const { order_status: orderStatus } = this.state.data
        const label = I18n.t('Status')
        const value = Business.getStatusString(orderStatus)
        const colorBg = Business.getBgColorOrderTypeTag(orderStatus)
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
    getOrderType(key) {
        try {
            key = (key + '').toUpperCase();
            const newKey = (key + '').replace('_ORDER', '');
            if (orderTypeString[newKey] === orderTypeString.STOPLIMIT) return orderTypeString.STOPLOSS
            const stringReturn = orderTypeString[newKey];
            if (!stringReturn) return '--'
            return stringReturn;
        } catch (error) {
            console.log('getOrderType listContent logAndReport exception: ', error)
            FunctionUtil.logAndReport('getOrderType listcontent exception', error, 'getOrderType listContent');
            return ''
        }
    }
    renderOrderType() {
        const { order_type: orderType } = this.state.data
        const orderTypeString = this.getOrderType(orderType)
        const displayOrderType = InvertTraslate.getInvertTranslate(orderTypeString)
        const label = I18n.t('orderType')
        const value = displayOrderType
        return this.renderRowHorizontal({ label, value })
    }

    renderDuration() {
        const duration = this.getDuration(this.state.data)
        const label = I18n.t('duration')
        const value = duration
        return this.renderRowHorizontal({ label, value })
    }
    getDuration(data) {
        const duration = data.duration
        const expireDate = data.expire_date

        if (duration === DURATION_CODE.GTD) {
            if (!expireDate) return ''
            return moment.utc(expireDate).format('DD/MM/YYYY')
        }
        if (duration === DURATION_CODE.DAY) {
            return I18n.t('dayOnly')
        }
        return duration
    }
    renderExchange() {
        const { exchange, symbol } = this.state.data
        const displayExchange = Business.getDisplayExchange({ exchange, symbol })
        const tradingMarket = this.getTradingMarket()
        const label = I18n.t('exchange_txt')
        const value = displayExchange === 'ASX'
            ? Business.getExchangeName(tradingMarket, displayExchange)
            : displayExchange
        return this.renderRowHorizontal({ label, value })
    }
    getTradingMarket() {
        const { trading_market: tradingMarket } = this.state.data
        let exchange = tradingMarket
        if (tradingMarket && tradingMarket === 'SAXO_BANK') {
            exchange = this.state.data.exchange
        }
        return exchange
    }
    renderEstFee() {
        const { ordersTab } = this.state.data;
        if (ordersTab === filterType.CANCELLED) return null
        const { order_action: orderAction } = this.state.data
        let orderActionObj = {}
        try {
            orderActionObj = JSON.parse(orderAction)
        } catch (error) {
            console.log('renderEstFee error', error)
        }
        const { estimated_fees: estFees } = orderActionObj
        const {
            currency,
            symbolCur
        } = Util.renderCurBaseOnAccountCur()
        const estFeeStr = FunctionUtil.formatNumberNew2(estFees, PRICE_DECIMAL.VALUE, currency)
        const label = `${I18n.t(ordersTab === filterType.FILLED ? 'fees' : 'estFee')} (${currency})`
        const value = Util.formatByCurrency({
            icon: symbolCur,
            value: estFeeStr,
            currency
        })
        const labelStyle = {
            flex: 5
        }
        const valueStyle = {
            flex: 5
        }
        return this.renderRowHorizontal({ label, value, labelStyle, valueStyle })
    }

    renderEstTotal() {
        const { ordersTab } = this.state.data;
        if (ordersTab === filterType.CANCELLED) return null
        const { order_action: orderAction } = this.state.data
        let orderActionObj = {}
        try {
            orderActionObj = JSON.parse(orderAction)
        } catch (error) {
            console.log('renderEstTotal error', error)
        }
        const { total_convert: estTotal } = orderActionObj
        const {
            currency,
            symbolCur
        } = Util.renderCurBaseOnAccountCur()
        const estTotalStr = FunctionUtil.formatNumberNew2(estTotal, PRICE_DECIMAL.VALUE, currency)
        const label = `${I18n.t(ordersTab === filterType.FILLED ? 'total' : 'estTotal')} (${currency})`
        const value = Util.formatByCurrency({
            icon: symbolCur,
            value: estTotalStr,
            currency
        })
        const labelStyle = {
            flex: 5
        }
        const valueStyle = {
            flex: 5
        }
        return this.renderRowHorizontal({ label, value, labelStyle, valueStyle })
    }

    render() {
        const checkObj = this.checkEmptyObject(this.state.data)
        if (!checkObj) return <View><Text>No Data</Text></View>
        return <View style={{ marginHorizontal: 16 }}>
            {this.renderParentOrderID()}
            {this.renderOrderID()}
            {this.renderOrigination()}
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
    componentDidMount = () => {
        super.componentDidMount();
        const { data } = this.props;
        if (!data || !data.broker_order_id) return;
        const channelOrderBrokerOrderID = StreamingBusiness.getChannelOrderBrokerOrderID(data.broker_order_id)
        this.listenerReconnectSSE = Emitter.addListener(channelOrderBrokerOrderID, null, ({ data: dataNoti, title }) => {
            this.setState({ data: dataNoti })
        })
    }
    componentWillUnmount = () => {
        super.componentWillUnmount();
        this.listenerReconnectSSE && Emitter.deleteEvent(StreamingBusiness.getChannelOrderReconnectSSE(ENUM.ACTION_ORD.CANCEL))
        this.listenerReconnectSSE = null
    };
}
