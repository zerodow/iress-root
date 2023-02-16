import React from 'react'
import {
    View, Text, TouchableOpacity, ScrollView
} from 'react-native'
// Storage
import ENUM from '../../enum'
// Util
import * as FunctionUtil from '../../lib/base/functionUtil'
import * as Util from '../../util'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Component
import XComponent from '../../component/xComponent/xComponent'
import Flashing from '../../component/flashing/flashing.1';
import Quantity from '../../component/price_child/quantity';
import ChangePoint from '~/component/price_child/change_point'
import ChangePercent from '~/component/price_child/change_percent'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import FlashingWrapper from '~/screens/order/flashing'
import ViewLoadingReAni from '~/component/loading_component/view1'
import * as Emitter from '@lib/vietnam-emitter';
const { PRICE_DECIMAL, FLASHING_FIELD } = ENUM

export default class LastTrade extends XComponent {
    init() {
        this.dic = {
            priceObject: this.props.priceObject || {}
        }
        this.state = {
            isLoading: this.props.isLoading
        }
        this.subLoading()
    }

    subLoading() {
        this.idSubLoading = Emitter.addListener(
            this.props.channelLoading,
            this.id,
            (isLoading) => {
                if (this.state.isLoading !== isLoading) {
                    this.setState({
                        isLoading
                    })
                }
            })
    }
    componentWillUnmount() {
        super.componentWillUnmount()
        this.idSubLoading && Emitter.deleteByIdEvent(this.idSubLoading);
    }
    isTradePriceChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.trade_price === undefined ||
            oldData.trade_price === null ||
            oldData.trade_price !== newData.trade_price) &&
            newData.trade_price !== undefined &&
            newData.trade_price !== null
    }

    isTradeSizeChange(oldData, newData) {
        return (oldData === undefined ||
            oldData === null ||
            oldData.trade_size === undefined ||
            oldData.trade_size === null ||
            oldData.trade_size !== newData.trade_size) &&
            newData.trade_size !== undefined &&
            newData.trade_size !== null
    }

    formatTradePrice(value) {
        return FunctionUtil.formatNumberNew2(value.trade_price, PRICE_DECIMAL.PRICE)
    }

    formatTradeSize(value, isLoading) {
        return (
            <Text style={[CommonStyle.textSubNumber, {
                fontSize: CommonStyle.fontSizeM,
                fontWeight: '300'
            }]}>
                {
                    isLoading
                        ? '--'
                        : value.trade_size === undefined || value.trade_size === null
                            ? '--'
                            : `${FunctionUtil.formatNumber(value.trade_size)}`
                }
            </Text>
        )
    }

    renderLastTradeAndVolume() {
        return <FlashingWrapper
            channelLoadingOrder={this.props.channelLoading}
            isLoading={this.state.isLoading}
            style={[{
                flexDirection: 'row',
                marginRight: 8,
                alignItems: 'center'
            }]}>
            <Flashing
                value={this.dic.priceObject}
                channelLv1FromComponent={this.props.channelPrice}
                field={FLASHING_FIELD.TRADE_PRICE}
                style={[{
                    ...CommonStyle.textMainNoColor,
                    opacity: CommonStyle.opacity1,
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontSizeL
                }, this.props.styleFlashing || {}]}
                positionStyle={{ left: 0 }}
                noneValueStyle={{ fontSize: CommonStyle.fontSizeM, fontWeight: '300', fontFamily: CommonStyle.fontBold }}
                isValueChange={this.isTradePriceChange}
                updateTrend={this.updateTrend}
                formatFunc={this.formatTradePrice}
            />
        </FlashingWrapper>
    }

    updateTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(newData.trade_price, oldData.trade_price);
    }

    renderChangePointAndPercent() {
        return <View pointerEvents={'box-none'} style={{ justifyContent: 'center', flex: 1 }}>
            <ViewLoadingReAni styleContainer={{ alignSelf: 'flex-start' }} style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center'
            }} isLoading={this.state.isLoading}>
                <ChangePoint
                    colorUp={CommonStyle.hightLightColorUp}
                    colorDown={CommonStyle.hightLightColorDown}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    textStyle={[{ fontSize: CommonStyle.fontSizeS }, this.props.stylePriceChange || {}]}
                />
                <ChangePercent
                    colorUp={CommonStyle.hightLightColorUp}
                    colorDown={CommonStyle.hightLightColorDown}
                    value={this.dic.priceObject}
                    channelLoading={this.props.channelLoading}
                    channelPrice={this.props.channelPrice}
                    isLoading={this.props.isLoading}
                    textStyle={[{ fontSize: CommonStyle.fontSizeS }, this.props.stylePriceChange || {}]}
                />
            </ViewLoadingReAni>
            {/* <ViewLoad isLoading={this.state.isLoading} containerStyle={[{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center'
            }]}>

            </ViewLoad> */}
        </View>
    }

    render() {
        return (
            <View pointerEvents={'box-none'} style={{
                alignItems: 'center',
                flexDirection: 'row',
                flex: 1
            }}>
                {this.renderLastTradeAndVolume()}
                {this.renderChangePointAndPercent()}
            </View>
        )
    }
}
