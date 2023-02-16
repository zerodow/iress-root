import React from 'react';
import { View } from 'react-native';

import CommonStyle from '~/theme/theme_controller';
import OrdersDetailAccount from '~s/orders/View/Detail/OrdersDetailAccount';
import OrdersDetailSymbolInfo from '~s/orders/View/Detail/OrdersDetailSymbolInfo';
import OrdersDetailFilledQuantity from '~s/orders/View/Detail/OrdersDetailFilledQuantity';
import OrdersDetailHistory from '~s/orders/View/Detail/OrdersDetailHistory';
import OrdersStatus from '~s/orders/View/Detail/OrdersStatus';
import NetworkWarning from '~/screens/orders/Component/network_warning_layout_animation.js';
import {
	getOrderStatusProperty,
	getTextInsideCircleProperty
} from '~s/orders/Controller/OrdersStatusController';

const OrdersDetail = ({ data, navigator }) => {
	const {
		account_id: accountId = '',
		order_action: orderAction = '',
		action_status: actionStatus = '',
		error_description: errorDescription,
		has_stoploss: isStoploss,
		has_takeprofit: isTakeProfit,
		filled_quantity: filledQuantity,
		order_quantity: orderQuantity
	} = data;
	const { stoploss_order_status: SLOrderStatus } =
		data.stoploss_order_info || {};
	const { takeprofit_order_status: TPOrderStatus } =
		data.takeprofit_order_info || {};
	const { backgroundColor } = getOrderStatusProperty({
		orderAction,
		actionStatus
	});
	const { text } = getTextInsideCircleProperty({
		filledQuantity,
		orderQuantity,
		SLOrderStatus,
		TPOrderStatus,
		isStoploss,
		isTakeProfit,
		orderObject: data
	});
	return (
		<View
			style={{ width: '100%', backgroundColor: CommonStyle.color.dark }}
		>
			<NetworkWarning
				backgroundColorBottom={backgroundColor}
				navigator={navigator}
			/>
			<OrdersStatus
				errorDescription={errorDescription}
				orderAction={orderAction}
				actionStatus={actionStatus}
			/>
			<OrdersDetailAccount accountId={accountId} />
			<OrdersDetailSymbolInfo data={data} />
			<OrdersDetailFilledQuantity data={data} />
			<OrdersDetailHistory
				navigator={navigator}
				data={data}
				textInsideCircle={text}
			/>
			{isStoploss && isTakeProfit ? (
				<View style={{ height: 88 + 16 }} />
			) : (
				<View style={{ height: 16 + 24 }} />
			)}
		</View>
	);
};

export default OrdersDetail;
