import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import Animated from 'react-native-reanimated';
import { connect } from 'react-redux'
import * as Emitter from '@lib/vietnam-emitter';

import TextInput from '~/component/virtual_keyboard/InputDefault'

import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import * as Util from '~/util';
import {
    formatNumber, formatNumberNew2, stringMostOneDot
} from '~/lib/base/functionUtil';
import { getChannelShowMessageNewOrder as getChannelChangeOrderError, getChannelHideOrderError } from '~/streaming/channel'

import Enum from '~/enum'

import { changeOrderPrice } from '~/screens/new_order/Redux/actions.js'
const {
    Value,
    round,
    divide,
    concat,
    add,
    cond,
    eq,
    floor,
    lessThan,
    modulo,
    set,
    useCode,
    multiply,
    call,
    block
} = Animated;
const {
    PRICE_DECIMAL, TYPE_ERROR_ORDER, TYPE_MESSAGE
} = Enum

function useOnListenError({ updateError }) {
    const channel = getChannelChangeOrderError()
    return useEffect(() => {
        const id = Emitter.addListener(channel, null, ({ msg, type, key }) => {
            key === TYPE_ERROR_ORDER.TRIGGER_PRICE_INPUT_ERROR && updateError && updateError({
                id: Util.getRandomKey(),
                isError: true
            })
        })
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}

const TriggerPrice = ({ priceValue, triggerPrice, changeTriggerPrice, onChangeFocus }) => {
    return null
}
const PureComp = React.memo(({ children }) => {
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}, () => true)
function mapStateToProps(state) {
    return {
        triggerPrice: state.newOrder.triggerPrice
    }
}
function mapActionToProps(dispatch) {
    return {
        changeTriggerPrice: p => dispatch(changeOrderPrice({
            triggerPrice: p
        }))
    }
}
TriggerPrice.propTypes = {}
TriggerPrice.defaultProps = {}
export default connect(mapStateToProps, mapActionToProps)(TriggerPrice)
