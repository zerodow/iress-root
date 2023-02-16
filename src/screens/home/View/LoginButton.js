import React, {
	useEffect,
	useRef,
	useMemo,
	useImperativeHandle,
	useCallback
} from 'react';
import {
	isAuthenticated,
	refreshTokens,
	signOut,
	clearTokens
} from '@okta/okta-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { forEach, includes, upperCase } from 'lodash';
import { checkBiometric, getToken } from '~/manage/manageAuth2';
import * as loginActions from '../../login/login.actions';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import I18n from '~/modules/language/';
import { dataStorage } from '~/storage';
import CommonStyle from '~/theme/theme_controller';
import {
	handleOnPressSignIn,
	loginError
} from '~/screens/home/Controllers/LoginController.js';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import * as Controller from '~/memory/controller';
import { resetLoginLoading } from '~/screens/login/login.actions.js';

import Enum from '~/enum';
import { getRegionSelected } from '../Model/LoginModel';
import { logDevice } from '~/lib/base/functionUtil';
import { getBiometricSetting } from '~/manage/manageAuth';

const { LOGIN_TYPE } = Enum;

const useListenError = (error) => {
	const dic = useRef({ init: true });
	return useEffect(() => {
		if (dic.current.init) {
			dic.current.init = false;
		} else {
			error && loginError(error);
		}
	}, [error]);
};
const useDisabledButton = ({
	isConnected,
	error,
	isLoading,
	password,
	email
}) => {
	return useMemo(() => {
		if (!isConnected) return true;
		if (!email || !password) return true;
		if (isLoading) return true;
		if (error !== '') return true;
		return false;
	}, [isConnected, error, isLoading, password, email]);
};
const useDisabledButtonByOkata = ({
	isConnected,
	error,
	isLoading,
	password,
	email
}) => {
	return useMemo(() => {
		if (!isConnected) return true;
		if (isLoading) return true;
		// if (error !== '') return true
		return false;
	}, [isConnected, error, isLoading, password, email]);
};
export const useRefButton = () => {
	const refButton = useRef();
	const signIn = useCallback(() => {
		refButton.current.login && refButton.current.login();
	}, []);
	return [refButton, signIn];
};
const LoginButton = React.forwardRef((props, ref) => {
	const email = useSelector((state) => state.login.email, shallowEqual);
	const password = useSelector((state) => state.login.password, shallowEqual);
	const isConnected = useSelector(
		(state) => state.app.isConnected,
		shallowEqual
	);

	const biometricEnabled = useSelector(
		(state) => state.setting.biometric,
		shallowEqual
	);

	const error = useSelector((state) => state.login.error, shallowEqual);
	const isLoading = useSelector(
		(state) => state.login.isLoading,
		shallowEqual
	);
	const disabled =
		props.loginType === LOGIN_TYPE.OKTA
			? useDisabledButtonByOkata({
					isConnected,
					error,
					isLoading,
					password,
					email
			  })
			: useDisabledButton({
					isConnected,
					error,
					isLoading,
					password,
					email
			  });
	useListenError(error);

	// Platform

	const handleError = (err) => {
		try {
			const { message = '' } = err || {};
			const splitArr = message.split(',');
			const code = splitArr[0].replace('code: ', '');
			const msg = splitArr[1].replace('msg: ', '');

			if (includes(upperCase(msg), 'CANCEL') || code === '10') return;

			loginError(msg);
		} catch (error) {
			const { message = '' } = err || {};
			loginError(message);
		}
	};

	const login = async () => {
		const loginWithBrowser = () => {
			if (isConnected && !disabled) {
				handleOnPressSignIn({ email, password, isLoading });
			} else {
				handleError({
					message: `isConnected : ${isConnected} , disabled : ${disabled}`
				});
			}
		};

		try {
			Controller.dispatch(loginActions.loginRequestGuest());

			const checkAutoLogin = async (refreshToken) => {
				const {
					link_okta: linkOkta = '',
					okta_app_client_id: clientId = ''
				} = getRegionSelected() || {};
				let url = linkOkta + '/v1/token?';
				const query = {
					client_id: clientId,
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
					scope: 'offline_access profile ue2 openid'
				};

				const arrQuery = [];

				forEach(query, (item, key) => {
					arrQuery.push(`${key}=${item}`);
				});
				url += arrQuery.join('&');
				logDevice('info', `LOGIN WITH OKTA ${url}`);
				const res = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-type': 'application/x-www-form-urlencoded'
					}
				});

				const obj = await res.json();
				global.refreshTokenOkta = obj.refresh_token;
				return obj.access_token;
			};

			const regionCode = await getBiometricSetting();

			const regionSelected = getRegionSelected() || {};

			if (regionCode !== regionSelected.region_code) {
				throw new Error('Region changed');
			}

			if (biometricEnabled) {
				let accessToken = '';
				let refreshToken = '';
				try {
					const isSupport = await checkBiometric();
					if (isSupport) {
						refreshToken = await getToken();
					} else {
						throw new Error('Biometric Not Available');
					}
				} catch (error) {
					logDevice('info', `Biometric error ${error.message}`);
					Controller.dispatch(loginActions.logoutError());
					handleError(error);
				}

				if (refreshToken) {
					accessToken = await checkAutoLogin(refreshToken);
				} else {
					throw new Error('auto login failure');
				}

				if (accessToken) {
					dataStorage.isOkta = true;
					dataStorage.isLoggedInOkta = true;
					Controller.dispatch(
						loginActions.loginOkta(
							'okta@novus-fintech',
							accessToken
						)
					);
				} else {
					throw new Error('isLogout');
				}
			} else {
				throw new Error('Biometric Disabled');
			}
		} catch (error) {
			logDevice('info', `Auto login error ${error.message}`);
			loginWithBrowser();
		}
	};

	useImperativeHandle(ref, () => {
		return {
			login
		};
	});
	useEffect(() => {
		Controller.dispatch(resetLoginLoading());
	}, []);

	return (
		<TouchableOpacityOpt
			disabled={disabled}
			onPress={login}
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				marginHorizontal: 24,
				marginTop: 32,
				height: 40,
				borderRadius: 8,
				backgroundColor: CommonStyle.color.modify,
				opacity: disabled ? 0.5 : 1,
				flexDirection: 'row'
			}}
		>
			{isLoading ? (
				<ActivityIndicator
					// testID={`progressBarSignIn`}
					style={{ width: 24, height: 24 }}
					color="black"
				/>
			) : (
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font15,
						color: CommonStyle.fontBlack
					}}
				>
					{I18n.t('login')}
				</Text>
			)}
		</TouchableOpacityOpt>
	);
});
function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected,
		login: state.login,
		setting: state.setting
	};
}
function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}
export default LoginButton;
