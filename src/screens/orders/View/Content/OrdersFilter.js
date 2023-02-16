import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import OrdersFilterBuySell from '~s/orders/View/Content/OrdersFilterBuySell'
import OrdersFilterVolume from '~s/orders/View/Content/OrdersFilterVolume'
import OrdersFilterUpdated from '~s/orders/View/Content/OrdersFilterUpdated'
import OrdersFilterContingent from '~/screens/orders/View/Content/OrdersFilterContingent.js'
import CommonStyle from '~/theme/theme_controller'
import { useShadow } from '~/component/shadow/SvgShadowCustom'

const OrdersFilter = () => {
    const [Shadow, onLayout] = useShadow()
    return <View>
        <Shadow />
        <View
            onLayout={onLayout}
            style={{
                zIndex: 10,
                width: '100%',
                paddingVertical: 8,
                paddingHorizontal: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: CommonStyle.color.dark
            }}>
            <OrdersFilterBuySell />
            {/* <OrdersFilterContingent /> Tam thoi disabled tinh nang nay */}
            {/* <OrdersFilterVolume /> */}
            {/* <OrdersFilterUpdated /> */}
        </View>
    </View>
}

export default OrdersFilter
