import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import Animated from 'react-native-reanimated'

import CommonStyle, { register } from '~/theme/theme_controller'

import BoxLoading from '~/component/BoxLoading/BoxLoading.js'
const { Value } = Animated
const mapStateToProps = (state, { symbol, exchange }) => {
    const { newOrderLoading } = state.watchlist3;
    const { marketData } = state.streamMarket;
    const { newsToday = {} } = state.watchlist3;
    const isNewsToday = newsToday[symbol] || false;
    const data =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    return {
        isLoading: newOrderLoading,
        isConnected: state.app.isConnected,
        data
    };
};
function getValueBidAskByKey({ quote = {}, key }) {
    return quote[key]
}

//
function BidPrice(props) {
    const { symbol, exchange, loadingValue, style } = props;
    const { quote = {} } = props.data || {};
    let value = getValueBidAskByKey({ quote, key: 'bid_price' })
    return <BoxLoading renderChildren={() => {
        return (
            <Text style={[style]}>
                {value || '--'}
            </Text>
        )
    }} animatedValue={loadingValue} extraData={[value]} />
    return (
        <Text style={[style]}>
            {value || '--'}
        </Text>
    )
}
export const BidPriceValue = connect(mapStateToProps)(BidPrice)
function BidSize(props) {
    const { symbol, exchange, loadingValue = new Value(0), style } = props;
    const { quote = {} } = props.data || {};
    let value = getValueBidAskByKey({ quote, key: 'bid_size' })
    return <BoxLoading style={{ alignSelf: 'flex-end' }} renderChildren={() => {
        return (
            <Text style={[style]}>
                {`@ ${value || '--'}`}
            </Text>
        )
    }} animatedValue={loadingValue} extraData={[value]} />
}
export const BidSizeValue = connect(mapStateToProps)(BidSize)
function AskPrice(props) {
    const { symbol, exchange, loadingValue, style } = props;
    const { quote = {} } = props.data || {};
    let value = getValueBidAskByKey({ quote, key: 'ask_price' })
    return <BoxLoading style={{ alignSelf: 'flex-start' }} renderChildren={() => {
        return (
            <Text style={[style]}>
                {value || '--'}
            </Text>
        )
    }} animatedValue={loadingValue} extraData={[value]} />
    return (
        <Text style={[style]}>
            {value || '--'}
        </Text>
    )
}
export const AskPriceValue = connect(mapStateToProps)(AskPrice)
function AskSize(props) {
    const { symbol, exchange, loadingValue, style } = props;
    const { quote = {} } = props.data || {};
    let value = getValueBidAskByKey({ quote, key: 'ask_size' })
    return <BoxLoading style={{ alignSelf: 'flex-start' }} renderChildren={() => {
        return (
            <Text style={[style]}>
                {`@ ${value || '--'}`}
            </Text>
        )
    }} animatedValue={loadingValue} extraData={[value]} />
    return (
        <Text style={[style]}>
            {`@ ${value || '--'}`}
        </Text>
    )
}
export const AskSizeValue = connect(mapStateToProps)(AskSize)
