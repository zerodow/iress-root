import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import PropTypes from 'prop-types'

import Title from '~/screens/new_order/Components/TitleInput.js'
import TabsShapeMutiple from '~/component/tabs_shape/TabsShapeMutiple.js'

import CommonStyle from '~/theme/theme_controller'
import { useSelector, shallowEqual } from 'react-redux'
import Enum from '~/enum'
import { setDisableTabBuySell, getTabTrading, setTabTrading } from '~/screens/new_order/Model/TabModel.js'
import { setType, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
const { width } = Dimensions.get('window')
const margin = 8
const padding = 4
const grat = 10
const widthTab = ((width / 2) - margin * 2 + (grat - padding)) / 2
const TradingStrategyTabs = React.memo(({ onChangeTab, fillColorDefault, styleTextDefault, disablChangeTab }) => {
    const layout = useSelector(state => state.newOrder.layout, shallowEqual)

    return (
        <View style={[
            layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance,
            {
                paddingBottom: 8
            }
        ]}>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <Title title={'Trading Stategy'} />
            </View>
            <View style={[
                {
                    height: 31
                },
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <TabsShapeMutiple
                    disablChangeTab={disablChangeTab}
                    onChangeTab={onChangeTab}
                    tabs={[
                        {
                            title: 'Stop Loss',
                            key: 'STOPLOSS',
                            value: 'STOPLOSS'
                        },
                        {
                            title: 'Take Profit',
                            key: 'TAKE_PROFIT',
                            value: 'TAKE_PROFIT'
                        }
                    ]}
                    tabWidth={widthTab}
                    defaultActive={getTabTrading()}
                    tabHeight={31}
                    grat={grat}
                    strockWidth={1}
                    padding={padding}
                    strockColor={CommonStyle.color.dusk}
                    fillColorDefault={fillColorDefault || CommonStyle.backgroundColor}
                    fillColorActive={CommonStyle.color.modify}
                    styleTextDefault={
                        styleTextDefault || {
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS,
                            color: CommonStyle.fontNearLight4
                        }
                    }
                    styleTextActive={
                        {
                            fontFamily: CommonStyle.fontPoppinsBold,
                            fontSize: CommonStyle.fontSizeXS,
                            color: CommonStyle.fontDark
                        }
                    } />
            </View>
        </View>
    )
}, () => true)
TradingStrategyTabs.propTypes = {}
TradingStrategyTabs.defaultProps = {}
const styles = StyleSheet.create({})
export default TradingStrategyTabs
