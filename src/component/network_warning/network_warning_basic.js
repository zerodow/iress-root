import React, { useState, useEffect } from 'react'
import {
    View, Text, LayoutAnimation, UIManager
} from 'react-native'
import { useSelector } from 'react-redux'
import I18n from '~/modules/language/'
import CommonStyle from '~/theme/theme_controller'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
const NetworkWarning = props => {
    const isConnectedRedux = useSelector(state => state.app.isConnected)
    const [isConnected, setIsConnected] = useState(isConnectedRedux)
    useEffect(() => {
        if (isConnectedRedux !== isConnected) {
            LayoutAnimation.easeInEaseOut()
            setIsConnected(isConnectedRedux)
        }
    }, [isConnectedRedux, isConnected])
    return isConnected
        ? <View />
        : <View style={{ width: '100%', backgroundColor: CommonStyle.color.sell, paddingVertical: 8 }}>
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

export default NetworkWarning
