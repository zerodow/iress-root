import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import PropTypes from 'prop-types'

import TradingStrategyTabs from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TradingStrategyTabs.js'
import StopLossTab from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/StopLossTab.js'
import TakeProfitTab from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TakeProfitTab.js'
import ListInputOfStopLoss from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/ListInputOfStopLoss.js'
import ListInputOfTakeProfit from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/ListInputOfTakeProfit.js'

import { setType, setOrderDetail, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import { setDisableTabBuySell, getTabTrading, setTabTrading } from '~/screens/new_order/Model/TabModel.js'
import CommonStyle from '~/theme/theme_controller'
import Enum from '~/enum'
const AMEND_TYPE = Enum.AMEND_TYPE
const Index = () => {
    const [tabs, setTabs] = useState({ ...getTabTrading() })
    const dic = useRef({ ...getTabTrading() })
    const handleChangeTab = useCallback((activeTabs) => {
        setTabs(activeTabs)
        setTabTrading({
            STOPLOSS: activeTabs['STOPLOSS'],
            TAKE_PROFIT: activeTabs['TAKE_PROFIT']
        })
    }, [])
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
    const TypeOrder = getType()
    const disablChangeTabSL = (TypeOrder !== AMEND_TYPE.AMEND_ORIGINAL && TypeOrder !== AMEND_TYPE.AMEND_TRADING_STOPPRICE) || (TypeOrder === AMEND_TYPE.AMEND_ORIGINAL && !tabs['STOPLOSS'])
    const disablChangeTabTP = (TypeOrder !== AMEND_TYPE.AMEND_ORIGINAL && TypeOrder !== AMEND_TYPE.AMEND_TRADING_PROFITLOSS) || (TypeOrder === AMEND_TYPE.AMEND_ORIGINAL && !tabs['TAKE_PROFIT'])
    return (
        <View>
            <StopLossTab
                styleTextDefault={
                    disablChangeTabSL ? {
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontNearLight4
                    } : null
                }
                fillColorDefault={disablChangeTabSL ? CommonStyle.color.fontdusk_disable : null}
                disablChangeTab={disablChangeTabSL}
                disabledFirstTab={true}
                onChangeTab={handleChangeTabStop} />
            <ListInputOfStopLoss tabs={tabs} />
            <TakeProfitTab
                styleTextDefault={
                    disablChangeTabTP ? {
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontNearLight4
                    } : null
                }
                fillColorDefault={disablChangeTabTP ? CommonStyle.color.fontdusk_disable : null}
                disablChangeTab={disablChangeTabTP}
                disabledFirstTab={true}
                onChangeTab={handleChangeTabTakeProfit} />
            <ListInputOfTakeProfit tabs={tabs} />
        </View>
    )
    return (
        <View>
            <TradingStrategyTabs disablChangeTab={true} styleTextDefault={
                {
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontSizeXS,
                    color: CommonStyle.fontDark
                }
            } fillColorDefault={CommonStyle.color.dusk} onChangeTab={handleChangeTab} />
            {
                tabs['STOPLOSS'] && <StopPrice />
            }
            {
                tabs['TAKE_PROFIT'] && <TakeProfitPrice />
            }
        </View>
    )
}
Index.propTypes = {}
Index.defaultProps = {}
const styles = StyleSheet.create({})
export default Index
