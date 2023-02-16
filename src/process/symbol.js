import * as Controller from '../memory/controller'
import * as Req from '../network/http/request'

export async function getSymbol(listSymbol = []) {
    const listResult = []
    const listSymbolReq = []

    listSymbol.map(symbol => {
        const symbolCache = Controller.getSymbolEquity([symbol])[0]
        symbolCache
            ? listResult.push(symbolCache)
            : listSymbolReq.push(symbol)
    })

    if (listSymbolReq.length > 0) {
        const res = await Req.getSymbol(listSymbolReq)
        listResult.push(...res)
    }

    return listResult
}
