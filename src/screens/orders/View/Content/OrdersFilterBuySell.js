import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { changeSideFilter } from '~s/orders/Model/OrdersModel'
import { sortAllCondition } from '~s/orders/Controller/OrdersController'
import { changeSideFilter as changeSideFilterRedux } from '~s/orders/Redux/actions'
import ENUM from '~/enum'
const { ORDERS_SDIE } = ENUM

const FilterBuy = ({ onChangeSideFilter, orderIsLoading }) => {
    const filter = useSelector(state => state.orders.buyFilter, shallowEqual)
    const dispatch = useDispatch()
    const onPress = useCallback(() => {
        const side = ORDERS_SDIE.BUY
        const status = !filter
        changeSideFilter({ side, status })
        dispatch(changeSideFilterRedux({ side, status }))
        onChangeSideFilter && onChangeSideFilter()
    }, [filter])
    const activeStyle = useMemo(() => {
        return filter
            ? {
                borderBottomColor: CommonStyle.color.btnReviewOrderBuy,
                borderRightColor: CommonStyle.color.btnReviewOrderBuy
            }
            : {
                borderBottomColor: CommonStyle.color.dark,
                borderRightColor: CommonStyle.color.dark
            }
    }, [filter])
    const activeWrapperStyle = useMemo(() => {
        return filter
            ? {
                borderBottomColor: CommonStyle.color.btnReviewOrderBuy,
                borderRightColor: CommonStyle.color.btnReviewOrderBuy
            }
            : {
                borderBottomColor: CommonStyle.color.dusk,
                borderRightColor: CommonStyle.color.dusk
            }
    }, [filter])
    const activeTextStyle = useMemo(() => {
        return filter
            ? {
                opacity: 1,
                color: CommonStyle.fontBlack
            }
            : {
                opacity: 0.7,
                color: CommonStyle.fontColor
            }
    }, [filter])
    return <TouchableOpacity
        onPress={onPress}
        disabled={orderIsLoading}
        style={[{ height: 24, width: 76, justifyContent: 'center', alignItems: 'center' }]}>
        <View
            style={[styles.trapeZoidLeft, styles.wrapperStyle, activeStyle]} />
        <View style={[{ position: 'absolute' }, styles.wrapperTrapeZoidLeft, activeWrapperStyle]} />
        <Text style={[{
            fontSize: CommonStyle.font13,
            fontFamily: CommonStyle.fontPoppinsRegular,
            zIndex: 999,
            position: 'absolute'
        }, activeTextStyle]}>
            {I18n.t('side_buy')}
        </Text>
    </TouchableOpacity>
}

const FilterSell = ({ onChangeSideFilter, orderIsLoading }) => {
    const filter = useSelector(state => state.orders.sellFilter, shallowEqual)
    const dispatch = useDispatch()
    const onPress = useCallback(() => {
        const side = ORDERS_SDIE.SELL
        const status = !filter
        changeSideFilter({ side, status })
        dispatch(changeSideFilterRedux({ side, status }))
        onChangeSideFilter && onChangeSideFilter()
    }, [filter])
    const activeStyle = useMemo(() => {
        return filter
            ? {
                borderBottomColor: CommonStyle.color.backSell,
                borderRightColor: CommonStyle.color.backSell
            }
            : {
                borderBottomColor: CommonStyle.color.dark,
                borderRightColor: CommonStyle.color.dark
            }
    }, [filter])
    const activeWrapperStyle = useMemo(() => {
        return filter
            ? {
                borderBottomColor: CommonStyle.color.backSell,
                borderRightColor: CommonStyle.color.backSell
            }
            : {
                borderBottomColor: CommonStyle.color.dusk,
                borderRightColor: CommonStyle.color.dusk
            }
    }, [filter])
    const activeTextStyle = useMemo(() => {
        return filter
            ? {
                opacity: 1,
                color: CommonStyle.fontBlack
            }
            : {
                opacity: 0.7,
                color: CommonStyle.fontColor
            }
    }, [filter])
    return <TouchableOpacity
        disabled={orderIsLoading}
        onPress={onPress}
        style={[{ height: 24, width: 76, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.trapeZoidRight, styles.wrapperStyle, activeStyle]} />
        <View style={[{ position: 'absolute' }, styles.wrapperTrapeZoidRight, activeWrapperStyle]} />
        <Text style={[{
            fontSize: CommonStyle.font13,
            fontFamily: CommonStyle.fontPoppinsRegular,
            zIndex: 999,
            position: 'absolute'
        }, activeTextStyle]}>
            {I18n.t('side_sell')}
        </Text>
    </TouchableOpacity>
}

const OrdersFilterBuySell = () => {
    const dic = useRef({
        timeout: null
    })
    const orderIsLoading = useSelector(state => state.orders.isLoading)
    const onChangeSideFilter = useCallback(() => {
        dic.current.timeout && clearTimeout(dic.current.timeout)
        dic.current.timeout = setTimeout(sortAllCondition, 300)
    }, [])
    const unmount = useCallback(() => {
        dic.current.timeout && clearTimeout(dic.current.timeout)
    }, [])
    useEffect(() => {
        return unmount
    }, [])
    return <View style={{ flexDirection: 'row' }}>
        <FilterBuy onChangeSideFilter={onChangeSideFilter} orderIsLoading={orderIsLoading} />
        <FilterSell onChangeSideFilter={onChangeSideFilter} orderIsLoading={orderIsLoading} />
    </View>
}

const styles = StyleSheet.create({
    wrapperStyle: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    trapeZoidLeft: {
        zIndex: 99,
        width: 73,
        height: 0,
        borderBottomWidth: 20,
        borderBottomColor: 'red',
        borderLeftWidth: 5,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'red',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        transform: [{ rotate: '180deg' }]
    },
    wrapperTrapeZoidLeft: {
        width: 76,
        height: 0,
        borderBottomWidth: 22,
        borderLeftWidth: 6,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        transform: [{ rotate: '180deg' }, { translateX: -0.5 }]
    },
    trapeZoidRight: {
        zIndex: 99,
        width: 73,
        height: 0,
        borderBottomWidth: 20,
        borderBottomColor: 'red',
        borderLeftWidth: 5,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'red',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        left: -2
    },
    wrapperTrapeZoidRight: {
        width: 76,
        height: 0,
        borderBottomWidth: 22,
        borderLeftWidth: 6,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        left: -2
    }
})

export default OrdersFilterBuySell
