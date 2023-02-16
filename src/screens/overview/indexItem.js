import React, { PropTypes, Component } from 'react';
import {
	Text,
	View,
	processColor,
	Dimensions
} from 'react-native';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import ProgressBar from '../../modules/_global/ProgressBar';
import HighLightText from '../../modules/_global/HighLightText';
import styles from './style/market.style';
import { getSymbolInfoApi, logDevice, formatNumberNew2, logAndReport, checkPropsStateShouldUpdate, checkWeekend, getDisplayName, renderTime } from '../../lib/base/functionUtil';
import { addDaysToTime, getDateStringWithFormat, getDateOnly } from '../../lib/base/dateTime';
import { func, dataStorage } from '../../storage';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import { bindActionCreators } from 'redux';
import { Navigation } from 'react-native-navigation'
import Chart from '../line_chart/line_chart';
import ChartNew from '../candle_stick_chart/candle_stick_chart';
import { connect } from 'react-redux';
import * as indexItemActions from './indexItem.actions';
import Perf from '../../lib/base/performance_monitor';
import ModalPicker from './../modal_picker/modal_picker';
import * as Controller from '../../memory/controller';
import { unregister } from '../../nchan';
import * as Emitter from '@lib/vietnam-emitter';
import performanceEnum from '../../constants/performance';
import Flag from '../../component/flags/flag';
import Enum from '../../enum';
import * as Util from '../../util';
import * as Business from '../../business';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as InvertTranslate from '../../invert_translate'
import * as Historical from '../../streaming/historical';
import Flashing from '../../component/flashing/flashing';
import XComponent from '../../component/xComponent/xComponent';
import CustomAccordion from '../../component/custom_accordion/custom_accordion'
import * as RoleUser from '../../roleUser';

const { width } = Dimensions.get('window')
const chartChangePercentDataDemo = [{ x: 10.00, y: -5, marker: `Today: 10:00\nChange percent: -5` }, { x: 10.20, y: 2, marker: `Today: 10:20\nChange percent: 2` }, { x: 10.40, y: 3, marker: `Today: 10:40\nChange percent: 3` }, { x: 10.55, y: -4, marker: `Today: 10:55\nChange percent: -4` }, { x: 11, y: 2, marker: `Today: 11:00\nChange percent: 2` }, { x: 11.30, y: 1, marker: `Today: 11:30\nChange percent: 2` }, { x: 11.55, y: 0.3, marker: `Today: 11:55\nChange percent: 0.3` }, { x: 12, y: -1, marker: `Today: 12:00\nChange percent: -1` }, { x: 12.18, y: 1, marker: `Today: 12:18\nChange percent: 1` }, { x: 12.48, y: 1, marker: `Today: 12:48\nChange percent: 1` }, { x: 13, y: 3, marker: `Today: 13:00\nChange percent: 2` }, { x: 13.30, y: 1.23, marker: `Today: 13:30\nChange percent: 1.23` }, { x: 14.18, y: 2.53, marker: `Today: 14:18\nChange percent: 2.53` }, { x: 14.35, y: 2, marker: `Today: 14:35\nChange percent: 2` }, { x: 15, y: 2.83, marker: `Today: 15:00\nChange percent: 2.83` }, { x: 15.10, y: 2.93, marker: `Today: 15:10\nChange percent: 2.93` }, { x: 15.20, y: -2.83, marker: `Today: 15:20\nChange percent: -2.83` }, { x: 15.59, y: 5, marker: `Today: 15:59\nChange percent: 5` }, { x: 16, y: -3, marker: `Today: 16:00\nChange percent: -3` }, { x: 16.30, y: -2.8, marker: `Today: 16:30\nChange percent: -2.8` }];
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;
const PTC_CHANNEL = Enum.PTC_CHANNEL;
const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export class IndexItem extends XComponent {
	constructor(props) {
		super(props);
		this.listItem = Util.getValueObject(PRICE_FILL_TYPE);
		this.listDisplay = InvertTranslate.getListInvertTranslate(this.listItem);
		this.beginDay = getDateOnly(new Date()).getTime();
		const to = new Date();
		const addToDate = addDaysToTime(to, 1);
		this.endDay = addToDate.getTime() - 1;
		this.currentState = true;
		this.maxValue = -99999999999999;
		this.minValue = 999999999999999;
		this.isMount = false;
		this.isReady = false;
		this.canLoading = true;
		this.dataChart = {};
		this.dataChangePercentChart = [];
		this.minXChangePercentChart = 36000000;
		this.maxXChangePercentChart = 57600000;
		this.minYChangePercentChart = null;
		this.maxYChangePercentChart = null;
		this.updatePriceStreaming = this.updatePriceStreaming.bind(this);
		this.priceObject = {};
		this.isStreaming = false;
		this.state = {
			displayName: '',
			company: '',
			symbol: this.props.symbol,
			announcements: [],
			test: '',
			delayTimeGetChart: 10000,
			isLoading: true,
			isChartLoading: false,
			valueFormatterY: null,
			data: {},
			labelsM: [],
			labelsP: [],
			listData: [],
			listColor: [],
			listCandle: [],
			listVolume: [],
			maxLeft: 0,
			maxRight: 0,
			minRight: 0,
			xAxis: {},
			yAxis: {},
			filterType: PRICE_FILL_TYPE._1D,
			chartType: '$',
			change_point: this.props.originalObj.change_point,
			change_percent: this.props.originalObj.change_percent,
			volume: this.props.originalObj.volume,
			trade_price: this.props.originalObj.trade_price,
			close: this.props.originalObj.close,
			trend: this.props.originalObj.trend,
			isExpand: false,
			listDataChart: [],
			modalVisible: false,
			updated: new Date(),
			dataChartNow: {
				code: this.props.originalObj.symbol.replace('.AU', ''),
				close: '',
				high: '',
				history_date: new Date(),
				low: '',
				open: ''
			},
			lineChartXAxis: {},
			lineChartYAxis: {},
			lineChartData: {},
			marker: {
				enabled: false,
				backgroundTint: processColor(CommonStyle.backgroundTintChart),
				markerColor: processColor(CommonStyle.markerColorChart),
				textColor: processColor(CommonStyle.fontColor2),
				textSize: 10
			},
			legend: {
				enabled: false
			}
		};
		this.selectedItem = I18n.t(this.state.filterType)
		this.refPath = null;
		this.refChart = null;
		this.refreshChart = this.refreshChart.bind(this);
		this.getDataChart = this.getDataChart.bind(this);
		this.callbackSetChart = this.callbackSetChart.bind(this);
		this.onSelectPercentChart = this.onSelectPercentChart.bind(this);
		this.onSelectIndexChart = this.onSelectIndexChart.bind(this);
		this.changedIndex = this.changedIndex.bind(this);
		this.getDataChartCallback = this.getDataChartCallback.bind(this);
		this.getDataChartCallbackStreaming = this.getDataChartCallbackStreaming.bind(this);
		this.loadChangePointChart = this.loadChangePointChart.bind(this);
		this.callbackSymbol = this.callbackSymbol.bind(this);
		this.unsubHistorical = this.unsubHistorical.bind(this);
		this.subHistorical = this.subHistorical.bind(this);
		this.realtimeHistorical = this.realtimeHistorical.bind(this);
		this.getBaseInfo = this.getBaseInfo.bind(this);
		this.topNews = null;
		this.registered = false;
		this.isChanged = false;
		this.dataRealtime = null;
		this.typeForm = 'overview';
		this.renderRealtime = this.renderRealtime.bind(this);
		this.updateDataChart = this.updateDataChart.bind(this);
		this.unregisterPrice = this.unregisterPrice.bind(this);
	}

	changedIndex(isOpen) {
		if (!this.isMount) return false
		if (isOpen === this.state.isExpand) return false
		this.setState({ isExpand: isOpen })
		isOpen
			? this.subHistorical().then(() => console.log('sub historical success'))
			: this.unsubHistorical().then(() => console.log('unsub historical success'))

		return true
	}

	unregisterPrice() {
		this.registered = false;
		unregister(this.objRegister);
		return true
	}

	componentWillUnmount() {
		super.componentWillUnmount()
		this.unregisterPrice()
		this.unsubHistorical()
		return true
	}
	// Draw chart change point every 10 seconds
	loadChangePointChart() {
		this.setState({
			lineChartData: {
				dataSets: [{
					values: chartChangePercentDataDemo,
					label: '',
					config: {
						lineWidth: 2,
						drawValues: false,
						drawCircles: false,
						highlightColor: processColor(CommonStyle.highlightColorChart),
						color: this.state.change_percent > 0 ? processColor('#00b800') : processColor('#df0000'),
						drawFilled: false,
						fillColor: processColor(CommonStyle.fillColorChart),
						fillAlpha: 60,
						axisDependency: 'LEFT',
						drawCubic: true,
						mode: 'CUBIC_BEZIER'
					}
				}]
			},
			lineChartXAxis: {
				enabled: true,
				position: 'BOTTOM',
				textColor: processColor(CommonStyle.highlightColorChart),
				textSize: 10 * CommonStyle.fontRatio,
				fontFamily: 'HelveticaNeue-Medium',
				drawGridLines: false,
				drawAxisLine: false,
				drawLabels: false,
				granularityEnabled: true,
				drawLimitLinesBehindData: true,
				avoidFirstLastClipping: true,
				centerAxisLabels: false
			},
			lineChartYAxis: {
				right: {
					drawGridLines: false,
					drawLabels: true,
					enabled: false,
					drawAxisLine: false,
					textColor: processColor(CommonStyle.highlightColorChart),
					textSize: 10 * CommonStyle.fontRatio,
					fontFamily: 'HelveticaNeue-Medium',
					position: 'OUTSIDE_CHART',
					labelCountForce: true,
					axisMaximum: 3,
					axisMinimum: -5
				},
				left: {
					zeroLine: { enabled: true, lineWidth: 1, color: CommonStyle.zeroLine },
					enabled: true,
					drawGridLines: false,
					drawAxisLine: false,
					drawLabels: false,
					axisMaximum: 6,
					axisMinimum: -5
				}
			}
		})

		return true
	}

	callbackSymbol(data) {
		const obj = data || dataStorage.symbolEquity[this.props.symbol] || {}
		const company = obj.company_name || obj.company || ''
		const displayName = data
			? data.display_name || ''
			: ''
		this.setState({ company, displayName })

		return true
	}

	refreshChart() {
		if (this.state.isExpand) {
			this.setState({ isChartLoading: true }, () => {
				this.getDataChart(this.state.filterType);
			})
		}
		return true
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps && nextProps.originalObj) {
			this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: nextProps.originalObj.trade_price });
			if (this.state.isExpand && this.canLoading) {
				this.setState({
					change_point: nextProps.originalObj.change_point,
					change_percent: nextProps.originalObj.change_percent,
					volume: nextProps.originalObj.volume,
					trade_price: nextProps.originalObj.trade_price,
					close: nextProps.originalObj.close,
					trend: nextProps.originalObj.trend,
					update: nextProps.originalObj.update
				}, () => {
					this.canLoading = false
				})
			} else {
				this.setState({
					change_point: nextProps.originalObj.change_point,
					change_percent: nextProps.originalObj.change_percent,
					volume: nextProps.originalObj.volume,
					trade_price: nextProps.originalObj.trade_price,
					close: nextProps.originalObj.close,
					trend: nextProps.originalObj.trend,
					update: nextProps.originalObj.update
				})
			}
		}
		return true
	}

	componentWillMount() {
		this.props.onRef(this)
		return true
	}

	componentDidMount() {
		try {
			super.componentDidMount()
			const code = this.props.originalObj.symbol;
			this.props.registerChange(code, this.changedIndex);
			this.props.registerRefreshChart(code, this.refreshChart)
			this.perf && this.perf.stop();
			const weekend = checkWeekend();
			weekend && this.getDataChartNow(this.props.originalObj);

			if (Controller.isPriceStreaming()) {
				this.updatePriceStreaming();
			}
			// get display name
			if (this.props.displayName && this.props.displayName !== this.props.symbol) {
				// Nhận symbol info từ cha
				console.log('RECEIVE DISPLAY NAME FROM OVERVIEW', this.props.displayName)
				const displayName = this.props.displayName;
				this.setState({ displayName });
			} else {
				// Lấy lại symbol info
				console.log('CANT RECEIVE DISPLAY NAME FROM OVERVIEW -> GET SYMBOL INFO AGAIN', this.props.displayName)
				getSymbolInfoApi(this.props.symbol, () => {
					const displayName = dataStorage.symbolEquity[this.props.symbol] &&
						dataStorage.symbolEquity[this.props.symbol].company
						? dataStorage.symbolEquity[this.props.symbol].company
						: this.props.symbol
					this.setState({ displayName });
				})
			}
			return true
		} catch (error) {
			logAndReport('componentDidMount indexItem exception', error, 'componentDidMount indexItem');
			logDevice('info', `componentDidMount indexItem exception: ${error}`);
			return false
		}
	}

	updatePriceStreaming() {
		const symbol = this.props.originalObj.symbol
		const exchange = dataStorage.symbolEquity[symbol].exchanges[0];
		const channel = StreamingBusiness.getChannelLv1(exchange, symbol)

		Emitter.addListener(channel, this.id, newData => {
			this.dataRealtime = newData;
			const val = newData || {};
			this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: val.trade_price });
			this.setState({
				change_point: val.change_point,
				change_percent: val.change_percent,
				volume: val.volume,
				trade_price: val.trade_price,
				close: val.close,
				trend: val.trend,
				updated: val.updated
			}, () => {
				if (this.state.isExpand) {
					this.renderRealtime();
				}
			});
		});

		return true
	}

	getBaseInfo() {
		return {
			symbol: this.props.symbol,
			exchange: func.getExchangeSymbol(this.props.symbol),
			interval: BAR_BY_PRICE_TYPE[this.state.filterType]
		};
	}

	realtimeHistorical() {
		const { symbol, exchange, interval } = this.getBaseInfo();
		if (!symbol || !exchange || !interval) return false;

		const event = StreamingBusiness.getChannelHistorical(exchange, symbol, interval);
		Emitter.addListener(event, this.id, data => {
			if (!this.state.isExpand) return;
			this.updateDataChart(this.state.filterType, this.dataChart, data);
		});
		return true
	}

	subHistorical() {
		return new Promise(resolve => {
			if (!func.isPriceStreaming()) return resolve()

			const { symbol, exchange, interval } = this.getBaseInfo();
			if (!symbol || !exchange || !interval) return resolve();

			this.realtimeHistorical();
			Historical.sub([{
				symbol,
				exchange,
				interval
			}], this.id, resolve);
		});
	}

	unsubHistorical() {
		return new Promise(resolve => {
			if (!func.isPriceStreaming()) return resolve()

			const { symbol, exchange, interval } = this.getBaseInfo();
			if (!symbol || !exchange || !interval) return resolve();

			const event = StreamingBusiness.getChannelHistorical(exchange, symbol, interval);
			Emitter.deleteListener(event, this.id);
			Historical.unsub([{
				symbol,
				exchange,
				interval
			}], this.id, resolve);
		});
	}

	getDataChartNow(data) {
		try {
			const temp = {};
			temp.code = this.state.symbol;
			temp.close = data.trade_price;
			temp.high = data.high;
			temp.history_date = data.updated || new Date().getTime();
			temp.low = data.low;
			temp.open = data.open;
			this.setState({
				dataChartNow: temp,
				isChartLoading: true,
				updated: temp.history_date
			}, () => {
				if (this.isReady) {
					this.getDataChartCallback(this.dataChart, this.state.filterType);
				}
			});
			return true
		} catch (error) {
			logDevice('info', `IndexItem get Data chart now: ${error}`);
			return false
		}
	}

	loadChart(changed) {
		if (changed) {
			this.props.changeIndex(this.state.symbol, true);
			if (!this.isReady) {
				this.getDataChart(this.state.filterType);
			}
			this.isReady = true;
		} else {
			this.props.changeIndex(this.state.symbol, false);
		}
		return true
	}

	getDataChartCallback(val, dataSelect) {
		const isChartDay = dataSelect === PRICE_FILL_TYPE._1D
		this.isReady = true;
		const isWeekend = checkWeekend()
		const isAddLastBar = Business.checkDurationAddLastBar(dataSelect)
		const isOpenSession = Util.checkOpenSessionBySymbol(this.props.originalObj.symbol)
		if (val &&
			val.noData &&
			this.state.dataChartNow &&
			this.state.dataChartNow.close) {
			const tmp = {};
			if (
				isWeekend &&
				isAddLastBar &&
				isOpenSession
			) {
				tmp[this.props.originalObj.updated] = this.state.dataChartNow;
			}
			val = tmp;
		} else {
			const lastKey = parseInt(Object.keys(val).sort().pop());
			const timePrice = this.props.originalObj.updated
			const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice) // Check xem đã có bar ngày hiện tại hay chưa
			const newData = JSON.parse(JSON.stringify(this.state.dataChartNow));
			if (
				isWeekend &&
				isDrawBarChartNow &&
				isAddLastBar &&
				isOpenSession
			) {
				val[this.props.originalObj.updated] = newData;
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
		for (let index = 0; index < keysSorted.length; index++) {
			const key = keysSorted[index];
			const data = val[key];
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
			const labelTimeFormat = isChartDay ? 'HH:mm' : 'MMM YYYY';
			let label = getDateStringWithFormat(date, labelTimeFormat);
			let marker = '';
			const markerLabelTimeFormat = Util.checkIntervalMarkerLabelTimeFormat(this.state.filterType);
			if (dataSelect !== '3Y') {
				label = getDateStringWithFormat(date, labelTimeFormat);
			}
			labelsP.push(label);
			const dataTemp = this.state.chartType === '$' ? data.close : (dataPre && dataPre.close > 0 ? 100 * dataChanged / firstDateValue : 0);
			if (dataTemp >= this.maxValue) {
				this.maxValue = dataTemp;
			}
			if (dataTemp <= this.minValue) {
				this.minValue = dataTemp;
			}
			if (!isNaN(dataTemp) && Object.keys(val).length > 0 && !val.hasOwnProperty('noData')) {
				listData.push({
					y: dataTemp,
					marker: `${renderTime(timeStamp, markerLabelTimeFormat)}\n ${getDisplayName(this.state.symbol)}: ${formatNumberNew2(dataTemp, 2)}${this.state.chartType === '%' ? '%' : ''}`
				})
			}
			const temp = {};
			const temp2 = {};
			marker = `${renderTime(timeStamp, markerLabelTimeFormat)} - O: ${formatNumberNew2(data.open, PRICE_DECIMAL.PRICE)}  H: ${formatNumberNew2(data.high, PRICE_DECIMAL.PRICE)}  L: ${formatNumberNew2(data.low, PRICE_DECIMAL.PRICE)}  C: ${formatNumberNew2(data.close, PRICE_DECIMAL.PRICE)}`
			if (data.open && data.high && data.low && data.close) {
				labelsM.push(label);
				temp2.y = data.volume || 0;
				temp2.marker = marker;
				listVolume.push(temp2);
				listMax.push(Math.max(data.high, data.low, data.close, data.open));
				listMin.push(Math.min(data.high, data.low, data.close, data.open));
				temp.shadowH = parseFloat(data.high) || 0;
				temp.shadowL = parseFloat(data.low) || 0;
				temp.open = parseFloat(data.open) || 0;
				temp.close = parseFloat(data.close) || 0;
				temp.marker = marker;
				listCandle.push(temp);
				listTemp.push(data.volume || 0);
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
		// fix label cho chart day
		let labelLength = labelsM.length
		if (dataSelect === PRICE_FILL_TYPE._1D && listData.length > 0) {
			// const timeUpdateLastBar = parseInt(Object.keys(val).pop())
			const now = new Date().getTime();
			const checkTimeCloseSession = Util.checkCloseSessionBySymbol(now, true);
			if (checkTimeCloseSession) {
				labelLength = listData.length;
			} else {
				labelLength = 74
			}
		}
		if (this.isMount) {
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
				listVolume,
				labelLength
			}, () => {
				this.canLoading = true;
			})
		}

		return true
	}

	getDataChartCallbackStreaming(val, dataSelect, lastBar) {
		const isChartDay = dataSelect === PRICE_FILL_TYPE._1D
		this.isReady = true;
		const isWeekend = checkWeekend(); // Check cuối tuần hay không true => không phải ngày cuối tuần => vẽ chart ngày hiện tại
		const isOpenSession = Util.checkOpenSessionBySymbol(this.props.originalObj.symbol)
		const isAddLastBar = Business.checkDurationAddLastBar(dataSelect)
		if (val && val.noData) {
			const tmp = {};
			if (
				isWeekend &&
				isAddLastBar &&
				isOpenSession
			) {
				tmp[lastBar.updated] = lastBar;
			}
			val = tmp;
		} else {
			const lastKey = parseInt(Object.keys(val).sort().pop());
			const timePrice = lastBar.updated
			const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice) // Check xem đã có bar ngày hiện tại hay chưa
			const newData = JSON.parse(JSON.stringify(lastBar));
			if (
				Controller.isPriceStreaming() ||
				(
					isWeekend &&
					isDrawBarChartNow &&
					isAddLastBar &&
					isOpenSession
				)
			) {
				val[lastBar.updated] = val[lastBar.updated]
					? {
						...val[lastBar.updated],
						...newData
					}
					: newData;
				val[timePrice].close = val[timePrice].close || val[timePrice].trade_price || 0;
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
		if (val && !val.noData) {
			for (let index = 0; index < keysSorted.length; index++) {
				const key = keysSorted[index];
				const data = val[key];
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
				const labelTimeFormat = isChartDay ? 'HH:mm' : 'MMM YYYY';
				let label = getDateStringWithFormat(date, labelTimeFormat);
				let marker = '';
				if (dataSelect !== PRICE_FILL_TYPE._3Y) {
					label = getDateStringWithFormat(date, labelTimeFormat);
				}
				const markerLabelTimeFormat = Util.checkIntervalMarkerLabelTimeFormat(this.state.filterType);
				labelsP.push(label);
				const dataTemp = this.state.chartType === '$' ? data.close : (dataPre && dataPre.close > 0 ? 100 * dataChanged / firstDateValue : 0);
				if (dataTemp >= this.maxValue) {
					this.maxValue = dataTemp;
				}
				if (dataTemp <= this.minValue) {
					this.minValue = dataTemp;
				}
				if (!isNaN(dataTemp) && Object.keys(val).length > 0 && !val.hasOwnProperty('noData')) {
					listData.push({
						y: dataTemp,
						marker: `${renderTime(timeStamp, markerLabelTimeFormat)}\n ${this.props.displayName}: ${formatNumberNew2(dataTemp, PRICE_DECIMAL.PERCENT)}${this.state.chartType === '%' ? '%' : ''}`
					})
				}
				const temp = {};
				const temp2 = {};
				const closeMarker = data.close === 0 ? '--' : formatNumberNew2(data.close, PRICE_DECIMAL.PRICE);
				marker = `${renderTime(timeStamp, markerLabelTimeFormat)} - O: ${formatNumberNew2(data.open, PRICE_DECIMAL.PRICE)}  H: ${formatNumberNew2(data.high, PRICE_DECIMAL.PRICE)}  L: ${formatNumberNew2(data.low, PRICE_DECIMAL.PRICE)}  C: ${formatNumberNew2(data.close, PRICE_DECIMAL.PRICE)}`
				if ((data.open !== undefined && data.open !== null) && (data.high !== undefined && data.high !== null) && (data.low !== undefined && data.low !== null) && (data.close !== undefined && data.close !== null)) {
					labelsM.push(label);
					temp2.y = data.volume || 0;
					temp2.marker = marker;
					listVolume.push(temp2);
					listMax.push(Math.max(data.high, data.low, data.close, data.open));
					listMin.push(Math.min(data.high, data.low, data.close, data.open));
					temp.shadowH = parseFloat(data.high) || 0;
					temp.shadowL = parseFloat(data.low) || 0;
					temp.open = parseFloat(data.open) || 0;
					temp.close = parseFloat(data.close) || 0;
					temp.marker = marker;
					listCandle.push(temp);
					listTemp.push(data.volume || 0);
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
		}

		// fix label cho chart day
		let labelLength = labelsM.length
		if (dataSelect === PRICE_FILL_TYPE._1D && listData.length > 0) {
			// const timeUpdateLastBar = parseInt(Object.keys(val).pop())
			const now = new Date().getTime();
			const checkTimeCloseSession = Util.checkCloseSessionBySymbol(now, true);
			if (checkTimeCloseSession) {
				labelLength = listData.length;
			} else {
				labelLength = 74
			}
		}
		if (this.isMount) {
			this.setState({
				listData,
				listColor,
				isLoading: false,
				isChartLoading: false,
				labelsP,
				labelsM,
				maxLeft: maxLeft || 0,
				minRight,
				maxRight,
				listCandle,
				listVolume,
				labelLength
			}, () => {
				this.canLoading = true;
			})
		}

		return true
	}

	updateDataChart(filterType, currentDataChart, lastBar) {
		this.getDataChartCallbackStreaming(currentDataChart, filterType, lastBar)
	}

	renderRealtime() {
		if (!this.isMount) return;
		const obj = this.dataRealtime
			? {
				change_point: this.dataRealtime.change_point,
				change_percent: this.dataRealtime.change_percent,
				volume: this.dataRealtime.volume,
				trade_price: this.dataRealtime.trade_price,
				close: this.dataRealtime.trade_price,
				trend: this.dataRealtime.trend,
				updated: this.dataRealtime.updated
			}
			: {};
		this.setState(obj);
	}

	async getDataChart(data) {
		try {
			this.perf = new Perf(performanceEnum.load_data_chart_indicies);
			this.perf && this.perf.start();
			this.maxValue = -99999999999999;
			this.minValue = 999999999999999;

			const dataChart = await Business.getDataChartPrice(this.state.symbol, data);
			this.perf && this.perf.stop();

			if (dataChart) {
				this.dataChart = dataChart;
				this.getDataChartCallback(dataChart, this.state.filterType);
			} else {
				// No data chart
				this.setState({
					listData: [],
					listColor: [],
					isLoading: false,
					isChartLoading: false,
					labelsP: [],
					labelsM: [],
					maxLeft: 0,
					minRight: 0,
					maxRight: 0,
					listCandle: [],
					listVolume: []
				}, () => {
					this.canLoading = true;
				});
			}
		} catch (error) {
			logAndReport('getDataChart indexItem exception', error, 'getDataChart indexItem');
			logDevice('info', `getDataChart indexItem exception: ${error}`)
		}
	}

	callbackSetChart() {
		this.getDataChart(this.state.filterType)
	}

	onSelectIndexChart() {
		this.setState({
			chartType: '$',
			valueFormatterY: null,
			isChartLoading: true
		}, this.callbackSetChart)
	}

	onSelectPercentChart() {
		this.setState({
			chartType: '%',
			valueFormatterY: '%',
			isChartLoading: true
		}, this.callbackSetChart);
	}

	onSelected = this.onSelected.bind(this)
	onSelected(value) {
		this.onDismissModal()
		// Dịch ngược về EN với key
		const enValue = InvertTranslate.translateCustomLang(value)
		this.selectedItem = I18n.t(enValue)
		this.setState({
			isChartLoading: true,
			filterType: enValue
		}, this.callbackSetChart);
	}

	onShowModalPicker = this.onShowModalPicker.bind(this)
	onShowModalPicker() {
		const rowItemWidth = 0.4 * width
		this.refIconDurationChart.measure && this.refIconDurationChart.measure((x, y, w, h, px, py) => {
			this.topIconDurationChart = h + py
			this.heightIconDurationChart = h
			this.rightIconDurationChart = width - (rowItemWidth + 32) - px - 16
			console.log('DCM onShowModalPicker', width, rowItemWidth, px, this.rightIconDurationChart)
			Navigation.showModal({
				screen: 'equix.ReanimatedPicker',
				animated: true,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					title: '',
					textBtnCancel: '',
					listItem: this.listDisplay,
					onCancel: this.onDismissModal,
					onPressBackdrop: this.onDismissModal,
					onSelect: this.onSelected,
					top: this.topIconDurationChart,
					height: this.heightIconDurationChart,
					value: this.selectedItem,
					modalStyle: { marginRight: this.rightIconDurationChart },
					rowStyle: { width: rowItemWidth },
					numberRowVisible: 4.5
				}
			})
		})
	}

	onDismissModal = this.onDismissModal.bind(this)
	onDismissModal() {
		Navigation.dismissModal({
			animation: true,
			animationType: 'none'
		})
	}

	onClose() {
		this.setState({ modalVisible: false })
	}

	shouldComponentUpdate(nextProps, nextState) {
		const listProps = [{ overviewRowEvent: ['codeCurrent'] }, 'isLoading', { setting: ['lang'] }];
		const listState = ['filterType', 'isChartLoading', 'company', 'symbol', 'displayName',
			'modalVisible', 'isExpand', 'isLoading', 'trend', 'trade_price', 'close', 'change_percent', 'change_point']
		// 'announcements', 'annLoading', 'lineChartXAxis', 'lineChartYAxis', 'lineChartData', 'listColor', 'listCandle', 'listVolume', 'minRight', 'maxRight', 'maxLeft'];
		const check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
		return check;
	}

	setRefIconDurationChart = this.setRefIconDurationChart.bind(this)
	setRefIconDurationChart(ref) {
		if (ref) this.refIconDurationChart = ref
	}

	render() {
		if (this.state.symbol === this.props.overviewRowEvent.codeCurrent && !this.currentState) {
			this.isCol = false;
		} else {
			this.currentState = true;
			this.isCol = true;
		}

		const rowData = this.state;
		const { chartType, filterType } = this.state
		let content = null;
		const loadingProgress = (
			<View style={[CommonStyle.progressBarWhite, { height: 200 }]}>
				<ProgressBar />
			</View>
		)
		const count = 5;
		const point = (this.maxValue - this.minValue) / count;
		const chart = (
			<View style={{ height: 200, backgroundColor: CommonStyle.backgroundColor, paddingHorizontal: 8 }}>
				{
					this.state.isChartLoading ? <View style={[CommonStyle.progressBarWhite]}>
						<ProgressBar testID='chartProgressBar' />
					</View> : (
							chartType === '$' ? <ChartNew
								testId={`candleStickChart_${rowData.symbol}`}
								isAuBySymbol={Business.isParitech(this.props.symbol)}
								listData={RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_CHART_OF_INDICES) ? this.state.listCandle : []}
								listColor={this.state.listColor}
								listVolume={this.state.listVolume}
								labels={this.state.labelsM}
								maxRight={this.state.maxRight}
								maxLeft={this.state.maxLeft}
								minRight={this.state.minRight}
								touchEnabled={true}
								isChartDay={this.state.filterType === PRICE_FILL_TYPE._1D}
								labelLength={this.state.labelLength}
							/> : <Chart
									testId={`lineChart_${rowData.symbol}`}
									isAuBySymbol={Business.isParitech(this.props.symbol)}
									data={RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_CHART_OF_INDICES) ? this.state.listData : []}
									code={this.state.symbol}
									labels={this.state.labelsP}
									axisMaximum={this.maxValue + point}
									axisMinimum={this.minValue - point}
									formater={'#0.00'}
									touchEnabled={true}
									labelCount={count}
									isChartDay={this.state.filterType === PRICE_FILL_TYPE._1D}
									labelLength={this.state.labelLength}
								/>
						)
				}
				<View style={[styles.filter, { padding: 4, paddingTop: 10, paddingBottom: 0 }]}>
					<TouchableOpacityOpt
						testID={`overviewFilterTimeChartButton_${this.state.symbol}`}
						onPress={this.onShowModalPicker.bind(this)}
						style={styles.timeFilter}
						setRef={this.setRefIconDurationChart}>
						<Text testID={`filterTimeChart_${this.state.symbol}`} style={CommonStyle.textSubMediumWhite}>{this.selectedItem}</Text>
						<Ionicons name='md-arrow-dropdown' size={20}
							style={styles.iconModal}
						/>
					</TouchableOpacityOpt>
					<View style={styles.typeFilter} testID={`overviewChartTypeButton${this.state.symbol}`}>
						<TouchableOpacityOpt onPress={this.onSelectIndexChart.bind(this)} testID={`overviewMoneyButton_${this.state.symbol}`}
							style={[styles.filterButt, chartType === '$' && styles.filterButtActive, chartType === '$' && styles.filterButtActiveLeft]}>
							<Text style={chartType === '$' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen}>$</Text>
						</TouchableOpacityOpt>
						<TouchableOpacityOpt onPress={this.onSelectPercentChart.bind(this)} testID={`overviewPercentButton_${this.state.symbol}`}
							style={[styles.filterButt, chartType === '%' && styles.filterButtActive, chartType === '%' && styles.filterButtActiveRight]}>
							<Text style={chartType === '%' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen} >%</Text>
						</TouchableOpacityOpt>
					</View>
				</View>
			</View>
		)
		const loadingAnn = (
			<View style={{
				backgroundColor: 'white',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				<ProgressBar />
			</View>);
		const expandContent = (
			<View>
				{
					chart
				}
			</View>
		)
		content = () => {
			if (!this.state.isExpand) return <View></View>
			return this.state.isLoading ? loadingProgress : expandContent;
		}
		let header = null;
		// const displayName = this.props.displayName
		// const displayName = dataStorage.symbolEquity[this.state.symbol] ? dataStorage.symbolEquity[this.state.symbol].display_name : this.state.symbol;
		const companyName = dataStorage.symbolEquity[this.state.symbol] ? (dataStorage.symbolEquity[this.state.symbol].company_name || dataStorage.symbolEquity[this.state.symbol].company || '') : (this.state.company || '')
		const translateDisplayName = InvertTranslate.getInvertTranslate(this.state.displayName)
		header = () => {
			const { rateContainer, exchangeRateRowContainer, rateCol1, rateCol2, rateCol3, alignStart, alignEnd, text16, text14 } = styles
			return (
				<View style={[rateContainer, {}]}>
					<View style={exchangeRateRowContainer}>
						<View testID={`rowOverview_${rowData.symbol}`} style={[rateCol1, alignStart]}>
							<View style={{ flexDirection: 'row' }}>
								<View style={{ flex: 4 }}>
									<Text numberOfLines={2} style={[CommonStyle.textMain]}>{translateDisplayName}</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Flag
										type={'flat'}
										code={this.props.countryCode}
										size={18}
									/>
								</View>
							</View>
						</View>
						<View style={[rateCol2, alignEnd]}>
							<Flashing
								decimalPrice={PRICE_DECIMAL.SPECIFIC_PRICE}
								noneValueStyle={{ color: CommonStyle.fontColor }}
								value={this.state.trade_price}
								parentID={this.id}
								field={PTC_CHANNEL.TRADE_PRICE}
								isLoading={this.props.isLoading}
								typeFormRealtime={TYPE_FORM_REALTIME.WATCHLIST}
							/>
						</View>
						<View style={[rateCol3, alignEnd]}>
							<HighLightText style={[CommonStyle.textMainNoColor]}
								testID={`changePercent_${this.state.symbol}`}
								base={formatNumberNew2(this.state.change_percent, PRICE_DECIMAL.PERCENT)}
								percent
								value={!Controller.isPriceStreaming() && this.props.isLoading ? '--' : formatNumberNew2(this.state.change_percent, PRICE_DECIMAL.PERCENT)} />
						</View>
					</View>
					<HighLightText style={[CommonStyle.textSubNoColor, { paddingBottom: 4, textAlign: 'right' }]}
						testID={`changePoint_${this.state.symbol}`}
						addSymbol
						base={formatNumberNew2(this.state.change_point, PRICE_DECIMAL.SPECIFIC_PRICE)}
						value={!Controller.isPriceStreaming() && this.props.isLoading ? '--' : formatNumberNew2(this.state.change_point, PRICE_DECIMAL.SPECIFIC_PRICE)} />
				</View>
			);
		}
		return (
			<CustomAccordion
				onChange={this.loadChart.bind(this)}
				renderHeader={header}
				renderContent={content}
				isExpand={this.state.isExpand}
			/>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		overviewRowEvent: state.overviewRowEvent,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(indexItemActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexItem);
