import React, { Component } from 'react';
import {
	View,
	Platform,
	Dimensions,
	Animated
} from 'react-native';
import {
	logDevice,
	declareAnimation,
	translateErrorCode
} from '../../lib/base/functionUtil';
import styles from './style/home_page';
import I18n from '../../modules/language/index'
import { dataStorage, func } from '../../storage'
import * as AuthBusiness from '../../channel/auth_business'

import ENUM from '../../enum'

// Component
import ErrorAnimation from '../../component/error_animation/error_animation'
import HeaderAccount from './child_component/header'
import ContentForgotUsername from './child_component/forgot_username/content_forgot_username'
import XComponent from '../../component/xComponent/xComponent'
import * as Util from '../../util';

const { height, width } = Dimensions.get('window');
export default class ForgotUsername extends XComponent {
	constructor(props) {
		super(props);

		this.init = this.init.bind(this)
		this.bindAllFunc = this.bindAllFunc.bind(this)
		this.bindAllFunc()
		this.init()
	}

	init() {
		try {
			this.dic = {
				channelChangeHeader: AuthBusiness.getChannelChangeHeaderAccount('forgot_username')
			}

			this.state = {
				errorText: '',
				isExpand: false
			}
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	bindAllFunc() {
		try {
			this.showError = this.showError.bind(this)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
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

	render() {
		const { wrapperFlexEnd, errorTxt, wrapperErrorTxt } = styles
		return (
			<View style={{ width, height: Util.isIOS() === true ? height - 48 : height }}>
				<View style={[wrapperFlexEnd]}>
					<View style={{ marginBottom: 16, height: 50 }}>
						<ErrorAnimation
							isExpand={this.state.isExpand}
							textStyle={errorTxt}
							errorStyle={wrapperErrorTxt}
							errorText={this.state.errorText}
							callbackHideError={this.showError}
							duration={500}
							timeOutErrorHidden={ENUM.TIMEOUT_HIDE_ERROR} />
					</View>

					<HeaderAccount
						title={I18n.t('forgotUsername')}
						content={I18n.t('forgotUsernameRemind')}
						channelChangeHeader={this.dic.channelChangeHeader} />
					<ContentForgotUsername
						showError={this.showError}
						channelChangeHeader={this.dic.channelChangeHeader}
						cancelFn={this.props.cancelFn} />
				</View>
			</View>
		);
	}
}
