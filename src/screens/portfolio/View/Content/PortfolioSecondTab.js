import React, { useState, useImperativeHandle, useRef, useCallback } from 'react'
import {
    View, Text, Dimensions, StyleSheet, processColor,
    Platform, TouchableOpacity, TouchableWithoutFeedback
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import { PieChart } from 'react-native-charts-wrapper'
import { useDataChart, useLegendChart, useNoteChart } from '../../Controller/ChartController'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import { useSelector } from 'react-redux'
import { getCurrencyByCode } from '~/component/currency/Controller'
import ENUM from '~/enum'
const dataFake = {
    total_portfolio: 923380.10,
    total_value: 200000,
    positions: [
        {
            symbol: 'THC',
            exchange: 'ASX',
            company: 'THC Global Group',
            filled_quantity: 1000,
            avg_price: 28.390,
            today_upnl: 822.20,
            today_upnl_percent: 20.30,
            total_profit_amount: -1293.90,
            total_profit_percent: -35.39,
            value: 200000 * 40,
            value_percent: 40,
            volume: 1000
        },
        {
            symbol: 'MQG',
            exchange: 'ASX',
            company: 'MQG Global Group',
            filled_quantity: 100,
            avg_price: 100.390,
            today_upnl: -1222.20,
            today_upnl_percent: -40.180,
            total_profit_amount: 1564.80,
            total_profit_percent: 40.09,
            value: 200000 * 15,
            value_percent: 15,
            volume: 100
        },
        {
            symbol: 'ANZ',
            exchange: 'ASX',
            company: 'ANZ Global Group',
            filled_quantity: 1894,
            avg_price: 36.180,
            today_upnl: 522.20,
            today_upnl_percent: 15.15,
            total_profit_amount: -893.90,
            total_profit_percent: -30.09,
            value: 200000 * 5,
            value_percent: 5,
            volume: 1894
        },
        {
            symbol: 'BHP',
            exchange: 'ASX',
            company: 'BHP Global Group',
            filled_quantity: 600,
            avg_price: 38.390,
            today_upnl: -922.20,
            today_upnl_percent: -21.60,
            total_profit_amount: 1168.90,
            total_profit_percent: 40,
            value: 200000 * 20,
            value_percent: 20,
            volume: 600
        },
        {
            symbol: 'RIO',
            exchange: 'ASX',
            company: 'RIO Global Group',
            filled_quantity: 108,
            avg_price: 98.390,
            today_upnl: 812.20,
            today_upnl_percent: 20.30,
            total_profit_amount: 1293.90,
            total_profit_percent: 35.39,
            value: 200000 * 5,
            value_percent: 5,
            volume: 108
        },
        {
            symbol: 'APT',
            exchange: 'ASX',
            company: 'APT Global Group',
            filled_quantity: 18,
            avg_price: 98.390,
            today_upnl: 812.20,
            today_upnl_percent: 20.30,
            total_profit_amount: 1293.90,
            total_profit_percent: 35.39,
            value: 200000 * 15,
            value_percent: 15,
            volume: 18
        }
    ]
}
const { PRICE_DECIMAL } = ENUM
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const HEIGHT = 238.5
const NoteItem = ({ item, index, refChart, refHighLightChart, totalValue, currency }) => {
    const { displayName, percent, color } = item
    const onPress = () => {
        refChart.current && refChart.current.setHighlights && refChart.current.setHighlights([{ x: index }])
        const { percent, color, displayName } = item
        highLightProperty = {
            displayName,
            label: 'Market Value',
            value: `${currency}${formatNumberNew2(totalValue * percent / 100, PRICE_DECIMAL.VALUE)}`,
            color
        }
        refHighLightChart.current && refHighLightChart.current.setHighLight && refHighLightChart.current.setHighLight(highLightProperty)
    }
    return <TouchableOpacity
        onPress={onPress}
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: index === 0 ? 0 : 8
        }}>
        <View style={{ flexDirection: 'row' }}>
            <View style={{
                alignSelf: 'center',
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: color,
                marginRight: 8
            }} />
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.fontColor,
                fontSize: CommonStyle.font11,
                opacity: 0.7
            }}>
                {displayName}
            </Text>
        </View>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font11,
            opacity: 0.7
        }}>
            {`${formatNumberNew2(percent, PRICE_DECIMAL.PERCENT)}%`}
        </Text>
    </TouchableOpacity>
}

const HighLightChartDisplayName = ({ displayName, color }) => {
    return <Text style={{
        color,
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontTiny,
        marginBottom: 8
    }}>
        {displayName}
    </Text>
}

const HighLightChartValue = ({ value, label }) => {
    return <View style={{
        borderWidth: 1,
        borderColor: CommonStyle.color.dusk,
        borderRadius: 8,
        width: (182 - (16 * 4) - (8 * 2)),
        height: 32,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.fontTiny
        }}>
            {value}
        </Text>
        <View style={{
            position: 'absolute',
            top: -8,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center'
        }}>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                color: CommonStyle.fontColor,
                fontSize: CommonStyle.fontTiny,
                backgroundColor: CommonStyle.backgroundColor
            }}>
                {label}
            </Text>
        </View>
    </View>
}

const HighLightChart = React.forwardRef(({ totalValue, currency }, ref) => {
    const [highLightProperty, setHighLight] = useState({
        displayName: 'Total Portfolio',
        label: 'Market Value',
        value: `${currency}${formatNumberNew2(totalValue, PRICE_DECIMAL.VALUE)}`,
        color: CommonStyle.fontColor
    })
    useImperativeHandle(ref, () => {
        return {
            setHighLight
        }
    })
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
        <HighLightChartDisplayName
            color={highLightProperty.color}
            displayName={highLightProperty.displayName} />
        <HighLightChartValue
            label={highLightProperty.label}
            value={highLightProperty.value} />
    </View>
})

const Chart = React.forwardRef(({
    dataChart, legend, chartDescription, handleSelect,
    onChange, refHighLightChart, totalValue, currency, refPieChart
}, ref) => {
    const [highlights, setHighlights] = useState([])
    useImperativeHandle(ref, () => {
        return {
            setHighlights
        }
    })
    return !totalValue
        ? <View />
        : <View style={{ height: 182, width: 182, marginHorizontal: 16 }}>
            <PieChart
                data={dataChart}
                legend={legend}
                chartDescription={chartDescription}
                style={styles.chart}
                extraOffsets={[0, 0, 0, 0]} // Left Top Right Bottom
                chartBackgroundColor={processColor(CommonStyle.color.dark)}
                drawEntryLabels={false}
                rotationEnabled={false}
                holeRadius={80}
                holeColor={processColor(CommonStyle.color.dark)}
                highlights={highlights}
                maxAngle={360} // Config max là bao nhiêu độ
                onSelect={handleSelect}
                onChange={onChange}
            />
            <HighLightChart
                ref={refHighLightChart}
                currency={currency}
                totalValue={totalValue} />
        </View>
})

const Note = ({ note, refChart, refHighLightChart, totalValue, currency }) => {
    return !totalValue
        ? <View />
        : <View style={{ width: DEVICE_WIDTH - 182 - (16 * 2), paddingRight: 16, justifyContent: 'center' }}>
            {
                note.map((item, index) => <NoteItem
                    currency={currency}
                    totalValue={totalValue}
                    key={item.displayName}
                    item={item} index={index}
                    refChart={refChart}
                    refHighLightChart={refHighLightChart} />)
            }
        </View>
}

const PortfolioSecondTab = () => {
    const ref = React.useRef({ hightLightIndex: -1 }).current;
    const data = useSelector(state => state.portfolio.data) || {}
    const { positions = [], total_market_value: totalValue, currency: currencyByAccount } = data
    const currency = getCurrencyByCode({ currencyCode: currencyByAccount })
    // const currency = '$'
    const chartDescription = { text: '' }
    const refHighLightChart = useRef({})
    const refChart = useRef({})
    const dataChart = useDataChart(positions)
    const legend = useLegendChart()
    const note = useNoteChart(positions)
    const showTotalValue = useCallback(() => {
        const highlights = []
        const highLightProperty = {
            displayName: 'Total Portfolio',
            label: 'Market Value',
            value: `${currency}${formatNumberNew2(totalValue, PRICE_DECIMAL.VALUE)}`,
            color: CommonStyle.fontColor
        }
        refChart.current && refChart.current.setHighlights && refChart.current.setHighlights(highlights)
        refHighLightChart.current && refHighLightChart.current.setHighLight && refHighLightChart.current.setHighLight(highLightProperty)
    }, [totalValue, currency])
    const showEachValue = useCallback((data) => {
        clearTimeout(ref.timeoutId);
        const { value: percent, color, displayName, index } = data;
        if (displayName && ref.hightLightIndex !== index) {
            ref.hightLightIndex = index;
        } else {
            ref.hightLightIndex = -1;
            return showTotalValue();
        }
        const highlights = [{ x: index }]
        ref.hightLightIndex = index;
        const highLightProperty = {
            displayName,
            label: 'Market Value',
            value: `${currency}${formatNumberNew2(totalValue * percent / 100, PRICE_DECIMAL.VALUE)}`,
            color
        }
        refChart.current && refChart.current.setHighlights && refChart.current.setHighlights(highlights)
        refHighLightChart.current && refHighLightChart.current.setHighLight && refHighLightChart.current.setHighLight(highLightProperty)
    }, [totalValue, currency])
    const handleSelect = (event) => {
        let entry = event.nativeEvent
        const { data = {} } = entry
        showEachValue(data);
    }
    const onChange = (event) => {
        console.log(event.nativeEvent)
    }
    const unFocusChart = () => {
        ref.timeoutId = setTimeout(() => {
            ref.hightLightIndex = -1;
            showTotalValue();
        }, 500)
    }
    // Dùng touchable without feed back thì bị double click chart - TouchableWithoutFeedback children sẽ trigger trước => onPress của touch còn onStartShould thì trigger trước rồi mới trigger children
    return <View
        onStartShouldSetResponder={unFocusChart}
        style={{
            width: DEVICE_WIDTH,
            backgroundColor: CommonStyle.color.dark,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16
        }}>
        <Chart
            ref={refChart}
            totalValue={totalValue}
            currency={currency}
            refHighLightChart={refHighLightChart}
            dataChart={dataChart}
            legend={legend}
            chartDescription={chartDescription}
            handleSelect={handleSelect}
            onChange={onChange} />
        <Note
            currency={currency}
            totalValue={totalValue}
            note={note}
            refChart={refChart}
            refHighLightChart={refHighLightChart} />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    chart: {
        flex: 1
    }
});

export default PortfolioSecondTab
