import AsyncStorage from '@react-native-community/async-storage';
import Enum from '../enum';
import Config from '../config';
import I18n from '../modules/language';
import * as Model from './model';
import * as Emitter from '@lib/vietnam-emitter';
import * as PureFunc from '../utils/pure_func';
import * as Channel from '../streaming/channel';
import USER_PRICE_SOURCE_ENUM from '../constants/user_price_source.json';
import LightTheme from '../theme/color_define/light';
import { Navigation } from 'react-native-navigation';
import { func, dataStorage } from '../storage';
import * as manageSymbolRelated from '../manage/manageRelatedSymbol';
import CommonStyle, { register } from '~/theme/theme_controller';
// import * as Business from '~/business'
const { SUB_ENVIRONMENT, SYMBOL_CLASS, EXCHANGE } = Enum;
const THEME = Enum.THEME;
const ENVIRONMENT = Enum.ENVIRONMENT;
const WATCHLIST = Enum.WATCHLIST;

//  #region GLOBAL STORE REDUX
export function dispatch() {
	const dispatchFunc = Model.getDispathchFunc();
	return dispatchFunc(...arguments);
}
export function getGlobalState() {
	return Model.getGlobalState() || {};
}
export const setGlobalStore = Model.setGlobalStore;
//  #endregion

//  #region GET CONFIG APP
export const setIsDemo = Model.setIsDemo;
export const isDemo = Model.isDemo;
export const startSession = Model.startSession;
export const getSession = Model.getSession;
export const getSound = Model.getSound;
export const setSound = Model.setSound;
export const setVibrate = Model.setVibrate;
export const getVibrate = Model.getVibrate;
export const getLang = Model.getLang;
export const setLang = Model.setLang;
export const getLangGuest = Model.getLangGuest;
export const setLangGuest = Model.setLangGuest;
export const setIsSearchAccount = Model.setIsSearchAccount;
export const getIsSearchAccount = Model.getIsSearchAccount;
export const setLocation = Model.setLocation;
export const getLocation = Model.getLocation;
export const setBaseUrl = Model.setBaseUrl;
export const setBaseVersion = Model.setBaseVersion;
export const setBaseStreamingUrl = Model.setBaseStreamingUrl;
export const getBaseStreamingUrl = Model.getBaseStreamingUrl;
export const setRegion = Model.setRegion;
export const getRegion = Model.getRegion;
export const setFCMToken = Model.setFCMToken;
export const getFCMToken = Model.getFCMToken;
export const setFontSize = Model.setFontSize;
export const getFontSize = Model.getFontSize;
export const setFontSizeOfGuest = Model.setFontSizeOfGuest;
export const getFontSizeOfGuest = Model.getFontSizeOfGuest;
export const setStatusModalCurrent = Model.setStatusModalCurrent;
export const getStatusModalCurrent = Model.getStatusModalCurrent;
export const setShouldSetDefault = Model.setShouldSetDefault;
export const getShouldSetDefault = Model.getShouldSetDefault;
export function checkDemoEnvironment() {
	// Start app
	const objStore = getGlobalState();
	if (objStore) {
		const storeApp = objStore.app || {};
		if (Config.environment === ENVIRONMENT.PRODUCTION) {
			// product default is LIVE
			setIsDemo(storeApp.isDemo || false);
		} else {
			// next or staging default is NEXT or STAGING
			setIsDemo(true);
		}
	}
	return isDemo();
}
export function getBaseUrl(baseUrlFromApi = true) {
	if (baseUrlFromApi) {
		if (Model.getBaseUrl()) {
			return Model.getBaseUrl();
		} else {
			const isDemo = checkDemoEnvironment();
			const env = Config.environment;
			if (isDemo) {
				// Môi trường khác product
				switch (env) {
					case ENVIRONMENT.NEXT:
						return Config.apiUrlConfig.NEXT.url;
					case ENVIRONMENT.DEMO:
					case ENVIRONMENT.STAGING:
						return Config.apiUrlConfig.STAGING.url;
					case ENVIRONMENT.BETA:
						return Config.apiUrlConfig.BETA.url;
					case ENVIRONMENT.IRESS:
						return Config.apiUrlConfig.IRESS.url;
					case ENVIRONMENT.IRESS_DEV2:
						return Config.apiUrlConfig.IRESS_DEV2.url;
					case ENVIRONMENT.IRESS_DEV4:
						return Config.apiUrlConfig.IRESS_DEV4.url;
					case ENVIRONMENT.IRESS_DEV5:
						return Config.apiUrlConfig.IRESS_DEV5.url;
					case ENVIRONMENT.IRESS_UAT:
						return Config.apiUrlConfig.IRESS_UAT.url;
					case ENVIRONMENT.IRESS_PROD:
						return Config.apiUrlConfig.IRESS_PROD.url;
					case ENVIRONMENT.IRESS_ABSA:
						return Config.apiUrlConfig.IRESS_ABSA.url;
					case ENVIRONMENT.CIMB_DEV:
						return Config.apiUrlConfig.CIMB_DEV.url;
					case ENVIRONMENT.CIMB_UAT:
						return Config.apiUrlConfig.CIMB_UAT.url;
					case ENVIRONMENT.CIMB_PROD:
						return Config.apiUrlConfig.CIMB_PROD.url;
					case ENVIRONMENT.HL_DEV:
						return Config.apiUrlConfig.HL_DEV.url;
					case ENVIRONMENT.HL_UAT:
						return Config.apiUrlConfig.HL_UAT.url;
					default:
						// Demo tren product
						return Config.apiUrlConfig.DEMO.url;
				}
			}
			// Môi trường product
			return Config.apiUrlConfig.PRODUCTION.url;
		}
	}
	const isDemo = checkDemoEnvironment();
	const env = Config.environment;
	if (isDemo) {
		// Môi trường khác product
		switch (env) {
			case ENVIRONMENT.NEXT:
				return Config.apiUrlConfig.NEXT.url;
			case ENVIRONMENT.STAGING:
			case ENVIRONMENT.DEMO:
				return Config.apiUrlConfig.STAGING.url;
			case ENVIRONMENT.BETA:
				return Config.apiUrlConfig.BETA.url;
			case ENVIRONMENT.IRESS:
				return Config.apiUrlConfig.IRESS.url;
			case ENVIRONMENT.IRESS_DEV2:
				return Config.apiUrlConfig.IRESS_DEV2.url;
			case ENVIRONMENT.IRESS_DEV4:
				return Config.apiUrlConfig.IRESS_DEV4.url;
			case ENVIRONMENT.IRESS_DEV5:
				return Config.apiUrlConfig.IRESS_DEV5.url;
			case ENVIRONMENT.IRESS_UAT:
				return Config.apiUrlConfig.IRESS_UAT.url;
			case ENVIRONMENT.IRESS_PROD:
				return Config.apiUrlConfig.IRESS_PROD.url;
			case ENVIRONMENT.IRESS_ABSA:
				return Config.apiUrlConfig.IRESS_ABSA.url;
			case ENVIRONMENT.CIMB_DEV:
				return Config.apiUrlConfig.CIMB_DEV.url;
			case ENVIRONMENT.CIMB_UAT:
				return Config.apiUrlConfig.CIMB_UAT.url;
			case ENVIRONMENT.CIMB_PROD:
				return Config.apiUrlConfig.CIMB_PROD.url;
			case ENVIRONMENT.HL_DEV:
				return Config.apiUrlConfig.HL_DEV.url;
			case ENVIRONMENT.HL_UAT:
				return Config.apiUrlConfig.HL_UAT.url;
			default:
				// Demo tren product
				return Config.apiUrlConfig.DEMO.url;
		}
	}
	// Môi trường product
	return Config.apiUrlConfig.PRODUCTION.url;
}

export function getBaseUrlSSE() {
	const isDemo = checkDemoEnvironment();
	const env = Config.environment;
	if (isDemo) {
		// Môi trường khác product
		switch (env) {
			case ENVIRONMENT.NEXT:
				return Config.sseUrlConfig.NEXT.url;
			case ENVIRONMENT.BETA:
				return Config.sseUrlConfig.BETA.url;
			case ENVIRONMENT.DEMO:
				return Config.sseUrlConfig.STAGING.url;
			case ENVIRONMENT.STAGING:
				return Config.sseUrlConfig.STAGING.url;
			case ENVIRONMENT.IRESS:
				return Config.sseUrlConfig.IRESS.url;
			case ENVIRONMENT.IRESS_DEV2:
				return Config.sseUrlConfig.IRESS_DEV2.url;
			case ENVIRONMENT.IRESS_DEV4:
				return Config.sseUrlConfig.IRESS_DEV4.url;
			case ENVIRONMENT.IRESS_DEV5:
				return Config.sseUrlConfig.IRESS_DEV5.url;
			case ENVIRONMENT.IRESS_UAT:
				return Config.sseUrlConfig.IRESS_UAT.url;
			case ENVIRONMENT.IRESS_PROD:
				return Config.sseUrlConfig.IRESS_PROD.url;
			case ENVIRONMENT.IRESS_ABSA:
				return Config.sseUrlConfig.IRESS_ABSA.url;
			case ENVIRONMENT.CIMB_DEV:
				return Config.sseUrlConfig.CIMB_DEV.url;
			case ENVIRONMENT.CIMB_UAT:
				return Config.sseUrlConfig.CIMB_UAT.url;
			case ENVIRONMENT.CIMB_PROD:
				return Config.sseUrlConfig.CIMB_PROD.url;
			case ENVIRONMENT.HL_DEV:
				return Config.sseUrlConfig.HL_DEV.url;
			case ENVIRONMENT.HL_UAT:
				return Config.sseUrlConfig.HL_UAT.url;
			default:
				// Demo tren product
				return Config.sseUrlConfig.DEMO.url;
		}
	}
	// Môi trường product
	return Config.sseUrlConfig.PRODUCTION.url;
}

export function checkSubEnv() {
	if (
		(Config.environment === ENVIRONMENT.STAGING &&
			[
				// SUB_ENVIRONMENT.EQUIX_DEMO,
				// SUB_ENVIRONMENT.IRESS_V4,
				SUB_ENVIRONMENT.NEXT
			].includes(Config.subEnvironment)) ||
		Config.environment === ENVIRONMENT.BETA
	) {
		return true;
	}
	return false;
}

export function getVersion(keyVersion, forceChange = false) {
	// Nếu có baseVersion thì lấy luôn version
	const baseVersion = Model.getBaseVersion();
	if (baseVersion) return Model.getBaseVersion();
	if (forceChange && checkSubEnv()) keyVersion = 'wsVersion';
	const isDemo = checkDemoEnvironment();
	const env = Config.environment;
	if (isDemo) {
		// Môi trường khác product
		switch (env) {
			case ENVIRONMENT.NEXT:
				return Config.apiUrlConfig.NEXT[keyVersion];
			case ENVIRONMENT.STAGING:
			case ENVIRONMENT.DEMO:
				return Config.apiUrlConfig.STAGING[keyVersion];
			case ENVIRONMENT.BETA:
				return Config.apiUrlConfig.BETA[keyVersion];
			case ENVIRONMENT.IRESS:
				return Config.apiUrlConfig.IRESS[keyVersion];
			case ENVIRONMENT.IRESS_DEV2:
				return Config.apiUrlConfig.IRESS_DEV2[keyVersion];
			case ENVIRONMENT.IRESS_DEV4:
				return Config.apiUrlConfig.IRESS_DEV4[keyVersion];
			case ENVIRONMENT.IRESS_DEV5:
				return Config.apiUrlConfig.IRESS_DEV5[keyVersion];
			case ENVIRONMENT.IRESS_UAT:
				return Config.apiUrlConfig.IRESS_UAT[keyVersion];
			case ENVIRONMENT.IRESS_PROD:
				return Config.apiUrlConfig.IRESS_PROD[keyVersion];
			case ENVIRONMENT.IRESS_ABSA:
				return Config.apiUrlConfig.IRESS_ABSA[keyVersion];
			case ENVIRONMENT.CIMB_DEV:
				return Config.apiUrlConfig.CIMB_DEV[keyVersion];
			case ENVIRONMENT.CIMB_UAT:
				return Config.apiUrlConfig.CIMB_UAT[keyVersion];
			case ENVIRONMENT.CIMB_PROD:
				return Config.apiUrlConfig.CIMB_PROD[keyVersion];
			case ENVIRONMENT.HL_DEV:
				return Config.apiUrlConfig.HL_DEV[keyVersion];
			case ENVIRONMENT.HL_UAT:
				return Config.apiUrlConfig.HL_UAT[keyVersion];
			default:
				// Demo tren product
				return Config.apiUrlConfig.DEMO[keyVersion];
		}
	}
	// Môi trường product
	return Config.apiUrlConfig.PRODUCTION[keyVersion];
}
export function getConnectionStatus() {
	const globalStatus = getGlobalState();
	return globalStatus.app.isConnected;
}
export function getLoginObj() {
	const globalStatus = getGlobalState();
	return globalStatus.login;
}
//  #endregion

//  #region TOKEN
export const getAccessToken = Model.getAccessToken;
export function setAccessToken(token) {
	const oldToken = getAccessToken();
	const newToken = token || null;
	Model.setAccessToken(newToken);

	AsyncStorage.setItem('oldTokenForLogout', newToken || '');

	if (oldToken !== newToken && oldToken == null) {
		const channelName = Channel.getChannelGotAccessTokenFirst();
		Emitter.emit(channelName, newToken);
	}
}
//  #endregion

//  #region PORTFOLIO
export function setPortfolio(data = {}, forceReq = true) {
	Model.setPortfolio(data);

	const channelSummary = Channel.getChannelAccountSummaryChange();
	Emitter.emit(channelSummary, PureFunc.clone(data));

	const channelPosition = Channel.getChannelPositionChange();
	forceReq && Emitter.emit(channelPosition, PureFunc.clone(data));
}
export const getCachePortfolio = Model.getPortfolio;
export function getAllPositions() {
	const portfolio = Model.getPortfolio() || {};
	return portfolio.positions || [];
}
export function checkSymbolHasPosition(symbol) {
	const positions = getAllPositions();
	return positions.findIndex((item) => item.symbol === symbol);
}
export function isAppLySpecificSymbolLME() {
	const subEnvironment = Config.subEnvironment;
	switch (subEnvironment) {
		case SUB_ENVIRONMENT.PRODUCT:
			return false;
		case SUB_ENVIRONMENT.PRODUCT_DEMO:
			return false;
		case SUB_ENVIRONMENT.NEXT:
			return true;
		case SUB_ENVIRONMENT.IRESS_V4:
			return true;
		case SUB_ENVIRONMENT.EQUIX_DEMO:
			return true;
		case SUB_ENVIRONMENT.BETA:
			return false;
		default:
			return false;
	}
}
export function isSymbolVariantLME(object) {
	const { exchange, class: classSymbol } = object;
	// Check LME theo 2 key la class + exchange
	if (
		exchange &&
		classSymbol &&
		classSymbol === SYMBOL_CLASS.FUTURE &&
		exchange === EXCHANGE.LME
	) {
		return true;
	}
	return false;
}

export function checkSymbolHasPositionVariantLME(specificSymbol) {
	const positions = getAllPositions();
	return positions.findIndex((item) => {
		if (isSymbolVariantLME(item)) {
			return item.group_code === specificSymbol;
		}
		return item.symbol === specificSymbol;
	});
}
export function updateCashBalance(newCash, isPubData = true) {
	if (!newCash) return false;

	Model.updatePortfolio(newCash);

	if (isPubData) {
		const newPortfolio = Model.getPortfolio();
		const channelName = Channel.getChannelAccountSummaryChange();
		Emitter.emit(channelName, newPortfolio);
	}
	return true;
}
export function updatePosition(newPosition, isPubData = true) {
	if (!newPosition || !newPosition.symbol) return false;

	const positions = getAllPositions();
	let index = -1;
	if (isAppLySpecificSymbolLME()) {
		if (isSymbolVariantLME(newPosition)) {
			index = checkSymbolHasPositionVariantLME(newPosition.group_code);
		} else {
			index = checkSymbolHasPosition(newPosition.symbol);
		}
	} else {
		index = checkSymbolHasPosition(newPosition.symbol);
	}

	if (index === -1) {
		// add
		positions.unshift(newPosition);
	} else {
		// update
		positions[index] = newPosition;
	}

	dataStorage.dicPosition = {};
	positions.map((e) => {
		const symbol = e.symbol;
		if (symbol) {
			dataStorage.dicPosition[symbol] = true;
		}
	});

	Model.updatePortfolio({ positions });

	if (isPubData) {
		const newPortfolio = Model.getPortfolio();
		const channelName = Channel.getChannelPositionChange();
		Emitter.emit(channelName, newPortfolio);
	}
	return true;
}
//  #endregion

//  #region ACCOUNT
export const getAccountId = Model.getAccountId;
export const getListAccount = Model.getListAccount;
export function setCurrentAccount(currentAccount) {
	if (!currentAccount || !currentAccount.account_id) {
		Model.setCurrentAccount(currentAccount);
		return;
	}
	const oldAccount = getCurrentAccount();
	Model.setCurrentAccount(currentAccount);

	if (!oldAccount && currentAccount.account_id) {
		// oldAccount null && newAccount co gia tri
		const channelName = Channel.getChannelCurrentAccountChange();
		return Emitter.emit(channelName, {
			oldAccountId: '',
			newAccountId: currentAccount.account_id
		});
	}
	if (oldAccount.account_id !== currentAccount.account_id) {
		// oldAccount !== newAccount
		const channelName = Channel.getChannelCurrentAccountChange();
		return Emitter.emit(channelName, {
			oldAccountId: oldAccount.account_id,
			newAccountId: currentAccount.account_id
		});
	}
}
export const getCurrentAccount = Model.getCurrentAccount;
export const setAllListAccount = Model.setListAccount;
export const getAllListAccount = Model.getListAccount;
export function setAccountId(accountId) {
	const oldAccountId = getAccountId();
	const newAccountId = accountId || null;
	Model.setAccountId(newAccountId);

	if (oldAccountId !== newAccountId && accountId != null) {
		const channelName = Channel.getChannelAccountIdChange();
		Emitter.emit(channelName, newAccountId);
	}
}
//  #endregion

//  #region SCREEN
export const getCurrentScreen = Model.getCurrentScreen;
export const setCurrentScreen = Model.setCurrentScreen;
export function isCurrentScreen(screen) {
	return getCurrentScreen() === screen;
}
//  #endregion

//  #region REQUEST STATUS CONTROL
export function checkIsReqSending(key) {
	return Model.getReqStatus(key) === true;
}
export function setStatusReqSending(key) {
	Model.setReqStatus(key, true);
}
export function setStatusReqResponse(key, data, isSuccess) {
	Model.setReqStatus(key, false);
	const listFunc = Model.getListFuncWaitRes(key);
	Model.setListFuncWaitRes(key, []);

	listFunc.map(({ resolve, reject }) => {
		isSuccess ? resolve(data) : reject(data);
	});
}
export const pushToListFuncWaitRes = Model.pushToListFuncWaitRes;
//  #endregion

//  #region USER INFO
export const setUserInfo = Model.setUserInfo;
export const getUserInfo = Model.getUserInfo;
export function getUserId() {
	return Config.iressUserID;
	const userInfo = getUserInfo() || {};
	return userInfo.user_id || '';
}
export function getEmail() {
	const userInfo = getUserInfo() || {};
	return userInfo.email || '';
}
export function getUserLoginId() {
	const userInfo = getUserInfo() || {};
	return userInfo.user_login_id || '';
}
export function getUserGroup() {
	const userInfo = getUserInfo() || {};
	return userInfo.role_group || '';
}
export function getUserVerify() {
	const userInfo = getUserInfo() || {};
	return userInfo.verify;
}
export function getUserRole() {
	const userInfo = getUserInfo() || {};
	return userInfo.role;
}
export function setUserVerify(time = 0) {
	const userInfo = getUserInfo();
	if (userInfo == null) return;

	userInfo.verify = time;
	setUserInfo(userInfo);
}
export function getUserType() {
	const userInfo = getUserInfo() || {};
	return userInfo.user_type ? userInfo.user_type : Enum.USER_TYPE.RETAIL;
}
export function showAlert(msg, doneFn) {
	if (getIsShowingAlertReload()) return console.log('SHOW MULTI ALERT');
	setIsShowingAlertReload(true);
	Navigation.showModal({
		screen: 'equix.ShowAlert',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			msg,
			doneFn: () => {
				setIsShowingAlertReload(false);
				Navigation.dismissModal({ animationType: 'none' });
				doneFn();
			}
		}
	});
}

export function showAlertRequestBiometrics({
	onTryAgain,
	allowCancel,
	onCancel
}) {
	if (getIsShowingAlertReload()) return console.log('SHOW MULTI ALERT');
	setIsShowingAlertReload(true);
	Navigation.showModal({
		screen: 'equix.PopUpBiometric',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			onTryAgain,
			allowCancel,
			onCancel
		}
	});
}

export function showResetAlert(msg, doneFn) {
	Navigation.showModal({
		screen: 'equix.ResetAlert',
		animated: true,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorStyleCommon,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			msg,
			doneFn: () => {
				Navigation.dismissModal({ animationType: 'none' });
				doneFn();
			},
			cancelFn: () => {
				Navigation.dismissModal({ animationType: 'none' });
			}
		}
	});
}
export function showAlertReload(cb) {
	dataStorage.dismissAuthen && dataStorage.dismissAuthen();
	if (getIsShowingAlertReload()) return;
	setIsShowingAlertReload(true);
	showAlert(I18n.t('msgReloadSecurity'), () => {
		setIsShowingAlertReload(false);
		cb && cb();
	});
}

export function showErrorLogOut() {
	if (getIsShowingAlertReload()) {
		return console.log('SHOW ALERT ERROR SYTEMS');
	}
	setIsShowingAlertReload(true);
	Navigation.showModal({
		screen: 'equix.ShowErorrPopUp',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}
export function showDelayedMarketDataPopup(time) {
	Navigation.showModal({
		screen: 'equix.ShowDelayedMarketDataPopUp',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			time
		}
	});
}
export function showPopUpLogOut({ code, errorMessage }) {
	Navigation.showModal({
		screen: 'equix.PopUpErrorLogin',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			code,
			errorMessage
		}
	});
}
//  #endregion

//  #region SETTING
export const setUserPriceSource = Model.setUserPriceSource;
export const getUserPriceSource = Model.getUserPriceSource;
export const setLoginStatus = Model.setLoginStatus;
export const getLoginStatus = Model.getLoginStatus;
export const getThemeColorFromStorage = Model.getThemeColorFromStorage;
export const getThemeColor = Model.getThemeColor;
export const setThemeColor = Model.setThemeColor;
export const setIsShowingAlertReload = Model.setIsShowingAlertChangeRole;
export const getIsShowingAlertReload = Model.getIsShowingAlertChangeRole;
export function isPriceStreaming() {
	return true;
	const streaming = USER_PRICE_SOURCE_ENUM[3].id;
	const mkDataType = getMarketDataType();
	return true;
	return mkDataType === streaming;
}
export function changeThemeColor(color) {
	let data = null;
	switch (color) {
		case THEME.LIGHT:
			data = LightTheme;
			break;
		default:
			break;
	}
	if (data) {
		setThemeColor({
			type: color,
			data
		});
		dispatch();
	} else {
		console.warn(`Theme color: ${color} is not exist`);
	}
}
export function getSettingApp() {
	const globalStatus = getGlobalState();
	return globalStatus.setting || {};
}
//  #endregion

//  #region WATCHLIST
export const getCurrentPriceboardId = Model.getCurrentPriceboardId;
export function resetWatchlist() {
	Model.setPriceboard({});
}
export function updateWatchlistById(data) {
	if (!data || !data.watchlist) return false;

	const currentData = Model.getPriceboard();
	currentData[data.watchlist] = data;
	Model.setPriceboard(currentData);
	return true;
}
export function deleteWatchlistById(id) {
	const currentData = Model.getPriceboard();
	if (!currentData) {
		console.warn('not have any watchlist');
		return false;
	}
	delete currentData[id];
	Model.setPriceboard(currentData);
	return true;
}
export function getAllPriceboardStatic() {
	return PureFunc.clone(Enum.LIST_PRICE_OBJECT);
}
export function checkCurrentPriceboardIsStatic(
	priceboardId = Model.getCurrentPriceboardId()
) {
	if (!priceboardId) return true;

	const listPriceboardStatic = getAllPriceboardStatic();
	return (
		listPriceboardStatic.find((item) => item.watchlist === priceboardId) !=
		null
	);
}
export function getPriceboardStaticById(priceboardId) {
	const listPriceboardStatic = getAllPriceboardStatic();
	return listPriceboardStatic.find((item) => item.watchlist === priceboardId);
}
export function getPriceboardPersonalById(priceboardId) {
	const allPriceboard = Model.getPriceboard();
	return allPriceboard[priceboardId] || {};
}
export function getPriceboardDetailInPriceBoard(priceboardId) {
	const isStatic = checkCurrentPriceboardIsStatic(priceboardId);
	return isStatic
		? getPriceboardStaticById(priceboardId)
		: getPriceboardPersonalById(priceboardId);
}
export function addToWatchList(data) {
	try {
		console.logFull('addToWatchList:', data);

		const newData = PureFunc.clone(data);
		if (
			!newData ||
			!newData.watchlist ||
			!PureFunc.arrayHasItem(newData.value)
		) {
			return null;
		}

		const priceBoardDetail = getPriceboardDetailInPriceBoard(
			newData.watchlist
		);
		if (!priceBoardDetail) {
			console.log('(Add) Priceboard detail not exist');
			return null;
		}

		let currentTime = new Date().getTime();
		priceBoardDetail.watchlist_name = newData.watchlist_name;
		priceBoardDetail.value = priceBoardDetail.value || [];
		priceBoardDetail.value.unshift(newData.value[0]);
		priceBoardDetail.value.map((item) => {
			item.rank = ++currentTime;
		});
		updateWatchlistById(priceBoardDetail);

		const channelName = Channel.getChannelWatchlistChanged(
			priceBoardDetail.watchlist
		);
		Emitter.emit(channelName, priceBoardDetail);

		return priceBoardDetail;
	} catch (error) {
		console.catch('addToWatchList', 'error:', error);
		return null;
	}
}
export function removeInWatchList(data) {
	try {
		const newData = PureFunc.clone(data);
		if (
			!newData ||
			!newData.watchlist ||
			!PureFunc.arrayHasItem(newData.value)
		) {
			return null;
		}

		const priceBoardDetail = getPriceboardDetailInPriceBoard(
			newData.watchlist
		);
		if (
			!priceBoardDetail ||
			!PureFunc.arrayHasItem(priceBoardDetail.value)
		) {
			console.warn(
				'(Remove)',
				'Priceboard detail not exist, data:',
				priceBoardDetail
			);
			return null;
		}

		priceBoardDetail.watchlist_name = newData.watchlist_name;
		priceBoardDetail.value = priceBoardDetail.value || [];

		const newItem = newData.value[0];
		const index = priceBoardDetail.value.findIndex(
			(element) => newItem.symbol === element.symbol
		);
		if (index === -1) {
			return null;
		} else {
			priceBoardDetail.value.splice(index, 1);
		}
		updateWatchlistById(priceBoardDetail);

		const channelName = Channel.getChannelWatchlistChanged(
			newData.watchlist
		);
		Emitter.emit(channelName, priceBoardDetail);

		return priceBoardDetail;
	} catch (error) {
		console.catch('removeInWatchList', 'error:', error);
		return null;
	}
}
export function resetPriceBoardWatchList(data) {
	try {
		if (!data || !data.watchlist || !data.watchlist_name) return null;

		const newData = PureFunc.clone({
			...data,
			value: data.value || []
		});
		newData.value.sort((a, b) => a.rank - b.rank);
		updateWatchlistById(newData);

		const channelChange = Channel.getChannelWatchlistChanged(
			newData.watchlist
		);
		const channelUpdate = Channel.getChannelUpdatePriceboard();
		Emitter.emit(channelChange, newData);
		Emitter.emit(channelUpdate, newData);

		return newData;
	} catch (error) {
		console.catch('resetPriceBoardWatchList', 'error:', error);
		return null;
	}
}
export function addPriceboard(data) {
	try {
		if (!data || !data.watchlist || !data.watchlist_name) return null;

		const newData = PureFunc.clone({
			...data,
			value: data.value || []
		});
		newData.value.sort((a, b) => a.rank - b.rank);
		updateWatchlistById(newData);

		const channelName = Channel.getChannelAddNewPriceboard();
		Emitter.emit(channelName, newData);

		return newData;
	} catch (error) {
		console.catch('addPriceboard', 'error:', error);
		return null;
	}
}
export function deletePriceboard(priceBoardId) {
	const oldPriceboard = getPriceboardDetailInPriceBoard(priceBoardId);
	deleteWatchlistById(priceBoardId);

	const channelName = Channel.getChannelDeleteOldPriceboard();
	Emitter.emit(channelName, priceBoardId);

	if (getCurrentPriceboardId() === priceBoardId) {
		setCurrentPriceboardId(WATCHLIST.USER_WATCHLIST);

		PureFunc.showNotification(FCM, {
			sound: getSound(),
			vibrate: getVibrate(),
			title: 'Deleted Watchlist',
			body: `${oldPriceboard.watchlist_name} ${I18n.t(
				'notificationWhenDeleteCurrentWatchlist'
			)}`
		});
	}
}
//  #endregion

//  #region ORDER
export const setIressStatus = Model.setIressStatus;
export const getIressStatus = Model.getIressStatus;
//  #endregion

//  #region USER PRICE SOURCE
export function getMarketDataType() {
	const userDetails = getUserInfo() || {};
	const marketDataTypeAU = userDetails.market_data_au || 0;
	const marketDataTypeUS = userDetails.market_data_us || 0;
	const priceSourceType = Enum.PRICE_SOURCE;

	if (!getLoginStatus()) return priceSourceType.delayed;
	if (marketDataTypeAU === 0 && marketDataTypeUS === 0) {
		return priceSourceType.noAccess;
	} // no access
	if (marketDataTypeAU === 1 || marketDataTypeUS === 1) {
		return priceSourceType.delayed;
	} // 1 trong 2 hoac ca 2 la delay
	if (marketDataTypeAU === 2 || marketDataTypeUS === 2) {
		return priceSourceType.clicktorefresh;
	} // 1 trong 2 hoac ca 2 la c2r
	if (marketDataTypeAU === 3 || marketDataTypeUS === 3) {
		return priceSourceType.streaming;
	} // 1 trong 2 hoac ca 2 la streaming
	return '';
}

export const getMarketDataUS = Model.getMarketDataUS;
export const getMarketDataAU = Model.getMarketDataAU;

export function getMarketDataTypeBySymbol(isAuBySymbol) {
	return isAuBySymbol ? getMarketDataAU() : getMarketDataUS();
}
//  #endregion

//  #region NEWS
export const getLiveNewStatus = Model.getLiveNewStatus;
//  #endregion

//  #region SYMBOL
export function setSymbolEquity(listObj = []) {
	listObj.map((obj) => obj && Model.setSymbolEquity(obj));
}
export function getSymbolEquity(listSymbol = []) {
	return listSymbol.map((symbol) => Model.getSymbolEquity(symbol));
}
export function isSymbolCached(symbol) {
	return Model.getSymbolEquity(symbol) != null;
}
export function getDisplayNameOfSymbol(symbol) {
	const obj = getSymbolEquity([symbol])[0];
	return obj && obj.display_name ? obj.display_name : symbol;
}
export function getCompanyOfSymbol(symbol) {
	const obj = getSymbolEquity([symbol])[0];
	return obj && obj.company_name ? obj.company_name : '';
}
export function isSymbolTradingHalt(symbol) {
	const obj = getSymbolEquity([symbol])[0];
	return obj && obj.trading_halt === 1;
}
//  #endregion

// #region TIMEZONE
export const getTimeZoneAU = Model.getTimeZoneAU;
export const getTimeZoneUS = Model.getTimeZoneUS;
export const setTimeZoneAU = Model.setTimeZoneAU;
export const setTimeZoneUS = Model.setTimeZoneUS;
// #endregion

/* #region Alert function */
export function setListAlerts(listAlerts) {
	Model.setListAlerts(listAlerts);
}
export const getListAlerts = Model.getListAlerts;
/* #endregion */

export const setRealWindowHeight = Model.setRealWindowHeight;
export const getRealWindowHeight = Model.getRealWindowHeight;
export const setInAppStatus = Model.setInAppStatus;
export const getInAppStatus = Model.getInAppStatus;
