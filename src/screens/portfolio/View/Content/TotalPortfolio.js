import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import ValueFormat from '~/component/ValueFormat/'
import ENUM from '~/enum'
import { useTotalPortfolio } from '~s/portfolio/Hook/'
const { PRICE_DECIMAL, PORTFOLIO_TYPE } = ENUM

const MarketValOrIM = React.memo(({ currency, totalPortfolio }) => {
    return <ValueFormat
        ignorePositiveNumber={true}
        // hasPrefix={false}
        value={totalPortfolio}
        decimal={PRICE_DECIMAL.VALUE}
        currencyCode={currency}
        currencyStyle={{
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.font17
        }}
        textStyle={{
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.font21
        }} />
}, (prevProps, nextProps) => {
    const { totalPortfolio: prevTotalPortfolio } = prevProps
    const { totalPortfolio } = nextProps
    const { currency: currencyPrev } = prevProps
    const { currency: currencyNext } = nextProps
    const isChange = prevTotalPortfolio !== totalPortfolio || currencyPrev !== currencyNext
    return !isChange
})

const TotalPortfolio = ({ data, portfolioType }) => {
    const { currency = '' } = data
    const [totalPortfolio] = useTotalPortfolio(data)
    return <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                opacity: 0.5,
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontColor
            }}>
                {portfolioType === PORTFOLIO_TYPE.EQUITY ? I18n.t('totalPortfolio') : I18n.t('grossLiquidation')}
            </Text>
            <MarketValOrIM currency={currency} totalPortfolio={totalPortfolio} />
        </View>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            opacity: 0.7,
            fontSize: CommonStyle.font11,
            color: CommonStyle.color.modify
        }}>
            {currency}
        </Text>
    </View>
}

export default TotalPortfolio
