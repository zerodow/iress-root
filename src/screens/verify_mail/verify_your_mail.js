import React, { Component } from 'react';
import {
	View, Text, TouchableOpacity, Switch, Platform,
	ScrollView, Image, TextInput, Keyboard, ActivityIndicator,
	PixelRatio, Dimensions, Animated
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage, func } from '../../storage';
import I18n from '../../modules/language/';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import config from '../../../src/config'
import ErrorAnimation from '../../component/error_animation/error_animation'
import styles from './style/style'
import ENUM from '../../enum'
import { logDevice, translateErrorCode } from '../../../src/lib/base/functionUtil'
import * as Api from '../../../src/api'
import * as Controller from '../../memory/controller'

class VerifyYourMail extends Component {
	constructor(props) {
		super(props)
		this.clearEmail = this.clearEmail.bind(this)
		this.successChangeMailCb = this.successChangeMailCb.bind(this)
		this.errorChangeMailCb = this.errorChangeMailCb.bind(this)
		this.changeMailFn = this.changeMailFn.bind(this)
		this.validateEmail = this.validateEmail.bind(this)
		this.showError = this.showError.bind(this)
		this.state = {
			email: Controller.getEmail(),
			enableRightButtons: true,
			isExpand: false,
			errorText: ''
		}
	}
	successChangeMailCb() {
		this.props.navigator.push({
			screen: 'equix.VerifyEmailCode',
			animated: true,
			title: 'Verify Your Mail',
			animationType: 'slide-horizontal',
			backButtonTitle: 'back',
			navigatorStyle: {
				statusBarColor: config.background.statusBar,
				statusBarTextColorScheme: 'light',
				navBarBackgroundColor: CommonStyle.statusBarBgColor,
				navBarTextColor: '#fff',
				drawUnderNavBar: false,
				navBarHideOnScroll: false,
				navBarButtonColor: '#fff',
				navBarTextFontSize: 18,
				textAlign: 'center',
				navBarTextFontFamily: 'HelveticaNeue-Medium',
				navBarNoBorder: true,
				navBarSubtitleColor: 'white',
				navBarSubtitleFontFamily: 'HelveticaNeue',
				justifyContent: 'center',
				alignItems: 'center'
			},
			passProps: {
				email: this.state.email
			}
		})
	}

	errorChangeMailCb(errorCode) {
		this.setState({
			isExpand: true,
			errorText: translateErrorCode(errorCode) || 'unknown_error'
		})
	}

	translateErrorCode(errorCode) {
		if (!errorCode) return ''
		const keyLanguage = ENUM.ERROR_CODE_PASSWORD_MAPPING[errorCode]
		if (!keyLanguage) return ''
		return I18n.t(keyLanguage)
	}

	validateEmail(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line no-useless-escape
		if (re.test(String(email).toLowerCase())) {
			return true
		} else {
			return false
		}
	}

	showError(errorCode) {
		let isExpand = false;
		let errorText = ''

		if (errorCode !== '') {
			errorText = translateErrorCode(errorCode) || 'unknown_error'
			isExpand = true
		}
		return this.setState({
			errorText,
			isExpand
		})
	}

	changeMailFn() {
		const validateEmail = this.validateEmail(this.state.email)
		if (validateEmail) {
			const email = this.state.email.toLowerCase()
			const url = Api.getUrlVerifyEmail()
			const data = {
				data: {
					email: email
				}
			}
			Api.httpPost(url, data).then(data => {
				if (data.status && data.status === 200) {
					this.successChangeMailCb()
				} else {
					const errorCode = data.errorCode
					logDevice('error', `ERROR CODE CHANGE MAIL: ${errorCode}`)
					this.errorChangeMailCb(errorCode)
				}
			})
				.catch(err => {
					logDevice('error', `ERROR POST CHANGE EMAIL: ${err}`)
					this.errorChangeMailCb()
				})
		} else {
			this.setState({
				isExpand: true,
				errorText: translateErrorCode('EMAIL_FORMAT_ERROR')
			})
		}
	}

	onPressLeftButton() {
		this.props.navigator.dismissModal({
			animationType: 'slide-down'
		})
	}

	onPressRightButton() {
		this.changeMailFn()
	}

	clearEmail() {
		this.setState({
			email: '',
			enableRightButtons: false
		})
	}

	onChangeText(email) {
		if (email === '') {
			this.setState({
				email,
				enableRightButtons: false
			})
		} else {
			this.setState({
				email,
				enableRightButtons: true
			})
		}
	}

	render() {
		const decriptionText = I18n.t('enterYourMail');
		const headerLeftText = I18n.t('cancel');
		const headerRightText = I18n.t('next');
		const remindText1 = I18n.t('enterMailRemind1')
		const remindText2 = I18n.t('enterMailRemind2')
		const { errorTxt, wrapperErrorTxt, containerDecription } = styles
		return (
			<View style={{ flex: 1, backgroundColor: '#EFEFEF' }}>
				<View style={[styles.searchBarContainer3, { backgroundColor: CommonStyle.statusBarBgColor, flexDirection: 'row' }]}>
					<TouchableOpacity
						onPress={this.onPressLeftButton.bind(this)}
						style={{ flex: 0.25, justifyContent: 'center', alignItems: 'flex-start' }}
					>
						<Text style={[styles.headerButton, { paddingLeft: 16 }]}>{headerLeftText}</Text>
					</TouchableOpacity>
					<View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
						<Text style={[styles.headerButton, { fontSize: CommonStyle.fontSizeL }]}>{I18n.t('verifyYourMail')}</Text>
					</View>
					<TouchableOpacity onPress={this.onPressRightButton.bind(this)} style={{ flex: 0.25, justifyContent: 'center', alignItems: 'flex-end', opacity: this.props.isConnected ? (this.state.enableRightButtons ? 1 : 0.6) : 0.6 }} disabled={this.props.isConnected ? (!this.state.enableRightButtons) : true}>
						<Text style={[styles.headerButton, { paddingRight: 16 }]}>{headerRightText}</Text>
					</TouchableOpacity>
				</View>
				<View style={{ height: 50 }}>
					<ErrorAnimation
						isExpand={this.state.isExpand}
						textStyle={errorTxt}
						errorStyle={wrapperErrorTxt}
						errorText={this.state.errorText}
						callbackHideError={this.showError}
						duration={500}
						timeOutErrorHidden={ENUM.TIMEOUT_HIDE_ERROR} />
				</View>
				<View style={[containerDecription, { paddingBottom: 50, height: 116 }]}>
					<Text style={[styles.decriptionText]}>{decriptionText}</Text>
				</View>
				<View style={[styles.containerInputMail]}>
					<Text style={[styles.inputText, { marginHorizontal: 16, marginVertical: 12 }]}>{I18n.t('email')}</Text>
					<TextInput style={[styles.inputText, { height: '100%', width: '65%' }]}
						value={this.state.email}
						onChangeText={(email) => this.onChangeText(email)}
					>
					</TextInput>
					<TouchableOpacity style={{ paddingLeft: 16, marginVertical: 12 }} testID={`removeVerifyEmail`} activeOpacity={1} onPress={this.clearEmail.bind(this)}>
						<Ionicons style={[styles.iconClear]} name={'md-close'} size={20} />
					</TouchableOpacity>
				</View>
				<View style={{ marginTop: 16, flexDirection: 'row', marginHorizontal: 32 }} >
					<Text>
						<Text style={[styles.remindText]}>{remindText1}</Text>
						<Text style={[styles.mail]}>{Controller.getEmail()}</Text>
						<Text style={[styles.remindText]}>{remindText2}</Text>
					</Text>
				</View>
			</View>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected
	};
}

export default connect(
	mapStateToProps
)(VerifyYourMail);
