import React, { Component } from 'react';
import { processColor, View, Text, Platform } from 'react-native';
import { CandleStickChart } from 'react-native-charts-wrapper';
import _ from 'lodash'

import I18n from '~/modules/language/';
import config from '~/config';
import CommonStyle from '~/theme/theme_controller';
import Enum from '~/enum';
import moment from 'moment-timezone';
import * as Util from '~/util';

const { PRICE_FILL_TYPE, LOCATION } = Enum;

export default class CandleChart extends Component {
	constructor(props) {
		super(props)
		this.state = {
			dicSelectedPoint: {},
			offset: undefined
		}

		if (Platform.OS === 'ios') {
			this.state.offset = {
				top: 15,
				bottom: 15,
				left: 16,
				right: 50
			}
		}
	}

	getData() {
		const { filterType, symbol, listCandle, maxRight, minRight } = this.props
		let maxSize = _.size(listCandle)
		if (filterType === PRICE_FILL_TYPE._1D) {
			const isAuBySymbol = Util.isAuBySymbol(symbol);
			const now = new Date().getTime();
			const isCloseSession = Util.checkCloseSessionBySymbol(
				now,
				isAuBySymbol
			);

			if (!isCloseSession) {
				maxSize = isAuBySymbol ? 74 : 78;
			}
		}

		return {
			maxRight,
			minRight,
			axisMaximum: maxSize,
			data: {
				dataSets: [
					{
						values: listCandle,
						label: I18n.t('candle'),
						config: {
							...config.candleChart,
							highlightColor: processColor('orange'),
							highlightLineWidth: 1
						}
					}
				]
			}

		};
	}

	getTimeSelected = this.getTimeSelected.bind(this)
	getTimeSelected() {
		const { timeStamp } = this.state.dicSelectedPoint
		if (!timeStamp) return '';

		const DAY_FORMAT = 'DD MMM YYYY';
		const TIME_FORMAT = 'HH:mm';
		const LOC = LOCATION.AU;
		const FILTER = this.props.filterType;

		let result = []
		result.push(
			moment.tz(timeStamp, LOC).format(DAY_FORMAT)
		);
		if (
			FILTER === PRICE_FILL_TYPE._1D ||
			FILTER === PRICE_FILL_TYPE._1W ||
			FILTER === PRICE_FILL_TYPE._1M
		) {
			result.push(' ');
			result.push(I18n.t('at'));
			result.push(' ');
			result.push(
				moment.tz(timeStamp, LOC).format(TIME_FORMAT)
			);
		}
		return result.join('');
	}

	getDataSelected = this.getDataSelected.bind(this)
	getDataSelected() {
		const { marker = '' } = this.state.dicSelectedPoint
		return marker
	}

	renderInfo = this.renderInfo.bind(this)
	renderInfo() {
		return (
			<View style={{ width: '100%' }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontBold,
						fontSize: CommonStyle.font10,
						textAlign: 'center',
						color: CommonStyle.fontColor
					}}
				>
					{this.getTimeSelected()}
				</Text>
				<Text
					style={{
						fontFamily: CommonStyle.fontBold,
						fontSize: CommonStyle.font10,
						textAlign: 'center',
						color: CommonStyle.fontColor
					}}
				>
					{this.getDataSelected()}
				</Text>
			</View>
		);
	}

	handleSelect = this.handleSelect.bind(this)
	handleSelect(event) {
		const { data = {} } = event.nativeEvent
		const { marker, timeStamp } = data
		this.setState({
			dicSelectedPoint: {
				marker,
				timeStamp
			}
		})
	}
	setOffset = (offset) => {
		this.setState({ offset: { ...offset, top: 0, bottom: 0 } })
	}

	render() {
		const { axisMaximum, data, maxRight, minRight } = this.getData();
		const granularityY =
			_.floor((maxRight - minRight) / 4, 4) ||
			0;
		return (
			<React.Fragment>
				{/* {this.renderInfo()} */}
				<CandleStickChart
					style={{
						height: 120
					}}
					viewPortOffsets={this.state.offset}
					data={data}
					onSelect={this.handleSelect}
					marker={{
						enabled: false,
						markerColor: processColor('#FFFFFF00'),
						textColor: processColor(CommonStyle.fontColor),
						markerFontSize: 16
					}}
					chartDescription={{ text: '' }}
					legend={{ enabled: false }}
					xAxis={{
						enabled: true,
						// granularity: granularityX,
						drawLabels: true,
						position: 'BOTTOM',
						drawAxisLine: true,
						drawGridLines: true,
						fontFamily: CommonStyle.fontMedium,
						textSize: 9,
						textColor: processColor(CommonStyle.fontColor),
						// valueFormatter,
						axisLineColor: processColor(
							CommonStyle.gridColorHorizontal
						),
						gridColor: processColor(CommonStyle.gridColorHorizontal),
						gridLineWidth: 0.5,
						axisLineWidth: 0.5,
						axisMaximum,
						axisMinimum: 0
					}}
					yAxis={{
						left: {
							enabled: false
						},
						right: {
							axisMaximum: maxRight,
							axisMinimum: minRight,
							drawLabels: true,
							enabled: true,
							drawAxisLine: false,
							axisLineColor: processColor(
								CommonStyle.gridColorHorizontal
							),
							axisLineWidth: 0.5,
							drawGridLines: true,
							gridColor: processColor(
								CommonStyle.gridColorHorizontal
							),
							gridLineWidth: 0.5,
							textColor: processColor(CommonStyle.fontColor),
							textSize: 9,
							fontFamily: CommonStyle.fontMedium,
							position: 'OUTSIDE_CHART',
							labelCountForce: true,
							granularity: granularityY,
							valueFormatter: '   #0.0000',
							avoidFirstLastClipping: false
						}
					}}
				/>
			</React.Fragment>
		);
	}
}
