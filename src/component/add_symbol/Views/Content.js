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
import ListLoading from '~/component/add_symbol/Components/FlatListSequenceAnimation/index.js'
import * as Animatable from 'react-native-animatable'
import SvgIcon from '~/component/svg_icon/SvgIcon.js'
import Flag from '~/component/flags/flagIress.js'

import * as ContentModel from '~/component/add_symbol/Models/Content.js'

import * as Controller from '~/memory/controller';
import { func, dataStorage } from '~/storage';
import * as Business from '~/business'
import * as Channel from '~/streaming/channel.js'
import { changeLoading } from '~/screens/new_order/Redux/actions.js';
import ENUM from '~/enum'
import { ScrollView } from 'react-native-gesture-handler';
import * as FunctionUtil from '~/lib/base/functionUtil';
let top = FunctionUtil.getTopPanel()
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
        </View>
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
    symbolObject,
    forwardContext
}) => {
    const [isSelected, updateSelected] = useState(ContentModel.isSelected({ symbol, exchange }))
    const onSelect = useCallback(() => {
        Keyboard.dismiss()
        func.setReccentSearchSymbol && func.setReccentSearchSymbol(symbolObject)
        ContentModel.addSymbolSelected({ symbol, exchange, isSelected: !isSelected })
        updateSelected(!isSelected)
    }, [symbol, exchange, isSelected])

    // Clear Model
    // useEffect(() => {
    //     return ContentModel.clearSymbolSelected()
    // }, [])
    return (
        <TouchableOpacity onPress={onSelect} style={[styles.boxRow, { marginTop: index === 0 ? 0 : 8 }, isSelected ? { borderWidth: 1, borderColor: CommonStyle.fontColorButtonSwitch } : {}]}>
            <Flag {...{ symbol, exchange }} />
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
            <BoxCheck isSelected={isSelected} />
        </TouchableOpacity>
    )
})
export const BoxCheck = ({ isSelected }) => {
    if (isSelected) {
        return (
            <SvgIcon size={22} name='added' color={CommonStyle.color.modify} />
        )
    }
    return (
        <SvgIcon size={22} name='noun_push' color={CommonStyle.fontWhite} />
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
    const isLoading = state.addSymbol.isLoading
    return {
        isLoading: isLoading
    }
}
const SearchSymbolContent = ({ symbol: symbolSelected, exchange: exchangeSelected, dicSymbolSelected, forwardContext, isLoading }) => {
    useMemo(() => {
        ContentModel.init({ ...dicSymbolSelected } || {})
    }, [])
    const [data, setData] = useState([])
    useOnListenClearRecent({ setData })
    const dismissKeyboard = useCallback(() => {
        Keyboard.dismiss();
    }, [])
    return (
        <React.Fragment>
            <Animatable.View pointerEvents={'none'} duration={isLoading ? 1 : 500} animation={isLoading ? 'fadeIn' : 'fadeOut'} style={[StyleSheet.absoluteFillObject, { zIndex: 999, paddingTop: 8 }]}>
                <PureFunction
                    dependency={[isLoading]}
                >
                    <ListLoading
                        style={{
                            paddingHorizontal: 8
                        }}
                        isLoading={isLoading}
                        data={fakeDataNews} />
                </PureFunction>
            </Animatable.View>
            {
                !isLoading && (
                    <Animatable.View style={{
                        flex: 1,
                        paddingHorizontal: 8,
                        paddingTop: 8
                    }} animation={'fadeIn'} >
                        {
                            data.length > 0 && <ScrollView
                                onScrollBeginDrag={dismissKeyboard}
                                keyboardShouldPersistTaps={'always'}
                                contentContainerStyle={{ flexGrow: 1 }}>
                                {
                                    data.map((item, index) => {
                                        if (!item.symbol) return null
                                        const { symbol, company_name: companyName, class: classSymbol, exchanges, display_name: displayName } = item
                                        const exchange = exchanges[0]
                                        return (
                                            <BoxSymbol
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
                                    })
                                }
                                {data.length > 0 && <View style={{ height: 16 }} />}
                            </ScrollView>
                        }
                        {
                            data.length === 0 && (<View style={{ flex: 1, justifyContent: 'center' }} ><NoData /></View>)
                        }
                    </Animatable.View>
                )
            }
            <HandleSearch updateResult={setData} />
        </React.Fragment>
    )
}
export default connect(mapStateToProps)(SearchSymbolContent)
const PureFunction = ({ dependency = [], children }) => {
    return useMemo(() => {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        )
    }, dependency)
}
export const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
        boxRow: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: CommonStyle.color.dusk,
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
            fontFamily: CommonStyle.fontPoppinsRegular,
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
