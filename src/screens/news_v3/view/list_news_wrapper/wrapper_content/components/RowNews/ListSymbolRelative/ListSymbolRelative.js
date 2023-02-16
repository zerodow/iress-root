import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useMemo } from 'react';
import { Text, View, TouchableOpacity, FlatList, Platform, Dimensions } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Until
import {
    getSymbolInfoFromListSymbol
} from '~/lib/base/functionUtil';
// Component
import SymbolWithChangePointPercent from './SymbolWithChangePointPercent'
import NameCompany from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/ListSymbolRelative/NameCompany.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import DotGray from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/DotGray.js'
import { ViewSmartAccountName } from '~/screens/order/components/Detail/SearchAccount.js'
const { width: DEVICE_WIDTH } = Dimensions.get('window')
const listSymbolFAKE = [
    'NVX.ASX',
    'ASX.ASX',
    'ANZ.ASX',
    'BHP.ASX',
    'THC.ASX',
    'MQG.ASX',
    'NAB.ASX',
    'AMP.ASX',
    'CQG.ASX',
    'UHN.ASX',
    'BGA.ASX',
    'BUP.ASX'
]
const defaultAffectedSymbol = {
    'THC': {
        displayName: 'THC.ASX',
        changePercent: 95
    },
    'BHP': {
        displayName: 'BHP.ASX',
        changePercent: -12
    },
    'MQG': {
        displayName: 'MQG.ASX',
        changePercent: 112
    },
    'AAA': {
        displayName: 'AAA.ASX',
        changePercent: 86
    },
    'NAB': {
        displayName: 'NAB.ASX',
        changePercent: -68
    },
    'A2M': {
        displayName: 'A2M.ASX',
        changePercent: 120
    },
    'SIY': {
        displayName: 'SIY.ASX',
        changePercent: 2
    },
    'SCG': {
        displayName: 'SCG.ASX',
        changePercent: 12
    },
    'RIO': {
        displayName: 'RIO.ASX',
        changePercent: -95
    },
    'CBA': {
        displayName: 'CBA.ASX',
        changePercent: 95
    }
}
const useGetSymbolInfo = ({ listSymbol, setLoadingGetSymbolInfo }) => {
    useEffect(() => {
        const callBack = () => {
            if (Platform.OS === 'android') {
                setTimeout(() => {
                    setLoadingGetSymbolInfo(false)
                }, 500); // truong hop nhanh qua dang bi loi tren android
            } else {
                setLoadingGetSymbolInfo(false)
            }
        }
        getSymbolInfoFromListSymbol(listSymbol, callBack)
    }, [listSymbol])
}
const useSliceSymbolLimit = (listSymbol) => {
    const listSymbolLimit = useMemo(() => {
        return listSymbol.slice(0, 2)
    }, listSymbol)
    return [listSymbolLimit]
}

const Related = ({ item, index, listSymbol, isLoadingSymbolInfo }) => {
    const symbolWithExchange = item.split('.')
    const symbol = symbolWithExchange[0]
    const exchange = symbolWithExchange[1]
    const numberMore = listSymbol.length - 2 > 10 ? 10 : listSymbol.length - 2
    return <View
        key={`SymbolWithChangePointPercent#${symbol}.${exchange}`}
        style={{}}
    >
        <SymbolWithChangePointPercent
            numberMore={numberMore}
            index={index}
            exchange={exchange}
            isLoading={isLoadingSymbolInfo}
            symbol={symbol} />
    </View>
}

export default ListSymbolRelative = ({ listSymbol, isLoading: forceIsLoading, isFake, relatedExchanges }) => {
    if (listSymbol.length === 0) return null
    const [listSymbolLimit] = useSliceSymbolLimit(listSymbol)
    return (
        <NewsWrapperContext.Consumer>
            {
                ({ isLoading, isLoadingAfter, isLoadingSymbolInfo }) => (
                    <React.Fragment>
                        <View style={{
                            height: 1,
                            backgroundColor: CommonStyle.color.dusk_tabbar
                        }} />

                        <View style={{
                            flexDirection: 'row',
                            alignItem: 'center',
                            paddingVertical: 4,
                            width: '100%',
                            paddingHorizontal: 16
                        }}>
                            <ViewLoading
                                wrapperStyle={{ width: '100%' }}
                                // forceStyle={{ alignSelf: 'center' }}
                                key={'change#info'}
                                isLoading={isLoadingAfter || isLoading}>
                                {
                                    listSymbolLimit.map((item, index) => <Related
                                        item={item}
                                        index={index}
                                        listSymbol={listSymbol}
                                        isLoadingSymbolInfo={isLoadingSymbolInfo} />)
                                }
                            </ViewLoading>
                        </View>
                    </React.Fragment>
                )
            }
        </NewsWrapperContext.Consumer>

    )
}
