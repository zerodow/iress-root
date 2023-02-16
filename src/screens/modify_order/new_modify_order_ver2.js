import React, { Component } from 'react';
import {
    View, Text, TouchableOpacity, Keyboard, Dimensions, Alert, Animated,
    PixelRatio, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage'
import ButtonBox from '../../modules/_global/ButtonBox';
import {
    getReason, logDevice, roundFloat, checkTradingHalt, getDisplayName, formatNumber, convertFormatToNumber, formatNumberNew2, logAndReport, getPriceMultiExchange, replaceTextForMultipleLanguage
} from '../../lib/base/functionUtil';
import styles from './style/modify_order';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import TimeUpdated from '../../component/time_updated/time_updated';
import NetworkWarning from '../../component/network_warning/network_warning';
import Warning from '../../component/warning/warning';
import { iconsMap } from '../../utils/AppIcons';
import { bindActionCreators } from 'redux';
import * as modifyOrderActions from './modify_order.actions';
import userType from '../../constants/user_type';
import { func, dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Big from 'big.js';
import I18n from '../../modules/language/';
import orderTypeString from '../../constants/order_type_string';
import tradeTypeString from '../../constants/trade_type_string';
import filterConditionName from '../../constants/condition_name';
import PickerCustom from './../order/new_picker';
import Picker from 'react-native-picker';
import StateApp from '../../lib/base/helper/appState';
import config from '../../config';
import * as api from '../../api';
import { unregister } from '../../nchan';
import * as Animatable from 'react-native-animatable';
import { AlertOrder } from './../order/alert_order';
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import SwiperMarketDepth from '../market_depth/swiper_market_depth';
import SwiperMarketDepthRealtime from '../market_depth/swiper_market_depth_realtime';
import TenTrade from '../market_depth/swiper_10_trades';
import TenTradeRealtime from '../market_depth/swiper_10_trades_realtime';
import Enum from '../../enum';
import * as Util from '../../util';
import Flag from '../../component/flags/flag';
import orderType from '../../constants/order_type';
import * as Business from '../../business';
import * as Lv1 from '../../streaming/lv1';
import * as AllMarket from '../../streaming/all_market'
import * as Controller from '../../memory/controller'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as Translate from '../../invert_translate';
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid';
// Lib
import moment from 'moment'

// Business
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business'

// Component
import PriceOrder from '../order/price_order'
import XComponent from '../../component/xComponent/xComponent';
import * as UserPriceSource from '../../userPriceSource';
import * as RoleUser from '../../roleUser';

const triggerType = {
    PERCENT: 'Percent',
    PRICE: 'Price'
}
const ACTION = Enum.ACTION_ORD;
const TIME_GET_FEES = 500;
const ID_ELEMENT = Enum.ID_ELEMENT;
const ICON_NAME = Enum.ICON_NAME;
const CURRENCY = Enum.CURRENCY;

const CONST_STYLE = CommonStyle;
const NOTE_STATE = Enum.NOTE_STATE
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const { SYMBOL_CLASS, SYMBOL_CLASS_DISPLAY } = Enum

const { width } = Dimensions.get('window');
export class ModifyOrder extends XComponent {
    constructor(props) {
        super(props);

        this.init = this.init.bind(this)
        this.bindAllFunc = this.bindAllFunc.bind(this)
        this.bindAllFunc()
        this.init()

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        func.setFuncReload(this.dic.typeForm, this.loadDataFromApi.bind(this));
        this.setExchange()
    }

    init() {
        this.dic = {
            isLoadingPrice: false,
            priceObject: {},
            code: this.props.data.symbol || '',
            idForm: Util.getRandomKey(),
            oldOrd: Util.cloneFn(this.props.data),
            setTimeUpdate: null,
            timeout: null,
            errorLen: 1,
            volume: this.props.data.volume || 0,
            note: '',
            exchange: '',
            isConnected: true,
            requestID: null,
            confirmTextOrder: '',
            confirmTextButton: '',
            isChange: false,
            listVolume: [1, 10, 100, 500, 1000, 10000, 50000, 100000],
            listLimitPrice: [],
            listStopPrice: [],
            listTrailingPercent: [],
            listTrailingAmount: [],
            error: '',
            typeForm: 'modify_order',
            registered: false,
            objRegister: {},
            isReady: true,
            isPress: false,
            isCallOrderHistory: true,
            originOrderType: null,
            stateApp: null,
            perf: new Perf(performanceEnum.show_form_modify_order),
            nav: this.props.navigator,
            feeObj: {},
            orderObj: {},
            firstAppear: true,
            channelLoadingOrder: OrderStreamingBusiness.getChannelLoadingOrder(),
            channelPriceOrder: OrderStreamingBusiness.getChannelPriceOrder()
        }

        this.state = {
            objErr: {},
            isUpdateLastOrder: false,
            isShowError: false,
            orderPlaceSuccess: false,
            isFilling: false,
            volume: this.props.modifyOrder.volume ? this.props.modifyOrder : this.props.data.volume,
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
            heightError: new Animated.Value(0),
            isLoadingPrice: false
        }
    }

    bindAllFunc() {
        this.pubDepthData = this.pubDepthData.bind(this)
        this.pubCosData = this.pubCosData.bind(this)
        this.getReloadFuncLv2 = this.getReloadFuncLv2.bind(this);
        this.getReloadFuncCos = this.getReloadFuncCos.bind(this);
        this.getCashAvailable = this.getCashAvailable.bind(this);
        this.changedValue = this.changedValue.bind(this);
        this.closeHandler = this.closeHandler.bind(this);
        this.modifySuccess = this.modifySuccess.bind(this);
        this.disabeleStopPrice = this.disabeleStopPrice.bind(this);
        this.getWarnText = this.getWarnText.bind(this);
        this.setTitle = this.setTitle.bind(this);
        this.clickPriceRefresh = this.clickPriceRefresh.bind(this);
        this.registerSetTimeUpdate = this.registerSetTimeUpdate.bind(this)
        this.updateFeeAfterCheckRequestID = this.updateFeeAfterCheckRequestID.bind(this)
        this.getTradingMarket = this.getTradingMarket.bind(this)
        this.onTextLayout = this.onTextLayout.bind(this);
        this.setExchange = this.setExchange.bind(this)
        this.renderSide = this.renderSide.bind(this)
        this.renderSymbol = this.renderSymbol.bind(this)
        this.renderCompany = this.renderCompany.bind(this)
        this.renderButtonModify = this.renderButtonModify.bind(this)
        this.renderMarketDepth = this.renderMarketDepth.bind(this)
        this.renderCos = this.renderCos.bind(this)
        this.startLoading = this.startLoading.bind(this)
        this.stopLoading = this.stopLoading.bind(this)
        this.loadFormData = this.loadFormData.bind(this)
    }

    pubDepthData(depthData = {}) {
        const ask = Util.getValueObject(depthData.ask)
        const bid = Util.getValueObject(depthData.bid)
        const channel = StreamingBusiness.getChannelDepthAOI()
        Emitter.emit(channel, {
            ask,
            bid
        })
    }

    pubCosData(tradesData = {}) {
        const data = Util.getValueObject(tradesData)
        const channel = StreamingBusiness.getChannelCosAOI()
        Emitter.emit(channel, [{ data }])
    }

    getTradingMarket(orderDetail) {
        const tradingMarket = orderDetail.trading_market
        let exchange = tradingMarket
        if (tradingMarket && tradingMarket === 'SAXO_BANK') {
            exchange = orderDetail.exchange
        }
        return exchange
    }

    setExchange() {
        this.dic.exchange = Business.getExchangeName(this.getTradingMarket(this.props.data))
    }

    closeHandler() {
        this.dic.nav.pop({
            animated: true,
            animationType: 'fade'
        });
    }

    getWarnText() {
        try {
            switch (func.getUserPriceSource()) {
                case userType.ClickToRefresh:
                    return this.state.tradingHalt ? I18n.t('notRealtimeWarningHalt') : I18n.t('notRealtimeWarning')
                case userType.Delay:
                    return this.state.tradingHalt ? I18n.t('delayWarningHalt') : I18n.t('delayWarning')
                case userType.Streaming:
                    return this.state.tradingHalt ? I18n.t('tradingHalt') : ''
            }
        } catch (error) {
            logAndReport('getWarnText modifyOrder exception', error, 'getWarnText modifyOrder');
            logDevice('info', `ModifyOrder - getWarnText: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    modifySuccess() {
        this.props.navigator.pop({
            animated: true,
            animationType: 'slide-horizontal'
        });
    }

    showConfirmScreen() {
        const screen = Enum.SCREEN.CONFIRM_MODIFY_ORDER;
        const accountInfo = dataStorage.currentAccount || {};
        const subtitle = `${accountInfo.account_name || ''} (${accountInfo.account_id || ''})`;
        console.log(this.dic.orderObj)
        // Neu no co filled_price va filled_quantity thi truyen len
        let reqObj = {
            broker_order_id: this.dic.oldOrd.broker_order_id,
            note: this.dic.note,
            volume: Util.getNullable(this.dic.orderObj.volume),
            limit_price: Util.getNullable(this.dic.orderObj.limit_price),
            stop_price: Util.getNullable(this.dic.orderObj.stop_price)
        }
        this.props.navigator.showModal({
            screen,
            title: I18n.t('confirmOrder'),
            subtitle,
            passProps: {
                actor: func.getUserLoginId(),
                reqObj,
                oldOrdObj: this.dic.oldOrd,
                successCb: this.modifySuccess
            },
            animationType: 'slide-up',
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            },
            navigatorButtons: {
                leftButtons: [{
                    id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
                    icon: Util.getValByPlatform(iconsMap[ICON_NAME.ARROW_BACK.IOS], iconsMap[ICON_NAME.ARROW_BACK.ANDROID])
                }]
            }
        });
    }

    getCashAvailable() {
        const url = api.getNewTotalPortfolio(dataStorage.accountId);
        return api.requestData(url, true).then(data => {
            if (data) {
                const cashAvailable = data.available_balance
                this.setState({
                    cashAvailable
                });
            } else {
                logDevice('error', `ORDER - GET CASH AVAILABLE ERROR`)
            }
        });
    }

    checkSymbolIsInParitech() {
        if (this.props.data && this.props.data.symbol && this.props.data.symbol.includes('.')) {
            this.setState({ isParitech: false });
        } else {
            this.setState({ isParitech: true });
        }
    }
    setRightButtonNone() {
        this.dic.nav.setButtons({
            rightButtons: [
                {
                    title: '   ',
                    buttonFontSize: 30
                }
            ]
        });
    }

    clickPriceRefresh() {
        if (Controller.isPriceStreaming()) return;

        this.dic.setTimeUpdate && this.dic.setTimeUpdate(new Date().getTime())
        this.setState({ isLoadingPrice: true });
        this.dic.nav.setButtons({
            rightButtons: [
                {
                    id: 'custom-button',
                    component: 'equix.CustomButton'
                }
            ]
        });
        this.loadDataFromApi();
    }

    onNavigatorEvent(event) {
        Picker.hide();
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'modify_order_refresh':
                    this.clickPriceRefresh();
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    this.setState({ excuting: false })
                    this.checkSymbolIsInParitech();
                    this.dic.isCallOrderHistory = true;
                    setCurrentScreen(analyticsEnum.modifyOrder);
                    this.dic.perf && this.dic.perf.incrementCounter(performanceEnum.show_form_modify_order);
                    if (this.props.setChangeTypeFn) {
                        this.props.setChangeTypeFn(this.closeHandler);
                    }
                    if (this.props.setChangeTypeFn2) {
                        this.props.setChangeTypeFn2(this.disabeleStopPrice);
                    }
                    if (this.dic.firstAppear) {
                        this.dic.firstAppear = false;
                        this.loadFormData();
                    }
                    break;
                case 'didAppear':
                    if (!Controller.isPriceStreaming()) {
                        this.dic.nav.setButtons({
                            rightButtons: [
                                {
                                    title: 'Refresh',
                                    id: 'modify_order_refresh',
                                    icon: iconsMap['ios-refresh-outline']
                                }
                            ]
                        });
                    }
                    func.setCurrentScreenId(this.dic.typeForm)
                    checkTradingHalt(this.props.data.symbol).then(data => {
                        const tradingHalt = data;
                        this.setState({ tradingHalt });
                    });
                    const channel = StreamingBusiness.getChannelHalt(this.props.data.symbol);
                    Emitter.addListener(channel, this.id, this.updateHalt.bind(this));
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
                    this.dic.isReady = false;
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

    updateHalt() {
        checkTradingHalt(this.props.data.symbol).then(snap => {
            const tradingHalt = snap ? snap.trading_halt : false;
            this.setTitle(tradingHalt);
            this.setState({ tradingHalt }, () => {
                logDevice('info', `Updated Halt of ${this.props.data.symbol}: ${tradingHalt}`)
            });
        }).catch(err => {
            logDevice('info', `MODIFY ORDER TRADING HALT ERROR: ${err}`)
            console.log(err)
        })
    }

    disabeleStopPrice() {
        this.setState({
            disabled: true
        })
    }

    renderLastTrade() {
        return this.dic.code
            ? <PriceOrder
                isLoading={this.dic.isLoadingPrice}
                priceObject={this.dic.priceObject}
                channelLoadingOrder={this.dic.channelLoadingOrder}
                channelPriceOrder={this.dic.channelPriceOrder}
            />
            : <View />
    }

    subNewSymbol(symbol) {
        return new Promise(resolve => {
            const exchange = func.getExchangeSymbol(symbol);
            const channel = StreamingBusiness.getChannelLv1(exchange, symbol)

            Emitter.addListener(channel, this.id, this.changedValue)
            AllMarket.setIsAIO(true)
            AllMarket.sub([{ symbol, exchange }], this.dic.idForm, resolve)
        });
    }

    unSubSymbol(symbol) {
        const exchange = func.getExchangeSymbol(symbol);
        AllMarket.unsub([{ symbol, exchange }], this.dic.idForm)
    }

    startLoading() {
        this.dic.isLoadingPrice = true
        Emitter.emit(this.dic.channelLoadingOrder, this.dic.isLoadingPrice);
    }

    stopLoading() {
        this.dic.isLoadingPrice = false
        Emitter.emit(this.dic.channelLoadingOrder, this.dic.isLoadingPrice);
    }

    componentDidMount() {
        super.componentDidMount();
        try {
            this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        } catch (error) {
            logAndReport('componentDidMount modifyOrder exception', error, 'componentDidMount modifyOrder');
        }
        this.loadData();

        if (Controller.isPriceStreaming()) {
            this.startLoading()
            const symbol = this.props.data.symbol;
            const exchange = func.getExchangeSymbol(symbol);
            this.subNewSymbol(symbol)
                .then(() => {
                    UserPriceSource.loadDataAOIPrice([{ symbol, exchange }])
                        .then(data => {
                            const allData = data[0] || {}
                            const quoteData = allData.quote
                            const depthData = allData.depth
                            const tradesData = allData.trades

                            this.pubDepthData(depthData)
                            this.pubCosData(tradesData)
                            this.dic.priceObject = quoteData || {}
                            this.stopLoading()
                            this.changedValue(this.dic.priceObject)
                        });
                });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.isConnected !== null && nextProps.isConnected !== undefined && this.dic.isConnected !== nextProps.isConnected) {
            this.dic.isConnected = nextProps.isConnected
            if (nextProps.isConnected && this.dic.isConnected) {
                this.dic.requestID = Uuid.v4()
                this.getFees(this.props.modifyOrder.volume, this.props.modifyOrder.limitPrice, this.props.modifyOrder.stopPrice, this.dic.requestID);
            }
        }
    }

    _keyboardDidShow() {
        this.setState({ isShowKeyboard: true })
    }

    _keyboardDidHide() {
        this.setState({ isShowKeyboard: false })
    }

    setListPrice(type, price) {
        try {
            switch (type) {
                case triggerType.PERCENT:
                    this.dic.listTrailingPercent = [];
                    let _stepPrice = 0;
                    if (price >= 5) {
                        _stepPrice = 5;
                    } else if (price < 5) {
                        _stepPrice = 0.5;
                    } else {
                        _stepPrice = 0.05;
                    }
                    for (let i = 1; i <= 41; i++) {
                        const tmp = parseFloat(formatNumberNew2(price, PRICE_DECIMAL.PRICE)) + (_stepPrice * i);
                        this.dic.listTrailingPercent.push(formatNumberNew2(tmp, PRICE_DECIMAL.VALUE) + '%');
                    }
                    break;
                case triggerType.PRICE:
                    this.dic.listTrailingAmount = [];
                    for (let i = 1; i <= 41; i++) {
                        const tmp = parseFloat(formatNumberNew2(price, PRICE_DECIMAL.PRICE)) * i;
                        this.dic.listTrailingAmount.push(roundFloat(tmp, PRICE_DECIMAL.VALUE));
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
                        this.dic.listLimitPrice = [];
                        let min = price;
                        for (let i = 1; i <= 41; i++) {
                            const tmp = min.plus(stepPrice);
                            if (tmp > 2) {
                                stepPrice = 0.001;
                            } else if (tmp > 0.1) {
                                stepPrice = 0.0005;
                            } else {
                                stepPrice = 0.0001;
                            }
                            min = min.plus(stepPrice);
                            if (stepPrice === 0.001) {
                                round = 4;
                            } else {
                                round = 4;
                            }
                            this.dic.listLimitPrice.unshift(roundFloat(min, round));
                        }
                        this.props.actions.changeListLimitPrice(this.dic.listLimitPrice);
                    } else {
                        this.dic.listStopPrice = [];
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
                            this.dic.listStopPrice.unshift(roundFloat(min, round));
                        }
                        this.props.actions.changeListStopPrice(this.dic.listStopPrice);
                    }
                    break;
            }
        } catch (error) {
            logAndReport('setListPrice modifyOrder exception', error, 'setListPrice modifyOrder');
            logDevice('info', `ModifyOrder - setListPrice ${type} - ${price}: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    setTitle(tradingHalt, changePercent) {
        try {
            const displayName = this.props.displayName
            const symbol = tradingHalt ? '! ' : ''
            this.dic.nav.setTitle({
                title: symbol + `${displayName} (${formatNumberNew2(changePercent, PRICE_DECIMAL.PERCENT)}%)`
            });
        } catch (error) {
            logAndReport('setTitle modifyOrder exception', error, 'setTitle modifyOrder');
            logDevice('info', `ModifyOrder - setTitle - ${tradingHalt} - ${changePercent}: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    changedValue(data) {
        try {
            // Update change percent on title
            const changePercent = data.change_percent
            this.setTitle(this.state.tradingHalt, changePercent)
            this.dic.priceObject = data
            Emitter.emit(this.dic.channelPriceOrder, this.dic.priceObject) // Realtime -> pub price
            this.props.data.code && this.dic.isCallOrderHistory && this.loadLastOrderRequest(this.props.data.code, this.state.isUpdateLastOrder);
        } catch (error) {
            logAndReport('changedValue modifyOrder exception', error, 'changedValue modifyOrder');
            logDevice('info', `ModifyOrder - changedValue - ${data}: ${data ? JSON.stringify(data) : ''}`);
        }
    }

    getDataChartNow(data) {
        const temp = {};
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
        })
    }

    unregisterPrice() {
        this.dic.registered = false;
        unregister(this.dic.objRegister);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        this.dic.stateApp && this.dic.stateApp.removeHandler();
        this.dic.stateApp = null;
        this.dic.registered = false;
        this.unregisterPrice();
        if (Controller.isPriceStreaming()) {
            this.unSubSymbol(this.props.data.symbol);
        }
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    loadDataFromApi() {
        if (Controller.isPriceStreaming()) return;
        this.startLoading()
        // this.reloadFuncLv2 && this.reloadFuncLv2();
        // this.reloadFuncCos && this.reloadFuncCos();
        try {
            this.dic.perf = new Perf(performanceEnum.load_data_from_api_modify_order);
            this.dic.perf && this.dic.perf.start();
            const stringQuery = this.props.data.symbol;
            const exchange = func.getExchangeSymbol(this.props.data.symbol)
            const symbol = this.props.data.symbol
            if (func.getUserPriceSource() === userType.ClickToRefresh) {
                UserPriceSource.loadDataAOIPrice([{ symbol, exchange }])
                    .then(data => {
                        const allData = data[0] || {}
                        const quoteData = allData.quote
                        const depthData = allData.depth
                        const tradesData = allData.trades

                        this.pubDepthData(depthData)
                        this.pubCosData(tradesData)
                        this.dic.priceObject = quoteData || {}
                        this.stopLoading()
                        this.changedValue(this.dic.priceObject)

                        this.dic.nav.setButtons({
                            rightButtons: [
                                {
                                    title: 'Refresh',
                                    id: 'modify_order_refresh',
                                    icon: iconsMap['ios-refresh-outline']
                                }
                            ]
                        });
                    });
            }
        } catch (error) {
            logAndReport('loadDataFromApi order exception', error, 'loadDataFromApi order');
            logDevice('info', `NewOrder - loadDataFromApi error: ${error}`);
        }
    }

    loadData() {
        this.dic.stateApp = new StateApp(this.clickPriceRefresh, this.unregisterPrice.bind(this), this.dic.typeForm);
    }

    loadFormData() {
        try {
            const { data } = this.props;
            const initData = {
                filled_quantity: data.filled_quantity || 0,
                volume: data.volume || 0,
                stop_price: roundFloat(data.stop_price, PRICE_DECIMAL.PRICE) || 0,
                limit_price: roundFloat(data.limit_price, PRICE_DECIMAL.PRICE) || 0
            }
            this.props.actions.setupDataLoader(initData);
            this.dic.requestID = Uuid.v4()
            this.getFees(data.volume, data.limit_price, data.stop_price, this.dic.requestID);
        } catch (error) {
            logAndReport('loadFormData modifyOrder exception', error, 'loadFormData modifyOrder');
            logDevice('info', `NewOrder - loadFormData: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    getTrailingStopPrice(type, value, buysell) {
        let res = 0;
        const trailValue = value || (type === triggerType.PERCENT ? this.props.modifyOrder.trailingPercent : this.props.modifyOrder.trailingAmount);
        const side = buysell || this.props.modifyOrder.tradeType;
        const sign = side === this.props.data.is_buy ? 1 : -1;
        const marketPrice = this.state.trade_price ? this.state.trade_price : this.state.close;
        if (type === triggerType.PERCENT) {
            res = marketPrice + sign * marketPrice * trailValue / 100;
        } else if (type === triggerType.PRICE) {
            res = marketPrice + sign * trailValue;
        }
        return res;
    }

    onChangeText(type, value) {
        try {
            this.dic.timeout && clearTimeout(this.dic.timeout);
            if (value === '') {
                value = '0';
            }
            value = value.replace(/,/g, '');
            if (value[0] === '0' && value[1] && !value.includes('.')) {
                value = value.slice(1);
            }
            let trailingStopPrice = 0;
            const { modifyOrder } = this.props;
            const orderType = this.getOrderType(this.props.originOrderType)
            switch (type) {
                case triggerType.PERCENT:
                    if (value.match(/^\d+(\.\d{0,3})?$/i)) {
                        trailingStopPrice = this.getTrailingStopPrice(triggerType.PERCENT, parseFloat(value));
                        this.checkError(modifyOrder.volume, modifyOrder.limitPrice, modifyOrder.stopPrice, modifyOrder.trailingAmount, parseFloat(value), trailingStopPrice, orderType);
                        this.props.actions.changeTrailingStopPrice(trailingStopPrice);
                        this.props.actions.changeTrailingPercent(value);
                        this.setListPrice(triggerType.PERCENT, parseFloat(value));
                    }
                    break;
                case triggerType.PRICE:
                    if (value.match(/^\d+(\.\d{0,3})?$/i)) {
                        trailingStopPrice = this.getTrailingStopPrice(triggerType.PRICE, parseFloat(value));
                        this.checkError(modifyOrder.volume, modifyOrder.limitPrice, modifyOrder.stopPrice, parseFloat(value), modifyOrder.trailingPercent, trailingStopPrice, orderType);
                        this.setListPrice(triggerType.PRICE, parseFloat(value));
                        this.props.actions.changeTrailingStopPrice(trailingStopPrice);
                        this.props.actions.changeTrailingAmount(value);
                    }
                    break;
                case 'volume':
                    if (value.match(/^\d+(\.|\,\d+)?$/)) { // eslint-disable-line no-useless-escape
                        value = parseFloat(value);
                        this.dic.orderObj.volume = value;
                        this.props.actions.changeOrderVolume(value);
                        this.checkError(value, modifyOrder.limitPrice, modifyOrder.stopPrice, modifyOrder.trailingAmount, modifyOrder.trailingPercent, modifyOrder.trailingStopPrice, orderType);
                        if (this.dic.error === '') {
                            this.dic.volume = value;
                            this.dic.timeout = setTimeout(() => {
                                this.dic.requestID = Uuid.v4()
                                this.getFees(value, this.props.modifyOrder.limitPrice, this.props.modifyOrder.stopPrice, this.dic.requestID);
                            }, TIME_GET_FEES);
                        }
                    }
                    break;
                default:
                    const price = parseFloat(value);
                    let regex = '';
                    if (price > 2) {
                        stepPrice = 0.001;
                        regex = /^\d+(\.\d{0,4})?$/i;
                    } else if (price >= 0.1) {
                        stepPrice = 0.0005;
                        regex = /^\d+(\.\d{0,4})?$/i;
                    } else {
                        stepPrice = 0.0001;
                        regex = /^\d+(\.\d{0,4})?$/i;
                    }
                    const suf = value.split('.');
                    if (suf && suf[1] && suf[1].length > 4) {
                        value = roundFloat(value, 4);
                    }
                    if (value.match(regex)) {
                        if (type === 'limit') {
                            dataStorage.formatLimitPrice = true;
                            this.checkError(modifyOrder.volume, value, modifyOrder.stopPrice, modifyOrder.trailingAmount, modifyOrder.trailingPercent, modifyOrder.trailingStopPrice, orderType);
                            if (this.dic.error === '') {
                                this.dic.timeout = setTimeout(() => {
                                    this.dic.requestID = Uuid.v4()
                                    this.getFees(this.props.modifyOrder.volume, value, this.props.modifyOrder.stopPrice, this.dic.requestID);
                                }, TIME_GET_FEES);
                            }
                            this.props.actions.changePrice(orderTypeString.LIMIT, value.toString());
                            this.setListPrice('limit', parseFloat(value));
                        } else if (type === 'stop') {
                            dataStorage.formatStopPrice = true;
                            this.checkError(modifyOrder.volume, modifyOrder.limitPrice, value, modifyOrder.trailingAmount, modifyOrder.trailingPercent, modifyOrder.trailingStopPrice, orderType);
                            if (this.dic.error === '') {
                                this.dic.timeout = setTimeout(() => {
                                    this.dic.requestID = Uuid.v4()
                                    this.getFees(this.props.modifyOrder.volume, this.props.modifyOrder.limitPrice, value, this.dic.requestID);
                                }, TIME_GET_FEES);
                            }
                            this.props.actions.changePrice(orderTypeString.STOP_MARKET, value.toString());
                            this.setListPrice('stop', parseFloat(value));
                        }
                        // }
                    }
                    break;
            }
        } catch (error) {
            logAndReport('onChangeText modifyOrder exception', error, 'onChangeText modifyOrder');
            logDevice('info', `ModifyOrder - onChangeText ${type} - ${value}: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    updateFeeAfterCheckRequestID(requestIDFromApi) {
        if (requestIDFromApi && this.dic.requestID === requestIDFromApi) {
            return true
        }
        return false
    }

    getFees(volume, limitPrice, stopPrice, requestID) {
        try {
            if (volume === 0) {
                this.dic.orderObj.volume = 0;
                return this.setState({});
            }
            this.dic.perf = new Perf(performanceEnum.get_fees);
            this.dic.perf && this.dic.perf.start();
            if (this.dic.isConnected) {
                const exchange = this.props.data.exchange
                    ? this.props.data.exchange.replace('[Demo]', '')
                    : '';
                let orderObj = {
                    note: this.dic.note,
                    account_id: dataStorage.accountId,
                    code: this.props.data.symbol,
                    volume: convertFormatToNumber(volume),
                    exchange: exchange,
                    order_type: this.props.data.order_type,
                    is_buy: this.props.data.is_buy === 1,
                    duration: this.props.data.duration,
                    expire_date: this.props.data.expire_date,
                    limit_price: Util.getNullableReal(convertFormatToNumber(limitPrice)),
                    stop_price: Util.getNullableReal(convertFormatToNumber(stopPrice))
                }
                if (this.props.data.filled_quantity > 0) {
                    orderObj = {
                        filled_quantity: this.props.data.filled_quantity,
                        avg_price: this.props.data.avg_price,
                        note: this.dic.note,
                        account_id: dataStorage.accountId,
                        code: this.props.data.symbol,
                        volume: convertFormatToNumber(volume),
                        exchange,
                        order_type: this.props.data.order_type,
                        is_buy: this.props.data.is_buy === 1,
                        duration: this.props.data.duration,
                        limit_price: Util.getNullableReal(convertFormatToNumber(limitPrice)),
                        stop_price: Util.getNullableReal(convertFormatToNumber(stopPrice))
                    }
                }
                this.dic.orderObj = orderObj;
                api.postData(api.getUrlFee(), { data: this.dic.orderObj })
                    .then(data => {
                        const feeObj = data || {};
                        const checkRequestIDFee = this.updateFeeAfterCheckRequestID(requestID)
                        if (checkRequestIDFee) {
                            this.dic.feeObj = feeObj;
                            this.setState({});
                        }
                    });
            }
        } catch (error) {
            logAndReport('get fees order exception', error, 'confirmOrder order');
            logDevice('info', `ModifyOrder - GetFees: ${this.dic.orderObj ? JSON.stringify(this.dic.orderObj) : ''}`);
        }
    }

    convertDuration(duration) {
        switch (duration) {
            case 'DAY':
                return 'DAY';
            case 'GTC':
                return 'Good Till Cancelled';
            case 'FAK':
                return 'Fill and Kill'
            case 'IOC':
                return 'Immediate Or Cancel';
            case 'FOK':
                return 'Fill Or Kill';
            default:
                return duration;
        }
    }

    renderLimitOrder(filledValue) {
        return (
            <View style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}>
                <View style={styles.rowPickerContainer}>
                    {
                        filledValue ? <View style={{ width: '50%', paddingRight: 8 }}>
                            {this.renderAtribute(filledValue, I18n.t('Filled'))}
                        </View> : this.renderVolume()
                    }
                    {this.renderLimitPriceRight()}
                </View>
                <View style={{ paddingHorizontal: 16, width: '100%' }}>
                    {
                        filledValue ? this.renderVolume(false, true) : null
                    }
                    {this.renderAtribute(this.convertDuration(this.props.data.duration), I18n.t('duration'))}
                    {this.renderAtribute(this.state.isParitech ? this.dic.exchange : (dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].display_exchange), I18n.t('exchange_txt'))}
                </View>
            </View>
        )
    }

    renderStopLimitOrder(filledValue) {
        return (
            <View style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}>
                <View style={styles.rowPickerContainer}>
                    {this.renderLimitPriceLeft()}
                    {this.renderStopPrice()}
                </View>
                <View style={{ paddingHorizontal: 16, width: '100%' }}>
                    {
                        filledValue ? this.renderAtribute(filledValue, I18n.t('Filled')) : null
                    }
                    {
                        filledValue ? null : this.renderVolume(false, true)
                    }
                    {this.renderAtribute(this.convertDuration(this.props.data.duration), I18n.t('duration'))}
                    {this.renderAtribute(this.dic.exchange, I18n.t('exchange_txt'))}
                </View>
            </View>
        )
    }

    renderTrailingStopLimitOrder(filledValue) {
        return (
            <View style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}>
                <View style={styles.rowPickerContainer}>
                    {this.renderTrailingStopPrice()}
                    {this.renderLimitPriceRight()}
                </View>
                <View style={styles.rowPickerContainer}>
                    <View style={{ width: '50%', paddingRight: 8 }}>
                        {this.renderAtribute(this.props.data.triggerType, I18n.t('triggerType'))}
                    </View>
                    <View style={{ width: '50%', paddingLeft: 8 }}>
                        {this.renderTrailingValue()}
                    </View>
                </View>
                <View style={{ paddingHorizontal: 16, width: '100%' }}>
                    {
                        filledValue ? this.renderAtribute(filledValue, I18n.t('Filled')) : null
                    }
                    {this.renderVolume(false, true)}
                    {this.renderAtribute(this.convertDuration(this.props.data.duration), I18n.t('duration'))}
                    {this.renderAtribute(this.dic.exchange, I18n.t('exchange_txt'))}
                </View>
            </View>
        )
    }

    changeTrailingAmount(value) {
        const trailingStopPrice = this.getTrailingStopPrice(triggerType.PRICE, parseFloat(value));
        const { modifyOrder } = this.props;
        this.props.actions.changeTrailingAmount(value);
        this.props.actions.changeTrailingStopPrice(trailingStopPrice);
        this.dic.requestID = Uuid.v4()
        this.getFees(modifyOrder.volume, modifyOrder.limitPrice, modifyOrder.stopPrice, modifyOrder.orderType, this.dic.requestID);
        this.setListPrice(triggerType.PRICE, parseFloat(value));
    }

    changeTrailingPercent(value) {
        const trailingStopPrice = this.getTrailingStopPrice(triggerType.PERCENT, parseFloat(value));
        const { modifyOrder } = this.props;
        let valueSet = value + '';
        valueSet = valueSet.replace('%', '');
        this.props.actions.changeTrailingPercent(valueSet);
        this.props.actions.changeTrailingStopPrice(trailingStopPrice);
        this.dic.requestID = Uuid.v4()
        this.getFees(modifyOrder.volume, modifyOrder.limitPrice, modifyOrder.stopPrice, modifyOrder.orderType, this.dic.requestID);
        this.setListPrice(triggerType.PERCENT, parseFloat(valueSet));
    }

    renderTrailingStopPrice() {
        return (
            <View style={{ width: '50%', paddingRight: 8 }}>
                {this.renderAtribute(formatNumberNew2(this.props.modifyOrder.trailingStopPrice, PRICE_DECIMAL.PRICE), I18n.t('trailingStopPrice'))}
            </View>
        )
    }

    renderTrailingValue() {
        return (
            <View style={{ width: '100%', paddingLeft: 8 }}>
                {
                    this.props.data.triggerType === triggerType.PERCENT
                        ? <PickerCustom
                            testID={`modifyOrderTrailingPercent`}
                            navigator={this.dic.nav}
                            name='Trailing Percent'
                            disabled={this.state.excuting || !this.props.isConnected}
                            editable={true}
                            errorText={this.state.trailingErrorText}
                            onChangeText={this.onChangeText.bind(this, triggerType.PERCENT)}
                            floatingLabel={I18n.t('trailingPercent')}
                            selectedValue={this.props.modifyOrder.trailingPercent}
                            onValueChange={this.changeTrailingPercent.bind(this)}
                            data={this.dic.listTrailingPercent} />
                        : <PickerCustom
                            testID={`newOrderTrailingPercent`}
                            navigator={this.dic.nav}
                            name='Trailing Amount'
                            editable={true}
                            disabled={this.state.excuting || !this.props.isConnected}
                            errorText={this.state.trailingErrorText}
                            onChangeText={this.onChangeText.bind(this, triggerType.PRICE)}
                            floatingLabel={I18n.t('trailingAmount')}
                            selectedValue={this.props.modifyOrder.trailingAmount}
                            onValueChange={this.changeTrailingAmount.bind(this)}
                            data={this.dic.listTrailingAmount} />
                }
            </View>
        )
    }

    renderStoplossOrder(filledValue) {
        return (
            <View style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}>
                <View style={styles.rowPickerContainer}>
                    {
                        filledValue ? <View style={{ width: '50%', paddingRight: 8 }}>
                            {this.renderAtribute(filledValue, I18n.t('Filled'))}
                        </View> : this.renderVolume()
                    }
                    {this.renderStopPrice()}
                </View>
                <View style={{ paddingHorizontal: 16, width: '100%' }}>
                    {
                        filledValue ? this.renderVolume(false, true) : null
                    }
                    {this.renderAtribute(this.convertDuration(this.props.data.duration), I18n.t('duration'))}
                    {this.renderAtribute(this.dic.exchange, I18n.t('exchange_txt'))}
                </View>
            </View>
        )
    }

    toggleShowMoreDescription() {
        this.setState(previousState => {
            return { isShowMore: !previousState.isShowMore };
        });
    }

    renderStopLimitDescription() {
        const { isShowMore } = this.state;
        const tradeType = this.props.data.is_buy ? I18n.t('buy') : I18n.t('sell');
        const side = tradeType.toUpperCase();
        const volume = formatNumber(this.props.modifyOrder.volume);
        const symbol = this.props.displayName
        const stopPrice = formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE);
        const limitPrice = formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE);
        const increasesFalls = this.props.data.is_buy ? I18n.t('increases') : I18n.t('falls');
        const lowHigh = this.props.data.is_buy ? I18n.t('lower') : I18n.t('higher');
        const replaceObj = {};
        replaceObj.side = side;
        replaceObj.volume = volume;
        replaceObj.symbol = symbol;
        replaceObj.limitPrice = limitPrice;
        replaceObj.stopPrice = stopPrice;
        replaceObj.increasesFalls = increasesFalls;
        replaceObj.lowHigh = lowHigh;
        const description = I18n.t('stopLimitDescription');
        const res = replaceTextForMultipleLanguage(description, replaceObj)
        return (
            <View style={{ width: '100%' }}>
                <Text numberOfLines={isShowMore ? 0 : 1} ellipsizeMode={isShowMore ? null : 'tail'} style={CommonStyle.textMainNormal}>{res}</Text>
            </View>
        )
    }

    renderLimitDescription() {
        const { isShowMore } = this.state;
        const tradeType = this.props.data.is_buy ? I18n.t('buy') : I18n.t('sell');
        const side = tradeType.toUpperCase();
        const volume = formatNumber(this.props.modifyOrder.volume);
        const symbol = this.props.displayName
        const limitPrice = formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE);
        const lowHigh = this.props.data.is_buy ? I18n.t('lower') : I18n.t('higher');
        const replaceObj = {};
        replaceObj.side = side;
        replaceObj.volume = volume;
        replaceObj.symbol = symbol;
        replaceObj.limitPrice = limitPrice;
        replaceObj.lowHigh = lowHigh;
        const description = I18n.t('limitDescription');
        const res = replaceTextForMultipleLanguage(description, replaceObj)
        return (
            <View style={{ width: '100%' }}>
                <Text numberOfLines={isShowMore ? 0 : 1} ellipsizeMode={isShowMore ? null : 'tail'} style={CommonStyle.textMainNormal}>{res}</Text>
            </View>
        )
    }

    renderMarketToLimitDescription() {
        const { isShowMore } = this.state;
        const tradeType = this.props.data.is_buy ? I18n.t('buy') : I18n.t('sell');
        const side = tradeType.toUpperCase();
        const volume = formatNumber(this.props.modifyOrder.volume);
        const symbol = this.props.displayName
        const bidOffer = this.props.data.is_buy ? I18n.t('offer') : I18n.t('bid');
        const replaceObj = {};
        replaceObj.side = side;
        replaceObj.volume = volume;
        replaceObj.symbol = symbol;
        replaceObj.bidOffer = bidOffer;
        const description = I18n.t('marketToLimitDescription');
        const res = replaceTextForMultipleLanguage(description, replaceObj)
        return (
            <View style={{ width: '100%' }}>
                <Text numberOfLines={isShowMore ? 0 : 1} ellipsizeMode={isShowMore ? null : 'tail'} style={CommonStyle.textMainNormal}>{res}</Text>
            </View>
        )
    }

    renderTrailingStopLimitDescription() {
        const { isShowMore } = this.state;
        const tradeType = this.props.data.is_buy ? I18n.t('buy') : I18n.t('sell');
        const side = tradeType.toUpperCase();
        const volume = formatNumber(this.props.modifyOrder.volume);
        const symbol = this.props.displayName;
        const trailLable = this.props.modifyOrder.triggerType === triggerType.PERCENT ? I18n.t('trailingPercentLower') : I18n.t('trailingAmountLower');
        const trailValue = this.props.modifyOrder.triggerType === triggerType.PERCENT ? (this.props.modifyOrder.trailingPercent + '%') : this.props.modifyOrder.trailingAmount;
        const trailingStopPrice = formatNumberNew2(this.props.modifyOrder.trailingStopPrice, PRICE_DECIMAL.PRICE);
        const limitPrice = formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE);
        const replaceObj = {};
        replaceObj.side = side;
        replaceObj.volume = volume;
        replaceObj.symbol = symbol;
        replaceObj.limitPrice = limitPrice;
        replaceObj.trailLable = trailLable;
        replaceObj.trailValue = trailValue;
        replaceObj.trailingStopPrice = trailingStopPrice;
        const description = this.props.data.is_buy ? I18n.t('trailingStopLimitBuyDescription') : I18n.t('trailingStopLimitSellDescription');
        const res = replaceTextForMultipleLanguage(description, replaceObj)
        return (
            <View style={{ width: '100%' }}>
                <Text numberOfLines={isShowMore ? 0 : 1} ellipsizeMode={isShowMore ? null : 'tail'} style={CommonStyle.textMainNormal}>{res}</Text>
            </View>
        )
    }

    renderStopLossDescription() {
        const { isShowMore } = this.state;
        const tradeType = this.props.data.is_buy ? I18n.t('buy') : I18n.t('sell');
        const side = tradeType.toUpperCase();
        const volume = formatNumber(this.props.modifyOrder.volume);
        const symbol = this.props.displayName;
        const stopPrice = formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE);
        const increaseDecrease = this.props.data.is_buy ? I18n.t('increases') : I18n.t('decreases');
        const replaceObj = {};
        replaceObj.side = side;
        replaceObj.volume = volume;
        replaceObj.symbol = symbol;
        replaceObj.stopPrice = stopPrice;
        replaceObj.increaseDecrease = increaseDecrease;
        const description = this.state.isParitech ? I18n.t('stopLossParitechDescription') : I18n.t('stopLossXaxoDescription');
        const res = replaceTextForMultipleLanguage(description, replaceObj)
        return (
            <View style={{ width: '100%' }}>
                <Text numberOfLines={isShowMore ? 0 : 1} ellipsizeMode={isShowMore ? null : 'tail'} style={CommonStyle.textMainNormal}>{res}</Text>
            </View>
        )
    }

    renderDescription(orderType) {
        switch (orderType) {
            case orderTypeString.TRAILINGSTOPLIMIT:
                return this.renderTrailingStopLimitDescription()
            case orderTypeString.MARKETTOLIMIT: case orderTypeString.MARKET:
                return this.renderMarketToLimitDescription();
            case orderTypeString.LIMIT:
                return this.renderLimitDescription();
            case orderTypeString.STOP_LIMIT:
                return this.renderStopLimitDescription();
            case orderTypeString.STOPLOSS: case orderTypeString.STOP_MARKET:
                return this.renderStopLossDescription();
            case orderTypeString.BEST:
                return null;
        }
    }

    renderStopOrder() {
        return (
            <View style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}>
                <View style={styles.rowPickerContainer}>
                    {this.renderVolume()}
                    {this.renderStopPrice()}
                </View>
                <View style={styles.rowPickerContainer}>
                    <View style={{ width: '50%', paddingRight: 8 }}>
                        {this.renderAtribute(this.convertDuration(this.props.data.duration), I18n.t('duration'))}
                    </View>
                    <View style={{ width: '50%', paddingLeft: 8 }}>
                        {this.renderAtribute(this.dic.exchange, I18n.t('exchange_txt'))}
                    </View>
                </View>
            </View>
        )
    }

    renderLimitPrice() {
        return (
            <View style={{ width: '100%', marginBottom: 24 }}>
                <PickerCustom
                    name='Limit Price'
                    editable={true}
                    errorText={this.state.limitPriceErrorText}
                    onChangeText={this.onChangeText.bind(this, 'limit')}
                    floatingLabel={I18n.t('limitPrice')}
                    selectedValue={this.props.modifyOrder.limitPrice}
                    onValueChange={this.changeLimitPrice.bind(this)}
                    data={this.dic.listLimitPrice} />
            </View>
        );
    }

    renderLimitPriceLeft() {
        return (
            <View style={{ width: '50%', paddingRight: 8 }}>
                <PickerCustom
                    name='Limit Price'
                    editable={true}
                    errorText={this.state.limitPriceErrorText}
                    onChangeText={this.onChangeText.bind(this, 'limit')}
                    floatingLabel={I18n.t('limitPrice')}
                    selectedValue={formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}
                    onValueChange={this.changeLimitPrice.bind(this)}
                    data={this.dic.listLimitPrice} />
            </View>
        );
    }

    changeLimitPrice(value) {
        this.props.actions.changePrice(orderTypeString.LIMIT, value);
        this.dic.requestID = Uuid.v4()
        this.getFees(this.props.modifyOrder.volume, value, this.props.modifyOrder.stopPrice, this.dic.requestID);
        this.setListPrice('limit', value);
    }

    renderStopPrice() {
        return (
            <View style={{ width: '100%', marginBottom: 24 }}>
                <PickerCustom
                    name='Stop Price'
                    editable={true}
                    disabled={this.state.disabled}
                    errorText={this.state.stopPriceErrorText}
                    onChangeText={this.onChangeText.bind(this, 'stop')}
                    floatingLabel={I18n.t('stopPrice')}
                    selectedValue={this.props.modifyOrder.stopPrice}
                    onValueChange={this.changeStopPrice.bind(this)}
                    data={this.dic.listStopPrice} />
            </View>
        );
    }

    changeStopPrice(value) {
        this.props.actions.changePrice(orderTypeString.STOP_MARKET, value);
        this.dic.requestID = Uuid.v4()
        this.getFees(this.props.modifyOrder.volume, this.props.modifyOrder.limitPrice, value, this.dic.requestID);
        this.setListPrice('stop', value);
    }

    renderVolume(isRight = false, isFull = false) {
        return (
            <View style={[{ width: isFull ? '100%' : '50%' }, isFull ? { paddingHorizontal: 0 } : { paddingRight: isRight ? 0 : 8, paddingLeft: isRight ? 8 : 0 }]}>
                <PickerCustom
                    testID='volumeModify'
                    name='Volume'
                    editable={true}
                    errorText={this.state.volumeErrorText}
                    onChangeText={this.onChangeText.bind(this, 'volume')}
                    floatingLabel={I18n.t('quantity')}
                    selectedValue={this.props.modifyOrder.volume}
                    onValueChange={this.changeVolume.bind(this)}
                    data={this.dic.listVolume} />
            </View>
        );
    }

    changeVolume(val) {
        value = parseInt(val);
        this.dic.volume = value;
        this.dic.orderObj.volume = value;
        this.props.actions.changeOrderVolume(value);
        this.dic.requestID = Uuid.v4()
        this.getFees(value, this.props.modifyOrder.limitPrice, this.props.modifyOrder.stopPrice, this.dic.requestID);
    }

    renderMarketToLimitOrder(filledValue) {
        return (
            <View style={{ width: '100%', backgroundColor: CommonStyle.backgroundColor }}>
                {
                    filledValue ? (<View style={styles.rowPickerContainer}>
                        <View style={{ width: '50%', paddingRight: 8 }}>
                            {this.renderAtribute(filledValue, I18n.t('Filled'))}
                        </View>
                        {this.renderLimitPriceRight()}
                    </View>) : null
                }
                <View style={{ width: '100%', paddingHorizontal: 16 }}>
                    {this.renderVolume(true, true)}
                    {this.renderAtribute(this.convertDuration(this.props.data.duration), I18n.t('duration'))}
                    {this.renderAtribute(this.dic.exchange, I18n.t('exchange_txt'))}
                </View>
            </View>
        )
    }

    getSummaryOrder(str, isBuy) {
        try {
            if (str) {
                const lstNoneColor = str.split(/#{([^}]*)}/);
                const lstElement = [];
                for (let i = 0; i < lstNoneColor.length; i++) {
                    i % 2 === 0
                        ? lstElement.push((<Text key={i} style={{ color: CommonStyle.fontColor }}>{lstNoneColor[i]}</Text>))
                        : lstElement.push((<Text key={i} style={{ color: isBuy ? '#00b800' : 'red' }}>{lstNoneColor[i]}</Text>));
                }
                return (<Text style={[CommonStyle.textMainNormalNoColorOpacity, styles.summary, { marginBottom: 20 }]}>{lstElement}</Text>);
            } else {
                return <Text></Text>
            }
        } catch (error) {
            console.log(error)
        }
    };

    getElementSummary(listField) {
        if (!Util.arrayHasItem(listField)) return [];

        const lstItem = [];
        listField.map((item, index) => {
            lstItem.push((
                <View
                    key={`view_${index}`}
                    style={{
                        paddingVertical: 15,
                        flexDirection: 'row',
                        borderBottomWidth: CONST_STYLE.borderWidthThin,
                        borderBottomColor: CONST_STYLE.fontBorderGray,
                        marginHorizontal: 16
                    }}>
                    <Text
                        key={`text_1_${index}`}
                        style={[
                            CommonStyle.textSubNormalBlack,
                            { width: item.width ? `${item.width}%` : '40%' }
                        ]}>
                        {item.key}
                    </Text>
                    <Text
                        key={`text_2_${index}`}
                        style={[
                            CommonStyle.textMainNormal,
                            {
                                width: item.width ? `${100 - item.width}%` : '60%',
                                textAlign: 'right'
                            }
                        ]}>
                        {item.value}
                    </Text>
                </View>
            ));
        })
        return lstItem;
    };
    renderdisplaySummary = (orderObj, oldOrder, feeObj) => {
        if (orderObj == null ||
            feeObj == null ||
            Object.keys(orderObj).length === 0 ||
            Object.keys(feeObj).length === 0) return null;

        this.listField = [];
        const paramContent = {
            action: ACTION.MODIFY,
            curOrdObj: { ...oldOrder, ...orderObj },
            oldOrdObj: oldOrder,
            symbolObj: dataStorage.symbolEquity[orderObj.code]
        };
        const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
        const symbolCurrency = (dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].currency) || '';
        const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
        const objCurSym = Util.renderCurBaseOnAccountCur(symbolCurrency);
        const isFuture = Business.isFuture(dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].class);
        const isParitech = Business.isParitech(orderObj.code)
        this.handleListFieldInfoUser(orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent)
        isFuture && this.handleListFieldFuture(orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent)
        if (isParitech) {
            this.handleListFieldParitech(orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent)
        } else {
            this.handleListFieldSaxo(orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent)
        }
        return [
            (
                <Text
                    style={[
                        CommonStyle.fontLargeNormal1,
                        { marginTop: 24, paddingLeft: 16, paddingRight: 16 }
                    ]}>
                    {Translate.getValByKey('summary')}
                </Text>
            ),
            this.getSummaryOrder(Business.genContentConfirmOrder(paramContent), orderObj.is_buy),
            (
                <View style={{
                    marginHorizontal: 16,
                    borderBottomWidth: CONST_STYLE.borderWidthThin,
                    borderBottomColor: CONST_STYLE.fontBorderGray
                }} />
            ),
            ...this.getElementSummary(this.listField)
        ];
    }

    handleListFieldInfoUser = (orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent) => {
        this.listField.push(...[
            {
                key: I18n.t('userInfo'),
                value: func.getDisplayAccount()
            },
            {
                key: I18n.t('duration'),
                value: Translate.getInvertTranslate(Business.getDisplayDuration(orderObj.duration))
            }
        ]);
        if (isParitech) {
            if (orderObj.duration === Enum.DURATION_CODE.GTD) {
                this.listField.push({
                    key: I18n.t('date'),
                    value: moment(orderObj.expire_date).format('DD/MM/YYYY')
                })
            }
        } else {
            if (isFuture && orderObj.duration === Enum.DURATION_CODE.GTD) {
                this.listField.push({
                    key: I18n.t('date'),
                    value: moment(orderObj.expire_date).format('DD/MM/YYYY')
                })
            }
        }
        this.listField.push({
            key: I18n.t('exchange_txt'),
            value: Business.getExchangeName(this.getTradingMarket(this.props.data))
        });
    }
    handleListFieldFuture = (orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent) => {
        this.listField.push(...[
            {
                key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                value: feeObj.order_amount == null
                    ? '--'
                    : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
            },
            {
                key: I18n.t('initialMarginImpact') + ` (${symbolCurrency})`,
                width: 50,
                value: feeObj.initial_margin_impact == null
                    ? '--'
                    : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
            }, {
                key: I18n.t('maintenanceMarginImpact') + ` (${symbolCurrency})`,
                width: 65,
                value: feeObj.maintenance_margin_impact == null
                    ? '--'
                    : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
            }
        ])
        isParitech && this.listField.push(...[{
            key: I18n.t('orderAmount') + ` (${accountCurrency})`,
            value: feeObj.order_amount_convert == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        },
        {
            key: I18n.t('initialMarginImpact') + ` (${accountCurrency})`,
            width: 50,
            value: feeObj.initial_margin_impact_convert == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        }, {
            key: I18n.t('maintenanceMarginImpact') + ` (${accountCurrency})`,
            width: 65,
            value: feeObj.maintenance_margin_impact_convert == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        }
        ])
    }
    handleListFieldParitech = (orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent) => {
        this.listField.push(...[
            {
                key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                value: feeObj.order_amount_convert == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }
        ])
        this.listField.push(...[{
            key: I18n.t('estimatedFees') + ` (${accountCurrency})`,
            value: feeObj.estimated_fees == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        }, {
            key: I18n.t('estimatedTotal') + ` (${accountCurrency})`,
            value: feeObj.total_convert == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        }
        ])
    }
    handleListFieldSaxo = (orderObj, oldOrder, feeObj, isParitech, isFuture, objCurAcc, objCurSym, accountCurrency, symbolCurrency, paramContent) => {
        this.listField.push(...[{
            key: I18n.t('estimatedFees') + ` (${accountCurrency})`,
            value: feeObj.estimated_fees == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        }, {
            key: I18n.t('estimatedTotal') + ` (${accountCurrency})`,
            value: feeObj.total_convert == null
                ? '--'
                : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
        }
        ]);
    }
    renderSummary(orderObj, oldOrder, feeObj) {
        if (orderObj == null ||
            feeObj == null ||
            Object.keys(orderObj).length === 0 ||
            Object.keys(feeObj).length === 0) return null;

        const listField = [];
        const paramContent = {
            action: ACTION.MODIFY,
            curOrdObj: { ...oldOrder, ...orderObj },
            oldOrdObj: oldOrder,
            symbolObj: dataStorage.symbolEquity[orderObj.code]
        };
        const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
        const symbolCurrency = (dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].currency) || '';
        const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
        const objCurSym = Util.renderCurBaseOnAccountCur(symbolCurrency);
        const isFuture = Business.isFuture(dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].class);
        if (Business.isParitech(orderObj.code)) {
            listField.push(...[
                {
                    key: I18n.t('userInfo'),
                    value: func.getDisplayAccount()
                },
                {
                    key: I18n.t('duration'),
                    value: Translate.getInvertTranslate(Business.getDisplayDuration(orderObj.duration))
                }
            ]);

            if (orderObj.duration === Enum.DURATION_CODE.GTD) {
                listField.push({
                    key: I18n.t('date'),
                    value: moment(orderObj.expire_date).format('DD/MM/YYYY')
                })
            }

            listField.push({
                key: I18n.t('exchange_txt'),
                value: Business.getExchangeName(this.getTradingMarket(this.props.data))
            });

            if (isFuture) {
                listField.push(...[
                    {
                        key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${symbolCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    }, {
                        key: I18n.t('maintenanceMarginImpact') + ` (${symbolCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    }, {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${accountCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }, {
                        key: I18n.t('maintenanceMarginImpact') + ` (${accountCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                ])
            } else {
                listField.push(...[
                    {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                ])
            }
            listField.push(...[{
                key: I18n.t('estimatedFees') + ` (${accountCurrency})`,
                value: feeObj.estimated_fees == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }, {
                key: I18n.t('estimatedTotal') + ` (${accountCurrency})`,
                value: feeObj.total_convert == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }
            ])
        } else {
            listField.push(...[
                {
                    key: I18n.t('userInfo'),
                    value: func.getDisplayAccount()
                },
                {
                    key: I18n.t('duration'),
                    value: Translate.getInvertTranslate(Business.getDisplayDuration(orderObj.duration))
                }])

            if (isFuture && orderObj.duration === Enum.DURATION_CODE.GTD) {
                listField.push({
                    key: I18n.t('date'),
                    value: moment(orderObj.expire_date).format('DD/MM/YYYY')
                })
            }

            listField.push({
                key: I18n.t('exchange_txt'),
                value: Business.getExchangeString(paramContent.symbolObj, orderObj.duration)
            })

            if (isFuture) {
                listField.push(...[
                    {
                        key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${symbolCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    }, {
                        key: I18n.t('maintenanceMarginImpact') + ` (${symbolCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    }
                ])
            } else {
                listField.push({
                    key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                    value: feeObj.order_amount_convert == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                })
            }

            if (isFuture) {
                listField.push(...[
                    {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${accountCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }, {
                        key: I18n.t('maintenanceMarginImpact') + ` (${accountCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                ])
            }

            listField.push(...[{
                key: I18n.t('estimatedFees') + ` (${accountCurrency})`,
                value: feeObj.estimated_fees == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }, {
                key: I18n.t('estimatedTotal') + ` (${accountCurrency})`,
                value: feeObj.total_convert == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }
            ]);
        }
        return [
            (
                <Text
                    style={[
                        CommonStyle.fontLargeNormal1,
                        { marginTop: 24, paddingLeft: 16, paddingRight: 16 }
                    ]}>
                    {Translate.getValByKey('summary')}
                </Text>
            ),
            this.getSummaryOrder(Business.genContentConfirmOrder(paramContent), orderObj.is_buy),
            (
                <View style={{
                    marginHorizontal: 16,
                    borderBottomWidth: CONST_STYLE.borderWidthThin,
                    borderBottomColor: CONST_STYLE.fontBorderGray
                }} />
            ),
            ...this.getElementSummary(listField)
        ];
    }

    getNoteModify(orderType, changeValue, isBuy) {
        const side = isBuy ? 'BUY' : 'SELL'
        const modifyAction = changeValue < 0 ? 'ADD' : 'REDUCE'
        const note = {
            order_type: orderType,
            order_state: NOTE_STATE.USER_AMEND,
            modify_action: modifyAction,
            data: {
                side,
                quantity: Math.abs(changeValue),
                limit_price: this.props.modifyOrder.limitPrice,
                stop_price: this.props.modifyOrder.stopPrice
            }
        }
        return note;
    }

    setOrderContent(type) {
        try {
            if (this.props.modifyOrder.volume === 0) return;
            const displayName = this.props.displayName
            const tradeType = this.props.data.is_buy ? I18n.t('buy') : I18n.t('sell');
            let changeText = 0;
            const changeValue = this.props.data.volume - this.props.modifyOrder.volume;
            if (changeValue < 0) {
                changeText = `ADD ` + formatNumber(Math.abs(changeValue));
            } else if (changeValue > 0) {
                changeText = `REDUCE ` + formatNumber(Math.abs(changeValue));
            } else {
                this.dic.confirmTextOrder = tradeType.toUpperCase();
                this.dic.confirmTextButton = `${I18n.t('placeUpper')} ${tradeType.toUpperCase()} ${I18n.t('order_txtUpper')}`
            }
            const note = this.getNoteModify(type, changeValue, this.props.data.is_buy)
            this.dic.note = JSON.stringify(note)
            switch (type) {
                case orderTypeString.MARKET: case orderType.MARKET_ORDER:
                    if (changeValue !== 0) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${I18n.t('toLower')} ${tradeType.toUpperCase()} / ${changeText} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketPrice')}`;
                        this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('marketUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketUpper')} ${I18n.t('price')} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketUpper')} ${I18n.t('price')}?`;
                        // this.dic.note = `${changeText} @ MKT`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.MARKETTOLIMIT: case orderType.MARKETTOLIMIT_ORDER:
                    if (changeValue !== 0 || (this.props.data.order_type === orderType.LIMIT && parseFloat(this.props.modifyOrder.limitPrice) !== parseFloat(this.props.data.limit_price))) {
                        this.dic.isChange = true;
                        if (this.props.data.filled_quantity) {
                            this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}`;
                            this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('marketToLimitUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.data.limit_price, PRICE_DECIMAL.PRICE)} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}?`;
                            // this.dic.note = `${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.limitPrice, 3)}`;
                        } else {
                            this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${I18n.t('toLower')} ${tradeType.toUpperCase()} / ${changeText} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketPrice')}`;
                            this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('marketToLimitUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketUpper')} ${I18n.t('price')} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketUpper')} ${I18n.t('price')}?`;
                            // this.dic.note = `${changeText} @ MKT`;
                        }
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.LIMIT: case orderType.LIMIT_ORDER: case orderTypeString.LIMIT:
                    if (changeValue !== 0 || parseFloat(this.props.modifyOrder.limitPrice) !== parseFloat(this.props.data.limit_price)) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}`;
                        this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('limitUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.data.limit_price, PRICE_DECIMAL.PRICE)} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}?`;
                        // this.dic.note = `${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.limitPrice, 3)}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.STOP_LIMIT: case orderType.STOP_LIMIT_ORDER: case orderTypeString.STOP_LIMIT:
                    if (changeValue !== 0 || parseFloat(this.props.modifyOrder.stopPrice) !== parseFloat(this.props.data.stop_price) ||
                        this.props.modifyOrder.limitPrice.toString() !== this.props.data.limit_price.toString()) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)} / STP ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}`;
                        this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('stopLimitUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.data.limit_price, PRICE_DECIMAL.PRICE)}, ${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.data.stop_price, PRICE_DECIMAL.PRICE)} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}, ${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}?`;
                        // this.dic.note = `${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.limitPrice, 3)}, ${I18n.t('trigger')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, 3)}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.STOP: case orderType.STOP_ORDER: case orderTypeString.STOP_MARKET:
                    if (changeValue !== 0 || parseFloat(this.props.modifyOrder.stopPrice) !== parseFloat(this.props.data.stop_price)) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}`;
                        this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('stoplossUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketPrice')}, (${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.data.stop_price, PRICE_DECIMAL.PRICE)}) to ${tradeType === 'Buy' ? I18n.t('buying') : I18n.t('selling')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketPrice')} (${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)})?`;
                        // this.dic.note = `${changeText} @ STP ${formatNumberNew2(this.props.modifyOrder.stopPrice, 3)}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.STOPLOSS: case orderType.STOPLOSS_ORDER: case orderTypeString.STOPLOSS:
                    if (changeValue !== 0 || parseFloat(this.props.modifyOrder.stopPrice) !== parseFloat(this.props.data.stop_price)) {
                        this.dic.isChange = true;
                        if (this.props.data.filled_quantity) {
                            this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}`;
                            this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('stoplossUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.data.limit_price, PRICE_DECIMAL.PRICE)} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)}?`
                            // this.dic.note = `${changeText} @ MKT`;
                        } else {
                            this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}`;
                            this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('stoplossUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketUpper')} ${I18n.t('price')}, ${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.data.stop_price, PRICE_DECIMAL.PRICE)} ${I18n.t('toLower')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${I18n.t('marketUpper')} ${I18n.t('price')}, ${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}?`;
                            // this.dic.note = `${changeText} @ MKT, ${I18n.t('trigger')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, 3)}`;
                        }
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.TRAILINGSTOPLIMIT: case orderType.TRAILINGSTOPLIMIT_ORDER: case orderTypeString.TRAILINGSTOPLIMIT:
                    const trailingValue = this.props.data.triggerType === 'Percent' ? `${this.props.data.trailingPercent}%` : `${this.props.data.trailingAmount} ${I18n.t('cent')}`;
                    const trailingNewValue = this.props.modifyOrder.triggerType === 'Percent' ? `${this.props.modifyOrder.trailingPercent}%` : `${this.props.modifyOrder.trailingAmount} ${I18n.t('cent')}`;
                    if (changeValue !== 0 || parseFloat(this.props.modifyOrder.stopPrice) !== parseFloat(this.props.data.stop_price)) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t('modifyUpper')} ${tradeType.toUpperCase()} / ${changeText} @ STP ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}`;
                        // TODO: check trailing stop price
                        this.dic.confirmTextOrder = `${I18n.t('modify')} ${I18n.t('trailingStopLimitUpper')} ${I18n.t('order_txt')} ${I18n.t('fromLower')} ${tradeType === 'Buy' ? I18n.t('buyingUpper') : I18n.t('sellingUpper')} ${formatNumber(this.props.data.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.data.limit_price, PRICE_DECIMAL.PRICE)}, ${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.data.stop_price, PRICE_DECIMAL.PRICE)}, ${I18n.t('and')} ${I18n.t('trailing')} ${this.props.data.triggerType} ${I18n.t('at')} ${trailingValue} ${I18n.t('toLower')} ${tradeType === 'Buy' ? I18n.t('buying') : I18n.t('selling')} ${formatNumber(this.props.modifyOrder.volume)} ${I18n.t('of')} ${displayName} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.limitPrice, PRICE_DECIMAL.PRICE)} ${I18n.t('trigger')} ${I18n.t('at')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, PRICE_DECIMAL.PRICE)}, ${I18n.t('and')} ${I18n.t('trailing')} ${this.props.modifyOrder.triggerType} ${I18n.t('at')} ${trailingNewValue} ?`;
                        // this.dic.note = `${changeText} @ LMT ${formatNumberNew2(this.props.modifyOrder.stopPrice, 3)}, ${I18n.t('trigger')} ${formatNumberNew2(this.props.modifyOrder.stopPrice, 3)}, ${this.props.data.trail_amount ? I18n.t('trailingAmount') : I18n.t('trailingPercent')} ${this.props.data.trail_amount ? this.props.data.trail_amount : formatNumberNew2(this.props.data.trail_percent, 2)}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
            }
        } catch (error) {
            logAndReport('renderOrderContent modifyOrder exception', error, 'renderOrderContent modifyOrder');
            logDevice('info', `NewOrder - renderOrderContent ${type}: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    calculatorOrderValue() {
        const tradeType = this.props.data.is_buy ? 'buy' : 'sell';
        const type = (this.props.data.order_type + '').toUpperCase() || '';
        switch (type) {
            case orderTypeString.LIMIT: case orderType.LIMIT: case orderType.LIMIT_ORDER:
                return new Big(this.props.modifyOrder.limitPrice);
            case orderTypeString.STOP_MARKET: case orderType.STOP: case orderType.STOP_ORDER:
            case orderTypeString.STOP_LIMIT: case orderType.STOP_LIMIT: case orderType.STOP_LIMIT_ORDER:
                return new Big(this.props.modifyOrder.stopPrice);
            default:
                let price = null;
                if (this.props.data.condition_name === filterConditionName.stopLoss) {
                    if (!this.props.modifyOrder.stopPrice) {
                        price = new Big('0');
                    } else {
                        price = new Big(this.props.modifyOrder.stopPrice)
                    }
                } else {
                    if (tradeType === tradeTypeString.SELL) {
                        if (!this.state.ask_price || this.state.ask_price === undefined) {
                            price = new Big('0');
                        } else {
                            price = new Big(this.state.ask_price);
                        }
                    } else {
                        if (!this.state.bid_price || this.state.bid_price === undefined) {
                            price = new Big('0');
                        } else {
                            price = new Big(this.state.bid_price);
                        }
                    }
                }
                return price;
        }
    }

    renderFooter() {
        return (
            <View style={[styles.rowFooter, { bottom: this.state.isShowKeyboard ? -295 : 0 }]}>
                {
                    this.state.isDefault ? null : (<View style={styles.pagination}>
                        {
                            func.getUserPriceSource() === userType.Delay ? null : <View style={this.state.activeDot === 0 ? styles.activeDot : styles.dot} />
                        }
                        <View style={this.state.activeDot === 1 ? styles.activeDot : styles.dot} />
                        <View style={this.state.activeDot === 2 ? styles.activeDot : styles.dot} />
                        <View style={this.state.activeDot === 3 ? styles.activeDot : styles.dot} />
                        <View style={this.state.activeDot === 4 ? styles.activeDot : styles.dot} />
                        <View style={this.state.activeDot === 5 ? styles.activeDot : styles.dot} />
                    </View>)
                }
            </View>
        )
    }

    renderButtonBuySell() {
        return (
            <View style={[styles.buttonExpand, { paddingTop: func.getUserPriceSource() !== userType.Streaming ? -16 : 16, backgroundColor: CommonStyle.backgroundColor }]}>
                <ButtonBox buy
                    testID='modifyOrderButtonSell'
                    disabled={true}
                    width={'48%'}
                    value1={this.state.isLoadingPrice ? '--' : formatNumber(this.state.bid_size)}
                    value2={this.state.isLoadingPrice ? '--' : formatNumberNew2(this.state.bid_price, PRICE_DECIMAL.PRICE)} />
                <View style={{ width: '4%' }}></View>
                <ButtonBox
                    testID='modifyOrderButtonBuy'
                    disabled={true}
                    width={'48%'}
                    value1={this.state.isLoadingPrice ? '--' : formatNumberNew2(this.state.ask_price, PRICE_DECIMAL.PRICE)}
                    value2={this.state.isLoadingPrice ? '--' : formatNumber(this.state.ask_size)} />
            </View>
        )
    }

    confirmOrder() {
        this.setState({
            visibleAlert: false
        })
        try {
            if (this.props.isConnected) {
                try {
                    logDevice('info', `ModifyOrder - Object objOrder: ${this.dic.orderObj ? JSON.stringify(this.dic.orderObj) : ''}`);
                    // Apply vetting amend order
                    const orderID = this.props.data.broker_order_id
                    const vettingObj = {
                        broker_order_id: `${orderID}`,
                        note: this.dic.note,
                        volume: Util.getNullable(this.dic.orderObj.volume),
                        limit_price: Util.getNullable(this.dic.orderObj.limit_price),
                        stop_price: Util.getNullable(this.dic.orderObj.stop_price)
                    }
                    const byPassVetting = config.byPassVetting
                    Business.checkVettingOrder(Enum.ORDER_ACTION.AMEND, vettingObj, byPassVetting, orderID)
                        .then(res => {
                            const status = res.status
                            const errorCode = res.errorCode || ''
                            switch (status) {
                                case Enum.RESPONSE_STATUS.PASS:
                                    this.dic.error = '';
                                    this.resetError()
                                    this.dic.errorLen = 1;
                                    Animated.timing(
                                        this.state.heightError,
                                        {
                                            duration: 0,
                                            toValue: 0
                                        }
                                    ).start();
                                    return this.setState({
                                        excuting: false
                                    }, () => {
                                        this.sendOrderRequest(this.dic.orderObj);
                                    })
                                case Enum.RESPONSE_STATUS.FAIL:
                                    this.dic.error = errorCode
                                    return this.setState({ totalFees: 0, excuting: false }, () => {
                                        this.setAnimationError();
                                    });
                                default:
                                    console.log('CHECK VETTING AMEND ORDER EXCEPTION:', errorCode)
                                    return this.setState({ excuting: false }, () => {
                                        if (errorCode === Enum.ERROR_CODE.TIMEOUT) {
                                            this.dic.error = I18n.t('timeoutOrder')
                                            this.setAnimationError();
                                        }
                                    })
                            }
                        })
                } catch (error) {
                    logAndReport('confirmOrder modifyOrder exception', error, 'confirmOrder modifyOrder');
                }
            }
        } catch (error) {
            logAndReport('confirmOrder modifyOrder exception', error, 'confirmOrder modifyOrder');
        }
    }

    sendOrderRequest(objOrder) {
        try {
            const objOrderHistory = {};
            objOrderHistory.broker_order_id = objOrder.broker_order_id;
            objOrderHistory.note = objOrder.note;
            objOrderHistory.volume = objOrder.volume;
            objOrderHistory.order_type = this.props.data.order_type;
            objOrderHistory.duration = this.props.data.duration;
            objOrderHistory.exchange = (this.props.data.trading_market + '').replace('[Demo]', '');
            objOrderHistory.limit_price = objOrder.limit_price || 0;
            objOrderHistory.stop_price = objOrder.stop_price || 0;
            objOrderHistory.trail_amount = objOrder.trail_amount || 0;
            objOrderHistory.trail_percent = objOrder.trail_percent || 0;

            this.saveLastOrderRequest(objOrderHistory, this.state.isUpdateLastOrder);
            this.showConfirmScreen();
        } catch (error) {
            logDevice('info', `Neworder - sendOrderRequest exception - ${error}`)
            logAndReport('sendOrderRequest order exception', error, 'sendOrderRequest order');
        }
    }

    cancelOrder() {
        this.setState({
            excuting: false,
            visibleAlert: false
        })
        setTimeout(() => {
            try {
                if (this.props.isConnected) {
                    try {
                        const type = (this.props.data.order_type + '').toUpperCase();
                        this.props.actions.changeOrderVolume(this.props.data.volume);
                        switch (type) {
                            case orderType.LIMIT: case orderType.LIMIT_ORDER: case orderTypeString.LIMIT:
                                this.props.actions.changePrice(orderTypeString.LIMIT, this.props.data.limit_price);
                                break;
                            case orderType.STOP: case orderType.STOP_ORDER: case orderTypeString.STOP_MARKET:
                                this.props.actions.changePrice(orderTypeString.STOP_MARKET, this.props.data.stop_price);
                                break;
                            case orderType.STOP_LIMIT: case orderType.STOP_LIMIT_ORDER: case orderTypeString.STOP_LIMIT:
                                this.props.actions.changePrice(orderTypeString.LIMIT, this.props.data.limit_price);
                                this.props.actions.changePrice(orderTypeString.STOP_MARKET, this.props.data.stop_price);
                                break;
                            default: break;
                        }
                    } catch (error) {
                        logAndReport('cancelOrder modifyOrder exception', error, 'cancelOrder modifyOrder');
                    }
                } else {
                    Alert.alert(
                        '',
                        I18n.t('pleaseCheckConnection'),
                        [
                            {
                                text: I18n.t('ok')
                            }
                        ],
                        { cancelable: false }
                    )
                }
            } catch (error) {
                logAndReport('cancelOrder modifyOrder exception', error, 'cancelOrder modifyOrder');
                logDevice('info', `ModifyOrder - cancelOrder: ${error ? JSON.stringify(error) : ''}`);
            }
        }, 100)
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

    // alertTradingHalt() {
    //     const displayName = this.props.displayName
    //     Alert.alert(
    //         '',
    //         `${I18n.t('alertTralingHalf')} ${displayName}`,
    //         [
    //             {
    //                 text: I18n.t('ok'),
    //                 onPress: this.closeHandler
    //             }
    //         ],
    //         { cancelable: false }
    //     )
    // }

    setAnimationError() {
        this.refs && this.refs.modifyOrderScroll && this.refs.modifyOrderScroll.scrollTo(0);
        this.timeoutError && clearTimeout(this.timeoutError);
        Animated.timing(
            this.state.heightError,
            {
                duration: 500,
                toValue: 20 * this.dic.errorLen
            }
        ).start();
        this.refs && this.refs.textError && this.refs.textError.fadeInDownBig(1000);
        this.timeoutError = setTimeout(() => {
            Animated.timing(
                this.state.heightError,
                {
                    duration: 500,
                    toValue: 0
                }
            ).start();
            // this.dic.error = '';
            this.refs && this.refs.textError && this.refs.textError.fadeOutUpBig(1000);
        }, 5000)
    }

    checkOrderValue() {
        // return;
        // if (this.dic.volume > 0 && data.is_buy) {
        //   let price = this.calculatorOrderValue();
        //   let orderValue = price.times(this.dic.volume).toString();
        //   // let orderValue = price.times(this.props.modifyOrder.volume).toString();
        //   let totalValue = parseFloat(orderValue) + parseFloat(fees);
        //   if (totalValue > this.state.cashAvailable) {
        //     this.dic.error = I18n.t('orderValueLessCashAvailable');
        //     this.setState({
        //       orderValueError: I18n.t('orderValueLessCashAvailable')
        //     }, () => {
        //       isShowError && this.setAnimationError();
        //     });
        //   }
        // }
    }

    checkError(volume, limitPrice, stopPrice, trailingAmount, trailingPercent, trailingStopPrice, ordertype) {
        try {
            const objErr = {
                trailingStopPriceError: '',
                trailingErrorText: '',
                limitPriceErrorText: '',
                stopPriceErrorText: '',
                orderValueError: '',
                volumeErrorText: ''
            }
            let isError = false;
            const filledMin = !this.props.data.filled_quantity ? 0 : (parseInt(this.props.data.filled_quantity) + 1);
            if (parseFloat(volume) === 0) {
                this.dic.error = I18n.t('volumeRequired');
                objErr['volumeErrorText'] = I18n.t('volumeRequired');
                isError = true;
                const orderState = this.props.data.order_state
                const filledQuantity = this.props.data.filled_quantity
            } else {
                if (parseFloat(volume) < filledMin) {
                    this.dic.error = I18n.t('amendedVolumeWithPartialFill');
                    objErr['volumeErrorText'] = I18n.t('amendedVolumeWithPartialFill');
                    isError = true;
                } else {
                    ordertype = (ordertype + '').toUpperCase();
                    switch (ordertype) {
                        case orderTypeString.TRAILINGSTOPLIMIT: case orderType.TRAILINGSTOPLIMIT: case orderType.TRAILINGSTOPLIMIT_ORDER:
                            if (this.props.data.triggerType === triggerType.PERCENT) {
                                if (parseFloat(trailingPercent) === 0) {
                                    this.dic.error = I18n.t('trailingPercentRequired');
                                    objErr['trailingErrorText'] = I18n.t('trailingPercentRequired');
                                    isError = true;
                                    break;
                                }
                            } else {
                                if (parseFloat(trailingAmount) === 0) {
                                    this.dic.error = I18n.t('trailingAmountRequired');
                                    objErr['trailingErrorText'] = I18n.t('trailingAmountRequired');
                                    isError = true;
                                    break;
                                }
                            }
                            if (parseFloat(trailingStopPrice) <= 0) {
                                this.dic.error = I18n.t('trailingStopPriceRequired');
                                objErr['trailingStopPriceError'] = I18n.t('trailingStopPriceRequired');
                                isError = true;
                                break;
                            } else {
                                if (this.props.data.is_buy) {
                                    if (parseFloat(limitPrice) < parseFloat(trailingStopPrice)) {
                                        isError = true;
                                        this.dic.error = I18n.t('limitPriceGreaterTrailingStopPrice');
                                        objErr['limitPriceErrorText'] = I18n.t('limitPriceGreaterTrailingStopPrice');
                                        break;
                                    }
                                    if (parseFloat(trailingStopPrice) < parseFloat(this.state.ask_price)) {
                                        isError = true;
                                        this.dic.error = I18n.t('stopPriceLessAskPrice');
                                        objErr['trailingStopPriceError'] = I18n.t('stopPriceLessAskPrice');
                                        break;
                                    }
                                } else {
                                    if (parseFloat(limitPrice) > parseFloat(trailingStopPrice)) {
                                        isError = true;
                                        this.dic.error = I18n.t('limitPriceLessTrailingStopPrice');
                                        objErr['limitPriceErrorText'] = I18n.t('limitPriceLessTrailingStopPrice');
                                        break;
                                    }
                                    if (parseFloat(trailingStopPrice) > parseFloat(this.state.bid_price)) {
                                        isError = true;
                                        this.dic.error = I18n.t('trailingStopPriceGreaterBidPrice');
                                        objErr['trailingStopPriceError'] = I18n.t('trailingStopPriceGreaterBidPrice');
                                        break;
                                    }
                                }
                            }
                            break;
                        case orderTypeString.STOPLOSS: case orderType.STOPLOSS: case orderType.STOPLOSS_ORDER:
                            if (parseFloat(stopPrice) === 0) {
                                isError = true;
                                this.dic.error = I18n.t('stopPriceValid');
                                objErr['stopPriceErrorText'] = I18n.t('stopPriceValid');
                                break;
                            }
                            if (this.props.data.is_buy) {
                                if (parseFloat(stopPrice) < parseFloat(this.state.ask_price)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceLessAskPrice');
                                    objErr['stopPriceErrorText'] = I18n.t('stopPriceLessAskPrice');
                                    break;
                                }
                            } else {
                                if (parseFloat(stopPrice) > parseFloat(this.state.bid_price)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceGreaterBidPrice');
                                    objErr['stopPriceErrorText'] = I18n.t('stopPriceGreaterBidPrice');
                                    break;
                                }
                            }
                            break;
                        case orderTypeString.STOP_MARKET: case orderType.STOP: case orderType.STOP_ORDER:
                            if (parseFloat(stopPrice) === 0) {
                                isError = true;
                                this.dic.error = I18n.t('stopPriceValid');
                                objErr['stopPriceErrorText'] = I18n.t('stopPriceValid');
                                break;
                            }
                            if (this.props.data.is_buy) {
                                if (parseFloat(stopPrice) < parseFloat(this.state.ask_price)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceLessAskPrice');
                                    objErr['stopPriceErrorText'] = I18n.t('stopPriceLessAskPrice');
                                    this.setState(objErr);
                                    break;
                                }
                            } else {
                                if (parseFloat(stopPrice) > parseFloat(this.state.bid_price)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceGreaterBidPrice');
                                    objErr['stopPriceErrorText'] = I18n.t('stopPriceGreaterBidPrice');
                                    break;
                                }
                            }
                            break;
                        case orderTypeString.LIMIT: case orderType.LIMIT: case orderType.LIMIT_ORDER:
                            if (parseFloat(limitPrice) === 0) {
                                isError = true;
                                this.dic.error = I18n.t('limitPriceValid');
                                objErr['limitPriceErrorText'] = I18n.t('limitPriceValid');
                                break;
                            }
                            break;
                        case orderType.MARKETTOLIMIT: case orderTypeString.MARKETTOLIMIT:
                            if (this.props.data.filled_quantity && parseFloat(limitPrice) === 0) {
                                isError = true;
                                this.dic.error = I18n.t('limitPriceValid');
                                objErr['limitPriceErrorText'] = I18n.t('limitPriceValid');
                                break;
                            }
                            break;
                        case orderTypeString.STOP_LIMIT: case orderType.STOP_LIMIT: case orderType.STOP_LIMIT_ORDER:
                            if (parseFloat(stopPrice) === 0) {
                                isError = true;
                                this.dic.error = I18n.t('stopPriceValid');
                                objErr['stopPriceErrorText'] = I18n.t('stopPriceValid');
                                break;
                            }
                            if (parseFloat(limitPrice) === 0) {
                                isError = true;
                                this.dic.error = I18n.t('limitPriceValid');
                                objErr['limitPriceErrorText'] = I18n.t('limitPriceValid');
                                break;
                            }
                            if (this.props.data.is_buy) {
                                if (parseFloat(stopPrice) < parseFloat(this.state.ask_price)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceLessAskPrice');
                                    objErr['stopPriceErrorText'] = I18n.t('stopPriceLessAskPrice');
                                    this.setState(objErr);
                                    break;
                                }
                                if (parseFloat(limitPrice) < parseFloat(stopPrice)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceGreaterLimitPrice');
                                    objErr['limitPriceErrorText'] = I18n.t('stopPriceGreaterLimitPrice');
                                    break;
                                }
                            } else {
                                if (parseFloat(stopPrice) > parseFloat(this.state.bid_price)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceGreaterBidPrice');
                                    objErr['stopPriceErrorText'] = I18n.t('stopPriceGreaterBidPrice');
                                    break;
                                }
                                if (parseFloat(limitPrice) > parseFloat(stopPrice)) {
                                    isError = true;
                                    this.dic.error = I18n.t('stopPriceLessLimitPrice');
                                    objErr['limitPriceErrorText'] = I18n.t('stopPriceLessLimitPrice');
                                    break;
                                }
                            }
                            break;
                    }
                }
            }
            if (isError) {
                this.setState({ totalFees: 0, objErr }, () => {
                    this.setAnimationError();
                });
            } else {
                this.dic.error = '';
                this.resetError()
                this.dic.errorLen = 1;
                Animated.timing(
                    this.state.heightError,
                    {
                        duration: 0,
                        toValue: 0
                    }
                ).start();
            }
            logDevice('info', `ModifyOrder - This.error: ${this.dic.error}`);
        } catch (error) {
            logAndReport('onShowConfirmModal modifyOrder exception', error, 'onShowConfirmModal modifyOrder');
            logDevice('info', `ModifyOrder - onShowConfirmModal: ${error ? JSON.stringify(error) : ''}`);
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
            this.setState({ excuting: true })

            Keyboard.dismiss();

            const { modifyOrder } = this.props;
            const orderType = this.getOrderType(this.props.originOrderType)
            this.checkError(modifyOrder.volume, modifyOrder.limitPrice, modifyOrder.stopPrice, modifyOrder.trailingAmount, modifyOrder.trailingPercent, modifyOrder.trailingStopPrice, orderType);
            if (this.dic.error === '') {
                this.confirmOrder()
            }
            Business.setTimeoutClick(this.dic.isPress)
        } catch (error) {
            logAndReport('onShowConfirmModal modifyOrder exception', error, 'onShowConfirmModal modifyOrder');
            logDevice('info', `ModifyOrder - onShowConfirmModal: ${error ? JSON.stringify(error) : ''}`);
        }
    }

    checkNotWarning(volume, limitPrice, stopPrice, type) {
        let error = '';
        let filledMin = 0;
        if (!this.props.data.filled_quantity || this.props.data.filled_quantity === undefined) {
            filledMin = 0;
        } else {
            filledMin = this.props.data.filled_quantity + 1;
        }
        if (parseFloat(volume) === 0) {
            error = I18n.t('volumeRequired');
            return error;
        }
        if (parseFloat(volume) < filledMin) {
            error = I18n.t('amendedVolumeWithPartialFill');
            return error;
        }
        if (type !== 'volume') {
            const orderType = this.getOrderType(this.props.data.order_type)
            switch (orderType) {
                case orderTypeString.STOP_MARKET:
                    if (parseFloat(stopPrice) === 0) {
                        error = I18n.t('stopPriceValid');
                        break;
                    }
                    if (this.props.data.is_buy) {
                        if (parseFloat(stopPrice) < parseFloat(this.state.ask_price)) {
                            error = I18n.t('stopPriceLessAskPrice');
                            break;
                        }
                    } else {
                        if (parseFloat(stopPrice) > parseFloat(this.state.bid_price)) {
                            error = I18n.t('stopPriceGreaterBidPrice');
                            break;
                        }
                    }
                    break;
                case orderTypeString.LIMIT:
                    if (parseFloat(limitPrice) === 0) {
                        error = I18n.t('limitPriceValid');
                        break;
                    }
                    break;
                case orderTypeString.STOP_LIMIT:
                    if (parseFloat(stopPrice) === 0) {
                        error = I18n.t('stopPriceValid');
                        break;
                    }
                    if (parseFloat(limitPrice) === 0) {
                        error = I18n.t('limitPriceValid');
                        break;
                    }
                    if (this.props.data.is_buy) {
                        if (parseFloat(stopPrice) < parseFloat(this.state.ask_price)) {
                            error = I18n.t('stopPriceLessAskPrice');
                            break;
                        }
                        if (parseFloat(limitPrice) < parseFloat(stopPrice)) {
                            error = I18n.t('stopPriceGreaterLimitPrice');
                            break;
                        }
                    } else {
                        if (parseFloat(stopPrice) > parseFloat(this.state.bid_price)) {
                            error = I18n.t('stopPriceGreaterBidPrice');
                            break;
                        }
                        if (parseFloat(limitPrice) > parseFloat(stopPrice)) {
                            error = I18n.t('stopPriceLessLimitPrice');
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
        })
    }

    getOrderType(key) {
        try {
            if (!key) return key;
            const newKey = key.replace('_ORDER', '');
            return orderType[newKey];
        } catch (error) {
            logAndReport('getOrderType modifyOrder exception', error, 'getOrderType modifyOrder');
            logDevice('info', `ModifyOrder - getOrderType - ${key}: ${key ? JSON.stringify(key) : ''}`);
        }
    }

    getOrderTypeString(key) {
        try {
            key = (key + '').toUpperCase();
            const newKey = (key + '').replace('_ORDER', '');
            return Translate.getInvertTranslate(orderTypeString[newKey].toUpperCase());
        } catch (error) {
            logAndReport('getOrderType listcontent exception', error, 'getOrderType listContent');
        }
    }

    renderAtribute(value, label) {
        return (
            <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{label}</Text>
                <Text numberOfLines={1} style={[CommonStyle.textMain, { fontSize: CommonStyle.fontSizeM }]}>{value}</Text>
            </View>
        );
    }

    renderError() {
        return (
            <Animatable.View ref='textError' testID='orderError'
                style={{ width: width, backgroundColor: '#DF0000', height: this.state.heightError, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
                <Text style={CommonStyle.textSubLightWhite}>{this.dic.error}</Text>
            </Animatable.View>
        );
    }

    setActiveDot(index) {
        this.setState({ activeDot: index });
    }

    onTextLayout(e) {
        if (e && e.nativeEvent && e.nativeEvent.layout) {
            this.setState({ heightButton: e.nativeEvent.layout.height });
        }
    }

    getReloadFuncLv2(funcReload) {
        this.reloadFuncLv2 = funcReload;
    }

    getReloadFuncCos(funcReload) {
        this.reloadFuncCos = funcReload;
    }

    checkRenderOrder(data) {
        const type = (data.order_type + '').toUpperCase();
        const typeOrigin = (this.props.originOrderType + '').toUpperCase();
        if (type === orderType.MARKETTOLIMIT || type === orderType.MARKETTOLIMIT_ORDER) {
            if (typeOrigin === orderType.STOPLOSS || typeOrigin === orderType.STOPLOSS_ORDER) {
                if (this.props.data.filled_quantity) {
                    return this.renderLimitPriceRight();
                }
                return this.renderStopPrice();
            }
            return (
                <View style={{ width: '50%', paddingLeft: 8 }}>
                    <PickerCustom
                        testID='volumeModify'
                        name='Volume'
                        editable={true}
                        errorText={this.state.volumeErrorText}
                        onChangeText={this.onChangeText.bind(this, 'volume')}
                        floatingLabel={I18n.t('volume')}
                        selectedValue={this.props.modifyOrder.volume}
                        onValueChange={this.changeVolume.bind(this)}
                        data={this.dic.listVolume} />
                </View>
            )
        } else if (type === orderType.TRAILINGSTOPLIMIT || type === orderType.TRAILINGSTOPLIMIT_ORDER) {
            return this.renderTrailingStopPrice();
        } else {
            return this.renderLimitPriceRight();
        }
    }

    async loadLastOrderRequest(code) {
        try {
            const key = `order_history_${dataStorage.accountId}_${code}`;
            const lastOrder = await new Promise(resolve => {
                AsyncStorage.getItem(key)
                    .then(res => resolve(res))
                    .catch(err => {
                        console.log('loadLastOrderRequest error', err)
                        resolve()
                    })
            })
            if (lastOrder) {
                this.setState({ isUpdateLastOrder: true }, () => {
                    this.dic.isCallOrderHistory = false;
                });
            } else {
                this.setState({ isUpdateLastOrder: false }, () => {
                    this.dic.isCallOrderHistory = false;
                });
            }
        } catch (error) {
            logAndReport(`Order - loadLastOrderRequest Error: ${error}`);
            logDevice('info', `Order - loadLastOrderRequest Error: ${error}`);
        }
    }

    async saveLastOrderRequest(objOrder, isUpdateLastOrder) {
        try {
            const objOrderString = JSON.stringify(objOrder);
            const displayName = getDisplayName(this.props.data.symbol);
            const key = `order_history_${dataStorage.accountId}_${displayName}`;
            if (isUpdateLastOrder) {
                await AsyncStorage.mergeItem(key, objOrderString, (error) => {
                    if (error) {
                        console.log(`New Order AsyncStorage.mergeItem Error: ${error}`);
                    }
                })
            } else {
                await AsyncStorage.setItem(key, objOrderString, (error) => {
                    if (error) {
                        console.log(`New Order AsyncStorage.setItem Error: ${error}`);
                    }
                });
            }
        } catch (error) {
            logAndReport(`Order - saveLastOrderRequest Error: ${error}`);
            logDevice('info', `Order - saveLastOrderRequest Error: ${error}`);
        }
    }

    renderHeader(title) {
        return (
            <View style={{ paddingLeft: 16, height: 48, justifyContent: 'center', marginTop: 10 }}>
                <Text style={CommonStyle.fontLargeNormal1}>{title}</Text>
            </View>
        );
    }

    renderQuantity() {
        return (
            <View style={{ width: '100%', marginBottom: 16 }}>
                <PickerCustom
                    testID={`newOrderVolume`}
                    navigator={this.dic.nav}
                    name='Volume'
                    disabled={this.state.excuting || this.state.isDefault}
                    editable={true}
                    errorText={this.state.volumeErrorText}
                    onChangeText={this.onChangeText.bind(this, 'volume')}
                    floatingLabel={I18n.t('quantity')}
                    selectedValue={formatNumber(this.props.modifyOrder.volume)}
                    onValueChange={this.changeVolume.bind(this)}
                    data={this.dic.listVolume.map(e => formatNumber(e))} />
            </View>
        )
    }

    registerSetTimeUpdate(setTimeUpdate) {
        if (setTimeUpdate) {
            this.dic.setTimeUpdate = setTimeUpdate
        }
    }

    renderSide() {
        return <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{I18n.t('side_txt')}</Text>
            <Text numberOfLines={1} style={[CommonStyle.textMain, { fontSize: CommonStyle.fontSizeM, fontWeight: 'bold', color: this.props.data.is_buy ? CommonStyle.fontOceanGreen : CommonStyle.btnSellModify }]}>{this.props.data.is_buy ? I18n.t('buyUpper') : I18n.t('sellUpper')}</Text>
        </View>
    }

    renderSymbol(displayName, flagIcon) {
        return <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{I18n.t('code')}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text>
                <Text numberOfLines={1} style={[CommonStyle.textMain, { fontSize: CommonStyle.fontSizeM, fontWeight: 'bold', marginRight: 4 }]}>{displayName}</Text>
                <Flag style={{ marginTop: 1 }}
                    type={'flat'}
                    code={flagIcon}
                    size={18}
                />
            </View>
        </View>
    }

    renderCompany() {
        const companyName = dataStorage.symbolEquity[this.props.data.symbol] ? (dataStorage.symbolEquity[this.props.data.symbol].company_name || dataStorage.symbolEquity[this.props.data.symbol].company || dataStorage.symbolEquity[this.props.data.symbol].security_name || '') : '';
        return <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{I18n.t('company')}</Text>
            <Text style={[CommonStyle.textSubDark, { fontSize: CommonStyle.font17, textAlign: 'right', maxWidth: '60%' }]}>{companyName.toUpperCase()}</Text>
        </View>
    }

    renderMasterCode(flagIcon) {
        const masterCode = (dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].display_master_code) || ''
        return Business.isFuture(dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].class) ? <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{I18n.t('MasterCode')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[CommonStyle.textSubDark, { fontSize: CommonStyle.font17, textAlign: 'right', marginRight: 10 }]}>{(masterCode + '').toUpperCase()}</Text>
                <Flag style={{ marginTop: 1 }}
                    type={'flat'}
                    code={flagIcon}
                    size={18}
                />
            </View>
        </View> : null
    }

    renderMasterName() {
        const masterName = (dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].display_master_name) || ''
        return Business.isFuture(dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].class) ? <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{I18n.t('MasterName')}</Text>
            <Text style={[CommonStyle.textSubDark, { fontSize: CommonStyle.font17, textAlign: 'right' }]}>{(masterName + '').toUpperCase()}</Text>
        </View> : null
    }

    renderProduct() {
        const product = dataStorage.symbolEquity[this.props.data.symbol] ? dataStorage.symbolEquity[this.props.data.symbol].class : ''
        return <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeS }]}>{I18n.t('Product')}</Text>
            <Text style={[CommonStyle.textSubDark, { fontSize: CommonStyle.font17, textAlign: 'right' }]}>{product && SYMBOL_CLASS_DISPLAY[product] ? SYMBOL_CLASS_DISPLAY[product].toUpperCase() : ''}</Text>
        </View>
    }

    renderButtonModify() {
        const accountCurrency = dataStorage.currentAccount && dataStorage.currentAccount.currency
        const objCur = Util.renderCurBaseOnAccountCur(accountCurrency)
        const loading = (
            <View style={{
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
            }}>
                <View onLayout={this.onTextLayout} style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 16 }}>
                        <ActivityIndicator style={{ width: 18, height: 18, marginRight: 6 }} color={CommonStyle.fontWhite} />
                        <Text style={[CommonStyle.textButtonColor, { textAlign: 'center', fontSize: CommonStyle.font13, marginBottom: 6, color: '#FFFFFF', maxWidth: '85%' }]}>{this.dic.confirmTextButton}</Text>
                    </View>
                    <Text style={[CommonStyle.textButtonColorS, { textAlign: 'center', fontSize: CommonStyle.fontSizeXS, color: '#FFFFFF' }]}>{`${I18n.t('cashAvailableToTradeIs')} ${this.state.cashAvailable < 0 ? '-' : ''}${objCur.symbolCur}${formatNumberNew2(this.state.cashAvailable, PRICE_DECIMAL.VALUE).replace(/-/g, '')} ${objCur.currency}`}</Text>
                </View>
            </View>
        );
        const success = (
            <View style={{
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Ionicons name='md-checkmark-circle' color='#FFF' size={30} />
                <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', textAlign: 'center' }]}>{I18n.t('success')}</Text>
            </View>
        );
        const error = (
            <View style={{
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Ionicons name='md-close-circle' color='#FFF' size={30} />
                <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', textAlign: 'center' }]}>{I18n.t('error')}</Text>
            </View>
        );
        return <TouchableOpacity
            disabled={
                !this.dic.isChange ||
                !this.props.isConnected ||
                this.state.excuting ||
                !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.MODIFY_BUY_SELL_ORDER)}
            onPress={() => {
                if (this.dic.isPress) return;
                this.onShowConfirmModal()
            }}
            style={[
                styles.buttonSellBuy,
                {
                    backgroundColor: this.props.data.is_buy
                        ? (!this.dic.isChange || !this.props.isConnected || this.state.excuting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.MODIFY_BUY_SELL_ORDER) ? CommonStyle.btnDisableBg : CommonStyle.fontOceanGreen)
                        : (!this.dic.isChange || !this.props.isConnected || this.state.excuting || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.MODIFY_BUY_SELL_ORDER) ? CommonStyle.btnDisableBg : CommonStyle.btnSellModify),
                    marginLeft: 16
                }
            ]}>
            {
                !this.state.visibleAlert && this.state.excuting
                    ? loading
                    : (
                        this.state.isShowError
                            ? error
                            : (this.state.orderPlaceSuccess
                                ? success
                                : <View onLayout={this.onTextLayout} style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={[CommonStyle.textButtonColor, { textAlign: 'center', fontSize: CommonStyle.font13, marginBottom: 6 }]}>{this.dic.confirmTextButton}</Text>
                                    <Text style={[CommonStyle.textButtonColorS, { textAlign: 'center', fontSize: CommonStyle.fontSizeXS }]}>{`${I18n.t('cashAvailableToTradeIs')} ${this.state.cashAvailable < 0 ? '-' : ''}${objCur.symbolCur}${formatNumberNew2(this.state.cashAvailable, PRICE_DECIMAL.VALUE).replace(/-/g, '')} ${accountCurrency}`}</Text>
                                </View>)
                    )
            }
        </TouchableOpacity>
    }

    renderMarketDepth() {
        if (!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_MARKET_DEPTH_MODIFY_ORDER)) {
            return (
                <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
                    {
                        <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noMarketDepth')}</Text>
                    }
                </View>
            );
        }

        return Controller.isPriceStreaming()
            ? (
                <SwiperMarketDepthRealtime
                    code={this.props.data.symbol}
                    isOrder={true}
                    orderScreen={true}
                />
            )
            : (
                <SwiperMarketDepth
                    getReloadFuncLv2={this.getReloadFuncLv2}
                    code={this.props.data.symbol}
                    isOrder={true}
                    orderScreen={true}
                />
            )
    }

    renderCos() {
        if (!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_COURSE_OF_SALES_MODIFY_ORDER)) {
            return (
                <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noCosData')}</Text>
                </View>
            );
        }

        return Controller.isPriceStreaming()
            ? (
                <TenTradeRealtime
                    code={this.props.data.symbol}
                    isOrder={true}
                    orderScreen={true}
                />
            )
            : (
                <TenTrade
                    getReloadFuncCos={this.getReloadFuncCos}
                    code={this.props.data.symbol}
                    isOrder={true}
                    orderScreen={true}
                />
            )
    }

    render() {
        const { data } = this.props;
        const displayExchange = dataStorage.symbolEquity[data.symbol] && dataStorage.symbolEquity[data.symbol].display_exchange ? dataStorage.symbolEquity[data.symbol].display_exchange : (this.state.exchange || '')
        const symbolCurrency = dataStorage.symbolEquity[data.symbol] && dataStorage.symbolEquity[data.symbol].display_exchange ? dataStorage.symbolEquity[data.symbol].currency : ''
        const originOrderType = orderTypeString[(this.props.originOrderType && this.props.originOrderType.replace('_ORDER', '')) || (data.order_type && data.order_type.replace('_ORDER', ''))];
        this.dic.originOrderType = (this.props.originOrderType + '').toUpperCase();
        this.setOrderContent(this.dic.originOrderType);
        const displayName = getDisplayName(this.props.data.symbol);

        // Flag Icon
        const exchange = data.trading_market || '--';
        const flagIcon = symbolCurrency ? Business.getFlagByCurrency(symbolCurrency) : Business.getFlagByExchange(this.getTradingMarket(data), displayExchange)
        const durationString = Translate.getInvertTranslate(Business.getDisplayDuration(data.duration));
        const expireDate = data.expire_date
        return (
            <View testID='modifyOrderScreen' style={{ alignItems: 'center', marginTop: dataStorage.platform === 'ios' ? 0 : 55, backgroundColor: CommonStyle.backgroundColor }}>
                {
                    this.props.isConnected ? null : <NetworkWarning />
                }
                {
                    func.getUserPriceSource() === userType.Delay
                        ? <Warning
                            testID='orderWarning'
                            warningText={I18n.t('delayWarning')}
                            isConnected={true} />
                        : null
                }
                <View style={{ width: '100%' }}>
                    <ScrollView showsVerticalScrollIndicator={false} ref='modifyOrderScroll'
                        style={{ backgroundColor: CommonStyle.backgroundColor }}
                        scrollEnabled={true}
                        keyboardShouldPersistTaps={'handled'}>
                        {
                            this.renderError()
                        }
                        {
                            !Controller.isPriceStreaming()
                                ? <TimeUpdated testID={`orderTimeUpdated`} isShow={true} registerSetTimeUpdate={this.registerSetTimeUpdate} />
                                : <View style={{ marginTop: 16 }} />
                        }
                        {
                            this.renderSide()
                        }
                        {
                            this.renderSymbol(displayName, flagIcon)
                        }
                        {
                            this.renderCompany()
                        }
                        {this.renderMasterCode(flagIcon)}
                        {this.renderMasterName()}
                        {this.renderProduct()}
                        {this.renderLastTrade()}
                        {this.renderQuantity()}
                        {
                            data.filled_quantity
                                ? this.renderAtribute(data.filled_quantity, Translate.getValByKey('Filled'))
                                : <View />
                        }
                        {
                            this.renderAtribute(
                                this.getOrderTypeString(displayExchange === 'ASX' ? data.order_type_origin : data.order_type),
                                Translate.getValByKey('orderType')
                            )
                        }
                        {/* {
                            this.renderAtribute(
                                data.condition_name || '--',
                                Translate.getValByKey('condition')
                            )
                        } */}
                        {
                            data.limit_price
                                ? this.renderLimitPrice()
                                : <View />
                        }
                        {
                            data.stop_price
                                ? this.renderStopPrice()
                                : <View />
                        }
                        {
                            this.renderAtribute(
                                durationString,
                                Translate.getValByKey('duration')
                            )
                        }
                        {
                            expireDate
                                ? this.renderAtribute(
                                    moment(new Date(expireDate)).format('DD/MM/YYYY'),
                                    Translate.getValByKey('date')
                                )
                                : <View />
                        }
                        {
                            this.renderAtribute(
                                this.state.isParitech
                                    ? this.dic.exchange
                                    : (dataStorage.symbolEquity[this.props.data.symbol] && dataStorage.symbolEquity[this.props.data.symbol].display_exchange),
                                Translate.getValByKey('exchange_txt')
                            )
                        }
                        {
                            this.renderButtonModify()
                        }
                        {
                            this.state.isDefault ? <View /> : <View style={{ paddingVertical: 4, marginHorizontal: 16, width: 127 }}>
                                <TouchableOpacity onPress={() => this.loadFormData()}>
                                    <Text style={[CommonStyle.textMain, { color: '#10a8b2' }]}>{I18n.t('clearAllData')}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {/*
                            Business.isShowSummary(false,
                                this.dic.orderObj.volume,
                                this.dic.oldOrd.filled_quantity)
                                ? <View>
                                    {this.renderHeader(I18n.t('Description'))}
                                    <View style={{ marginHorizontal: 16 }}>
                                        {this.renderDescription(originOrderType)}
                                        <TouchableOpacity onPress={() => this.toggleShowMoreDescription()}>
                                            <Text style={[CommonStyle.textMainNormal, { color: '#10a8b2' }]}>{this.state.isShowMore ? I18n.t('showLess') : I18n.t('showMore')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                : <View />
                            */}
                        {
                            Business.isShowSummary(false,
                                this.dic.orderObj.volume,
                                this.dic.oldOrd.filled_quantity)
                                ? this.renderSummary(this.dic.orderObj, this.dic.oldOrd, this.dic.feeObj)
                                : null
                        }
                        {this.renderHeader(I18n.t('marketDepth'))}
                        {
                            this.renderMarketDepth()
                        }

                        {this.renderHeader(I18n.t('courseOfSales'))}
                        {
                            this.renderCos()
                        }
                    </ScrollView>
                </View>
                {
                    AlertOrder({
                        title: this.dic.confirmTextOrder,
                        closeAlert: this.cancelOrder.bind(this),
                        visibleAlert: this.state.visibleAlert,
                        confirmOrder: this.confirmOrder.bind(this)
                    })
                }
            </View>
        )
    }
}

export function mapStateToProps(state) {
    return {
        modifyOrder: state.modifyOrder,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

export function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(modifyOrderActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyOrder);
