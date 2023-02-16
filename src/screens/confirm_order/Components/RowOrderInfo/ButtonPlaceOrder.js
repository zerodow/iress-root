import React, { useEffect, useState, useCallback, useMemo, useContext, Component } from 'react'
import Animated, { Easing } from 'react-native-reanimated'
import { connect, useDispatch } from 'react-redux'
import * as Emitter from '@lib/vietnam-emitter';
import { View, Text, Dimensions } from 'react-native'
import PropTypes from 'prop-types'
import { getAccActive, getPorfolioTypeByCode, getDicPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import CommonStyle from '~/theme/theme_controller'
import Shadow from '~/component/shadow';
import { setCode, getCode } from '~/component/error_system/Model/ErrorModel.js'
import * as Controller from '~/memory/controller';
import Keyboard, { ButtomConfirm } from '~/component/virtual_keyboard/Keyboard.js'

import { getChannelShowConfirmPlaceButton, getChannelHideConfirmPlaceButton, getChannelChangeOrderError, getChannelHideOrderError } from '~/streaming/channel'
import * as PlaceOrderController from '~/screens/confirm_order/Controllers/PlaceController.js'
import { getObjectOrderPlace } from '~/screens/new_order/Controller/ContentController.js'
import { changeLoadingButtonConfirm } from '~/screens/confirm_order/Redux/actions.js'
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js'
import Enum from '~/enum'
import * as Business from '~/business'
import * as api from '~/api';
import { Navigation } from 'react-native-navigation'
import { showErrorHandlingOrder } from '~/screens/confirm_order/Controllers/SwitchController';
import { showOrders } from '~/navigation/controller.1';
import { dataStorage, func } from '~/storage';
import { setOrderId } from '~s/confirm_order/Model/confirmOrderModel'

const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const { TYPE_MESSAGE, STATUS_ORD, ACTION_ORD } = Enum

const ButtonPlaceBuyOrder = ({ newOrder, changeLoadingConfirmPlaceOrder, isLoading, isConnected, isBuy, forwardContext, navigator }) => {
    // const translateY = useMemo(() => {
    //     return new Animated.Value(heightDevices * 2)
    // }, [])
    const dispatch = useDispatch()
    const cbError = useCallback(({ error, breachAction, errorCode }) => {
        const channel = getChannelChangeOrderError()
        changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(false)
        Emitter.emit(channel, {
            msg: error,
            autoHide: true,
            type: TYPE_MESSAGE.ERROR
        })
        if (breachAction) {
            showErrorHandlingOrder({ newOrder, error, breachAction, errorCode, navigator })
        }
    }, [])
    const cbSuccess = ({ error, orderId }) => {
        const channel = getChannelChangeOrderError()
        setOrderId({ orderId })
        Emitter.emit(channel, {
            msg: error,
            autoHide: false,
            type: TYPE_MESSAGE.SUCCESS
        })
        setTimeout(() => {
            Controller.setStatusModalCurrent(false);
            showOrders({ navigator })
            Navigation.dismissModal();
            dispatch(resetStateNewOrder())
            changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(false)
            dataStorage.refBottomTabBar && dataStorage.refBottomTabBar.changeTabActive(4)
        }, 2000);
    }
    const onConfirm = useCallback((params) => {
        const objectOrder = getObjectOrderPlace(newOrder)
        const channel = getChannelChangeOrderError()
        const objNotify = Business.getOrdConfirm(STATUS_ORD.PROCESS, ACTION_ORD.PLACE)
        Emitter.emit(channel, {
            msg: objNotify.txt,
            autoHide: false,
            type: TYPE_MESSAGE.WARNING
        })
        changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(true)
        PlaceOrderController.placeOrder({
            objectOrder,
            cbError,
            cbSuccess
        })
    }, [newOrder])

    return (
        <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: CommonStyle.backgroundColor
        }}>
            <ButtomConfirm
                txtStyle={{ fontSize: CommonStyle.font15 }}
                styleWrapper={[{
                    marginHorizontal: 24,
                    marginVertical: 8,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    paddingTop: 14,
                    paddingBottom: 14
                }, {}]}
                isBuy={isBuy}
                {...{ titleButton: isBuy ? 'Place Order' : 'Place Order', isConnected: isConnected, newOrder: {}, onConfirm: onConfirm, isLoading }} />
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
        date: state.newOrder.expiryTime,
        newOrder: state.newOrder,
        isLoading: state.confirmPlaceOrder.isLoadingButtonConfirm,
        isConnected: state.app.isConnected,
		ctTriggerPrice: state.newOrder.ctTriggerPrice
    }
}
function mapActionToProps(dispatch) {
    return { changeLoadingConfirmPlaceOrder: p => dispatch(changeLoadingButtonConfirm(p)) }
}
export default connect(mapStateToProps, mapActionToProps)(ButtonPlaceBuyOrder)
