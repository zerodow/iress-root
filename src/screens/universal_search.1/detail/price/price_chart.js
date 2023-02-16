import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import Chart from '~s/line_chart/line_chart';
import ChartNew from '~s/candle_stick_volume_chart/candle_stick_volume_chart';
import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ProgressBar from '~/modules/_global/ProgressBar';
import styles from '~s/trade/style/trade';
import PriceChartActions from './price_chart.reducer';
import * as Business from '~/business';
import AppState from '~/lib/base/helper/appState2';
import PriceActions from './price.reducer';

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;

class PriceChart extends PureComponent {
	constructor(props) {
		super(props);
		this.props.getSnapshot();
		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.appState = new AppState(() => {
			this.props.subHistorical();
			this.props.getSnapshot();
		});
	}
	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;

		if (changeSymbol || changeNerworkState) {
			this.props.subHistorical();
			nextProps.getSnapshot();
		}
	};
	onNavigatorEvent(event) {
		switch (event.id) {
			case 'search_refresh':
			case 'willAppear':
				this.props.getSnapshot();
				break;
			case 'didAppear':
				this.props.subHistorical();
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				this.props.unsubHistorical();
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}

	renderChart() {
		const {
			symbol,
			filterType,
			maxValue,
			minValue,
			listData,
			labelsP,
			labelLength,
			point
		} = this.props;
		return (
			<Chart
				isAuBySymbol={Business.isParitech(symbol)}
				testId={`${symbol}%Chart`}
				data={listData}
				code={symbol}
				labels={labelsP}
				axisMaximum={maxValue + point}
				axisMinimum={minValue - point}
				formater={'#0.00'}
				touchEnabled={true}
				labelCount={Enum.LABEL_COUNT}
				isChartDay={filterType === PRICE_FILL_TYPE._1D}
				labelLength={labelLength}
			/>
		);
	}
	renderCharNew() {
		const {
			symbol,
			filterType,
			labelLength,
			labelsM,
			listVolume,
			listColor,
			listCandle,
			maxRight,
			maxLeft,
			minRight
		} = this.props;
		return (
			<ChartNew
				isAuBySymbol={Business.isParitech(symbol)}
				testId={`${symbol}$ChartWL`}
				listData={listCandle}
				listColor={listColor}
				listVolume={listVolume}
				labels={labelsM}
				maxRight={maxRight}
				maxLeft={maxLeft}
				minRight={minRight}
				touchEnabled={true}
				isChartDay={filterType === PRICE_FILL_TYPE._1D}
				labelLength={labelLength}
			/>
		);
	}

	render() {
		const { chartType, isLoading } = this.props;
		let content = (
			<View style={[CommonStyle.progressBarWhite]}>
				<ProgressBar />
			</View>
		);

		if (!isLoading) {
			if (chartType === '$') {
				content = this.renderCharNew();
			} else {
				content = this.renderChart();
			}
		}
		return <View style={styles.chartContainer}>{content}</View>;
	}
}

const mapStateToProps = state => {
	const {
		chartType,
		filterType,
		listData,
		labelsP,
		labelLength,
		labelsM,
		listVolume,
		listColor,
		listCandle,
		maxRight,
		maxLeft,
		minRight,
		isLoading,
		point,
		maxValue,
		minValue
	} = state.priceChart;
	return {
		chartType,
		filterType,
		listData,
		labelsP,
		labelLength,
		labelsM,
		listVolume,
		listColor,
		listCandle,
		maxRight,
		maxLeft,
		minRight,
		isLoading,
		point,
		isConnected: state.app.isConnected,
		symbol: state.searchDetail.symbol,
		maxValue,
		minValue
	};
};

const mapDispatchToProps = dispatch => ({
	getSnapshot: (...p) =>
		dispatch(PriceChartActions.priceChartGetSnapshot(...p)),
	subHistorical: (...p) => dispatch(PriceActions.priceUniSubHistorical(...p)),
	unsubHistorical: (...p) =>
		dispatch(PriceActions.priceUniUnsubHistorical(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PriceChart);
