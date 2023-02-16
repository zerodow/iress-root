import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    PixelRatio,
    Dimensions,
    TextInput,
    ScrollView,
    Keyboard,
    Animated,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    ListView
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import config from '../../config';
import firebase from '../../firebase';
import PriceActions from '../price/price.reducer';
import searchDetailActions from './search_detail.reducer';
import searchOrderActions from './search_order.reducer';
import searchNewsActions from './search_new.reducer';

import styles from './style/universal_search';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    logAndReport,
    getDisplayName,
    setStyleNavigation,
    searchAndSort,
    searchResponse,
    getSymbolInfoApi,
    pushToVerifyMailScreen,
    isIphoneXorAbove
} from '../../lib/base/functionUtil';
import { func, dataStorage } from '../../storage';
import NetworkWarning from '../../component/network_warning/network_warning';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning';
import userType from '../../constants/user_type';
import I18n from '../../modules/language';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { iconsMap } from '../../utils/AppIcons';
import SearchDetail from './search_detail.2';
import ProgressBar from '../../modules/_global/ProgressBar';
import deviceModel from '../../constants/device_model';
import TouchSearchGesture from '../../img/one-touch.png';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import ScreenId from '../../constants/screen_id';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import ResultSearch from '../../component/result_search/result_search';
import XComponent from '../../component/xComponent/xComponent';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import ENUM from '../../enum';
import ScrollBarUndeline from '../../component/scrollbar_underline/scrollbar_underline';
import * as Animatable from 'react-native-animatable';
import * as searchActions from './universal_search.actions';
import * as api from '../../api';
import * as Business from '../../business';
import * as Emitter from '@lib/vietnam-emitter';
import * as Controller from '../../../src/memory/controller';

const { width, height } = Dimensions.get('window');
const { SYMBOL_CLASS, SYMBOL_CLASS_QUERY } = ENUM;
export class UniversalSearch extends XComponent {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        this.init();
    }

    init() {
        this.dic = {
            selectedClass: SYMBOL_CLASS.ALL_TYPES,
            listHistory: [],
            dicHistoryByClass: {},
            timeout: null,
            textSearch: '',
            deviceModel: dataStorage.deviceModel,
            isStartAnim: false,
            channelReqReload: `channel_req_reload##${this.id}`,
            channelResReload: `channel_res_reload##${this.id}`,
            nav: this.props.navigator,
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
                    id: SYMBOL_CLASS.OPTION,
                    label: I18n.t(SYMBOL_CLASS.OPTION),
                    action: this.onSelectSymbolClass
                }
            ]
        };

        this.state = {
            isRefresh: false,
            searchResultHeightAnim: new Animated.Value(0),
            searchResultHeight: 0,
            isShowSearchResult: true,
            isFetching: true,
            index: 0,
            keyboardHeight: 0,
            textSearch: this.props.displayName || '',
            listData: [],
            isHistory: true,
            isShowKeyboard: false,
            listHistory: [],
            symbol: '',
            isLoading: this.props.isLoading || false,
            marginAnimation: 0,
            isUnique: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => {
                    return r1 !== r2;
                }
            })
        };
    }

    bindAllFunc() {
        this.getClassQuery = this.getClassQuery.bind(this);
        this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this);
        this.filterHistoryByClass = this.filterHistoryByClass.bind(this);
        this.getSearchHistory = this.getSearchHistory.bind(this);
        this.getSearchHistoryByClass = this.getSearchHistoryByClass.bind(this);
        this.showDetail = this.showDetail.bind(this);
        this.clodeModal = this.closeModal.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
        this.callbackSearch = this.callbackSearch.bind(this);
        this.getWidthSearch = this.getWidthSearch.bind(this);
        this.getWidthCancel = this.getWidthCancel.bind(this);
        this.getWidthTextCancel = this.getWidthTextCancel.bind(this);
        this.searchResultAnimation = this.searchResultAnimation.bind(this);
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                default:
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    setCurrentScreen(analyticsEnum.universalSearch);
                    const text =
                        this.props.displayName && this.props.typeNews
                            ? this.props.displayName
                            : '';
                    this.dic.textSearch = text;
                    this.setState({ textSearch: text });
                    this.getSearchHistory();
                    break;
                case 'didAppear':
                    if (dataStorage.backNewsDetail) {
                        dataStorage.backNewsDetail = false;
                    }
                    func.setCurrentScreenId(ScreenId.UNIVERSAL_SEARCH);
                    setTimeout(() => {
                        this.refs.textInput && this.refs.textInput.focus();
                    }, 500);
                    break;
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }

    stopLoading() {
        this.setState({
            isRefresh: false
        });
    }

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
            default:
                return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES];
        }
    }

    onSelectSymbolClass(selectedClass) {
        this.dic.selectedClass = selectedClass;
        if (!this.dic.textSearch) {
            this.getSearchHistoryByClass();
        } else {
            this.loadData(this.dic.textSearch);
        }
    }

    getSearchHistoryByClass() {
        const dicSearchHistoryByClass =
            (this.dic.dicHistoryByClass &&
                this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
            [];
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(
                dicSearchHistoryByClass
            ),
            listData: dicSearchHistoryByClass,
            isLoading: false
        });
    }

    filterHistoryByClass() {
        this.dic.dicHistoryByClass = Business.filterSymbolByClass(
            this.dic.listHistory
        );
    }

    getSearchHistory() {
        if (!Controller.getLoginStatus()) {
            this.setState({
                isFetching: false,
                isLoading: false
            });
        } else {
            this.perf = new Perf(performanceEnum.get_search_history);
            const userId = func.getUserId();
            const urlGet = api.getUrlUserSettingByUserId(userId, 'get');
            api.requestData(urlGet, true).then((data) => {
                if (data) {
                    const lang = data.lang || 'en';
                    Controller.setLang(lang);
                    this.state.isFetching = false;
                    this.dic.listHistory =
                        data && data.search_history ? data.search_history : [];
                    this.filterHistoryByClass();
                    let stringQuery = ``;
                    for (let i = 0; i < this.dic.listHistory.length; i++) {
                        const element = this.dic.listHistory[i];
                        stringQuery += `${element.symbol},`;
                    }
                    if (stringQuery !== '') {
                        getSymbolInfoApi(stringQuery, () => {
                            this.loadData('');
                        });
                    } else {
                        this.loadData('');
                    }
                    this.perf.stop();
                } else {
                    this.setState({
                        isFetching: false,
                        isLoading: false
                    });
                }
            });
        }
    }

    callbackSearch(listSymbol) {
        if (listSymbol && listSymbol.length) {
            const symbol = listSymbol[0].symbol;
            let margin = 0;
            const len = listSymbol.length;
            const marTop =
                Platform.OS === 'ios' ? (isIphoneXorAbove() ? 78 : 47) : 47;
            const heightCustom = 55;
            let isUnique = false;
            if (len > 4) {
                margin = heightCustom * 4 + marTop;
            } else if (len === 1) {
                margin = isIphoneXorAbove() ? 80 : 48;
                isUnique = true;
            } else {
                margin = len * heightCustom + marTop;
            }

            if (this.unSubRealtimeSearchDetail) {
                this.unSubRealtimeSearchDetail(this.state.symbol);
            }
            this.setState(
                {
                    isFetching: false,
                    listData: listSymbol,
                    dataSource: this.state.dataSource.cloneWithRows(listSymbol),
                    isHistory: false,
                    symbol,
                    isLoading: false,
                    marginAnimation: margin,
                    isUnique,
                    tipStep: 2
                },
                () => {
                    // Animated -> Vẽ ra với max height
                    Animated.timing(this.state.searchResultHeightAnim, {
                        toValue: 240, // max height
                        duration: 100
                    }).start();
                    this.reloadSearchDetail(symbol);
                    if (listSymbol.length === 1) {
                        this.perf && this.perf.stop();
                        this.props.actions.writeDataSuccess();
                        const company =
                            listSymbol[0].company_name ||
                            listSymbol[0].company ||
                            '';
                        this.props.actions.saveHistory({
                            symbol: listSymbol[0].symbol,
                            company
                        });
                    }
                }
            );
        } else {
            this.setState(
                {
                    isFetching: false,
                    listData: [],
                    index: 0,
                    dataSource: this.state.dataSource.cloneWithRows([]),
                    isHistory: true,
                    symbol: '',
                    isLoading: false
                },
                () => {
                    this.perf && this.perf.stop();
                }
            );
        }
    }

    reloadSearchDetail(symbol) {
        this.props.setSearchSymbol(symbol || '');
        this.props.changeDisplayName(func.getDisplayNameSymbol(symbol));
        this.props.resetPageSizeNews();
        this.props.resetAllQuantityOrder();

        if (this.reloadSearchDetailData) {
            this.reloadSearchDetailData();
        }
        // if (this.reloadWatchListInfo) {
        // 	this.reloadWatchListInfo();
        // }
    }

    loadData(text) {
        this.perf = new Perf(performanceEnum.load_data_form_universal_search);
        this.perf && this.perf.start();
        const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
        const cb = this.callbackSearch;
        const classQuery = this.getClassQuery();
        this.dic.textSearch = textSearch;
        if (textSearch.length > 0) {
            searchResponse({ textSearch, cb, classQuery });
        } else {
            const dicSearchHistoryByClass =
                (this.dic.dicHistoryByClass &&
                    this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
                [];
            this.setState({
                isFetching: false,
                listData: dicSearchHistoryByClass,
                index: 0,
                dataSource: this.state.dataSource.cloneWithRows(
                    dicSearchHistoryByClass
                ),
                isHistory: true,
                symbol: '',
                isLoading: false,
                marginAnimation: 0,
                isUnique: false
            });
        }
    }

    searchSymbol(text) {
        if (text === '') {
            const dicSearchHistoryByClass =
                (this.dic.dicHistoryByClass &&
                    this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
                [];
            if (Controller.isPriceStreaming()) {
                Business.unSubByScreen('search_detail');
            }
            this.dic.textSearch = text;
            this.setState({
                textSearch: text,
                index: 0,
                isFetching: false,
                listData: dicSearchHistoryByClass,
                dataSource: this.state.dataSource.cloneWithRows(
                    dicSearchHistoryByClass
                ),
                isHistory: true,
                symbol: '',
                isLoading: false,
                marginAnimation: 0,
                isUnique: false
            });
        } else {
            this.dic.timeout && clearTimeout(this.dic.timeout);
            let loading = false;
            if (text.length > 0) {
                loading = true;
                this.dic.timeout = setTimeout(() => {
                    this.loadData(text);
                }, 700);
            }
            this.setState({ textSearch: text, isLoading: loading });
        }
    }

    closeModal() {
        Keyboard.dismiss();
        this.dic.textSearch = '';
        this.setState({ textSearch: '' });
        this.dic.nav.dismissModal({
            animated: true,
            animationType: 'slide-down'
        });
    }

    showDetail(symbol, company, classSymbol, animated) {
        if (this.clicked) return;
        this.clicked = true;
        // setTimeout(() => {
        // 	this.clicked = false
        // }, 500);
        Keyboard.dismiss();
        const subSymbol = func.getSymbolObj(symbol) || data;
        if (subSymbol.master_code) {
 this.props.actions.saveHistory({
                symbol: subSymbol.master_code,
                company
            });
} else this.props.actions.saveHistory({ symbol, company });
        // this.props.actions.saveHistory({ symbol, company });
        this.dic.nav.push({
            screen: 'equix.SearchDetail',
            title: I18n.t('search', { locale: this.props.setting.lang }),
            backButtonTitle: '',
            animated: true,
            animationType: 'slide-horizontal',
            passProps: {
                isBackground: false,
                symbol: symbol,
                login: this.props.login,
                channelReqReload: this.dic.channelReqReload,
                channelResReload: this.dic.channelResReload,
                didShow: () => {
                    this.clicked = false;
                }
            },
            navigatorButtons: {
                leftButtons: [
                    {
                        title: '',
                        id: 'back_button',
                        icon:
                            Platform.OS === 'ios'
                                ? iconsMap['ios-arrow-back']
                                : iconsMap['md-arrow-back']
                    }
                ],
                rightButtons: !Controller.isPriceStreaming()
                    ? [
                          {
                              title: 'Refresh',
                              id: 'search_refresh',
                              icon: iconsMap['ios-refresh-outline']
                          }
                      ]
                    : []
            },
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

    componentDidMount() {
        super.componentDidMount();
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide.bind(this)
        );
        Emitter.addListener(this.dic.channelResReload, this.id, () => {
            this.setState({
                isRefresh: false
            });
        });
    }

    componentWillUnmount() {
        if (Controller.isPriceStreaming()) {
            Business.unSubByScreen('search_detail');
        }
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        super.componentWillUnmount();
    }

    _keyboardDidShow(e) {
        // height history label = 30
        // view paddingTop = 16
        const keyboardHeight = e.endCoordinates.height || 0;
        this.setState({ isShowKeyboard: true, keyboardHeight });
    }

    _keyboardDidHide() {
        const keyboardHeight = 0;
        this.setState({ isShowKeyboard: false, keyboardHeight });
    }

    onScrollBack() {
        this.refs && this.refs.textInput.focus();
    }

    renderFooter() {
        return (
            <View
                style={{
                    borderTopWidth: 1,
                    borderColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            ></View>
        );
    }

    _renderRow(rowData, sectionID, rowID) {
        return rowData.symbol ? (
            <ResultSearch
                isHistory={this.state.isHistory}
                key={`${rowID}added`}
                data={rowData}
                onPressFn={this.showDetail.bind(this)}
            />
        ) : null;
    }

    onLayout(e, maxHeight) {
        const height = e.nativeEvent.layout.height;
        this.setState({
            searchResultHeight: height > maxHeight ? maxHeight : height
        });
    }

    searchResultAnimation(toValue, duration) {
        this.dic.isStartAnim = true;
        Animated.timing(this.state.searchResultHeightAnim, {
            toValue,
            duration
        }).start();
        setTimeout(() => {
            this.dic.isStartAnim = false;
        }, duration);
    }

    getWidthSearch() {
        if (Controller.isPriceStreaming()) return '76%';
        if (
            Controller.isPriceStreaming() !== userType.Streaming &&
            !this.state.isHistory &&
            PixelRatio.getFontScale() > 1
        ) {
 return '65%';
}
        if (
            Controller.isPriceStreaming() !== userType.Streaming &&
            !this.state.isHistory &&
            PixelRatio.getFontScale() <= 1
        ) {
 return '70%';
}
        return PixelRatio.getFontScale() > 1 ? '70%' : '76%';
    }

    getWidthCancel() {
        if (Controller.isPriceStreaming()) return '24%';
        if (
            !Controller.isPriceStreaming() &&
            !this.state.isHistory &&
            PixelRatio.getFontScale() > 1
        ) {
 return '35%';
}
        if (
            !Controller.isPriceStreaming() &&
            !this.state.isHistory &&
            PixelRatio.getFontScale() <= 1
        ) {
 return '30%';
}
        return PixelRatio.getFontScale() > 1 ? '29%' : '24%';
    }

    getWidthTextCancel() {
        if (Controller.isPriceStreaming()) return '100%';
        if (!Controller.isPriceStreaming() && !this.state.isHistory) {
 return '75%';
}
        return '100%';
    }

    render() {
        const heightForFive = Platform.OS === 'ios' ? 240 : 235;
        const widthSearch = this.getWidthSearch();
        const widthCancel = this.getWidthCancel();
        const widthTextCancel = this.getWidthTextCancel();
        const widthInputSearch = '80%';
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: config.colorVersion,
                    paddingTop: Platform.OS === 'ios' ? 16 : 0
                }}
                testID="universalSearch"
            >
                <View style={CommonStyle.searchBarContainer2}>
                    <View
                        style={[
                            styles.searchBar2,
                            {
                                width: widthSearch,
                                marginLeft: 8,
                                borderRadius: 4
                            }
                        ]}
                    >
                        <Icon name="ios-search" style={[styles.iconSearch2]} />
                        <TextInput
                            ref="textInput"
                            testID="universalSearchInput"
                            // selectionColor={'#FFFFFF'}
                            style={[
                                {
                                    backgroundColor: 'transparent',
                                    color: 'rgba(255, 255, 255, 087)',
                                    fontSize: CommonStyle.fontSizeS,
                                    fontFamily: CommonStyle.fontFamily,
                                    width: widthInputSearch,
                                    paddingTop: 0,
                                    paddingBottom: 0
                                }
                            ]}
                            underlineColorAndroid="transparent"
                            blurOnSubmit={true}
                            placeholder={I18n.t('search', {
                                locale: this.props.setting.lang
                            })}
                            placeholderTextColor="#fff"
                            onChangeText={(text) => this.searchSymbol(text)}
                            value={this.state.textSearch}
                        />
                        <Icon
                            testID="iconCancelSearchCode"
                            name="ios-close-circle"
                            style={styles.iconRight2}
                            onPress={() => this.searchSymbol('')}
                        />
                    </View>

                    <View
                        testID="cancelUniversalSearch"
                        style={[
                            styles.buttonCancel,
                            { width: widthCancel, paddingHorizontal: 16 }
                        ]}
                    >
                        <TouchableOpacity
                            style={{
                                width: widthTextCancel,
                                paddingVertical: 12
                            }}
                            testID="universalSearchCancel"
                            onPress={this.closeModal.bind(this)}
                        >
                            <Text
                                style={[
                                    styles.whiteText,
                                    { backgroundColor: 'transparent' }
                                ]}
                            >
                                {I18n.t('cancel', {
                                    locale: this.props.setting.lang
                                })}
                            </Text>
                        </TouchableOpacity>
                        {Controller.isPriceStreaming() ? (
                            <View />
                        ) : !this.state.isHistory &&
                          !Controller.isPriceStreaming() ? (
                            this.state.isRefresh ? (
                                <View style={{ width: '25%' }}>
                                    <ActivityIndicator
                                        style={{ width: 24, height: 24 }}
                                        color="white"
                                    />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={{ width: '25%', marginRight: 8 }}
                                    onPress={() => {
                                        this.setState({
                                            isRefresh: true
                                        });
                                        Emitter.emit(this.dic.channelReqReload);
                                    }}
                                >
                                    <Icon
                                        name="ios-refresh"
                                        size={28}
                                        color="#FFF"
                                        style={{ textAlign: 'right', top: 2 }}
                                    />
                                </TouchableOpacity>
                            )
                        ) : null}
                    </View>
                </View>
                {Controller.getUserVerify() === 0 ? (
                    <VerifyMailNoti
                        verifyMailFn={() => {
                            pushToVerifyMailScreen(
                                this.props.navigator,
                                this.props.setting.lang
                            );
                        }}
                    ></VerifyMailNoti>
                ) : (
                    <View />
                )}
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    {this.props.isConnected ? null : <NetworkWarning />}
                    <ScrollBarUndeline listItem={this.dic.listSymbolClass} />
                    {this.state.isLoading ? (
                        <View
                            style={{
                                width,
                                height,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <ProgressBar />
                            {Platform.OS === 'ios' ? (
                                <View
                                    style={{
                                        height: this.state.keyboardHeight,
                                        backgroundColor: 'transparent'
                                    }}
                                />
                            ) : null}
                        </View>
                    ) : this.state.listData &&
                      this.state.listData.length >= 1 ? (
                        <Animated.View
                            onLayout={(e) => this.onLayout(e, heightForFive)}
                            style={[
                                {
                                    width: '100%',
                                    maxHeight: this.state.isHistory
                                        ? height
                                        : heightForFive,
                                    backgroundColor: '#FFF',
                                    shadowColor: 'rgba(0,0,0,0.2)'
                                },
                                this.state.isHistory ? { height } : {}
                            ]}
                        >
                            {this.state.isHistory ? (
                                <View
                                    style={{
                                        height: 30,
                                        justifyContent: 'center',
                                        backgroundColor: '#efefef',
                                        paddingLeft: 16
                                    }}
                                >
                                    <Text style={CommonStyle.textSub}>
                                        {I18n.t('History', {
                                            locale: this.props.setting.lang
                                        })}
                                    </Text>
                                </View>
                            ) : null}
                            <ListView
                                renderScrollComponent={(props) => (
                                    <InvertibleScrollView
                                        testID="watchlistPersonal"
                                        keyboardShouldPersistTaps={'always'}
                                        {...props}
                                        showsVerticalScrollIndicator={false}
                                        scrollEventThrottle={16}
                                    />
                                )}
                                removeClippedSubviews={false}
                                keyboardShouldPersistTaps="always"
                                enableEmptySections
                                automaticallyAdjustContentInsets={false}
                                dataSource={this.state.dataSource}
                                initialListSize={20}
                                pageSize={30}
                                renderRow={this._renderRow.bind(this)}
                                renderFooter={this.renderFooter.bind(this)}
                            />
                            {this.state.isHistory ? (
                                <View
                                    style={{
                                        height: this.state.keyboardHeight,
                                        backgroundColor: 'transparent'
                                    }}
                                />
                            ) : null}
                        </Animated.View>
                    ) : this.state.isFetching ? (
                        <View
                            style={{
                                width: width,
                                height: height,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <ProgressBar />
                            <View
                                style={{
                                    height: this.state.keyboardHeight,
                                    backgroundColor: 'transparent'
                                }}
                            />
                        </View>
                    ) : (
                        <Animated.View
                            style={{
                                flex: 1,
                                backgroundColor: '#FFF',
                                height: height,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text>
                                {I18n.t('noData', {
                                    locale: this.props.setting.lang
                                })}
                            </Text>
                            {Platform.OS === 'ios' ? (
                                <View
                                    style={{
                                        height: this.state.keyboardHeight,
                                        backgroundColor: 'transparent'
                                    }}
                                />
                            ) : null}
                        </Animated.View>
                    )}

                    {this.state.isHistory ? null : (
                        <SearchDetail
                            ref={(sef) => {
                                if (sef) {
                                    this.reloadSearchDetailData =
                                        sef.reloadData;
                                    this.unSubRealtimeSearchDetail =
                                        sef.unSubRealtime;
                                }
                            }}
                            disableCheckRealtime
                            stopLoading={this.stopLoading}
                            searchResultHeight={this.state.searchResultHeight}
                            searchResultAnimation={this.searchResultAnimation}
                            disabledSuggestCode={this.props.disabledSuggestCode}
                            style={{ backgroundColor: '#efeff4' }}
                            marginTop={
                                this.props.disabledSuggestCode &&
                                this.state.textSearch === this.props.displayName
                                    ? isIphoneXorAbove()
                                        ? 80
                                        : 48
                                    : this.state.marginAnimation
                            }
                            isBackground={true}
                            isConnected={this.props.isConnected}
                            isUnique={this.state.isUnique}
                            onScrollCallback={
                                this.state.listData.length !== 1
                                    ? this.onScrollBack.bind(this)
                                    : null
                            }
                            symbol={
                                this.props.displayName &&
                                this.state.textSearch === this.props.displayName
                                    ? this.props.symbol
                                    : this.state.symbol
                            }
                            login={this.props.login}
                            navigator={this.dic.nav}
                            channelReqReload={this.dic.channelReqReload}
                            channelResReload={this.dic.channelResReload}
                        />
                    )}
                </View>
            </View>
        );
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
        actions: bindActionCreators(searchActions, dispatch),
        resetAllQuantityOrder: (...p) =>
            dispatch(searchOrderActions.resetAllQuantityOrder(...p)),
        resetPageSizeNews: (...p) =>
            dispatch(searchNewsActions.resetPageSizeNews(...p)),
        setSearchSymbol: (...p) =>
            dispatch(searchDetailActions.setSymbolSearchDetail(...p)),
        changeDisplayName: (...p) =>
            dispatch(PriceActions.changeDisplayName(...p))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UniversalSearch);
