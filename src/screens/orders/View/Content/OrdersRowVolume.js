import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import ENUM from '~/enum'

const { PRICE_DECIMAL } = ENUM
const SIDE = {
    BUY: 'buy',
    SELL: 'sell'
}
const FilledQuantity = ({ side, filledQuantity }) => {
    return <Text style={{
        fontFamily: CommonStyle.fontPoppinsRegular,
        color: side === SIDE.BUY
            ? CommonStyle.color.buy
            : CommonStyle.color.sell,
        fontSize: CommonStyle.font11
    }}>
        {formatNumberNew2(filledQuantity, PRICE_DECIMAL.VOLUME)}
    </Text>
}

const TotalQuantity = ({ totalQuantity }) => {
    return <Text style={{
        fontFamily: CommonStyle.fontPoppinsRegular,
        color: CommonStyle.fontColor,
        fontSize: CommonStyle.font11
    }}>
        {formatNumberNew2(totalQuantity, PRICE_DECIMAL.VOLUME)}
    </Text>
}

const OrdersRowVolume = ({ side, filledQuantity, totalQuantity }) => {
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
            {`${I18n.t('volume')}:`}
        </Text>
        <FilledQuantity side={side} filledQuantity={filledQuantity} />
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font11
        }}>
            {` / `}
        </Text>
        <TotalQuantity side={side} totalQuantity={totalQuantity} />
    </View>
}

export default OrdersRowVolume
