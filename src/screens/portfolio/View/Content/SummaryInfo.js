import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import I18n from '~/modules/language'
import CommonStyle from '~/theme/theme_controller'
import ValueFormat from '~/component/ValueFormat'
import PercentFormat from '~/component/PercentFormat'
import { useRealizePL } from '~s/portfolio/Hook/'
import ENUM from '~/enum'

const { PRICE_DECIMAL } = ENUM
const TotalPL = React.memo(({ data = {}, currency }) => {
    const { total_pnl: totalProfitAmount, total_pnl_percent: totalProfitPercent } = data
    return <View>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {I18n.t('totalPL')}
        </Text>
        <ValueFormat
            value={totalProfitAmount}
            decimal={PRICE_DECIMAL.VALUE}
            currencyCode={currency}
            textStyle={{ fontFamily: CommonStyle.fontPoppinsBold }}
        />
        <View style={{ height: 2 }} />
        <PercentFormat
            value={totalProfitPercent}
        />
    </View>
}, (prevProps, nextProps) => {
    const { total_pnl: prevTotalProfitAmount, total_pnl_percent: prevTotalProfitPercent } = prevProps.data || {}
    const { total_pnl: totalProfitAmount, total_pnl_percent: totalProfitPercent } = nextProps.data || {}
    const isChange = prevTotalProfitAmount !== totalProfitAmount || prevTotalProfitPercent !== totalProfitPercent
    return !isChange
})

const RealisedPL = React.memo(({ realizePL, realizePLPercent, currency }) => {
    return <View style={{ alignItems: 'center' }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {I18n.t('realisedPL')}
        </Text>
        <ValueFormat
            value={realizePL}
            currencyCode={currency}
            decimal={PRICE_DECIMAL.VALUE}
            textStyle={{ fontFamily: CommonStyle.fontPoppinsBold }}
        />
        <View style={{ height: 2 }} />
        <PercentFormat
            value={realizePLPercent}
        />
    </View>
}, (prevProps, nextProps) => {
    const { realizePL: prevRealizePL, realizePLPercent: prevRealizePLPercent } = prevProps
    const { realizePL, realizePLPercent } = nextProps
    const isChange = prevRealizePL !== realizePL || prevRealizePLPercent !== realizePLPercent
    return !isChange
})

const DayPL = React.memo(({ data = {} }) => {
    const { today_upnl: todayUpnl, today_upnl_percent: todayUpnlPercent, currency } = data
    return <View style={{ alignItems: 'flex-end' }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {I18n.t('dayPL')}
        </Text>
        <ValueFormat
            value={todayUpnl}
            currencyCode={currency}
            decimal={PRICE_DECIMAL.VALUE}
            textStyle={{ fontFamily: CommonStyle.fontPoppinsBold }}
        />
        <View style={{ height: 2 }} />
        <PercentFormat
            value={todayUpnlPercent}
        />
    </View>
}, (prevProps, nextProps) => {
    const { today_upnl: prevTodayUpnl, today_upnl_percent: prevTodayUpnlPercent } = prevProps.data || {}
    const { today_upnl: todayUpnl, today_upnl_percent: todayUpnlPercent } = nextProps.data || {}
    const isChange = prevTodayUpnl !== todayUpnl || prevTodayUpnlPercent !== todayUpnlPercent
    return !isChange
})

const SummaryInfo = ({ data }) => {
    const { currency = '' } = data
    const [realizePL, realizePLPercent] = useRealizePL(data)
    return <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
    }}>
        <TotalPL data={data} currency={currency} />
        <RealisedPL
            currency={currency}
            realizePL={realizePL}
            realizePLPercent={realizePLPercent} />
        <DayPL data={data} />
    </View>
}

export default SummaryInfo
