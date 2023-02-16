import React, { useEffect, useLayoutEffect } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';

export const HandleLoading = React.memo(({ refLoading, resetList }) => {
    const isLoadingApi = useSelector(
        (state) => state.loading.effects.marketActivity.getMarketWatchlist, shallowEqual
    );
    const { isLoadingErrorSystem } = useLoadingErrorSystem()
    const isLoading = isLoadingApi || isLoadingErrorSystem
    useLayoutEffect(() => {
        if (isLoading) {
            refLoading.current && refLoading.current.start && refLoading.current.start()
            resetList && resetList()
        } else {
            refLoading.current && refLoading.current.stop && refLoading.current.stop()
        }
    }, [isLoading])
    return null
}, () => true)
