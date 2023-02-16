import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	ActivityIndicator, Dimensions, Keyboard, Platform, Text,
	TouchableOpacity, View, Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as authSettingActions from '../auth_setting.actions';
import * as loginActions from '../../../login/login.actions';
import I18n from '../../../../modules/language/index';
import CommonStyle from '~/theme/theme_controller'
import { authPin, saveItemInLocalStorage, isIphoneXorAbove } from '../../../../lib/base/functionUtil';
import { dataStorage, func } from '../../../../storage';
import Pin from '../../../../component/pin/pin';
import * as Animatable from 'react-native-animatable';
import PromptNew from '../../../../component/new_prompt/prompt_new'
import ScreenId from '../../../../constants/screen_id';
import * as Controller from '../../../../memory/controller'
import NumpadKeyboard from '../../../../component/pin/numpad_keyboard';
import Panel from '../../../../component/headerNavBar/index.js';
import styles from '../style/pinVersion2';
const { width, height } = Dimensions.get('window')

class ChangePin extends Component {
	constructor(props) {
		super(props);
		this.deviceModel = dataStorage.deviceModel;
		this.showAlertAfterEnterPinFail = this.showAlertAfterEnterPinFail.bind(this);
		this.authPinSuccessCallback = this.authPinSuccessCallback.bind(this);
		this.errPinSuccessCallback = this.errPinSuccessCallback.bind(this);
		this.translateYWrapperAnim = new Animated.Value(height)
		this.opacityWrapperAnim = new Animated.Value(1)
		this.state = {
			pinCode: '',
			type: this.props.type,
			canNext: false,
			error: '',
			key: dataStorage.userInfo.email,
			uid: dataStorage.userInfo.uid,
			localPin: dataStorage.pin,
			previousOldPin: '',
			previousNewPin: '',
			isBack: false,
			animationAuthenByPin: '',
			numberFailChangePin: dataStorage.userPin.numberFailEnterPin || 0
		}
	}

	componentDidMount() {
		this.pinInput && this.pinInput.focusPinInput && this.pinInput.focusPinInput();
		this.showContentAnim()
	}

	showContentAnim = this.showContentAnim.bind(this)
	showContentAnim() {
		Animated.timing(
			this.translateYWrapperAnim,
			{
				toValue: 0,
				duration: 400
			}).start()
	}

	hideContentAnim = this.hideContentAnim.bind(this)
	hideContentAnim() {
		Animated.timing(
			this.translateYWrapperAnim,
			{
				toValue: height,
				duration: 500
			}).start()
	}

	fadeInWrapperAnim = this.fadeInWrapperAnim.bind(this)
	fadeInWrapperAnim() {
		Animated.timing(
			this.opacityWrapperAnim,
			{
				toValue: 1,
				duration: 500
			}).start()
	}

	fadeOutWrapperAnim = this.fadeOutWrapperAnim.bind(this)
	fadeOutWrapperAnim() {
		Animated.timing(
			this.opacityWrapperAnim,
			{
				toValue: 0,
				duration: 500
			}).start()
	}

	showAlertAfterEnterPinFail() {
		this.signOutPrompt && this.signOutPrompt.showModal();
	}

	onChangeBeforeComplete() {
	}

	authPinSuccessCallback(token) {
		this.setState({
			canNext: true,
			error: ''
		}, () => {
			const email = Controller.getUserLoginId().toLowerCase() || dataStorage.emailLogin.toLowerCase();
			let obj = {
				email,
				enableTouchID: dataStorage.userPin.enableTouchID,
				numberFailEnterPin: 0
			};
			saveItemInLocalStorage(email, obj, null, null, null);
			this.pinInput.removeTimeOut();
			this.pinInput.clearPin();
			this.setState({
				type: 'new',
				error: '',
				canNext: false,
				numberFailChangePin: 0
			}, () => {
				// xac thuc dung pin -> reset number fail enter pin
				dataStorage.userPin.numberFailEnterPin = this.state.numberFailChangePin;
				this.props.navigator.push({
					screen: 'equix.ChangePinNew',
					animated: true,
					animationType: 'slide-horizontal',
					navigatorStyle: {
						statusBarColor: CommonStyle.fontDark2,
						statusBarTextColorScheme: 'light',
						navBarHidden: true,
						navBarHideOnScroll: false,
						navBarTextFontSize: 18,
						drawUnderNavBar: true,
						navBarNoBorder: true
					},
					passProps: {
						authSettingNavigator: this.props.authSettingNavigator,
						token
					}
				})
			})
		})
	}

	errPinSuccessCallback() {
		this.setState({
			canNext: false,
			error: 'Pin not correct',
			animationAuthenByPin: 'shake',
			numberFailChangePin: this.state.numberFailChangePin + 1
		}, () => {
			const email = Controller.getUserLoginId().toLowerCase() || dataStorage.emailLogin.toLowerCase();
			dataStorage.userPin.numberFailEnterPin = this.state.numberFailChangePin;
			let obj = {
				email,
				enableTouchID: dataStorage.userPin.enableTouchID,
				numberFailEnterPin: this.state.numberFailChangePin
			};
			saveItemInLocalStorage(email, obj, null, null, null);
			this.pinInput.removeTimeOut();
			if (this.state.numberFailChangePin >= 3) {
				this.showAlertAfterEnterPinFail()
			} else {
				setTimeout(() => {
					this.pinInput.clearPin();
					this.setState({
						error: '',
						animationAuthenByPin: ''
					}, () => {
						this.pinInput.onFocusPin()
					})
				}, 1000)
			}
		});
	}

	_onPinCompleted(pinCode) {
		// de 1s de hien thi pin truoc khi chuyen thanh *
		setTimeout(() => {
			const currentPinCode = this.pinInput.getPin();
			authPin(currentPinCode, this.authPinSuccessCallback, this.errPinSuccessCallback)
		}, 100)
	}

	onPressRightButton() {
	}

	onPressLeftButton() {
		func.setCurrentScreenId(ScreenId.SETTING)
		this.fadeOutWrapperAnim()
		setTimeout(() => {
			this.props.navigator && this.props.navigator.dismissModal({
				animation: true,
				animationType: 'none'
			});
		}, 500)
	}

	onNumpadPressed(numpad) {
		this.pinInput.onNumpadPressed(numpad);
	}

	render() {
		const descriptionText = I18n.t('enterOldPin');
		return (
			<Animated.View style={{
				opacity: this.opacityWrapperAnim,
				flex: 1,
				backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor,
				transform: [{ translateY: this.translateYWrapperAnim }]
			}}>
				<View style={{ backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor }}>
					<Panel
						title={I18n.t('changePin')}
						style={{ marginLeft: 0, paddingTop: 16 }}
						renderLeftComp={() =>
							<TouchableOpacity
								onPress={this.onPressLeftButton.bind(this)}
								style={styles.header.leftComponent.container}>
								<Ionicons
									testID={`backChangePin`}
									name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
									style={{
										color: CommonStyle.fontWhite
									}}
									size={Platform.OS === 'ios' ? 30 : 28}
								/>
							</TouchableOpacity>
						}
						renderRightComp={() => {
							return (
								<Fragment>
									{
										this.props.authLoading
											? <View style={styles.header.rightComponent.container}>
												<ActivityIndicator
													style={{ width: 24, height: 24 }}
													color={CommonStyle.fontWhite} />
											</View>
											: null
									}
								</Fragment>
							)
						}}
						rootStyles={styles.header.rootStyles}
						firstChildStyles={styles.header.firstChildStyles}
						rightStyles={styles.header.rightStyles}>
						<View />
						<View>
							<Text
								style={{
									color: 'transparent',
									fontSize: CommonStyle.fontTiny
								}}>
								Hidden text
							</Text>
						</View>
					</Panel>
				</View>
				<View
					style={[styles.content.container]}>
					<View style={styles.content.description.container}>
						<Text style={styles.content.description.text}>
							{descriptionText}
						</Text>
					</View>
					<Animatable.View
						animation={this.state.animationAuthenByPin}
						style={styles.content.animatedView.container}>
						<View style={styles.content.animatedView.pinInput.container}>
							<View style={styles.content.animatedView.pinInput.pinBoxContainer}>
								<Pin
									marginTop={0}
									marginHorizontal={32}
									onChangeBeforeComplete={this.onChangeBeforeComplete.bind(this)}
									onRef={ref => this.pinInput = ref}
									onPinCompleted={this._onPinCompleted.bind(this)}
									pinViewStyle={{
										borderTopColor: CommonStyle.fontBorderGray,
										borderBottomColor: CommonStyle.fontBorderGray
									}}
									pinTextStyle={{
										color: CommonStyle.fontColor
									}} />
							</View>
							<View style={styles.content.animatedView.pinInput.errorContainer}>
								{
									this.state.numberFailChangePin > 0
										? <Text testID={`failPin`} style={{
											color: '#eb413c',
											fontSize: CommonStyle.font13,
											fontFamily: CommonStyle.fontPoppinsRegular
										}}>
											{`${this.state.numberFailChangePin} ${I18n.t('failedPin', { locale: this.props.setting.lang })} ${this.state.numberFailChangePin === 1 ? I18n.t('attemp', { locale: this.props.setting.lang }) : I18n.t('attemps', { locale: this.props.setting.lang })}`}
										</Text>
										: <Text testID={`failPin`} style={{
											color: 'transparent',
											fontSize: CommonStyle.font13,
											fontFamily: CommonStyle.fontPoppinsRegular
										}}>
											Hidden text
										</Text>
								}
							</View>
						</View>
						<View style={styles.content.animatedView.numpadContainer}>
							<NumpadKeyboard
								onNumpadPressed={(numpad) => {
									this.onNumpadPressed(numpad);
								}}
								hasEmptyButton={true} />
						</View>
					</Animatable.View>
				</View>
				<PromptNew
					onRef={ref => this.signOutPrompt = ref}
					navigator={this.props.navigator}
				/>
			</Animated.View>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		authLoading: state.authSetting.isLoading,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(authSettingActions, dispatch),
		loginActions: bindActionCreators(loginActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePin);
