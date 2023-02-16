import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Enum from '~/enum'
import orderTypeEnum from '~/constants/order_type';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    isIphoneXorAbove,
    logDevice,
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime
} from '~/lib/base/functionUtil';
import I18n from '~/modules/language/'
const Row = ({ title, value, styleValue }) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 7 }}>
                <Text style={[styles.title]}>{title}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: CommonStyle.fontBorder }} />
            <View style={{ flex: 3, alignItems: 'flex-end' }}>
                <Text style={[styles.value, styleValue]}>{value}</Text>
            </View>
        </View>
    )
}
const QuantityAndPriceRow = (props) => {
    let { quantity, limitPrice, triggerPrice, tradePrice, orderType, isFuture } = props
    quantity = `${formatNumber(Math.abs(quantity), Enum.PRICE_DECIMAL.VOLUME)} units`
    limitPrice = formatNumberNew2(limitPrice, Enum.PRICE_DECIMAL.EXTERNAL)
    triggerPrice = formatNumberNew2(triggerPrice, Enum.PRICE_DECIMAL.EXTERNAL)
    tradePrice = formatNumberNew2(tradePrice, Enum.PRICE_DECIMAL.EXTERNAL)
    switch (orderType) {
        case orderTypeEnum.LIMIT_ORDER:
            return (
                <View style={styles.row}>
                    <Row styleValue={{ color: CommonStyle.color.sell }} title={'Limit Price'} value={limitPrice} />
                    <Row title={'Quantity'} value={quantity} />
                </View>
            )
        case orderTypeEnum.STOPLOSS_ORDER:
            if (isFuture) {
                return (
                    <View style={styles.row}>
                        <Row styleValue={{ color: CommonStyle.color.modify }} title={'Trigger Price'} value={triggerPrice} />
                        <Row title={'Quantity'} value={quantity} />
                    </View>
                )
            } else {
                return (
                    <View style={styles.row}>
                        <Row styleValue={{ color: CommonStyle.color.sell }} title={'Limit Price'} value={limitPrice} />
                        <Row title={'Trigger Price'} value={triggerPrice} />
                        <Row title={'Quantity'} value={quantity} />
                    </View>
                );
            }
        case orderTypeEnum.STOPLIMIT_ORDER:
            return (
                <View style={styles.row}>
                    <Row styleValue={{ color: CommonStyle.color.sell }} title={'Limit Price'} value={limitPrice} />
                    <Row styleValue={{ color: CommonStyle.color.modify }} title={'Trigger Price'} value={triggerPrice} />
                    <Row title={'Quantity'} value={quantity} />
                </View>
            );
        case orderTypeEnum.STOP_ORDER:
            return (
                <View style={styles.row}>
                    <Row styleValue={{ color: CommonStyle.color.modify }} title={'Trigger Price'} value={triggerPrice} />
                    <Row title={'Quantity'} value={quantity} />
                </View>
            )
        default:
            return (
                <View style={styles.row}>
                    <Row title={'Market Price'} value={tradePrice || '--'} />
                    <Row title={'Quantity'} value={quantity} />
                </View>
            )
    }
}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    title: {
        color: CommonStyle.fontNearLight6,
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS,
        paddingTop: 8
    },
    limitPrice: {
        color: CommonStyle.fontRed
    },
    triggerPrice: {
        color: CommonStyle.fontBlue
    },
    value: {
        color: CommonStyle.fontColor,
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS,
        paddingTop: 8
    },
    row: {
        borderTopWidth: 1,
        borderTopColor: CommonStyle.fontBorder,
        paddingHorizontal: 8
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

QuantityAndPriceRow.propTypes = {}
QuantityAndPriceRow.defaultProps = {}
function mapStateToProps(state, { symbol, exchange }) {
    const { marketData } = state.streamMarket;
    const data =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    const { quote = {} } = data
    return {
        tradePrice: quote.trade_price
    }
}
export default connect(mapStateToProps)(QuantityAndPriceRow)
