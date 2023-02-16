import React, { Component } from 'react';
import {
	ScrollView,
	TextInput,
	Text,
	TouchableOpacity,
	View,
	Dimensions,
	Platform,
	Image,
	Keyboard,
	PixelRatio
} from 'react-native';
import { Form, Item, Input, Label } from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';
import ProgressBar from '../../modules/_global/ProgressBarLight';
import { iconsMap } from '../../utils/AppIcons';
import styles from './style/login';
import firebase from '../../firebase';
import { dataStorage } from '../../storage';
import background from '../../img/nv_equix_04_b.png';
import logoEquix from '../../img/equixUI-logo-01.png';
import logoQuantEdge from '../../img/logoQE-06.png';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from './login.actions';
import { FormLabel, FormInput } from 'react-native-elements';
import { MKTextField, MKColor } from 'react-native-material-kit';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { logAndReport } from '../../lib/base/functionUtil';
const { height, width } = Dimensions.get('window');
const TextfieldWithFloatingLabel = MKTextField.textfieldWithFloatingLabel()
	.withStyle(styles.textfieldWithFloatingLabel)
	.withTextInputStyle({
		flexGrow: 1,
		flex: 0,
		fontSize: CommonStyle.fontSizeM,
		color: '#ffffff',
		fontFamily: CommonStyle.fontFamily
	})
	.withPlaceholderTextColor('#ffffffb2')
	.withHighlightColor('#FFFFFFFF')
	.withTintColor('#ffffffb2')
	.withUnderlineSize(1)
	.withFloatingLabelFont({
		opacity: CommonStyle.opacity2,
		fontFamily: CommonStyle.fontLight,
		fontSize: CommonStyle.fontSizeXS,
		color: '#ffffff'
	})
	.build();

export class Login extends Component {
	constructor(props) {
		super(props);
		this.error = '';
		this.state = {
			email: this.props.login.email,
			password: '',
			forgotPass: false,
			isShowKeyboard: false,
			errorLogin: ''
		};
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					this.props.actions.loadForm(this.props.navigator);
					break;
				case 'didAppear':
					break;
				case 'willDisappear':
					this.props.actions.closeForm();
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	componentDidMount() {
		this.keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			this._keyboardDidShow.bind(this)
		);
		this.keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			this._keyboardDidHide.bind(this)
		);
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	_keyboardDidShow() {
		this.setState({ isShowKeyboard: true });
	}

	_keyboardDidHide() {
		this.setState({ isShowKeyboard: false });
	}

	switchView() {
		try {
			if (this.props.login.forgotPass) {
				return (
					<ScrollView
						scrollEnabled={false}
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
						keyboardShouldPersistTaps={'handled'}
						style={[
							styles.container,
							...Platform.select({
								ios: {},
								android: {
									marginTop: 55
								}
							})
						]}
					>
						<Image
							source={background}
							style={{ width: '100%', height: height }}
						>
							<TouchableOpacity
								test_id={'close'}
								onPress={() => {
									this.props.actions.forgotState();
								}}
							>
								<View style={{ height: 40, width: 40 }}>
									<Icon
										name="ios-arrow-back"
										size={32}
										style={{
											backgroundColor: 'transparent',
											padding: 16
										}}
										color="#FFFFFF"
									/>
								</View>
							</TouchableOpacity>

							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<View
									style={{
										justifyContent: 'center',
										position: 'absolute',
										top: 50
									}}
								>
									<Image
										style={{ width: 200, height: 64 }}
										source={logoEquix}
									/>
								</View>
								<View
									style={{
										backgroundColor: 'transparent',
										height: '15%'
									}}
								>
									<View
										style={{
											height: 24,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Text
											style={[
												CommonStyle.textSubNormalNoColor,
												{ color: '#FFFFFF' }
											]}
										>
											{I18n.t('RecoverYourPassword', {
												locale: this.props.setting.lang
											})}
										</Text>
									</View>
									<View
										style={{
											height: 24,
											justifyContent: 'center',
											alignItems: 'center'
										}}
									>
										<Text
											style={[
												CommonStyle.textSubNormalNoColor,
												{ color: '#FFFFFF' }
											]}
										>
											{I18n.t('PleaseEnterYourEmail', {
												locale: this.props.setting.lang
											})}
										</Text>
									</View>
								</View>
								<View
									style={{
										width: '70%',
										justifyContent: 'center'
									}}
								>
									<TextfieldWithFloatingLabel
										placeholder={I18n.t('email', {
											locale: this.props.setting.lang
										})}
										autoFocus={true}
										autoCapitalize="none"
										keyboardType={'email-address'}
										value={this.props.login.email}
										onTextChange={(text) =>
											this.setState({ email: text })
										}
									/>
								</View>
								<View
									style={{
										width: '70%',
										paddingTop: 32,
										flexDirection: 'row'
									}}
								>
									<TouchableOpacity
										test_id={'forgotPass'}
										style={{
											backgroundColor: 'transparent',
											width: '100%',
											flexDirection: 'column',
											justifyContent: 'flex-start'
										}}
										onPress={() => {
											Keyboard.dismiss();
											this.props.actions.forgotPass(
												this.props.login.email
											);
										}}
									>
										<Text style={styles.submitButton}>
											{I18n.t('sentUpper', {
												locale: this.props.setting.lang
											})}
										</Text>
									</TouchableOpacity>
								</View>
								<View
									style={{
										justifyContent: 'center',
										position: 'absolute',
										bottom: 56
									}}
								>
									<Image
										source={logoQuantEdge}
										style={{ width: 195, height: 25 }}
									/>
								</View>
							</View>
						</Image>
					</ScrollView>
				);
			} else {
				let isValid = true;
				if (
					this.props.login.email === '' ||
					this.state.password === ''
				) {
					isValid = false;
				} else {
					isValid = true;
				}
				let bottom = Platform.OS === 'ios' ? 50 : 70;
				return (
					<ScrollView
						scrollEnabled={false}
						keyboardShouldPersistTaps={'handled'}
						style={[
							styles.container,
							...Platform.select({
								ios: {},
								android: {
									marginTop: 55
								}
							})
						]}
					>
						<View
							style={{
								width: '100%',
								bottom: this.state.isShowKeyboard ? bottom : 0
							}}
						>
							<Image
								source={background}
								style={{ width: '100%', height: height }}
							>
								<TouchableOpacity
									test_id="close"
									onPress={() => {
										this.props.navigator.dismissAllModals({
											animationType: 'slide-down' // 'none' / 'slide-down' , dismiss animation for the modal (optional, default 'slide-down')
										});
									}}
								>
									<View style={{ height: 40, width: 40 }}>
										<Icon
											name="ios-arrow-back"
											size={32}
											color="#FFFFFF"
											style={{
												backgroundColor: 'transparent',
												padding: 16
											}}
										/>
									</View>
								</TouchableOpacity>

								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<View
										style={{
											justifyContent: 'center',
											position: 'absolute',
											top: 50
										}}
									>
										<Image
											style={{ width: 200, height: 64 }}
											source={logoEquix}
										/>
									</View>
									<View
										style={{
											flex: 1,
											width: '70%',
											justifyContent: 'center'
										}}
									>
										<Item floatingLabel>
											<Label
												style={
													CommonStyle.textFloatingLabelWhite
												}
											>
												{I18n.t('email', {
													locale: this.props.setting
														.lang
												})}
											</Label>
											<Input
												style={styles.inputText}
												autoFocus={
													this.props.login.email.trim() ===
													''
												}
												autoCapitalize="none"
												keyboardType={'email-address'}
												value={this.props.login.email}
												onChangeText={(text) =>
													this.props.actions.changeEmail(
														text
													)
												}
												onSubmitEditing={() =>
													Keyboard.dismiss()
												}
											/>
										</Item>

										<Item
											floatingLabel
											style={{ marginTop: 20 }}
										>
											<Label
												style={
													CommonStyle.textFloatingLabelWhite
												}
											>
												{I18n.t('password', {
													locale: this.props.setting
														.lang
												})}
											</Label>
											<Input
												style={styles.inputText}
												autoFocus={
													this.props.login.email.trim() !==
													''
												}
												ref="secondInput"
												autoCapitalize="none"
												secureTextEntry={true}
												value={this.state.password}
												onChangeText={(text) => {
													this.setState({
														password: text
													});
												}}
												onSubmitEditing={() =>
													this.props.actions.login(
														this.props.login.email,
														this.state.password,
														null,
														null,
														this.props.successFn,
														this.props.params
													)
												}
											/>
										</Item>

										<TouchableOpacity
											test_id={'login'}
											disabled={!isValid}
											style={{
												backgroundColor: 'transparent',
												paddingTop: 24
											}}
											onPress={() => {
												Keyboard.dismiss();
												this.props.actions.login(
													this.props.login.email,
													this.state.password,
													null,
													null,
													this.props.successFn,
													this.props.params
												);
											}}
										>
											<Text
												style={[
													styles.submitButton,
													{
														backgroundColor: isValid
															? '#ffffff'
															: '#ffffff54',
														borderColor: isValid
															? '#ffffff'
															: '#ffffff54'
													}
												]}
											>
												{I18n.t('loginUpper', {
													locale: this.props.setting
														.lang
												})}
											</Text>
										</TouchableOpacity>

										<TouchableOpacity
											test_id={'forgot'}
											style={{
												backgroundColor: 'transparent',
												paddingTop: 24,
												alignItems: 'center'
											}}
											onPress={() => {
												Keyboard.dismiss();
												this.props.actions.forgotState();
											}}
										>
											<Text style={styles.labelButton}>
												{I18n.t('forgotPassword', {
													locale: this.props.setting
														.lang
												})}
											</Text>
										</TouchableOpacity>

										<View style={styles.errorContainer}>
											<Text
												style={CommonStyle.textError2}
											>
												{this.props.login.error}
											</Text>
										</View>
									</View>
									<View
										style={{
											justifyContent: 'center',
											position: 'absolute',
											bottom: 56
										}}
									>
										<Image
											style={{ width: 195, height: 25 }}
											source={logoQuantEdge}
										/>
									</View>
								</View>
							</Image>
						</View>
					</ScrollView>
				);
			}
		} catch (error) {
			logAndReport(
				'switchView login exception',
				error,
				'switchView login'
			);
		}
	}

	render() {
		const view = this.switchView();
		const loading = (
			<ScrollView
				keyboardShouldPersistTaps={'handled'}
				scrollEnabled={false}
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				style={[
					styles.container,
					...Platform.select({
						ios: {},
						android: {
							marginTop: 55
						}
					})
				]}
			>
				<Image
					source={background}
					style={{ width: '100%', height: height }}
				>
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<View
							style={{
								justifyContent: 'center',
								position: 'absolute',
								top: 50
							}}
						>
							<Image
								source={logoEquix}
								style={{ width: 200, height: 64 }}
							/>
						</View>
						<ProgressBar color="#FFFFFF" />
						<View
							style={{
								justifyContent: 'center',
								position: 'absolute',
								bottom: 56
							}}
						>
							<Image
								style={{ width: 195, height: 25 }}
								source={logoQuantEdge}
							/>
						</View>
					</View>
				</Image>
			</ScrollView>
		);

		return this.props.login.isLoading ? loading : view;
	}
}

function mapStateToProps(state, ownProps) {
	return {
		login: state.login,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
