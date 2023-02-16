import React, { } from 'react'
import {
    View,
    Text
} from 'react-native'
import TotalPortfolio from './TotalPortfolio'
import SummaryInfo from './SummaryInfo'
import CommonStyle from '~/theme/theme_controller'

const EquitySummary = props => {
    return <View
        onLayout={props.onLayout}
        style={{
            zIndex: 10,
            paddingHorizontal: 16,
            backgroundColor: CommonStyle.color.dark,
            paddingBottom: 8
        }}>
        <TotalPortfolio {...props} />
        <SummaryInfo {...props} />
    </View>
}

export default EquitySummary
