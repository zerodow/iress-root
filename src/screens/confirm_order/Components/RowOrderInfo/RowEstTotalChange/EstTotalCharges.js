import React from 'react'
import { Text, View } from 'react-native'
import {
    formatNumberNew2
} from '~/lib/base/functionUtil';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import I18n from '~/modules/language/'
import { styles } from './style'
import Enum from '~/enum'
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController'
const EstTotalCharges = ({ estTotalCharges, isLoading, toCurrency }) => {
    return (
        <View style={styles.orderStyle}>
            <Text style={styles.txtOrderStyleTitle}>{I18n.t('est_total_charges') + ` (${toCurrency})`}</Text>
            <TextLoading numberOfLines={2} containerStyle={{
                alignSelf: 'flex-end'
            }} wrapperStyle={{ flex: 1 }} isLoading={isLoading} style={[styles.txtOrderStyleTitle]}>
                {formatNumberNew2(convertedCurrentcyFormat(estTotalCharges), Enum.PRICE_DECIMAL.VALUE)}
            </TextLoading >
        </View >
    )
}

export default EstTotalCharges
