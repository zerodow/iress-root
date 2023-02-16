import React from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';
import * as FuncUtil from '../../lib/base/functionUtil';
import styles from '../trade/style/trade';
import ButtonBoxRealtime from '../../modules/_global/ButtonBoxRealtime';
import { func, dataStorage } from '../../storage';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'
import OhlcWatchlist from '../../component/price_pieces/ohlc_watchlist'
import Enum from '../../enum'

const SIDE = Enum.SIDE;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class ContentPrice extends XComponent {
    static propTypes = {
        placingOrderHookFunc: PropTypes.func.isRequired,
        setting: PropTypes.object.isRequired,
        value: PropTypes.object,
        channelLv1FromComponent: PropTypes.string,
        isLoading: PropTypes.bool,
        channelLoadingTrade: PropTypes.string,
        isConnected: PropTypes.bool,
        login: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.dic = {
            isPress: false,
            type: '',
            data: []
        };

        this.showPriceClose = this.showPriceClose.bind(this)
        this.setTimeoutClickable = this.setTimeoutClickable.bind(this)
        this.formatFuncOpenPrice = this.formatFuncOpenPrice.bind(this)
        this.formatFuncPreviousClose = this.formatFuncPreviousClose.bind(this)
        this.formatFuncHigh = this.formatFuncHigh.bind(this)
        this.formatFuncClose = this.formatFuncClose.bind(this)
        this.formatFuncLow = this.formatFuncLow.bind(this)
        this.formatFuncVolume = this.formatFuncVolume.bind(this)
        this.formatFuncBidSize = this.formatFuncBidSize.bind(this)
        this.formatFuncBidPrice = this.formatFuncBidPrice.bind(this)
        this.onClickBuy = this.onClickBuy.bind(this)
        this.formatFuncAskPrice = this.formatFuncAskPrice.bind(this)
        this.formatFuncAskSize = this.formatFuncAskSize.bind(this)
        this.onClickSell = this.onClickSell.bind(this)
    }

    showPriceClose(closePrice) {
        try {
            return closePrice <= 0 || closePrice == null
                ? '--'
                : FuncUtil.formatNumberNew2(closePrice, PRICE_DECIMAL.PRICE)
        } catch (error) {
            console.catch(error)
            return null
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    setTimeoutClickable() {
        this.dic.isPress = true;
        setTimeout(() => {
            this.dic.isPress = false;
        }, 1500);
    }

    formatFuncOpenPrice(data = {}, isLoading) {
        try {
            return data.open <= 0 || isLoading
                ? '--'
                : FuncUtil.formatNumberNew2(data.open, PRICE_DECIMAL.PRICE)
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncPreviousClose(data = {}, isLoading) {
        try {
            return data.previous_close <= 0 || isLoading
                ? '--'
                : FuncUtil.formatNumberNew2(data.previous_close, PRICE_DECIMAL.PRICE)
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncHigh(data = {}, isLoading) {
        try {
            const value = data.high <= 0 || isLoading
                ? '--'
                : data.high
            return FuncUtil.formatNumberNew2(value, PRICE_DECIMAL.PRICE)
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncClose(data = {}, isLoading) {
        try {
            return isLoading ? '--' : this.showPriceClose(data.close)
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncLow(data = {}, isLoading) {
        try {
            return FuncUtil.formatNumberNew2(data.low <= 0 || isLoading
                ? '--'
                : data.low, PRICE_DECIMAL.PRICE);
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncVolume(data = {}, isLoading) {
        try {
            const value = data.volume <= 0 || isLoading
                ? '--'
                : FuncUtil.largeValue(data.volume)
            return FuncUtil.formatNumber(value)
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncBidSize(data = {}, isLoading) {
        try {
            return isLoading
                ? '--'
                : data.bid_size
                    ? FuncUtil.formatNumber(data.bid_size)
                    : 0
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncBidPrice(data = {}, isLoading) {
        try {
            return isLoading
                ? '--'
                : data.bid_price
                    ? FuncUtil.formatNumberNew2(data.bid_price, PRICE_DECIMAL.PRICE)
                    : '--'
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    onClickBuy() {
        try {
            if (this.dic.isPress) return false
            this.setTimeoutClickable()
            this.props.placingOrderHookFunc(SIDE.BUY, this.props.value)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }
    formatFuncAskPrice(data = {}, isLoading) {
        try {
            return isLoading
                ? '--'
                : data.ask_price
                    ? FuncUtil.formatNumberNew2(data.ask_price, PRICE_DECIMAL.PRICE)
                    : '--'
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    formatFuncAskSize(data = {}, isLoading) {
        try {
            return isLoading
                ? '--'
                : data.ask_size
                    ? FuncUtil.formatNumber(data.ask_size)
                    : 0
        } catch (error) {
            console.catch(error)
            return null
        }
    }
    onClickSell() {
        try {
            if (this.dic.isPress) return false
            this.setTimeoutClickable()
            this.props.placingOrderHookFunc(SIDE.SELL, this.props.value)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    render() {
        const loading = this.props.isLoading
        const rowData = this.props.value

        return (
            <View style={{ width: '100%', marginTop: 2 }}>
                <View style={styles.rowExpand}>
                    <View style={styles.expandLine}>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub,
                                { width: '20%' }
                            ]}>
                            {I18n.t('openSearch', { locale: this.props.setting.lang })}
                        </Text>
                        <OhlcWatchlist
                            testID={`${rowData.symbol}wlO`}
                            field={'open'}
                            parentID={this.id}
                            style={[CommonStyle.textSubBold, { width: '28%' }]}
                            formatFunc={this.formatFuncOpenPrice}
                            value={this.props.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                        />
                        <Text style={{ width: '4%' }}></Text>
                        <Text
                            testID={`${rowData.previous_close}wlO`}
                            style={[CommonStyle.textSub, { width: '27%' }]}>
                            {I18n.t('previousClose', { locale: this.props.setting.lang })}
                        </Text>
                        <OhlcWatchlist
                            testID={`${rowData.previous_close}wlO`}
                            formatFunc={this.formatFuncPreviousClose}
                            style={[
                                CommonStyle.textSubBold,
                                { width: '21%', textAlign: 'right' }
                            ]}
                            field={'previous_close'}
                            parentID={this.id}
                            value={this.props.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                        />
                    </View>
                    <View style={styles.expandLine}>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[CommonStyle.textSub, { width: '20%' }]}>
                            {I18n.t('high', { locale: this.props.setting.lang })}
                        </Text>
                        <OhlcWatchlist
                            testID={`${rowData.symbol}wlO`}
                            formatFunc={this.formatFuncHigh}
                            style={[CommonStyle.textSubBold, { width: '28%' }]}
                            field={'high'}
                            parentID={this.id}
                            value={this.props.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                        />
                        <Text style={{ width: '4%' }}></Text>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub,
                                { width: '27%' }
                            ]}>
                            {I18n.t('close', { locale: this.props.setting.lang })}
                        </Text>
                        <OhlcWatchlist
                            testID={`${rowData.symbol}wlO`}
                            formatFunc={this.formatFuncClose}
                            style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}
                            field={'close'}
                            parentID={this.id}
                            value={this.props.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                        />
                    </View>
                    <View style={styles.expandLine}>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub,
                                { width: '20%' }
                            ]}>
                            {I18n.t('low', { locale: this.props.setting.lang })}
                        </Text>
                        <Text >{}</Text>
                        <OhlcWatchlist
                            testID={`${rowData.symbol}wlO`}
                            formatFunc={this.formatFuncLow}
                            style={[CommonStyle.textSubBold, { width: '28%' }]}
                            field={'low'}
                            parentID={this.id}
                            value={this.props.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                        />
                        <Text style={{ width: '4%' }}></Text>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub,
                                { width: '27%' }
                            ]}>
                            {I18n.t('volume', { locale: this.props.setting.lang })}
                        </Text>
                        <OhlcWatchlist
                            testID={`${rowData.symbol}wlO`}
                            formatFunc={this.formatFuncVolume}
                            style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}
                            field={'volume'}
                            parentID={this.id}
                            value={this.props.value}
                            channelLv1FromComponent={this.props.channelLv1FromComponent}
                            isLoading={this.props.isLoading}
                            channelLoadingTrade={this.props.channelLoadingTrade}
                        />
                    </View>
                </View>
                <View style={[styles.buttonExpand]}>
                    <ButtonBoxRealtime
                        testID={`${rowData.symbol}SellButton`}
                        componentChild={OhlcWatchlist}
                        login={this.props.login}
                        isLoading={this.props.isLoading}
                        channelLoadingTrade={this.props.channelLoadingTrade}
                        isConnected={this.props.isConnected}
                        channelLv1FromComponent={this.props.channelLv1FromComponent}
                        width={'48%'}
                        buy
                        field1={'bid_size'}
                        field2={'bid_price'}
                        value1={rowData}
                        value2={rowData}
                        formatFunc1={this.formatFuncBidSize}
                        formatFunc2={this.formatFuncBidPrice}
                        onPress={this.onClickBuy}
                    />
                    <View style={{ width: '4%' }}></View>
                    <ButtonBoxRealtime
                        testID={`${rowData.symbol}BuyButton`}
                        componentChild={OhlcWatchlist}
                        login={this.props.login}
                        isLoading={this.props.isLoading}
                        channelLoadingTrade={this.props.channelLoadingTrade}
                        isConnected={this.props.isConnected}
                        channelLv1FromComponent={this.props.channelLv1FromComponent}
                        width={'48%'}
                        field1={'ask_price'}
                        field2={'ask_size'}
                        value1={rowData}
                        value2={rowData}
                        formatFunc1={this.formatFuncAskPrice}
                        formatFunc2={this.formatFuncAskSize}
                        onPress={this.onClickSell}
                    />
                </View>
            </View>
        );
    }
};
