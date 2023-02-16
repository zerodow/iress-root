import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import PropTypes from 'prop-types'

import SvgIcon from '~/component/svg_icon/SvgIcon.js'

import TabShape from '~/component/tabs_shape/index.js'

import CommonStyle from '~/theme/theme_controller'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'

import { changeTypeInputOrderValueVolume } from '~/screens/new_order/Redux/actions.js'

import Enum from '~/enum'
const { NEW_ORDER_INPUT_KEY } = Enum
const { width } = Dimensions.get('window')
const margin = 8
const grat = 10
const padding = 4
const Index = ({
    inputFocus,
    tabs = [
        {
            title: 'Value',
            key: 'VALUE',
            value: 'VALUE',
            iconActive: <SvgIcon name='nound_dolar' size={23} color={CommonStyle.backgroundColor} />,
            iconDefault: <SvgIcon name='nound_dolar' size={23} />
        },
        {
            title: 'Volume',
            key: 'VOLUME',
            value: 'VOLUME',
            iconActive: <SvgIcon name='nound_coins' size={23} color={CommonStyle.backgroundColor} />,
            icon: <SvgIcon name='nound_coins' size={23} />
        }
    ]
}) => {
    const widthTab = (width - margin * 2 + (grat - padding)) / 2
    const dispatch = useDispatch()
    const onChangeTab = ({ key }) => {
        if (key === 'VALUE') {
            dispatch(changeTypeInputOrderValueVolume(true))
        } else {
            dispatch(changeTypeInputOrderValueVolume(false))
        }
    }
    const { quantity } = useSelector(state => {
        return {
            quantity: state.newOrder.quantity
        }
    }, shallowEqual)
    const defaultActive = useMemo(() => {
        try {
            switch (inputFocus) {
                case NEW_ORDER_INPUT_KEY.QUANTITY:
                case NEW_ORDER_INPUT_KEY.ORDER_VALUE:
                    if (quantity.isTypeValue) {
                        return 'VALUE'
                    }
                    return 'VOLUME'
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
            paddingHorizontal: 8,
            width: width
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
