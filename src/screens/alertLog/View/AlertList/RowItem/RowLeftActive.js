import React from 'react'
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import CommonStyle from '~/theme/theme_controller'
import { getDisplayName } from '~/business'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import ENUM from '~/enum'
import * as Business from '~/business';
import PricePercent from '~s/watchlist/Component/PricePercent';
import PriceValue from '~s/watchlist/Component/PriceValue';
import I18n from '~/modules/language/'
import { useSelector, shallowEqual } from 'react-redux'
import isEqual from 'react-fast-compare';
import { getAlertStatusByAlertType } from '~s/alertLog/Controller/AlertController'
import { calculateLineHeight } from '~/util'

const { PRICE_DECIMAL } = ENUM
const { width: DEVICE_WIDTH } = Dimensions.get('window')

const Symbol = ({ symbol }) => {
    return <Text style={{
        fontSize: CommonStyle.font15,
        color: CommonStyle.fontColor,
        fontFamily: CommonStyle.fontPoppinsBold
    }}>
        {symbol}
    </Text>
}

const Company = ({ company }) => {
    const companyName = company || ''
    return <Text
        numberOfLines={1}
        style={[{
            fontSize: CommonStyle.fontTiny,
            color: CommonStyle.fontColor,
            fontFamily: CommonStyle.fontPoppinsRegular,
            opacity: 0.5
        },
        Platform.OS === 'ios' ? {} : { lineHeight: calculateLineHeight(CommonStyle.fontTiny) }
        ]}>
        {companyName}
    </Text>
}
const AlertStatus = ({ alertStatus, enable }) => {
    const { nameAlert, color } = alertStatus
    return (
        <View>
            <Text style={{
                fontSize: CommonStyle.fontTiny,
                color: color,
                fontWeight: 'bold',
                opacity: enable ? 1 : 0.4
            }}>{nameAlert}</Text>
        </View>
    )
}
const RowItemLeft = React.memo(({ data }) => {
    const { symbol: symbolDisplay, alert_type: alertType, currency, enable } = data
    const isLoading = useSelector(state => state.alertLog.isLoading, shallowEqual)
    const alertStatus = getAlertStatusByAlertType(alertType)
    const getDisplayName = symbolDisplay.split('.')
    const symbol = getDisplayName[0]
    const exchange = getDisplayName[1]
    const companyName = Business.getCompanyName({ symbol, exchange });
    const quote = useSelector(
        (state) => state.quotes.data[symbol + '#' + exchange] || {},
        isEqual
    );
    const { trade_price: tradePrice, change_point: changePoint, change_percent: changePercent } = quote
    return (
        <View style={{
            width: DEVICE_WIDTH / 2 - 24,
            marginLeft: 8
        }} >
            <View style={{ flexDirection: 'row', alignItems: 'center', opacity: enable ? 1 : 0.9 }}>
                <Symbol symbol={symbolDisplay} />
                <View style={{ paddingLeft: 8, flexDirection: 'row' }}>
                    {!isLoading && < PricePercent
                        value={changePercent}
                        colorFlag={changePoint}
                        style={{
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.font11,
                            opacity: enable ? 1 : 0.9
                        }}
                    />
                    }
                </View>
            </View>
            <Company company={companyName} />
            <View style={{ paddingVertical: 4 }}>
                {!isLoading && <PriceValue
                    exchange={exchange}
                    symbol={symbol}
                    value={tradePrice}
                    colorFlag={changePoint}
                    style={{
                        fontSize: CommonStyle.font13, textAlign: 'left', opacity: enable ? 1 : 0.9
                    }}
                />
                }
            </View>
            <AlertStatus alertStatus={alertStatus} enable={enable} />
        </View>
    )
}, (pre, next) => pre.data === next.data)

export default RowItemLeft

const styles = StyleSheet.create({})
