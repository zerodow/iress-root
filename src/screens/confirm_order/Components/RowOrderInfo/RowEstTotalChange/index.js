import React from 'react'
import { View } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { getFromCurrency } from '~s/portfolio/Model/PortfolioAccountModel'
import EstTotalCharges from './EstTotalCharges'
import Fees from './Fees'
import CommissionTax from './CommissionTax'
const RowEstTotalCharges = ({ isLoading, dataFees }) => {
    const {
        estimated_commission: commission,
        estimated_tax: tax,
        total_charges: totalCharges,
        total_fee: fees,
        order_value: orderValueFees
    } = dataFees
    const fromCurrency = getFromCurrency()
    const isShow = (fees === 0 || fees === null) && (commission === 0 || commission === null) && (tax === 0 || tax === null)
    return (!isShow) ? (
        <View style={{
            borderBottomWidth: 1,
            borderColor: CommonStyle.color.dusk,
            marginLeft: 8,
            marginRight: 8,
            marginTop: 8
        }}>
            <EstTotalCharges toCurrency={fromCurrency} isLoading={isLoading} estTotalCharges={totalCharges} />
            {isLoading ? <View style={{ height: 2 }} /> : null}
            {commission ? <CommissionTax name={I18n.t('commission')} toCurrency={fromCurrency} isLoading={isLoading} value={commission} /> : null}
            {isLoading ? <View style={{ height: 2 }} /> : null}
            {fees ? <Fees toCurrency={fromCurrency} isLoading={isLoading} fees={fees} dataFees={dataFees} /> : null}
            {isLoading ? <View style={{ height: 2 }} /> : null}
            {tax ? <CommissionTax name={I18n.t('tax')} toCurrency={fromCurrency} isLoading={isLoading} value={tax} /> : null}
            {isLoading ? <View style={{ height: 2 }} /> : null}
        </View>
    ) : null
}
export default RowEstTotalCharges
