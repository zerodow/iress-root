import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { View, Text, Keyboard, Platform, StatusBar } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated';
const useRegisterKeyboard = ({ handleKeyboardShow, handleKeyboardHide }) => {
    return useEffect(() => {
        const showListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        const _listeners = [
            Keyboard.addListener(showListener, handleKeyboardShow),
            Keyboard.addListener(hideListener, handleKeyboardHide)
        ];
        return () => {
            _listeners.forEach(listener => listener.remove());
        }
    }, [])
}
export const useKeyboardSmart = () => {
    const ref = useRef()
    const updateLayout = useCallback((e) => {
        try {
            ref.current.handleUpdateLayout(e)
        } catch (error) {

        }
    }, [])
    return [updateLayout, ref]
}
const HandleListenerKeyboard = React.forwardRef(({ translateY, getMeasure }, ref) => {
    const dic = useRef({
        eventKeyboard: null,
        keyboardShowing: false
    })
    const handleKeyboardShow = useCallback((e) => {
        dic.current.eventKeyboard = e
        if (!dic.current.keyboardShowing && dic.current.needUpdate) {
            dic.current.needUpdate = false
            dic.current.functionHandleUpdateLayout && dic.current.functionHandleUpdateLayout()
        }
        dic.current.keyboardShowing = true
    }, [])
    const handleKeyboardHide = useCallback((e) => {
        dic.current.eventKeyboard = null
        if (dic.current.keyboardShowing) {
            runAnimation({ nextTranslateY: 0 })
        }
        dic.current.keyboardShowing = false
    }, [])
    const handleUpdateLayout = useCallback(({ pageYTextInput = 0, heightTextInput = 0 }) => {
        getMeasure((x, y, width, height, pageX, pageY) => {
            Platform.OS === 'android' ? handleAndroid({ x, y, width, height, pageX, pageY }) : handleIos({ x, y, width, height, pageX, pageY })
        })
    }, [])
    const handleIos = useCallback(({ x, y, width, height, pageX, pageY }) => {
        try {
            const tmpYView = pageY + height
            const tmpyKeyboard = dic.current.eventKeyboard.endCoordinates.screenY
            if (tmpYView > tmpyKeyboard) {
                runAnimation({ nextTranslateY: tmpYView - tmpyKeyboard + 16 })
            }
        } catch (error) {

        }
    }, [])
    const handleAndroid = useCallback(({ x, y, width, height, pageX, pageY }) => {
        dic.current.functionHandleUpdateLayout = () => {
            const tmpYView = pageY + height
            const tmpyKeyboard = dic.current.eventKeyboard.endCoordinates.screenY
            if (tmpYView > tmpyKeyboard) {
                runAnimation({ nextTranslateY: tmpYView - tmpyKeyboard + 16 })
            }
        }
        try {
            if (dic.current.eventKeyboard && !dic.current.keyboardShowing) {
                dic.current.needUpdate = false
                dic.current.functionHandleUpdateLayout()
            } else {
                dic.current.needUpdate = true
            }
        } catch (error) {

        }
    }, [])
    const runAnimation = useCallback(({ nextTranslateY }) => {
        const tmp = Animated.timing(translateY, {
            toValue: -nextTranslateY,
            easing: Easing.linear,
            duration: 100
        })
        tmp.stop()
        tmp.start()
    }, [])
    useRegisterKeyboard({ handleKeyboardShow, handleKeyboardHide })
    useImperativeHandle(ref, () => ({
        handleUpdateLayout
    }))
    return null
})

export default HandleListenerKeyboard
