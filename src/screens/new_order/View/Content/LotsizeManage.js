import React, { useEffect, useCallback } from 'react'
import { getLotSizeBySymbolAndExchange } from '~/business'
import { getSymbolInfoApi } from '~/lib/base/functionUtil'
import ENUM from '~/enum'
const { LOT_SIZE_EXCHANGE_BY_SYMBOL, METHOD_GET_LOT_SIZE_BY_EXCHANGE } = ENUM
export function checkFnUseToGetLotSize({ exchange }) {
    if (LOT_SIZE_EXCHANGE_BY_SYMBOL.includes(exchange)) {
        return METHOD_GET_LOT_SIZE_BY_EXCHANGE.MARKET_INFO_SYMBOL
    }
    return METHOD_GET_LOT_SIZE_BY_EXCHANGE.BALANCE
}

const LotsizeManage = ({ symbol, exchange, setSecurityLotSize }) => {
    const initLotSizeFn = useCallback(() => {
        const lotSize = getLotSizeBySymbolAndExchange({ symbol, exchange })
        lotSize && setSecurityLotSize && setSecurityLotSize(lotSize)
    }, [symbol, exchange])
    useEffect(() => {
        if (symbol && exchange) {
            const lotSize = getLotSizeBySymbolAndExchange({ symbol, exchange })
            if (lotSize) {
                setSecurityLotSize && setSecurityLotSize(lotSize)
            } else {
                // Nếu chưa có lot_size trong dic symbol info thì recall and set to redux
                const stringQuery = `${symbol}.${exchange}`
                const byPassCache = true
                const forceUpdate = true
                getSymbolInfoApi(stringQuery, initLotSizeFn, byPassCache, forceUpdate)
            }
        }
    }, [symbol, exchange])
    return null
}

export default LotsizeManage
