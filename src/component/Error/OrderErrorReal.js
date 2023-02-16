import React, {
	useState,
	useEffect,
	useMemo,
	useRef,
	useCallback
} from 'react';
import { connect } from 'react-redux';
import { View, Text, Dimensions } from 'react-native';
import CustomIcon from '~/component/Icon';
import CommonStyle from '~/theme/theme_controller';
import Animated, { Easing } from 'react-native-reanimated';
import * as Emitter from '@lib/vietnam-emitter';
import {
	getChannelChangeRealOrderError,
	getChannelHideOrderError,
	getChannelChangeOrderError
} from '~/streaming/channel';
import ENUM from '~/enum';
import I18n from '~/modules/language';
const { width: widthDevices, height: heightDevices } = Dimensions.get('window');
const { TIMEOUT_HIDE_ERROR, TYPE_MESSAGE } = ENUM;
const { Value, timing } = Animated;
function getObjectStyle(type) {
	switch (type) {
		case TYPE_MESSAGE.ERROR:
			return {
				backgroundColor: CommonStyle.color.error,
				color: CommonStyle.fontColor,
				alignItems: 'flex-start'
			};
		case TYPE_MESSAGE.WARNING:
			return {
				backgroundColor: CommonStyle.color.modify,
				color: CommonStyle.backgroundColor1,
				alignItems: 'center'
			};
		case TYPE_MESSAGE.SUCCESS:
			return {
				backgroundColor: CommonStyle.color.modify,
				color: CommonStyle.backgroundColor1,
				alignItems: 'center'
			};
		case TYPE_MESSAGE.CONNECTING:
			return {
				backgroundColor: CommonStyle.color.error,
				color: CommonStyle.fontDark,
				alignItems: 'center'
			};
		default:
			return {};
	}
}

function useListenConnected({
	isConnected,
	hideError,
	updateError,
	error,
	isShowConnected
}) {
	if (isShowConnected) {
		return useEffect(() => {
			if (isConnected && error === `${I18n.t('connecting')}...`) {
				hideError && hideError();
			} else if (!isConnected) {
				updateError({
					msg: `${I18n.t('connecting')}...`,
					autoHide: false,
					type: TYPE_MESSAGE.CONNECTING
				});
			}
		}, [isConnected, error]);
	}
}
const OrderErrorReal = ({ isConnected, channel, isShowConnected = true }) => {
	const [state, setError] = useState({
		updated: Date.now(),
		error: '',
		type: ENUM.TYPE_MESSAGE.ERROR
	});
	const dic = useRef({
		autoHide: true,
		timeOutClearError: null,
		timeOutMeasure: null
	});
	const { error, type, updated } = state;
	const channelRealError = channel || getChannelChangeOrderError(); // Khi dung chung o nhieu noi thi moi component phai chi dinh 1 channel
	const channelHideError = getChannelHideOrderError();
	const heightError = useMemo(() => {
		return new Value(0);
	}, []);

	const HEIGHT_DEFAULT = state.error && state.error.length >= 60 ? 50 : 35;

	const unmount = () => {
		Emitter.deleteEvent(channelRealError);
		Emitter.deleteEvent(channelHideError);
		if (dic.current.timeOutClearError)
			clearTimeout(dic.current.timeOutClearError);
		if (dic.current.timeOutMeasure)
			clearTimeout(dic.current.timeOutMeasure);
	};

	const hideError = useCallback(() => {
		if (dic.current.timeOutClearError)
			clearTimeout(dic.current.timeOutClearError);
		dic.current.timeOutClearError = setTimeout(() => {
			timing(heightError, {
				toValue: 0,
				duration: 500,
				easing: Easing.inOut(Easing.ease)
			}).start(() => {
				// setError({
				// 	error: ''
				// });
			});
		}, TIMEOUT_HIDE_ERROR);
	}, []);

	const updateError = ({
		msg,
		autoHide = true,
		type = TYPE_MESSAGE.ERROR
	}) => {
		dic.current.autoHide = autoHide;
		if (msg === '') {
			timing(heightError, {
				toValue: 0,
				duration: 500,
				easing: Easing.inOut(Easing.ease)
			}).start(() => {
				setError({
					updated: Date.now(),
					error: msg,
					type
				});
			});
		} else {
			setError({
				updated: Date.now(),
				error: msg,
				type
			});
		}
	};

	const addListenerChangeError = () => {
		Emitter.addListener(channelRealError, null, updateError);
		Emitter.addListener(channelHideError, null, hideError);
	};
	useEffect(() => {
		addListenerChangeError();
		// return unmount
	}, []);
	useListenConnected({
		isConnected,
		hideError,
		updateError,
		error: state.error,
		isShowConnected
	});
	const { backgroundColor, color, alignItems } = useMemo(() => {
		return getObjectStyle(type);
	}, [type]);
	useEffect(() => {
		try {
			if (error !== '') {
				if (dic.current.timeOutClearError)
					clearTimeout(dic.current.timeOutClearError);
				if (dic.current.timeOutMeasure)
					clearTimeout(dic.current.timeOutMeasure);
				dic.current.timeOutMeasure = setTimeout(() => {
					timing(heightError, {
						toValue: HEIGHT_DEFAULT,
						duration: 500,
						easing: Easing.inOut(Easing.ease)
					}).start(() => {
						dic.current.autoHide && hideError();
					});
				}, 100);
			}
		} catch (error) {
			console.info('DCM error', error);
		}
	}, [error, updated]);
	return (
		<Animated.View
			style={[
				{
					paddingLeft: 16,
					backgroundColor: backgroundColor,
					overflow: 'hidden',
					width: '100%',
					height: heightError
				}
			]}
		>
			<Animated.View
				style={{
					minHeight: HEIGHT_DEFAULT,
					flexDirection: 'row',
					paddingVertical: 8,
					position: 'absolute',
					left: 0,
					right: 0,
					justifyContent: 'center',
					alignItems: 'center',
					paddingLeft: 16,
					transform: [
						{
							translateY: heightError
						},
						{ translateY: -HEIGHT_DEFAULT }
					]
				}}
			>
				{type === TYPE_MESSAGE.ERROR && (
					<CustomIcon
						color={CommonStyle.fontWhite}
						name="equix_alert"
						style={{
							fontSize: CommonStyle.fontSizeS,
							paddingRight: 16
						}}
					/>
				)}
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color,
						flexShrink: 1,
						textAlign: 'center'
					}}
				>
					{error}
				</Text>
			</Animated.View>
		</Animated.View>
	);
};
function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected
	};
}
export default connect(mapStateToProps)(OrderErrorReal);
