import React, {
	useRef,
	useCallback,
	useState,
	useImperativeHandle,
	useEffect,
	useMemo
} from 'react';
import {
	View,
	Text,
	TextInput,
	Dimensions,
	UIManager,
	LayoutAnimation,
	Platform
} from 'react-native';
import I18n from '~/modules/language/';
import SvgIcon from '~s/watchlist/Component/Icon2';
import ExtraSvgIcon from '~/component/svg_icon/SvgIcon';
import CommonStyle from '~/theme/theme_controller';
import ListSymbol from './ListSymbol';
import { setWLCode, getWLCode } from '../Model/CreatePriceBoardModel';
import { createNewPriceBoard } from '../Controller/CreatePriceBoardController';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import { checkDupplicateWLCode } from '~s/watchlist/Categories/Controller/';
import { useSelector } from 'react-redux';
import { useShadow } from '~/component/shadow/SvgShadow';
import { isIphoneXorAbove } from '~/lib/base/functionUtil';
import { useLayout } from '~/component/custom_hook/';
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js';
if (UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ERROR = {
	REQUIRED: 'REQUIRED',
	DUPPLICATE: 'DUPPLICATE',
	NONE: 'NONE'
};
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const useShowHideKeyboard = () => {
	const ref = useRef();
	const showHide = useCallback(
		(isShow = false) => {
			ref.current && ref.current.showHide && ref.current.showHide(isShow);
		},
		[ref.current]
	);
	return [ref, showHide];
};
const Title = (props) => {
	return (
		<View style={{}}>
			<Text
				style={{
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font23,
					fontFamily: CommonStyle.fontPoppinsBold
				}}
			>
				{I18n.t('createNewWL')}
			</Text>
		</View>
	);
};

const RightIcon = React.forwardRef((props, ref) => {
	const [error, setError] = useState(ERROR.NONE);
	useImperativeHandle(ref, () => {
		return { updateError };
	});
	const { onDone, text } = props;
	const updateError = (error) => {
		setError(error);
	};
	const onPress = () => {
		onDone && onDone();
	};
	const isConnected = useSelector((state) => state.app.isConnected);
	const dicSymbolAdded = useSelector(
		(state) => state.categoriesWL.dicSymbolAdded
	);
	const disabled = useMemo(() => {
		const isError = !text ? true : error !== ERROR.NONE;
		if (!isConnected) return true;
		if (isError) return true;
		return false;
	}, [isConnected, error, dicSymbolAdded, text]);
	return (
		<TouchableOpacityOpt
			disabled={disabled}
			onPress={onPress}
			style={{
				opacity: disabled ? 0.5 : 1
			}}
		>
			<SvgIcon name={'done'} size={25} color={CommonStyle.fontColor} />
		</TouchableOpacityOpt>
	);
});

const LeftIcon = (props) => {
	const { navigator } = props;
	const onPress = () => {
		navigator && navigator.popToRoot();
	};
	return (
		<TouchableOpacityOpt
			hitSlop={{
				top: 8,
				left: 8,
				bottom: 8,
				right: 8
			}}
			onPress={onPress}
		>
			<ExtraSvgIcon
				size={22}
				color={CommonStyle.fontColor}
				name={'nounCancel'}
			/>
		</TouchableOpacityOpt>
	);
};

const Error = React.forwardRef((props, ref) => {
	const [error, setError] = useState('');
	useImperativeHandle(ref, () => {
		return { updateError };
	});
	const updateError = useCallback((err) => {
		LayoutAnimation.easeInEaseOut();
		setError(err);
	}, []);
	return error ? (
		<View
			style={{
				width: '100%',
				backgroundColor: CommonStyle.color.sell,
				paddingVertical: 8
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontBlack,
					textAlign: 'center'
				}}
			>
				{error}
			</Text>
		</View>
	) : (
		<View />
	);
});

const NetworkWarning = (props) => {
	const isConnectedRedux = useSelector((state) => state.app.isConnected);
	const [isConnected, setIsConnected] = useState(isConnectedRedux);
	useEffect(() => {
		if (isConnectedRedux !== isConnected) {
			LayoutAnimation.easeInEaseOut();
			setIsConnected(isConnectedRedux);
		}
	}, [isConnectedRedux, isConnected]);
	return isConnected ? (
		<View />
	) : (
		<View
			style={{
				width: '100%',
				backgroundColor: CommonStyle.color.sell,
				paddingVertical: 8
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontBlack,
					textAlign: 'center'
				}}
			>
				{I18n.t('connectingFirstCapitalize')}
			</Text>
		</View>
	);
};

const Header = React.forwardRef((props, ref) => {
	const { onLayoutHeader, navigator } = props;
	const [text, setText] = useState('');
	const [Shadow, onLayout] = useShadow();
	const refWLName = useRef({});
	const refIcon = useRef({});
	const dic = useRef({
		timeout: null
	});
	const showHide = useCallback((isShow) => {
		refWLName.current &&
			refWLName.current.showHide &&
			refWLName.current.showHide(isShow);
	}, []);
	useImperativeHandle(ref, () => {
		return {
			showHide
		};
	});
	const syncOnChangeText = (WLCode) => {
		dic.current.timeout && clearTimeout(dic.current.timeout);
		dic.current.timeout = setTimeout(() => {
			let err = ERROR.NONE;
			const isDupplicate = checkDupplicateWLCode(WLCode);
			const isBlank = WLCode === '';
			if (isDupplicate) {
				err = ERROR.DUPPLICATE;
			} else if (isBlank) {
				err = ERROR.REQUIRED;
			} else if (/^\s*$/.test(WLCode)) {
				err = ERROR.REQUIRED;
			}
			refIcon.current &&
				refIcon.current.updateError &&
				refIcon.current.updateError(err);
			refWLName.current &&
				refWLName.current.updateError &&
				refWLName.current.updateError(err);
			setText(WLCode);
		}, 500);
	};
	return (
		<View
			onLayout={onLayoutHeader}
			style={{
				backgroundColor: CommonStyle.color.dark,
				paddingTop: isIphoneXorAbove()
					? 46
					: Platform.OS === 'ios'
					? 32
					: 16
			}}
		>
			<View>
				<Shadow />
				<View
					onLayout={onLayout}
					style={{
						zIndex: 10,
						width: '100%',
						paddingHorizontal: 16,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingBottom: 16
					}}
				>
					<LeftIcon navigator={navigator} />
					<Title />
					<RightIcon ref={refIcon} text={text} {...props} />
				</View>
			</View>
			<View style={{ height: 5 }} />
			<WLName ref={refWLName} syncOnChangeText={syncOnChangeText} />
			<View style={{ height: 5 }} />
			<NetworkWarning />
		</View>
	);
});

const checkWLCode = (t) => {
	return /^[A-Za-z0-9 _]*$/.test(t);
};

const WLName = React.forwardRef((props, ref) => {
	const { syncOnChangeText } = props;
	const [value, setValue] = useState('');
	const oldValue = useRef('');

	const [Shadow, onLayout] = useShadow();
	const dic = useRef({});
	const setRefWLName = (ref) => {
		if (ref) dic.current.refWLName = ref;
	};
	const setRefWrapperWLName = (ref) => {
		if (ref) dic.current.refWrapperWLName = ref;
	};
	const onChangeText = (WLCode) => {
		oldValue.current = value;
		if (checkWLCode(WLCode)) {
			setValue(WLCode);
			setWLCode(WLCode);
			syncOnChangeText(WLCode);
		} else {
			setValue(oldValue.current);
		}
	};
	const showHide = useCallback((isShow) => {
		if (isShow) {
			return (
				dic.current.refWLName &&
				dic.current.refWLName.focus &&
				dic.current.refWLName.focus()
			);
		}
		return (
			dic.current.refWLName &&
			dic.current.refWLName.blur &&
			dic.current.refWLName.blur()
		);
	}, []);
	const updateError = useCallback((err) => {
		const borderColor =
			err === ERROR.NONE
				? CommonStyle.color.dusk
				: CommonStyle.color.sell;
		dic.current.refWrapperWLName &&
			dic.current.refWrapperWLName.setNativeProps({
				style: {
					borderWidth: 1,
					borderColor
				}
			});
	}, []);
	useImperativeHandle(ref, () => {
		return {
			updateError,
			showHide
		};
	});
	useEffect(() => {
		setTimeout(() => {
			dic.current.refWLName && dic.current.refWLName.focus();
		}, 500);
	}, []);
	return (
		<View>
			<Shadow />
			<View
				onLayout={onLayout}
				style={{
					zIndex: 10,
					width: '100%',
					paddingVertical: 8,
					backgroundColor: CommonStyle.color.dark,
					alignItems: 'center'
				}}
			>
				<View
					ref={setRefWrapperWLName}
					style={{
						height: 31,
						width: DEVICE_WIDTH - 2 * 42,
						borderWidth: 1,
						borderColor: CommonStyle.color.dusk,
						borderRadius: 16
					}}
				>
					<TextInput
						testID={`wlNameField`}
						ref={setRefWLName}
						placeholder={I18n.t('wlName')}
						placeholderTextColor="rgba(239,239,239,0.7)"
						underlineColorAndroid="rgba(0,0,0,0)"
						numberOfLines={1}
						value={value}
						onChangeText={onChangeText}
						// selectionColor={CommonStyle.fontWhite}
						style={[
							{
								paddingVertical: 0,
								height: 31,
								marginHorizontal: 8,
								fontSize: CommonStyle.font15,
								fontFamily: CommonStyle.fontPoppinsRegular,
								color: CommonStyle.fontWhite,
								textAlign: 'center'
							}
						]}
						onSubmitEditing={() => {}}
					/>
				</View>
			</View>
		</View>
	);
});

const Content = (props) => {
	const { navigator, showHide } = props;
	return (
		<View style={{ flex: 1, backgroundColor: CommonStyle.color.dark }}>
			<ListSymbol navigator={navigator} showHide={showHide} />
		</View>
	);
};

const CreatePriceBoard = (props) => {
	const updateLayoutHeader = useCallback((layoutHeader) => {
		dic.current.layoutHeader = layoutHeader;
	}, []);
	const updateListAnimConfig = useCallback(({ from, to }) => {
		dic.current.animConfig = { from, to };
	}, []);
	const getLayoutHeader = useCallback(() => {
		return dic.current.layoutHeader;
	}, []);
	const getListAnimConfig = useCallback(() => {
		return dic.current.animConfig;
	}, []);
	const [onLayoutHeader] = useLayout(updateLayoutHeader);
	const { navigator } = props;
	const dic = useRef({
		layoutHeader: {},
		animConfig: {}
	});
	const onDone = useCallback(() => {
		createNewPriceBoard();
		navigator && navigator.popToRoot();
	}, []);
	const [refHeader, showHide] = useShowHideKeyboard();
	return (
		<CreatePriceBoardContext.Provider
			value={{ getLayoutHeader, getListAnimConfig, updateListAnimConfig }}
		>
			<KeyboardAvoidView style={{ flex: 1 }}>
				<Header
					ref={refHeader}
					onLayoutHeader={onLayoutHeader}
					onDone={onDone}
					navigator={navigator}
				/>
				<Content navigator={navigator} showHide={showHide} />
			</KeyboardAvoidView>
		</CreatePriceBoardContext.Provider>
	);
};

export const CreatePriceBoardContext = React.createContext();
export default CreatePriceBoard;
