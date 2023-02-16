import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Keyboard,
	ActivityIndicator,
	Dimensions
} from 'react-native';
import I18n from '../../../../modules/language/index';
import { dataStorage, func } from '../../../../storage';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Emitter from '@lib/vietnam-emitter';
import { logDevice, translateErrorCode } from '../../../../lib/base/functionUtil';
import authCode from '../../../../../src/constants/authCode';
import * as Business from '../../../../../src/business';
import ENUM from '../../../../enum';
// Api
import * as Api from '../../../../api';
// Redux
import * as loginActions from '../../../login/login.actions';
import * as authSettingActions from '../../../setting/auth_setting/auth_setting.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Style
import styles from '../../style/home_page';
import * as Controller from '../../../../memory/controller'
import CommonStyle from '~/theme/theme_controller'
// Component
import XComponent from '../../../../component/xComponent/xComponent';

const { height, width } = Dimensions.get('window');
export class ContentResetPassword extends XComponent {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.bindAllFunc();
		this.init();
	}
	init() {
		const line = {
			password: true,
			confirmPassword: true
		};
		this.state = {
			password: '',
			confirmPassword: '',
			confirmDisable: true,
			line: line,
			showPassword: false,
			showConfirmPassword: false,
			canClearEmail: false,
			showBusyBox: false,
			errorType: authCode.ENTER_NEW_EMAIL_AND_NEW_PASSWORD
		};
	}

	bindAllFunc() {
		this.renderButtonCancel = this.renderButtonCancel.bind(this);
		this.renderButtonConfirm = this.renderButtonConfirm.bind(this);
		this.renderButtonConfirmBusybox = this.renderButtonConfirmBusybox.bind(this);
		this.renderContentFinish = this.renderContentFinish.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.renderContent = this.renderContent.bind(this);
		// this._onChangeText = this._onChangeText.bind(this)
		this.rightIconFn = this.rightIconFn.bind(this);
		this.confirmFn = this.confirmFn.bind(this);
		this.cancel = this.cancel.bind(this);
		this.updateErrorType = this.updateErrorType.bind(this);
		this.showError = this.showError.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.renderHeader = this.renderHeader.bind(this)
	}

	componentDidMount() {
		this.isMount = true;
		this.updateErrorType();
	}

	callbackEmitter = params => {
		const { errorType, token } = params;
		this.token = token;
		this.setState({
			errorType
		});
	}

	updateErrorType() {
		try {
			const eventName = Business.getChannelUpdateResetPasswordType();
			Emitter.addListener(eventName, null, this.callbackEmitter);
		} catch (error) {
			logDevice('error', `updateErrorType EMITTER EXCEPTION: ${error}`);
		}
	}

	confirmFn() {
		Keyboard.dismiss();
		const comparePassword = this.comparePassword();
		this.setState({
			showBusyBox: true
		});
		if (comparePassword) {
			this.resetPassword();
		} else {
			this.showError('PASSWORD_NOT_MATCH');
			setTimeout(() => {
				this.setState({
					showBusyBox: false,
					isExpand: true,
					errorText: translateErrorCode('PASSWORD_NOT_MATCH'),
					line: {
						password: true,
						confirmPassword: false
					}
				});
			}, 500);
		}
	}

	comparePassword() {
		const newPassword = this.state.password;
		const confirmPassword = this.state.confirmPassword;
		if (newPassword !== confirmPassword) {
			return false;
		} else {
			return true;
		}
	}

	validateEmail(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line no-useless-escape
		if (re.test(String(email).toLowerCase())) {
			return true;
		} else {
			return false;
		}
	}

	resetPassword() {
		try {
			const objParams = {
				data: {
					user_login_id: dataStorage.emailLogin.trim(),
					token: this.token,
					password: this.state.confirmPassword
				}
			};
			const resetPasswordUrl = Api.getUrlCreatePassword();
			return Api.httpPost(resetPasswordUrl, objParams)
				.then(data => {
					logDevice('info', 'DATA RESPONE RESET PASSWORD ', data)
					if (data.status && data.status === 200) {
						this.successResetCallback &&
							this.successResetCallback();
					} else {
						let errorCode;
						if (typeof data.errorCode === 'object') {
							data.errorCode.forEach(element => {
								if (element !== null) {
									errorCode = element;
								}
							});
						} else {
							errorCode = data.errorCode;
						}
						this.errorResetCallback && this.errorResetCallback(errorCode);
					}
				})
				.catch(errorMessage => {
					logDevice('error', 'ERROR MESSAGE RESET PASSWORD ', errorMessage)
					const errorText = 'unknown_error';

					this.errorResetCallback &&
						this.errorResetCallback(errorText);
				});
		} catch (error) {
			logDevice('info', 'RESET PASSWORD ERROR ', error);
			const errorText = 'unknown_error';

			this.errorResetCallback && this.errorResetCallback(errorText);
		}
	}

	resetPasswordQuantEdge(paramsPassword) {
		paramsPassword['token'] = this.token;
		this.props.actions.resetPasswordQuantEdge(
			paramsPassword,
			this.successResetCallback,
			this.errorResetCallback
		);
	}

	successResetCallback() {
		this.setState({
			showBusyBox: false
		});
		this.login();
	}

	loginError(errorCode) {
		logDevice('info', `RESET PASSWORD THEN LOGIN ERROR`);
		this.showError(errorCode);
		setTimeout(() => {
			this.setState({
				showBusyBox: false
			})
		},
			500
		);
	}

	errorResetCallback(errorCode) {
		if (errorCode === 'incorrectPassword') {
			this.showError(errorCode);
			setTimeout(() => {
				this.setState({
					showBusyBox: false,
					line: {
						password: false,
						confirmPassword: true
					}
				});
			}, 500);
		} else {
			this.showError(errorCode);
			setTimeout(() => {
				this.setState({
					showBusyBox: false,
					line: {
						password: false,
						confirmPassword: false
					}
				});
			}, 500);
		}
	}

	login() {
		const username = dataStorage.emailLogin;
		const password = this.state.password;
		if (username !== '' && password !== '') {
			this.props.actions.clearToken(); // Clear accessToken, refreshToken, pin
			if (this.props.isConnected) {
				// dataStorage.callbackAfterReconnect = this.callbackAfterReconnect;
				this.props.actions.loginRequest(username, password);
				this.props.actions.setLastEmail(username); // Save last email just entered

				if (this.props.isConnected) {
					// Login success -> cancel animation for keyboard
					dataStorage.isLocked = true;
					this.props.actions.login(
						username,
						password,
						null,
						this.loginError,
						this.successCallback,
						null,
						null,
						this.loginSuccessCallback
					); // user not verify
				}
			}
		}
	}

	cancel() {
		this.setState(
			{
				showBusyBox: false,
				isExpand: false,
				password: '',
				confirmPassword: '',
				errorText: '',
				line: {
					password: true,
					confirmPassword: true
				}
			},
			() => {
				this.props.cancelFn && this.props.cancelFn();
			}
		);
	}

	rightIconFn(ref, id) {
		switch (id) {
			case 'password':
				this.setState(
					{
						showPassword: !this.state.showPassword
					},
					() => {
						Business.setSelectionTextInput(
							ref,
							this.state.password.length
						);
					}
				);
				break;
			case 'confirmPassword':
				this.setState(
					{
						showConfirmPassword: !this.state.showConfirmPassword
					},
					() => {
						Business.setSelectionTextInput(
							ref,
							this.state.confirmPassword.length
						);
					}
				);
				break;
			default:
				break;
		}
	}

	checkDisableButton(value1, value2, value3) {
		if (value1 !== '' && value2 !== '') {
			return false;
		}
		return true;
	}

	_onChangePassword(password) {
		const confirmDisable = this.checkDisableButton(
			this.state.confirmPassword,
			password
		);
		this.setState({
			password,
			confirmDisable,
			line: {
				password: true,
				confirmPassword: true
			},
			errorCode: ''
		});
	}

	_onChangeConfirmPassword(confirmPassword) {
		const confirmDisable = this.checkDisableButton(
			this.state.password,
			confirmPassword
		);
		this.setState({
			confirmPassword,
			confirmDisable,
			line: {
				password: true,
				confirmPassword: true
			},
			errorCode: ''
		});
	}

	_onChangeEmail(email) {
		const confirmDisable = this.checkDisableButton(
			this.state.password,
			this.state.confirmPassword,
			email
		);
		this.setState({
			email,
			confirmDisable,
			line: {
				password: true,
				confirmPassword: true
			},
			errorCode: ''
		});
	}

	renderHeader() {
		const decriptionText3 = I18n.t('newPasswordDecription3')
		const decriptionText4 = I18n.t('newPasswordDecription4')
		return (
			this.state.errorType === authCode.ENTER_NEW_EMAIL_AND_NEW_PASSWORD
				? <View style={{ justifyContent: 'flex-end' }}>
					<Text style={{ color: '#efefef', textAlign: 'center', fontSize: CommonStyle.fontSizeXL, fontFamily: 'HelveticaNeue', marginHorizontal: 48 }}>
						{I18n.t('enterNewPassword')}
					</Text>
					<Text style={{ color: '#efefef', textAlign: 'left', fontSize: CommonStyle.fontSizeM, marginHorizontal: 48, marginTop: 8 }}>
						<Text style={{ fontFamily: 'HelveticaNeue' }}>{decriptionText4}</Text>
					</Text>
				</View>
				: <View style={{ justifyContent: 'flex-end' }} >
					<Text style={{ color: '#efefef', textAlign: 'center', fontSize: CommonStyle.fontSizeXL, fontFamily: 'HelveticaNeue', marginHorizontal: 48 }}>
						{I18n.t('enterNewPassword')}
					</Text>
					<Text style={{ color: '#efefef', textAlign: 'left', fontSize: CommonStyle.fontSizeM, marginHorizontal: 48, marginTop: 8 }}>
						<Text style={{ fontFamily: 'HelveticaNeue' }}>{decriptionText3}</Text>
					</Text>
				</View>
		)
	}
	renderButtonConfirm() {
		const { homePageRegister } = styles;
		return (
			<TouchableOpacity
				testID={`confirmButtonBtn`}
				style={[homePageRegister, { height: 48, marginHorizontal: 48 }]}
				disabled={
					this.props.isConnected ? this.state.confirmDisable : true
				}
				onPress={this.confirmFn}
				testId={`confirm`}
			>
				{this.state.showBusyBox
					? this.renderButtonConfirmBusybox()
					: this.renderButtonConfirmText()}
			</TouchableOpacity>
		);
	}

	showError(errorCode) {
		this.props.showError && this.props.showError(errorCode);
	}

	renderButtonConfirmBusybox() {
		return (
			<ActivityIndicator
				testID={`progressBarSignIn`}
				style={{ width: 24, height: 24 }}
				color="white"
			/>
		);
	}

	renderButtonConfirmText() {
		const { homePageDescriptionText } = styles;
		return (
			<Text
				style={[
					homePageDescriptionText,
					{
						color: '#FFFFFF',
						opacity: this.props.isConnected
							? this.state.confirmDisable
								? 0.7
								: 1
							: 0.7
					}
				]}
			>
				{I18n.t('confirm')}
			</Text>
		);
	}

	renderContentFinish() {
		const { homePageRegister, homePageDescriptionText } = styles;
		return (
			<View style={{ marginVertical: 112 }}>
				<TouchableOpacity
					testID={`okBtn`}
					style={[
						homePageRegister,
						{ height: 48, marginHorizontal: 48 }
					]}
					onPress={this.backWhenFinish}
				>
					<Text
						style={[homePageDescriptionText, { color: '#FFFFFF' }]}
					>
						{I18n.t('ok')}
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	renderButtonCancel() {
		const { homePageRegister, homePageDescriptionText } = styles;
		return (
			<TouchableOpacity
				testID={`cancelBtn`}
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
				<Text style={[homePageDescriptionText, { color: '#FFFFFF' }]}>
					{I18n.t('cancel')}
				</Text>
			</TouchableOpacity>
		);
	}

	renderInput() {
		const { dialogInputClone, rightIcon } = styles;
		return (
			<View>
				<View style={{ flexDirection: 'row' }}>
					<TextInput
						ref={ref => (this.password = ref)}
						placeholder={I18n.t('password')}
						placeholderTextColor="rgba(239,239,239,0.7)"
						secureTextEntry={!this.state.showPassword}
						underlineColorAndroid="rgba(0,0,0,0)"
						// selectionColor="#FFF"
						onChangeText={value => {
							this._onChangePassword(value);
						}}
						value={this.state.password}
						style={[
							dialogInputClone,
							{
								color: '#FFF',
								marginTop: 24,
								borderBottomColor: this.state.line['password']
									? 'gray'
									: 'red'
							}
						]}
					/>
					<TouchableOpacity
						style={[
							rightIcon,
							{
								borderBottomColor: this.state.line['password']
									? 'gray'
									: 'red',
								height: 23,
								marginTop: 25
							}
						]}
						activeOpacity={1}
						onPress={this.rightIconFn.bind(
							this,
							this.password,
							'password'
						)}
					>
						<Icon
							style={[
								{
									opacity: this.state.showPassword ? 1 : 0.6,
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
						ref={ref => (this.confirmPassword = ref)}
						placeholder={I18n.t('confirmPassword')}
						placeholderTextColor="rgba(239,239,239,0.7)"
						secureTextEntry={!this.state.showConfirmPassword}
						underlineColorAndroid="rgba(0,0,0,0)"
						// selectionColor="#FFF"
						onChangeText={value => {
							this._onChangeConfirmPassword(value);
						}}
						value={this.state.confirmPassword}
						style={[
							dialogInputClone,
							{
								color: '#FFF',
								marginTop: 32,
								borderBottomColor: this.state.line['confirmPassword']
									? 'gray'
									: 'red'
							}
						]}
					/>
					<TouchableOpacity
						style={[
							rightIcon,
							{
								marginTop: 33,
								height: 23,
								borderBottomColor: this.state.line['confirmPassword']
									? 'gray'
									: 'red'
							}
						]}
						activeOpacity={1}
						onPress={this.rightIconFn.bind(
							this,
							this.confirmPassword,
							'confirmPassword'
						)}
					>
						<Icon
							style={[
								{
									opacity: this.state.showConfirmPassword
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
				<View
					style={{ height: 24, marginTop: 32, marginBottom: 16 }}
				/>
			</View>
		);
	}

	renderContent() {
		return (
			<View>
				{this.renderHeader()}
				{height > 700 ? <View style={{ height: 32 }} /> : <View />}
				<View style={{ marginHorizontal: 48 }}>
					{this.renderInput()}
				</View>
				<View>
					{this.renderButtonConfirm()}
					{this.renderButtonCancel()}
				</View>
			</View>
		);
	}
	// ##END RENDER JSX##

	render() {
		return this.renderContent();
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ContentResetPassword);
