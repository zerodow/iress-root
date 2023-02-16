import React, { Fragment } from 'react';
import {
	View, Text, TouchableOpacity,
	Keyboard,
	Animated,
	Platform,
	ActivityIndicator,
	TextInput,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	UIManager,
	Dimensions,
	ImageBackground,
	Image, DeviceEventEmitter,
	NativeAppEventEmitter
} from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import {
	logDevice,
	formatNumber, formatNumberNew2, logAndReport,
	getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime
} from '../../lib/base/functionUtil';
import * as DateTime from '~/lib/base/dateTime.js';
import * as AllMarket from '../../streaming/all_market'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business'
import styles from './style/order';
import { connect } from 'react-redux';
import { iconsMap } from '../../utils/AppIcons';
import { bindActionCreators } from 'redux';
import * as newOrderActions from './order.actions';
import userType from '../../constants/user_type';
import { func, dataStorage } from '../../storage';
import { setCurrentScreen } from '../../lib/base/analytics';
import I18n from '../../modules/language';
import orderTypeEnum from '../../constants/order_type';
import orderTypeString from '../../constants/order_type_string';
import CommonStyle from '~/theme/theme_controller'
import * as PureFunc from '../../utils/pure_func'
import config from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import loginUserType from '../../constants/login_user_type'
import analyticsEnum from '../../constants/analytics';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import * as api from '../../api';
import * as fbEmit from '../../emitter';
import Enum from '../../enum';
import { unregisterAllMessage } from '../../streaming';
import * as Util from '../../util';
import * as Business from '../../business';
import * as appActions from '../../app.actions';
import * as portfolioActions from '~s/portfolio/Redux/actions'
import * as Translate from '../../invert_translate';
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid';
import Quantity from '@component/price_child/quantity';
import PureCollapsible from '@component/rn-collapsible/pure-collapsible';
import TransitionView from '~/component/animation_component/transition_view'
import CustomButton from '../../component/custom_button/custom_button_watchlist'
// Lib
import moment from 'moment'

// Component
import TabScroll from './TabScroll'
import XComponent from '@component/xComponent/xComponent';
import Flag from '@component/flags/flag'
import PriceOrder from './price_order'
import PromptNew from '@component/new_prompt/prompt_new'
import PickerCustom from './new_picker';
import NotifyOrder from '@component/notify_order';
import NetworkWarning from '~/component/network_warning/network_warning.1';
import Warning from '@component/warning/warning';
import SwiperMarketDepthRealtime from '../market_depth/swiper_market_depth_realtime';
import SwiperMarketDepth from '../market_depth/swiper_market_depth';
import TenTrade from '../market_depth/swiper_10_trades';
import TenTradeRealtime from '../market_depth/swiper_10_trades_realtime';
import ScreenId from '../../constants/screen_id';
import NewOrderNavigator from './new_order_navigator';
import NewOrderNavigatorManagementGroup from './new_order_navigator_management_group';
import SearchBar from './search_bar';
import Flashing from '@component/flashing/flashing.1';
import SearchResult from './order_search';
import ChangePoint from './change_point'
import ChangePercent from './change_percent'
import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import * as Controller from '../../memory/controller'
import * as UserPriceSource from '../../userPriceSource';
import * as RoleUser from '../../roleUser';
import * as ManageConection from '../../manage/manageConnection';
import DatePicker from '../../component/date_picker/date_picker.2';
import DeviceInfo from 'react-native-device-info';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Header from '../../../src/component/headerNavBar/index';
import Icons from '../../../src/component/headerNavBar/icon';
import pinBackground from '~/img/background_mobile/pinVersion2Background.png'
import pinBackground1 from '~/img/background_mobile/group7.png'
import ChangePointPercent from './change_point_percent'
import FlashingWrapper from './flashing'
// Depth cos summary
import Summary from './components/Detail/DepthCos/Summary'
import MarketDepth from './components/Detail/DepthCos/MarketDepth'
import CourseOfSales from './components/Detail/DepthCos/CourseOfSales'
import * as ManageAppState from '~/manage/manageAppState';

const axios = require('axios');
const infoUrl = 'https://om-dev3.equixapp.com/v3/info';
const userAgent = dataStorage.userAgent;
const headerObj = {
	Authorization: `Bearer ${Controller.getAccessToken()}`,
	'Content-Type': 'application/json',
	'user-agent': userAgent
};
const AnimatedIcon = Animated.createAnimatedComponent(Icon);
const JSON = Util.json;
const CONST_STYLE = CommonStyle;
const TIME_OUT_INPUT = 300;
const TIMEOUT_REQUEST = 10000;
const {
	SYMBOL_CLASS, SYMBOL_CLASS_DISPLAY, FLASHING_FIELD, PRICE_DECIMAL,
	EXCHANGE_STRING, NOTE_STATE, PTC_CHANNEL, KEYBOARD_TYPE, TYPE_VALID_CUSTOM_INPUT,
	ORDER_TYPE_STRING, DURATION_STRING, DURATION_MAPPING_STRING_CODE, DEFAULT_VAL, EXCHANGE_CODE,
	DURATION_CODE, ACCOUNT_STATE, CURRENCY, ICON_NAME, ID_ELEMENT, SCREEN, EVENT, CHANNEL, ACTION_ORD: ACTION
} = Enum;
const { State: TextInputState } = TextInput;

const keyLast = {
	LIMIT_PRICE: 'limitPrice',
	STOP_PRICE: 'stopPrice',
	DURATION: 'duration',
	EXCHANGE: 'exchange',
	DATE: 'date',
	DATE_PERIOD: 'datePeriod',
	IS_DATE_PICKER_USED: 'isDatePickerUsed'
};
export const TYPE_PICKER = {
	ORDER_TYPE: 'ORDER_TYPE',
	DURATION: 'DURATION',
	EXCHANGE: 'EXCHANGE'
}
export class Order extends XComponent {
	constructor(props) {
		super(props);
		this.emitter =
			Platform.OS === 'android'
				? DeviceEventEmitter
				: NativeAppEventEmitter;
		//  bind function
		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.onClose = this.onClose.bind(this);
		this.bindAllFunc();
		ManageAppState.registerAppStateChangeHandle(ScreenId.ORDER, this.clickRefreshPrice)
		//  init state and dic
		this.init();

		axios.get(infoUrl, {
			headers: headerObj,
			timeout: TIMEOUT_REQUEST
		}).then(res => {
			this.dic.timestamp = new Date(res.data.timeserver);
		}).catch(error => {
			logDevice('error', 'Axios get timeserver', error);
		}).finally(() => {
			this.setDicOrders();
		});
		this.isFirst = true;
		if (this.dic.code) {
			this.isFirst = false;
			this.setCode(this.dic.code, this.getCompanyName(this.dic.symbolObject), this.dic.symbolObject.class, true);
		}
		this.isChangeTextVolume = false;
		this.isChangeTextStop = false;
		this.isChangeTextLimit = false;
		this.scrollValue = new Animated.Value(0);
		this.scrollContainerValue = new Animated.Value(0);
		this.listClassSymbol = []
		this.addListenerForContainerScroll();
		this.addListenerForChildrenScroll()
	}

	addListenerForContainerScroll() {
		this.scrollContainerValue.addListener(({ value }) => {
			console.log('VALUE1: ', value)
			// this.lol()
			const threshold = 200;
			if (value > threshold) {
				Animated.timing(this.dic.translateHeader, {
					toValue: -500,
					duration: 500,
					useNativeDriver: true
				}, () => {
					let x = this.dic.translateHeader
				}).start()
				// this.setState({ isSearch: true });
			} else if (value <= threshold) {
				Animated.timing(this.dic.translateHeader, {
					toValue: 0,
					duration: 500,
					useNativeDriver: true
				}, () => {
					let x = this.dic.translateHeader
				}).start()
				// this.setState({ isSearch: false });
			}
			// this.timeoutScrollContainer && clearTimeout(this.timeoutScrollContainer);
			// this.timeoutScrollContainer = this.setTimeout(() => {

			// }, 50)
		});
	}

	addListenerForChildrenScroll = () => {
		this.scrollValue.addListener(({ value }) => {
			// this.lol()
			console.log('VALUE2: ', value)
		})
	}

	lol() {
		this.timoutScroll && clearTimeout(this.timeoutScroll)
		this.timeoutScroll = setTimeout(() => {
			if (this.dic.scrollCb && Object.keys(this.dic.scrollCb).length) {
				for (const key in this.dic.scrollCb) {
					const fnCb = this.dic.scrollCb[key];
					fnCb && fnCb()
				}
			}
		}, 150)
	}

	init() {
		try {
			this.dic = {
				currentTab: 0,
				depthData: {},
				tradesData: [],
				listRefPicker: [],
				combodityInfo: {},
				scrollCb: {},
				isChangeSymbolDisconnect: false,
				iconCollapse: {
					Detail: new Animated.Value(this.props.volume ? 0 : 1),
					marketDepth: new Animated.Value(0),
					courseOfSales: new Animated.Value(0)
				},
				isExpand: {
					Detail: !!this.props.volume,
					marketDepth: true,
					courseOfSales: true
				},
				listDuration: [],
				listOrderType: [],
				translateYValue: new Animated.Value(0),
				heightLastTradeHeader: new Animated.Value(0),
				heightSymbolName: new Animated.Value(35),
				heightCompanyName: new Animated.Value(45),
				heightInfoDefault: new Animated.Value(80),
				opacityAnim: new Animated.Value(1),
				opacityAnimReverse: new Animated.Value(0),
				opacityLastTradeHeader: new Animated.Value(0),
				translateHeader: new Animated.Value(-500),
				opacityOrder: new Animated.Value(1),
				heightLastTradeDetail: 0,
				isPin: false,
				isSearch: false,
				positions: {},
				listExchange: [],
				dicExchange: {},
				isAuBySymbol: true,
				isNSXSymbol: Business.isNSXSymbol(this.props.code),
				classSelectedSymbol: this.getClassBySymbol({ symbol: this.props.code }),
				datePickerRef: null,
				isLoadingPrice: false,
				setTimeUpdate: null,
				idForm: Util.getRandomKey(),
				priceObject: {},
				code: this.props.code || '',
				symbolObject: Business.getObjectSymbol(this.props.code) || {},
				volume: this.props.volume || 0,
				userVolume: 0,
				isBuy: this.props.isBuy != null ? this.props.isBuy : true,
				date: null,
				limitPrice: 0,
				stopPrice: 0,
				isConnected: true,
				requestID: null,
				currentAccount: Util.cloneFn(dataStorage.currentAccount || {}),
				cashAvailable: 0,
				menuSelected: dataStorage.menuSelected,
				limitPriceChange: false,
				stopPriceChange: false,
				timeoutTip: null,
				keyboardDidShowListener: null,
				keyboardDidHideListener: null,
				typeForm: 'order',
				feeObj: {},
				nav: this.props.navigator,
				perf: new Perf(performanceEnum.load_data_order),
				buyUpper: I18n.t('buyUpper'),
				sellUpper: I18n.t('sellUpper'),
				isPress: false,
				channelLoadingOrder: OrderStreamingBusiness.getChannelLoadingOrder(),
				channelPriceOrder: OrderStreamingBusiness.getChannelPriceOrder(),
				datePeriodTextInputRef: null,
				datePeriodPlaceholder: I18n.t('datePeriodFormat') + '...',
				datePeriod: '',
				isDatePickerUsed: null,
				datePeriodError: '',
				error: {
					highlighted: null,
					highlightedWord: '',
					highlightedStyle: null
				},
				timestamp: new Date()
			};
			this.getOrderType();
			this.getDuration();
			this.getExchange();
			this.textSearch = '';
			this.state = {
				isSearch: !this.props.code,
				tipStep: 0,
				setSwipeGuide: false,
				activeDot: 0,
				tradingHalt: false,
				type: this.dic.isBuy,
				scrollAble: true,
				isCheckVetting: false
			};
			return true;
		} catch (error) {
			return false;
		}
	}

	bindAllFunc() {
		this.getDuration = this.getDuration.bind(this);
		this.getOrderType = this.getOrderType.bind(this);
		this.getExchange = this.getExchange.bind(this);
		this.renderNavbar = this.renderNavbar.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.formatBidPrice = this.formatBidPrice.bind(this);
		this.formatAskPrice = this.formatAskPrice.bind(this);
		this.updateAskPriceTrend = this.updateAskPriceTrend.bind(this);
		this.updateBidPriceTrend = this.updateBidPriceTrend.bind(this);
		this.isAskPriceChange = this.isAskPriceChange.bind(this);
		this.isBidPriceChange = this.isBidPriceChange.bind(this);
		this.isTradePriceChange = this.isTradePriceChange.bind(this);
		this.updateTrend = this.updateTrend.bind(this);
		this.formatTradePrice = this.formatTradePrice.bind(this);
		this.updateHaltFromSymbolInfo = this.updateHaltFromSymbolInfo.bind(this);
		this.onPressSearch = this.onPressSearch.bind(this);
		this.updateHaltRealtime = this.updateHaltRealtime.bind(this);
		this.searchAccount = this.searchAccount.bind(this);
		this.pubDepthData = this.pubDepthData.bind(this);
		this.pubCosData = this.pubCosData.bind(this);
		this.renderButtonPlaceOrder = this.renderButtonPlaceOrder.bind(this);
		this.handleDatePicked = this.handleDatePicked.bind(this);
		this.showDatePicker = this.showDatePicker.bind(this);
		this.changeDuration = this.changeDuration.bind(this);
		this.changeOrderType = this.changeOrderType.bind(this);
		this.changeExchange = this.changeExchange.bind(this);
		this.selectedAccount = this.selectedAccount.bind(this);
		this.selectedAccountManagementGroup = this.selectedAccountManagementGroup.bind(this);
		this.updateNewestPrice = this.updateNewestPrice.bind(this);
		this.getCashAvailable = this.getCashAvailable.bind(this);
		this.placeSuccess = this.placeSuccess.bind(this);
		this.selectedMarket = this.selectedMarket.bind(this);
		this.resetFormInfo = this.resetFormInfo.bind(this);
		this.showRefreshButton = this.showRefreshButton.bind(this);
		this.checkErrorAndChangeFees = this.checkErrorAndChangeFees.bind(this);
		this.getPrice = this.getPrice.bind(this);
		this.getSymbol = this.getSymbol.bind(this);
		this.confirmOrder = this.confirmOrder.bind(this);
		this.toggleShowMoreDescription = this.toggleShowMoreDescription.bind(this);
		this.renderDate = this.renderDate.bind(this);
		this.getTimeByLocation = this.getTimeByLocation.bind(this);
		this.checkDurationDateByLocation = this.checkDurationDateByLocation.bind(this);
		this.renderLimitPrice = this.renderLimitPrice.bind(this);
		this.renderStopPrice = this.renderStopPrice.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.clearAllData = this.clearAllData.bind(this);
		this.changeLimitPrice = this.changeLimitPrice.bind(this);
		this.changeStopPrice = this.changeStopPrice.bind(this);
		this.changeVolume = this.changeVolume.bind(this);
		this.clickRefreshPrice = this.clickRefreshPrice.bind(this);
		this.updateCurrentItem = this.updateCurrentItem.bind(this);
		this.updateFee = this.updateFee.bind(this);
		this.getListDisplayCurrentAccount = this.getListDisplayCurrentAccount.bind(this);
		this.getReloadFuncLv2 = this.getReloadFuncLv2.bind(this);
		this.getReloadFuncCos = this.getReloadFuncCos.bind(this);
		this.registerSetTimeUpdate = this.registerSetTimeUpdate.bind(this);
		this.sendNewestDataToChild = this.sendNewestDataToChild.bind(this);
		this.updateFeeAfterCheckRequestID = this.updateFeeAfterCheckRequestID.bind(this);
		this.setCheckVettingLoading = this.setCheckVettingLoading.bind(this);
		this.setCheckVettingLoaded = this.setCheckVettingLoaded.bind(this);
		this.clearError = this.clearError.bind(this);
		this.setLoginUserType = this.setLoginUserType.bind(this);
		this.renderDifferentNote = this.renderDifferentNote.bind(this);
		this.showDifferentNoteModal = this.showDifferentNoteModal.bind(this);
		this.hideDifferentNoteModal = this.hideDifferentNoteModal.bind(this);
		this.renderHorizontalLine = this.renderHorizontalLine.bind(this);
		this.resetLimitPrice = this.resetLimitPrice.bind(this);
		this.resetStopPrice = this.resetStopPrice.bind(this);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.closeAlert = this.closeAlert.bind(this);
		this.handleShowDateInstructionModal = this.handleShowDateInstructionModal.bind(this);
		this.switchToDatePeriod = this.switchToDatePeriod.bind(this);
		this.onChangeDatePeriod = this.onChangeDatePeriod.bind(this);
		// this.goMiddle = this.goMiddle.bind(this);
		!this.props.isHideBackButton && Business.setButtonBack({
			navigator: this.props.navigator,
			id: ID_ELEMENT.BTN_BACK_NEW_ORDER
		});
	}

	setDicOrders() {
		const goodTillDate = this.getTimeByLocation();
		this.dic.dicLastPrice = {
			'buy': {
				[orderTypeEnum.LIMIT_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.STOPLOSS_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.STOPLIMIT_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.MARKET_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.MARKETTOLIMIT_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				}
			},
			'sell': {
				[orderTypeEnum.LIMIT_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.STOPLOSS_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.STOPLIMIT_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.MARKET_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				},
				[orderTypeEnum.MARKETTOLIMIT_ORDER]: {
					[keyLast.LIMIT_PRICE]: 0,
					[keyLast.DATE]: goodTillDate,
					[keyLast.STOP_PRICE]: 0,
					[keyLast.DURATION]: this.dic.duration,
					[keyLast.EXCHANGE]: this.dic.exchange,
					[keyLast.DATE_PERIOD]: '',
					[keyLast.IS_DATE_PICKER_USED]: false
				}
			}
		}
	}

	setLastData(key, data, sideParams) {
		const orderType = this.dic.orderType;
		const side = sideParams || (this.dic.isBuy ? 'buy' : 'sell');
		if (
			this.dic.dicLastPrice &&
			this.dic.dicLastPrice[side] &&
			this.dic.dicLastPrice[side][orderType]
		) {
			this.dic.dicLastPrice[side][orderType][key] = data
		}
	}

	getLastData(key) {
		const orderType = this.dic.orderType;
		const side = this.dic.isBuy ? 'buy' : 'sell';
		if (
			this.dic.dicLastPrice &&
			this.dic.dicLastPrice[side] &&
			this.dic.dicLastPrice[side][orderType] &&
			this.dic.dicLastPrice[side][orderType][key]
		) {
			return this.dic.dicLastPrice[side][orderType][key]
		}
		return key === keyLast.DATE_PERIOD ? '' : 0
	}

	getDuration() {
		if (!this.dic.symbolObject) return
		const { class: classSymbol } = this.dic.symbolObject;
		if (classSymbol === 'future' || !this.dic.isAuBySymbol) { // Những mã con của future khi click sau khi expand mình đang không lưu symbol info vào dic -> check AU/US qua currency sẽ trả về AU -> dẫn đến sai list duration
			this.dic.listDuration = Business.getListDurationStringByOrderTypeSystem(this.dic.orderType, this.dic.code, this.dic.classSelectedSymbol)
		} else {
			this.dic.listDuration = Business.getListDurationByClass(this.dic.classSelectedSymbol, this.dic.orderType, this.dic.isNSXSymbol)
		}
		this.dic.duration = this.convertDuration(this.dic.listDuration[0]);
	}

	getOrderType() {
		if (this.dic.isAuBySymbol) {
			this.dic.listOrderType = Business.getListOrderTypeByClass(this.dic.classSelectedSymbol, this.dic.isNSXSymbol)
		} else {
			this.dic.listOrderType = Business.getListOrderType(this.dic.code, this.dic.classSelectedSymbol);
		}
		this.dic.listOrderType[0] && (this.dic.orderType = this.convertOrderType(this.dic.listOrderType[0]))
	}

	convertDuration(duration) {
		return Enum.DURATION_STRING[duration]
	}

	convertOrderType(orderType) {
		return (orderType + '').replace(/ /g, '') + '_ORDER'
	}

	getExchange() {
		let exchangeObj = {};
		if (this.dic.isAuBySymbol) {
			exchangeObj = Business.getListExchangeByClassAndOrderType({
				classSymbol: this.dic.classSelectedSymbol,
				orderType: this.dic.orderType,
				isNSXSymbol: this.dic.isNSXSymbol,
				duration: this.dic.duration
			})
		} else {
			exchangeObj = Business.getListTradingMarket(this.dic.code)
		}
		this.dic.listExchange = exchangeObj.listExchange || [];
		this.dic.dicExchange = exchangeObj.dicExchange || {};
		this.dic.exchange = this.dic.listExchange[0] && this.dic.listExchange[0].value ? this.dic.listExchange[0].value : '';
	}

	searchAccount(props = {}) {
		this.props.navigator.showModal({
			screen: 'equix.SearchAccount',
			animated: true,
			animationType: 'slide-up',
			navigatorStyle: {
				statusBarColor: CommonStyle.statusBarBgColor,
				statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
				navBarBackgroundColor: CommonStyle.statusBarBgColor,
				navBarButtonColor: '#fff',
				navBarHidden: true,
				navBarHideOnScroll: false,
				navBarTextFontSize: 18,
				drawUnderNavBar: true,
				navBarNoBorder: true,
				screenBackgroundColor: 'transparent',
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				...props
			}
		})
	}

	getDisplayAccount(accountObj = {}) {
		return `${accountObj.account_name || ''} (${accountObj.account_id || ''})`
	}

	setLoginUserType(accountInfo, cb) {
		const k = accountInfo;
		func.setAccountId(k.account_id);
		// check account reviews
		if (k.status === 'inactive') {
			// Tài khoản bị khoá
			// this.props.appActions.checkReviewAccount(false)
			this.props.appActions.setLoginUserType(loginUserType.LOCKED);
			dataStorage.isLockedAccount = true;
			dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
			cb && cb()
		} else {
			// Redux - isReviewAccount = falses
			// Tài khoản member
			// this.props.appActions.checkReviewAccount(false)
			this.props.appActions.setLoginUserType(loginUserType.MEMBER);
			dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
			dataStorage.isLockedAccount = false;
			cb && cb()
		}
	}

	selectedAccountManagementGroup(item, notSendUpdateAccount) {
		if (!item) return;
		const userId = Controller.getUserId();
		const curAccountId = dataStorage.accountId;
		unregisterAllMessage(curAccountId);
		this.dic.currentAccount = item;
		this.errorForm = null;
		// Change current account on drawer
		if (!notSendUpdateAccount) {
			fbEmit.emit('account', 'update', this.dic.currentAccount);
		}
		this.setLoginUserType(this.dic.currentAccount, () => {
			this.setState({ currentAccount: this.dic.currentAccount }, () => {
				AsyncStorage.setItem(`${Controller.isDemo() ? 'demo' : 'prod'}_last_account_${userId}`, JSON.stringify(this.dic.currentAccount)).then(() => {
					console.log(`Save last account success`);
				}).catch(error => {
					console.log(`Save last account error: ${error}`)
				});
				reloadDataAfterChangeAccount(this.dic.currentAccount.account_id, notSendUpdateAccount);
			})
		});
	}

	selectedAccount(item, notSendUpdateAccount) {
		if (item == null) return;
		const listAccount = Controller.getListAccount();
		const userId = Controller.getUserId();
		const curAccountId = dataStorage.accountId;
		unregisterAllMessage(curAccountId);
		this.dic.currentAccount = listAccount.find(x => this.getDisplayAccount(x) === item) || null;
		this.errorForm = null;
		// Change current account on drawer
		if (!notSendUpdateAccount) {
			fbEmit.emit('account', 'update', this.dic.currentAccount);
		}
		this.setLoginUserType(this.dic.currentAccount, () => {
			this.setState({ currentAccount: this.dic.currentAccount }, () => {
				AsyncStorage.setItem(`${Controller.isDemo() ? 'demo' : 'prod'}_last_account_${userId}`, JSON.stringify(this.dic.currentAccount)).then(() => {
					console.log(`Save last account success`);
				}).catch(error => {
					console.log(`Save last account error: ${error}`)
				});
				reloadDataAfterChangeAccount(this.dic.currentAccount.account_id);
			})
		});
	}

	getListDisplayCurrentAccount() {
		let listAccount = Controller.getListAccount();
		listAccount = listAccount.filter(e => e.status === ACCOUNT_STATE.ACTIVE);
		return listAccount.map(e => this.getDisplayAccount(e));
	}

	onSearch = (textSearch) => {
		this.textSearch = textSearch;
		this.searchSymbol && this.searchSymbol(textSearch)
	};
	onCancelSearch = () => {
		Animated.timing(this.dic.opacityOrder, {
			toValue: 0,
			duration: 500
		}).start(() => {
			dataStorage.animationDirection = 'fadeIn'
			const navigatorEventID = this.props.navigatorEventIDParents;
			console.log('DCM onCancelSearch', navigatorEventID)
			this.props.navigator.dismissModal({
				animated: true,
				animationType: 'fade'
			});
			setTimeout(() => {
				this.emitter.emit(navigatorEventID, {
					id: 'hidden_new_order'
				});
			}, 200);
		})
	}
	renderNavbar() {
		const isSearchAccount = Controller.getIsSearchAccount();
		return (
			<View>
				<SearchBar
					scrollContainerValue={this.scrollContainerValue}
					onRef={ref => {
						this.refSearchBox = ref
					}}
					listClassSymbol={this.listClassSymbol}
					autoFocus={!this.dic.code}
					isNotShowMenu={this.props.isNotShowMenu}
					navigator={this.props.navigator}
					textSearch={this.textSearch}
					onCancel={this.onCancelSearch}
					onSearch={this.onSearch} />
				<Animated.View style={{
					top: 0,
					bottom: 0,
					right: 0,
					left: 0,
					position: 'absolute',
					transform: [{
						translateY: this.dic.translateHeader
					}]
				}}>
					{
						isSearchAccount ? (
							<NewOrderNavigatorManagementGroup
								channelLoadingOrder={this.dic.channelLoadingOrder}
								navigator={this.props.navigator}
								isNotShowMenu={this.props.isNotShowMenu}
								title={I18n.t('newOrder')}
								subTitle={this.getDisplayAccount(this.dic.currentAccount)}
								selectedAccount={this.selectedAccountManagementGroup}
								updateCurrentAccount={this.updateCurrentItem}
								searchAccount={this.searchAccount}
								backToSearch={this.onClose}
								c2r={this.clickRefreshPrice}
								onCancelSearch={this.onCancelSearch}
							/>
						) : (
								<NewOrderNavigator
									channelLoadingOrder={this.dic.channelLoadingOrder}
									navigator={this.props.navigator}
									title={I18n.t('newOrder')}
									isNotShowMenu={this.props.isNotShowMenu}
									subTitle={this.getDisplayAccount(this.dic.currentAccount)}
									listData={this.getListDisplayCurrentAccount()}
									selectedAccount={this.selectedAccount}
									updateCurrentItem={this.updateCurrentItem}
									backToSearch={this.onClose}
									c2r={this.clickRefreshPrice}
									onCancelSearch={this.onCancelSearch}
								/>
							)
					}

				</Animated.View>
			</View>
		)
	}

	onPressSearch(symbolObj) {
		// Reset direction animation
		dataStorage.animationDirection = 'fadeIn'
		if (!this.props.isConnected) {
			this.dic.isChangeSymbolDisconnect = true;
		}
		const { symbol, class: classSymbol } = symbolObj;
		this.dic.code = symbol;
		if (Controller.isPriceStreaming()) {
			this.unSubSymbol(this.dic.symbolObject);
		}
		this.dic.symbolObject = symbolObj;
		const company = symbolObj.securiry_name || symbolObj.company_name || symbolObj.company;
		this.setCode(this.dic.code, company, classSymbol, false);
		if (this.nestedScroll) {
			this.nestedScroll.snapContainerTopTop();
			this.nestedScroll.reset()
		} else {
			if (this.scrollValue._value > 0) {
				this.scrollValue.setValue(0);
			}
		}
	}
	setListClassSymbol = (listClassSymbol) => {
		this.refSearchBox && this.refSearchBox.updateListClassSymbol(listClassSymbol)
		this.listClassSymbol = listClassSymbol
	}
	renderResultSearch() {
		return <SearchResult setListClassSymbol={this.setListClassSymbol} register={fn => this.searchSymbol = fn} onPressSearch={this.onPressSearch} />
	}

	changeStatusBarUI = (isSearch) => {
		this.showConfirmOrderBtnAnim(isSearch ? 188 : 0);
		// this.setState({ isSearch })
	};

	goMiddle = () => {
		const cb = () => {
			this.refSearchBox && this.refSearchBox.doFocus && this.refSearchBox.doFocus();
		};
		this.nestedScroll && this.nestedScroll.snapContainerTopMiddle(cb);
	};

	showConfirmOrderBtnAnim(toValue = 0, duration = 250) {
		Animated.timing(
			this.dic.translateYValue, {
			toValue: toValue,
			duration
		}
		).start()
	}

	updateCurrentItem(funcUpdateCurrentItem) {
		if (funcUpdateCurrentItem) {
			this.funcUpdateCurrentItem = funcUpdateCurrentItem;
		}
	}

	filterCashBySymbolClass(data = {}) {
		const symbolClass = Business.getClassBySymbol(this.dic.code)
		const symbolCurrency = Business.getCurency(this.dic.code)
		if (symbolClass === SYMBOL_CLASS.FUTURE) {
			// Future -> show "Initial Margin Available to Trade"
			return data.available_balance_au
		} else if (symbolClass === SYMBOL_CLASS.EQUITY && symbolCurrency === CURRENCY.USD) {
			// Equity Mỹ -> show "Cash Available to Trade (not include your settlement in T+2 & Others)"
			return data.available_balance_us
		}
		return data.available_balance_au
	}

	getCashAvailable(isRender) {
		try {
			return new Promise(resolve => {
				if (!this.dic.code) return resolve();

				const url = api.getNewTotalPortfolio(this.dic.currentAccount.account_id);
				return api.requestData(url, true).then(data => {
					this.isFirst = true;
					if (data) {
						this.dic.cashAvailable = this.filterCashBySymbolClass(data);
						this.setDicPositions(data, isRender);
					} else {
						logDevice('error', `ORDER - GET CASH AVAILABLE ERROR`);
					}
					resolve();
				});
			});
		} catch (error) {
			logDevice('info', `ORDER - GET CASH AVAILABLE EXCEPTION: ${error}`);
			resolve();
		}
	}

	async setDicPositions(data, forceUpdate) {
		const positions = data.positions || [];
		const profitVal = data.profitVal || {};
		this.dic.positions = {};
		let combodityInfo = {}
		if (Business.isFuture(this.dic.classSelectedSymbol)) {
			const combodityInfoRes = await getCommodityInfo(this.dic.symbolObject.symbol)
			combodityInfo = combodityInfoRes
		}
		for (let index = 0; index < positions.length; index++) {
			const element = positions[index];
			if (element && element.symbol) {
				this.dic.positions[element.symbol] = {
					volume: element.volume ? element.volume : 0,
					netPosition: element.volume && element.average_price ? `${formatNumber(element.volume, PRICE_DECIMAL.VOLUME)} @ ${Business.displayMoney(element.average_price, PRICE_DECIMAL.PRICE)}` : '--',
					profitLoss: profitVal[element.symbol] ? Business.displayMoney(profitVal[element.symbol], PRICE_DECIMAL.VALUE) : '--'
				}
			}
		}
		this.setVolume(forceUpdate);
	}

	showRefreshButton() {
		if (Controller.isPriceStreaming()) return;
		if (this.dic.menuSelected === dataStorage.menuSelected) {
			this.dic.nav.setButtons({
				rightButtons: this.props.order.isLoading ? [
					{
						component: 'equix.CustomButton'
					}
				] : [
						{
							title: 'Refresh',
							id: 'order_refresh',
							icon: iconsMap['ios-refresh-outline'],
							testID: `order_refresh`
						}
					]
			})
		}
	}

	pubLoading() {
		this.dic.isLoadingPrice = true;
		Emitter.emit(this.dic.channelLoadingOrder, this.dic.isLoadingPrice);
	}

	pubLoadDone() {
		this.dic.isLoadingPrice = false;
		Emitter.emit(this.dic.channelLoadingOrder, this.dic.isLoadingPrice);
		this.setState()
	}

	async clickRefreshPrice() {
		this.dic.perf && this.dic.perf.incrementCounter(performanceEnum.new_order_c2r);
		if (this.dic.code !== '') {
			this.getCashAvailable(true);
			this.pubLoading();
			const data = await this.getPrice();
			this.updateNewestPrice(data);
			this.pubLoadDone()
		}
	}

	async onNavigatorEvent(event) {
		if (event.type === 'DeepLink') {
			switchForm(this.props.navigator, event)
		}
		if (event.type === 'back') {
			this.onClose()
		}
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case ID_ELEMENT.BTN_BACK_NEW_ORDER:
					func.setBackNewOrderStatus(true);
					this.dic.nav.pop({
						animated: true,
						animationType: 'slide-horizontal'
					});
					break;
				case 'order_refresh':
					this.clickRefreshPrice();
					break;
				case 'sideMenu':
					Keyboard.dismiss();
					break;
				case 'menu_ios':
					this.props.navigator.toggleDrawer({
						side: 'left',
						animated: true
					});
					break;
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.newOrder);
					fbEmit.deleteEmitter('new_order_sub_title');
					this.updateSubtitle();
					this.dic.perf && this.dic.perf.incrementCounter(performanceEnum.show_form_order);
					if (this.dic.code) {
						this.setupDataloader();
					}
					if (!this.dic.code) {
						this.props.actions.changeBuySell(this.state.type);
					}
					break;
				case 'didAppear':
					dataStorage.loadData = Enum.DEFAULT_VAL.FUNC;
					const channel = StreamingBusiness.getChannelHalt(this.dic.code);
					Emitter.addListener(channel, this.id, tradingHalt => {
						this.updateHaltRealtime(tradingHalt)
					});
					func.setCurrentScreenId(this.dic.typeForm)
					this.isFirst && this.getCashAvailable(true);
					if (this.dic.code !== '') {
						this.loadData();
						this.updateHaltFromSymbolInfo()
					}
					switch (func.getUserPriceSource()) {
						case userType.ClickToRefresh:
							break;
						case userType.Delay:
							break;
					}
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					dataStorage.openOrderFromMenu = false;
					fbEmit.deleteEmitter('halt');
					fbEmit.deleteEmitter('new_order_sub_title');
					// fbEmit.deleteEmitter('update_nav')
					fbEmit.deleteEmitter(CHANNEL.ACCOUNT);
					break;
				default:
					break;
			}
		}
	}

	updateHaltRealtime(tradingHalt) {
		if (tradingHalt !== this.state.tradingHalt) {
			this.setState({
				tradingHalt
			})
		}
	}

	updateHaltFromSymbolInfo() {
		const symbol = this.dic.code;
		if (dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].trading_halt !== undefined && dataStorage.symbolEquity[symbol].trading_halt !== null) {
			this.setState({
				tradingHalt: dataStorage.symbolEquity[symbol].trading_halt
			})
		}
	}

	componentWillUnmount() {
		// Unsub
		this.unSubSymbol(this.dic.symbolObject) // Unsub when signout, not jump to CWUM
		this.dic.code = '';
		// this.keyboardDidHideSub.remove();
		// this.keyboardDidShowSub.remove();
		// this.dic.keyboardDidShowListener && this.dic.keyboardDidShowListener.remove();
		// this.dic.keyboardDidHideListener && this.dic.keyboardDidHideListener.remove();
		// fbEmit.deleteEmitter('update_nav');
		super.componentWillUnmount();
		ManageConection.unRegisterSnapshot(ScreenId.ORDER);
	}

	showToast(stepPrice) {
		Toast.show(`Price step = ${stepPrice} cent`, {
			duration: 1000,
			position: 140,
			shadow: false,
			animation: true,
			hideOnPress: true,
			delay: 0,
			opacity: 0.8,
			backgroundColor: '#808080'
		});
	}

	updateSubtitle() {
		fbEmit.addListener('new_order_sub_title', 'new_order_set_sub_title', (item) => {
			if (item === null) return;
			const userType = Controller.getUserType();
			const isSearch = Controller.getIsSearchAccount();
			// cap nhap lai current account
			if (!isSearch) {
				const listAccount = Controller.getListAccount();
				this.dic.currentAccount = listAccount.find(x => this.getDisplayAccount(x) === item) || null;
			} else {
				this.dic.currentAccount = dataStorage.currentAccount
			}
			// lay lai cash va set lai navigator
			this.getCashAvailable(true);
			this.updateFee();
			this.funcUpdateCurrentItem && this.funcUpdateCurrentItem(item);
		}, false);
	}

	setupDataloader() {
		const initData = {
			volume: this.dic.volume || 0,
			stopPrice: this.dic.stopPrice || 0,
			limitPrice: this.dic.limitPrice || 0
		};
		this.props.actions.setupDataLoader(initData);
		if (this.dic.code) {
			const objectFee = this.getObjectFee();
			objectFee && Business.getFees(objectFee, this.dic.requestID);
		}
	}

	sendNewestDataToChild(newObj) {
		this.emitToChild({ type: PTC_CHANNEL.TRADE_PRICE, data: newObj.trade_price });
		this.emitToChild({ type: PTC_CHANNEL.BID_PRICE, data: newObj.bid_price });
		this.emitToChild({ type: PTC_CHANNEL.ASK_PRICE, data: newObj.ask_price });
	}

	updateNewestPrice(data) {
		this.dic.priceObject = data || {};
		Emitter.emit(this.dic.channelPriceOrder, { data: this.dic.priceObject, isMerge: false }); // Snapshot -> pub price
		this.dic.setTimeUpdate && this.dic.setTimeUpdate(new Date().getTime());
		this.showRefreshButton();
	}

	loadData() {
		this.clickRefreshPrice()
	}

	// componentWillMount() {
	// 	this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
	// 	this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
	// }
	componentDidMount() {
		super.componentDidMount();
		ManageConection.dicConnection.screenId = ScreenId.ORDER;
		ManageConection.dicConnection.getSnapshot = this.updateFee;
		try {
			// this.dic.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
			// this.dic.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
			if (!this.dic.code) {
				this.setState({ tradingHalt: false })
			}
			this.updateSubtitle();
			// this.updateNav();
			fbEmit.addListener(CHANNEL.ACCOUNT, EVENT.FINISH_UPDATE_LIST_ACCOUNT, () => {
				this.dic.currentAccount = Util.cloneFn(dataStorage.currentAccount || {});
				const displayName = this.getDisplayAccount(this.dic.currentAccount);
				if (this.dic.currentAccount.account_id !== dataStorage.currentAccount.account_id) {
					this.selectedAccount(displayName, true);
				}
				this.funcUpdateCurrentItem && this.funcUpdateCurrentItem(displayName, this.getListDisplayCurrentAccount());
			});
		} catch (error) {
			logAndReport('componentDidMount order exception', error, 'componentDidMount order');
			logDevice('error', `componentDidMount order exception: ${error}`)
		}
	}

	resetExpand() {
		this.dic.isExpand = {
			Detail: true,
			marketDepth: true,
			courseOfSales: true
		}
		this.dic.iconCollapse.Detail.setValue(0)
		this.dic.iconCollapse.marketDepth.setValue(0)
		this.dic.iconCollapse.courseOfSales.setValue(0)
	}

	async resetFormInfo(isInit) {
		try {
			this.getOrderType();
			this.getDuration();
			this.getExchange();
			if (!isInit) {
				this.resetQuantity();
				this.resetExpand()
			}
			this.setDicOrders();
			this.resetLimitPrice();
			this.resetStopPrice();
			this.resetDatePicker();
			this.dic.limitPriceChange = false;
			this.dic.stopPriceChange = false;
			this.setState({ isShowMore: false });
		} catch (error) {
			logAndReport('resetFormInfo order exception', error, 'resetFormInfo order');
			logDevice('info', `resetFormInfo order exception: ${error}`)
		}
	}

	resetQuantity() {
		this.dic.volume = 0;
		this.dic.userVolume = 0;
	}

	resetLimitPrice() {
		this.dic.limitPrice = 0
	}

	resetStopPrice() {
		this.dic.stopPrice = 0
	}

	resetDatePicker() {
		this.dic.date = this.getDefaultDatePicker();
		this.dic.datePeriod = '';
		this.dic.isDatePickerUsed = false;
	}

	updateFeeAfterCheckRequestID(requestIDFromApi) {
		if (requestIDFromApi && this.dic.requestID === requestIDFromApi) {
			return true
		}
		return false
	}

	async updateFee() {
		const objectFee = this.getObjectFee();
		this.dic.requestID = Uuid.v4();
		const feeObj = await Business.getFees(objectFee, this.dic.requestID) || {};
		const requestIDFromApi = feeObj.requestID;
		const checkRequestIDFee = this.updateFeeAfterCheckRequestID(requestIDFromApi);
		if (checkRequestIDFee) {
			this.dic.feeObj = feeObj;
			this.setState({});
		}
	}

	subNewSymbol(symbolObject) {
		return new Promise(resolve => {
			const exchange = symbolObject.exchanges[0];
			const symbol = symbolObject.symbol;
			const channel = StreamingBusiness.getChannelLv1(exchange, symbol);

			Emitter.addListener(channel, this.id, newData => {
				console.log('ORDER REALTIME', newData.symbol, newData)
				this.dic.priceObject = newData || {};
				this.dic.setTimeUpdate && this.dic.setTimeUpdate(new Date().getTime());
				Emitter.emit(this.dic.channelPriceOrder, { data: this.dic.priceObject }) // Realtime -> pub price
			});
			AllMarket.setIsAIO(true);
			AllMarket.sub([{ symbol, exchange }], this.dic.idForm, resolve);
		});
	}

	unSubSymbol(symbolObject = {}) {
		if (!symbolObject.exchanges || !symbolObject.symbol) return;

		const exchange = symbolObject.exchanges[0];
		const symbol = symbolObject.symbol;

		AllMarket.unsub([{ symbol, exchange }], this.dic.idForm);
	}

	loadDataAll(isNotRender, cb) {
		try {
			return new Promise(async (resolve, reject) => {
				this.dic.isLoadingPrice = true
				Emitter.emit(this.dic.channelLoadingOrder, this.dic.isLoadingPrice);
				if (Util.compareObject(this.dic.symbolObject, {})) {
					this.clearAllData();
					return reject(this.dic.symbolObject);
				}
				if (Controller.isPriceStreaming()) {
					await this.subNewSymbol(this.dic.symbolObject);
				}

				const orderObject = this.getObjectFee();
				this.dic.requestID = Uuid.v4();
				const data = await Promise.all([this.getPrice(), Business.getFees(orderObject, this.dic.requestID), this.getCashAvailable(true)]);
				this.dic.isLoadingPrice = false;
				this.setState({});
				Emitter.emit(this.dic.channelLoadingOrder, this.dic.isLoadingPrice);
				this.updateNewestPrice(data[0]);
				const feeObj = data[1];
				const requestIDFromApi = feeObj.requestID;
				const checkRequestIDFee = this.updateFeeAfterCheckRequestID(requestIDFromApi);
				if (checkRequestIDFee) {
					this.dic.feeObj = feeObj
				}
				cb && cb();
				return isNotRender
					? resolve()
					: this.setState({}, resolve);
			});
		} catch (error) {
			logDevice('info', `loadDataAll error: ${JSON.stringify(error)}`);
		}
	}

	storeDepthData = this.storeDepthData.bind(this)
	storeDepthData(depthData = {}) {
		this.dic.depthData = depthData
	}

	storeCosData = this.storeCosData.bind(this)
	storeCosData(tradesData = {}) {
		this.dic.tradesData = tradesData
	}

	updateDataWhenChangeTab = this.updateDataWhenChangeTab.bind(this)
	updateDataWhenChangeTab() {
		switch (this.dic.currentTab) {
			case 1:
				// Depth
				this.pubDepthData(this.dic.depthData)
				break;
			case 2:
				// Cos
				this.pubCosData(this.dic.tradesData)
				break;
			default:
				break;
		}
	}

	pubDepthData(depthData = {}) {
		const ask = Util.getValueObject(depthData.ask);
		const bid = Util.getValueObject(depthData.bid);
		if (!depthData) return;
		const { indicative_price: indicativePrice, surplus_volume: surplusVolume, side } = depthData;
		const channel = StreamingBusiness.getChannelDepthAOI();
		Emitter.emit(channel, {
			ask,
			bid,
			indicativePrice,
			surplusVolume,
			side
		})
	}

	pubCosData(tradesData = {}) {
		const data = Util.getValueObject(tradesData);
		const channel = StreamingBusiness.getChannelCosAOI();
		Emitter.emit(channel, [{ data }])
	}

	getPrice() {
		this.props.actions.writeDataEvent();
		this.dic.perf && this.dic.perf.start();
		const exchange = this.dic.symbolObject.exchanges[0];
		const symbol = this.dic.symbolObject.symbol;

		return new Promise(resolve => {
			UserPriceSource.loadDataAOIPrice(
				[{
					exchange,
					symbol
				}]).then(data => {
					this.props.actions.writeDataSuccess();
					const allData = data[0] || {};
					const quoteData = allData.quote || {};
					const depthData = allData.depth || {};
					depthData['indicative_price'] = quoteData.indicative_price;
					depthData['surplus_volume'] = quoteData.surplus_volume;
					depthData['side'] = quoteData.side;
					const tradesData = allData.trades;
					this.storeDepthData(depthData)
					this.storeCosData(tradesData)
					this.pubDepthData(depthData);
					this.pubCosData(tradesData);
					resolve(quoteData);
				});
		});
	}

	toggleShowMoreDescription() {
		this.setState(previousState => {
			return { isShowMore: !previousState.isShowMore };
		});
	}

	renderStopLimitDescription() {
		const { isShowMore } = this.state;
		const replaceObj = {
			side: this.dic.isBuy ? this.dic.buyUpper : this.dic.sellUpper,
			volume: formatNumber(this.dic.volume),
			symbol: this.dic.symbolObject.display_name || '',
			stopPrice: formatNumberNew2(this.dic.stopPrice, PRICE_DECIMAL.PRICE),
			limitPrice: formatNumberNew2(this.dic.limitPrice, PRICE_DECIMAL.PRICE),
			increasesFalls: this.dic.isBuy
				? I18n.t('increases')
				: I18n.t('falls'),
			lowHigh: this.dic.isBuy
				? I18n.t('lower')
				: I18n.t('higher')
		};
		const description = I18n.t('stopLimitDescription');
		const res = replaceTextForMultipleLanguage(description, replaceObj);
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMainNormal}>{res}</Text>
			</View>
		)
	}

	renderLimitDescription() {
		const { isShowMore } = this.state;
		const replaceObj = {
			side: this.dic.isBuy ? this.dic.buyUpper : this.dic.sellUpper,
			volume: formatNumber(this.dic.volume),
			symbol: this.dic.symbolObject.display_name || '',
			limitPrice: formatNumberNew2(this.dic.limitPrice, PRICE_DECIMAL.PRICE),
			lowHigh: this.dic.isBuy
				? I18n.t('lower')
				: I18n.t('higher')
		};
		const description = I18n.t('limitDescription');
		const res = replaceTextForMultipleLanguage(description, replaceObj);
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMainNormal}>{res}</Text>
			</View>
		)
	}

	renderMarketToLimitDescription() {
		const { isShowMore } = this.state;
		const replaceObj = {
			side: this.dic.isBuy ? this.dic.buyUpper : this.dic.sellUpper,
			volume: formatNumber(this.dic.volume),
			symbol: this.dic.symbolObject.display_name || '',
			bidOffer: this.dic.isBuy ? I18n.t('offer') : I18n.t('bid')
		};
		const description = I18n.t('marketToLimitDescription');
		const res = replaceTextForMultipleLanguage(description, replaceObj);
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMainNormal}>{res}</Text>
			</View>
		)
	}

	renderMarketDescription() {
		const { isShowMore } = this.state;
		const replaceObj = {
			side: this.dic.isBuy ? this.dic.buyUpper : this.dic.sellUpper,
			volume: formatNumber(this.dic.volume),
			symbol: this.dic.symbolObject.display_name || '',
			bidOffer: this.dic.isBuy
				? I18n.t('offer')
				: I18n.t('bid')
		};
		const descriptionString = 'marketSaxoDescription';
		const description = I18n.t(descriptionString);
		const res = replaceTextForMultipleLanguage(description, replaceObj);
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMainNormal}>{res}</Text>
			</View>
		)
	}

	renderStopLossDescription() {
		const { isShowMore } = this.state;
		const replaceObj = {
			side: this.dic.isBuy ? this.dic.buyUpper : this.dic.sellUpper,
			volume: formatNumber(this.dic.volume),
			symbol: this.dic.symbolObject.display_name || '',
			stopPrice: formatNumberNew2(this.dic.stopPrice, PRICE_DECIMAL.PRICE),
			increaseDecrease: this.dic.isBuy ? I18n.t('increases') : I18n.t('decreases')
		};
		const description = Business.isParitech(this.dic.code)
			? I18n.t('stopLossParitechDescription')
			: I18n.t('stopLossXaxoDescription');
		const res = replaceTextForMultipleLanguage(description, replaceObj);
		return (
			<View style={{ width: '100%' }}>
				<Text
					numberOfLines={isShowMore ? 0 : 1}
					ellipsizeMode={isShowMore ? null : 'tail'}
					style={CommonStyle.textMainNormal}>{res}</Text>
			</View>
		)
	}

	changeBuySell(isBuy) {
		try {
			if (isBuy === this.dic.isBuy) return;
			this.dic.isBuy = isBuy;
			this.setVolume();
			this.getLastOrderBySide();
			// Get exchange list
			let exchangeObj = {};
			if (this.dic.isAuBySymbol) {
				exchangeObj = Business.getListExchangeByClassAndOrderType({
					classSymbol: this.dic.classSelectedSymbol,
					orderType: this.dic.orderType,
					isNSXSymbol: this.dic.isNSXSymbol,
					duration: this.dic.duration
				})
			} else {
				exchangeObj = Business.getListTradingMarket(this.dic.code)
			}
			this.dic.listExchange = exchangeObj.listExchange || [];
			this.dic.dicExchange = exchangeObj.dicExchange || {};
			// End of getting list
			this.updateFee();
			this.setState({});
		} catch (error) {
			logAndReport('changeBuySell order exception', error, 'changeBuySell order');
			logDevice('info', `NewOrder - changeBuySell - ${tradeType}: ${error ? JSON.stringify(error) : ''}`);
		}
	}

	getLastOrderBySide() {
		this.dic.limitPrice = this.getLastData(keyLast.LIMIT_PRICE);
		this.dic.stopPrice = this.getLastData(keyLast.STOP_PRICE);
		this.dic.duration = this.getLastData(keyLast.DURATION);
		this.dic.exchange = this.getLastData(keyLast.EXCHANGE);
		this.dic.date = this.getLastData(keyLast.DATE);
		this.dic.datePeriod = this.getLastData(keyLast.DATE_PERIOD);
		this.dic.isDatePickerUsed = this.getLastData(keyLast.IS_DATE_PICKER_USED);
	}

	isDisableButtonBuy(orderType) {
		// return false
		return !this.dic.isFuture && ([orderTypeEnum.STOPLIMIT_ORDER, orderTypeEnum.STOPLOSS_ORDER].includes(orderType || this.dic.orderType));
	}

	renderButtonBuySell() {
		const isDisabled = this.isDisableButtonBuy()
		return (
			<View style={{
				flexDirection: 'row',
				paddingTop: Controller.isPriceStreaming() ? 16 : 24,
				paddingHorizontal: 16,
				marginBottom: 16,
				minHeight: 32,
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Text
					style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor }]}>{I18n.t('side_txt')}</Text>
				<View style={{
					minHeight: 32,
					width: 216,
					flexDirection: 'row',
					borderColor: this.dic.isBuy
						? isDisabled
							? CommonStyle.disableBtnBuyBorderColor
							: CommonStyle.fontOceanGreen
						: isDisabled
							? CommonStyle.disableBtnSellBorderColor
							: CommonStyle.fontShadowRed,
					borderWidth: 1,
					borderRadius: 15.5
				}}>
					<View style={{
						flex: 1
					}}>
						<TouchableOpacity
							disabled={isDisabled}
							onPress={() => this.changeBuySell(true)}
							style={{
								flex: 1,
								height: 32,
								borderBottomLeftRadius: 14,
								borderTopLeftRadius: 14,
								borderBottomRightRadius: 16,
								borderTopRightRadius: 16,
								backgroundColor: this.dic.isBuy
									? CommonStyle.fontOceanGreen
									: CommonStyle.fontTransparent,
								justifyContent: 'center',
								alignItems: 'center'
							}}>
							<Text style={[
								CommonStyle.textButtonColorS,
								{
									color: this.dic.isBuy
										? 'black'
										: (
											this.isDisableButtonBuy()
												? CommonStyle.fontShadowRed
												: CommonStyle.btnOrderSellColor
										),
									opacity: isDisabled
										? 0.7
										: 1
								}]}>
								{I18n.t('buyUpper')}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={{ flex: 1 }}>
						<TouchableOpacity
							onPress={() => this.changeBuySell(false)}
							style={{
								flex: 1,
								// borderColor: this.dic.isBuy
								// 	? CommonStyle.addIconColor
								// 	: CommonStyle.addIconColor,
								// borderWidth: this.dic.isBuy
								// 	? 1
								// 	: 0,
								// borderTopRightRadius: 4,
								// borderBottomRightRadius: 4,
								borderBottomLeftRadius: 16,
								borderTopLeftRadius: 16,
								borderBottomRightRadius: 14,
								borderTopRightRadius: 14,
								backgroundColor: this.dic.isBuy
									? CommonStyle.fontTransparent
									: CommonStyle.fontShadowRed,
								justifyContent: 'center',
								alignItems: 'center'
							}}>
							<Text
								style={[
									CommonStyle.textButtonColorS,
									{
										color: this.dic.isBuy
											? CommonStyle.btnOrderBuyColor
											: 'white'
									}]}>
								{I18n.t('sellUpper')}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View >
		)
	}

	sendOrderRequest(orderObject) {
		const autoFillObj = {
			account_id: orderObject.account_id || '',
			code: orderObject.code || '',
			volume: orderObject.volume || 0
		};
		this.saveLastOrderRequest(autoFillObj);
		this.showConfirmScreen(orderObject);
	}

	setCheckVettingLoading() {
		this.setState({
			isCheckVetting: true
		})
	}

	setCheckVettingLoaded(cb) {
		this.setState({
			isCheckVetting: false
		}, cb)
	}

	confirmOrder() {
		try {
			this.dic.limitPriceChange = true;
			this.dic.stopPriceChange = true;
			this.errorForm = this.getError(this.dic);
			if (this.errorForm) {
				return this.setState({});
			} else {
				this.errorForm = this.getDatePeriodError();
				if (this.errorForm) {
					return this.setState({});
				}
			}

			Keyboard.dismiss();

			this.setCheckVettingLoading();
			if (dataStorage.loginUserType === loginUserType.REVIEW) {
				this.newPrompt && this.newPrompt.showModal();
			} else if (dataStorage.loginUserType === loginUserType.MEMBER) {
				if (this.isGoodTillDate() && !this.dic.isDatePickerUsed) {
					let timestamp = new Date();
					axios.get(infoUrl, {
						headers: headerObj,
						timeout: TIMEOUT_REQUEST
					}).then(res => {
						timestamp = new Date(res.data.timeserver);
					}).catch(error => {
						logDevice('error', 'Axios get timeserver', error);
					}).finally(() => {
						this.setDateFromDatePeriod(timestamp);
						const orderObject = this.getObjectOrderPlace();
						// Apply vetting place order
						const byPassVetting = config.byPassVetting;
						Business.checkVettingOrder(Enum.ORDER_ACTION.PLACE, orderObject, byPassVetting)
							.then(res => {
								const status = res.status;
								const errorCode = res.errorCode || '';
								switch (status) {
									case Enum.RESPONSE_STATUS.PASS:
										this.errorForm = null;
										this.setCheckVettingLoaded();
										return this.sendOrderRequest(orderObject);
									case Enum.RESPONSE_STATUS.FAIL:
										this.errorForm = errorCode;
										return this.setCheckVettingLoaded();
									default:
										console.log('CHECK VETTING PLACE ORDER EXCEPTION:', errorCode);
										if (errorCode === Enum.ERROR_CODE.TIMEOUT) {
											this.errorForm = I18n.t('timeoutOrder')
										}
										return this.setCheckVettingLoaded()
								}
							})
							.catch(error => {
								console.log('error at checkVettingOrder', error);
							})
					})
				} else {
					const orderObject = this.getObjectOrderPlace();
					// Apply vetting place order
					const byPassVetting = config.byPassVetting;
					Business.checkVettingOrder(Enum.ORDER_ACTION.PLACE, orderObject, byPassVetting)
						.then(res => {
							const status = res.status;
							const errorCode = res.errorCode || '';
							switch (status) {
								case Enum.RESPONSE_STATUS.PASS:
									this.errorForm = null;
									this.setCheckVettingLoaded();
									return this.sendOrderRequest(orderObject);
								case Enum.RESPONSE_STATUS.FAIL:
									this.errorForm = errorCode;
									return this.setCheckVettingLoaded();
								default:
									console.log('CHECK VETTING PLACE ORDER EXCEPTION:', errorCode);
									if (errorCode === Enum.ERROR_CODE.TIMEOUT) {
										this.errorForm = I18n.t('timeoutOrder')
									}
									return this.setCheckVettingLoaded()
							}
						})
						.catch(error => {
							console.log('error at checkVettingOrder', error);
						})
				}
			}

			Business.setTimeoutClick(this.dic.isPress)
		} catch (error) {
			logAndReport('confirmOrder order exception', error, 'confirmOrder order');
			return this.setCheckVettingLoaded()
		}
	}

	setTimeoutClickable() {
		this.dic.isPress = true;
		setTimeout(() => {
			this.dic.isPress = false;
		}, 1500);
	}

	saveLastOrderRequest(objOrder) {
		try {
			const objOrderString = JSON.stringify(objOrder);
			const key = `order_history_${this.dic.currentAccount.account_id}_${this.dic.code}`;
			AsyncStorage.setItem(key, objOrderString, error => {
				error && console.log(`New Order AsyncStorage.setItem Error: ${error}`);
			});
		} catch (error) {
			logAndReport(`Order - saveLastOrderRequest Error: ${error}`);
			logDevice('info', `Order - saveLastOrderRequest Error: ${error}`);
		}
	}

	setVolume(forceUpdate) {
		if (this.dic.userVolume > 0) {
			this.dic.volume = this.dic.userVolume;
			return;
		}
		if (this.dic.positions && this.dic.positions[this.dic.code] && this.dic.positions[this.dic.code].volume) {
			if (this.dic.isBuy) {
				if (this.props.type === 'close') {
					if (this.dic.positions[this.dic.code].volume < 0) {
						this.autoOpenDetail();
						this.dic.volume = Math.abs(this.dic.positions[this.dic.code].volume);
					} else {
						this.dic.volume = 0;
					}
				} else {
					this.dic.volume = 0;
				}
			} else {
				if (this.dic.positions[this.dic.code].volume < 0) {
					this.dic.volume = 0;
				} else {
					this.autoOpenDetail();
					this.dic.volume = Math.abs(this.dic.positions[this.dic.code].volume);
				}
			}
		} else {
			this.dic.volume = 0;
		}
		forceUpdate && this.setState()
	}

	getError({ code, volume, limitPrice, stopPrice, orderType }) {
		try {
			if (!code) return I18n.t('symbolSelectFirst');
			if (!volume) {
				this.refQuantityInput.focus()
				return I18n.t('volumeRequired')
			};
			switch (orderType) {
				case orderTypeEnum.STOPLOSS_ORDER:
					if ((!stopPrice || stopPrice === '0') && this.dic.stopPriceChange) return I18n.t('stopPriceValid');
					break;
				case orderTypeEnum.LIMIT_ORDER:
					if ((!limitPrice || limitPrice === '0') && this.dic.limitPriceChange) {
						this.refLimitPrice && this.refLimitPrice.focus()
						return I18n.t('limitPriceValid')
					};
					break;
				case orderTypeEnum.STOP_ORDER:
					if ((!stopPrice || stopPrice === '0') && this.dic.stopPriceChange) {
						this.refStopTriggerPrice && this.refStopTriggerPrice.focus()
						return I18n.t('stopPriceValid');
					}
					break;
				case orderTypeEnum.STOPLIMIT_ORDER:
					if ((!stopPrice || stopPrice === '0') && this.dic.stopPriceChange) {
						this.refStopTriggerPrice && this.refStopTriggerPrice.focus()
						return I18n.t('stopPriceValid')
					};
					if ((!limitPrice || limitPrice === '0') && this.dic.limitPriceChange) {
						this.refLimitPrice && this.refLimitPrice.focus()
						return I18n.t('limitPriceValid')
					};
					break;
			}
			return null;
		} catch (error) {
			logDevice('info', `Neworder - getError success with error: ${error}`)
		}
	}

	getDatePeriodError() {
		if (this.isGoodTillDate() && (!this.dic.isDatePickerUsed)) {
			if (!PureFunc.validateDatePeriod(this.getLastData(keyLast.DATE_PERIOD))) {
				this.dic.datePeriodError = true;
				this.dic.error = {
					highlighted: true,
					highlightedWord: [I18n.t('datePeriodFormat')],
					highlightedStyle: {
						fontWeight: '500'
					}
				};
				return `${I18n.t('dateMustBeIn')} ${I18n.t('datePeriodFormat')} ${I18n.t('format')}`;
			}
		}
	}

	placeSuccess() {
		// fix bug quick button up and down
		this.dic.code = '';
		setTimeout(() => {
			func.setBackNewOrderStatus(true)
			this.props.isNotShowMenu && this.props.navigator.dismissModal({
				animated: true,
				animationType: 'slide-down'
			});
			const isSearch = true
			this.clearAllData(isSearch)
			this.setState();
		}, 50)
	}

	showConfirmScreen(ordObj) {
		logDevice('info', `Push order to PlaceConfirm order: ${ordObj}`);

		const subtitle = this.getDisplayAccount(this.dic.currentAccount);
		this.props.navigator.showModal({
			screen: SCREEN.CONFIRM_PLACE_ORDER,
			title: I18n.t('confirmOrder'),
			subtitle,
			passProps: {
				companyName: this.getCompanyName(this.dic.symbolObject),
				actor: func.getUserLoginId(),
				reqObj: ordObj,
				successCb: this.placeSuccess
			},
			animated: true,
			animationType: 'slide-up',
			navigatorStyle: { ...CommonStyle.navigatorSpecial, screenBackgroundColor: 'transparent', modalPresentationStyle: 'overCurrentContext' },
			navigatorButtons: {
				leftButtons: [{
					id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
					icon: Util.getValByPlatform(iconsMap[ICON_NAME.ARROW_BACK.IOS], iconsMap[ICON_NAME.ARROW_BACK.ANDROID])
				}]
			}
		})
	}

	checkErrorAndChangeFees(byPass = false) {
		this.timeoutFees && clearTimeout(this.timeoutFees);
		this.timeoutFees = setTimeout(async () => {
			try {
				this.errorForm = this.getError(this.dic);
				if (!this.errorForm || byPass) {
					if (this.props.isConnected) {
						const feeObject = this.getObjectFee();
						this.dic.requestID = Uuid.v4();
						const feeObj = await Business.getFees(feeObject, this.dic.requestID);
						const requestIDFromApi = feeObj.requestID
						const checkRequestIDFee = this.updateFeeAfterCheckRequestID(requestIDFromApi)
						if (checkRequestIDFee) {
							this.dic.feeObj = feeObj
						}
						this.setState({})
					}
				}
			} catch (error) {
				logAndReport('checkErrorAndChangeFees order exception', error, 'checkErrorAndChangeFees order')
				logDevice('info', `checkErrorAndChangeFees order exception: ${error}`)
			}
		}, TIME_OUT_INPUT);
	}

	onChangeText(type, val) {
		try {
			this.errorForm = null;
			switch (type) {
				case 'volume':
					this.isChangeTextVolume = true;
					this.changeVolume(val);
					break;
				case 'limit':
					this.isChangeTextLimit = true;
					this.changeLimitPrice(val);
					break;
				case 'stop':
					this.isChangeTextStop = true;
					this.changeStopPrice(val);
					break;
				default:
					break;
			}
			this.setState()
		} catch (error) {
			logAndReport('onChangeText order exception', error, 'onChangeText order');
			logDevice('info', `NewOrder - onChangeText ${type} - ${val}: ${error ? JSON.stringify(error) : ''}`);
		}
	}

	getFees(orderObject) {
		return new Promise(resolve => {
			if (!this.dic.volume) return resolve({});
			api.postData(api.getUrlFee(), { data: orderObject })
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					logDevice('info', `error getFees: ${JSON.stringify(err)}`);
					resolve({});
				});
		});
	}

	selectedMarket() {
		if ([orderTypeEnum.MARKET_ORDER, orderTypeEnum.MARKETTOLIMIT_ORDER].indexOf(this.dic.orderType) !== -1) return;
		this.dic.orderType = this.dic.isAuBySymbol
			? orderTypeEnum.MARKETTOLIMIT_ORDER
			: orderTypeEnum.MARKET_ORDER
	}

	isStopLossOrder() {
		return (this.dic.orderType === orderTypeEnum.STOPLOSS_ORDER || this.dic.orderType === orderTypeEnum.STOPLIMIT_ORDER)
	}

	changeOrderType(val = '') {
		try {
			val = Translate.translateCustomLang(val)
			let orderType;
			switch ((val + '').toUpperCase()) {
				case orderTypeString.LIMIT:
					orderType = orderTypeEnum.LIMIT_ORDER
					if (this.isStopLossOrder()) {
						this.dic.isBuy = true;
					}
					break;
				case orderTypeString.MARKET:
				case orderTypeString.MARKETTOLIMIT:
					orderType = this.dic.isAuBySymbol
						? orderTypeEnum.MARKETTOLIMIT_ORDER
						: orderTypeEnum.MARKET_ORDER
					if (this.isStopLossOrder()) {
						this.dic.isBuy = true;
					}
					break;
				case orderTypeString.STOPLOSS:
					if (this.dic.isAuBySymbol) { // voi ma Uc thi STOPLOSS = STOPLIMIT, nhung khi hien thi van hien thi STOPLOSS
						orderType = orderTypeEnum.STOPLIMIT_ORDER;
					} else {
						orderType = orderTypeEnum.STOPLOSS_ORDER
					}
					if (this.isDisableButtonBuy(orderType)) {
						this.dic.isBuy = false;
					}
					break;
				case orderTypeString.STOPLIMIT:
					orderType = orderTypeEnum.STOPLIMIT_ORDER;
					if (this.isDisableButtonBuy(orderType)) {
						this.dic.isBuy = false;
					}
					break;
				default: break;
			}
			if (orderType !== this.dic.orderType) {
				this.dic.orderType = orderType;
				this.getLastPrice();
				// this.getDuration();
				// this.getExchange();
				this.dic.duration = this.getLastData(keyLast.DURATION); //  keep duration & exchange by orderType
				this.dic.exchange = this.getLastData(keyLast.EXCHANGE);
				this.dic.date = this.getLastData(keyLast.DATE);
				this.dic.datePeriod = this.getLastData(keyLast.DATE_PERIOD);
				this.dic.isDatePickerUsed = this.getLastData(keyLast.IS_DATE_PICKER_USED);
				// Get duration list
				if (this.dic.symbolObject) {
					const { class: classSymbol } = this.dic.symbolObject;
					if (classSymbol === 'future' || !this.dic.isAuBySymbol) { // Những mã con của future khi click sau khi expand mình đang không lưu symbol info vào dic -> check AU/US qua currency sẽ trả về AU -> dẫn đến sai list duration
						this.dic.listDuration = Business.getListDurationStringByOrderTypeSystem(this.dic.orderType, this.dic.code, this.dic.classSelectedSymbol)
					} else {
						this.dic.listDuration = Business.getListDurationByClass(this.dic.classSelectedSymbol, this.dic.orderType, this.dic.isNSXSymbol)
					}
				}
				// Get exchange list
				let exchangeObj = {};
				if (this.dic.isAuBySymbol) {
					exchangeObj = Business.getListExchangeByClassAndOrderType({
						classSymbol: this.dic.classSelectedSymbol,
						orderType: this.dic.orderType,
						isNSXSymbol: this.dic.isNSXSymbol,
						duration: this.dic.duration
					})
				} else {
					exchangeObj = Business.getListTradingMarket(this.dic.code)
				}
				this.dic.listExchange = exchangeObj.listExchange || [];
				this.dic.dicExchange = exchangeObj.dicExchange || {};
				// End of getting list
				this.setState({});
				this.updateFee() // Đổi order type sẽ lấy giá last -> đổi fee
			}
		} catch (error) {
			console.log('changeOrderType', error)
		}
	}

	getLastPrice() {
		this.dic.limitPrice = this.getLastData(keyLast.LIMIT_PRICE);
		this.dic.stopPrice = this.getLastData(keyLast.STOP_PRICE)
	}
	addRef = (ref, key) => {
		this.dic.listRefPicker[key] = ref
	}
	renderOrderType() {
		let listOrderType = this.dic.listOrderType || [];
		let selectedValStr;
		if (this.dic.isAuBySymbol && this.dic.orderType === orderTypeEnum.STOPLIMIT_ORDER) {
			selectedValStr = ORDER_TYPE_STRING.STOPLOSS_ORDER;
		} else {
			selectedValStr = ORDER_TYPE_STRING[this.dic.orderType]
		}
		let selectedVal = Util.getStringable(selectedValStr);
		listOrderType = Translate.getListInvertTranslate(listOrderType);
		selectedVal = Translate.getInvertTranslate(selectedVal);
		if (listOrderType.length === 1) {
			return this.renderAtribute(selectedVal, I18n.t('orderType'))
		}
		return (
			<View renderToHardwareTextureAndroid={true} ref={ref => this.addRef(ref, TYPE_PICKER.ORDER_TYPE)} style={{ width: '100%', marginBottom: 16 }}>
				<PickerCustom
					scrollCallback={fn => this.dic.scrollCb['OrderType'] = fn}
					testID={`newOrderOrderType`}
					navigator={this.dic.nav}
					ratio={0.5}
					name='OrderType'
					// disabled={!this.props.isConnected}
					editable={false}
					type={TYPE_PICKER.ORDER_TYPE}
					floatingLabel={I18n.t('orderType')}
					textTransform={'uppercase'}
					selectedValue={selectedVal}
					getTop={this.getTop}
					onValueChange={this.changeOrderType}
					data={listOrderType}
					topHeight={this.topHeight}
				/>
			</View>
		);
	}

	getReloadFuncLv2(funcReload) {
		this.reloadFuncLv2 = funcReload;
	}

	getReloadFuncCos(funcReload) {
		this.reloadFuncCos = funcReload;
	}

	validatePrice = (newValue, type) => {
		try {
			let oldStr;
			switch (type) {
				case 'limit':
					oldStr = this.getLastData(keyLast.LIMIT_PRICE).toString()
					break;
				case 'stop':
					oldStr = this.getLastData(keyLast.STOP_PRICE).toString()
					break;
				default:
					break;
			}
			const newStr = newValue
			const oldStrLength = oldStr.length
			const newStrLength = newStr.length
			const listValue = (oldStr + '').split('.');
			if (newStrLength <= oldStrLength) {
				// Xoá
				return true
			}
			if (listValue && listValue[0] && listValue[0].length > 15) return false;
			if (oldStr.includes('.')) {
				// Thêm character
				const regex = /^[0-9]*\.([0-9]{0,4})?$/;
				return !!newValue.match(regex);
			} else {
				const regex = /^[0-9]*\.?([0-9]{0,4})?$/;
				return !!newValue.match(regex);
			}
		} catch (error) {
			console.log('error at validatePrice', error)
		}
	}

	changeLimitPrice(val) {
		const validate = this.validatePrice(val, 'limit');
		if (val === '') this.isChangeTextLimit = false;
		let limitValue;
		if (validate) {
			limitValue = Util.removeZeroCharacterAtStart(val)
			limitValue = Util.removeCommaCharacter(limitValue)
			this.dic.limitPriceChange = true;
			this.dic.limitPrice = limitValue;
			this.refLimitPrice && this.refLimitPrice.setNativeProps({
				text: formatNumberNew2(limitValue, PRICE_DECIMAL.PRICE)
			})
			this.checkErrorAndChangeFees(true);
			this.setLastData(keyLast.LIMIT_PRICE, limitValue);
		} else {
			limitValue = this.getLastData(keyLast.LIMIT_PRICE);
			this.refLimitPrice && this.refLimitPrice.setNativeProps({
				text: formatNumberNew2(limitValue, PRICE_DECIMAL.PRICE)
			})
		}
		this.setState({});
	}

	changeStopPrice(val) {
		const validate = this.validatePrice(val, 'stop');
		if (val === '') this.isChangeTextStop = false;
		let stopValue;
		if (validate) {
			stopValue = Util.removeZeroCharacterAtStart(val)
			stopValue = Util.removeCommaCharacter(stopValue)
			this.dic.stopPriceChange = true;
			this.dic.stopPrice = stopValue;
			this.refStopTriggerPrice && this.refStopTriggerPrice.setNativeProps({
				text: stopValue
			})
			this.checkErrorAndChangeFees(true);
			this.setLastData(keyLast.STOP_PRICE, stopValue);
		} else {
			stopValue = this.getLastData(keyLast.STOP_PRICE);
			this.refStopTriggerPrice && this.refStopTriggerPrice.setNativeProps({
				text: stopValue
			})
		}
		this.setState({});
	}

	validateVolume = (newVolume) => {
		const oldStr = this.dic.volume || '0'
		const newStr = newVolume
		const oldStrLength = oldStr.length
		const newStrLength = newStr.length
		if (newStrLength > 15) return false;
		if (newStrLength <= oldStrLength) {
			// Xoá
			return true
		} else return /^[0-9]*$/.test(newStr);
	};

	autoOpenDetail() {
		if (this.dic.volume === 0 && !this.dic.isExpand['Detail']) {
			this.pureCollapsible && this.pureCollapsible.onClick()
		}
	}

	changeVolume(val) {
		this.getCommodityInfoPromise && this.getCommodityInfoPromise()
		const validate = this.validateVolume(val);
		if (val === '') this.isChangeTextVolume = false;
		if (validate) {
			val = Util.removeZeroCharacterAtStart(val);
			val = Util.clearCommaCharacter(val);
			val = Util.removeSpaces(val);
			this.autoOpenDetail()
			this.dic.volume = Math.abs(val);
			this.dic.userVolume = this.dic.volume;
			this.refQuantityInput && this.refQuantityInput.setNativeProps({
				text: val
			});
			this.checkErrorAndChangeFees();
		} else {
			this.refQuantityInput && this.refQuantityInput.setNativeProps({
				text: this.dic.volume.toString()
			});
		}
		this.setState({});
	}

	renderAtribute(value, label) {
		return (
			<View style={{
				width: '100%',
				paddingHorizontal: 16,
				marginBottom: 24,
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}>
				<Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeXS }]}>{label}</Text>
				<Text numberOfLines={1} style={[CommonStyle.textMain, { fontSize: CommonStyle.fontSizeXS, color: CommonStyle.colorProduct, fontFamily: CommonStyle.fontPoppinsRegular }]}>{value}</Text>
			</View>
		);
	}

	getObjectFee() {
		try {
			if (!this.dic.code || !this.dic.volume) return null;
			return {
				account_id: this.dic.currentAccount.account_id,
				code: this.dic.code,
				volume: parseInt(this.dic.volume),
				exchange: Business.getExchangeCode(this.dic.symbolObject),
				order_type: Business.getOrderTypeExchangeByOrderTypeSystem(this.dic.orderType),
				is_buy: this.dic.isBuy,
				duration: this.dic.duration,
				note: '',
				limit_price: parseFloat(this.dic.limitPrice),
				stop_price: parseFloat(this.dic.stopPrice)
			};
		} catch (error) {
			console.log('getObjectFee', error)
			let a = 1
		}
	}

	getObjectOrderPlace() {
		try {
			if (!this.dic.code || !this.dic.volume) return null;
			const exchange = Business.isParitech(this.dic.code) ? 'ASX' : Business.getExchangeCodeSaxo(this.dic.symbolObject)
			const note = {
				order_type: Business.getOrderTypeExchangeByOrderTypeSystem(this.dic.orderType),
				exchange,
				order_state: NOTE_STATE.USER_PLACE,
				data: {
					side: this.dic.isBuy ? 'buy' : 'sell',
					volume: parseInt(this.dic.volume),
					limit_price: parseFloat(this.dic.limitPrice),
					stop_price: parseFloat(this.dic.stopPrice)
				}
			}

			return {
				account_id: this.dic.currentAccount.account_id,
				code: this.dic.code,
				volume: parseInt(this.dic.volume),
				exchange: Business.isParitech(this.dic.code)
					? this.dic.exchange
					: Business.getExchangeCodeSaxo(this.dic.symbolObject),
				order_type: Business.getOrderTypeExchangeByOrderTypeSystem(this.dic.orderType),
				is_buy: this.dic.isBuy,
				duration: this.dic.duration,
				expire_date: this.isGoodTillDate() ? moment(this.dic.date).format('YYYYMMDD') : null,
				note: JSON.stringify(note),
				limit_price: this.dic.orderType === orderTypeEnum.STOPLIMIT_ORDER ||
					this.dic.orderType === orderTypeEnum.LIMIT_ORDER
					? parseFloat(this.dic.limitPrice) || 0
					: null,
				stop_price: this.dic.orderType === orderTypeEnum.STOPLIMIT_ORDER ||
					this.dic.orderType === orderTypeEnum.STOPLOSS_ORDER ||
					this.dic.orderType === orderTypeEnum.STOPLOSS_ORDER
					? parseFloat(this.dic.stopPrice) || 0
					: null
			};
		} catch (error) {
			console.log('getObjectOrderPlace error', error)
			let a = 1
		}
	}

	isGoodTillDate() {
		return this.dic.duration === DURATION_CODE.GTD;
	}

	changeDuration(val = '') {
		const valConvert = Translate.translateCustomLang(val);
		const durationCode = DURATION_MAPPING_STRING_CODE[valConvert];
		if (valConvert === DURATION_STRING.GTD) {
			this.setLastData(keyLast.DATE, this.dic.date);
			this.setLastData(keyLast.DATE_PERIOD, this.dic.datePeriod);
			this.setLastData(keyLast.IS_DATE_PICKER_USED, this.dic.isDatePickerUsed);
		}
		this.dic.duration = durationCode || '';
		this.setLastData(keyLast.DURATION, this.dic.duration);
		this.getExchange();
		this.setLastData(keyLast.EXCHANGE, this.dic.exchange);
		this.setState({});
	}

	changeExchange(data) {
		const exchangeSelected = data && data.value
		if (this.dic.exchange === exchangeSelected) return;
		this.dic.exchange = exchangeSelected;
		this.setLastData(keyLast.EXCHANGE, this.dic.exchange);
		// this.getOrderType();
		// const forceUpdate = true;
		// this.getDuration(forceUpdate);
		this.setState({});
	}

	renderDuration() {
		if (this.dic.symbolObject) {
			const { class: classSymbol } = this.dic.symbolObject;
			if (classSymbol === 'future' || !this.dic.isAuBySymbol) { // Những mã con của future khi click sau khi expand mình đang không lưu symbol info vào dic -> check AU/US qua currency sẽ trả về AU -> dẫn đến sai list duration
				this.dic.listDuration = Business.getListDurationStringByOrderTypeSystem(this.dic.orderType, this.dic.code, this.dic.classSelectedSymbol)
			} else {
				this.dic.listDuration = Business.getListDurationByClass(this.dic.classSelectedSymbol, this.dic.orderType, this.dic.isNSXSymbol)
			}
		}
		let selectedVal = Util.getStringable(DURATION_STRING[this.dic.duration]);
		const listDuration = Translate.getListInvertTranslate(this.dic.listDuration);
		selectedVal = Translate.getInvertTranslate(selectedVal);
		return (
			<View renderToHardwareTextureAndroid={true} ref={ref => this.addRef(ref, TYPE_PICKER.DURATION)} style={{ width: '100%', marginBottom: 16 }}>
				<PickerCustom
					testID={`newOrderDuration`}
					ratio={0.6}
					navigator={this.dic.nav}
					name='Duration'
					// disabled={!this.props.isConnected}
					editable={false}
					type={TYPE_PICKER.DURATION}
					disableCapitalize={true}
					floatingLabel={I18n.t('duration')}
					selectedValue={selectedVal}
					getTop={this.getTop}
					onValueChange={this.changeDuration}
					data={listDuration} />
			</View>
		);
	}

	handleDatePicked(date, callback) {
		this.dic.date = date;
		this.setLastData(keyLast.DATE, date);
		callback && callback(true);
		this.setState({})
	}

	showDatePicker() {
		this.dic.date = this.getDefaultDatePicker();
		this.dic.isDatePickerUsed = true;
		this.setLastData(keyLast.DATE, this.dic.date);
		this.setLastData(keyLast.IS_DATE_PICKER_USED, true);
		this.setState({}, () => {
			try {
				this.dic.datePickerRef.showDatePicker();
			} catch (e) { }
		});
	}

	getTimeByLocation() {
		const timezone = (this.dic.isFuture || this.dic.isAuBySymbol) ? Controller.getTimeZoneAU() : Controller.getTimeZoneUS();
		let now = (new Date(this.dic.timestamp)).getTime();
		const timeByLocation = Util.convertToCustomTimezone(now, timezone);
		// console.log('----timebyLocation---', timeByLocation)
		if (this.dic.isFuture || this.dic.isAuBySymbol) {
			// console.log('----timebyFuture vs au---', PureFunc.getAuDateGTD(timeByLocation))
			return PureFunc.getAuDateGTD(timeByLocation)
		} else {
			return timeByLocation
		}
	}

	checkDurationDateByLocation() {
		const timeByLocation = this.getTimeByLocation();
		return new Date(timeByLocation)
	}

	addDaysToDate(days, timeserver) {
		try {
			let date = new Date(timeserver);
			date.setDate(date.getDate() + days);
			this.dic.date = date;
		} catch (e) { }
	}

	setDateFromDatePeriod(timeserver) {
		const datePeriod = String(this.dic.datePeriod);
		try {
			/**
			 * datePeriod = (number)(time[DWMY]). E.g: 12D, 566W, 32M, 23Y,...
			 */
			let number = Number(datePeriod.slice(0, datePeriod.length - 1));
			let time = datePeriod.slice(datePeriod.length - 1, datePeriod.length);
			switch (time) {
				case 'D': {
					this.addDaysToDate(number, timeserver);
					break;
				}
				case 'W': {
					this.addDaysToDate(7 * number, timeserver);
					break;
				}
				/**
				 * JS datetime is able to increase it's current time with specific months.
				 * If the current day exceeds the maximum number of days of month in the future time,
				 * the time will be automatically converted into the 1st day of the following month.
				 * E.g: 31st Jan + 1 month = 1st Mar (since there are only 28 or 29 days in Feb).
				 * * Note:
				 * 	- Syntax: Date.setMonth(month, day)
				 * 	- Month: expected values are 0-11, but other values are allowed:
				 * 		. -1 will result in the last month of the previous year.
				 * 		. 12 will result in the first month of the next year.
				 *		. 13 will result in the second month of the next year.
				 *	- Day: [Optional] An integer representing the day of month
				 * 		. Expected values are 1-31, but other values are allowed:
				 *			0 will result in the last day of the previous month
				 *			-1 will result in the day before the last day of the previous month
				 *		. If the month has 31 days:
				 *			32 will result in the first day of the next month
				 *		. If the month has 30 days:
				 *			32 will result in the second day of the next month
				 */
				case 'M': {
					let date = new Date(timeserver);
					let currentDate = date.getDate();
					date.setMonth(date.getMonth() + number);
					let futureDate = date.getDate();
					if (currentDate !== futureDate) {
						/**
						 * Date.setDate(0) will result in the last day of the previous month.
						 */
						date.setDate(0);
					}
					this.dic.date = date;
					break;
				}
				/**
				 * JS Date.setFullYear() works similar to JS Date.setMonth, which will
				 * automatically convert the future time into the 1st day of the following month,
				 * if the current day exceeds the maximum number of days of month in the future time.
				 * For more detail: https://www.w3schools.com/jsref/jsref_setfullyear.asp
				 */
				case 'Y': {
					let date = new Date(timeserver);
					let currentDate = date.getDate();
					date.setFullYear(date.getFullYear() + number);
					let futureDate = date.getDate();
					if (currentDate !== futureDate) {
						date.setDate(0);
					}
					this.dic.date = date;
					break;
				}
			}
		} catch (e) { }
	}

	switchToDatePeriod() {
		this.dic.date = this.getDefaultDatePicker();
		this.dic.datePeriod = '';
		this.setLastData(keyLast.DATE_PERIOD, '');
		this.setLastData(keyLast.IS_DATE_PICKER_USED, false);
		this.dic.isDatePickerUsed = false;
		this.setState({}, () => {
			try {
				this.dic.datePeriodTextInputRef.focus();
			} catch (e) {
				console.log('datePeriodTextInputRef', e);
			}
		});
	}

	handleShowDateInstructionModal() {
		Controller.setStatusModalCurrent(true);
		this.props.navigator.showModal({
			screen: 'equix.AlertCommon',
			navigatorStyle: {
				...CommonStyle.navigatorStyleCommon,
				modalPresentationStyle: 'overCurrentContext'
			},
			animationType: 'none',
			passProps: {
				renderContent: this.renderDateInstructionModal
			}
		})
	}

	renderDateInstructionModal({ onDissmisModal }) {
		return (
			<View style={styles.dateInstructionModal.container}>
				<View style={styles.dateInstructionModal.instructionText.container}>
					<Text style={[styles.dateInstructionModal.instructionText.commonTextStyle, {
						textDecorationLine: 'underline'
					}]}>
						{I18n.t('dateInstructionPart1')}
					</Text>
					<Text style={styles.dateInstructionModal.instructionText.commonTextStyle}>
						<Text style={{ fontWeight: '500' }}>
							{I18n.t('number')}
						</Text>
						Day
						<Text style={{ fontWeight: '500' }}> (D)</Text>
						, Week
						<Text style={{ fontWeight: '500' }}> (W)</Text>
						,{'\n'}Month
						<Text style={{ fontWeight: '500' }}> (M)</Text>
						, Year
						<Text style={{ fontWeight: '500' }}> (Y).</Text>
					</Text>
					<Text style={[styles.dateInstructionModal.instructionText.commonTextStyle, {
						fontStyle: 'italic'
					}]}>
						{I18n.t('dateInstructionPart2')}
					</Text>
					<Text style={styles.dateInstructionModal.instructionText.commonTextStyle}>
						{I18n.t('orUppercase')}
						<Text style={{
							fontWeight: '500'
						}}>
							{I18n.t('pickADate2')}
						</Text>
						{I18n.t('dateInstructionPart3')}
						<Icon
							name={'md-calendar'}
							size={CommonStyle.fontSizeM}
							color={CommonStyle.fontColor} />
					</Text>
				</View>

				{/* Horizontal line */}
				<View style={{ height: 1, width: '100%', backgroundColor: CommonStyle.fontBorderGray }} />
				{/* Horizontal line */}

				<View style={styles.dateInstructionModal.buttonConfirm.container}>
					<TouchableOpacity
						style={styles.dateInstructionModal.buttonConfirm.button.container}
						onPress={onDissmisModal}>
						<Text style={styles.dateInstructionModal.buttonConfirm.button.text}>
							{I18n.t('ok')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	/**
	 * Set default value to datepicker's value, as current time add 1 day.
	 * @return Date
	 */
	getDefaultDatePicker() {
		let date = new Date(this.dic.timestamp);
		date.setDate(date.getDate() + 1);
		return date;
	}

	onChangeDatePeriod(datePeriod) {
		if (datePeriod) {
			datePeriod = PureFunc.removeAllZeroBeforeNumber(String(datePeriod).toUpperCase());
			const pattern = /^[1-9DWMY]$/g;
			// If there is only 1 character left after removing zero, check if it is a digit or 1 of these characters: D,W,M,Y
			if (datePeriod.length === 1) {
				if (datePeriod.match(pattern)) {
					this.dic.datePeriod = datePeriod;
				}
			} else {
				if (PureFunc.validateDatePeriodOnChangeText(datePeriod)) {
					this.dic.datePeriod = datePeriod;
				}
			}
		} else {
			this.dic.datePeriod = '';
		}
		this.setLastData(keyLast.DATE_PERIOD, this.dic.datePeriod);
		this.setState({});
	}

	renderDate() {
		if (this.isGoodTillDate()) {
			this.dic.date = this.getLastData(keyLast.DATE);
			if (!this.dic.date) {
				this.dic.date = this.getDatePeriodError();
			}
			return <View
				style={{
					flexDirection: 'row',
					paddingHorizontal: 16,
					marginBottom: 16,
					minHeight: 32,
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
				<View style={{
					flexDirection: 'row'
				}}>
					<View style={{ justifyContent: 'center' }}>
						<Text style={[
							CommonStyle.textNewOrder, {
								fontSize: CommonStyle.fontSizeS,
								marginRight: 8
							}
						]}>
							{I18n.t('date')}
						</Text>
					</View>
					<TouchableOpacity
						onPress={this.handleShowDateInstructionModal}
						style={{
							justifyContent: 'center'
						}}>
						<Icon
							name={'ios-information-circle'}
							color={CommonStyle.fontIconInfor}
							size={CommonStyle.fontSizeL} />
					</TouchableOpacity>
				</View>
				<View
					style={{
						width: 216,
						borderColor: this.dic.datePeriodError ? CommonStyle.fontRed : CommonStyle.fontColorSwitchTrue,
						borderWidth: 1,
						borderRadius: 32,
						justifyContent: 'flex-end',
						alignItems: 'center',
						paddingRight: 16,
						flexDirection: 'row'
					}}>
					{
						this.getLastData(keyLast.IS_DATE_PICKER_USED)
							? <DatePicker
								ref={ref => this.dic.datePickerRef = ref}
								handleDatePicked={this.handleDatePicked}
								date={this.dic.date}
								minimumDate={this.checkDurationDateByLocation()}
								isDatePickerUsed={true}
								switchToDatePeriod={this.switchToDatePeriod}
								wrapperTextStyle={{
									flex: 1,
									paddingRight: 8,
									alignItems: 'flex-end'
								}} />
							: <Fragment>
								<View style={{
									marginRight: 8,
									maxWidth: 170
								}}>
									<TextInput
										ref={ref => this.dic.datePeriodTextInputRef = ref}
										value={this.dic.datePeriod}
										underlineColorAndroid={'transparent'}
										placeholder={this.dic.datePeriodPlaceholder}
										placeholderTextColor={CommonStyle.placeholderTextColor}
										style={{
											color: CommonStyle.colorProduct,
											fontFamily: CommonStyle.fontMedium,
											fontSize: CommonStyle.fontSizeXS,
											maxHeight: 20,
											width: 170,
											textAlign: 'right',
											paddingVertical: 0,
											opacity: 0.87
										}}
										onChangeText={this.onChangeDatePeriod} />
								</View>
								<TouchableOpacityOpt
									onPress={this.showDatePicker}>
									<DatePicker
										ref={ref => this.dic.datePickerRef = ref}
										handleDatePicked={this.handleDatePicked}
										date={this.dic.date}
										minimumDate={this.checkDurationDateByLocation()}
										wrapperTextStyle={{
											flex: 1,
											paddingRight: 8,
											alignItems: 'flex-end'
										}} />
								</TouchableOpacityOpt>
							</Fragment>
					}
				</View>
			</View>
		}
		return <View />
	}
	getTop = (type) => {
		return new Promise(resolve => {
			const ref = this.dic.listRefPicker[type]
			if (ref) {
				ref.measure((fx, fy, width, height, px, py) => {
					resolve({ top: py + height, height })
				})
			} else {
				resolve(0)
			}
		})
	}
	renderExchange() {
		if ((this.dic.listExchange && this.dic.listExchange.length === 1) || (!this.dic.listExchange || !this.dic.listExchange.length)) {
			const label = this.dic.listExchange && this.dic.listExchange[0] ? (this.dic.listExchange[0].label || '') : ''
			return this.renderAtribute(label, I18n.t('exchange'))
		}
		const displayExchange = this.dic.dicExchange[this.dic.exchange]
		return (
			<View renderToHardwareTextureAndroid={true} ref={ref => this.addRef(ref, TYPE_PICKER.EXCHANGE)} style={{ width: '100%', marginBottom: 16 }}>
				<PickerCustom
					testID={`newOrderExchange`}
					navigator={this.dic.nav}
					ratio={0.5}
					name='Exchange'
					// disabled={!this.props.isConnected}
					editable={false}
					floatingLabel={I18n.t('exchange')}
					disableCapitalize={true}
					selectedValue={displayExchange}
					onValueChange={this.changeExchange}
					type={TYPE_PICKER.EXCHANGE}
					checkSelected={this.checkSelectedExchange}
					getTop={this.getTop}
					data={this.dic.listExchange} />
			</View>
		);
	}
	checkSelectedExchange = (el, value) => {
		return el.label === value
	}
	getSymbol(symbol) {
		return new Promise(resolve => {
			if (dataStorage.symbolEquity[symbol]) {
				return resolve(dataStorage.symbolEquity[symbol]);
			}
			getSymbolInfoApi(symbol, () => {
				return resolve(dataStorage.symbolEquity[symbol]);
			});
		});
	}

	async getCommodityInfoPromise() {
		if (Business.isFuture(this.dic.classSelectedSymbol)) {
			const combodityInfoRes = await getCommodityInfo(this.dic.symbolObject.symbol)
			this.dic.combodityInfo = combodityInfoRes
		}
		return this.dic.combodityInfo
	}
	getFeesPromise = async (requestID) => {
		return new Promise(resolve => {
			api.postData(api.getUrlFee(), { data: this.dic.orderObj })
				.then(data => {
					const feeObj = data || {};
					const checkRequestIDFee = this.updateFeeAfterCheckRequestID(requestID)
					if (checkRequestIDFee) {
						this.dic.feeObj = feeObj;
						resolve(feeObj)
					}
				}).catch(e => {
					console.log(e)
					resolve()
				});
		})
	}

	getClassBySymbol({ symbol, classSymbol }) {
		if (classSymbol) return classSymbol
		return Business.getClassBySymbol(symbol)
	}

	async setCode(symbol, company, classSymbol, isInit) {
		try {
			if (isInit) {
				setTimeout(() => {
					this.nestedScroll && this.nestedScroll.snapContainerTopTop();
				}, 500)
			}
			this.dic.classSelectedSymbol = this.getClassBySymbol({ symbol, classSymbol });
			this.dic.isAuBySymbol = Business.isParitech(symbol);
			this.dic.isNSXSymbol = Business.isNSXSymbol(symbol);
			this.dic.isFuture = Business.isFuture(this.dic.classSelectedSymbol);
			const subSymbol = func.getSymbolObj(symbol) || data;
			if (!isInit && this.props.isConnected) {
				if (subSymbol.master_code) {
					this.props.actions.saveHistory({
						symbol: subSymbol.master_code,
						company,
						classSymbol
					});
				} else {
					this.props.actions.saveHistory({ symbol, company, classSymbol });
				}
			}
			this.dic.code = symbol;
			this.resetFormInfo(isInit);
			if (this.props.isConnected) {
				await this.loadDataAll(true);
			}
		} catch (error) {
			logDevice('error', `Error func setCode: ${JSON.stringify(error)}`)
		}
	}

	closeAlert() {
		this.showRefreshButton();
	}

	clearAllData(isSearch = false) {
		this.dic.userVolume = 0;
		this.dic.volume = 0;
		this.dic.isBuy = true;
		this.dic.limitPrice = 0;
		this.dic.stopPrice = 0;
		this.resetDatePicker();
		this.getOrderType();
		this.getExchange();
		this.getDuration();
		this.setDicOrders()
		this.setState({
			tradingHalt: false,
			isSearch
		});
	}

	showDifferentNoteModal() {
		this.props.navigator.showModal({
			screen: 'equix.AlertCommon',
			navigatorStyle: {
				...CommonStyle.navigatorStyleCommon,
				modalPresentationStyle: 'overCurrentContext'
			},
			animationType: 'none',
			passProps: {
				renderContent: this.renderDifferentNote
			}
		})
	}

	hideDifferentNoteModal() {
		this.props.navigator && this.props.navigator.dismissModal()
	}

	renderHorizontalLine() {
		return (
			<View style={{ height: 1, backgroundColor: CommonStyle.fontBorderGray }} />
		)
	}

	renderDifferentNote({ onDissmisModal }) {
		return (
			<View style={{
				backgroundColor: CommonStyle.backgroundColor,
				borderWidth: 1,
				borderColor: '#d6d7da',
				borderRadius: 12,
				marginHorizontal: 32,
				overflow: 'hidden'
			}}>
				<View style={{
					backgroundColor: CommonStyle.backgroundColor,
					borderBottomColor: CommonStyle.fontBorderGray,
					borderBottomWidth: 1,
					padding: 16
				}}>
					<Text style={[{
						fontSize: CommonStyle.font17,
						color: CommonStyle.fontColor,
						opacity: 0.8,
						textAlign: 'center'
					}]}>
						{I18n.t('differentCashNote')}
					</Text>
				</View>

				<TouchableOpacity style={{ marginVertical: 12, width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={onDissmisModal}>
					<Text style={{ color: CommonStyle.fontApple, textAlign: 'center', fontWeight: '500' }}>{I18n.t('gotItUpcase')}</Text>
				</TouchableOpacity>
			</View>
		)
	}

	renderHeader(title) {
		return (
			<View style={{ paddingLeft: 16, height: 48, justifyContent: 'center', marginTop: 10, backgroundColor: CommonStyle.colorHeaderAll }}>
				<Text style={[CommonStyle.fontLargeNormal1]}>{title}</Text>
			</View>
		);
	}

	updateStatusFocusAndBlur(isFocus, type) {
		switch (type) {
			case I18n.t('quantity'):
				if (isFocus) {
					this.dic.isFocusQuantity = true;
					this.isBlurQuantity = false;
				} else {
					this.dic.isFocusQuantity = false;
					this.isBlurQuantity = true;
				}
				this.dic.isFocusLimitPrice = false;
				this.dic.isFocusStopTriggerPrice = false;
				this.isBlurLimitPrice = true;
				this.isBlurStopTriggerPrice = true
				break;
			case I18n.t('limitPrice'):
				if (isFocus) {
					this.dic.isFocusLimitPrice = true;
					this.isBlurLimitPrice = false;
				} else {
					this.dic.isFocusLimitPrice = false;
					this.isBlurLimitPrice = true;
				}
				this.dic.isFocusQuantity = false;
				this.dic.isFocusStopTriggerPrice = false;
				this.isBlurQuantity = true;
				this.isBlurStopTriggerPrice = true;
				break;
			case I18n.t('stopTriggerPrice'):
				if (isFocus) {
					this.dic.isFocusStopTriggerPrice = true;
					this.isBlurStopTriggerPrice = false;
				} else {
					this.dic.isFocusStopTriggerPrice = false;
					this.isBlurStopTriggerPrice = true;
				}
				this.dic.isFocusQuantity = false;
				this.dic.isFocusLimitPrice = false;
				this.isBlurLimitPrice = true;
				this.isBlurLimitPrice = true;
				break;
			default:
				break;
		}
	}
	onFocusAndBlur = (type, isFocus) => {
		this.updateStatusFocusAndBlur(isFocus, type);
		switch (type) {
			case I18n.t('quantity'):
				this.refQuantityInput && this.refQuantityInput.setNativeProps({
					text: isFocus ? (this.isChangeTextVolume ? this.dic.volume.toString() : '') : formatNumber(this.dic.volume, PRICE_DECIMAL.VOLUME)
				})
				break;
			case I18n.t('limitPrice'):
				this.refLimitPrice && this.refLimitPrice.setNativeProps({
					text: isFocus ? (this.isChangeTextLimit ? this.dic.limitPrice.toString() : '') : formatNumberNew2(this.dic.limitPrice, PRICE_DECIMAL.PRICE)
				})
				break;
			case I18n.t('stopTriggerPrice'):
				this.refStopTriggerPrice && this.refStopTriggerPrice.setNativeProps({
					text: isFocus ? (this.isChangeTextStop ? this.dic.stopPrice.toString() : '') : formatNumberNew2(this.dic.stopPrice, PRICE_DECIMAL.PRICE)
				})
				break;
			default:
				break;
		}
	}
	handleRefInput = (ref, title) => {
		switch (title) {
			case I18n.t('quantity'):
				this.refQuantityInput = ref;
				break;
			case I18n.t('limitPrice'):
				this.refLimitPrice = ref;
				break;
			case I18n.t('stopTriggerPrice'):
				this.refStopTriggerPrice = ref;
				break;
			default:
				break;
		}
	}
	renderInput({ title, value, onChangeText, editable, maxLen = 17, keyboardType = 'numeric', format = TYPE_VALID_CUSTOM_INPUT.INTEGER, styleError }) {
		return (
			<View style={{
				width: '100%',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				paddingHorizontal: 16,
				marginBottom: 16
			}}>
				<Text style={[CommonStyle.textNewOrder, {
					fontSize: CommonStyle.fontSizeXS,
					textAlign: 'left',
					justifyContent: 'center',
					color: CommonStyle.fontColor
				}]}>
					{title}
				</Text>
				<TextInput
					onFocus={() => this.onFocusAndBlur(title, true)}
					onBlur={() => this.onFocusAndBlur(title)}
					testID={``}
					editable={editable || true}
					ref={ref => this.handleRefInput(ref, title)}
					keyboardType={keyboardType || 'numeric'}
					underlineColorAndroid='transparent'
					placeholderTextColor={CommonStyle.colorProduct}
					value={value}
					style={[
						styles.pickerContainer,
						CommonStyle.textMain,
						{
							color: CommonStyle.colorProduct,
							width: 216,
							height: 32,
							borderRadius: 15.5,
							borderWidth: 1,
							borderColor: CommonStyle.backgroundNewSearchBar,
							paddingHorizontal: 16,
							textAlign: 'right',
							paddingVertical: 4,
							justifyContent: 'flex-end',
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.fontSizeXS
						},
						styleError || {}
					]}
					onChangeText={onChangeText}
				/>
				{/* <ComponentInput
					keyboardType={keyboardType}
					underlineColorAndroid='transparent'
					maxLength={maxLen}
					placeholder={'0'}
					placeholderTextColor='black'
					format={format}
					editable={editable}
					value={value + ''}
					style={[
						styles.pickerContainer,
						CommonStyle.textMain,
						{
							width: 216,
							height: 32,
							borderRadius: 2,
							borderWidth: 1,
							borderColor: CommonStyle.borderTextBox,
							paddingHorizontal: 16,
							textAlign: 'right',
							paddingVertical: 4,
							justifyContent: 'flex-end'
						}
					]}
					onChangeText={onChangeText} /> */}
			</View>
		)
	}
	formatValueQuantiTy = () => {
		return this.dic.isFocusQuantity ? this.dic.volume.toString() : formatNumber(this.dic.volume, PRICE_DECIMAL.VOLUME)
	}
	renderQuantity() {
		return this.renderInput({
			title: I18n.t('quantity'),
			value: this.formatValueQuantiTy(),
			onChangeText: this.onChangeText.bind(this, 'volume'),
			styleError: { borderColor: this.errorForm === I18n.t('volumeRequired') ? 'red' : CommonStyle.backgroundNewSearchBar },
			editable: this.props.isConnected,
			format: TYPE_VALID_CUSTOM_INPUT.INTEGER,
			keyboardType: KEYBOARD_TYPE.NUMERIC
		});
	}
	formatPriceLimit = () => {
		return this.dic.isFocusLimitPrice ? this.dic.limitPrice.toString() : formatNumberNew2(this.dic.limitPrice, PRICE_DECIMAL.PRICE)
	}
	renderLimitPrice() {
		return this.renderInput({
			title: I18n.t('limitPrice'),
			value: this.formatPriceLimit(),
			styleError: { borderColor: this.errorForm === I18n.t('limitPriceValid') ? 'red' : CommonStyle.backgroundNewSearchBar },
			onChangeText: this.onChangeText.bind(this, 'limit'),
			editable: this.props.isConnected,
			format: TYPE_VALID_CUSTOM_INPUT.PRICE,
			keyboardType: KEYBOARD_TYPE.DECIMAL_PAD
		});
	}
	formatPriceStop = () => {
		return this.dic.isFocusStopTriggerPrice ? this.dic.stopPrice.toString() : formatNumberNew2(this.dic.stopPrice, PRICE_DECIMAL.PRICE)
	}
	renderStopPrice() {
		return this.renderInput({
			title: I18n.t('stopTriggerPrice'),
			value: this.formatPriceStop(),
			styleError: { borderColor: this.errorForm === I18n.t('stopPriceValid') ? 'red' : CommonStyle.backgroundNewSearchBar },
			onChangeText: this.onChangeText.bind(this, 'stop'),
			editable: this.props.isConnected,
			format: TYPE_VALID_CUSTOM_INPUT.PRICE,
			keyboardType: KEYBOARD_TYPE.DECIMAL_PAD
		});
	}

	renderPrice() {
		if (!this.dic.code) return (<View />);

		switch (this.dic.orderType) {
			case orderTypeEnum.LIMIT_ORDER:
				return this.renderLimitPrice();
			case orderTypeEnum.STOPLOSS_ORDER:
				if (this.dic.isFuture) {
					return this.renderStopPrice()
				} else {
					return (<View>
						{this.renderStopPrice()}
						{this.renderLimitPrice()}
					</View>);
				}
			case orderTypeEnum.STOPLIMIT_ORDER:
				return (<View>
					{this.renderStopPrice()}
					{this.renderLimitPrice()}
				</View>);
			case orderTypeEnum.STOP_ORDER:
				return this.renderStopPrice();
			default:
				return (<View />);
		}
	}

	getSummaryOrder(str, isBuy) {
		try {
			if (str) {
				const lstNoneColor = str.split(/#{([^}]*)}/);
				const lstElement = [];
				for (let i = 0; i < lstNoneColor.length; i++) {
					if (i % 2 === 0) {
						lstElement.push(
							(<Text
								key={`${i}`}
								style={{ color: CommonStyle.fontColor }}>
								{lstNoneColor[i]}
							</Text>)
						);
					} else {
						lstElement.push(
							(<Text
								key={`${i}`}
								style={{ color: isBuy ? CommonStyle.todayChangeUpTextColor : CommonStyle.todayChangeDownTextColor }}>
								{lstNoneColor[i]}
							</Text>)
						);
					}
				}
				return (
					<Text
						style={[
							CommonStyle.textMainNormalNoColorOpacity,
							styles.summary,
							{ marginBottom: 10 }
						]}>
						{lstElement}
					</Text>
				);
			} else {
				return <Text></Text>
			}
		} catch (error) {
			logDevice('info', `getSummaryOrder EXCEPTION: ${error}`)
		}
	};

	getElementSummary(listField) {
		if (!Util.arrayHasItem(listField)) return [];
		const listInfoAcc = ['Account', 'Actor', 'Duration', 'Exchange', 'orderAmountUsd']
		const lstItem = [];
		listField.map((item, index) => {
			lstItem.push((
				<TransitionView
					animation={dataStorage.animationDirection}
					index={index}
					key={`view_${index}`}
					style={{
						paddingVertical: 15,
						width: '40%',
						marginHorizontal: 16,
						justifyContent: 'flex-start'
					}}>
					<View>
						<Text
							key={`text_1_${index}`}
							style={[
								CommonStyle.textSubNormalBlack,
								{
									fontFamily: CommonStyle.fontPoppinsRegular,
									fontSize: CommonStyle.fontSizeXS,
									opacity: 0.4
								}
							]}>
							{item.key}{(item.unitMoney && !listInfoAcc.includes(item.key)) ? ' (' + item.unitMoney + ')' : ''}
						</Text>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<Text
							ellipsizeMode={'middle'}
							numberOfLines={2}
							key={`text_2_${index}`}
							style={[
								CommonStyle.textMainNormal,
								{
									textAlign: 'left',
									fontFamily: CommonStyle.fontPoppinsBold
								}
							]}>
							{item.value}
						</Text>
						{item.button || null}
					</View>
				</TransitionView>
			));
		})
		return lstItem
	};

	renderSummary() {
		return (
			<PureCollapsible
				ref={ref => this.pureCollapsible = ref}
				duration={150}
				isExpand={this.dic.isExpand['Detail']}
				renderHeader={() => this.renderHeaderCollapse('Detail')}
				renderContent={this.renderContentDetail.bind(this)}
				onChange={() => this.onChangeExpandStatus('Detail')}
			/>
		);
	}

	onChangeExpandStatus(title) {
		Animated.timing(
			this.dic.iconCollapse[title],
			{
				toValue: this.dic.isExpand[title] ? 1 : 0,
				duration: 150
			}
		).start(() => this.dic.isExpand[title] = !this.dic.isExpand[title]);
	}

	renderHeaderCollapse = (title) => {
		const spin = this.dic.iconCollapse[title].interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '-90deg']
		})
		if (title === 'Detail') return <View />
		return (
			<View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
				<AnimatedIcon style={[CommonStyle.iconColapsible, {
					color: CommonStyle.fontColor,
					transform: [{
						rotate: spin
					}]
				}]} name="ios-arrow-down" />
				<Text style={{ fontFamily: 'HelveticaNeue', fontSize: CommonStyle.fontSizeL, color: CommonStyle.fontColor, paddingLeft: 8 }}>{I18n.t(title)}</Text>
			</View>
		);
	}

	renderContentDetail() {
		return (
			<Summary
				symbolObject={this.dic.symbolObject}
				getObjectOrderPlace={() => this.getObjectOrderPlace()}
				getDisplayAccount={() => this.getDisplayAccount(this.dic.currentAccount)}
				feeObj={this.dic.feeObj}
				classSelectedSymbol={this.dic.classSelectedSymbol}
				combodityInfo={this.dic.combodityInfo}
				positions={this.dic.positions}
				code={this.dic.code}
				channelLoading={this.dic.channelLoadingOrder}
				channelPrice={this.dic.channelPriceOrder}
				isLoading={this.dic.isLoadingPrice}
				renderCloseNetPosition={this.renderCloseNetPosition}
			/>
		)
		const exchange = this.dic.symbolObject && this.dic.symbolObject.exchanges
		const orderObj = this.getObjectOrderPlace();
		const feeObj = this.dic.feeObj;
		if (orderObj == null ||
			feeObj == null ||
			Object.keys(orderObj).length === 0) return <View style={{ height: 200 }} />;

		const listField = [];
		const accountInfo = this.getDisplayAccount(this.dic.currentAccount);
		const symbolCurrency = this.dic.symbolObject.currency || '';
		const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
		const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
		const objCurSym = Util.renderCurBaseOnAccountCur(symbolCurrency);
		const time = new Date()
		const paramContent = {
			action: ACTION.PLACE,
			curOrdObj: orderObj,
			symbolObj: dataStorage.symbolEquity[orderObj.code]
		}
		if (Business.isParitech(orderObj.code)) {
			// if (this.isGoodTillDate()) {
			// 	listField.push({
			// 		key: I18n.t('date'),
			// 		value: moment(new Date(this.dic.date)).format('DD/MM/YYYY')
			// 	})
			// }
			if (Business.isFuture(this.dic.classSelectedSymbol)) {
				listField.push(...[
					{
						unitMoney: symbolCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					},
					{
						unitMoney: accountCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount_convert == null
							? '--'
							: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
					},
					{
						unitMoney: symbolCurrency,
						key: I18n.t('initialMarginImpact'),
						width: 50,
						value: feeObj.initial_margin_impact == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					},
					{
						unitMoney: symbolCurrency,
						key: I18n.t('maintenanceMarginImpact'),
						width: 65,
						value: feeObj.maintenance_margin_impact == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					},
					{
						unitMoney: accountCurrency,
						key: I18n.t('maintenanceMarginImpact'),
						width: 65,
						value: feeObj.maintenance_margin_impact_convert == null
							? '--'
							: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
					}
				])
			} else {
				listField.push({
					unitMoney: accountCurrency,
					key: I18n.t('orderAmount'),
					value: feeObj.order_amount_convert == null
						? '--'
						: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
				})
			}

			listField.push(...[{
				unitMoney: accountCurrency,
				key: I18n.t('estimatedFees'),
				value: feeObj.estimated_fees == null
					? '--'
					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
			}, {
				unitMoney: accountCurrency,
				key: I18n.t('estimatedTotal'),
				value: feeObj.total_convert == null
					? '--'
					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
			}
			])
		} else {
			if (Business.isFuture(this.dic.classSelectedSymbol)) {
				listField.push(...[
					{
						unitMoney: symbolCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					},
					{
						unitMoney: accountCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount_convert == null
							? '--'
							: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
					},
					{
						unitMoney: symbolCurrency,
						key: I18n.t('initialMarginImpact'),
						width: 50,
						value: feeObj.initial_margin_impact == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					},
					{
						unitMoney: accountCurrency,
						key: I18n.t('initialMarginImpact'),
						width: 50,
						value: feeObj.initial_margin_impact_convert == null
							? '--'
							: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
					},
					{
						unitMoney: symbolCurrency,
						key: I18n.t('maintenanceMarginImpact'),
						width: 65,
						value: feeObj.maintenance_margin_impact == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					},
					{
						unitMoney: accountCurrency,
						key: I18n.t('maintenanceMarginImpact'),
						width: 65,
						value: feeObj.maintenance_margin_impact_convert == null
							? '--'
							: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
					}

				])
			} else {
				Util.checkCurrency(symbolCurrency, accountCurrency)
					? listField.push({
						unitMoney: accountCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					})
					: listField.push({
						unitMoney: symbolCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount == null
							? '--'
							: `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
					}, {
						unitMoney: accountCurrency,
						key: I18n.t('orderAmount'),
						value: feeObj.order_amount_convert == null
							? '--'
							: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
					})
			}

			// if (Business.isFuture(this.dic.classSelectedSymbol)) {
			// 	if (Array.isArray(exchange) && !exchange.includes('XLME')) {
			// 		listField.push(...[
			// 			{
			// 				unitMoney: accountCurrency,
			// 				key: I18n.t('orderAmount'),
			// 				value: feeObj.order_amount_convert == null
			// 					? '--'
			// 					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
			// 			},
			// 			{
			// 				unitMoney: accountCurrency,
			// 				key: I18n.t('initialMarginImpact'),
			// 				width: 50,
			// 				value: feeObj.initial_margin_impact_convert == null
			// 					? '--'
			// 					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
			// 			}, {
			// 				unitMoney: accountCurrency,
			// 				key: I18n.t('maintenanceMarginImpact'),
			// 				width: 65,
			// 				value: feeObj.maintenance_margin_impact_convert == null
			// 					? '--'
			// 					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
			// 			}
			// 		])
			// 	}
			// }

			listField.push(...[
				{
					unitMoney: accountCurrency,
					key: I18n.t('estimatedFees'),
					value: feeObj.estimated_fees == null
						? '--'
						: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
				}, {
					unitMoney: accountCurrency,
					key: I18n.t('estimatedTotal'),
					value: feeObj.total_convert == null
						? '--'
						: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
				}
			]);
		}

		if (Business.isFuture(this.dic.classSelectedSymbol)) {
			if (Array.isArray(exchange) && !exchange.includes('XLME')) {
				listField.push(...[
					{
						key: I18n.t('expiryDate2'),
						value: (paramContent.symbolObj && paramContent.symbolObj.expiry_date && renderTime(DateTime.convertToTimeStampWithFormat(paramContent.symbolObj.expiry_date, 'MMDDYY'), 'DD MMM YYYY')) || '--'
					}
				])
			}
			listField.push(...[
				{
					key: I18n.t('firstNoticeDay'),
					value: (paramContent.symbolObj && paramContent.symbolObj.first_noti_day && renderTime(DateTime.convertToTimeStampWithFormat(paramContent.symbolObj.first_noti_day), 'DD MMM YYYY')) || '--'
				},
				{
					key: I18n.t('contractSize'),
					value: (this.dic.combodityInfo && this.dic.combodityInfo.contract_size) || '--'
				},
				{
					key: I18n.t('unit'),
					value: (this.dic.combodityInfo && this.dic.combodityInfo.unit) || '--'
				}

			])
			const checkNetPosition = !!this.dic.positions[this.dic.code];
			listField.push(...[
				{
					key: I18n.t('netPosition'),
					value: (checkNetPosition && this.dic.positions[this.dic.code].netPosition) || '--',
					button: checkNetPosition ? this.renderCloseNetPosition() : ''
				}, {
					key: I18n.t('profitLoss'),
					value: (this.dic.positions[this.dic.code] && this.dic.positions[this.dic.code].profitLoss) || '--'
				}
			]);
		}
		// chen 2 truong vao dau list
		listField.unshift(...[
			{
				unitMoney: accountCurrency,
				key: I18n.t('userInfo'),
				value: func.getDisplayAccount() == null
					? '--'
					: `${func.getDisplayAccount()}`
			}, {
				unitMoney: accountCurrency,
				key: I18n.t('actor'),
				value: func.getUserLoginId() == null
					? '--'
					: `${func.getUserLoginId()}`
			}
		]);

		return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
			{
				listField.length === 0 ? (
					<View style={{ height: 200 }} />
				) : (
						this.getElementSummary(listField)
					)
			}
		</View>
	}

	renderCloseNetPosition() {
		return (<TouchableOpacityOpt style={{ height: 24, width: 24, display: 'flex', backgroundColor: '#df0000', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}
			onPress={() => this.closePositionHandler()}>
			<Icon name='ios-close' size={24} color='#fff' />
		</TouchableOpacityOpt>)
	}

	closePositionHandler() {
		const curPosition = this.dic.positions[this.dic.code] && this.dic.positions[this.dic.code].volume;
		if (!curPosition) return;
		this.dic.volume = Math.abs(curPosition);
		this.dic.userVolume = this.dic.volume;
		let isBuy = true;
		if (curPosition < 0 && !this.dic.isBuy) {
			this.changeBuySell(isBuy);
		} else if (curPosition > 0 && this.dic.isBuy) {
			isBuy = false;
			this.changeBuySell(isBuy)
		} else {
			this.setState()
		}
		this.scrollValue.setValue(0)
	}

	getCompanyName(symbolObject) {
		return (symbolObject.company_name || symbolObject.company || symbolObject.security_name || '').toUpperCase();
	}

	getMasterCode(symbolObject) {
		return symbolObject.display_master_code
			? symbolObject.display_master_code.toUpperCase()
			: Util.getStringable(this.dic.symbolObject, 'display_name');
	}

	onLayout(event, viewName) {
		const { x, y, width: w, height: h } = event.nativeEvent.layout;
		this.dic[viewName] = h - 16
	}

	getMasterName(symbolObject) {
		return symbolObject.display_master_name
			? symbolObject.display_master_name.toUpperCase()
			: this.getCompanyName(this.dic.symbolObject);
	}
	renderPriceTag = () => {
		return <Animated.View style={{
			marginHorizontal: 16,
			borderBottomWidth: 1,
			borderBottomColor: CommonStyle.fontBorderGray,
			height: this.dic.heightLastTradeHeader,
			opacity: this.dic.opacityLastTradeHeader,
			paddingBottom: 10
		}}>
			<View style={{ flexDirection: 'row' }}>
				<View style={{ flex: 1, alignItems: 'flex-start' }}>
					{this.renderLastTradePrice()}
				</View>

				<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
					{this.renderChangePoint()}
					{this.renderChangePercent()}
				</View>
			</View>

			<View style={{ flexDirection: 'row', marginTop: 5 }}>
				{this.renderBidPrice()}
				{this.renderAskPrice()}
			</View>
		</Animated.View>
	}

	getProduct() {
		return this.dic.classSelectedSymbol ? SYMBOL_CLASS_DISPLAY[this.dic.classSelectedSymbol].toUpperCase() : ''
	}

	renderProduct() {
		return this.dic.code
			? (
				<View style={{ marginBottom: 8, marginHorizontal: 16, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text testID={`productLabel`} style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>
						{`${I18n.t('Product')}`}
					</Text>
					<Text
						style={[
							CommonStyle.textSubDark,
							{
								fontSize: CommonStyle.font17,
								textAlign: 'right'
							}
						]}>{this.getProduct()}
					</Text>
				</View>
			)
			: <View />
	}

	renderCashAvailable() {
		const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
		const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
		const symbolClass = Business.getClassBySymbol(this.dic.code)
		const symbolCurrency = Business.getCurency(this.dic.code)
		const cashAvailable = Business.displayMoney2(this.dic.cashAvailable, PRICE_DECIMAL.VALUE, objCurAcc.symbolCur)
		const currency = cashAvailable === '--' ? '' : (dataStorage.currentAccount.currency && dataStorage.currentAccount.currency) || CURRENCY.AUD

		let prefix = I18n.t('cashAvailableToTradeIs')
		if (symbolClass === SYMBOL_CLASS.FUTURE) {
			// Future -> show "Initial Margin Available to Trade"
			prefix = I18n.t('initialMarginAvailableToTrade')
		} else if (symbolClass === SYMBOL_CLASS.EQUITY && symbolCurrency === CURRENCY.USD) {
			// Equity Mỹ -> show "Cash Available to Trade (not include your settlement in T+2 & Others)"
			prefix = I18n.t('cashAvailableToTradeIs')
		}
		return `${prefix} ${cashAvailable} ${currency}`
	}

	renderClearDataAndNote() {
		const symbolClass = Business.getClassBySymbol(this.dic.code)
		const symbolCurrency = Business.getCurency(this.dic.code)
		return <View style={{
			flexDirection: 'row',
			width: '100%',
			paddingHorizontal: 16,
			marginBottom: 16,
			alignItems: 'center',
			justifyContent: 'space-between'
		}}>
			<TouchableOpacityOpt
				onPress={() => this.clearAllData()}
				style={{
					height: 24,
					justifyContent: 'flex-end'
				}}>
				<Text style={[CommonStyle.textMain, { color: CommonStyle.colorProduct, fontSize: 12, fontWeight: 'normal', fontFamily: CommonStyle.fontPoppinsRegular }]}>{I18n.t('clearAllData')}</Text>
			</TouchableOpacityOpt>

			{
				symbolClass === SYMBOL_CLASS.EQUITY && symbolCurrency === CURRENCY.USD && this.dic.isBuy
					? <TouchableOpacityOpt
						onPress={this.showDifferentNoteModal}
						style={{
							paddingTop: 3,
							height: 17,
							justifyContent: 'flex-end'
						}}>
						<Text
							textDecorationLine={'underline line-through'}
							style={[
								CommonStyle.textMain,
								{
									color: CommonStyle.colorProduct,
									fontSize: CommonStyle.fontSizeXS - 1,
									fontStyle: 'italic',
									paddingBottom: 0,
									justifyContent: 'flex-end'
								}]}>{I18n.t('differentInCashAvailable')}</Text>
						<View style={{ backgroundColor: CommonStyle.colorProduct, height: 1 }} />
					</TouchableOpacityOpt>
					: null
			}
		</View>
	}

	renderButtonPlaceOrder() {
		return (
			<Animated.View style={{
				width: '100%',
				backgroundColor: CommonStyle.fontColorModal,
				borderTopWidth: 1,
				borderTopColor: CommonStyle.fontBorderGray,
				transform: [{
					translateY: 0
				}],
				alignItems: 'center'
			}}>
				<TouchableOpacityOpt
					testID={'orderButton_submit'}
					disabled={!this.props.isConnected || this.state.isCheckVetting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER)}
					onPress={() => {
						if (this.dic.isPress) return;
						this.confirmOrder()
					}}
					style={[
						styles.buttonSellBuy,
						{
							backgroundColor: this.dic.isBuy
								? (!this.props.isConnected || this.state.isCheckVetting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER) ? CommonStyle.btnDisableBg : CommonStyle.addIconColor)
								: (!this.props.isConnected || this.state.isCheckVetting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER) ? CommonStyle.btnDisableBg : CommonStyle.addIconColorRed)
						}, {
							borderRadius: 30
						}
					]}>
					<View
						style={{
							width: '100%',
							justifyContent: 'center',
							alignItems: 'center',
							paddingHorizontal: 16
						}}>
						<View style={{
							flexDirection: 'row', width: '100%', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center'
						}}>
							{
								this.state.isCheckVetting
									? <ActivityIndicator style={{ width: 18, height: 18, marginBottom: 6, marginRight: 6 }} color={CommonStyle.fontWhite} />
									: <View />
							}
							<Text
								testID={`submitButtonTradingType`}
								style={[
									CommonStyle.textButtonColor,
									{ marginBottom: 6, color: this.dic.isBuy ? CommonStyle.fontBlack : CommonStyle.fontWhite }
								]}>
								{`${I18n.t('place')} ${this.dic.isBuy ? I18n.t('stopLimitBuy') : I18n.t('sell')} ${I18n.t('order_txt')}`}
							</Text>
						</View>

						<Text
							testID={`submitButtonInfo`}
							style={[CommonStyle.textButtonColorS, {
								textAlign: 'center',
								fontSize: CommonStyle.fontSizeXS,
								color: this.dic.isBuy ? CommonStyle.fontBlack : CommonStyle.fontWhite
							}]}>
							{this.renderCashAvailable()}
						</Text>
					</View>
				</TouchableOpacityOpt>

				{this.renderClearDataAndNote()}
			</Animated.View >
		);
	}

	renderCos() {
		return (
			<PureCollapsible
				duration={150}
				isExpand={this.dic.isExpand['courseOfSales']}
				renderHeader={() => this.renderHeaderCollapse('courseOfSales')}
				renderContent={this.renderCosContent.bind(this)}
				onChange={() => this.onChangeExpandStatus('courseOfSales')}
			/>
		);
	}

	renderCosContent() {
		return (
			<CourseOfSales
				code={this.dic.code}
				symbolObject={this.dic.symbolObject}
				getReloadFuncCos={(p) => this.getReloadFuncCos(p)}
				channelLoadingOrder={this.dic.channelLoadingOrder}
			/>
		)
		return (
			<View>
				{
					this.dic.code &&
						this.dic.symbolObject &&
						!Util.compareObject(this.dic.symbolObject, {})
						? (
							RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_COURSE_OF_SALES_NEW_ORDER) ? (
								Controller.isPriceStreaming()
									? (<TenTradeRealtime
										code={this.dic.code}
										isOrder={true}
										orderScreen={true}
									/>)
									: (
										<TenTrade
											getReloadFuncCos={this.getReloadFuncCos}
											code={this.dic.code}
											isOrder={true}
											orderScreen={true}
										/>
									)
							) : (
									<View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
										<Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noCosData')}</Text>
									</View>
								)
						)
						: <View />
				}
			</View>
		);
	}

	renderMarketDepth() {
		return (
			<PureCollapsible
				duration={150}
				isExpand={this.dic.isExpand['marketDepth']}
				renderHeader={() => this.renderHeaderCollapse('marketDepth')}
				renderContent={this.renderMarketDepthContent.bind(this)}
				onChange={() => this.onChangeExpandStatus('marketDepth')}
			/>
		);
	}
	renderMarketDepthContent() {
		const check1 = Util.compareObject(this.dic.symbolObject, {});
		const check2 = RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_MARKET_DEPTH_NEW_ORDER);
		return (
			<MarketDepth
				code={this.dic.code}
				symbolObject={this.dic.symbolObject}
				isReSub={this.props.isReSub}
				priceObject={this.dic.priceObject}
				channelLoadingOrder={this.dic.channelLoadingOrder}
				channelPriceOrder={this.dic.channelPriceOrder}
				getReloadFuncLv2={(p) => this.getReloadFuncLv2(p)}
				isLoadingPrice={this.dic.isLoadingPrice}
			/>
		)
		return (
			<View>
				{
					this.dic.code &&
						this.dic.symbolObject &&
						!check1 ? (
							check2 ? (Controller.isPriceStreaming()
								? (<SwiperMarketDepthRealtime
									isReSub={this.props.isReSub}
									code={this.dic.code}
									isOrder={true}
									orderScreen={true}
									value={this.dic.priceObject}
									channelLoadingOrder={this.dic.channelLoadingOrder}
									channelPriceOrder={this.dic.channelPriceOrder}
									isLoading={this.dic.isLoadingPrice}
								/>)
								: (
									<SwiperMarketDepth
										getReloadFuncLv2={this.getReloadFuncLv2}
										code={this.dic.code}
										isOrder={true}
										orderScreen={true}
										isLoading={this.dic.isLoadingPrice}
									/>
								)
							) : (
									<View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
										{
											<Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noMarketDepth')}</Text>
										}
									</View>
								)
						)
						: <View />
				}
			</View>
		)
	}

	registerSetTimeUpdate(setTimeUpdate) {
		if (setTimeUpdate) {
			this.dic.setTimeUpdate = setTimeUpdate
		}
	}

	clearError() {
		this.errorForm = null;
		this.dic.datePeriodError = null;
		this.dic.error = {
			highlighted: null,
			highlightedWord: '',
			highlightedStyle: null
		};
		this.setState({});
	}

	showSearchBar = () => {
		this._slidingPanel && this._slidingPanel.hide()
	}

	formatTradePrice(value) {
		return formatNumberNew2(value.trade_price, PRICE_DECIMAL.PRICE)
	}

	updateTrend(oldData = {}, newData = {}) {
		return Util.getTrendCompareWithOld(newData.trade_price, oldData.trade_price);
	}

	isTradePriceChange(oldData, newData) {
		return (oldData === undefined ||
			oldData === null ||
			oldData.trade_price === undefined ||
			oldData.trade_price === null ||
			oldData.trade_price !== newData.trade_price) &&
			newData.trade_price !== undefined &&
			newData.trade_price !== null
	}

	isTradeSizeChange(oldData, newData) {
		return (oldData === undefined ||
			oldData === null ||
			oldData.trade_size === undefined ||
			oldData.trade_size === null ||
			oldData.trade_size !== newData.trade_size) &&
			newData.trade_size !== undefined &&
			newData.trade_size !== null
	}

	formatTradeSizeSmallSize(value, isLoading) {
		return (
			<Text style={[CommonStyle.textSubNumber, {
				fontSize: CommonStyle.fontSizeXS,
				fontWeight: '300'
			}]}>
				{
					isLoading
						? '--'
						: value.trade_size === undefined || value.trade_size === null
							? '--'
							: `${formatNumber(value.trade_size)
							}`
				}
			</Text>
		)
	}

	renderLastTradePrice() {
		return (
			<View style={[{
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center'
			}]}>
				<Flashing
					value={this.dic.priceObject}
					channelLv1FromComponent={this.dic.channelPriceOrder}
					field={FLASHING_FIELD.TRADE_PRICE}
					style={{
						...CommonStyle.textMainNoColor,
						textAlign: 'left',
						fontFamily: 'HelveticaNeue-Medium',
						fontSize: CommonStyle.fontSizeXS,
						opacity: CommonStyle.opacity1
					}}
					containerStyle={{ flex: 4 }}
					positionStyle={{ left: 0 }}
					isValueChange={this.isTradePriceChange}
					updateTrend={this.updateTrend}
					formatFunc={this.formatTradePrice}
				/>
				<Text style={{
					color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeXS1, marginHorizontal: 2
				}}>{'@'}</Text>
				<Quantity
					value={this.dic.priceObject}
					channelLoading={this.dic.channelLoadingOrder}
					channelPrice={this.dic.channelPriceOrder}
					isLoading={this.dic.isLoadingPrice}
					isValueChange={this.isTradeSizeChange}
					formatFunc={this.formatTradeSizeSmallSize}
				/>
			</View>
		);
	}

	renderChangePoint() {
		return (
			<ChangePoint
				isNoneIcon={true}
				value={this.dic.priceObject}
				style={{
					fontSize: CommonStyle.fontSizeXS,
					textAlign: 'right',
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
				channelLoadingOrder={this.dic.channelLoadingOrder}
				channelPriceOrder={this.dic.channelPriceOrder}
				isLoading={this.dic.isLoadingPrice}
			/>
		);
	}

	renderChangePercent() {
		return (
			<ChangePercent
				value={this.dic.priceObject}
				style={{
					fontSize: CommonStyle.fontSizeXS,
					fontFamily: CommonStyle.fontPoppinsRegular
				}}
				channelLoadingOrder={this.dic.channelLoadingOrder}
				channelPriceOrder={this.dic.channelPriceOrder}
				isLoading={this.dic.isLoadingPrice}
			/>
		);
	}

	isBidPriceChange(oldData, newData) {
		return (oldData === undefined ||
			oldData === null ||
			oldData.bid_price === undefined ||
			oldData.bid_price === null ||
			oldData.bid_price !== newData.bid_price) &&
			newData.bid_price !== undefined &&
			newData.bid_price !== null
	}

	isAskPriceChange(oldData, newData) {
		return (oldData === undefined ||
			oldData === null ||
			oldData.ask_price === undefined ||
			oldData.ask_price === null ||
			oldData.ask_price !== newData.ask_price) &&
			newData.ask_price !== undefined &&
			newData.ask_price !== null
	}

	updateBidPriceTrend(oldData = {}, newData = {}) {
		return Util.getTrendCompareWithOld(newData.bid_price, oldData.bid_price);
	}

	updateAskPriceTrend(oldData = {}, newData = {}) {
		return Util.getTrendCompareWithOld(newData.ask_price, oldData.ask_price);
	}

	formatBidPrice(value) {
		return formatNumberNew2(value.bid_price, PRICE_DECIMAL.PRICE)
	}

	formatAskPrice(value) {
		return formatNumberNew2(value.ask_price, PRICE_DECIMAL.PRICE)
	}

	renderBidPrice() {
		return (
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'right', color: CommonStyle.fontNearDark3, marginRight: 4 }]}>{I18n.t('bidPrice')}</Text>
				<Flashing
					value={this.dic.priceObject}
					channelLv1FromComponent={this.dic.channelPriceOrder}
					field={FLASHING_FIELD.BID_PRICE}
					style={{
						...CommonStyle.textMainNoColor,
						opacity: CommonStyle.opacity1,
						fontSize: CommonStyle.fontSizeXS,
						fontFamily: 'HelveticaNeue-Medium'
					}}
					isValueChange={this.isBidPriceChange}
					updateTrend={this.updateBidPriceTrend}
					formatFunc={this.formatBidPrice}
				/>
			</View>
		);
	}

	renderAskPrice() {
		try {
			return (
				<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
					<Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'right', color: CommonStyle.fontNearDark3, marginRight: 4 }]}>{I18n.t('offerPrice')}</Text>
					<Flashing
						value={this.dic.priceObject}
						channelLv1FromComponent={this.dic.channelPriceOrder}
						field={FLASHING_FIELD.ASK_PRICE}
						style={{
							...CommonStyle.textMainNoColor,
							opacity: CommonStyle.opacity1,
							fontSize: CommonStyle.fontSizeXS,
							fontFamily: 'HelveticaNeue-Medium'
						}}
						isValueChange={this.isAskPriceChange}
						updateTrend={this.updateAskPriceTrend}
						formatFunc={this.formatAskPrice}
					/>
				</View>
			);
		} catch (error) {
			console.log('error at render renderAskPrice', error)
		}
	}

	renderLastTradeDetail() {
		return this.dic.code
			? <View onLayout={e => this.onLayout(e, 'heightLastTradeDetail')}
				style={{ borderBottomRightRadius: CommonStyle.borderBottomRightRadius }}
			>
				<PriceOrder
					isLoading={this.dic.isLoadingPrice}
					priceObject={this.dic.priceObject}
					channelLoadingOrder={this.dic.channelLoadingOrder}
					channelPriceOrder={this.dic.channelPriceOrder}
				/>
			</View>
			: <View />
	}

	getThresholdScroll() {
		return this.dic.heightLastTradeDetail + 20;
	}

	hideShowHeaderAnim(newValue, duration = 250) {
		Animated.parallel([
			Animated.timing(
				this.dic.heightLastTradeHeader,
				{
					toValue: newValue,
					duration
				}
			),
			Animated.timing(
				this.dic.opacityLastTradeHeader,
				{
					toValue: newValue > 0 ? 1 : 0,
					duration
				}
			)
		]).start()
	}

	handleAnim(isHide, duration = 250) {
		Animated.parallel([
			Animated.timing(
				this.dic.heightSymbolName,
				{
					toValue: isHide ? 0 : 35,
					duration
				}
			),
			Animated.timing(
				this.dic.opacityAnim,
				{
					toValue: isHide ? 0 : 1,
					duration
				}
			),
			Animated.timing(
				this.dic.opacityAnimReverse,
				{
					toValue: isHide ? 1 : 0,
					duration
				}
			),
			Animated.timing(
				this.dic.heightCompanyName,
				{
					toValue: isHide ? 0 : 45,
					duration
				}
			)
		]).start()
	}

	onScroll(offsetY) {
		const threshold = this.getThresholdScroll();
		this.topHeight = offsetY
		let isHide
		if (offsetY > threshold && !this.dic.isPin) {
			this.dic.isPin = true;
			isHide = true
			this.handleAnim(isHide)
			// this.hideShowHeaderAnim(40)
		} else if (offsetY <= threshold && this.dic.isPin) {
			this.dic.isPin = false;
			isHide = false
			this.handleAnim(isHide)
			// this.hideShowHeaderAnim(0)
		}
	}

	renderClassTag() {
		const classSymbol = this.dic.symbolObject && this.dic.symbolObject.class;
		const classTag = classSymbol ? (classSymbol + '').toUpperCase().slice(0, 2) : '';
		if (!classTag) return null;
		const getClassBackground = () => {
			return CommonStyle.classBackgroundColor[classTag]
		}
		return (
			<View style={{
				paddingHorizontal: 2,
				height: 13,
				marginTop: 1,
				borderRadius: 1,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: getClassBackground()
			}}>
				<Text style={{
					color: CommonStyle.newsTextColor,
					fontFamily: CommonStyle.fontFamily,
					fontSize: CommonStyle.fontSizeXS - 4,
					textAlign: 'center'
				}}>{classTag}</Text>
			</View>
		);
	}

	renderCompanyName() {
		const { company_name: compName, company, security_name: secName } =
			this.dic.symbolObject || {};
		const companyName = (
			compName ||
			company ||
			secName ||
			''
		).toUpperCase();
		return (
			<Animated.View style={[{
				flexDirection: 'row',
				paddingHorizontal: 16,
				paddingBottom: 16,
				paddingTop: 8,
				alignItems: 'center'
			}]}>
				<View style={{}}>
					<Flag
						type={'flat'}
						code={this.dic.code ? Business.getFlag(this.dic.code) : ''}
						size={20}
						style={{ marginRight: 8 }}
					/>
					{/* {this.renderClassTag()} */}
				</View>
				<View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
					<Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'left' }]}>{companyName}</Text>
				</View>
			</Animated.View>
		);
	}
	renderSymbolName() {
		const symbol = this.dic.symbolObject && this.dic.symbolObject.display_name;
		return (
			<Animated.View
				style={{
					display: 'flex',
					width: '70%',
					alignItems: 'center',
					flexDirection: 'row',
					paddingLeft: 16
				}}>
				<Text style={[{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeXXL,
					color: CommonStyle.fontColor
				}]}>
					{Business.getSymbolName({ symbol: symbol }) || ''}
				</Text>
				{
					this.props.isModify
						? null
						: <TouchableOpacityOpt style={{
							width: 40,
							marginLeft: 8,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'flex-start'
						}}
							onPress={this.goMiddle.bind(this)}>
							<Icon name="ios-search" style={[CommonStyle.iconSearchDark]} />
						</TouchableOpacityOpt>
				}
			</Animated.View>
		);
	}
	renderDragIcon() {
		const opacity = this.scrollValue.interpolate({
			inputRange: [0, 144, 1000],
			outputRange: [1, 0, 0]
		})
		return <Animated.View style={[
			CommonStyle.dragIcons,
			{
				opacity: opacity
			}
		]} />
	}
	renderEmptyView() {
		return <View style={CommonStyle.dragIconsVisible} />
	}

	onClose() {
		this.dic.code = '';
		this.clearError();
		if (this.nestedScroll) {
			this.nestedScroll.hideContainer();
		}
		Keyboard.dismiss();
		this.setState({ isSearch: true }, () => {
			setTimeout(() => {
				this.refSearchBox && this.refSearchBox.doFocus()
			}, 500);
		});
	}
	renderCloseIcon() {
		return <TouchableOpacityOpt
			onPress={this.onClose}
			style={{
				height: 24,
				paddingTop: 8
			}}
		>
			<View style={{ borderRadius: 48, width: 18, height: 18, backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3, alignContent: 'center', justifyContent: 'center' }}>
				<Icon
					name='md-close' color={CommonStyle.backgroundColor}
					style={{ textAlign: 'center', lineHeight: 18 }}
					size={12}
				/>
			</View>
		</TouchableOpacityOpt>
	}

	renderRightComp = () => {
		return (
			<React.Fragment>
				<Icons styles={{ paddingRight: 16 }} name="md-time" onPress={this.onShowModalPicker} />
				{/* <Icons styles={{ paddingHorizontal: 8 }} name="ios-add-circle" />
				<Icons styles={{ paddingLeft: 8 }} name="ios-search" /> */}
			</React.Fragment>
		);
	}
	renderLeftComp = () => {
		return (
			<View style={{ left: -14 }}>
				<Icons styles={{ paddingRight: 16 }} name='ios-menu' onPress={this.openMenu} size={34} />
			</View>
		);
	}
	openMenu = () => {
		const { navigator } = this.props;
		if (navigator) {
			navigator.toggleDrawer({
				side: 'left',
				animated: true
			});
		}
	}

	onChangeTab = this.onChangeTab.bind(this)
	onChangeTab(tabInfo = {}) {
		const { from, i } = tabInfo;
		if (i !== null && i !== undefined) {
			this.dic.currentTab = i
		}
		this.updateDataWhenChangeTab()
	}
	renderTabScroll = () => {
		return (
			<TabScroll
				onChangeTab={this.onChangeTab}
				renderSummary={this.renderContentDetail.bind(this)}
				renderMarketDepth={this.renderMarketDepthContent.bind(this)}
				renderCos={this.renderCosContent.bind(this)} />
		)
	}

	render2RightIcon = () => {
		return (
			<View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', paddingRight: 16 }}>
				{this.renderRightIcon()}
				{this.renderCloseIcon()}
			</View>
		)
	}

	renderRightIcon() {
		const isStreaming = Controller.isPriceStreaming()
		return isStreaming
			? <View />
			: <View
				style={[{ marginRight: 16, alignItems: 'flex-end', paddingTop: 3 }]}
			>
				{
					this.dic.isLoadingPrice
						? <CustomButton
							style={{ alignItems: 'center', justifyContent: 'center' }}
							iconStyle={{ height: 32, width: 32, right: -14 }} />
						: <TouchableOpacity
							style={{}}
							testID="OrderSearchC2R"
							onPress={this.clickRefreshPrice}
						>
							<Icon
								color={CommonStyle.fontWhite}
								size={30}
								name={'ios-refresh'} />
						</TouchableOpacity>
				}
			</View>
	}

	renderLastTrade() {
		return (
			<Flashing
				value={this.dic.priceObject}
				channelLv1FromComponent={this.dic.channelPriceOrder}
				field={FLASHING_FIELD.TRADE_PRICE}
				style={{
					...CommonStyle.textMainNoColor,
					textAlign: 'left',
					fontFamily: CommonStyle.fontPoppinsMedium,
					fontSize: CommonStyle.fontSizeS
				}}
				containerStyle={{ flex: 4 }}
				positionStyle={{ left: 0 }}
				isValueChange={this.isTradePriceChange}
				updateTrend={this.updateTrend}
				formatFunc={this.formatTradePrice}
			/>
		)
	}

	renderSymbol() {
		const symbol = this.dic.symbolObject && this.dic.symbolObject.display_name;
		return (
			<Text style={[{
				fontFamily: CommonStyle.fontPoppinsBold,
				fontSize: CommonStyle.fontSizeXXL,
				color: CommonStyle.fontColor
			}]}>
				{Business.getSymbolName({ symbol: symbol }) || ''}
			</Text>
		)
	}

	renderInfoSpecial() {
		const opacity = this.scrollValue.interpolate({
			inputRange: [0, 144, 1000],
			outputRange: [0, 1, 1]
		})
		return (
			<Animated.View style={{
				flexDirection: 'row',
				alignItems: 'center',
				// backgroundColor: CommonStyle.color.dark,
				position: 'absolute',
				opacity: opacity,
				paddingLeft: 16
			}}>
				{this.renderSymbol()}
				<FlashingWrapper
					style={{ marginLeft: 16, marginRight: 8 }}
					channelLoadingOrder={this.dic.channelLoadingOrder}
					isLoading={this.dic.isLoadingPrice}
				>
					{this.renderLastTrade()}
				</FlashingWrapper>

				<View style={{ justifyContent: 'center' }}>
					<ChangePointPercent
						channelLoadingOrder={this.dic.channelLoadingOrder}
						isLoading={this.dic.isLoadingPrice}
					>
						{this.renderChangePoint()}
						{this.renderChangePercent()}
					</ChangePointPercent>
				</View>
			</Animated.View>
		)
	}
	renderInforDefault = () => {
		const height = this.scrollValue.interpolate({
			inputRange: [0, 144, 1000],
			outputRange: [80, 8, 8]
		})
		const opacity = this.scrollValue.interpolate({
			inputRange: [0, 144, 1000],
			outputRange: [1, 0, 0]
		})
		return (
			<Animated.View style={{
				overflow: 'hidden',
				height: height,
				opacity: opacity
			}}>
				{this.renderSymbolName()}
				{this.renderCompanyName()}
			</Animated.View >
		)
	}
	renderSlidingPannel() { // a
		const displayExchange = Business.getExchangeString(
			this.dic.symbolObject,
			this.dic.duration
		);
		let content = this.renderExchange();
		if (!this.dic.isAuBySymbol) {
			content = this.renderAtribute(
				displayExchange === ''
					? EXCHANGE_STRING.TRADE_MATCH
					: displayExchange,
				I18n.t('exchange_txt')
			);
		}
		const borderRadiusAniBottomPinHeader = this.scrollValue.interpolate({
			inputRange: [0, 144, 1000],
			outputRange: [48, 0, 0]
		})
		const borderWidthAniBottomPinHeader = this.scrollValue.interpolate({
			inputRange: [0, 144, 1000],
			outputRange: [0, 1, 1]
		})
		return (
			<NestedScrollView
				scrollContainerValue={this.scrollContainerValue}
				scrollValue={this.scrollValue}
				ref={sef => (this.nestedScroll = sef)}
				style={{
					flex: 1
				}}
				isShow={false}
			>
				<Image source={pinBackground1} style={{ position: 'absolute', top: 20, right: 0, bottom: 0, left: 0, width: '100%' }} />
				<ScrollLoadAbs
					// style={{ paddingTop: 20 }}
					scrollValue={this.scrollValue}
					onScroll={event => {
						this.yOffset = event.nativeEvent.contentOffset.y
					}}>
					<TouchableWithoutFeedback onPress={() => this.dismissKeyBorad()} isAbsolute>
						<Animated.View
							isAbsolute
							style={{
								borderTopLeftRadius: 22,
								borderTopRightRadius: 22,
								borderBottomWidth: borderWidthAniBottomPinHeader,
								backgroundColor: CommonStyle.color.dusk,
								borderBottomRightRadius: borderRadiusAniBottomPinHeader,
								paddingTop: 2,
								borderBottomColor: CommonStyle.color.dusk
							}}
						>
							<Animated.View
								isAbsolute
								style={{
									borderTopLeftRadius: 24,
									borderTopRightRadius: 24,
									backgroundColor: CommonStyle.ColorTabNews,
									borderBottomRightRadius: borderRadiusAniBottomPinHeader
								}}
							>
								<View
									style={[
										CommonStyle.dragHandlerNewOrder1,
										{
											flexDirection: 'row',
											marginTop: Platform.OS === 'ios' ? 4 : 0,
											justifyContent: 'space-between',
											alignItems: 'flex-start',
											height: 28
										}
									]}
								>
									{this.renderInfoSpecial()}
									<View style={{ position: 'absolute', alignItems: 'center', top: 0, bottom: 0, left: 0, right: 0 }}>
										{this.props.isModify || this.renderDragIcon()}
									</View>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
										{this.props.isModify || this.renderEmptyView()}
										{this.props.isModify || this.render2RightIcon()}
									</View>
									{/* {this.props.isModify || this.renderCloseIcon()} */}
								</View>

								<NotifyOrder
									isOutsideHeader={true}
									type={'error'}
									text={this.errorForm}
									clearErrorFn={this.clearError}
									highlighted={this.dic.error.highlighted}
									highlightedWord={this.dic.error.highlightedWord}
									highlightedStyle={this.dic.error.highlightedStyle}
								/>

								{
									func.getUserPriceSource() === userType.Delay
										? <Warning
											testID='orderWarning'
											warningText={I18n.t('delayWarning')}
											isConnected={true} />
										: <View />
								}
								{
									this.renderInforDefault()
								}
								{/* {this.renderSymbolName()}
							{this.renderCompanyName()} */}
								{/* {this.renderPriceTag()} */}
							</Animated.View>
						</Animated.View>
					</TouchableWithoutFeedback>
					<TouchableWithoutFeedback
						onPress={() => this.dismissKeyBorad()}>
						{/* <Animated.View style={{ backgroundColor: CommonStyle.colorBgNewAlert, transform: [{ translateY: shift }] }}> */}
						<View style={{ backgroundColor: CommonStyle.fontColorModal }}>
							{this.renderLastTradeDetail()}
							{this.renderButtonBuySell()}
							{this.renderQuantity()}
							{this.renderOrderType()}
							{this.renderPrice()}
							{this.renderDuration()}
							{this.renderDate()}
							{content}
							{/* {this.renderSummary()} */}
							{this.renderTabScroll()}
							<View style={{ height: 128 }} />
						</View>
					</TouchableWithoutFeedback>
				</ScrollLoadAbs>
			</NestedScrollView>
		);
	}
	dismissKeyBorad = () => {
		Keyboard.dismiss()
	}

	handleKeyboardDidShow = (event) => {
		const { height: windowHeight } = Dimensions.get('window');
		const keyboardHeight = event.endCoordinates.height;
		const currentlyFocusedField = TextInputState.currentlyFocusedField();
		UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
			const fieldHeight = height;
			const fieldTop = pageY;
			const gap = (windowHeight - keyboardHeight) - (fieldTop + fieldHeight);
			if (gap >= 0) {
				return;
			}
			Animated.timing(
				this.state.shift,
				{
					toValue: gap - 50,
					duration: 500,
					useNativeDriver: true
				}
			).start();
		});
	}

	handleKeyboardDidHide = () => {
		Animated.timing(
			this.state.shift,
			{
				toValue: 0,
				duration: 500,
				useNativeDriver: true
			}
		).start();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && nextProps.isConnected !== this.dic.isConnected) {
			if (nextProps.isConnected) {
				// Không đổi symbol nhưng vẫn sẽ có thay đổi giá nên vẫn cần get lại
				this.dic.isChangeSymbolDisconnect = false;
				this.loadDataAll(false, () => {
					this.resetFormInfo();
				})
			}
			this.dic.isConnected = nextProps.isConnected;
		}
	}

	render() {
		const OrderComponent = Platform.OS === 'ios'
			? Animated.View
			: KeyboardAvoidingView
		let orderProps = {
			testID: 'orderScreen',
			style: {
				flex: 1,
				opacity: Platform.OS === 'ios' ? this.dic.opacityOrder : 1,
				marginTop: 0,
				backgroundColor: CommonStyle.colorBgNewAlert
			}
		}
		if (Platform.OS === 'android') {
			orderProps.enabled = false
			orderProps.behavior = 'height'
		}
		return <OrderComponent {...orderProps}>
			{this.renderNavbar()}
			<NetworkWarning />
			<View style={{ flex: 1 }}>
				{this.renderResultSearch()}
				<View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} pointerEvents='box-none'>
					{this.renderSlidingPannel()}
				</View>
			</View>
			{
				this.dic.code
					? (
						<TransitionView animation='fadeInUp'>
							{
								this.renderButtonPlaceOrder()
							}
						</TransitionView>
					)
					: null
			}
			<PromptNew
				hidePlacingOrderCb={this.dic.closeAlert}
				type={'reviewAccount'}
				onRef={ref => this.newPrompt = ref}
				navigator={this.dic.nav}
			/>
		</OrderComponent>
	}
}

function mapStateToProps(state) {
	return {
		order: state.order,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(newOrderActions, dispatch),
		appActions: bindActionCreators(appActions, dispatch),
		portfolioActions: bindActionCreators(portfolioActions, dispatch)
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(Order);
