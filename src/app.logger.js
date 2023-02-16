import { dataStorage, func } from './storage';
import SplashScreen from 'react-native-splash-screen';
import { Dimensions } from 'react-native'
import {
	logDevice,
	getNotiNewsStatus,
	getNotiOrderStatus,
	getItemFromLocalStorage,
	preprocessNoti
} from './lib/base/functionUtil';
import * as api from './api';
import * as Util from '../src/util';
import { showPromptNewScreen, showAutoLogin } from './navigation/controller';
import { setTouchIdStatus } from './app.starter';
import * as Controller from './memory/controller';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import ENUM from '~/enum'
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
const { WIDTH_DRAWER } = ENUM
const { height: HEIGHT_DEVICE, width: WIDTH_DEVICE } = Dimensions.get('window');
const drawerWidthPercent = WIDTH_DRAWER * 100 / WIDTH_DEVICE
function refreshTokenAfterDelay() {
	// refresh token every 15mins
	// 15 mins refresh token
	const {
		guestRefreshTokenInterval: guestTokenIn,
		refreshTokenInterval: tokenIn
	} = dataStorage;
	if (guestTokenIn) {
		clearInterval(guestTokenIn);
	}
	if (tokenIn) {
		clearInterval(tokenIn);
	}
	const TIME_REFRESH_TOKEN = 15 * 60 * 1000;

	dataStorage.refreshTokenInterval = setInterval(() => {
		refreshToken()
			.then(() => { })
			.catch(() => { });
	}, TIME_REFRESH_TOKEN);
}

function handleErrorCode(errorCode) {
	if (errorCode === 'TOKEN_WAS_CHANGED') {
		logDevice(
			'info',
			`IOS - TOKEN WAS CHANGED -> SHOW POPUP TOKEN WAS CHANGED -> SIGN OUT`
		);
		showPromptNewScreen();
	} else {
		logDevice(
			'info',
			`IOS - GET REFRESH TOKEN ERROR: ${res.errorCode} -> LOGIN DEFAULT`
		);
		dataStorage.loginDefault && dataStorage.loginDefault();
	}
}

function authPinError() {
	// Khong bao gio vao case nay -> vao case nay loi
	dataStorage.loginDefault && dataStorage.loginDefault();
	SplashScreen.hide();
}

function authPinSuccess(result) {
	// TH: autologin -> co local storage -> goi component AutoLogin de xac thuc -> run app
	dataStorage.userPin = result;

	// Set touch id status on or off for auth setting screen
	const { enableTouchID } = result;
	setTouchIdStatus(enableTouchID, dispatch);

	// Set autologin flag
	const { currentState } = dataStorage.maintain;
	currentState !== true &&
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
				token,
				isAutoLogin: true // Chỉ riêng auto login sẽ có emit riêng cho trường hợp mất kết nối mạng
			},
			animationType: 'none'
		});
}

export function authenPinForAutoLogin(
	key,
	token,
	callback,
	byPass = false,
	usePin = false
) {
	// Auto login - goi componen <AutoLogin de xac thuc
	if (byPass) {
		showAutoLogin({
			callback,
			isModal: true,
			token,
			isByPass: true,
			usePin
		});
	} else {
		getItemFromLocalStorage(key, null, token, authPinError, authPinSuccess);
	}
}

function loginWithId(email, isAllwayLogin) {
	const url = api.getUrlUserDetailByUserLoginId(email).trim();
	// Lay user info
	api.requestData(url, true)
		.then(async data => {
			if (data) {
				// da lay duoc user info ko get user info lai o phan login action nua (dataStorage.isGettedUserInfo = true)
				Controller.setUserInfo(data);
				dataStorage.isGettedUserInfo = true;
				await RoleUser.getRoleData();
				autoLogin(null, true);
			} else {
				dataStorage.isGettedUserInfo = false;
				logDevice(
					'error',
					`CALLBACK AUTOLOGIN - CANNOT GET USER INFO - DATA IS NULL - URL: ${url} - DATA: ${data}`
				);
				dataStorage.loginDefault && dataStorage.loginDefault();
			}
		})
		.catch(err => {
			logDevice(
				'error',
				`GET USERINFO ERROR - URL: ${url} - err: ${err}`
			);
			isAllwayLogin &&
				dataStorage.loginDefault &&
				dataStorage.loginDefault();
		});
}

function loginApp(type = 'default', objParams) {
	logDevice(
		'info',
		`IOS - LOGIN APP TYPE: ${type} - PARAMS: ${JSON.stringify(objParams)}`
	);
	const email = (objParams.email + '').toLowerCase();

	// Type = 'autologin' -> show form pin
	if (type === 'autologin') {
		// Auto login bằng pin và tự động xác thực lại khi không dùng app trong 5 phút hoặc 15 phút theo setting
		const refreshToken = objParams.loginObj.refreshToken;
		const curEmail = dataStorage.emailLogin;
		authenPinForAutoLogin(email, refreshToken, () => loginWithId(curEmail));
		return;
	}

	// Type = 'default' -> vào thẳng app
	// Xác thực pin khi đặt lệnh, modify, cancel
	loginWithId(email, true);
}

export default async function (store) {
	refreshTokenAfterDelay();
	const { login } = store.getState() || {};
	const { accountInfo } = login || {};
	// Lấy user setting để check xem pin setting là gì
	const { user_id: userID = '' } = accountInfo || {};
	if (!userID) {
		logDevice(
			'info',
			`IOS - CANT GET USER ID ON LOCAL -> AUTO LOGIN BY PIN`
		);
		loginApp('autologin', login);
		return;
	}
	try {
		const { errorCode } = (await refreshToken()) || {};
		if (errorCode) {
			handleErrorCode(errorCode);
			return;
		}
		const urlGetUserSetting = api.getUrlUserSettingByUserId(userID, 'get');
		try {
			const data = await api.requestData(urlGetUserSetting, true);
			if (data) {
				const { pinSetting = 0 } = data || {};
				func.setPinSettingSession(pinSetting); // Setting trên db cho lần vào app, sẽ được dùng cho đến khi kill app đi, có realtime setting cũng không ảnh hưởng
				if (pinSetting === 0) {
					loginApp('default', login);
				} else {
					loginApp('autologin', login);
				}
			} else {
				// Chưa có setting, tạo setting mặc định cho user
				logDevice(
					'info',
					`IOS - GET USER SETTING IS NULL -> CREATE DEFAULT SETTING AND LAUNCH APP`
				);
				Util.setDefaultSetting(userID);
				loginApp('autologin', login);
			}
		} catch (error) {
			logDevice(
				'info',
				`IOS - CANT GET USER SETTING -> LOGIN AGAIN - ERROR: ${error}`
			);
			dataStorage.loginDefault && dataStorage.loginDefault();
		}
	} catch (error) {
		logDevice('info', `IOS - GET ACCESS TOKEN ERROR - ERROR: ${error}`);
		dataStorage.loginDefault && dataStorage.loginDefault();
	}
}

export async function loginDefaultAccount(store) {
	const url = api.getUrlUserInfoByEmail(config.username);
	// Lay user info
	try {
		const data = await api.requestData(url, true);
		if (!data || !data.length) {
			logDevice(
				'error',
				`CALLBACK AUTOLOGIN - CANNOT GET USER INFO - DATA IS NULL - URL: ${url} - DATA: ${data}`
			);
			return;
		}
		logDevice('info', `LOGIN DEFAULT ACCOUNT GET USER INFO SUCCESS`);
		Controller.setUserInfo(data[0]);
		registerMessage();
	} catch (error) {
		logDevice('error', `GET USERINFO ERROR - URL: ${url} - err: ${err}`);
	}
	let prop = store.getState();
	if (!prop) {
		prop = {};
	}
	callbackDefault();
}

function registerMessage() {
	try {
		const { accountId, unregisterMessage } = dataStorage;
		const userId = Controller.getUserId();

		console.log(
			`register messege for user: ${userId}, accountId:${accountId}`
		);
		unregisterMessage && unregisterMessage();

		registerNews(preprocessNoti, 'ALL');

		if (accountId) {
			registerByAccount(accountId, preprocessNoti, 'ALL');
		}
		if (userId) {
			registerByUser(userId, preprocessNoti, 'ALL');
			registerByUser(userId, dataStorage.showAlertChangePin, 'AUTH');
			registerByRoleGroup(preprocessNoti, 'ALL');
		}
	} catch (error) {
		logDevice('info', `registerMessage ERROR: ${error}`);
	}
}

export function loginDefault() {
	const objStore = store.getState() || {};
	const login = objStore.login || {};
	const checked = login.checked || false;
	if (checked || dataStorage.is_logout) {
		callbackDefault();
	} else {
		showDisclaimer();
	}
}

export function callBackAutoLogin(token) {
	const objStore = store.getState();
	let login = null;
	let ckecked = false;
	if (objStore) {
		login = objStore.login || {};
		ckecked = login.checked || false;
		// func.setAccountId(login.accountId);
	}
	const prop = store.getState();
	// if (prop.login.accountId) {
	// 	func.setAccountId(prop.login.accountId);
	// }
	const url = api.getUrlUserDetailByUserLoginId(dataStorage.emailLogin);
	// Lay user info
	api.requestData(url, true)
		.then(async data => {
			if (data) {
				// da lay duoc user info ko get user info lai o phan login action nua (dataStorage.isGettedUserInfo = true)
				Controller.setUserInfo(data);
				dataStorage.isGettedUserInfo = true;
				await RoleUser.getRoleData();
				autoLogin(null, true);
			} else {
				dataStorage.isGettedUserInfo = false;
				logDevice(
					'error',
					`CALLBACK AUTOLOGIN - CANNOT GET USER INFO - DATA IS NULL - URL: ${url} - DATA: ${data}`
				);
				dataStorage.loginDefault && dataStorage.loginDefault();
			}
		})
		.catch(err => {
			logDevice(
				'error',
				`GET USERINFO ERROR - URL: ${url} - err: ${err}`
			);
		});
}

let needClickToLogout = false;
export function showAlertChangePin() {
	// return true
	if (
		!needClickToLogout &&
		dataStorage.emailLogin &&
		dataStorage.emailLogin !== config.username &&
		dataStorage.currentScreenId !== ScreenId.CHANGE_PIN &&
		dataStorage.currentScreenId !== ScreenId.SET_PIN
	) {
		needClickToLogout = true;
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
					callback: cb => {
						needClickToLogout = false;
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

function callbackDefault() {
	Controller.setLang(Util.choseLanguage());
	Controller.dispatch(settingActions.setLang(Util.choseLanguage()));
	dataStorage.checkUpdateApp &&
		dataStorage.checkUpdateApp(false, () => {
			if (dataStorage.loginAsGuest) {
				dataStorage.maintain.currentState !== true &&
					Navigation.startSingleScreenApp({
						screen: {
							screen: 'equix.NewOverview',
							title: I18n.t('overview'),
							navigatorStyle,
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
						},
						appStyle: {
							orientation: 'portrait'
						},
						drawer: {
							left: {
								screen: 'equix.DrawerIOS',
								passProps: {},
								// disableOpenGesture: true,
								fixedWidth: 500
							},
							style: {
								drawerShadow: false,
								contentOverlayColor: 'rgba(0,0,0,0.25)',
								leftDrawerWidth: drawerWidthPercent
							},
							type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
							animationType: 'parallax' // optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
							// for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
							// disableOpenGesture: true // optional, can the drawer, both right and left, be opened with a swipe instead of button
						}
					});
			} else {
				// Timeout wait for busybox animation finish
				const timeOut = dataStorage.is_logout ? 200 : 1100;
				setTimeout(() => {
					dataStorage.maintain.currentState !== true &&
						Navigation.startSingleScreenApp({
							screen: {
								screen: 'equix.Home',
								navigatorStyle: {
									screenBackgroundColor: 'black',
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
							animationType: 'fade'
						});
				}, timeOut);
			}
		});

	SplashScreen.hide();
	store.dispatch(loginActions.loginAppSuccess());
}

function showDisclaimer() {
	dataStorage.checkUpdateApp &&
		dataStorage.checkUpdateApp(false, () => {
			// Timeout wait for busybox animation finish
			setTimeout(() => {
				dataStorage.maintain.currentState !== true &&
					Navigation.startSingleScreenApp({
						screen: {
							screen: 'equix.Disclaimer',
							title: I18n.t('disclaimer'),
							navigatorStyle: {
								navBarBackgroundColor:
									CommonStyle.statusBarBgColor,
								navBarTranslucent: false,
								drawUnderNavBar: false,
								navBarHideOnScroll: false,
								navBarTextColor: config.color.navigation,
								navBarTextFontFamily: 'HelveticaNeue-Medium',
								navBarTextFontSize: 18,
								navBarTransparent: true,
								navBarButtonColor: config.button.navigation,
								statusBarColor: config.background.statusBar,
								statusBarTextColorScheme: 'light',
								drawUnderTabBar: true,
								navBarNoBorder: true,
								navBarSubtitleColor: 'white',
								navBarSubtitleFontFamily: 'HelveticaNeue',
								tabBarHidden: true,
								navBarHidden: true
							}
						},
						passProps: {
							onCheck: dataStorage.disclaimerOncheck,
							onAccept: dataStorage.disclaimerAccept
						},
						animationType: 'none'
					});
			}, 1100);
		});

	SplashScreen.hide();
}

export function onAccept() {
	try {
		initApp(callbackDefault);
	} catch (err) {
		logDevice('info', `App ios - Start App function exception: ${error}`);
		store.dispatch(loginActions.disclaimerDisplay(false));
	}
}
