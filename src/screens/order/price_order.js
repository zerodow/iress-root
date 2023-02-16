import React, { Component } from 'react';
import {
    View, ImageBackground,
    Dimensions
} from 'react-native';
// Component
import XComponent from '../../component/xComponent/xComponent';
import LastTrade from './last_trade'
import TodayChange from './today_change'
import BidAsk from './bid_ask'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import pinBackground from '~/img/background_mobile/group7.png'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'

const { width, height } = Dimensions.get('window')
export default class PriceOrder extends XComponent {
    constructor(props) {
        super(props)

        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
    }

    init() {
        this.dic = {
            priceObject: this.props.priceObject || {},
            isLoading: this.props.isLoading || false
        }
    }

    bindAllFunc() {
    }

    render() {
        return (
            <View style={{ borderBottomRightRadius: CommonStyle.borderBottomRightRadius, backgroundColor: CommonStyle.colorEdge, width }}>
                <View style={{ marginBottom: 5, width: '100%' }}>
                    <ImageBackground source={pinBackground}
                        resizeMode={'cover'}
                        backfaceVisibility={'visible'}
                        style={{
                            width: '100%', borderBottomRightRadius: CommonStyle.borderBottomRightRadius, overflow: 'hidden'
                        }}
                        imageStyle={{ borderBottomRightRadius: CommonStyle.borderBottomRightRadius }}

                    >
                        {this.props.children || null}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                            <View style={{ width: '50%' }}>
                                <LastTrade
                                    colorUp={CommonStyle.hightLightColorUp}
                                    colorDown={CommonStyle.hightLightColorDown}
                                    value={this.dic.priceObject}
                                    channelLoadingOrder={this.props.channelLoadingOrder}
                                    channelPriceOrder={this.props.channelPriceOrder}
                                    isLoading={this.dic.isLoading}
                                />
                            </View>
                            <View style={{ width: '50%' }}>
                                <TodayChange
                                    colorUp={CommonStyle.hightLightColorUp}
                                    colorDown={CommonStyle.hightLightColorDown}
                                    value={this.dic.priceObject}
                                    channelLoadingOrder={this.props.channelLoadingOrder}
                                    channelPriceOrder={this.props.channelPriceOrder}
                                    isLoading={this.dic.isLoading}
                                />
                            </View>
                        </View>
                        <BidAsk
                            value={this.dic.priceObject}
                            channelLoadingOrder={this.props.channelLoadingOrder}
                            channelPriceOrder={this.props.channelPriceOrder}
                            isLoading={this.dic.isLoading}
                        />
                    </ImageBackground>
                </View>
            </View >
        )
    }
}
