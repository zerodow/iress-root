import React, { Component, useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Langue
import I18n from '~/modules/language/';

import Ionicons from 'react-native-vector-icons/Ionicons';

import * as FunctionUtil from '~/lib/base/functionUtil';
import { dispatch, getGlobalState } from '~/memory/controller'
import * as ManageAppState from '~/manage/manageAppState';
import { dataStorage, func } from '~/storage'
import { changeLoading, changeTextSearch, changeClassFilter } from './Redux/actions'
import ENUM from '~/enum'
import ScreenId from '~/constants/screen_id';
import _ from 'lodash'
const { ID_ELEMENT, SYMBOL_CLASS, SYMBOL_CLASS_QUERY, FILTER_WARRANT, NAME_PANEL } = ENUM;

export function addSymbolInfoToDic(data) {
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element) {
            func.addSymbol({
                ...element
            })
        }
    }
}
const filterListSystemWL = (priceBoard = {}) => {
    const listSystemWL = []
    Object.keys(priceBoard).map((item) => {
        const systemWL = priceBoard[item] || {}
        const { isIress } = systemWL
        isIress && listSystemWL.push(systemWL)
    })
    return listSystemWL
}
function HandleSearch({ updateResult, textSearch, classFilter, changeLoading, changeClassFilter }) {
    const timeout = useRef(null)
    const dic = useRef({
        init: true,
        textSearch: textSearch,
        filterClass: classFilter
    })
    const onUpdateResult = useCallback((data) => {
        updateResult && updateResult(data)
    }, [])
    useEffect(() => {
        dic.current.textSearch = textSearch
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
        timeout.current = setTimeout(() => {
            if (dic.current.classFilter === FILTER_WARRANT.WATCHLIST) {
                /**
                * Search cac bang gia system watchlist
                */
                const store = getGlobalState()
                const { priceBoard = {} } = store
                const { staticPriceBoard = {} } = priceBoard
                const allSystemPriceBoards = _.values(staticPriceBoard)
                const data = FunctionUtil.searchSystemWatchlist(allSystemPriceBoards, textSearch)
                onUpdateResult(data)
                changeLoading(false)
            } else {
                if (textSearch === '') {
                    FunctionUtil.getSearchSymbolReccent({
                        cb: (data) => {
                            if (dic.current.textSearch === '') {
                                addSymbolInfoToDic(data)
                                onUpdateResult(data)
                                changeLoading(false)
                            }
                        }
                    })
                } else {
                    const cbSearch = (data, classQuery, textQuery) => {
                        if (dic.current.textSearch === textQuery) {
                            addSymbolInfoToDic(data)
                            onUpdateResult(data)
                            changeLoading(false)
                        }
                    }
                    FunctionUtil.searchResponse({ textSearch, cb: cbSearch, classQuery: classFilter });
                }
            }
        }, 500);
        return () => changeLoading && changeLoading(true)
    }, [textSearch])
    useEffect(() => {
        dic.current.classFilter = classFilter
        const cbSearch = (data, classQuery) => {
            if (dic.current.classFilter === classQuery) {
                addSymbolInfoToDic(data)
                onUpdateResult(data)
                changeLoading(false)
            }
        }
        const cbSearchWatchlist = (data, classQuery) => {
            if (dic.current.classFilter === classQuery) {
                onUpdateResult(data)
                changeLoading(false)
            }
        }
        if (!dic.current.init) {
            if (classFilter === FILTER_WARRANT.WATCHLIST) {
                /**
                 * Search cac bang gia system watchlist
                 */
                const store = getGlobalState()
                const { priceBoard = {} } = store
                const { staticPriceBoard = {} } = priceBoard
                const allSystemPriceBoards = _.values(staticPriceBoard)
                const data = FunctionUtil.searchSystemWatchlist(allSystemPriceBoards, textSearch)
                setTimeout(() => {
                    cbSearchWatchlist(data, classFilter)
                }, 500);
            } else {
                FunctionUtil.searchResponse({ textSearch: dic.current.textSearch, cb: cbSearch, classQuery: classFilter });
            }
        } else {
            dic.current.init = false
        }
        return () => {
            changeLoading && changeLoading(true)
        }
    }, [classFilter])
    const reloadScreen = useCallback(() => {
        const cbSearch = (data, classQuery) => {
            if (dic.current.textSearch === '') {
                return FunctionUtil.getSearchSymbolReccent({
                    cb: (data) => {
                        if (dic.current.textSearch === '') {
                            addSymbolInfoToDic(data)
                            onUpdateResult(data)
                            changeLoading(false)
                        }
                    }
                })
            }
            if (dic.current.classFilter === classQuery) {
                addSymbolInfoToDic(data)
                onUpdateResult(data)
                changeLoading(false)
            }
        }
        FunctionUtil.searchResponse({ textSearch: dic.current.textSearch, cb: cbSearch, classQuery: dic.current.classFilter });
    }, [])
    useEffect(() => {
        ManageAppState.registerAppStateChangeHandle(ScreenId.SEARCH_AND_ADD_SYMBOL, reloadScreen)
        return () => {
            changeClassFilter && changeClassFilter(SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES])
        }
    }, [])
    return null
}

function mapStateToProps(state) {
    const textSearch = state.addSymbol.textSearch;
    const classFilter = state.addSymbol.classFilter
    return {
        textSearch: textSearch,
        classFilter
    };
}
function mapActionToProps(dispatch) {
    return {
        changeLoading: p => dispatch(changeLoading(p)),
        changeClassFilter: p => dispatch(changeClassFilter(p))
    }
}
export default connect(mapStateToProps, mapActionToProps)(HandleSearch);
