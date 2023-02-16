import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	View,
	Text,
	TouchableOpacity,
	Switch,
	PixelRatio,
	Platform,
	StatusBar
} from 'react-native';
import moment from 'moment';
import styles from './style/report.styles.js';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as settingActions from './report.actions';
import I18n from '../../modules/language/index';
import * as timeUtils from '../../lib/base/dateTime';
import {
	logAndReport,
	setStyleNavigation,
	switchForm,
	setDicReAuthen,
	logDevice,
	pushToVerifyMailScreen,
	setRefTabbar
} from '../../lib/base/functionUtil';
import { setCurrentScreen } from '../../lib/base/analytics';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import NetworkWarning from '../../component/network_warning/network_warning';
import { dataStorage, func } from '../../storage';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import ScreenId from '../../constants/screen_id';
import Perf from '../../lib/base/performance_monitor';
import { iconsMap } from '../../utils/AppIcons';
import Enum from '../../enum';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import * as Controller from '../../memory/controller';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';
import BottomTabBar from '~/component/tabbar';
import Header from '~/component/headerNavBar';

const configEnv = config.environment;
export class Report extends Component {
	constructor(props) {
		super(props);
		this.state = {
			lang: 'English',
			isToDateTimePickerVisible: false,
			isFromDateTimePickerVisible: false,
			selectedRange: I18n.t('day'),
			fromDate: timeUtils.addDaysToTime(Date.now(), -1), // default day from = current day - 1
			toDate: timeUtils.addDaysToTime(Date.now(), -1) // default day to = current day - 1
		};
		this.perf = new Perf(performanceEnum.show_form_report);
		this.nav = this.props.navigator;
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.getLocale = this.getLocale.bind(this);

		this.timeLocale = '';

		this.listTimeFilter = [
			{ name: I18n.t('day') },
			{ name: I18n.t('week') },
			{ name: I18n.t('month') },
			{ name: I18n.t('quarter') },
			{ name: I18n.t('year') }
		];

		this.listReport = [
			{
				name: I18n.t('financialSummary'),
				callback: () => this.financialSummary()
			},
			{
				name: I18n.t('holdingsValuation'),
				callback: () => this.holdingsValuation()
			},
			{
				name: I18n.t('cashAccountSummary'),
				callback: () => this.cashAccountSummary()
			},
			{
				name: I18n.t('transactionSummary'),
				callback: () => this.transactionSummary()
			}
			//  {
			//   name: 'Brokerage & Information Services',
			//   callback: () => this.brokerageInformationServices()
			// }, {
			//   name: 'Estimated Dividend Summary',
			//   callback: () => this.estimatedDividendSummary()
			// }
		];
	}

	getLocale(locale) {
		switch (locale) {
			case 'vi':
				this.timeLocale = 'vi';
				break;
			case 'cn':
				this.timeLocale = 'zh-cn';
				break;
			default:
				this.timeLocale = 'en';
				break;
		}
		return this.timeLocale;
	}

	componentWillMount() {
		setCurrentScreen(analyticsEnum.report);
		this.getLocale(Controller.getLang());
		this.perf &&
			this.perf.incrementCounter(performanceEnum.show_form_report);
		this.nav.setButtons({
			rightButtons: []
		});
	}

	// navigate func to specific Report
	financialSummary() {
		this.nav.push({
			screen: 'equix.FinancialSummary',
			title: I18n.t('insights'),
			animated: true,
			animationType: 'slide-horizontal',
			// backButtonTitle: '   ',
			navigatorButtons: {
				leftButtons: [
					{
						title: '',
						id: 'back_button',
						icon:
							Platform.OS === 'ios'
								? iconsMap['ios-arrow-back']
								: iconsMap['md-arrow-back']
					}
				]
			},
			navigatorStyle: CommonStyle.navigatorSpecial,
			passProps: {
				fromDate: moment(new Date(this.state.fromDate)).format(
					'DD/MM/YY'
				),
				toDate: moment(new Date(this.state.toDate)).format('DD/MM/YY'),
				isConnected: this.props.isConnected
			}
		});
	}

	holdingsValuation() {
		this.nav.push({
			screen: 'equix.HoldingsValuation',
			// backButtonTitle: '   ',
			title: I18n.t('insights'),
			animated: true,
			animationType: 'slide-horizontal',
			navigatorButtons: {
				leftButtons: [
					{
						title: '',
						id: 'back_button',
						icon:
							Platform.OS === 'ios'
								? iconsMap['ios-arrow-back']
								: iconsMap['md-arrow-back']
					}
				]
			},
			navigatorStyle: CommonStyle.navigatorSpecial,
			passProps: {
				fromDate: moment(new Date(this.state.fromDate)).format(
					'DD/MM/YY'
				),
				toDate: moment(new Date(this.state.toDate)).format('DD/MM/YY')
			}
		});
	}

	cashAccountSummary() {
		this.nav.push({
			screen: 'equix.CashAccountSummary',
			// backButtonTitle: '   ',
			title: I18n.t('insights'),
			animated: true,
			animationType: 'slide-horizontal',
			navigatorButtons: {
				leftButtons: [
					{
						title: '',
						id: 'back_button',
						icon:
							Platform.OS === 'ios'
								? iconsMap['ios-arrow-back']
								: iconsMap['md-arrow-back']
					}
				]
			},
			navigatorStyle: CommonStyle.navigatorSpecial,
			passProps: {
				fromDate: moment(new Date(this.state.fromDate)).format(
					'DD/MM/YY'
				),
				toDate: moment(new Date(this.state.toDate)).format('DD/MM/YY')
			}
		});
	}

	transactionSummary() {
		this.nav.push({
			screen: 'equix.TransactionSummary',
			title: I18n.t('insights'),
			animated: true,
			animationType: 'slide-horizontal',
			// backButtonTitle: '   ',
			navigatorButtons: {
				leftButtons: [
					{
						title: '',
						id: 'back_button',
						icon:
							Platform.OS === 'ios'
								? iconsMap['ios-arrow-back']
								: iconsMap['md-arrow-back']
					}
				]
			},
			navigatorStyle: CommonStyle.navigatorSpecial,
			passProps: {
				fromDate: moment(new Date(this.state.fromDate)).format(
					'DD/MM/YY'
				),
				toDate: moment(new Date(this.state.toDate)).format('DD/MM/YY')
			}
		});
	}

	onNavigatorEvent(event) {
		if (event.type === 'DeepLink') {
			switchForm(this.nav, event);
		}
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'menu_ios':
					this.nav.toggleDrawer({
						side: 'left',
						animated: true
					});
					break;
			}
		} else {
			switch (event.id) {
				case 'didAppear':
					setRefTabbar(this.tabbar);
					func.setCurrentScreenId(ScreenId.REPORT);
					break;
				default:
					break;
			}
		}
	}

	brokerageInformationServices() {
		this.nav.push({
			screen: 'equix.BrokerageSummary',
			title: I18n.t('insights'),
			backButtonTitle: '',
			navigatorStyle: CommonStyle.navigatorSpecial,
			passProps: {
				fromDate: this.state.fromDate,
				toDate: this.state.toDate
			}
		});
	}

	estimatedDividendSummary() {
		this.nav.push({
			screen: 'equix.EstimatedSummary',
			title: I18n.t('reports', { locale: this.props.setting.lang }),
			backButtonTitle: '',
			navigatorStyle: CommonStyle.navigatorSpecial,
			passProps: {
				fromDate: this.state.fromDate,
				toDate: this.state.toDate
			}
		});
	}

	getObjectStyle(val, item, listData) {
		try {
			const objStyle = {};
			if (item === val) {
				if (listData[0] === item) {
					objStyle['borderTopLeftRadius'] = CommonStyle.borderRadius;
					objStyle['borderTopRightRadius'] = CommonStyle.borderRadius;
				}
				if (listData[listData.length - 1] === item) {
					objStyle['borderBottomLeftRadius'] =
						CommonStyle.borderRadius;
					objStyle['borderBottomRightRadius'] =
						CommonStyle.borderRadius;
				}

				objStyle['backgroundColor'] = '#0000001e';
			}
			return objStyle;
		} catch (error) {
			logAndReport(
				'getObjectStyle report exception',
				error,
				'getObjectStyle report'
			);
		}
	}

	showFromDateTimePicker() {
		this.setState({ isFromDateTimePickerVisible: true });
	}

	hideFromDateTimePicker() {
		this.setState({ isFromDateTimePickerVisible: false });
	}

	handleFromDatePicked(date) {
		const fromDate = new Date(date).getTime();
		this.setState({ fromDate, selectedRange: '' });
		this.hideFromDateTimePicker();
	}

	showToDateTimePicker() {
		this.setState({ isToDateTimePickerVisible: true });
	}

	hideToDateTimePicker() {
		this.setState({ isToDateTimePickerVisible: false });
	}

	handleToDatePicked(date) {
		const toDate = new Date(date).getTime();
		this.setState({ toDate, selectedRange: '' });
		this.hideToDateTimePicker();
	}

	renderLangDrop(item) {
		const objStyle = this.getObjectStyle(this.duration, item, listLang);
		return (
			<View style={[objStyle, styles.dropDownRow, { width: 96 }]}>
				<Text style={CommonStyle.textMainNormal}>{item}</Text>
			</View>
		);
	}

	renderOrderTypeDrop(item) {
		const objStyle = this.getObjectStyle(
			this.props.order.orderType,
			item,
			listOrderType
		);
		return (
			<View style={[objStyle, styles.dropDownRow, { width: 152 }]}>
				<Text style={CommonStyle.textMainNormal}>{item}</Text>
			</View>
		);
	}

	setTimeRange(time) {
		const yesterday = timeUtils.addDaysToTime(Date.now(), -1);
		this.setState({ selectedRange: time });
		switch (time) {
			case I18n.t('day'):
				this.setState({
					fromDate: yesterday,
					toDate: yesterday
				});
				break;
			case I18n.t('week'):
				this.setState({
					fromDate: timeUtils.addDaysToTime(Date.now(), -7),
					toDate: yesterday
				});
				break;
			case I18n.t('month'):
				this.setState({
					fromDate: timeUtils.addMonthsToTime(Date.now(), -1),
					toDate: yesterday
				});
				break;
			case I18n.t('quarter'):
				this.setState({
					fromDate: timeUtils.addMonthsToTime(Date.now(), -3),
					toDate: yesterday
				});
				break;
			case I18n.t('year'):
				this.setState({
					fromDate: timeUtils.addMonthsToTime(Date.now(), -12),
					toDate: yesterday
				});
				break;
			default:
				this.setState({
					fromDate: timeUtils.addDaysToTime(yesterday, -1),
					toDate: yesterday
				});
				break;
		}
	}

	renderTimeFilter() {
		try {
			const { selectedRange } = this.state;
			const getActiveTextStyle = (time) => {
				if (time === selectedRange) {
					return { color: '#ffffff' };
				} else {
					return { color: '#10a8b2' };
				}
			};
			const getActiveButtonStyle = (time) => {
				if (time === selectedRange) {
					return { backgroundColor: '#10a8b2' };
				} else {
					return {};
				}
			};
			const getFirstLastButtonStyle = (index) => {
				if (index === 0) {
					return {
						borderTopLeftRadius: CommonStyle.borderRadius,
						borderBottomLeftRadius: CommonStyle.borderRadius
					};
				} else if (index === this.listTimeFilter.length - 1) {
					return {
						borderTopRightRadius: CommonStyle.borderRadius,
						borderBottomRightRadius: CommonStyle.borderRadius
					};
				} else return {};
			};
			return (
				<View style={styles.timeFilter} testID="timeFilterReposts">
					{this.listTimeFilter.map((item, i) => {
						return (
							<TouchableOpacity
								testID={`timeFilter${i}`}
								style={[
									styles.timeFilterButt,
									getActiveButtonStyle(item.name),
									getFirstLastButtonStyle(i),
									{
										borderColor: '#10a8b2',
										borderLeftWidth:
											i === 1 || i === 3
												? 1
												: i === 4
												? 0
												: 0,
										borderRightWidth:
											i === 1 ? 1 : i === 3 ? 1 : 0,
										width: '20%'
									}
								]}
								key={item.name}
								onPress={this.setTimeRange.bind(
									this,
									item.name
								)}
							>
								<Text
									style={[
										CommonStyle.textFilter,
										getActiveTextStyle(item.name)
									]}
								>
									{item.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			);
		} catch (error) {
			logAndReport(
				'renderTimeFilter report exception',
				error,
				'renderTimeFilter report'
			);
		}
	}

	renderReportTitle() {
		return (
			<View style={{ marginHorizontal: 16 }} testID="listReportTitle">
				<View
					style={{
						height: 1,
						width: '100%',
						borderBottomWidth: 1,
						borderColor: CommonStyle.fontBorderGray
					}}
				></View>
				{this.listReport.map((item) => {
					return (
						<View key={item.name} style={styles.reportItem}>
							<TouchableOpacityOpt
								onPress={item.callback}
								timeDelay={Enum.TIME_DELAY}
							>
								<Text
									testID={`reportName-${item.name}`}
									style={CommonStyle.textNameInsights}
								>
									{item.name}
								</Text>
							</TouchableOpacityOpt>
							{this.renderSeparate()}
						</View>
					);
				})}
			</View>
		);
	}

	renderSeparate() {
		return <View style={CommonStyle.separator}></View>;
	}

	componentDidMount() {
		this.nav.setButtons({
			rightButtons: []
		});
	}

	toggleDrawer = this.toggleDrawer.bind(this);
	toggleDrawer() {
		this.props.navigator.toggleDrawer({
			side: 'left',
			animated: true
		});
	}

	render() {
		const confirmTextIOS = I18n.t('confirm');
		const cancelTextIOS = I18n.t('cancel');
		const titleIOS = I18n.t('pickADate');
		return (
			<View
				testID="ViewReports"
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
				<Header
					leftIcon="ios-menu"
					onLeftPress={this.toggleDrawer}
					title={I18n.t('insights')}
					style={{ marginLeft: 0, paddingTop: 16 }}
				></Header>
				{Controller.getUserVerify() === 0 ? (
					<VerifyMailNoti
						verifyMailFn={() => {
							pushToVerifyMailScreen(
								this.props.navigator,
								this.props.setting.lang
							);
						}}
					></VerifyMailNoti>
				) : (
					<View />
				)}
				{this.props.isConnected ? null : <NetworkWarning />}
				<View style={styles.filterSec}>
					<View style={styles.fieldTitle}>
						<Text
							style={[
								CommonStyle.textFloatingLabelInsights,
								{ marginRight: 8, width: '50%' }
							]}
						>
							{I18n.t('from')}
						</Text>
						<Text
							style={[
								CommonStyle.textFloatingLabelInsights,
								{ width: '50%' }
							]}
						>
							{I18n.t('to')}
						</Text>
					</View>
					<View style={{ width: '100%', flexDirection: 'row' }}>
						<View
							style={[
								CommonStyle.filterField,
								{ marginRight: 8, paddingBottom: 3 }
							]}
						>
							<Text
								testID="fromDateReports"
								style={CommonStyle.textMain}
							>
								{moment(new Date(this.state.fromDate)).format(
									'DD/MM/YYYY'
								)}
							</Text>
							<Ionicons
								onPress={this.showFromDateTimePicker.bind(this)}
								testID="iconFromDateReports"
								style={CommonStyle.iconPickerInsights}
								name="md-calendar"
								size={24}
							/>
							<View testID="fromDatePickerReport">
								<DateTimePicker
									locale={this.timeLocale}
									maximumDate={new Date(this.state.toDate)}
									date={new Date(this.state.fromDate)}
									isVisible={
										this.state.isFromDateTimePickerVisible
									}
									onConfirm={this.handleFromDatePicked.bind(
										this
									)}
									onCancel={this.hideFromDateTimePicker.bind(
										this
									)}
									datePickerModeAndroid="spinner"
									titleIOS={titleIOS}
									confirmTextIOS={confirmTextIOS}
									cancelTextIOS={cancelTextIOS}
								/>
							</View>
						</View>
						<View
							style={[CommonStyle.filterField, { marginLeft: 8 }]}
						>
							<Text
								testID="toDateReports"
								style={CommonStyle.textMain}
							>
								{moment(new Date(this.state.toDate)).format(
									'DD/MM/YYYY'
								)}
							</Text>
							<Ionicons
								onPress={this.showToDateTimePicker.bind(this)}
								testID="iconToDateReports"
								style={CommonStyle.iconPickerInsights}
								name="md-calendar"
								size={24}
							/>
							<View testID="toDatePickerReport">
								<DateTimePicker
									locale={this.timeLocale}
									maximumDate={timeUtils.addDaysToTime(
										Date.now(),
										-1
									)}
									date={new Date(this.state.toDate)}
									minimumDate={new Date(this.state.fromDate)}
									isVisible={
										this.state.isToDateTimePickerVisible
									}
									onConfirm={this.handleToDatePicked.bind(
										this
									)}
									onCancel={this.hideToDateTimePicker.bind(
										this
									)}
									datePickerModeAndroid="spinner"
									titleIOS={titleIOS}
									confirmTextIOS={confirmTextIOS}
									cancelTextIOS={cancelTextIOS}
								/>
							</View>
						</View>
					</View>
				</View>
				{this.renderTimeFilter()}
				{this.renderReportTitle()}
				<BottomTabBar
					navigator={this.props.navigator}
					ref={(ref) => {
						this.tabbar = ref;
						setRefTabbar(ref);
					}}
				/>
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
		actions: bindActionCreators(settingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Report);
