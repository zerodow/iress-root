import React, { useEffect, useState, useCallback, useContext } from 'react'
import { View, Text } from 'react-native'
import Animated from 'react-native-reanimated'
import PropTypes from 'prop-types'

import { connect, useSelector, shallowEqual } from 'react-redux'
import { changeBuySell } from '~/screens/new_order/Redux/actions.js'

import BuySellButton from '~/component/BuySellButton/BuySell.js'
import BoxLoading from '~/component/BoxLoading/BoxLoading.js'
import { NewOrderContext } from '~/screens/new_order/NewOrder.js'
import TitleInput from '~/screens/new_order/Components/TitleInput.js'

import Enum from '~/enum'
import CommonStyle from '~/theme/theme_controller'
const ButtomBuySell = ({ symbol, exchange, isBuy, orderType, changeBuySell }) => {
    const layout = useSelector(state => state.newOrder.layout, shallowEqual)
    return (
        <View style={[
            {
                alignItems: 'center',
                paddingHorizontal: layout === Enum.ORDER_LAYOUT.BASIC ? 16 : 8,
                marginBottom: 8
            },
            layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance
        ]}>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                {layout === Enum.ORDER_LAYOUT.BASIC && <TitleInput title={'Side'} />}
            </View>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <BuySellButton {...{ symbol, exchange, isBuy, orderType, layout }} changeBuySell={changeBuySell} />
            </View>
        </View>
    )
}
function mapStateToProps(state) {
    return {
        isBuy: state.newOrder.isBuy,
        orderType: state.newOrder.orderType
    }
}
function mapActionToProps(dispatch) {
    return {
        changeBuySell: p => dispatch(changeBuySell(p))
    }
}
ButtomBuySell.propTypes = {}
ButtomBuySell.defaultProps = {}
export default connect(mapStateToProps, mapActionToProps)(ButtomBuySell)
