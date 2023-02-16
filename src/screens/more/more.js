import React, { Component } from 'react';
import { View, Text, Alert, ScrollView, Dimensions, Platform, PixelRatio, Vibration, TouchableOpacity, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import styles from './style/more';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import QuickButton from '../../component/quick_button/quick_button';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import { resetLoadingNews } from '../news/news.actions';
import { List, ListItem, Icon } from 'react-native-elements'
import I18n from '../../modules/language';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ProgressBar from '../../modules/_global/ProgressBar';
import { logAndReport, setStyleNavigation, checkPropsStateShouldUpdate, removeItemFromLocalStorage, offTouchIDSetting } from '../../lib/base/functionUtil';
import NetworkWarning from '../../component/network_warning/network_warning';
import PasscodeAuth from 'react-native-passcode-auth';
import firebase from '../../firebase';
import Prompt from '../../component/prompt/prompt';
import { func, dataStorage } from './../../storage';
import Auth from '../../lib/base/auth';
import Sound from 'react-native-sound';
import AlertCustom from '../alert_custom/alert_custom';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import { Badge } from 'native-base';
import { VibrancyView, BlurView } from 'react-native-blur';
import Pin from '../../component/pin/pin';
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin';
import deviceModel from '../../constants/device_model';
import TouchAlert from '../setting/auth_setting/TouchAlert'
import PromptNew from '../../component/new_prompt/prompt_new'
import { Navigation } from 'react-native-navigation'
import * as Controller from '../../memory/controller';

const { width, height } = Dimensions.get('window');

export class More extends Component {
  constructor(props) {
    super(props);
    this.deviceModel = dataStorage.deviceModel;
    this.userId = null;
    this.notiStatus = null;
    this.state = {
      unread_count: 0,
      promptVisible: false,
      isLogin: true,
      errorLogin: '',
      errorForgot: '',
      visiblePopup: false,
      enableLog: config.enableLog,
      isAuthen: true,
      isForgotPinModalVisible: false,
      isAndroidTouchIdModalVisible: false,
      params: []
    }
    this.username = null;
    this.password = null;
    this.emailDefault = config.username;
    this.passDefault = config.password;
    this.whoosh = null;
    this.reloadAfterLoginCallback = null;
    this.logoutWhenAccountIsLocked = null;
    this.callbackAfterReconnect = this.callbackAfterReconnect.bind(this)
    this.newsFunc = this.newsFunc.bind(this)
    this.disclaimer = this.disclaimer.bind(this)
    this.listBeforeLogin = this.state.enableLog ? [
      // {
      //   title: I18n.t('search', { locale: this.props.setting.lang }),
      //   icon: 'ios-search-outline',
      //   iconType: 'ionicon',
      //   onPress: this.universalSearchFunc.bind(this)
      // },
      {
        title: I18n.t('appInfoTitle', { locale: this.props.setting.lang }),
        icon: 'ios-information-circle-outline',
        iconType: 'ionicon',
        onPress: this.aboutFunc.bind(this)
      },
      {
        title: I18n.t('disclaimer', { locale: this.props.setting.lang }),
        icon: 'ios-information-circle-outline',
        iconType: 'ionicon',
        onPress: this.disclaimer.bind(this)
      },
      {
        title: I18n.t('login', { locale: this.props.setting.lang }),
        icon: 'ios-log-in-outline',
        iconType: 'ionicon',
        onPress: this.loginFunc.bind(this)
      }
    ] : [
        {
          title: I18n.t('appInfoTitle', { locale: this.props.setting.lang }),
          icon: 'ios-information-circle-outline',
          iconType: 'ionicon',
          onPress: this.aboutFunc.bind(this)
        },
        {
          title: 'Terms and Conditions of Use',
          icon: 'ios-information-circle-outline',
          iconType: 'ionicon',
          onPress: this.disclaimer.bind(this)
        },
        {
          title: I18n.t('login', { locale: this.props.setting.lang }),
          icon: 'ios-log-in-outline',
          iconType: 'ionicon',
          onPress: this.loginFunc.bind(this)
        }
      ];
    this.listExtendBeforeLogin = [
      // {
      //   title: I18n.t('News', { locale: this.props.setting.lang }),
      //   icon: 'ios-paper-outline',
      //   iconType: 'ionicon',
      //   onPress: this.newsFunc.bind(this)
      // }
    ]
    this.listExtendAfterLogin = [
      // {
      //   title: I18n.t('newOrder', { locale: this.props.setting.lang }),
      //   icon: 'ios-paper-outline',
      //   iconType: 'ionicon',
      //   onPress: this.authFunction.bind(this)
      // },
      {
        title: I18n.t('News', { locale: this.props.setting.lang }),
        icon: 'ios-paper-outline',
        iconType: 'ionicon',
        onPress: () => this.newsFunc(0)
      },
      // {
      //   title: I18n.t('userManagement', { locale: this.props.setting.lang }),
      //   icon: 'ios-list-outline',
      //   iconType: 'ionicon',
      //   onPress: this.userManagementFunc.bind(this)
      // },
      /* {
        title: I18n.t('feesManagement', { locale: this.props.setting.lang }),
        icon: 'ios-folder-outline',
        iconType: 'ionicon',
        onPress: this.feesManagementFunc.bind(this)
      }, */
      // {
      //   title: I18n.t('customerGroupManagement', { locale: this.props.setting.lang }),
      //   icon: 'ios-folder-outline',
      //   iconType: 'ionicon',
      //   onPress: this.customerGroupManagementFunc.bind(this)
      // },
      /*
      {
        title: I18n.t('tradingTimeConfiguration', { locale: this.props.setting.lang }),
        icon: 'ios-timer-outline',
        iconType: 'ionicon',
        onPress: this.tradingTimeConfiguration.bind(this)
      }, */
      {
        title: I18n.t('reports', { locale: this.props.setting.lang }),
        icon: 'ios-book-outline',
        iconType: 'ionicon',
        onPress: this.reportsFunc.bind(this)
      }
      // {
      //   title: I18n.t('search', { locale: this.props.setting.lang }),
      //   icon: 'ios-search-outline',
      //   iconType: 'ionicon',
      //   onPress: this.universalSearchFunc.bind(this)
      //   // this.universalSearchFunc.bind(this)
      // }
    ];
    this.listAfterLogin = this.state.enableLog ? [
      {
        title: I18n.t('userInfo', { locale: this.props.setting.lang }),
        icon: 'ios-contact-outline',
        iconType: 'ionicon',
        onPress: this.userInfoFunc.bind(this)
      },
      {
        title: I18n.t('appInfoTitle', { locale: this.props.setting.lang }),
        icon: 'ios-information-circle-outline',
        iconType: 'ionicon',
        onPress: this.aboutFunc.bind(this)
      },
      {
        title: 'Terms and Conditions of Use',
        icon: 'ios-information-circle-outline',
        iconType: 'ionicon',
        onPress: this.disclaimer.bind(this)
      },
      {
        title: I18n.t('settings', { locale: this.props.setting.lang }),
        icon: 'ios-settings-outline',
        iconType: 'ionicon',
        onPress: this.settingFunc.bind(this)
      }, {
        testID: `signOutMore`,
        title: I18n.t('logout', { locale: this.props.setting.lang }),
        icon: 'ios-log-out-outline',
        iconType: 'ionicon',
        onPress: this.openModal.bind(this)
      }
    ] : [
        {
          title: I18n.t('userInfo', { locale: this.props.setting.lang }),
          icon: 'ios-contact-outline',
          iconType: 'ionicon',
          onPress: this.userInfoFunc.bind(this)
        },
        {
          title: I18n.t('appInfoTitle', { locale: this.props.setting.lang }),
          icon: 'ios-information-circle-outline',
          iconType: 'ionicon',
          onPress: this.aboutFunc.bind(this)
        },
        {
          title: 'Terms and Conditions of Use',
          icon: 'ios-information-circle-outline',
          iconType: 'ionicon',
          onPress: this.disclaimer.bind(this)
        },
        {
          title: I18n.t('settings', { locale: this.props.setting.lang }),
          icon: 'ios-settings-outline',
          iconType: 'ionicon',
          onPress: this.settingFunc.bind(this)
        }, {
          testID: `signOutMore`,
          title: I18n.t('logout', { locale: this.props.setting.lang }),
          icon: 'ios-log-out-outline',
          iconType: 'ionicon',
          onPress: this.openModal.bind(this)
        }
      ]
    this.showAlert = true;
    this.loginSuccess = this.loginSuccess.bind(this);
    this.loginError = this.loginError.bind(this);
    this.closeCb = null;
    this.authFunction = this.authFunction.bind(this);
    this.newOrderFunc = this.newOrderFunc.bind(this);
    this.onUniversalSearch = this.onUniversalSearch.bind(this);
    this.showFormLogin = this.showFormLogin.bind(this);
    this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
    this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
    this.androidTouchIDFail = this.androidTouchIDFail.bind(this)
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.showFormLoginSuccessCallback = null;
    this.params = [];
    this.onChangeAuthenByFingerPrint = this.onChangeAuthenByFingerPrint.bind(this);
    this.onForgotPin = this.onForgotPin.bind(this);
    this._onPinCompleted = this._onPinCompleted.bind(this);
    this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
    this.removeItemStorageSuccessCallback = this.removeItemStorageSuccessCallback.bind(this)
    this.loginCallback = this.loginCallback.bind(this)
    this.auth = new Auth(this.props.navigator, this.props.login.email, this.props.login.token, this.showFormLogin);
  }
  showAndroidTouchID() {
    dataStorage.onAuthenticating = true
    dataStorage.dismissAuthen = this.hideAndroidTouchID
    this.setState({
      isAndroidTouchIdModalVisible: true
    })
  }
  hideAndroidTouchID() {
    dataStorage.onAuthenticating = false
    this.setState({
      isAndroidTouchIdModalVisible: false
    })
  }
  androidTouchIDFail(callback, numberFingerFailAndroid) {
    this.androidTouchID && this.androidTouchID.authenFail(callback, numberFingerFailAndroid)
  }
  _onPinCompleted(pincode) {
    let pinCodeMd5 = pincode + dataStorage.userInfo.user_id;
    if (pinCodeMd5 === dataStorage.userPin.pin) {
      this.authenPin && this.authenPin.authenSuccess(this.showFormLoginSuccessCallback, this.params)
    } else {
      this.authenPin && this.authenPin.authenFail()
    }
  }

  onChangeAuthenByFingerPrint() {
    this.authenPin && this.authenPin.hideModalAuthenPin()
    let objAndroidTouchIDFn = null;
    if (Platform.OS === 'android') {
      objAndroidTouchIDFn = {
        showAndroidTouchID: this.showAndroidTouchID,
        hideAndroidTouchID: this.hideAndroidTouchID,
        androidTouchIDFail: this.androidTouchIDFail
      }
    }
    this.auth.authentication(this.newOrderFunc, null, objAndroidTouchIDFn);
  }

  onForgotPin() {
    Keyboard.dismiss();
    this.authenPin && this.authenPin.hideModalAuthenPin();
    setTimeout(() => {
      this.setState({
        isForgotPinModalVisible: true
      })
    }, 500)
  }

  removeItemStorageSuccessCallback() {
    dataStorage.numberFailEnterPin = 0;
    setTimeout(() => {
      this.props.navigator.showModal({
        screen: 'equix.SetPin',
        animated: true,
        animationType: 'slide-up',
        navigatorStyle: {
          statusBarColor: config.background.statusBar,
          statusBarTextColorScheme: 'light',
          navBarHidden: true,
          navBarHideOnScroll: false,
          navBarTextFontSize: 16,
          drawUnderNavBar: true,
          navBarNoBorder: true,
          modalPresentationStyle: 'overCurrentContext'
        },
        passProps: {
          type: 'new'
        }
      })
    }, 500)
  }

  callbackAfterReconnect() {
    if (this.username && this.password) {
      dataStorage.isLocked = true;
      this.props.actions.loginRequest();
      this.props.actions.login(this.username, this.password, null, this.loginError, null, null, null, this.loginCallback);
    }
  }
  removeItemStorageErrorCallback() {
  }

  forgotPinSuccessCb() {
    console.log('forgot pin success');
    removeItemFromLocalStorage(dataStorage.userPin.email || dataStorage.emailLogin, this.removeItemStorageSuccessCallback, this.removeItemStorageErrorCallback)
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
    } else {
      switch (event.id) {
        case 'willAppear':
          this.props.actions.resetLogin();
          break;
        case 'didAppear':
          if (dataStorage.notifyObj) {
            this.newsFunc(1);
          }
          break;
        case 'willDisappear':
          break;
        case 'didDisappear':
          this.setState({ unread_count: 0 })
          break;
        default:
          break;
      }
    }
  }

  showFormLogin(successCallback, params) {
    if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
      offTouchIDSetting(this.props.authSettingActions.turnOffTouchID)
    }
    if (successCallback) this.showFormLoginSuccessCallback = successCallback;
    this.params = params || []
    setTimeout(() => {
      this.authenPin && this.authenPin.showModalAuthenPin();
    }, 600)
  }

  componentDidMount() {
    if (!config.enableLog) {
      const user = Controller.getUserInfo()
      const userRef = firebase.database().ref(`user_info/${user.uid}`)
      userRef.on('value', (snap) => {
        const val = snap.val() || {};
        this.setState({
          enableLog: val.enable_log || false
        })
      });
    } else {
    }
  }

  authFunction() {
    try {
      let objAndroidTouchIDFn = null;
      if (Platform.OS === 'android') {
        objAndroidTouchIDFn = {
          showAndroidTouchID: this.showAndroidTouchID,
          hideAndroidTouchID: this.hideAndroidTouchID,
          androidTouchIDFail: this.androidTouchIDFail
        }
      }
      this.auth.authentication(this.newOrderFunc, null, objAndroidTouchIDFn);
    } catch (error) {
      logAndReport('authFunction price exception', error, 'authFunction price');
    }
  }

  playSound() {
    var beepSound = new Sound('beep.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('beepSound - failed to load the sound', error);
      } else {
        console.log('beepSound - duration in seconds: ' + beepSound._duration +
          ' number of channels: ' + beepSound._numberOfChannels);
        console.log('beepSound - play attempt');
        beepSound.play((test) => {
          console.log('beepSound - TEST');
          if (test) {
            console.log('beepSound - successfully finished playing');
            Vibration.cancel();
          } else {
            console.log('beepSound - playback failed due to audio decoding errors');
          }
        });
      }
    })
  }

  loginError(error, isLockedAccount = false) {
    if (isLockedAccount) {
      this.setState({
        promptVisible: false
      })
      setTimeout(() => {
        this.lockPrompt && this.lockPrompt.showModal();
      }, 500)
    } else {
      this.errorCb && this.errorCb();
      setTimeout(() => {
        if (Controller.getVibrate()) {
          Vibration.vibrate(1000);
        }
        this.playSound();
      }, 500)
      // this.setState({
      //   animation: 'shake'
      // }, this.playSound.bind(this));
      // console.log('PPPP');
    }
  }

  loginSuccess() {
    console.log('Success');
  }

  userInfoFunc() {
    this.props.navigator.push({
      screen: 'equix.User',
      title: 'User Info',
      backButtonTitle: ' ',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        navBarHideOnScroll: false,
        drawUnderNavBar: true,
        navBarTextFontSize: 18,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      }
    });
  }

  onUniversalSearch() {
    this.props.navigator.showModal({
      screen: 'equix.Search',
      title: 'Search',
      backButtonTitle: '',
      animated: true,
      animationType: 'slide-up',
      navigatorStyle: {
        ...CommonStyle.navigatorSpecialNoHeader,
        modalPresentationStyle: 'overCurrentContext'
      }
    });
  }

  newsFunc(initialPage) {
    this.props.navigator.push({
      screen: 'equix.News',
      backButtonTitle: ' ',
      title: 'News',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarHideOnScroll: false,
        navBarTextFontSize: 18,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      },
      passProps: {
        initialPage
      },
      navigatorButtons: {
        rightButtons: [{
          testID: 'NewFilterIcon',
          id: 'news_filter',
          icon: iconsMap['ios-funnel-outline']
        }]
      }
    });
  }

  newOrderFunc() {
    this.props.navigator.push({
      animated: true,
      animationType: 'slide-horizontal',
      backButtonTitle: ' ',
      // title: 'New Order',
      screen: 'equix.Order',
      passProps: {
        isDefault: true,
        stopPrice: 0,
        limitPrice: 0,
        code: '',
        exchanges: [],
        changePercent: 0,
        volume: 0,
        isNotShowMenu: true
      },
      navigatorStyle: CommonStyle.navigatorSpecialNoHeader
    })
  }

  userManagementFunc() {
    this.props.navigator.push({
      screen: 'equix.UserManagement',
      backButtonTitle: '',
      title: 'User Management',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarTextFontFamily: CommonStyle.fontMedium,
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTranslucent: false,
        drawUnderNavBar: true,
        navBarHideOnScroll: false,
        navBarTextColor: config.color.navigation,
        navBarTextFontSize: 18,
        navBarTransparent: true,
        navBarButtonColor: config.button.navigation,
        drawUnderTabBar: false,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      },
      navigatorButtons: {
        rightButtons: [{
          id: 'add-circle',
          icon: iconsMap['ios-add-circle-outline']
        }]
      }
    });
  }

  feesManagementFunc() {
  }

  customerGroupManagementFunc() {
    this.props.navigator.push({
      screen: 'equix.CustomerGroupManagement',
      backButtonTitle: '',
      title: 'Customer Group Management',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarHideOnScroll: false,
        navBarTextFontSize: 18,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      },
      navigatorButtons: {
        rightButtons: [{
          id: 'create',
          icon: iconsMap['ios-add-circle-outline']
        }]
      }
    });
  }

  tradingTimeConfiguration() {
  }

  reportsFunc() {
    this.props.navigator.push({
      screen: 'equix.Report',
      backButtonTitle: ' ',
      title: 'Reports',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarTextFontSize: 18,
        navBarHideOnScroll: false,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      }
    });
  }

  openModal() {
    this.setState({ visiblePopup: true })
  }

  closeModal() {
    this.setState({ visiblePopup: false })
  }

  logoutFunc() {
    this.props.actions.logout(this.props.navigator);
    this.props.actions.resetLoadingNews();
  }

  loginFunc() {
    this.setState({
      promptVisible: true
    });
  }

  messageFunc() {
    console.warn('messageFunc');
  }

  aboutFunc() {
    this.props.navigator.push({
      screen: 'equix.AboutUs',
      backButtonTitle: ' ',
      title: 'About Us',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarTextFontSize: 18,
        navBarHideOnScroll: false,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      }
    });
  }
  disclaimer() {
    this.props.navigator.push({
      screen: 'equix.Disclaimer',
      // backButtonHidden: true,
      backButtonTitle: ' ',
      title: I18n.t('disclaimer', { locale: this.props.setting.lang }),
      navigatorStyle: {
        navBarBackgroundColor: '#000000',
        navBarTranslucent: false,
        drawUnderNavBar: false,
        navBarHideOnScroll: false,
        navBarTextColor: '#FFFFFF',
        navBarTextFontFamily: 'HelveticaNeue-Medium',
        navBarTextFontSize: 18,
        navBarTransparent: true,
        navBarButtonColor: '#FFFFFF',
        statusBarColor: '#000000',
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: true,
        tabBarHidden: true,
        navBarNoBorder: true
      },
      passProps: {
        onCheck: dataStorage.disclaimerOncheck,
        onAccept: dataStorage.disclaimerAccept,
        backMore: true
      },
      animationType: 'none'
    });
  }
  logsFunc() {
    this.props.navigator.push({
      screen: 'equix.Logs',
      backButtonTitle: ' ',
      title: 'Logs',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarTextFontSize: 18,
        navBarHideOnScroll: false,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      }
    });
  }
  settingFunc() {
    this.props.navigator.push({
      screen: 'equix.Setting',
      backButtonTitle: ' ',
      title: 'Settings',
      navigatorStyle: {
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        navBarTextFontSize: 18,
        navBarBackgroundColor: CommonStyle.statusBarBgColor,
        navBarTextColor: config.color.navigation,
        drawUnderNavBar: true,
        navBarHideOnScroll: false,
        navBarButtonColor: config.button.navigation,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      errorLogin: nextProps.login.error,
      errorForgot: nextProps.login.errorForgot,
      unread_count: nextProps.news.unread || 0
    });
    // this.auth = new Auth(this.props.navigator, this.props.login.email, this.props.login.token, this.showFormLogin);
    // this.auth.updateInfomation(this.props.navigator, this.props.email, this.props.token, this.props.showFormLogin)
    // if (nextProps && nextProps.app.isConnected !== this.props.app.isConnected) {
    //   setStyleNavigation(nextProps.app.isConnected, this.props.navigator);
    // }
    if (nextProps.login.isLocked && nextProps.login.isLogin && this.showAlert) {
      this.showAlert = false;
      this.logoutWhenAccountIsLocked = this.props.actions.logout.bind(this, this.props.navigator)
      this.props.navigator.showModal({
        screen: 'equix.PromptNew',
        animationType: 'none',
        navigatorStyle: {
          navBarHidden: true,
          modalPresentationStyle: 'overCurrentContext',
          navBarNoBorder: true
        },
        passProps: {
          type: 'lockedAccount',
          isShow: true,
          realtimeLockFn: this.logoutWhenAccountIsLocked
        }
      })
    }
  }

  checkEmail() {
    setTimeout(() =>
      Alert.alert(
        '',
        'Please check your email to reset your password',
        [
          {
            text: 'Ok'
          }
        ]), 1000)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = [{ app: ['isConnected'] }, { login: ['isLogin'] }, { setting: ['lang'] }];
    const listState = ['unread_count', 'promptVisible', 'isLogin', 'errorLogin', 'visiblePopup', 'isForgotPinModalVisible', 'isAndroidTouchIdModalVisible', 'params'];
    let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  loginCallback(cb) {
    this.closeCb && this.closeCb();
    setTimeout(() => {
      this.setState({
        promptVisible: false,
        isLogin: true,
        errorLogin: ''
      });
    }, 500)
    if (cb) {
      this.reloadAfterLoginCallback = cb;
      setTimeout(() => {
        this.reviewPrompt && this.reviewPrompt.showModal();
      }, 1000)
    }
  }

  render() {
    const user = Controller.getUserInfo()
    let listData1 = [{
      placeholder: 'Email',
      defaultValue: this.props.login.email,
      id: 'username',
      rightIcon: 'md-close'
    },
    {
      placeholder: 'Password',
      defaultValue: '',
      secureTextEntry: true,
      id: 'password',
      rightIcon: 'md-eye'
    }];
    let title = 'Sign In to Equix';
    let subtitle = 'Forgot password';
    let lostConnectionTitle = 'Connecting...';
    if (!this.state.isLogin) {
      title = 'Recover Your Password';
      subtitle = 'Please enter your email address';
      listData1 = [{
        placeholder: 'Email',
        defaultValue: this.props.login.email,
        id: 'username'
      }];
    }
    let listItem = [];
    let listExtend = [];
    if (this.props.login.isLogin && user && user.email !== this.emailDefault) {
      listItem = this.listAfterLogin;
      listExtend = this.listExtendAfterLogin;
    } else {
      // this.setState({ visiblePopup: false })
      listItem = this.listBeforeLogin;
      listExtend = this.listExtendBeforeLogin;
    }
    return (
      <View testID='MorePage' style={{ backgroundColor: '#efeff4', width: width, height: height }}>
        {
          this.props.app.isConnected ? null : <NetworkWarning />
        }
        <View style={{ width: '100%' }}>
          <Text></Text>
        </View>
        <ScrollView style={{ width: '100%' }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          {
            listExtend.length > 0 ? (
              <List containerStyle={{ borderTopWidth: 0, backgroundColor: 'white', marginTop: 16 }}>
                {
                  listExtend.map((item, i) => (
                    <ListItem
                      key={i}
                      title={item.title}
                      containerStyle={{ paddingLeft: 8, borderBottomWidth: i === listExtend.length - 1 ? 0 : 1, borderBottomColor: '#0000001e', marginRight: 8 }}
                      titleStyle={[styles.title, ((item.title === I18n.t('reports', { locale: this.props.setting.lang }) || item.title === I18n.t('newOrder', { locale: this.props.setting.lang })) && !this.props.app.isConnected) ? { color: '#0000001e' } : {}]}
                      onPress={((item.title === I18n.t('reports', { locale: this.props.setting.lang }) || item.title === I18n.t('newOrder', { locale: this.props.setting.lang })) && !this.props.app.isConnected) ? null : item.onPress}
                      leftIcon={{ name: item.icon, color: '#10a28b', type: item.iconType, size: 24 }}
                      rightIcon={item.title === 'News' ? <BadgeIcon rightIcon={true} badge={true} value={this.state.unread_count} /> : <BadgeIcon rightIcon />}
                    />
                  ))
                }
              </List>) : null
          }
          <List containerStyle={{ borderTopWidth: 0, backgroundColor: 'white', marginTop: 32 }}>
            {
              listItem.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.title}
                  containerStyle={{ paddingLeft: 8, borderBottomWidth: i === listItem.length - 1 ? 0 : 1, borderBottomColor: '#0000001e', marginRight: 8 }}
                  titleStyle={styles.title}
                  onPress={item.onPress}
                  leftIcon={{ name: item.icon, color: '#10a28b', type: item.iconType }}
                  rightIcon={<BadgeIcon rightIcon />}
                />
              ))
            }
          </List>
        </ScrollView>
        <Prompt
          isAuth={false}
          title={title}
          titleStyle={{ paddingVertical: 0 }}
          titleContainerStyle={{ alignItems: 'center' }}
          // subtitle={subtitle}
          buttonContainerStyle={{ borderTopWidth: 1 }}
          cancelText={Platform.OS === 'ios' ? 'Cancel' : 'CANCEL'}
          submitText={this.state.isLogin ? (Platform.OS === 'ios' ? 'Sign In' : 'SIGN IN') : (Platform.OS === 'ios' ? 'Reset' : 'RESET')}
          subtitleStyle={{ textAlign: 'center', color: this.state.isLogin ? '#10a8b2' : 'rgba(0, 0, 0, 0.87)' }}
          lostConnectionTitle={lostConnectionTitle}
          lostConnectionTitleStyle={{ fontFamily: 'HelveticaNeue-Light', fontSize: CommonStyle.fontSizeS, color: '#DF0000', textAlign: 'center', marginBottom: 6 }}
          errorText={this.state.errorLogin}
          // onSubtitle={this.state.isLogin ? () => {
          //   const isLogin = this.state.isLogin;
          //   if (subtitle === 'Forgot password') {
          //     this.setState({
          //       isLogin: !isLogin,
          //       errorLogin: ''
          //     });
          //   } else {
          //     this.setState({
          //       isLogin: !isLogin
          //     });
          //   }
          // } : null}
          listInput={listData1}
          visible={this.state.promptVisible}
          onCancel={() => {
            this.setState({
              promptVisible: false,
              isLogin: true,
              errorLogin: ''
            }, () => {
              this.props.actions.loginCancel();
            });
          }}
          easing={''}
          onSubmit={(value, closeCb, errorCb) => {
            this.closeCb = closeCb;
            this.errorCb = errorCb;
            if (this.state.isLogin) {
              if (!value) return this.loginError();
              const data = JSON.parse(JSON.stringify(value || {}));
              if (!data.username || !data.password) return this.loginError();
              if (this.props.app.isConnected) {
                dataStorage.emailLogin = data.username.toLowerCase().trim()
                this.username = data.username;
                this.password = data.password;
                dataStorage.callbackAfterReconnect = this.callbackAfterReconnect;
                this.props.actions.resetLoadingNews();
                this.props.actions.loginRequest(data.username, data.password);
                setTimeout(() => {
                  if (this.props.app.isConnected) {
                    dataStorage.isLocked = true;
                    this.props.actions.login(data.username, data.password, null, this.loginError, null, null, null, this.loginCallback);
                  }
                }, 2000)
              } else {
                Alert.alert(
                  '',
                  'Please check your internet connection.',
                  [
                    {
                      text: 'Dismiss',
                      onPress: () => this.setState({ promptVisible: false }, () => {
                        this.closeCb && this.closeCb()
                        this.props.action.loginCancel();
                      }),
                      style: 'cancel'
                    }
                  ]
                )
              }
            } else {
              if (!value) return this.loginError();
              const data = value || {};
              if (!data.username) return this.loginError();
              if (this.props.app.isConnected) {
                this.props.actions.forgotPass(data.username, () => {
                  this.closeCb && this.closeCb();
                  this.setState({
                    promptVisible: false,
                    isLogin: true
                  }, () => {
                    this.checkEmail()
                  })
                }, this.loginError);
              } else {
                Alert.alert(
                  '',
                  'Please check your internet connection.',
                  [
                    {
                      text: 'Dismiss',
                      onPress: () => this.setState({ promptVisible: false, isLogin: true }, this.closeCb && this.closeCb()),
                      style: 'cancel'
                    }
                  ]
                )
              }
            }
          }} />
        {
          this.auth.showLoginForm(this.state.isForgotPinModalVisible, I18n.t('resetYourPin'), I18n.t('pleaseEnterYourPassword'), null, null, () => {
            this.setState({
              isForgotPinModalVisible: false
            });
          }, () => {
            this.props.actions.authError()
            this.setState({
              // animationLogin: 'shake',
              isError: true
            });
          }, () => {
            this.props.actions.authSuccess()
            this.setState({
              isForgotPinModalVisible: false,
              isError: false
            });
          }, () => {
            this.props.loginActions.authSuccess();
            this.setState({
              isForgotPinModalVisible: false,
              isError: false
            }, () => {
              this.forgotPinSuccessCb()
            });
          }, null, null, this.state.isError, true)
        }
        <AuthenByPin
          onForgotPin={this.onForgotPin}
          onChangeAuthenByFingerPrint={this.onChangeAuthenByFingerPrint}
          onRef={ref => this.authenPin = ref}
          onPinCompleted={this._onPinCompleted}
        />
        <TouchAlert
          ref={ref => this.androidTouchID = ref}
          visible={this.state.isAndroidTouchIdModalVisible}
          dismissDialog={this.hideAndroidTouchID}
          authenByPinFn={this.showFormLogin.bind(this, this.newOrderFunc, this.state.params)}
        />
        <QuickButton
          testID={`quickButton`}
          onNewOrder={() => this.authFunction()}
          onUniversalSearch={() => this.onUniversalSearch()} />
        <AlertCustom visible={this.state.visiblePopup} close={this.closeModal.bind(this)} logoutFunc={this.logoutFunc.bind(this)} />
        <PromptNew
          isHideModal={false}
          reloadAfterLoginCallback={this.reloadAfterLoginCallback}
          type={'reviewAccount'}
          onRef={ref => this.reviewPrompt = ref}
          navigator={this.props.navigator}
        />
        <PromptNew
          type={'lockedAccount'}
          onRef={ref => this.lockPrompt = ref}
          navigator={this.props.navigator}
        />
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    news: state.news,
    login: state.login,
    setting: state.setting,
    app: state.app
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(loginActions, dispatch),
    authSettingActions: bindActionCreators(authSettingActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(More);

export class BadgeIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.value !== this.state.value) {
      this.setState({ value: nextProps.value });
    }
  }

  render() {
    return (
      <View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }, this.props.style]}>
        {
          this.props.badge && this.state.value ? (this.state.value < 100 ? <View style={[this.state.value < 10 ? CommonStyle.smallBadge : CommonStyle.largeBadge]}>
            <Text style={[CommonStyle.textExtraNoColor, { color: 'white', textAlign: 'center' }]}>{this.state.value || 0}</Text>
          </View> : <Badge style={{ backgroundColor: '#df0000', height: 20 }}><Text style={CommonStyle.textExtraNoColor}>{this.state.value || 0}</Text></Badge>) : null
        }
        {/*
          this.props.badge ? <Badge>
            <Text style={CommonStyle.textSubWhite}>{10}</Text>
          </Badge> : null
        */}
        {
          this.props.rightIcon ? <Ionicons name='ios-arrow-forward' size={24} color='#c7c7cc' style={{ top: 2, marginLeft: 8 }} /> : null
        }
      </View>
    );
  }
}
