import { View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useController, useWatch } from 'react-hook-form';
import * as Emitter from '@lib/vietnam-emitter';

import CommonStyle from '~/theme/theme_controller';
import ENUM from '~/enum';
import I18n from '~/modules/language/index';
import InputWithControl from '~/component/virtual_keyboard/InputWithControl3';
import styles from './styles';
import { changeFocusInput } from '~/screens/new_order/Redux/actions.js';
import { getChannelShowMessageNewOrder as getChannelChangeOrderError } from '~/streaming/channel';
import {
	formatPriceOnBlur,
	formatPriceOnFocus,
	getDecimalPriceByRule,
	getStepByRule
} from '../../Controller/InputController';
import { getGlobalState } from '~/memory/model';

const KEYBOARD_TYPE = ENUM.NEW_ORDER_INPUT_KEY.CONTINGENT_STRATEGY;

const getPriceData = (state) => {
	const { symbol, exchange } = state.newOrder;
	if (symbol) {
		const key = `${symbol}#${exchange}`;
		const { data } = state.quotes || {};
		const quote = data[key] || {};
		const {
			trade_price: tradePrice,
			ask_price: askPrice,
			bid_price: bidPrice
		} = quote;
		return {
			tradePrice,
			askPrice,
			bidPrice
		};
	}
	return {};
};

const getPriceSymbol = (priceBase) => {
	// cache from useEffect
	const priceData = getPriceData(getGlobalState()) || {};

	if (priceBase === 'BID') {
		return +priceData.bidPrice;
	} else if (priceBase === 'ASK') {
		return +priceData.askPrice;
	} else {
		return +priceData.tradePrice;
	}
};

const pointToPrice = (point, isLessOrEqual, priceBase) => {
	const priceSymbol = getPriceSymbol(priceBase) || 0;
	if (isLessOrEqual) {
		return Math.max(priceSymbol - point, 0);
	} else {
		return priceSymbol + point;
	}
};
const priceToPoint = (price, isLessOrEqual, priceBase) => {
	const priceSymbol = getPriceSymbol(priceBase) || 0;
	if (isLessOrEqual) {
		return Math.max(priceSymbol - price, 0);
	} else {
		return Math.max(price - priceSymbol, 0);
	}
};

const useInput = () => {
	const _cache = useRef({
		pointValue: 0,
		priceValue: 0
	});

	const onChangeText = (t) => {
		const isPoint = getGlobalState().newOrder.isContingentTypePoint;
		if (isPoint) {
			_cache.current.pointValue = +t;
			_cache.current.priceValue = 0;
		} else {
			_cache.current.priceValue = +t;
			_cache.current.pointValue = 0;
		}
	};

	return [_cache, onChangeText];
};

const useConvertPicePoint = (_cache, control, cb) => {
	const decimal = getDecimalPriceByRule();
	const priceBase = useWatch({ control, name: 'priceBase' });
	const condition = useWatch({ control, name: 'condition' });

	const isLessOrEqual = condition === 'LESS' || condition === 'LESS_OR_EQUAL';

	const isPoint = useSelector(
		(state) => state.newOrder.isContingentTypePoint
	);

	useEffect(() => {
		let value = '';
		if (isPoint) {
			if (_cache.current.pointValue) {
				value = _cache.current.pointValue;
			} else {
				if (!_cache.current.priceValue) {
					value = 0;
				} else {
					value = priceToPoint(
						_cache.current.priceValue,
						isLessOrEqual,
						priceBase
					);
				}
			}
		} else {
			if (_cache.current.priceValue) {
				value = _cache.current.priceValue;
			} else {
				value = pointToPrice(
					_cache.current.pointValue,
					isLessOrEqual,
					priceBase
				);
			}
		}

		const formatedValue = formatPriceOnBlur(value, decimal);
		cb(formatedValue);
	}, [isPoint, condition, priceBase]);
};

const useError = (error, onSetStyle) => {
	const channel = getChannelChangeOrderError();
	const isPoint = useSelector(
		(state) => state.newOrder.isContingentTypePoint
	);

	useEffect(() => {
		if (error && error.message) {
			Emitter.emit(channel, {
				msg: isPoint
					? I18n.t('pointMustBePositive')
					: I18n.t('limitTriggerPriceValid'),
				type: ENUM.TYPE_MESSAGE.ERROR,
				key: ENUM.TYPE_ERROR_ORDER.TRIGGER_PRICE_INVALID_ERROR
			});
			onSetStyle(true);
		} else {
			onSetStyle();
		}
	}, [error, isPoint]);
};

const InputBlock = ({ control, defaultValue, setError }) => {
	const _ref = useRef({
		decimal: ENUM.PRICE_DECIMAL.PRICE_IRESS,
		step: ENUM.STEP.STEP_PRICE
	});

	const _input = useRef();
	const dispatch = useDispatch();

	const limitPrice = useSelector((state) => state.newOrder.limitPrice);
	const isPoint = useSelector(
		(state) => state.newOrder.isContingentTypePoint
	);
	_ref.current.decimal = getDecimalPriceByRule();
	_ref.current.step = isPoint ? 1 : getStepByRule(limitPrice);

	const { field, fieldState } = useController({
		control,
		defaultValue,
		name: 'triggerPrice'
	});

	const [_cache, onChangeText] = useInput();

	useConvertPicePoint(_cache, control, (value) => {
		_input.current && _input.current.changeText(value, false); // false = without callback onChangeText
		field.onChange(value);
	});

	useError(fieldState.error, (isError) => {
		const _native = _input.current && _input.current.getRef();
		_native.setNativeProps &&
			_native.setNativeProps({
				style: {
					borderWidth: 1,
					borderColor: isError ? 'red' : CommonStyle.fontBorder
				}
			});
	});

	return (
		<View style={styles.inputContent}>
			<InputWithControl
				ref={_input}
				type={KEYBOARD_TYPE}
				step={_ref.current.step}
				limitInteger={15}
				onChangeText={(t) => {
					if (+t) {
						setError();
					}
					field.onChange(t);
					onChangeText(t);
				}}
				onFocus={() => {
					dispatch(changeFocusInput(KEYBOARD_TYPE));
				}}
				onBlur={() => {
					if (!+field.value) {
						setError('required');
					}
					field.onBlur();
				}}
				autoFocus={false}
				defaultValue={defaultValue}
				relateValue={field.value}
				decimal={_ref.current.decimal}
				formatValueWhenBlur={(value) =>
					formatPriceOnBlur(
						value,
						_ref.current.decimal,
						_ref.current.step
					)
				}
				formatValueWhenFocus={(value) =>
					formatPriceOnFocus(
						value,
						_ref.current.decimal,
						_ref.current.step
					)
				}
			/>
		</View>
	);
};

export default InputBlock;
