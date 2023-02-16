import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    PixelRatio,
    Image,
    StyleSheet,
    InteractionManager,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    ListView,
    FlatList,
    AppState,
    TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './style/order';
import { func, dataStorage } from '../../storage';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import * as Animatable from 'react-native-animatable';
import I18n from '../../modules/language';
import ProgressBar from '../../modules/_global/ProgressBar';
import {
    searchResponse,
    getSymbolInfoApi,
    logDevice,
    getClassQuery
} from '../../lib/base/functionUtil';
import deviceModel from '../../constants/device_model';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import RowSearchByMasterCode from '../../component/result_search/rowSearchByMasterCode';
import Row, {
    Row as RowBase
} from '~/component/result_search/rowSearchByMasterCode.1';
import NetworkWarning from '../../component/network_warning/network_warning';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import ENUM from '../../enum';
import ScrollBarUndeline from '../../component/scrollbar_underline/scrollbar_underline';
import XComponent from '../../component/xComponent/xComponent';
import DeviceInfo from 'react-native-device-info';
import * as Business from '../../business';
import * as api from '../../api';
import * as appActions from '../../app.actions';
import * as settingAction from '../setting/setting.actions';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import * as Emitter from '~/lib/base/vietnam-emitter';
import * as Channel from '~/streaming/channel';
import * as Util from '~/util';
import * as Controller from '../../memory/controller';
import TransitionView from '~/component/animation_component/transition_view';
import {
    Text as TextLoad,
    View as ViewLoad
} from '~/component/loading_component';
import Highlighter from 'react-native-highlight-words';
import RowLoading from '~/screens/alert_function/components/RowLoading';
import ResultSearch from '~/screens/alert_function/components/SearchBar/Result';
import KeyboardPushCenter from '~/component/keyboard_smart/keyboard_push_center_space.js';
import StateApp from '~/lib/base/helper/appState';
import * as ManageConection from '~/manage/manageConnection';
import ScreenId from '~/constants/screen_id';
const { width, height } = Dimensions.get('window');
const { SYMBOL_CLASS, SYMBOL_CLASS_QUERY } = ENUM;

export class SearchOrder extends XComponent {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        this.init();
        this.registerFunc();
        ManageConection.setScreenId(ScreenId.ORDER);
        // ManageConection.dicConnection.getSnapshot = this.handleWakupApp;
        this.stateApp = new StateApp(
            this.handleWakupApp,
            null,
            ScreenId.ORDER,
            false
        );
        this.isShowDetail = false;
    }
    handleWakupApp = () => {
        if (this.isShowDetail) {
            this.props.resetFocusInput && this.props.resetFocusInput();
            this.props.c2rOrderDetail && this.props.c2rOrderDetail();
        }
        const selectedClass = this.dic.selectedClass;
        if (!this.dic.textSearch) {
            this.setState({
                listData: [],
                isLoading: true,
                isNoData: false
            });
            const cb = () => this.getOrderSearchHistory();
            this.showLoading('fadeIn', cb);
        } else {
            this.setState({
                listData: [],
                isNoData: false,
                isLoading: true
            });
            this.dic.countOnChangeTab += 1;
            const cb = () =>
                this.callBaclOnSelectSymbolClassSearch(
                    selectedClass,
                    this.dic.countOnChangeTab
                );
            this.showLoading('fadeIn', cb);
        }
    };
    init() {
        this.dic = {
            id: Util.getRandomKey(),
            countOnChangeTab: 0,
            firstSearch: true,
            symbolInfo: {},
            deviceId: dataStorage.deviceId,
            selectedClass: SYMBOL_CLASS.ALL_TYPES,
            textSearch: '',
            listHistory: [],
            dicHistoryByClass: {},
            deviceModel: dataStorage.deviceModel,
            timeout: null,
            perf: new Perf(performanceEnum.show_form_order_search),
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
        this.initSearch = true;
        this.state = {
            keyboardHeight: 0,
            isLoading: true,
            isHistory: true,
            textSearch: '',
            listData: [],
            isShowKeyboard: false,
            isNoData: false
        };
    }

    bindAllFunc() {
        this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this);
        this.filterHistoryByClass = this.filterHistoryByClass.bind(this);
        this.callbackSearch = this.callbackSearch.bind(this);
        this.getOrderSearchHistory = this.getOrderSearchHistory.bind(this);
        this.getSearchHistoryByClass = this.getSearchHistoryByClass.bind(this);
        this.setOrderSearchHistory = this.setOrderSearchHistory.bind(this);
        this.onPressResultSearch = this.onPressResultSearch.bind(this);
        this.searchSymbol = this.searchSymbol.bind(this);
    }

    registerFunc() {
        this.props.register && this.props.register(this.searchSymbol);
    }

    storeHistorySearchSymbolLocal = this.storeHistorySearchSymbolLocal.bind(
        this
    );
    storeHistorySearchSymbolLocal() {
        // Lưu local
        ManageHistorySearch.storeHistorySearchSymbolLocal(this.dic.listHistory);
    }

    storeHistorySearchSymbolApi = this.storeHistorySearchSymbolApi.bind(this);
    storeHistorySearchSymbolApi() {
        // Lưu vào db setting
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

    setOrderSearchHistory() {
        this.storeHistorySearchSymbolLocal();
        this.storeHistorySearchSymbolApi();
    }

    onSelectSymbolClass(selectedClass) {
        if (selectedClass === this.dic.selectedClass) {
            return;
        }
        this.dic.countOnChangeTab += 1;
        this.dic.selectedClass = selectedClass;
        if (!this.dic.textSearch) {
            this.setState({
                listData: [],
                isLoading: true,
                isNoData: false
            });
            const cb = () =>
                this.callBackOnSelectSymbolClass(
                    selectedClass,
                    this.dic.countOnChangeTab
                );
            this.showLoading(dataStorage.animationDirection, cb);
        } else {
            this.setState({
                listData: [],
                isLoading: true,
                isNoData: false
            });
            const cb = () =>
                this.callBaclOnSelectSymbolClassSearch(
                    selectedClass,
                    this.dic.countOnChangeTab
                );
            this.showLoading(dataStorage.animationDirection, cb);
        }
    }
    callBaclOnSelectSymbolClassSearch = (selectedClass, countOnChangeTab) => {
        if (this.dic.countOnChangeTab === countOnChangeTab) {
            this.loadData(this.dic.textSearch, selectedClass);
        }
    };
    callBackOnSelectSymbolClass = (selectedClass, countOnChangeTab) => {
        if (this.dic.countOnChangeTab === countOnChangeTab) {
            this.getSearchHistoryByClass();
        }
    };
    getSearchHistoryByClass() {
        const dicSearchHistoryByClass =
            (this.dic.dicHistoryByClass &&
                this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
            [];
        this.showLoading('fadeOut');
        this.setState({
            isHistory: true,
            listData: dicSearchHistoryByClass,
            isNoData:
                dicSearchHistoryByClass && dicSearchHistoryByClass.length === 0,
            isLoading: false
        });
    }

    filterHistoryByClass() {
        this.dic.dicHistoryByClass = Business.filterSymbolByClass(
            this.dic.listHistory
        );
    }

    getOrderSearchHistory() {
        if (this.props.isConnected) {
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
                getSymbolInfoApi(stringQuery, () => {
                    this.loadData('');
                });
            } else {
                this.loadData('');
            }
        } else {
            this.loadData('');
        }
    }

    callbackSearch(listSymbol, selectedClass) {
        if (selectedClass === this.dic.selectedClass) {
            this.showLoading('fadeOut');
            if (listSymbol) {
                this.setState({
                    isHistory: false,
                    listData: listSymbol,
                    isNoData: listSymbol && listSymbol.length === 0,
                    isLoading: false
                });
            } else {
                this.setState({
                    isHistory: false,
                    listData: [],
                    isNoData: true,
                    isLoading: false
                });
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
    loadData(text, selectedClass) {
        if (text && text.length > 0) {
            const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
            const cb = (data) =>
                this.callbackSearch(data, this.dic.selectedClass);
            const classQuery = getClassQuery(this.dic.selectedClass);
            this.dic.textSearch = textSearch;
            searchResponse({ textSearch, cb, classQuery });
        } else {
            this.dic.textSearch = '';
            const dicSearchHistoryByClass =
                (this.dic.dicHistoryByClass &&
                    this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
                [];
            this.setState(
                {
                    isHistory: true,
                    listData: dicSearchHistoryByClass,
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

    searchSymbol(text) {
        // Khi không có kết nối mạng thì chỉ ghi nhận text search thay đổi mà không call API
        if (!this.props.isConnected) {
            this.dic.textSearch = text;
            return this.setState({
                textSearch: text,
                isNoData: true,
                isHistory: !text,
                listData: []
            });
        }
        this.dic.timeout && clearTimeout(this.dic.timeout);
        let loading = false;
        const dicSearchHistoryByClass =
            (this.dic.dicHistoryByClass &&
                this.dic.dicHistoryByClass[this.dic.selectedClass]) ||
            [];
        if (text === '') {
            this.initSearch = true;
            // Case xoa het text search
            /**
             * B1: Thu Row Data Len
             * Box Loading tu tren xuong
             * Co Da ta fadeIn data len
             */
            if (this.dic.textSearch === '') {
                return;
            }
            this.dic.textSearch = '';
            const cb = () =>
                this.callBackSearchWhenClearText(text, dicSearchHistoryByClass);
            this.refResultSearch &&
                this.refResultSearch.runAnimation(
                    {
                        type: 'fadeOutUp'
                    },
                    cb
                );
        }

        // if (text.length === 1) {
        //   this.dic.textSearch = text
        //   this.setState({
        //     listData: dicSearchHistoryByClass,
        //     textSearch: text,
        //     isNoData: dicSearchHistoryByClass && dicSearchHistoryByClass.length === 0,
        //     isHistory: true
        //   });
        // }

        if (text.length > 0) {
            this.dic.textSearch = text;
            this.setState({
                isHistory: false,
                listData: []
            });
            if (this.initSearch) {
                loading = true;
                this.showLoading('fadeInDown');
                this.dic.timeout && clearTimeout(this.dic.timeout);
                this.dic.timeout = setTimeout(() => {
                    this.callBackOnSearch(text);
                    console.log('DCM dasdasdasd');
                    this.initSearch = false;
                }, this.refRowLoading.getTotalTimeRunAnimation());
            } else {
                this.showLoading('fadeIn');
                loading = true;
                this.dic.timeout && clearTimeout(this.dic.timeout);
                this.dic.timeout = setTimeout(() => {
                    this.callBackOnSearch(text);
                }, 700);
            }
        }
        this.setState({
            textSearch: text,
            isLoading: loading,
            isHistory: false,
            isNoData: false
        });
    }
    callBackOnSearch = (text) => {
        if (this.dic.textSearch === text) {
            this.loadData(text, this.dic.selectedClass);
        }
    };
    callBackSearchWhenClearText = (textSearch, dicSearchHistoryByClass) => {
        if (textSearch === this.dic.textSearch) {
            this.setState({
                listData: [],
                isHistory: true,
                isLoading: true,
                isNoData: false
            });
            this.refRowLoading &&
                this.refRowLoading.runAnimation(
                    {
                        type: 'fadeInDown'
                    },
                    () => {
                        this.refRowLoading &&
                            this.refRowLoading.runAnimation({
                                type: 'fadeOut'
                            });
                        this.setState({
                            listData: dicSearchHistoryByClass,
                            isNoData:
                                dicSearchHistoryByClass &&
                                dicSearchHistoryByClass.length === 0,
                            isLoading: false
                        });
                    }
                );
        }
    };
    componentDidMount() {
        super.componentDidMount();
        this.subSyncHistorySearchSymbol();
        if (this.props.code) {
            // De cho panel no slide len top da roi ms setstate
            setTimeout(() => {
                this.getOrderSearchHistory();
            }, 0);
        } else {
            setTimeout(() => {
                this.getOrderSearchHistory();
            }, 0);
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

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.isConnected !== this.props.isConnected &&
            nextProps.isConnected
        ) {
            this.handleWakupApp();
        }
    }

    componentWillUnmount() {
        this.unsubSyncHistorySearchSymbol();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        AppState.removeEventListener('change', this.handleWakupApp);
        super.componentWillUnmount();
    }

    syncWhenIsHistory = this.syncWhenIsHistory.bind(this);
    syncWhenIsHistory() {
        // Get symbol info -> rerender
        // Rerender nếu đang ở trạng thái history
        if (this.dic.listHistory.length) {
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
        } else {
            this.loadData('');
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
                getSymbolInfoApi(stringQuery);
            }
        }
    }

    syncHistorySearchSymbol = this.syncHistorySearchSymbol.bind(this);
    syncHistorySearchSymbol(listSymbol) {
        this.dic.listHistory = listSymbol;
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
        this.setState({ isShowKeyboard: true, keyboardHeight });
    }

    _keyboardDidHide() {
        const keyboardHeight = 0;
        this.setState({ isShowKeyboard: false, keyboardHeight });
    }

    getSymbolSaveHistory = this.getSymbolSaveHistory.bind(this);
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

    onPressResultSearch({ symbolInfo, isRefresh }) {
        if (!this.state.isHistory) {
            this.dic.symbolInfo = symbolInfo;
            const historySymbol = this.getSymbolSaveHistory(symbolInfo);
            const checkSymbolExist = this.checkSymbolHistoryExist(
                this.dic.listHistory,
                historySymbol
            );
            if (!checkSymbolExist) {
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
            this.setOrderSearchHistory();
            this.filterHistoryByClass();
        }
        this.props.onPressSearch &&
            this.props.onPressSearch(symbolInfo, isRefresh);
    }

    renderNodata() {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text
                    style={{
                        color: CommonStyle.fontColor,
                        fontFamily: CommonStyle.fontPoppinsRegular
                    }}
                >
                    {I18n.t('noData')}
                </Text>
                {Platform.OS === 'android' ? null : (
                    <View
                        style={{
                            height: this.state.keyboardHeight,
                            backgroundColor: 'transparent'
                        }}
                    ></View>
                )}
            </View>
        );
    }

    _renderFooter() {
        return (
            <View
                style={{
                    height: 50,
                    borderTopWidth: 0,
                    borderColor: CommonStyle.seperateLineColor,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            ></View>
        );
    }

    renderHistoryBar() {
        return this.state.isHistory ? (
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingVertical: 8,
                    paddingLeft: 16
                }}
            >
                <MaterialIcon
                    name="history"
                    size={28}
                    style={{ color: CommonStyle.fontColor, paddingRight: 8 }}
                />
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsMedium,
                        fontSize: CommonStyle.fontSizeS,
                        color: CommonStyle.fontColor,
                        fontWeight: '500'
                    }}
                >
                    {I18n.t('History')}
                </Text>
            </View>
        ) : (
            <View style={{ height: 16 }}></View>
        );
    }

    renderSeparator = () => {
        return <View style={{ height: 8 }} />;
    };

    getTypeAnimationLoading = () => {
        if (this.state.isLoading) {
            return dataStorage.animationDirection;
        } else {
            return 'fadeOut';
        }
    };
    renderHaveData = () => {
        return (
            <ResultSearch
                style={{ marginHorizontal: 0 }}
                ref={this.setRefResultSearch}
                data={this.state.listData}
                selectedClass={this.dic.selectedClass}
                textSearch={this.state.isHistory ? '' : this.state.textSearch}
                onPressResultSearch={this.onPressResultSearch}
            />
        );
    };
    setRefResultSearch = (ref) => {
        this.refResultSearch = ref;
    };
    setRefRowLoading = (ref) => {
        this.refRowLoading = ref;
    };
    handleOnDoneRowLoading = () => {
        this.getOrderSearchHistory();
        // this.props.onFocusSearchBox && this.props.onFocusSearchBox()
    };
    renderNoData = () => {
        if (Platform.OS === 'android') {
            // Android tu day len giua khoang trong
            return (
                <KeyboardAvoidingView
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={CommonStyle.textNoData}>
                        {I18n.t('noData')}
                    </Text>
                </KeyboardAvoidingView>
            );
        }
        // IOS chi day len cach mot top ban phim 1 chut
        return (
            <KeyboardAvoidingView
                enabled={true}
                behavior={'padding'}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>
            </KeyboardAvoidingView>
        );
    };
    renderResultSearch = () => {
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
                    <RowLoading
                        // onDone={this.handleOnDoneRowLoading}
                        ref={this.setRefRowLoading}
                    />
                </View>
                <View
                    style={{
                        flex: 1
                    }}
                >
                    {this.renderHaveData()}
                    {this.state.isNoData ? (
                        <Animatable.View
                            animation={'fadeIn'}
                            duration={500}
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
                            {/* {this.renderNoData()} */}
                        </Animatable.View>
                    ) : null}
                </View>
            </View>
        );
    };
    render() {
        const typeAnimationLoading = this.getTypeAnimationLoading();
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            </TouchableWithoutFeedback>
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
        action: bindActionCreators(appActions, dispatch),
        settingAction: bindActionCreators(settingAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(SearchOrder);
