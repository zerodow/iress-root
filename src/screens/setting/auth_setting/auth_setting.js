import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import {
    View, Text, TouchableOpacity, Switch, Platform, ScrollView,
    Image, PixelRatio, Keyboard, Linking, NativeModules, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NetworkWarning from '../../../component/network_warning/network_warning';
import * as loginActions from '../../login/login.actions';
import * as authSettingActions from './auth_setting.actions';
import * as settingActions from '../setting.actions'
import * as api from '../../../api'
import I18n from '../../../modules/language/index';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    logAndReport, log, setStyleNavigation, removeItemFromLocalStorage, saveItemInLocalStorage,
    offTouchIDSetting, logDevice, pinComplete, authPin, setNewPinToken, forgotPinWithAccessToken,
    clone, isIphoneXorAbove
} from '../../../lib/base/functionUtil';
import firebase from '../../../firebase';
import { func, dataStorage } from '../../../storage';
import { setCurrentScreen } from '../../../lib/base/analytics';
import Auth from '../../../lib/base/auth';
import { iconsMap } from '../../../utils/AppIcons';
import { List, ListItem, Icon } from 'react-native-elements';
import config from '../../../config';
// import LocalAuth from 'react-native-local-auth';
// import Finger from 'react-native-touch-id-android'
import { VibrancyView, BlurView } from 'react-native-blur';
import Pin from '../../../component/pin/pin';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import AuthenByPin from '../../../component/authen_by_pin/authen_by_pin';
import PromptNew from '../../../component/new_prompt/prompt_new';
import TouchAlert from './TouchAlert';
import deviceModel from '../../../constants/device_model';
import analyticsEnum from '../../../constants/analytics';
import ScreenId from '../../../constants/screen_id'
import ModalPicker from './../../modal_picker/modal_picker';
import PIN_SETTING from '../../../constants/pin_setting.json'
import SETTING_TYPE from '../../../constants/setting_type'
import { translateCustomLang, getListInvertTranslate, getInvertTranslate } from '../../../../src/invert_translate';
import PasswordPrompt from '../../../component/change_password/password_prompt';
import * as Controller from '../../../memory/controller';
import * as Util from '../../../util';
import DeviceInfo from 'react-native-device-info';
import TouchableOpacityOpt from '../../../component/touchableOpacityOpt';
import ENUM from '../../../enum';
import Header from '../../../../src/component/headerNavBar/index'

const SystemSetting = NativeModules.OpenSettings;
const listItem = [];
PIN_SETTING.map(e => {
    listItem.push(e.text)
});

const navigatorStyle = {
    navBarHideOnScroll: false,
    statusBarColor: CommonStyle.statusBarBgColor,
    navBarBackgroundColor: CommonStyle.statusBarBgColor,
    navBarTranslucent: false,
    drawUnderNavBar: false,
    navBarTextColor: config.color.navigation,
    navBarButtonColor: config.button.navigation,
    statusBarTextColorScheme: 'light',
    drawUnderTabBar: true,
    tabBarHidden: true,
    navBarSubtitleColor: 'white',
    navBarSubtitleFontFamily: 'HelveticaNeue'
};
class AuthSetting extends Component {
    constructor(props) {
        super(props);
        Text.allowFontScaling = !(PixelRatio.getFontScale() > 1.4);
        this.deviceModel = dataStorage.deviceModel;
        this.state = {
            modalVisible: false,
            promptVisible: false,
            animationLogin: '',
            isError: false,
            supportTouchID: dataStorage.isSupportTouchID,
            isAuthen: true,
            errorAuthen: '',
            isPinCodeModalVisible: false,
            isForgotPinModalVisible: false,
            isChangePasswordModalVisible: false,
            animationAuthenByPin: '',
            isAndroidTouchIdModalVisible: false,
            params: [],
            touchIDType: ''
        }
        this.authError = null;
        this.showFormLoginSuccessCallback = null;
        this.params = [];
        this.isConnected = this.props.isConnected;
        this.displayItem = getListInvertTranslate(listItem)
        this.confirmData = this.confirmData.bind(this)
        // this.saveToDatabase = this.saveToDatabase.bind(this)
        this.saveDataSetting = this.saveDataSetting.bind(this)
        this.getPinSettingDisplay = this.getPinSettingDisplay.bind(this)
        this.showFormLogin = this.showFormLogin.bind(this);
        this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
        this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
        this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
        this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
        this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(this);
        this.changeFingerPrintSuccessCallback = this.changeFingerPrintSuccessCallback.bind(this);
        this.changeFingerPrintErrorCallback = this.changeFingerPrintErrorCallback.bind(this);
        this.auth = new Auth(this.props.navigator, this.props.emailLogin, this.props.tokenLogin, this.showFormLogin);
        this.onForgotPin = this.onForgotPin.bind(this)
        this._onPinCompleted = this._onPinCompleted.bind(this);
        this.linkAppSetting = this.linkAppSetting.bind(this)
        this.forgotPinCallback = this.forgotPinCallback.bind(this)
        this.setNewPinSuccessCallback = this.setNewPinSuccessCallback.bind(this)
        this.setNewPinErrorCallback = this.setNewPinErrorCallback.bind(this)
        this.openLogoutModal = this.openLogoutModal.bind(this)
        logDevice('info', `Auth setting - redux touch id status: ${this.props.isTurnOnTouchID}`)
        this.listData = [{
            placeholder: I18n.t('currentPassword'),
            defaultValue: '',
            secureTextEntry: true,
            id: 'current_password',
            rightIcon: 'md-eye'
        }, {
            placeholder: I18n.t('newPassword'),
            defaultValue: '',
            secureTextEntry: true,
            id: 'new_password',
            rightIcon: 'md-eye'
        }, {
            placeholder: I18n.t('confirmNewPassword'),
            defaultValue: '',
            secureTextEntry: true,
            id: 'confirm_password',
            rightIcon: 'md-eye'
        }];
    }

    getPinSettingDisplay(pinSetting) {
        if (PIN_SETTING[pinSetting] && PIN_SETTING[pinSetting].text) {
            return getInvertTranslate(PIN_SETTING[pinSetting].text)
        }
        return getInvertTranslate(PIN_SETTING[dataStorage.pinSetting].text)
    }

    componentWillMount() {
        setCurrentScreen(analyticsEnum.settingsAuth);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isConnected && nextProps.isConnected && this.pin !== null && this.token !== null && this.props.isLoading) {
            this.forgotPinCallback(this.pin, this.token)
        }
    }

    showFormLogin(successCallback, params) {
        if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
            offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
        } else {
            if (successCallback) this.showFormLoginSuccessCallback = successCallback;
            this.params = params || []
            if (this.params.length > 0 && Object.keys(this.params[0])[0] === 'isForgotPin' && this.params[0].isForgotPin) {
                console.log('on forgot pin')
                this.setState({
                    isPinCodeModalVisible: false
                });
                setTimeout(() => {
                    this.setState({
                        isForgotPinModalVisible: true
                    })
                }, 600)
            } else {
                this.authenPin && this.authenPin.showModalAuthenPin();
            }
        }
    }
    showAndroidTouchID(params) {
        dataStorage.onAuthenticating = true
        dataStorage.dismissAuthen = this.hideAndroidTouchID
        this.setState({
            isAndroidTouchIdModalVisible: true,
            params
        })
    }
    hideAndroidTouchID() {
        dataStorage.onAuthenticating = false
        this.setState({
            isAndroidTouchIdModalVisible: false
        })
    }
    androidTouchIDFail(callback, numberFingerFailAndroid) {
        this.androidTouchID && this.androidTouchID.authenFail(callback, numberFingerFailAndroid)
    }

    authenPinFail() {
        this.authenPin && this.authenPin.authenFail()
    }

    // Android
    _onPinCompleted(pincode) {
        const store = Controller.getGlobalState()
        const login = store.login;
        const refreshToken = login.loginObj.refreshToken
        pinComplete(pincode, this.authenPin, this.showFormLoginSuccessCallback, this.authenPinFail.bind(this), this.params, refreshToken)
    }
    onChangeAuthenByFingerPrint() {
        logDevice('info', `Auth setting - change touch id request`)
        this.authenPin && this.authenPin.hideModalAuthenPin()
        let objAndroidTouchIDFn = null;
        if (Platform.OS === 'android') {
            objAndroidTouchIDFn = {
                showAndroidTouchID: this.showAndroidTouchID,
                hideAndroidTouchID: this.hideAndroidTouchID,
                androidTouchIDFail: this.androidTouchIDFail
            }
        }
        this.auth.authentication(this.changeFingerPrint.bind(this), null, objAndroidTouchIDFn, { isSetLoggedIn: false, isSaveToken: false })
    }
    onForgotPin() {
        // reset auth loading
        this.props.loginActions.authCancel();
        Keyboard.dismiss();
        this.authenPin && this.authenPin.hideModalAuthenPin();
        setTimeout(() => {
            this.setState({
                isForgotPinModalVisible: true
            })
        }, 500)
    }

    forgotPinCallback(pin, token) {
        this.pin = pin;
        this.token = token;
        // removeItemFromLocalStorage(dataStorage.userPin.email, this.removeItemStorageSuccessCallback, this.removeItemStorageErrorCallback, { pin })
        this.props.loginActions.authSuccess();
        // Lấy token để set pin mới
        forgotPinWithAccessToken(pin, token, this.setNewPinSuccessCallback, this.setNewPinErrorCallback)
    }

    setNewPinSuccessCallback() {
        // set new pin success
        this.props.authSettingActions.setPinSuccess();
        logDevice('error', `FORGOT PIN SUCCESS`)
        this.props.navigator.dismissModal()
    }

    setNewPinErrorCallback(err) {
        console.log(err);
        // this.props.navigator.dismissModal()
        // setTimeout(() => {
        //     Alert.alert(
        //         '',
        //         I18n.t('Forgot pin error!', { locale: this.props.setting.lang }),
        //         [
        //             {
        //                 text: I18n.t('ok', { locale: this.props.setting.lang })
        //             }
        //         ])
        // }, 300)
    }

    forgotPinSuccessCb(accessToken) {
        const email = dataStorage.emailLogin
        dataStorage.numberFailEnterPin = 0;
        // func.setLoginConfig(false);
        setTimeout(() => {
            this.props.navigator.showModal({
                screen: 'equix.SetPin',
                animated: true,
                animationType: 'slide-up',
                navigatorStyle: {
                    ...CommonStyle.navigatorSpecialNoHeader,
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
        }, 500)
    }
    linkAppSetting() {
        if (this.authError !== null) {
            const error = this.authError
            let url = '';
            if (Platform.OS === 'ios') {
                const errorName = error;
                if (errorName === 'LAErrorTouchIDLockout' || errorName === 'LAErrorTouchIDNotEnrolled') {
                    if (errorName === 'LAErrorTouchIDLockout') dataStorage.isLockTouchID = true
                    url = 'App-prefs:root=TOUCHID_PASSCODE';
                    Linking.canOpenURL(url)
                        .then(supported => {
                            if (supported) {
                                return Linking.openURL(url)
                                    .then(() => this.promptNew && this.promptNew.hideModal())
                                    .catch(error => {
                                        console.log('cant open app setting', error)
                                        this.promptNew && this.promptNew.hideModal()
                                    })
                            } else {
                                console.log('Touch id passcode setting not supported')
                            }
                        })
                        .catch(error => console.log('Cant open url app setting', error))
                }
            } else if (error === 'NOT_ENROLLED') {
                if (!config.isProductVersion) {
                    SystemSetting.openNetworkSettings && SystemSetting.openNetworkSettings(message => {
                        if (message) {
                            this.promptNew && this.promptNew.hideModal()
                        }
                    })
                }
            }
        }
    }
    onChangeFingerPrint() {
        logDevice('info', `Auth setting - change touch id setting`)
        let objAndroidTouchIDFn = null;
        if (Platform.OS === 'android') {
            objAndroidTouchIDFn = {
                showAndroidTouchID: this.showAndroidTouchID,
                hideAndroidTouchID: this.hideAndroidTouchID,
                androidTouchIDFail: this.androidTouchIDFail
            }
        }
        if (!dataStorage.userPin.enableTouchID) {
            if (Platform.OS === 'ios') {
                // LocalAuth
                //     .hasTouchID()
                //     .then(() => {
                //         logDevice('info', `Auth setting - has touch id ios`)
                //         dataStorage.isLockTouchID = false
                //         this.auth.authentication(this.changeFingerPrint.bind(this), null, objAndroidTouchIDFn, { isSetLoggedIn: false, isSaveToken: false })
                //     })
                //     .catch(error => {
                //         logDevice('info', `Auth setting - TouchID ios locked or enrolled -> turn on system setting ${error}`)
                //         this.authError = error.name;
                //         let type = '';
                //         if (this.authError === 'LAErrorTouchIDNotEnrolled') {
                //             type = 'notEnrolled';
                //         } else if (this.authError === 'LAErrorTouchIDLockout') {
                //             type = 'lockedOut';
                //         }
                //         this.setState({
                //             touchIDType: type
                //         }, () => {
                //             this.promptNew && this.promptNew.showModal()
                //         })
                //     })
            } else if (config.isProductVersion) {
                this.auth.authentication(this.changeFingerPrint.bind(this), null, objAndroidTouchIDFn, { isSetLoggedIn: false, isSaveToken: false })
            } else {
                // Finger
                //     .isSensorAvailable()
                //     .then(() => {
                //         // Check tiếp xem có bị khoá hay không
                //         let errorLockFingerPrint = false;
                //         Finger
                //             .requestTouch()
                //             .then()
                //             .catch(error => {
                //                 console.log(error)
                //                 this.authError = error;
                //                 let type = '';
                //                 if (this.authError === 'LOCKED_OUT') {
                //                     type = 'lockedOut';
                //                     errorLockFingerPrint = true
                //                 }
                //                 this.setState({
                //                     touchIDType: type
                //                 }, () => {
                //                     this.promptNew && this.promptNew.showModal()
                //                 })
                //             })
                //         setTimeout(() => {
                //             // Cancel request finger print
                //             Finger.dismiss();
                //             !errorLockFingerPrint && this.auth.authentication(this.changeFingerPrint.bind(this), null, objAndroidTouchIDFn, { isSetLoggedIn: false, isSaveToken: false })
                //         }, 1000)
                //     })
                //     .catch(error => {
                //         // Check trường hợp chưa lăn vân tay
                //         console.log(error)
                //         this.authError = error;
                //         let type = '';
                //         if (this.authError === 'NOT_ENROLLED') {
                //             type = 'notEnrolled'
                //         }
                //         this.setState({
                //             touchIDType: type
                //         }, () => {
                //             this.promptNew && this.promptNew.showModal()
                //         })
                //     })
            }
        } else {
            this.auth.authentication(this.changeFingerPrint.bind(this), null, objAndroidTouchIDFn, { isSetLoggedIn: false, isSaveToken: false })
        }
    }
    changeFingerPrintSuccessCallback() {
        logDevice('info', `Auth setting - change touch id setting success`)
        this.props.authSettingActions.setEnableTouchID(!this.props.isTurnOnTouchID)
    }
    changeFingerPrintErrorCallback() {
        logDevice('info', `Auth setting - change touch id error`)
    }

    confirmData(data) {
        const trans = translateCustomLang(data)
        let source = 0;
        switch (trans) {
            case listItem[0]:
                source = 0;
                break;
            case listItem[1]:
                source = 1;
                break;
            case listItem[2]:
                source = 2;
                break;
            default:
                source = 0;
                break;
        }
        this.setState({
            modalVisible: false,
            authItem: trans
        }, () => {
            this.saveDataSetting(SETTING_TYPE.PIN_SETTING, source)
        });
    }

    saveDataSetting(type, value) {
        try {
            const deviceId = dataStorage.deviceId
            const userId = func.getUserId();
            const newObj = clone(this.props.setting);
            switch (type) {
                case SETTING_TYPE.PIN_SETTING:
                    // Chọn lại setting cũ thì không làm gì
                    if (newObj[`${type}`] === value) {
                        return;
                    }
                    newObj[`${type}`] = value || 0;
                    const id = newObj[`${type}`]
                    // Cập nhật lại pin setting && cập nhật lại trạng thái confirm auth
                    func.setPinSetting(value)
                    func.setLoginConfig(false)
                    break;
            }
            this.props.settingActions.settingResponse(newObj);
            // save to db change from, to -> UTC
            const data = PureFunc.clone(newObj)
            const { hour: fromHour, minute: fromMinute } = Util.getHoursMinutesUTC(newObj['news'][`fromHour`], newObj['news'][`fromMinute`])
            const { hour: toHour, minute: toMinute } = Util.getHoursMinutesUTC(newObj['news'][`toHour`], newObj['news'][`toMinute`])
            data['news']['fromHour'] = fromHour
            data['news']['fromMinute'] = fromMinute
            data['news']['toHour'] = toHour
            data['news']['toMinute'] = toMinute
            data['deviceId'] = deviceId
            const urlPut = api.getUrlUserSettingByUserId(userId, 'put');
            api.putData(urlPut, { data }).then(data => {
                logDevice('info', 'save to user setting success')
            }).catch(error => {
                logDevice('info', 'cannot save to user setting')
            })
        } catch (error) {
            logAndReport('saveDataSetting setting exception', error, 'saveDataSetting setting');
            logDevice('info', `onSelectLang setting exception: ${error}`);
        }
    }

    onClose() {
        this.setState({ modalVisible: false })
    }

    onShowModalPicker() {
        this.setState({ modalVisible: true })
    }

    openLogoutModal() {
        this.props.navigator.showModal({
            screen: 'equix.PromptNew',
            animated: true,
            animationType: 'fade',
            navigatorStyle: {
                ...CommonStyle.navigatorSpecialNoHeader,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                type: 'changedToken',
                isShow: true
            }
        })
    }

    changeFingerPrint() {
        logDevice('info', `Auth setting - change touch id cb after authenticate`)
        const currentEmail = dataStorage.userPin.email || dataStorage.emailLogin
        const newEnableTouchID = !this.props.isTurnOnTouchID
        const obj = {
            email: currentEmail,
            enableTouchID: newEnableTouchID,
            numberFailEnterPin: dataStorage.userPin.numberFailEnterPin || 0
        }
        logDevice('info', `Auth setting - user setting: ${JSON.stringify(obj)}`)
        const email = dataStorage.emailLogin.toLowerCase() ||
            dataStorage.userPin.email.toLowerCase() ||
            Controller.getUserLoginId().toLowerCase()
        saveItemInLocalStorage(email, obj, null, this.changeFingerPrintSuccessCallback, this.changeFingerPrintErrorCallback)
    }
    openChangePin() {
        func.setCurrentScreenId(ScreenId.CHANGE_PIN)
        this.props.navigator.showModal({
            screen: 'equix.ChangePin',
            animated: true,
            animationType: 'slide-up',
            navigatorStyle: {
                ...CommonStyle.navigatorSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                type: 'old',
                changeMenuSelected: this.props.changeMenuSelected ? this.props.changeMenuSelected : null,
                authSettingNavigator: this.props.navigator
            }
        })
    }

    openChangePassword() {
        this.props.loginActions.authCancel();
        Keyboard.dismiss();
        this.authenPin && this.authenPin.hideModalAuthenPin();
        setTimeout(() => {
            this.setState({
                isChangePasswordModalVisible: true
            })
            func.setCurrentScreenId(ScreenId.SETTING)
        }, 500)
    }

    onBackDropModalPress() {
        Keyboard.dismiss()
        this.setState({
            isPinCodeModalVisible: false
        })
    }

    onPressLeftButton() {
        Keyboard.dismiss();
        this.props.navigator.pop();
    }

    render() {
        const { pinSetting } = this.props.setting;
        const pinSettingDisplay = this.getPinSettingDisplay(pinSetting)
        return (
            <View style={{ flex: 1, backgroundColor: CommonStyle.fontDefaultColor }}>
                <Header
                    leftIcon={'ios-menu'}
                    // rightIcon={'ios-menu'}
                    title="Settings"
                // rightTitle="close"
                // renderRightComp={this.renderRightComp}
                >
                    <View
                        style={{
                            width: '100%',
                            paddingLeft: 50,
                            justifyContent: 'center'
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: CommonStyle.fontSizeM
                            }}
                        >
                            My Watchlist 1
					</Text>
                    </View>
                    <View style={{ paddingLeft: 16 }}>
                        {
                            this.state.supportTouchID
                                ? <View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', height: 134 }}>
                                        {
                                            isIphoneXorAbove() ? <Image
                                                style={{ width: 50, height: 50 }}
                                                source={require('../../../img/faceID.png')}
                                            /> : <Image
                                                    style={{ width: 50, height: 50 }}
                                                    source={require('../../../img/fpsuccess.png')}
                                                />
                                        }
                                    </View>
                                </View>
                                : null
                        }
                    </View>
                </Header>
                <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                    {/* <View style={[CommonStyle.searchBarContainer3, { backgroundColor: CommonStyle.statusBarBgColor, flexDirection: 'row', paddingTop: isIphoneXorAbove() ? 32 : Platform.OS === 'ios' ? 24 : 0, height: isIphoneXorAbove() ? 72 : 64 }]}>
                    <TouchableOpacity
                        onPress={this.onPressLeftButton.bind(this)}
                        style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}
                    >
                        <Ionicons
                            name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
                            style={[CommonStyle.fontText, { color: CommonStyle.fontHeader, paddingLeft: 16 }]}
                            size={Platform.OS === 'ios' ? 36 : 28}
                        />
                    </TouchableOpacity>

                    <View style={{ flex: 4, justifyContent: 'center', alignItems: Platform.OS === 'android' ? 'flex-start' : 'center' }}>
                        <Text style={{ fontWeight: '500', color: CommonStyle.fontWhite, fontFamily: 'HelveticaNeue', fontSize: CommonStyle.fontSizeXL - 1 }}>{I18n.t('security', { locale: this.props.setting.lang })}</Text>
                    </View>
                    <View style={{ flex: 1 }}>

                    </View>
                </View> */}

                    <View style={{ flex: 1, backgroundColor: CommonStyle.fontDefaultColor }}>
                        {
                            !this.props.isConnected ? <NetworkWarning /> : null
                        }
                        {
                            this.state.supportTouchID
                                ? <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', height: 48, backgroundColor: CommonStyle.fontDefaultColor }}>
                                    <Text style={[CommonStyle.sectContentText, { width: '85%' }]}>{isIphoneXorAbove() ? I18n.t('faceID', { locale: this.props.setting.lang }) : (Platform.OS === 'ios' ? I18n.t('fingerPrintIOS', { locale: this.props.setting.lang }) : I18n.t('fingerPrintAndroid', { locale: this.props.setting.lang }))}</Text>
                                    <Switch testID={`switchTouchId`}
                                        tintColor={CommonStyle.fontBorderGray}
                                        onValueChange={() => this.onChangeFingerPrint()} value={this.props.isTurnOnTouchID} style={{ width: '15%', right: 0 }} />
                                </View> : null
                        }
                        <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        <View style={{ backgroundColor: CommonStyle.fontDefaultColor, width: '100%' }}>
                            <TouchableOpacity onPress={() => this.onShowModalPicker()} style={{ flexDirection: 'row', paddingVertical: 14, alignItems: 'center', paddingLeft: 16, paddingRight: 16, minHeight: 30, justifyContent: 'space-between' }}>
                                <Text style={[CommonStyle.sectContentText, { width: '25%' }]}>{I18n.t('require')}</Text>
                                <View
                                    style={[{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        width: '75%'
                                    }]}
                                >
                                    <Text style={{
                                        opacity: CommonStyle.opacity2,
                                        fontFamily: CommonStyle.fontPoppinsRegular,
                                        fontSize: CommonStyle.fontSizeM,
                                        fontWeight: '300',
                                        color: CommonStyle.fontColor,
                                        marginRight: 16
                                    }}>
                                        {pinSettingDisplay}
                                    </Text>
                                    <Ionicons name='ios-arrow-forward' size={24} color={CommonStyle.colorIconSettings} />
                                </View>
                            </TouchableOpacity>
                            <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        </View>
                        <View>
                            <TouchableOpacityOpt
                                onPress={() => this.openChangePin()}
                                timeDelay={ENUM.TIME_DELAY}
                                style={{ height: 47, backgroundColor: CommonStyle.fontDefaultColor, paddingVertical: 8, paddingHorizontal: 16, justifyContent: 'center' }}
                            >
                                <Text style={{ color: CommonStyle.fontApple, opacity: 0.87, fontSize: CommonStyle.fontSizeM, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('changePin', { locale: this.props.setting.lang })}</Text>
                            </TouchableOpacityOpt>
                            <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                            <TouchableOpacity onPress={this.onForgotPin} style={{ height: 47, backgroundColor: CommonStyle.fontDefaultColor, paddingVertical: 8, paddingHorizontal: 16, justifyContent: 'center' }}>
                                <Text style={{ backgroundColor: CommonStyle.fontDefaultColor, color: CommonStyle.fontApple, opacity: 0.87, fontSize: CommonStyle.fontSizeM, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('forgotPin', { locale: this.props.setting.lang })}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                            <TouchableOpacity
                                onPress={() => this.openChangePassword()}
                                style={{ height: 47, backgroundColor: CommonStyle.fontDefaultColor, paddingVertical: 8, paddingHorizontal: 16, justifyContent: 'center', marginTop: 2 }}
                            >
                                <Text style={{ color: CommonStyle.fontApple, opacity: 0.87, fontSize: CommonStyle.fontSizeM, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('changePassword', { locale: this.props.setting.lang })}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 1, backgroundColor: CommonStyle.fontColorBorderNew, marginLeft: 16 }} />
                        </View>
                        {
                            this.auth.showLoginForm(this.state.isForgotPinModalVisible, I18n.t('resetYourPin'), I18n.t('pleaseEnterYourPassword'), this.state.animationLogin, () => {
                                this.setState({
                                    animationLogin: ''
                                });
                            }, () => {
                                this.setState({
                                    isForgotPinModalVisible: false
                                });
                            }, () => {
                                this.props.loginActions.authError();
                                this.setState({
                                    // animationLogin: 'shake',
                                    isError: true
                                });
                            }, () => {
                                this.props.loginActions.authSuccess();
                                this.setState({
                                    isForgotPinModalVisible: false,
                                    isError: false
                                });
                            }, (accessToken) => {
                                this.props.loginActions.authSuccess();
                                this.setState({
                                    isForgotPinModalVisible: false,
                                    isError: false
                                }, () => {
                                    this.forgotPinSuccessCb(accessToken)
                                });
                            }, null, null, this.state.isError, true)
                        }
                        <PasswordPrompt
                            title={I18n.t('changePassTitle', { locale: this.props.setting.lang })}
                            listData={this.listData}
                            visible={this.state.isChangePasswordModalVisible}
                            cancelText={I18n.t('cancel', { locale: this.props.setting.lang })}
                            submitText={I18n.t('ok', { locale: this.props.setting.lang })}
                            onCancel={() => {
                                this.setState({ isChangePasswordModalVisible: false })
                            }}
                            onSubmit={() => {
                                this.setState({ isChangePasswordModalVisible: false }, () => {
                                    console.log('open log out')
                                    // this.openLogoutModal()
                                })
                            }}
                            isConnected={this.props.isConnected}
                        />
                        <AuthenByPin
                            onChangeAuthenByFingerPrint={this.onChangeAuthenByFingerPrint}
                            onForgotPin={this.onForgotPin}
                            onRef={ref => this.authenPin = ref}
                            onPinCompleted={this._onPinCompleted}
                        />
                        <TouchAlert
                            ref={ref => this.androidTouchID = ref}
                            visible={this.state.isAndroidTouchIdModalVisible}
                            dismissDialog={this.hideAndroidTouchID}
                            authenByPinFn={this.showFormLogin.bind(this, this.changeFingerPrint.bind(this), this.state.params)}
                        />
                        <PromptNew
                            onRef={ref => this.promptNew = ref}
                            navigator={this.props.navigator}
                            isLockedTouchID={true}
                            touchIDType={this.state.touchIDType}
                            linkAppSetting={this.linkAppSetting}
                        />
                        <ModalPicker listItem={this.displayItem}
                            onSelected={this.confirmData}
                            selectedItem={pinSettingDisplay}
                            visible={this.state.modalVisible}
                            title={I18n.t('authentication', { locale: this.props.setting.lang })}
                            onClose={this.onClose.bind(this)} />
                    </View>
                </View>
            </View>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        email: state.login.email,
        token: state.login.token,
        isConnected: state.app.isConnected,
        isTurnOnTouchID: state.authSetting.isTurnOnTouchID,
        isLoading: state.authSetting.isLoading,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loginActions: bindActionCreators(loginActions, dispatch),
        authSettingActions: bindActionCreators(authSettingActions, dispatch),
        settingActions: bindActionCreators(settingActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthSetting);
