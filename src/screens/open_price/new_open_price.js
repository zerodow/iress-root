import React, { PropTypes, Component } from 'react';
import {
	Text,
	TouchableOpacity,
	View,
	PixelRatio,
	Platform,
	Keyboard,
	InteractionManager
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import ProgressBar from '../../modules/_global/ProgressBar';
import HighLightText from '../../modules/_global/HighLightText';
import {
	roundFloat,
	formatNumber,
	formatNumberNew2,
	formatNumberNew,
	logAndReport,
	checkPropsStateShouldUpdate,
	formatNumberNew2ClearZero,
	removeItemFromLocalStorage,
	offTouchIDSetting,
	largeValue,
	logDevice,
	pinComplete,
	getDisplayName,
	renderTime, forgotPinWithAccessToken, setNewPinToken
} from '../../lib/base/functionUtil';
import ButtonBox from '../../modules/_global/ButtonBox';
import { func, dataStorage } from '../../storage';
import moment from 'moment';
import userType from '../../constants/user_type';
import { getDateStringWithFormat } from '../../lib/base/dateTime';
import timeagoInstance from '../../lib/base/time_ago';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Auth from '../../lib/base/auth';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import * as portfolioActions from '~s/portfolio/Redux/actions'
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import { VibrancyView, BlurView } from 'react-native-blur';
import Pin from '../../component/pin/pin'
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin'
import TouchAlert from '../setting/auth_setting/TouchAlert'
import { Navigation } from 'react-native-navigation'
import { getSymbolInfo } from '../../app.actions';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter'
import * as Business from '../../business';
import * as Channel from '../../streaming/channel';
import * as StreamingBusiness from '../../streaming/streaming_business'
import Flag from '../../component/flags/flag';
import * as util from '../../util';
import Flashing from '../../component/flashing/flashing'
import XComponent from '../../component/xComponent/xComponent'
import Enum from '../../enum'
import * as Controller from '../../memory/controller'
import * as RoleUser from '../../roleUser'
import { showNewOrderModal } from '~/navigation/controller.1'

const styles = {}
const PTC_CHANNEL = Enum.PTC_CHANNEL;
const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;
const DECIMAL_BOOK_VALUE = 3;
const DECIMAL_BOOK_VALUE_AUD = 3;
const DECIMAL_VALUE_AUD = 3;
const DECIMAL_GAIN_LOSS = 3;
const DECIMAL_TODAY_CHANGE = 3
const DECIMAL_AVG_PRICE = 4;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

loginActions['getSymbolInfo'] = getSymbolInfo;

export class OrderTransaction extends Component {
	constructor(props) {
		super(props);
		this.userId = func.getUserId();
		this.state = {
			data: this.props.data || {}
			// volume: 0,
			// is_buy: false,
			// price: 0,
			// trade_date: new Date().getTime()
		};
		this.perf = null;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps) {
			this.isMount && this.setState({ data: nextProps.data });
		}
	}

	// componentWillMount() {
	//   try {
	//     this.perf = new Perf(performanceEnum.get_order_transaction_portfolio);
	//     this.perf && this.perf.start();
	//     const orderDetail = firebase.database().ref(`order_transaction/${dataStorage.accountId}/${this.code}/${this.props.data.order_id}/${this.props.data.transaction_id}`);
	//     orderDetail.on('value', function (params) {
	//       this.perf && this.perf.stop();
	//       const itemTemp = params.val();
	//       this.setState({
	//         volume: itemTemp ? itemTemp.volume : 0,
	//         is_buy: itemTemp ? itemTemp.is_buy : true,
	//         price: itemTemp ? formatNumberNew2(itemTemp.price, 3) : 0,
	//         trade_date: itemTemp ? itemTemp.trade_date : new Date().getTime()
	//       })
	//     }.bind(this));
	//   } catch (error) {
	//     logAndReport('componentWillMount openPrice OrderTransaction exception', error, 'componentWillMount OrderTransaction');
	//     logDevice('info', `componentWillMount openPrice OrderTransaction exception ${error}`);
	//   }
	// }

	// shouldComponentUpdate(nextProps, nextState) {
	//   const listProps = [{ data: ['order_id', 'transaction_id'] }];
	//   const listState = ['is_buy', 'price', 'volume', 'trade_date'];
	//   let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
	//   return check;
	// }

	render() {
		const { data } = this.state;
		if (data.volume === 0 && data.price === 0) {
			return (<View></View>)
		}
		return (
			<View style={[styles.rowExpand, this.props.style]}>
				<View style={{ paddingRight: 8, width: '50%', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
					<Ionicons name={data.is_buy === '1' ? 'ios-arrow-up' : 'ios-arrow-down'} style={{
						color: data.is_buy === '1' ? '#00b800' : '#df0000',
						width: 24,
						height: 24,
						textAlign: 'center',
						top: 2,
						marginRight: 8
					}} size={24} />
					<Text testID={`volumePrice-${this.props.testID}`} style={[CommonStyle.textSubNormalBlack]}>{`${formatNumber(data.volume)} @ ${formatNumberNew2(data.price, PRICE_DECIMAL.PRICE)}`}</Text>
				</View>
				<View style={{ paddingLeft: 8, width: '50%' }}>
					<Text testID={`tradeDate-${this.props.testID}`} numberOfLines={1} style={[CommonStyle.textSub, {
						textAlign: 'right',
						width: '100%'
					}]}>{renderTime(data.updated)}</Text>
				</View>
			</View>
		);
	}
}

class OpenPrice extends XComponent {
	constructor(props) {
		super(props);
		this.changedIndex = this.changedIndex.bind(this);
		this.listDisplayExchange = [];
		this.isMount = false;
		this.authFunction = this.authFunction.bind(this);
		this.showOpenPosition = this.showOpenPosition.bind(this);
		this.renderChange = this.renderChange.bind(this)
		this.updatePosition = this.updatePosition.bind(this)
		this.updateData = this.updateData.bind(this)
		this.isBuy = '';
		this.isPress = true
		this.code = this.props.data && this.props.data.symbol ? this.props.data.symbol : '';
		const symbolObj = dataStorage.symbolEquity[this.code] || {}
		this.state = {
			isLoading: this.props.isLoading || false,
			tradingHalt: symbolObj.trading_halt === 1,
			displayName: '',
			disabled: false,
			listOrder: [],
			isExpand: this.props.isUniversalSearch,
			isLoadContent: true,
			data: this.props.data || [],
			isError: '',
			animationLogin: '',
			isPinCodeModalVisible: false,
			isForgotPinModalVisible: false,
			isAndroidTouchIdModalVisible: false,
			params: []
		}
		this.listSymbol = {};
		this.topOt = null;
		this.timeoutId = null;
		this.showFormLogin = this.showFormLogin.bind(this);
		this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
		this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
		this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
		this.showFormLoginSuccessCallback = null;
		this.params = [];
		this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(this);
		this.onForgotPin = this.onForgotPin.bind(this);
		this.getDataHistory = this.getDataHistory.bind(this);
		this._onPinCompleted = this._onPinCompleted.bind(this);
		this.setTimeoutClickable = this.setTimeoutClickable.bind(this);
		this.props.registerChange(this.code, this.changedIndex, this.getDataHistory);
		this.auth = new Auth(this.props.navigator, this.props.login.email, this.props.login.token, this.showFormLogin);
		this.clickedNewOrder = false;
		this.setNewPinSuccessCallback = this.setNewPinSuccessCallback.bind(this)
		this.setNewPinErrorCallback = this.setNewPinErrorCallback.bind(this)
		this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this)
		this.forgotPinCallback = this.forgotPinCallback.bind(this)
	}

	showFormLogin(successCallback, params) {
		if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
			offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
		}
		if (successCallback) this.showFormLoginSuccessCallback = successCallback
		this.params = params || []
		this.authenPin && this.authenPin.showModalAuthenPin();
	}

	authFunction() {
		if (dataStorage.pinSetting !== 0) {
			this.showOpenPosition()
		} else {
			let objAndroidTouchIDFn = null;
			if (Platform.OS === 'android') {
				objAndroidTouchIDFn = {
					showAndroidTouchID: this.showAndroidTouchID,
					hideAndroidTouchID: this.hideAndroidTouchID,
					androidTouchIDFail: this.androidTouchIDFail
				}
			}
			this.auth.authentication(this.showOpenPosition, null, objAndroidTouchIDFn);
		}
	}

	changedIndex(isOpen, preCode) {
		if (preCode && preCode !== this.code) return;
		this.isMount && this.setState({
			isExpand: isOpen
		});
	}

	componentWillUnmount() {
		this.isMount = false;
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.isExpand) {
			this.getDataHistory();
		}

		// this.oldCode = this.code;

		// if (nextProps && nextProps.isLoading !== this.props.isLoading) {
		// 	if (nextProps.isLoading) {
		// 		this.isMount && this.setState({ isLoading: true });
		// 	} else {
		// 		this.code = nextProps.data && nextProps.data.symbol ? nextProps.data.symbol : '';
		// 		this.isMount && this.setState({ isLoading: false, data: nextProps.data || {} });
		// 	}
		// } else {
		if (nextProps && nextProps.data) {
			this.code = nextProps.data && nextProps.data.symbol ? nextProps.data.symbol : '';
			this.props.registerChange(this.code, this.changedIndex);
			this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: nextProps.data.market_price });
			this.isMount && this.setState({ data: nextProps.data || {} });
		}
		// }
		// if (this.code !== this.oldCode) {
		// 	this.isMount && this.setState({
		// 		isExpand: false
		// 	});
		// }
	}

	updateTransaction() {
		fbemit.addListener('transaction', `${this.code}`, data => {
			this.getDataCallback(data);
		})
	}

	updatePosition() {
		const accountID = dataStorage.accountId
		const symbol = this.code
		const eventName = StreamingBusiness.getChannelPortfolioPosition(accountID, symbol)
		Emitter.addListener(eventName, null, newPosition => {
			this.updateData(newPosition)
		})
	}

	updateData(data) {
		this.setState({
			data
		})
	}

	getDisplayName() {
		if (!dataStorage.symbolEquity[this.code]) {
			const urlSymbolInfo = api.getSymbolUrl(false, true);
			const newTxt = util.encodeSymbol(this.code);
			api.requestData(`${urlSymbolInfo}${newTxt}`).then(data => {
				const val = Array.isArray(data) ? data[0] : data;
				console.log(`NEW OPEN PRICE getDisplayName return data: ${val ? JSON.stringify(val) : 'EMPTY'}`);
				logDevice('info', `NEW OPEN PRICE getDisplayName return data: ${val ? JSON.stringify(val) : 'EMPTY'}`);
				this.listSymbol = val || {};
				const displayName = val.display_name || this.code;
				this.isMount && this.setState({ displayName });
			});
		} else {
			this.listSymbol = dataStorage.symbolEquity[this.code] || {};
			const displayName = dataStorage.symbolEquity[this.code].display_name || this.code;
			console.log(`NEW OPEN PRICE getDisplayName exist data: ${displayName}`);
			logDevice('info', `NEW OPEN PRICE getDisplayName exist data: ${displayName}`);
			this.isMount && this.setState({ displayName });
		}
	}

	componentDidMount() {
		this.isMount = true;
		this.updateTransaction();
		this.updatePosition();
		if (this.props.isOpen && Controller.getLoginStatus()) {
			this.loadData(0);
		}
		this.isMount && this.setState({ disabled: dataStorage.isLockedAccount })

		const channelName = Channel.getChannelChangeTradingHalt(this.code)
		Emitter.addListener(channelName, this.id, data => {
			if (this.state.tradingHalt === data) return
			this.setState({
				tradingHalt: data
			})
		})
	}

	getDataCallback(data) {
		const lisTrans = this.state.listOrder;
		lisTrans.unshift(data);
		const listOrder = lisTrans.slice(0, 5);
		this.isMount && this.setState({
			listOrder
		});
	}

	getDataHistory() {
		try {
			logDevice('info', `OpenPrice getDataHistory func`);
			this.perf = new Perf(performanceEnum.get_data_history);
			this.perf && this.perf.start();
			const urlOrderTransaction = api.getUrlTopOrderTransaction(dataStorage.accountId, this.code);
			const now = new Date().getTime()
			return api.requestData(urlOrderTransaction, true).then(val => {
				const time = new Date().getTime()
				console.log(`GET ORDER TRANSACTION ${this.code} TIME: ${(time - now) / 1000} s`)
				logDevice('info', `OpenPrice getDataHistory result: ${val}`);
				let listOrder = val || [];
				listOrder.sort(function (a, b) {
					return b.updated - a.updated;
				});
				this.perf && this.perf.stop();
				listOrder = listOrder.slice(0, 5);
				this.isMount && this.setState({
					listOrder,
					isLoadContent: false
				});
			});
		} catch (error) {
			this.isMount && this.setState({
				listOrder: [],
				isLoadContent: false
			});
			logAndReport('componentDidMount openPrice exception', error, 'componentDidMount openPrice');
			logDevice('info', `componentDidMount openPrice exception: ${error}`)
		}
	}

	showOpenPosition() {
		try {
			if (this.timeoutId && (new Date().getTime() - this.timeoutId) < 300) {
				return;
			}
			this.timeoutId = new Date().getTime();
			const { data } = this.state
			logDevice('info', `OpenPrice showOpenPosition func with type: ${this.isBuy}`)
			let isBuy = '';
			const originalType = this.isBuy;
			if (!Controller.getLoginStatus()) return;
			if (this.isBuy === 'adjust') {
				isBuy = true
			} else if (parseFloat(data.volume) < 0) {
				isBuy = true;
			} else {
				isBuy = false;
			}
			const symbolInfo = this.listSymbol;
			logDevice('info', `OpenPrice showOpenPosition go to New Order width symbolinfo: ${JSON.stringify(symbolInfo)}`)
			const listExchange = symbolInfo ? symbolInfo.exchanges : [];
			const displayExchange = symbolInfo.display_exchange || 'ASX';
			const isParitech = (displayExchange + '').includes('ASX');
			this.isMount && this.setState({ disabled: false })
			const passProps = {
				type: this.isBuy === 'adjust' ? 'adjust' : 'close',
				displayName: this.state.displayName,
				isBuy,
				isParitech,
				tradePrice: 1,
				code: this.code,
				exchanges: listExchange,
				volume: originalType === false
					? Math.abs(data.volume)
					: 0,
				isNotShowMenu: true
			}
			showNewOrderModal({
				navigator: this.props.navigator,
				passProps
			})
		} catch (error) {
			logAndReport('showOpenPosition openPrice exception', error, 'showOpenPosition openPrice');
			logDevice('info', `showOpenPosition openPrice exception ${error}`);
		}
	}

	renderHeader() {
		const { data } = this.state;
		this.isPress = true
		const code = data.symbol;

		const displayNameFromDic = dataStorage.symbolEquity && dataStorage.symbolEquity[code] && dataStorage.symbolEquity[code].display_name ? dataStorage.symbolEquity[code].display_name : code
		const companyNameFromDic = dataStorage.symbolEquity && dataStorage.symbolEquity[code] && (dataStorage.symbolEquity[code].company_name || dataStorage.symbolEquity[code].company || dataStorage.symbolEquity[code].security_name)
		const displayName = data.display_name || displayNameFromDic;
		const companyName = data.company_name || data.company || data.security_name || companyNameFromDic;
		const flagIcon = Business.getFlagByCurrency(data.currency);
		return (
			<View testID={`listUserPosition-${this.code}`} style={styles.headerBorder}>
				<View style={styles.headerContainer}>
					<Text style={[CommonStyle.textMainRed, { flex: this.state.tradingHalt ? 0.6 : 0 }]}>{this.state.tradingHalt ? '!' : ''}</Text>
					<Text testID={`openPriceCode-${this.code}`} style={[{ width: '25%' }, CommonStyle.textMain2]}>{displayName && displayName.length > 8 ? Business.convertDisplayName(displayName) : `${displayName}`}</Text>

					<View style={[{ flex: 1, alignItems: 'flex-end' }]}>
						<Flag
							type={'flat'}
							code={flagIcon}
							size={18}
						/>
					</View>
					<HighLightText
						testID={`positionVolume-${this.code}`}
						style={[styles.col2, CommonStyle.textMainNoColor, { textAlign: 'right', paddingRight: 4 }]}
						base={this.props.isPosition ? formatNumberNew2ClearZero(data.volume) : 0}
						value={this.props.isPosition ? (!data.volume ? 0 : formatNumberNew2ClearZero(data.volume)) : 0} />
					{/* <Text testID={`positionValue-${this.code}`} style={[styles.col3, CommonStyle.textMain2, { textAlign: 'right' }]}>
						{this.props.isLoading
							? '--'
							: data.value
								? formatNumberNew2(data.value, 2)
								: (this.props.isPosition ? '--' : '')}
					</Text> */}
					<View style={[styles.col3]}>
						<Flashing
							value={data.market_price}
							defaultValue={this.props.isPosition ? null : ''}
							parentID={this.id}
							field={PTC_CHANNEL.TRADE_PRICE}
							typeFormRealtime={TYPE_FORM_REALTIME.HOLDING}
						/>
					</View>
					<Text testID={`positionValueAUD-${this.code}`} style={[styles.col4, CommonStyle.textMain2, { textAlign: 'right' }]}>{this.props.isLoading ? '--' : data.value_convert ? formatNumberNew2(data.value_convert, PRICE_DECIMAL.VALUE) : (this.props.isPosition ? '--' : '')}</Text>
				</View>
				<View style={styles.headerContainer}>
					<View style={[{ width: '48%' }]}>
						<Text style={[CommonStyle.textSub]}>{companyName}</Text>
					</View>

					<Text testID={`positionAvgPrice-${this.code}`} style={[styles.col3, CommonStyle.textSub, { textAlign: 'right' }]}>{this.props.isPosition ? (data.average_price === null) ? '--' : formatNumberNew2(data.average_price, PRICE_DECIMAL.PRICE) : ''}</Text>
					{
						util.isAuBySymbol(this.code)
							? <Text style={[styles.col4, CommonStyle.textSub, { textAlign: 'right' }]}></Text>
							: <Text testID={`positionValue-${this.code}`} style={[styles.col4, CommonStyle.textSub, { textAlign: 'right' }]}>
								{this.props.isLoading
									? '--'
									: data.value
										? formatNumberNew2(data.value, PRICE_DECIMAL.VALUE)
										: (this.props.isPosition ? '--' : '')}
							</Text>
					}
					{/* <HighLightText
						testID={`positionUpnl-${this.code}`}
						style={[styles.col4, CommonStyle.textSubNoColor, { textAlign: 'right' }]}
						base={formatNumberNew(profitPercent, 2)}
						value={this.props.isLoading ? null : !this.props.isPosition ? '' : ((this.props.isPosition && !data.average_price) || (this.props.isPosition && !data.market_price)) ? '--' : `${formatNumberNew(profitPercent, 2)}%`} /> */}
				</View>
			</View>
		)
	}

	renderChange(label, value, center = true, isHighLight = true, isShowValue = true) {
		let flexLeft = 5;
		let flexRight = 5;
		if (!center) {
			flexLeft = 6
			flexRight = 4
		}
		return (
			<View style={[{ flexDirection: 'row' }]}>
				<View style={{ flex: flexLeft }}>
					<Text style={[CommonStyle.textSub, { textAlign: 'left' }]}>{label}</Text>
				</View>
				<View style={{ flex: flexRight }}>
					{
						isShowValue
							? this.props.isLoading
								? <Text
									style={[CommonStyle.textMainNoColor, { textAlign: 'right' }]}>
									{'--'}
								</Text>
								: <HighLightText
									style={[CommonStyle.textMainNoColor, { textAlign: 'right', fontSize: CommonStyle.fontSizeS }]}
									base={this.props.isPosition && isHighLight ? value : 0}
									value={this.props.isPosition ? (!value ? 0 : value) : 0} />
							: <View />
					}
				</View>
			</View>
		)
	}

	loadData(changed) {
		logDevice('info', `OpenPrice loadData with value: ${changed}`);
		if (changed === 0) {
			this.isMount && this.setState({ isLoadContent: true })
			dataStorage.isOpenOrderTransaction = this.code;
			this.props.changeIndex(this.code, true);
			InteractionManager.runAfterInteractions(() => {
				this.getDataHistory();
			})
		} else {
			this.props.changeIndex(this.code, false)
		}
	}

	debounce(callback, wait, context = this) {
		let timeout = null;
		let callbackArgs = null;

		const later = () => callback.apply(context, callbackArgs);

		return function () {
			callbackArgs = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	setTimeoutClickable() {
		this.clickedNewOrder = true;
		setTimeout(() => {
			this.clickedNewOrder = false;
		}, 1500);
	}

	renderContent(rowData) {
		const todayChangeVal = rowData.today_upnl
		const todayChangePercent = rowData.today_change_percent
		const profitVal = rowData.upnl
		const profitPercent = rowData.profit_percent
		const bookValue = rowData.book_value
		const bookValueConvert = rowData.book_value_convert
		const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || ''
		const load = (
			<View style={{
				backgroundColor: 'white',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				<ProgressBar />
			</View>);

		if (this.props.isPosition) {
			return (
				<View style={styles.expandContainer}>
					<View style={{
						width: '100%',
						marginTop: 8,
						marginBottom: 16
					}}>
						<View style={{ flexDirection: 'row' }}>
							<View style={[{ paddingRight: 10, width: '50%' }]}>
								{this.renderChange(`${I18n.t('bookVal')} + ' '( ${accountCurrency})'`, formatNumberNew2(bookValueConvert, PRICE_DECIMAL.VALUE_AUD), false, false)}
							</View>

							<View style={[{ paddingLeft: 10, width: '50%' }]}>
								{this.renderChange(`${I18n.t('bookVal')}`, formatNumberNew2(bookValue, PRICE_DECIMAL.VALUE), true, false, !util.isAuBySymbol(this.code))}
							</View>
						</View>

						<View style={{ flexDirection: 'row', marginTop: 8 }}>
							<View style={[{ paddingRight: 10, width: '50%' }]}>
								{this.renderChange(I18n.t('todayChg'), formatNumberNew2(todayChangeVal, PRICE_DECIMAL.PERCENT))}
							</View>

							<View style={[{ paddingLeft: 10, width: '50%' }]}>
								{this.renderChange(`%${I18n.t('todayChg')}`, `${formatNumberNew2(todayChangePercent * 100, PRICE_DECIMAL.PERCENT)}%`, false)}
							</View>
						</View>

						<View style={{ flexDirection: 'row', marginTop: 8 }}>
							<View style={[{ paddingRight: 10, width: '50%' }]}>
								{this.renderChange(I18n.t('gainLoss'), formatNumberNew2(profitVal, PRICE_DECIMAL.VALUE))}
							</View>
							<View style={[{ paddingLeft: 10, width: '50%' }]}>
								{this.renderChange(`%${I18n.t('gainLoss')}`, `${formatNumberNew2(profitPercent * 100, PRICE_DECIMAL.PERCENT)}%`, false)}
							</View>
						</View>
					</View>

					<View style={{
						width: '100%',
						flexDirection: 'row'
					}}>
						<View testID={`portfolioButtonAdjust-${this.code}`} style={[styles.colExpand1, { paddingRight: 10 }]}>
							<TouchableOpacity
								disabled={
									this.state.disabled ||
									!this.props.isConnected ||
									this.props.isLoading ||
									!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_NEW_ORDER_BUTTON_PORTFOLIO) ||
									!func.isAccountActive()
								}
								onPress={this.debounce(() => {
									if (this.clickedNewOrder) return;
									this.setTimeoutClickable();
									this.isBuy = 'adjust';
									this.authFunction()
								}, 100)}
								style={[styles.buttonExpand, {
									backgroundColor: (
										!func.isAccountActive() ||
										!this.props.isConnected ||
										!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_NEW_ORDER_BUTTON_PORTFOLIO)) ? '#0000001e' : config.colorVersion
								}]}>
								<Text
									style={[CommonStyle.textButtonColor, {
										color: (
											!func.isAccountActive() ||
											!this.props.isConnected ||
											!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_NEW_ORDER_BUTTON_PORTFOLIO)) ? 'black' : 'white'
									}]}>{I18n.t('neworderUpper')}</Text>
							</TouchableOpacity>
						</View>
						<View testID={`portfolioButtonClose-${this.code}`} style={[styles.colExpand1, { paddingLeft: 10 }]}>
							<TouchableOpacity
								disabled={
									this.state.disabled ||
									!this.props.isConnected ||
									this.props.isLoading ||
									!func.isAccountActive() ||
									!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_CLOSE_ORDER_BUTTON)}
								onPress={this.debounce(() => {
									if (this.clickedNewOrder) return;
									this.setTimeoutClickable();
									this.isBuy = false;
									this.authFunction()
								}, 100)}
								style={[styles.buttonExpand, {
									backgroundColor: (
										!func.isAccountActive() ||
										!this.props.isConnected ||
										!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_CLOSE_ORDER_BUTTON)) ? '#0000001e' : '#ff1643'
								}]}>
								<Text
									style={[CommonStyle.textButtonColor, {
										color: (
											!func.isAccountActive() ||
											!this.props.isConnected ||
											!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_CLOSE_ORDER_BUTTON)) ? 'black' : 'white'
									}]}>{I18n.t('closeUpper')}</Text>
							</TouchableOpacity>
						</View>
					</View>
					<View style={{ width: '100%' }}>
						{
							this.state.isLoadContent ? load : this.state.listOrder.length > 0 ? this.state.listOrder.map((e, i) =>
								<OrderTransaction code={this.code} data={e} key={e.id} testID={e.id} style={{ borderColor: '#0000001e', borderTopWidth: i === 0 ? 0 : 1 }} />
							) : <View style={{ marginBottom: 16 }} />
						}
					</View>
					<View style={{ marginBottom: 10 }} />
				</View>
			);
		} else {
			return <View />;
		}
	}

	// shouldComponentUpdate(nextProps, nextState) {
	//   const listProps = [{ portfolio: ['isLoading', 'loading', 'listData'] }, { login: ['isLogin'] }, { app: ['isConnected'] }];
	//   const listState = ['warningText'];
	//   let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
	//   return check;
	// }
	// Android
	showAndroidTouchID(params) {
		dataStorage.onAuthenticating = true
		dataStorage.dismissAuthen = this.hideAndroidTouchID
		this.isMount && this.setState({
			isAndroidTouchIdModalVisible: true,
			params
		})
	}

	hideAndroidTouchID() {
		dataStorage.onAuthenticating = false
		this.isMount && this.setState({
			isAndroidTouchIdModalVisible: false
		})
	}

	androidTouchIDFail(callback, numberFingerFailAndroid) {
		this.androidTouchID && this.androidTouchID.authenFail(callback, numberFingerFailAndroid)
	}

	authenPinFail() {
		this.authenPin && this.authenPin.authenFail()
	}

	_onPinCompleted(pincode) {
		const store = Controller.getGlobalState()
		const login = store.login;
		const refreshToken = login.loginObj.refreshToken
		pinComplete(pincode, this.authenPin, this.showFormLoginSuccessCallback, this.authenPinFail.bind(this), this.params, refreshToken)
	}

	onChangeAuthenByFingerPrint() {
		this.authenPin && this.authenPin.hideModalAuthenPin();
		let objAndroidTouchIDFn = null;
		if (Platform.OS === 'android') {
			objAndroidTouchIDFn = {
				showAndroidTouchID: this.showAndroidTouchID,
				hideAndroidTouchID: this.hideAndroidTouchID,
				androidTouchIDFail: this.androidTouchIDFail
			}
		}
		this.auth.authentication(this.showOpenPosition, null, objAndroidTouchIDFn);
	}

	onForgotPin() {
		Keyboard.dismiss();
		this.authenPin && this.authenPin.hideModalAuthenPin();
		setTimeout(() => {
			this.isMount && this.setState({
				isForgotPinModalVisible: true
			})
		}, 500)
	}

	forgotPinCallback(pin, token) {
		this.pin = pin;
		this.token = token;
		this.props.loginActions.authSuccess();
		forgotPinWithAccessToken(pin, token, this.setNewPinSuccessCallback, this.setNewPinErrorCallback)
	}

	setNewPinSuccessCallback() {
		// set new pin success
		this.props.authSettingActions.setPinSuccess();
		logDevice('error', `FORGOT PIN SUCCESS`)
		this.props.navigator.dismissModal()
	}

	setNewPinErrorCallback(err) {
		console.log(err);
		logDevice('error', `FORGOT PIN ERROR`)
	}

	forgotPinSuccessCb(accessToken) {
		const email = dataStorage.emailLogin
		dataStorage.numberFailEnterPin = 0;
		// func.setLoginConfig(false);
		setTimeout(() => {
			if (Platform.OS === 'ios') {
				this.props.navigator.showModal({
					screen: 'equix.SetPin',
					animated: true,
					animationType: 'slide-up',
					navigatorStyle: {
						statusBarColor: CommonStyle.statusBarBgColor,
						statusBarTextColorScheme: 'light',
						navBarHidden: true,
						navBarHideOnScroll: false,
						navBarTextFontSize: 16,
						drawUnderNavBar: true,
						navBarNoBorder: true,
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new',
						token: accessToken,
						email,
						forgotPinCallback: this.forgotPinCallback,
						isShowCancel: true,
						cancelAutoLoginFn: () => {
							this.props.navigator.dismissModal();
						}
					}
				})
			} else {
				this.props.navigator.showModal({
					screen: 'equix.SetPin',
					animated: true,
					animationType: 'slide-up',
					navigatorStyle: {
						statusBarColor: CommonStyle.statusBarBgColor,
						statusBarTextColorScheme: 'light',
						navBarHidden: true,
						navBarHideOnScroll: false,
						navBarTextFontSize: 16,
						drawUnderNavBar: true,
						navBarNoBorder: true,
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new',
						token: accessToken,
						email,
						forgotPinCallback: this.forgotPinCallback
					}
				})
			}
		}, 500)
	}

	onBackDropModalPress() {
		Keyboard.dismiss()
		this.isMount && this.setState({
			isPinCodeModalVisible: false
		})
	}

	render() {
		return (
			<View>
				<Accordion
					sections={[this.state.data]}
					onChange={this.loadData.bind(this)}
					activeSection={this.state.isExpand ? 0 : false}
					renderHeader={this.renderHeader.bind(this)}
					renderContent={this.renderContent.bind(this)}>
				</Accordion>
				{
					this.auth.showLoginForm(this.state.isForgotPinModalVisible, I18n.t('resetYourPin'), I18n.t('pleaseEnterYourPassword'), this.state.animationLogin, () => {
						this.isMount && this.setState({
							animationLogin: ''
						});
					}, () => {
						this.isMount && this.setState({
							isForgotPinModalVisible: false
						});
					}, () => {
						this.props.loginActions.authError();
						this.isMount && this.setState({
							// animationLogin: 'shake',
							isError: true
						});
					}, () => {
						this.props.loginActions.authSuccess();
						this.isMount && this.setState({
							isForgotPinModalVisible: false,
							isError: false
						});
					}, accessToken => {
						this.props.loginActions.authSuccess();
						this.isMount && this.setState({
							isForgotPinModalVisible: false,
							isError: false
						}, () => {
							this.forgotPinSuccessCb(accessToken)
						});
					}, null, null, this.state.isError, true)
				}
				<AuthenByPin
					onForgotPin={this.onForgotPin}
					onChangeAuthenByFingerPrint={this.onChangeAuthenByFingerPrint}
					onRef={ref => this.authenPin = ref}
					onPinCompleted={this._onPinCompleted}
				/>
				<TouchAlert
					ref={ref => this.androidTouchID = ref}
					visible={this.state.isAndroidTouchIdModalVisible}
					dismissDialog={this.hideAndroidTouchID}
					authenByPinFn={this.showFormLogin.bind(this, this.showOpenPosition, this.state.params)}
				/>
			</View>

		)
	}
}

export function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loginActions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch),
		portfolioActions: bindActionCreators(portfolioActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenPrice);
