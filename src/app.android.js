/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Alert, AppState, Text, TextInput, Platform } from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage';
import { Navigation } from 'react-native-navigation';
import { registerScreens } from './screens';
import I18n from './modules/language/';
import CONFIG from '~/config';
import { iconsLoaded } from './utils/AppIcons';
import configureStore from './store/configureStore';
import { pushScreenToCurrentTab } from '~/navigation/controller.1';
import { Provider } from 'react-redux';
import _, { isEmpty } from 'lodash';
import persistStore from './store/persistStore';
import firebase from './firebase';
import * as AppController from './app.controller';
import {
	logFirebase,
	getItemFromLocalStorage,
	checkTouchIdSupport,
	logDevice,
	logAndReport,
	preprocessNoti,
	checkNetworkConnection1,
	saveItemInLocalStorage,
	getTimezoneByLocation,
	getSoftBarHeight,
	getLastTimeRenewToken,
	getOrderDataBeforeShowDetail,
	getRelatedSymbol
} from './lib/base/functionUtil';
import { dataStorage, func } from './storage';
import * as Controller from './memory/controller';
import config from './config';
import ENUM from './enum';
import Perf from './lib/base/performance_monitor';
import SplashScreen from 'react-native-splash-screen';
import * as loginActions from './screens/login/login.actions';
import * as appActions from './app.actions';
import * as authSettingActions from './screens/setting/auth_setting/auth_setting.actions';
import * as settingActions from './screens/setting/setting.actions';
import { initApp } from './initStorage';
import CheckUpdate from './component/check_update/check_update';
import DeviceInfo from 'react-native-device-info';
import performanceEnum from './constants/performance';
import { getListRegion } from '~/screens/home/Controllers/RegionController.js';
import * as api from './api';
import * as Emitter from '@lib/vietnam-emitter';
import {
	unregisterNews,
	registerNews,
	registerByAccount,
	registerByUser,
	registerByRoleGroup,
	unregisterAllMessage,
	unregisterAllMessageByUser,
	unregisterAllMessageRoleGroup
} from './streaming';
import ScreenId from '../src/constants/screen_id';
import * as Business from '../src/business';
import * as Util from '../src/util';
import * as StreamingAll from './streaming/all';
import * as RoleUser from './roleUser';
import * as Channel from './streaming/channel';
import '../utils/localStorageConfig';
import * as ManageConnection from '../src/manage/manageConnection';
import * as ManageAppstate from '../src/manage/manageAppState';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import CommonStyle from '~/theme/theme_controller';
import { changeTheme, FIXED_THEME } from './theme/theme_controller';
import {
	showNewOverViewScreen,
	showHomePageScreen,
	showMainAppScreen,
	showUpdateMeScreen
} from '~/navigation/controller.1';
import HOME_SCREEN from '~/constants/home_screen.json';
import { setUserId } from '~/lib/base/analytics';
import {
	initCacheOrderTransactions,
	initCachePersonal,
	getCheckChange,
	autoCheckChange
} from '~/cache';
import TIME_ZONE from '~/constants/time_zone';
import { setBrokerName } from '~/screens/home/Model/LoginModel.js';
import {
	getLastUserOktaLoginId,
	checkBiometricAvailable,
	getBiometricSetting
} from '~/manage/manageAuth';
import { postBrokerName2 } from './screens/home/Controllers/RegionController';
import { changeBrokerName } from '~s/login/login.actions';
import { loginError } from './screens/home/Controllers/LoginController';

const loginState = {
	NOT: 0,
	LOGING: 1,
	SUCCESS: 2
};
const TIMEOUT_LOGING = 5000;

//  START SESSION
AppController.initApp();

dataStorage.platform = 'android';
// Todo: Create a splashscreen show CodePush update progresss, change staging deployment key to quant-edge acc
const store = configureStore();
Controller.setGlobalStore(store);
// Save store to local storage and autoRehydrate when startup
// Uncomment following line to unpersist local storage
// localStorage.purge();

registerScreens(store, Provider);

class App extends Component {
	constructor(props) {
		console.log('YOLO constructor');
		super(props);
		Text.defaultProps = Text.defaultProps || {};
		Text.defaultProps.allowFontScaling = false;
		TextInput.defaultProps = Text.defaultProps || {};
		TextInput.defaultProps.allowFontScaling = false;
		this.loginSuccess = loginState.NOT;
		this.needClickToLogout = false;
		this.perf = new Perf(performanceEnum.start_app_android);
		this.startApp = this.startApp.bind(this);
		this.isReady = true;
		this.alreadyShowReauthenPopUp = false;
		this.showForm = this.showForm.bind(this);
		this.loginDefault = this.loginDefault.bind(this);
		this.loginDefaultAccount = this.loginDefaultAccount.bind(this);
		this.emailDefault = config.username;
		this.passDefault = config.password;
		this.startAppFunction = this.startAppFunction.bind(this);
		this.registerMessage = this.registerMessage.bind(this);
		dataStorage.registerMessage = this.registerMessage;
		this.startAppAfterLoadStore = this.startAppAfterLoadStore.bind(this);
		this.loginApp = this.loginApp.bind(this);
		this.callbackDefault = this.callbackDefault.bind(this);
		this.autoLogin = this.autoLogin.bind(this);
		this.checkUpdateApp = this.checkUpdateApp.bind(this);
		this.clearCheckNetworkInterval =
			this.clearCheckNetworkInterval.bind(this);
		this.checkConnection = this.checkConnection.bind(this);
		this.checkEnterWrongPin = this.checkEnterWrongPin.bind(this);
		this.openNoti = this.openNoti.bind(this);
		this.initNotiListener = this.initNotiListener.bind(this);
		this.interVal = null;
		this.prevNetworkConnection = null;
		this.showAlertChangePin = this.showAlertChangePin.bind(this);
		this._handleAppStateChange = this._handleAppStateChange.bind(this);
		this.showDisclaimer = this.showDisclaimer.bind(this);
		this.callBackAutoLogin = this.callBackAutoLogin.bind(this);
		this.callbackAfterLogin = this.callbackAfterLogin.bind(this);
		this.goToApp = this.goToApp.bind(this);
		this.unregisterMessage = this.unregisterMessage.bind(this);
		this.getDefaultTimeZone = this.getDefaultTimeZone.bind(this);
		this.showMaintainModal = this.showMaintainModal.bind(this);
		dataStorage.unregisterMessage = this.unregisterMessage;
		logDevice(
			'info',
			`===========> START APP <============= UPDATE VERSION: ${I18n.tEn(
				'version'
			)}`
		);
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
		dataStorage.deviceBrand = DeviceInfo.getBrand();
		dataStorage.disclaimerOncheck = this.onCheck.bind(this);
		dataStorage.disclaimerAccept = this.onAccept.bind(this);
		dataStorage.setNewPin = this.setNewPin;
		dataStorage.reloadAppAfterLogin = this.callbackAfterLogin;
		dataStorage.authenPinForAutoLogin =
			this.authenPinForAutoLogin.bind(this);
		dataStorage.callBackAutoLogin = this.callBackAutoLogin;
		dataStorage.showAlertChangePin = this.showAlertChangePin;
		dataStorage.startAppAfterLoadStore =
			this.startAppAfterLoadStore.bind(this);
		// EventEmitter.addListener('signOutSuccess', this.handleSignOutOkta);
		// Check support touch id
		// SplashScreen.hide();
		this.showForm(false);
		checkTouchIdSupport();
		getSoftBarHeight();
		AppController.handleEventApp();
		this.getDefaultTimeZone();
		Business.getUserAgent();
		Business.getDeviceID();
		Business.initEnv();
		this.initNotiListener();
	}

	// handleSignOutOkta = this.handleSignOutOkta.bind(this);
	// async handleSignOutOkta() {
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
		Business.createAndroidNotiChannel();
		Business.getMessagingToken();
		Business.onMessage();
		Business.onNotification();
		Business.notificationOpenedListener(this.openNoti);
	}

	getDefaultTimeZone() {
		console.log('YOLO getDefaultTimeZone');
		const AUTimeZone = getTimezoneByLocation(ENUM.LOCATION.AU);
		const USTimeZone = getTimezoneByLocation(ENUM.LOCATION.US);
		Controller.setTimeZoneAU(AUTimeZone);
		Controller.setTimeZoneUS(USTimeZone);
	}

	showAlertChangePin() {
		console.log('YOLO showAlertChangePin');
		if (
			!this.needClickToLogout &&
			dataStorage.emailLogin &&
			dataStorage.emailLogin !== config.username &&
			dataStorage.currentScreenId !== ScreenId.CHANGE_PIN &&
			dataStorage.currentScreenId !== ScreenId.SET_PIN
		) {
			this.needClickToLogout = true;
			setTimeout(() => {
				Navigation.showModal({
					screen: 'equix.TokenWasChanged',
					animated: true,
					animationType: 'fade',
					navigatorStyle: {
						navBarHidden: true,
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						callback: (cb) => {
							this.needClickToLogout = false;
							Navigation.dismissModal({
								animationType: 'none'
							});
							setTimeout(() => {
								cb && typeof cb === 'function' && cb();
							}, 200);
						}
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
			// Controller.isPriceStreaming()
			// 	? unregisterByAccount(accountId, preprocessNoti, 'ALL')
			// 	: unregisterByAccount(accountId, preprocessNoti, 'ALL')
			unregisterAllMessage(accountId);
		}
		if (userId) {
			// if (Controller.isPriceStreaming()) {
			// 	unregisterByUser(userId, preprocessNoti, 'ALL')
			// 	unregisterByUser(userId, this.showAlertChangePin, 'AUTH')
			// } else {
			// 	unregisterByUser(userId, preprocessNoti, 'ALL')
			// 	unregisterByUser(userId, this.showAlertChangePin, 'AUTH')
			// }
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
			logFirebase('getToken error: ');
			logFirebase(error);
		}
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
			Navigation.startSingleScreenApp({
				screen: {
					screen: 'equix.BusyBox',
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
				passProps: {
					isUpgrade: true
				},
				animationType: 'none'
			});
		}
	}
	clearCheckNetworkInterval() {
		if (this.interVal) {
			clearInterval(this.interVal);
		}
	}
	checkConnection(cb) {
		console.log('YOLO checkConnection');
		try {
			const handlerConenction = (isConnected) => {
				Emitter.emit(Channel.getChannelConnectionChange(), isConnected);
				logDevice(
					'info',
					`ANDROID => HANDLERCONNECTION CALLED - isConnected: ${isConnected} - this.isReady: ${this.isReady}`
				);
				if (!isConnected && this.isReady) {
					this.showForm(false);
				} else {
					if (isConnected && this.isReady) {
						cb && cb(isConnected);
					}
					this.isReady = false;
					this.handleConnectionChange(isConnected);
				}
			};

			const url = `${Controller.getBaseUrl(
				false
			)}/${Controller.getVersion('version')}/info`;
			if (!this.interVal) {
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
							dataStorage.isSignOut = false;
						}
						handlerConenction(cn);
						this.prevNetworkConnection = cn;
					}
				});
			} else {
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
			logDevice('info', `App Android Check connection error: ${error}`);
			logAndReport(`App Android Check connection error: ${error}`);
		}
	}

	systemMonitor() {
		console.log('YOLO systemMonitor');
		try {
			const fbMonitor = firebase
				.database()
				.ref('system_alert')
				.on('value', (snap) => {
					const val = snap.val() || {};
					if (val.is_pause) {
						Alert.alert(
							'Waring',
							`The system temporary not working!`,
							[
								{
									text: I18n.t('ok'),
									onPress: () => {
										return exception;
									}
								}
							]
						);
					}
				});
		} catch (e) {
			console('systemMonitor app.android logAndReport exception: ', e);
			logAndReport('systemMonitor', e, 'systemMonitor app.ios');
		}
	}

	_handleAppStateChange(nextAppState) {
		console.log('YOLO _handleAppStateChange');
		try {
			ManageConnection.setAppState(nextAppState);
			if (nextAppState === 'active') {
				ManageAppstate.reloadScreenAfterActive();
				this.update.checkSystemVersion().then((isNeedUpdate) => {
					if (isNeedUpdate) {
						this.showUpdateMe();
					} else {
						this.update.updateSoftware(false);
					}
				});
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
								dataStorage.closeDrawerSignOut &&
									dataStorage.closeDrawerSignOut();
								Navigation.showModal({
									screen: 'equix.AutoLogin',
									animated: true,
									animationType: 'fade',
									navigatorStyle: {
										...CommonStyle.navigatorSpecialNoHeader,
										screenBackgroundColor: 'transparent',
										modalPresentationStyle:
											'overCurrentContext'
									},
									passProps: {
										callback: () => {
											setTimeout(() => {
												func.setLoginConfig(true);
												Navigation.dismissModal({
													animationType: 'none'
												});
											}, 200);
											setTimeout(() => {
												this.alreadyShowReauthenPopUp = false;
											}, 4 * 60 * 1000);
										},
										byPassAuthenFn: this.autoLogin,
										isModal: true,
										token: login.loginObj.refreshToken
									}
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
			}
		} catch (error) {
			logDevice('error', `_handleAppStateChange EXCEPTION - ${error}`);
		}
	}

	showUpdateMe() {
		console.log('YOLO showUpdateMe');
		showUpdateMeScreen();
	}

	async showForm(isUpdating) {
		console.log('YOLO showForm');
		await this.settingThemeBeforeLogin();
		Navigation.startSingleScreenApp({
			screen: {
				screen: 'equix.BusyBox',
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
			passProps: {
				isUpgrade: false,
				isUpdating
			},
			animationType: 'none'
		});
		SplashScreen.hide();
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
				config.currentIosVersion !== iosBuild &&
				config.currentIosVersion !== iosNextBuild
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
			logDevice('info', `ANDROID checkUpdateApp error: ${error}`);
		}
	}

	startAppAfterLoadStore() {
		console.log('YOLO startAppAfterLoadStore');
		try {
			store.dispatch(loginActions.setLoginFailed());
			iconsLoaded.then(() => {
				const isNotLogin = true;
				dataStorage.startApp = this.startAppFunction;
				const objStore = store.getState() || {};
				const login = objStore.login;
				// func.setAccountId(login.accountId);
				const storeApp = objStore.app || {};
				this.startAppFunction();
				this.initNotification();
			});
		} catch (error) {
			logDevice('error', `START APP AFTER LOADSTORE EXCEPTION ${error}`);
			Alert.alert('Could not load resource. Please try again');
		}
	}

	getNotifyObj(message) {
		console.log('YOLO getNotifyObj');
		if (!message) return message;
		if (message.fcm && message.fcm.body) {
			return {
				body: message.fcm.body,
				show_in_foreground: true,
				title: message.fcm.title,
				// badge: message.fcm.badge,
				badge: 0,
				sound: message.fcm.sound,
				notify_type: message.NotificationType,
				obj_id: message.ObjectId,
				large_icon: 'ic_launcher', // Android only
				icon: 'ic_notification',
				priority: 'high'
			};
		}
		return message;
	}

	autoLogin(notif, isStartApp, callback) {
		console.log('YOLO autoLogin');
		try {
			const objStore = store.getState();
			const login = objStore.login;
			Controller.setLoginStatus(login.isLogin);
			dataStorage.emailLogin = login.email.toLowerCase().trim() || '';
			if (login.token || isStartApp) {
				store.dispatch(
					loginActions.login(
						login.email,
						null,
						'Start_App',
						dataStorage.loginDefault,
						callback
					)
				);
			}
		} catch (error) {
			console.log('ANDROID autoLogin error', error);
		}
	}

	initNotification() {
		console.log('YOLO initNotification');
		Business.requestNotiPermission();
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
		this.perf.incrementCounter(performanceEnum.login_default_account);
		const email = config.username;
		const password = config.password;

		let prop = store.getState();
		// if (prop.login.accountId) {
		// 	func.setAccountId(prop.login.accountId);
		// }
		if (!prop) {
			prop = {};
		}
		this.perf.incrementCounter(
			performanceEnum.login_default_account_success
		);
		this.callbackDefault();
	}

	showConnectingLogin() {
		console.log('YOLO showConnectingLogin');
		Navigation.startSingleScreenApp({
			screen: {
				screen: 'equix.Connecting',
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
			}
		});
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
		console.log(`authenPinForAutoLogin - token: ${token}`);
		if (byPass) {
			SplashScreen.hide();
			Navigation.showModal({
				screen: 'equix.AutoLogin',
				animated: true,
				animationType: 'fade',
				navigatorStyle: {
					navBarHidden: true,
					statusBarTextColorScheme: 'light',
					screenBackgroundColor: 'transparent',
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					callback,
					token,
					isModal: true,
					isByPass: true,
					usePin
				}
			});
		} else {
			getItemFromLocalStorage(
				key,
				null,
				token,
				() => {
					SplashScreen.hide();
					// Khong bao gio vao case nay -> vao case nay loi
					this.loginDefault();
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
					SplashScreen.hide();
					dataStorage.maintain.currentState !== true &&
						Navigation.startSingleScreenApp({
							screen: {
								screen: 'equix.AutoLogin',
								navigatorStyle: {
									drawUnderNavBar: true,
									navBarHidden: true,
									navBarHideOnScroll: false,
									navBarNoBorder: true,
									statusBarTextColorScheme: 'light'
								}
							},
							appStyle: {
								orientation: 'portrait'
							},
							passProps: {
								callback,
								token
							},
							animationType: 'none'
						});
				}
			);
		}
	}

	loginApp(type = 'default', objParams) {
		console.log('DCM OPTIMIZE autoLogin START', new Date());
		const email = (objParams.email + '').toLowerCase().trim();
		// Type = 'autologin' -> show form pin
		if (type === 'autologin') {
			// Auto login bằng pin và tự động xác thực lại khi không dùng app trong 5 phút hoặc 15 phút theo setting
			const refreshToken = objParams.loginObj.refreshToken;
			this.authenPinForAutoLogin(
				email,
				refreshToken,
				this.callBackAutoLogin
			);
		} else {
			// Type = 'default' -> vào thẳng app
			// Xác thực pin khi đặt lệnh, modify, cancel
			// Lay user info
			const userDetail = Controller.getUserInfo();
			this.processUserDetail(userDetail);
		}
	}

	checkEnterWrongPin(key, cb) {
		console.log('YOLO checkEnterWrongPin');
		// Nếu số lần nhập sai pin >= 3 thì tự động logout
		try {
			AsyncStorage.getItem(key)
				.then((result) => {
					if (result) {
						const data = JSON.parse(result) || {};
						// Nếu số lần nhập sai pin === 3 -> login default
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
							// Đi tiếp
							cb && cb();
						}
					} else {
						// Đi tiếp
						cb && cb();
						logDevice('info', `PIN LOCAL NULL`);
						console.log(`PIN LOCAL NULL, ERROR`);
					}
				})
				.catch((error) => {
					// Đi tiếp
					cb && cb();
					logDevice('info', `GET PIN LOCAL FAIL, ERROR: ${error}`);
					console.log(`GET PIN LOCAL FAIL, ERROR: ${error}`);
				});
		} catch (error) {
			// Đi tiếp
			cb && cb();
			logDevice('info', `GET PIN LOCAL EXCEPTION, ERROR: ${error}`);
			console.log(`GET PIN LOCAL EXCEPTION, ERROR: ${error}`);
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
		// Cập nhật lại setting language
		Controller.dispatch(settingActions.settingResponse(data, userID));
		Controller.setLang(data.lang);
		Controller.setFontSize(data.textFontSize);
		Controller.setSound(isSound);
		Controller.setVibrate(data.vibration);
		Controller.setLocation(location);
		func.setHomeScreen(tabSelected);
		func.setPinSetting(pinSetting);
		func.setPinSettingSession(pinSetting); // Setting trên db cho lần vào app, sẽ được dùng cho đến khi kill app đi, có realtime setting cũng không ảnh hưởng
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
						// Chưa có setting, tạo setting mặc định cho user
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
				// Lưu lại config và setting
				this.storeSetting(userSetting, userID);
				const { pinSetting = 0 } = userSetting;
				// Setting trên db cho lần vào app, sẽ được dùng cho đến khi kill app đi, có realtime setting cũng không ảnh hưởng
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
				// default là exception
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
				Controller.dispatch(loginActions.saveAccountInfo(userDetail)); // Lưu lại account info
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
				checkBiometricAvailable(),
				func.getAutoOktaLogin()
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
					resolve([{}, 'false']); // Default value của region là {}, của loginSuccess là 'false'
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
		// store.dispatch(loginActions.login(this.emailDefault, this.passDefault));
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
			logDevice(
				'info',
				`setDataLoginSuccess login action exception: ${error}`
			);
		}
	}

	callBackAutoLogin(token) {
		console.log('YOLO callBackAutoLogin');
		const objStore = store.getState();
		let login = null;
		let ckecked = false;
		if (objStore) {
			login = objStore.login || {};
			ckecked = login.checked || false;
			// func.setAccountId(login.accountId);
		}
		// Lay user info -> auto login
		const prop = store.getState();
		// if (prop.login.accountId) {
		// 	func.setAccountId(prop.login.accountId);
		// }
		this.perf && this.perf.incrementCounter(performanceEnum.auto_login);

		const url = api.getUrlUserDetailByUserLoginId(dataStorage.emailLogin);
		api.requestData(url, true)
			.then(async (data) => {
				if (data) {
					// da lay duoc user info ko get user info lai o phan login action nua (dataStorage.isGettedUserInfo = true)
					Controller.setUserInfo(data);
					this.settingThemeBeforeLogin();
					// this.registerMessage();
					dataStorage.isGettedUserInfo = true;
					await RoleUser.getRoleData();
					this.autoLogin(null, true);
				} else {
					dataStorage.isGettedUserInfo = false;
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

	setNotiData(data) {
		this.notiData = data;
	}

	resetNotiData() {
		this.notiData = null;
	}

	goToApp() {
		console.log('YOLO goToApp');
		// Set inApp status
		// const tabSelected = checkHomeScreenIsDisableAndReplace();
		const tabSelected = HOME_SCREEN[3];
		dataStorage.tabIndexSelected = tabSelected.tabIndex;
		const cb = (tabInfo = tabSelected) => {
			Controller.setInAppStatus(true);
			console.log('YOLO tabIndex: ', tabInfo.tabIndex);
			console.log('YOLO activeTab: ', tabInfo.activeTab);
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
		console.log('YOLO setLoginState: ', state);
		this.loginSuccess = state;
	}

	clearTimeoutLoging() {
		this.timeoutLoging && clearTimeout(this.timeoutLoging);
	}

	callbackAfterLogin() {
		console.log('YOLO callbackAfterLogin');
		try {
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
				`ANDROID - CALLBACK AFTER LOGIN -> GO TO HOME SCREEN EXCEPTION: ${error}`
			);
		}
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
		SplashScreen.hide();
		Navigation.showModal({
			screen: 'equix.SetPin',
			animated: true,
			animationType: 'slide-up',
			navigatorStyle: {
				statusBarColor: config.background.statusBar,
				statusBarTextColorScheme: 'light',
				navBarHidden: true,
				navBarHideOnScroll: false,
				navBarTextFontSize: 18,
				drawUnderNavBar: true,
				navBarNoBorder: true
			},
			passProps: {
				type: 'new',
				isShowCancel: false,
				token,
				objParam
			}
		});
		store.dispatch(loginActions.loginAppSuccess());
		this.perf && this.perf.stop();
	}

	async callbackDefault() {
		// Show login screen
		SplashScreen.hide();
		dataStorage.checkUpdateApp &&
			dataStorage.checkUpdateApp(false, async () => {
				dataStorage.isSignOut = true;
				dataStorage.closeModalSignOut &&
					dataStorage.closeModalSignOut();
				dataStorage.closeDrawerSignOut &&
					dataStorage.closeDrawerSignOut();
				if (dataStorage.loginAsGuest) {
					await this.settingThemeBeforeLogin();
					dataStorage.maintain.currentState !== true &&
						showNewOverViewScreen();
				} else {
					const timeOut = dataStorage.is_logout ? 200 : 1100;
					setTimeout(() => {
						dataStorage.maintain.currentState !== true &&
							this.goToApp();
						// showHomePageScreen();
					}, timeOut);
				}
				store.dispatch(loginActions.loginAppSuccess());
			});
		// get language && fontSize guest
		if (Controller.getLoginStatus()) {
			// get user watch list && user position
			// api.getUserWatchList();
			api.getUserPosition();
		}
		// const langGuest = await Controller.getLangGuest();
		// const fontSizeGuest = await Controller.getFontSizeOfGuest();
		// if (langGuest) {
		//     Controller.setLang(langGuest);
		//     Controller.dispatch(settingActions.setLang(langGuest));
		// } else {
		//     Controller.setLang(Util.choseLanguage());
		//     Controller.dispatch(settingActions.setLang(Util.choseLanguage()));
		// }
		Controller.setLang('en');
		Controller.dispatch(settingActions.setLang('en'));

		Controller.setFontSize(ENUM.FONT_SIZES[1].value);
		Controller.dispatch(
			settingActions.setFontSize(ENUM.FONT_SIZES[1].value)
		);
	}

	startApp() {
		console.log('YOLO startApp');
		initApp(this.callbackDefault);
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

	showDisclaimer() {
		console.log('YOLO showDisclaimer');
		dataStorage.checkUpdateApp &&
			dataStorage.checkUpdateApp(false, () => {
				// Timeout wait for busybox animation finish
				SplashScreen.hide();
				setTimeout(() => {
					dataStorage.maintain.currentState !== true &&
						Navigation.startSingleScreenApp({
							screen: {
								screen: 'equix.Disclaimer',
								title: I18n.t('disclaimer'),
								navigatorStyle: {
									navBarHideOnScroll: false,
									statusBarColor: config.background.statusBar,
									navBarBackgroundColor:
										config.background.statusBar,
									navBarTranslucent: false,
									drawUnderNavBar: false,
									navBarTextColor: config.color.navigation,
									navBarButtonColor: config.button.navigation,
									statusBarTextColorScheme: 'light',
									drawUnderTabBar: true,
									navBarTitleTextCentered: true,
									tabBarHidden: true,
									navBarHidden: true,
									navBarNoBorder: true,
									navBarSubtitleColor: 'white',
									navBarSubtitleFontFamily: 'HelveticaNeue'
								}
							},
							appStyle: {
								orientation: 'portrait'
							},
							passProps: {
								onCheck: this.onCheck,
								onAccept: this.onAccept.bind(this)
							},
							animationType: 'none'
						});
				}, 1100);
			});
	}
}

export default App;
