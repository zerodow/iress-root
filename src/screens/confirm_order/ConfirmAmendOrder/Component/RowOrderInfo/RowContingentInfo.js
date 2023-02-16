import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import CommonStyle from '~/theme/theme_controller';
import { calculateLineHeight } from '~/util';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Enum from '~/enum';
import * as ConditionModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
import * as PriceBaseTabModel from '~/screens/new_order/Model/PriceBaseContingentTabModel';
import {
	formatPriceOnBlur,
	getDecimalPriceByRule
} from '~/screens/new_order/Controller/InputController';

const { width } = Dimensions.get('window');
const widthToFrom = (70 / width) * width;

const PRICE_BASE_LABEL = {
	ASK: 'Ask',
	BID: 'Bid',
	LAST: 'Last'
};

const Row = ({ title, from, to }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				width: '100%',
				paddingTop: 8
			}}
		>
			{/* Layout hien dang fix cung width. Hot fix sua nhu the nay! Nen dung flex chia layout */}
			<View
				style={{
					marginLeft: 16,
					width: width - 16 * 2 - 16 * 2 - widthToFrom * 2 - 16,
					paddingRight: 8
				}}
			>
				<Text
					numberOfLines={1}
					style={{
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13,
						opacity: 0.5,
						fontFamily: CommonStyle.fontPoppinsRegular,
						lineHeight: calculateLineHeight(CommonStyle.font13)
					}}
				>
					{title}
				</Text>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					marginRight: 16
				}}
			>
				<View style={{ width: widthToFrom, alignItems: 'flex-end' }}>
					<Text
						style={{
							color: CommonStyle.fontColor,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{from}
					</Text>
				</View>
				<View
					style={{
						width: widthToFrom,
						alignItems: 'flex-end',
						marginLeft: 16
					}}
				>
					<Text
						style={{
							color: CommonStyle.color.modify,
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular
						}}
					>
						{to}
					</Text>
				</View>
			</View>
		</View>
	);
};

const parseCondition = (condition) => {
	if (condition === 'GREATER_OR_EQUAL') {
		return '>=';
	} else if (condition === 'LESS_OR_EQUAL') {
		return '<=';
	} else if (condition === 'LESS') {
		return '<';
	} else return '>';
};

const RowContingentInfo = ({ data = {}, newData = {} }) => {
	const isContingentTypePoint = useSelector(
		(state) => state.newOrder.isContingentTypePoint
	);
	const templateTriggerPrice = useSelector(
		(state) => state.newOrder.templateTriggerPrice
	);

	const toPriceBase =
		data.ct_price_base !== PriceBaseTabModel.model.depth
			? PRICE_BASE_LABEL[PriceBaseTabModel.model.depth]
			: '--';

	const toCondition =
		data.ct_condition !== ConditionModel.model.depth
			? parseCondition(ConditionModel.model.depth)
			: '--';

	const priceDecimal = useRef(getDecimalPriceByRule());

	let fromPrice = data.ct_trigger_price;
	fromPrice = formatPriceOnBlur(fromPrice, priceDecimal.current);
	const realPrice = isContingentTypePoint ? newData.templateTriggerPrice : newData.ctTriggerPrice.value;
	const toPrice =
		(+data.ct_trigger_price !== +realPrice)
			? formatPriceOnBlur(
					realPrice,
					priceDecimal.current
			  )
			: '--';

	return (
		<>
			<Row
				title={'Price Base'}
				from={PRICE_BASE_LABEL[data.ct_price_base]}
				to={toPriceBase}
			/>
			<Row
				title={'Condition'}
				from={parseCondition(data.ct_condition)}
				to={toCondition}
			/>
			<Row title={'Trigger Price'} from={fromPrice} to={toPrice} />
		</>
	);
};

export default RowContingentInfo;

const styles = StyleSheet.create({});
