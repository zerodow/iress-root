import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import RowPriceDefault from '~/screens/confirm_order/Components/RowInfoPrice/RowPriceDefault.js'

import * as Business from '~/business'
import CommonStyle from '~/theme/theme_controller'
import ENUM from '~/enum'
import {
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime
} from '~/lib/base/functionUtil';
const {
    EXCHANGE_CODE_MAPPING, NOTE_STATE, DURATION_CODE, ORDER_ACTION,
    RESPONSE_STATUS, EXCHANGE_CODE, ERROR_CODE, PRICE_DECIMAL, TYPE_ERROR_ORDER
} = ENUM
function getDecimal(currency) {
    if (currency === 'VND') {
        return ENUM.PRICE_DECIMAL.PRICE
    } else {
        return ENUM.PRICE_DECIMAL.EXTERNAL
    }
}
const BlockInfoByClass = ({ classSymbol, fees, currencySymbol, accountCurrency }) => {
    const {
        order_amount: orderAmount,
        estimated_fees: estimatedFees,
        total_convert: totalConvert,
        initial_margin_impact: initialMarginImpact, // Symbol
        initial_margin_impact_convert: initialMarginImpactConvert, // Account
        maintenance_margin_impact: maintenanceMarginImpact, // Symbol
        maintenance_margin_impact_convert: maintenanceMarginImpactConvert // Account
    } = fees
    const isFuture = useMemo(() => {
        return Business.isFuture(classSymbol);
        return true
    }, [])
    switch (isFuture) {
        case true:
            return (
                <View style={{
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorder
                }} >
                    <RowPriceDefault title={'IM Impact'} renderValue={() => {
                        return (
                            <View>
                                <Text style={{
                                    color: CommonStyle.fontColor,
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    paddingVertical: 2,
                                    textAlign: 'right'
                                }}>{`${formatNumberNew2(initialMarginImpact, getDecimal(currencySymbol)) || '--'} ${currencySymbol}`}</Text>
                                {/* Symbol currency */}
                                {currencySymbol !== accountCurrency && (
                                    <Text style={{
                                        color: CommonStyle.fontColor,
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        fontSize: CommonStyle.fontSizeXS,
                                        paddingVertical: 2,
                                        textAlign: 'right'
                                    }}>{`${formatNumberNew2(initialMarginImpactConvert, getDecimal(accountCurrency)) || '--'} ${accountCurrency}`}</Text>
                                )}
                                {/* Acount currency */}
                            </View>
                        )
                    }} />
                    <RowPriceDefault title={'MM Impact'} renderValue={() => {
                        return (
                            <View>
                                <Text style={{
                                    color: CommonStyle.fontColor,
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    paddingVertical: 2,
                                    textAlign: 'right'
                                }}>{`${formatNumberNew2(maintenanceMarginImpact, getDecimal(currencySymbol)) || '--'} ${currencySymbol}`}</Text>
                                {currencySymbol !== accountCurrency && (
                                    <Text style={{
                                        color: CommonStyle.fontColor,
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        fontSize: CommonStyle.fontSizeXS,
                                        paddingVertical: 2,
                                        textAlign: 'right'
                                    }}>{`${formatNumberNew2(maintenanceMarginImpactConvert, getDecimal(accountCurrency)) || '--'} ${accountCurrency}`}</Text>)}
                            </View>
                        )
                    }} />
                </View>
            )
            break;

        default:
            return (
                <View style={{
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorder
                }}>
                    <RowPriceDefault title={'Order Amount'} value={`${formatNumberNew2(orderAmount, PRICE_DECIMAL.EXTERNAL)} ${currencySymbol}`} />
                    <RowPriceDefault title={'Est. Fees'} value={`${formatNumberNew2(estimatedFees, PRICE_DECIMAL.VALUE)} ${currencySymbol}`} />
                    <RowPriceDefault title={'Est. Total'} value={`${formatNumberNew2(totalConvert, PRICE_DECIMAL.VALUE)} ${currencySymbol}`} />
                </View>
            )
            break;
    }
    return (
        <View>

        </View>
    )
}
BlockInfoByClass.propTypes = {}
BlockInfoByClass.defaultProps = {}
export default BlockInfoByClass
