import React, { } from 'react'
import {
    View,
    Text
} from 'react-native'
import { useSelector } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import ENUM from '~/enum'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import Currency from '~/component/currency'

const { PRICE_DECIMAL } = ENUM
const ValueFormat = ({
    value,
    decimal = PRICE_DECIMAL.IRESS_PRICE,
    textStyle,
    currencyCode,
    currencyStyle,
    hasPrefix = true,
    hasCurrency = true,
    ignorePositiveNumber = false,
    isLoading,
    forceColor = null,
    isShowCommand = true
}) => {
    let prefix = ''
    let text = ''
    let color = CommonStyle.fontColor
    const defaultValueLoading = '123.456'
    const loadingInternal = isLoading === undefined || isLoading === null
        ? useSelector(state => state.portfolio.isLoading)
        : isLoading
    const currency = '$'
    if (value === null || value === undefined) {
        text = '--'
        return <TextLoading
            isLoading={loadingInternal}>
            <Text style={[{ color }, textStyle]}>
                {loadingInternal ? defaultValueLoading : text}
            </Text>
        </TextLoading>
    }
    if (value === 0) {
        text = decimal === PRICE_DECIMAL.IRESS_PRICE || decimal === PRICE_DECIMAL.VOLUME
            ? '0'
            : `0.${'0'.repeat(decimal)}`
    }
    if (value > 0) {
        color = forceColor || CommonStyle.color.buy
        prefix = !ignorePositiveNumber && hasPrefix ? '+ ' : ''
        text = `${formatNumberNew2(value, decimal, null, isShowCommand)}`
    }
    if (value < 0) {
        color = forceColor || CommonStyle.color.sell
        prefix = hasPrefix ? '- ' : ''
        text = `${formatNumberNew2(Math.abs(value), decimal, null, isShowCommand)}`
    }
    return <TextLoading
        isLoading={loadingInternal}>
        <Text style={[{ flexDirection: 'row', color }, textStyle]}>
            <Text>
                {prefix}
            </Text>
            {
                hasCurrency
                    ? <Currency currencyCode={currencyCode} style={{ fontSize: CommonStyle.font11, ...currencyStyle }} />
                    : null
            }
            <Text>
                {loadingInternal ? defaultValueLoading : text}
            </Text>
        </Text>
    </TextLoading>
}

export default ValueFormat
