import React from 'react';
import {
	ActivityIndicator,
	Animated,
	Dimensions,
	Keyboard,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	StyleSheet,
	ImageBackground,
	Image,
	Platform
} from 'react-native';
import {
	declareAnimation,
	declareParallelAnimation,
	logAndReport,
	logDevice,
	offTouchIDSetting,
	removeItemFromLocalStorage
} from '../../lib/base/functionUtil';
import ReAnimated, { Easing } from 'react-native-reanimated';
import I18n from '../../modules/language/';
import config from '../../config';
import { dataStorage, func } from '../../storage';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import styles from './style/home_page.2';
import CommonStyle from '~/theme/theme_controller';
import Auth from '../../lib/base/auth';
import ENUM from '../../enum';
import Icon from 'react-native-vector-icons/Ionicons';
import ScreenId from '../../constants/screen_id';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import authCode from '../../constants/authCode';
import * as Emitter from '@lib/vietnam-emitter';
import * as Business from '../../business';
import XComponent from '../../component/xComponent/xComponent';
import * as Controller from '../../memory/controller';
import * as Util from '../../util';
import pinBackground from '~/img/background_mobile/pinVersion2Background.png';
import HeightSoftBar from './view.height.softbar';
import background from '~/img/background_mobile/ios82.png';
import backgroundAndroid from '~/img/background_mobile/android.png';

const { height, width } = Dimensions.get('window');
const marginHorizontal = 48;
const buttonWidth = width / 2 - marginHorizontal;

const { SUB_ENVIRONMENT } = ENUM;

export class SignIn extends XComponent {
	constructor(props) {
		super(props);

		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.bindAllFunc();
		this.init();
	}

	init() {
		const obj = {
			username: this.props.login.lastEmail,
			password: ''
		};
		this.dic = {
			showFormLoginSuccessCallback: null,
			params: [],
			loginTimeout: null,
			cancelTimeOut: null,
			nav: this.props.navigator,
			opacity: Util.isIOS() ? 0.7 : 0.54,
			auth: new Auth(
				this.dic.nav,
				this.props.login.email,
				this.props.login.token,
				this.showFormLogin
			),
			perf: new Perf(performanceEnum.show_form_watch_list),
			opacityFakeBg: new ReAnimated.Value(0)
		};

		this.state = {
			username: this.props.login.lastEmail,
			password: '',
			softMenuBarHeight: 0,
			signInMarginTop: new Animated.Value(32),
			errorTextHeight: new Animated.Value(0),
			value: obj,
			submitDisabled: true,
			errorText: '',
			editable: true,
			isSubmiting: false,
			cancelDisable: false,
			isDemo: Controller.isDemo(),
			isSecureTextEntry: true,
			width: '',
			disabledForgotten: true
		};
		this.animatedValue = null;
		if (this.state.isDemo) this.animatedValue = new Animated.Value(1);
		else this.animatedValue = new Animated.Value(0);
		this.translateX = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, buttonWidth - 2] // Tru di borderWidth=2 thi moi khong bi lech
		});
		return true;
	}

	bindAllFunc() {
		this.measureView = this.measureView.bind(this);
		this.getNumberOfLines = this.getNumberOfLines.bind(this);
		this.showFormLogin = this.showFormLogin.bind(this);
		this.authFunction = this.authFunction.bind(this);
		this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
		this.removeItemStorageSuccessCallback = this.removeItemStorageSuccessCallback.bind(
			this
		);
		this.changeAppVersion = this.changeAppVersion.bind(this);
		this.cancel = this.cancel.bind(this);
		this.login = this.login.bind(this);
		this.firstLogin = this.firstLogin.bind(this);
		this.loginError = this.loginError.bind(this);
		this.loginErrorAnimation = this.loginErrorAnimation.bind(this);
		this.loginSuccessCallback = this.loginSuccessCallback.bind(this);
		this.handleHideOrShowSignIn = this.handleHideOrShowSignIn.bind(this);
		this.successCallback = this.successCallback.bind(this);
		this.pushUpAfterKeyboardShow = this.pushUpAfterKeyboardShow.bind(this);
		this.pullDownBeforeKeyboardHide = this.pullDownBeforeKeyboardHide.bind(
			this
		);
		this.getEnv = this.getEnv.bind(this);
		this.forgotPassword = this.forgotPassword.bind(this);
		this.renderForgotten = this.renderForgotten.bind(this);
		this.pushForgotPassword = this.pushForgotPassword.bind(this);
		this.pushForgotUsername = this.pushForgotUsername.bind(this);
		this.pushCompleteSignUp = this.pushCompleteSignUp.bind(this);
		dataStorage.handleHideOrShowSignIn = this.handleHideOrShowSignIn.bind(
			this
		);
		return true;
	}
	handleHideOrShowSignIn(isHide) {
		/**
		 * isHide = true se che di noi dung trang signIn
		 */
		if (isHide) {
			ReAnimated.timing(this.dic.opacityFakeBg, {
				toValue: 1,
				duration: 0,
				easing: Easing.linear
			}).start();
			// this.dic.opacityFakeBg.setValue(1)
		} else {
			ReAnimated.timing(this.dic.opacityFakeBg, {
				toValue: 0,
				duration: 0,
				easing: Easing.linear
			}).start();
			// this.dic.opacityFakeBg.setValue(0)
		}
	}
	componentDidMount() {
		super.componentDidMount();
		func.setCurrentScreenId(ScreenId.SIGN_IN);
		if (Util.isAndroid()) {
			// Get soft bar height
			const softMenuBarHeight =
				ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0;
			console.log(`SOFT BAR HEIGHT: ${softMenuBarHeight}`);
			logDevice('info', `SOFT BAR HEIGHT: ${softMenuBarHeight}`);
			this.setState({
				softMenuBarHeight
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.login.error !== '' &&
			nextProps.login.error !== this.state.errorText
		) {
			this.setState(
				{
					submitDisabled: true,
					cancelDisable: false,
					errorText: nextProps.login.error
				},
				() => {
					if (this.state.errorText === '') {
						// Hide error
						this.loginErrorAnimation();
					} else {
						this.props.onOffKeyboardAnimation &&
							this.props.onOffKeyboardAnimation(false);
						// Show error
						this.loginErrorAnimation(true);
					}
				}
			);
		}
	}

	measureView(event) {
		this.setState({
			width: event.nativeEvent.layout.width
		});
	}

	getNumberOfLines(text, fontSize, fontConstant, containerWidth) {
		if (!text) return 0;
		const cpl = Math.floor(containerWidth / (fontSize / fontConstant));
		const words = text.split(' ');
		const elements = [];
		let line = '';

		while (words.length > 0) {
			if (
				line.length + words[0].length + 1 <= cpl ||
				(line.length === 0 && words[0].length + 1 >= cpl)
			) {
				const word = words.splice(0, 1);
				if (line.length === 0) {
					line = word;
				} else {
					line = line + ' ' + word;
				}
				if (words.length === 0) {
					elements.push(line);
				}
			} else {
				elements.push(line);
				line = '';
			}
		}
		return elements.length;
	}

	loginErrorAnimation(isShow = false) {
		const animHeight =
			this.getNumberOfLines(
				this.state.errorText,
				14,
				2.24,
				this.state.width
			) * 24;
		if (isShow) {
			declareParallelAnimation([
				declareAnimation(this.state.errorTextHeight, animHeight, 500),
				declareAnimation(this.state.signInMarginTop, 8, 500)
			]).start();
		} else {
			declareParallelAnimation([
				declareAnimation(this.state.errorTextHeight, 0, 500),
				declareAnimation(this.state.signInMarginTop, 32, 500)
			]).start();
		}
		return true;
	}

	showFormLogin(successCallback, params) {
		if (dataStorage.isLockTouchID && Util.isIOS()) {
			offTouchIDSetting(this.props.authSettingActions.turnOffTouchID);
		}
		if (successCallback) {
			this.dic.showFormLoginSuccessCallback = successCallback;
		}
		this.dic.params = params || [];
		this.authenPin && this.authenPin.showModalAuthenPin();
		return true;
	}

	removeItemStorageSuccessCallback() {
		dataStorage.numberFailEnterPin = 0;
		setTimeout(() => {
			if (Util.isIOS()) {
				this.dic.nav.showModal({
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
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new'
					}
				});
			} else {
				this.dic.nav.showModal({
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
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new'
					}
				});
			}
		}, 500);
		return true;
	}

	forgotPinSuccessCb() {
		removeItemFromLocalStorage(
			dataStorage.userPin.email || dataStorage.emailLogin,
			this.removeItemStorageSuccessCallback,
			this.removeItemStorageErrorCallback
		);
		return true;
	}

	authFunction(callbackFunction) {
		try {
			let objAndroidTouchIDFn = null;
			if (Util.isAndroid()) {
				objAndroidTouchIDFn = {
					showAndroidTouchID: this.showAndroidTouchID,
					hideAndroidTouchID: this.hideAndroidTouchID,
					androidTouchIDFail: this.androidTouchIDFail
				};
			}
			this.dic.auth.authentication(
				callbackFunction,
				null,
				objAndroidTouchIDFn
			);
			return true;
		} catch (error) {
			console.log('authFunction signin logAndReport exception: ', error);
			logAndReport(
				'authFunction signin exception',
				error,
				'authFunction price'
			);
			return false;
		}
	}

	_rightIconInputPress(id) {
		if (id === 'username') {
			// Animation
			this.loginErrorAnimation();
			// Clear last email
			this.props.actions.setLastEmail('');
			this.emailInput &&
				this.emailInput.clear() &&
				this.emailInput.setNativeProps({ value: '' });
			const _value = this.state.value;
			_value.username = '';
			this.emailInput && this.emailInput.focus();
			this.props.actions.loginClearError(); // Clear error

			this.setState({
				username: '',
				value: _value,
				submitDisabled: true,
				errorText: ''
			});
		} else if (id === 'password') {
			this.setState(
				{
					isSecureTextEntry: !this.state.isSecureTextEntry
				},
				() => {
					Business.setSelectionTextInput(
						this.passwordInput,
						this.state.value['password'].length
					);
					// this.passwordInput && this.passwordInput.blur();
				}
			);
		}
		return true;
	}

	_onChangeText(value, id) {
		// Animation
		if (this.state.errorText !== '') {
			this.loginErrorAnimation();
			this.props.actions.loginClearError(); // Clear error
		}
		const obj = this.state.value;
		obj[id] = value;
		let disabled;
		disabled = !(
			this.state.value['username'] !== '' &&
			this.state.value['password'] !== ''
		);
		if (value === '') {
			disabled = true;
		}

		this.setState({
			username: obj['username'],
			password: obj['password'],
			value: obj,
			submitDisabled: disabled,
			isError: false,
			cancelDisable: false,
			errorText: ''
		});

		return true;
	}

	changeAppVersion(isDemo) {
		if (config.environment === ENUM.ENVIRONMENT.PRODUCTION) {
			// only enable with production environment
			this.loginErrorAnimation();
			this.props.actions.resetLogin();
			this.props.actions.saveVersion(isDemo);
			if (isDemo) {
				Animated.timing(this.animatedValue, {
					toValue: 1,
					duration: 500
				}).start(() => {
					this.setState({ isDemo, submitDisabled: false });
				});
			} else {
				Animated.timing(this.animatedValue, {
					toValue: 0,
					duration: 500
				}).start(() => {
					this.setState({ isDemo, submitDisabled: false });
				});
			}
		}
		return true;
	}

	cancel() {
		this.props.actions.loginCancel();
		const _value = this.state.value;
		// _value.password = '';
		this.setState({
			errorText: '',
			value: _value,
			username: _value['username'],
			password: _value['password'],
			disabledForgotten: true
		});
		this.loginErrorAnimation();
		if (this.dic.loginTimeout) {
			clearTimeout(this.dic.loginTimeout);
		}
		if (this.dic.cancelTimeOut) {
			clearTimeout(this.dic.cancelTimeOut);
		}
		if (this.props.cancelCallback) {
			// start single screen app từ overview
			this.props.cancelCallback();
		} else {
			// push từ home_page
			this.props.cancelFn && this.props.cancelFn(); // Enable signin button
		}
		return true;
	}

	forgotPassword(type) {
		this.props.forgotPasswordFN && this.props.forgotPasswordFN(type);
		return true;
	}

	firstLogin() {
		this.props.resetPasswordFn();
		return true;
	}

	login() {
		Keyboard.dismiss();
		const value = Object.assign({}, this.state.value);
		const data = value || {};
		const usernameOriginal = data.username;
		const passwordOriginal = data.password;
		const username = usernameOriginal.trim();
		const password = passwordOriginal;
		this.setState({ disabledForgotten: true });
		if (username !== '' && password !== '') {
			this.props.actions.clearToken(); // Clear accessToken, refreshToken, pin
			if (this.props.isConnected) {
				dataStorage.emailLogin = username.toLowerCase().trim();
				// dataStorage.callbackAfterReconnect = this.callbackAfterReconnect;
				this.props.actions.loginRequest(username, password);
				this.props.actions.setLastEmail(username); // Save last email just entered
				this.props.onOffKeyboardAnimation &&
					this.props.onOffKeyboardAnimation(true);
				dataStorage.isLocked = true;
				this.props.actions.login(
					username,
					password,
					null,
					this.loginError,
					this.successCallback, // user not verify
					null,
					null,
					this.loginSuccessCallback
				);
				this.setState({ submitDisabled: true, cancelDisable: false });
			}
		}
		return true;
	}

	loginError(errorCode, token) {
		try {
			const eventName = Business.getChannelUpdateResetPasswordType();
			switch (errorCode) {
				case authCode.ENTER_NEW_EMAIL_AND_NEW_PASSWORD:
					Emitter.emit(eventName, {
						errorType: authCode.ENTER_NEW_EMAIL_AND_NEW_PASSWORD,
						token
					});
					this.errorType = authCode.ENTER_NEW_EMAIL_AND_NEW_PASSWORD;
					this.props.resetPasswordFn();
					break;
				case authCode.ENTER_NEW_PASSWORD:
					Emitter.emit(eventName, {
						errorType: authCode.ENTER_NEW_PASSWORD,
						token
					});
					this.errorType = authCode.ENTER_NEW_PASSWORD;
					this.props.resetPasswordFn();
					break;
				default:
					this.setState(
						{
							submitDisabled: true,
							editable: true,
							isSubmiting: false,
							cancelDisable: false,
							disabledForgotten: true
						},
						() => {}
					);
					break;
			}
			return true;
		} catch (error) {
			logDevice('error', `loginError EMITTER EXCEPTION: ${error}`);
			return false;
		}
	}

	loginSuccessCallback() {
		return true;
	}

	successCallback() {
		return true;
	}

	pushUpAfterKeyboardShow(type) {
		if (type === 'email') {
			this.props.updateStatusEmailInput &&
				this.props.updateStatusEmailInput('focus');
		} else {
			this.props.updateStatusPasswordInput &&
				this.props.updateStatusPasswordInput('focus');
		}
		setTimeout(() => {
			this.props.pushUpAfterKeyboardShow &&
				this.props.pushUpAfterKeyboardShow();
		}, 200);
		return true;
	}

	pullDownBeforeKeyboardHide(type) {
		if (type === 'email') {
			this.props.updateStatusEmailInput &&
				this.props.updateStatusEmailInput('blur');
		} else {
			this.props.updateStatusPasswordInput &&
				this.props.updateStatusPasswordInput('blur');
		}
		setTimeout(() => {
			this.props.pullDownBeforeKeyboardHide &&
				this.props.pullDownBeforeKeyboardHide();
		}, 200);
		return true;
	}

	getEnv() {
		if (
			config.logoInApp === 'IRESS' ||
			config.subEnvironment === SUB_ENVIRONMENT.NEXT
		) {
			return I18n.t('uatEnv');
		}
		const env = config.environment;
		switch (env) {
			case ENUM.ENVIRONMENT.STAGING:
				return I18n.t('stagingUpper');
			case ENUM.ENVIRONMENT.NEXT:
				return I18n.t('nextUpper');
			case ENUM.ENVIRONMENT.BETA:
				return I18n.t('betaUpper');
			default:
				return I18n.t('demoUpper');
		}
	}

	pushForgotPassword() {
		const type = ENUM.SIGN_IN_SCREEN_SWITCH.FORGOT_PASSWORD;
		this.props.switchForgotScreen && this.props.switchForgotScreen(type);
		return true;
	}

	pushForgotUsername() {
		const type = ENUM.SIGN_IN_SCREEN_SWITCH.FORGOT_USERNAME;
		this.props.switchForgotScreen && this.props.switchForgotScreen(type);
		return true;
	}

	pushCompleteSignUp() {
		const type = ENUM.SIGN_IN_SCREEN_SWITCH.COMPLETE_SIGN_UP;
		this.props.switchForgotScreen && this.props.switchForgotScreen(type);
		return true;
	}

	renderForgotten() {
		const { textBlue, wrapperText } = styles;
		return (
			<View
				style={{
					marginHorizontal: 48,
					marginTop: 16,
					marginBottom: 70
				}}
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						flexWrap: 'wrap'
					}}
				>
					<TouchableOpacity
						style={[
							wrapperText,
							{
								height: 22,
								opacity: this.state.disabledForgotten ? 0.5 : 1
							}
						]}
						disabled={this.state.disabledForgotten}
						onPress={this.pushForgotPassword}
					>
						<Text style={[textBlue]}>
							{I18n.t('forgotYourPassword')}
						</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={this.pushCompleteSignUp}
					disabled={this.state.disabledForgotten}
					style={{
						marginHorizontal: 30,
						marginTop: 8,
						opacity: this.state.disabledForgotten ? 0.5 : 1
					}}
				>
					<Text style={[textBlue, { textAlign: 'center' }]}>
						{I18n.t('completeSignUp')}
					</Text>
				</TouchableOpacity>
			</View>
		);
	}
	renderFakeBg = () => {
		return (
			<ReAnimated.View
				pointerEvents={'none'}
				style={[
					StyleSheet.absoluteFillObject,
					{
						backgroundColor: CommonStyle.backgroundColor,
						opacity: this.dic.opacityFakeBg
					}
				]}
			>
				<Image
					source={
						Platform.OS === 'ios' ? background : backgroundAndroid
					}
					style={{ position: 'absolute', height, width }}
					resizeMode={Platform.OS === 'ios' ? 'cover' : 'stretch'}
				/>
			</ReAnimated.View>
		);
	};
	render() {
		const {
			homePageDescriptionText,
			homePageRegisterText,
			rightIcon,
			dialogInputClone,
			signInScreenButtons,
			signInScreenMainButtons
		} = styles;
		return (
			<View style={{ flex: 1 }}>
				<View
					style={{
						flex: 1,
						justifyContent: 'flex-end',
						height: Util.isIOS() ? height - 20 : height - 24
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							marginHorizontal: marginHorizontal,
							borderRadius: 52,
							borderColor:
								CommonStyle.authenticationVersion2.colorBlue,
							borderWidth: 2
						}}
					>
						<TouchableOpacity
							testID={`liveBtn`}
							style={[
								signInScreenButtons,
								{
									borderTopLeftRadius: 52,
									borderBottomLeftRadius: 52,
									borderTopRightRadius: this.state.isDemo
										? 0
										: 52,
									borderBottomRightRadius: this.state.isDemo
										? 0
										: 52,
									zIndex: 10
								}
							]}
							disabled={
								config.environment !==
								ENUM.ENVIRONMENT.PRODUCTION
							}
							onPress={() => this.changeAppVersion(false)}
						>
							<Text
								style={[
									homePageDescriptionText,
									{
										color: CommonStyle.fontWhite
									}
								]}
							>
								{I18n.t('liveUpper')}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							testID={`demoBtn`}
							style={[
								signInScreenButtons,
								{
									borderTopLeftRadius: this.state.isDemo
										? 52
										: 0,
									borderBottomLeftRadius: this.state.isDemo
										? 52
										: 0,
									borderTopRightRadius: 52,
									borderBottomRightRadius: 52,
									zIndex: 10
								}
							]}
							onPress={() => this.changeAppVersion(true)}
						>
							<Text
								style={[
									homePageDescriptionText,
									{
										color: CommonStyle.fontWhite
									}
								]}
							>
								{this.getEnv()}
							</Text>
						</TouchableOpacity>

						<Animated.View
							style={{
								height: 52,
								width: buttonWidth,
								backgroundColor:
									CommonStyle.authenticationVersion2
										.colorBlue,
								borderRadius: 26,
								transform: [{ translateX: this.translateX }]
							}}
							position={'absolute'}
						/>
					</View>

					<View style={{ marginTop: 40, marginHorizontal: 48 }}>
						{/* Email */}
						<View style={{ flexDirection: 'row' }}>
							<TextInput
								testID={`usernameField`}
								ref={(ref) => (this.emailInput = ref)}
								placeholder={I18n.t('placeHolderUsername')}
								placeholderTextColor="rgba(239,239,239,0.7)"
								underlineColorAndroid="rgba(0,0,0,0)"
								numberOfLines={1}
								onChangeText={(value) => {
									this._onChangeText(value, 'username');
								}}
								// selectionColor="#FFF"
								defaultValue={this.props.login.lastEmail}
								// value={this.state.username}
								// autoFocus={this.state.value['username'] === ''}
								style={[
									dialogInputClone,
									{ color: CommonStyle.fontWhite }
								]}
								onSubmitEditing={this.login}
							/>
							<TouchableOpacity
								testID={`removeUsernameBtn`}
								style={rightIcon}
								activeOpacity={1}
								onPress={this._rightIconInputPress.bind(
									this,
									'username'
								)}
							>
								<Icon
									style={[
										{
											opacity: 1,
											color: CommonStyle.fontWhite
										}
									]}
									name={'md-close'}
									size={16}
								/>
							</TouchableOpacity>
						</View>

						{/* Password */}
						<View style={{ flexDirection: 'row', marginTop: 16 }}>
							<TextInput
								testID={`passwordField`}
								ref={(ref) => (this.passwordInput = ref)}
								placeholder={I18n.t('password')}
								placeholderTextColor="rgba(239,239,239,0.7)"
								underlineColorAndroid="rgba(0,0,0,0)"
								onChangeText={(value) => {
									this._onChangeText(value, 'password');
								}}
								value={this.state.password}
								// autoFocus={this.state.value['username'] !== ''}
								// selectionColor="#FFF"
								secureTextEntry={this.state.isSecureTextEntry}
								style={[
									dialogInputClone,
									{ color: CommonStyle.fontWhite }
								]}
								onSubmitEditing={this.login}
							/>
							<TouchableOpacity
								testID={`showPassBtn`}
								style={rightIcon}
								activeOpacity={1}
								onPress={this._rightIconInputPress.bind(
									this,
									'password'
								)}
							>
								<Icon
									style={[
										{
											opacity: this.state
												.isSecureTextEntry
												? 1
												: 0.6,
											color: CommonStyle.fontWhite
										}
									]}
									name={'md-eye'}
									size={16}
								/>
							</TouchableOpacity>
						</View>
					</View>

					<Animated.View
						testID={`logInError`}
						ref="textError"
						onLayout={(event) => this.measureView(event)}
						style={[
							styles.errorContainer,
							{
								height: this.state.errorTextHeight,
								backgroundColor: CommonStyle.fontRed,
								marginHorizontal: 48
							}
						]}
					>
						{this.state.errorText ? (
							<Text
								style={[
									CommonStyle.textSubLightWhite,
									{ textAlign: 'center' }
								]}
							>
								{this.state.errorText}
							</Text>
						) : null}
					</Animated.View>
					<Animated.View
						style={{ marginTop: this.state.signInMarginTop }}
					>
						<TouchableOpacity
							testID={`logInBtn`}
							style={[
								signInScreenMainButtons,
								{
									backgroundColor:
										CommonStyle.authenticationVersion2
											.colorBlue
								}
							]}
							disabled={
								this.props.isConnected
									? this.state.submitDisabled
									: true
							}
							onPress={this.login}
							testId={`logIn`}
						>
							{this.props.login.isLoading ? (
								<ActivityIndicator
									testID={`progressBarSignIn`}
									style={{ width: 24, height: 24 }}
									color="white"
								/>
							) : (
								<Text
									style={[
										homePageDescriptionText,
										{
											opacity: !this.props.isConnected
												? this.dic.opacity
												: this.state.submitDisabled
												? this.dic.opacity
												: 1
										}
									]}
								>
									{`${I18n.t('login')} (${
										this.state.isDemo
											? this.getEnv()
											: I18n.t('liveUpper')
									})`}
								</Text>
							)}
						</TouchableOpacity>

						<TouchableOpacity
							testID={`cancelBtn`}
							style={[
								signInScreenMainButtons,
								{
									marginTop: 16,
									backgroundColor: 'transparent'
								}
							]}
							disabled={this.state.cancelDisable}
							onPress={this.cancel}
						>
							<Text
								style={[
									homePageDescriptionText,
									{
										color: this.state.cancelDisable
											? CommonStyle.authenticationVersion2
													.colorGrey
											: CommonStyle.fontWhite
									}
								]}
							>
								{I18n.t('cancel')}
							</Text>
						</TouchableOpacity>

						{this.renderForgotten()}
						<HeightSoftBar />
					</Animated.View>
				</View>
				{this.renderFakeBg()}
			</View>
		);
	}
}

function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected,
		login: state.login,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
