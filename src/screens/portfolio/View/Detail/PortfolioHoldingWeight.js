import React, { } from 'react'
import {
    View, Text, processColor, Platform, Dimensions
} from 'react-native'
import I18n from '~/modules/language/'
import CommonStyle from '~/theme/theme_controller'
import ValueFormat from '~/component/ValueFormat/'
import ENUM from '~/enum'
import { PieChart } from 'react-native-charts-wrapper'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import { useLeftLineMarkerHoldingWeight, useRightLineMarkerHoldingWeight } from '~s/portfolio/Hook/'
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js'
const { PRICE_DECIMAL, PORTFOLIO_TYPE } = ENUM

const TotalPortfolio = ({ data, symbol, exchange }) => {
    const { total_market_value: totalPortfolio, currency_by_account: currency } = data
    const decimal = 2
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor
        }}>
            {I18n.t('totalPortfolio')}
        </Text>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {I18n.t('marketValue')}
        </Text>
        <ValueFormat
            currencyCode={currency}
            value={totalPortfolio}
            hasPrefix={false}
            decimal={decimal}
            textStyle={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.fontColor,
                fontSize: CommonStyle.font11
            }}
            currencyStyle={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.fontColor,
                fontSize: CommonStyle.fontTiny
            }}
        />
    </View>
}

const Symbol = ({ data }) => {
    const { symbol, exchange, market_value: marketValue, currency_by_account: currency } = data
    const decimal = 2
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor
        }}>
            {`${symbol}.${exchange}`}
        </Text>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {I18n.t('marketValue')}
        </Text>
        <ValueFormat
            currencyCode={currency}
            value={marketValue}
            ignorePositiveNumber
            decimal={decimal}
            textStyle={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: marketValue ? CommonStyle.color.modify : CommonStyle.fontColor,
                fontSize: CommonStyle.font11
            }}
            currencyStyle={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: marketValue ? CommonStyle.color.modify : CommonStyle.fontColor,
                fontSize: CommonStyle.fontTiny
            }}
        />
    </View>
}

const HighLightChart = React.forwardRef(({ marketValue, totalMarketValue }, ref) => {
    const percent = marketValue / totalMarketValue * 100
    return <View
        pointerEvents={'none'}
        style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.color.modify
        }}>
            {`${formatNumberNew2(percent, PRICE_DECIMAL.PERCENT)}%`}
        </Text>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font7,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {'of'}
        </Text>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font7,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }}>
            {'total portfolio value'}
        </Text>
    </View>
})

const RightLine = ({ marketValue, totalMarketValue }) => {
    const percent = marketValue / totalMarketValue * 100
    const property = useRightLineMarkerHoldingWeight({ percent, width: 120, triggerDistance: 32 * 1.5 })
    if (property === null) return null
    const { top, left, right, height } = property
    return <View style={{
        position: 'absolute',
        top,
        right,
        left,
        height,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        // zIndex: -1,
        borderColor: CommonStyle.color.modify
    }} />
}

const LeftLine = ({ marketValue, totalMarketValue }) => {
    const percent = marketValue / totalMarketValue * 100
    const property = useLeftLineMarkerHoldingWeight({ percent, width: 120, triggerDistance: 32 * 1.5 })
    if (property === null) return null
    const { top, left, right, height } = property
    return <View style={{
        position: 'absolute',
        top,
        left,
        right,
        height,
        borderTopWidth: 1,
        borderRightWidth: 1,
        // zIndex: -1,
        borderColor: CommonStyle.color.dusk_tabbar
    }}>

    </View>
}

const Chart = React.memo(({ data }) => {
    const { market_value: marketValue = 0, total_market_value: totalMarketValue = 100 } = data
    const dataChart = {
        dataSets: [{
            values: [{ value: marketValue / totalMarketValue * 100 }, { value: (totalMarketValue - marketValue) / totalMarketValue * 100 }],
            label: 'Pie dataset',
            config: {
                colors: [processColor(CommonStyle.color.modify), processColor('transparent')],
                drawValues: false,
                sliceSpace: 0,
                selectionShift: 0
            }
        }]
    }
    const dataChartFake = {
        dataSets: [{
            values: [{ value: 100 }],
            label: 'Pie dataset',
            config: {
                colors: [processColor(CommonStyle.color.dusk_tabbar)],
                drawValues: false,
                sliceSpace: 0,
                selectionShift: 0
            }
        }]
    }
    const legend = {
        enabled: false,
        textSize: 15,
        form: 'CIRCLE',
        horizontalAlignment: 'RIGHT',
        verticalAlignment: 'CENTER',
        orientation: 'VERTICAL',
        wordWrapEnabled: true
    }
    const chartDescription = { text: '' }
    return marketValue !== null && marketValue !== undefined && totalMarketValue
        ? <View style={{ width: '100%', alignItems: 'center', marginTop: 4 }}>
            <View style={{ width: 120, height: 120 }}>
                <View style={{ position: 'absolute', top: 4, bottom: 4, right: 0, left: 0 }}>
                    <PieChart
                        data={dataChartFake}
                        legend={legend}
                        chartDescription={chartDescription}
                        style={{ flex: 1 }}
                        extraOffsets={[0, 0, 0, 0]} // Left Top Right Bottom
                        chartBackgroundColor={processColor(CommonStyle.color.dark)}
                        drawEntryLabels={false}
                        rotationEnabled={false}
                        holeRadius={90}
                        holeColor={processColor(CommonStyle.color.dark)}
                        maxAngle={360} // Config max là bao nhiêu độ
                        onSelect={() => { }}
                        onChange={() => { }}
                    />
                </View>
                <PieChart
                    data={dataChart}
                    legend={legend}
                    chartDescription={chartDescription}
                    style={{ flex: 1 }}
                    extraOffsets={[0, 0, 0, 0]} // Left Top Right Bottom
                    chartBackgroundColor={processColor('transparent')}
                    drawEntryLabels={false}
                    rotationEnabled={false}
                    holeRadius={75}
                    holeColor={processColor('transparent')}
                    maxAngle={360} // Config max là bao nhiêu độ
                    onSelect={() => { }}
                    onChange={() => { }}
                />
                <HighLightChart marketValue={marketValue} totalMarketValue={totalMarketValue} />
            </View>
            <RightLine
                marketValue={marketValue}
                totalMarketValue={totalMarketValue} />
            <LeftLine
                marketValue={marketValue}
                totalMarketValue={totalMarketValue} />
        </View>
        : <View />
}, (prevProps, nextProps) => {
    const { market_value: prevMarketValue, total_market_value: prevTotalMarketValue } = prevProps.data
    const { market_value: marketValue, total_market_value: totalMarketValue } = nextProps.data
    const isChange = prevMarketValue !== marketValue || prevTotalMarketValue !== totalMarketValue
    return !isChange
})

const PortfolioHoldingWeight = ({ data, symbol, exchange }) => {
    return <View style={{ paddingTop: 18 }}>
        <View style={{ flexDirection: 'row' }}>
            <TotalPortfolio {...{ symbol, exchange }} data={data} />
            <Symbol {...{ symbol, exchange }} data={data} />
        </View>
        <Chart data={data} />
    </View>
}

export default PortfolioHoldingWeight
