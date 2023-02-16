import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import I18n from '~/modules/language/';
import { connect } from 'react-redux';
import { getFromCurrency } from '~s/portfolio/Model/PortfolioAccountModel';
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
const {
	TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE },
	SYMBOL_CLASS,
	CURRENCY
} = Enum;
function OrderValue(props) {
	const { orderValue, isLoading, toCurrency } = props;

	const displayOrderValue =
		getDecimalPriceByRule() === 1 ? orderValue / 100 : orderValue;

	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyleTitle}>
				{I18n.t('order_value') + ` (${toCurrency})`}
			</Text>
			<TextLoading
				numberOfLines={2}
				containerStyle={{
					alignSelf: 'flex-end'
				}}
				wrapperStyle={{ flex: 1, alignItems: 'flex-end' }}
				isLoading={isLoading}
				style={styles.txtOrderStyleTitle}
			>
				{formatNumberNew2(
					convertedCurrentcyFormat(displayOrderValue),
					Enum.PRICE_DECIMAL.VALUE
				)}
			</TextLoading>
		</View>
	);
}
function OrderVolume(props) {
	const { orderVolume, isLoading } = props;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>{I18n.t('order_volume')} </Text>
			<Text style={styles.txtOrderStyle}>{orderVolume || '--'}</Text>
		</View>
	);
}
function OrderPrice(props) {
	const { orderPrice, isLoading } = props;
	const fromCurrency = getFromCurrency();
	const displayOrderPrice =
		getDecimalPriceByRule() === 1 ? orderPrice / 100 : orderPrice;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('price_aud') + ` (${fromCurrency})`}
			</Text>
			<Text style={styles.txtOrderStyle}>
				{formatNumberNew2(
					convertedCurrentcyFormat(displayOrderPrice),
					Enum.PRICE_DECIMAL.VALUE
				)}
			</Text>
		</View>
	);
}
// formatNumberNew2(orderPrice, Enum.PRICE_DECIMAL.PRICE_IRESS) || '--'
const RowOrderValue = ({
	newOrder,
	limitPrice,
	orderType,
	dataFees,
	tradePrice
}) => {
	const fromCurrency = getFromCurrency();

	const dic = useRef({ isLoading: true });
	useEffect(() => {
		setTimeout(() => {
			dic.current.isLoading = false;
		}, 100);
	}, []);
	const orderConfirm = useMemo(() => {
		let obj = {};
		obj.order_value = newOrder.orderValue.value;
		obj.order_volume = newOrder.quantity.value;
		obj.stop_price = newOrder.stopPrice.value;
		if (orderType === 'LIMIT') {
			obj.order_price = limitPrice;
		}
		obj.profit_price = newOrder.takeProfitLoss.value;
		obj.symbols = newOrder.symbol;
		obj.exchanges = newOrder.exchange;
		obj.life_time = newOrder.duration.label;
		return obj;
	}, [newOrder]);
	const {
		order_volume: orderVolume,
		stop_price: stopPrice,
		profit_price: profitPrice,
		symbols: symBols,
		exchanges: exChange,
		life_time: lifeTime
	} = orderConfirm;
	// const { order_value: orderValue } = dataFees;
	let orderValue = null;

	const priceValue = limitPrice || tradePrice;
	if (orderVolume && priceValue) {
		orderValue = orderVolume * priceValue;
	}

	return (
		<View
			style={{
				marginTop: 8,
				borderBottomWidth: 1,
				borderColor: CommonStyle.color.dusk,
				marginLeft: 8,
				marginRight: 8
			}}
		>
			<OrderValue
				toCurrency={fromCurrency}
				isLoading={dic.current.isLoading}
				orderValue={orderValue}
			/>
			{dic.current.isLoading ? <View style={{ height: 2 }} /> : null}
			<OrderVolume
				isLoading={dic.current.isLoading}
				orderVolume={orderVolume}
			/>
			{dic.current.isLoading ? <View style={{ height: 2 }} /> : null}
			{orderType === 'LIMIT' ? (
				<OrderPrice
					toCurrency={fromCurrency}
					isLoading={dic.current.isLoading}
					orderPrice={limitPrice}
				/>
			) : null}
		</View>
	);
};
function mapStateToProps(state) {
	const { symbol, exchange, orderType, limitPrice } = state.newOrder || {};
	const quote = state.quotes?.data[symbol + '#' + exchange];
	return {
		newOrder: state.newOrder,
		orderType: orderType.key,
		limitPrice,
		tradePrice: quote?.trade_price
	};
}
export default connect(mapStateToProps)(RowOrderValue);
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		orderStyle: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center'
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
			color: CommonStyle.color.lightWhite,
			fontSize: CommonStyle.font11,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginLeft: 16,
			marginRight: 8,
			marginBottom: 8,
			opacity: 0.5
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
