import React, { useEffect, useRef } from 'react'
import { View, Text } from 'react-native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import { changeLimitPriceSL, changeLimitPriceTP } from '~/screens/new_order/Redux/actions.js'

const HandleFillDefaultLimitPriceFixedCo = React.memo(({ symbol, exchange }) => {
    const dic = useRef({ init: true })
    const dispatch = useDispatch()
    let { ask_price: askPrice, ask_size: askSize, bid_price: bidPrice, bid_size: bidSize, isBuy } = useSelector(state => {
        const key = `${symbol}#${exchange}`
        const { data } = state.quotes || {}
        const quote = data[key] || {}
        return {
            ask_price: quote.ask_price,
            bid_price: quote.bid_price,
            isBuy: state.newOrder.isBuy
        }
    }, shallowEqual)
    dic.current.bidPrice = bidPrice
    dic.current.askPrice = askPrice
    useEffect(() => {
        if (askPrice && dic.current.init && isBuy) {
            dispatch(changeLimitPriceSL(askPrice))
            dispatch(changeLimitPriceTP(askPrice))
            dic.current.init = false
        }
        if (bidPrice && dic.current.init && !isBuy) {
            dispatch(changeLimitPriceSL(bidPrice))
            dispatch(changeLimitPriceTP(bidPrice))
            dic.current.init = false
        }
    }, [askPrice, bidPrice])
    useEffect(() => {
        if (dic.current.askPrice && !dic.current.init && isBuy) {
            dispatch(changeLimitPriceSL(dic.current.askPrice))
            dispatch(changeLimitPriceTP(dic.current.askPrice))
        }
        if (dic.current.bidPrice && !dic.current.init && !isBuy) {
            dispatch(changeLimitPriceSL(dic.current.bidPrice))
            dispatch(changeLimitPriceTP(dic.current.bidPrice))
        }
    }, [isBuy])
    return null
}, (pre, next) => pre.symbol === next.symbol && pre.exchange === next.exchange)
export default HandleFillDefaultLimitPriceFixedCo
