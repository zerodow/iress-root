import React, { Component, PropTypes } from 'react';
import { View, processColor, PixelRatio, Text, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import styles from './style/line_chart_new';
// import ChartView from 'react-native-highcharts';
import ProgressBar from '../../modules/_global/ProgressBar';
import {
	formatNumber,
	logAndReport,
	formatNumberNew2,
	renderTime
} from '../../lib/base/functionUtil';
import moment from 'moment';
import { dataStorage } from '../../storage';
import * as Controller from '../../memory/controller';
import * as Animatable from 'react-native-animatable'

const { height, width } = Dimensions.get('window');

const color = {
	line1: '#57E1F1',
	line2: '#FD3754',
	grid: '#7c7b7b',
	hide: '#ffffff00'
}

const fakeData1 = [100, 21.46, 25.77, 25.4, 25.31, 25.19, 25.63, 25.97, 28.1, 28.43, -0.01, -0.06, 0.09, -0.02, 0.02, 0.03, -0, 2.77, 2.77, 2.77, 2.77, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0]
const fakeData2 = [100, 100.92, 100.92, 102.1, 101.26, 101.57, 101.9, 100.62, 101.15, 101.69, 101.77, 103.2, 102.88, 102.81, 102.55, 103.54, 104.03, 104.15, 103.65, 104.03, 104.24, 104.41, 104.49, 104.79, 104.63, 105.15, 105.36, 105.7, 105.64, 104.99, 104.54, 104.54, 104.77, 105.58, 104.04, 101.86, 102.25, 103.02]
const fakeData3 = ['16 Aug 2019 10:00', '19 Aug 2019 10:00', '20 Aug 2019 10:00', '21 Aug 2019 10:00', '22 Aug 2019 10:00', '23 Aug 2019 10:00', '26 Aug 2019 10:00', '27 Aug 2019 10:00', '28 Aug 2019 10:00', '29 Aug 2019 10:00', '30 Aug 2019 10:00', '02 Sep 2019 10:00', '03 Sep 2019 10:00', '04 Sep 2019 10:00', '05 Sep 2019 10:00', '06 Sep 2019 10:00', '09 Sep 2019 10:00', '10 Sep 2019 10:00', '11 Sep 2019 10:00', '12 Sep 2019 10:00', '13 Sep 2019 10:00', '16 Sep 2019 10:00', '17 Sep 2019 10:00', '18 Sep 2019 10:00', '19 Sep 2019 10:00', '20 Sep 2019 10:00', '23 Sep 2019 10:00', '24 Sep 2019 10:00', '25 Sep 2019 10:00', '26 Sep 2019 10:00', '27 Sep 2019 10:00', '30 Sep 2019 10:00', '01 Oct 2019 10:00', '02 Oct 2019 10:00', '03 Oct 2019 10:00', '04 Oct 2019 10:00', '07 Oct 2019 11:00', '08 Oct 2019 11:00']

export class LineChartNew extends Component {
	constructor(props) {
		super(props);
		this.isFirst = true
		this.caculatorPadding = this.caculatorPadding.bind(this);
		this.convertArrayDate = this.convertArrayDate.bind(this);
		this.state = {
			listAccountBalance: this.props.accountBalance || fakeData1,
			listAllOrdinaries: this.props.allOrdinaries || fakeData2,
			listDate: this.props.listDate || fakeData3,
			isloading: props.isLoading || true
		};
	}

	componentWillReceiveProps(nextProps) {
		if (
			nextProps &&
			(nextProps.accountBalance ||
				nextProps.allOrdinaries ||
				nextProps.listDate)
		) {
			if (this.isFirst && !nextProps.isLoading && this.state.isLoading) {
				dataStorage.animationHoldings === 'fadeIn' && this.view && this.view.fadeInDown(500)
				this.isFirst = false
			}
			this.setState({
				listAccountBalance: nextProps.accountBalance,
				listAllOrdinaries: nextProps.allOrdinaries,
				listDate: nextProps.listDate,
				isLoading: nextProps.isLoading
			});
		}
	}

	onMessage(event) {
		this.setState({ index: event.nativeEvent.data });
	}

	convertArrayDate(arrayDateOriginal) {
		const arrayDate = [];
		arrayDateOriginal.forEach(element => {
			arrayDate.push(element);
		});
		return arrayDate;
	}

	caculatorPadding() {
		const padding = [];
		const maxAccountBalance = Math.max(...this.state.listAccountBalance);
		const maxAllOrdinaries = Math.max(...this.state.listAllOrdinaries);
		const minAccountBalance = Math.min(...this.state.listAccountBalance);
		const minAllOrdinaries = Math.min(...this.state.listAllOrdinaries);
		const minData = Math.min(minAccountBalance, minAllOrdinaries);
		const maxData = Math.max(maxAccountBalance, maxAllOrdinaries);
		const paddingTop = 0.05 * ((maxData - minData) / 0.9);

		padding.push(maxData + paddingTop);
		padding.push(minData - paddingTop);
		return padding;
	}

	render() {
		const chartProps = Platform.OS === 'ios' ? { originWhitelist: ['*'] } : {}
		const padding = this.caculatorPadding();
		var conf = {
			credits: {
				enabled: false
			},
			exporting: {
				enabled: false
			},
			chart: {
				backgroundColor: 'transparent',
				zoomType: 'xy',
				events: {
					click: function (e) {
						var point = this.series[0].searchPoint(e, true);
						setTimeout(function () {
							window.postMessage(point.index, '*');
						}, 800);
					}
				},
				marginRight: 0,
				marginLeft: 40
			},
			title: {
				text: ''
			},
			xAxis: {
				visible: false,
				categories: this.convertArrayDate(this.state.listDate),
				type: 'datetime',
				gridLineWidth: 0,
				lineWidth: 0,
				crosshair: {
					width: 1,
					zIndex: 9999
				},
				min: 0.5,
				max: this.state.listDate.length ? this.state.listDate.length - 1 - 0.5 : 35
			},
			yAxis: {
				visible: true,
				tickLength: 50,
				tickColor: this.state.isLoading ? color.hide : color.grid,
				tickWidth: 0.5,
				tickPosition: 'outside',
				// opposite: true,
				gridLineColor: this.state.isLoading ? color.hide : color.grid,
				gridLineDashStyle: 'Solid',
				gridLineWidth: 0.5,
				endOnTick: false,
				startOnTick: false,
				max: padding[0] || 100,
				min: padding[1] || 0,
				title: {
					text: ''
				},
				labels: {
					enabled: true,
					step: 1,
					align: 'left',
					x: -35,
					y: -8,
					style: {
						fontSize: '10',
						color: this.state.isLoading ? color.hide : 'grey'
					},
					// align: 'right',
					formatter: function () {
						const newValue = parseInt(Math.abs(this.value));
						if (newValue > 1000) {
							const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
							const suffixNum = Math.floor(
								(('' + newValue).length - 1) / 3
							);
							let pow = 1;
							const unit = 1000;
							for (let i = 1; i <= suffixNum; i++) {
								pow = pow * unit;
							}
							let shortValue = parseFloat(
								suffixNum !== 0 ? this.value / pow : this.value
							);
							shortValue = Math.round(shortValue * 100) / 100;
							if (shortValue % 1 === 0) {
								shortValue = parseInt(shortValue);
							}
							return `${shortValue}${suffixes[suffixNum]}%`;
						}
						return `${this.value}%`;
					}
				},
				minorGridLineWidth: 0.5,
				plotLines: [
					{
						value: 100,
						color: '#0000001e',
						width: 0.8,
						label: {
							style: {
								color: 'grey',
								fontSize: CommonStyle.fontSizeXS
							},
							text: ''
						},
						zIndex: 4
					}
				]
			},
			legend: {
				enabled: false
			},
			tooltip: {
				enabled: true,
				shared: true,
				useHTML: true,
				shadow: true,
				followPointer: true,
				borderWidth: 0,
				borderRadius: 0,
				crosshairs: true,
				headerFormat:
					'<div style="width: 200px; text-align: center; font-size: 11px; color: #485465">{point.key}</div><table style="width: 200px">',
				pointFormat:
					'<tr><td><div style="width: 4px; height: 4px; border-radius: 4px; background: {series.color}"></div></td><td><div style="color: #485465; font-size: 11px; width: 100px">{series.name}</div></td><td><div style="width: 60px; text-align: right; font-size: 11px; color #485465">{point.y}</div></td></tr>',
				footerFormat: '</table>',
				valueDecimals: 2,
				valuePrefix: '',
				valueSuffix: ' %',
				style: {
					zIndex: 99,
					marginHorizontal: 16
				}
			},
			plotOptions: {
				series: {
					connectNulls: true
				},
				spline: {
					lineWidth: 1.5,
					marker: {
						enabled: false,
						radius: 0
					}
				},
				areaspline: {
					lineWidth: 0,
					marker: {
						enabled: false,
						radius: 0
					}
				}
			},
			series: [
				{
					type: 'spline',
					states: {
						hover: {
							lineWidthPlus: 0
						}
					},
					name: I18n.t('portfolio'),
					data: this.state.listAccountBalance,
					color: this.state.isLoading === false ? color.line1 : color.hide
				},
				{
					type: 'spline',
					name: I18n.t('allOrdinaries'),
					color: this.state.isLoading === false ? color.line2 : color.hide,
					data: this.state.listAllOrdinaries
				}
			]
		};
		return (
			<View
				style={{
					width: '100%',
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
				<Animatable.View
					ref={ref => this.view = ref}
					useNativeDriver
					style={{
						alignSelf: 'flex-end',
						flexDirection: 'row',
						width: '60%',
						position: 'absolute',
						top: 0,
						justifyContent: 'flex-end',
						alignItems: 'flex-end',
						right: 16
					}}
				>
					{
						<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 32 }}>
							<View
								style={[
									styles.circle,
									{ backgroundColor: this.state.isLoading === false ? color.line1 : 'transparent' }
								]}
							/>
							<Text
								style={{
									opacity: this.state.isLoading === false ? 1 : 0,
									fontSize: CommonStyle.font11,
									color: '#485465'
								}}
							>
								{I18n.t('portfolio')}
							</Text>
						</View>
					}
					{
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<View
								style={[
									styles.circle,
									{ backgroundColor: this.state.isLoading === false ? color.line2 : 'transparent' }
								]}
							/>
							<Text
								style={{
									opacity: this.state.isLoading === false ? 1 : 0,
									fontSize: CommonStyle.font11,
									color: '#485465'
								}}
							>
								{I18n.t('allOrdinaries')}
							</Text>
						</View>
					}
				</Animatable.View>
				{/* {
					this.state.isLoading === false ? <ChartView
						style={{
							flex: 1,
							paddingTop: 8,
							backgroundColor: 'transparent',
							overflow: 'hidden',
							width: '100%'
						}}
						options=''
						{...chartProps}
						scalesPageToFit={false}
						automaticallyAdjustContentInsets={false}
						config={conf}
					/> : <ProgressBar />
				} */}
			</View>
		);
	}
}

export default LineChartNew;
