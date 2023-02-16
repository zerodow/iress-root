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
import * as Business from '~/business';
import { getUrlLogoutIress, postData } from '~/api';
import CryptoJS from 'crypto-js';
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
import * as Keychain from 'react-native-keychain';
const { BIOMETRIC_SETTING } = ENUM;
let numberFingerFailAndroid = 0;
let preAppState = null;
let fingerModel = {
	isSystemCancel: false,
	resolveFunc: null,
	needCheckBiometric: false
};

export const getStorageBio = async () => {
	const key = `${dataStorage.emailLogin}_biometric_setting`;
	const biometric = await AsyncStorage.getItem(key);

	const enabled = biometric && biometric === BIOMETRIC_SETTING.ON;
	syncBiometricSetting(enabled);
	return enabled;
};

export const storeToken = async () => {
	const token = global.refreshTokenOkta || '';
	// const key = Date.now().toString();
	try {
		await Keychain.setGenericPassword('1', token, {
			accessControl:
				Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE
		});
	} catch (error) {}
};

export const getToken = async () => {
	const { username, password: oldToken } = await Keychain.getGenericPassword({
		authenticationPrompt: {},
		accessControl:
			Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE
	});
	return oldToken;
};

// export const  = async () => {
// 	const biometricEnabled = await getStorageBio();

// 	if (biometricEnabled) {
// 		try {
// 			// return encryptText;
// 		} catch (error) {
// 			return;
// 		}
// 	}
// };

export const checkBiometric = async () => {
	const isSupport = await Keychain.getSupportedBiometryType();
	if (isSupport) {
		return isSupport;
	} else
		Controller.showAlertRequestBiometrics({
			allowCancel: true,
			onCancel: () => {
				Controller.setIsShowingAlertReload(false);
				Navigation.dismissModal({ animationType: 'none' });
				return null;
			},
			onTryAgain: async () => {
				Controller.setIsShowingAlertReload(false);
				Navigation.dismissModal({ animationType: 'none' });
				checkBiometric();
			}
		});
};
