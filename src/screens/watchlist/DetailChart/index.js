import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Text, View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'react-fast-compare';

import OptionButton from './OptionButton';
import I18n from '~/modules/language';
import CommonStyle from '~/theme/theme_controller';
import ProgressBar from '~/modules/_global/ProgressBar';
import ErrorStatus from '../Detail/ErrorStatus';
import Enum from '~/enum';
import LineChart, { LINECHART_HEIGHT } from './LineChart';
import BarChart, { BARCHART_HEIGHT } from './BarChart';
import * as Util from '~/util';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
import { useShadow } from '~/component/shadow/SvgShadow';

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;

let Chart = ({ chartData, filterType, quote, symbol, exchange }) => {
	let data = [];
	const [ShadowLineChart, onLayoutLineChart] = useShadow();
	const [ShadowBarChart, onLayoutBarChart] = useShadow();

	if (chartData && typeof chartData === 'string') {
		const preStr = _.split(chartData, 'Time,Open,High,Low,Close,Volume')[0];
		data = Util.convertCsvToObject(chartData, {
			startLine: _.size(_.split(preStr, '\n'))
		});
	}

	const timeStampCurrentTimeZone =
		Util.getCurrentTimezone() * (60 * 60 * 1000);
	data = _.map(data, (item) => {
		item.Time =
			moment(item.Time, ['DD/MM/YY HH:mm:ss.SSS']).valueOf() +
			timeStampCurrentTimeZone;
		return item;
	});

	if (filterType === PRICE_FILL_TYPE._1D) {
		const lastItem = _.last(data) || {};
		const quoteUpdated = quote.updated + timeStampCurrentTimeZone;
		// !_.isEmpty(lastItem) &&
		// 	quoteUpdated > lastItem.Time &&
		data.push({
			Time: quoteUpdated,
			Open: quote.open,
			High: quote.high,
			Low: quote.low,
			Close: quote.trade_price,
			Volume: quote.volume
		});
	}

	return (
		<React.Fragment>
			<View>
				<ShadowLineChart />
				<View onLayout={onLayoutLineChart}>
					<LineChart
						symbol={symbol}
						exchange={exchange}
						tradePrice={quote.trade_price}
						prevClose={quote.previous_close}
						data={data}
						filterType={filterType}
					/>
				</View>
				<View style={{ height: 5 }} />
			</View>

			<View >
				{/* <ShadowBarChart /> */}
				<View onLayout={onLayoutBarChart}>
					<BarChart data={data} />
					{/* <View style={{ height: 2, backgroundColor: 'black' }} /> */}
				</View>
				{/* <View style={{ height: 5 }} /> */}
			</View>
		</React.Fragment>
	);
};

Chart = React.memo(Chart, (prev, next) => _.isEqual(prev, next));

const DetailChart = ({ symbol, exchange }) => {
	const [nextCallback, setNextCallback] = useState(null);
	const [filterType, setFilterType] = useState(PRICE_FILL_TYPE._6M);
	const dispatch = useDispatch();
	useEffect(() => {
		symbol &&
			exchange &&
			filterType &&
			dispatch.chart.getSnapshot({ symbol, exchange, filterType });
	}, [symbol, exchange, filterType]);

	const quote = useSelector(
		(state) => state.quotes.data[symbol + '#' + exchange] || {},
		isEqual
	);
	const status = quote && quote.code
	const { chartData } = useSelector((state) => {
		const chartData =
			state.chart.data[symbol + '#' + exchange + '#' + filterType] || [];

		return { chartData };
	}, isEqual);
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const isLoading = useSelector(
		(state) => state.loading.effects.chart.getSnapshot
	);

	const is1D = filterType === PRICE_FILL_TYPE._1D;

	useEffect(() => {
		// get snapshot done  = isLoading === false => getSnapShot tiep luon
		if (is1D) {
			if (isLoading) {
				setNextCallback(false);
			} else {
				nextCallback &&
					dispatch.chart.getSnapshot({
						symbol,
						exchange,
						filterType
					});
			}
		}
	}, [is1D, isLoading, nextCallback]);

	useEffect(() => {
		setNextCallback(true);
	}, [quote.trade_price]);

	let content = null;
	if (status) {
		content = (
			<View style={styles.container}>
				<ErrorStatus status={status} title={I18n.t('chart')} />
			</View>
		);
	} else if (
		(!chartData && filterType === PRICE_FILL_TYPE._1D) ||
		(isLoading && filterType !== PRICE_FILL_TYPE._1D)
	) {
		content = (
			<View style={styles.container}>
				<ProgressBar />
			</View>
		);
	} else if (!chartData) {
		content = (
			<View style={styles.container}>
				<Text style={[CommonStyle.textNoData, { alignSelf: 'center' }]}>
					{I18n.t('noData')}
				</Text>
			</View>
		);
	} else {
		content = (
			<Chart
				symbol={symbol}
				exchange={exchange}
				quote={quote}
				chartData={chartData}
				// tradePrice={tradePrice}
				// prevClose={prevClose}
				filterType={filterType}
			/>
		);
	}
	return (
		<View style={{ backgroundColor: CommonStyle.backgroundColor }}>
			<OptionButton onChange={setFilterType} />
			<View
				style={{
					paddingBottom: 4
				}}
			>
				{!isLoadingErrorSystem && content}
				{isLoadingErrorSystem && (
					<View
						style={{
							top: 0,
							bottom: 0,
							left: 0,
							right: 0,
							backgroundColor: CommonStyle.backgroundColor,
							borderWidth: 1,
							justifyContent: 'center',
							alignItem: 'center',
							height: 300
						}}
					>
						<Text
							style={{
								fontFamily: CommonStyle.fontPoppinsRegular,
								fontSize: CommonStyle.fontSizeXXL,
								color: CommonStyle.fontRed,
								textAlign: 'center'
							}}
						>
							Unable to connect to IOS+
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

export default DetailChart;
const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		width: '100%',
		height: LINECHART_HEIGHT + BARCHART_HEIGHT,
		alignItems: 'center',
		justifyContent: 'center'
	}
});
