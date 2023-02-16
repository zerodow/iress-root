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
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import config from '../../../src/config'
import styles from './style/style'
import { connect } from 'react-redux';
import ErrorAnimation from '../../component/error_animation/error_animation'
import Pin from '../../../src/component/pin/pin'
import ENUM from '../../enum'
import { iconsMap } from '../../utils/AppIcons';
import { logDevice, translateErrorCode } from '../../../src/lib/base/functionUtil'
import * as Api from '../../../src/api'
import Datastore from 'react-native-local-mongodb';
import * as Controller from '../../memory/controller'
import { nextPage } from '../trade/trade.actions';

class VerifyEmailCode extends Component {
	constructor(props) {
		super(props)
		this.confirmFn = this.confirmFn.bind(this)
		this.setNavigatorButton = this.setNavigatorButton.bind(this)
		this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
		this.startCountDown = this.startCountDown.bind(this)
		this.switchType = this.switchType.bind(this)
		this.sendCode = this.sendCode.bind(this)
		this.onChangeBeforeComplete = this.onChangeBeforeComplete.bind(this)
		this.successVerifyCodeCb = this.successVerifyCodeCb.bind(this)
		this.errorVerifyCodeCb = this.errorVerifyCodeCb.bind(this)
		this.showError = this.showError.bind(this)
		this.errorChangeMailCb = this.errorChangeMailCb.bind(this)
		this.successChangeMailCb = this.successChangeMailCb.bind(this)

		this.state = {
			isSendStatus: true,
			timeCountDown: 60,
			disableConfirm: true,
			isExpand: false,
			errorText: ''
		}
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.isConnected === false) {
			this.props.navigator.setButtons(
				{
					leftButtons: [{
						id: 'back_button',
						disabled: true,
						title: I18n.t('back')
					}]
				}
			)
		} else {
			this.props.navigator.setButtons(
				{
					leftButtons: [{
						id: 'back_button',
						title: I18n.t('back')
					}]
				}
			)
		}
	}
	startCountDown() {
		this.switchType(false, 60)
		this.intervalCountDown && clearInterval(this.intervalCountDown)
		this.intervalCountDown = setInterval(() => {
			if (this.state.timeCountDown === 0) {
				this.stopCountDown()
			} else {
				this.setState({
					timeCountDown: this.state.timeCountDown - 1
				})
			}
		}, 1000)
	}

	stopCountDown() {
		this.switchType(true)
		this.intervalCountDown && clearInterval(this.intervalCountDown)
	}

	switchType(isSendStatus = true, timeCountDown = 0) {
		this.setState({
			isSendStatus,
			timeCountDown
		})
	}
	successChangeMailCb() {
		console.log('success send code')
	}

	errorChangeMailCb(errorCode) {
		console.log('error send code')
		this.setState({
			isExpand: true,
			errorText: translateErrorCode(errorCode)
		})
	}
	sendCode() {
		this.startCountDown()
		const url = Api.getUrlVerifyEmail()
		const data = {
			data: {
				email: this.props.email
			}
		}
		Api.httpPost(url, data).then(data => {
			console.log('RESEND CODE STATUS ' + data)
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
	}
	componentDidMount() {
		this.setNavigatorButton()
	}
	onPressLeftButton() {
		this.props.navigator.pop({
			animated: true,
			animationType: 'slide-horizontal'
		})
		console.log('press left button')
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
	onPressRightButton() {
		this.props.navigator.push({
			animated: true,
			animationType: 'slide-horizontal'
		})
	}

	successVerifyCodeCb() {
		Controller.setUserVerify(1)
		this.props.navigator.dismissModal()
	}

	errorVerifyCodeCb(errorCode) {
		this.setState({
			isExpand: true,
			errorText: translateErrorCode(errorCode) || 'unknown_error'
		}, () => {
			this.props.navigator.setButtons({
				rightButtons: [{
					id: 'confirm_button',
					disabled: true,
					buttonColor: 'rgba(242, 242, 242, 0.3)',
					title: I18n.t('confirm')
				}]
			})
		})
	}

	confirmFn() {
		const url = Api.getUrlVerifyDigitCodeEmail()
		const data = {
			data: {
				verify_code: this.pinInput.getPin()
			}
		}
		Api.httpPost(url, data).then(data => {
			if (data.status && data.status === 200) {
				this.successVerifyCodeCb()
			} else {
				const errorCode = data.errorCode
				logDevice('error', `ERROR CODE VERIFY CODE MAIL: ${errorCode}`)
				this.errorVerifyCodeCb(errorCode)
			}
		})
			.catch(err => {
				logDevice('error', `ERROR POST VERIFY CODE EMAIL: ${err}`)
				this.errorVerifyCodeCb()
			})
	}

	onChangeBeforeComplete() {
		const lengthPin = this.pinInput.getPin().length;
		if (lengthPin < 6) {
			this.props.navigator.setButtons({
				rightButtons: [{
					id: 'confirm_button',
					disabled: true,
					buttonColor: 'rgba(242, 242, 242, 0.3)',
					title: I18n.t('confirm')
				}]
			})
		}
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'back_button':
					this.props.navigator.pop({
						animated: true,
						animationType: 'slide-horizontal'
					})
					break;
				case 'confirm_button':
					console.log('confirm button')
					break;
			}
		}
	}
	setNavigatorButton() {
		this.props.navigator.setButtons({
			leftButtons: [{
				id: 'back_button',
				icon: iconsMap['ios-arrow-back'],
				title: I18n.t('back')
			}],
			rightButtons: [{
				id: 'confirm_button',
				disabled: this.state.disableConfirm,
				buttonColor: this.state.disableConfirm ? 'rgba(242, 242, 242, 0.6)' : 'rgba(242, 242, 242, 1)',
				title: I18n.t('confirm')
			}]
		})
	}

	_onPinCompleted() {
		this.props.navigator.setButtons({
			rightButtons: [{
				id: 'confirm_button',
				component: 'equix.CustomButton'
			}]
		})
		setTimeout(() => {
			this.confirmFn && this.confirmFn()
		}, 500)
	}

	render() {
		const decriptionText = I18n.t('placeHolderDigitCode');
		const headerLeftText = I18n.t('back');
		const headerRightText = I18n.t('confirm');
		const remindText = I18n.t('enterMailRemind');
		const { errorTxt, wrapperErrorTxt } = styles
		return (
			<View style={{ flex: 1, backgroundColor: '#EFEFEF' }}>
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
				<View style={[styles.containerDecription, { paddingBottom: 50, height: 116 }]}>
					<Text style={[styles.decriptionText]}>{decriptionText}</Text>
				</View>
				<Pin
					marginTop={0}
					marginHorizontal={32}
					onRef={ref => this.pinInput = ref}
					onChangeBeforeComplete={this.onChangeBeforeComplete}
					onPinCompleted={this._onPinCompleted.bind(this)}
				/>
				<View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
					{this.state.isSendStatus
						? <TouchableOpacity onPress={this.sendCode}>
							<Text style={[styles.sendCode]}>{I18n.t('sendCode')}</Text>
						</TouchableOpacity>
						: <TouchableOpacity disabled={true}>
							<Text style={[styles.sendCode, { opacity: 0.54 }]}>{I18n.t('resendCode')} ({this.state.timeCountDown})</Text>
						</TouchableOpacity>
					}
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
)(VerifyEmailCode);
