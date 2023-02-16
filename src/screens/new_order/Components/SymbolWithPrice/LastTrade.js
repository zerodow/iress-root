import React, { useEffect, useState, useCallback, useContext } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller'

import Flashing from '~/component/flashing/flashing.2.js'
import PriceValue from '~/screens/watchlist/Component/PriceValue.js';
import BoxLoading from '~/component/BoxLoading/BoxLoading.js'
import { NewOrderContext } from '~/screens/new_order/NewOrder.js'

import Enum from '~/enum'
const { TYPE_FORM_REALTIME } = Enum;
const LastTrade = React.memo(({ value, textStyle, isFromWatchList = true, style, exchange, symbol }) => {
    return (
        <View>
            <PriceValue
                exchange={exchange}
                symbol={symbol}
                style={[
                    {
                        fontFamily: CommonStyle.fontPoppinsMedium,
                        fontSize: CommonStyle.fontSizeXXL,
                        color: CommonStyle.fontWhite
                    },
                    textStyle
                ]}
                value={value}
            />
        </View>
    )
}, (next, pre) => {
    return next.value === pre.value
})
LastTrade.propTypes = {}
LastTrade.defaultProps = {}
export default LastTrade
