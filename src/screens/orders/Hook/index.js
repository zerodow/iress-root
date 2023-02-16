import React, { useRef, useCallback } from 'react'
export function useShowDetail() {
    const refDetail = useRef({})
    const showDetail = useCallback((data) => {
        refDetail.current && refDetail.current.changeOrderDetail && refDetail.current.changeOrderDetail(data)
    }, [refDetail.current])
    const hideDetail = useCallback(() => {
        refDetail.current && refDetail.current.onCloseDetail && refDetail.current.onCloseDetail()
    }, [refDetail.current])
    const updateDataRealtime = useCallback((data) => {
        refDetail.current && refDetail.current.updateDataRealtime && refDetail.current.updateDataRealtime(data)
    }, [refDetail.current])
    return [refDetail, showDetail, hideDetail, updateDataRealtime]
}

export function useSearchOrders() {
    const refSearch = useRef({})
    const blurSearch = useCallback(() => {
        refSearch.current && refSearch.current.blur && refSearch.current.blur()
    }, [refSearch.current])
    const clearText = useCallback(() => {
        refSearch.current && refSearch.current.clearText && refSearch.current.clearText()
    }, [refSearch.current])
    return [refSearch, blurSearch, clearText]
}
