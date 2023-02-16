import React, { PureComponent } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    ScrollView,
    FlatList,
    Keyboard,
    StatusBar,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import * as loginActions from '../login/login.actions';
import * as alertActions from './redux/actions';
// Emitter
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '../../streaming/channel';
// Api
import * as Api from '../../api';
// Util
import * as Business from '~/business';
import * as FunctionUtil from '../../lib/base/functionUtil';
import * as Controller from '../../memory/controller';
import * as Util from '../../util';
import StateApp from '~/lib/base/helper/appState';
// Component
import {
    Text as TextLoad,
    View as ViewLoad
} from '~/component/loading_component';
import * as Animatable from 'react-native-animatable';
import TransitionView from '~/component/animation_component/transition_view';
import ResultSearch from './components/SearchBar/Result';
import RowLoading from './components/RowLoading';
import XComponent from '../../component/xComponent/xComponent';
import Flag from '../../component/flags/flag';
import FallHeader from '~/component/fall_header';
import ProgressBar from '../../modules/_global/ProgressBar';
import NetworkWarning from '../../component/network_warning/network_warning';
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin';
import QuickButton from '../../component/quick_button/quick_button';
import TouchAlert from '../setting/auth_setting/TouchAlert';
import Auth from '../../lib/base/auth';
import { iconsMap } from '../../utils/AppIcons';
import Header from '~/component/headerNavBar';
import ItemSeparator from './components/ItemSeparator';
import RightHeader from './components/Header/IconLeft';
import ContentHeader from './components/Header/Content';
import BottomTabBar from '~/component/tabbar';
import SwitchButton from './components/SwitchButton';
import HeaderSpecial from './components/Header/index';
// Style
import CommonStyle, { register } from '~/theme/theme_controller';
import Styles from './styles';
// Storage
import { dataStorage, func } from '~/storage';
import ENUM from '~/enum';
import I18n from '~/modules/language/';
import ScreenId from '~/constants/screen_id';
import * as RoleUser from '~/roleUser';
import * as PureFunc from '~/utils/pure_func';
import { showNewOrderModal } from '~/navigation/controller.1';
import * as ManageConection from '~/manage/manageConnection';

import * as _ from 'lodash';
// Redux

const { SCREEN, ROLE_DETAIL, ALERT_SCREEN } = ENUM;

export class AlertRow extends PureComponent {
    constructor(props) {
        super(props);
        this.init();
        this.bindAllFunc();
    }
    init() {
        this.dic = {};
        this.state = {
            tradingHalt: false,
            switchValue: this.props.data.status === 1 || false
        };
    }

    bindAllFunc() {
        this.onChange = this.onChange.bind(this);
        this.getAlertObject = this.getAlertObject.bind(this);
        this.modifyAlertStatus = this.modifyAlertStatus.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.data &&
            nextProps.data.status !== null &&
            nextProps.data.status !== undefined &&
            nextProps.data.status !== this.state.switchValue
        ) {
            this.setState({
                switchValue: nextProps.data.status === 1
            });
        }
    }

    onChange(switchValue) {
        this.setState(
            {
                switchValue
            },
            this.modifyAlertStatus
        );
    }

    getAlertObject(alertStatus) {
        const status = !alertStatus ? 0 : 1;
        return {
            status
        };
    }

    modifyAlertStatus() {
        const status = this.state.switchValue;
        const { data: alertObj = {} } = this.props;
        const { alert_id: alertID } = alertObj;
        const url = Api.getApiModifyAlert(alertID);
        const data = this.getAlertObject(status);

        Api.putData(url, { data })
            .then((res) => {
                if (res) {
                    console.log(res);
                } else {
                    console.log('modifyAlertStatus is NULL');
                }
            })
            .catch((err) => {
                console.log('modifyAlertStatus error', err);
            });
    }
    setRef = (ref) => {
        const { alert_id: alertID, updated, symbol } = this.props.data;
        this.props.setRef &&
            this.props.setRef({ alertID, updated, ref, symbol });
    };
    render() {
        const { data } = this.props;
        const { isLoading } = this.props.alert;
        const displayName = Business.getSymbolName({ symbol: data.symbol });
        const flagIcon = Business.getFlagByCurrency(data.currency);
        const description = Business.getAlertDescription(data);
        return (
            <TransitionView
                setRef={this.setRef}
                animation={'fadeIn'}
                index={-1}
                duration={300}
                key={`${data.symbol}_alertRow`}
                testID={`${data.symbol}_alertRow`}
                style={[
                    Styles.itemWrapper,
                    {
                        marginTop: this.props.index === 0 ? 8 : 0
                    }
                ]}
            >
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                            <View
                                style={{ width: '40%', flexDirection: 'row' }}
                            >
                                <Text style={[CommonStyle.textMainRed]}>
                                    {this.state.tradingHalt ? '! ' : ''}
                                </Text>
                                <TextLoad
                                    isLoading={isLoading}
                                    numberOfLines={1}
                                    style={[Styles.textSymbol]}
                                >
                                    <Text>{displayName || ''}</Text>
                                </TextLoad>
                            </View>
                            <View
                                style={{
                                    width: '30%',
                                    justifyContent: 'center'
                                }}
                            >
                                <ViewLoad isLoading={isLoading}>
                                    <Flag
                                        type={'flat'}
                                        code={flagIcon}
                                        size={18}
                                    />
                                </ViewLoad>
                            </View>
                        </View>
                        <TextLoad
                            isLoading={isLoading}
                            numberOfLines={1}
                            style={[
                                Styles.textTimeInsights,
                                {
                                    lineHeight: CommonStyle.fontSizeXS * 2
                                }
                            ]}
                        >
                            <Text>{description}</Text>
                        </TextLoad>
                    </View>
                </View>
                <View>
                    <ViewLoad isLoading={isLoading}>
                        <SwitchButton
                            value={this.state.switchValue}
                            onValueChange={this.onChange}
                            // disabled={true}
                            circleSize={24}
                            barHeight={30}
                            circleBorderWidth={0}
                            backgroundActive={CommonStyle.fontColorSwitchTrue}
                            backgroundInactive={CommonStyle.fontColorSwitchTrue}
                            circleActiveColor={
                                CommonStyle.fontColorButtonSwitch
                            }
                            circleInActiveColor={'#000000'}
                            changeValueImmediately={true}
                            changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                            innerCircleStyle={{
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} // style for inner animated circle for what you (may) be rendering inside the circle
                            outerCircleStyle={{}} // style for outer animated circle
                            renderActiveText={false}
                            renderInActiveText={false}
                            switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                            switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                            switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                            switchBorderRadius={16} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
                        />
                    </ViewLoad>
                </View>
                {/* <Switch
                    style={{ width: '15%' }}
                    thumbTintColor={CommonStyle.fontColorButtonSwitch}
                    // trackColor={{ false: CommonStyle.fontColorSwitchTrue, true: CommonStyle.fontColor }}
                    // ios_backgroundColor={CommonStyle.fontColorSwitchTrue}
                    onValueChange={this.onChange}
                    value={this.state.switchValue} /> */}
            </TransitionView>
        );
    }
}
function mapStateToPropsRowAlert(state, ownProps) {
    return {
        alert: state.alert
    };
}
const RowAlertConnected = connect(mapStateToPropsRowAlert)(AlertRow);
export class ListAlerts extends XComponent {
    init() {
        this.dic = {
            data: [],
            isLoading: true,
            listRefData: {}
        };
        this.state = {
            isForgotPinModalVisible: false,
            isAndroidTouchIdModalVisible: false
        };
        this.viewabilityConfig = {
            minimumViewTime: 500,
            viewAreaCoveragePercentThreshold: 1,
            waitForInteraction: true
        };
        this.handleViewableItemsChanged = this.handleViewableItemsChanged.bind(
            this
        );
        this.dic.auth = new Auth(
            this.props.navigator,
            dataStorage.emailLogin,
            this.props.token,
            this.showFormLogin
        );
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.stateApp = new StateApp(
            this.handleWakupApp,
            null,
            ScreenId.LIST_ALERT_WRAPPER,
            false
        );
        ManageConection.setScreenId(ScreenId.LIST_ALERT_WRAPPER);
        ManageConection.dicConnection.getSnapshot = this.handleWakupApp;
    }
    handleViewableItemsChanged({ viewableItems, changed }) {
        this.viewableItems = viewableItems;
    }
    handleWakupApp = this.handleWakupApp.bind(this);
    handleWakupApp() {
        this.props.alertActions && this.props.alertActions.setLoading(true);
        this.getSnapshotListAlerts();
        // this.dic.isLoading = true
        // this.updateListAlerts([])
        // this.refLoading && this.refLoading.runAnimation({
        //     type: 'fadeIn'
        // }, () => {
        //     this.getSnapshotListAlerts()
        // })
    }
    componentWillReceiveProps(nextProps) {
        if (
            nextProps.isConnected &&
            nextProps.isConnected !== this.props.isConnected
        ) {
            this.handleWakupApp();
        }
    }
    /* #region LifeCircle */
    componentDidMount() {
        super.componentDidMount();
        func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER);
        this.addListenerRealtime();
        this.getSnapshotListAlerts();
        this.setScreenActive();
    }
    setScreenActive() {
        this.props.alertActions &&
            this.props.alertActions.changeScreenActive(ALERT_SCREEN.LIST_ALERT);
    }
    /* #endregion */

    setRightBtnDisabled() {
        const rightButtons = RoleUser.checkRoleByKey(
            ROLE_DETAIL.ROLE_PERFORM_EDIT_BUTTON
        )
            ? [
                  {
                      id: 'add_alert',
                      icon: iconsMap['ios-create-outline'],
                      disabled: true,
                      disabledColor: '#bbb'
                  }
              ]
            : [];
        this.props.navigator.setButtons({ rightButtons });
    }

    setRightBtn() {
        const rightButtons = RoleUser.checkRoleByKey(
            ROLE_DETAIL.ROLE_PERFORM_EDIT_BUTTON
        )
            ? [
                  {
                      id: 'add_alert',
                      icon: iconsMap['ios-create-outline']
                  }
              ]
            : [];
        this.props.navigator.setButtons({ rightButtons });
    }

    showFormLogin(successCallback, params) {
        try {
            if (dataStorage.isLockTouchID && Util.isIOS()) {
                FunctionUtil.offTouchIDSetting(
                    this.props.authSettingActions.turnOffTouchID
                );
            }
            if (successCallback) {
 this.showFormLoginSuccessCallback = successCallback;
}
            this.dic.params = params || [];
            this.authenPin && this.authenPin.showModalAuthenPin();

            return true;
        } catch (error) {
            console.catch(error);
            return false;
        }
    }

    onForgotPin() {
        Keyboard.dismiss();
        this.authenPin && this.authenPin.hideModalAuthenPin();
        setTimeout(() => {
            this.setState({
                isForgotPinModalVisible: true
            });
        }, 500);

        return true;
    }

    onChangeAuthenByFingerPrint() {
        try {
            this.authenPin && this.authenPin.hideModalAuthenPin();
            let objAndroidTouchIDFn = null;
            if (Util.isAndroid()) {
                objAndroidTouchIDFn = {
                    showAndroidTouchID: this.showAndroidTouchID,
                    hideAndroidTouchID: this.hideAndroidTouchID,
                    androidTouchIDFail: this.androidTouchIDFail
                };
            }
            this.dic.auth.authentication(
                this.newOrderFunc,
                null,
                objAndroidTouchIDFn
            );

            return true;
        } catch (error) {
            console.catch(error);
            return false;
        }
    }

    _onPinCompleted(pincode) {
        try {
            const store = Controller.getGlobalState();
            const login = store.login;
            const refreshToken = login.loginObj.refreshToken;

            FunctionUtil.pinComplete(
                pincode,
                this.authenPin,
                this.showFormLoginSuccessCallback,
                this.authenPinFail.bind(this),
                this.dic.params,
                refreshToken
            );

            return true;
        } catch (error) {
            console.catch(error);
            return false;
        }
    }

    authenPinFail() {
        this.authenPin && this.authenPin.authenFail();

        return true;
    }

    showAndroidTouchID(params) {
        dataStorage.onAuthenticating = true;
        dataStorage.dismissAuthen = this.hideAndroidTouchID;
        this.setState({
            isAndroidTouchIdModalVisible: true,
            params
        });
        return true;
    }

    hideAndroidTouchID() {
        dataStorage.onAuthenticating = false;
        this.setState({
            isAndroidTouchIdModalVisible: false
        });
        return true;
    }

    androidTouchIDFail(callback, numberFingerFailAndroid) {
        this.androidTouchID &&
            this.androidTouchID.authenFail(callback, numberFingerFailAndroid);

        return true;
    }

    newOrderFunc() {
        const passProps = {
            isDefault: true,
            stopPrice: 0,
            limitPrice: 0,
            code: '',
            exchanges: [],
            changePercent: 0,
            volume: 0,
            isNotShowMenu: true
        };
        showNewOrderModal({
            navigator: this.props.navigator,
            passProps
        });
    }

    authFunction() {
        try {
            if (dataStorage.pinSetting !== 0) {
                this.newOrderFunc();
            } else {
                let objAndroidTouchIDFn = null;
                if (Util.isAndroid()) {
                    objAndroidTouchIDFn = {
                        showAndroidTouchID: this.showAndroidTouchID,
                        hideAndroidTouchID: this.hideAndroidTouchID,
                        androidTouchIDFail: this.androidTouchIDFail
                    };
                }
                if (dataStorage.reAuthen) {
                    this.dic.auth.authentication(
                        this.authenPin.hideModalAuthenPin,
                        null,
                        objAndroidTouchIDFn
                    );
                    dataStorage.reAuthen = false;
                } else {
                    this.dic.auth.authentication(
                        this.newOrderFunc,
                        null,
                        objAndroidTouchIDFn
                    );
                }
            }

            return true;
        } catch (error) {
            console.catch(error);
            return false;
        }
    }

    onUniversalSearch() {
        this.props.navigator.showModal({
            screen: 'equix.Search',
            backButtonTitle: '',
            animated: true,
            animationType: 'slide-up',
            navigatorStyle: {
                ...CommonStyle.navigatorSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            }
        });

        return true;
    }

    addListenerRealtime() {
        const channel = Channel.getChannelRealtimeListAlerts();
        Emitter.addListener(channel, this.id, ({ data, method }) => {
            this.method = method;
            switch (method) {
                case 'INSERT':
                    return this.insertAlertRealtime({ data });
                case 'DELETE':
                    return this.deleteALertRealtime({ data });
                case 'UPDATE':
                    return this.updateAlertRealtime({ data });
                default:
                    return false;
            }
        });
    }

    insertAlertRealtime({ data }) {
        try {
            if (
                data &&
                data.alert_type === 'NEWS' &&
                data.target &&
                typeof data.target === 'string'
            ) {
                data.target = data.target.split('#');
            }
            const newData = [data].concat(this.dic.data);
            this.updateListAlerts(newData);
        } catch (error) {
            console.log(error);
        }
    }

    updateAlertRealtime({ data }) {
        this.dic.data.map((item, index) => {
            const { alert_id: alertID } = item;
            const { alert_id: realtimeAlertID } = data;
            if (alertID === realtimeAlertID) {
                if (
                    data &&
                    data.alert_type === 'NEWS' &&
                    data.target &&
                    typeof data.target === 'string'
                ) {
                    data.target = data.target.split('#');
                }
                this.dic.data[index] = PureFunc.merge(
                    this.dic.data[index],
                    data,
                    true
                );
            }
        });
        this.dic.listRefData[data.alert_id]['updated'] = data.updated;
        this.dic.data = this.dic.data.sort(function (a, b) {
            if (a['updated'] > b['updated']) {
                return -1;
            }
            if (a['updated'] < b['updated']) {
                return 1;
            }
            return 0;
        });
        this.updateListAlerts(this.dic.data);
    }

    deleteALertRealtime({ data }) {
        const newData = this.dic.data.filter((item) => {
            const { alert_id: alertID } = item;
            const { alert_id: realtimeAlertID } = data;
            return alertID !== realtimeAlertID;
        });
        this.updateListAlerts(newData);
    }
    fadeOutLoading = () => {
        this.refLoading &&
            this.refLoading.runAnimation({
                type: 'fadeOut'
            });
    };
    getSnapshotListAlerts() {
        const url = Api.getApiGetListAlerts();
        Api.requestData(url)
            .then((res) => {
                this.dic.isLoading = false;
                this.props.alertActions &&
                    this.props.alertActions.setLoading(false);
                if (res && res.length) {
                    const data = res.sort((a, b) => {
                        return b.updated - a.updated;
                    });
                    this.fadeOutLoading();
                    return this.updateListAlerts(data);
                }
                this.fadeOutLoading();
                return this.updateListAlerts([]);
            })
            .catch((err) => {
                this.dic.isLoading = false;
                this.fadeOutLoading();
                return this.updateListAlerts([]);
            });
    }
    handleFadeOut = (cb) => {
        const listPromiseFadeInDown = _.map(this.dic.listRefData, (el) => {
            return new Promise((resolve) => {
                if (!el) {
                    resolve();
                }
                el &&
                    el.ref &&
                    el.ref.fadeOut(1).then(() => {
                        resolve();
                    });
            });
        });
        Promise.all(listPromiseFadeInDown).then(() => {
            cb && cb();
        });
    };
    handleFadeInDown = (cb) => {
        try {
            this.viewableItems &&
                this.viewableItems.map((el, index) => {
                    let itemData = this.dic.data[el.index];
                    const alertID = itemData.alert_id;
                    const refData = this.dic.listRefData[alertID];
                    if (refData) {
                        const ref = refData.ref;
                        ref && ref.fadeOut(1);
                    }
                });
            this.viewableItems &&
                this.viewableItems.map((el, index) => {
                    let itemData = this.dic.data[el.index];
                    const alertID = itemData.alert_id;
                    const refData = this.dic.listRefData[alertID];
                    if (refData) {
                        const ref = refData.ref;
                        setTimeout(() => {
                            ref && ref.fadeIn(300);
                        }, this.getDelay(index));
                    }
                });
        } catch (error) {
            console.log('DCM handleFadeInDown', error);
        }
    };
    getDelay = (index) => {
        if (index > 10) {
            return 0;
        }
        return 500 + index * (500 / 4);
    };
    updateListAlerts(listAlerts) {
        if (dataStorage.currentScreenId !== ScreenId.ADD_ALERT) {
            if (listAlerts && listAlerts.length > 0) {
                this.setRightBtn();
            } else {
                this.setRightBtnDisabled();
            }
        }
        Controller.setListAlerts(listAlerts);
        this.dic.data = listAlerts;
        this.setState({});
    }

    moveToAddAlert() {
        const nextScreenObj = {
            screen: SCREEN.ADD_ALERT,
            title: I18n.t('alertUpper'),
            backButtonTitle: ' ',
            animated: true,
            animationType: 'slide-horizontal',
            passProps: {},
            navigatorStyle: CommonStyle.navigatorSpecial
        };

        this.props.navigator.push(nextScreenObj);
    }
    moveToNewAlert = () => {
        const nextScreenObj = {
            screen: SCREEN.NEW_ALERT,
            title: I18n.t('alertUpper'),
            backButtonTitle: ' ',
            animated: true,
            animationType: 'slide-horizontal',
            passProps: {},
            navigatorStyle: CommonStyle.navigatorSpecial
        };

        this.props.navigator.push(nextScreenObj);
    };
    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            FunctionUtil.switchForm(this.props.navigator, event);
        } else if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'add_alert':
                    this.moveToAddAlert();
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
                case 'hidden_edit_alert':
                    func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER);
                    // this.handleRefresh()
                    break;
                case 'hidden_modify_edit_alert':
                    func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER);
                    this.handleRefresh();
                    break;
                case 'hidden_new_order':
                    func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER);
                    this.handleRefresh();
                    break;
                case 'hidden_new_alert':
                    func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER);
                    this.handleRefresh();
                    break;
                case 'willAppear':
                    break;
                case 'didAppear':
                    FunctionUtil.setRefTabbar(this.tabbar);
                    if (dataStorage.isChangeAccount) {
                        dataStorage.isChangeAccount = false;
                    }
                    ManageConection.setScreenId(ScreenId.LIST_ALERT_WRAPPER);
                    ManageConection.dicConnection.getSnapshot = this.handleWakupApp;
                    func.setCurrentScreenId(ScreenId.LIST_ALERT_WRAPPER);
                    this.updateListAlerts(this.dic.data);
                    this.setScreenActive();
                    break;
                default:
                    break;
            }
        }
    }
    handleRefresh = () => {
        this.handleFadeInDown();
    };
    setRefListData = this.setRefListData.bind(this);
    setRefListData({ ref, alertID, updated, symbol }) {
        if (ref === null) {
            delete this.dic.listRefData[alertID];
        } else {
            this.dic.listRefData[alertID] = { ref, updated, symbol };
        }
    }
    renderAlertRow(item, index) {
        return (
            <RowAlertConnected
                index={index}
                setRef={this.setRefListData}
                data={item}
            />
        );
    }

    renderFooter() {
        return (
            <View
                style={{
                    width: '100%',
                    backgroundColor: CommonStyle.backgroundColor,
                    height: 100
                }}
            />
        );
    }

    renderLoading() {
        return (
            <View
                style={{
                    // backgroundColor: CommonStyle.backgroundColor,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <ProgressBar />
            </View>
        );
    }

    renderNoData() {
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor1,
                    flex: 1,
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
            </View>
        );
    }

    renderNetworkWarning() {
        if (this.props.isConnected) return null;
        return <NetworkWarning />;
    }
    renderHeader = () => <ContentHeader />;
    renderRightHeader = () => (
        <RightHeader
            handleShowNew={this.moveToNewAlert}
            handleShowListModify={this.moveToAddAlert}
        />
    );
    renderSeparator = () => {
        return <ItemSeparator />;
    };
    handleOnDoneRowLoading = () => {
        this.getSnapshotListAlerts();
    };
    setRefRowLoading = (ref) => {
        if (ref) {
            this.refLoading = ref;
        }
    };
    setRefResultSearch = (ref) => {
        if (ref) {
            this.refResult = ref;
        }
    };
    renderHaveData = () => {
        return (
            <FlatList
                ListFooterComponent={() => {
                    return <View style={{ height: 96 }} />;
                }}
                indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                onViewableItemsChanged={this.handleViewableItemsChanged}
                data={this.dic.data}
                extraData={this.state}
                keyExtractor={(item, index) => item && item.alert_id}
                ItemSeparatorComponent={this.renderSeparator}
                renderItem={({ item, index }) =>
                    this.renderAlertRow(item, index)
                }
            />
        );
    };
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
        const isDisableedit = this.dic.data.length <= 0;
        return (
            <WraperComponent {...allProps}>
                <FallHeader
                    ref={(ref) => ref && (this.headerRef = ref)}
                    style={{ backgroundColor: CommonStyle.backgroundColorNews }}
                    header={
                        <HeaderSpecial
                            isDisableEdit={isDisableedit}
                            screen={ALERT_SCREEN.LIST_ALERT}
                            navigator={this.props.navigator}
                        />
                    }
                >
                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                        {/* {
                        this.dic.isLoading
                            ? this.renderLoading()
                            : this.dic.data.length <= 0
                                ? this.renderNoData()
                                : <FlatList
                                    ListFooterComponent={() => {
                                        return (
                                            <View style={{ height: 88 }} />
                                        )
                                    }}
                                    indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                                    showsVerticalScrollIndicator={true}
                                    data={this.dic.data}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => item.alert_id}
                                    ItemSeparatorComponent={this.renderSeparator}
                                    renderItem={({ item, index }) => (
                                        this.renderAlertRow(item, index)
                                    )}
                                />
                    } */}
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    marginTop: 16
                                }}
                                pointerEvents="box-none"
                            >
                                <RowLoading
                                    type="alert"
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
                                {this.dic.data.length <= 0 &&
                                !this.dic.isLoading ? (
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
                                        <Text
                                            style={[
                                                CommonStyle.textNoData,
                                                {
                                                    fontFamily:
                                                        CommonStyle.fontPoppinsRegular
                                                }
                                            ]}
                                        >
                                            {I18n.t('noData')}
                                        </Text>
                                    </Animatable.View>
                                ) : null}
                            </View>
                        </View>
                    </View>
                    <AuthenByPin
                        onForgotPin={this.onForgotPin}
                        onChangeAuthenByFingerPrint={
                            this.onChangeAuthenByFingerPrint
                        }
                        onRef={(ref) => (this.authenPin = ref)}
                        onPinCompleted={this._onPinCompleted}
                    />
                    <TouchAlert
                        ref={(ref) => (this.androidTouchID = ref)}
                        visible={this.state.isAndroidTouchIdModalVisible}
                        dismissDialog={this.hideAndroidTouchID}
                        authenByPinFn={this.showFormLogin.bind(
                            this,
                            this.newOrderFunc
                        )}
                    />
                    <QuickButton
                        testID={`quickButton`}
                        navigator={this.props.navigator}
                        onNewOrder={() => this.authFunction()}
                        onUniversalSearch={() => this.onUniversalSearch()}
                    />
                    <BottomTabBar
                        navigator={this.props.navigator}
                        ref={(ref) => {
                            this.tabbar = ref;
                            FunctionUtil.setRefTabbar(ref);
                        }}
                    />
                </FallHeader>
            </WraperComponent>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        isConnected: state.app.isConnected
    };
}

function mapDispatchToProps(dispatch) {
    return {
        alertActions: bindActionCreators(alertActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ListAlerts);
