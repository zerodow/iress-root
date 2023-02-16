import React, { } from 'react'
import {
    View, Dimensions
} from 'react-native'
import WebView from 'react-native-webview'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language'
import Header from '~/component/headerNavBar/index';
import FallHeader from '~/component/fall_header'
import Icon from '~/component/headerNavBar/icon';
import NetworkWarning from '~/component/network_warning/network_warning_reanimated'
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')

const ThirdPartyTerms = ({ navigator }) => {
    const uri = 'https://support.iress.com.au/legal/thirdpartydata.html'
    const dismissModal = () => {
        return navigator.dismissModal()
    }
    const renderLeft = () => {
        return <View style={{ width: 36 }}>
            <Icon name="ios-arrow-back" onPress={dismissModal} />
        </View>
    }
    const renderHeader = ({ navigator }) => {
        return <Header
            navigator={navigator}
            leftIcon={'menu'}
            renderLeftComp={renderLeft}
            title={I18n.t('thirdPartyTerms')}
            containerStyle={{
                zIndex: 9999
            }}
            styleDefaultHeader={{
                paddingBottom: 0
            }}
            firstChildStyles={{ minHeight: 18 }}
            style={{ paddingTop: 16, paddingBottom: 5 }} />
    }
    return <View style={{ flex: 1, backgroundColor: CommonStyle.color.bg }}>
        {renderHeader({ navigator })}
        <NetworkWarning navigator={navigator} />
        <View style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: CommonStyle.backgroundColor
        }}>
            <WebView
                originWhitelist={'*'}
                source={{ uri }}
                onLoadEnd={() =>
                    console.log('onLoadEnd')
                }
                onError={(e) => {
                    console.log('onError', e)
                }}
                style={{
                    width: DEVICE_WIDTH,
                    height: DEVICE_HEIGHT
                    // backgroundColor: CommonStyle.backgroundColor
                }}
                scalesPageToFit={true}
            />
        </View>
    </View>
}

export default ThirdPartyTerms
