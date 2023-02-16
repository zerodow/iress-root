import React, { Component } from 'react';
import { View, Text, ScrollView, Platform, PixelRatio, FlatList, ListView } from 'react-native';
import I18n from '../../modules/language';
import styles from './style/transaction';
import { getDateStringWithFormat, convertToDate, addDaysToTime, convertTimeStampUTCToTimeLocation } from '../../lib/base/dateTime';
import {
	getSymbolInfoApi, formatNumber, roundFloat, formatNumberNew2, logAndReport, log, formatNumberNew2ClearZero,
	logDevice, getStringToEnd, getDisplayName, renderTime
} from '../../lib/base/functionUtil';
import moment from 'moment';
import * as Util from '../../util';
import Big from 'big.js';
import { func, dataStorage } from '../../storage';
import { ReportHeader } from './../financial/financial';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import Enum from '../../enum';
import Perf from '../../lib/base/performance_monitor';
import RetryConnect from '../../component/retry_connect/retry_connect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProgressBar from '../../modules/_global/ProgressBar';
import loginUserType from '../../constants/login_user_type';
import * as appActions from '../../app.actions';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import { requestData, getApiUrl, getReportUrl, getSymbolUrl } from '../../api';
import apiReportEnum from '../../constants/api_report_enum';
import Flag from '../../component/flags/flag';
import * as Business from '../../business';
import * as Controller from '../../memory/controller'

const envConfig = config.environment
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export class SubReport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			displayName: Util.getStringable(this.props, 'symbolObj.display_name'),
			companyName: Util.getStringable(this.props, 'symbolObj.company_name')
		}
	}

	renderHeader() {
		const symbol = this.props.symbol;
		const flagIcon = Business.getFlag(symbol);
		return (
			<View style={CommonStyle.headerInsights}>
				<Text testID={`${this.props.testID}-leftHeader`} style={[{ paddingRight: 16 }, CommonStyle.textMainWhite]}>{this.state.displayName}</Text>
				<View style={[{ width: '5%' }]}>
					<Flag
						type="flat"
						code={flagIcon}
						size={18}
					/>
				</View>
				<Text testID={`${this.props.testID}-rightHeader`} style={[{ flex: 1, paddingLeft: 20, textAlign: 'right' }, CommonStyle.textMainWhite]}>
					{this.state.companyName}
				</Text>
			</View>
		);
	}

	renderHeaderContent() {
		const currencyAcc = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || Enum.CURRENCY.AUD;
		return (
			<View style={CommonStyle.headerContentTransaction}>
				<View style={{ flexDirection: 'row', width: '100%' }}>
					<Text testID={`${this.props.testID}-transactionTypeLabel`} style={[CommonStyle.textMainHeader, styles.col1Clone]}>
						{I18n.t('typeUpper', { locale: this.props.lang })}
					</Text>
					<Text testID={`${this.props.testID}-transactionQuantityLabel`} style={[CommonStyle.textMainHeader, styles.col2Clone]}>
						{I18n.t('quantityUpper', { locale: this.props.lang })}
					</Text>
					<Text testID={`${this.props.testID}-transactionValueLabel`} style={[CommonStyle.textMainHeader, styles.col3Clone]}>
						{I18n.t('valueUpper', { locale: this.props.lang })}
					</Text>
					<Text testID={`${this.props.testID}-transactionTotalLabel`} style={[CommonStyle.textMainHeader, styles.col4Clone]}>
						{I18n.t('totalUpper', { locale: this.props.lang })} {currencyAcc}
					</Text>
				</View>
				<View style={{ flexDirection: 'row', paddingTop: 2 }}>
					<Text testID={`${this.props.testID}-transactionDateLabel`} style={[CommonStyle.textSubHeader, styles.col1Clone]}>
						{I18n.t('dateUpper', { locale: this.props.lang })}
					</Text>
					<Text testID={`${this.props.testID}-transactionBrokerageLabel`} style={[CommonStyle.textSubHeader, styles.col2Clone]}>
						{I18n.t('priceUpper', { locale: this.props.lang })}
					</Text>
					<Text testID={`${this.props.testID}-transactionPriceLabel`} style={[CommonStyle.textSubHeader, styles.col3Clone]}>
						{I18n.t('totalBrokerage', { locale: this.props.lang }).toUpperCase()} {currencyAcc}
					</Text>
					<Text testID={`${this.props.testID}-transactionOrderIDLabel`} style={[CommonStyle.textSubHeader, styles.col4Clone]}>
						{I18n.t('exchangeRate', { locale: this.props.lang })}
					</Text>
				</View>
			</View>
		);
	}
	renderRowContent() {
		try {
			const data = this.props.data;
			const ds = new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			});
			const dataSource = ds.cloneWithRows(data);
			return (
				<View key={`view_sub_report_${this.state.displayName}`} style={{ width: '100%', paddingLeft: 16 }}>
					<ListView
						dataSource={dataSource}
						renderRow={(item, sectionID, index) =>
							(<View key={`view_total_${index}`} style={[styles.rowContent, { borderBottomWidth: index < data.length - 1 ? 1 : 0, borderColor: CommonStyle.fontBorderGray }]}>
								<View key={`view_sub_top_${index}`} style={{ flexDirection: 'row', width: '100%' }}>
									<Text key={`text_side_${index}`} testID={`${this.props.testID}${index}-typeValue`} style={[CommonStyle.textMain, styles.col1Clone]}>
										{parseInt(item.type) === 1 ? I18n.t('buy', { locale: this.props.lang }) : I18n.t('sell', { locale: this.props.lang })}
									</Text>
									<Text key={`text_quantity_${index}`} testID={`${this.props.testID}${index}-quantityValue`} style={[CommonStyle.textMain, styles.col2Clone]}>
										{formatNumber(item.quantity)}
									</Text>
									<Text key={`text_trade_value_${index}`} testID={`${this.props.testID}${index}-valueValue`} style={[CommonStyle.textMain, styles.col3Clone]}>
										{formatNumberNew2(item.trade_value, PRICE_DECIMAL.VALUE)}
									</Text>
									<Text key={`text_total_value_${index}`} testID={`${this.props.testID}${index}-totalValue`} style={[CommonStyle.textMain, styles.col4Clone]}>
										{formatNumberNew2(item.total_value, PRICE_DECIMAL.VALUE)}
									</Text>
								</View>
								<View key={`view_sub_bottom_${index}`} style={{ flexDirection: 'row', width: '100%' }}>
									<Text key={`text_time_${index}`} testID={`${this.props.testID}${index}-dateValue`} style={[CommonStyle.textSub, styles.col1Clone]}>
										{convertTimeStampUTCToTimeLocation(item.date, 'UTC', 'DD/MM/YYYY')}
									</Text>
									<Text key={`text_brokerage_${index}`} testID={`${this.props.testID}${index}-brokerageValue`} style={[CommonStyle.textSub, styles.col2Clone]}>
										{formatNumberNew2(item.unit_price, PRICE_DECIMAL.PRICE)}
									</Text>
									<Text key={`text_unit_price_${index}`} testID={`${this.props.testID}${index}-priceValue`} style={[CommonStyle.textSub, styles.col3Clone]}>
										{formatNumberNew2(item.total_fees, PRICE_DECIMAL.VALUE)}
									</Text>
									<Text key={`text_broker_order_id_${index}`} testID={`${this.props.testID}${index}-orderIDValue`} style={[CommonStyle.textSub, styles.col4Clone]}>
										{item.bid ? formatNumberNew2(item.bid, 5) : '--'}
									</Text>
								</View>
							</View>)
						}
					/>
				</View>
			);
		} catch (error) {
			console.log(error)
			logDevice('error', `RENDER ROW CONTENT SUBREPORT TRANSACTION ERROR - ${error}`)
		}
	}

	renderFooter() {
		return (
			<View style={CommonStyle.footerContainerTransaction}>
				<Text style={[CommonStyle.textMain, styles.col1Clone]}>
					{I18n.t('totalUpper', { locale: this.props.lang })}
				</Text>
				<Text testID={`${this.props.testID}-totalSub`} style={[CommonStyle.textMain, styles.col2Clone]}>
					{formatNumber(this.props.total_sub)}
				</Text>
				<Text style={[CommonStyle.textMain, styles.col3Clone]} />
				<Text style={[CommonStyle.textMain, styles.col4Clone]} />
			</View>
		);
	}

	render() {
		return (
			<View style={this.props.style}>
				{this.renderHeader()}
				{this.renderHeaderContent()}
				{this.renderRowContent()}
				{this.renderFooter()}
			</View>
		);
	}
}

export class TransactionSummary extends Component {
	constructor(props) {
		super(props);
		this.userId = func.getUserId();
		this.perf = new Perf(`transaction_summary`);
		this.state = {
			listdata: [],
			dicSymbol: {},
			isLoading: true
		};

		this.fromDate = this.props.fromDate
		this.toDate = this.props.toDate
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	componentWillMount() {
		setCurrentScreen(analyticsEnum.reportTransaction);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return true;
	}

	componentDidMount() {
		this.getData();
	}

	reportCallback(dataReport) {
		if (!dataReport || Util.compareObject(dataReport, {})) {
			return this.setState({ isLoading: false });
		}
		const lstSymbol = Object.keys(dataReport).join(',');
		const urlGetSymbol = getSymbolUrl(null, null, lstSymbol);
		// dataReport = this.handleDataReport(dataReport, Object.keys(dataReport));
		requestData(urlGetSymbol).then(data => {
			if (Util.arrayHasItem(data)) {
				const dicSymbol = {};
				data.map(item => {
					dicSymbol[item.symbol] = item;
				});
				// console.log('data report', Util.convertObjToArray(dataReport))
				const listdata = this.handleDataReport(Util.convertObjToArray(dataReport));
				this.setState({
					isLoading: false,
					listdata,
					dicSymbol
				}, () => {
					this.perf && this.perf.stop();
				});
			}
		});
	}
	handleDataReport(data) {
		try {
			return data.sort((a, b) => (a.list_tran[0].date < b.list_tran[0].date) ? 1 : ((b.list_tran[0].date < a.list_tran[0].date) ? -1 : 0))
		} catch (error) {
			return data;
		}
	}
	getData() {
		try {
			const url = `${getReportUrl(apiReportEnum.TRANSACTION, dataStorage.accountId, this.fromDate, this.toDate)}`;
			requestData(url).then(data => {
				data
					? this.reportCallback(data)
					: this.setState({ isLoading: false, dataReport: [] });
			}).catch(error => {
				logDevice('info', `getData Transaction Error ${error}`);
				logAndReport(`getData Transaction Error ${error}`);
			});
		} catch (error) {
			logAndReport('componentDidMount transaction exception', error, 'componentDidMount transaction');
		}
	}

	sortData(data) {
		try {
			const lstData = [];
			const mappingSymbol = {};
			const mappingOrdId = {};

			for (const symbol in data) {
				if (!mappingSymbol[symbol]) {
					lstData.push({
						symbol,
						updated: 0,
						sub_total: data[symbol].sub_total,
						lstOrder: []
					});
					mappingSymbol[symbol] = lstData.length - 1;
				}
				const indexSymbol = mappingSymbol[symbol];
				const objSymbol = lstData[indexSymbol] || {};

				const listTran = data[symbol].list_tran;
				if (listTran) {
					for (const itemTran of listTran) {
						if (!mappingOrdId[itemTran.broker_order_id]) {
							objSymbol.lstOrder.push({
								updated: 0,
								orderId: itemTran.broker_order_id || '--',
								listTran: []
							});
							mappingOrdId[itemTran.broker_order_id] = objSymbol.lstOrder.length - 1;
						}
						const indexOrder = mappingOrdId[itemTran.broker_order_id];
						const objOrder = objSymbol.lstOrder[indexOrder] || {};

						if (objSymbol && objSymbol.updated && objSymbol.updated < itemTran.date) objSymbol.updated = itemTran.date;
						if (objOrder && objOrder.updated && objOrder.updated < itemTran.date) objOrder.updated = itemTran.date;

						if (!objOrder.listTran) {
							objOrder.listTran = []
						}

						objOrder.listTran.push({
							...itemTran,
							fee_updated: `${formatNumberNew2(itemTran.brokerage, PRICE_DECIMAL.VALUE)}_${itemTran.date}`
						});
					}
					objSymbol.lstOrder.map(orderObj => {
						orderObj.listTran.sort((a, b) => b.fee_updated > a.fee_updated);
					});
					objSymbol.lstOrder.sort((a, b) => {
						if (!a || !b) {
							console.log('aaaa')
						}
						return b.updated - a.updated
					});
				}
			}
			lstData.sort((a, b) => b.updated - a.updated);

			const newLst = [];
			lstData.map(objSymbol => {
				const item = {
					code: objSymbol.symbol,
					updated: objSymbol.updated,
					total_sub: objSymbol.sub_total,
					list_tran: []
				};
				objSymbol.lstOrder.map(objOrd => {
					item.list_tran.push(...objOrd.listTran);
				});
				newLst.push(item);
			});

			return newLst;
		} catch (error) {
			console.log('error', error)
		}
	}

	renderContent() {
		try {
			const data = this.state.listdata;
			return (
				<FlatList
					data={data}
					key={'flatlist_symbol'}
					renderItem={({ item, index }) =>
						<SubReport
							lang={this.props.setting.lang}
							appActions={this.props.appActions}
							testID={index}
							key={`subreport_${index}`}
							total_sub={Util.getNumberable(item.sub_total)}
							style={{ marginBottom: 30, width: '100%' }}
							symbolObj={this.state.dicSymbol[item.code]}
							symbol={item.code}
							data={item.list_tran}
						/>
					}
				/>
			);
		} catch (error) {
			logAndReport('renderContent transaction exception', error, 'renderContent transaction');
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
		const fromYear = moment(this.props.fromDate).format('YYYY');
		const toYear = moment(this.props.toDate).format('YYYY');
		return this.state.isLoading
			? (
				this.props.isConnected
					? (
						<View style={{ backgroundColor: CommonStyle.backgroundColor, width: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<ProgressBar />
						</View>
					)
					: (<RetryConnect onPress={() => this.getData()} />)
			)
			: (
				<View testID='transactionReport' style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
					<ReportHeader
						reportName={I18n.t('transactionSummary', { locale: this.props.setting.lang })}
						fromDate={this.props.fromDate}
						toDate={this.props.toDate}
					/>
					{
						dataStorage.loginUserType === loginUserType.REVIEW
							? null
							: this.renderContent()
					}
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

function mapDispatchToProps(dispatch) {
	return {
		appActions: bindActionCreators(appActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionSummary);
