import React, { useEffect, useState, useCallback, useRef, useMemo, useImperativeHandle } from 'react'
import { View, Text, Platform, TouchableOpacity } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter';
import TextInput from '~/component/textinput_avoid_keyboard/TextInput'
import IconCustom from '~/component/svg_icon/SvgIcon.js'
import * as Util from '~/util';
import CommonStyle, { register } from '~/theme/theme_controller'
import { Channel as ChannelKeyBoard, getChannelChangeText, getChannelDeleteText, getChannelChangeTextFromSlider } from '~/component/virtual_keyboard/Keyboard.js'
import ENUM from '~/enum'
import * as Business from '~/business'
import { dataStorage } from '~/storage'
import {
    getSmartValueByLotSize
} from '~/screens/new_order/Controller/InputController.js'
const { ORDER_INPUT_TYPE } = ENUM
const isIos = Platform.OS === 'ios'
const IncreaseButton = ({ onPress, text, limitNumberLength = 16, disabled }) => {
    const currentRef = useRef({})
    const [isDisabled, setDisabled] = useState(true)
    const limitNumber = new Array(limitNumberLength).fill(9).reduce((pre, next) => {
        return pre.toString() + next.toString()
    }, '')
    useEffect(() => {
        if (text >= limitNumber || disabled) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [text, disabled])
    return (
        <IconCustom
            // onPressIn={() => {
            //     currentRef.current = setInterval(() => {
            //         onPress && onPress()
            //     }, 150);
            // }}
            // onPressOut={() => {
            //     if (currentRef.current) {
            //         clearInterval(currentRef.current)
            //     }
            // }}
            onPress={() => {
                onPress && onPress()
            }}
            style={{
                paddingRight: 8
            }}
            hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
            size={19}
            timeDelay={1}
            color={isDisabled ? CommonStyle.fontNearLight7 : CommonStyle.fontNearLight6}
            name={'nounPlus'}
            disabled={isDisabled}
        />
    )
}
const ReductionButton = ({ onPress, text, disabled }) => {
    const currentRef = useRef()
    const [isDisabled, setDisabled] = useState(true)
    useEffect(() => {
        if (text === null || isNaN(text) || parseFloat(text) === 0 || text === '' || disabled) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [text, disabled])
    return (
        <IconCustom
            onPress={() => {
                onPress && onPress()
            }}
            hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
            timeDelay={1}
            style={{
                paddingLeft: 8
            }}
            size={19}
            color={isDisabled ? CommonStyle.fontNearLight7 : CommonStyle.fontNearLight6}
            name={'nounRemove'}
            disabled={isDisabled}
        />
    )
}
export function checkDuplicateDot({ text = '' }) {
    const dots = text.split('.')
    if (dots.length > 2) {
        return true
    }
    return false
}
export function checkOnlyInterger({ onlyInterger, text = '' }) {
    if (onlyInterger) {
        let index = text.indexOf('.')
        if (index === -1) return false
        return true
    }
    return false
}
function checkLimitInteger({ text, limitInteger = 16 }) {
    const index = text.indexOf('.')
    let integer = text.slice(0, index)
    if (index === -1) {
        integer = text
    }
    if (integer.split('').length > limitInteger) {
        return true
    }
    return false
}
export const useListennerChangeText = function ({
    dic,
    setText,
    onChangeText,
    inputId,
    decimal,
    onlyInterger,
    limitInteger
}) {
    return useEffect(() => {
        Emitter.addListener(getChannelChangeText(inputId), null, ({ newText: text }) => {
            if (isIos) {
                let newText = dic.current.text + '' + text + ''
                if (checkMaxDecimal({ text: newText, decimal: dic.current.decimal }) || checkDuplicateDot({ text: newText }) || checkOnlyInterger({ onlyInterger, text: newText }) || checkLimitInteger({ text: newText, limitInteger })) {
                    return
                }
                dic.current.text = newText
                setText && setText(newText)
            } else {
                const currentText = dic.current.text + ''
                const selection = dic.current.selection.end
                const leftString = currentText.slice(0, selection)
                const rightString = currentText.slice(selection, currentText.length)
                let newText = leftString + text.toString() + rightString
                if (checkMaxDecimal({ text: newText, decimal: dic.current.decimal }) || checkDuplicateDot({ text: newText }) || checkOnlyInterger({ onlyInterger, text: newText }) || checkLimitInteger({ text: newText, limitInteger })) {
                    return
                }
                dic.current.text = newText
                setText && setText(newText)
            }
        });
        return () => {
            Emitter.deleteEvent(getChannelChangeText(inputId));
        }
    }, [inputId])
}
const haveDelete = (text) => {
    if (text === '') {
        return false
    }
    return true
}
export const useListennerDeleteText = function ({ dic, inputId, setText }) {
    return useEffect(() => {
        Emitter.addListener(getChannelDeleteText(inputId), null, () => {
            if (!haveDelete(dic.current.text)) return
            if (isIos) {
                console.info('dic.current.text', dic.current.text)
                const newText = dic.current.text === null ? 0 : dic.current.text.toString().slice(0, -1) + ''
                dic.current.text = newText
                setText(newText)
            } else {
                const currentText = dic.current.text + ''
                const selection = dic.current.selection.end
                const leftString = currentText.slice(0, selection).slice(0, -1)
                const rightString = currentText.slice(selection, currentText.length)

                let newText = leftString + rightString

                dic.current.text = newText
                setText(newText)
            }
        });
        return () => {
            Emitter.deleteEvent(getChannelDeleteText(inputId));
        }
    }, [inputId])
}
const checkMaxDecimal = ({ text = '', decimal }) => {
    const index = text.indexOf('.')
    if (index === -1) return false
    const decimalString = text.substring(index + 1)
    console.log('DCM ', decimalString, decimalString.length)
    const lengthDecimal = decimalString.length
    if (lengthDecimal > decimal) {
        return true
    } else {
        return false
    }
}
/**
 * Text se luu gia tri khi focus dang string khong co day , Ex: '1.234'
 */
const InputWithControl = React.forwardRef(({
    orderQuantity = 0,
    type,
    formatValueWhenBlur,
    formatValueWhenFocus,
    onChangeText,
    styleWrapper,
    styleText,
    propsTextInput = {},
    formatValue,
    step = 1,
    decimal = 0,
    alias = '',
    allowNegative,
    value,
    relateValue,
    preAlias = '',
    onlyInterger = false,
    limitInteger = 16,
    disabled, ...rest }, ref) => {
    const inputId = useMemo(() => {
        return `input#${Util.getRandomKey()}`
    }, [])
    const dic = useRef({
        text: formatValueWhenFocus(rest.defaultValue || '0'),
        coordinates: {},
        selection: {},
        isFocus: false,
        decimal: decimal
    })
    dic.current.decimal = decimal
    const defaultValue = useMemo(() => {
        dic.current.text = relateValue
        return rest.defaultValue;
    }, [relateValue])
    const refView = useRef()
    const refTextInput = useRef()

    const onFocus = useCallback(() => {
        // Show Keyboard
        refView.current && refView.current.measure && refView.current.measure((x, y, width, height, pageX, pageY) => {
            if (dic.current.timeOutSetCoordinates) clearTimeout(dic.current.timeOutSetCoordinates)
            dic.current.coordinates = dic.current.coordinates.x === undefined ? { x, y, width, height, pageX, pageY } : dic.current.coordinates
            Emitter.emit(ChannelKeyBoard.CHANGE_THIS_KEYBOARD, {
                preText: 0,
                isShowKeyBoard: true,
                inputId,
                isMapSlider: false,
                coordinates: dic.current.coordinates
            })
        });
        dic.current.isFocus = true
        const displayText = formatValueWhenFocus(dic.current.text)
        setText(displayText, false)
        rest.onFocus && rest.onFocus()
    })
    const onBlur = useCallback(() => {
        Business.showButtonConfirm()
        dic.current.timeOutSetCoordinates = setTimeout(() => {
            dic.current.coordinates = {}
        }, 300);
        dic.current.isFocus = false
        const displayText = formatValueWhenBlur(dic.current.text)
        // Cap nhat lai dic neu bi lam tron
        dic.current.text = formatValueWhenFocus(displayText) // Truong hop chi text dang khong nhap gi thi tra ve null
        refTextInput.current && refTextInput.current.setNativeProps({ text: displayText });
        rest.onBlur && rest.onBlur()
    })
    const setText = useCallback((text, isChangeRedux = true) => {
        if (text === null || isNaN(formatValueWhenFocus(text))) {
            dic.current.text = ''
        } else {
            dic.current.text = text
        }
        refTextInput.current && refTextInput.current.setNativeProps({ text: dic.current.text });
        isChangeRedux && onChangeText && onChangeText(dic.current.text)
    })
    const onSelectionChange = useCallback(({ nativeEvent: { selection: { start, end } } }) => {
        dic.current.selection = { start, end }
    }, [])
    useListennerChangeText({
        dic,
        setText,
        inputId,
        decimal: dic.current.decimal,
        onlyInterger,
        limitInteger
    })
    useListennerDeleteText({
        dic,
        setText,
        inputId
    })
    useImperativeHandle(ref, () => ({
        updateDic: (update) => {
            dic.current = { ...dic.current, ...update }
        },
        getWrapperIntance: () => refTextInput.current,
        getRef: () => refView.current,
        getDic: () => dic.current,
        changeText: (...p) => setText(...p)
    }));

    return (
        <View
            collapsable={false}
            style={[
                {
                    borderRadius: 4,
                    backgroundColor: disabled ? CommonStyle.color.disabled : CommonStyle.backgroundColor,
                    paddingVertical: Platform.OS === 'ios' ? 5 : 0,
                    flexDirection: 'row',
                    alignItems: 'center'
                }, styleWrapper
            ]}
            ref={refView}>
            <TouchableOpacity disabled={disabled} style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }} onPress={() => {
                refTextInput.current && refTextInput.current.focus()
            }} activeOpacity={1}>
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    alignItems: 'center',
                    overflow: 'hidden'
                }}>
                    <Text numberOfLines={1} style={[
                        {
                            fontSize: CommonStyle.fontSizeS,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontColor,
                            textAlign: 'center',
                            padding: 0,
                            margin: 0
                        }, styleText
                    ]}>{`${preAlias}`}</Text>
                    <TextInput
                        editable={!disabled}
                        numberOfLines={1}
                        showSoftInputOnFocus={false}
                        ref={refTextInput}
                        style={[
                            {
                                fontSize: CommonStyle.font11,
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                color: CommonStyle.fontColor,
                                textAlign: 'center',
                                padding: 0,
                                margin: 0,
                                lineHeight: 18
                            }, styleText
                        ]}
                        onSelectionChange={onSelectionChange}
                        {...rest}
                        defaultValue={defaultValue}
                        onBlur={onBlur}
                        onFocus={onFocus}
                        onChangeText={(text) => {
                            dic.current.text = text
                        }}
                        onChange={({ nativeEvent: { eventCount, target, text } }) => {
                            dic.current.text = text
                        }}
                    />
                    <Text numberOfLines={1} style={[
                        {
                            fontSize: CommonStyle.fontSizeS,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontColor,
                            textAlign: 'center',
                            padding: 0,
                            margin: 0
                        }, styleText
                    ]}>{`${alias}`}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
})
InputWithControl.propTypes = {}
InputWithControl.defaultProps = {}
export default InputWithControl
