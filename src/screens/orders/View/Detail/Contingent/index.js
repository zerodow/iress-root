import { Text, View } from 'react-native';
import React from 'react';

import { Circle } from './Components';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import ENUM from '~/enum';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import { ButtonAmend, ButtonCancel } from '../OrdersOriginal';

const { PRICE_DECIMAL } = ENUM;

const Left = ({ data }) => {
	const { ct_status: status } = data;
	let color = 'rgba(255, 255, 255, 0.2)';
	let statusTitle = I18n.t('triggered');
	if (status === 'ACTIVE') {
		color = CommonStyle.color.process;
		statusTitle = I18n.t('activeLowerCase');
	} else if (status === 'PRE_ACTIVE') {
		color = CommonStyle.color.process;
		statusTitle = 'Pre-Active';
	} else if (status === 'TRIGGERED') {
		color = 'rgba(255, 255, 255, 0.2)';
		statusTitle = I18n.t('triggered');
	} else {
		return <View style={{ width: 110 }} />;
	}

	return (
		<View
			style={{
				alignItems: 'center',
				width: 110
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					textAlign: 'center',
					color
				}}
			>
				{statusTitle}
			</Text>
			{(status === 'ACTIVE' || status === 'PRE_ACTIVE') && (
				<>
					<ButtonAmend data={data} />
					<View
						style={{
							height: 8
						}}
					/>
					<ButtonCancel data={data} />
				</>
			)}
		</View>
	);
};

const Center = ({ data = data }) => {
	const { ct_status: status } = data;

	let color = 'rgba(255, 255, 255, 0.2)';
	if (status === 'ACTIVE' || status === 'PRE_ACTIVE') {
		color = CommonStyle.color.process;
	}

	return (
		<View style={{ alignItems: 'center', width: 16, height: '100%' }}>
			<Circle color={color} />
			<View
				style={{
					position: 'absolute',
					left: 7,
					top: 18,
					bottom: 0,
					width: 1,
					backgroundColor: CommonStyle.color.dusk_tabbar,
					marginTop: 5
				}}
			/>
			<View
				style={{
					width: 10 + 8 + 1,
					height: 1,
					backgroundColor: CommonStyle.color.dusk_tabbar,
					position: 'absolute',
					left: 8,
					bottom: 0
				}}
			/>

			<View
				style={{
					width: 1,
					height: 10,
					backgroundColor: CommonStyle.color.dusk_tabbar,
					position: 'absolute',
					left: 10 + 8 + 8,
					bottom: -10
				}}
			/>
		</View>
	);
};

const Row = ({ label, value }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingHorizontal: 4,
				paddingVertical: 2
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font11,
					opacity: 0.5
				}}
			>
				{label}
			</Text>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.font11
				}}
			>
				{value}
			</Text>
		</View>
	);
};

const getLabelCondition = (condition) => {
	if (condition === 'LESS_OR_EQUAL') {
		return '<=';
	} else if (condition === 'LESS') {
		return '<';
	} else if (condition === 'GREATER') {
		return '>';
	} else if (condition === 'GREATER_OR_EQUAL') {
		return '>=';
	} else {
		return '--';
	}
};
const getLabelPriceBase = (priceBase) => {
	if (priceBase === 'BID') {
		return 'Bid';
	} else if (priceBase === 'LAST') {
		return 'Last';
	} else if (priceBase === 'ASK') {
		return 'Ask';
	} else {
		return '--';
	}
};

const Right = ({ data = {} }) => {
	const {
		ct_price_base: priceBase = '--',
		ct_condition: condition = '--',
		ct_trigger_price: price
	} = data;

	return (
		<View
			style={{
				paddingLeft: 5,
				flex: 1,
				paddingRight: 50
			}}
		>
			<View
				style={{
					minHeight: 16
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font13,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('contingent_trigger')}
				</Text>
			</View>

			<View style={{ paddingVertical: 10 }}>
				<Row
					label={'Price Base'}
					value={getLabelPriceBase(priceBase)}
				/>
				<Row
					label={I18n.t('condition')}
					value={getLabelCondition(condition)}
				/>
				<Row
					label={I18n.t('price')}
					value={formatNumberNew2(price, PRICE_DECIMAL.IRESS_PRICE)}
				/>
			</View>
		</View>
	);
};

const Contingent = ({ data = {} }) => {
	const {
		ct_status: status,
		ct_price_base: priceBase,
		ct_condition: condition,
		ct_trigger_price: price
	} = data;

	if (!status && !priceBase && !condition && !price) {
		return null;
	}

	return (
		<>
			<View
				style={{
					flexDirection: 'row',
					paddingBottom: 15
				}}
			>
				<Left data={data} />
				<Center data={data} />
				<Right data={data} />
			</View>
		</>
	);
};

export default Contingent;
