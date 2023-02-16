import React, { Component } from 'react';
import {
	View,
	Text,
	Keyboard,
	Platform,
	BackHandler,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	PixelRatio,
	Dimensions
} from 'react-native';
import { BlurView, VibrancyView } from 'react-native-blur';
import * as Animatable from 'react-native-animatable';
import Pin from '../pin.2/pin';
import { func, dataStorage } from '../../storage';
import Modal from 'react-native-modal';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import PromptNew from '../../component/new_prompt/prompt_new';
import deviceModel from '../../constants/device_model';
import {
	saveItemInLocalStorage,
	logDevice,
	getItemFromLocalStorage
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../../screens/setting/auth_setting/auth_setting.actions';
import * as Controller from '../../memory/controller';
const { height } = Dimensions.get('window');
class AuthenByPin extends Component {
	constructor(props) {
		super(props);
		this.keyboardDidShowListener = null;
		this.keyboardDidHideListener = null;
		this.deviceModel = dataStorage.deviceModel;
		this.isMount = false;
		this.state = {
			isPinCodeModalVisible: false,
			animationAuthenByPin: '',
			numberFailEnterPin: dataStorage.userPin.numberFailEnterPin || 0,
			error: ''
		};
		this.getRefPinInput = this.getRefPinInput.bind(this);
		this.clearPin = this.clearPin.bind(this);
		this.removeTimeOut = this.removeTimeOut.bind(this);
		this.showModalAuthenPin = this.showModalAuthenPin.bind(this);
		this.hideModalAuthenPin = this.hideModalAuthenPin.bind(this);
		this.authenSuccess = this.authenSuccess.bind(this);
		this.authenFail = this.authenFail.bind(this);
		this.authenFailWithNoInternetConnection = this.authenFailWithNoInternetConnection.bind(
			this
		);
		this.showAlertAfterEnterPinFail = this.showAlertAfterEnterPinFail.bind(
			this
		);
		this.onFocusPinWhenHideKeyBoard = this.onFocusPinWhenHideKeyBoard.bind(
			this
		);
		this.checkNetworkAfterEnterPin = this.checkNetworkAfterEnterPin.bind(
			this
		);
	}

	showAlertAfterEnterPinFail() {
		this.isMount &&
			this.setState(
				{
					isPinCodeModalVisible: false
				},
				() => {
					setTimeout(() => {
						this.signOutPrompt && this.signOutPrompt.showModal();
					}, 500);
				}
			);
	}
	showModalAuthenPin() {
		logDevice('info', `SHOW MODAL AUTHEN PIN`);
		setTimeout(() => {
			this.isMount &&
				this.setState(
					{
						isPinCodeModalVisible: true
					},
					() => {
						logDevice(
							'info',
							`ANDROID - SHOW MODAL AUTHEN PIN SUCCESS - isPinCodeModalVisible = ${
							this.state.isPinCodeModalVisible
							}`
						);
						this.pinInput &&
							this.pinInput.focusPinInput &&
							this.pinInput.focusPinInput();
					}
				);
		}, 300);
	}

	hideModalAuthenPin() {
		Keyboard.dismiss();
		this.isMount &&
			this.setState({
				isPinCodeModalVisible: false
			});
	}
	onBackDropModalPress() {
		if (this.props.isDisableBackDrop) return;
		Keyboard.dismiss();
		this.isMount &&
			this.setState({
				isPinCodeModalVisible: false
			});
	}
	onBackButtonPress() {
		// Keyboard.dismiss()
		// this.isMount && this.setState({
		//   isPinCodeModalVisible: true
		// })
	}
	getRefPinInput() {
		if (this.pinInput) {
			return this.pinInput;
		}
	}

	clearPin() {
		this.pinInput && this.pinInput.clearPin();
	}

	removeTimeOut() {
		this.pinInput && this.pinInput.removeTimeOut();
	}

	onFocusPinWhenHideKeyBoard() {
		this.pinInput && this.pinInput.onFocusPinWhenHideKeyBoard();
	}

	authenSuccess(accessToken, successCallback, params) {
		const email = dataStorage.emailLogin
			? dataStorage.emailLogin.toLowerCase()
			: '';
		getItemFromLocalStorage(
			email,
			null,
			null,
			() => {
				// Set lai touch id setting trong redux
				const setTouchIDDefault = () => {
					if (dataStorage.isSupportTouchID) {
						let enableTouchID =
							dataStorage.isSupportTouchID || false;
						if (dataStorage.isNotEnrolledTouchID) {
							enableTouchID = false;
						}
						dataStorage.userPin = {
							email,
							enableTouchID,
							numberFailEnterPin: 0
						};
						logDevice(
							'info',
							`NOT HAVE USER SETTING ON LOCAL - SET DATASTORAGE: ${JSON.stringify(
								dataStorage.userPin
							)}`
						);
						this.props.authSettingActions.setEnableTouchID(
							enableTouchID
						);
					}
				};
				// Chưa có thì set setting mặc định
				let enableTouchID = dataStorage.isSupportTouchID || false;
				if (dataStorage.isNotEnrolledTouchID) {
					enableTouchID = false;
				}
				const obj = {
					email,
					enableTouchID,
					numberFailEnterPin: 0
				};
				logDevice(
					'info',
					`NOT HAVE USER SETTING ON LOCAL - SET DEFAULT: ${JSON.stringify(
						obj
					)}`
				);
				saveItemInLocalStorage(
					email,
					obj,
					null,
					setTouchIDDefault,
					null
				);
			},
			result => {
				const obj = {
					email,
					enableTouchID: result.enableTouchID,
					numberFailEnterPin: 0
				};
				dataStorage.userPin = { ...obj };
				saveItemInLocalStorage(email, obj, null, null, null);
				logDevice(
					'info',
					`ALREADY HAVE USER SETTING ON LOCAL - ${JSON.stringify(
						result
					)}`
				);
			}
		);

		setTimeout(() => {
			Keyboard.dismiss();
			this.isMount &&
				this.setState(
					{
						isPinCodeModalVisible: false,
						numberFailEnterPin: 0,
						error: ''
					},
					() => {
						dataStorage.userPin.numberFailEnterPin = this.state.numberFailEnterPin;
						this.pinInput && this.pinInput.removeTimeOut();
						successCallback &&
							setTimeout(() => {
								if (accessToken) {
									successCallback(params, accessToken);
								} else if (params.length > 0) {
									successCallback(...params);
								} else {
									successCallback();
								}
							}, 500);
						if (
							params &&
							params.hasOwnProperty('isSetLoggedIn') &&
							params.isSetLoggedIn === false
						) {
						} else {
							func.setLoginConfig(true);
						}
					}
				);
		}, 100);
	}

	authenFailWithNoInternetConnection() {
		this.isMount &&
			this.setState(
				{
					animationAuthenByPin: 'shake',
					error: I18n.t('noInternetConnectionWarning')
				},
				() => {
					this.pinInput && this.pinInput.removeTimeOut();
					setTimeout(() => {
						this.pinInput && this.pinInput.clearPin();
						this.isMount &&
							this.setState(
								{
									animationAuthenByPin: ''
								},
								() => {
									this.pinInput && this.pinInput.onFocusPin();
								}
							);
					}, 1000);
				}
			);
	}

	authenFail() {
		this.props.errorCallback && this.props.errorCallback();
		setTimeout(() => {
			this.isMount &&
				this.setState(
					{
						animationAuthenByPin: 'shake',
						numberFailEnterPin: this.state.numberFailEnterPin + 1,
						error: ''
					},
					() => {
						dataStorage.userPin.numberFailEnterPin = this.state.numberFailEnterPin;
						// Save to local
						const email = dataStorage.emailLogin
							? dataStorage.emailLogin.toLowerCase()
							: '';
						getItemFromLocalStorage(
							email,
							null,
							null,
							() => {
								// Chưa có thì set setting mặc định
								const obj = {
									email,
									enableTouchID: false,
									numberFailEnterPin: this.state
										.numberFailEnterPin
								};
								logDevice(
									'info',
									`NOT HAVE USER SETTING ON LOCAL - SET DEFAULT: ${JSON.stringify(
										obj
									)}`
								);
								saveItemInLocalStorage(
									email,
									obj,
									null,
									null,
									null
								);
							},
							result => {
								const obj = {
									email,
									enableTouchID: result.enableTouchID,
									numberFailEnterPin: this.state
										.numberFailEnterPin
								};
								saveItemInLocalStorage(
									email,
									obj,
									null,
									null,
									null
								);
								logDevice(
									'info',
									`ALREADY HAVE USER SETTING ON LOCAL - ${JSON.stringify(
										result
									)}`
								);
							}
						);
						this.pinInput && this.pinInput.removeTimeOut();
						if (this.state.numberFailEnterPin >= 3) {
							this.showAlertAfterEnterPinFail();
						} else {
							setTimeout(() => {
								this.pinInput && this.pinInput.clearPin();
								this.isMount &&
									this.setState(
										{
											animationAuthenByPin: ''
										},
										() => {
											this.pinInput &&
												this.pinInput.onFocusPin();
										}
									);
							}, 1000);
						}
					}
				);
		}, 100);
	}

	checkNetworkAfterEnterPin(pin) {
		if (this.props.isConnected) {
			this.props.onPinCompleted && this.props.onPinCompleted(pin);
		} else {
			this.authenFailWithNoInternetConnection();
		}
	}

	getEmail() {
		let result = '';
		if (store.login && store.login.email) {
			result = store.login.email;
		} else {
			result = dataStorage.emailLogin || '';
		}

		return result;
	}

	render() {
		const store = Controller.getGlobalState();
		const email = this.getEmail();
		/**
         * fix loi height sai tren mo vai thiet bi xiaomi, note 8
         */
		const realHeight = Controller.getRealWindowHeight()
		const deviceHeight = Platform.OS === 'ios'
			? height
			: realHeight
		return (
			<View>
				<PromptNew
					onRef={ref => (this.signOutPrompt = ref)}
					navigator={this.props.navigator}
				/>
				<Modal
					onRequestClose={() => console.log('pin modal back press')}
					onBackButtonPress={this.onBackButtonPress.bind(this)}
					onBackdropPress={this.onBackDropModalPress.bind(this)}
					backdropOpacity={0}
					deviceHeight={deviceHeight}
					isVisible={this.state.isPinCodeModalVisible}
					style={{
						justifyContent: 'flex-end',
						margin: 0,
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					}}
				>
					{Platform.OS === 'ios' ? (
						<KeyboardAvoidingView behavior={'padding'}>
							<BlurView
								blurType="xlight"
								style={{ borderRadius: 10, marginBottom: -8 }}
							>
								<Animatable.View
									animation={this.state.animationAuthenByPin}
									style={{ backgroundColor: 'transparent' }}
								>
									<View
										style={{
											justifyContent: 'center',
											alignItems: 'center',
											marginTop: 21
										}}
									>
										<Text
											testID={`titlePin`}
											style={[
												CommonStyle.fontLargeNormal,
												{ textAlign: 'center' }
											]}
										>{`${I18n.t('authenPinTitle')}`}</Text>
									</View>
									<Pin
										marginTop={20}
										marginHorizontal={16}
										onRef={ref => (this.pinInput = ref)}
										onPinCompleted={
											this.checkNetworkAfterEnterPin
										}
									/>
									{this.state.error === '' ? (
										this.state.numberFailEnterPin > 0 ? (
											<View
												style={{
													marginHorizontal: 32,
													marginVertical: 16,
													justifyContent: 'center',
													alignItems: 'center'
												}}
											>
												<Text
													style={CommonStyle.textPin}
												>{`${dataStorage.userPin
													.numberFailEnterPin ||
													this.state
														.numberFailEnterPin} ${I18n.t(
															'failedPin'
														)} ${
													dataStorage.userPin
														.numberFailEnterPin ===
														1
														? I18n.t('attemp')
														: I18n.t('attemps')
													}`}</Text>
											</View>
										) : (
												<View />
											)
									) : (
											<View
												style={{
													marginHorizontal: 32,
													marginVertical: 16,
													justifyContent: 'center',
													alignItems: 'center'
												}}
											>
												<Text
													style={CommonStyle.textPin}
												>{`${I18n.t(
													'noInternetConnectionWarning'
												)}`}</Text>
											</View>
										)}
									<View
										style={{
											marginHorizontal: 32,
											marginBottom: 16,
											marginTop:
												this.state.error === '' &&
													!dataStorage.userPin
														.numberFailEnterPin
													? 16
													: 0
										}}
									>
										<Text
											testID={`useTouchID`}
											style={[
												CommonStyle.textSubNormalNoColor,
												{
													flexDirection: 'row',
													textAlign: 'left',
													borderWidth: 1,
													borderColor: 'transparent'
												}
											]}
										>
											<Text>
												{!dataStorage.isSupportTouchID
													? `${I18n.t('enterPin')}`
													: `${I18n.t('enterPinOr')} `}
											</Text>
											{!dataStorage.isSupportTouchID ? null : !dataStorage
												.userPin.enableTouchID ||
												dataStorage.isLockTouchID ||
												this.props.usePin ? (
													<Text>
														{this.deviceModel ===
															deviceModel.IPHONE_X
															? `${I18n.t(
																'useFaceID'
															)}`
															: `${I18n.t(
																'useTouchIDIOS'
															)}`}
													</Text>
												) : (
													<Text
														onPress={
															this.props
																.onChangeAuthenByFingerPrint
														}
														style={{ color: '#007aff' }}
													>
														{this.deviceModel ===
															deviceModel.IPHONE_X
															? `${I18n.t(
																'useFaceID'
															)}`
															: `${I18n.t(
																'useTouchIDIOS'
															)}`}
													</Text>
												)}
											<Text>{` ${I18n.t(
												'confirmAccID'
											)}: ${email}. `}</Text>
										</Text>
										<Text
											onPress={this.props.onForgotPin}
											style={{ color: '#007aff' }}
										>{`${I18n.t('forgotPin')}?`}</Text>
									</View>
								</Animatable.View>
							</BlurView>
						</KeyboardAvoidingView>
					) : (
							<Animatable.View
								animation={this.state.animationAuthenByPin}
								style={{
									backgroundColor: '#f1eff5',
									borderTopLeftRadius: 10,
									borderTopRightRadius: 10
								}}
							>
								<View
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										marginTop: 21
									}}
								>
									<Text
										style={[
											CommonStyle.fontLargeNormal,
											{ textAlign: 'center' }
										]}
									>{`${I18n.t('authenPinTitle')}`}</Text>
								</View>
								<Pin
									marginTop={20}
									marginHorizontal={16}
									onRef={ref => (this.pinInput = ref)}
									onPinCompleted={this.checkNetworkAfterEnterPin}
								/>
								{this.state.error === '' ? (
									this.state.numberFailEnterPin > 0 ? (
										<View
											style={{
												marginHorizontal: 32,
												marginVertical: 16,
												justifyContent: 'center',
												alignItems: 'center'
											}}
										>
											<Text
												style={CommonStyle.textPin}
											>{`${dataStorage.userPin
												.numberFailEnterPin ||
												this.state
													.numberFailEnterPin} ${I18n.t(
														'failedPin'
													)} ${
												dataStorage.userPin
													.numberFailEnterPin === 1
													? I18n.t('attemp')
													: I18n.t('attemps')
												}`}</Text>
										</View>
									) : (
											<View />
										)
								) : (
										<View
											style={{
												marginHorizontal: 32,
												marginVertical: 16,
												justifyContent: 'center',
												alignItems: 'center'
											}}
										>
											<Text
												style={CommonStyle.textPin}
											>{`${I18n.t(
												'noInternetConnectionWarning'
											)}`}</Text>
										</View>
									)}
								<View
									style={{
										marginHorizontal: 32,
										marginBottom: 16,
										marginTop:
											this.state.error === '' &&
												!dataStorage.userPin.numberFailEnterPin
												? 16
												: 0
									}}
								>
									<Text
										style={[
											CommonStyle.textSubNormalNoColor,
											{
												flexDirection: 'row',
												textAlign: 'left',
												borderWidth: 1,
												borderColor: 'transparent'
											}
										]}
									>
										<Text>
											{!dataStorage.isSupportTouchID
												? `${I18n.t('enterPin')}`
												: `${I18n.t('enterPinOr')} `}
										</Text>
										{!dataStorage.isSupportTouchID ? null : !dataStorage
											.userPin.enableTouchID ||
											dataStorage.isLockTouchID ||
											this.props.usePin ? (
												<Text>{`${I18n.t(
													'useTouchIDAndroid'
												)}`}</Text>
											) : (
												<Text
													onPress={
														this.props
															.onChangeAuthenByFingerPrint
													}
													style={{ color: '#007aff' }}
												>{`${I18n.t(
													'useTouchIDAndroid'
												)}`}</Text>
											)}
										<Text>{` ${I18n.t(
											'confirmAccID'
										)}: ${email}. `}</Text>
									</Text>
									<Text
										onPress={this.props.onForgotPin}
										style={{ color: '#007aff' }}
									>{`${I18n.t('forgotPin')}?`}</Text>
								</View>
							</Animatable.View>
						)}
				</Modal>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AuthenByPin);
