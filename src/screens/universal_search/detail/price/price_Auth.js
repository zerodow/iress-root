import React, { PureComponent } from 'react';
import { View, Keyboard, Platform } from 'react-native';
import { connect } from 'react-redux';

import {
    offTouchIDSetting,
    logAndReport,
    pinComplete,
    forgotPinWithAccessToken,
    logDevice
} from '~/lib/base/functionUtil';
import * as authSettingActions from '~s/setting/auth_setting/auth_setting.actions';
import * as loginActions from '~s/login/login.actions';
import config from '~/config';

import AuthenByPin from '~/component/authen_by_pin/authen_by_pin';
import TouchAlert from '~s/setting/auth_setting/TouchAlert';
import Authentication from '~/lib/base/auth';
import { dataStorage } from '~/storage';
import I18n from '~/modules/language/';
import * as Controller from '~/memory/controller';

export class Auth extends PureComponent {
    constructor(props) {
        super(props);
        this.onForgotPin = this.onForgotPin.bind(this);
        this.showFormLogin = this.showFormLogin.bind(this);
        this.removeItemStorageSuccessCallback = this.removeItemStorageSuccessCallback.bind(
            this
        );
        this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
        this.closeAuth = this.closeAuth.bind(this);
        this.authError = this.authError.bind(this);
        this.authSuccess = this.authSuccess.bind(this);
        this.forgotPinSuccess = this.forgotPinSuccess.bind(this);
        this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
        this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
        this.androidTouchIDFail = this.androidTouchIDFail.bind(this);
        this.onCheckAuth = this.onCheckAuth.bind(this);
        this._onPinCompleted = this._onPinCompleted.bind(this);
        this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(
            this
        );
        this.forgotPinCallback = this.forgotPinCallback.bind(this);
        this.setNewPinSuccessCallback = this.setNewPinSuccessCallback.bind(
            this
        );
        this.setNewPinErrorCallback = this.setNewPinErrorCallback.bind(this);

        this.showFormLoginSuccessCallback = null;
        this.state = {
            params: [],
            isForgotPinModalVisible: false,
            isError: false
        };
        this.params = []; // ???
        this.hideModalAuthenPin = () => null;
        this.showModalAuthenPin = () => null;
        this.authenFail = () => null;

        const {
            navigator,
            login: { email, token }
        } = this.props;
        this.auth = new Authentication(
            navigator,
            email,
            token,
            this.showFormLogin
        );
    }

    componentDidMount = () => {
        const {
            hideModalAuthenPin = () => null,
            showModalAuthenPin = () => null,
            authenFail = () => null
        } = this.authenPin || {};

        this.authenFail = authenFail;
        this.hideModalAuthenPin = hideModalAuthenPin;
        this.showModalAuthenPin = showModalAuthenPin;
    };

    getText(text) {
        const { language } = this.props;
        return I18n.t(text, {
            locale: language
        });
    }

    removeItemStorageSuccessCallback() {
        dataStorage.numberFailEnterPin = 0;
        setTimeout(() => {
            this.nav.showModal({
                screen: 'equix.SetPin',
                animated: true,
                animationType: 'slide-up',
                navigatorStyle: {
                    statusBarColor: config.background.statusBar,
                    statusBarTextColorScheme: 'light',
                    navBarHidden: true,
                    navBarHideOnScroll: false,
                    navBarTextFontSize: 16,
                    drawUnderNavBar: true,
                    navBarNoBorder: true,
                    modalPresentationStyle: 'overCurrentContext'
                },
                passProps: {
                    type: 'new'
                }
            });
        }, 500);
    }

    removeItemStorageErrorCallback() {}

    forgotPinSuccessCb(accessToken) {
        const email = dataStorage.emailLogin;
        dataStorage.numberFailEnterPin = 0;
        // func.setLoginConfig(false);
        setTimeout(() => {
            if (Platform.OS === 'ios') {
                this.props.navigator.showModal({
                    screen: 'equix.SetPin',
                    animated: true,
                    animationType: 'slide-up',
                    navigatorStyle: {
                        statusBarColor: config.background.statusBar,
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
                });
            } else {
                this.props.navigator.showModal({
                    screen: 'equix.SetPin',
                    animated: true,
                    animationType: 'slide-up',
                    navigatorStyle: {
                        statusBarColor: config.background.statusBar,
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
                });
            }
        }, 500);
    }

    forgotPinCallback(pin, token) {
        this.pin = pin;
        this.token = token;
        this.props.authSuccess();
        forgotPinWithAccessToken(
            pin,
            token,
            this.setNewPinSuccessCallback,
            this.setNewPinErrorCallback
        );
    }

    setNewPinSuccessCallback() {
        // set new pin success
        this.props.setPinSuccess();
        logDevice('error', `FORGOT PIN SUCCESS`);
        this.props.navigator.dismissModal();
    }

    setNewPinErrorCallback(err) {
        console.log(err);
        logDevice('error', `FORGOT PIN ERROR`);
    }

    closeAuth() {
        this.setState({
            isForgotPinModalVisible: false
        });
    }

    authError() {
        this.props.authError();
        this.setState({
            isError: true
        });
    }
    authSuccess() {
        this.props.authSuccess();
        this.setState({
            isForgotPinModalVisible: false,
            isError: false
        });
    }
    forgotPinSuccess(accessToken) {
        this.props.authSuccess();
        this.setState(
            {
                isForgotPinModalVisible: false,
                isError: false
            },
            () => this.forgotPinSuccessCb(accessToken)
        );
    }

    showAndroidTouchID(params) {
        dataStorage.onAuthenticating = true;
        dataStorage.dismissAuthen = this.hideAndroidTouchID;
        this.setState({
            isAndroidTouchIdModalVisible: true,
            params
        });
    }
    hideAndroidTouchID() {
        dataStorage.onAuthenticating = false;
        this.setState({
            isAndroidTouchIdModalVisible: false
        });
    }
    androidTouchIDFail(callback, numberFingerFailAndroid) {
        this.androidTouchID &&
            this.androidTouchID.authenFail(callback, numberFingerFailAndroid);
    }

    onChangeAuthenByFingerPrint() {
        this.hideModalAuthenPin();
        let objAndroidTouchIDFn = null;
        if (Platform.OS === 'android') {
            objAndroidTouchIDFn = {
                showAndroidTouchID: this.showAndroidTouchID,
                hideAndroidTouchID: this.hideAndroidTouchID,
                androidTouchIDFail: this.androidTouchIDFail
            };
        }
        this.auth.authentication(this.props.onOrder, null, objAndroidTouchIDFn);
    }

    onCheckAuth(cb) {
        try {
            if (!Controller.getLoginStatus()) return;
            if (dataStorage.pinSetting !== 0) {
                cb && cb();
            } else {
                let objAndroidTouchIDFn = null;
                if (Platform.OS === 'android') {
                    objAndroidTouchIDFn = {
                        showAndroidTouchID: this.showAndroidTouchID,
                        hideAndroidTouchID: this.hideAndroidTouchID,
                        androidTouchIDFail: this.androidTouchIDFail
                    };
                }
                this.auth.authentication(cb, null, objAndroidTouchIDFn);
            }
        } catch (error) {
            logAndReport(
                'authFunction price exception',
                error,
                'authFunction price'
            );
        }
    }

    showFormLogin(successCallback, params) {
        if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
            offTouchIDSetting(this.props.turnOffTouchID);
        }
        if (successCallback) {
            this.showFormLoginSuccessCallback = successCallback;
        }
        this.params = params || [];
        this.showModalAuthenPin();
    }

    onForgotPin() {
        Keyboard.dismiss();
        this.hideModalAuthenPin();
        setTimeout(() => {
            this.setState({
                isForgotPinModalVisible: true
            });
        }, 500);
    }

    _onPinCompleted(pincode) {
        const {
            loginObj: { refreshToken }
        } = this.props.login;
        pinComplete(
            pincode,
            this.authenPin,
            this.showFormLoginSuccessCallback,
            this.authenFail,
            this.params,
            refreshToken
        );
    }

    render() {
        const { isForgotPinModalVisible, isError } = this.state;
        return (
            <View>
                {isForgotPinModalVisible &&
                    this.auth.showLoginForm(
                        isForgotPinModalVisible,
                        this.getText('resetYourPin'),
                        this.getText('pleaseEnterYourPassword'),
                        '',
                        () => null,
                        this.closeAuth,
                        this.authError,
                        this.authSuccess,
                        this.forgotPinSuccess,
                        null,
                        null,
                        isError,
                        true
                    )}
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
                        this.props.onOrder,
                        this.state.params
                    )}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    login: state.login,
    language: state.setting.lang
});

const mapDispatchToProps = (dispatch) => ({
    turnOffTouchID: (...p) => dispatch(authSettingActions.turnOffTouchID(...p)),
    authError: (...p) => dispatch(loginActions.authError(...p)),
    authSuccess: (...p) => dispatch(loginActions.authSuccess(...p)),
    setPinSuccess: (...p) => dispatch(authSettingActions.setPinSuccess(...p))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(Auth);
