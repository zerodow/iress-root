import React, { Component } from 'react'
import {
	View, Text, TouchableOpacity, TextInput, Keyboard, ActivityIndicator, AppState
} from 'react-native'
import I18n from '../../../../modules/language/index'
import { dataStorage, func } from '../../../../storage'
import Icon from 'react-native-vector-icons/Ionicons';
import * as Emitter from '@lib/vietnam-emitter'
import * as AuthBusiness from '../../../../channel/auth_business'
import * as Business from '../../../../business'
import ENUM from '../../../../enum'
// Api
import * as Api from '../../../../api'
// Redux
import * as loginActions from '../../../login/login.actions';
import * as authSettingActions from '../../../setting/auth_setting/auth_setting.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Style
import styles from '../../style/home_page'

// Component
import XComponent from '../../../../component/xComponent/xComponent'
import HeightSoftBar from '~/screens/homepage/view.height.softbar'

export class SendCode extends XComponent {
	constructor(props) {
		super(props)

		this.init = this.init.bind(this)
		this.bindAllFunc = this.bindAllFunc.bind(this)
		this.bindAllFunc()
		this.init()
	}

	init() {
		this.dic = {
			intervalCountDown: null
		}
		this.state = {
			isSendStatus: true,
			timeCountDown: 60,
			disabled: this.props.username === ''
		}
		this.nextAppState = false
		this.registerAppState && this.registerAppState()
		return true
	}

	bindAllFunc() {
		try {
			this.switchType = this.switchType.bind(this)
			this.renderSend = this.renderSend.bind(this)
			this.renderResend = this.renderResend.bind(this)
			this.startCountDown = this.startCountDown.bind(this)
			this.stopCountDown = this.stopCountDown.bind(this)
			this.sendCode = this.sendCode.bind(this)
			this.updateUsernameChange = this.updateUsernameChange.bind(this)
			this.registerAppState = this.registerAppState.bind(this)
			this.removeAppState = this.removeAppState.bind(this)
			this.handleAppStateChange = this.handleAppStateChange.bind(this)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	registerAppState() {
		AppState.addEventListener('change', this.handleAppStateChange);
	}
	removeAppState() {
		AppState.removeEventListener('change', this.handleAppStateChange);
	}

	handleAppStateChange(nextAppState) {
		if (nextAppState === 'background' ||
			nextAppState === 'inactive') {
			this.timeStampBackground = new Date().getTime()
			this.nextAppState = true
		} else {
			this.timeStampActive = new Date().getTime()
			this.durationBackground = Math.round((this.timeStampActive - this.timeStampBackground) / 1000)

			if (this.nextAppState === true && this.durationBackground < this.state.timeCountDown) {
				this.setState({
					timeCountDown: this.state.timeCountDown - this.durationBackground
				})
			} else if (this.nextAppState === true) {
				this.stopCountDown()
			}
			this.nextAppState = false
		}
	}

	componentDidMount() {
		super.componentDidMount()
		this.updateUsernameChange()
	}

	componentWillUnmount() {
		super.componentWillUnmount()
		this.removeAppState()
	}

	updateUsernameChange() {
		const channel = AuthBusiness.getChannelChangeUsername()
		Emitter.addListener(channel, this.id, username => {
			let disabled = false
			if (!username) {
				disabled = true
			}
			if (disabled !== this.state.disabled) {
				this.setState({
					disabled
				})
			}
		})
		return true
	}

	switchType(isSendStatus = true, timeCountDown = 0) {
		this.setState({
			isSendStatus,
			timeCountDown
		})
		return true
	}

	startCountDown() {
		this.switchType(false, 60)

		this.dic.intervalCountDown && clearInterval(this.dic.intervalCountDown)
		this.dic.intervalCountDown = setInterval(() => {
			if (this.state.timeCountDown === 0) {
				this.stopCountDown()
			} else {
				this.setState({
					timeCountDown: this.state.timeCountDown - 1
				})
			}
		}, 1000)
		return true
	}

	stopCountDown() {
		this.switchType(true)
		this.dic.intervalCountDown && clearInterval(this.dic.intervalCountDown)
		return true
	}

	sendCode() {
		this.startCountDown()
		this.props.sendCode && this.props.sendCode()
		return true
	}

	renderSend() {
		const { sendCodeButton, homePageDescriptionText } = styles
		const disableStyle = this.props.isConnected ? (this.state.disabled ? { opacity: 0.7 } : { opacity: 1 }) : { opacity: 0.7 }
		return <TouchableOpacity
			style={[sendCodeButton]}
			onPress={this.sendCode}
			disabled={this.state.disabled}
		>
			<Text style={[homePageDescriptionText, disableStyle]}>
				{I18n.t('sendCode')}
			</Text>
		</TouchableOpacity >
	}

	renderResend() {
		const { sendCodeButton, homePageDescriptionText } = styles
		return <TouchableOpacity
			style={[sendCodeButton]}
			disabled={true}
		>
			<Text style={[homePageDescriptionText, { flexDirection: 'row', opacity: 0.78 }]}>
				<Text style={[]}>
					{I18n.t('resend')}
				</Text>
				<Text>
					{` (${this.state.timeCountDown})`}
				</Text>
			</Text>
		</TouchableOpacity>
	}

	render() {
		return this.state.isSendStatus
			? this.renderSend()
			: this.renderResend()
	}
}

export class ContentForgotPassword extends XComponent {
	constructor(props) {
		super(props)

		this.init = this.init.bind(this)
		this.bindAllFunc = this.bindAllFunc.bind(this)
		this.bindAllFunc()
		this.init()
	}

	init() {
		this.dic = {
			loginTimeout: null,
			cancelTimeOut: null,
			usernameInput: null,
			codeInput: null,
			passwordInput: null,
			confirmInput: null,
			timeoutExpired: null,
			token: null
		}
		this.state = {
			passwordMatched: true,
			isPasswordSecureTextEntry: true,
			isConfirmPasswordSecureTextEntry: true,
			screen: ENUM.FORGOT_PASSWORD_SCREEN.FORGOT,
			finish: false,
			username: '',
			code: '',
			password: '',
			confirmPassword: '',
			confirmDisable: true,
			continueDisable: true,
			cancelDisable: false,
			errorCode: '',
			showBusyBox: false,
			linePassword: true,
			lineConfirmPassword: true
		}
		return true
	}

	bindAllFunc() {
		this.showHidePassword = this.showHidePassword.bind(this)
		this.showError = this.showError.bind(this)
		this.login = this.login.bind(this)
		this.disableCancel = this.disableCancel.bind(this)
		this.enableCancel = this.enableCancel.bind(this)
		this.loginError = this.loginError.bind(this)
		this.loginSuccessCallback = this.loginSuccessCallback.bind(this)
		this.successCallback = this.successCallback.bind(this)
		this.cancel = this.cancel.bind(this)
		this.setTimeoutGoExpire = this.setTimeoutGoExpire.bind(this)
		this.clearTimeoutGoExpire = this.clearTimeoutGoExpire.bind(this)
		this.cancelForgotPassword = this.cancelForgotPassword.bind(this)
		this.cancelNewPassword = this.cancelNewPassword.bind(this)
		this.confirmFn = this.confirmFn.bind(this)
		this.submitForgotPassword = this.submitForgotPassword.bind(this)
		this.updateAction = this.updateAction.bind(this)
		this.clearCode = this.clearCode.bind(this)
		this.clearUsername = this.clearUsername.bind(this)
		this._onChangeUsernameText = this._onChangeUsernameText.bind(this)
		this._onChangeCodeText = this._onChangeCodeText.bind(this)
		this._onChangePassword = this._onChangePassword.bind(this)
		this._onChangeConfirmPassword = this._onChangeConfirmPassword.bind(this)
		this.renderComponent = this.renderComponent.bind(this)
		this.renderForgotPassword = this.renderForgotPassword.bind(this)
		this.renderExpired = this.renderExpired.bind(this)
		this.renderNewPassword = this.renderNewPassword.bind(this)
		this.renderUserNameInput = this.renderUserNameInput.bind(this)
		this.renderCodeInput = this.renderCodeInput.bind(this)
		this.requestForgotSuccess = this.requestForgotSuccess.bind(this)
		this.requestForgotFail = this.requestForgotFail.bind(this)
		this.sendCode = this.sendCode.bind(this)
		this.checkDisableButton = this.checkDisableButton.bind(this)
		this.pubChangeUsername = this.pubChangeUsername.bind(this)
		this.requestForgotPassword = this.requestForgotPassword.bind(this)
		this.renderButtonCancel = this.renderButtonCancel.bind(this)
		this.renderNewPassword = this.renderNewPassword.bind(this)
		this.renderButtonConfirm = this.renderButtonConfirm.bind(this)
		this.renderButtonContinue = this.renderButtonContinue.bind(this)
		this.renderButtonContinueText = this.renderButtonContinueText.bind(this)
		this.renderButtonNewPasswordText = this.renderButtonNewPasswordText.bind(this)
		this.renderButtonContinueBusybox = this.renderButtonContinueBusybox.bind(this)
		return true
	}

	// ##ACTION##
	sendCode() {
		const url = Api.getUrlReceiveDigitCode()
		const data = {
			data: {
				user_login_id: (this.state.username + '').toLowerCase().trim(),
				type: 'forgot_password'
			}
		}
		Api.httpPost(url, data)
			.then(res => {
				console.log(res)
			})
			.catch(err => {
				console.log(err)
			})
		return true
	}

	updateAction(finish) {
		this.setState({
			finish
		})
		return true
	}

	clearCode() {
		const continueDisable = this.checkDisableButton(this.state.username, '')
		this.setState({
			code: '',
			continueDisable
		});
		return true
	}

	showHidePassword(type = 'password') {
		if (type === 'password') {
			this.setState(
				{
					isPasswordSecureTextEntry: !this.state.isPasswordSecureTextEntry
				},
				() => {
					Business.setSelectionTextInput(this.dic.passwordInput, this.state.password.length)
				}
			);
		} else {
			this.setState(
				{
					isConfirmPasswordSecureTextEntry: !this.state.isConfirmPasswordSecureTextEntry
				},
				() => {
					Business.setSelectionTextInput(this.dic.confirmPasswordInput, this.state.confirmPassword.length)
				}
			);
		}
		return true
	}

	clearUsername() {
		const continueDisable = this.checkDisableButton('', this.state.code)
		this.setState({
			username: '',
			continueDisable
		}, () => {
			this.pubChangeUsername(this.state.username)
		});
		return true
	}

	checkDisableButton(value1, value2) {
		if (value1 !== '' && value2 !== '') {
			return false
		}
		return true
	}

	cancel(isRefresh = false) {
		if (this.state.screen === ENUM.FORGOT_PASSWORD_SCREEN.NEW_PASSWORD) {
			return this.cancelNewPassword()
		}
		isRefresh = this.state.screen === ENUM.FORGOT_PASSWORD_SCREEN.EXPIRED
		return this.cancelForgotPassword(isRefresh)
	}

	cancelNewPassword() {
		const { channelChangeHeader } = this.props
		const obj = {
			title: I18n.t('forgotPassword'),
			content: I18n.t('forgotPasswordWithCodeRemind')
		}
		Emitter.emit(channelChangeHeader, obj)
		this.setState({
			errorCode: '',
			screen: ENUM.FORGOT_PASSWORD_SCREEN.FORGOT
		})
		return true
	}

	cancelForgotPassword(isRefresh = false) {
		this.props.cancelFn && this.props.cancelFn();
		if (isRefresh) {
			setTimeout(() => {
				this.setState({
					screen: ENUM.FORGOT_PASSWORD_SCREEN.FORGOT
				})
			}, 400)
		}
		return true
	}

	submitForgotPassword() {
		Keyboard.dismiss()
		this.setState({
			showBusyBox: true
		});
		this.requestForgotPassword()
		return true
	}

	setTimeoutGoExpire() {
		const timeout = ENUM.TIME_FORGOT_PASSWORD_EXPIRE
		this.clearTimeoutGoExpire()
		this.dic.timeoutExpired = setTimeout(() => {
			this.setState({
				errorCode: '',
				screen: ENUM.FORGOT_PASSWORD_SCREEN.EXPIRED
			}, () => {
				const { channelChangeHeader } = this.props
				const obj = {
					title: I18n.t('enterNewPassword'),
					content: I18n.t('forgotExpireRemind')
				}
				Emitter.emit(channelChangeHeader, obj)
			})
		}, timeout)
		return true
	}

	clearTimeoutGoExpire() {
		this.dic.timeoutExpired && clearTimeout(this.dic.timeoutExpired)
		return true
	}

	confirmFn() {
		const { password, confirmPassword } = this.state
		const passwordMatched = this.checkPasswordMatched(password, confirmPassword)

		if (passwordMatched) {
			Keyboard.dismiss()
			this.setState({
				showBusyBox: true,
				passwordMatched: true
			});
			this.requestNewPassword()
		} else {
			const errorCode = 'PASSWORD_NOT_MATCH'
			Keyboard.dismiss()
			this.showError(errorCode)
			this.setState({
				lineConfirmPassword: false
			})
		}
		return true
	}

	checkPasswordMatched(password, confirmPassword) {
		return password === confirmPassword
	}

	requestForgotPassword(byPass = false) {
		const url = Api.getUrlVerifyDigitCode()
		const data = {
			data: {
				user_login_id: (this.state.username + '').toLowerCase().trim(),
				verify_code: this.state.code,
				type: 'forgot_password'
			}
		}
		Api.httpPost(url, data)
			.then(res => {
				if (res) {
					if (res.status && res.status === 200) {
						const token = res.token
						this.dic.token = token
						this.requestForgotSuccess()
					} else {
						let errorCode;
						if (typeof (res.errorCode) === 'object') {
							res.errorCode.forEach(element => {
								if (element !== null) {
									errorCode = element || 'unknown_error'
								}
							});
						} else {
							errorCode = res.errorCode || 'unknown_error'
						}
						this.requestForgotFail(errorCode)
					}
				} else {
					this.requestForgotFail({
						errorCode: 'unknown_error'
					})
				}
			})
			.catch(err => {
				console.log(err)
				this.requestForgotFail({
					errorCode: 'unknown_error'
				})
				return false
			})
		return true
	}

	requestNewPassword(byPass = false) {
		const url = Api.getUrlCreatePassword()
		const data = {
			data: {
				user_login_id: (this.state.username + '').toLowerCase().trim(),
				token: this.dic.token,
				password: this.state.password
			}
		}
		Api.httpPost(url, data)
			.then(res => {
				if (res) {
					if (res.status && res.status === 200) {
						this.requestNewPasswordSuccess()
					} else {
						let errorCode;
						if (typeof (res.errorCode) === 'object') {
							res.errorCode.forEach(element => {
								if (element !== null) {
									errorCode = element || 'unknown_error'
								}
							});
						} else {
							errorCode = res.errorCode || 'unknown_error'
						}
						this.requestNewPasswordFail(errorCode)
					}
				} else {
					this.requestNewPasswordFail({
						errorCode: 'unknown_error'
					})
				}
			})
			.catch(err => {
				console.log(err)
				this.requestNewPasswordFail({
					errorCode: 'unknown_error'
				})
				return false
			})
		return true
	}

	requestForgotSuccess() {
		this.setTimeoutGoExpire() // 20 mins go expire screen

		this.setState({
			lineConfirmPassword: true,
			linePassword: true,
			continueDisable: true,
			showBusyBox: false,
			screen: ENUM.FORGOT_PASSWORD_SCREEN.NEW_PASSWORD
		});
		const { channelChangeHeader } = this.props
		const obj = {
			title: I18n.t('enterNewPassword'),
			content: I18n.t('newPasswordRemind')
		}
		Emitter.emit(channelChangeHeader, obj)
		return true
	}

	requestForgotFail(errorCode) {
		this.showError(errorCode)
		this.setState({
			continueDisable: false,
			showBusyBox: false
		});
		return true
	}

	showError(errorCode) {
		this.setState({
			linePassword: false,
			lineConfirmPassword: false
		})
		this.props.showError && this.props.showError(errorCode)
		return true
	}

	login() {
		dataStorage.emailLogin = this.state.username.toLowerCase().trim();
		this.props.actions.setLastEmail(this.state.username.toLowerCase().trim()); // Save last email just entered
		if (this.dic.loginTimeout) {
			clearTimeout(this.dic.loginTimeout);
		}
		if (this.props.isConnected) {
			// Login success -> cancel animation for keyboard
			dataStorage.isLocked = true;
			this.props.actions.login(
				this.state.username,
				this.state.password,
				null,
				this.loginError,
				this.successCallback, // user not verify
				null,
				null,
				this.loginSuccessCallback
			);

			this.disableCancel()
		}
		return true
	}

	disableCancel() {
		this.setState({ cancelDisable: true });
		return true
	}

	enableCancel() {
		this.setState({ cancelDisable: false });
		return true
	}

	loginError(errorCode) {
		this.showError(errorCode)
		this.setState({
			showBusyBox: false,
			cancelDisable: false
		});
		return true
	}

	successCallback() {
		console.log('success callback')
		this.setState({
			errorCode: '',
			showBusyBox: false,
			cancelDisable: false
		});
		return true
	}

	loginSuccessCallback() {
		console.log('login success callback')
		this.setState({
			errorCode: '',
			showBusyBox: false,
			cancelDisable: false
		});
		return true
	}

	requestNewPasswordSuccess() {
		this.login()
		return true
	}

	requestNewPasswordFail(errorCode) {
		this.showError(errorCode)
		this.setState({
			confirmDisable: false,
			showBusyBox: false
		});
		return true
	}
	// ##END ACTION##
	pubChangeUsername(value) {
		const channel = AuthBusiness.getChannelChangeUsername()
		Emitter.emit(channel, value)
		return true
	}
	_onChangeUsernameText(username) {
		const continueDisable = this.state.code.length < 6 || this.checkDisableButton(username, this.state.code)
		this.setState({
			username,
			continueDisable,
			errorCode: ''
		}, () => {
			this.pubChangeUsername(this.state.username)
		});
		return true
	}

	_onChangeCodeText(code) {
		const continueDisable = code.length < 6 || this.checkDisableButton(this.state.username, code)
		this.setState({
			code,
			continueDisable,
			errorCode: ''
		});
		return true
	}

	_onChangePassword(password) {
		const confirmDisable = this.checkDisableButton(this.state.confirmPassword, password)
		this.setState({
			password,
			confirmDisable,
			linePassword: true,
			lineConfirmPassword: true,
			errorCode: ''
		});
		return true
	}

	_onChangeConfirmPassword(confirmPassword) {
		const confirmDisable = this.checkDisableButton(this.state.password, confirmPassword)
		this.setState({
			confirmPassword,
			confirmDisable,
			linePassword: true,
			lineConfirmPassword: true,
			errorCode: ''
		});
		return true
	}

	// ##RENDER JSX##
	renderButtonContinue() {
		const { homePageRegister } = styles
		const text = I18n.t('continue')
		return <TouchableOpacity
			style={[
				homePageRegister,
				{ height: 48, marginHorizontal: 48 }
			]}
			disabled={
				this.props.isConnected
					? this.state.continueDisable
					: true
			}
			onPress={this.submitForgotPassword}
		>
			{
				this.state.showBusyBox
					? this.renderButtonContinueBusybox()
					: this.renderButtonContinueText(text)
			}
		</TouchableOpacity>
	}

	renderButtonConfirm() {
		const { homePageRegister } = styles
		const confirmText = I18n.t('confirm')
		return <TouchableOpacity
			testID={`confirmButtonBtn`}
			style={[
				homePageRegister,
				{ height: 48, marginHorizontal: 48 }
			]}
			disabled={
				this.props.isConnected
					? this.state.confirmDisable
					: true
			}
			onPress={this.confirmFn}
			testId={`confirm`}
		>
			{
				this.state.showBusyBox
					? this.renderButtonContinueBusybox()
					: this.renderButtonNewPasswordText(confirmText)
			}
		</TouchableOpacity>
	}

	renderButtonContinueBusybox() {
		return <ActivityIndicator
			testID={`progressBarSignIn`}
			style={{ width: 24, height: 24 }}
			color="white"
		/>
	}

	renderButtonContinueText(text) {
		const { homePageDescriptionText } = styles
		return <Text
			style={[
				homePageDescriptionText,
				{
					color: '#FFFFFF',
					opacity: this.props.isConnected ? (this.state.continueDisable ? 0.7 : 1) : 0.7
				}
			]}
		>
			{text}
		</Text>
	}

	renderButtonNewPasswordText(text) {
		const { homePageDescriptionText } = styles
		return <Text
			style={[
				homePageDescriptionText,
				{
					color: '#FFFFFF',
					opacity: this.props.isConnected ? (this.state.confirmDisable ? 0.7 : 1) : 0.7
				}
			]}
		>
			{text}
		</Text>
	}

	renderButtonCancel() {
		const { homePageRegister, homePageDescriptionText } = styles
		return <TouchableOpacity
			testID={`cancelBtn`}
			disabled={this.state.cancelDisable}
			style={[
				homePageRegister,
				{
					marginBottom: 56,
					marginTop: 16,
					height: 48,
					borderColor: '#979797',
					borderWidth: 1,
					backgroundColor: 'transparent',
					marginHorizontal: 48
				}
			]}
			onPress={this.cancel}
		>
			<Text
				style={[
					homePageDescriptionText,
					{ color: '#FFFFFF', opacity: this.state.cancelDisable ? 0.78 : 1 }
				]}
			>
				{I18n.t('cancel')}
			</Text>
		</TouchableOpacity>
	}

	renderUserNameInput() {
		const { dialogInputClone, rightIcon } = styles
		return <View style={{ flexDirection: 'row' }}>
			{/* <View style={{ flexDirection: 'row', height: 48, flex: 1, alignItems: 'flex-end', marginRight: 8 }}> */}
			<TextInput
				ref={ref => (this.dic.usernameInput = ref)}
				placeholder={I18n.t('placeHolderUsername')}
				secureTextEntry={false}
				placeholderTextColor="rgba(239,239,239,0.7)"
				underlineColorAndroid="rgba(0,0,0,0)"
				// selectionColor="#FFF"
				onChangeText={value => {
					this._onChangeUsernameText(value);
				}}
				value={this.state.username}
				style={[
					dialogInputClone,
					{ color: '#FFF' }
				]}
			/>
			<TouchableOpacity
				style={[rightIcon]}
				activeOpacity={1}
				onPress={this.clearUsername}
			>
				<Icon
					style={[{ opacity: 1, color: '#FFF' }]}
					name={'md-close'}
					size={16}
				/>
			</TouchableOpacity>
		</View>

		// <SendCode sendCode={this.sendCode} username={this.state.username} isConnected={this.props.isConnected} />
		// </View>
	}

	renderCodeInput() {
		const { dialogInputClone, rightIcon } = styles
		return <View style={{ flexDirection: 'row', marginVertical: 8 }}>
			<View style={{ flexDirection: 'row', height: 48, flex: 1, alignItems: 'flex-end', marginRight: 8 }}>
				<TextInput
					keyboardType={'numeric'}
					ref={ref => (this.dic.codeInput = ref)}
					placeholder={I18n.t('placeHolderDigitCode')}
					placeholderTextColor="rgba(239,239,239,0.7)"
					underlineColorAndroid="rgba(0,0,0,0)"
					// selectionColor="#FFF"
					onChangeText={value => {
						this._onChangeCodeText(value);
					}}
					value={this.state.code}
					style={[
						dialogInputClone,
						{ color: '#FFF' }
					]}
				/>
				<TouchableOpacity
					style={[rightIcon, {}]}
					activeOpacity={1}
					onPress={this.clearCode}
				>
					<Icon
						style={[{ opacity: 1, color: '#FFF' }]}
						name={'md-close'}
						size={16}
					/>
				</TouchableOpacity>
			</View>
			<SendCode sendCode={this.sendCode} username={this.state.username} isConnected={this.props.isConnected} />
		</View>
	}

	renderNewPasswordInput() {
		const { dialogInputClone, rightIcon } = styles
		return (
			<View>
				<View style={{ flexDirection: 'row' }}>
					<TextInput
						ref={ref => (this.dic.passwordInput = ref)}
						placeholder={I18n.t('password')}
						placeholderTextColor="rgba(239,239,239,0.7)"
						underlineColorAndroid="rgba(0,0,0,0)"
						// selectionColor="#FFF"
						secureTextEntry={this.state.isPasswordSecureTextEntry}
						onChangeText={value => {
							this._onChangePassword(value);
						}}
						value={this.state.password}
						style={[
							dialogInputClone,
							{
								color: '#FFF',
								borderBottomColor: this.state.linePassword ? 'gray' : 'red'
							}
						]}
					/>
					<TouchableOpacity
						style={[rightIcon, { borderBottomColor: this.state.linePassword ? 'gray' : 'red' }]}
						activeOpacity={1}
						onPress={this.showHidePassword.bind(
							this,
							'password'
						)}
					>
						<Icon
							style={[
								{
									opacity: this.state.isPasswordSecureTextEntry
										? 1
										: 0.6,
									color: '#FFF'
								}
							]}
							name={'md-eye'}
							size={16}
						/>
					</TouchableOpacity>
				</View>

				<View style={{ flexDirection: 'row' }}>
					<TextInput
						ref={ref => (this.dic.confirmPasswordInput = ref)}
						placeholder={I18n.t('confirmPassword')}
						placeholderTextColor="rgba(239,239,239,0.7)"
						underlineColorAndroid="rgba(0,0,0,0)"
						// selectionColor="#FFF"
						secureTextEntry={this.state.isConfirmPasswordSecureTextEntry}
						onChangeText={value => {
							this._onChangeConfirmPassword(value);
						}}
						value={this.state.confirmPassword}
						style={[
							dialogInputClone,
							{
								color: '#FFF',
								marginTop: 16,
								marginBottom: 24,
								borderBottomColor: this.state.lineConfirmPassword ? 'gray' : 'red'
							}
						]}
					/>

					<TouchableOpacity
						style={[rightIcon, { marginTop: 16, marginBottom: 24, borderBottomColor: this.state.lineConfirmPassword ? 'gray' : 'red' }]}
						activeOpacity={1}
						onPress={this.showHidePassword.bind(this, 'confirm_password')}
					>
						<Icon
							style={[
								{
									opacity: this.state.isConfirmPasswordSecureTextEntry
										? 1
										: 0.6,
									color: '#FFF'
								}
							]}
							name={'md-eye'}
							size={16}
						/>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	renderComponent() {
		const screen = this.state.screen
		switch (screen) {
			case ENUM.FORGOT_PASSWORD_SCREEN.NEW_PASSWORD:
				return this.renderNewPassword()
			case ENUM.FORGOT_PASSWORD_SCREEN.EXPIRED:
				return this.renderExpired()
			default:
				// Default is forgot password
				return this.renderForgotPassword()
		}
	}

	renderForgotPassword() {
		return (
			<View>
				<View style={{ marginHorizontal: 48, marginTop: 32 }}>
					{
						this.renderUserNameInput()
					}
					{
						this.renderCodeInput()
					}
				</View>
				<View>
					{
						this.renderButtonContinue()
					}
					{
						this.renderButtonCancel()
					}
				</View>
				<HeightSoftBar />
			</View>
		)
	}

	renderNewPassword() {
		return (
			<View>
				<View style={{ marginHorizontal: 48, marginTop: 32 }}>
					{
						this.renderNewPasswordInput()
					}
				</View>
				<View>
					{
						this.renderButtonConfirm()
					}
					{
						this.renderButtonCancel()
					}
				</View>
			</View>
		)
	}

	renderExpired() {
		const { homePageRegister, homePageDescriptionText } = styles
		return (
			<View style={{ marginVertical: 112 }}>
				<TouchableOpacity
					testID={`okBtn`}
					style={[
						homePageRegister,
						{ height: 48, marginHorizontal: 48 }
					]}
					onPress={this.cancel}
				>
					<Text
						style={[
							homePageDescriptionText,
							{ color: '#FFFFFF' }
						]}
					>
						{I18n.t('ok')}
					</Text>
				</TouchableOpacity>
			</View>
		)
	}
	// ##END RENDER JSX##

	render() {
		return (
			this.renderComponent()
		)
	}
}

function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected,
		login: state.login
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentForgotPassword);
