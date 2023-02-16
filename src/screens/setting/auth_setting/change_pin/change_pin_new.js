import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ActivityIndicator, Dimensions, Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as authSettingActions from '../auth_setting.actions';
import * as loginActions from '../../../login/login.actions';
import I18n from '../../../../modules/language/index';
import CommonStyle from '~/theme/theme_controller'
import { dataStorage } from '../../../../storage';
import Pin from '../../../../component/pin/pin';
import * as Animatable from 'react-native-animatable';
import PromptNew from '../../../../component/new_prompt/prompt_new';
import NumpadKeyboard from '../../../../component/pin/numpad_keyboard';
import Panel from '../../../../component/headerNavBar/index.js';
import { isIphoneXorAbove } from '../../../../lib/base/functionUtil';
import styles from '../style/pinVersion2';

const { height } = Dimensions.get('window');

class ChangePinNew extends Component {
	constructor(props) {
		super(props);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.deviceModel = dataStorage.deviceModel;
		this.showAlertAfterEnterPinFail = this.showAlertAfterEnterPinFail.bind(this);
		this.state = {
			pinCode: '',
			type: this.props.type,
			canNext: false,
			error: '',
			key: dataStorage.userInfo.email,
			uid: dataStorage.userInfo.uid,
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

	showAlertAfterEnterPinFail() {
		this.signOutPrompt && this.signOutPrompt.showModal();
	}

	onChangeBeforeComplete() {
		// this.setState({
		//     canNext: false,
		//     error: 'Pin code must have 6 characters'
		// })
	}

	_onPinCompleted(pinCode) {
		setTimeout(() => {
			this.setState({
				pinCode,
				canNext: true
			}, () => {
				this.pinInput.removeTimeOut();
				this.setState({
					type: 'verify',
					canNext: true,
					error: '',
					isBack: false
				}, () => {
					this.props.navigator.push({
						screen: 'equix.ChangePinVerify',
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
							type: 'verify',
							previousNewPin: this.state.pinCode,
							authSettingNavigator: this.props.authSettingNavigator,
							changePinNavigator: this.props.changePinNavigator,
							token: this.props.token
						}
					})
				})
			});
		}, 100)
	}

	onPressRightButton() {
		let pinLength = this.pinInput ? this.pinInput.getPin().length : 0;
		if (pinLength >= 6) {
			this.props.navigator.push({
				screen: 'equix.ChangePinVerify',
				animated: true,
				animationType: 'slide-horizontal',
				navigatorStyle: {
					statusBarColor: CommonStyle.statusBarBgColor,
					statusBarTextColorScheme: 'light',
					navBarHidden: true,
					navBarHideOnScroll: false,
					navBarTextFontSize: 18,
					drawUnderNavBar: true,
					navBarNoBorder: true
				},
				passProps: {
					type: 'verify',
					previousNewPin: this.state.pinCode,
					authSettingNavigator: this.props.authSettingNavigator,
					changePinNavigator: this.props.changePinNavigator,
					token: this.props.token
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
	}

	onPressLeftButton() {
		// this.props.authSettingNavigator && this.props.authSettingNavigator.popToRoot();
		setTimeout(() => {
			this.pinInput.clearPin();
			this.props.navigator && this.props.navigator.pop();
		}, 200)
	}

	onNumpadPressed(numpad) {
		this.pinInput.onNumpadPressed(numpad);
	}

	render() {
		const descriptionText = I18n.t('enterNewPin');
		const headerRightText = I18n.t('next');
		return (
			<Fragment>
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
													numberOfLines={1}
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
								<Text testID={`failPin`} style={{
									color: 'transparent',
									fontSize: CommonStyle.font13,
									fontFamily: CommonStyle.fontPoppinsRegular
								}}>
									Hidden text
								</Text>
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
					navigator={this.props.navigator} />
			</Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePinNew);
