import firebase from '../../firebase';
import { dataStorage, func } from '../../storage';
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js';
import {
	logAndReport,
	logDevice,
	getItemFromLocalStorage,
	refreshToken,
	unRegisterReceiverNoti,
	businessLogSignOut,
	getRelatedSymbol,
	setLastTimeReNewToken
} from '../../lib/base/functionUtil';
import { setUserId } from '../../lib/base/analytics';
import config from '../../config';
import * as api from '../../api';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import * as settingActions from '../setting/setting.actions';
import * as cnoteActions from '../contract_note/contract_note.actions';
import * as businessLogActions from '../business_log/business_log.actions';
import * as Business from '../../business';
import authCode from '../../constants/authCode';
import ScreenId from '../../constants/screen_id';
// import { iconsMap, iconsLoaded } from './utils/AppIcons';
import I18n from '../../modules/language/index';
import ORDER_ENUM from '../../../src/constants/order_enum';
import * as Controller from '../../memory/controller';
import { getDispathchFunc } from '../../memory/model';
import * as Emitter from '@lib/vietnam-emitter';
// import AsyncStorage from '@react-native-community/async-storage';

import * as Util from '../../util';
import * as RoleUser from '../../roleUser';
import * as AllMarket from '../../streaming/all_market';
import { changeErrorSystemLoading } from '~/component/error_system/Redux/actions.js';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import * as HeaderNewsController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_header_controller.js';
import {
	getCheckChange,
	autoCheckChange,
	initCachePersonal,
	initCacheOrderTransactions
} from '../../cache';
import ENUM from '../../enum';
import { changeTheme } from '../../theme/theme_controller';
import TIME_ZONE from '../../constants/time_zone';
import HOME_SCREEN from '~/constants/home_screen.json';
import AsyncStorage from '~/manage/manageLocalStorage';
import watchListActions from '~s/watchlist/reducers';
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js';
import { getPortfolioTypeAndLastAccount } from '~s/portfolio/Controller/PortfolioAccountController';
import { destroy as destroyManageActiveScreen } from '~/manage/manageActiveScreen';
import * as PortfolioAccountModel from '~s/portfolio/Model/PortfolioAccountModel';
import * as OrdersModel from '~s/orders/Model/OrdersModel';
import { loginError as showLoginError } from '~s/home/Controllers/LoginController';
import {
	getRegionSelected,
	setCacheLoginSuccess
} from '~/screens/home/Model/LoginModel.js';
import {
	authentication,
	storeBiometricSetting,
	showAuthPassCode,
	storeLastUserOktaLoginId
} from '~/manage/manageAuth';
import {
	checkBiometric,
	getToken,
	getStorageBio,
	storeToken
} from '~/manage/manageAuth2';

const TIME_REFRESH_TOKEN = ENUM.TIME_REFRESH_TOKEN;

const colors = config.colors1;

let navigation;
var perf = null;
let glodalDispatch = null;

export function resetConnection() {
	Business.unsubFCM();
	AllMarket.unsubAll();
	businessLogSignOut();
	unRegisterReceiverNoti();
	dataStorage.unregisterMessage && dataStorage.unregisterMessage();
}

export function resetRedux(dispatch) {
	Controller.dispatch(settingActions.setLang(ENUM.LANG.EN));
	Controller.dispatch(cnoteActions.resetContractNoteAll());
	Controller.dispatch(businessLogActions.resetBusinessLogAll());
	dispatch(logoutSuccess());
	setTimeout(() => {
		dispatch(resetLoginLoading());
	}, 500);
}

export function resetData() {
	ManageHistorySearch.clearAllHistorySearch();
	dataStorage.loginAsGuest = false;
	dataStorage.userPin.numberFailEnterPin = 0; // reset lại số lần nhập sai pin
	dataStorage.isGettedUserInfo = false; // gan lai = false de sign in lay lai user info
	dataStorage.user_id = null;
	func.setAccountId(null);
	func.clearDicRelatedSymbol();
	Controller.setUserInfo(); // reset user_info
	Controller.setLang(ENUM.LANG.EN);
	dataStorage.currentAccount = null; // reset current account
	Controller.setCurrentAccount(null);
	dataStorage.dicShowLocalOrderNoti = {}; // reset dic show local order noti
	dataStorage.watchListScreenId = ScreenId.TOP20; // reset watchlist screen id de khong nhan noti tu thang personal
	func.resetTradeTypeLogin(); // reset personal - login
	func.resetTradeTypeNotLogin(); // reset personal - not login
	func.resetSelectedPriceBoard();
	dataStorage.isNewOverview = true;
	dataStorage.tabIndexSelected = 0; // reset tab active ve 0
	Controller.setAccessToken(null);
	Controller.setAccountId(null);
	Controller.setLoginStatus(false);
	func.setLoginConfig(false);
	Controller.setUserPriceSource(null);
	Controller.setBaseUrl();
	Controller.setBaseVersion();
	Controller.setRegion();
}

export function resetTimer() {
	dataStorage.intervalCache && clearInterval(dataStorage.intervalCache);
}

export function logout(navigation, hideModalCb = null) {
	return (dispatch) => {
		dispatch(logoutRequest());

		try {
			// Reset redux
			Business.resetVariableEquixWarning();
			Business.logoutIress();
			destroyManageActiveScreen();
			PortfolioAccountModel.destroy();
			OrdersModel.destroy();
			// Post business log sign out
			dataStorage.loginAsGuest = false;
			dataStorage.userPin.numberFailEnterPin = 0; // reset lại số lần nhập sai pin
			dataStorage.isGettedUserInfo = false; // gan lai = false de sign in lay lai user info
			Controller.setLang(ENUM.LANG.EN);
			// reset error system
			Controller.dispatch(changeErrorSystemLoading(false));
			// unSub notification
			Business.unSubTokenNotification();

			Controller.dispatch(settingActions.setLang(ENUM.LANG.EN));
			HeaderModel.resetValue();
			dispatch(logoutSuccess());
			if (hideModalCb) {
				hideModalCb(() => {
					dataStorage.startApp && dataStorage.startApp(true);
				});
			} else {
				dataStorage.startApp && dataStorage.startApp(true);
			}
			dataStorage.isNewOverview = true;
			Controller.setAccessToken(null);
			Controller.setLoginStatus(false);
			func.setLoginConfig(false);
			setTimeout(() => {
				dispatch(watchListActions.watchListReset());
				dispatch(resetStateNewOrder());
			}, 500);
		} catch (error) {
			console.log('remove token error', error);
			logDevice('info', `Login actions sign out exception: ${error}`);
		}
	};
}

// export function resetRedux() {
// 	return {
// 		type: ENUM.TYPE_RESET_REDUX
// 	}
// }

export function loginClearError() {
	return {
		type: 'LOGIN_CLEAR_ERROR'
	};
}

export function logoutRequest(params) {
	return {
		type: 'LOGOUT_REQUEST'
	};
}

export function logoutError() {
	return {
		type: 'LOGOUT_ERROR'
	};
}
export function logoutSuccess() {
	dataStorage.is_logout = true;
	return {
		type: 'LOGOUT_SUCCESS'
	};
}

export function setLoginFailed() {
	return {
		type: 'SET_LOGIN_FAILED'
	};
}

export function loadForm(nav) {
	return (dispatch) => {
		navigation = nav;
		dispatch(loadFormHandler());
	};
}

export function closeForm() {
	return (dispatch) => {
		dispatch(closeFormHandler());
	};
}

export function loadFormHandler() {
	return {
		type: 'LOAD_LOGIN'
	};
}

export function closeFormHandler() {
	return {
		type: 'CLOSE_LOGIN'
	};
}

// function getAccountInfo(accountId) {
//     let accountInfo = {
//         full_name: 'Unrigister',
//         accountId: ''
//     }
//     if (accountId) {
//         const url = api.getUrlAccountByAccountId(accountId);
//         return api.requestData(url, true).then(data => {
//             accountInfo = data;
//             glodalDispatch && glodalDispatch(saveAccountInfo(accountInfo));
//         }).catch(error => {
//             console.log('cannot get account id: ', error)
//         })
//     } else {
//         glodalDispatch && glodalDispatch(saveAccountInfo(accountInfo))
//     }
// }

export function saveAccountInfo(payload) {
	return {
		type: 'LOGIN_SAVE_ACCOUNT_INFO',
		payload
	};
}

function getUserSetting(userId) {
	return new Promise((resolve) => {
		const urlGet = api.getUrlUserSettingByUserId(userId, 'get');
		api.requestData(urlGet, true)
			.then(async (data) => {
				if (data && data !== 'null') {
					// Set history search
					ManageHistorySearch.setHistorySearch({
						userSetting: data,
						isCheckActiveAcc: true
					});
					const isSound = data.notiSound;
					// const homeScreen = data.homeScreen !== undefined && data.homeScreen !== null ? (data.homeScreen === 0 || data.homeScreen === 1) ? 0 : 2 : 0;
					const tabId =
						data.homeScreen && data.homeScreen !== -1
							? data.homeScreen
							: 0;
					const tabSelected = HOME_SCREEN.find((e) => {
						return e.id === tabId;
					});
					const pinSetting = data.pinSetting || 0;
					data.lang = data.lang || 'en';
					data.textFontSize = data.textFontSize || 17;
					const userPriceSource = data.userPriceSource || 0;
					let location = TIME_ZONE[43];
					// if (data.timeZone === undefined || data.timeZone === null || data.timeZone.location === undefined || data.timeZone.location === null || data.timeZone.location === '') {
					// 	location = getNameTimezoneLocation();
					// 	data.timeZone = location;
					// 	Util.setDefaultTimeZoneSetting(userId, data)
					// }

					const isNotify =
						data.is_notify !== null || data.is_notify !== undefined
							? data.is_notify
							: true;
					data.noti =
						data.noti !== null || data.noti !== undefined
							? data.noti
							: isNotify;
					// Cập nhật lại setting language
					Controller.dispatch(
						settingActions.settingResponse(data, userId)
					);
					Controller.setLang(data.lang);
					Controller.setFontSize(data.textFontSize);
					// Change theme
					dataStorage.currentTheme = await Controller.getThemeColor();
					changeTheme(dataStorage.currentTheme);
					Controller.setSound(isSound);
					Controller.setVibrate(data.vibration);
					Controller.setLocation(location);
					func.setHomeScreen(tabSelected);
					Controller.setUserPriceSource(userPriceSource);
					func.setPinSetting(pinSetting);
					func.setPinSettingSession(pinSetting); // Setting trên db cho lần vào app, sẽ được dùng cho đến khi kill app đi, có realtime setting cũng không ảnh hưởng
					// func.setMenuSelected(tabSelected.ac)
					resolve();
				} else {
					// Chưa có setting, tạo setting mặc định cho user
					Util.setDefaultSetting(userId);
					resolve();
				}
			})
			.catch((error) => {
				logDevice('info', `cannot get user setting error: ${error}`);
				// Chưa có setting, tạo setting mặc định cho user
				Util.setDefaultSetting(userId);
				resolve();
			});
	});
}

export async function setDataLoginSuccess(
	user,
	email,
	password,
	token,
	dispatch,
	successCallback,
	params,
	loginCallBack = null
) {
	try {
		dataStorage.watchListScreenId = ScreenId.TOP20; // reset watchlist screen id de khong nhan noti tu thang personal
		// Login success -> setpin isLoading = false
		setTimeout(() => {
			Controller.dispatch(authSettingActions.setPinSuccess());
		}, 1000);
		if (dataStorage.refreshTokenInterval) {
			clearInterval(dataStorage.refreshTokenInterval);
			dataStorage.refreshTokenInterval = setInterval(() => {
				logDevice('info', `REFRESH TOKEN AT ${new Date()}`);
				refreshToken()
					.then(() => {
						logDevice(
							'info',
							'auto refresh token after 15 minus success'
						);
					})
					.catch((error) => {
						logDevice(
							'info',
							'auto refresh token after 15 minus failed'
						);
					});
			}, TIME_REFRESH_TOKEN);
		}
		glodalDispatch = dispatch;
		const id = user.user_id || user.uid;
		dataStorage.callbackAfterReconnect = null;
		dataStorage.isNewOverview = false;
		dataStorage.user_id = id;
		setUserId(id);
		Controller.setLoginStatus(email !== config.username);
		func.setLoginUserType();
		logDevice('info', `===> login user type: ${dataStorage.loginUserType}`);
		dispatch(loginSuccess(email, password));

		const listPromise = [getUserSetting(id), Business.getListAccount(id)];
		Promise.all(listPromise).then(() => {
			if (dataStorage.accountId) {
				console.log('initCacheOrders - dataStorage.accountId');
				// initCacheOrders();
				initCacheOrderTransactions();
			}

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

function loginWithCustomToken(
	token,
	objParam,
	pin = config.pin,
	showPopUp = null
) {
	const dispatch = objParam.dispatch;
	const objStore = Controller.getGlobalState();
	const login = objStore.login || {};
	const checked = login.checked || false;
	return Business.getEncryptText(pin).then((res) => {
		const { encryptText, sessionID } = res;
		const bodyData = {
			data: {
				accessToken: token,
				pin: encryptText,
				session_id: pin === encryptText ? null : sessionID,
				env: `MOBILE_POST_PIN_${objParam.email}`
			}
		};
		logDevice(
			'info',
			`POST PIN - ACCOUNT: ${
				objParam.email
			} - DATA BODY - ${JSON.stringify(bodyData)}`
		);
		console.log('PIN -', token);
		const authUrl = api.getAuthUrl();
		return api
			.postData(`${authUrl}/pin`, bodyData)
			.then((data) => {
				if (
					data.errorCode &&
					data.errorCode === authCode.EXPIRED_TOKEN_SET_PIN
				) {
					showPopUp();
				} else {
					const accessToken =
						data && data.accessToken ? data.accessToken : null;
					Controller.setAccessToken(accessToken);
					objParam.dispatch && objParam.dispatch(saveToken(data));
					if (objParam.email === config.username) {
						if (dataStorage.guestRefreshTokenInterval) {
							clearInterval(
								dataStorage.guestRefreshTokenInterval
							);
						}
						if (dataStorage.refreshTokenInterval) {
							clearInterval(dataStorage.refreshTokenInterval);
						}
						dataStorage.guestRefreshTokenInterval = setInterval(
							() => {
								refreshToken()
									.then(() => {})
									.catch((error) => {
										logDevice(
											'info',
											`auto refresh token after 15 minus failed - ${error}`
										);
									});
							},
							TIME_REFRESH_TOKEN
						);
						dataStorage.loginDefaultAccount &&
							dataStorage.loginDefaultAccount(checked);
						// Set lai email login in persist store
						dispatch(changeEmail(objParam.email));
						return;
					}
					getUserInfo(objParam);
				}
			})
			.catch((error) => {
				dataStorage.loginDefaultAccount &&
					dataStorage.loginDefaultAccount(checked);
				console.log('cannot post data token', error);
				logDevice('error', `LOGIN WITH CUSTOM TOKEN ERROR - ${error}`);
			});
	});
}

function setPinBeforeSignin(token, objParam) {
	logDevice('info', `AUTH ACCESS TOKEN - ${token}`);
	const key = objParam.email.toLowerCase();
	getItemFromLocalStorage(
		key,
		objParam,
		token,
		() => {
			logDevice('info', `NO LOCAL STORAGE`);
			dataStorage.setNewPin && dataStorage.setNewPin(objParam, token);
		},
		(result) => {
			logDevice(
				'info',
				`HAVE LOCAL STORAGE AND LOGIN - ${
					result ? JSON.stringify(result) : 'LOCAL STORAGE IS NULL'
				}`
			);
			dataStorage.setNewPin &&
				dataStorage.setNewPin(objParam, token, result);
		}
	);
}

function getUserInfo(objParam) {
	const {
		email,
		password,
		token,
		dispatch,
		successCallback,
		params,
		loginCallBack,
		errorCallback
	} = objParam;
	if (!dataStorage.isGettedUserInfo) {
		// Chua lay duoc user info -> lay lai user info
		const url = api.getUrlUserDetailByUserLoginId((email + '').trim());
		return api.requestData(url, true).then(async (data) => {
			const userInfo = data;
			if (userInfo) {
				Controller.setUserInfo(userInfo);
				await RoleUser.getRoleData();
				dispatch(saveAccountInfo(userInfo)); // Lưu lại account info
				logDevice(
					'info',
					`setDataLoginSuccess called when userInfo change - userInfo.status: ${userInfo.status} - dataStorage.isLocked: ${userInfo.isLocked}`
				);
				const userStatus = userInfo.status;
				if (
					userStatus === ENUM.USER_STATUS.ACTIVE ||
					userStatus === ENUM.USER_STATUS.PENDING_EMAIL
				) {
					dataStorage.isLocked &&
						setDataLoginSuccess(
							userInfo,
							email,
							password,
							token,
							dispatch,
							successCallback,
							params,
							loginCallBack
						);
					logDevice('info', 'set isLocked to false');
					dataStorage.isLocked = false;
					// init && cache personal
					initCachePersonal();
					// api.getUserPosition()
					// get all position by userid (all account -> related new)
					getRelatedSymbol();

					getCheckChange().then(() => {
						autoCheckChange();
					});
				} else {
					dispatch(accountInative());
					dataStorage.isLocked = true;
					errorCallback && errorCallback('inactive');
				}
			}
		});
	} else {
		// da lay duoc user info -> setDataLoginSuccess
		const userInfo = Controller.getUserInfo();
		dispatch(saveAccountInfo(userInfo)); // Lưu lại account info
		const userStatus = userInfo.status;
		if (
			userStatus === ENUM.USER_STATUS.ACTIVE ||
			userStatus === ENUM.USER_STATUS.PENDING_EMAIL
		) {
			dataStorage.isLocked &&
				setDataLoginSuccess(
					userInfo,
					email,
					password,
					token,
					dispatch,
					successCallback,
					params,
					loginCallBack
				);
			logDevice('info', 'set isLocked to false');
			dataStorage.isLocked = false;
			// init && cache personal
			initCachePersonal();
			// get all position by userid (all account -> related new)
			// api.getUserPosition()

			getRelatedSymbol();

			getCheckChange().then(() => {
				autoCheckChange();
			});
		} else {
			dispatch(accountInative());
			dataStorage.isLocked = true;
			errorCallback && errorCallback('inactive');
		}
	}
}

export function saveToken(data) {
	setLastTimeReNewToken(); // Lưu time renew token xuong local storage
	// Mã hoá pin trước khi save to local
	const pin = data.pin;
	if (pin) {
		const encryptPin = Util.encrypt(pin, ENUM.SECRET_KEY_ENCRYPT);
		data.pin = encryptPin;
		data.encryptPinStatus = true;
	}
	return {
		type: 'LOGIN_SAVE_TOKEN',
		payload: data
	};
}

function getUserPriceBoard(cb) {
	const dispatch = getDispathchFunc();
	dispatch.priceBoard.getUserPriceBoard(cb);
}

function getStaticPriceBoard() {
	const dispatch = getDispathchFunc();
	dispatch.priceBoard.getStaticPriceBoard();
}

export function loginIress({ accessToken }) {
	dataStorage.user_id = 'iressuser';
	Controller.setLoginStatus(true);
	Controller.setAccessToken(accessToken);
	HeaderNewsController.getDataVendor();
	HeaderNewsController.getDataCategory();
	getPortfolioTypeAndLastAccount();
	getUserPriceBoard(() => {
		dataStorage.reloadAppAfterLogin &&
			dataStorage.reloadAppAfterLogin(true);
	});
	getStaticPriceBoard();
	return dataStorage.reloadAppAfterLogin && dataStorage.reloadAppAfterLogin();
}

const handleBiometric = (dispatch, accessToken) => {
	setTimeout(async () => {
		try {
			const isSupport = await checkBiometric();
			if (isSupport) {
				await storeToken(accessToken);
				const token = await getToken();
				if (token) {
					func.setAutoOktaLogin(true);
					storeBiometricSetting(true);
					dispatch(settingActions.setBiometric(true));
				}
			}
		} catch (error) {}
	}, 500);
};

const handleStorage = async (userId, token, dispatch) => {
	let cacheUserId = '';
	try {
		cacheUserId = await AsyncStorage.getItem('biometricInfo');
	} catch (error) {}

	if (cacheUserId !== userId) {
		handleBiometric(dispatch, token);
		try {
			await AsyncStorage.setItem('biometricInfo', userId);
		} catch (error) {}
	}
};

export function loginOkta(email, password, cbSuccess, cbFail) {
	return (dispatch) => {
		const authUrl = api.getAuthUrl();
		let timeout = null;
		const region = getRegionSelected().region_code;
		dispatch(loginRequestGuest());

		return api
			.postData(authUrl, {
				data: {
					username: (email + '').toLowerCase(),
					password,
					application_id: dataStorage.deviceId,
					provider: 'iress',
					storage_token: false,
					authentication_type: 'LoginSecurityToken',
					region
				}
			})
			.then((data) => {
				let { code, message, errorCode } = data;
				if (code || !data.accessToken) {
					if (code === 25008) {
						Controller.showPopUpLogOut({ code });
					}
					dataStorage.isLoggedInOkta = false; // Reset login okta
					showLoginError(message);
					return dispatch(loginError(message));
				}
				if (data.accessToken) {
					// save cache
					setCacheLoginSuccess(true);
					func.setAutoOktaLogin(true);
					// sub notify
					Business.subTokenNotification();
					dataStorage.isLoggedInOkta = true; // Set logged in okta
					// Fake account
					const userId = Controller.getUserId();
					AsyncStorage.getItem(`last_account_${userId}`)
						.then((data) => {
							const currentAccount = JSON.parse(data);
							dataStorage.currentAccount = currentAccount;
						})
						.catch((error) => {
							dataStorage.currentAccount = {
								key: 0,
								account_id: 123457,
								account_name: 'Account Default'
							};
						});
					dataStorage.emailLogin = data.userLoginId || '';
					setTimeout(() => {
						handleStorage(
							data.userLoginId,
							data.accessToken,
							dispatch
						);
					}, 1000);

					return loginIress({
						accessToken: data.accessToken,
						dispatch
					});
				}
			})
			.catch((errorMessage, statusCode) => {
				timeout && clearTimeout(timeout);
				dispatch(loginError(I18n.tEn('loginUnsuccessfull')));
				errorCallback && errorCallback();
				console.log('err: ', errorMessage);
				logDevice('err', `LOGIN PARITECH EXCEPTION ${errorMessage}`);
			});
	};
}

export function login(
	email,
	password,
	token,
	errorCallback,
	successCallback,
	params,
	isActive,
	loginCallBack = null
) {
	return (dispatch) => {
		try {
			dataStorage.emailLogin = email.toLowerCase().trim();
			dataStorage.loginWithCustomToken = loginWithCustomToken;
			const objParam = {
				email: email,
				password: password,
				dispatch: dispatch,
				token: token,
				errorCallback: errorCallback,
				successCallback: successCallback,
				params: params,
				isActive: isActive,
				loginCallBack: loginCallBack
			};
			if (Controller.getLoginStatus()) {
				if (successCallback) {
					if (dataStorage.platform === 'ios') {
						dataStorage.reloadAppAfterLogin();
					} else {
						if (navigation) {
							navigation.dismissModal();
						}
					}
					func.setLoginConfig(true);
					if (params) {
						successCallback(...params);
					} else {
						successCallback();
					}
				} else {
					if (dataStorage.changeScreen) {
						dataStorage.changeScreen();
					}
				}
			} else if (dataStorage.cancelLoginPress) {
				dataStorage.cancelLoginPress = false;
				dispatch(loginCancel());
			} else if (password) {
				const authUrl = api.getAuthUrl();
				let timeout = null;
				return api
					.postData(authUrl, {
						data: {
							username: (email + '').toLowerCase(),
							password,
							application_id: dataStorage.deviceId,
							provider: 'iress',
							storage_token: false,
							region: Controller.getRegion()
						}
					})
					.then((data) => {
						const { errorCode, code, message } = data;
						if (errorCode) {
							const errorMessage =
								Business.getArrayError(errorCode);
							return dispatch(loginError(errorMessage));
						}
						if (code || !data.accessToken) {
							return dispatch(loginError(message));
						}

						if (data.accessToken) {
							// sub notify
							Business.subTokenNotification();
							// cache login success
							setCacheLoginSuccess((isLogin = true));

							const userId = Controller.getUserId();
							AsyncStorage.getItem(`last_account_${userId}`)
								.then((data) => {
									const currentAccount = JSON.parse(data);
									dataStorage.currentAccount = currentAccount;
								})
								.catch((error) => {
									dataStorage.currentAccount = {
										key: 0,
										account_id: 123457,
										account_name: 'Account Default'
									};
								});
							// handleStorage(data.userLoginId);
							return loginIress({
								accessToken: data.accessToken
							});
						}
					})
					.catch((errorMessage, statusCode) => {
						timeout && clearTimeout(timeout);
						dispatch(loginError(I18n.tEn('loginUnsuccessfull')));
						Emitter.emit(channel, {
							msg: errorMessage,
							autoHide: true,
							type: TYPE_MESSAGE.ERROR
						});
						errorCallback && errorCallback();
						console.log('err: ', errorMessage);
						logDevice(
							'err',
							`LOGIN PARITECH EXCEPTION ${errorMessage}`
						);
					});
			} else {
				// Auto login
				dispatch(loginSuccess(email, password));
				getUserInfo(objParam);
				logDevice('info', `Login - setDataLoginSuccess: ${email}`);
			}
		} catch (error) {
			logDevice('error', `exception when login: ${error}`);
		}
	};
}

export function loginRequest(email, password) {
	return {
		type: 'LOGIN_REQUEST',
		login: {
			email,
			password
		}
	};
}

function getError(arrayError) {
	if (typeof arrayError === 'object') {
		arrayError.forEach((element) => {
			if (element !== null) {
				return element;
			}
		});
	}
}

export function resetPasswordParitech(
	resetPasswordParams,
	successCallback,
	errorCallback
) {
	return (dispatch) => {
		try {
			const objPasswords = {
				data: {
					user_login_id: dataStorage.emailLogin,
					email: resetPasswordParams.email,
					token: resetPasswordParams.token,
					password: resetPasswordParams.confirmPassword
				}
			};
			const resetPasswordUrl = api.getUrlCreatePassword();
			return api
				.httpPost(resetPasswordUrl, objPasswords)
				.then((data) => {
					if (data.status && data.status === 200) {
						successCallback && successCallback();
					} else {
						let errorCode;
						if (typeof data.errorCode === 'object') {
							data.errorCode.forEach((element) => {
								if (element !== null) {
									errorCode = element;
								}
							});
						} else {
							errorCode = data.errorCode;
						}
						errorCallback && errorCallback(errorCode);
					}
				})
				.catch((errorMessage) => {
					console.log(errorMessage);
					const errorText = ORDER_ENUM[errorCode] || 'unknown_error';

					errorCallback && errorCallback(errorText);
				});
		} catch (error) {
			logDevice('info', 'Reset Password Paritech error ', error);
			const errorText = ORDER_ENUM[errorCode] || 'unknown_error';

			errorCallback && errorCallback(errorText);
		}
	};
}

export function resetPasswordQuantEdge(
	resetPasswordParams,
	successCallback,
	errorCallback
) {
	return (dispatch) => {
		try {
			const objPasswords = {
				data: {
					user_login_id: dataStorage.emailLogin,
					token: resetPasswordParams.token,
					password: resetPasswordParams.confirmPassword
				}
			};
			const resetPasswordUrl = api.getUrlCreatePassword();
			return api
				.httpPost(resetPasswordUrl, objPasswords)
				.then((data) => {
					if (data.status && data.status === 200) {
						successCallback && successCallback();
					} else {
						let errorCode;
						if (typeof data.errorCode === 'object') {
							data.errorCode.forEach((element) => {
								if (element !== null) {
									errorCode = element;
								}
							});
						} else {
							errorCode = data.errorCode;
						}
						const errorText =
							ORDER_ENUM[errorCode] || 'unknown_error';

						errorCallback && errorCallback(errorCode);
					}
				})
				.catch((errorMessage) => {
					console.log(errorMessage);
					const errorText = ORDER_ENUM[errorCode] || 'unknown_error';

					errorCallback && errorCallback(errorText);
				});
		} catch (error) {
			logDevice('info', 'Reset Password Paritech error ', error);
			const errorText = ORDER_ENUM[errorCode] || 'unknown_error';

			errorCallback && errorCallback(errorText);
		}
	};
}

export function sendEmailForgotPassword(
	forgotPasswordParams,
	successCallback,
	errorCallback
) {
	return (dispatch) => {
		try {
			const objPasswords = {
				data: {
					user_login_id: forgotPasswordParams.email
				}
			};
			const resetPasswordUrl = api.getUrlSendEmailForgotPassword();
			return api
				.httpPost(resetPasswordUrl, objPasswords)
				.then((data) => {
					if (data.errorCode === 'SUCCESS') {
						successCallback && successCallback();
					} else {
						let errorCode;
						if (typeof data.errorCode === 'object') {
							data.errorCode.forEach((element) => {
								if (element !== null) {
									errorCode = element;
								}
							});
						} else {
							errorCode = data.errorCode;
						}
						const errorText =
							ORDER_ENUM[errorCode] || 'unknown_error';

						errorCallback && errorCallback(errorText);
						// const errorCode = data.errorCode
						// switch (errorCode) {
						//     case enumType.ERROR_CODE_PASSWORD[2011]:
						//         errorCallback && errorCallback(enumType.ERROR_CODE_PASSWORD[2011])
						//         break;
						//     case enumType.ERROR_CODE_PASSWORD[2010]:
						//         errorCallback && errorCallback(enumType.ERROR_CODE_PASSWORD[2010])
						//         break;
						//     default:
						//         errorCallback && errorCallback(enumType.ERROR_CODE_PASSWORD[2000])
						//         break;
						// }
					}
					// if (data.accessToken) {
					//     dataStorage.unregisterMessage && dataStorage.unregisterMessage();
					//     return setPinBeforeSignin(data ? data.accessToken : '', objParam);
					// }
				})
				.catch((errorMessage) => {
					errorCallback();
					console.log(errorMessage);
				});
		} catch (error) {
			logDevice('info', 'Reset Password Paritech error ', error);
		}
	};
}

export function loginRequestGuest() {
	return {
		type: 'LOGIN_REQUEST_GUEST',
		error: ''
	};
}

export function loginCancel() {
	return {
		type: 'LOGIN_CANCEL'
	};
}

export function loginError(err) {
	return {
		type: 'LOGIN_ERROR',
		error: err
	};
}

export function accountInative() {
	return {
		type: 'LOGIN_ERROR_WITH_ACCOUNT_INACTIVE'
	};
}

export function accountHaveBeenLocked() {
	return {
		type: 'ACCOUNT_HAVE_BEEN_LOCKED'
	};
}

export function accountHaveBeenUnLocked() {
	return {
		type: 'ACCOUNT_HAVE_BEEN_UNLOCKED'
	};
}

export function disclaimerDisplay(checked) {
	return {
		type: 'DISCLAIMER_DISPLAY',
		checked
	};
}

export function loginSuccess(email, password) {
	return {
		type: 'LOGIN_SUCCESS',
		error: '',
		email,
		password
	};
}

export function setLastEmail(email) {
	return {
		type: 'SET_LAST_EMAIL',
		email
	};
}

export function resetLogin() {
	return {
		type: 'LOGIN_RESET'
	};
}

export function resetLoginLoading() {
	return {
		type: 'LOGIN_CANCEL_LOADING'
	};
}

export function clearToken() {
	return {
		type: 'LOGIN_CLEAR_TOKEN'
	};
}

export function loginAppSuccess() {
	return {
		type: 'LOGIN_APP_SUCCESS'
	};
}

export function forgotPass(email, successCallback, errorCallback) {
	return (dispatch) => {
		try {
			dispatch(forgotRequest());
			return firebase
				.auth()
				.sendPasswordResetEmail(email)
				.then(() => {
					dispatch(forgotSuccess());
					if (successCallback) {
						successCallback();
					}
				})
				.catch((err) => {
					dispatch(forgotError(err));
					if (errorCallback) {
						errorCallback(err);
					}
				});
		} catch (error) {
			logAndReport(
				'forgotPass loginaction exception',
				error,
				'forgotPass loginAction'
			);
			logDevice('info', `forgotPass loginaction exception ${error}`);
		}
	};
}

export function forgotRequest(params) {
	return {
		type: 'FORGOT_REQUEST'
	};
}
export function forgotError() {
	return {
		type: 'FORGOT_ERROR'
	};
}
export function forgotSuccess() {
	return {
		type: 'FORGOT_SUCCESS'
	};
}

export function forgotState(err) {
	return (dispatch) => {
		dispatch(logoutChangingState());
	};
}

export function setTokenAuth(token) {
	return {
		type: 'LOGIN_SET_TOKEN',
		token
	};
}

export function setAccountId(accountId) {
	return {
		type: 'LOGIN_SET_ACCOUNTID',
		accountId
	};
}

export function logoutChangingState(params) {
	return {
		type: 'FORGET_PASSWORD'
	};
}

export function changeEmail(email) {
	return {
		type: 'LOGIN_CHANGE_EMAIL',
		email
	};
}
export function changePassWord(password) {
	return {
		type: 'LOGIN_CHANGE_PASSWORD',
		payload: password
	};
}

export function authRequest() {
	return {
		type: 'AUTH_REQUEST'
	};
}
export function authSuccess() {
	return {
		type: 'AUTH_SUCCESS'
	};
}
export function authError() {
	return {
		type: 'AUTH_ERROR'
	};
}
export function authCancel() {
	return {
		type: 'AUTH_CANCEL'
	};
}
export function changeBrokerName(brokerName) {
	return {
		type: 'CHANGE_BROKER_NAME',
		brokerName
	};
}
