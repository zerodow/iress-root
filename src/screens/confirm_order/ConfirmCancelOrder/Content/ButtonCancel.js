import React, { useEffect, useState, useCallback, useMemo, useContext, Component } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Shadow from '~/component/shadow';
import { connect, useDispatch } from 'react-redux'
import Keyboard, { ButtomConfirm } from '~/component/virtual_keyboard/Keyboard.js'
import { getChangeShowErrorFailed, getChangeShowErrorSuccess, getChannelChangeOrderError } from '~/streaming/channel'
import { getOrderDetail, getIsBuy } from '~/screens/confirm_order/ConfirmCancelOrder/Model/CancelModel'
import * as CancelOrderController from '~/screens/confirm_order/Controllers/CancelOrderControll.js'
import { changeLoadingButtonConfirm } from '~/screens/confirm_order/Redux/actions.js'
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js'
import Enum from '~/enum'
import * as Emitter from '@lib/vietnam-emitter';
import * as Business from '~/business'
import { Navigation } from 'react-native-navigation'
import { dataStorage } from '~/storage';

const { TYPE_MESSAGE, STATUS_ORD, ACTION_ORD } = Enum
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')

const ButtonCancel = ({ cbCancelSuccess, changeLoadingConfirmPlaceOrder, isLoading, isConnected, forwardContext }) => {
    const { data, isBuy } = useMemo(() => {
        const tmpData = getOrderDetail()
        return {
            data: tmpData,
            isBuy: getIsBuy()
        }
    }, [])

    const dispatch = useDispatch()
    const cbError = useCallback(({ error }) => {
        console.info('CANCEL ORDER ERROR', error)
        const channel = getChangeShowErrorFailed()
        changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(false)
        Emitter.emit(channel, {
            msg: error,
            autoHide: true,
            type: TYPE_MESSAGE.ERROR
        })
    }, [])
    const cbSuccess = useCallback(({ error }) => {
        // // Sync newest orders data
        // syncNewestOrdersData()
        cbCancelSuccess && cbCancelSuccess()
        const channel = getChangeShowErrorSuccess()
        Emitter.emit(channel, {
            msg: error,
            autoHide: false,
            type: TYPE_MESSAGE.WARNING
        })
        setTimeout(() => {
            changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(false)
            dispatch(resetStateNewOrder())
            Navigation.dismissAllModals();
        }, 2000);
    }, [])
    const onConfirm = useCallback((params) => {
        const channel = getChannelChangeOrderError()
        dataStorage.isShowError = false
        const objNotify = Business.getOrdConfirm(STATUS_ORD.PROCESS, ACTION_ORD.CANCEL)
        Emitter.emit(channel, {
            msg: objNotify.txt,
            autoHide: false,
            type: TYPE_MESSAGE.WARNING
        })
        changeLoadingConfirmPlaceOrder && changeLoadingConfirmPlaceOrder(true)
        CancelOrderController.cancelOrder({
            cbError,
            cbSuccess
        })
    }, [])

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
                    paddingBottom: 14,
                    backgroundColor: CommonStyle.color.sell
                }, {}]} isBuy={false} {...{ titleButton: isBuy ? 'Cancel Order' : 'Cancel Order', isConnected: isConnected, newOrder: {}, onConfirm: onConfirm, isLoading }} />
            </View>
        </View>
    )
}
function mapStateToProps(state) {
    return {
        isLoading: state.confirmPlaceOrder.isLoadingButtonConfirm,
        isConnected: state.app.isConnected
    }
}
function mapActionToProps(dispatch) {
    return { changeLoadingConfirmPlaceOrder: p => dispatch(changeLoadingButtonConfirm(p)) }
}
export default connect(mapStateToProps, mapActionToProps)(ButtonCancel)

const styles = StyleSheet.create({})
