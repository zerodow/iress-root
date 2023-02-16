import React, { useMemo, useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import { useShadow } from '~/component/shadow/SvgShadow'
import { getPortfolioTotal, getPortfolioBalance } from '~s/portfolio/Controller/PortfolioTotalController'
import { getAccActive, getPorfolioTypeByCode, getDicPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import ValueFormat from '~/component/ValueFormat'
import { AccountCFD } from '~/component/ListBoxAccount/BoxAccount.js'
import RemakeBoxAccount from '~/component/ListBoxAccount/RemakeBoxAccount.js'
import Enum from '~/enum'

const { TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE }, SYMBOL_CLASS, CURRENCY, PRICE_DECIMAL, PORTFOLIO_TYPE } = Enum

const AccountName = (props) => {
    const { accountName } = props
    return <Text style={{
        fontSize: CommonStyle.fontSizeXS,
        fontFamily: CommonStyle.fontPoppinsRegular,
        color: CommonStyle.fontColor
    }}>{accountName}</Text>
}
const AccountId = (props) => {
    const { accountId } = props
    return <View style={{ flexDirection: 'row' }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.fontNearLight6
        }}>Account</Text>
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
const AvailableBalance = ({ availableBalance, isLoading, isShow }) => {
    const currency = useMemo(() => '$')
    const title = useMemo(() => {
        const accActive = getAccActive()
        const typeAccount = getPorfolioTypeByCode(accActive)
        if (typeAccount === PORTFOLIO_TYPE.CFD) {
            return 'Free Equity Balance '
        }
        return 'Available Balance'
    }, [])
    return (isShow) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

            <Text numberOfLines={1} style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontNearLight6,
                flex: 1
            }}>{title}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
                <ValueFormat
                    forceColor={CommonStyle.color.buy}
                    ignorePositiveNumber={true}
                    isLoading={isLoading}
                    value={availableBalance}
                    decimal={PRICE_DECIMAL.VALUE}
                    textStyle={{ fontFamily: CommonStyle.fontPoppinsRegular }}
                />
            </View>

        </View >
    ) : null
}
const RowAccount = React.memo(({ symbol, exchange }) => {
    const accActive = getAccActive()
    const typeAccount = getPorfolioTypeByCode(accActive)
    const currentAccount = useMemo(() => getDicPortfolioType(accActive), [])
    const {
        portfolio_id: accountId,
        portfolio_name: accountName
    } = currentAccount

    return (
        <View style={{ padding: 8 }}>
            <RemakeBoxAccount
                accountId={accountId}
                accountName={accountName}
                typeAccount={typeAccount}
                {...{ symbol, exchange }}
                isSelected={false}
                hideCheckBox={true}
            />
        </View>

    )
})
const InfoAccountCFD = (props) => {
    return (
        <AccountCFD {...props} />
    )
}
export default RowAccount

const styles = StyleSheet.create({})
