import React, { Component, useCallback, useState, useEffect, useImperativeHandle, useRef } from 'react';
import { connect, useDispatch, useSelector, shallowEqual } from 'react-redux'
// Style
import * as FunctionUtil from '~/lib/base/functionUtil';
import { changeLoading } from '~/component/search_account/redux/actions.js'
import { search } from './Controller/SearchController'
import { dataStorage, func } from '~/storage'
export const useRefHandleSearch = () => {
    const refHandleSearch = useRef()
    const handleSearchRecent = useCallback(() => {
        try {
            refHandleSearch.current.handleSearchRecent()
        } catch (error) {

        }
    }, [])
    return { refHandleSearch, handleSearchRecent }
}
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
        if (element.symbol_info) {
            func.addSymbol({
                ...element
            })
        }
    }
}
const HandleSearch = React.forwardRef(({ updateResult }, ref) => {
    const dispatch = useDispatch()
    const handleChangeLoading = useCallback((p) => {
        dispatch(changeLoading(p))
    }, [])
    const textSearch = useSelector(state => state.searchAccount.textSearch, shallowEqual)
    const onUpdateResult = useCallback((data) => {
        updateResult && updateResult(data)
    }, [])
    const handleSearchRecent = useCallback(() => {
        handleChangeLoading && handleChangeLoading(true)
        search({ textSearch: '' }).then(data => {
            handleChangeLoading && handleChangeLoading(false)
            onUpdateResult(data)
        }).catch(() => {
            handleChangeLoading && handleChangeLoading(false)
            onUpdateResult([])
        });
    }, [])
    useImperativeHandle(ref, () => {
        return { handleSearchRecent }
    })
    useEffect(() => {
        handleChangeLoading && handleChangeLoading(true)
        search({ textSearch: textSearch.trim() }).then(data => {
            handleChangeLoading && handleChangeLoading(false)
            onUpdateResult(data)
        }).catch(() => {
            handleChangeLoading && handleChangeLoading(false)
            onUpdateResult([])
        });
        return () => handleChangeLoading && handleChangeLoading(true)
    }, [textSearch])
    return null
})
export default HandleSearch
