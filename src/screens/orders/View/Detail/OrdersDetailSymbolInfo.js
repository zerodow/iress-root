import React from 'react';
import { View, Text, Platform } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import {
	getClassBySymbolAndExchange,
	getCompanyName,
	getClassTagProperty
} from '~/business';
import { useShadow } from '~/component/shadow/SvgShadowCustom';

const SIDE = {
	BUY: 'buy',
	SELL: 'sell'
};

const Side = ({ side }) => {
	const backgroundColor =
		side === SIDE.BUY ? CommonStyle.color.buy : CommonStyle.color.sell;
	const text = side === SIDE.BUY ? I18n.t('side_buy') : I18n.t('side_sell');
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 0,
				width: 31,
				overflow: 'visible',
				backgroundColor: CommonStyle.color.dark
			}}
		>
			<View
				style={{
					width: 62,
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center',
					borderRadius: 31,
					backgroundColor
				}}
			>
				<Text
					style={{
						fontSize: CommonStyle.font17,
						color: CommonStyle.fontBlack,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{text}
				</Text>
			</View>
		</View>
	);
};

const Company = ({ symbol, exchange }) => {
	if (!symbol || !exchange) return null;
	const singleSymbol = symbol.split('.')[0];
	const company =
		getCompanyName({ symbol: singleSymbol, exchange }) ||
		'BHP Biliton Companry';
	return (
		<Text
			numberOfLines={1}
			style={[
				{
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font11,
					fontFamily: CommonStyle.fontPoppinsRegular,
					paddingRight: 8
				},
				Platform.OS === 'android'
					? { lineHeight: CommonStyle.font11 + 4 }
					: {}
			]}
		>
			{company}
		</Text>
	);
};

const Symbol = ({ symbol, exchange }) => {
	return (
		<Text
			style={{
				color: CommonStyle.fontColor,
				fontSize: CommonStyle.font11,
				fontFamily: CommonStyle.fontPoppinsRegular,
				paddingRight: 8
			}}
		>
			{`${symbol}.${exchange}`}
		</Text>
	);
};

const SymbolClass = ({ symbol, exchange }) => {
	if (!symbol || !exchange) return null;
	const singleSymbol = symbol.split('.')[0];
	const classSymbol =
		getClassBySymbolAndExchange({ symbol: singleSymbol, exchange }) ||
		'equity';
	const { text, color } = getClassTagProperty({ classSymbol });
	return (
		<View
			style={{
				backgroundColor: color,
				paddingHorizontal: 5,
				paddingVertical: 2,
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: 7,
				marginRight: 4
			}}
		>
			<Text
				style={{
					color: CommonStyle.fontBlack,
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.font7
				}}
			>
				{text}
			</Text>
		</View>
	);
};

const SymbolInfo = ({ symbol, exchange }) => {
	return (
		<View
			style={{
				marginLeft: 62 + 8,
				justifyContent: 'space-around',
				flex: 1,
				alignItems: 'flex-end'
			}}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<SymbolClass symbol={symbol} exchange={exchange} />
				<Symbol symbol={symbol} exchange={exchange} />
			</View>
			<Company symbol={symbol} exchange={exchange} />
		</View>
	);
};

const OrdersDetailSymbolInfo = ({ data }) => {
	const { side, symbol, exchange } = data;
	const [Shadow, onLayout] = useShadow();
	return (
		<View>
			<Shadow />
			<View
				onLayout={onLayout}
				style={{
					zIndex: 10,
					paddingVertical: 8,
					backgroundColor: CommonStyle.color.dark
				}}
			>
				<View
					style={{
						marginHorizontal: 16,
						height: 62
					}}
				>
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							borderWidth: 1,
							borderRadius: 8,
							borderColor:
								side === SIDE.BUY
									? CommonStyle.color.buy
									: CommonStyle.color.sell
						}}
					>
						<SymbolInfo exchange={exchange} symbol={symbol} />
					</View>
					<Side side={side} />
				</View>
			</View>
		</View>
	);
};

export default OrdersDetailSymbolInfo;
