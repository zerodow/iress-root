import React from 'react'
import {
    View, Text, TouchableOpacity, Animated,
    LayoutAnimation, Platform, UIManager
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
import TopIcon from './components/TopIconPanel'
import CustomButton from '~/component/custom_button/custom_button_watchlist'
import Icon from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import PullToRefresh from './components/PullToRefresh'
import * as Animatable from 'react-native-animatable';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Controller from '~/memory/controller'
import opacity from 'react-native-style-tachyons/lib/styles/opacity'
import pinBackground1 from '~/img/background_mobile/group7.png'
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
const ENUM = {
    HEIGHT_HAVE_DRAG: 64,
    HEIGHT_HAVE_NOT_DRAG: 80,
    HEIGHT_SPECIAL: 36
}
export default class AlertPriceTop extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {},
            isLoading: this.props.isLoading || false,
            opacityWithoutPin: new Animated.Value(1),
            opacityPin: new Animated.Value(0)
        }
        this.translateYDefaultAni = this.props.isShowDragHandle ? new Animated.Value(ENUM.HEIGHT_HAVE_DRAG) : new Animated.Value(ENUM.HEIGHT_HAVE_NOT_DRAG);

        this.opacityDefaultAni = new Animated.Value(1);

        this.translateYSpecialAni = new Animated.Value(0);
        this.opacitySpecialAni = new Animated.Value(0)
        this.opacityPinBottom = new Animated.Value(1)
        this.opacityPinTop = new Animated.Value(0)
        this.isFirstRender = true;
        this.state = {
            isLoading: false,
            isShowDefault: true
        }
        this.subChangePriceObject()
        // this.subScrollValue()
    }
    addListenerScroll = (heightTrigger) => {
        this.props.scrollValue && this.props.scrollValue.addListener(({ value }) => {
            const triggerValue = 50
            const { heightContainer } = this.props
            const duration = 300

            // if (this.animationRunning) return
            if (value >= heightTrigger) {
                if (!this.showPin) {
                    this.showPin = true
                    Animated.parallel(
                        [
                            Animated.timing(
                                this.opacityPinBottom,
                                {
                                    toValue: 0,
                                    duration,
                                    useNativeDriver: true
                                }
                            ),
                            Animated.timing(
                                this.opacityPinTop,
                                {
                                    toValue: 1,
                                    duration,
                                    useNativeDriver: true
                                }
                            )
                        ]
                    ).start(() => {
                        this.showPin = true
                    })
                }
            } else {
                if (this.showPin) {
                    this.showPin = false
                    Animated.parallel([
                        Animated.timing(
                            this.opacityPinBottom,
                            {
                                toValue: 1,
                                duration,
                                useNativeDriver: true
                            }
                        ),
                        Animated.timing(
                            this.opacityPinTop,
                            {
                                toValue: 0,
                                duration,
                                useNativeDriver: true
                            }
                        )
                    ]).start(() => {
                        this.showPin = false
                    })
                }
            }
        })
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
    onClose = () => {
        this.props.onClose && this.props.onClose()
    }
    updatePriceHeader = (isShowDefault, duration = 250) => {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        // this.setState({ isShowDefault: isShow })
        this.updateStyleBorder(isShowDefault)
        console.log('dkm', isShowDefault)
        const heightDefault = this.props.isShowDragHandle ? ENUM.HEIGHT_HAVE_DRAG : ENUM.HEIGHT_HAVE_NOT_DRAG
        const heightSpecial = ENUM.HEIGHT_SPECIAL
        Animated.parallel([
            Animated.timing(
                this.translateYSpecialAni,
                {
                    toValue: isShowDefault ? 0 : heightSpecial,
                    duration
                }
            ),
            Animated.timing(
                this.translateYDefaultAni,
                {
                    toValue: isShowDefault ? heightDefault : 0,
                    duration
                }
            ),
            Animated.timing(
                this.opacityDefaultAni,
                {
                    toValue: isShowDefault ? 1 : 0,
                    duration
                }
            ),
            Animated.timing(
                this.opacitySpecialAni,
                {
                    toValue: isShowDefault ? 0 : 1,
                    duration
                }
            )
        ]).start()
    }
    createAnimation = (animatedVal, toVal, duration = 100) => {
        return Animated.timing(animatedVal, {
            toValue: toVal,
            duration
        })
    }
    updateStyleBorder = (status) => {
        this.refViewWrapper && this.refViewWrapper.setNativeProps({
            borderBottomColor: CommonStyle.lineColor,
            borderBottomWidth: status ? 0 : 1
        })
    }
    renderDragIcon() {
        const opacity = this.props.scrollValue.interpolate({
            inputRange: [0, 144, 1000],
            outputRange: [1, 0, 0]
        })
        return <Animated.View style={[
            CommonStyle.dragIcons,
            {
                opacity: this.opacityPinBottom
            }
        ]} />
    }
    render2RightIcon = () => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 16 }}>
                {this.renderRightIcon()}
                {this.renderCloseIcon()}
            </View>
        )
    }

    renderRightIcon() {
        const isStreaming = Controller.isPriceStreaming()
        return isStreaming
            ? <View />
            : <View
                style={[{ marginRight: 16, alignItems: 'flex-end', paddingTop: 3 }]}
            >
                {
                    this.dic.isLoadingPrice
                        ? <CustomButton
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                            iconStyle={{ height: 32, width: 32, right: -14 }} />
                        : <TouchableOpacity
                            style={{}}
                            testID="OrderSearchC2R"
                            onPress={this.props.onC2R}
                        >
                            <Icon
                                color={CommonStyle.fontWhite}
                                size={30}
                                name={'ios-refresh'} />
                        </TouchableOpacity>
                }
            </View>
    }
    setHeightTriggerPinPrice = (heightTrigger) => {
        this.props.scrollValue && this.props.scrollValue.removeListener()
        this.addListenerScroll(heightTrigger)
    }
    renderCloseIcon() {
        return <TouchableOpacityOpt
            onPress={this.onClose}
            style={{
                height: 24,
                paddingTop: 8
            }}
        >
            <View style={{ borderRadius: 48, width: 18, height: 18, backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3, alignContent: 'center', justifyContent: 'center' }}>
                <Icon
                    name='md-close' color={CommonStyle.backgroundColor}
                    style={{ textAlign: 'center', lineHeight: 18 }}
                    size={12}
                />
            </View>
        </TouchableOpacityOpt>
    }
    renderPinPrice = () => {

    }
    renderEmptyView = () => {
        return (
            <View style={{
                borderWidth: 1,
                opacity: 0
            }} />
        )
    }
    renderInfoSpecial = () => {
        return (
            <Animated.View style={{
                backgroundColor: CommonStyle.ColorTabNews,
                flexDirection: 'row',
                alignItems: 'center',
                // backgroundColor: CommonStyle.color.dark,
                position: 'absolute',
                top: 0,
                // bottom: 0,
                opacity: 1,
                paddingLeft: 16,
                paddingHorizontal: 8,
                borderBottomWidth: 1,
                borderBottomColor: CommonStyle.color.dusk,
                paddingVertical: 8
            }}>
                <AlertSymbol
                    symbol={this.props.symbol}
                    style={{ fontSize: CommonStyle.fontSizeL }}
                    channelSymbolInfo={this.props.channelSymbolInfo}
                    priceObject={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    isLoading={this.state.isLoading} />
                <LastTrade
                    symbol={this.props.symbol}
                    styleFlashing={{ fontSize: CommonStyle.fontSizeS }}
                    stylePriceChange={{ fontSize: CommonStyle.fontSizeXS }}
                    channelAllPrice={this.props.channelAllPrice}
                    priceObject={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading} />
                {/* <Animated.View style={{
                    borderBottomWidth: 1,
                    width: '100%',
                    // height: 1,
                    // flex: 1,
                    opacity: this.opacityPinTop,
                    borderBottomColor: CommonStyle.color.dusk
                }} /> */}
            </Animated.View>
        )
    }
    render() {
        const opacityBackground = this.props.scrollValue.interpolate({
            inputRange: [0, 60],
            outputRange: [1, 0]
        })
        return (
            <View style={{ overflow: 'hidden' }}>
                <Animated.View pointerEvents={'box-none'} >
                    <Animated.Image overflow={'hidden'} resizeMode={'cover'} opacity={opacityBackground} source={pinBackground1} style={{ position: 'absolute', right: 0, bottom: 0, left: 0, top: 0, width: '100%' }} />
                    {this.renderInfoSpecial()}
                    <Animated.View style={{
                        backgroundColor: CommonStyle.ColorTabNews,
                        borderBottomRightRadius: 48,
                        opacity: this.opacityPinBottom,
                        paddingLeft: 16,
                        // paddingBottom: 8,
                        paddingVertical: 16
                    }} pointerEvents={'box-none'}>

                        <View style={{ flexDirection: 'row' }} pointerEvents={'box-none'}>
                            <AlertSymbol
                                symbol={this.props.symbol}
                                channelSymbolInfo={this.props.channelSymbolInfo}
                                priceObject={this.dic.priceObject}
                                channelLoading={this.props.channelLoading}
                                isLoading={this.state.isLoading} />
                            <AlertCompany
                                symbol={this.props.symbol}
                                channelSymbolInfo={this.props.channelSymbolInfo}
                                channelNewsToday={this.props.channelNewsToday}
                                priceObject={this.dic.priceObject}
                                channelLoading={this.props.channelLoading}
                                isLoading={this.state.isLoading} />
                        </View>
                        <LastTrade
                            channelAllPrice={this.props.channelAllPrice}
                            priceObject={this.dic.priceObject}
                            channelLoading={this.props.channelLoading}
                            channelPrice={this.props.channelPrice}
                            isLoading={this.dic.isLoading} />
                    </Animated.View>
                </Animated.View>
            </View>
        )
    }
}
AlertPriceTop.defaultProps = {
    isShowDragHandle: true,
    style: {}
}
