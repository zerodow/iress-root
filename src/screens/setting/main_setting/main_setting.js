import React, { Component, PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	View,
	ScrollView,
	Dimensions,
	Animated,
	TouchableWithoutFeedback
} from 'react-native';
import NetworkWarning from '~/component/network_warning/network_warning';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';
import I18n from '~/modules/language/index';
import CommonStyle, {
	register,
	changeTheme,
	FIXED_THEME
} from '~/theme/theme_controller';
import Auth from '~/lib/base/auth';
import AuthenByPin from '~/component/authen_by_pin/authen_by_pin';
import * as Controller from '~/memory/controller';
import Header from '~/component/headerNavBar/index';
import Icon from '~/component/headerNavBar/icon';
// Component
import SettingMarketData from './setting_market_data';
import SettingNotification from './setting_notification';
import SettingSecurity from './setting_security';
import SettingHomeScreen from './setting_homescreen';
import SettingLanguage from './setting_language';
import SettingTheme from './setting_theme';
import SettingFakeStreaming from './setting_fake_streaming';
import SettingTextSize from './setting_textsize';
import SettingBiometric from './setting_biometric';
import FallHeader from '~/component/fall_header';
import ErrorSystemSetting from '~/screens/setting/main_setting/error_system_setting.js';
import ChangeRegion from '~/screens/setting/main_setting/change_region';
import SettingNotificationAlert from './setting_notification_alert';
import { dataStorage } from '~/storage';
const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window');

class Separate extends PureComponent {
	render() {
		return (
			<View
				style={{
					height: 1,
					backgroundColor: CommonStyle.fontColorBorderNew,
					marginLeft: 16
				}}
			/>
		);
	}
}

class MainSetting extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isForgotPinModalVisible: false
		};
		this.auth = new Auth(
			this.props.navigator,
			this.props.emailLogin,
			this.props.tokenLogin,
			this.showFormLogin
		);
		this.opacityLanguageAnim = new Animated.Value(1);
	}
	renderSeparate = this.renderSeparate.bind(this);
	renderSeparate() {
		return !Controller.getLoginStatus() ? null : <Separate />;
	}

	renderLeftComp = this.renderLeftComp.bind(this);
	renderLeftComp() {
		const content = (
			<View style={{ alignSelf: 'flex-start', left: -8 }}>
				<Icon
					name="ios-menu"
					onPress={this.openMenu}
					size={34}
					styles={{ paddingRight: 16 }}
				/>
			</View>
		);
		return <View style={{ width: 36 }}>{content}</View>;
	}
	componentDidMount() {
		console.info(dataStorage.menuSelected, 'STORE');
	}
	openMenu = () => {
		const { navigator } = this.props;
		navigator.toggleDrawer({
			side: 'left',
			animated: true
		});
	};

	renderHeader = this.renderHeader.bind(this);
	renderHeader() {
		const { navigator } = this.props;
		return (
			<Header
				leftIcon="menu"
				navigator={navigator}
				title={I18n.t('settings')}
				// renderLeftComp={this.renderLeftComp}
				containerStyle={{
					zIndex: 9999
				}}
				styleDefaultHeader={{
					paddingBottom: 0
				}}
				firstChildStyles={{ minHeight: 18 }}
				style={{ marginLeft: 0, paddingTop: 16, paddingBottom: 5 }}
			></Header>
		);
	}

	render() {
		const isConnected = this.props.isConnected;
		return (
			<View
				style={{
					height: '100%',
					width: WIDTH_DEVICE,
					backgroundColor: CommonStyle.backgroundColorNews
				}}
			>
				<FallHeader
					isNotBottomLine
					style={{ backgroundColor: CommonStyle.backgroundColorNews }}
					header={this.renderHeader()}
				>
					<TouchableWithoutFeedback onPress={this.dismissAllPopUp}>
						<View style={{ flex: 1 }}>
							<ScrollView
								onScroll={this.handleScroll}
								scrollEventThrottle={16}
								style={{
									backgroundColor: CommonStyle.bg
								}}
								keyboardShouldPersistTaps={'always'}
							>
								<SettingMarketData />
								<SettingNotificationAlert />

								{/* <SettingNotification
									getRefNewsNotification={
										this.props.getRefNewsNotification
									}
									getRefOrderNotification={
										this.props.getRefOrderNotification
									}
								/> */}
								<SettingSecurity
									getRefSecurity={this.props.getRefSecurity}
								/>
								{/* <SettingHomeScreen /> */}
								{/* <SettingLanguage
                                changeLanguageBottomTabBar={this.props.changeLanguageBottomTabBar}
                            /> */}
								{!FIXED_THEME && (
									<SettingTheme
										reRenderSetting={() => {
											this.forceUpdate();
											this.props.forceUpdate();
										}}
									/>
								)}
								{/* <SettingFakeStreaming /> */}
								{/* <ErrorSystemSetting /> */}
								{/* <SettingTextSize /> */}
								<SettingBiometric />
								<ChangeRegion />
								<View
									style={{
										height: CommonStyle.heightTabbar + 16,
										width: '100%'
									}}
									pointerEvents={
										this.opacityLanguageAnim._value === 0
											? 'box-none'
											: 'none'
									}
								/>
							</ScrollView>
						</View>
					</TouchableWithoutFeedback>
					{this.auth.showLoginForm(
						this.state.isForgotPinModalVisible,
						I18n.t('resetYourPin'),
						I18n.t('pleaseEnterYourPassword'),
						this.state.animationLogin,
						() => {
							this.isMount &&
								this.setState({
									animationLogin: ''
								});
						},
						() => {
							this.isMount &&
								this.setState({
									isForgotPinModalVisible: false
								});
						},
						() => {
							this.props.loginActions.authError();
							this.isMount &&
								this.setState({
									// animationLogin: 'shake',
									isError: true
								});
						},
						() => {
							this.props.loginActions.authSuccess();
							this.isMount &&
								this.setState({
									isForgotPinModalVisible: false,
									isError: false
								});
						},
						(accessToken) => {
							this.props.loginActions.authSuccess();
							this.isMount &&
								this.setState(
									{
										isForgotPinModalVisible: false,
										isError: false
									},
									() => {
										this.forgotPinSuccessCb(accessToken);
									}
								);
						},
						null,
						null,
						this.state.isError,
						true
					)}
					<AuthenByPin
						onForgotPin={this.onForgotPin}
						onChangeAuthenByFingerPrint={
							this.onChangeAuthenByFingerPrint
						}
						onRef={(ref) => (this.authenPin = ref)}
						onPinCompleted={this._onPinCompleted}
					/>
				</FallHeader>
			</View>
		);
	}
}

function mapStateToProps(state) {
	return {
		setting: state.setting,
		tokenLogin: state.login.token,
		emailLogin: state.login.email,
		isConnected: state.app.isConnected
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(settingActions, dispatch),
		loginActions: bindActionCreators(loginActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(MainSetting);
