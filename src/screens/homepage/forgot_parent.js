import React, { Component } from 'react';
import {
	View,
	Text,
	Platform,
	Dimensions,
	PixelRatio,
	Keyboard,
	InteractionManager,
	TextInput,
	ActivityIndicator
} from 'react-native';
import {
	logDevice,
	logAndReport
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language';
import { bindActionCreators } from 'redux';
import styles from './style/home_page';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
// Business
import * as AuthBusiness from '../../channel/auth_business'
// Lib
import * as Emitter from '@lib/vietnam-emitter'

// Enum
import ENUM from '../../enum'

// Component
import ForgotPassword from './forgot_password'
import ForgotUsername from './forgot_username'
import CompleteSignUp from './complete_sign_up'
import XComponent from '../../component/xComponent/xComponent'

const { height, width } = Dimensions.get('window');
export default class ForgotParent extends XComponent {
	constructor(props) {
		super(props);

		this.init = this.init.bind(this)
		this.bindAllFunc = this.bindAllFunc.bind(this)
		this.bindAllFunc()
		this.init()
	}

	init() {
				this.state = {
			type: ENUM.SIGN_IN_SCREEN_SWITCH.COMPLETE_SIGN_UP
		};
		return true
	}

	bindAllFunc() {
		try {
			this.renderByType = this.renderByType.bind(this)
			this.switchScreen = this.switchScreen.bind(this)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	componentDidMount() {
		try {
			super.componentDidMount()
			const eventName = AuthBusiness.getChannelSwitchForgotScreen()
			Emitter.addListener(eventName, this.id, obj => {
				const { type, callback } = obj
				this.switchScreen(type, callback)
			})
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	switchScreen(type, callback) {
		this.setState({
			type
		}, () => {
			callback && callback()
		})
		return true
	}

	renderByType() {
		switch (this.state.type) {
			case ENUM.SIGN_IN_SCREEN_SWITCH.FORGOT_USERNAME:
				// forgot username
				return <ForgotUsername cancelFn={this.props.cancelFn} />
			case ENUM.SIGN_IN_SCREEN_SWITCH.FORGOT_PASSWORD:
				// forgot password
				return <ForgotPassword cancelFn={this.props.cancelFn} />
			default:
				// complete sign up
				return <CompleteSignUp cancelFn={this.props.cancelFn} />
		}
	}

	render() {
		return (
			this.renderByType()
		)
	}
}
