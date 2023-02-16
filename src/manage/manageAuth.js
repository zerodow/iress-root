import { Platform, AppState } from 'react-native';
import PasscodeAuth from 'react-native-passcode-auth';
import { supported, status } from 'react-native-passcode-status';
import { Navigation } from 'react-native-navigation';
import * as Controller from '~/memory/controller';
import CommonStyle, { register } from '~/theme/theme_controller';
import { dataStorage, func } from '~/storage';
import I18n from '~/modules/language/';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel';
// import FingerprintScanner from 'react-native-fingerprint-scanner';
import * as Business from '~/business';
import { getUrlLogoutIress, postData } from '~/api';
import {
	oktaSignOut,
	oktaSignOutWithBrowser,
	getAuthenticatedStatus,
	oktaGetAccessToken,
	oktaSignInWithBrowser
} from '~/manage/manageOktaAuth';
import AsyncStorage from '@react-native-community/async-storage';
import * as settingActions from '~s/setting/setting.actions';
import * as FunctionUtil from '~/lib/base/functionUtil';
// Enum
import ENUM from '~/enum';
const { BIOMETRIC_SETTING } = ENUM;
let numberFingerFailAndroid = 0;
let preAppState = null;
let fingerModel = {
	isSystemCancel: false,
	resolveFunc: null,
	needCheckBiometric: false
};
AppState.addEventListener('change', (nextAppState) => {
	if (
		Platform.OS === 'android' &&
		fingerModel.androidFingerShowing &&
		(preAppState === 'background' || preAppState === 'inactive') &&
		nextAppState === 'active'
	) {
		// FingerprintScanner.release();
		fingerModel.resolveFunc &&
			authBySensor({
				resolve: fingerModel.resolveFunc,
				needCheckBiometric: fingerModel.needCheckBiometric
			});
	}
	if (
		(preAppState === 'background' || preAppState === 'inactive') &&
		nextAppState === 'active' &&
		fingerModel.isSystemCancel
	) {
		fingerModel.isSystemCancel = false;
		fingerModel.resolveFunc &&
			authBySensor({
				resolve: fingerModel.resolveFunc,
				needCheckBiometric: fingerModel.needCheckBiometric
			});
	}
	preAppState = nextAppState;
});

export function checkLockSensor() {
	return dataStorage.isLockBiometric;
}

export function checkByPass() {
	return func.getLoginConfig();
}

export function checkUseSensor({ needCheckBiometric }) {
	if (needCheckBiometric) {
		return needCheckBiometric;
	} else return dataStorage.biometric || false;
}

export function byPassAuthentication({ resolve }) {
	const response = {
		errorCode: 'SUCCESS'
	};
	resolve(response);
}

export function authProcess({
	resolve,
	needCheckBiometric,
	isBiometric,
	inSetting
}) {
	const isUseSensor = checkUseSensor({ needCheckBiometric });
	return isUseSensor
		? authBySensor({ resolve, needCheckBiometric, isBiometric, inSetting })
		: authWithoutSensor({ resolve });
}

export function actionIosSensorSuccess({ resolve }) {
	fingerModel.isSystemCancel = false;
	dataStorage.isLockBiometric = false;
	resolve({
		errorCode: 'SUCCESS'
	});
}
export function showAuthPassCode({ resolve, biometric }) {
	PasscodeAuth.authenticate(I18n.t('loginQuestion'))
		.then((success) => {
			resolve({
				errorCode: 'SUCCESS'
			});
			storeBiometricSetting(!biometric);
			Controller.dispatch(settingActions.setBiometric(!biometric));
		})
		.catch((error) => {
			console.info('SHOW PASSCODE FAILE', error);
			// storeBiometricSetting(!biometric)
			// Controller.dispatch(settingActions.setBiometric(!biometric));
		});
}
export function authenticationFailed({ resolve }) {
	if (Platform.OS === 'ios') {
		const showPasscode = () => {
			PasscodeAuth.authenticate(I18n.t('loginQuestion'))
				.then((success) => {
					dataStorage.isAuthenticated = true;
					resolve({
						errorCode: 'SUCCESS'
					});
				})
				.catch((error) => {
					if (error.message === 'LAErrorSystemCancel') {
						return showPasscode();
					}
					dataStorage.isAuthenticated = false;
					oktaSignOutWithBrowser();
				});
		};
		showPasscode();
	} else {
		oktaSignOutWithBrowser();
	}
}
export function showPassCode({ resolve }) {
	// Ios dùng passcode - Android logout okta
	return oktaSignOutWithBrowser();
	// this.props.actions.resetNotiNews();
	PasscodeAuth.isSupported()
		.then(() => authenticationFailed({ resolve }))
		.catch((error) => {
			console.log('error', error);
		});
}
export async function actionIosSensorFailSetting({
	resolve,
	error,
	needCheckBiometric
}) {
	switch (error.biometric) {
		case 'UserCancel':
			await onUserCancel({ resolve, needCheckBiometric });
			break;
		case 'DeviceLocked':
			break;
		case 'DeviceLockedPermanent':
			dataStorage.isLockBiometric = true;
			resolve({ errorCode: 'BIOMETRIC_LOCKED' });
			break;
		case 'FingerprintScannerNotEnrolled':
			// syncBiometricSetting(false);
			resolve({ errorCode: 'NOT_ENROLLED' });
			break;
		case 'FingerprintScannerNotAvailable':
			resolve({ errorCode: 'NOT_AVAILABLE' });
			break;
		case 'AuthenticationFailed':
			resolve({ errorCode: 'AUTHEN_FAILED' });
			break;
		case 'UserFallback':
			resolve({ errorCode: 'USER_FALLBACK' });
			break;
		case 'SystemCancel':
			resolve({ errorCode: 'SYSTEM_CANCEL' });

			break;
		case 'v':
			console.log('v');
			fingerModel.isSystemCancel = true;
			await authBySensor({ resolve, needCheckBiometric });
			break;
		case 'FingerprintScannerUnknownError':
			resolve({ errorCode: 'UNKNOWN_ERROR' });
			break;
		default:
			console.log('default');
			// oktaSignOutWithBrowser();
			break;
	}
}

export async function actionIosSensorFail({
	resolve,
	error,
	needCheckBiometric
}) {
	switch (error.biometric) {
		case 'UserCancel':
			console.log('UserCancel');
			await onUserCancel({ resolve, needCheckBiometric });
			break;
		case 'DeviceLocked':
			console.log('DeviceLocked');
			break;
		case 'DeviceLockedPermanent':
			dataStorage.isLockBiometric = true;
			// syncBiometricSetting(false);
			// Show popup để người dùng vào trong device setting để mở khoá
			// Controller.showAlertRequestBiometrics({
			// 	onTryAgain: async () => {
			// 		const isSupport = await checkSensorSupport();
			// 		if (isSupport) {
			// 			Controller.setIsShowingAlertReload(false)
			// 			Navigation.dismissModal({ animationType: 'none' });
			// 			actionIosSensor({ resolve, needCheckBiometric });
			// 		}
			// 	}
			// });
			console.log('DeviceLockedPermanent');
			resolve({ errorCode: 'BIOMETRIC_LOCKED' });
			break;
		case 'FingerprintScannerNotEnrolled':
			// syncBiometricSetting(false);
			console.log('FingerprintScannerNotEnrolled');
			resolve({ errorCode: 'NOT_ENROLLED' });
			break;
		case 'FingerprintScannerNotAvailable':
			resolve({ errorCode: 'NOT_AVAILABLE' });
			console.log('FingerprintScannerNotAvailable');
			break;
		case 'AuthenticationFailed':
		case 'UserFallback':
			console.log('AuthenticationFailed');
			dataStorage.isAuthenticated = false;
			authenticationFailed({ resolve });
			break;
		case 'SystemCancel':
			console.log('SystemCancel');
			await authBySensor({ resolve, needCheckBiometric });
			break;
		case 'v':
			console.log('v');
			fingerModel.isSystemCancel = true;
			await authBySensor({ resolve, needCheckBiometric });
			break;
		case 'FingerprintScannerUnknownError':
			console.log('FingerprintScannerUnknownError');
			dataStorage.isAuthenticated = false;
			await authBySensor({ resolve, needCheckBiometric });
			break;
		default:
			console.log('default');
			// oktaSignOutWithBrowser();
			break;
	}
}

export function actionIosSensor({ resolve, needCheckBiometric, inSetting }) {
	resolve();
	// return FingerprintScanner.authenticate({
	// 	description: I18n.t('fingerPrintContent'),
	// 	fallbackEnabled: FunctionUtil.isIphoneXorAbove()
	// })
	// 	.then(() => {
	// 		actionIosSensorSuccess({ resolve });
	// 	})
	// 	.catch((error) => {
	// 		if (inSetting) {
	// 			actionIosSensorFailSetting({
	// 				resolve,
	// 				error,
	// 				needCheckBiometric
	// 			});
	// 		} else {
	// 			actionIosSensorFail({ resolve, error, needCheckBiometric });
	// 		}
	// 	});
}

export async function authByIosSensor({
	resolve,
	needCheckBiometric,
	inSetting
}) {
	const isSupport = await checkSensorSupport();
	if (isSupport) {
		return actionIosSensor({ resolve, needCheckBiometric, inSetting });
	} else {
		const extraProps = needCheckBiometric
			? {
					allowCancel: true,
					onCancel: () => {
						resolve({ errorCode: 'USER_CANCEL' });
						Controller.setIsShowingAlertReload(false);
						Navigation.dismissModal({ animationType: 'none' });
					}
			  }
			: {};
		Controller.showAlertRequestBiometrics({
			...extraProps,
			onTryAgain: async () => {
				const isSupport = await checkSensorSupport();
				if (isSupport) {
					Controller.setIsShowingAlertReload(false);
					Navigation.dismissModal({ animationType: 'none' });
					actionIosSensor({ resolve, needCheckBiometric });
				}
			}
		});
	}
}

export function showFingerPrint({ resolve, needCheckBiometric }) {
	Navigation.showModal({
		screen: 'equix.TouchAlert',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			onFingerPrint: (isShowFingerPrint) => {},
			onUserCancel: () => onUserCancel({ resolve, needCheckBiometric }),
			onUserFallBack: () => {},
			onPass: () => console.log('pass'),
			onFail: () => console.log('fail'),
			onClose: () => console.log('close')
		}
	});
}

export function hideFingerPrint() {
	Navigation.dismissModal({
		animation: false,
		animationType: 'none'
	});
}

export function actionAndroidSensorFailOver3Times({ resolve }) {
	// FunctionUtil.logDevice('info', `ANDROID FINGER PRINT FAILED 3 TIMES -> SHOW PIN`)
	numberFingerFailAndroid = 0;
	hideFingerPrint();
	// showPassCode()
	oktaSignOutWithBrowser();
}

export function setBiometricType(biometryType) {
	if (Platform.OS === 'ios') {
		dataStorage.biometryType = biometryType;
	} else {
		dataStorage.biometryType = 'Fingerprint';
	}
}

export function checkBiometricAvailable() {
	return new Promise((resolve) => {
		resolve();
		// try {
		// 	FingerprintScanner.isSensorAvailable()
		// 		.then((biometryType) => {
		// 			console.info('Biometric Available', biometryType);
		// 			resolve(true);
		// 		})
		// 		.catch((error) => {
		// 			console.info('Biometric Not Available', error, error.name);
		// 			if (
		// 				error &&
		// 				(error.name === 'FingerprintScannerNotAvailable' ||
		// 					error.name === 'FingerprintScannerNotEnrolled')
		// 			) {
		// 				resolve(false);
		// 			} else {
		// 				resolve(true);
		// 			}
		// 		});
		// } catch (error) {
		// 	console.info('Biometric EXCEPTION', error, error.name);
		// 	resolve(true);
		// }
	});
}

export function checkSensorSupport() {
	return new Promise((resolve) => {
		resolve();
		// try {
		// 	FingerprintScanner.isSensorAvailable()
		// 		.then((biometryType) => {
		// 			console.info('checkSensorSupport SUCCESS', biometryType);
		// 			setBiometricType(biometryType);
		// 			resolve(true);
		// 		})
		// 		.catch((error) => {
		// 			console.info('checkSensorSupport ERROR', error);
		// 			const { name, biometric: biometryType } = error;
		// 			setBiometricType(biometryType);
		// 			resolve(false);
		// 		});
		// } catch (error) {
		// 	console.log('checkSensorSupport exception', error);
		// 	resolve(false);
		// }
	});
}

export function actionAndroidSensorSuccess({ resolve }) {
	fingerModel.androidFingerShowing = false;
	dataStorage.isLockBiometric = false;
	hideFingerPrint();
	resolve({
		errorCode: 'SUCCESS'
	});
}

export function actionAndroidSensorFail({ resolve, error }) {
	console.info('actionAndroidSensorFail', error);
	dataStorage.userPin.enableTouchID = false;
	dataStorage.isAuthenticated = false;
	hideFingerPrint();
	numberFingerFailAndroid = 0;
	fingerModel.androidFingerShowing = false;
	// FingerprintScanner.release();
	resolve({
		errorCode: 'FAILED'
	});
	setTimeout(() => {
		oktaSignOutWithBrowser();
	}, 200);
}

export function handleAuthFingerFail({ resolve }) {
	console.info('ON ATTEMPT handleAuthFingerFail');
	numberFingerFailAndroid += 1;
	// if (numberFingerFailAndroid > 3) {
	// 	fingerModel.androidFingerShowing = false;
	// 	return actionAndroidSensorFail({ resolve, error: {} });
	// }
	const channel = Channel.getChannelAuthSensorAndroidFail();
	Emitter.emit(channel);
}

export function actionAndroidSensor({
	resolve,
	isShowFingerPrint = true,
	needCheckBiometric
}) {
	console.log('actionAndroidSensor');
	try {
		const isLockBiometric = checkLockSensor();
		if (isLockBiometric) {
			hideFingerPrint();
		}
		isShowFingerPrint && showFingerPrint({ resolve, needCheckBiometric });
		fingerModel.androidFingerShowing = true;
		resolve();
		// FingerprintScanner.authenticate({
		// 	description:
		// 		'Scan your fingerprint on the device scanner to continue',
		// 	onAttempt: () => handleAuthFingerFail({ resolve })
		// })
		// 	.then(() => actionAndroidSensorSuccess({ resolve }))
		// 	.catch((error) => actionAndroidSensorFail({ resolve, error }));
	} catch (error) {
		// FunctionUtil.logDevice('info', `ANDROID FINGER PRINT EXCEPTION - ERROR: ${error}`)
		hideFingerPrint();
	}
}

export async function authByAndroidSensor({
	resolve,
	needCheckBiometric,
	isBiometric
}) {
	const isSupport = await checkSensorSupport();
	console.info('checkSensorSupport', isSupport);
	if (isSupport) {
		return actionAndroidSensor({ resolve, needCheckBiometric });
	} else {
		// FingerprintScanner.release();
		const extraProps = needCheckBiometric
			? {
					allowCancel: true,
					onCancel: () => {
						resolve({ errorCode: 'USER_CANCEL' });
						Controller.setIsShowingAlertReload(false);
						Navigation.dismissModal({ animationType: 'none' });
					}
			  }
			: {};
		console.log('extraProps', extraProps);
		Controller.showAlertRequestBiometrics({
			...extraProps,
			onTryAgain: async () => {
				// FingerprintScanner.release();
				const isSupport = await checkSensorSupport();
				if (isSupport) {
					Controller.setIsShowingAlertReload(false);
					Navigation.dismissModal({ animationType: 'none' });
					actionAndroidSensor({ resolve, needCheckBiometric });
				}
			}
		});
	}
}
export function getStorageBiometricSettingAndSync(needCheckBiometric = false) {
	return new Promise(async (resolve) => {
		if (needCheckBiometric) {
			const biometric = BIOMETRIC_SETTING.ON;
			const biometricSetting = !(
				!biometric || biometric === BIOMETRIC_SETTING.OFF
			);
			syncBiometricSetting(biometricSetting);
			resolve([biometric, biometricSetting]);
		} else {
			const biometric = await getBiometricSetting();
			const biometricSetting = !(
				!biometric || biometric === BIOMETRIC_SETTING.OFF
			);
			syncBiometricSetting(biometricSetting);
			resolve([biometric, biometricSetting]);
		}
	});
}
export async function authBySensor({
	resolve,
	needCheckBiometric = false,
	isBiometric = true,
	inSetting
}) {
	/*
		Check biometric setting
		1. Nếu biometric setting on hoặc chưa setting thì authenticate biometric
		2. Nếu biometric setting off thì không cần authenticate biometric -> vào thẳng app
	*/
	fingerModel.needCheckBiometric = needCheckBiometric;
	const [biometric] = await getStorageBiometricSettingAndSync(
		needCheckBiometric
	);
	if (!biometric || biometric === BIOMETRIC_SETTING.OFF) return resolve();
	numberFingerFailAndroid = 1;
	fingerModel.resolveFunc = resolve;
	return Platform.OS === 'ios'
		? authByIosSensor({ resolve, needCheckBiometric, inSetting })
		: authByAndroidSensor({ resolve, needCheckBiometric, isBiometric });
}

// onUserFallBack sử dụng cho Android, user cancel vân tay
export async function onUserCancel({ resolve, needCheckBiometric }) {
	try {
		if (needCheckBiometric) {
			// Cancel ở màn hình setting biometric thì chỉ hide Fingerprint và không làm gì cả
			if (Platform.OS === 'android') {
				// Android thì cần xử lý thêm do tự custom giao diện finger print
				numberFingerFailAndroid = 0;
				// FingerprintScanner.release();
				fingerModel.androidFingerShowing = false;
				hideFingerPrint();
			}
			resolve({ errorCode: 'USER_CANCEL' });
		} else {
			console.info('onUserCancel AT AUTO LOGIN');
			// Cancel ở màn hình cần xác thực biometric thì thực hiện signout okta, điều hướng về màn hình đăng nhập
			if (Platform.OS === 'android') {
				numberFingerFailAndroid = 0;
				// FingerprintScanner.release();
				fingerModel.androidFingerShowing = false;
				hideFingerPrint();
				func.setAutoOktaLogin(false);
			}
			oktaSignOutWithBrowser();
			Business.logoutIress();
			// Đoạn này cần xử lý để điều hướng về màn hình Login
			// dataStorage.isOkta = false
			dataStorage.isLoggedInOkta = false;
			setTimeout(() => {
				dataStorage.loginDefault();
			}, 1000);
		}
	} catch (error) {
		console.info('onUserCancel EXCEPTION', error, error.message);
	}
}

function onClose({ res, resolve }) {
	Navigation.dismissModal({
		animation: false,
		animationType: 'none'
	});
}

export function authWithoutSensor({ resolve }) {
	// Xử lý auto login vào app không cần xác thực vân tay hay face id
	return resolve();
}

export function authentication({
	needCheckBiometric = false,
	isBiometric = true,
	inSetting
}) {
	return new Promise(async (resolve) => {
		authProcess({ resolve, needCheckBiometric, isBiometric, inSetting });
	});
}
export function storeLastUserOktaLoginId() {
	const key = 'last_user_okta_login_id';
	const value = dataStorage.emailLogin;
	AsyncStorage.setItem(key, value)
		.then((res) => {
			console.log('storeLastUserOktaLoginId SUCCESS');
		})
		.catch((err) => {
			console.log(
				'storeLastUserOktaLoginId EXCEPTION',
				error,
				error.message
			);
		});
}
export function getLastUserOktaLoginId() {
	return new Promise(async (resolve) => {
		const key = 'last_user_okta_login_id';
		dataStorage.emailLogin = await AsyncStorage.getItem(key);
		resolve();
	});
}
export function storeBiometricSetting(biometric) {
	dataStorage.biometric = biometric;
	const key = `biometric_setting`;
	let value = '';
	if (biometric) {
		value = Controller.getRegion() || '';
	}
	AsyncStorage.setItem(key, value)
		.then((res) => {
			console.log('storeBiometricSetting SUCCESS');
		})
		.catch((err) => {
			console.log(
				'storeBiometricSetting EXCEPTION',
				error,
				error.message
			);
		});
}
export const getBiometricSetting = async () => {
	const key = `biometric_setting`;
	const biometric = await AsyncStorage.getItem(key);
	dataStorage.biometric = !!biometric;

	return biometric;
};
export function syncBiometricSetting(biometric) {
	dataStorage.biometric = biometric;
	Controller.dispatch(settingActions.setBiometric(biometric)); // Change redux variable
}

export const logoutWithOldToken = async (newToken) => {
	try {
		const oldToken = await AsyncStorage.getItem('oldTokenForLogout');
		if (oldToken) {
			const url = getUrlLogoutIress();
			const abc = await postData(url, {}, null, false, false, oldToken);
			await AsyncStorage.setItem('oldTokenForLogout', newToken);
			return abc;
		} else {
			await AsyncStorage.setItem('oldTokenForLogout', newToken);
		}
		return null;
	} catch (error) {
		return null;
	}
};
