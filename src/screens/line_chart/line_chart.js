import React, { Component, PropTypes } from 'react';
import { View, processColor, PixelRatio, Text } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import { logAndReport } from '../../lib/base/functionUtil';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { dataStorage } from '../../storage';
import Enum from '../../enum';
import * as Controller from '../../memory/controller';

export class Chart extends Component {
	constructor(props) {
		super(props);
				this.isAuBySymbol = this.props.isAuBySymbol;
		this.mkDataType = Controller.getLoginStatus()
			? Controller.getMarketDataTypeBySymbol(this.isAuBySymbol)
			: Enum.PRICE_SOURCE.delayed;
		this.state = {
			listData: props.data,
			code: props.code,
			labels: props.labels,
			maximum: props.axisMaximum,
			minimum: props.axisMinimum,
			data: {
				dataSets: [
					{
						values: props.data,
						label: props.code,
						config: {
							lineWidth: 2,
							drawValues: false,
							drawCircles: false,
							highlightColor: processColor(
								CommonStyle.gridColorHorizontal
							),
							color: processColor('#96b9dd'),
							drawFilled: true,
							fillColor: processColor('#96b9dd'),
							fillAlpha: 60,
							valueTextSize: 14 * CommonStyle.fontRatio,
							valueFormatter: props.formater,
							axisDependency: 'RIGHT'
						}
					}
				]
			},
			marker: {
				enabled: true,
				backgroundTint: processColor('#f9f9f9'),
				markerColor: processColor('#f9f9f9'),
				textColor: processColor(CommonStyle.marketTextColor),
				textSize: 14
			},
			legend: {
				enabled: false
			},
			xAxis: {
				position: 'BOTTOM',
				valueFormatter: props.labels || [],
				textColor: processColor(CommonStyle.highlightColorChart),
				textSize: 10 * CommonStyle.fontRatio,
				fontFamily: CommonStyle.fontMedium,
				drawGridLines: false,
				drawAxisLine: true,
				axisLineColor: processColor('black'),
				axisLineWidth: 1,
				labelCountForce: false,
				labelCount: 4,
				granularityEnabled: true,
				drawLimitLinesBehindData: true,
				avoidFirstLastClipping: true,
				centerAxisLabels: false,
				axisMaximum: props.isChartDay
					? props.labelLength
					: props.labels.length - 0.5
			},
			yAxis: {
				right: {
					enabled: true,
					drawAxisLine: false,
					textColor: processColor(CommonStyle.highlightColorChart),
					textSize: 10 * CommonStyle.fontRatio,
					fontFamily: CommonStyle.fontMedium,
					position: 'OUTSIDE_CHART',
					labelCount: props.labelCount,
					labelCountForce: true,
					axisMaximum: props.axisMaximum,
					axisMinimum: props.axisMinimum,
					granularity: 2,
					valueFormatter: props.formater
				},
				left: {
					enabled: false
				}
			}
		};
	}

	// componentWillReceiveProps(nextProps) {
	// 	if (
	// 		nextProps &&
	// 		(nextProps.listData !== this.state.listData ||
	// 			nextProps.axisMinimum !== this.state.minimum ||
	// 			nextProps.axisMaximum !== this.state.maximum ||
	// 			nextProps.labels !== this.state.labels)
	// 	) {
	// 		this.setState({
	// 			listData: nextProps.data,
	// 			code: nextProps.code,
	// 			labels: nextProps.labels,
	// 			maximum: nextProps.axisMaximum,
	// 			minimum: nextProps.axisMinimum,
	// 			data: {
	// 				dataSets: [
	// 					{
	// 						values: nextProps.data,
	// 						label: nextProps.code,
	// 						config: {
	// 							lineWidth: 2,
	// 							drawValues: false,
	// 							drawCircles: false,
	// 							highlightColor: processColor(
	// 								CommonStyle.highlightColorChart
	// 							),
	// 							color: processColor("#96b9dd"),
	// 							drawFilled: true,
	// 							fillColor: processColor("#96b9dd"),
	// 							fillAlpha: 60,
	// 							valueTextSize: 14 * CommonStyle.fontRatio,
	// 							valueFormatter: nextProps.formater,
	// 							axisDependency: "RIGHT"
	// 						}
	// 					}
	// 				]
	// 			},
	// 			marker: {
	// 				enabled: true,
	// 				backgroundTint: processColor("#f9f9f9"),
	// 				markerColor: processColor("#f9f9f9"),
	// 				textColor: processColor(CommonStyle.marketTextColor),
	// 				textSize: 14
	// 			},
	// 			legend: {
	// 				enabled: false
	// 			},
	// 			xAxis: {
	// 				position: "BOTTOM",
	// 				valueFormatter: nextProps.labels || [],
	// 				textColor: processColor(CommonStyle.highlightColorChart),
	// 				textSize: 10 * CommonStyle.fontRatio,
	// 				fontFamily: CommonStyle.fontMedium,
	// 				drawGridLines: false,
	// 				drawAxisLine: true,
	// 				axisLineColor: processColor("black"),
	// 				axisLineWidth: 1,
	// 				labelCountForce: false,
	// 				labelCount: 4,
	// 				granularityEnabled: true,
	// 				drawLimitLinesBehindData: true,
	// 				avoidFirstLastClipping: true,
	// 				centerAxisLabels: false,
	// 				axisMaximum: nextProps.isChartDay
	// 					? nextProps.labelLength
	// 					: nextProps.labels.length - 0.5
	// 			},
	// 			yAxis: {
	// 				right: {
	// 					enabled: true,
	// 					drawAxisLine: false,
	// 					textColor: processColor(
	// 						CommonStyle.highlightColorChart
	// 					),
	// 					textSize: 10 * CommonStyle.fontRatio,
	// 					fontFamily: CommonStyle.fontMedium,
	// 					position: "OUTSIDE_CHART",
	// 					labelCount: nextProps.labelCount,
	// 					labelCountForce: true,
	// 					axisMaximum: nextProps.axisMaximum,
	// 					axisMinimum: nextProps.axisMinimum,
	// 					granularity: 2,
	// 					valueFormatter: nextProps.formater
	// 				},
	// 				left: {
	// 					enabled: false
	// 				}
	// 			}
	// 		});
	// 	}
	// }

	render() {
		return (
			<View testID={this.props.testID} style={{ flex: 1 }}>
				{this.state.listData &&
				this.state.listData.length > 0 &&
				this.mkDataType !== Enum.PRICE_SOURCE.noAccess ? (
					<LineChart
						testID={`${this.props.testID}LineChart`}
						style={{
							flex: 1,
							backgroundColor: CommonStyle.backgroundColor
						}}
						data={this.state.data}
						legend={this.state.legend}
						marker={this.state.marker}
						xAxis={this.state.xAxis}
						yAxis={this.state.yAxis}
						drawGridBackground={false}
						noDataText={'No chart data'}
						drawBorders={false}
						touchEnabled={true}
						dragEnabled={true}
						scaleEnabled={true}
						scaleXEnabled={true}
						scaleYEnabled={true}
						pinchZoom={true}
						doubleTapToZoomEnabled={true}
						chartDescription={{ text: '' }}
						dragDecelerationEnabled={true}
						dragDecelerationFrictionCoef={0.99}
						keepPositionOnRotation={false}
						touchEnabled={this.props.touchEnabled}
						onSelect={this.props.onSelect}
					/>
				) : (
					<View style={CommonStyle.styleChartNodataWrapper}>
						<Text style={CommonStyle.styleChartNodataText}>
							{I18n.t('noChartData')}
						</Text>
					</View>
				)
				//  <LineChart
				//     testID={`${this.props.testID}LineChart`}
				//     style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}
				//     legend={{}}
				//     marker={{}}
				//     xAxis={{}}
				//     yAxis={{}}
				//     drawGridBackground={false}
				//     noDataText={I18n.t('noChartData')}
				//     drawBorders={false}
				//     touchEnabled={true}
				//     dragEnabled={true}
				//     scaleEnabled={true}
				//     scaleXEnabled={true}
				//     scaleYEnabled={true}
				//     pinchZoom={true}
				//     doubleTapToZoomEnabled={true}
				//     chartDescription={{ text: '' }}
				//     dragDecelerationEnabled={true}
				//     dragDecelerationFrictionCoef={0.99}
				//     keepPositionOnRotation={false}
				//     touchEnabled={this.props.touchEnabled}
				//   />
				}
			</View>
		);
	}
}

export default Chart;
