import { Text, View } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter'
import * as FuncUtil from '../../lib/base/functionUtil'
import React from 'react'
import Enum from '../../enum'
import PropTypes from 'prop-types'
import PricePieces from './price_pieces'
import styles from '../trade/style/trade'
import I18n from '../../modules/language/'
import ButtonBoxRealtime from './ButtonBoxRealtime'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'

const SIDE = Enum.SIDE;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

class Open extends PricePieces {
    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice.open !== currentPrice.open
    }

    render() {
        const open = this.dic.data.open
        const symbol = this.dic.data.symbol
        return (
            <Text
                style={[CommonStyle.textSubBold1, { width: '28%' }]}
                testID={`${symbol}wlO`} >
                {
                    open < 0 || this.dic.isLoading
                        ? '--'
                        : FuncUtil.formatNumberNew2(open, PRICE_DECIMAL.PRICE)
                }
            </Text>
        )
    }
}

class PreviousClose extends PricePieces {
    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice.previous_close !== currentPrice.previous_close
    }

    render() {
        const previousClose = this.dic.data.previous_close
        const symbol = this.dic.data.symbol

        return (
            <Text
                style={[CommonStyle.textSubBold1, { width: '21%', textAlign: 'right' }]}
                testID={`${symbol}wlO`} >
                {
                    previousClose < 0 || this.dic.isLoading
                        ? '--'
                        : FuncUtil.formatNumberNew2(previousClose, PRICE_DECIMAL.PRICE)
                }
            </Text>
        )
    }
}

class High extends PricePieces {
    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice.high !== currentPrice.high
    }

    render() {
        const high = this.dic.data.high
        const symbol = this.dic.data.symbol

        return (
            <Text
                style={[CommonStyle.textSubBold1, { width: '28%' }]}
                testID={`${symbol}wlO`} >
                {
                    high < 0 || this.dic.isLoading
                        ? '--'
                        : FuncUtil.formatNumberNew2(high, PRICE_DECIMAL.PRICE)
                }
            </Text>
        )
    }
}

class Close extends PricePieces {
    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice.close !== currentPrice.close
    }

    render() {
        const close = this.dic.data.close
        const symbol = this.dic.data.symbol

        return (
            <Text
                style={[CommonStyle.textSubBold1, { width: '21%', textAlign: 'right' }]}
                testID={`${symbol}wlO`} >
                {
                    this.dic.isLoading
                        ? '--'
                        : close < 0 || close == null
                            ? '--'
                            : FuncUtil.formatNumberNew2(close, PRICE_DECIMAL.PRICE)
                }
            </Text>
        )
    }
}

class Low extends PricePieces {
    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice.low !== currentPrice.low
    }

    render() {
        const low = this.dic.data.low
        const symbol = this.dic.data.symbol

        return (
            <Text
                style={[CommonStyle.textSubBold1, { width: '28%' }]}
                testID={`${symbol}wlO`} >
                {
                    low < 0 || this.dic.isLoading
                        ? '--'
                        : FuncUtil.formatNumberNew2(low, PRICE_DECIMAL.PRICE)
                }
            </Text>
        )
    }
}

class Volume extends PricePieces {
    isChange(currentPrice = {}, newPrice = {}) {
        return newPrice.volume !== currentPrice.volume
    }

    render() {
        const symbol = this.dic.data.symbol
        const value = this.dic.data.volume < 0 || this.dic.isLoading
            ? '--'
            : FuncUtil.largeValue(this.dic.data.volume)

        return (
            <Text
                style={[CommonStyle.textSubBold1, { width: '21%', textAlign: 'right' }]}
                testID={`${symbol}wlO`} >
                {
                    FuncUtil.formatNumber(value)
                }
            </Text>
        )
    }
}

export default class ContentPrice extends XComponent {
    static propTypes = {
        data: PropTypes.object,
        loadingInfo: PropTypes.object,
        allowRenderInfo: PropTypes.object,
        channelPlaceOrder: PropTypes.string,
        indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }

    constructor(props) {
        super(props);

        this.dic = {
            data: [],
            type: '',
            infoAllowRender: this.props.infoAllowRender || {}
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    onClickBuy() {
        try {
            Emitter.emit(this.props.channelPlaceOrder, {
                side: SIDE.BUY,
                value: this.props.data
            })

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    onClickSell() {
        try {
            Emitter.emit(this.props.channelPlaceOrder, {
                side: SIDE.SELL,
                value: this.props.data
            })

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    render() {
        const rowData = this.props.data

        return (
            <View style={{ width: '100%', marginTop: 2 }}>
                <View style={styles.rowExpand}>
                    <View style={styles.expandLine}>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub1,
                                { width: '20%' }
                            ]}>
                            {I18n.t('openSearch')}
                        </Text>
                        <Open
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                        <Text style={{ width: '4%' }}></Text>
                        <Text
                            testID={`${rowData.previous_close}wlO`}
                            style={[CommonStyle.textSub1, { width: '27%' }]}>
                            {I18n.t('previousClose')}
                        </Text>
                        <PreviousClose
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                    </View>
                    <View style={styles.expandLine}>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[CommonStyle.textSub1, { width: '20%' }]}>
                            {I18n.t('high')}
                        </Text>
                        <High
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                        <Text style={{ width: '4%' }}></Text>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub1,
                                { width: '27%' }
                            ]}>
                            {I18n.t('close')}
                        </Text>
                        <Close
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                    </View>
                    <View style={styles.expandLine}>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub1,
                                { width: '20%' }
                            ]}>
                            {I18n.t('low')}
                        </Text>
                        <Text >{}</Text>
                        <Low
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                        <Text style={{ width: '4%' }}></Text>
                        <Text
                            testID={`${rowData.symbol}wlO`}
                            style={[
                                CommonStyle.textSub1,
                                { width: '27%' }
                            ]}>
                            {I18n.t('volume')}
                        </Text>
                        <Volume
                            data={this.props.data}
                            autoControlRender={true}
                            loadingInfo={this.props.loadingInfo}
                            indexInList={this.props.indexInList}
                            allowRenderInfo={this.props.allowRenderInfo}
                        />
                    </View>
                </View>
                <View style={[styles.buttonExpand]}>
                    <ButtonBoxRealtime
                        testID={`${rowData.symbol}SellButton`}
                        isBuy={true}
                        width={'48%'}
                        field1={'bid_size'}
                        field2={'bid_price'}
                        data={this.props.data}
                        onPress={this.onClickBuy}
                        loadingInfo={this.props.loadingInfo}
                        indexInList={this.props.indexInList}
                        allowRenderInfo={this.props.allowRenderInfo}
                        formatValue1={data => {
                            return data.bid_size
                                ? FuncUtil.formatNumber(data.bid_size)
                                : 0
                        }}
                        formatValue2={data => {
                            return data.bid_price
                                ? FuncUtil.formatNumberNew2(data.bid_price, PRICE_DECIMAL.PRICE)
                                : '--'
                        }}
                    />
                    <View style={{ width: '4%' }}></View>
                    <ButtonBoxRealtime
                        testID={`${rowData.symbol}BuyButton`}
                        isBuy={false}
                        width={'48%'}
                        field1={'ask_price'}
                        field2={'ask_size'}
                        data={this.props.data}
                        onPress={this.onClickSell}
                        loadingInfo={this.props.loadingInfo}
                        indexInList={this.props.indexInList}
                        allowRenderInfo={this.props.allowRenderInfo}
                        formatValue1={data => {
                            return data.ask_price
                                ? FuncUtil.formatNumberNew2(data.ask_price, PRICE_DECIMAL.PRICE)
                                : '--'
                        }}
                        formatValue2={data => {
                            return data.ask_size
                                ? FuncUtil.formatNumber(data.ask_size)
                                : 0
                        }}
                    />
                </View>
            </View>
        );
    }
};
