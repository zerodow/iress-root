import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useMemo } from 'react';
import { Text, View, TouchableOpacity, FlatList, Platform } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Until
import {
    getSymbolInfoFromListSymbol
} from '~/lib/base/functionUtil';
// Component
import SymbolWithChangePointPercent from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/ListSymbolRelative/SymbolWithChangePointPercent.js'
import NameCompany from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/ListSymbolRelative/NameCompany.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import DotGray from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/DotGray.js'

const listSymbolFAKE = ['THC', 'BHP', 'MQG', 'AAA', 'NAB', 'A2M', 'SIY', 'SCG', 'RIO', 'CBA']
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
const NumberMore = ({ numberMore }) => {
    return (
        <Text style={{ fontFamily: CommonStyle.fontPoppinsBold, fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, paddingHorizontal: 4, backgroundColor: CommonStyle.color.dusk }}>
            {`${'+'}${numberMore}`}
        </Text>
    )
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
export default ListSymbolRelative = ({ listSymbol, isLoadingSymbol }) => {
    if (listSymbol.length === 0) return null
    const [listSymbolLimit] = useSliceSymbolLimit(listSymbol)
    return (
        <View>
            <View style={{
                height: 1,
                backgroundColor: CommonStyle.color.dusk_tabbar
            }} />
            <View style={{
                paddingVertical: 4,
                width: '100%',
                paddingHorizontal: 8
            }}>
                <ViewLoading key={'change#info'} isLoading={false}>
                    <View style={{ flexDirection: 'row', alignItem: 'center' }}>
                        {
                            listSymbolLimit.map((el, index) => {
                                const symbolWithExchange = el.split('.')
                                const symbol = symbolWithExchange[0]
                                const exchange = symbolWithExchange[1]
                                return <View
                                    key={`SymbolWithChangePointPercent#${index}`}
                                    style={{
                                        flexDirection: 'row',
                                        alignItem: 'center',
                                        flex: index === 1 ? 1 : 0
                                    }}
                                >
                                    <SymbolWithChangePointPercent numberMore={listSymbol.length - 2 > 10 ? 10 : listSymbol.length - 2} index={index} exchange={exchange} isLoading={false} symbol={symbol} />
                                </View>
                            })
                        }
                    </View>
                </ViewLoading>
            </View>
        </View>

    )
}
