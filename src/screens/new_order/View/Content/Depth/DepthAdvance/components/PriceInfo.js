import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import LastTrade from '~/screens/new_order/Components/SymbolWithPrice/LastTrade.js'
import {
    formatNumber, formatNumberNew2, stringMostOneDot, isDotAtEndString
} from '~/lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller'
import { useSelector } from 'react-redux'
import Enum from '~/enum'
const { PRICE_DECIMAL } = Enum
const PriceInfo = () => {
    const price = 31.5800
    const size = 1.230
    const { symbol, exchange } = useSelector(state => {
        return {
            symbol: state.newOrder.symbol,
            exchange: state.newOrder.exchange
        }
    })
    const { tradePrice, volume } = useSelector((state) => {
        if (symbol) {
            const key = `${symbol}#${exchange}`
            const { data } = state.quotes || {}
            const quote = data[key] || {}
            const {
                trade_price: tradePrice,
                volume
            } = quote;
            return {
                tradePrice,
                volume
            }
        }
        return {}
    })
    return (
        <View style={{
            alignItems: 'center',
            paddingVertical: 4
        }}>
            <LastTrade style={{
                alignSelf: 'center'
            }}
                {...{ symbol, exchange }}
                value={tradePrice} textStyle={{
                    fontSize: CommonStyle.fontSizeS
                }} />
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontColor
            }}>
                {formatNumberNew2(volume, PRICE_DECIMAL.VOLUME)}
            </Text>
        </View>
    )
}
PriceInfo.propTypes = {}
PriceInfo.defaultProps = {}
const styles = StyleSheet.create({})
export default PriceInfo
