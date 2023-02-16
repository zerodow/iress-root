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
	TextInput,
	ActivityIndicator,
	ScrollView,
	KeyboardAvoidingView
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
	declareParallelAnimation,
	declareSequenceAnimation,
	translateErrorCode
} from '../../lib/base/functionUtil';
import { dataStorage, func } from '../../storage';
import I18n from '../../modules/language/';
import { bindActionCreators } from 'redux';
import styles from './style/home_page';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import Connecting from './connecting';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import ENUM from '../../enum';
import authCode from '../../constants/authCode';
import * as Emitter from '@lib/vietnam-emitter';
import * as Business from '../../business';
import * as Animatable from 'react-native-animatable';
import AnimatableError from './animatableError';
import TextInputHomePage from './textInputHomePage'
import ErrorAnimation from '../../component/error_animation/error_animation'
import HeaderAccount from './child_component/header'
import ContentResetPassword from './child_component/reset_password/content_reset_password.2'
import HeightSoftBar from './view.height.softbar'
import * as Util from '../../util';

const { height, width } = Dimensions.get('window');
const wrongPassword = 'red';
const correctPassword = 'rgba(239,239,239,0.7)';

export class ResetPassword extends Component {
	constructor(props) {
		super(props);
		Text.allowFontScaling = !(PixelRatio.getFontScale() > 1.4);
		this.cancel = this.cancel.bind(this);
		this.showPassword = this.showPassword.bind(this)
		// this.renderHeader = this.renderHeader.bind(this)
		this.showError = this.showError.bind(this)

		this.token = ''

		this.state = {
			errorText: '',
			isExpand: false,
			errorType: authCode.ENTER_NEW_EMAIL_AND_NEW_PASSWORD
		};
	}

	showError(errorCode) {
		let isExpand = false;
		let errorText = ''

		if (errorCode !== '') {
			errorText = translateErrorCode(errorCode)
			isExpand = true
		}
		return this.setState({
			errorText,
			isExpand
		})
	}

	showPassword(ref, id) {
		switch (id) {
			case 'newPassword':
				this.setState(
					{
						showNewPassword: !this.state.showNewPassword
					},
					() => {
						Business.setSelectionTextInput(
							ref,
							this.state.objPassword[id].length
						);
					}
				);
				break;
			case 'confirmPassword':
				this.setState(
					{
						showConfirmPassword: !this.state.showConfirmPassword
					},
					() => {
						Business.setSelectionTextInput(
							ref,
							this.state.objPassword[id].length
						);
					}
				);
				break;
			case 'email':
				this.setState({
					canClearEmail: !this.state.canClearEmail,
					email: '',
					confirmDisable: true
				});
				break;
			default:
				break;
		}
	}

	cancel() {
		this.props.cancelFn();
	}

	render() {
		const ForgotPWComponent = Platform.OS === 'ios'
			? KeyboardAvoidingView
			: View
		const forgorPWComponentProps = Platform.OS === 'ios'
			? { behavior: 'padding' }
			: {}
		const {
			homePageDescriptionText,
			homePageRegister,
			rightIcon,
			forgotPasswordText,
			dialogInputClone,
			homePageWelcomeText,
			errorContainer,
			wrapperErrorTxt,
			errorTxt
		} = styles;
		const stylesAnimationError = this.heightAnimatedView > 0 ? { textAlign: 'center', backgroundColor: 'red', color: 'white', marginVertical: 16, marginHorizontal: 48, height: this.heightAnimation } : {};
		return <View
			style={[{ opacity: 0, width, height: Util.isIOS() ? height : 2 * height }]}>
			<ForgotPWComponent
				{...forgorPWComponentProps}
				style={{ flex: 1, justifyContent: 'flex-end' }}>
				<View style={{ marginBottom: 4, height: 50 }}>
					<ErrorAnimation
						isExpand={this.state.isExpand}
						textStyle={[errorTxt, { marginVertical: 4 }]}
						errorStyle={[wrapperErrorTxt, { marginTop: 4 }]}
						errorText={this.state.errorText}
						callbackHideError={this.showError}
						duration={500}
						timeOutErrorHidden={ENUM.TIMEOUT_HIDE_ERROR} />
				</View>
				<ContentResetPassword showError={this.showError} cancelFn={this.cancel} />
				<HeightSoftBar />
			</ForgotPWComponent>
		</View>
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ResetPassword);
