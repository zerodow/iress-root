import * as Controller from '~/memory/controller';
import { Keyboard } from 'react-native';
import AsyncStorages from '@react-native-community/async-storage';
import {
	changeEmail,
	changePassWord,
	clearToken,
	loginRequest,
	setLastEmail,
	login,
	changeLoad,
	loginOkta,
	loginRequestGuest,
	resetLoginLoading
} from '~/screens/login/login.actions.js';
import { dataStorage } from '~/storage';
import * as Emitter from '@lib/vietnam-emitter';
import { getLoginChannelShowMessage } from '~/streaming/channel.js';
import { oktaSignInWithBrowser } from '~/manage/manageOktaAuth';
import CONFIG from '~/config';
import Enum from '~/enum';
import { getRegionSelected } from '../Model/LoginModel';
import { storeToken } from '~/manage/manageAuth2';
import { refreshTokens } from '@okta/okta-react-native';
const { TYPE_MESSAGE, ENVIRONMENT } = Enum;
export function handleChangeEmail(email) {
	Controller.dispatch(changeEmail(email));
}
export function handleChangePassWord(passWord) {
	Controller.dispatch(changePassWord(passWord));
}
export function handleOnPressSignIn({
	email: usernameOriginal,
	password: passwordOriginal
}) {
	if (dataStorage.isOkta) return handleLoginOkta();
	Keyboard.dismiss();
	const username = usernameOriginal.trim();
	const password = passwordOriginal;
	if (username !== '' && password !== '') {
		Controller.dispatch(clearToken());
		dataStorage.emailLogin = username.toLowerCase().trim();
		Controller.dispatch(loginRequest(username, password));
		Controller.dispatch(setLastEmail(username));
		dataStorage.isLocked = true;
		Controller.dispatch(
			login(
				username,
				password,
				null,
				loginError,
				successCallback, // user not verify
				null,
				null,
				loginSuccessCallback
			)
		);
	}
	return true;
}
export function handleLoginOkta() {
	Controller.dispatch(loginRequestGuest());
	const regionSelected = getRegionSelected();
	const { idp_id: idp, noSSO = true } = regionSelected;
	oktaSignInWithBrowser({ idp, noSSO, prompt: 'login' });
}
export function loginError(message) {
	Emitter.emit(getLoginChannelShowMessage(), {
		msg: message,
		autoHide: true,
		type: TYPE_MESSAGE.ERROR
	});
}
export function successCallback() {}
export function loginSuccessCallback() {}
export async function handleSignInOkta(e) {
	console.info('handleSignInOkta SIGN IN SUCCESS', e);
	Controller.dispatch(loginOkta('okta@novus-fintech', e.access_token));

	const obj = await refreshTokens();
	global.refreshTokenOkta = obj.refresh_token;
	storeToken();
}
export async function handleSignOutOkta(e) {
	dataStorage.isLoggedInOkta = false;
	console.info('handleSignOutOkta', e);
}
export async function handleErrorOkta(e) {
	console.info('handleErrorOkta', e);
	Controller.dispatch(resetLoginLoading());
	loginError(e.error_message);
}
export async function handleCancelOkta(e) {
	console.info('handleCancelOkta', e);
	Controller.dispatch(resetLoginLoading());
	loginError('User cancelled current session');
}
