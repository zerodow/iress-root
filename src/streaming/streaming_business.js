import * as Storage from '../storage';
import * as StreamingStorage from './streaming_storage'
import * as Util from '../util';
import * as Controller from '../memory/controller';
import Enum from '~/enum'
const { TAB_NEWS } = Enum

const DataStorage = Storage.dataStorage;
const OBJ = Util.OBJ;
const LENGTH_URL = 1000;

export function getChannelOrderClientOrderID(clientOrderID) {
    return `order_realtime_client_order_id#${clientOrderID}`
}

export function getChannelOrderBrokerOrderID(brokerOrderID) {
    return `order_realtime_broker_order_id#${brokerOrderID}`
}

export function getChannelOrderDetailBrokerOrderID(brokerOrderID) {
    return `order_realtime_broker_order_detail_id#${brokerOrderID}`
}

export function getChannelOrderReconnectSSE(type) {
    return `order_reconnect_sse_${type}`
}

export function getChannelReconnectSSE(type) {
    return `reconnect_sse_${type}`
}

export function getChannelDepthAOI() {
    return `depth_aoi`
}

export function getChannelCosAOI() {
    return `trades_aoi`
}

export function getChannelPerformanceButton() {
    return `set_button_perfomance`
}

export function getChannelHoldingButton() {
    return `set_button_holding`
}

export function getChannelCashButton() {
    return `set_button_cash`
}
export function getUpdateRelatedSymbol() {
    return `update_list_symbol_realted`
}

export function getChannelAllMarket(exchange, symbol) {
    return `price##${exchange}##${symbol}`
}

export function getChannelLv1(exchange, symbol) {
    return `lv1##${exchange}##${symbol}`;
};

export function getChannelLv2(exchange, symbol) {
    return `lv2##${exchange}##${symbol}`;
};

export function getChannelCos(exchange, symbol) {
    return `cos##${exchange}##${symbol}`;
};

export function getChannelHistorical(exchange, symbol, interval) {
    return `historical##${exchange}##${symbol}##${interval}`;
};

export function getChannelNews(type = TAB_NEWS.ALL) {
    return `news##${type}`
}

export function getChannelOrderList(acccount) {
    return `orderlist##${acccount}`;
};

export function getChannelPortfolio() {
    return `portfolio_total`;
};

export function getChannelPortfolioPosition(accountID, symbol) {
    return `portfolio_position##${accountID}##${symbol}`
}

export function getChannelPortfolioListPosition(accountID) {
    return `portfolio_list_position##${accountID}`
}

export function getChannelPortfolioBalance(accountID) {
    return `portfolio_balance##${accountID}`
}

export function getChannelPortfolioAccountSummary(accountID) {
    return `portfolio_account_summary##${accountID}`
}

export function getChannelHalt(symbol) {
    return `halt##${symbol}`;
};

export function getChannelByField(idComponent, field, action = '') {
    return `${idComponent}##${field}##${action}`;
}

export function getChannelWatchlistChanged(priceBoardId) {
    return `watchlist_changed##${priceBoardId}`;
}

export function getChannelLoadingTrade(type) {
    return `loading_state##${type}`;
}

export function getChannelAllowRenderIndex(idComponent) {
    return `allow_render_index##${idComponent}`;
}

export function getChannelAllowRenderContent(idComponent) {
    return `allow_render_content##${idComponent}`;
}

export function getChannelAllowRenderHeader(idComponent) {
    return `allow_render_header##${idComponent}`;
}

export function getChannelHeaderRowLv1(id) {
    return `lv1_from_component##${id}##header`
}

export function getChannelContentRowLv1(id) {
    return `lv1_from_component##${id}##content`
}

export function getChannelChildExpandStatus(idComponent) {
    return `child_expand_status##${idComponent}`;
}

export function checkSymbolSub({ dicObj, exchange, listSymbol, idSub, isSetDicSub = true }) {
    let isAllSub = true;
    listSymbol.map(symbol => {
        if (dicObj[exchange] && dicObj[exchange][symbol] && dicObj[exchange][symbol][idSub]) return;
        dicObj[exchange] = dicObj[exchange] || {};
        dicObj[exchange][symbol] = dicObj[exchange][symbol] || {};
        dicObj[exchange][symbol][idSub] = true;
        isAllSub = false;
    });
    if (isSetDicSub) {
        StreamingStorage.setDicSub(dicObj)
    }
    return isAllSub;
};

export function checkSymbolSubHistorical({ dicObj, interval, exchange, listSymbol, idSub }) {
    let isAllSub = true;

    listSymbol.map(symbol => {
        if (Util.OBJ.getVal(dicObj, [interval, exchange, symbol, idSub])) return;
        Util.OBJ.setObjectable(dicObj, interval);
        Util.OBJ.setObjectable(dicObj[interval], exchange);
        Util.OBJ.setObjectable(dicObj[interval][exchange], symbol);
        dicObj[interval][exchange][symbol][idSub] = true;
        isAllSub = false;
    });
    return isAllSub;
};

export function getOptionStream() {
    return { headers: { Authorization: `Bearer ${Controller.getAccessToken()}` } };
};

export function getStringPriceSubSymbol(exchange, listSymbol, pathLength = LENGTH_URL) {
    const listString = [];
    let currentLength = 0;
    const listChild = [];
    for (let i = 0; i < listSymbol.length; i++) {
        let symbol = encodeURIComponent(listSymbol[i]);
        // Cập nhật link streaming business market data /price/v2 (ANZ -> ANZ.ASX)
        if (exchange && exchange === 'ASX') {
            symbol = `${symbol}.ASX`
        }
        if (i === listSymbol.length - 1) {
            listChild.push(symbol);
            listString.push(listChild.join(','));
            break;
        }
        if (currentLength + symbol.length + 1 < pathLength) {
            currentLength = currentLength + symbol.length + 1;
            listChild.push(symbol);
        } else {
            listString.push(listChild.join(','));
            currentLength = symbol.length + 1;
            listChild.length = 0;
            listChild.push(symbol);
        }
    }

    return listString;
}

export function getStringSymbol(listSymbol, pathLength = LENGTH_URL) {
    const listString = [];
    let currentLength = 0;
    const listChild = [];
    for (let i = 0; i < listSymbol.length; i++) {
        const symbol = encodeURIComponent(listSymbol[i]);
        if (i === listSymbol.length - 1) {
            listChild.push(symbol);
            listString.push(listChild.join(','));
            break;
        }
        if (currentLength + symbol.length + 1 < pathLength) {
            currentLength = currentLength + symbol.length + 1;
            listChild.push(symbol);
        } else {
            listString.push(listChild.join(','));
            currentLength = symbol.length + 1;
            listChild.length = 0;
            listChild.push(symbol);
        }
    }

    return listString;
};
