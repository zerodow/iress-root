import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AreaChart, XAxis, BarChart } from 'react-native-svg-charts';

import { CONTENT } from './LineChart';

export const BARCHART_HEIGHT = 25;

const BarChartComp = ({ data }) => {
	return (
		<BarChart
			style={{ height: BARCHART_HEIGHT, width: '100%' }}
			data={data}
			svg={{ fill: 'white' }}
			xAccessor={({ item }) => item.Time}
			yAccessor={({ item }) => +item.Volume}
			contentInset={{ left: CONTENT.left, right: CONTENT.right }}
		/>
	);
};

export default BarChartComp;

const styles = StyleSheet.create({});
