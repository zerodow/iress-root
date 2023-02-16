import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import isEqual from 'react-fast-compare';

import CommonStyle from '~/theme/theme_controller';
import { useShadow } from '~/component/shadow/SvgShadowCustom.js';
import * as FuncUtil from '~/lib/base/functionUtil';

import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';

import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
import ENUM from '~/enum';
const { PRICE_DECIMAL } = ENUM;
const RectRow = ({ isReverse, value1, value2 }) => {
	const color = isReverse ? CommonStyle.color.sell : CommonStyle.color.buy;
	let backgroundColor = _.replace(color, 'rgb', 'rgba');
	backgroundColor = _.replace(backgroundColor, ')', ', 0.2)');
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	return (
		<View
			style={{
				flex: 1,
				flexDirection: isReverse ? 'row-reverse' : 'row',
				backgroundColor,
				justifyContent: 'space-between',
				alignItems: 'center',
				borderTopLeftRadius: isReverse ? 0 : 8,
				borderTopRightRadius: isReverse ? 8 : 0,
				paddingHorizontal: 8,
				paddingVertical: 4,
				paddingTop: 12
			}}
		>
			<TextLoading
				isLoading={isLoadingErrorSystem}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite
				}}
			>
				{value1}
			</TextLoading>
			<TextLoading
				isLoading={isLoadingErrorSystem}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font13,
					color
				}}
			>
				{value2}
			</TextLoading>
		</View>
	);
};

const Titles = () => (
	<View style={{ flexDirection: 'row', paddingBottom: 8 }}>
		<View style={{ flex: 1, alignItems: 'flex-end' }}>
			<Text
				style={{
					paddingRight: 8,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite,
					opacity: 0.7
				}}
			>
				BID
			</Text>
		</View>
		<View style={{ flex: 1 }}>
			<Text
				style={{
					paddingLeft: 8,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite,
					opacity: 0.7
				}}
			>
				ASK
			</Text>
		</View>
	</View>
);

const SizeBar = ({ bidPrice, askPrice }) => {
	const bidPercent = _.floor((bidPrice / (bidPrice + askPrice)) * 100, 2);
	const askPercent = 100 - bidPercent;
	return (
		<View
			style={{
				flexDirection: 'row',
				position: 'absolute',
				width: '100%'
			}}
		>
			<View
				style={{
					width: bidPercent + '%',
					height: 8,
					borderTopLeftRadius: 8,
					borderBottomLeftRadius: 8,
					backgroundColor: CommonStyle.color.buy
				}}
			></View>
			<View
				style={{
					width: askPercent + '%',
					height: 8,
					borderTopRightRadius: 8,
					borderBottomRightRadius: 8,
					backgroundColor: CommonStyle.color.sell
				}}
			></View>
		</View>
	);
};

const BestBidAsk = ({ exchange, symbol }) => {
	const quote = useSelector(
		(state) => state.quotes.data[symbol + '#' + exchange] || {},
		isEqual
	);
	const {
		ask_price: askPrice,
		ask_size: askSize,
		bid_price: bidPrice,
		bid_size: bidSize
	} = quote;

	const [ShadowView, onLayout] = useShadow();
	// const decimal = getDecimalPriceBySymbolExchange({ exchange, symbol })
	const decimal = getDecimalPriceBySymbolExchange({ exchange, symbol });
	return (
		<View
			style={{
				zIndex: 9999999
			}}
		>
			<ShadowView />
			<View
				onLayout={onLayout}
				style={{
					backgroundColor: CommonStyle.color.dark,
					width: '100%',
					padding: 8,
					zIndex: 9999
				}}
			>
				<Titles />
				<View
					style={{
						flexDirection: 'row'
					}}
				>
					<RectRow
						value1={FuncUtil.formatNumberNew2(
							bidSize,
							PRICE_DECIMAL.VOLUME
						)}
						value2={FuncUtil.formatNumberPrice(bidPrice, decimal)}
					/>
					<RectRow
						isReverse
						value1={FuncUtil.formatNumberNew2(
							askSize,
							PRICE_DECIMAL.VOLUME
						)}
						value2={FuncUtil.formatNumberPrice(askPrice, decimal)}
					/>
					<SizeBar bidPrice={bidSize} askPrice={askSize} />
				</View>
			</View>
		</View>
	);
};

export default BestBidAsk;
