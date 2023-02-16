import React, { Component } from 'react';
import _ from 'lodash';
import { Text, View, Animated, TouchableOpacity, Platform } from 'react-native';
import { connect } from 'react-redux'

import { dataStorage } from '../../../storage';
import I18n from '~/modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import {
    offTouchIDSetting,
    logAndReport,
    logDevice,
    getDisplayName,
    pinComplete
} from '../../../lib/base/functionUtil';
import * as Controller from '../../../memory/controller'
import Enum from '../../../enum'
import Icon from 'react-native-vector-icons/Ionicons';
import Flag from '../../../component/flags/flag';

import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import * as api from '~/api';
import History from './history';
import BtnModifyCancel from './buttonModifyCancel';
import OrderDetail from './order/order_detail';
// import XComponent from '../../../component/xComponent/xComponent';
import PriceTradeHeader from './price/price_tradeHeader';
import Auth from '../../../lib/base/auth';
import orderStateEnum from '../../../constants/order_state_enum';
import orderType from '../../../constants/order_type';
import * as RoleUser from '../../../roleUser';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../../setting/auth_setting/auth_setting.actions';
import AuthenByPin from '../../../component/authen_by_pin/authen_by_pin';
import TouchAlert from '../../setting/auth_setting/TouchAlert';
import * as loginActions from '../../../screens/login/login.actions';
class SlidingPanel extends Component {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.dic = {};
        this.androidTouchID = null;
        this.symbolObject = dataStorage.symbolEquity[props.symbol] || {}
        this.init();
        this.scrollValue = new Animated.Value(0)
        this.scrollContainerValue = new Animated.Value(0)
        this.addListenerForContainerScroll()
        this.addListenerForChildrenScroll()
        this.params = {}
        this.state = {
            data: props.data || {},
            listOrder: [],
            isCancelling: false,
            isFrezing: false,
            animationLogin: '',
            isError: false,
            isForgotPinModalVisible: false,
            isAndroidTouchIdModalVisible: false,
            exchange: ''
        }
        this.isMount = false;
        this.auth = new Auth(this.props.navigator, this.props.login.email, this.props.login.token, this.showFormLogin);
    }
    init() {
        this.handlePressOn = this.handlePressOn.bind(this);
        this.getDataHistory = this.getDataHistory.bind(this);
    }
    componentWillReceiveProps(props) {
        if (props.data) {
            if (props.data.symbol) {
                this.symbolObject = dataStorage.symbolEquity[props.data.symbol] || {}
            }
            this.setState({ data: props.data })
        }
    }
    addListenerForContainerScroll = () => {
        this.scrollContainerValue.addListener(({ value }) => {
        });
    }
    addListenerForChildrenScroll = () => {
        this.scrollValue.addListener(({ value }) => {
        })
    }
    showFormLogin = (successCallback, params) => {
        try {
            if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
                offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
            }
            if (successCallback) this.showFormLoginSuccessCallback = successCallback;
            this.params = params || {}
            this.authenPin && this.authenPin.showModalAuthenPin();
        } catch (error) {
            console.log('showFormLogin listContent logAndReport exception: ', error)
            logAndReport('showFormLogin listContent exception', error, 'getIcon listContent');
        }
    }
    handlePressOn() {
        try {
            this.getDataHistory();
            this.onPressOrder();
        } catch (error) {
            console.log('error handle Press On ============================+>', error)
        }
    }
    onPressOrder = () => {
        this.nestedScroll && this.nestedScroll.snapContainerTopTop()
    }
    onClose = () => {
        this.nestedScroll && this.nestedScroll.hideContainer();
    }
    renderDragIcon = () => {
        return <View style={[CommonStyle.dragIcons, { marginLeft: -(36 - 8) }]} />
    }
    renderEmptyView = () => {
        return <View style={CommonStyle.dragIconsVisible} />
    }
    renderCloseIcon = () => {
        return <TouchableOpacity
            onPress={this.onClose}
            style={{
                height: 24,
                paddingTop: 8
            }}
        >
            <View style={[{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#ececec',
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <Icon
                    style={{ lineHeight: 24, fontWeight: 'bold' }}
                    name='md-close'
                    color={CommonStyle.fontColor}
                    size={18}
                />
            </View>
        </TouchableOpacity>
    }
    renderClassTag() {
        const classSymbol = this.symbolObject && this.symbolObject.class;
        const classTag = classSymbol ? (classSymbol + '').toUpperCase().slice(0, 2) : '';
        if (!classTag) return null;
        const getClassBackground = () => {
            return CommonStyle.classBackgroundColor[classTag]
        }
        return (
            <View style={{
                width: 13,
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
                    fontSize: CommonStyle.fontSizeXS - 3,
                    textAlign: 'center'
                }}>{classTag}</Text>
            </View>
        );
    }
    renderSymbolName = () => {
        const displayName = this.symbolObject && this.symbolObject.display_name;
        return (
            <View style={{ display: 'flex', width: '70%', alignItems: 'center', flexDirection: 'row', paddingLeft: 16 }}>
                <Text style={[{
                    fontFamily: 'HelveticaNeue-Bold',
                    fontSize: CommonStyle.fontSizeXXL,
                    color: CommonStyle.fontColor,
                    fontWeight: '700'
                }]}>
                    {displayName || ''}
                </Text>
            </View>
        );
    }

    renderCompanyName = () => {
        const { company_name: compName, company, security_name: secName } =
            this.symbolObject || {};
        const companyName = (
            compName ||
            company ||
            secName ||
            ''
        ).toUpperCase();
        return (
            <View style={[{
                flexDirection: 'row',
                paddingHorizontal: 16
            }]}>
                <View style={{ width: '80%', alignItems: 'flex-start' }}>
                    <Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'left', color: CommonStyle.fontColor }]}>{companyName}</Text>
                </View>
                <View style={[{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row'
                }]}>
                    <Flag
                        type={'flat'}
                        code={'AU'}
                        size={20}
                        style={{ marginRight: 8, marginTop: 1.5 }}
                    />
                    {this.renderClassTag()}
                </View>
            </View>
        );
    }
    authFunction(data) {
        try {
            this.params = data
            if (dataStorage.pinSetting !== 0) {
                this.onModifyOrder(data)
            } else {
                let objAndroidTouchIDFn = null;
                if (Platform.OS === 'android') {
                    objAndroidTouchIDFn = {
                        showAndroidTouchID: this.showAndroidTouchID,
                        hideAndroidTouchID: this.hideAndroidTouchID,
                        androidTouchIDFail: this.androidTouchIDFail
                    }
                }
                this.auth.authentication(this.onModifyOrder, null, objAndroidTouchIDFn, data);
            }
        } catch (error) {
            console.log('authFunction listContent logAndReport exception: ', error)
            logAndReport('authFunction listContent exception', error, 'getIcon listContent');
        }
    }
    onModifyOrder(data) {
        try {
            // this.isMount && this.setState({ isFrezing: false })
            if (!Controller.getLoginStatus()) return;
            dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
            // this.checkSymbolIsInParitech()
            const originOrderType = this.getOriginOrderType();
            const displayName = getDisplayName(data.symbol)
            this.props.navigator.push({
                animationType: 'slide-up',
                backButtonTitle: ' ',
                title: `${this.state.displayName} (--)`,
                screen: 'equix.ModifyOrder',
                passProps: {
                    displayName,
                    data,
                    setChangeTypeFn: this.setChangeTypeOrder,
                    setChangeTypeFn2: this.setChangeTypeOrder2,
                    originOrderType: originOrderType
                },
                navigatorStyle: CommonStyle.navigatorSpecial
            })
        } catch (error) {
            this.isMount && this.setState({ isFrezing: false })
            console.log('onModifyOrder listContent logAndReport exception: ', error)
            logAndReport('onModifyOrder listContent  exception', error, 'onModifyOrder listContent');
        }
    }
    setChangeTypeOrder = (cb) => {
        this.callBackWhenChangeType = cb;
    }

    setChangeTypeOrder2 = (cb) => {
        this.callBackWhenChangeType2 = cb;
    }
    getOriginOrderType() {
        try {
            // this.checkSymbolIsInParitech()
            // const { data } = this.props;
            const data = this.state.data
            if (!data) return;
            const type = (data.exchange === 'ASX' ? data.order_type_origin : data.order_type + '').toUpperCase();
            switch (data.condition_name) {
                case orderConditionString.StopLoss:
                    if (data.limit_price && !data.stop_price) {
                        return orderType.STOPLIMIT_ORDER;
                    }
                    if (!data.limit_price && data.stop_price) {
                        return orderType.STOPLOSS_ORDER;
                    }
                    return orderType[type];
                case orderConditionString.TrailingStopLoss:
                    return orderType.TRAILINGSTOPLIMIT_ORDER;
            }
            // let _orderType = type.replace('_ORDER', '');
            return orderType[type];
        } catch (error) {
            console.log('getOriginOrderType listContent logAndReport exception: ', error)
            logAndReport('getOriginOrderType listContent exception', error, 'getIcon listContent');
        }
    }
    renderHistory = () => {
        if (!this.state.listOrder || !this.state.listOrder.length) return <Text>Loading ...</Text>
        return <View style={{ marginHorizontal: 16 }}>
            {
                this.state.listOrder.map((e, i) => {
                    isPartiallFilled = e.order_status === orderStateEnum.PARTIALLY_FILLED
                    return <View key={i}>
                        <History
                            isPartiallFilled={isPartiallFilled}
                            style={{ borderColor: CommonStyle.fontBorderGray, borderTopWidth: i === 0 ? 0 : 1 }}
                            key={e.order_detail_id}
                            index={i}
                            data={e}
                            conditionName={this.state.data.condition_name}
                            displayName={this.symbolObject.display_name}
                        />
                    </View>
                })
            }
        </View>
    }

    getDataHistory() {
        try {
            const data = this.state.data;
            const check = this.checkEmptyObject(data);
            if (!check) return;
            let listOrder = [];
            const orderId = data.broker_order_id
            const orderDetailUrl = api.getUrlOrderDetail(orderId);
            if (!orderId) {
                this.setState({
                    listOrder: []
                })
            }
            api.requestData(orderDetailUrl, true).then(res => {
                if (res) {
                    if (res.length) {
                        logDevice('info', `ORDER HISTORY API: ${JSON.stringify(res)}`)
                        listOrder = res.sort(function (a, b) {
                            return b.order_detail_id - a.order_detail_id;
                        });
                        logDevice('info', `ORDER HISTORY API AFTER SORT: ${JSON.stringify(listOrder)}`);
                        this.setState({
                            listOrder,
                            data
                        })
                    } else {
                        this.setState({
                            listOrder: [],
                            data
                        });
                    }
                }
            }).catch(error => {
                console.log('getDataHistory listContent logAndReport exception: ', error)
                logAndReport('getDataHistory listContent exception', error, 'getDataHistory listContent');
                this.setState({ listOrder: [], data }, () => this.onPressOrder());
            })
        } catch (err) {
            console.log('getDataHistory listContent logAndReport exception: ', error)
            logAndReport('getDataHistory listContent exception', err, 'getDataHistory listContent');
            this.setState({ listOrder: [], data }, () => this.onPressOrder());
        }
    }
    checkEmptyObject = (obj) => {
        if (!obj) return false;
        if (obj.constructor === Object && Object.keys(obj).length === 0) return false;
        return true;
    }
    render() {
        const check = this.checkEmptyObject(this.state.data);
        if (!check) return <View />
        return <React.Fragment>
            <NestedScrollView
                scrollContainerValue={this.scrollContainerValue}
                scrollValue={this.scrollValue}
                ref={sef => (this.nestedScroll = sef)}
                style={{ flex: 1 }}
            >
                <ScrollLoadAbs
                    style={{ backgroundColor: CommonStyle.backgroundColor }}
                    scrollValue={this.scrollValue}>
                    <View
                        isAbsolute
                        scrollValue={this.scrollValue}
                        ref={ref => (this.scrollLoad = ref)}
                        style={{ backgroundColor: CommonStyle.backgroundColor }}
                    >
                        <View
                            style={[
                                CommonStyle.dragHandlerNewOrder,
                                {
                                    flexDirection: 'row',
                                    marginTop: Platform.OS === 'ios' ? 4 : 0,
                                    shadowColor: CommonStyle.fontColor,
                                    shadowOffset: {
                                        width: 0,
                                        height: -4
                                    },
                                    shadowOpacity: 0.1,
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    height: 32
                                }
                            ]}
                        >
                            {this.renderEmptyView()}
                            {this.renderDragIcon()}
                            {this.renderCloseIcon()}
                        </View>
                        <PriceTradeHeader />
                        <BtnModifyCancel
                            data={this.state.data}
                            navigator={this.props.navigator}
                            disabledButtonModify={!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_MODIFY_ORDER_BUTTON)}
                            disabledButtonCancel={!RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.PERFORM_CANCEL_ORDER_BUTTON)}
                        />
                    </View>
                    <OrderDetail
                        data={this.state.data}
                    />
                    {this.renderHistory()}
                    <View style={{ height: 128 }} />
                </ScrollLoadAbs>
            </NestedScrollView>
            {
                this.auth.showLoginForm(this.state.isForgotPinModalVisible,
                    I18n.t('resetYourPin'),
                    I18n.t('pleaseEnterYourPassword'),
                    this.state.animationLogin,
                    () => {
                        this.isMount && this.setState({
                            animationLogin: ''
                        });
                    }, () => {
                        this.isMount && this.setState({
                            isForgotPinModalVisible: false
                        });
                    }, () => {
                        this.props.loginActions.authError();
                        this.isMount && this.setState({
                            // animationLogin: 'shake',
                            isError: true
                        });
                    }, () => {
                        this.props.loginActions.authSuccess();
                        this.isMount && this.setState({
                            isForgotPinModalVisible: false,
                            isError: false
                        });
                    }, accessToken => {
                        this.props.loginActions.authSuccess();
                        this.isMount && this.setState({
                            isForgotPinModalVisible: false,
                            isError: false
                        }, () => {
                            this.forgotPinSuccessCb(accessToken)
                        });
                    }, null, null, this.state.isError, true)
            }
            <AuthenByPin
                onForgotPin={this.onForgotPin}
                onChangeAuthenByFingerPrint={this.onChangeAuthenByFingerPrint}
                onRef={ref => this.authenPin = ref}
                errorCallback={this.errorCallback.bind(this)}
                onPinCompleted={this._onPinCompleted}
            />
            <TouchAlert
                ref={ref => this.androidTouchID = ref}
                visible={this.state.isAndroidTouchIdModalVisible}
                dismissDialog={this.hideAndroidTouchID}
                authenByPinFn={Object.keys(this.params).length > 0 ? this.showFormLogin.bind(this, this.onModifyOrder, this.params) : this.showFormLogin.bind(this, this.cancelOrder, this.params)}
            />
        </React.Fragment>
    }
    onChangeAuthenByFingerPrint() {
        try {
            this.authenPin && this.authenPin.hideModalAuthenPin();
            let objAndroidTouchIDFn = null;
            if (Platform.OS === 'android') {
                objAndroidTouchIDFn = {
                    showAndroidTouchID: this.showAndroidTouchID,
                    hideAndroidTouchID: this.hideAndroidTouchID,
                    androidTouchIDFail: this.androidTouchIDFail
                }
            }
            if (this.type && this.type === 'modify') {
                this.auth.authentication(this.onModifyOrder, null, objAndroidTouchIDFn, this.params);
            } else if (this.type && this.type === 'cancel') {
                this.auth.authentication(this.cancelOrder, null, objAndroidTouchIDFn);
            }
        } catch (error) {
            console.log('onChangeAuthenByFingerPrint listContent logAndReport exception: ', error)
            logAndReport('onChangeAuthenByFingerPrint listContent exception', error, 'getIcon listContent');
        }
    }
    forgotPinSuccessCb(accessToken) {
        const email = dataStorage.emailLogin
        dataStorage.numberFailEnterPin = 0;
        // func.setLoginConfig(false);
        setTimeout(() => {
            if (Platform.OS === 'ios') {
                this.props.navigator.showModal({
                    screen: 'equix.SetPin',
                    animated: true,
                    animationType: 'slide-up',
                    navigatorStyle: {
                        statusBarColor: CommonStyle.statusBarBgColor,
                        statusBarTextColorScheme: 'light',
                        navBarHidden: true,
                        navBarHideOnScroll: false,
                        navBarTextFontSize: 16,
                        drawUnderNavBar: true,
                        navBarNoBorder: true,
                        screenBackgroundColor: 'transparent',
                        modalPresentationStyle: 'overCurrentContext'
                    },
                    passProps: {
                        type: 'new',
                        token: accessToken,
                        email,
                        forgotPinCallback: this.forgotPinCallback,
                        isShowCancel: true,
                        cancelAutoLoginFn: () => {
                            this.props.navigator.dismissModal();
                        }
                    }
                })
            } else {
                this.props.navigator.showModal({
                    screen: 'equix.SetPin',
                    animated: true,
                    animationType: 'slide-up',
                    navigatorStyle: {
                        statusBarColor: CommonStyle.statusBarBgColor,
                        statusBarTextColorScheme: 'light',
                        navBarHidden: true,
                        navBarHideOnScroll: false,
                        navBarTextFontSize: 16,
                        drawUnderNavBar: true,
                        navBarNoBorder: true,
                        screenBackgroundColor: 'transparent',
                        modalPresentationStyle: 'overCurrentContext'
                    },
                    passProps: {
                        type: 'new',
                        token: accessToken,
                        email,
                        forgotPinCallback: this.forgotPinCallback
                    }
                })
            }
        }, 500)
    }
    cancelOrder() {
        this.showConfirmScreen();
    }
    onForgotPin() {
        Keyboard.dismiss();
        this.authenPin && this.authenPin.hideModalAuthenPin();
        setTimeout(() => {
            this.isMount && this.setState({
                isForgotPinModalVisible: true
            })
        }, 500)
    }
    authenPinFail() {
        this.authenPin && this.authenPin.authenFail()
    }
    errorCallback() {
        this.isMount && this.setState({ isFrezing: false })
    }
    _onPinCompleted(pincode) {
        const store = Controller.getGlobalState()
        const login = store.login;
        const refreshToken = login.loginObj.refreshToken;
        pinComplete(pincode, this.authenPin, this.showFormLoginSuccessCallback, this.authenPinFail.bind(this), this.params, refreshToken)
    }
    hideAndroidTouchID() {
        dataStorage.onAuthenticating = false
        this.isMount && this.setState({
            isAndroidTouchIdModalVisible: false
        })
    }
    componentDidMount() {
        this.props.setRef && this.props.setRef(this);
        this.isMount = true;
    }
    componentWillUnmount() {
        this.isMount = false;
    }
}
function mapStateToProps(state, ownProps) {
    return {
        app: state.app,
        login: state.login
    };
}
function mapDispatchToProps(dispatch) {
    return {
        // actions: bindActionCreators(workingActions, dispatch),
        loginActions: bindActionCreators(loginActions, dispatch),
        authSettingActions: bindActionCreators(authSettingActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(SlidingPanel);
// export default SlidingPanel;
