import { View, Text } from 'react-native'
import { shallowEqual, useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import * as Emitter from '@lib/vietnam-emitter';

import { changeOrderQuantity, changeFocusInput } from '~/screens/new_order/Redux/actions.js'

import InputWithControl from '~/component/virtual_keyboard/InputWithControl3.js'
import { getValueForRedux, formatVolumeOnFocus, getValidateOnBlur, formatVolumeOnBlur } from '~/screens/new_order/Controller/InputController.js'

import * as InputModel from '~/screens/new_order/Model/InputModel.js'

import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import {
    getChannelShowMessageNewOrder as getChannelChangeOrderError,
    getChannelHideOrderError, getChannelOrderTriggerBorderError
} from '~/streaming/channel'
import * as Util from '~/util';
import Enum from '~/enum'
const {
    TYPE_ERROR_ORDER,
    PRICE_DECIMAL,
    TYPE_MESSAGE,
    STEP,
    TYPE_LOT_SIZE,
    ORDER_INPUT_TYPE
} = Enum
const selectState = createSelector(
    state => state.newOrder,
    newOrder => ({
        quantity: newOrder.quantity.value,
        layout: newOrder.layout
    })
)
const TakeProfitQuantity = React.memo(() => {
    const { quantity, layout } = useSelector(selectState, shallowEqual)
    return (
        <View style={[
            {
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 8
            },
            layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance
        ]}>
            <Text style={[
                CommonStyle.titleInput,
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance,
                {
                    marginBottom: Enum.ORDER_LAYOUT.BASIC ? 0 : 1
                }
            ]}>{I18n.t('volume')}</Text>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <InputWithControl
                    type={ORDER_INPUT_TYPE.ORDER_QUANTITY}
                    step={1}
                    key={quantity}
                    limitInteger={15}
                    disabled={true}
                    autoFocus={false}
                    onlyInterger={true}
                    defaultValue={quantity}
                    relateValue={quantity}
                    decimal={0}
                    formatValueWhenBlur={(value) => formatVolumeOnBlur(value, 0, 1)}
                    formatValueWhenFocus={(value) => formatVolumeOnFocus(value, 0)}
                />
            </View>
        </View>
    )
}, () => true)
export default TakeProfitQuantity
