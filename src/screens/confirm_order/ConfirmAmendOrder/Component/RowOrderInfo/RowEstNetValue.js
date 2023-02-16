import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import Enum from '~/enum';
import I18n from '~/modules/language/';
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController';
import { connect } from 'react-redux';
import { getFromCurrency } from '~s/portfolio/Model/PortfolioAccountModel';
import { getLifeTimeDisplay } from '~/screens/confirm_order/Controllers/ContentController.js';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
import { getType } from '~/screens/new_order/Model/OrderEntryModel.js';
import {
	convertedCurrentcyFormat,
	convertPrice
} from '~s/confirm_order/Controllers/ContentController';
const {
	TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE },
	SYMBOL_CLASS,
	CURRENCY
} = Enum;
function EstNetValue(props) {
	const { estNetValue, isLoading } = props;
	const fromCurrency = getFromCurrency();

	const displayValue =
		getDecimalPriceByRule() === 1 ? estNetValue / 100 : estNetValue;

	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyleTitle}>
				{I18n.t('est_net_value') + ` (${fromCurrency})`}
			</Text>
			<TextLoading
				numberOfLines={2}
				containerStyle={{
					alignSelf: 'flex-end'
				}}
				wrapperStyle={{ flex: 1, alignItems: 'flex-end' }}
				isLoading={isLoading}
				style={[
					styles.txtOrderStyleTitle,
					{
						color: estNetValue
							? CommonStyle.color.turquoiseBlue
							: CommonStyle.fontWhite
					}
				]}
			>
				{formatNumberNew2(
					convertedCurrentcyFormat(displayValue),
					Enum.PRICE_DECIMAL.VALUE
				) || '--'}
			</TextLoading>
		</View>
	);
}

function EstProfit(props) {
	let { estProfit, isLoading } = props;
	let decimal = getDecimalPriceByRule();
	if (decimal === 1) {
		decimal = 2;
		estProfit = estProfit / 100;
	}

	const fromCurrency = getFromCurrency();
	const checkColorEst = (isColor) => {
		if (!isColor || isColor === '--') {
			return CommonStyle.fontWhite;
		} else {
			return CommonStyle.color.buy;
		}
	};

	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('est_profit') + ` (${fromCurrency})`}
			</Text>
			<TextLoading
				isLoading={isLoading}
				style={[
					styles.txtOrderStyle,
					{
						color: checkColorEst(estProfit)
					}
				]}
			>
				{formatNumberNew2(estProfit, decimal) || '--'}
			</TextLoading>
		</View>
	);
}
function EstLost(props) {
	let { estLost, isLoading } = props;
	let decimal = getDecimalPriceByRule();
	if (decimal === 1) {
		decimal = 2;
		estLost = (estLost || 0) / 100;
	}
	const fromCurrency = getFromCurrency();
	const checkColorEst = (isColor) => {
		if (!isColor || isColor === '--') {
			return CommonStyle.fontWhite;
		} else {
			return CommonStyle.color.buy;
		}
	};

	return (
		<View style={[styles.orderStyle]}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('est_loss') + ` (${fromCurrency})`}
			</Text>
			<TextLoading
				isLoading={isLoading}
				style={[
					styles.txtOrderStyle,
					{ color: checkColorEst(estLost) }
				]}
			>
				{formatNumberNew2(estLost, decimal) || '--'}
			</TextLoading>
		</View>
	);
}
function Lifetime(props) {
	const { lifetime } = props;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>{I18n.t('lifetime')}</Text>
			<Text style={styles.txtOrderStyle}>{lifetime || '--'}</Text>
		</View>
	);
}
const RowEstNetValue = ({ dataFees, newOrder, tradePrice, isLoading }) => {
	const fromCurrency = getFromCurrency();
	const orderConfirm = useMemo(() => {
		let obj = {};
		obj.profit_price = newOrder.takeProfitLoss.value;
		obj.life_time = newOrder.duration.label;
		obj.order_volume = newOrder.quantity.value;
		obj.stop_price = newOrder.stopPrice.value;
		obj.duration = newOrder.duration;
		obj.date = newOrder.date;
		obj.limitPrice = newOrder.limitPrice;
		return obj;
	}, [newOrder]);
	orderConfirm.life_time = getLifeTimeDisplay({ newOrder });
	const {
		order_volume: orderVolume,
		profit_price: estProfitPnl,
		life_time: lifetime,
		stop_price: estStopPricePnl,
		limitPrice
	} = orderConfirm;
	const {
		// order_value: orderValueFess,
		estimated_net_value: estNetValue
	} = dataFees;

	let orderValueFess = null;
	const priceValue = limitPrice || tradePrice;

	if (orderVolume && priceValue) {
		orderValueFess = orderVolume * priceValue;
	}

	const estProfit = !orderValueFess
		? '--'
		: Math.abs(orderValueFess - estProfitPnl * orderVolume);
	const estLost = !orderValueFess
		? '--'
		: Math.abs(orderValueFess - estStopPricePnl * orderVolume);
	const typeOrder = getType();

	const hasStopLoss =
		typeOrder === Enum.AMEND_TYPE.AMEND_TRADING_STOPPRICE ||
		typeOrder === Enum.AMEND_TYPE.AMEND_TRADING_STRATEGIES;

	const hasProfit =
		typeOrder === Enum.AMEND_TYPE.AMEND_TRADING_PROFITLOSS ||
		typeOrder === Enum.AMEND_TYPE.AMEND_TRADING_STRATEGIES;
	return (
		<View style={{ backgroundColor: CommonStyle.backgroundColor }}>
			<View
				style={{
					padding: 8
				}}
			>
				<EstNetValue
					toCurrency={fromCurrency}
					isLoading={isLoading}
					estNetValue={estNetValue}
				/>
				{isLoading ? <View style={{ height: 2 }} /> : null}
				{hasProfit && (
					<EstProfit
						toCurrency={fromCurrency}
						isLoading={isLoading}
						estProfit={estProfit}
					/>
				)}
				{isLoading ? <View style={{ height: 2 }} /> : null}
				{hasStopLoss && (
					<EstLost
						toCurrency={fromCurrency}
						isLoading={isLoading}
						estLost={estLost}
					/>
				)}
				{isLoading ? <View style={{ height: 2 }} /> : null}
				<Lifetime lifetime={lifetime} />
			</View>
		</View>
	);
};
function mapStateToProps(state) {
	const { symbol, exchange } = state.newOrder || {};
	const quote = state.quotes?.data[symbol + '#' + exchange];

	return {
		newOrder: state.newOrder,
		tradePrice: quote?.trade_price
	};
}
export default connect(mapStateToProps)(RowEstNetValue);
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		orderStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'baseline'
		},
		txtOrderStyleTitle: {
			color: CommonStyle.fontWhite,
			fontSize: CommonStyle.font13,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginLeft: 8,
			marginRight: 8,
			marginBottom: 8
		},
		txtOrderStyle: {
			color: CommonStyle.fontWhite,
			fontSize: CommonStyle.font11,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginLeft: 8,
			marginRight: 8,
			marginBottom: 8
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
