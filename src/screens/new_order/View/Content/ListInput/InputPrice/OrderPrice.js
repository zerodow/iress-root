import React, { useEffect, useCallback, useRef, useMemo } from 'react'
import { View, Text } from 'react-native'
import Animated from 'react-native-reanimated';
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import InputWithControl from '~/component/virtual_keyboard/InputWithControl3.js'
import * as Emitter from '@lib/vietnam-emitter';

import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/index';
import * as Util from '~/util';
import {
    getChannelShowMessageNewOrder as getChannelChangeOrderError,
    getChannelOrderTriggerBorderError
} from '~/streaming/channel'

import { formatPriceOnFocus, getValidateOnBlur, getValueForRedux, formatPriceOnBlur, formatVolumeOnBlur, formatVolumeOnFocus, formatOrderValueOnBlur } from '~/screens/new_order/Controller/InputController.js'
import Enum from '~/enum'
import * as InputModel from '~/screens/new_order/Model/InputModel.js'
import { changeOrderValue, changeFocusInput } from '~/screens/new_order/Redux/actions.js'
import { dataStorage } from '~/storage'
import { getCurrencyByCode } from '~/component/currency/Controller'
import { getExchange, getSymbol } from '~s/new_order/Model/AttributeModel'
import * as Business from '~/business'
const {
    PRICE_DECIMAL,
    TYPE_ERROR_ORDER,
    TYPE_MESSAGE,
    STEP,
    TYPE_LOT_SIZE,
    ORDER_INPUT_TYPE
} = Enum
function useOnListenError({ updateError }) {
    const channel = getChannelChangeOrderError()
    return useEffect(() => {
        const id = Emitter.addListener(channel, null, ({ msg, type, key }) => {
            key === TYPE_ERROR_ORDER.ORDER_PRICE && updateError && updateError({
                id: Util.getRandomKey(),
                isError: true
            })
        })
        return () => Emitter.deleteByIdEvent(id);
    }, [])
}
const OrderPrice = React.memo(() => {
    const layout = useSelector(state => state.newOrder.layout, shallowEqual)
    const dispatch = useDispatch()
    const dic = useRef({
        timeOutShowError: null,
        timeOutShowErrorRequired: null,
        orderValue: null,
        decimal: 3,
        step: STEP.STEP_VALUE,
        isFirst: true,
        isFocus: false,
        isTypeValue: false
    })
    const { orderValue, isBuy, positionAffected, isTypeValue, volume, stepOrderValue, orderType } = useSelector(state => ({
        orderValue: state.newOrder.orderValue.value,
        positionAffected: state.newOrder.positionAffected,
        isBuy: state.newOrder.isBuy,
        isTypeValue: state.newOrder.orderValue.isTypeValue,
        volume: state.newOrder.quantity,
        orderType: state.newOrder.orderType.key
    }), shallowEqual)
    dic.current.orderValue = orderValue
    dic.current.isTypeValue = isTypeValue
    const symbol = getSymbol()
    const exchange = getExchange()
    const currencyCode = Business.getCurrencyBySymbolExchange({
        symbol,
        exchange
    })
    const currency = getCurrencyByCode({ currencyCode })
    // const currency = '$'
    useEffect(() => {
        if (refTextInput.current && !dic.current.isFirst) {
            const dicTextInput = refTextInput.current.getDic()
            if (dicTextInput.text !== orderValue) {
                refTextInput.current && refTextInput.current.changeText(dic.current.isFocus ? formatPriceOnFocus(orderValue, dic.current.decimal) : formatOrderValueOnBlur(orderValue, dic.current.decimal), false)
                refTextInput && refTextInput.current && refTextInput.current.updateDic({ text: dic.current.isFocus ? formatPriceOnFocus(orderValue, dic.current.decimal) : formatOrderValueOnBlur(orderValue, dic.current.decimal) })
            }
        } else {
            dic.current.isFirst = false
        }
    }, [orderType])
    const channel = getChannelChangeOrderError()
    const channelTriggerBorderError = getChannelOrderTriggerBorderError()
    const refTextInput = useRef()
    useOnListenError({
        updateError: () => {
            const textInputInstance = refTextInput.current && refTextInput.current.getWrapperIntance()
            // textInputInstance.focus && textInputInstance.focus()
            const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
            refViewWrapper && refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: 'red' } })
        }
    })
    const onBlur = useCallback((ref) => {
        InputModel.setInputFocus(null)
        dic.current.isFocus = false
        // const isValidate = getValidateOnBlur(dic.current.orderValue)
        // if (isValidate && !dic.current.error) {
        //     setTimeout(() => {
        //         Emitter.emit(channel, { msg: I18n.t('orderPriceValid'), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.ORDER_PRICE })
        //     }, 100);
        //     dic.current.error = true
        // } else {
        //     if (parseInt(volume.value) % dataStorage.stepQuantity !== 0) {
        //         setTimeout(() => {
        //             const keyError = dataStorage.typeLotSize === TYPE_LOT_SIZE.MARGIN
        //                 ? 'errorMarginLotSize'
        //                 : 'errorSecurityLotSize'
        //             Emitter.emit(channel, { msg: I18n.t(keyError).replace('##VOLUME##', volume.value), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.ORDER_PRICE })
        //         }, 100);
        //     }
        // }
    }, [volume])
    const onFocus = useCallback((ref) => {
        dic.current.isFocus = true
        InputModel.setInputFocus(Enum.NEW_ORDER_INPUT_KEY.ORDER_VALUE)
        dispatch(changeFocusInput(Enum.NEW_ORDER_INPUT_KEY.ORDER_VALUE))
    }, [orderValue])

    const onChangeText = useCallback((text) => {
        const value = getValueForRedux(text, dic.current.decimal)
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        refViewWrapper && refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
        dic.current.error = false
        changeOrderValue && dispatch(changeOrderValue(value))
    }, [])
    const alias = useMemo(() => {
        const inputChangeText = InputModel.getInputChangeText()
        const inputFocusId = InputModel.getInputFocus()
        const isValidate = getValidateOnBlur(dic.current.orderValue)
        dic.current.timeOutShowErrorRequired && clearTimeout(dic.current.timeOutShowErrorRequired)
        dic.current.timeOutShowError && clearTimeout(dic.current.timeOutShowError)
        if (isValidate && !dic.current.error) {
            dic.current.timeOutShowErrorRequired && clearTimeout(dic.current.timeOutShowErrorRequired)
            dic.current.timeOutShowErrorRequired = setTimeout(() => {
                inputFocusId === Enum.NEW_ORDER_INPUT_KEY.ORDER_VALUE && inputChangeText && Emitter.emit(channel, { msg: I18n.t('orderPriceValid'), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.ORDER_PRICE })
                inputFocusId === Enum.NEW_ORDER_INPUT_KEY.ORDER_VALUE && inputChangeText && Emitter.emit(channelTriggerBorderError, true) // Trigger show border order quantity
            }, 1000);
            dic.current.error = true
        } else {
            const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
            refViewWrapper && refViewWrapper.setNativeProps && refViewWrapper.setNativeProps({ style: { borderWidth: 1, borderColor: CommonStyle.fontBorder } })
            Emitter.emit(channelTriggerBorderError, false) // Trigger show border order quantity
            dic.current.error = false
        }

        // if (volume.value !== null && parseInt(volume.value) % dataStorage.stepQuantity !== 0) {
        //     dic.current.timeOutShowError = setTimeout(() => {
        //         const keyError = dataStorage.typeLotSize === TYPE_LOT_SIZE.MARGIN
        //             ? 'errorMarginLotSize'
        //             : 'errorSecurityLotSize'
        //         Emitter.emit(channel, { msg: I18n.t(keyError).replace('##VOLUME##', volume.value), type: TYPE_MESSAGE.ERROR, key: TYPE_ERROR_ORDER.ORDER_PRICE })
        //         Emitter.emit(channelTriggerBorderError, true) // Trigger show border order quantity
        //     }, 1000);
        //     dic.current.error = true
        // }
        return `(${dic.current.isFocus ? formatVolumeOnFocus(volume.value, 0) : formatVolumeOnBlur(volume.value, 0)})`
    }, [volume.value])
    if (!isTypeValue) return null

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
                {I18n.t('orderValue')}
            </Text>
            <View style={[
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
            ]}>
                <InputWithControl
                    type={ORDER_INPUT_TYPE.ORDER_VALUE}
                    limitInteger={15}
                    autoFocus={InputModel.getInputFocus() === Enum.NEW_ORDER_INPUT_KEY.QUANTITY}
                    step={dic.current.step}
                    onBlur={onBlur}
                    // onlyInterger={true}
                    onFocus={onFocus}
                    ref={refTextInput}
                    decimal={dic.current.decimal}
                    onChangeText={onChangeText}
                    formatValueWhenFocus={(value) => formatPriceOnFocus(value, dic.current.decimal)}
                    formatValueWhenBlur={(value) => formatOrderValueOnBlur(value, dic.current.decimal)}
                    defaultValue={orderValue}
                    relateValue={orderValue}
                    orderQuantity={volume.value}
                    alias={alias}
                    preAlias={currency}
                />
            </View>
        </View>
    )
}, () => true)

OrderPrice.propTypes = {}
OrderPrice.defaultProps = {}
export default OrderPrice
