import React, { useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import ButtonBySell from './ButtonBySell';
import { connect } from 'react-redux';
import { useShadow } from '~/component/shadow/SvgShadow';
import {
	isShowPrice,
	isShowTradingPrice,
	getValueToPrice,
	getValueToStopPrice,
	getValueToTakeProfitLossPrice,
	getValueToVolume
} from '~/screens/confirm_order/Controllers/ConfirmAmendOrderController.js';
import * as Business from '~/business';
import Enum from '~/enum';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import { ENUM } from '~/component/animation_view';
import { getFromCurrency } from '~s/portfolio/Model/PortfolioAccountModel';
import { getDecimalPriceByRule } from '~/screens/new_order/Controller/InputController.js';
import I18n from '~/modules/language/';
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController';
import { calculateLineHeight } from '~/util';
import RowContingentInfo from './RowContingentInfo';

const {
	TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE },
	SYMBOL_CLASS,
	CURRENCY,
	PRICE_DECIMAL,
	PORTFOLIO_TYPE
} = Enum;
const currency = '$';
const oneHundred = 100;
const { width, height } = Dimensions.get('window');
const widthToFrom = (70 / width) * width;
const RowFromTo = () => {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'flex-end',
				width: '100%'
			}}
		>
			<View
				style={{
					width: widthToFrom,
					alignItems: 'flex-end',
					borderBottomColor: CommonStyle.color.dusk,
					borderBottomWidth: 1
				}}
			>
				<Text
					style={{
						color: CommonStyle.fontNearLight6,
						fontSize: CommonStyle.font13,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					From
				</Text>
			</View>
			<View
				style={{
					width: widthToFrom,
					alignItems: 'flex-end',
					borderBottomColor: CommonStyle.color.dusk,
					borderBottomWidth: 1,
					marginLeft: 16
				}}
			>
				<Text
					style={{
						color: CommonStyle.fontNearLight6,
						fontSize: CommonStyle.font13,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					To
				</Text>
			</View>
		</View>
	);
};
const RowOutstandingVolume = ({ volumeFrom, volumeTo }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				width: '100%',
				paddingTop: 8
			}}
		>
			{/* Layout hien dang fix cung width. Hot fix sua nhu the nay! Nen dung flex chia layout */}
			<View
				style={{
					marginLeft: 16,
					width: width - 16 * 2 - 16 * 2 - widthToFrom * 2 - 16,
					paddingRight: 8
				}}
			>
				<Text
					numberOfLines={1}
					style={{
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13,
						opacity: 0.5,
						fontFamily: CommonStyle.fontPoppinsRegular,
						lineHeight: calculateLineHeight(CommonStyle.font13)
					}}
				>
					Outstanding Volume
				</Text>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					marginRight: 16
				}}
			>
				<View style={{ width: widthToFrom, alignItems: 'flex-end' }}>
					<Text
						style={{
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(
							volumeFrom,
							Enum.PRICE_DECIMAL.VOLUME
						)}
					</Text>
				</View>
				<View
					style={{
						width: widthToFrom,
						alignItems: 'flex-end',
						marginLeft: 16
					}}
				>
					<Text
						style={{
							color: CommonStyle.color.modify,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(volumeTo, Enum.PRICE_DECIMAL.VOLUME)}
					</Text>
				</View>
			</View>
		</View>
	);
};
const RowPrice = ({ priceFrom, priceTo, toCurrency }) => {
	const decimal = getDecimalPriceByRule();
	const divide = decimal === 1 ? 100 : 1;
	const fromCurrency = getFromCurrency();
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				width: '100%',
				paddingTop: 8
			}}
		>
			<View
				style={{
					marginLeft: 16,
					width: width - 16 * 2 - 16 * 2 - widthToFrom * 2 - 16,
					paddingRight: 8
				}}
			>
				<Text
					numberOfLines={1}
					style={{
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13,
						opacity: 0.5,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>{`Price  (${fromCurrency})`}</Text>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					marginRight: 16
				}}
			>
				<View style={{ width: widthToFrom, alignItems: 'flex-end' }}>
					<Text
						style={{
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(priceFrom / divide, 2)}
					</Text>
				</View>
				<View
					style={{
						width: widthToFrom,
						alignItems: 'flex-end',
						marginLeft: 16
					}}
				>
					<Text
						style={{
							color: CommonStyle.color.modify,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(priceTo / divide, 2)}
					</Text>
				</View>
			</View>
		</View>
	);
};
const RowStopPrice = ({ stopPriceFrom, stopPriceTo, toCurrency }) => {
	const decimal = getDecimalPriceByRule();
	const divide = decimal === 1 ? 100 : 1;
	const fromCurrency = getFromCurrency();
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				width: '100%',
				paddingTop: 8
			}}
		>
			<View
				style={{
					marginLeft: 16,
					width: width - 16 * 2 - 16 * 2 - widthToFrom * 2 - 16,
					paddingRight: 8
				}}
			>
				<Text
					numberOfLines={1}
					style={{
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13,
						opacity: 0.5,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{I18n.t('stop_price') + ` (${fromCurrency})`}{' '}
				</Text>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					marginRight: 16
				}}
			>
				<View style={{ width: widthToFrom, alignItems: 'flex-end' }}>
					<Text
						style={{
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(
							stopPriceFrom
								? stopPriceFrom / divide
								: stopPriceFrom,
							2
						)}
					</Text>
				</View>
				<View
					style={{
						width: widthToFrom,
						alignItems: 'flex-end',
						marginLeft: 16
					}}
				>
					<Text
						style={{
							color: CommonStyle.color.modify,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(
							stopPriceTo ? stopPriceTo / divide : stopPriceTo,
							2
						)}
					</Text>
				</View>
			</View>
		</View>
	);
};
const RowTakeProfit = ({ takeProfitFrom, takeProfitTo, toCurrency }) => {
	const decimal = getDecimalPriceByRule();
	const divide = decimal === 1 ? 100 : 1;
	const fromCurrency = getFromCurrency();
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				width: '100%',
				paddingVertical: 8
			}}
		>
			<View
				style={{
					marginLeft: 16,
					width: width - 16 * 2 - 16 * 2 - widthToFrom * 2 - 16,
					paddingRight: 8
				}}
			>
				<Text
					numberOfLines={1}
					style={{
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13,
						opacity: 0.5,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{I18n.t('take_profit_price') + ` (${fromCurrency})`}
				</Text>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					marginRight: 16
				}}
			>
				<View style={{ width: widthToFrom, alignItems: 'flex-end' }}>
					<Text
						style={{
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(
							takeProfitFrom
								? takeProfitFrom / divide
								: takeProfitFrom,
							2
						)}
					</Text>
				</View>
				<View
					style={{
						width: widthToFrom,
						alignItems: 'flex-end',
						marginLeft: 16
					}}
				>
					<Text
						style={{
							color: CommonStyle.color.modify,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{formatNumberNew2(
							takeProfitTo ? takeProfitTo / divide : takeProfitTo,
							2
						)}
					</Text>
				</View>
			</View>
		</View>
	);
};
const RowOutstanding = React.memo(
	({ newOrder, orderType, isBuy, limitPrice, data, symbol, exchange }) => {
		const fromCurrency = getFromCurrency();
		const symbolClass = useMemo(() => {
			return Business.getClassBySymbolAndExchange({ symbol, exchange });
		}, [symbol, exchange]);
		const displayName = useMemo(() => {
			return Business.getDisplayName({ symbol, exchange });
		}, []);
		const companyName = useMemo(() => {
			return Business.getCompanyName({ symbol, exchange });
		});
		const orderTo = useMemo(() => {
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
			order_volume: volumeTo,
			stop_price: stopPriceTo,
			profit_price: takeProfitTo,
			symbols: symBols,
			exchanges: exChange,
			life_time: lifeTime
		} = orderTo;
		const { takeprofit_trigger_price: takeProfitFrom } =
			data.takeprofit_order_info || {};
		const { stoploss_trigger_price: stopPriceFrom } =
			data.stoploss_order_info || {};
		const { limit_price: priceFrom, remaining_quantity: volumeFrom } = data;
		const [ShadowRowInfoPrice, onLayout] = useShadow();
		return (
			<View onLayout={onLayout}>
				<ButtonBySell
					isBuy={isBuy}
					value={symbolClass}
					symbol={displayName}
					companyName={companyName}
				/>
				<ShadowRowInfoPrice />
				<View style={{ paddingBottom: 8 }}>
					<View style={{ paddingRight: 16, paddingTop: 8 }}>
						<RowFromTo />
					</View>
					{Boolean(data.ct_trigger_price) && <RowContingentInfo data={data} newData={newOrder} />}
					<RowOutstandingVolume
						volumeFrom={volumeFrom}
						volumeTo={getValueToVolume(volumeFrom, volumeTo)}
					/>
					{isShowPrice(orderType) ? (
						<RowPrice
							toCurrency={fromCurrency}
							priceFrom={priceFrom}
							priceTo={getValueToPrice(priceFrom, limitPrice)}
						/>
					) : null}
					{isShowTradingPrice({
						stopPrice: stopPriceTo,
						takeProfitLoss: takeProfitTo
					}) && [
						<RowStopPrice
							toCurrency={fromCurrency}
							stopPriceFrom={stopPriceFrom}
							stopPriceTo={getValueToStopPrice(
								stopPriceFrom,
								stopPriceTo
							)}
						/>,
						<RowTakeProfit
							toCurrency={fromCurrency}
							takeProfitFrom={takeProfitFrom}
							takeProfitTo={getValueToTakeProfitLossPrice(
								takeProfitFrom,
								takeProfitTo
							)}
						/>
					]}
				</View>
			</View>
		);
	}
);
function mapStateToProps(state) {
	return {
		newOrder: state.newOrder,
		orderType: state.newOrder.orderType.key,
		isBuy: state.newOrder.isBuy,
		limitPrice: state.newOrder.limitPrice,
		triggerPrice: state.newOrder.triggerPrice,
		duration: state.newOrder.duration,
		destination: state.newOrder.destination,
		quantity: state.newOrder.quantity,
		symbol: state.newOrder.symbol,
		exchange: state.newOrder.exchange,
		expiryTime: state.newOrder.expiryTime
	};
}
export default connect(mapStateToProps)(RowOutstanding);

const styles = StyleSheet.create({});
