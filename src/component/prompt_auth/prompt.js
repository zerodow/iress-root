import React, { Component } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import styles from './style/prompt.style';
import { BlurView } from 'react-native-blur';
import * as Animatable from 'react-native-animatable';
import PropTypes from 'prop-types'
import CommonStyle from '~/theme/theme_controller'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../../screens/login/login.actions';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Business from '../../business';
import * as Controller from '~/memory/controller'

const { height, width } = Dimensions.get('window');

export class Prompt extends Component {
	constructor(props) {
		super(props);
		const obj = {};
		for (let index = 0; index < this.props.listInput.length; index++) {
			const element = this.props.listInput[index];
			obj[element.id] = element.defaultValue;
		}
		this.state = {
			value: obj,
			visible: this.props.visible || false,
			submitDisabled: true,
			isFocus: false,
			errorText: '',
			isSecureTextEntry: true
		};

		this._renderInput = this._renderInput.bind(this);
		this._onChangeText = this._onChangeText.bind(this);
		this._renderSubtitle = this._renderSubtitle.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { visible, isError } = nextProps;
		this.setState({ visible }, () => {
			this.setState({
				isError
			});
		});
	}

	_onChangeText(value, id) {
		this.setState({ isError: false });
		const obj = this.state.value;
		obj[id] = value;
		let disabled = false;
		if (value === '') {
			disabled = true;
		}
		this.setState({ value: obj, submitDisabled: disabled });
		this.props.onChangeText(value);
	};

	_onSubmitPress() {
		this.props.actions.authRequest();
		const { value } = this.state;
		this.setState({ submitDisabled: true }, () => {
			this.props.onSubmit(value, this.close.bind(this), this.errorCallback.bind(this));
		});
	};

	_onCancelPress() {
		Keyboard.dismiss();
		this.props.actions.authCancel();
		const { value } = this.state;
		let temp = {};
		temp.username = value.username;
		temp.password = '';
		this.refs && this.refs.prompt && this.refs.prompt.fadeOut(1000);
		setTimeout(() => {
			Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor });
			this.setState({ value: temp, submitDisabled: true }, () => {
				this.props.onCancel();
			});
		}, 500)
	};

	close() {
		this.refs && this.refs.prompt && this.refs.prompt.fadeOut(1000);
		Keyboard.dismiss();
		setTimeout(() => {
			this.setState({ submitDisabled: false });
		}, 500)
	};

	_rightIconInputPress(id) {
		this.setState({
			isSecureTextEntry: !this.state.isSecureTextEntry
		}, () => {
			this.refInput && this.refInput.blur()
		})
	}

	errorCallback() {
		this.setState({ submitDisabled: false }, () => {
			this.refs && this.refs.prompt && this.refs.prompt.shake(500);
		});
	};

	_renderInput(listData) {
		const data = [];
		const {
			inputStyle
		} = this.props;
		listData.map((e, i) => {
			data.push(
				<View style={styles.dialogBody} key={e.id}>
					<TextInput
						ref={ref => this.refInput = ref}
						testID={`${e.placeholder}`}
						style={styles.dialogInput}
						// selectionColor={CommonStyle.fontWhite}
						underlineColorAndroid="rgba(0,0,0,0)"
						defaultValue={e.defaultValue}
						value={this.state.value[e.id]}
						onChangeText={(value) => {
							this._onChangeText(value, e.id);
						}}
						placeholderTextColor='rgba(255, 255, 255, 0.6) '
						secureTextEntry={this.state.isSecureTextEntry}
						placeholder={`${e.placeholder}`}
						// autoFocus={true}
						// autoFocus={e.id === 'username' ? !e.value : this.state.value['username'] ? true : this.state.value['password']}
						onFocus={() => {
							this.setState({ isFocus: true, id: e.id })
						}}
						onBlur={() => {
							this.setState({ isFocus: false, id: e.id })
						}}
						{...this.props.textInputProps} />
					<TouchableOpacity
						style={[styles.rightIcon]}
						activeOpacity={1}
						onPress={this._rightIconInputPress.bind(this)}>
						<Icon
							style={{ opacity: this.state.isSecureTextEntry ? 0.4 : 1, color: CommonStyle.fontColor, paddingRight: 4 }}
							name={e.rightIcon}
							size={18} />
					</TouchableOpacity>
				</View>
			);
		});
		return data;
	}

	_renderSubtitle() {
		if (!this.props.onSubtitle) {
			return (<View style={[styles.dialogSubTitle]}>
				<Text style={[styles.dialogSubTitleText, this.props.subtitleStyle, {
					color: CommonStyle.fontColor,
					marginTop: 4,
					fontSize: CommonStyle.fontSizeS - 1
				}]}>
					{this.props.subtitle}
				</Text>
			</View>);
		}
		return (<TouchableOpacity style={[styles.dialogSubTitle]} onPress={() => {
			this.props.onSubtitle();
			this.setState({ submitDisabled: false })
		}}>
			<Text style={[styles.dialogSubTitleText, this.props.subtitleStyle]}>
				{this.props.subtitle}
			</Text>
		</TouchableOpacity>);
	}

	setAnimationIn() {
		// this.refs && this.refs.prompt && this.refs.prompt.fadeInUpBig(800);
		this.refs && this.refs.prompt && this.refs.prompt.fadeIn(200);
		setTimeout(() => {
			this.refInput && this.refInput.focus()
		}, 500)
	}

	_renderDialog() {
		const {
			title,
			listInput,
			cancelText,
			submitText,
			titleStyle,
			titleContainerStyle,
			buttonTextStyle,
			buttonStyle,
			submitButtonStyle,
			submitButtonTextStyle,
			cancelButtonStyle
		} = this.props;
		return (
			<Animatable.View
				testID={'PromtModal'}
				style={[styles.dialog]}
				key={'prompt'}>
				{
					Platform.OS === 'ios'
						? <KeyboardAvoidingView
							behavior={'padding'}
							style={[styles.dialog]}>
							<Animatable.View ref={'prompt'}>
								<BlurView style={[styles.dialogContent2, { backgroundColor: CommonStyle.ColorTabNews }]}>
									<Animatable.View>
										<View style={styles.dialogTitle}>
											<Text style={styles.dialogTitleText}>
												{title}
											</Text>
										</View>
										{
											this._renderSubtitle()
										}
										{
											this._renderInput(listInput)
										}
										{
											this.state.errorText === '' ? <View style={{ height: 20, width: '100%' }} />
												: <View style={styles.errorContainer}>
													<Text style={CommonStyle.textError2}>
														{this.state.errorText}
													</Text>
												</View>
										}
										<View style={styles.dialogFooter}>
											<TouchableOpacity
												testID={'CancelButton'}
												onPress={this._onCancelPress.bind(this)}
												style={{
													borderWidth: 0.5,
													borderRadius: 100,
													borderColor: CommonStyle.fontColorButtonSwitch,
													width: '45%'
												}}>
												<View style={styles.dialogAction}>
													<Text
														style={styles.dialogActionText}>
														{cancelText}
													</Text>
												</View>
											</TouchableOpacity>
											<TouchableOpacity
												testID={'SubmitButton'}
												onPress={this._onSubmitPress.bind(this)}
												style={{
													borderRadius: 100,
													width: '45%',
													backgroundColor: this.state.submitDisabled ? CommonStyle.fontNearLight2 : CommonStyle.fontColorButtonSwitch
												}}
												disabled={this.state.submitDisabled}>
												<View style={styles.dialogAction}>
													{
														this.props.isLoading
															? <ActivityIndicator
																style={{ width: 24, height: 24 }}
																color={'black'} />
															: this.props.isAuthLoading
																? <ActivityIndicator
																	style={{ width: 24, height: 24 }}
																	color='black' />
																: <Text style={[styles.dialogActionText, {
																	color: CommonStyle.fontDark,
																	fontWeight: '500'
																}]}>
																	{submitText}
																</Text>
													}
												</View>
											</TouchableOpacity>
										</View>
									</Animatable.View>
								</BlurView>
							</Animatable.View>
						</KeyboardAvoidingView>
						: <View style={styles.dialog}>
							<Animatable.View ref={'prompt'}>
								<View style={[styles.dialogContent2, { backgroundColor: CommonStyle.ColorTabNews }]}>
									<Animatable.View>
										<View style={styles.dialogTitle}>
											<Text style={styles.dialogTitleText}>
												{title}
											</Text>
										</View>
										{
											this._renderSubtitle()
										}
										{
											this._renderInput(listInput)
										}
										{
											this.state.errorText === '' ? <View style={{ height: 20, width: '100%' }} />
												: <View style={styles.errorContainer}>
													<Text style={CommonStyle.textError2}>
														{this.state.errorText}
													</Text>
												</View>
										}
										<View style={styles.dialogFooter}>
											<TouchableOpacity
												testID={'CancelButton'}
												onPress={this._onCancelPress.bind(this)}
												style={{
													borderWidth: 0.5,
													borderRadius: 100,
													borderColor: CommonStyle.fontColorButtonSwitch,
													width: '45%'
												}}>
												<View style={styles.dialogAction}>
													<Text style={[styles.dialogActionText]}>
														{cancelText}
													</Text>
												</View>
											</TouchableOpacity>

											<TouchableOpacity
												testID={'SubmitButton'}
												onPress={this._onSubmitPress.bind(this)}
												style={{
													borderWidth: 0.5,
													borderRadius: 100,
													borderColor: this.state.submitDisabled
														? CommonStyle.fontDisable
														: CommonStyle.fontColorButtonSwitch,
													width: '45%',
													backgroundColor: this.state.submitDisabled
														? CommonStyle.fontDisable
														: CommonStyle.fontColorButtonSwitch
												}}
												disabled={this.state.submitDisabled}>
												<View style={styles.dialogAction}>
													{
														this.props.isLoading
															? <ActivityIndicator
																style={{ width: 24, height: 24 }}
																color={'black'} />
															: this.props.isAuthLoading
																? <ActivityIndicator
																	style={{ width: 24, height: 24 }}
																	color='black' />
																: <Text style={[styles.dialogActionText, {
																	color: CommonStyle.fontDark,
																	fontWeight: '500'
																}]}>
																	{submitText}
																</Text>
													}
												</View>
											</TouchableOpacity>
										</View>
									</Animatable.View>
								</View>
							</Animatable.View>
						</View>
				}
			</Animatable.View>
		);
	};

	onShow = this.onShow.bind(this)
	onShow() {
		Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarModal })
		this.timeoutFocusTextInput && clearTimeout(this.timeoutFocusTextInput)
		this.timeoutFocusTextInput = setTimeout(() => {
			this.refInput && this.refInput.focus()
		}, 200)
	}

	onDismiss = this.onDismiss.bind(this)
	onDismiss() {
		Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
	}

	onModalHide = this.onModalHide.bind(this)
	onModalHide() {
		Keyboard.dismiss();
	}

	render() {
		/**
		 * fix loi height sai tren mo vai thiet bi xiaomi, note 8
		 */
		const realHeight = Controller.getRealWindowHeight();
		const deviceHeight = Platform.OS === 'ios'
			? height
			: realHeight;

		return (
			<Modal
				onShow={this.onShow}
				onDismiss={this.onDismiss}
				isVisible={this.state.visible}
				animationIn={'fadeIn'}
				animationInTiming={1000}
				deviceHeight={deviceHeight}
				animationOut={'fadeOut'}
				animationOutTiming={1000}
				onModalHide={this.onModalHide}
				backdropColor={CommonStyle.backgroundColorNews}
			>
				{this._renderDialog()}
			</Modal>
		);
	}
}

Prompt.defaultProps = {
	visible: false,
	listInput: [],
	subtitle: '',
	title: '',
	cancelText: 'Cancel',
	submitText: 'OK',
	borderColor: '#ccc',
	promptStyle: {},
	titleStyle: {},
	subtitleStyle: {},
	buttonStyle: {},
	buttonTextStyle: {},
	submitButtonStyle: {},
	submitButtonTextStyle: {},
	cancelButtonStyle: {},
	cancelButtonTextStyle: {},
	inputStyle: {},
	onChangeText: () => {
	}
};

Prompt.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
	visible: PropTypes.bool,
	listInput: PropTypes.array,
	onCancel: PropTypes.func.isRequired,
	cancelText: PropTypes.string,
	onSubmit: PropTypes.func.isRequired,
	submitText: PropTypes.string,
	onChangeText: PropTypes.func.isRequired,
	onSubtitle: PropTypes.func,
	borderColor: PropTypes.string,
	promptStyle: PropTypes.object,
	titleStyle: PropTypes.object,
	subtitleStyle: PropTypes.object,
	buttonStyle: PropTypes.object,
	buttonTextStyle: PropTypes.object,
	submitButtonStyle: PropTypes.object,
	submitButtonTextStyle: PropTypes.object,
	cancelButtonStyle: PropTypes.object,
	cancelButtonTextStyle: PropTypes.object,
	inputStyle: PropTypes.object,
	textInputProps: PropTypes.object
};

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

export default connect(mapStateToProps, mapDispatchToProps)(Prompt);
