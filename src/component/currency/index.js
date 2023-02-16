import React, { } from 'react'
import {
    Text
} from 'react-native'
import { getCurrencyByCode } from '~/component/currency/Controller'
import CommonStyle from '~/theme/theme_controller'
import * as Business from '~/business'

export const CurrencyText = ({ symbol, exchange, style }) => {
    const currency = Business.getCurrencyBySymbolExchange({ symbol, exchange })
    const defaultStyle = {
        fontFamily: CommonStyle.fontPoppinsRegular,
        opacity: 0.7,
        fontSize: CommonStyle.font11,
        color: CommonStyle.color.modify
    }
    return <Text style={[defaultStyle, style]}>
        {currency}
    </Text>
}

const Currency = ({ currencyCode, style }) => {
    const currency = getCurrencyByCode({ currencyCode })
    // const currency = '$'
    return <Text style={[style]}>
        {currency}
    </Text>
}

export default Currency
