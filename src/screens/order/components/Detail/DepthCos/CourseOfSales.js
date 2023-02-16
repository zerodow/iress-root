import React, { Component } from 'react';
import { View, Text } from 'react-native';
import TenTrade from '~/screens/market_depth/swiper_10_trades';
import TenTradeRealtime from '~/screens/market_depth/swiper_10_trades_realtime';

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
import {
    logDevice,
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime
} from '~/lib/base/functionUtil';
export default class CourseOfSales extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isChangeTab: false
        };
        this.subLoading()
        this.subChangeTab()
    }
    subChangeTab = () => {
        this.idSubChangeTab = Emitter.addListener(Channel.getChannelChangeTabMarketDepth(), this.idSubChangeTab, this.onChangeTab)
    }
    onChangeTab = ({ isChangeTab, tabInfo }) => {
        if (isChangeTab !== this.state.isChangeTab && tabInfo.i === 2) {
            this.setState({
                isChangeTab
            })
        }
    }
    subLoading = () => {
        const { channelLoadingOrder } = this.props
        this.idSubLoading = Emitter.addListener(channelLoadingOrder, this.idSubLoading, this.onChangeLoading)
    }
    componentWillUnmount() {
        this.unSub()
    }
    unSub = () => {
        Emitter.deleteByIdEvent(this.idSubLoading);
        Emitter.deleteByIdEvent(this.idSubChangeTab);
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
    renderCosContent() {
        const {
            code,
            symbolObject,
            getReloadFuncCos
        } = this.props
        return (
            <View>
                {
                    code &&
                        symbolObject &&
                        !Util.compareObject(symbolObject, {})
                        ? (
                            RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_COURSE_OF_SALES_NEW_ORDER) ? (
                                Controller.isPriceStreaming()
                                    ? (<TenTradeRealtime
                                        code={code}
                                        isLoading={this.state.isLoading}
                                        isOrder={true}
                                        orderScreen={true}
                                    />)
                                    : (
                                        <TenTrade
                                            getReloadFuncCos={getReloadFuncCos}
                                            code={code}
                                            isOrder={true}
                                            isLoading={this.state.isLoading}
                                            orderScreen={true}
                                        />
                                    )
                            ) : (
                                    <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>

                                    </View>
                                )
                        )
                        : <View />
                }
            </View>
        );
    }
    render() {
        return (
            <React.Fragment>
                {

                    this.state.isChangeTab ? <View style={{ height: 200 }} /> : this.renderCosContent()
                }
            </React.Fragment>
        );
    }
}
