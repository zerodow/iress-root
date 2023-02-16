import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { Text as TextLoading } from '~/component/loading_component';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

import {
	formatNumberNew2,
	formatNumberPrice
} from '~/lib/base/functionUtil';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
import Enum from '~/enum';
// const x = {
//     'exchange': 'ASX',
//     'symbol': 'BHP',
//     'ask_price': 3666,
//     'ask_size': 3340,
//     'bid_price': 3663,
//     'bid_size': 40875,
//     'change_percent': 2.146042,
//     'change_point': 77,
//     'close': 3588,
//     'high': 3692,
//     'low': 3642,
//     'open': 3655,
//     'trade_price': 3665,
//     'updated': 1602138053000,
//     'volume': 9237972,
//     'previous_close': 3588,
//     'value_traded': 338739040,
//     'indicative_price': 0,
//     'auction_volume': 0,
//     'surplus_volume': 0,
//     'market_vwap': 3667.7231,
//     'total_vwap': 3666.8118,
//     'total_value': 338739040,
//     'total_volume': 9237972,
//     'security_status': 'A',
//     'match_price': 0,
//     'match_volume': 0,
//     'match_pct_movement': null,
//     'match_movement': null,
//     'company_report_code': false
// }

const getWidthPercent = ({ bidSize, askSize }) => {
	const total = bidSize + askSize;
	if (total) {
		return {
			bidWidth: `${(bidSize * 100) / total}%`,
			askWidth: (askSize * 100) / total
		};
	}
	return {
		bidWidth: `0%`,
		askWidth: 0
	};
};
const DayRangerChart = ({
	ask_price: askPrice,
	ask_size: askSize,
	bid_price: bidPrice,
	bid_size: bidSize,
	symbol,
	exchange
}) => {
	// const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })
	const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
	const { bidWidth, askWidth } = getWidthPercent({ bidSize, askSize });
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	let isLoading =
		useSelector((state) => state.newOrder.isLoading) ||
		isLoadingErrorSystem;

	return (
		<View
			style={{
				paddingTop: 8,
				paddingHorizontal: 8,
				paddingBottom: 8
			}}
		>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'center'
				}}
			>
				<Text style={styles.title}>BID</Text>
				<View style={{ width: 16 }} />
				<Text style={styles.title}>ASK</Text>
			</View>
			<View>
				<View style={[{ flexDirection: 'row' }]}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'space-between',
							backgroundColor: CommonStyle.backgroundBid,
							paddingTop: 12,
							paddingBottom: 4,
							paddingLeft: 4,
							paddingRight: 8,
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8
						}}
					>
						<TextLoading
							isLoading={isLoading}
							style={styles.styleSize}
						>
							{formatNumberNew2(
								bidSize,
								Enum.PRICE_DECIMAL.VOLUME
							)}
						</TextLoading>
						<TextLoading
							isLoading={isLoading}
							style={styles.styleBidPrice}
						>
							{formatNumberPrice(bidPrice, decimal)}
						</TextLoading>
					</View>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							justifyContent: 'space-between',
							backgroundColor: CommonStyle.backgroundAsk,
							paddingTop: 12,
							paddingBottom: 4,
							paddingLeft: 8,
							paddingRight: 4,
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8
						}}
					>
						<TextLoading
							isLoading={isLoading}
							style={styles.styleAskPrice}
						>
							{formatNumberPrice(askPrice, decimal)}
						</TextLoading>
						<TextLoading
							isLoading={isLoading}
							style={styles.styleSize}
						>
							{formatNumberNew2(
								askSize,
								Enum.PRICE_DECIMAL.VOLUME
							)}
						</TextLoading>
					</View>
				</View>
				<View
					style={[
						StyleSheet.absoluteFillObject,
						{ height: 8, flexDirection: 'row' }
					]}
				>
					<View
						style={[
							{
								width: bidWidth,
								backgroundColor: CommonStyle.color.buy,
								borderTopLeftRadius: 8,
								borderBottomLeftRadius: 8
							}
						]}
					/>
					<View
						style={[
							{
								flex: 1,
								backgroundColor: isNaN(bidPrice)
									? CommonStyle.color.dusk
									: CommonStyle.color.sell,
								borderTopRightRadius: 8,
								borderBottomRightRadius: 8
							},
							isNaN(bidPrice)
								? {
										borderTopLeftRadius: 8,
										borderBottomLeftRadius: 8
								  }
								: {}
						]}
					/>
				</View>
			</View>
		</View>
	);
};

DayRangerChart.propTypes = {};
DayRangerChart.defaultProps = {};

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		title: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.fontNearLight4
		},
		styleSize: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.fontColor
		},
		styleBidPrice: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.color.buy
		},
		styleAskPrice: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.color.sell
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

export default DayRangerChart;
