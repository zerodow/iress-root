import React, { useState, useRef, useMemo, useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { connect, shallowEqual, useSelector } from 'react-redux'
import LastTrade from './LastTrade'
import ChangePercent from '~/component/change_percent/index.js'
import ChangePoints from '~/component/change_point/change_point.js'

import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'

import { setLastPrice } from '~/screens/new_order/Model/PriceModel.js'

import * as Business from '~/business'

import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux'
const SymbolWithPrice = ({
    children, style, symbol, exchange, ...rest
}) => {
    const data = useSelector(state => {
        const key = `${symbol}#${exchange}`
        const { data } = state.quotes || {}
        const dataByKey = data[key] || {}
        return dataByKey
    }, shallowEqual)
    const { trade_price: tradePrice, change_percent: changePercent, change_point: changePoint } = data;
    const { isLoadingErrorSystem } = useLoadingErrorSystem()
    let isLoading = useSelector(state => state.newOrder.isLoading) || isLoadingErrorSystem
    setLastPrice(tradePrice)
    const displayName = useMemo(() => {
        return Business.getDisplayName({
            symbol,
            exchange
        })
    }, [])
    useLayoutEffect(() => {
        return () => setLastPrice({
            lastPrice: 0,
            limitPrice: 0,
            tabTradingStategySelected: {}
        })
    }, [])
    return (
        <View>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeM,
                color: CommonStyle.fontColor,
                marginRight: 4
            }}>{(displayName === '' || !displayName) ? '--' : displayName}</Text>
            <ViewLoading isLoading={isLoading}>
                {isLoading && <Text style={[
                    {
                        fontFamily: CommonStyle.fontPoppinsMedium,
                        fontSize: CommonStyle.fontSizeXXL,
                        color: CommonStyle.fontWhite,
                        opacity: 0
                    }
                ]} >1234</Text>}
                {!isLoading && <LastTrade
                    exchange={exchange}
                    symbol={symbol}
                    {...{ value: tradePrice }}
                />}
            </ViewLoading>
            <View style={{
                height: 1
            }} />
            <View style={{
                flexDirection: 'row'
            }}>
                <ViewLoading isLoading={isLoading}>
                    <ChangePoints
                        exchange={exchange}
                        symbol={symbol}
                        value={changePoint} />
                </ViewLoading>
                <View style={{
                    width: 1
                }} />
                <ViewLoading isLoading={isLoading}>
                    <ChangePercent
                        value={changePercent}
                        colorFlagValue={changePoint}
                    />
                </ViewLoading>
            </View>
        </View>
    );
}

export default SymbolWithPrice
