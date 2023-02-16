import React, { Component } from 'react';
import {
    View, Text, Platform, Dimensions, TouchableOpacity, AppState, Alert, Animated,
    PixelRatio, Keyboard, InteractionManager, Image, TextInput, ActivityIndicator, ScrollView
} from 'react-native';
import {
    getPriceSource, logDevice, checkPropsStateShouldUpdate, logAndReport, removeItemFromLocalStorage, offTouchIDSetting,
    pinComplete, setDicReAuthen, getNameTimezoneLocation
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import config from '../../config';
import { dataStorage, func } from '../../storage';
import userType from '../../constants/user_type';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import styles from './style/home_page'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ENUM from '../../enum'
import ScreenId from '../../constants/screen_id'
import ExtraDimensions from 'react-native-extra-dimensions-android'
import * as Controller from '../../memory/controller'
import HeightSoftBar from './view.height.softbar'
const { height, width } = Dimensions.get('window');

export class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            softMenuBarHeight: 0,
            isDiableSignin: this.props.isDiableSignin || false
        };
        this.register = this.register.bind(this)
        this.loginAsGuest = this.loginAsGuest.bind(this)
        this.showSignIn = this.showSignIn.bind(this)
    }

    // componentWillMount() {
    // }

    componentDidMount() {
        this.isMount = true
        if (Platform.OS === 'android') {
            // Get soft bar height
            const softMenuBarHeight = ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0
            console.log(`SOFT BAR HEIGHT: ${softMenuBarHeight}`)
            logDevice('info', `SOFT BAR HEIGHT: ${softMenuBarHeight}`)
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

    register() {
        this.props.register && this.props.register()
    }

    loginAsGuest() {
        const defaultLocation = getNameTimezoneLocation()
        Controller.setLocation(defaultLocation)
        this.props.loginAsGuest && this.props.loginAsGuest()
    }

    showSignIn() {
        this.props.showSignIn && this.props.showSignIn();
    }

    render() {
        const {
            homePageContainer, homePageTopContent, homePageWelcomeText, homePageContent, homePageDescription,
            homePageDescriptionText, homePageRegister, homePageSignIn, homePageRegisterText, homePageGuestText,
            rightIconBody, dialogInput, rightIcon, errorContainer
        } = styles;
        const heightSoftBar =
            Platform.OS === 'android'
                ? ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0
                : 0; /** fix loi che course of sale khi co soft bar */
        return (
            <View>
                <TouchableOpacity style={[homePageRegister]}
                    onPress={this.register}>
                    <Text style={homePageDescriptionText}>{I18n.t('registerButton')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    onPress={this.loginAsGuest}>
                    <Text style={[homePageGuestText, { textDecorationLine: 'underline', textDecorationColor: '#efefef', opacity: 0.78 }]}>{I18n.t('continueAsGuest')}</Text>
                    {
                        this.props.login.isLoading
                            ? <ActivityIndicator style={{ width: 24, height: 24 }} color='#efefef' />
                            : null
                    }
                </TouchableOpacity>

                <View style={homePageSignIn}>
                    <Text style={[homePageDescriptionText, { marginVertical: 16, fontFamily: 'HelveticaNeue' }]}>{I18n.t('alreadyAccount')}</Text>
                    <TouchableOpacity testID={`signIn`} style={{ marginBottom: 56, marginHorizontal: 32, borderRadius: 5, borderWidth: 1, borderColor: '#10a8b2', backgroundColor: 'black', height: 48, justifyContent: 'center', alignItems: 'center' }}
                        disabled={this.state.isDiableSignin}
                        onPress={this.showSignIn}>
                        <Text style={homePageDescriptionText}>{I18n.t('login')}</Text>
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
