import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import PropTypes from 'prop-types'

import Enum from '~/enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { getCashAvailable } from '~/screens/new_order/Controller/ContentController.js'
import * as Util from '~/util';
import {
    isIphoneXorAbove,
    logDevice,
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime
} from '~/lib/base/functionUtil';
import * as Business from '~/business'
const { TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE }, SYMBOL_CLASS, CURRENCY } = Enum
function getStyleCashValue({ cashAvailable }) {
    if (!cashAvailable) return { color: CommonStyle.color.success }
    if (cashAvailable > 0) {
        return {
            color: CommonStyle.color.success
        }
    } else {
        return {
            color: CommonStyle.color.sell
        }
    }
}
function getCashByAccountCurrency({ cashAvailable, cashAvailableAu, cashAvailabelUs, currencyAccount }) {
    switch (currencyAccount) {
        case 'VND':
            return formatNumberNew2(cashAvailable, Enum.PRICE_DECIMAL.PRICE)
            break;
        case 'AUD':
            return formatNumberNew2(cashAvailableAu, Enum.PRICE_DECIMAL.VALUE)
            break;
        case 'USD':
            return formatNumberNew2(cashAvailableAu, Enum.PRICE_DECIMAL.VALUE)
            break;
        default:
            return 0
            break;
    }
}
const IconSearchAccount = () => {
    return (
        <MaterialCommunityIcons name='account-search' size={22} color={'white'} />
    )
}
const AccountName = ({ accountName }) => {
    return <Text style={{
        fontSize: CommonStyle.font11,
        fontFamily: CommonStyle.fontPoppinsRegular,
        color: CommonStyle.fontColor
    }}>{accountName}</Text>
}
const AccountId = ({ accountId, isSelected, hideCheckBox = false }) => {
    return <View style={{ flexDirection: 'row' }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.fontNearLight6
        }}>{'Account'}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontColor,
                paddingLeft: 8
            }}>{accountId}</Text>
        </View>
    </View>
}

function filterCashBySymbolClass({ data = {}, symbol }) {
    const symbolClass = Business.getClassBySymbol(symbol)
    const symbolCurrency = Business.getCurency(symbol)
    if (symbolClass === SYMBOL_CLASS.FUTURE) {
        // Future -> show "Initial Margin Available to Trade"
        return data.initial_margin_available
    } else if (symbolClass === SYMBOL_CLASS.EQUITY && symbolCurrency === CURRENCY.USD) {
        // Equity Mỹ -> show "Cash Available to Trade (not include your settlement in T+2 & Others)"
        return data.available_balance_us
    }
    return data.available_balance_au
}

const AvailableBalance = ({ accountId, currency: currencyAccount, symbol }) => {
    const [cashAvailable, setCash] = useState(null)
    useEffect(() => {
        if (accountId) {
            Business.getCashAvailable(accountId).then(data => {
                let { cash_available: cashAvailable, cash_available_au: cashAvailableAu, cash_available_us: cashAvailabelUs, cash_balance: cashBalance } = data
                let reusltCash = filterCashBySymbolClass({
                    data,
                    symbol
                })
                setCash(reusltCash)
            })
        }
    }, [accountId])
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text numberOfLines={1} style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontNearLight6,
                flex: 1
            }}>{'Available Trading Balance'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                <Text style={[{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font11,
                    color: cashAvailable < 0 ? CommonStyle.color.sell : CommonStyle.color.success
                }, getStyleCashValue({ cashAvailable })]}>{cashAvailable}</Text>
                <Text style={[{
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontTiny,
                    color: cashAvailable < 0 ? CommonStyle.color.sell : CommonStyle.color.success,
                    marginBottom: 1
                }, getStyleCashValue({ cashAvailable })]}>{` ${currencyAccount}`}</Text>
            </View>

        </View>
    )
}
const BoxAccount = ({
    accountId,
    accountName,
    symbol,
    currency,
    tradingBalance,
    currentAccount,
    isSelected,
    type,
    style,
    el
}) => {
    if (type === 'Single') {
        return (
            <TouchableOpacity
                style={[{
                    width: '100%'
                }, style]}
            >
                <View style={[{
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 8,
                    borderColor: isSelected ? CommonStyle.color.modify : CommonStyle.color.dusk,
                    marginHorizontal: 8
                }]}>
                    <AccountId hideCheckBox={hideCheckBox} isSelected={isSelected} accountId={accountId} />
                    <AccountName accountName={accountName} />
                    <Avla symbol={symbol} currency={currency} accountId={accountId} />
                </View>
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity onPress={() => {
            setCurrentAccount && setCurrentAccount(el)
        }}>
            <View style={[{
                borderWidth: 1,
                borderRadius: 8,
                padding: 8,
                borderColor: isSelected ? CommonStyle.color.modify : CommonStyle.color.dusk,
                width: 275,
                marginRight: 8
            }]}>
                <AccountId isSelected={isSelected} accountId={accountId} />
                <AccountName accountName={accountName} />
                <AvailableBalance symbol={symbol} currency={currency} accountId={accountId} />
            </View>
        </TouchableOpacity>
    )
};
BoxAccount.propTypes = {
    type: PropTypes.oneOf(['Single', 'Multiple'])
}
export default BoxAccount;
