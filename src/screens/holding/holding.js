import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, processColor, PixelRatio, FlatList } from 'react-native';
import I18n from '../../modules/language';
import styles from './style/holding';
import { getDateStringWithFormat, convertToDate, getMonthBetween, addDaysToTime } from '../../lib/base/dateTime';
import {
	getSymbolInfoApi,
	formatNumber,
	getDisplayName,
	formatNumberNew,
	roundFloat,
	getRandomColor,
	logDevice,
	formatNumberNew2,
	logAndReport,
	formatNumberNew2ClearZero,
	renderTime
} from '../../lib/base/functionUtil';
import { ReportHeader } from './../financial/financial';
import { func, dataStorage } from '../../storage';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ProgressBar from '../../modules/_global/ProgressBar';
import Big from 'big.js';
import PieChart from './../pie_chart_hole/pie_chart';
import Perf from '../../lib/base/performance_monitor';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RetryConnect from '../../component/retry_connect/retry_connect';
// import { format } from '../../../e2e/helper/datetime';
import loginUserType from '../../constants/login_user_type';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import { requestData, getReportUrl } from '../../api';
import apiReportEnum from '../../constants/api_report_enum';
import Enum from '../../enum';
import * as Util from '../../util';
import Flag from '../../component/flags/flag';
import * as Business from '../../business';

const envConfig = config.environment
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
export class SubReport extends Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	renderHeader() {
		const date = getDateStringWithFormat(convertToDate(this.props.date), 'DD MMM YYYY')
		const dateTime = `${date}`
		return (
			<View testID={`${this.props.testID}-Header`} style={[CommonStyle.headerInsights, { paddingVertical: 4, minHeight: 50 }]}>
				<Text style={[{ width: '100%' }, CommonStyle.textHeaderInsights]}>
					{`${I18n.t('holdingsValuationAt')} ${dateTime}`}
				</Text>
			</View>
		);
	}

	renderExtension() {
		return (
			<View style={{ height: 50, justifyContent: 'center', paddingHorizontal: 16 }}>
				<TouchableOpacity
					onPress={() => console.warn('open link')}>
					<Text style={styles.extensionText}>{I18n.t('equities', { locale: this.props.lang })}</Text>
				</TouchableOpacity>
			</View>
		);
	}

	renderHeaderContent() {
		const curAccount = dataStorage.currentAccount && dataStorage.currentAccount.currency;
		return (
			<View style={CommonStyle.headerContentInsights}>
				<View style={{ flexDirection: 'row' }}>
					<Text testID={`${this.props.testID}-symbolLabel`} style={[styles.textMainHeader, styles.col1]}>{I18n.t('symbolUpper', { locale: this.props.lang })}</Text>
					<Text testID={`${this.props.testID}-quantityLabel`} style={[styles.textMainHeader, styles.col2, { textAlign: 'right' }]}>{I18n.t('quantityUpper', { locale: this.props.lang })}</Text>
					<Text testID={`${this.props.testID}-valueAUDLabel`} style={[styles.textMainHeader, styles.col3, { textAlign: 'right' }]}>{I18n.t('valueUpper', { locale: this.props.lang })} {`(${curAccount})`}</Text>
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text testID={`${this.props.testID}-companyLabel`} style={[styles.textSubHeader, styles.col1]}>{I18n.t('securityUpper', { locale: this.props.lang })}</Text>
					<Text testID={`${this.props.testID}-priceLabel`} style={[styles.textSubHeader, styles.col2, { textAlign: 'right' }]}>{I18n.t('priceUpper', { locale: this.props.lang })}</Text>
					<Text testID={`${this.props.testID}-valueAUDLabel`} style={[styles.textSubHeader, styles.col3, { textAlign: 'right' }]}>{I18n.t('valueUpper', { locale: this.props.lang })}</Text>
				</View>
			</View>
		);
	}

	renderFooter() {
		return (
			<View style={CommonStyle.footerInsights}>
				<Text testID={`${this.props.testID}-TotalFooter`} style={[CommonStyle.textMain, { width: '40%' }]}>{I18n.t('totalUpperAUD', { locale: this.props.lang })}</Text>
				<Text style={[CommonStyle.textMain, { textAlign: 'right', width: '60%' }]}>
					{formatNumberNew2(this.props.totalFooterValue, PRICE_DECIMAL.VALUE)}
				</Text>
			</View>
		);
	}

	renderRowContent() {
		const { data } = this.props;
		const DIC_SYMBOL = dataStorage.symbolEquity || {};
		const curAccount = dataStorage.currentAccount && dataStorage.currentAccount.currency;
		return (
			<View style={{ width: '100%', paddingLeft: 16, backgroundColor: CommonStyle.backgroundColor }}>
				{
					data.map((e, i) => {
						const curSymbol = e.symbol && DIC_SYMBOL[e.symbol] && DIC_SYMBOL[e.symbol].currency;
						const checkCur = Util.checkCurrency(curSymbol, curAccount);
						// const company = dataStorage.symbolEquity[e.symbol] ? (dataStorage.symbolEquity[e.symbol].company_name || dataStorage.symbolEquity[e.symbol].company) : ''
						const company = e.company_name || e.symbol || '';
						const companyName = company.toUpperCase()
						const exchange = dataStorage.symbolEquity[e.symbol] && dataStorage.symbolEquity[e.symbol].exchange && dataStorage.symbolEquity[e.symbol].exchange[0] ? `.${dataStorage.symbolEquity[e.symbol].exchange[0]}` : '';
						const code = e.symbol;
						const displayName = e.symbol === 'OTHERS' ? 'OTHERS' : getDisplayName(e.symbol)
						const flagIcon = Business.getFlag(e.symbol);
						return (
							<View key={i} style={[styles.rowContent, { borderColor: CommonStyle.fontBorderGray, backgroundColor: CommonStyle.backgroundColor, borderBottomWidth: i === data.length - 1 ? 0 : 1 }]}>
								<View style={{ flexDirection: 'row' }}>
									<Text testID={`${this.props.testID}${i}-symbolValue`} style={[CommonStyle.textMain, styles.col1]}>
										{`${getDisplayName(e.symbol)}`}
									</Text>
									<View style={[{ flex: 1, alignItems: 'flex-end' }]}>
										<Flag
											type="flat"
											code={flagIcon}
											size={18}
										/>
									</View>
									<Text testID={`${this.props.testID}${i}-quantityValue`} style={[CommonStyle.textMain, styles.col2, { textAlign: 'right' }]}>
										{formatNumber(e.quantity)}
									</Text>
									<Text testID={`${this.props.testID}${i}-valueAUDValue`} style={[CommonStyle.textMain, styles.col3, { textAlign: 'right', textAlignVertical: 'center' }]}>
										{formatNumberNew2(e.value_convert || e.value_covert, PRICE_DECIMAL.VALUE)}
									</Text>
								</View>
								<View style={{ flexDirection: 'row' }}>
									<Text testID={`${this.props.testID}${i}-companyValue`} style={[CommonStyle.textSub, styles.col1]}>{companyName}</Text>
									<Text testID={`${this.props.testID}${i}-priceValue`} style={[CommonStyle.textSub, styles.col2, { textAlign: 'right' }]}>{formatNumberNew2(e.price, PRICE_DECIMAL.PRICE)}</Text>
									<Text testID={`${this.props.testID}${i}-valueValue`} style={[CommonStyle.textSub, styles.col3, { textAlign: 'right', textAlignVertical: 'center' }]}>
										{checkCur ? '' : formatNumberNew2(e.value, PRICE_DECIMAL.VALUE)}
									</Text>
								</View>
							</View>
						)
					})
				}
			</View>
		);
	}

	render() {
		if (this.props.data.length > 0) {
			return (
				<View style={{ width: '100%' }}>
					{this.renderHeader()}
					{/* {this.renderExtension()} */}
					{this.renderHeaderContent()}
					{this.renderRowContent()}
					{this.renderFooter()}
				</View>
			);
		} else {
			return (
				<View />
			);
		}
	}
}

export class HoldingChart extends Component {
	constructor(props) {
		super(props);
		this.state = {
			listData: this.props.listData,
			listColors: this.props.listColors,
			listLabels: this.props.listLabels,
			listColorsHex: this.props.listColorsHex
		}
	}

	renderHeaderchart() {
		return (
			<View style={[CommonStyle.headerInsights, { paddingVertical: 4, minHeight: 50 }]}>
				<Text
					style={[{ width: '100%' }, CommonStyle.textHeaderInsights]}>{`${I18n.t('holdingsValuationAt')} ${getDateStringWithFormat(convertToDate(this.props.date), 'DD MMM YYYY')} Chart`}</Text>
			</View>
		);
	}

	renderChart() {
		try {
			const listDataChart = this.state.listData.filter((data) => {
				return formatNumber(data.value, 6) >= 0;
			});
			console.log('listDataChart', listDataChart)
			console.log('this.state.listData', this.state.listData)
			const listColorsChart = this.state.listColors.length > listDataChart.length ? this.state.listColors.splice(0, listDataChart.length) : this.state.listColors;
			const listLabelsChart = [];
			const listFlag = []
			for (i = 0; i < this.state.listData.length; i++) {
				if (formatNumber(this.state.listData[i].value, 6) >= 0) {
					listLabelsChart.push(getDisplayName(this.state.listData[i].code));
					listFlag.push(Business.getFlag(this.state.listData[i].symbol))
				}
			}

			const listColorsHex = this.state.listColors.length > listDataChart.length ? this.state.listColorsHex.splice(0, listDataChart.length) : this.state.listColorsHex;
			return (
				<View testID={this.props.testID} style={this.props.rowContainer}>
					<View style={styles.colChart1}>
						<PieChart data={listDataChart} listColors={listColorsChart} listLabels={listLabelsChart} holdingReport={true} />
					</View>
					<View style={styles.colChart2}>
						{
							listDataChart.map((e, i) =>
								<View key={i} style={styles.colChart2rowContainer}>
									<View style={[styles.colChart2_1, { backgroundColor: listColorsHex[i], height: 8, width: 8, borderRadius: 4, marginTop: 5.5 }]} />
									<Text style={[CommonStyle.colChart2_2, { fontSize: CommonStyle.fontSizeXS, marginTop: 2 }]}>{Business.convertDisplayName(listLabelsChart[i])}</Text>
									{
										e.code === 'OTHERS'
											? <View style={[styles.colChart2_4, { marginTop: 0 }]} />
											: <Flag
												type="flat"
												code={listFlag[i]}
												size={18}
											/>
									}
									<Text style={[CommonStyle.colChart2_3, { marginTop: 2, fontSize: CommonStyle.fontSizeXS }]}>{formatNumberNew2(e.value * 100, PRICE_DECIMAL.PERCENT) === '100.00' ? '100' : formatNumberNew2(e.value * 100, PRICE_DECIMAL.PERCENT)}%</Text>
								</View>
							)
						}
					</View>
				</View>
			);
		} catch (error) {
			console.log('renderChart holdings logAndReport exception: ', error)
			logAndReport('renderChart holdings exception', error, 'renderChart holdings');
			logDevice('info', `renderChart holdings exception: ${error}`);
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			listData: nextProps.listData,
			listColors: nextProps.listColors,
			listLabels: nextProps.listLabels,
			listColorsHex: nextProps.listColorsHex
		});
	}

	render() {
		const description = `${I18n.t('holdingsValuationAt2')} ${getDateStringWithFormat(convertToDate(this.props.date), 'DD MMM YYYY')}`;
		const sumTotal = [];
		for (i = 0; i < this.state.listData.length; i++) {
			sumTotal.push(this.state.listData[i].value);
		}
		if (sumTotal.reduce((a, b) => a + b, 0) > 0) {
			return (
				<View style={{ width: '100%' }}>
					{this.renderHeaderchart()}
					<View style={{ paddingHorizontal: 16, paddingTop: 20, backgroundColor: CommonStyle.backgroundColor }}>
						<Text style={CommonStyle.chartDescriptionInsights}>{description}</Text>
					</View>
					{this.renderChart()}
				</View>
			);
		} else return null;
	}
}

export class HoldingsValuation extends Component {
	constructor(props) {
		super(props);
		this.colors = config.colors2;
		this.userId = func.getUserId();
		this.perf = new Perf(performanceEnum.show_report_holding);

		// const from = convertToDate(this.props.fromDate);
		// const to = convertToDate(this.props.toDate);
		// const addToDate = addDaysToTime(to, 1);
		// this.fromDate = from.getTime();
		// this.toDate = addToDate.getTime() - 1;
		this.fromDate = this.props.fromDate
		this.toDate = this.props.toDate

		this.sameDate = this.props.fromDate === this.props.toDate;
		this.getListPercentHolding = this.getListPercentHolding.bind(this);
		this.getStringQuery = this.getStringQuery.bind(this);
		this.handleTotalPercent = this.handleTotalPercent.bind(this);
		// this.sameDate = false;
		this.state = {
			isLoading: true,
			listDataS: [],
			listDataE: [],
			listOrderSOriginal: [],
			listOrderEOriginal: [],
			totalValueS: 0,
			totalValueE: 0,
			totalFooterValueS: 0,
			totalFooterValueE: 0,
			listColorsStart: [],
			listColorsEnd: [],
			listColorsEndHex: [],
			listColorsStartHex: [],
			listLabelsStart: [],
			listLabelsEnd: [],
			rowContainerStart: {
				backgroundColor: CommonStyle.backgroundColor,
				flexDirection: 'row',
				paddingHorizontal: CommonStyle.paddingSize,
				alignItems: 'center',
				width: '100%',
				height: 250
			},
			rowContainerEnd: {
				backgroundColor: CommonStyle.backgroundColor,
				flexDirection: 'row',
				paddingHorizontal: CommonStyle.paddingSize,
				alignItems: 'center',
				width: '100%',
				height: 250
			}
		};
		this.getData = this.getData.bind(this);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	componentWillMount() {
		setCurrentScreen(analyticsEnum.reportHolding);
	}

	componentDidMount() {
		this.getData();
	}

	getListPercentHolding(percentHolding) {
		const listNormalHolding = [];
		const listOtherHolding = [];
		// loc ra symbol co percent > 5  vao listNormalHolding va con lai vao listOtherHolding
		percentHolding.forEach(element => {
			if (element.percent_holdings !== null && element.percent_holdings !== undefined) {
				const code = `${getDisplayName(element.symbol)}`;
				const symbol = element.symbol
				const percent = element.percent_holdings * 100;
				if (percent > 5) {
					listNormalHolding.push({
						symbol,
						value: element.percent_holdings,
						code,
						marker: `${code} ${formatNumber(element.percent_holdings * 100, 2)}`
					});
				} else {
					listOtherHolding.push({
						symbol,
						value: element.percent_holdings,
						code,
						marker: `${code} ${formatNumber(element.percent_holdings * 100, 2)}`
					});
				}
			}
		});
		const objectPercentHolding = { listNormalHolding: listNormalHolding, listOtherHolding: listOtherHolding };
		return objectPercentHolding;
	}

	handleTotalPercent(listNormalHolding, listOther) {
		if (listNormalHolding.length !== 0 || listOther.length !== 0) {
			const other = [];
			let totalNomalHolding = 0;
			if (listOther.length === 0) {
				for (i = 0; i < listNormalHolding.length - 1; i++) {
					totalNomalHolding += parseFloat(formatNumber(listNormalHolding[i].value * 100, 2));
				}
				lastCodePercent = 100 - totalNomalHolding
				listNormalHolding[listNormalHolding.length - 1].value = lastCodePercent / 100
				listNormalHolding[listNormalHolding.length - 1].marker = `${listNormalHolding[listNormalHolding.length - 1].code} ${formatNumber(lastCodePercent, 2)}`
			} else if (listOther.length === 1) {
				for (i = 0; i < listNormalHolding.length; i++) {
					totalNomalHolding += parseFloat(formatNumber(listNormalHolding[i].value * 100, 2));
				}
				const otherPercentHolding = 100 - totalNomalHolding;
				other.push({
					value: otherPercentHolding / 100,
					code: listOther[0].code,
					marker: `${listOther[0].code} ${formatNumber(otherPercentHolding, 2)}`
				});
			} else if (listOther.length > 1) {
				for (i = 0; i < listNormalHolding.length; i++) {
					totalNomalHolding += parseFloat(formatNumber(listNormalHolding[i].value * 100, 2));
				}
				const otherPercentHolding = 100 - totalNomalHolding;
				other.push({
					value: otherPercentHolding / 100,
					code: 'OTHERS',
					marker: `OTHERS ${formatNumber(otherPercentHolding, 2)}`
				});
			}
			const listMarker = [...listNormalHolding, ...other];
			return listMarker;
		} else {
			return [];
		}
	}
	getStringQuery(listSymbol = []) {
		if (!listSymbol) return ''
		let stringQuery = '';
		for (let index = 0; index < listSymbol.length; index++) {
			const element = listSymbol[index];
			const code = element.symbol || element.code;
			if (code) {
				stringQuery += code + ',';
			}
		}
		if (stringQuery) {
			stringQuery = stringQuery.replace(/.$/, '');
		}
		if (stringQuery === '') {
			this.setState({ isLoading: false });
			return '';
		}
		return stringQuery;
	}

	getData() {
		try {
			this.perf = new Perf(performanceEnum.load_data_report_holding);
			this.perf && this.perf.start();
			const url = `${getReportUrl(apiReportEnum.HOLDING, dataStorage.accountId, this.fromDate, this.toDate)}`;
			requestData(url).then(data => {
				const dataReport = data;
				if (!dataReport) {
					this.setState({ isLoading: false });
					return;
				}
				const listOrderStart = dataReport.lst_start || [];
				const listOrderEnd = dataReport.lst_end || [];
				const listData = [...listOrderStart, ...listOrderEnd];
				const stringQuery = this.getStringQuery(dataReport.lst_start || []);
				getSymbolInfoApi(stringQuery, () => {
					const dataChartEnd = this.getListPercentHolding(dataReport.lst_end || []);
					const dataChartStart = this.getListPercentHolding(dataReport.lst_start || []);
					let listEndMaker = [];
					let listStartMaker = [];

					const listColorsEnd = [];
					const listColorsEndHex = [];
					const listLabelsEnd = [];
					const listColorsStart = [];
					const listColorsStartHex = [];
					const listLabelsStart = [];
					dataChartEnd.listNormalHolding = dataChartEnd.listNormalHolding.sort(
						(a, b) => {
							return b.value - a.value;
						}
					);

					dataChartStart.listNormalHolding = dataChartStart.listNormalHolding.sort(
						(a, b) => {
							return b.value - a.value;
						}
					);
					// truyen mang da sap xep
					listEndMaker = this.handleTotalPercent(dataChartEnd.listNormalHolding, dataChartEnd.listOtherHolding);
					listStartMaker = this.handleTotalPercent(dataChartStart.listNormalHolding, dataChartStart.listOtherHolding);

					// get color chart
					listEndMaker.map((e, i) => {
						listColorsEnd.push(processColor(this.colors[i]));
						listColorsEndHex.push(this.colors[i]);
						listLabelsEnd.push(e.code);
					});
					listStartMaker.map((e, i) => {
						listColorsStart.push(processColor(this.colors[i]));
						listColorsStartHex.push(this.colors[i]);
						listLabelsStart.push(e.code);
					});
					if (listStartMaker.length <= 6) {
						let heightEnd = 0;
						if (listEndMaker.length <= 6) {
							heightEnd = 0;
						} else {
							listLabelsEnd.forEach(
								(item, index) => {
									if (
										index > 5 &&
										item.length < 8
									) {
										heightEnd += 30;
									} else if (index > 5) {
										heightEnd += 60;
									}
								}
							);
						}
						this.setState({
							listDataS: listStartMaker,
							listDataE: listEndMaker,
							isLoading: false,
							listOrderSOriginal: dataReport.lst_start || [],
							listOrderEOriginal: dataReport.lst_end || [],
							totalValueS: dataReport.holding_start_of_period || 0,
							totalValueE: dataReport.holding_end_of_period || 0,
							totalFooterValueS: dataReport.total_start_of_period || 0,
							totalFooterValueE: dataReport.total_end_of_period || 0,
							listColorsStart,
							listColorsStartHex,
							listColorsEndHex,
							listColorsEnd,
							listLabelsStart,
							listLabelsEnd,
							rowContainerEnd: {
								...this.state.rowContainerEnd,
								height: 250 + heightEnd
							}
						}, () => {
							this.perf && this.perf.stop();
						});
					} else {
						let heightStart = 0;
						let heightEnd = 0;
						listLabelsStart.forEach(
							(item, index) => {
								if (
									index > 5 &&
									item.length < 8
								) {
									heightStart += 30;
								} else if (index > 5) {
									heightStart += 60;
								}
							}
						);
						if (listEndMaker.length <= 6) {
							heightEnd = 0;
						} else {
							listLabelsEnd.forEach(
								(item, index) => {
									if (
										index > 5 &&
										item.length < 8
									) {
										heightEnd += 30;
									} else if (index > 5) {
										heightEnd += 60;
									}
								}
							);
						}
						this.setState({
							listDataS: listStartMaker,
							listDataE: listEndMaker,
							isLoading: false,
							listOrderSOriginal: dataReport.lst_start || [],
							listOrderEOriginal: dataReport.lst_end || [],
							totalValueS: dataReport.holding_start_of_period || 0,
							totalValueE: dataReport.holding_end_of_period || 0,
							totalFooterValueS: dataReport.total_start_of_period || 0,
							totalFooterValueE: dataReport.total_end_of_period || 0,
							listColorsStart,
							listColorsStartHex,
							listColorsEndHex,
							listColorsEnd,
							listLabelsStart,
							listLabelsEnd,
							rowContainerStart: {
								...this.state.rowContainerStart,
								height: 250 + heightStart
							},
							rowContainerEnd: {
								...this.state.rowContainerEnd,
								height: 250 + heightEnd
							}
						}, () => {
							this.perf && this.perf.stop();
						});
					}
				});
			});
		} catch (error) {
			logDevice('info', `Holding load data report exception: ${error}`);
			logAndReport(`Holding load data report exception: ${error}`);
		}
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'back_button':
					this.props.navigator.pop({
						animated: true,
						animationType: 'slide-horizontal'
					});
					break;
			}
		}
	}

	render() {
		const loadingProgress = <View style={{ backgroundColor: CommonStyle.backgroundColor, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ReportHeader reportName={I18n.t('holdingsValuation')} fromDate={this.props.fromDate} toDate={this.props.toDate} />
			<ProgressBar />
		</View>;
		if (this.state.isLoading) {
			if (!this.props.isConnected) {
				return <RetryConnect onPress={() => this.getData()} />;
			}
			return loadingProgress;
		}
		return <View testID="holdingsReport" style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
			<ScrollView testID="holdingReportScrollView" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
				<ReportHeader reportName={I18n.t(
					'holdingsValuation',
					{ locale: this.props.setting.lang }
				)} fromDate={this.props.fromDate} toDate={this.props.toDate} />
				{dataStorage.loginUserType === loginUserType.REVIEW ? null : <View>
					<HoldingChart lang={this.props.setting.lang} testID="holdingChartE" listColors={this.state.listColorsEnd} listColorsHex={this.state.listColorsEndHex} listLabels={this.state.listLabelsEnd} listData={this.state.listDataE} date={this.props.toDate} rowContainer={this.state.rowContainerEnd} />

					<SubReport lang={this.props.setting.lang} testID="holdingSubReportE" listData={this.state.listDataE} data={this.state.listOrderEOriginal} totalValue={this.state.totalValueE} totalFooterValue={this.state.totalFooterValueE} date={this.props.toDate} />

					{!this.sameDate ? <HoldingChart lang={this.props.setting.lang} testID="holdingChartS" listColors={this.state.listColorsStart} listColorsHex={this.state.listColorsStartHex} listLabels={this.state.listLabelsStart} listData={this.state.listDataS} date={this.props.fromDate} rowContainer={this.state.rowContainerStart} /> : <View />}
					{!this.sameDate ? <SubReport lang={this.props.setting.lang} testID="holdingSubReportS" listData={this.state.listDataS} data={this.state.listOrderSOriginal} totalValue={this.state.totalValueS} totalFooterValue={this.state.totalFooterValueS} date={this.props.fromDate} /> : <View />}
				</View>}
			</ScrollView>
		</View>;
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

export default connect(mapStateToProps)(HoldingsValuation);
