import * as Business from '../business'
import * as Controller from '../memory/controller'
import { dataStorage } from '../storage';

export const priceSourceType = {
    noAccess: 0,
    delayed: 1,
    clicktorefresh: 2,
    streaming: 3
};

export function filterListSymbol({ listSymbolObject }) {
    let listFilterObjSymbol = []
    let marketDataTypeAU = priceSourceType.delayed
    let marketDataTypeUS = priceSourceType.delayed
    if (Controller.getLoginStatus()) {
        const userDetails = Controller.getUserInfo() || {};
        marketDataTypeAU = userDetails.market_data_au || 0
        marketDataTypeUS = userDetails.market_data_us || 0
    }

    if (marketDataTypeAU !== 0 && marketDataTypeUS !== 0) return listSymbolObject

    for (let i = 0; i < listSymbolObject.length; i++) {
        const item = listSymbolObject[i]
        const { exchange, symbol } = item
        const isAuBySymbol = Business.isParitech(symbol)
        if ((isAuBySymbol && marketDataTypeAU !== 0) || (!isAuBySymbol && marketDataTypeUS !== 0)) {
            listFilterObjSymbol.push(item)
        }
    }
    return listFilterObjSymbol
}
