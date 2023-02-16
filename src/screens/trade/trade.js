import React, { PropTypes, Component } from 'react';
import {
    ScrollView, Text, View, FlatList, RefreshControl, Animated,
    TouchableOpacity, Modal, ActivityIndicator, Dimensions, Platform,
    PixelRatio, ListView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ProgressBar from '../../modules/_global/ProgressBar';
import { iconsMap } from '../../utils/AppIcons';
import styles from './style/trade';
import { func, dataStorage } from '../../storage';
import Price from '../price/price.1';
import IndexItem from './../overview/indexItem';
import TimeUpdated from '../../component/time_updated/time_updated';
import Warning from '../../component/warning/warning';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as tradeActions from './trade.actions';
import userType from '../../constants/user_type';
import I18n from '../../modules/language';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    getPriceSource, getDisplayName, logAndReport, setStyleNavigation, logDevice, checkPropsStateShouldUpdate,
    getPriceSelected, countC2RTimes, switchForm, getLv1, getTopCompany, getSymbolInfoApi, checkNewsToday
} from '../../lib/base/functionUtil';
import PriceDisplay from '../../constants/price_display_type';
import timer from 'react-native-timer';
import ModalPicker from './../modal_picker/modal_picker';
import Mongo from '../../lib/base/mongo';
import { setCurrentScreen } from '../../lib/base/analytics';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import fakeC2R from '../../img/15x15_fakec2r.png';
import analyticsEnum from '../../constants/analytics';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import ScreenId from '../../constants/screen_id';
import * as fbemit from '../../emitter';
import ENUM from '../../enum'
import * as Util from '../../util'
import * as Business from '../../business';
import * as InvertTranslate from '../../invert_translate'
import * as api from '../../api'
import * as Lv1 from '../../streaming/lv1'
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Emitter from '@lib/vietnam-emitter'
import * as NewsBusiness from '../../streaming/news'
import * as Controller from '../../memory/controller'

const { width, height } = Dimensions.get('window');

const ITEM_HEIGHT = 48;
const SECTION_ID = 's1';

const getItemLayout = (data, index) => (
    { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
);

export class Trade extends Component {
    constructor(props) {
        super(props);
        this.actionFlashing = {};
        // Function
        this.init = this.init.bind(this)
        this.registerActionFlashingOverview = this.registerActionFlashingOverview.bind(this);
        this.actionFlashingCb = this.actionFlashingCb.bind(this);
        this.changeIndex = this.changeIndex.bind(this);
        this.setAnimation = this.setAnimation.bind(this);
        this.registerChange = this.registerChange.bind(this);
        this.registerShowHidePriceModal = this.registerShowHidePriceModal.bind(this)
        this.showHideHeaderTab = this.showHideHeaderTab.bind(this);
        this.setButton = this.setButton.bind(this);
        this.setPersonalButton = this.setPersonalButton.bind(this)
        this.setOtherPersonalButton = this.setOtherPersonalButton.bind(this)
        this.setTopButton = this.setTopButton.bind(this)
        this._renderRow = this._renderRow.bind(this)
        this.getDataByTab = this.getDataByTab.bind(this)
        this.getDataWatchList = this.getDataWatchList.bind(this);
        this.updateTimeUpdated = this.updateTimeUpdated.bind(this);
        this.onChangeVisibleRows = this.onChangeVisibleRows.bind(this);
        this.onPickerSelect = this.onPickerSelect.bind(this);
        this.setButton = this.setButton.bind(this);
        this.reloadForm = this.reloadForm.bind(this);
        this.showHeader = this.showHeader.bind(this);
        this.hideHeader = this.hideHeader.bind(this);
        this.registerSetTimeUpdate = this.registerSetTimeUpdate.bind(this)
        this.resetData = this.resetData.bind(this)
        this.setTimeUpdateFn = this.setTimeUpdateFn.bind(this)
        this.showHideTimeUpdate = this.showHideTimeUpdate.bind(this)
        this.setSelectedPrice = this.setSelectedPrice.bind(this)
        this.startPerf = this.startPerf.bind(this)
        this.stopPerf = this.stopPerf.bind(this)
        this.setTabLabelStorage = this.setTabLabelStorage.bind(this)
        this.getDataFuncReload = this.getDataFuncReload.bind(this)
        this.renderDataNull = this.renderDataNull.bind(this)
        this.renderData = this.renderData.bind(this)
        this.dataUserWatchListChange = this.dataUserWatchListChange.bind(this)
        this.loadDataFromApi = this.loadDataFromApi.bind(this)
        this.dataGetPrice = this.dataGetPrice.bind(this)
        this.loadIndicesData = this.loadIndicesData.bind(this)
        this.getData = this.getData.bind(this)
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        // Assign dataStorage function
        dataStorage.setButtonWatchlist = this.setButton;
        // Init component
        this.init()
        // Action function
        this.typeForm = ScreenId.TRADE
        func.setPriceSelected(this.selected);
        func.setFuncReload('trade', this.reloadForm);
        this.perf = new Perf(performanceEnum.show_form_personal);
    }

    init() {
        this.listDisplayGuest = InvertTranslate.getListInvertTranslate(ENUM.PRICE_LIST_GUEST)
        this.listDisplay = InvertTranslate.getListInvertTranslate(ENUM.PRICE_LIST)
        // Variable
        this.register = {};
        this.overview = false;
        this.isResetView = false;
        this.setTimeUpdate = null;
        this.isMount = false;
        this.idForm = Util.getRandomKey();
        this.channelUpdateTrade = `trade##${this.idForm}`;
        this.lastCode = '';
        this.locationX = null;
        this.objPrice = null;
        this.scrollView = null;
        this.locationY = null;
        this.typeName = Controller.getLoginStatus() ? PriceDisplay.PERSONAL : PriceDisplay.SP20;
        this.channelLoadingTrade = StreamingBusiness.getChannelLoadingTrade(this.typeName);
        this.filterItem = Controller.getLoginStatus() ? this.listDisplay : this.listDisplayGuest;
        this.selected = Controller.getLoginStatus() ? dataStorage.priceSelectedLogin : dataStorage.priceSelectedNotLogin
        this.selectedKey = InvertTranslate.getKeyTranslate(this.selected)
        this.isOpen = true;
        this.showHidePriceModal = null;
        this.setAnimationUpdated = null;
        this._scrollPosition = 0;
        this.startPosition = null;
        this.endPosition = null;
        this.stateApp = null;
        this.isSetButton = true;
        this.willDisappear = false;
        this.timeoutSetbutton = null;
        this.menuSelected = dataStorage.menuSelected;
        this.indexTab = 0;
        this.visibleRows = {};
        // State
        this.state = {
            isLoading: false,
            isChangeTab: false,
            refreshing: false,
            activeRow: [],
            isRefreshing: false,
            offset: 0,
            heightAnimation: 40,
            isSelect: false,
            modalVisible: false,
            overviewDataSource: null,
            watchlistDataSource: null
        };
    }

    actionFlashingCb(objectAction) {
        if (objectAction !== null) {
            Object.values(objectAction).map((flashing) => {
                flashing && flashing();
            })
        }
    }

    showHideTimeUpdate(isShow) {
        this.timeUpdatedRef && this.timeUpdatedRef.showHide(isShow);
    }

    setTimeUpdateFn() {
        if (!Controller.isPriceStreaming()) {
            this.setTimeUpdate && this.setTimeUpdate(new Date().getTime())
        }
    }

    registerSetTimeUpdate(setTimeUpdate) {
        if (setTimeUpdate) {
            this.setTimeUpdate = setTimeUpdate
        }
    }

    registerShowHidePriceModal(showHidePriceModal) {
        if (showHidePriceModal) {
            this.showHidePriceModal = showHidePriceModal
        }
    }

    showHeader() {
        this.isOpen = true;
        this.props.setAnimation(this.isOpen);
        !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(true, 'trade')
        this.timeUpdatedRef && this.timeUpdatedRef.showHide(true);
        this.setAnimationUpdated && this.setAnimationUpdated();
    }
    hideHeader() {
        this.isOpen = false;
        this.props.setAnimation(this.isOpen);
        !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(false, 'trade')
        this.timeUpdatedRef && this.timeUpdatedRef.showHide(false);
        this.setAnimationUpdated && this.setAnimationUpdated();
    }

    getPriceName(priceName) {
        const data = priceName;
        switch (data) {
            case 'S&P 20':
                return ScreenId.TOP20;
            case 'S&P 50':
                return ScreenId.TOP50;
            case 'S&P 100':
                return ScreenId.TOP100;
            case 'S&P 200':
                return ScreenId.TOP200;
            case 'Indices':
                return ScreenId.INDICIES;
            case 'NYSE #1':
                return ScreenId.NYSE1;
            case 'NYSE #2':
                return ScreenId.NYSE2;
            case 'NYSE #3':
                return ScreenId.NYSE3;
            case 'NYSE #4':
                return ScreenId.NYSE4;
            case 'NYSE #5':
                return ScreenId.NYSE5;
            case 'NASDAQ #1':
                return ScreenId.NASDAQ1;
            case 'NASDAQ #2':
                return ScreenId.NASDAQ2;
            case 'AMEX':
                return ScreenId.XASE;
            case 'NYSE Arca':
                return ScreenId.ARCX;
            default:
                return ScreenId.TRADE;
        }
    }

    resetData(data) {
        if (data === 'Indices') {
            this.isMount && this.setState({
                overviewDataSource: []
            })
        } else {
            this.isMount && this.setState({
                watchlistDataSource: []
            })
        }
    }

    setSelectedPrice(enData) {
        this.selected = enData;
        this.selectedKey = InvertTranslate.getKeyTranslate(this.selected)
        func.setPriceSelected(enData)
    }

    startPerf(perfName) {
        this.perf = new Perf(perfName);
        this.perf && this.perf.start();
    }

    stopPerf() {
        this.perf && this.perf.stop()
    }

    setTabLabelStorage(typePrice) {
        if (Controller.getLoginStatus()) {
            dataStorage.tradeTypeLogin = typePrice;
        } else {
            dataStorage.tradeTypeNotLogin = typePrice;
        }
    }

    onPickerSelect(data) {
        // Dịch ngược về EN với key
        const enData = InvertTranslate.translateCustomLang(data)
        this.showHidePriceModal && this.showHidePriceModal(false, () => {
            if (this.selected === enData) return;
            this.typeName = Util.getPriceMapKeyFromValue(enData)
            this.channelLoadingTrade = StreamingBusiness.getChannelLoadingTrade(this.typeName);
            this.setButton({ i: 0 }, true);
            this.startPerf(performanceEnum.change_watch_list_display)
            if (Controller.isPriceStreaming()) {
                this.resetData(enData)
            }
            this.setSelectedPrice(enData)
            const title = Util.getTabLabel(this.typeName)
            this.setTabLabelStorage(this.typeName)
            this.props.setTitle(title);
            this.overview = this.typeName === 'indices'
            setCurrentScreen(analyticsEnum[this.typeName])
            dataStorage.watchListScreenId = this.typeName;
            this.objPrice.type = this.typeName;
            if (this.overview) {
                logDevice('info', `Trade - PICKER PRICE - LOAD DATA REQUEST INDICES: ${this.typeName}`);
                this.loadIndicesData()
            } else {
                logDevice('info', `Trade - PICKER PRICE - LOAD DATA REQUEST OTHER INDICES: ${this.typeName}`);
                this.loadDataFromApi()
            }
        })
    }

    getDataByTab(topScreenID) {
        this.setButton({ i: this.indexTab }, true)
        if (topScreenID === 'topGainers' || topScreenID === 'topLosers' ||
            topScreenID === 'topVolume') {
            logDevice('info', `Trade - GET DATA WATCH LIST: ${dataStorage.watchListScreenId}`);
            const fcb = func.getFuncReload(dataStorage.watchListScreenId);
            fcb && fcb();
        } else {
            logDevice('info', `Trade - GET DATA WATCH LIST: ${dataStorage.watchListScreenId}`);
            this.setTimeUpdateFn()
            this.loadDataFromApi()
        }
    }

    getDataWatchList() {
        // Show Tab when app state change
        if (!this.props.isConnected) return;
        if (this.props.setAnimation && !this.isOpen) {
            this.isOpen = true;
            this.props.setAnimation(this.isOpen);
            !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(true, dataStorage.watchListScreenId)
            this.timeUpdatedRef && this.timeUpdatedRef.showHide(true);
            this.setAnimationUpdated && this.setAnimationUpdated();
        }
        this.getDataByTab(dataStorage.watchListScreenId);
    }

    componentWillUnmount() {
        this.props.onRef && this.props.onRef(undefined);
        this.isMount = false;
        if (Controller.isPriceStreaming()) {
            // Unsub realtime price
            Business.unSubByScreen('watchlist')
        }
        this.props.actions.closeForm();
        fbemit.deleteEmitter('realTimeWatchList');
        this.indexTab = 0;
        dataStorage.tabWatchList = 'trade';
    }

    registerChange(code, cb) {
        this.register[code] = cb;
    }

    registerActionFlashingOverview(code, cb) {
        this.actionFlashing[code] = cb;
    }

    changeIndex(code, isOpen) {
        try {
            const cb = this.register[code];
            if (cb) {
                const preCode = this.lastCode;
                if (isOpen) {
                    this.lastCode = code;
                } else {
                    this.lastCode = '';
                }
                cb(isOpen);
                if (preCode !== code) {
                    const preCb = this.register[preCode];
                    if (preCb) preCb(false)
                }
            }
        } catch (error) {
            logAndReport('changeIndex trade exception', error, 'changeIndex trade');
            logDevice('info', `changeIndex trade exception: ${error}`)
        }
    }

    setPersonalButton(isRefresh) {
        const isPriceStreaming = Controller.isPriceStreaming()
        let rightButtons = []
        if (isPriceStreaming) {
            rightButtons = [
                {
                    icon: iconsMap['ios-browsers-outline'],
                    id: 'left_filter',
                    testID: 'left_filter_button'
                },
                {
                    title: 'Add',
                    id: 'add',
                    icon: iconsMap['ios-create-outline']
                }
            ]
        } else {
            rightButtons = isRefresh
                ? [
                    {
                        id: 'custom-button-watchlist',
                        component: 'equix.CustomButtonWatchlist'
                    },
                    {
                        icon: iconsMap['ios-browsers-outline'],
                        id: 'left_filter',
                        testID: 'left_filter_button'
                    },
                    {
                        title: 'Add',
                        id: 'add',
                        icon: iconsMap['ios-create-outline']
                    }
                ]
                : [
                    {
                        title: 'Refresh',
                        id: 'trade_refresh',
                        icon: iconsMap['ios-refresh-outline'],
                        testID: 'trade_refresh'
                    },
                    {
                        icon: iconsMap['ios-browsers-outline'],
                        id: 'left_filter',
                        testID: 'left_filter_button'
                    },
                    {
                        title: 'Add',
                        id: 'add',
                        icon: iconsMap['ios-create-outline']
                    }
                ]
        }
        this.props.navigator.setButtons({
            rightButtons
        })
    }

    setOtherPersonalButton(isRefresh) {
        const isPriceStreaming = Controller.isPriceStreaming()
        const isOverview = this.overview
        let rightButtons = [];
        if (isPriceStreaming) {
            rightButtons = [
                {
                    icon: iconsMap['ios-browsers-outline'],
                    id: 'left_filter'
                }
            ]
        } else {
            rightButtons = isRefresh
                ? [
                    {
                        id: 'custom-button-watchlist',
                        component: 'equix.CustomButtonWatchlist'
                    },
                    {
                        icon: iconsMap['ios-browsers-outline'],
                        id: 'left_filter'
                    }
                ]
                : [
                    {
                        title: 'Refresh',
                        id: isOverview ? 'overview_refresh' : 'trade_refresh',
                        icon: iconsMap['ios-refresh-outline'],
                        testID: isOverview ? 'overview_refresh' : 'trade_refresh'
                    },
                    {
                        icon: iconsMap['ios-browsers-outline'],
                        id: 'left_filter'
                    }
                ]
        }
        this.props.navigator.setButtons({
            rightButtons
        })
    }

    setTopButton(isRefresh) {
        const isPriceStreaming = Controller.isPriceStreaming()
        let rightButtons = []
        if (!isPriceStreaming) {
            rightButtons = isRefresh
                ? [
                    {
                        id: 'custom-button-watchlist',
                        component: 'equix.CustomButtonWatchlist'
                    }
                ]
                : [
                    {
                        title: 'Refresh',
                        id: 'trade_refresh',
                        icon: iconsMap['ios-refresh-outline'],
                        testID: 'trade_refresh'
                    }
                ]
        }
        this.props.navigator.setButtons({
            rightButtons
        })
    }

    setButton(tabInfo, isRefresh) {
        try {
            if (this.menuSelected === dataStorage.menuSelected) {
                this.indexTab = tabInfo.i || 0;
                switch (this.indexTab) {
                    case 0:
                        // Tab Trade
                        if (this.typeName === PriceDisplay.PERSONAL) {
                            this.setPersonalButton(isRefresh);
                        } else {
                            this.setOtherPersonalButton(isRefresh);
                        }
                        break;
                    default:
                        this.setTopButton(isRefresh)
                        // Tab Top
                        break;
                }
            }
        } catch (error) {
            logAndReport('setButton trade exception', error, 'setButton trade');
        }
    }

    reloadForm() {
        this.loadDataFromApi()
    }

    renderDataNull() {
        this.setTimeUpdateFn()
        if (this.overview) {
            this.isMount && this.setState({
                overviewDataSource: []
            }, () => {
                dataStorage.tabWatchList === 'trade' && this.setButton({ i: 0 }, false);
            })
        } else {
            this.isMount && this.setState({
                watchlistDataSource: []
            }, () => {
                dataStorage.tabWatchList === 'trade' && this.setButton({ i: 0 }, false);
            })
        }
    }

    renderData(data) {
        const now = new Date().getTime()
        this.setTimeUpdateFn()
        if (!Controller.isPriceStreaming()) {
            Emitter.emit(this.channelLoadingTrade, false);
        }
        if (this.overview) {
            const state = {
                overviewDataSource: data,
                isLoading: false
            }
            this.isMount && this.setState(state, () => {
                const time = new Date().getTime();
                console.log(`TIME RENDER INCICES: `, time - now)
                this.actionFlashingCb(this.actionFlashing);
                dataStorage.tabWatchList === 'trade' && this.setButton({ i: 0 }, false);
            })
        } else {
            const state = {
                watchlistDataSource: data,
                isLoading: false
            }
            this.isMount && this.setState(state, () => {
                const time = new Date().getTime();
                console.log(`TIME RENDER WATCHLIST: `, time - now)
                dataStorage.tabWatchList === 'trade' && this.setButton({ i: 0 }, false);
            })
        }
    }

    dataUserWatchListChange(data) {
        const now = new Date().getTime();
        if (data && data.errorCode) {
            return this.renderDataNull()
        } else if (data.length === 0) {
            return this.renderDataNull()
        } else {
            logDevice('info', `Trade - REPONSE LIST SYMBOL`);
            if (dataStorage.watchListScreenId !== PriceDisplay.PERSONAL && !dataStorage.isGetTop) {
                logDevice('error', `Trade - RETURN FALSE & NOT RENDER NEW SYMBOL `);
                return;
            }
            dataStorage.isGetTop = false;
            let val;
            let arr = [];
            if (data.length) {
                val = data || [];
                arr = val.sort(function (a, b) {
                    return a.rank - b.rank;
                });
            } else {
                val = data.val() || {};
                arr = Object.keys(val).map((k) => val[k]).sort(function (a, b) {
                    return a.rank - b.rank;
                });
            }
            logDevice('info', `Trade - REPONSE LIST SYMBOL WITH LENGTH: ${data.length}`);
            // const dicUserWatchlist = {};
            let stringQuery = '';
            let symbolQuery = '';
            let symbolSubQuery = '';
            for (let index = 0; index < arr.length; index++) {
                const element = arr[index];
                const symbol = element.symbol ? element.symbol : element.code;
                if (Controller.isPriceStreaming()) {
                    if (symbol.indexOf('/') < 0) {
                        symbolSubQuery += symbol + ',';
                    }
                } else {
                    symbolSubQuery += symbol + ',';
                }
                stringQuery += symbol + ',';
                // query get multi symbol
                if (!dataStorage.symbolEquity[symbol]) {
                    symbolQuery += symbol + ',';
                }
            }
            if (stringQuery) {
                stringQuery = stringQuery.replace(/.$/, '')
            }
            if (symbolQuery) {
                symbolQuery = symbolQuery.replace(/.$/, '')
            }
            if (symbolSubQuery) {
                symbolSubQuery = symbolSubQuery.replace(/.$/, '')
            }
            // check new trong ngay
            checkNewsToday(stringQuery)
                .then(() => {
                    const timeGetNewsToday = new Date().getTime();
                    logDevice('info', `CHECK NEWS TO DAY TRADE SCREEN SUCCESS`)
                    logDevice('info', `TIME GET NEWS TO DAY: ${(timeGetNewsToday - now) / 1000} s`)
                })
                .catch(error => {
                    logDevice('error', `CHECK NEWS TO DAY TRADE SCREEN FAILED`)
                });
            // Sub update announcement icon
            NewsBusiness.subNewsBySymbol(stringQuery)

            getSymbolInfoApi(symbolQuery, () => {
                const timeGetSymbolInfo = new Date().getTime()
                console.log(`TIME GET SYMBOL INFO WATCHLIST: `, (timeGetSymbolInfo - now) / 1000)
                logDevice('info', `TIME GET SYMBOL INFO WATCHLIST: ${(timeGetSymbolInfo - now) / 1000} s`)
                getLv1(arr, symbolSubQuery, this.renderData)
            })
        }
    }

    loadDataFromApi(byPassCache = false) {
        this.isMount && this.setState({
            isLoading: true
        })
        if (!Controller.isPriceStreaming()) {
            Emitter.emit(this.channelLoadingTrade, true);
            // this.isMount && this.setState({
            //     isLoading: true
            // })
        }
        dataStorage.countC2rWatchlist = true;
        try {
            perf = new Perf(performanceEnum.load_data_from_api_watch_list);
            perf && perf.start();
            logDevice('info', `Trade - GET SYMBOL TYPE: ${this.typeName}`);
            switch (this.typeName) {
                case PriceDisplay.SP20:
                    getTopCompany('top-asx-20/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.SP50:
                    getTopCompany('top-asx-50/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.SP100:
                    getTopCompany('top-asx-100/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.SP200:
                    getTopCompany('top-asx-200/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE1:
                    getTopCompany('tradable-NYSE-01/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE2:
                    getTopCompany('tradable-NYSE-02/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE3:
                    getTopCompany('tradable-NYSE-03/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE4:
                    getTopCompany('tradable-NYSE-04/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NYSE5:
                    getTopCompany('tradable-NYSE-05/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NASDAQ1:
                    getTopCompany('tradable-NASDAQ-01/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.NASDAQ2:
                    getTopCompany('tradable-NASDAQ-02/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.XASE:
                    getTopCompany('tradable-XASE/0', this.dataUserWatchListChange);
                    break;
                case PriceDisplay.ARCX:
                    getTopCompany('tradable-ARCX/0', this.dataUserWatchListChange);
                    break;
                default:
                    if (!fbemit.emitters['realTimeWatchList']) {
                        fbemit.newEmitter('realTimeWatchList');
                        fbemit.addListener('realTimeWatchList', 'onWatchList', byPassCache => api.getUserWatchList(this.dataUserWatchListChange, byPassCache))
                    }
                    api.getUserWatchList(this.dataUserWatchListChange, byPassCache)
                    break;
            }
        } catch (error) {
            logAndReport('loadDataFromApi tradeAction exception', error, 'loadDataFromApi tradeAction');
            logDevice('info', `loadDataFromApi tradeAction exception ${error}`);
        }
    }

    dataGetPrice(listSymbol, listSymbolObject, callback) {
        try {
            const perf = new Perf(performanceEnum.get_data_price_indicies);
            perf && perf.start();

            const numberSymbolUserWatchList = listSymbol.length;
            let expireSymbol = [];
            let isContain = false;

            Lv1.getLv1(listSymbolObject, Controller.isPriceStreaming())
                .then(bodyData => {
                    let newData = [];
                    if (bodyData.length !== numberSymbolUserWatchList) {
                        // Không lấy được đủ giá của thằng personal -> fill object fake
                        expireSymbol = listSymbol.filter((v, k) => {
                            const userWatchListSymbol = v.symbol;
                            for (let i = 0; i < bodyData.length; i++) {
                                const priceSymbol = bodyData[i].symbol;
                                if (userWatchListSymbol === priceSymbol) {
                                    isContain = true
                                }
                            }
                            if (isContain) {
                                isContain = false;
                                return false
                            }
                            return true
                        })
                    }
                    newData = [...bodyData, ...expireSymbol];
                    // sort lai theo user watchlist
                    let bodyDataSortByUserWatchList = []
                    for (let i = 0; i < listSymbol.length; i++) {
                        const symbol = listSymbol[i].symbol;
                        const arr = newData.filter((e, i) => {
                            return e.symbol === symbol;
                        })
                        bodyDataSortByUserWatchList.push(arr[0]);
                    }
                    if (bodyDataSortByUserWatchList && bodyDataSortByUserWatchList.length) {
                        this.renderData(bodyDataSortByUserWatchList)
                    }
                })
                .catch(err => {
                    console.log(err)
                    logDevice('info', `Overview data get price error: ${err}`);
                    this.renderDataNull()
                })
        } catch (error) {
            logDevice('info', `Overview data get price exception: ${error}`);
            this.renderDataNull()
        }
    }

    loadIndicesData() {
        const perf = new Perf(performanceEnum.load_data_overview);
        perf && perf.start();
        try {
            this.isMount && this.setState({
                isLoading: true
            })

            const url = api.getOverviewUrl();
            api.requestData(url).then(data => {
                if (data && data.errorCode) {
                    this.renderDataNull()
                } else if (data.length === 0) {
                    this.renderDataNull()
                } else {
                    let symbols = data.value || [];
                    let symbolQuery = '';
                    let stringQuery = '';
                    for (let i = 0; i < symbols.length; i++) {
                        const symbol = symbols[i].symbol;
                        stringQuery += `${symbol},`;
                        if (!dataStorage.symbolEquity[symbol]) {
                            symbolQuery += `${symbol},`;
                        }
                    }
                    if (symbolQuery) {
                        symbolQuery = symbolQuery.replace(/.$/, '')
                    }
                    if (stringQuery) {
                        stringQuery = stringQuery.replace(/.$/, '')
                    }
                    getSymbolInfoApi(symbolQuery, () => {
                        const listSymbolObject = Util.getListSymbolObject(stringQuery);
                        const ID_FORM = Util.getRandomKey();
                        if (Controller.isPriceStreaming()) {
                            // Set dic IDFORM nad listSymbolObject by name
                            func.setDicIDForm('watchlist', ID_FORM)
                            func.setDicListSymbolObject('watchlist', listSymbolObject)
                            Business.unSubByScreen('watchlist')
                            Lv1.sub(listSymbolObject, ID_FORM, () => {
                                this.dataGetPrice(symbols, listSymbolObject, this.renderData);
                            });
                            perf && perf.stop();
                        } else {
                            this.dataGetPrice(symbols, listSymbolObject, this.renderData);
                            perf && perf.stop();
                        }
                    })
                }
            }).catch(err => {
                console.log(err);
                logDevice('info', `Overview.actions - getTopIndex: ${err}`);
                this.renderDataNull()
            })
        } catch (error) {
            logAndReport('loadDataFrom overviewAction exception', error, 'loadDataFrom overviewAction');
            logDevice('info', `Overview.actions - loadDataFrom: ${error}`);
            this.renderDataNull()
        }
    }

    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            switchForm(this.props.navigator, event)
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'add':
                    this.props.navigator.showModal({
                        screen: 'equix.AddCode',
                        title: I18n.t('addCode', { locale: this.props.setting.lang }),
                        backButtonTitle: ' ',
                        animated: true,
                        animationType: 'slide-up',
                        passProps: {
                            setRealtime: this.setRealtime,
                            byPassCache: true,
                            loadDataFromApiFn: this.loadDataFromApi,
                            isConnected: this.props.isConnected
                        },
                        navigatorButtons: {
                            rightButtons: [
                                {
                                    title: Platform.OS === 'ios' ? 'Done' : '',
                                    id: 'done',
                                    icon: Platform.OS === 'ios' ? {} : iconsMap['md-checkmark']
                                }
                            ],
                            leftButtons: [
                                {
                                    testID: 'buttonCalcelWatchListAddCode',
                                    title: 'Cancel',
                                    id: 'cancel'
                                }
                            ]
                        },
                        navigatorStyle: {
                            navBarBackgroundColor: CommonStyle.statusBarBgColor,
                            navBarTranslucent: false,
                            drawUnderNavBar: true,
                            navBarHideOnScroll: false,
                            navBarTextColor: config.color.navigation,
                            navBarTextFontFamily: 'HelveticaNeue-Medium',
                            navBarTextFontSize: 18,
                            // navBarTransparent: true,
                            navBarButtonColor: config.button.navigation,
                            statusBarColor: config.background.statusBar,
                            statusBarTextColorScheme: 'light',
                            navBarNoBorder: true,
                            navBarSubtitleColor: 'white',
                            navBarSubtitleFontFamily: 'HelveticaNeue',
                            modalPresentationStyle: 'overCurrentContext'
                            // drawUnderTabBar: false
                        }
                    });
                    break;
                case 'trade_refresh':
                    this.setButton({ i: this.indexTab }, true)
                    this.perf && this.perf.incrementCounter(performanceEnum.watch_list_c2r);
                    const tabType = dataStorage.tabWatchList === 'trade' ? this.typeName : dataStorage.tabWatchList
                    this.getDataFuncReload(tabType)
                    this.setState({ isLoading: true })
                    break;
                case 'overview_refresh':
                    this.setButton({ i: this.indexTab }, true)
                    this.perf && this.perf.incrementCounter(performanceEnum.watch_list_c2r);
                    this.loadIndicesData()
                    break;
                case 'left_filter':
                    this.onShowModalPicker();
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
                    this.willDisappear = false;
                    this.perf.incrementCounter(performanceEnum.show_form_personal);
                    this.selected = Controller.getLoginStatus() ? dataStorage.priceSelectedLogin : dataStorage.priceSelectedNotLogin
                    this.selectedKey = InvertTranslate.getKeyTranslate(this.selected)
                    setCurrentScreen(analyticsEnum.personal);
                    this.props.navigator.setTitle({
                        title: I18n.t('WatchListTitle')
                    });
                    break;
                case 'didAppear':
                    // Get data back from new order
                    if (dataStorage.backNewOrder) {
                        this.getData()
                        func.setBackNewOrderStatus(true)
                    }
                    break;
                case 'willDisappear':
                    this.willDisappear = true;
                    this.isSetButton = false;
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }

    getDataFuncReload(type) {
        if (type === PriceDisplay.PERSONAL ||
            type === PriceDisplay.INDICES ||
            type === PriceDisplay.SP20 ||
            type === PriceDisplay.SP50 ||
            type === PriceDisplay.SP100 ||
            type === PriceDisplay.SP200 ||
            type === PriceDisplay.NASDAQ1 ||
            type === PriceDisplay.NASDAQ2 ||
            type === PriceDisplay.NYSE1 ||
            type === PriceDisplay.NYSE2 ||
            type === PriceDisplay.NYSE3 ||
            type === PriceDisplay.NYSE4 ||
            type === PriceDisplay.NYSE5 ||
            type === PriceDisplay.XASE ||
            type === PriceDisplay.ARCX
        ) {
            const fcb = func.getFuncReload('trade');
            fcb && fcb();
        } else {
            const fcb = func.getFuncReload(type);
            fcb && fcb();
        }
    }

    setFakeButton() {
        this.nav.setButtons({
            rightButtons: [
                {
                    icon: fakeC2R,
                    disableIconTint: true
                }
            ]
        });
    }
    updateData() {
        fbemit.addListener('watchlist', 'all', (data) => {
            this.updatedCallback(data)
        })
    }

    updatedCallback(userWatchList) {
        this.dataUserWatchListChange(userWatchList)
    }

    componentDidMount() {
        this.props.onRef && this.props.onRef(this)
        try {
            this.updateData();
            this.isMount = true;
            // Get data
            this.getData()
        } catch (error) {
            logAndReport('componentDidMount trade exception', error, 'componentDidMount trade');
            logDevice('info', `componentDidMount trade exception: ${error}`)
        }
    }

    getData() {
        // Get Data
        dataStorage.loadData = this.reloadForm;
        this.typeName = Controller.getLoginStatus() ? dataStorage.tradeTypeLogin : dataStorage.tradeTypeNotLogin
        this.channelLoadingTrade = StreamingBusiness.getChannelLoadingTrade(this.typeName);
        const title = Util.getTabLabel(this.typeName)
        // this.props.setTitle(title)
        this.isSetButton = true;
        // Chi set lai trang thai o tab trade
        if (this.indexTab === 0) {
            dataStorage.watchListScreenId = this.typeName;
        }
        func.setCurrentScreenId(ScreenId.TRADE)
        this.props.setButtonHeader(this.setButton);
        const obj = getPriceSelected(this.typeName);
        this.objPrice = obj;
        if (this.typeName === PriceDisplay.INDICES) {
            this.overview = true;
            logDevice('info', `Trade - LOAD DATA REQUEST Indices: ${obj}`);
            this.setButton({ i: this.indexTab }, true)
            this.loadIndicesData()
        } else {
            logDevice('info', `Trade - LOAD DATA REQUEST ${obj.type}: ${obj}`);
        }
    }

    renderHeader() {
        const isTopValuePriceboard = func.isCurrentPriceboardTopValue()
        return (
            <View style={{
                backgroundColor: 'white',
                flexDirection: 'row',
                marginHorizontal: 16,
                height: 40,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#0000001e'
            }} >
                <View style={styles.col1}>
                    <Text style={CommonStyle.textMainHeader}>{I18n.t('symbolUpper')}</Text>
                    <Text style={CommonStyle.textSubHeader}>{I18n.t('securityUpper')}</Text>
                </View>
                <View style={[styles.col2, { paddingRight: isTopValuePriceboard ? 0 : 4 }]}>
                    {
                        isTopValuePriceboard
                            ? <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('valueTradedUpper')}</Text>
                            : <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('priceUpper')}</Text>
                    }
                    {
                        isTopValuePriceboard
                            ? <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}></Text>
                            : <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('quantityUpper')}</Text>
                    }

                </View>
                <View style={styles.col3}>
                    <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('overviewChgP')}</Text>
                    <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('chgUpper')}</Text>
                </View>
            </View>
        );
    }

    onKeyExtractor(item, index) {
        return item.code;
    }

    _retrieveNextPage() {
        console.log('next page...');
        this.props.actions.nextPage();
    }

    // componentWillReceiveProps(nextProps) {
    //     // disappear thì không load lại dữ liệu và set lại button nữa
    //     if (!this.willDisappear) {
    //         const isOverview = this.overview;
    //         if (nextProps.onRef) {
    //             this.props.onRef && this.props.onRef(this)
    //         }
    //         // Update listview data
    //         if (isOverview) {
    //             if (nextProps.overview.data && nextProps.overview.data.length && dataStorage.tabWatchList === 'trade') {
    //                 this.isResetView = false
    //                 this.setTimeUpdateFn()
    //                 this.isMount && this.setState({
    //                     overviewDataSource: nextProps.overview.data
    //                 }, () => {
    //                     dataStorage.tabWatchList === 'trade' && this.setButton({ i: 0 }, false);
    //                     this.stopPerf()
    //                 });
    //             }
    //         } else {
    //             if (!nextProps.trade.isLoading && this.props.trade.isLoading && func.getUserPriceSource() !== userType.Streaming) {
    //                 dataStorage.tabWatchList === 'trade' && this.setButton({ i: 0 }, false);
    //             }
    //             if (nextProps.trade.listData && nextProps.trade.listData.length && dataStorage.tabWatchList === 'trade') {
    //                 this.isResetView = false
    //                 this.setTimeUpdateFn()
    //                 this.isMount && this.setState({
    //                     watchlistDataSource: nextProps.trade.listData
    //                 }, () => {
    //                     this.stopPerf()
    //                 });
    //             }
    //         }
    //     }
    // }

    setAnimation(cb) {
        this.setAnimationUpdated = cb;
    }

    onShowModalPicker() {
        this.showHidePriceModal && this.showHidePriceModal(true)
    }

    onClose() {
        this.showHidePriceModal && this.showHidePriceModal(false)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (dataStorage.tabWatchList !== 'trade') {
            return false;
        }
        const listProps = ['isConnected', { setting: ['lang'] }];
        const listState = ['heightAnimation', 'overview', 'modalVisible', 'timeUpdate', 'watchlistDataSource', 'overviewDataSource', 'isLoading'];
        let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
        return check;
    }
    beginDrag() {
        this.startPosition = null;
        this.endPosition = null;
    }
    endDrag() {
        if (this.startPosition < this.endPosition) {
            if (this.props.setAnimation && this.isOpen) {
                this.isOpen = false;
                this.props.setAnimation(this.isOpen);
                !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(false, 'trade')
                this.timeUpdatedRef && this.timeUpdatedRef.showHide(false);
                // this.setAnimationUpdated && this.setAnimationUpdated();
            }
        } else {
            if (this.props.setAnimation && !this.isOpen) {
                this.isOpen = true;
                this.props.setAnimation(this.isOpen);
                !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(true, 'trade')
                this.timeUpdatedRef && this.timeUpdatedRef.showHide(true);
                // this.setAnimationUpdated && this.setAnimationUpdated();
            }
        }
        this.startPosition = null;
        this.endPosition = null;
    }
    showHideHeaderTab(screen, isShow = true) {
        if (isShow) {
            this.isOpen = true;
            this.props.setAnimation(this.isOpen);
            !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(true, 'trade')
            this.timeUpdatedRef && this.timeUpdatedRef.showHide(true);
            this.setAnimationUpdated && this.setAnimationUpdated();
        } else {
            this.isOpen = false;
            this.props.setAnimation(this.isOpen);
            !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(false, 'trade')
            this.timeUpdatedRef && this.timeUpdatedRef.showHide(false);
            this.setAnimationUpdated && this.setAnimationUpdated();
        }
    }

    scrollEvent(evt) {
        const offsetY = evt.nativeEvent.contentOffset.y || 0;
        if (!this.startPosition && this.startPosition !== 0) {
            this.startPosition = offsetY;
        }
        this.endPosition = offsetY;
    }

    _renderRow(rowData, sectionId, rowID) {
        const symbol = rowData.symbol
        const displayName = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name
            ? dataStorage.symbolEquity[symbol].display_name
            : symbol;
        if (!this.overview) {
            return (
                <View testID={`${rowData.symbol}WatchListRowData`} key={`${rowData.symbol}view`}>
                    <Price
                        channelLoadingTrade={this.channelLoadingTrade}
                        getRealtime={this.getRealtime}
                        symbol={symbol}
                        channelUpdateIndex={Controller.isPriceStreaming() ? this.channelUpdateTrade : null}
                        rowID={rowID}
                        displayName={displayName}
                        showHideHeaderTab={this.showHideHeaderTab}
                        data={rowData}
                        type={Controller.getLoginStatus() ? this.getPriceName(dataStorage.tradeTypeLogin) : this.getPriceName(dataStorage.tradeTypeNotLogin)}
                        typePrice={this.typeName === PriceDisplay.PERSONAL}
                        login={this.props.login}
                        registerChange={this.registerChange}
                        changeIndex={this.changeIndex}
                        navigator={this.props.navigator}
                        key={symbol}
                        isLoading={this.state.isLoading}
                        allowRender={this.visibleRows[rowID] === true}
                    />
                    <View style={CommonStyle.borderBelow}></View>
                </View>
            )
        } else {
            return (
                <View style={{ width: '100%' }} key={rowData.code} >
                    <IndexItem code={symbol} testID={`overview_${rowData.symbol}`}
                        symbol={symbol}
                        displayName={displayName}
                        name={rowData.name}
                        originalObj={rowData}
                        type={ScreenId.INDICIES}
                        registerChange={this.registerChange}
                        changeIndex={this.changeIndex}
                        registerActionFlashingOverview={this.registerActionFlashingOverview}
                        isLoading={this.state.isLoading}
                        {...this.props}
                        key={rowData.symbol} />
                    <View style={CommonStyle.borderBelow}></View>
                </View>
            )
        }
    }

    _renderFooter() {
        return (
            <View>
                <View style={{ height: CommonStyle.heightTabbar }}></View>
            </View>
        )
    }

    updateTimeUpdated(timeUpdate) {
        this.isMount && this.setState({
            timeUpdate
        })
    }

    onChangeVisibleRows(visibleRows, changedRows) {
        if (!visibleRows || !visibleRows[SECTION_ID] || !changedRows || !changedRows[SECTION_ID]) return;
        this.visibleRows = visibleRows[SECTION_ID];
        Emitter.emit(this.channelUpdateTrade, changedRows[SECTION_ID]);
    }

    renderLoading() {
        return (
            <View style={{
                backgroundColor: 'transparent',
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <ProgressBar />
            </View>
        )
    }

    render() {
        if (dataStorage.tabWatchList !== 'trade') {
            return <View />
        } else {
            const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            let listData = this.overview ? this.state.overviewDataSource : this.state.watchlistDataSource;
            const dataSource = ds.cloneWithRows(listData || []);

            return (
                <View style={{ flex: 1 }}>
                    {func.getUserPriceSource() === userType.Delay ? <Warning ref={ref => this.tradeTab = ref} warningText={I18n.t('delayWarning', { locale: this.props.setting.lang })} isConnected={true} /> : null}
                    {
                        Controller.isPriceStreaming()
                            ? <View />
                            : this.overview ? (<TimeUpdated isShow={true} registerSetTimeUpdate={this.registerSetTimeUpdate} />)
                                : <TimeUpdated onRef={ref => this.timeUpdatedRef = ref} testID={`watchListUpdatedTime`} type={this.typeName} isShow={true} registerSetTimeUpdate={this.registerSetTimeUpdate} />
                    }
                    {this.renderHeader()}
                    {
                        listData && listData.length
                            ? <ListView
                                removeClippedSubviews={false}
                                keyboardShouldPersistTaps="always"
                                dataSource={dataSource}
                                renderFooter={this._renderFooter.bind(this)}
                                renderRow={this._renderRow.bind(this)}
                                onChangeVisibleRows={this.onChangeVisibleRows}
                            />
                            : <View />
                    }
                    {
                        (Controller.isPriceStreaming() && this.state.isLoading) || (Controller.isPriceStreaming() && !(listData && listData.length)) ? this.renderLoading() : <View />
                    }
                    <ModalPicker
                        registerShowHideModal={this.registerShowHidePriceModal}
                        listItem={this.filterItem}
                        onSelected={this.onPickerSelect}
                        selectedItem={I18n.t(this.selectedKey)}
                        visible={this.state.modalVisible}
                        title={I18n.t('selectWatchlist', { locale: this.props.setting.lang })}
                        onClose={this.onClose.bind(this)} />
                </View>
            );
            // }
        }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        login: state.login,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(tradeActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Trade);
