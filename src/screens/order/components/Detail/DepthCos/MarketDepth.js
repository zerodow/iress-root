import React, { Component, PureComponent } from 'react';
import { View, Text } from 'react-native';
import SwiperMarketDepthRealtime from '~/screens/market_depth/swiper_market_depth_realtime';
import SwiperMarketDepth from '~/screens/market_depth/swiper_market_depth';

import { func, dataStorage } from '~/storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Business from '~/business';
import * as Util from '~/util';
import Enum from '~/enum';
import I18n from '~/modules/language';
import * as RoleUser from '~/roleUser';
import * as Controller from '~/memory/controller'
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel'
export default class MarketDepth extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isChangeTab: false
        };
        this.subLoading()
    }
    subLoading = () => {
        const { channelLoadingOrder } = this.props
        this.idSubLoading = Emitter.addListener(channelLoadingOrder, this.idSubLoading, this.onChangeLoading)
    }
    onChangeLoading = (isLoading) => {
        if (isLoading !== this.state.isLoading) {
            if (this.state.isLoading !== isLoading) {
                this.setState({
                    isLoading
                })
            }
        }
    }
    componentWillUnmount() {
        this.unSub()
    }
    unSub = () => {
        Emitter.deleteByIdEvent(this.idSubLoading);
        Emitter.deleteByIdEvent(this.idSubChangeTab);
    }
    renderMarketDepthContent = () => {
        const {
            symbolObject,
            isReSub,
            code,
            priceObject,
            channelLoadingOrder,
            channelPriceOrder,
            isLoadingPrice,
            getReloadFuncLv2
        } = this.props
        const check1 = Util.compareObject(symbolObject, {});
        const check2 = RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_MARKET_DEPTH_NEW_ORDER);

        return (
            <View style={{ overflow: 'hidden' }}>
                {
                    code &&
                        symbolObject &&
                        !check1 ? (
                            check2 ? (Controller.isPriceStreaming()
                                ? (<SwiperMarketDepthRealtime
                                    isReSub={isReSub}
                                    code={code}
                                    isOrder={this.props.isOrder || true}
                                    orderScreen={true}
                                    value={priceObject}
                                    channelLoadingOrder={channelLoadingOrder}
                                    channelPriceOrder={channelPriceOrder}
                                    isLoadingOrder={this.state.isLoading}
                                    isLoading={isLoadingPrice}
                                />)
                                : (
                                    <SwiperMarketDepth
                                        getReloadFuncLv2={getReloadFuncLv2}
                                        code={code}
                                        isOrder={this.props.isOrder || true}
                                        orderScreen={true}
                                        isLoadingOrder={this.state.isLoading}
                                        isLoading={isLoadingPrice}
                                    />
                                )
                            ) : (
                                    <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }} />

                                )
                        )
                        : <View />
                }
            </View>
        )
    }
    render() {
        return (
            <React.Fragment>
                {
                    this.renderMarketDepthContent()
                }
            </React.Fragment>
        );
    }
}
