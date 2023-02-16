import React, { useEffect, useRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import _ from 'lodash';

let HandleDataDetail = ({ data }) => {
    const listSymbol = useMemo(() => {
        if (data) {
            const list = []
            data.map((item, index) => {
                const getDisplayName = item.symbol.split('.')
                const symbol = getDisplayName[0]
                const exchange = getDisplayName[1]

                list.push({
                    symbol: symbol + '',
                    exchange: exchange + '',
                    rank: index
                })
            })
            return list
        } else {
            return []
        }
    }, [data])
    const dispatch = useDispatch()
    const dic = useRef({})
    const getSnapshot = useCallback(() => {
        onLoading()
        dispatch.quotes.getSnapshot({ listSymbol, cb: onLoadingDone });
    }, [listSymbol])
    const onLoading = useCallback(() => {
        dispatch.alertLog.changeLoading(true)
    }, [])
    const onLoadingDone = useCallback(() => {
        dispatch.alertLog.changeLoading(false)
    }, [])
    const unSubAll = useCallback((prevListSymbol) => {
        const { symbol, exchange } = prevListSymbol || {}
        dispatch.quotes.unSub({ symbol, exchange }); // Unsub old symbol
    }, [])
    const subLv1 = useCallback(() => {
        dispatch.quotes.getSnapshot({ listSymbol, cb: onLoadingDone });
        dispatch.quotes.subMultiply({ listSymbol });
    }, [listSymbol])
    useEffect(() => {
        const prevListSymbol = dic.current.prevListSymbol
        dic.current.prevListSymbol = listSymbol
        subLv1()
        return () => unSubAll(prevListSymbol)
    }, [listSymbol])
    // useImperativeHandle(ref, () => {
    //     return {
    //         getSnapshot
    //     }
    // })
    return null
}
HandleDataDetail = React.forwardRef(HandleDataDetail)
export default HandleDataDetail
