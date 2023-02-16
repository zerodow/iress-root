import React from 'react';
import { View, Text } from 'react-native';
import StopPrice from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/StopPrice.js';
import StopLossQuantity from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfStopLoss/StopLossQuantity.js';
import StopLossLimitPrice from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfStopLoss/StopLossLimitPrice.js';
import StopLossOrderType from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfStopLoss/StopLossOrderType.js';
import StopLossDuration from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfStopLoss/StopLossDuration.js';
import { shallowEqual, useSelector } from 'react-redux';
import { checkDisabledStopPrice } from '~/screens/new_order/Model/OrderEntryModel.js';
import Enum from '~/enum';
export default function ListInputOfStopLoss({ tabs }) {
	const layout = useSelector((state) => state.newOrder.layout, shallowEqual);
	const stoplossEnable = tabs['STOPLOSS'];
	const moreEnable = tabs['MORE_STOPLOSS'];
	let content = [];
	if (stoplossEnable) {
		content = [
			<StopPrice disabled={checkDisabledStopPrice()} />,
			<StopLossOrderType hidden />
		];
		if (moreEnable) {
			content = [
				<StopPrice disabled={checkDisabledStopPrice()} />,
				<StopLossQuantity />,
				<StopLossOrderType />,
				<StopLossLimitPrice />,
				<StopLossDuration />
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
