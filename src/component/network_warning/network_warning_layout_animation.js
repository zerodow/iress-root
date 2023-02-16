import React, {
    useRef, useEffect, useState,
    useImperativeHandle, useCallback, useLayoutEffect
} from 'react'
import {
    View, Text, Platform, LayoutAnimation, UIManager
} from 'react-native'
import { useSelector } from 'react-redux'
import I18n from '~/modules/language/'
import CommonStyle from '~/theme/theme_controller'

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

let NetworkWarning = ({ navigator }, ref) => {
    const dic = useRef({
        didAppear: true,
        isConnected: true
    })
    const isConnectedRedux = useSelector(state => state.app.isConnected)
    const [isConnected, setIsConnected] = useState(isConnectedRedux)
    const updateDidAppearStatus = useCallback((status) => {
        dic.current.didAppear = status
    }, [])
    const forceUpdate = useCallback(() => {
        if (isConnectedRedux !== dic.current.isConnected) {
            dic.current.isConnected = isConnectedRedux
            LayoutAnimation.easeInEaseOut()
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
            dic.current.isConnected = isConnectedRedux
            LayoutAnimation.easeInEaseOut()
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
    return isConnected
        ? <View />
        : <View >
            <View
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
        </View>
}
NetworkWarning = React.forwardRef(NetworkWarning)
NetworkWarning = React.memo(NetworkWarning, () => true)
export default NetworkWarning
