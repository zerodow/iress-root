import firebase from '~/firebase';
import Uuid from 'react-native-uuid';
import AsyncStorage from '~/manage/manageLocalStorage';
import * as Emitter from '@lib/vietnam-emitter';
import config from './config';
import loginUserType from './constants/login_user_type';
import ScreenId from './constants/screen_id';
import Enum from '../src/enum';
import * as PureFunc from './utils/pure_func';
import USER_PRICE_SOURCE_ENUM from './constants/user_price_source.json';
import PriceDisplay from './constants/price_display_type';
import * as Channel from './streaming/channel';
import I18n from './modules/language/';
import * as Controller from './memory/controller';
import AsyncStorages from '@react-native-community/async-storage';

const tableCheck = 'last_updated';
const USER_PRICE_SOURCE = Enum.USER_PRICE_SOURCE;
const PRICE_LIST_TAB_LABEL = Enum.PRICE_LIST_TAB_LABEL;
const TYPE_PRICEBOARD = Enum.TYPE_PRICEBOARD;
const WATCHLIST = Enum.WATCHLIST;
const THEME = Enum.THEME;

function displayNotification(notificationConfig) {
	firebase.notifications().displayNotification(notificationConfig);
}

export function getKey(path, key, callback, dispatch, prop) {
	const ref = firebase.database().ref(`${tableCheck}/${path}`);
	ref.once('value', function (snap) {
		const val = snap.val();
		callback(val, key, dispatch, prop);
	});
}

export const dataStorage = {
	biometryType: '',
	isLockBiometric: false,
	biometric: false,
	isLoggedInOkta: false,
	listRegion: [],
	isOkta: false,
	isFake: false,
	stepQuantity: 1,
	typeLotSize: null,
	deviceId: '',
	userAgent: '',
	clickedNoti: false,
	timeoutUserInfo: null,
	isChangeSetting: false,
	systemInfo: {},
	ordersTabIndex: 0,
	tooltip: {},
	summaryExpandStatus: false,
	refBottomTabBar: null,
	isChangeAccountFromDrawer: false,
	timeServer: 0,
	ordersActiveTab: 0,
	animationDirection: 'fadeIn',
	animationHoldings: 'fadeIn',
	animationSearch: 'fadeIn',
	animationOrders: 'fadeIn',
	navigatorGlobal: null,
	setTabActive: [],
	tabIndexSelected: 0,
	dicAccount: {},
	pNoti: true,
	maintain: { preState: null, currentState: null },
	startAppAfterLoadStore: null,
	dicNewsInday: {},
	dicNewsReaded: {},
	portfolioTab: null,
	getPerformancePortfolio: null,
	getHoldingPortfolio: null,
	getSummaryPortfolio: null,
	backNewOrder: false,
	idDefault: Uuid.v4(),
	dicListSymbolObject: {},
	dicIDForm: {},
	menuSelected: Enum.MENU_SELECTED.marketOverview,
	changeAccountFromOrder: false,
	lang: 'en',
	pinSetting: 0,
	pinSettingID: 0,
	homeScreen: 0,
	userPriceSource: 0,
	isUpdating: false,
	loginAsGuest: false,
	isGettingDataOnPersonal: false,
	showAlertChangePin: null,
	loadPersonalOnDidMount: false,
	formatLimitPrice: false,
	formatStopPrice: false,
	isNewOrderChangeTextInput: false,
	continueSearch: false,
	searchSymbol: null,
	guestRefreshTokenInterval: null,
	refreshTokenInterval: null,
	authenPinForAutoLogin: null,
	isShowNoAccount: true,
	isShowReviewAccount: true,
	isShowLockAccount: true,
	isByPassAuthen: false,
	isNotHaveAccount: false,
	listAccount: [],
	isDemo: false,
	isGettedUserInfo: false,
	isChangedCode: false,
	isChangeAccount: false,
	language: null,
	tradeTypeLogin: PriceDisplay.PERSONAL,
	tradeTypeNotLogin: PriceDisplay.SP20,
	isSignOut: false,
	numberFailEnterPin: 0,
	isLockTouchID: false,
	isSupportTouchID: false,
	isNotEnrolledTouchID: false,
	reAuthen: false,
	userPin: {},
	userInfo: {},
	mongoConnected: {},
	mongoCount: {},
	user_info: null,
	emailLogin: null,
	loginUserType: loginUserType.MEMBER,
	user_id: null,
	length_list: 15,
	is_login: false,
	is_logout: false,
	reloadAppAfterLogin: null,
	changeStateLogin: null,
	deviceTokenFcm: '',
	login_confirm_order: null,
	switchScreen: null,
	notifyObj: null,
	platform: null,
	startApp: null,
	checkUpdateApp: null,
	deviceModel: null,
	deviceBrand: null,
	databaseLocal: {},
	inactiveTime: null,
	tabWatchList: ScreenId.TRADE,
	tabTopPrice: 'topGainers',
	token: null,
	funcReload: {},
	priceSelectedLogin: 'Personal',
	priceSelectedNotLogin: 'S&P 20',
	cachingVersion: '',
	sound: null,
	vibrate: null,
	globalStore: null,
	watchListScreenId: ScreenId.TRADE,
	currentScreenId: ScreenId.OVERVIEW,
	currentScreenOrdersIdDetail: 'working',
	tabShowed: false,
	isNewOverview: false,
	cancelLoginPress: false,
	isLocked: true,
	callbackDownload: null,
	isGetTop: false,
	callbackAfterReconnect: null,
	list_news_unread: {},
	list_working_unread: [],
	list_filled_unread: [],
	list_cancelled_unread: [],
	list_stoploss_unread: [],
	symbolEquity: {},
	tabNews: 'relatedNews',
	listUserWatchlist: [],
	listPortfolio: {},
	disclaimerOncheck: null,
	disclaimerAccept: null,
	closeModalSignOut: null,
	closeDrawerSignOut: null,
	logId: 0,
	backNewsDetail: false,
	backContractNoteDetail: false,
	isSensitive: false,
	accountId: null,
	changeMenuSelected: null,
	backModify: false,
	backPlace: false,
	openOrdersFromMenu: false,
	ordersTab: null,
	ordersTabModify: null,
	tabPortfolio: 'summary',
	accessToken: null,
	refreshToken: null,
	currentAccount: {},
	loadData: null,
	getCashPortfolio: null,
	setNewPin: null,
	loginWithCustomToken: null,
	loginDefault: null,
	registerMessage: null,
	isOpenHistoryOrder: false,
	dicWorking: {},
	dicStoploss: {},
	dicFilled: {},
	dicCancelled: {},
	dicPortfolio: {},
	dicDataOrders: {},
	dicPersonal: {},
	dicPosition: {},
	dicRelatedSymbol: [],
	dicPersonalRegister: {},
	dicPersonalStatus: {},
	dicPersonalRealTimeCache: {},
	dicTotalPortfolio: {},
	dicOrderTransaction: {},
	dicCheckChange: {},
	dicShowLocalOrderNoti: {},
	dicRealtimeOrderDetailNoti: {},
	justModify: false,
	countOrderId: 0,
	listNewsToday: {},
	sseRegisters: {},
	typeRegisters: {},
	sseTimeoutID: {},
	unregisterMessage: null,
	openOrderFromMenu: false,
	intervalCache: null,
	setButtonWatchlist: null,
	dicLv1: {},
	dicOrdersRegister: {},
	dicOrdersRealTimeCache: {},
	dicOrdersRealTimeCacheSeq: {},
	dicPendingInsert: { symbol: {}, personal: {} },
	dicInsertDone: { symbol: {}, personal: {} },
	syncInterval: null,
	dicOrdersStatus: {},
	mongoConnection: {},
	dicWatchlist: {},
	currentPriceboardId: null,
	navigation: null,
	dismissAuthen: null,
	onAuthenticating: null,
	currentTheme: THEME.LIGHT,
	isLoadAnalys: false,
	isInitTabCos: true,
	isNeedSubSymbolOnNewOrder: true,
	functionSnapToClose: () => { },
	userPriceBoard: '',
	isReloading: true,
	loginSuccess: '',
	isShowError: true,
	isAuthenticated: true
};
const TIME_COMPARE_5 = 5 * 60 * 1000;
// const TIME_COMPARE_5 = 8 * 1000;
const TIME_COMPARE_15 = 15 * 50 * 1000;

export const func = {
	setBrokerName(brokerName = '') {
		const userId = Controller.getUserId()
		const key = `brokerName#${userId}`
		AsyncStorages.setItem(key, brokerName)
	},
	getBrokerName() {
		const userId = Controller.getUserId()
		const key = `brokerName#${userId}`
		return new Promise(resolve => {
			AsyncStorages.getItem(key).then(brokerName => {
				resolve(brokerName || '')
			}).catch(err => {
				resolve({})
			})
		})
	},
	setRegionSelected(region = {}) {
		const userId = Controller.getUserId()
		const key = `region#selected#${userId}`
		const data = JSON.stringify(region)
		AsyncStorages.setItem(key, data)
	},
	getRegionSelected() {
		const userId = Controller.getUserId()
		const key = `region#selected#${userId}`
		return new Promise(resolve => {
			AsyncStorages.getItem(key).then(region => {
				const result = JSON.parse(region)
				resolve(result)
			}).catch(err => {
				resolve({})
			})
		})
	},
	async clearRegionSelected() {
		const userId = Controller.getUserId()
		const key = `region#selected#${userId}`
		await AsyncStorages.removeItem(key)
	},
	setCurrentScreenId(screenId) {
		dataStorage.currentScreenId = screenId;
	},
	getSystemInfo() {
		return dataStorage.systemInfo;
	},
	setSystemInfo(systemInfo) {
		if (systemInfo) {
			dataStorage.systemInfo = systemInfo;
		}
	},
	setCurrentAccount(accountInfo) {
		if (!accountInfo || !accountInfo.account_id) return;
		dataStorage.currentAccount = accountInfo;
		dataStorage.accountId = accountInfo.account_id;
		Controller.setAccountId(accountInfo.account_id);
	},
	resetNotiData() {
		dataStorage.notifyObj = null;
	},
	setNavigatorGlobal({ index, navigator }) {
		if (dataStorage.tabIndexSelected === index) {
			dataStorage.navigatorGlobal = navigator;
		}
	},
	setTabActive(index) {
		dataStorage.tabIndexSelected = index;
		dataStorage.tooltip = {};
	},
	resetDicWatchlist() {
		dataStorage.dicWatchlist = {};
	},
	addToWatchList(res) {
		const objChanged = PureFunc.clone(res);
		if (
			!objChanged ||
			!objChanged.watchlist ||
			!PureFunc.arrayHasItem(objChanged.value)
		) {
			return null;
		}

		const priceBoardDetail = func.getPriceboardDetailInPriceBoard(
			objChanged.watchlist
		);
		if (!priceBoardDetail) {
			logDevice(
				'info',
				`(Add) Priceboard detail not exist, data: ${JSON.stringify(
					objChanged
				)}`
			);
			return;
		}

		priceBoardDetail.watchlist_name = objChanged.watchlist_name;
		priceBoardDetail.value = priceBoardDetail.value || [];
		priceBoardDetail.value.unshift(objChanged.value[0]);
		let currentTime = new Date().getTime();
		priceBoardDetail.value.map((item) => {
			item.rank = ++currentTime;
		});

		dataStorage.dicWatchlist[objChanged.watchlist] = PureFunc.clone(
			priceBoardDetail
		);
		const channelName = Channel.getChannelWatchlistChanged(
			objChanged.watchlist
		);
		Emitter.emit(channelName, priceBoardDetail);

		return priceBoardDetail;
	},
	removeInWatchList(res) {
		const objChanged = PureFunc.clone(res);
		if (
			!objChanged ||
			!objChanged.watchlist ||
			!PureFunc.arrayHasItem(objChanged.value)
		) {
			return null;
		}

		const priceBoardDetail = func.getPriceboardDetailInPriceBoard(
			objChanged.watchlist
		);
		if (
			!priceBoardDetail ||
			!PureFunc.arrayHasItem(priceBoardDetail.value)
		) {
			logDevice(
				'info',
				`(Remove) Priceboard detail not exist, data: ${JSON.stringify(
					priceBoardDetail
				)}`
			);
			return;
		}

		priceBoardDetail.watchlist_name = objChanged.watchlist_name;
		priceBoardDetail.value = priceBoardDetail.value || [];

		const newItem = objChanged.value[0];
		let index = -1;
		priceBoardDetail.value.map((element, i) => {
			if (newItem.symbol === element.symbol) index = i;
		});
		if (index === -1) {
			return null;
		} else {
			priceBoardDetail.value.splice(index, 1);
		}

		dataStorage.dicWatchlist[objChanged.watchlist] = PureFunc.clone(
			priceBoardDetail
		);
		const channelName = Channel.getChannelWatchlistChanged(
			objChanged.watchlist
		);
		Emitter.emit(channelName, priceBoardDetail);

		return priceBoardDetail;
	},
	resetPriceBoardWatchList(res) {
		if (!res || !res.watchlist || !res.watchlist_name) return null;

		const objChanged = PureFunc.clone({
			...res,
			value: res.value || []
		});
		objChanged.value.sort((a, b) => a.rank - b.rank);
		dataStorage.dicWatchlist[objChanged.watchlist] = PureFunc.clone(
			objChanged
		);

		const channelName = Channel.getChannelWatchlistChanged(
			objChanged.watchlist
		);
		Emitter.emit(channelName, objChanged);

		const channelUpdate = Channel.getChannelUpdatePriceboard();
		Emitter.emit(channelUpdate, objChanged);

		return objChanged;
	},
	addPriceboard(res) {
		if (!res || !res.watchlist || !res.watchlist_name) return null;

		const objChanged = PureFunc.clone({
			...res,
			value: res.value || []
		});
		objChanged.value.sort((a, b) => a.rank - b.rank);
		dataStorage.dicWatchlist[objChanged.watchlist] = PureFunc.clone(
			objChanged
		);

		const channelName = Channel.getChannelAddNewPriceboard();
		Emitter.emit(channelName, objChanged);

		return objChanged;
	},
	deletePriceboard(priceBoardId) {
		try {
			const oldPriceboard = func.getPriceboardDetailInPriceBoard(
				priceBoardId
			);
			delete dataStorage.dicWatchlist[priceBoardId];

			// Show notification
			if (func.getCurrentPriceboardId() === priceBoardId) {
				func.setCurrentPriceboardId(WATCHLIST.USER_WATCHLIST);

				const notificationConfig = {
					vibrate: Controller.getVibrate() ? 500 : 0,
					title: 'Deleted Watchlist',
					priority: 'high',
					show_in_foreground: true,
					badge: 0,
					body: `${oldPriceboard.watchlist_name} ${I18n.t(
						'notificationWhenDeleteCurrentWatchlist'
					)}`
				};
				if (Controller.getSound()) notificationConfig.sound = 'default';
				displayNotification(notificationConfig);
			}
			// Realtime
			const channelName = Channel.getChannelDeleteOldPriceboard();
			Emitter.emit(channelName, priceBoardId);
		} catch (error) {
			console.log('DCM deletePriceboard error', error);
		}
	},
	getSymbolInPriceBoard(priceboardId) {
		return dataStorage.dicWatchlist[priceboardId] &&
			dataStorage.dicWatchlist[priceboardId].value
			? PureFunc.clone(dataStorage.dicWatchlist[priceboardId].value)
			: null;
	},
	getCodeInPriceBoard(priceboardId) {
		const priceBoardDetail = dataStorage.dicWatchlist[priceboardId];
		return priceBoardDetail && priceBoardDetail.value
			? priceBoardDetail.value.map((item) => item.symbol)
			: null;
	},
	getPriceboardNameInPriceBoard(priceboardId) {
		const priceboardDetail = func.getPriceboardDetailInPriceBoard(
			priceboardId
		);
		const typePriceboard = func.getTypeOfCurrentPriceboard(priceboardId);

		switch (typePriceboard) {
			case TYPE_PRICEBOARD.US:
				return priceboardDetail.title || '';
			case TYPE_PRICEBOARD.FAVORITES:
			case TYPE_PRICEBOARD.AU:
			case TYPE_PRICEBOARD.PERSONAL:
				return priceboardDetail.watchlist_name || '';
			default:
				return '';
		}
	},
	getPriceboardDetailInPriceBoard(priceboardId) {
		const isStatic = func.checkCurrentPriceboardIsStatic(priceboardId);
		return isStatic
			? func.getPriceboardStaticById(priceboardId)
			: func.getPriceboardPersonalById(priceboardId);
	},
	getFavoritesPriceboard() {
		const {
			watchlist: priceboardId,
			watchlist_name: priceboardName
		} = func.getPriceboardDefault();
		if (dataStorage.dicWatchlist[priceboardId]) {
			return PureFunc.clone(dataStorage.dicWatchlist[priceboardId]);
		}

		const dicWatchlist = PureFunc.clone(dataStorage.dicWatchlist);
		const listWatchlist = PureFunc.getValueObject(dicWatchlist);
		return listWatchlist.find(
			(item) =>
				item &&
				item.watchlist_name &&
				item.watchlist_name.toUpperCase() ===
				priceboardName.toUpperCase()
		);
	},
	getDicSymbolOfPriceboard(priceboardId) {
		const priceboardDetail = func.getPriceboardDetailInPriceBoard(
			priceboardId
		);
		if (
			!priceboardDetail ||
			!PureFunc.arrayHasItem(priceboardDetail.value)
		) {
			return {};
		}
		const dicSymbol = {};
		priceboardDetail.value.map((item) => (dicSymbol[item.symbol] = item));
		return dicSymbol;
	},
	getDicSymbolOfPriceboardFavorites() {
		return func.getDicSymbolOfPriceboard(WATCHLIST.USER_WATCHLIST);
	},
	getPriceboardDefault() {
		return {
			watchlist: WATCHLIST.MOBILE_FAVOURITE,
			watchlist_name: PRICE_LIST_TAB_LABEL.FAVORITES
		};
	},
	getAllPersonalPriceboard() {
		const dicWatchlist = PureFunc.clone(dataStorage.dicWatchlist);
		return (
			PureFunc.getValueObject(dicWatchlist).filter(
				(item) => item.watchlist !== WATCHLIST.USER_WATCHLIST
			) || null
		);
	},
	setCurrentPriceboardId(priceboardId, notEmit = false) {
		if (dataStorage.currentPriceboardId === priceboardId) return;
		dataStorage.currentPriceboardId = priceboardId;
		!notEmit &&
			Emitter.emit(Channel.getChannelSelectedPriceboard(), priceboardId);
		priceboardId &&
			func.storeLastestPriceBoard(dataStorage.user_id, priceboardId);
	},
	getCurrentPriceboardId() {
		return dataStorage.currentPriceboardId;
	},
	isCurrentPriceboardFavorites() {
		return func.getCurrentPriceboardId() === WATCHLIST.USER_WATCHLIST;
	},
	isCurrentPriceboardTopValue() {
		return func.getCurrentPriceboardId() === WATCHLIST.TOP_VALUE;
	},
	checkSymbolInPriceboardFavorites(symbol) {
		return func.checkSymbolInPriceboard(WATCHLIST.USER_WATCHLIST, symbol);
	},
	checkSymbolInPriceboard(priceBoardId, symbol) {
		const priceboardDetail = func.getPriceboardDetailInPriceBoard(
			priceBoardId
		);
		return priceboardDetail && priceboardDetail.value
			? priceboardDetail.value.find((item) => item.symbol === symbol) !=
			null
			: false;
	},
	getTypeOfCurrentPriceboard(
		currentPriceboardId = func.getCurrentPriceboardId()
	) {
		const listPriceboardAu = func.getAllPriceboardAu();
		const listPriceboardUs = func.getAllPriceboardUs();
		if (currentPriceboardId === WATCHLIST.USER_WATCHLIST) {
			return TYPE_PRICEBOARD.FAVORITES;
		}
		if (
			listPriceboardAu.find(
				(item) => item.watchlist === currentPriceboardId
			)
		) {
			return TYPE_PRICEBOARD.AU;
		}
		if (
			listPriceboardUs.find(
				(item) => item.watchlist === currentPriceboardId
			)
		) {
			return TYPE_PRICEBOARD.US;
		}
		return TYPE_PRICEBOARD.PERSONAL;
	},
	getReccentAccount() {
		const userId = dataStorage.emailLogin;
		const key = `account_reccent#${userId}`;
		return new Promise((resolve) => {
			AsyncStorage.getItem(key)
				.then((listAccount) => {
					const result = JSON.parse(listAccount);
					resolve(result || []);
				})
				.catch((err) => {
					console.log('getLastestPriceBoard error', err);
					resolve([]);
				});
		});
	},
	clearRecentAccount() {
		const userId = dataStorage.emailLogin;
		const key = `account_reccent#${userId}`;
		const data = JSON.stringify([]);
		AsyncStorage.setItem(key, data);
	},
	setReccentAccount(accountObj = {}) {
		const userId = dataStorage.emailLogin;
		const key = `account_reccent#${userId}`;
		AsyncStorage.getItem(key)
			.then((listAccount) => {
				let newAccount = JSON.parse(listAccount);
				const index = newAccount.findIndex((el) => {
					return el.portfolio_id === accountObj.portfolio_id;
				});
				if (index !== -1) {
					const tmp = [newAccount[index]];
					const tmp2 = newAccount.filter(
						(el) => el.portfolio_id !== accountObj.portfolio_id
					);
					let result = [...tmp, ...tmp2];
					result = result.slice(0, 10);
					AsyncStorage.setItem(key, JSON.stringify(result));
					return;
				}
				newAccount = [accountObj, ...newAccount].slice(0, 10);
				newAccount = JSON.stringify(newAccount);
				AsyncStorage.setItem(key, newAccount);
			})
			.catch((err) => {
				const newAccount = JSON.stringify([accountObj].slice(0, 10));
				AsyncStorage.setItem(key, newAccount)
					.then((data) => { })
					.catch((error) => { });
				console.log('getLastestPriceBoard error', err);
			});
	},
	getReccentSearchSymbol() {
		const userId = dataStorage.emailLogin;
		const key = `search_symbol_reccent#${userId}`;
		return new Promise((resolve) => {
			AsyncStorage.getItem(key)
				.then((listSymbol) => {
					const result = JSON.parse(listSymbol);
					resolve(result || []);
				})
				.catch((err) => {
					console.log('getLastestPriceBoard error', err);
					resolve([]);
				});
		});
	},
	clearRecentSearchSymbol() {
		const userId = dataStorage.emailLogin;
		const key = `search_symbol_reccent#${userId}`;
		const data = JSON.stringify([]);
		AsyncStorage.setItem(key, data);
	},
	setReccentSearchSymbol(symbolObj = {}) {
		const userId = dataStorage.emailLogin;
		const key = `search_symbol_reccent#${userId}`;
		AsyncStorage.getItem(key)
			.then((listSymbol) => {
				let newSymbol = JSON.parse(listSymbol);
				const index = newSymbol.findIndex((el) => {
					return (
						el.symbol === symbolObj.symbol &&
						el.exchanges[0] === symbolObj.exchanges[0]
					);
				});
				if (index !== -1) {
					// Neu ton tai
					const tmp = [newSymbol[index]];
					const tmp2 = newSymbol.filter(
						(el) =>
							el.symbol !== symbolObj.symbol ||
							el.exchanges[0] !== symbolObj.exchanges[0]
					);
					let result = [...tmp, ...tmp2];
					result = result.slice(0, 10);
					AsyncStorage.setItem(key, JSON.stringify(result));
					return;
				}
				newSymbol = [symbolObj, ...newSymbol].slice(0, 10);

				newSymbol = JSON.stringify(newSymbol);
				AsyncStorage.setItem(key, newSymbol);
			})
			.catch((err) => {
				// return
				const newSymbols = JSON.stringify([symbolObj]);
				AsyncStorage.setItem(key, newSymbols)
					.then((data) => { })
					.catch((error) => { });
			});
	},
	getLastestPriceBoard(userId) {
		return new Promise((resolve) => {
			const key = `${userId}##PriceBoard`;
			AsyncStorage.getItem(key)
				.then((lastestPriceBoard) => resolve(lastestPriceBoard))
				.catch((err) => {
					console.log('getLastestPriceBoard error', err);
					resolve(WATCHLIST.USER_WATCHLIST);
				});
		});
	},
	storeLastestPriceBoard(userId, priceBoardId) {
		const key = `${userId}##PriceBoard`;
		return AsyncStorage.setItem(key, priceBoardId);
	},
	setAccountId(accId) {
		dataStorage.accountId = accId;
		Controller.setAccountId(accId);
	},
	getAllPriceboardAu() {
		return PureFunc.clone(Enum.LIST_PRICE_OBJECT_AU);
	},
	getAllPriceboardUs() {
		return PureFunc.clone(Enum.LIST_PRICE_OBJECT_US);
	},
	getAllPriceboardStatic() {
		return PureFunc.clone(Enum.LIST_PRICE_OBJECT);
	},
	checkCurrentPriceboardIsStatic(
		priceboardId = func.getCurrentPriceboardId()
	) {
		if (!priceboardId) return true;

		const listPriceboardStatic = func.getAllPriceboardStatic();
		return (
			listPriceboardStatic.find(
				(item) => item.watchlist === priceboardId
			) != null
		);
	},
	getPriceboardStaticById(priceboardId) {
		const listPriceboardStatic = PureFunc.clone(Enum.LIST_PRICE_OBJECT);
		return listPriceboardStatic.find(
			(item) => item.watchlist === priceboardId
		);
	},
	getPriceboardPersonalById(priceboardId) {
		return dataStorage.dicWatchlist[priceboardId]
			? PureFunc.clone(dataStorage.dicWatchlist[priceboardId])
			: {};
	},
	checkPriceboardPersonalExist(priceboardId) {
		return dataStorage.dicWatchlist[priceboardId] != null;
	},
	setDicIDForm(name, ID_FORM) {
		dataStorage.dicIDForm[name] = ID_FORM;
	},
	setDicListSymbolObject(name, listSymbolObject) {
		dataStorage.dicListSymbolObject[name] = [...listSymbolObject];
	},
	getIDForm(name) {
		return dataStorage.dicIDForm[name];
	},
	getListSymbolObject(name) {
		return dataStorage.dicListSymbolObject[name];
	},
	setWatchlistIDForm() { },
	getDisplayAccount() {
		if (!dataStorage.currentAccount) return ``;
		return `${dataStorage.currentAccount.account_name || ''} (${dataStorage.currentAccount.account_id || ''
			})`;
	},
	setSymbols(data) {
		dataStorage.symbolEquity = data;
	},
	addNewsToday() {
		console.log('a');
	},
	addSymbol(data = {}, forceUpdate = false) {
		const { symbol, exchanges } = data;
		const exchange = exchanges && exchanges[0] ? exchanges[0] : '';
		if (
			(data &&
				symbol &&
				!dataStorage.symbolEquity[`${symbol}#${exchange}`]) ||
			forceUpdate
		) {
			dataStorage.symbolEquity[`${symbol}#${exchange}`] = data;
		}
	},
	setFuncReload(type, callback) {
		dataStorage.funcReload[type] = callback;
	},
	getFuncReload(type) {
		return dataStorage.funcReload[type];
	},
	setHomeScreen(tabSelected = {}, forceUpdate = true) {
		dataStorage.homeScreen = tabSelected.id || 0;
		forceUpdate &&
			(dataStorage.tabIndexSelected = tabSelected.tabIndex || 0);
	},
	setMenuSelected(homeScreen) {
		switch (homeScreen) {
			case 0:
			case 1:
				dataStorage.menuSelected = Enum.MENU_SELECTED.portfolio;
				break;
			default:
				dataStorage.menuSelected = Enum.MENU_SELECTED.marketOverview;
				break;
		}
	},
	setPinSetting(pinSetting) {
		dataStorage.pinSetting = pinSetting;
	},
	setPinSettingSession(pinSetting) {
		dataStorage.pinSettingID = pinSetting;
	},
	getUserPriceSource() {
		const mkDataType = Controller.getMarketDataType();
		if (
			Controller.getLoginStatus() &&
			dataStorage.loginUserType !== 'REVIEW' &&
			mkDataType !== Enum.PRICE_SOURCE.delayed
		) {
			return '3'; // C2R
		} else {
			return '2'; // Delay
		}
	},
	isPriceStreaming() {
		const streaming = USER_PRICE_SOURCE_ENUM[3].id;
		const mkDataType = Controller.getMarketDataType();

		return mkDataType === streaming;
	},
	setInactiveTime() {
		const dateTime = new Date();
		if (!dateTime || !dateTime.getTime) {
			dataStorage.inactiveTime = null;
		} else {
			if (!dataStorage.inactiveTime) {
				dataStorage.inactiveTime = dateTime.getTime();
			}
		}
	},
	getToken() {
		return dataStorage.token;
	},
	isAccountActive() {
		const status =
			(dataStorage.currentAccount && dataStorage.currentAccount.state) ||
			(dataStorage.currentAccount && dataStorage.currentAccount.status);
		return status !== 'inactive';
	},

	getDiffTimeBackground() {
		// Mặc định yêu cầu xác thực lại sau 5 phút
		let timeCompare = TIME_COMPARE_5;
		if (dataStorage.pinSetting === 2) {
			// Yêu cầu xác thực lại pin sau 15 phút
			timeCompare = TIME_COMPARE_15;
		}
		const dateTime = new Date();
		let activeTime = null;
		if (!dateTime || !dateTime.getTime) {
			activeTime = null;
		} else {
			activeTime = dateTime.getTime();
		}
		if (!dataStorage.inactiveTime) {
			dataStorage.inactiveTime = null;
			return false;
		}
		if (!activeTime) {
			dataStorage.inactiveTime = null;
			return false;
		}
		const diff = activeTime - dataStorage.inactiveTime;
		if (diff < timeCompare) {
			dataStorage.inactiveTime = null;
			return false;
		}
		dataStorage.inactiveTime = null;
		dataStorage.login_confirm_order = false;
		return true;
	},
	setLoginConfig(isLogin) {
		dataStorage.login_confirm_order = isLogin;
	},
	getLoginConfig() {
		return dataStorage.login_confirm_order;
	},

	getLoginUserType() {
		const user = Controller.getUserInfo();
		let email = '';
		if (user) {
			email = user.email;
		}
		switch (email) {
			case '':
				return loginUserType.NONE;
			case config.username:
				return loginUserType.GUEST;
			case config.reviewAccount.usernameDefault:
				return loginUserType.REVIEW;
			default:
				return loginUserType.MEMBER;
		}
	},
	setLoginUserType() {
		dataStorage.loginUserType = func.getLoginUserType();
	},

	getUserId() {
		const user = Controller.getUserInfo();
		if (!user) return '';
		return user.uid || user.user_id || '';
	},

	getUserLoginId() {
		const user = Controller.getUserInfo();
		if (!user) return '';
		return user.user_login_id || '';
	},

	isDefaultUser() {
		const user = Controller.getUserInfo();
		if (!user) return false;
		return user.email === config.username;
	},
	setPriceSelected(selected) {
		if (Controller.getLoginStatus()) {
			dataStorage.priceSelectedLogin = selected;
		} else {
			dataStorage.priceSelectedNotLogin = selected;
		}
	},
	setDataStorage(key, data, callback, dispatch) {
		dataStorage.databaseLocal[key] = data;
		if (callback) {
			callback(key, dispatch);
		}
	},
	getDataStorage(key) {
		return dataStorage.databaseLocal[key];
	},
	getSymbolEquity(symbol) {
		if (!dataStorage.databaseLocal) return null;
		const symbolEquity = dataStorage.databaseLocal[`symbol_equity`];
		if (!symbolEquity) return null;
		return symbolEquity[symbol];
	},
	getAccountId(accountId) {
		if (accountId) return (accountId + '').replace('[Demo]', '');
		return accountId;
	},
	getExchangeSymbol(symbol) {
		return dataStorage.symbolEquity[symbol] &&
			dataStorage.symbolEquity[symbol].exchanges
			? dataStorage.symbolEquity[symbol].exchanges[0]
			: null;
	},
	getListExchangeSymbol(symbol) {
		const symbolObj = func.getSymbolObj(symbol);
		return symbolObj.exchanges || [];
	},
	getSymbolObj(symbol) {
		return dataStorage.symbolEquity && dataStorage.symbolEquity[symbol]
			? PureFunc.clone(dataStorage.symbolEquity[symbol])
			: {};
	},
	getHaltSymbol(symbol) {
		const symbolObj = func.getSymbolObj(symbol);
		return symbolObj.trading_halt === 1;
	},
	getCompanyName(symbol) {
		const symbolObj = func.getSymbolObj(symbol);
		return symbolObj
			? symbolObj.company_name || symbolObj.company || ''
			: '';
	},
	getDisplayNameSymbol(symbol) {
		return dataStorage.symbolEquity[symbol] &&
			dataStorage.symbolEquity[symbol].display_name
			? dataStorage.symbolEquity[symbol].display_name
			: '';
	},
	checkNewsToday(symbol) {
		if (!dataStorage.listNewsToday[symbol]) return false;
		return dataStorage.listNewsToday[symbol];
	},
	setBackNewOrderStatus(status) {
		dataStorage.backNewOrder = status;
	},
	resetTradeTypeLogin() {
		dataStorage.tradeTypeLogin = PriceDisplay.PERSONAL;
	},
	resetTradeTypeNotLogin() {
		dataStorage.tradeTypeNotLogin = PriceDisplay.SP20;
	},
	clearDicRelatedSymbol() {
		dataStorage.dicRelatedSymbol = [];
	},
	resetSelectedPriceBoard() {
		dataStorage.priceSelectedLogin = 'Personal';
		dataStorage.priceSelectedNotLogin = 'S&P 20';
	},
	setUpdateAfterChangeAppState(status) {
		dataStorage.tabShowed = status;
	},
	getUpdateAfterChangeAppState() {
		return dataStorage.tabShowed;
	},
	setIsShowDetailWatchList(isShowDetailWatchList) {
		dataStorage.isShowDetailWatchList = isShowDetailWatchList;
	},
	getIsShowDetailWatchList() {
		return dataStorage.isShowDetailWatchList;
	},
	async setStoragePriceBoard(watchlist) {
		await AsyncStorage.setItem('idFavorites', watchlist);
	},
	async getStoragePriceBoard() {
		try {
			const value = await AsyncStorage.getItem('idFavorites');
			if (value !== null) {
				return value;
			} else {
				return null;
			}
		} catch (error) {
			return null;
		}
	},
	async clearStoragePriceBoard() {
		AsyncStorage.clear();
	},
	setCacheLoginSuccess(isLogin = false) {
		const key = 'loginSuccess'
		AsyncStorages.setItem(key, JSON.stringify(isLogin))
	},
	getCacheLoginSuccess() {
		const key = 'loginSuccess'
		return new Promise(resolve => {
			AsyncStorages.getItem(key).then(res => {
				console.info('loginSuccess', res)
				if (res === null) {
					resolve(false)
				} else {
					resolve(res)
				}
			}).catch(err => {
				resolve(false)
			})
		})
	},
	async clearCacheLoginSuccess() {
		const key = 'loginSuccess'
		await AsyncStorage.removeItem(key)
	},
	setCacheNotification(notiAlert = false) {
		const key = 'setting_notification'
		const value = `${notiAlert}`; // string true or false
		AsyncStorages.setItem(key, value)
	},
	getCacheNotification() {
		const key = 'setting_notification'
		return new Promise(resolve => {
			AsyncStorages.getItem(key).then(res => {
				const isShowNotification = (res === 'true');
				resolve(isShowNotification)
			}).catch(err => {
				resolve(false)
			})
		})
	},
	async clearCacheNotification() {
		const key = 'setting_notification'
		await AsyncStorage.removeItem(key)
	},
	setFirstEnableNotification(enable) {
		const key = 'first_enable_notification'
		const value = `${enable}`; // string true or false
		AsyncStorages.setItem(key, value)
	},
	getFirstEnableNotification() {
		const key = 'first_enable_notification'
		return new Promise(resolve => {
			AsyncStorages.getItem(key).then(res => {
				const enable = (res === 'true');
				console.info('enable', enable)
				resolve(enable)
			}).catch(err => {
				resolve(false)
			})
		})
	},
	setAutoOktaLogin(enable = true) {
		const key = 'auto_okta_login'
		const value = `${enable}`; // string true or false
		AsyncStorages.setItem(key, value)
	},
	getAutoOktaLogin() {
		const key = 'auto_okta_login'
		return new Promise(resolve => {
			AsyncStorages.getItem(key).then(res => {
				const enable = (res === 'true');
				resolve(enable)
			}).catch(err => {
				resolve(false)
			})
		})
	}
};
