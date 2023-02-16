import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import I18n from '~/modules/language/';
import { connect } from 'react-redux';
import { getType } from '~/screens/confirm_order/ConfirmCancelOrder/Model/CancelModel';
import { getToCurrency } from '~s/portfolio/Model/PortfolioAccountModel';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController';

import ENUM from '~/enum';
const { CANCEL_TYPE, PRICE_DECIMAL } = ENUM;
const oneHundred = 100;
function OrderVolume(props) {
	const { filledVolume, orderVolume, sideBuySell } = props;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>{I18n.t('order_volume')} </Text>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Text
					style={[
						styles.txtOrderStyle,
						{
							color:
								sideBuySell === 'buy'
									? CommonStyle.color.buy
									: CommonStyle.color.sell
						}
					]}
				>
					{formatNumberNew2(orderVolume - filledVolume, 0)}
				</Text>
				<Text style={[styles.txtOrderStyle, { paddingHorizontal: 4 }]}>
					/
				</Text>
				<Text style={styles.txtOrderStyle}>
					{formatNumberNew2(orderVolume, 0)}
				</Text>
			</View>
		</View>
	);
}

const formatValue = (value, symbol, exchange) => {
	let displayValue = value;
	let decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
	if (decimal === 1) {
		decimal = 2;
		displayValue = displayValue / oneHundred;
	}

	return formatNumberNew2(displayValue, decimal);
};
function OrderPrice({ orderPrice, fromCurrency, orderType, symbol, exchange }) {
	if (orderType === 'LIMIT') return null;
	return (
		<View style={[styles.orderStyle]}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('price_aud') + ` (${fromCurrency})`}
			</Text>
			<Text style={styles.txtOrderStyle}>
				{formatValue(orderPrice, symbol, exchange)}
			</Text>
		</View>
	);
}
function StopPrice({ stopPrice, fromCurrency, symbol, exchange }) {
	if (stopPrice === null || stopPrice === undefined) return null;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('stop_price') + ` (${fromCurrency})`}
			</Text>
			<Text style={styles.txtOrderStyle}>
				{formatValue(stopPrice, symbol, exchange)}
			</Text>
		</View>
	);
}
function TakeProfit({ takeProfit, fromCurrency, symbol, exchange }) {
	if (takeProfit === null || takeProfit === undefined) return null;
	return (
		<View style={styles.orderStyle}>
			<Text style={styles.txtOrderStyle}>
				{I18n.t('take_profit_price') + ` (${fromCurrency})`}
			</Text>
			<Text style={styles.txtOrderStyle}>
				{formatValue(takeProfit, symbol, exchange)}
			</Text>
		</View>
	);
}
const RenderOrderOriginal = ({
	orderType,
	stopPrice,
	takeProfit,
	filledVolume,
	orderVolume,
	typeOrder,
	orderPrice,
	sideBuySell,
	fromCurrency,
	symbol,
	exchange
}) => {
	const defaultProps = {
		symbol,
		exchange,
		fromCurrency
	};
	const orderVolumeComp = (
		<OrderVolume
			filledVolume={filledVolume}
			orderVolume={orderVolume}
			sideBuySell={sideBuySell}
		/>
	);

	const orderPriceComp = (
		<OrderPrice
			{...defaultProps}
			orderType={orderType}
			orderPrice={orderPrice}
		/>
	);
	const stopPriceComp = <StopPrice {...defaultProps} stopPrice={stopPrice} />;
	const takeProfitComp = (
		<TakeProfit {...defaultProps} takeProfit={takeProfit} />
	);

	if (typeOrder === CANCEL_TYPE.CANCEL_ORDER_ORIGINAL) {
		return (
			<View>
				{orderVolumeComp}
				{orderPriceComp}
				{stopPriceComp}
				{takeProfitComp}
			</View>
		);
	}
	if (typeOrder === CANCEL_TYPE.CANCEL_ORDER_TAKE_PROFIT) {
		return (
			<View>
				{orderVolumeComp}
				{takeProfitComp}
			</View>
		);
	}
	return (
		<View>
			{orderVolumeComp}
			{stopPriceComp}
		</View>
	);
};

const OrderOriginal = ({ data, fromCurrency, symbol, exchange }) => {
	const {
		stoploss_order_info: stopLossOrderInfo,
		takeprofit_order_info: takeProfitOrderInfo,
		limit_price: orderPrice,
		order_quantity: orderVolume,
		filled_quantity: filledQuantity,
		order_type: orderType,
		side: sideBuySell
	} = data;
	const filledVolume = filledQuantity;
	const { stoploss_order_price: stopPrice } = stopLossOrderInfo || {};
	const { takeprofit_order_price: takeProfit } = takeProfitOrderInfo || {};
	const typeOrder = getType();
	return (
		<View
			style={{
				paddingTop: 16,
				paddingBottom: 8,
				paddingHorizontal: 16
			}}
		>
			<RenderOrderOriginal
				stopPrice={stopPrice}
				takeProfit={takeProfit}
				filledVolume={filledVolume}
				orderVolume={orderVolume}
				orderPrice={orderPrice}
				orderType={orderType}
				typeOrder={typeOrder}
				sideBuySell={sideBuySell}
				fromCurrency={fromCurrency}
				symbol={symbol}
				exchange={exchange}
			/>
		</View>
	);
};

export default OrderOriginal;

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		txtOrderStyle: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.font11,
			color: CommonStyle.fontColor
		},
		orderStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between'
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
