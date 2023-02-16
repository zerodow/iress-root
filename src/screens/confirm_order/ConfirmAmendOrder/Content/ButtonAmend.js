import React, { useEffect, useState, useCallback, useMemo, useContext, Component } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Shadow from '~/component/shadow';
import { connect, useDispatch } from 'react-redux'
import Keyboard, { ButtomConfirm } from '~/component/virtual_keyboard/Keyboard.js'
import { getChangeShowErrorFailed, getChangeShowErrorSuccess, getChannelChangeOrderError } from '~/streaming/channel'
import * as ConfirmOrderController from '~/screens/confirm_order/Controllers/ConfirmOrderController.js'
import { getObjectAmendOrder } from '~/screens/new_order/Controller/ContentController.js'
import { changeLoadingButtonConfirm } from '~/screens/confirm_order/Redux/actions.js'
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js'
import Enum from '~/enum'
import * as Emitter from '@lib/vietnam-emitter';
import * as Business from '~/business'
import { Navigation } from 'react-native-navigation'
import { getOrderDetail, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import { syncNewestOrdersData } from '~s/orders/Controller/OrdersController'
import { showErrorHandlingOrder } from '~/screens/confirm_order/Controllers/SwitchController';
import { showOrders } from '~/navigation/controller.1';
import { dataStorage, func } from '~/storage';
import { setOrderId } from '~s/confirm_order/Model/confirmOrderModel'

const { TYPE_MESSAGE, STATUS_ORD, ACTION_ORD, AMEND_TYPE } = Enum
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const useGetTitleButton = ({ isBuy }) => {
    return useMemo(() => {
        const buttonType = getType()
        if (buttonType === AMEND_TYPE.AMEND_ORIGINAL) {
            if (isBuy) return 'Amend Buy Order'
            return 'Amend Sell Order'
            // isBuy ? setButtonTitle('Amend Buy Order') : setButtonTitle('Amend Buy Order')
        }
        if (buttonType === AMEND_TYPE.AMEND_TRADING_PROFITLOSS) {
            return 'Amend Profit'
        }
        if (buttonType === AMEND_TYPE.AMEND_TRADING_STRATEGIES) {
            return 'Amend Order'
        }
        if (buttonType === AMEND_TYPE.AMEND_TRADING_STOPPRICE) {
            return 'Amend Stop Loss'
        }
    }, [isBuy])
}
const ButtonAmend = ({ newOrder, changeLoadingConfirmPlaceOrder, isLoading, isConnected, isBuy, forwardContext }) => {
    const title = useGetTitleButton({ isBuy })
    const dispatch = useDispatch()
    const cbError = useCallback(({ error }) => {
        const channel = getChangeShowErrorFailed()
        changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(false)
        Emitter.emit(channel, {
            msg: error,
            autoHide: true,
            type: TYPE_MESSAGE.ERROR
        })
        // showErrorHandlingOrder({ newOrder, error, breachAction, errorCode, navigator })
    }, [])
    const cbSuccess = useCallback(({ error }) => {
        const channel = getChangeShowErrorSuccess()
        Emitter.emit(channel, {
            msg: error,
            autoHide: false,
            type: TYPE_MESSAGE.WARNING
        })
        setTimeout(() => {
            Navigation.dismissAllModals();
            changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(false)
            dispatch(resetStateNewOrder())
        }, 2000);
    }, [])
    const onConfirm = useCallback((params) => {
        const data = getOrderDetail()
        const objectOrder = getObjectAmendOrder({ data, newOrder })
        const channel = getChannelChangeOrderError()
        const objNotify = Business.getOrdConfirm(STATUS_ORD.PROCESS, ACTION_ORD.MODIFY)
        Emitter.emit(channel, {
            msg: objNotify.txt,
            autoHide: true,
            type: TYPE_MESSAGE.WARNING
        })
        changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(true)
        ConfirmOrderController.amendOrder({
            objectOrder,
            cbError,
            cbSuccess
        })
    }, [newOrder])

    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: CommonStyle.backgroundColor
        }}>
            <Shadow setting={{
                width: widthDevices,
                height: 0,
                color: CommonStyle.color.shadow,
                border: 5,
                radius: 0,
                opacity: 0.5,
                x: 0,
                y: 0,
                style: {
                    zIndex: 9,
                    position: 'absolute',
                    backgroundColor: CommonStyle.backgroundColor,
                    top: 0,
                    left: 0,
                    right: 0
                }
            }} />
            <View style={{ backgroundColor: CommonStyle.backgroundColor, width: '100%', zIndex: 999 }}>
                <ButtomConfirm txtStyle={{ fontSize: CommonStyle.font15 }} styleWrapper={[{
                    marginHorizontal: 24,
                    marginVertical: 8,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    paddingTop: 14,
                    paddingBottom: 14
                }, {}]} isBuy={isBuy} {...{ titleButton: title, isConnected: isConnected, newOrder: {}, onConfirm: onConfirm, isLoading }} />
            </View>
        </View>
    )
}
function mapStateToProps(state) {
    return {
        isBuy: state.newOrder.isBuy,
        orderType: state.newOrder.orderType,
        limitPrice: state.newOrder.limitPrice,
        triggerPrice: state.newOrder.triggerPrice,
        duration: state.newOrder.duration, // GTD
        destination: state.newOrder.destination,
        quantity: state.newOrder.quantity,
        symbol: state.newOrder.symbol,
        exchange: state.newOrder.exchange,
        expiryTime: state.newOrder.expiryTime,
        newOrder: state.newOrder,
        isLoading: state.confirmPlaceOrder.isLoadingButtonConfirm,
        isConnected: state.app.isConnected
    }
}
function mapActionToProps(dispatch) {
    return { changeLoadingConfirmPlaceOrder: p => dispatch(changeLoadingButtonConfirm(p)) }
}
export default connect(mapStateToProps, mapActionToProps)(ButtonAmend)

const styles = StyleSheet.create({})
