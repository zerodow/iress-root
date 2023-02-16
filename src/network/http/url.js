import * as Controller from '../../memory/controller';
import ApiTypeEnum from '../../constants/api_config';
import ENUM from '../../enum';

const KEY_VERSION = ENUM.KEY_VERSION;

function getFullUrl(path, keyVersion = KEY_VERSION.DEFAULT) {
    const baseUrl = `${Controller.getBaseUrl()}/${Controller.getVersion(
        keyVersion
    )}`;
    return `${baseUrl}/${path}`;
}

export function urlPortfolio(accountId) {
    const path = `portfolio/total/${accountId}`;
    return getFullUrl(path, 'cashBalanceVersion');
}
export function urlLv1Delay(exchange, strSymbol) {
    const path = `${ApiTypeEnum.priceDelayed}/${exchange}/${strSymbol}`;
    return getFullUrl(path);
}
export function urlUpdatePriceboard(priceboardId, userId) {
    const path = `watchlist/${priceboardId}/${userId}`;
    return getFullUrl(path);
}
export function urlSymbol(symbolStr) {
    const path = `market-info/symbol/${symbolStr}`;
    return getFullUrl(path);
}
