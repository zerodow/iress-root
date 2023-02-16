import React, { useState, useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { View, Text } from 'react-native'

import { changeBuySell, changeSymbolExchange } from '~/screens/new_order/Redux/actions.js'

import TradeButton from './TradeButtonSticky'
import I18n from '~/modules/language/'
import orderTypeEnum from '~/constants/order_type';
export const TYPE = {
    BUY: 'BUY',
    SELL: 'SELL',
    DISABLE: 'DISABLE'
}
function useOnChangeOrderType({ orderType, changeBuySell, setDisable }) {
    return useEffect(() => {
        switch (orderType) {
            case orderTypeEnum.LIMIT_ORDER:
                changeBuySell(true)
                setDisable(null)
                break;
            case orderTypeEnum.MARKETTOLIMIT_ORDER:
            case orderTypeEnum.MARKET_ORDER:
                changeBuySell(true)
                setDisable(null)
                break;
            case orderTypeEnum.STOPLIMIT_ORDER:
            case orderTypeEnum.STOPLOSS_ORDER:
                setDisable(TYPE.BUY)
                changeBuySell(false)
                break;
            default: break;
        }
    }, [orderType])
}
const useOnChangeBuySell = function ({ isBuy, changeBuySell }) {
    return useEffect(() => {
        if (isBuy) {
            changeBuySell(true)
        } else {
            changeBuySell(false)
        }
    }, [isBuy])
}
function BuySell({
    isBuy,
    orderType,
    changeBuySell,
    ...rest
}) {
    const [disabled, setDisable] = useState(null)
    useOnChangeOrderType({ orderType, changeBuySell, setDisable })
    useOnChangeBuySell({ isBuy, changeBuySell })
    const onClickBuy = useCallback(() => {
        changeBuySell && changeBuySell(true)
    }, [])
    const onClickSell = useCallback(() => {
        changeBuySell && changeBuySell(false)
    }, [])
    return (
        <View style={{
            flexDirection: 'row',
            paddingHorizontal: 8,
            paddingVertical: 16,
            flex: 1
        }}>
            <TradeButton
                onPress={onClickBuy}
                isActive={isBuy}
                isDisable={disabled === TYPE.BUY}
                type={TYPE.BUY}
                style={{ flex: 1 }}
                title={I18n.t('buyUpper')}
                {...rest}
            />
            <TradeButton
                isActive={!isBuy}
                onPress={onClickSell}
                type={TYPE.SELL}
                isDisable={disabled === TYPE.SELL}
                style={{ flex: 1, marginLeft: 8 }}
                title={I18n.t('sellUpper')}
                {...rest}
            />
        </View>
    )
}
function mapStateToProps(state) {
    return {
        isBuy: state.newOrder.isBuy,
        orderType: state.newOrder.orderType
    }
}
function mapActionToProps(dispatch) {
    return {
        changeBuySell: (isBuy) => dispatch(changeBuySell(isBuy))
    }
}
export default connect(mapStateToProps, mapActionToProps)(BuySell)
