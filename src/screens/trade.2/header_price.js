import { Text, View, Animated } from 'react-native'
import { connect } from 'react-redux';
import _ from 'lodash';

import { func } from '../../storage'
import * as Util from '../../util'
import * as Business from '../../business'
import * as Emitter from '@lib/vietnam-emitter'
import * as FuncUtil from '../../lib/base/functionUtil'
import * as StreamingBusiness from '../../streaming/streaming_business'
import React from 'react'
import Enum from '../../enum'
import PropTypes from 'prop-types'
import PricePieces from './price_pieces'
import styles from '../trade/style/trade'
import HighLightText from './HighLightText'
import Flag from '../../component/flags/flag'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'
import AnnouncementIcon from '../../component/announcement_icon/announcement_icon'

const TREND_VALUE = Enum.TREND_VALUE
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

class TradePriceTopValue extends PricePieces {
    isChange(currentPrice, newPrice) {
        return newPrice.trend !== currentPrice.trend ||
            newPrice.trade_price !== currentPrice.trade_price ||
            newPrice.value_traded !== currentPrice.value_traded
    }

    render() {
        const data = this.dic.data

        return (
            <HighLightText
                base={data.trend}
                testID={`${data.symbol}PriceWL`}
                style={[styles.col2, CommonStyle.textMainNoColor, { textAlign: 'right' }]}
                value={
                    this.dic.isLoading
                        ? '--'
                        : data.trade_price
                            ? data.value_traded
                                ? `AUD ${FuncUtil.largeValue(data.value_traded)}`
                                : '--'
                            : null
                } />
        )
    }
}

class ChangePercent extends PricePieces {
    isChange(currentPrice, newPrice) {
        return newPrice.change_percent !== currentPrice.change_percent
    }

    render() {
        const data = this.dic.data

        return (
            <HighLightText
                style={[
                    styles.col3,
                    CommonStyle.textMainNoColor,
                    { textAlign: 'right' }
                ]}
                base={FuncUtil.formatNumberNew2(data.change_percent, PRICE_DECIMAL.PERCENT)}
                testID={`${data.symbol}changePerWL`}
                percent
                value={
                    this.dic.isLoading
                        ? '--'
                        : data.change_percent != null
                            ? FuncUtil.formatNumberNew2(data.change_percent, PRICE_DECIMAL.PERCENT)
                            : null
                } />
        )
    }
}

class TradeSize extends PricePieces {
    isChange(currentPrice, newPrice) {
        return newPrice.trade_size !== currentPrice.trade_size
    }

    render() {
        const data = this.dic.data

        return (
            <Text
                testID={`${data.symbol}SizeWL`}
                numberOfLines={2}
                style={[
                    styles.col2, CommonStyle.textSub,
                    { textAlign: 'right', paddingRight: 4 }
                ]}>
                {
                    this.dic.isLoading
                        ? '--'
                        : data.trade_size
                            ? FuncUtil.formatNumber(data.trade_size)
                            : '--'
                }
            </Text>
        )
    }
}

class ChangePoint extends PricePieces {
    isChange(currentPrice, newPrice) {
        return newPrice.change_point !== currentPrice.change_point
    }

    render() {
        const data = this.dic.data

        return (
            <HighLightText
                style={[
                    styles.col3,
                    CommonStyle.textSubNoColor,
                    { textAlign: 'right' }
                ]}
                addSymbol
                base={FuncUtil.formatNumberNew2(data.change_point, PRICE_DECIMAL.PRICE)}
                testID={`${data.symbol}changePoiWL`}
                value={
                    this.dic.isLoading
                        ? '--'
                        : data.change_point != null
                            ? FuncUtil.formatNumberNew2(data.change_point, PRICE_DECIMAL.PRICE)
                            : null
                } />
        )
    }
}

class TradePrice extends XComponent {
    static propTypes = {
        data: PropTypes.object,
        timeFlashing: PropTypes.number,
        allowRenderInfo: PropTypes.shape({
            fnGetAllowRender: PropTypes.func,
            channelAllowRender: PropTypes.string
        }),
        indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }

    init() {
        this.onValueChange = this.onValueChange.bind(this)
        this.startFlashing = this.startFlashing.bind(this)
        this.dic = {
            trend: TREND_VALUE.UP,
            data: this.props.data || {},
            opacityFadeOut: new Animated.Value(1),
            timeFlashing: this.props.timeFlashing || Enum.TIME_FLASHING
        }
    }

    componentDidMount() {
        super.componentDidMount()

        const symbol = this.props.data.symbol
        const exchange = func.getExchangeSymbol(symbol)
        const channelName = StreamingBusiness.getChannelLv1(exchange, symbol)
        Emitter.addListener(channelName, this.id, this.onValueChange)

        this.startFlashing()
    }

    isChange(oldData = {}, newData = {}) {
        return oldData.trade_price !== newData.trade_price
    }

    updateTrend(oldData = {}, newData = {}) {
        try {
            return Util
                .getTrendCompareWithOld(newData.trade_price, oldData.trade_price)
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    formatData() {
        try {
            return FuncUtil.formatNumberNew2(this.dic.data.trade_price, PRICE_DECIMAL.PRICE)
        } catch (error) {
            console.catch(error)
            return null
        }
    }

    onValueChange(data) {
        if (this.isChange(this.dic.data, data)) {
            this.dic.trend = this.updateTrend(this.dic.data, data)
            this.dic.data = PureFunc.clone(data)
            this.forceUpdate(this.startFlashing)
        } else {
            this.dic.data = PureFunc.clone(data)
        }
    }

    startFlashing() {
        this.dic.opacityFadeOut.setValue(1)
        this.fadeOutAnim && this.fadeOutAnim.stop()

        this.fadeOutAnim = Animated.timing(this.dic.opacityFadeOut, {
            toValue: 0,
            useNativeDriver: true,
            duration: this.dic.timeFlashing
        })
        this.fadeOutAnim.start()
    }

    getColor(trend) {
        return trend === TREND_VALUE.UP
            ? CommonStyle.fontGreen
            : CommonStyle.fontRed
    }

    renderFlashing() {
        const color = this.getColor(this.dic.trend)
        const value = this.formatData(this.dic.data)
        return (
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        top: 0,
                        right: 0,
                        position: 'absolute',
                        paddingHorizontal: 4
                    }}>
                    <Text
                        style={[
                            CommonStyle.textMainNoColor,
                            { color }
                        ]}>{value}</Text>
                </View>
                <Animated.View
                    style={{
                        top: 0,
                        right: 0,
                        position: 'absolute',
                        paddingHorizontal: 4,
                        backgroundColor: color,
                        opacity: this.dic.opacityFadeOut
                    }}>
                    <Text
                        style={[
                            CommonStyle.textMainNoColor,
                            {
                                color: '#fff'
                            }
                        ]}>{value}</Text>
                </Animated.View>
            </View>
        )
    }

    renderNoneValue() {
        return (
            <Text style={{ paddingHorizontal: 4, textAlign: 'right' }}>{'--'}</Text>
        )
    }

    render() {
        return this.dic.data.trade_price
            ? this.renderFlashing()
            : this.renderNoneValue()
    }
}

class HeaderPriceComp extends XComponent {
    static propTypes = {
        data: PropTypes.object,
        loadingInfo: PropTypes.object,
        isNewsToday: PropTypes.bool,
        allowRenderInfo: PropTypes.object,
        indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }

    shouldComponentUpdate(nextProps) {
        const { isRealtime: oldIsRealtime, ...oldProps } = this.props;
        const { isRealtime: newIsRealtime, ...newProps } = nextProps;
        if (oldIsRealtime !== newIsRealtime) {
            const { symbol } = newProps.data || {};

            const exchange = func.getExchangeSymbol(symbol);
            const channelName = StreamingBusiness.getChannelLv1(
                exchange,
                symbol
            );
            Emitter.setMiddleware(channelName, (newData, oldData) => {
                if (newIsRealtime) {
                    if (this.dicOldData) {
                        this.dicOldData = null;
                    }
                    return newData;
                } else {
                    if (!this.dicOldData) {
                        this.dicOldData = oldData;
                    }
                    this.dicData = newData;
                    return this.dicOldData;
                }
            });
            if (newIsRealtime && this.dicData) {
                Emitter.emit(channelName, this.dicData);
            }
            return !_.isEqual(oldProps, newProps);
        }
    }

    init() {
        const data = this.props.data || {}

        this.state = {
            tradingHalt: func.getHaltSymbol(data.symbol)
        }
    }

    componentDidMount() {
        super.componentDidMount()

        this.subHalt()
    }

    subHalt() {
        const symbol = this.props.data.symbol
        const channel = StreamingBusiness.getChannelHalt(symbol)
        Emitter.addListener(channel, this.id, () => {
            FuncUtil.checkTradingHalt(symbol)
                .then((snap = {}) => {
                    const tradingHalt = PureFunc.getBooleanable(snap.trading_halt, false)
                    this.setState({ tradingHalt })
                })
        })
    }

    renderLeftTop() {
        const symbol = this.props.data.symbol
        const displayName = func.getDisplayNameSymbol(symbol) || symbol
        // const flagIcon = Business.getFlagsWithNonExistSymbol(symbol)
        const flagIcon = Business.getFlag(symbol)
        return (
            <View style={[styles.col1, { flexDirection: 'row' }]}>
                <Text
                    style={[
                        CommonStyle.textMainRed,
                        { flex: this.state.tradingHalt ? 0.6 : 0 }
                    ]}>
                    {this.state.tradingHalt ? '!' : ''}
                </Text>
                <Text
                    testID={`${symbol}HeaderWL`}
                    style={[
                        CommonStyle.textMain,
                        { flex: this.state.tradingHalt ? 8.4 : 9 }
                    ]}>
                    {displayName}
                </Text>
                <Text style={{ flex: 0.5 }}></Text>
                <View style={{ flex: 4, alignItems: 'center', flexDirection: 'row' }}>
                    <Flag style={{ marginTop: 1 }} type={'flat'} code={flagIcon} size={18.5} />
                    <Text style={{ flex: 1 }}></Text>
                    <AnnouncementIcon
                        symbol={symbol}
                        isNewsToday={this.props.isNewsToday}
                        containerStyle={{
                            width: 13,
                            height: 13,
                            marginTop: 1,
                            borderRadius: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: this.props.isNewsToday
                                ? CommonStyle.newsActive
                                : CommonStyle.newsInactive
                        }}
                        contentStyle={{
                            color: CommonStyle.newsTextColor,
                            fontFamily: CommonStyle.fontFamily,
                            fontSize: CommonStyle.fontSizeXS - 3,
                            textAlign: 'center'
                        }}
                    />
                </View>
            </View>
        )
    }

    render() {
        try {
            const symbol = this.props.data.symbol
            const section = func.getSymbolObj(symbol);
            const securityName = section.company_name || section.company || section.security_name
            const isTopValuePriceboard = func.isCurrentPriceboardTopValue()
            const priceBoardId = func.getCurrentPriceboardId()

            return (
                <View style={{
                    width: '100%',
                    paddingVertical: 6,
                    backgroundColor: CommonStyle.backgroundColor,
                    justifyContent: 'space-between',
                    paddingHorizontal: CommonStyle.paddingSize
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        {this.renderLeftTop()}
                        {
                            isTopValuePriceboard
                                ? <TradePriceTopValue
                                    data={this.props.data}
                                    autoControlRender={true}
                                    loadingInfo={this.props.loadingInfo}
                                    indexInList={this.props.indexInList}
                                    allowRenderInfo={this.props.allowRenderInfo}
                                />
                                : <View style={[styles.col2, { flex: 1 }]}>
                                    <TradePrice
                                        data={this.props.data}
                                        autoControlRender={true}
                                        loadingInfo={this.props.loadingInfo}
                                        indexInList={this.props.indexInList}
                                        allowRenderInfo={this.props.allowRenderInfo}
                                    />
                                </View>
                        }
                        <ChangePercent
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            testID={`${this.props.data.symbol}NameWL`}
                            style={[styles.col1, CommonStyle.textSub1]}>
                            {securityName}
                        </Text>
                        {
                            isTopValuePriceboard || priceBoardId === Enum.WATCHLIST.TOP_ASX_INDEX
                                ? <Text
                                    testID={`${this.props.data.symbol}SizeWL`}
                                    numberOfLines={2}
                                    style={[styles.col2, CommonStyle.textSub, { textAlign: 'right' }]}>
                                    {}
                                </Text>
                                : <TradeSize
                                    data={this.props.data}
                                    autoControlRender={true}
                                    loadingInfo={this.props.loadingInfo}
                                    indexInList={this.props.indexInList}
                                    allowRenderInfo={this.props.allowRenderInfo}
                                />
                        }
                        <ChangePoint
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                    </View>
                </View>
            )
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
}

function mapStateToProps(state, { indexInList }) {
    const { startPoint, endPoint } = state.watchlist2.childShowedInfo;
    const check = indexInList >= startPoint && indexInList <= endPoint && startPoint !== -1;
    return {
        isRealtime: check
    };
}

export default connect(mapStateToProps)(HeaderPriceComp)
