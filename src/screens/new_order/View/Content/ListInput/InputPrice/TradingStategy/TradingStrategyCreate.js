import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import PropTypes from 'prop-types'

import TradingStrategyTabs from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TradingStrategyTabs.js'
import StopLossTab from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/StopLossTab.js'
import TakeProfitTab from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TakeProfitTab.js'
import ListInputOfStopLoss from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/ListInputOfStopLoss.js'
import ListInputOfTakeProfit from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/ListInputOfTakeProfit.js'

import { setDisableTabBuySell, getTabTrading, setTabTrading } from '~/screens/new_order/Model/TabModel.js'

const Index = () => {
    const [tabs, setTabs] = useState({ ...getTabTrading() })
    const dic = useRef({ ...getTabTrading() })
    const handleChangeTabStop = useCallback((activeTabs) => {
        setTabs({
            ...dic.current,
            STOPLOSS: activeTabs['STOPLOSS'],
            MORE_STOPLOSS: activeTabs['MORE_STOPLOSS']
        })
        setTabTrading({
            STOPLOSS: activeTabs['STOPLOSS'],
            MORE_STOPLOSS: activeTabs['MORE_STOPLOSS']
        })
    }, [])
    const handleChangeTabTakeProfit = useCallback((activeTabs) => {
        setTabs({
            ...dic.current,
            TAKE_PROFIT: activeTabs['TAKE_PROFIT'],
            MORE_TAKE_PROFIT: activeTabs['MORE_TAKE_PROFIT']
        })
        setTabTrading({
            TAKE_PROFIT: activeTabs['TAKE_PROFIT'],
            MORE_TAKE_PROFIT: activeTabs['MORE_TAKE_PROFIT']
        })
    }, [])
    dic.current = tabs
    return (
        <View>
            <StopLossTab onChangeTab={handleChangeTabStop} />
            <ListInputOfStopLoss tabs={tabs} />
            <TakeProfitTab onChangeTab={handleChangeTabTakeProfit} />
            <ListInputOfTakeProfit tabs={tabs} />
        </View>
    )
}
Index.propTypes = {}
Index.defaultProps = {}
const styles = StyleSheet.create({})
export default Index
