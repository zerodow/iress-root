import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Keyboard,
	PixelRatio,
	Platform,
	Text,
	TouchableOpacity,
	View,
	Animated
} from 'react-native';
import * as authSettingActions from '../auth_setting.actions';
import * as loginActions from '../../../login/login.actions';
import I18n from '../../../../modules/language/index';
import { logDevice, saveItemInLocalStorage } from '../../../../lib/base/functionUtil';
import { dataStorage } from '../../../../storage';
import CommonStyle from '~/theme/theme_controller'
import Pin from '../../../../component/pin/pin';
import * as Animatable from 'react-native-animatable';
import { Navigation } from 'react-native-navigation';
import Panel from '../../../../component/headerNavBar/index.js';
import NumpadKeyboard from '../../../../component/pin/numpad_keyboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../style/pinVersion2';

const { height, width } = Dimensions.get('window');

export class SetPinVerify extends Component {
	constructor(props) {
		super(props);
		Text.allowFontScaling = !(PixelRatio.getFontScale() > 1.4);
		this.saveUserPinSuccessCallback = this.saveUserPinSuccessCallback.bind(this);
		this.saveUserPinErrorCallback = this.saveUserPinErrorCallback.bind(this);
		this.showPopUpTokenExpire = this.showPopUpTokenExpire.bind(this);
		this.opacityWrapperAnim = new Animated.Value(1)
		this.state = {
			pinCode: '',
			type: this.props.type,
			canNext: false,
			error: '',
			previousPinCode: '',
			animationAuthenByPin: '',
			softBarHeight: 0
		};
		this.deviceModel = dataStorage.deviceModel;
	}

	componentDidMount() {
		return true
	}

	fadeInWrapperAnim = this.fadeInWrapperAnim.bind(this)
	fadeInWrapperAnim() {
		Animated.timing(
			this.opacityWrapperAnim,
			{
				toValue: 1,
				duration: 600
			}).start()
	}

	fadeOutWrapperAnim = this.fadeOutWrapperAnim.bind(this)
	fadeOutWrapperAnim() {
		Animated.timing(
			this.opacityWrapperAnim,
			{
				toValue: 0,
				duration: 600
			}).start()
	}

	showPopUpTokenExpire() {
		Navigation.showModal({
			screen: 'equix.PromptExpireToken',
			animated: true,
			animationType: 'fade',
			navigatorStyle: {
				navBarHidden: true,
				screenBackgroundColor: 'transparent',
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				backToSetPin: cb => {
					this.props.authSettingActions.setPinCancel();
					this.props.loginActions.logout();
				}
			}
		})
	}

	saveUserPinSuccessCallback(pin, obj) {
		// Set lai touch id trong redux
		dataStorage.userPin = obj;
		this.props.authSettingActions.setEnableTouchID(dataStorage.userPin.enableTouchID);
		const token = this.props.token;
		this.fadeOutWrapperAnim()
		setTimeout(() => {
			this.props.navigator.dismissModal({
				animated: false,
				animationType: 'none'
			})

			if (this.props.forgotPinCallback) {
				this.props.forgotPinCallback(pin, token);
			} else {
				const objParam = this.props.objParam || {};
				const showPopUp = this.showPopUpTokenExpire;
				logDevice('info', `SET PIN SUCCESS - PROPS TOKEN - ${token}`);
				Keyboard.dismiss();
				dataStorage.loginWithCustomToken && dataStorage.loginWithCustomToken(token, objParam, pin, showPopUp)
			}
		}, 800)
		return true
	}

	saveUserPinErrorCallback(error) {
		this.props.authSettingActions.setPinError();
		Alert.alert('Set new pin fail. Please try again');
		logDevice('info', `SET PIN FAIL: ${error}`);

		return true
	}

	_onPinCompleted(pinCode) {
		const key = this.props.objParam && this.props.objParam.email
			? this.props.objParam.email.toLowerCase()
			: (this.props.email ? this.props.email.toLowerCase() : dataStorage.emailLogin);
		if (key) {
			setTimeout(() => {
				const currentPinCode = this.props.previousPinCode;
				if (currentPinCode !== pinCode) {
					this.setState({
						error: I18n.t('pinNotMatch'),
						animationAuthenByPin: 'shake'
					}, () => {
						this.pinInput && this.pinInput.removeTimeOut();
						setTimeout(() => {
							this.pinInput && this.pinInput.clearPin();
							this.setState({
								error: '',
								animationAuthenByPin: ''
							}, () => {
								this.pinInput && this.pinInput.onFocusPin()
							})
						}, 1000)
					});
				} else {
					this.setState({
						error: '',
						pinCode,
						canNext: true
					}, () => {
						this.pinInput && this.pinInput.removeTimeOut();
						// isLoading : true
						this.props.authSettingActions.setPinRequest();
						const enableTouchID = dataStorage.userPin && dataStorage.userPin.enableTouchID !== undefined && dataStorage.userPin.enableTouchID !== null
							? dataStorage.userPin.enableTouchID
							: dataStorage.isSupportTouchID && !dataStorage.isNotEnrolledTouchID;
						const obj = {
							email: key,
							enableTouchID,
							numberFailEnterPin: 0
						};
						logDevice('info', `set pin ${JSON.stringify(obj)}`);
						saveItemInLocalStorage(key, obj, pinCode, this.saveUserPinSuccessCallback, this.saveUserPinErrorCallback)
					})
				}
			}, 100)
		}

		return true
	}

	onPressLeftButton() {
		// Text Cancel or Back - Back action need focus pin and show keyboard
		this.pinInput && this.pinInput.removeTimeOut();
		this.pinInput && this.pinInput.clearPin();
		this.props.authSettingActions.backToSetPin();
		this.props.navigator.pop();

		return true
	}

	onNumpadPressed(numpad) {
		this.pinInput.onNumpadPressed(numpad);
	}

	render() {
		/**
		 * @description Temporarily solution for different height issue
		 * between 'set_pin' and 'set_pin_verify' screens. The real positions
		 * of each component are nearly the same, but not exactly equal.
		 * @type {number}
		 */
		const paddingBottom = 0.1564 * height;
		const headerRightText = I18n.t('done');
		const descriptionText = I18n.t('verifyNewPin');
		return (
			<Animated.View style={{ flex: 1, opacity: this.opacityWrapperAnim }}>
				<View style={{
					backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor,
					paddingBottom: paddingBottom
				}}>
					<Panel
						titleStyle={{ width: 0.6 * width }}
						title={I18n.t(this.props.forgotPinCallback ? 'setPinTitle' : 'verifyNewPin')}
						style={{ marginLeft: 0, paddingTop: 16 }}
						renderLeftComp={() =>
							<View style={{ flex: 1 }}>
								<TouchableOpacity
									onPress={this.onPressLeftButton.bind(this)}
									style={styles.header.leftComponent.container}>
									<Ionicons
										testID={`cancelChangePin`}
										name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
										style={{
											color: CommonStyle.fontWhite
										}}
										size={Platform.OS === 'ios' ? 30 : 28}
									/>
								</TouchableOpacity>
							</View>
						}
						renderRightComp={() =>
							<Fragment>
								{
									this.props.authLoading
										? <View
											style={styles.header.rightComponent.container}>
											<ActivityIndicator
												style={{ width: 24, height: 24 }}
												color={CommonStyle.fontWhite} />
										</View>
										: <TouchableOpacity
											disabled={!this.state.canNext}
											style={styles.header.rightComponent.container}>
											<Text
												style={[styles.header.rightComponent.text, {
													opacity: this.state.canNext ? 1 : 0.54
												}]}>
												{headerRightText}
											</Text>
										</TouchableOpacity>
								}
							</Fragment>
						}
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
					<View style={styles.content.container}>
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
										onRef={ref => this.pinInput = ref}
										onPinCompleted={this._onPinCompleted.bind(this)}
										pinViewStyle={{
											borderTopColor: CommonStyle.fontBorderGray,
											borderBottomColor: CommonStyle.fontBorderGray
										}}
										pinTextStyle={{
											color: CommonStyle.fontWhite
										}}
									/>
								</View>
								<View style={styles.content.animatedView.pinInput.errorContainer}>
									{
										this.state.error !== ''
											? <Text style={{
												color: '#eb413c',
												fontSize: CommonStyle.font13,
												fontFamily: CommonStyle.fontPoppinsRegular
											}}>
												{this.state.error}
											</Text>
											: <Text style={{
												color: 'transparent',
												fontSize: CommonStyle.font13,
												fontFamily: CommonStyle.fontPoppinsRegular
											}}>
												Hidden text
											</Text>
									}
								</View>
							</View>
							<View style={[styles.content.animatedView.numpadContainer, { paddingBottom: 24 }]}>
								<NumpadKeyboard
									onNumpadPressed={(numpad) => {
										this.onNumpadPressed(numpad);
									}}
									hasEmptyButton={true} />
							</View>
						</Animatable.View>
					</View>
				</View>
			</Animated.View>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		authLoading: state.authSetting.isLoading
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loginActions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SetPinVerify);
