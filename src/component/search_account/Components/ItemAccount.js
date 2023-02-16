import React, { useCallback, useState, useMemo } from 'react'
import {
    View, Text, TouchableOpacity,
    TouchableWithoutFeedback, StyleSheet,
    Keyboard, Dimensions
} from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { BoxCheck } from '~/component/search_account/Views/Content.js'
import { changeLoadingState, resetPLState } from '~s/portfolio/Redux/actions'
import { setAccActive, getAccActive, setReduxAccActive } from '~s/portfolio/Model/PortfolioAccountModel'
import { setAccActiveLocalStorage, updateListPortfolioType } from '~s/portfolio/Controller/PortfolioAccountController'
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController'
import { resetStateNewOrder, resetStateWhenChangeAccount } from '~/screens/new_order/Redux/actions.js'
import { func, dataStorage } from '~/storage';

const { height: DEVICE_HEIGHT } = Dimensions.get('window')

const AccountType = ({ item }) => {
    const { portfolio_type: accountType } = item
    const title = I18n.t('userType')
    if (!accountType) return null
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text numberOfLines={1} style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontNearLight6,
                marginRight: 6
            }}>
                {title}
            </Text>
            <Text numberOfLines={1} style={{
                textAlign: 'right',
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontColor
            }}>
                {accountType.charAt(0).toUpperCase() + accountType.slice(1)}
            </Text>
        </View>
    )
}

export const ItemAccount = ({ item, index, hide, hideDetailPortfolio, setSpaceTop, cbSelectAccount }) => {
    const accActive = useSelector(state => state.portfolio.accActive, shallowEqual)
    const dispatch = useDispatch()
    const { portfolio_id: accountId, portfolio_name: accountName, ...rest } = item
    const onSelectAccount = useCallback(() => {
        Keyboard.dismiss()
        if (accountName == null) return;
        const preAccountActive = getAccActive()
        // Neu chon dung account dang active thi chi cap nhat recent va dong panel
        cbSelectAccount && cbSelectAccount()
        if (preAccountActive === accountId) {
            func.setReccentAccount({
                portfolio_name: accountName,
                portfolio_id: accountId,
                ...rest
            })
            return hide && hide()
        }
        hideDetailPortfolio && hideDetailPortfolio()
        updateListPortfolioType({
            portfolio_name: accountName, portfolio_id: accountId, ...rest
        })
        dispatch(resetStateWhenChangeAccount())
        setReduxAccActive(accountId)
        setAccActive(accountId)
        setAccActiveLocalStorage(accountId)
        setSpaceTop && setSpaceTop()
        setSpaceTop && setTimeout(() => {
            dispatch(changeLoadingState(true))
            dispatch(resetPLState())
            getPortfolioTotal(accountId)
        }, 100)
        func.setReccentAccount({
            portfolio_name: accountName,
            portfolio_id: accountId,
            ...rest
        })
        hide && hide()
    }, [accountId, accountName])
    const isSelected = useMemo(() => {
        return accountId === accActive
    }, [accountId, accActive])
    return (
        <TouchableOpacity onPress={onSelectAccount} style={[
            styles.boxAccount,
            {
                marginTop: 8,
                flexDirection: 'row',
                alignItems: 'center'
            },
            isSelected
                ? { borderWidth: 1, borderColor: CommonStyle.color.select }
                : { borderWidth: 1, borderColor: CommonStyle.color.unselect }
        ]}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.textAccount}>
                        Account
                    </Text>
                    <Text style={[styles.textId, { marginLeft: 12 }]}>
                        {accountId}
                    </Text>
                </View>
                <AccountType item={item} />
                <Text style={[styles.textNameAccount]}>
                    {accountName}
                </Text>
            </View>
            <BoxCheck isSelected={isSelected} />
        </TouchableOpacity>
    )
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    textAccount: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontNearLight6
    },
    textId: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontColor
    },
    textNameAccount: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontColor
    },
    boxAccount: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: CommonStyle.color.dusk,
        borderRadius: 8,
        backgroundColor: CommonStyle.backgroundColor
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default ItemAccount
