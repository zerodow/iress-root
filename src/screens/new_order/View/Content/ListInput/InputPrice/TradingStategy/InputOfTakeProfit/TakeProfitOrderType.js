import React, { useCallback, useEffect, useState } from 'react';
import SelectionButton from '~/component/Selection/SelectionButton.js';
import _ from 'lodash';

import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { changeOrderTypeTP } from '~/screens/new_order/Redux/actions.js';

import I18n from '~/modules/language/';
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';
import * as Bussines from '~/business';
import { createSelector } from 'reselect';
const selectState = createSelector(
	(state) => state.newOrder,
	(newOrder) => ({
		layout: newOrder.layout,
		isLoadingOrderAttribute: newOrder.isLoadingOrderAttribute,
		orderType: newOrder.takeProfitLoss.orderType
	})
);
const TakeProfitOrderType = React.memo(({ disabled, hidden }) => {
	const [listOrderType, setListOrderType] = useState([]);
	const dispatch = useDispatch();
	const changeOrderType = useCallback((p) => {
		dispatch(changeOrderTypeTP(p));
	}, []);
	const { layout, isLoadingOrderAttribute, orderType } = useSelector(
		selectState,
		shallowEqual
	);

	useEffect(() => {
		if (!isLoadingOrderAttribute) {
			const orderTypeMap = AttributeModel.getOrderType(true);
			const tmp = [];
			for (let [key, value] of orderTypeMap) {
				tmp.push({
					key: key,
					label: value
				});
			}
			setListOrderType(tmp);
		} else {
			setListOrderType([]);
		}
	}, [isLoadingOrderAttribute]);

	useEffect(() => {
		if (_.isEmpty(orderType) && !_.isEmpty(listOrderType)) {
			const order = 'MARKET';
			const orderList = _.orderBy(listOrderType, (obj) => {
				return !_.includes(obj.key, order);
			});

			changeOrderType(orderList[0]);
		}
	}, [listOrderType, orderType]);

	if (hidden) return null;

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
});

export default TakeProfitOrderType;
