import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text, processColor } from 'react-native';
import * as Emitter from '@lib/vietnam-emitter'
import Chart from '../line_chart/line_chart';
import ChartNew from '../candle_stick_volume_chart/candle_stick_volume_chart';
import XComponent from '../../component/xComponent/xComponent';
import * as FuncUtil from '../../lib/base/functionUtil'
import * as Util from '../../util'
import Enum from '../../enum'
import * as Business from '../../business'
import { func as StorageFunc, dataStorage as StorageData } from '../../storage'
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Historical from '../../streaming/historical'
import * as Channel from '../../streaming/channel'
import styles from './price_historical_chart_style'
import * as InvertTranslate from '../../invert_translate'
import I18n from '../../modules/language/'
import ProgressBar from '../../modules/_global/ProgressBar'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config'
import * as Controller from '../../memory/controller'
import IonIcons from 'react-native-vector-icons/Ionicons'
import ModalPicker from './../modal_picker/modal_picker'
import { getDateStringWithFormat } from '../../lib/base/dateTime'
import ChartIndices from '../candle_stick_chart/candle_stick_chart'
import * as api from '../../api'
import * as fbemit from '../../emitter'

const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;
const CHART_TYPE = Enum.CHART_TYPE;
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const STATUS_IN_FAVORITES = Enum.STATUS_IN_FAVORITES;
const WATCHLIST = Enum.WATCHLIST;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class PriceHistoricalChart extends XComponent {
	static propTypes = {
		login: PropTypes.object,
		setting: PropTypes.object,
		allowRender: PropTypes.bool,
		chartType: PropTypes.string,
		filterType: PropTypes.string,
		priceObject: PropTypes.object,
		listFilterType: PropTypes.array,
		channelReload: PropTypes.string,
		showButtonWhatlist: PropTypes.bool,
		symbol: PropTypes.string.isRequired,
		channelAllowRender: PropTypes.string,
		style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
	};

	bindAllFunc() {
		try {
			this.onClose = this.onClose.bind(this)
			this.childAdded = this.childAdded.bind(this)
			this.onSelected = this.onSelected.bind(this)
			this.getBaseInfo = this.getBaseInfo.bind(this)
			this.processChart = this.processChart.bind(this)
			this.onCallReload = this.onCallReload.bind(this)
			this.childRemoved = this.childRemoved.bind(this)
			this.subHistorical = this.subHistorical.bind(this)
			this.renderLoading = this.renderLoading.bind(this)
			this.renderLoading = this.renderLoading.bind(this)
			this.onAllowRender = this.onAllowRender.bind(this)
			this.subReloadData = this.subReloadData.bind(this)
			this.subAllowRender = this.subAllowRender.bind(this)
			this.changeChartType = this.changeChartType.bind(this)
			this.unsubHistorical = this.unsubHistorical.bind(this)
			this.onAddToWatchList = this.onAddToWatchList.bind(this)
			this.getSnapshotChart = this.getSnapshotChart.bind(this)
			this.onShowModalPicker = this.onShowModalPicker.bind(this)
			this.onSelectChartValue = this.onSelectChartValue.bind(this)
			this.realtimeHistorical = this.realtimeHistorical.bind(this)
			this.subFavoritesChange = this.subFavoritesChange.bind(this)
			this.updateChartSnapshot = this.updateChartSnapshot.bind(this)
			this.onSelectChartPercent = this.onSelectChartPercent.bind(this)
			this.mergeDataWithLastBar = this.mergeDataWithLastBar.bind(this)
			this.updateChartStreaming = this.updateChartStreaming.bind(this)
			this.addCurrentPriceToChart = this.addCurrentPriceToChart.bind(this)
			this.checkExitOnUserWatchList = this.checkExitOnUserWatchList.bind(this)
			this.getNewestStatusInFavorites = this.getNewestStatusInFavorites.bind(this)
			this.getTextForStatusInFavorites = this.getTextForStatusInFavorites.bind(this)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	init() {
		try {
			const filterType = this.props.filterType || PRICE_FILL_TYPE._1D
			this.dic = {
				msgPreMount: [],
				waitRender: false,
				firstSnapshot: true,
				minValue: 999999999999999,
				maxValue: -99999999999999,
				style: this.props.style || {},
				priceObject: this.props.priceObject || {},
				priceBoardID: StorageFunc.getCurrentPriceboardId(),
				selectedItem: I18n.t(filterType, { locale: Controller.getLang() }),
				allowRender: Util.getBooleanable(this.props.allowRender, true),
				showButtonWhatlist: Util.getBooleanable(this.props.showButtonWhatlist, false),
				listDisplay: this.props.listFilterType ||
					InvertTranslate.getListInvertTranslate(Util.getValueObject(PRICE_FILL_TYPE))
			}

			this.state = {
				filterType,
				isLoading: true,
				isSelect: false,
				modalVisible: false,
				chartType: this.props.chartType || CHART_TYPE.VALUE,
				statusInFavorites: this.getNewestStatusInFavorites(),
				displayName: StorageFunc.getDisplayNameSymbol(this.props.symbol)
			}

			this.subFavoritesChange()
			this.subHistorical()
			this.subAllowRender()
			this.subReloadData()
			this.getSnapshotChart()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	getNewestStatusInFavorites() {
		try {
			return StorageFunc.checkSymbolInPriceboardFavorites(this.props.symbol)
				? STATUS_IN_FAVORITES.IN
				: STATUS_IN_FAVORITES.OUT
		} catch (error) {
			console.catch(error)
			return null
		}
	}

	subFavoritesChange() {
		try {
			const channelName = Channel
				.getChannelWatchlistChanged(WATCHLIST.USER_WATCHLIST)

			Emitter.addListener(channelName, this.id, () => {
				const newestStatus = this.getNewestStatusInFavorites()
				this.state.statusInFavorites !== newestStatus &&
					this.setState({ statusInFavorites: newestStatus })
			})

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	onShowModalPicker() {
		this.setState({ modalVisible: true })
	}

	getBaseInfo() {
		try {
			return {
				symbol: this.props.symbol,
				exchange: StorageFunc.getExchangeSymbol(this.props.symbol),
				interval: BAR_BY_PRICE_TYPE[this.state.filterType]
			}
		} catch (error) {
			console.catch(error)
			return {}
		}
	}

	realtimeHistorical() {
		try {
			const { symbol, exchange, interval } = this.getBaseInfo()
			if (!symbol || !exchange || !interval) return false

			const event = StreamingBusiness
				.getChannelHistorical(exchange, symbol, interval)
			Emitter.addListener(event, this.id, this.updateChartStreaming)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	onAllowRender(data) {
		try {
			if (this.dic.allowRender === data) return false

			this.dic.allowRender = data
			if (this.dic.allowRender && this.dic.waitRender) {
				this.processChart(this.dataChart, this.state.filterType)
				this.dic.waitRender = false
			}

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	onCallReload() {
		try {
			this.setState({ isLoading: true })
			this.getSnapshotChart()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	onClose() {
		this.setState({ modalVisible: false })
	}

	onAddToWatchList() {
		try {
			if (this.state.statusInFavorites === STATUS_IN_FAVORITES.ADDING ||
				this.state.statusInFavorites === STATUS_IN_FAVORITES.REMOVING) return false

			const newStatusFavorites = this.state.statusInFavorites === STATUS_IN_FAVORITES.IN
				? STATUS_IN_FAVORITES.REMOVING
				: STATUS_IN_FAVORITES.ADDING
			newStatusFavorites === STATUS_IN_FAVORITES.REMOVING
				? Business.removeSymbolInFavorites(this.props.symbol, true)
				: Business.addSymbolToFavorites(this.props.symbol, true)

			this.setState({ statusInFavorites: newStatusFavorites })

			return true
		} catch (error) {
			FuncUtil.logAndReport('onAddToWatchList price exception', error, 'onAddToWatchList price');
			console.catch(error)
			return false
		}
	}

	checkExitOnUserWatchList(symbol, userID, apiType) {
		try {
			api.actionUserWatchListSymbol(
				userID,
				symbol,
				apiType,
				this.childAdded,
				this.childRemoved
			)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	childAdded() {
		this.setState({
			isSelect: true,
			plusButton: `- ${I18n.t('favorites', { locale: this.props.setting.lang })}`
		});
	}

	childRemoved() {
		this.setState({
			isSelect: false,
			plusButton: `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`
		});
	}

	async onSelected(value) {
		try {
			if (StorageFunc.isPriceStreaming()) await this.unsubHistorical()

			const enValue = InvertTranslate.translateCustomLang(value)
			this.dic.selectedItem = I18n.t(enValue, { locale: Controller.getLang() })
			this.setState({
				modalVisible: false,
				filterType: enValue,
				isLoading: true
			}, async () => {
				if (StorageFunc.isPriceStreaming()) await this.subHistorical()
				this.getSnapshotChart()
			})

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	subReloadData() {
		try {
			this.props.channelReload &&
				Emitter.addListener(this.props.channelReload, this.id, this.onCallReload)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	subAllowRender() {
		try {
			this.props.channelAllowRender &&
				Emitter.addListener(this.props.channelAllowRender, this.id, this.onAllowRender)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	subHistorical() {
		return new Promise(resolve => {
			if (!StorageFunc.isPriceStreaming()) return resolve()

			const { symbol, exchange, interval } = this.getBaseInfo()
			if (!symbol || !exchange || !interval) return resolve()

			this.realtimeHistorical()
			return Historical.sub([{
				symbol,
				exchange,
				interval
			}], this.id, resolve)
		});
	}

	componentWillUnmount() {
		try {
			this.unsubHistorical()
			super.componentWillUnmount()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	unsubHistorical() {
		return new Promise(resolve => {
			const { symbol, exchange, interval } = this.getBaseInfo()
			if (!symbol || !exchange || !interval) return resolve()

			const event = StreamingBusiness.getChannelHistorical(exchange, symbol, interval)
			Emitter.deleteListener(event, this.id)
			return Historical.unsub([{
				symbol,
				exchange,
				interval
			}], this.id, resolve)
		});
	}

	addCurrentPriceToChart(val, filterType) {
		try {
			let dataChart = val

			// Check cuối tuần hay không true => không phải ngày cuối tuần => vẽ chart ngày hiện tại
			const isWeekend = FuncUtil.checkWeekend()
			const currentPrice = { ...this.dic.priceObject }

			if (dataChart && dataChart.noData && currentPrice.close != null) {
				dataChart = {}
				if (isWeekend &&
					(filterType === PRICE_FILL_TYPE._1Y || filterType === PRICE_FILL_TYPE._3Y)) {
					dataChart[currentPrice.updated] = currentPrice
				}
			} else {
				const lastKey = parseInt(Object.keys(dataChart).sort().pop())

				// Check xem đã có bar ngày hiện tại hay chưa
				const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, currentPrice.updated)
				currentPrice.close = currentPrice.close || currentPrice.trade_price || 0

				if (isWeekend &&
					isDrawBarChartNow &&
					(filterType === PRICE_FILL_TYPE._1Y || filterType === PRICE_FILL_TYPE._3Y)) {
					dataChart[currentPrice.updated] = currentPrice
				}
			}

			return dataChart
		} catch (error) {
			console.catch(error)
			return null
		}
	}

	mergeDataWithLastBar(val, filterType, lastBar) {
		try {
			// Check cuối tuần hay không true => không phải ngày cuối tuần => vẽ chart ngày hiện tại
			const isWeekend = FuncUtil.checkWeekend()
			let dataChart = val

			if (dataChart && dataChart.noData) {
				const tmp = {}
				if (isWeekend &&
					(filterType === PRICE_FILL_TYPE._1Y ||
						filterType === PRICE_FILL_TYPE._3Y)) {
					tmp[lastBar.updated] = lastBar;
				}
				dataChart = tmp
			} else {
				const lastKey = parseInt(Object.keys(dataChart).sort().pop())
				const timePrice = lastBar.updated
				// Check xem đã có bar ngày hiện tại hay chưa
				const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice)
				const newData = { ...lastBar }

				if (StorageFunc.isPriceStreaming() ||
					(isWeekend &&
						isDrawBarChartNow &&
						(filterType === PRICE_FILL_TYPE._1Y || filterType === PRICE_FILL_TYPE._3Y)
					)) {
					dataChart[lastBar.updated] = dataChart[lastBar.updated]
						? {
							...dataChart[lastBar.updated],
							...newData
						}
						: newData;
					dataChart[timePrice].close = dataChart[timePrice].close || dataChart[timePrice].trade_price || 0;
				}
			}
			return dataChart;
		} catch (error) {
			console.catch(error)
			return null
		}
	}

	async getSnapshotChart() {
		try {
			this.dic.maxValue = -99999999999999
			this.dic.minValue = 999999999999999
			const symbol = this.props.symbol
			const userID = Controller.getUserId()
			const apiType = 'check-exist'

			this.checkExitOnUserWatchList(symbol, userID, apiType)

			const dataChart = await Business.getDataChartPrice(this.props.symbol, this.state.filterType)

			this.dataChart = dataChart || {}

			if (this.dic.firstSnapshot) {
				this.dic.firstSnapshot = false
				this.dic.msgPreMount.map(newData => {
					this.dataChart = this.mergeDataWithLastBar(this.dataChart, this.state.filterType, newData)
				})
				this.dic.msgPreMount = []
			}
			if (Object.keys(this.dataChart).length > 0) {
				this.updateChartSnapshot(this.dataChart, this.state.filterType);
			} else {
				this.updateChartSnapshot({ noData: true }, this.state.filterType);
			}

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	getTextForStatusInFavorites() {
		switch (this.state.statusInFavorites) {
			case STATUS_IN_FAVORITES.ADDING:
				return I18n.t('Added', { locale: this.props.setting.lang })
			case STATUS_IN_FAVORITES.REMOVING:
				return I18n.t('Removed', { locale: this.props.setting.lang })
			case STATUS_IN_FAVORITES.IN:
				return `- ${I18n.t('favorites', { locale: this.props.setting.lang })}`
			case STATUS_IN_FAVORITES.OUT:
				return `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`
			default:
				return ''
		}
	}

	processChart(dataChart, filterType) {
		try {
			const isChartDay = filterType === PRICE_FILL_TYPE._1D
			const keysSorted = dataChart
				? Object.keys(dataChart).sort((a, b) => a - b)
				: []
			const firstDateValue = keysSorted.length > 0
				? dataChart[keysSorted[0]].close
				: 0
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

			if (dataChart && !dataChart.noData) {
				for (let index = 0; index < keysSorted.length; index++) {
					const key = keysSorted[index]
					const data = dataChart[key]
					if (parseFloat(data.close) <= parseFloat(data.open)) {
						listColor.push(processColor('rgba(193, 0, 0, 0.15)'));
					} else {
						listColor.push(processColor('rgba(0, 66, 0, 0.15)'));
					}

					let dataChanged = 0
					let dataPre
					if (index > 0) {
						const keyPre = keysSorted[index - 1];
						dataPre = dataChart[keyPre];
						if (this.state.chartType === '%') {
							dataChanged = data.close - firstDateValue;
						} else {
							dataChanged = data.close - dataPre.close;
						}
					}

					const timeStamp = parseInt(key)
					const date = new Date(timeStamp)
					const labelTimeFormat = isChartDay ? 'HH:mm' : 'MMM YYYY'
					let label = getDateStringWithFormat(date, labelTimeFormat)
					let marker = ''
					if (filterType !== PRICE_FILL_TYPE._3Y) {
						label = getDateStringWithFormat(date, labelTimeFormat);
					}

					labelsP.push(label);
					const dataTemp = this.state.chartType === '$'
						? data.close
						: (dataPre && dataPre.close > 0
							? 100 * dataChanged / firstDateValue
							: 0)
					if (dataTemp >= this.dic.maxValue) {
						this.dic.maxValue = dataTemp;
					}
					if (dataTemp <= this.dic.minValue) {
						this.dic.minValue = dataTemp;
					}
					listData.push({
						y: dataTemp,
						marker: `${FuncUtil.renderTime(timeStamp, labelTimeFormat)}\n ${this.state.displayName}: ${FuncUtil.formatNumberNew2(dataTemp, PRICE_DECIMAL.VALUE)}${this.state.chartType === '%' ? '%' : ''}`
					})

					const temp = {};
					const temp2 = {};
					const closeMarker = data.close === 0 ? '--' : FuncUtil.formatNumberNew2(data.close, PRICE_DECIMAL.PRICE);
					marker = `${FuncUtil.renderTime(timeStamp, labelTimeFormat)} - O: ${FuncUtil.formatNumberNew2(data.open, PRICE_DECIMAL.PRICE)}  H: ${FuncUtil.formatNumberNew2(data.high, PRICE_DECIMAL.PRICE)}  L: ${FuncUtil.formatNumberNew2(data.low, PRICE_DECIMAL.PRICE)}  C: ${closeMarker}  Vol: ${FuncUtil.largeValue(data.volume)}`
					if ((data.open !== undefined && data.open !== null) &&
						(data.high !== undefined && data.high !== null) &&
						(data.low !== undefined && data.low !== null) &&
						(data.close !== undefined && data.close !== null)) {
						labelsM.push(label);
						temp2.y = parseInt(data.volume) || 0;
						temp2.marker = marker;
						listVolume.push(temp2);
						listMax.push(Math.max(data.high, data.low, data.close, data.open));
						listMin.push(Math.min(data.high, data.low, data.close, data.open));
						temp.shadowH = parseFloat(data.high);
						temp.shadowL = parseFloat(data.low);
						temp.open = parseFloat(data.open);
						temp.close = parseFloat(data.close);
						temp.marker = marker;
						listCandle.push(temp);
						listTemp.push(parseInt(data.volume) || 0);
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
			if (isChartDay && listData.length > 0) {
				const isAuBySymbol = Util.isAuBySymbol(this.props.symbol);
				const now = new Date().getTime();
				const checkTimeCloseSession = Util.checkCloseSessionBySymbol(now, isAuBySymbol);
				if (checkTimeCloseSession) {
					labelLength = listData.length;
				} else {
					labelLength = Util.isAuBySymbol(this.props.symbol) ? 74 : 78
				}
			}
			this.setState({
				listData,
				listColor,
				isLoading: false,
				labelsP,
				labelsM,
				maxLeft: maxLeft || 0,
				minRight,
				maxRight,
				listCandle,
				listVolume,
				labelLength
			})

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	onSelectChartValue() {
		this.changeChartType(CHART_TYPE.VALUE)
	}

	onSelectChartPercent() {
		this.changeChartType(CHART_TYPE.PERCENT)
	}

	changeChartType(type = CHART_TYPE.VALUE) {
		try {
			if (this.state.chartType === type) return false
			this.setState({
				isLoading: true,
				chartType: type
			});
			this.getSnapshotChart()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	updateChartSnapshot(val, filterType) {
		try {
			const dataChart = this.addCurrentPriceToChart(val, filterType)
			this.processChart(dataChart, filterType)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	updateChartStreaming(newData) {
		try {
			if (this.dic.firstSnapshot) {
				this.dic.msgPreMount.push(newData)
				return true
			}
			this.dataChart = this.mergeDataWithLastBar(this.dataChart, this.state.filterType, newData)
			if (!this.dic.allowRender) return false
			this.processChart(this.dataChart, this.state.filterType)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	renderLoading() {
		return <View style={[GlobalStyle.progressBarWhite]}>
			<ProgressBar />
		</View>
	}

	render() {
		try {
			const rowData = this.dic.priceObject;
			const count = 5;
			const point = (this.dic.maxValue - this.dic.minValue) / count;
			const CombineChart = this.dic.priceBoardID === Enum.WATCHLIST.TOP_ASX_INDEX
				? ChartIndices
				: ChartNew

			return (
				<View style={this.dic.style}>
					{
						this.state.isLoading
							? this.renderLoading()
							: (
								this.state.chartType === '$'
									? <CombineChart
										isAuBySymbol={Business.isParitech(rowData.symbol)}
										listData={this.state.listCandle}
										listColor={this.state.listColor}
										listVolume={this.state.listVolume}
										labels={this.state.labelsM}
										maxRight={this.state.maxRight}
										maxLeft={this.state.maxLeft}
										minRight={this.state.minRight}
										touchEnabled={true}
										isChartDay={this.state.filterType === PRICE_FILL_TYPE._1D}
										labelLength={this.state.labelLength}
									/>
									: <Chart
										isAuBySymbol={Business.isParitech(rowData.symbol)}
										data={this.state.listData}
										code={rowData.symbol}
										labels={this.state.labelsP}
										axisMaximum={this.dic.maxValue + point}
										axisMinimum={this.dic.minValue - point}
										formater={'#0.00'}
										touchEnabled={true}
										labelCount={count}
										isChartDay={this.state.filterType === PRICE_FILL_TYPE._1D}
										labelLength={this.state.labelLength}
									/>
							)
					}
					<View style={{ width: '100%', height: 10 }}></View>
					<View style={[styles.filterContainer]}>
						<View style={{ width: '20%', flexDirection: 'row' }}>
							<TouchableOpacity
								style={styles.filterButton}
								onPress={this.onShowModalPicker.bind(this)}>
								<Text testID={`${rowData.symbol}wlFilter`} style={GlobalStyle.textSubMediumWhite}>
									{this.dic.selectedItem}
								</Text>
								<IonIcons name='md-arrow-dropdown' size={20} style={styles.iconModal} />
							</TouchableOpacity>
						</View>
						{
							this.props.login.isLogin
								? this.dic.priceBoardID === Enum.WATCHLIST.TOP_ASX_INDEX
									? <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} />
									: <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
										<TouchableOpacity
											style={styles.priceWatchListButton}
											disabled={
												this.state.statusInFavorites === STATUS_IN_FAVORITES.ADDING ||
												this.state.statusInFavorites === STATUS_IN_FAVORITES.REMOVING
											}
											onPress={this.onAddToWatchList}>
											<Text style={GlobalStyle.textSubMediumWhite}>
												{this.getTextForStatusInFavorites()}
											</Text>
										</TouchableOpacity>
									</View>
								: null
						}
						<View style={{ width: this.props.login.isLogin ? '30%' : '80%', flexDirection: 'row', justifyContent: 'flex-end' }}>
							<TouchableOpacity
								onPress={this.onSelectChartValue}
								style={[
									styles.tabButton1,
									{
										backgroundColor: this.state.chartType === '$'
											? config.colorVersion
											: '#ffffff'
									}
								]}>
								<Text
									testID={`${rowData.symbol}$Button`}
									style={[
										this.state.chartType === '$'
											? GlobalStyle.textSubMediumWhite
											: GlobalStyle.textSubGreen,
										{
											fontWeight: this.state.chartType === '$'
												? 'bold'
												: 'normal'
										}
									]}>
									{I18n.t('moneySymbol', { locale: this.props.setting.lang })}</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={this.onSelectChartPercent}
								style={[
									styles.tabButton2,
									{
										backgroundColor: this.state.chartType === '%'
											? config.colorVersion
											: '#ffffff'
									}
								]}>
								<Text
									testID={`${rowData.symbol}%Button`}
									style={[
										this.state.chartType === '%'
											? GlobalStyle.textSubMediumWhite
											: GlobalStyle.textSubGreen,
										{
											fontWeight: this.state.chartType === '%'
												? 'bold'
												: 'normal'
										}
									]}>
									{I18n.t('percentSymbol', { locale: this.props.setting.lang })}</Text>
							</TouchableOpacity>
						</View>
					</View>
					<ModalPicker
						listItem={this.dic.listDisplay}
						onSelected={this.onSelected.bind(this)}
						selectedItem={this.dic.selectedItem}
						visible={this.state.modalVisible}
						title={I18n.t('selectTime')}
						onClose={this.onClose.bind(this)} />
				</View>
			)
		} catch (error) {
			console.catch(error)
			return <View />
		}
	}
};
