import React, { useState, useEffect, useMemo, useRef } from 'react'
import { connect } from 'react-redux'
import I18n from '~/modules/language'
import { View, Text, Dimensions } from 'react-native'
import CustomIcon from '~/component/Icon'
import CommonStyle from '~/theme/theme_controller'
import * as Emitter from '@lib/vietnam-emitter';
import { getChannelChangeOrderError, getChannelChangeRealOrderError } from '~/streaming/channel'
import Enum from '~/enum'
const { height: HEIGHT_DEVICE } = Dimensions.get('window')
const { TYPE_MESSAGE } = Enum
function useListenConnected({ isConnected, updateError }) {
    return useEffect(() => {
        if (!isConnected) {
            updateError({
                msg: `${I18n.t('connecting')}...`,
                autoHide: false,
                type: TYPE_MESSAGE.CONNECTING
            })
        }
    }, [isConnected])
}
const OrderErrorFake = ({ isConnected }) => {
    const dic = useRef({ autoHide: true })
    const [error, setError] = useState('')
    const channel = getChannelChangeOrderError()
    const channelRealError = getChannelChangeRealOrderError()
    const unmount = () => {
        Emitter.deleteEvent(channel)
    }
    const updateError = ({ msg, autoHide = true, type = TYPE_MESSAGE.ERROR }) => {
        dic.current.autoHide = autoHide
        dic.current.type = type
        setError(msg)
    }
    const addListenerChangeError = () => {
        Emitter.addListener(channel, null, updateError)
    }
    useEffect(() => {
        addListenerChangeError()
        return unmount
    }, [])
    const onLayout = (event) => {
        const { layout } = event.nativeEvent
        const { width, height } = layout
        // Trigger animation for real error
        if (error) {
            Emitter.emit(channelRealError, {
                error,
                height,
                autoHide: dic.current.autoHide,
                type: dic.current.type
            })
            setError('')
        }
    }
    useListenConnected({ isConnected, updateError })
    return <View
        onLayout={onLayout}
        style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            position: 'absolute',
            opacity: 0,
            transform: [{ translateY: -HEIGHT_DEVICE }]
        }}>
        {
            error
                ? <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
                    <CustomIcon
                        color={CommonStyle.fontWhite}
                        name='equix_alert'
                        style={{ fontSize: CommonStyle.fontSizeS, paddingRight: 16, top: 4 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.font11,
                            color: CommonStyle.fontColor
                        }}>
                            {error}
                        </Text>
                    </View>
                </View>
                : null
        }
    </View>
}
function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    }
}
export default connect(mapStateToProps)(OrderErrorFake)
