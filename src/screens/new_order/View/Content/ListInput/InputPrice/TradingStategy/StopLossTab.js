import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import PropTypes from 'prop-types'

import Title from '~/screens/new_order/Components/TitleInput.js'
import TabShapeSecond from '~/component/tabs_shape/TabShapeSecond.js'

import CommonStyle from '~/theme/theme_controller'
import { useSelector, shallowEqual } from 'react-redux'
import Enum from '~/enum'
import { setDisableTabBuySell, getTabTrading, setTabTrading } from '~/screens/new_order/Model/TabModel.js'
import { setType, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
const { width } = Dimensions.get('window')
const margin = 16
const marginAdvanced = 8
const padding = 4
const grat = 4
const widthTab = ((width / 2) - margin * 2 + (grat - padding)) / 2
const StopLossTab = React.memo(({ onChangeTab, fillColorDefault, styleTextDefault, disablChangeTab, disabledFirstTab }) => {
    const layout = useSelector(state => state.newOrder.layout, shallowEqual)

    return (
        <React.Fragment>
            <View style={{
                borderTopColor: CommonStyle.color.dusk,
                borderTopWidth: 1,
                marginHorizontal: layout === Enum.ORDER_LAYOUT.BASIC ? 8 : 0
            }} />
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance,
                {
                    paddingVertical: 8
                },
                layout === Enum.ORDER_LAYOUT.BASIC ? {
                    marginHorizontal: margin
                } : {
                    paddingHorizontal: marginAdvanced,
                    marginHorizontal: 0
                }
            ]}>
                <View style={[
                    {
                        height: 31
                    },
                    layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
                ]}>
                    <TabShapeSecond
                        disablChangeTab={disablChangeTab}
                        disabledFirstTab={disabledFirstTab}
                        onChangeTab={onChangeTab}
                        tabs={[
                            {
                                title: 'STOP LOSS',
                                key: 'STOPLOSS',
                                value: 'STOPLOSS',
                                width: layout === Enum.ORDER_LAYOUT.BASIC ? 2 * (width - margin * 2 + (grat - padding)) / 3 : 2 * (width / 2 - marginAdvanced * 2 + (grat - padding)) / 3
                            },
                            {
                                title: 'MORE',
                                key: 'MORE_STOPLOSS',
                                value: 'MORE_STOPLOSS',
                                width: layout === Enum.ORDER_LAYOUT.BASIC ? 1 * (width - margin * 2 + (grat - padding)) / 3 : 1 * (width / 2 - marginAdvanced * 2 + (grat - padding)) / 3
                            }
                        ]}
                        // tabWidth={widthTab}
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
        </React.Fragment>
    )
}, () => true)
StopLossTab.propTypes = {}
StopLossTab.defaultProps = {}
const styles = StyleSheet.create({})
export default StopLossTab
