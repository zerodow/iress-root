import React, { Component, PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import ViewLoadingReAni from '~/component/loading_component/view1'
import PriceValue from '~/screens/watchlist/Component/PriceValue.js'

import CommonStyle, { register } from '~/theme/theme_controller'
export class FlashingWithRedux extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading
        };
        this.addListennerOnLoading()
    }
    addListennerOnLoading = () => {
        this.idLoadingEvent = Emitter.addListener(this.props.channelLoadingOrder, this.idLoadingEvent, (isLoading) => {
            if (this.state.isLoading !== isLoading) {
                this.setState({ isLoading })
            }
        })
    }
    componentWillUnmount() {
        this.unSubAll()
    }
    unSubAll = () => {
        this.idLoadingEvent && Emitter.deleteByIdEvent(this.idLoadingEvent)
    }
    renderPrice(tradePrice) {
        const { symbol, exchange } = this.props;

        return (
            <PriceValue
                exchange={exchange}
                symbol={symbol}
                resetFlag={symbol + exchange}
                style={{
                    fontFamily: CommonStyle.fontPoppinsMedium,
                    fontSize: CommonStyle.font21,
                    color: CommonStyle.fontWhite
                }}
                value={tradePrice}
            />
        );
    }
    render() {
        const { quote = {} } = this.props.data || {};
        const {
            trade_price: tradePrice,
            change_point: changePoint,
            change_percent: changePercent
        } = quote || {};
        return (
            <View style={[{ justifyContent: 'center' }, this.props.style || {}]}>
                {this.renderPrice(tradePrice)}
            </View>
        );
    }
}
const mapStateToProps = (state, { symbol, exchange }) => {
    const { detailLoading } = state.watchlist3;
    const { marketData } = state.streamMarket;
    const { newsToday = {} } = state.watchlist3;
    const isNewsToday = newsToday[symbol] || false;
    const data =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    return {
        isLoading: detailLoading,
        isConnected: state.app.isConnected,
        data
    };
};
export default connect(mapStateToProps)(FlashingWithRedux)
