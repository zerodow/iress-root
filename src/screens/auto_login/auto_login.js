import React, { Component } from 'react';
import {
	View, Text, Keyboard, Platform, Alert, Image, Dimensions, BackHandler, StyleSheet, ImageBackground
} from 'react-native';
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin';
import ReAnimated, { Easing } from 'react-native-reanimated'
import TouchAlert from '../setting/auth_setting/TouchAlert';
import { func, dataStorage } from '../../storage';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	offTouchIDSetting, removeItemFromLocalStorage, pinComplete, touchIDComplete, setNewPinToken,
	authPin, logDevice, forgotPinWithAccessToken, getListTradingHalt
} from '../../lib/base/functionUtil';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import * as loginActions from '../login/login.actions';
import Auth from '../../lib/base/auth';
import config from '../../config';
import background from '../../img/background_mobile/ios82.png'
import backgroundAndroid from '../../img/background_mobile/android.png'
import logo from '../../img/background_mobile/logo.png'
import { postData, requestData } from '../../api'
import SplashScreen from 'react-native-splash-screen'
import PromptNew from '../../component/new_prompt/prompt_new'
import BusyBox from '../../screens/busybox/busybox'
import * as fbemit from '../../emitter';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/index'
import ProgressBarLight from '../../modules/_global/ProgressBarLight'
import pinBackground from '~/img/background_mobile/pinVersion2Background.png'
import * as Controller from '../../memory/controller'
import ScreenId from '~/constants/screen_id'

const { height, width } = Dimensions.get('window');
const topHeight = height * 0.45
const MARGIN_TOP_LOGO_AFTER_ANIM = (topHeight - 64) / 2

export class AutoLogin extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isForgotPinModalVisible: false,
			isAndroidTouchIdModalVisible: false,
			params: [],
			isConnected: this.props.isConnected || true
		}
		// variable
		this.pin = null
		this.isShowConnecting = false
		// function variable
		this.showFormLoginSuccessCallback = null;
		this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(this);
		this.onForgotPin = this.onForgotPin.bind(this);
		this._onPinCompleted = this._onPinCompleted.bind(this);
		this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
		this.showFormLogin = this.showFormLogin.bind(this);
		this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
		this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
		this.authenSuccessCb = this.authenSuccessCb.bind(this)
		this.authenErrorCb = this.authenErrorCb.bind(this)
		this.auth = new Auth(this.props.navigator, this.props.email, this.props.loginToken, this.showFormLogin);
		this.forgotPinCallback = this.forgotPinCallback.bind(this)
		this.setNewPinSuccessCallback = this.setNewPinSuccessCallback.bind(this)
		this.setNewPinErrorCallback = this.setNewPinErrorCallback.bind(this)
		this.authenForAutoLogin = this.authenForAutoLogin.bind(this)
		this.closeAuthenPin = this.closeAuthenPin.bind(this)
		this.closeNetworkAlert = this.closeNetworkAlert.bind(this)
		this.showNetworkAlert = this.showNetworkAlert.bind(this)
		this.reAutoLoginByTouchIDWhenHaveConnection = this.reAutoLoginByTouchIDWhenHaveConnection.bind(this)
		this.reAutoLoginByPinWhenHaveConnection = this.reAutoLoginByPinWhenHaveConnection.bind(this)
		this.loginTouch = false
		this.opacity = new ReAnimated.Value(0)
		// flag for check authen_by_pin
		dataStorage.handleHideOrShowAutoLogin = this.handleHideOrShowPreScreen.bind(this)
	}
	handleHideOrShowPreScreen(isHide) {
		if (isHide) {
			ReAnimated.timing(this.opacity, {
				toValue: 1, duration: 0, easing: Easing.linear
			}).start()
			// this.dic.opacityFakeBg.setValue(1)
		} else {
			ReAnimated.timing(this.opacity, {
				toValue: 0, duration: 0, easing: Easing.linear
			}).start()
			// this.dic.opacityFakeBg.setValue(0)
		}
	}
	renderLogo() {
		switch (config.logoInApp) {
			case 'BETA':
				return <Image source={logo} style={{ width: (2830 / 980) * 64, height: 64 }} />
			case 'DEMO':
				return <Image source={logo} style={{ width: (1766 / 260) * 48, height: 48 }} />
			default:
				return <Image source={logo} style={{ width: (684 / 644) * 128, height: 128 }} />
		}
		return config.logoInApp === 'BETA'
			? <Image source={logo} style={{ width: (2830 / 980) * 64, height: 64 }} />
			: <Image source={logo} style={{ width: (684 / 644) * 128, height: 128 }} />
	}
	componentWillMount() {
		SplashScreen.hide();
		// if (Platform.OS === 'ios') {
		//     SplashScreen.hide();
		// }
	}

	componentDidMount() {
		this.startAuth();
		func.setCurrentScreenId(ScreenId.AUTO_LOGIN)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.isConnected !== this.state.isConnected) {
			const useTouchID = dataStorage.userPin && dataStorage.userPin.enableTouchID ? dataStorage.userPin.enableTouchID : false
			this.setState({
				isConnected: nextProps.isConnected
			})
			if (useTouchID) {
				nextProps.isConnected && this.isShowConnecting && this.reAutoLoginByTouchIDWhenHaveConnection()
			} else if (nextProps.isConnected && this.isShowConnecting) {
				this.reAutoLoginByPinWhenHaveConnection()
			}
		}
	}

	componentWillUnmount() {
	}

	reAutoLoginByTouchIDWhenHaveConnection() {
		touchIDComplete(this.authenSuccessCb, error => {
			console.log('touchID reautologin error', error)
		}, { isSetLoggedIn: false, closeModalCb: this.closeAuthenPin, byPass: false, usePin: this.props.usePin }) // Có mạng thì tự động gửi pin + refresh token lên server
	}

	reAutoLoginByPinWhenHaveConnection() {
		setTimeout(() => {
			const wrongPinCb = err => {
				if (this.isShowConnecting) {
					if (this.props.isAutoLogin) {
						// Đang hiển thị màn hình Connecting... do mất kết nối mạng -> hide Connecting and show pin
						this.props.navigator.dismissModal({
							animationType: 'none'
						})
						this.isShowConnecting = false
						setTimeout(() => {
							this.authenForAutoLogin && this.authenForAutoLogin();
						}, 300)
					} else {
						this.authenPin && this.authenPin.showModalAuthenPin()
					}
				} else {
					// Do nhập sai ... -> Rung
					this.authenPin && this.authenPin.authenFail()
				}
			}
			const refPin = this.authenPin
			const store = Controller.getGlobalState();
			const login = store.login;
			const refreshToken = this.props.token
			const params = {
				isSetLoggedIn: false,
				closeModalCb: this.closeAuthenPin,
				byPass: false,
				usePin: this.props.usePin
			}
			logDevice('info', `AUTO LOGIN -> AUTHEN PIN - ENTER PIN DONE`);
			pinComplete(this.pin, refPin, this.authenSuccessCb, wrongPinCb, params, refreshToken, true, this.closeAuthenPin)
		}, 300)
	}

	startAuth() {
		this.authenForAutoLogin();
	}

	authenForAutoLogin() {
		let objAndroidTouchIDFn = null;
		if (Platform.OS === 'android') {
			objAndroidTouchIDFn = {
				showAndroidTouchID: this.showAndroidTouchID,
				hideAndroidTouchID: this.hideAndroidTouchID,
				androidTouchIDFail: this.androidTouchIDFail
			}
		}
		this.auth.authentication(this.authenSuccessCb, this.showNetworkAlert, objAndroidTouchIDFn, { isSetLoggedIn: false, closeModalCb: this.closeAuthenPin, byPass: false, usePin: this.props.usePin });
	}

	showFormLogin(successCallback, params) {
		this.authenPin && this.authenPin.showModalAuthenPin();
		if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
			offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
		}
		if (successCallback) this.showFormLoginSuccessCallback = successCallback;
		this.params = params || []
	}

	closeAuthenPin(isHideModal = false, isTouchID = false) {
		if (isTouchID) {
			logDevice('info', `AUTO LOGIN WITH TOUCH ID-> TOKEN WAS CHANGED - SHOW POPUP`);
			// cancel login - isLoading
			Controller.dispatch(loginActions.resetLoginLoading())
			// show token was chaged warning - touch id
			this.signOutPrompt && this.signOutPrompt.showModal();
		} else {
			// show token was chaged warning - pin
			if (isHideModal) {
				this.props.navigator && this.props.navigator.dismissModal({
					animationType: 'none'
				})
				setTimeout(() => {
					this.authenPin && this.authenPin.hideModalAuthenPin();
				}, 200)
			} else {
				this.authenPin && this.authenPin.hideModalAuthenPin();
			}

			setTimeout(() => {
				logDevice('info', `AUTO LOGIN -> TOKEN WAS CHANGED - SHOW POPUP`);
				this.signOutPrompt && this.signOutPrompt.showModal();
			}, 500)
		}
	}

	closeNetworkAlert(useTouchID) {
		this.props.navigator && this.props.navigator.dismissModal({
			animationType: 'none'
		})
		if (useTouchID) {
			// Reauthen by touch id
			let objAndroidTouchIDFn = null;
			if (Platform.OS === 'android') {
				objAndroidTouchIDFn = {
					showAndroidTouchID: this.showAndroidTouchID,
					hideAndroidTouchID: this.hideAndroidTouchID,
					androidTouchIDFail: this.androidTouchIDFail
				}
			}
			this.auth.authentication(this.authenSuccessCb, this.showNetworkAlert, objAndroidTouchIDFn, { isSetLoggedIn: false, closeModalCb: this.closeAuthenPin, byPass: false, usePin: this.props.usePin });
		} else {
			// Close modal and show pin
			if (Platform.OS === 'android') {
				this.authenPin && this.authenPin.onFocusPinWhenHideKeyBoard();
			}
		}
	}

	showNetworkAlert(alertContent, btnText, useTouchID = false) {
		this.props.navigator.showModal({
			screen: 'equix.NetworkAlert',
			animated: true,
			animationType: 'fade',
			navigatorStyle: {
				navBarHidden: true,
				screenBackgroundColor: 'transparent',
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				onPress: () => this.closeNetworkAlert(useTouchID),
				alertContent,
				btnText
			}
		})
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
		// if (this.loginTouch === false) {
		//     this.authenPin && this.authenPin.showModalAuthenPin()
		// }
	}

	onForgotPin() {
		// reset auth loading
		this.props.actions.authCancel();
		Keyboard.dismiss();
		this.authenPin && this.authenPin.hideModalAuthenPin();
		setTimeout(() => {
			this.setState({
				isForgotPinModalVisible: true
			})
		}, 500)
	}

	authenSuccessCb(params, accessToken) {
		// Xac thuc thanh cong -> call app.android.js callBackAutoLogin fn
		Controller.setAccessToken(accessToken)
		// Đã nhập pin lúc login -> bypass xác thực trong app
		this.props.isByPass === true && func.setLoginConfig(true); // pin setting là "On Changing Information & Orders" thì bắt xác thức bằng pin ở phần đặt lệnh
		this.props.callback && this.props.callback();
	}

	authenErrorCb(error) {
		if (error.message && error.message.includes('The Internet connection appears to be offline')) {
			// Mất mạng -> show Connecting...
			const useTouchID = dataStorage.userPin && dataStorage.userPin.enableTouchID ? dataStorage.userPin.enableTouchID : false
			if (useTouchID) {
				if (this.props.isAutoLogin) {
					this.props.navigator.showModal({
						screen: 'equix.BusyBox',
						animated: false,
						animationType: 'none',
						navigatorStyle: {
							drawUnderNavBar: true,
							navBarHidden: true,
							navBarHideOnScroll: false,
							statusBarTextColorScheme: 'light',
							navBarNoBorder: true,
							modalPresentationStyle: 'overCurrentContext'
						},
						passProps: {
							isUpgrade: false,
							isUpdating: false
						}
					})
				}
				this.isShowConnecting = true
			} else {
				// Hide pin
				this.authenPin && this.authenPin.hideModalAuthenPin();
				// Show modal connecting
				if (this.props.isAutoLogin) {
					setTimeout(() => {
						this.props.navigator.showModal({
							screen: 'equix.BusyBox',
							animated: false,
							animationType: 'none',
							navigatorStyle: {
								drawUnderNavBar: true,
								navBarHidden: true,
								navBarHideOnScroll: false,
								statusBarTextColorScheme: 'light',
								navBarNoBorder: true,
								modalPresentationStyle: 'overCurrentContext'
							},
							passProps: {
								isUpgrade: false,
								isUpdating: false
							}
						})
					}, 500)
				}
				this.isShowConnecting = true
			}
		} else {
			this.authenPin && this.authenPin.authenFail()
		}
	}

	_onPinCompleted(pinCode) {
		this.pin = pinCode
		const refPin = this.authenPin
		const store = Controller.getGlobalState();
		const login = store.login;
		const refreshToken = this.props.token
		pinComplete(pinCode, refPin, this.authenSuccessCb, this.authenErrorCb, this.params, refreshToken, true, this.closeAuthenPin)
	}

	androidTouchIDFail(callback, numberFingerFailAndroid) {
		this.androidTouchID && this.androidTouchID.authenFail(callback, numberFingerFailAndroid)
	}

	forgotPinCallback(pin, accessToken) {
		// For got pin qua /pin
		forgotPinWithAccessToken(pin, accessToken, this.setNewPinSuccessCallback, this.setNewPinErrorCallback)
	}

	setNewPinSuccessCallback() {
		// set new pin success
		this.props.authSettingActions.setPinSuccess();
		this.props.navigator && this.props.navigator.dismissModal({
			animationType: 'none'
		})
		// Show authen for auto login
		this.props.callback && this.props.callback()
	}

	setNewPinErrorCallback(error) {
		this.props.navigator && this.props.navigator.dismissModal({
			animationType: 'none'
		})
		logDevice('error', `FORGOT AND SET NEW PIN ERROR: ${error}`)
		setTimeout(() => {
			this.authenPin && this.authenPin.showModalAuthenPin()
		}, 300)
	}

	forgotPinSuccessCb(accessToken) {
		const email = dataStorage.emailLogin || ''
		dataStorage.numberFailEnterPin = 0;
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
						this.props.navigator && this.props.navigator.dismissModal({
							animationType: 'none'
						})
						setTimeout(() => {
							this.authenPin && this.authenPin.showModalAuthenPin()
						}, 300)
					}
				}
			})
		}, 500)
	}

	onChangeAuthenByFingerPrint() {
		this.authenPin && this.authenPin.hideModalAuthenPin()
		let objAndroidTouchIDFn = null;
		if (Platform.OS === 'android') {
			objAndroidTouchIDFn = {
				showAndroidTouchID: this.showAndroidTouchID,
				hideAndroidTouchID: this.hideAndroidTouchID,
				androidTouchIDFail: this.androidTouchIDFail
			}
		}
		this.auth.authentication(this.authenSuccessCb, null, objAndroidTouchIDFn, { isSetLoggedIn: false, closeModalCb: this.closeAuthenPin, byPass: false, usePin: this.props.usePin });
	}
	renderFakeBg = () => {
		return (
			<ReAnimated.View pointerEvents={'none'} style={[StyleSheet.absoluteFillObject, { backgroundColor: CommonStyle.backgroundColor, opacity: this.opacity }]}>
				<Image
					source={Platform.OS === 'ios' ? background : backgroundAndroid}
					style={{ position: 'absolute', height, width }}
					resizeMode={Platform.OS === 'ios' ? 'cover' : 'stretch'} />
			</ReAnimated.View>
		)
	}
	render() {
		return (
			<ReAnimated.View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'transparents' }}>
				{
					this.props.isModal
						? null
						: <Image source={Platform.OS === 'ios' ? background : backgroundAndroid} style={{ flex: 1, width: null, height: null }} resizeMode={Platform.OS === 'ios' ? 'cover' : 'stretch'} />
				}
				{
					this.props.isModal
						? null
						: <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
							<View style={[{ flex: 1 }]}>
								<View style={{ alignItems: 'center', marginTop: MARGIN_TOP_LOGO_AFTER_ANIM }}>
									{this.renderLogo()}
								</View>
							</View>
						</View>
				}
				{
					this.auth.showLoginForm(this.state.isForgotPinModalVisible, I18n.t('resetYourPin'), I18n.t('pleaseEnterYourPassword'), this.state.animationLogin, () => {
						this.setState({
							animationLogin: ''
						});
					}, () => {
						this.setState({
							isForgotPinModalVisible: false
						}, () => {
							this.authenForAutoLogin()
						});
					}, () => {
						this.props.actions.authError();
						this.setState({
							isError: true
						});
					}, () => {
						this.props.actions.authSuccess();
						this.setState({
							isForgotPinModalVisible: false,
							isError: false
						});
					}, (accessToken) => {
						this.props.actions.authSuccess();
						this.setState({
							isForgotPinModalVisible: false,
							isError: false
						}, () => {
							this.forgotPinSuccessCb(accessToken)
						});
					}, null, null, this.state.isError, true)
				}
				<AuthenByPin
					usePin={this.props.usePin}
					isAutoLogin={true}
					isDisableBackDrop={true}
					onForgotPin={this.onForgotPin}
					onChangeAuthenByFingerPrint={this.onChangeAuthenByFingerPrint}
					onRef={ref => this.authenPin = ref}
					onPinCompleted={this._onPinCompleted}
					hasEmptyButton={true}
				/>
				<TouchAlert
					ref={ref => this.androidTouchID = ref}
					visible={this.state.isAndroidTouchIdModalVisible}
					dismissDialog={this.hideAndroidTouchID}
					authenByPinFn={this.showFormLogin.bind(this, this.callbackFunc, this.state.params)}
					closeModalCb={this.closeAuthenPin}
					byPass={false}
					usePin={this.props.usePin}
					authentication={this.auth.authentication}
					successCb={this.authenSuccessCb}
					logIn={true}
					cancelCb={this.showNetworkAlert}
					objAndroidTouchIDFn={Platform.OS === 'ios' ? null : {
						showAndroidTouchID: this.showAndroidTouchID,
						hideAndroidTouchID: this.hideAndroidTouchID,
						androidTouchIDFail: this.androidTouchIDFail
					}}
					params={{
						isSetLoggedIn: false,
						closeModalCb: this.closeAuthenPin,
						byPass: false,
						usePin: this.props.usePin
					}}
					currentScreenId={'autologin'}
				/>
				<PromptNew
					onRef={ref => this.signOutPrompt = ref}
					navigator={this.props.navigator}
					type={'changedToken'}
				/>
				{this.renderFakeBg()}
			</ReAnimated.View>
		);
	}
}

function mapStateToProps(state) {
	return {
		email: state.login.email,
		loginToken: state.login.token,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoLogin);
