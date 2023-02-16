import {
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    Dimensions,
    Animated,
    Platform,
    RefreshControl,
    ActivityIndicator,
    KeyboardAvoidingView,
    BackHandler
} from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage';
import {
    logDevice,
    roundFloat,
    checkTradingHalt,
    getDisplayName,
    formatNumber,
    convertFormatToNumber,
    formatNumberNew2,
    logAndReport,
    getCommodityInfo,
    checkPropsStateShouldUpdate
} from '../../lib/base/functionUtil';
import styles from './style/modify_order';
import React from 'react';
import { connect } from 'react-redux';
import { iconsMap } from '../../utils/AppIcons';
import userType from '../../constants/user_type';
import { func, dataStorage } from '../../storage';
import CommonStyle from '~/theme/theme_controller';
import I18n from '../../modules/language/';
import orderTypeString from '../../constants/order_type_string';
import PickerCustom from './../order/new_picker';
import config from '../../config';
import * as api from '../../api';
import performanceEnum from '../../constants/performance';
import { unregister } from '../../nchan';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import Enum from '../../enum';
import * as Util from '../../util';
import Flag from '../../component/flags/flag';
import orderType from '../../constants/order_type';
import * as Business from '../../business';
import * as AllMarket from '../../streaming/all_market';
import * as Controller from '../../memory/controller';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as Translate from '../../invert_translate';
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import TabScroll from '~s/order/TabScroll';
import Summary from '~s/order/components/Detail/DepthCos/Summary';
import MarketDepth from '~s/order/components/Detail/DepthCos/MarketDepth';
import CourseOfSales from '~s/order/components/Detail/DepthCos/CourseOfSales';
import moment from 'moment';
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business';
import PriceOrder from '../order/price_order';
import * as UserPriceSource from '../../userPriceSource';
import * as RoleUser from '../../roleUser';
import Flashing from '../../component/flashing/flashing.1';
import ChangePoint from '../order/change_point';
import ChangePercent from '../order/change_percent';
import RnCollapsible from '../../component/rn-collapsible/rn-collapsible-static';
import Header from '~/component/headerNavBar';
import Icon from '../../../src/component/headerNavBar/icon';
import _ from 'lodash';
import FallHeader from '~/component/fall_header';
import PullToRefresh from '~/component/pull_to_refresh';
import ScreenId from '~/constants/screen_id';
import KeyboadShift from './keyboard_shift';
import DebonceButton from '~/component/debounce_button';
import * as ManageAppState from '~/manage/manageAppState';
import ENUM from '~/enum'

const { ENVIRONMENT } = ENUM

const NewTouchableOpacity = DebonceButton(TouchableOpacity, 1000);

const TIME_GET_FEES = 500;
const ID_ELEMENT = Enum.ID_ELEMENT;
const ICON_NAME = Enum.ICON_NAME;
const CURRENCY = Enum.CURRENCY;
const FLASHING_FIELD = Enum.FLASHING_FIELD;
const NOTE_STATE = Enum.NOTE_STATE;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
const { SYMBOL_CLASS } = Enum;

const { width } = Dimensions.get('window');
export class ModifyOrder extends React.Component {
    constructor(props) {
        super(props);
        this.isHide = true;
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        this.init();
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.setExchange();
        ManageAppState.registerAppStateChangeHandle(
            ScreenId.MODIFY_ORDER,
            this.loadDataFromApi
        );
    }

    init() {
        this._scrollValue = new Animated.Value(0);
        this.dic = {
            depthData: {},
            tradesData: [],
            symbolObject: {},
            positions: {},
            heightLastTradeDetail: 0,
            isLoadingPrice: false,
            priceObject: {},
            code: this.props.data.symbol || '',
            idForm: Util.getRandomKey(),
            oldOrd: Util.cloneFn(this.props.data),
            timeout: null,
            note: '',
            cashAvailable: 0,
            exchange: '',
            isConnected: true,
            requestID: null,
            confirmTextButton: '',
            isChange: false,
            error: '',
            objRegister: {},
            commodityObj: {},
            isCallOrderHistory: true,
            perf: new Perf(performanceEnum.show_form_modify_order),
            feeObj: {},
            orderObj: {},
            firstAppear: true,
            channelLoadingOrder: OrderStreamingBusiness.getChannelLoadingOrder(),
            channelPriceOrder: OrderStreamingBusiness.getChannelPriceOrder()
        };
        this.state = {
            volume: this.props.data.volume || 0,
            stopPrice:
                roundFloat(this.props.data.stop_price, PRICE_DECIMAL.PRICE) ||
                0,
            limitPrice:
                roundFloat(this.props.data.limit_price, PRICE_DECIMAL.PRICE) ||
                0,
            isRefresh: false,
            isUpdateLastOrder: false,
            excuting: false,
            tradingHalt: false,
            isLoadingPrice: true
        };
    }

    bindAllFunc() {
        this.onRefresh = this.onRefresh.bind(this);
        this.loadDataFromApi = this.loadDataFromApi.bind(this);
        this.formatBidPrice = this.formatBidPrice.bind(this);
        this.formatAskPrice = this.formatAskPrice.bind(this);
        this.updateAskPriceTrend = this.updateAskPriceTrend.bind(this);
        this.updateBidPriceTrend = this.updateBidPriceTrend.bind(this);
        this.isAskPriceChange = this.isAskPriceChange.bind(this);
        this.isBidPriceChange = this.isBidPriceChange.bind(this);
        this.isTradePriceChange = this.isTradePriceChange.bind(this);
        this.updateTrend = this.updateTrend.bind(this);
        this.formatTradePrice = this.formatTradePrice.bind(this);
        this.pubDepthData = this.pubDepthData.bind(this);
        this.pubCosData = this.pubCosData.bind(this);
        this.getReloadFuncLv2 = this.getReloadFuncLv2.bind(this);
        this.getReloadFuncCos = this.getReloadFuncCos.bind(this);
        this.getCashAvailable = this.getCashAvailable.bind(this);
        this.filterCashBySymbolClass = this.filterCashBySymbolClass.bind(this);
        this.changedValue = this.changedValue.bind(this);
        this.modifySuccess = this.modifySuccess.bind(this);
        this.clickPriceRefresh = this.clickPriceRefresh.bind(this);
        this.updateFeeAfterCheckRequestID = this.updateFeeAfterCheckRequestID.bind(
            this
        );
        this.getTradingMarket = this.getTradingMarket.bind(this);
        this.setExchange = this.setExchange.bind(this);
        this.renderSide = this.renderSide.bind(this);
        this.renderCompany = this.renderCompany.bind(this);
        this.renderButtonModify = this.renderButtonModify.bind(this);
        this.renderDifferentNote = this.renderDifferentNote.bind(this);
        this.showDifferentNoteModal = this.showDifferentNoteModal.bind(this);
        this.renderCashAvailable = this.renderCashAvailable.bind(this);
        this.startLoading = this.startLoading.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
        this.loadFormData = this.loadFormData.bind(this);
    }

    getCashAvailable(isRender) {
        try {
            if (!this.dic.code) return;

            const url = api.getNewTotalPortfolio(dataStorage.accountId);
            api.requestData(url, true).then((data) => {
                this.isFirst = true;
                if (data) {
                    this.dic.cashAvailable = this.filterCashBySymbolClass(data);
                    this.setDicPositions(data, isRender);
                    this.setState();
                } else {
                    logDevice('error', `ORDER - GET CASH AVAILABLE ERROR`);
                }
            });
        } catch (error) {
            logDevice('info', `ORDER - GET CASH AVAILABLE EXCEPTION: ${error}`);
        }
    }

    setDicPositions(data, forceUpdate) {
        const positions = data.positions || [];
        const profitVal = data.profitVal || {};
        this.dic.positions = {};
        for (let index = 0; index < positions.length; index++) {
            const element = positions[index];
            if (element && element.symbol) {
                this.dic.positions[element.symbol] = {
                    volume: element.volume ? element.volume : 0,
                    netPosition:
                        element.volume && element.average_price
                            ? `${formatNumber(
                                element.volume,
                                PRICE_DECIMAL.VOLUME
                            )} @ ${Business.displayMoney(
                                element.average_price,
                                PRICE_DECIMAL.PRICE
                            )}`
                            : '--',
                    profitLoss: profitVal[element.symbol]
                        ? Business.displayMoney(
                            profitVal[element.symbol],
                            PRICE_DECIMAL.VALUE
                        )
                        : '--'
                };
            }
        }
    }

    pubDepthData(depthData = {}) {
        const ask = Util.getValueObject(depthData.ask);
        const bid = Util.getValueObject(depthData.bid);
        const channel = StreamingBusiness.getChannelDepthAOI();
        Emitter.emit(channel, {
            ask,
            bid
        });
    }

    pubCosData(tradesData = {}) {
        const data = Util.getValueObject(tradesData);
        const channel = StreamingBusiness.getChannelCosAOI();
        Emitter.emit(channel, [{ data }]);
    }

    getTradingMarket(orderDetail) {
        const tradingMarket = orderDetail.trading_market;
        let exchange = tradingMarket;
        if (tradingMarket && tradingMarket === 'SAXO_BANK') {
            exchange = orderDetail.exchange;
        }
        return exchange;
    }

    setExchange() {
        const displayExchange = Business.getDisplayExchange({
            exchange: this.props.data.exchange,
            symbol: this.props.data.code
        });
        this.dic.exchange = Business.getExchangeName(
            this.getTradingMarket(this.props.data),
            displayExchange
        );
    }

    modifySuccess() {
        const updateData = {
            limit_price: this.dic.orderObj.limit_price,
            stop_price: this.dic.orderObj.stop_price,
            volume: this.dic.orderObj.volume
        };
        const data = { ...this.props.data, ...updateData };
        this.props.update && this.props.update({ data });
        func.setCurrentScreenId(ScreenId.ORDERS);
        this.refHeaderAnim &&
            this.refHeaderAnim.fadeOut(500).then(() => {
                this.props.dismissAllModals && this.props.dismissAllModals();
            });
    }

    showConfirmScreen() {
        const screen = Enum.SCREEN.CONFIRM_MODIFY_ORDER;
        const accountInfo = dataStorage.currentAccount || {};
        const subtitle = `${accountInfo.account_name || ''} (${accountInfo.account_id || ''
            })`;
        console.log(this.dic.orderObj);
        // Neu no co filled_price va filled_quantity thi truyen len
        let reqObj = {
            broker_order_id: this.dic.oldOrd.broker_order_id,
            note: this.dic.note,
            volume: Util.getNullable(this.dic.orderObj.volume),
            limit_price: Util.getNullable(this.dic.orderObj.limit_price),
            stop_price: Util.getNullable(this.dic.orderObj.stop_price)
        };
        this.props.navigator.showModal({
            screen,
            overrideBackPress: true,
            title: I18n.t('confirmOrder'),
            subtitle,
            passProps: {
                companyName: this.props.companyName,
                actor: func.getUserLoginId(),
                reqObj,
                oldOrdObj: this.dic.oldOrd,
                symbolObj: this.dic.symbolObject,
                successCb: this.modifySuccess
            },
            animationType: 'none',
            backButtonTitle: ' ',
            navigatorButtons: {
                leftButtons: [
                    {
                        id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
                        icon: Util.getValByPlatform(
                            iconsMap[ICON_NAME.ARROW_BACK.IOS],
                            iconsMap[ICON_NAME.ARROW_BACK.ANDROID]
                        )
                    }
                ]
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                modalPresentationStyle: 'overCurrentContext'
            }
        });
    }

    filterCashBySymbolClass(data = {}) {
        const symbolClass = Business.getClassBySymbol(this.dic.code);
        const symbolCurrency = Business.getCurency(this.dic.code);
        if (symbolClass === SYMBOL_CLASS.FUTURE) {
            // Future -> show "Initial Margin Available to Trade"
            return data.available_balance_au;
        } else if (
            symbolClass === SYMBOL_CLASS.EQUITY &&
            symbolCurrency === CURRENCY.USD
        ) {
            // Equity Mỹ -> show "Cash Available to Trade (not include your settlement in T+2 & Others)"
            return data.available_balance_us;
        }
        return data.available_balance_au;
    }

    getCommodityInfoPromise = () => {
        return new Promise(async (resolve) => {
            try {
                let commodityObj = await getCommodityInfo(
                    this.props.data.symbol
                );
                this.dic.commodityObj = commodityObj || {};
                resolve(commodityObj);
            } catch (error) {
                console.log(error);
                resolve();
            }
        });
    };

    getFeesPromise = async (requestID) => {
        return new Promise((resolve) => {
            console.log(
                'DCM renderContentDetail getFeesPromise',
                this.dic.orderObj.volume
            );
            api.postData(api.getUrlFee(), { data: this.dic.orderObj })
                .then((data) => {
                    const feeObj = data || {};
                    console.log(
                        'DCM renderContentDetail getFeesPromise RES',
                        feeObj
                    );
                    const checkRequestIDFee = this.updateFeeAfterCheckRequestID(
                        requestID
                    );
                    if (checkRequestIDFee) {
                        this.dic.feeObj = feeObj;
                        resolve(feeObj);
                    }
                })
                .catch((e) => {
                    console.log(e);
                    resolve();
                });
        });
    };

    clickPriceRefresh({ isRefresh = true }) {
        if (Controller.isPriceStreaming()) return;
        this.loadDataFromApi(isRefresh);
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'modify_order_refresh':
                    this.clickPriceRefresh();
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    this.dic.isCallOrderHistory = true;
                    setCurrentScreen(analyticsEnum.modifyOrder);
                    this.dic.perf &&
                        this.dic.perf.incrementCounter(
                            performanceEnum.show_form_modify_order
                        );
                    if (this.props.setChangeTypeFn) {
                        this.props.setChangeTypeFn(this.openMenu);
                    }
                    if (this.dic.firstAppear) {
                        this.dic.firstAppear = false;
                        this.loadFormData();
                    }
                    break;
                case 'didAppear':
                    func.setCurrentScreenId(ScreenId.MODIFY_ORDER);
                    checkTradingHalt(this.props.data.symbol).then((data) => {
                        const tradingHalt = data;
                        this.setState({ tradingHalt });
                    });
                    const channel = StreamingBusiness.getChannelHalt(
                        this.props.data.symbol
                    );
                    Emitter.addListener(
                        channel,
                        this.id,
                        this.updateHalt.bind(this)
                    );
                    this.getCashAvailable();
                    break;
                case 'willDisappear':
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
        checkTradingHalt(this.props.data.symbol)
            .then((snap) => {
                const tradingHalt = snap ? snap.trading_halt : false;
                this.setState({ tradingHalt }, () => {
                    logDevice(
                        'info',
                        `Updated Halt of ${this.props.data.symbol}: ${tradingHalt}`
                    );
                });
            })
            .catch((err) => {
                logDevice('info', `MODIFY ORDER TRADING HALT ERROR: ${err}`);
                console.log(err);
            });
    }

    isTradePriceChange(oldData, newData) {
        return (
            (oldData === undefined ||
                oldData === null ||
                oldData.trade_price === undefined ||
                oldData.trade_price === null ||
                oldData.trade_price !== newData.trade_price) &&
            newData.trade_price !== undefined &&
            newData.trade_price !== null
        );
    }

    updateTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(
            newData.trade_price,
            oldData.trade_price
        );
    }

    formatTradePrice(value) {
        return formatNumberNew2(value.trade_price, PRICE_DECIMAL.PRICE);
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
                isLoading={this.state.isLoadingPrice}
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
                isLoading={this.state.isLoadingPrice}
            />
        );
    }

    isBidPriceChange(oldData, newData) {
        return (
            (oldData === undefined ||
                oldData === null ||
                oldData.bid_price === undefined ||
                oldData.bid_price === null ||
                oldData.bid_price !== newData.bid_price) &&
            newData.bid_price !== undefined &&
            newData.bid_price !== null
        );
    }

    isAskPriceChange(oldData, newData) {
        return (
            (oldData === undefined ||
                oldData === null ||
                oldData.ask_price === undefined ||
                oldData.ask_price === null ||
                oldData.ask_price !== newData.ask_price) &&
            newData.ask_price !== undefined &&
            newData.ask_price !== null
        );
    }

    updateBidPriceTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(
            newData.bid_price,
            oldData.bid_price
        );
    }

    updateAskPriceTrend(oldData = {}, newData = {}) {
        return Util.getTrendCompareWithOld(
            newData.ask_price,
            oldData.ask_price
        );
    }

    formatBidPrice(value) {
        return formatNumberNew2(value.bid_price, PRICE_DECIMAL.PRICE);
    }

    formatAskPrice(value) {
        return formatNumberNew2(value.ask_price, PRICE_DECIMAL.PRICE);
    }

    getThresholdScroll() {
        return this.dic.heightLastTradeDetail + 20;
    }

    renderLastTradeDetail() {
        return this.dic.code ? (
            <View onLayout={(e) => this.onLayout(e, 'heightLastTradeDetail')}>
                <PriceOrder
                    isLoading={this.state.isLoadingPrice}
                    priceObject={this.dic.priceObject}
                    channelLoadingOrder={this.dic.channelLoadingOrder}
                    channelPriceOrder={this.dic.channelPriceOrder}
                >
                    <View
                        style={{
                            width,
                            borderBottomRightRadius:
                                CommonStyle.borderBottomRightRadius,
                            padding: 16,
                            backgroundColor: CommonStyle.backgroundColor,
                            overflow: 'hidden'
                        }}
                    >
                        {this.renderSymbolName()}
                        {this.renderCompanyName()}
                    </View>
                </PriceOrder>
            </View>
        ) : (
            <View />
        );
    }

    subNewSymbol(symbol) {
        return new Promise((resolve) => {
            const exchange = func.getExchangeSymbol(symbol);
            const channel = StreamingBusiness.getChannelLv1(exchange, symbol);

            Emitter.addListener(channel, this.id, (data) => {
                this.changedValue(data);
            });
            AllMarket.setIsAIO(true);
            AllMarket.sub([{ symbol, exchange }], this.dic.idForm, resolve);
        });
    }

    unSubSymbol(symbol) {
        const exchange = func.getExchangeSymbol(symbol);
        AllMarket.unsub([{ symbol, exchange }], this.dic.idForm);
    }

    startLoading(isRefresh = false) {
        this.setState({ isLoadingPrice: true, isRefresh });
        Emitter.emit(this.dic.channelLoadingOrder, true);
    }

    stopLoading() {
        this.dic.refUpdateTime &&
            this.dic.refUpdateTime.setTimeUpdate(new Date().getTime());
        this.setState({ isLoadingPrice: false, isRefresh: false });
        Emitter.emit(this.dic.channelLoadingOrder, false);
    }

    async componentDidMount() {
        try {
            this._scrollValue.addListener(({ value }) => {
                // Keyboard.dismiss();
                if (Platform.OS === 'android') return;
                if (Controller.isPriceStreaming()) return;
                if (value < -100) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        this.C2R = this.loadDataFromApi;
                    }, 100);
                }
            });
        } catch (error) {
            logAndReport(
                'componentDidMount modifyOrder exception',
                error,
                'componentDidMount modifyOrder'
            );
        }
        BackHandler.addEventListener(
            'hardwareBackPress',
            this.handleBackButton
        );
        this.loadData();

        if (Controller.isPriceStreaming()) {
            this.startLoading();
            const symbol = this.props.data.symbol;
            const exchange = func.getExchangeSymbol(symbol);
            await this.unSubSymbol(symbol);
            this.subNewSymbol(symbol).then(() => {
                UserPriceSource.loadDataAOIPrice([{ symbol, exchange }]).then(
                    (data) => {
                        const allData = data[0] || {};
                        const quoteData = allData.quote;
                        const depthData = allData.depth;
                        const tradesData = allData.trades;
                        this.storeDepthData(depthData);
                        this.storeCosData(tradesData);
                        this.pubDepthData(depthData);
                        this.pubCosData(tradesData);
                        this.dic.priceObject = quoteData || {};
                        this.stopLoading();
                        const isMerge = false;
                        this.changedValue(this.dic.priceObject, isMerge);
                    }
                );
            });
        }
    }

    handleBackButton = () => {
        if (config.environment === ENVIRONMENT.IRESS_DEV2) {
            return false;
        } else {
            return true
        }
    };

    componentWillReceiveProps(nextProps) {
        if (
            nextProps &&
            nextProps.isConnected !== null &&
            nextProps.isConnected !== undefined &&
            this.dic.isConnected !== nextProps.isConnected
        ) {
            this.dic.isConnected = nextProps.isConnected;
            if (nextProps.isConnected && this.dic.isConnected) {
                this.dic.requestID = Uuid.v4();
                this.getFees(
                    this.state.volume,
                    this.state.limitPrice,
                    this.state.stopPrice,
                    this.dic.requestID
                );
            }
        }
    }

    changedValue(data, isMerge = true) {
        try {
            // Update change percent on title
            this.dic.priceObject = data;
            Emitter.emit(this.dic.channelPriceOrder, {
                data: this.dic.priceObject,
                isMerge
            }); // Realtime -> pub price
            this.props.data.code &&
                this.dic.isCallOrderHistory &&
                this.loadLastOrderRequest(
                    this.props.data.code,
                    this.state.isUpdateLastOrder
                );
        } catch (error) {
            logAndReport(
                'changedValue modifyOrder exception',
                error,
                'changedValue modifyOrder'
            );
            logDevice(
                'info',
                `ModifyOrder - changedValue - ${data}: ${data ? JSON.stringify(data) : ''
                }`
            );
        }
    }

    unregisterPrice() {
        unregister(this.dic.objRegister);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackButton
        );
        this.unregisterPrice();
        if (Controller.isPriceStreaming()) {
            this.unSubSymbol(this.props.data.symbol);
        }
    }

    storeDepthData = this.storeDepthData.bind(this);
    storeDepthData(depthData = {}) {
        this.dic.depthData = depthData;
    }

    storeCosData = this.storeCosData.bind(this);
    storeCosData(tradesData = {}) {
        this.dic.tradesData = tradesData;
    }

    loadDataFromApi(isRefresh) {
        if (Controller.isPriceStreaming()) return;
        this.startLoading(isRefresh);
        // this.reloadFuncLv2 && this.reloadFuncLv2();
        // this.reloadFuncCos && this.reloadFuncCos();
        try {
            this.dic.perf = new Perf(
                performanceEnum.load_data_from_api_modify_order
            );
            this.dic.perf && this.dic.perf.start();
            const stringQuery = this.props.data.symbol;
            const exchange = func.getExchangeSymbol(this.props.data.symbol);
            const symbol = this.props.data.symbol;
            if (func.getUserPriceSource() === userType.ClickToRefresh) {
                UserPriceSource.loadDataAOIPrice([{ symbol, exchange }]).then(
                    (data) => {
                        const allData = data[0] || {};
                        const quoteData = allData.quote;
                        const depthData = allData.depth;
                        const tradesData = allData.trades;
                        this.storeDepthData(depthData);
                        this.storeCosData(tradesData);
                        this.pubDepthData(depthData);
                        this.pubCosData(tradesData);
                        this.dic.priceObject = quoteData || {};
                        this.stopLoading();
                        const isMerge = false;
                        this.changedValue(this.dic.priceObject, isMerge);
                    }
                );
            }
        } catch (error) {
            logAndReport(
                'loadDataFromApi order exception',
                error,
                'loadDataFromApi order'
            );
            logDevice('info', `NewOrder - loadDataFromApi error: ${error}`);
        }
    }

    loadData() {
        this.clickPriceRefresh({ isRefresh: false });
    }

    loadFormData() {
        try {
            const { data } = this.props;
            this.dic.requestID = Uuid.v4();
            this.getFees(
                data.volume,
                data.limit_price,
                data.stop_price,
                this.dic.requestID
            );
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

    changeOrderVolume = this.changeOrderVolume.bind(this);
    changeOrderVolume(volume) {
        this.setState({ volume });
    }

    changeLimitPrice = this.changeLimitPrice.bind(this);
    changeLimitPrice(limitPrice) {
        this.setState({ limitPrice });
    }

    changeStopPrice = this.changeStopPrice.bind(this);
    changeStopPrice(stopPrice) {
        this.setState({ stopPrice });
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
            const orderType = this.getOrderType(this.props.originOrderType);
            switch (type) {
                case 'volume':
                    /* eslint-disable no-useless-escape */
                    if (value.match(/^\d+(\.|\,\d+)?$/)) {
                        // eslint-disable-line no-useless-escape
                        value = parseFloat(value);
                        this.dic.orderObj.volume = value;
                        this.changeOrderVolume(value);
                        this.checkError(
                            value,
                            this.state.limitPrice,
                            this.state.stopPrice,
                            orderType
                        );
                        if (this.dic.error === '') {
                            this.dic.timeout = setTimeout(() => {
                                this.dic.requestID = Uuid.v4();
                                this.getFees(
                                    value,
                                    this.state.limitPrice,
                                    this.state.stopPrice,
                                    this.dic.requestID
                                );
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
                        value = value.slice(0, suf[0].length + 1 + 4);
                    }
                    if (value.match(regex)) {
                        if (type === 'limit') {
                            dataStorage.formatLimitPrice = true;
                            this.checkError(
                                this.state.volume,
                                value,
                                this.state.stopPrice,
                                orderType
                            );
                            if (this.dic.error === '') {
                                this.dic.timeout = setTimeout(() => {
                                    this.dic.requestID = Uuid.v4();
                                    this.getFees(
                                        this.state.volume,
                                        value,
                                        this.state.stopPrice,
                                        this.dic.requestID
                                    );
                                }, TIME_GET_FEES);
                            }
                            this.changeLimitPrice(value.toString());
                        } else if (type === 'stop') {
                            dataStorage.formatStopPrice = true;
                            this.checkError(
                                this.state.volume,
                                this.state.limitPrice,
                                value,
                                orderType
                            );
                            if (this.dic.error === '') {
                                this.dic.timeout = setTimeout(() => {
                                    this.dic.requestID = Uuid.v4();
                                    this.getFees(
                                        this.state.volume,
                                        this.state.limitPrice,
                                        value,
                                        this.dic.requestID
                                    );
                                }, TIME_GET_FEES);
                            }
                            this.changeStopPrice(value.toString());
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
                `ModifyOrder - onChangeText ${type} - ${value}: ${error ? JSON.stringify(error) : ''
                }`
            );
        }
    }

    updateFeeAfterCheckRequestID(requestIDFromApi) {
        if (requestIDFromApi && this.dic.requestID === requestIDFromApi) {
            return true;
        }
        return false;
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
                    limit_price: Util.getNullableReal(
                        convertFormatToNumber(limitPrice)
                    ),
                    stop_price: Util.getNullableReal(
                        convertFormatToNumber(stopPrice)
                    )
                };
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
                        limit_price: Util.getNullableReal(
                            convertFormatToNumber(limitPrice)
                        ),
                        stop_price: Util.getNullableReal(
                            convertFormatToNumber(stopPrice)
                        )
                    };
                }
                this.dic.orderObj = orderObj;
                Promise.all([
                    this.getFeesPromise(requestID),
                    this.getCommodityInfoPromise()
                ]).then((data) => {
                    /*
                        1. Khi get được fees thì update this.dic.feeObj -> ko pass shouldComponentUpdate -> render voi fee cua volume truoc do
                        2. forceUpdate with this.dic.feeObj
                    */
                    this.forceUpdate();
                });
            }
        } catch (error) {
            logAndReport(
                'get fees order exception',
                error,
                'confirmOrder order'
            );
            logDevice(
                'info',
                `ModifyOrder - GetFees: ${this.dic.orderObj ? JSON.stringify(this.dic.orderObj) : ''
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

    renderLimitPrice() {
        if (!this.props.data.limit_price) return <View />;
        return (
            <View style={{ width: '100%', paddingTop: 28 }}>
                <PickerCustom
                    name="Limit Price"
                    editable={true}
                    disabled={this.state.excuting}
                    onChangeText={this.onChangeText.bind(this, 'limit')}
                    floatingLabel={I18n.t('limitPrice')}
                    selectedValue={this.state.limitPrice}
                />
            </View>
        );
    }

    renderStopPrice() {
        if (!this.props.data.stop_price) return <View />;
        return (
            <View style={{ width: '100%', marginTop: 28 }}>
                <PickerCustom
                    name="Stop Price"
                    editable={true}
                    disabled={this.state.excuting}
                    onChangeText={this.onChangeText.bind(this, 'stop')}
                    floatingLabel={I18n.t('triggerPrice')}
                    selectedValue={this.state.stopPrice}
                />
            </View>
        );
    }

    getNoteModify(orderType, changeValue, isBuy) {
        const side = isBuy ? 'BUY' : 'SELL';
        const modifyAction = changeValue < 0 ? 'ADD' : 'REDUCE';
        const volume = this.props.data.volume;
        const requestQuantity = parseInt(this.state.volume);
        const note = {
            order_type: orderType,
            order_state: NOTE_STATE.USER_AMEND,
            modify_action: modifyAction,
            data: {
                side,
                volume_old: volume,
                volume: requestQuantity,
                stop_price: parseFloat(this.state.stopPrice), // new stop_price
                limit_price: parseFloat(this.state.limitPrice), // new limit_price
                stop_price_old: this.props.data.stop_price, // old stop_price
                limit_price_old: this.props.data.limit_price // old limit_price
            }
        };
        return note;
    }

    setOrderContent() {
        try {
            const type = (this.props.originOrderType + '').toUpperCase();
            if (this.state.volume === 0) return;
            const displayName = this.props.displayName;
            const side = this.props.data.is_buy
                ? I18n.t('buyUpper')
                : I18n.t('sellUpper');
            let changeText = 0;
            const changeValue = this.props.data.volume - this.state.volume;
            if (changeValue < 0) {
                changeText = `ADD ` + formatNumber(Math.abs(changeValue));
            } else if (changeValue > 0) {
                changeText = `REDUCE ` + formatNumber(Math.abs(changeValue));
            } else {
                this.dic.confirmTextButton = `${I18n.t(
                    'placeUpper'
                )} ${side} ${I18n.t('order_txtUpper')}`;
            }
            const note = this.getNoteModify(
                type,
                changeValue,
                this.props.data.is_buy
            );
            this.dic.note = JSON.stringify(note);
            switch (type) {
                case orderTypeString.MARKET:
                case orderType.MARKET_ORDER:
                    if (changeValue !== 0) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t(
                            'modifyUpper'
                        )} ${I18n.t(
                            'toLower'
                        )} ${side} / ${changeText} ${I18n.t(
                            'of'
                        )} ${displayName} ${I18n.t('at')} ${I18n.t(
                            'marketPrice'
                        )}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.MARKETTOLIMIT:
                case orderType.MARKETTOLIMIT_ORDER:
                    if (
                        changeValue !== 0 ||
                        (this.props.data.order_type === orderType.LIMIT &&
                            parseFloat(this.state.limitPrice) !==
                            parseFloat(this.props.data.limit_price))
                    ) {
                        this.dic.isChange = true;
                        if (this.props.data.filled_quantity) {
                            this.dic.confirmTextButton = `${I18n.t(
                                'modifyUpper'
                            )} ${side} / ${changeText} @ LMT ${formatNumberNew2(
                                this.state.limitPrice,
                                PRICE_DECIMAL.PRICE
                            )}`;
                        } else {
                            this.dic.confirmTextButton = `${I18n.t(
                                'modifyUpper'
                            )} ${I18n.t(
                                'toLower'
                            )} ${side} / ${changeText} ${I18n.t(
                                'of'
                            )} ${displayName} ${I18n.t('at')} ${I18n.t(
                                'marketPrice'
                            )}`;
                        }
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.LIMIT:
                case orderType.LIMIT_ORDER:
                case orderTypeString.LIMIT:
                    if (
                        changeValue !== 0 ||
                        parseFloat(this.state.limitPrice) !==
                        parseFloat(this.props.data.limit_price)
                    ) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t(
                            'modifyUpper'
                        )} ${side} / ${changeText} @ LMT ${formatNumberNew2(
                            this.state.limitPrice,
                            PRICE_DECIMAL.PRICE
                        )}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.STOP_LIMIT:
                case orderType.STOP_LIMIT_ORDER:
                case orderTypeString.STOP_LIMIT:
                    if (
                        changeValue !== 0 ||
                        parseFloat(this.state.stopPrice) !==
                        parseFloat(this.props.data.stop_price) ||
                        parseFloat(this.state.limitPrice) !==
                        parseFloat(this.props.data.limit_price)
                    ) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t(
                            'modifyUpper'
                        )} ${side} / ${changeText} @ LMT ${formatNumberNew2(
                            this.state.limitPrice,
                            PRICE_DECIMAL.PRICE
                        )} / STP ${formatNumberNew2(
                            this.state.stopPrice,
                            PRICE_DECIMAL.PRICE
                        )}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.STOP:
                case orderType.STOP_ORDER:
                case orderTypeString.STOP_MARKET:
                    if (
                        changeValue !== 0 ||
                        parseFloat(this.state.stopPrice) !==
                        parseFloat(this.props.data.stop_price)
                    ) {
                        this.dic.isChange = true;
                        this.dic.confirmTextButton = `${I18n.t(
                            'modifyUpper'
                        )} ${side} / ${changeText} @ STP ${formatNumberNew2(
                            this.state.stopPrice,
                            PRICE_DECIMAL.PRICE
                        )}`;
                    } else {
                        this.dic.isChange = false;
                    }
                    break;
                case orderType.STOPLOSS:
                case orderType.STOPLOSS_ORDER:
                case orderTypeString.STOPLOSS:
                    if (
                        changeValue !== 0 ||
                        parseFloat(this.state.stopPrice) !==
                        parseFloat(this.props.data.stop_price)
                    ) {
                        this.dic.isChange = true;
                        if (this.props.data.filled_quantity) {
                            this.dic.confirmTextButton = `${I18n.t(
                                'modifyUpper'
                            )} ${side} / ${changeText} @ STP ${formatNumberNew2(
                                this.state.stopPrice,
                                PRICE_DECIMAL.PRICE
                            )}`;
                        } else {
                            this.dic.confirmTextButton = `${I18n.t(
                                'modifyUpper'
                            )} ${side} / ${changeText} @ STP ${formatNumberNew2(
                                this.state.stopPrice,
                                PRICE_DECIMAL.PRICE
                            )}`;
                        }
                    } else {
                        this.dic.isChange = false;
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
                `NewOrder - renderOrderContent ${type}: ${error ? JSON.stringify(error) : ''
                }`
            );
        }
    }

    confirmOrder() {
        try {
            if (this.props.isConnected) {
                try {
                    logDevice(
                        'info',
                        `ModifyOrder - Object objOrder: ${this.dic.orderObj
                            ? JSON.stringify(this.dic.orderObj)
                            : ''
                        }`
                    );
                    // Apply vetting amend order
                    const orderID = this.props.data.broker_order_id;
                    const vettingObj = {
                        broker_order_id: `${orderID}`,
                        note: this.dic.note,
                        volume: Util.getNullable(this.dic.orderObj.volume),
                        limit_price: Util.getNullable(
                            this.dic.orderObj.limit_price
                        ),
                        stop_price: Util.getNullable(
                            this.dic.orderObj.stop_price
                        )
                    };
                    const byPassVetting = config.byPassVetting;
                    Business.checkVettingOrder(
                        Enum.ORDER_ACTION.AMEND,
                        vettingObj,
                        byPassVetting,
                        orderID
                    ).then((res) => {
                        const status = res.status;
                        const errorCode = res.errorCode || '';
                        switch (status) {
                            case Enum.RESPONSE_STATUS.PASS:
                                this.dic.error = '';
                                this.headerRef &&
                                    this.headerRef.hideError &&
                                    this.headerRef.hideError();
                                return this.setState(
                                    {
                                        excuting: false
                                    },
                                    () => {
                                        this.sendOrderRequest(
                                            this.dic.orderObj
                                        );
                                    }
                                );
                            case Enum.RESPONSE_STATUS.FAIL:
                                this.dic.error = errorCode;
                                return this.setState(
                                    { excuting: false },
                                    () => {
                                        this.setAnimationError();
                                    }
                                );
                            default:
                                console.log(
                                    'CHECK VETTING AMEND ORDER EXCEPTION:',
                                    errorCode
                                );
                                return this.setState(
                                    { excuting: false },
                                    () => {
                                        if (
                                            errorCode ===
                                            Enum.ERROR_CODE.TIMEOUT
                                        ) {
                                            this.dic.error = I18n.t(
                                                'timeoutOrder'
                                            );
                                            this.setAnimationError();
                                        }
                                    }
                                );
                        }
                    });
                } catch (error) {
                    logAndReport(
                        'confirmOrder modifyOrder exception',
                        error,
                        'confirmOrder modifyOrder'
                    );
                }
            }
        } catch (error) {
            logAndReport(
                'confirmOrder modifyOrder exception',
                error,
                'confirmOrder modifyOrder'
            );
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
            objOrderHistory.exchange = (
                this.props.data.trading_market + ''
            ).replace('[Demo]', '');
            objOrderHistory.limit_price = objOrder.limit_price || 0;
            objOrderHistory.stop_price = objOrder.stop_price || 0;
            objOrderHistory.trail_amount = objOrder.trail_amount || 0;
            objOrderHistory.trail_percent = objOrder.trail_percent || 0;

            this.saveLastOrderRequest(
                objOrderHistory,
                this.state.isUpdateLastOrder
            );
            this.showConfirmScreen();
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

    setAnimationError() {
        this.headerRef &&
            this.headerRef.showError &&
            this.headerRef.showError({ error: this.dic.error });
    }

    checkError(volume, limitPrice, stopPrice, ordertype) {
        try {
            this.dic.error = '';
            const filledMin = !this.props.data.filled_quantity
                ? 0
                : parseInt(this.props.data.filled_quantity) + 1;
            if (parseFloat(volume) === 0) {
                this.dic.error = I18n.t('volumeRequired');
            } else {
                if (parseFloat(volume) < filledMin) {
                    this.dic.error = I18n.t('amendedVolumeWithPartialFill');
                } else {
                    ordertype = (ordertype + '').toUpperCase();
                    switch (ordertype) {
                        case orderTypeString.STOPLOSS:
                        case orderType.STOPLOSS:
                        case orderType.STOPLOSS_ORDER:
                            if (!stopPrice || stopPrice === '0') {
                                this.dic.error = I18n.t('stopPriceValid');
                                break;
                            }
                            break;
                        case orderTypeString.STOP_MARKET:
                        case orderType.STOP:
                        case orderType.STOP_ORDER:
                            if (!stopPrice || stopPrice === '0') {
                                this.dic.error = I18n.t('stopPriceValid');
                                break;
                            }
                            if (this.props.data.is_buy) {
                                if (
                                    parseFloat(stopPrice) <
                                    parseFloat(this.state.ask_price)
                                ) {
                                    this.dic.error = I18n.t(
                                        'stopPriceLessAskPrice'
                                    );
                                    break;
                                }
                            } else {
                                if (
                                    parseFloat(stopPrice) >
                                    parseFloat(this.state.bid_price)
                                ) {
                                    this.dic.error = I18n.t(
                                        'stopPriceGreaterBidPrice'
                                    );
                                    break;
                                }
                            }
                            break;
                        case orderTypeString.LIMIT:
                        case orderType.LIMIT:
                        case orderType.LIMIT_ORDER:
                            if (!limitPrice || limitPrice === '0') {
                                this.dic.error = I18n.t('limitPriceValid');
                                break;
                            }
                            break;
                        case orderType.MARKETTOLIMIT:
                        case orderTypeString.MARKETTOLIMIT:
                            if (
                                this.props.data.filled_quantity &&
                                parseFloat(limitPrice) === 0
                            ) {
                                this.dic.error = I18n.t('limitPriceValid');
                                break;
                            }
                            break;
                        case orderTypeString.STOP_LIMIT:
                        case orderType.STOP_LIMIT:
                        case orderType.STOP_LIMIT_ORDER:
                            if (!stopPrice || stopPrice === '0') {
                                this.dic.error = I18n.t('stopPriceValid');
                                break;
                            }
                            if (!stopPrice || limitPrice === '0') {
                                this.dic.error = I18n.t('limitPriceValid');
                                break;
                            }
                            break;
                    }
                }
            }
            if (this.dic.error) {
                this.setAnimationError();
            } else {
                this.headerRef &&
                    this.headerRef.hideError &&
                    this.headerRef.hideError();
            }
            logDevice('info', `ModifyOrder - This.error: ${this.dic.error}`);
        } catch (error) {
            logAndReport(
                'onShowConfirmModal modifyOrder exception',
                error,
                'onShowConfirmModal modifyOrder'
            );
            logDevice(
                'info',
                `ModifyOrder - onShowConfirmModal: ${error ? JSON.stringify(error) : ''
                }`
            );
        }
    }

    onShowConfirmModal() {
        try {
            this.setState({ excuting: true });

            Keyboard.dismiss();

            const orderType = this.getOrderType(this.props.originOrderType);
            this.checkError(
                this.state.volume,
                this.state.limitPrice,
                this.state.stopPrice,
                orderType
            );
            if (this.dic.error === '') {
                this.confirmOrder();
            }
        } catch (error) {
            logAndReport(
                'onShowConfirmModal modifyOrder exception',
                error,
                'onShowConfirmModal modifyOrder'
            );
            logDevice(
                'info',
                `ModifyOrder - onShowConfirmModal: ${error ? JSON.stringify(error) : ''
                }`
            );
        }
    }

    getOrderType(key) {
        try {
            if (!key) return key;
            key = (key + '').toUpperCase();
            const newKey = (key + '').replace('_ORDER', '');
            if (orderTypeString[newKey] === orderTypeString.STOPLIMIT) {
                return orderTypeString.STOPLOSS;
            }
            const stringReturn = orderTypeString[newKey];
            if (!stringReturn) return '--';
            return stringReturn;
        } catch (error) {
            logAndReport(
                'getOrderType modifyOrder exception',
                error,
                'getOrderType modifyOrder'
            );
            logDevice(
                'info',
                `ModifyOrder - getOrderType - ${key}: ${key ? JSON.stringify(key) : ''
                }`
            );
        }
    }

    getOrderTypeString(key) {
        try {
            key = (key + '').toUpperCase();
            const newKey = (key + '').replace('_ORDER', '');
            if (orderTypeString[newKey] === orderTypeString.STOPLIMIT) {
                return Translate.getInvertTranslate(
                    orderTypeString.STOPLOSS.toUpperCase()
                );
            }
            const stringReturn = orderTypeString[newKey];
            if (!stringReturn) return '--';
            return Translate.getInvertTranslate(stringReturn.toUpperCase());
        } catch (error) {
            logAndReport(
                'getOrderType listcontent exception',
                error,
                'getOrderType listContent'
            );
        }
    }

    renderAtribute({ value, label, format }) {
        if (!value) return <View />;
        if (format && typeof format === 'function') {
            value = format(value);
        }
        return (
            <View
                style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 32
                }}
            >
                <Text
                    style={[
                        CommonStyle.textNewOrder,
                        { fontSize: CommonStyle.fontSizeS - 2 }
                    ]}
                >
                    {label}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[
                        CommonStyle.textMain,
                        {
                            fontSize: CommonStyle.fontSizeS - 2,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontColorButtonSwitch
                        }
                    ]}
                >
                    {value}
                </Text>
            </View>
        );
    }

    getReloadFuncLv2(funcReload) {
        this.reloadFuncLv2 = funcReload;
    }

    getReloadFuncCos(funcReload) {
        this.reloadFuncCos = funcReload;
    }

    async loadLastOrderRequest(code) {
        try {
            const key = `order_history_${dataStorage.accountId}_${code}`;
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
                        console.log(
                            `New Order AsyncStorage.mergeItem Error: ${error}`
                        );
                    }
                });
            } else {
                await AsyncStorage.setItem(key, objOrderString, (error) => {
                    if (error) {
                        console.log(
                            `New Order AsyncStorage.setItem Error: ${error}`
                        );
                    }
                });
            }
        } catch (error) {
            logAndReport(`Order - saveLastOrderRequest Error: ${error}`);
            logDevice('info', `Order - saveLastOrderRequest Error: ${error}`);
        }
    }

    getObjectOrderPlace() {
        const orderID = this.props.data.broker_order_id;
        const vettingObj = {
            broker_order_id: `${orderID}`,
            note: this.dic.note,
            volume: Util.getNullable(this.dic.orderObj.volume),
            limit_price: Util.getNullable(this.dic.orderObj.limit_price),
            stop_price: Util.getNullable(this.dic.orderObj.stop_price)
        };
        return vettingObj;
    }

    renderContentDetail() {
        console.log(
            'DCM renderContentDetail this.dic.feeObj',
            this.dic.orderObj.volume,
            this.dic.feeObj
        );
        return (
            <Summary
                symbolObject={this.dic.symbolObject}
                getObjectOrderPlace={() => this.getObjectOrderPlace()}
                getDisplayAccount={() => func.getDisplayAccount()}
                feeObj={this.dic.feeObj}
                classSelectedSymbol={Business.getClassBySymbol(this.dic.code)}
                combodityInfo={this.dic.commodityObj}
                positions={this.dic.positions}
                code={this.dic.code}
                channelLoading={this.dic.channelLoadingOrder}
                channelPrice={this.dic.channelPriceOrder}
                isLoading={this.state.isLoadingPrice}
            />
        );
    }

    renderQuantity() {
        return (
            <View style={{ width: '100%', paddingTop: 30 }}>
                <PickerCustom
                    testID={`newOrderVolume`}
                    name="Volume"
                    disabled={this.state.excuting}
                    editable={true}
                    isLoading={this.state.isLoadingPrice}
                    onChangeText={this.onChangeText.bind(this, 'volume')}
                    floatingLabel={I18n.t('quantity')}
                    selectedValue={formatNumber(this.state.volume)}
                />
            </View>
        );
    }

    renderSide() {
        return (
            <View
                style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 32
                }}
            >
                <Text
                    style={[
                        CommonStyle.textNewOrder,
                        { fontSize: CommonStyle.fontSizeS - 2 }
                    ]}
                >
                    {I18n.t('side_txt')}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[
                        CommonStyle.textMain,
                        {
                            fontSize: CommonStyle.fontSizeS - 2,
                            fontWeight: 'bold',
                            color: this.props.data.is_buy
                                ? CommonStyle.fontOceanGreen
                                : CommonStyle.btnSellModify
                        }
                    ]}
                >
                    {this.props.data.is_buy
                        ? I18n.t('buyUpper')
                        : I18n.t('sellUpper')}
                </Text>
            </View>
        );
    }

    onLayout(event, viewName) {
        const { x, y, width: w, height: h } = event.nativeEvent.layout;
        this.dic[viewName] = h;
    }

    renderCompany() {
        const companyName = dataStorage.symbolEquity[this.props.data.symbol]
            ? dataStorage.symbolEquity[this.props.data.symbol].company_name ||
            dataStorage.symbolEquity[this.props.data.symbol].company ||
            dataStorage.symbolEquity[this.props.data.symbol].security_name ||
            ''
            : '';
        return (
            <View
                style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    marginBottom: 30,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <Text
                    style={[
                        CommonStyle.textNewOrder,
                        { fontSize: CommonStyle.fontSizeS }
                    ]}
                >
                    {I18n.t('company')}
                </Text>
                <Text
                    style={[
                        CommonStyle.textSubDark,
                        {
                            fontSize: CommonStyle.font17,
                            textAlign: 'right',
                            maxWidth: '60%'
                        }
                    ]}
                >
                    {companyName.toUpperCase()}
                </Text>
            </View>
        );
    }

    renderCashAvailable() {
        const accountCurrency =
            (dataStorage.currentAccount &&
                dataStorage.currentAccount.currency) ||
            '';
        const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
        const symbolClass = Business.getClassBySymbol(this.dic.code);
        const symbolCurrency = Business.getCurency(this.dic.code);
        const cashAvailable = Business.displayMoney2(
            this.dic.cashAvailable,
            PRICE_DECIMAL.VALUE,
            objCurAcc.symbolCur
        );
        const currency =
            cashAvailable === '--'
                ? ''
                : dataStorage.currentAccount &&
                    dataStorage.currentAccount.currency
                    ? dataStorage.currentAccount.currency
                    : CURRENCY.AUD;

        let prefix = I18n.t('cashAvailableToTradeIs');
        if (symbolClass === SYMBOL_CLASS.FUTURE) {
            // Future -> show "Initial Margin Available to Trade"
            prefix = I18n.t('initialMarginAvailableToTrade');
        } else if (
            symbolClass === SYMBOL_CLASS.EQUITY &&
            symbolCurrency === CURRENCY.USD
        ) {
            // Equity Mỹ -> show "Cash Available to Trade (not include your settlement in T+2 & Others)"
            prefix = I18n.t('cashAvailableToTradeIs');
        }
        return `${prefix} ${cashAvailable} ${currency}`;
    }

    renderClearDataAndNote() {
        const symbolClass = Business.getClassBySymbol(this.dic.code);
        const symbolCurrency = Business.getCurency(this.dic.code);
        return (
            <View
                style={{
                    flexDirection: 'row',
                    width: '100%',
                    paddingHorizontal: 16,
                    marginBottom: 16,
                    justifyContent: 'space-between',
                    paddingVertical: 4
                }}
            >
                <TouchableOpacityOpt
                    onPress={() => this.loadFormData()}
                    style={{
                        height: 24,
                        justifyContent: 'flex-end'
                    }}
                >
                    <Text
                        style={[
                            CommonStyle.textMain,
                            {
                                color: CommonStyle.fontColorButtonSwitch,
                                fontSize: CommonStyle.fontSizeS - 2,
                                paddingTop: 4,
                                fontFamily: CommonStyle.fontPoppinsRegular
                            }
                        ]}
                    >
                        {I18n.t('clearAllData')}
                    </Text>
                </TouchableOpacityOpt>
            </View>
        );
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
        });
    }

    renderDifferentNote({ onDissmisModal }) {
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    borderWidth: 1,
                    borderColor: '#d6d7da',
                    borderRadius: 12,
                    marginHorizontal: 32,
                    overflow: 'hidden'
                }}
            >
                <View
                    style={{
                        backgroundColor: CommonStyle.backgroundColor,
                        borderBottomColor: CommonStyle.fontBorderGray,
                        borderBottomWidth: 1,
                        padding: 16
                    }}
                >
                    <Text
                        style={[
                            {
                                fontSize: CommonStyle.font17,
                                color: CommonStyle.fontColor,
                                opacity: 0.8,
                                textAlign: 'center'
                            }
                        ]}
                    >
                        {I18n.t('differentCashNote')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={{
                        marginVertical: 12,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={onDissmisModal}
                >
                    <Text
                        style={{
                            color: CommonStyle.fontApple,
                            textAlign: 'center',
                            fontWeight: '500'
                        }}
                    >
                        {I18n.t('gotItUpcase')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderButtonModify() {
        return (
            <View
                style={{
                    paddingTop: 12,
                    width: '100%',
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopWidth: 1,
                    borderTopColor: CommonStyle.color.dusk
                }}
            >
                <NewTouchableOpacity
                    disabled={
                        !this.dic.isChange ||
                        !this.props.isConnected ||
                        this.state.excuting ||
                        !RoleUser.checkRoleByKey(
                            Enum.ROLE_DETAIL.MODIFY_BUY_SELL_ORDER
                        )
                    }
                    onPress={() => {
                        this.onShowConfirmModal();
                    }}
                    style={[
                        styles.buttonSellBuy,
                        {
                            backgroundColor: this.props.data.is_buy
                                ? !this.dic.isChange ||
                                    !this.props.isConnected ||
                                    this.state.excuting ||
                                    !RoleUser.checkRoleByKey(
                                        Enum.ROLE_DETAIL.MODIFY_BUY_SELL_ORDER
                                    )
                                    ? CommonStyle.btnDisableBg
                                    : CommonStyle.fontOceanGreen
                                : !this.dic.isChange ||
                                    !this.props.isConnected ||
                                    this.state.excuting ||
                                    !RoleUser.checkRoleByKey(
                                        Enum.ROLE_DETAIL.MODIFY_BUY_SELL_ORDER
                                    )
                                    ? CommonStyle.btnDisableBg
                                    : CommonStyle.btnSellModify,
                            marginLeft: 16
                        }
                    ]}
                >
                    <View
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 30
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                paddingHorizontal: 24
                            }}
                        >
                            {this.state.excuting ? (
                                <ActivityIndicator
                                    style={{
                                        width: 18,
                                        height: 18,
                                        position: 'absolute',
                                        top: 2
                                    }}
                                    color={CommonStyle.fontWhite}
                                />
                            ) : null}
                            <Text
                                style={[
                                    CommonStyle.textButtonColor,
                                    {
                                        textAlign: 'center',
                                        fontSize: CommonStyle.fontSizeM,
                                        fontFamily: CommonStyle.fontPoppinsBold
                                    }
                                ]}
                            >
                                {this.dic.confirmTextButton}
                            </Text>
                        </View>
                        <Text
                            style={[
                                CommonStyle.textButtonColorS,
                                {
                                    textAlign: 'center',
                                    fontSize: CommonStyle.fontSizeXS,
                                    fontFamily: CommonStyle.fontPoppinsRegular
                                }
                            ]}
                        >
                            {this.renderCashAvailable()}
                        </Text>
                    </View>
                </NewTouchableOpacity>
                {this.renderClearDataAndNote()}
            </View>
        );
    }

    renderMarketDepthContent() {
        if (
            !RoleUser.checkRoleByKey(
                Enum.ROLE_DETAIL.VIEW_MARKET_DEPTH_MODIFY_ORDER
            )
        ) {
            return (
                <View
                    style={{
                        height: 200,
                        paddingHorizontal: 16,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    {
                        <Text style={{ color: CommonStyle.fontColor }}>
                            {I18n.t('noMarketDepth')}
                        </Text>
                    }
                </View>
            );
        }
        return (
            <MarketDepth
                code={this.dic.code}
                isOrder={false}
                symbolObject={this.dic.symbolObject}
                priceObject={this.dic.priceObject}
                channelLoadingOrder={this.dic.channelLoadingOrder}
                channelPriceOrder={this.dic.channelPriceOrder}
                isLoadingPrice={this.state.isLoadingPrice}
            />
        );
    }

    renderCos() {
        return (
            <RnCollapsible
                isExpand={true}
                title={'courseOfSales'}
                duration={150}
                renderContent={this.renderCosContent.bind(this)}
            ></RnCollapsible>
        );
    }

    renderCosContent() {
        if (
            !RoleUser.checkRoleByKey(
                Enum.ROLE_DETAIL.VIEW_COURSE_OF_SALES_MODIFY_ORDER
            )
        ) {
            return (
                <View
                    style={{
                        height: 200,
                        paddingHorizontal: 16,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text>{I18n.t('noCosData')}</Text>
                </View>
            );
        }
        return (
            <CourseOfSales
                code={this.dic.code}
                symbolObject={this.dic.symbolObject}
                channelLoadingOrder={this.dic.channelLoadingOrder}
            />
        );
    }

    renderSymbolName(symbolObject = {}) {
        const displayName = this.props.displayName;
        return (
            <View
                style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center'
                }}
            >
                <Text
                    style={[
                        {
                            fontFamily: CommonStyle.fontPoppinsBold,
                            fontSize: CommonStyle.fontSizeXXL,
                            color: CommonStyle.fontColor
                        }
                    ]}
                >
                    {Business.getSymbolName({ symbol: displayName }) || ''}
                </Text>
            </View>
        );
    }

    renderCompanyName() {
        const { data } = this.props;
        const symbolObj = dataStorage.symbolEquity[data.symbol] || {};
        const companyName = (
            symbolObj.company_name ||
            symbolObj.company ||
            symbolObj.security_name ||
            ''
        ).toUpperCase();
        const symbol = symbolObj && symbolObj.symbol ? symbolObj.symbol : '';
        return (
            <View
                style={[
                    {
                        flexDirection: 'row',
                        width: '100%',
                        paddingTop: 8,
                        alignItems: 'center'
                    }
                ]}
            >
                <Flag
                    type={'flat'}
                    code={symbol ? Business.getFlag(symbol) : ''}
                    size={20}
                />
                <View style={{ width: 8 }} />
                <View
                    style={{
                        width: '80%',
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                    }}
                >
                    <Text
                        numberOfLines={2}
                        style={[CommonStyle.textAlert, { textAlign: 'left' }]}
                    >
                        {companyName}
                    </Text>
                </View>
            </View>
        );
    }

    renderLeftComp = () => {
        return (
            <View style={{ width: 36 }}>
                <Icon name="ios-arrow-back" onPress={this.openMenu} />
            </View>
        );
    };

    openMenu = () => {
        func.setCurrentScreenId(ScreenId.ORDERS);
        this.refHeaderAnim &&
            this.refHeaderAnim.fadeOut(500).then(() => {
                this.props.navigator.dismissModal({
                    animated: true,
                    animationType: 'none'
                });
            });
    };

    updateDataWhenChangeTab = this.updateDataWhenChangeTab.bind(this);
    updateDataWhenChangeTab() {
        switch (this.dic.currentTab) {
            case 1:
                // Depth
                this.pubDepthData(this.dic.depthData);
                break;
            case 2:
                // Cos
                this.pubCosData(this.dic.tradesData);
                break;
            default:
                break;
        }
    }

    onChangeTab = this.onChangeTab.bind(this);
    onChangeTab(tabInfo = {}) {
        const { from, i } = tabInfo;
        if (i !== null && i !== undefined) {
            this.dic.currentTab = i;
        }
        this.updateDataWhenChangeTab();
    }

    renderTabScroll = () => {
        return (
            <TabScroll
                onChangeTab={this.onChangeTab}
                renderSummary={this.renderContentDetail.bind(this)}
                renderMarketDepth={this.renderMarketDepthContent.bind(this)}
                renderCos={this.renderCosContent.bind(this)}
            />
        );
    };

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
        );
    }

    renderUpdateTime() {
        console.log('YOLO renderUpdateTime');
        return (
            <PullToRefresh
                ref={(ref) => (this.dic.refUpdateTime = ref)}
                header={this.renderHeader()}
            ></PullToRefresh>
        );
    }

    onRefresh() {
        if (Controller.isPriceStreaming()) return;
        this.loadDataFromApi(true);
    }

    renderHeader() {
        return (
            <Header
                renderLeftComp={this.renderLeftComp}
                navigator={this.props.navigator}
                title={I18n.t('modifyOrder')}
                containerStyle={{
                    borderBottomRightRadius:
                        CommonStyle.borderBottomRightRadius,
                    overflow: 'hidden'
                }}
                firstChildStyles={{ minHeight: 18 }}
                style={{ marginLeft: 0, paddingTop: 16 }}
            >
                <View />
            </Header>
        );
    }

    renderPinComp() {
        const threshold = this.getThresholdScroll();
        const opacity = this._scrollValue.interpolate({
            inputRange: [0, threshold, threshold + 0.1],
            outputRange: [0, 0, 1]
        });
        return (
            <View style={{ width: '100%' }}>
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -34,
                        left: 0,
                        right: 0,
                        zIndex: 0,
                        width: '100%',
                        paddingTop: 34,
                        paddingLeft: 16,
                        backgroundColor: CommonStyle.backgroundColor,
                        borderBottomWidth: 1,
                        borderBottomColor: CommonStyle.color.dusk,
                        flexDirection: 'row',
                        alignItems: 'center',
                        opacity
                    }}
                >
                    <Text
                        style={[
                            {
                                fontFamily: CommonStyle.fontPoppinsBold,
                                fontSize: CommonStyle.fontSizeXXL,
                                color: CommonStyle.fontColor
                            }
                        ]}
                    >
                        {Business.getSymbolName({
                            symbol: this.props.displayName
                        }) || ''}
                    </Text>
                    <View style={{ width: 16 }} />
                    {this.renderLastTrade()}
                    <View style={{ width: 8 }} />
                    {this.renderChangePoint()}
                    {this.renderChangePercent()}
                </Animated.View>
            </View>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        const listProps = ['isConnected'];
        const listState = [
            'isRefresh',
            'isUpdateLastOrder',
            'excuting',
            'tradingHalt',
            'isLoadingPrice',
            'volume',
            'limitPrice',
            'stopPrice'
        ];
        const check = checkPropsStateShouldUpdate(
            nextProps,
            nextState,
            listProps,
            listState,
            this.props,
            this.state
        );
        return check;
    }

    renderStickerHeader() {
        return (
            <React.Fragment>
                {this.renderUpdateTime()}
                {this.renderPinComp()}
            </React.Fragment>
        );
    }

    renderAvoidingViewContent() {
        const { data } = this.props;
        return (
            <KeyboadShift offset={20}>
                {this.renderLastTradeDetail()}
                {this.renderSide()}
                {this.renderQuantity()}
                {this.renderAtribute({
                    value: data.filled_quantity,
                    label: Translate.getValByKey('Filled')
                })}
                {this.renderAtribute({
                    value: data.order_type,
                    label: Translate.getValByKey('orderType'),
                    format: (value) => this.getOrderTypeString(value)
                })}
                {this.renderLimitPrice()}
                {this.renderStopPrice()}
                {this.renderAtribute({
                    value: data.duration,
                    label: Translate.getValByKey('duration'),
                    format: (value) =>
                        Translate.getInvertTranslate(
                            Business.getDisplayDuration(value)
                        )
                })}
                {this.renderAtribute({
                    value: data.expire_date,
                    label: Translate.getValByKey('date'),
                    format: (value) => moment(value).format('DD/MM/YYYY')
                })}
                {this.renderAtribute({
                    value: this.dic.exchange,
                    label: Translate.getValByKey('exchange_txt')
                })}
            </KeyboadShift>
        );
    }

    onScrollEndDrag = this.onScrollEndDrag.bind(this);
    onScrollEndDrag() {
        if (Platform.OS === 'android') return;
        this.timeout2 && clearTimeout(this.timeout2);
        this.timeout2 = setTimeout(() => {
            this.C2R && this.C2R();
            this.C2R = null;
        }, 500);
    }

    renderRefreshControl = this.renderRefreshControl.bind(this);
    renderRefreshControl() {
        if (Platform.OS === 'ios' || Controller.isPriceStreaming()) return null;
        return (
            <RefreshControl
                progressViewOffset={100}
                refreshing={this.state.isRefresh}
                onRefresh={this.onRefresh}
            />
        );
    }

    render() {
        const { data } = this.props;
        this.dic.symbolObject = dataStorage.symbolEquity[data.symbol];
        this.setOrderContent();
        const OrderComponent =
            Platform.OS === 'ios' ? View : KeyboardAvoidingView;
        const orderProps = {
            testID: 'modifyOrderScreen',
            style: {
                flex: 1,
                backgroundColor: CommonStyle.backgroundColor
            }
        };
        orderProps.enabled = false;
        orderProps.behavior = 'height';
        return (
            <FallHeader
                ref={(ref) => ref && (this.headerRef = ref)}
                setRef={(ref) => (this.refHeaderAnim = ref)}
                isPullToRefresh={true}
                style={{ backgroundColor: CommonStyle.backgroundColor }}
                animation="slideInUp"
                header={this.renderHeader()}
            >
                <OrderComponent {...orderProps}>
                    <Animated.ScrollView
                        stickyHeaderIndices={[0]}
                        showsVerticalScrollIndicator={false}
                        ref="modifyOrderScroll"
                        style={{
                            flex: 1,
                            backgroundColor: CommonStyle.backgroundColor
                        }}
                        contentContainerStyle={{
                            backgroundColor: CommonStyle.backgroundColor
                        }}
                        scrollEnabled={true}
                        keyboardShouldPersistTaps={'handled'}
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: this._scrollValue }
                                    }
                                }
                            ],
                            {
                                useNativeDriver: true
                            }
                        )}
                        refreshControl={this.renderRefreshControl()}
                        onScrollEndDrag={this.onScrollEndDrag}
                    >
                        {this.renderStickerHeader()}
                        {this.renderAvoidingViewContent()}
                        {this.renderTabScroll()}
                    </Animated.ScrollView>
                    {this.renderButtonModify()}
                </OrderComponent>
            </FallHeader>
        );
    }
}

export function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps, {})(ModifyOrder);
