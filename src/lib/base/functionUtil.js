'use strict';
import {
	getDateStringWithFormat,
	convertTimeStampUTCToTimeLocation
} from './dateTime';
// var Decimal =
// require('decimal.js');
import _ from 'underscore';
import Big from 'big.js';
import firebase from '../../firebase';
import RNFirebase from 'react-native-firebase';
import { iconsMap } from '../../utils/AppIcons';
import { func, dataStorage } from '../../storage';
import userType from '../../constants/user_type';
import config from '../../config';
import PriceDisplay from '../../constants/price_display_type';
import {
	Platform,
	Animated,
	Vibration,
	Alert,
	Dimensions,
	StatusBar
} from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage';
import RNFetchBlob from 'rn-fetch-blob';
// import LocalAuth from 'react-native-local-auth';
// import Finger from 'react-native-touch-id-android';
import loginUserType from '../../constants/login_user_type';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import * as loginActions from '../../screens/login/login.actions';
import * as settingActions from '../../screens/setting/setting.actions';
import DeviceInfo from 'react-native-device-info';
import I18n from '../../modules/language';
import OrderEnum from '../../constants/order_enum';
import OrderState from '../../constants/order_state';
import filterType from '../../constants/filter_type';
import * as newsActions from '../../screens/news/news.actions';
import searchPortfolioActions from '../../screens/universal_search.1/detail/portfolio/search_portfolio.reducer';
import searchTransactionActions from '../../screens/open_price/new_open_price.reducer';
import * as userActions from '../../screens/user/user.actions';
import Axios from 'axios';
import NotiType from '../../constants/noti_type';
import NotiAction from '../../constants/noti_action';
import OrderType from '../../constants/order_type';
import HandleType from '../../constants/handle_type';
import ScreenId from '../../constants/screen_id';
import { Navigation } from 'react-native-navigation';
import exchangeString from '../../constants/exchange_string';
import count from '../../constants/news_count';
import NEWSTAG from '../../constants/newsTag';
import moment from 'moment';
// import 'moment/locale/zh-cn';
import {
	registerByAccount,
	unregisterAllMessage,
	unregisterByRoleGroup,
	unregisterOldRoleGroup
} from '../../streaming';
import orderStateEnum from '../../constants/order_state_enum';
import Enum from '../../enum';
import * as Util from '../../util';
import {
	initCacheOrders,
	getCheckChange,
	initCacheOrderTransactions
} from '../../cache';
import * as Business from '../../business';
import * as Lv1 from '../../streaming/lv1';
import * as StreamingAll from '../../streaming/all';
import * as PortfolioProcess from '../../streaming/portfolio_process';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as NewsBusiness from '../../streaming/news';
import * as Channel from '../../streaming/channel';
import * as Emitter from '@lib/vietnam-emitter';
import * as OrderStreamingBusiness from '~/streaming/order_streaming_business';
import Mongo, * as mongo from '../base/mongo';
import * as Controller from '../../memory/controller';
import * as Http from '../../network/http/http';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import uuid from 'react-native-uuid';
import CryptoJS from 'crypto-js';
import * as ManageConnection from '../../manage/manageConnection';
import * as manageSymbolRelated from '../../manage/manageRelatedSymbol';
import TIME_ZONE from '../../constants/time_zone';
import * as PureFuncUtil from '../../../src/utils/pure_func';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import { changeTheme } from '../../theme/theme_controller';
import * as newsControl from '~/screens/news_ver2/controller.js';
import HOME_SCREEN from '~/constants/home_screen.json';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import { checkRoleByKey } from '~/roleUser';
import { isErrorSystemByCode } from '~/component/error_system/Controllers/ErrorSystem.js';
const {
	SYMBOL_CLASS,
	SYMBOL_CLASS_QUERY,
	ROLE_DETAIL,
	ROLE_USER,
	DOCUMENT_TYPE_NEW
} = Enum;

const HAFT_PAST_MINUTE = 60 * 1000;
const TIME_OUT_REALTIME_NOTI = 5 * 1000;
const MIN_TIME_TO_LOADING = 1200;
const En = require('../../modules/language/language_json/en.json');
const Cn = require('../../modules/language/language_json/cn.json');
const momentTimeZone = require('moment-timezone');

const TIMEOUT_REQUEST = 3000;
const TIMEOUT_RESQUEST_TIME_SERVER = 2000;
const TIME_REFRESH_TOKEN = Enum.TIME_REFRESH_TOKEN;
const ENVIRONMENT = Enum.ENVIRONMENT;
const JSON = Util.json;
const TYPE_STREAMING_ALL = Enum.TYPE_STREAMING_ALL;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const isCounting = null;
let dicKey = null;
const byPass = true;

const OrderTypeNoti = {
	MARKET: 'MARKET',
	MARKETTOLIMIT: 'MARKET TO LIMIT',
	LIMIT: 'LIMIT',
	STOPLOSS: 'STOP-LOSS',
	TRAILINGSTOPLIMIT: 'TRAILING STOP LIMIT'
};

const configFirebaseTime = {
	apiKey: 'AIzaSyA9BHSfQjP7aQcOOzsdPqaOtr-130RyG58',
	authDomain: 'time-server-equix-mobile.firebaseapp.com',
	databaseURL: 'https://time-server-equix-mobile.firebaseio.com',
	projectId: 'time-server-equix-mobile',
	storageBucket: 'time-server-equix-mobile.appspot.com',
	messagingSenderId: '853674801991'
};

const firebaseTimeserver = RNFirebase.initializeApp(configFirebaseTime);
const ORDERS_TAB_INDEX = 4;
const ORDERS_TAB_NAME = {
	working: 0,
	stoploss: 1,
	filled: 2,
	cancelled: 3
};

const NotiTypeTab = {
	WORKING: 'working',
	STOPLOSS: 'stoploss',
	FILLED: 'filled',
	CANCELLED: 'cancelled'
};

export function isTriggeredOrder(data) {
	const { passed_state: passedState } = data;
	if (!passedState) return false;
	return (passedState + '').includes('TRIGGER');
}

export function checkHomeScreenIsDisableAndReplace(forceUpdate = true) {
	let tabSelected = getHomeScreen();
	switch (tabSelected.id) {
		case 0: // Holdings
			if (
				checkDisableScreenByRole(
					ROLE_USER.ROLE_PORTFOLIO_HOLDING_PERFORMANCE
				)
			) {
				if (checkRoleByKey(ROLE_USER.ROLE_MARKET_OVERVIEW)) {
					tabSelected = HOME_SCREEN.find((e) => {
						return e.id === 2; // set homescreen = overview
					});
					break;
				} else {
					tabSelected = HOME_SCREEN.find((e) => {
						return e.id === 3; // for case set homescreen = watchlist if all home screen is disable
					});
				}
			}
			break;
		case 1: // Performance
			if (
				checkDisableScreenByRole(
					ROLE_USER.ROLE_PORTFOLIO_HOLDING_PERFORMANCE
				)
			) {
				if (checkRoleByKey(ROLE_USER.ROLE_MARKET_OVERVIEW)) {
					tabSelected = HOME_SCREEN.find((e) => {
						return e.id === 2; // set homescreen = overview
					});
					break;
				} else {
					tabSelected = HOME_SCREEN.find((e) => {
						return e.id === 3; // for case set homescreen = watchlist if all home screen is disable
					});
				}
			}
			break;
		case 2: // Overview
			if (checkDisableScreenByRole(ROLE_USER.ROLE_MARKET_OVERVIEW)) {
				if (
					checkRoleByKey(ROLE_USER.ROLE_PORTFOLIO_HOLDING_PERFORMANCE)
				) {
					tabSelected = HOME_SCREEN.find((e) => {
						return e.id === 0; // set homescreen = holdings
					});
					break;
				} else {
					tabSelected = HOME_SCREEN.find((e) => {
						return e.id === 3; // for case set homescreen = watchlist if all home screen is disable
					});
				}
			}
			break;
		default:
			break;
	}
	if (tabSelected.id === 3 && forceUpdate) {
		// WL
		func.setTabActive(1);
	}
	forceUpdate && func.setHomeScreen(tabSelected);
	return tabSelected;
}

export function checkDisableScreenByRole(roleScreens) {
	let isDisable = false;
	if ([ENVIRONMENT.STAGING, ENVIRONMENT.DEMO].includes(config.environment)) {
		isDisable = true;
		if (roleScreens && Array.isArray(roleScreens)) {
			for (
				let index = 0, len = roleScreens.length;
				index < len;
				index++
			) {
				const role = roleScreens[index];
				if (checkRoleByKey(role)) {
					isDisable = false;
					break;
				}
			}
		} else if (roleScreens) {
			if (roleScreens && checkRoleByKey(roleScreens)) isDisable = false;
		}
	}
	return isDisable;
}

export function checkEnv() {
	return [ENVIRONMENT.NEXT, ENVIRONMENT.STAGING, ENVIRONMENT.DEMO].includes(
		config.environment
	);
}

export function getTabNameBaseOnIndex(index) {
	switch (index) {
		case 0:
			return filterType.WORKING;
		case 1:
			return filterType.STOPLOSS;
		case 2:
			return filterType.FILLED;
		case 3:
			return filterType.CANCELLED;
		default:
			return filterType.WORKING;
	}
}

export function getIOSVersion() {
	if (Platform.OS === 'android') return;
	return parseInt(Platform.Version, 10);
}

export function checkTooltip(id, value) {
	return dataStorage.tooltip[id] === value;
}

export function setTooltip(id, value) {
	dataStorage.tooltip[id] = value;
}

export function setRefTabbar(ref) {
	dataStorage.refBottomTabBar = ref;
}

function isOrdersScreen() {
	return dataStorage.tabIndexSelected === ORDERS_TAB_INDEX;
}

export function getOrdersTabIndexBaseOnTabName(tabName) {
	return ORDERS_TAB_NAME[tabName];
}

export function getHomeScreen() {
	const tabSelected = HOME_SCREEN.find((e) => {
		const homeScreen =
			dataStorage.homeScreen === 0 || dataStorage.homeScreen === 1
				? 0
				: 2;
		return e.id === homeScreen;
	});
	return tabSelected;
}

function getInitTabInfo({ isOutApp, type }) {
	const tabSelected = checkHomeScreenIsDisableAndReplace(false);
	switch (type) {
		case NotiTypeTab.FILLED:
			isOutApp && func.setTabActive(4);
			return {
				tabIndex: 4,
				activeTab: 2
			};
		case NotiTypeTab.CANCELLED:
			isOutApp && func.setTabActive(4);
			return {
				tabIndex: 4,
				activeTab: 3
			};
		case NotiTypeTab.STOPLOSS:
			isOutApp && func.setTabActive(4);
			return {
				tabIndex: 4,
				activeTab: 1
			};
		case NotiTypeTab.WORKING:
			isOutApp && func.setTabActive(4);
			return {
				tabIndex: 4,
				activeTab: 0
			};
		default:
			return tabSelected;
	}
}

export function handleDataNotification(notif) {
	try {
		/*  check data of Object Notification, more detail at Bussiness.setNotification.
            have 2 type of notification data; front-end config & back-end config;
        */
		let payload;
		if (notif._data && notif._data.payload) payload = notif._data.payload;
		if (!payload || !notif) {
			return {};
		}
		const checkString = typeof payload === 'string';
		const dataNotif = checkString ? JSON.parse(payload) : payload;
		const notiType =
			dataNotif &&
			dataNotif.noti_type &&
			dataNotif.noti_type.split('#')[0];
		const checkString1 = typeof dataNotif.data === 'string';
		const objectChange = checkString1
			? JSON.parse(dataNotif.data)
			: dataNotif.data;
		const objID = objectChange && objectChange.broker_order_id;
		logDevice(
			'error',
			`getOrderDataBeforeShowDetail with noti id: `,
			objID
		);
		const realtimeData = objectChange;
		return { notiType, objID, realtimeData };
	} catch (error) {
		logDevice(
			'error',
			`getOrderDataBeforeShowDetail cannot get noti order id`
		);
		return {};
	}
}

function isDiffAccount(accountId) {
	return accountId !== dataStorage.accountId;
}

function setCurrentAccountByNotiAccount(notiAccount) {
	unregisterAllMessage(dataStorage.accountId);
	dataStorage.accountId = notiAccount;
	Controller.setAccountId(notiAccount);
	registerByAccount(notiAccount, preprocessNoti, 'ALL');
	const listAccount = Controller.getListAccount();
	if (!listAccount || !listAccount.length) return;
	const accountInfo = listAccount.find((e) => e.account_id === notiAccount);
	if (accountInfo) {
		Controller.setCurrentAccount(accountInfo);
		func.setCurrentAccount(accountInfo);
		fbemit.emit('account', 'update', accountInfo);
	} else {
		getAccountInfo(notiAccount);
	}
}

export async function getOrderDataBeforeShowDetail({ cb, isOutApp, notif }) {
	const { notiType, objID } = handleDataNotification(notif);
	if (notiType !== NotiType.ORDER) {
		logDevice('error', `getOrderDataBeforeShowDetail not order noti`);
		cb && cb();
		return;
	}
	const orderIdTemp = objID;
	const orderUrl = api.getUrlOrderDetail(orderIdTemp);
	let res = await api.requestData(orderUrl, null, null, true);
	res =
		res &&
		res[0] &&
		res.sort(function (a, b) {
			return b.order_detail_id - a.order_detail_id;
		});
	const orderData = res && res[0];
	if (!orderData) {
		logDevice('error', `getOrderDataBeforeShowDetail no data order noti`);
		cb && cb(getInitTabInfo({ isOutApp }));
		return;
	}
	notif.data.data = JSON.stringify(orderData);
	const type = getKeyOrder(orderData);
	const notiAccount = orderData.account_id;
	if (isDiffAccount(notiAccount) && !Controller.getIsSearchAccount()) {
		setCurrentAccountByNotiAccount(notiAccount);
	}
	dataStorage.switchScreen = 'Orders';
	dataStorage.notifyObj = {
		order_id: objID,
		key: type,
		data: orderData
	};
	cb && cb(getInitTabInfo({ type, isOutApp }));
}

export function showNotiInApp() {
	try {
		if (!dataStorage.notifyObj || !dataStorage.notifyObj.order_id) return;
		const { data = {} } = dataStorage.notifyObj;
		const { account_id: accountID } = data;
		if (!accountID) {
			func.resetNotiData();
			if (isOrdersScreen()) {
				dataStorage.showNotiOrdersDetail &&
					dataStorage.showNotiOrdersDetail();
			} else {
				dataStorage.refBottomTabBar &&
					dataStorage.refBottomTabBar.changeTabActive(
						ORDERS_TAB_INDEX
					); // Change tab orders
			}
			return;
		}
		if (isDiffAccount(accountID)) {
			setCurrentAccountByNotiAccount(accountID);
			if (isOrdersScreen()) {
				dataStorage.showNotiOrdersDetail &&
					dataStorage.showNotiOrdersDetail();
			} else {
				dataStorage.refBottomTabBar &&
					dataStorage.refBottomTabBar.changeTabActive(
						ORDERS_TAB_INDEX
					); // Change tab orders
			}
		} else {
			if (isOrdersScreen()) {
				dataStorage.showNotiOrdersDetail &&
					dataStorage.showNotiOrdersDetail();
			} else {
				dataStorage.refBottomTabBar &&
					dataStorage.refBottomTabBar.changeTabActive(
						ORDERS_TAB_INDEX
					); // Change tab orders
			}
		}
		return true;
	} catch (error) {
		// logDevice('error', `showNotiInApp portfolio personal exception ${error}`)
		console.catch(error);
		return false;
	}
}

export function getStartDay(day) {
	const date = new Date().getDate();
	if (day) {
		return new Date(new Date().setDate(date + day)).setHours(0, 0, 0);
	}
	return new Date().setHours(0, 0, 0);
}

export function getEndDay(day) {
	const date = new Date().getDate();
	if (day) {
		return new Date(new Date().setDate(date + day)).setHours(23, 59, 59);
	}
	return new Date().setHours(23, 59, 59);
}

export function checkParent(section) {
	// IRESS không có children
	return false;
	const {
		class: classItem,
		master_code: masterCode,
		has_child: hasChild,
		exchanges
	} = section;
	return !!(
		masterCode === null &&
		classItem === 'future' &&
		!hasChild &&
		!isXLME(section)
	);
}
export function isXLME(section) {
	const { exchanges } = section;
	const exchange = exchanges[0];
	return exchange && exchange === 'XLME';
}
export function getClassQuery(classSymbol) {
	switch (classSymbol) {
		case SYMBOL_CLASS.EQUITY:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.EQUITY];
		case SYMBOL_CLASS.ETFS:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ETFS];
		case SYMBOL_CLASS.MF:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.MF];
		case SYMBOL_CLASS.WARRANT:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.WARRANT];
		case SYMBOL_CLASS.FUTURE:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.FUTURE];
		case SYMBOL_CLASS.OPTION:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.OPTION];
		default:
			return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES];
	}
}

export function setResolveAfterLoading(
	setMinTimeToLoading,
	timeStartRequest,
	cb
) {
	// const timeEndRequest = new Date().getTime();
	// const timeRequest = timeEndRequest - timeStartRequest
	// if (timeRequest < MIN_TIME_TO_LOADING && setMinTimeToLoading) {
	// 	const time = typeof setMinTimeToLoading === 'number' ? setMinTimeToLoading : MIN_TIME_TO_LOADING
	// 	setTimeout(() => {
	cb && cb();
	// 	}, time)
	// } else return cb && cb();
}

export function resetAnimation() {
	dataStorage.animationOrders = 'fadeIn';
	dataStorage.animationHoldings = 'fadeIn';
}

export function resetAnimationOrders() {
	dataStorage.animationOrders = 'fadeIn';
}

export function resetAnimationHoldings() {
	dataStorage.animationHoldings = 'fadeIn';
}

export function resetAnimationSearch() {
	dataStorage.animationSearch = 'fadeIn';
}

export function changeAnimationSearch(data) {
	if (data.from < data.to && data.to - data.from >= 0.5) {
		dataStorage.animationSearch = 'fadeInRight';
	} else if (data.from > data.to && data.from - data.to >= 0.5) {
		dataStorage.animationSearch = 'fadeInLeft';
	}
}

export function changeAnimationPortfolio(data) {
	if (data.from < data.to && data.to - data.from >= 0.5) {
		dataStorage.animationHoldings = 'fadeInRight';
	} else if (data.from > data.to && data.from - data.to >= 0.5) {
		dataStorage.animationHoldings = 'fadeInLeft';
	}
}

export function changeAnimationOrders(data) {
	if (data.from < data.to && data.to - data.from >= 0.5) {
		dataStorage.animationOrders = 'fadeInRight';
	} else if (data.from > data.to && data.from - data.to >= 0.5) {
		dataStorage.animationOrders = 'fadeInLeft';
	}
}

export function checkCurrentScreen(index) {
	return dataStorage.tabIndexSelected === index;
}

export function getAccountInfoApi(accountID) {
	return new Promise((resolve) => {
		const url = api.getAccountInfo(accountID);
		let accountName = '';
		api.requestData(url)
			.then((res) => {
				if (res) {
					const accountInfo = res[0] || {};
					accountName = accountInfo.account_name || '';
				}
				resolve(accountName);
			})
			.catch((err) => {
				// console.log(err)
				resolve(accountName);
			});
	});
}

export function language() {
	const en = En;
	const cn = Cn;

	const lang = {};

	Object.keys(en).map((key) => {
		const enLang = en[key];
		lang[key] = {
			key,
			enLang: enLang
		};
	});

	Object.keys(cn).map((key) => {
		const cnLang = cn[key];
		lang[key]['cnLang'] = cnLang;
	});

	let str = '';
	Object.keys(lang).map((key) => {
		const element = lang[key];
		const enLang = element['enLang'];
		const cnLang = element['cnLang'];

		str += `${key}, ${enLang}, ${cnLang}
        `;
	});

	// console.log('LANGUAGE', Object.keys(lang).length)
	// console.log('TRANSLATE', str)
}

export function getCommodityInfo(symbol) {
	try {
		const classSymbol = Business.getClassBySymbol(symbol);
		return new Promise((resolve) => {
			if (!Business.isFuture(classSymbol)) return resolve(); // Chi class fu ms call link
			const subSymbol = func.getSymbolObj(symbol) || symbol;
			const url = api.getUrlCommodityInfo(
				subSymbol.master_code || symbol
			);
			return api.requestData(url, true).then((data) => {
				if (data && Array.isArray(data)) {
					resolve(data[0]);
				} else {
					logDevice('error', `ORDER - GET COMMODITY INFOR ERROR`);
					resolve();
				}
				resolve();
			});
		});
	} catch (error) {
		logDevice('info', `ORDER - GET CASH AVAILABLE EXCEPTION: ${error}`);
		resolve();
	}
}

export function getTopCompany(type, cb) {
	try {
		const now = new Date().getTime();
		const perf = new Perf(performanceEnum.get_top_company);
		perf && perf.start();
		const url = api.getApiUrl(null, type);
		// console.log('GET SYMBOL WATCHLIST')
		api.requestData(url)
			.then((bodyData) => {
				const time = new Date().getTime();
				// console.log(`TIME GET SYMBOL ${type}: `, time - now)
				const data = bodyData && bodyData.value ? bodyData.value : [];
				dataStorage.isGetTop = true;
				cb(data);
				perf && perf.stop();
			})
			.catch((error) => {
				const response = {
					errorCode: error
				};
				cb(response);
			});
	} catch (error) {
		logDevice('info', `getTopCompany tradeAction exception ${error}`);
	}
}

export function getLv1(listSymbols, stringQuery, callback) {
	const now = new Date().getTime();
	const isPriceStreaming = Controller.isPriceStreaming();
	// Sub symbol
	const listSymbolObject = Util.getListSymbolObject(stringQuery);
	const numberSymbolUserWatchList = listSymbols.length;
	let expireSymbol = [];
	let isContain = false;
	if (isPriceStreaming) {
		// Unsub before sub
		Business.unSubByScreen('watchlist');
		const ID_FORM = Util.getRandomKey();
		// Set dic IDFORM nad listSymbolObject by name
		func.setDicIDForm('watchlist', ID_FORM);
		func.setDicListSymbolObject('watchlist', listSymbolObject);
		Business.subNewSymbol(listSymbolObject, ID_FORM)
			.then(() => {
				const timeSub = new Date().getTime();
				// console.log(`TIME SUB SYMBOL WATCHLIST: `, (timeSub - now) / 1000)
				Lv1.getLv1(listSymbolObject, isPriceStreaming).then(
					(bodyData) => {
						const timeGetLv1 = new Date().getTime();
						let newData = [];
						if (bodyData.length !== numberSymbolUserWatchList) {
							// Không lấy được đủ giá của thằng personal -> fill object fake
							expireSymbol = listSymbols.filter((v, k) => {
								const userWatchListSymbol = v.symbol;
								for (let i = 0; i < bodyData.length; i++) {
									const priceSymbol = bodyData[i].symbol;
									if (userWatchListSymbol === priceSymbol) {
										isContain = true;
									}
								}
								if (isContain) {
									isContain = false;
									return false;
								}
								return true;
							});
						}

						newData = [...bodyData, ...expireSymbol];
						// sort lai theo user watchlist
						const bodyDataSortByUserWatchList = [];
						for (let i = 0; i < listSymbols.length; i++) {
							const symbol = listSymbols[i].symbol;
							const newArr = newData.filter((e, i) => {
								return e.symbol === symbol;
							});
							bodyDataSortByUserWatchList.push(newArr[0]);
						}
						callback && callback(bodyDataSortByUserWatchList);
						dataStorage.countC2rWatchlist = false;
					}
				);
			})
			.catch((err) => {
				// console.log(err)
			});
	} else {
		Lv1.getLv1(listSymbolObject, isPriceStreaming).then((bodyData) => {
			let newData = [];
			if (bodyData.length !== numberSymbolUserWatchList) {
				// Không lấy được đủ giá của thằng personal -> fill object fake
				expireSymbol = listSymbols.filter((v, k) => {
					const userWatchListSymbol = v.symbol;
					for (let i = 0; i < bodyData.length; i++) {
						const priceSymbol = bodyData[i].symbol;
						if (userWatchListSymbol === priceSymbol) {
							isContain = true;
						}
					}
					if (isContain) {
						isContain = false;
						return false;
					}
					return true;
				});
			}

			newData = [...bodyData, ...expireSymbol];
			// sort lai theo user watchlist
			const bodyDataSortByUserWatchList = [];
			for (let i = 0; i < listSymbols.length; i++) {
				const symbol = listSymbols[i].symbol;
				const newArr = newData.filter((e, i) => {
					return e.symbol === symbol;
				});
				bodyDataSortByUserWatchList.push(newArr[0]);
			}
			callback && callback(bodyDataSortByUserWatchList);
			dataStorage.countC2rWatchlist = false;
		});
	}
}

export function getSymbolInfoFromListObjectSymbol(data, callback) {
	if (data.length === 0) {
		return;
	}
	const arr = [...data];
	let stringQuery = '';
	for (let index = 0; index < arr.length; index++) {
		const element = arr[index];
		const symbol = element.symbol || element.code || '';
		// query get multi symbol
		if (!dataStorage.symbolEquity[symbol]) {
			stringQuery += symbol + ',';
		}
	}
	if (stringQuery) {
		stringQuery = stringQuery.replace(/.$/, '');
	}
	getSymbolInfoApi(stringQuery, () => {
		// console.log('CACHE PERSONAL SYMBOL INFO SUCCESS')
		callback && callback();
	});
}

export function getSymbolInfoFromListSymbol(listSymbol, callback) {
	if (listSymbol.length === 0) {
		return;
	}
	const arr = [...listSymbol];
	let stringQuery = '';
	for (let index = 0; index < arr.length; index++) {
		const symbol = arr[index] || '';
		// query get multi symbol
		if (!dataStorage.symbolEquity[symbol]) {
			stringQuery += symbol + ',';
		}
	}
	if (stringQuery) {
		stringQuery = stringQuery.replace(/.$/, '');
	}
	getSymbolInfoApi(stringQuery, () => {
		callback && callback();
	});
}

export function saveDicPersonal(bodyData) {
	dataStorage.dicPersonal = {};
	let data = bodyData && bodyData.value ? bodyData.value : [];
	if (data && data.length) {
		data = data.sort((a, b) => {
			return a.rank - b.rank;
		});
		for (let index = 0; index < data.length; index++) {
			const element = data[index];
			const symbol =
				element && element.symbol ? element.symbol : element.code;
			dataStorage.dicPersonal[`${symbol}`] = true;
		}
	}
}

export function getWatchListCache(
	mongoInstance,
	query,
	originTable,
	cacheDataCb,
	requestDataCb
) {
	const now = new Date().getTime();
	const hashCompare = api.getHash(originTable);
	return mongoInstance
		.find(query)
		.then((res) => {
			if (res && res.length) {
				const response = res[0];
				// Compare change data by hash
				if (!response.hash || !hashCompare) {
					const time = new Date().getTime();
					// console.log('TIME GET CACHE - HAVE DATA - HASH UNDEFINED', (time - now) / 1000)
					return requestDataCb();
				} else {
					if (response.hash === hashCompare) {
						const time = new Date().getTime();
						// console.log('TIME GET CACHE - HAVE DATA - NO CHANGE', (time - now) / 1000)
						return cacheDataCb(response);
					} else {
						const time = new Date().getTime();
						// console.log('TIME GET CACHE - HAVE DATA - HAVE CHANGE', (time - now) / 1000)
						return requestDataCb();
					}
				}
			} else {
				const time = new Date().getTime();
				// console.log('TIME GET CACHE - NO DATA', (time - now) / 1000)
				return requestDataCb();
			}
		})
		.catch((e) => {
			// console.log('QUERY PERSONAL FROM MONGO', e)
			return requestDataCb();
		});
}

export function setWatchListCache(
	mongoInstance,
	newData,
	hashTable,
	type,
	queryRemove
) {
	if (newData && newData.value && newData.value.length) {
		const listInsert = [];
		const listPersonal = { ...newData };
		const dataWithHash = { ...listPersonal, ...{ hash: hashTable } };

		listInsert.push(dataWithHash);
		if (listInsert.length > 0) {
			// Remove data
			mongoInstance
				.remove(queryRemove)
				.then((res) => {
					logDevice('info: ', 'CACHE ==> WATCHLIST REMOVED...');
					mongoInstance
						.insert(listInsert)
						.then((res) => {
							// console.log(`insert ${type} db success`)
							logDevice(
								'info: ',
								`CACHE ${type} ==> INSERTED...`
							);
						})
						.catch((e) => {
							logDevice(
								'info: ',
								`CACHE ${type} ==> ERROR INSERT...`
							);
						});
				})
				.catch((e) => {
					logDevice('info: ', 'CACHE ==> WATCHLIST REMOVE ERROR...');
				});
		}
	}
}

export function getPaths(url) {
	if (!url) return [];
	const pathRegex = url.split('?');
	const path = pathRegex.length >= 1 ? pathRegex[0] : '';
	return path.split('/');
}
export function getParams(url) {
	if (!url) return {};
	const regex = /[?&]([^=#]+)=([^&#]*)/g;
	const params = {};
	let match = null;
	while ((match = regex.exec(url))) {
		// eslint-disable-line
		params[match[1]] = match[2];
	}
	return params;
}

export function openSignIn() {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.Home',
			navigatorStyle: {
				drawUnderNavBar: true,
				navBarHidden: true,
				navBarHideOnScroll: false,
				statusBarTextColorScheme: 'light',
				navBarNoBorder: true
			}
		},
		appStyle: {
			orientation: 'portrait'
		},
		animated: true,
		animationType: 'fade',
		passProps: {
			comeFromeGuest: true
		}
	});
}

export async function checkReadWhatsNew(key = 'whatsnew') {
	if (!Controller.getLoginStatus()) return false;
	const timeCodePush = config.timeCodePush * 1000;
	const timeShowWhatsNew = await AsyncStorage.getItem(key)
		.then((result) => {
			if (result) {
				const data = JSON.parse(result);
				const timeReadWhatsNew = data.time;
				if (timeReadWhatsNew) {
					return timeReadWhatsNew;
				}
				return 0;
			}
			return 0;
		})
		.catch((error) => {
			return 0;
		});
	if (timeCodePush === 0) {
		// console.log(typeof (timeCodePush));
		return false;
	}
	if (
		parseInt(timeCodePush) > parseInt(timeShowWhatsNew) ||
		!timeShowWhatsNew
	) {
		return true;
	} else {
		return false;
	}
}

function convertTimeServerToJson(timeXML) {
	const timeLocal = {
		time: new Date().getTime()
	};
	if (!timeXML || typeof timeXML !== 'string' || timeXML === '') {
		return timeLocal;
	}
	const time = timeXML.split(' ')[1];
	const timeServerArr = time.split('"')[1];
	const timeServer = parseInt(timeServerArr) / 1000;
	return {
		time: timeServer
	};
}

// async function getTimeFirebase() {
//     const fb = firebaseTimeserver.database().ref('currentTime');
//     fb.update({ time: 'abc' })
//         .then(() => {
//             console.log('update time success')
//         }).catch((err) => {
//             console.log('set time error:', err)
//         });
// }

export async function openWhatsNewModal(nav, enableGetTime) {
	try {
		if (enableGetTime) {
			const timeServer = dataStorage.timeServer;
			nav.showModal({
				screen: 'equix.WhatsNew',
				animated: true,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					closeModal: () => {
						const data = {
							time: timeServer
						};
						// Reset isUpdating status
						try {
							AsyncStorage.setItem(
								'whatsnew',
								JSON.stringify(data)
							)
								.then(() => {})
								.catch((error) => {
									logDevice(
										'error',
										`RESET IS SHOW WHAT NEW ON BUSYBOX FAILED - ERROR: ${error}`
									);
								});
						} catch (error) {
							logDevice(
								'error',
								`RESET IS SHOW WHAT NEW ON BUSYBOX EXCEPTION - ERROR: ${error}`
							);
						}
						nav.dismissModal({
							animated: true,
							animationType: 'none'
						});
					}
				}
			});
		} else {
			nav.showModal({
				screen: 'equix.WhatsNew',
				animated: true,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					closeModal: () => {
						nav.dismissModal({
							animated: true,
							animationType: 'none'
						});
					}
				}
			});
		}
	} catch (error) {
		console.log('openWhatsNewModal exception', error);
	}
}

export function renderTime(
	timeUpdated,
	format = 'DD MMM YYYY HH:mm:ss',
	showGMT = false
) {
	// showGMT = false
	if (format !== 'HH:mm:ss' && Controller.getLang() === 'cn') {
		let formatChina = format;
		if (format === 'DD/MM/YY' || format === 'DD/MM/YYYY') {
			formatChina = 'DD MMM YY';
		}
		const location = TIME_ZONE[43].location;
		if (typeof timeUpdated !== 'string') {
			const timeStamp = new Date(timeUpdated).getTime();
			// handle timestampconvertTimeStampUTCToTimeLocation
			const time = convertTimeStampUTCToTimeLocation(
				timeStamp,
				location,
				formatChina
			);
			const timeChinese = moment(time)
				.locale('zh_cn')
				.format(formatChina);
			return showGMT
				? `${timeChinese} ${convertTimeGMT(location)}`
				: `${timeChinese}`;
		} else {
			// no handle when not timestamp
			const timeChinese = moment(timeUpdated)
				.locale('zh_cn')
				.format(format);
			return showGMT
				? `${timeChinese} ${convertTimeGMT(location)}`
				: `${timeChinese}`;
		}
	} else {
		const location = TIME_ZONE[43].location;
		if (typeof timeUpdated !== 'string') {
			const timeStamp = new Date(timeUpdated).getTime();
			// handle timestamp
			const time = convertTimeStampUTCToTimeLocation(
				timeStamp,
				location,
				format
			);
			return showGMT ? `${time} ${convertTimeGMT(location)}` : `${time}`;
		} else {
			// no handle when not timestamp
			return showGMT
				? `${timeUpdated} ${convertTimeGMT(location)}`
				: `${timeUpdated}`;
		}
	}
	// return getDateStringWithFormat(new Date(this.state.timeUpdated), 'DD MMM YYYY HH:mm:ss')
}

export const getCnoteTimeAgo = (updateTime, lang) => {
	const oneDay = 24 * 60 * 60 * 1000;
	const location = TIME_ZONE[43].location;
	const gmt = convertTimeGMT(location);
	const today = momentTimeZone
		.tz(new Date().getTime(), location)
		.startOf('day')
		.valueOf();
	let timeAgo = '';
	if (updateTime > today) {
		// nếu lớn hơn 00:00 hôm nay
		timeAgo = `${I18n.t('today', { locale: lang })}`;
	} else if (updateTime > today - oneDay) {
		// nếu lớn hơn 00:00 ngày trước
		timeAgo = `${I18n.t('yesterday', { locale: lang })}`;
	} else {
		timeAgo = renderTime(updateTime, 'DD/MM/YYYY');
	}
	return timeAgo;
};

export function getTimeServer(url) {
	return new Promise((resolve) => {
		Http.get({
			url,
			timeout: TIMEOUT_RESQUEST_TIME_SERVER
		})
			.then((data) => {
				resolve(data || '');
			})
			.catch((err) => {
				logDevice(
					'error',
					`API GET TIME SERVER ERROR URL: ${url} - ERROR: ${err}`
				);
				resolve('');
			});
	});
}

export function getActionType(state) {
	switch (state) {
		case orderStateEnum.REPLACE:
			return I18n.t('replace');
		case orderStateEnum.CANCEL:
			return I18n.t('cancel');
		case orderStateEnum.UNKNOWN:
			return I18n.t('unknown');
		case orderStateEnum.NEW:
			return I18n.t('new');
		case orderStateEnum.PARTIALLY_FILLED:
			return I18n.t('partiallyFilled');
		case orderStateEnum.FILLED:
			return I18n.t('filled');
		case orderStateEnum.DONE_FOR_DAY:
			return I18n.t('doneForDay');
		case orderStateEnum.CANCELLED:
			return I18n.t('cancelled');
		case orderStateEnum.REPLACED:
			return I18n.t('replaced');
		case orderStateEnum.PENDING_CANCEL:
			return I18n.t('pendingPlace');
		case orderStateEnum.STOPPED:
			return I18n.t('stopped');
		case orderStateEnum.REJECTED:
			return I18n.t('rejected');
		case orderStateEnum.REJECTCANCEL:
			return I18n.t('rejectCancel');
		case orderStateEnum.SUSPENDED:
			return I18n.t('suspended');
		case orderStateEnum.PENDING_NEW:
			return I18n.t('pendingNew');
		case orderStateEnum.CALCULATED:
			return I18n.t('calculated');
		case orderStateEnum.EXPIRED:
			return I18n.t('expired');
		case orderStateEnum.ACCEPTED_FOR_BIDDING:
			return I18n.t('acceptedForBidding');
		case orderStateEnum.PENDING_REPLACE:
			return I18n.t('pendingReplace');
		case orderStateEnum.PLACE:
			return I18n.t('place');
		case orderStateEnum.TRIGGER:
			return I18n.t('trigger');
		default:
			return state;
	}
}

export function replaceTextForMultipleLanguage(originText, replaceObj) {
	if (Object.keys(replaceObj).length <= 0) return originText;
	for (const k in replaceObj) {
		const replaceValue = replaceObj[k];
		const textReplace = `##${k}##`;
		const regex = new RegExp(textReplace, 'g');
		originText = originText.replace(regex, replaceValue);
	}
	return originText;
}

export function dateDistance(to, from, distanceType = 'days') {
	// To
	const dateTo = to.getDate();
	const monthTo = to.getMonth();
	const yearTo = to.getFullYear();
	// From
	const dateFrom = from.getDate();
	const monthFrom = from.getMonth();
	const yearFrom = from.getFullYear();

	const ToMoment = moment([yearTo, monthTo, dateTo]);
	const FromMoment = moment([yearFrom, monthFrom, dateFrom]);
	return ToMoment.diff(FromMoment, distanceType);
}

export function showUnavailableNew({ dataNews, navigator, timeToAvailable }) {
	let dataFake = {
		news_id: '20200414@@@@@@02224354@@@@@2A1219630@@@@@@ASX',
		symbol: 'ASX',
		link: 'https://storage.googleapis.com/equix-asx-news-prod/news-asx/20200414/02224354.pdf',
		link_paritech: null,
		page_count: 145,
		source: 'ASX',
		tag: ['Changeinsubstantialholding'],
		status: 'active',
		title: 'Change in substantial holding',
		type_news: 'announcement',
		updated: 1586817271000,
		user_readed: null,
		trading_halt: 0
	};
	const { related_symbols: symbolList } = dataNews;
	navigator &&
		navigator.push({
			screen: 'equix.NewDetail',
			overrideBackPress: true,
			animated: false,
			animationType: 'none',
			navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
			passProps: {
				data: dataNews,
				available: false,
				timeToAvailable
			}
		});
}

function showNewWithUrl({ dataNews, navigator }) {
	try {
		const { news_code: newsCode } = dataNews;
		const url = api.getLinkNewUrl(newsCode);
		api.requestData(url)
			.then((res) => {
				if (res) {
					if (res.errorCode) {
						// console.log(res.errorCode)
					} else {
						const { direct_link: directLink } = res;
						navigator &&
							navigator.push({
								screen: 'equix.NewDetail',
								overrideBackPress: true,
								animated: false,
								animationType: 'none',
								navigatorStyle:
									CommonStyle.navigatorSpecialNoHeader,
								passProps: {
									data: {
										...dataNews,
										documentType: DOCUMENT_TYPE_NEW.URL,
										directLink
									}
								}
							});
					}
				} else {
					console.log('LINK NEW IS NULL');
				}
			})
			.catch((err) => {
				console.log(err);
			});
	} catch (error) {
		console.log('error putdata read news', error);
	}
}

function showBlankNew({ dataNews, navigator, error }) {
	const showUnavailableNew = true;
	navigator &&
		navigator.push({
			screen: 'equix.NewDetail',
			overrideBackPress: true,
			animated: false,
			animationType: 'none',
			navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
			passProps: {
				data: {
					...dataNews,
					showUnavailableNew,
					error
				}
			}
		});
}

function showNewWithHtml({ dataNews, navigator, showUnavailableNew = false }) {
	const { news_code: newsCode } = dataNews;
	const customStyleHtml = Business.genStyleHtmlNewDetail();
	const params = Business.genParamsStyleHtmlNewDetail(customStyleHtml);
	// const newsCode = 'b473c0682d1a711a86bbf4e5f8856d20a63848214545a46796e78ccb528a5193'
	let streamUrl = api.getLinkNewUrl(newsCode);
	streamUrl += `&${params}`;
	navigator &&
		navigator.push({
			screen: 'equix.NewDetail',
			overrideBackPress: true,
			animated: false,
			animationType: 'none',
			navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
			passProps: {
				data: {
					...dataNews,
					showUnavailableNew,
					documentType: DOCUMENT_TYPE_NEW.HTML,
					streamUrl
				}
			}
		});
}

function showNewWithText({ dataNews, navigator }) {
	const { news_code: newsCode } = dataNews;
	const customStyleHtml = Business.genStyleHtmlNewDetail();
	const params = Business.genParamsStyleHtmlNewDetail(customStyleHtml);
	// const newsCode = 'b473c0682d1a711a86bbf4e5f8856d20b1f221a3fef9df0ace6a7c8e87abbacb'
	let streamUrl = api.getLinkNewUrl(newsCode);
	streamUrl += `&${params}`;
	navigator &&
		navigator.push({
			screen: 'equix.NewDetail',
			overrideBackPress: true,
			animated: false,
			animationType: 'none',
			navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
			passProps: {
				data: {
					...dataNews,
					documentType: DOCUMENT_TYPE_NEW.TEXT,
					streamUrl
				}
			}
		});
}

function showNewWithPdf({ dataNews, navigator }) {
	const { news_code: newsCode } = dataNews;
	// const newsCode = 'f9c6f58783eea2bea0353ed875854974f30dde6f9006977f338b2e6cdfd72bef5524d6fc3b5d12b826241e8d28b58f8e9df2c6ba6f3366bbd1051246b28a90729c7a02e6354d99b5aa82a5aa3aef0f92173ba36b16c265686dea5b3de1f7aa41'
	const streamUrl = api.getLinkNewUrl(newsCode);
	navigator &&
		navigator.push({
			screen: 'equix.NewDetail',
			overrideBackPress: true,
			animated: false,
			animationType: 'none',
			navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
			passProps: {
				data: {
					...dataNews,
					documentType: DOCUMENT_TYPE_NEW.PDF,
					streamUrl
				}
			}
		});
}

export function getInfoAndShowNewDetail({ dataNews, navigator, error }) {
	try {
		// Fake Pdf
		// dataNews.document_type = DOCUMENT_TYPE_NEW.PDF
		// Fake HTML
		// dataNews.document_type = DOCUMENT_TYPE_NEW.HTML
		// Fake HTML
		// dataNews.document_type = DOCUMENT_TYPE_NEW.TEXT
		if (error) {
			return showBlankNew({ dataNews, navigator, error });
		}
		const { document_type: documentType, news_code: newsCode } = dataNews;
		switch (documentType) {
			case DOCUMENT_TYPE_NEW.URL:
				return showNewWithUrl({ dataNews, navigator });
			case DOCUMENT_TYPE_NEW.HTML:
				return showNewWithHtml({ dataNews, navigator });
			case DOCUMENT_TYPE_NEW.PDF:
				return showNewWithPdf({ dataNews, navigator });
			case DOCUMENT_TYPE_NEW.TEXT:
				return showNewWithText({ dataNews, navigator });
			default:
				break;
		}
	} catch (error) {
		console.log('error at show new Details', error);
	}
}

export function showNewsDetail(newID, navigator, isConnected, dataNews) {
	try {
		if (newID && navigator) {
			const url = api.getLinkNewUrl(newID);
			const data = dataNews || {};
			try {
				api.putData(url, data)
					.then((res) => {
						if (res) {
							if (res.errorCode) {
								// console.log(res.errorCode)
							} else {
								// emiter update new readed
								NewsBusiness.updateNewsReadedByNewID(newID);
								newsControl.setStatusShowNewDetail(true);
								// console.log('GET LINK NEW SUCCESSFULL', res)
								const data = res[0] || [];
								navigator.showModal({
									screen: 'equix.NewsDetail',
									overrideBackPress: true,
									title: I18n.t('newOrder'),
									backButtonTitle: '',
									animated: true,
									animationType: 'none',
									navigatorStyle: {
										...CommonStyle.navigatorSpecial,
										screenBackgroundColor: 'transparent',
										modalPresentationStyle:
											'overCurrentContext'
									},
									passProps: {
										source: data.link,
										data,
										title: `${data.symbol} / ${data.title}`,
										isConnected,
										navigatorEventIDParents:
											navigator.navigatorEventID
									}
								});
							}
						} else {
							console.log('LINK NEW IS NULL');
						}
					})
					.catch((err) => {
						console.log(err);
					});
			} catch (error) {
				console.log('error putdata read news', error);
			}
		}
	} catch (error) {
		console.log('error at show new Details', error);
	}
}

export function logoutByAlert(message, title = '', cb) {
	Alert.alert(
		title,
		message,
		[
			{
				text: 'OK',
				onPress: () => {
					cb && cb();
				}
			}
		],
		{ cancelable: false }
	);
}

export function getAccountInfo(accountId, cb) {
	const url = api.getAccountInfo(`${accountId}`);
	if (!accountId) {
		const subtitle = dataStorage.emailLogin;
		if (dataStorage.currentScreenId === ScreenId.PORTFOLIO) {
			fbemit.emit(
				'portfolio_sub_title',
				'portfolio_set_sub_title',
				subtitle
			);

			const channelName = Channel.getChannelAccountChange();
			Emitter.emit(channelName, subtitle);
		}
	} else {
		return api
			.requestData(url, true)
			.then((data) => {
				if (data && data.length) {
					dataStorage.currentAccount = data[0];
					Controller.setCurrentAccount(data[0]);
					fbemit.emit('account', 'update', data[0]);
					const accountName = data[0].account_name || '';
					const accountID = data[0].account_id
						? `(${data[0].account_id})`
						: '';
					const subtitle = `${accountName} ${accountID}`;
					// set lai title cho portfolio
					if (dataStorage.currentScreenId === ScreenId.PORTFOLIO) {
						fbemit.emit(
							'portfolio_sub_title',
							'portfolio_set_sub_title',
							subtitle
						);
						const channelName = Channel.getChannelAccountChange();
						Emitter.emit(channelName, subtitle);
					}
					// set lai title cho new order
					if (dataStorage.currentScreenId === ScreenId.ORDER) {
						fbemit.emit(
							'new_order_sub_title',
							'new_order_set_sub_title',
							subtitle
						);
						// const channelName = Channel.getChannelAccountChange()
						// Emitter.emit(channelName, subtitle)
					}
					// set lai title cho overview
					// if (dataStorage.currentScreenId === ScreenId.OVERVIEW) {
					//     fbemit.emit('overview_sub_title', 'overview_set_sub_title', subtitle)
					// }
				} else {
					dataStorage.currentAccount = { account_id: accountId };
					Controller.setCurrentAccount({ account_id: accountId });
					fbemit.emit('account', 'update', { account_id: accountId });
					// const accountName = data[0].account_name || '';
					const accountID = accountId ? `(${accountId})` : '';
					const subtitle = `${accountID}`;
					if (dataStorage.currentScreenId === ScreenId.PORTFOLIO) {
						fbemit.emit(
							'portfolio_sub_title',
							'portfolio_set_sub_title',
							subtitle
						);
						const channelName = Channel.getChannelAccountChange();
						Emitter.emit(channelName, subtitle);
					}
					// if (dataStorage.currentScreenId === ScreenId.OVERVIEW) {
					//     fbemit.emit('overview_sub_title', 'overview_set_sub_title', subtitle)
					// }
				}
				cb && cb();
			})
			.catch((err) => {
				cb && cb();
				// console.log(err)
				logDevice('err', `GET USER INFO ERROR: ${err}`);
			});
	}
}

export function reloadDataAfterChangeAccount(accountId) {
	resetAnimationHoldings();
	// sub sse new account
	registerByAccount(accountId, preprocessNoti, 'ALL');

	getAccountInfo(accountId);
	// api.getUserPosition();
	// api.getUserWatchList();
	Controller.dispatch(loginActions.setAccountId(accountId));
	if (accountId) {
		// initCacheOrders();
		initCacheOrderTransactions();
	}
	const currentScreen = dataStorage.currentScreenId;
	switch (currentScreen) {
		case ScreenId.OVERVIEW:
			dataStorage.loadData && dataStorage.loadData();
			break;
		case ScreenId.TRADE:
		case ScreenId.TOP50:
		case ScreenId.TOP20:
		case ScreenId.TOP100:
		case ScreenId.TOP200:
		case ScreenId.INDICIES:
			if (
				dataStorage.watchListScreenId === 'topGainers' ||
				dataStorage.watchListScreenId === 'topLosers'
			) {
				dataStorage.changeReviewAccount &&
					dataStorage.changeReviewAccount(
						dataStorage.loginUserType === loginUserType.REVIEW
					);
			}
			dataStorage.loadData && dataStorage.loadData();
			break;
		case ScreenId.ORDERS:
			dataStorage.dicDataOrders = {};
			dataStorage.loadData && dataStorage.loadData(false);
			break;
		case ScreenId.NEWS:
			if (dataStorage.tabNews === 'relatedNews') {
				dataStorage.loadData && dataStorage.loadData();
			}
			break;
		case ScreenId.CNOTE:
			dataStorage.loadData && dataStorage.loadData(2000);
			break;
		case ScreenId.SETTING:
		case ScreenId.REPORT_FROM_FILE:
			dataStorage.loadData && dataStorage.loadData();
			break;
		case ScreenId.ABOUT_US:
		case ScreenId.TERM_OF_USE:
		case ScreenId.MODIFY_ORDER:
		case ScreenId.REPORT:
		case ScreenId.UNIVERSAL_SEARCH:
			break;
		case ScreenId.ORDER:
			dataStorage.loadData && dataStorage.loadData(null, true);
			break;
		case ScreenId.USER_INFO:
			Controller.dispatch(userActions.loadDataFrom());
			break;
		case ScreenId.PORTFOLIO:
			break;
	}
}

export function renewTokenInterval() {
	if (dataStorage.guestRefreshTokenInterval) {
		clearInterval(dataStorage.guestRefreshTokenInterval);
	}
	if (dataStorage.refreshTokenInterval) {
		clearInterval(dataStorage.refreshTokenInterval);
	}

	dataStorage.refreshTokenInterval = setInterval(() => {
		refreshToken()
			.then(() => {})
			.catch((error) => {});
	}, TIME_REFRESH_TOKEN);
}

export function checkRefreshTokenExpire(lastTimeRenewToken) {
	if (!lastTimeRenewToken) return true;
	const now = new Date().getTime();
	const diff = now - parseInt(lastTimeRenewToken);
	if (diff > TIME_REFRESH_TOKEN) return true;
	return false;
}

export function getLastTimeRenewToken(callback) {
	const userLoginID = dataStorage.emailLogin;
	const isDemo = Controller.isDemo();
	AsyncStorage.getItem(
		`${isDemo ? 'demo' : 'prod'}_last_time_set_new_token_${userLoginID}`
	)
		.then((lastTimeRenewToken) => {
			if (lastTimeRenewToken) {
				const isTokenExpire =
					checkRefreshTokenExpire(lastTimeRenewToken);
				if (isTokenExpire) {
					refreshToken()
						.then(() => {
							callback && callback();
						})
						.catch((err) => {
							console.log(err);
							callback && callback();
						});
					renewTokenInterval();
				} else {
					callback && callback();
				}
			} else {
				logDevice(
					'info',
					`LOAD LAST TIME RENEW TOKEN - lastTimeRenewToken IS NULL`
				);
				callback && callback();
			}
		})
		.catch((error) => {
			logDevice('info', `LOAD LAST TIME RENEW TOKEN ERROR: ${error}`);
			callback && callback();
		});
}

export function setLastTimeReNewToken() {
	const userLoginID = dataStorage.emailLogin;
	const time = new Date().getTime();
	AsyncStorage.setItem(
		`${
			Controller.isDemo() ? 'demo' : 'prod'
		}_last_time_set_new_token_${userLoginID}`,
		time.toString()
	)
		.then(() => {
			console.log(`Save last time set new token success`);
		})
		.catch((error) => {
			console.log(`Save last time set new token error: ${error}`);
		});
}
export function refreshToken(cb = null) {
	return new Promise((resolve, reject) => {
		const globalState = Controller.getGlobalState();
		const login = globalState.login;
		if (login && login.loginObj) {
			const pin = Util.getPinOriginal(login.loginObj);
			return Business.getEncryptText(pin).then((res) => {
				const { encryptText, sessionID } = res;
				const objRefreshToken = {
					token: login.loginObj.refreshToken,
					pin: encryptText,
					session_id: pin === encryptText ? null : sessionID
				};
				const byPassAccessToken = true;
				api.postData(
					`${api.getAuthUrl()}/decode`,
					{ data: objRefreshToken },
					null,
					false,
					byPassAccessToken
				)
					.then((data) => {
						if (data && data.errorCode) {
							// User status change active -> inactive
							if (
								data.errorCode ===
									Enum.USER_BLOCK_ERROR.USER_INACTIVE ||
								data.errorCode ===
									Enum.USER_BLOCK_ERROR.USER_CLOSED ||
								data.errorCode ===
									Enum.USER_BLOCK_ERROR.USER_ADMIN_BLOCKED ||
								data.errorCode ===
									Enum.USER_BLOCK_ERROR.USER_SECURITY_BLOCKED
							) {
								Controller.showAlert(
									I18n.t('msgLogoutSecurity'),
									() => {
										Controller.setIsShowingAlertReload(
											false
										);
										Controller.dispatch(
											loginActions.logout()
										);
									}
								);
							}
							const error = {
								errorCode: data.errorCode
							};
							resolve(error);
						} else if (data && data.token) {
							api.postData(
								`${api.getAuthUrl()}/refresh`,
								{ data: { refreshToken: data.token } },
								null,
								false,
								byPassAccessToken
							)
								.then((param) => {
									Controller.setAccessToken(
										param.accessToken
									);
									// Controller.setBaseUrl(param.baseUrl);
									setLastTimeReNewToken();
									cb && cb(); // Lưu time renew token xuong local storage
									resolve();
								})
								.catch((error) => {
									reject(error);
								});
						}
					})
					.catch((error) => {
						logDevice('info', `DECODE TOKEN ERROR - ${error}`);
					});
			});
		}
	});
}

export function checkNetworkConnection(url, successCb) {
	const task = RNFetchBlob.config({
		trusty: true
	}).fetch('GET', url, {});
	// Sau TIMEOUT_REQUEST sẽ cancel request -> show connecting
	const timeoutId = setTimeout(() => {
		logDevice('error', `CANCEL REQUEST CHECK NETWORK CONNECTION`);
		task && task.cancel();
		successCb(false);
	}, TIMEOUT_REQUEST);
	task.then((res) => {
		timeoutId && clearTimeout(timeoutId);
		const info = res.info();
		const status = info.status;
		if (status === 200) {
			// logDevice('error', `API CHECK NETWORK CONNECTION SUCCESS STATUS ${status}`)
			successCb && successCb(true);
		} else {
			logDevice(
				'error',
				`API CHECK NETWORK CONNECTION - URL: ${url} - ERROR STATUS ${status}`
			);
			successCb && successCb(false);
		}
	}).catch((errorMessage, statusCode) => {
		timeoutId && clearTimeout(timeoutId);
		logDevice(
			'error',
			`API CHECK NETWORK CONNECTION ERROR URL: ${url} - ERROR: ${errorMessage}`
		);
		successCb && successCb(false);
	});
}

export function checkNetworkConnection1(url, successCb) {
	api.requestData1(url)
		.then((data) => {
			func.setSystemInfo(data);
			if (data && data.timeserver) {
				dataStorage.timeServer = data.timeserver;
			}
			dataStorage.maintain.currentState = data.maintain;
			dataStorage.cachingVersion =
				Platform.OS === 'ios'
					? data.ios_caching || ''
					: data.android_caching || '';
			successCb && successCb(true);
		})
		.catch((err) => {
			logDevice(
				'error',
				`API CHECK NETWORK CONNECTION ERROR URL: ${url} - ERROR: ${err}`
			);
			successCb && successCb(false);
		});
}

// Ham kiem tra xem pin co dung hay khong
export function authPin(pin, successCb, errorCb, closeModalCb = null) {
	try {
		const store = Controller.getGlobalState();
		const login = store.login;
		const refreshToken = login.loginObj.refreshToken;
		return Business.getEncryptText(pin).then((res) => {
			const { encryptText, sessionID } = res;
			const bodyData = {
				data: {
					token: refreshToken,
					pin: encryptText,
					session_id: pin === encryptText ? null : sessionID
				}
			};
			const byPassAccessToken = true;
			return api
				.postData(
					`${api.getAuthUrl()}/decode`,
					bodyData,
					null,
					false,
					byPassAccessToken
				)
				.then((data) => {
					if (data && data.errorCode) {
						if (data.errorCode === 'TOKEN_WAS_CHANGED') {
							logDevice(
								'info',
								`AUTH PIN - FORGOT PIN - ERRORCODE: ${data.errorCode}`
							);
							closeModalCb && closeModalCb(true);
						} else {
							errorCb && errorCb();
						}
					} else {
						const token = data.token;
						successCb && successCb(token);
					}
				})
				.catch((error) => {
					// console.log('cannot post data token')
					logDevice('error', `AUTH PIN - DECODE - ERROR: ${error}`);
					errorCb && errorCb();
				});
		});
	} catch (error) {
		logDevice('error', `AUTH PIN - DECODE - EXCEPTION: ${error}`);
	}
}

export function getAccountNameFromDic(accountID) {
	let accountName = '';
	const listAccount = Controller.getListAccount();
	for (let i = 0; i < listAccount.length; i++) {
		if (listAccount[i] && listAccount[i].account_id === accountID) {
			accountName = listAccount[i].account_name;
			break;
		}
	}
	return accountName;
}

export function getAccountName(accountId) {
	return new Promise((resolve, reject) => {
		if (
			accountId &&
			dataStorage.dicAccount &&
			dataStorage.dicAccount[accountId]
		) {
			return resolve(dataStorage.dicAccount[accountId]);
		}
		const url = api.getAccountInfo(`${accountId}`);
		api.requestData(url, true)
			.then((data) => {
				if (data && data.length) {
					const accountInfo = data[0];
					if (!accountInfo.account_name) {
						console.log('AAA');
					}
					const accountName =
						accountInfo.account_name ||
						dataStorage.dicAccount[accountId] ||
						'';
					if (accountName) {
						dataStorage.dicAccount[accountId] = accountName;
					}
					return resolve(accountName);
				} else {
					const accountName = dataStorage.dicAccount[accountId] || '';
					return resolve(accountName);
				}
			})
			.catch((err) => {
				logDevice(
					'err',
					`getAccountInfoNoti GET USER INFO ERROR: ${err}`
				);
				const accountName = dataStorage.dicAccount[accountId] || '';
				return resolve(accountName);
			});
	});
}

export function getNotiTitle(notiType, accountId, fnCb) {
	let title = '';
	switch (notiType) {
		case NotiType.ORDER_DETAIL:
		case NotiType.ORDER:
			getAccountName(accountId).then((accountName) => {
				title = `${accountName} (${accountId})`;
				fnCb && fnCb(title);
			});
			break;
		case NotiType.NEWS:
			title = `NEWS`;
			fnCb && fnCb(title);
			break;
	}
}

export function showLocalNotification(notif, accountId) {
	try {
		const objChanged = notif.object_changed;
		getNotiBody(notif, (body) => {
			const notificationId = getNotiId(notif);
			const notiType = getNotiType(notif.title);
			getNotiTitle(notiType, accountId, (title) => {
				if (body) {
					const data = {
						notify_type: NotiType.ORDER,
						obj_id: notificationId,
						data: objChanged,
						id: notificationId
					};
					// react native firebase display notification
					const badge = 0;
					const notification = Business.setNotification({
						notificationId,
						title,
						body,
						data,
						badge
					});
					Business.displayNotification(notification);
				}
			});
		});
	} catch (error) {
		logDevice('info', `showLocalNotification func exception with ${error}`);
	}
}

export function handleRealtimeOrderDetailNoti(data, orderId) {
	try {
		const orderDetailChannel =
			OrderStreamingBusiness.getChannelRealtimeOrderDetail(orderId);
		Emitter.emit(orderDetailChannel, data);
	} catch (error) {
		logDevice(
			'info',
			`handleRealtimeOrderDetailNoti func exception with ${error}`
		);
	}
}

export function clone(newArr) {
	return newArr ? JSON.parse(JSON.stringify(newArr)) : newArr;
}

export function handleRealtimeNewsNoti(id) {
	try {
		fbemit.emit('news', 'noti', data);
	} catch (error) {
		logDevice(
			'info',
			`handleRealtimeNewsNoti func exception with ${error}`
		);
	}
}

export function handleRealtimeOrderNoti(data) {
	Emitter.emit(Channel.getChannelRealtimeOrders(), data);
	// Update orders list && order detail
	const channelOrderDetailBrokerOrderID =
		StreamingBusiness.getChannelOrderDetailBrokerOrderID(
			data.broker_order_id
		);
	Emitter.emit(channelOrderDetailBrokerOrderID, { data });
}

export function preprocessOrderDetailNoti(notif) {
	try {
		console.log('preprocessOrderDetailNoti', notif);
		const data = JSON.parse(notif.object_changed);
		const brokerOrderID = data.broker_order_id || '';
		const orderState = data.order_state || '';
		const orderTypeOrder = data.order_type || '';
		let userAction = '';
		try {
			const orderAction = data.order_action || '';
			const orderActionObj = JSON.parse(orderAction);
			const noteObj = JSON.parse(orderActionObj.note);
			userAction = noteObj.order_state;
		} catch (error) {
			console.log('error');
		}
		const key = `${brokerOrderID}_${orderState}_${orderTypeOrder}_${userAction}`;
		if (dataStorage.dicRealtimeOrderDetailNoti[key]) {
			return false;
		}
		dataStorage.dicRealtimeOrderDetailNoti[key] = true;
		handleRealtimeOrderDetailNoti(data, brokerOrderID);
		setTimeout(() => {
			dataStorage.dicRealtimeOrderDetailNoti = {};
		}, TIME_OUT_REALTIME_NOTI);
	} catch (error) {}
}

export function showNotiPartialfill(filledPrice, orderId, accountId) {
	const orderUrl = api.getUrlOrderInfo(orderId);
	api.requestData(orderUrl)
		.then((res) => {
			const orderData = res && res[0];
			if (!orderData) return;
			const state =
				orderData && orderData.order_state
					? (orderData.order_state + '').toUpperCase()
					: '';
			if (orderData && state === OrderState.PARTIALFILL) {
				const body = getNotiContentPartialFill(orderData);
				getNotiTitle(NotiType.ORDER, accountId, (title) => {
					const notificationId = orderId;
					const data = {
						notify_type: NotiType.ORDER,
						obj_id: notificationId,
						data: JSON.stringify(orderData),
						id: notificationId
					};
					// react native firebase display notification
					const badge = 0;
					const notification = Business.setNotification({
						notificationId,
						title,
						body,
						data,
						badge
					});
					Business.displayNotification(notification);
					handleSaveNotiStatus(orderData, NotiType.ORDER, 1);
				});
			}
		})
		.catch((error) => {
			logDevice(
				'info',
				`showNotiPartialfill - get order data ERROR: ${error}`
			);
		});
}

export function getOrderIdByType(data) {
	return (
		(data.broker_order_id ? data.broker_order_id : 'notiId') +
		+new Date() +
		''
	);
	// let orderId = '';
	// const type = (getKeyOrder(data) + '').toUpperCase();
	// if (type === filterType.WORKING || type === filterType.STOPLOSS) {
	//   orderId = data.broker_order_id;
	// } else {
	//   orderId = data.client_order_id;
	// }
	// return orderId;
}

export function realtimeTransaction(data) {
	// fbemit.emit('transaction', `${symbol}`, data);
	const { symbol } = data;
	if (!symbol) return;
	const channelName = Channel.getChannelTransactionChange(symbol);
	Emitter.emit(channelName, data);
	if (dataStorage.searchSymbol === symbol) {
		Controller.dispatch(
			searchTransactionActions.updateTopOrderTransactionSuccess(data)
		);
	}
}

export function preprocessTransactionNoti(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		if (
			data &&
			(dataStorage.isOpenOrderTransaction === data.symbol ||
				dataStorage.searchSymbol === data.symbol)
		) {
			data.symbol && realtimeTransaction(data);
		}
		if (data && data.price) {
			const filledPrice = data.price;
			const orderId = getOrderIdByType(data);
			const accountId = data.account_id;
			const store = Controller.getGlobalState();
			const setting = store.setting;
			if (!setting.noti) return;
			const orderSetting = setting.order;
			if (orderSetting['partial_fill']) {
				showNotiPartialfill(filledPrice, orderId, accountId);
			}
		}
		logDevice(
			'info',
			`preprocessTransactionNoti with data ${JSON.stringify(data)}`
		);
	} catch (error) {
		logDevice(
			'info',
			`preprocessTransactionNoti func exception with ${error}`
		);
	}
}

export function mergeNotiToGroup() {
	AsyncStorage.getItem(key)
		.then((result) => {
			let notiStatus = {
				unread: 0,
				readOverview: false,
				listUnread: {}
			};
			if (result) notiStatus = JSON.parse(result);
		})
		.catch((error) => {
			logDevice(
				'info',
				`mergeNotiToGroup get noti status error ${error}`
			);
		});
}

export function preprocessAuthNoti(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		const { errorCode } = data;
		if (errorCode && errorCode === 'TOKEN_WAS_CHANGED') {
			const globalState = Controller.getGlobalState();
			const login = globalState.login;
			if (login.isLogin) {
				Navigation.showModal({
					screen: 'equix.PromptNew',
					animated: true,
					animationType: 'fade',
					navigatorStyle: {
						navBarHidden: true,
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'changedToken'
					}
				});
			}
		}
	} catch (error) {
		logDevice('error', `PROCESS AUTH NOTI ERROR: ${error}`);
	}
}

const emitOrder = (data, title) => {
	setTimeout(() => {
		if (data.client_order_id) {
			const channelOrderClientOrderID =
				StreamingBusiness.getChannelOrderClientOrderID(
					data.client_order_id
				);
			console.log('emitOrder client', data.client_order_id);
			Emitter.emit(channelOrderClientOrderID, { data, title });
		}
		if (data.broker_order_id) {
			const channelOrderBrokerOrderID =
				StreamingBusiness.getChannelOrderBrokerOrderID(
					data.broker_order_id
				);
			console.log('emitOrder broke', data.broker_order_id);
			Emitter.emit(channelOrderBrokerOrderID, { data, title });
		}
	}, 100);
};

export function preprocessOrderNoti(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		// if (data && data.broker_order_id && data.broker_order_id.toUpperCase().includes('FAKE')) return;
		const orderCacheKey = Business.getOrderCacheKey(data);
		if (orderCacheKey) {
			// Get current data from cache
			const oldData =
				dataStorage.dicOrdersRealTimeCacheSeq[orderCacheKey];

			/**
			 * Check old data's sequence number is less than new data's sequence number.
			 * If it's true, replace the old data with new one.
			 *
			 * @example Known issues: EM-2545 - https://quantedge.atlassian.net/browse/EM-2545
			 * After placing order successfully, the server sent 4 messages to update user's cache.
			 * The first 2 had the same 'object_changed' properties, which had 'order_state' = 'UserPlace',
			 * 'order_status' = 15
			 * The others had 'object_changed.order_state' = 'PendingNew' and 'object_changed.order_status' = 10.
			 * The main problem of this issue is all messages had the same object_changed.seq_num,
			 * which makes the condition statement below ('oldData < data.seq_num') become false.
			 * Temporary solution is to change comparision operator 'less than' ( < ) to 'less than or equal' ( <= ).
			 * But the 'equal' case might make the program updates cache with duplicated data.
			 */
			if (
				data &&
				data.account_id === dataStorage.accountId &&
				(!oldData || oldData < data.seq_num)
			) {
				dataStorage.dicOrdersRealTimeCache[orderCacheKey] = data;
				dataStorage.dicOrdersRealTimeCacheSeq[orderCacheKey] =
					data.seq_num;
			}
		}
		emitOrder(data, notif.title);
		logDevice(
			'info',
			`preprocessOrderNoti ${notif.title}-data ${JSON.stringify(data)}`
		);
		if (data && data.order_state) {
			const accountId = data.account_id;
			const tagOrder = Business.getTagOrderNotification(notif.title);
			if (
				accountId === dataStorage.accountId &&
				tagOrder.toUpperCase() !== Enum.TITLE_NOTI.REJECT
			) {
				handleRealtimeOrderNoti(data);
			}
		}
	} catch (error) {
		logDevice(
			'info',
			`preprocessOrderDetailNoti func exception with ${error}`
		);
	}
}

export function getStateSettingField(state) {
	switch (state) {
		case OrderState.ONMARKET:
		case OrderState.NEW:
			return 'on_market';
		case OrderState.FILLED:
			return 'filled';
		case OrderState.PARTIALFILL:
			return 'partialfill';
		case OrderState.PARTIALLY_FILLED:
			return 'partial_fill';
		case OrderState.REJECTED:
			return 'rejected';
		case OrderState.CANCELLED:
		case OrderState.CANCELED:
			return 'canceled';
		case OrderState.EXPIRED:
			return 'expired';
	}
}

export function setCacheDataRealtime(data, cbSetCache) {
	getCheckChange()
		.then(() => {
			cbSetCache && cbSetCache(data);
		})
		.catch((err) => {
			// console.log('CACHE PERSONAL REALTIME ERROR', err)
		});
}

export function updateCountNewRealtime(symbol) {
	try {
		if (symbol) {
			if (dataStorage.dicRelatedSymbol.indexOf(symbol) < 0) return; // Realtime đếm news, không trong related symbol -> return
		}

		const channelTab = Enum.CHANNEL_COUNT.TAB_RELATED_NEWS;
		const channelMenu = Enum.CHANNEL_COUNT.MENU_NEWS;
		const rdState = Controller.getGlobalState() || {};
		const relatedFilterType = rdState.news.relatedFilterType;

		NewsBusiness.getCountAndUpdateTotalUnreaded();
	} catch (error) {
		console.log(error);
	}
}

function updateWatchlistFromNoti(action, objChanged) {
	if (!objChanged.watchlist) return;
	switch (action) {
		case 'add':
			func.addToWatchList(objChanged);
			break;
		case 'remove':
			func.removeInWatchList(objChanged);
			break;
		case '':
			func.resetPriceBoardWatchList(objChanged);
			break;
		default:
			break;
	}
}

function storeAndEmitNewWatchlist(notif) {
	const objChanged = JSON.parse(notif.object_changed) || {};
	const action = notif.action || '';
	const method = notif.title.split('#')[1];
	logDevice(
		'info',
		`SSESSE WATCHLIST WITH METHOD ${method},data: ${JSON.stringify(notif)}`
	);
	switch (method) {
		case 'INSERT':
			func.addPriceboard(objChanged);
			break;
		case 'DELETE':
			func.deletePriceboard(objChanged);
			break;
		case 'UPDATE':
			updateWatchlistFromNoti(action, objChanged);
			break;
		default:
			break;
	}
	getRelatedSymbol(() => {
		const channel = Enum.CHANNEL_COUNT.MENU_NEWS;
		NewsBusiness.getCountAndUpdateTotalUnreaded(channel);
	});
}

export function preprocessWatchlistNoti(notif) {
	try {
		storeAndEmitNewWatchlist(notif);
	} catch (error) {
		logDevice(
			'info',
			`preprocessWatchlistNoti func exception with ${error}`
		);
		// console.log('preprocessWatchlistNoti func logAndReport exception: ', error)
	}
}

export function preprocessPortfolioNoti(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		Controller.updatePosition(data);
		if (
			dataStorage.searchSymbol &&
			dataStorage.searchSymbol === data.symbol
		) {
			Controller.dispatch(
				searchPortfolioActions.getDataPortfolioSuccess(data)
			);
		}
	} catch (error) {
		console.catch('preprocessPortfolioNoti', JSON.stringify(error));
	}
}

export function preprocessPortfolioAccountSummary(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		data.available_balance_au = data.cash_available_au; // Do không muốn thay đổi quá nhiều field trong dữ liệu trả về nên c2r sẽ là available_balance_us và available_balance_au còn realtime sẽ là cash_available_au và cash_available_us
		data.available_balance_us = data.cash_available_us;
		Controller.updateCashBalance(data);
	} catch (error) {
		console.catch(
			'preprocessPortfolioAccountSummary',
			JSON.stringify(error)
		);
	}
}

export function preprocessBalanceNoti(notif) {
	try {
		if (
			dataStorage.currentScreenId === ScreenId.PORTFOLIO ||
			dataStorage.currentScreenId === ScreenId.ORDER ||
			dataStorage.currentScreenId === ScreenId.MODIFY_ORDER
		) {
			PortfolioProcess.pubBalance(notif);
		}
	} catch (error) {
		logDevice('info', `preprocessBalanceNoti func exception with ${error}`);
		console.log(
			'preprocessBalanceNoti func logAndReport exception: ',
			error
		);
	}
}

export function checkReloadChangeSetting(location, lang, textFontSize) {
	const currentLocation = Controller.getLocation().location;
	const currentLang = Controller.getLang();
	const currentTextFontSize = Controller.getFontSize();
	if (
		currentLocation !== location ||
		currentLang !== lang ||
		currentTextFontSize !== textFontSize
	) {
		return true;
	}
	return false;
}

export async function preprocessSettingNoti(notif) {
	try {
		const type = notif.type || '';
		if (type === 'mobile') {
			const data = JSON.parse(notif.object_changed);
			const deviceId = dataStorage.deviceId;
			if (data && data.deviceId === deviceId) return;
			// Sync history search account, WL priceboard, symbol
			const isSyncHistorySearch = true;
			ManageHistorySearch.setHistorySearch({
				userSetting: data,
				isSync: isSyncHistorySearch
			});
			logDevice(
				'info',
				`preprocessSettingNoti with data ${JSON.stringify(data)}`
			);
			const isSound = data.notiSound;
			const tabId =
				data.homeScreen && data.homeScreen !== -1 ? data.homeScreen : 0;
			const tabSelected = HOME_SCREEN.find((e) => {
				return e.id === tabId;
			});
			const pinSetting = data.pinSetting || 0;
			const lang = data.lang || 'en';
			data.textFontSize = data.textFontSize || 16;
			let location = TIME_ZONE[43]; // fix timezone default time_zone key realtime la +10
			// if (data.timeZone === undefined || data.timeZone === null || data.timeZone.location === undefined || data.timeZone.location === null || data.timeZone.location === '') {
			// 	location = getNameTimezoneLocation()
			// }
			data.noti =
				data.noti !== null || data.noti !== undefined
					? data.noti
					: data.is_notify !== null || data.is_notify !== undefined
					? data.is_notify
					: true;
			// Update time news schedule
			if (data && data.news) {
				const { hour: fromHour, minute: fromMinute } =
					Util.getHoursMinutesLocal(
						data['news'][`fromHour`],
						data['news'][`fromMinute`]
					);
				const { hour: toHour, minute: toMinute } =
					Util.getHoursMinutesLocal(
						data['news'][`toHour`],
						data['news'][`toMinute`]
					);
				data['news']['fromHour'] = fromHour;
				data['news']['fromMinute'] = fromMinute;
				data['news']['toHour'] = toHour;
				data['news']['toMinute'] = toMinute;
			}
			// Cập nhật lại setting language
			const isReload = checkReloadChangeSetting(
				location.location,
				lang,
				data.textFontSize
			);
			Controller.setLocation(location);
			Controller.setLang(lang);
			// Cap nhat lai theme
			Controller.setFontSize(data.textFontSize);
			dataStorage.currentTheme = await Controller.getThemeColor();
			changeTheme(dataStorage.currentTheme);
			// Cap nhat lai setting tron redux
			if (isReload) {
				ManageConnection.reloadScreen();
				updateCompRelateFontsizeOrLang();
			}
			Controller.dispatch(settingActions.settingResponse(data));
			Controller.setSound(isSound);
			Controller.setVibrate(data.vibration);
			func.setPinSetting(pinSetting);
			const forceUpdate = false;
			func.setHomeScreen(tabSelected, forceUpdate);
		}
	} catch (error) {
		logDevice('info', `preprocessSettingNoti func exception with ${error}`);
		// console.log('preprocessSettingNoti func logAndReport exception: ', error)
	}
}

function updateCompRelateFontsizeOrLang() {
	dataStorage.isChangeSetting = true;
	const channelName = Channel.getChannelUpdateRealtimeFontsizeOrLang();
	Emitter.emit(channelName, {});
}

export function getDisplayName(symbol, callback) {
	try {
		const symbolInfo = dataStorage.symbolEquity[symbol];
		if (symbol && symbol !== '' && symbol !== 'OTHERS') {
			if (
				symbolInfo &&
				symbolInfo.display_name &&
				symbolInfo.display_name !== ''
			) {
				return symbolInfo.display_name;
			} else {
				getSymbolInfoApi(symbol, () => {
					const newSymbolInfo = dataStorage.symbolEquity[symbol];
					if (
						newSymbolInfo &&
						newSymbolInfo.display_name &&
						newSymbolInfo.display_name !== ''
					) {
						return newSymbolInfo.display_name;
					}
					logDevice(
						'info',
						`Can not get displayName from api of: ${symbol}`
					);
					return symbol;
				});
			}
		} else {
			logDevice(
				'info',
				`Can not get displayName of: ${symbol} - Dict symbolinfo: ${symbolInfo}`
			);
		}
		return symbol;
	} catch (error) {
		logDevice(
			'info',
			`getDisplayName ${symbol} error: ${error} - Dict symbolinfo: ${symbolInfo}`
		);
	}
}

export function preprocessNewsNoti(notif) {
	try {
		if (!Controller.getLoginStatus()) return;

		const newObj = JSON.parse(notif.object_changed);
		if (newObj && newObj.symbol) {
			const store = Controller.getGlobalState();
			const setting = store.setting;
			if (!setting.noti) return;
			const newsId = newObj.news_id;
			const listPersonal = dataStorage.dicPersonal;
			const listPosition = dataStorage.dicPosition;
			const listPersonalPosition = { ...listPersonal, ...listPosition };
			const symbol = (newObj.symbol + '').replace(/\.AU/g, '');
			const isSensitive = dataStorage.isSensitive;
			const sensitiveNoti =
				newObj.sign &&
				Array.isArray(newObj.sign) &&
				newObj.sign.includes('PriceSensitive');
			if (isSensitive && !sensitiveNoti) return;
			if (newsId && newObj.symbol && listPersonalPosition[`${symbol}`]) {
				const url = api.getNewById(newsId);
				api.requestData(url)
					.then((snap) => {
						if (snap && snap.length) {
							const data = snap[0];
							logDevice(
								'info',
								`preprocessNewsNoti get data news success with data ${JSON.stringify(
									snap[0]
								)}`
							);
							if (
								isSensitive &&
								data.sign &&
								Array.isArray(data.sign) &&
								!data.sign.includes('PriceSensitive')
							) {
								return;
							}
							if (
								dataStorage.currentScreenId === ScreenId.NEWS &&
								dataStorage.tabNews === 'relatedNews'
							) {
								handleRealtimeNewsNoti(data);
								handleSaveNotiStatus(data, NotiType.NEWS, 0);
								if (Controller.getVibrate()) {
									Vibration.vibrate();
								}
							} else {
								showNewsLocalNotification(data);
								handleSaveNotiStatus(data, NotiType.NEWS, 1);
							}
						}
					})
					.catch((error) => {
						// console.log('preprocessNewsNoti cannot get news data: ', error);
						logDevice(
							'info',
							`preprocessNewsNoti cannot get news data with ${error}`
						);
					});
			}
		}
	} catch (error) {
		logDevice('info', `preprocessNewsNoti func exception with ${error}`);
		// console.log('preprocessNewsNoti func logAndReport exception: ', error)
	}
}

export function preprocessNewsReadedNoti(notif) {
	const objChanged = notif.object_changed || '';
	if (objChanged) {
		const newReadedDetail = JSON.parse(objChanged) || [];
		const newID = newReadedDetail[0].news_id || '';
		const symbol = newReadedDetail[0].symbol || '';

		if (newID) {
			// update reddot
			NewsBusiness.updateNewsReadedByNewID(newID);
			// update number new unreaded
			updateCountNewRealtime(symbol);
		}
	}
}

export function showNewsLocalNotification(newsData) {
	if (newsData && newsData.title) {
		getSymbolInfo(newsData.symbol).then((displayName) => {
			const title = displayName;
			const body = newsData.title;
			const notificationId = newsData.news_id;
			const data = {
				notify_type: NotiType.NEWS,
				obj_id: notificationId,
				data: JSON.stringify(newsData),
				id: notificationId
			};
			// react native firebase display notification
			const badge = 0;
			const notification = Business.setNotification({
				notificationId,
				title,
				body,
				data,
				badge
			});
			Business.displayNotification(notification);
		});
	}
}

export function preprocessAlertNoti(notif) {
	try {
		if (
			dataStorage.currentScreenId === ScreenId.LIST_ALERT_WRAPPER ||
			dataStorage.currentScreenId === ScreenId.ADD_ALERT ||
			dataStorage.currentScreenId === ScreenId.MODIFY_ALERT ||
			dataStorage.currentScreenId === ScreenId.NEW_ALERT
		) {
			const objChanged = JSON.parse(notif.object_changed);
			const method = notif.title.split('#')[1];
			const channel = Channel.getChannelRealtimeListAlerts();
			const data = objChanged;
			Emitter.emit(channel, { data, method });
		}
	} catch (error) {}
}

export function preprocessNoti(notifOrigin) {
	try {
		// if (dataStorage.pNoti) return;
		let notif = notifOrigin;
		if (!notif.title && notif.data) {
			notif = notif.data;
		}

		if (notif && notif.title) {
			const notiType = getNotiType(notif.title);
			switch (notiType) {
				case NotiType.ALERT:
					preprocessAlertNoti(notif);
					break;
				case NotiType.SYNCHRONIZE:
					break;
				case NotiType.AUTH:
					// preprocessAuthNoti(notif);
					break;
				case NotiType.ORDER:
					preprocessOrderNoti(notif);
					break;
				case NotiType.ORDER_DETAIL:
					preprocessOrderDetailNoti(notif);
					break;
				case NotiType.NEWS:
					preprocessNewsNoti(notif);
					break;
				case NotiType.READNEWS:
					preprocessNewsReadedNoti(notif);
					break;
				case NotiType.WATCHLIST:
					preprocessWatchlistNoti(notif);
					break;
				case NotiType.PORTFOLIO:
					preprocessPortfolioNoti(notif);
					break;
				case NotiType.ACCOUNT_SUMMARY:
					preprocessPortfolioAccountSummary(notif);
					break;
				case NotiType.PORTFOLIO_TOTAL:
					// PortfolioProcess.process(notif);
					break;
				case NotiType.BALANCES:
					// preprocessBalanceNoti(notif)
					break;
				case NotiType.SETTING:
					preprocessSettingNoti(notif);
					break;
				case NotiType.TRANSACTION:
					preprocessTransactionNoti(notif);
					break;
				case NotiType.HALT:
				case NotiType.HALT_LIFT:
					preprocessHalt(notif);
					break;
				case NotiType.ACCOUNT:
					preprocessAccountNoti(notif);
					break;
				case NotiType.LIST_ACCOUNT:
					preprocessListAccountsNoti(notif);
					break;
				case NotiType.USER_DETAIL:
					preprocessNotifUserDetail(notif);
					break;
				case NotiType.USER_RESET_PASSWORD:
					// Controller.showAlertReload(() => {
					// 	Business.reloadApp()
					// })
					break;
				case NotiType.ROLE_GROUP:
					Controller.showAlertReload(async () => {
						Business.reloadApp();
					});
					break;
			}
		}
	} catch (error) {
		logDevice('info', `preprocessNoti func exception with ${error}`);
		// console.log('preprocessNoti func logAndReport exception: ', error)
	}
}

export function getExchangeByDisplaySymbol(symbol) {
	if (symbol) {
		symbol = symbol + '';
		const splitSymbol = symbol.split('.');
		switch (splitSymbol[1]) {
			case undefined:
				return exchangeString.TRADEMATCH;
			case 'ASX':
				return exchangeString.TRADEMATCH;
			// case 'ASX:CP':
			// return exchangeString.CENTRE_POINT;
			default:
				return splitSymbol[1];
		}
	}
}

export function preprocessListAccountsNoti(notif) {
	try {
		const listAccounts = JSON.parse(notif.object_changed);
		if (listAccounts && listAccounts.length) {
			fbemit.emit('account', 'update_list_account', listAccounts);
		}
	} catch (error) {
		// console.log('preprocessListAccountsNoti func logAndReport exception: ', error)
		logDevice(
			'info',
			`preprocessListAccountsNoti func exception: ${error}`
		);
	}
}

function isListMappingChange(oldMapping = '', newMapping = '') {
	try {
		const oldListMapping = !oldMapping
			? []
			: oldMapping
					.replace(/\s/g, '')
					.split(',')
					.sort((a, b) => a > b);
		const newListMapping = newMapping
			.map((item) => item.account_id)
			.sort((a, b) => a > b);
		const oldStr = oldListMapping.join(',');
		const newStr = newListMapping.join(',');

		return oldStr !== newStr;
	} catch (error) {
		return false;
	}
}

export function preprocessNotifUserDetail(notif) {
	const userInfo = Controller.getUserInfo();
	const newUserInfo = JSON.parse(notif.object_changed);
	const newListMapping = PureFunc.arrayHasItem(newUserInfo.list_mapping)
		? newUserInfo.list_mapping.map((item) => item.account_id).join(' ,')
		: '';

	// Xử lý role_group và status
	const oldUserInfo = PureFunc.clone(userInfo);
	Controller.setUserInfo({
		...userInfo,
		...PureFunc.clone(newUserInfo),
		list_mapping: newUserInfo.list_mapping
			? newListMapping
			: oldUserInfo.list_mapping
	});

	if (
		(newUserInfo.status != null &&
			oldUserInfo.status !== newUserInfo.status) ||
		(newUserInfo.user_login_id != null &&
			oldUserInfo.user_login_id !== newUserInfo.user_login_id)
	) {
		Controller.showAlert(I18n.t('msgLogoutSecurity'), () => {
			Controller.setIsShowingAlertReload(false);
			Controller.dispatch(loginActions.logout());
		});
	}

	if (
		(newUserInfo.role_group !== undefined &&
			newUserInfo.role_group != null &&
			newUserInfo.role_group !== oldUserInfo.role_group) ||
		(newUserInfo.organisation_code !== undefined &&
			newUserInfo.organisation_code !== oldUserInfo.organisation_code) ||
		(newUserInfo.branch_code !== undefined &&
			newUserInfo.branch_code !== oldUserInfo.branch_code) ||
		(newUserInfo.user_type !== undefined &&
			newUserInfo.user_type != null &&
			oldUserInfo.user_type !== newUserInfo.user_type) ||
		(newUserInfo.advisor_code !== undefined &&
			newUserInfo.advisor_code !== oldUserInfo.advisor_code) ||
		(newUserInfo.list_mapping !== undefined &&
			newUserInfo.list_mapping &&
			isListMappingChange(
				oldUserInfo.list_mapping,
				newUserInfo.list_mapping
			))
	) {
		Controller.showAlertReload(async () => {
			unregisterOldRoleGroup(
				preprocessNoti,
				'ALL',
				oldUserInfo.role_group
			);
			Business.reloadApp();
		});
	}

	if (!PureFuncUtil.compareObject(newUserInfo, oldUserInfo)) {
		const channelName = NewsBusiness.getChannelUserInfoNew();
		Emitter.emit(channelName, newUserInfo);
	}

	// Xử lý live_news
	if (
		newUserInfo.live_news != null &&
		newUserInfo.live_news !== oldUserInfo.live_news
	) {
		const channelName = NewsBusiness.getChannelLiveNews();
		Emitter.emit(channelName, newUserInfo.live_news);
	}
}

export function preprocessAccountNoti(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		if (dataStorage.accountId === data.account_id) {
			dataStorage.currentAccount = data;
			Controller.setCurrentAccount(data);
			fbemit.emit('account', 'update', data);
		}
	} catch (error) {
		// console.log('preprocessAccountNoti func logAndReport exception: ', error)
	}
}

export function preprocessHalt(notif) {
	try {
		const data = JSON.parse(notif.object_changed);
		if (data) {
			logDevice(
				'info',
				`preprocessHalt with data halt: ${
					data ? JSON.stringify(data) : ''
				}`
			);
			const { symbol, halt } = data;
			if (symbol) {
				const channel = StreamingBusiness.getChannelHalt(symbol);
				Emitter.emit(channel, halt);
			}
		}
	} catch (error) {
		// console.log('preprocessNoti func logAndReport exception: ', error)
	}
}

export function handleSaveNotiStatus(data, type, changeValue) {
	try {
		switch (type) {
			case NotiType.ORDER:
				break;
			case NotiType.NEWS:
				handleSaveNotiNews(data, changeValue);
				break;
		}
	} catch (error) {
		logDevice('info', `handleSaveNotiStatus func exception with ${error}`);
	}
}

export function handleSaveNotiNews(data, changeValue) {
	try {
		const newsId = data.news_id;
		const symbol = (data.symbol + '').replace(/\.AU/g, '');
		updateNewsNotiStatus(newsId, changeValue, symbol);
	} catch (error) {
		logDevice('info', `handleSaveNotiNews func exception with ${error}`);
	}
}

export function forgotPinWithAccessToken(pin, token, successCb, errorCb) {
	try {
		return Business.getEncryptText(pin).then((res) => {
			const { encryptText, sessionID } = res;
			const bodyData = pin
				? {
						data: {
							accessToken: token,
							pin: encryptText,
							session_id: pin === encryptText ? null : sessionID,
							env: `MOBILE_FORGOT_PIN_${dataStorage.emailLogin}`
						}
				  }
				: {
						data: {
							accessToken: token,
							env: `MOBILE_FORGOT_PIN_${dataStorage.emailLogin}`
						}
				  };
			const authUrl = api.getAuthUrl();
			return api
				.postData(`${authUrl}/pin`, bodyData)
				.then((data) => {
					if (data && data.errorCode) {
						return errorCb && errorCb(data.errorCode);
					}
					const accessToken =
						data && data.accessToken ? data.accessToken : null;
					Controller.setAccessToken(accessToken);
					Controller.dispatch(loginActions.saveToken(data));
					// data.baseUrl && Controller.setBaseUrl(data.baseUrl);
					successCb && successCb();
				})
				.catch((err) => {
					logDevice('info', `FORGOT PIN ERROR- ERROR - ${err}`);
					errorCb && errorCb(err);
				});
		});
	} catch (error) {
		logDevice('info', `FORGOT PIN EXCEPTION: ${error}`);
		errorCb && errorCb(error);
	}
}

// Func lay pin, accessToken, refreshToken moi
export function setNewPinToken(pin, token, successCb, errorCb) {
	try {
		Business.getEncryptText(pin).then((res) => {
			const { encryptText, sessionID } = res;
			const bodyData = pin
				? {
						data: {
							refreshToken: token,
							pin: encryptText,
							session_id: pin === encryptText ? null : sessionID,
							env: 'MOBILE_CHANGE_PIN'
						}
				  }
				: {
						data: {
							refreshToken: token,
							env: 'MOBILE_CHANGE_PIN'
						}
				  };
			return api
				.postData(`${api.getAuthUrl()}/change-pin`, bodyData)
				.then((data) => {
					Controller.dispatch(loginActions.saveToken(data));
					successCb && successCb();
				})
				.catch((err) => {
					logDevice('info', `SET NEW PIN ERROR- ERROR - ${err}`);
					errorCb && errorCb(err);
				});
		});
	} catch (error) {
		logDevice('info', `setNewPinToken func exception with ${error}`);
	}
}

export function businessLogSignOut() {
	const url = api.getUrlBusinessLogSignOut();
	const bodyData = {};
	return api
		.postData(url, bodyData)
		.then((data) => {
			// console.log('post business log sign out success')
		})
		.catch((error) => {
			// console.log('post business log sign out error', error)
		});
}

// Function xac thuc = pin
export function pinComplete(
	pin,
	refPin,
	successCb = null,
	errorCb = null,
	params,
	token,
	isSaveToken = false,
	closeModalCb = null
) {
	try {
		const store = Controller.getGlobalState();
		const login = store.login;
		const refreshToken = token || login.loginObj.refreshToken;

		return Business.getEncryptText(pin).then((res) => {
			const { encryptText, sessionID } = res;
			const bodyData = {
				data: {
					token: refreshToken,
					pin: encryptText,
					session_id: pin === encryptText ? null : sessionID
				}
			};
			const byPassAccessToken = true;
			return api
				.postData(
					`${api.getAuthUrl()}/decode`,
					bodyData,
					null,
					false,
					byPassAccessToken
				)
				.then((data) => {
					if (data && data.errorCode) {
						if (data.errorCode === 'TOKEN_WAS_CHANGED') {
							logDevice(
								'info',
								`PIN - TOKEN WAS CHANGED -> SIGN OUT -> RELOGIN`
							);
							// changed pin -> sign out -> login again
							closeModalCb && closeModalCb(); // close modal authen pin and show changed token warning
						} else {
							errorCb && errorCb(data.errorCode);
						}
					} else {
						const rToken = data.token;
						const refreshData = {
							data: {
								refreshToken: rToken
							}
						};
						api.postData(
							`${api.getAuthUrl()}/refresh`,
							refreshData,
							null,
							false,
							byPassAccessToken
						)
							.then((data) => {
								if (data && data.errorCode) {
									refPin && refPin.authenFail();
								} else {
									const accessToken = data.accessToken;
									// Controller.setBaseUrl(data.baseUrl);
									// Save lại token khi đăng nhập
									if (isSaveToken) {
										const loginObj = {
											pin,
											refreshToken: token,
											accessToken
										};
										Controller.dispatch(
											loginActions.saveToken(loginObj)
										);
									}
									refPin &&
										refPin.authenSuccess(
											accessToken,
											successCb,
											params
										);
								}
							})
							.catch((err) => {
								// console.log(`AUTHEN PIN REFRESH TOKEN ERROR: ${err}`)
								logDevice(
									'error',
									`AUTHEN PIN REFRESH TOKEN ERROR: ${err}`
								);
								refPin && refPin.authenFail();
							});
					}
				})
				.catch((error) => {
					// console.log('cannot post data token', error)
					logDevice('error', `AUTHEN PIN ERROR - ${error}`);
					Controller.dispatch(loginActions.resetLoginLoading());
					if (error) {
						errorCb && errorCb(error);
					}
				});
		});
	} catch (error) {
		// console.log('pinComplete func exception with', error)
		logDevice('info', `pinComplete func exception with ${error}`);
	}
}

export function authPinComplete({
	authenSuccess,
	authenFail,
	closeModalCb,
	pincode,
	isSaveToken = false
}) {
	try {
		const store = Controller.getGlobalState();
		const login = store.login;
		const refreshToken = login.loginObj.refreshToken;

		return Business.getEncryptText(pincode).then((res) => {
			const { encryptText, sessionID } = res;
			const bodyData = {
				data: {
					token: refreshToken,
					pin: encryptText,
					session_id: pincode === encryptText ? null : sessionID
				}
			};
			const byPassAccessToken = true;
			return api
				.postData(
					`${api.getAuthUrl()}/decode`,
					bodyData,
					null,
					false,
					byPassAccessToken
				)
				.then((data) => {
					if (data && data.errorCode) {
						if (data.errorCode === 'TOKEN_WAS_CHANGED') {
							logDevice(
								'info',
								`PIN - TOKEN WAS CHANGED -> SIGN OUT -> RELOGIN`
							);
							// changed pin -> sign out -> login again
							closeModalCb && closeModalCb(); // close modal authen pin and show changed token warning
						} else {
							authenFail && authenFail(data.errorCode);
						}
					} else {
						const rToken = data.token;
						const refreshData = {
							data: {
								refreshToken: rToken
							}
						};
						api.postData(
							`${api.getAuthUrl()}/refresh`,
							refreshData,
							null,
							false,
							byPassAccessToken
						)
							.then((data) => {
								if (data && data.errorCode) {
									authenFail && authenFail(data.errorCode);
								} else {
									const accessToken = data.accessToken;
									// Controller.setBaseUrl(data.baseUrl);
									// Save lại token khi đăng nhập
									if (isSaveToken) {
										const loginObj = {
											pin,
											refreshToken: token,
											accessToken
										};
										Controller.dispatch(
											loginActions.saveToken(loginObj)
										);
									}
									authenSuccess &&
										authenSuccess({ accessToken });
								}
							})
							.catch((err) => {
								// console.log(`AUTHEN PIN REFRESH TOKEN ERROR: ${err}`)
								logDevice(
									'error',
									`AUTHEN PIN REFRESH TOKEN ERROR: ${err}`
								);
								authenFail && authenFail(err);
							});
					}
				})
				.catch((error) => {
					// console.log('cannot post data token', error)
					logDevice('error', `AUTHEN PIN ERROR - ${error}`);
					Controller.dispatch(loginActions.resetLoginLoading());
					if (error) {
						authenFail && authenFail(error);
					}
				});
		});
	} catch (error) {
		// console.log('pinComplete func exception with', error)
		logDevice('info', `pinComplete func exception with ${error}`);
	}
}

// Function xac thuc = touch id
export function touchIDComplete(successCb, errCb, params, token) {
	try {
		const store = Controller.getGlobalState();
		const isConnected = store.app.isConnected;
		if (isConnected) {
			// Have network
			const login = store.login;
			const pin = Util.getPinOriginal(login.loginObj);
			const refreshToken = login.loginObj.refreshToken;
			return Business.getEncryptText(pin).then((res) => {
				const { encryptText, sessionID } = res;
				const bodyData = {
					data: {
						token: refreshToken,
						pin: encryptText,
						session_id: pin === encryptText ? null : sessionID
					}
				};
				const byPassAccessToken = true;
				return api
					.postData(
						`${api.getAuthUrl()}/decode`,
						bodyData,
						null,
						false,
						byPassAccessToken
					)
					.then((data) => {
						if (data && data.errorCode) {
							if (data.errorCode === 'TOKEN_WAS_CHANGED') {
								logDevice(
									'info',
									`TOUCHID - TOKEN WAS CHANGED -> SIGN OUT -> RELOGIN`
								);
								// changed pin -> sign out -> login again
								const closeModalCb = params.closeModalCb; // truyen tu auto login sang
								closeModalCb && closeModalCb(false, true); // close modal authen pin and show changed token warning
							} else {
								Alert.alert(
									`Decode token error. Please try again`
								);
								logDevice(
									'error',
									`AUTHEN TOUCHID - /DECODE ERROR: ${data.errorCode}`
								);
							}
						} else {
							const token = data.token;
							const refreshData = {
								data: {
									refreshToken: token
								}
							};
							api.postData(
								`${api.getAuthUrl()}/refresh`,
								refreshData,
								null,
								false,
								byPassAccessToken
							)
								.then((data) => {
									const accessToken = data.accessToken;
									// Controller.setBaseUrl(data.baseUrl);
									successCb && successCb(params, accessToken);
								})
								.catch((err) => {
									logDevice(
										'error',
										`AUTHEN TOUCHID ERROR - ${error}`
									);
									errCb && errCb();
								});
						}
					})
					.catch((error) => {
						// console.log('cannot post data token')
						logDevice('error', `AUTHEN TOUCHID ERROR - ${error}`);
						errCb && errCb();
					});
			});
		} else {
			// No network -> show network alert -> callback reauthen by touch id
			const error = {
				errorCode: 'No internet connection'
			};
			errCb && errCb(error);
			logDevice(
				'error',
				`touchIDComplete NO INTERNET CONNECTION ${error}`
			);
		}
	} catch (error) {
		logDevice('error', `touchIDComplete func exception with ${error}`);
	}
}

export function setDicReAuthen(name, nameEvent, cb) {
	if (!fbemit.emitters[name]) {
		fbemit.newEmitter(name);
	}
	fbemit.addListener(name, nameEvent, cb);
}

export function checkHandleNoti(data) {
	try {
		const orderState = data.order_state
			? (data.order_state + '').toUpperCase()
			: '';
		switch (orderState) {
			case OrderState.ONMARKET:
			case OrderState.PARTIALFILL:
			case OrderState.PARTIALLY_FILLED:
			case OrderState.FILLED:
			case OrderState.CANCELLED:
			case OrderState.CANCELED:
			case OrderState.REJECTED:
			case OrderState.EXPIRED:
			case OrderState.NEW:
				return true;
			default:
				return false;
		}
	} catch (error) {
		logDevice('info', `checkHandleNoti func exception with ${error}`);
	}
}

export function declareAnimation(
	variable,
	toValue,
	duration,
	useNativeDriver = false
) {
	const config = useNativeDriver
		? {
				toValue,
				duration,
				useNativeDriver: true
		  }
		: {
				toValue,
				duration
		  };
	return Animated.timing(variable, config);
}

export function declareParallelAnimation(animationArr) {
	return Animated.parallel(animationArr);
}

export function declareSequenceAnimation(animatedArr) {
	return Animated.sequence(animatedArr);
}

export function getListTradingHalt() {
	try {
		const url = api.getUrlTradingHalt();
		api.requestData(url).then((data) => {
			if (data && data.length) {
				for (let i = 0; i < data.length; i++) {
					const symbol = data[i];
					func.addSymbol(symbol);
				}
			}
		});
	} catch (error) {
		// console.log('getListTradingHalt func logAndReport exception: ', error)
	}
}

export function checkTradingHalt(symbol) {
	return new Promise((resolve, reject) => {
		try {
			if (dataStorage.symbolEquity[symbol]) {
				const symbolInfo = dataStorage.symbolEquity[symbol];
				if (
					symbolInfo.trading_halt !== 'undefined' &&
					symbolInfo.trading_halt === 1
				) {
					resolve(true);
				} else {
					resolve(false);
				}
			} else {
				// Chưa lấy symbol -> lấy symbol info
				getSymbolInfoApi(symbol, () => {
					const symbolInfo = dataStorage.symbolEquity[symbol];
					if (symbolInfo.trading_halt === 1) {
						resolve(true);
					} else {
						resolve(false);
					}
				});
			}
		} catch (error) {
			resolve(false);
			// console.log('checkTradingHalt func logAndReport exception: ', error)
		}
	});
}

export function getExchange(exchanges) {
	try {
		const listTradingMarket = [];
		const listExchange = [];
		if (exchanges) {
			for (let index = 0; index < exchanges.length; index++) {
				const element = exchanges[index];
				if (listExchange && listExchange[element]) {
					const tmp = listExchange[element].list_trading_market
						? listExchange[element].list_trading_market
						: null;
					if (tmp) {
						tmp.map((e, i) => {
							if (e && e.status !== 'inactive') {
								listTradingMarket.push(e.market);
							}
						});
					}
				}
			}
		}
		return listTradingMarket;
	} catch (error) {
		// console.log('getExchange func logAndReport exception: ', error)
	}
}

export function firstCharacterCapitalize(str) {
	if (typeof str === 'string') {
		const strLowerCase = str ? str.toLowerCase() : '';
		return strLowerCase.charAt(0).toUpperCase() + strLowerCase.slice(1);
	}
	return str;
}

export function getStringToEnd(str, numberCharacter) {
	if (str) {
		const strLength = str.length;
		const from = strLength - numberCharacter;
		return str.substr(from, numberCharacter);
	}
	return '';
}

export function sendToRocketChat(message, type = 'info') {
	try {
		const request = new XMLHttpRequest();
		let textSend =
			typeof message === 'object' ? JSON.stringify(message) : message;
		if (textSend === '{}' && message.message) {
			textSend = message.message;
		}
		const deviceId = dataStorage.deviceId;
		const user = Controller.getUserInfo();
		const currentDate = new Date();
		const timeFormat = currentDate.toString();
		const channel = config.logChanel;
		dataStorage.logId = dataStorage.logId + 1;
		textSend = `IRESS Mobile - ${timeFormat} - LogId: ${
			dataStorage.logId
		} - UserInfo: ${user.uid || user.user_id} - Email: ${
			user.email || dataStorage.emailLogin
		} - Device: ${deviceId} - Content: ${textSend}`;
		if (textSend.length && textSend.length >= 1000) {
			textSend.slice(0, 1000);
		}
		if (dataStorage.logDevice) {
			return dataStorage.logDevice(type, textSend, channel);
		}
		const firstKey = uuid.v4();
		const dataSend = CryptoJS.AES.encrypt(textSend, firstKey).toString();
		const body = {
			id: firstKey,
			type,
			data: dataSend
		};

		request.open('POST', config.logChanel);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(body));
	} catch (error) {
		// console.log('sendToRocketChat func logAndReport exception: ', error)
	}
}
export function sendToRocketChatBackUp(message, type = 'info') {
	try {
		const request = new XMLHttpRequest();
		let textSend =
			typeof message === 'object' ? JSON.stringify(message) : message;
		if (textSend === '{}' && message.message) {
			textSend = message.message;
		}
		const deviceId = dataStorage.deviceId;
		const user = Controller.getUserInfo();
		const currentDate = new Date();
		const timeFormat = currentDate.toString();
		dataStorage.logId = dataStorage.logId + 1;
		textSend = `IRESS Mobile - ${timeFormat} - LogId: ${
			dataStorage.logId
		} - UserInfo: ${user.uid || user.user_id} - Email: ${
			user.email || dataStorage.emailLogin
		} - Device: ${deviceId} - Content: ${textSend}`;
		if (textSend.length && textSend.length >= 1000) {
			textSend.slice(0, 1000);
		}
		const firstKey = uuid.v4();
		const dataSend = CryptoJS.AES.encrypt(textSend, firstKey).toString();
		const body = {
			id: firstKey,
			type,
			data: dataSend
		};

		request.open('POST', config.logChanel);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(body));
	} catch (error) {
		// console.log('sendToRocketChat func logAndReport exception: ', error)
	}
}
export function switchForm(navigator, event, cb = null) {
	const screen = event.link;
	const title = event.payload.title;
	const menuSelected = event.payload.menuSelected;
	const subtitle = event.payload.subtitle;
	const arg = event.payload.arg;
	const initialPage = event.payload.initialPage;
	const { symbol, isHideBackButton } = (arg && arg.passProps) || {};

	cb &&
		dataStorage.changeMenuSelected &&
		dataStorage.changeMenuSelected(title);
	switch (menuSelected) {
		case Enum.MENU_SELECTED.marketOverview:
			navigator.resetTo({
				screen: screen,
				navigatorStyle: CommonStyle.navigatorSpecial,
				title: I18n.t('overview'),
				animationType: 'none',
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				}
			});
			break;
		case Enum.MENU_SELECTED.alert:
			navigator.resetTo({
				screen,
				navigatorStyle: CommonStyle.navigatorSpecial,
				title: I18n.t('alertUpper'),
				animationType: 'none',
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					],
					rightButtons: checkRoleByKey(
						ROLE_DETAIL.ROLE_PERFORM_EDIT_BUTTON
					)
						? [
								{
									id: 'add_alert',
									icon: iconsMap['ios-create-outline']
								}
						  ]
						: []
				}
			});
			break;
		case Enum.MENU_SELECTED.newAlert:
			navigator.resetTo({
				screen,
				navigatorStyle: {
					...CommonStyle.navigatorSpecialNoHeader,
					...{ drawUnderNavBar: true }
				},
				title: I18n.t('newAlertUpper'),
				animationType: 'none',
				passProps: {
					isHideBackButton:
						isHideBackButton === undefined
							? true
							: isHideBackButton,
					symbolSelected: symbol,
					wrapperStyle: {
						paddingTop:
							Platform.OS === 'ios'
								? isIphoneXorAbove()
									? 38
									: 6
								: 0,
						height: isIphoneXorAbove() ? 48 + 38 : 48 + 6
					},
					style: {
						top:
							Platform.OS === 'ios'
								? isIphoneXorAbove()
									? 38
									: 16
								: 0
					}
				}
			});
			break;
		case Enum.MENU_SELECTED.news:
			navigator.resetTo({
				screen: screen,
				navigatorStyle: CommonStyle.navigatorSpecial,
				title: I18n.t('News'),
				animationType: 'none',
				passProps: {
					initialPage
				},
				navigatorButtons: {
					rightButtons: [
						{
							testID: 'NewFilterIcon',
							id: 'news_filter',
							icon: iconsMap['ios-funnel-outline']
						}
					],
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				},
				...arg
			});
			break;
		case Enum.MENU_SELECTED.order:
			navigator.resetTo({
				screen,
				navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
				animationType: 'none',
				passProps: {
					isDefault: true
				},
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				},
				...arg
			});
			break;
		case Enum.MENU_SELECTED.settings:
			navigator.resetTo({
				screen: screen,
				navigatorStyle: CommonStyle.navigatorSpecial1,
				title: I18n.t('settings'),
				animationType: 'none',
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				},
				...arg
			});
			break;
		case Enum.MENU_SELECTED.termOfUse:
			navigator.toggleDrawer({
				side: 'left',
				animated: true,
				to: 'closed'
			});
			navigator.resetTo({
				screen: screen,
				title: I18n.t('disclaimer'),
				navigatorStyle: CommonStyle.navigatorSpecial,
				passProps: {
					onCheck: dataStorage.disclaimerOncheck,
					onAccept: dataStorage.disclaimerAccept,
					backMore: true
				},
				animated: 'none',
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				}
			});
			break;
		case Enum.MENU_SELECTED.watchlist:
			navigator.resetTo({
				screen: screen,
				navigatorStyle: CommonStyle.navigatorSpecial,
				title: I18n.t('WatchListTitle'),
				animationType: 'none',
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				}
			});
			break;
		default:
			navigator.resetTo({
				screen: screen,
				navigatorStyle: [
					'Account',
					'App Info',
					'User Info',
					'Contract Notes',
					'Trade Summary'
				].includes(title)
					? CommonStyle.navigatorSpecial1
					: CommonStyle.navigatorSpecial,
				title: title,
				subtitle: subtitle,
				animationType: 'none',
				navigatorButtons: {
					leftButtons: [
						{
							title: 'menu',
							id: 'menu_ios',
							icon: iconsMap['md-menu'],
							testID: 'menu_ios'
						}
					]
				}
			});
			break;
	}
}

export function getReason(reasons) {
	if (!reasons) return '';
	if (typeof reasons !== 'string') {
		return I18n.t(OrderEnum[reasons]) || reasons;
	}

	try {
		let reason = '';
		const listReason = JSON.parse(reasons);
		listReason.map((e, i) => {
			let item = '[' + e + ']';
			let tmp = I18n.t(OrderEnum[item]) || e;
			if (tmp) {
				reason = reason.concat(tmp);
				if (i !== listReason.length - 1) {
					reason = reason.concat('; ');
				}
			}
		});
		return reason;
	} catch (error) {
		if (OrderEnum[reasons]) {
			return I18n.t(OrderEnum[reasons]);
		}
		return reasons;
	}
}

export function getCompany(stringQuery, cb) {
	const newTxt = Util.encodeSymbol(stringQuery);
	const url = `${api.getSymbolUrl(false, true)}${newTxt}`;
	const res = {};
	api.requestData(url)
		.then((data) => {
			if (typeof data === 'object' && !data.length) {
				res[data.code || data.symbol] =
					data.company_name || data.company || '';
				func.addSymbol(data);
				cb && cb(res);
			} else {
				for (let index = 0; index < data.length; index++) {
					const element = data[index];
					func.addSymbol(element);
					res[element.code || element.symbol] =
						element.company_name || element.company || '';
				}
				cb && cb(res);
			}
		})
		.catch((error) => {
			cb && cb();
		});
}

export function calculatorFeesSaxo(volume, decimal) {
	if (volume === 0) return 0;
	let fees = parseInt(volume) * 0.02;
	if (fees < 15) fees = 15;
	fees = fees * 1.1;
	return decimal ? formatNumber(fees, decimal) : fees;
}

export function checkNewsToday(stringQuery) {
	if (stringQuery && typeof stringQuery === 'string') {
		return new Promise((resolve, reject) => {
			const checkUrl = api.checkNewsTodayUrl(stringQuery);
			api.requestData(checkUrl)
				.then((data) => {
					dataStorage.listNewsToday = data || {};
					resolve();
				})
				.catch((error) => {
					reject(error);
				});
		});
	}
}

// Ham get symbol info support multi symbol
export function getSymbolInfoApi(
	stringQuery,
	cb,
	byPassCache = false,
	forceUpdate = false
) {
	const stringQueryOrigin = stringQuery;
	const encodeSplash = encodeURIComponent('/');
	const encodeHash = encodeURIComponent('#');
	stringQuery = (stringQueryOrigin + '').replace(/\//g, encodeSplash); // replace / -> %2F
	stringQuery = (stringQuery + '').replace(/#/g, encodeHash); // replace / -> %2F
	if (stringQuery !== '') {
		const newTxt = Util.encodeSymbol(stringQuery);
		const url = `${api.getSymbolUrl(false, true)}${newTxt}`;
		api.requestData(url, true, null, byPassCache)
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					for (let i = 0; i < data.length; i++) {
						const res = data[i];
						if (res) {
							checkAndAddToDic(res, forceUpdate);
						}
					}
				}
				cb && cb();
			})
			.catch((error) => {
				logDevice('info', `GET SYMBOL INFO ERROR - ${error}`);
				cb && cb();
			});
	} else {
		cb && cb();
	}
}

export function getSymbolInfoApi1(stringQuery, cb, byPassCache = false) {
	const stringQueryOrigin = stringQuery;
	const encodeSplash = encodeURIComponent('/');
	const encodeHash = encodeURIComponent('#');
	stringQuery = stringQueryOrigin.replace(/\//g, encodeSplash); // replace / -> %2F
	stringQuery = stringQuery.replace(/#/g, encodeHash); // replace # -> %2F
	if (stringQuery !== '') {
		const newTxt = Util.encodeSymbol(stringQuery);
		const url = `${api.getSymbolUrl(false, true)}${newTxt}`;
		api.requestData1(url, true, null, byPassCache)
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					for (let i = 0; i < data.length; i++) {
						const res = data[i];
						if (res) {
							checkAndAddToDic(res);
						}
					}
				}
				cb && cb();
			})
			.catch((error) => {
				logDevice('info', `GET SYMBOL INFO ERROR - ${error}`);
				cb && cb();
			});
	} else {
		cb && cb();
	}
}

export function checkAndAddToDic(symbolInfo, forceUpdate) {
	const { symbol, exchanges } = symbolInfo;
	// // FAKE TRADING HALT / NEWS IN DAY ANZ.ASX
	// if (symbol === 'ANZ' && exchanges[0] === 'ASX') {
	//     symbolInfo.trading_halt = 1
	// }
	const displayName = symbolInfo.display_name;
	if (!symbol || !displayName || !exchanges) {
		return;
	}
	func.addSymbol(symbolInfo, forceUpdate);
}

export function getEchangeSymbol(symbol, cb) {
	const newTxt = Util.encodeSymbol(symbol);
	const url = `${api.getSymbolUrl(false, true)}${newTxt}`;
	api.requestData(url)
		.then((data) => {
			if (data && data.length) {
				const res =
					data[0].exchanges && data[0].exchanges[0]
						? `.${data[0].exchanges[0]}`
						: null;
				cb && cb(res);
			}
		})
		.catch((error) => {
			cb && cb();
		});
}
export function searchReccent({ cb }) {
	func.getReccentSearchSymbol()
		.then((data) => {
			cb && cb(data);
		})
		.catch((e) => cb && cb([]));
}
const listSymbolFuture = [
	{
		symbol: 'CPEU20.XCEC',
		class: 'future',
		code: 'F.US.CPEU20',
		display_name: 'CPEU20.COMEX',
		status: 'active',
		exchanges: ['XCEC'],
		country: 'US',
		contract_unit: null,
		contract_months: 'U20',
		listing_date: '2020-05-08T23:17:33.000Z',
		min_price_movement: 1,
		last_trading_day: '2020-09-28T00:00:00.000Z',
		cash_settlement_price: 1,
		trading_hours: null,
		settlement_day: '2020-05-08T23:17:33.000Z',
		position_limit: 1,
		daily_price_limit: 1,
		cftc_approved: null,
		updated: '2020-05-08T23:17:33.000Z',
		company_name: null,
		GICS_industry_group: null,
		list_trading_market: ['XCEC'],
		trading_halt: 0,
		currency: 'USD',
		ISIN: '1',
		display_exchange: 'COMEX',
		last_halt: 0,
		last_haltlift: 0,
		type: 1,
		display_master_code: 'CPE.COMEX',
		display_master_name: 'Copper (Globex)',
		master_code: 'CPE.XCEC',
		master_name: 'Copper (Globex)',
		expiry_date: '092020',
		first_noti_day: '2020-08-31T00:00:00.000Z',
		security_name: 'COPPER (GLOBEX) SEP20',
		origin_symbol: null
	},
	{
		symbol: 'LALZ.XLME',
		class: 'future',
		code: 'X.US.LALZ',
		display_name: 'LALZ.LME',
		status: 'active',
		exchanges: ['XLME'],
		country: 'US',
		contract_unit: null,
		contract_months: null,
		listing_date: '2020-05-08T23:30:00.000Z',
		min_price_movement: 1,
		last_trading_day: null,
		cash_settlement_price: 1,
		trading_hours: null,
		settlement_day: '2020-05-08T23:30:00.000Z',
		position_limit: 1,
		daily_price_limit: 1,
		cftc_approved: null,
		updated: '2020-05-08T23:30:00.000Z',
		company_name: null,
		GICS_industry_group: null,
		list_trading_market: ['XLME'],
		trading_halt: 0,
		currency: 'USD',
		ISIN: '1',
		display_exchange: 'LME',
		last_halt: 0,
		last_haltlift: 0,
		type: 0,
		display_master_code: null,
		display_master_name: null,
		master_code: null,
		master_name: null,
		expiry_date: null,
		first_noti_day: null,
		security_name: 'Aluminium (USD, 90d Fwd) SELECT',
		origin_symbol: null,
		has_child: true
	},
	{
		symbol: 'RBEQ20.XNYM',
		class: 'future',
		code: 'F.US.RBEQ20',
		display_name: 'RBEQ20.NYMEX',
		status: 'active',
		exchanges: ['XNYM'],
		country: 'US',
		contract_unit: null,
		contract_months: 'Q20',
		listing_date: '2020-05-08T23:23:15.000Z',
		min_price_movement: 1,
		last_trading_day: '2020-07-31T00:00:00.000Z',
		cash_settlement_price: 1,
		trading_hours: null,
		settlement_day: '2020-05-08T23:23:15.000Z',
		position_limit: 1,
		daily_price_limit: 1,
		cftc_approved: null,
		updated: '2020-05-08T23:23:15.000Z',
		company_name: null,
		GICS_industry_group: null,
		list_trading_market: ['XNYM'],
		trading_halt: 0,
		currency: 'USD',
		ISIN: '1',
		display_exchange: 'NYMEX',
		last_halt: 0,
		last_haltlift: 0,
		type: 1,
		display_master_code: 'RBE.NYMEX',
		display_master_name: 'RBOB Gasoline (Globex)',
		master_code: 'RBE.XNYM',
		master_name: 'RBOB Gasoline (Globex)',
		expiry_date: '082020',
		first_noti_day: '2020-08-04T00:00:00.000Z',
		security_name: 'RBOB GASOLINE (GLOBEX) AUG20',
		origin_symbol: null
	},
	{
		symbol: 'SIEZ20.XCEC',
		class: 'future',
		code: 'F.US.SIEZ20',
		display_name: 'SIEZ20.COMEX',
		status: 'active',
		exchanges: ['XCEC'],
		country: 'US',
		contract_unit: null,
		contract_months: 'Z20',
		listing_date: '2020-05-08T23:24:32.000Z',
		min_price_movement: 1,
		last_trading_day: '2020-12-29T00:00:00.000Z',
		cash_settlement_price: 1,
		trading_hours: null,
		settlement_day: '2020-05-08T23:24:32.000Z',
		position_limit: 1,
		daily_price_limit: 1,
		cftc_approved: null,
		updated: '2020-05-08T23:24:32.000Z',
		company_name: null,
		GICS_industry_group: null,
		list_trading_market: ['XCEC'],
		trading_halt: 0,
		currency: 'USD',
		ISIN: '1',
		display_exchange: 'COMEX',
		last_halt: 0,
		last_haltlift: 0,
		type: 1,
		display_master_code: 'SIE.COMEX',
		display_master_name: 'Silver (Globex)',
		master_code: 'SIE.XCEC',
		master_name: 'Silver (Globex)',
		expiry_date: '122020',
		first_noti_day: '2020-11-30T00:00:00.000Z',
		security_name: 'SILVER (GLOBEX) DEC20',
		origin_symbol: null
	},
	{
		symbol: 'ZSEN20.XCBT',
		class: 'future',
		code: 'F.US.ZSEN20',
		display_name: 'ZSEN20.CBOT',
		status: 'active',
		exchanges: ['XCBT'],
		country: 'US',
		contract_unit: null,
		contract_months: 'N20',
		listing_date: '2020-05-08T23:29:06.000Z',
		min_price_movement: 1,
		last_trading_day: '2020-07-14T00:00:00.000Z',
		cash_settlement_price: 1,
		trading_hours: null,
		settlement_day: '2020-05-08T23:29:06.000Z',
		position_limit: 1,
		daily_price_limit: 1,
		cftc_approved: null,
		updated: '2020-05-08T23:29:06.000Z',
		company_name: null,
		GICS_industry_group: null,
		list_trading_market: ['XCBT'],
		trading_halt: 0,
		currency: 'USD',
		ISIN: '1',
		display_exchange: 'CBOT',
		last_halt: 0,
		last_haltlift: 0,
		type: 1,
		display_master_code: 'ZSE.CBOT',
		display_master_name: 'Soybeans (Globex)',
		master_code: 'ZSE.XCBT',
		master_name: 'Soybeans (Globex)',
		expiry_date: '072020',
		first_noti_day: '2020-06-30T00:00:00.000Z',
		security_name: 'SOYBEANS (GLOBEX) JUL20',
		origin_symbol: null
	}
];
export function searchResponseFakeFuture({
	textSearch,
	classQuery,
	cb,
	top = count.SEARCH,
	index = 0,
	timeout = false
}) {
	dataStorage.continueSearch = false;
	const searchUrl = api.getSearchSymbolUrl({
		textSearch,
		classQuery,
		top,
		index
	});
	const timeStartReq = +new Date();
	api.requestData(searchUrl, null, null, null, timeout)
		.then((data) => {
			const listSymbolFu = listSymbolFuture.filter((el) => {
				const symbol = el.display_name.toLocaleLowerCase();
				return symbol.includes(textSearch.toLocaleLowerCase());
			});
			data = [...listSymbolFu, ...data];
			if (data && data.length) {
				for (let index = 0; index < data.length; index++) {
					const element = data[index];
					func.addSymbol(element);
				}
				cb && cb(data, classQuery, textSearch);
			} else {
				cb && cb([], classQuery, textSearch);
			}
		})
		.catch((error) => {
			setResolveAfterLoading(
				2000,
				timeStartReq,
				cb && cb([], classQuery, textSearch)
			);
		});
}
export function searchSystemWatchlist(allListSystemWL = [], textSearch = '') {
	let listSystemWL = [];
	if (!textSearch) {
		return allListSystemWL;
	} else {
		const filterListSystemWL = allListSystemWL.filter((item) => {
			const { watchlist_name: WLName, watchlist } = item;
			const isContainTextSearch =
				WLName.toUpperCase().includes(textSearch.toUpperCase()) ||
				watchlist.toUpperCase().includes(textSearch.toUpperCase());
			return isContainTextSearch;
		});
		listSystemWL = filterListSystemWL.sort((a, b) => {
			const aLength = a.watchlist_name.length;
			const bLength = b.watchlist_name.length;
			return aLength - bLength;
		});
	}
	return listSystemWL.slice(0, 30);
}

export function searchResponse({
	textSearch,
	classQuery,
	cb,
	top = count.SEARCH,
	index = 0,
	timeout = false
}) {
	dataStorage.continueSearch = false;
	const searchUrl = api.getSearchSymbolUrl({
		textSearch,
		classQuery,
		top,
		index
	});
	const timeStartReq = +new Date();
	api.requestData(searchUrl, null, null, null, timeout)
		.then((data) => {
			if (isErrorSystemByCode(data)) return;
			if (data && data.length && data !== 'INVALID_PARAMS') {
				for (let index = 0; index < data.length; index++) {
					const element = data[index];
					func.addSymbol(element);
				}
				cb && cb(data, classQuery, textSearch);
			} else {
				cb && cb([], classQuery, textSearch);
			}
		})
		.catch((error) => {
			setResolveAfterLoading(
				2000,
				timeStartReq,
				cb && cb([], classQuery, textSearch)
			);
		});
}
//
export function resultSearchNewOrderByMaster({
	masterCode,
	textSearch,
	isPointTextSearch,
	cb
}) {
	dataStorage.continueSearch = false;
	const searchUrl = api.getSearchNewOrderByMaster({
		masterCode,
		textSearch,
		isPointTextSearch
	});
	api.requestData(searchUrl)
		.then((data) => {
			console.log('data searchSearchNewOrderByMaster$$$$', data);
			if (data && data.length) {
				console.log('data searchSearchNewOrderByMaster', data);
				for (let i = 0; i < data.length; i++) {
					const res = data[i];
					if (res) {
						checkAndAddToDic(res);
					}
				}
				cb && cb(data);
			} else {
				cb && cb();
			}
		})
		.catch((error) => {
			cb && cb();
		});
}

export function getIdNotify(id, index = 2) {
	try {
		let res = '';
		// const userId = func.getUserId();
		// id = (id + '').replace(userId + '_', '');
		// res = id.slice(0, 14);
		res = (id + '').split('_');
		if (res.length > 6) {
			return (
				res[2] +
				'_' +
				res[3] +
				'_' +
				res[4] +
				'_' +
				res[5] +
				'_' +
				res[6]
			);
		}
		return '';
	} catch (error) {
		// console.log('cannot convert')
	}
}

function getUniqueArr(arr) {
	if (arr && arr.length) {
		let res = [];
		res = arr.filter((e, p, a) => {
			return a.indexOf(e) === p;
		});
		return res;
	}
	return [];
}

export function isIphoneXorAbove() {
	const dimen = Dimensions.get('window');
	return (
		Platform.OS === 'ios' &&
		!Platform.isPad &&
		!Platform.isTVOS &&
		(dimen.height >= 812 || dimen.width >= 812)
	);
}
export function getTopPanel() {
	return Platform.OS === 'ios' ? 16 + 8 : 16 + 16;
}
export function getMarginTopDevice(isNotIphoneX = 0) {
	const isIphone = Platform.OS === 'ios';
	const isX = isIphoneXorAbove();
	let marginTop = 0;
	if (isIphone && isX) marginTop = 32;
	if (isIphone && !isX) marginTop = isNotIphoneX || 16;
	return marginTop;
}

export function isAndroid() {
	return !(Platform.OS === 'ios');
}
export function checkWeekend() {
	const day = new Date().getUTCDay();
	const hour = new Date().getUTCHours();
	if (day !== 6 && day !== 0) {
		return true;
	} else if (day === 0 && hour >= 23) {
		return true;
	}
	return false;
}

export function searchAndSort(textSearch, field, listData) {
	let results = [];
	results = listData.filter((item) => {
		if (item && item[field]) {
			const str = (item[field] + '').toLowerCase();
			if (str.startsWith(textSearch)) {
				return item;
			}
		}
	});
	if (results.length) {
		results.sort(function (a, b) {
			const code1 = a[field].toUpperCase();
			const code2 = b[field].toUpperCase();
			if (code1 < code2) {
				return -1;
			}
			if (code1 > code2) {
				return 1;
			}
			return 0;
		});
	}
	return results;
}

export function largeValue(value, decimal) {
	if (value === undefined || value === null) return '--';
	if (value === 0) return 0;
	const newValue = parseInt(Math.abs(value));
	const suffixes = ['', 'K', 'M', 'B', 'T'];
	const suffixNum = Math.floor((('' + newValue).length - 1) / 3);
	let shortValue = parseFloat(
		suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value
	);
	shortValue = Math.round(shortValue * 100) / 100;
	if (shortValue % 1 === 0) {
		shortValue = parseInt(shortValue);
	}
	return (
		(decimal ? formatNumberNew2(shortValue, decimal) : shortValue) +
		suffixes[suffixNum]
	);
}

export function offTouchIDSetting(successCallback) {
	const email =
		dataStorage.emailLogin.toLowerCase() ||
		dataStorage.userPin.email.toLowerCase() ||
		Controller.getUserLoginId().toLowerCase();
	const obj = {
		email,
		enableTouchID: false,
		numberFailEnterPin: dataStorage.userPin.numberFailEnterPin || 0
	};
	saveItemInLocalStorage(
		email,
		obj,
		null,
		() => {
			dataStorage.userPin.enableTouchID = false;
			successCallback && successCallback();
		},
		() => console.log('save user pin info fail')
	);
}

export function convertToUTC(hour) {
	const UTCtime = new Date();
	UTCtime.setHours(hour);

	return UTCtime.getUTCHours();
}

export function convertToLocalTime(hour) {
	const localTime = new Date();
	localTime.setUTCHours(hour);
	return localTime.getHours() + '';
}

export function countC2RTimes(type, successFunc, errorFunc) {
	if (type === dataStorage.isCounting) {
		successFunc && successFunc();
		return;
	}
	dataStorage.isCounting = type;
	if (
		func.getUserPriceSource() === userType.Delay ||
		dataStorage.loginUserType === loginUserType.REVIEW
	) {
		successFunc && successFunc();
		return;
	}
	const userId = func.getUserId();
	const fb = firebase.database().ref(`price_snapshot_request/${userId}`);
	fb.set({ updated: new Date().getTime(), user_id: userId, type_form: type })
		.then(() => {
			successFunc && successFunc();
			dataStorage.isCounting = null;
			// console.log('count c2r success');
		})
		.catch((error) => {
			errorFunc && errorFunc();
			// console.log('count c2r failed');
		});
}

export function checkTouchIdSupport() {
	if (Platform.OS === 'ios') {
		// LocalAuth.hasTouchID()
		//     .then(() => {
		//         logDevice('info', `TOUCH ID IS SUPPORTED`);
		//         // console.log('Ios Touch id is supported');
		//         dataStorage.isSupportTouchID = true;
		//     })
		//     .catch((error) => {
		//         logDevice('info', `Touch id ERROR: ${JSON.stringify(error)}`);
		//         // console.log(error)
		//         const errorName = error.name;
		//         if (
		//             errorName === 'LAErrorTouchIDNotEnrolled' ||
		//             errorName === 'LAErrorTouchIDLockout'
		//         ) {
		//             dataStorage.isSupportTouchID = true;
		//             if (errorName === 'LAErrorTouchIDLockout') {
		//                 dataStorage.isLockTouchID = true;
		//             } else if (errorName === 'LAErrorTouchIDNotEnrolled') {
		//                 dataStorage.isNotEnrolledTouchID = true;
		//             }
		//             // console.log('Ios Touch id is supported');
		//         } else {
		//             // console.log('Ios Touch id not support')
		//             dataStorage.isSupportTouchID = false;
		//         }
		//     });
	} else {
		// Finger.isSensorAvailable()
		//     .then((isSupport) => {
		//         logDevice(
		//             'info',
		//             `ANDROID FINGERPRINT IS SUPPORTED - ${isSupport}`
		//         );
		//         // console.log('Android FINGERPRINT is supported', isSupport)
		//         dataStorage.isSupportTouchID = true;
		//     })
		//     .catch((error) => {
		//         logDevice('info', `ANDROID FINGERPRINT ERROR - ${error}`);
		//         // console.log('Android FINGERPRINT', error)
		//         if (error === 'NOT_ENROLLED') {
		//             // console.log('Android touch id not enrolled')
		//             dataStorage.isNotEnrolledTouchID = true;
		//             dataStorage.isSupportTouchID = true;
		//         } else {
		//             // console.log('Android touch id not support')
		//             dataStorage.isSupportTouchID = false;
		//         }
		//     });
	}
}

export function getNotiId(notif) {
	const data = JSON.parse(notif.object_changed);
	const notiType = getNotiType(notif.title);
	const orderId = getOrderIdByType(data);
	switch (notiType) {
		case NotiType.ORDER:
		case NotiType.ORDER_DETAIL:
			return orderId;
		case NotiType.NEWS:
			return data.news_id || '';
	}
}

export function getNotiType(title, index = 0) {
	const listData = (title + '').split('#');
	let type = listData[index];
	if (type === dataStorage.accountId) {
		type = listData[1];
	}
	type = (type + '').toUpperCase();
	switch (type) {
		case NotiType.ORDER:
			return NotiType.ORDER;
		case NotiType.ORDER_DETAIL:
			return NotiType.ORDER_DETAIL;
		case NotiType.SYNCHRONIZE:
			return NotiType.SYNCHRONIZE;
		case NotiType.WATCHLIST:
			return NotiType.WATCHLIST;
		case NotiType.SETTING:
			return NotiType.SETTING;
		case NotiType.BALANCES:
			return NotiType.BALANCES;
		case NotiType.PORTFOLIO:
			return NotiType.PORTFOLIO;
		case NotiType.TRANSACTION:
			return NotiType.TRANSACTION;
		case NotiType.ACCOUNT:
			return NotiType.ACCOUNT;
		case NotiType.HALT:
			return NotiType.HALT;
		case NotiType.NEWS:
			return NotiType.NEWS;
		case NotiType.AUTH:
			return NotiType.AUTH;
		case NotiType.LIST_ACCOUNT:
			return NotiType.LIST_ACCOUNT;
		default:
			return type;
	}
}

export function getNotiAction(title) {
	const listData = (title + '').split('#');
	const action = listData[1];
	switch (action) {
		case NotiAction.INSERT:
			return NotiAction.INSERT;
		case NotiAction.UPDATE:
			return NotiAction.UPDATE;
		case NotiAction.DELETE:
			return NotiAction.DELETE;
	}
}

export function getOrderTypeNoti(data) {
	let orderType = data.order_type ? data.order_type.toUpperCase() : '';
	const isAuSymbol = Business.isParitech(data.symbol);
	const orderTypeOrigin = data.order_type_origin
		? data.order_type_origin.toUpperCase()
		: '';
	if (
		[OrderType.STOPLIMIT, OrderType.STOPLIMIT_ORDER].includes(
			orderTypeOrigin
		) &&
		isAuSymbol
	) {
		orderType = OrderType.STOPLOSS;
	} else {
		orderType = orderTypeOrigin;
	}
	switch (orderType) {
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return OrderTypeNoti.MARKET;
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return OrderTypeNoti.MARKETTOLIMIT;
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
			return OrderTypeNoti.LIMIT;
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
		case OrderType.STOP_LIMIT:
		case OrderType.STOP_LIMIT_ORDER:
			return OrderTypeNoti.STOPLIMIT;
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return OrderTypeNoti.STOPLOSS;
		case OrderType.TRAILINGSTOPLIMIT:
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
			return OrderTypeNoti.TRAILINGSTOPLIMIT;
	}
}

export function getSymbolInfo(symbol) {
	return new Promise((resolve, reject) => {
		const newTxt = Util.encodeSymbol(symbol);
		const url = `${api.getSymbolUrl(false, true)}${newTxt}`;
		api.requestData(url)
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					const res = data[0];
					return resolve(res.display_name || '');
				}
			})
			.catch((error) => {
				return resolve('');
			});
	});
}

export function getNotiBody(notif, fnCb) {
	let body = null;
	const notiType = getNotiType(notif.title);
	const data = JSON.parse(notif.object_changed);
	getSymbolInfo(data.symbol).then((displayName) => {
		switch (notiType) {
			case NotiType.ORDER_DETAIL:
				break;
			case NotiType.ORDER:
				const orderState = data.order_state
					? (data.order_state + '').toUpperCase()
					: '';
				switch (orderState) {
					case OrderState.ONMARKET:
					case OrderState.NEW:
						body = getNotiContentOnMarket(data, displayName);
						break;
					case OrderState.PARTIALFILL:
					case OrderState.PARTIALLY_FILLED:
						body = getNotiContentPartialFill(data, displayName);
						break;
					case OrderState.FILLED:
						body = getNotiContentFilled(data, displayName);
						break;
					case OrderState.CANCELLED:
					case OrderState.CANCELED:
						body = getNotiContentCancelled(data, displayName);
						break;
					case OrderState.REJECTED:
						body = getNotiContentRejected(data, displayName);
						break;
					case OrderState.EXPIRED:
						body = getNotiContentExpired(data, displayName);
						break;
				}
				break;
			case NotiType.NEWS:
				body = data.title || '';
				break;
		}
		fnCb && fnCb(body);
	});
}

export function getNotiContentOnMarket(data, displayName) {
	const orderType = getOrderTypeNoti(data);
	const side = data.is_buy
		? `${I18n.t('buyUpper')}`
		: `${I18n.t('sellUpper')}`;
	const volume = data.volume || 0;
	const limitPrice = data.limit_price || 0;
	const stopPrice = data.stop_price || 0;
	const type =
		orderType || data.order_type
			? (data.order_type + '').toUpperCase()
			: '';
	switch (type) {
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return I18n.t('onMarketMKT')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`);
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return I18n.t('onMarketM')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`);
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return I18n.t('onMarketStoploss')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##stopPrice##',
					`${formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)}`
				);
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
			return I18n.t('onMarketLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					`${formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)}`
				);
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
		case OrderType.STOP_LIMIT:
		case OrderType.STOP_LIMIT_ORDER:
			return I18n.t('onMarketStopLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					`${formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)}`
				)
				.replace(
					'##stopPrice##',
					`${formatNumberNew2(data.stop_price, PRICE_DECIMAL.PRICE)}`
				);
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
		case OrderType.TRAILINGSTOPLIMIT:
			const trailingValue =
				data.trailing_type === 'amount'
					? data.trailing_amount
					: data.trailing_percent;
			if (data.trailing_type === 'amount') {
				return I18n.t('onMarketTrailingAmountStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##limitPrice##',
						`${formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)}`
					)
					.replace(
						'##stopPrice##',
						`${formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)}`
					)
					.replace(
						'##trailingValue##',
						`${formatNumberNew2(
							trailingValue,
							PRICE_DECIMAL.VALUE
						)}`
					);
			} else {
				return I18n.t('onMarketTrailingPercentStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##limitPrice##',
						`${formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)}`
					)
					.replace(
						'##stopPrice##',
						`${formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)}`
					)
					.replace(
						'##trailingValue##',
						`${formatNumberNew2(
							trailingValue,
							PRICE_DECIMAL.VALUE
						)}`
					);
			}
		default:
			return '';
	}
}

export function getNotiContentPartialFill(data, displayName) {
	const orderType = getOrderTypeNoti(data);
	const side = data.is_buy
		? `${I18n.t('buyUpper')}`
		: `${I18n.t('sellUpper')}`;
	const volume = data.volume || 0;
	const limitPrice = data.limit_price || 0;
	const stopPrice = data.stop_price || 0;
	const filledQuantity = data.filled_quantity || 0;
	const filledPrice = data.avg_price || '--';
	const type = orderType || (data.order_type + '').toUpperCase() || '';
	switch (type) {
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return I18n.t('partialFillMKT')
				.replace('##side##', `${side}`)
				.replace(/##volume##/g, `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##filledQuantity##',
					`${formatNumber(filledQuantity)}`
				)
				.replace(
					'##filledPrice##',
					formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return I18n.t('partialFillM')
				.replace('##side##', `${side}`)
				.replace(/##volume##/g, `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##filledQuantity##',
					`${formatNumber(filledQuantity)}`
				)
				.replace(
					'##filledPrice##',
					formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return I18n.t('partialFillStoploss')
				.replace('##side##', `${side}`)
				.replace(/##volume##/g, `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##filledQuantity##',
					`${formatNumber(filledQuantity)}`
				)
				.replace(
					'##filledPrice##',
					formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
			return I18n.t('partialFillLimit')
				.replace('##side##', `${side}`)
				.replace(/##volume##/g, `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##filledQuantity##',
					`${formatNumber(filledQuantity)}`
				)
				.replace(
					'##filledPrice##',
					formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
			return I18n.t('partialFillStopLimit')
				.replace('##side##', `${side}`)
				.replace(/##volume##/g, `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##filledQuantity##',
					`${formatNumber(filledQuantity)}`
				)
				.replace(
					'##filledPrice##',
					formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.TRAILINGSTOPLIMIT:
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
			const trailingValue =
				data.trailing_type === 'amount'
					? data.trailing_amount
					: data.trailing_percent;
			if (data.trailing_type === 'amount') {
				return I18n.t('partialFillTrailingAmountStopLimit')
					.replace('##side##', `${side}`)
					.replace(/##volume##/g, `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##limitPrice##',
						formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue####',
						formatNumberNew2(trailingValue)
					);
			} else {
				return I18n.t('partialFillTrailingPercentStopLimit')
					.replace('##side##', `${side}`)
					.replace(/##volume##/g, `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##limitPrice##',
						formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						formatNumberNew2(trailingValue)
					);
			}
		default:
			return '';
	}
}

export function getNotiContentFilled(data, displayName) {
	const orderType = getOrderTypeNoti(data);
	const side = data.is_buy
		? `${I18n.t('buyUpper')}`
		: `${I18n.t('sellUpper')}`;
	const volume = data.volume || 0;
	const limitPrice = data.limit_price || 0;
	const stopPrice = data.stop_price || 0;
	const lastContent = ` ${I18n.t('is')} ${I18n.t('done')}`;
	const avgPrice = data.avg_price || 0;
	const filledQuantity = data.filled_quantity || 0;
	// const restVolume = volume - filledQuantity;
	// if (filledQuantity) volume = restVolume;
	const type = orderType || (data.order_type + '').toUpperCase();
	switch (type) {
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return I18n.t('filledMKT')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##averagePrice##',
					formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return I18n.t('filledM')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##averagePrice##',
					formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return I18n.t('filledStoploss')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##averagePrice##',
					formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
			return I18n.t('filledLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##averagePrice##',
					formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.TRAILINGSTOPLIMIT:
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
			const trailingValue =
				data.trailing_type === 'amount'
					? data.trailing_amount
					: data.trailing_percent;
			if (data.trailing_type === 'amount') {
				return I18n.t('filledTrailingAmountStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					)
					.replace(
						'##averagePrice##',
						formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
					);
			} else {
				return I18n.t('filledTrailingPercentStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					)
					.replace(
						'##averagePrice##',
						formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
					);
			}
		default:
			return '';
	}
}

export function getNotiContentCancelled(data, displayName) {
	const orderType = getOrderTypeNoti(data);
	const side = data.is_buy
		? `${I18n.t('buyUpper')}`
		: `${I18n.t('sellUpper')}`;
	let volume = data.volume || 0;
	const filledQuantity = data.filled_quantity || 0;
	const restVolume = volume - filledQuantity;
	const limitPrice = data.limit_price || 0;
	const stopPrice = data.stop_price || 0;
	if (filledQuantity) volume = restVolume;
	const type = orderType || (data.order_type + '').toUpperCase() || '';
	switch (type) {
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return I18n.t('filledMKT')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##averagePrice##',
					formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return I18n.t('filledM')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##averagePrice##',
					formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return I18n.t('cancelledStoploss')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
			return I18n.t('cancelledLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
			if (!data.stop_price) {
				// not trigger
				return I18n.t('cancelledStopLimitNotTrigger')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##limitPrice##',
						formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
					);
			} else {
				return I18n.t('cancelledStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##limitPrice##',
						formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					);
			}
		case OrderType.TRAILINGSTOPLIMIT:
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
			const trailingValue =
				data.trailing_type === 'amount'
					? data.trailing_amount
					: data.trailing_percent;
			if (data.trailing_type === 'amount') {
				return I18n.t('cancelledTrailingAmountStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					)
					.replace(
						'##averagePrice##',
						formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
					);
			} else {
				return I18n.t('cancelledTrailingPercentStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					)
					.replace(
						'##averagePrice##',
						formatNumberNew2(avgPrice, PRICE_DECIMAL.PRICE)
					);
			}
		default:
			return '';
	}
}

export function getNotiContentRejected(data, displayName) {
	const orderType = getOrderTypeNoti(data);
	const side = data.is_buy
		? `${I18n.t('buyUpper')}`
		: `${I18n.t('sellUpper')}`;
	let volume = data.volume || 0;
	const filledQuantity = data.filled_quantity || 0;
	const limitPrice = data.limit_price || 0;
	const stopPrice = data.stop_price || 0;
	const restVolume = volume - filledQuantity;
	if (filledQuantity) volume = restVolume;
	const type = orderType || (data.order_type + '').toUpperCase() || '';
	switch (type) {
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return I18n.t('rejectedMKT')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`);
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return I18n.t('rejectedM')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`);
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return '';
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
			return I18n.t('rejectedLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
			return I18n.t('rejectedStopLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.TRAILINGSTOPLIMIT:
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
			const trailingValue =
				data.trailing_type === 'amount'
					? data.trailing_amount
					: data.trailing_percent;
			if (data.trailing_type === 'amount') {
				return I18n.t('rejectedTrailingAmountStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					);
			} else {
				return I18n.t('rejectedTrailingPercentStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					);
			}
		default:
			return '';
	}
}

export function getNotiContentExpired(data, displayName) {
	const orderType = getOrderTypeNoti(data);
	const side = data.is_buy
		? `${I18n.t('buyUpper')}`
		: `${I18n.t('sellUpper')}`;
	let volume = data.volume || 0;
	const limitPrice = data.limit_price || 0;
	const filledQuantity = data.filled_quantity || 0;
	const stopPrice = data.stop_price || 0;
	const restVolume = volume - filledQuantity;
	if (filledQuantity) volume = restVolume;
	const type = orderType || (data.order_type + '').toUpperCase() || '';
	switch (type) {
		case OrderType.MARKETTOLIMIT:
		case OrderType.MARKETTOLIMIT_ORDER:
			return I18n.t('expiredMKT')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`);
		case OrderType.MARKET:
		case OrderType.MARKET_ORDER:
			return I18n.t('expiredM')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`);
		case OrderType.STOPLOSS:
		case OrderType.STOPLOSS_ORDER:
			return I18n.t('expiredStoploss')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.LIMIT:
		case OrderType.LIMIT_ORDER:
			return I18n.t('expiredLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.STOPLIMIT:
		case OrderType.STOPLIMIT_ORDER:
			return I18n.t('expiredStopLimit')
				.replace('##side##', `${side}`)
				.replace('##volume##', `${formatNumber(volume)}`)
				.replace('##symbol##', `${displayName}`)
				.replace(
					'##limitPrice##',
					formatNumberNew2(limitPrice, PRICE_DECIMAL.PRICE)
				)
				.replace(
					'##stopPrice##',
					formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
				);
		case OrderType.TRAILINGSTOPLIMIT:
		case OrderType.TRAILINGSTOPLIMIT_ORDER:
			const trailingValue =
				data.trailing_type === 'amount'
					? data.trailing_amount
					: data.trailing_percent;
			if (data.trailing_type === 'amount') {
				return I18n.t('expiredTrailingAmountStopLimit')
					.replace('##side##', `${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					);
			} else {
				return I18n.t('expiredTrailingPriceStopLimit')
					.replace('##side##', pen`${side}`)
					.replace('##volume##', `${formatNumber(volume)}`)
					.replace('##symbol##', `${displayName}`)
					.replace(
						'##filledQuantity##',
						`${formatNumber(filledQuantity)}`
					)
					.replace(
						'##filledPrice##',
						formatNumberNew2(filledPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##stopPrice##',
						formatNumberNew2(stopPrice, PRICE_DECIMAL.PRICE)
					)
					.replace(
						'##trailingValue##',
						`${formatNumber(trailingValue)}`
					);
			}
		default:
			return '';
	}
}

export function subcribleChannel() {
	const token = dataStorage.deviceTokenFcm;
	if (token) {
		// console.log('TOKEN: ', token);
		const userId = func.getUserId();
		const deviceId = dataStorage.deviceId;
		const url = api.getSubcribleChannelUrl();
		const obj = {
			user_id: userId,
			list_register: []
		};
		const devicetoken = {};
		devicetoken[deviceId] = token;
		obj.list_register.push(devicetoken);
		api.postData(url, { data: obj })
			.then(() => {
				// console.log('subcrible channel notification success with token', token)
			})
			.catch((error) => {
				logDevice(
					'info',
					`cannot subcrible notification error: ${error}`
				);
			});
	}
}

export function sendRequestSyncNoti(bodyData) {
	const userId = func.getUserId();
	// link to back-end recei request and handle push noti for all devices of this user
	const url = api.getRequestSyncNotiUrl(userId);
	api.postData(url, { data: bodyData })
		.then((param) => {})
		.catch((error) => {
			logDevice(
				'info',
				`cannot send request sync notification error: ${error}`
			);
		});
}

export function unRegisterReceiverNoti() {
	const deviceId = dataStorage.deviceId;
	const userId = func.getUserId();
	const url = `${api.getSubcribleChannelUrl()}/${userId}?device_id=${deviceId}`;
	api.deleteData(url)
		.then((param) => {})
		.catch((error) => {
			logDevice(
				'info',
				`cannot unregister receiver notification error: ${error}`
			);
		});
}

export function deleteAllNotiNews() {
	const key = `news`;
	AsyncStorage.getItem(key)
		.then((result) => {
			let notiStatus = {
				unread: 0,
				readOverview: false,
				listUnread: {}
			};
			const notiDefault = { ...notiStatus };
			if (result) notiStatus = JSON.parse(result);
			dataStorage.list_news_unread = {};
			if (
				notiStatus.unread === 0 &&
				!Object.keys(notiStatus.listUnread).length
			) {
				return;
			}
			const listUnread = notiStatus.listUnread;
			let listNewsUnread = [];
			Object.keys(listUnread).map((k) => {
				if (k && listUnread[k]) {
					listNewsUnread = Object.assign(
						listNewsUnread,
						listUnread[k]
					);
				}
			});
			Object.keys(listNewsUnread).map((n) => {
				// FCM.removeDeliveredNotification(n);
				// FCM.cancelLocalNotification(n);
			});
			notiStatus = notiDefault;
			AsyncStorage.setItem(key, JSON.stringify(notiStatus))
				.then(() => {
					// console.log('delete all news noti status success');
					const obj = {
						notiType: NotiType.NEWS,
						key,
						data: JSON.stringify(notiStatus)
					};
					sendRequestSyncNoti(obj);
					Controller.dispatch(
						newsActions.updateNotiStatus(notiStatus)
					);
				})
				.catch((error) => {
					// console.log('delete all news noti status failured', error);
				});
		})
		.catch((error) => {
			// console.log('get news noti status failured', error);
		});
}

export function getPriceMultiExchange(stringQuery, userType, cb) {
	const newTxt = Util.encodeSymbol(stringQuery);
	const encodeSplash = encodeURIComponent('/');
	const encodeHash = encodeURIComponent('#');
	const arrStringQuery = newTxt.split(',');
	const objStringQuery = {};
	const arrPromise = [];

	Object.keys(dataStorage.symbolEquity).map((e, i) => {
		const symbolOrigin = e;
		let symbol = symbolOrigin.replace(/\//g, encodeSplash); // replace / -> %2F
		symbol = symbol.replace(/#/g, encodeHash); // replace / -> %2F
		if (arrStringQuery.includes(symbol)) {
			const exchange = dataStorage.symbolEquity[e].exchanges[0];
			if (!objStringQuery.hasOwnProperty(exchange)) {
				objStringQuery[exchange] = [];
			}
			if (!objStringQuery[exchange].includes(symbol)) {
				objStringQuery[exchange].push(symbol);
			}
		}
	});
	Object.keys(objStringQuery).map((e, i) => {
		const query = `${e}/${objStringQuery[e].join(',')}`;
		const url = api.getApiUrl(userType, `level1/${query}`);
		arrPromise.push(
			new Promise((resolve, reject) => {
				const expireSymbol = [];
				const isContain = false;
				api.requestData(url)
					.then((bodyData) => {
						if (!bodyData) return resolve([]);
						resolve(bodyData);
					})
					.catch((error) => {
						logDevice(
							'info',
							`GET PRICE FROM URL: ${url} FAILED: ${error}`
						);
						resolve([]);
					});
			})
		);
	});
	Promise.all(arrPromise)
		.then((response) => {
			let listPrice = [];
			if (response && response.length) {
				for (let index = 0; index < response.length; index++) {
					const element = response[index];
					listPrice = [...listPrice, ...element];
				}
			}
			cb && cb(listPrice);
		})
		.catch((err) => {
			const response = {
				errorCode: err
			};
			cb && cb(response);
			logDevice('info', `GET PRICE MULTI EXCHANGE FALIED: ${err}`);
			logAndReport(`getPriceMultiExchange error: ${err}`);
		});
}

export function deleteNotiNewsByCode(symbol) {
	const key = `news`;
	AsyncStorage.getItem(key).then((result) => {
		let notiStatus = {
			unread: 0,
			readOverview: false,
			listUnread: {}
		};
		if (result) notiStatus = JSON.parse(result);
		let curSymbolNotiNumber = 0;
		const listUnread = notiStatus.listUnread;
		if (listUnread && listUnread[symbol]) {
			curSymbolNotiNumber = Object.keys(listUnread[symbol]).length;
			const listTemp = listUnread[symbol];
			Object.keys(listTemp).map((n) => {
				// FCM.removeDeliveredNotification(n);
				// FCM.cancelLocalNotification(n);
			});
			delete listUnread[symbol];
			if (parseInt(notiStatus.unread) >= curSymbolNotiNumber) {
				notiStatus.unread -= curSymbolNotiNumber;
			}
			notiStatus.listUnread = listUnread;
			dataStorage.list_news_unread = listUnread;
			AsyncStorage.setItem(key, JSON.stringify(notiStatus))
				.then(() => {
					// console.log('deleteNotiNewsByCode update success');
					const obj = {
						notiType: NotiType.NEWS,
						key,
						data: JSON.stringify(notiStatus),
						listDel: listTemp
					};
					sendRequestSyncNoti(obj);
					Controller.dispatch(
						newsActions.updateNotiStatus(notiStatus)
					);
				})
				.catch((error) => {
					// console.log('deleteNotiNewsByCode update failured', error);
				});
		}
	});
}

export function deleteNotiNewsById(newsId, symbol) {
	const key = `news`;
	AsyncStorage.getItem(key).then((result) => {
		let notiStatus = {
			unread: 0,
			readOverview: false,
			listUnread: {}
		};
		if (result) notiStatus = JSON.parse(result);
		const curSymbolNotiNumber = 0;
		let listUnreadSymbol = {};
		const listUnread = notiStatus.listUnread;
		if (listUnread && listUnread[symbol]) {
			listUnreadSymbol = listUnread[symbol];
			delete listUnreadSymbol[newsId];
			// FCM.removeDeliveredNotification(newsId);
			// FCM.cancelLocalNotification(newsId);
		}
		listUnread[symbol] = listUnreadSymbol;
		if (parseInt(notiStatus.unread) > 0) {
			notiStatus.unread -= 1;
		}
		notiStatus.listUnread = listUnread;
		dataStorage.list_news_unread = listUnread;
		const temp = {};
		temp[`${newsId}`] = true;
		AsyncStorage.setItem(key, JSON.stringify(notiStatus))
			.then(() => {
				// console.log('deleteNotiNewsById update success');
				const obj = {
					notiType: NotiType.NEWS,
					key,
					data: JSON.stringify(notiStatus),
					listDel: temp
				};
				sendRequestSyncNoti(obj);
				Controller.dispatch(newsActions.updateNotiStatus(notiStatus));
			})
			.catch((error) => {
				// console.log('deleteNotiNewsById update failured', error);
			});
	});
}

export function readOverviewNotiNew() {
	const key = `news`;
	AsyncStorage.getItem(key).then((result) => {
		let notiStatus = {
			unread: 0,
			readOverview: false,
			listUnread: {}
		};
		if (result) notiStatus = JSON.parse(result);
		if (notiStatus.readOverview) return;
		notiStatus.readOverview = true;
		AsyncStorage.setItem(key, JSON.stringify(notiStatus))
			.then(() => {
				// console.log('readOverviewNotiNew update success');
				const obj = {
					notiType: NotiType.NEWS,
					key,
					data: JSON.stringify(notiStatus)
				};
				sendRequestSyncNoti(obj);
				Controller.dispatch(newsActions.updateNotiStatus(notiStatus));
			})
			.catch((error) => {
				// console.log('readOverviewNotiNew update failured', error);
			});
	});
}

export function getNotiNewsStatus() {
	const key = `news`;
	AsyncStorage.getItem(key)
		.then((result) => {
			let notiStatus = {
				unread: 0,
				readOverview: false,
				listUnread: {}
			};
			if (result) notiStatus = JSON.parse(result);
			const listUnread = notiStatus.listUnread;
			let listNewsUnread = [];
			Object.keys(listUnread).map((k) => {
				if (k && listUnread[k]) {
					listNewsUnread = Object.assign(
						listNewsUnread,
						listUnread[k]
					);
				}
			});
			dataStorage.list_news_unread = listNewsUnread;
			Controller.dispatch(newsActions.updateNotiStatus(notiStatus));
		})
		.catch((err) => {
			logDevice('error', `GET NOTI NEWS STATUS - ERROR: ${err}`);
			// console.log(err)
		});
}

export function updateNewsNotiStatus(newsId, changeValue, symbol) {
	try {
		const key = `news`;
		AsyncStorage.getItem(key)
			.then((result) => {
				let notiStatus = {
					unread: 0,
					readOverview: false,
					listUnread: {}
				};
				if (result) {
					notiStatus = JSON.parse(result);
				}
				notiStatus.unread += changeValue;
				const listNewsUnreadSymbol =
					notiStatus.listUnread[symbol] || {};
				if (changeValue === 0) {
					notiStatus.readOverview = true;
				} else {
					notiStatus.readOverview = false;
				}
				listNewsUnreadSymbol[newsId] = true;
				notiStatus.listUnread[symbol] = listNewsUnreadSymbol;
				AsyncStorage.setItem(key, JSON.stringify(notiStatus))
					.then(() => {
						// console.log('updateNewsNotiStatus success');
						const listUnread = notiStatus.listUnread;
						let listNewsUnread = {};
						Object.keys(listUnread).map((k) => {
							if (k && listUnread[k]) {
								listNewsUnread = Object.assign(
									listNewsUnread,
									listUnread[k]
								);
							}
						});
						const obj = {
							notiType: NotiType.NEWS,
							key,
							data: JSON.stringify(notiStatus)
						};
						sendRequestSyncNoti(obj);
						dataStorage.list_news_unread = listNewsUnread;
						Controller.dispatch(
							newsActions.updateNotiStatus(notiStatus)
						);
					})
					.catch((error) => {
						// console.log('updateNewsNotiStatus 1 failured', error);
					});
			})
			.catch((error) => {
				// console.log('updateNewsNotiStatus 2 failured', error);
			});
	} catch (error) {
		// console.log('updateNewsNotiStatus 3 failured', error);
	}
}

export function getKeyOrder(data) {
	const state = data.order_state ? (data.order_state + '').toUpperCase() : '';
	switch (state) {
		case OrderState.FILLED:
			return 'filled';
		case OrderState.CANCELLED:
		case OrderState.CANCELED:
		case OrderState.REJECTED:
		case OrderState.EXPIRED:
			return 'cancelled';
		default:
			if (data.is_stoploss) {
				return 'stoploss';
			} else {
				return 'working';
			}
	}
}

export function syncNoti(obj) {
	const { notiType, type, key, data } = obj;
	if (notiType && key && data) {
		switch (notiType) {
			case NotiType.ORDER:
				break;
			case NotiType.NEWS:
				syncNotiNews(key, data);
				break;
		}
	}
}

export function syncRedDot(obj) {
	const { notiType, type, key, data, listDel } = obj;
	if (notiType && key && data) {
		switch (notiType) {
			case NotiType.ORDER:
				if ((key + '').includes(dataStorage.accountId)) {
					for (const id in listDel) {
						if (listDel.hasOwnProperty(id)) {
							fbemit.emit('orders_detail', `${id}`, false);
						}
					}
				}
				break;
			case NotiType.NEWS:
				for (const id in listDel) {
					if (listDel.hasOwnProperty(id)) {
						fbemit.emit('news_detail', `${id}`, true);
					}
				}
				break;
		}
	}
}

export function syncNotiNews(key, notiStatus) {
	AsyncStorage.getItem(key)
		.then((result) => {
			let curNotiStatus = {
				unread: 0,
				readOverview: false,
				listUnread: {}
			};
			if (result) curNotiStatus = JSON.parse(result);
			const curListUnread = curNotiStatus.listUnread;
			let curListNewsUnread = {};
			Object.keys(curListUnread).map((k) => {
				if (k && curListUnread[k]) {
					curListNewsUnread = Object.assign(
						curListNewsUnread,
						curListUnread[k]
					);
				}
			});
			AsyncStorage.setItem(key, notiStatus)
				.then(() => {
					// console.log('sync news noti status success');
					const data = JSON.parse(notiStatus);
					const listUnread = data.listUnread;
					let listNewsUnread = {};
					Object.keys(listUnread).map((k) => {
						if (k && listUnread[k]) {
							listNewsUnread = Object.assign(
								listNewsUnread,
								listUnread[k]
							);
						}
					});
					Object.keys(curListNewsUnread).map((n) => {
						if (!listNewsUnread[`${n}`]) {
							// FCM.removeDeliveredNotification(n);
							// FCM.cancelLocalNotification(n);
						}
					});
					dataStorage.list_news_unread = listNewsUnread;
					Controller.dispatch(newsActions.updateNotiStatus(data));
				})
				.catch((error) => {
					// console.log('sync set news noti status failured', error);
				});
		})
		.catch((error) => {
			// console.log('sync get news noti status failured', error);
		});
}

export function deleteNotiOrderByCode(type, symbol, accountId) {
	const key = `${type}_${accountId}`;
	AsyncStorage.getItem(key).then((result) => {
		let notiStatus = {
			unread: 0,
			readOverview: false,
			listUnread: {}
		};
		if (result) notiStatus = JSON.parse(result);
		let curSymbolNotiNumber = 0;
		const listUnread = notiStatus.listUnread;
		if (listUnread && listUnread[symbol]) {
			curSymbolNotiNumber = Object.keys(listUnread[symbol]).length;
			const listTemp = listUnread[symbol];
			Object.keys(listTemp).map((n) => {
				// FCM.removeDeliveredNotification(n);
				// FCM.cancelLocalNotification(n);
			});
			delete listUnread[symbol];
			if (parseInt(notiStatus.unread) >= curSymbolNotiNumber) {
				notiStatus.unread -= curSymbolNotiNumber;
			}
			notiStatus.listUnread = listUnread;
			dataStorage[`list_${type}_unread`] = listUnread;
			AsyncStorage.setItem(key, JSON.stringify(notiStatus))
				.then(() => {
					// console.log('deleteNotiOrderByCode update success');
					const obj = {
						notiType: NotiType.ORDER,
						type,
						key,
						data: JSON.stringify(notiStatus),
						listDel: listTemp
					};
					sendRequestSyncNoti(obj);
					delete notiStatus.listUnread;
					Controller.dispatch(
						ordersActions.updateNotiStatus(type, notiStatus)
					);
				})
				.catch((error) => {
					// console.log('deleteNotiOrderByCode update failured', error);
				});
		}
	});
}

export function saveItemInLocalStorage(
	key,
	obj,
	originalPin,
	successCallback,
	errorCallback
) {
	try {
		AsyncStorage.setItem(key, JSON.stringify(obj))
			.then(() => {
				// console.log('set item success');
				successCallback && successCallback(originalPin, obj);
			})
			.catch((error) => {
				// console.log('set item fail', error);
				logDevice('error', `SET - ITEM FAIL - ${error}`);
				errorCallback && errorCallback(error);
			});
	} catch (error) {
		logDevice('error', `SET - FATAL ERROR - ${error}`);
		errorCallback && errorCallback(error);
		// console.log('Set - Fatal error', error)
	}
}

export function getItemFromLocalStorage(
	email,
	objParam,
	token,
	errorCallback,
	successCallback
) {
	try {
		let key;
		if (objParam && objParam.email) {
			key = objParam.email.toLowerCase();
		} else {
			key = email || 'empty';
		}
		AsyncStorage.getItem(key)
			.then((result) => {
				if (result) {
					// console.log('get item success', JSON.parse(result))
					successCallback && successCallback(JSON.parse(result));
				} else {
					// console.log('get item null', result);
					errorCallback && errorCallback(objParam, token);
				}
			})
			.catch((error) => {
				// console.log('get item fail', error);
				logDevice('error', `SET - GET FAIL - ${error}`);
				errorCallback && errorCallback(objParam, token);
			});
	} catch (error) {
		logDevice('error', `GET - FATAL ERROR - ${error}`);
		// console.log('Get - Fatal error', error)
	}
}

export function clearAllItemFromLocalStorage() {
	try {
		AsyncStorage.clear()
			.then(() => console.log('clear all item success'))
			.catch((error) => console.log('clear all item fail', error));
	} catch (error) {
		// console.log('Clear all - Fatal error', error)
	}
}

export function removeItemFromLocalStorage(
	key,
	successCallback,
	errorCallback,
	params
) {
	try {
		AsyncStorage.removeItem(key)
			.then(() => {
				// console.log(`remove key: ${key} success`);
				successCallback && successCallback(params);
			})
			.catch((error) => {
				// console.log(`remove key: ${key} fail`, error)
				errorCallback && errorCallback();
			});
	} catch (error) {
		// console.log(`Remove key: ${key} - fatal error`, error)
	}
}

export function getPriceSelected(typePrice) {
	const obj = {};
	obj.type = '';
	obj.typeName = '';
	switch (typePrice) {
		case 'top20':
			obj.type = PriceDisplay.SP20;
			obj.typeName = ScreenId.TOP20;
			return obj;
		case 'top50':
			obj.type = PriceDisplay.SP50;
			obj.typeName = ScreenId.TOP50;
			return obj;
		case 'top100':
			obj.type = PriceDisplay.SP100;
			obj.typeName = ScreenId.TOP100;
			return obj;
		case 'top200':
			obj.type = PriceDisplay.SP200;
			obj.typeName = ScreenId.TOP200;
			return obj;
		case 'indices':
			obj.type = PriceDisplay.INDICES;
			obj.typeName = ScreenId.INDICIES;
			return obj;
		case 'nasdaq1':
			obj.type = PriceDisplay.NASDAQ1;
			obj.typeName = ScreenId.NASDAQ1;
			return obj;
		case 'nasdaq2':
			obj.type = PriceDisplay.NASDAQ2;
			obj.typeName = ScreenId.NASDAQ2;
			return obj;
		case 'nyse1':
			obj.type = PriceDisplay.NYSE1;
			obj.typeName = ScreenId.NYSE1;
			return obj;
		case 'nyse2':
			obj.type = PriceDisplay.NYSE2;
			obj.typeName = ScreenId.NYSE2;
			return obj;
		case 'nyse3':
			obj.type = PriceDisplay.NYSE3;
			obj.typeName = ScreenId.NYSE3;
			return obj;
		case 'nyse4':
			obj.type = PriceDisplay.NYSE4;
			obj.typeName = ScreenId.NYSE4;
			return obj;
		case 'nyse5':
			obj.type = PriceDisplay.NYSE5;
			obj.typeName = ScreenId.NYSE5;
			return obj;
		case 'xase':
			obj.type = PriceDisplay.XASE;
			obj.typeName = ScreenId.XASE;
			return obj;
		case 'arcx':
			obj.type = PriceDisplay.ARCX;
			obj.typeName = ScreenId.ARCX;
			return obj;
		default:
			obj.type = PriceDisplay.PERSONAL;
			obj.typeName = ScreenId.TRADE;
			return obj;
	}
}

export function setStyleNavigation(isConnected, navigation) {
	navigation.setStyle({
		navBarBackgroundColor: isConnected ? '#10a8b2' : '#C0C0C2'
	});
}

export function logDevice(type, message, data) {
	try {
		console.log({ message, type });
		// log - debug - info - error - fatal - success
		if (config.isDetoxTest === false) {
			sendToRocketChat(message, type);
		}
	} catch (error) {
		// try {
		// } catch (error1) {
		//   console.warn(error1);
		// }
	}
}
export function backUpLogDevice(type, message, data) {
	try {
		// log - debug - info - error - fatal - success
		if (config.isDetoxTest === false) {
			console.info('DCM send', message, type);
			sendToRocketChatBackUp(message, type);
		}
	} catch (error) {
		// try {
		// } catch (error1) {
		//   console.warn(error1);
		// }
	}
}
export function getUniqueList(arr, field) {
	try {
		if (!arr) return [];
		const flags = [];
		const output = [];
		for (let i = 0; i < arr.length; i++) {
			if (!arr[i][field]) {
				output.push(arr[i]);
				continue;
			}
			if (flags[arr[i][field]]) continue;
			flags[arr[i][field]] = true;
			output.push(arr[i]);
		}
		return output;
	} catch (error) {
		// console.log('getUniqueList func logAndReport exception: ', error)
	}
}

export function checkPropsStateShouldUpdate(
	nextProps,
	nextState,
	listProps,
	listState,
	curProps,
	curState
) {
	try {
		for (let i = 0; i < listProps.length; i++) {
			const item = listProps[i];
			if (typeof item === 'string') {
				if (!_.isEqual(nextProps[item], curProps[item])) {
					return true;
				}
			} else {
				const key1 = Object.keys(item).pop();
				const listData = item[key1];
				for (let j = 0; j < listData.length; j++) {
					const item1 = listData[j];
					if (
						!_.isEqual(
							nextProps[key1][item1],
							curProps[key1][item1]
						)
					) {
						return true;
					}
				}
			}
		}
		for (let i = 0; i < listState.length; i++) {
			const item2 = listState[i];
			if (typeof item2 === 'string') {
				if (!_.isEqual(nextState[item2], curState[item2])) {
					return true;
				}
			} else {
				const key2 = Object.keys(item2).pop();
				const listData1 = item2[key2];
				for (let j = 0; j < listData1.length; j++) {
					const item3 = listData1[j];
					if (
						!_.isEqual(
							nextState[key2][item3],
							curState[key2][item3]
						)
					) {
						return true;
					}
				}
			}
		}
		return false;
	} catch (error) {
		// console.log(error);
	}
}
export function convertFirebaseLog(content) {
	const newContent =
		content !== null && typeof content === 'object'
			? JSON.stringify(content)
			: content;
}
export function logFirebase(content) {
	try {
		convertFirebaseLog(content);
		return;
	} catch (error) {
		console.log('error: ', error);
	}
}

export function logFirebaseError(content) {
	try {
		convertFirebaseLog(content);
		return;
	} catch (error) {
		console.log('error: ', error);
	}
}

export function logAndReport(message, error, functionName) {
	try {
		const store = Controller.getGlobalState();
		const isConnected = store.app.isConnected;
		// console.log('log and report error - message - functionName', `${error}-${message}-${functionName}`)
		if (isConnected) {
			log(message);
			report(error, functionName);
		}
	} catch (error1) {
		// console.log(error1);
		logDevice('info', `message: ${error}`);
	}
}

export function log(message) {
	try {
		let msg = message;
		if (typeof message === 'object') {
			msg = JSON.stringify(message);
		}
		// firebase.crash().log(msg);
	} catch (error) {
		// console.log(error);
	}
}

export function report(error = {}, functionName = '') {
	try {
		const abc = error;
		if (typeof abc === 'object') {
			abc['code'] = functionName;
		}
		const msg = typeof abc === 'object' ? JSON.stringify(abc) : abc;
		// firebase.crashlytics().recordError(123, msg);
	} catch (error1) {
		// console.log(error1);
	}
}

export function getPriceSource(priceType) {
	const userId = func.getUserId();
	const type = func.getUserPriceSource();
	if (
		config.dataConnect === 'firebase' ||
		(!priceType.startsWith('trades') &&
			!priceType.startsWith('depth') &&
			!priceType.startsWith('price'))
	) {
		switch (type) {
			case userType.ClickToRefresh:
				return `price_snapshot/${userId}/${priceType}`;
			case userType.Delay:
				return `price_delay/${priceType}`;
			case userType.Streaming:
				return priceType;
			default:
				return 'Not_Support';
		}
	} else {
		switch (type) {
			case userType.ClickToRefresh:
				if (
					priceType.startsWith('price_equity') ||
					priceType.startsWith('price_index')
				) {
					return `snapshot/level1`;
				}
				if (priceType.startsWith('depth_levels')) {
					return `snapshot/level2`;
				}
				if (priceType.startsWith('trades')) {
					return `snapshot/cos`;
				}
				return 'Not_Support';
			case userType.Delay:
				if (
					priceType.startsWith('price_equity') ||
					priceType.startsWith('price_index')
				) {
					return `delayed/level1`;
				}
				if (priceType.startsWith('depth_levels')) {
					return `delayed/level2`;
				}
				if (priceType.startsWith('trades')) {
					return `delayed/cos`;
				}
				return 'Not_Support';
			case userType.Streaming:
				if (
					priceType.startsWith('price_equity') ||
					priceType.startsWith('price_index')
				) {
					return `streaming/level1`;
				}
				if (priceType.startsWith('depth_levels')) {
					return `streaming/level2`;
				}
				if (priceType.startsWith('trades')) {
					return `streaming/cos`;
				}
				return 'Not_Support';
			default:
				return 'Not_Support';
		}
	}
}

export function getShortcutName(fullName) {
	if (!fullName || fullName === undefined) return '';
	fullName = fullName.replace(/\s\s+/g, ' ');
	const listName = fullName.split(' ');
	let name = '';
	const tmp = listName[0] ? (listName[0] + '').toLowerCase() : '';
	if (tmp.includes('mr') || tmp.includes('mrs') || tmp.includes('ms')) {
		listName.splice(0, 1);
	}
	if (listName.length > 1) {
		const firstName = listName[0].charAt(0).toUpperCase();
		let lastName = listName[listName.length - 1].charAt(0).toUpperCase();
		if (!lastName.match(/[A-Za-z]/)) {
			lastName = '';
		}
		name = firstName.concat(lastName);
	} else {
		name = listName[0].charAt(0).toUpperCase();
	}
	return name;
}

export function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return (
		s4() +
		s4() +
		'-' +
		s4() +
		'-' +
		s4() +
		'-' +
		s4() +
		'-' +
		s4() +
		s4() +
		s4()
	);
}

export function removeProperty(objectData, propertyName) {
	if (Array.isArray(propertyName)) {
		for (var i = 0; i < propertyName.length; i++) {
			var item = propertyName[i];
			if (objectData.hasOwnProperty(item)) {
				delete objectData[item];
			}
		}
	} else if (objectData.hasOwnProperty(propertyName)) {
		delete objectData[propertyName];
	}
	return objectData;
}
export function checkNumber(numberOne, isCheckDecimal) {
	//    let stringNumber = number.toString();
	const stringNumber = numberOne;
	const curVal = stringNumber.split('.');
	let status = 'OK';
	if (typeof curVal[1] !== 'undefined' && curVal[1].length > 4) {
		status = 'ErrorWithDecimal';
	}
	if (curVal[0].length > 15) {
		status = 'ErrorWithMaximum';
	}
	if (isCheckDecimal) {
		if (stringNumber.indexOf('.') !== -1) {
			status = 'isDecimal';
		}
	}
	return status;
}

// export function operator(numberOne, numberTwo, operator) {   try {     if
// (numberOne === null || numberOne === '') return numberTwo;     if (numberTwo
// === null || numberTwo === '') return numberOne;     if (typeof numberOne ===
// 'string') numberOne = convertFormatToNumber(numberOne);     if (typeof
// numberTwo === 'string') numberTwo = convertFormatToNumber(numberTwo);     var
// n1 = new Big(numberOne.toString());     var n2 = new
// Big(numberTwo.toString());     if (n1 === null) {       return n2;     } if
// (n2 === null) {       return n1;     }     if (operator === '+')     { return
// n1.plus(n2).toString(); }     else if (operator === '-') { return
// n1.minus(n2).toString();     } else if (operator === '*')     { return
// n1.times(n2).toString(); }     else if (operator === '/')     { return
// n1.div(n2).toString(); }     else if (operator === '%')     { return
// numberOne % numberTwo; }     else     { return 0; }     // if (numberOne ==
// null) return numberTwo;     // if (numberTwo == null) return numberOne; // if
// (typeof numberOne === "string") numberOne = convertFormatToNumber(numberOne);
//     // if (typeof numberTwo === "string") numberTwo =
// convertFormatToNumber(numberTwo);     // if (operator === "+") //     return
// numberOne+numberTwo;     // else if (operator === "-")     // return
// numberOne-numberTwo;     // else if (operator === "*")     // return
// numberOne*numberTwo;     // else if (operator === "/")     // return
// numberOne/numberTwo;     // else if (operator === "%")     // return
// numberOne%numberTwo;     // else     //     return 0;   } catch (e) {
// console.error(e);   }   return 0; }
export function formatNumberNew2ClearZero(input, decimal) {
	try {
		if (input === null || isNaN(input) || input === undefined) {
			return '--';
		}
		if (parseFloat(input) === 0 || input === '') {
			return '0';
		}
		if (decimal == null) {
			if (parseFloat(input) >= 2) {
				input = roundFloat(input, 2);
				decimal = 2;
			} else {
				input = roundFloat(input, 3);
				decimal = 3;
			}
		} else {
			input = roundFloat(input, decimal);
		}
		input = input.toString().split('.');
		input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		const inputJoin = input.join('.');
		const changefixedString = changeFixed(inputJoin);
		return clearZero(changefixedString, decimal);
	} catch (ex) {
		console.error(ex);
	}
}

// export function showPrompt(userType) {
//     if (dataStorage.isShowNoAccount && dataStorage.isNotHaveAccount) {
//         // this.noAccount && this.noAccount.showModal();
//         dataStorage.isShowNoAccount = false;
//     } else if (userType === loginUserType.REVIEW) {
//         // this.reviewPrompt.showModal();
//         dataStorage.isShowReviewAccount = false;
//     } else if (userType === loginUserType.LOCKED) {
//         // lockPrompt.showModal();
//         dataStorage.isShowLockAccount = false;
//     }
// }

export function formatNumber(input, decimal) {
	try {
		if (input == null) {
			return input;
		}
		if (input === '') {
			input = '0';
		}
		if (isNaN(input)) {
			return input;
		}
		if (typeof input === 'string') {
			input = convertFormatToNumber(input);
		}
		if (decimal == null) {
			if (input <= 2) {
				decimal = 3;
			} else decimal = 2;
		} // TODO hash code fix decimal = 0
		if (typeof decimal !== 'undefined') {
			input = roundFloat(input, decimal);
		}
		input = input.toString().split('.');
		input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		return changeFixed(input.join('.'));
	} catch (ex) {
		console.error(ex);
	}
	return changeFixed(input);
}
export function roundFn(numberFloat, length) {
	try {
		if (numberFloat == null || length == null) {
			return 0;
		}
		let numberString = numberFloat + '';
		if (numberString.includes('e')) {
			return numberFloat;
		}
		let arrNumber = numberString.split('.');
		if (!arrNumber[1]) return numberFloat;
		for (let i = 0; i < length; i++) {
			if (arrNumber[1][0]) {
				arrNumber[0] += arrNumber[1][0];
				arrNumber[1] = arrNumber[1].substring(1);
			} else {
				arrNumber[0] += '0';
			}
		}
		numberString = arrNumber.join('.');
		arrNumber = Math.round(numberString).toString();
		arrNumber = arrNumber.replace(/^(-?)/, '$1' + '0'.repeat(length));
		let result = 0;
		if (length > 0) {
			result = parseFloat(
				arrNumber.substring(0, arrNumber.length - length) +
					'.' +
					arrNumber.substring(arrNumber.length - length)
			);
		} else {
			result = arrNumber;
		}
		return Number(result);
	} catch (e) {
		logger.error(e);
	}
	return 0;
}
export function formatNumberPrice(input, decimal) {
	try {
		if (input === null || input === '' || input === undefined) {
			return '--';
		}
		if ((input + '').includes('e')) {
			if ((input + '').includes('e-')) input = input.toFixed(10);
			else return input;
		}
		let fill;
		if (typeof decimal !== 'undefined') {
			const inputRound = roundFn(input, decimal);
			if (input !== inputRound) {
				input = inputRound;
				fill = true;
			}
		}
		input = input.toString().split('.');
		// input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		if (decimal && fill) {
			if (!input[1]) input[1] = '0'.repeat(decimal);
			else input[1] += '0'.repeat(decimal - input[1].length);
		}
		return input.join('.');
	} catch (ex) {
		logger.error(ex);
	}
	return '--';
}

export function formatNumberNew(input, decimal) {
	try {
		if (input === null || isNaN(input) || input === undefined) {
			return '0.00';
		}
		if (parseFloat(input) === 0 || input === '') {
			if (decimal === null || decimal === 2) {
				return '0.00';
			}
			return '0.000';
		}
		if (decimal == null) {
			if (parseFloat(input) >= 2) {
				input = roundFloat(input, 2);
			} else {
				input = roundFloat(input, 3);
			}
		} else {
			input = roundFloat(input, decimal);
		}
		input = input.toString().split('.');
		input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		return input.join('.');
	} catch (ex) {
		console.error(ex);
	}
}
export function formatNumberNew4(
	input,
	decimal,
	currency,
	isShowCommna = true,
	isShowDecimalWhenDecimalZero = true
) {
	try {
		if (input === null || isNaN(input) || input === undefined) {
			if (!isShowDecimalWhenDecimalZero) return '0';
			if (decimal === null || decimal === 2) {
				return '0.00';
			}
			if (decimal === 0) {
				return '0';
			}
			if (decimal === 1) {
				return '0';
			}
			if (decimal === 4) {
				return '0.0000';
			}
			if (decimal === 5) {
				return '0.00000';
			}
			if (decimal === 6) {
				return '0.000000';
			}
			if (decimal === 7) {
				return '0.0000000';
			}
			return '0.000';
		}
		// Không format với specific decimal
		if (decimal === -1) {
			return input;
		}
		if (
			parseInt(input) === parseFloat(input) &&
			currency &&
			currency.toUpperCase().includes('VND')
		) {
			decimal = 0;
		}
		if (parseFloat(input) === 0 || input === '') {
			if (!isShowDecimalWhenDecimalZero) return '0';
			if (decimal === null || decimal === 2) {
				return '0.00';
			}
			if (decimal === 0) {
				return '0';
			}
			if (decimal === 1) {
				return '0';
			}
			if (decimal === 3) {
				return '0.000';
			}
			if (decimal === 4) {
				return '0.0000';
			}
			if (decimal === 5) {
				return '0.00000';
			}
			if (decimal === 6) {
				return '0.000000';
			}
			if (decimal === 7) {
				return '0.0000000';
			}
			return '0.000';
		}
		if (decimal == null) {
			if (parseFloat(input) >= 2) {
				input = roundFloat(input, 2);
			} else {
				input = roundFloat(input, 3);
			}
		} else {
			input =
				decimal === 1
					? parseFloat(roundFloat(input, decimal))
					: roundFloat(input, decimal); // decimal 1 thi 5.0 ->5 5.5 ->5.5. Cac decimal khac giu nguyen logic
		}
		input = input.toString().split('.');
		if (isShowCommna) {
			input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		}
		return isShowDecimalWhenDecimalZero
			? input.join('.')
			: parseFloat(input.join('.')).toString();
	} catch (ex) {
		console.error(ex);
	}
}
export function formatNumberNew3(
	input,
	decimal,
	currency,
	isShowCommna = true
) {
	try {
		if (input === null || isNaN(input) || input === undefined) {
			if (decimal === null || decimal === 2) {
				return '0.00';
			}
			if (decimal === 0) {
				return '0';
			}
			if (decimal === 1) {
				return '0.0';
			}
			if (decimal === 4) {
				return '0.0000';
			}
			if (decimal === 5) {
				return '0.00000';
			}
			if (decimal === 6) {
				return '0.000000';
			}
			if (decimal === 7) {
				return '0.0000000';
			}
			return '0.000';
		}
		// Không format với specific decimal
		if (decimal === -1) {
			return input;
		}
		if (
			parseInt(input) === parseFloat(input) &&
			currency &&
			currency.toUpperCase().includes('VND')
		) {
			decimal = 0;
		}
		if (parseFloat(input) === 0 || input === '') {
			if (decimal === null || decimal === 2) {
				return '0.00';
			}
			if (decimal === 0) {
				return '0';
			}
			if (decimal === 1) {
				return '0.0';
			}
			if (decimal === 4) {
				return '0.0000';
			}
			if (decimal === 5) {
				return '0.00000';
			}
			if (decimal === 6) {
				return '0.000000';
			}
			if (decimal === 7) {
				return '0.0000000';
			}
			return '0.000';
		}
		if (decimal == null) {
			if (parseFloat(input) >= 2) {
				input = roundFloat(input, 2);
			} else {
				input = roundFloat(input, 3);
			}
		} else {
			input = roundFloat(input, decimal);
		}
		input = input.toString().split('.');
		if (isShowCommna) {
			input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		}
		return input.join('.');
	} catch (ex) {
		console.error(ex);
	}
}
export function roundOffFloat({ input, step }) {
	return Math.round(input / step) * step;
}
export function formatNumberNew2(
	input,
	decimal,
	currency,
	isShowCommna = true
) {
	try {
		if (input === null || isNaN(input) || input === undefined) {
			return '--';
		}
		// Không format với specific decimal
		if (decimal === -1) {
			return input;
		}
		if (
			parseInt(input) === parseFloat(input) &&
			currency &&
			currency.toUpperCase().includes('VND')
		) {
			decimal = 0;
		}
		if (parseFloat(input) === 0 || input === '') {
			if (decimal === null || decimal === 2) {
				return '0.00';
			}
			if (decimal === 0) {
				return '0';
			}
			if (decimal === 1) {
				return '0.0';
			}
			if (decimal === 4) {
				return '0.0000';
			}
			if (decimal === 5) {
				return '0.00000';
			}
			if (decimal === 6) {
				return '0.000000';
			}
			if (decimal === 7) {
				return '0.0000000';
			}
			return '0.000';
		}
		if (decimal == null) {
			if (parseFloat(input) >= 2) {
				input = roundFloat(input, 2);
			} else {
				input = roundFloat(input, 3);
			}
		} else {
			input = roundFloat(input, decimal);
		}
		input = input.toString().split('.');
		if (isShowCommna) {
			input[0] = input[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
		}
		return input.join('.');
	} catch (ex) {
		console.error(ex);
	}
}

export function clearZero(strInput, decimal) {
	let numRemove = 0;
	const strInputLength = strInput.length;
	const lastCharacter = strInput.charAt(strInputLength - 1);
	const preLastCharacter = strInput.charAt(strInputLength - 2);
	const indexOfDot = strInput.indexOf('.');
	if (lastCharacter === '0' && indexOfDot > -1) {
		numRemove = 1;
		for (let d = 0; d < decimal; d++) {
			const remove = strInput.charAt(strInputLength - d - 2);
			if (remove === '0') {
				numRemove++;
			} else {
				break;
			}
		}
	}
	if (numRemove > 0) {
		return strInput.slice(0, strInput.length - numRemove);
	}
	return strInput;
}
export function changeFixed(strInput) {
	try {
		if (strInput == null) {
			return strInput;
		}
		if (!isNaN(strInput)) {
			strInput = strInput.toString();
		}
		if (isNullOrEmpty(strInput)) {
			return '';
		}
		if (strInput.endsWith('.000000')) {
			return strInput.replace('.000000', '');
		}
		if (strInput.endsWith('.000000)')) {
			return strInput.replace('.000000', ')');
		}
		if (strInput.endsWith('.00000')) {
			return strInput.replace('.00000', '');
		}
		if (strInput.endsWith('.00000)')) {
			return strInput.replace('.00000', ')');
		}
		if (strInput.endsWith('.0000')) {
			return strInput.replace('.0000', '');
		}
		if (strInput.endsWith('.0000)')) {
			return strInput.replace('.0000', ')');
		}
		if (strInput.endsWith('.000')) {
			return strInput.replace('.000', '');
		}
		if (strInput.endsWith('.000)')) {
			return strInput.replace('.000', ')');
		}
		if (strInput.endsWith('.00')) {
			return strInput.replace('.00', '');
		}
		if (strInput.endsWith('.00)')) {
			return strInput.replace('.00', ')');
		}
		if (strInput.endsWith('.0')) {
			return strInput.replace('.0', '');
		}
		if (strInput.endsWith('.0)')) {
			return strInput.replace('.0', ')');
		}
		return strInput;
	} catch (ee) {
		console.error(ee);
	}
	return strInput;
}

// tuong tu voi ham List.FindAll cua C# tra ve tat ca cac ban ghi co cung tham
// so truyen vao
export function findAll(list, callback, uniqueParam) {
	const matches = [];
	const dic = {};
	try {
		if (list == null) {
			return matches;
		}
		if (Array.isArray(list)) {
			let i = 0;
			const length = list.length;
			// Go through the array, only saving the items that pass the validator function
			for (; i < length; i++) {
				try {
					if (callback == null || callback(list[i])) {
						if (uniqueParam && list[i][uniqueParam]) {
							if (dic[list[i][uniqueParam]]) {
								continue;
							} else {
								matches.push(list[i]);
								dic[list[i][uniqueParam]] = true;
							}
						} else {
							matches.push(list[i]);
						}
					}
				} catch (e) {
					console.error(e);
				}
			}
		} else {
			for (const key in list) {
				try {
					if (callback == null || callback(list[key])) {
						if (uniqueParam && list[key][uniqueParam]) {
							if (dic[list[key][uniqueParam]]) {
								continue;
							} else {
								matches.push(list[key]);
								dic[list[key][uniqueParam]] = true;
							}
						} else {
							matches.push(list[key]);
						}
					}
				} catch (e) {
					console.error(e);
				}
			}
		}
	} catch (ex) {
		console.error(ex);
	}
	return matches;
}
// export function getPriceStep(marketPrice, currentPrice) {
//   let priceReturn = currentPrice || 0;
//   if (marketPrice >= 0 && marketPrice < 10) {
//     priceReturn = marketPrice +
//   }
// }

export function toString(input) {
	// do dac diem cua javascript hieu lung tung giua bien string va float nen dung
	// ham nay se chac chan chuyen ve string
	if (!isNaN(input)) {
		return input.toString();
	} // Neu la so chuyen qua kieu string
	return input; // kieu string roi thi cu the return thoi
}

export function roundFloat(numberFloat, length) {
	try {
		if (typeof numberFloat === 'string') {
			try {
				numberFloat = parseFloat(numberFloat);
			} catch (error) {
				logDevice('error', 'can not parse value: ' + numberFloat);
			}
		}
		if (numberFloat == null || length == null) {
			return 0;
		}
		let itenDivison = '1';
		for (let i = 0; i < length; i++) {
			itenDivison += '0';
		}
		const division = Number(itenDivison);
		return (Math.round(numberFloat * division) / division).toFixed(length);
	} catch (e) {
		console.error(e);
	}
	return 0;
}

// tuong tu voi ham List.FirstOrDefault cua C# tra ve ban ghi dau tien hoac null
// neu ko ton tai
export function firstOrDefault(list, callback) {
	try {
		if (list == null || list.length === 0) {
			return null;
		}
		if (Array.isArray(list)) {
			let i = 0;
			const length = list.length;
			// Go through the array, only saving the items that pass the validator function
			for (; i < length; i++) {
				try {
					if (callback(list[i])) {
						return list[i];
					}
				} catch (e) {
					console.error(e);
				}
			}
		} else {
			for (const key in list) {
				try {
					if (callback(list[key])) {
						return list[key];
					}
				} catch (e) {
					console.error(e);
				}
			}
		}
	} catch (ex) {
		console.error(ex);
	}
	return null;
}

// ghi nhan 1 ban ghi duy nhat
export function getDistinctList(arr, uniqueParam) {
	if (arr == null || arr.length <= 0) {
		return arr;
	}
	if (!uniqueParam) {
		return arr;
	}
	const dic = {};
	const list = [];
	let item;
	for (let i = 0; i < arr.length; i++) {
		item = arr[i];
		if (item[uniqueParam]) {
			if (dic[item[uniqueParam]]) {
				continue;
			} else {
				list.push(item);
				dic[item[uniqueParam]] = true;
			}
		}
	}
	return list;
}

export function convertFormatToNumber(stringNumberInput) {
	if (isNullOrEmpty(stringNumberInput)) {
		return stringNumberInput;
	}

	let stringNumber = stringNumberInput;

	if (typeof stringNumberInput !== 'string') {
		stringNumber = stringNumberInput.toString();
	}

	stringNumber = stringNumber.replace('$', '');
	stringNumber = stringNumber.replace('%', '');
	// le.bui dung dai ka nao xoa ham nay cua e di nha :(
	try {
		if (isNullOrEmpty(stringNumber)) {
			return 0;
		}
		if (isNaN(stringNumber)) {
			if (typeof stringNumber !== 'string') {
				stringNumber = stringNumber.toString();
			}
			var stringNumberTemp = stringNumber.replace(/,/gi, '');
			if (isNaN(stringNumberTemp)) {
				stringNumberTemp = stringNumberTemp.replace(/\(/gi, ''); // truong hop nay khi string duoc format thanh dang () se la so am nen se cong them dau -
				stringNumberTemp = stringNumberTemp.replace(/\)/gi, '');
				stringNumberTemp = '-' + stringNumberTemp;
				return parseFloat(stringNumberTemp);
			}
			return parseFloat(stringNumberTemp);
		}
		return parseFloat(stringNumber);
	} catch (e) {
		console.error(e);
	}
	return 0;
}

export function convertFormatToNumberTemp(stringNumberInput) {
	if (isNullOrEmpty(stringNumberInput)) {
		return 0;
	}

	let stringNumber = stringNumberInput;

	if (typeof stringNumberInput !== 'string') {
		stringNumber = stringNumberInput.toString();
	}

	stringNumber = stringNumber.replace('$', '');
	stringNumber = stringNumber.replace('%', '');
	// le.bui dung dai ka nao xoa ham nay cua e di nha :(
	try {
		if (isNullOrEmpty(stringNumber)) {
			return 0;
		}
		if (isNaN(stringNumber)) {
			if (typeof stringNumber !== 'string') {
				stringNumber = stringNumber.toString();
			}
			var stringNumberTemp = stringNumber.replace(/,/gi, '');
			if (isNaN(stringNumberTemp)) {
				stringNumberTemp = stringNumberTemp.replace(/\(/gi, ''); // truong hop nay khi string duoc format thanh dang () se la so am nen se cong them dau -
				stringNumberTemp = stringNumberTemp.replace(/\)/gi, '');
				stringNumberTemp = '-' + stringNumberTemp;
				return parseFloat(stringNumberTemp);
			}
			return parseFloat(stringNumberTemp);
		}
		return parseFloat(stringNumber);
	} catch (e) {
		console.error(e);
	}
	return 0;
}

// // tra ve object sau khi da clone export function clone(objData) {   if
// (objData == null) return objData;   return _.clone(objData); } tra ve object
// sau khi da clone
export function cloneNewAddressMemory(objData) {
	if (objData == null) {
		return objData;
	}
	const stringJson = JSON.stringify(objData);
	return JSON.parse(stringJson);
}

// merge du lieu cua 2 list vao list dau tien
export function mergeList(first, second) {
	try {
		const len = second.length;
		let j = 0;
		let i = first.length;
		for (; j < len; j++) {
			first[i++] = second[j];
		}
		first.length = i;
	} catch (e) {
		console.error(e);
	}
	return first;
}
export function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	// console.log('color: ', color)
	return color;
}
// merge du lieu cua doi tuong options vao defaults, neu ton tai property bi
// trung thi se lay gia tri cua options export   function merge(defaults,
// options) {   try {     return _.extend({}, defaults, options);   } catch (e)
// {     console.error(e);   }   return defaults; } get json Object key
export function getKey(objKey) {
	return this.getJsonMsg(objKey);
}

// get Json Msg
export function getJsonMsg(objKey) {
	return JSON.stringify(objKey);
}

export function getStompUrl(arr) {
	if (Array.isArray(arr)) {
		const len = arr.length;
		if (len <= 0) {
			return null;
		}
		if (len === 1) {
			return arr[0];
		}
		return arr[Math.floor(Math.random() * len)];
	} else {
		return arr;
	}
}

export function replaceComma(str) {
	str = str.replace('<sub>', '');
	str = str.replace('</sub>', '');
	str = str.replace('<sup>', '');
	str = str.replace('</sup>', '');
	if (str[str.length - 1] === ',') {
		str = str.substring(0, str.length - 1);
		str += '\r\n';
	}
	return str;
}

// export   function fromNetworkMessage(jsonMessage) {   if
// (!_.isNull(jsonMessage) && !_.isUndefined(jsonMessage) && jsonMessage !== '')
// {     const msg = formatExt(jsonMessage);     let message = JSON &&
// JSON.parse(msg);     if (message == null) {       message = eval('(' + msg +
// ')');     }     return message;   }   return null; }

export function getJsonObject(obj) {
	if (obj == null || obj === '') {
		return null;
	}
	return JSON && JSON.parse(obj);
}

export function toNetworkMessage(obj) {
	const json = JSON.stringify(obj);
	const msg = formatExt(json);
	return msg;
}

export function formatExt(msg) {
	if (byPass) {
		return msg;
	}
	if (dicKey == null) {
		dicKey = {};
		const list =
			'{$type:QuanEdg.MsRqSikrGmo, V=10ClPbcKTWDvL[NIfAh\\F3B25-78w}94OH6UZXY_()/J]x@j&' +
			"z#%+;!*?'";
		const len = list.length;
		for (let i = 0; i < len; i++) {
			const ctx = list.charCodeAt(i);
			if (dicKey[ctx]) {
				continue;
			}
			const chx = list[len - i - 1];
			dicKey[ctx] = chx;
			if (dicKey[chx.charCodeAt(0)]) {
				continue;
			}
			dicKey[chx.charCodeAt(0)] = list[i];
		}
	}
	let str = '';
	const len = msg.length;
	for (let i = 0; i < len; i++) {
		if (dicKey[msg.charCodeAt(i)]) {
			str += dicKey[msg.charCodeAt(i)];
		} else {
			str += msg[i];
		}
	}
	return str;
}

export function isNullOrEmpty(data) {
	if (_.isNull(data)) {
		return true;
	}
	if (data === undefined) {
		return true;
	}
	let output = data;
	if (typeof output === 'string') {
	} else {
		output = output.toString();
	}
	output = output.trim();

	return output.length <= 0;
}

export function StringFormat(format, args) {
	// / <summary>Replaces the format items in a specified String with the text
	// equivalents of the values of   corresponding object instances. The invariant
	// culture will be used to format dates and numbers.</summary> / <param
	// name='format' type='String'>A format string.</param> / <param name='args'
	// parameterArray='true' mayBeNull='true'>The objects to format.</param> /
	// <returns type='String'>A copy of format in which the format items have been
	// replaced by the   string equivalent of the corresponding instances of object
	// arguments.</returns>
	try {
		var value = format;
		var i;
		if (args instanceof Array) {
			for (i = 0; i < args.length; i++) {
				value = value.replace(
					new RegExp('\\{' + i + '\\}', 'gm'),
					args[i]
				);
			}
			return value;
		}
		if (
			arguments == null ||
			arguments.length == null ||
			arguments.length <= 0
		) {
			return null;
		}
		for (i = 0; i < arguments.length - 1; i++) {
			value = value.replace(
				new RegExp('\\{' + i + '\\}', 'gm'),
				arguments[i + 1]
			);
		}
		return value;
	} catch (ex) {
		console.error(ex);
	}
	return null;
}

export function getRealtimeKey(type) {
	try {
		if (type == null || typeof type !== 'string' || type.length <= 0) {
			return null;
		}
		// exp: QuantEdge.Entity.Entities.Brand, Entity, Version=1.0.0.0,
		// Culture=neutral, PublicKeyToken=null
		var val = type.replace('Version=1.0.0.0, ', ''); // clean '.' char
		// after: QuantEdge.Entity.Entities.Brand, Entity, Culture=neutral, PublicKeyToken=null
		var start = val.lastIndexOf('.') + 1;
		var end = val.indexOf(',');
		// get Entity name = Brand (from last '.' to first ',')
		var entityName = val.substring(start, end);
		return entityName;
	} catch (e) {
		console.error(e);
	}
	return null;
}

export function gcdMoreThanTwoNumbers(input) {
	if (toString.call(input) !== '[object Array]') {
		return false;
	}
	var len, a, b;
	len = input.length;
	if (!len) {
		return null;
	}
	a = input[0];
	for (var i = 1; i < len; i++) {
		b = input[i];
		a = gcdTwoNumbers(a, b);
	}
	return a;
}

export function gcdTwoNumbers(x, y) {
	if (typeof x !== 'number' || typeof y !== 'number') {
		return false;
	}
	x = Math.abs(x);
	y = Math.abs(y);
	while (y) {
		var t = y;
		y = x % y;
		x = t;
	}
	return x;
}

export function openInNewTab(url) {
	var win = window.open(url, '_blank');
	win.focus();
}

export function convertNullValue(valueInput, isChgLimit, byPass) {
	if (byPass) {
		return valueInput;
	}
	if (isNullOrEmpty(valueInput) || byPass) {
		return '--';
	}
	let value = valueInput;
	// if (!isNaN(value)) {
	//   value = formatNumber(value);
	// }
	if (typeof value !== 'string') {
		value = value.toString();
	}

	value = value.replace('$', '');
	value = value.replace('+', '');

	const check = convertFormatToNumber(value);
	if (
		isNullOrEmpty(value) ||
		convertFormatToNumber(value).toString() === '0'
	) {
		return isChgLimit ? '0' : '--';
	} else {
		return value;
	}
}

export function getFisrtOfString(stringInput) {
	if (typeof stringInput !== 'string') {
		return stringInput;
	}
	if (isNullOrEmpty(stringInput)) {
		return '';
	}
	const stringSplit = stringInput.split(' ');
	let stringReturn = '';
	for (let i = 0; i < stringSplit.length; i++) {
		const element = stringSplit[i];
		if (isNullOrEmpty(element)) {
			continue;
		}
		stringReturn += element[0].toLocaleUpperCase();
	}
	return stringReturn;
}

export function getIdModalPicker(filterType, listDisplay, listId) {
	let source = 0;
	switch (filterType) {
		case listDisplay[0]:
			source = 0;
			break;
		case listDisplay[1]:
			source = 1;
			break;
		case listDisplay[2]:
			source = 2;
			break;
		case listDisplay[3]:
			source = 3;
			break;
		case listDisplay[4]:
			source = 4;
			break;
		case listDisplay[5]:
			source = 5;
			break;
		case listDisplay[6]:
			source = 6;
			break;
		case listDisplay[7]:
			source = 7;
			break;
		case listDisplay[8]:
			source = 8;
			break;
		case listDisplay[9]:
			source = 9;
			break;
		case listDisplay[10]:
			source = 10;
			break;
		case listDisplay[11]:
			source = 11;
			break;
		case listDisplay[12]:
			source = 12;
			break;
		case listDisplay[13]:
			source = 13;
			break;
		default:
			source = 0;
			break;
	}
	return listId[source];
}

export function getKeyByValue(value, obj) {
	let key = '';
	Object.keys(obj).map((e) => {
		const valueObj = obj[e];
		if (valueObj === value) {
			key = e;
		}
	});
	return key;
}

export function showContractDetail(data, navigator, isConnected, cbBack) {
	if (data && navigator) {
		navigator.showModal({
			screen: 'equix.ContractNoteDetail',
			overrideBackPress: true,
			backButtonTitle: '',
			animated: true,
			animationType: 'slide-up',
			passProps: {
				cbBack: cbBack,
				source: data.link,
				data,
				title: I18n.t('contractNote'),
				isConnected
			},
			navigatorStyle: {
				...CommonStyle.navigatorSpecial,
				navBarSubtitleFontFamily: 'HelveticaNeue',
				modalPresentationStyle: 'overCurrentContext'
			}
		});
	}
}

export function initAllPosition() {
	const listPromise = [];
	const listAccount = Controller.getListAccount();

	for (let j = 0; j < listAccount.length; j++) {
		const element = listAccount[j];
		const accountID = element.account_id;

		if (accountID) {
			listPromise.push(getUserPositionByAccountID(accountID));
		}
	}

	Promise.all(listPromise).then((response) => {
		const dicPosition = {};
		const listPosition = [];
		response.map((result) => {
			listPosition.push(...result);
		});

		dataStorage.dicPosition = {};

		for (let i = 0; i < listPosition.length; i++) {
			const detail = listPosition[i];
			const symbol = detail.symbol || '';
			if (symbol && dicPosition[symbol] === undefined) {
				dicPosition[symbol] = true;
			}
		}

		dataStorage.dicPosition = { ...dicPosition };

		// update number new unread on menu
		const channel = Enum.CHANNEL_COUNT.MENU_NEWS;
		NewsBusiness.getCountAndUpdateTotalUnreaded(channel);
	});
}

export function getRelatedSymbol(cb) {
	const url = api.getRelatedSymbolUrl();
	api.requestData(url)
		.then((res) => {
			console.log('----------get Data analys symbol success-----------');
			if (res && res.length) {
				dataStorage.dicRelatedSymbol = res;
				cb && cb();
			} else {
				dataStorage.dicRelatedSymbol = [];
				cb && cb();
			}
		})
		.catch((err) => {
			dataStorage.dicRelatedSymbol = [];
		});
}
export function compareFunction(check, data) {
	// let matches = [];

	// for (let i = 0; i < a.length; i++) {
	//     for (let e = 0; e < b.length; e++) {
	//         if (a[i] === b[e]) matches.push(a[i]);
	//     }
	// }
	// return matches;
	const res = check.filter(function (n) {
		return !this.has(n);
	}, new Set(data));
	// console.log(res);
}

export function pushToVerifyMailScreen(navigation) {
	navigation.showModal({
		screen: 'equix.VerifyYourMail',
		title: I18n.t('verifyYourMail'),
		backButtonTitle: '',
		animated: true,
		animationType: 'slide-up',
		navigatorStyle: {
			statusBarColor: CommonStyle.statusBarBgColor,
			statusBarTextColorScheme: 'light',
			navBarBackgroundColor: CommonStyle.statusBarBgColor,
			navBarButtonColor: '#fff',
			navBarHidden: true,
			navBarHideOnScroll: false,
			navBarTextFontSize: 18,
			drawUnderNavBar: true,
			navBarNoBorder: true,
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}

export function translateErrorCode(arrayErrorCode) {
	if (!arrayErrorCode) return '';
	let errorCode;
	if (typeof arrayErrorCode === 'object') {
		arrayErrorCode.forEach((element) => {
			if (element !== null) {
				errorCode = element;
			}
		});
	} else {
		errorCode = arrayErrorCode;
	}
	const keyLanguage = Enum.ERROR_CODE_PASSWORD_MAPPING[errorCode];
	if (!keyLanguage) return '';
	return I18n.t(keyLanguage);
}

export function getStringTimezoneByLocation(location) {
	return momentTimeZone.tz(location).format('Z');
}

export function getTimezoneByLocation(location) {
	const timezone = getStringTimezoneByLocation(location);
	const positionString = timezone.indexOf(':');
	const startNumber = timezone.slice(0, positionString);
	const endNumber = timezone.slice(positionString + 1);

	if (parseInt(startNumber) < 0) {
		return parseInt(startNumber) - parseInt(endNumber) / 60;
	}

	return parseInt(startNumber) + parseInt(endNumber) / 60;
}

export function getNameTimezoneLocation() {
	// true for clear cache when call
	const locationVietNam = {
		location: 'Asia/Ho_Chi_Minh',
		value: '(GMT+07:00) Asia, Ho Chi Minh'
	};
	const location = momentTimeZone.tz.guess(true);
	for (let i = 0; i < TIME_ZONE.length; i++) {
		if (TIME_ZONE[i].location === location) {
			return {
				key: TIME_ZONE[i].key,
				location: location,
				value: TIME_ZONE[i].value
			};
		}
	}
	return locationVietNam;
}

export function convertTimeGMT(location) {
	const timezone = getStringTimezoneByLocation(location);
	return `(GMT${timezone})`;
}

export function getSoftBarHeight() {
	const realWindowHeight = ExtraDimensions.get('REAL_WINDOW_HEIGHT'); // getRealWindowHeight khong phai la function -> crash
	return Controller.setRealWindowHeight(realWindowHeight);
}

export function mergeArrayOfObject(
	newData,
	listData = [],
	fieldCheckExist = 'symbol',
	cutLength = 30
) {
	const checkExist = listData.filter(function (obj) {
		return obj[fieldCheckExist] === newData[fieldCheckExist];
	});
	if (checkExist.length === 0) {
		if (listData.length < cutLength) {
			listData = [newData, ...listData];
		} else {
			listData = listData.slice(0, cutLength - 1);
			listData = [newData, ...listData];
		}
	} else {
		listData = listData.filter((obj) => {
			return obj[fieldCheckExist] !== newData[fieldCheckExist];
		});
		listData = [newData, ...listData];
	}
	return listData;
}
export function checkNewTag(tag) {
	try {
		if (!tag) return;
		let arr;
		if (tag) {
			if (typeof tag === 'string') {
				arr = JSON.parse(tag);
			} else {
				arr = tag;
			}
		}
		let stagTag = [];
		arr.map((item) => {
			if (
				NEWSTAG.BUY_BACK.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.BUY_BACK.KEY)
			) {
				stagTag.push(NEWSTAG.BUY_BACK.KEY);
				return;
			}
			if (
				NEWSTAG.CAP_RECONSTRUCTION.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.CAP_RECONSTRUCTION.KEY)
			) {
				stagTag.push(NEWSTAG.CAP_RECONSTRUCTION.KEY);
				return;
			}
			if (
				NEWSTAG.DIVIDEND.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.DIVIDEND.KEY)
			) {
				stagTag.push(NEWSTAG.DIVIDEND.KEY);
				return;
			}
			if (
				NEWSTAG.HALT_LIFTED.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.HALT_LIFTED.KEY)
			) {
				stagTag.push(NEWSTAG.HALT_LIFTED.KEY);
				return;
			}
			if (
				NEWSTAG.HALTED.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.HALTED.KEY)
			) {
				stagTag.push(NEWSTAG.HALTED.KEY);
				return;
			}
			if (
				NEWSTAG.INTEREST.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.INTEREST.KEY)
			) {
				stagTag.push(NEWSTAG.INTEREST.KEY);
				return;
			}
			if (
				NEWSTAG.ISSUANCE.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.ISSUANCE.KEY)
			) {
				stagTag.push(NEWSTAG.ISSUANCE.KEY);
				return;
			}
			if (
				NEWSTAG.REPORT.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.REPORT.KEY)
			) {
				stagTag.push(NEWSTAG.REPORT.KEY);
				return;
			}
			if (
				NEWSTAG.SENSITIVE.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.SENSITIVE.KEY)
			) {
				stagTag.push(NEWSTAG.SENSITIVE.KEY);
				return;
			}
			if (
				NEWSTAG.TAKEOVER.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.TAKEOVER.KEY)
			) {
				stagTag.push(NEWSTAG.TAKEOVER.KEY);
				return;
			}
			if (
				NEWSTAG.TRANSACTION.TAGS.includes(item) &&
				!stagTag.includes(NEWSTAG.TRANSACTION.KEY)
			) {
				stagTag.push(NEWSTAG.TRANSACTION.KEY);
			}
		});
		return stagTag;
	} catch (error) {
		console.log('error at check news tag', error);
	}
}
export function createTagNewsStringQuerry(protoTag) {
	try {
		if (!protoTag) return;
		switch (protoTag) {
			case NEWSTAG.BUY_BACK.DISPLAY_NAME:
				return NEWSTAG.BUY_BACK.TAGS.join(',');
			case NEWSTAG.CAP_RECONSTRUCTION.DISPLAY_NAME:
				return NEWSTAG.CAP_RECONSTRUCTION.TAGS.join(',');
			case NEWSTAG.DIVIDEND.DISPLAY_NAME:
				return NEWSTAG.DIVIDEND.TAGS.join(',');
			case NEWSTAG.HALT_LIFTED.DISPLAY_NAME:
				return NEWSTAG.HALT_LIFTED.TAGS.join(',');
			case NEWSTAG.HALTED.DISPLAY_NAME:
				return NEWSTAG.HALTED.TAGS.join(',');
			case NEWSTAG.INTEREST.DISPLAY_NAME:
				return NEWSTAG.INTEREST.TAGS.join(',');
			case NEWSTAG.ISSUANCE.DISPLAY_NAME:
				return NEWSTAG.ISSUANCE.TAGS.join(',');
			case NEWSTAG.REPORT.DISPLAY_NAME:
				return NEWSTAG.REPORT.TAGS.join(',');
			case NEWSTAG.SENSITIVE.DISPLAY_NAME:
				return NEWSTAG.SENSITIVE.TAGS.join(',');
			case NEWSTAG.TAKEOVER.DISPLAY_NAME:
				return NEWSTAG.TAKEOVER.TAGS.join(',');
			case NEWSTAG.TRANSACTION.DISPLAY_NAME:
				return NEWSTAG.TRANSACTION.TAGS.join(',');
			default:
				return '';
		}
	} catch (error) {
		console.log('createTagNewsStringQuerry', error);
	}
}
let dataAccountFake = [];
let names = [
	'Mario Speedwagon',
	'Petey Cruiser',
	'Anna Sthesia',
	'Paul Molive',
	'Anna Mull',
	'Gail Forcewind',
	'Paige Turner',
	'Bob Frapples',
	'Walter Melon',
	'Nick R.Bocker',
	'Barb Ackue',
	'Buck Kinnear',
	'Greta Life',
	'Ira Membrit',
	'Shonda Leer',
	'Brock Lee',
	'Maya Didas',
	'Rick Shea',
	'Pete Sariya',
	'Monty Carlo'
];
for (let index = 0; index < 20; index++) {
	dataAccountFake.push({
		key: index,
		accountId: index,
		accountName: names[index]
	});
}

export function searchAccount({ textSearch, cb }) {
	if (textSearch === '') {
		func.getReccentAccount().then((data) => {
			cb && cb(data);
		});
		return;
	}
	const filter = new RegExp(textSearch, 'g');
	setTimeout(() => {
		const result = dataAccountFake.filter((el) => {
			const accountName = el.accountName;
			return accountName.match(filter);
		});
		cb && cb(result);
	}, 300);
}
export function stringMostOneDot(text) {
	try {
		const countDot = text.split('.').length - 1;
		if (countDot > 1) {
			return text.slice(0, -1);
		} else {
			return text;
		}
	} catch (e) {
		return text;
	}
}
export function isDotAtEndString(text) {
	try {
		const endChar = text.charAt(text.length - 1);
		if (endChar === '.') {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
}
export function getSearchSymbolReccent({ cb }) {
	func.getReccentSearchSymbol()
		.then((data) => {
			cb && cb(data);
		})
		.catch((e) => cb && cb([]));
}
