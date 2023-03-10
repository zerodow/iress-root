import AsyncStorage from '~/manage/manageLocalStorage'
import SplashScreen from 'react-native-splash-screen';
import * as loginActions from './screens/login/login.actions';
import * as settingActions from './screens/setting/setting.actions';
import loginToApp from './app.logger';
import * as authSettingActions from './screens/setting/auth_setting/auth_setting.actions';

import { iconsLoaded } from './utils/AppIcons';
import { dataStorage, func } from './storage';
import { initApp as initStorage } from './initStorage';
import * as Util from '../src/util';
import * as Controller from './memory/controller';
import ENUM from './enum';
import config from './config';
import {
	showHomePageScreen,
	showNewOverViewScreen,
	showPromptNewScreen
} from './navigation/controller';
import * as Business from '../src/business';
import {
	logDevice,
	getNotiNewsStatus,
	getNotiOrderStatus,
	saveItemInLocalStorage
} from './lib/base/functionUtil';
import * as appActions from './app.actions';

export async function startAppAfterLoadStore(store) {
	store.dispatch(loginActions.setLoginFailed());
	try {
		await iconsLoaded();

		dataStorage.reloadAppAfterLogin = () =>
			reloadAppAfterLogin(store.dispatch);
		dataStorage.startApp = isConn => startAppFunction(isConn, store);

		startAppFunction(true, store);
		initNotification();
	} catch (error) {
		logDevice('error', `START APP AFTER LOADSTORE EXCEPTION ${error}`);
		Alert.alert('Could not load resource. Please try again');
	}
}

function reloadAppAfterLogin(dispatch) {
	try {
		initStorage(() => {
			const lang = Util.choseLanguage();
			Controller.setLang(lang);
			Controller.dispatch(settingActions.setLang(lang));

			const { checkUpdateApp = () => null } = dataStorage;
			checkUpdateApp(false, gotoApp);

			SplashScreen.hide();
			dispatch(loginActions.loginAppSuccess());
		});
	} catch (error) {
		logDevice('info', `App ios - Start App function exception: ${error}`);
	}
}

function gotoApp() {
	const {
		loginAsGuest,
		is_logout: isLogout,
		maintain: { currentState }
	} = dataStorage;
	if (loginAsGuest) {
		currentState !== true && showNewOverViewScreen();
		return;
	}
	// Timeout wait for busybox animation finish
	const timeOut = isLogout ? 200 : 1100;
	setTimeout(() => {
		currentState !== true && showHomePageScreen();
	}, timeOut);
}

function startAppFunction(isConnected, store) {
	try {
		// Start app

		setDemo(store);
		getNoti();
		// appAction isReviewAccount -> false
		Controller.dispatch(appActions.checkReviewAccount(false));

		const { login } = store.getState() || {};
		const { email, loginObj } = login || {};
		const { accessToken, refreshToken, pin } = loginObj || {};
		const isDefaultEmail = email === config.username;

		if (accessToken && refreshToken && pin && email && !isDefaultEmail) {
			// Da login va co token -> auto login
			dataStorage.refreshToken = refreshToken;
			dataStorage.emailLogin = email.toLowerCase().trim();

			// N???u s??? l???n nh???p sai pin l?? >= 3 th?? logout
			checkEnterWrongPin(
				dataStorage.emailLogin,
				() => loginToApp(store),
				store.dispatch
			);
		} else {
			// Chua login -> login default

			logDevice('info', `APP IOS LOGIN DEFAULT ACCOUNT`);

			// No user is signed in.
			// G??n email login = guest ????? kh??ng nh???n noti TOKEN_WAS_CHANGED t??? showAlertChangePin
			dataStorage.emailLogin = config.username;

			dataStorage.loginDefault && dataStorage.loginDefault();
		}
	} catch (error) {
		logDevice('error', `START APP FUNCTION EXCEPTION ${error}`);
	}
}

export function setTouchIdStatus(enableTouchID, dispatch) {
	if (!_.isNil(enableTouchID)) {
		const {
			isNotEnrolledTouchID,
			userPin: { email }
		} = dataStorage;
		if (isNotEnrolledTouchID) {
			dataStorage.userPin.enableTouchID = false;
			saveItemInLocalStorage(email, userPin, null, null, null);
			dispatch(authSettingActions.setEnableTouchID(false));
		} else {
			dispatch(authSettingActions.setEnableTouchID(enableTouchID));
		}
	}
}

async function checkEnterWrongPin(key, cb, dispatch) {
	// N???u s??? l???n nh???p sai pin >= 3 th?? t??? ?????ng logout
	try {
		const result = await new Promise(resolve => {
			AsyncStorage.getItem(key)
				.then(res => resolve(res))
				.catch(err => {
					console.log('checkEnterWrongPin error', err)
					resolve()
				})
		})
		if (!result) {
			// ??i ti???p
			cb && cb();
			logDevice('info', `PIN LOCAL NULL`);
			return;
		}

		const data = JSON.parse(result);
		const { numberFailEnterPin = 0, enableTouchID } = data || {};
		// N???u s??? l???n nh???p sai pin === 3 -> login default
		dataStorage.userPin = data;

		// Set touch id status on or off for auth setting screen
		setTouchIdStatus(enableTouchID, dispatch);

		if (numberFailEnterPin < 3) {
			// ??i ti???p
			cb && cb();
			return;
		}
		// Clear email
		dispatch(loginActions.setLastEmail(''));
		dispatch(loginActions.logout());
	} catch (error) {
		// ??i ti???p
		cb && cb();
		logDevice('info', `GET PIN LOCAL EXCEPTION, ERROR: ${error}`);
	}
}

function setDemo(store) {
	const objStore = store.getState();
	const { app = {} } = objStore || {};
	const { isDemo } = app;
	if (objStore) {
		if (config.environment === ENUM.ENVIRONMENT.PRODUCTION) {
			// product default is LIVE
			Controller.setIsDemo(isDemo || false);
		} else {
			// next or staging default is NEXT or STAGING
			Controller.setIsDemo(true);
		}
	}
}

const OrdersTab = {
	WORKING: 'working',
	STOPLOSS: 'stoploss',
	FILLED: 'filled',
	CANCELLED: 'cancelled'
};
function getNoti() {
	const { accountId } = dataStorage;
	// getNotiNewsStatus();
	// getNotiOrderStatus(OrdersTab.WORKING, accountId);
	// getNotiOrderStatus(OrdersTab.STOPLOSS, accountId);
	// getNotiOrderStatus(OrdersTab.FILLED, accountId);
	// getNotiOrderStatus(OrdersTab.CANCELLED, accountId);
}

function initNotification() {
	try {
		Business.requestNotiPermission();
	} catch (error) {
		logDevice('info', `initNotification EXCEPTION ${error}`);
	}
}
