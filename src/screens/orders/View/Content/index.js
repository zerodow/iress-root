import React, {
	useCallback,
	useRef,
	useEffect,
	useImperativeHandle,
	useMemo
} from 'react';
import { View, Text, Keyboard, TouchableWithoutFeedback } from 'react-native';
import PortfolioAccount from '~s/portfolio/View/Content/PortfolioAccount';
import OrdersTag from '~s/orders/View/Content/OrdersTag';
import OrdersFilter from '~s/orders/View/Content/OrdersFilter';
import OrdersList from '~s/orders/View/Content/OrdersList';
import { shallowEqual, useSelector } from 'react-redux';
import CommonStyle from '~/theme/theme_controller';
import { SearchBar } from '~s/watchlist/Categories/';
import { sortAllCondition } from '~s/orders/Controller/OrdersController';
import { useSearchOrders } from '~s/orders/Hook/';
import { changeTextSearch } from '~s/orders/Model/OrdersModel';
import OrderError from '~/component/Error/OrderError';
import {
	resetOrderId,
	getOrderId
} from '~s/confirm_order/Model/confirmOrderModel';
import { getChannelChangeOrderError } from '~/streaming/channel';
import * as Emitter from '@lib/vietnam-emitter';
import { getType } from '~/screens/new_order/Model/OrderEntryModel.js';
import { dataStorage } from '~/storage';
import Enum from '~/enum';
const { AMEND_TYPE, TYPE_MESSAGE } = Enum;
let Content = (
	{ updateActiveStatus, showHideTabbar, showSearchAccount, showDetail },
	ref
) => {
	const dic = useRef({
		timeout: null
	});
	const orderId = getOrderId();
	const data = useSelector((state) => state.orders.data, shallowEqual);
	const [refSearch, blurSearch, clearText] = useSearchOrders();
	const dataError = useMemo(() => {
		return data.filter((item) => {
			return item.order_id + '' === orderId;
		});
	}, [data, orderId]);
	const errorDescription = useMemo(() => {
		if (dataError && dataError.length !== 0) {
			return dataError[0].error_description;
		}
	}, [data, orderId, dataError]);

	const statusIsOk = useMemo(() => {
		if (dataError && dataError.length !== 0) {
			return dataError[0].action_status === 'OK';
		}
	}, [data, orderId, dataError]);

	// action_status;

	const unMount = useCallback(() => {
		resetOrderId();
		dic.current.timeout && clearTimeout(dic.current.timeout);
	}, []);
	const onChangeText = useCallback((textSearch) => {
		changeTextSearch(textSearch);
		dic.current.timeout && clearTimeout(dic.current.timeout);
		dic.current.timeout = setTimeout(sortAllCondition, 500);
	}, []);
	useEffect(() => {
		const channel = getChannelChangeOrderError();
		if (dataError && dataError.length !== 0 && errorDescription) {
			Emitter.emit(channel, {
				msg: errorDescription,
				autoHide: true,
				type: statusIsOk ? TYPE_MESSAGE.SUCCESS : TYPE_MESSAGE.ERROR
			});
		}
	}, [dataError, orderId, statusIsOk, errorDescription]);
	const clearTextSearch = useCallback(() => {
		clearText && clearText();
	}, []);
	useImperativeHandle(ref, () => {
		return {
			clearTextSearch
		};
	});
	useEffect(() => {
		return unMount;
	}, []);
	return (
		<View style={{ flex: 1 }}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View>
					<PortfolioAccount showSearchAccount={showSearchAccount} />
					<OrdersTag />
					{getType() === AMEND_TYPE.DEFAULT &&
					dataStorage.isShowError ? (
						<OrderError isShowConnected={false} />
					) : null}
					<SearchBar
						ref={refSearch}
						isHideShadow
						onChangeText={onChangeText}
						wrapperStyle={{ paddingTop: 3 }}
					/>
					<View
						style={{
							zIndex: -1,
							paddingTop: 4,
							backgroundColor: CommonStyle.color.dark
						}}
					>
						<OrdersFilter />
					</View>
				</View>
			</TouchableWithoutFeedback>
			<OrdersList
				updateActiveStatus={updateActiveStatus}
				navigator={navigator}
				blurSearch={blurSearch}
				showHideTabbar={showHideTabbar}
				showDetail={showDetail}
			/>
		</View>
	);
};
Content = React.forwardRef(Content);
export default Content;
