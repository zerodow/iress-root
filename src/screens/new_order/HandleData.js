import React, { useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import _ from 'lodash';

import { changeLoading } from '~/screens/new_order/Redux/actions.js';
export function HandleDataFake() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(changeLoading(false))
    }, [])
    return null
}

let HandleDataDetail = ({ listSymbol = [] }, ref) => {
    const dispatch = useDispatch()
    const dic = useRef({})
    const getSnapshot = useCallback(() => {
        const { symbol, exchange } = listSymbol[0] || {}
        onLoading()
        dispatch.quotes.getSnapshot({ listSymbol, cb: onLoadingDone });
        dispatch.depths.getSnapshot({ symbol, exchange });
    }, [listSymbol])
    const onLoading = useCallback(() => {
        dispatch(changeLoading(true))
    }, [])
    const onLoadingDone = useCallback(() => {
        dispatch(changeLoading(false))
    }, [])
    const unSubAll = useCallback((prevListSymbol) => {
        const { symbol, exchange } = prevListSymbol || {}
        dispatch.quotes.unSub({ symbol, exchange }); // Unsub old symbol
    }, [])
    const subLv1 = useCallback(() => {
        const { symbol, exchange } = listSymbol[0] || {}
        dispatch.quotes.getSnapshot({ listSymbol, cb: onLoadingDone });
        dispatch.quotes.sub({ symbol, exchange });
    }, [listSymbol])
    const subLv2 = useCallback(() => {
        const { symbol, exchange } = listSymbol[0] || {}
        dispatch.depths.getSnapshot({ symbol, exchange });
        dispatch.depths.sub({ symbol, exchange });
    }, [listSymbol])
    useEffect(() => {
        const prevListSymbol = dic.current.prevListSymbol
        dic.current.prevListSymbol = listSymbol
        subLv1()
        subLv2()
        return () => unSubAll(prevListSymbol)
    }, [listSymbol])
    useImperativeHandle(ref, () => {
        return {
            getSnapshot
        }
    })
    return null
}
HandleDataDetail = React.forwardRef(HandleDataDetail)
export default HandleDataDetail
