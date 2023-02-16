import React, { useState } from 'react';
import { StyleSheet, processColor, View, Platform } from 'react-native';
import _ from 'lodash';
import { LineChart } from 'react-native-charts-wrapper';

import { useShadow } from '~/component/shadow/SvgShadow';
import CommonStyle from '~/theme/theme_controller';
import ChartConfig from './config';
import LineChartInfo from './LineChartInfo';

const BOTTOM_OFFSET = 20;

const TradeListChart = ({ preClosePrice, dataChart, symbol, filterType }) => {
	const [config] = useState(() => new ChartConfig());
	const [ShadowView, onLayout] = useShadow();
	console.info(dataChart);
	config.setData({
		preClose: preClosePrice,
		data: dataChart,
		symbol,
		filterType
	});
	const dataSets = config.getData();
	const { maxRight, minRight } = config.getSize();
	const { granularityX, XValueFormatter } = config.getGranularity();
	return (
		<View>
			<View onLayout={onLayout}>
				<LineChart
					style={styles.chart}
					data={{ dataSets }}
					chartDescription={{ text: '' }}
					legend={{ enabled: false }}
					marker={{ enabled: false }}
					xAxis={{
						enabled: true,
						granularity: granularityX,
						drawLabels: true,
						position: 'BOTTOM',
						drawAxisLine: false,
						drawGridLines: false,
						fontFamily: CommonStyle.fontMedium,
						textSize: CommonStyle.fontTiny,
						textColor: processColor(CommonStyle.fontColor),
						valueFormatter: XValueFormatter,
						axisLineColor: processColor(
							CommonStyle.gridColorHorizontal
						),
						gridColor: processColor(
							CommonStyle.gridColorHorizontal
						),
						gridLineWidth: 0.5,
						axisLineWidth: 0.5
					}}
					yAxis={{
						left: { enabled: false },
						right: {
							enabled: true,
							axisMaximum: maxRight,
							axisMinimum: minRight,
							drawGridLines: false,
							drawAxisLine: false,
							drawLabels: false
						}
					}}
					noDataText={''}
					drawGridBackground={false}
					viewPortOffsets={{
						left: 0,
						right: 0,
						top: 0,
						bottom: BOTTOM_OFFSET
					}}
					touchEnabled={false}
					dragEnabled={false}
					scaleEnabled={false}
					scaleXEnabled={false}
					scaleYEnabled={false}
					pinchZoom={false}
					doubleTapToZoomEnabled={false}
					dragDecelerationEnabled={false}
					keepPositionOnRotation={false}
				/>
				<LineChartInfo
					maxValue={maxRight}
					minValue={minRight}
					preClose={preClosePrice}
					bottomOffset={BOTTOM_OFFSET}
				/>
			</View>
			<ShadowView style={{ marginTop: Platform.OS === 'ios' ? 8 : 16 }} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5FCFF'
	},
	chart: {
		height: 211,
		width: '100%'
	}
});

export default TradeListChart;
