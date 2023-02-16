import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

import LastTrade from '~/screens/new_order/Components/SymbolWithPrice/LastTrade.js';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
	changeLimitPrice,
	changeLimitPriceSL,
	changeLimitPriceTP
} from '~/screens/new_order/Redux/actions.js';
import {
	getValueForRedux,
	getStepByRule,
	getDecimalPriceByRule
} from '~/screens/new_order/Controller/InputController.js';
import { setLimitPrice } from '~/screens/new_order/Model/PriceModel.js';
import {
	formatNumber,
	formatNumberNew2,
	stringMostOneDot,
	isDotAtEndString,
	formatNumberPrice
} from '~/lib/base/functionUtil';
import Enum from '~/enum';
import * as InputModel from '~/screens/new_order/Model/InputModel.js';
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
const STEP_PRICE = Enum.STEP.STEP_PRICE;
const NEW_ORDER_INPUT_KEY = Enum.NEW_ORDER_INPUT_KEY;
const BidPrice = ({ value }) => {
	// const decimalPrice = getDecimalPriceByRule()
	const decimalPrice = getDecimalPriceByRule();
	const dispatch = useDispatch();
	const updateLimitPrice = useCallback(({ value, decimalPrice, step }) => {
		InputModel.getInputFocus() ===
			NEW_ORDER_INPUT_KEY.STOPLOSS_LIMIT_PRICE &&
			dispatch(
				changeLimitPriceSL(getValueForRedux(value, decimalPrice, step))
			);
		InputModel.getInputFocus() ===
			NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LIMIT_PRICE &&
			dispatch(
				changeLimitPriceTP(getValueForRedux(value, decimalPrice, step))
			);
		InputModel.getInputFocus() === NEW_ORDER_INPUT_KEY.LIMIT_PRICE &&
			setLimitPrice(value) &&
			dispatch(
				changeLimitPrice(getValueForRedux(value, decimalPrice, step))
			);
	}, []);
	const onPress = useCallback(() => {
		// value = parseInt(value)
		const step = getStepByRule(value);
		return updateLimitPrice({ value, decimalPrice, step });
		dispatch(changeLimitPrice(getValueForRedux(value, decimalPrice, step)));
	}, [value]);
	const displayPrice = formatNumberPrice(value, decimalPrice);
	return (
		<TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text style={styles.title}>Bid</Text>
				<Text style={styles.priceBid}>{displayPrice}</Text>
			</View>
		</TouchableOpacity>
	);
};
const AskPrice = ({ value }) => {
	// const decimalPrice = getDecimalPriceByRule()
	const decimalPrice = getDecimalPriceByRule();
	const dispatch = useDispatch();
	const updateLimitPrice = useCallback(({ value, decimalPrice, step }) => {
		InputModel.getInputFocus() ===
			NEW_ORDER_INPUT_KEY.STOPLOSS_LIMIT_PRICE &&
			dispatch(
				changeLimitPriceSL(getValueForRedux(value, decimalPrice, step))
			);
		InputModel.getInputFocus() ===
			NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LIMIT_PRICE &&
			dispatch(
				changeLimitPriceTP(getValueForRedux(value, decimalPrice, step))
			);
		InputModel.getInputFocus() === NEW_ORDER_INPUT_KEY.LIMIT_PRICE &&
			setLimitPrice(value) &&
			dispatch(
				changeLimitPrice(getValueForRedux(value, decimalPrice, step))
			);
	}, []);
	const onPress = useCallback(() => {
		// value = parseInt(value)
		const step = getStepByRule(value);
		return updateLimitPrice({ value, decimalPrice, step });
		dispatch(changeLimitPrice(getValueForRedux(value, decimalPrice, step)));
	}, [value]);
	const displayPrice = formatNumberPrice(value, decimalPrice);
	return (
		<TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text style={styles.title}>Ask</Text>
				<Text style={styles.priceAsk}>{displayPrice}</Text>
			</View>
		</TouchableOpacity>
	);
};
const LastTradePrice = ({ value }) => {
	const dispatch = useDispatch();
	const { symbol, exchange } = useSelector((state) => {
		return {
			symbol: state.newOrder.symbol,
			exchange: state.newOrder.exchange
		};
	}, shallowEqual);
	const updateLimitPrice = useCallback(({ value, decimalPrice, step }) => {
		InputModel.getInputFocus() ===
			NEW_ORDER_INPUT_KEY.STOPLOSS_LIMIT_PRICE &&
			dispatch(
				changeLimitPriceSL(getValueForRedux(value, decimalPrice, step))
			);
		InputModel.getInputFocus() ===
			NEW_ORDER_INPUT_KEY.TAKE_PROFIT_LIMIT_PRICE &&
			dispatch(
				changeLimitPriceTP(getValueForRedux(value, decimalPrice, step))
			);
		InputModel.getInputFocus() === NEW_ORDER_INPUT_KEY.LIMIT_PRICE &&
			setLimitPrice(value) &&
			dispatch(
				changeLimitPrice(getValueForRedux(value, decimalPrice, step))
			);
	}, []);
	const onPress = useCallback(() => {
		// value = parseInt(value)
		const step = getStepByRule(value);
		return updateLimitPrice({
			value,
			decimalPrice: getDecimalPriceByRule(),
			step
		});
		dispatch(
			changeLimitPrice(
				getValueForRedux(value, getDecimalPriceByRule(), step)
			)
		);
	}, [value]);
	return (
		<TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text style={styles.title}>Last Trade</Text>
				<LastTrade
					{...{ symbol, exchange }}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsMedium,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontWhite
					}}
					value={value}
				/>
			</View>
		</TouchableOpacity>
	);
};
const BidAskPrice = React.memo(
	() => {
		const { bidPrice, askPrice, tradePrice } = useSelector((state) => {
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
		}, shallowEqual);
		return (
			<View
				style={{
					flexDirection: 'row',
					paddingVertical: 8
				}}
			>
				<BidPrice value={bidPrice} />
				<AskPrice value={askPrice} />
				<LastTradePrice value={tradePrice} />
			</View>
		);
	},
	() => true
);
BidAskPrice.propTypes = {};
BidAskPrice.defaultProps = {};
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		title: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.fontNearLight4
		},
		priceBid: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.color.buy,
			fontSize: CommonStyle.fontSizeXS
		},
		priceAsk: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.color.sell,
			fontSize: CommonStyle.fontSizeXS
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

export default BidAskPrice;
