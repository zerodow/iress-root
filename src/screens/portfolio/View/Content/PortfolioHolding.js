import React, { useCallback } from 'react'
import {
    View, Text
} from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import CommonStyle from '~/theme/theme_controller'
import { getDisplayName, getCompanyName } from '~/business'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import ENUM from '~/enum'
import ValueFormat from '~/component/ValueFormat/'
import PercentFormat from '~/component/PercentFormat/'
import I18n from '~/modules/language/'
import { useSelector } from 'react-redux'

const { PRICE_DECIMAL } = ENUM
const Symbol = ({ exchange, symbol }) => {
    const displayName = getDisplayName({ symbol, exchange })
    return <Text style={{
        fontSize: CommonStyle.font15,
        color: CommonStyle.fontColor,
        fontFamily: CommonStyle.fontPoppinsBold
    }}>
        {displayName}
    </Text>
}

const Company = ({ exchange, symbol, company }) => {
    const companyName = company || ''
    return <Text
        numberOfLines={1}
        style={{
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsRegular,
            opacity: 0.5
        }}>
        {companyName}
    </Text>
}

const DayPL = React.memo(({ currency, todayUpnl, todayUpnlPercent }) => {
    return <View style={{
        justifyContent: 'space-around'
    }}>
        <ValueFormat
            currencyCode={currency}
            value={todayUpnl}
            decimal={PRICE_DECIMAL.VALUE}
            textStyle={{ fontSize: CommonStyle.font21, textAlign: 'right' }}
            currencyStyle={{ fontSize: CommonStyle.fontSizeS }}
        />
        <PercentFormat
            value={todayUpnlPercent}
            wrapperStyle={{ justifyContent: 'flex-end' }}
            loadingStyle={{ alignSelf: 'flex-end' }}
            textStyle={{ fontSize: CommonStyle.font17, textAlign: 'right' }}
        />
    </View>
}, (prevProps, nextProps) => {
    const { todayUpnl: prevTodayUpnl, todayUpnlPercent: prevTodayUpnlPercent, currency: currencyPrev } = prevProps
    const { todayUpnl, todayUpnlPercent, currency: currencyNext } = nextProps
    const isChange = prevTodayUpnl !== todayUpnl || prevTodayUpnlPercent !== todayUpnlPercent || currencyPrev !== currencyNext
    return !isChange
})

const TotalPL = React.memo(({ currency, totalProfitAmount, totalProfitPercent }) => {
    return <View style={{
        justifyContent: 'space-around'
    }}>
        <ValueFormat
            currencyCode={currency}
            value={totalProfitAmount}
            decimal={PRICE_DECIMAL.VALUE}
            textStyle={{ fontSize: CommonStyle.font21, textAlign: 'right' }}
            currencyStyle={{ fontSize: CommonStyle.fontSizeS }}
        />
        <PercentFormat
            value={totalProfitPercent}
            wrapperStyle={{ justifyContent: 'flex-end' }}
            textStyle={{ fontSize: CommonStyle.font17, textAlign: 'right' }}
            loadingStyle={{ alignSelf: 'flex-end' }}
        />
    </View>
}, (prevProps, nextProps) => {
    const { totalProfitAmount: prevTotalProfitAmount, totalProfitPercent: prevTotalProfitPercent, currency: currencyPrev } = prevProps
    const { totalProfitAmount, totalProfitPercent, currency: currencyNext } = nextProps
    const isChange = prevTotalProfitAmount !== totalProfitAmount || prevTotalProfitPercent !== totalProfitPercent || currencyPrev !== currencyNext
    return !isChange
})

const ActualVol = React.memo(({ volume }) => {
    return <View style={{
        flexDirection: 'row'
    }}>
        <Text style={{
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsRegular,
            opacity: 0.5
        }}>
            {`${I18n.t('actualVol')}: `}
        </Text>
        <Text style={{
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsRegular
        }}>
            {formatNumberNew2(volume, PRICE_DECIMAL.VOLUME)}
        </Text>
    </View>
}, (prevProps, nextProps) => {
    const { volume: prevVolume } = prevProps
    const { volume } = nextProps
    const isChange = prevVolume !== volume
    return !isChange
})

const Left = ({ exchange, symbol, company, volume }) => {
    return <View style={{ justifyContent: 'space-around', maxWidth: '60%' }}>
        <Symbol symbol={symbol} exchange={exchange} />
        <Company symbol={symbol} exchange={exchange} company={company} />
        <ActualVol volume={volume} />
    </View>
}

const Right = ({ currency, todayUpnl, todayUpnlPercent, totalProfitAmount, totalProfitPercent }) => {
    const plState = useSelector(state => state.portfolio.plState)
    return plState
        ? <DayPL
            currency={currency}
            todayUpnl={todayUpnl}
            todayUpnlPercent={todayUpnlPercent} />
        : <TotalPL
            currency={currency}
            totalProfitAmount={totalProfitAmount}
            totalProfitPercent={totalProfitPercent} />
}

const PortfolioHolding = ({ currency, totalMarketValue, position, showDetail, showHideTabbar, showHideBuySell }) => {
    const {
        symbol,
        exchange,
        company,
        today_upnl: todayUpnl,
        today_upnl_percent: todayUpnlPercent,
        total_profit_amount: totalProfitAmount,
        total_profit_amount_percent: totalProfitPercent,
        volume
    } = position
    position['total_market_value'] = totalMarketValue
    position['currency_by_account'] = currency
    const onPress = useCallback(() => {
        showDetail && showDetail(symbol, exchange, position)
        showHideTabbar && showHideTabbar(0)
        showHideBuySell && showHideBuySell(1)
    }, [symbol, exchange, position])
    return <View style={{
        paddingTop: 8,
        paddingHorizontal: 8
    }}>
        <TouchableOpacityOpt
            onPress={onPress}
            style={{
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: CommonStyle.color.dark,
                paddingHorizontal: 16
            }}
        >
            <Left
                symbol={symbol}
                exchange={exchange}
                company={company}
                volume={volume} />
            <View
                style={{
                    position: 'absolute',
                    right: 16,
                    top: 10
                }}>
                <Right
                    currency={currency}
                    todayUpnl={todayUpnl}
                    todayUpnlPercent={todayUpnlPercent}
                    totalProfitAmount={totalProfitAmount}
                    totalProfitPercent={totalProfitPercent} />
            </View>
        </TouchableOpacityOpt>
    </View>
}

export default PortfolioHolding
