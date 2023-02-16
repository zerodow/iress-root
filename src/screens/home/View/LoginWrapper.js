import React, {
	useMemo,
	useState,
	useEffect,
	useLayoutEffect,
	useCallback,
	useImperativeHandle,
	useRef
} from 'react';
import { View, Text, Dimensions } from 'react-native';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';
import LoginHeader from '~s/home/View/RegionHeader';
import LoginType from '~s/home/View/LoginType';
import LoginUsernamePw from '~s/home/View/LoginUsernamePw';
import LoginButton, { useRefButton } from '~s/home/View/LoginButton';
import LoginForgotPW from '~s/home/View/LoginForgotPW';
import I18n from '~/modules/language/';
import { getLoginType, detroy } from '~/screens/home/Model/LoginModel.js';
import { dataStorage } from '~/storage';
import OrderError from '~/component/Error/OrderError.js';
import { getLoginChannelShowMessage } from '~/streaming/channel.js';
import { EventEmitter } from '@okta/okta-react-native';
import {
	handleSignInOkta,
	handleSignOutOkta,
	handleErrorOkta,
	handleCancelOkta
} from '~/screens/home/Controllers/LoginController.js';
import Enum from '~/enum';
import BoxShadow from './BoxShadow';
import Animated, { Easing } from 'react-native-reanimated';
import { useKeyboardSmart } from '~/component/keyboard_smart/HandleListenerKeyboard.js';
const { LOGIN_TYPE, REGION_ACCESS, ENV_TYPE } = Enum;
const { width: DEVICE_WIDTH } = Dimensions.get('window');

const { Value, timing } = Animated;

const useListenerLoginByOkata = () => {
	return useEffect(() => {
		const signInSuccess = EventEmitter.addListener(
			'signInSuccess',
			handleSignInOkta
		);
		const signOutSuccess = EventEmitter.addListener(
			'signOutSuccess',
			handleSignOutOkta
		);
		const onError = EventEmitter.addListener('onError', handleErrorOkta);
		const onCancelled = EventEmitter.addListener(
			'onCancelled',
			handleCancelOkta
		);
		return () => {
			try {
				signInSuccess.remove();
				signOutSuccess.remove();
				onError.remove();
				onCancelled.remove();
			} catch (error) {}
		};
	}, []);
};
const OkataLogin = ({ isAutoLogin }) => {
	useLayoutEffect(() => {
		dataStorage.isOkta = true;
	});
	return (
		<React.Fragment>
			<Text
				style={{
					color: CommonStyle.fontNearLight6,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeM,
					marginTop: 64,
					paddingHorizontal: 16,
					textAlign: 'center'
				}}
			>
				Click “Sign In” to redirect to OKTA Login portal
			</Text>
			<LoginButton
				isAutoLogin={isAutoLogin}
				loginType={LOGIN_TYPE.OKTA}
			/>
			<View style={{ height: 8 }} />
		</React.Fragment>
	);
};
const DefaultLogin = ({ updateLayout }) => {
	useLayoutEffect(() => {
		dataStorage.isOkta = false;
	});
	const [refButton, signIn] = useRefButton();
	return (
		<Animated.View>
			<LoginUsernamePw signIn={signIn} updateLayout={updateLayout} />
			<LoginButton ref={refButton} loginType={LOGIN_TYPE.DEFAULT} />
			<LoginForgotPW />
		</Animated.View>
	);
};
export const useRefLoginWrapper = () => {
	const refLoginWrapper = useRef();
	return { refLoginWrapper };
};
const useRefLogin = () => {
	const refViewLogin = useRef();
	const getMeasure = useCallback((cb) => {
		try {
			refViewLogin.current.measure(
				(x, y, width, height, pageX, pageY) => {
					cb(x, y, width, height, pageX, pageY);
				}
			);
		} catch (error) {}
	}, []);
	return [refViewLogin, getMeasure];
};

const LoginForm = ({ updateLayout, regionAccess, loginType }) => {
	const isOktaRegion = regionAccess && regionAccess[0] === REGION_ACCESS.OKTA;
	const isLoginDefault = loginType === LOGIN_TYPE.DEFAULT;

	const listRegionByEnv = dataStorage.listRegion.filter((item) => {
		const { region_type: regionType } = item;
		return regionType === ENV_TYPE.UAT;
	});

	const isAutoLogin = _.size(listRegionByEnv) === 1 && !dataStorage.is_logout;
	// if (isOktaRegion && isLoginDefault) {
	return <OkataLogin isAutoLogin={isAutoLogin} />;
	// }

	// return <DefaultLogin updateLayout={updateLayout} />;
};

const LoginWrapper = React.forwardRef(
	(
		{
			showRegion,
			translateY,
			loginWrapper,
			translateXAnim,
			listLoginType,
			setListLoginType,
			hideShowRegion = false
		},
		ref
	) => {
		const [refViewLogin, getMeasure] = useRefLogin();
		const [loginType, setLoginType] = useState(getLoginType());
		const [shadowOpt, setShadowOpt] = useState({
			color: '#000',
			border: 5,
			radius: 3,
			opacity: 0.5,
			x: 0,
			y: -5,
			style: { marginVertical: 5 }
		});
		const channel = useMemo(() => {
			return getLoginChannelShowMessage();
		}, []);
		useListenerLoginByOkata();
		// useEffect(() => {
		// 	return () => {
		// 		detroy();
		// 	};
		// }, []);
		const { region_access: regionAccess } = loginWrapper || [];
		useImperativeHandle(ref, () => ({
			setListLoginType
			// setLoginWrapper
		}));
		useEffect(() => {
			listLoginType.map((el) => {
				const { key, isDisabled } = el;
				if (key === REGION_ACCESS.OKTA && !isDisabled) {
					setLoginType(LOGIN_TYPE.OKTA);
				}
				if (key === REGION_ACCESS.EMAIL && !isDisabled) {
					setLoginType(LOGIN_TYPE.DEFAULT);
				}
			});
		}, [listLoginType]);
		const transY = useMemo(() => translateY, []);
		const [updateLayout, refKeyboardListener] = useKeyboardSmart();
		return (
			<View
				style={{
					width: DEVICE_WIDTH,
					marginTop: 40,
					paddingHorizontal: 16,
					backgroundColor: CommonStyle.backgroundColor2
				}}
			>
				<Animated.View
					style={{
						transform: [
							{
								translateY: transY
							}
						]
					}}
					onLayout={(e) => {
						const { height, width } = e.nativeEvent.layout;
						if (height && height > 1 && !shadowOpt.height)
							setShadowOpt({
								...shadowOpt,
								width,
								height
							});
					}}
				>
					{shadowOpt.height && <BoxShadow setting={shadowOpt} />}
					<View
						ref={refViewLogin}
						style={{
							backgroundColor: CommonStyle.backgroundColor2
						}}
					>
						<LoginHeader
							title={I18n.t('login')}
							onClose={showRegion}
							hideShowRegion={hideShowRegion}
						/>
						{/* <LoginType
							listLoginType={listLoginType}
							loginType={loginType}
							setLoginType={setLoginType}
							regionAccess={regionAccess}
						/> */}
						<OrderError channel={channel} />
						<LoginForm
							updateLayout={updateLayout}
							regionAccess={regionAccess}
							loginType={loginType}
						/>
					</View>
					{/* <HandleListenerKeyboard getMeasure={getMeasure} ref={refKeyboardListener} translateY={transY} /> */}
				</Animated.View>
			</View>
		);
	}
);

export default LoginWrapper;
