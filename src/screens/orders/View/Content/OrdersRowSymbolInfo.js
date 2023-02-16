import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import { getClassTagProperty, getClassBySymbolAndExchange } from '~/business';
import { useSelector, shallowEqual } from 'react-redux';

const Symbol = ({ symbol, exchange }) => {
	return (
		<View
			style={{
				marginRight: 4
			}}
		>
			<Text
				style={{
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font11,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
			>
				{`${symbol}.${exchange}`}
			</Text>
		</View>
	);
};

const SymbolClass = ({ symbol, exchange }) => {
	const [classSymbol, setClassSymbol] = useState(() => {
		return getClassBySymbolAndExchange({ symbol, exchange });
	});
	const isSyncSymbolinfo = useSelector(
		(state) => state.orders.isSyncSymbolinfo,
		shallowEqual
	);
	useEffect(() => {
		if (isSyncSymbolinfo) {
			const classSymbol = getClassBySymbolAndExchange({
				symbol,
				exchange
			});
			setClassSymbol(classSymbol);
		}
	}, [isSyncSymbolinfo, symbol, exchange]);
	if (!classSymbol) return null;
	const { text, color } = getClassTagProperty({ classSymbol });
	return (
		<View
			style={{
				backgroundColor: color,
				paddingHorizontal: 5,
				paddingVertical: 2,
				alignItems: 'center',
				justifyContent: 'center',
				borderRadius: 7
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

const OrdersSymbolInfo = ({ symbol, exchange }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center'
			}}
		>
			<Symbol symbol={symbol} exchange={exchange} />
			<SymbolClass symbol={symbol} exchange={exchange} />
		</View>
	);
};

export default OrdersSymbolInfo;
