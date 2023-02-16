import React from 'react';
import { View, Text } from 'react-native';
import OrdersOriginal from '~s/orders/View/Detail/OrdersOriginal';
import StoplossStrategy from '~s/orders/View/Detail/StoplossStrategy';
import TakeProfitStrategy from '~s/orders/View/Detail/TakeProfitStrategy';
import { useShadow } from '~/component/shadow/SvgShadow';
import ShadowTop from '~/component/shadow/index.js';
import CommonStyle from '~/theme/theme_controller';
import Contingent from './Contingent';
const OrdersDetailHistory = ({ data, textInsideCircle }) => {
	const {
		has_stoploss: isStopLoss,
		has_takeprofit: isTakeProfit,
		stoploss_order_info: stopLossData = {},
		takeprofit_order_info: takeProfitData = {},
		side
	} = data;
	return (
		<View>
			<ShadowTop setting={{ radius: 0 }} />
			<View
				style={{
					zIndex: 99999,
					paddingTop: 16,
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
				<Contingent data={data} />
				<OrdersOriginal data={data} />
				<StoplossStrategy
					data={data}
					side={side}
					isStopLoss={isStopLoss}
					stopLossData={stopLossData}
					textInsideCircle={textInsideCircle}
				/>
				<TakeProfitStrategy
					data={data}
					side={side}
					isTakeProfit={isTakeProfit}
					takeProfitData={takeProfitData}
					textInsideCircle={textInsideCircle}
				/>
			</View>
		</View>
	);
};

export default OrdersDetailHistory;
