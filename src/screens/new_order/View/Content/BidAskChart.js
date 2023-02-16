import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { connect, useSelector, shallowEqual } from 'react-redux'
import PropTypes from 'prop-types'

import ChartRanger from '~/component/day_ranger_chart/index'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/';
import { useShadow } from '~/component/shadow/SvgShadowCustom.js';
import BidAskChart from '~/component/bid_ask_chart/index.js'

const DayRangerChart = ({ symbol, exchange }) => {
    const key = `${symbol}#${exchange}`
    // const quote = useSelector(state => state.quotes.data[key]) || {}
    // const { ask_price: askPrice, ask_size: askSize, bid_price: bidPrice, bid_size: bidSize } = quote
    let { ask_price: askPrice, ask_size: askSize, bid_price: bidPrice, bid_size: bidSize } = useSelector(state => {
        const key = `${symbol}#${exchange}`
        const { data } = state.quotes || {}
        const quote = data[key] || {}
        return {
            ask_price: quote.ask_price,
            ask_size: quote.ask_size,
            bid_price: quote.bid_price,
            bid_size: quote.bid_size
        }
    }, shallowEqual)
    const [Shadow, onLayout] = useShadow()
    return (
        <View style={{
            marginBottom: 8
        }}>
            <Shadow />
            <View style={{
                backgroundColor: CommonStyle.backgroundColor,
                zIndex: 999
            }} onLayout={onLayout}>
                <BidAskChart {...{ ask_price: askPrice, ask_size: askSize, bid_price: bidPrice, bid_size: bidSize, symbol, exchange }} />
            </View>
        </View>
    )
}
DayRangerChart.propTypes = {}
DayRangerChart.defaultProps = {}

export default DayRangerChart
