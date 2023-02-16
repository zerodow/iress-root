import React, { Component } from 'react';
import { StyleSheet, View, processColor } from 'react-native';
import _ from 'lodash';
import { LineChart } from 'react-native-charts-wrapper';
import { connect } from 'react-redux';

import { func as StorageFunc, func, dataStorage } from '~/storage';
import * as FuncUtil from '~/lib/base/functionUtil';
import I18n from '~/modules/language';
import * as Util from '~/util';
import Enum from '~/enum';
import ChartColor from '~/constants/chart_color';
import * as Controller from '~/memory/controller';

const { PRICE_DECIMAL, PRICE_FILL_TYPE, THEME } = Enum;

const STATUS = {
	UP: 'UP',
	DOWN: 'DOWN'
};

const DASHED_COLOR = {
	BORDER: 'rgba(0, 0, 0, 0.3)',
	LIGHT_THEME_BORDER: 'rgba(0, 0, 0, 0.8)',
	DARK_THEME_BORDER: 'rgba(255, 255, 255, 0.8)'
};

class LineChartScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dataChart: [],
			symbol: ''
		};
	}

	componentDidUpdate(prevProps) {
		if (this.props.dataChart !== prevProps.dataChart) this.getDataChart();
	}

	componentDidMount() {
		this.getDataChart();
	}

	getDataChart(props) {
		const { symbol, exchange } = props || this.props;
		storage
			.load({
				key: 'WatchListChart',
				id: `${symbol}#${exchange}`
			})
			.then(res => {
				const data = res[PRICE_FILL_TYPE._1D];
				!!data && this.setState({ dataChart: data, symbol });
			})
			.catch(() => null);
	}

	getStatus(props) {
		const { preClosePrice } = props || this.props;
		const { dataChart } = this.state;
		if (!preClosePrice || _.isEmpty(dataChart)) return STATUS.UP;
		const { close: latestPrice } = _.last(_.values(dataChart));
		return +preClosePrice < +latestPrice ? STATUS.UP : STATUS.DOWN;
	}

	getDashedBorderColor() {
		const borderColor =
			Controller.getThemeColorFromStorage() === THEME.DARK
				? DASHED_COLOR.DARK_THEME_BORDER
				: DASHED_COLOR.LIGHT_THEME_BORDER;
		return processColor(borderColor);
	}

	getBorderColor(status) {
		const borderColorChart =
			status === STATUS.UP
				? ChartColor.UP_COLOR.BORDER
				: ChartColor.DOWN_COLOR.BORDER;
		return borderColorChart
	}

	getGradient(status) {
		const gradientBeginColor =
			status === STATUS.UP
				? ChartColor.UP_COLOR.GRADIENT_BEGIN
				: ChartColor.DOWN_COLOR.GRADIENT_BEGIN;
		const gradientEndColor =
			status === STATUS.UP
				? ChartColor.UP_COLOR.GRADIENT_END
				: ChartColor.DOWN_COLOR.GRADIENT_END;

		return {
			colors: [
				processColor(gradientBeginColor),
				processColor(gradientEndColor)
			],
			positions: [0, 0.5],
			angle: 90,
			orientation: 'BOTTOM_TOP'
		}
	}

	getPreClosePriceData(status) {
		const { preClosePrice, symbol } = this.props;
		const { dataChart } = this.state;
		if (!preClosePrice || _.isEmpty(dataChart)) return null;
		const borderColorChart = this.getBorderColor(status)
		const config = {
			mode: 'LINEAR',
			lineWidth: 0.5,
			drawValues: false,
			drawCircles: false,
			color: processColor(borderColorChart),
			drawFilled: false,
			dashedLine: {
				lineLength: 6,
				spaceLength: 2
			}
		};

		let result = [];
		result.push({
			y: preClosePrice,
			x: 0
		});

		const isAuBySymbol = Util.isAuBySymbol(symbol);
		const now = new Date().getTime();
		const isCloseSession = Util.checkCloseSessionBySymbol(
			now,
			isAuBySymbol
		);
		if (isCloseSession) {
			result.push({
				y: +preClosePrice,
				x: _.size(dataChart) - 1
			});
		} else {
			const size = isAuBySymbol ? 74 : 78;
			result.push({
				y: +preClosePrice,
				x: size
			});
		}

		return {
			values: result,
			label: '',
			config
		};
	}

	getData(status) {
		const { dataChart, symbol } = this.state;
		const sortedData = _.sortBy(_.keys(dataChart));
		const listData = [];
		if (!symbol || dataChart.noData || symbol !== this.props.symbol) {
			return null;
		}

		const displayName = StorageFunc.getDisplayNameSymbol(this.props.symbol);

		_.forEach(sortedData, key => {
			const item = dataChart[key];
			const dataTemp = +item.close;

			const timeStamp = parseInt(key);
			const markerLabelTimeFormat = Util.checkIntervalMarkerLabelTimeFormat(
				'1D'
			);

			const markerTime = FuncUtil.renderTime(
				timeStamp,
				markerLabelTimeFormat
			);
			const value = FuncUtil.formatNumberNew2(
				dataTemp,
				PRICE_DECIMAL.VALUE
			);

			listData.push({
				y: dataTemp,
				// x: timeStamp,
				marker: `${markerTime}\n ${displayName}: ${value}`
			});
		});

		const borderColorChart = this.getBorderColor(status)
		const fillGradient = this.getGradient(status)
		const config = {
			mode: 'LINEAR',
			lineWidth: 2,
			drawValues: false,
			drawCircles: false,
			color: processColor(borderColorChart),
			drawFilled: true,
			fillGradient,
			fillAlpha: 200
		};

		if (_.isEmpty(listData)) return null;
		return {
			values: listData,
			label: '',
			config
		};
	}

	render() {
		const { preClosePrice } = this.props;
		let curData;

		if (preClosePrice) {
			const dataSets = [];
			const status = this.getStatus();
			const tradeData = this.getData(status);
			if (tradeData) {
				dataSets.push(tradeData);
			}

			const preClosePriceData = this.getPreClosePriceData(status);
			if (preClosePriceData && !!tradeData) {
				dataSets.push(preClosePriceData);
			}
			if (!_.isEmpty(dataSets)) {
				curData = dataSets;
			}
		}

		return (
			<LineChart
				animation={{
					durationX: 600,
					easingX: 'EaseInOutCubic'
				}}
				style={styles.chart}
				data={{ dataSets: curData }}
				chartDescription={{ text: '' }}
				legend={{ enabled: false }}
				marker={{ enabled: false }}
				xAxis={{ enabled: false }}
				yAxis={{
					left: { enabled: false },
					right: { enabled: false }
				}}
				noDataText={''}
				drawGridBackground={false}
				viewPortOffsets={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5FCFF'
	},
	chart: {
		height: 50,
		width: 80
	}
});

const mapStateToProps = (state, ownProps) => {
	const { symbol, exchange } = ownProps;

	if (!symbol || !exchange) return { dataChart: null };
	const { chartData } = state.streamMarket;
	const data = (chartData[exchange] && chartData[exchange][symbol]) || {};
	return {
		dataChart: data[PRICE_FILL_TYPE._1D]
	};
};

export default connect(mapStateToProps)(LineChartScreen);
