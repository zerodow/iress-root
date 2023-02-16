import React, { Component } from 'react';
import {
	Dimensions, Image, ImageBackground, Keyboard, Platform, Text, View,
	Animated,
	ActivityIndicator,
	BackHandler
} from 'react-native';
import * as Animatable from 'react-native-animatable'
import Pin from '../pin/pin'
import { dataStorage, func } from '../../storage'
import Modal from 'react-native-modal'
import CommonStyle from '~/theme/theme_controller'
import PromptNew from '../../component/new_prompt/prompt_new';
import CONFIG from '~/config'
import {
	getItemFromLocalStorage,
	isIphoneXorAbove,
	logDevice,
	saveItemInLocalStorage
} from '../../lib/base/functionUtil'
import I18n from '../../modules/language/'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as authSettingActions from '../../screens/setting/auth_setting/auth_setting.actions'
import * as Controller from '../../memory/controller'
import * as Business from '../../business';
import pinBackground from '../../img/background_mobile/pinVersion2Background.png'
import background from '~/img/background_mobile/ios82.png'
import backgroundAndroid from '~/img/background_mobile/android.png'
import logo from '../../img/background_mobile/logo.png'
import NumpadKeyboard from '../pin/numpad_keyboard';
import { Navigation } from 'react-native-navigation';
import ENUM from '~/enum'

const { ENVIRONMENT } = ENUM
const { height, width: widthDevice } = Dimensions.get('window');

class AuthenByPin extends Component {
	constructor(props) {
		super(props);
		this.keyboardDidShowListener = null;
		this.keyboardDidHideListener = null;
		this.deviceModel = dataStorage.deviceModel;
		this.isMount = false;
		this.contentTranslateYAnim = new Animated.Value(height);
		this.logoTranslateYAnim = new Animated.Value(0);
		this.pinWrapperOpacityAnim = new Animated.Value(1);
		this.opacityIconLoading = new Animated.Value(0);
		this.state = {
			isPinCodeModalVisible: false,
			animationAuthenByPin: '',
			numberFailEnterPin: dataStorage.userPin.numberFailEnterPin || 0,
			error: '',
			animatedPinModalDelay: 0,
			animatedPinContent: {
				animation: 'slideInUp',
				delay: 500,
				duration: 500
			}
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
	onBackPress = this.onBackPress.bind(this);
	onBackPress() {
		try {
			if (CONFIG.environment === ENVIRONMENT.IRESS_DEV2) {
				return false;
			} else {
				return true
			}
		} catch (error) {
			console.log('back android error', error);
		}
	}
	componentDidMount() {
		// REF
		this.isMount = true;
		this.props.onRef && this.props.onRef(this);
		BackHandler.addEventListener('hardwareBackPress', this.onBackPress.bind(this));
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
	}

	componentWillUnmount() {
		// UNREF
		this.isMount = false;
		this.props.onRef && this.props.onRef(null);
		BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
		this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
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
		]).start(() => {
			this.opacityIconLoading && this.opacityIconLoading.setValue(1)
		})
	}

	_keyboardDidShow() {
		console.log('keyboard did show');
	}

	_keyboardDidHide() {
		// this.isMount && this.setState({ isShowKeyboard: false })
		// console.log('keyboard did hide');
		// Keyboard.dismiss();
		// if (Platform.OS === 'android' && this.state.isPinCodeModalVisible) {
		//   this.isMount && this.setState({
		//     isPinCodeModalVisible: false
		//   });
		// }
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
		dataStorage.onAuthenticating = false;
		this.isMount && this.setState({
			isPinCodeModalVisible: false
		})
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

	authenSuccess(accessToken, successCallback, params) {
		const email = dataStorage.emailLogin ? dataStorage.emailLogin.toLowerCase() : '';
		getItemFromLocalStorage(
			email,
			null,
			null,
			() => {
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
			},
			(result) => {
				let obj = {
					email,
					enableTouchID: result.enableTouchID,
					numberFailEnterPin: 0
				};
				dataStorage.userPin = { ...obj };
				saveItemInLocalStorage(email, obj, null, null, null);
				logDevice('info', `ALREADY HAVE USER SETTING ON LOCAL - ${JSON.stringify(result)}`)
			}
		);

		// Animation and switch screen
		Keyboard.dismiss();
		dataStorage.onAuthenticating = false;
		this.isMount && this.setState({
			numberFailEnterPin: 0,
			error: ''
		}, () => {
			// Run animation
			this.snapLogoAndFadeOutPinWrapper()
			dataStorage.userPin.numberFailEnterPin = 0;
			this.pinInput && this.pinInput.removeTimeOut();

			this.successCallbackSafe = () => {
				if (!successCallback) return;
				if (accessToken) {
					successCallback(params, accessToken)
				} else {
					if (params.length > 0) {
						successCallback(...params)
					} else {
						successCallback()
					}
				}
			}
			console.log('DCM authen by pin')
			/**
			 * Sau khi pass input Pin then hide screen signin and wait get api data. Tuc la ko can tat man hinh pin ma hien thi loading cho den khi start 1 man hinh moi
			 * Signin va autoLogin
			 */
			if (dataStorage.handleHideOrShowSignIn || dataStorage.handleHideOrShowAutoLogin) {
				dataStorage.handleHideOrShowSignIn && dataStorage.handleHideOrShowSignIn(true)
				dataStorage.handleHideOrShowAutoLogin && dataStorage.handleHideOrShowAutoLogin(true)
				dataStorage.handleHideOrShowSignIn = null
				dataStorage.handleHideOrShowAutoLogin = null
				this.successCallbackSafe()
			} else {
				// Case authen tu watch list ko hieu sao neu thuc hien callback song song voi setState hide pin thi man hinh new order lai bi mat nen phai dat vao trong onHide
				this.setState({
					isPinCodeModalVisible: false
				})
			}
			/**
			 * Bh khong can an modal pin nua. ma tu modal pin se sang man hinh home screen luon
			 */
			if (!(params && params.hasOwnProperty('isSetLoggedIn') && params.isSetLoggedIn === false)) {
				func.setLoginConfig(true)
			}
		})
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
						})
					}, 1000)
				}
			})
		}, 100)
	}

	checkNetworkAfterEnterPin(pin) {
		if (this.props.isConnected) {
			this.props.onPinCompleted && this.props.onPinCompleted(pin)
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

	renderLogo() {
		return <View
			style={{
				flex: Platform.OS === 'ios'
					? (isIphoneXorAbove() ? 2 : 1)
					: height > 2000
						? 2
						: 1,
				alignItems: 'center',
				justifyContent: 'center'
			}}>
			<Animated.View
				style={{ transform: [{ translateY: this.logoTranslateYAnim }] }}>
				{this.renderLogoImg()}
			</Animated.View>
			<Animated.View style={{
				width: '100%',
				alignItems: 'center',
				transform: [{
					translateY: this.logoTranslateYAnim
				}, {
					translateY: 16
				}],
				opacity: this.opacityIconLoading
			}} >
				<ActivityIndicator />
			</Animated.View>
		</View>
	}

	renderPinTitle() {
		return <Animated.View
			style={{
				opacity: this.pinWrapperOpacityAnim,
				flex: Platform.OS === 'ios'
					? isIphoneXorAbove()
						? 1
						: 0.5
					: height > 2000
						? 1
						: 0.5,
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
		return <Animated.View
			style={{
				opacity: this.pinWrapperOpacityAnim,
				flex: Platform.OS === 'ios'
					? 4
					: height > 2000
						? 4
						: 5,
				marginBottom: 48
			}}>
			<Pin
				marginTop={10}
				marginHorizontal={16}
				onRef={ref => this.pinInput = ref}
				onPinCompleted={this.checkNetworkAfterEnterPin} />
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
				bottom: Platform.OS === 'ios'
					? isIphoneXorAbove()
						? 10
						: 0
					: height > 2000
						? 10
						: 0
			}}>
				{this.renderPINNumpad()}
			</View>
		</Animated.View>
	}

	onModalShow = this.onModalShow.bind(this)
	onModalShow() {
		Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarColor })
	}

	onModalHide = this.onModalHide.bind(this)
	onModalHide() {
		if (this.successCallbackSafe) {
			setTimeout(() => {
				if (!dataStorage.handleHideOrShowSignIn || !dataStorage.handleHideOrShowAutoLogin) {
					// New co bien nay tuc la minh dang authen tu autoLogin or signin
					this.successCallbackSafe()
				}
				this.successCallbackSafe = undefined
			}, 100);
		}

		Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
		this.resetAnimation()
	}

	resetAnimation = this.resetAnimation.bind(this)
	resetAnimation() {
		this.logoTranslateYAnim.setValue(0)
		this.opacityIconLoading.setValue(0)
		this.pinWrapperOpacityAnim.setValue(1)
	}

	render() {
		const realHeight = Controller.getRealWindowHeight();
		const deviceHeight = Platform.OS === 'ios'
			? height
			: realHeight;
		const opacityLogoLoading = this.pinWrapperOpacityAnim.interpolate({
			inputRange: [0, 0.1, 1],
			outputRange: [1, 0, 0]
		})
		return (
			<View>
				<PromptNew
					onRef={ref => this.signOutPrompt = ref}
					navigator={this.props.navigator}
				/>
				<Modal
					onModalShow={this.onModalShow}
					onModalHide={this.onModalHide}
					onRequestClose={() => console.log('pin modal back press')}
					onBackdropPress={this.onBackDropModalPress.bind(this)}
					backdropOpacity={0}
					animationIn={'fadeIn'}
					animationInTiming={1000}
					animationOut={'fadeOut'}
					animationOuTiming={1000}
					delay={this.state.animatedPinModalDelay}
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
					}}>
					<Image source={Platform.OS === 'ios' ? background : backgroundAndroid} style={{ position: 'absolute', width: widthDevice, height }} resizeMode={Platform.OS === 'ios' ? 'cover' : 'stretch'} />
					<Animatable.View
						animation={this.state.animatedPinContent.animation}
						delay={this.state.animatedPinContent.delay}
						duration={this.state.animatedPinContent.duration}>
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
				</Modal>
			</View>
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
