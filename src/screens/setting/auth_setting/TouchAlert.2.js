import React, { Component } from 'react';
import {
	View,
	Image,
	TouchableOpacity,
	Animated,
	Text,
	PixelRatio,
	Platform,
	Dimensions
} from 'react-native';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import styles from './style/TouchAlertStyles';
import * as Animatable from 'react-native-animatable';
import { dataStorage } from '../../../../src/storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// import Finger from 'react-native-touch-id-android'
import * as manageAppState from '../../../manage/manageAppState'
import * as Business from '../../../business';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel';
import * as Util from '~/util'
import I18n from '~/modules/language/'

const fingerImage = require('../../../../src/img/fpsuccess.png');
const { width, height } = Dimensions.get('window');
export default class TouchAlert extends Component {
	constructor(props) {
		super(props);
		this.shakeTimeout = null;
		this.removeShakeTimeout = null;
		this.stateApp = null;
		this.reAuthentication = this.reAuthentication.bind(this);
		this.registerAndroidSensorFail = this.registerAndroidSensorFail.bind(this);
		this.authenFail = this.authenFail.bind(this)
		this.disableShake = this.disableShake.bind(this)
		this.id = Util.getRandomKey()
		this.state = {
			fadeAnim: new Animated.Value(0),
			animationTouchID: '',
			visible: false
		};
	}

	registerAndroidSensorFail() {
		const channel = Channel.getChannelAuthSensorAndroidFail()
		Emitter.addListener(channel, this.id, this.authenFail)
	}

	componentDidMount() {
		this.registerAndroidSensorFail()
	}

	reAuthentication() {
		if (Platform.OS === 'android') {
			const {
				authentication,
				successCb,
				cancelCb,
				params,
				objAndroidTouchIDFn = {}
			} = this.props;
			authentication(successCb, cancelCb, objAndroidTouchIDFn, params);
		}
	}

	componentWillReceiveProps(newProps) {
		if (newProps.visible !== this.state.visible) {
			this.setState({
				visible: newProps.visible
			});
		}
	}

	cancelAuthenTouchID() {
		this.props.onUserCancel && this.props.onUserCancel()
	}

	authenByPin() {
		this.props.onUserFallBack && this.props.onUserFallBack()
	}

	reShowFinger(callback, failCount) {
		setTimeout(() => {
			if (failCount < 3 && !dataStorage.isLockTouchID && callback) {
				callback();
			}
		}, 300);
	}

	disableShake() {
		setTimeout(() => {
			this.setState({ animationTouchID: '' });
			const isShowFingerPrint = false
			this.props.onFingerPrint && this.props.onFingerPrint(isShowFingerPrint)
		}, 1500);
	}

	authenFail() {
		this.setState({ animationTouchID: 'shake' }, this.disableShake);
	}

	render() {
		return (
			<View style={[{
				flex: 1,
				backgroundColor: 'rgba(0, 0, 0, 0.3)'
			}]}>
				<View style={styles.main}>{this.renderAlert()}</View>
			</View>
		);
	}

	renderAlert() {
		const image = fingerImage;
		return (
			<Animatable.View animation={this.state.animationTouchID} duration={1500}>
				<View style={styles.infoWrapper}>
					<Image source={image} style={styles.image} />
					<View style={{ marginHorizontal: 16, marginVertical: 8 }}>
						<Text
							style={[CommonStyle.textTitleDialog, { justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontWeight: '100', opacity: 0.7, color: CommonStyle.fontBlack }]}
						>
							{I18n.t('fingerPrintTitle')}
						</Text>
					</View>
					<View style={{ marginHorizontal: 16, marginBottom: 10 }}>
						<Text
							style={[CommonStyle.textDescDialog, { justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: CommonStyle.fontBlack }]}
						>{`${I18n.t('fingerPrintContent')} ${dataStorage.emailLogin
								? dataStorage.emailLogin.toLowerCase()
								: ''
							}`}</Text>
					</View>
					<View style={{ flexDirection: 'row', height: 48 }}>
						<TouchableOpacity
							onPress={this.cancelAuthenTouchID.bind(this)}
							style={{
								flex: 1,
								borderTopWidth: 0.5,
								borderTopColor: 'grey',
								borderRightWidth: 0.5,
								borderRightColor: 'grey',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Text
								style={[CommonStyle.textTitleDialog, { fontWeight: '300', color: CommonStyle.fontApple }]}
							>
								{I18n.t('cancel')}
							</Text>
						</TouchableOpacity>
						{/* <TouchableOpacity
							onPress={this.authenByPin.bind(this)}
							style={{
								flex: 1,
								borderTopWidth: 0.5,
								borderTopColor: 'grey',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Text
								style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple }]}
							>
								{I18n.t('fingerPrintEnterPin')}
							</Text>
						</TouchableOpacity> */}
					</View>
				</View>
			</Animatable.View>
		);
	}
}

TouchAlert.propTypes = {
	visible: PropTypes.bool,
	dismissDialog: PropTypes.func
};

TouchAlert.defaultProps = {
	authentication: () => null,
	dismissDialog: () => null,
	authenByPinFn: () => null
};
