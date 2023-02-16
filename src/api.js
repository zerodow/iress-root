import moment from 'moment';
import userTypeEnum from './constants/user_type';
import apiTypeEnum from './constants/api_config';
import {
	logDevice,
	sendToRocketChat,
	getWatchListCache,
	setWatchListCache,
	setResolveAfterLoading,
	getSymbolInfoApi
} from './lib/base/functionUtil';
import RNFetchBlob from 'rn-fetch-blob';
import config from './config';
import { func, dataStorage } from './storage';
import apiReportEnum from './constants/api_report_enum';
import Enum from './enum';

import * as Util from './util';
import * as Controller from './memory/controller';
import * as cache from './cache';
import * as OrderDetailCache from './cache/order_detail_cache';
import Mongo, * as mongo from './lib/base/mongo';
import * as DateTime from './lib/base/dateTime.js';
import {
	handleErrorSystem,
	handleHideMessage
} from '~/component/error_system/Controllers/HandleResponseErrorSystem.js';
import { getNumReTry } from '~/component/error_system/Model/RecallModel.js';
import { errorSettingModel } from '~/screens/setting/main_setting/error_system_setting.js';
import { fakeSQLFullAsyncStorage } from './business';

const JSON = Util.json;
const TIMEOUT_REQUEST = 30000;
const TIMEOUT_GET_REQUEST = 30000;
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;
const FORMAT_TIME = Enum.FORMAT_TIME;
const ENV = Enum.ENVIRONMENT;
const { SYMBOL_CLASS, SUB_ENVIRONMENT } = Enum;
const lastEventId = 12345;
const extraSSEUrl = `handshake-interval=3000&retry=3000&lastEventId=${lastEventId}`;

const EnvConfig = config.environment;
const NUMBER_RESEND_REQUEST = 1;

const userPriceBoard = '';
export function getUrlForgotUsername() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/forgot-username`;
}

export function getUrlReceiveDigitCode() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/send-verify-username`;
}

export function getUrlVerifyDigitCode() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/verify-username`;
}

export function getUrlCreatePassword() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/create-password`;
}

export function getUrlBusinessLogSignOut() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/logout`;
}

export function getUrlPriceboardPersonal(id) {
	dataStorage.userPriceBoard = id;
	userId = 'iressuser';
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${id}/${userId}`;
}

export function getUrlChangePassword(userLoginId) {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/change-password/${userLoginId}`;
}

export function getUrlVerifyEmail() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/verification/send-verify-email`;
}

export function getUrlLogoutIress() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/logout`;
}

export function getUrlVerifyDigitCodeEmail() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/verification/verify-email`;
}

function createUserPriceboard(userId, newPriceboard) {
	return new Promise((resolve, reject) => {
		const url = getCreatePriceBoardUrl(userId);
		return postData(url, { data: newPriceboard })
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

function autoCreateFavorites() {
	const userId = 'iressuser';
	const newPriceboard = {
		user_id: userId,
		value: [],
		watchlist: Enum.WATCHLIST.USER_WATCHLIST,
		watchlist_name: Enum.WATCHLIST.USER_WATCHLIST
	};
	createUserPriceboard(userId, newPriceboard)
		.then((data) => {
			console.log('DCM create default Favorites SUCCESS', data);
		})
		.catch((err) => {
			console.log('DCM create default Favorites ERROR', err);
		});
}

function autoCreateLocalFavorites() {
	const userId = 'iressuser';
	func.resetDicWatchlist();
	const defaultRes = {
		data: [
			{
				watchlist: Enum.WATCHLIST.USER_WATCHLIST,
				watchlist_name: Enum.WATCHLIST.USER_WATCHLIST,
				init_time: 0
			}
		],
		user_id: userId
	};
	const priceboardObj = defaultRes.data[0];
	func.resetPriceBoardWatchList(priceboardObj);
}

export function getPriceBoard(userId) {
	return new Promise((resolve) => {
		const url = getAllPriceBoardUrl(userId);
		return requestData(url)
			.then((res) => {
				if (res && res.data && res.data.length) {
					try {
						console.log('getAllPriceBoardUrl', res.data);
						let isHaveFavorites = false;
						func.resetDicWatchlist();
						if (res && Util.arrayHasItem(res.data)) {
							res.data.map((priceboardObj) => {
								const watchListID = priceboardObj.watchlist;
								if (
									watchListID ===
									Enum.WATCHLIST.USER_WATCHLIST
								) {
									isHaveFavorites = true;
								}
								const watchListName =
									priceboardObj.watchlist_name;
								if (
									watchListID ===
										Enum.WATCHLIST.USER_WATCHLIST &&
									!watchListName
								) {
									priceboardObj.watchlist_name =
										Enum.WATCHLIST.USER_WATCHLIST;
									logDevice(
										'info',
										`ADD WATCHLIST NAME VAO USER CU - ${JSON.stringify(
											priceboardObj
										)}`
									);
								}
								func.resetPriceBoardWatchList(priceboardObj);
							});
						}
						if (!isHaveFavorites) {
							// Create favorites if not have
							autoCreateFavorites();
						}
					} catch (error) {
						console.log(1);
					}
				} else {
					// Create favorites if not have
					autoCreateFavorites();
					// Create default favorites on local
					autoCreateLocalFavorites();
				}
				resolve(res || []);
			})
			.catch(() => resolve(null));
	});
}

export function getSummaryPerformance(accountID, region, chartType) {
	let duration = 'day';
	switch (chartType) {
		case '1D':
			duration = Enum.SUMMARY_PERFORMANCE_FILTER['1D'];
			break;
		case '1M':
			duration = Enum.SUMMARY_PERFORMANCE_FILTER['1M'];
			break;
		case '3M':
			duration = Enum.SUMMARY_PERFORMANCE_FILTER['3M'];
			break;
		case 'YTD':
			duration = Enum.SUMMARY_PERFORMANCE_FILTER['YTD'];
			break;
		case 'ALL':
			duration = Enum.SUMMARY_PERFORMANCE_FILTER['ALL'];
			break;
		default:
			duration = Enum.SUMMARY_PERFORMANCE_FILTER['1W'];
			break;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'cashBalanceVersion'
	)}/balances/portfolio-performance/${accountID}?region=${region}&duration=${duration}`;
}

export function getAllOrdinariesHistory(fromTimeStamp, toTimeStamp, chartType) {
	let interval = '5m';
	switch (chartType) {
		case '1D':
			interval = Enum.XAO_SUMMARY_FILTER['1D'];
			break;
		case '1M':
			interval = Enum.XAO_SUMMARY_FILTER['1M'];
			break;

		case '3M':
			interval = Enum.XAO_SUMMARY_FILTER['3M'];
			break;
		case 'YTD':
			interval = Enum.XAO_SUMMARY_FILTER['YTD'];
			break;
		case 'ALL':
			interval = Enum.XAO_SUMMARY_FILTER['ALL'];
			break;
		default:
			interval = Enum.XAO_SUMMARY_FILTER['1W'];
			break;
	}
	const fromString = Util.formatTimeUTC(
		fromTimeStamp,
		FORMAT_TIME['DD/MM/yy hh:mm:ss.ms']
	);
	const toString = Util.formatTimeUTC(
		toTimeStamp,
		FORMAT_TIME['DD/MM/yy hh:mm:ss.ms']
	);
	console.log(fromString);
	console.log(toString);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/historical/ASX/XAO?interval=${interval}&from=${fromString}&to=${toString}&count=300`;
}

export function getAccountBalanceHistory(
	accountId,
	fromDate,
	toDate,
	intraday
) {
	if (intraday) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/balances/history?account_id=${accountId}&from=${fromDate}&to=${toDate}&type=5m`;
	} else {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/balances/history?account_id=${accountId}&from=${fromDate}&to=${toDate}&type=day`;
	}
}

export function getUrlCommodityInfo(symbol) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/commodity-info/symbol/${symbol}`;
}

/**
 * Get 5 account active of  user operator
 */
export function getURLTopAccountActive(pageSize, pageId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/search/account?page_size=${pageSize}&page_id=${pageId}`;
}

export function getUrlPriceLv1(exchange, strSymbol) {
	strSymbol = Util.encodeSymbol(strSymbol);
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.priceLv1
	}/${exchange}/${strSymbol}`;
}

export function getNewTotalPortfolio(accountId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'cashBalanceVersion'
	)}/portfolio/total/${accountId}`;
}

export function getAllHoldingUrl(userID) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/inquery?user_id=${userID}`;
}

export function getStreamingAllUrl(type, id) {
	const { rootUrlAll, version } = getRootUrlAndVersion('all');
	switch (EnvConfig) {
		case ENV.BETA:
		case ENV.NEXT:
		case ENV.PRODUCTION:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/sse/notification/streaming/${type}/${id}`;
		default:
			return `${rootUrlAll}/${version}/notification/${type}/${id}`;
	}
}

export function getAccountStreamingUrl(accountId) {
	return `${Controller.getBaseUrlSSE(
		false
	)}/noti/notification/streaming-data/account/${accountId}?${extraSSEUrl}`;
}

export function getPortfolioByMktPriceStreamingUrl(stringQuery) {
	const { rootUrlPortfolio, version } = getRootUrlAndVersion('portfolio');
	if (
		config.environment === ENV.NEXT ||
		config.subEnvironment === SUB_ENVIRONMENT.NEXT ||
		config.subEnvironment === SUB_ENVIRONMENT.EQUIX_DEMO
	) {
		return `${rootUrlPortfolio}/${version}/portfolio?account_id=${stringQuery}`;
	}
	return `${rootUrlPortfolio}/${version}/portfolio/${stringQuery}`;
}

export function getUserStreamingUrl(userId) {
	// Backend bỏ nchan sse mới -> chuyển về link cũ
	return `${Controller.getBaseUrlSSE(
		false
	)}/noti/notification/streaming-data/user/${userId}?${extraSSEUrl}`;
	// if (!Controller.isPriceStreaming()) return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/sse/notification/streaming/user/${userId}`;
	// if (EnvConfig === ENV.BETA) return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/sse/notification/streaming/user/${userId}`;

	// const { rootUrlAll, version } = getRootUrlAndVersion('all');
	// return `${rootUrlAll}/${version}/notification/user/${userId}`
}

export function getRoleStreamingUrl(roleGroup) {
	// Backend bỏ nchan sse mới -> chuyển về link cũ
	const userInfo = Controller.getUserInfo();
	return `${Controller.getBaseUrlSSE(
		false
	)}/noti/notification/streaming-data/role_group/${
		roleGroup || userInfo.role_group
	}?${extraSSEUrl}`;
}

export function getNewsStreamingUrl() {
	return `${Controller.getBaseUrlSSE(
		false
	)}/noti/notification/streaming-data/all/all?${extraSSEUrl}`;
}

export function getRequestSyncNotiUrl(userId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/analysis/notification/synchronize/${userId}`;
}
export function getAuthUrl() {
	// return `http://172.20.10.5:8081/auth`
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth`;
}
export function getRootUrlAndVersion(typeStreaming) {
	const isDemoConfig = Controller.checkDemoEnvironment();
	let rootUrl = '';
	let rootUrlAll = '';
	let version = '';
	let versionTxt = '';

	switch (typeStreaming) {
		case 'quote':
			versionTxt = 'versionQuote';
			break;
		case 'trade':
			versionTxt = 'versionTrades';
			break;
		case 'depth':
			versionTxt = 'versionDepth';
			break;
		case 'historical':
			versionTxt = 'versionHistorical';
			break;
		case 'news':
			versionTxt = 'versionNews';
			break;
		case 'price':
			versionTxt = 'versionPrice';
			break;
		case 'all':
			versionTxt = 'versionAll';
			break;
		case 'portfolio':
			versionTxt = 'versionPortfolio';
			break;
		case 'order':
			versionTxt = 'versionOrder';
			break;
		default:
			break;
	}

	if (EnvConfig === ENV.PRODUCTION) {
		if (!isDemoConfig) {
			rootUrl = config.streamingConfig[ENV.PRODUCTION].url;
			rootUrlAll = config.streamingConfig[ENV.PRODUCTION].urlAll;
			rootUrlPortfolio =
				config.streamingConfig[ENV.PRODUCTION].urlPortfolio;
			version = config.streamingConfig[ENV.PRODUCTION][versionTxt];
		} else {
			rootUrl = config.streamingConfig[ENV.DEMO].url;
			rootUrlAll = config.streamingConfig[ENV.DEMO].urlAll;
			rootUrlPortfolio = config.streamingConfig[ENV.DEMO].urlPortfolio;
			version = config.streamingConfig[ENV.DEMO][versionTxt];
		}
	} else {
		rootUrl = config.streamingConfig[EnvConfig].url;
		rootUrlAll = config.streamingConfig[EnvConfig].urlAll;
		rootUrlPortfolio = config.streamingConfig[EnvConfig].urlPortfolio;
		version = config.streamingConfig[EnvConfig][versionTxt];
	}

	return {
		rootUrl,
		version,
		rootUrlAll,
		rootUrlPortfolio
	};
}

export function getAllStreamingMarketUrl(stringQuery) {
	const isFuture = checkFutureSymbol(stringQuery);
	let { rootUrl, version } = getRootUrlAndVersion('price');
	if (isFuture) {
		rootUrl = config.streamingConfig.STAGING.url;
		version = config.streamingConfig.STAGING.versionPrice;
	} else if (EnvConfig === ENV.STAGING) {
		// Staging trỏ vào DEMO
		rootUrl = config.streamingConfig.DEMO.url;
		version = config.streamingConfig.DEMO.versionPrice;
	}
	return `${rootUrl}/${version}/mobile-streaming/${stringQuery}`;
	// return `http://10.0.6.250:8080/${version}/mobile-streaming/${listSymbol}`;
}

// export function getPriceStreamingMarketUrl(listSymbol) {
// 	const { rootUrl, version } = getRootUrlAndVersion('price');
// 	return `${rootUrl}/${version}/quote_mobile/${listSymbol}`;
// }

export function checkFutureSymbol(stringQuery) {
	try {
		let listSymbol = [];
		let symbol = '';
		if (stringQuery && typeof stringQuery === 'string') {
			listSymbol = stringQuery.split(',') || [];
			symbol = listSymbol[0];
		}
		symbol = stringQuery[0]; // Truyền vào arr
		symbol = symbol.replace('.ASX', '');
		const symbolClass =
			dataStorage.symbolEquity[symbol] &&
			dataStorage.symbolEquity[symbol].class
				? dataStorage.symbolEquity[symbol].class
				: SYMBOL_CLASS.EQUITY;
		const isFuture = symbolClass === SYMBOL_CLASS.FUTURE;
		return isFuture;
	} catch (error) {
		console.log('API checkFutureSymbol exception', error);
		return false;
	}
}

export function getPortfolioStreamingUrl(accountId) {
	const accessMode = 0;
	const { rootUrl, version } = getRootUrlAndVersion('portfolio');
	// return `http://172.20.10.5:8080/v1/portfolio/${accountId}?access_mode=${accessMode}`
	const url = `${rootUrl}/${version}/portfolio/${accountId}?access_mode=${accessMode}`;
	return url;
}

export function getMarketActivityStreamingUrl({
	watchlist,
	marketGroup,
	exchange
}) {
	const accessMode = 0;
	const { rootUrl, version } = getRootUrlAndVersion('portfolio');
	const url = `${rootUrl}/${version}/market-activity?watchlist=${watchlist}&market_group=${marketGroup}&exchange=${exchange}`;
	return url;
}
export function getOrdersStreamingUrl(accountId) {
	const { rootUrl, version } = getRootUrlAndVersion('order');
	const url = `${rootUrl}/${version}/order/${accountId}`;
	return url;
}

export function getPriceStreamingMarketUrl(stringQuery) {
	const isFuture = checkFutureSymbol(stringQuery);
	let { rootUrl, version } = getRootUrlAndVersion('price');
	if (isFuture) {
		rootUrl = config.streamingConfig.STAGING.url;
		version = config.streamingConfig.STAGING.versionPrice;
	} else if (EnvConfig === ENV.STAGING) {
		// Staging trỏ vào DEMO
		rootUrl = config.streamingConfig.DEMO.url;
		version = config.streamingConfig.DEMO.versionPrice;
	}
	return `${rootUrl}/${version}/quote_mobile/${stringQuery}`;
}

export function getCosStreamingUrl1(listSymbol) {
	const { rootUrl, version } = getRootUrlAndVersionStreaming();
	return `${rootUrl}/${version}/trades/${listSymbol}`;
	// return `http://10.0.50.36:8089/v1/trades/${listSymbol}`;
}

export function getRootUrlAndVersionStreaming() {
	const rootUrl = Controller.getBaseStreamingUrl();
	const version = Controller.getVersion();
	return { rootUrl, version };
}

export function getLv1StreamingUrl(listSymbol) {
	const { rootUrl, version } = getRootUrlAndVersionStreaming();
	if (dataStorage.isFake) {
		return `http://10.0.50.5:8089/v1/quote/${listSymbol}`;
	}

	// return `http://127.0.0.1:8089/v1/quote/${listSymbol}`
	return `${rootUrl}/${version}/quote/${listSymbol}`;
}
export function getLv2StreamingUrl1(listSymbol) {
	const { rootUrl, version } = getRootUrlAndVersionStreaming();
	return `${rootUrl}/${version}/depth/${listSymbol}`;
	// return `http://10.0.50.36:8089/v1/depth/${listSymbol}`;
}
export function getLv2StreamingUrl(exchange, listSymbol) {
	const { rootUrl, version } = getRootUrlAndVersionStreaming();
	return `${rootUrl}/${version}/depth/${exchange}/${listSymbol}`;
}
export function getCosStreamingUrl(exchange, listSymbol) {
	const { rootUrl, version } = getRootUrlAndVersionStreaming();
	return `${rootUrl}/${version}/trades/${exchange}/${listSymbol}`;
}
export function getHistoricalStreamingUrl(exchange, listSymbol, interval) {
	const isFuture = checkFutureSymbol(listSymbol);
	let { rootUrl, version } = getRootUrlAndVersionStreaming();
	if (isFuture) {
		rootUrl = config.streamingConfig.STAGING.url;
		version = config.streamingConfig.STAGING.versionPrice;
	} else if (EnvConfig === ENV.STAGING) {
		// Staging trỏ vào DEMO
		rootUrl = config.streamingConfig.DEMO.url;
		version = config.streamingConfig.DEMO.versionPrice;
	}
	return `${rootUrl}/${version}/historical/${interval}/${exchange}/${listSymbol}`;
}

export function getNewStreamingUrl(stringSymbol, type) {
	let { rootUrl, version } = getRootUrlAndVersion('news');
	if (EnvConfig === ENV.STAGING) {
		// Staging trỏ vào DEMO
		rootUrl = config.streamingConfig.DEMO.url;
		version = config.streamingConfig.DEMO.versionNews;
	}
	if (type === Enum.TAB_NEWS.ALL) {
		return `${rootUrl}/${version}/news/all`;
	}
	return `${rootUrl}/${version}/news/${stringSymbol}`;
}
export function getNewStreamingUrlIress(stringSymbol, type, listVendorCode) {
	let { rootUrl, version } = getRootUrlAndVersion('news');
	const url = `${rootUrl}/${version}/news/${listVendorCode}`;
	return url;
}
export function getAllNewStreamingUrl() {
	const { rootUrl, version } = getRootUrlAndVersion('news');
	return `${rootUrl}/${version}/news/all`;
}

export function getEmailNotificationUrl(userId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/user-details/email_alert/${userId}`;
}

export function getSubcribleChannelUrl() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/notification/register`;
}

export function getListAccountInfo(stringQuery) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/account?account_id=${stringQuery}`;
}

export function getUrlAccountByAccountId(accountId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/account/${accountId}`;
}
export function getUrlFilterOrders(
	userId,
	accountId,
	tag = 'open,stoploss',
	startTime,
	endTime
) {
	if (startTime && endTime) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/order/inquery?user_id=${userId}&tag=${tag}&account_id=${accountId}&from=${startTime}&to=${endTime}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/inquery?user_id=${userId}&tag=${tag}&account_id=${accountId}`;
}
export function getUrlCache() {
	const userID = func.getUserId();
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'entityChangeVersion'
	)}/report/entity_changed?user_id=${userID}`;
}

export function getUrlUserWatchList(userID, apiType = null) {
	if (apiType) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/${apiTypeEnum.dynamicWatchlist}/${apiType}/${userID}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.dynamicWatchlist
	}/${userID}`;
}

export function getUrlUserWatchListByAction(userID, action) {
	if (action) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/${
			apiTypeEnum.dynamicWatchlist
		}/user-watchlist/${userID}?action=${action}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.dynamicWatchlist
	}/user-watchlist/${userID}`;
}

export function getUserPosition() {
	// Map thêm position vào dic position của user
	const accountId = dataStorage.accountId;
	const urlUserPosition = getUrlUserPositionByAccountId(accountId);
	requestData(urlUserPosition, true)
		.then((data) => {
			if (data && Object.keys(data).length) {
				const arr = Object.keys(data);
				let stringQuery = '';
				for (let index = 0; index < arr.length; index++) {
					const element = arr[index];
					const symbol = element || '';
					// query get multi symbol
					if (!dataStorage.symbolEquity[symbol]) {
						stringQuery += symbol + ',';
					}
				}
				if (stringQuery) {
					stringQuery = stringQuery.replace(/.$/, '');
				}
				getSymbolInfoApi(stringQuery, () => {
					console.log('CACHE PERSONAL SYMBOL INFO SUCCESS');
				});
			}
			Object.keys(data).map((e) => {
				if (data[e]) {
					dataStorage.dicPosition[`${e}`] = true;
				}
			});
			console.log(dataStorage.dicPosition);
		})
		.catch((error) => {
			logDevice('error', `getUserPosition error: ${error}`);
		});
}

export function getUserWatchList(cb, byPassCache = false) {
	const now = new Date().getTime();
	const accountID = dataStorage.accountId;
	const userID = Controller.getUserId();
	const url = getUrlUserWatchList(userID, 'user-watchlist');
	requestData(url, true, null, byPassCache)
		.then((bodyData) => {
			if (bodyData && !bodyData.errorCode) {
				dataStorage.dicPersonal = {};
				let data = bodyData && bodyData.value ? bodyData.value : [];
				if (data && data.length) {
					data = data.sort((a, b) => {
						return a.rank - b.rank;
					});
					for (let index = 0; index < data.length; index++) {
						const element = data[index];
						const symbol =
							element && element.symbol
								? element.symbol
								: element.code;
						dataStorage.dicPersonal[`${symbol}`] = true;
					}
				}
				const time = new Date().getTime();
				console.log(
					`TIME GET PERSONAL - BYPASSCACHE = ${byPassCache}: `,
					(time - now) / 1000
				);
				logDevice(
					`TIME GET PERSONAL - BYPASSCACHE = ${byPassCache}: ${
						(time - now) / 1000
					} s`
				);
				cb && cb(data);
			} else {
				const data = [];
				cb && cb(data);
			}
		})
		.catch((err) => {
			const response = {
				errorCode: err
			};
			cb && cb(response);
			logDevice('error', `GET USER WATCHLIST FAIL - ${err}`);
		});
}

export function updateUserWatchList(
	watchlist,
	watchlistName,
	listSymbol,
	successCb,
	errorCb,
	action,
	rank
) {
	const userID = Controller.getUserId();
	const bodyData = [];
	if (action) {
		const child = {
			symbol: listSymbol[0],
			rank
		};
		bodyData.push(child);
	} else {
		for (let index = 0; index < listSymbol.length; index++) {
			const symbol = listSymbol[index];
			const child = {
				symbol,
				rank: index
			};
			bodyData.push(child);
		}
	}
	const url = getUrlUserWatchListByAction(userID, action);
	const data = {
		data: {
			user_id: userID,
			watchlist,
			watchlist_name: watchlistName,
			value: bodyData
		}
	};
	logDevice(
		'info',
		`UPDATE USER WATCHLIST URL: ${url} - DATA: ${JSON.stringify(data)}`
	);
	putData(url, data)
		.then((response) => {
			logDevice('info', `UPDATE USER WATCHLIST SUCCESS`);
			successCb && successCb(bodyData);
		})
		.catch((err) => {
			logDevice('error', `UPDATE USER WATCHLIST ERROR - ${err}`);
			errorCb && errorCb(err);
		});
}

export function addUserWatchList(userID, listSymbol, successCb, errorCb) {
	const bodyData = [];
	for (let index = 0; index < listSymbol.length; index++) {
		const symbol = listSymbol[index];
		dataStorage.dicPersonal[`${symbol}`] = true;
		const child = {
			symbol,
			rank: index
		};
		bodyData.push(child);
	}
	const url = getUrlUserWatchList(userID);
	const data = {
		data: {
			user_id: userID,
			watchlist: Enum.WATCHLIST.USER_WATCHLIST,
			value: bodyData
		}
	};
	postData(url, data)
		.then(() => {
			// // Cache lại personal
			// const cachePersonal = data.data
			// setCacheDataRealtime(cachePersonal, setDataCachePersonal)
			successCb && successCb(bodyData);
		})
		.catch((err) => {
			logDevice('error', `ADD USER WATCHLIST ERROR - ${err}`);
			errorCb && errorCb();
		});
}

export function actionUserWatchListSymbol(
	userID,
	symbol,
	apiType = 'check-exist',
	successCb,
	errorCb
) {
	try {
		const url = getUrlUserWatchList(userID, apiType);
		const data = {
			data: symbol
		};
		postData(url, data)
			.then((response) => {
				logDevice(
					'info',
					`WATCHLIST ACTION - TYPE: ${apiType} - URL: ${url} - DATA: ${JSON.stringify(
						response
					)}`
				);
				if (response.message === 1) {
					if (successCb) {
						return successCb();
					}
				}
				if (errorCb) {
					return errorCb();
				}
			})
			.catch((err) => {
				if (errorCb) {
					return errorCb();
				}
				logDevice(
					'error',
					`check user watchlist symbol exit failed ${err}`
				);
			});
	} catch (err) {
		logDevice('error', `check user watchlist symbol exit exception ${err}`);
		if (errorCb) {
			return errorCb();
		}
	}
}

export function getUrlOrderByTag2(
	tag,
	accountId,
	page = 1,
	pageSize = 10,
	symbol,
	fromDate,
	toDate
) {
	const userId = Controller.getUserId();
	if (fromDate && toDate) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/order/inquery?user_id=${userId}&tag=${tag}&account_id=${accountId}&from=${fromDate}&to=${toDate}&page_id=${page}&page_size=${pageSize}&filter=${symbol}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/inquery?user_id=${userId}&tag=${tag}&account_id=${accountId}&page_id=${page}&page_size=${pageSize}&filter=${symbol}`;
}

export function getUrlAudUsd() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/feed-snapshot/level1/FX/AUDUSD`;
}

export function getUrlExchangeRate(stringQuery) {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/feed-snapshot/level1/FX/${stringQuery}`;
}

export function getUrlFee() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/fee`;
}

export function getUrlOrderDetail(orderId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order?order_id=${orderId}&detail=true`;
}

export function getUrlLatestOrderDetail(orderID, isUseClientOrderID = false) {
	if (isUseClientOrderID) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version',
			(forceChange = true)
		)}/order/response_lastest?client_order_id=${orderID}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order/response_lastest?broker_order_id=${orderID}`;
}

export function getOrderById(orderId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order?order_id=${orderId}`;
}

export function getUrlOrder(orderId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order/${orderId}`;
}
export function getUrlCancelOrder() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order/cancel`;
}

export function getUrlOrderInfo(orderId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order?order_id=${orderId}`;
}

export function getUrlTopOrderTransaction(accountId, symbol) {
	const newSymbol = Util.encodeSymbol(symbol);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/transactions/${accountId}/${newSymbol}?top=5`;
}
export function getUrlOrderTransaction(accountId, symbol) {
	const newSymbol = Util.encodeSymbol(symbol);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/transactions/${accountId}/${newSymbol}`;
}

export function getUrlUpnlByUser(userId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/upnl/${userId}`;
}

export function getUrlPositionByAccountId(accountId, symbol) {
	if (symbol) {
		const newSymbol = Util.encodeSymbol(symbol);
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'cashBalanceVersion'
		)}/portfolio/position/${accountId}/${newSymbol}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'cashBalanceVersion'
	)}/portfolio/position/${accountId}`;
}

export function getUrlPositionCalculateUpnlByAccountId(accountId, symbol) {
	if (symbol) {
		const newSymbol = Util.encodeSymbol(symbol);
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/portfolio/upnl/${accountId}/${newSymbol}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/upnl/${accountId}`;
}

export function getUrlUserPositionByAccountId(accountId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/user_position/${accountId}`;
}

export function getUrlBalanceByAccountId(accountId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'cashBalanceVersion'
	)}/balances/account/${accountId}`;
}

export function getUrlTradingHalt() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/symbol/trading_halt`;
}

export function getUrlUserSettingByUserId(userId, type) {
	switch (type) {
		case 'get':
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/user/user_setting/${userId}?type=mobile`;
		case 'post':
		case 'put':
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/user/user_setting/${userId}/mobile`;
	}
}

export function getUrlAccountByUserId(userId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/mapping_account?user_id=${userId}`;
}

export function getUrlAccountMapping() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/mapping_account`;
}

export function getUrlUserResetPassword() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/set-password`;
}

export function getUrlUserChangePassword(userLoginId) {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/change-password/${userLoginId}`;
}

export function getUrlUserForgotPassword() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/forgot-password`;
}

export function getUrlSendEmailForgotPassword() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/user/email-verification-link`;
}

export function getAccountInfo(accountId) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/account?account_id=${accountId}`;
}

export function getUrlUserInfoByEmail(email) {
	if (email) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/user/user_info?user_login_id=${email}`;
	}
}
export function getUrlUserDetailsByEmail(email) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/user-details?user_login_id=${email}`;
}

export function getUrlUserDetailByUserLoginId(userLoginId) {
	if (userLoginId) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/user/user-details?user_login_id=${userLoginId}`;
	}
}

export function getUrlUserRole(groupUserId) {
	if (groupUserId) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/user/role-group/${groupUserId}`;
	}
}

// export function getUrlOrderByTag(tag, accountId, fromDate, toDate) {
//     if (fromDate && toDate) {
//         return `${Controller.getBaseUrl()}/${Controller.getVersion(
//             'version'
//         )}/order?tag=${tag}&account_id=${accountId}&from=${fromDate}&to=${toDate}`;
//     }
//     return `${Controller.getBaseUrl()}/${Controller.getVersion(
//         'version'
//     )}/order?tag=${tag}&account_id=${accountId}`;
// }

export function getUrlUserInfoByUserId(userId) {
	if (userId) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/user/user_info/${userId}`;
	}
}

export function getOverviewUrl(top) {
	if (top) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/watchlist/top-${top}-asx-index/0`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/top-asx-index/0`;
}

export function getDetailPriceBoardUrl(userId, priceboardId) {
	userId = 'iressuser';
	const encodePriceBoard = encodeURIComponent(priceboardId);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${encodePriceBoard}/${userId}`;
}

export function getAllPriceBoardUrl(userId) {
	userId = 'iressuser';
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/inquery?user_id=${userId}`;
}

export function getStaticPriceBoardUrl() {
	userId = 'iressuser';
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/inquery`;
}

export function getAllStaticPriceBoardUrl() {
	userId = 'iressuser';
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/inquery?filter_all=1`;
}

export function getPriceBoardUrl(userId) {
	userId = 'iressuser';
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${userId}`;
}

export function getUpdatePriceBoardUrl(priceboardId, userId) {
	userId = 'iressuser';
	const encodePriceBoard = encodeURIComponent(priceboardId);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${encodePriceBoard}/${userId}`;
}

export function getUrlRemoveSymbolPriceBoard({ priceboardId }) {
	userId = 'iressuser';
	const encodePriceBoard = encodeURIComponent(priceboardId);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${encodePriceBoard}/${userId}?action=remove`;
}

export function getUpdatePriceBoardSpecifyUrl({
	priceboardId,
	isChangeWLName = false
}) {
	userId = 'iressuser';
	const encodePriceboard = encodeURIComponent(priceboardId);
	return (
		`${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/watchlist/${encodePriceboard}/${userId}?action=modify` +
		`${isChangeWLName ? '&rename=1' : ''}`
	);
}

export function getUrlAddSymbolPriceBoard({ priceboardId }) {
	userId = 'iressuser';
	const encodePriceBoard = encodeURIComponent(priceboardId);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${encodePriceBoard}/${userId}?action=add`;
}

export function getUrlMarketExchangeInfo({ exchange }) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/status/${exchange}`;
}

export function getCreatePriceBoardUrl(userId) {
	userId = 'iressuser';
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${userId}`;
}

export function getUpdateSymbolInPriceBoardUrl(priceboardId, userId, action) {
	userId = 'iressuser';
	const encodePriceBoard = encodeURIComponent(priceboardId);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${encodePriceBoard}/${userId}?action=${action}`;
}

export function getUrlPriceboardStatic(id) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/watchlist/${id}/0`;
}

export function getSearchSymbolUrl({ textSearch, classQuery, top, index }) {
	const newTxt = Util.encodeSymbol(textSearch);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/symbol/company_name?class=${classQuery}&status=active&symbol=${newTxt}&top=${top}&index=${index}`;
}
// test
export function getSearchNewOrderByMaster({
	masterCode,
	textSearch,
	isPointTextSearch
}) {
	const newTxt = Util.encodeSymbol(textSearch);
	if (isPointTextSearch) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/market-info/symbol?master_code=${masterCode}&filter=${newTxt}`;
	} else {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/market-info/symbol?master_code=${masterCode}`;
	}
}

export function checkNewsTodayUrl(stringQuery) {
	const newTxt = Util.encodeSymbol(stringQuery);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/news?type=recent&symbol=${newTxt}`;
}

export function getSymbolUrl(isSearch, isAll, symbol) {
	if (isSearch) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/market-info/symbol/company_name?class=equity&symbol=`;
	}
	if (isAll) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/market-info/symbol/`;
	}
	if (symbol) {
		const newTxt = Util.encodeSymbol(symbol);
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/market-info/symbol/${newTxt}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/symbol/`;
}

export function getSymbolUrlByStringQuery(symbolStr) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/symbol/${symbolStr}`;
}

export function getCustomHistorical({
	exchange = 'ASX',
	symbol,
	time,
	priceType,
	count = 500,
	timezone = Util.getCurrentTimezone(),
	isAuSymbol = true
}) {
	const barType = BAR_BY_PRICE_TYPE[priceType];
	const numberRecord = count <= 500 ? count : 500;
	let from = Util.getStartDayTimezone(time, timezone);
	let to = Util.getEndDayTimezone(time, timezone);
	switch (priceType) {
		case PRICE_FILL_TYPE._1D:
			// interval = 5m
			// Nếu vào ngày cuối tuần thì dịch to về thứ 6 và from về thứ 6
			if (isAuSymbol) {
				// Chuyển về giờ Úc
				if (Util.checkOpenSessionBySymbol(symbol)) {
					// nếu mở phiên thì lấy giờ hiện tại
					from = Util.getTimezoneCustom(
						time,
						Enum.OPEN_SESSION_AU_TIME.HOUR,
						Enum.OPEN_SESSION_AU_TIME.MINUTE,
						0,
						0,
						timezone
					);
					to = Util.getTimezoneCustom(
						time,
						Enum.CLOSE_SESSION_AU_TIME.HOUR,
						Enum.CLOSE_SESSION_AU_TIME.MINUTE,
						0,
						0,
						timezone
					);
				} else {
					// nếu chưa mở phiên thì lùi 1 ngày
					time = Util.addCustomTimeToTime(time, { day: -1 });
					from = Util.getTimezoneCustom(
						time,
						Enum.OPEN_SESSION_AU_TIME.HOUR,
						Enum.OPEN_SESSION_AU_TIME.MINUTE,
						0,
						0,
						timezone
					);
					to = Util.getTimezoneCustom(
						time,
						Enum.CLOSE_SESSION_AU_TIME.HOUR,
						Enum.CLOSE_SESSION_AU_TIME.MINUTE,
						0,
						0,
						timezone
					);
				}
			} else {
				// Chuyển về giờ Mỹ
				if (Util.checkOpenSessionBySymbol(symbol)) {
					// nếu mở phiên thì lấy giờ hiện tại
					from = Util.getTimezoneCustom(
						time,
						Enum.OPEN_SESSION_US_TIME.HOUR,
						Enum.OPEN_SESSION_US_TIME.MINUTE,
						0,
						0,
						timezone
					);
					to = Util.getTimezoneCustom(
						time,
						Enum.CLOSE_SESSION_US_TIME.HOUR,
						Enum.CLOSE_SESSION_US_TIME.MINUTE,
						0,
						0,
						timezone
					);
				} else {
					// nếu chưa mở phiên thì lùi 1 ngày
					time = Util.addCustomTimeToTime(time, { day: -1 });
					from = Util.getTimezoneCustom(
						time,
						Enum.OPEN_SESSION_US_TIME.HOUR,
						Enum.OPEN_SESSION_US_TIME.MINUTE,
						0,
						0,
						timezone
					);
					to = Util.getTimezoneCustom(
						time,
						Enum.CLOSE_SESSION_US_TIME.HOUR,
						Enum.CLOSE_SESSION_US_TIME.MINUTE,
						0,
						0,
						timezone
					);
				}
			}
			const checkWeekend = Util.checkCustomWeekend(time, timezone);
			const { isWeekend, day } = checkWeekend;
			if (isWeekend) {
				if (day === 0) {
					// Chủ nhật thì lùi 2 ngày
					from = Util.addCustomTimeToTime(from, { day: -2 });
					to = Util.addCustomTimeToTime(to, { day: -2 });
				} else if (day === 6) {
					// Thứ 7 lùi 1 ngày
					from = Util.addCustomTimeToTime(from, { day: -1 });
					to = Util.addCustomTimeToTime(to, { day: -1 });
				}
			}
			// from to + 1 hour với chart day
			from = from - 1 * 60 * 60 * 1000;
			to = to + 1 * 60 * 60 * 1000;
			break;
		case PRICE_FILL_TYPE._1W:
			// interval = 1h
			from = Util.addCustomTimeToTime(from, { day: -7 });
			break;
		case PRICE_FILL_TYPE._1M:
			// interval = 1h
			from = Util.addCustomTimeToTime(from, { month: -1 });
			break;
		case PRICE_FILL_TYPE._3M:
			// interval = 1d
			from = Util.addCustomTimeToTime(from, { month: -3 });
			break;
		case PRICE_FILL_TYPE._6M:
			// interval = 1d
			from = Util.addCustomTimeToTime(from, { month: -6 });
			break;
		case PRICE_FILL_TYPE._YTD:
			// interval = 1d
			from = moment().startOf('year');
			break;
		case PRICE_FILL_TYPE._1Y:
			// interval = 1d
			from = Util.addCustomTimeToTime(from, { year: -1 });
			break;
		case PRICE_FILL_TYPE._3Y:
			// interval = 1w
			from = Util.addCustomTimeToTime(from, { year: -3 });
			break;
		case PRICE_FILL_TYPE._5Y:
			// interval = 1w
			from = Util.addCustomTimeToTime(from, { year: -5 });
			break;
		case PRICE_FILL_TYPE._10Y:
			// interval = 1m
			from = Util.addCustomTimeToTime(from, { year: -10 });
			break;
		default:
			// interval = 1m
			from = 0;
			break;
	}
	// Convert to local
	// from = Util.convertToLocalTimeStamp(from, timezone);
	// to = Util.convertToLocalTimeStamp(to, timezone);

	// Với case 01/01/70 backend đang lỗi không get được chart -> lùi from về -1
	if (from === 0) {
		from = -60 * 60 * 1000;
	}

	const fromString = moment(from).format('DD/MM/YY-HH:mm');
	const toString = moment(to).format('DD/MM/YY-HH:mm');
	// const fromString = Util.formatTimeUTC(from, FORMAT_TIME['DD/MM/yy hh:mm']);
	// const toString = Util.formatTimeUTC(to, FORMAT_TIME['DD/MM/yy hh:mm']);
	const newSymbol = Util.encodeSymbol(symbol);

	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/historical/${exchange}/${newSymbol}?interval=${barType}&from=${fromString}&to=${toString}&count=${numberRecord}`;
}

export function getCustomHistorical1({ listSymbol, priceType, count = 500 }) {
	const barType = BAR_BY_PRICE_TYPE[priceType];
	const numberRecord = count <= 500 ? count : 500;
	const listSymbolOrigin = listSymbol.join(',');
	const listSymbolEncode = Util.encodeSymbol(listSymbolOrigin);

	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/historical/${listSymbolEncode}?interval=${barType}`;
}

export function getExchangeUrl(isSearch) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/exchange`;
}

export function getCnoteUrl(
	accountId,
	symbol = '',
	duration,
	pageSize,
	pageId
) {
	if (symbol) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/cnote/inquery?account_id=${accountId}&symbol=${symbol}&duration=${duration}&page_size=${pageSize}&page_id=${pageId}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/cnote/inquery?account_id=${accountId}&duration=${duration}&page_size=${pageSize}&page_id=${pageId}`;
}

export function getCnoteUrlCustom(
	accountId,
	symbol = '',
	fromDate,
	toDate,
	pageSize,
	pageId
) {
	if (symbol) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/cnote/inquery?account_id=${accountId}&symbol=${symbol}&page_size=${pageSize}&page_id=${pageId}&from=${fromDate}&to=${toDate}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/cnote/inquery?account_id=${accountId}&page_size=${pageSize}&page_id=${pageId}&from=${fromDate}&to=${toDate}`;
}

export function getBusinessLogUrl(
	duration,
	action,
	pageSize,
	pageId,
	customDuration = null
) {
	const userID = func.getUserId();
	const location = Controller.getLocation().location;
	const timeStamp = new Date().getTime();
	const timeStampByLocation = DateTime.getTimeStampEndDayByLocation(
		timeStamp,
		location
	);
	if (action === 'all') {
		if (duration === 'custom') {
			const fromDateUTC = DateTime.convertToUtcDateByTimeStamp({
				timeStamp: customDuration.fromDate,
				location
			});
			const toDateUTC = DateTime.convertToUtcDateByTimeStamp({
				timeStamp: customDuration.toDate,
				startDay: false,
				location
			});
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/business-log/inquery?user_id=${userID}&page_size=${pageSize}&page_id=${pageId}&from=${fromDateUTC}&to=${toDateUTC}`;
		} else if (duration === 'all') {
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/business-log/inquery?user_id=${userID}&duration=${duration}&page_size=${pageSize}&page_id=${pageId}`;
		} else {
			const objectDuration =
				DateTime.convertToUtcDateByTimeStampAndDuration({
					timeStamp: timeStampByLocation,
					location,
					duration
				});
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/business-log/inquery?user_id=${userID}&page_size=${pageSize}&page_id=${pageId}&from=${
				objectDuration.fromDate
			}&to=${objectDuration.toDate}`;
		}
	}
	if (duration === 'custom') {
		const fromDateUTC = DateTime.convertToUtcDateByTimeStamp({
			timeStamp: customDuration.fromDate,
			location
		});
		const toDateUTC = DateTime.convertToUtcDateByTimeStamp({
			timeStamp: customDuration.toDate,
			startDay: false,
			location
		});
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/business-log/inquery?user_id=${userID}&page_size=${pageSize}&page_id=${pageId}&filter=${action}&from=${fromDateUTC}&to=${toDateUTC}`;
	} else if (duration === 'all') {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/business-log/inquery?user_id=${userID}&duration=${duration}&filter=${action}&page_size=${pageSize}&page_id=${pageId}`;
	} else {
		const objectDuration = DateTime.convertToUtcDateByTimeStampAndDuration({
			timeStamp: timeStampByLocation,
			location,
			duration
		});
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/business-log/inquery?user_id=${userID}&page_size=${pageSize}&page_id=${pageId}&filter=${action}&from=${
			objectDuration.fromDate
		}&to=${objectDuration.toDate}`;
	}
}

export function getBusinessLogSearchUrl(accountId, duration, texSearch = '') {
	const userID = func.getUserId();
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/business-log/inquery?user_id=${userID}&duration=${duration}&filter=${texSearch}`;
}

export function getCnoteSearchUrl(accountId, duration, texSearch = '') {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/cnote/inquery?account_id=${accountId}&duration=${(
		duration + ''
	).toLowerCase()}&filter=${texSearch}`;
}

export function getNewById(newID) {
	if (Controller.getLoginStatus()) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/news/${newID}`;
	}
}

export function getNewsUrlByPageSize(pageID, pageSize) {
	if (pageSize && pageID) {
		return `page_id=${pageID}&page_size=${pageSize}`;
	}
	return ``;
}

export function getNewsUrlByTag(tag) {
	// if (tag === 'PriceSensitive' || tag === 'Price Sensitive') {
	// 	return `&tag=${Enum.FILTER_TYPE_NEWS.PRICE_SENSITIVE}`;
	// }
	if (tag) return `&tag=${tag}`;
	return ``;
}

export function getNewsUrlBySymbol(stringQuery) {
	if (stringQuery) {
		return `&symbol=${stringQuery}`;
	}
	return ``;
}

export function getNewsInday(tag, stringQuery) {
	const urlByTag = getNewsUrlByTag(tag);
	// Related news
	const urlBySymbol = `symbol=${stringQuery}`;
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/analysis/news/news_inday?${urlBySymbol}${urlByTag}`;
}
export function getNewsIress(stringQuery) {
	console.log(stringQuery, 'stringQuery');
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/news?${stringQuery}`;
}
export function getUrlIressFeedSnapshot(stringQuery) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/feed-snapshot/security-name/${stringQuery}`;
}
export function getNewsUrl(
	newType,
	tag,
	stringQuery,
	pageID,
	pageSize,
	symbol
) {
	const urlByPage = getNewsUrlByPageSize(pageID, pageSize);
	const urlByTag = getNewsUrlByTag(tag);
	if (newType === Enum.TYPE_NEWS.SINGLE || symbol) {
		// Everything news or search symbol
		let urlBySymbol;
		symbol
			? (urlBySymbol = getNewsUrlBySymbol(symbol))
			: (urlBySymbol = getNewsUrlBySymbol(stringQuery));
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/news/inquery?${urlByPage}${urlByTag}${urlBySymbol}`;
	}
	if (newType === Enum.TYPE_NEWS.EVERYTHING) {
		// Everything news
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/news/inquery?${urlByPage}${urlByTag}`;
	} else {
		// Related news
		const urlBySymbol = getNewsUrlBySymbol(stringQuery);
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/news/inquery?${urlByPage}${urlByTag}${urlBySymbol}`;
	}
}

export function getLinkNewUrl(newsCode) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/news/article?news_code=${newsCode}`;
}

export function getNewsSearchUrl(tag, textSearch) {
	const newTxt = Util.encodeSymbol(textSearch);
	const urlByTag = getNewsUrlByTag(tag);
	const urlBySymbol = `symbol=${newTxt}`;
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/news/inquery?${urlBySymbol}${urlByTag}`;
}

export function getLinkCountNews(stringQuery, tag) {
	const userID = Controller.getUserId();
	const urlByTag = getNewsUrlByTag(tag);
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/news/inquery?user_id=${userID}&symbol=${stringQuery}${urlByTag}&action=GetCount`;
}

export function getPriceAOIUrl(exchange, strSymbol) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.priceAOI
	}/price/${exchange}/${strSymbol}`;
}

export function getLv1Snapshot(exchange, strSymbol) {
	if (Controller.getLoginStatus()) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/${apiTypeEnum.priceLv1}/${exchange}/${strSymbol}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.priceDelayed
	}/${exchange}/${strSymbol}`;
}

export function getLv1SnapshotAllExchange(strSymbol) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.priceLv1AllExchange
	}/${strSymbol}`;
}

export function getCosSnapshot(exchange, strSymbol) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.priceCos
	}/${exchange}/${strSymbol}`;
}

export function getLv2Snapshot(exchange, strSymbol) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/${
		apiTypeEnum.priceLv2
	}/${exchange}/${strSymbol}`;
}

export function getApiUrl(userType, apiType, isTopPrice) {
	if (userType) {
		switch (userType) {
			case userTypeEnum.ClickToRefresh:
			case userTypeEnum.Streaming:
				return `${Controller.getBaseUrl()}/${Controller.getVersion(
					'version'
				)}/${apiTypeEnum.snapshot}/${apiType}`;
			case userTypeEnum.Delay:
				return `${Controller.getBaseUrl()}/${Controller.getVersion(
					'version'
				)}/${apiTypeEnum.delayed}/${apiType}`;
			default:
				return '';
		}
	} else {
		if (isTopPrice) {
			const usertype = func.getUserPriceSource();
			switch (usertype) {
				case userTypeEnum.ClickToRefresh:
				case userTypeEnum.Streaming:
					return `${Controller.getBaseUrl()}/${Controller.getVersion(
						'version'
					)}/${apiTypeEnum.dynamicWatchlist}/${apiType}`;
				case userTypeEnum.Delay:
					return `${Controller.getBaseUrl()}/${Controller.getVersion(
						'version'
					)}/${apiTypeEnum.dynamicWatchlist}/${apiType}-delayed`;
				default:
					return '';
			}
		}
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/${apiTypeEnum.dynamicWatchlist}/${apiType}`;
	}
}

export function getReportUrl(type, accountId, fromDate, toDate) {
	const location = Controller.getLocation().location;
	// const fromDateUTC = DateTime.convertToUtcDate({ dateString: fromDate, location })
	// const toDateUTC = DateTime.convertToUtcDate({ dateString: toDate, location })
	const fromDateUTC = fromDate;
	const toDateUTC = toDate;
	switch (type) {
		case apiReportEnum.FINANCIAL:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'cashBalanceVersion'
			)}/report/get_report_eod/${accountId}?type_report=${
				apiReportEnum.FINANCIAL
			}&from=${fromDateUTC}&to=${toDateUTC}`;
		case apiReportEnum.HOLDING:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'cashBalanceVersion'
			)}/report/get_report_eod/${accountId}?type_report=${
				apiReportEnum.HOLDINGS
			}&from=${fromDateUTC}&to=${toDateUTC}`;
		case apiReportEnum.CASH:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'cashBalanceVersion'
			)}/report/get_report_eod/${accountId}?type_report=${
				apiReportEnum.CASH
			}&from=${fromDateUTC}&to=${toDateUTC}`;
		case apiReportEnum.TRANSACTION:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'cashBalanceVersion'
			)}/report/get_report_eod/${accountId}?type_report=${
				apiReportEnum.TRANSACTION
			}&from=${fromDateUTC}&to=${toDateUTC}`;
		default:
			break;
	}
}

export function getReportFromFileUrl(type, accountID, from, to) {
	const location = Controller.getLocation().location;
	// const fromStartDayUTC = DateTime.convertToUtcDate({ dateString: from, location })
	// const toStartDayUTC = DateTime.convertToUtcDate({ dateString: to, location })
	const fromStartDayUTC = from;
	const toStartDayUTC = to;
	switch (type) {
		case Enum.REPORT_FROM_FILE_TYPE.FINANCIAL_TRANSACTIONS:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'agilityReport'
			)}/agility/report/financial_transactions/${accountID}?from=${fromStartDayUTC}&to=${toStartDayUTC}`;
		case Enum.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'agilityReport'
			)}/agility/report/trade_activity/${accountID}?from=${fromStartDayUTC}&to=${toStartDayUTC}`;
		default:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'agilityReport'
			)}/agility/report/portfolio_valuation/${accountID}?from=${fromStartDayUTC}&to=${toStartDayUTC}`;
	}
}

export function getUrlPlaceOrder() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order`;
}

export function getUrlChartHistory(
	symbol,
	from = '',
	to = '',
	exchange = 'ASX',
	interval
) {
	const newSymbol = Util.encodeSymbol(symbol);
	if (interval) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/historical/${exchange}/${newSymbol}?interval=${interval}&from=${from}&to=${to}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/historical/${exchange}/${newSymbol}?${from ? `from=${from}` : ''}${
		to ? `&to=${to}` : ''
	}`;
}

export function getFeedUrl(userType, apiType) {
	if (!userType) {
		userType = func.getDataStorage('user_price_source');
	}
	switch (userType) {
		case userTypeEnum.Delay:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/feed-streaming/${apiTypeEnum.nchanDelayed}/${apiType}`;
		case userTypeEnum.Streaming:
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/feed-streaming/${apiTypeEnum.nchanStreaming}/${apiType}`;
		case userTypeEnum.ClickToRefresh:
			if (apiType === 'cos' || apiType === 'level2') {
				return `${Controller.getBaseUrl()}/${Controller.getVersion(
					'version'
				)}/feed-streaming/${apiTypeEnum.nchanStreaming}/${apiType}`;
			}
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/response/${apiType}`;
		default:
			return '';
	}
}

export async function postData(
	url,
	data,
	timeout,
	setMintimeToLoading = false,
	byPassAccessToken = false,
	forceUseAccesToken = false
) {
	return new Promise((resolve, reject) => {
		logDevice(
			'info: ',
			`POST DATA URL: ${url} - BODYDATA: ${JSON.stringify(data)}`
		);
		const timeStartRequest = new Date().getTime();
		const userAgent = dataStorage.userAgent || '';
		const accessToken = byPassAccessToken
			? null
			: forceUseAccesToken || Controller.getAccessToken();
		const headerObj = {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
			'user-agent': userAgent
		};
		let timeoutId;
		if (timeout) {
			timeoutId = setTimeout(() => {
				const res = {
					errorCode: '["Server.Timeout"]'
				};
				setResolveAfterLoading(
					setMintimeToLoading,
					timeStartRequest,
					() => {
						resolve(res);
					}
				);
			}, timeout);
		}
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('POST', url, headerObj, JSON.stringify(data));
		const timeoutRequestId = setTimeout(() => {
			logDevice('info: ', `POSTDATA HAVE BEEN CANCELED at URL: ${url}`);
			console.log(`postData have been cancelled at URL: ${url}`);
			task && task.cancel();
			const error = {
				errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
			};
			setResolveAfterLoading(
				setMintimeToLoading,
				timeStartRequest,
				() => {
					resolve(error);
				}
			);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			// Time request
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'post data',
				`${timeRequest / 1000}s SUCCESS POST DATA TO URL: ${url}`
			);
			logDevice(
				'info',
				`${
					timeRequest / 1000
				}s SUCCESS POST DATA TO URL: ${url} - SUCCESS WITH RESPONSE: ${
					res.data
				}`
			);

			let json = {
				errorCode: '["Server.Error"]'
			};
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			const dataRes = res.data;
			try {
				if (dataRes !== '' && !dataRes.includes('502 Server Error')) {
					json = res.json();
					handleErrorSystem(json);
					// json = fakeErrorSystem({ dataBody: json, url });
				}
				setResolveAfterLoading(
					setMintimeToLoading,
					timeStartRequest,
					() => {
						resolve(json);
					}
				);
			} catch (error) {
				console.log(
					'error parse json api.js 1135 =============================',
					error
				);
				reject('unknown error');
			}
		}).catch((errorMessage, statusCode) => {
			// Time request
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'post data failed',
				`${timeRequest / 1000}s FAIL POST DATA TO URL: ${url}`
			);
			logDevice(
				'error',
				`${
					timeRequest / 1000
				}s FAIL POST DATA TO URL: ${url} - statusCode: ${statusCode} - ERROR: ${errorMessage}`
			);
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			reject(errorMessage, statusCode);
		});
	});
}

export async function httpPost(url, data, timeout) {
	return new Promise((resolve, reject) => {
		logDevice(
			'info: ',
			`POST DATA URL: ${url} - BODYDATA: ${JSON.stringify(data)}`
		);
		const timeStartRequest = new Date().getTime();
		const userAgent = dataStorage.userAgent;
		const headerObj = {
			Authorization: `Bearer ${Controller.getAccessToken()}`,
			'Content-Type': 'application/json',
			'user-agent': userAgent
		};
		let timeoutId;
		if (timeout) {
			timeoutId = setTimeout(() => {
				const res = {
					errorCode: '["Server.Timeout"]'
				};
				resolve(res);
			}, timeout);
		}
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('POST', url, headerObj, JSON.stringify(data));
		const timeoutRequestId = setTimeout(() => {
			logDevice('info: ', `postData have been cancelled at URL: ${url}`);
			console.log(`postData have been cancelled at URL: ${url}`);
			task && task.cancel();
			const error = {
				errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
			};
			resolve(error);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			// Time request
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'post data',
				`${timeRequest / 1000}s SUCCESS POST DATA TO URL: ${url}`
			);
			logDevice(
				'info',
				`${
					timeRequest / 1000
				}s SUCCESS POST DATA TO URL: ${url} - SUCCESS WITH RESPONSE: ${
					res.data
				}`
			);

			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			const info = res.info();
			status = info.status;
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			if (status === 200) {
				let json = {
					errorCode: 'SUCCESS'
				};
				try {
					json = res.json();
					resolve({
						...json,
						status: 200
					});
				} catch (error) {
					resolve({
						status: 200
					});
				}
			} else {
				let json = {
					errorCode: '["Server.Error"]'
				};
				try {
					json = res.json();
					logDevice(
						'info',
						`POST DATA AND PARSE JSON URL: ${url} - JSON: ${
							json ? JSON.stringify(json) : ''
						}`
					);
					resolve(json);
				} catch (error) {
					logDevice(
						'info',
						`POST DATA AND PARSE JSON URL: ${url} - RESPONSE NOT JSON: ${res.data}`
					);
					resolve(res.data);
				}
			}
		}).catch((errorMessage, statusCode) => {
			// Time request
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'post data failed',
				`${timeRequest / 1000}s FAIL POST DATA TO URL: ${url}`
			);
			logDevice(
				'error',
				`${
					timeRequest / 1000
				}s FAIL POST DATA TO URL: ${url} - statusCode: ${statusCode} - ERROR: ${errorMessage}`
			);
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			reject(errorMessage, statusCode);
		});
	});
}

export async function httpPut(url, data, timeout) {
	return new Promise((resolve, reject) => {
		logDevice(
			'info: ',
			`PUT DATA URL: ${url} - BODYDATA: ${JSON.stringify(data)}`
		);
		const timeStartRequest = new Date().getTime();
		const userAgent = dataStorage.userAgent;
		const headerObj = {
			Authorization: `Bearer ${Controller.getAccessToken()}`,
			'Content-Type': 'application/json',
			'user-agent': userAgent
		};
		let timeoutId;
		if (timeout) {
			timeoutId = setTimeout(() => {
				const res = {
					errorCode: '["Server.Timeout"]'
				};
				resolve(res);
			}, timeout);
		}
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('PUT', url, headerObj, JSON.stringify(data));
		const timeoutRequestId = setTimeout(() => {
			logDevice('info: ', `putData have been cancelled at URL: ${url}`);
			console.log(`putData have been cancelled at URL: ${url}`);
			task && task.cancel();
			const error = {
				errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
			};
			resolve(error);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			// Time request
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'put data',
				`${timeRequest / 1000}s SUCCESS PUT DATA TO URL: ${url}`
			);
			logDevice(
				'info',
				`${
					timeRequest / 1000
				}s SUCCESS POST DATA TO URL: ${url} - SUCCESS WITH RESPONSE: ${
					res.data
				}`
			);

			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			const info = res.info();
			status = info.status;
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			if (status === 200) {
				let json = {
					errorCode: 'SUCCESS'
				};
				try {
					json = res.json();
					resolve({
						...json,
						status: 200
					});
				} catch (error) {
					resolve({
						status: 200
					});
				}
			} else {
				let json = {
					errorCode: '["Server.Error"]'
				};
				try {
					json = res.json();
					logDevice(
						'info',
						`PUT DATA AND PARSE JSON URL: ${url} - JSON: ${
							json ? JSON.stringify(json) : ''
						}`
					);
					resolve(json);
				} catch (error) {
					logDevice(
						'info',
						`PUT DATA AND PARSE JSON URL: ${url} - RESPONSE NOT JSON: ${res.data}`
					);
					resolve(res.data);
				}
			}
		}).catch((errorMessage, statusCode) => {
			// Time request
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'put data failed',
				`${timeRequest / 1000}s FAIL PUT DATA TO URL: ${url}`
			);
			logDevice(
				'error',
				`${
					timeRequest / 1000
				}s FAIL PUT DATA TO URL: ${url} - statusCode: ${statusCode} - ERROR: ${errorMessage}`
			);
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			reject(errorMessage, statusCode);
		});
	});
}

export async function putData(url, data, timeout) {
	return new Promise((resolve, reject) => {
		logDevice(
			'info: ',
			`PUTDATA URL: ${url} - BODYDATA: ${JSON.stringify(data)}`
		);
		const userAgent = dataStorage.userAgent;
		const headerObj = {
			Authorization: `Bearer ${Controller.getAccessToken()}`,
			'Content-Type': 'application/json',
			'user-agent': userAgent
		};
		let timeoutId;
		if (timeout) {
			timeoutId = setTimeout(() => {
				const res = {
					errorCode: '["Server.Timeout"]'
				};
				resolve(res);
			}, timeout);
		}
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('PUT', url, headerObj, JSON.stringify(data));
		const timeoutRequestId = setTimeout(() => {
			logDevice('info: ', `putData have been cancelled at URL: ${url}`);
			console.log(`putData have been cancelled at URL: ${url}`);
			task && task.cancel();
			const error = {
				errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
			};
			resolve(error);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			let json = {
				errorCode: '["Server.Error"]'
			};
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			const dataRes = res.data;
			if (
				dataRes !== '' &&
				!dataRes.includes('502 Server Error') &&
				!dataRes.includes('invalid response')
			) {
				json = res.json();
			}
			logDevice(
				'info',
				`putData - Success with response: ${
					json ? JSON.stringify(json) : ''
				}`
			);
			handleErrorSystem(json);
			// error add watchlist
			// if (url.includes('action=add')) {
			//     dataBody = { code: 25010, message: 'Invalid service session key specified' }
			//     handleErrorSystem(dataBody)
			// }
			// if (url.includes('action=modify')) {
			//     dataBody = { code: 25001, message: 'No request ID was specified in the SOAP request parameters' }
			//     handleErrorSystem(dataBody)
			// }
			resolve(json);
		}).catch((errorMessage, statusCode) => {
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			logDevice(
				'error',
				`putData - Error with statusCode: ${statusCode} - errorMessage: ${errorMessage}`
			);
			reject(errorMessage, statusCode);
		});
	});
}

export async function deleteData(url, timeout) {
	return new Promise((resolve, reject) => {
		logDevice('info', 'deleteData from ' + url);
		const userAgent = dataStorage.userAgent;
		const headerObj = {
			Authorization: `Bearer ${Controller.getAccessToken()}`,
			'Content-Type': 'application/json',
			'user-agent': userAgent
		};
		let timeoutId;
		if (timeout) {
			timeoutId = setTimeout(() => {
				const res = {
					errorCode: '["Server.Timeout"]'
				};
				resolve(res);
			}, timeout);
		}
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('DELETE', url, headerObj);
		const timeoutRequestId = setTimeout(() => {
			logDevice(
				'info: ',
				`deleteData have been cancelled at URL: ${url}`
			);
			console.log(`deleteData have been cancelled at URL: ${url}`);
			task && task.cancel();
			const error = {
				errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
			};
			resolve(error);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			if (res.data !== '') {
				const json = res.json();
				logDevice(
					'info',
					`deleteData - Success with response: ${
						json ? JSON.stringify(json) : ''
					}`
				);
				resolve(json);
			}
			resolve();
		}).catch((errorMessage, statusCode) => {
			timeoutId && clearTimeout(timeoutId);
			timeoutRequestId && clearTimeout(timeoutRequestId);
			logDevice(
				'error',
				`deleteData - Error with statusCode: ${statusCode} - errorMessage: ${errorMessage}`
			);
			reject(errorMessage, statusCode);
		});
	});
}

export function getHash(name) {
	const hashUpdate = dataStorage.dicCheckChange[name];
	logDevice(
		'info: ',
		`CACHE ==> hashName: ${name} hashUpdate: ${hashUpdate}`
	);
	return hashUpdate;
}

function checkAddIntradayOrders(to, current) {
	return to > current;
}

function getListDataRealTime(tag) {
	if (!tag) return [];
	const dicOrders = dataStorage.dicOrdersRealTimeCache || {};
	const listData = [];
	for (const key in dicOrders) {
		const element = dicOrders[key];
		if (element.order_tag === tag) {
			listData.push(element);
		}
	}
	return listData;
}

export function getCacheData(url, cacheDataCb, requestDataCb, byPassCache) {
	try {
		return requestDataCb();
		const now = new Date().getTime();
		if (byPassCache) {
			return requestDataCb();
		}
		const cacheObject = cache.getCacheType(url);
		logDevice(
			'info: ',
			`CACHE ==> Get data cacheObject... ${
				cacheObject ? JSON.stringify(cacheObject) : ''
			}`
		);
		if (!cacheObject.table) {
			const time = new Date().getTime();
			console.log('TIME GET CACHE - NO TABLE', (time - now) / 1000);
			logDevice(
				'info',
				`TIME GET CACHE - NO TABLE: ${(time - now) / 1000} s`
			);
			return requestDataCb();
		}
		const mongoInstance = new Mongo(cacheObject.table);
		if (!mongoInstance) {
			return requestDataCb();
		}

		switch (cacheObject.cacheType) {
			case Enum.CACHE_TYPE.SYMBOL_INFO:
				if (
					cacheObject.subPath.symbols &&
					cacheObject.subPath.symbols.length
				) {
					const queryGetSymbol = { $or: [] };
					const dicSymbolQuery = {};
					for (
						let y = 0;
						y < cacheObject.subPath.symbols.length;
						y++
					) {
						const element = cacheObject.subPath.symbols[y];
						const decodeSymbol = decodeURIComponent(element);
						queryGetSymbol.$or.push({ symbol: decodeSymbol });
						dicSymbolQuery[element] = {
							symbol: element,
							needGet: true
						};
					}

					return mongoInstance
						.find(queryGetSymbol)
						.then((res) => {
							const listNeedGetData = [];
							for (let w = 0; w < res.length; w++) {
								const symbolCache = res[w];
								const encodeSymbolCache = encodeURIComponent(
									symbolCache.symbol
								);
								const infoGet =
									dicSymbolQuery[encodeSymbolCache] || {};
								const hashCompare = getHash(
									cacheObject.originTable
								);
								if (
									symbolCache &&
									symbolCache.symbol &&
									symbolCache.exchanges &&
									symbolCache.display_name &&
									symbolCache.hash === hashCompare
								) {
									infoGet.needGet = false;
								} else {
									infoGet.needGet = true;
								}
								dicSymbolQuery[encodeSymbolCache] = infoGet;
							}

							for (const key in dicSymbolQuery) {
								const element = dicSymbolQuery[key];
								if (element.needGet) {
									listNeedGetData.push(element.symbol);
								}
							}

							if (listNeedGetData.length) {
								let queryString = '';
								for (
									let r = 0;
									r < listNeedGetData.length;
									r++
								) {
									const needGet = listNeedGetData[r];
									// const encodeSplash = encodeURIComponent(needGet);
									queryString += `${needGet}${
										r === listNeedGetData.length - 1
											? ''
											: ','
									}`;
								}
								const newUrl = `${getSymbolUrl(
									false,
									true
								)}${queryString}`;
								return requestDataCb(res, newUrl);
							} else {
								logDevice(
									'info: ',
									'CACHE ==> GET DATA FROM CACHE...'
								);
								return cacheDataCb(res);
							}
						})
						.catch((e) => {
							return requestDataCb();
						});
				}
				return requestDataCb();
			case Enum.CACHE_TYPE.SYMBOL_SEARCH:
				if (cacheObject.url) {
					return mongoInstance
						.findOnce({ url: cacheObject.url })
						.then((res) => {
							const hashCompare = getHash(
								cacheObject.originTable
							);
							if (
								res &&
								res.hash &&
								res.data &&
								res.hash === hashCompare
							) {
								logDevice(
									'info: ',
									'CACHE ==> GET DATA FROM CACHE...'
								);
								return cacheDataCb(res.data);
							} else {
								logDevice(
									'info: ',
									'CACHE ==> GET DATA FROM REQUEST...'
								);
								return requestDataCb(res);
							}
						})
						.catch((e) => {
							return requestDataCb();
						});
				}
				return requestDataCb();
			case Enum.CACHE_TYPE.ORDERS_OPEN:
			case Enum.CACHE_TYPE.ORDERS_STOPLOSS:
				return mongoInstance
					.findAll()
					.then((res) => {
						logDevice(
							'info: ',
							'CACHE ==> GET DATA FROM CACHE FOR OPEN ORDER...'
						);
						const params = cacheObject.params || {};
						const tag = params.tag || '';
						const listDataResult = [];
						// const dicTemp = dataStorage.dicOrdersRealTimeCache || {};
						// for (let f = 0; f < res.length; f++) {
						//     const objData = res[f];
						//     const dataCheck = dicTemp[objData.client_order_id];

						//     if (cacheObject.cacheType === Enum.CACHE_TYPE.ORDERS_OPEN && objData.order_tag === Enum.ORDERS_TYPE_FILTER.open) {
						//         if (dataCheck && dataCheck.order_tag !== Enum.ORDERS_TYPE_FILTER.open) {

						//         } else {
						//             listDataResult.push(objData);
						//         }
						//     }
						//     if (cacheObject.cacheType === Enum.CACHE_TYPE.ORDERS_STOPLOSS && objData.order_tag === Enum.ORDERS_TYPE_FILTER.stoploss) {
						//         if (dataCheck && dataCheck.order_tag !== Enum.ORDERS_TYPE_FILTER.stoploss) {

						//         } else {
						//             listDataResult.push(objData);
						//         }
						//     }
						// }
						const listRealTime = getListDataRealTime(tag);
						const cacheData = [...listDataResult, ...listRealTime];
						const cacheDataAfterRemoveDuplicate =
							Util.getListOrderAfterRemoveDuplicate(cacheData);

						return cacheDataCb(cacheDataAfterRemoveDuplicate);
					})
					.catch((e) => {
						return requestDataCb();
					});
			case Enum.CACHE_TYPE.ORDERS_CANCELLED:
			case Enum.CACHE_TYPE.ORDERS_FILLED:
				if (
					cacheObject.params &&
					cacheObject.params.from &&
					cacheObject.params.to
				) {
					const now = new Date();
					const startDayByLocation =
						DateTime.convertLocationToStartDaySettingTime(now);
					const timeStamp = startDayByLocation - 1;
					const fromTemp = parseInt(cacheObject.params.from);
					const toTemp = parseInt(cacheObject.params.to);
					let from = fromTemp;
					let to = toTemp;
					if (from > timeStamp) {
						let fileName = '';
						if (
							cacheObject.params.tag ===
							Enum.ORDERS_TYPE_FILTER.filled
						) {
							fileName = Enum.TABLE_NAME.filled_order_intraday;
						} else if (
							cacheObject.params.tag ===
							Enum.ORDERS_TYPE_FILTER.cancelled
						) {
							fileName = Enum.TABLE_NAME.cancelled_order_intraday;
						}
						const ordersInstance = new Mongo(
							`${dataStorage.accountId}_${fileName}`
						);
						return ordersInstance
							.findAll()
							.then((ordersIntraday) => {
								const paramsInput = cacheObject.params || {};
								const tagFilter = paramsInput.tag || '';
								const listDataRealTime =
									getListDataRealTime(tagFilter);
								const cacheData = [
									...ordersIntraday,
									...listDataRealTime
								];
								const cacheDataAfterRemoveDuplicate =
									Util.getListOrderAfterRemoveDuplicate(
										cacheData
									);
								return cacheDataCb(
									cacheDataAfterRemoveDuplicate,
									[]
								);
							});
					}
					if (to >= timeStamp) {
						to = timeStamp;
					}
					if (from >= timeStamp) {
						from = timeStamp;
					}
					const queryUpdateTable = {
						$or: [
							{
								$and: [
									{ from: { $gte: from } },
									{ from: { $lte: to } }
								]
							},
							{
								$and: [
									{ to: { $gte: from } },
									{ to: { $lte: to } }
								]
							}
						]
					};
					const mongoInstanceUpdated = new Mongo(
						`${cacheObject.table}_updated`
					);
					mongoInstanceUpdated
						.find(queryUpdateTable)
						.then((res) => {
							const listSort = res.sort((a, b) => {
								return a.from - b.from;
							});
							logDevice(
								'info',
								`CACHE ==> LIST DATA SORT: ${JSON.stringify(
									listSort
								)}`
							);
							const listData = [];
							const listQuery = [];
							let min = null;
							let max = null;
							for (let o = 0; o < listSort.length; o++) {
								const item = listSort[o];
								const obj = { from: null, to: null };
								if (item.from <= from) {
									obj.from = from;
								} else {
									obj.from = item.from;
								}
								if (!min || min >= obj.from) {
									min = obj.from;
								}
								if (item.to >= to) {
									obj.to = to;
								} else {
									obj.to = item.to;
								}
								if (!max || max >= obj.to) {
									max = obj.to;
								}
								listData.push(obj);
							}
							logDevice(
								'info',
								`CACHE ==> LIST DATA GET CALCULATOR: ${JSON.stringify(
									listData
								)}`
							);
							const listUrl = [];
							if (min && max) {
								for (let y = 0; y < listData.length; y++) {
									const eTemp = listData[y];
									if (y === 0) {
										if (eTemp.from > from) {
											listQuery.push({
												from: from,
												to: eTemp.from
											});
										}
									}
									if (y === listData.length - 1) {
										if (eTemp.to < to) {
											listQuery.push({
												from: eTemp.to,
												to: to
											});
										}
									} else {
										const nextItem = listData[y + 1];
										if (eTemp.to < nextItem.from) {
											listQuery.push({
												from: eTemp.to,
												to: nextItem.from
											});
										}
									}
								}
							} else {
								listQuery.push({ from, to });
							}
							logDevice(
								'info',
								`CACHE ==> LIST DATA QUERY: ${JSON.stringify(
									listQuery
								)}`
							);
							for (let b = 0; b < listQuery.length; b++) {
								const queryObj = listQuery[b];
								const url = getUrlOrderByTag(
									cacheObject.params.tag,
									cacheObject.params.account_id,
									queryObj.from,
									queryObj.to
								);
								listUrl.push(url);
							}
							logDevice('info', 'CACHE ==> TIME IMPORT SUCCESS');
							const queryDataOrders = {
								$and: [
									{ exchange_updated: { $gte: from } },
									{ exchange_updated: { $lte: to } }
								]
							};
							return mongoInstance
								.find(queryDataOrders)
								.then((resOrders) => {
									logDevice(
										'info: ',
										'CACHE ==> GET DATA FROM CACHE FOR OPEN ORDER...'
									);
									let fileName = '';
									if (
										cacheObject.params.tag ===
										Enum.ORDERS_TYPE_FILTER.filled
									) {
										fileName =
											Enum.TABLE_NAME
												.filled_order_intraday;
									} else if (
										cacheObject.params.tag ===
										Enum.ORDERS_TYPE_FILTER.cancelled
									) {
										fileName =
											Enum.TABLE_NAME
												.cancelled_order_intraday;
									}
									const ordersInstance = new Mongo(
										`${dataStorage.accountId}_${fileName}`
									);
									ordersInstance
										.findAll()
										.then((intradayOrders) => {
											const params =
												cacheObject.params || {};
											const tag = params.tag || '';
											const listRealTime =
												getListDataRealTime(tag);
											// Nếu to < timeStamp -> Không merge phần data realtime trong ngày và intradayOrders
											const isAddIntradayOrders =
												checkAddIntradayOrders(
													toTemp,
													timeStamp
												);

											let cacheData = [...resOrders];
											if (isAddIntradayOrders) {
												cacheData = [
													...resOrders,
													...intradayOrders,
													...listRealTime
												];
											}
											const cacheDataAfterRemoveDuplicate =
												Util.getListOrderAfterRemoveDuplicate(
													cacheData
												);
											return cacheDataCb(
												cacheDataAfterRemoveDuplicate,
												listUrl
											);
										});
								})
								.catch((e) => {
									return requestDataCb();
								});
						})
						.catch((er) => {
							logDevice(
								'info',
								'CACHE ==> CAN NOT GET DATA FROM ORDER_UPDATED'
							);
							return requestDataCb();
						});
				}
			case Enum.CACHE_TYPE.PERSONAL:
				const query = { $or: [] };
				query.$or.push({ user_id: func.getUserId() });
				return getWatchListCache(
					mongoInstance,
					query,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.SP20:
				const queryTop20 = { $or: [] };
				queryTop20.$or.push({ watchlist: 'top-asx-20' });
				return getWatchListCache(
					mongoInstance,
					queryTop20,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.SP50:
				const queryTop50 = { $or: [] };
				queryTop50.$or.push({ watchlist: 'top-asx-50' });
				return getWatchListCache(
					mongoInstance,
					queryTop50,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.SP100:
				const queryTop100 = { $or: [] };
				queryTop100.$or.push({ watchlist: 'top-asx-100' });
				return getWatchListCache(
					mongoInstance,
					queryTop100,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.SP200:
				const queryTop200 = { $or: [] };
				queryTop200.$or.push({ watchlist: 'top-asx-200' });
				return getWatchListCache(
					mongoInstance,
					queryTop200,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NYSE1:
				const queryNyse1 = { $or: [] };
				queryNyse1.$or.push({ watchlist: 'tradable-NYSE-01' });
				return getWatchListCache(
					mongoInstance,
					queryNyse1,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NYSE2:
				const queryNyse2 = { $or: [] };
				queryNyse2.$or.push({ watchlist: 'tradable-NYSE-02' });
				return getWatchListCache(
					mongoInstance,
					queryNyse2,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NYSE3:
				const queryNyse3 = { $or: [] };
				queryNyse3.$or.push({ watchlist: 'tradable-NYSE-03' });
				return getWatchListCache(
					mongoInstance,
					queryNyse3,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NYSE4:
				const queryNyse4 = { $or: [] };
				queryNyse4.$or.push({ watchlist: 'tradable-NYSE-04' });
				return getWatchListCache(
					mongoInstance,
					queryNyse4,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NYSE5:
				const queryNyse5 = { $or: [] };
				queryNyse5.$or.push({ watchlist: 'tradable-NYSE-05' });
				return getWatchListCache(
					mongoInstance,
					queryNyse5,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NASDAQ1:
				const queryNasDaq1 = { $or: [] };
				queryNasDaq1.$or.push({ watchlist: 'tradable-NASDAQ-01' });
				return getWatchListCache(
					mongoInstance,
					queryNasDaq1,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.NASDAQ2:
				const queryNasDaq2 = { $or: [] };
				queryNasDaq2.$or.push({ watchlist: 'tradable-NASDAQ-02' });
				return getWatchListCache(
					mongoInstance,
					queryNasDaq2,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.XASE:
				const queryXase = { $or: [] };
				queryXase.$or.push({ watchlist: 'tradable-XASE' });
				return getWatchListCache(
					mongoInstance,
					queryXase,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.ARCX:
				const queryArcx = { $or: [] };
				queryArcx.$or.push({ watchlist: 'tradable-ARCX' });
				return getWatchListCache(
					mongoInstance,
					queryArcx,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.TOPGAINERS:
				const queryTopGainers = { $or: [] };
				queryTopGainers.$or.push({ watchlist: 'top-price-gainer' });
				return getWatchListCache(
					mongoInstance,
					queryTopGainers,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.TOPLOSERS:
				const queryTopLosers = { $or: [] };
				queryTopLosers.$or.push({ watchlist: 'top-price-loser' });
				return getWatchListCache(
					mongoInstance,
					queryTopLosers,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			case Enum.CACHE_TYPE.TOPVALUE:
				const queryTopValue = { $or: [] };
				queryTopValue.$or.push({ watchlist: 'top-price-market-value' });
				return getWatchListCache(
					mongoInstance,
					queryTopValue,
					cacheObject.originTable,
					cacheDataCb,
					requestDataCb
				);
			// case Enum.CACHE_TYPE.ORDER_TRANSACTIONS:
			// 	const arrNoneParams = url.split('?')[0]
			// 	const arrPath = arrNoneParams.split('/')
			// 	const symbol = arrPath.pop();
			// 	if (dataStorage.dicOrderTransaction && Object.keys(dataStorage.dicOrderTransaction).length && dataStorage.dicOrderTransaction[symbol]) {
			// 		return cacheDataCb(dataStorage.dicOrderTransaction[symbol])
			// 	}
			// 	return requestDataCb();
			case Enum.CACHE_TYPE.ORDERS_DETAIL:
				return OrderDetailCache.getDataCacheByUrl(
					url,
					mongoInstance,
					cacheDataCb,
					requestDataCb
				);
		}
		return requestDataCb();
	} catch (error) {
		console.log(1);
	}
}

export function setDataCache(url, newData, oldData) {}

export function setDataCachePersonal(newData) {
	const isDemo = Controller.isDemo();
	const cacheType = Enum.CACHE_TYPE.PERSONAL;
	const table = `${isDemo ? 'demo' : 'prod'}_${func.getUserId()}_${
		Enum.TABLE_NAME.personal
	}`;
	const originTable = Enum.TABLE_NAME.personal;
	const cacheObject = {
		cacheType,
		table,
		originTable
	};
	logDevice(
		'info: ',
		`CACHE ==> Set data cacheObject... ${
			cacheObject ? JSON.stringify(cacheObject) : ''
		}`
	);
	const mongoInstance = new Mongo(cacheObject.table);
	if (!mongoInstance) {
		return requestDataCb();
	}
	const hashTable = getHash(cacheObject.originTable);
	const queryRemove = { $or: [{ user_id: func.getUserId() }] };
	console.log('set data cache personal');
	return setWatchListCache(
		mongoInstance,
		newData,
		hashTable,
		'personal',
		queryRemove
	);
}

export function requestData(
	url,
	useToken = false,
	cb = null,
	byPassCache = false,
	setMinTimeToLoading = false,
	forceUseAccesToken = false
) {
	let numberOfResend = 0;
	return new Promise((resolve, reject) => {
		const callbackTimeout = (countResend = 0) => {
			console.log('RESEND GET REQUEST', countResend, new Date(), url);
			logDevice('info', `RESEND GET REQUEST: ${url} AT ${new Date()}`);
			countResend += 1;
			if (countResend >= NUMBER_RESEND_REQUEST) {
				return reject('cancelled');
			}
			requestGetData(
				url,
				useToken,
				cb,
				byPassCache,
				callbackTimeout,
				resolve,
				reject,
				setMinTimeToLoading,
				countResend,
				forceUseAccesToken
			);
		};
		requestGetData(
			url,
			useToken,
			cb,
			byPassCache,
			callbackTimeout,
			resolve,
			reject,
			setMinTimeToLoading,
			numberOfResend,
			forceUseAccesToken
		);
	});
}

export function requestData1(
	url,
	useToken = false,
	cb = null,
	byPassCache = false
) {
	let numberOfResend = 0;
	return new Promise((resolve, reject) => {
		const callbackTimeout = (countResend = 0) => {
			console.log('RESEND GET REQUEST', countResend, new Date(), url);
			logDevice('info', `RESEND GET REQUEST: ${url} AT ${new Date()}`);
			countResend += 1;
			if (countResend >= NUMBER_RESEND_REQUEST) {
				return reject('cancelled');
			}
			requestGetData1(
				url,
				useToken,
				cb,
				byPassCache,
				callbackTimeout,
				resolve,
				reject,
				countResend
			);
		};
		requestGetData1(
			url,
			useToken,
			cb,
			byPassCache,
			callbackTimeout,
			resolve,
			reject,
			numberOfResend
		);
	});
}

export function requestDataWithRequestID(
	url,
	useToken = false,
	cb = null,
	byPassCache = false,
	setMinTimeToLoading = false,
	requestID
) {
	if (url === null || url === undefined) {
		console.log('requestData NULL');
	}
	let numberOfResend = 0;
	return new Promise((resolve, reject) => {
		const callbackTimeout = (countResend = 0) => {
			console.log('RESEND GET REQUEST', countResend, new Date(), url);
			logDevice('info', `RESEND GET REQUEST: ${url} AT ${new Date()}`);
			countResend += 1;
			if (countResend > 3) {
				return reject({
					errorCode: 'cancelled',
					requestID
				});
			}
			requestGetDataWithRequestID(
				url,
				useToken,
				cb,
				byPassCache,
				callbackTimeout,
				resolve,
				reject,
				setMinTimeToLoading,
				countResend,
				requestID
			);
		};
		requestGetDataWithRequestID(
			url,
			useToken,
			cb,
			byPassCache,
			callbackTimeout,
			resolve,
			reject,
			setMinTimeToLoading,
			numberOfResend,
			requestID
		);
	});
}

export async function requestGetDataWithRequestID(
	url,
	useToken = false,
	cb = null,
	byPassCache = false,
	callbackTimeout = null,
	resolve,
	reject,
	setMinTimeToLoading,
	numberOfResend,
	requestID
) {
	const userAgent = dataStorage.userAgent;
	const headerObj = {
		Authorization: `Bearer ${Controller.getAccessToken()}`,
		'user-agent': userAgent
	};
	let status = 0;
	const timeStartRequest = new Date().getTime();
	const task = RNFetchBlob.config({
		trusty: true
	}).fetch('GET', url, headerObj);
	const timeoutId = setTimeout(() => {
		logDevice(
			'info: ',
			`requestData have been cancelled - URL: ${url} -> RESEND REQUEST`
		);
		task && task.cancel();
		// resend request
		callbackTimeout && callbackTimeout(numberOfResend);
	}, TIMEOUT_GET_REQUEST);
	task.then((res) => {
		timeoutId && clearTimeout(timeoutId);
		const info = res.info();
		status = info.status;
		return res.text();
	})
		.then((responseText) => {
			let dataBody = null;
			logDevice(
				'info',
				`${
					(new Date().getTime() - timeStartRequest) / 1000
				}s TO GET DATA SUCCESS FROM URL: ${url} - SUCCESS - RESPONSE: ${responseText}`
			);
			if (responseText && status !== 200) {
				if (responseText.length === 0) {
					logDevice(
						'error',
						`FAILED - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${responseText} - STATUS: ${status}`
					);
					dataBody = null;
				} else {
					// Check session id timeout
					dataBody = JSON.parse(responseText) || responseText;
					handleErrorSystem(dataBody);
				}
			} else if (responseText) {
				dataBody = JSON.parse(responseText) || responseText;
				// dataBody = fakeErrorSystem({ dataBody, url });
				dataBody.requestID = requestID;
				logDevice(
					'info',
					`SUCCESS - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${responseText}`
				);
			} else {
				logDevice(
					'error',
					`FAILED - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${responseText}`
				);
				dataBody = null;
			}

			setResolveAfterLoading(
				setMinTimeToLoading,
				timeStartRequest,
				() => {
					resolve(dataBody);
				}
			);
		})
		.catch((errorMessage, statusCode) => {
			if (
				errorMessage.message &&
				((errorMessage.message + '').toUpperCase() === 'CANCELLED' ||
					(errorMessage.message + '').toUpperCase() === 'CANCELED')
			) {
				logDevice('error', `RNFETCHBLOB CANCELED`);
				return reject({
					errorCode: 'cancelled',
					requestID
				});
			}
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			logDevice(
				'error',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
			);
			timeoutId && clearTimeout(timeoutId);
			reject({
				message: errorMessage.message,
				requestID
			});
		});
	cb && cb(task);
}
function isUrlFakeError(url) {
	return (
		url.includes('balance') ||
		url.includes('watchlist?watchlist') ||
		url.includes('order_tag') ||
		url.includes('portfolio/total') ||
		url.includes('vendor_code') ||
		url.includes('security-name') ||
		url.includes('class=equity') ||
		url.includes('Mobile%20Favourite') ||
		url.includes('market-info') ||
		url.includes('historical') ||
		url.includes('feed-snapshot') ||
		url.includes('news?from_date') ||
		url.includes('feed-snapshot/security-name') ||
		// url.includes('market-activity/exchange') ||
		// url.includes('market-activity/market_group') ||
		url.includes('attributes') ||
		url.includes('market-activity/watchlist') ||
		url.includes('fee') ||
		url.includes('order') ||
		url.includes(`watchlist/${dataStorage.userPriceBoard}/iressuser`) || // fake trade list
		url.includes('v1/fee') ||
		url.includes('watchlist/inquery?filter_all=1')
	);
}
export function fakeErrorSystem({ dataBody, url }) {
	const code = errorSettingModel.code;
	const message = errorSettingModel.message;
	const reTryNumber = errorSettingModel.numberRetrySuccess;
	if (code) {
		if (isUrlFakeError(url) && getNumReTry() < reTryNumber) {
			dataBody = { code, message };
			handleErrorSystem(dataBody);
		} else {
			if (isUrlFakeError(url)) {
				handleHideMessage();
			}
		}
	}
	return dataBody;
}
export async function requestGetData(
	url,
	useToken = false,
	cb = null,
	byPassCache = false,
	callbackTimeout = null,
	resolve,
	reject,
	setMinTimeToLoading,
	numberOfResend,
	forceUseAccesToken
) {
	const userAgent = dataStorage.userAgent;
	const headerObj = {
		Authorization: `Bearer ${
			forceUseAccesToken || Controller.getAccessToken()
		}`,
		'user-agent': userAgent
	};
	// console.log(headerObj, 'headerObj')
	let status = 0;
	const timeStartRequest = new Date().getTime();
	const task = RNFetchBlob.config({
		trusty: true
	}).fetch('GET', url, headerObj);
	const timeoutId = setTimeout(() => {
		logDevice(
			'info: ',
			`requestData have been cancelled - URL: ${url} -> RESEND REQUEST`
		);
		console.log(`requestData have been cancelled at URL: ${url}`);
		task && task.cancel();
		// resend request
		callbackTimeout && callbackTimeout(numberOfResend);
	}, TIMEOUT_GET_REQUEST);
	task.then((res) => {
		handleErrorSystem(res.data);
		const timeReceiveRespone = new Date().getTime();
		const timeRequest = timeReceiveRespone - timeStartRequest;
		console.log(
			'request data',
			`${timeRequest / 1000}s TO GET DATA REQUEST FROM URL: ${url}`
		);
		// logDevice(
		// 	'REQUEST BODY',
		// 	`SUCCESS FROM URL: ${url} - SUCCESS - RESPONSE: ${res}`
		// );
		timeoutId && clearTimeout(timeoutId);
		const info = res.info();
		status = info.status;
		return res.text();
	})
		.then((responseText) => {
			let dataBody = null;
			console.log('response text: ', responseText);
			logDevice(
				'info',
				`${
					(new Date().getTime() - timeStartRequest) / 1000
				}s TO GET DATA SUCCESS FROM URL: ${url} - SUCCESS - RESPONSE: ${responseText} - STATUS: ${status}`
			);

			if (status !== 200) {
				// if (Util.checkErrorCodeKickOut(responseText)) {
				//     logDevice(
				//         'error',
				//         `KICKOUT requestGetData - GET DATA FROM ${url} - DATA: ${responseText} - STATUS: ${status}`
				//     );
				//     return kickOut();
				// }
				dataBody = JSON.parse(responseText) || responseText;
				handleErrorSystem(dataBody);
			} else {
				dataBody = JSON.parse(responseText) || responseText;
				// dataBody = fakeErrorSystem({ dataBody, url });
			}

			setResolveAfterLoading(
				setMinTimeToLoading,
				timeStartRequest,
				() => {
					resolve(dataBody);
				}
			);
		})
		.catch((errorMessage, statusCode) => {
			if (
				errorMessage.message &&
				((errorMessage.message + '').toUpperCase() === 'CANCELLED' ||
					(errorMessage.message + '').toUpperCase() === 'CANCELED')
			) {
				logDevice('error', `RNFETCHBLOB CANCELED`);
				return reject('cancelled');
			}
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'request data failed',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
			);
			logDevice(
				'error',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
			);
			timeoutId && clearTimeout(timeoutId);
			reject(errorMessage);
		});
	cb && cb(task);
}

export function kickOut() {
	Controller.showErrorLogOut();
}

export async function requestGetData1(
	url,
	useToken = false,
	cb = null,
	byPassCache = false,
	callbackTimeout = null,
	resolve,
	reject,
	numberOfResend
) {
	const userAgent = dataStorage.userAgent;
	const accessToken = Controller.getAccessToken();
	const headerObj = {
		Authorization: `Bearer ${accessToken}`,
		'user-agent': userAgent
	};
	let status = 0;
	const newPath = url;
	const timeStartRequest = new Date().getTime();

	const task = RNFetchBlob.config({
		trusty: true
	}).fetch('GET', newPath, headerObj);
	const timeoutId = setTimeout(() => {
		task && task.cancel();

		// resend request
		callbackTimeout && callbackTimeout(numberOfResend);
	}, TIMEOUT_GET_REQUEST);
	task.then((res) => {
		timeoutId && clearTimeout(timeoutId);
		const info = res.info();
		status = info.status;
		return res.text();
	})
		.then((responseText) => {
			logDevice(
				'info',
				`GET DATA FROM ${url} - TOKEN: ${accessToken} - DATA: ${responseText} - STATUS: ${status}`
			);
			let dataBody = null;
			if (responseText && status !== 200) {
				if (responseText.length === 0) {
					dataBody = null;
				} else {
					dataBody = JSON.parse(responseText) || responseText;
					handleErrorSystem(dataBody);
				}
			} else if (responseText) {
				dataBody = JSON.parse(responseText) || responseText;
				// dataBody = fakeErrorSystem({ dataBody, url });
			} else {
				dataBody = null;
			}
			resolve(dataBody);
		})
		.catch((errorMessage, statusCode) => {
			if (
				errorMessage.message &&
				((errorMessage.message + '').toUpperCase() === 'CANCELLED' ||
					(errorMessage.message + '').toUpperCase() === 'CANCELED')
			) {
				logDevice('error', `RNFETCHBLOB CANCELED`);
				return reject('cancelled');
			}
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'request data failed',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
			);
			logDevice(
				'error',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
			);
			timeoutId && clearTimeout(timeoutId);
			reject(errorMessage);
		});
	cb && cb(task);
}

export async function requestDataTimeoutCancel(
	url,
	useToken = false,
	cb = null,
	byPassCache = false
) {
	return new Promise((resolve, reject) => {
		const userAgent = dataStorage.userAgent;
		const headerObj = {
			Authorization: `Bearer ${dataStorage.accessToken}`,
			'user-agent': userAgent
		};
		let status = 0;
		const timeStartRequest = new Date().getTime();
		logDevice('info', 'get data from ' + url);
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('GET', url, headerObj);
		const timeoutId = setTimeout(() => {
			logDevice(
				'info: ',
				`requestData have been cancelled - URL: ${url}`
			);
			console.log(`requestData have been cancelled at URL: ${url}`);
			task && task.cancel();
			const error = {
				errorCode: 'CANCEL_REQUEST'
			};
			reject(error);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'request data',
				`${timeRequest / 1000}s TO GET DATA REQUEST FROM URL: ${url}`
			);
			logDevice(
				'info',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${url} - SUCCESS`
			);
			timeoutId && clearTimeout(timeoutId);
			const info = res.info();
			status = info.status;
			return res.text();
		})
			.then((responseText) => {
				let dataBody = null;
				console.log('REQUEST URL: ', url);
				console.log('response text: ', responseText);
				logDevice(
					'info',
					`GET - URL: ${url} - RESPONSE: ${responseText}`
				);
				if (
					responseText &&
					(status !== 200 || responseText.length === 0)
				) {
					sendToRocketChat(
						'responseText contain Error when get Data from: ' + url
					);
					sendToRocketChat(responseText);
					logDevice(
						'error',
						`FAILED - GET DATA FROM ${url} - TOKEN: ${dataStorage.accessToken} - DATA: ${responseText} - STATUS: ${status}`
					);
					dataBody = null;
				} else {
					if (responseText) {
						dataBody = JSON.parse(responseText) || responseText;
						logDevice(
							'info',
							`SUCCESS - GET DATA FROM ${url} - TOKEN: ${dataStorage.accessToken} - DATA: ${responseText}`
						);
					} else {
						sendToRocketChat(
							'responseText is empty when get Data from: ' + url
						);
						logDevice(
							'error',
							`FAILED - GET DATA FROM ${url} - TOKEN: ${dataStorage.accessToken} - DATA: ${responseText}`
						);
						dataBody = null;
					}
				}
				resolve(dataBody);
			})
			.catch((errorMessage, statusCode) => {
				const timeReceiveRespone = new Date().getTime();
				const timeRequest = timeReceiveRespone - timeStartRequest;
				console.log(
					'request data failed',
					`${
						timeRequest / 1000
					}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
				);
				logDevice(
					'error',
					`${
						timeRequest / 1000
					}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
				);
				timeoutId && clearTimeout(timeoutId);
				reject(errorMessage);
			});
	});
}

function createPromiseRequest(url, oldData) {
	return new Promise((resolve, reject) => {
		const headerObj = {
			Authorization: `Bearer ${Controller.getAccessToken()}`
		};
		let status = 0;
		const path = url;
		const timeStartRequest = new Date().getTime();
		logDevice('info', 'get data from ' + url);
		const newPath = path;
		const task = RNFetchBlob.config({
			trusty: true
		}).fetch('GET', newPath, headerObj);
		const timeoutId = setTimeout(() => {
			logDevice(
				'info: ',
				`requestData have been cancelled - URL: ${newPath}`
			);
			console.log(`requestData have been cancelled at URL: ${newPath}`);
			task && task.cancel();
			const error = {
				errorCode: Enum.ERROR_CODE.CANCEL_REQUEST
			};
			resolve(error);
		}, TIMEOUT_REQUEST);
		task.then((res) => {
			const timeReceiveRespone = new Date().getTime();
			const timeRequest = timeReceiveRespone - timeStartRequest;
			console.log(
				'request data',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${newPath}`
			);
			logDevice(
				'info',
				`${
					timeRequest / 1000
				}s TO GET DATA REQUEST FROM URL: ${newPath} - SUCCESS`
			);
			timeoutId && clearTimeout(timeoutId);
			const info = res.info();
			status = info.status;
			return res.text();
		})
			.then((responseText) => {
				let dataBody = null;
				console.log('REQUEST URL: ', newPath);
				console.log('response text: ', responseText);
				logDevice(
					'info',
					`GET - URL: ${newPath} - RESPONSE: ${responseText}`
				);
				if (
					responseText &&
					(status !== 200 || responseText.length === 0)
				) {
					logDevice(
						'error',
						`FAILED - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${responseText} - STATUS: ${status}`
					);
					dataBody = null;
				} else if (responseText) {
					dataBody = JSON.parse(responseText) || responseText;
					logDevice(
						'info',
						`SUCCESS - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${responseText}`
					);
				} else {
					logDevice(
						'error',
						`FAILED - GET DATA FROM ${url} - TOKEN: ${Controller.getAccessToken()} - DATA: ${responseText}`
					);
					dataBody = null;
				}
				setDataCache(newPath, dataBody, oldData);
				resolve(dataBody);
			})
			.catch((errorMessage, statusCode) => {
				const timeReceiveRespone = new Date().getTime();
				const timeRequest = timeReceiveRespone - timeStartRequest;
				console.log(
					'request data failed',
					`${
						timeRequest / 1000
					}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
				);
				logDevice(
					'info',
					`${
						timeRequest / 1000
					}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
				);
				timeoutId && clearTimeout(timeoutId);
				sendToRocketChat('error get Data from: ' + newPath);
				sendToRocketChat(errorMessage);
				reject(errorMessage);
			});
	});
}

export function getRelatedSymbolUrl() {
	if (!dataStorage.isLoadAnalys) dataStorage.isLoadAnalys = true;
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/analysis/symbol`;
}

/* #region API order */
export function getApiVettingByAccount(accountID) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/branch/account/${accountID}`;
}

export function getApiVettingPlaceOrder() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version',
		(forceChange = true)
	)}/order/vetting/place`; // POST
}

export function getApiVettingAmendOrder(orderID) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/vetting/amend/${orderID}`; // PUT
}

export function getApiVettingCancelOrder(orderID) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/vetting/cancel/${orderID}`; // DELETE
}

export function getApiListSubOrder(parentOrderID) {
	const accountID = Controller.getAccountId();
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/order_sub/${parentOrderID}?account_id=${accountID}`;
}
/* #endregion */

/* #region API user/account */
export function getApiSecretKey(randomKey) {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/auth/session?session_id=${randomKey}`;
}

export function getApiSearchAccount(pageID, pageSize, filter) {
	const userID = Controller.getUserId();
	const userType = Controller.getUserType();
	if (filter) {
		if (userType === Enum.USER_TYPE.ADVISOR) {
			return `${Controller.getBaseUrl()}/${Controller.getVersion(
				'version'
			)}/advisor/user/account/inquery?user_id=${userID}&page_id=${pageID}&page_size=${pageSize}&filter=${filter}`; // SEARCH ACCOUNT
		}
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/user/account/inquery?user_id=${userID}&page_id=${pageID}&page_size=${pageSize}&filter=${filter}`; // SEARCH ACCOUNT
	}
	if (userType === Enum.USER_TYPE.ADVISOR) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/advisor/user/account/inquery?user_id=${userID}&page_id=${pageID}&page_size=${pageSize}`; // ALL ACCOUNT
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/account/inquery?user_id=${userID}&page_id=${pageID}&page_size=${pageSize}`; // ALL ACCOUNT
}

export function getApiCheckAccountMapping(accountID) {
	const userID = Controller.getUserId();
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/user/mapping_account/${userID}/${accountID}`;
}
/* #endregion */

/* #region Alert function */
export function getApiCreateAlert() {
	const userID = Controller.getUserId();
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/alert/${userID}`;
}

export function getApiModifyAlert(alertID) {
	const userID = Controller.getUserId();
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/alert?user_id=${userID}&alert_id=${alertID}`;
}

export function getApiDeleteAlert(alertID) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/alert/${alertID}`;
}

export function getApiGetListAlerts() {
	const userID = Controller.getUserId();
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/alert?user_id=${userID}`;
}

export function getUrlSubscribeFCM() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/fcm/subscribe?type=alert`;
}

export function getUrlUnsubscribeFCM() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/fcm/unsubscribe?type=alert`;
}

export function getUrlGetVendorNews() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/news/vendors`;
}

export function getUrlGetCategoryNews() {
	return `${Controller.getBaseUrl(true)}/${Controller.getVersion(
		'version'
	)}/news/categories`;
}

export function requestDataWithBody(
	url,
	body,
	useToken = false,
	cb = null,
	byPassCache = false
) {
	return new Promise((resolve, reject) => {
		requestPostData(
			url,
			body,
			(useToken = false),
			(cb = null),
			(byPassCache = false),
			null,
			resolve,
			reject
		);
	});
}

export async function requestPostData(
	url,
	body,
	useToken = false,
	cb = null,
	byPassCache = false,
	callbackTimeout = null,
	resolve,
	reject,
	setMinTimeToLoading
) {
	const userAgent = dataStorage.userAgent;
	const headerObj = {
		Authorization: `Bearer ${Controller.getAccessToken()}`,
		'Content-Type': 'application/json',
		'user-agent': userAgent
	};
	let status = 0;
	const newPath = url;
	const timeStartRequest = new Date().getTime();

	const task = RNFetchBlob.config({
		trusty: true
	}).fetch('POST', newPath, headerObj, JSON.stringify(body));
	const timeoutId = setTimeout(() => {
		task && task.cancel();

		// resend request
		callbackTimeout && callbackTimeout();
	}, TIMEOUT_GET_REQUEST);
	task.then((responseText) => {
		if (responseText.hasOwnProperty('message')) {
			console.log('ElasticSearch Order list - message', responseText);
		}
		let dataBody = null;
		if (responseText && (status !== 200 || responseText.length === 0)) {
			dataBody = JSON.parse(responseText.data) || responseText.data;
		}
		setDataCache(newPath, dataBody, null);
		setResolveAfterLoading(setMinTimeToLoading, timeStartRequest, () => {
			resolve(dataBody);
		});
	}).catch((errorMessage, statusCode) => {
		if (errorMessage.message && errorMessage.message === 'cancelled') {
			logDevice('error', `RNFETCHBLOB CANCELED`);
			return;
		}
		const timeReceiveRespone = new Date().getTime();
		const timeRequest = timeReceiveRespone - timeStartRequest;
		console.log(
			'request data failed',
			`${
				timeRequest / 1000
			}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
		);
		logDevice(
			'error',
			`${
				timeRequest / 1000
			}s TO GET DATA REQUEST FROM URL: ${url} - FAILED: ${errorMessage}`
		);
		timeoutId && clearTimeout(timeoutId);
		reject(errorMessage);
	});
	cb && cb(task);
}

export function getUrlExchange() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-activity/exchange`;
}

export function getUrlMarketGroup() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-activity/market_group`;
}

export function getUrlMarketWatchlist(watchlistId, exchange, marketGroup) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-activity/watchlist?watchlist=${watchlistId}&exchange=${exchange}&market_group=${marketGroup}`;
}

export function getUrlTradingPeriod(exchange, symbol) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/market-info/trading-period?symbol=${symbol}&exchange=${exchange}`;
}

export function getUrlPortfolioType(accessMode = 0, params = false) {
	// return `http://172.20.10.5:8082/portfolio/search/${accessMode}`
	if (params) {
		return `${Controller.getBaseUrl()}/${Controller.getVersion(
			'version'
		)}/portfolio/search/${accessMode}?${params}`;
	}
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/search/${accessMode}`;
}

export function getUrlTotalPortfolio({ portfolioCode, accessMode = 0 }) {
	// return `http://172.20.10.5:8082/portfolio/total/${portfolioCode}?access_mode=${accessMode}`
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/total/${portfolioCode}?access_mode=${accessMode}`;
}
export function getUrlPortfolioBalace({ accountId, symbol, exchange }) {
	// return `http://172.20.10.7:8082/portfolio/total/${portfolioCode}?access_mode=${accessMode}`
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/portfolio/balance/${accountId}?symbol=${symbol}&exchange=${exchange}`;
}
export function getOrderPlaceComfirm() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order`;
}

export function getUrlOrderAttributes({ accountId, exchange }) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/attributes?&exchange=${exchange}`;
}
export function getUrlActiveScreen({ screen }) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/active-screen/${screen}`;
}
export function getUrlInactiveScreen({ screen }) {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/inactive-screen/${screen}`;
}
export function getApiVettingPlaceOrderIress() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order/vetting/place`;
}
export function getApiFees() {
	return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/fee`;
}
export function getUrlOrderByTag({ orderTag, accountId, orderId }) {
	let url = `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order?order_tag=${orderTag}&account_id=${accountId}`;
	if (orderId) {
		url += `&order_id=${orderId}`;
	}
	return url;
}
export function getUrlOrderByOrderID(orderID) {
	const url = `${Controller.getBaseUrl()}/${Controller.getVersion(
		'version'
	)}/order?order_id=${orderID}`;
	return url;
}
export function getUrlGetRegion(env) {
	if (env) {
		return `${Controller.getBaseUrl(false)}/${Controller.getVersion(
			'version'
		)}/auth/list_region?env=${env}`;
	}
	return `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/auth/list_region`;
}
export function getUrlAlertLog() {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/alert`;
	return url;
}
export function getUrlDeleteAlertLog(alertID) {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/alert?alert_id=${alertID}`;
	return url;
}
export function getUrlDeleteAllNotifications() {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/alert/notification`;
	return url;
}
export function getUrlNotification(page) {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/alert/notification?page_size=${page}`;
	return url;
}
export function getUrlBrokerName() {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/auth/broker`;
	return url;
}
export function subNotifyAlert() {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/alert/subscribe`;
	return url;
}
export function getUrlputNotificationAlerts(alertId) {
	const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
		'version'
	)}/alert?alert_id=${alertId}`;
	return url;
}

/* #endregion */
