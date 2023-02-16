import React from 'react';
import { Text, View } from 'react-native';
import * as FuncUtil from '../../lib/base/functionUtil';
import styles from '../trade/style/trade';
import { func } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'
import * as Emitter from '@lib/vietnam-emitter';
import * as Business from '../../business';
import * as Util from '../../util';
import Flag from '../../component/flags/flag';
import Enum from '../../enum'
import * as StreamingBusiness from '../../streaming/streaming_business';
import Flashing from '../../component/flashing/flashing.1'
import PropTypes from 'prop-types';
import HighLightText from '../../modules/_global/HighLightText';
import PricePieces from '../../component/price_pieces/price_pieces.1'
import AnnouncementIcon from '../../component/announcement_icon/announcement_icon'

const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class HeaderPrice extends XComponent {
    static propTypes = {
        symbol: PropTypes.string,
        value: PropTypes.object,
        channelLv1FromComponent: PropTypes.string,
        allowRender: PropTypes.bool,
        channelAllowRender: PropTypes.string,
        isLoading: PropTypes.bool,
        isNewsToday: PropTypes.bool,
        channelLoadingTrade: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.subHalt = this.subHalt.bind(this)
        this.renderLeftTop = this.renderLeftTop.bind(this)
        this.renderTextBorder = this.renderTextBorder.bind(this)
        this.isTradeSizeChange = this.isTradeSizeChange.bind(this)
        this.isValueTradeChange = this.isValueTradeChange.bind(this)
        this.isTradePriceChange = this.isTradePriceChange.bind(this)
        this.isChangePointChange = this.isChangePointChange.bind(this)
        this.formatFuncTradeSize = this.formatFuncTradeSize.bind(this)
        this.formatFuncValueTrade = this.formatFuncValueTrade.bind(this)
        this.formatFuncTradePrice = this.formatFuncTradePrice.bind(this)
        this.isChangePercentChange = this.isChangePercentChange.bind(this)
        this.updateTrendTradePrice = this.updateTrendTradePrice.bind(this)
        this.formatFuncChangePoint = this.formatFuncChangePoint.bind(this)
        this.formatFuncChangePercent = this.formatFuncChangePercent.bind(this)

        this.dic = {
            value: this.props.value || {}
        };
        this.state = {
            tradingHalt: func.getHaltSymbol(this.props.symbol),
            isNewsToday: this.props.isNewsToday || false
        };
    }

    subHalt() {
        try {
            const channel = StreamingBusiness.getChannelHalt(this.props.symbol);
            Emitter.addListener(channel, this.id, () => {
                if (!this.isMount) return false
                FuncUtil.checkTradingHalt(this.props.symbol)
                    .then(snap => {
                        const tradingHalt = snap && snap.trading_halt ? snap.trading_halt : false;
                        this.setState({ tradingHalt });
                    })
            })

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    componentDidMount() {
        try {
            super.componentDidMount()
            this.subHalt()

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    renderLeftTop(data, displayName) {
        try {
            const flagIcon = Business.getFlag(data.symbol);
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
                        testID={`${data.symbol}HeaderWL`}
                        style={[
                            CommonStyle.textMain,
                            { flex: this.state.tradingHalt ? 8.4 : 9 }
                        ]}>
                        {displayName}
                    </Text>
                    <Text style={{ flex: 0.5 }}></Text>
                    <View
                        style={{
                            flex: 4,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                        <Flag
                            style={{ marginTop: 1 }}
                            type={'flat'}
                            code={flagIcon}
                            size={18.5}
                        />
                        <Text style={{ flex: 1 }}></Text>
                        <AnnouncementIcon
                            isNewsToday={this.state.isNewsToday}
                            symbol={this.props.symbol}
                            containerStyle={{
                                marginTop: 1,
                                backgroundColor: this.state.isNewsToday
                                    ? '#f28bb0'
                                    : '#0000001e',
                                height: 13,
                                width: 13,
                                borderRadius: 1,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            contentStyle={{
                                fontSize: CommonStyle.fontSizeXS - 3,
                                color: 'white',
                                fontFamily: CommonStyle.fontFamily
                            }}
                        />
                    </View>
                </View>
            )
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }

    renderTextBorder(text, color, isShow) {
        if (isShow) {
            return (
                <View style={{
                    backgroundColor: color,
                    height: 11.9,
                    width: 11.8,
                    borderRadius: 1,
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end'
                }}>
                    <View
                        style={{
                            width: 11.2,
                            height: 11.6,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        <Text
                            allowFontScaling={false}
                            style={{
                                fontSize: CommonStyle.fontSizeXS - 3,
                                color: 'white',
                                fontFamily: CommonStyle.fontFamily
                            }}>{text}</Text>
                    </View>
                </View>
            )
        }
        return <View />
    }

    isValueTradeChange(oldData = {}, newData = {}) {
        return oldData.trend !== newData.trend ||
            oldData.trade_price !== newData.trade_price ||
            oldData.value_traded !== newData.value_traded
    }
    formatFuncValueTrade(value = {}, isLoading) {
        try {
            return (
                <HighLightText
                    style={[
                        styles.col2,
                        CommonStyle.textMainNoColor,
                        { textAlign: 'right' }]}
                    base={value.trend}
                    testID={`${value.symbol}PriceWL`}
                    value={
                        isLoading
                            ? '--'
                            : value.trade_price
                                ? value.value_traded
                                    ? `AUD ${FuncUtil.largeValue(value.value_traded)}`
                                    : '--'
                                : null
                    } />
            )
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
    isTradePriceChange(oldData = {}, newData = {}) {
        return oldData.trade_price !== newData.trade_price;
    }
    updateTrendTradePrice(oldData = {}, newData = {}) {
        try {
            return Util
                .getTrendCompareWithOld(newData.trade_price, oldData.trade_price)
        } catch (error) {
            console.catch(error)
            return false
        }
    }
    formatFuncTradePrice(value = {}) {
        try {
            return FuncUtil.formatNumberNew2(value.trade_price, PRICE_DECIMAL.PRICE)
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    isChangePercentChange(oldData = {}, newData = {}) {
        return oldData.change_percent !== newData.change_percent;
    }
    formatFuncChangePercent(value = {}, isLoading) {
        try {
            return (
                <HighLightText
                    style={[
                        styles.col3,
                        CommonStyle.textMainNoColor,
                        { textAlign: 'right', opacity: CommonStyle.opacity1 }
                    ]}
                    base={FuncUtil.formatNumberNew2(value.change_percent, PRICE_DECIMAL.PERCENT)}
                    testID={`${value.symbol}changePerWL`}
                    percent
                    value={
                        isLoading
                            ? '--'
                            : value.change_percent != null
                                ? FuncUtil.formatNumberNew2(value.change_percent, PRICE_DECIMAL.PERCENT)
                                : null
                    } />
            )
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
    isTradeSizeChange(oldData = {}, newData = {}) {
        return oldData.trade_size !== newData.trade_size;
    }
    formatFuncTradeSize(value = {}, isLoading) {
        try {
            return <Text
                testID={`${value.symbol}SizeWL`}
                numberOfLines={2}
                style={[
                    styles.col2, CommonStyle.textSub,
                    { textAlign: 'right', paddingRight: 4 }
                ]}>
                {
                    isLoading
                        ? '--'
                        : value.trade_size
                            ? FuncUtil.formatNumber(value.trade_size)
                            : '--'
                }
            </Text>
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
    isChangePointChange(oldData = {}, newData = {}) {
        return oldData.change_point !== newData.change_point;
    }
    formatFuncChangePoint(value = {}, isLoading) {
        try {
            return <HighLightText
                style={[
                    styles.col3,
                    CommonStyle.textSubNoColor,
                    { textAlign: 'right' }
                ]}
                addSymbol
                base={FuncUtil.formatNumberNew2(value.change_point, PRICE_DECIMAL.PRICE)}
                testID={`${value.symbol}changePoiWL`}
                value={
                    isLoading
                        ? '--'
                        : value.change_point != null
                            ? FuncUtil.formatNumberNew2(value.change_point, PRICE_DECIMAL.PRICE)
                            : null
                } />
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }

    render() {
        try {
            const displayName = func.getDisplayNameSymbol(this.props.symbol) || this.props.symbol
            const companyName = func.getCompanyName(this.props.symbol).toUpperCase()
            const isTopValuePriceboard = func.isCurrentPriceboardTopValue()
            const priceBoardId = func.getCurrentPriceboardId()

            return (
                <View style={{
                    paddingHorizontal: CommonStyle.paddingSize,
                    paddingVertical: 6,
                    backgroundColor: CommonStyle.backgroundColor,
                    justifyContent: 'space-between',
                    width: '100%'
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        {this.renderLeftTop(this.dic.value, displayName)}
                        {
                            isTopValuePriceboard
                                ? <PricePieces
                                    value={this.dic.value}
                                    channelLv1FromComponent={this.props.channelLv1FromComponent}
                                    isLoading={this.props.isLoading}
                                    channelLoadingTrade={this.props.channelLoadingTrade}
                                    isValueChange={this.isValueTradeChange}
                                    formatFunc={this.formatFuncValueTrade} />
                                : <View style={[styles.col2, { flex: 1 }]}>
                                    <Flashing
                                        value={this.dic.value}
                                        channelLv1FromComponent={this.props.channelLv1FromComponent}
                                        field={'trade_price'}
                                        style={{
                                            ...CommonStyle.textMainNoColor,
                                            opacity: CommonStyle.opacity1
                                        }}
                                        isValueChange={this.isTradePriceChange}
                                        updateTrend={this.updateTrendTradePrice}
                                        formatFunc={this.formatFuncTradePrice} />
                                </View>
                        }
                        <PricePieces
                            value={this.dic.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                            isValueChange={this.isChangePercentChange}
                            formatFunc={this.formatFuncChangePercent} />
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            testID={`${this.dic.value.symbol}NameWL`}
                            style={[styles.col1, CommonStyle.textSub]}>
                            {companyName}
                        </Text>
                        {
                            isTopValuePriceboard || priceBoardId === Enum.WATCHLIST.TOP_ASX_INDEX
                                ? <Text
                                    testID={`${this.dic.value.symbol}SizeWL`}
                                    numberOfLines={2}
                                    style={[styles.col2, CommonStyle.textSub, { textAlign: 'right' }]}>
                                    {}
                                </Text>
                                : <PricePieces
                                    value={this.dic.value}
                                    channelLv1FromComponent={this.props.channelLv1FromComponent}
                                    isLoading={this.props.isLoading}
                                    channelLoadingTrade={this.props.channelLoadingTrade}
                                    isValueChange={this.isTradeSizeChange}
                                    formatFunc={this.formatFuncTradeSize} />
                        }
                        <PricePieces
                            value={this.dic.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                            isValueChange={this.isChangePointChange}
                            formatFunc={this.formatFuncChangePoint} />
                    </View>
                </View>
            )
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
};
