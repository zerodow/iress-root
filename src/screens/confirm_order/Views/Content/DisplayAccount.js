import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import BoxAccount from '~/component/ListBoxAccount/BoxAccount.js'
import RemakeBoxAccount from '~/component/ListBoxAccount/RemakeBoxAccount.js'
import { dataStorage, func } from '~/storage';
import { getAccActive, getPorfolioTypeByCode, getDicPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'

import { useShadow } from '~/component/shadow/SvgShadow'
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController'
import CommonStyle from '~/theme/theme_controller'
import { setInitialMarginPercent, setBalance } from '~/screens/confirm_order/HandleGetInitialMargin.js'
const DisplayAccount = ({ symbol, exchange }) => {
    const accActive = getAccActive()
    const typeAccount = getPorfolioTypeByCode(accActive)
    const currentAccount = useMemo(() => getDicPortfolioType(accActive), [])
    // const [dataOrder, setDataOrder] = useState({})

    const [ShadowRowInfoPrice, onLayout] = useShadow()

    return (
        <View onLayout={onLayout} style={{
            backgroundColor: CommonStyle.backgroundColor
        }}>
            <View style={{}}>
                <ShadowRowInfoPrice></ShadowRowInfoPrice>
            </View>
            <View style={{ paddingHorizontal: 8 }}>
                <RemakeBoxAccount
                    onDataBalance={(data) => {
                        setBalance(data)
                    }}
                    style={{
                        flex: 1
                    }}
                    hideCheckBox={true}
                    isSelected={true}
                    typeAccount={typeAccount}
                    {...{ accountId: currentAccount.portfolio_id, accountName: currentAccount.portfolio_name }}
                    {...{ symbol, exchange }}
                    borderColor={CommonStyle.color.dusk}
                />
            </View>
            <View style={{ height: 8, backgroundColor: CommonStyle.backgroundColor }} />
        </View>
    )
}
DisplayAccount.propTypes = {}
DisplayAccount.defaultProps = {}
export default DisplayAccount
