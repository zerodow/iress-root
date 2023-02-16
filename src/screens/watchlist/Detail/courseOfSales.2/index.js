import React from 'react';
import { Text, View, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import isEqual from 'react-fast-compare';

import Header from './header';
import {
	formatNumber,
	formatNumberNew2,
	renderTime
} from '~/lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller';
import Enum from '~/enum';
import I18n from '~/modules/language';
import Row from './row';
import ErrorStatus from '~s/watchlist/Detail/ErrorStatus';

const Side = ({ side }) => {
	if (side === 'BID') {
		return (
			<Text
				style={[
					CommonStyle.textMain3,
					{
						color: CommonStyle.color.buy,
						fontSize: CommonStyle.font11
					}
				]}
			>
				{I18n.t('side_buy')}
			</Text>
		);
	} else if (side === 'ASK') {
		return (
			<Text
				style={[
					CommonStyle.textMain3,
					{
						color: CommonStyle.color.sell,
						fontSize: CommonStyle.font11
					}
				]}
			>
				{I18n.t('side_sell')}
			</Text>
		);
	} else if (side === 'MATCH') {
		return (
			<Text
				style={[
					CommonStyle.textMain3,
					{
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font11
					}
				]}
			>
				{I18n.t('side_match')}
			</Text>
		);
	}

	return null;
};

const Item = ({ item }) => {
	const { quantity, price, time, side } = item;

	let format = 'HH:mm:ss';
	const displayTime = renderTime(time, format);
	return (
		<React.Fragment>
			<Row>
				<Text
					style={[
						CommonStyle.textMainLight,
						{ fontSize: CommonStyle.font11 }
					]}
				>
					{displayTime}
				</Text>

				<Side side={side} />

				<Text
					style={[
						CommonStyle.textMainNormal,
						{ fontSize: CommonStyle.font11 }
					]}
				>
					{formatNumber(quantity)}
				</Text>

				<Text
					style={[
						CommonStyle.textMain3,
						{ fontSize: CommonStyle.font11 }
					]}
				>
					{formatNumberNew2(price, Enum.PRICE_DECIMAL.IRESS_PRICE)}
				</Text>
			</Row>
			<View
				style={{
					borderBottomWidth: 1,
					borderColor: CommonStyle.fontBorderNewsUi
				}}
			/>
		</React.Fragment>
	);
};

const EmptyComp = ({ onLayout }) => (
	<View
		onLayout={onLayout}
		style={{
			paddingHorizontal: 16,
			height: 205,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: CommonStyle.backgroundColor1
		}}
	>
		<Text
			style={{
				color: CommonStyle.fontColor,
				fontFamily: CommonStyle.fontPoppinsRegular
			}}
		>
			{I18n.t('noData')}
		</Text>
	</View>
);

const CourseOfSales = ({ symbol, exchange, onLayout }) => {
	const { data } = useSelector(
		(state) => ({
			data: state.trades.data[symbol + '#' + exchange]
		}),
		isEqual
	);

	let { trade, status } = data || {};
	// trade = _.values(trade);

	if (status) {
		return (
			<View
				style={{
					paddingHorizontal: 16,
					width: '100%',
					height: 211 + 20 + 25,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<ErrorStatus status={status} title={I18n.t('courseOfSales')} />
			</View>
		);
	}

	if (_.isEmpty(trade)) {
		return <EmptyComp onLayout={onLayout} />;
	}

	return (
		<FlatList
			ref={this.setRef}
			scrollEnabled={false}
			contentContainerStyle={{ paddingHorizontal: 8 }}
			data={trade || []}
			ListHeaderComponent={Header}
			renderItem={Item}
		// ListFooterComponent={this.renderFooter}
		/>
	);
};

export default CourseOfSales;
