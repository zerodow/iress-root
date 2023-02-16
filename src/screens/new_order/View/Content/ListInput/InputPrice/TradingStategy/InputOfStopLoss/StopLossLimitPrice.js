import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text } from 'react-native'
import { connect, useSelector, useDispatch, shallowEqual } from 'react-redux'
import { createSelector } from 'reselect'

import InputWithControl from '~/component/virtual_keyboard/InputWithControl3.js'
import * as Emitter from '@lib/vietnam-emitter';

import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import * as Util from '~/util';

import { getChannelShowMessageNewOrder as getChannelChangeOrderError, getChannelHideOrderError } from '~/streaming/channel'
import { formatPriceOnFocus, getValidateOnBlur, getValueForRedux, formatPriceOnBlur, getStepByRuleASX, getStepByRule, getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js'
import Enum from '~/enum'

import { changeLimitPriceSL, changeFocusInput } from '~/screens/new_order/Redux/actions.js'
import * as InputModel from '~/screens/new_order/Model/InputModel.js'
const {
    PRICE_DECIMAL,
    TYPE_ERROR_ORDER,
    TYPE_MESSAGE,
    NEW_ORDER_INPUT_KEY
} = Enum
function useOnListenError({ updateError }) {
    const channel = getChannelChangeOrderError()
    return useEffect(() => {
        const id = Emitter.addListener(channel, null, ({ msg, type, key }) => {
            key === TYPE_ERROR_ORDER.STOP_LIMIT_PRICE_ERROR && updateError && updateError({
                id: Util.getRandomKey(),
                isError: true
            })
        })
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
const useListenChangeLimitPrice = ({ limitPrice, dic, refTextInput }) => {
    return useEffect(() => {
        if (!dic.current.isFirst) {
            dic.current.error = false
            const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
            const dicTextInput = refTextInput.current && refTextInput.current.getDic()
            if (dicTextInput) {
                const dicNumber = getValueForRedux(dicTextInput.text, dic.current.decimal, dic.current.roundStep)
                if (dicNumber !== limitPrice) {
                    const newText = dic.current.isFocus ? formatPriceOnFocus(limitPrice, dic.current.decimal, dic.current.roundStep) : formatPriceOnBlur(limitPrice, dic.current.decimal, dic.current.roundStep)
                    refTextInput.current && refTextInput.current.updateDic({ text: newText })
                    refTextInput.current && refTextInput.current.changeText(newText, false)
                    refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
                }
            }
        }
        dic.current.isFirst = false
    }, [limitPrice])
}
const selectState = createSelector(
    state => state.newOrder,
    newOrder => ({
        layout: newOrder.layout,
        orderType: newOrder.stopPrice.orderType,
        limitPrice: newOrder.stopPrice.limitPrice
    })
)
const StopLossLimitPrice = React.memo(({ disabled }) => {
    const { layout, orderType, limitPrice } = useSelector(selectState, shallowEqual)
    const dispatch = useDispatch()
    const channel = getChannelChangeOrderError()
    const dic = useRef({
        error: false,
        limitPrice: null,
        isFirst: true,
        decimal: PRICE_DECIMAL.PRICE_IRESS,
        step: Enum.STEP.STEP_PRICE,
        roundStep: Enum.ROUND_STEP.PRICE,
        isFocus: null
    })
    dic.current.limitPrice = limitPrice
    dic.current.roundStep = getStepByRule(limitPrice)
    dic.current.step = getStepByRule(limitPrice)
    dic.current.decimal = getDecimalPriceByRule()
    const refTextInput = useRef()
    useListenChangeLimitPrice({ limitPrice, dic, refTextInput })
    useOnListenError({
        updateError: () => {
            const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
            // textInputInstance.focus && textInputInstance.focus()
            const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
            refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: 'red' } })
            dic.current.error = true
        }
    })
    const onBlur = useCallback((ref) => {
        const isValidate = getValidateOnBlur(dic.current.limitPrice)
        dic.current.isFocus = false
        InputModel.setInputFocus(null)
        if (isValidate && !dic.current.error) {
            setTimeout(() => {
                Emitter.emit(channel, { msg: I18n.t('limitPriceValid'), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.STOP_LIMIT_PRICE_ERROR })
                dic.current.error = true
            }, 100);
        }
    }, [limitPrice])
    const onFocus = useCallback((ref) => {
        dic.current.isFocus = true
        dispatch(changeFocusInput(NEW_ORDER_INPUT_KEY.STOPLOSS_LIMIT_PRICE))
        InputModel.setInputFocus(NEW_ORDER_INPUT_KEY.STOPLOSS_LIMIT_PRICE)
    }, [limitPrice])

    const onChangeText = useCallback((text) => {
        const textValidate = getValueForRedux(text, dic.current.decimal, dic.current.roundStep)
        dic.current.error = false
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
        dispatch(changeLimitPriceSL(textValidate))
    }, [])
    if (orderType && orderType.key !== 'LIMIT') return null
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
            ]}
            >
                {I18n.t('limitPrice')}
            </Text>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <InputWithControl
                    limitInteger={15}
                    disabled={disabled}
                    decimal={PRICE_DECIMAL.PRICE_IRESS}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    ref={refTextInput}
                    onChangeText={onChangeText}
                    defaultValue={limitPrice}
                    step={dic.current.step}
                    relateValue={limitPrice}
                    decimal={dic.current.decimal}
                    formatValueWhenBlur={(value) => formatPriceOnBlur(value, dic.current.decimal, dic.current.roundStep)}
                    formatValueWhenFocus={(value) => formatPriceOnFocus(value, dic.current.decimal, dic.current.roundStep)}

                />
            </View>
        </View>
    )
}, () => true)

StopLossLimitPrice.propTypes = {}
StopLossLimitPrice.defaultProps = {}
export default StopLossLimitPrice
