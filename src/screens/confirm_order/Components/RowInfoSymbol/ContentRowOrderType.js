import React from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import * as OrdersContentController from '~/screens/confirm_order/Controllers/ContentController.js'

const ContentRowOrderType = props => {
    const { value: orderType, title } = props
    const orderTypeString = OrdersContentController.getOrderTypeString(orderType)
    return <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }} >
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontNearLight6
            }}>
                {title}
            </Text>
        </View >
        <View style={{ width: 8 }} />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
                paddingVertical: 2,
                paddingHorizontal: 5,
                marginRight: 4,
                borderRadius: 4,
                backgroundColor: CommonStyle.color.modify
            }
            }>
                <Text style={{
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.font13,
                    color: CommonStyle.color.dark
                }}>
                    {orderTypeString}
                </Text>
            </View >
        </View>
    </View>
}

export default ContentRowOrderType
