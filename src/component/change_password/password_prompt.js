import React, { Component } from 'react';
import {
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	PixelRatio,
	Dimensions,
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Animated
} from 'react-native';
import I18n from '../../modules/language/index';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import * as Controller from '~/memory/controller';
import Icon from 'react-native-vector-icons/Ionicons';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import styles from './style/password_prompt';
import PropTypes from 'prop-types';
import * as Log from '../../utils/log';
import { func } from '../../storage';
import * as api from '../../api';
import * as Business from '../../business';
import * as Utils from '../../util';
import { resolve } from 'url';
import { BlurView } from 'react-native-blur';
import * as Animatable from 'react-native-animatable';
// import { AnimationFrameScheduler } from 'rxjs/scheduler/AnimationFrameScheduler';
import ENUM from '~/enum';
const { height } = Dimensions.get('screen');
const obj = {};

export class PasswordPrompt extends Component {
	constructor(props) {
		super(props);
		for (let index = 0; index < this.props.listData.length; index++) {
			const element = this.props.listData[index];
			obj[element.id] = element.defaultValue;
		}
		this.state = {
			isFocus: false,
			isSecureTextEntry: true,
			isSecureTextEntryNew: true,
			isSecureTextEntryConfirm: true,
			submitDisabled: true,
			value: obj,
			cancelDisable: false,
			errorText: '',
			errorTextNew: '',
			visible: false,
			isError: false,
			isErrorNew: false,
			isLoading: false
		};

		this.opacityWrapperAnim = new Animated.Value(0);
		this.onChangeText = this.onChangeText.bind(this);
		this.renderInput = this.renderInput.bind(this);
		this.postDataPassword = this.postDataPassword.bind(this);
		this.isMount = false;
		this.userLoginId = '';
		this.requestTimeout = null;
	}

	componentWillReceiveProps(nextProps) {
		const { visible, isConnected } = nextProps;
		this.isMount && this.setState({ visible, isConnected });
	}

	componentDidMount() {
		this.isMount = true;
		this.fadeInAnim();
	}

	componentWillUnmount() {
		this.isMount = false;
	}

	onChangeText(value, id) {
		try {
			const obj = this.state.value;
			obj[id] = value;
			let disabled = true;
			if (
				obj['current_password'] === '' ||
				obj['new_password'] === '' ||
				obj['confirm_password'] === ''
			) {
				disabled = true;
			} else {
				disabled = false;
			}
			this.isMount &&
				this.setState({ value: obj, submitDisabled: disabled });
			this.checkError(id);
		} catch (e) {
			Log.logTest.error(e);
		}
	}

	onFocus(id) {
		if (id === 'current_password') {
			this.isMount && this.setState({ errorText: '', isError: false });
		} else {
			this.isMount &&
				this.setState({ errorTextNew: '', isErrorNew: false });
		}
	}

	_onCancelPress() {
		Keyboard.dismiss();
		const { value } = this.state;
		const temp = {};
		temp.current_password = '';
		temp.new_password = '';
		temp.confirm_password = '';
		this.isMount &&
			this.setState(
				{
					value: temp,
					submitDisabled: true,
					isError: false,
					isErrorNew: false,
					errorText: '',
					errorTextNew: '',
					isSecureTextEntry: true,
					isSecureTextEntryNew: true,
					isSecureTextEntryConfirm: true,
					isLoading: false,
					cancelDisable: false
				},
				() => {
					this.fadeOutAnim();
					setTimeout(() => {
						this.requestTimeout &&
							clearTimeout(this.requestTimeout);
						this.props.onCancel();
					}, 500);
				}
			);
	}

	checkError(id) {
		const { value } = this.state;
		const checkCondition =
			value['confirm_password'].length >= value['new_password'].length &&
			value['new_password'] !== '' &&
			value['new_password'] !== value['confirm_password'];
		if (checkCondition) {
			const errorTextNew = I18n.t('passwordDidNotMatch');
			const isErrorNew = true;
			const submitDisabled = true;
			this.isMount &&
				this.setState({ submitDisabled, isErrorNew, errorTextNew });
		} else if (
			value['new_password'] !== '' &&
			value['confirm_password'] !== '' &&
			value['current_password'] !== false
		) {
			this.isMount &&
				this.setState({
					submitDisabled: false,
					isErrorNew: false,
					errorTextNew: ''
				});
		} else {
			this.isMount &&
				this.setState({ submitDisabled: true, cancelDisable: false });
		}
	}

	shake = this.shake.bind(this);
	shake() {
		this.wrapperRef && this.wrapperRef.shake(1000);
	}

	postDataPassword() {
		const { value } = this.state;
		const userLoginId = func.getUserLoginId();
		Business.getSecretKey().then(res => {
			const { secretKey, sessionID } = res;
			let oldPassword = value['current_password'];
			let password = value['confirm_password'];
			let data = {};
			if (secretKey) {
				oldPassword = Utils.encrypt(oldPassword, secretKey);
				password = Utils.encrypt(password, secretKey);
				data = {
					user_login_id: userLoginId.trim(),
					old_password: oldPassword,
					password,
					session_id: sessionID
				};
			} else {
				data = {
					user_login_id: userLoginId.trim(),
					old_password: oldPassword,
					password
				};
			}
			const url = api.getUrlChangePassword(userLoginId);
			return new Promise(resolve => {
				api.postData(url, { data })
					.then(res => {
						if (res.errorCode) {
							let errorCode;
							if (typeof res.errorCode === 'object') {
								res.errorCode.forEach(element => {
									if (element !== null) {
										errorCode = element;
									}
								});
							} else {
								errorCode = res.errorCode;
							}
							if (errorCode === 2011) {
								const errorText = I18n.t('incorrectPassword');
								this.isMount &&
									this.setState({
										isError: true,
										errorText,
										isLoading: false,
										submitDisabled: true,
										cancelDisable: false
									});
								this.shake();
							} else if (errorCode === 2010) {
								const errorTextNew = I18n.t(
									'errorValidatePassword'
								);
								this.isMount &&
									this.setState({
										isErrorNew: true,
										errorTextNew,
										isLoading: false,
										submitDisabled: true,
										cancelDisable: false
									});
								this.shake();
							} else {
								const keyError =
									ENUM.ERROR_CODE_PASSWORD_MAPPING[errorCode] || '';
								const errorTextNew = keyError
									? I18n.t(keyError)
									: '';
								this.isMount &&
									this.setState({
										isErrorNew: true,
										errorTextNew,
										isLoading: false,
										submitDisabled: true,
										cancelDisable: false
									});
								this.shake();
							}
						} else {
							this.fadeOutAnim();
							setTimeout(() => {
								this.isMount &&
									this.setState({
										isLoading: false,
										value: {},
										submitDisabled: true,
										isSecureTextEntry: true,
										isSecureTextEntryNew: true,
										isSecureTextEntryConfirm: true,
										cancelDisable: false
									});
								this.props.onSubmit();
							}, 500);
						}
						resolve(res);
					})
					.catch(err => {
						// Log.logTest.error(err)
						resolve({});
					});
			});
		});
	}

	_onSubmitPress() {
		Keyboard.dismiss();
		this.setState({ isLoading: true, submitDisabled: true });
		this.requestTimeout && clearTimeout(this.requestTimeout);
		this.requestTimeout = setTimeout(() => {
			if (this.state.errorTextNew === '') {
				if (this.props.isConnected) {
					this.setState({ cancelDisable: true });
					this.postDataPassword();
				}
			}
		}, 2000);
	}

	renderInput(listData) {
		const data = [];
		listData.map((e, i) => {
			const secureText =
				e.id === 'new_password'
					? this.state.isSecureTextEntryNew
					: e.id === 'current_password'
					? this.state.isSecureTextEntry
					: this.state.isSecureTextEntryConfirm;
			const errorBorder =
				e.id === 'current_password'
					? this.state.isError
					: this.state.isErrorNew;
			data.push(
				<View
					style={{
						flexDirection: 'row',
						paddingHorizontal: 4,
						backgroundColor: CommonStyle.fontColorSwitchTrue,
						marginHorizontal: 24,
						marginVertical: 4,
						borderRadius: 8,
						width: 286,
						height: 48,
						justifyContent: 'center',
						alignItems: 'center'
					}}
					key={e.id}
				>
					<TextInput
						ref={ref => (this.refInput = ref)}
						testID={`${e.placeholder}`}
						style={[styles.dialogInput]}
						// selectionColor={CommonStyle.fontWhite}
						underlineColorAndroid="rgba(0,0,0,0)"
						defaultValue={e.defaultValue}
						value={this.state.value[e.id]}
						onChangeText={value => {
							this.onChangeText(value, e.id);
						}}
						autoCorrect={false}
						placeholderTextColor="rgba(255, 255, 255, 0.6) "
						secureTextEntry={secureText}
						placeholder={`${e.placeholder}`}
						autoFocus={e.id === 'current_password'}
						onFocus={() => {
							this.onFocus(e.id);
						}}
						onBlur={() => {
							// Keyboard.dismiss()
						}}
					/>
					<TouchableOpacity
						style={[styles.rightIcon]}
						activeOpacity={1}
						onPress={this._rightIconInputPress.bind(this, e.id)}
					>
						<Icon
							style={{
								opacity: secureText ? 1 : 0.4,
								color: CommonStyle.fontColor
							}}
							name={e.rightIcon}
							size={18}
						/>
					</TouchableOpacity>
				</View>
			);
		});
		return data;
	}

	_rightIconInputPress(id) {
		if (this.state.value[id] === '') return;
		if (id === 'current_password') {
			this.isMount &&
				this.setState({
					isSecureTextEntry: !this.state.isSecureTextEntry
				});
		} else if (id === 'new_password') {
			this.isMount &&
				this.setState({
					isSecureTextEntryNew: !this.state.isSecureTextEntryNew
				});
		} else {
			this.isMount &&
				this.setState({
					isSecureTextEntryConfirm: !this.state
						.isSecureTextEntryConfirm
				});
		}
	}

	renderButton() {
		const disabled = this.state.submitDisabled || !this.props.isConnected;
		return (
			<View style={styles.dialogFooter}>
				<TouchableOpacity
					onPress={this._onCancelPress.bind(this)}
					style={{
						borderWidth: 0.5,
						borderRadius: 100,
						borderColor: CommonStyle.fontColorButtonSwitch,
						width: '45%'
					}}
					disabled={this.state.cancelDisable}
				>
					<View style={[styles.dialogAction]}>
						<Text
							style={[
								styles.dialogActionText,
								{
									color: this.state.cancelDisable
										? CommonStyle.fontDisable
										: CommonStyle.fontColorButtonSwitch
								}
							]}
						>
							{this.props.cancelText}
						</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={this._onSubmitPress.bind(this)}
					style={{
						borderRadius: 100,
						width: '45%',
						justifyContent: 'flex-end',
						backgroundColor: disabled
							? CommonStyle.fontDisable
							: CommonStyle.fontColorButtonSwitch
					}}
					disabled={disabled}
				>
					<View style={[styles.dialogAction]}>
						{this.state.isLoading === true ? (
							<ActivityIndicator
								style={{ width: 24, height: 24 }}
								color="black"
							/>
						) : (
							<Text
								style={[
									styles.dialogActionText,
									{
										color: CommonStyle.fontDark,
										fontWeight: '500'
									}
								]}
							>
								{this.props.submitText}
							</Text>
						)}
					</View>
				</TouchableOpacity>
			</View>
		);
	}

	fadeInAnim = this.fadeInAnim.bind(this);
	fadeInAnim() {
		Animated.timing(this.opacityWrapperAnim, {
			toValue: 1,
			duration: 500
		}).start();
	}

	fadeOutAnim = this.fadeOutAnim.bind(this);
	fadeOutAnim() {
		Animated.timing(this.opacityWrapperAnim, {
			toValue: 0,
			duration: 500
		}).start();
	}

	render() {
		/**
		 * fix loi height sai tren mo vai thiet bi xiaomi, note 8
		 */
		const realHeight = Controller.getRealWindowHeight();
		const deviceHeight = Platform.OS === 'ios' ? height : realHeight;

		return (
			<TouchableWithoutFeedback
				onPress={() => {
					Keyboard.dismiss();
					this.refInput && this.refInput.blur();
				}}
			>
				<Animated.View
					style={{
						opacity: this.opacityWrapperAnim,
						position: 'absolute',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0
					}}
				>
					{Platform.OS === 'ios' ? (
						<KeyboardAvoidingView
							behavior="padding"
							style={{
								flex: 1,
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: CommonStyle.statusBarModal
							}}
						>
							<Animatable.View
								ref={ref => {
									if (ref) {
										this.wrapperRef = ref;
									}
								}}
							>
								<BlurView
									style={[
										styles.dialogContent2,
										{
											backgroundColor:
												CommonStyle.ColorTabNews
										}
									]}
								>
									<View style={[styles.dialogTitle]}>
										<Text
											style={[
												styles.dialogTitleText,
												{ color: CommonStyle.fontColor }
											]}
										>
											{this.props.title}
										</Text>
									</View>
									{this.renderInput(this.props.listData)}
									{this.state.errorText === '' &&
									this.state.errorTextNew === '' ? (
										<View
											style={{
												height: 16,
												width: '100%'
											}}
										></View>
									) : (
										<View style={styles.errorContainer}>
											<Text
												style={CommonStyle.textError2}
											>
												{this.state.errorText
													? this.state.errorText
													: this.state.errorTextNew}
											</Text>
										</View>
									)}
									{this.renderButton()}
								</BlurView>
							</Animatable.View>
						</KeyboardAvoidingView>
					) : (
						<View
							style={{
								flex: 1,
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: CommonStyle.statusBarModal
							}}
						>
							<Animatable.View
								ref={ref => {
									if (ref) {
										this.wrapperRef = ref;
									}
								}}
								style={[
									styles.dialogContent2,
									{
										borderRadius: 12,
										backgroundColor:
											CommonStyle.ColorTabNews
									}
								]}
							>
								<View style={[styles.dialogTitle]}>
									<Text
										style={[
											styles.dialogTitleText,
											{ color: CommonStyle.fontColor }
										]}
									>
										{this.props.title}
									</Text>
								</View>
								{this.renderInput(this.props.listData)}
								{this.state.errorText === '' &&
								this.state.errorTextNew === '' ? (
									<View
										style={{ height: 16, width: '100%' }}
									></View>
								) : (
									<View style={styles.errorContainer}>
										<Text style={CommonStyle.textError2}>
											{this.state.errorText
												? this.state.errorText
												: this.state.errorTextNew}
										</Text>
									</View>
								)}
								{this.renderButton()}
							</Animatable.View>
						</View>
					)}
				</Animated.View>
			</TouchableWithoutFeedback>
		);
	}
}

PasswordPrompt.PropTypes = {
	visible: false,
	listData: [],
	subtitle: '',
	title: '',
	cancelText: 'Cancel',
	submitText: 'OK',
	borderColor: '#ccc',
	onChangeText: PropTypes.func.isRequired,
	textInputProps: PropTypes.object
};

function mapStateToProps(state, ownProps) {
	return {
		setting: state.setting
	};
}

export default connect(mapStateToProps)(PasswordPrompt);
