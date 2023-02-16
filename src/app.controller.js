import * as Emitter from '@lib/vietnam-emitter';
import DeviceInfo from 'react-native-device-info';

import * as Channel from './streaming/channel';
import * as PortfolioProcess from './process/portfolio';
import * as Controller from './memory/controller';
import * as FuncUtil from './lib/base/functionUtil';
import ENUM from './enum';
import config from './config';
import { dataStorage, func } from './storage';
import * as authSettingActions from './screens/setting/auth_setting/auth_setting.actions';
import * as loginActions from './screens/login/login.actions';
import {
	showSetPinModal,
	showNewOverViewScreen
} from './navigation/controller';
import * as settingActions from './screens/setting/setting.actions';

import { iconsMap, iconsLoaded } from './utils/AppIcons';
import * as Util from '../src/util';
import { initApp as initStorage } from './initStorage';
import * as appActions from './app.actions';
import loginUserType from './constants/login_user_type';

import {
	registerByAccount,
	registerByUser,
	unregisterByUser,
	unregisterByAccount,
	unregisterNews,
	registerNews,
	registerByRoleGroup,
	unregisterByRoleGroup,
	unregisterAllMessage,
	unregisterAllMessageByUser,
	unregisterAllMessageRoleGroup
} from './streaming';

import { checkUpdateApp } from './app.updater';
import { startAppAfterLoadStore } from './app.starter';
import {
	loginDefaultAccount,
	loginDefault,
	authenPinForAutoLogin,
	callBackAutoLogin,
	showAlertChangePin,
	onAccept
} from './app.logger';

const ID = 'app.controller';

export async function showWhatsNew(nav) {
	try {
		const showModalWhatsNew = await FuncUtil.checkReadWhatsNew();
		if (showModalWhatsNew) {
			console.log('Show whats new', showModalWhatsNew);
			await FuncUtil.openWhatsNewModal(nav, true);
		}
	} catch (error) {
		console.catch('showWhatsNew', error);
	}
}

function reqAfterLogin() {
	PortfolioProcess.reqPortfolioData();
}

function resetAfterLogout() { }

function processWhenAccountChange() {
	const accountId = Controller.getAccountId();
	const accessToken = Controller.getAccessToken();

	accountId && accessToken ? reqAfterLogin() : resetAfterLogout();
}

function listenAccountChange() {
	const channelName = Channel.getChannelAccountIdChange();
	Emitter.addListener(channelName, ID, processWhenAccountChange);
}

function listenAccessTokenChange() {
	const channelName = Channel.getChannelGotAccessTokenFirst();
	Emitter.addListener(channelName, ID, processWhenAccountChange);
}

export function handleEventApp() {
	// listenAccountChange();
	listenAccessTokenChange();
}

export function initApp() {
	Controller.startSession();
}

export function getDefaultTimeZone() {
	const AUTimeZone = FuncUtil.getTimezoneByLocation(ENUM.LOCATION.AU);
	const USTimeZone = FuncUtil.getTimezoneByLocation(ENUM.LOCATION.US);
	Controller.setTimeZoneAU(AUTimeZone);
	Controller.setTimeZoneUS(USTimeZone);
}

export function initNotiListener(autoLogin) {
	const openNoti = function (notif) {
		if (Controller.getEmail() !== config.username) {
			autoLogin(notif, false);
		}

		const {
			data: { notify_type: notiType, data: dataAsString }
		} = notif;
		const realtimeData = JSON.parse(dataAsString);
		const { symbol = '', news_id: newsId } = realtimeData;

		const accountId = dataStorage.accountId;
		const {
			deleteNotiNewsById,
			getOrderIdByType,
			getKeyOrder,
			deleteNotiOrderById
		} = FuncUtil;

		switch (notiType) {
			case NotiType.NEWS:
				dataStorage.switchScreen = 'News';
				dataStorage.notifyObj = { news_id: newsId, data };
				deleteNotiNewsById(newsId, symbol);
				return;
			case NotiType.ORDER:
			case NotiType.ORDER_DETAIL:
				const orderId = getOrderIdByType(realtimeData);
				const type = getKeyOrder(realtimeData);
				deleteNotiOrderById(type, orderId, symbol, accountId);
				return;
		}
		notif.finish && notif.finish();
	};

	Business.notificationOpenedListener(openNoti);
}

// #region configDataStorage
export function configDataStorage(store) {
	dataStorage.unregisterMessage = unregisterMessage;
	dataStorage.deviceModel = DeviceInfo.getModel();
	dataStorage.setNewPin = (...params) => setNewPin(...params, store.dispatch);
	dataStorage.disclaimerOncheck = checked => {
		store.dispatch(loginActions.disclaimerDisplay(checked));
	};
	dataStorage.checkUpdateApp = (byPass, cb) =>
		checkUpdateApp(byPass, cb, store);
	dataStorage.startAppAfterLoadStore = () => startAppAfterLoadStore(store);
	dataStorage.loginDefaultAccount = loginDefaultAccount;
	dataStorage.loginDefault = loginDefault;
	dataStorage.disclaimerAccept = onAccept;
	dataStorage.authenPinForAutoLogin = authenPinForAutoLogin;
	dataStorage.callBackAutoLogin = callBackAutoLogin;
	dataStorage.showAlertChangePin = showAlertChangePin;
}

function unregisterMessage() {
	const accountId = dataStorage.accountId;
	const userId = Controller.getUserId();

	console.log(
		`unregisterMessage messege for user: ${userId}, accountId:${accountId}`
	);

	unregisterNews();

	if (accountId) {
		unregisterAllMessage(accountId);
	}
	if (userId) {
		unregisterAllMessageByUser(userId);
		unregisterAllMessageRoleGroup();
	}
}

function setNewPin(objParam, token, localData, dispatch) {
	const { loginUserType: userType } = dataStorage;
	const { MEMBER } = loginUserType;
	const { enableTouchID } = localData;
	if (localData) {
		// TH: autologin -> co local storage -> goi component AutoLogin de xac thuc -> run app
		dataStorage.userPin = localData;
		// Set touch id status on or off for auth setting screen
		_.isNil(enableTouchID) &&
			dispatch(authSettingActions.setEnableTouchID(enableTouchID));
	}

	setTimeout(() => showSetPinModal(objParam, token), 300);
	dispatch(loginActions.loginAppSuccess());
}

// #endregion
