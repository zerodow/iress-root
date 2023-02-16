import React from 'react';
import { View, Keyboard } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { dataStorage } from '../../storage';
import config from '../../config';
import {
	logAndReport,
	removeItemFromLocalStorage,
	pinComplete
} from '../../lib/base/functionUtil';
import AuthenByPin from '../authen_by_pin/authen_by_pin';
import Enum from '../../enum';
import * as Util from '../../util';
import XComponent from '../xComponent/xComponent';
import Auth from '../../lib/base/auth';
import * as authSettingActions from '../../screens/setting/auth_setting/auth_setting.actions';
import * as loginActions from '../../screens/login/login.actions';
import TouchAlert from '../../screens/setting/auth_setting/TouchAlert';
import QuickButton from '../quick_button/quick_button';
import I18n from '../../../src/modules/language/';
import * as Emitter from '@lib/vietnam-emitter';
import * as Controller from '../../memory/controller';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { showSearchModal, showSetPinModal } from '~/navigation/controller.1';

const DEFAULT_TXT = Enum.DEFAULT_TXT;
const DEFAULT_VAL = Enum.DEFAULT_VAL;

export class AuthenPin extends XComponent {
	static propTypes = {
		onAuthSuccess: PropTypes.func.isRequired,
		showQuickButton: PropTypes.bool,
		navigator: PropTypes.object,
		channelRequestCheckAuthen: PropTypes.string
	};

	//  #region REACT AND DEFAULT FUNCTION
	bindAllFunc() {
		this.showFormLogin = this.showFormLogin.bind(this);
		this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
		this.removeItemStorageSuccessCallback = this.removeItemStorageSuccessCallback.bind(
			this
		);
		this.onForgotPin = this.onForgotPin.bind(this);
		this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(
			this
		);
		this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
		this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
		this.androidTouchIDFail = this.androidTouchIDFail.bind(this);
		this.onPinCompleted = this.onPinCompleted.bind(this);
		this.authenPinFail = this.authenPinFail.bind(this);
		this.authFunction = this.authFunction.bind(this);
		this.onUniversalSearch = this.onUniversalSearch.bind(this);
		this.subChannelRequestCheckAuthen = this.subChannelRequestCheckAuthen.bind(
			this
		);
	}

	init() {
		this.dic = {
			showFormLoginSuccessCallback: null,
			params: [],
			authenPin: null,
			androidTouchID: null,
			auth: new Auth(
				this.props.navigator,
				this.props.login.email,
				this.props.login.token,
				this.showFormLogin
			)
		};

		this.state = {
			isForgotPinModalVisible: false,
			animationLogin: null,
			isError: null,
			isAndroidTouchIdModalVisible: false,
			paramsTouchAlert: []
		};
	}

	componentDidMount() {
		super.componentDidMount();
		this.subChannelRequestCheckAuthen();
	}
	//  #endregion

	//  #region BUSINESS FUNCTION
	onUniversalSearch() {
		showSearchModal({
			navigator: this.props.navigator,
			title: I18n.t('search', { locale: this.props.setting.lang })
		});
	}
	//  #endregion

	//  #region SUBCRIBER
	subChannelRequestCheckAuthen() {
		this.props.channelRequestCheckAuthen &&
			Emitter.addListener(
				this.props.channelRequestCheckAuthen,
				this.id,
				this.authFunction
			);
	}
	//  #endregion

	//  #region AUTH FUNCTION
	showFormLogin(successCallback, params) {
		if (dataStorage.isLockTouchID && Util.isIOS()) {
			offTouchIDSetting(this.props.authSettingActions.turnOffTouchID);
		}
		if (successCallback) {
			this.dic.showFormLoginSuccessCallback = successCallback;
		}
		this.dic.params = params || [];
		this.dic.authenPin && this.dic.authenPin.showModalAuthenPin();
	}

	forgotPinSuccessCb() {
		removeItemFromLocalStorage(
			dataStorage.userPin.email || dataStorage.emailLogin,
			this.removeItemStorageSuccessCallback,
			DEFAULT_VAL.FUNC
		);
	}

	removeItemStorageSuccessCallback() {
		dataStorage.numberFailEnterPin = 0;

		setTimeout(() => {
			showSetPinModal(
				{
					type: 'new'
				},
				this.props.navigator
			);
		}, 500);
	}

	onForgotPin() {
		Keyboard.dismiss();
		this.dic.authenPin && this.dic.authenPin.hideModalAuthenPin();
		setTimeout(() => this.setState({ isForgotPinModalVisible: true }), 500);
	}

	onChangeAuthenByFingerPrint() {
		this.dic.authenPin && this.dic.authenPin.hideModalAuthenPin();
		let objAndroidTouchIDFn = null;
		if (Util.isAndroid()) {
			objAndroidTouchIDFn = {
				showAndroidTouchID: this.showAndroidTouchID,
				hideAndroidTouchID: this.hideAndroidTouchID,
				androidTouchIDFail: this.androidTouchIDFail
			};
		}
		this.dic.auth.authentication(
			this.props.onAuthSuccess,
			null,
			objAndroidTouchIDFn
		);
	}

	showAndroidTouchID(params) {
		dataStorage.onAuthenticating = true;
		dataStorage.dismissAuthen = this.hideAndroidTouchID;
		this.setState({
			isAndroidTouchIdModalVisible: true,
			paramsTouchAlert: params
		});
	}

	hideAndroidTouchID() {
		dataStorage.onAuthenticating = false;
		this.setState({ isAndroidTouchIdModalVisible: false });
	}

	androidTouchIDFail(callback, numberFingerFailAndroid) {
		this.dic.androidTouchID &&
			this.dic.androidTouchID.authenFail(
				callback,
				numberFingerFailAndroid
			);
	}

	onPinCompleted(pincode) {
		const store = Controller.getGlobalState();
		const login = store.login;
		const refreshToken = login.loginObj.refreshToken;
		pinComplete(
			pincode,
			this.dic.authenPin,
			this.dic.showFormLoginSuccessCallback,
			this.authenPinFail,
			this.dic.params,
			refreshToken
		);
	}

	authenPinFail() {
		this.dic.authenPin && this.dic.authenPin.authenFail();
	}

	authFunction() {
		try {
			if (dataStorage.pinSetting !== 0) {
				this.props.onAuthSuccess && this.props.onAuthSuccess();
			} else {
				let objAndroidTouchIDFn = null;
				if (Util.isAndroid()) {
					objAndroidTouchIDFn = {
						showAndroidTouchID: this.showAndroidTouchID,
						hideAndroidTouchID: this.hideAndroidTouchID,
						androidTouchIDFail: this.androidTouchIDFail
					};
				}
				this.dic.auth.authentication(
					this.props.onAuthSuccess,
					null,
					objAndroidTouchIDFn
				);
			}
		} catch (error) {
			console.log('authFunction home logAndReport exception: ', error);
			logAndReport(
				'authFunction home exception',
				error,
				'authFunction price'
			);
		}
	}
	//  #endregion

	//  #region RENDER
	render() {
		return (
			<React.Fragment>
				{this.dic.auth.showLoginForm(
					this.state.isForgotPinModalVisible,
					DEFAULT_TXT.RESET_UR_PIN,
					DEFAULT_TXT.PLEASE_ENTER_UR_PASS,
					this.state.animationLogin,
					() => this.setState({ animationLogin: '' }),
					() => this.setState({ isForgotPinModalVisible: false }),
					() => {
						this.props.actions.authError();
						this.setState({ isError: true });
					},
					() => {
						this.props.actions.authSuccess();
						this.setState({
							isForgotPinModalVisible: false,
							isError: false
						});
					},
					() => {
						this.props.actions.authSuccess();
						this.setState(
							{
								isForgotPinModalVisible: false,
								isError: false
							},
							this.forgotPinSuccessCb
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
					onRef={ref => (this.dic.authenPin = ref)}
					onPinCompleted={this.onPinCompleted}
				/>
				<TouchAlert
					ref={ref => (this.dic.androidTouchID = ref)}
					visible={this.state.isAndroidTouchIdModalVisible}
					dismissDialog={this.hideAndroidTouchID}
					authenByPinFn={this.showFormLogin.bind(
						this,
						this.props.onAuthSuccess,
						this.state.paramsTouchAlert
					)}
				/>
				{this.props.showQuickButton ? (
					<QuickButton
						testID={`quickButton`}
						navigator={this.props.navigator}
						onNewOrder={this.authFunction}
						onUniversalSearch={this.onUniversalSearch}
					/>
				) : (
					<View />
				)}
			</React.Fragment>
		);
	}
	//  #endregion
}

function mapStateToProps(state) {
	return {
		login: state.login,
		isConnected: state.app.isConnected,
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
)(AuthenPin);
