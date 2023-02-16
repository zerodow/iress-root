import React, { Component } from 'react';
import {
	Dimensions,
	Image,
	ImageBackground,
	Keyboard,
	Platform,
	Text,
	TouchableWithoutFeedback,
	View,
	Animated
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Pin from '../pin/pin';
import { dataStorage, func } from '../../storage';
import CommonStyle from '~/theme/theme_controller';
import PromptNew from '../../component/new_prompt/prompt_new';
import CONFIG from '~/config'
import {
	authPinComplete,
	getItemFromLocalStorage,
	isIphoneXorAbove,
	logDevice,
	saveItemInLocalStorage
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../../screens/setting/auth_setting/auth_setting.actions';
import * as Controller from '../../memory/controller';
import pinBackground from '../../img/background_mobile/pinVersion2Background.png';
import logo from '../../img/background_mobile/logo.png'
import NumpadKeyboard from '../pin/numpad_keyboard';

const AnimatableImageBackground = Animatable.createAnimatableComponent(ImageBackground);
const { height, width: widthDevice } = Dimensions.get('window');

class AuthenByPin extends Component {
	constructor(props) {
		super(props);
		this.keyboardDidShowListener = null;
		this.keyboardDidHideListener = null;
		this.deviceModel = dataStorage.deviceModel;
		this.isMount = false;
		this.logoTranslateYAnim = new Animated.Value(0);
		this.pinWrapperOpacityAnim = new Animated.Value(1);
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
		this.authenFailWithNoInternetConnection = this.authenFailWithNoInternetConnection.bind(this);
		this.showAlertAfterEnterPinFail = this.showAlertAfterEnterPinFail.bind(this);
		this.onFocusPinWhenHideKeyBoard = this.onFocusPinWhenHideKeyBoard.bind(this);
		this.checkNetworkAfterEnterPin = this.checkNetworkAfterEnterPin.bind(this);

		this.focusInput = this.focusInput.bind(this);
		this.triggerAuthenSuccess = this.triggerAuthenSuccess.bind(this);
		this.setSensorStatus = this.setSensorStatus.bind(this);
		this.localAuthSetting = this.localAuthSetting.bind(this);
		this.localAuthSettingEmpty = this.localAuthSettingEmpty.bind(this)
	}

	renderLogoImg = this.renderLogoImg.bind(this)
	renderLogoImg() {
		switch (CONFIG.logoInApp) {
			case 'BETA':
				return <Image
					source={logo}
					resizeMode={'contain'}
					style={{
						height: 70
					}} />
			case 'DEMO':
				return <Image
					source={logo}
					resizeMode={'contain'}
					style={{ width: widthDevice - 64, height: ((widthDevice - 64) * 260) / 1766 }} />
			default:
				return <Image
					source={logo}
					resizeMode={'contain'}
					style={{
						height: 128
					}} />
		}
		return CONFIG.logoInApp === 'BETA'
			? <Image
				source={logo}
				resizeMode={'contain'}
				style={{
					height: 70
				}} />
			: <Image
				source={logo}
				resizeMode={'contain'}
				style={{
					height: 128
				}} />
	}

	focusInput() {
		this.pinInput && this.pinInput.focusPinInput && this.pinInput.focusPinInput()
	}

	snapLogoToMiddle = this.snapLogoToMiddle.bind(this)
	snapLogoToMiddle() {
		Animated.timing(
			this.logoTranslateYAnim,
			{
				toValue: 200,
				duration: 500
			}
		).start()
	}

	fadeOutPinWrapper = this.fadeOutPinWrapper.bind(this)
	fadeOutPinWrapper() {
		Animated.timing(
			this.pinWrapperOpacityAnim,
			{
				toValue: 0,
				duration: 200
			}
		).start()
	}

	snapLogoAndFadeOutPinWrapper = this.snapLogoAndFadeOutPinWrapper.bind(this)
	snapLogoAndFadeOutPinWrapper() {
		const middle = height / 2
		Animated.sequence([
			Animated.timing(
				this.pinWrapperOpacityAnim,
				{
					toValue: 0,
					duration: 200
				}
			),
			Animated.timing(
				this.logoTranslateYAnim,
				{
					toValue: middle - 70 - 90,
					duration: 500
				}
			)
		]).start()
	}

	componentDidMount() {
		// REF
		this.isMount = true;
		this.focusInput()
	}

	componentWillUnmount() {
		// UNREF
		this.isMount = false;
	}

	_keyboardDidShow() {
		console.log('keyboard did show');
	}

	_keyboardDidHide() {
		console.log('keyboard did hide');
	}

	showAlertAfterEnterPinFail() {
		dataStorage.onAuthenticating = false;
		this.isMount && this.setState({
			isPinCodeModalVisible: false
		}, () => {
			setTimeout(() => {
				this.signOutPrompt && this.signOutPrompt.showModal()
			}, 500)
		})
	}

	showModalAuthenPin() {
		logDevice('info', `SHOW MODAL AUTHEN PIN`);
		setTimeout(() => {
			dataStorage.onAuthenticating = true;
			dataStorage.dismissAuthen = this.hideModalAuthenPin;
			this.isMount && this.setState({
				isPinCodeModalVisible: true
			}, () => {
				logDevice('info', `SHOW MODAL AUTHEN PIN SUCCESS - isPinCodeModalVisible = ${this.state.isPinCodeModalVisible}`);
				this.pinInput && this.pinInput.focusPinInput && this.pinInput.focusPinInput()
			})
		}, 300)
	}

	hideModalAuthenPin() {
		Keyboard.dismiss();
		dataStorage.onAuthenticating = false;
		this.isMount && this.setState({
			isPinCodeModalVisible: false
		})
	}

	onBackDropModalPress() {
		Keyboard.dismiss();
		this.props.onClose && this.props.onClose()
	}

	onBackButtonPress() {
		console.log('onBackButtonPress')
	}

	getRefPinInput() {
		if (this.pinInput) {
			return this.pinInput
		}
	}

	clearPin() {
		this.pinInput && this.pinInput.clearPin()
	}

	removeTimeOut() {
		this.pinInput && this.pinInput.removeTimeOut();
	}

	onFocusPinWhenHideKeyBoard() {
		this.pinInput && this.pinInput.onFocusPinWhenHideKeyBoard();
	}

	localAuthSettingEmpty() {
		const email = dataStorage.emailLogin ? dataStorage.emailLogin.toLowerCase() : '';
		// Set lai touch id setting trong redux
		const setTouchIDDefault = () => {
			if (dataStorage.isSupportTouchID) {
				let enableTouchID = dataStorage.isSupportTouchID || false;
				if (dataStorage.isNotEnrolledTouchID) {
					enableTouchID = false
				}
				dataStorage.userPin = {
					email,
					enableTouchID,
					numberFailEnterPin: 0
				};
				logDevice('info', `NOT HAVE USER SETTING ON LOCAL - SET DATASTORAGE: ${JSON.stringify(dataStorage.userPin)}`);
				this.props.authSettingActions.setEnableTouchID(enableTouchID)
			}
		};
		// Chưa có thì set setting mặc định
		let enableTouchID = dataStorage.isSupportTouchID || false;
		if (dataStorage.isNotEnrolledTouchID) {
			enableTouchID = false
		}
		let obj = {
			email,
			enableTouchID,
			numberFailEnterPin: 0
		};
		logDevice('info', `NOT HAVE USER SETTING ON LOCAL - SET DEFAULT: ${JSON.stringify(obj)}`);
		saveItemInLocalStorage(email, obj, null, setTouchIDDefault, null)
	}

	localAuthSetting(result) {
		const email = dataStorage.emailLogin ? dataStorage.emailLogin.toLowerCase() : '';
		let obj = {
			email,
			enableTouchID: result.enableTouchID,
			numberFailEnterPin: 0
		};
		dataStorage.userPin = { ...obj };
		saveItemInLocalStorage(email, obj, null, null, null);
		logDevice('info', `ALREADY HAVE USER SETTING ON LOCAL - ${JSON.stringify(result)}`)
	}

	setSensorStatus() {
		const email = dataStorage.emailLogin ? dataStorage.emailLogin.toLowerCase() : '';
		getItemFromLocalStorage(
			email,
			null,
			null,
			this.localAuthSettingEmpty.bind(this),
			this.localAuthSetting.bind(this)
		)
	}

	triggerAuthenSuccess({ accessToken }) {
		dataStorage.onAuthenticating = false;
		dataStorage.userPin.numberFailEnterPin = 0;
		this.pinInput && this.pinInput.removeTimeOut();
		this.snapLogoAndFadeOutPinWrapper()
		setTimeout(() => {
			this.props.onPass && this.props.onPass({ accessToken });
			if (this.props.isSetLoggedIn !== null && this.props.isSetLoggedIn !== undefined && this.props.isSetLoggedIn === false) {
			} else {
				func.setLoginConfig(true)
			}
		}, 800)
	}

	authenSuccess({ accessToken }) {
		this.setSensorStatus();
		this.triggerAuthenSuccess({ accessToken })
	}

	closeModalCb() {

	}

	onPinComplete(pincode) {
		try {
			authPinComplete({
				authenSuccess: this.authenSuccess,
				authenFail: this.authenFail,
				closeModalCb: this.closeModalCb.bind(this),
				pincode
			});
			return true
		} catch (error) {
			console.catch(error);
			return false
		}
	}

	authenFailWithNoInternetConnection() {
		this.isMount && this.setState({
			animationAuthenByPin: 'shake',
			error: I18n.t('noInternetConnectionWarning')
		}, () => {
			this.pinInput && this.pinInput.removeTimeOut();
			setTimeout(() => {
				this.pinInput && this.pinInput.clearPin();
				this.isMount && this.setState({
					animationAuthenByPin: ''
				}, () => {
					this.pinInput && this.pinInput.onFocusPin();
				})
			}, 1000)
		})
	}

	authenFail() {
		this.props.errorCallback && this.props.errorCallback();
		setTimeout(() => {
			this.isMount && this.setState({
				animationAuthenByPin: 'shake',
				numberFailEnterPin: this.state.numberFailEnterPin + 1,
				error: ''
			}, () => {
				dataStorage.userPin.numberFailEnterPin = this.state.numberFailEnterPin;
				// Save to local
				const email = dataStorage.emailLogin ? dataStorage.emailLogin.toLowerCase() : '';
				getItemFromLocalStorage(
					email,
					null,
					null,
					() => {
						// Chưa có thì set setting mặc định
						let obj = {
							email,
							enableTouchID: false,
							numberFailEnterPin: this.state.numberFailEnterPin
						};
						logDevice('info', `NOT HAVE USER SETTING ON LOCAL - SET DEFAULT: ${JSON.stringify(obj)}`);
						saveItemInLocalStorage(email, obj, null, null, null)
					},
					(result) => {
						let obj = {
							email,
							enableTouchID: result.enableTouchID,
							numberFailEnterPin: this.state.numberFailEnterPin
						};
						saveItemInLocalStorage(email, obj, null, null, null);
						logDevice('info', `ALREADY HAVE USER SETTING ON LOCAL - ${JSON.stringify(result)}`)
					}
				);
				this.pinInput && this.pinInput.removeTimeOut();
				if (this.state.numberFailEnterPin >= 3) {
					this.showAlertAfterEnterPinFail()
				} else {
					setTimeout(() => {
						this.pinInput && this.pinInput.clearPin();
						this.isMount && this.setState({
							animationAuthenByPin: ''
						}, () => {
							this.pinInput && this.pinInput.onFocusPin();
						})
					}, 1000)
				}
			})
		}, 100)
	}

	checkNetworkAfterEnterPin(pin) {
		if (this.props.isConnected) {
			this.onPinComplete(pin)
		} else {
			this.authenFailWithNoInternetConnection();
		}
	}

	onNumpadPressed(numpad) {
		this.pinInput.onNumpadPressed(numpad)
	}

	renderPINNumpad() {
		return (
			<NumpadKeyboard
				onNumpadPressed={(numpad) => {
					this.onNumpadPressed(numpad);
				}}
				hasEmptyButton={this.props.hasEmptyButton}
				onBackButtonPressed={() => {
					this.onBackDropModalPress();
				}} />
		);
	}

	renderLogo = this.renderLogo.bind(this)
	renderLogo() {
		return <View style={{
			flex: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 2 : 1) : (height > 2000 ? 2 : 1),
			alignItems: 'center',
			justifyContent: 'center'
		}}>
			<Animated.View
				style={{ transform: [{ translateY: this.logoTranslateYAnim }] }}>
				{this.renderLogoImg()}
			</Animated.View>
		</View >
	}

	renderPinTitle = this.renderPinTitle.bind(this)
	renderPinTitle() {
		return <Animated.View style={{
			opacity: this.pinWrapperOpacityAnim,
			flex: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 1 : 0.5) : (height > 2000 ? 1 : 0.5),
			justifyContent: 'center',
			alignItems: 'center',
			top: 10,
			marginBottom: 20
		}}>
			<Text
				testID={`titlePin`}
				style={CommonStyle.pinVersion2.enterPinTitleText}>
				{`${I18n.t('enterPinTitle')}`}
			</Text>
		</Animated.View>
	}

	renderPin = this.renderPin.bind(this)
	renderPin() {
		return <Animated.View style={{
			opacity: this.pinWrapperOpacityAnim,
			flex: Platform.OS === 'ios' ? 4 : (height > 2000 ? 4 : 5),
			marginBottom: 48
		}}>
			<Pin
				marginTop={10}
				marginHorizontal={16}
				onRef={ref => this.pinInput = ref}
				onPinCompleted={this.checkNetworkAfterEnterPin}
			/>
			{
				this.state.error === ''
					? dataStorage.userPin.numberFailEnterPin > 0
						? <View style={styles.errorContainer.errorTextView}>
							<Text
								style={CommonStyle.pinVersion2.errorText}>
								{`${dataStorage.userPin.numberFailEnterPin || this.state.numberFailEnterPin} ${I18n.t('failedPin')} ${dataStorage.userPin.numberFailEnterPin > 1 ? I18n.t('attemps') : I18n.t('attemp')}`}
							</Text>
						</View>
						: <View style={styles.errorContainer.errorTextView}>
							<Text
								style={[CommonStyle.pinVersion2.errorText, { color: 'transparent' }]}>
								Hidden Text
					</Text>
						</View>
					: <View style={styles.errorContainer.errorTextView}>
						<Text style={CommonStyle.pinVersion2.errorText}>
							{`${I18n.t('noInternetConnectionWarning')}`}
						</Text>
					</View>
			}
			<View style={styles.errorContainer.errorTextView}>
				<Text
					onPress={this.props.onForgotPin}
					style={CommonStyle.pinVersion2.forgotPinText}>
					{`${I18n.t('forgotPinVersion2')}?`}
				</Text>
			</View>
			<View style={{
				bottom: Platform.OS === 'ios' ? (isIphoneXorAbove() ? 10 : 0) : (height > 2000 ? 10 : 0)
			}}>
				{this.renderPINNumpad()}
			</View>
		</Animated.View>
	}

	/**
	 * This function is actually 'renderPin' only, because both android and ios
	 * have been merged into 'renderPinIos'
	 */
	renderPinIos() {
		return (
			<AnimatableImageBackground
				animation={'fadeIn'}
				duration={300}
				source={pinBackground}
				blurRadius={2}
				resizeMode={'cover'}
				style={{
					height: '100%',
					width: '100%'
				}}>
				<Animatable.View
					animation={'slideInUp'}
					delay={500}
					duration={500}>
					<Animatable.View
						animation={this.state.animationAuthenByPin}
						style={{
							height: '100%',
							paddingTop: 30,
							justifyContent: 'space-around'
						}}>
						{this.renderLogo()}
						{this.renderPinTitle()}
						{this.renderPin()}
					</Animatable.View>
				</Animatable.View>
			</AnimatableImageBackground>
		);
	}

	/**
	 * This function has been deprecated due to merging UI of both android and ios
	 */
	renderPinAndroid() {
		const store = Controller.getGlobalState();
		const email = store.login && store.login.email ? store.login.email : dataStorage.emailLogin ? dataStorage.emailLogin : '';
		return (
			<Animatable.View
				animation={this.state.animationAuthenByPin}
				style={{
					backgroundColor: '#f1eff5',
					borderTopLeftRadius: 10,
					borderTopRightRadius: 10
				}}>
				<View
					style={{
						justifyContent: 'center',
						alignItems: 'center',
						marginTop: 21
					}}>
					<Text style={[CommonStyle.fontLargeNormal, {
						textAlign: 'center',
						color: CommonStyle.fontBlack
					}]}>
						{`${I18n.t('authenPinTitle')}`}
					</Text>
				</View>
				<Pin
					marginTop={20}
					marginHorizontal={16}
					onRef={ref => this.pinInput = ref}
					onPinCompleted={this.checkNetworkAfterEnterPin}
				/>
				{
					this.state.error === ''
						? dataStorage.userPin.numberFailEnterPin > 0
							? <View style={{
								marginHorizontal: 32,
								marginVertical: 16,
								justifyContent: 'center',
								alignItems: 'center'
							}}>
								<Text
									style={CommonStyle.textPin}>{`${dataStorage.userPin.numberFailEnterPin || this.state.numberFailEnterPin} ${I18n.t('failedPin')} ${dataStorage.userPin.numberFailEnterPin > 1 ? I18n.t('attemps') : I18n.t('attemp')}`}</Text>
							</View>
							: <View />
						: <View style={{
							marginHorizontal: 32,
							marginVertical: 16,
							justifyContent: 'center',
							alignItems: 'center'
						}}>
							<Text style={CommonStyle.textPin}>{`${I18n.t('noInternetConnectionWarning')}`}</Text>
						</View>
				}
				<View style={{
					marginHorizontal: 32,
					marginBottom: 16,
					marginTop: this.state.error === '' && !dataStorage.userPin.numberFailEnterPin ? 16 : 0
				}}>
					<Text style={[CommonStyle.textSubNormalNoColor, {
						flexDirection: 'row',
						textAlign: 'left',
						borderWidth: 1,
						borderColor: 'transparent'
					}]}>
						<Text>{!dataStorage.isSupportTouchID ? `${I18n.t('enterPin')}` : `${I18n.t('enterPinOr')} `}</Text>
						{
							!dataStorage.isSupportTouchID
								? null
								: !dataStorage.userPin.enableTouchID || dataStorage.isLockTouchID || this.props.usePin
									? <Text>{`${I18n.t('useTouchIDAndroid')}`}</Text>
									: <Text onPress={this.props.onChangeAuthenByFingerPrint}
										style={{ color: '#007aff' }}>{`${I18n.t('useTouchIDAndroid')}`}</Text>
						}
						<Text>{` ${I18n.t('confirmAccID')}: ${email}. `}</Text>
					</Text>
					<Text
						onPress={this.props.onForgotPin}
						style={{ color: '#007aff' }}>{`${I18n.t('forgotPin')}?`}</Text>
				</View>
			</Animatable.View>
		)
	}

	renderBackdrop() {
		return <TouchableWithoutFeedback onPress={this.onBackDropModalPress.bind(this)}>
			<View style={{ flex: 1, backgroundColor: 'transparent' }} />
		</TouchableWithoutFeedback>
	}

	render() {
		return (
			<React.Fragment>
				<View style={{ flex: 1, justifyContent: 'flex-end' }}>
					{this.renderPinIos()}
				</View>
				<PromptNew
					onRef={ref => this.signOutPrompt = ref}
					navigator={this.props.navigator}
				/>
			</React.Fragment>
		)
	}
}

const styles = {
	errorContainer: {
		errorTextView: {
			marginHorizontal: 32,
			marginVertical: 16,
			justifyContent: 'center',
			alignItems: 'center'
		}
	},
	numpadKeyboard: {
		container: {
			alignContent: 'center'
		},
		row: {
			justifyContent: 'center',
			flexDirection: 'row'
		}
	}
};

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

export default connect(mapStateToProps, mapDispatchToProps)(AuthenByPin);
