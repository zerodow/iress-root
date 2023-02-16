import React, {
	useEffect,
	useState,
	useCallback,
	useRef,
	useMemo,
	useImperativeHandle
} from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import TextInput from '~/component/textinput_avoid_keyboard/TextInput';
import IconCustom from '~/component/svg_icon/SvgIcon.js';
import * as Util from '~/util';
import CommonStyle, { register } from '~/theme/theme_controller';
import {
	Channel as ChannelKeyBoard,
	getChannelChangeText,
	getChannelDeleteText,
	getChannelChangeTextFromSlider
} from '~/component/virtual_keyboard/Keyboard.js';
import ENUM from '~/enum';
import { dataStorage } from '~/storage';
import { getSmartValueByLotSize } from '~/screens/new_order/Controller/InputController.js';
const { ORDER_INPUT_TYPE } = ENUM;
const isIos = Platform.OS === 'ios';
const IncreaseButton = ({
	onPress,
	text,
	limitNumberLength = 16,
	disabled
}) => {
	const currentRef = useRef({});
	const [isDisabled, setDisabled] = useState(true);
	const limitNumber = new Array(limitNumberLength)
		.fill(9)
		.reduce((pre, next) => {
			return pre.toString() + next.toString();
		}, '');
	useEffect(() => {
		if (text >= limitNumber || disabled) {
			setDisabled(true);
		} else {
			setDisabled(false);
		}
	}, [text, disabled]);
	return (
		<IconCustom
			// onPressIn={() => {
			//     currentRef.current = setInterval(() => {
			//         onPress && onPress()
			//     }, 150);
			// }}
			// onPressOut={() => {
			//     if (currentRef.current) {
			//         clearInterval(currentRef.current)
			//     }
			// }}
			onPress={() => {
				onPress && onPress();
			}}
			style={{
				paddingRight: 8
			}}
			hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
			size={19}
			timeDelay={1}
			color={
				isDisabled
					? CommonStyle.fontNearLight7
					: CommonStyle.color.quantityIcon
			}
			name={'nounPlus'}
			disabled={isDisabled}
		/>
	);
};
const ReductionButton = ({ onPress, text, disabled }) => {
	const currentRef = useRef();
	const [isDisabled, setDisabled] = useState(true);
	useEffect(() => {
		if (
			text === null ||
			isNaN(text) ||
			parseFloat(text) === 0 ||
			text === '' ||
			disabled
		) {
			setDisabled(true);
		} else {
			setDisabled(false);
		}
	}, [text, disabled]);
	return (
		<IconCustom
			// onPressIn={() => {
			//     currentRef.current = setInterval(() => {
			//         onPress && onPress()
			//     }, 500);
			// }}
			// onPressOut={() => {
			//     if (currentRef.current) {
			//         clearInterval(currentRef.current)
			//     }
			// }}
			onPress={() => {
				onPress && onPress();
			}}
			hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
			timeDelay={1}
			style={{
				paddingLeft: 8
			}}
			size={19}
			color={
				isDisabled
					? CommonStyle.fontNearLight7
					: CommonStyle.color.quantityIcon
			}
			name={'nounRemove'}
			disabled={isDisabled}
		/>
	);
};
export function checkDuplicateDot({ text = '' }) {
	const dots = text.split('.');
	if (dots.length > 2) {
		return true;
	}
	return false;
}
export function checkOnlyInterger({ onlyInterger, text = '' }) {
	if (onlyInterger) {
		let index = text.indexOf('.');
		if (index === -1) return false;
		return true;
	}
	return false;
}
function checkLimitInteger({ text, limitInteger = 16 }) {
	const index = text.indexOf('.');
	let integer = text.slice(0, index);
	if (index === -1) {
		integer = text;
	}
	if (integer.split('').length > limitInteger) {
		return true;
	}
	return false;
}
export const useListennerChangeText = function ({
	dic,
	setText,
	onChangeText,
	inputId,
	decimal,
	onlyInterger,
	limitInteger,
	rest // other function props
}) {
	return useEffect(() => {
		Emitter.addListener(
			getChannelChangeText(inputId),
			null,
			({ newText: text }) => {
				if (isIos) {
					let newText = dic.current.text.toString() + text.toString();
					if (
						checkMaxDecimal({
							text: newText,
							decimal: dic.current.decimal
						}) ||
						checkDuplicateDot({ text: newText }) ||
						checkOnlyInterger({ onlyInterger, text: newText }) ||
						checkLimitInteger({ text: newText, limitInteger })
					) {
						return;
					}
					dic.current.text = newText;
					if (rest && rest.onInput) {
						rest.onInput(newText);
					}
					setText && setText(newText);
				} else {
					const currentText = dic.current.text.toString();
					const selection = dic.current.selection.end;
					const leftString = currentText.slice(0, selection);
					const rightString = currentText.slice(
						selection,
						currentText.length
					);
					let newText = leftString + text.toString() + rightString;
					if (
						checkMaxDecimal({
							text: newText,
							decimal: dic.current.decimal
						}) ||
						checkDuplicateDot({ text: newText }) ||
						checkOnlyInterger({ onlyInterger, text: newText }) ||
						checkLimitInteger({ text: newText, limitInteger })
					) {
						return;
					}
					dic.current.text = newText;
					setText && setText(newText);
					if (rest && rest.onInput) {
						rest.onInput(newText);
					}
				}
			}
		);
		return () => {
			Emitter.deleteEvent(getChannelChangeText(inputId));
		};
	}, [inputId]);
};
const haveDelete = (text) => {
	if (text === '') {
		return false;
	}
	return true;
};
export const useListennerDeleteText = function ({ dic, inputId, setText, rest }) {
	return useEffect(() => {
		Emitter.addListener(getChannelDeleteText(inputId), null, () => {
			if (!haveDelete(dic.current.text)) return;
			if (isIos) {
				const newText = dic.current.text.toString().slice(0, -1);
				dic.current.text = newText;
				setText(newText);
				if (rest && rest.onInputByFunctionKey) {
					rest.onInputByFunctionKey(newText);
				}
			} else {
				const currentText = dic.current.text.toString();
				const selection = dic.current.selection.end;
				const leftString = currentText.slice(0, selection).slice(0, -1);
				const rightString = currentText.slice(
					selection,
					currentText.length
				);

				let newText = leftString + rightString;

				dic.current.text = newText;
				setText(newText);
				if (rest && rest.onInputByFunctionKey) {
					rest.onInputByFunctionKey(newText);
				}
			}
		});
		return () => {
			Emitter.deleteEvent(getChannelDeleteText(inputId));
		};
	}, [inputId]);
};
const checkMaxDecimal = ({ text = '', decimal }) => {
	const index = text.indexOf('.');
	if (index === -1) return false;
	const decimalString = text.substring(index + 1);
	console.log('DCM ', decimalString, decimalString.length);
	const lengthDecimal = decimalString.length;
	if (lengthDecimal > decimal) {
		return true;
	} else {
		return false;
	}
};
/**
 * Text se luu gia tri khi focus dang string khong co day , Ex: '1.234'
 */
const InputWithControl = React.forwardRef(
	(
		{
			orderQuantity = 0,
			type,
			formatValueWhenBlur,
			formatValueWhenFocus,
			onChangeText,
			styleWrapper,
			styleText,
			propsTextInput = {},
			formatValue,
			step = 1,
			decimal = 0,
			alias = '',
			allowNegative,
			value,
			relateValue,
			preAlias = '',
			onlyInterger = false,
			limitInteger = 16,
			disabled,
			...rest
		},
		ref
	) => {
		const [focus, changeFocus] = useState(false);
		const inputId = useMemo(() => {
			return `input#${Util.getRandomKey()}`;
		}, []);
		const dic = useRef({
			text: formatValueWhenFocus(rest.defaultValue),
			coordinates: {},
			selection: {},
			isFocus: false,
			decimal: decimal
		});
		dic.current.decimal = decimal;
		const defaultValue = useMemo(() => {
			return formatValueWhenBlur(rest.defaultValue);
		}, []);
		const refView = useRef();
		const refTextInput = useRef();

		const onFocus = useCallback(() => {
			// Show Keyboard
			refView.current &&
				refView.current.measure &&
				refView.current.measure((x, y, width, height, pageX, pageY) => {
					if (dic.current.timeOutSetCoordinates)
						clearTimeout(dic.current.timeOutSetCoordinates);
					dic.current.coordinates =
						dic.current.coordinates.x === undefined
							? { x, y, width, height, pageX, pageY }
							: dic.current.coordinates;
					Emitter.emit(ChannelKeyBoard.CHANGE_THIS_KEYBOARD, {
						preText: 0,
						isShowKeyBoard: true,
						inputId,
						isMapSlider: false,
						coordinates: dic.current.coordinates
					});
				});
			dic.current.isFocus = true;
			const displayText = formatValueWhenFocus(dic.current.text);
			setText(displayText, false);
			rest.onFocus && rest.onFocus();
		});
		const onBlur = useCallback(() => {
			dic.current.timeOutSetCoordinates = setTimeout(() => {
				dic.current.coordinates = {};
			}, 300);
			dic.current.isFocus = false;
			const displayText = formatValueWhenBlur(dic.current.text);
			// Cap nhat lai dic neu bi lam tron
			dic.current.text =
				parseFloat(displayText) === 0
					? null
					: formatValueWhenFocus(displayText); // Truong hop chi text dang khong nhap gi thi tra ve null
			refTextInput.current &&
				refTextInput.current.setNativeProps({ text: displayText || '' });
			rest.onBlur && rest.onBlur();
		});

		const setText = useCallback((text, isChangeRedux = true) => {
			if (text === null || isNaN(formatValueWhenFocus(text))) {
				dic.current.text = '';
			} else {
				dic.current.text = text;
			}
			refTextInput.current &&
				refTextInput.current.setNativeProps({ text: dic.current.text || '' });
			isChangeRedux && onChangeText && onChangeText(dic.current.text);
		});
		const onReduction = useCallback(() => {
			let newText = isNaN(
				parseFloat(parseFloat(dic.current.text).toFixed(decimal))
			)
				? 0
				: parseFloat(parseFloat(dic.current.text).toFixed(decimal));
			newText = getSmartValueByLotSize({
				volume: orderQuantity,
				value: newText,
				type,
				step,
				isIncrease: false
			});
			newText = parseFloat(parseFloat(newText).toFixed(decimal));
			newText = dic.current.isFocus
				? formatValueWhenFocus(newText)
				: formatValueWhenBlur(newText);
			newText =
				parseFloat(newText) <= 0 && !allowNegative
					? '0'
					: newText.toString();
			if (newText === null || isNaN(newText)) {
				dic.current.text = '';
			} else {
				dic.current.text = newText;
			}
			setText(newText);
			if (rest && rest.onInputByFunctionKey) {
				rest.onInputByFunctionKey(newText);
			}
		});
		const onIncrease = useCallback(() => {
			let newText = isNaN(
				parseFloat(parseFloat(dic.current.text).toFixed(decimal))
			)
				? 0
				: parseFloat(parseFloat(dic.current.text).toFixed(decimal));
			newText = getSmartValueByLotSize({
				volume: orderQuantity,
				value: newText,
				type,
				step,
				isIncrease: true
			});
			newText = dic.current.isFocus
				? formatValueWhenFocus(newText)
				: formatValueWhenBlur(newText);
			newText = newText.toString();
			if (newText === null || isNaN(newText)) {
				dic.current.text = '';
			} else {
				dic.current.text = newText;
			}
			setText(newText);
			if (rest && rest.onInputByFunctionKey) {
				rest.onInputByFunctionKey(newText);
			}
		});
		const onSelectionChange = useCallback(
			({
				nativeEvent: {
					selection: { start, end }
				}
			}) => {
				dic.current.selection = { start, end };
			},
			[]
		);
		useListennerChangeText({
			dic,
			setText,
			inputId,
			decimal: dic.current.decimal,
			onlyInterger,
			limitInteger,
			rest
		});
		useListennerDeleteText({
			dic,
			setText,
			inputId,
			rest
		});
		useImperativeHandle(ref, () => ({
			updateDic: (update) => {
				dic.current = { ...dic.current, ...update };
			},
			getWrapperIntance: () => refTextInput.current,
			getRef: () => refView.current,
			getDic: () => dic.current,
			changeText: (...p) => setText(...p)
		}));

		return (
			<View
				collapsable={false}
				style={[
					{
						borderRadius: 4,
						borderWidth: 1,
						borderColor: disabled
							? CommonStyle.color.disabled
							: CommonStyle.fontBorder,
						backgroundColor: disabled
							? CommonStyle.color.disabled
							: CommonStyle.backgroundColor,
						paddingVertical: 5,
						flexDirection: 'row',
						alignItems: 'center'
					},
					styleWrapper
				]}
				ref={refView}
			>
				<ReductionButton
					disabled={disabled}
					text={relateValue}
					onPress={onReduction}
				/>
				<TouchableOpacity
					disabled={disabled}
					style={{
						flexDirection: 'row',
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						overflow: 'hidden'
					}}
					onPress={() => {
						refTextInput.current && refTextInput.current.focus();
					}}
					activeOpacity={1}
				>
					<View
						pointerEvents="none"
						style={{
							flexDirection: 'row',
							flex: 1,
							justifyContent: 'center',
							paddingHorizontal: 4,
							alignItems: 'center',
							overflow: 'hidden'
						}}
					>
						<Text
							numberOfLines={1}
							style={[
								{
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontPoppinsRegular,
									color: CommonStyle.fontColor,
									textAlign: 'center',
									padding: 0,
									margin: 0
								},
								styleText
							]}
						>{`${preAlias}`}</Text>
						<TextInput
							editable={!disabled}
							numberOfLines={1}
							showSoftInputOnFocus={false}
							ref={refTextInput}
							style={[
								{
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontPoppinsRegular,
									color: CommonStyle.fontColor,
									textAlign: 'center',
									padding: 0,
									margin: 0
								},
								styleText
							]}
							onSelectionChange={onSelectionChange}
							{...rest}
							defaultValue={defaultValue}
							onBlur={onBlur}
							onFocus={onFocus}
							onChangeText={(text) => {
								dic.current.text = text;
								onChangeText && onChangeText(text)
							}}
							onChange={({
								nativeEvent: { eventCount, target, text }
							}) => {
								dic.current.text = text;
							}}
						/>
						<Text
							numberOfLines={1}
							style={[
								{
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontPoppinsRegular,
									color: CommonStyle.fontColor,
									textAlign: 'center',
									padding: 0,
									margin: 0
								},
								styleText
							]}
						>{`${alias}`}</Text>
					</View>
				</TouchableOpacity>
				<IncreaseButton
					disabled={disabled}
					limitNumberLength={limitInteger}
					text={relateValue}
					onPress={onIncrease}
				/>
			</View>
		);
	}
);
InputWithControl.propTypes = {};
InputWithControl.defaultProps = {};
export default InputWithControl;
