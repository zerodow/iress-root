import React from 'react'
import {
    View, Text, TouchableOpacity,
    LayoutAnimation, Platform, UIManager,
    Dimensions
} from 'react-native'
import Animated from 'react-native-reanimated'
// Util
import * as Emitter from '@lib/vietnam-emitter'
import Enum from '~/enum'
// Component
import XComponent from '../../component/xComponent/xComponent'
import LastTrade from './alert_last_trade'
import AlertSymbol from './alert_symbol'
import AlertCompany from './alert_company'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import NotifyOrder from '~/component/notify_order/index1'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ShowHideAni from '~s/watchlist/Detail/components/ShowHideAni'
import { IconC2R } from '~/screens/order/order_detail.js'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Controller from '~/memory/controller'
const { width: widthDevices } = Dimensions.get('window')
const {
    lessThan,
    greaterThan,
    sub,
    Value,
    cond,
    and,
    block,
    set,
    not,
    multiply
} = Animated;
const ENUM = {
    HEIGHT_HAVE_DRAG: 64,
    HEIGHT_HAVE_NOT_DRAG: 80,
    HEIGHT_SPECIAL: 36
}
export class AlertShowHideAni extends ShowHideAni {

}
export default class AlertPriceTop extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {},
            isLoading: this.props.isLoading || false
        }
        this.isFirstRender = true;
        this.state = {
            isLoading: false,
            isShowDefault: true,
            heightTrigger: 144
        }
        this.subChangePriceObject()
        this.subLoading()
    }
    componentDidMount() {
        super.componentDidMount()
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.idSubLoading && Emitter.deleteByIdEvent(this.idSubLoading)
        this.id && Emitter.deleteByIdEvent(this.id)
    }
    subChangePriceObject() {
        const channel = this.props.channelAllPrice
        this.id = Emitter.addListener(channel, null, priceObject => {
            this.dic.priceObject = priceObject
        })
    }
    subLoading() {
        this.idSubLoading = Emitter.addListener(this.props.channelLoading, this.idSubLoading, isLoading => {
            this.dic.isLoadingPrice = isLoading
            this.setState({})
        })
    }
    onClose = () => {
        this.props.onClose && this.props.onClose()
    }
    setHeightTriggerPinPrice = (heightTrigger) => {
        this.heightTrigger = heightTrigger
        this.setState({
            heightTrigger
        })
    }
    renderInfoSpecial = () => {
        return (
            <Animated.View style={{
                flexDirection: 'row',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                bottom: 0,
                paddingLeft: 16
            }}>
                <LastTrade
                    styleFlashing={{ fontSize: CommonStyle.fontSizeS }}
                    stylePriceChange={{ fontSize: CommonStyle.fontSizeXS }}
                    channelAllPrice={this.props.channelAllPrice}
                    priceObject={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading} />
            </Animated.View>
        )
    }
    updateError = ({ type = 'error', text }, cb) => {
        // Show loi khi khong pin gia
        this.refNotifyOrder && this.refNotifyOrder.showMessage({
            type: type,
            text: text
        }, () => {
            cb && cb()
        })
        // Show loi khi pin gia
        this.refNotifyOrder1 && this.refNotifyOrder1.showMessage({
            type: type,
            text: text
        }, () => {
            cb && cb()
        })
    }
    hideError = () => {
        this.refNotifyOrder1 && this.refNotifyOrder1.hideMessage()
    }
    renderPin = () => {
        return (
            <View style={{ flexDirection: 'row', backgroundColor: CommonStyle.backgroundColor, paddingLeft: 16 }}>
                <AlertSymbol
                    channelSymbolInfo={this.props.channelSymbolInfo}
                    priceObject={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    isLoading={this.state.isLoading} />
                <LastTrade
                    styleFlashing={{ fontSize: CommonStyle.fontSizeS }}
                    stylePriceChange={{ fontSize: CommonStyle.fontSizeXS }}
                    channelAllPrice={this.props.channelAllPrice}
                    priceObject={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.dic.isLoading} />
            </View>
        )
    }
    renderNotPin = () => {
        const isStreaming = Controller.isPriceStreaming()
        return (
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: CommonStyle.backgroundColor, paddingLeft: 16 }}>
                <View
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'row'
                        // paddingLeft: 16
                    }}
                >
                    {
                        !isStreaming && (
                            <TouchableOpacityOpt
                                timeDelay={Enum.TIME_DELAY}
                                onPress={this.clickRefreshPrice}
                                hitSlop={{
                                    top: 8,
                                    left: 16,
                                    bottom: 8,
                                    right: 16
                                }}
                                style={{
                                    width: 32
                                }}>
                                <Text style={[{
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    fontSize: CommonStyle.fontSizeL,
                                    color: CommonStyle.fontColor,
                                    opacity: 0
                                }]}>
                                    A
                            </Text>
                                <IconC2R channelLoading={this.props.channelLoading} onRefresh={this.props.onRefresh} />
                            </TouchableOpacityOpt>
                        )
                    }
                    <AlertSymbol
                        channelSymbolInfo={this.props.channelSymbolInfo}
                        priceObject={this.dic.priceObject}
                        channelLoading={this.props.channelLoading}
                        isLoading={this.state.isLoading} />
                </View>

                <AlertCompany
                    channelSymbolInfo={this.props.channelSymbolInfo}
                    channelNewsToday={this.props.channelNewsToday}
                    priceObject={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    isLoading={this.state.isLoading} />
            </View>
        )
    }
    render() {
        const { _scrollValue } = this.props;
        const { heightTrigger } = this.state
        const changePoint = sub(new Animated.Value(0), new Animated.Value(heightTrigger))

        return (
            <React.Fragment>
                <Animated.View pointerEvents={'box-none'} >
                    <View style={{
                        // paddingLeft: 16,
                        backgroundColor: CommonStyle.backgroundColor,
                        flexDirection: 'row',
                        // paddingTop: 8,
                        zIndex: 999
                    }} pointerEvents={'box-none'}>
                        <AlertShowHideAni
                            style={{ flex: 1 }}
                            withTrans={new Value(-widthDevices)}
                            isShow={greaterThan(_scrollValue, changePoint)}
                            isHide={lessThan(_scrollValue, changePoint)}
                        >
                            {this.renderNotPin()}
                        </AlertShowHideAni>
                        <View pointerEvents={'none'} style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            flexDirection: 'row',
                            // paddingLeft: 16,
                            alignItems: 'center'
                        }}>
                            <AlertShowHideAni
                                style={{ flex: 1 }}
                                isHide={greaterThan(_scrollValue, changePoint)}
                                isShow={lessThan(_scrollValue, changePoint)}
                            >
                                <NotifyOrder ref={ref => this.refNotifyOrder1 = ref} />
                                {this.renderPin()}
                            </AlertShowHideAni>
                        </View>
                    </View>

                    <View style={{ backgroundColor: CommonStyle.backgroundColor }}>
                        <AlertShowHideAni
                            style={{ flex: 1 }}
                            isHide={greaterThan(_scrollValue, changePoint)}
                            isShow={lessThan(_scrollValue, changePoint)}
                        >
                            <Animated.View style={{
                                backgroundColor: CommonStyle.backgroundColor,
                                borderBottomWidth: 1,
                                borderBottomColor: CommonStyle.fontNearLight3,
                                width: '100%'
                            }} />
                        </AlertShowHideAni>

                    </View>

                    <Animated.View pointerEvents={'none'}>

                        <AlertShowHideAni
                            isShow={greaterThan(_scrollValue, changePoint)}
                            isHide={lessThan(_scrollValue, changePoint)}
                        >
                            <NotifyOrder ref={ref => this.refNotifyOrder = ref} />
                            <View style={{
                                backgroundColor: CommonStyle.backgroundColor,
                                paddingHorizontal: 16,
                                paddingBottom: 4
                            }}>
                                <LastTrade
                                    channelAllPrice={this.props.channelAllPrice}
                                    priceObject={this.dic.priceObject}
                                    channelLoading={this.props.channelLoading}
                                    channelPrice={this.props.channelPrice}
                                    isLoading={this.dic.isLoading} />
                            </View>
                        </AlertShowHideAni>
                    </Animated.View>
                </Animated.View>
            </React.Fragment >
        )
    }
}
AlertPriceTop.defaultProps = {
    isShowDragHandle: true,
    style: {}
}
