import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import { View, Text } from 'react-native';
import SelectionButton from '~/component/Selection/SelectionButton.js';
import InputDate from '~/screens/new_order/View/Content/ListInput/InputDate.js';

import { connect, useSelector, shallowEqual, useDispatch } from 'react-redux';
import {
	changeDuration as changeDurationOriginal,
	changeDatePeriod,
	changeStatusButtonConfirm
} from '~/screens/new_order/Redux/actions.js';

import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';
import I18n from '~/modules/language/';
import Enum from '~/enum';
import { createSelector } from 'reselect';
import _ from 'lodash';
const { DURATION_CODE } = Enum;
const selectState = createSelector(
	(state) => state.newOrder,
	(newOrder) => ({
		isLoadingOrderAttribute: newOrder.isLoadingOrderAttribute,
		duration: newOrder.duration,
		layout: newOrder.layout
	})
);
function DurationInput(props) {
	const { disabled } = props;
	const { isLoadingOrderAttribute, duration, layout } = useSelector(
		selectState,
		shallowEqual
	);

	const [listDuration, setData] = useState([]);

	const dispatch = useDispatch();
	const changeDuration = useCallback((p, isSelected) => {
		if (isSelected) {
			dispatch(changeStatusButtonConfirm(false));
		}
		dispatch(changeDurationOriginal(p));
	}, []);

	useEffect(() => {
		if (!isLoadingOrderAttribute) {
			const orderDurationMap = AttributeModel.getOrderDuration();
			const tmp = [];
			for (let [key, value] of orderDurationMap) {
				tmp.push({
					key: key,
					label: value
				});
			}
			if (!_.isEmpty(tmp) && _.isEmpty(duration)) {
				changeDuration && changeDuration(tmp[0]);
			}
			setData(tmp);
		}
	}, [isLoadingOrderAttribute]);

	if (
		duration.key === DURATION_CODE.GTT ||
		duration.key === DURATION_CODE.DATE ||
		duration.key === DURATION_CODE.GTD
	)
		return (
			<InputDate
				layout={layout}
				title={I18n.t('lifeTime')}
				data={listDuration}
			/>
		);
	return (
		<SelectionButton
			disabled={disabled}
			layout={layout}
			data={listDuration}
			title={I18n.t('lifeTime')}
			defaultValue={duration}
			onCbSelect={(value, selectedObject) => {
				changeDuration && changeDuration(selectedObject, true);
			}}
		/>
	);
}

export default DurationInput;
