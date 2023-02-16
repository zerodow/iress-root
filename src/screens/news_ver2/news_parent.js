import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    Dimensions,
    PixelRatio,
    TouchableOpacity,
    Keyboard,
    InteractionManager,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    LayoutAnimation,
    UIManager
} from 'react-native';
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Animated, { Easing } from 'react-native-reanimated';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as newsActions from './news.actions';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import * as Business from '~/business';
import NewsWatchlist from './related_news';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import {
    logAndReport,
    removeItemFromLocalStorage,
    offTouchIDSetting,
    logDevice,
    switchForm,
    readOverviewNotiNew,
    deleteAllNoti,
    setDicReAuthen,
    deleteAllNotiNews,
    showNewsDetail,
    getIdModalPicker,
    pushToVerifyMailScreen,
    checkNewTag,
    getUniqueList,
    setRefTabbar
} from '../../lib/base/functionUtil';
import { func, dataStorage } from '../../storage';
import NewsEverything from './everything';
import CustomIcon from '~/component/Icon';
import FallHeader from '~/component/fall_header';
import ModalPicker from './../modal_picker/modal_picker_ver2';
import filterType from '../../constants/filter_type';
import newsCount from '../../constants/news_count';
import BadgeIcon from '../../component/badge/badge';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import { TAGS, TIME } from '../../constants/news';
import ScreenId from '../../constants/screen_id';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter';
import * as Util from '../../util';
import * as translate from '../../../src/invert_translate';
import XComponent from '../../component/xComponent/xComponent';
import Enum from '../../enum';
import * as NewsBusiness from '../../streaming/news';
import * as StreamingBusiness from '../../streaming/streaming_business';
import StateApp from '~/lib/base/helper/appState';

import * as Controller from '../../memory/controller';
import * as ManageConection from '../../manage/manageConnection';
import BottomTabBar from '~/component/tabbar';
import Header from '../../../src/component/headerNavBar/index';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CustomDate from '~/component/customDate';
import TabView from '~/component/tabView';
import TabViewV2 from '~/component/tabView2';
import SearchBar from '~/component/search_bar/search_bar';
import * as timeUtils from '~/lib/base/dateTime';
import {
    getAllTagNewSelected,
    isSelectAll
} from '~s/alert_function/functionCommon';
/* icon import region */
import filter from '~/img/iconVer2/filled-filter-24.png';
import NewsContent from './newContent';
import * as newsControl from './controller';
import * as model from './model';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import Icons from '@component/headerNavBar/icon';
import VietNamQueue from '@lib/vietnam-queue';
import * as setTestId from '~/constants/testId';
function getStartDay() {
    let start = new Date();
    return start.setHours(0, 0, 0, 0);
}
function getEndDay() {
    let end = new Date();
    return end.setHours(23, 59, 59, 999);
}
const AllNewsRealtimeQueue = new VietNamQueue();
const RelatedNewsRealtimeQueue = new VietNamQueue();
const { TAB_NEWS, SUB_ENVIRONMENT } = Enum;
const { height: heightDevices, width: widthDevices } = Dimensions.get('screen');
const arrTabs = [
    {
        label: I18n.t('onWatchlist'),
        showBadge: true
    },
    {
        label: I18n.t('allMarket')
    }
];
export class NewsParent extends Component {
    constructor(props) {
        super(props);
        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
        this.stateApp = new StateApp(
            this.handleWakupApp,
            null,
            ScreenId.NEWS,
            false
        );
    }
    handleWakupApp = this.handleWakupApp.bind(this);
    handleWakupApp() {
        const isShowNewDetail = newsControl.getStatusNewDetail();
        if (isShowNewDetail) {
            return;
        }
        this.props.actions && this.props.actions.setLoading(true);
        this.getSnapshotData((res, currentTag) => {
            this.props.actions && this.props.actions.setLoading(false);
            this.setState({
                data: res,
                isLoadPage: false,
                isNodata: res.data.length === 0,
                tag: currentTag
            });
        });
    }
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.renderToLink = this.renderToLink.bind(this);
        this.getSnapshotData = this.getSnapshotData.bind(this);
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.onSelectedDuration = this.onSelectedDuration.bind(this);
        this.onCloseDuration = this.onCloseDuration.bind(this);
        this.onShowModalDurationPicker = this.onShowModalDurationPicker.bind(
            this
        );
        this.renderRightComp = this.renderRightComp.bind(this);
        this.applyDate = this.applyDate.bind(this);
        this.renderSearchBar = this.renderSearchBar.bind(this);
        this.showModalNewSearch = this.showModalNewSearch.bind(this);
        this.onClickSearch = this.onClickSearch.bind(this);
        this.renderDurationButton = this.renderDurationButton.bind(this);
        this.setDuration = this.setDuration.bind(this);
        this.getDuration = this.getDuration.bind(this);
        this.renderIcon = this.renderIcon.bind(this);
        this.onPressTargetNews = this.onPressTargetNews.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onSelectedTagNews = this.onSelectedTagNews.bind(this);
        this.resetSymbol = this.resetSymbol.bind(this);
        this.handleDataFlatList = this.handleDataFlatList.bind(this);
    }

    init() {
        const today = new Date().getTime();
        const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000;
        this.translateAnim = new Animated.Value(-100);
        this.heightHeaderAnim = new Animated.Value(164);
        this.heightHeaderAnimHalf = new Animated.Value(82);
        this.heightPickerAni = new Animated.Value(0);
        this.opacityHeaderAnim = new Animated.Value(1);
        this.paddingTop = new Animated.Value(140);
        // Channel
        this.channelMenuBadge = Enum.CHANNEL_COUNT.TAB_RELATED_NEWS;
        this.channelTabBadge = Enum.CHANNEL_COUNT.MENU_NEWS;
        this.isReadyToChangeTab = true;
        this.dic = {
            isready: Platform.OS === 'ios',
            currentNew: null,
            perf: new Perf(performanceEnum.show_form_news_parent),
            tab: TAB_NEWS.RELATED,
            page: 1,
            countChangeTab: 0,
            listNewsRealtime: []
        };
        this.state = {
            // modalVisible: false,
            symbolSearch: newsControl.getSymbolSearch(),
            modalDurationVisible: false,
            initialPage:
                newsControl.getCurrentTab() === TAB_NEWS.RELATED ? 0 : 1,
            showDatePicker: false,
            data: [],
            isLoadPage: true,
            tag: TAB_NEWS.RELATED
        };
    }
    //   #end region
    // --------- handle flow data -------------
    setDuration(duration, time) {
        newsControl.setDuration(duration, time);
    }
    getDuration() {
        const duration = newsControl.getDuration();
        return duration.type;
    }
    getSnapshotData(cb) {
        return model.loadNewsData(cb);
    }
    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            if (
                dataStorage.notifyObj &&
                dataStorage.notifyObj.news_id &&
                dataStorage.switchScreen === 'News'
            ) {
                this.openNoti();
                dataStorage.switchScreen = null;
            } else {
                switchForm(this.props.navigator, event);
            }
        }
        switch (event.id) {
            case 'hidden_edit_alert':
                func.setCurrentScreenId(ScreenId.NEWS);
                // this.handleWakupApp()
                this.refViewContent &&
                    this.refViewContent.fadeOutRowContentViewPort();
                this.refViewContent &&
                    this.refViewContent.fadeInDownContentViewPort();
                break;
            case 'hidden_new_order':
                func.setCurrentScreenId(ScreenId.NEWS);
                this.handleWakupApp();
                break;
            case 'hidden_news_detail':
                func.setCurrentScreenId(ScreenId.NEWS);
                newsControl.setStatusShowNewDetail(false);
                // this.handleWakupApp()
                // newsControl.resetData()
                // this.setState({ isLoadPage: true, data: { data: [] }, isNodata: false })
                // this.refViewContent && this.refViewContent.refLoading && this.refViewContent.refLoading.runAnimation({
                //     type: 'fadeInDown'
                // }, () => {
                //     this.getSnapshotData(this.handleDataFlatList)
                // })
                break;
            case 'willAppear':
                this.dic.perf &&
                    this.dic.perf.incrementCounter(
                        performanceEnum.show_form_news_parent
                    );
                setCurrentScreen(analyticsEnum.news);
                this.dic.currentNew = null;
                break;
            case 'didAppear':
                setRefTabbar(this.tabbar);
                if (dataStorage.isChangeAccount) {
                    dataStorage.isChangeAccount = false;
                }
                func.setCurrentScreenId(ScreenId.NEWS);
                // dataStorage.loadData = this.getSnapshotData(this.handleDataFlatList);
                readOverviewNotiNew();
                break;
            case 'willDisappear':
                break;
            case 'didDisappear':
                deleteAllNotiNews();
                break;
            default:
                break;
        }
    }
    openNoti() {
        const data = dataStorage.notifyObj.data;
        if (data && data.updated) {
            const curTime = new Date().getTime();
            const enabledTime = data.updated + 1200000;
            if (enabledTime <= curTime) {
                this.renderToLink(data);
            }
        }
        dataStorage.notifyObj = null;
    }
    onShowModalDurationPicker() {
        this.positionPickerDuration &&
            this.positionPickerDuration.measure(
                (fx, fy, width, height, px, py) => {
                    this.top = py + height + 8;
                    this.right = 16; // Px deo hieu sao width -px ra sai vi tri
                    this.setState({ modalDurationVisible: true });
                }
            );
    }
    handleResetTextSearchSymbol = () => {
        this.resetSymbol();
    };
    showModalNewSearch() {
        const symbol = newsControl.getSymbolSearch();
        const displaySymbol = Business.getSymbolName({ symbol });
        this.props.navigator.showModal({
            screen: Enum.SCREEN.NEW_ALERT,
            title: I18n.t('news'),
            backButtonTitle: ' ',
            // animated: true,
            // animationType: 'slide-up',
            passProps: {
                isNews: true,
                onClickSearchNews: this.onClickSearch,
                textSearch: displaySymbol,
                navigatorEventIDParents: this.props.navigator.navigatorEventID,
                onResetTextSearch: this.handleResetTextSearchSymbol
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecial,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        });
    }
    loadMore = this.loadMore.bind(this);
    loadMore(cbLoadDone) {
        if (this.timeOutLoadMore) clearTimeout(this.timeOutLoadMore);
        this.timeOutLoadMore = setTimeout(() => {
            cb = (res) => {
                cbLoadDone && cbLoadDone();
                if (!res.data) return;
                const newData = {
                    ...res,
                    data: this.state.data.data.concat(res.data)
                };
                this.handleDataFlatList(
                    newData,
                    newsControl.getCurrentTab(),
                    true
                );
            };
            newsControl.nextPage();
            model.loadNewsData(cb);
        }, 700);
    }
    onPressTargetNews() {
        const selectedTag = newsControl.getTagNews();
        this.refTagNew &&
            this.refTagNew.measure((fx, fy, width, height, px, py) => {
                this.props.navigator.showModal({
                    screen: 'equix.TargetNewModal',
                    animated: false,
                    animationType: 'none',
                    navigatorStyle: {
                        ...CommonStyle.navigatorModalSpecialNoHeader,
                        modalPresentationStyle: 'overCurrentContext'
                    },
                    passProps: {
                        onCancel: this.onCancel,
                        onPressBackdrop: this.onCancel,
                        onDone: this.onSelectedTagNews,
                        top: py + height + 8,
                        right: widthDevices - px - width,
                        value: selectedTag,
                        isNews: true
                    }
                });
            });
    }
    // --------------- end of handle data flow --------------

    // -----------------user Action region -----------------
    onChangeTabTabView(index) {
        newsControl.resetData();
        let tab = TAB_NEWS.RELATED;
        index !== 0 ? (tab = TAB_NEWS.ALL) : (tab = TAB_NEWS.RELATED);
        newsControl.setCurrentTab(tab);
        this.dic.tab = tab;
        const { type } = newsControl.getDuration();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            isLoadPage: true,
            data: { data: [] },
            isNodata: false
        });
        this.dic.countChangeTab += 1;
        this.refViewContent &&
            this.refViewContent.refViewContentData &&
            this.refViewContent.refViewContentData.animate({
                easing: 'linear',
                0: {
                    opacity: 0
                },
                1: {
                    opacity: 0
                }
            });
        this.refViewContent &&
            this.refViewContent.refLoading &&
            this.refViewContent.refLoading.runAnimation &&
            this.refViewContent.refLoading.runAnimation({
                type: dataStorage.animationDirection
            });
        this.onChangeTabCallBack(index, this.dic.countChangeTab);

        // this.onPressHandler && this.onPressHandler(index)
    }
    onCloseDuration() {
        this.setState({ modalDurationVisible: false });
    }
    onCancel() {
        this.props.navigator.dismissModal({
            animated: false,
            animationType: 'none'
        });
    }
    onSelectedDuration(typeDuration) {
        try {
            if (typeDuration === this.getDuration()) {
                return;
            }
            newsControl.resetData();
            this.setState({
                isLoadPage: true,
                data: { data: [] },
                isNodata: false
            });
            this.setDuration(typeDuration);
            const duration = this.getDuration();
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
            this.setState(
                {
                    modalDurationVisible: false,
                    data: {},
                    showDatePicker: duration === 'custom'
                },
                () => {
                    this.refViewContent &&
                        this.refViewContent.refLoading &&
                        this.refViewContent.refLoading.runAnimation &&
                        this.refViewContent.refLoading.runAnimation({
                            type: 'fadeInDown'
                        });
                    this.getSnapshotData(this.handleDataFlatList);
                }
            );
        } catch (error) {
            logDevice('info', `save type filter News failed ${error}`);
        }
    }
    onChangeTab(tabInfo) {
        // this.setState({ isLoadPage: true })
        // this.onChangeTabCallBack(tabInfo)
    }
    handleDataFlatList(
        res,
        resTag = TAB_NEWS.RELATED,
        isLoadMore,
        countChangeTab
    ) {
        const currentTag = newsControl.getCurrentTab();
        // console.log('====> current tag', currentTag)
        if (!res.data) {
            this.refViewContent &&
                this.refViewContent.refLoading &&
                this.refViewContent.refLoading.runAnimation &&
                this.refViewContent.refLoading.runAnimation({
                    type: 'fadeOut'
                });
            this.refViewContent &&
                this.refViewContent.refViewContentData &&
                this.refViewContent.refViewContentData.animate(
                    {
                        easing: 'linear',
                        0: {
                            opacity: 0
                        },
                        1: {
                            opacity: 1
                        }
                    },
                    300
                );
            this.setState({
                data: {
                    total_count: 0,
                    total_pages: 0,
                    current_page: 1,
                    data: []
                },
                isLoadPage: false,
                isNodata: true,
                tag: currentTag
            });
        }
        if (isLoadMore) {
            this.setState({
                data: res,
                isLoadPage: false,
                isNodata: res.data.length === 0,
                tag: currentTag
            });
            return;
        }
        if (countChangeTab && countChangeTab !== this.dic.countChangeTab) {
            console.log('DCM new resTag', resTag, this.dic.tab);
            return;
        }
        this.refViewContent &&
            this.refViewContent.refLoading &&
            this.refViewContent.refLoading.runAnimation &&
            this.refViewContent.refLoading.runAnimation({
                type: 'fadeOut'
            });
        this.refViewContent &&
            this.refViewContent.refViewContentData &&
            this.refViewContent.refViewContentData.animate(
                {
                    easing: 'linear',
                    0: {
                        opacity: 0
                    },
                    1: {
                        opacity: 1
                    }
                },
                300
            );
        this.setState({
            data: res,
            isLoadPage: false,
            isNodata: !res.data || res.data.length === 0,
            tag: currentTag
        });
    }

    clearStoreDataRealtime = this.clearStoreDataRealtime.bind(this);
    clearStoreDataRealtime() {
        this.dic.listNewsRealtime.length = 0;
    }

    storeDataRealtime = this.storeDataRealtime.bind(this);
    storeDataRealtime({ data, type }) {
        try {
            const currentTag = newsControl.getCurrentTab();
            const newsLength = this.dic.listNewsRealtime.length;
            if (newsLength === 0) {
                this.dic.listNewsRealtime.push(data);
            } else {
                // Update
                for (let i = 0; i < newsLength; i++) {
                    const realtimeNewID = data.news_id;
                    const newID = this.dic.listNewsRealtime[i].news_id;
                    if (newID === realtimeNewID) {
                        // Merge object
                        this.dic.listNewsRealtime[i] = data;
                        console.log('DCM REALTIME NEWS UPDATE');
                        return;
                    }
                }
                // ADD
                console.log('DCM REALTIME NEWS ADD');
                this.dic.listNewsRealtime.unshift(data);
            }
        } catch (error) {}
    }
    checkInDay = () => {
        const { from, to, type } = newsControl.getDuration();
        if (type !== 'custom') return true;
        const startDay = getStartDay();
        const endDay = getEndDay();
        if (to < startDay) {
            return false;
        }
        return true;
    };
    mergeDataRealtime = this.mergeDataRealtime.bind(this);
    mergeDataRealtime({ type, resolve }) {
        // Ghép data news realtime vào data snapshot(redux)
        // this.props.actions.mergeNewsRealtime(this.dic.listNewsRealtime, 'TAB_NEWS.RELATED')
        const symbolSearch = newsControl.getSymbolSearch();
        const symbolRealtime =
            this.dic.listNewsRealtime && this.dic.listNewsRealtime.length
                ? this.dic.listNewsRealtime[0].symbol
                : '';
        console.log('DCM REALTIME', symbolSearch, symbolRealtime);
        if (
            !this.checkInDay() ||
            (symbolRealtime && symbolRealtime !== symbolSearch)
        ) {
            this.dic.listNewsRealtime.length = 0;
            console.log('DCM REALTIME REJECT REALTIME', this.state.data);
            resolve && resolve();
            return;
        }
        const currentData = PureFunc.clone(this.state.data);
        const newData = this.dic.listNewsRealtime.concat(currentData.data);
        currentData.data = newData;
        this.setState(
            {
                data: currentData
            },
            () => {
                this.dic.listNewsRealtime.length = 0;
                resolve && resolve();
            }
        );
    }

    queueALlNewsRealtime = this.queueALlNewsRealtime.bind(this);
    queueALlNewsRealtime({ data, type }) {
        AllNewsRealtimeQueue.push(
            () =>
                new Promise((resolve) => {
                    this.storeDataRealtime({ data, type });
                    this.mergeDataRealtime({ type, resolve });
                })
        );
    }

    queueRelatedNewsRealtime = this.queueRelatedNewsRealtime.bind(this);
    queueRelatedNewsRealtime({ data, type }) {
        RelatedNewsRealtimeQueue.push(
            () =>
                new Promise((resolve) => {
                    this.storeDataRealtime({ data, type });
                    this.mergeDataRealtime({ type, resolve });
                })
        );
    }

    updateRelatedNewStreaming = this.updateRelatedNewStreaming.bind(this);
    updateRelatedNewStreaming() {
        const event = StreamingBusiness.getChannelNews(TAB_NEWS.RELATED);
        this.idFormRelated = Emitter.addListener(
            event,
            this.dic.idForm,
            (data) => {
                console.log('DATA RELATED NEWS REALTIME', data);
                // Update reddot news when have news realtime
                // NewsBusiness.getCountAndUpdateTotalUnreaded()
                const newCountTotalNewUnRead =
                    newsControl.getTotalCountUnRead() + 1;
                newsControl.setTotalCountUnRead(newCountTotalNewUnRead);
                NewsBusiness.updateNumberNewsUnread(
                    this.channelMenuBadge,
                    newCountTotalNewUnRead
                );
                NewsBusiness.updateNumberNewsUnread(
                    this.channelTabBadge,
                    newCountTotalNewUnRead
                );
                this.queueRelatedNewsRealtime({ data, type: TAB_NEWS.RELATED });
            }
        );
    }

    updateAllNewStreaming = this.updateAllNewStreaming.bind(this);
    updateAllNewStreaming() {
        const event = StreamingBusiness.getChannelNews(TAB_NEWS.ALL);
        this.idFormAll = Emitter.addListener(event, this.dic.idForm, (data) => {
            console.log('DCM REALTIME DATA ALL NEWS REALTIME', data);
            this.queueALlNewsRealtime({ data, type: TAB_NEWS.ALL });
        });
    }

    subNewsRealtime = this.subNewsRealtime.bind(this);
    subNewsRealtime() {
        const currentTag = newsControl.getCurrentTab();
        this.unSubRealtimeNews();
        currentTag === TAB_NEWS.RELATED
            ? this.subRelatedNewsRealtime()
            : this.subAllNewsRealtime();
    }

    unSubRealtimeNews = this.unSubRealtimeNews.bind(this);
    unSubRealtimeNews() {
        // Unsub news realtime
        NewsBusiness.unSubNewByScreen('news', TAB_NEWS.ALL);
        NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED);
    }

    subRelatedNewsRealtime = this.subRelatedNewsRealtime.bind(this);
    subRelatedNewsRealtime() {
        // Sub news realtime
        const stringQuery = model.getStringQuerryFromDataStorage();
        if (!stringQuery) return;
        const listSymbolObject = Util.getListSymbolObject(stringQuery);
        NewsBusiness.sub(TAB_NEWS.RELATED, listSymbolObject, () => {
            console.log('DCM subRelatedNewsRealtime SUCCESS');
        });
    }

    subAllNewsRealtime = this.subAllNewsRealtime.bind(this);
    subAllNewsRealtime() {
        // Sub news realtime
        NewsBusiness.sub(TAB_NEWS.ALL, [], () => {
            console.log('DCM subAllNewsRealtime SUCCESS');
        });
    }

    onChangeTabCallBack(tabInfo, countChangeTab) {
        let tab = TAB_NEWS.RELATED;
        tabInfo && tabInfo !== 0
            ? (tab = TAB_NEWS.ALL)
            : (tab = TAB_NEWS.RELATED);
        this.timeOutChangeTab && clearTimeout(this.timeOutChangeTab);
        this.timeOutChangeTab = setTimeout(() => {
            newsControl.resetData();
            cb = (res) => {
                if (
                    countChangeTab &&
                    countChangeTab !== this.dic.countChangeTab
                ) {
 return;
}
                this.handleDataFlatList(res, tab, false, countChangeTab);
            };
            this.subNewsRealtime();
            this.getSnapshotData(cb);
        }, 1000);
    }

    onClickSearch(symbolObj) {
        const { symbol } = symbolObj;
        newsControl.resetData();
        newsControl.setSymbolSearch(symbolObj);
        newsControl.setPageId(1);
        if (this.state.symbolSearch === symbolObj.symbol) return;
        if (this.state.symbolSearch !== symbol) {
            this.setState({ symbolSearch: symbol });
            this.refViewContent &&
                this.refViewContent.refViewContentData &&
                this.refViewContent.refViewContentData.animate({
                    easing: 'linear',
                    0: {
                        opacity: 0
                    },
                    1: {
                        opacity: 0
                    }
                });
            this.refViewContent &&
                this.refViewContent.refLoading.runAnimation({
                    type: 'fadeIn'
                });
            this.getSnapshotData(this.handleDataFlatList);
        }
    }
    onSelectedTagNews(dicTagNewsSelected = {}) {
        if (
            JSON.stringify(dicTagNewsSelected) ===
            JSON.stringify(newsControl.getTagNews())
        ) {
            return;
        }
        newsControl.resetData();
        this.setState({
            isLoadPage: true,
            data: { data: [] },
            isNodata: false
        });
        newsControl.setTagNews(dicTagNewsSelected);
        newsControl.setPageId(1);
        this.onCancel();
        this.refViewContent &&
            this.refViewContent.refViewContentData &&
            this.refViewContent.refViewContentData.animate({
                easing: 'linear',
                0: {
                    opacity: 0
                },
                1: {
                    opacity: 0
                }
            });
        this.refViewContent &&
            this.refViewContent.refLoading &&
            this.refViewContent.refLoading.runAnimation &&
            this.refViewContent.refLoading.runAnimation({
                type: 'fadeInDown'
            });
        this.getSnapshotData(this.handleDataFlatList);
        // this.setState({})
    }
    resetSymbol() {
        newsControl.setSymbolSearch({ symbol: '' });
        newsControl.setPageId(1);
        if (this.state.symbolSearch === '') return;
        this.setState({ symbolSearch: '' });
        this.refViewContent &&
            this.refViewContent.refViewContentData &&
            this.refViewContent.refViewContentData.animate({
                easing: 'linear',
                0: {
                    opacity: 0
                },
                1: {
                    opacity: 0
                }
            });
        this.refViewContent &&
            this.refViewContent.refLoading &&
            this.refViewContent.refLoading.runAnimation &&
            this.refViewContent.refLoading.runAnimation({
                type: 'fadeIn'
            });
        this.getSnapshotData(this.handleDataFlatList);
    }
    applyDate(from, to) {
        newsControl.setPageId(1);
        this.setDuration('custom', { from, to });
        this.refViewContent &&
            this.refViewContent.refViewContentData &&
            this.refViewContent.refViewContentData.animate({
                easing: 'linear',
                0: {
                    opacity: 0
                },
                1: {
                    opacity: 0
                }
            });
        this.refViewContent &&
            this.refViewContent.refLoading &&
            this.refViewContent.refLoading.runAnimation &&
            this.refViewContent.refLoading.runAnimation({
                type: 'fadeInDown'
            });
        this.getSnapshotData(this.handleDataFlatList);
    }
    // --------end of user Action region --------------

    // --------render view region ------------
    renderIcon(name, cbAction, style) {
        if (!name) {
 return <Text style={{ fontSize: 24, fontWeight: 'bold' }}>?</Text>;
}
        return (
            <TouchableOpacityOpt
                style={{
                    paddingHorizontal: 16
                }}
                hitSlop={{
                    top: 8,
                    left: 8,
                    bottom: 8,
                    right: 8
                }}
                timeDelay={Enum.TIME_DELAY}
                setRef={(ref) => (this.refTagNew = ref)}
                // ref={ref => this.refTagNew = ref}
                {...setTestId.testProp('Id_equix_filter', 'Label_equix_filter')}
                onPress={() => {
                    cbAction && cbAction();
                }}
            >
                <CustomIcon
                    name={'equix_filter'}
                    size={20}
                    color={CommonStyle.fontColor}
                />
            </TouchableOpacityOpt>
        );
    }
    renderToLink(data) {
        const newID = data.news_id || '';
        showNewsDetail(newID, this.props.navigator, this.props.isConnected);
    }
    renderDurationButton() {
        return (
            <TouchableOpacityOpt
                hitSlop={{
                    top: 8,
                    left: 8,
                    bottom: 8,
                    right: 8
                }}
                style={{
                    paddingHorizontal: 16
                }}
                timeDelay={Enum.TIME_DELAY}
                onPress={this.onShowModalDurationPicker}
                {...setTestId.testProp('Id_equix_time', 'Label_equix_time')}
            >
                <CustomIcon
                    size={20}
                    name="equix_time"
                    color={CommonStyle.fontColor}
                />
            </TouchableOpacityOpt>
        );
        return (
            <MaterialIcon
                name={'access-time'}
                style={[CommonStyle.iconHeader, {}]}
                onPress={this.onShowModalDurationPicker}
            />
        );
    }
    renderSearchBar() {
        const symbol = newsControl.getSymbolSearch();
        const displaySymbol = Business.getSymbolName({ symbol });
        const title = !symbol ? I18n.t('findSymbol') : displaySymbol;
        const placeHolderStyle = !symbol ? { opacity: 0.5 } : {};
        return (
            <SearchBar
                placeHolderStyle={placeHolderStyle}
                prStype={{
                    backgroundColor: 'none',
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    paddingLeft: 0,
                    marginTop: 4
                }}
                onShowModalSearch={this.showModalNewSearch}
                testID="NewsSearchBar"
                disabled={!Controller.getLoginStatus()}
                title={title}
                onReset={this.resetSymbol}
                prStypeClose={{ position: 'absolute', right: 8, top: 5 }}
                isShowReset
            />
        );
    }
    renderCustomDate(isShow) {
        if (!isShow) return <View style={{ height: 8 }} />;
        const duration = newsControl.getDuration();
        let fromDate = duration.from;
        let toDate = duration.to;
        if (duration.type !== 'custom') {
            // Fix loi khi chuyen tab, hien thi no valid date
            const today = new Date().getTime();
            const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000;
            fromDate = oneWeekAgo;
            toDate = today;
        }
        return (
            <View style={{ height: 54 }}>
                <CustomDate
                    style={{
                        paddingBottom: 8,
                        height: this.state.heightCustomDate
                    }}
                    fromDate={fromDate}
                    toDate={toDate}
                    applyDate={this.applyDate}
                    isNews
                />
            </View>
        );
    }
    renderRightComp() {
        return (
            <View
                ref={(view) => view && (this.myComponent = view)}
                style={{
                    opacity: 1,
                    justifyContent: 'space-between',
                    display: 'flex',
                    flexDirection: 'row'
                }}
            >
                {this.renderIcon(
                    iconsMap['ios-funnel-outline'],
                    this.onPressTargetNews,
                    { height: 20, marginTop: 3 }
                )}
                <View
                    renderToHardwareTextureAndroid={true}
                    ref={(ref) => {
                        this.positionPickerDuration = ref;
                    }}
                >
                    {this.renderDurationButton()}
                </View>
            </View>
        );
    }
    setRefViewContent = (ref) => {
        this.refViewContent = ref && ref;
    };
    setRefPickerFake = (ref) => {
        this.refPickerFake = ref;
    };
    setDirectionAnimation = (from, to) => {
        if (from < to) {
            dataStorage.animationDirection = 'fadeInRight';
        } else if (from > to) dataStorage.animationDirection = 'fadeInLeft';
    };
    renderBadge = () => {
        return (
            <BadgeIcon
                style={{
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    marginLeft: 16
                }}
                badge={true}
                channel={Enum.CHANNEL_COUNT.TAB_RELATED_NEWS}
            />
        );
    };

    openMenu = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.toggleDrawer({
                side: 'left',
                animated: true
            });
        }
    };

    renderLeftComp = () => {
        return (
            <View style={{ left: -14 }}>
                <Icons
                    styles={{ paddingRight: 16 }}
                    name="ios-menu"
                    onPress={this.openMenu}
                    size={34}
                />
            </View>
        );
    };

    // --------end of render view region ------------
    render() {
        const WraperComponent =
            Platform.OS === 'ios' ? View : KeyboardAvoidingView;
        let allProps = {
            testID: 'alertSearch',
            style: {
                flex: 1
                // backgroundColor: CommonStyle.backgroundColor
            }
        };
        if (Platform.OS === 'android') {
            allProps.enabled = false;
            allProps.behavior = 'height';
            // allProps.keyboardVerticalOffset = 100
        }
        const durationType = this.getDuration();
        return (
            <WraperComponent {...allProps}>
                <FallHeader
                    ref={(ref) => ref && (this.headerRef = ref)}
                    style={{ backgroundColor: CommonStyle.backgroundColorNews }}
                    header={
                        <Header
                            leftIcon="ios-menu"
                            title={I18n.t('News')}
                            firstChildStyles={{ overflow: 'visible' }}
                            mainStyle={{
                                width: 'auto',
                                flex: 1
                            }}
                            rightStyles={{
                                flex: 0
                            }}
                            navigator={this.props.navigator}
                            style={{ marginLeft: 0, paddingTop: 16 }}
                            renderLeftComp={this.renderLeftComp}
                            renderRightComp={this.renderRightComp}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <View
                                    style={{
                                        width: 32,
                                        alignItems: 'flex-start',
                                        left: -8
                                    }}
                                />
                                <Animated.View
                                    style={{
                                        width: '80%'
                                        // borderWidth: 1,
                                        // borderColor: 'red'
                                        // opacity: this.opacityHeaderAnim
                                    }}
                                >
                                    {this.renderSearchBar()}
                                    <View style={{ paddingTop: 8 }}>
                                        {this.renderCustomDate(
                                            durationType === 'custom'
                                        )}
                                    </View>
                                    <TabViewV2
                                        setDirectionAnimation={
                                            this.setDirectionAnimation
                                        }
                                        onChangeTab={this.onChangeTabTabView.bind(
                                            this
                                        )}
                                        renderBadge={this.renderBadge}
                                        // translateAnim={this.translateAnim}
                                        styleTab={{
                                            paddingLeft: 0,
                                            // paddingRight: 32,
                                            paddingVertical: 16
                                        }}
                                        style={{
                                            justifyContent: 'flex-start'
                                        }}
                                        tabs={arrTabs}
                                        tabActiveIndex={this.state.initialPage}
                                    ></TabViewV2>
                                </Animated.View>
                            </View>
                        </Header>
                    }
                >
                    <BadgeIcon
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                            position: 'absolute',
                            right: 10,
                            top: 0
                        }}
                        badge={true}
                        channel={Enum.CHANNEL_COUNT.TAB_RELATED_NEWS}
                    />
                    <NewsContent
                        ref={this.setRefViewContent}
                        loadData={this.loadData}
                        data={this.state.data}
                        isLoadPage={this.state.isLoadPage}
                        isNodata={this.state.isNodata}
                        tag={this.state.tag}
                        loadMore={this.loadMore}
                        navigator={this.props.navigator}
                    />
                    <ModalPicker
                        testID="NewsModalPicker"
                        listItem={TIME}
                        onSelected={this.onSelectedDuration}
                        selectedValue={durationType}
                        right={this.right ? this.right : 0}
                        top={this.top ? this.top : 0}
                        visible={this.state.modalDurationVisible}
                        // position={this.positionPickerDuration}
                        onClose={this.onCloseDuration}
                    />
                    <BottomTabBar
                        navigator={this.props.navigator}
                        ref={(ref) => {
                            this.tabbar = ref;
                            setRefTabbar(ref);
                        }}
                    />
                </FallHeader>
            </WraperComponent>
        );
    }
    componentWillReceiveProps(nextProps) {
        if (
            nextProps.isConnected &&
            nextProps.isConnected !== this.props.isConnected
        ) {
            const currentTag = newsControl.getCurrentTab();
            this.setState({
                data: {
                    total_count: 0,
                    total_pages: 0,
                    current_page: 1,
                    data: []
                },
                isLoadPage: false,
                isNodata: false,
                tag: currentTag
            });
            this.refViewContent &&
                this.refViewContent.refLoading &&
                this.refViewContent.refLoading.runAnimation &&
                this.refViewContent.refLoading.runAnimation({
                    type: 'fadeIn'
                });
            this.getSnapshotData(this.handleDataFlatList);
        }
    }
    componentDidMount() {
        ManageConection.dicConnection.screenId = ScreenId.NEWS;
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental &&
                UIManager.setLayoutAnimationEnabledExperimental(true);
        }
        const durationType = this.getDuration();
        // Staging trỏ vào mac dinh no data nen khong can realtime
        if (
            config.environment === 'STAGING' &&
            config.subEnvironment === SUB_ENVIRONMENT.EQUIX_DEMO
        ) {
            return;
        }
        this.updateAllNewStreaming();
        this.updateRelatedNewStreaming();
        this.subNewsRealtime();
    }
    loadData = () => {
        this.getSnapshotData(this.handleDataFlatList);
    };
    componentWillUnmount() {
        // super.componentWillUnmount()
        newsControl.resetData();
        ManageConection.unRegisterSnapshot(ScreenId.NEWS);
        this.unSubRealtimeNews();
        // Unsub update realtime
        Emitter.deleteByIdEvent(this.idFormAll);
        Emitter.deleteByIdEvent(this.idFormRelated);
        if (this.timeOutLoadMore) {
            clearTimeout(this.timeOutLoadMore);
        }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        news: state.news,
        relatedFilterType: state.news.relatedFilterType,
        everythingFilterType: state.news.everythingFilterType,
        isConnected: state.app.isConnected,
        textFontSize: state.setting.textFontSize
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(newsActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsParent);
