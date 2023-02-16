import React from 'react';
import _ from 'lodash';
import { StyleSheet } from 'react-native';
import { AreaChart, XAxis } from 'react-native-svg-charts';
import {
	Path,
	Defs,
	LinearGradient,
	Stop,
	Text as SVGText,
	Rect,
	Line
} from 'react-native-svg';
import * as array from 'd3-array';
import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import moment from 'moment-timezone';

import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
import {
	formatNumberNew2,
	formatNumberPrice
} from '~/lib/base/functionUtil';
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;

export const LINECHART_HEIGHT = 211;
export const BOTTOM_OFFSET = 20;
export const CONTENT = { top: 30, bottom: 30, left: 0, right: 0 };

export const getTimeFormat = (type) => {
	if (type === PRICE_FILL_TYPE._1D) {
		return { timeFormatter: 'H', GRANULARITY: 7 };
	} else if (type === PRICE_FILL_TYPE._1W) {
		return { timeFormatter: 'DD', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._1M) {
		return { timeFormatter: 'DD', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._3M) {
		return { timeFormatter: 'MMM', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._6M) {
		return { timeFormatter: 'MMM', GRANULARITY: 7 };
	} else if (type === PRICE_FILL_TYPE._YTD) {
		return { timeFormatter: 'MMM', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._1Y) {
		return { timeFormatter: 'MMM', GRANULARITY: 6 };
	} else if (type === PRICE_FILL_TYPE._3Y) {
		return { timeFormatter: 'MMM', GRANULARITY: 7 };
	} else if (type === PRICE_FILL_TYPE._5Y) {
		return { timeFormatter: 'YYYY', GRANULARITY: 6 };
	} else if (type === PRICE_FILL_TYPE._10Y) {
		return { timeFormatter: 'YYYY', GRANULARITY: 6 };
	} else if (type === PRICE_FILL_TYPE._ALL) {
		return { timeFormatter: 'YYYY', GRANULARITY: 6 };
	} else {
		return { timeFormatter: 'MMM YYYY', GRANULARITY: 6 };
	}
};

const ChartColor = {
	GRADIENT_BEGIN: 0.3,
	GRADIENT_END: 0,
	DOWN_COLOR: {
		BORDER: 'rgb(253, 55, 84)',
		BASE_COLOR: '#f10000'
	},
	UP_COLOR: {
		BORDER: 'rgb(95, 255, 169)',
		BASE_COLOR: '#5cff5c'
	}
};

const FillAsGradient = ({ isUpper, yMin, yMax }) => {
	const stopColor = isUpper
		? ChartColor.UP_COLOR.BASE_COLOR
		: ChartColor.DOWN_COLOR.BASE_COLOR;

	const y2 = 1 - _.floor(yMin / yMax, 4);
	return (
		<Defs>
			<LinearGradient
				id="baseGradient"
				x1="0%"
				y1="0%"
				x2="0%"
				y2={`${y2 * 100 || 100}%`}
			>
				<Stop
					offset="0%"
					stopColor={stopColor}
					stopOpacity={ChartColor.GRADIENT_BEGIN}
				/>
				<Stop
					offset="100%"
					stopColor={stopColor}
					stopOpacity={ChartColor.GRADIENT_END}
				/>
			</LinearGradient>
		</Defs>
	);
};

const HightLightLine = ({ line, isUpper }) => {
	const strokeColor = isUpper
		? ChartColor.UP_COLOR.BORDER
		: ChartColor.DOWN_COLOR.BORDER;
	return <Path fill={'none'} stroke={strokeColor} d={line} strokeWidth={1} />;
};

const CompareLine = ({ x, y, tradePrice, size }) => {
	if (!tradePrice) return null;
	const mappedData = [];
	for (let index = 0; index < size; index++) {
		mappedData.push({
			y: +tradePrice,
			x: index
		});
	}

	return (
		<Line
			x1="0"
			y1={y(+tradePrice)}
			x2={x(size)}
			y2={y(+tradePrice)}
			stroke={'rgb(139, 140, 147)'}
			fill={'none'}
			strokeWidth={2}
			strokeDasharray="7 3"
		/>
	);
};

const TextInfo = ({
	tradePrice,
	width,
	height,
	yMin,
	yMax,
	xMin = 0,
	xMax,
	symbol,
	exchange,
	x
}) => {
	const decimal = getDecimalPriceBySymbolExchange({
		symbol,
		exchange
	});
	const displayYMin = formatNumberPrice(yMin, decimal);
	const displayTradePrice = formatNumberPrice(tradePrice, decimal);
	const displayYMax = formatNumberPrice(yMax, decimal);

	const tradeOffSet = _.size('' + displayTradePrice) * 5;

	const minOffSet = _.size('' + displayYMin) * 5;
	const maxOffSet = _.size('' + displayYMax) * 5;

	const minMaxOffset = Math.max(minOffSet, maxOffSet);

	const y = scale
		.scaleLinear()
		.domain([yMin, yMax])
		.range([height - CONTENT.top, CONTENT.bottom]);
	const yWithoutOffset = scale
		.scaleLinear()
		.domain([yMin, yMax])
		.range([height - 15, 5]);

	const xOfTrade = scale
		.scaleLinear()
		.domain([xMin, xMax])
		.range([tradeOffSet, width - tradeOffSet]);

	const xOfMinMax = scale
		.scaleLinear()
		.domain([xMin, xMax])
		.range([minMaxOffset, width - minMaxOffset]);

	// const xOfMax = scale
	// 	.scaleLinear()
	// 	.domain([xMin, xMax])
	// 	.range([maxOffSet, width - maxOffSet]);

	const widthText = _.size('' + displayTradePrice) * 10;

	return (
		<React.Fragment>
			<SVGText
				alignmentBaseline={'hanging'}
				fill="white"
				originX={x(xMax)}
				stroke="white"
				opacity={0.5}
				textAnchor={'middle'}
				x={xOfMinMax(xMax)}
				y={yWithoutOffset(yMin)}
			>
				{displayYMin}
			</SVGText>

			<SVGText
				alignmentBaseline={'hanging'}
				fill="white"
				originX={x(xMax)}
				stroke="white"
				opacity={0.5}
				textAnchor={'middle'}
				x={xOfMinMax(xMax)}
				y={yWithoutOffset(yMax)}
			>
				{displayYMax}
			</SVGText>

			{!!tradePrice && (
				<Rect
					x={xOfTrade(xMax) - widthText / 2}
					y={y(tradePrice) - 10}
					height="20"
					width={widthText}
					fill={CommonStyle.color.dusk_tabbar}
					rx={8}
					ry={8}
					originX={x(xMax)}
				/>
			)}
			{!!tradePrice && (
				<SVGText
					alignmentBaseline={'hanging'}
					fill="white"
					originX={x(xMax)}
					stroke="white"
					opacity={0.5}
					textAnchor={'middle'}
					x={xOfTrade(xMax)}
					y={y(tradePrice) - 5}
				>
					{displayTradePrice}
				</SVGText>
			)}
		</React.Fragment>
	);
};

const LineChart = ({
	data,
	tradePrice = 0,
	filterType,
	prevClose = 0,
	symbol,
	exchange
}) => {
	const { timeFormatter, GRANULARITY } = getTimeFormat(filterType);

	const formatLabel = (value) =>
		moment
			.tz(data[value] && data[value].Time, Enum.LOCATION.AU)
			.format(timeFormatter);

	const isUpper = tradePrice >= prevClose;

	// const size = 74;

	let size = _.size(data);
	if (filterType === PRICE_FILL_TYPE._1D) {
		size = Math.max(74, _.size(data));
	}

	const yValues = data.map((item) => +item.Close);
	const yExtent = array.extent(yValues);
	const yMin = yExtent[0];
	const yMax = Math.max(yExtent[1], tradePrice);
	return (
		<React.Fragment>
			<AreaChart
				style={{
					height: LINECHART_HEIGHT,
					width: '100%'
				}}
				data={data}
				contentInset={CONTENT}
				xAccessor={({ item, index }) => index}
				yAccessor={({ item }) => +item.Close}
				svg={{ fill: 'url(#baseGradient)' }}
				xMax={filterType === PRICE_FILL_TYPE._1D ? size : undefined}
			>
				<FillAsGradient
					belowChart
					isUpper={isUpper}
					yMin={yMin}
					yMax={yMax}
				/>
				<HightLightLine isUpper={isUpper} />
				<CompareLine
					tradePrice={tradePrice}
					filterType={filterType}
					size={size}
				/>
				<TextInfo
					symbol={symbol}
					exchange={exchange}
					tradePrice={tradePrice}
					filterType={filterType}
					yMin={yMin}
					yMax={yMax}
					xMax={size}
				/>
			</AreaChart>
			<XAxis
				style={{
					marginTop: 10,
					width: '100%',
					height: 30
				}}
				data={data}
				numberOfTicks={GRANULARITY}
				formatLabel={formatLabel}
				contentInset={{
					left: CONTENT.left || 10,
					right: CONTENT.right || 10
				}}
				svg={{ fontSize: 10, fill: 'white' }}
			/>
		</React.Fragment>
	);
};

export default LineChart;

const styles = StyleSheet.create({});
