import React, { Component, PropTypes } from 'react';
import { View, processColor, PixelRatio } from 'react-native';
import { CombinedChart } from 'react-native-charts-wrapper';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

export default class StackedLine extends Component {
	constructor(props) {
		super(props);
				this.state = {
			legend: {
				enabled: false,
				textSize: 14 * CommonStyle.fontRatio,
				textColor: processColor('#00000087'),
				form: 'LINE',
				fontFamily: CommonStyle.fontMedium,
				position: 'BELOW_CHART_CENTER'
			},
			xAxis: {
				enabled: true,
				textColor: processColor('#485465'),
				textSize: 10 * CommonStyle.fontRatio,
				// fontFamily: 'SFUIText',
				// valueFormatter: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
				valueFormatter: this.props.valueFormatter || [],
				position: 'BOTTOM',
				granularityEnabled: true,
				granularity: 1,
				labelCountForce: true,
				drawGridLines: false,
				drawAxisLine: true,
				axisLineColor: processColor('#0000001e'),
				axisLineWidth: 0.5,
				centerAxisLabels: false
			},
			yAxis: {
				left: {
					enabled: true,
					drawAxisLine: false,
					drawGridLines: true,
					gridColor: processColor('#0000001e'),
					gridLineWidth: 0.5,
					textColor: processColor('rgba(0, 0, 0, 0.54)'),
					textSize: 10 * CommonStyle.fontRatio,
					fontFamily: CommonStyle.fontLight,
					position: 'OUTSIDE_CHART',
					labelCount: 5,
					granularity: 1,
					valueFormatter: 'largeValue'
				},
				right: {
					enabled: false
				}
			},
			data: {},
			marker: {
				enabled: true,
				markerColor: processColor('#485465'),
				textColor: processColor('#ffffff'),
				textSize: 11
			}
		};
	}

	componentDidMount() {
		this.setState({
			data: {
				barData: {
					dataSets: [
						{
							values: this.props.holdings || [],
							label: 'Holdings',
							config: {
								drawValues: false,
								colors: [processColor('#10a8b2')]
							}
						},
						{
							values: this.props.cash || [],
							label: 'Cash',
							config: {
								drawValues: false,
								colors: [processColor('#10a8b254')]
							}
						}
					],
					config: {
						barWidth: 0.5
					}
				},
				lineData: {
					dataSets: [
						{
							values: this.props.all || [],
							label: 'ASX ALL ORDS',
							config: {
								drawValues: false,
								colors: [processColor('#00c752')],
								drawCircles: true,
								circleRadius: 4,
								circleColors: [processColor('#00c752')],
								lineWidth: 2,
								axisDependency: 'LEFT'
							}
						}
					]
				}
			}
		});
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<CombinedChart
					style={{ flex: 1, backgroundColor: 'white' }}
					data={this.state.data}
					chartDescription={{ text: '' }}
					legend={this.state.legend}
					xAxis={this.state.xAxis}
					marker={this.state.marker}
					yAxis={this.state.yAxis}
				/>
			</View>
		);
	}
}
