import React from 'react';
import { View, Text } from 'react-native';
import TakeProfitPrice from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TakeProfitPrice.js';
import TakeProfitQuantity from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfTakeProfit/TakeProfitQuantity.js';
import TakeProfitLimitPrice from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfTakeProfit/TakeProfitLimitPrice.js';
import TakeProfitOrderType from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfTakeProfit/TakeProfitOrderType.js';
import TakeProfitDuration from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfTakeProfit/TakeProfitDuration.js';
import { shallowEqual, useSelector } from 'react-redux';
import { checkDisabledTakeProfitPrice } from '~/screens/new_order/Model/OrderEntryModel.js';

import Enum from '~/enum';
export default function ListInputOfTakeProfit({ tabs }) {
	const layout = useSelector((state) => state.newOrder.layout, shallowEqual);
	const takeProfitEnable = tabs['TAKE_PROFIT'];
	const moreEnable = tabs['MORE_TAKE_PROFIT'];
	let content = [];
	if (takeProfitEnable) {
		content = [
			<TakeProfitPrice disabled={checkDisabledTakeProfitPrice()} />,
			<TakeProfitOrderType hidden />
		];
		if (moreEnable) {
			content = [
				<TakeProfitPrice disabled={checkDisabledTakeProfitPrice()} />,
				<TakeProfitQuantity />,
				<TakeProfitOrderType />,
				<TakeProfitLimitPrice />,
				<TakeProfitDuration />
			];
		}
	}
	return (
		<View
			style={[
				layout === Enum.ORDER_LAYOUT.BASIC
					? {
							paddingHorizontal: 16
					  }
					: { paddingHorizontal: 8 }
			]}
		>
			{content}
		</View>
	);
}
