import React, { useMemo, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import ENUM from '~/enum';
import I18n from '~/modules/language/';
import CommonStyle from '~/theme/theme_controller';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Animated from 'react-native-reanimated';
import ProgressChart from '~s/orders/Component/ProgressChart';

const { Value } = Animated;
const { SIDE, PRICE_DECIMAL } = ENUM;
const { width: DEVICE_WIDTH } = Dimensions.get('window');

const FilledAndTotalVolume = ({ side, filledQuantity, orderQuantity }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between'
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontColor,
					opacity: 0.5
				}}
			>
				{I18n.t('filled/totalVolume')}
			</Text>
			<Text
				style={{
					flexDirection: 'row'
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color:
							filledQuantity === orderQuantity
								? CommonStyle.fontColor
								: (side + '').toUpperCase() === SIDE.BUY
								? CommonStyle.color.buy
								: CommonStyle.color.sell
					}}
				>
					{formatNumberNew2(filledQuantity, PRICE_DECIMAL.VOLUME)}
				</Text>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{` / ${formatNumberNew2(
						orderQuantity,
						PRICE_DECIMAL.VOLUME
					)}`}
				</Text>
			</Text>
		</View>
	);
};

const Chart = ({ side, filledQuantity = 0, orderQuantity }) => {
	const widthAnimated = useMemo(() => {
		return new Value(0);
	}, []);
	useEffect(() => {
		if (
			filledQuantity === null ||
			filledQuantity === undefined ||
			!orderQuantity
		)
			return;
		let percent = filledQuantity / orderQuantity;
		if ((percent < 0.05) & (percent > 0)) {
			percent = 0.05;
		}
		const width = percent * (DEVICE_WIDTH - 32);
		widthAnimated.setValue(width);
	}, [filledQuantity, orderQuantity]);
	const progressColor =
		(side + '').toUpperCase() === SIDE.BUY
			? CommonStyle.color.buy
			: CommonStyle.color.sell;
	return (
		<ProgressChart
			widthAnimated={widthAnimated}
			maxWidth={DEVICE_WIDTH - 32}
			inProgressColor={progressColor}
			outProgressColor={CommonStyle.color.dusk_tabbar}
			height={8}
		/>
	);
};

const FilledPriceAndPercent = ({
	side,
	filledQuantity,
	orderQuantity,
	filledPrice
}) => {
	const volumePercent = (filledQuantity / orderQuantity) * 100;
	const color =
		(side + '').toUpperCase() === SIDE.BUY
			? CommonStyle.color.buy
			: CommonStyle.color.sell;
	const keyLanguage =
		filledQuantity === orderQuantity
			? 'filledPercentDesc'
			: 'unfilledPercentDesc';
	return (
		<View style={{ width: '100%', alignItems: 'center', marginTop: 4 }}>
			<Text style={{ flexDirection: 'row' }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontTiny,
						color
					}}
				>
					{`${formatNumberNew2(
						volumePercent,
						PRICE_DECIMAL.PERCENT
					)}% `}
				</Text>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontTiny,
						color: CommonStyle.fontColor,
						opacity: 0.5
					}}
				>
					{`${I18n.t(keyLanguage)} `}
				</Text>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontTiny,
						color: CommonStyle.fontColor
					}}
				>
					{formatNumberNew2(filledPrice, PRICE_DECIMAL.IRESS_PRICE)}
				</Text>
			</Text>
		</View>
	);
};

const OrdersDetailFilledQuantity = ({ data }) => {
	const {
		side,
		filled_quantity: filledQuantity,
		order_quantity: orderQuantity,
		avg_price: avgPrice,
		limit_price: limitPrice
	} = data;
	const filledPrice = data.filled_quantity ? avgPrice : limitPrice;
	return (
		<View
			style={{
				marginHorizontal: 16,
				paddingTop: 12,
				paddingBottom: 8
			}}
		>
			<FilledAndTotalVolume
				side={side}
				filledQuantity={filledQuantity}
				orderQuantity={orderQuantity}
			/>
			<Chart
				side={side}
				filledQuantity={filledQuantity}
				orderQuantity={orderQuantity}
			/>
			<FilledPriceAndPercent
				side={side}
				filledQuantity={filledQuantity}
				orderQuantity={orderQuantity}
				filledPrice={filledPrice}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	trapeZoidLeft: {
		zIndex: 99,
		width: 87,
		height: 0,
		borderBottomWidth: 8,
		borderBottomColor: CommonStyle.color.modify,
		borderLeftWidth: 8,
		borderLeftColor: 'transparent',
		borderRightWidth: 50,
		borderRightColor: CommonStyle.color.modify,
		borderStyle: 'solid',
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
		transform: [{ rotate: '180deg' }]
	},
	trapeZoidRight: {
		zIndex: 99,
		width: 87,
		height: 0,
		borderBottomWidth: 8,
		borderBottomColor: CommonStyle.color.dusk,
		borderLeftWidth: 8,
		borderLeftColor: 'transparent',
		borderRightWidth: 50,
		borderRightColor: CommonStyle.color.dusk,
		borderStyle: 'solid',
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
		left: -4
	}
});

export default OrdersDetailFilledQuantity;
