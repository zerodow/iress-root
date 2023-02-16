import React, { Component } from 'react'
import {
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native'
import * as Animatable from 'react-native-animatable';
import CommonStyle from '~/theme/theme_controller'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '~s/login/login.actions';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Business from '~/business';
import * as Api from '~/api'
import I18n from '~/modules/language/'
import { dataStorage } from '~/storage'
import * as Controller from '~/memory/controller'
import * as FunctionUtil from '~/lib/base/functionUtil'

class PopupForgotPin extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			value: '',
			submitDisabled: true,
			isSecureTextEntry: true,
			isFocus: false,
			errorText: ''
		};
		this.renderIOS = this.renderIOS.bind(this);
		this.renderAndroid = this.renderAndroid.bind(this);
		this.renderTitle = this.renderTitle.bind(this);
		this.renderSubtitle = this.renderSubtitle.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.renderSeperateLine = this.renderSeperateLine.bind(this);
		this.onChangeText = this.onChangeText.bind(this);
		this.rightIconInputPress = this.rightIconInputPress.bind(this);
		this.onSubmitPress = this.onSubmitPress.bind(this);
		this.onCancelPress = this.onCancelPress.bind(this);
		this.forgotPinSuccessCallBack = this.forgotPinSuccessCallBack.bind(this);
		this.authFail = this.authFail.bind(this)
	}

	onChangeText(value) {
		this.setState({ isError: false });
		let disabled = false;
		if (value === '') {
			disabled = true;
		}
		this.setState({ value, submitDisabled: disabled });
	};

	onCancelPress() {
		Keyboard.dismiss();
		this.props.onClose && this.props.onClose()
	}

	forgotPinSuccessCallBack(accessToken) {
		this.setState({
			isLoading: false,
			isError: false,
			errorText: ''
		}, () => {
			this.props.showSetPin && this.props.showSetPin(accessToken)
		});
	}

	authFail(errorCode) {
		const errorText = FunctionUtil.getReason(errorCode);
		this.setState({
			isLoading: false,
			isError: true,
			errorText
		});
		this.refModal && this.refModal.shake(1000)
		// setTimeout(() => {
		//     errorCb && errorCb();
		// }, 500);
	}

	updateLoading(isLoading) {
		if (this.state.isLoading !== isLoading) {
			this.setState({
				isLoading
			})
		}
	}

	onSubmitPress() {
		try {
			this.updateLoading(true);
			const email = dataStorage.emailLogin || '';
			const { value } = this.state;
			this.setState({ submitDisabled: true }, () => {
				const authUri = Api.getAuthUrl();
				Business.getEncryptText(value)
					.then(res => {
						const { encryptText, sessionID } = res;
						Api.postData(
							authUri,
							{
								data: {
									username: email.toLocaleLowerCase(),
									password: encryptText,
									session_id: value === encryptText
										? null
										: sessionID,
									provider: Controller.isDemo() ? 'quantedge' : 'paritech'
								}
							}).then((data) => {
								if (data.errorCode) {
									this.authFail(data.errorCode)
								} else {
									const accessToken = data.accessToken;
									this.forgotPinSuccessCallBack(accessToken);
								}
							}).catch((error) => {
								console.log('onSubmitPress error', error);
								this.authFail(error)
							});
					})
			});
		} catch (error) {
			console.log('onSubmitPress exception', error)
		}
	}

	rightIconInputPress() {
		this.setState({
			isSecureTextEntry: !this.state.isSecureTextEntry
		}, () => {
			this.refInput && this.refInput.blur()
		})
	}

	renderTitle() {
		return <View style={CommonStyle.dialogTitle}>
			<Text style={CommonStyle.dialogTitleText}>
				{I18n.t('resetYourPin')}
			</Text>
		</View>
	}

	renderSubtitle() {
		return <View style={CommonStyle.dialogSubTitle}>
			<Text style={[CommonStyle.dialogSubTitleText, this.props.subtitleStyle]}>
				{I18n.t('pleaseEnterYourPassword')}
			</Text>
		</View>
	}

	renderError() {
		return this.state.errorText === ''
			? <View style={{ height: 20, width: '100%' }} />
			: <View style={CommonStyle.errorContainer}>
				<Text style={CommonStyle.textError2}>{this.state.errorText}</Text>
			</View>
	}

	renderInput() {
		return <View style={CommonStyle.dialogBody}>
			<TextInput
				ref={ref => this.refInput = ref}
				testID={'forgot_password'}
				style={CommonStyle.dialogInput}
				// selectionColor={CommonStyle.fontApple}
				underlineColorAndroid="rgba(0,0,0,0)"
				defaultValue={''}
				value={this.state.value}
				onChangeText={(value) => {
					this.onChangeText(value);
				}}
				placeholderTextColor='grey'
				secureTextEntry={this.state.isSecureTextEntry}
				placeholder={I18n.t('password')}
				autoFocus={true} />
			<TouchableOpacity
				style={[CommonStyle.rightIcon]}
				activeOpacity={1}
				onPress={this.rightIconInputPress.bind(this)}>
				<Icon
					style={{ opacity: this.state.isSecureTextEntry ? 0.4 : 1, color: CommonStyle.fontColor, paddingRight: 4 }}
					name={'md-eye'}
					size={18} />
			</TouchableOpacity>
		</View>
	}

	renderSeperateLine() {
		return <View style={{
			width: '100%',
			backgroundColor: 'transparent',
			borderBottomWidth: 1,
			borderBottomColor: 'rgba(255, 255, 255, 0.6)'
		}} />
	}

	renderButton() {
		const { buttonStyle, buttonTextStyle, cancelButtonStyle, cancelButtonTextStyle, submitButtonStyle } = this.props;
		return <View style={CommonStyle.dialogFooter}>
			<TouchableOpacity
				testID={'CancelButton'}
				onPress={this.onCancelPress}
				style={{
					borderWidth: 2,
					borderRadius: 100,
					borderColor: CommonStyle.fontColorButtonSwitch,
					width: '45%'
				}}>
				<View style={[CommonStyle.dialogAction, buttonStyle, cancelButtonStyle]}>
					<Text style={[CommonStyle.dialogActionText, buttonTextStyle, cancelButtonTextStyle]}>
						{I18n.t('cancel')}
					</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity
				testID={'SubmitButton'}
				onPress={this.onSubmitPress}
				style={{
					borderWidth: 2,
					borderRadius: 100,
					borderColor: CommonStyle.fontColorButtonSwitch,
					width: '45%',
					backgroundColor: CommonStyle.fontColorButtonSwitch
				}}
				disabled={this.state.submitDisabled}>
				<View style={[CommonStyle.dialogAction, buttonStyle, submitButtonStyle]}>
					{
						this.state.isLoading
							? <ActivityIndicator style={{ width: 24, height: 24 }} color={CommonStyle.fontWhite} />
							: <Text style={[CommonStyle.dialogActionText, {
								color: this.state.submitDisabled ? '#808080' : CommonStyle.fontDark,
								fontWeight: '500'
							}]}>
								{I18n.t('ok')}
							</Text>
					}
				</View>
			</TouchableOpacity>
		</View>
	}

	renderIOS() {
		return <View
			testID={'PromtModal'}
			style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center'
			}}
			key={'prompt'}>
			{
				<KeyboardAvoidingView
					behavior={'padding'}
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Animatable.View
						ref={ref => this.refModal = ref}
						style={CommonStyle.dialogContent2}>
						{this.renderTitle()}
						{this.renderSubtitle()}
						{this.renderInput()}
						{this.renderError()}
						{this.renderButton()}
					</Animatable.View>
				</KeyboardAvoidingView>
			}
		</View>
	}

	renderAndroid() {
		return <View
			testID={'PromtModal'}
			style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center'
			}}
			key={'prompt'}>
			{
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Animatable.View
						ref={ref => this.refModal = ref}
						style={CommonStyle.dialogContent2}>
						{this.renderTitle()}
						{this.renderSubtitle()}
						{this.renderInput()}
						{this.renderError()}
						{this.renderButton()}
					</Animatable.View>
				</View>
			}
		</View>
	}

	render() {
		return Platform.OS === 'ios'
			? this.renderIOS()
			: this.renderAndroid()
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isAuthLoading: state.login.isAuthLoading,
		isLoading: state.login.isLoading
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PopupForgotPin);
