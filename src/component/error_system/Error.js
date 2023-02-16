import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, LayoutAnimation, UIManager, Platform, Dimensions } from 'react-native'
import { dataStorage } from '~/storage'
import PropTypes from 'prop-types'
import Animated, { Transitioning, Transition, Easing } from 'react-native-reanimated';
import { TYPE_ERROR_SYSTEM, ERROR_SYSTEM } from './Constants'
import { useListenerShowError, useListenerHideError } from '~/component/error_system/Hook/Listenner.js'
import { setCode, getCode } from '~/component/error_system/Model/ErrorModel.js'
import CommonStyle, { register } from '~/theme/theme_controller';
import SvgIcon from '~/component/svg_icon/SvgIcon.js'
import ErrorRetryAndChangeUI from '~/component/error_system/Components/ErrorRetryAndChangeUI.js'
import ErrorRetryAndShowPopup from '~/component/error_system/Components/ErrorRetryAndShowPopup.js'
import ErrorRetryNotLimited from '~/component/error_system/Components/ErrorRetryNotLimited.js'
import ErrorAutoHide from '~/component/error_system/Components/ErrorAutoHide.js'
import { changeErrorSystemLoading } from '~/component/error_system/Redux/actions.js'
import { useDispatch } from 'react-redux';
import Shadow from '~/component/shadow';
import * as Controller from '~/memory/controller'
import { useNavigator, awaitCallback } from '~/screens/watchlist/TradeList/tradelist.hook.js';
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
const {
    Value,
    timing
} = Animated

const Error = React.memo(({ onReTry, screenId, navigator }) => {
    const [type, setTypeError] = useState(TYPE_ERROR_SYSTEM.HIDE);
    const [code, setCode] = useState(null)
    const [firstLoad, setFirstLoad] = useState(false)
    const dispatch = useDispatch()
    const dic = useRef({
        heightError: new Value(0)
    })
    const refTransitionView = useRef()
    const renderError = useCallback(() => {
        switch (type) {
            case TYPE_ERROR_SYSTEM.RETRY_FAIL_AND_CHANGE_UI:
                return <ErrorRetryAndChangeUI onReTry={onReTry} code={code} />
            case TYPE_ERROR_SYSTEM.RETRY_FAIL_AND_POP_BACK_LOGIN:
                return <ErrorRetryAndShowPopup onReTry={onReTry} code={code} />
            case TYPE_ERROR_SYSTEM.RETRY_FAIL_AND_INFINITED:
                return <ErrorRetryNotLimited onReTry={onReTry} code={code} />
            case TYPE_ERROR_SYSTEM.SHOW_AUTO_HIDE:
                return <ErrorAutoHide hideError={hideError} onReTry={onReTry} code={code} />
            default:
                return null
        }
    }, [type, code])
    const hideError = useCallback(({ isUpdateLoading = true }) => {
        if (dataStorage.currentScreenId !== screenId) return
        dic.current.code = null
        setCode(dic.current.code)
        LayoutAnimation.configureNext({
            duration: 300,
            create:
            {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
            update:
            {
                type: LayoutAnimation.Types.easeInEaseOut
            }
        });
        // refTransitionView.current.animateNextTransition();
        isUpdateLoading && dispatch(changeErrorSystemLoading(false))
        setTypeError(TYPE_ERROR_SYSTEM.HIDE)
    }, [])
    useListenerShowError({
        showError: (code) => {
            if (dataStorage.currentScreenId !== screenId) return
            const type = ERROR_SYSTEM[code]
            dic.current.code = code
            setCode(dic.current.code)
            LayoutAnimation.configureNext({
                duration: 300,
                create:
                {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity
                },
                update:
                {
                    type: LayoutAnimation.Types.easeInEaseOut
                }
            });
            // refTransitionView.current.animateNextTransition();
            dispatch(changeErrorSystemLoading(true))
            setTypeError(type)
        }
    })
    useListenerHideError({
        hideError
    })
    navigator && useNavigator(navigator, {
        willAppear: () => {
            setFirstLoad(false)
        },
        didDisappear: () => {
            if (Controller.getStatusModalCurrent()) {
                return;
            }
            setFirstLoad(true)
        }
    });

    useEffect(() => {
        return () => setCode(null)
    }, [])
    if (firstLoad) return null
    return (
        <View
        >
            {type !== TYPE_ERROR_SYSTEM.HIDE && <Shadow setting={{
                width: widthDevices,
                height: 0,
                color: CommonStyle.color.shadow,
                border: 2,
                radius: 0,
                opacity: 0.6,
                x: 0,
                y: 0,
                style: {
                    zIndex: 9,
                    position: 'absolute',
                    backgroundColor: CommonStyle.backgroundColor,
                    top: 0,
                    left: 0,
                    right: 0
                }
            }} />}
            {type !== TYPE_ERROR_SYSTEM.HIDE && renderError()}
        </View>
    )
}, () => true)
Error.propTypes = {}
Error.defaultProps = {}
const styles = StyleSheet.create({})
export default Error
