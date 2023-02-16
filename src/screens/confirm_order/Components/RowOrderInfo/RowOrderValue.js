import React, { useState, useRef, useEffect } from 'react';
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
import { getFromCurrency } from '~s/portfolio/Model/PortfolioAccountModel';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController';
const {
	TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE },
	SYMBOL_CLASS,
	CURRENCY
} = Enum;
function OrderValue(props) {
	const { orderValue, isLoading, toCurrency } = props;
	const fromCurrency = getFromCurrency();

	const displayOrderValue =
		getDecimalPriceByRule() === 1 ? orderValue / 100 : orderValue;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyleTitle}>
				{I18n.t('order_value') + ` (${fromCurrency})`}
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
	const { orderVolume } = props;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>{I18n.t('order_volume')} </Text>
			<Text style={styles.txtOrderStyle}>
				{formatNumberNew2(orderVolume, Enum.PRICE_DECIMAL.VOLUME)}
			</Text>
		</View>
	);
}
function OrderPrice(props) {
	const { orderPrice, toCurrency } = props;
	const fromCurrency = getFromCurrency();
	let decimal = getDecimalPriceByRule();
	let displayOrderPrice = orderPrice;

	if (decimal === 1) {
		decimal = 2;
		displayOrderPrice = orderPrice / 100;
	}
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('price_aud') + ` (${fromCurrency})`}
			</Text>
			<Text style={styles.txtOrderStyle}>
				{formatNumberNew2(displayOrderPrice, decimal)}
			</Text>
		</View>
	);
}
export default function RowOrderValue(props) {
	const {
		orderValue,
		orderVolume,
		orderPrice,
		accountID,
		orderType,
		isLoading
	} = props;
	const fromCurrency = getFromCurrency();
	return (
		<View
			style={{
				borderBottomWidth: 1,
				borderColor: CommonStyle.color.dusk,
				marginLeft: 8,
				marginRight: 8
			}}
		>
			<OrderValue
				toCurrency={fromCurrency}
				isLoading={isLoading}
				orderValue={orderValue || orderVolume * orderPrice || '--'}
			/>
			{isLoading ? <View style={{ height: 2 }} /> : null}
			<OrderVolume orderVolume={orderVolume} />
			{isLoading ? <View style={{ height: 2 }} /> : null}
			{orderType.key === 'LIMIT' ? (
				<OrderPrice toCurrency={fromCurrency} orderPrice={orderPrice} />
			) : null}
			{isLoading ? <View style={{ height: 2 }} /> : null}
		</View>
	);
}

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
			opacity: 0.5,
			textAlign: 'center'
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
