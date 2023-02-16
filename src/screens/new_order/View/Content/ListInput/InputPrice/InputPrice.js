import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Animated from 'react-native-reanimated'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import LimitPrice from './LimitPrice'
import ListPrice from './ListPrice'
import DragSlider from './DragSlider'

import Enum from '~/enum'
import orderTypeEnum from '~/constants/order_type';
const { Value } = Animated
const { NEW_ORDER_INPUT_KEY, TYPE_ERROR_ORDER } = Enum
const InputPrice = ({
    symbol,
    exchange,
    limitPrice,
    triggerPrice,
    orderType,
    onChangeOrderPrice
}) => {
    const dic = useRef({
        valueFocus: limitPrice > 0 ? limitPrice : 0,
        init: true
    })
    const [typeInput, setTypeInput] = useState(NEW_ORDER_INPUT_KEY.LIMIT_PRICE)
    useEffect(() => {
        if (!dic.current.init) {
            setTypeInput(NEW_ORDER_INPUT_KEY.LIMIT_PRICE)
        } else {
            dic.current.init = false
        }
    }, [orderType])
    return (
        <React.Fragment>
            <ListPrice onChangeFocus={({ typeInput: type, text }) => {
                setTypeInput(type)
            }} limitPrice={limitPrice} />
        </React.Fragment>
    )
}
function mapStateToProps(state) {
    return {
        orderType: state.newOrder.orderType,
        limitPrice: state.newOrder.limitPrice,
        triggerPrice: state.newOrder.triggerPrice
    }
}
InputPrice.propTypes = {}
InputPrice.defaultProps = {}
export default connect(mapStateToProps)(InputPrice)
