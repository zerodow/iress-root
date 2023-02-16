import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import { usePortfolioSummary } from '../../Hook/'
import EquitySummary from './EquitySummary'
import CFDSummary from './CFDSummary'
import { getAccActive, getPorfolioTypeByCode } from '~s/portfolio/Model/PortfolioAccountModel'
import { useShadow } from '~/component/shadow/SvgShadowCustom'
import CommonStyle from '~/theme/theme_controller'

const PortfolioSummary = props => {
    const shadowPosition = 2
    const [Shadow, onLayout] = useShadow(shadowPosition)
    const accActive = getAccActive()
    const portfolioType = getPorfolioTypeByCode(accActive)
    const [Summary] = usePortfolioSummary(EquitySummary, CFDSummary)
    return <View style={{ paddingVertical: 8, backgroundColor: CommonStyle.color.dark }}>
        <View>
            <Shadow />
            <Summary {...props} portfolioType={portfolioType} onLayout={onLayout} />
        </View>
    </View>
}

export default PortfolioSummary
