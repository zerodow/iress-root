import React, { Component, useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { connect, useDispatch } from 'react-redux'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Langue
import I18n from '~/modules/language/';

import Ionicons from 'react-native-vector-icons/Ionicons';

import * as FunctionUtil from '~/lib/base/functionUtil';
import { dataStorage, func } from '~/storage'
import { changeLoading, changeTextSearch, resetSearchSymbol } from './redux/actions'
import ENUM from '~/enum'
const { ID_ELEMENT, SYMBOL_CLASS, SYMBOL_CLASS_QUERY, NAME_PANEL } = ENUM;

export function addSymbolInfoToDic(data) {
    // {
    //     "symbol": "CYM",
    //     "exchange": "ASX",
    //     "updated": 1589009286175,
    //     "symbol_info": {
    //         "symbol": "CYM",
    //         "exchanges": [
    //             "ASX"
    //         ],
    //         "display_name": "CYM.ASX",
    //         "class": "equity",
    //         "company": "Cyprium Metals Limited",
    //         "company_name": "Cyprium Metals Limited"
    //     }
    // }
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element) {
            func.addSymbol({
                ...element
            })
        }
    }
}

function HandleSearch({ updateResult, textSearch, classFilter, changeLoading }) {
    const timeout = useRef(null)
    const dispatch = useDispatch()
    const onUpdateResult = useCallback((data) => {
        updateResult && updateResult(data)
    }, [])
    useEffect(() => {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
        timeout.current = setTimeout(() => {
            if (textSearch === '') {
                FunctionUtil.getSearchSymbolReccent({
                    cb: (data) => {
                        addSymbolInfoToDic(data)
                        onUpdateResult(data)
                        changeLoading(false)
                    }
                })
            } else {
                const cbSearch = (data) => {
                    addSymbolInfoToDic(data)
                    onUpdateResult(data)
                    changeLoading(false)
                }
                FunctionUtil.searchResponse({ textSearch, cb: cbSearch, classQuery: SYMBOL_CLASS_QUERY[classFilter] });
            }
        }, 500);
        return () => changeLoading && changeLoading(true)
    }, [textSearch, classFilter])
    useEffect(() => {
        return () => dispatch(resetSearchSymbol())
    }, [])
    return null
}

function mapStateToProps(state) {
    const textSearch = state.searchSymbol.textSearch;
    const classFilter = state.searchSymbol.classFilter
    return {
        textSearch: textSearch,
        classFilter
    };
}
function mapActionToProps(dispatch) {
    return {
        changeLoading: p => dispatch(changeLoading(p))
    }
}
export default connect(mapStateToProps, mapActionToProps)(HandleSearch);
