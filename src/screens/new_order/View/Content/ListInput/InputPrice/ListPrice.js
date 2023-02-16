import React, { useContext, useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated'
import { connect } from 'react-redux'
import * as Emitter from '@lib/vietnam-emitter';
import PropTypes from 'prop-types'

import LimitPrice from './LimitPrice'
import TriggerPrice from './TriggerPrice'

import Enum from '~/enum'
import I18n from '~/modules/language/'
import { getChannelChangeOrderError, getChannelChangeRealOrderError, getChannelHideOrderError } from '~/streaming/channel'
import { changeOrderPrice } from '~/screens/new_order/Redux/actions.js'
import orderTypeEnum from '~/constants/order_type';
import * as Util from '~/util';
import CommonStyle, { register } from '~/theme/theme_controller'

const Padding = 8
const { width: widthDevice } = Dimensions.get('window')
const { NEW_ORDER_INPUT_KEY, TYPE_ERROR_ORDER } = Enum
const { Value } = Animated
const ListInput = ({
    orderType,
    isFuture,
    limitPrice,
    triggerPrice,
    limitPriceDefaultValue,
    triggerPriceDefault,
    onFocus,
    children,
    setTypeInput,
    onChangeOrderPrice,
    onChangeFocus
}) => {
    const onChangeFocusLimitPrice = useCallback((text) => {
        onChangeFocus && onChangeFocus({ typeInput: NEW_ORDER_INPUT_KEY.LIMIT_PRICE, text })
    }, [])
    const onChangeFocusTriggerPrice = useCallback((text) => {
        onChangeFocus && onChangeFocus({ typeInput: NEW_ORDER_INPUT_KEY.TRIGGER_PRICE, text })
    }, [])

    return (
        <View>
            <LimitPrice onChangeFocus={onChangeFocusLimitPrice} />
        </View>
    )
}
function mapStateToProps(state) {
    return {
        orderType: state.newOrder.orderType
    }
}
const ListInputWrapper = connect(mapStateToProps)(ListInput)
export default React.memo((props) => {
    return (
        <ListInputWrapper {...props} />
    )
}, () => true)
