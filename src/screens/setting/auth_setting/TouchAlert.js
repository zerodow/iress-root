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

const fingerImage = require('../../../../src/img/fpsuccess.png');
const { width, height } = Dimensions.get('window');
export default class TouchAlert extends Component {
	constructor(props) {
		super(props);
		this.shakeTimeout = null;
		this.removeShakeTimeout = null;
		this.stateApp = null;
		this.reAuthentication = this.reAuthentication.bind(this);
		this.state = {
			fadeAnim: new Animated.Value(0),
			animationTouchID: '',
			visible: false
		};
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
		const type = 'auth'
		// Finger.dismiss();
		manageAppState.unRegisterAppState(type)
		const { byPass, dismissDialog, authenByPinFn } = this.props;
		dismissDialog();
		Business.setStatusBarBackgroundColor({
			backgroundColor: CommonStyle.statusBarBgColor
		})
		if (byPass === false) {
			authenByPinFn();
		}
	}

	authenByPin() {
		const type = 'auth'
		// Finger.dismiss();
		manageAppState.unRegisterAppState(type)
		const { dismissDialog, authenByPinFn } = this.props;
		authenByPinFn();
		dismissDialog();
	}

	reShowFinger(callback, failCount) {
		setTimeout(() => {
			if (failCount < 3 && !dataStorage.isLockTouchID && callback) {
				callback();
			}
		}, 300);
	}

	disableShake(callback, failCount) {
		setTimeout(() => {
			this.setState(
				{ animationTouchID: '' },
				this.reShowFinger.bind(this, callback, failCount)
			);
		}, 1000);
	}

	authenFail(callback, numberFingerFailAndroid) {
		this.setState(
			{
				animationTouchID: 'shake'
			},
			this.disableShake.bind(this, callback, numberFingerFailAndroid)
		);
	}

	render() {
		return (
			<Modal
				onShow={() => Business.setStatusBarBackgroundColor({ backgroundColor: 'rgba(0, 0, 0, 0.3)' })}
				onDismiss={() => Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })}
				animationType="fade"
				onBackButtonPress={() => console.log('backpress')}
				onRequestClose={() => console.log('requestclose')}
				visible={this.state.visible || false}
				style={[{ margin: 0, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}
			>
				<View style={styles.main}>{this.renderAlert()}</View>
			</Modal>
		);
	}

	renderAlert() {
		const image = fingerImage;
		return (
			<Animatable.View animation={this.state.animationTouchID}>
				<View style={styles.infoWrapper}>
					<Image source={image} style={styles.image} />
					<View style={{ marginHorizontal: 16, marginVertical: 8 }}>
						<Text
							style={[CommonStyle.textTitleDialog, { justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontWeight: '100', opacity: 0.7, color: CommonStyle.fontBlack }]}
						>
							Fingerprint for "IRESS"
						</Text>
					</View>
					<View style={{ marginHorizontal: 16, marginBottom: 10 }}>
						<Text
							style={[CommonStyle.textDescDialog, { justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: CommonStyle.fontBlack }]}
						>{`Please place your finger on the scaner or use PIN to confirm User Login: ${dataStorage.emailLogin
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
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
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
								Enter PIN
							</Text>
						</TouchableOpacity>
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
