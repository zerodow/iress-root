import React, { useState, useRef, useEffect } from 'react'
import { Text, View } from 'react-native'
import {
    formatNumberNew2
} from '~/lib/base/functionUtil';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import I18n from '~/modules/language/'
import { styles } from './style'
import Enum from '~/enum'
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController'
const CommissionTax = ({ name, isLoading, toCurrency, value }) => {
    return (
        <React.Fragment key={name}>
            <View style={styles.orderStyle}>
                <Text style={styles.txtOrderStyle}>{name + ` (${toCurrency})`}</Text>
                <TextLoading isLoading={isLoading} style={[styles.txtOrderStyle]}>{formatNumberNew2(convertedCurrentcyFormat(value), Enum.PRICE_DECIMAL.VALUE)}</TextLoading>
            </View>
        </React.Fragment>
    )
}
export default CommissionTax
