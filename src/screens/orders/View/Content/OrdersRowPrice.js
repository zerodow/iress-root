import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import ENUM from '~/enum'
const { PRICE_DECIMAL } = ENUM

const LimitPrice = ({ limitPrice }) => {
    return <Text style={{
        fontFamily: CommonStyle.fontPoppinsRegular,
        color: CommonStyle.fontColor,
        fontSize: CommonStyle.font11
    }}>
        {formatNumberNew2(limitPrice, PRICE_DECIMAL.IRESS_PRICE)}
    </Text>
}

const OrdersRowPrice = ({ limitPrice }) => {
    return <View style={{
        flexDirection: 'row',
        alignItems: 'center'
    }}>
        <Text style={{
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontTiny,
            opacity: 0.5,
            marginRight: 4
        }}>
            {`${I18n.t('price')}:`}
        </Text>
        <LimitPrice limitPrice={limitPrice} />
    </View>
}

export default OrdersRowPrice
