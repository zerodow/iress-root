import React, { useEffect, useMemo } from 'react';
import { View, Text, Keyboard } from 'react-native';
import SelectionButton from '~/component/Selection/SelectionButton.js';

import { connect, useSelector, shallowEqual } from 'react-redux';
import {
	changeOrderType,
	changeOrderTypeObjectSelected
} from '~/screens/new_order/Redux/actions.js';

import {
	getOrderType,
	getDuration,
	getExchange,
	getOrderTypeValue,
	getFormatData
} from '~/screens/new_order/Controller/ContentController.js';
import { setOrderType } from '~/screens/new_order/Model/PriceModel.js';

import I18n from '~/modules/language/';
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';
import * as Bussines from '~/business';
import _ from 'lodash';
function OrderTypeInput(props) {
	const { changeOrderType, disabled } = props;
	const layout = useSelector((state) => state.newOrder.layout, shallowEqual);
	const isLoadingOrderAttribute = useSelector(
		(state) => state.newOrder.isLoadingOrderAttribute,
		shallowEqual
	);
	const orderType = useSelector(
		(state) => state.newOrder.orderType,
		shallowEqual
	);

	useEffect(() => {
		setOrderType(orderType.key);
	}, [orderType]);

	const listOrderType = useMemo(() => {
		if (!isLoadingOrderAttribute) {
			const orderTypeMap = AttributeModel.getOrderType();
			const tmp = [];
			for (let [key, value] of orderTypeMap) {
				if (key === 'CP-Limit') {
					continue;
				}
				tmp.push({
					key: key,
					label: value
				});
			}
			return tmp;
		}
		return [];
	}, [isLoadingOrderAttribute]);

	useEffect(() => {
		if (_.isEmpty(orderType) && !_.isEmpty(listOrderType)) {
			const order = 'LIMIT';
			const orderList = _.orderBy(listOrderType, (obj) => {
				return !_.includes(obj.key, order);
			});

			changeOrderType && changeOrderType(orderList[0]);
		}
	}, [orderType, listOrderType]);

	return (
		<SelectionButton
			disabled={disabled}
			layout={layout}
			data={listOrderType}
			title={I18n.t('orderType')}
			onShow={() => {}}
			onHide={() => {}}
			defaultValue={orderType}
			onCbSelect={(value, selectedObject) => {
				changeOrderType && changeOrderType(selectedObject);
				Bussines.showButtonConfirm && Bussines.showButtonConfirm();
			}}
		/>
	);
}

function mapActionToProps(dispatch) {
	return {
		changeOrderType: (params) => dispatch(changeOrderType(params))
	};
}
export default connect(null, mapActionToProps)(OrderTypeInput);
