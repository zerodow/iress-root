import React, { useState, useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions } from 'react-native'
import TradeButton from './TradeButton'
import I18n from '~/modules/language/'
import orderTypeEnum from '~/constants/order_type';

import CommonStyle from '~/theme/theme_controller'

import TabShape from '~/component/tabs_shape/index.js'
import { getDisableTabBuySell } from '~/screens/new_order/Model/TabModel.js'
import { setType, getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import Enum from '~/enum'
export const TYPE = {
    BUY: 'BUY',
    SELL: 'SELL'
}
const { width } = Dimensions.get('window')
const grat = 6
const padding = 4
const margin = 8
const widthTab = ((width / 2) - margin * 2 + (grat - padding)) / 2
function BuySell({
    isBuy,
    orderType,
    changeBuySell,
    symbol,
    exchange,
    disableChangeTab,
    ...rest
}) {
    const dic = useRef({ init: true, orderType: orderType })
    const disableBuySell = getType() !== Enum.AMEND_TYPE.DEFAULT // Check neu la amend thi disable TabSize
    const [disabled, setDisable] = useState(null)
    const onChangeTab = useCallback(({ key }) => {
        if (key === 'BUY') {
            onClickBuy()
        } else {
            onClickSell()
        }
    }, [])
    const onClickBuy = useCallback(() => {
        changeBuySell && changeBuySell(true)
    }, [])
    const onClickSell = useCallback(() => {
        changeBuySell && changeBuySell(false)
    }, [])
    const xx = [
        {
            title: 'BUY',
            key: 'BUY',
            value: 'BUY',
            forceFillColor: CommonStyle.fontOceanGreen,
            disabled: disableBuySell && !isBuy
        },
        {
            title: 'SELL',
            key: 'SELL',
            value: 'SELL',
            forceFillColor: CommonStyle.fontOceanRed,
            disabled: disableBuySell && isBuy
        }
    ]
    return (
        <View style={{
            flexDirection: 'row'
        }}>
            <TabShape tabs={[
                {
                    title: 'BUY',
                    key: 'BUY',
                    value: 'BUY',
                    forceFillColor: CommonStyle.color.buy_Order,
                    disabled: disableBuySell && !isBuy
                },
                {
                    title: 'SELL',
                    key: 'SELL',
                    value: 'SELL',
                    forceFillColor: CommonStyle.color.backSell,
                    disabled: disableBuySell && isBuy
                }
            ]}
                disableChangeTab={disableBuySell}
                onChangeTab={onChangeTab}
                tabWidth={widthTab}
                defaultActive={isBuy ? 'BUY' : 'SELL'}
                tabHeight={31}
                grat={grat}
                strockWidth={'1'}
                padding={padding}
                strockColor={CommonStyle.color.dusk}
                fillColorDisabled={CommonStyle.color.dark}
                fillColorDefault={CommonStyle.backgroundColor}
                fillColorActive={CommonStyle.color.modify}
                styleTextDefault={
                    {
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontNearLight4
                    }
                }
                styleTextActive={
                    {
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontDark
                    }
                }
            />
        </View>
    )
}

export default BuySell
