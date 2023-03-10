/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Alert, AppState, Text, TextInput, Platform } from 'react-native';
import { Provider } from 'react-redux';
import AsyncStorage from '~/manage/manageLocalStorage';
import { Navigation } from 'react-native-navigation';
import _, { isEmpty } from 'lodash';

import CONFIG from '~/config';
import { registerScreens } from './screens';
import I18n from './modules/language/';
import persistStore from './store/persistStore';
import { iconsLoaded } from './utils/AppIcons';
import configureStore from './store/configureStore';
import Perf from './lib/base/performance_monitor';
import { dataStorage, func } from './storage';
import { initApp } from './initStorage';
import config from './config';
import ENUM from './enum';
import { pushScreenToCurrentTab } from '~/navigation/controller.1';
import SplashScreen from 'react-native-splash-screen';
import { buildStyle } from './build_style';
import ScreenId from '../src/constants/screen_id';
import * as Business from '../src/business';
import * as Util from '../src/util';
import * as Controller from '../src/memory/controller';
import * as AppController from './app.controller';
import * as ManageConnection from '../src/manage/manageConnection';
import * as ManageAppstate from '../src/manage/manageAppState';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import { changeTheme, FIXED_THEME } from './theme/theme_controller';
import { getListRegion } from '~/screens/home/Controllers/RegionController.js';
import { changeBrokerName } from '~s/login/login.actions';

import '../utils/localStorageConfig';
import {
	showBusyBoxScreen,
	showAutoLoginScreen,
	showNewOverViewScreen,
	showMainAppScreen,
	showUpdateMeScreen,
	showDisclaimerScreen,
	showHomePageScreen,
	showAutoLoginModal,
	showPromptNewModal,
	showTokenWasChangedModal,
	showSetPinModal
} from '~/navigation/controller.1';
// import '../utils/Config'
import {
	logAndReport,
	getItemFromLocalStorage,
	clearAllItemFromLocalStorage,
	checkTouchIdSupport,
	logDevice,
	preprocessNoti,
	getKeyOrder,
	checkNetworkConnection1,
	refreshToken,
	saveItemInLocalStorage,
	getTimezoneByLocation,
	getLastTimeRenewToken,
	showNotiInApp,
	getOrderDataBeforeShowDetail,
	getRelatedSymbol,
	getHomeScreen,
	checkHomeScreenIsDisableAndReplace
} from './lib/base/functionUtil';
import * as appActions from './app.actions';
import * as loginActions from './screens/login/login.actions';
import * as authSettingActions from './screens/setting/auth_setting/auth_setting.actions';
import * as settingActions from './screens/setting/setting.actions';
import CheckUpdate from './component/check_update/check_update';
import DeviceInfo from 'react-native-device-info';
import performanceEnum from './constants/performance';
import * as api from './api';
import * as Emitter from '@lib/vietnam-emitter';
import { postBrokerName2 } from './screens/home/Controllers/RegionController';
import {
	registerByAccount,
	registerByUser,
	unregisterNews,
	registerNews,
	registerByRoleGroup,
	unregisterAllMessage,
	unregisterAllMessageByUser,
	unregisterAllMessageRoleGroup
} from './streaming';
import { setUserId } from '~/lib/base/analytics';
import {
	initCacheOrderTransactions,
	initCachePersonal,
	getCheckChange,
	autoCheckChange
} from '~/cache';
import * as RoleUser from './roleUser';
import * as Channel from './streaming/channel';
import HOME_SCREEN from '../src/constants/home_screen.json';
import TIME_ZONE from '~/constants/time_zone';
import {
	getLastUserOktaLoginId,
	checkBiometricAvailable,
	onUserCancel,
	getBiometricSetting
} from '~/manage/manageAuth';
import { setBrokerName } from '~/screens/home/Model/LoginModel.js';
import { loginError } from './screens/home/Controllers/LoginController';

const loginState = {
	NOT: 0,
	LOGING: 1,
	SUCCESS: 2
};
const TIMEOUT_LOGING = 5000;

//  START SESSION
AppController.initApp();

// Todo: Create a splashscreen show CodePush update progresss,
const store = configureStore();
Controller.setGlobalStore(store);
dataStorage.platform = 'ios';
// Uncomment following line to unpersist local storage
// localStorage.purge();

buildStyle();
registerScreens(store, Provider);

const autoLogin = (notif, isStartApp) => {
	console.log('YOLO autoLogin');
	try {
		const objStore = store.getState();
		const login = objStore.login;
		dataStorage.emailLogin = login.email.toLowerCase().trim() || '';
		Controller.setLoginStatus(login.isLogin);
		if (login.token || isStartApp) {
			store.dispatch(
				loginActions.login(
					login.email,
					null,
					login.token,
					dataStorage.loginDefault
				)
			);
		}
	} catch (error) {
		// logDevice('error', `IOS autoLogin exception: ${error}`)
		console.log('IOS autoLogin error', error);
	}
};

class App extends Component {
	constructor(props) {
		super(props);
		Text.defaultProps = Text.defaultProps || {};
		Text.defaultProps.allowFontScaling = false;
		TextInput.defaultProps = Text.defaultProps || {};
		TextInput.defaultProps.allowFontScaling = false;
		this.loginSuccess = loginState.NOT;
		this.needClickToLogout = false;
		this.perf = new Perf(performanceEnum.start_app_ios);
		this.emailDefault = config.username;
		this.passDefault = config.password;
		this.isReady = true;
		this.alreadyShowReauthenPopUp = false;
		this.startAppFunction = this.startAppFunction.bind(this);
		this.registerMessage = this.registerMessage.bind(this);
		this.loginDefault = this.loginDefault.bind(this);
		this.loginDefaultAccount = this.loginDefaultAccount.bind(this);
		this.startAppAfterLoadStore = this.startAppAfterLoadStore.bind(this);
		this.subForceReloadUser = this.subForceReloadUser.bind(this);
		this.loginApp = this.loginApp.bind(this);
		this.setNewPin = this.setNewPin.bind(this);
		this.getUserPinSuccessCallback =
			this.getUserPinSuccessCallback.bind(this);
		this.clearCheckNetworkInterval =
			this.clearCheckNetworkInterval.bind(this);
		this.callbackDefault = this.callbackDefault.bind(this);
		this.showDisclaimer = this.showDisclaimer.bind(this);
		this.callbackAfterLogin = this.callbackAfterLogin.bind(this);
		this.goToApp = this.goToApp.bind(this);
		this.reloadAppAfterLogin = this.reloadAppAfterLogin.bind(this);
		this.checkUpdateApp = this.checkUpdateApp.bind(this);
		this.checkConnection = this.checkConnection.bind(this);
		this.checkEnterWrongPin = this.checkEnterWrongPin.bind(this);
		this.showAlertChangePin = this.showAlertChangePin.bind(this);
		this.showMaintainModal = this.showMaintainModal.bind(this);
		this.openNoti = this.openNoti.bind(this);
		this.initNotiListener = this.initNotiListener.bind(this);
		this.interVal = null;
		this.prevNetworkConnection = null;
		this._handleAppStateChange = this._handleAppStateChange.bind(this);
		this.callBackAutoLogin = this.callBackAutoLogin.bind(this);
		this.checkConditionCurrentScreen =
			this.checkConditionCurrentScreen.bind(this);
		this.showForm = this.showForm.bind(this);
		this.unregisterMessage = this.unregisterMessage.bind(this);
		this.getDefaultTimeZone = this.getDefaultTimeZone.bind(this);
		dataStorage.unregisterMessage = this.unregisterMessage;
		// SplashScreen.hide();
		// logDevice(
		// 	'info',
		// 	`===========> START APP <============= UPDATE VERSION: ${I18n.tEn(
		// 		'version'
		// 	)}`
		// );
		this.update = new CheckUpdate(
			this.startAppAfterLoadStore,
			null,
			this.showForm
		);
		const localStorage = persistStore(store, this.checkUpdateApp);
		dataStorage.checkUpdateApp = this.checkUpdateApp;
		dataStorage.loginDefaultAccount = this.loginDefaultAccount;
		dataStorage.loginDefault = this.loginDefault;
		dataStorage.clearCheckNetworkInterval = this.clearCheckNetworkInterval;
		dataStorage.deviceModel = DeviceInfo.getModel();
		dataStorage.disclaimerOncheck = this.onCheck.bind(this);
		dataStorage.disclaimerAccept = this.onAccept.bind(this);
		dataStorage.setNewPin = this.setNewPin;
		dataStorage.authenPinForAutoLogin =
			this.authenPinForAutoLogin.bind(this);
		dataStorage.callBackAutoLogin = this.callBackAutoLogin;
		dataStorage.showAlertChangePin = this.showAlertChangePin;
		dataStorage.startAppAfterLoadStore =
			this.startAppAfterLoadStore.bind(this);
		// EventEmitter.addListener('signOutSuccess', this.handleSignOutOkta);
		// Check support touch id
		this.showForm(false);
		checkTouchIdSupport();
		if (config.clearLocalStorage) {
			clearAllItemFromLocalStorage();
		}
		AppController.handleEventApp();
		this.subForceReloadUser();
		this.getDefaultTimeZone();
		Business.getUserAgent();
		Business.getDeviceID();
		Business.initEnv();
		this.initNotiListener();
	}

	// handleSignOutOkta = this.handleSignOutOkta.bind(this);
	// async handleSignOutOkta() {
	// 	console.log('handleSignOutOkta ios');
	// 	dataStorage.isLoggedInOkta = false;
	// 	store.dispatch(loginActions.logout());
	// }

	openNotiInApp = this.openNotiInApp.bind(this);
	openNotiInApp(notif) {
		console.log('YOLO openNotiInApp');
		const isLogged = Controller.getLoginStatus();
		if (isLogged) {
			dataStorage.menuSelected = ENUM.MENU_SELECTED.alertLog;
			// this.switchForm(menuSelected, 'equix.Alerts', {});
			pushScreenToCurrentTab({
				screen: 'equix.AlertLog',
				title: 'equix.AlertLog',
				backMore: false,
				passProps: {
					targetNoti: true
				}
			});
		} else {
		}
		// getOrderDataBeforeShowDetail({
		// 	cb: showNotiInApp,
		// 	isOutApp: false,
		// 	notif
		// });
	}

	openNoti = this.openNoti.bind(this);
	openNoti(notif) {
		console.log('YOLO openNoti');
		try {
			const inApp = Controller.getInAppStatus();
			if (inApp) {
				getLastTimeRenewToken(() => this.openNotiInApp(notif));
			} else {
				this.setNotiData(notif);
			}
		} catch (error) {
			console.log('openNoti', error);
			// logDevice('error', `IOS => openNoti exception ${JSON.stringify(error)}`);
		}
	}

	initNotiListener() {
		console.log('YOLO initNotiListener');
		Business.getMessagingToken();
		Business.notificationOpenedListener(this.openNoti);
		Business.onMessage();
		Business.onNotification();
	}

	getDefaultTimeZone() {
		console.log('YOLO getDefaultTimeZone');
		const AUTimeZone = getTimezoneByLocation(ENUM.LOCATION.AU);
		const USTimeZone = getTimezoneByLocation(ENUM.LOCATION.US);
		Controller.setTimeZoneAU(AUTimeZone);
		Controller.setTimeZoneUS(USTimeZone);
	}

	subForceReloadUser() {
		console.log('YOLO subForceReloadUser');
		const channelName = Channel.getChannelForceReload();
		Emitter.addListener(channelName, Util.getRandomKey(), () => {
			initApp(this.callbackAfterLogin);
		});
	}

	handleConnectionChange(isConnected) {
		console.log('YOLO handleConnectionChange');
		store.dispatch(appActions.changeConnection(isConnected));
	}

	async showForm(isUpdating) {
		console.log('YOLO showForm');
		await this.settingThemeBeforeLogin();
		showBusyBoxScreen({
			isUpgrade: false,
			isUpdating
		});
		SplashScreen.hide();
	}

	showMaintainModal() {
		console.log('YOLO showMaintainModal');
		if (
			dataStorage.maintain.preState === dataStorage.maintain.currentState
		) {
			return;
		}

		if (
			(dataStorage.maintain.preState === null &&
				dataStorage.maintain.currentState === false) ||
			(dataStorage.maintain.preState === false &&
				dataStorage.maintain.currentState === null)
		) {
			dataStorage.maintain.preState = dataStorage.maintain.currentState;
			return;
		}
		// reload App when maintain done
		if (
			(dataStorage.maintain.preState === true &&
				dataStorage.maintain.currentState === false) ||
			(dataStorage.maintain.preState === true &&
				dataStorage.maintain.currentState === null)
		) {
			dataStorage.maintain.preState = dataStorage.maintain.currentState;
			dataStorage.isLocked = true;
			dataStorage.startAppAfterLoadStore &&
				dataStorage.startAppAfterLoadStore();
			// this.startAppAfterLoadStore()
		}
		// maintain App
		if (
			dataStorage.maintain.preState !== true &&
			dataStorage.maintain.currentState === true
		) {
			dataStorage.maintain.preState = dataStorage.maintain.currentState;
			showBusyBoxScreen({
				isUpgrade: true
			});
		}
	}
	clearCheckNetworkInterval() {
		if (this.interVal) {
			clearInterval(this.interVal);
		}
	}
	checkConnection(cbFn) {
		console.log('YOLO checkConnection');
		try {
			const handlerConenction = (isConnected) => {
				Emitter.emit(Channel.getChannelConnectionChange(), isConnected);
				// let isConnected = (snap.val() === true || snap.val() === 1);
				if (!isConnected && this.isReady) {
					this.showForm(false);
				} else {
					if (isConnected && this.isReady) {
						cbFn && cbFn(isConnected);
					}
					this.isReady = false;
					this.handleConnectionChange(isConnected);
				}
			};
			const url = `${Controller.getBaseUrl(
				false
			)}/${Controller.getVersion('version')}/info`;
			if (!this.interVal) {
				// check network connection first time
				checkNetworkConnection1(url, (cn) => {
					this.showMaintainModal();
					if (
						this.prevNetworkConnection === null ||
						this.prevNetworkConnection !== cn
					) {
						if (cn) {
							if (!dataStorage.isSignOut) {
								// dataStorage.callbackAfterReconnect && dataStorage.callbackAfterReconnect();
								// dataStorage.callbackAfterReconnect = null;
							}
						}
						handlerConenction(cn);
						this.prevNetworkConnection = cn;
					}
				});
			} else {
				// clear setInterval if have
				clearInterval(this.interVal);
			}
			this.interVal = setInterval(() => {
				checkNetworkConnection1(url, (cn) => {
					this.showMaintainModal();
					ManageConnection.checkNetworkConnecting(
						this.prevNetworkConnection,
						cn
					);
					if (
						this.prevNetworkConnection === null ||
						this.prevNetworkConnection !== cn
					) {
						if (cn) {
							if (this.loginSuccess === loginState.LOGING) {
								this.clearTimeoutLoging();
								this.timeoutLoging = setTimeout(() => {
									console.log('YOLO relogin');
									this.startAppFunction();
								}, TIMEOUT_LOGING);
							} else {
								if (!dataStorage.isSignOut) {
									// dataStorage.callbackAfterReconnect && dataStorage.callbackAfterReconnect();
									// dataStorage.callbackAfterReconnect = null;
								}
								dataStorage.isSignOut = false;
							}
						}
						handlerConenction(cn);
						this.prevNetworkConnection = cn;
						// fbemit.emit('autoLoginChangeNetworkConnection', 'autologin', cn)
					}
				});
			}, 3000);
		} catch (error) {
			logDevice('error', `App IOS Check connection error: ${error}`);
			logAndReport(`App IOS Check connection error: ${error}`);
		}
	}

	checkConditionCurrentScreen(arrScreen) {
		console.log('YOLO checkConditionCurrentScreen');
		if (Array.isArray(arrScreen) && arrScreen.length > 0) {
			return arrScreen.includes(dataStorage.currentScreenId);
		}
		return false;
	}

	_handleAppStateChange(nextAppState) {
		console.log('YOLO _handleAppStateChange');
		try {
			ManageConnection.setAppState(nextAppState);
			if (nextAppState === 'active') {
				ManageAppstate.reloadScreenAfterActive();
				if (func.getUpdateAfterChangeAppState()) {
					this.update.checkSystemVersion().then((isNeedUpdate) => {
						if (isNeedUpdate) {
							this.showUpdateMe();
						} else {
							this.update.updateSoftware(false);
						}
					});
				}
				if (func.getDiffTimeBackground()) {
					if (dataStorage.pinSetting !== 0) {
						const objStore = store.getState();
						let login = null;
						if (objStore) {
							login = objStore.login || {};
						}
						if (
							login &&
							login.loginObj &&
							login.loginObj.accessToken &&
							login.loginObj.refreshToken &&
							login.loginObj.pin &&
							login.email
						) {
							dataStorage.pin = Util.getPinOriginal(
								login.loginObj
							);
							dataStorage.reAuthen = true;
							if (
								Controller.getLoginStatus() &&
								this.alreadyShowReauthenPopUp === false
							) {
								this.alreadyShowReauthenPopUp = true;
								showAutoLoginModal({
									callback: () => {
										setTimeout(() => {
											func.setLoginConfig(true);
											Navigation.dismissAllModals();
										}, 200);
										setTimeout(() => {
											this.alreadyShowReauthenPopUp = false;
										}, 4 * 60 * 1000);
									},
									byPassAuthenFn: this.autoLogin,
									isModal: true,
									token: login.loginObj.refreshToken,
									isTransparentBackgroundColor: true
								});
							}
						}
					}
				}
			} else if (
				nextAppState === 'background' ||
				nextAppState === 'inactive'
			) {
				func.setInactiveTime();
				return new Promise(async (resolve) => {
					await onUserCancel({ resolve, needCheckBiometric: true });
				});
			}
		} catch (error) {
			logDevice('error', `_handleAppStateChange EXCEPTION - ${error}`);
		}
	}

	checkUpdateNative = this.checkUpdateNative.bind(this);
	checkUpdateNative(callback) {
		let isNeedUpdate = false;
		const byPass = false;
		const {
			iress = true,
			ios_build: iosBuild,
			ios_next_build: iosNextBuild,
			android_build: androidBuild,
			android_next_build: androidNextBuild
		} = dataStorage.systemInfo;
		Controller.setIressStatus(iress);
		if (Platform.OS === 'ios') {
			if (
				config.currentIosVersion <= iosBuild &&
				config.currentIosVersion <= iosNextBuild
			) {
				isNeedUpdate = true;
			}
		} else {
			if (
				config.currentAndroidVersion <= androidBuild &&
				config.currentAndroidVersion <= androidNextBuild
			) {
				isNeedUpdate = true;
			}
		}
		// Process
		if (isNeedUpdate) {
			this.showUpdateMe();
		} else {
			console.log('DCM OPTIMIZE checkUpdateApp END', new Date());
			callback && callback();
			this.update.updateSoftware(byPass);
			AppState.removeEventListener('change', this._handleAppStateChange);
			AppState.addEventListener('change', this._handleAppStateChange);
		}
	}

	checkUpdateApp(byPass = false, callback) {
		console.log('DCM OPTIMIZE checkUpdateApp START', new Date());
		try {
			// Check update native?
			!byPass && this.checkUpdateNative(callback);

			this.checkConnection((isConnected) => {
				if (byPass) {
					this.update.updateSoftware(byPass);
				} else {
					this.checkUpdateNative(callback);
				}
			});
		} catch (error) {
			logDevice('info', `checkUpdateApp error: ${error}`);
		}
	}

	startAppAfterLoadStore() {
		console.log('DCM OPTIMIZE startAppAfterLoadStore START', new Date());
		store.dispatch(loginActions.setLoginFailed());
		iconsLoaded
			.then(() => {
				dataStorage.reloadAppAfterLogin = this.reloadAppAfterLogin;
				dataStorage.startApp = this.startAppFunction;

				console.log('DCM OPTIMIZE startAppFunction START', new Date());
				// await this.settingThemeBeforeLogin()
				this.startAppFunction();
				this.initNotification();
			})
			.catch((error) => {
				logDevice(
					'error',
					`START APP AFTER LOADSTORE EXCEPTION ${error}`
				);
				Alert.alert('Could not load resource. Please try again');
			});
	}

	initNotification() {
		console.log('YOLO initNotification');
		try {
			Business.requestNotiPermission();
		} catch (error) {
			logDevice('info', `initNotification EXCEPTION ${error}`);
		}
	}

	authenPinForAutoLogin(
		key,
		token,
		callback,
		byPass = false,
		usePin = false
	) {
		console.log('YOLO authenPinForAutoLogin');
		// Auto login - goi componen <AutoLogin de xac thuc
		if (byPass) {
			showAutoLoginModal({
				callback,
				isModal: true,
				token,
				isByPass: true,
				usePin
			});
		} else {
			getItemFromLocalStorage(
				key,
				null,
				token,
				() => {
					// Khong bao gio vao case nay -> vao case nay loi
					this.loginDefault();
					SplashScreen.hide();
				},
				(result) => {
					// TH: autologin -> co local storage -> goi component AutoLogin de xac thuc -> run app
					dataStorage.userPin = result;
					// Set touch id status on or off for auth setting screen
					if (
						result.enableTouchID !== null &&
						result.enableTouchID !== undefined
					) {
						if (dataStorage.isNotEnrolledTouchID) {
							dataStorage.userPin.enableTouchID = false;
							saveItemInLocalStorage(
								dataStorage.userPin.email,
								dataStorage.userPin,
								null,
								null,
								null
							);
							store.dispatch(
								authSettingActions.setEnableTouchID(false)
							);
						} else {
							store.dispatch(
								authSettingActions.setEnableTouchID(
									result.enableTouchID
								)
							);
						}
					}
					// Set autologin flag
					dataStorage.maintain.currentState !== true &&
						showAutoLoginScreen({
							callback,
							token,
							isAutoLogin: true // Ch??? ri??ng auto login s??? c?? emit ri??ng cho tr?????ng h???p m???t k???t n???i m???ng
						});
					// SplashScreen.hide();
				}
			);
		}
	}

	loginApp(type = 'default', objParams) {
		console.log('DCM OPTIMIZE autoLogin START', new Date());
		const email = (objParams.email + '').toLowerCase().trim();
		// Type = 'autologin' -> show form pin
		if (type === 'autologin') {
			// Auto login b???ng pin v?? t??? ?????ng x??c th???c l???i khi kh??ng d??ng app trong 5 ph??t ho???c 15 ph??t theo setting
			const refreshToken = objParams.loginObj.refreshToken;
			this.authenPinForAutoLogin(
				email,
				refreshToken,
				this.callBackAutoLogin
			);
		} else {
			// Type = 'default' -> v??o th???ng app
			// X??c th???c pin khi ?????t l???nh, modify, cancel
			// Lay user info
			const userDetail = Controller.getUserInfo();
			this.processUserDetail(userDetail);
		}
	}

	checkEnterWrongPin(key, cb) {
		console.log('YOLO checkEnterWrongPin');
		// N???u s??? l???n nh???p sai pin >= 3 th?? t??? ?????ng logout
		try {
			AsyncStorage.getItem(key)
				.then((result) => {
					if (result) {
						const data = JSON.parse(result);
						// N???u s??? l???n nh???p sai pin === 3 -> login default
						const numberFailEnterPin = data.numberFailEnterPin || 0;
						dataStorage.userPin = data;
						// Set touch id status on or off for auth setting screen
						if (
							data.enableTouchID !== null &&
							data.enableTouchID !== undefined
						) {
							if (dataStorage.isNotEnrolledTouchID) {
								dataStorage.userPin.enableTouchID = false;
								saveItemInLocalStorage(
									dataStorage.userPin.email,
									dataStorage.userPin,
									null,
									null,
									null
								);
								store.dispatch(
									authSettingActions.setEnableTouchID(false)
								);
							} else {
								store.dispatch(
									authSettingActions.setEnableTouchID(
										data.enableTouchID
									)
								);
							}
						}
						if (numberFailEnterPin >= 3) {
							// Clear email
							store.dispatch(loginActions.setLastEmail(''));
							return store.dispatch(loginActions.logout());
						} else {
							// ??i ti???p
							cb && cb();
						}
					} else {
						// ??i ti???p
						cb && cb();
					}
				})
				.catch((error) => {
					// ??i ti???p
					cb && cb();
					logDevice('info', `GET PIN LOCAL FAIL, ERROR: ${error}`);
				});
		} catch (error) {
			// ??i ti???p
			cb && cb();
			logDevice('info', `GET PIN LOCAL EXCEPTION, ERROR: ${error}`);
		}
	}

	storeSetting = this.storeSetting.bind(this);
	storeSetting(data, userID) {
		// Set history search
		ManageHistorySearch.setHistorySearch({
			userSetting: data,
			isCheckActiveAcc: true
		});
		const isSound = data.notiSound;
		// const homeScreen = data.homeScreen !== undefined && data.homeScreen !== null ? (data.homeScreen === 0 || data.homeScreen === 1) ? 0 : 2 : 0;
		const tabId =
			data.homeScreen && data.homeScreen !== -1 ? data.homeScreen : 0;
		const tabSelected = HOME_SCREEN.find((e) => {
			return e.id === tabId;
		});
		const pinSetting = data.pinSetting || 0;
		data.lang = data.lang || 'en';
		data.textFontSize = data.textFontSize || 17;
		let location = TIME_ZONE[43];
		data.noti =
			data.noti !== null || data.noti !== undefined
				? data.noti
				: data.is_notify !== null || data.is_notify !== undefined
				? data.is_notify
				: true;
		// C???p nh???t l???i setting language
		Controller.dispatch(settingActions.settingResponse(data, userID));
		Controller.setLang(data.lang);
		Controller.setFontSize(data.textFontSize);
		Controller.setSound(isSound);
		Controller.setVibrate(data.vibration);
		Controller.setLocation(location);
		func.setHomeScreen(tabSelected);
		func.setPinSetting(pinSetting);
		func.setPinSettingSession(pinSetting); // Setting tr??n db cho l???n v??o app, s??? ???????c d??ng cho ?????n khi kill app ??i, c?? realtime setting c??ng kh??ng ???nh h?????ng
	}

	getUserSetting = this.getUserSetting.bind(this);
	getUserSetting(userID) {
		return new Promise((resolve) => {
			const urlGetUserSetting = api.getUrlUserSettingByUserId(
				userID,
				'get'
			);
			api.requestData(urlGetUserSetting, true)
				.then((data) => {
					console.log(
						'DCM OPTIMIZE urlGetUserSetting END',
						new Date()
					);
					if (data && data !== 'null') {
						data.type = ENUM.API_RESPONSE_TYPE.SUCCESS;
						resolve(data);
					} else {
						// Ch??a c?? setting, t???o setting m???c ?????nh cho user
						logDevice(
							'info',
							`IOS - GET USER SETTING IS NULL -> CREATE DEFAULT SETTING AND LAUNCH APP`
						);
						Util.setDefaultSetting(userID);
						resolve({
							type: ENUM.API_RESPONSE_TYPE.NULL
						});
					}
				})
				.catch((error) => {
					logDevice(
						'info',
						`IOS - CANT GET USER SETTING -> LOGIN AGAIN - ERROR: ${error}`
					);
					resolve({
						type: ENUM.API_RESPONSE_TYPE.EXCEPTION
					});
				});
		});
	}

	getUserDetail = this.getUserDetail.bind(this);
	getUserDetail() {
		return new Promise((resolve) => {
			const email = dataStorage.emailLogin;
			const url = api.getUrlUserDetailByUserLoginId(email);
			// Lay user info
			console.log(
				'DCM OPTIMIZE getUrlUserDetailByUserLoginId START',
				new Date()
			);
			api.requestData(url, true)
				.then((userInfo) => {
					if (userInfo) {
						dataStorage.isGettedUserInfo = true;
						userInfo.type = ENUM.API_RESPONSE_TYPE.SUCCESS;
						Controller.setUserInfo(userInfo);
						resolve(userInfo);
					} else {
						dataStorage.isGettedUserInfo = false;
						logDevice(
							'error',
							`CALLBACK AUTOLOGIN - CANNOT GET USER INFO - DATA IS NULL - URL: ${url} - DATA: ${data}`
						);
						resolve({
							type: ENUM.API_RESPONSE_TYPE.NULL
						});
					}
				})
				.catch((err) => {
					logDevice(
						'error',
						`GET USERINFO ERROR - URL: ${url} - err: ${err}`
					);
					resolve({
						type: ENUM.API_RESPONSE_TYPE.EXCEPTION
					});
				});
		});
	}

	processUserSetting = this.processUserSetting.bind(this);
	processUserSetting(userSetting = {}, userID, loginObjLocalStorage) {
		const { type } = userSetting;
		switch (type) {
			case ENUM.API_RESPONSE_TYPE.SUCCESS:
				// L??u l???i config v?? setting
				this.storeSetting(userSetting, userID);
				const { pinSetting = 0 } = userSetting;
				// Setting tr??n db cho l???n v??o app, s??? ???????c d??ng cho ?????n khi kill app ??i, c?? realtime setting c??ng kh??ng ???nh h?????ng
				func.setPinSettingSession(pinSetting);
				if (pinSetting === 0) {
					this.loginApp('default', loginObjLocalStorage);
				} else {
					this.loginApp('autologin', loginObjLocalStorage);
				}
				break;
			case ENUM.API_RESPONSE_TYPE.NULL:
				this.loginApp('autologin', loginObjLocalStorage);
				break;
			default:
				// default l?? exception
				this.loginDefault();
				break;
		}
	}

	processUserDetail = this.processUserDetail.bind(this);
	processUserDetail(userDetail = {}) {
		const { type } = userDetail;
		switch (type) {
			case ENUM.API_RESPONSE_TYPE.SUCCESS:
				console.log(
					'DCM OPTIMIZE getUrlUserDetailByUserLoginId END',
					new Date()
				);
				const { status: userStatus } = userDetail;
				this.settingThemeBeforeLogin();
				dataStorage.isGettedUserInfo = true;
				// da lay duoc user info -> setDataLoginSuccess
				Controller.dispatch(loginActions.saveAccountInfo(userDetail)); // L??u l???i account info
				if (
					userStatus === ENUM.USER_STATUS.ACTIVE ||
					userStatus === ENUM.USER_STATUS.PENDING_EMAIL
				) {
					dataStorage.isLocked &&
						this.setDataLoginSuccess(userDetail);
					dataStorage.isLocked = false;
					initCachePersonal(); // init && cache personal
					getRelatedSymbol(); // get related symbol watchlist / portfolio holding
					getCheckChange().then(() => {
						autoCheckChange();
					});
				} else {
					Controller.dispatch(loginActions.accountInative());
					dataStorage.isLocked = true;
					this.loginDefault();
				}
				break;
			case ENUM.API_RESPONSE_TYPE.NULL:
				this.loginDefault();
				break;
			default:
				// Exception
				this.loginDefault();
				break;
		}
	}

	getStorageInformation() {
		return new Promise((resolve) => {
			Promise.all([
				func.getRegionSelected(),
				func.getBrokerName(),
				func.getCacheLoginSuccess(),
				getLastUserOktaLoginId(),
				checkBiometricAvailable()
			])
				.then((res) => {
					resolve(res);
				})
				.catch((err) => {
					console.log(
						'getStorageInformation EXCEPTION',
						err,
						err.message
					);
					resolve([{}, 'false']); // Default value c???a region l?? {}, c???a loginSuccess l?? 'false'
				});
		});
	}

	async startAppFunction() {
		try {
			const listRegion = await getListRegion();
			dataStorage.listRegion = listRegion;
		} catch (error) {
			dataStorage.listRegion = [];
			loginError(error.message);
		}

		try {
			const listRegionByEnv = dataStorage.listRegion.filter((item) => {
				const { region_type: regionType } = item;
				return regionType === ENUM.ENV_TYPE.UAT;
			});
			const size = _.size(listRegionByEnv);
			Controller.dispatch(changeBrokerName(CONFIG.envRegion));
			if (size === 1) {
				const item = listRegionByEnv[0];
				Controller.setRegion(item.region_code);

				await postBrokerName2(CONFIG.envRegion);
			} else {
				const [storeRegion] = await this.getStorageInformation();

				if (storeRegion) {
					Controller.setRegion(storeRegion.region_code);
				}
				if (!isEmpty(storeRegion)) {
					await postBrokerName2(CONFIG.envRegion);
				}
			}

			const biometric = await getBiometricSetting();
			Controller.dispatch(settingActions.setBiometric(!!biometric));
		} catch (error) {
			loginError(error.message);
		}

		dataStorage.isOkta = false;
		dataStorage.isLoggedInOkta = false;
		this.loginDefault();
	}

	loginDefault() {
		console.log('YOLO loginDefault');
		const objStore = store.getState() || {};
		const login = objStore.login || {};
		const checked = login.checked || false;
		if (checked || dataStorage.is_logout) {
			this.callbackDefault();
		} else {
			this.showDisclaimer();
		}
	}

	async settingThemeBeforeLogin() {
		if (!FIXED_THEME)
			dataStorage.currentTheme = await Controller.getThemeColor();
		changeTheme(dataStorage.currentTheme);
	}

	setDataLoginSuccess = this.setDataLoginSuccess.bind(this);
	setDataLoginSuccess(userInfo) {
		try {
			console.log('DCM OPTIMIZE setDataLoginSuccess START', new Date());
			const email = dataStorage.emailLogin;
			// Login success -> setpin isLoading = false
			setTimeout(() => {
				Controller.dispatch(authSettingActions.setPinSuccess());
			}, 1000);
			const userId = userInfo.user_id || userInfo.uid;
			dataStorage.user_id = userId;
			setUserId(userId); // Set id cho firebase analytics
			Controller.setLoginStatus(email !== config.username);
			func.setLoginUserType();
			// Controller.dispatch(loginSuccess(email, password));
			const listPromise = [
				RoleUser.getRoleData(),
				Business.getListAccount(userId)
			];
			console.log(
				'DCM OPTIMIZE GET ROLE & GET LIST ACCOUNT START',
				new Date()
			);
			Promise.all(listPromise).then(() => {
				console.log(
					'DCM OPTIMIZE GET ROLE & GET LIST ACCOUNT END',
					new Date()
				);
				if (dataStorage.accountId) {
					console.log('initCacheOrders - dataStorage.accountId');
					// initCacheOrders();
					initCacheOrderTransactions();
				}
				console.log(
					'DCM OPTIMIZE dataStorage.reloadAppAfterLogin START',
					new Date()
				);
				dataStorage.reloadAppAfterLogin &&
					dataStorage.reloadAppAfterLogin();
			});
		} catch (error) {
			logAndReport(
				'setDataLoginSuccess login action exception',
				error,
				'setDataLoginSuccess login action'
			);
			logDevice(
				'info',
				`setDataLoginSuccess login action exception: ${error}`
			);
		}
	}

	callBackAutoLogin() {
		console.log('YOLO callBackAutoLogin');
		const objStore = store.getState();
		let login = null;
		if (objStore) {
			login = objStore.login || {};
			ckecked = login.checked || false;
		}
		this.perf && this.perf.incrementCounter(performanceEnum.auto_login);
		const url = api.getUrlUserDetailByUserLoginId(dataStorage.emailLogin);
		// Lay user info
		api.requestData(url, true)
			.then(async (data) => {
				if (data) {
					// da lay duoc user info ko get user info lai o phan login action nua (dataStorage.isGettedUserInfo = true)
					Controller.setUserInfo(data);
					this.settingThemeBeforeLogin();
					dataStorage.isGettedUserInfo = true;
					await RoleUser.getRoleData();
					autoLogin(null, true);
				} else {
					dataStorage.isGettedUserInfo = false;
					logDevice(
						'error',
						`CALLBACK AUTOLOGIN - CANNOT GET USER INFO - DATA IS NULL - URL: ${url} - DATA: ${data}`
					);
					this.loginDefault();
				}
			})
			.catch((err) => {
				logDevice(
					'error',
					`GET USERINFO ERROR - URL: ${url} - err: ${err}`
				);
			});
	}

	showAlertChangePin() {
		console.log('YOLO showAlertChangePin');
		// return true
		if (
			!this.needClickToLogout &&
			dataStorage.emailLogin &&
			dataStorage.emailLogin !== config.username &&
			dataStorage.currentScreenId !== ScreenId.CHANGE_PIN &&
			dataStorage.currentScreenId !== ScreenId.SET_PIN
		) {
			this.needClickToLogout = true;
			setTimeout(() => {
				showTokenWasChangedModal({
					callback: (cb) => {
						this.needClickToLogout = false;
						Navigation.dismissModal({
							animationType: 'none'
						});
						setTimeout(() => {
							cb && typeof cb === 'function' && cb();
						}, 200);
					}
				});
			}, 300);
		}
	}

	unregisterMessage() {
		console.log('YOLO unregisterMessage');
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

	registerMessage() {
		console.log('YOLO registerMessage');
		try {
			const accountId = dataStorage.accountId;
			const userId = Controller.getUserId();

			console.log(
				`register messege for user: ${userId}, accountId:${accountId}`
			);

			this.unregisterMessage();

			registerNews(preprocessNoti, 'ALL');

			if (accountId) {
				registerByAccount(accountId, preprocessNoti, 'ALL');
			}
			if (userId) {
				registerByUser(userId, preprocessNoti, 'ALL');
				registerByUser(userId, this.showAlertChangePin, 'AUTH');
				registerByRoleGroup(preprocessNoti, 'ALL');
			}
		} catch (error) {
			logDevice('info', `registerMessage ERROR: ${error}`);
		}
	}

	loginDefaultAccount(checked) {
		console.log('YOLO loginDefaultAccount');
		const url = api.getUrlUserInfoByEmail(this.emailDefault);
		// Lay user info
		api.requestData(url, true)
			.then((data) => {
				if (data && data.length) {
					Controller.setUserInfo(data[0]);
					this.registerMessage();
				} else {
					logDevice(
						'error',
						`CALLBACK AUTOLOGIN - CANNOT GET USER INFO - DATA IS NULL - URL: ${url} - DATA: ${data}`
					);
				}
			})
			.catch((err) => {
				logDevice(
					'error',
					`GET USERINFO ERROR - URL: ${url} - err: ${err}`
				);
			});
		this.perf &&
			this.perf.incrementCounter(performanceEnum.login_default_account);
		let prop = store.getState();

		// if (prop.login.accountId) {
		// 	func.setAccountId(prop.login.accountId);
		// }
		if (!prop) {
			prop = {};
		}
		this.perf &&
			this.perf.incrementCounter(
				performanceEnum.login_default_account_success
			);
		// store.dispatch(appActions.initData(prop.app));
		this.callbackDefault();
		// if (checked || dataStorage.is_logout) {
		//     logDevice('info', `App ios - start app`);
		//     this.startApp();
		// } else {
		//     logDevice('info', `App ios - show term of use`);
		//     this.showDisclaimer();
		// }
	}

	getUserPinSuccessCallback(userPin) {
		console.log('YOLO getUserPinSuccessCallback');
		const userSetting = userPin;
		console.log('userPin', userSetting);
		if (Object.keys(userSetting).length > 0) {
			dataStorage.userPin = userSetting;
			// Set touch id status on or off for auth setting screen
			if (
				userSetting.enableTouchID !== null &&
				userSetting.enableTouchID !== undefined
			) {
				store.dispatch(
					authSettingActions.setEnableTouchID(
						userSetting.enableTouchID
					)
				);
			}
		}
		dataStorage.checkUpdateApp && dataStorage.checkUpdateApp(false);
		showNewOverViewScreen();

		SplashScreen.hide();
		store.dispatch(loginActions.loginAppSuccess());
		this.perf && this.perf.stop();
	}

	setNewPin(objParam, token, localData) {
		console.log('YOLO setNewPin');
		if (localData) {
			// TH: autologin -> co local storage -> goi component AutoLogin de xac thuc -> run app
			dataStorage.userPin = localData;
			// Set touch id status on or off for auth setting screen
			if (
				localData.enableTouchID !== null &&
				localData.enableTouchID !== undefined
			) {
				store.dispatch(
					authSettingActions.setEnableTouchID(localData.enableTouchID)
				);
			}
		}
		setTimeout(() => {
			showSetPinModal({
				type: 'new',
				isShowCancel: false,
				token,
				objParam
			});
		}, 300);
		SplashScreen.hide();
		store.dispatch(loginActions.loginAppSuccess());
		this.perf && this.perf.stop();
	}

	setNotiData(data) {
		this.notiData = data;
	}

	resetNotiData() {
		this.notiData = null;
	}

	goToApp() {
		// Set inApp status
		const tabSelected = HOME_SCREEN[3];
		dataStorage.tabIndexSelected = tabSelected.tabIndex;
		const cb = (tabInfo = tabSelected) => {
			// Exception when ko truyen tabInfor
			Controller.setInAppStatus(true);
			dataStorage.maintain.currentState !== true &&
				showMainAppScreen({
					...tabInfo,
					...{
						originActiveTab: this.notiData
							? tabSelected.activeTab
							: tabInfo.activeTab
					}
				});
			this.resetNotiData();
			func.setUpdateAfterChangeAppState(true);
		};
		if (this.notiData) {
			getOrderDataBeforeShowDetail({
				cb,
				isOutApp: true,
				notif: this.notiData
			});
		} else {
			cb(tabSelected);
		}
	}

	setLoginState(state) {
		this.loginSuccess = state;
	}

	clearTimeoutLoging() {
		this.timeoutLoging && clearTimeout(this.timeoutLoging);
	}

	callbackAfterLogin() {
		console.log('DCM OPTIMIZE callbackAfterLogin START', new Date());
		try {
			// Sau khi dang nhap thanh cong thi vao day de check home screen
			// Get login user type
			const brokerName = store.getState().login.brokerName;
			setBrokerName(brokerName);
			postBrokerName2(brokerName);

			this.setLoginState(loginState.SUCCESS);
			this.clearTimeoutLoging();
			if (dataStorage.checkUpdateApp) {
				dataStorage.checkUpdateApp(false, () => {
					this.goToApp();
				});
			} else {
				this.goToApp();
			}
		} catch (error) {
			logDevice(
				'error',
				`IOS - CALLBACK AFTER LOGIN -> GO TO HOME SCREEN EXCEPTION: ${error}`
			);
		}
	}

	reloadAppAfterLogin() {
		console.log('YOLO reloadAppAfterLogin');
		initApp(this.callbackAfterLogin);
	}

	onCheck(checked) {
		console.log('YOLO onCheck');
		store.dispatch(loginActions.disclaimerDisplay(checked));
	}

	onAccept() {
		console.log('YOLO onAccept');
		try {
			this.startApp();
		} catch (err) {
			store.dispatch(loginActions.disclaimerDisplay(false));
		}
	}

	showUpdateMe() {
		console.log('YOLO showUpdateMe');
		showUpdateMeScreen();
	}

	showDisclaimer() {
		console.log('YOLO showDisclaimer');
		dataStorage.checkUpdateApp &&
			dataStorage.checkUpdateApp(false, () => {
				// Timeout wait for busybox animation finish
				setTimeout(() => {
					dataStorage.maintain.currentState !== true &&
						showDisclaimerScreen({
							onCheck: this.onCheck,
							onAccept: this.onAccept.bind(this)
						});
				}, 1100);
			});

		SplashScreen.hide();
	}

	async callbackDefault() {
		// Show sign in screen
		dataStorage.checkUpdateApp &&
			dataStorage.checkUpdateApp(false, async () => {
				if (dataStorage.loginAsGuest) {
					await this.settingThemeBeforeLogin();
					dataStorage.maintain.currentState !== true &&
						showNewOverViewScreen();
				} else {
					// Timeout wait for busybox animation finish
					const timeOut = dataStorage.is_logout ? 200 : 1100;
					this.clearTimeoutLoging();
					setTimeout(() => {
						dataStorage.maintain.currentState !== true &&
							this.goToApp();
						// showHomePageScreen();
					}, timeOut);
				}
			});
		SplashScreen.hide();
		store.dispatch(loginActions.loginAppSuccess());
		// Get language && fontsize guest
		// const langGuest = await Controller.getLangGuest();
		// const fontSizeGuest = await Controller.getFontSizeOfGuest();
		// if (langGuest) {
		//     Controller.setLang(langGuest);
		//     Controller.dispatch(settingActions.setLang(langGuest));
		// } else {
		//     Controller.setLang(Util.choseLanguage());
		//     Controller.dispatch(settingActions.setLang(Util.choseLanguage()));
		// }
		// Iress fixed languege en
		Controller.setLang('en');
		Controller.dispatch(settingActions.setLang('en'));
		Controller.setFontSize(ENUM.FONT_SIZES[1].value);
		Controller.dispatch(
			settingActions.setFontSize(ENUM.FONT_SIZES[1].value)
		);
	}

	startApp() {
		console.log('YOLO startApp');
		try {
			initApp(this.callbackDefault);
		} catch (error) {
			logDevice(
				'info',
				`App ios - Start App function exception: ${error}`
			);
		}
	}
}

export default App;
