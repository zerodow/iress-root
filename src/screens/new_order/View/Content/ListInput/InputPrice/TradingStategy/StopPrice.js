import React, { useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import Animated from 'react-native-reanimated';
import { connect, useSelector, useDispatch, shallowEqual } from 'react-redux'
import TextInput from '~/component/virtual_keyboard/InputDefault'
import InputWithControl from '~/component/virtual_keyboard/InputWithControl3.js'
import * as Emitter from '@lib/vietnam-emitter';

import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import * as Util from '~/util';
import {
    formatNumber, formatNumberNew2, stringMostOneDot, isDotAtEndString, formatNumberNew3
} from '~/lib/base/functionUtil';
import { getChannelShowMessageNewOrder as getChannelChangeOrderError, getChannelHideOrderError } from '~/streaming/channel'

import { getValueForRedux, formatPriceOnFocus, getValidateOnBlur, formatPriceOnBlur, getValueForStopPrice, getStepByRuleASX, getDecimalPriceByRule, getStepByRule } from '~/screens/new_order/Controller/InputController'
import { getLastPrice } from '~/screens/new_order/Model/PriceModel'
import Enum from '~/enum'

import { changeOrderPrice, changeFocusInput, changeStopPrice } from '~/screens/new_order/Redux/actions.js'

import * as InputModel from '~/screens/new_order/Model/InputModel.js'
import { createSelector } from 'reselect';

const {
    PRICE_DECIMAL,
    TYPE_ERROR_ORDER,
    TYPE_MESSAGE, STEP, ROUND_STEP
} = Enum
export const HandleChangeBuySell = React.memo(({ refTextInput, dic }) => {
    const isBuy = useSelector(state => state.newOrder.isBuy, shallowEqual)
    useEffect(() => {
        dic.current.error = false
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: dic.current.disabled ? CommonStyle.color.disabled : CommonStyle.fontBorder } })
    }, [isBuy])
    return null
}, () => false)
const onUpdateAlias = ({ dic, stopPrice }) => {
    return useMemo(() => {
        if (!dic.current.isFirst) {
            if (dic.current.isTypeValue) {
                dic.current.step = getStepByRule(dic.current.stopPrice)
                dic.current.roundStep = getStepByRule(dic.current.stopPrice)
                dic.current.decimal = getDecimalPriceByRule()
            }
            dic.current.alias = dic.current.isTypeValue ? '' : `(${getAlias({ dic })})`
        }
    }, [stopPrice])
}
const useListenChangeTypeInput = ({ dic, refTextInput, isTypeValue }) => {
    return useMemo(() => {
        const objectExpect = isTypeValue ? {
            decimal: getDecimalPriceByRule(),
            alias: '',
            step: getStepByRule(dic.current.stopPrice),
            roundStep: getStepByRule(dic.current.stopPrice),
            preAlias: ''
        } : {
            decimal: PRICE_DECIMAL.PERCENT_IRESS,
            alias: `(${getAlias({ dic })})`,
            step: STEP.STEP_PERCENT,
            roundStep: ROUND_STEP.PERCENT,
            preAlias: '%'
        }
        dic.current = { ...dic.current, ...objectExpect }
        const expectDisplay = formatPriceOnFocus(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
        if (dic.current.isFirst) {
            // return objectExpect
        } else {
            // Handle Set display manual
            refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
            refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
            // return objectExpect
        }
    }, [isTypeValue])
}
const useListenChangeLimitPrice = ({ limitPrice, dic, refTextInput }) => {
    return useMemo(() => {
        if (!dic.current.isFirst) {
            dic.current.alias = dic.current.isTypeValue ? '' : `(${getAlias({ dic })})`
            const expectDisplay = dic.current.isTypeValue
                ? dic.current.isFocus
                    ? formatPriceOnFocus(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
                    : formatPriceOnBlur(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
                : dic.current.isFocus
                    ? formatPriceOnFocus(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
                    : formatPriceOnBlur(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
            refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
            refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
        } else {
            dic.current.isFirst = false
        }
    }, [limitPrice])
}
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
function useOnListenError({ updateError }) {
    const channel = getChannelChangeOrderError()
    return useEffect(() => {
        const id = Emitter.addListener(channel, null, ({ msg, type, key }) => {
            key === TYPE_ERROR_ORDER.STOP_PRICE_INPUT_ERROR && updateError && updateError({
                id: Util.getRandomKey(),
                isError: true
            })
        })
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
function getAlias({ dic, forceDecimal = 1 }) {
    const tmp = getValueForStopPrice(dic.current.stopPrice, getDecimalPriceByRule())
    return formatPriceOnBlur(tmp, getDecimalPriceByRule(), getStepByRule(tmp))
}
function checkValidateByLimitPrice({ onChangeText, stopPrice, dic, refTextInput }) {
    const triggerValue = getLastPrice()
    if (stopPrice > triggerValue) {
        dic.current.stopPrice = triggerValue
        const expectDisplay = dic.current.isFocus
            ? formatPriceOnFocus(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
            : formatPriceOnBlur(dic.current.stopPrice, dic.current.decimal, dic.current.roundStep)
        refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
        refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
        onChangeText(`${triggerValue}`)
    }
}
const createSelectState = createSelector(
    state => state.newOrder,
    newOrder => {
        return {
            stopPrice: newOrder.stopPrice.isTypeValue ? newOrder.stopPrice.value : newOrder.stopPrice.percent,
            isTypeValue: newOrder.stopPrice.isTypeValue,
            limitPrice: newOrder.limitPrice,
            layout: newOrder.layout
        }
    }
)
const StopPrice = React.memo(({ disabled }) => {
    const dic = useRef({
        timeout: null,
        error: false,
        isFirst: true,
        stopPrice: null,
        limitPrice: null,
        decimal: PRICE_DECIMAL.PRICE_IRESS,
        step: 0.5,
        alias: '',
        preAlias: '',
        roundStep: 0.5,
        isFocus: null,
        isTypeValue: null,
        disabled
    })
    // const layout = useSelector(state => state.newOrder.layout, shallowEqual)
    const { stopPrice, isTypeValue, limitPrice, layout } = useSelector(createSelectState, shallowEqual)
    dic.current.stopPrice = stopPrice
    dic.current.limitPrice = limitPrice
    dic.current.isTypeValue = isTypeValue
    // dic.current.alias = `(${getLastPrice()})`
    const dispatch = useDispatch()
    const channel = getChannelChangeOrderError()
    const refTextInput = useRef()

    useOnListenError({
        updateError: () => {
            const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
            // textInputInstance.focus && textInputInstance.focus()
            const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
            refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: 'red' } })
            dic.current.error = true
        }
    })
    // Use listen when use change type input value or percent
    useListenChangeTypeInput({ dic, isTypeValue, refTextInput })
    // const { decimal, step, alias, roundStep, preAlias } =
    // Use listen when use change stopPrice then update alias
    onUpdateAlias({ dic, stopPrice })
    // Khi thay doi gia limit price thi cung se cap nhat luon gia stopPrice
    useListenChangeLimitPrice({ dic, refTextInput, limitPrice })
    const onBlur = useCallback((ref) => {
        dic.current.isFocus = false
        const isValidate = getValidateOnBlur(dic.current.stopPrice)
        // isTypeValue && checkValidateByLimitPrice({ onChangeText, stopPrice: dic.current.stopPrice, dic, refTextInput })
        InputModel.setInputFocus(null)
        if (isValidate && !dic.current.error) {
            setTimeout(() => {
                Emitter.emit(channel, { msg: I18n.t('stopPriceValid'), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.STOP_PRICE_INPUT_ERROR })
                dic.current.error = true
            }, 100);
        }
    }, [stopPrice, isTypeValue])
    const onFocus = useCallback((ref) => {
        dic.current.isFocus = true
        dispatch(changeFocusInput(Enum.NEW_ORDER_INPUT_KEY.STOP_PRICE))
        InputModel.setInputFocus(Enum.NEW_ORDER_INPUT_KEY.STOP_PRICE)
    }, [stopPrice])

    const onChangeText = useCallback((text) => {
        const textValidate = getValueForRedux(text, dic.current.decimal, dic.current.roundStep)
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
        dispatch(changeStopPrice(textValidate))
        dic.current.error = false
    }, [])
    return (
        <View style={[
            {
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: layout === Enum.ORDER_LAYOUT.BASIC ? 8 : 0,
                paddingBottom: 8
            }, layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance
        ]}>
            <Text style={[
                CommonStyle.titleInput,
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance,
                {
                    marginBottom: Enum.ORDER_LAYOUT.BASIC ? 0 : 1
                }
            ]}>{I18n.t('stopPrice')}</Text>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <InputWithControl
                    id='volume'
                    disabled={disabled}
                    autoFocus={InputModel.getInputFocus() === Enum.NEW_ORDER_INPUT_KEY.STOP_PRICE}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    ref={refTextInput}
                    onChangeText={onChangeText}
                    defaultValue={stopPrice}
                    step={dic.current.step}
                    relateValue={stopPrice}
                    alias={dic.current.preAlias + dic.current.alias}
                    preAlias={''}
                    decimal={dic.current.decimal}
                    formatValueWhenBlur={(value) => formatPriceOnBlur(value, dic.current.decimal, dic.current.roundStep)}
                    formatValueWhenFocus={(value) => formatPriceOnFocus(value, dic.current.decimal, dic.current.roundStep)}
                />
            </View>
            <HandleChangeBuySell dic={dic} refTextInput={refTextInput} />
        </View>
    )
}, (pre, next) => pre.disabled === next.disabled)
StopPrice.propTypes = {}
StopPrice.defaultProps = {}
export default StopPrice
