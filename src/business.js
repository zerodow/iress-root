import * as Emitter from '@lib/vietnam-emitter';
import Enum from './enum';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import * as Util from './util';
import config from '~/config';
import * as Translate from './invert_translate';
import {
	Platform,
	PermissionsAndroid,
	StatusBar,
	Keyboard,
	AsyncStorage
} from 'react-native';
import * as TextTest from '~/textTest';
import OrdType from './constants/order_type';
import {
	logDevice as LogDevice,
	formatNumberNew2 as FormatNumber2,
	formatNumber as FormatNumber,
	checkAndAddToDic,
	refreshToken,
	showLocalNotification,
	subcribleChannel,
	unRegisterReceiverNoti
} from './lib/base/functionUtil';
import * as Operator from './operator';
import {
	dataStorage as DataStorage,
	func,
	func as FuncStorage
} from './storage';
import I18n from './modules/language';
import { iconsMap as IconsMap } from './utils/AppIcons';
import OrderConditionString from './constants/order_condition_string';
import * as Api from './api';
import * as Lv1 from './streaming/lv1';
import * as StreamingBusiness from './streaming/streaming_business';
import * as News from './streaming/news';
import ORDER_ENUM from '../src/constants/order_enum';
import ORDER_STATE_ENUM from '../src/constants/order_state_enum';
import NotiType from '../src/constants/noti_type';
import Time from './constants/time';
import * as Controller from './memory/controller';
import * as RoleUser from './roleUser';
import * as sseStreaming from './streaming';
import * as Cache from './cache';
import * as settingActions from '~/screens/setting/setting.actions';
import firebase from './firebase';
import filterType from './constants/filter_type';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import DeviceInfo from 'react-native-device-info';
import orderTypeString from '../src/constants/order_type_string';
import orderTypeEnum from '~/constants/order_type';
import exchangePriority from '~/constants/list_exchange_priority';
import { Navigation } from 'react-native-navigation';
import SETTING_TYPE from '~/constants/setting_type';
import HOME_SCREEN from '~/constants/home_screen.json';
import VietNamQueue from '@lib/vietnam-queue';
import { getAccountListByAccountIdAndStatus } from '~/elastic_search/dao/account_list/index';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import {
	Channel as ChannelKeyboard,
	TYPE_SHOW
} from '~/component/virtual_keyboard/Keyboard.js';
import DataStore from 'react-native-local-mongodb';
import { login } from '~s/login/login.actions';
import {
	getChannelShowConfirmPlaceButton,
	getChannelHideConfirmPlaceButton,
	getChannelChangeOrderError
} from '~/streaming/channel';
import {
	setCacheNotification,
	getCacheNotification,
	getUnSubTopic
} from '~/screens/alertLog/Model/AlertLogModel';
import {
	registerNotification,
	unRegisterNotification
} from '~/screens/alertLog/Controller/AlertController';
// import { setRegionSelected } from '~s/home/Model/LoginModel';
// import { oktaCreateConfig } from '~/manage/manageOktaAuth';
// import durationString from './constants/durationString';
// import destinationString from './constants/destinationString';

const numberInterval = 300;
const timeInterval = 2 * 1000;
let currentIndexInterval = 0;
let interval = null;
const {
	PRICE_DECIMAL,
	THEME,
	ORDER_STATUS_STRING,
	EXCHANGE_CLASS,
	PRICEBOARD_STATIC_ID,
	SUB_ENVIRONMENT,
	TAG_SYMBOL_CLASS,
	MAPPING_COUNTRY_CODE,
	LOCATION,
	ENVIRONMENT
} = Enum;
const NotiInAppQueue = new VietNamQueue();
const NotiQueue = new VietNamQueue();

// const JSON = Util.json;
const EXCHANGE = Enum.EXCHANGE;
const CURRENCY = Enum.CURRENCY;
const STATUS = Enum.STATUS_ORD;
const ACTION = Enum.ACTION_ORD;
const TRAILING_TYPE = Enum.TRAILING_TYPE;
const SIDE = Enum.SIDE;
const DURATION_STRING = Enum.DURATION_STRING;
const FEE = Enum.FEE;
const FLAG = Enum.FLAG;
const ORDER_TYPE_STRING = Enum.ORDER_TYPE_STRING;
const TITLE_NOTI = Enum.TITLE_NOTI;
const ICON_NAME = Enum.ICON_NAME;
const EXCHANGE_STRING_CODE = Enum.EXCHANGE_STRING_CODE;
const EXCHANGE_CODE_STRING = Enum.EXCHANGE_CODE_STRING;
const EXCHANGE_STRING = Enum.EXCHANGE_STRING;
const EXCHANGE_CODE = Enum.EXCHANGE_CODE;
const DURATION_CODE = Enum.DURATION_CODE;
const ORDER_TYPE_SYSTEM = Enum.ORDER_TYPE_SYSTEM;
const ORDER_TYPE_ORIGIN_UPPER = Enum.ORDER_TYPE_ORIGIN_UPPER;
const NOTE_STATE = Enum.NOTE_STATE;
const WATCHLIST = Enum.WATCHLIST;
const NAV_BTN_ID = Enum.NAV_BTN_ID;
const { SYMBOL_CLASS, SYMBOL_CLASS_QUERY } = Enum;
const { EXCHANGE_DETAIL } = Enum;

const LIST_DURATION_GDGFI = [
	DURATION_CODE.GTC,
	DURATION_CODE.DAY,
	DURATION_CODE.GTD,
	DURATION_CODE.FOK,
	DURATION_CODE.IOC
];

const LIST_DURATION_GDFI = [
	DURATION_CODE.GTC,
	DURATION_CODE.DAY,
	DURATION_CODE.FOK,
	DURATION_CODE.IOC
];

const LIST_DURATION_GDGI = [
	DURATION_CODE.GTC,
	DURATION_CODE.DAY,
	DURATION_CODE.GTD,
	DURATION_CODE.IOC
];

const LIST_DURATION_ONLY_GTC = [DURATION_CODE.GTC];

const LIST_DURATION_DIF = [
	DURATION_CODE.DAY,
	DURATION_CODE.IOC,
	DURATION_CODE.FOK
];

const LIST_DURATION_GDI = [
	DURATION_CODE.GTC,
	DURATION_CODE.DAY,
	DURATION_CODE.IOC
];

const LIST_DURATION_GDG = [
	DURATION_CODE.GTC,
	DURATION_CODE.DAY,
	DURATION_CODE.GTD
];

const LIST_DURATION_GDF = [
	DURATION_CODE.GTC,
	DURATION_CODE.DAY,
	DURATION_CODE.FOK
];
const LIST_DURATION_DGGF = [
	DURATION_CODE.DAY,
	DURATION_CODE.GTC,
	DURATION_CODE.GTD,
	DURATION_CODE.FOK
];
const LIST_DURATION_DI = [DURATION_CODE.DAY, DURATION_CODE.IOC];

const LIMIT_MKT = [orderTypeString.LIMIT, orderTypeString.MARKETTOLIMIT];

const MKT_LIMIT = [orderTypeString.LIMIT, orderTypeString.MARKETTOLIMIT];

const LIMIT_MKT_STOPLOSS = [
	orderTypeString.LIMIT,
	orderTypeString.MARKETTOLIMIT,
	orderTypeString.STOPLOSS
];

export function checkTriggered(data = {}) {
	try {
		const { passed_state: passedState } = data;
		if (!passedState) return false;
		const triggered = passedState.includes('TRIGGERED');
		return triggered;
	} catch (error) {
		return false;
	}
}

export function checkTriggeredOrParent(data = {}) {
	try {
		const { passed_state: passedState, child_field: isHasChild } = data;
		if (isHasChild) return true;
		if (!passedState) return false;
		const triggered = passedState.includes('TRIGGERED');
		return triggered;
	} catch (error) {
		return false;
	}
}

export function fakeSQLFullAsyncStorage() {
	const { text1MB: text } = TextTest;
	interval = setInterval(() => {
		if (currentIndexInterval === numberInterval) {
			return interval && clearInterval(interval);
		}
		const key = `text${currentIndexInterval + 1}`;
		AsyncStorage.setItem(key, text)
			.then(() => {
				console.log('fakeSQLFull SUCCESS', key);
			})
			.catch((err) => {
				console.log('fakeSQLFull ERROR', err);
			});
		currentIndexInterval++;
	}, timeInterval);
}

export function resetVariableEquixWarning() {
	DataStorage.disableShowMarketDataAlert = false;
	DataStorage.showMarketDataAlert = false;
	DataStorage.isGoApp = false;
}

export function logoutIress() {
	const url = Api.getUrlLogoutIress();
	Api.postData(url, {})
		.then((res) => {
			console.info('logoutIress res', res);
		})
		.catch((err) => {
			console.info('logoutIress err', err);
		});
}

export function fakeSQLFullMongoDB() {
	const { text1MB: text } = TextTest;
	interval = setInterval(() => {
		if (currentIndexInterval === numberInterval) {
			return interval && clearInterval(interval);
		}
		const fileName = `text${currentIndexInterval + 1}`;
		const data = {
			text
		};
		const mongoDB = new DataStore({ fileName, autoload: true });
		mongoDB.insert(data, (err, newDoc) => {
			console.log('fakeSQLFullMongoDB', fileName, err, newDoc);
		});
		currentIndexInterval++;
	}, timeInterval);
}

export function checkDisableWhatsNew() {
	if (
		config.subEnvironment === SUB_ENVIRONMENT.PRODUCT ||
		config.subEnvironment === SUB_ENVIRONMENT.NEXT
	) {
		return false;
	}
	return true;
}

function convertExchange(listExchangeCode) {
	const listExchange = [];
	const dicExchange = {};
	listExchangeCode.map((e) => {
		const label =
			EXCHANGE_DETAIL[e] &&
			EXCHANGE_DETAIL[e].displayExchange &&
			I18n.t(EXCHANGE_DETAIL[e].displayExchange);
		listExchange.push({ value: e, label });
		dicExchange[e] = label;
	});
	return {
		listExchange,
		dicExchange
	};
}

const LIST_EXCHANGE_BAACCQ = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX,
	EXCHANGE_CODE.ASXCP,
	EXCHANGE_CODE.CXA,
	EXCHANGE_CODE.CXACP,
	EXCHANGE_CODE.qCXA
]);

const LIST_EXCHANGE_BAACQ = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX,
	EXCHANGE_CODE.ASXCP,
	EXCHANGE_CODE.CXA,
	EXCHANGE_CODE.qCXA
]);

const LIST_EXCHANGE_BAAC = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX,
	EXCHANGE_CODE.ASXCP,
	EXCHANGE_CODE.CXA
]);

const LIST_EXCHANGE_BAA = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX,
	EXCHANGE_CODE.ASXCP
]);

const LIST_EXCHANGE_BAC = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX,
	EXCHANGE_CODE.CXA
]);

const LIST_EXCHANGE_BA = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX
]);

const LIST_EXCHANGE_BACQ = convertExchange([
	EXCHANGE_CODE.BESTMKT,
	EXCHANGE_CODE.ASX,
	EXCHANGE_CODE.CXA,
	EXCHANGE_CODE.qCXA
]);

const LIST_EXCHANGE_ONLY_ASX = convertExchange([EXCHANGE_CODE.ASX]);

const LIST_EXCHANGE_ONLY_AXW = convertExchange([EXCHANGE_CODE.AXW]);

const LIST_EXCHANGE_AC = convertExchange([
	EXCHANGE_CODE.AXW,
	EXCHANGE_CODE.CXA
]);

const LIST_EXCHANGE_ONLY_FIXED_CO = convertExchange([EXCHANGE_CODE.FIXED_CO]);

const LIST_EXCHANGE_ONLY_CXA = convertExchange([EXCHANGE_CODE.CXA]);

const LIST_EXCHANGE_ONLY_NSX = convertExchange([EXCHANGE_CODE.NSX_NSX]);

export const NAV_BTN = {
	BROWSER: {
		icon: IconsMap['ios-browsers-outline'],
		id: NAV_BTN_ID.BROWSERS,
		testID: NAV_BTN_ID.BROWSERS
	},
	ADD: {
		icon: IconsMap['ios-create-outline'],
		title: 'Add',
		id: NAV_BTN_ID.CREATE
	},
	REFRESH: {
		icon: IconsMap['ios-refresh-outline'],
		title: 'Refresh',
		id: NAV_BTN_ID.REFRESH,
		testID: NAV_BTN_ID.REFRESH
	},
	REFRESHING: {
		id: NAV_BTN_ID.REFRESHING,
		component: 'equix.CustomButtonWatchlist'
	}
};

export function setStatusBarBackgroundColor({ backgroundColor } = {}) {
	if (Platform.OS === 'ios') return;
	const themeColorStorage = Controller.getThemeColorFromStorage();
	let newBackgroundColor =
		themeColorStorage === THEME.LIGHT ? 'rgba(0,0,0,0.4)' : '#1e1e1e';
	if (backgroundColor) {
		newBackgroundColor = backgroundColor;
	}
	StatusBar.setBackgroundColor &&
		StatusBar.setBackgroundColor(newBackgroundColor);
}

export function checkDurationAddLastBar(duration) {
	return (
		duration === Enum.PRICE_FILL_TYPE._3M ||
		duration === Enum.PRICE_FILL_TYPE._6M ||
		duration === Enum.PRICE_FILL_TYPE._YTD ||
		duration === Enum.PRICE_FILL_TYPE._1Y
	);
}

export function requestAndroidPermission(
	listPermissions = [
		PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
		PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
	]
) {
	return new Promise(async (resolve) => {
		if (Platform.OS === 'ios') return resolve(true);
		const granted = await PermissionsAndroid.requestMultiple(
			listPermissions
		);
		let isFullPermission = true;
		for (const key in granted) {
			const val = granted[key];
			if (val !== 'granted') {
				isFullPermission = false;
				break;
			}
		}
		resolve(isFullPermission);
	});
}

export function getChannelUpdateResetPasswordType() {
	return `reset_password`;
}

export function getAccountName(accountID) {
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

export function getOrdConfirm(status, action, err) {
	try {
		const obj = Util.cloneFn(Enum.CONFIRM_ORD[action][status]);
		const objTxt = I18n.t(obj.txt);
		obj.txt = objTxt;
		if (err && obj) obj.txt = err;
		return obj;
	} catch (error) {
		LogDevice(
			`error`,
			`Get order comfirm error ${status}, ${action}, ${err} with error: ${JSON.stringify(
				error
			)}`
		);
		return null;
	}
}

export function getNavigatorPortfolio() {
	try {
		const currentAccountInfo = Controller.getCurrentAccount() || {};
		const accountName = currentAccountInfo.account_name || '';
		const accountId = currentAccountInfo.account_id
			? `(${currentAccountInfo.account_id})`
			: '';
		return {
			title: I18n.t('portfolio'),
			subtitle: accountId ? `${accountName} ${accountId}` : null
		};
	} catch (error) {
		LogDevice(
			`error`,
			`getNavigatorPortfolio error : ${JSON.stringify(error)}`
		);
		return {};
	}
}

export function getObjectSymbol(code, exchange) {
	if (exchange) {
		return DataStorage.symbolEquity[`${code}#${exchange}`] || {};
	}
	return DataStorage.symbolEquity[code] || {};
}

export function getExchangeCodeByExchangeString(exchangeString = '') {
	return EXCHANGE_[exchangeString] || '';
}

export function getExchangeStringParitech(exchange) {
	return EXCHANGE_CODE_STRING[exchange];
}

export function getExchangeStringSaxo(symbolObj = {}) {
	return symbolObj.display_exchange || '';
}

export function getExchangeString(
	symbolObj = {},
	duration = '',
	exchange = ''
) {
	return isParitech(symbolObj.symbol, symbolObj)
		? getExchangeStringParitech(exchange)
		: getExchangeStringSaxo(symbolObj);
}

export function getExchangeName(tradingMarket, exchange) {
	if (!tradingMarket) return '--';
	const exchangeDetail = Enum.EXCHANGE_DETAIL;
	const displayExchange =
		exchangeDetail[tradingMarket] &&
		exchangeDetail[tradingMarket].displayExchange
			? exchangeDetail[tradingMarket].displayExchange
			: null;
	return displayExchange ? I18n.t(displayExchange) : exchange || '--';
}

export function isValidObjectFees({
	orderType,
	volume,
	duration,
	exchange,
	code,
	accountId,
	isBuy,
	limitPrice,
	stopPrice
}) {
	if (
		!volume ||
		!orderType ||
		!duration ||
		!exchange ||
		!code ||
		!accountId ||
		!orderType ||
		isBuy == null
	) {
		return false;
	}
	switch (orderType) {
		case OrdType.LIMIT_ORDER:
			return limitPrice > 0;
		case OrdType.STOP_ORDER:
			return stopPrice > 0;
		default:
			return false;
	}
}

export function getFees(orderObject, requestID) {
	return new Promise((resolve) => {
		Api.postData(Api.getUrlFee(), { data: orderObject })
			.then((data) => {
				data['requestID'] = requestID;
				resolve(data);
			})
			.catch((err) => {
				LogDevice(`error getFees: ${JSON.stringify(err)}`);
				resolve({});
			});
	});
}

export function getExchangeCodeParitech(symbolObj = {}) {
	return Util.arrayHasItem(symbolObj.exchanges) ? symbolObj.exchanges[0] : '';
}

export function getExchangeCodeSaxo(symbolObj = {}) {
	return Util.arrayHasItem(symbolObj.exchanges) ? symbolObj.exchanges[0] : '';
}

export function getExchangeCode(symbolObj = {}) {
	return isParitech(symbolObj.symbol)
		? getExchangeCodeParitech(symbolObj)
		: getExchangeCodeSaxo(symbolObj);
}

export function getTradingMarketParitech(duration) {
	return duration === DURATION_CODE.DAY
		? EXCHANGE_CODE.CENTRE_POINT
		: EXCHANGE_CODE.TRADE_MATCH;
}

// export function getTradingMarket(symbolObj = {}, duration) {
//     return isParitech(symbolObj.symbol)
//         ? getTradingMarketParitech(duration)
//         : getExchangeCodeSaxo(symbolObj);
// };

export function getOrderTypeByCondition(symbol) {
	return isParitech(symbol) ? OrdType.LIMIT_ORDER : OrdType.MARKET_ORDER;
}

export function getOrderTypeExchangeByOrderTypeSystem(orderTypeSystem) {
	switch (orderTypeSystem) {
		case OrdType.LIMIT_ORDER:
			return OrdType.LIMIT_ORDER;
		case OrdType.MARKET_ORDER:
			return OrdType.MARKET_ORDER;
		case OrdType.MARKETTOLIMIT_ORDER:
			return OrdType.MARKETTOLIMIT_ORDER;
		case OrdType.STOP_ORDER:
		case OrdType.STOPLOSS_ORDER:
			return OrdType.STOP_ORDER;
		case OrdType.STOPLIMIT_ORDER:
		case OrdType.STOPLIMIT:
			return OrdType.STOPLIMIT_ORDER;
		default:
			return '';
	}
}

export function getTagOrderNotification(titleStr = '') {
	const listTitle = titleStr.split('#');
	return Util.arrayHasItem(listTitle) ? listTitle[listTitle.length - 1] : '';
}

export function isOrderSuccess(titleStr = '') {
	const listTitle = titleStr.split('#');
	return (
		Util.arrayHasItem(listTitle) &&
		listTitle[listTitle.length - 1] === TITLE_NOTI.SUCCESS
	);
}

export function isOrderSaxoTimeout(titleStr = '') {
	const listTitle = titleStr.split('#');
	return (
		Util.arrayHasItem(listTitle) &&
		listTitle[listTitle.length - 1] === TITLE_NOTI.TIMEOUT
	);
}

export function setButtonBack({ navigator = {}, id = '', disabled = false }) {
	navigator.setButtons({
		leftButtons: [
			{
				id,
				icon: Util.getValByPlatform(
					IconsMap[ICON_NAME.ARROW_BACK.IOS],
					IconsMap[ICON_NAME.ARROW_BACK.ANDROID]
				),
				disabled
			}
		]
	});
}
export function isParitechBySymbolExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	try {
		if (symbol === '...' || symbol === 'OTHERS') {
			return null;
		}
		let currency =
			symbol &&
			DataStorage.symbolEquity[keyInfo] &&
			DataStorage.symbolEquity[keyInfo].currency
				? DataStorage.symbolEquity[keyInfo].currency
				: Enum.CURRENCY.AUD; // fix nhung ma ko co trong Datastroge => exchange : ASX
		return currency === Enum.CURRENCY.AUD;
	} catch (error) {
		LogDevice(
			`error`,
			`Func isParitech error: ${JSON.stringify(
				error
			)} with symbol: ${symbol}`
		);
		return null;
	}
}
export function isParitech(symbol, symbolObj) {
	try {
		if (symbol === '...' || symbol === 'OTHERS') {
			return null;
		}
		let currency =
			symbol &&
			DataStorage.symbolEquity[symbol] &&
			DataStorage.symbolEquity[symbol].currency
				? DataStorage.symbolEquity[symbol].currency
				: symbolObj && symbolObj.currency
				? symbolObj.currency
				: Enum.CURRENCY.AUD; // fix nhung ma ko co trong Datastroge => exchange : ASX
		return currency === Enum.CURRENCY.AUD;
	} catch (error) {
		LogDevice(
			`error`,
			`Func isParitech error: ${JSON.stringify(
				error
			)} with symbol: ${symbol}`
		);
		return null;
	}
}
export function isNSXSymbolExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	try {
		const exchanges =
			symbol &&
			DataStorage.symbolEquity[keyInfo] &&
			DataStorage.symbolEquity[keyInfo].exchanges
				? DataStorage.symbolEquity[keyInfo].exchanges
				: [];
		return exchanges.includes('NSX') || exchanges.includes('BSX');
	} catch (error) {
		LogDevice(
			`error`,
			`Func isNSXSymbol error: ${JSON.stringify(
				error
			)} with symbol: ${symbol}`
		);
		return false;
	}
}

export function isNSXSymbol(symbol) {
	try {
		const exchanges =
			symbol &&
			DataStorage.symbolEquity[symbol] &&
			DataStorage.symbolEquity[symbol].exchanges
				? DataStorage.symbolEquity[symbol].exchanges
				: [];
		return exchanges.includes('NSX') || exchanges.includes('BSX');
	} catch (error) {
		LogDevice(
			`error`,
			`Func isNSXSymbol error: ${JSON.stringify(
				error
			)} with symbol: ${symbol}`
		);
		return false;
	}
}

export function getFlagsWithNonExistSymbol(symbol) {
	try {
		if (symbol === '...' || symbol === 'OTHERS') {
			return null;
		}
		const currency =
			symbol &&
			DataStorage.symbolEquity[symbol] &&
			DataStorage.symbolEquity[symbol].currency
				? DataStorage.symbolEquity[symbol].currency
				: '';
		switch (currency) {
			case Enum.CURRENCY.AUD:
				return FLAG.AU;
			case '':
				return '';
			default:
				return FLAG.US;
		}
		// return currency === Enum.CURRENCY.AUD;
	} catch (error) {
		LogDevice(
			`error`,
			`Func isParitech error: ${JSON.stringify(
				error
			)} with symbol: ${symbol}`
		);
		return null;
	}
}

export function getFlag(symbol) {
	switch (isParitech(symbol)) {
		case true:
			return FLAG.AU;
		case false:
			return FLAG.US;
		default:
			return '';
	}
}

export function getFlagByCountryCode({ countryCode }) {
	return MAPPING_COUNTRY_CODE[countryCode];
}

export function getFlag2(symbol) {
	const currency =
		symbol &&
		DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].currency;
	return getFlagByCurrency(currency);
}
export function getFlagBySymbolExchange({ symbol, exchange }) {
	const currency = getCurrencyBySymbolExchange({ symbol, exchange });
	return getFlagByCurrency(currency);
}
export function getFlagByCurrency(currency) {
	if (!currency) return '';
	switch (currency) {
		case Enum.CURRENCY.AUD:
			return FLAG.AU;
		case Enum.CURRENCY.USD:
			return FLAG.US;
		default:
			return FLAG.AU;
	}
}

export function getFlagByCode(symbol) {
	switch (symbol) {
		case 'AUD':
			return 'AU';
		case 'USD':
			return 'US';
		case 'EUR':
			return 'EU';
		case 'GBP':
			return 'GB';
		default:
			return '';
	}
}

export function getFlagByExchange(exchange, displayExchange) {
	try {
		if (exchange === '--' || !exchange) {
			if (displayExchange === 'ASX') {
				return FLAG.AU;
			}
			return FLAG.US;
		}
		return Enum.EXCHANGE_DETAIL[exchange] &&
			Enum.EXCHANGE_DETAIL[exchange].flag
			? Enum.EXCHANGE_DETAIL[exchange].flag
			: '';
	} catch (error) {
		console.log('get flag by exchange error: ', error);
		return '';
	}
}

export function isShowSummary(isDefault, totalVolume = 0, fillQuantity = 0) {
	return !isDefault && totalVolume > 0 && totalVolume > fillQuantity;
}

export function convertDisplayName(displayName) {
	return !displayName || typeof displayName !== 'string'
		? ''
		: displayName.split('.').join('.\n');
}

export function getOrdTypeSystemPlace(objOrder, symbol = '') {
	const {
		order_type: orderType,
		trail_amount: trailAmount,
		trail_percent: trailPercent,
		limit_price: limitPrice
	} = objOrder;

	if (orderType === OrdType.STOP_ORDER) {
		if (trailAmount != null || trailPercent != null) {
			return limitPrice != null
				? OrdType.TRAILINGSTOPLIMIT_ORDER
				: OrdType.TRAILINGSTOP_ORDER;
		}
		return isParitech(symbol)
			? limitPrice != null
				? OrdType.STOPLIMIT_ORDER
				: OrdType.STOPLOSS_ORDER
			: OrdType.STOP_ORDER;
	}
	return orderType;
}

export function getNotePlaceOrder({
	orderType,
	isBuy,
	volume,
	limitPrice,
	stopPrice,
	trailingAmount,
	trailingPercent
}) {
	const orderTypeString = ORDER_TYPE_STRING[orderType] || '';
	const sideString = isBuy ? SIDE.BUY : SIDE.SELL;
	const volumeString = FormatNumber(volume);
	const limitPriceString = FormatNumber2(limitPrice, PRICE_DECIMAL.PRICE);
	const stopPriceString = FormatNumber2(stopPrice, PRICE_DECIMAL.PRICE);
	const trailLable = trailingAmount
		? I18n.t('trailingAmount')
		: I18n.t('trailingPercentS');
	const trailValue = trailingAmount || FormatNumber2(trailingPercent, 2);
	try {
		switch (orderType) {
			case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ ${I18n.t(
					'mktUpper'
				)}`;
			case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ LMT ${limitPriceString}`;
			case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ ${I18n.t(
					'mktUpper'
				)}, ${I18n.t('trigger')} ${stopPriceString}`;
			case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ LMT ${limitPriceString}, ${I18n.t(
					'trigger'
				)} ${stopPriceString}`;
			case ORDER_TYPE_SYSTEM.TRAILINGSTOPLIMIT_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ LMT ${limitPriceString}, ${I18n.t(
					'trigger'
				)} ${stopPriceString}, ${trailLable} ${trailValue}`;
			case ORDER_TYPE_SYSTEM.MARKET_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ ${I18n.t(
					'mktUpper'
				)}`;
			case ORDER_TYPE_SYSTEM.STOP_ORDER:
				return `${orderTypeString} ${sideString} ${volumeString} @ ${I18n.t(
					'mktUpper'
				)}, ${I18n.t('trigger')} ${stopPriceString}`;
		}
		return '';
	} catch (error) {
		logAndReport(
			'renderOrderContent order exception',
			error,
			'renderOrderContent order'
		);
	}
}

export function getOrdTypeSystemModify(objOrder, symbol = '') {
	const {
		order_type_origin: orderType,
		trail_amount: trailAmount,
		trail_percent: trailPercent,
		limit_price: limitPrice,
		stop_price: stopPrice
	} = objOrder;
	if (isParitech(symbol)) {
		if (trailAmount || trailPercent) {
			return limitPrice
				? OrdType.TRAILINGSTOPLIMIT_ORDER
				: OrdType.TRAILINGSTOP_ORDER;
		}
		if (stopPrice) {
			return limitPrice
				? OrdType.STOPLIMIT_ORDER
				: OrdType.STOPLOSS_ORDER;
		}
	}
	switch ((orderType + '').toUpperCase()) {
		case ORDER_TYPE_ORIGIN_UPPER.MARKET:
			return OrdType.MARKET_ORDER;
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			return OrdType.MARKETTOLIMIT_ORDER;
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			return OrdType.LIMIT_ORDER;
		case ORDER_TYPE_ORIGIN_UPPER.BEST:
			return OrdType.BEST_ORDER;
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
			return OrdType.STOP_ORDER;
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			return OrdType.STOPLOSS_ORDER;
		default:
			return orderType;
	}
}

export function getContentConfirmParitech(param) {
	try {
		const {
			volume,
			volumePending,
			oldVolume,
			limitPrice,
			oldLimitPrice,
			stopPrice,
			oldStopPrice,
			isPartial,
			symbol,
			side,
			ordType,
			action
		} = param;
		let key = '';

		switch (ordType) {
			case OrdType.MARKETTOLIMIT_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'marketParitechPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'marketParitechModifyNotPartial')
							: (key = 'marketParitechModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'marketParitechCancelNotPartial')
							: (key = 'marketParitechCancelPartial');
						break;
					default:
						break;
				}
				break;
			case OrdType.STOPLOSS_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'stopLossPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'stopLossModifyNotPartial')
							: (key = 'stopLossModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'stopLossCancelNotPartial')
							: (key = 'stopLossCancelPartial');
						break;
					default:
						break;
				}
				break;
			case OrdType.LIMIT_ORDER:
			case OrdType.BEST_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'limitParitechPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'limitParitechModifyNotPartial')
							: (key = 'limitParitechModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'limitParitechCancelNotPartial')
							: (key = 'limitParitechCancelPartial');
						break;
					default:
						break;
				}
				break;
			case OrdType.STOPLIMIT_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'stopLimitPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'stopLimitModifyNotPartial')
							: (key = 'stopLimitModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'stopLimitCancelNotPartial')
							: (key = 'stopLimitCancelPartial');
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}

		LogDevice(
			'info',
			`GET CONTENT CONFIRM PARITECH KEY: ${key} - ORDER TYPE: ${ordType} - ACTION: ${action}`
		);
		let str = Translate.getValByKey(key) || '';
		if (str) {
			str = str.replace(/##side##/g, `#{${side}}`);
			str = str.replace(/##volume##/g, `#{${volume}}`);
			str = str.replace(/##symbol##/g, `#{${symbol}}`);
			str = str.replace(/##oldVolume##/g, `#{${oldVolume}}`);
			str = str.replace(/##oldVolume##/g, `#{${oldVolume}}`);
			str = str.replace(/##limitPrice##/g, `#{${limitPrice}}`);
			str = str.replace(/##oldLimitPrice##/g, `#{${oldLimitPrice}}`);
			str = str.replace(/##volumePending##/g, `#{${volumePending}}`);
			str = str.replace(/##stopPrice##/g, `#{${stopPrice}}`);
			str = str.replace(/##oldStopPrice##/g, `#{${oldStopPrice}}`);
			str = str.replace(
				/##marketPrice##/g,
				`#{${Translate.getValByKey('marketPrice')}}`
			);
		}
		return str;
	} catch (error) {
		LogDevice('info', `GET CONTENT CONFIRM PARITECT EXCEPTION: ${error}`);
	}
}

export function getContentConfirmSaxo(param) {
	try {
		const {
			volume,
			volumePending,
			oldVolume,
			limitPrice,
			marketPrice,
			oldLimitPrice,
			stopPrice,
			oldStopPrice,
			isPartial,
			symbol,
			side,
			ordType,
			action
		} = param;
		let key = '';
		let marketPriceStr = Translate.getValByKey('marketPrice');

		switch (ordType) {
			case OrdType.MARKET_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'marketSaxoPlaceOrder';
						break;
					case ACTION.MODIFY:
						if (!isPartial) key = 'marketSaxoModifyNotPartial';
						else {
							key = 'marketSaxoModifyPartial';
							marketPriceStr = marketPrice;
						}
						break;
					case ACTION.CANCEL:
						if (!isPartial) key = 'marketSaxoCancelNotPartial';
						else {
							key = 'marketSaxoCancelPartial';
							marketPriceStr = marketPrice;
						}
						break;
					default:
						break;
				}
				break;
			case OrdType.LIMIT_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'limitSaxoPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'limitSaxoModifyNotPartial')
							: (key = 'limitSaxoModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'limitSaxoCancelNotPartial')
							: (key = 'limitSaxoCancelPartial');
						break;
					default:
						break;
				}
				break;
			case OrdType.STOP_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'stopPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'stopModifyNotPartial')
							: (key = 'stopModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'stopCancelNotPartial')
							: (key = 'stopCancelPartial');
						break;
					default:
						break;
				}
				break;
			case OrdType.STOPLOSS_ORDER:
				switch (action) {
					case ACTION.PLACE:
						key = 'stoplossPlaceOrder';
						break;
					case ACTION.MODIFY:
						!isPartial
							? (key = 'stoplossModifyNotPartial')
							: (key = 'stoplossModifyPartial');
						break;
					case ACTION.CANCEL:
						!isPartial
							? (key = 'stoplossCancelNotPartial')
							: (key = 'stoplossCancelPartial');
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}

		LogDevice(
			'info',
			`GET CONTENT CONFIRM SAXO KEY: ${key} - ORDER TYPE: ${ordType} - ACTION: ${action}`
		);
		let str = Translate.getValByKey(key) || '';
		if (str) {
			str = str.replace(/##side##/g, `#{${side}}`);
			str = str.replace(/##volume##/g, `#{${volume}}`);
			str = str.replace(/##symbol##/g, `#{${symbol}}`);
			str = str.replace(/##oldVolume##/g, `#{${oldVolume}}`);
			str = str.replace(/##oldVolume##/g, `#{${oldVolume}}`);
			str = str.replace(/##limitPrice##/g, `#{${limitPrice}}`);
			str = str.replace(/##oldLimitPrice##/g, `#{${oldLimitPrice}}`);
			str = str.replace(/##volumePending##/g, `#{${volumePending}}`);
			str = str.replace(/##stopPrice##/g, `#{${stopPrice}}`);
			str = str.replace(/##oldStopPrice##/g, `#{${oldStopPrice}}`);
			str = str.replace(/##marketPrice##/g, `#{${marketPriceStr}}`);
		}
		return str;
	} catch (error) {
		LogDevice('info', `GET CONTENT CONFIRM SAXO EXCEPTION: ${error}`);
	}
}

export function genContentConfirmOrder({
	action,
	curOrdObj = {},
	oldOrdObj = {},
	symbolObj = {}
}) {
	const side =
		action === ACTION.MODIFY
			? curOrdObj.is_buy
				? SIDE.BUYING
				: SIDE.SELLING
			: curOrdObj.is_buy
			? SIDE.BUY
			: SIDE.SELL;
	const param = {
		trailingType: curOrdObj.trail_amount
			? TRAILING_TYPE.AMOUNT
			: TRAILING_TYPE.PERCENT,
		trailingValue: FormatNumber2(
			curOrdObj.trail_amount || curOrdObj.trail_percent || 0,
			PRICE_DECIMAL.PRICE
		),
		oldTrailingValue: FormatNumber2(
			oldOrdObj.trail_amount || oldOrdObj.trail_percent || 0,
			PRICE_DECIMAL.PRICE
		),
		volume: FormatNumber(curOrdObj.volume) || 0,
		volumePending: FormatNumber(
			(curOrdObj.volume || 0) - (curOrdObj.filled_quantity || 0)
		),
		oldVolume: FormatNumber(oldOrdObj.volume) || 0,
		limitPrice: FormatNumber2(
			curOrdObj.limit_price || 0,
			PRICE_DECIMAL.PRICE
		),
		marketPrice: FormatNumber2(
			curOrdObj.market_price || 0,
			PRICE_DECIMAL.PRICE
		),
		oldLimitPrice: FormatNumber2(
			oldOrdObj.limit_price || 0,
			PRICE_DECIMAL.PRICE
		),
		stopPrice: FormatNumber2(
			curOrdObj.stop_price || 0,
			PRICE_DECIMAL.PRICE
		),
		oldStopPrice: FormatNumber2(
			oldOrdObj.stop_price || 0,
			PRICE_DECIMAL.PRICE
		),
		isPartial: curOrdObj.filled_quantity || false,
		symbol: symbolObj.display_name || '',
		side: Translate.getInvertTranslate(side),
		ordType:
			action === ACTION.PLACE
				? getOrdTypeSystemPlace(curOrdObj, symbolObj.symbol)
				: getOrdTypeSystemModify(curOrdObj, symbolObj.symbol),
		action
	};
	return isParitech(symbolObj.symbol)
		? getContentConfirmParitech(param)
		: getContentConfirmSaxo(param);
}

export function calOrderValue(
	{
		volume,
		order_type: orderType,
		stop_price: stopPrice,
		is_buy: isBuy,
		limit_price: limitPrice
	},
	{ ask_price: askPrice, bid_price: bidPrice },
	decimal
) {
	let price = 0;
	switch (orderType) {
		case OrdType.STOPLIMIT_ORDER:
			price = stopPrice || 0;
			break;
		case OrdType.TRAILINGSTOPLIMIT_ORDER:
			price = stopPrice || 0;
			break;
		case OrdType.MARKETTOLIMIT_ORDER:
		case OrdType.MARKET_ORDER:
			price = isBuy ? askPrice || 0 : bidPrice || 0;
			break;
		case OrdType.LIMIT_ORDER:
			price = limitPrice || 0;
			break;
		case OrdType.STOPLOSS_ORDER:
		case OrdType.STOP_ORDER:
			price = stopPrice || 0;
			break;
		default:
			break;
	}
	const value = Operator.calculate(volume, price, '*');
	return decimal ? FormatNumber2(value, decimal) : value;
}
export function getCurrencyBySymbolExchange({ symbol, exchange }) {
	// return 'KRW' // Fake currency
	const keyInfo = `${symbol}#${exchange}`;
	try {
		let currency =
			symbol &&
			DataStorage.symbolEquity[keyInfo] &&
			DataStorage.symbolEquity[keyInfo].currency
				? DataStorage.symbolEquity[keyInfo].currency
				: '';
		return currency;
	} catch (error) {
		return '';
	}
}
export function getCurrencyByKey({ key }) {
	try {
		let currency =
			DataStorage.symbolEquity[key] &&
			DataStorage.symbolEquity[key].currency
				? DataStorage.symbolEquity[key].currency
				: null;
		if (currency) return currency;
		const exchange = key.split(/[#.]/)[1];
		return exchange === EXCHANGE.ASX || !exchange
			? CURRENCY.AUD
			: CURRENCY.USD;
	} catch (error) {
		return '';
	}
}
export function getCurency(symbol) {
	try {
		let currency =
			symbol &&
			DataStorage.symbolEquity[symbol] &&
			DataStorage.symbolEquity[symbol].currency
				? DataStorage.symbolEquity[symbol].currency
				: null;
		if (currency) return currency;
		const exchange = symbol.split('.')[1];
		return exchange === EXCHANGE.ASX || !exchange
			? CURRENCY.AUD
			: CURRENCY.USD;
	} catch (error) {
		return '';
	}
}
export function getPriceDisplayMultiplier({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	return DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].price_display_multiplier
		? DataStorage.symbolEquity[keyInfo].price_display_multiplier
		: 1;
}
export function getDisplayDuration(duration = '') {
	return Translate.getInvertTranslate(DURATION_STRING[duration]) || '';
}

export function getDefaultDurationByClassSymbol(classSymbol) {
	switch (classSymbol) {
		case SYMBOL_CLASS.WARRANT:
			return DURATION_CODE.GTC;
		case SYMBOL_CLASS.ETFS:
		case SYMBOL_CLASS.MF:
			return DURATION_CODE.DAY;
		default:
			// Equity
			return DURATION_CODE.GTC;
	}
}

export function isFuture(classSymbol) {
	try {
		return classSymbol === SYMBOL_CLASS.FUTURE;
	} catch (error) {
		LogDevice(
			`error`,
			`Func isFuture error: ${JSON.stringify(
				error
			)} with symbol: ${symbol}`
		);
		return null;
	}
}

export function getListOrderType(code, classSymbol) {
	return isFuture(classSymbol)
		? [
				orderTypeString.MARKET,
				orderTypeString.LIMIT,
				orderTypeString.STOPLOSS,
				orderTypeString.STOPLIMIT
		  ]
		: [orderTypeString.MARKET, orderTypeString.LIMIT];
}

export function getListOrderTypeByClass(
	symbolClass = SYMBOL_CLASS.EQUITY,
	isNSXSymbol = false,
	exchange = EXCHANGE_CODE.BESTMKT
) {
	// if ((exchange + '').includes('NSX:NSX')) {
	//     return LIMIT_MKT
	// }
	if (isNSXSymbol) {
		return LIMIT_MKT;
	}
	switch (symbolClass) {
		case SYMBOL_CLASS.EQUITY:
			return LIMIT_MKT_STOPLOSS;
		// switch (exchange) {
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.EQUITY]['ASX:ASX']:
		// return LIMIT_MKT_STOPLOSS
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.EQUITY]['ASX:ASXCP']:
		//         return LIMIT_MKT;
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.EQUITY]['N:CXA']:
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.EQUITY]['CXA:CXACP']:
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.EQUITY]['N:qCXA']:
		//         return [orderTypeString.LIMIT]
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.EQUITY]['N:BESTMKT']:
		//         return LIMIT_MKT
		//     default: return [];
		// }
		// case SYMBOL_CLASS.OPTION:
		// switch (exchange) {
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.OPTION]['ASX:ASX']:
		//         return LIMIT_MKT_STOPLOSS
		//     default: return [];
		// }
		case SYMBOL_CLASS.OPTION:
		case SYMBOL_CLASS.WARRANT:
		case SYMBOL_CLASS.MF:
		case SYMBOL_CLASS.ETFS:
			return LIMIT_MKT;
		// switch (exchange) {
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.WARRANT]['CXA:CXA']:
		//         return [orderTypeString.LIMIT]
		//     case EXCHANGE_CLASS[SYMBOL_CLASS.WARRANT]['AXW:ASX']:
		//         return LIMIT_MKT
		//     default: return [];
		// }
		// case SYMBOL_CLASS.MF:
		// case SYMBOL_CLASS.ETFS:
		//     switch (exchange) {
		//         case EXCHANGE_CLASS[SYMBOL_CLASS.ETFS]['AXW:CXA']:
		//         case EXCHANGE_CLASS[SYMBOL_CLASS.ETFS]['CXA:AXW']:
		//         case EXCHANGE_CLASS[SYMBOL_CLASS.ETFS]['AXW:ASX']:
		//         case EXCHANGE_CLASS[SYMBOL_CLASS.MF]['AXW:CXA']:
		//         case EXCHANGE_CLASS[SYMBOL_CLASS.MF]['CXA:AXW']:
		//         case EXCHANGE_CLASS[SYMBOL_CLASS.MF]['AXW:ASX']:
		//             return LIMIT_MKT
		//         default: return [];
		//     }
		case SYMBOL_CLASS.FUTURE:
			return [
				orderTypeString.MARKET,
				orderTypeString.LIMIT,
				orderTypeString.STOPLOSS,
				orderTypeString.STOPLIMIT
			];
		default:
			return [];
	}
}

export function getListDurationByClass(
	symbolClass = SYMBOL_CLASS.EQUITY,
	orderType = orderTypeEnum.MARKETTOLIMIT_ORDER,
	isNSXSymbol
) {
	let listDurationCode = [];
	if (isNSXSymbol) {
		listDurationCode = LIST_DURATION_GDG;
	} else {
		switch (symbolClass) {
			case SYMBOL_CLASS.EQUITY:
				switch (orderType) {
					case orderTypeEnum.LIMIT_ORDER:
					case orderTypeEnum.MARKETTOLIMIT_ORDER:
						listDurationCode = LIST_DURATION_GDGFI;
						break;
					case orderTypeEnum.STOPLIMIT_ORDER:
					case orderTypeEnum.STOPLOSS_ORDER:
						listDurationCode = LIST_DURATION_GDGI;
						break;
					default:
						break;
				}
				break;
			case SYMBOL_CLASS.WARRANT:
				switch (orderType) {
					case orderTypeEnum.LIMIT_ORDER:
						listDurationCode = LIST_DURATION_ONLY_GTC;
						break;
					case orderTypeEnum.MARKETTOLIMIT_ORDER:
						listDurationCode = LIST_DURATION_ONLY_GTC;
						break;
					default:
						break;
				}
				break;
			case SYMBOL_CLASS.OPTION:
				listDurationCode = LIST_DURATION_GDGFI;
				break;
			case SYMBOL_CLASS.MF:
			case SYMBOL_CLASS.ETFS:
				listDurationCode = LIST_DURATION_ONLY_GTC;
				break;
			case SYMBOL_CLASS.FUTURE:
				listDurationCode = LIST_DURATION_DGGF;
				break;
			default:
				break;
		}
	}
	return listDurationCode.map((duration) => DURATION_STRING[duration] || '');
}
export function getListDurationByOrderTypeSystemWithExchange({
	orderTypeSystem,
	symbol,
	classSymbol,
	exchange
}) {
	if (
		isParitechBySymbolExchange({ symbol, exchange }) ||
		isFuture(classSymbol)
	) {
		return [
			DURATION_CODE.DAY,
			DURATION_CODE.GTC,
			DURATION_CODE.GTD,
			DURATION_CODE.FOK
		];
	} else {
		switch (orderTypeSystem) {
			case ORDER_TYPE_SYSTEM.MARKET_ORDER:
			case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
				return [DURATION_CODE.DAY];
			case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
			case ORDER_TYPE_SYSTEM.STOP_ORDER:
			case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
			case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
				return [DURATION_CODE.DAY, DURATION_CODE.GTC];
			default:
				return [];
		}
	}
}
export function getListDurationByOrderTypeSystem(
	orderTypeSystem,
	code,
	classSymbol
) {
	if (isParitech(code) || isFuture(classSymbol)) {
		return [
			DURATION_CODE.DAY,
			DURATION_CODE.GTC,
			DURATION_CODE.GTD,
			DURATION_CODE.FOK
		];
	} else {
		switch (orderTypeSystem) {
			case ORDER_TYPE_SYSTEM.MARKET_ORDER:
			case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
				return [DURATION_CODE.DAY];
			case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
			case ORDER_TYPE_SYSTEM.STOP_ORDER:
			case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
			case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
				return [DURATION_CODE.DAY, DURATION_CODE.GTC];
			default:
				return [];
		}
	}
}

export function getListDurationStringByOrderTypeSystem(
	orderTypeSystem,
	code,
	classSymbol
) {
	const listDurationCode = getListDurationByOrderTypeSystem(
		orderTypeSystem,
		code,
		classSymbol
	);
	return listDurationCode.map((duration) => DURATION_STRING[duration] || '');
}

export function getListExchangeString({ classSymbol }) {
	switch (classSymbol) {
		case SYMBOL_CLASS.WARRANT:
			return [Enum.EXCHANGE_STRING.AXW, Enum.EXCHANGE_STRING.WARRANT_CXA];
		case SYMBOL_CLASS.ETFS:
		case SYMBOL_CLASS.MF:
			return [
				Enum.EXCHANGE_STRING.ETF_MF_ASX,
				Enum.EXCHANGE_STRING.ETF_MF_CXA
			];
		default:
			// Equity
			return [
				Enum.EXCHANGE_STRING.ASX,
				Enum.EXCHANGE_STRING.ASXCP,
				Enum.EXCHANGE_STRING.CXA,
				Enum.EXCHANGE_STRING.CXACP,
				Enum.EXCHANGE_STRING.qCXA,
				Enum.EXCHANGE_STRING.BESTMKT
			];
	}
}

export function getListExchangeByClassAndOrderType({
	classSymbol,
	orderType,
	isNSXSymbol,
	duration
}) {
	if (isNSXSymbol) {
		switch (duration) {
			case DURATION_CODE.GTD:
			case DURATION_CODE.DAY:
			case DURATION_CODE.GTC:
				return LIST_EXCHANGE_ONLY_NSX;
			default:
				return {};
		}
	}
	switch (classSymbol) {
		case SYMBOL_CLASS.EQUITY:
			switch (orderType) {
				case orderTypeEnum.LIMIT_ORDER:
					switch (duration) {
						case DURATION_CODE.GTC:
						case DURATION_CODE.GTD:
							return LIST_EXCHANGE_BA;
						case DURATION_CODE.FOK:
							return LIST_EXCHANGE_BAAC;
						case DURATION_CODE.DAY:
						case DURATION_CODE.IOC:
							return LIST_EXCHANGE_BAACQ;
						default:
							return {};
					}
				case orderTypeEnum.MARKETTOLIMIT_ORDER:
					switch (duration) {
						case DURATION_CODE.GTC:
						case DURATION_CODE.GTD:
							return LIST_EXCHANGE_BA;
						case DURATION_CODE.FOK:
						case DURATION_CODE.IOC:
						case DURATION_CODE.DAY:
							return LIST_EXCHANGE_BAC;
						default:
							return {};
					}
				case orderTypeEnum.STOPLOSS_ORDER:
				case orderTypeEnum.STOPLIMIT_ORDER:
					return LIST_EXCHANGE_ONLY_FIXED_CO;
				default:
					return {};
			}
		case SYMBOL_CLASS.OPTION:
			return LIST_EXCHANGE_ONLY_ASX;
		case SYMBOL_CLASS.WARRANT:
			switch (orderType) {
				case orderTypeEnum.LIMIT_ORDER:
					switch (duration) {
						// case DURATION_CODE.GTD:
						case DURATION_CODE.IOC:
						case DURATION_CODE.DAY:
						case DURATION_CODE.FOK:
							return LIST_EXCHANGE_ONLY_CXA;
						case DURATION_CODE.GTC:
							return LIST_EXCHANGE_ONLY_AXW;
						default:
							return {};
					}
				case orderTypeEnum.MARKETTOLIMIT_ORDER:
					switch (duration) {
						case DURATION_CODE.GTC:
							return LIST_EXCHANGE_ONLY_AXW;
						default:
							return {};
					}
				default:
					return {};
			}
		case SYMBOL_CLASS.MF:
		case SYMBOL_CLASS.ETFS:
			switch (duration) {
				case DURATION_CODE.GTC:
					return LIST_EXCHANGE_ONLY_AXW;
				default:
					return {};
			}
		default:
			return {};
	}
}
export function getListTradingMarketSymbolExchange({ symbol, exchange }) {
	const key = `${symbol}#${exchange}`;
	let listTradingMarketTranslate = [];
	let listExchange = [];
	let dicExchange = {};
	const dicTradingMarket = {};
	let listTradingMarket = [Enum.EXCHANGE_CODE.ASX];
	if (
		DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].list_trading_market
	) {
		listTradingMarket = DataStorage.symbolEquity[key].list_trading_market;
	}
	listTradingMarket.map((e) => {
		const defaultExchange = e.split(':')[1] || 'ASX';
		const keyLanguage =
			Enum.EXCHANGE_DETAIL[e] && Enum.EXCHANGE_DETAIL[e].displayExchange
				? Enum.EXCHANGE_DETAIL[e].displayExchange
				: '';
		const tradingMarketTranslate = keyLanguage
			? I18n.t(keyLanguage)
			: defaultExchange;
		dicExchange[e] = tradingMarketTranslate;
		// eslint-disable-next-line standard/computed-property-even-spacing
		listTradingMarketTranslate[exchangePriority[defaultExchange]] =
			tradingMarketTranslate;
		dicTradingMarket[tradingMarketTranslate] = e;
	});
	const isValid = (e) => e !== null && e !== undefined;
	listTradingMarketTranslate = listTradingMarketTranslate.filter(isValid);
	listTradingMarketTranslate.map((e) => {
		listExchange.push({ value: dicTradingMarket[e], label: e });
	});
	return {
		listExchange,
		dicExchange
	};
}
export function getListTradingMarket(symbol) {
	let listTradingMarketTranslate = [];
	let listExchange = [];
	let dicExchange = {};
	const dicTradingMarket = {};
	let listTradingMarket = [Enum.EXCHANGE_CODE.ASX];
	if (
		DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].list_trading_market
	) {
		listTradingMarket =
			DataStorage.symbolEquity[symbol].list_trading_market;
	}
	listTradingMarket.map((e) => {
		const defaultExchange = e.split(':')[1] || 'ASX';
		const keyLanguage =
			Enum.EXCHANGE_DETAIL[e] && Enum.EXCHANGE_DETAIL[e].displayExchange
				? Enum.EXCHANGE_DETAIL[e].displayExchange
				: '';
		const tradingMarketTranslate = keyLanguage
			? I18n.t(keyLanguage)
			: defaultExchange;
		dicExchange[e] = tradingMarketTranslate;
		// eslint-disable-next-line standard/computed-property-even-spacing
		listTradingMarketTranslate[exchangePriority[defaultExchange]] =
			tradingMarketTranslate;
		dicTradingMarket[tradingMarketTranslate] = e;
	});
	const isValid = (e) => e !== null && e !== undefined;
	listTradingMarketTranslate = listTradingMarketTranslate.filter(isValid);
	listTradingMarketTranslate.map((e) => {
		listExchange.push({ value: dicTradingMarket[e], label: e });
	});
	return {
		listExchange,
		dicExchange
	};
}

export function disabledButtonCancelConfirmScreen(status, isConnected) {
	return (
		!isConnected ||
		(status !== STATUS.NONE &&
			status !== STATUS.ERROR &&
			status !== STATUS.TIMEOUT)
	);
}

export function disabledButtonConfirmConfirmScreen(status, isConnected) {
	return (
		!isConnected ||
		(status !== STATUS.NONE &&
			status !== STATUS.ERROR &&
			status !== STATUS.TIMEOUT)
	);
}

export function disabledButtonBackConfirmScreen(status, isConnected) {
	return !isConnected || status === STATUS.PROCESS;
}

export function processingButtonConfirmConfirmScreen(status) {
	return status === STATUS.PROCESS;
}

export function getFeesOrderParitechPlace(ordVal, decimal) {
	const orderValue = parseFloat(ordVal, 10);
	if (orderValue == null || isNaN(orderValue)) return '--';

	return FormatNumber2(
		orderValue < FEE.PARITECH_LIMITED
			? FEE.PARITECH_VAL
			: Operator.calculate(orderValue, FEE.PARITECH_PERCENT, '*'),
		decimal
	);
}

export function getFeesOrderParitechCancel(
	estimatedBrokerage,
	estimatedTax,
	decimal
) {
	if (estimatedBrokerage == null || estimatedTax == null) return '--';
	const value = Operator.calculate(estimatedBrokerage, estimatedTax, '+');
	return decimal ? FormatNumber2(value, decimal) : value;
}

export function getOrderTypeString(type) {
	return ORDER_TYPE_STRING[type] || '';
}

export function displayMoney(
	money = 0,
	decimal = 0,
	symbolCurrency,
	isShowCurrency = false
) {
	if (money === '--') return '--';
	const preValue = money >= 0 ? '' : '-';
	if (
		parseInt(money) === parseFloat(money) &&
		symbolCurrency &&
		symbolCurrency.toUpperCase().includes('VND')
	) {
		decimal = 0;
	}
	// Fix show false
	return `${preValue}${
		isShowCurrency ? symbolCurrency || '' : ''
	}${FormatNumber2(Math.abs(money), decimal)}`;
}

export function displayMoney2(money, decimal = 0, symbolCurrency) {
	if (money === '--') return '--';
	const preValue = money > 0 ? ' ' : money < 0 ? '- ' : '';
	return `${preValue}${symbolCurrency || ''}${FormatNumber2(
		Math.abs(money),
		decimal
	)}`;
}

export function displayMoney3(money, decimal = 0, symbolCurrency) {
	if (money === '--') return '--';
	const preValue = money > 0 ? '' : money < 0 ? '- ' : '';
	return `${preValue}${symbolCurrency || ''}${FormatNumber2(
		Math.abs(money),
		decimal
	)}`; // Dau cach day khien cho truong hop: khi text qua dai thi xuong cong, dau cach chiem 1 dong luon
}

export function getFeeBaseCurrency(accountObj, feeObj, symbolObj) {
	if (!accountObj) accountObj = DataStorage.currentAccount;
	const accountCurrency = accountObj.currency;
	const symbolCurrency = symbolObj.currency;
	const symbolMoney = accountObj.currency === Enum.CURRENCY.VND ? '' : '$';
	const unitMoney = accountCurrency;
	const orderAmmountUSD = feeObj.order_amount_usd || '--';
	const {
		estimated_fees: estimatedFees = '--',
		initial_margin: initalMargin = '--',
		maintenance_margin: maintenanceMargin = '--',
		overnight_margin: overNightMargin = '--'
	} = feeObj;
	if (accountCurrency === symbolCurrency) {
		orderAmmount = feeObj.order_amount || '--';
		estimatedToltal = feeObj.total || '--';
	} else {
		orderAmmount = feeObj.order_amount_convert || '--';
		estimatedToltal = feeObj.total_convert || '--';
	}
	return {
		orderAmmount,
		orderAmmountUSD,
		estimatedFees,
		estimatedToltal,
		initalMargin,
		maintenanceMargin,
		overNightMargin,
		symbolMoney,
		unitMoney
	};
}

export function getDataChartPrice(symbol, priceType) {
	const isAuSymbol = Util.isAuBySymbol(symbol);
	const timezone = isAuSymbol
		? Controller.getTimeZoneAU()
		: Controller.getTimeZoneUS();
	return new Promise((resolve) => {
		const url = Api.getCustomHistorical({
			symbol,
			exchange: FuncStorage.getExchangeSymbol(symbol),
			time: new Date().getTime(),
			priceType,
			timezone,
			isAuSymbol
		});
		Api.requestData(url).then((snap) => {
			if (snap && snap.errorCode) {
				return resolve(null);
			} else if (snap && typeof snap === 'string') {
				const data = Util.convertCsvToObject(snap, { startLine: 8 });
				if (data.length < 1) return resolve(null);

				const dataChart = {};
				for (const item of data) {
					const timeStampCurrentTimeZone =
						Util.getCurrentTimezone() * (60 * 60 * 1000);
					const updated =
						moment(item.Time, ['DD/MM/YY HH:mm:ss.SSS']).valueOf() +
						timeStampCurrentTimeZone;
					if (!updated) continue;
					dataChart[updated] = {
						updated,
						open: Util.getNumberFromString(item.Open),
						high: Util.getNumberFromString(item.High),
						close: Util.getNumberFromString(item.Close),
						volume: Util.getNumberFromString(item.Volume),
						low: Util.getNumberFromString(item.Low)
					};
				}
				return resolve(dataChart);
			} else {
				return resolve(null);
			}
		});
	});
}

export function subNewSymbol(listSymbolObj, ID_FORM) {
	return new Promise((resolve) => {
		Lv1.sub(listSymbolObj, ID_FORM, resolve);
	});
}

export function unSubSymbol(listSymbolObj, ID_FORM) {
	Lv1.unsub(listSymbolObj, ID_FORM);
}

export function unSubByScreen(name) {
	const ID_FORM = FuncStorage.getIDForm(name);
	const listSymbolObject = FuncStorage.getListSymbolObject(name);
	unSubSymbol(listSymbolObject, ID_FORM);
}

export function getPlaceNoteString(noteObj, symbolObj) {
	const orderType = noteObj.order_type;
	const displayName =
		noteObj.displayName || (symbolObj && symbolObj.display_name);
	const data = noteObj.data || {};
	data.displayName = displayName || (symbolObj && symbolObj.symbol) || '--';
	data.volume = data.volume || data.quantity;
	let keyLanguage = '';
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
			keyLanguage = 'notePlaceMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
			keyLanguage = 'notePlaceLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
			keyLanguage = 'notePlaceStopLoss';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
			keyLanguage = 'notePlaceStopLimit';
			break;
		case ORDER_TYPE_SYSTEM.TRAILINGSTOPLIMIT_ORDER:
			keyLanguage = 'notePlaceTraillingStopLimitAmount';
			break;
	}
	return getNote(keyLanguage, data, symbolObj);
}

export function getNote(keyLanguage, data, symbolObj) {
	try {
		let note = I18n.t(keyLanguage);
		const symbol = symbolObj && symbolObj.symbol;
		const {
			side = '',
			volume: quantity,
			limit_price: limitPrice,
			stop_price: stopPrice,
			request_quantity: requestQuantity,
			request_limit_price: requestLimitPrice,
			request_stop_price: requestStopPrice,
			filled_quantity: filledQuantity,
			leave_quantity: remainingQuantity,
			displayName,
			amount,
			percent,
			avg_price: avgPrice,
			reject_reason: reason = ''
		} = data;

		if (!keyLanguage) {
			return '';
		}
		if (note.indexOf('##displayName##') > -1) {
			if (displayName) {
				note = note.replace(/##displayName##/g, displayName);
			} else if (symbol) {
				note = note.replace(/##displayName##/g, symbol);
			}
		}
		if (note.indexOf('##reason##') > -1) {
			note = note.replace(/##reason##/g, reason);
		}
		if (note.indexOf('##requestQuantity##') > -1) {
			note = note.replace(
				/##requestQuantity##/g,
				FormatNumber2(parseInt(requestQuantity), PRICE_DECIMAL.VOLUME)
			);
		}
		if (note.indexOf('##filledQuantity##') > -1) {
			note = note.replace(
				/##filledQuantity##/g,
				FormatNumber2(filledQuantity, PRICE_DECIMAL.VOLUME)
			);
		}
		if (note.indexOf('##remainingQuantity##') > -1) {
			note = note.replace(
				/##remainingQuantity##/g,
				FormatNumber2(remainingQuantity, PRICE_DECIMAL.VOLUME)
			);
		}
		if (note.indexOf('##requestLimitPrice##') > -1) {
			note = note.replace(
				/##requestLimitPrice##/g,
				FormatNumber2(
					parseFloat(requestLimitPrice),
					PRICE_DECIMAL.PRICE
				)
			);
		}
		if (note.indexOf('##requestStopPrice##') > -1) {
			note = note.replace(
				/##requestStopPrice##/g,
				FormatNumber2(parseFloat(requestStopPrice), PRICE_DECIMAL.PRICE)
			);
		}
		if (note.indexOf('##side##') > -1) {
			note = note.replace(/##side##/g, side.toUpperCase());
		}
		if (note.indexOf('##quantity##') > -1) {
			note = note.replace(
				/##quantity##/g,
				FormatNumber2(parseInt(quantity), PRICE_DECIMAL.VOLUME)
			);
		}
		if (note.indexOf('##limitPrice##') > -1) {
			note = note.replace(
				/##limitPrice##/g,
				FormatNumber2(limitPrice, PRICE_DECIMAL.PRICE)
			);
		}
		if (note.indexOf('##stopPrice##') > -1) {
			note = note.replace(
				/##stopPrice##/g,
				FormatNumber2(stopPrice, PRICE_DECIMAL.PRICE)
			);
		}
		if (note.indexOf('##amount##') > -1) {
			note = note.replace(
				/##amount##/g,
				FormatNumber2(amount, PRICE_DECIMAL.VALUE)
			);
		}
		if (note.indexOf('##avgPrice##') > -1) {
			note = note.replace(
				/##avgPrice##/g,
				FormatNumber2(avgPrice, PRICE_DECIMAL.PRICE)
			);
		}
		if (note.indexOf('##percent##') > -1) {
			note = note.replace(
				/##percent##/g,
				FormatNumber2(percent, PRICE_DECIMAL.PERCENT)
			);
		}
		return note;
	} catch (error) {
		LogDevice(`error`, `Get note error ${error}`);
		return null;
	}
}

export function getAmendNoteString(noteObj, symbolObj) {
	const { order_type: orderType, data, displayName } = noteObj;
	data.displayName = displayName;
	// old
	const volume = data['volume_old'] || data.volume || data.quantity;
	const limitPrice = data['limit_price_old'] || data['limit_price'];
	const stopPrice = data['stop_price_old'] || data['stop_price'];

	// new
	const requestQuantity =
		data['request_quantity'] || data.volume || data.quantity;
	const requestLimitPrice =
		data['request_limit_price'] || data['limit_price'];
	const requestStopPrice = data['request_stop_price'] || data['stop_price'];

	data['volume'] = volume;
	data['limit_price'] = limitPrice;
	data['stop_price'] = stopPrice;
	data['request_quantity'] = requestQuantity;
	data['request_limit_price'] = requestLimitPrice;
	data['request_stop_price'] = requestStopPrice;
	let keyLanguage = '';
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteModifyMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteModifyLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteModifyStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteModifyStopLossBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.TRAILINGSTOPLIMIT:
		case ORDER_TYPE_SYSTEM.TRAILINGSTOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.TRAILINGSTOPLIMIT:
			break;
	}
	return getNote(keyLanguage, data, symbolObj);
}

export function getNoteSuspended(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteSuspendedMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteSuspendedLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteSuspendedStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteSuspendedStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteCalculated(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteCalculatedMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteCalculatedLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteCalculatedStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteCalculatedStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteExpired(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteExpiredMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteExpiredLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteExpiredStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteExpiredStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteAcceptedForBidding(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteAcceptedForBiddingMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteAcceptedForBiddingLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteAcceptedForBiddingStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteAcceptedForBiddingStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNotePurged(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'notePurgedMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'notePurgedLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'notePurgedStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'notePurgedStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteStopped(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteStoppedMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteStoppedLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteStoppedStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteStoppedStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteCancelled(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteCancelledMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteCancelledLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteCancelledStopLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteCancelledStopLoss';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteRejected(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteRejectedMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteRejectedLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteRejectedStopLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteRejectedStopLoss';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteDoneForDay(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteDoneForDayMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteDoneForDayLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteDoneForDayStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteDoneForDayStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteFilled(data) {
	const keyLanguage = 'noteFilled';
	return getNote(keyLanguage, data);
}

export function getNotePartiallyFilled(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'notePartiallyFilledMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'notePartiallyFilledLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'notePartiallyFilledStopLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'notePartiallyFilledStopLoss';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNotePendingNew(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'notePendingNewMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'notePendingNewLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'notePendingNewStopLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'notePendingNewStopLoss';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteNew(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteNewMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteNewLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteNewStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteNewStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteDenyReplace(data) {
	let keyLanguage = '';
	let orderActionObj = {};
	let noteObj = {};
	let noteData = {};
	const {
		order_type: orderType,
		is_buy: isBuy,
		order_action: orderAction
	} = data;
	try {
		orderActionObj = JSON.parse(orderAction);
		noteObj = JSON.parse(orderActionObj.note);
		noteData = noteObj.data;
	} catch (error) {
		console.log('parse note error', error);
	}
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	// old
	const volume =
		noteData['volume_old'] || noteData.volume || noteData.quantity;
	const limitPrice = noteData['limit_price_old'] || noteData['limit_price'];
	const stopPrice = noteData['stop_price_old'] || noteData['stop_price'];

	// new
	const requestQuantity =
		noteData['request_quantity'] || noteData.volume || noteData.quantity;
	const requestLimitPrice =
		noteData['request_limit_price'] || noteData['limit_price'];
	const requestStopPrice =
		noteData['request_stop_price'] || noteData['stop_price'];

	data['volume'] = volume;
	data['limit_price'] = limitPrice;
	data['stop_price'] = stopPrice;
	data['request_quantity'] = requestQuantity;
	data['request_limit_price'] = requestLimitPrice;
	data['request_stop_price'] = requestStopPrice;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteRejectModifyMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteRejectModifyLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteRejectModifyStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteRejectModifyStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteDenyCancel(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteRejectCancelMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteRejectCancelLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteRejectCancelStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteRejectCancelStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteApproveReplace(data) {
	let keyLanguage = '';
	const {
		order_type: orderType,
		is_buy: isBuy,
		order_action: orderAction
	} = data;
	let orderActionObj = {};
	let noteObj = {};
	let noteData = {};
	try {
		orderActionObj = JSON.parse(orderAction);
		noteObj = JSON.parse(orderActionObj.note);
		noteData = noteObj.data;
	} catch (error) {
		console.log('parse note error', error);
	}
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	// old
	const volume =
		noteData['volume_old'] || noteData.volume || noteData.quantity;
	const limitPrice = noteData['limit_price_old'] || noteData['limit_price'];
	const stopPrice = noteData['stop_price_old'] || noteData['stop_price'];

	// new
	const requestQuantity =
		noteData['request_quantity'] || noteData.volume || noteData.quantity;
	const requestLimitPrice =
		noteData['request_limit_price'] || noteData['limit_price'];
	const requestStopPrice =
		noteData['request_stop_price'] || noteData['stop_price'];

	data['volume'] = volume;
	data['limit_price'] = limitPrice;
	data['stop_price'] = stopPrice;
	data['request_quantity'] = requestQuantity;
	data['request_limit_price'] = requestLimitPrice;
	data['request_stop_price'] = requestStopPrice;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteApproveModifyMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteApproveModifyLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteApproveModifyStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteApproveModifyStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteApproveCancel(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteApproveCancelMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteApproveCancelLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteApproveCancelStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteApproveCancelStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNotePendingReplace(data) {
	let keyLanguage = '';
	const {
		order_type: orderType,
		is_buy: isBuy,
		order_action: orderAction
	} = data;
	let orderActionObj = {};
	let noteObj = {};
	let noteData = {};
	try {
		orderActionObj = JSON.parse(orderAction);
		noteObj = JSON.parse(orderActionObj.note);
		noteData = noteObj.data;
	} catch (error) {
		console.log('parse note error', error);
	}
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	// old
	const volume =
		noteData['volume_old'] || noteData.volume || noteData.quantity;
	const limitPrice = noteData['limit_price_old'] || noteData['limit_price'];
	const stopPrice = noteData['stop_price_old'] || noteData['stop_price'];

	// new
	const requestQuantity =
		noteData['request_quantity'] || noteData.volume || noteData.quantity;
	const requestLimitPrice =
		noteData['request_limit_price'] || noteData['limit_price'];
	const requestStopPrice =
		noteData['request_stop_price'] || noteData['stop_price'];

	data['volume'] = volume;
	data['limit_price'] = limitPrice;
	data['stop_price'] = stopPrice;
	data['request_quantity'] = requestQuantity;
	data['request_limit_price'] = requestLimitPrice;
	data['request_stop_price'] = requestStopPrice;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'notePendingModifyMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'notePendingModifyLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'notePendingModifyStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'notePendingModifyStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNotePendingCancel(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'notePendingCancelMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'notePendingCancelLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'notePendingCancelStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'notePendingCancelStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteTrigger(data) {
	let keyLanguage = '';
	const { order_type: orderType } = data;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteTriggerStopLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteTriggerStopLoss';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteCancel(data) {
	let keyLanguage = '';
	const { order_type: orderType, is_buy: isBuy } = data;
	const side = isBuy === 1 ? 'BUY' : 'SELL';
	data.side = side;
	switch (orderType) {
		case ORDER_TYPE_SYSTEM.MARKET_ORDER:
		case ORDER_TYPE_SYSTEM.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_STRING.MARKETTOLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.MARKETTOLIMIT:
			keyLanguage = 'noteCancelMarket';
			break;
		case ORDER_TYPE_SYSTEM.LIMIT_ORDER:
		case ORDER_TYPE_STRING.LIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.LIMIT:
			keyLanguage = 'noteCancelLimit';
			break;
		case ORDER_TYPE_SYSTEM.STOPLIMIT_ORDER:
		case ORDER_TYPE_STRING.STOPLIMIT_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLIMIT:
			keyLanguage = 'noteCancelStopLimitBeforeTrigger';
			break;
		case ORDER_TYPE_SYSTEM.STOP_ORDER:
		case ORDER_TYPE_SYSTEM.STOPLOSS_ORDER:
		case ORDER_TYPE_STRING.STOP_ORDER:
		case ORDER_TYPE_STRING.STOPLOSS_ORDER:
		case ORDER_TYPE_ORIGIN_UPPER.STOP:
		case ORDER_TYPE_ORIGIN_UPPER.STOPLOSS:
			keyLanguage = 'noteCancelStopLossBeforeTrigger';
			break;
	}
	return getNote(keyLanguage, data);
}

export function getNoteDetail(noteObj, symbolObj) {
	const orderState = noteObj.order_state;
	if (orderState === NOTE_STATE.USER_PLACE) {
		return getPlaceNoteString(noteObj, symbolObj);
	}
	return getAmendNoteString(noteObj, symbolObj);
}

export function setTimeoutClick(isPress) {
	isPress = true;
	setTimeout(() => {
		isPress = false;
	}, 1000);
}

export function getDetailPriceBoard(userId, priceBoardId) {
	const url = Api.getDetailPriceBoardUrl(userId, priceBoardId);
	return Api.requestData(url);
}

export function createPriceBoardDetail(userId, item) {
	const url = Api.getPriceBoardUrl(userId);
	return Api.postData(url, { data: item });
}

export function updatePriceBoardDetail(priceboardId, userId, item) {
	const url = Api.getUpdatePriceBoardUrl(
		encodeURIComponent(priceboardId),
		userId
	);
	return Api.putData(url, { data: item });
}

export function getSymbolInfoMultiExchange(listSymbol) {
	return new Promise(async (resolve) => {
		if (!Util.arrayHasItem(listSymbol)) return resolve();

		const listSymbolInfo = [];
		const listCodeNotHave = [];
		listSymbol.map((symbol) => {
			const symbolObj = FuncStorage.getSymbolObj(symbol);
			if (symbolObj && !Util.compareObject(symbolObj, {})) {
				listSymbolInfo.push(symbolObj);
			} else listCodeNotHave.push(symbol);
		});

		if (Util.arrayHasItem(listCodeNotHave)) {
			const listUrl = [];
			const listStr = StreamingBusiness.getStringSymbol(listCodeNotHave);
			listStr.map((str) => {
				listUrl.push(Api.getSymbolUrlByStringQuery(str));
			});
			const listPromise = listUrl.map((url) => Api.requestData(url));
			const listRes = await Promise.all(listPromise);
			listRes.map((res) => listSymbolInfo.push(...res));
		}

		listSymbolInfo.map((item) => checkAndAddToDic(item));
		resolve(listSymbolInfo);
	});
}

export function getSymbolInfoMultiExchange1(listSymbol) {
	return new Promise(async (resolve) => {
		if (!Util.arrayHasItem(listSymbol)) return resolve();

		const listCodeNotHave = [];
		listSymbol.map((symbol) => {
			const symbolObj = FuncStorage.getSymbolObj(symbol);
			if (!symbolObj || Util.compareObject(symbolObj, {}))
				listCodeNotHave.push(symbol.replace('#', '.'));
		});

		if (Util.arrayHasItem(listCodeNotHave)) {
			const listUrl = [];
			const listStr = StreamingBusiness.getStringSymbol(listCodeNotHave);
			listStr.map((str) => {
				listUrl.push(Api.getSymbolUrlByStringQuery(str));
			});
			const listPromise = listUrl.map((url) => Api.requestData1(url));
			const listRes = await Promise.all(listPromise);
			listRes.map((res) => res.map((obj) => checkAndAddToDic(obj)));
		}
		resolve(listSymbol.map((symbol) => FuncStorage.getSymbolObj(symbol)));
	});
}
export function updatePriceBoardSpecify({
	priceboardId,
	data,
	bypassUpdateStorage,
	isChangeWLName = false
}) {
	const url = Api.getUpdatePriceBoardSpecifyUrl({
		priceboardId,
		isChangeWLName
	});
	console.log('WL NAME updatePriceBoardSpecify', url);
	return Api.putData(url, { data: data });
}
export function removeSymbolPriceBoard({
	priceboardId,
	data,
	bypassUpdateStorage
}) {
	const url = Api.getUrlRemoveSymbolPriceBoard({ priceboardId });
	return Api.putData(url, { data: data });
}

export function addSymbolPriceBoard({
	priceboardId,
	data,
	bypassUpdateStorage
}) {
	const url = Api.getUrlAddSymbolPriceBoard({ priceboardId });
	return Api.putData(url, { data });
}

export function getMarketExchangeInfo(exchange) {
	const url = Api.getUrlMarketExchangeInfo({ exchange });
	return Api.requestData1(url);
}

export function updateUserPriceboard(
	priceboardId,
	userId,
	newPriceboard,
	bypassUpdateStorage
) {
	console.log('###newPriceboard', newPriceboard);
	const url = Api.getUpdatePriceBoardUrl(priceboardId, userId);
	!bypassUpdateStorage && FuncStorage.resetPriceBoardWatchList(newPriceboard);
	LogDevice(
		`info`,
		`updateUserPriceboard priceboardId: ${priceboardId} - userID: ${userId} - newPriceboard: ${JSON.stringify(
			newPriceboard
		)}`
	);

	// handle at local
	const emitData = { ...newPriceboard };
	Emitter.emit('###newPriceboard', emitData);
	delete newPriceboard.updated_time;
	delete newPriceboard.init_time;
	userId && (newPriceboard.user_id = userId);
	return Api.putData(url, { data: newPriceboard });
}
// add list symbol
export function addListSymbolToPriceboard(
	priceboardId,
	userId,
	listObjSymbol,
	listSymbol,
	bypassUpdateStorage
) {
	const priceboardDetail =
		FuncStorage.getPriceboardDetailInPriceBoard(priceboardId);
	if (!priceboardDetail) {
		LogDevice(
			`error`,
			`priceboardId: ${priceboardId} of userId: ${userId} not exist, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}
	if (
		priceboardDetail.value &&
		priceboardDetail.value.find((item) => listSymbol.includes(item.symbol))
	) {
		LogDevice(
			`error`,
			`LIST SYMBOL  exist in priceboardId: ${priceboardId} of userId: ${userId}, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}

	priceboardDetail.value = priceboardDetail.value || [];
	priceboardDetail.value.unshift(...listObjSymbol);
	let currentTime = new Date().getTime();
	priceboardDetail.value.map((item) => {
		item.rank = ++currentTime;
	});
	delete priceboardDetail.init_time;
	priceboardDetail.user_id = userId;
	LogDevice(
		`info`,
		`ADD LIST SYMBOL ${listSymbol} TO PRICEBOARD: ${priceboardId} - userID: ${userId} - body: ${JSON.stringify(
			priceboardDetail
		)}`
	);
	return updateUserPriceboard(
		priceboardId,
		userId,
		priceboardDetail,
		bypassUpdateStorage
	);
}
// remove list symbol
export function removeListSymbolInPriceboard(
	priceboardId,
	userId,
	dicSymbol,
	bypassUpdateStorage
) {
	const priceboardDetail =
		FuncStorage.getPriceboardDetailInPriceBoard(priceboardId);

	if (!priceboardDetail || !Util.arrayHasItem(priceboardDetail.value)) {
		LogDevice(
			`error`,
			`priceboardId: ${priceboardId} of userId: ${userId} not exist, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}
	if (!priceboardDetail.value.find((item) => dicSymbol[item.symbol])) {
		LogDevice(
			`error`,
			`Symbol ${dicSymbol} not exist in priceboardId: ${priceboardId} of userId: ${userId}, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}

	priceboardDetail.value = priceboardDetail.value.filter(
		(item) => !dicSymbol[item.symbol]
	);
	delete priceboardDetail.init_time;
	priceboardDetail.user_id = userId;
	return updateUserPriceboard(
		priceboardId,
		userId,
		priceboardDetail,
		bypassUpdateStorage
	);
}
// add 1 symbol
export function addSymbolToPriceboard(
	priceboardId,
	userId,
	symbol,
	bypassUpdateStorage
) {
	const priceboardDetail =
		FuncStorage.getPriceboardDetailInPriceBoard(priceboardId);

	if (!priceboardDetail) {
		LogDevice(
			`error`,
			`priceboardId: ${priceboardId} of userId: ${userId} not exist, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}
	if (
		priceboardDetail.value &&
		priceboardDetail.value.find((item) => item.symbol === symbol)
	) {
		LogDevice(
			`error`,
			`Symbol ${symbol} exist in priceboardId: ${priceboardId} of userId: ${userId}, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}

	priceboardDetail.value = priceboardDetail.value || [];
	priceboardDetail.value.unshift({ symbol });
	let currentTime = new Date().getTime();
	priceboardDetail.value.map((item) => {
		item.rank = ++currentTime;
	});
	delete priceboardDetail.init_time;
	priceboardDetail.user_id = userId;
	LogDevice(
		`info`,
		`ADD SYMBOL ${symbol} TO PRICEBOARD: ${priceboardId} - userID: ${userId} - body: ${JSON.stringify(
			priceboardDetail
		)}`
	);
	return updateUserPriceboard(
		priceboardId,
		userId,
		priceboardDetail,
		bypassUpdateStorage
	);
}

export function removeSymbolInPriceboard(
	priceboardId,
	userId,
	symbol,
	bypassUpdateStorage
) {
	const priceboardDetail =
		FuncStorage.getPriceboardDetailInPriceBoard(priceboardId);

	if (!priceboardDetail || !Util.arrayHasItem(priceboardDetail.value)) {
		LogDevice(
			`error`,
			`priceboardId: ${priceboardId} of userId: ${userId} not exist, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}
	if (!priceboardDetail.value.find((item) => item.symbol === symbol)) {
		LogDevice(
			`error`,
			`Symbol ${symbol} not exist in priceboardId: ${priceboardId} of userId: ${userId}, data: ${JSON.stringify(
				priceboardDetail
			)}`
		);
		return Promise.resolve();
	}

	priceboardDetail.value = priceboardDetail.value.filter(
		(item) => item.symbol !== symbol
	);
	delete priceboardDetail.init_time;
	priceboardDetail.user_id = userId;
	return updateUserPriceboard(
		priceboardId,
		userId,
		priceboardDetail,
		bypassUpdateStorage
	);
}

export function addSymbolToFavorites(symbol, bypassUpdateStorage) {
	const priceBoardId = WATCHLIST.USER_WATCHLIST;
	const userId = DataStorage.user_id;
	return addSymbolToPriceboard(
		priceBoardId,
		userId,
		symbol,
		bypassUpdateStorage
	);
}

export function removeSymbolInFavorites(symbol, bypassUpdateStorage) {
	const priceBoardId = WATCHLIST.USER_WATCHLIST;
	const userId = DataStorage.user_id;
	return removeSymbolInPriceboard(
		priceBoardId,
		userId,
		symbol,
		bypassUpdateStorage
	);
}

export function createUserPriceboard(userId, newPriceboard) {
	return new Promise((resolve, reject) => {
		const url = Api.getCreatePriceBoardUrl(userId);
		return Api.postData(url, { data: newPriceboard })
			.then((data) => {
				FuncStorage.resetPriceBoardWatchList(data);
				resolve(data);
			})
			.catch(reject);
	});
}

export function addSymbolToWatchlist(priceboardId, userId, newSymbol) {
	const url = Api.getUpdateSymbolInPriceBoardUrl(priceboardId, userId, 'add');
	return Api.putData(url, { data: newSymbol });
}

export function removeSymbolToWatchlist(priceboardId, userId, deleteSymbol) {
	const url = Api.getUpdateSymbolInPriceBoardUrl(
		priceboardId,
		userId,
		'remove'
	);
	return Api.putData(url, { data: deleteSymbol });
}

export function deletePriceboard(priceboardId, userId) {
	const url = Api.getUpdatePriceBoardUrl(priceboardId, userId);
	return Api.deleteData(url);
}

export function pushUpdatePriceboardName(priceboardId, userId, watchlistName) {
	const oldPriceboard =
		FuncStorage.getPriceboardDetailInPriceBoard(priceboardId);
	delete oldPriceboard.init_time;
	oldPriceboard.watchlist_name = watchlistName;
	oldPriceboard.user_id = userId;
	const url = Api.getUpdatePriceBoardUrl(
		encodeURIComponent(priceboardId),
		userId
	);
	return Api.putData(url, { data: oldPriceboard });
}

export function getObjMoveToCreateWatchlistScreen(config) {
	return {
		screen: 'equix.CreatePriceboard',
		title: I18n.t('createNewWatchList'),
		backButtonTitle: ' ',
		animationType: 'slide-up',
		overrideBackPress: true,
		navigatorStyle: {
			...CommonStyle.navigatorSpecial,
			...{ drawUnderNavBar: true }
		}
	};
}

export function getSymbolPriceboardStatic(priceboardId, userId) {
	const url = Api.getUrlPriceboardStatic(priceboardId);
	return Api.requestData(url);
}

/* #region ORDER BUSINESS */
export function getStatusString(orderStatus) {
	return ORDER_STATUS_STRING[orderStatus];
}

export function getBgColorOrderTypeTag(orderStatus) {
	switch (orderStatus) {
		case ORDER_STATE_ENUM.PLACE:
		case ORDER_STATE_ENUM.REPLACE:
		case ORDER_STATE_ENUM.CANCEL:
		case ORDER_STATE_ENUM.PENDING_NEW:
		case ORDER_STATE_ENUM.PENDING_REPLACE:
		case ORDER_STATE_ENUM.PENDING_CANCEL:
		case ORDER_STATE_ENUM.TRIGGER:
		case ORDER_STATE_ENUM.APPROVE_ACTION_CANCEL:
		case ORDER_STATE_ENUM.APPROVE_ACTION_REPLACE:
		case ORDER_STATE_ENUM.REJECT_ACTION_CANCEL:
		case ORDER_STATE_ENUM.REJECT_ACTION_REPLACE:
			// return CommonStyle.orderStateTagJungleGreen
			return CommonStyle.color.modify;
		case ORDER_STATE_ENUM.NEW:
		case ORDER_STATE_ENUM.REPLACED:
		case ORDER_STATE_ENUM.CALCULATED:
		case ORDER_STATE_ENUM.DONE_FOR_DAY:
		case ORDER_STATE_ENUM.ACCEPTED_FOR_BIDDING:
		case ORDER_STATE_ENUM.PARTIALLY_FILLED:
			// return CommonStyle.orderStateTagGoldenBell
			return CommonStyle.color.warning;
		case ORDER_STATE_ENUM.FILLED:
			// return CommonStyle.orderStateTagDodgeBlue
			return CommonStyle.color.buy;
		case ORDER_STATE_ENUM.STOPPED:
		case ORDER_STATE_ENUM.SUSPENDED:
		case ORDER_STATE_ENUM.REJECTED:
		case ORDER_STATE_ENUM.EXPIRED:
		case ORDER_STATE_ENUM.CANCELLED:
		case ORDER_STATE_ENUM.PURGED:
			// return CommonStyle.orderStateTagRadicalRed
			return CommonStyle.color.sell;
	}
}

export function reloadOrderList() {
	const orderTab = DataStorage.orderTab || filterType.WORKING;
}

export function getExchangeByClassSymbol(classSymbol) {
	switch (classSymbol) {
		case SYMBOL_CLASS.ETFS:
		case SYMBOL_CLASS.MF:
			return EXCHANGE_CODE.ETF_MF_ASX;
		case SYMBOL_CLASS.WARRANT:
			return EXCHANGE_CODE.AXW;
		default:
			// Equity
			return EXCHANGE_CODE.ASX;
	}
}

export function getClassBySymbol(symbol) {
	if (
		DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].class
	) {
		return DataStorage.symbolEquity[symbol].class;
	}
	return '';
}
export function getLotSizeBySymbolAndExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	if (exchange === 'NAS' || exchange === 'NYS') return 1;

	if (
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].lot_size
	) {
		return DataStorage.symbolEquity[keyInfo].lot_size;
	}
	return null;
}
export function getClassBySymbolAndExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	if (
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].class
	) {
		return DataStorage.symbolEquity[keyInfo].class;
	}
	return '';
}
export function getMarketCapBySymbolExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	if (
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].market_capitalization
	) {
		return DataStorage.symbolEquity[keyInfo].market_capitalization;
	}
	return '--';
}

export function getPERatioBySymbolExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	if (
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].pe_ratio
	) {
		return DataStorage.symbolEquity[keyInfo].pe_ratio;
	}
	return '--';
}

export function getYearlyDividendBySymbolExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	if (
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].yearly_dividend
	) {
		return DataStorage.symbolEquity[keyInfo].yearly_dividend;
	}
	return '--';
}

export function filterSymbolByClass(listSymbol) {
	const objSymbolByClass = {};
	listSymbol.map((e) => {
		const symbolClass = e.class || e.symbolClass || e.classSymbol || '';
		// push vao class ALL TYPES
		const keyClass = SYMBOL_CLASS.ALL_TYPES;
		objSymbolByClass[keyClass] = objSymbolByClass[keyClass] || [];
		objSymbolByClass[keyClass].push(e);
		// push vao tung class
		Object.keys(SYMBOL_CLASS).map((item) => {
			const keyClass = SYMBOL_CLASS[item];
			const enumClass = keyClass || ''; // Dung key enum khong dung key dich , exception khi key dich future la futures
			objSymbolByClass[keyClass] = objSymbolByClass[keyClass] || [];
			if (enumClass.toUpperCase() === symbolClass.toUpperCase()) {
				objSymbolByClass[keyClass].push(e);
			}
		});
	});
	return objSymbolByClass;
}

function getUrlCheckVetting(type = Enum.ORDER_ACTION.PLACE, orderID) {
	switch (type) {
		case Enum.ORDER_ACTION.AMEND:
			return Api.getApiVettingAmendOrder(orderID);
		case Enum.ORDER_ACTION.CANCEL:
			return Api.getApiVettingCancelOrder(orderID);
		default:
			return Api.getApiVettingPlaceOrder();
	}
}
function getUrlCheckVettingIress(type = Enum.ORDER_ACTION.PLACE, orderID) {
	return Api.getApiVettingPlaceOrderIress();
}

function getCheckVettingFunction(type = Enum.ORDER_ACTION.PLACE) {
	switch (type) {
		case Enum.ORDER_ACTION.AMEND:
			return Api.putData;
		case Enum.ORDER_ACTION.CANCEL:
			return Api.deleteData;
		default:
			return Api.postData;
	}
}

function getError(errorCode) {
	const keyLanguage = ORDER_ENUM[errorCode] || '';
	if (!errorCode) return '';
	if (!keyLanguage) return errorCode.replace(/_/g, ' '); // fix bug eslin
	return I18n.t(keyLanguage);
}

export function getArrayError(errorCode) {
	let errorText = '';
	if (Util.arrayHasItem(errorCode)) {
		const minErrorCode = Math.min(...errorCode);
		errorText = getError(minErrorCode);
	} else {
		errorText = getError(errorCode);
	}
	return errorText;
}

// PASS vetting
function resolvePassResponse(resolve) {
	const result = {
		status: Enum.RESPONSE_STATUS.PASS
	};
	resolve(result);
}

// FAIL vetting -> list error code
function resolveFailResponse(errorCode, resolve) {
	try {
		let errorText = '';
		if (Util.arrayHasItem(errorCode)) {
			const minErrorCode = Math.min(...errorCode);
			errorText = getError(minErrorCode);
		} else {
			errorText = getError(errorCode);
		}
		const result = {
			status: Enum.RESPONSE_STATUS.FAIL,
			errorCode: errorText
		};
		resolve(result);
	} catch (error) {
		console.log(error);
		const result = {
			status: Enum.RESPONSE_STATUS.EXCEPTION,
			errorCode: error
		};
		resolve(result);
	}
}

// EXCEPTIONG vetting -> error
function resolveExceptionResponse(error, resolve) {
	const result = {
		status: Enum.RESPONSE_STATUS.EXCEPTION,
		errorCode: getError(error)
	};
	resolve(result);
}

export function checkVettingOrder(
	type = Enum.ORDER_ACTION.PLACE,
	orderObject,
	byPassVetting = false,
	orderID
) {
	return new Promise((resolve) => {
		if (byPassVetting) {
			return resolvePassResponse(resolve);
		}

		const url = getUrlCheckVettingIress(type, orderID);
		const checkVettingFn = getCheckVettingFunction();
		const timeout = Time.TIMEOUT;

		checkVettingFn &&
			checkVettingFn(url, { data: orderObject }, timeout)
				.then((res) => {
					if (res) {
						LogDevice(
							'info',
							`CHECK VETTING URL: ${url} - RESPONSE: ${JSON.stringify(
								res
							)}`
						);
						// 1> Nếu error sẽ trả về errorCode: [list error Code]
						// 2> Nếu success sẽ trả errorCode: 'SUCCESS'
						const { errorCode } = res;
						if (errorCode === Enum.ERROR_CODE.TIMEOUT) {
							resolveExceptionResponse(
								Enum.ERROR_CODE.TIMEOUT,
								resolve
							); // not show
						} else if (
							errorCode === Enum.ERROR_CODE.INVALID_ORDER
						) {
							resolveFailResponse(errorCode, resolve); // show
						} else if (
							errorCode === Enum.ERROR_CODE.SUCCESS ||
							errorCode === '200'
						) {
							// Check vetting success but error code return 'Enum.ERROR_CODE.SUCCESS' not Enum.ERROR_CODE.SUCCESS
							resolvePassResponse(resolve); // show
						} else {
							resolveFailResponse(errorCode, resolve); // show
						}
					} else {
						LogDevice('info', `CHECK VETTING RESPONSE IS NULL`);
						resolveExceptionResponse(
							Enum.ERROR_CODE.RESPONSE_NULL,
							resolve
						); // not show
					}
				})
				.catch((error) => {
					LogDevice('info', `CHECK VETTING EXCEPTION: ${error}`);
					const errorCode = Enum.ERROR_CODE.UNKNOWN_ERROR;
					resolveFailResponse(errorCode, resolve); // show
				});
	});
}

export function setSelectionTextInput(ref, start, end) {
	if (start > 0) {
		if (end) {
			// boi den -> (ref, 0)
			ref.setNativeProps({
				selection: {
					start,
					end
				}
			});
		} else {
			// selection tai 1 vi tri -> (ref, 0, 1)
			ref.setNativeProps({
				selection: {
					start: start - 1,
					end: start - 1
				}
			});

			ref.setNativeProps({
				selection: {
					start: start,
					end: start
				}
			});
		}
	}
}

export function getOrderCacheKey(data) {
	const symbol = data.symbol || data.code;
	const brokerOrderID = data.broker_order_id;
	if (!symbol || !brokerOrderID) return '';
	const prefix = isParitech(symbol) ? 'AU' : 'US';
	return `${prefix}_${brokerOrderID}`;
}
/* #endregion */

/* #region user/account */
export function getListAccountRetail(userId) {
	return new Promise((resolve) => {
		const url = Api.getUrlAccountByUserId(userId);
		return Api.requestData(url, true)
			.then((data) => {
				let listAccounts = data || [];
				if (listAccounts.length) {
					listAccounts = listAccounts.filter((e) => {
						const status = e.status || 'active';
						return status === 'active';
					});
				}
				if (listAccounts.length <= 5) {
					Controller.setIsSearchAccount(false);
				} else {
					Controller.setIsSearchAccount(true);
				}
				const isLoadLastAccount = true;
				const isCheckFirstAccount = true;
				const loadLastAccountCb = () => {
					LogDevice(
						'info',
						`GET LIST ACCOUNT USERID: ${userId} - SUCCESS - DataStorage.accountID = ${DataStorage.accountId}`
					);
					resolve();
				};
				Util.subListAccount({
					listAccounts,
					isLoadLastAccount,
					isCheckFirstAccount,
					loadLastAccountCb
				});
			})
			.catch((error) => {
				console.log('cannot get account id: ', error);
				LogDevice('error', `CANT GET ACCOUNT ID - ERROR: ${error}`);
				resolve();
			});
	});
}

export function getAccountManagementGroup(filter) {
	return new Promise((resolve) => {
		const pageSize = 6;
		const pageID = 1;
		// Thay doi sang link search elastic_search
		const url = Api.getURLTopAccountActive(pageSize, pageID);
		const bodyData = getAccountListByAccountIdAndStatus(
			Enum.STATUS_ACCOUNT.ACTIVE
		);
		return Api.postData(url, bodyData)
			.then((data) => {
				if (data) {
					let listAccounts = data.data || [];
					if (listAccounts.length <= 5) {
						Controller.setIsSearchAccount(false);
					} else {
						Controller.setIsSearchAccount(true);
					}
					if (listAccounts.length) {
						listAccounts = listAccounts.filter((e) => {
							const status = e.status || 'active';
							return status === 'active';
						});
					}
					const isLoadLastAccount = true;
					const isCheckFirstAccount = true;
					const alwaysManage = true;
					const loadLastAccountCb = () => {
						LogDevice('info', `getAccountManagementGroup SUCCESS`);
						resolve();
					};
					Util.subListAccount({
						listAccounts,
						isLoadLastAccount,
						isCheckFirstAccount,
						loadLastAccountCb,
						alwaysManage
					});
				} else {
					LogDevice('error', `getAccountManagementGroup IS NULL`);
					resolve();
				}
			})
			.catch((error) => {
				console.log('cannot get account id: ', error);
				LogDevice(
					'error',
					`getAccountManagementGroup - ERROR: ${error}`
				);
				resolve();
			});
	});
}
/* #endregion */

/* #region auth */
export function getEncryptText(text) {
	return new Promise((resolve) => {
		const sessionID = Util.getRandomKey();
		const url = Api.getApiSecretKey(sessionID);
		const bodyData = {};
		const byPassAccessToken = true;
		Api.postData(url, bodyData, null, false, byPassAccessToken)
			.then((res) => {
				const data = res.data || {};
				const secretKey = data.key;
				if (secretKey) {
					const encryptText = Util.encrypt(text, secretKey);
					console.log('encrypt text', encryptText);
					console.log(
						'original text',
						Util.decrypt(encryptText, secretKey)
					);
					return resolve({ encryptText, sessionID });
				}
				return resolve(text);
			})
			.catch((err) => {
				console.log(err);
				return resolve(text);
			});
	});
}

export function getSecretKey() {
	return new Promise((resolve) => {
		const sessionID = Util.getRandomKey();
		const url = Api.getApiSecretKey(sessionID);
		const bodyData = {};
		const byPassAccessToken = true;
		Api.postData(url, bodyData, null, false, byPassAccessToken)
			.then((res) => {
				const data = res.data || {};
				const secretKey = data.key;
				if (secretKey) {
					return resolve({ secretKey, sessionID });
				}
				return resolve({});
			})
			.catch((err) => {
				console.log(err);
				return resolve({});
			});
	});
}
/* #endregion */

/* #region notification */
const cbSuccess = () => {
	console.info('SUCCESS SUB');
};
const cbError = () => {
	console.info('ERROR SUB');
};

export function requestNotiPermission() {
	firebase
		.messaging()
		.requestPermission()
		.then(() => {})
		.catch((error) => {
			console.log('notification permission rejected', error);
		});
}

export function setNotification({
	notificationId,
	title,
	body,
	data = {},
	badge = 0,
	channelId = Enum.CHANNEL_NOTIFICATION_ID_ANDROID
}) {
	const notification = new firebase.notifications.Notification({
		show_in_foreground: true,
		sound: 'default'
	})
		.setNotificationId(notificationId)
		.setBody(body)
		.setTitle(title)
		.setData(data)
		.android.setChannelId(channelId)
		.android.setColor('#10a8b2')
		.android.setAutoCancel(true)
		.android.setSmallIcon('ic_notification')
		.android.setBigText(body)
		.android.setVibrate([500])
		.android.setPriority(firebase.notifications.Android.Priority.Max)
		.android.setGroupAlertBehaviour(
			firebase.notifications.Android.GroupAlert.All
		)
		.android.setCategory(firebase.notifications.Android.Category.Alarm)
		.ios.setBadge(badge);
	if (Controller.getSound() === 'default' || Util.isAndroid()) {
		// with android < 8 need set sound to show head-up notification
		notification.setSound('default');
	}

	return notification;
}

export function displayNotification(notification) {
	firebase.notifications().displayNotification(notification);
}

export function notificationOpenedListener(cb) {
	firebase.notifications().onNotificationOpened((notificationOpen) => {
		// Get the action triggered by the notification being opened
		const action = notificationOpen.action;
		// Get information about the notification that was opened
		const notif = notificationOpen.notification;
		Keyboard.dismiss();
		DataStorage.clickedNoti = true;
		cb && cb(notif);
	});
	firebase
		.notifications()
		.getInitialNotification()
		.then((notificationOpen) => {
			if (notificationOpen) {
				// Get the action triggered by the notification being opened
				const action = notificationOpen.action;
				// Get information about the notification that was opened
				const notif = notificationOpen.notification;
				Keyboard.dismiss();
				DataStorage.clickedNoti = true;
				cb && cb(notif);
			}
		});
}

export function createAndroidNotiChannel(
	channelId = Enum.CHANNEL_NOTIFICATION_ID_ANDROID
) {
	// Build a channel
	const channel = new firebase.notifications.Android.Channel(
		channelId,
		'Equix Android Notification Channel',
		firebase.notifications.Android.Importance.Max
	)
		.setDescription('Equix Android Notification Channel')
		.setSound('default')
		.enableLights(true)
		.enableVibration(true)
		.setVibrationPattern(Enum.ANDROID_VIBRATION_PATTERN);

	// Create the channel
	firebase.notifications().android.createChannel(channel);
}

export function getMessagingToken() {
	firebase
		.messaging()
		.getToken()
		.then((fcmToken) => {
			if (fcmToken) {
				Controller.setFCMToken(fcmToken);
				console.log('FCM TOKEN: ', fcmToken);
				LogDevice('info', `FCM TOKEN: ${fcmToken}`);
			} else {
				LogDevice('info', `FCM TOKEN IS NULL`);
			}
		})
		.catch((error) => {
			console.log('get fcm token error: ', error);
		});
}

export function subFCM() {
	const fcmToken = Controller.getFCMToken();
	const url = Api.getUrlSubscribeFCM();
	const data = {
		user_id: Controller.getUserId(),
		fcm_token: fcmToken,
		device_id: DataStorage.deviceId
	};
	Api.postData(url, { data })
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log('subFCM', err);
		});
}

export function unsubFCM() {
	const fcmToken = Controller.getFCMToken();
	const url = Api.getUrlUnsubscribeFCM();
	const data = {
		user_id: Controller.getUserId(),
		fcm_token: fcmToken,
		device_id: DataStorage.deviceId
	};
	Api.postData(url, { data })
		.then((res) => {
			console.log(res);
		})
		.catch((err) => {
			console.log('unsubFCM', err);
		});
}

export function alertInAppNoti({ notiObj = {} }) {
	const { body, title } = notiObj;

	// const { alert_id: notificationId = '' } = objChanged;

	// const data = {
	//     notify_type: NotiType.ALERT,
	//     obj_id: notificationId,
	//     data: objChanged,
	//     id: notificationId
	// };
	// react native firebase display notification
	const badge = 0;
	const notification = setNotification({
		// notificationId,
		title,
		body,
		// data,
		badge
	});
	displayNotification(notification);
}

export function alertInAppOrder({ notiObj = {} }) {
	try {
		const { body, data: objChanged, title } = notiObj;
		const {
			broker_order_id: brokerOrderId = '',
			seq_num: seqNumb = '',
			updated = '',
			exchange_updated: exchangeUpdated = ''
		} = objChanged;
		// Trùng notificationId nên sẽ chỉ hiển thị lastest notification
		const notificationId = `${brokerOrderId}_${seqNumb}_${updated}_${exchangeUpdated}`;
		const data = {
			payload: {
				body,
				title,
				noti_type: NotiType.ORDER,
				obj_id: notificationId,
				data: objChanged,
				id: notificationId
			}
		};
		// react native firebase display notification
		const badge = 0;
		const notification = setNotification({
			notificationId,
			title,
			body,
			data,
			badge
		});
		displayNotification(notification);
	} catch (error) {
		LogDevice('error', `error at alertInAppOrder ${error}`);
	}
}
function parseJsonTryCatch(obj) {
	try {
		obj = JSON.parse(obj);
		return obj;
	} catch (error) {
		console.log('error parse Json onNotification', error);
		LogDevice(
			'error',
			`parse Json onNotification data FCM TOKEN: ${obj} FCM TOKEN: ${error}`
		);
		if (typeof obj === 'object') return obj;
		return {};
	}
}
export function alertInAppMarginCall({ notiObj = {} }) {
	try {
		// notiObj = {
		//     title: 'DEMO ACCOUNT 79 (123456)',
		//     body: '13/03/2020-11:03:52 The Margin Call execution of account 123456 has failed. Please manually process the margin call.',
		//     noti_type: 'MARGIN_CALL#FAIL_MARGIN',
		//     data: {
		//         title: 'Margin Call Error',
		//         account_id: '123456',
		//         account_name: 'DEMO ACCOUNT 79',
		//         typeMargin: 'fail_margin',
		//         level: 15,
		//         lang: 'en',
		//         updated: 1584072232470
		//     }
		// }

		const { body, data, title } = notiObj;
		const notificationId = `15840722324780__123456`;
		// react native firebase display notification
		const badge = 0;
		const notification = setNotification({
			notificationId,
			title,
			body,
			data,
			badge
		});
		displayNotification(notification);
	} catch (error) {
		LogDevice('error', `error at marginControlInAppOrder ${error}`);
	}
}
// -------notification inside App , register at app.ios & app.android initNotiListener -------
function onMessageProcess(message) {
	return new Promise((resolve, reject) => {
		// Process your message as required
		const { _data: data = {} } = message;
		// const { payload = '' } = data;
		LogDevice('info', `onMessage ${JSON.stringify(data)}`);
		try {
			// const notiObj = parseJsonTryCatch(payload);
			// const { noti_type: notiType = '' } = notiObj; // String 'ALERT#LAST_PRICE#AT_OR_ABOVE#1'
			// const typeNoti = notiType.split('#')[0];
			// switch (typeNoti) {
			//     case NotiType.ALERT:
			alertInAppMarginCall({ notiObj: data });
			//         break;
			//     case NotiType.ORDER:
			//         alertInAppOrder({ notiObj });
			//         break;
			//     case NotiType.MARGIN_CALL:
			//         alertInAppMarginCall({ notiObj });
			//         break;
			//     default:
			//         break;
			// }
			setTimeout(resolve, 100);
		} catch (error) {
			console.log('onMessage error', error);
			LogDevice('error', `onMessage ${JSON.stringify(error)}`);
			reject(error);
		}
	});
}

// -------notification inside App , register at app.ios & app.android initNotiListener -------
function onNotiProcess(message) {
	return new Promise((resolve, reject) => {
		// Process your message as required
		const { _data: data = {} } = message;
		// const { payload = '' } = data;
		LogDevice('info', `onNotification ${JSON.stringify(data)}`);
		try {
			// const notiObj = parseJsonTryCatch(data);
			// const { noti_type: notiType = '' } = notiObj; // String 'ALERT#LAST_PRICE#AT_OR_ABOVE#1'
			// const typeNoti = notiType.split('#')[0];
			// switch (typeNoti) {
			//     case NotiType.ALERT:
			alertInAppMarginCall({ notiObj: data });
			//         break;
			//     case NotiType.ORDER:
			//         alertInAppOrder({ notiObj });
			//         break;
			//     case NotiType.MARGIN_CALL:
			//         alertInAppMarginCall({ notiObj });
			//         break;
			//     default:
			//         break;
			// }
			setTimeout(resolve, 100);
		} catch (error) {
			console.log('onNotification error', error);
			LogDevice('error', `onNotification ${JSON.stringify(error)}`);
			reject(error);
		}
	});
}

export function onMessage() {
	firebase.messaging().onMessage((message) => {
		NotiInAppQueue.push(onMessageProcess, message);
	});
}

export function onNotification() {
	console.log('FCM onNotification register');
	firebase.notifications().onNotification((notification) => {
		NotiQueue.push(onNotiProcess, notification);
	});
}

export function onNotificationDisplayed() {
	firebase.notifications().onNotificationDisplayed((notification) => {
		// Process your notification as required
		console.log('FCM onNotificationDisplayed', notification);
	});
}
export async function subTokenNotification() {
	const isSubNoti = await func.getCacheNotification();
	const enableNoti = await func.getFirstEnableNotification();
	const isShowNoti = await func.getCacheNotification();
	setCacheNotification(isSubNoti);
	firebase
		.messaging()
		.hasPermission()
		.then((enabled) => {
			if (enabled && !enableNoti && !isSubNoti) {
				setCacheNotification(true);
				func.setFirstEnableNotification(true);
				registerNotification({ enable: true, cbSuccess, cbError });
			} else if (isSubNoti) {
				registerNotification({ enable: true, cbSuccess, cbError });
			} else {
				unRegisterNotification({ enable: false, cbSuccess, cbError });
				// user doesn't have permission
			}
		});
}
export function unSubTokenNotification() {
	// setCacheNotification(false)
	unRegisterNotification({ enable: false, cbSuccess, cbError });
}
/* #endregion */
/* Subscribe the client app to a topic */
export function onSubscribeToTopic(topic) {
	topic && firebase.messaging().subscribeToTopic(topic);
}
export function onUnSubscribeToTopic(topic) {
	topic && firebase.messaging().unsubscribeFromTopic(topic);
	firebase.messaging().unsubscribeFromTopic(topic);
}
export function getListAccount(userID) {
	const userType = Controller.getUserType();
	if (userType === Enum.USER_TYPE.RETAIL) {
		return getListAccountRetail(userID);
	}
	return getAccountManagementGroup();
}

function getRoleAndListAccount() {
	// Check and sync search history
	ManageHistorySearch.filterHistorySearchAccountWithApi();
	const oldAccountID = DataStorage.accountId;
	sseStreaming.unregisterAllMessage(oldAccountID);
	const userID = Controller.getUserId();
	const listPromise = [RoleUser.getRoleData(), getListAccount(userID)];
	return Promise.all(listPromise).then(() => {
		if (DataStorage.accountId) {
			console.log('initCacheOrders - DataStorage.accountId');
			// Cache.initCacheOrders();
			Cache.initCacheOrderTransactions();
		}
		DataStorage.reloadAppAfterLogin && DataStorage.reloadAppAfterLogin();
	});
}

export function reloadApp() {
	refreshToken(getRoleAndListAccount)
		.then(() => {})
		.catch((error) => {});
}

/* #region Alert function */
export function translateAlertNew({
	text,
	alertType,
	alertTrigger,
	alertRepeat
}) {
	try {
		if (text.indexOf('##TRIGGER##') > -1) {
			text = text.replace(/##TRIGGER##/g, I18n.t(alertTrigger));
		}
		if (text.indexOf('##REPEAT##') > -1) {
			text = text.replace(/##REPEAT##/g, I18n.t(alertRepeat));
		}
		return text;
	} catch (error) {
		console.log(error);
	}
}

export function getTargetValueUI({ alertType, target }) {
	switch (alertType) {
		case 'LAST_PRICE':
		case 'BID_PRICE':
		case 'OFFER_PRICE':
			return `${FormatNumber2(target, PRICE_DECIMAL.PRICE)}`;
		case 'CHANGE_PERCENT':
			return `${FormatNumber2(target, PRICE_DECIMAL.PERCENT)} %`;
		case 'CHANGE_POINT':
			return `${FormatNumber2(target, PRICE_DECIMAL.PRICE)}`;
		case 'TODAY_VOLUME':
			return `${FormatNumber2(target, PRICE_DECIMAL.VOLUME)}`;
		default:
			return ``;
	}
}

export function translateAlertPrice({ text, alertType, alertTrigger, target }) {
	try {
		if (text.indexOf('##ALERT_TYPE##') > -1) {
			text = text.replace(/##ALERT_TYPE##/g, I18n.t(alertType));
		}
		if (text.indexOf('##TRIGGER##') > -1) {
			text = text.replace(/##TRIGGER##/g, I18n.t(alertTrigger));
		}
		if (text.indexOf('##TARGET_VALUE##') > -1) {
			if (typeof target === 'number') {
				const targetValue = getTargetValueUI({ alertType, target });
				text = text.replace(/##TARGET_VALUE##/g, targetValue);
			} else {
				const targetKey =
					Enum.PRICE_LAST_PRICE_FUTURE_ALERT_TARGET[target].key;
				text = text.replace(/##TARGET_VALUE##/g, I18n.t(targetKey));
			}
		}
		return text;
	} catch (error) {
		console.log(error);
	}
}

export function getAlertDescription(alertObj = {}) {
	const {
		alert_type: alertType,
		alert_trigger: alertTrigger,
		target,
		alert_repeat: alertRepeat
	} = alertObj;

	let text = '';
	switch (alertType) {
		case 'NEWS':
			text = I18n.t('alertNew');
			return translateAlertNew({
				text,
				alertType,
				alertTrigger,
				alertRepeat
			});
		default:
			text = I18n.t('alertPrice');
			return translateAlertPrice({
				text,
				alertType,
				alertTrigger,
				target
			});
	}
}
/* #endregion */

/* #region Symbol info */
export function getSymbolName({
	symbol,
	exchange,
	class: classSymbol,
	group_code: groupCode,
	display_name: displayName
}) {
	let value = '';
	let groupCodeTmp = '';
	if (
		Controller.isAppLySpecificSymbolLME() &&
		Controller.isSymbolVariantLME({ exchange, class: classSymbol })
	) {
		value = symbol;
		groupCodeTmp = groupCode;
		if (
			value &&
			value.includes('.') &&
			groupCodeTmp &&
			groupCodeTmp.includes('.')
		) {
			return `${value.split('.')[0]}
(${groupCodeTmp.split('.')[0]})`;
		} else {
			return `${value}`;
		}
	} else {
		value =
			DataStorage.symbolEquity[symbol] &&
			DataStorage.symbolEquity[symbol].symbol
				? DataStorage.symbolEquity[symbol].symbol
				: symbol;
		if (value && value.includes('.')) {
			return value.split('.')[0];
		} else {
			return value;
		}
	}
}

export function getSymbolClassDisplay(classOrigin) {
	return (classOrigin && Enum.SYMBOL_CLASS_DISPLAY_SHORT[classOrigin]) || '';
}

export function getMasterCode({ symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].display_master_code
		? DataStorage.symbolEquity[symbol].display_master_code
		: symbol;
}

export function getMasterName({ symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].display_master_name
		? DataStorage.symbolEquity[symbol].display_master_name
		: symbol;
}

export function getDisplayName({ symbol, exchange }) {
	if (!symbol || !exchange) return '';
	const keyInfo = `${symbol}#${exchange}`;
	return DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].display_name
		? DataStorage.symbolEquity[keyInfo].display_name
		: `${symbol}.${exchange}`;
}
export function getDisplayNameByKey({ key }) {
	if (!key) return '';
	return DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].display_name
		? DataStorage.symbolEquity[key].display_name
		: ``;
}

export function getTradingHalt({ symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].trading_halt
		? DataStorage.symbolEquity[symbol].trading_halt
		: false;
}

export function getSymbolClass({ symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].class
		? DataStorage.symbolEquity[symbol].class
		: '';
}

export function getSymbolCurrency({ symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].currency
		? DataStorage.symbolEquity[symbol].currency
		: '';
}

export function getDisplayExchange({ exchange, symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].display_exchange
		? DataStorage.symbolEquity[symbol].display_exchange
		: exchange;
}
export function getExchangeBySymbolExchange({ symbol, exchange }) {
	const key = `${symbol}#${exchange}`;
	return DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].exchanges
		? DataStorage.symbolEquity[key].exchanges[0]
		: '';
}
export function getExchangeByKey(key) {
	return DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].exchanges
		? DataStorage.symbolEquity[key].exchanges[0]
		: '';
}
export function getSymbolByKey({ key }) {
	return DataStorage.symbolEquity[key] && DataStorage.symbolEquity[key].symbol
		? DataStorage.symbolEquity[key].symbol
		: '';
}
export function getSymbolExchange({ symbol }) {
	return DataStorage.symbolEquity[symbol] &&
		DataStorage.symbolEquity[symbol].exchanges
		? DataStorage.symbolEquity[symbol].exchanges[0]
		: '';
}

export function getCompanyName({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	const securityShortName =
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].security_short_description
			? DataStorage.symbolEquity[keyInfo].security_short_description
			: '';

	const companyName =
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].company_name
			? DataStorage.symbolEquity[keyInfo].company_name
			: '';
	const company =
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].company
			? DataStorage.symbolEquity[keyInfo].company
			: '';
	const securityName =
		DataStorage.symbolEquity[keyInfo] &&
		DataStorage.symbolEquity[keyInfo].security_name
			? DataStorage.symbolEquity[keyInfo].security_name
			: '';
	return securityShortName || companyName || company || securityName;
}
export function getCompanyNameByKey({ key }) {
	const securityShortName =
		DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].security_short_description
			? DataStorage.symbolEquity[key].security_short_description
			: '';

	const companyName =
		DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].company_name
			? DataStorage.symbolEquity[key].company_name
			: '';
	const company =
		DataStorage.symbolEquity[key] && DataStorage.symbolEquity[key].company
			? DataStorage.symbolEquity[key].company
			: '';
	const securityName =
		DataStorage.symbolEquity[key] &&
		DataStorage.symbolEquity[key].security_name
			? DataStorage.symbolEquity[key].security_name
			: '';
	return securityShortName || companyName || company || securityName;
}
export function getSymbolInfoBySymbolExchange({ symbol, exchange }) {
	const keyInfo = `${symbol}#${exchange}`;
	return DataStorage.symbolEquity[keyInfo] || {};
}
export function getSymbolInfo({ symbol }) {
	return DataStorage.symbolEquity[symbol] || {};
}

export function getTradingMarket({ orderDetail }) {
	const tradingMarket = orderDetail.trading_market;
	let exchange = tradingMarket;
	if (tradingMarket && tradingMarket === 'SAXO_BANK') {
		exchange = orderDetail.exchange;
	}
	return exchange;
}

export function getExchange({ orderDetail }) {
	return orderDetail.trading_market || '--';
}

export function getDurationCode({ orderDetail }) {
	const duration = orderDetail.duration;
	const expireDate = orderDetail.expire_date;

	if (duration === DURATION_CODE.GTD) {
		if (!expireDate) return '';
		return moment(expireDate).format('DD/MM/YYYY');
	}
	return duration;
}

export function getDurationString({ orderDetail }) {
	const duration = orderDetail.duration;
	const expireDate = orderDetail.expire_date;

	if (duration === DURATION_CODE.GTD) {
		if (!expireDate) return '';
		return moment(expireDate).format('DD/MM/YYYY');
	}
	return DURATION_STRING[duration];
}
/* #endregion */

export function genLanguage() {
	const En = require('./modules/language/language_json/en.json');
	const Cn = require('./modules/language/language_json/cn.json');

	let csv = '';
	Object.keys(En).map((key, index) => {
		const e = En[key];
		const c = Cn[key] || '';
		csv += `${key}, '${e}', '${c}'\n`;
	});

	console.log('genLanguage', csv);
}

export function showNewModal(
	data,
	style,
	onSelect,
	selectedValue,
	topModal,
	isShowModal
) {
	Navigation.showModal({
		screen: 'equix.NewModal',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			tabBarHidden: false,
			navBarHidden: true,
			// statusBarColor: statusBarColorNearBlack,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			data: data,
			style: style,
			onSelect: onSelect,
			selectedValue: selectedValue,
			topModal: topModal,
			isShowModal: isShowModal,
			closeModal: () => {
				Navigation.dismissModal({
					animated: true,
					animationType: 'none'
				});
			}
		}
	});
}

export function showThirdPartyTerms() {
	Navigation.showModal({
		screen: 'equix.ThirdPartyTerms',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			tabBarHidden: false,
			navBarHidden: true,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {}
	});
}

function checkSameSetting(currentSetting, newSetting) {
	// Chọn lại setting cũ thì không làm gì
	if (currentSetting === newSetting) return false;
	return true;
}

export async function getWatchlistTitle() {
	try {
		const isLogin = Controller.getLoginStatus();
		const userID = Controller.getUserId();
		let idSelected = '';
		if (!isLogin) {
			idSelected = PRICEBOARD_STATIC_ID.SP_20;
		} else {
			// get from local
			const priceBoardId = await FuncStorage.getLastestPriceBoard(userID);
			if (priceBoardId) {
				idSelected = priceBoardId;
			} else {
				const { watchlist } = FuncStorage.getPriceboardDefault();
				idSelected = watchlist;
			}
		}
		const subTitle = FuncStorage.getPriceboardNameInPriceBoard(idSelected);
		// Update title watchlist
		return {
			subTitle,
			title: I18n.t('WatchListTitle')
		};
	} catch (error) {
		console.log('updateWatchlistTitle exception', error);
	}
}

export function saveDataSetting(type, value) {
	try {
		const userId = FuncStorage.getUserId();
		const store = Controller.getGlobalState();
		const setting = store.setting;
		const newObj = PureFunc.clone(setting);
		const isSaveDataSetting = checkSameSetting(newObj[`${type}`], value);
		const deviceId = DataStorage.deviceId;
		let nextFlow = true;
		if (!isSaveDataSetting) return;
		switch (type) {
			case SETTING_TYPE.USER_PRICE_SOURCE:
				newObj[`${type}`] = value || 0;
				Controller.setUserPriceSource(value);
				break;
			case SETTING_TYPE.HOME_SCREEN:
				newObj[`${type}`] = value || 0;
				const tabSelected = HOME_SCREEN.find((e) => {
					return e.id === value;
				});
				const forceUpdate = false;
				FuncStorage.setHomeScreen(tabSelected, forceUpdate);
				break;
			case SETTING_TYPE.SOUND:
				newObj[`${type}`] = value ? 'default' : null;
				Controller.setSound(newObj[`${type}`]);
				break;
			case SETTING_TYPE.LANG:
				newObj[`${type}`] = value;
				Controller.setLang(value);
				break;
			case SETTING_TYPE.TEXT_SIZE:
				newObj[`${type}`] = value;
				break;
			case SETTING_TYPE.IS_NOTIFY:
				newObj[`${type}`] = value;
				if (value) {
					subcribleChannel();
				} else {
					unRegisterReceiverNoti();
				}
				break;
			case SETTING_TYPE.VIBRATION:
				newObj[`${type}`] = value;
				Controller.setVibrate(value);
				break;
		}
		if (!nextFlow) return;
		newObj['deviceId'] = `${this.deviceId}`;
		Controller.dispatch(settingActions.settingResponse(newObj));
		// save to db change from, to -> UTC
		const data = PureFunc.clone(newObj);
		const { hour: fromHour, minute: fromMinute } = Util.getHoursMinutesUTC(
			newObj['news'][`fromHour`],
			newObj['news'][`fromMinute`]
		);
		const { hour: toHour, minute: toMinute } = Util.getHoursMinutesUTC(
			newObj['news'][`toHour`],
			newObj['news'][`toMinute`]
		);
		data['news']['fromHour'] = fromHour;
		data['news']['fromMinute'] = fromMinute;
		data['news']['toHour'] = toHour;
		data['news']['toMinute'] = toMinute;
		data['deviceId'] = deviceId;
		const urlPut = Api.getUrlUserSettingByUserId(userId, 'put');
		Api.putData(urlPut, { data })
			.then(() => {
				LogDevice('info', 'save to user setting success');
			})
			.catch(() => {
				LogDevice('info', 'cannot save to user setting');
			});
	} catch (error) {
		LogDevice('error', `onSelectLang setting exception: ${error}`);
	}
}

export function getNumberOfLines(text, fontSize, fontConstant, containerWidth) {
	const cpl = Math.floor(containerWidth / (fontSize / fontConstant));
	const words = text.split(' ');
	const elements = [];
	let line = '';

	while (words.length > 0) {
		if (
			line.length + words[0].length + 1 <= cpl ||
			(line.length === 0 && words[0].length + 1 >= cpl)
		) {
			const word = words.splice(0, 1);
			if (line.length === 0) {
				line = word;
			} else {
				line = line + ' ' + word;
			}
			if (words.length === 0) {
				elements.push(line);
			}
		} else {
			elements.push(line);
			line = '';
		}
	}
	return elements.length;
}
export function getSpecificSymbol(data) {
	if (Controller.isAppLySpecificSymbolLME()) {
		if (Controller.isSymbolVariantLME(data)) {
			return data.group_code;
		}
		return data.symbol;
	}
	return data.symbol;
}
export function getDisplayGroupCode(data = {}) {
	return Controller.isSymbolVariantLME(data)
		? `(${data.group_code.split('.')[0]})`
		: '';
}
export function formatAMPM(date = new Date()) {
	const offset = Controller.getTimeZoneAU();
	const timeStamp = date.getTime() + offset * 3600000;
	date = new Date(timeStamp);
	var hours = date.getUTCHours();
	var minutes = date.getUTCMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}
export function fomatDate(dateTime = new Date()) {
	const offset = Controller.getTimeZoneAU();
	const timeStamp = dateTime.getTime() + offset * 3600000;
	dateTime = new Date(timeStamp);
	let date = dateTime.getUTCDate();
	let month = dateTime.getUTCMonth() + 1;
	date = date < 10 ? `0${date}` : date;
	month = month < 10 ? `0${month}` : month;
	return `${date}/${month}/${dateTime.getUTCFullYear()}`;
}
export function getDisplayTimeNews(upGTDd = '') {
	const dateTime = new Date(upGTDd);
	const getDisplayTime = formatAMPM(dateTime);
	const getDisplayDate = fomatDate(dateTime);
	return `${getDisplayTime}, ${getDisplayDate}`;
}

export function getTimeNews(upGTDd = '') {
	const timeStamp = moment.utc(upGTDd).valueOf();
	const format = 'hh:mm A, DD/MM/YYYY';
	const displayTimeNew = momentTZ.tz(timeStamp, LOCATION.AU).format(format);
	console.log('getTimeNews displayTimeNew', displayTimeNew);
	return displayTimeNew;
}

export function checkUndefined(value) {
	if (value === null || value === undefined) return true;
	return false;
}

export function getUserAgent() {
	DeviceInfo.getUserAgent()
		.then((userAgent) => {
			console.log('getUserAgent userAgent', userAgent);
			DataStorage.userAgent = userAgent;
		})
		.catch((err) => console.log(err));
}

export function getDeviceID() {
	DeviceInfo.getUniqueId()
		.then((deviceId) => {
			console.log('getDeviceID', deviceId);
			DataStorage.deviceId = deviceId;
		})
		.catch((err) => console.log(err));
}

export function genStyleHtmlNewDetail() {
	return {
		BG_COLOR: CommonStyle.backgroundColorNearDark,
		TEXT_COLOR: CommonStyle.fontColor,
		FONTSIZE: CommonStyle.fontSizeM - 5, // 17 - 5 = 12
		FONT_FAMILY: CommonStyle.fontRobotoMono
	};
}

export function initEnv() {
	if (config.environment === ENVIRONMENT.IRESS_ABSA) {
		DataStorage.isOkta = true;
		DataStorage.isLoggedInOkta = true;
	}
}

export function genParamsStyleHtmlNewDetail(objStyle = {}) {
	const { BG_COLOR, TEXT_COLOR, FONTSIZE, FONT_FAMILY } = objStyle;
	const encodeBgColor = encodeURIComponent(BG_COLOR);
	const encodeTextColor = encodeURIComponent(TEXT_COLOR);
	const encodeFontSize = encodeURIComponent(FONTSIZE) + 'px';
	const encodeFontFamily = encodeURIComponent(FONT_FAMILY);
	return `bgcolor=${encodeBgColor}&txtcolor=${encodeTextColor}&fontsize=${encodeFontSize}&fontfamily=${encodeFontFamily}`;
}

export function autoLoginIRESSMobile() {
	const { iressUser, iressPW } = config;
	Controller.dispatch(login(iressUser, iressPW));
}
export function hideKeyboard() {
	Emitter.emit(ChannelKeyboard.HIDE);
}
export function showButtonConfirm() {
	Emitter.emit(ChannelKeyboard.HIDE_KEYBOARD);
}
export function showKeyBoard() {
	Emitter.emit(ChannelKeyboard.SHOW_KEYBOARD);
}

export function showHideConfirmPlaceButton({ isShow = true }) {
	if (isShow) {
		Emitter.emit(getChannelShowConfirmPlaceButton());
	} else {
		Emitter.emit(getChannelHideConfirmPlaceButton());
	}
}
export function getCashAvailable(accountId) {
	accountId = accountId || DataStorage.currentAccount.account_id;
	return new Promise((resolve) => {
		const url = Api.getNewTotalPortfolio(accountId);
		Api.requestData(url, true)
			.then((data) => {
				this.isFirst = true;
				if (data) {
					resolve(data);
				} else {
					resolve({});
				}
				resolve({});
			})
			.catch((e) => {});
	});
}

export function fakeFavoutirePriceboard() {
	return {
		user_id: 'iressuser',
		watchlist: WATCHLIST.USER_WATCHLIST,
		value: [
			{
				symbol: 'ANZ',
				exchange: 'ASX',
				rank: 0
			}
		],
		watchlist_name: WATCHLIST.USER_WATCHLIST,
		init_time: 1591966810227
	};
}

export function fakePrice() {
	return {
		exchange: 'ASX',
		symbol: 'ANZ',
		ask_price: 18.85,
		ask_size: 8772,
		bid_price: 18.83,
		bid_size: 8204,
		change_percent: -0.4228,
		change_point: -0.08,
		high: 19.21,
		low: 18.76,
		open: 18.93,
		trade_price: 18.84,
		trade_size: 115,
		updated: 1592190115104,
		volume: 3779242,
		previous_close: 18.92,
		value_traded: 71459137.025,
		indicative_price: null,
		auction_volume: null,
		side: null,
		surplus_volume: null
	};
}

export function fakeChart() {
	return `Symbol,ANZ
Interval,day
DataType,Time-Open-High-Low-Close-Volume
LastUpdated,15/06/20-04:16:05.036
Exchange,ASX
SymbolType,Equity
SymbolFullName,ANZ BANK FPO
Time,Open,High,Low,Close,Volume
16/03/20-00:00:00.000,17.46,17.98,16.45,16.45,18751738
17/03/20-00:00:00.000,16.07,18.49,16.05,18.4,19736093
18/03/20-00:00:00.000,18.08,18.25,16.43,16.62,16566516
19/03/20-00:00:00.000,17.14,17.85,15,15,27387685
20/03/20-00:00:00.000,15.9,16.56,15.53,16.02,19120791
23/03/20-00:00:00.000,14.95,15.41,14.1,14.1,18518637
24/03/20-00:00:00.000,14.5,14.85,14.46,14.85,14885485
25/03/20-00:00:00.000,16,16.68,15.62,16.57,15933522
26/03/20-00:00:00.000,16.96,16.99,16.14,16.7,11697703
27/03/20-00:00:00.000,17.2,17.37,15.47,15.47,16000311
30/03/20-00:00:00.000,15.47,16.78,15.4,16.78,10006877
31/03/20-00:00:00.000,17.27,18.02,16.6,16.96,18245911
01/04/20-00:00:00.000,17.43,17.63,16.57,17.05,9827593
02/04/20-00:00:00.000,16.45,16.49,15.96,16.15,14620723
03/04/20-00:00:00.000,16.4,16.43,15.66,15.79,10552454
06/04/20-00:00:00.000,16.11,16.64,15.95,16.54,10736326
07/04/20-00:00:00.000,16.92,17.24,16.14,16.32,10260388
08/04/20-00:00:00.000,15.95,16.15,15.38,15.52,14883993
09/04/20-00:00:00.000,16.1,16.54,15.8,16.54,11755912
14/04/20-00:00:00.000,16.5,16.79,16.08,16.78,9684192
15/04/20-00:00:00.000,16.8,16.93,16.51,16.85,8106145
16/04/20-00:00:00.000,16.38,16.62,16.2,16.58,9808414
17/04/20-00:00:00.000,16.84,17.03,16.56,16.56,7604195
20/04/20-00:00:00.000,16.56,16.72,16.15,16.15,7878201
21/04/20-00:00:00.000,16.14,16.27,15.8,15.8,9019237
22/04/20-00:00:00.000,15.6,16.15,15.46,16.02,8527232
23/04/20-00:00:00.000,16.28,16.34,15.84,16.01,6787541
24/04/20-00:00:00.000,15.89,16.27,15.85,16.02,5699284
27/04/20-00:00:00.000,15.68,15.84,15.35,15.65,12748180
28/04/20-00:00:00.000,15.65,16.14,15.54,15.7,10374021
29/04/20-00:00:00.000,15.95,16.665,15.87,16.66,10748427
30/04/20-00:00:00.000,16.66,16.905,16.23,16.9,19806222
01/05/20-00:00:00.000,16.49,16.51,15.75,15.75,15508324
04/05/20-00:00:00.000,15.62,16.22,15.53,16.15,11399187
05/05/20-00:00:00.000,16.27,16.46,16.19,16.45,7149943
06/05/20-00:00:00.000,16.34,16.35,16.06,16.2,5909054
07/05/20-00:00:00.000,16.05,16.1,15.85,15.85,7445909
08/05/20-00:00:00.000,16.17,16.23,15.73,15.73,10205659
11/05/20-00:00:00.000,15.85,16.04,15.79,15.81,8589771
12/05/20-00:00:00.000,15.76,15.82,15.46,15.5,11601280
13/05/20-00:00:00.000,15.35,15.56,15.2,15.56,7174753
14/05/20-00:00:00.000,15.29,15.34,15.15,15.15,6971876
18/05/20-00:00:00.000,15.58,15.6,15.07,15.13,6860348
19/05/20-00:00:00.000,15.57,15.9,15.385,15.44,10768598
20/05/20-00:00:00.000,15.2,15.53,15.19,15.51,4751285
21/05/20-00:00:00.000,15.76,15.76,15.35,15.39,4898875
22/05/20-00:00:00.000,15.4,15.61,15.23,15.23,5391309
25/05/20-00:00:00.000,15.4,15.6,15.34,15.59,5438304
26/05/20-00:00:00.000,15.68,16.52,15.62,16.52,14502802
27/05/20-00:00:00.000,16.83,18.31,16.8,17.94,28146214
28/05/20-00:00:00.000,18.71,19.25,18.51,18.74,17075071
29/05/20-00:00:00.000,18.5,18.51,17.89,17.89,14436409
01/06/20-00:00:00.000,17.72,18.22,17.41,18.05,8003191
02/06/20-00:00:00.000,18.08,18.31,17.83,18.02,9734509
03/06/20-00:00:00.000,18.46,18.97,18.29,18.92,13043586
04/06/20-00:00:00.000,19.55,19.79,18.93,19.21,15799395
05/06/20-00:00:00.000,19.4,19.87,19.29,19.77,12004119
09/06/20-00:00:00.000,20.62,21.215,20.57,21,16319979
10/06/20-00:00:00.000,20.5,20.85,20.16,20.76,10304259
11/06/20-00:00:00.000,20.1,20.3,19.37,19.47,14678241
12/06/20-00:00:00.000,18.55,19.04,18.33,18.92,13648285
15/06/20-00:00:00.000,18.93,19.21,18.61,18.75,5325685`;
}

export function fakeMarketInfo() {}
export function getClassTagProperty({ classSymbol = SYMBOL_CLASS.EQUITY }) {
	switch (classSymbol) {
		case SYMBOL_CLASS.EQUITY:
			return {
				text: TAG_SYMBOL_CLASS.EQUITY,
				color: CommonStyle.classBackgroundColor.EQT
			};
		case SYMBOL_CLASS.MF:
			return {
				text: TAG_SYMBOL_CLASS.MF,
				color: CommonStyle.classBackgroundColor.MF
			};
		case SYMBOL_CLASS.ETFS:
			return {
				text: TAG_SYMBOL_CLASS.ETFS,
				color: CommonStyle.classBackgroundColor.ETF
			};
		case SYMBOL_CLASS.WARRANT:
			return {
				text: TAG_SYMBOL_CLASS.WARRANT,
				color: CommonStyle.classBackgroundColor.WAR
			};
		case SYMBOL_CLASS.FUTURE:
			return {
				text: TAG_SYMBOL_CLASS.FUTURE,
				color: CommonStyle.classBackgroundColor.FUT
			};
		case SYMBOL_CLASS.OPTION:
			return {
				text: TAG_SYMBOL_CLASS.OPTION,
				color: CommonStyle.classBackgroundColor.OPT
			};
		case SYMBOL_CLASS.INDICES:
			return {
				text: TAG_SYMBOL_CLASS.INDICES,
				color: CommonStyle.classBackgroundColor.IND
			};
		case SYMBOL_CLASS.FX:
			return {
				text: TAG_SYMBOL_CLASS.FX,
				color: CommonStyle.classBackgroundColor.FX
			};
		default:
			return {
				text: '',
				color: ''
			};
	}
}
export function getColorByValue(value) {
	if (value > 0) return CommonStyle.todayChangeUpTextColor;
	if (value < 0) return CommonStyle.todayChangeDownTextColor;
	return CommonStyle.fontColor;
}
export function getInitialMargin({ fees, balance, dataVolume }) {
	// const { order_value: orderValue } = fees;
	const { orderVolume, limitPrice, tradePrice } = dataVolume;
	let orderValue = null;
	const priceValue = limitPrice || tradePrice;

	if (orderVolume && priceValue) {
		orderValue = orderVolume * priceValue;
	}

	const { initial_margin_used_percent: initialMarginUsedPercent } = balance;
	if (!orderValue || !initialMarginUsedPercent) return null;
	return (orderValue * initialMarginUsedPercent) / 100;
}
export function getTopicNotification({ userLoginId, region }) {
	const env = config.environment;
	const useName = userLoginId.split('@');
	const company = useName[1];
	const broker = useName[0];
	return (
		env +
		'~' +
		region +
		'~' +
		company +
		'~' +
		broker +
		''
	).toLowerCase();
}
