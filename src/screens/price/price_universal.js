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
	Keyboard
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
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin'
import TouchAlert from '../setting/auth_setting/TouchAlert';
import time from '../../constants/time';
import { Navigation } from 'react-native-navigation';
import * as api from '../../api';
import { getSymbolInfo } from '../../app.actions';
import * as fbemit from '../../emitter';
import performanceEnum from '../../constants/performance';
import Flag from '../../component/flags/flag';
import * as Business from '../../business';
import Enum from '../../enum';
import * as Util from '../../util';
import * as InvertTranslate from '../../invert_translate'
import * as Historical from '../../streaming/historical';
import * as Lv1 from '../../streaming/lv1';
import * as AllMarket from '../../streaming/all_market'
import * as StreamingBusiness from '../../streaming/streaming_business';
import Flashing from '../../component/flashing/flashing'
import XComponent from '../../component/xComponent/xComponent'
import * as Emitter from '@lib/vietnam-emitter';
import AnnouncementIcon from '../../component/announcement_icon/announcement_icon'
import * as NewsBusiness from '../../streaming/news'
import * as Channel from '../../streaming/channel'
import * as Controller from '../../memory/controller'
import { showNewOrderModal } from '~/navigation/controller.1'

const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;
const { width, height } = Dimensions.get('window');
const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const PTC_CHANNEL = Enum.PTC_CHANNEL;
const WATCHLIST = Enum.WATCHLIST;
const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;

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
		showNewsDetail(newID, this.props.navigator, this.props.app.isConnected);
	}

	render() {
		const { data } = this.state;
		const { i, listLength } = this.props;
		if (!data) {
			return (<View></View>);
		}
		if (listLength <= 3) {
			console.log(listLength - 1)
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
							data.link && data.link ? <Text style={[CommonStyle.textSubBlack, { width: '57%' }]} >{data.sign && Array.isArray(data.sign) && data.sign.includes('PriceSensitive') ? `! ${data.title}` : data.title}</Text>
								: <Text style={[CommonStyle.textSubNormalBlack, { width: '57%' }]} >{data.sign && Array.isArray(data.sign) && data.sign.includes('PriceSensitive') ? `* ! ${data.title}` : `* ${data.title}`}</Text>
						}
						<Text style={[CommonStyle.textSub, { textAlign: 'right', width: data.link ? '35%' : '35%' }]}>{timeagoInstance.format(data.updated, 'qe_local')}</Text>
					</View>
					{
						data.page_count && data.page_count > 0 ? (
							<View style={{ width: '100%', paddingTop: 6 }}>
								<Text style={CommonStyle.textFloatingLabel}>
									{data.page_count && data.page_count > 0 ? (data.page_count > 1 ? `${data.page_count} pages` : `${data.page_count} page`) : ''}
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
									{data.page_count && data.page_count > 0 ? (data.page_count > 1 ? `${data.page_count} pages` : `${data.page_count} page`) : ''}
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
		this.beginDay = getDateOnly(new Date()).getTime();
		const to = new Date();
		const addToDate = addDaysToTime(to, 1);
		this.endDay = addToDate.getTime() - 1;
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
		this.dataObject = null;
		this.count = 0;
		this.watchListName = 'Personal';
		this.firstData = null;
		this.type = '';
		this.canLoading = true;
		this.priceObject = {};
		this.isNewsToday = false;
		this.state = {
			// isPress: true,
			displayName: func.getDisplayNameSymbol(this.props.symbol),
			symbolInfo: {},
			filterType: PRICE_FILL_TYPE._1D,
			animation: '',
			chartType: '$',
			isLoading: true,
			isChartLoading: true,
			listData: [],
			ask_size: '',
			bid_size: '',
			company: null,
			code: this.props.symbol,
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
			isMoreAnn: false,
			annLoading: true,
			annInDay: false,
			isExpand: this.props.isOpen || false,
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
		this.showFormLoginSuccessCallback = null;
		this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
		this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
		this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
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
		this.getSymbolInfo = this.getSymbolInfo.bind(this);
		this.onAddToWatchList = this.onAddToWatchList.bind(this);
		this.childAdded = this.childAdded.bind(this);
		this.childRemoved = this.childRemoved.bind(this);
		this.onOrder = this.onOrder.bind(this);
		this.callbackSymbol = this.callbackSymbol.bind(this);
		this.getDataChartCallback = this.getDataChartCallback.bind(this);
		this.realtimeHistorical = this.realtimeHistorical.bind(this);
		this.getBaseInfo = this.getBaseInfo.bind(this);
		this.subHistorical = this.subHistorical.bind(this);
		this.unsubHistorical = this.unsubHistorical.bind(this);
		this.subAll = this.subAll.bind(this);
		this.unSubAll = this.unSubAll.bind(this);
		this.getSnapshotAll = this.getSnapshotAll.bind(this);
		this.subLv1 = this.subLv1.bind(this);
		this.unsubLv1 = this.unsubLv1.bind(this);
		this.realtimeLv1 = this.realtimeLv1.bind(this);
		this.mergeNewDataHistorical = this.mergeNewDataHistorical.bind(this);
		this.callbackSetChart = this.callbackSetChart.bind(this);
		this.registerParentReload = this.registerParentReload.bind(this);
		this.showValue = this.showValue.bind(this);
		this.showChangePercent = this.showChangePercent.bind(this);
		this.getFromDateToDate = this.getFromDateToDate.bind(this)
		this.checkNewsToday = this.checkNewsToday.bind(this)
		this.subFavoritesChange = this.subFavoritesChange.bind(this)

		this.nav = this.props.navigator;
		this.auth = new Auth(this.nav, this.props.login.email, this.props.login.token, this.showFormLogin);
		this.isPress = false
		this.registerParentReload();
		this.subFavoritesChange()
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isConnected === false && nextProps.isConnected === true) {
			return this.changeChartType(this.state.chartType);
		}
	}

	getBaseInfo() {
		return {
			symbol: this.props.symbol,
			exchange: func.getExchangeSymbol(this.props.symbol),
			interval: BAR_BY_PRICE_TYPE[this.state.filterType]
		};
	}

	subLv1() {
		return new Promise(resolve => {
			const { symbol, exchange } = this.getBaseInfo();
			if (!symbol || !exchange) return resolve();

			this.realtimeLv1();
		});
	}

	unsubLv1() {
		return new Promise(resolve => {
			const { symbol, exchange } = this.getBaseInfo();
			const event = StreamingBusiness.getChannelLv1(exchange, symbol);

			Emitter.deleteListener(event, this.id);
			return resolve()
		});
	}

	realtimeLv1() {
		const { symbol, exchange } = this.getBaseInfo();
		if (!symbol || !exchange) return;

		const channel = StreamingBusiness.getChannelLv1(exchange, symbol);
		Emitter.addListener(channel, this.id, newData => {
			this.priceObject = newData || {};
			this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: this.priceObject.trade_price }); // flashing
			this.setState({});
		});
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

	realtimeHistorical() {
		const { symbol, exchange, interval } = this.getBaseInfo();
		if (!symbol || !exchange || !interval) return;

		const event = StreamingBusiness.getChannelHistorical(exchange, symbol, interval);
		Emitter.addListener(event, this.id, data => {
			if (!this.props.isConnected) return;
			this.mergeNewDataHistorical(data);
			this.getDataChartCallback(this.dataChart);
		});
	}

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
		// // From 3:00 AM - before 4:13 PM Sysney Au -> close = '--'
		// let fromTime = new Date();
		// let toTime = new Date();
		// let currentTime = new Date();
		// // From
		// fromTime.setUTCDate((new Date()).getDate() - 1)
		// fromTime.setUTCHours(16)
		// fromTime.setUTCMinutes(0)
		// fromTime.setUTCSeconds(0)
		// let fromTimeMs = fromTime.getTime()
		// // To
		// toTime.setUTCDate((new Date()).getDate())
		// toTime.setUTCHours(5)
		// toTime.setUTCMinutes(13)
		// toTime.setUTCSeconds(0)
		// let toTimeMs = toTime.getTime();
		// // Current
		// let currentTimeMs = currentTime.getTime();
		// if (currentTimeMs >= fromTimeMs && currentTimeMs < toTimeMs) {
		//     return '--'
		// }
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
			const tradingHalt = snap ? snap.trading_halt : false;
			this.setState({ tradingHalt }, () => {
				logDevice('info', `Updated Halt of ${this.props.symbol}: ${tradingHalt}`)
			});
		}).catch(err => {
			logDevice('info', `PRICE UNIVERSAL TRADING HALT ERROR: ${err}`)
			console.log(err)
		})
	}

	subAll() {
		return new Promise(resolve => {
			const listPromise = [
				this.subLv1(),
				this.subHistorical()
			];
			Promise.all(listPromise).then(resolve);
		});
	}

	unSubAll() {
		return new Promise(resolve => {
			const listPromise = [
				this.unsubLv1(),
				this.unsubHistorical()
			];
			Promise.all(listPromise).then(resolve);
		});
	}

	checkNewsToday() {
		return new Promise(resolve => {
			const symbol = this.props.symbol || ''
			const checkUrl = api.checkNewsTodayUrl(symbol);
			api.requestData(checkUrl).then(data => {
				const symbol = Object.keys(data)[0] || ''
				if (symbol) {
					const isNewsToday = data[symbol]
					if (isNewsToday) {
						dataStorage.listNewsToday[symbol] = true
					}
					return resolve(isNewsToday)
				}
				return resolve(false);
			}).catch(error => {
				return resolve(false);
				// console.log(error)
			})
		})
	}

	async getSnapshotAll() {
		const isPriceStreaming = Controller.isPriceStreaming();
		const { symbol, exchange } = this.getBaseInfo();

		const listPromise = [
			AllMarket.getData(Enum.STREAMING_MARKET_TYPE.QUOTE, [{ symbol, exchange }], isPriceStreaming),
			Business.getDataChartPrice(this.props.symbol, this.state.filterType),
			this.checkNewsToday()
		];
		const data = await Promise.all(listPromise);
		this.props.doneLoadData && this.props.doneLoadData(Enum.ID_FORM.PRICE_UNIVERSAL);
		this.priceObject = data[0] ? data[0][0] || {} : {};
		this.isNewsToday = data[2] || false;
		this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: this.priceObject.trade_price });
		this.dataChart = data[1] || {};
		this.setState({}, () => {
			const symbol = this.props.symbol
			NewsBusiness.updateAnnouncementIcon(symbol)
		});
		this.getDataChart();
	}

	registerParentReload() {
		if (!this.props.parentChannel) return;
		Emitter.addListener(this.props.parentChannel, this.id, () => {
			this.getSnapshotAll();
		});
	}

	async componentDidMount() {
		super.componentDidMount()

		try {
			this.isMount = true;
			const channel = StreamingBusiness.getChannelHalt(this.props.symbol);
			Emitter.addListener(channel, this.id, this.updateHalt.bind(this));
			this.props.registerChange(this.props.symbol, this.changedIndex);
			if (this.props.symbol) {
				checkTradingHalt(this.props.symbol).then(data => {
					const tradingHalt = data;
					this.setState({ tradingHalt });
				});
			}

			if (Controller.isPriceStreaming()) await this.subAll();
			this.getSnapshotAll();

			const userID = Controller.getUserId()
			const apiType = 'check-exist'
			api.actionUserWatchListSymbol(
				userID,
				this.props.symbol,
				apiType,
				this.childAdded,
				this.childRemoved
			);

			!this.props.noNews && this.getAnnouncement();
		} catch (error) {
			logAndReport('componentDidMount price exception', error, 'componentDidMount price');
		}
	}

	componentWillUnmount() {
		this.isMount = false;
		fbemit.deleteEmitter('halt')
		this.unsubHistorical();
		this.timeOut && clearTimeout(this.timeOut);

		super.componentWillUnmount();
	}

	getSymbolInfo() {
		fbemit.addListener(this.props.type, `${this.props.symbol}`, data => this.callbackSymbol(data));
	}

	callbackSymbol(data) {
		const company = data ? (data.company_name || data.company || null) : (dataStorage.symbolEquity[this.props.symbol] ? (dataStorage.symbolEquity[this.props.symbol].company_name || dataStorage.symbolEquity[this.props.symbol].copany || null) : null)
		this.setState({ company })
	}

	changedIndex(isOpen) {
		if (!this.isMount) return;
		if (isOpen === this.state.isExpand) return;
		if (isOpen) {
			this.subHistorical().then(() => {
				this.setState({ isExpand: isOpen });
			});
		} else {
			this.unsubHistorical().then(() => {
				this.setState({ isExpand: isOpen });
			});
		}
	}

	componentWillMount() {
		this.getAnnouncement();
	}

	getFromDateToDate() {
		// News truyền thêm from to còn không thì lấy news trong ngày -> to = thời điểm hiện tại - from = lùi về 0:00 7h ngày trước VD: from = 0h00 1/8 -> 7/8
		const to = new Date().getTime();
		const from = Util.getStartPreviousDay(to, 6)
		return {
			from,
			to
		}
	}

	getAnnouncement() {
		try {
			const newTxt = Util.encodeSymbol(this.props.symbol);
			const newType = Enum.TYPE_NEWS.RELATED
			const pageID = 1
			const pageSize = 3 // top 3
			let url = api.getNewsUrl(newType, '', newTxt, pageID, pageSize)
			url = `${url}&duration=week`
			api.requestData(url).then(data => {
				let res = []
				if (data) {
					res = data.data || [];
				}
				this.setState({
					announcements: res,
					annLoading: false
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
					height: 13,
					width: 12,
					borderRadius: 1,
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<Text style={{
						fontSize: CommonStyle.fontSizeXS - 2,
						color: 'white',
						fontFamily: CommonStyle.fontFamily
					}}>{text}</Text>
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

	onOrder() {
		try {
			logDevice('info', ' onOrder was called: ' + this.props.symbol);
			const data = this.priceObject;
			const exchange = data.exchange;
			const type = this.type;
			const code = this.props.symbol || '';
			const exchanges = this.state.symbolInfo && this.state.symbolInfo.exchanges ? this.state.symbolInfo.exchanges : null;
			const listExchange = getExchange(exchanges);
			if (!Controller.getLoginStatus()) return;
			const isParitech = (exchange + '').includes('ASX');
			logDevice('info', 'push Form onOrder: ' + this.props.symbol);
			const passProps = {
				displayName: this.state.displayName,
				isBuy: type === 'buy',
				code,
				isParitech,
				callBackAfterPopup: this.props.callBackAfterPopup ? this.props.callBackAfterPopup.bind(this) : null,
				changePercent: data.change_percent ? formatNumberNew2(data.change_percent, 2) : 0,
				tradePrice: data.trade_price ? formatNumberNew2(data.trade_price, 3) : null,
				exchanges: listExchange,
				limitPrice: type === tradeTypeString.BUY ? (data.ask_price ? data.ask_price : 0) : (data.bid_price ? data.bid_price : 0),
				stopPrice: data.trade_price ? data.trade_price : 0,
				volume: 0,
				isReSub: true,
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

	showModalNew() {
		this.nav.push({
			animated: true,
			animationType: 'slide-horizontal',
			screen: 'equix.Search',
			backButtonTitle: '',
			passProps: {
				symbol: this.props.symbol,
				displayName: this.state.displayName,
				typeNews: 'all',
				isLoading: true,
				disabledSuggestCode: true
			},
			navigatorStyle: CommonStyle.navigatorSpecialNoHeader
		});
	}

	setTimeoutClickable() {
		this.isPress = true;
		setTimeout(() => {
			this.isPress = false;
		}, 1500);
	}

	subFavoritesChange() {
		const channelName = Channel.getChannelWatchlistChanged(WATCHLIST.USER_WATCHLIST)
		Emitter.addListener(channelName, this.id, () => {
			const isSymbolInWatchlist = func.checkSymbolInPriceboardFavorites(this.props.symbol)
			if (isSymbolInWatchlist === this.state.isSelect) return

			isSymbolInWatchlist
				? this.setState({ plusButton: `- ${I18n.t('favorites', { locale: this.props.setting.lang })}`, isSelect: true })
				: this.setState({ plusButton: `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`, isSelect: false })
		})
	}

	mergeNewDataHistorical(newData) {
		const isWeekend = checkWeekend();
		const dataSelect = this.state.filterType;
		const val = this.dataChart;
		if (val && val.noData) {
			this.dataChart = isWeekend && (dataSelect === '1Y' || dataSelect === '3Y')
				? { [newData.updated]: newData }
				: {};
		} else {
			const lastKey = parseInt(Object.keys(val).sort().pop());
			const timePrice = newData.updated;
			const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice) // Check xem đã có bar ngày hiện tại hay chưa
			if (Controller.isPriceStreaming() ||
				(isWeekend && isDrawBarChartNow && (dataSelect === '1Y' || dataSelect === '3Y'))) {
				val[timePrice] = val[timePrice]
					? {
						...val[timePrice],
						...newData
					}
					: newData;
				val[timePrice].close = val[timePrice].close || val[timePrice].trade_price || 0;
			}
		}
	}

	getDataChartCallback(val) {
		const isChartDay = this.state.filterType === PRICE_FILL_TYPE._1D;
		this.isReady = true;
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
				if (this.state.filterType !== '3Y') {
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
						marker: `${renderTime(timeStamp, labelTimeFormat)}\n ${this.props.displayName}: ${formatNumberNew2(dataTemp, 2)}${this.state.chartType === '%' ? '%' : ''}`
					})
				}
				const temp = {};
				const temp2 = {};
				const closeMarker = data.close === 0 ? '--' : formatNumberNew2(data.close, 3);
				marker = `${renderTime(timeStamp, labelTimeFormat)} - O: ${formatNumberNew2(data.open, 3)}  H: ${formatNumberNew2(data.high, 3)}  L: ${formatNumberNew2(data.low, 3)}  C: ${closeMarker}  Vol: ${largeValue(data.volume)}`
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
			}, () => {
				this.canLoading = true;
			})
		}
	}

	getDataChart() {
		try {
			this.maxValue = -99999999999999;
			this.minValue = 999999999999999;
			this.getDataChartCallback(this.dataChart);
		} catch (error) {
			logAndReport('getDataChart price exception', error, 'getDataChart price');
		}
	}

	successCbOnAddToWatchList(isRemove) {
		if (isRemove) {
			this.setState({ plusButton: `+ ${I18n.t('favorites', { locale: this.props.setting.lang })}`, isSelect: false });
			// fbemit.emit('realTimeWatchList', 'onWatchList');
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
			let index = 0;
			let action = 'add';
			this.setState({
				plusButton: isRemove ? I18n.t('Removed', { locale: this.props.setting.lang }) : I18n.t('Added', { locale: this.props.setting.lang })
			});
			if (isRemove) {
				action = 'remove'
				index = listWatchList.indexOf(symbol)
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

	async callbackSetChart() {
		this.dataChart = await Business.getDataChartPrice(this.props.symbol, this.state.filterType)
		this.getDataChart();
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

	showValue(isLoading, value, isFormat = true) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return isFormat
				? formatNumberNew2(value, 3)
				: value
		}
	}

	showChangePercent(isLoading, value) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return `${formatNumberNew2(value, 2)}%`;
		}
	}

	render() {
		const user = Controller.getUserInfo()
		const count = 5;
		const point = (this.maxValue - this.minValue) / count;
		const flagIcon = Business.getFlag(this.props.symbol);
		const company = dataStorage.symbolEquity[this.props.symbol] ? (dataStorage.symbolEquity[this.props.symbol].company_name || dataStorage.symbolEquity[this.props.symbol].company || '') : (this.state.company || this.props.company || '')
		return (
			<View style={{ flex: 1 }}>
				{this.props.isBackground ? <View /> : <View style={[CommonStyle.searchBarContainer, { width: '100%' }]}>
					<TouchableOpacity style={CommonStyle.searchBar} onPress={this.props.onSearch}>
						{
							Controller.isPriceStreaming()
								? null
								: this.state.isDefault ? (
									<Icon name='ios-search' style={CommonStyle.iconSearch} />
								) : null
						}
						<Text style={CommonStyle.searchPlaceHolder}>{`${this.priceObject.tradingHalt ? `!` : ``} ${getDisplayName(this.props.symbol)} (${this.showChangePercent(this.props.isLoading, this.priceObject.change_percent)})`}</Text>
					</TouchableOpacity>
				</View>}
				<Animatable.View style={{ backgroundColor: '#FFF' }} ref="view" animation={this.state.animation} easing={'ease-in-cubic'} duration={1} onAnimationEnd={() => {
					Animated.timing(
						this.state.heightAn,
						{
							duration: 200,
							toValue: 0
						}
					).start();
					this.onAddToWatchList(this.state.isSelect);
				}}>
					<View>
						<Animated.View style={{
							paddingHorizontal: CommonStyle.paddingSize,
							paddingVertical: 6,
							backgroundColor: 'white',
							width: '100%'
						}}>
							<View style={[{ flexDirection: 'row', paddingVertical: 2, alignItems: 'center' }]}>
								<Text style={[CommonStyle.textMainRed, { fontSize: CommonStyle.font30 }]}>{this.state.tradingHalt ? '! ' : ''}</Text>
								<Text testID={`${this.props.symbol}HeaderWL`} style={[CommonStyle.textMain, { fontSize: CommonStyle.font30 }]}>{this.state.displayName}</Text>
								<View style={{ marginLeft: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
									<Flag
										style={{ marginRight: 9 }}
										type={'flat'}
										code={flagIcon}
										size={18}
									/>
									<AnnouncementIcon
										isNewsToday={this.isNewsToday}
										symbol={this.props.symbol}
										containerStyle={{
											backgroundColor: this.isNewsToday ? '#f28bb0' : '#0000001e',
											height: 13,
											width: 14,
											borderRadius: 1,
											justifyContent: 'center',
											alignItems: 'center'
										}}
										contentStyle={{
											fontSize: CommonStyle.fontSizeXS - 2,
											color: 'white',
											fontFamily: CommonStyle.fontFamily
										}}
									/>
								</View>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<Text testID={`${this.props.symbol}NameWL`} style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeXS }]}>{(company + '').toUpperCase()}</Text>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={{ width: '50%', marginTop: 16 }}>
									<Text style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeS }]}>{`${I18n.t('quantity', { locale: this.props.setting.lang })} @ ${I18n.t('lastTrade', { locale: this.props.setting.lang })}`}</Text>
								</View>
								<View style={{ width: '50%', marginTop: 16 }}>
									<Text style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeS, textAlign: 'right' }]}>{`${I18n.t('changePercent', { locale: this.props.setting.lang })}`}</Text>
								</View>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<View style={{ width: '50%', marginTop: 8 }}>
									<View style={{ flexDirection: 'row' }}>
										<Text testID={`${this.props.symbol}SizeWL`} numberOfLines={2} style={[CommonStyle.textSub, { textAlign: 'left', fontWeight: 'bold' }]}>{`${this.showValue(this.props.isLoading, this.priceObject.trade_size, false)} @ `}</Text>
										<Flashing
											value={this.priceObject.trade_price}
											parentID={this.id}
											field={PTC_CHANNEL.TRADE_PRICE}
											typeFormRealtime={TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL}
										/>
									</View>

								</View>
								<View style={{ width: '50%', marginTop: 8 }}>
									<HighLightText style={[CommonStyle.textSubNoColor, { textAlign: 'right', fontWeight: 'bold' }]}
										addSymbol
										base={formatNumberNew2(this.priceObject.change_point, 3)}
										testID={`${this.props.symbol}changePoiWL`}
										value={`${this.showValue(this.props.isLoading, this.priceObject.change_point)} (${this.showChangePercent(this.props.isLoading, this.priceObject.change_percent)})`} />
								</View>
							</View>
						</Animated.View>
						<View style={{ width: '100%', marginTop: 2 }}>
							<View style={styles.rowExpand}>
								<View style={styles.expandLine}>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSub, { width: '20%' }]}>{I18n.t('openSearch', { locale: this.props.setting.lang })}</Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '28%' }]}>{this.showValue(this.props.isLoading, this.priceObject.open)}</Text>
									<Text style={{ width: '4%' }}></Text>
									<Text testID={`${this.priceObject.previous_close}wlO`} style={[CommonStyle.textSub, { width: '27%' }]}>{I18n.t('previousClose', { locale: this.props.setting.lang })}</Text>
									<Text testID={`${this.priceObject.previous_close}wlO`} style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}>{this.showValue(this.props.isLoading, this.priceObject.previous_close)}</Text>
								</View>
								<View style={styles.expandLine}>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSub, { width: '20%' }]}>{I18n.t('high', { locale: this.props.setting.lang })}</Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '28%' }]}>{this.showValue(this.props.isLoading, this.priceObject.high)}</Text>
									<Text style={{ width: '4%' }}></Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSub, { width: '27%' }]}>{I18n.t('close', { locale: this.props.setting.lang })}</Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}>{this.props.isLoading ? '--' : this.showPriceClose(this.priceObject.close)}</Text>
								</View>
								<View style={styles.expandLine}>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSub, { width: '20%' }]}>{I18n.t('low', { locale: this.props.setting.lang })}</Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '28%' }]}>{this.showValue(this.props.isLoading, this.priceObject.low)}</Text>
									<Text style={{ width: '4%' }}></Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSub, { width: '27%' }]}>{I18n.t('todayVolume', { locale: this.props.setting.lang })}</Text>
									<Text testID={`${this.props.symbol}wlO`} style={[CommonStyle.textSubBold, { width: '21%', textAlign: 'right' }]}>{this.props.isLoading ? '--' : formatNumber(this.priceObject.volume <= 0 ? '--' : largeValue(this.priceObject.volume))}</Text>
								</View>
							</View>
							<View style={[styles.buttonExpand]}>
								<ButtonBox buy
									testID={`${this.props.symbol}SellButton`}
									disableAll={!func.isAccountActive() || dataStorage.isNotHaveAccount || !this.props.login.isLogin || (user && (user.email === this.emailDefault)) || !this.props.app.isConnected || dataStorage.loginUserType === 'REVIEW'}
									onPress={() => {
										if (this.isPress) return;
										this.setTimeoutClickable()
										this.type = 'buy';
										this.authFunction(this.onOrder.bind(this));
									}}
									width={'48%'}
									value1={this.priceObject.bid_size ? formatNumber(this.priceObject.bid_size) : 0}
									value2={this.priceObject.bid_price ? formatNumberNew2(this.priceObject.bid_price, 3) : '--'} />
								<View style={{ width: '4%' }}></View>
								<ButtonBox
									testID={`${this.props.symbol}BuyButton`}
									disableAll={!func.isAccountActive() || dataStorage.isNotHaveAccount || !this.props.login.isLogin || (user && (user.email === this.emailDefault)) || !this.props.app.isConnected || dataStorage.loginUserType === 'REVIEW'}
									onPress={() => {
										if (this.isPress) return;
										this.setTimeoutClickable()
										this.type = 'sell';
										this.authFunction(this.onOrder.bind(this));
									}}
									width={'48%'}
									value1={this.priceObject.ask_price ? formatNumberNew2(this.priceObject.ask_price, 3) : '--'}
									value2={this.priceObject.ask_size ? formatNumber(this.priceObject.ask_size) : 0} />
							</View>
							<View style={styles.chartContainer}>
								{
									this.state.isChartLoading
										? <View style={[CommonStyle.progressBarWhite]}>
											<ProgressBar />
										</View>
										: (
											this.state.chartType === '$' ? <ChartNew
												testId={`${this.props.symbol}$ChartWL`}
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
											/> : <Chart
													testId={`${this.props.symbol}%Chart`}
													data={this.state.listData}
													code={this.props.symbol}
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
										<Text testID={`${this.props.symbol}wlFilter`} style={CommonStyle.textSubMediumWhite}>{this.selectedItem}</Text>
										<IonIcons name='md-arrow-dropdown' size={20} style={styles.iconModal} />
									</TouchableOpacity>
								</View>
								{
									this.props.login.isLogin ? <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
										<TouchableOpacity
											style={styles.priceWatchListButton}
											onPress={() => {
												if (this.props.typePrice) {
													this.setState({
														isExpand: false
													}, () => {
														this.setState({
															animation: 'pulse'
														});
													});
												} else {
													this.onAddToWatchList(this.state.isSelect);
												}
											}}>
											<Text style={CommonStyle.textSubMediumWhite}>{this.state.plusButton}</Text>
										</TouchableOpacity>
									</View> : null
								}

								<View style={{ width: this.props.login.isLogin ? '30%' : '80%', flexDirection: 'row', justifyContent: 'flex-end' }}>
									<TouchableOpacity
										onPress={this.changeChartType.bind(this, '$')}
										style={[styles.tabButton1, { backgroundColor: this.state.chartType === '$' ? config.colorVersion : '#ffffff' }]}>
										<Text testID={`${this.props.symbol}$Button`} style={[this.state.chartType === '$' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen, { fontWeight: this.state.chartType === '$' ? 'bold' : 'normal' }]}>
											{I18n.t('moneySymbol', { locale: this.props.setting.lang })}</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={this.changeChartType.bind(this, '%')}
										style={[styles.tabButton2, { backgroundColor: this.state.chartType === '%' ? config.colorVersion : '#ffffff' }]}>
										<Text testID={`${this.props.symbol}%Button`} style={[this.state.chartType === '%' ? CommonStyle.textSubMediumWhite : CommonStyle.textSubGreen, { fontWeight: this.state.chartType === '%' ? 'bold' : 'normal' }]}>
											{I18n.t('percentSymbol', { locale: this.props.setting.lang })}</Text>
									</TouchableOpacity>
								</View>
							</View>

							<ModalPicker listItem={this.listDisplay}
								onSelected={this.onSelected.bind(this)}
								selectedItem={this.selectedItem}
								visible={this.state.modalVisible}
								title='Select Time'
								onClose={this.onClose.bind(this)} />
						</View>
					</View>
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
				</Animatable.View>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		trade: state.trade,
		app: state.app,
		search: state.search,
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
