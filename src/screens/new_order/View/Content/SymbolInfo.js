import React, { useEffect } from 'react';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getGlobalState } from '~/memory/model';
import SymbolWithPrice from '~/screens/new_order/Components/SymbolWithPrice/SymbolWithPrice.js';
// import DayRangeChart from '~/screens/new_order/Components/Chart/DayRangeChart.js'
import CommonStyle from '~/theme/theme_controller';
const SymbolInfo = ({ children, style, ...rest }) => {
	const layout = useSelector((state) => state.newOrder.layout);
	const { symbol, exchange } = rest;

	const dispatch = useDispatch();

	useEffect(() => {
		if (!symbol || !exchange) return undefined;

		const timmer = setTimeout(() => {
			dispatch.depths.sub({ symbol, exchange });
			dispatch.quotes.sub({ symbol, exchange });
			dispatch.trades.sub({ symbol, exchange });
		}, 200);

		return () => {
			if (!timmer) return;
			clearTimeout(timmer);
			dispatch.depths.unSub({ symbol, exchange });
			dispatch.quotes.unSub({ symbol, exchange });
			dispatch.trades.unSub({ symbol, exchange });
		};
	}, [symbol, exchange]);

	return (
		<View
			style={[
				{
					backgroundColor: CommonStyle.backgroundColor,
					flex: 1,
					paddingBottom: layout === 'BASIC' ? 0 : 8
				}
			]}
		>
			<SymbolWithPrice {...{ symbol, exchange }} />
		</View>
	);
};

export default SymbolInfo;
