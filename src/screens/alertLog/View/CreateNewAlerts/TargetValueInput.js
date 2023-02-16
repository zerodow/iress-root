import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { StyleSheet, Text, View, TextInput, Keyboard, KeyboardEvent, TouchableOpacity, Dimensions, Platform } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { Navigation } from 'react-native-navigation';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import * as InputModel from '~/screens/new_order/Model/InputModel.js'
import Enum from '~/enum'
import * as Util from '~/util';
import * as Emitter from '@lib/vietnam-emitter';
import { Channel as ChannelKeyBoard, getChannelChangeText, getChannelDeleteText, getChannelChangeTextFromSlider } from '~/component/virtual_keyboard/Keyboard.js'
import InputWithControl from '~/screens/alertLog/Components/KeyboardAlert/InputWithControl'
import { formatPriceOnFocus, getValidateOnBlur, getValueForRedux, formatPriceOnBlur, getStepByRuleASX, getStepByRule, getDecimalPriceByRule, getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js'
import * as Business from '~/business'
import { getCurrencyByCode } from '~/component/currency/Controller'
import Quantity from '~s/alertLog/Components/KeyboardAlert/Quantity'
import Big from 'big.js';
const { width: widthDevices } = Dimensions.get('window')
const {
    PRICE_DECIMAL,
    TYPE_ERROR_ORDER,
    TYPE_MESSAGE,
    STEP,
    TYPE_LOT_SIZE,
    ORDER_INPUT_TYPE,
    TRIGGER_ALERT,
    NEW_ORDER_INPUT_KEY,
    ALERT_LOG_TYPE
} = Enum

const TargetValueInput = ({ symbol, exchange, targetValue }) => {
    const refView = useRef()
    const refTextInput = useRef()
    const { alertType, trigger } = useSelector((state) => {
        return {
            alertType: state.alertLog.alertType,
            trigger: state.alertLog.trigger
        };
    }, shallowEqual);
    const dic = useRef({
        text: null,
        coordinates: {},
        selection: {},
        isFocus: false,
        decimal: 3,
        timeoutFormat: null
    })
    dic.current.text = targetValue
    dic.current.decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })

    const inputId = useMemo(() => {
        return `input#${Util.getRandomKey()}`
    }, [])
    // useEffect(() => {
    //     dispatch.alertLog.clearTargetValue()
    // }, [alertType])
    const dispatch = useDispatch()
    const borderTextInput = useMemo(() => {
        if (trigger.key === TRIGGER_ALERT.CONTAINS && targetValue === '') {
            return CommonStyle.fontRed1
        } else {
            return CommonStyle.fontBorder
        }
    }, [trigger, targetValue])
    const currency = ''
    const onChangeInputTextMovoment = (value) => {
        const text = Util.removeZeroCharacterAtStart(value + '').trim()
        if (text.indexOf('.') !== -1) {
            const displayText = text.slice(0, (text.indexOf('.')) + (dic.current.decimal + 1));
            dispatch.alertLog.changeTargetValue(displayText)
        } else {
            dispatch.alertLog.changeTargetValue(text)
        }
    };
    const onFocus = useCallback(() => {
        if (isNaN(targetValue) || targetValue === '' || targetValue === null || targetValue === undefined || targetValue === 0) {
            dispatch.alertLog.changeTargetValue('')
        } else {
            const displayText = formatPriceOnFocus(targetValue, dic.current.decimal, dic.current.roundStep)
            dispatch.alertLog.changeTargetValue(displayText)
        }
        dic.current.isFocus = true
    }, [targetValue])
    const onBlur = useCallback((ref) => {
        Business.hideKeyboard();
        const displayText = Util.removeSpecialCharacters(targetValue)
        if (isNaN(displayText) || displayText === '' || displayText === null || displayText === undefined) {
            dispatch.alertLog.changeTargetValue(0)
        } else {
            dispatch.alertLog.changeTargetValue(displayText)
        }
        dic.current.isFocus = false
        // InputModel.setInputFocus(null)
    }, [targetValue])

    const onChangeText = (text) => {
        const value = getValueForRedux(text, alertType.key === ALERT_LOG_TYPE.TODAY_VOLUME ? 0 : dic.current.decimal)
        const refViewWrapper = refTextInput.current && refTextInput.current.getRef()
        if (isNaN(value) || value === '' || value === null || value === undefined) {
            dispatch.alertLog.changeTargetValue('')
        } else {
            dispatch.alertLog.changeTargetValue(value)
        }
    }
    const onChangeInputTextContains = (value) => {
        dispatch.alertLog.changeTargetValue(value.trim())
    };
    const renderInputVolumByAlertType = useCallback(() => {
        switch (alertType.key) {
            case ALERT_LOG_TYPE.TODAY_VOLUME:
                return <Quantity />

            default:
                return (
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'row'
                    }}
                        ref={refView}
                    >
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
                                limitInteger={15}
                                // onBlur={onBlur}
                                // onFocus={onFocus}
                                ref={refTextInput}
                                decimal={dic.current.decimal}
                                onChangeText={onChangeText}
                                formatValueWhenBlur={(value) => formatPriceOnBlur(value, dic.current.decimal, dic.current.roundStep)}
                                formatValueWhenFocus={(value) => formatPriceOnFocus(value, dic.current.decimal, dic.current.roundStep)}
                                relateValue={targetValue}
                                defaultValue={targetValue + ''}
                                preAlias={currency}
                            />
                        </View>
                    </View >
                )
        }
    }, [alertType, targetValue])
    const renderContent = useCallback(() => {
        switch (trigger.key) {
            case Enum.TRIGGER_ALERT.CONTAINS:
                return (
                    <View style={{
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: borderTextInput,
                        width: widthDevices - 32
                    }}>
                        <TextInput
                            underlineColorAndroid="transparent"
                            ref={refTextInput}
                            multiline={true}
                            numberOfLines={2}
                            keyboardType={'default'}
                            onChangeText={onChangeInputTextContains}
                            // onBlur={onBlur}
                            // onFocus={onFocus}
                            // defaultValue={targetValue}
                            style={{
                                fontSize: 12,
                                color: CommonStyle.fontColor,
                                textAlign: 'left',
                                paddingHorizontal: 8,
                                paddingBottom: 5
                            }}
                        />
                    </View>
                )
            default:
                return renderInputVolumByAlertType()
        }
    }, [trigger, targetValue, alertType])

    const rendenMovoment = useCallback(() => {
        return (
            <View style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row'
            }}
                ref={refView}
            >
                <Text style={{
                    fontSize: CommonStyle.font11,
                    color: CommonStyle.fontNearLight6,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }}>{I18n.t('targetPriceLabel')}</Text>

                <View style={{
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: CommonStyle.color.dusk,
                    width: '50%',
                    height: 30

                }}
                    collapsable={false}
                >
                    <TextInput
                        ref={refTextInput}
                        underlineColorAndroid="transparent"
                        multiline={true}
                        numberOfLines={1}
                        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                        onChangeText={onChangeInputTextMovoment}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        ref={refTextInput}
                        maxLength={15}
                        value={targetValue + ''}
                        style={{
                            fontSize: CommonStyle.font11,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontColor,
                            textAlign: 'center',
                            padding: 0,
                            margin: 0,
                            lineHeight: 18
                        }}
                    />
                </View>
            </View>
        )
    }, [targetValue, alertType])
    return (
        <View>
            {alertType.key === ALERT_LOG_TYPE.CHANGEPERCENT || alertType.key === ALERT_LOG_TYPE.CHANGEPOINT
                ? rendenMovoment()
                : renderContent()
            }
        </View>
    )
}

export default TargetValueInput

const styles = StyleSheet.create({})
