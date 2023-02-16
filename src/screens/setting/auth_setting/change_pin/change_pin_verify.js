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
import { isIphoneXorAbove, saveItemInLocalStorage, setNewPinToken } from '../../../../lib/base/functionUtil';
import { dataStorage, func } from '../../../../storage';
import Pin from '../../../../component/pin/pin';
import * as Animatable from 'react-native-animatable';
import ScreenId from '../../../../constants/screen_id';
import * as Controller from '../../../../memory/controller';
import NumpadKeyboard from '../../../../component/pin/numpad_keyboard';
import Panel from '../../../../component/headerNavBar/index.js';
import styles from '../style/pinVersion2';

const { height } = Dimensions.get('window');

class ChangePinVerify extends Component {
	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.changeUserPinSuccessCallback = this.changeUserPinSuccessCallback.bind(this);
		this.changeUserPinErrorCallback = this.changeUserPinErrorCallback.bind(this);
		this.setNewPinSuccessCallback = this.setNewPinSuccessCallback.bind(this);
		this.setNewPinErrorCallback = this.setNewPinErrorCallback.bind(this);
		this.deviceModel = dataStorage.deviceModel;
		this.opacityWrapperAnim = new Animated.Value(1)
		this.state = {
			pinCode: '',
			type: this.props.type,
			canNext: false,
			error: '',
			key: Controller.getUserLoginId(),
			uid: Controller.getUserId(),
			localPin: dataStorage.userPin.pin,
			previousOldPin: '',
			previousNewPin: '',
			isBack: false,
			animationAuthenByPin: '',
			numberFailChangePin: dataStorage.userPin.numberFailEnterPin || 0
		}
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

	changeUserPinSuccessCallback(originalPin, obj) {
		this.fadeOutWrapperAnim()
		dataStorage.userPin = obj;
		setTimeout(() => {
			func.setCurrentScreenId(ScreenId.SETTING)
			this.props.navigator && this.props.navigator.dismissModal({
				animation: true,
				animationType: 'none'
			});
			this.props.actions.changePinSuccess();
		}, 500)
	}

	changeUserPinErrorCallback() {
		this.props.actions.changePinError();
		alert('change pin fail')
	}

	onChangeBeforeComplete() {
	}

	setNewPinSuccessCallback() {
		const email = dataStorage.emailLogin.toLowerCase() ||
			dataStorage.userPin.email.toLowerCase() ||
			Controller.getUserLoginId().toLowerCase();
		let obj = {
			email,
			enableTouchID: dataStorage.userPin.enableTouchID,
			numberFailEnterPin: 0
		};
		saveItemInLocalStorage(email, obj, null, this.changeUserPinSuccessCallback, this.changeUserPinErrorCallback)
	}

	setNewPinErrorCallback(err) {
		console.log('set pin fail', err)
	}

	_onPinCompleted(pinCode) {
		const token = this.props.token;
		setTimeout(() => {
			let currentPinCode = this.props.previousNewPin;
			if (currentPinCode !== pinCode) {
				this.setState({
					error: 'PIN did not match. Try again',
					animationAuthenByPin: 'shake'
				}, () => {
					this.pinInput.removeTimeOut();
					setTimeout(() => {
						this.pinInput.clearPin();
						this.setState({
							animationAuthenByPin: ''
						}, () => {
							this.pinInput.onFocusPin()
						})
					}, 1000)
				});
			} else {
				this.setState({
					error: '',
					pinCode,
					canNext: true
				}, () => {
					dataStorage.userPin.numberFailEnterPin = this.state.numberFailChangePin;
					this.pinInput.removeTimeOut();
					this.props.actions.changePinRequest();
					setNewPinToken(pinCode, token, this.setNewPinSuccessCallback, this.setNewPinErrorCallback)
				})
			}
		}, 100)
	}

	onPressRightButton() {
	}

	onPressLeftButton() {
		this.pinInput && this.pinInput.clearPin();
		this.props.navigator.pop();
	}

	onNumpadPressed(numpad) {
		this.pinInput.onNumpadPressed(numpad);
	}

	render() {
		const descriptionText = I18n.t('verifyNewPin');
		const headerRightText = I18n.t('done');
		return (
			<Animated.View style={{ flex: 1, opacity: this.opacityWrapperAnim }}>
				<View style={{ backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor }}>
					<Panel
						title={I18n.t('changePin')}
						style={{ marginLeft: 0, paddingTop: 16 }}
						renderLeftComp={() =>
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
											: <TouchableOpacity
												disabled={!this.state.canNext}
												style={styles.header.rightComponent.container}
												onPress={this.onPressRightButton.bind(this)}>
												<Text
													testID={`nextVerifyPin`}
													style={[styles.header.rightComponent.text, {
														opacity: this.state.canNext ? 1 : 0.54
													}]}>
													{headerRightText}
												</Text>
											</TouchableOpacity>
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
					style={styles.content.container}>
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
						<View style={styles.content.animatedView.numpadContainer}>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePinVerify);
