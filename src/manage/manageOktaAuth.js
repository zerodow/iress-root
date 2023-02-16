import { Platform } from 'react-native';
import {
	signIn,
	signInWithBrowser,
	signOut,
	createConfig,
	getUserFromIdToken,
	getUser,
	refreshTokens,
	revokeAccessToken,
	revokeIdToken,
	clearTokens,
	revokeRefreshToken,
	isAuthenticated,
	getAccessToken,
	getIdToken
} from '@okta/okta-react-native';
import _ from 'lodash';
import { dataStorage, func } from '~/storage';
import * as Controller from '~/memory/controller';
import * as loginActions from '~/screens/login/login.actions';
import * as Api from '../api';
import { getRegionSelected } from '~/screens/home/Model/LoginModel.js';

export const oktaCreateConfig = async (region) => {
	if (_.isEmpty(region) || dataStorage.is_logout) return false;
	const {
		idp_id: idp,
		noSSO = true,
		okta_app_client_id: clientId,
		login_redirect_uri: redirectUri,
		link_okta: discoveryUri,
		end_session_redirect_uri: endSessionRedirectUri
	} = region || {};

	const configOkta = {
		idp,
		noSSO,
		clientId,
		redirectUri,
		endSessionRedirectUri,
		discoveryUri, // Domain
		scopes: ['openid', 'profile', 'offline_access', 'ue2'],
		requireHardwareBackedKeyStore: false
	};
	const configStatus = await createConfig(configOkta);
	return configStatus;
};

export function oktaSignIn(options) {
	signIn(options);
}

export function oktaSignInWithBrowser(options) {
	signInWithBrowser(options);
}

export async function oktaSignOutWithBrowser() {
	// try {
	// 	const { resolve_type: resolveType } = await signOut();
	// 	if (resolveType === 'signed_out') {
	// 		const done = await clearTokens();
	// 	}
	// } catch (error) {
	// 	console.info('logout err', error.message);
	// }
	dataStorage.isLoggedInOkta = false;
	Controller.dispatch(loginActions.logout());
}

export async function oktaSignOut() {
	// const isRevokeAccessToken = await revokeAccessToken(); // optional
	// const isRevokeIdToken = await revokeIdToken(); // optional
	// const isClearTokens = await clearTokens();
	// const isRevokeRefreshToken = await revokeRefreshToken();
	// console.info(
	// 	'oktaSignOut',
	// 	isRevokeAccessToken,
	// 	isRevokeIdToken,
	// 	isClearTokens,
	// 	isRevokeRefreshToken
	// );
}

export async function getAuthenticatedStatus() {
	const result = await isAuthenticated();
	console.info('OKTA checkAuthentication', result);
	return result.authenticated;
}

export async function getUserIdToken() {
	const idToken = await getUserFromIdToken();
	console.info('getUserIdToken', idToken);
	return idToken;
}

export async function getRefreshToken() {
	const refreshToken = await refreshTokens();
	console.info(
		'getRefreshToken',
		refreshToken.refresh_token,
		refreshToken.access_token
	);
	return refreshToken;
}

export async function getMyUser() {
	const user = await getUser();
	console.info('getMyUser', user);
	return user;
}

export async function oktaGetAccessToken() {
	const accessToken = await getAccessToken();
	console.info('oktaGetAccessToken', accessToken);
	return accessToken;
}
