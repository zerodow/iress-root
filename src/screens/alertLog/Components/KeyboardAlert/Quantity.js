import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import * as Emitter from '@lib/vietnam-emitter';

import { connect, useSelector, useDispatch, shallowEqual } from 'react-redux'
import { changeOrderQuantity, changeFocusInput } from '~/screens/new_order/Redux/actions.js'

import InputWithControl from '~/screens/alertLog/Components/KeyboardAlert/InputWithControl'
import { getValueForRedux, formatVolumeOnFocus, getValidateOnBlur, formatVolumeOnBlur } from '~/screens/new_order/Controller/InputController.js'
import * as Business from '~/business'

import * as InputModel from '~/screens/new_order/Model/InputModel.js'

import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import {
    getChannelShowMessageNewOrder as getChannelChangeOrderError,
    getChannelHideOrderError, getChannelOrderTriggerBorderError
} from '~/streaming/channel'
import * as Util from '~/util';
import Enum from '~/enum'
import { createSelector } from 'reselect';
const {
    TYPE_ERROR_ORDER,
    PRICE_DECIMAL,
    TYPE_MESSAGE,
    STEP,
    TYPE_LOT_SIZE,
    ORDER_INPUT_TYPE
} = Enum
function useOnListenError({ updateError }) {
    const channel = getChannelChangeOrderError()
    return useEffect(() => {
        const id = Emitter.addListener(channel, null, ({ msg, type, key }) => {
            key === TYPE_ERROR_ORDER.QUANTITY_INPUT_ERROR && updateError && updateError({
                id: Util.getRandomKey(),
                isError: true
            })
        })
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
const createSelectState = createSelector(
    state => state.newOrder,
    newOrder => {
        return {
            quantity: newOrder.quantity.value,
            isBuy: newOrder.isBuy,
            positionAffected: newOrder.positionAffected,
            isTypeValue: newOrder.quantity.isTypeValue,
            stepQuantity: newOrder.stepQuantity,
            layout: newOrder.layout
        }
    }
)
const Quantity = React.memo(({ disabled }) => {
    const refTextInput = useRef()
    const channelTriggerBorderError = getChannelOrderTriggerBorderError()
    const dispatch = useDispatch()
    const dic = useRef({
        error: false,
        decimal: PRICE_DECIMAL.VOLUME,
        step: STEP.STEP_VOLUME,
        quantity: null,
        isFirst: true
    })
    const { quantity, isBuy, positionAffected, isTypeValue, stepQuantity, layout } = useSelector(createSelectState, shallowEqual)

    dic.current.quantity = quantity
    dic.current.step = stepQuantity
    useOnListenError({
        updateError: () => {
            const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
            refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: 'red' } })
            dic.current.error = true
        }
    })
    const changeQuantity = useCallback((value) => {
        dispatch.alertLog.changeTargetValue(value)
    }, [])
    const onBlur = useCallback((ref) => {
        InputModel.setInputFocus(null)
    }, [quantity])
    const onFocus = useCallback((ref) => {
        dispatch(changeFocusInput(Enum.NEW_ORDER_INPUT_KEY.QUANTITY))
        InputModel.setInputFocus(Enum.NEW_ORDER_INPUT_KEY.QUANTITY)
    }, [quantity])

    const onChangeText = useCallback((text) => {
        InputModel.setInputChangeText(true)
        dic.current.isFill = false
        const textValidate = getValueForRedux(text, dic.current.decimal, 1)
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        dic.current.error = false
        // refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
        changeQuantity && changeQuantity(textValidate)
    }, [])

    // Neu symbol dang nam giu holding thi di vao case nay
    useEffect(() => {
        const { volume } = positionAffected

        /**
         * Gan co check xem gia fill la gia nhap tu ban phim hay tu position fill vao
         */
        if (dic.current.isFirst && dic.current.quantity === Math.abs(volume)) {
            dic.current.isQuantityOfPositionPositive = !!(volume >= 0)
            dic.current.isQuantityOfPositionNegative = !!(volume < 0)
            dic.current.isFirst = false
            dic.current.isFill = true
        }
        if (!isBuy) {
            if (!dic.current.isFill) return
            if (volume > 0 && dic.current.quantity === null) {
                // const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
                // textInputInstance.setNativeProps && textInputInstance.setNativeProps({ text: volume.toString() })
                if (refTextInput.current) {
                    const value = formatVolumeOnFocus(volume, dic.current.decimal)
                    refTextInput.current && refTextInput.current.changeText(value, false)
                    refTextInput && refTextInput.current && refTextInput.current.updateDic({ text: value })
                }
                changeQuantity && changeQuantity(volume.toString())
                dic.current.isQuantityOfPositionPositive = true
            }
            if (dic.current.isQuantityOfPositionNegative) {
                const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
                textInputInstance.setNativeProps && textInputInstance.setNativeProps({ text: '0' })
                if (refTextInput.current) {
                    refTextInput && refTextInput.current && refTextInput.current.updateDic({ text: null })
                }
                changeQuantity && changeQuantity(null)
                dic.current.isQuantityOfPositionNegative = false
            }
        } else {
            if (!dic.current.isFill) return
            if (volume < 0 && dic.current.quantity === null) {
                // const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
                // textInputInstance.setNativeProps && textInputInstance.setNativeProps({ text: volume.toString() })
                if (refTextInput.current) {
                    const value = formatVolumeOnFocus(Math.abs(volume), dic.current.decimal)
                    refTextInput.current && refTextInput.current.changeText(value, false)
                    refTextInput && refTextInput.current && refTextInput.current.updateDic({ text: value })
                }
                changeQuantity && changeQuantity(volume.toString())
                dic.current.isQuantityOfPositionNegative = true
            }
            if (dic.current.isQuantityOfPositionPositive) {
                const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
                textInputInstance.setNativeProps && textInputInstance.setNativeProps({ text: '0' })
                if (refTextInput.current) {
                    refTextInput && refTextInput.current && refTextInput.current.updateDic({ text: null })
                }
                changeQuantity && changeQuantity(null)
                dic.current.isQuantityOfPositionPositive = false
            }
        }
    }, [isBuy, positionAffected])
    const triggerBorderError = useCallback((isError = false) => {
        const borderColor = isError ? CommonStyle.color.sell : CommonStyle.fontBorder
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        refViewWrapper && refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor } })
        dic.current.error = isError
    }, [])
    const unmount = useCallback(() => {
        Emitter.deleteEvent(channelTriggerBorderError)
    }, [])
    useEffect(() => {
        Emitter.addListener(channelTriggerBorderError, null, triggerBorderError)
        return unmount
    }, [])
    if (isTypeValue) return null
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row'
        }}>
            <Text style={{
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontNearLight6,
                fontFamily: CommonStyle.fontPoppinsRegular
            }}>{I18n.t('targetPriceLabel')}</Text>
            <View onStartShouldSetResponder={() =>
                Business.showButtonConfirm()
            } style={{
                borderRadius: 4,
                borderWidth: 1,
                borderColor: CommonStyle.color.dusk,
                width: '50%'
            }}
                collapsable={false}
            >
                <InputWithControl
                    type={ORDER_INPUT_TYPE.ORDER_QUANTITY}
                    step={dic.current.step}
                    limitInteger={15}
                    disabled={disabled}
                    autoFocus={InputModel.getInputFocus() === Enum.NEW_ORDER_INPUT_KEY.ORDER_VALUE}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onlyInterger={true}
                    ref={refTextInput}
                    onChangeText={onChangeText}
                    defaultValue={quantity}
                    relateValue={quantity}
                    decimal={dic.current.decimal}
                    formatValueWhenBlur={(value) => formatVolumeOnBlur(value, dic.current.decimal, dic.current.step)}
                    formatValueWhenFocus={(value) => formatVolumeOnFocus(value, dic.current.decimal)}
                />
            </View>
        </View>
    )
}, () => true)
Quantity.propTypes = {}
Quantity.defaultProps = {}

export default Quantity
