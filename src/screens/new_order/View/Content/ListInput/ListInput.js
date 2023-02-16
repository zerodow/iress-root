import React, { useEffect, useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useSelector } from 'react-redux';

import OrderType from './OrderType';
import Quantity from './Quantity';
import Duration from './Duration';
import OrderPrice from '~/screens/new_order/View/Content/ListInput/InputPrice/OrderPrice.js';
import LimitPrice from '~/screens/new_order/View/Content/ListInput/InputPrice/LimitPrice.js';
import TradingStrategy from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/Index.js';
import { checkDisabledChangeInput } from '~/screens/new_order/Model/OrderEntryModel.js';
import Enum from '~/enum';

const ListInput = ({ symbol, layout, exchange }) => {
	const isLoading = useSelector(
		(state) => state.newOrder.isLoadingBoxAccount
	);
	const disabled = isLoading || checkDisabledChangeInput();
	const { animatedValue } = useMemo(() => {
		return {
			animatedValue: new Animated.Value(0)
		};
	}, []);

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: 500,
			duration: 500,
			easing: Easing.linear,
			useNativeDriver: true
		}).start(() => {});
	}, []);
	const symbolInfo = {
		symbol,
		exchange
	};

	return (
		<View>
			<View
				style={[
					layout === Enum.ORDER_LAYOUT.BASIC
						? {
								paddingHorizontal: 16
						  }
						: { paddingHorizontal: 8 }
				]}
			>
				<Quantity {...symbolInfo} disabled={disabled} />
				<OrderPrice disabled={disabled} />
				<OrderType {...symbolInfo} disabled={disabled} />
				<LimitPrice {...symbolInfo} disabled={disabled} />
				<Duration {...symbolInfo} disabled={disabled} />
			</View>
			<TradingStrategy {...{ symbol, exchange }} />
		</View>
	);
};
export default ListInput;
