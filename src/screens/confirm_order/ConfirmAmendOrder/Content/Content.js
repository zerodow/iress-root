import React, { useState, useRef, useLayoutEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Account from '../Component/RowOrderInfo/RowAccount'
import Outstanding from '../Component/RowOrderInfo/RowOutstanding';
import OrderValue from '../Component/RowOrderInfo/RowOrderValue'
import RowEstTotalCharges from '~s/confirm_order/Components/RowOrderInfo/RowEstTotalChange/index'
import RowEstNetValue from '../Component/RowOrderInfo/RowEstNetValue'
import { connect } from 'react-redux'

import { getObjectOrderPlaceFees } from '~/screens/new_order/Controller/ContentController.js'
import { getFees } from '~/screens/confirm_order/Controllers/ContentController.js'
import { getOrderDetail } from '~/screens/new_order/Model/OrderEntryModel.js'

const useGetFees = ({ newOrder, setdataFees, dic }) => {
    return useLayoutEffect(() => {
        const objectData = getObjectOrderPlaceFees(newOrder)
        delete objectData['duration']
        // delete objectData['side']
        getFees({ orderObj: objectData }).then((res) => {
            dic.current.isLoading = false
            setdataFees(res)
            console.log('GET DATA FEES FROM AMEND', res)
        }).catch(e => {
            dic.current.isLoading = false
            setdataFees({})
        })
    }, [])
}
const Content = React.memo(({ newOrder, symbol, exchange, isBuy }) => {
    const data = getOrderDetail()
    const [dataFees, setdataFees] = useState({})
    const dic = useRef({
        isLoading: true
    })
    useGetFees({ newOrder, setdataFees, dic })
    return (
        < View >
            <Account {...{ symbol, exchange }} isShow={true} />
            <Outstanding data={data} />
            <OrderValue dataFees={dataFees} />
            <RowEstTotalCharges isLoading={dic.current.isLoading} dataFees={dataFees} />
            <RowEstNetValue isLoading={dic.current.isLoading} dataFees={dataFees} />
        </View >
    )
})
function mapStateToProps(state) {
    return {
        newOrder: state.newOrder,
        isBuy: state.newOrder.isBuy,
        orderType: state.newOrder.orderType,
        limitPrice: state.newOrder.limitPrice,
        triggerPrice: state.newOrder.triggerPrice,
        duration: state.newOrder.duration,
        destination: state.newOrder.destination,
        quantity: state.newOrder.quantity,
        symbol: state.newOrder.symbol,
        exchange: state.newOrder.exchange,
        expiryTime: state.newOrder.expiryTime
    }
}
export default connect(mapStateToProps)(Content)

const styles = StyleSheet.create({})
