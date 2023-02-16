import React, {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useImperativeHandle,
	useRef
} from 'react';

import {
	View,
	Text,
	Dimensions,
	TextInput,
	ActivityIndicator
} from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import CommonStyle from '~/theme/theme_controller';
import LoginHeader from '~s/home/View/RegionHeader';
import I18n from '~/modules/language/';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import { detroy } from '~/screens/home/Model/LoginModel.js';
import { getLoginChannelShowMessage } from '~/streaming/channel.js';
import Enum from '~/enum';
import BoxShadow from './BoxShadow';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { changeBrokerName } from '~s/login/login.actions';
import { useKeyboardSmart } from '~/component/keyboard_smart/HandleListenerKeyboard.js';
import Animated from 'react-native-reanimated';
import { postBrokerName2 } from '~s/home/Controllers/RegionController';
import { getChannelChangeOrderError } from '~/streaming/channel';
import OrderError from '~/component/Error/OrderError.js';

const { TYPE_MESSAGE } = Enum;
const { width: DEVICE_WIDTH } = Dimensions.get('window');
export const useRefLoginWrapper = () => {
	const refLoginWrapper = useRef();
	return { refLoginWrapper };
};

const CloseIcon = ({ onClose }) => {
	return (
		<TouchableOpacityOpt
			hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
			onPress={onClose}
			style={{
				position: 'absolute',
				alignSelf: 'center',
				alignItems: 'flex-end',
				justifyContent: 'center',
				minWidth: 50,
				right: 0
			}}
		>
			<Ionicons
				name="md-close-circle-outline"
				color={CommonStyle.fontNearLight4}
				style={{ textAlign: 'center' }}
				size={12}
			/>
		</TouchableOpacityOpt>
	);
};

const useInput = (updateLayout) => {
	const ref = useRef();
	const onFocus = useCallback((refTextInput) => {
		refTextInput.current.measure((x, y, width, height, pageX, pageY) => {
			// console.info(`textInput.measure `, x, y, width, height, pageX, pageY);
			updateLayout({ pageYTextInput: pageY, heightTextInput: height });
		});
	}, []);
	return [onFocus, ref];
};
const ButtonBrokeName = ({ handleOK, isConnected, brokerName, isLoading }) => {
	const disabled = useMemo(() => {
		if (brokerName && !isLoading && isConnected) {
			return false;
		} else {
			return true;
		}
	}, [isConnected, brokerName, isLoading]);
	return (
		<TouchableOpacityOpt
			disabled={disabled}
			onPress={handleOK}
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				marginHorizontal: 24,
				marginTop: 50,
				height: 40,
				borderRadius: 8,
				backgroundColor: CommonStyle.color.modify,
				opacity: disabled ? 0.5 : 1,
				flexDirection: 'row',
				marginBottom: 100
			}}
		>
			{isLoading ? (
				<ActivityIndicator
					testID={`progressBarSignIn`}
					style={{ width: 24, height: 24 }}
					color="white"
				/>
			) : (
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font15,
						color: CommonStyle.fontBlack
					}}
				>
					{I18n.t('ok')}
				</Text>
			)}
		</TouchableOpacityOpt>
	);
};
const BrokerName = ({ updateLayout, brokerName, refTextInput }) => {
	const dic = useRef({
		timeoutBrokerName: null
	});

	const dispatch = useDispatch();
	const onChangeText = useCallback((text) => {
		dispatch(changeBrokerName(text));
	}, []);
	const clearText = useCallback(() => {
		try {
			refTextInput.current.clear && refTextInput.current.clear();
			onChangeText && onChangeText('');
		} catch (error) {}
	}, []);
	const [onFocus] = useInput(updateLayout);

	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				alignSelf: 'center',
				marginTop: 50,
				width: '55%'
			}}
		>
			<TextInput
				ref={refTextInput}
				onFocus={() => {
					onFocus(refTextInput);
				}}
				placeholder={I18n.t('enterBrokerName')}
				placeholderTextColor="rgba(239,239,239,0.7)"
				underlineColorAndroid="rgba(0,0,0,0)"
				numberOfLines={1}
				onChangeText={onChangeText}
				// selectionColor={CommonStyle.fontWhite}
				maxLength={80}
				defaultValue={brokerName || ''}
				style={{
					flex: 1,
					paddingLeft: 4,
					paddingRight: 16,
					height: 26,
					paddingVertical: 0,
					borderBottomColor: CommonStyle.color.dusk,
					borderBottomWidth: 1,
					color: CommonStyle.fontWhite,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeM
				}}
				secureTextEntry={false}
			/>
			<CloseIcon
				style={{
					height: 26,
					width: 30
				}}
				onClose={clearText}
			/>
		</View>
	);
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

const BrokerWrapper = React.forwardRef(
	({ showLogin, translateY, translateXAnim, showRegion }, ref) => {
		const [refViewLogin, getMeasure] = useRefLogin();
		const refTextInput = useRef();
		const [isLoading, setIsLoading] = useState(false);
		const [updateLayout, refKeyboardListener] = useKeyboardSmart();
		const dispatch = useDispatch();
		const { isConnected, brokerName } = useSelector((state) => {
			return {
				isConnected: state.app.isConnected,
				brokerName: state.login.brokerName
			};
		}, shallowEqual);

		const [shadowOpt, setShadowOpt] = useState({
			width: 100,
			height: 100,
			color: '#000',
			border: 5,
			radius: 3,
			opacity: 0.5,
			x: 0,
			y: -5,
			style: { marginVertical: 5 }
		});

		const cbSuccess = ({ data }) => {
			setIsLoading(false);
			setTimeout(() => {
				showLogin(data[0]);
			}, 10);
		};
		const cbError = ({ error }) => {
			setIsLoading(false);
			const channel = getChannelChangeOrderError();
			Emitter.emit(channel, {
				msg: error.message,
				autoHide: true,
				type: TYPE_MESSAGE.ERROR
			});
		};
		const handleOK = useCallback(() => {
			setIsLoading(true);
			postBrokerName2(brokerName, cbSuccess, cbError);
		});

		// useEffect(() => {
		// 	if (brokerName) {
		// 		handleOK();
		// 	}
		// }, []);

		const handleShowRegion = useCallback((e) => {
			refTextInput.current.clear && refTextInput.current.clear();
			showRegion && showRegion(e);
			dispatch(changeBrokerName(''));
		});
		const channel = useMemo(() => {
			return getLoginChannelShowMessage();
		}, []);
		// useEffect(() => {
		// 	return () => {
		// 		detroy();
		// 	};
		// }, []);
		useImperativeHandle(ref, () => ({
			// setLoginWrapper
		}));
		const transY = useMemo(() => translateY, []);
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
						height &&
							setShadowOpt({
								...shadowOpt,
								width,
								height
							});
					}}
				>
					<BoxShadow setting={shadowOpt} />
					<View
						ref={refViewLogin}
						style={{
							backgroundColor: CommonStyle.backgroundColor
						}}
					>
						<LoginHeader
							title={I18n.t('enterBrokerName')}
							onClose={handleShowRegion}
						/>
						<OrderError />
						<BrokerName
							updateLayout={updateLayout}
							brokerName={brokerName}
							refTextInput={refTextInput}
						/>
						<ButtonBrokeName
							handleOK={handleOK}
							isConnected={isConnected}
							brokerName={brokerName}
							isLoading={isLoading}
						/>
					</View>
					{/* <HandleListenerKeyboard getMeasure={getMeasure} ref={refKeyboardListener} translateY={transY} /> */}
				</Animated.View>
			</View>
		);
	}
);

export default BrokerWrapper;
