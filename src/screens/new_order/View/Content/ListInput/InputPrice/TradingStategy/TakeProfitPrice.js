import React, { useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import Animated from 'react-native-reanimated';
import { connect, useSelector, useDispatch, shallowEqual } from 'react-redux'
import InputWithControl from '~/component/virtual_keyboard/InputWithControl3.js'
import * as Emitter from '@lib/vietnam-emitter';

import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import * as Util from '~/util';

import { getChannelShowMessageNewOrder as getChannelChangeOrderError, getChannelHideOrderError } from '~/streaming/channel'

import { getValueForRedux, formatPriceOnFocus, getValidateOnBlur, formatPriceOnBlur, getValueForTakeProfitLoss, getStepByRuleASX, getDecimalPriceByRule, getStepByRule } from '~/screens/new_order/Controller/InputController'
import { getLastPrice } from '~/screens/new_order/Model/PriceModel'
import Enum from '~/enum'

import { changeOrderPrice, changeFocusInput, changeTakeProfitLoss } from '~/screens/new_order/Redux/actions.js'
import { HandleChangeBuySell } from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/StopPrice.js'

import * as InputModel from '~/screens/new_order/Model/InputModel.js'
import { createSelector } from 'reselect';
const {
    PRICE_DECIMAL,
    TYPE_ERROR_ORDER,
    TYPE_MESSAGE, STEP, ROUND_STEP
} = Enum
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
function getAlias({ dic, forceDecimal = 1 }) {
    const tmp = getValueForTakeProfitLoss(dic.current.takeProfitLoss, getDecimalPriceByRule())
    return formatPriceOnBlur(tmp, getDecimalPriceByRule(), getStepByRule(tmp))
}
const onUpdateAlias = ({ dic, takeProfitLoss }) => {
    return useMemo(() => {
        if (!dic.current.isFirst) {
            if (dic.current.isTypeValue) {
                dic.current.step = getStepByRule(dic.current.takeProfitLoss)
                dic.current.roundStep = getStepByRule(dic.current.takeProfitLoss)
                dic.current.decimal = getDecimalPriceByRule()
            }
            dic.current.alias = dic.current.isTypeValue ? '' : `(${getAlias({ dic })})`
        }
    }, [takeProfitLoss])
}
const useListenChangeTypeInput = ({ dic, refTextInput, isTypeValue }) => {
    return useMemo(() => {
        const objectExpect = isTypeValue ? {
            decimal: getDecimalPriceByRule(),
            alias: '',
            step: getStepByRule(dic.current.takeProfitLoss),
            roundStep: getStepByRule(dic.current.takeProfitLoss),
            preAlias: ''
        } : {
            decimal: PRICE_DECIMAL.PERCENT_IRESS,
            alias: `(${getAlias({ dic })})`,
            step: STEP.STEP_PERCENT,
            roundStep: ROUND_STEP.PERCENT,
            preAlias: '%'
        }
        dic.current = { ...dic.current, ...objectExpect }
        const expectDisplay = formatPriceOnFocus(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
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
                    ? formatPriceOnFocus(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
                    : formatPriceOnBlur(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
                : dic.current.isFocus
                    ? formatPriceOnFocus(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
                    : formatPriceOnBlur(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
            refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
            refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
        } else {
            dic.current.isFirst = false
        }
    }, [limitPrice])
}
function useOnListenError({ updateError }) {
    const channel = getChannelChangeOrderError()
    return useEffect(() => {
        const id = Emitter.addListener(channel, null, ({ msg, type, key }) => {
            key === TYPE_ERROR_ORDER.TAKE_PROFIT_LOSS && updateError && updateError({
                id: Util.getRandomKey(),
                isError: true
            })
        })
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
function checkValidateByLimitPrice({ onChangeText, takeProfitLoss, dic, refTextInput }) {
    const triggerValue = getLastPrice()
    if (takeProfitLoss < triggerValue) {
        dic.current.takeProfitLoss = triggerValue
        const expectDisplay = dic.current.isFocus
            ? formatPriceOnFocus(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
            : formatPriceOnBlur(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
        refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
        refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
        onChangeText(`${triggerValue}`)
    }
}
const createSelectState = createSelector(
    state => state.newOrder,
    newOrder => {
        return {
            takeProfitLoss: newOrder.takeProfitLoss.isTypeValue ? newOrder.takeProfitLoss.value : newOrder.takeProfitLoss.percent,
            isTypeValue: newOrder.takeProfitLoss.isTypeValue,
            limitPrice: newOrder.limitPrice,
            layout: newOrder.layout
        }
    }
)
const TakeProfitPrice = React.memo(({ disabled }) => {
    const dic = useRef({
        timeout: null,
        error: false,
        isFirst: true,
        takeProfitLoss: null,
        limitPrice: null,
        decimal: PRICE_DECIMAL.PRICE_IRESS,
        step: 0.5,
        alias: '',
        preAlias: '',
        roundStep: 0.5,
        isFocus: false,
        isTypeValue: null,
        disabled
    })
    // const layout = useSelector(state => state.newOrder.layout, shallowEqual)
    const { takeProfitLoss, isTypeValue, limitPrice, layout } = useSelector(createSelectState, shallowEqual)
    dic.current.takeProfitLoss = takeProfitLoss
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
    // Use listen when use change takeProfitLoss then update alias
    onUpdateAlias({ dic, takeProfitLoss })
    // Khi thay doi gia limit price thi cung se cap nhat luon gia takeProfitLoss
    useListenChangeLimitPrice({ dic, refTextInput, limitPrice })
    // useMemo(() => {
    //     if (dic.current.isFirst) {
    //         dic.current.isFirst = false
    //     } else {
    //         // Handle Set display manual
    //         dic.current.alias = dic.current.isTypeValue ? '' : `(${formatPriceOnBlur(getValueForTakeProfitLoss(dic.current.takeProfitLoss), PRICE_DECIMAL.PERCENT_IRESS, ROUND_STEP.PRICE)})`
    //         const expectDisplay = isTypeValue
    //             ? dic.current.isFocus
    //                 ? formatPriceOnFocus(dic.current.takeProfitLoss, PRICE_DECIMAL.PRICE_IRESS)
    //                 : formatPriceOnBlur(dic.current.takeProfitLoss, PRICE_DECIMAL.PRICE_IRESS)
    //             : dic.current.isFocus
    //                 ? formatPriceOnFocus(dic.current.takeProfitLoss, PRICE_DECIMAL.PERCENT_IRESS)
    //                 : formatPriceOnBlur(dic.current.takeProfitLoss, PRICE_DECIMAL.PERCENT_IRESS)
    //         refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
    //         refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
    //     }
    // }, [limitPrice])
    const onBlur = useCallback((ref) => {
        dic.current.isFocus = false
        const isValidate = getValidateOnBlur(dic.current.takeProfitLoss)
        InputModel.setInputFocus(null)
        // isTypeValue && checkValidateByLimitPrice({ onChangeText, takeProfitLoss: dic.current.takeProfitLoss, dic, refTextInput })
        if (isValidate && !dic.current.error) {
            setTimeout(() => {
                Emitter.emit(channel, { msg: I18n.t('takeProfitLossPriceValid'), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.TAKE_PROFIT_LOSS })
                dic.current.error = true
            }, 100);
        }
    }, [takeProfitLoss, isTypeValue])
    const onFocus = useCallback((ref) => {
        dic.current.isFocus = true
        dispatch(changeFocusInput(Enum.NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LOSS))
        InputModel.setInputFocus(Enum.NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LOSS)
    }, [takeProfitLoss])
    // const { decimal, step, alias, roundStep } = useMemo(() => {
    //     const expectDisplay = isTypeValue ? dic.current.isFocus ? formatPriceOnFocus(dic.current.takeProfitLoss, 4) : formatPriceOnBlur(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
    //         : dic.current.isFocus ? formatPriceOnFocus(dic.current.takeProfitLoss, PRICE_DECIMAL.PERCENT_IRESS) : formatPriceOnBlur(dic.current.takeProfitLoss, dic.current.decimal, dic.current.roundStep)
    //     const objectExpect = isTypeValue ? {
    //         decimal: PRICE_DECIMAL.PRICE_IRESS,
    //         alias: '',
    //         step: STEP.STEP_PRICE,
    //         roundStep: ROUND_STEP.PRICE,
    //         preAlias: ''
    //     } : {
    //             decimal: PRICE_DECIMAL.PERCENT_IRESS,
    //             alias: `(${formatPriceOnBlur(getValueForTakeProfitLoss(dic.current.takeProfitLoss), PRICE_DECIMAL.PERCENT_IRESS, ROUND_STEP.PRICE)})`,
    //             step: STEP.STEP_PRICE,
    //             roundStep: ROUND_STEP.PRICE,
    //             preAlias: '%'
    //         }
    //     dic.current = { ...dic.current, ...objectExpect }
    //     if (dic.current.isFirst) {
    //         return objectExpect
    //     } else {
    //         // Handle Set display manual
    //         refTextInput.current && refTextInput.current.updateDic({ text: expectDisplay })
    //         refTextInput.current && refTextInput.current.changeText(expectDisplay, false)
    //         return objectExpect
    //     }
    // }, [isTypeValue])
    const onChangeText = useCallback((text) => {
        const textValidate = getValueForRedux(text, dic.current.decimal, dic.current.roundStep)
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
        dispatch(changeTakeProfitLoss(textValidate))
        dic.current.error = false
    }, [])
    console.info('DCM rerender')
    return (
        <View style={[
            {
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 8,
                paddingTop: layout === Enum.ORDER_LAYOUT.BASIC ? 8 : 0
            }, layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance
        ]}>
            <Text style={[
                CommonStyle.titleInput,
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance,
                {
                    marginBottom: Enum.ORDER_LAYOUT.BASIC ? 0 : 1
                }
            ]}>{I18n.t('takeProfitPrice')}</Text>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <InputWithControl
                    disabled={disabled}
                    autoFocus={InputModel.getInputFocus() === Enum.NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LOSS}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    ref={refTextInput}
                    onChangeText={onChangeText}
                    relateValue={takeProfitLoss}
                    defaultValue={takeProfitLoss}
                    step={dic.current.step}
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
TakeProfitPrice.propTypes = {}
TakeProfitPrice.defaultProps = {}
export default TakeProfitPrice
