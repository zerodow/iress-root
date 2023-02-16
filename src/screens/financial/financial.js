import React, { Component } from 'react';
import { View, Text, ScrollView, processColor, TouchableOpacity, PixelRatio, Dimensions } from 'react-native';
import I18n from '../../modules/language';
import styles from './style/financial';
import { getDateStringWithFormat, convertToDate, addDaysToTime } from '../../lib/base/dateTime';
import HighLightText from '../../modules/_global/HighLightText';
import { Navigation } from 'react-native-navigation';
import {
	formatNumber,
	convertFormatToNumber,
	logAndReport,
	logDevice,
	log,
	formatNumberNew2,
	renderTime
} from '../../lib/base/functionUtil';
import PieChart from './../pie_chart_fill/pie_chart';
import BarChart from './../bar_chart/bar_chart';
import { func, dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import StackedLineChart from './../stacked_line_chart/stacked_line_chart';
import moment from 'moment';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import { iconsMap as IconsMap } from '../../../src/utils/AppIcons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import RetryConnect from '../../component/retry_connect/retry_connect';
import loginUserType from '../../constants/login_user_type';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import { requestData, getReportUrl } from '../../api';
import apiReportEnum from '../../constants/api_report_enum';
import Enum from '../../enum';
import * as Util from '../../util';

const { width, height } = Dimensions.get('window');
const envConfig = config.environment
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
export class TotalReport extends Component {
	renderHeaderTotal() {
		return (
			<View style={[CommonStyle.headerInsights, { height: 48 }]}>
				<Text testID='financialReportTotalPortfolioLabel' style={[CommonStyle.whiteTextHeader, { width: '50%' }]}>{this.props.header}</Text>
				<Text testID='financialReportTotalPortfolioValue' style={[CommonStyle.whiteTextHeader, { width: '50%', textAlign: 'right' }]}>
					{formatNumberNew2(this.props.data.total_account_balance_value, PRICE_DECIMAL.VALUE)}
				</Text>
			</View>
		);
	}

	renderTotalContent() {
		const data = this.props.data;
		// console.log('data', data)
		return (
			<View>
				{/* <View style={styles.rowTotal}>
            <Text style={[styles.normalText, { width: '50%' }]}>{I18n.t('cashAccountInterest')}</Text>
            <Text style={[styles.normalText, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumber(this.props.data.cash_account_interest)}</Text>
          </View>
          <View style={styles.rowTotal}>
            <Text style={[styles.normalText, { width: '50%' }]}>{I18n.t('depositsIntoCashAccount')}</Text>
            <Text style={[styles.normalText, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumber(this.props.data.deposits)}</Text>
          </View>
          <View style={styles.rowTotal}>
            <Text style={[styles.normalText, { width: '50%' }]}>{I18n.t('withdrawalsFromCashAccount')}</Text>
            <Text style={[styles.normalText, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumber(this.props.data.withdrawals)}</Text>
          </View> */}
				<View style={styles.rowTotal}>
					<Text testID='financialReportNetTradeFlowsLabel' style={[CommonStyle.textMainNormal, { width: '50%' }]}>{I18n.t('netTradeFlows')}</Text>
					<HighLightText
						style={[CommonStyle.textMainNormalNoColor, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}
						base={formatNumberNew2(this.props.data.net_trade_flows, PRICE_DECIMAL.VALUE)}
						value={formatNumberNew2(this.props.data.net_trade_flows, PRICE_DECIMAL.VALUE)} />
				</View>
				<View style={styles.rowTotal}>
					<Text testID='financialReportTotalBrokerageLabel' style={[CommonStyle.textMainNormal, { width: '50%' }]}>{I18n.t('totalFees')}</Text>
					<Text testID='financialReportTotalBrokerageValue' style={[CommonStyle.textMainNormal, {
						width: '50%',
						textAlign: 'right',
						paddingLeft: 24
					}]}>{formatNumberNew2(this.props.data.total_brokerage, PRICE_DECIMAL.VALUE)}</Text>
				</View>
				{/* <View style={styles.rowTotal}>
            <Text style={[styles.normalText, { width: '50%' }]}>{I18n.t('informationServiceFees')}</Text>
            <Text style={[styles.normalText, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumber(this.props.data.service_fees)}</Text>
          </View>
          <View style={styles.rowTotal}>
            <Text style={[styles.normalText, { width: '50%' }]}>{I18n.t('estimatedDividends')}</Text>
            <Text style={[styles.normalText, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumber(this.props.data.estimated_dividends)}</Text>
          </View>
          <View style={styles.rowTotal}>
            <Text style={[styles.normalText, { width: '50%' }]}>{I18n.t('estimatedFrankingCredits')}</Text>
            <Text style={[styles.normalText, { width: '50%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumber(this.props.data.estimated_franking_credits)}</Text>
          </View> */}
			</View>
		);
	}

	render() {
		return (
			<View style={{ width: '100%' }}>
				{this.renderHeaderTotal()}
				{this.renderTotalContent()}
			</View>
		);
	}
}

export class SubReport extends Component {
	renderHeaderContent() {
		return (
			<View style={styles.headerContent}>
				<Text style={styles.headerText}>{this.props.header}</Text>
			</View>
		);
	}

	renderContent() {
		return (
			<View style={{ width: '100%', paddingLeft: 16 }}>
				<View style={[styles.rowContent, { borderBottomWidth: 1, borderColor: '#0000001e' }]}>
					<Text style={[styles.normalText, { width: '40%' }]}>{I18n.t('startOfPeriod')}</Text>
					<Text style={[styles.normalText, { width: '60%', textAlign: 'right', paddingLeft: 24 }]}>{formatNumberNew2(this.props.startValue, PRICE_DECIMAL.VALUE)}</Text>
				</View>
				<View style={styles.rowContent}>
					<Text style={[styles.seg1, styles.normalText]}>{I18n.t('endOfPeriod')}</Text>
					<HighLightText style={[styles.seg2, styles.textHighLight]} base={formatNumber(this.props.changeValue)} value={formatNumber(this.props.changeValue)} />
					<Text style={[styles.seg3, styles.normalText]}>{formatNumberNew2(this.props.endValue, PRICE_DECIMAL.VALUE)}</Text>
				</View>
			</View>
		);
	}

	render() {
		return (
			<View style={{ width: '100%' }}>
				{this.renderHeaderContent()}
				{this.renderContent()}
			</View>
		);
	}
}

export class ReportHeader extends Component {
	render() {
		const timeStart = getDateStringWithFormat(convertToDate(this.props.fromDate), 'DD MMM YYYY')
		const timeEnd = getDateStringWithFormat(convertToDate(this.props.toDate), 'DD MMM YYYY')
		let distanceTime = `${timeStart} - ${timeEnd}`;
		if (this.props.fromDate === this.props.toDate) {
			distanceTime = `${timeStart}`;
		}
		return (
			<View style={styles.headerReportContainer}>
				<Text testID='financialReportName' style={[CommonStyle.textHeaderInsights, { marginBottom: 5 }]}>{this.props.reportName}</Text>
				<Text testID='financialDistanceTime' style={CommonStyle.textTimeInsights}>{distanceTime}</Text>
			</View>
		);
	}
}

export class FinancialSummary extends Component {
	constructor(props) {
		super(props);
				this.colors = ['#6494ed', '#32cd32'];
		this.fbAccount = null;
		this.fbReport = null;
		this.perf = null;
		this.userId = func.getUserId();
		this.reportCallback = this.reportCallback.bind(this);
		this.setLeftButton = this.setLeftButton.bind(this);
		this.startYear = convertToDate(this.props.fromDate).getFullYear();
		this.endYear = convertToDate(this.props.toDate).getFullYear();
		this.startMonth = getDateStringWithFormat(convertToDate(this.props.fromDate), 'MM/YYYY');
		this.endMonth = getDateStringWithFormat(convertToDate(this.props.toDate), 'MM/YYYY');

		// const from = convertToDate(this.props.fromDate);
		// const to = convertToDate(this.props.toDate);
		// const addToDate = addDaysToTime(to, 1);
		// this.fromDate = from.getTime();
		// this.toDate = addToDate.getTime() - 1;
		this.fromDate = this.props.fromDate
		this.toDate = this.props.toDate

		this.perf = new Perf(performanceEnum.show_report_financial);
		this.reportNowRef = null;
		this.isSameDay = this.props.fromDate === this.props.toDate;
		// this.isSameDay = false;
		this.state = {
			emptyF: false,
			emptyS: false,
			emptyE: false,
			colorsE: [],
			colorsS: [],
			isLoading: true,
			data: {},
			all: [],
			holdings: [],
			sameYear: this.startYear === this.endYear,
			sameMonth: this.startMonth === this.endMonth,
			cash: [],
			listData1: [],
			listData2: [],
			endValues: [],
			valueFormatter: [],
			startValues: [],
			data1: {
				holdingChange: 0,
				cashChange: 0,
				portfolioChange: 0
			},
			canRenderPieChartStart: true,
			canRenderPieChartEnd: true
		};
		this.getData = this.getData.bind(this);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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

	reportCallback(params) {
		try {
			const dataReport = params
			if (!dataReport) {
				return;
			}
			const endValues = [];
			const startValues = [];
			const listMonth = dataReport.list_month || [];
			let max = Math.max(dataReport.account_balance_end_of_period || 0, dataReport.cash_end_of_period || 0, dataReport.holdings_end_of_period || 0,
				dataReport.account_balance_start_of_period || 0, dataReport.cash_start_of_period || 0, dataReport.holdings_start_of_period || 0);
			max = this.checkMax(max);
			endValues.push(
				{ y: dataReport.account_balance_end_of_period || 0, marker: formatNumberNew2(dataReport.account_balance_end_of_period, PRICE_DECIMAL.VALUE) }
			);
			endValues.push(
				{ y: dataReport.cash_end_of_period || 0, marker: formatNumberNew2(dataReport.cash_end_of_period, PRICE_DECIMAL.VALUE) }
			);
			endValues.push(
				{ y: dataReport.holdings_end_of_period || 0, marker: formatNumberNew2(dataReport.holdings_end_of_period, PRICE_DECIMAL.VALUE) }
			);

			startValues.push(
				{
					y: dataReport.account_balance_start_of_period || 0,
					marker: formatNumberNew2(dataReport.account_balance_start_of_period, PRICE_DECIMAL.VALUE)
				}
			);
			startValues.push(
				{ y: dataReport.cash_start_of_period || 0, marker: formatNumberNew2(dataReport.cash_start_of_period, PRICE_DECIMAL.VALUE) }
			);
			startValues.push(
				{
					y: dataReport.holdings_start_of_period || 0,
					marker: formatNumberNew2(dataReport.holdings_start_of_period, PRICE_DECIMAL.VALUE)
				}
			);
			if (dataReport.holdings_start_of_period === 0 && dataReport.cash_start_of_period === 0) {
				this.setState({ canRenderPieChartStart: false });
			}
			if (dataReport.holdings_end_of_period === 0 && dataReport.cash_end_of_period === 0) {
				this.setState({ canRenderPieChartEnd: false });
			}
			const obj = {
				holdingChange: dataReport.change_value_holdings,
				cashChange: dataReport.change_value_cash,
				portfolioChange: dataReport.change_value_porfolio
			}
			const listData1 = [];
			const listData2 = [];
			let emptyS = false;
			let emptyE = false;
			let emptyF = false;
			if ((dataReport.percent_holdings_start === 0 || !dataReport.percent_holdings_start) &&
				(dataReport.percent_cash_start === 0 || !dataReport.percent_cash_start)) {
				emptyS = true;
			}
			if ((dataReport.percent_holdings_end === 0 || !dataReport.percent_holdings_end) &&
				(dataReport.percent_cash_end === 0 || !dataReport.percent_cash_end)) {
				emptyE = true;
			}
			if (emptyS && emptyE) {
				emptyF = true;
			}
			const colorsS = [];
			const holdingS = dataReport.percent_holdings_start ? (dataReport.percent_holdings_start < 0.01 ? 0 : dataReport.percent_holdings_start) : 0;
			const cashS = dataReport.percent_cash_start ? (dataReport.percent_cash_start < 0.01 ? 0 : dataReport.percent_cash_start) : 0;
			if (holdingS !== 0 && holdingS >= 0.01) {
				const labelHolS = formatNumberNew2(holdingS, PRICE_DECIMAL.PERCENT) + '%'
				listData1.push({ value: holdingS / 100, label: labelHolS });
				colorsS.push(processColor(this.colors[1]));
			}
			if (cashS !== 0) {
				const labelCashS = formatNumberNew2(cashS, PRICE_DECIMAL.PERCENT) + '%'
				listData1.push({ value: cashS / 100, label: labelCashS });
				colorsS.push(processColor(this.colors[0]));
			}
			const colorsE = [];
			const holdingE = dataReport.percent_holdings_end ? (dataReport.percent_holdings_end < 0.01 ? 0 : dataReport.percent_holdings_end) : 0;
			const cashE = dataReport.percent_cash_end ? (dataReport.percent_cash_end < 0.01 ? 0 : dataReport.percent_cash_end) : 0;
			if (holdingE !== 0) {
				const labelHolE = formatNumberNew2(holdingE, PRICE_DECIMAL.PERCENT) + '%'
				listData2.push({ value: parseFloat(holdingE / 100), label: labelHolE });
				colorsE.push(processColor(this.colors[1]));
			}
			if (cashE !== 0) {
				const labelCashE = formatNumberNew2(cashE, PRICE_DECIMAL.PERCENT) + '%'
				listData2.push({ value: parseFloat(cashE / 100), label: labelCashE });
				colorsE.push(processColor(this.colors[0]));
			}
			this.setState({
				isLoading: false,
				data: dataReport,
				// all: allTemp,
				sameMonth: listMonth.length < 2,
				// holdings: holdingsTemp,
				// cash: cashTemp,
				data1: obj,
				maximum: max,
				endValues: endValues,
				listData1,
				// valueFormatter,
				emptyE,
				emptyS,
				emptyF,
				listData2,
				colorsE,
				colorsS,
				startValues: startValues
			}, () => {
				this.perf && this.perf.stop();
			});
		} catch (error) {
			console.log('reportCallback financial logAndReport exception: ', error)
			logAndReport('reportCallback financial exception', error, 'reportCallback financial');
			logDevice('info', `reportCallback financial exception: ${error}`);
		}
	}

	checkMax(max) {
		// level = max / 100;
		// level = parseInt(level)
		// max = level * 100;
		// max = Math.round(max);
		// let number = max % 25;
		// let number1 = max / 25;
		// let newMax = 0;
		// if (number !== 0) {
		//   newMax = (number1 + 1) * 25;
		// } else {
		//   newMax = max;
		// }
		return max;
	}

	componentDidMount() {
		this.perf && this.perf.incrementCounter(performanceEnum.show_report_financial);
		this.getData();
		this.setLeftButton();
	}

	getData() {
		try {
			this.perf = new Perf(performanceEnum.get_data_report_fianncial);
			this.perf && this.perf.start();
			const now = new Date().getTime();
			const url = `${getReportUrl(apiReportEnum.FINANCIAL, dataStorage.accountId, this.fromDate, this.toDate)}`;
			requestData(url).then(data => {
				if (data) {
					this.reportCallback(data);
				} else {
					this.setState({ isLoading: false });
				}
			});
		} catch (error) {
			this.setState({ isLoading: false });
			logAndReport(`Report Financial error: ${error}`);
			logDevice('info', `Report Financial error: ${error}`);
		}
	}

	renderHeader() {
		return (
			<View style={CommonStyle.headerInsights}>
				<Text style={[{ width: '100%' }, CommonStyle.whiteTextHeader]}>{I18n.t('summaryInformation')}</Text>
			</View>
		);
	}

	componentWillMount() {
		setCurrentScreen(analyticsEnum.reportFinancial);
	}

	setLeftButton() {
		this.props.navigator.setButtons({
			leftButtons: [{
				id: 'back_button',
				icon: Util.isIOS()
					? IconsMap['ios-arrow-back']
					: IconsMap['md-arrow-back'],
				testID: 'buttonBack'
			}]
		});
	}

	render() {
		const loading = (
			<View style={{
				backgroundColor: CommonStyle.backgroundColor,
				width: '100%',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				<ProgressBar />
			</View>);
		if (this.state.isLoading) {
			if (!this.props.isConnected) {
				return (
					<RetryConnect onPress={() => this.getData()} />
				);
			}
			return loading;
		}
		return (
			<View testID='financialReport' style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
				<ScrollView
					testID='financialReportScrollView'
					directionalLockEnabled={true}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					bounces={false}>
					<ReportHeader
						reportName={I18n.t('financialSummary', { locale: this.props.setting.lang })}
						fromDate={this.props.fromDate}
						toDate={this.props.toDate} />
					{
						dataStorage.loginUserType === loginUserType.REVIEW ? null : (
							<View style={{ flex: 1 }}>
								{this.renderHeader()}
								<View style={{ height: 300, marginVertical: 24, marginHorizontal: 16 }}>
									<BarChart
										testID='financialBarChart'
										endValues={this.state.endValues}
										data={this.state.data1} startValues={this.state.startValues}
										maximum={this.state.maximum || 5} isSameDay={this.isSameDay} />
								</View>
								<View style={CommonStyle.headerInsights}>
									<Text style={CommonStyle.whiteTextHeader}>{I18n.t('cashHoldingChart', { locale: this.props.setting.lang })}</Text>
								</View>
								{
									this.state.emptyF ? null : (
										<View testID='cashHoldingChart' style={{ width: '100%', flexDirection: 'column', height: height * 0.35, justifyContent: 'center', alignItems: 'center' }}>
											<View style={{ flexDirection: 'row', position: 'absolute', top: 16, right: 110, zIndex: 99999 }}>
												<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: dataStorage.platform === 'ios' ? 32 : 70 }}>
													<View style={[styles.circle, { backgroundColor: this.colors[0] }]} />
													<Text style={CommonStyle.noteChart}>{I18n.t('cash', { locale: this.props.setting.lang })}</Text>
												</View>
												<View style={{ flexDirection: 'row', alignItems: 'center' }}>
													<View style={[styles.circle, { backgroundColor: this.colors[1] }]} />
													<Text style={CommonStyle.noteChart}>{I18n.t('holdings', { locale: this.props.setting.lang })}</Text>
												</View>
											</View>
											<View style={{ width: '100%', flexDirection: 'row', height: height * 0.35, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColor }}>
												{
													this.state.emptyS ? null : (
														this.isSameDay ? null : (
															<View style={styles.doubleChartContainer}>
																<PieChart
																	testID={`financialPieChartFrom`}
																	colors={this.state.colorsS}
																	data={this.state.listData1}
																	description={`${this.props.fromDate}`} />
															</View>)
													)
												}
												{
													this.state.emptyE ? null : (
														<View style={styles.doubleChartContainer}>
															<PieChart
																testID={`financialPieChartTo`}
																colors={this.state.colorsE}
																data={this.state.listData2}
																description={`${this.props.toDate}`} />
														</View>
													)
												}
											</View>
										</View>
									)
								}
								<TotalReport header={I18n.t('portfolioSummary', { locale: this.props.setting.lang })} data={this.state.data} />
							</View>
						)
					}
				</ScrollView>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

export default connect(mapStateToProps)(FinancialSummary);
