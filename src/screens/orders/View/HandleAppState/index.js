import React, { useCallback, useLayoutEffect } from 'react'
import {
    View, Text
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useAppState } from '~s/watchlist/TradeList/tradelist.hook';
import { getOrders } from '~s/orders/Controller/OrdersController'
import { changeLoadingState } from '~s/orders/Redux/actions'
import { changeAnimationType } from '~/component/loading_component/Redux/actions'
import ENUM from '~/enum'
import * as ManageAppState from '~/manage/manageAppState';
import ScreenId from '~/constants/screen_id';

const { ANIMATION_TYPE } = ENUM
const HandleAppState = () => {
    const dispatch = useDispatch()
    const ignoreCheckTokenExpire = true
    const activeCallback = useCallback(() => {
        dispatch(changeAnimationType(ANIMATION_TYPE.FADE_IN_SPECIAL)) // Change animation type loading
        dispatch(changeLoadingState(true))
        setTimeout(() => {
            const isSortAllCondition = true
            getOrders({ isSortAllCondition })
        }, 200)
    }, [])
    const inactiveCallback = useCallback(() => {

    }, [])
    useLayoutEffect(() => {
        ManageAppState.registerAppStateChangeHandle(ScreenId.ORDERS, activeCallback)
        return () => {
            ManageAppState.unRegisterAppState(ScreenId.ORDERS)
        }
    }, [])
    useAppState(activeCallback, inactiveCallback, ignoreCheckTokenExpire);
    return null
}

export default HandleAppState
