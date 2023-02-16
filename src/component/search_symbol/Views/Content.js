import React, { Component, useCallback, useState, useMemo, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';
import HandleSearch from '../HandleSearchComp'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Langue
import I18n from '~/modules/language/';

import Ionicons from 'react-native-vector-icons/Ionicons';
import RowLoading from '~/component/search_symbol/Components/FlatListSequenceAnimation/index.js'
import * as Animatable from 'react-native-animatable'

import * as Controller from '~/memory/controller';
import { func, dataStorage } from '~/storage';
import * as Business from '~/business'
import * as Channel from '~/streaming/channel.js'
import { changeLoading } from '~/screens/new_order/Redux/actions.js';
import ENUM from '~/enum'
const { NAME_PANEL } = ENUM;
const { height: heightDevice } = Dimensions.get('window')
const fakeDataNews = [
    {
        'news_id': 1038017311455314439
    },
    {
        'news_id': 1038017311455314440
    },

    {
        'news_id': 1038017311455314441
    },

    {
        'news_id': 1038017311455314442
    },

    {
        'news_id': 1038017311455314443
    },

    {
        'news_id': 1038017311455314444
    },

    {
        'news_id': 1038017311455314445
    },

    {
        'news_id': 1038017311455314446
    },

    {
        'news_id': 1038017311455314447
    }
]
export const BoxClass = ({ className }) => {
    const { text, color } = Business.getClassTagProperty({ classSymbol: className })
    return (
        <View style={[styles.boxClass, { marginTop: 4, marginLeft: 8, backgroundColor: color }]}>
            <Text style={[styles.textClass]}>
                {text}
            </Text>
        </View >
    )
}
const mapDispatchToProps = (dispatch) => ({
    changeLoadingState: (...p) =>
        dispatch(changeLoading(...p))
});
const BoxSymbol = connect(null, mapDispatchToProps)(({
    displayName,
    companyName,
    cbSelect,
    index,
    classSymbol,
    symbol,
    exchange,
    symbolSelected,
    exchangeSelected,
    changeLoadingState,
    symbolObject,
    handleOnPressSymbol
}) => {
    const isSelected = useMemo(() => {
        return symbol === symbolSelected && exchange === exchangeSelected
    }, [exchange, symbolSelected])
    const onSelect = useCallback(() => {
        changeLoadingState && changeLoadingState(true)
        Keyboard.dismiss()
        func.setReccentSearchSymbol && func.setReccentSearchSymbol(symbolObject)
        handleOnPressSymbol && handleOnPressSymbol({ symbol, exchange })
    }, [symbol, exchange])
    return (
        <TouchableOpacity onPress={onSelect} style={[styles.boxRow, { marginTop: index === 0 ? 0 : 8 }, isSelected ? { borderWidth: 1, borderColor: CommonStyle.fontColorButtonSwitch } : {}]}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.textSymbol]}>
                        {displayName}
                    </Text>
                    <BoxClass className={classSymbol} />
                </View>
                <Text style={[styles.textCompany]}>
                    {companyName}
                </Text>
            </View>
            {/* <BoxCheck isSelected={isSelected} /> */}
        </TouchableOpacity>
    )
})
export const BoxCheck = ({ isSelected }) => {
    if (isSelected) {
        return (
            <View
                style={[styles.boxSelected, { backgroundColor: CommonStyle.fontColorButtonSwitch }]}

            >
                <Ionicons size={22} name='md-checkmark' color={CommonStyle.backgroundColor} />
            </View>
        )
    }
    return (
        <View
            style={[styles.boxSelected, { borderWidth: 1, borderColor: CommonStyle.fontBorderGray }]}

        />
    )
}
export function NoData() {
    return (
        <Text style={[CommonStyle.textNoData, { alignSelf: 'center' }]}>{I18n.t('noData')}</Text>
    )
}
function useOnListenClearRecent({ setData }) {
    return useEffect(() => {
        const id = Emitter.addListener(Channel.getChannelClearRecentSymbol(), null, () => {
            setData && setData([])
            func.clearRecentSearchSymbol && func.clearRecentSearchSymbol()
        });
        return () => {
            Emitter.deleteByIdEvent(id)
        }
    }, [])
}
function mapStateToProps(state) {
    const isLoading = state.searchSymbol.isLoading
    return {
        isLoading: isLoading
    }
}
const SearchSymbolContent = ({ symbol: symbolSelected, exchange: exchangeSelected, forwardContext, isLoading, handleOnPressSymbol }) => {
    const [data, setData] = useState([])
    useOnListenClearRecent({ setData })

    return (
        <React.Fragment>
            <Animatable.View pointerEvents={'none'} duration={isLoading ? 1 : 500} animation={isLoading ? 'fadeIn' : 'fadeOut'} style={[StyleSheet.absoluteFillObject, { zIndex: 999, marginTop: 8 }]}>
                <RowLoading style={{
                    paddingHorizontal: 8
                }} isLoading={isLoading} data={fakeDataNews} />
            </Animatable.View>
            <View style={{
                paddingHorizontal: 8,
                flex: 1
            }}>
                {
                    !isLoading && (
                        <Animatable.View style={{
                            flex: 1
                        }} animation={'fadeIn'} >
                            <FlatList
                                keyboardShouldPersistTaps={'always'}
                                style={{
                                    paddingTop: 8
                                }}
                                showsVerticalScrollIndicator={false}
                                data={data}
                                renderItem={({ item, index }) => {
                                    if (!item.symbol) return null
                                    const { symbol, company_name: companyName, class: classSymbol, exchanges, display_name: displayName } = item
                                    const exchange = exchanges[0]
                                    return (
                                        <BoxSymbol
                                            handleOnPressSymbol={handleOnPressSymbol}
                                            forwardContext={forwardContext}
                                            symbolSelected={symbolSelected}
                                            exchangeSelected={exchangeSelected}
                                            classSymbol={classSymbol}
                                            index={index}
                                            displayName={displayName}
                                            companyName={companyName}
                                            key={index}
                                            symbol={symbol}
                                            exchange={exchange}
                                            symbolObject={item}
                                        />
                                    )
                                }}
                            />
                            {
                                data.length === 0 && (<View style={{ height: data.length === 0 ? heightDevice - 60 - 54.5 : 0, justifyContent: 'center' }} ><NoData /></View>)
                            }
                        </Animatable.View>
                    )
                }
                <HandleSearch updateResult={setData} />
            </View>
        </React.Fragment>
    )
}
export default connect(mapStateToProps)(SearchSymbolContent)

export const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
        boxRow: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: CommonStyle.color.dusk_tabbar,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center'
        },
        textSymbol: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeM,
            color: CommonStyle.fontColor
        },
        textCompany: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeTen,
            color: CommonStyle.fontNearLight6
        },
        boxClass: {
            paddingVertical: 2,
            paddingHorizontal: 4,
            borderRadius: 8,
            backgroundColor: 'rgb(8,108,205)',
            alignSelf: 'flex-start'
        },
        textClass: {
            fontSize: CommonStyle.fontMin,
            fontFamily: CommonStyle.fontPoppinsBold,
            color: CommonStyle.fontDark
        },
        boxSelected: {
            height: 32,
            width: 32,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
