import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	ActivityIndicator, Keyboard, PixelRatio, Platform, Text, TouchableOpacity, View,
	Animated, Dimensions
} from 'react-native';
import * as authSettingActions from '../auth_setting.actions';
import * as loginActions from '../../../login/login.actions';
import I18n from '../../../../modules/language/index';
import CommonStyle from '~/theme/theme_controller'
import { dataStorage, func } from '../../../../storage';
import Pin from '../../../../component/pin/pin';
import * as Animatable from 'react-native-animatable';
import ScreenId from '../../../../constants/screen_id';
import NumpadKeyboard from '../../../../component/pin/numpad_keyboard';
import Panel from '../../../../component/headerNavBar/index.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../style/pinVersion2';

const { height, width } = Dimensions.get('window')

export class SetPin extends Component {
	constructor(props) {
		super(props);
		Text.allowFontScaling = !(PixelRatio.getFontScale() > 1.4);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.translateYWrapperAnim = new Animated.Value(height)
		this.opacityWrapperAnim = new Animated.Value(1)
		this.state = {
			pinCode: '',
			type: this.props.type,
			key: dataStorage.userInfo.email,
			uid: dataStorage.userInfo.uid,
			canNext: false,
			error: '',
			previousPinCode: '',
			animationAuthenByPin: '',
			softBarHeight: 0
		};
		this.deviceModel = dataStorage.deviceModel;
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

	onNavigatorEvent(event) {
		switch (event.id) {
			case 'willAppear':
				break;
			case 'didAppear':
				this.pinInput && this.pinInput.onFocusPin();
				break;
			case 'willDisappear':
				break;
			case 'didDisappear':
				break;
			default:
				break;
		}

		return true
	}

	componentDidMount() {
		func.setCurrentScreenId(ScreenId.SET_PIN)
		this.showContentAnim()
		return true
	}

	_onPinCompleted(pinCode) {
		setTimeout(() => {
			Keyboard.dismiss();
			this.setState({
				pinCode,
				canNext: true
			}, () => {
				this.pinInput && this.pinInput.removeTimeOut();
				this.props.navigator.push({
					screen: 'equix.SetPinVerify',
					animated: true,
					animationType: 'slide-horizontal',
					navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
					passProps: {
						backToLogin: this.onPressLeftButton,
						previousPinCode: this.state.pinCode,
						type: 'verify',
						token: this.props.token,
						forgotPinCallback: this.props.forgotPinCallback,
						email: this.props.email,
						objParam: this.props.objParam
					}
				})
			});
		}, 100);
		return true
	}

	onPressRightButton() {
		const pinLength = this.pinInput ? this.pinInput.getPin().length : 0;
		if (pinLength >= 6) {
			Keyboard.dismiss();
			this.props.navigator.push({
				screen: 'equix.SetPinVerify',
				animated: true,
				animationType: 'slide-horizontal',
				navigatorStyle: CommonStyle.navigatorSpecialNoHeader,
				passProps: {
					previousPinCode: this.state.pinCode,
					type: 'verify',
					token: this.props.token,
					forgotPinCallback: this.props.forgotPinCallback,
					email: this.props.email,
					objParam: this.props.objParam
				}
			})
		} else {
			this.setState({
				canNext: false,
				animationAuthenByPin: 'shake',
				error: 'Pin code must have 6 characters'
			});
			setTimeout(() => {
				this.setState({
					error: '',
					animationAuthenByPin: ''
				})
			}, 1000)
		}

		return true
	}

	onPressLeftButton() {
		// Text Cancel or Back - Back action need focus pin and show keyboard
		this.fadeOutWrapperAnim()
		setTimeout(() => {
			if (this.props.cancelAutoLoginFn) {
				this.props.cancelAutoLoginFn()
			} else {
				this.props.loginActions.logout();
			}
		}, 500)
		return true
	}

	onNumpadPressed(numpad) {
		this.pinInput.onNumpadPressed(numpad);
	}

	render() {
		const headerRightText = I18n.t('next');
		return (
			<Animated.View style={{
				opacity: this.opacityWrapperAnim,
				flex: 1,
				backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor,
				transform: [{ translateY: this.translateYWrapperAnim }]
			}}>
				<View style={{ backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor }}>
					<Panel
						titleStyle={{ width: 0.6 * width }}
						title={I18n.t('setPinTitle')}
						style={{ marginLeft: 0, paddingTop: 16 }}
						renderLeftComp={() =>
							<Fragment>
								<View />
								{
									!this.props.isShowCancel
										? <View style={{ flex: 1 }} />
										: <View style={{ flex: 1 }}>
											{
												this.props.isLoading
													? <View style={styles.header.leftComponent.container}>
														<ActivityIndicator
															style={{ width: 24, height: 24 }}
															color={CommonStyle.fontColor} />
													</View>
													: <TouchableOpacity
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
											}
										</View>
								}
							</Fragment>
						}
						renderRightComp={() =>
							<Fragment>
								{
									this.props.isLoading
										? <View
											style={styles.header.rightComponent.container}>
											<ActivityIndicator
												style={{ width: 24, height: 24 }}
												color={CommonStyle.fontColor} />
										</View>
										: <TouchableOpacity
											disabled={!this.state.canNext}
											style={styles.header.rightComponent.container}
											onPress={this.onPressRightButton.bind(this)}>
											<Text style={[styles.header.rightComponent.text, {
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
				</View>
				<View style={styles.content.container}>
					<View style={styles.content.description.container}>
						<Text
							style={styles.content.description.text}>
							{this.props.forgotPinCallback ? I18n.t('enterNewPin') : ''}
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
									this.state.type === 'new'
										? <Text style={{
											color: CommonStyle.fontWhite,
											fontFamily: CommonStyle.fontPoppinsRegular,
											fontSize: CommonStyle.fontSizeS,
											textAlign: 'left'
										}}>{this.props.forgotPinCallback ? '' : I18n.t('setPinFirstTime')}</Text>
										: <Text style={{
											color: 'transparent',
											fontFamily: CommonStyle.fontPoppinsRegular,
											fontSize: CommonStyle.fontSizeS,
											textAlign: 'left'
										}}>
											Hidden Text
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
			</Animated.View>
		)
	}
}

function mapStateToProps(state) {
	return {
		loginLoading: state.login.isLoading,
		isLoading: state.authSetting.isLoading,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loginActions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SetPin);
