import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Keyboard,
	Dimensions,
	Alert,
	Animated,
	TouchableWithoutFeedback,
	PixelRatio,
	ScrollView,
	Platform
} from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage';
import ButtonBox from '../../modules/_global/ButtonBox';
import {
	countC2RTimes,
	getReason,
	logDevice,
	sendToRocketChat,
	largeValue,
	roundFloat,
	formatNumber,
	convertFormatToNumber,
	getPriceSource,
	formatNumberNew2,
	logAndReport,
	setStyleNavigation,
	getPriceMultiExchange
} from '../../lib/base/functionUtil';
import {
	getDateStringWithFormat,
	convertToUTCTime,
	convertToUTCTime2,
	convertToLocalTime2
} from '../../lib/base/dateTime';
import styles from './style/modify_order';
import ProgressBar from '../../modules/_global/ProgressBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import TimeUpdated from '../../component/time_updated/time_updated';
import NetworkWarning from '../../component/network_warning/network_warning';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning';
import { iconsMap } from '../../utils/AppIcons';
import { bindActionCreators } from 'redux';
import * as modifyOrderActions from './modify_order.actions';
import userType from '../../constants/user_type';
import { func, dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import firebase from '../../firebase';
import Big from 'big.js';
import I18n from '../../modules/language/';
import orderTypeString from '../../constants/order_type_string';
import tradeTypeString from '../../constants/trade_type_string';
import filterConditionName from '../../constants/condition_name';
import MarketDepth from '../market_depth/market_depth';
import orderType from '../../constants/order_type';
import orderState from '../../constants/order_state';
import Warning from '../../component/warning/warning';
import PickerCustom from './../order/picker';
import Picker from 'react-native-picker';
import StateApp from '../../lib/base/helper/appState';
import config from '../../config';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import { connect2Nchan, mergeData, unregister } from '../../nchan';
import * as Animatable from 'react-native-animatable';
import { AlertOrder } from './../order/alert_order';
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import EXCHANGES from '../../constants/exchanges';
import OrderEnum from '../../constants/order_enum';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import durationCode from '../../constants/durationCode';
import durationString from '../../constants/durationString';
import orderConditionString from '../../constants/order_condition_string';
import ScreenId from '../../constants/screen_id';
import * as Controller from '../../memory/controller';

const triggerType = {
	PERCENT: 'Percent',
	PRICE: 'Price'
};

const TIME_GET_FEES = 500;

const { width, height } = Dimensions.get('window');
const listDuration = [
	'DAY',
	'Good Till Cancelled',
	'Immediate Or Cancel',
	'Fill Or Kill'
];
const listDurationLimited = [
	'Good Till Cancelled',
	'Immediate Or Cancel',
	'Fill Or Kill'
];
export class ModifyOrder extends Component {
	constructor(props) {
		super(props);
		this.fbPrice = null;
		this.timeout = null;
		this.isGettedFees = false;
		this.errorLen = 1;
		this.volume = this.props.data.volume || 0;
		this.note = '';
		this.getCashAvailable = this.getCashAvailable.bind(this);
		this.listExchange = func.getDataStorage(`exchange`);
		this.exDisplay = ['ASX TradeMatch Market', 'ASX Centre Point']; // temporary support two this exchange
		this.listExchangeLimited = ['ASX TradeMatch Market'];
		let exchange = this.props.data.exchange || '';
		// let end = exchange.length - 6;
		// let key = exchange.slice(0, end);
		let key = exchange.replace('[Demo]', '');
		this.exchange = '';
		// this.exchange = this.listExchange[key];
		if (
			this.props.data.trading_market &&
			(this.props.data.trading_market + '').includes('TM')
		) {
			this.exchange = 'ASX TradeMatch Market';
		} else {
			this.exchange = 'ASX Centre Point';
		}
		this.changedValue = this.changedValue.bind(this);
		this.closeHandler = this.closeHandler.bind(this);
		this.disabeleStopPrice = this.disabeleStopPrice.bind(this);
		this.getWarnText = this.getWarnText.bind(this);
		this.setTitle = this.setTitle.bind(this);
		// this.checkVolume = this.checkVolume.bind(this);
		this.confirmTextOrder = '';
		this.confirmTextButton = '';
		this.userId = func.getUserId();
		this.isChange = false;
		this.listVolume = [1, 10, 100, 500, 1000, 10000, 50000, 100000];
		this.listLimitPrice = [];
		this.listStopPrice = [];
		this.listTrailingPercent = [];
		this.listTrailingAmount = [];
		this.tradePrice = 0;
		this.orderTypeMarket =
			(this.props.data.order_type + '').toUpperCase() ===
			orderType.MARKET;
		this.error = '';
		this.isMount = false;
		this.feesResponse = null;
		this.typeForm = ScreenId.MODIFY_ORDER;
		this.registered = false;
		this.objRegister = {};
		this.isReady = true;
		this.isCallOrderHistory = true;
		this.originOrderType = null;
		this.state = {
			isUpdateLastOrder: false,
			isShowError: false,
			orderPlaceSuccess: false,
			isFilling: false,
			volume: this.props.modifyOrder.volume
				? this.props.modifyOrder
				: this.props.data.volume,
			excuting: false,
			visibleAlert: false,
			warningText: '',
			isShowKeyboard: false,
			high: 0,
			low: 0,
			close: 0,
			open: 0,
			previous_close: 0,
			total_volume: 0,
			ask_size: 0,
			bid_size: 0,
			bid_price: 0,
			ask_price: 0,
			trade_price: 0,
			trade_size: 0,
			change_percent: 0,
			trailingStopPriceError: '',
			trailingErrorText: '',
			limitPriceErrorText: '',
			stopPriceErrorText: '',
			orderValueError: '',
			volumeErrorText: '',
			tradingHaltText: '',
			tradingHalt: false,
			disabled: false,
			scrollAble: true,
			activeDot: 0,
			totalFees: 0,
			cashAvailable: 0,
			duration: this.props.data.duration || '',
			exchange: this.props.data.exchange,
			updated: new Date().getTime(),
			dataChartNow: {
				code: this.props.data.symbol || '',
				close: '',
				high: '',
				history_date: new Date().getTime(),
				low: '',
				open: '',
				volume: ''
			},
			heightButton: 20,
			timeUpdate: new Date().getTime(),
			heightError: new Animated.Value(0)
		};
		this.stateApp = null;
		this.onTextLayout = this.onTextLayout.bind(this);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		func.setFuncReload(this.typeForm, this.loadDataFromApi.bind(this));
		this.perf = new Perf(performanceEnum.show_form_modify_order);
		this.nav = this.props.navigator;
	}

	closeHandler() {
		this.nav.pop({
			animated: true,
			animationType: 'fade'
		});
	}

	getWarnText() {
		try {
			switch (func.getUserPriceSource()) {
				case userType.ClickToRefresh:
					return this.state.tradingHalt
						? I18n.t('notRealtimeWarningHalt', {
								locale: this.props.setting.lang
						  })
						: I18n.t('notRealtimeWarning', {
								locale: this.props.setting.lang
						  });
				case userType.Delay:
					return this.state.tradingHalt
						? I18n.t('delayWarningHalt', {
								locale: this.props.setting.lang
						  })
						: I18n.t('delayWarning', {
								locale: this.props.setting.lang
						  });
				case userType.Streaming:
					return this.state.tradingHalt
						? I18n.t('tradingHalt', {
								locale: this.props.setting.lang
						  })
						: '';
			}
		} catch (error) {
			logAndReport(
				'getWarnText modifyOrder exception',
				error,
				'getWarnText modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - getWarnText: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	getCashAvailable() {
		const url = api.getUrlBalanceByAccountId(dataStorage.accountId);
		return api.requestData(url, true).then((data) => {
			if (data) {
				this.getCashAvailableCallback(data);
			}
		});
	}

	getCashAvailableCallback(data) {
		if (data) {
			const pendingBuyOrderUS = data.pendingbuys_us || {};
			const trading = data.trading || {};
			const filledBuysSaxo = data.filledbuys_saxo || {};
			const filledBuysSaxoAmount = filledBuysSaxo.amount || 0; // ∑(Filled Sell Order - Filled Buy Order của Mỹ)
			const tradingAmount = trading.amount || 0; // Cash available tu tinh
			const pendingBuyOrderUSAmount = pendingBuyOrderUS.amount || 0; // pending buy order my tu tinh
			const cashAvailable =
				tradingAmount +
					filledBuysSaxoAmount -
					pendingBuyOrderUSAmount || 0;
			this.setState({
				cashAvailable
			});
		} else {
			logDevice('error', `MODIFY ORDER GET BALANCES DATA IS NULL`);
		}
		const trading = data.trading || {};
		const cashAvailable = trading.amount || 0;
		this.setState({
			cashAvailable
		});
	}

	onNavigatorEvent(event) {
		Picker.hide();
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'modify_order_refresh':
					this.setState({ timeUpdate: new Date().getTime() });
					this.props.actions.writeDataRequest();
					break;
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					this.isCallOrderHistory = true;
					setCurrentScreen(analyticsEnum.modifyOrder);
					this.perf.incrementCounter(
						performanceEnum.show_form_modify_order
					);
					logDevice('info', `ModifyOrder - Open Form`);
					switch (func.getUserPriceSource()) {
						case userType.ClickToRefresh:
							setTimeout(
								function () {
									this.nav.setButtons({
										rightButtons: [
											{
												title: 'Refresh',
												id: 'modify_order_refresh',
												icon: iconsMap[
													'ios-refresh-outline'
												]
											}
										]
									});
								}.bind(this),
								500
							);
							break;
					}
					if (this.props.setChangeTypeFn) {
						this.props.setChangeTypeFn(this.closeHandler);
					}
					if (this.props.setChangeTypeFn2) {
						this.props.setChangeTypeFn2(this.disabeleStopPrice);
					}
					this.loadFormData();
					break;
				case 'didAppear':
					this.nav.setButtons({
						rightButtons: [
							{
								title: 'Refresh',
								id: 'modify_order_refresh',
								icon: iconsMap['ios-refresh-outline']
							}
						]
					});
					func.setCurrentScreenId(this.typeForm);
					this.getCashAvailable();
					let limitPrice = 0;
					if (this.props.data.limit_price) {
						limitPrice = this.props.data.limit_price;
					} else {
						limitPrice = 0;
					}
					let stopPrice = 0;
					if (this.props.data.stop_price) {
						stopPrice = this.props.data.stop_price;
					} else {
						stopPrice = 0;
					}
					this.setListPrice('limit', limitPrice);
					this.setListPrice('stop', stopPrice);
					break;
				case 'willDisappear':
					this.isReady = false;
					if (this.props.setChangeTypeFn) {
						this.props.setChangeTypeFn(null);
					}
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	disabeleStopPrice() {
		this.setState({
			disabled: true
		});
	}

	renderLastTrade() {
		return (
			<View style={styles.rowExpand}>
				<View style={styles.expandLine}>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								flex: 1,
								alignItems: 'flex-end'
							}}
						>
							<Text
								style={[
									CommonStyle.textSub,
									{ fontSize: CommonStyle.fontSizeXS }
								]}
							>
								{I18n.t('last', {
									locale: this.props.setting.lang
								})}
							</Text>
							<Text
								style={[
									CommonStyle.textSubBold,
									{
										fontSize: CommonStyle.font11,
										marginLeft: 3
									}
								]}
							>
								{this.props.modifyOrder.isLoading
									? '--'
									: this.state.trade_price
									? formatNumberNew2(
											this.state.trade_price,
											3
									  )
									: '--'}
							</Text>
						</View>
						<View style={{ width: '4%' }}></View>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								flex: 1,
								alignItems: 'flex-end'
							}}
						>
							<Text
								style={[
									CommonStyle.textSub,
									{ fontSize: CommonStyle.fontSizeXS }
								]}
							>
								{I18n.t('quantity', {
									locale: this.props.setting.lang
								})}
							</Text>
							<Text
								style={[
									CommonStyle.textSubBold,
									{
										fontSize: CommonStyle.font11,
										marginLeft: 3
									}
								]}
							>
								{this.props.modifyOrder.isLoading
									? '--'
									: this.state.trade_size
									? formatNumber(this.state.trade_size, 2)
									: '--'}
							</Text>
						</View>
					</View>
					<View style={{ width: '4%' }}></View>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								flex: 1,
								alignItems: 'flex-end'
							}}
						>
							<Text
								style={[
									CommonStyle.textSub,
									{ fontSize: CommonStyle.fontSizeXS }
								]}
							>
								{I18n.t('open', {
									locale: this.props.setting.lang
								})}
							</Text>
							<Text
								style={[
									CommonStyle.textSubBold,
									{
										fontSize: CommonStyle.font11,
										marginLeft: 3
									}
								]}
							>
								{this.props.modifyOrder.isLoading
									? '--'
									: this.state.open
									? formatNumberNew2(this.state.open, 3)
									: '--'}
							</Text>
						</View>
						<View style={{ width: '4%' }}></View>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								flex: 1,
								alignItems: 'flex-end'
							}}
						>
							<Text
								style={[
									CommonStyle.textSub,
									{ fontSize: CommonStyle.fontSizeXS }
								]}
							>
								{I18n.t('high', {
									locale: this.props.setting.lang
								})}
							</Text>
							<Text
								style={[
									CommonStyle.textSubBold,
									{
										fontSize: CommonStyle.font11,
										marginLeft: 3
									}
								]}
							>
								{this.props.modifyOrder.isLoading
									? '--'
									: this.state.high
									? formatNumberNew2(this.state.high, 3)
									: '--'}
							</Text>
						</View>
					</View>
				</View>
				<View style={{ marginHorizontal: 8 }}></View>
				<View style={[styles.expandLine, { flexDirection: 'row' }]}>
					<View style={{ flex: 6 }}>
						<Text
							style={[
								CommonStyle.textSub,
								{
									fontSize: CommonStyle.fontSizeXS,
									textAlign: 'right'
								}
							]}
						>
							{I18n.t('todayVolume', {
								locale: this.props.setting.lang
							})}
						</Text>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'flex-end'
							}}
						>
							<Text
								style={[
									CommonStyle.textSub,
									{ fontSize: CommonStyle.fontSizeXS }
								]}
							>
								{I18n.t('low', {
									locale: this.props.setting.lang
								})}
							</Text>
							<Text
								style={[
									CommonStyle.textSubBold,
									{
										fontSize: CommonStyle.font11,
										marginLeft: 3
									}
								]}
							>
								{this.props.modifyOrder.isLoading
									? '--'
									: this.state.low
									? formatNumberNew2(this.state.low, 3)
									: '--'}
							</Text>
							<Text
								style={[
									CommonStyle.textSub,
									{
										fontSize: CommonStyle.fontSizeXS,
										textAlign: 'right'
									}
								]}
							>
								{I18n.t('prevClose', {
									locale: this.props.setting.lang
								})}
							</Text>
						</View>
					</View>
					<View style={{ flex: 2, justifyContent: 'space-around' }}>
						<Text
							style={[
								CommonStyle.textSubBold,
								{
									fontSize: CommonStyle.font11,
									marginLeft: 3,
									textAlign: 'right'
								}
							]}
						>
							{this.props.modifyOrder.isLoading
								? '--'
								: this.state.total_volume
								? largeValue(this.state.total_volume)
								: '--'}
						</Text>
						<Text
							style={[
								CommonStyle.textSubBold,
								{
									fontSize: CommonStyle.font11,
									marginLeft: 3,
									textAlign: 'right'
								}
							]}
						>
							{this.props.modifyOrder.isLoading
								? '--'
								: this.state.previous_close
								? formatNumberNew2(this.state.previous_close, 3)
								: '--'}
						</Text>
					</View>
					{/* <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flex: 2 }}>
              <Text style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeXS, textAlign: 'right', paddingLeft: 57 }]}>{I18n.t('todayVolume')}</Text>
              <Text style={[CommonStyle.textSubBold, { fontSize: CommonStyle.font11, marginLeft: 3, textAlign: 'right' }]}>{this.props.modifyOrder.isLoading ? '--' : (this.state.total_volume ? largeValue(this.state.total_volume) : '--')}</Text>
            </View>
          </View>
          <View style={{ width: '4%' }}></View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 3 }}>
              <Text style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeXS }]}>{I18n.t('low')}</Text>
              <Text style={[CommonStyle.textSubBold, { fontSize: CommonStyle.font11, marginLeft: 3 }]}>{this.props.modifyOrder.isLoading ? '--' : (this.state.low ? formatNumberNew2(this.state.low, 3) : '--')}</Text>
            </View>
            <View style={{ width: '4%' }}></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 4 }}>
              <Text style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeXS }]}>{I18n.t('prevClose')}</Text>
              <Text style={[CommonStyle.textSubBold, { fontSize: CommonStyle.font11, marginLeft: 3 }]}>{this.props.modifyOrder.isLoading ? '--' : (this.state.previous_close ? formatNumberNew2(this.state.previous_close, 3) : '--')}</Text>
            </View>
          </View> */}
				</View>
			</View>
		);
	}

	setScrollEnabled(boolean) {
		this.setState({ scrollAble: boolean });
	}

	updateBalance() {
		fbemit.addListener('balance', 'modify_order', (data) => {
			this.getCashAvailableCallback(data);
		});
	}

	componentDidMount() {
		try {
			dataStorage.setScrollEnabled = this.setScrollEnabled.bind(this);
			this.keyboardDidShowListener = Keyboard.addListener(
				'keyboardDidShow',
				this._keyboardDidShow.bind(this)
			);
			this.keyboardDidHideListener = Keyboard.addListener(
				'keyboardDidHide',
				this._keyboardDidHide.bind(this)
			);
			this.updateBalance();
		} catch (error) {
			logAndReport(
				'componentDidMount modifyOrder exception',
				error,
				'componentDidMount modifyOrder'
			);
		}
		this.isMount = true;
		this.loadData();
	}

	_keyboardDidShow() {
		this.setState({ isShowKeyboard: true });
	}

	_keyboardDidHide() {
		this.setState({ isShowKeyboard: false });
	}

	setListPrice(type, price) {
		try {
			switch (type) {
				case triggerType.PERCENT:
					this.listTrailingPercent = [];
					let min = price;
					let _stepPrice = 0;
					if (price >= 5) {
						_stepPrice = 5;
					} else if (price < 5) {
						_stepPrice = 0.5;
					} else {
						_stepPrice = 0.05;
					}
					for (let i = 1; i <= 41; i++) {
						const tmp =
							parseFloat(formatNumberNew2(price, 2)) +
							_stepPrice * i;
						this.listTrailingPercent.push(
							formatNumberNew2(tmp, 2) + '%'
						);
					}
					break;
				case triggerType.PRICE:
					this.listTrailingAmount = [];
					for (let i = 1; i <= 41; i++) {
						const tmp = parseFloat(formatNumberNew2(price, 2)) * i;
						this.listTrailingAmount.push(roundFloat(tmp, 3));
					}
					break;
				default:
					let round = 0;
					let stepPrice = 0;
					price = new Big(price.toString());
					for (let i = 1; i <= 21; i++) {
						if (price > 2) {
							stepPrice = 0.01;
							price = price.minus(0.01);
						} else if (price > 0.1) {
							stepPrice = 0.005;
							price = price.minus(0.005);
						} else {
							stepPrice = 0.001;
							price = price.minus(0.001);
						}
						if (parseFloat(price) <= 0) {
							price = new Big('0');
							break;
						}
					}
					if (type === 'limit') {
						this.listLimitPrice = [];
						let min = price;
						for (let i = 1; i <= 41; i++) {
							const tmp = min.plus(stepPrice);
							if (tmp > 2) {
								stepPrice = 0.01;
							} else if (tmp > 0.1) {
								stepPrice = 0.005;
							} else {
								stepPrice = 0.001;
							}
							min = min.plus(stepPrice);
							if (stepPrice === 0.01) {
								round = 3;
							} else {
								round = 3;
							}
							this.listLimitPrice.push(roundFloat(min, round));
						}
						this.props.actions.changeListLimitPrice(
							this.listLimitPrice
						);
					} else {
						this.listStopPrice = [];
						let min = price;
						for (let i = 1; i <= 41; i++) {
							const tmp = min.plus(stepPrice);
							if (tmp >= 2) {
								stepPrice = 0.01;
							} else if (tmp < 0.1) {
								stepPrice = 0.001;
							} else {
								stepPrice = 0.005;
							}
							min = min.plus(stepPrice);
							if (stepPrice === 0.01) {
								round = 2;
							} else {
								round = 3;
							}
							this.listStopPrice.push(roundFloat(min, round));
						}
						this.props.actions.changeListStopPrice(
							this.listStopPrice
						);
					}
					break;
			}
		} catch (error) {
			logAndReport(
				'setListPrice modifyOrder exception',
				error,
				'setListPrice modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - setListPrice ${type} - ${price}: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	setTitle(tradingHalt, price) {
		try {
			const displayName = this.props.displayName;
			if (!price) price = 0;
			let symbol = tradingHalt ? '! ' : '';
			this.nav.setTitle({
				title:
					symbol + `${displayName} (${formatNumberNew2(price, 2)}%)`
			});
		} catch (error) {
			logAndReport(
				'setTitle modifyOrder exception',
				error,
				'setTitle modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - setTitle - ${tradingHalt} - ${price}: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	changedValue(data) {
		try {
			if (!data) {
				return;
			}
			let val = {};
			if (data.length) {
				val = data[0] || {};
			} else {
				val = data || {};
			}
			if (val) {
				if (this.isMount) {
					this.isReady &&
						this.setTitle(
							this.state.tradingHalt,
							val.change_percent
						);
				}
				this.tradePrice = val.trade_price;
				this.setState(
					{
						high: val.high || 0,
						low: val.low || 0,
						close: val.close || 0,
						open: val.open || 0,
						previous_close: val.previous_close || 0,
						total_volume: val.volume || 0,
						change_percent: val.change_percent,
						ask_size: val.ask_size,
						bid_size: val.bid_size,
						bid_price: val.bid_price,
						ask_price: val.ask_price,
						trade_price: val.trade_price,
						trade_size: val.trade_size
					},
					() => {
						// this.getDataChartNow(val);
						this.props.data.code &&
							this.isCallOrderHistory &&
							this.loadLastOrderRequest(
								this.props.data.code,
								this.state.isUpdateLastOrder
							);
					}
				);
			}
		} catch (error) {
			logAndReport(
				'changedValue modifyOrder exception',
				error,
				'changedValue modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - changedValue - ${data}: ${
					data ? JSON.stringify(data) : ''
				}`
			);
		}
	}

	getDataChartNow(data) {
		let temp = {};
		temp.code = data.symbol;
		temp.close = data.trade_price;
		temp.high = data.high;
		temp.history_date = data.updated || new Date().getTime();
		temp.low = data.low;
		temp.open = data.open;
		temp.volume = data.volume;
		this.setState({
			dataChartNow: temp,
			updated: temp.history_date || new Date().getTime()
		});
	}

	unregisterPrice() {
		this.registered = false;
		unregister(this.objRegister);
	}

	componentWillUnmount() {
		this.isMount = false;
		this.stateApp && this.stateApp.removeHandler();
		this.stateApp = null;
		this.registered = false;
		this.unregisterPrice();
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	loadDataAll() {
		this.loadDataFromApi();
		const fcb2 = func.getFuncReload('modifyOrder_depth');
		fcb2 && fcb2();
		const fcb3 = func.getFuncReload('modifyOrder_Cos');
		fcb3 && fcb3();
	}

	loadDataFromApi() {
		try {
			this.perf = new Perf(
				performanceEnum.load_data_from_api_modify_order
			);
			this.perf && this.perf.start();
			this.props.actions.writeDataEvent();
			const stringQuery = this.props.data.symbol;
			if (func.getUserPriceSource() === userType.ClickToRefresh) {
				getPriceMultiExchange(
					stringQuery,
					func.getUserPriceSource(),
					(bodyData) => {
						if (bodyData && bodyData.length > 0) {
							this.props.actions.writeDataSuccess();
							this.changedValue(bodyData);
						} else {
							this.props.actions.writeDataError();
						}
					}
				);
			}
		} catch (error) {
			logAndReport(
				'loadDataFromApi order exception',
				error,
				'loadDataFromApi order'
			);
			logDevice(
				'info',
				`NewOrder - loadDataFromApi: ${url ? JSON.stringify(url) : ''}`
			);
		}
	}

	loadData() {
		this.stateApp = new StateApp(
			this.loadDataAll.bind(this),
			this.unregisterPrice.bind(this),
			this.typeForm
		);
	}

	loadFormData() {
		try {
			const { data } = this.props;
			const orderType = data.order_type;
			const initData = {
				filled_quantity: data.filled_quantity || 0,
				volume: data.volume || 0,
				stop_price: data.stop_price || 0,
				limit_price: data.limit_price || 0
			};
			this.props.actions.setupDataLoader(initData);
			this.getFees(data.volume, data.limit_price, data.stop_price);
		} catch (error) {
			logAndReport(
				'loadFormData modifyOrder exception',
				error,
				'loadFormData modifyOrder'
			);
			logDevice(
				'info',
				`NewOrder - loadFormData: ${error ? JSON.stringify(error) : ''}`
			);
		}
	}

	getTrailingStopPrice(type, value, buysell) {
		let res = 0;
		const trailValue =
			value ||
			(type === triggerType.PERCENT
				? this.props.modifyOrder.trailingPercent
				: this.props.modifyOrder.trailingAmount);
		const side = buysell || this.props.order.tradeType;
		const sign = side === this.props.data.is_buy ? 1 : -1;
		const marketPrice = this.state.trade_price
			? this.state.trade_price
			: this.state.close;
		if (type === triggerType.PERCENT) {
			res = marketPrice + (sign * marketPrice * trailValue) / 100;
		} else if (type === triggerType.PRICE) {
			res = marketPrice + sign * trailValue;
		}
		return res;
	}

	onChangeText(type, value) {
		try {
			logDevice(
				'info',
				`Modifyorder - onChangeText with type ${type} and value: ${value}`
			);
			this.timeout && clearTimeout(this.timeout);
			if (value === '') {
				value = '0';
			}
			value = value.replace(/,/g, '');
			if (value[0] === '0' && value[1] && !value.includes('.')) {
				value = value.slice(1);
			}
			let trailingStopPrice = 0;
			const { modifyOrder } = this.props;
			const orderType = this.getOrderType(this.props.originOrderType);
			switch (type) {
				case triggerType.PERCENT:
					if (value.match(/^\d+(\.\d{0,3})?$/i)) {
						trailingStopPrice = this.getTrailingStopPrice(
							triggerType.PERCENT,
							parseFloat(value)
						);
						this.checkError(
							modifyOrder.volume,
							modifyOrder.limitPrice,
							modifyOrder.stopPrice,
							modifyOrder.trailingAmount,
							parseFloat(value),
							trailingStopPrice,
							orderType
						);
						this.props.actions.changeTrailingStopPrice(
							trailingStopPrice
						);
						this.props.actions.changeTrailingPercent(value);
						this.setListPrice(
							triggerType.PERCENT,
							parseFloat(value)
						);
					}
					break;
				case triggerType.PRICE:
					if (value.match(/^\d+(\.\d{0,3})?$/i)) {
						trailingStopPrice = this.getTrailingStopPrice(
							triggerType.PRICE,
							parseFloat(value)
						);
						this.checkError(
							modifyOrder.volume,
							modifyOrder.limitPrice,
							modifyOrder.stopPrice,
							parseFloat(value),
							modifyOrder.trailingPercent,
							trailingStopPrice,
							orderType
						);
						this.setListPrice(triggerType.PRICE, parseFloat(value));
						this.props.actions.changeTrailingStopPrice(
							trailingStopPrice
						);
						this.props.actions.changeTrailingAmount(value);
					}
					break;
				case 'volume':
					value = parseFloat(value);
					this.props.actions.changeOrderVolume(value);
					this.checkError(
						value,
						modifyOrder.limitPrice,
						modifyOrder.stopPrice,
						modifyOrder.trailingAmount,
						modifyOrder.trailingPercent,
						modifyOrder.trailingStopPrice,
						orderType
					);
					if (this.error === '') {
						this.volume = value;
						this.timeout = setTimeout(() => {
							this.getFees(
								value,
								this.props.modifyOrder.limitPrice,
								this.props.modifyOrder.stopPrice
							);
						}, TIME_GET_FEES);
					}
					break;
				default:
					let stepPrice = 0;
					let price = parseFloat(value);
					let regex = '';
					if (price > 2) {
						stepPrice = 0.01;
						regex = /^\d+(\.\d{0,3})?$/i;
					} else if (price >= 0.1) {
						stepPrice = 0.005;
						regex = /^\d+(\.\d{0,3})?$/i;
					} else {
						stepPrice = 0.001;
						regex = /^\d+(\.\d{0,3})?$/i;
					}
					if (value.match(regex)) {
						const temp = new Big(value.toString());
						if (type === 'limit') {
							this.checkError(
								modifyOrder.volume,
								value,
								modifyOrder.stopPrice,
								modifyOrder.trailingAmount,
								modifyOrder.trailingPercent,
								modifyOrder.trailingStopPrice,
								orderType
							);
							if (this.error === '') {
								this.timeout = setTimeout(() => {
									this.getFees(
										this.props.modifyOrder.volume,
										value,
										this.props.modifyOrder.stopPrice
									);
								}, TIME_GET_FEES);
							}
							this.props.actions.changePrice(
								orderTypeString.LIMIT,
								value.toString()
							);
							this.setListPrice('limit', parseFloat(value));
						} else if (type === 'stop') {
							this.checkError(
								modifyOrder.volume,
								modifyOrder.limitPrice,
								value,
								modifyOrder.trailingAmount,
								modifyOrder.trailingPercent,
								modifyOrder.trailingStopPrice,
								orderType
							);
							if (this.error === '') {
								this.timeout = setTimeout(() => {
									this.getFees(
										this.props.modifyOrder.volume,
										this.props.modifyOrder.limitPrice,
										value
									);
								}, TIME_GET_FEES);
							}
							this.props.actions.changePrice(
								orderTypeString.STOP_MARKET,
								value.toString()
							);
							this.setListPrice('stop', parseFloat(value));
						}
					}
					break;
			}
		} catch (error) {
			logAndReport(
				'onChangeText modifyOrder exception',
				error,
				'onChangeText modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - onChangeText ${type} - ${value}: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	getFees(volume, limitPrice, stopPrice) {
		try {
			this.perf = new Perf(performanceEnum.get_fees);
			this.perf && this.perf.start();
			logDevice(
				'info',
				`ModifyOrder - Start get fees: ${this.props.app.isConnected}`
			);
			if (this.props.app.isConnected) {
				const type =
					(this.props.data.order_type + '').toUpperCase() || '';
				const timeStamp = new Date().getTime();
				let exchange = this.props.data.exchange
					? this.props.data.exchange.replace('[Demo]', '')
					: '';
				const objOrder = {
					account_id: dataStorage.accountId,
					code: this.props.data.symbol,
					volume: convertFormatToNumber(volume),
					exchange: exchange,
					order_type: this.props.data.order_type,
					is_buy: this.props.data.is_buy === 1
					// init_time: timeStamp
				};
				if (
					type === orderTypeString.MARKETTOLIMIT ||
					orderType.MARKETTOLIMIT
				) {
					objOrder['duration'] = this.props.data.duration;
				}
				if (
					type === orderTypeString.LIMIT ||
					type === orderType.LIMIT ||
					type === orderType.STOP_LIMIT ||
					type === orderTypeString.STOP_LIMIT
				) {
					objOrder['limit_price'] = convertFormatToNumber(limitPrice);
					objOrder['duration'] = this.props.data.duration;
				}
				if (
					type === orderTypeString.STOP_MARKET ||
					type === orderType.STOP ||
					type === orderType.STOP_LIMIT ||
					type === orderTypeString.STOP_LIMIT
				) {
					objOrder['stop_price'] = convertFormatToNumber(stopPrice);
					objOrder['duration'] = this.props.data.duration;
				}
				logDevice(
					'info',
					`ModifyOrder - Object get fees: ${
						objOrder ? JSON.stringify(objOrder) : ''
					} - UserId: ${this.userId}`
				);
				const feesUrl = api.getUrlFee();
				api.postData(feesUrl, { data: objOrder })
					.then((data) => {
						logDevice(
							'info',
							`ModifyOrder - getFees callback with data: ${JSON.stringify(
								data
							)}`
						);
						if (data) {
							this.getDataFeesCallback(data);
						}
					})
					.catch((error) => {
						logDevice(
							'info',
							`ModifyOrder - Get Fees exception: ${error}}`
						);
					});
			} else {
				Alert.alert(
					'',
					'Please check your internet connection.',
					[
						{
							text: 'OK'
						}
					],
					{ cancelable: false }
				);
			}
		} catch (error) {
			logAndReport(
				'get fees order exception',
				error,
				'confirmOrder order'
			);
			logDevice(
				'info',
				`ModifyOrder - GetFees: ${
					objOrder ? JSON.stringify(objOrder) : ''
				}`
			);
		}
	}

	convertDuration(duration) {
		switch (duration) {
			case 'DAY':
				return 'DAY';
			case 'GTC':
				return 'Good Till Cancelled';
			case 'FAK':
				return 'Fill and Kill';
			case 'IOC':
				return 'Immediate Or Cancel';
			case 'FOK':
				return 'Fill Or Kill';
			default:
				return duration;
		}
	}

	getDataFeesCallback(data) {
		try {
			let totalFees =
				data.estimated_brokerage && data.estimated_tax
					? data.estimated_brokerage + data.estimated_tax
					: 0;
			this.setState({
				totalFees
			});
		} catch (error) {
			logDevice(
				'info',
				`Modify Order get data fees callback exception ${error}`
			);
		}
	}

	renderLimitOrder(filledValue) {
		return (
			<View style={{ width: '100%', backgroundColor: 'white' }}>
				<View style={styles.rowPickerContainer}>
					{filledValue ? (
						<View style={{ width: '50%', paddingRight: 8 }}>
							{this.renderAtribute(
								filledValue,
								I18n.t('Filled', {
									locale: this.props.setting.lang
								})
							)}
						</View>
					) : (
						this.renderVolume()
					)}
					{this.renderLimitPriceRight()}
				</View>
				<View style={{ paddingHorizontal: 16, width: '100%' }}>
					{filledValue ? this.renderVolume(false, true) : null}
					{this.renderAtribute(
						this.convertDuration(this.props.data.duration),
						I18n.t('duration', { locale: this.props.setting.lang })
					)}
					{this.renderAtribute(
						this.exchange,
						I18n.t('exchange_txt', {
							locale: this.props.setting.lang
						})
					)}
				</View>
			</View>
		);
	}

	renderStopLimitOrder(filledValue) {
		return (
			<View style={{ width: '100%', backgroundColor: 'white' }}>
				<View style={styles.rowPickerContainer}>
					{this.renderLimitPriceLeft()}
					{this.renderStopPrice()}
				</View>
				<View style={{ paddingHorizontal: 16, width: '100%' }}>
					{filledValue
						? this.renderAtribute(
								filledValue,
								I18n.t('Filled', {
									locale: this.props.setting.lang
								})
						  )
						: null}
					{filledValue ? null : this.renderVolume(false, true)}
					{this.renderAtribute(
						this.convertDuration(this.props.data.duration),
						I18n.t('duration', { locale: this.props.setting.lang })
					)}
					{this.renderAtribute(
						this.exchange,
						I18n.t('exchange_txt', {
							locale: this.props.setting.lang
						})
					)}
				</View>
			</View>
		);
	}

	renderTrailingStopLimitOrder(filledValue) {
		return (
			<View style={{ width: '100%', backgroundColor: 'white' }}>
				<View style={styles.rowPickerContainer}>
					{this.renderTrailingStopPrice()}
					{this.renderLimitPriceRight()}
				</View>
				<View style={styles.rowPickerContainer}>
					<View style={{ width: '50%', paddingRight: 8 }}>
						{this.renderAtribute(
							this.props.data.triggerType,
							I18n.t('triggerType', {
								locale: this.props.setting.lang
							})
						)}
					</View>
					<View style={{ width: '50%', paddingLeft: 8 }}>
						{this.renderTrailingValue()}
					</View>
				</View>
				<View style={{ paddingHorizontal: 16, width: '100%' }}>
					{filledValue
						? this.renderAtribute(
								filledValue,
								I18n.t('Filled', {
									locale: this.props.setting.lang
								})
						  )
						: null}
					{this.renderVolume(false, true)}
					{this.renderAtribute(
						this.convertDuration(this.props.data.duration),
						I18n.t('duration', { locale: this.props.setting.lang })
					)}
					{this.renderAtribute(
						this.exchange,
						I18n.t('exchange_txt', {
							locale: this.props.setting.lang
						})
					)}
				</View>
			</View>
		);
	}

	changeTrailingAmount(value) {
		dataStorage.isNewOrderChangeTextInput = true;
		const trailingStopPrice = this.getTrailingStopPrice(
			triggerType.PRICE,
			parseFloat(value)
		);
		const { modifyOrder } = this.props;
		this.props.actions.changeTrailingAmount(value);
		this.props.actions.changeTrailingStopPrice(trailingStopPrice);
		this.getFees(
			modifyOrder.volume,
			modifyOrder.limitPrice,
			modifyOrder.stopPrice,
			modifyOrder.orderType
		);
		this.setListPrice(triggerType.PRICE, parseFloat(value));
	}

	changeTrailingPercent(value) {
		const trailingStopPrice = this.getTrailingStopPrice(
			triggerType.PERCENT,
			parseFloat(value)
		);
		const { modifyOrder } = this.props;
		let valueSet = value + '';
		valueSet = valueSet.replace('%', '');
		this.props.actions.changeTrailingPercent(valueSet);
		this.props.actions.changeTrailingStopPrice(trailingStopPrice);
		this.getFees(
			modifyOrder.volume,
			modifyOrder.limitPrice,
			modifyOrder.stopPrice,
			modifyOrder.orderType
		);
		this.setListPrice(triggerType.PERCENT, parseFloat(valueSet));
	}

	renderTrailingStopPrice() {
		return (
			<View style={{ width: '50%', paddingRight: 8 }}>
				{this.renderAtribute(
					I18n.t('trailingStopPrice', {
						locale: this.props.setting.lang
					}),
					formatNumberNew2(
						this.props.modifyOrder.trailingStopPrice,
						3
					),
					null,
					this.state.trailingStopPriceError
				)}
			</View>
		);
	}

	renderTrailingValue() {
		return (
			<View style={{ width: '100%', paddingLeft: 8 }}>
				{this.props.data.triggerType === triggerType.PERCENT ? (
					<PickerCustom
						testID={`modifyOrderTrailingPercent`}
						navigator={this.nav}
						name="Trailing Percent"
						disabled={
							this.state.excuting || !this.props.app.isConnected
						}
						editable={true}
						errorText={this.state.trailingErrorText}
						onChangeText={this.onChangeText.bind(
							this,
							triggerType.PERCENT
						)}
						floatingLabel={I18n.t('trailingPercent', {
							locale: this.props.setting.lang
						})}
						selectedValue={this.props.order.trailingPercent}
						onValueChange={this.changeTrailingPercent.bind(this)}
						data={this.listTrailingPercent}
					/>
				) : (
					<PickerCustom
						testID={`newOrderTrailingPercent`}
						navigator={this.nav}
						name="Trailing Amount"
						editable={true}
						disabled={
							this.state.excuting || !this.props.app.isConnected
						}
						errorText={this.state.trailingErrorText}
						onChangeText={this.onChangeText.bind(
							this,
							triggerType.PRICE
						)}
						floatingLabel={I18n.t('trailingAmount', {
							locale: this.props.setting.lang
						})}
						selectedValue={this.props.order.trailingAmount}
						onValueChange={this.changeTrailingAmount.bind(this)}
						data={this.listTrailingAmount}
					/>
				)}
			</View>
		);
	}

	renderStoplossOrder(filledValue) {
		return (
			<View style={{ width: '100%', backgroundColor: 'white' }}>
				<View style={styles.rowPickerContainer}>
					{filledValue ? (
						<View style={{ width: '50%', paddingRight: 8 }}>
							{this.renderAtribute(
								filledValue,
								I18n.t('Filled', {
									locale: this.props.setting.lang
								})
							)}
						</View>
					) : (
						this.renderVolume()
					)}
					{this.renderStopPrice()}
				</View>
				<View style={{ paddingHorizontal: 16, width: '100%' }}>
					{filledValue ? this.renderVolume(false, true) : null}
					{this.renderAtribute(
						this.convertDuration(this.props.data.duration),
						I18n.t('duration', { locale: this.props.setting.lang })
					)}
					{this.renderAtribute(
						this.exchange,
						I18n.t('exchange_txt', {
							locale: this.props.setting.lang
						})
					)}
				</View>
			</View>
		);
	}

	toggleShowMoreDescription() {
		this.setState((previousState) => {
			return { isShowMore: !previousState.isShowMore };
		});
	}

	renderStopLimitDescription() {
		const displayName = this.props.displayName;
		const tradeType = this.props.data.is_buy ? 'Buy' : 'Sell';
		let { isShowMore } = this.state;
		const tmp =
			tradeType === tradeTypeString.BUY
				? I18n.t('increases', { locale: this.props.setting.lang })
				: I18n.t('falls', { locale: this.props.setting.lang });
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMain}
				>
					{`${I18n.t('stopLimitPart1', {
						locale: this.props.setting.lang
					})} ${tradeType.toUpperCase()} ${formatNumber(
						this.props.modifyOrder.volume
					)} Units of ${displayName} ${I18n.t('stopLimitPart2', {
						locale: this.props.setting.lang
					})} ${tmp} ${I18n.t('toLower', {
						locale: this.props.setting.lang
					})} ${formatNumberNew2(
						this.props.modifyOrder.stopPrice,
						3
					)} ${I18n.t('stopLimitPart3', {
						locale: this.props.setting.lang
					})} ${tradeType.toUpperCase()} ${formatNumber(
						this.props.modifyOrder.volume
					)} ${displayName} ${I18n.t('at', {
						locale: this.props.setting.lang
					})} ${formatNumberNew2(
						this.props.modifyOrder.limitPrice,
						3
					)} ${I18n.t('or', { locale: this.props.setting.lang })} ${
						tradeType === tradeTypeString.BUY
							? I18n.t('lower', {
									locale: this.props.setting.lang
							  })
							: I18n.t('higher', {
									locale: this.props.setting.lang
							  })
					}.`}
				</Text>
			</View>
		);
	}

	renderLimitDescription() {
		const displayName = this.props.displayName;
		const tradeType = this.props.data.is_buy ? 'Buy' : 'Sell';
		let { isShowMore } = this.state;
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMain}
				>
					{`${I18n.t('limitPart1', {
						locale: this.props.setting.lang
					})} ${tradeType.toUpperCase()} ${formatNumber(
						this.props.modifyOrder.volume
					)} Units of ${displayName} ${I18n.t('limitPart2', {
						locale: this.props.setting.lang
					})} ${formatNumberNew2(
						this.props.modifyOrder.limitPrice,
						3
					)} ${I18n.t('or', { locale: this.props.setting.lang })} ${
						tradeType === 'sell'
							? I18n.t('higher', {
									locale: this.props.setting.lang
							  })
							: I18n.t('lower', {
									locale: this.props.setting.lang
							  })
					}.`}
				</Text>
			</View>
		);
	}

	renderMarketToLimitDescription() {
		const displayName = this.props.displayName;
		const tradeType = this.props.data.is_buy ? 'Buy' : 'Sell';
		let { isShowMore } = this.state;
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMain}
				>
					{`${I18n.t('marketToLimitPart1', {
						locale: this.props.setting.lang
					})} ${tradeType.toUpperCase()} ${formatNumber(
						this.props.modifyOrder.volume
					)} Units of ${displayName} ${I18n.t('marketToLimitPart2', {
						locale: this.props.setting.lang
					})} ${
						tradeType === 'Sell'
							? I18n.t('bid', { locale: this.props.setting.lang })
							: I18n.t('offer', {
									locale: this.props.setting.lang
							  })
					} ${I18n.t('marketToLimitPart3', {
						locale: this.props.setting.lang
					})}`}
				</Text>
			</View>
		);
	}

	renderTrailingStopLimitDescription() {
		const displayName = this.props.displayName;
		const tradeType = data.is_buy ? 'Buy' : 'Sell';
		let { isShowMore } = this.state;
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMain}
				>
					{tradeType === tradeTypeString.BUY
						? `${I18n.t('trailingStopLimitPart1', {
								locale: this.props.setting.lang
						  })} ${(tradeType + '').toUpperCase()} ${formatNumber(
								this.props.modifyOrder.volume
						  )} Units of ${displayName} ${I18n.t(
								'trailingStopLimitPart2',
								{ locale: this.props.setting.lang }
						  )}, ${
								this.props.modifyOrder.triggerType === 'Percent'
									? I18n.t('trailingPercentLower', {
											locale: this.props.setting.lang
									  })
									: I18n.t('trailingAmountLower', {
											locale: this.props.setting.lang
									  })
						  } (${
								this.props.modifyOrder.triggerType === 'Percent'
									? this.props.modifyOrder.trailingPercent +
									  '%'
									: this.props.modifyOrder.trailingAmount
						  }), ${I18n.t('trailingStopLimitPart3', {
								locale: this.props.setting.lang
						  })} ${formatNumberNew2(
								this.props.modifyOrder.trailingStopPrice,
								3
						  )}. ${I18n.t('trailingStopLimitPart4', {
								locale: this.props.setting.lang
						  })} ${
								this.props.modifyOrder.triggerType === 'Percent'
									? I18n.t('trailingPercentLower', {
											locale: this.props.setting.lang
									  })
									: I18n.t('trailingAmountLower', {
											locale: this.props.setting.lang
									  })
						  }. ${I18n.t('trailingStopLimitPart5', {
								locale: this.props.setting.lang
						  })} ${(tradeType + '').toUpperCase()} ${formatNumber(
								this.props.ordemodifyOrderr.volume
						  )} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
						  })} ${formatNumberNew2(
								this.props.modifyOrder.limitPrice,
								3
						  )} ${I18n.t('or', {
								locale: this.props.setting.lang
						  })} ${I18n.t('lower', {
								locale: this.props.setting.lang
						  })}.`
						: `${I18n.t('trailingStopLimitPart1', {
								locale: this.props.setting.lang
						  })} ${(tradeType + '').toUpperCase()} ${formatNumber(
								this.props.modifyOrder.volume
						  )} Units of ${displayName} ${I18n.t(
								'trailingStopLimitPart2',
								{ locale: this.props.setting.lang }
						  )}, ${
								this.props.modifyOrder.triggerType === 'Percent'
									? I18n.t('trailingPercentLower', {
											locale: this.props.setting.lang
									  })
									: I18n.t('trailingAmountLower', {
											locale: this.props.setting.lang
									  })
						  } (${
								this.props.modifyOrder.triggerType === 'Percent'
									? this.props.modifyOrder.trailingPercent +
									  '%'
									: this.props.modifyOrder.trailingAmount
						  }), ${I18n.t('trailingStopLimitPart3', {
								locale: this.props.setting.lang
						  })} ${formatNumberNew2(
								this.props.modifyOrder.trailingStopPrice,
								3
						  )}. ${I18n.t('trailingStopLimitPart41', {
								locale: this.props.setting.lang
						  })} ${
								this.props.modifyOrder.triggerType === 'Percent'
									? I18n.t('trailingPercentLower', {
											locale: this.props.setting.lang
									  })
									: I18n.t('trailingAmountLower', {
											locale: this.props.setting.lang
									  })
						  }. ${I18n.t('trailingStopLimitPart51', {
								locale: this.props.setting.lang
						  })} ${(tradeType + '').toUpperCase()} ${formatNumber(
								this.props.modifyOrder.volume
						  )} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
						  })} ${formatNumberNew2(
								this.props.modifyOrder.limitPrice,
								3
						  )} ${I18n.t('or', {
								locale: this.props.setting.lang
						  })} ${I18n.t('higher', {
								locale: this.props.setting.lang
						  })}.`}
				</Text>
			</View>
		);
	}

	renderStopLossDescription() {
		const displayName = this.props.displayName;
		const tradeType = this.props.data.is_buy ? 'Buy' : 'Sell';
		let { isShowMore } = this.state;
		const tmp =
			tradeType === tradeTypeString.BUY
				? I18n.t('increases', { locale: this.props.setting.lang })
				: I18n.t('decreases', { locale: this.props.setting.lang });
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMain}
				>
					{`${I18n.t('stopLossPart1', {
						locale: this.props.setting.lang
					})} ${tradeType.toUpperCase()} ${formatNumber(
						this.props.modifyOrder.volume
					)} Units of ${displayName} ${I18n.t('stopLossPart2', {
						locale: this.props.setting.lang
					})} ${tmp} ${I18n.t('toLower', {
						locale: this.props.setting.lang
					})} ${formatNumberNew2(
						this.props.modifyOrder.stopPrice,
						3
					)} ${I18n.t('stopLossPart3', {
						locale: this.props.setting.lang
					})} ${tradeType.toUpperCase()} ${formatNumber(
						this.props.modifyOrder.volume
					)} ${displayName} ${I18n.t('stopLossPart4', {
						locale: this.props.setting.lang
					})}`}
				</Text>
			</View>
		);
	}

	renderDescription(orderType) {
		switch (orderType) {
			case orderTypeString.TRAILINGSTOPLIMIT:
				return this.renderTrailingStopLimitDescription();
			case orderTypeString.MARKETTOLIMIT:
				return this.renderMarketToLimitDescription();
			case orderTypeString.LIMIT:
				return this.renderLimitDescription();
			case orderTypeString.STOP_LIMIT:
				return this.renderStopLimitDescription();
			case orderTypeString.STOPLOSS:
				return this.renderStopLossDescription();
			case orderTypeString.BEST:
				return null;
		}
	}

	renderStopOrder() {
		return (
			<View style={{ width: '100%', backgroundColor: 'white' }}>
				<View style={styles.rowPickerContainer}>
					{this.renderVolume()}
					{this.renderStopPrice()}
				</View>
				<View style={styles.rowPickerContainer}>
					<View style={{ width: '50%', paddingRight: 8 }}>
						{this.renderAtribute(
							this.convertDuration(this.props.data.duration),
							I18n.t('duration', {
								locale: this.props.setting.lang
							})
						)}
					</View>
					<View style={{ width: '50%', paddingLeft: 8 }}>
						{this.renderAtribute(
							this.exchange,
							I18n.t('exchange_txt', {
								locale: this.props.setting.lang
							})
						)}
					</View>
				</View>
			</View>
		);
	}

	renderLimitPriceRight() {
		return (
			<View style={{ width: '50%', paddingLeft: 8 }}>
				<PickerCustom
					name="Limit Price"
					editable={true}
					errorText={this.state.limitPriceErrorText}
					onChangeText={this.onChangeText.bind(this, 'limit')}
					floatingLabel={I18n.t('limitPrice', {
						locale: this.props.setting.lang
					})}
					selectedValue={this.props.modifyOrder.limitPrice}
					onValueChange={this.changeLimitPrice.bind(this)}
					data={this.listLimitPrice}
				/>
			</View>
		);
	}

	renderLimitPriceLeft() {
		return (
			<View style={{ width: '50%', paddingRight: 8 }}>
				<PickerCustom
					name="Limit Price"
					editable={true}
					errorText={this.state.limitPriceErrorText}
					onChangeText={this.onChangeText.bind(this, 'limit')}
					floatingLabel={I18n.t('limitPrice', {
						locale: this.props.setting.lang
					})}
					selectedValue={this.props.modifyOrder.limitPrice}
					onValueChange={this.changeLimitPrice.bind(this)}
					data={this.listLimitPrice}
				/>
			</View>
		);
	}

	changeLimitPrice(value) {
		dataStorage.isNewOrderChangeTextInput = true;
		this.props.actions.changePrice(orderTypeString.LIMIT, value);
		this.getFees(
			this.props.modifyOrder.volume,
			value,
			this.props.modifyOrder.stopPrice
		);
		this.setListPrice('limit', value);
	}

	renderStopPrice() {
		let disabled = false;
		return (
			<View style={{ width: '50%', paddingLeft: 8 }}>
				<PickerCustom
					name="Stop Price"
					editable={true}
					disabled={this.state.disabled}
					errorText={this.state.stopPriceErrorText}
					onChangeText={this.onChangeText.bind(this, 'stop')}
					floatingLabel={I18n.t('triggerPrice', {
						locale: this.props.setting.lang
					})}
					selectedValue={this.props.modifyOrder.stopPrice}
					onValueChange={this.changeStopPrice.bind(this)}
					data={this.listStopPrice}
				/>
			</View>
		);
	}

	changeStopPrice(value) {
		dataStorage.isNewOrderChangeTextInput = true;
		this.props.actions.changePrice(orderTypeString.STOP_MARKET, value);
		this.getFees(
			this.props.modifyOrder.volume,
			this.props.modifyOrder.limitPrice,
			value
		);
		this.setListPrice('stop', value);
	}

	renderVolume(isRight = false, isFull = false) {
		return (
			<View
				style={[
					{ width: isFull ? '100%' : '50%' },
					isFull
						? { paddingHorizontal: 0 }
						: {
								paddingRight: isRight ? 0 : 8,
								paddingLeft: isRight ? 8 : 0
						  }
				]}
			>
				<PickerCustom
					testID="volumeModify"
					name="Volume"
					editable={true}
					errorText={this.state.volumeErrorText}
					onChangeText={this.onChangeText.bind(this, 'volume')}
					floatingLabel={I18n.t('quantity', {
						locale: this.props.setting.lang
					})}
					selectedValue={this.props.modifyOrder.volume}
					onValueChange={this.changeVolume.bind(this)}
					data={this.listVolume}
				/>
			</View>
		);
	}

	changeVolume(val) {
		value = parseInt(val);
		this.volume = value;
		this.props.actions.changeOrderVolume(value);
		this.getFees(
			value,
			this.props.modifyOrder.limitPrice,
			this.props.modifyOrder.stopPrice
		);
	}

	renderMarketToLimitOrder(filledValue) {
		return (
			<View style={{ width: '100%', backgroundColor: 'white' }}>
				{filledValue ? (
					<View style={styles.rowPickerContainer}>
						<View style={{ width: '50%', paddingRight: 8 }}>
							{this.renderAtribute(
								filledValue,
								I18n.t('Filled', {
									locale: this.props.setting.lang
								})
							)}
						</View>
						{this.renderLimitPriceRight()}
					</View>
				) : null}
				<View style={{ width: '100%', paddingHorizontal: 16 }}>
					{this.renderVolume(true, true)}
					{this.renderAtribute(
						this.convertDuration(this.props.data.duration),
						I18n.t('duration', { locale: this.props.setting.lang })
					)}
					{this.renderAtribute(
						this.exchange,
						I18n.t('exchange_txt', {
							locale: this.props.setting.lang
						})
					)}
				</View>
			</View>
		);
	}

	renderOrderContent(type) {
		try {
			const displayName = this.props.displayName;
			const tradeType = this.props.data.is_buy ? 'Buy' : 'Sell';
			let changeText = 0;
			const changeValue =
				this.props.data.volume - this.props.modifyOrder.volume;
			if (changeValue < 0) {
				changeText = `ADD ` + formatNumber(Math.abs(changeValue));
			} else if (changeValue > 0) {
				changeText = `REDUCE ` + formatNumber(Math.abs(changeValue));
			} else {
				this.confirmTextOrder = tradeType.toUpperCase();
				this.confirmTextButton = tradeType.toUpperCase();
			}
			switch (type) {
				case orderType.MARKET:
				case orderType.MARKET_ORDER:
					if (changeValue !== 0) {
						this.isChange = true;
						this.confirmTextButton = `${I18n.t('modifyUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('toLower', {
							locale: this.props.setting.lang
						})} ${tradeType.toUpperCase()} / ${changeText} ${I18n.t(
							'of',
							{ locale: this.props.setting.lang }
						)} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${I18n.t('marketPrice', {
							locale: this.props.setting.lang
						})}`;
						this.confirmTextOrder = `${I18n.t('modify', {
							locale: this.props.setting.lang
						})} ${I18n.t('market', {
							locale: this.props.setting.lang
						})} ${I18n.t('order_txt', {
							locale: this.props.setting.lang
						})} ${I18n.t('fromLower', {
							locale: this.props.setting.lang
						})} ${
							tradeType === 'Buy'
								? I18n.t('buyingUpper', {
										locale: this.props.setting.lang
								  })
								: I18n.t('sellingUpper', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(this.props.data.volume)} ${I18n.t(
							'of',
							{ locale: this.props.setting.lang }
						)} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${I18n.t('marketUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('price', {
							locale: this.props.setting.lang
						})} ${I18n.t('toLower', {
							locale: this.props.setting.lang
						})} ${formatNumber(
							this.props.modifyOrder.volume
						)} ${I18n.t('of', {
							locale: this.props.setting.lang
						})} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${I18n.t('marketUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('price', {
							locale: this.props.setting.lang
						})}?`;
						this.note = `${changeText} @ MKT`;
					} else {
						this.isChange = false;
					}
					break;
				case orderType.MARKETTOLIMIT:
				case orderTypeString.MARKETTOLIMIT:
				case orderType.MARKETTOLIMIT_ORDER:
					if (
						changeValue !== 0 ||
						(this.props.data.order_type === orderType.LIMIT &&
							parseFloat(this.props.modifyOrder.limitPrice) !==
								parseFloat(this.props.data.limit_price))
					) {
						this.isChange = true;
						if (this.props.data.filled_quantity) {
							this.confirmTextButton = `${I18n.t('modifyUpper', {
								locale: this.props.setting.lang
							})} ${tradeType.toUpperCase()} / ${changeText} @ LMT ${formatNumberNew2(
								this.props.modifyOrder.limitPrice
							)}`;
							this.confirmTextOrder = `${I18n.t('modify', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketToLimitUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('order_txt', {
								locale: this.props.setting.lang
							})} ${I18n.t('fromLower', {
								locale: this.props.setting.lang
							})} ${
								tradeType === 'Buy'
									? I18n.t('buyingUpper', {
											locale: this.props.setting.lang
									  })
									: I18n.t('sellingUpper', {
											locale: this.props.setting.lang
									  })
							} ${formatNumber(this.props.data.volume)} ${I18n.t(
								'of',
								{ locale: this.props.setting.lang }
							)} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${formatNumberNew2(
								this.props.data.limit_price,
								3
							)} ${I18n.t('toLower', {
								locale: this.props.setting.lang
							})} ${formatNumber(
								this.props.modifyOrder.volume
							)} ${I18n.t('of', {
								locale: this.props.setting.lang
							})} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${formatNumberNew2(
								this.props.modifyOrder.limitPrice,
								3
							)}?`;
							this.note = `${changeText} @ LMT ${formatNumberNew2(
								this.props.modifyOrder.limitPrice,
								3
							)}`;
						} else {
							this.confirmTextButton = `${I18n.t('modifyUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('toLower', {
								locale: this.props.setting.lang
							})} ${tradeType.toUpperCase()} / ${changeText} ${I18n.t(
								'of',
								{ locale: this.props.setting.lang }
							)} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketPrice', {
								locale: this.props.setting.lang
							})}`;
							this.confirmTextOrder = `${I18n.t('modify', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketToLimitUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('order_txt', {
								locale: this.props.setting.lang
							})} ${I18n.t('fromLower', {
								locale: this.props.setting.lang
							})} ${
								tradeType === 'Buy'
									? I18n.t('buyingUpper', {
											locale: this.props.setting.lang
									  })
									: I18n.t('sellingUpper', {
											locale: this.props.setting.lang
									  })
							} ${formatNumber(this.props.data.volume)} ${I18n.t(
								'of',
								{ locale: this.props.setting.lang }
							)} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('price', {
								locale: this.props.setting.lang
							})} ${I18n.t('toLower', {
								locale: this.props.setting.lang
							})} ${formatNumber(
								this.props.modifyOrder.volume
							)} ${I18n.t('of', {
								locale: this.props.setting.lang
							})} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('price', {
								locale: this.props.setting.lang
							})}?`;
							this.note = `${changeText} @ MKT`;
						}
					} else {
						this.isChange = false;
					}
					break;
				case orderType.LIMIT:
				case orderTypeString.LIMIT:
					if (
						changeValue !== 0 ||
						parseFloat(this.props.modifyOrder.limitPrice) !==
							parseFloat(this.props.data.limit_price)
					) {
						this.isChange = true;
						this.confirmTextButton = `${I18n.t('modifyUpper', {
							locale: this.props.setting.lang
						})} ${tradeType.toUpperCase()} / ${changeText} @ LMT ${formatNumberNew2(
							this.props.modifyOrder.limitPrice
						)}`;
						this.confirmTextOrder = `${I18n.t('modify', {
							locale: this.props.setting.lang
						})} ${I18n.t('limitUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('order_txt', {
							locale: this.props.setting.lang
						})} ${I18n.t('fromLower', {
							locale: this.props.setting.lang
						})} ${
							tradeType === 'Buy'
								? I18n.t('buyingUpper', {
										locale: this.props.setting.lang
								  })
								: I18n.t('sellingUpper', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(this.props.data.volume)} ${I18n.t(
							'of',
							{ locale: this.props.setting.lang }
						)} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.data.limit_price,
							3
						)} ${I18n.t('toLower', {
							locale: this.props.setting.lang
						})} ${formatNumber(
							this.props.modifyOrder.volume
						)} ${I18n.t('of', {
							locale: this.props.setting.lang
						})} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.limitPrice,
							3
						)}?`;
						this.note = `${changeText} @ LMT ${formatNumberNew2(
							this.props.modifyOrder.limitPrice,
							3
						)}`;
					} else {
						this.isChange = false;
					}
					break;
				case orderType.STOP_LIMIT:
				case orderTypeString.STOP_LIMIT:
					if (
						changeValue !== 0 ||
						parseFloat(this.props.modifyOrder.stopPrice) !==
							parseFloat(this.props.data.stop_price) ||
						this.props.modifyOrder.limitPrice.toString() !==
							this.props.data.limit_price.toString()
					) {
						this.isChange = true;
						this.confirmTextButton = `${I18n.t('modifyUpper', {
							locale: this.props.setting.lang
						})} ${tradeType.toUpperCase()} / ${changeText} @ LMT ${formatNumberNew2(
							this.props.modifyOrder.limitPrice,
							3
						)} / STP ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}`;
						this.confirmTextOrder = `${I18n.t('modify', {
							locale: this.props.setting.lang
						})} ${I18n.t('stopLimitUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('order_txt', {
							locale: this.props.setting.lang
						})} ${I18n.t('fromLower', {
							locale: this.props.setting.lang
						})} ${
							tradeType === 'Buy'
								? I18n.t('buyingUpper', {
										locale: this.props.setting.lang
								  })
								: I18n.t('sellingUpper', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(this.props.data.volume)} ${I18n.t(
							'of',
							{ locale: this.props.setting.lang }
						)} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.data.limit_price,
							3
						)}, ${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.data.stop_price,
							3
						)} ${I18n.t('toLower', {
							locale: this.props.setting.lang
						})} ${formatNumber(
							this.props.modifyOrder.volume
						)} ${I18n.t('of', {
							locale: this.props.setting.lang
						})} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.limitPrice,
							3
						)}, ${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}?`;
						this.note = `${changeText} @ LMT ${formatNumberNew2(
							this.props.modifyOrder.limitPrice,
							3
						)} / STP ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}`;
					} else {
						this.isChange = false;
					}
					break;
				case orderType.STOP:
				case orderTypeString.STOP_MARKET:
					if (
						changeValue !== 0 ||
						parseFloat(this.props.modifyOrder.stopPrice) !==
							parseFloat(this.props.data.stop_price)
					) {
						this.isChange = true;
						this.confirmTextButton = `${I18n.t('modifyUpper', {
							locale: this.props.setting.lang
						})} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}`;
						this.confirmTextOrder = `${I18n.t('modify', {
							locale: this.props.setting.lang
						})} ${I18n.t('stoplossUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('order_txt', {
							locale: this.props.setting.lang
						})} ${I18n.t('fromLower', {
							locale: this.props.setting.lang
						})} ${
							tradeType === 'Buy'
								? I18n.t('buyingUpper', {
										locale: this.props.setting.lang
								  })
								: I18n.t('sellingUpper', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(this.props.data.volume)} ${I18n.t(
							'of',
							{ locale: this.props.setting.lang }
						)} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${I18n.t('marketPrice', {
							locale: this.props.setting.lang
						})}, (${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.data.stop_price,
							3
						)}) to ${
							tradeType === 'Buy'
								? I18n.t('buying', {
										locale: this.props.setting.lang
								  })
								: I18n.t('selling', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(
							this.props.modifyOrder.volume
						)} ${I18n.t('of', {
							locale: this.props.setting.lang
						})} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${I18n.t('marketPrice', {
							locale: this.props.setting.lang
						})} (${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)})?`;
						this.note = `${changeText} @ STP ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}`;
					} else {
						this.isChange = false;
					}
					break;
				case orderType.STOPLOSS:
				case orderTypeString.STOPLOSS:
					if (
						changeValue !== 0 ||
						parseFloat(this.props.modifyOrder.stopPrice) !==
							parseFloat(this.props.data.stop_price)
					) {
						this.isChange = true;
						if (this.props.data.filled_quantity) {
							this.confirmTextButton = `${I18n.t('modifyUpper', {
								locale: this.props.setting.lang
							})} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(
								this.props.modifyOrder.stopPrice,
								3
							)}`;
							this.confirmTextOrder = `${I18n.t('modify', {
								locale: this.props.setting.lang
							})} ${I18n.t('stoplossUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('order_txt', {
								locale: this.props.setting.lang
							})} ${I18n.t('fromLower', {
								locale: this.props.setting.lang
							})} ${
								tradeType === 'Buy'
									? I18n.t('buyingUpper', {
											locale: this.props.setting.lang
									  })
									: I18n.t('sellingUpper', {
											locale: this.props.setting.lang
									  })
							} ${formatNumber(this.props.data.volume)} ${I18n.t(
								'of',
								{ locale: this.props.setting.lang }
							)} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${formatNumberNew2(
								this.props.data.limit_price,
								3
							)} ${I18n.t('toLower', {
								locale: this.props.setting.lang
							})} ${formatNumber(
								this.props.modifyOrder.volume
							)} ${I18n.t('of', {
								locale: this.props.setting.lang
							})} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${formatNumberNew2(
								this.props.modifyOrder.limitPrice,
								3
							)}?`;
						} else {
							this.confirmTextButton = `${I18n.t('modifyUpper', {
								locale: this.props.setting.lang
							})} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(
								this.props.modifyOrder.stopPrice,
								3
							)}`;
							this.confirmTextOrder = `${I18n.t('modify', {
								locale: this.props.setting.lang
							})} ${I18n.t('stoplossUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('order_txt', {
								locale: this.props.setting.lang
							})} ${I18n.t('fromLower', {
								locale: this.props.setting.lang
							})} ${
								tradeType === 'Buy'
									? I18n.t('buyingUpper', {
											locale: this.props.setting.lang
									  })
									: I18n.t('sellingUpper', {
											locale: this.props.setting.lang
									  })
							} ${formatNumber(this.props.data.volume)} ${I18n.t(
								'of',
								{ locale: this.props.setting.lang }
							)} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('price', {
								locale: this.props.setting.lang
							})}, ${I18n.t('trigger', {
								locale: this.props.setting.lang
							})} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${formatNumberNew2(
								this.props.data.stop_price,
								3
							)} ${I18n.t('toLower', {
								locale: this.props.setting.lang
							})} ${formatNumber(
								this.props.modifyOrder.volume
							)} ${I18n.t('of', {
								locale: this.props.setting.lang
							})} ${displayName} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${I18n.t('marketUpper', {
								locale: this.props.setting.lang
							})} ${I18n.t('price', {
								locale: this.props.setting.lang
							})}, ${I18n.t('trigger', {
								locale: this.props.setting.lang
							})} ${I18n.t('at', {
								locale: this.props.setting.lang
							})} ${formatNumberNew2(
								this.props.modifyOrder.stopPrice,
								3
							)}?`;
							this.note = `${changeText} @ STP ${formatNumberNew2(
								this.props.modifyOrder.stopPrice,
								3
							)}`;
						}
					} else {
						this.isChange = false;
					}
					break;
				case orderType.TRAILINGSTOPLIMIT:
				case orderTypeString.TRAILINGSTOPLIMIT:
					let trailingValue =
						this.props.data.triggerType === 'Percent'
							? `${this.props.data.trailingPercent}%`
							: `${this.props.data.trailingAmount} ${I18n.t(
									'cent',
									{ locale: this.props.setting.lang }
							  )}`;
					let trailingNewValue =
						this.props.modifyOrder.triggerType === 'Percent'
							? `${this.props.modifyOrder.trailingPercent}%`
							: `${
									this.props.modifyOrder.trailingAmount
							  } ${I18n.t('cent', {
									locale: this.props.setting.lang
							  })}`;
					if (
						changeValue !== 0 ||
						parseFloat(this.props.modifyOrder.stopPrice) !==
							parseFloat(this.props.data.stop_price)
					) {
						this.isChange = true;
						this.confirmTextButton = `${I18n.t('modifyUpper', {
							locale: this.props.setting.lang
						})} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}`;
						// TODO: check trailing stop price
						this.confirmTextOrder = `${I18n.t('modify', {
							locale: this.props.setting.lang
						})} ${I18n.t('trailingStopLimitUpper', {
							locale: this.props.setting.lang
						})} ${I18n.t('order_txt', {
							locale: this.props.setting.lang
						})} ${I18n.t('fromLower', {
							locale: this.props.setting.lang
						})} ${
							tradeType === 'Buy'
								? I18n.t('buyingUpper', {
										locale: this.props.setting.lang
								  })
								: I18n.t('sellingUpper', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(this.props.data.volume)} ${I18n.t(
							'of',
							{ locale: this.props.setting.lang }
						)} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.data.limit_price,
							3
						)}, ${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.data.stop_price,
							3
						)}, ${I18n.t('and', {
							locale: this.props.setting.lang
						})} ${I18n.t('trailing', {
							locale: this.props.setting.lang
						})} ${this.props.data.triggerType} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${trailingValue} ${I18n.t('toLower', {
							locale: this.props.setting.lang
						})} ${
							tradeType === 'Buy'
								? I18n.t('buying', {
										locale: this.props.setting.lang
								  })
								: I18n.t('selling', {
										locale: this.props.setting.lang
								  })
						} ${formatNumber(
							this.props.modifyOrder.volume
						)} ${I18n.t('of', {
							locale: this.props.setting.lang
						})} ${displayName} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.limitPrice,
							3
						)} ${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${I18n.t('at', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}, ${I18n.t('and', {
							locale: this.props.setting.lang
						})} ${I18n.t('trailing', {
							locale: this.props.setting.lang
						})} ${this.props.modifyOrder.triggerType} ${I18n.t(
							'at',
							{ locale: this.props.setting.lang }
						)} ${trailingNewValue} ?`;
						this.note = `${changeText} @ LMT ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}, ${I18n.t('trigger', {
							locale: this.props.setting.lang
						})} ${formatNumberNew2(
							this.props.modifyOrder.stopPrice,
							3
						)}, ${
							this.props.data.trail_amount
								? I18n.t('trailingAmount', {
										locale: this.props.setting.lang
								  })
								: I18n.t('trailingPercent', {
										locale: this.props.setting.lang
								  })
						} ${
							this.props.data.trail_amount
								? this.props.data.trail_amount
								: formatNumberNew2(
										this.props.data.trail_percent,
										2
								  )
						}`;
					} else {
						this.isChange = false;
					}
					break;
			}
		} catch (error) {
			logAndReport(
				'renderOrderContent modifyOrder exception',
				error,
				'renderOrderContent modifyOrder'
			);
			logDevice(
				'info',
				`NewOrder - renderOrderContent ${type}: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	calculatorOrderValue() {
		const tradeType = this.props.data.is_buy ? 'buy' : 'sell';
		switch (this.props.data.order_type) {
			case orderTypeString.LIMIT:
			case orderType.LIMIT:
				return new Big(this.props.modifyOrder.limitPrice);
			case orderTypeString.STOP_MARKET:
			case orderType.STOP:
			case orderTypeString.STOP_LIMIT:
			case orderType.STOP_LIMIT:
				return new Big(this.props.modifyOrder.stopPrice);
			default:
				let price = null;
				if (
					this.props.data.condition_name ===
					filterConditionName.stopLoss
				) {
					if (!this.props.modifyOrder.stopPrice) {
						price = new Big('0');
					} else {
						price = new Big(this.props.modifyOrder.stopPrice);
					}
				} else if (tradeType === tradeTypeString.SELL) {
					if (
						!this.state.ask_price ||
						this.state.ask_price === undefined
					) {
						price = new Big('0');
					} else {
						price = new Big(this.state.ask_price);
					}
				} else if (
					!this.state.bid_price ||
					this.state.bid_price === undefined
				) {
					price = new Big('0');
				} else {
					price = new Big(this.state.bid_price);
				}
				return price;
		}
	}

	renderFooter() {
		// let price = this.calculatorOrderValue();
		// let orderValue = price.times(this.props.modifyOrder.volume).toString();
		return (
			<View
				style={[
					styles.rowFooter,
					{ bottom: this.state.isShowKeyboard ? -295 : 0 }
				]}
			>
				{this.state.isDefault ? null : (
					<View style={styles.pagination}>
						{func.getUserPriceSource() === userType.Delay ? null : (
							<View
								style={
									this.state.activeDot === 0
										? styles.activeDot
										: styles.dot
								}
							/>
						)}
						<View
							style={
								this.state.activeDot === 1
									? styles.activeDot
									: styles.dot
							}
						/>
						<View
							style={
								this.state.activeDot === 2
									? styles.activeDot
									: styles.dot
							}
						/>
						<View
							style={
								this.state.activeDot === 3
									? styles.activeDot
									: styles.dot
							}
						/>
						<View
							style={
								this.state.activeDot === 4
									? styles.activeDot
									: styles.dot
							}
						/>
						<View
							style={
								this.state.activeDot === 5
									? styles.activeDot
									: styles.dot
							}
						/>
					</View>
				)}
				{/* <View style={{ flexDirection: 'row' }}>
          <View style={styles.columFooter}>
            <Text style={[CommonStyle.textFloatingLabel, { textAlign: 'center', marginBottom: 4 }]}>{I18n.t('cash')}</Text>
            <Text style={CommonStyle.textMain}>{`$${formatNumber(100000)}`}</Text>
          </View>
          <View style={styles.midFooter}>
            <Text style={[CommonStyle.textFloatingLabel, { textAlign: 'center', marginBottom: 4 }]}>{`Est. ${I18n.t('orderValue')}`}</Text>
            <Text style={CommonStyle.textMain}>{`$${formatNumber(orderValue)}`}</Text>
          </View>
          <View style={styles.columFooter}>
            <Text style={[CommonStyle.textFloatingLabel, { textAlign: 'center', marginBottom: 4 }]}>{I18n.t('totalFees')}</Text>
            <Text style={CommonStyle.textMain}>{`$${formatNumber(20)}`}</Text>
          </View>
      </View> */}
			</View>
		);
	}

	renderButtonBuySell() {
		return (
			<View
				style={[
					styles.buttonExpand,
					{
						paddingTop:
							func.getUserPriceSource() !== userType.Streaming
								? -16
								: 16,
						backgroundColor: 'white'
					}
				]}
			>
				<ButtonBox
					buy
					testID="modifyOrderButtonSell"
					disabled={true}
					width={'48%'}
					value1={
						this.props.modifyOrder.isLoading
							? '--'
							: formatNumber(this.state.bid_size)
					}
					value2={
						this.props.modifyOrder.isLoading
							? '--'
							: formatNumberNew2(this.state.bid_price, 3)
					}
				/>
				<View style={{ width: '4%' }}></View>
				<ButtonBox
					testID="modifyOrderButtonBuy"
					disabled={true}
					width={'48%'}
					value1={
						this.props.modifyOrder.isLoading
							? '--'
							: formatNumberNew2(this.state.ask_price, 3)
					}
					value2={
						this.props.modifyOrder.isLoading
							? '--'
							: formatNumber(this.state.ask_size)
					}
				/>
			</View>
		);
	}

	confirmOrder() {
		logDevice('info', 'ModifyOrder - Click To COnfirm Order');
		this.setState({
			visibleAlert: false
		});
		setTimeout(() => {
			try {
				logDevice(
					'info',
					`ModifyOrder - Click To COnfirm Order: ${this.props.app.isConnected}`
				);
				if (this.props.app.isConnected) {
					try {
						const objOrder = {
							broker_order_id: this.props.data.broker_order_id,
							volume: convertFormatToNumber(
								this.props.modifyOrder.volume
							),
							note: this.note
						};
						if (
							this.props.data.order_type ===
								orderTypeString.LIMIT ||
							this.props.data.order_type === orderType.LIMIT
						) {
							objOrder['limit_price'] = convertFormatToNumber(
								this.props.modifyOrder.limitPrice
							);
						}
						if (
							this.props.data.order_type ===
								orderType.STOP_LIMIT ||
							this.props.data.order_type ===
								orderTypeString.STOP_LIMIT
						) {
							objOrder['limit_price'] = convertFormatToNumber(
								this.props.modifyOrder.limitPrice
							);
							objOrder['stop_price'] = convertFormatToNumber(
								this.props.modifyOrder.stopPrice
							);
						}
						if (
							this.props.data.order_type ===
								orderTypeString.STOP_MARKET ||
							this.props.data.order_type === orderType.STOP ||
							this.props.data.order_type ===
								orderType.STOP_LIMIT ||
							this.props.data.order_type ===
								orderTypeString.STOP_LIMIT
						) {
							objOrder['stop_price'] = convertFormatToNumber(
								this.props.modifyOrder.stopPrice
							);
							objOrder['limit_price'] = convertFormatToNumber(
								this.props.modifyOrder.limitPrice
							);
						}
						logDevice(
							'info',
							`ModifyOrder - Object objOrder: ${
								objOrder ? JSON.stringify(objOrder) : ''
							}`
						);
						this.sendOrderRequest(objOrder);
					} catch (error) {
						logAndReport(
							'confirmOrder modifyOrder exception',
							error,
							'confirmOrder modifyOrder'
						);
					}
				} else {
					Alert.alert(
						'',
						I18n.t('pleaseCheckConnection', {
							locale: this.props.setting.lang
						}),
						[
							{
								text: I18n.t('ok', {
									locale: this.props.setting.lang
								})
							}
						],
						{ cancelable: false }
					);
				}
			} catch (error) {
				logAndReport(
					'confirmOrder modifyOrder exception',
					error,
					'confirmOrder modifyOrder'
				);
			}
		}, 500);
	}

	sendOrderRequest(objOrder) {
		try {
			let objOrderHistory = {};
			objOrderHistory.broker_order_id = objOrder.broker_order_id;
			objOrderHistory.note = objOrder.note;
			objOrderHistory.volume = objOrder.volume;
			objOrderHistory.order_type = this.originOrderType;
			objOrderHistory.duration = this.props.data.duration;
			objOrderHistory.exchange = (
				this.props.data.trading_market + ''
			).replace('[Demo]', '');

			this.saveLastOrderRequest(
				objOrderHistory,
				this.state.isUpdateLastOrder
			);
			const orderModifyUrl = `${api.getUrlPlaceOrder()}/${
				this.props.data.broker_order_id
			}`;
			api.putData(orderModifyUrl, { data: objOrder })
				.then((data) => {
					if (data && data.errorCode !== 'SUCCESS') {
						this.callbackError(data.errorCode);
					} else {
						this.callbackSuccess();
					}
				})
				.catch((error) => {
					this.callbackError(error);
				});
		} catch (error) {
			logDevice(
				'info',
				`Neworder - sendOrderRequest exception - ${error}`
			);
			logAndReport(
				'sendOrderRequest order exception',
				error,
				'sendOrderRequest order'
			);
		}
	}

	callbackError(errorCode) {
		this.setScrollEnabled && this.setScrollEnabled(true);
		this.refs &&
			this.refs.modifyOrderScroll &&
			this.refs.modifyOrderScroll.scrollTo(0);
		this.setState({ excuting: false, isShowError: true }, () => {
			setTimeout(() => {
				this.setState({ isShowError: false });
				this.error = getReason(errorCode);
				this.errorLen = Math.ceil(this.error.length / 45);
				this.setAnimationError();
			}, 500);
		});
	}

	callbackSuccess() {
		this.setState({ excuting: false, orderPlaceSuccess: true });
		setTimeout(() => {
			this.props.navigator.pop({
				animated: true,
				animationType: 'slide-horizontal'
			});
		}, 500);
		setTimeout(() => {
			this.props.actions.resetInitialOrder();
		}, 550);
	}

	cancelOrder() {
		this.setState({
			excuting: false,
			visibleAlert: false
		});
		setTimeout(() => {
			try {
				if (this.props.app.isConnected) {
					try {
						this.props.actions.changeOrderVolume(
							this.props.data.volume
						);
						const type =
							(this.props.data.order_type + '').toUpperCase() ||
							'';
						switch (type) {
							case orderType.LIMIT:
							case orderTypeString.LIMIT:
								this.props.actions.changePrice(
									orderTypeString.LIMIT,
									this.props.data.limit_price
								);
								break;
							case orderType.STOP:
							case orderTypeString.STOP_MARKET:
								this.props.actions.changePrice(
									orderTypeString.STOP_MARKET,
									this.props.data.stop_price
								);
								break;
							case orderType.STOP_LIMIT:
							case orderTypeString.STOP_LIMIT:
								this.props.actions.changePrice(
									orderTypeString.LIMIT,
									this.props.data.limit_price
								);
								this.props.actions.changePrice(
									orderTypeString.STOP_MARKET,
									this.props.data.stop_price
								);
								break;
							default:
								break;
						}
					} catch (error) {
						logAndReport(
							'cancelOrder modifyOrder exception',
							error,
							'cancelOrder modifyOrder'
						);
					}
				} else {
					Alert.alert(
						'',
						I18n.t('pleaseCheckConnection', {
							locale: this.props.setting.lang
						}),
						[
							{
								text: I18n.t('ok', {
									locale: this.props.setting.lang
								})
							}
						],
						{ cancelable: false }
					);
				}
			} catch (error) {
				logAndReport(
					'cancelOrder modifyOrder exception',
					error,
					'cancelOrder modifyOrder'
				);
				logDevice(
					'info',
					`ModifyOrder - cancelOrder: ${
						error ? JSON.stringify(error) : ''
					}`
				);
			}
		}, 100);
	}

	// checkVolume(volume) {
	//   let filledMin = 0;
	//   if (!this.props.data.filled_quantity || this.props.data.filled_quantity === undefined) {
	//     return true;
	//   } else {
	//     filledMin = this.props.data.filled_quantity + 1;
	//     if (parseFloat(volume) < filledMin) {
	//       return false;
	//     }
	//     return true;
	//   }
	// }

	alertTradingHalt() {
		const displayName = this.props.displayName;
		Alert.alert(
			'',
			`${I18n.t('alertTralingHalf', {
				locale: this.props.setting.lang
			})} ${displayName}`,
			[
				{
					text: I18n.t('ok', { locale: this.props.setting.lang }),
					onPress: this.closeHandler
				}
			],
			{ cancelable: false }
		);
	}

	setAnimationError() {
		this.refs &&
			this.refs.modifyOrderScroll &&
			this.refs.modifyOrderScroll.scrollTo(0);
		this.timeoutError && clearTimeout(this.timeoutError);
		Animated.timing(this.state.heightError, {
			duration: 500,
			toValue: 20 * this.errorLen
		}).start();
		this.refs &&
			this.refs.textError &&
			this.refs.textError.fadeInDownBig(1000);
		this.timeoutError = setTimeout(() => {
			Animated.timing(this.state.heightError, {
				duration: 500,
				toValue: 0
			}).start();
			this.error = '';
			this.refs &&
				this.refs.textError &&
				this.refs.textError.fadeOutUpBig(1000);
		}, 5000);
	}

	checkOrderValue(fees, isShowError) {
		// return;
		// if (this.volume > 0 && data.is_buy) {
		//   let price = this.calculatorOrderValue();
		//   let orderValue = price.times(this.volume).toString();
		//   // let orderValue = price.times(this.props.modifyOrder.volume).toString();
		//   let totalValue = parseFloat(orderValue) + parseFloat(fees);
		//   if (totalValue > this.state.cashAvailable) {
		//     this.error = I18n.t('orderValueLessCashAvailable');
		//     this.setState({
		//       orderValueError: I18n.t('orderValueLessCashAvailable')
		//     }, () => {
		//       isShowError && this.setAnimationError();
		//     });
		//   }
		// }
	}

	checkError(
		volume,
		limitPrice,
		stopPrice,
		trailingAmount,
		trailingPercent,
		trailingStopPrice,
		ordertype
	) {
		try {
			let objErr = {
				trailingStopPriceError: '',
				trailingErrorText: '',
				limitPriceErrorText: '',
				stopPriceErrorText: '',
				orderValueError: '',
				volumeErrorText: ''
			};
			let isError = false;
			const filledMin = !this.props.data.filled_quantity
				? 0
				: parseInt(this.props.data.filled_quantity) + 1;
			if (parseFloat(volume) === 0) {
				this.error = I18n.t('volumeRequired', {
					locale: this.props.setting.lang
				});
				objErr['volumeErrorText'] = I18n.t('volumeRequired', {
					locale: this.props.setting.lang
				});
				this.setState(objErr);
				isError = true;
			} else if (parseFloat(volume) < filledMin) {
				this.error = I18n.t('amendedVolumeWithPartialFill', {
					locale: this.props.setting.lang
				});
				objErr['volumeErrorText'] = I18n.t(
					'amendedVolumeWithPartialFill',
					{ locale: this.props.setting.lang }
				);
				this.setState(objErr);
				isError = true;
			} else {
				ordertype = ordertype ? (ordertype + '').toUpperCase() : '';
				switch (ordertype) {
					case orderTypeString.TRAILINGSTOPLIMIT:
					case orderType.TRAILINGSTOPLIMIT:
						if (
							this.props.data.triggerType === triggerType.PERCENT
						) {
							if (parseFloat(trailingPercent) === 0) {
								this.error = I18n.t('trailingPercentRequired', {
									locale: this.props.setting.lang
								});
								objErr['trailingErrorText'] = I18n.t(
									'trailingPercentRequired',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								isError = true;
								break;
							}
						} else if (parseFloat(trailingAmount) === 0) {
							this.error = I18n.t('trailingAmountRequired', {
								locale: this.props.setting.lang
							});
							objErr['trailingErrorText'] = I18n.t(
								'trailingAmountRequired',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							isError = true;
							break;
						}
						if (parseFloat(trailingStopPrice) <= 0) {
							this.error = I18n.t('trailingStopPriceRequired', {
								locale: this.props.setting.lang
							});
							objErr['trailingStopPriceError'] = I18n.t(
								'trailingStopPriceRequired',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							isError = true;
							break;
						} else if (this.props.data.is_buy) {
							if (
								parseFloat(limitPrice) >
								parseFloat(trailingStopPrice)
							) {
								isError = true;
								this.error = I18n.t(
									'limitPriceLessTrailingStopPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['limitPriceErrorText'] = I18n.t(
									'limitPriceLessTrailingStopPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
							if (
								parseFloat(trailingStopPrice) >
								parseFloat(this.state.bid_price)
							) {
								isError = true;
								this.error = I18n.t(
									'trailingStopPriceGreaterBidPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['trailingStopPriceError'] = I18n.t(
									'trailingStopPriceGreaterBidPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
						} else {
							if (
								parseFloat(limitPrice) >
								parseFloat(trailingStopPrice)
							) {
								isError = true;
								this.error = I18n.t(
									'limitPriceGreaterTrailingStopPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['limitPriceErrorText'] = I18n.t(
									'limitPriceGreaterTrailingStopPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
							if (
								parseFloat(trailingStopPrice) >
								parseFloat(this.state.ask_price)
							) {
								isError = true;
								this.error = I18n.t(
									'trailingStopPriceGreaterAskPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['trailingStopPriceError'] = I18n.t(
									'trailingStopPriceGreaterAskPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
						}
						break;
					case orderTypeString.STOPLOSS:
					case orderType.STOPLOSS:
						if (parseFloat(stopPrice) === 0) {
							isError = true;
							this.error = I18n.t('stopPriceValid', {
								locale: this.props.setting.lang
							});
							objErr['stopPriceErrorText'] = I18n.t(
								'stopPriceValid',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						if (this.props.data.is_buy) {
							if (
								parseFloat(stopPrice) >
								parseFloat(this.state.ask_price)
							) {
								isError = true;
								this.error = I18n.t(
									'stopPriceGreaterAskPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['stopPriceErrorText'] = I18n.t(
									'stopPriceGreaterAskPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
						} else if (
							parseFloat(stopPrice) >
							parseFloat(this.state.bid_price)
						) {
							isError = true;
							this.error = I18n.t('stopPriceGreaterBidPrice', {
								locale: this.props.setting.lang
							});
							objErr['stopPriceErrorText'] = I18n.t(
								'stopPriceGreaterBidPrice',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						break;
					case orderTypeString.STOP_MARKET:
					case orderType.STOP:
						if (parseFloat(stopPrice) === 0) {
							isError = true;
							this.error = I18n.t('stopPriceValid', {
								locale: this.props.setting.lang
							});
							objErr['stopPriceErrorText'] = I18n.t(
								'stopPriceValid',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						if (this.props.data.is_buy) {
							if (
								parseFloat(stopPrice) <
								parseFloat(this.state.ask_price)
							) {
								isError = true;
								this.error = I18n.t('stopPriceLessAskPrice', {
									locale: this.props.setting.lang
								});
								objErr['stopPriceErrorText'] = I18n.t(
									'stopPriceLessAskPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
						} else if (
							parseFloat(stopPrice) >
							parseFloat(this.state.bid_price)
						) {
							isError = true;
							this.error = I18n.t('stopPriceGreaterBidPrice', {
								locale: this.props.setting.lang
							});
							objErr['stopPriceErrorText'] = I18n.t(
								'stopPriceGreaterBidPrice',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						break;
					case orderTypeString.LIMIT:
					case orderType.LIMIT:
						if (parseFloat(limitPrice) === 0) {
							isError = true;
							this.error = I18n.t('limitPriceValid', {
								locale: this.props.setting.lang
							});
							objErr['limitPriceErrorText'] = I18n.t(
								'limitPriceValid',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						break;
					case orderType.MARKETTOLIMIT:
					case orderTypeString.MARKETTOLIMIT:
						if (
							this.props.data.filled_quantity &&
							parseFloat(limitPrice) === 0
						) {
							isError = true;
							this.error = I18n.t('limitPriceValid', {
								locale: this.props.setting.lang
							});
							objErr['limitPriceErrorText'] = I18n.t(
								'limitPriceValid',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						break;
					case orderTypeString.STOP_LIMIT:
					case orderType.STOP_LIMIT:
						if (parseFloat(stopPrice) === 0) {
							isError = true;
							this.error = I18n.t('stopPriceValid', {
								locale: this.props.setting.lang
							});
							objErr['stopPriceErrorText'] = I18n.t(
								'stopPriceValid',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						if (parseFloat(limitPrice) === 0) {
							isError = true;
							this.error = I18n.t('limitPriceValid', {
								locale: this.props.setting.lang
							});
							objErr['limitPriceErrorText'] = I18n.t(
								'limitPriceValid',
								{ locale: this.props.setting.lang }
							);
							this.setState(objErr);
							break;
						}
						if (this.props.data.is_buy) {
							if (
								parseFloat(stopPrice) >
								parseFloat(this.state.ask_price)
							) {
								isError = true;
								this.error = I18n.t(
									'stopPriceGreaterAskPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['stopPriceErrorText'] = I18n.t(
									'stopPriceGreaterAskPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
							if (
								parseFloat(limitPrice) < parseFloat(stopPrice)
							) {
								isError = true;
								this.error = I18n.t(
									'stopPriceGreaterLimitPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['limitPriceErrorText'] = I18n.t(
									'stopPriceGreaterLimitPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
						} else {
							if (
								parseFloat(stopPrice) >
								parseFloat(this.state.bid_price)
							) {
								isError = true;
								this.error = I18n.t(
									'stopPriceGreaterBidPrice',
									{ locale: this.props.setting.lang }
								);
								objErr['stopPriceErrorText'] = I18n.t(
									'stopPriceGreaterBidPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
							if (
								parseFloat(limitPrice) > parseFloat(stopPrice)
							) {
								isError = true;
								this.error = I18n.t('stopPriceLessLimitPrice', {
									locale: this.props.setting.lang
								});
								objErr['limitPriceErrorText'] = I18n.t(
									'stopPriceLessLimitPrice',
									{ locale: this.props.setting.lang }
								);
								this.setState(objErr);
								break;
							}
						}
						break;
				}
			}
			if (isError) {
				this.setState({ totalFees: 0 }, () => {
					this.setAnimationError();
				});
			} else {
				this.error = '';
				this.resetError();
				this.errorLen = 1;
				Animated.timing(this.state.heightError, {
					duration: 0,
					toValue: 0
				}).start();
			}
			logDevice('info', `ModifyOrder - This.error: ${this.error}`);
		} catch (error) {
			logAndReport(
				'onShowConfirmModal modifyOrder exception',
				error,
				'onShowConfirmModal modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - onShowConfirmModal: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	resetError() {
		this.setState({
			trailingStopPriceError: '',
			trailingErrorText: '',
			limitPriceErrorText: '',
			stopPriceErrorText: '',
			orderValueError: '',
			volumeErrorText: ''
		});
	}

	onShowConfirmModal() {
		try {
			logDevice('info', `Modifyorder - onShowConfirmModal`);
			Keyboard.dismiss();
			setTimeout(() => {
				const { modifyOrder } = this.props;
				const orderType = this.getOrderType(this.props.originOrderType);
				this.checkError(
					modifyOrder.volume,
					modifyOrder.limitPrice,
					modifyOrder.stopPrice,
					modifyOrder.trailingAmount,
					modifyOrder.trailingPercent,
					modifyOrder.trailingStopPrice,
					orderType
				);
				if (this.error === '') {
					this.showAlertOrder();
				}
			}, 500);
		} catch (error) {
			logAndReport(
				'onShowConfirmModal modifyOrder exception',
				error,
				'onShowConfirmModal modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - onShowConfirmModal: ${
					error ? JSON.stringify(error) : ''
				}`
			);
		}
	}

	checkNotWarning(volume, limitPrice, stopPrice, type) {
		let error = '';
		// if (this.state.tradingHalt) {
		//   error = `Trading is currently halted on ${this.props.data.symbol}.AU`;
		//   return error;
		// }
		let filledMin = 0;
		if (
			!this.props.data.filled_quantity ||
			this.props.data.filled_quantity === undefined
		) {
			filledMin = 0;
		} else {
			filledMin = this.props.data.filled_quantity + 1;
		}
		if (parseFloat(volume) === 0) {
			error = I18n.t('volumeRequired', {
				locale: this.props.setting.lang
			});
			return error;
		}
		if (parseFloat(volume) < filledMin) {
			error = I18n.t('amendedVolumeWithPartialFill', {
				locale: this.props.setting.lang
			});
			return error;
		}
		if (type !== 'volume') {
			let orderType = this.getOrderType(this.props.data.order_type);
			switch (orderType) {
				case orderTypeString.STOP_MARKET:
					if (parseFloat(stopPrice) === 0) {
						error = I18n.t('stopPriceValid', {
							locale: this.props.setting.lang
						});
						break;
					}
					if (this.props.data.is_buy) {
						if (
							parseFloat(stopPrice) <
							parseFloat(this.state.ask_price)
						) {
							error = I18n.t('stopPriceLessAskPrice', {
								locale: this.props.setting.lang
							});
							break;
						}
					} else if (
						parseFloat(stopPrice) > parseFloat(this.state.bid_price)
					) {
						error = I18n.t('stopPriceGreaterBidPrice', {
							locale: this.props.setting.lang
						});
						break;
					}
					break;
				case orderTypeString.LIMIT:
					if (parseFloat(limitPrice) === 0) {
						error = I18n.t('limitPriceValid', {
							locale: this.props.setting.lang
						});
						break;
					}
					break;
				case orderTypeString.STOP_LIMIT:
					if (parseFloat(stopPrice) === 0) {
						error = I18n.t('stopPriceValid', {
							locale: this.props.setting.lang
						});
						break;
					}
					if (parseFloat(limitPrice) === 0) {
						error = I18n.t('limitPriceValid', {
							locale: this.props.setting.lang
						});
						break;
					}
					if (this.props.data.is_buy) {
						if (
							parseFloat(stopPrice) <
							parseFloat(this.state.ask_price)
						) {
							error = I18n.t('stopPriceLessAskPrice', {
								locale: this.props.setting.lang
							});
							break;
						}
						if (parseFloat(limitPrice) < parseFloat(stopPrice)) {
							error = I18n.t('stopPriceGreaterLimitPrice', {
								locale: this.props.setting.lang
							});
							break;
						}
					} else {
						if (
							parseFloat(stopPrice) >
							parseFloat(this.state.bid_price)
						) {
							error = I18n.t('stopPriceGreaterBidPrice', {
								locale: this.props.setting.lang
							});
							break;
						}
						if (parseFloat(limitPrice) > parseFloat(stopPrice)) {
							error = I18n.t('stopPriceLessLimitPrice', {
								locale: this.props.setting.lang
							});
							break;
						}
					}
					break;
			}
		}
		return error;
	}

	showAlertOrder() {
		this.setState({
			excuting: true,
			visibleAlert: true
		});
	}

	// showAlertOrder() {
	//   Alert.alert(
	//     '',
	//     this.confirmTextOrder,
	//     [
	//       {
	//         text: I18n.t('cancel'),
	//         onPress: this.cancelOrder.bind(this)
	//       },
	//       {
	//         text: I18n.t('confirm'),
	//         onPress: this.confirmOrder.bind(this)
	//       }
	//     ],
	//     { cancelable: false }
	//   )
	// }

	getOrderType(key) {
		try {
			if (!key) return key;
			const newKey = key.replace('_ORDER', '');
			return orderType[newKey];
		} catch (error) {
			logAndReport(
				'getOrderType modifyOrder exception',
				error,
				'getOrderType modifyOrder'
			);
			logDevice(
				'info',
				`ModifyOrder - getOrderType - ${key}: ${
					key ? JSON.stringify(key) : ''
				}`
			);
		}
	}

	getOrderTypeString(type) {
		const value = this.getOrderType(type).replace('_ORDER', '');
		return orderTypeString[value];
	}

	renderAtribute(value, label) {
		return (
			<View
				style={{
					width: '100%',
					marginBottom: 4,
					justifyContent: 'center',
					borderBottomWidth: 1,
					borderColor: '#0000001e'
				}}
			>
				<Text
					style={[
						CommonStyle.textFloatingLabel,
						{ marginBottom: 4 * CommonStyle.fontRatio }
					]}
				>
					{label}
				</Text>
				<View style={styles.pickerContainer}>
					<Text
						numberOfLines={1}
						style={[CommonStyle.textMain, { width: '87.5%' }]}
					>
						{value}
					</Text>
				</View>
			</View>
		);
	}

	renderError() {
		return (
			<Animatable.View
				ref="textError"
				testID="orderError"
				style={{
					width: width,
					backgroundColor: '#DF0000',
					height: this.state.heightError,
					justifyContent: 'center',
					alignItems: 'center',
					paddingHorizontal: 16
				}}
			>
				<Text style={CommonStyle.textSubLightWhite}>{this.error}</Text>
			</Animatable.View>
		);
	}

	setScroll(scroll) {
		this.setState({ scrollAble: scroll });
	}

	setActiveDot(index) {
		this.setState({ activeDot: index });
	}

	onTextLayout(e) {
		if (e && e.nativeEvent && e.nativeEvent.layout) {
			this.setState({ heightButton: e.nativeEvent.layout.height });
		}
	}

	checkRenderOrder(data) {
		const type = (data.order_type + '').toUpperCase() || '';
		if (type === orderType.MARKETTOLIMIT) {
			if (this.props.originOrderType === orderType.STOPLOSS) {
				if (this.props.data.filled_quantity) {
					return this.renderLimitPriceRight();
				}
				return this.renderStopPrice();
			}
			return (
				<View style={{ width: '50%', paddingLeft: 8 }}>
					<PickerCustom
						testID="volumeModify"
						name="Volume"
						editable={true}
						errorText={this.state.volumeErrorText}
						onChangeText={this.onChangeText.bind(this, 'volume')}
						floatingLabel={I18n.t('volume', {
							locale: this.props.setting.lang
						})}
						selectedValue={this.props.modifyOrder.volume}
						onValueChange={this.changeVolume.bind(this)}
						data={this.listVolume}
					/>
				</View>
			);
		} else if (type === orderType.TRAILINGSTOPLIMIT) {
			return this.renderTrailingStopPrice();
		} else {
			return this.renderLimitPriceRight();
		}
	}

	async loadLastOrderRequest(code) {
		try {
			let key = `order_history_${dataStorage.accountId}_${code}`;
			const lastOrder = await new Promise((resolve) => {
				AsyncStorage.getItem(key)
					.then((res) => resolve(res))
					.catch((err) => {
						console.log('loadLastOrderRequest error', err);
						resolve();
					});
			});
			if (lastOrder) {
				this.setState({ isUpdateLastOrder: true }, () => {
					this.isCallOrderHistory = false;
				});
			} else {
				this.setState({ isUpdateLastOrder: false }, () => {
					this.isCallOrderHistory = false;
				});
			}
		} catch (error) {
			logAndReport(`Order - loadLastOrderRequest Error: ${error}`);
			logDevice('info', `Order - loadLastOrderRequest Error: ${error}`);
		}
	}

	async saveLastOrderRequest(objOrder, isUpdateLastOrder) {
		try {
			let objOrderString = JSON.stringify(objOrder);
			let key = `order_history_${dataStorage.accountId}_${this.props.data.code}`;
			if (isUpdateLastOrder) {
				await AsyncStorage.mergeItem(key, objOrderString, (error) => {
					if (error) {
						console.log(
							`New Order AsyncStorage.mergeItem Error: ${error}`
						);
					} else {
						// dataStorage.listAutoFill.push(key);
					}
				});
			} else {
				await AsyncStorage.setItem(key, objOrderString, (error) => {
					if (error) {
						console.log(
							`New Order AsyncStorage.setItem Error: ${error}`
						);
					} else {
						// dataStorage.listAutoFill.push(key);
					}
				});
			}
		} catch (error) {
			logAndReport(`Order - saveLastOrderRequest Error: ${error}`);
			logDevice('info', `Order - saveLastOrderRequest Error: ${error}`);
		}
	}

	render() {
		const loading = (
			<View
				style={{
					backgroundColor: 'transparent',
					justifyContent: 'center',
					height: 40,
					alignItems: 'center'
				}}
			>
				<ProgressBarLight />
				<Text
					style={[
						CommonStyle.textMainNoColor,
						{ color: '#FFF', textAlign: 'center' }
					]}
				>
					{I18n.t('amendingOrder', {
						locale: this.props.setting.lang
					})}
				</Text>
			</View>
		);
		const success = (
			<View
				style={{
					backgroundColor: 'transparent',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<Ionicons name="md-checkmark-circle" color="#FFF" size={30} />
				<Text
					style={[
						CommonStyle.textMainNoColor,
						{ color: '#FFF', textAlign: 'center' }
					]}
				>
					{I18n.t('success', { locale: this.props.setting.lang })}
				</Text>
			</View>
		);
		const error = (
			<View
				style={{
					backgroundColor: 'transparent',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<Ionicons name="md-close-circle" color="#FFF" size={30} />
				<Text
					style={[
						CommonStyle.textMainNoColor,
						{ color: '#FFF', textAlign: 'center' }
					]}
				>
					{I18n.t('error', { locale: this.props.setting.lang })}
				</Text>
			</View>
		);
		const { data } = this.props;
		let price = this.calculatorOrderValue();
		let orderValue = price.times(this.props.modifyOrder.volume).toString();
		let filledValue = 0;
		if (
			!this.props.data.filled_quantity ||
			this.props.data.filled_quantity === undefined
		) {
			filledValue = `${0}`;
		} else {
			filledValue = `${this.props.data.filled_quantity} @ ${this.props.data.avg_price}`;
		}
		const triggerOrderType = this.props.data.order_type
			? orderTypeString[this.props.data.order_type.replace('_ORDER', '')]
			: '';
		const originOrderType =
			orderTypeString[
				(this.props.originOrderType &&
					this.props.originOrderType.replace('_ORDER', '')) ||
					(data.order_type && data.order_type.replace('_ORDER', ''))
			];
		this.originOrderType = this.props.originOrderType;
		return (
			<View
				testID="modifyOrderScreen"
				style={{
					flex: 1,
					alignItems: 'center',
					marginTop: dataStorage.platform === 'ios' ? 0 : 55,
					backgroundColor: 'white'
				}}
			>
				{!this.state.visibleAlert && this.state.excuting
					? loading
					: null}
				{this.props.app.isConnected ? null : <NetworkWarning />}
				<View
					style={{
						width: '100%',
						height: height,
						position: 'absolute'
					}}
				>
					<ScrollView
						showsVerticalScrollIndicator={false}
						ref="modifyOrderScroll"
						scrollEnabled={
							Platform.OS === 'ios' ? true : this.state.scrollAble
						}
						keyboardShouldPersistTaps={'handled'}
					>
						{this.renderError()}
						{/* {func.getUserPriceSource() !== userType.Streaming || this.state.tradingHalt ? <Warning warningText={this.getWarnText()} isConnected={this.props.app.isConnected} /> : null} */}
						{!Controller.isPriceStreaming() ? (
							<TimeUpdated
								isShow={true}
								isLoading={this.props.modifyOrder.isLoading}
								timeUpdate={this.state.timeUpdate}
							/>
						) : null}
						{this.renderButtonBuySell()}
						{this.renderLastTrade()}
						<View style={styles.rowPickerContainer}>
							<View style={{ width: '50%', paddingRight: 8 }}>
								{this.renderAtribute(
									triggerOrderType,
									I18n.t('orderType', {
										locale: this.props.setting.lang
									})
								)}
							</View>
							<View style={{ width: '50%', paddingLeft: 8 }}>
								{this.renderAtribute(
									this.props.data.condition_name
										? orderConditionString[
												this.props.data.condition_name
										  ]
										: '--',
									I18n.t('condition', {
										locale: this.props.setting.lang
									})
								)}
							</View>
						</View>
						{this.renderOrderContent(
							(originOrderType + '').toUpperCase()
						)}
						{this.state.isDefault ? null : (
							<View
								style={{
									borderBottomWidth: 1,
									borderColor: '#0000001e',
									paddingVertical: 4,
									marginHorizontal: 16
								}}
							>
								<Text
									style={[
										CommonStyle.textFloatingLabel,
										{ marginBottom: 4 }
									]}
								>
									{I18n.t('Description', {
										locale: this.props.setting.lang
									})}
								</Text>
								{this.renderDescription(originOrderType)}
								<TouchableOpacity
									onPress={() =>
										this.toggleShowMoreDescription()
									}
								>
									<Text
										style={[
											CommonStyle.textMain,
											{ color: '#10a8b2' }
										]}
									>
										{this.state.isShowMore
											? 'Show less'
											: 'Show more'}
									</Text>
								</TouchableOpacity>
							</View>
						)}
						<TouchableOpacity
							disabled={
								!this.isChange ||
								!this.props.app.isConnected ||
								this.state.excuting
							}
							onPress={this.onShowConfirmModal.bind(this)}
							style={[
								styles.buttonSellBuy,
								{
									backgroundColor: this.props.data.is_buy
										? !this.isChange ||
										  !this.props.app.isConnected
											? CommonStyle.upColor
											: '#00b800'
										: !this.isChange ||
										  !this.props.app.isConnected
										? 'rgba(223, 0, 0, 0.24)'
										: '#df0000',
									marginLeft: 16
								}
							]}
						>
							{!this.state.visibleAlert && this.state.excuting ? (
								loading
							) : this.state.isShowError ? (
								error
							) : this.state.orderPlaceSuccess ? (
								success
							) : (
								<View
									onLayout={this.onTextLayout}
									style={{
										width: '100%',
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Text
										style={[
											CommonStyle.textButtonColor,
											{
												textAlign: 'center',
												fontSize: CommonStyle.font13
											}
										]}
									>
										{this.confirmTextButton}
									</Text>
									<Text
										style={[
											CommonStyle.textButtonColorS,
											{
												textAlign: 'center',
												fontSize: CommonStyle.fontSizeXS
											}
										]}
									>{`${I18n.t('cashAvailableIs', {
										locale: this.props.setting.lang
									})} $${formatNumberNew2(
										this.state.cashAvailable,
										2
									)}/ ${I18n.t('orderValueIs', {
										locale: this.props.setting.lang
									})} $${formatNumberNew2(
										orderValue,
										2
									)}/ ${I18n.t('estimatedFeesAre', {
										locale: this.props.setting.lang
									})} $${formatNumberNew2(
										this.state.totalFees,
										2
									)}`}</Text>
								</View>
							)}
						</TouchableOpacity>
						<MarketDepth
							isEnabledScroll={this.state.scrollAble}
							testID={`modifyOrderMarketDepth`}
							isOrder={false}
							marketOrder={this.orderTypeMarket}
							heightButton={this.state.heightButton}
							login={this.props.login}
							code={this.props.data.symbol}
							isLoading={this.props.modifyOrder.isLoading}
							setActiveDot={this.setActiveDot.bind(this)}
							navigator={this.nav}
						/>
					</ScrollView>
				</View>
				{this.renderFooter()}
				{AlertOrder({
					title: this.confirmTextOrder,
					closeAlert: this.cancelOrder.bind(this),
					visibleAlert: this.state.visibleAlert,
					confirmOrder: this.confirmOrder.bind(this)
				})}
			</View>
		);
	}
}

export function mapStateToProps(state, ownProps) {
	return {
		modifyOrder: state.modifyOrder,
		setting: state.setting,
		login: state.login,
		app: state.app
	};
}

export function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(modifyOrderActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyOrder);
