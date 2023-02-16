import React, { Component } from 'react';
import _ from 'lodash';
import { Text, PixelRatio, View, Animated, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux'

// Func
import { func, dataStorage } from '../../../storage';
import I18n from '~/modules/language';
import filterType from '~/constants/filter_type';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Emitter from '@lib/vietnam-emitter'
import {
    formatNumberNew2, formatNumberNew2ClearZero, offTouchIDSetting,
    logAndReport, checkPropsStateShouldUpdate, renderTime, logDevice, getDisplayName, pinComplete
} from '../../../lib/base/functionUtil';
import * as Controller from '../../../memory/controller'
import Enum from '../../../enum'
import * as Util from '../../../util';
import styles from './style/details';
import Icon from 'react-native-vector-icons/Ionicons';
import Flag from '../../../component/flags/flag';
import TouchableOpacityOpt from '../../../component/touchableOpacityOpt';
import Flashing from '../../../component/flashing/flashing.1';

import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import * as api from '~/api';
import ChangePoint from './change_point';
import ChangePercent from './change_percent';
import * as Business from '../../../business';
import History from './history';
import PriceTradeComp from './priceTrade';
import OrderDetail from './order/order_detail';
import XComponent from '../../../component/xComponent/xComponent';
import PriceTradeHeader from './price/price_tradeHeader';
import PriceTradeInfo from './price/price_tradeInfo';
import PriceTradeButton from './price/price_tradeButton';
import Auth from '../../../lib/base/auth';
import orderStateEnum from '../../../constants/order_state_enum';
import orderType from '../../../constants/order_type';
import filterConditionName from '../../../constants/condition_name';
import loginUserType from '../../../constants/login_user_type';
import orderConditionString from '../../../constants/order_condition_string';
import * as RoleUser from '../../../roleUser';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../../setting/auth_setting/auth_setting.actions';
import AuthenByPin from '../../../component/authen_by_pin/authen_by_pin';
import TouchAlert from '../../setting/auth_setting/TouchAlert';
import * as loginActions from '../../../screens/login/login.actions';
import config from '../../../config';
import { iconsMap } from '../../../utils/AppIcons';
// import * as workingActions from './universearch_order.actions';

const FLASHING_FIELD = Enum.FLASHING_FIELD;

const {
    USER_TYPE, SCREEN, TITLE_FORM, ID_ELEMENT, ICON_NAME,
    SPECIAL_STRING, PRICE_DECIMAL, USER_TYPE_ROLE_SHOW_ORDER_STATE
} = Enum
// export default class SlidingPanel extends Component {
export class BtnModifyCancel extends Component {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.dic = {};
        this.init();
        this.state = {
            data: props.data || {},
            isFrezing: false,
            isForgotPinModalVisible: false,
            isAndroidTouchIdModalVisible: false,
            exchange: '',
            isCancelling: false
        }
        this.isMount = false;
        this.auth = new Auth(this.props.navigator, this.props.login.email, this.props.login.token, this.showFormLogin);
    }
    init() {
    }
    componentWillReceiveProps(props) {
        this.setState({
            data: props.data,
            isCancelling: props.isCancelling ? props.isCancelling : false
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
    onModifyOrder() {
        try {
            const { symbol } = this.state.data
            const originOrderType = this.getOriginOrderType();
            const displayName = Business.getDisplayName({ symbol })
            this.props.navigator.push({
                animationType: 'slide-up',
                backButtonTitle: ' ',
                title: `${displayName} (--)`,
                screen: 'equix.ModifyOrder',
                passProps: {
                    displayName: displayName,
                    data: this.state.data,
                    originOrderType
                },
                navigatorStyle: CommonStyle.navigatorSpecial
            })
        } catch (error) {
            console.log('onModifyOrder listContent logAndReport exception: ', error)
        }
    }
    // onModifyOrder(data) {
    //     try {
    //         // this.isMount && this.setState({ isFrezing: false })
    //         if (!Controller.getLoginStatus()) return;
    //         dataStorage.setScrollEnabled && dataStorage.setScrollEnabled(true);
    //         // this.checkSymbolIsInParitech()
    //         const originOrderType = this.getOriginOrderType();
    //         const displayName = getDisplayName(data.symbol)
    //         this.props.navigator.push({
    //             animationType: 'slide-up',
    //             backButtonTitle: ' ',
    //             title: `${this.state.displayName} (--)`,
    //             screen: 'equix.ModifyOrder',
    //             passProps: {
    //                 displayName,
    //                 data,
    //                 setChangeTypeFn: this.setChangeTypeOrder,
    //                 setChangeTypeFn2: this.setChangeTypeOrder2,
    //                 originOrderType: originOrderType
    //             },
    //             navigatorStyle: CommonStyle.navigatorSpecial
    //         })
    //     } catch (error) {
    //         this.isMount && this.setState({ isFrezing: false })
    //         console.log('onModifyOrder listContent logAndReport exception: ', error)
    //         logAndReport('onModifyOrder listContent  exception', error, 'onModifyOrder listContent');
    //     }
    // }
    onCancelOrder() {
        try {
            const screen = SCREEN.CONFIRM_CANCEL_ORDER;
            const accountInfo = dataStorage.currentAccount || {};
            const subtitle = `${accountInfo.account_name || ''} (${accountInfo.account_id || ''})`;
            this.props.navigator.showModal({
                screen,
                title: I18n.t('confirmCancelOrder'),
                subtitle,
                passProps: {
                    actor: func.getUserLoginId(),
                    oldOrdObj: this.state.data
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
        } catch (error) {
            console.log('showConfirmScreen listContent logAndReport exception: ', error)
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
    renderButtonTemp({ data, loading, isPendingNew, editableModify, editable, disableModifyStop, disableModifyBest }) {
        return (
            <View style={{
                paddingBottom: 16,
                paddingTop: 16,
                flexDirection: 'row',
                backgroundColor: CommonStyle.backgroundColor,
                marginLeft: 16,
                marginRight: 16
            }}>
                <View style={{ width: '50%' }}>
                    <TouchableOpacityOpt
                        disabled={
                            !editableModify ||
                            !this.props.app.isConnected ||
                            this.state.isCancelling ||
                            disableModifyStop ||
                            disableModifyBest ||
                            this.props.app.loginUserType === loginUserType.REVIEW ||
                            !func.isAccountActive() ||
                            this.props.disabledButtonModify
                        }
                        style={{ width: '100%', alignItems: 'flex-start' }}
                        onPress={() => {
                            this.isMount && this.setState({ isFrezing: true }, () => { })
                            this.type = 'modify'
                            this.onModifyOrder()
                        }}
                        timeDelay={Enum.TIME_DELAY}>
                        <View
                            testID={`buttonModifyOrder-${this.props.order_id}`}
                            style={[
                                styles.buttonWrapper,
                                {
                                    backgroundColor: !editableModify ||
                                        !this.props.app.isConnected ||
                                        this.state.isCancelling ||
                                        disableModifyStop ||
                                        disableModifyBest ||
                                        this.props.app.loginUserType === loginUserType.REVIEW ||
                                        !func.isAccountActive() ||
                                        this.props.disabledButtonModify
                                        ? CommonStyle.btnOrderDisableBg
                                        : config.colorVersion
                                }]}>
                            <Text style={[
                                CommonStyle.textButtonColor,
                                {
                                    color: !this.props.app.isConnected ||
                                        this.props.disabledButtonModify ||
                                        !editableModify
                                        ? 'black'
                                        : 'white',
                                    opacity: !editableModify ? 0.54 : 1
                                }]}>{I18n.t('modifyUpper')}</Text>
                        </View>
                    </TouchableOpacityOpt>
                </View>
                <View style={{ width: '50%' }}>
                    <TouchableOpacityOpt
                        disabled={
                            !editable ||
                            !this.props.app.isConnected ||
                            this.state.isCancelling ||
                            this.props.app.loginUserType === loginUserType.REVIEW ||
                            !func.isAccountActive() ||
                            this.props.disabledButtonCancel}
                        style={{ width: '100%', alignItems: 'flex-end' }}
                        onPress={() => {
                            this.isMount && this.setState({ isFrezing: true }, () => { })
                            this.type = 'cancel'
                            this.onCancelOrder()
                        }}
                        timeDelay={Enum.TIME_DELAY}>
                        <View
                            testID={`buttonCancelOrder-${this.props.order_id}`}
                            style={[
                                styles.buttonWrapper,
                                {
                                    backgroundColor: !editable ||
                                        !this.props.app.isConnected ||
                                        this.props.app.loginUserType === loginUserType.REVIEW ||
                                        !func.isAccountActive() ||
                                        this.props.disabledButtonCancel
                                        ? CommonStyle.btnOrderDisableBg
                                        : CommonStyle.btnCancelBg
                                }
                            ]}>
                            {
                                this.state.isCancelling
                                    ? loading
                                    : <Text
                                        style={[
                                            CommonStyle.textButtonColor,
                                            {
                                                color: !editable ||
                                                    !this.props.app.isConnected ||
                                                    this.props.disabledButtonCancel
                                                    ? 'black'
                                                    : 'white',
                                                opacity: !editable ? 0.54 : 1
                                            }
                                        ]}>{I18n.t('cancelUpper')}</Text>
                            }
                        </View>
                    </TouchableOpacityOpt>
                </View>
            </View>
        );
    }

    checkDisableModifyBtn(data, state, type) {
        if (
            state === orderStateEnum.PENDING_CANCEL ||
            state === orderStateEnum.PENDING_REPLACE ||
            !func.isAccountActive() ||
            type === orderType.BEST ||
            type === orderType.BEST_ORDER ||
            data.condition_name === filterConditionName.stopLoss
        ) {
            return true;
        }
        return false
    }
    checkEmptyObject = (obj) => {
        if (!obj) return false;
        if (obj.constructor === Object && Object.keys(obj).length === 0) return false;
        return true;
    }
    getOrderState = (data) => {
        return data.order_status;
    }
    getType = (data, displayExchange) => {
        if (displayExchange === 'ASX') return (data.order_type_origin + '').toUpperCase()
        return (data.order_type + '').toUpperCase()
    }
    checkDisableModify = () => {
        try {
            const checkObj = this.checkEmptyObject(this.state.data);
            if (!checkObj) return false;
            const exchange = this.state.data.exchange ? this.state.data.exchange.replace('[Demo]', '--') : '--';
            const displayExchange = dataStorage.symbolEquity[this.state.data.symbol] && dataStorage.symbolEquity[this.state.data.symbol].display_exchange ? dataStorage.symbolEquity[this.state.data.symbol].display_exchange : (this.state.exchange || exchange)
            const type = this.getType(this.state.data, displayExchange)
            const state = this.getOrderState(this.state.data)
            const disableModify = this.checkDisableModifyBtn(this.state.data, state, type);
            const disabledButtonModify = !RoleUser.checkRoleByKey(
                Enum.ROLE_DETAIL
                    .PERFORM_MODIFY_ORDER_UNIVERSALSEARCH_BUTTON
            )
            if (disableModify ||
                !this.props.app.isConnected ||
                // // this.state.isCancelling ||
                this.props.app.loginUserType === loginUserType.REVIEW ||
                disabledButtonModify) return true
            return false
        } catch (error) {
            console.log('error checkDisableModify contentSlide', error)
        }
    }
    renderLoading() {
        return (
            <View style={{
                width: '100%',
                backgroundColor: CommonStyle.backgroundColor,
                justifyContent: 'center',
                flexDirection: 'row',
                height: 36,
                alignItems: 'center'
            }}>
                <ActivityIndicator style={{ width: 24, height: 24 }} color={CommonStyle.fontColor} />
                <Text style={[CommonStyle.textMainNoColor, { color: CommonStyle.backgroundColor, textAlign: 'center', marginLeft: 4 }]}>{I18n.t('cancellingSpread')}</Text>
            </View>
        );
    }
    updateDisableModifyBtn(state) {
        if (
            state === orderStateEnum.PENDING_CANCEL ||
            state === orderStateEnum.PENDING_REPLACE ||
            !func.isAccountActive()
        ) {
            return false;
        }
        return true
    }
    updateDisableCancelBtn(state) {
        if (
            state === orderStateEnum.PENDING_CANCEL ||
            !func.isAccountActive()) {
            return false;
        }
        return true
    }
    render() {
        const { data } = this.state;
        const displayExchange = dataStorage.symbolEquity[data.symbol] && dataStorage.symbolEquity[data.symbol].display_exchange ? dataStorage.symbolEquity[data.symbol].display_exchange : (this.state.exchange || exchange)
        const type = this.getType(data, displayExchange)
        const loading = this.renderLoading();
        const disableModifyStop = data.condition_name === filterConditionName.stopLoss
        const disableModifyBest = (type === orderType.BEST || type === orderType.BEST_ORDER)
        const state = this.getOrderState(data);
        let isPendingNew = false;
        let editableModify = true;
        editable = this.updateDisableCancelBtn(state);
        editableModify = this.updateDisableModifyBtn(state);

        if (data.order_state === 'Pending' || data.order_status === orderStateEnum.PENDING_NEW) {
            isPendingNew = true;
        }
        return this.renderButtonTemp({ data, loading, isPendingNew, editableModify, editable, disableModifyStop, disableModifyBest })
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
function mapStateToProps(state) {
    return {
        app: state.app,
        login: state.login
    };
}
function mapDispatchToProps(dispatch) {
    return {
        authSettingActions: bindActionCreators(authSettingActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(BtnModifyCancel);
