import React, { Component } from 'react';
import { ActivityIndicator, Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { getNameTimezoneLocation, logDevice } from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import styles from './style/home_page.2'
import { register } from '~/theme/theme_controller'
import ExtraDimensions from 'react-native-extra-dimensions-android'
import * as Controller from '../../memory/controller'
import HeightSoftBar from './view.height.softbar'
import * as setTestId from '~/constants/testId'
const { height, width } = Dimensions.get('window');

export class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {
			softMenuBarHeight: 0,
			isDiableSignin: this.props.isDiableSignin || false
		};
		this.register = this.register.bind(this);
		this.loginAsGuest = this.loginAsGuest.bind(this);
		this.showSignIn = this.showSignIn.bind(this)
		this.disableContinueAsGuest = this.checkDisableContinueAsGuest()
	}

	// componentWillMount() {
	// }

	componentDidMount() {
		this.isMount = true;
		if (Platform.OS === 'android') {
			// Get soft bar height
			const softMenuBarHeight = ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0;
			console.log(`SOFT BAR HEIGHT: ${softMenuBarHeight}`);
			logDevice('info', `SOFT BAR HEIGHT: ${softMenuBarHeight}`);
			this.setState({
				softMenuBarHeight
			})
		}
	}

	componentWillUnmount() {
		this.isMount = false
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.isDiableSignin !== this.state.isDiableSignin) {
			this.setState({
				isDiableSignin: nextProps.isDiableSignin
			})
		}
	}

	checkDisableContinueAsGuest = this.checkDisableContinueAsGuest.bind(this)
	checkDisableContinueAsGuest() {
		// Disable continue as guest on IRESS MOBILE
		return true
	}

	register() {
		this.props.register && this.props.register()
	}

	loginAsGuest() {
		const defaultLocation = getNameTimezoneLocation();
		Controller.setLocation(defaultLocation);
		this.props.loginAsGuest && this.props.loginAsGuest()
	}

	showSignIn() {
		this.props.showSignIn && this.props.showSignIn();
	}

	render() {
		const {
			homePageDescriptionText,
			homePageRegister,
			homePageSignIn,
			homePageGuestText,
			homePageRegisterContainer
		} = styles;

		return (
			<View>
				<TouchableOpacity
					style={homePageSignIn}
					onPress={this.showSignIn}
					{...setTestId.testProp('Id_SignStep1', 'Label_SignStep1')}
					disabled={this.state.isDiableSignin}>
					<Text style={homePageDescriptionText}>{I18n.t('login')}</Text>
				</TouchableOpacity>

				<TouchableOpacity
					disabled={this.disableContinueAsGuest}
					style={{
						marginTop: 16,
						marginBottom: 32,
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center'
					}}
					{...setTestId.testProp('Id_ContinuesAsGuest', 'Label_ContinuesAsGuest')}
					onPress={this.loginAsGuest}>
					<Text style={[homePageGuestText, {
						textDecorationLine: 'underline',
						textDecorationColor: '#efefef',
						opacity: this.disableContinueAsGuest ? 0.5 : 0.78
					}]}>{I18n.t('continueAsGuest')}</Text>
					{
						this.props.login.isLoading
							? <ActivityIndicator style={{ width: 24, height: 24 }} color='#efefef' />
							: null
					}
				</TouchableOpacity>

				<View style={homePageRegisterContainer}>
					<Text style={[homePageDescriptionText, {
						marginVertical: 16,
						fontFamily: 'HelveticaNeue'
					}]}>{I18n.t('dontHaveAnAccount')}</Text>
					<TouchableOpacity
						{...setTestId.testProp('Id_registerButton', 'Label_registerButton')}
						disabled={true}
						testID={`signIn`} style={[homePageRegister, { opacity: 0.54 }]}
						onPress={this.register}>
						<Text style={homePageDescriptionText}>{I18n.t('registerButton')}</Text>
					</TouchableOpacity>
					<HeightSoftBar />
				</View>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		login: state.login
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
