import React, { useEffect, useState } from 'react'
import {
    View, Text, LayoutAnimation, UIManager, Platform
} from 'react-native'
import { getAccActive, getPorfolioTypeByCode } from '~s/portfolio/Model/PortfolioAccountModel'
import { useSelector } from 'react-redux'
import ENUM from '~/enum'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import PortfolioDetailSymbol from './PortfolioDetailSymbol'
import PortfolioDetailTitle from './PortfolioDetailTitle'
import PortfolioDetailSummary from './PortfolioDetailSummary'
import PortfolioHoldingWeight from './PortfolioHoldingWeight'
import NetworkWarning from '~/component/network_warning/network_warning_layout_animation'
const { PORTFOLIO_TYPE } = ENUM
const PortfolioDetail = ({
    updateActiveStatus,
    symbol,
    exchange,
    data,
    navigator,
    onClose,
    showAddToWl
}) => {
    const accActive = getAccActive()
    const portfolioType = getPorfolioTypeByCode(accActive)
    return <View style={{
        width: '100%'
    }}>
        <NetworkWarning navigator={navigator} />
        <PortfolioDetailSymbol
            updateActiveStatus={updateActiveStatus}
            navigator={navigator}
            symbol={symbol}
            exchange={exchange}
            showAddToWl={showAddToWl} />
        <PortfolioDetailSummary symbol={symbol} exchange={exchange} data={data} portfolioType={portfolioType} />
        {
            portfolioType === PORTFOLIO_TYPE.EQUITY
                ? <React.Fragment>
                    <PortfolioDetailTitle />
                    <PortfolioHoldingWeight
                        symbol={symbol}
                        exchange={exchange}
                        data={data} />
                </React.Fragment>
                : null
        }
    </View>
}

export default PortfolioDetail
