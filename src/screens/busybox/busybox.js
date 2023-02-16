import React, { Component } from 'react';
import {
    View, Text, Dimensions, Image, ProgressViewIOS, ProgressBarAndroid, Platform, PixelRatio,
    Animated, StatusBar
} from 'react-native';
import { Navigation } from 'react-native-navigation'
import background from '../../img/background_mobile/ios82.png'
import backgroundAndroid from '../../img/background_mobile/android.png'
import logo from '../../img/background_mobile/logo.png'
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language';
import ProgressBarLight from '../../modules/_global/ProgressBarLight';
import { setCurrentScreen } from '../../lib/base/analytics';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage';
import { logDevice, declareAnimation, declareParallelAnimation, declareSequenceAnimation } from '../../lib/base/functionUtil';
import config from '../../../src/config';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import ScreenId from '../../constants/screen_id'
import SplashScreen from 'react-native-splash-screen';
import codePush from 'react-native-code-push';
import { EventEmitter } from '@okta/okta-react-native';
import * as Controller from '../../memory/controller';
import * as loginActions from '../../screens/login/login.actions';
import { openSignIn } from '~/lib/base/functionUtil'
import { handleSignInOkta, handleSignOutOkta } from '~/screens/home/Controllers/LoginController.js'
import { oktaSignOutWithBrowser } from '~/manage/manageOktaAuth'

const codePushOptions = {
    updateDialog: false,
    installMode: codePush.InstallMode.IMMEDIATE
}

const { height, width } = Dimensions.get('window');
const topHeight = height * 0.45
const bottomHeight = height * 0.55
const WELCOME_MARGIN_TOP = (bottomHeight - 64 - 64 - 128) / 2
const MARGIN_TOP_LOGO_INIT = topHeight - 64
const MARGIN_TOP_LOGO_AFTER_ANIM = (topHeight - 64) / 2
export class BusyBox extends Component {
    constructor(props) {
        super(props);
        dataStorage.callbackDownload = this.setPercent.bind(this);
        this.setStatusBarMode = this.setStatusBarMode.bind(this)
        this.state = {
            ratio: 0,
            percent: 0,
            logoOpacity: new Animated.Value(0),
            logoMarginTop: new Animated.Value(MARGIN_TOP_LOGO_INIT),
            welcomeOpacity: new Animated.Value(0),
            busyBoxOpacity: new Animated.Value(0)
        }
        this.perf = new Perf(performanceEnum.show_form_updating);

        this.downloadProgressCallback = this.downloadProgressCallback.bind(this)
        this.logoMarginTopAnim = declareAnimation(this.state.logoMarginTop, MARGIN_TOP_LOGO_AFTER_ANIM, 500)
        this.logoOpacityAnim = declareAnimation(this.state.logoOpacity, 1, 500)
        this.opacityAnim = declareParallelAnimation([
            declareAnimation(this.state.welcomeOpacity, 1, 500),
            declareAnimation(this.state.busyBoxOpacity, 1, 500)
        ])
        this.setStatusBarMode()
        this.handleCancelOkta = this.handleCancelOkta.bind(this)
    }

    renderLogo() {
        switch (config.logoInApp) {
            case 'BETA':
                return <Image source={logo} style={{ width: (2830 / 980) * 64, height: 64 }} />
                break;
            case 'DEMO':
                return <Image
                    source={logo}
                    style={{ width: width - 64, height: ((width - 64) * 260) / 1766 }} />
            default:
                return <Image source={logo} style={{ width: (684 / 644) * 128, height: 128 }} />
                break;
        }
        return config.logoInApp === 'BETA'
            ? <Image source={logo} style={{ width: (2830 / 980) * 64, height: 64 }} />
            : <Image source={logo} style={{ width: (684 / 644) * 128, height: 128 }} />
    }
    handleCancelOkta() {
        Controller.dispatch(loginActions.resetLoginLoading());
        openSignIn()
    }
    setStatusBarMode() {
        StatusBar.setBarStyle('light-content')
    }

    componentWillUnmount() {
        SplashScreen.hide();
        this.signInSuccess.remove();
        this.signOutSuccess.remove();
        this.onError.remove();
        this.onCancelled.remove();
    }
    componentDidMount() {
        this.signInSuccess = EventEmitter.addListener('signInSuccess', handleSignInOkta);
        this.signOutSuccess = EventEmitter.addListener('signOutSuccess', handleSignOutOkta);
        this.onError = EventEmitter.addListener('onError', this.handleCancelOkta);
        this.onCancelled = EventEmitter.addListener('onCancelled', this.handleCancelOkta);
        // Animation
        declareSequenceAnimation([
            this.logoOpacityAnim,
            this.logoMarginTopAnim,
            this.opacityAnim
        ]).start()

        this.perf && this.perf.incrementCounter(performanceEnum.show_form_updating);
        dataStorage.ScreenId = ScreenId.BUSY_BOX
    }

    // codePushStatusDidChange(status) {
    //     switch (status) {
    //         case codePush.SyncStatus.CHECKING_FOR_UPDATE:
    //             console.log('Checking for updates.');
    //             break;
    //         case codePush.SyncStatus.DOWNLOADING_PACKAGE:
    //             console.log('Downloading package.');
    //             break;
    //         case codePush.SyncStatus.INSTALLING_UPDATE:
    //             console.log('Installing update.');
    //             break;
    //         case codePush.SyncStatus.UP_TO_DATE:
    //             console.log('Up-to-date.');
    //             break;
    //         case codePush.SyncStatus.UPDATE_INSTALLED:
    //             console.log('Update installed.');
    //             break;
    //     }
    // }

    downloadProgressCallback(progress) {
        try {
            const recei = progress.receivedBytes || 0;
            const total = progress.totalBytes || 0;
            let percent = 0;
            if (total) {
                percent = Math.round((recei / total) * 10000) / 100;
            }
            const downloadProgress = progress ? `${progress.receivedBytes} of ${progress.totalBytes} bytes` : 'Caculating...';
            this.setState({
                ratio: percent
            })
            // dataStorage.callbackDownload && dataStorage.callbackDownload(downloadProgress, percent);
        } catch (error) {
            logDevice('error', `NATIVE - downloadProgressCallback exception with ${error}`);
        }
    }

    setPercent(ratio, percent) {
        this.setState({ ratio, percent })
    }

    render() {
        setCurrentScreen('updateForm');
        return (
            <View style={{
                flex: 1,
                width,
                height,
                backgroundColor: 'transparent'
            }}>
                <Image source={Platform.OS === 'ios' ? background : backgroundAndroid} style={{ flex: 1, width: null, height: null }} resizeMode={Platform.OS === 'ios' ? 'cover' : 'stretch'} />

                <View style={{ flex: 1, width, height, position: 'absolute' }}>
                    <View style={{ alignItems: 'center', height: topHeight }}>
                        <Animated.View style={{ height: 72, marginTop: this.state.logoMarginTop, opacity: this.state.logoOpacity }}>
                            {this.renderLogo()}
                        </Animated.View>
                    </View>

                    <View style={{ flex: 1, height: bottomHeight }}>
                        <Animated.View style={{ opacity: this.state.busyBoxOpacity }}>
                            <View style={{
                                backgroundColor: 'transparent',
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <ProgressBarLight color={CommonStyle.fontWhite} />
                            </View>
                            {
                                this.props.isUpgrade
                                    ? <View style={{ marginHorizontal: 32, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: CommonStyle.fontSizeM, fontFamily: 'HelveticaNeue', fontWeight: 'bold', color: '#FFF' }}>{I18n.t('importantNotification')}</Text>
                                        <Text style={{ fontSize: CommonStyle.fontSizeM, fontFamily: 'HelveticaNeue', color: '#FFF' }}>{I18n.t('upgradedSystem')}</Text>
                                    </View>
                                    : this.props.isUpdating
                                        ? <View style={{ width, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                            <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', marginBottom: 4, textAlign: 'left' }]}>{I18n.t('updatingFirstCapitalize')}</Text>
                                            <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', marginBottom: 4, textAlign: 'left' }]}>{` (${this.state.percent}%)...`}</Text>
                                        </View>
                                        : <Text style={[CommonStyle.textMainNoColor, { color: '#FFF', marginBottom: 4, textAlign: 'center' }]}>{I18n.t('connectingFirstCapitalize')}</Text>

                            }

                        </Animated.View>
                        {this.props.isUpgrade ? <View />
                            : <Animated.View style={{ opacity: this.state.welcomeOpacity, marginHorizontal: 64, marginTop: WELCOME_MARGIN_TOP }}>
                                <Text style={{ textAlign: 'center', fontSize: CommonStyle.font30, fontFamily: 'HelveticaNeue-Medium', color: '#FFFFFF' }}>{I18n.t('WelComeTo')}</Text>
                                <Text style={{ textAlign: 'center', fontSize: CommonStyle.font30, fontFamily: 'HelveticaNeue-Medium', color: '#FFFFFF' }}>{I18n.t('appName')}</Text>
                            </Animated.View>
                        }
                    </View>
                </View>
            </View>
        )
    }
}
export default BusyBox;
