import React, { useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import { changeStatusButtonConfirm } from '~/screens/new_order/Redux/actions.js'
const HandleDisabledButtonConfirm = () => {
    const dic = useRef({ init: true })
    const dispatch = useDispatch()
    const params = useSelector(state => {
        return {
            limitPrice: state.newOrder.limitPrice,
            stopPrice: state.newOrder.stopPrice,
            takeProfitLoss: state.newOrder.takeProfitLoss,
            quantity: state.newOrder.quantity,
            orderValue: state.newOrder.orderValue,
            orderType: state.newOrder.orderType.key,
            // duration: state.newOrder.duration.key,
            expiryTime: state.newOrder.expiryTime
        }
    }, shallowEqual)
    useMemo(() => {
        if (dic.current.init) {
            dic.current.init = false
        } else {
            dispatch(changeStatusButtonConfirm(false))
        }
    }, [params])
    return null
}
HandleDisabledButtonConfirm.propTypes = {}
HandleDisabledButtonConfirm.defaultProps = {}
const styles = StyleSheet.create({})
export default HandleDisabledButtonConfirm
