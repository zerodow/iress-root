import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    ImageBackground,
    Image,
    KeyboardAvoidingView,
    Animated,
    RefreshControl,
    DeviceEventEmitter,
    NativeAppEventEmitter
} from 'react-native';
// Api
import * as Api from '../../api';
// Storage
import ENUM from '../../enum';
import { dataStorage, func } from '../../storage';
import * as Controller from '../../memory/controller';
import * as AllMarket from '../../streaming/all_market';
import * as StreamingBusiness from '../../streaming/streaming_business';
// Redux
import { connect } from 'react-redux';
// Style
import CommonStyle, { register } from '~/theme/theme_controller';
// Util
import * as Channel from '../../streaming/channel';
import * as UserPriceSource from '../../userPriceSource';
import * as FunctionUtil from '../../lib/base/functionUtil';
import * as Util from '../../util';
import * as Business from '~/business';
// Emitter
import * as Emitter from '@lib/vietnam-emitter';
// Component
import FallHeader from '~/component/fall_header';
import XComponent from '../../component/xComponent/xComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AlertPrice from './alert_price';
import NetworkWarning from '../../component/network_warning/network_warning';
import AlertPriceTop from './alert_price_top_modify';
import HeaderSpecial from './components/Header/index';
import pinBackground from '~/img/background_mobile/group7.png';
import ButtonConfirm, { TYPE } from './components/ButtonConfirm';
// import PullToRefresh from './components/PullToRefresh'
import { changeScreenActive } from './redux/actions';
import * as Animatable from 'react-native-animatable';
import PullToRefresh from '~/component/pull_to_refresh';
// Common
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import ScreenId from '../../constants/screen_id';
import StateApp from '~/lib/base/helper/appState';

const { width, height } = Dimensions.get('window');
const { STREAMING_MARKET_TYPE, ALERT_SCREEN, SYMBOL_CLASS } = ENUM;

const styles = {
    container: {
        flex: 1
        // zIndex: 1,
        // backgroundColor: 'white'
    },
    dragHandler: {
        alignSelf: 'stretch',
        height: 36,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fdfdfd',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: {
            width: 0,
            height: 5
        }
        // shadowOpacity: 1,
        // shadowRadius: 20
    }
};

export class ModifyAlert extends XComponent {
    init() {
        this.dic = {
            isPriceStreaming: Controller.isPriceStreaming(),
            timeoutClearError: null,
            isLoadingPrice: false,
            priceObject: {
                symbolClass: SYMBOL_CLASS.EQUITY
            },
            alertObj: this.props.alertObj,
            channelLoading: Channel.getChannelAlertLoading(),
            channelPrice: Channel.getChannelAlertPrice(),
            channelSymbolInfo: Channel.getChannelAlertSymbol(),
            channelNewsToday: Channel.getChannelAlertNewsToday(),
            channelAllPrice: Channel.getChannellAlertAllPrice(),
            refAlertPriceHeader: React.createRef(),
            scrollValue: new Animated.Value(0),
            opacityWrapper: new Animated.Value(1),
            translateY: new Animated.Value(height),
            isPin: false
        };
        this.state = {
            error: '',
            refreshing: false
        };
        this.emitter =
            Platform.OS === 'android'
                ? DeviceEventEmitter
                : NativeAppEventEmitter;
        this.setRightBtnNav();
        this.subScrollView();
        this.stateApp = new StateApp(
            this.handleWakupApp,
            null,
            ScreenId.MODIFY_ALERT,
            false
        );
    }
    handleWakupApp = this.handleWakupApp.bind(this);
    handleWakupApp() {
        this.onC2R(false);
    }
    subScrollView() {
        this.dic.scrollValue.addListener(({ value }) => {
            if (Platform.OS === 'android') return;
            if (Controller.isPriceStreaming()) return;
            if (value < -100 && !this.refreshing) {
                this.refreshing = true;
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.onC2R();
                }, 300);
            }
            if (value > -5) {
                this.refreshing = false;
            }
        });
    }
    setRefreshing = (refreshing) => {
        this.setState({ refreshing });
    };
    componentDidMount() {
        super.componentDidMount();
        func.setCurrentScreenId(ScreenId.MODIFY_ALERT);
        this.pubLoadingToChild(true);
        // this.slideUp()
    }

    async componentWillUnmount() {
        this.dic.isPriceStreaming && (await this.unsubSymbol());
        super.componentWillUnmount();
    }
    slideUp = (cb) => {
        Animated.timing(this.dic.translateY, {
            toValue: 0,
            useNativeDriver: true
        }).start(() => {
            cb && cb();
        });
    };
    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            FunctionUtil.switchForm(this.props.navigator, event);
        } else if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'backPress':
                    return true;
                    console.log('DCM backPress');
                    break;
                case 'modify_alert_refresh':
                    Controller.setShouldSetDefault(false); // Gan co khong cho set lai gia tri mac dinh trong form edit alert
                    this.getSnapshot(this.dic.alertObj);
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
                    func.setCurrentScreenId(ScreenId.MODIFY_ALERT);
                    break;
                default:
                    break;
            }
        }
    }

    clearError() {
        this.setState({
            error: ''
        });
    }

    onClose() {
        this.props.navigator.pop({
            animated: true,
            animationType: 'slide-horizontal'
        });
    }

    updateError({ errorCode, error }) {
        if (errorCode === 'SUCCESS') {
            // setTimeout(this.onClose, 1000)
            this.headerRef &&
                this.headerRef.showError({
                    type: 'process',
                    error: error,
                    height: 24
                });
            this.dic.timeOutSuccess && clearTimeout(this.dic.timeOutSuccess);
            this.dic.timeOutSuccess = setTimeout(() => {
                // Controller.dispatch(changeScreenActive(ALERT_SCREEN.LIST_ALERT))
                this.handleMoveToAlertList(() => {
                    this.props.navigator.dismissAllModals({
                        animationType: 'none' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
                    });
                });
            }, 1000);
        } else {
            this.headerRef &&
                this.headerRef.showError({
                    type: 'error',
                    error: error,
                    height: 24
                });
            setTimeout(() => {
                this.headerRef && this.headerRef.hideError();
            }, 3000);
        }
    }

    setRightBtnNav() {
        if (Controller.isPriceStreaming()) {
            this.props.navigator.setButtons({
                rightButtons: []
            });
        } else if (this.dic.isLoadingPrice) {
            this.props.navigator.setButtons({
                rightButtons: [
                    {
                        component: 'equix.CustomButton'
                    }
                ]
            });
        } else {
            this.props.navigator.setButtons({
                rightButtons: [
                    {
                        title: 'Refresh',
                        id: 'modify_alert_refresh',
                        icon: iconsMap['ios-refresh-outline'],
                        testID: `modify_alert_refresh`
                    }
                ]
            });
        }
    }

    getSymbolInfoApi(alertObj = {}) {
        return new Promise((resolve) => {
            const { symbol } = alertObj;
            FunctionUtil.getSymbolInfoApi(symbol, resolve);
        });
    }

    getSymbolInfo(symbol) {
        // company_name > company > security_name
        const companyName =
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].company_name
                ? dataStorage.symbolEquity[symbol].company_name
                : '';
        const company =
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].company
                ? dataStorage.symbolEquity[symbol].company
                : '';
        const securityName =
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].security_name
                ? dataStorage.symbolEquity[symbol].security_name
                : '';
        const displayName =
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].display_name
                ? dataStorage.symbolEquity[symbol].display_name
                : '';
        const symbolClass =
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].class
                ? dataStorage.symbolEquity[symbol].class
                : '';
        const exchange =
            dataStorage.symbolEquity[symbol] &&
            dataStorage.symbolEquity[symbol].exchanges
                ? dataStorage.symbolEquity[symbol].exchanges[0]
                : 'ASX';
        return {
            symbol,
            displayName: displayName || symbol,
            company: companyName || company || securityName,
            symbolClass,
            exchange
        };
    }

    getSnapshot(alertObj = {}, cbSuccess, cbFail) {
        const { symbol } = alertObj;
        this.dic.isLoadingPrice = true;
        this.pubLoadingToChild(true);
        this.setRightBtnNav();
        const {
            displayName,
            exchange,
            company = '',
            symbolClass = ''
        } = this.getSymbolInfo(symbol);

        listSymbolObj = [
            {
                symbol,
                exchange
            }
        ];

        UserPriceSource.loadDataPrice(
            STREAMING_MARKET_TYPE.QUOTE,
            listSymbolObj
        )
            .then((res) => {
                if (res) {
                    if (res.length) {
                        const priceObject = res[0];
                        priceObject['symbol'] = symbol;
                        priceObject['displayName'] = displayName;
                        priceObject['company'] = company;
                        priceObject['symbolClass'] = symbolClass;
                        this.updateData(priceObject);
                        this.pubDataToAlertPrice(priceObject);
                    } else {
                        const priceObject = {
                            symbol,
                            displayName,
                            company,
                            symbolClass
                        };
                        this.updateData(priceObject);
                        this.pubDataToAlertPrice(priceObject);
                    }
                } else {
                    const priceObject = {
                        symbol,
                        displayName,
                        company,
                        symbolClass
                    };
                    this.updateData(priceObject);
                    this.pubDataToAlertPrice(priceObject);
                }
                this.dic.isLoadingPrice = false;
                this.pubLoadingToChild(false);
                cbSuccess && cbSuccess();
                setTimeout(this.setRightBtnNav, 500);
            })
            .catch((err) => {
                console.log(err);
                this.updateData({
                    symbol,
                    displayName,
                    company,
                    symbolClass
                });
                this.dic.isLoadingPrice = false;
                this.pubLoadingToChild(false);
                cbFail && cbFail();
                setTimeout(this.setRightBtnNav, 500);
            });
    }

    async getNewsToday(symbol) {
        if (symbol) {
            const checkUrl = Api.checkNewsTodayUrl(symbol);
            try {
                const data = await Api.requestData(checkUrl);
                if (data) {
                    this.pubNewsToday({ symbol, data });
                }
            } catch (error) {
                console.catch(error);
            }
        }
    }

    unsubSymbol() {
        if (this.dic && this.dic.alertObj) {
            const { symbol } = this.dic.alertObj;
            const exchange = Business.getSymbolExchange({ symbol });
            if (!exchange || !symbol) return;
            AllMarket.unsub([{ symbol, exchange }], this.id);
        }
    }

    subSymbol() {
        return new Promise((resolve) => {
            const { symbol } = this.dic.alertObj;
            const exchange = Business.getSymbolExchange({ symbol });
            if (!exchange || !symbol) return;
            const channel = StreamingBusiness.getChannelLv1(exchange, symbol);
            Emitter.addListener(channel, this.id, (newData = {}) => {
                Emitter.emit(this.dic.channelPrice, { data: newData }); // Realtime -> pub price
            });
            AllMarket.setIsAIO(false);
            AllMarket.sub([{ symbol, exchange }], this.id, resolve);
        });
    }

    updateData(data) {
        this.dic.priceObject = data;
        this.pubSymbolToChild(this.dic.priceObject);
        this.pubDataToChild(this.dic.priceObject);
    }

    pubLoadingToChild(status) {
        Emitter.emit(this.dic.channelLoading, status);
    }

    pubSymbolToChild() {
        Emitter.emit(this.dic.channelSymbolInfo, this.dic.priceObject);
    }

    pubDataToAlertPrice() {
        Emitter.emit(this.dic.channelAllPrice, this.dic.priceObject);
    }

    pubDataToChild() {
        Emitter.emit(this.dic.channelPrice, {
            data: this.dic.priceObject,
            isMerge: false
        });
    }

    pubNewsToday({ symbol, data }) {
        const isNewsToday = data[symbol];
        Emitter.emit(this.dic.channelNewsToday, isNewsToday);
    }

    renderDragIcon() {
        return (
            <View
                style={[
                    {
                        marginTop: 8,
                        width: 36,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: 'rgba(0, 0, 0, 0.54)'
                    }
                ]}
            />
        );
    }

    renderNone() {
        return null;
    }
    isApplyPulToRefreshAndroid = (isActionPullToRefresh = true) => {
        const isStreaming = Controller.isPriceStreaming();
        if (
            isActionPullToRefresh &&
            Platform.OS === 'android' &&
            !isStreaming
        ) {
            return true;
        }
        return false;
    };
    onC2R = (isPullToRefresh = true) => {
        const { symbol } = this.dic.alertObj;
        const isStreaming = Controller.isPriceStreaming();
        this.refPullToRefresh &&
            this.refPullToRefresh.setTimeUpdate(new Date().getTime());
        Controller.setShouldSetDefault(false);
        // Neu khong phai pullToRefresh thi ko hien thi icon loading on Android, chi apply tren android va tk C2R
        if (this.isApplyPulToRefreshAndroid(isPullToRefresh)) {
            this.setRefreshing(true);
        }
        this.getSnapshot(
            this.dic.alertObj,
            () => {
                // Neu khong phai pullToRefresh thi ko hien thi icon loading on Android, chi apply tren android va tk C2R
                if (this.isApplyPulToRefreshAndroid(isPullToRefresh)) {
                    this.setRefreshing(false);
                }
            },
            () => {
                if (this.isApplyPulToRefreshAndroid(isPullToRefresh)) {
                    this.setRefreshing(false);
                }
            }
        );
        this.getNewsToday(symbol);
    };
    updateStyleWrapperHeader = (status) => {
        this.refHeaderPrice &&
            this.refHeaderPrice.setNativeProps({
                borderBottomRightRadius: status
                    ? CommonStyle.borderBottomRightRadius
                    : 0,
                borderBottomColor: CommonStyle.color.dusk,
                borderBottomWidth: status ? 0 : 1
            });
    };
    setHeightTriggerPinPrice = (height) => {
        setTimeout(() => {
            this.dic.refAlertPriceHeader &&
                this.dic.refAlertPriceHeader.current &&
                this.dic.refAlertPriceHeader.current.setHeightTriggerPinPrice(
                    height
                );
        }, 300);
    };
    renderHeader = () => {
        return (
            <HeaderSpecial
                onClose={this.handleOnClose}
                screen={ALERT_SCREEN.DETAIL_MODIFY_ALERT}
                navigator={this.props.navigator}
            />
        );
    };
    setRefAlertPrice = this.setRefAlertPrice.bind(this);
    setRefAlertPrice(ref) {
        this.refAlertPrice = ref;
    }
    resetError = () => {
        this.refAlertPrice && this.refAlertPrice.resetError();
    };
    renderSliding() {
        const { symbol } = this.dic.alertObj;
        const isStreaming = Controller.isPriceStreaming();
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: CommonStyle.backgroundColor }
                ]}
            >
                <Animated.ScrollView
                    refreshControl={
                        Platform.OS === 'android' && !isStreaming ? (
                            <RefreshControl
                                progressViewOffset={100}
                                refreshing={this.state.refreshing}
                                onRefresh={this.onC2R}
                            />
                        ) : null
                        // isStreaming ? null : <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onC2R} />
                    }
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [
                            {
                                nativeEvent: {
                                    contentOffset: { y: this.dic.scrollValue }
                                }
                            }
                        ],
                        {
                            useNativeDriver: true
                        }
                    )}
                    scrollEventThrottle={40}
                    stickyHeaderIndices={[0]}
                >
                    <View style={{ overflow: 'visible' }}>
                        <View
                            style={{
                                backgroundColor: CommonStyle.backgroundColor
                            }}
                        >
                            {
                                <PullToRefresh
                                    ref={(ref) => (this.refPullToRefresh = ref)}
                                    header={this.renderHeader()}
                                />
                            }
                        </View>
                        <AlertPriceTop
                            style={{
                                paddingTop: 16,
                                paddingLeft: 16
                            }}
                            onC2R={this.onC2R}
                            onClose={this.onClose}
                            scrollValue={this.dic.scrollValue}
                            ref={this.dic.refAlertPriceHeader}
                            isShowDragHandle={false}
                            updateError={this.updateError}
                            symbol={symbol}
                            priceObject={this.dic.priceObject}
                            channelBlurWithPan={this.dic.channelBlurWithPan}
                            channelLoading={this.dic.channelLoading}
                            channelNewsToday={this.dic.channelNewsToday}
                            channelSymbolInfo={this.dic.channelSymbolInfo}
                            channelAllPrice={this.dic.channelAllPrice}
                            channelPrice={this.dic.channelPrice}
                        />
                    </View>
                    <AlertPrice
                        ref={this.setRefAlertPrice}
                        setHeightTriggerPinPrice={this.setHeightTriggerPinPrice}
                        isModify={true}
                        updateError={this.updateError}
                        isLoading={this.dic.isLoadingPrice}
                        priceObject={this.dic.priceObject}
                        alertObj={this.props.alertObj}
                        channelNewsToday={this.dic.channelNewsToday}
                        channelLoading={this.dic.channelLoading}
                        channelSymbolInfo={this.dic.channelSymbolInfo}
                        channelAllPrice={this.dic.channelAllPrice}
                        channelPrice={this.dic.channelPrice}
                    />
                    <View style={{ height: 80 }} />
                </Animated.ScrollView>
            </View>
        );
    }
    handleOnClose = (cb) => {
        this.fadeOut(() => {
            this.resetError();
            const navigatorEventID = this.props
                .navigatorEventIDParentsEditAlert;
            this.emitter &&
                this.emitter.emit(navigatorEventID, {
                    id: 'hidden_edit_alert'
                });
            cb && cb();
        });
    };
    handleMoveToAlertList = (cb) => {
        this.fadeOut(cb);
        const navigatorEventID = this.props.navigatorEventIDParentsListAlert;
        this.emitter &&
            this.emitter.emit(navigatorEventID, {
                id: 'hidden_modify_edit_alert'
            });
    };
    fadeIn = () => {
        Animated.timing(this.dic.opacityWrapper, {
            toValue: 1,
            useNativeDriver: true
        }).start();
    };
    fadeOut = (cb) => {
        this.refViewWrapper &&
            this.refViewWrapper.fadeOut(500).then(() => {
                cb && cb();
            });
    };
    setRefViewWrapper = (ref) => {
        this.refViewWrapper = ref;
    };
    handleDoneAnimation = () => {
        this.getSymbolInfoApi(this.dic.alertObj).then(async () => {
            const { symbol } = this.dic.alertObj;
            this.dic.isPriceStreaming && (await this.unsubSymbol());
            this.dic.isPriceStreaming && this.subSymbol();
            this.getSnapshot(this.dic.alertObj);
            this.getNewsToday(symbol);
        });
    };
    showError = () => {
        this.headerRef &&
            this.headerRef.showError({
                type: 'process',
                error: 'dasdasdasdasdasdas',
                height: 24
            });
    };
    render() {
        const isStreaming = Controller.isPriceStreaming();
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
        const translateYHeader = this.dic.translateY.interpolate({
            inputRange: [0, height],
            outputRange: [0, -height]
        });
        return (
            <WraperComponent {...allProps}>
                <Animatable.View
                    onAnimationEnd={this.handleDoneAnimation}
                    useNativeDriver
                    ref={this.setRefViewWrapper}
                    duration={500}
                    animation={'slideInUp'}
                    style={{
                        opacity: this.dic.opacityWrapper,
                        flex: 1
                    }}
                >
                    <FallHeader
                        isPullToRefresh={true}
                        ref={(ref) => ref && (this.headerRef = ref)}
                        style={{
                            backgroundColor: !isStreaming
                                ? CommonStyle.color.dusk
                                : CommonStyle.ColorTabNews
                        }}
                        header={
                            <HeaderSpecial
                                onClose={this.handleOnClose}
                                screen={ALERT_SCREEN.DETAIL_MODIFY_ALERT}
                                navigator={this.props.navigator}
                            />
                        }
                    >
                        <Animated.View
                            style={{
                                flex: 1
                            }}
                        >
                            {this.renderSliding()}
                        </Animated.View>
                        <ButtonConfirm status={TYPE.DISABLE} isModify={true} />
                    </FallHeader>
                </Animatable.View>
            </WraperComponent>
        );
    }
}
export default ModifyAlert;
