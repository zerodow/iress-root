import React, { Component } from 'react';
import {
	View,
	Text,
	Platform,
	Dimensions,
	TouchableOpacity,
	AppState,
	Alert,
	Animated,
	PixelRatio,
	Keyboard,
	InteractionManager,
	Image,
	Linking,
	ActivityIndicator,
	ScrollView,
	KeyboardAvoidingView,
	TextInput,
	TouchableWithoutFeedback,
	StatusBar
} from 'react-native';
import {
	getPriceSource,
	logDevice,
	checkPropsStateShouldUpdate,
	logAndReport,
	removeItemFromLocalStorage,
	offTouchIDSetting,
	pinComplete,
	setDicReAuthen,
	declareAnimation,
	declareSequenceAnimation,
	declareParallelAnimation
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import { dataStorage, func } from '../../storage';
import NetworkWarning from '../../component/network_warning/network_warning';
import userType from '../../constants/user_type';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin';
import TouchAlert from '../setting/auth_setting/TouchAlert';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import styles from './style/home_page';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import Auth from '../../lib/base/auth';
import background from '../../img/background_mobile/ios82.png';
import backgroundAndroid from '../../img/background_mobile/android.png';
// import logo from '../../img/background_mobile/logo.png';
import ScreenId from '../../constants/screen_id';
// import SignIn from './signin'
// import Register from './register'
import SignIn from './signin.2';
import Register from './register.2';
import Connecting from './connecting';
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import ForgotParent from './forgot_parent';
import ResetPassword from './resetPassword';
import XComponent from '../../component/xComponent/xComponent';
import ENUM from '../../enum';
import * as Util from '../../util';
import * as Controller from '~/memory/controller';
import ExtraDimensions from 'react-native-extra-dimensions-android';
// Business
import * as AuthBusiness from '../../channel/auth_business';

// Emitter
import * as Emitter from '@lib/vietnam-emitter';
import ReAnimated, { Easing } from 'react-native-reanimated'
const {
	Value,
	timing
} = ReAnimated
let { height, width } = Dimensions.get('window');
let realHeight = height;
try {
	realHeight =
		Platform.OS === 'ios'
			? height
			: ExtraDimensions.get('REAL_WINDOW_HEIGHT');
} catch (error) { }
const topHeight = height * 0.45;
const midHeight = height * 0.15;
const bottomHeight = height * 0.45;
const bottomHeightNoneDescription = height * 0.4;
const WELCOME_MARGIN_TOP_INIT = (bottomHeightNoneDescription + 64) / 2;
const WELCOME_MARGIN_RIGHT_INIT = 80;
const AUSTRALIAN_WIDTH = 324;
const WELCOME_WIDTH = 242;
const DEFAULT_KEYBOARD_HEIGHT_ANIMATION = 240;

export class HomePage extends XComponent {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.bindAllFunction = this.bindAllFunction.bind(this);
		this.bindAllFunction();
		this.init();
		this.setStatusBarMode();
	}
	init() {
		Text.allowFontScaling = !(PixelRatio.getFontScale() > 1.4);
		this.currentDescription = 'welcome';
		this.animInterval = null;
		this.anim = null;
		this.isMount = false;
		this.isDisableKeyboardAnimation = false;
		this.slideAnimationTimeOut = null;
		this.emailFocus = false;
		this.emailBlur = true;
		this.passwordFocus = false;
		this.passwordBlur = false;
		this.isSignInForm = true;

		this.state = {
			keyboardHeight: 0,
			isShowKeyboard: false,
			isDiableSignin: true,
			isSignInForm: true,
			welcomeMarginTop: new Animated.Value(WELCOME_MARGIN_TOP_INIT),
			welcomeMarginRight: new Animated.Value((width - WELCOME_WIDTH) / 2),
			welcomeOpacity: new Animated.Value(1),
			australianOpacity: new Animated.Value(1),
			australianMarginLeft: new Animated.Value(0),
			australianMarginRight: new Animated.Value(width),
			registerWrapperMarginBottom: new Value(340),
			registerWrapperMarginLeft: new Animated.Value(-width),
			signinBottom: new Animated.Value(56),
			logoEquixSlideUp: new Animated.Value(0),
			signInFormSlideUp: new Animated.Value(0)
		};

		this.perf = new Perf(performanceEnum.show_form_watch_list);

		this.testAnim = null;

		// Keyboard animation
		this.keyboardDefaultUpAnimation = declareAnimation(
			this.state.signinBottom,
			DEFAULT_KEYBOARD_HEIGHT_ANIMATION,
			600
		);
		this.keyboardDefaultDownAnimation = declareAnimation(
			this.state.signinBottom,
			56,
			600
		);

		// Welcome animation
		this.welcomeMarginTopAnim = declareAnimation(
			this.state.welcomeMarginTop,
			0,
			500
		);
		this.welcomeMarginRightToZeroAnim = declareAnimation(
			this.state.welcomeMarginRight,
			0,
			500
		);
		this.welcomeMarginRightToInitAnim = declareAnimation(
			this.state.welcomeMarginRight,
			WELCOME_MARGIN_RIGHT_INIT,
			500
		);
		this.welcomeOpacityShowAnim = declareAnimation(
			this.state.welcomeOpacity,
			1,
			100
		);
		this.welcomeOpacityHideAnim = declareAnimation(
			this.state.welcomeOpacity,
			0,
			100
		);
		this.welcomeMarginRightToCenterAnim = declareAnimation(
			this.state.welcomeMarginRight,
			(width - WELCOME_WIDTH) / 2,
			500
		);
		this.welcomeMarginRightToRightAnim = declareAnimation(
			this.state.welcomeMarginRight,
			-(width + WELCOME_WIDTH),
			500
		);
		this.welcomeMarginRightToLeftAnim = declareAnimation(
			this.state.welcomeMarginRight,
			width,
			100
		); // Chạy ngầm sang trái

		// Text description animation
		this.australianOpacityShowAnim = declareAnimation(
			this.state.australianOpacity,
			1,
			100
		);
		this.australianOpacityHideAnim = declareAnimation(
			this.state.australianOpacity,
			0,
			100
		);
		this.australianMarginLeftAnim = declareAnimation(
			this.state.australianMarginLeft,
			-width,
			500
		);
		this.australianMarginLeftInvertAnim = declareAnimation(
			this.state.australianMarginLeft,
			0,
			500
		);
		this.australianMarginLeftGoConnectingAnim = declareAnimation(
			this.state.australianMarginLeft,
			width,
			500
		);
		this.australianMarginRightToCenterAnim = declareAnimation(
			this.state.australianMarginRight,
			(width - AUSTRALIAN_WIDTH) / 2,
			500
		);
		this.australianMarginRightToRightAnim = declareAnimation(
			this.state.australianMarginRight,
			-(width + AUSTRALIAN_WIDTH),
			500
		);
		this.australianMarginRightToLeftAnim = declareAnimation(
			this.state.australianMarginRight,
			width,
			100
		); // Chạy ngầm sang trái

		// register Animation
		this.registerWrapperMarginBottomAnim = timing(this.state.registerWrapperMarginBottom, {
			toValue: 0,
			duration: 300,
			easing: Easing.linear
		})
		// from sign in to reset password
		this.registerWrapperMarginBottomResetPassword = declareAnimation(
			this.state.signInFormSlideUp,
			-(2 * height),
			500
		);
		// from reset password to sign in
		this.registerWrapperMarginBottomSignIn = declareAnimation(
			this.state.signInFormSlideUp,
			0,
			1000
		);

		this.registerWrapperMarginLeftAnim = declareAnimation(
			this.state.registerWrapperMarginLeft,
			-(2 * width),
			500
		);
		this.registerWrapperMarginLeftInvertAnim = declareAnimation(
			this.state.registerWrapperMarginLeft,
			-width,
			500
		);
		this.registerWrapperMarginLeftGoConnectingAnim = declareAnimation(
			this.state.registerWrapperMarginLeft,
			0,
			500
		);
		// from sign in to forgot password
		this.registerWrapperMarginLeftGoForgotPassword = declareAnimation(
			this.state.registerWrapperMarginLeft,
			-(3 * width),
			500
		);
		// from forgot password to sign in
		this.registerWrapperMarginLeftCancelForgotPassword = declareAnimation(
			this.state.registerWrapperMarginLeft,
			-(2 * width),
			500
		);

		this.logoEquixSlideUp = declareAnimation(
			this.state.logoEquixSlideUp,
			-300,
			250,
			true
		);
		this.logoEquixSlideDown = declareAnimation(
			this.state.logoEquixSlideUp,
			0,
			250,
			true
		);

		// keyboard timming
		this.keyboardHeight = new Animated.Value(0);
		return true;
	}

	bindAllFunction() {
		this.updateStatusEmailInput = this.updateStatusEmailInput.bind(this);
		this.updateStatusPasswordInput = this.updateStatusPasswordInput.bind(
			this
		);
		this.registerKeyboarListener = this.registerKeyboarListener.bind(this);
		this.clearTimeoutAnimation = this.clearTimeoutAnimation.bind(this);
		this.showSignIn = this.showSignIn.bind(this);
		this.registerScreenInitAnimation = this.registerScreenInitAnimation.bind(
			this
		);
		this.cancel = this.cancel.bind(this);
		this.enableSignIn = this.enableSignIn.bind(this);
		this.register = this.register.bind(this);
		this.slideAnimation = this.slideAnimation.bind(this);
		this.stopAnimation = this.stopAnimation.bind(this);
		this.loginAsGuest = this.loginAsGuest.bind(this);
		this.onOffKeyboardAnimation = this.onOffKeyboardAnimation.bind(this);
		this.pushUpAfterKeyboardShow = this.pushUpAfterKeyboardShow.bind(this);
		this.pullDownBeforeKeyboardHide = this.pullDownBeforeKeyboardHide.bind(
			this
		);
		this.forgotPassword = this.forgotPassword.bind(this);
		this.cancelForgotPassword = this.cancelForgotPassword.bind(this);
		this.resetPasswordFn = this.resetPasswordFn.bind(this);
		this.cancelResetPassword = this.cancelResetPassword.bind(this);
		this.switchForgotScreen = this.switchForgotScreen.bind(this);
		this.setStatusBarMode = this.setStatusBarMode.bind(this);
		this.renderLogoIOS = this.renderLogoIOS.bind(this);
		this.renderLogoANDROID = this.renderLogoANDROID.bind(this);

		return true;
	}

	renderLogoIOS() {
		const logo = CommonStyle.images.logo
		switch (config.logoInApp) {
			case 'BETA':
				return (
					<Image
						source={logo}
						style={{
							marginTop: (topHeight - 100) / 2,
							width: (2830 / 980) * 64,
							height: 64
						}}
					/>
				);
				break;
			case 'DEMO':
				return (
					<Image
						source={logo}
						style={{
							marginTop: (topHeight - 100) / 2,
							width: width - 64,
							height: ((width - 64) * 260) / 1766
						}}
					/>
				);
			default:
				return (
					<Image
						source={logo}
						style={{
							marginTop: (topHeight - 150) / 2,
							width: (684 / 644) * 128,
							height: 128
						}}
					/>
				);
		}
	}

	renderLogoANDROID() {
		const	logo = CommonStyle.images.logo
		switch (config.logoInApp) {
			case 'BETA':
				return (
					<Image
						source={logo}
						style={{
							marginTop: (topHeight - 100) / 2,
							width: (2830 / 980) * 64,
							height: 64
						}}
					/>
				);
				break;
			case 'DEMO':
				return (
					<Image
						source={logo}
						style={{
							marginTop: (topHeight - 100) / 2,
							width: width - 64,
							height: ((width - 64) * 260) / 1766
						}}
					/>
				);
			default:
				return (
					<Image
						source={logo}
						style={{
							marginTop: (topHeight - 150) / 2,
							width: (684 / 644) * 128,
							height: 128
						}}
					/>
				);
		}
		return config.logoInApp === 'BETA' ? (
			<Image
				source={logo}
				style={{
					marginTop: (topHeight - 100) / 2,
					width: (2830 / 980) * 64,
					height: 64
				}}
			/>
		) : (
				<Image
					source={logo}
					style={{
						marginTop: (topHeight - 150) / 2,
						width: (684 / 644) * 128,
						height: 128
					}}
				/>
			);
	}

	setStatusBarMode() {
		StatusBar.setBarStyle('light-content');
	}

	onOffKeyboardAnimation(status) {
		this.isDisableKeyboardAnimation = status;
		return true;
	}

	keyboardWillShow(event) {
		const keyboardHeight = event.endCoordinates.height || 0;
		if (this.isForgotPassword) {
			this.scrollViewForgotPassword &&
				this.scrollViewForgotPassword.scrollTo({
					x: 0,
					y: keyboardHeight - 40,
					animated: true
				});
		}
		if (this.isSignInForm) {
			if (this.isDisableKeyboardAnimation === false) {
				this.setState({
					isShowKeyboard: true
				});
				this.scrollView &&
					this.scrollView.scrollTo({
						x: 0,
						y: keyboardHeight - 40,
						animated: true
					});
			}
		} else {
			this.scrollView &&
				this.scrollView.scrollTo({
					x: 0,
					y: height + keyboardHeight - 40,
					animated: true
				});
		}
		return true;
	}

	keyboardWillHide(event) {
		if (this.isForgotPassword) {
			this.scrollViewForgotPassword &&
				this.scrollViewForgotPassword.scrollTo({
					x: 0,
					y: 0,
					animated: true
				});
		}
		if (this.isSignInForm) {
			this.setState({
				isShowKeyboard: false
			});
			this.scrollView &&
				this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
		} else {
			this.scrollView &&
				this.scrollView.scrollTo({ x: 0, y: height, animated: true });
		}

		return true;
	}

	clearTimeoutAnimation(timeout) {
		timeout && clearTimeout(timeout);
		return true;
	}

	registerKeyboarListener() {
		try {
			if (Util.isIOS()) {
				this.keyboardWillShowSub = Keyboard.addListener(
					'keyboardWillShow',
					this.keyboardWillShow.bind(this)
				);
				this.keyboardWillHideSub = Keyboard.addListener(
					'keyboardWillHide',
					this.keyboardWillHide.bind(this)
				);
			} else {
				this.keyboardDidShowListener = Keyboard.addListener(
					'keyboardDidShow',
					this._keyboardDidShow.bind(this)
				);
				this.keyboardDidHideListener = Keyboard.addListener(
					'keyboardDidHide',
					this._keyboardDidHide.bind(this)
				);
			}
			return true;
		} catch (error) {
			logDevice('error', `registerKeyboarListener EXCEPTION: ${error}`);
			return false;
		}
	}

	componentDidMount() {
		super.componentDidMount();
		try {
			this.isMount = true;

			if (this.props.comeFromeGuest) {
				this.showSignIn();
			} else {
				// Reset login error text
				this.props.actions.resetLogin();
				this.registerScreenInitAnimation();
			}
			func.setCurrentScreenId(ScreenId.HOME_PAGE);
			this.registerKeyboarListener();
		} catch (error) {
			logDevice('error', `HOME PAGE DID MOUNT EXCEPTION: ${error}`);
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		this.isMount = false;
		if (Util.isIOS()) {
			this.keyboardWillShowSub.remove();
			this.keyboardWillHideSub.remove();
		} else {
			this.keyboardDidShowListener.remove();
			this.keyboardDidHideListener.remove();
		}
		// Remove intervalssss
		if (this.animInterval) {
			clearInterval(this.animInterval);
		}
	}

	updateStatusEmailInput(type) {
		if (type === 'focus') {
			this.emailFocus = true;
			this.emailBlur = false;
		} else {
			this.emailBlur = true;
		}
		return true;
	}

	updateStatusPasswordInput(type) {
		if (type === 'focus') {
			this.passwordFocus = true;
			this.passwordBlur = false;
		} else {
			this.passwordBlur = true;
		}
		return true;
	}

	pushUpAfterKeyboardShow() {
		if (this.state.isShowKeyboard) return true;
		// Chạy animation trước khi keyboard hiện lên
		this.keyboardDefaultUpAnimation.start();
		setTimeout(() => {
			this.isMount && this.setState({ isShowKeyboard: true });
		}, 300);
		return true;
	}

	pullDownBeforeKeyboardHide() {
		// Cả 2 thằng cùng blur thì mới thực hiện animation
		if (this.emailBlur && this.passwordBlur) {
			// Chạy animation trước khi keyboard ẩn đi
			this.testAnim && this.testAnim.stop();
			setTimeout(() => {
				this.keyboardDefaultDownAnimation.start();
			}, 100);
		}
		return true;
	}

	_keyboardDidShow(event) {
		// if (this.state.isShowKeyboard) return;
		// isDisableKeyboardAnimation false when login error
		const keyboardHeight = event.endCoordinates.height;
		// Chạy mặc định animation đẩy view trước khi keyboard hiện lên 500ms -> chạy animation với keyboard tính được
		// this.keyboardDefaultUpAnimation.stop();
		if (Util.isIOS()) {
			if (this.isSignInForm) {
				if (this.isDisableKeyboardAnimation === false) {
					this.testAnim && this.testAnim.stop();
					this.testAnim = declareAnimation(
						this.state.signInFormSlideUp,
						-keyboardHeight + 8,
						200,
						true
					);
					this.testAnim.start();
					this.isMount && this.setState({ isShowKeyboard: true });
				}
			} else {
				this.testAnim && this.testAnim.stop();
				this.testAnim = declareAnimation(
					this.state.signInFormSlideUp,
					-keyboardHeight - height + 8,
					200,
					true
				);
				this.testAnim.start();
			}
		} else {
			if (this.isSignInForm) {
				if (this.isDisableKeyboardAnimation === false) {
					this.testAnim && this.testAnim.stop();
					this.testAnim = declareAnimation(
						this.state.signInFormSlideUp,
						-keyboardHeight + 8,
						200,
						true
					);
					this.testAnim.start();
					this.isMount && this.setState({ isShowKeyboard: true });
				}
			} else {
				this.testAnim && this.testAnim.stop();
				this.testAnim = declareAnimation(
					this.state.signInFormSlideUp,
					-keyboardHeight - 2 * height + 8,
					200,
					true
				);
				this.testAnim.start();
			}
		}
		// const keyboardHeight = event.endCoordinates.height || 0
		// if (this.isForgotPassword) {
		//     this.scrollViewForgotPassword && this.scrollViewForgotPassword.scrollTo({x: 0, y: keyboardHeight - 40, animated: true})
		// }
		// if (this.isSignInForm) {
		//     this.setState({
		//         isShowKeyboard: true
		//     })
		//     this.scrollView && this.scrollView.scrollTo({x: 0, y: keyboardHeight, animated: true})
		// } else {
		//     this.scrollView && this.scrollView.scrollTo({x: 0, y: 240, animated: true})
		// }
		return true;
	}

	_keyboardDidHide(event) {
		// Chạy mặc định animation đẩy view trước khi keyboard hiện lên 100ms -> chạy animation với keyboard tính được
		// this.keyboardDefaultDownAnimation.stop();
		if (Util.isIOS()) {
			if (this.isSignInForm) {
				declareAnimation(
					this.state.signInFormSlideUp,
					0,
					200,
					true
				).start();
				this.isMount && this.setState({ isShowKeyboard: false });
			} else {
				declareAnimation(
					this.state.signInFormSlideUp,
					-height,
					200,
					true
				).start();
			}
		} else {
			if (this.isSignInForm) {
				declareAnimation(
					this.state.signInFormSlideUp,
					0,
					200,
					true
				).start();
				this.isMount && this.setState({ isShowKeyboard: false });
			} else {
				declareAnimation(
					this.state.signInFormSlideUp,
					-(2 * height),
					200,
					true
				).start();
			}
		}
		// if (this.isForgotPassword) {
		//     this.scrollViewForgotPassword && this.scrollViewForgotPassword.scrollTo({x: 0, y: 0, animated: true})
		// }
		//   if (this.isSignInForm) {
		//     this.setState({
		//         isShowKeyboard: false
		//     })
		//     this.scrollView && this.scrollView.scrollTo({x: 0, y: 0, animated: true})
		//   } else {
		//     this.scrollView && this.scrollView.scrollTo({x: 0, y: height, animated: true})
		//   }
		return true;
	}

	slideAnimation() {
		let opacityNextAnimShow;
		let goRight;
		let goLeft;
		let goCenter;
		let opacityShow;
		let opacityHide;
		if (this.currentDescription === 'welcome') {
			opacityNextAnimShow = this.australianOpacityShowAnim;
			goRight = this.welcomeMarginRightToRightAnim;
			goCenter = this.australianMarginRightToCenterAnim;
			opacityHide = this.welcomeOpacityHideAnim;
			goLeft = this.welcomeMarginRightToLeftAnim;
			opacityShow = this.welcomeOpacityShowAnim;
		} else {
			opacityNextAnimShow = this.welcomeOpacityShowAnim;
			goRight = this.australianMarginRightToRightAnim;
			goCenter = this.welcomeMarginRightToCenterAnim;
			opacityHide = this.australianOpacityHideAnim;
			goLeft = this.australianMarginRightToLeftAnim;
			opacityShow = this.australianOpacityShowAnim;
		}

		this.anim = declareSequenceAnimation([
			goRight,
			opacityNextAnimShow,
			goCenter,
			opacityHide,
			goLeft,
			opacityShow
		]);

		// Run first time
		this.anim.start(() => {
			if (this.currentDescription === 'welcome') {
				this.currentDescription = 'australian';
			} else {
				this.currentDescription = 'welcome';
			}
		});
		return true;
	}

	register() {
		// Stop animation text
		this.stopAnimation(this.anim);
		const url = config.registerWebsite;
		Linking.canOpenURL(url)
			.then((response) => {
				console.log(`Can link to ${url}`);
				Linking.openURL(url)
					.then((res) => {
						console.log(`Link to ${url}`);
					})
					.catch((err) => console.log(err));
			})
			.catch((err) => console.log(err));
		return true;
	}

	stopAnimation(anim) {
		// welcome && australian hide (opacity) -> welcome go to center, australian go to left
		// 100s + 100s to hide text and go to default position
		declareSequenceAnimation([
			declareParallelAnimation([
				this.welcomeOpacityHideAnim,
				this.australianOpacityHideAnim
			]),
			declareParallelAnimation([
				declareAnimation(
					this.state.welcomeMarginRight,
					(width - WELCOME_WIDTH) / 2,
					100
				),
				declareAnimation(
					this.state.australianMarginRight,
					width / 2,
					100
				)
			])
		]).start();
		// timeout 250s and stop anim
		setTimeout(() => {
			anim && anim.stop();
		}, 250);
		this.animInterval && clearInterval(this.animInterval);
		this.clearTimeoutAnimation(this.slideAnimationTimeOut);
		return true;
	}

	loginAsGuest() {
		// Stop animation text
		this.stopAnimation(this.anim);
		// Animation push connecting tu phai qua trai -> login error push man sign in vao tu trai qua phai
		declareParallelAnimation([
			this.registerWrapperMarginLeftGoConnectingAnim,
			this.australianMarginLeftGoConnectingAnim
		]).start();

		dataStorage.loginAsGuest = true;
		this.props.actions.loginRequestGuest();
		this.props.actions.login(config.username, config.password);
		return true;
	}

	switchForgotScreen(type) {
		const eventName = AuthBusiness.getChannelSwitchForgotScreen();
		const obj = {
			type,
			callback: this.forgotPassword
		};
		Emitter.emit(eventName, obj);
		return true;
	}

	showSignIn() {
		// Stop animation text
		this.stopAnimation(this.anim);
		this.isMount &&
			this.setState({
				isDiableSignin: true
			});

		declareParallelAnimation([
			this.registerWrapperMarginLeftAnim,
			this.australianMarginLeftAnim
		]).start();
		return true;
	}

	registerScreenInitAnimation() {
		// Animation
		this.welcomeMarginTopAnim.start();
		this.clearTimeoutAnimation(this.slideAnimationTimeOut);
		this.slideAnimationTimeOut = setTimeout(() => {
			this.slideAnimation();
			// Run per 5s
			if (this.animInterval) {
				clearInterval(this.animInterval);
			}

			this.animInterval = setInterval(this.slideAnimation, 3000);
		}, 3000);
		this.clearTimeoutAnimation(this.registerWrapperMarginTimeOut);
		this.registerWrapperMarginTimeOut = () => {
			setTimeout(() => {
				this.registerWrapperMarginBottomAnim.start(() => {
					this.isMount &&
						this.setState({
							isDiableSignin: false
						});
				});
			}, 200);
		};
		this.registerWrapperMarginTimeOut && this.registerWrapperMarginTimeOut();

		return true;
	}

	cancel() {
		Keyboard.dismiss();
		if (this.props.comeFromeGuest) {
			this.registerScreenInitAnimation();
		}

		// Show welcome and run slide animation
		declareAnimation(this.state.welcomeOpacity, 1, 100).start();
		clearTimeout(this.slideAnimationTimeOut);
		this.slideAnimationTimeOut = setTimeout(() => {
			// Anim text
			this.slideAnimation();
			// Run per 3s
			if (this.animInterval) {
				clearInterval(this.animInterval);
			}

			this.animInterval = setInterval(this.slideAnimation, 3000);
		}, 1000);
		this.isMount &&
			this.setState({
				isDiableSignin: false
			});
		declareParallelAnimation([
			this.registerWrapperMarginLeftInvertAnim,
			this.australianMarginLeftInvertAnim
		]).start();
		return true;
	}

	resetPasswordFn(errorCode) {
		this.isSignInForm = false;
		Keyboard.dismiss();
		this.setState({
			isShowKeyboard: true
		});
		this.resetPasswordForm = errorCode;
		if (Util.isIOS()) {
			this.scrollView &&
				this.scrollView.scrollTo({ x: 0, y: height, animated: true });
		} else {
			declareParallelAnimation([
				this.registerWrapperMarginBottomResetPassword,
				this.logoEquixSlideUp
			]).start();
		}
		return true;
	}

	cancelResetPassword() {
		this.props.actions.loadFormHandler();
		this.isSignInForm = true;
		Keyboard.dismiss();
		this.setState({
			isShowKeyboard: false
		});
		if (Util.isIOS()) {
			this.scrollView &&
				this.scrollView.scrollTo({ x: 0, y: 0, animated: true });
		} else {
			declareParallelAnimation([
				this.registerWrapperMarginBottomSignIn,
				this.logoEquixSlideDown
			]).start();
		}
		return true;
	}

	forgotPassword() {
		// Stop animation text
		this.isForgotPassword = true;
		Keyboard.dismiss();
		this.stopAnimation(this.anim);
		setTimeout(() => {
			this.setState({
				isShowKeyboard: false,
				isDiableSignin: true
			});
		}, 500);

		declareParallelAnimation([
			this.registerWrapperMarginLeftGoForgotPassword,
			this.australianMarginLeftAnim
		]).start();
		return true;
	}

	cancelForgotPassword() {
		Keyboard.dismiss();
		this.registerWrapperMarginLeftCancelForgotPassword.start(() => {
			this.isForgotPassword = false;
		});
		return true;
	}

	enableSignIn() {
		this.isMount &&
			this.setState({
				isDiableSignin: false
			});
		return true;
	}

	render() {
		const {
			homePageContainer,
			homePageTopContent,
			homePageContent,
			homePageBotContent,
			homePageWelcomeText,
			homePageDescription,
			homePageDescriptionText,
			homePageRegister,
			homePageSignIn,
			homePageRegisterText,
			homePageGuestText
		} = styles;
		return Util.isIOS() ? (
			<View
				style={{
					flex: 1,
					width,
					height,
					backgroundColor: 'transparent'
				}}
			>
				<Image
					source={Util.isIOS() ? background : backgroundAndroid}
					style={{ flex: 1, width: null, height: null }}
					resizeMode={Util.isIOS() ? 'cover' : 'stretch'}
				/>
				<View
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					}}
				>
					<Animated.View
						style={[
							homePageTopContent,
							{
								alignItems: 'center',
								transform: [
									{ translateY: this.state.logoEquixSlideUp }
								]
							}
						]}
					>
						{this.state.isShowKeyboard
							? null
							: this.renderLogoIOS()}
					</Animated.View>

					<Animated.View
						style={[
							{
								width,
								height: midHeight,
								marginTop: this.state.welcomeMarginTop,
								marginLeft: this.state.australianMarginLeft
							}
						]}
					>
						<Animated.View
							style={{
								opacity: this.state.welcomeOpacity,
								position: 'absolute',
								right: this.state.welcomeMarginRight,
								width: WELCOME_WIDTH
							}}
						>
							<Text style={homePageWelcomeText}>
								{I18n.t('WelComeTo')}
							</Text>
							<Text style={homePageWelcomeText}>
								{I18n.t('appName')}
							</Text>
						</Animated.View>

						<Animated.View
							style={{
								opacity: this.state.australianOpacity,
								position: 'absolute',
								right: this.state.australianMarginRight,
								width: AUSTRALIAN_WIDTH
							}}
						>
							<Text style={homePageDescriptionText}>
								Australian stock market trading
							</Text>
							<Text style={homePageDescriptionText}>
								and analysis app.
							</Text>
						</Animated.View>
					</Animated.View>
				</View>

				<ScrollView
					scrollEnabled={false}
					keyboardShouldPersistTaps="handled"
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					}}
				>
					<Animated.View
						style={{
							transform: [
								{
									translateX: this.state
										.registerWrapperMarginLeft
								}
							],
							width: 4 * width,
							height: height,
							flexDirection: 'row',
							alignItems: 'flex-end'
						}}
					>
						{/* Connecting */}
						<View
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								left: 0,
								right: 3 * width,
								zIndex: 9999999999,
								justifyContent: 'center',
								width
							}}
						>
							<Connecting />
						</View>
						{/* Register */}
						<View
							style={{
								position: 'absolute',
								bottom: 0,
								left: width,
								right: 2 * width,
								zIndex: 9999999999
							}}
						>
							<ReAnimated.View
								style={[{
									transform: [{
										translateY: this.state.registerWrapperMarginBottom
									}]
								}]}
							>
								<Register
									register={this.register}
									loginAsGuest={this.loginAsGuest}
									showSignIn={this.showSignIn}
									isDiableSignin={this.state.isDiableSignin}
								/>
							</ReAnimated.View>
						</View>
						{/* Sign in form */}
						<ScrollView
							ref={(ref) => {
								this.scrollView = ref;
							}}
							scrollEnabled={false}
							keyboardShouldPersistTaps="handled"
							scrollEventThrottle={1} // <-- Use 1 here to make sure no events are ever missed
							style={{
								position: 'absolute',
								bottom: 0,
								left: 2 * width,
								right: width,
								top: 48,
								zIndex: 9999999999
							}}
						>
							<SignIn
								onOffKeyboardAnimation={
									this.onOffKeyboardAnimation
								}
								switchForgotScreen={this.switchForgotScreen}
								cancelFn={this.cancel}
								resetPasswordFn={this.resetPasswordFn}
								forgotPasswordFN={this.forgotPassword}
							/>
							<ResetPassword
								cancelFn={this.cancelResetPassword}
							/>
						</ScrollView>
						<ScrollView
							ref={(ref) => {
								this.scrollViewForgotPassword = ref;
							}}
							scrollEnabled={false}
							keyboardShouldPersistTaps="handled"
							scrollEventThrottle={1} // <-- Use 1 here to make sure no events are ever missed
							style={{
								position: 'absolute',
								left: 3 * width,
								right: 0,
								top: 48,
								zIndex: 9999999999
							}}
						>
							<ForgotParent
								cancelFn={this.cancelForgotPassword}
							/>
						</ScrollView>
					</Animated.View>
				</ScrollView>
			</View>
		) : (
				<View
					style={{
						flex: 1,
						width,
						height,
						backgroundColor: 'transparent'
					}}
				>
					<Image
						source={Util.isIOS() ? background : backgroundAndroid}
						style={{ flex: 1, width: null, height: null }}
						resizeMode={Util.isIOS() ? 'cover' : 'stretch'}
					/>
					<View
						style={{
							position: 'absolute',
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						}}
					>
						<Animated.View
							style={[
								homePageTopContent,
								{
									alignItems: 'center',
									transform: [
										{ translateY: this.state.logoEquixSlideUp }
									]
								}
							]}
						>
							{this.state.isShowKeyboard
								? null
								: this.renderLogoANDROID()}
						</Animated.View>

						<Animated.View
							style={[
								{
									width,
									height: midHeight,
									marginTop: this.state.welcomeMarginTop,
									marginLeft: this.state.australianMarginLeft
								}
							]}
						>
							<Animated.View
								style={{
									opacity: this.state.welcomeOpacity,
									position: 'absolute',
									right: this.state.welcomeMarginRight,
									width: WELCOME_WIDTH
								}}
							>
								<Text style={homePageWelcomeText}>
									{I18n.t('WelComeTo')}
								</Text>
								<Text style={homePageWelcomeText}>
									{I18n.t('appName')}
								</Text>
							</Animated.View>

							<Animated.View
								style={{
									opacity: this.state.australianOpacity,
									position: 'absolute',
									right: this.state.australianMarginRight,
									width: AUSTRALIAN_WIDTH
								}}
							>
								<Text style={homePageDescriptionText}>
									Australian stock market trading
							</Text>
								<Text style={homePageDescriptionText}>
									and analysis app.
							</Text>
							</Animated.View>
						</Animated.View>
					</View>

					<TouchableWithoutFeedback
						onPress={() => {
							Keyboard.dismiss();
						}}
						accessible={false}
					>
						<View
							style={{
								position: 'absolute',
								top: 0,
								right: 0,
								bottom: 0,
								left: 0
							}}
						>
							<Animated.View
								style={{
									transform: [
										{
											translateX: this.state
												.registerWrapperMarginLeft
										}
									],
									width: 4 * width,
									height: realHeight,
									flexDirection: 'row',
									alignItems: 'flex-end'
								}}
							>
								{/* Connecting */}
								<View
									style={{
										position: 'absolute',
										top: 0,
										bottom: 0,
										left: 0,
										right: 3 * width,
										zIndex: 9999999999,
										justifyContent: 'center',
										width
									}}
								>
									<Connecting />
								</View>
								{/* Register */}
								<View
									style={{
										position: 'absolute',
										bottom: 0,
										left: width,
										right: 2 * width,
										zIndex: 9999999999
									}}
								>
									<ReAnimated.View
										style={[{
											transform: [{
												translateY: this.state.registerWrapperMarginBottom
											}]
										}]}
									>
										<Register
											register={this.register}
											loginAsGuest={this.loginAsGuest}
											showSignIn={this.showSignIn}
											isDiableSignin={
												this.state.isDiableSignin
											}
										/>
									</ReAnimated.View>
								</View>
								{/* Sign in form */}
								<Animated.View
									style={{
										transform: [
											{
												translateY: this.state
													.signInFormSlideUp
											}
										],
										position: 'absolute',
										top: 0,
										bottom: -2 * height,
										left: 2 * width,
										right: width,
										zIndex: 9999999999,
										flex: 1,
										flexDirection: 'column'
									}}
								>
									<SignIn
										onOffKeyboardAnimation={
											this.onOffKeyboardAnimation
										}
										switchForgotScreen={this.switchForgotScreen}
										cancelFn={this.cancel}
										resetPasswordFn={this.resetPasswordFn}
										forgotPasswordFN={this.forgotPassword}
									/>
									<ResetPassword
										cancelFn={this.cancelResetPassword}
									/>
								</Animated.View>
								{/* Forgot Password */}
								<Animated.View
									style={{
										transform: [
											{
												translateY: this.state
													.signInFormSlideUp
											}
										],
										position: 'absolute',
										bottom: 0,
										left: 3 * width,
										right: 0,
										zIndex: 9999999999
									}}
								>
									<ForgotParent
										cancelFn={this.cancelForgotPassword}
									/>
								</Animated.View>
							</Animated.View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			);
	}
}

function mapStateToProps(state, ownProps) {
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

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
