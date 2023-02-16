import React, { useEffect, useState, useCallback, useRef, useMemo, useImperativeHandle } from 'react'
import { View, Text, TextInput as TextInputBase, Platform } from 'react-native'
import PropTypes from 'prop-types'
import * as Emitter from '@lib/vietnam-emitter';

import TextInput from '~/component/textinput_avoid_keyboard/TextInput'

import * as Util from '~/util';
import CommonStyle, { register } from '~/theme/theme_controller'
import { Channel as ChannelKeyBoard, getChannelChangeText, getChannelDeleteText, getChannelChangeTextFromSlider } from '~/component/virtual_keyboard/Keyboard.js'
const isIos = Platform.OS === 'ios'
export const useListennerChangeText = function ({
    dic,
    setText,
    inputId
}) {
    return useEffect(() => {
        Emitter.addListener(getChannelChangeText(inputId), null, ({ newText: text }) => {
            if (isIos) {
                let newText = dic.current.text.toString() + text.toString()
                setText && setText(newText)
            } else {
                const currentText = dic.current.text.toString()
                const selection = dic.current.selection.start
                const leftString = currentText.slice(0, selection)
                const rightString = currentText.slice(selection, currentText.length)
                let newText = leftString + text.toString() + rightString
                setText && setText(newText)
            }
        });
        return () => {
            Emitter.deleteEvent(getChannelChangeText(inputId));
        }
    }, [inputId])
}
export const useListennerDeleteText = function ({ dic, inputId, setText }) {
    return useEffect(() => {
        Emitter.addListener(getChannelDeleteText(inputId), null, () => {
            if (isIos) {
                const newText = dic.current.text.toString().slice(0, -1)
                setText(newText)
            } else {
                const currentText = dic.current.text.toString()
                const selection = dic.current.selection.start
                const leftString = currentText.slice(0, selection).slice(0, -1)
                const rightString = currentText.slice(selection, currentText.length)

                let newText = leftString + rightString
                setText(newText)
            }
        });
        return () => {
            Emitter.deleteEvent(getChannelDeleteText(inputId));
        }
    }, [inputId])
}
const InputDefault = React.forwardRef(({ styleWrapper, styleText, propsTextInput = {}, formatValue, ...rest }, ref) => {
    const inputId = useMemo(() => {
        return `input#${Util.getRandomKey()}`
    }, [])
    const defaultValue = useMemo(() => {
        return rest.defaultValue || '0'
    }, [])
    const dic = useRef({
        text: rest.defaultValue || '0'
    })
    const refView = useRef()
    const refTextInput = useRef()

    const onFocus = useCallback(() => {
        refView.current && refView.current.measure && refView.current.measure((x, y, width, height, pageX, pageY) => {
            Emitter.emit(ChannelKeyBoard.CHANGE_THIS_KEYBOARD, {
                preText: 0,
                isShowKeyBoard: true,
                inputId,
                isMapSlider: false,
                coordinates: { x, y, width, height, pageX, pageY }
            })
        });
        rest.onFocus && rest.onFocus(refTextInput.current)
    }, [rest.extractData])
    const onBlur = useCallback(() => {
        rest.onBlur && rest.onBlur(refTextInput.current)
    }, [rest.extractData])
    const setText = useCallback((text) => {
        text = formatValue ? formatValue({
            preText: dic.current.text,
            text
        }) : text
        dic.current.text = text
        refTextInput && refTextInput.current.setNativeProps({
            text: text
        })
        rest && rest.onChangeText && rest.onChangeText(text)
    })
    const onSelectionChange = useCallback(({ nativeEvent: { selection: { start, end } } }) => {
        dic.current.selection = { start, end }
    }, [])
    useListennerChangeText({
        dic,
        setText,
        inputId
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
        getRef: () => refView.current
    }));
    return (
        <View
            collapsable={false}
            style={[
                {
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: CommonStyle.fontBorder,
                    backgroundColor: CommonStyle.backgroundColor,
                    paddingVertical: 5
                }, styleWrapper
            ]}
            ref={refView}>
            <TextInput
                showSoftInputOnFocus={false}
                ref={refTextInput}
                style={[
                    {
                        fontSize: CommonStyle.fontSizeS,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.color.modify,
                        textAlign: 'center',
                        alignSelf: 'stretch',
                        paddingVertical: 0
                    }, styleText
                ]}
                onSelectionChange={onSelectionChange}
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
        </View>
    )
})
InputDefault.propTypes = {}
InputDefault.defaultProps = {}
export default InputDefault
