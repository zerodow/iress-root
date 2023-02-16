import React, { Fragment, Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    Dimensions,
    Image,
    DeviceEventEmitter,
    NativeAppEventEmitter,
    StyleSheet,
    StatusBar
} from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage';
import _ from 'lodash';
import { State } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import {
    logDevice,
    formatNumber,
    formatNumberNew2,
    logAndReport,
    getSymbolInfoApi,
    replaceTextForMultipleLanguage,
    switchForm,
    reloadDataAfterChangeAccount,
    getCommodityInfo,
    renderTime,
    isIphoneXorAbove
} from '../../lib/base/functionUtil';
import * as AllMarket from '../../streaming/all_market';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business';
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
import CommonStyle from '~/theme/theme_controller';
import * as PureFunc from '../../utils/pure_func';
import config from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import loginUserType from '../../constants/login_user_type';
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
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid';
import TransitionView from '~/component/animation_component/transition_view';
import CustomButton from '../../component/custom_button/custom_button_watchlist';
// Lib
import moment from 'moment';

// Component
import TransitionView1 from '~/component/animation_view/index1';
import * as Animatable from 'react-native-animatable';
import XComponent from '@component/xComponent/xComponent';
import PromptNew from '@component/new_prompt/prompt_new';
import NetworkWarning from '~/component/network_warning/network_warning.1';
import ScreenId from '../../constants/screen_id';
import NewOrderNavigator from './new_order_navigator';
import NewOrderNavigatorManagementGroup from './new_order_navigator_management_group';
import SearchBar from './search_bar';
import OrderDetail from './order_detail';
import Flashing from '@component/flashing/flashing.1';
import SearchResult from './order_search';
import * as Controller from '../../memory/controller';
import * as UserPriceSource from '../../userPriceSource';
import * as RoleUser from '../../roleUser';
import * as ManageConection from '../../manage/manageConnection';
import DeviceInfo from 'react-native-device-info';
import ButtonConfirmPlace from './components/ButtonComfirmPlace';
import BackDropView from '~s/watchlist/Component/BackDropView';
import BackDropView2 from '~s/watchlist/Component/BackDropView2';
import KeyboardSmart from '~/component/keyboard_smart';
// Depth cos summary
import NestedScrollView from '~s/watchlist/Component/NestedScroll.wl';
import Shadow from '~/component/shadow';
import AnimatedView, { ENUM } from '~/component/animation_view/index';
const { height: heightDevice, width: widthDevice } = Dimensions.get('window');
const infoUrl = 'https://om-dev3.equixapp.com/v3/info';
const userAgent = dataStorage.userAgent;
const headerObj = {
    Authorization: `Bearer ${Controller.getAccessToken()}`,
    'Content-Type': 'application/json',
    'user-agent': userAgent
};
const JSON = Util.json;
const {
    SYMBOL_CLASS,
    SYMBOL_CLASS_DISPLAY,
    FLASHING_FIELD,
    PRICE_DECIMAL,
    EXCHANGE_STRING,
    NOTE_STATE,
    PTC_CHANNEL,
    KEYBOARD_TYPE,
    TYPE_VALID_CUSTOM_INPUT,
    ORDER_TYPE_STRING,
    DURATION_STRING,
    DURATION_MAPPING_STRING_CODE,
    DEFAULT_VAL,
    EXCHANGE_CODE,
    DURATION_CODE,
    ACCOUNT_STATE,
    CURRENCY,
    ICON_NAME,
    ID_ELEMENT,
    SCREEN,
    EVENT,
    CHANNEL,
    ACTION_ORD: ACTION,
    NAVIGATOR_EVENT: NAV_EVENT
} = Enum;
export const DEFAULT_HEGIHT =
    Platform.OS === 'android'
        ? 16 + 16
        : isIphoneXorAbove()
            ? 16 + 46
            : 16 + 32;
export const TRADELIST_PADDING = 16;
const HEIGHT_DEVICE = heightDevice;
const {
    add,
    cond,
    diff,
    divide,
    eq,
    lessThan,
    and,
    block,
    set,
    abs,
    clockRunning,
    greaterThan,
    sub,
    Value,
    or,
    not,
    call,
    interpolate,
    greaterOrEq,
    lessOrEq
} = Animated;

export const TYPE_PICKER = {
    ORDER_TYPE: 'ORDER_TYPE',
    DURATION: 'DURATION',
    EXCHANGE: 'EXCHANGE'
};

const heightSearchBarDefault = Platform.OS === 'android' ? 120 : 160;
const TRANS = Platform.OS === 'ios' ? HEIGHT_DEVICE : HEIGHT_DEVICE;
export class BackDropViewCustom extends BackDropView2 {
    render() {
        let translateY = new Value(0);
        let translateX = new Value(0);
        if (this.props._scrollValue) {
            translateY = interpolate(this.props._scrollValue, {
                inputRange: [-1, 0, 1],
                outputRange: [0, 0, 1]
            });
            translateX = interpolate(this.props._scrollValue, {
                inputRange: [
                    heightDevice - 2,
                    heightDevice - 1,
                    heightDevice,
                    heightDevice + 1
                ],
                outputRange: [0, 0, widthDevice, widthDevice]
            });
        }
        const spaceTop = this.getSpaceTop();
        const opacityAni = this.getOpacity(translateY, spaceTop);

        const iconTranslateY = sub(spaceTop, TRANS);
        const bgTranslateY = add(iconTranslateY, 24);
        return (
            <React.Fragment>
                <Animated.View
                    onLayout={this.onContainerLayout}
                    style={[
                        stylesBackDrop.container,
                        {
                            opacity: opacityAni,
                            transform: [
                                // { translateY },
                                // { translateY: bgTranslateY },// Loi keyboard bat len thi se day ca backdrop len tren
                                { translateX }
                            ]
                        }
                    ]}
                ></Animated.View>
            </React.Fragment>
        );
    }
}
const stylesBackDrop = StyleSheet.create({
    dragIcon: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 8
    },
    container: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: CommonStyle.backgroundColor,
        alignItems: 'center',
        justifyContent: 'flex-start'
    }
});
export class NestedScrollViewFinal extends NestedScrollView {
    withPreAdditiveOffset() {
        const prev = new Value(0);
        const offset = new Value(0);
        const newPos = new Value(0);

        const minPos = _.first(this.snapPoint);
        const maxPos = add(_.last(this.snapPoint), this.heightContainer);
        const isSetNewPosVal =
            Platform.OS === 'android'
                ? [
                    cond(
                        eq(this.panState, State.END),
                        [],
                        [set(this.translateY, newPos)]
                    )
                ]
                : [set(this.translateY, newPos)];
        return cond(
            eq(this.panState, State.BEGAN),
            [
                call([], () => {
                    console.log('BDCM withPreAdditiveOffset begin');
                }),
                set(prev, this.gesture.y)
            ],
            [
                cond(
                    greaterThan(diff(this.velocityClock), 100),
                    set(this.velocityY, 0)
                ),
                call([this.gesture.y, prev], ([a, b]) => {
                    console.log(
                        `DCM withPreAdditiveOffset gestureY ${a} pre ${b}`
                    );
                }),
                set(offset, sub(this.gesture.y, prev)),
                set(newPos, add(this.translateY, offset)),

                cond(
                    or(
                        and(greaterThan(newPos, minPos), this.isScrollContent),
                        lessThan(newPos, maxPos)
                    ),
                    set(newPos, add(this.translateY, divide(offset, 3)))
                ),
                isSetNewPosVal,
                set(prev, this.gesture.y),
                []
                // cond(eq(this.panState, State.END), [
                // 	call([], () => {
                // 		console.log('BDCM withPreAdditiveOffset END')
                // 	}),
                // 	set(prev, new Value(0))
                // ])
            ]
        );
    }
    getTransY() {
        const { _scrollValue, _isScrollContent } = this.props;
        const curValue = new Value(0);
        return block([
            cond(
                and(greaterOrEq(this.translateY, 0)),
                set(curValue, this.translateY)
            ),
            cond(and(lessOrEq(this.translateY, 0)), set(curValue, 0)),
            curValue
        ]);
    }
    render() {
        this.handleWrapPoint();
        const transY = this.getTransY();
        return (
            <Animated.View
                onMoveShouldSetResponder={() => {
                    console.log('DCM onMoveShouldSetResponder');
                    Keyboard.dismiss();
                    return false;
                }}
                pointerEvents="box-none"
                onLayout={this.onContainerLayout}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }}
            >
                <Animated.View
                    style={{
                        marginTop: this.props.spaceTop,
                        position: 'absolute',
                        // borderWidth: 1,
                        // borderColor: 'red',
                        width: '100%',
                        transform: [{ translateY: transY }]
                    }}
                >
                    <Shadow />
                </Animated.View>
                <Animated.View
                    pointerEvents="box-none"
                    style={{
                        minHeight: add(this.heightContainer, 20),
                        marginTop: this.props.spaceTop + 2,
                        overflow: 'hidden',
                        position: 'absolute',
                        width: '100%',
                        borderTopLeftRadius: 22,
                        borderTopRightRadius: 22
                    }}
                >
                    {this.renderContent()}
                </Animated.View>
            </Animated.View>
        );
    }
}
export class Order extends Component {
    constructor(props) {
        super(props);
        this.emitter =
            Platform.OS === 'android'
                ? DeviceEventEmitter
                : NativeAppEventEmitter;
        this.heightDevices = heightDevice;
        this.trans =
            Platform.OS === 'ios' ? this.heightDevices : this.heightDevices;
        this.dic = {
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
        this.scrollValue = new Animated.Value(0);
        this._scrollContentValue = new Animated.Value(0);
        this._scrollContainer = new Value(this.heightDevices);
        this.pageYKeyBoard = 0;
        this.currentAccount = Util.cloneFn(dataStorage.currentAccount || {});
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        // Channe
        this.channelLoadingOrder = OrderStreamingBusiness.getChannelLoadingOrder();
        this.channelPriceOrder = OrderStreamingBusiness.getChannelPriceOrder();
        this.state = {
            isCheckVetting: false,
            type: Enum.TYPE_MESSAGE.ERROR,
            heightTest: 0,
            isRender: this.props.fromBottomTab
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isConnected && !this.props.isConnected) {
            this.refOrderDetail && this.refOrderDetail.clickRefreshPrice();
        } else if (!nextProps.isConnected && this.props.isConnected) {
        }
    }
    componentDidMount() {
        // const showListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        // const hideListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        // this._listeners = [
        // 	Keyboard.addListener(showListener, this.handleKeyboardShow),
        // 	Keyboard.addListener(hideListener, this.handleKeyboardHide)
        // ];
        if (!this.props.fromBottomTab) {
            // Khi click new order tu watchlist, position detail thi se delay render Order_search uu tien hien thi new_order_detail
            setTimeout(() => {
                this.setState({
                    isRender: true
                });
            }, 500);
        }
        console.log('DCM time open new order2', new Date().getSeconds());
    }
    handleKeyboardShow = this.handleKeyboardShow.bind(this);
    handleKeyboardShow(event) { }
    handleKeyboardHide(event) { }
    componentWillUnmount() {
        // this._listeners.forEach(listener => listener.remove());
    }

    onNavigatorEvent = (event) => {
        if (event.type === 'DeepLink') {
            switchForm(this.props.navigator, event);
        }
        if (event.id === NAV_EVENT.BACK_BUTTON_PRESS) {
            this.refSearchBox &&
                this.refSearchBox.doBlur &&
                this.refSearchBox.doBlur();
            return true;
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'backPress':
                    return true;
                case 'order_refresh':
                    break;
                case 'sideMenu':
                    break;
                case 'menu_ios':
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    setCurrentScreen(analyticsEnum.newOrder);
                    break;
                case 'didAppear':
                    func.setCurrentScreenId(ScreenId.ORDER);
                    break;
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    };
    onCancelSearch = () => {
        const navigatorEventID = this.props.navigatorEventIDParents;
        this.emitter.emit(navigatorEventID, {
            id: 'hidden_new_order'
        });
        this.refViewWrapper.animate({
            type: ENUM.FADE_OUT
        });
        setTimeout(() => {
            dataStorage.animationDirection = 'fadeIn';
            dataStorage.isInitTabCos = true;
            this.props.navigator.dismissAllModals({
                animationType: 'none'
            });
        }, 500);
    };
    onSelectSymbolClass = (selectedClass) => {
        this.refSearchResult &&
            this.refSearchResult.onSelectSymbolClass(selectedClass);
    };

    // Search Bar
    getListDisplayCurrentAccount = () => {
        let listAccount = Controller.getListAccount();
        listAccount = listAccount.filter(
            (e) => e.status === ACCOUNT_STATE.ACTIVE
        );
        return listAccount.map((e) => this.getDisplayAccount(e));
    };

    getDisplayAccount = (accountObj = {}) => {
        return `${accountObj.account_name || ''} (${
            accountObj.account_id || ''
            })`;
    };

    clearError() {
        this.refOrderDetail &&
            this.refOrderDetail.clearError &&
            this.refOrderDetail.clearError();
    }

    setLoginUserType = (accountInfo, cb) => {
        const k = accountInfo;
        func.setAccountId(k.account_id);
        // check account reviews
        if (k.status === 'inactive') {
            // Tài khoản bị khoá
            // this.props.appActions.checkReviewAccount(false)
            this.props.appActions.setLoginUserType(loginUserType.LOCKED);
            dataStorage.isLockedAccount = true;
            dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
            cb && cb();
        } else {
            // Redux - isReviewAccount = falses
            // Tài khoản member
            // this.props.appActions.checkReviewAccount(false)
            this.props.appActions.setLoginUserType(loginUserType.MEMBER);
            dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
            dataStorage.isLockedAccount = false;
            cb && cb();
        }
    };

    dismissForm = this.dismissForm.bind(this);
    dismissForm() {
        setTimeout(() => {
            this.refButtonConfirm && this.refButtonConfirm.showContent();
        }, 500); // Bi log bug lau hien button
    }

    onClose = () => {
        this.refOrderDetail && this.refOrderDetail.onClose();
    };
    renderTitle = () => {
        return <Text style={styles.title}>{I18n.t('newAlert')}</Text>;
    };
    renderNavbarV2 = () => {
        return (
            <Animated.View style={{ overflow: 'visible' }}>
                <View
                    renderToHardwareTextureAndroid={true}
                    ref={(ref) => (this.refSearch = ref)}
                    style={{ backgroundColor: CommonStyle.ColorTabNews }}
                >
                    <SearchBar
                        onRef={(ref) => {
                            this.refSearchBox = ref;
                        }}
                        listClassSymbol={this.dic.listSymbolClass}
                        // autoFocus={!this.dic.code}
                        isNotShowMenu={this.props.isNotShowMenu}
                        navigator={this.props.navigator}
                        textSearch={this.textSearch}
                        onCancel={this.onCancelSearch}
                        onSearch={this.onSearch}
                    />
                    <NetworkWarning />
                </View>
            </Animated.View>
        );
    };
    onSearch = (textSearch) => {
        this.textSearch = textSearch;
        this.searchSymbol && this.searchSymbol(textSearch);
    };
    resetFocusInput = () => {
        this.refOrderDetail &&
            this.refOrderDetail.resetFocusInput &&
            this.refOrderDetail.resetFocusInput();
    };
    c2rOrderDetail = () => {
        this.refOrderDetail &&
            this.refOrderDetail.clickRefreshPrice &&
            this.refOrderDetail.clickRefreshPrice();
    };
    onPressSearch = (symbolObj, isRefresh) => {
        // Reset direction animation
        this.setThis(symbolObj);
        this.refSearchResult.isShowDetail = true;
        setTimeout(() => {
            this.refOrderDetail &&
                this.refOrderDetail.onPressSearch(symbolObj, isRefresh);
        }, 0);
    };
    setThis = (symbolObj) => {
        const { symbol, class: classSymbol } = symbolObj;
        this.code = symbol;
    };
    onFocusSearchBox = () => {
        if (this.props.code) return;
        this.refSearchBox && this.refSearchBox.doFocus();
    };
    renderResultSearch = () => {
        return (
            <View style={{ flex: 1 }}>
                {this.renderNavbarV2()}
                <SearchResult
                    {...this.props}
                    resetFocusInput={this.resetFocusInput}
                    c2rOrderDetail={this.c2rOrderDetail}
                    onFocusSearchBox={this.onFocusSearchBox}
                    ref={(ref) => (this.refSearchResult = ref && ref)}
                    register={(fn) => (this.searchSymbol = fn)}
                    onPressSearch={this.onPressSearch}
                />
            </View>
        );
    };

    dismissKeyBoard = () => {
        Keyboard.dismiss();
    };

    hide = () => {
        if (this._nested) {
            if (this.refSearchResult) {
                this.refSearchResult.isShowDetail = false;
                this.setState({});
            }
            this._nested.hide();
        }
    };
    show = (cb) => {
        if (this.refSearchResult) {
            this.refSearchResult.isShowDetail = true;
            this.setState({});
        }
        this._nested && this._nested.show(cb);
    };
    goToMiddle = () => {
        this._nested && this._nested.snapToMiddle();
    };
    goToTop = () => {
        this._nested && this._nested.snapToTop();
    };
    onPressPlaceOrder = () => {
        this.refOrderDetail && this.refOrderDetail.confirmOrder();
    };
    setCashAvailable = () => {
        setTimeout(() => {
            this.refButtonConfirm &&
                this.refButtonConfirm.setCashAvailable(
                    this.refOrderDetail &&
                    this.refOrderDetail.renderCashAvailable()
                );
        }, 300);
    };

    setVetingLoading = () => {
        this.refButtonConfirm && this.refButtonConfirm.updateCheckVetting(true);
    };
    setVetingLoaded = () => {
        this.refButtonConfirm &&
            this.refButtonConfirm.updateCheckVetting(false);
    };
    setIsBuy = (isBuy) => {
        this.refButtonConfirm && this.refButtonConfirm.setIsBuy(isBuy);
    };
    setRefViewWrapper = (ref) => {
        this.refViewWrapper = ref;
    };
    handleUpdateLayout = (pageYTextInput, heightTextInput) => {
        this.refKeyboardSmart &&
            this.refKeyboardSmart.handleUpdateLayout(
                pageYTextInput,
                heightTextInput
            );
    };
    renderButtonClearData = (node) => {
        setTimeout(() => {
            this.refButtonConfirm &&
                this.refButtonConfirm.setClearDataAndNote(node);
        }, 100);
    };
    onHideDetail = () => {
        Keyboard.dismiss();
        this.refSearchResult.isShowDetail = false;
    };
    render() {
        return (
            <AnimatedView
                ref={this.setRefViewWrapper}
                type={ENUM.SLIDE_IN_UP}
                style={{
                    flex: 1
                }}
                styleContent={{}}
            >
                {this.state.isRender && this.renderResultSearch()}
                <KeyboardSmart
                    _scrollContentValue={this._scrollContentValue}
                    _scrollValue={this.scrollValue}
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
                        _scrollValue={this._scrollContainer}
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
                    <OrderDetail
                        {...this.props}
                        handleUpdateLayout={this.handleUpdateLayout}
                        onCancelSearch={this.onCancelSearch}
                        setVetingLoading={this.setVetingLoading}
                        setVetingLoaded={this.setVetingLoaded}
                        setIsBuy={this.setIsBuy}
                        hide={this.hide}
                        refSearchBox={this.refSearchBox}
                        show={this.show}
                        goToTop={this.goToTop}
                        goToMiddle={this.goToMiddle}
                        onHideDetail={this.onHideDetail}
                        setCashAvailable={this.setCashAvailable}
                        refButtonConfirm={this.refButtonConfirm}
                        renderButtonClearData={this.renderButtonClearData}
                        ref={(ref) => (this.refOrderDetail = ref && ref)}
                        _scrollValue={this.scrollValue}
                        _scrollContentValue={this._scrollContentValue}
                        _scrollContainer={this._scrollContainer}
                    // _isScrollContent={new Animated.Value(0)}
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
                    <ButtonConfirmPlace
                        _scrollValue={this._scrollContainer}
                        onPress={this.onPressPlaceOrder}
                        isBuy={this.props.isBuy}
                        // renderCashAvailable={this.setCashAvailable}
                        isConnected={this.props.isConnected}
                        code={this.code}
                        ref={(ref) => (this.refButtonConfirm = ref)}
                    />
                </View>
            </AnimatedView>
        );
    }
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(newOrderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Order);
