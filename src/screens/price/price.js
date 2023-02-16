import React, { PropTypes, Component } from 'react';
import {
	Text,
	TouchableOpacity,
	InteractionManager,
	View,
	Dimensions,
	Animated,
	processColor,
	PixelRatio,
	Platform,
	ScrollView,
	Keyboard,
	FlatList
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
	roundFloat,
	checkWeekend,
	formatNumber,
	formatNumberNew2,
	formatNumberNew2ClearZero,
	getPriceSource,
	logAndReport,
	checkPropsStateShouldUpdate,
	getUniqueList,
	removeItemFromLocalStorage,
	offTouchIDSetting,
	largeValue,
	getExchange,
	logDevice,
	pinComplete,
	deleteNotiNewsByCode,
	checkTradingHalt,
	showNewsDetail,
	getDisplayName,
	getSymbolInfoApi,
	openSignIn,
	setTimeoutClickable,
	preprocessNoti,
	renderTime
} from '../../lib/base/functionUtil';
import Accordion from 'react-native-collapsible/Accordion';
import HighLightText from '../../modules/_global/HighLightText';
import styles from '../trade/style/trade';
import firebase from '../../firebase';
import Perf from '../../lib/base/performance_monitor';
import ButtonBox from '../../modules/_global/ButtonBox';
import { func, dataStorage } from '../../storage';
import moment from 'moment';
import timeagoInstance from '../../lib/base/time_ago';
import Auth from '../../lib/base/auth';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import { Icon } from 'react-native-elements'
import uuid from 'react-native-uuid';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import userType from '../../constants/user_type';
import filterType from '../../constants/filter_type';
import Chart from '../line_chart/line_chart';
import ChartNew from '../candle_stick_volume_chart/candle_stick_volume_chart';
import IonIcons from 'react-native-vector-icons/Ionicons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalPicker from './../modal_picker/modal_picker';
import ProgressBar from '../../modules/_global/ProgressBar';
import tradeTypeString from '../../constants/trade_type_string';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import { addDaysToTime, getDateStringWithFormat, addMonthsToTime, getDateOnly, convertToLocalTime2 } from '../../lib/base/dateTime';
import Modal from 'react-native-modal';
import { VibrancyView, BlurView } from 'react-native-blur';
import Pin from '../../component/pin/pin'
import XComponent from '../../component/xComponent/xComponent'
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin'
import TouchAlert from '../setting/auth_setting/TouchAlert';
import time from '../../constants/time';
import { Navigation } from 'react-native-navigation';
import * as api from '../../api';
import { getSymbolInfo } from '../../app.actions';
import * as fbemit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter';
import performanceEnum from '../../constants/performance';
import * as Util from '../../util';
import Enum from '../../enum';
import Flag from '../../component/flags/flag';
import * as Business from '../../business';
import CustomAccordion from '../../component/custom_accordion/custom_accordion'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as Historical from '../../streaming/historical';
import * as InvertTranslate from '../../invert_translate'
import Flashing from '../../component/flashing/flashing'
import * as Controller from '../../memory/controller'
import { showNewOrderModal } from '~/navigation/controller.1'

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;
const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;
const REALTIME_TYPE = {
	PRICE: 'price',
	HISTORICAL: 'historical'
};
const PTC_CHANNEL = Enum.PTC_CHANNEL;

export class Announcement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			isDisabled: true
		}
		this.renderToLink = this.renderToLink.bind(this);
	}

	componentDidMount() {
		try {
			const item = this.props.data;
			const curTime = new Date().getTime();
			const enabledTime = item.updated + 1200000
			if (enabledTime <= curTime) {
				this.setState({
					data: item,
					isDisabled: false
				});
			} else {
				const timeCount = enabledTime - curTime;
				this.setState({ data: item }, () => {
					setTimeout(() => {
						this.setState({
							isDisabled: false
						})
					}, timeCount);
				});
			}
		} catch (error) {
			logAndReport('componentDidMount price Announcement exception', error, 'componentDidMount Announcement');
		}
	}

	renderToLink(data) {
		const newID = data.news_id || ''
		showNewsDetail(newID, this.props.navigator, this.props.isConnected);
	}

	render() {
		const { data } = this.state;
		const { i, listLength } = this.props;
		if (!data) {
			return (<View></View>);
		}
		if (listLength <= 3) {
			return (
				<TouchableOpacity disabled={this.state.isDisabled}
					onPress={() => this.renderToLink(data)} style={[styles.rowExpandNews2, { borderBottomWidth: i === listLength - 1 ? 0 : 1 }]} key={this.props.i}>
					<View style={{ flexDirection: 'row', width: '100%' }}>
						{
							data.link
								? <TouchableOpacity testID={`${data.news_id}iconDownload`} style={{ width: '8%' }}
									onPress={() => console.log('dowload news')} disabled={this.state.isDisabled || !data.link}>
									<IonIcons name='md-download' size={20} color={this.state.isDisabled ? 'grey' : '#10a8b2'} />
								</TouchableOpacity>
								: <View style={{ width: '8%' }}></View>
						}
						{
							data.link && data.link ? <Text style={[CommonStyle.textSubBlack, { width: '57%' }]}>{data.sign && Array.isArray(data.sign) && data.sign.includes('PriceSensitive') ? `! ${data.title}` : data.title}</Text>
								: <Text style={[CommonStyle.textSubNormalBlack, { width: '57%' }]}>{data.sign && Array.isArray(data.sign) && data.sign.includes('PriceSensitive') ? `* ! ${data.title}` : `* ${data.title}`}</Text>
						}
						<Text style={[CommonStyle.textSub, { textAlign: 'right', width: data.link ? '35%' : '35%' }]}>{timeagoInstance.format(data.updated, 'qe_local')}</Text>
					</View>
					{
						data.page_count && data.page_count > 0 ? (
							<View style={{ width: '100%', paddingTop: 6 }}>
								<Text style={CommonStyle.textFloatingLabel}>
									{data.page_count && data.page_count > 0 ? (data.page_count > 1 ? `${data.page_count} ${I18n.t('pages', { locale: this.props.setting.lang })}` : `${data.page_count} ${I18n.t('page', { locale: this.props.setting.lang })}`) : ''}
								</Text>
							</View>
						) : null
					}
				</TouchableOpacity>
			);
		} else {
			return (
				<TouchableOpacity disabled={this.state.isDisabled}
					onPress={() => this.renderToLink(data)} style={[styles.rowExpandNews2, { borderBottomWidth: i === 2 ? 0 : 1 }]} key={i}>
					<View style={{ flexDirection: 'row', width: '100%' }}>
						{
							data.link
								? <TouchableOpacity testID={`${data.news_id}iconDownload`} style={{ width: '8%' }}
									onPress={() => console.log('dowload news')} disabled={this.state.isDisabled || !data.link}>
									<IonIcons name='md-download' size={20} color={this.state.isDisabled ? 'grey' : '#10a8b2'} />
								</TouchableOpacity>
								: <View style={{ width: '8%' }}></View>
						}
						{
							data.link ? <Text style={[CommonStyle.textSubBlack, { width: '57%' }]} >{data.sign && Array.isArray(data.sign) && data.sign.includes('PriceSensitive') ? `! ${data.title}` : data.title}</Text>
								: <Text style={[CommonStyle.textSubNormalBlack, { width: '57%' }]} >{data.sign && Array.isArray(data.sign) && data.sign.includes('PriceSensitive') ? `! * ${data.title}` : `* ${data.title}`}</Text>
						}
						<Text style={[CommonStyle.textSub, { textAlign: 'right', width: data.link ? '35%' : '35%' }]}>{timeagoInstance.format(data.updated, 'qe_local')}</Text>
					</View>
					{
						data.page_count && data.page_count > 0 ? (
							<View style={{ width: '100%', paddingTop: 6 }}>
								<Text style={CommonStyle.textFloatingLabel}>
									{data.page_count && data.page_count > 0 ? (data.page_count > 1 ? `${data.page_count} ${I18n.t('pages', { locale: this.props.setting.lang })}` : `${data.page_count} ${I18n.t('page', { locale: this.props.setting.lang })}`) : ''}
								</Text>
							</View>
						) : null
					}
				</TouchableOpacity>
			);
		}
	}
}

class Price extends XComponent {
	constructor(props) {
		super(props);
		this.listItem = Util.getValueObject(PRICE_FILL_TYPE)
		this.listDisplay = InvertTranslate.getListInvertTranslate(this.listItem)
		this.beginDay = parseInt(getDateOnly(new Date()).getTime());
		const to = new Date();
		const addToDate = addDaysToTime(to, 1);
		this.endDay = parseInt(addToDate.getTime() - 1);
		// this.tomorrow = getDateOnly(addDaysToTime(new Date(), 1)).getTime();
		this.userId = func.getUserId();
		this.maxValue = -99999999999999;
		this.minValue = 999999999999999;
		this.isMount = false;
		this.isReady = false;
		this.isChanged = false;
		this.timeOut = null;
		this.emailDefault = config.username;
		this.passDefault = config.password;
		this.dataChart = {};
		this.dataObject = this.props.data || {};
		this.count = 0;
		this.firstData = null;
		this.data = [];
		this.watchListName = 'Personal';
		this.type = '';
		this.waitRenderPrice = false;
		this.waitRenderHistorical = false;
		this.hasRender = true;
		this.state = {
			isNewsToday: dataStorage.listNewsToday[this.props.symbol] || false,
			displayName: this.props.symbol || '',
			symbolInfo: {},
			filterType: PRICE_FILL_TYPE._1D,
			chartType: '$',
			isLoading: true,
			isChartLoading: true,
			listData: [],
			ask_size: '',
			bid_size: '',
			company: null,
			symbol: this.props.symbol,
			bid_price: '',
			change_point: '',
			plusButton: this.props.typePrice ? `- ${I18n.t('favorites', { locale: this.props.setting.lang })}` : `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`,
			change_percent: '',
			trade_price: '',
			trade_size: '',
			open: '',
			high: '',
			low: '',
			close: '',
			previous_close: '',
			value_traded: '',
			volume: '' || 0,
			isSelect: false,
			ask_price: '',
			announcements: [],
			annLoading: true,
			annInDay: false,
			isExpand: false,
			tradingHalt: false,
			listCandle: [],
			labelsM: [],
			labelsP: [],
			listVolume: [],
			maxRight: 0,
			maxLeft: 0,
			minRight: 0,
			listColor: [],
			trend: '',
			heightAn: new Animated.Value(48),
			isError: false,
			modalVisible: false,
			updated: new Date().getTime(),
			dataChartNow: null,
			isPinCodeModalVisible: false,
			isForgotPinModalVisible: false,
			isAndroidTouchIdModalVisible: false,
			params: []
		};
		this.selectedItem = I18n.t(this.state.filterType)
		// Register listener
		this.updatePriceStreaming = this.updatePriceStreaming.bind(this);
		this.onParentScroll = this.onParentScroll.bind(this);
		this.checkActiveIndex = this.checkActiveIndex.bind(this);
		this.updateTradingHalt = this.updateTradingHalt.bind(this)
		this.showFormLoginSuccessCallback = null;
		this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
		this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
		this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
		this.setPriceObj = this.setPriceObj.bind(this)
		this.params = [];
		this.authFunction = this.authFunction.bind(this);
		this.showFormLogin = this.showFormLogin.bind(this);
		this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(this);
		this.onForgotPin = this.onForgotPin.bind(this);
		this._onPinCompleted = this._onPinCompleted.bind(this);
		this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
		this.removeItemStorageSuccessCallback = this.removeItemStorageSuccessCallback.bind(this)
		this.getAnnouncement = this.getAnnouncement.bind(this);
		this.changedIndex = this.changedIndex.bind(this);
		this.loadContent = this.loadContent.bind(this);
		this.getSymbolInfo = this.getSymbolInfo.bind(this);
		this.onAddToWatchList = this.onAddToWatchList.bind(this);
		this.childAdded = this.childAdded.bind(this);
		this.childRemoved = this.childRemoved.bind(this);
		this.onOrder = this.onOrder.bind(this);
		this.callbackSymbol = this.callbackSymbol.bind(this);
		this.getDataChartCallback = this.getDataChartCallback.bind(this);
		this.updateDataChart = this.updateDataChart.bind(this)
		this.getDataChartCallbackStreaming = this.getDataChartCallbackStreaming.bind(this)
		this.checkExitOnUserWatchList = this.checkExitOnUserWatchList.bind(this)
		this.checkSymbolExit = this.checkSymbolExit.bind(this)
		this.checkTradingHalt = this.checkTradingHalt.bind(this)
		this.checkNewsToday = this.checkNewsToday.bind(this);
		this.checkDisplayNameHaltAndNewsToday = this.checkDisplayNameHaltAndNewsToday.bind(this);
		this.manageHasRender = this.manageHasRender.bind(this);
		this.renderRealtimePrice = this.renderRealtimePrice.bind(this);
		this.renderRealtimeChart = this.renderRealtimeChart.bind(this);
		this.realtimeHistorical = this.realtimeHistorical.bind(this);
		this.getBaseInfo = this.getBaseInfo.bind(this);
		this.subHistorical = this.subHistorical.bind(this);
		this.unsubHistorical = this.unsubHistorical.bind(this);
		this.sendToChild = this.sendToChild.bind(this);
		this.showValue = this.showValue.bind(this)

		this.nav = this.props.navigator;
		this.auth = new Auth(this.nav, this.props.login.email, this.props.login.token, this.showFormLogin);
		this.isPress = false;
		if (this.props.channelUpdateIndex) {
			this.onParentScroll();
			this.manageHasRender(this.props.startIndex, this.props.endIndex);
		}
	}

	sendToChild(oldItem, newItem) {
		if (oldItem.trade_price !== newItem.trade_price) {
			this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: newItem.trade_price });
		}
	}

	setPriceObj(data) {
		this.sendToChild(this.dataObject, data);
		this.dataObject = data;
	}

	componentWillReceiveProps(nextProps) {
		if (!Controller.isPriceStreaming() && nextProps && nextProps.data) {
			this.setPriceObj(nextProps.data);

			if (this.state.isExpand) {
				this.checkSymbolExit()
				this.setState({ isChartLoading: true }, () => this.getDataChart(this.state.filterType));
			}
		}
	}

	// shouldComponentUpdate() {
	//     if (!this.isSelfRender) return false;
	//     this.doneSelfRender();
	//     return true;
	// }

	showFormLogin(successCallback, params) {
		if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
			offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
		}
		if (successCallback) this.showFormLoginSuccessCallback = successCallback;
		this.params = params || []
		this.authenPin && this.authenPin.showModalAuthenPin();
	}

	showPriceClose(closePrice) {
		const isWeekend = checkWeekend();
		if (!isWeekend) {
			return closePrice < 0 || closePrice === null || closePrice === undefined ? '--' : formatNumberNew2(closePrice, 3)
		}
		return closePrice < 0 || closePrice === null || closePrice === undefined ? '--' : formatNumberNew2(closePrice, 3)
	}

	childAdded() {
		if (this.isMount) {
			this.setState({
				isSelect: true,
				plusButton: `- ${I18n.t('favorites', { locale: this.props.setting.lang })}`
			});
		}
	}

	childRemoved() {
		if (this.isMount) {
			this.setState({
				isSelect: false,
				plusButton: `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`
			});
		}
	}

	setDataSymbol(symbol = {}) {
		this.setState({ symbolInfo: symbol });
	}

	updateHalt(data) {
		logDevice('info', `updateHalt for row_news with data: ${data ? JSON.stringify(data) : ''}`)
		this.isMount && checkTradingHalt(this.props.symbol).then(snap => {
			const tradingHalt = snap && snap.trading_halt ? snap.trading_halt : false;
			this.setState({ tradingHalt }, () => {
				logDevice('info', `Updated Halt of ${this.props.symbol}: ${tradingHalt}`)
			}).catch(err => {
				logDevice('info', `PRICE TRADING HALT ERROR: ${err}`)
				console.log(err)
			})
		});
	}

	checkTradingHalt(symbol) {
		// Check trading halt
		let tradingHalt = false;
		if (dataStorage.symbolEquity && dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].trading_halt !== undefined && dataStorage.symbolEquity[symbol].trading_halt !== null) {
			tradingHalt = dataStorage.symbolEquity[symbol].trading_halt
		}
		return tradingHalt
	}

	checkNewsToday(symbol) {
		let isNewsToday = false;
		if (dataStorage.listNewsToday[symbol] !== undefined || dataStorage.listNewsToday[symbol] !== null) {
			isNewsToday = dataStorage.listNewsToday[symbol]
		}
		return isNewsToday
	}

	checkDisplayNameHaltAndNewsToday(symbol, tradingHalt, isNewsToday) {
		if (dataStorage.symbolEquity && dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name) {
			// Nhận symbol info từ cha
			let displayName = dataStorage.symbolEquity[symbol].display_name || symbol;
			displayName = displayName.length > 9 ? Business.convertDisplayName(displayName) : displayName
			this.setState({
				displayName,
				tradingHalt,
				isNewsToday
			});
		} else {
			// Lấy lại symbol info
			getSymbolInfoApi(symbol, () => {
				let displayName = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name ? dataStorage.symbolEquity[symbol].display_name : symbol
				displayName = displayName.length > 9 ? Business.convertDisplayName(displayName) : displayName
				this.setState({
					displayName,
					tradingHalt,
					isNewsToday
				});
			})
		}
	}

	componentDidMount() {
		try {
			super.componentDidMount();
			this.isMount = true;
			if (Controller.isPriceStreaming()) {
				this.updatePriceStreaming()
			}
			this.updateTradingHalt()
			this.props.registerChange(this.props.symbol, this.changedIndex);
			if (this.props.symbol) {
				const symbol = this.props.symbol
				// Check trading halt
				const tradingHalt = this.checkTradingHalt(symbol);
				// Check news today
				const isNewsToday = this.checkNewsToday(symbol);
				// Check display name
				this.checkDisplayNameHaltAndNewsToday(symbol, tradingHalt, isNewsToday);
			}
		} catch (error) {
			logAndReport('componentDidMount price exception', error, 'componentDidMount price');
		}
	}

	componentWillUnmount() {
		this.isMount = false;
		fbemit.deleteEmitter('halt');
		this.unsubHistorical();
		if (this.timeOut) {
			clearTimeout(this.timeOut);
		}
		super.componentWillUnmount();
	}

	checkHeaderChange(currentVal, newVal, isExpand) {
		if (isExpand === true) return true;
		if (!currentVal || !newVal) return true;
		return currentVal.trade_price !== newVal.trade_price ||
			currentVal.change_percent !== newVal.change_percent ||
			currentVal.trade_size !== newVal.trade_size ||
			currentVal.change_point !== newVal.change_point ||
			currentVal.symbol !== newVal.symbol;
	}

	updatePriceStreaming() {
		const symbol = this.props.symbol
		const exchange = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].exchanges ? dataStorage.symbolEquity[symbol].exchanges[0] : '';
		if (!symbol || !exchange) return;

		const channel = StreamingBusiness.getChannelLv1(exchange, symbol);
		Emitter.addListener(channel, this.id, newData => {
			if (this.checkActiveIndex(REALTIME_TYPE.PRICE)) {
				const isHeaderChange = this.checkHeaderChange(this.dataObject, newData, this.state.isExpand);
				this.setPriceObj(newData);
				if (isHeaderChange) this.renderRealtimePrice();
			} else {
				this.setPriceObj(newData);
			}
		});
	}

	realtimeHistorical() {
		const { symbol, exchange, interval } = this.getBaseInfo();
		if (!symbol || !exchange || !interval) return;

		const event = StreamingBusiness.getChannelHistorical(exchange, symbol, interval);
		Emitter.addListener(event, this.id, data => {
			if (!this.state.isExpand) return;
			if (this.checkActiveIndex(REALTIME_TYPE.HISTORICAL)) {
				this.updateDataChart(this.state.filterType, this.dataChart, data);
			} else {
				this.mergeDataWithLastBar(this.dataChart, this.state.filterType, data);
			}
		});
	}

	updateTradingHalt() {
		fbemit.addListener('halt', `halt_${this.props.symbol}`, this.updateHalt.bind(this));
	}

	getSymbolInfo() {
		fbemit.addListener(this.props.type, `${this.props.symbol}`, data => this.callbackSymbol(data));
	}

	callbackSymbol(data) {
		const company = data ? (data.company_name || data.company || null) : (dataStorage.symbolEquity[this.props.symbol] ? (dataStorage.symbolEquity[this.props.symbol].company_name || dataStorage.symbolEquity[this.props.symbol].copany || null) : null)
		this.setState({ company })
	}

	getBaseInfo() {
		return {
			symbol: this.props.symbol,
			exchange: func.getExchangeSymbol(this.props.symbol),
			interval: BAR_BY_PRICE_TYPE[this.state.filterType]
		};
	}

	subHistorical() {
		return new Promise(resolve => {
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

	changedIndex(isOpen) {
		if (!this.isMount) return;
		if (isOpen === this.state.isExpand) return;
		if (isOpen) {
			this.setState({
				isExpand: isOpen
			})
			Controller.isPriceStreaming() && this.subHistorical().then(() => {
				console.log('SUB HISTORICAL SUCCESS')
			});
		} else {
			this.setState({ isExpand: isOpen });
			this.unsubHistorical().then(() => {
				console.log('UNSUB HISTORICAL SUCCESS')
			});
		}
	}

	checkExitOnUserWatchList(symbol, userID, apiType) {
		api.actionUserWatchListSymbol(
			userID,
			symbol,
			apiType,
			this.childAdded,
			this.childRemoved
		)
	}

	checkSymbolExit() {
		if (dataStorage.dicPersonal && Object.keys(dataStorage.dicPersonal).length) {
			const dicUserSymbol = { ...dataStorage.dicPersonal }
			const symbol = this.props.symbol
			for (const key in dicUserSymbol) {
				if (key === symbol) {
					return this.childAdded()
				}
			}
			return this.childRemoved()
		} else {
			return this.childRemoved()
		}
	}

	loadContent(changed) {
		try {
			if (changed) {
				this.props.changeIndex(this.props.symbol, true);
				const symbol = this.props.symbol;
				const userID = Controller.getUserId()
				const apiType = 'check-exist'
				if (!this.isReady) {
					InteractionManager.runAfterInteractions(() => {
						this.checkExitOnUserWatchList(symbol, userID, apiType)
						this.getDataChart(this.state.filterType);
						if (!this.props.noNews) {
							this.getAnnouncement();
						}
					});
				}
			} else {
				this.props.changeIndex(this.props.symbol, false)
				InteractionManager.runAfterInteractions(() => {
					if (Platform.OS === 'android') {
						this.props.showHideHeaderTab && this.props.showHideHeaderTab(this.props.type)
					}
				})
			}
		} catch (error) {
			logAndReport('loadContent price exception', error, 'loadContent price');
		}
	}

	// componentWillMount() {
	//     this.getAnnouncement();
	// }

	getAnnouncement() {
		try {
			let listData = [];
			const isMore = false;
			const newTxt = Util.encodeSymbol(this.props.symbol);
			let url = `${api.getNewsUrl(null, null)}${newTxt}&top=3`;
			url = `${url}&duration=year`
			api.requestData(url).then(data => {
				const listObj = data;
				const ann = [];
				let annInDay = false;
				const dateNow = new Date();
				const dateOnly = getDateOnly(dateNow);
				const currentDateString = getDateStringWithFormat(dateOnly, 'DD MMM YYYY');
				if (listObj) {
					for (let i = 0; i < listObj.length; i++) {
						const element = listObj[i];
						const dateCheck = new Date(Number(element.updated));
						const stringCheck = getDateStringWithFormat(dateCheck, 'DD MMM YYYY');
						if (stringCheck === currentDateString) {
							annInDay = true;
						}
						const now = new Date().getTime();
						const changeTime = now - element.updated;
						if (changeTime < time.ONE_WEEK) {
							listData.push(element);
						}
					}
					listData = listData.sort(function (a, b) {
						return b.updated - a.updated;
					});
					listData = getUniqueList(listData, 'news_id');
				}
				this.setState({
					announcements: listData,
					annLoading: false,
					annInDay
				}, () => {
					// delete all noti of symbol in noti status local storage
					deleteNotiNewsByCode(this.props.symbol);
				});
			});
		} catch (error) {
			logAndReport('getAnnouncement price exception', error, 'getAnnouncement price');
		}
	}

	renderTextBorder(text, color, isShow) {
		if (isShow) {
			return (
				<View style={{
					backgroundColor: color,
					height: 11.9,
					width: 11.8,
					borderRadius: 1,
					alignItems: 'flex-end',
					justifyContent: 'flex-end'
				}}>
					<View style={{ width: 11.2, height: 11.6, justifyContent: 'center', alignItems: 'center' }}>
						<Text
							allowFontScaling={false}
							style={{
								fontSize: CommonStyle.fontSizeXS - 3,
								color: 'white',
								fontFamily: CommonStyle.fontFamily
							}}>{text}</Text>
					</View>
				</View>
			);
		}
		return null;
	}

	authFunction(cb) {
		try {
			if (!Controller.getLoginStatus()) return;
			if (dataStorage.pinSetting !== 0) {
				cb && cb();
			} else {
				let objAndroidTouchIDFn = null;
				if (Platform.OS === 'android') {
					objAndroidTouchIDFn = {
						showAndroidTouchID: this.showAndroidTouchID,
						hideAndroidTouchID: this.hideAndroidTouchID,
						androidTouchIDFail: this.androidTouchIDFail
					}
				}
				this.auth.authentication(cb, null, objAndroidTouchIDFn);
			}
		} catch (error) {
			logAndReport('authFunction price exception', error, 'authFunction price');
		}
	}

	showValue(isLoading, value, isFormat = true) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return isFormat
				? formatNumberNew2(value, 3)
				: value
		}
	}

	onOrder() {
		try {
			logDevice('info', ' onOrder was called: ' + this.props.symbol);
			const data = this.data;
			const exchange = data.exchange;
			const type = this.type;
			const symbol = this.props.symbol || '';
			const exchanges = this.state.symbolInfo && this.state.symbolInfo.exchanges ? this.state.symbolInfo.exchanges : null;
			const listExchange = getExchange(exchanges);
			if (!Controller.getLoginStatus()) return;
			const isParitech = (exchange + '').includes('ASX');
			logDevice('info', 'push Form onOrder: ' + this.props.symbol);
			// Set order back status
			func.setBackNewOrderStatus(false)
			const passProps = {
				displayName: this.state.displayName,
				isBuy: type === 'buy',
				code: symbol,
				exchange,
				isParitech,
				callBackAfterPopup: this.props.callBackAfterPopup ? this.props.callBackAfterPopup.bind(this) : null,
				changePercent: data.change_percent ? formatNumberNew2(data.change_percent, 2) : 0,
				tradePrice: data.trade_price ? formatNumberNew2(data.trade_price, 3) : null,
				exchanges: listExchange,
				limitPrice: type === tradeTypeString.BUY ? (data.ask_price ? data.ask_price : 0) : (data.bid_price ? data.bid_price : 0),
				stopPrice: data.trade_price ? data.trade_price : 0,
				volume: 0,
				isNotShowMenu: true
			}
			showNewOrderModal({
				navigator: this.nav,
				passProps
			})
		} catch (error) {
			logDevice('info', 'onOrder price exception')
			logAndReport('onOrder price exception', error, 'onOrder price');
		}
	}

	setTimeoutClickable() {
		this.isPress = true;
		setTimeout(() => {
			this.isPress = false;
		}, 1500);
	}

	showModalNew() {
		this.nav.push({
			screen: 'equix.SearchDetail',
			title: I18n.t('search', { locale: this.props.setting.lang }),
			backButtonTitle: ' ',
			animated: false,
			passProps: {
				isPushFromWatchlist: true,
				isBackground: false,
				symbol: this.props.symbol,
				login: this.props.login,
				listPosition: this.state.listPosition
			},
			// navigatorButtons: {
			//     rightButtons: func.getUserPriceSource() !== userType.Streaming ? [
			//         {
			//             title: 'Refresh',
			//             id: 'search_refresh',
			//             icon: iconsMap['ios-refresh-outline']
			//         }
			//     ] : []
			// },
			navigatorStyle: {
				statusBarColor: config.background.statusBar,
				statusBarTextColorScheme: 'light',
				navBarBackgroundColor: CommonStyle.statusBarBgColor,
				navBarTextColor: config.color.navigation,
				navBarHideOnScroll: false,
				drawUnderNavBar: true,
				navBarTextFontSize: 18,
				navBarButtonColor: config.button.navigation,
				navBarNoBorder: true,
				navBarSubtitleColor: 'white',
				navBarSubtitleFontFamily: 'HelveticaNeue'
			}
		});
	}

	renderHeader() {
		const displayName = this.state.displayName
		const rowData = this.dataObject;
		const { symbol, exchange } = this.getBaseInfo();
		const valueTraded = largeValue(rowData.value_traded);
		const loading = this.props.isLoading
		const company = dataStorage.symbolEquity[symbol] ? (dataStorage.symbolEquity[symbol].company_name || dataStorage.symbolEquity[symbol].company || '') : (this.state.company || this.props.company || '')
		const companyName = (company + '').toUpperCase();
		const flagIcon = Business.getFlag(symbol);
		return (
			<Animated.View style={{
				paddingHorizontal: CommonStyle.paddingSize,
				paddingVertical: 6,
				backgroundColor: 'white',
				justifyContent: 'space-between',
				width: '100%'
			}}>
				<View style={{ flexDirection: 'row' }}>
					<View style={[styles.col1, { flexDirection: 'row' }]}>
						<Text style={[CommonStyle.textMainRed, { flex: this.state.tradingHalt ? 0.6 : 0 }]}>{this.state.tradingHalt ? '!' : ''}</Text>
						<Text testID={`${rowData.symbol}HeaderWL`} style={[CommonStyle.textMain, { flex: this.state.tradingHalt ? 8.4 : 9 }]}>{displayName}</Text>
						<Text style={{ flex: 0.5 }}></Text>
						<View style={{ flex: 4, flexDirection: 'row' }}>
							<Flag
								style={{ marginTop: 1 }}
								type={'flat'}
								code={flagIcon}
								size={18.5}
								type='flat'
							/>
							<Text style={{ flex: 1 }}></Text>
							<View style={{ flexDirection: 'row', flex: 1, marginTop: 4.3 }}>
								{this.renderTextBorder('A', this.state.isNewsToday ? '#f28bb0' : '#0000001e', true)}
							</View>
						</View>
					</View>
					{
						this.props.typeForm === 'topVolume'
							? <HighLightText style={[styles.col2, CommonStyle.textMainNoColor, { textAlign: 'right' }]}
								base={rowData.trend}
								testID={`${rowData.symbol}PriceWL`}
								value={loading ? null : (rowData.trade_price ? `AUD ${valueTraded}` : null)} />
							: <View style={[styles.col2, { flex: 1 }]}>
								<Flashing
									value={rowData.trade_price}
									parentID={this.id}
									hasRender={this.hasRender}
									field={PTC_CHANNEL.TRADE_PRICE}
									typeFormRealtime={TYPE_FORM_REALTIME.WATCHLIST}
								/>
							</View>

					}
					<HighLightText style={[styles.col3, CommonStyle.textMainNoColor, { textAlign: 'right' }]}
						base={formatNumberNew2(rowData.change_percent, 2)}
						testID={`${rowData.symbol}changePerWL`}
						percent
						value={loading ? null : (rowData.change_percent !== null && rowData.change_percent !== undefined ? formatNumberNew2(rowData.change_percent, 2) : null)} />
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text testID={`${rowData.symbol}NameWL`} style={[styles.col1, CommonStyle.textSub]}>{companyName}</Text>
					{
						this.props.typeForm === 'topVolume'
							? <Text testID={`${rowData.symbol}SizeWL`} numberOfLines={2} style={[styles.col2, CommonStyle.textSub, { textAlign: 'right' }]}>{}</Text>
							: <Text testID={`${rowData.symbol}SizeWL`} numberOfLines={2} style={[styles.col2, CommonStyle.textSub, { textAlign: 'right', paddingRight: 4 }]}>{this.showValue(loading, rowData.trade_size, false)}</Text>
					}
					<HighLightText style={[styles.col3, CommonStyle.textSubNoColor, { textAlign: 'right' }]}
						addSymbol
						base={formatNumberNew2(rowData.change_point, 3)}
						testID={`${rowData.symbol}changePoiWL`}
						value={loading ? null : rowData.change_point !== null && rowData.change_point !== undefined ? formatNumberNew2(rowData.change_point, 3) : null} />
				</View>
			</Animated.View>
		);
	}

	mergeDataWithLastBar(val, dataSelect, lastBar) {
		const isWeekend = checkWeekend(); // Check cuối tuần hay không true => không phải ngày cuối tuần => vẽ chart ngày hiện tại
		if (val && val.noData) {
			const tmp = {};
			if (isWeekend && (dataSelect === PRICE_FILL_TYPE._1Y || dataSelect === PRICE_FILL_TYPE._3Y)) {
				tmp[lastBar.updated] = lastBar;
			}
			val = tmp;
		} else {
			const lastKey = parseInt(Object.keys(val).sort().pop());
			const timePrice = lastBar.updated
			const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice) // Check xem đã có bar ngày hiện tại hay chưa
			const newData = { ...lastBar };
			if (Controller.isPriceStreaming() ||
				(isWeekend &&
					isDrawBarChartNow &&
					(dataSelect === PRICE_FILL_TYPE._1Y || dataSelect === PRICE_FILL_TYPE._3Y)
				)) {
				val[lastBar.updated] = val[lastBar.updated]
					? {
						...val[lastBar.updated],
						...newData
					}
					: newData;
				val[timePrice].close = val[timePrice].close || val[timePrice].trade_price || 0;
			}
		}
	}

	getDataChartCallbackStreaming(val, dataSelect, lastBar) {
		const isChartDay = dataSelect === PRICE_FILL_TYPE._1D
		this.isReady = true;
		this.mergeDataWithLastBar(val, dataSelect, lastBar);

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
				const markerLabel = getDateStringWithFormat(date, markerLabelTimeFormat);
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
						marker: `${renderTime(timeStamp, markerLabelTimeFormat)}\n ${this.props.displayName}: ${formatNumberNew2(dataTemp, 2)}${this.state.chartType === '%' ? '%' : ''}`
					})
				}
				const temp = {};
				const temp2 = {};
				const closeMarker = data.close === 0 ? '--' : formatNumberNew2(data.close, 3);
				marker = `${renderTime(timeStamp, markerLabelTimeFormat)} - O: ${formatNumberNew2(data.open, 3)}  H: ${formatNumberNew2(data.high, 3)}  L: ${formatNumberNew2(data.low, 3)}  C: ${closeMarker}  Vol: ${largeValue(data.volume)}`
				if ((data.open !== undefined && data.open !== null) && (data.high !== undefined && data.high !== null) && (data.low !== undefined && data.low !== null) && (data.close !== undefined && data.close !== null)) {
					labelsM.push(label);
					temp2.y = parseInt(data.volume) || 0;
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
			// const timeUpdateLastBar = parseInt(Object.keys(val).pop())
			const isAuBySymbol = Util.isAuBySymbol(this.props.symbol);
			const now = new Date().getTime();
			const checkTimeCloseSession = Util.checkCloseSessionBySymbol(now, isAuBySymbol);
			if (checkTimeCloseSession) {
				labelLength = listData.length;
			} else {
				labelLength = Util.isAuBySymbol(this.props.symbol) ? 74 : 78
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
			})
		}
	}

	getDataChartCallback(val, dataSelect) {
		const isChartDay = dataSelect === PRICE_FILL_TYPE._1D
		this.isReady = true;
		const isWeekend = checkWeekend(); // Check cuối tuần hay không true => không phải ngày cuối tuần => vẽ chart ngày hiện tại
		if (val && val.noData && this.dataObject && this.dataObject.close && this.dataObject.close !== '') {
			const tmp = {};
			if (isWeekend && (dataSelect === PRICE_FILL_TYPE._1Y || dataSelect === PRICE_FILL_TYPE._3Y)) {
				tmp[this.dataObject.updated] = this.dataObject;
			}
			val = tmp;
		} else {
			const lastKey = parseInt(Object.keys(val).sort().pop());
			const timePrice = this.dataObject.updated
			const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice) // Check xem đã có bar ngày hiện tại hay chưa
			const newData = JSON.parse(JSON.stringify(this.dataObject));
			newData.close = newData.close || newData.trade_price || 0;
			if (isWeekend && isDrawBarChartNow && (dataSelect === PRICE_FILL_TYPE._1Y || dataSelect === PRICE_FILL_TYPE._3Y)) {
				val[this.dataObject.updated] = newData;
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
				const markerLabel = getDateStringWithFormat(date, markerLabelTimeFormat);
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
						marker: `${renderTime(timeStamp, markerLabelTimeFormat)}\n ${this.props.displayName}: ${formatNumberNew2(dataTemp, 2)}${this.state.chartType === '%' ? '%' : ''}`
					})
				}
				const temp = {};
				const temp2 = {};
				const closeMarker = data.close === 0 ? '--' : formatNumberNew2(data.close, 3);
				marker = `${renderTime(timeStamp, markerLabelTimeFormat)} - O: ${formatNumberNew2(data.open, 3)}  H: ${formatNumberNew2(data.high, 3)}  L: ${formatNumberNew2(data.low, 3)}  C: ${closeMarker}  Vol: ${largeValue(data.volume)}`
				if ((data.open !== undefined && data.open !== null) && (data.high !== undefined && data.high !== null) && (data.low !== undefined && data.low !== null) && (data.close !== undefined && data.close !== null)) {
					labelsM.push(label);
					temp2.y = parseInt(data.volume) || 0;
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
			})
		}
	}

	updateDataChart(filterType, currentDataChart, lastBar) {
		this.getDataChartCallbackStreaming(currentDataChart, filterType, lastBar)
	}

	async getDataChart(data) {
		try {
			this.maxValue = -99999999999999;
			this.minValue = 999999999999999;
			const dataChart = await Business.getDataChartPrice(this.props.symbol, data);
			if (dataChart) {
				this.dataChart = dataChart;
				this.getDataChartCallback(dataChart, this.state.filterType);
			} else {
				this.getDataChartCallback({ noData: true }, this.state.filterType);
			}
		} catch (error) {
			logAndReport('getDataChart price exception', error, 'getDataChart price');
		}
	}

	successCbOnAddToWatchList(isRemove) {
		if (isRemove) {
			this.setState({ plusButton: `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`, isSelect: false });
		} else {
			// Add symbol dic
			this.setState({ plusButton: `- ${I18n.t('favorites', { locale: this.props.setting.lang })}`, isSelect: true });
		}
		// fbemit.emit('news', 'all', symbol);
	}

	errorCbOnAddToWatchList(isRemove) {
	}

	onAddToWatchList(isRemove) {
		try {
			const symbol = this.props.symbol;
			const listWatchList = Object.keys(dataStorage.dicPersonal)
			let index = 0
			logAndReport('info', `ON ADD WATCHLIST - WATCHLIST SCREEN - dicPersonal: ${JSON.stringify(dataStorage.dicPersonal)} - SYMBOL(INDEX): ${this.props.symbol}(${index})`);
			let action = 'add';
			this.setState({
				plusButton: isRemove ? I18n.t('Removed', { locale: this.props.setting.lang }) : I18n.t('Added', { locale: this.props.setting.lang })
			});
			if (isRemove) {
				index = listWatchList.indexOf(symbol)
				action = 'remove'
			}
			api.updateUserWatchList(
				Enum.WATCHLIST.USER_WATCHLIST,
				this.watchListName,
				[symbol],
				() => this.successCbOnAddToWatchList(isRemove),
				() => this.errorCbOnAddToWatchList(isRemove),
				action,
				index
			)
		} catch (error) {
			logAndReport('onAddToWatchList price exception', error, 'onAddToWatchList price');
		}
	}

	async onSelected(value) {
		//  resub historical
		if (Controller.isPriceStreaming()) await this.unsubHistorical();

		// Dịch ngược về EN với key
		const enValue = InvertTranslate.translateCustomLang(value)
		this.selectedItem = I18n.t(enValue)
		this.setState({
			modalVisible: false,
			filterType: enValue,
			isChartLoading: true
		}, async () => {
			if (Controller.isPriceStreaming()) await this.subHistorical();
			this.callbackSetChart();
		});
	}

	callbackSetChart() {
		this.getDataChart(this.state.filterType);
	}

	changeChartType(type) {
		this.setState({
			chartType: type,
			isChartLoading: true
		}, this.callbackSetChart)
	}

	onShowModalPicker() {
		this.setState({ modalVisible: true })
	}

	onClose() {
		this.setState({ modalVisible: false })
	}

	renderContent() {
		const user = Controller.getUserInfo()
		const loading = this.props.isLoading
		if (!this.state.isExpand) {
			return <View></View>
		}
		const rowData = this.dataObject;

		const loadingAnn = (
			<View style={{
				backgroundColor: 'white',
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				<ProgressBar />
			</View>);
		const count = 5;
		const point = (this.maxValue - this.minValue) / count;
		return (
			<View style={{ width: '100%', marginTop: 2 }}>
				<View style={styles.rowExpand}>
					<View style={styles.expandLine}>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSub, { width: '20%' }]}>{I18n.t('openSearch', { locale: this.props.setting.lang })}</Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '28%' }]}>{rowData.open <= 0 || loading ? '--' : formatNumberNew2(rowData.open, 3)}</Text>
						<Text style={{ width: '4%' }}></Text>
						<Text testID={`${rowData.previous_close}wlO`} style={[CommonStyle.textSub, { width: '27%' }]}>{I18n.t('previousClose', { locale: this.props.setting.lang })}</Text>
						<Text testID={`${rowData.previous_close}wlO`} style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}>{rowData.previous_close <= 0 || loading ? '--' : formatNumberNew2(rowData.previous_close, 3)}</Text>
					</View>
					<View style={styles.expandLine}>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSub, { width: '20%' }]}>{I18n.t('high', { locale: this.props.setting.lang })}</Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '28%' }]}>{formatNumberNew2(rowData.high <= 0 || loading ? '--' : rowData.high, 3)}</Text>
						<Text style={{ width: '4%' }}></Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSub, { width: '27%' }]}>{I18n.t('close', { locale: this.props.setting.lang })}</Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}>{loading ? '--' : this.showPriceClose(rowData.close)}</Text>
					</View>
					<View style={styles.expandLine}>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSub, { width: '20%' }]}>{I18n.t('low', { locale: this.props.setting.lang })}</Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '28%' }]}>{formatNumberNew2(rowData.low <= 0 || loading ? '--' : rowData.low, 3)}</Text>
						<Text style={{ width: '4%' }}></Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSub, { width: '27%' }]}>{I18n.t('volume', { locale: this.props.setting.lang })}</Text>
						<Text testID={`${rowData.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}>{formatNumber(rowData.volume <= 0 || loading ? '--' : largeValue(rowData.volume))}</Text>
					</View>
				</View>
				<View style={[styles.buttonExpand]}>
					<ButtonBox buy
						testID={`${rowData.symbol}SellButton`}
						disableAll={dataStorage.isNotHaveAccount || !this.props.login.isLogin || (user && (user.email === this.emailDefault)) || !this.props.isConnected || dataStorage.loginUserType === 'REVIEW' || !func.isAccountActive()}
						disabled={this.state.isChartLoading || this.state.isLoading}
						onPress={() => {
							if (this.isPress) return;
							this.setTimeoutClickable()
							this.type = 'buy';
							this.data = rowData;
							this.authFunction(this.onOrder.bind(this));
						}}
						width={'48%'}
						value1={loading ? '--' : rowData.bid_size ? formatNumber(rowData.bid_size) : 0}
						value2={loading ? '--' : rowData.bid_price ? formatNumberNew2(rowData.bid_price, 3) : '--'} />
					<View style={{ width: '4%' }}></View>
					<ButtonBox
						testID={`${rowData.symbol}BuyButton`}
						disableAll={dataStorage.isNotHaveAccount || !this.props.login.isLogin || (user && (user.email === this.emailDefault)) || !this.props.isConnected || dataStorage.loginUserType === 'REVIEW' || !func.isAccountActive()}
						disabled={this.state.isChartLoading || this.state.isLoading}
						onPress={() => {
							if (this.isPress) return;
							this.setTimeoutClickable()
							this.type = 'sell'
							this.data = rowData;
							this.authFunction(this.onOrder.bind(this));
						}}
						width={'48%'}
						value1={loading ? '--' : rowData.ask_price ? formatNumberNew2(rowData.ask_price, 3) : '--'}
						value2={loading ? '--' : rowData.ask_size ? formatNumber(rowData.ask_size) : 0} />
				</View>
				<View style={styles.chartContainer}>
					{
						this.state.isChartLoading
							? <View style={[CommonStyle.progressBarWhite]}>
								<ProgressBar />
							</View>
							: (
								this.state.chartType === '$'
									? <ChartNew
										testId={`${rowData.symbol}$ChartWL`}
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
										testId={`${rowData.symbol}%Chart`}
										data={this.state.listData}
										code={rowData.symbol}
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
				</View>
				<View style={[styles.filterContainer, { paddingBottom: 8 }]}>
					<View style={{ width: '20%', flexDirection: 'row' }}>
						<TouchableOpacity
							style={styles.filterButton}
							onPress={this.onShowModalPicker.bind(this)}>
							<Text testID={`${rowData.symbol}wlFilter`} style={CommonStyle.textSubMediumWhite}>{this.selectedItem}</Text>
							<IonIcons name='md-arrow-dropdown' size={20} style={styles.iconModal} />
						</TouchableOpacity>
					</View>
					{
						this.props.login.isLogin ? <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
							<TouchableOpacity
								style={styles.priceWatchListButton}
								onPress={() => this.onAddToWatchList(this.state.isSelect)}>
								<Text style={CommonStyle.textSubMediumWhite}>{this.state.plusButton}</Text>
							</TouchableOpacity>
						</View> : null
					}

					<View style={{ width: this.props.login.isLogin ? '30%' : '80%', flexDirection: 'row', justifyContent: 'flex-end' }}>
						<TouchableOpacity
							onPress={this.changeChartType.bind(this, '$')}
							style={[styles.tabButton1, { backgroundColor: this.state.chartType === '$' ? config.colorVersion : '#ffffff' }]}>
							<Text testID={`${rowData.symbol}$Button`} style={[this.state.chartType === '$' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen, { fontWeight: this.state.chartType === '$' ? 'bold' : 'normal' }]}>
								{I18n.t('moneySymbol', { locale: this.props.setting.lang })}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={this.changeChartType.bind(this, '%')}
							style={[styles.tabButton2, { backgroundColor: this.state.chartType === '%' ? config.colorVersion : '#ffffff' }]}>
							<Text testID={`${rowData.symbol}%Button`} style={[this.state.chartType === '%' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen, { fontWeight: this.state.chartType === '%' ? 'bold' : 'normal' }]}>
								{I18n.t('percentSymbol', { locale: this.props.setting.lang })}</Text>
						</TouchableOpacity>
					</View>
				</View>
				{
					this.props.noNews ? null : <View>
						<View style={{ width: '100%' }}>
							<TouchableOpacity onPress={this.showModalNew.bind(this)}
								style={[styles.rowExpandNews, { width: '100%' }]}>
								<Text style={[CommonStyle.textMain, { color: '#10a8b2' }]}>{I18n.t('more', { locale: this.props.setting.lang })}</Text>
							</TouchableOpacity>
						</View>
						{
							!Controller.getLoginStatus() ? <View style={{ height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }} >
								<Text style={{ opacity: 0.87 }}>{I18n.t('newsPart1')} </Text>
								<Text style={{ color: '#007aff' }} onPress={() => openSignIn()}>{I18n.t('newsPart2')} </Text>
								<Text style={{ opacity: 0.87 }}>{I18n.t('newsPart3')}</Text>
							</View> : this.state.annLoading ? loadingAnn : <View>
								{
									this.state.announcements.map((e, i) => {
										if (i <= 2) {
											return <Announcement setting={this.props.setting} isConnected={this.props.isConnected} key={e.news_id} data={e} isConnected={this.props.isConnected} navigator={this.nav} i={i} listLength={(this.state.announcements && this.state.announcements.length) || 0} />
										}
									})
								}
							</View>
						}
					</View>
				}
				<ModalPicker
					listItem={this.listDisplay}
					onSelected={this.onSelected.bind(this)}
					selectedItem={this.selectedItem}
					visible={this.state.modalVisible}
					title='Select Time'
					onClose={this.onClose.bind(this)} />
			</View>
		);
	}

	renderRealtimePrice() {
		if (!this.isMount) return;
		this.setState({});
	}

	renderRealtimeChart() {
		this.state.isExpand && this.getDataChartCallback(this.dataChart, this.state.filterType);
	}

	manageHasRender(startIndex, endIndex) {
		if (startIndex == null || endIndex == null) return;
		if (this.props.currentIndex >= startIndex && this.props.currentIndex <= endIndex) {
			this.hasRender = true;
			this.emitToChild({ type: PTC_CHANNEL.ALLOW_RENDER, data: true });
			if (this.waitRenderPrice) {
				this.renderRealtimePrice();
				this.waitRenderPrice = false;
			}
			if (this.waitRenderHistorical) {
				this.renderRealtimeChart();
				this.waitRenderHistorical = false;
			}
		} else {
			this.hasRender = false;
			this.emitToChild({ type: PTC_CHANNEL.ALLOW_RENDER, data: false });
		}
	}

	onParentScroll() {
		Emitter.addListener(this.props.channelUpdateIndex, this.id, ({ startIndex, endIndex }) => {
			this.manageHasRender(startIndex, endIndex);
		});
	}

	checkActiveIndex(type) {
		if (!this.props.channelUpdateIndex) return true;
		if (this.hasRender) {
			if (type === REALTIME_TYPE.PRICE) {
				this.waitRenderPrice = false;
			} else {
				this.waitRenderHistorical = false;
			}
			return true;
		}
		if (type === REALTIME_TYPE.PRICE) {
			this.waitRenderPrice = true;
		} else {
			this.waitRenderHistorical = true;
		}
		return false;
	}

	showAndroidTouchID(params) {
		dataStorage.onAuthenticating = true
		dataStorage.dismissAuthen = this.hideAndroidTouchID
		this.setState({
			isAndroidTouchIdModalVisible: true,
			params
		})
	}
	hideAndroidTouchID() {
		dataStorage.onAuthenticating = false
		this.setState({
			isAndroidTouchIdModalVisible: false
		})
	}
	androidTouchIDFail(callback, numberFingerFailAndroid) {
		this.androidTouchID && this.androidTouchID.authenFail(callback, numberFingerFailAndroid)
	}

	authenPinFail() {
		this.authenPin && this.authenPin.authenFail()
	}

	// Android
	_onPinCompleted(pincode) {
		const store = Controller.getGlobalState()
		const login = store.login;
		const refreshToken = login.loginObj.refreshToken
		pinComplete(pincode, this.authenPin, this.showFormLoginSuccessCallback, this.authenPinFail.bind(this), this.params, refreshToken)
	}
	onChangeAuthenByFingerPrint() {
		this.authenPin && this.authenPin.hideModalAuthenPin()
		let objAndroidTouchIDFn = null;
		if (Platform.OS === 'android') {
			objAndroidTouchIDFn = {
				showAndroidTouchID: this.showAndroidTouchID,
				hideAndroidTouchID: this.hideAndroidTouchID,
				androidTouchIDFail: this.androidTouchIDFail
			}
		}
		this.auth.authentication(this.onOrder, null, objAndroidTouchIDFn);
	}
	onForgotPin() {
		Keyboard.dismiss();
		this.authenPin && this.authenPin.hideModalAuthenPin();
		setTimeout(() => {
			this.setState({
				isForgotPinModalVisible: true
			})
		}, 500)
	}
	removeItemStorageSuccessCallback() {
		dataStorage.numberFailEnterPin = 0;
		setTimeout(() => {
			if (Platform.OS === 'ios') {
				this.nav.showModal({
					screen: 'equix.SetPin',
					animated: true,
					animationType: 'slide-up',
					navigatorStyle: {
						statusBarColor: config.background.statusBar,
						statusBarTextColorScheme: 'light',
						navBarHidden: true,
						navBarHideOnScroll: false,
						navBarTextFontSize: 16,
						drawUnderNavBar: true,
						navBarNoBorder: true,
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new'
					}
				})
			} else {
				this.nav.showModal({
					screen: 'equix.SetPin',
					animated: true,
					animationType: 'slide-up',
					navigatorStyle: {
						statusBarColor: config.background.statusBar,
						statusBarTextColorScheme: 'light',
						navBarHidden: true,
						navBarHideOnScroll: false,
						navBarTextFontSize: 16,
						drawUnderNavBar: true,
						navBarNoBorder: true,
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new'
					}
				})
			}
		}, 500)
	}
	removeItemStorageErrorCallback() {
	}
	forgotPinSuccessCb() {
		console.log('forgot pin success');
		removeItemFromLocalStorage(dataStorage.userPin.email, this.removeItemStorageSuccessCallback, this.removeItemStorageErrorCallback)
	}

	onBackDropModalPress() {
		Keyboard.dismiss()
		this.setState({
			isPinCodeModalVisible: false
		})
	}

	render() {
		return (
			<View style={{ backgroundColor: '#FFF' }}>
				<CustomAccordion
					onChange={this.loadContent.bind(this)}
					renderHeader={this.renderHeader.bind(this)}
					renderContent={this.renderContent.bind(this)}
					isExpand={this.state.isExpand}
				/>
				{
					this.auth.showLoginForm(this.state.isForgotPinModalVisible, I18n.t('resetYourPin', { locale: this.props.setting.lang }), I18n.t('pleaseEnterYourPassword', { locale: this.props.setting.lang }), null, null, () => {
						this.setState({
							isForgotPinModalVisible: false
						});
					}, () => {
						this.props.loginActions.authError();
						this.setState({
							isError: true
						});
					}, () => {
						this.props.loginActions.authSuccess();
						this.setState({
							isForgotPinModalVisible: false,
							isError: false
						});
					}, () => {
						this.props.loginActions.authSuccess();
						this.setState({
							isForgotPinModalVisible: false,
							isError: false
						}, () => {
							this.forgotPinSuccessCb()
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
					authenByPinFn={this.showFormLogin.bind(this, this.onOrder, this.state.params)}
				/>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		trade: state.trade,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loginActions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Price);
