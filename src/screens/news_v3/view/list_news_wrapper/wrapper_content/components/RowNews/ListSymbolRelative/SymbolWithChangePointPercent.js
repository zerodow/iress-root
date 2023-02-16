import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useMemo, useContext } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import ChangeInfo from '~/screens/news_v3/view/detail/ChangeInfo.js'
import { ViewSmartAccountName } from '~/screens/order/components/Detail/SearchAccount.js'
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
// Redux
import { connect } from 'react-redux'
//
import { func } from '~/storage'
import * as Business from '~/business'
import * as ContentModel from '~/screens/news_v3/model/content.model.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
export const NameSymbol = ({ symbol, isLoading, exchange }) => {
    const displayName = useMemo(() => {
        return Business.getDisplayName({ symbol, exchange })
    }, [symbol, exchange])
    const isTradingHalt = useMemo(() => {
        return func.getHaltSymbol(symbol) ? `${func.getHaltSymbol(symbol)}` : ''
    }, [symbol, isLoading])
    return (
        <Text numberOfLines={1} style={{ marginRight: 4 }}>
            {
                isTradingHalt && <Text style={{
                    fontFamily: CommonStyle.fontPoppinsBold,
                    fontSize: CommonStyle.fontSizeXS,
                    color: CommonStyle.fontRed,
                    marginRight: 8
                }}>
                    {`${isTradingHalt} `}
                </Text>
            }
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeXS,
                color: CommonStyle.fontColor,
                marginRight: 4,
                opacity: 0.5
            }}>{displayName}</Text>
        </Text>
    )
}
/**
 * Value
 * {
        displayName: 'SIY.ASX',
        changePercent: 2
    }
 */
const ChangePercent = ({ symbol, isLoading, exchange }) => {
    const [staticLoading, setStaticLoading] = useState(false)
    const preListSymbol = ContentModel.getListPreSymbol()
    useEffect(() => {
        if (isLoading) {
            if (!preListSymbol[`${symbol}.${exchange}`]) {
                setStaticLoading(true)
            }
        } else {
            setStaticLoading(false)
        }
    }, [isLoading, preListSymbol])
    return useMemo(() => (
        <ViewLoading wrapperStyle={{ justifyContent: 'center' }} isLoading={staticLoading} >
            <ChangeInfo symbol={symbol} exchange={exchange} data={{}} />
        </ViewLoading> // props symbol + exchange
    ), [symbol, exchange, staticLoading])
}

// Format data ['ASX','ANZ','BHP']
export default ({ index, symbol, isLoading, exchange, numberMore }) => {
    console.log('', numberMore)
    const displayName = useMemo(() => {
        return Business.getDisplayName({ symbol, exchange })
    }, [symbol, exchange])
    const isTradingHalt = useMemo(() => {
        return func.getHaltSymbol(symbol) || ''
    }, [symbol, isLoading])
    if (index === 1) {
        return (
            <View style={{ flexDirection: 'row', flex: 1 }}>
                <View style={{
                    flexDirection: 'row',
                    paddingHorizontal: 8,
                    marginRight: 4,
                    paddingTop: 2,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: CommonStyle.color.dusk_tabbar
                }}>
                    <NameSymbol isLoading={isLoading} exchange={exchange} symbol={symbol} />
                    <ChangePercent isLoading={isLoading} symbol={symbol} exchange={exchange} />
                </View>
                <NumberMore numberMore={numberMore} />
            </View>
        )
    } else {
        return (
            <View style={{
                flexDirection: 'row',
                paddingHorizontal: 8,
                marginRight: 4,
                paddingTop: 2,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: CommonStyle.color.dusk_tabbar
            }}>
                <NameSymbol isLoading={isLoading} exchange={exchange} symbol={symbol} />
                <ChangePercent isLoading={isLoading} symbol={symbol} exchange={exchange} />
            </View>
        )
    }
}
const NumberMore = ({ numberMore }) => {
    if (numberMore <= 0) return null
    return <View style={{
        paddingHorizontal: 4,
        backgroundColor: CommonStyle.color.dusk_tabbar,
        paddingTop: 2,
        marginRight: 4,
        borderRadius: 4,
        alignSelf: 'center'
    }}>
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeTen,
            color: CommonStyle.fontColor
        }}>
            {`${'+'}${numberMore}`}
        </Text>
    </View>
}
