import React from 'react';
import _ from 'lodash';
// import { LineChart, BarChart } from 'react-native-charts-wrapper';
import { CombinedChart as RNCombinedChart } from 'react-native-charts-wrapper';
import {
	processColor,
	View,
	Text,
	Dimensions,
	Animated,
	TouchableOpacity,
	Platform
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import CommonStyle from '~/theme/theme_controller';
import ChartConfig from './ChartConfig';
import I18n from '~/modules/language/';
import config from '~/config';
import Enum from '~/enum';
import { formatNumber, formatNumberNew2 } from '~/lib/base/functionUtil';
import ChartColor from '~/constants/chart_color';

const CombinedChartAnim = Animated.createAnimatedComponent('RNCombinedChart');

const { PRICE_DECIMAL } = Enum;

const { width: WIDTH_DEVICE } = Dimensions.get('window');

const WHITE_COLOR = 'rgb(255, 255, 255)';

const KEY_ENUM = {
	LINE: 'LINE',
	CANDLE: 'CANDLE'
};

export default class CombinedChart extends ChartConfig {
	constructor(props) {
		super(props);
		this.activeIndex = null;
		// this.onSetting = this.onSetting.bind(this);

		this.onCancel = this.onCancel.bind(this);
		this.onSelect = this.onSelect.bind(this);
		this.opacityAnim = [];
		if (this.props.listVolume && this.props.listVolume.length) {
			this.props.listVolume.map((e, i) => {
				this.opacityAnim[i] = new Animated.Value(0);
			});
		}
		this.WIDTH_CONTAINER = WIDTH_DEVICE - 32 - 58;
		this.totalSize = _.size(this.props.listLineData);
		if (this.totalSize <= 1) {
			this.MAX_WIDTH = this.WIDTH_CONTAINER;
		} else {
			this.MAX_WIDTH = this.WIDTH_CONTAINER / (this.totalSize - 1);
		}
		this.widthChild = new Animated.Value(this.MAX_WIDTH);
		this.widthContainer = new Animated.Value(this.WIDTH_CONTAINER);
		this.translateX = new Animated.Value(0);
		this.opacityAnimChart = new Animated.Value(0);
		this.tranValue = 0;
		this.state = {
			itemSelected: KEY_ENUM.LINE,
			zoomRatio: { scaleX: 1, scaleY: 1, xValue: 0, yValue: 0 }
		};
	}

	getBarChartData() {
		const { listVolume } = this.props;

		const obj = {
			dataSets: []
		};
		if (!_.isEmpty(listVolume)) {
			obj['dataSets'] = [
				{
					values: listVolume,
					label: I18n.t('bar'),
					config: {
						highlightColor: processColor('orange'),
						highlightLineWidth: 1,
						color: processColor('#d8d8d8'),
						drawValues: false,
						axisDependency: 'LEFT'
					}
				}
			];
		}

		obj['config'] = {
			barWidth: 0.75,
			fitBars: false
		};
		return obj;
	}

	getCandleChartData() {
		const { listData } = this.props;
		const obj = {
			dataSets: []
		};
		if (!_.isEmpty(listData)) {
			obj['dataSets'] = [
				{
					values: listData,
					label: I18n.t('candle'),
					config: {
						...config.candleChart,
						...{
							highlightColor: processColor('orange'),
							highlightLineWidth: 1
						}
					}
				}
			];
		}
		return obj;
	}

	getLineChartData(isHover) {
		const {
			maxRight,
			minRight,
			listLineData,
			preClosePrice,
			isChartDay,
			labelLength,
			labels
		} = this.props;
		const obj = {
			dataSets: []
		};

		if (!_.isEmpty(listLineData)) {
			const { y: lastValue } = _.last(listLineData);

			const isUp = lastValue > preClosePrice;
			const borderColorChart = isUp
				? ChartColor.UP_COLOR.BORDER
				: ChartColor.DOWN_COLOR.BORDER;
			const gradientBeginColor = isUp
				? ChartColor.UP_COLOR.GRADIENT_BEGIN
				: ChartColor.DOWN_COLOR.GRADIENT_BEGIN;
			const gradientEndColor = isUp
				? ChartColor.UP_COLOR.GRADIENT_END
				: ChartColor.DOWN_COLOR.GRADIENT_END;

			const xSize = isChartDay ? labelLength : _.size(labels) - 0.5;
			const priceCloseValues = [];
			const listDataLineStatic = [];
			for (let index = 0; index < xSize; index++) {
				priceCloseValues.push({
					y: +preClosePrice,
					marker: listLineData[index] && listLineData[index].marker
				});
				listDataLineStatic.push({
					y: (maxRight + minRight) / 2,
					marker: listLineData[index] && listLineData[index].marker
				});
			}

			obj['dataSets'] = [
				{
					values: listLineData,
					label: 'line',
					config: {
						mode: 'LINEAR',
						lineWidth: isHover ? 3 : 1,
						drawValues: false,
						drawCircles: false,
						color: processColor(
							isHover
								? ChartColor.HOVER_COLOR.BORDER
								: borderColorChart
						),
						highlightColor: processColor(isHover || 'orange'),
						highlightLineWidth: 1,
						drawFilled: true,
						fillGradient: {
							colors: [
								processColor(
									isHover
										? ChartColor.HOVER_COLOR.GRADIENT_BEGIN
										: gradientBeginColor
								),
								processColor(
									isHover
										? ChartColor.HOVER_COLOR.GRADIENT_END
										: gradientEndColor
								)
							],
							positions: [0, 0.5],
							angle: 90,
							orientation: 'BOTTOM_TOP'
						},
						fillAlpha: 1000,
						axisDependency: 'RIGHT'
					}
				},
				{
					values: priceCloseValues,
					label: 'preCloseLine',
					config: {
						mode: 'LINEAR',
						drawValues: false,
						drawCircles: false,
						lineWidth: 1,
						highlightColor: processColor(
							isHover ? ChartColor.HOVER_COLOR.BORDER : 'orange'
						),
						highlightLineWidth: 1,
						color: processColor(
							isHover
								? ChartColor.HOVER_COLOR.BORDER
								: borderColorChart
						),
						drawFilled: false,
						dashedLine: {
							lineLength: 3,
							spaceLength: 1
						},
						axisDependency: 'RIGHT'
					}
				}
			];
		}
		return obj;
	}

	getAllData() {
		const result = {};
		result['barData'] = this.getBarChartData();
		if (this.state.itemSelected === KEY_ENUM.LINE) {
			result['lineData'] = this.getLineChartData();
			result['lineData2'] = this.getLineChartData(true);
		} else {
			result['candleData'] = this.getCandleChartData();
		}
		if (_.isEmpty(result)) return undefined;

		return result;
	}

	onCancel() {
		Navigation.dismissModal({
			animated: false,
			animationType: 'none'
		});
	}

	onSelect({ value }) {
		this.onCancel();
		this.setState({
			itemSelected: value
		});
	}

	onSetting = this.onSetting.bind(this);
	onSetting() {
		const listNewsRepeat = [
			{
				value: KEY_ENUM.LINE,
				key: 'line'
			},
			{
				value: KEY_ENUM.CANDLE,
				key: 'candlestick'
			}
		];
		Navigation.showModal({
			screen: 'equix.PickerBottom',
			animated: false,
			animationType: 'none',
			navigatorStyle: {
				statusBarColor: CommonStyle.statusBarColor,
				navBarHidden: true,
				statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
				screenBackgroundColor: 'transparent',
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				listItem: listNewsRepeat,
				title: I18n.t('chart_type'),
				textBtnCancel: I18n.t('cancel'),
				onCancel: this.onCancel,
				onSelect: this.onSelect,
				onPressBackdrop: this.onCancel,
				numberItem: 2
			}
		});
	}

	handleSelect(event) {
		// this.timerSelect && clearTimeout(this.timerSelect);
		const obj = event.nativeEvent;
		if (!obj) return;
		this.curIndex = obj.x || 1;
		// this.timerSelect = setTimeout(() => {
		if (this.activeIndex === obj.x) return;
		this._chart1 &&
			this._chart1.highlights &&
			typeof this._chart1.highlights === 'function' &&
			this._chart1.highlights([{ x: obj.x }]);
		this._chart2 &&
			this._chart2.highlights &&
			typeof this._chart2.highlights === 'function' &&
			this._chart2.highlights([{ x: obj.x }]);
		let anim1 = null;
		let anim2 = null;
		const listAnim = [];
		if (
			this.activeIndex !== null &&
			this.activeIndex !== undefined &&
			this.opacityAnim[this.activeIndex]
		) {
			anim1 = Animated.timing(this.opacityAnim[this.activeIndex], {
				toValue: 0,
				duration: 0
			});
			listAnim.push(anim1);
		}
		if (
			obj.data &&
			obj.data.marker !== '' &&
			obj.data.marker !== null &&
			this.opacityAnim[obj.x]
		) {
			anim2 = Animated.timing(this.opacityAnim[obj.x], {
				toValue: 1,
				duration: 0
			});

			listAnim.push(anim2);
			this.activeIndex = obj.x;
		}
		listAnim.length && Animated.parallel(listAnim).start();
		// }, 6)
	}

	handleChange(event) {
		let { action, scaleX, scaleY, centerX, centerY } = event;
		switch (action) {
			case 'chartScaled':
				const anim1 = Animated.timing(this.widthContainer, {
					toValue: this.WIDTH_CONTAINER * scaleX,
					duration: 0
				});
				const anim3 = Animated.timing(this.widthChild, {
					toValue: this.MAX_WIDTH * scaleX,
					duration: 0
				});
				const anim2 = Animated.timing(this.translateX, {
					toValue: this.MAX_WIDTH * (scaleX - 1) * this.curIndex,
					duration: 0
				});
				Animated.parallel([anim1, anim2, anim3]).start();
				this.setState({
					zoomRatio: {
						scaleX: scaleX,
						scaleY: scaleY,
						xValue: centerX,
						yValue: centerY
					}
				});
				break;
			case 'chartTranslated':
				Animated.timing(this.translateX, {
					toValue: -centerX,
					duration: 0
				}).start();
				this.setState({
					zoomRatio: {
						scaleX: scaleX,
						scaleY: scaleY,
						xValue: centerX,
						yValue: centerY
					}
				});
				break;
			default:
				break;
		}
	}

	componentWillReceiveProps(nextProps) {
		console.log('ABC');
	}

	getDateMarker() {
		if (_.isEmpty(this.props.listLineData)) return null;
		const content = _.map(this.props.listLineData, (e, i) => {
			const { marker: dateMarker } = e || {};
			return (
				<Animated.View
					style={{
						flex: 1,
						backgroundColor: 'transparent',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						bottom: 0
					}}
				>
					<Animated.Text
						style={{
							textAlign: 'center',
							color: CommonStyle.fontColor,
							opacity: this.opacityAnim[i] || 0
						}}
					>
						{dateMarker || ''}
					</Animated.Text>
				</Animated.View>
			);
		});
		return (
			<Animated.View
				style={{
					backgroundColor: 'transparent',
					justifyContent: 'center',
					alignItems: 'center',
					height: 20,
					paddingLeft: 10,
					width: '100%'
				}}
			>
				{content}
			</Animated.View>
		);
	}

	getMarkerVolume() {
		if (_.isEmpty(this.props.listLineData)) return null;
		const content = _.map(this.props.listLineData, (e, i) => {
			const { y: tradePriceData } = e || {};

			const tradePrice = tradePriceData
				? formatNumber(tradePriceData, PRICE_DECIMAL.IRESS_PRICE)
				: '';
			return (
				<Animated.View
					style={{
						flex: 1,
						width: this.widthChild,
						justifyContent: 'center',
						backgroundColor: 'transparent',
						alignItems: 'center'
					}}
				>
					<Animated.View
						style={{
							flex: 1,
							backgroundColor: 'transparent',
							justifyContent: 'center',
							alignItems: 'center',
							position: 'absolute',
							left: -30,
							right: -30,
							top: 0,
							bottom: 0
						}}
					>
						<Animated.Text
							style={{
								textAlign: 'center',
								color: CommonStyle.fontColor,
								opacity: this.opacityAnim[i] || 0
							}}
						>
							{tradePrice}
						</Animated.Text>
					</Animated.View>
				</Animated.View>
			);
		});

		return (
			<Animated.View
				style={{
					backgroundColor: 'transparent',
					height: 20,
					paddingLeft: 10,
					width: this.widthContainer,
					transform: [{ translateX: this.translateX }],
					flexDirection: 'row'
				}}
			>
				{content}
			</Animated.View>
		);
	}

	onLongPress(e) {
		const index = parseInt((e.nativeEvent.locationX - 10) / this.MAX_WIDTH);
		if (this.props.listLineData[index]) {
			const event = {
				nativeEvent: {
					data: this.props.listLineData[index],
					x: index
				}
			};
			this.handleSelect(event);
		}
		const chart = this._chart2;
		setTimeout(() => {
			chart &&
				chart.highlights &&
				typeof chart.highlights === 'function' &&
				chart.highlights([{ x: index }]);
		}, 20);
		Animated.timing(this.opacityAnimChart, {
			toValue: 1,
			duration: 0
		}).start();
	}

	onPressOut() {
		Animated.timing(this.opacityAnimChart, {
			toValue: 0,
			duration: 0
		}).start();
	}

	overlayStyle(value) {
		if (Platform.OS === 'android') {
			return { elevation: value };
		} else return { zIndex: value };
	}

	render() {
		const data = this.getAllData();
		const { lineData2, ...data1 } = data;
		const data2 = {
			...data1,
			lineData: data.lineData2
		};
		const mutableData = JSON.parse(JSON.stringify(data1));
		const mutableData2 = JSON.parse(JSON.stringify(data2));
		const mutableXAxis = JSON.parse(JSON.stringify(this.xAxis));
		const mutableYAxis = JSON.parse(JSON.stringify(this.yAxis));
		const markerVolume = this.getMarkerVolume();
		const dateMarker = this.getDateMarker();
		let fakeLine = 0;
		try {
			if (mutableData.lineData) {
				fakeLine = Math.max.apply(
					Math,
					mutableData.lineData.dataSets[0].values.map(function (o) {
						return o.y;
					})
				);
			} else if (mutableData.candleData) {
				fakeLine = Math.max.apply(
					Math,
					mutableData.candleData.dataSets[0].values.map(function (o) {
						return o.shadowH;
					})
				);
			}
		} catch (error) {}

		return (
			<React.Fragment>
				<TouchableOpacity
					activeOpacity={1}
					// onPress={this.onLongPress.bind(this)}
					onLongPress={this.onLongPress.bind(this)}
					delayPressOut={100}
					delayLongPress={1}
					onPressOut={this.onPressOut.bind(this)}
					style={{
						backgroundColor: CommonStyle.backgroundColor,
						paddingHorizontal: 16,
						width: '100%',
						height: 205,
						marginBottom: 40
					}}
				>
					<React.Fragment>
						{dateMarker}
						{markerVolume}
						<RNCombinedChart
							ref={(c) => (this._chart1 = c)}
							chartDescription={{ text: '' }}
							data={mutableData}
							drawOrder={['CANDLE', 'LINE', 'BAR']}
							legend={{ enabled: false }}
							noDataText={I18n.t('noChartData')}
							style={{
								...this.overlayStyle(1),
								backgroundColor: CommonStyle.backgroundColor,
								paddingHorizontal: 16,
								width: '100%',
								height: 205
							}}
							marker={{
								enabled: false,
								markerColor: processColor('#FFFFFF00'),
								textColor: processColor(CommonStyle.fontColor),
								markerFontSize: 16
							}}
							onSelect={this.handleSelect.bind(this)}
							onChange={(e) => this.handleChange(e.nativeEvent)}
							xAxis={mutableXAxis}
							yAxis={mutableYAxis}
							scaleEnabled={true}
							scaleXEnabled={true}
							scaleYEnabled={true}
							dragEnabled={true}
							pinchZoom={true}
							doubleTapToZoomEnabled={true}
							highlightPerTapEnabled={true}
							// highlightPerDragEnabled={false}
							// highlights={[{ x: 5 }, { x: 10 }]}
						/>
						<View
							style={{
								height: 20,
								width: this.WIDTH_CONTAINER,
								backgroundColor: 'transparent',
								opacity: 0
							}}
						/>
						<View
							style={{
								height: 20,
								width: this.WIDTH_CONTAINER,
								backgroundColor: 'transparent',
								opacity: 0
							}}
						/>
						<Animated.View
							style={{
								...this.overlayStyle(
									this.opacityAnimChart.interpolate({
										inputRange: [0, 1],
										outputRange: [0, 1.01]
									})
								),
								opacity: this.opacityAnimChart,
								position: 'absolute',
								top: 40,
								left: 16,
								right: 0,
								backgroundColor: CommonStyle.backgroundColor,
								width: '100%',
								height: 205
							}}
						>
							<RNCombinedChart
								ref={(c) => (this._chart2 = c)}
								chartDescription={{ text: '' }}
								data={mutableData2}
								drawOrder={['LINE']}
								// touchEnabled={false}
								legend={{ enabled: false }}
								noDataText={I18n.t('noChartData')}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									backgroundColor:
										CommonStyle.backgroundColor,
									paddingHorizontal: 16,
									width: '100%',
									height: 205
								}}
								marker={{
									enabled: false,
									markerColor: processColor('#FFFFFF00'),
									textColor: processColor(
										CommonStyle.fontColor
									),
									markerFontSize: 16
								}}
								// onSelect={this.handleSelect2.bind(this)}
								// onChange={e => this.handleChange(e.nativeEvent)}
								xAxis={mutableXAxis}
								yAxis={mutableYAxis}
								scaleEnabled={false}
								scaleXEnabled={false}
								scaleYEnabled={false}
								dragEnabled={true}
								pinchZoom={false}
								doubleTapToZoomEnabled={false}
								zoom={this.state.zoomRatio}
								highlightPerTapEnabled={true}
							/>
						</Animated.View>
					</React.Fragment>
				</TouchableOpacity>
			</React.Fragment>
		);
	}
}
