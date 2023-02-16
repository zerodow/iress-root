import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import ButtonBuySell from '~/screens/new_order/View/Content/ButtonBuySell.js'
import ListInput from '~/screens/new_order/View/Content/ListInput/ListInput.js'
import BidAskChart from '~/screens/new_order/View/Content/BidAskChart.js'

import Enum from '~/enum'
import { shallowEqual, useSelector } from 'react-redux'
const LayoutBasic = (props) => {
    const layout = props.layout
    const accActive = useSelector(state => state.portfolio.accActive, shallowEqual) // Doi account thi reset input
    return (
        <View style={{
            // borderWidth: 1,
            // borderColor: 'red',
            flex: layout === Enum.ORDER_LAYOUT.BASIC ? 0 : 1
        }} >
            {layout === Enum.ORDER_LAYOUT.BASIC && (<BidAskChart {...props} />)}
            <ButtonBuySell />
            <ListInput key={accActive} layout={layout}{...props} />
        </View>
    )
}
LayoutBasic.propTypes = {}
LayoutBasic.defaultProps = {}
const styles = StyleSheet.create({})
export default LayoutBasic
