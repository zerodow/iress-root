
import { getAccountStreamingUrl, getUserStreamingUrl, getNewsStreamingUrl, getRoleStreamingUrl } from './api';
import { subcriber, unregister, unregisterAll } from './sse_new';
import * as Controller from './memory/controller';

export function registerByAccount(accountId, callbackFn, type) {
    const streamingUrl = `${getAccountStreamingUrl(accountId)}`;
    const isAddAccessToken = true
    subcriber(streamingUrl, callbackFn, type, isAddAccessToken);
}

export function registerByUser(userId, callbackFn, type) {
    const streamingUrl = `${getUserStreamingUrl(userId)}`;
    subcriber(streamingUrl, callbackFn, type);
}

export function registerByRoleGroup(callbackFn, type) {
    const streamingUrl = `${getRoleStreamingUrl()}`;
    subcriber(streamingUrl, callbackFn, type);
}

export function unregisterByRoleGroup(callbackFn, type) {
    const streamingUrl = `${getRoleStreamingUrl()}`;
    unregister(streamingUrl, callbackFn, type);
}

export function unregisterOldRoleGroup(callbackFn, type, roleGroup) {
    const streamingUrl = `${getRoleStreamingUrl(roleGroup)}`
    unregister(streamingUrl, callbackFn, type);
}

export function registerNews(callbackFn, type) {
    const streamingUrl = `${getNewsStreamingUrl()}`;
    subcriber(streamingUrl, callbackFn, type);
}

export function unregisterByAccount(accountId, callbackFn, type) {
    const streamingUrl = `${getAccountStreamingUrl(accountId)}`;
    unregister(streamingUrl, callbackFn, type);
}

export function unregisterAllMessage(accountId) {
    const streamingUrl = `${getAccountStreamingUrl(accountId)}`;
    unregisterAll(streamingUrl);
}

export function unregisterAllMessageByUser(userId) {
    const streamingUrl = `${getUserStreamingUrl(userId)}`;
    unregisterAll(streamingUrl);
}

export function unregisterAllMessageRoleGroup() {
    const streamingUrl = `${getRoleStreamingUrl()}`;
    unregisterAll(streamingUrl);
}

export function unregisterNews() {
    const streamingUrl = `${getNewsStreamingUrl()}`;
    unregisterAll(streamingUrl)
}

export function unregisterByUser(userId, callbackFn, type) {
    const streamingUrl = `${getUserStreamingUrl(userId)}`;
    unregister(streamingUrl, callbackFn, type);
}

export function registerPortfolioByMktPrice(stringQueryAcc, callbackFn, type) {
    const streamingUrl = `${getPortfolioByMktPriceStreamingUrl(stringQueryAcc)}`;
    const isAddAccessToken = true
    subcriber(streamingUrl, callbackFn, type, isAddAccessToken);
}

export function unregisterPortfolioByMktPrice(stringQueryAcc, callbackFn, type) {
    const streamingUrl = `${getPortfolioByMktPriceStreamingUrl(stringQueryAcc)}`;
    unregister(streamingUrl, callbackFn, type);
}

// export function unregisterOrders(accountId, callbackFn, type) {
//     const orderUrl = getAccountStreamingUrl(accountId);
//     unregister(orderUrl, callbackFn, type);
// }

// export function registerPortfolio(accountId, callbackFn, type) {
//     const portfolioUrl = getAccountStreamingUrl(accountId);
//     subcriber(portfolioUrl, callbackFn, type);
// }
// export function unregisterPortfolio(accountId, callbackFn, type) {
//     const portfolioUrl = getAccountStreamingUrl(accountId);
//     unregister(portfolioUrl, callbackFn, type);
// }

// export function registerUserWatchList(userId, callbackFn, type) {
//     const userUrl = getUserStreamingUrl(userId);
//     subcriber(userUrl, callbackFn, type);
// }
// export function unregisterUserWatchList(userId, callbackFn, type) {
//     const userUrl = getUserStreamingUrl(userId);
//     unregister(userUrl, callbackFn, type);
// }
