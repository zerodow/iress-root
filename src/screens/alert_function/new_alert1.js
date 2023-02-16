import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    ScrollView,
    PixelRatio,
    Platform,
    TextInput,
    ListView,
    Keyboard,
    Dimensions,
    FlatList,
    StatusBar,
    KeyboardAvoidingView,
    StyleSheet,
    InteractionManager,
    TouchableWithoutFeedback,
    DeviceEventEmitter,
    NativeAppEventEmitter,
    Easing
} from 'react-native';
import _ from 'lodash';
import Animated from 'react-native-reanimated';
// Redux
import { connect } from 'react-redux';
import * as settingAction from '../../screens/setting/setting.actions';
import { bindActionCreators } from 'redux';
// Util
import * as Business from '../../business';
import * as FunctionUtil from '../../lib/base/functionUtil';
import * as Api from '../../api';
import * as PureFunc from '../../utils/pure_func';
import * as Util from '~/util';
// Common
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel';
import StateApp from '~/lib/base/helper/appState';
import * as ManageConection from '~/manage/manageConnection';
// Component
import XComponent from '../../component/xComponent/xComponent';
import Flag from '../../component/flags/flag';
import NetworkWarning from '../../component/network_warning/network_warning';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import I18n from '../../modules/language/';
import ScrollBarUndeline from '../../component/scrollbar_underline/scrollbar_underline';
import RowLoading from './components/RowLoading';
import BackDropView from '~s/watchlist/Component/BackDropView';
import TransitionView1 from '~/component/animation_view/index1';
// import AlertSlidingPanel from './alert_sliding_panel'
import AlertSlidingPanel from './alert_sliding_panel.clone';
import ItemSeparator from './components/ItemSeparator';
import SearchBar from './components/SearchBar/index';
import ButtonConfirm, { TYPE } from './components/ButtonConfirm';
import ResultSearch from './components/SearchBar/Result';
import * as Animatable from 'react-native-animatable';
import {
    NestedScrollViewFinal,
    BackDropViewCustom,
    DEFAULT_HEGIHT
} from '~s/order/order_wrapper';
import KeyboardPushCenter from '~/component/keyboard_smart/keyboard_push_center_space.js';
// Style
import CommonStyle, { register } from '~/theme/theme_controller';
// Storage
import { dataStorage, func } from '../../storage';
import ENUM from '../../enum';
import * as Controller from '../../memory/controller';
import * as AllMarket from '../../streaming/all_market';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import KeyboardSmart from '~/component/keyboard_smart';
import BackDropView2 from '~s/watchlist/Component/BackDropView2';
// Redux
import { changeScreenActive } from './redux/actions';
// Constant
import userType from '~/constants/user_type';
import ScreenId from '../../constants/screen_id';

const { ALERT_SCREEN } = ENUM;
const { ID_ELEMENT, SYMBOL_CLASS, SYMBOL_CLASS_QUERY } = ENUM;
const { width, height } = Dimensions.get('window');
const TRADELIST_PADDING = 16;
const HEIGHT_DEVICE = height;
const { call, timing, interpolate } = Animated;
/**
 * Doi lai bay gio view ao se co do cao bang ca man hinh de khi offset bang o tuc la hide Nested
 */
export class NewAlert extends XComponent {
    init() {
        this.dic = {
            isLogin: Controller.getLoginStatus(),
            id: Util.getRandomKey(),
            countChangeTab: 0,
            isPriceStreaming: Controller.isPriceStreaming(),
            symbolInfo: {},
            channelPrice: Channel.getChannelAlertPrice(),
            symbol: '',
            displayName: '',
            symbolClass: '',
            company: '',
            _scrollValue: new Animated.Value(0),
            _scrollContainer: new Animated.Value(HEIGHT_DEVICE),
            _scrollContentValue: new Animated.Value(0),
            timeout: null,
            textSearch: this.props.textSearch || '',
            isHistory: false,
            selectedClass: SYMBOL_CLASS.ALL_TYPES,
            listHistory: [],
            dicHistoryByClass: {},
            listSymbolClass: [
                {
                    id: SYMBOL_CLASS.ALL_TYPES,
                    label: I18n.t(SYMBOL_CLASS.ALL_TYPES),
                    action: this.onSelectSymbolClass
                },
                {
                    id: SYMBOL_CLASS.EQUITY,
                    label: I18n.t(SYMBOL_CLASS.EQUITY),
                    action: this.onSelectSymbolClass
                },
                {
                    id: SYMBOL_CLASS.ETFS,
                    label: I18n.t(SYMBOL_CLASS.ETFS),
                    action: this.onSelectSymbolClass
                },
                {
                    id: SYMBOL_CLASS.MF,
                    label: I18n.t(SYMBOL_CLASS.MF),
                    action: this.onSelectSymbolClass
                },
                {
                    id: SYMBOL_CLASS.WARRANT,
                    label: I18n.t(SYMBOL_CLASS.WARRANT),
                    action: this.onSelectSymbolClass
                },
                {
                    id: SYMBOL_CLASS.FUTURE,
                    label: I18n.t(SYMBOL_CLASS.FUTURE),
                    action: this.onSelectSymbolClass
                },
                {
                    id: SYMBOL_CLASS.OPTION,
                    label: I18n.t(SYMBOL_CLASS.OPTION),
                    action: this.onSelectSymbolClass
                }
            ]
        };
        this.timeoutGetAlertSearch = null;
        this.heightContainerPanel = 0;
        this.initSearch = true;
        this.state = {
            isHistory: false,
            isSearch: true,
            isLoading: true,
            isLoadingPrice: false,
            textSearch: this.props.textSearch || '',
            isShowKeyboard: true,
            keyboardHeight: 0,
            dataSource: [],
            isNoData: !this.props.isHasHistory // Neu ko co history hien thi nodata luon
        };
        dataStorage.animationDirection = 'fadeIn';
        ManageConection.setScreenId(ScreenId.NEW_ALERT);
        this.emitter =
            Platform.OS === 'android'
                ? DeviceEventEmitter
                : NativeAppEventEmitter;
        // ManageConection.dicConnection.getSnapshot = this.handleWakupApp;
        this.stateApp = new StateApp(
            this.handleWakupApp,
            null,
            ScreenId.NEW_ALERT,
            false
        );
    }
    handleWakupApp() {
        if (this.dic.isShowDetail) {
            this._alertSlidingPanel &&
                this._alertSlidingPanel.handleClickToRefresh();
        }
        const selectedClass = this.dic.selectedClass;
        if (!this.dic.textSearch) {
            this.setState({
                dataSource: [],
                isLoading: true,
                isNoData: false
            });
            // const cb = () => this.getAlertSearchHistory();
            this.getAlertSearchHistory()
            // this.showLoading('fadeIn', cb);
        } else {
            this.setState({
                dataSource: [],
                isNoData: false,
                isLoading: true
            });
            const cb = () =>
                this.callBaclOnSelectSymbolClassSearch(
                    selectedClass,
                    this.dic.countChangeTab
                );
            this.showLoading('fadeIn', cb);
        }
    }
    updateSymbol() {
        const { symbol, class: symbolClass } = this.dic.symbolInfo;
        const company =
            this.dic.symbolInfo.security_name ||
            this.dic.symbolInfo.company_name ||
            this.dic.symbolInfo.company;
        const displayName = FunctionUtil.getDisplayName(symbol);
        this.dic.symbol = symbol;
        this.dic.company = company;
        this.dic.symbolClass = symbolClass;
        this.dic.displayName = displayName;
    }

    getSymbolObj() {
        return {
            symbol: this.dic.symbol,
            company: this.dic.company,
            symbolClass: this.dic.symbolClass,
            displayName: this.dic.displayName
        };
    }
    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            FunctionUtil.switchForm(this.props.navigator, event);
        } else if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'backPress':
                    return true;
                case 'add_alert':
                    break;
                case 'create_alert':
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
                    break;
                case 'didAppear':
                    break;
                default:
                    break;
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (
            nextProps &&
            nextProps.textSearch &&
            nextProps.textSearch !== this.state.textSearch
        ) {
            this.setState({ textSearch: nextProps.textSearch });
        }
        if (nextProps.isConnected && !this.props.isConnected) {
            const isForceUpdate = true;
            this.onSearch(this.dic.textSearch, isForceUpdate);
            if (this.dic.isShowDetail) {
                setTimeout(() => {
                    this.onPressResultSearch({
                        symbolInfo: this.dic.symbolInfo
                    });
                }, 50);
            }
        }
    }
    showLoading = (type, cb) => {
        this.refRowLoading &&
            this.refRowLoading.runAnimation(
                {
                    type
                },
                cb
            );
    };
    componentDidMount() {
        super.componentDidMount();
        this.subSyncHistorySearchSymbol();
        func.setCurrentScreenId(ScreenId.NEW_ALERT);
        // Khong co history ko can check history

        if (!this.props.isHasHistory) {
            setTimeout(() => {
                this.dic.refTextSearch && this.dic.refTextSearch.focus();
            }, 300);
        } else {
            this.handleSearchInit();
        }
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide.bind(this)
        );
    }

    componentWillUnmount() {
        this.timeoutGetAlertSearch && clearTimeout(this.timeoutGetAlertSearch);
        this.unsubSyncHistorySearchSymbol();
        this.dic.isPriceStreaming && this.unsubSymbol();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        super.componentWillUnmount();
    }

    syncWhenIsHistory = this.syncWhenIsHistory.bind(this);
    syncWhenIsHistory() {
        // Get symbol info -> rerender
        if (this.dic.listHistory.length) {
            this.filterHistoryByClass();
            let stringQuery = ``;
            for (let i = 0; i < this.dic.listHistory.length; i++) {
                const element = this.dic.listHistory[i];
                stringQuery += `${element.symbol},`;
            }
            if (stringQuery !== '') {
                FunctionUtil.getSymbolInfoApi(stringQuery, () => {
                    this.loadData('', this.dic.selectedClass);
                });
            } else {
                this.loadData('', this.dic.selectedClass);
            }
        } else {
            this.loadData('', this.dic.selectedClass);
        }
    }

    syncWhenNotHistory = this.syncWhenNotHistory.bind(this);
    syncWhenNotHistory() {
        // Get symbol info
        if (this.dic.listHistory.length) {
            this.filterHistoryByClass();
            let stringQuery = ``;
            for (let i = 0; i < this.dic.listHistory.length; i++) {
                const element = this.dic.listHistory[i];
                stringQuery += `${element.symbol},`;
            }
            if (stringQuery !== '') {
                FunctionUtil.getSymbolInfoApi(stringQuery);
            }
        }
    }

    syncHistorySearchSymbol = this.syncHistorySearchSymbol.bind(this);
    syncHistorySearchSymbol(listSymbol) {
        if (!this.dic.isLogin) return;
        this.dic.listHistory = listSymbol;
        // Rerender nếu đang ở trạng thái history
        if (this.state.isHistory) {
            return this.syncWhenIsHistory();
        }
        return this.syncWhenNotHistory();
    }

    subSyncHistorySearchSymbol = this.subSyncHistorySearchSymbol.bind(this);
    subSyncHistorySearchSymbol() {
        const channel = Channel.getChannelSyncHistorySearchSymbol();
        Emitter.addListener(channel, this.dic.id, this.syncHistorySearchSymbol);
    }

    unsubSyncHistorySearchSymbol = this.unsubSyncHistorySearchSymbol.bind(this);
    unsubSyncHistorySearchSymbol() {
        Emitter.deleteByIdEvent(this.dic.id);
    }

    _keyboardDidShow(e) {
        const keyboardHeight = e.endCoordinates.height || 0;
        // this.setState({ isShowKeyboard: true, keyboardHeight })
    }

    _keyboardDidHide() {
        const keyboardHeight = 0;
        // this.setState({ isShowKeyboard: false, keyboardHeight })
    }

    updateListAlertSearchHistory(newListAlertSearchHistory) {
        if (!this.dic.isLogin) return;
        this.dic.listHistory = newListAlertSearchHistory;
        this.filterHistoryByClass();
    }

    filterHistoryByClass() {
        this.dic.dicHistoryByClass = Business.filterSymbolByClass(
            this.dic.listHistory
        );
    }

    getSymbolSaveHistory(symbolInfo = {}) {
        let {
            master_code: masterCode,
            class: symbolClass,
            has_child: hasChild,
            exchanges = []
        } = symbolInfo;
        const company =
            symbolInfo.security_name ||
            symbolInfo.company_name ||
            symbolInfo.company;
        let symbol = symbolInfo.symbol;
        if (masterCode) {
            // Lưu thằng cha
            symbol = masterCode;
            masterCode = null;
            hasChild = false;
        }
        return {
            master_code: masterCode,
            has_child: hasChild,
            exchanges,
            symbol,
            company,
            symbolClass
        };
    }

    getAlertSearchHistory(isRender = true) {
        try {
            if (this.dic.isLogin) {
                this.dic.listHistory = ManageHistorySearch.getHistorySearchSymbol(
                    30
                );
            }
            if (this.dic.listHistory.length) {
                this.filterHistoryByClass();
                let stringQuery = ``;
                for (let i = 0; i < this.dic.listHistory.length; i++) {
                    const element = this.dic.listHistory[i];
                    stringQuery += `${element.symbol},`;
                }
                if (stringQuery !== '') {
                    FunctionUtil.getSymbolInfoApi(stringQuery, () => {
                        isRender && this.loadData('', this.dic.selectedClass);
                    });
                } else {
                    isRender && this.loadData('', this.dic.selectedClass);
                }
            } else {
                isRender && this.loadData('', this.dic.selectedClass);
            }
        } catch (error) {
            console.log('getAlertSearchHistory EXCEPTION', error);
        }
    }

    storeHistorySearchSymbolLocal = this.storeHistorySearchSymbolLocal.bind(
        this
    );
    storeHistorySearchSymbolLocal() {
        ManageHistorySearch.storeHistorySearchSymbolLocal(this.dic.listHistory);
    }

    storeHistorySearchSymbolApi = this.storeHistorySearchSymbolApi.bind(this);
    storeHistorySearchSymbolApi() {
        ManageHistorySearch.storeHistorySearchSymbolApi();
    }

    checkSymbolHistoryExist = this.checkSymbolHistoryExist.bind(this);
    checkSymbolHistoryExist(dic, symbolInfo) {
        let exist = false;
        for (i = 0; i < dic.length; i++) {
            if (dic[i].symbol === symbolInfo.symbol) {
                exist = true;
                break;
            }
        }
        return exist;
    }

    setAlertSearchHistory() {
        this.storeHistorySearchSymbolLocal();
        this.storeHistorySearchSymbolApi();
    }

    onSelectSymbolClass(selectedClass) {
        this.dic.countChangeTab += 1;
        if (selectedClass === this.dic.selectedClass) {
            return;
        }
        this.dic.selectedClass = selectedClass;
        if (!this.dic.textSearch) {
            this.setState({
                dataSource: [],
                isNoData: false,
                isLoading: true
            });
            const cb = () =>
                this.callBackOnSelectSymbolClass(
                    selectedClass,
                    this.dic.countChangeTab
                );
            this.showLoading(dataStorage.animationDirection);
            cb();
        } else {
            this.setState({
                dataSource: [],
                isNoData: false,
                isLoading: true
            });
            const cb = () =>
                this.callBaclOnSelectSymbolClassSearch(
                    selectedClass,
                    this.dic.countChangeTab
                );
            this.showLoading(dataStorage.animationDirection);
            cb();
        }
    }
    callBaclOnSelectSymbolClassSearch = (selectedClass, countChangeTab) => {
        if (this.dic.countChangeTab === countChangeTab) {
            this.loadData(this.dic.textSearch, selectedClass);
        }
    };
    callBackOnSelectSymbolClass = (selectedClass, countChangeTab) => {
        if (this.dic.countChangeTab === countChangeTab) {
            this.getSearchHistoryByClass();
        }
    };
    onSearch(text, isForceUpdate = false) {
        // Khi không có kết nối mạng thì chỉ ghi nhận text search thay đổi mà không call API
        if (!this.props.isConnected && !isForceUpdate) {
            this.dic.textSearch = text;
            return this.setState({
                textSearch: text,
                isHistory: !text,
                isNoData: true,
                dataSource: []
            });
        }
        this.dic.timeout && clearTimeout(this.dic.timeout);
        let loading = false;
        // const dicSearchHistoryByClass = (this.dic.dicHistoryByClass && this.dic.dicHistoryByClass[this.dic.selectedClass]) || []
        const dicSearchHistoryByClass = [];
        if (text === '') {
            this.initSearch = true;
            // Case xoa het text search
            /**
             * B1: Thu Row Data Len
             * Box Loading tu tren xuong
             * Co Da ta fadeIn data len
             */
            // loading = true;
            if (this.props.isNews) {
                let lastSymbolSearch = { symbol: '' };
                if (this.props.textSearch) {
                    lastSymbolSearch = { symbol: this.props.textSearch };
                }
            }
            if (this.dic.textSearch === '') {
                this.setState({
                    textSearch: text,
                    isHistory: false,
                    dataSource: dicSearchHistoryByClass,
                    isNoData:
                        dicSearchHistoryByClass &&
                        dicSearchHistoryByClass.length === 0
                });
                return;
            }
            this.dic.textSearch = '';
            // const cb = () =>
            //     this.callBackSearchWhenClearText(text, dicSearchHistoryByClass);
            this.callBackSearchWhenClearText(text, dicSearchHistoryByClass);

            // this.refResultSearch &&
            //     this.refResultSearch.runAnimation(
            //         {
            //             type: 'fadeOutUp'
            //         },
            //         cb
            //     );
        }

        // if (text.length === 1) {
        //     this.dic.textSearch = text
        //     const cb = () => this.callBackSearchWhenClearText(text, dicSearchHistoryByClass)
        //     this.refResultSearch && this.refResultSearch.runAnimation({
        //         type: 'fadeOutUp'
        //     }, cb)
        // }

        if (text.length > 0) {
            this.dic.textSearch = text;
            this.setState({
                isHistory: false,
                dataSource: []
            });
            if (this.initSearch) {
                loading = true;
                this.showLoading('fadeInDown');
                this.dic.timeout && clearTimeout(this.dic.timeout);
                this.dic.timeout = setTimeout(() => {
                    this.callBackOnSearch(text);
                    this.initSearch = false;
                }, 500);
            } else {
                this.showLoading('fadeIn');
                loading = true;
                this.dic.timeout && clearTimeout(this.dic.timeout);
                this.dic.timeout = setTimeout(() => {
                    this.callBackOnSearch(text);
                }, 500);
            }
            // Case nhap text search
        }
        this.setState({
            textSearch: text,
            isLoading: loading,
            isNoData: false,
            isHistory: false
        });
    }
    callBackSearchWhenClearText = (textSearch, dicSearchHistoryByClass) => {
        if (textSearch === this.dic.textSearch) {
            this.setState({
                dataSource: [],
                isHistory: false,
                isNoData: false,
                isLoading: true
            });
            this.refRowLoading &&
                this.refRowLoading.runAnimation(
                    {
                        type: 'fadeInDown'
                    },
                    () => { }
                );
            this.refRowLoading &&
                this.refRowLoading.runAnimation({
                    type: 'fadeOut'
                });
            this.setState({
                dataSource: dicSearchHistoryByClass,
                isNoData:
                    dicSearchHistoryByClass &&
                    dicSearchHistoryByClass.length === 0,
                isLoading: false
            });
        }
    };
    callBackOnSearch = (text) => {
        if (this.dic.textSearch === text) {
            this.loadData(text, this.dic.selectedClass);
        }
    };
    getSearchHistoryByClass() {
        // const dicSearchHistoryByClass =
        //     (this.dic.dicHistoryByClass &&
        //         this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
        //     [];
        const dicSearchHistoryByClass = [];
        this.showLoading('fadeOut');
        this.setState({
            isHistory: false,
            dataSource: dicSearchHistoryByClass,
            isNoData:
                dicSearchHistoryByClass && dicSearchHistoryByClass.length === 0,
            isLoading: false
        });
    }
    showData = (type) => {
        this.refResultSearch &&
            this.refResultSearch.runAnimation({
                type
            });
        this.refRowLoading &&
            this.refRowLoading.runAnimation({
                type
            });
    };
    loadData(text, selectedClass) {
        if (text.length > 0) {
            const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
            this.dic.textSearch = textSearch;
            const cb = (params) => this.callbackSearch(params, selectedClass, textSearch);
            const classQuery = this.getClassQuery();
            FunctionUtil.searchResponse({ textSearch, cb, classQuery });
        } else {
            this.dic.textSearch = '';
            // const dicSearchHistoryByClass =
            //     (this.dic.dicHistoryByClass &&
            //         this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
            //     [];
            const dicSearchHistoryByClass = [];
            this.setState(
                {
                    isHistory: false,
                    dataSource: dicSearchHistoryByClass,
                    isNoData:
                        dicSearchHistoryByClass &&
                        dicSearchHistoryByClass.length === 0,
                    isLoading: false
                },
                () => {
                    // this.showData('fadeIn')
                    this.showLoading('fadeOut');
                }
            );
        }
    }

    unsubSymbol() {
        const { symbol, exchanges } = this.dic.symbolInfo;
        if (!exchanges || !symbol) return;

        const exchange = exchanges[0];

        AllMarket.unsub([{ symbol, exchange }], this.id);
    }

    subSymbol() {
        return new Promise((resolve) => {
            const { symbol, exchanges } = this.dic.symbolInfo;
            if (!exchanges || !symbol) return;
            const exchange = exchanges[0];
            const channel = StreamingBusiness.getChannelLv1(exchange, symbol);
            Emitter.addListener(channel, this.id, (newData = {}) => {
                console.log(
                    'NEW ALERT PRICE REALTIME',
                    newData.symbol,
                    newData
                );
                Emitter.emit(this.dic.channelPrice, { data: newData }); // Realtime -> pub price
            });
            AllMarket.setIsAIO(false);
            AllMarket.sub([{ symbol, exchange }], this.id, resolve);
        });
    }
    pubSymbolToChild = (symbolInfo) => {
        Emitter.emit(Channel.getChannelAlertSymbol(), symbolInfo);
    };
    handleUpdateHistorySearch = this.handleUpdateHistorySearch.bind(this);
    handleUpdateHistorySearch(symbolInfo) {
        if (!this.state.isHistory && this.dic.isLogin) {
            const historySymbol = this.getSymbolSaveHistory(symbolInfo);
            const checkSymbolExist = this.checkSymbolHistoryExist(
                this.dic.listHistory,
                historySymbol
            );
            if (!checkSymbolExist) {
                // Lấy ra symbol cần lưu lại history, nếu là thằng con thì lưu thằng cha
                if (
                    this.dic.listHistory.length <
                    ENUM.NUMBER_HISTORY_SEARCH_SYMBOL
                ) {
                    this.dic.listHistory.unshift(historySymbol);
                } else {
                    this.dic.listHistory.pop();
                    this.dic.listHistory.unshift(historySymbol);
                }
            } else {
                // Lấy ra symbol cần lưu lại history, nếu là thằng con thì lưu thằng cha
                if (
                    this.dic.listHistory.length <
                    ENUM.NUMBER_HISTORY_SEARCH_SYMBOL
                ) {
                    this.dic.listHistory = this.dic.listHistory.filter(
                        (item) => {
                            return item.symbol !== historySymbol.symbol;
                        }
                    );
                    this.dic.listHistory.unshift(historySymbol);
                } else {
                    this.dic.listHistory = this.dic.listHistory.filter(
                        (item) => {
                            return item.symbol !== historySymbol.symbol;
                        }
                    );
                    this.dic.listHistory.unshift(historySymbol);
                }
            }
            this.setAlertSearchHistory();
            this.filterHistoryByClass();
        }
    }
    handleShowDetailAlertFromWatchList = () => {
        const { symbolSelected } = this.props;
        if (symbolSelected) {
            const symbolInfo = func.getSymbolObj(symbolSelected);
            this.onPressResultSearch({ symbolInfo });
        }
    };
    async onPressResultSearch({ symbolInfo }) {
        // Nếu bấm vào history thì ko lưu history search
        this.handleUpdateHistorySearch(symbolInfo);
        // Pub name symbol
        this.pubSymbolToChild(symbolInfo);
        // Pub loading
        Emitter.emit(Channel.getChannelAlertLoading(), true);
        // If click tu search news thi khong show detail
        if (this.props.isNews) {
            this.props.onClickSearchNews &&
                this.props.onClickSearchNews(symbolInfo);
            this.handleCancelSearch();
            return;
        }
        this.dic.isShowDetail = true;
        this._alertSlidingPanel && this._alertSlidingPanel.show();
        setTimeout(async () => {
            this.dic.isPriceStreaming && (await this.unsubSymbol()); // unsub old symbol
            this.dic.symbolInfo = symbolInfo;
            this.dic.isPriceStreaming && this.subSymbol(); // unsub old symbol
            const { symbol, class: symbolClass } = symbolInfo;
            const company =
                symbolInfo.security_name ||
                symbolInfo.company_name ||
                symbolInfo.company;
            const displayName = FunctionUtil.getDisplayName(symbol);
            this.updateSymbol({ symbol, displayName, symbolClass, company });
            this.dic.refTextSearch && this.dic.refTextSearch.blur();
            const symbolObj = this.getSymbolObj();
            this.dic.isShowDetail = true;
            if (!this.props.isNews) {
                this.showButtonConfirm();
            }
            if (this.props.isNews) {
                this.props.navigator.dismissModal();
                this.props.onClickSearchNews &&
                    this.props.onClickSearchNews(symbolInfo);
            } else {
                this._alertSlidingPanel &&
                    this._alertSlidingPanel.getSnapshot({ symbolObj });
                this._alertSlidingPanel &&
                    this._alertSlidingPanel.getNewsToday(symbol);
            }
        }, 100);
    }
    showButtonConfirm = () => {
        Emitter.emit(Channel.getChannelUpdateStatusButtonConfirmAlert(), {
            status: TYPE.SHOW
        });
    };
    hiddenDetail = () => {
        this.dic.isShowDetail = false;
        // this.dic.refTextSearch && this.dic.refTextSearch.focus()
        Keyboard.dismiss();
        this.setState({});
    };
    handleUpdateSearchBar = (statusDetail) => {
        this.refSearchBar && this.refSearchBar.updateSearchBar(statusDetail);
    };
    getClassQuery() {
        switch (this.dic.selectedClass) {
            case SYMBOL_CLASS.EQUITY:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.EQUITY];
            case SYMBOL_CLASS.ETFS:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ETFS];
            case SYMBOL_CLASS.MF:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.MF];
            case SYMBOL_CLASS.WARRANT:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.WARRANT];
            case SYMBOL_CLASS.FUTURE:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.FUTURE];
            case SYMBOL_CLASS.OPTION:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.OPTION];
            default:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES];
        }
    }

    callbackSearch(listSymbol, selectedClass, textSearch) {
        if (selectedClass === this.dic.selectedClass && textSearch === this.dic.textSearch) {
            this.showLoading('fadeOut');
            if (listSymbol) {
                this.setState({
                    isHistory: false,
                    dataSource: listSymbol,
                    isNoData: listSymbol && listSymbol.length === 0,
                    isLoading: false
                });
            } else {
                this.setState({
                    isHistory: false,
                    dataSource: [],
                    isNoData: true,
                    isLoading: false
                });
            }
        }
    }

    checkHistory() {
        return !this.dic.textSearch;
    }

    renderHistoryBar() {
        return <View style={{ height: 8 }} />;
        return this.state.isHistory && this.dic.isLogin ? (
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginVertical: 8,
                    paddingLeft: 16
                }}
            >
                <MaterialIcon
                    name="history"
                    size={24}
                    style={{ color: CommonStyle.fontColor, paddingRight: 8 }}
                />
                <Text style={CommonStyle.textSub}>{I18n.t('History')}</Text>
            </View>
        ) : (
                <View style={{ height: 8 }} />
            );
    }

    handleCancelSearch = this.handleCancelSearch.bind(this);
    handleCancelSearch(cb) {
        Keyboard.dismiss();
        if (this.props.isNews) {
            const navigatorEventID = this.props.navigatorEventIDParents;
            this.emitter &&
                this.emitter.emit(navigatorEventID, {
                    id: 'hidden_edit_alert'
                });
            this.refViewWrapper && this.refViewWrapper.hide();
            setTimeout(() => {
                this.props.navigator &&
                    this.props.navigator.dismissAllModals({
                        animated: true, // does the pop have transition animation or does it happen immediately (optional)
                        animationType: 'none' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
                    });
                cb && cb();
            }, 300);
        } else {
            Controller.dispatch(changeScreenActive(ALERT_SCREEN.LIST_ALERT));
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            const navigatorEventID = this.props.navigatorEventIDParents;
            this.emitter &&
                this.emitter.emit(navigatorEventID, {
                    id: 'hidden_new_alert'
                });
            this.refViewWrapper && this.refViewWrapper.hide();
            setTimeout(() => {
                this.props.navigator &&
                    this.props.navigator.dismissAllModals({
                        animated: true, // does the pop have transition animation or does it happen immediately (optional)
                        animationType: 'none' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
                    });
            }, 300);
        }
    }
    setRefSearchBar = this.setRefSearchBar.bind(this);
    setRefSearchBar(ref) {
        this.refSearchBar = ref;
    }
    setRefTextInputSearch = this.setRefTextInputSearch.bind(this);
    setRefTextInputSearch(ref) {
        this.dic.refTextSearch = ref;
    }
    onReset = this.onReset.bind(this);
    onReset() {
        this.props.onResetTextSearch && this.props.onResetTextSearch();
        this.onSearch('');
        return true;
    }

    renderSearchBar2 = this.renderSearchBar2.bind(this);
    renderSearchBar2() {
        return (
            <SearchBar
                setting={this.props.setting}
                isConnected={this.props.isConnected}
                ref={this.setRefSearchBar}
                navigator={this.props.navigator}
                setRefInput={this.setRefTextInputSearch}
                onChangeText={this.onSearch}
                onCancel={this.handleCancelSearch}
                textSearch={this.state.textSearch}
                onReset={this.onReset}
                listItem={this.dic.listSymbolClass}
            />
        );
    }
    renderNetworkWarning() {
        if (this.props.isConnected) return <View />;
        return <NetworkWarning styles={{ zIndex: 2 }} />;
    }
    setRefRowLoading = (ref) => {
        this.refRowLoading = ref;
    };
    handleSearchInit = this.handleSearchInit.bind(this);
    handleSearchInit() {
        if (this.props.isNews) {
            if (this.props.textSearch) {
                this.onSearch(this.props.textSearch);
                this.getAlertSearchHistory(false);
                return this.dic.refTextSearch && this.dic.refTextSearch.focus();
            }
            this.getAlertSearchHistory();
            return this.dic.refTextSearch && this.dic.refTextSearch.focus();
        } else {
            if (this.props.symbolSelected) {
                // Exception khi switch form rồi back lại luôn -> add remove timeout
                this.timeoutGetAlertSearch &&
                    clearTimeout(this.timeoutGetAlertSearch);
                this.timeoutGetAlertSearch = setTimeout(() => {
                    this.getAlertSearchHistory();
                }, 1000);
                return true;
            } else {
                this.getAlertSearchHistory();
                this.dic.refTextSearch && this.dic.refTextSearch.focus();
            }
        }
    }
    handleOnDoneRowLoading = () => {
        if (this.props.isNews) {
            if (this.props.textSearch) {
                this.onSearch(this.props.textSearch);
                this.getAlertSearchHistory(false);
                return this.dic.refTextSearch && this.dic.refTextSearch.focus();
            }
            this.getAlertSearchHistory();
            return this.dic.refTextSearch && this.dic.refTextSearch.focus();
        } else {
            if (this.props.symbolSelected) {
                // Exception khi switch form rồi back lại luôn -> add remove timeout
                this.timeoutGetAlertSearch &&
                    clearTimeout(this.timeoutGetAlertSearch);
                this.timeoutGetAlertSearch = setTimeout(() => {
                    this.getAlertSearchHistory();
                }, 1000);
                return true;
            } else {
                this.getAlertSearchHistory();
                this.dic.refTextSearch && this.dic.refTextSearch.focus();
            }
        }
    };
    renderResultSearch() {
        return (
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }}
                    pointerEvents="box-none"
                >
                    {/* Hot fix khong show loading when search in watchlist */}
                    <RowLoading
                        animation={{
                            easing: 'linear',
                            0: {
                                opacity: 0
                            },
                            1: {
                                opacity: 0
                            }
                        }}
                        isShow={false}
                        ref={this.setRefRowLoading}
                    />
                </View>
                <View
                    style={{
                        flex: 1
                    }}
                >
                    {this.renderHaveData()}
                    {this.state.isNoData && this.state.textSearch !== '' ? (
                        <Animatable.View
                            animation={'fadeIn'}
                            duration={300}
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <KeyboardPushCenter>
                                <Text style={CommonStyle.textNoData}>
                                    {I18n.t('noData')}
                                </Text>
                            </KeyboardPushCenter>
                        </Animatable.View>
                    ) : null}
                </View>
            </View>
        );
    }

    setRefResultSearch = (ref) => {
        this.refResultSearch = ref;
    };
    renderHaveData() {
        return (
            <ResultSearch
                style={{ marginHorizontal: 0 }}
                ref={this.setRefResultSearch}
                data={this.state.dataSource}
                selectedClass={this.dic.selectedClass}
                textSearch={this.state.textSearch}
                onPressResultSearch={this.onPressResultSearch}
            />
        );
    }
    setRefAlertSlidingPanel = (ref) => {
        this._alertSlidingPanel = ref;
    };

    renderResultSearchWrapper = this.renderResultSearchWrapper.bind(this);
    renderResultSearchWrapper() {
        return (
            <TouchableWithoutFeedback isNested onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    {this.renderSearchBar2()}
                    <View
                        style={{
                            backgroundColor: CommonStyle.backgroundColor1,
                            width: '100%',
                            flex: 1,
                            paddingHorizontal: 16
                        }}
                    >
                        {this.renderHistoryBar()}
                        {this.renderResultSearch()}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
    setRefViewWrapper = (ref) => {
        this.refViewWrapper = ref;
    };
    render() {
        return (
            <TransitionView1
                onDone={() => { }}
                ref={this.setRefViewWrapper}
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColor1
                }}
            >
                {this.renderResultSearchWrapper()}
                <KeyboardSmart
                    _scrollContentValue={this.dic._scrollContentValue}
                    ref={(ref) => (this.refKeyboardSmart = ref)}
                    pointerEvents="box-none"
                    style={{
                        zIndex: 99,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: 0
                    }}
                >
                    <BackDropViewCustom
                        spaceTop={DEFAULT_HEGIHT}
                        _scrollValue={this.dic._scrollContainer}
                        opacityInterpolate={(translateY) =>
                            interpolate(translateY, {
                                inputRange: [
                                    -1,
                                    0,
                                    HEIGHT_DEVICE,
                                    HEIGHT_DEVICE + 1
                                ],
                                outputRange: [0.85, 0.85, 0, 0]
                            })
                        }
                    />
                    <AlertSlidingPanel
                        {...this.props}
                        handleShowDetailAlertFromWatchList={
                            this.handleShowDetailAlertFromWatchList
                        }
                        _scrollValue={this.dic._scrollValue}
                        _scrollContainer={this.dic._scrollContainer}
                        handleCancelSearch={this.handleCancelSearch}
                        scrollValueContainer={this.dic.scrollValueContainer}
                        onClose={this.hiddenDetail}
                        callBackHideDetail={this.hiddenDetail}
                        ref={this.setRefAlertSlidingPanel}
                    />
                </KeyboardSmart>
                <View
                    style={{
                        zIndex: 999,
                        position: 'absolute',
                        justifyContent: 'flex-end',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }}
                    pointerEvents="box-none"
                >
                    <ButtonConfirm
                        _scrollValue={this.dic._scrollContainer}
                        scrollContainerValue={this.dic.scrollValueContainer}
                        status={TYPE.HIDDEN}
                    />
                </View>
            </TransitionView1>
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
        settingAction: bindActionCreators(settingAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAlert);
