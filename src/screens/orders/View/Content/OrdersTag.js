import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
    View, Text
} from 'react-native'
import TabView from '~/component/tabview4/'
import CommonStyle from '~/theme/theme_controller'
import { useShadow } from '~/component/shadow/SvgShadow';
import { setOrderTag } from '~s/orders/Model/OrdersModel'
import { getOrders } from '~s/orders/Controller/OrdersController'
import { useDispatch } from 'react-redux'
import { changeLoadingState } from '~s/orders/Redux/actions'
import { changeAnimationType } from '~/component/loading_component/Redux/actions'
import { resetOrderId } from '~s/confirm_order/Model/confirmOrderModel'

const TABS = [
    {
        label: 'activeLowerCase'
    },
    {
        label: 'executedLowerCase'
    },
    {
        label: 'inActiveLowerCase'
    }
]

const OrdersTag = () => {
    const [Shadow, onLayout] = useShadow()
    const [activeTab, setActiveTab] = useState(0)
    const dispatch = useDispatch()
    const dic = useRef({
        timeout: null,
        timeoutAnimationType: null
    })
    const onChangeTabTabView = useCallback((activeTab) => {
        setOrderTag(activeTab)
        setActiveTab(activeTab)
        resetOrderId()
        dic.current.timeoutAnimationType && clearTimeout(dic.current.timeoutAnimationType)
        dic.current.timeoutAnimationType = setTimeout(() => {
            dispatch(changeAnimationType()) // Change animation type loading
            dispatch(changeLoadingState(true))
        }, 200)
        dic.current.timeout && clearTimeout(dic.current.timeout)
        dic.current.timeout = setTimeout(() => {
            const isSortAllCondition = true
            getOrders({ isSortAllCondition })
        }, 500)
    }, [])
    unMount = useCallback(() => {
        dic.current.timeout && clearTimeout(dic.current.timeout)
        dic.current.timeoutAnimationType && clearTimeout(dic.current.timeoutAnimationType)
    }, [])
    useEffect(() => {
        return unMount
    }, [])
    return <View style={{ backgroundColor: CommonStyle.color.dark, paddingBottom: 5 }}>
        <View>
            <Shadow />
            <View onLayout={onLayout} style={{ zIndex: 10 }}>
                <TabView
                    tabs={TABS}
                    activeTab={activeTab}
                    onChangeTab={onChangeTabTabView}
                    wrapperStyle={{
                        backgroundColor: CommonStyle.color.dark,
                        justifyContent: 'space-around',
                        zIndex: 9
                    }}
                />
            </View>
        </View>
    </View>
}

export default OrdersTag
