import { getUrlActiveScreen, getUrlInactiveScreen, postData } from '~/api';
import { forEach } from 'lodash';
import ENUM from '~/enum';
import { getListVendorIdSelected } from '~s/news_v3/model/header_list_news/header.model';
const { ACTIVE_STREAMING, SEC_DETAIL_TAB } = ENUM;
/*
    1> Active:
    - Method: POST
    - Links: https://iress-dev-market-feed.equix.app/v1/active-screen/{level}
    2> Inactive:
    - Method: POST
    - Links: https://iress-dev-market-feed.equix.app/v1/inactive-screen/{level}
    3> Notes:
    - Level: quote, trade, depth, news, market-activity
    - Body: {
        "data": {
            symbol, (dành cho quote, trade, depth, news (riêng với news thì symbol là vendor code, nhưng e k muốn sửa biến nên cho gửi là symbol luôn))
            exchange, market_group, watchlist (dành cho market-activity)
        }
    }
*/

let dicActive = {}; // Example NEWS: true -> active / NEWS: false -> inactive
let symbol = '';
let exchange = '';
let marketGroup = '';

export function getTypeByUrl(url) {
	if (url.includes('/depth')) {
		return ACTIVE_STREAMING.DEPTH;
	}
	if (url.includes('/trades')) {
		return ACTIVE_STREAMING.TRADE;
	}
	if (url.includes('/news')) {
		return ACTIVE_STREAMING.NEWS;
	}
	return null;
}

export function getBodyByScreen(screen) {
	switch (screen) {
		case ACTIVE_STREAMING.QUOTE:
		case ACTIVE_STREAMING.DEPTH:
		case ACTIVE_STREAMING.TRADE:
			return {
				symbol: `${symbol}.${exchange}`
			};
		case ACTIVE_STREAMING.NEWS: {
			const vendor = getListVendorIdSelected();
			const vendorArr = Object.keys(vendor);
			const vendorString = vendorArr.join(',');
			return vendor
				? {
						symbol: vendorString
				  }
				: null;
		}
		case ACTIVE_STREAMING.MARKET_ACTIVITY:
			break;
		default:
			return null;
	}
}

export function doActiveScreen(arrScreen) {
	if (!arrScreen) return;
	const listPromise = [];
	forEach(arrScreen, (screen) => {
		const url = getUrlActiveScreen({ screen });
		const data = getBodyByScreen(screen);
		const condition = getConditionByScreen(screen);
		data &&
			condition &&
			listPromise.push(
				postData(url, { data })
					.then((res) =>
						console.info('doActiveScreen screen', url, data, res)
					)
					.catch((err) => console.info('doActiveScreen error', err))
			);
	});
	Promise.all(listPromise)
		.then((res) => {})
		.catch((err) => {});
}

export function doInactiveScreen(arrScreen) {
	if (!arrScreen) return;
	const listPromise = [];
	forEach(arrScreen, (screen) => {
		const url = getUrlInactiveScreen({ screen });
		const data = getBodyByScreen(screen);
		const condition = getConditionByScreen(screen);
		data &&
			condition &&
			listPromise.push(
				postData(url, { data })
					.then((res) =>
						console.info('doActiveScreen screen', url, data, res)
					)
					.catch((err) => console.info('doActiveScreen error', err))
			);
	});
	Promise.all(listPromise)
		.then((res) => {})
		.catch((err) => {});
}

export function getConditionByScreen(screen) {
	switch (screen) {
		case ACTIVE_STREAMING.DEPTH:
		case ACTIVE_STREAMING.TRADE:
			return symbol && exchange;
		default:
			return true;
	}
}

export function doInactiveWithSseConnect(url) {
	const type = getTypeByUrl(url);
	if (!type) return;
	switch (type) {
		case ACTIVE_STREAMING.DEPTH:
			!dicActive[ACTIVE_STREAMING.DEPTH] &&
				doInactiveScreen([ACTIVE_STREAMING.DEPTH]);
			break;
		case ACTIVE_STREAMING.TRADE:
			!dicActive[ACTIVE_STREAMING.TRADE] &&
				doInactiveScreen([ACTIVE_STREAMING.TRADE]);
			break;
		case ACTIVE_STREAMING.NEWS:
			!dicActive[ACTIVE_STREAMING.NEWS] &&
				doInactiveScreen([ACTIVE_STREAMING.NEWS]);
			break;
		default:
			break;
	}
}

export function setSymbolInfo(symbolActive, exchangeActive) {
	symbol = symbolActive;
	exchange = exchangeActive;
}

export function setVendor(vendorActive) {
	vendor = vendorActive;
}

export function setMarketGroup(marketGroupActive) {
	marketGroup = marketGroupActive;
}

export function setActiveScreen(screen) {
	if (Array.isArray(screen)) {
		forEach(screen, (value) => {
			dicActive[value] = true;
		});
	} else {
		dicActive[screen] = true;
	}
}

export function setInactiveScreen(screen) {
	if (Array.isArray(screen)) {
		forEach(screen, (value) => {
			dicActive[value] = false;
		});
	} else {
		dicActive[screen] = false;
	}
}

export function getActiveScreenByKey(key, isHideNews = false) {
	switch (key) {
		case SEC_DETAIL_TAB.NEWS:
			return isHideNews
				? {
						active: [ACTIVE_STREAMING.DEPTH],
						inactive: [ACTIVE_STREAMING.TRADE]
				  }
				: {
						active: [ACTIVE_STREAMING.NEWS],
						inactive: [
							ACTIVE_STREAMING.DEPTH,
							ACTIVE_STREAMING.TRADE
						]
				  };
		case SEC_DETAIL_TAB.DEPTH:
			return isHideNews
				? {
						active: [ACTIVE_STREAMING.TRADE],
						inactive: [ACTIVE_STREAMING.DEPTH]
				  }
				: {
						active: [ACTIVE_STREAMING.DEPTH],
						inactive: [
							ACTIVE_STREAMING.TRADE,
							ACTIVE_STREAMING.NEWS
						]
				  };
		default:
			return isHideNews
				? {
						active: [ACTIVE_STREAMING.TRADE],
						inactive: [
							ACTIVE_STREAMING.DEPTH,
							ACTIVE_STREAMING.NEWS
						]
				  }
				: {
						active: [ACTIVE_STREAMING.TRADE],
						inactive: [
							ACTIVE_STREAMING.DEPTH,
							ACTIVE_STREAMING.NEWS
						]
				  };
	}
}

export function destroy() {
	dicActive = {};
	symbol = '';
	exchange = '';
	marketGroup = '';
}
