import React, { } from 'react'
import {
    View,
    Text
} from 'react-native'
import TotalPortfolio from './TotalPortfolio'
import SummaryInfo from './SummaryInfo'
import CommonStyle from '~/theme/theme_controller'

const CFDSummary = ({ data, onLayout }) => {
    const { currency = '' } = data
    return <View
        onLayout={onLayout}
        style={{
            zIndex: 10,
            paddingHorizontal: 16,
            backgroundColor: CommonStyle.color.dark,
            paddingBottom: 8
        }}>
        <TotalPortfolio data={data} currency={currency} />
        <SummaryInfo data={data} currency={currency} />
    </View>
}

export default CFDSummary
