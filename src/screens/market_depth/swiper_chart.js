import React, { Component } from 'react';
import { View, Text, PixelRatio, ScrollView, Platform, TouchableOpacity, processColor, Modal } from 'react-native';
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { formatNumber, getPriceSource, logAndReport, formatNumberNew2, checkWeekend, largeValue, logDevice, getPriceMultiExchange, renderTime } from '../../lib/base/functionUtil';
import { addMonthsToTime, addDaysToTime, getDateStringWithFormat, getDateOnly } from '../../lib/base/dateTime';
import moment from 'moment';
import config from '../../config';
import I18n from '../../modules/language/';
import { func, dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import LineChart from '../line_chart/line_chart';
import CandleChart from '../candle_stick_volume_chart/candle_stick_volume_chart';
import IonIcons from 'react-native-vector-icons/Ionicons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import uuid from 'react-native-uuid';
import ModalPicker from './../modal_picker/modal_picker';
import { getApiUrl, requestData, getFeedUrl, actionUserWatchListSymbol, getUrlChartHistory } from '../../api';
import { connect2Nchan, mergeData, unregister } from '../../nchan';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as fbemit from '../../emitter';
import * as Controller from '../../memory/controller';
import Enum from '~/enum'
const { TAB_NEWS } = Enum

const listTimeFilter = ['1W', '1M', '3M', '6M', '1Y', '3Y'];

export default class Chart extends Component {
	constructor(props) {
		super(props);
		this.beginDay = getDateOnly(new Date()).getTime();
		const to = new Date();
		const addToDate = addDaysToTime(to, 1);
		this.endDay = addToDate.getTime() - 1;
		this.code = this.props.code || '';
		this.maxValue = -99999999999999;
		this.minValue = 999999999999999;
		this.userId = func.getUserId();
		this.getDataChart = this.getDataChart.bind(this);
		this.setCode = this.setCode.bind(this);
		this.callbackSetChart = this.callbackSetChart.bind(this);
		this.cbRealTimeSwiperChart = this.cbRealTimeSwiperChart.bind(this);
		this.childAdded = this.childAdded.bind(this);
		this.childRemoved = this.childRemoved.bind(this);
		this.ref = null;
		this.priceRef = null;
		this.dataChart = {};
		this.marker = '';
		this.registered = false;
		this.typeForm = 'swiper_chart';
		this.isready = false;
		this.state = {
			// dataChartNow: this.props.dataChartNow || {},
			// updated: this.props.updated,
			listData: [],
			listColor: [],
			isLoading: true,
			isChartLoading: true,
			labelsP: [],
			labelsM: [],
			maxLeft: 0,
			minRight: 0,
			maxRight: 0,
			listCandle: [],
			listVolume: [],
			chartType: '$',
			filterType: '3M',
			plusButton: `+ ${I18n.t('favorites')}`,
			isSelect: false,
			modalVisible: false,
			dataChartNow: {
				code: this.props.code,
				close: '',
				high: '',
				history_date: new Date().getTime(),
				low: '',
				open: '',
				volume: ''
			}
		}
		func.setFuncReload(this.typeForm, this.loadDataFromApi.bind(this));
		this.perf = new Perf(performanceEnum.show_swiper_chart);
	}

	getDataChartCallback(val) {
		try {
			if (val && val.noData && this.state.dataChartNow && this.state.dataChartNow.close && this.state.dataChartNow.close !== '') {
				const tmp = {};
				tmp[this.state.updated] = this.state.dataChartNow;
				val = tmp;
			} else {
				const lastKey = Object.keys(val).sort().pop();
				if (lastKey < this.endDay) {
					if (lastKey > this.beginDay) {
						delete val[lastKey];
					}
					val[this.state.dataChartNow.history_date] = this.state.dataChartNow;
				}
			}
			const keysSorted = val ? Object.keys(val).sort(function (a, b) {
				return a - b;
			}) : [];
			const firstDateValue = keysSorted.length > 0 ? val[keysSorted[0]].close : 0;
			let maxLeft = 0;
			let minRight = 0;
			let maxRight = 0;
			const listMax = [];
			const listMin = [];
			const labelsM = [];
			const labelsP = [];
			const listData = [];
			const listVolume = [];
			const listCandle = [];
			const listTemp = [];
			const listColor = [];
			const dataSelect = this.state.filterType;
			for (let index = 0; index < keysSorted.length; index++) {
				const key = keysSorted[index];
				const data = val[key];
				if (!data) {
					continue;
				}
				if (parseFloat(data.close) <= parseFloat(data.open)) {
					listColor.push(processColor('rgba(193, 0, 0, 0.15)'));
				} else {
					listColor.push(processColor('rgba(0, 66, 0, 0.15)'));
				}
				let dataChanged = 0;
				let dataPre;
				if (index > 0) {
					const keyPre = keysSorted[index - 1];
					dataPre = val[keyPre];
					if (this.state.chartType === '%') {
						dataChanged = data.close - firstDateValue;
					} else {
						dataChanged = data.close - dataPre.close;
					}
				}
				const timeStamp = parseInt(key);
				const date = new Date(timeStamp);
				let label = getDateStringWithFormat(date, 'MMM YYYY');
				const markerLabel = getDateStringWithFormat(date, 'DD MMM YYYY');
				if (dataSelect === listTimeFilter[0] || dataSelect === listTimeFilter[1] || dataSelect === listTimeFilter[2] || dataSelect === listTimeFilter[3] || dataSelect === listTimeFilter[3] || dataSelect === listTimeFilter[4]) {
					label = getDateStringWithFormat(date, 'DD MMM');
				}
				labelsP.push(label);
				const dataTemp = this.state.chartType === '$' ? data.close : (dataPre && dataPre.close > 0 ? 100 * dataChanged / firstDateValue : 0);
				if (dataTemp >= this.maxValue) {
					this.maxValue = dataTemp;
				}
				if (dataTemp <= this.minValue) {
					this.minValue = dataTemp;
				}
				if (!isNaN(dataTemp)) {
					listData.push({
						y: dataTemp,
						marker: `${renderTime(timeStamp, 'DD MMM YYYY')}\n ${this.code}.AU: ${formatNumberNew2(dataTemp, 2)}${this.state.chartType === '%' ? '%' : ''}`
					})
				}
				const temp = {};
				const temp2 = {};
				this.marker = `${renderTime(timeStamp, 'DD MMM YYYY')} - O: ${formatNumberNew2(data.open, 3)}  H: ${formatNumberNew2(data.high, 3)}  L: ${formatNumberNew2(data.low, 3)}  C: ${formatNumberNew2(data.close, 3)}  Vol: ${largeValue(data.volume)}`
				if (data.open && data.high && data.low && data.close) {
					labelsM.push(label);
					temp2.y = data.volume;
					temp2.marker = this.marker;
					listVolume.push(temp2);
					listMax.push(Math.max(data.high, data.low, data.close, data.open));
					listMin.push(Math.min(data.high, data.low, data.close, data.open));
					temp.shadowH = parseFloat(data.high) || 0;
					temp.shadowL = parseFloat(data.low) || 0;
					temp.open = parseFloat(data.open) || 0;
					temp.close = parseFloat(data.close) || 0;
					temp.marker = this.marker;
					listCandle.push(temp);
					listTemp.push(data.volume);
					const max = Math.max(...listMax);
					const min = Math.min(...listMin);
					maxLeft = Math.max(...listTemp) * 4;
					minRight = min - (max - min) / 20;
					maxRight = max + (max - min) / 20;
				}
			}
			if (minRight === maxRight) {
				minRight = 0;
			}
			this.isready = true;
			this.setState({
				listData,
				listColor,
				isLoading: false,
				isChartLoading: false,
				labelsP,
				labelsM,
				maxLeft,
				minRight,
				maxRight,
				listCandle,
				listVolume
			})
		} catch (error) {
			logDevice('info', `Swiper chart get data chart callback exception: ${error}`)
		}
	}

	getDataChart(isChangedCode = false) {
		try {
			this.perf = new Perf(performanceEnum.load_data_chart);
			this.perf && this.perf.start();
			this.maxValue = -99999999999999;
			this.minValue = 999999999999999;
			const dataSelect = this.state.filterType;
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth();
			const date = now.getDate();
			const newDate = new Date(year, month, date);
			const nowDate = newDate;
			let preDate = newDate;
			switch (dataSelect) {
				case listTimeFilter[0]:
					preDate = addDaysToTime(nowDate, -7);
					break;
				case listTimeFilter[1]:
					preDate = addMonthsToTime(nowDate, -1);
					break;
				case listTimeFilter[2]:
					preDate = addMonthsToTime(nowDate, -3);
					break;
				case listTimeFilter[3]:
					preDate = addMonthsToTime(nowDate, -6);
					break;
				case listTimeFilter[4]:
					preDate = addMonthsToTime(nowDate, -12);
					break;
				case listTimeFilter[5]:
					preDate = addMonthsToTime(nowDate, -36);
					break;
				default:
					preDate = addDaysToTime(nowDate, -7);
					break;
			}
			const nextDate = addDaysToTime(newDate, 1);
			const startTime = preDate.getTime();
			const endTime = nextDate.getTime() - 1;
			const id = uuid.v4();
			const symbol = this.code;
			const exchange = (dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].exchanges[0]) || 'ASX';
			const url = getUrlChartHistory(symbol, startTime, endTime, exchange);
			requestData(url).then(data => {
				const dataChart = data.data;
				if (dataChart) {
					this.dataChart = dataChart;
					this.perf && this.perf.stop();
					if (isChangedCode) {
						this.loadDataFromApi()
					} else {
						this.getDataChartCallback(dataChart);
					}
				} else {
					// khong co data chart
					const maxLeft = 0;
					const minRight = 0;
					const maxRight = 0;
					const labelsM = [];
					const labelsP = [];
					const listData = [];
					const listVolume = [];
					const listCandle = [];
					const listColor = [];
					this.setState({
						listData,
						listColor,
						isLoading: false,
						isChartLoading: false,
						labelsP,
						labelsM,
						maxLeft,
						minRight,
						maxRight,
						listCandle,
						listVolume
					})
				}
			});
		} catch (error) {
			console.log('getDataChart swiper_chart logAndReport exception: ', error)
			logAndReport('getDataChart swiper_chart exception', error, 'getDataChart price');
			logDevice('info', `getDataChart swiper_chart exception: ${error}`)
		}
	}

	callbackSetChart() {
		this.getDataChart();
	}

	changeChartType(type) {
		this.setState({
			chartType: type,
			isChartLoading: true
		}, this.callbackSetChart)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.code && nextProps.code !== this.code) {
			this.code = nextProps.code || '';
			this.isready = false;
			this.setState({
				isChartLoading: true
			}, () => {
				this.registered = false;
				unregister(this.objRegister);
				this.getDataChart(true)
				// this.callbackSetChart();
				// this.loadDataFromApi();
				this.setCode();
			});
		}
	}

	loadDataFromApi() {
		const isWeekend = checkWeekend();
		if (isWeekend) {
			try {
				this.perf = new Perf(performanceEnum.load_data_from_api);
				this.perf && this.perf.start();
				const stringQuery = this.code;
				getPriceMultiExchange(stringQuery, func.getUserPriceSource(), (bodyData) => {
					if (bodyData && bodyData.length > 0) {
						this.changedValue(bodyData);
					}
					this.perf && this.perf.stop();
				});
			} catch (error) {
				console.log('loadDataFromApi swiper_chart logAndReport exception: ', error)
				logAndReport('loadDataFromApi swiper_chart exception', error, 'loadDataFromApi order');
				logDevice('info', `loadDataFromApi swiper_chart exception: ${error}`)
			}
		}
	}

	changedValue(data) {
		try {
			const weekend = checkWeekend();
			if (!data) {
				return
			}
			let val = {};
			if (data.length) {
				val = data[0] || {};
			} else {
				val = data || {};
			}
			const temp = {};
			temp.code = this.code;
			temp.close = val.trade_price ? val.trade_price : val.close ? val.close : 0;
			temp.high = val.high || 0;
			temp.history_date = val.updated || new Date().getTime();
			temp.low = val.low || 0;
			temp.open = val.open || 0;
			temp.volume = val.volume || 0;
			this.setState({
				dataChartNow: temp,
				isChartLoading: weekend ? this.isready : false
			}, () => {
				weekend && this.getDataChartCallback(this.dataChart);
			})
		} catch (error) {
			logDevice('info', `Swiper chart change value exception: ${error}`)
		}
	}

	updateData() {
		fbemit.addListener('swipeChart', 'button', (data) => {
			this.updatedCallback(data)
		})
	}

	updatedCallback(data) {
		if (data.includes(this.code)) {
			this.cbRealTimeSwiperChart();
		}
	}

	componentDidMount() {
		this.updateData();
		this.loadDataFromApi();
		this.getDataChart();
		this.setCode();
	}

	cbRealTimeSwiperChart() {
		const code = this.code;
		const accountID = dataStorage.accountId
		const userID = Controller.getUserId()
		const apiType = 'check-exist'
		actionUserWatchListSymbol(
			userID,
			code,
			apiType,
			this.childAdded,
			this.childRemoved
		)
	}

	setCode() {
		if (!fbemit.emitters['realTimeSwiperChart']) {
			fbemit.newEmitter('realTimeSwiperChart');
			fbemit.addListener('realTimeSwiperChart', 'onSwiperChart', this.cbRealTimeSwiperChart)
		}
		fbemit.emit('realTimeSwiperChart', 'onSwiperChart')
	}

	childAdded() {
		setTimeout(function () {
			this.setState({
				isSelect: true,
				plusButton: `- ${I18n.t('favorites')}`
			});
		}.bind(this), 100);
	}

	childRemoved() {
		setTimeout(function () {
			this.setState({
				isSelect: false,
				plusButton: `+ ${I18n.t('favorites')}`
			});
		}.bind(this), 100);
	}

	successCbOnAddToWatchList(code, isRemove) {
		if (isRemove) {
			fbemit.emit('realTimeWatchList', 'onWatchList');
			this.setState({ plusButton: `+ ${I18n.t('favorites')}`, isSelect: false })
		} else {
			this.setState({
				plusButton: `- ${I18n.t('favorites')}`,
				isSelect: true
			})
		}
		fbemit.emit('news', TAB_NEWS.ALL, code);
	}

	errorCbOnAddToWatchList(isRemove) {
		// this.childAdded();
	}

	onAddToWatchList(isRemove) {
		try {
			const code = this.props.code;
			const accountID = dataStorage.accountId
			const userID = Controller.getUserId()
			let apiType;
			this.setState({
				plusButton: isRemove ? I18n.t('Removed') : I18n.t('Added')
			});
			if (isRemove) {
				apiType = 'delete-symbol'
			} else {
				apiType = 'add-symbol'
			}
			actionUserWatchListSymbol(
				userID,
				code,
				apiType,
				() => this.successCbOnAddToWatchList(code, isRemove),
				() => this.errorCbOnAddToWatchList(isRemove)
			)
		} catch (error) {
			console.log('onAddToWatchList swiper_chart logAndReport exception: ', error)
			logAndReport('onAddToWatchList swiper_chart exception', error, 'onAddToWatchList price');
			logDevice('info', `onAddToWatchList swiper_chart exception: ${error}`)
		}
	}

	onShowModalPicker() {
		this.setState({ modalVisible: true })
	}

	onSelected(data) {
		this.setState({
			modalVisible: false,
			filterType: data,
			isChartLoading: true
		}, this.callbackSetChart)
	}

	onClose() {
		this.setState({ modalVisible: false })
	}

	render() {
		const count = 5;
		const point = (this.maxValue - this.minValue) / count;
		return (
			<View testID={`chartOrderSwiper`} style={{ flex: 1 }}>
				<View showsVerticalScrollIndicator={false} style={{ flex: 1 }}
					contentContainerStyle={{ flex: 1 }}>
					<View style={styles.chartContainer}>
						{
							this.state.isChartLoading || this.props.isLoading ? <View style={CommonStyle.progressBarWhite}>
								<ProgressBar />
							</View> : (
									this.state.chartType === '$' ? <CandleChart
										testID={`${this.code}$ChartWL`}
										listData={this.state.listCandle}
										listColor={this.state.listColor}
										listVolume={this.state.listVolume}
										labels={this.state.labelsM}
										maxRight={this.state.maxRight}
										maxLeft={this.state.maxLeft}
										minRight={this.state.minRight}
										touchEnabled={false}
									/> : <LineChart
											testID={`${this.code}%Chart`}
											data={this.state.listData}
											code={this.code}
											labels={this.state.labelsP}
											axisMaximum={this.maxValue + point}
											axisMinimum={this.minValue - point}
											formater={'#0.00'}
											touchEnabled={false}
											labelCount={count} />
								)
						}
					</View>
					<View style={[styles.filterContainer]}>
						<View style={{ width: '20%', flexDirection: 'row' }}>
							<TouchableOpacity
								style={styles.filterButton}
								onPress={this.onShowModalPicker.bind(this)}>
								<Text testID={`${this.code}wlFilter`} style={CommonStyle.textSubMediumWhite}>{this.state.filterType}</Text>
								<IonIcons name='md-arrow-dropdown' size={20} style={styles.iconModal} />
							</TouchableOpacity>
						</View>
						<View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
							<TouchableOpacity
								style={styles.priceWatchListButton}
								onPress={() => {
									this.onAddToWatchList(this.state.isSelect);
								}}>
								<Text testID={`${this.code}Personal`} style={CommonStyle.textSubMediumWhite}>{this.state.plusButton}</Text>
							</TouchableOpacity>
						</View>
						<View style={{ width: '30%', flexDirection: 'row', justifyContent: 'flex-end' }}>
							<TouchableOpacity
								onPress={this.changeChartType.bind(this, '$')}
								style={[styles.tabButton1, { backgroundColor: this.state.chartType === '$' ? config.colorVersion : '#ffffff' }]}>
								<Text testID={`${this.code}$Button`} style={[this.state.chartType === '$' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen, { fontWeight: this.state.chartType === '$' ? 'bold' : 'normal' }]}>
									{I18n.t('moneySymbol')}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={this.changeChartType.bind(this, '%')}
								style={[styles.tabButton2, { backgroundColor: this.state.chartType === '%' ? config.colorVersion : '#ffffff' }]}>
								<Text testID={`${this.code}%Button`} style={[this.state.chartType === '%' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen, { fontWeight: this.state.chartType === '%' ? 'bold' : 'normal' }]}>
									{I18n.t('percentSymbol')}</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{ height: 130 }}></View>
				</View>
				<ModalPicker listItem={listTimeFilter}
					testID={`newOrderWlPicker`}
					onSelected={this.onSelected.bind(this)}
					selectedItem={this.state.filterType}
					visible={this.state.modalVisible}
					title='Select Time'
					onClose={this.onClose.bind(this)} />
			</View>
		);
	}
}
