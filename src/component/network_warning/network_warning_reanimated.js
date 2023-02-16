import React, {
    useRef, useEffect, useState,
    useImperativeHandle, useCallback, useLayoutEffect
} from 'react'
import {
    View, Text, Platform
} from 'react-native'
import { useSelector } from 'react-redux'
import I18n from '~/modules/language/'
import CommonStyle from '~/theme/theme_controller'
import { Transitioning, Transition } from 'react-native-reanimated';

let NetworkWarning = ({ navigator }, ref) => {
    const dic = useRef({
        didAppear: true,
        isConnected: true
    })
    const refTransition = useRef()
    const isConnectedRedux = useSelector(state => state.app.isConnected)
    const [isConnected, setIsConnected] = useState(isConnectedRedux)
    const updateDidAppearStatus = useCallback((status) => {
        dic.current.didAppear = status
    }, [])
    const forceUpdate = useCallback(() => {
        if (isConnectedRedux !== dic.current.isConnected) {
            refTransition.current && refTransition.current.animateNextTransition && refTransition.current.animateNextTransition()
            dic.current.isConnected = isConnectedRedux
            setIsConnected(isConnectedRedux)
        }
    }, [isConnectedRedux])
    useImperativeHandle(ref, () => {
        return {
            forceUpdate,
            updateDidAppearStatus
        }
    })
    useEffect(() => {
        if (isConnectedRedux !== isConnected) {
            if (!dic.current.didAppear) return
            refTransition.current && refTransition.current.animateNextTransition && refTransition.current.animateNextTransition()
            dic.current.isConnected = isConnectedRedux
            setIsConnected(isConnectedRedux)
        }
    }, [isConnectedRedux, isConnected])
    const onNavigatorEvent = useCallback((event) => {
        switch (event.id) {
            case 'didAppear':
                updateDidAppearStatus(true)
                forceUpdate()
                break;
            case 'didDisappear':
                updateDidAppearStatus(false)
                break;
            default:
                break;
        }
    }, [])
    useLayoutEffect(() => {
        if (Platform.OS === 'ios') return
        const listener = navigator.addOnNavigatorEvent(onNavigatorEvent);
        return () => {
            listener()
        }
    }, [])
    const transition = (
        <Transition.Together>
            <Transition.In
                type={'fade'}
                durationMs={200}
                interpolation="easeOut"
            />
            <Transition.Change />
            <Transition.Out
                type="fade"
                durationMs={200}
                interpolation="easeIn" />
        </Transition.Together>
    );
    return <Transitioning.View
        ref={refTransition}
        transition={transition}>
        {
            isConnected
                ? <View />
                : <View
                    style={{
                        width: '100%',
                        backgroundColor: CommonStyle.color.sell,
                        paddingVertical: 8
                    }}>
                    <Text style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font11,
                        color: CommonStyle.fontBlack,
                        textAlign: 'center'
                    }}>
                        {I18n.t('connectingFirstCapitalize')}
                    </Text>
                </View>
        }
    </Transitioning.View>
}
NetworkWarning = React.forwardRef(NetworkWarning)
NetworkWarning = React.memo(NetworkWarning, () => true)
export default NetworkWarning
