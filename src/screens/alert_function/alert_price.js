import React from 'react'
import {
    View, Text, TouchableOpacity, ImageBackground, TouchableWithoutFeedback, Keyboard
} from 'react-native'

// Util
import * as Business from '../../business'
import * as PureFunc from '../../utils/pure_func'
import * as Emitter from '@lib/vietnam-emitter'

// Component
import XComponent from '../../component/xComponent/xComponent'
import Flag from '../../component/flags/flag'
import AnnouncementIcon from '../../component/announcement_icon/announcement_icon'
import LastTrade from './alert_last_trade'
import SecurityDetails from './alert_security_details'
import AlertOptions from './alert_options'
import AlertSymbol from './alert_symbol'
import AlertCompany from './alert_company'
import TradeInfo from '~/screens/watchlist/Detail/components/TradeInfo.js'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import bgImage from '~/img/background_mobile/group7.png'
export default class AlertPrice extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {},
            isLoading: this.props.isLoading || false
        }
        this.state = {
            isLoading: false
        }
        this.subChangePriceObject()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    subChangePriceObject() {
        const channel = this.props.channelAllPrice
        Emitter.addListener(channel, this.id, priceObject => {
            this.dic.priceObject = priceObject
        })
    }
    onLayoutContentSecurityDetails = (event) => {
        const h = event.nativeEvent.layout.height
        if (h) {
            this.props.setHeightTriggerPinPrice && this.props.setHeightTriggerPinPrice(h)
        }
    }
    setRefAlertOption = this.setRefAlertOption.bind(this)
    setRefAlertOption(ref) {
        this.refAlertOption = ref
    }
    resetError = () => {
        this.refAlertOption && this.refAlertOption.resetError()
    }
    render() {
        const { symbol, exchange } = this.props
        return (
            <View>
                <View onLayout={this.onLayoutContentSecurityDetails}>
                    <ImageBackground
                        source={bgImage}
                        resizeMode={'stretch'}
                        // borderBottomRightRadius={48}
                        style={{
                            width: '100%'
                        }}>
                        <TradeInfo
                            style={{
                                backgroundColor: 'transparent',
                                paddingVertical: 8,
                                paddingHorizontal: 16
                            }}
                            // channelLoading={this.channelLoading}
                            symbol={symbol}
                            exchange={exchange}
                        // isLoading={isLoading}
                        />
                    </ImageBackground>

                </View>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ paddingHorizontal: 16 }}>
                        <AlertOptions
                            ref={this.setRefAlertOption}
                            channelBlurWithPan={this.props.channelBlurWithPan}
                            channelAllPrice={this.props.channelAllPrice}
                            updateError={this.props.updateError}
                            isModify={this.props.isModify}
                            alertObj={this.props.alertObj}
                            priceObject={this.dic.priceObject} />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}
