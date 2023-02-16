import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import PropTypes from 'prop-types'

import TabShape from '~/component/tabs_shape/index.js'

import CommonStyle from '~/theme/theme_controller'
import Enum from '~/enum'

import { changeTypeInputStopPrice, changeTypeInputTakeProfitLoss } from '~/screens/new_order/Redux/actions.js'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
const { NAME_PANEL, KEYBOARD_TYPE, NEW_ORDER_INPUT_KEY } = Enum;
const { width } = Dimensions.get('window')
const margin = 8
const grat = 10
const padding = 4
const widthTab = (width - margin * 2 + (grat - padding)) / 2
const Index = ({
    tabs = [
        {
            title: 'Price(AUD)',
            key: 'VALUE',
            value: 'VALUE'
        },
        {
            title: 'Percentage',
            key: 'PERCENT',
            value: 'PERCENT'
        }
    ],
    inputFocus
}) => {
    const dispatch = useDispatch()
    const onChangeTab = ({ key }) => {
        switch (inputFocus) {
            case NEW_ORDER_INPUT_KEY.STOP_PRICE:
                if (key === 'VALUE') {
                    return dispatch(changeTypeInputStopPrice(true))
                }
                return dispatch(changeTypeInputStopPrice(false))
                break;
            case NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LOSS:
                if (key === 'VALUE') {
                    return dispatch(changeTypeInputTakeProfitLoss(true))
                }
                return dispatch(changeTypeInputTakeProfitLoss(false))
                break;
            default:
                break;
        }
    }
    const { stopPrice, takeProfitLoss } = useSelector(state => {
        return {
            stopPrice: state.newOrder.stopPrice,
            takeProfitLoss: state.newOrder.takeProfitLoss
        }
    }, shallowEqual)
    const defaultActive = useMemo(() => {
        try {
            switch (inputFocus) {
                case NEW_ORDER_INPUT_KEY.STOP_PRICE:
                    if (stopPrice.isTypeValue) {
                        return 'VALUE'
                    }
                    return 'PERCENT'
                case NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LOSS:
                    if (takeProfitLoss.isTypeValue) {
                        return 'VALUE'
                    }
                    return 'PERCENT'
                default:
                    return 'VALUE'
            }
        } catch (error) {
            return 'VALUE'
        }
    })
    return (
        <View style={{
            flex: 1,
            height: 40,
            marginVertical: 8,
            width: width,
            paddingHorizontal: 8
        }}>
            <TabShape
                tabs={tabs}
                defaultActive={defaultActive}
                onChangeTab={onChangeTab}
                tabWidth={widthTab}
                tabHeight={40}
                grat={grat}
                strockWidth={1}
                padding={padding}
                strockColor={CommonStyle.color.dusk}
                fillColorDefault={CommonStyle.backgroundColor}
                fillColorActive={CommonStyle.color.modify}
                styleTextDefault={
                    {
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
                }
            />
        </View>
    )
}
Index.propTypes = {}
Index.defaultProps = {}
const styles = StyleSheet.create({})
export default Index
