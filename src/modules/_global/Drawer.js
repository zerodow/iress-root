import React from 'react';
import {
	Text,
	View,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	Alert,
	Platform,
	Keyboard,
	Vibration,
	Animated,
	Easing,
	FlatList,
	ImageBackground,
	Linking,
	StatusBar,
	BackHandler,
	Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import I18n from '../language/';
import styles from './styles/Drawer';
import { bindActionCreators } from 'redux';
import config from '../../config';
import CommonStyle from '~/theme/theme_controller';
import { func, dataStorage } from '../../storage';
import { connect } from 'react-redux';
import * as loginActions from '../../screens/login/login.actions';
import * as appActions from '../../app.actions';
import * as authSettingActions from '../../screens/setting/auth_setting/auth_setting.actions';
import {
	getShortcutName,
	logAndReport,
	logDevice,
	reloadDataAfterChangeAccount,
	openWhatsNewModal,
	offTouchIDSetting,
	pinComplete,
	forgotPinWithAccessToken,
	checkDisableScreenByRole
} from '../../lib/base/functionUtil';
import Prompt from '../../component/prompt/prompt';
import { Navigation } from 'react-native-navigation';
import Auth from '../../lib/base/auth';
import Picker from 'react-native-picker';
import Sound from 'react-native-sound';
import AlertCustom from '../../screens/alert_custom/alert_custom';
import loginUserType from '../../constants/login_user_type';
import PromptNew from '../../component/new_prompt/prompt_new';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import BadgeIcon from '../../component/badge/badge';
import * as Animatable from 'react-native-animatable';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import { resetNotiNews } from '../../screens/news/news.actions';
import { loadDataFrom } from '../../screens/user/user.actions';
import ScreenId from '../../constants/screen_id';
import * as Business from '../../business';
import AuthenByPin from '../../component/authen_by_pin/authen_by_pin';
import TouchAlert from '../../screens/setting/auth_setting/TouchAlert';
import { unregisterAllMessage } from '../../streaming';
import { getChannelForceRenderDrawer } from '~/streaming/channel';
import * as Emitter from '~/lib/base/vietnam-emitter';
import ENUM from '../../enum';
import * as Util from '../../util';
import * as NewsBusiness from '../../streaming/news';
import {
	checkRoleByKey,
	getScreenMenuSelected,
	isViewOnly
} from '../../roleUser';
import * as Controller from '../../memory/controller';
import * as setTestId from '~/constants/testId';
// Component
import XComponent from '../../component/xComponent/xComponent';
import * as ManageConnection from '../../manage/manageConnection';
import pinBackground from '~/img/background_mobile/pinVersion2Background.png';
import { pushScreenToCurrentTab } from '~/navigation/controller.1';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import DebonceButton from '~/component/debounce_button';
import logo from '~/img/background_mobile/logo.png';
import LogDevice from '~/streaming/StreamComp/logDevice.js';
import Timer from '~/streaming/StreamComp/timer.js';

const { ENVIRONMENT } = ENUM;

const NewTouchableOpacity = DebonceButton(TouchableOpacity, 3000);

const { width } = Dimensions.get('window');
const WIDTH_PERCENT = 0.85;
const WIDTH_DRAWER = width * WIDTH_PERCENT;
const EVENT = ENUM.EVENT;
const CHANNEL = ENUM.CHANNEL;
const { ROLE_USER, THEME } = ENUM;

const AnimIcon = Animated.createAnimatedComponent(Icon);

loginActions['resetNotiNews'] = resetNotiNews;
loginActions['loadDataFrom'] = loadDataFrom;

class Drawer extends XComponent {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.bindAllFunction = this.bindAllFunction.bind(this);
		this.bindAllFunction();
		this.init();

		StatusBar.setBarStyle(CommonStyle.statusBarMode);
	}
	init() {
		this.isMount = false;
		this.isReady = false;
		this.deviceModel = dataStorage.deviceModel;
		this.id = Util.getRandomKey();
		const defaultAccount = {
			account_name: 'Unregister',
			email: config.username
		};
		this.state = {
			isAndroidTouchIdModalVisible: false,
			params: [],
			listAccounts: Controller.getListAccount(),
			animation1: '',
			animation2: '',
			animation3: '',
			locked: 'unlocked',
			currentAccount: dataStorage.currentAccount || {},
			menuSelected: !Controller.getLoginStatus()
				? ENUM.MENU_SELECTED.watchlist_drawer
				: getScreenMenuSelected(),
			afterLogin: Controller.getLoginStatus(),
			promptVisible: false,
			isLogin: true,
			isDisabled: false,
			errorLogin: '',
			errorForgot: '',
			promptVisibleAuth: false,
			isDisablePopup: false,
			isError: false,
			visiblePopup: false,
			news_unread: this.props.notiStatus.unread || 0,
			order_unread: this.props.unread || 0,
			newsReadOverview: this.props.notiStatus.readOverview || 0,
			orderReadOverview: this.props.readOverview || false,
			flag: 0,
			isReload: false
		};
		this.spinValue = new Animated.Value(0);
		this.heightHeaderWithWarning = new Animated.Value(0);
		this.username = null;
		this.password = null;
		this.reloadAfterLoginCallback = null;
		this.showAlert = true;
		this.closeCb = null;
		this.isShowModal = false;
		this.screenObject = {};
		this.showFormLoginSuccessCallback = null;
		this.params = [];
		this.auth = new Auth(
			this.props.navigator,
			this.props.login.email,
			this.props.login.token,
			this.showFormLogin
		);
		this.logoutWhenAccountIsLocked = null;
		dataStorage.closeModalSignOut = this.closeModal;
		dataStorage.closeDrawerSignOut = this.closeDrawer;
	}

	bindAllFunction() {
		this.showAndroidTouchID = this.showAndroidTouchID.bind(this);
		this.authenByPinFn = this.authenByPinFn.bind(this);
		this.hideAndroidTouchID = this.hideAndroidTouchID.bind(this);
		this.androidTouchIDFail = this.androidTouchIDFail.bind(this);
		this.callbackAfterReconnect = this.callbackAfterReconnect.bind(this);
		this.updateData = this.updateData.bind(this);
		this.updateListAccounts = this.updateListAccounts.bind(this);
		this.updateDataCallback = this.updateDataCallback.bind(this);
		this.updateListAccountsCallback =
			this.updateListAccountsCallback.bind(this);
		this.configLogout = this.configLogout.bind(this);
		this.closeDrawer = this.closeDrawer.bind(this);
		this.switchTab = this.switchTab.bind(this);
		this.switchForm = this.switchForm.bind(this);
		this.loginFunc = this.loginFunc.bind(this);
		this.loginError = this.loginError.bind(this);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.authFunction = this.authFunction.bind(this);
		this.showFormLogin = this.showFormLogin.bind(this);
		this._onPinCompleted = this._onPinCompleted.bind(this);
		this.authenPinFail = this.authenPinFail.bind(this);
		this.newOrderFunc = this.newOrderFunc.bind(this);
		this.switchToSetting = this.switchToSetting.bind(this);
		this.onChangeAuthenByFingerPrint =
			this.onChangeAuthenByFingerPrint.bind(this);
		this.confirmedLogout = this.confirmedLogout.bind(this);
		this.changeMenuSelected = this.changeMenuSelected.bind(this);
		dataStorage.changeMenuSelected = this.changeMenuSelected;
		this.loginSuccessCallback = this.loginSuccessCallback.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.closeSignInPopUp = this.closeSignInPopUp.bind(this);
		this.getDemoText = this.getDemoText.bind(this);
		this.updateNewsUnread = this.updateNewsUnread.bind(this);
		this.switchTypeMenu = this.switchTypeMenu.bind(this);

		this.renderListAccountHorizontal =
			this.renderListAccountHorizontal.bind(this);
		this.renderListAccountsVertical =
			this.renderListAccountsVertical.bind(this);
		this.cancelPrompt = this.cancelPrompt.bind(this);
		this.submitPrompt = this.submitPrompt.bind(this);
		this.renderListAccount = this.renderListAccount.bind(this);
		this.renderHeaderDrawer = this.renderHeaderDrawer.bind(this);
		this.renderBodyDrawer = this.renderBodyDrawer.bind(this);
		this.renderBarShowListAccount =
			this.renderBarShowListAccount.bind(this);
		this.renderPrompt = this.renderPrompt.bind(this);
		this.onPressListAccountsHorizontal =
			this.onPressListAccountsHorizontal.bind(this);
		this.onPressListAccountsVertical =
			this.onPressListAccountsVertical.bind(this);
		this.setNewPinSuccessCallback =
			this.setNewPinSuccessCallback.bind(this);
		this.setNewPinErrorCallback = this.setNewPinErrorCallback.bind(this);
		this.forgotPinSuccessCb = this.forgotPinSuccessCb.bind(this);
		this.forgotPinCallback = this.forgotPinCallback.bind(this);
	}

	callbackAfterReconnect() {
		if (this.username && this.password) {
			this.props.actions.login(
				this.username,
				this.password,
				null,
				this.loginError,
				null,
				null,
				null,
				this.loginSuccessCallback
			);
		}
	}

	changeMenuSelected(newMenu) {
		console.log(`Change menu to ${newMenu}`);
		this.isMount &&
			this.setState({
				menuSelected: newMenu
			});
	}

	showFormLogin(successCallback, params) {
		if (dataStorage.isLockTouchID && Platform.OS === 'ios') {
			offTouchIDSetting(this.props.authSettingActions.turnOffTouchID);
		}
		if (successCallback) {
			this.showFormLoginSuccessCallback = successCallback;
		}
		this.params = params || [];
		this.authenPin && this.authenPin.showModalAuthenPin();
	}

	authenPinFail() {
		this.authenPin && this.authenPin.authenFail();
	}

	forgotPinCallback(pin, token) {
		this.pin = pin;
		this.token = token;
		this.props.actions.authSuccess();
		forgotPinWithAccessToken(
			pin,
			token,
			this.setNewPinSuccessCallback,
			this.setNewPinErrorCallback
		);
	}

	setNewPinSuccessCallback() {
		// set new pin success
		this.props.authSettingActions.setPinSuccess();
		logDevice('error', `FORGOT PIN SUCCESS`);
		this.props.navigator.dismissModal();
	}

	setNewPinErrorCallback(err) {
		console.log(err);
		logDevice('error', `FORGOT PIN ERROR`);
	}

	forgotPinSuccessCb(accessToken) {
		const email = dataStorage.emailLogin;
		dataStorage.numberFailEnterPin = 0;
		// func.setLoginConfig(false);
		setTimeout(() => {
			if (Platform.OS === 'ios') {
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
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new',
						token: accessToken,
						email,
						forgotPinCallback: this.forgotPinCallback,
						isShowCancel: true,
						cancelAutoLoginFn: () => {
							this.props.navigator.dismissModal();
						}
					}
				});
			} else {
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
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						type: 'new',
						token: accessToken,
						email,
						forgotPinCallback: this.forgotPinCallback
					}
				});
			}
		}, 500);
	}

	onForgotPin() {
		Keyboard.dismiss();
		this.authenPin && this.authenPin.hideModalAuthenPin();
		setTimeout(() => {
			this.setState({
				isForgotPinModalVisible: true
			});
		}, 500);
	}

	_onPinCompleted(pincode) {
		const store = Controller.getGlobalState();
		const login = store.login;
		const refreshToken = login.loginObj.refreshToken;
		pinComplete(
			pincode,
			this.authenPin,
			this.showFormLoginSuccessCallback,
			this.authenPinFail,
			this.params,
			refreshToken
		);
	}

	onChangeAuthenByFingerPrint() {
		this.authenPin && this.authenPin.hideModalAuthenPin();
		let objAndroidTouchIDFn = null;
		if (Platform.OS === 'android') {
			objAndroidTouchIDFn = {
				showAndroidTouchID: this.showAndroidTouchID,
				hideAndroidTouchID: this.hideAndroidTouchID,
				androidTouchIDFail: this.androidTouchIDFail
			};
		}
		this.auth.authentication(
			this.showFormLoginSuccessCallback,
			null,
			objAndroidTouchIDFn
		);
	}

	newOrderFunc() {
		this.switchTab(ENUM.MENU_SELECTED.order);
	}

	switchToSetting() {
		this.switchTab(ENUM.MENU_SELECTED.settings);
	}

	authFunction(cb) {
		try {
			if (dataStorage.pinSetting !== 0) {
				cb && cb();
			} else {
				let objAndroidTouchIDFn = null;
				if (Platform.OS === 'android') {
					objAndroidTouchIDFn = {
						showAndroidTouchID: this.showAndroidTouchID,
						hideAndroidTouchID: this.hideAndroidTouchID,
						androidTouchIDFail: this.androidTouchIDFail
					};
				}
				this.auth.authentication(cb, null, objAndroidTouchIDFn);
			}
		} catch (error) {
			console.log(
				'authFunction Drawer ios logAndReport exception: ',
				error
			);
			logAndReport(
				'authFunction price exception',
				error,
				'authFunction price'
			);
		}
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'menu_ios':
					this.props.navigator.toggleDrawer({
						side: 'left',
						animated: true
					});
					break;
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.drawerIOS);
					this.props.actions.resetLogin();
					Keyboard.dismiss();
					Picker.hide();
					break;
				case 'didAppear':
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	playSound() {
		var beepSound = new Sound('beep.mp3', Sound.MAIN_BUNDLE, (error) => {
			if (error) {
				console.log('beepSound - failed to load the sound', error);
			} else {
				console.log(
					'beepSound - duration in seconds: ' +
						beepSound._duration +
						' number of channels: ' +
						beepSound._numberOfChannels
				);
				console.log('beepSound - play attempt');
				beepSound.play((test) => {
					console.log('beepSound - TEST');
					if (test) {
						console.log(
							'beepSound - successfully finished playing'
						);
						Vibration.cancel();
					} else {
						console.log(
							'beepSound - playback failed due to audio decoding errors'
						);
					}
				});
			}
		});
	}

	loginError(error, isLockedAccount = false) {
		if (isLockedAccount) {
			this.isMount &&
				this.setState({
					promptVisible: false
				});
			setTimeout(() => {
				this.lockPrompt && this.lockPrompt.showModal();
			}, 500);
		} else {
			this.errorCb && this.errorCb();
			setTimeout(() => {
				if (Controller.getVibrate()) {
					Vibration.vibrate(1000);
				}
				this.playSound();
			}, 500);
			// this.isMount && this.setState({
			//   animation: 'shake'
			// }, this.playSound.bind(this));
			// console.log('PPPP');
		}
	}

	closeSignInPopUp() {
		this.isMount &&
			this.setState({
				promptVisible: false,
				isLogin: true,
				errorLogin: ''
			});
	}

	loginSuccessCallback(cb) {
		if (cb) {
			this.reloadAfterLoginCallback = cb;
			// setTimeout(() => {
			this.reviewPrompt && this.reviewPrompt.showModal();
			// }, 1000)
		}
	}

	handleBackAndroid = this.handleBackAndroid.bind(this);
	handleBackAndroid() {
		try {
			if (config.environment === ENVIRONMENT.IRESS_DEV2) {
				return false;
			} else {
				return true;
			}
		} catch (error) {
			console.log('back android error', error);
		}
	}

	addBackHandleAndroid = this.addBackHandleAndroid.bind(this);
	addBackHandleAndroid() {
		Platform.OS === 'android' &&
			BackHandler.addEventListener(
				'hardwareBackPress',
				this.handleBackAndroid
			);
	}

	componentDidMount() {
		super.componentDidMount();
		this.isMount = true;
		this.isMount &&
			this.setState({ afterLogin: Controller.getLoginStatus() });
		this.addListenerForceRender();
		this.updateData();
		this.updateListAccounts();
		this.updateNewsUnread();
		this.addBackHandleAndroid();
		ManageConnection.dicConnection.updateDrawer = (themename) => {
			StatusBar.setBarStyle(
				themename === THEME.LIGHT ? 'dark-content' : 'light-content'
			);
			this.setState({ isReload: !this.state.isReload });
		};
	}

	updateNewsUnread() {
		setTimeout(() => {
			const channel = ENUM.CHANNEL_COUNT.MENU_NEWS;
			NewsBusiness.getCountAndUpdateTotalUnreaded(channel);
		}, 1000);
	}

	updateData() {
		fbemit.addListener('account', 'update', (data) => {
			this.updateDataCallback(data);
		});
	}

	forceRender = this.forceRender.bind(this);
	forceRender() {
		this.setState({
			afterLogin: Controller.getLoginStatus()
		});
	}

	addListenerForceRender = this.addListenerForceRender.bind(this);
	addListenerForceRender() {
		const channel = getChannelForceRenderDrawer();
		Emitter.addListener(channel, this.id, this.forceRender);
	}

	updateListAccounts() {
		fbemit.addListener('account', 'update_list_account', (listAccounts) => {
			this.updateListAccountsCallback(listAccounts);
		});
	}

	updateDataCallback(data) {
		this.isMount && this.setState({ currentAccount: data });
	}

	updateListAccountsCallback(listAccounts) {
		if (this.isMount) {
			// Sub list account
			Util.subListAccount(listAccounts, false, false);
			const currentAccountID = dataStorage.accountId;
			const isExitInListAccount = Util.checkExitInListAccounts(
				currentAccountID,
				listAccounts
			);
			let currentAccount = { ...this.state.currentAccount };
			if (!isExitInListAccount) {
				// Load lại dữ liệu với account id = first account id
				const firstAccountID = listAccounts[0].account_id || '';
				if (firstAccountID) {
					const userID = Controller.getUserId();
					const accountInfo = listAccounts[0];
					dataStorage.currentAccount = accountInfo || {}; // Set lai current account
					Controller.setCurrentAccount(accountInfo || {});
					currentAccount = accountInfo || {};
					func.setAccountId(firstAccountID);
					reloadDataAfterChangeAccount(firstAccountID);
					// Lưu last account vào local storage
					Util.saveLastAccount(userID, accountInfo);
				}
			}
			fbemit.emit(CHANNEL.ACCOUNT, EVENT.FINISH_UPDATE_LIST_ACCOUNT, {});
			this.isMount &&
				this.setState({
					currentAccount,
					listAccounts
				});
		}
	}

	componentWillUnmount() {
		this.isMount = false;
		BackHandler.removeEventListener(
			'hardwareBackPress',
			this.handleBackButton
		);
		const channel = getChannelForceRenderDrawer();
		Emitter.deleteEventById(channel, this.id);
	}

	navigationView() {
		return (
			<View style={{ flex: 1, backgroundColor: '#fff' }}>
				<Text
					style={{
						margin: 10,
						fontSize: CommonStyle.font15,
						textAlign: 'left'
					}}
				>
					I'm in the Drawer!
				</Text>
			</View>
		);
	}

	_openWhatsNewModal() {
		this.props.navigator.showModal({
			screen: 'equix.WhatsNew',
			animated: false,
			animationType: 'fade',
			navigatorStyle: {
				...CommonStyle.navigatorModalSpecialNoHeader,
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				closeModal: () => this.props.navigator.dismissModal(),
				isShow: true
			}
		});
	}

	closeDrawer() {
		this.props.navigator.toggleDrawer({
			side: 'left',
			animated: true,
			to: 'closed'
		});
	}

	switchForm(menuSelected, screen, arg, isBypass, initialPage) {
		let title = screen.slice(6);
		let subtitle = null;
		let backMore = false;
		let passProps = {};
		switch (menuSelected) {
			case ENUM.MENU_SELECTED.watchlist:
				title = I18n.t('WatchListTitle');
				break;
			case ENUM.MENU_SELECTED.watchlist_drawer:
				title = I18n.t('WatchListTitle');
				break;
			case ENUM.MENU_SELECTED.marketOverview:
				title = I18n.t('overview');
				break;
			case ENUM.MENU_SELECTED.alert:
				title = I18n.t('alertUpper');
				break;
			case ENUM.MENU_SELECTED.newAlert:
				title = I18n.t('newAlertUpper');
				break;
			case ENUM.MENU_SELECTED.portfolio:
				const navInfo = Business.getNavigatorPortfolio();
				title = navInfo.title;
				subtitle = navInfo.subtitle;
				break;
			case ENUM.MENU_SELECTED.reports:
				title = I18n.t('insights');
				break;
			case ENUM.MENU_SELECTED.reportsFromFile:
				title = I18n.t('tradeActivity');
				break;
			case ENUM.MENU_SELECTED.appInfo:
				title = I18n.t('appInfoTitle');
				break;
			case ENUM.MENU_SELECTED.termOfUse:
				title = 'Disclaimer';
				backMore = true;
				break;
			case ENUM.MENU_SELECTED.account:
				title = I18n.t('userInfo');
				break;
			case ENUM.MENU_SELECTED.userInfo:
				title = I18n.t('userInfoNew');
				break;
			case ENUM.MENU_SELECTED.news:
				title = I18n.t('News');
				break;
			case ENUM.MENU_SELECTED.order:
				title = I18n.t('newOrder');
				break;
			case ENUM.MENU_SELECTED.orders:
				title = I18n.t('ordersUpper');
				break;
			case ENUM.MENU_SELECTED.settings:
				title = I18n.t('settings');
				break;
			case ENUM.MENU_SELECTED.contractNote:
				title = I18n.t('contractNote');
				break;
			case ENUM.MENU_SELECTED.businessLog:
				title = I18n.t('activities');
				break;
			case ENUM.MENU_SELECTED.theme:
				title = I18n.t('themes');
				break;
			case ENUM.MENU_SELECTED.textSizeSetting:
				title = I18n.t('textSizeSetting');
				break;
			case ENUM.MENU_SELECTED.news_v3:
				title = I18n.t('news_v3');
				break;
			case ENUM.MENU_SELECTED.watchlist_mt_panel:
				title = I18n.t('WatchListTitle');
				break;
		}
		const obj = {};
		obj.title = title;
		obj.subtitle = subtitle;
		obj.menuSelected = menuSelected;
		obj.arg = arg;
		obj.initialPage = initialPage;
		if (isBypass || menuSelected !== this.state.menuSelected) {
			this.isMount &&
				this.setState({
					menuSelected
				});
			pushScreenToCurrentTab({
				screen,
				title,
				backMore,
				passProps
			});
			this.screenObject[screen] = screen;
		}
	}

	switchTab(menuSelected, isBypass, initialPage = 0, isClose) {
		if (menuSelected !== ENUM.MENU_SELECTED.watchlist_drawer) {
			func.setTabActive('');
		}
		!isClose && this.closeDrawer();
		switch (menuSelected) {
			case ENUM.MENU_SELECTED.marketOverview:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.marketOverview;
				this.switchForm(menuSelected, 'equix.NewOverview');
				break;
			case ENUM.MENU_SELECTED.alert:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.alert;
				this.switchForm(menuSelected, 'equix.Alerts', {});
				break;
			case ENUM.MENU_SELECTED.newAlert:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.newAlert;
				this.switchForm(menuSelected, 'equix.NewAlert', {
					passProps: {
						isHideBackButton: true
					}
				});
				break;
			case ENUM.MENU_SELECTED.watchlist:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.watchlist;
				this.switchForm(menuSelected, 'equix.Trade');
				break;
			case ENUM.MENU_SELECTED.watchlist_drawer:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.watchlist_drawer;
				this.switchForm(menuSelected, 'equix.TradeDrawer');
				break;
			case ENUM.MENU_SELECTED.news:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.news;
				if (Controller.getLoginStatus()) {
					this.switchForm(
						menuSelected,
						'equix.News',
						{},
						isBypass,
						initialPage
					);
				} else {
					this.switchForm(
						menuSelected,
						'equix.Everything',
						{},
						isBypass,
						initialPage
					);
				}
				break;
			case ENUM.MENU_SELECTED.order:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.order;
				this.switchForm(menuSelected, 'equix.Order', {
					passProps: {
						isHideBackButton: true
					}
				});
				break;
			case ENUM.MENU_SELECTED.orders:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.orders;
				this.switchForm(
					menuSelected,
					'equix.Orders',
					{},
					isBypass,
					initialPage
				);
				break;
			case ENUM.MENU_SELECTED.portfolio:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.portfolio;
				this.switchForm(menuSelected, 'equix.Portfolio', {});
				break;
			case ENUM.MENU_SELECTED.reports:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.reports;
				this.switchForm(menuSelected, 'equix.Report', {});
				break;
			case ENUM.MENU_SELECTED.reportsFromFile:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.reportsFromFile;
				this.switchForm(menuSelected, 'equix.ReportFromFile', {});
				break;
			case ENUM.MENU_SELECTED.account:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.account;
				this.switchForm(menuSelected, 'equix.User', {});
				break;
			case ENUM.MENU_SELECTED.userInfo:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.userInfo;
				this.switchForm(menuSelected, 'equix.UserInfo', {});
				break;
			case ENUM.MENU_SELECTED.theme:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.theme;
				this.switchForm(menuSelected, 'equix.Themes', {});
				break;
			case ENUM.MENU_SELECTED.helpCenter:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.helpCenter;
				Linking.openURL(ENUM.LINK_HELP_CENTER);
				break;
			case ENUM.MENU_SELECTED.languageOptions:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.languageOptions;
				this.switchForm(menuSelected, 'equix.LanguageOptions', {});
				break;
			case ENUM.MENU_SELECTED.appInfo:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.appInfo;
				this.switchForm(menuSelected, 'equix.AboutUs', {});
				break;
			case ENUM.MENU_SELECTED.termOfUse:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.termOfUse;
				this.switchForm(menuSelected, 'equix.Disclaimer', {});
				break;
			case ENUM.MENU_SELECTED.settings:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.settings;
				this.switchForm(menuSelected, 'equix.Setting');
				break;
			case 'Logs':
				this.switchForm(menuSelected, 'equix.Logs', {});
				break;
			case ENUM.MENU_SELECTED.contractNote:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.contractNote;
				this.switchForm(menuSelected, 'equix.ContractNote', {});
				break;
			case ENUM.MENU_SELECTED.businessLog:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.businessLog;
				this.switchForm(menuSelected, 'equix.BusinessLog', {});
				break;
			case ENUM.MENU_SELECTED.textSizeSetting:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.textSizeSetting;
				this.switchForm(menuSelected, 'equix.TextSizeSetting', {});
				break;
			case ENUM.MENU_SELECTED.news_v3:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.news_v3;
				this.switchForm(menuSelected, 'equix.NewsV3', {});
				break;
			case ENUM.MENU_SELECTED.watchlist_mt_panel:
				dataStorage.menuSelected =
					ENUM.MENU_SELECTED.watchlist_mt_panel;
				this.switchForm(menuSelected, 'equix.WatchListMtPanel', {});
				break;
			case ENUM.MENU_SELECTED.activities:
				dataStorage.menuSelected = ENUM.MENU_SELECTED.activities;
				this.switchForm(menuSelected, 'equix.Activities', {});
				break;
		}
	}

	loginFunc() {
		// Reset auth loading when forgot pin crash
		this.props.actions.authCancel();
		this.props.actions.loginCancel();
		this.closeDrawer();
		Navigation.startSingleScreenApp({
			screen: {
				screen: 'equix.Home',
				navigatorStyle: {
					drawUnderNavBar: true,
					navBarHidden: true,
					navBarHideOnScroll: false,
					statusBarTextColorScheme: 'light',
					navBarNoBorder: true
				}
			},
			appStyle: {
				orientation: 'portrait'
			},
			animated: true,
			animationType: 'fade',
			passProps: {
				comeFromeGuest: true
			}
		});
	}

	configLogout() {
		this.props.actions.logout(this.props.navigator);
		this.props.actions.resetNotiNews();
	}

	openModal() {
		this.isMount && this.setState({ visiblePopup: true });
	}

	closeModal() {
		this.isMount && this.setState({ visiblePopup: false });
	}

	confirmedLogout(isConfirmed) {
		if (isConfirmed) {
			this.props.actions.logout(this.props.navigator);
		}
	}

	componentWillReceiveProps(nextProps) {
		this.isMount &&
			this.setState({
				errorLogin: nextProps.login.error,
				errorForgot: nextProps.login.errorForgot,
				news_unread: nextProps.notiStatus.unread || 0,
				order_unread: nextProps.unread || 0,
				newsReadOverview: nextProps.notiStatus.readOverview,
				orderReadOverview: nextProps.readOverview || false
			});
		if (
			nextProps.login.isLocked &&
			nextProps.login.isLogin &&
			this.showAlert
		) {
			this.showAlert = false;
			this.logoutWhenAccountIsLocked = this.props.actions.logout.bind(
				this,
				this.props.navigator
			);
			this.props.navigator.showModal({
				screen: 'equix.PromptNew',
				animated: true,
				animationType: 'fade',
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
			});
		}
	}

	checkEmail() {
		setTimeout(
			() =>
				Alert.alert('', I18n.t('pleaseCheckEmail'), [
					{
						text: I18n.t('ok')
					}
				]),
			1000
		);
	}

	setLoginUserType(accountInfo, cb) {
		const k = accountInfo;
		func.setAccountId(k.account_id);
		// check account reviews
		if (k.status === 'inactive') {
			// Tài khoản bị khoá
			// this.props.appActions.checkReviewAccount(false)
			this.props.appActions.setLoginUserType(loginUserType.LOCKED);
			dataStorage.isLockedAccount = true;
			dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
			this.lockPrompt && this.lockPrompt.showModal();
			cb && cb();
		} else {
			// Redux - isReviewAccount = falses
			// Tài khoản member
			// this.props.appActions.checkReviewAccount(false)
			this.props.appActions.setLoginUserType(loginUserType.MEMBER);
			dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
			dataStorage.isLockedAccount = false;
			cb && cb();
		}
	}

	getDemoText() {
		const env = config.environment;
		if (env === 'BETA') {
			return I18n.t('betaUpper');
		}
		return I18n.t('demoUpper');
	}

	styleDisable = (roleName) => {
		return checkRoleByKey(roleName) ? 0.87 : 0.6;
	};

	renderNewAlert = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_VIEW_NEW_ALERT)) return null;
		const isLogin = Controller.getLoginStatus();
		if (!isLogin) return null;
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.newAlert;

		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.newAlert);
				}}
			>
				<Icon
					testID={`iconNewAlert`}
					name="add-alert"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`newAlert`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('newAlert')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderAlerts = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_VIEW_ALERT)) return null;
		const isLogin = Controller.getLoginStatus();
		if (!isLogin) return null;
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.alert;
		// checkRoleByKey()
		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.alert);
				}}
			>
				<Icon
					testID={`iconAlert`}
					name="notifications-none"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`alert`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('alert')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderSearch = () => {
		const isLogin = Controller.getLoginStatus();
		if (!isLogin) return null;
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.search;
		// checkRoleByKey()
		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					// this.switchTab(ENUM.MENU_SELECTED.search)
				}}
			>
				<Icon
					testID={`iconSearch`}
					name="search"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`search`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('search')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderMartketOverView = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_MARKET_OVERVIEW)) return null;
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.marketOverview;

		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.marketOverview);
				}}
			>
				<Icon
					testID={`iconOverview`}
					name="show-chart"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`marketOverview`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('marketOverview')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderNewOrder = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_NEW_ORDER)) return null;
		const { afterLogin, menuSelected } = this.state;
		const { app } = this.props;
		const { isNotHaveAccount } = dataStorage;
		const isLogin = Controller.getLoginStatus();
		const selected = menuSelected === ENUM.MENU_SELECTED.order;

		if (
			!afterLogin ||
			(isLogin &&
				(app.loginUserType === loginUserType.REVIEW ||
					isNotHaveAccount ||
					app.loginUserType === loginUserType.LOCKED))
		) {
			return null;
		}

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					dataStorage.openOrderFromMenu = true;
					this.authFunction(this.newOrderFunc);
				}}
			>
				<Icon
					name="add-circle"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`newOrder`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('newOrder')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderOrders = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_ORDERS)) return null;
		const { afterLogin, menuSelected, orderReadOverview } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.orders;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.orders);
				}}
			>
				<Icon
					name="swap-vert"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`orders`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('Orders')}
				</Text>
				{orderReadOverview ? null : (
					<View style={{ alignItems: 'flex-end', flex: 1 }}>
						<BadgeIcon
							badge={true}
							channel={ENUM.CHANNEL_COUNT.MENU_ORDERS}
						/>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	renderPorfolio = () => {
		if (
			!checkRoleByKey(ROLE_USER.ROLE_PORTFOLIO_SUMMARY) &&
			!checkRoleByKey(ROLE_USER.ROLE_PORTFOLIO_HOLDING_PERFORMANCE)
		) {
			return null;
		}
		const { afterLogin, menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.portfolio;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.portfolio);
				}}
			>
				<Icon
					name="web"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`portfolio`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('portfolio')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderWatchlistMultiplePanel = () => {
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.watchlist_mt_panel;
		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				{...setTestId.testProp(
					'Id_Menu_WatchlistMultiplePanel_Guest',
					'Label_Menu_WatchlistMultiplePanel_Guest'
				)}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.watchlist_mt_panel);
				}}
			>
				<MaterialCommunityIcons
					testID={`newsScreen`}
					name="newspaper"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`news`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('WatchListTitle')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderWatchlist = () => {
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.watchlist_drawer;
		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				{...setTestId.testProp(
					'Id_Menu_Watchlist_Guest',
					'Label_Menu_Watchlist_Guest'
				)}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.watchlist_drawer);
				}}
			>
				<MaterialCommunityIcons
					testID={`newsScreen`}
					name="view-list"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`watchlist`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('WatchListTitle')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderNews = () => {
		if (checkDisableScreenByRole(ROLE_USER.ROLE_NEWS)) return null;
		if (!checkRoleByKey(ROLE_USER.ROLE_NEWS)) return null;
		const isLogin = Controller.getLoginStatus();
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.news_v3;

		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				{...setTestId.testProp(
					'Id_Menu_News_Guest',
					'Label_Menu_News_Guest'
				)}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.news_v3);
				}}
			>
				<MaterialCommunityIcons
					testID={`newsScreen`}
					name="newspaper"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`news`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('News')}
				</Text>
				{isLogin ? (
					<View
						style={{
							alignItems: 'flex-end',
							flex: 1,
							paddingRight: 16
						}}
					>
						<BadgeIcon
							badge={true}
							channel={ENUM.CHANNEL_COUNT.MENU_NEWS}
						/>
					</View>
				) : (
					<View />
				)}
			</TouchableOpacity>
		);
	};

	renderContractNotes = () => {
		if (checkDisableScreenByRole(ROLE_USER.ROLE_CONTRACT_NOTES)) {
			return null;
		}
		if (
			!checkRoleByKey(ROLE_USER.ROLE_CONTRACT_NOTES) ||
			config.logoInApp === 'IRESS'
		) {
			return null;
		}
		const { afterLogin, menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.contractNote;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				// disabled={true}
				// style={[styles.midRowContainer, { opacity: 0.54 }]}
				style={[styles.midRowContainer]}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.contractNote);
				}}
			>
				<MaterialCommunityIcons
					name="file-outline"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`contractNote`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('contractNote')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderInsight = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_REPORTS)) return null;
		const { afterLogin, menuSelected } = this.state;
		const { app } = this.props;
		const selected = menuSelected === ENUM.MENU_SELECTED.reports;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				disabled={!app.isConnected}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.reports);
				}}
			>
				<MaterialCommunityIcons
					name="file-chart"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [
									CommonStyle.iconDrawer,
									{ opacity: app.isConnected ? 0.87 : 0.6 }
							  ]
					}
				/>
				<Text
					testID={`insights`}
					allowFontScaling={false}
					style={
						!app.isConnected
							? CommonStyle.textMenuDisabled
							: selected
							? CommonStyle.textMenuDrawerSelected
							: CommonStyle.textMenuDrawer
					}
				>
					{I18n.t('insights')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderReports = () => {
		if (
			!checkRoleByKey(ROLE_USER.ROLE_REPORTS_FROM_FILE) ||
			config.logoInApp === 'IRESS'
		) {
			return null;
		}
		const { afterLogin, menuSelected } = this.state;
		const { app } = this.props;
		const selected = menuSelected === ENUM.MENU_SELECTED.reportsFromFile;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				// disabled={true}
				// style={[styles.midRowContainer, { opacity: 0.54 }]}
				style={[styles.midRowContainer]}
				disabled={!app.isConnected}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.reportsFromFile);
				}}
			>
				<FontAwesomeIcon
					name="line-chart"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [
									CommonStyle.iconDrawer,
									{ opacity: app.isConnected ? 0.87 : 0.6 }
							  ]
					}
				/>
				<Text
					testID={`reports`}
					allowFontScaling={false}
					style={
						!app.isConnected
							? CommonStyle.textMenuDisabled
							: selected
							? CommonStyle.textMenuDrawerSelected
							: CommonStyle.textMenuDrawer
					}
				>
					{I18n.t('reports')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderActivities = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_ACTIVITIES)) return null;
		const { afterLogin, menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.activities;

		// if (!afterLogin) return <View />; // Truoc commit nay thi co loi gi do ko hien thi menu check sau
		return (
			<TouchableOpacity
				style={styles.midRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.activities);
				}}
			>
				<MaterialIcons
					name="show-chart"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`marketActivity`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('marketActivity')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderMore = () => {
		return (
			<Text
				allowFontScaling={false}
				style={{
					fontSize: CommonStyle.fontSizeXS,
					fontWeight: 'bold',
					paddingLeft: 6,
					color: CommonStyle.fontColor
				}}
			>
				{I18n.t('More')}
			</Text>
		);
	};

	async authenBeforeSwitchForm(cb) {
		// By pass auth with IRESS MOBILE
		return cb && cb();
	}

	renderSetting = () => {
		if (!checkRoleByKey(ROLE_USER.ROLE_SETTINGS)) return null;
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.settings;

		return (
			<TouchableOpacityOpt
				style={styles.botRowContainer}
				onPress={() =>
					this.authenBeforeSwitchForm(this.switchToSetting)
				}
			>
				<Icon
					name="settings"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`settings`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('settings')}
				</Text>
			</TouchableOpacityOpt>
		);
	};

	renderAccount = () => {
		if (
			!checkRoleByKey(ROLE_USER.ROLE_ACCOUNT) ||
			config.logoInApp === 'IRESS'
		) {
			return null;
		}
		const { afterLogin, menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.account;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.account);
				}}
			>
				<FontAwesomeIcon
					name="user-circle"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`accountInfo`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('accountInfo')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderUserInfo = () => {
		if (config.logoInApp === 'IRESS') return null;
		const { afterLogin, menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.userInfo;

		if (!afterLogin) return <View />;

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.userInfo);
				}}
			>
				<Icon
					name="person-outline"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`userInfoNew`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('userInfoNew')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderThemes = () => {
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.theme;

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.theme);
				}}
			>
				<Icon
					name="brightness-6"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`themes`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('themes')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderHelpCenter = () => {
		if (config.logoInApp === 'IRESS') return null;
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.helpCenter;

		return (
			<TouchableOpacity
				// disabled={true}
				// style={[styles.botRowContainer, { opacity: 0.54 }]}
				style={[styles.botRowContainer]}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.helpCenter);
				}}
			>
				<MaterialCommunityIcons
					testID={`helpCenter`}
					name="help-circle"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`helpCenter`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('helpCenter')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderLogOut = () => {
		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() =>
					this.state.afterLogin ? this.openModal() : this.loginFunc()
				}
			>
				<Icon
					name="input"
					style={
						this.state.menuSelected === 'Login'
							? CommonStyle.iconDrawerSelected
							: CommonStyle.iconDrawer
					}
				/>
				<Text
					testID={`logOut`}
					allowFontScaling={false}
					style={
						this.state.menuSelected === 'Login'
							? CommonStyle.textMenuDrawerSelected
							: CommonStyle.textMenuDrawer
					}
				>
					{this.state.afterLogin ? I18n.t('logout') : I18n.t('login')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderLanguageOptions = () => {
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.languageOptions;

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.languageOptions);
				}}
			>
				<MaterialCommunityIcons
					testID={`languageOptions`}
					name="translate"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`languageOptions`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('language')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderAboutUs = () => {
		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.appInfo);
				}}
			>
				<Ionicons
					testID="iconInfo"
					name="ios-information-circle-outline"
					style={
						this.state.menuSelected === ENUM.MENU_SELECTED.appInfo
							? CommonStyle.iconDrawerSelected
							: CommonStyle.iconDrawer
					}
				/>
				<Text
					testID={`aboutUs`}
					allowFontScaling={false}
					style={
						this.state.menuSelected === ENUM.MENU_SELECTED.appInfo
							? CommonStyle.textMenuDrawerSelected
							: CommonStyle.textMenuDrawer
					}
				>
					{I18n.t('appInfoTitle')}
				</Text>
			</TouchableOpacity>
		);
	};

	renderWhatsNew = () => {
		const disabled = Business.checkDisableWhatsNew();
		return this.state.afterLogin &&
			checkRoleByKey(ROLE_USER.ROLE_WHATS_NEW) ? (
			<TouchableOpacity
				disabled={disabled}
				style={[
					styles.botRowContainer,
					{ opacity: disabled ? 0.54 : 1 }
				]}
				onPress={() => {
					this.closeDrawer();
					openWhatsNewModal(this.props.navigator, false);
				}}
			>
				<Icon
					name="volume-up"
					style={
						this.state.menuSelected === 'WhatsNew'
							? CommonStyle.iconDrawerSelected
							: CommonStyle.iconDrawer
					}
				/>
				<Text
					testID={`whatsNew`}
					allowFontScaling={false}
					style={
						this.state.menuSelected === 'WhatsNew'
							? CommonStyle.textMenuDrawerSelected
							: CommonStyle.textMenuDrawer
					}
				>
					{I18n.t('whatsNew')}
				</Text>
			</TouchableOpacity>
		) : (
			<View />
		);
	};

	renderTermOfUse = () => {
		return checkRoleByKey(ROLE_USER.ROLE_TERM_OF_USER) ? (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.termOfUse);
				}}
			>
				<MaterialCommunityIcons
					name="shield-check-outline"
					style={
						this.state.menuSelected === ENUM.MENU_SELECTED.termOfUse
							? CommonStyle.iconDrawerSelected
							: CommonStyle.iconDrawer
					}
				/>
				<Text
					testID={`discalaimer`}
					allowFontScaling={false}
					numberOfLines={2}
					style={[
						this.state.menuSelected === ENUM.MENU_SELECTED.termOfUse
							? CommonStyle.textMenuDrawerSelected
							: CommonStyle.textMenuDrawer,
						{ paddingRight: 16 }
					]}
				>
					{I18n.t('disclaimer')}
				</Text>
			</TouchableOpacity>
		) : null;
	};

	switchTypeMenu() {
		if (this.state.flag) {
			this.isMount && this.setState({ animation1: 'fadeOutUp' });
			Animated.timing(this.spinValue, {
				toValue: 0,
				duration: 200,
				easing: Easing.linear,
				useNativeDriver: true
			}).start();
		} else {
			this.isMount && this.setState({ animation2: 'fadeOutDown' });
			Animated.timing(this.spinValue, {
				toValue: 1,
				duration: 200,
				easing: Easing.linear,
				useNativeDriver: true
			}).start();
		}
	}

	onPressListAccountsHorizontal(k) {
		if (
			k.status === 'inactive' &&
			dataStorage.currentScreenId === ScreenId.ORDER
		) {
			return false;
		}
		const userId = Controller.getUserId();
		const curAccountId = dataStorage.accountId;
		unregisterAllMessage(curAccountId);
		this.refs &&
			this.refs[`${k.account_id}view`] &&
			this.refs[`${k.account_id}view`].fadeOutLeft(200);
		this.isMount && this.setState({ animation3: 'fadeOutLeft' });
		// check account review
		this.setLoginUserType(k, () => {
			dataStorage.isChangeAccountFromDrawer = true;
			reloadDataAfterChangeAccount(k.account_id);
			this.isMount &&
				this.setState({ currentAccount: k, animation3: '' }, () => {
					this.closeDrawer();
					Util.saveLastAccount(userId, k);
				});
		});
		Animated.timing(this.spinValue, {
			toValue: 0,
			duration: 200,
			easing: Easing.linear,
			useNativeDriver: true
		}).start();
		return true;
	}

	renderListAccountHorizontal(k) {
		if (k && this.state.currentAccount.account_id !== k.account_id) {
			return (
				<Animatable.View key={k.account_id} ref={`${k.account_id}view`}>
					<TouchableOpacity
						disabled={!this.props.app.isConnected}
						style={{
							backgroundColor: 'transparent',
							opacity: this.props.app.isConnected ? 1 : 0.7
						}}
						onPress={() => {
							this.onPressListAccountsHorizontal(k);
						}}
					>
						<View
							style={[
								styles.subAccount,
								{ backgroundColor: k.color }
							]}
						>
							<Text
								allowFontScaling={false}
								style={styles.subShortCutName}
							>
								{getShortcutName(k.account_name)}
							</Text>
						</View>
					</TouchableOpacity>
				</Animatable.View>
			);
		}
		return true;
	}

	onPressListAccountsVertical(k) {
		if (
			k.status === 'inactive' &&
			dataStorage.currentScreenId === ScreenId.ORDER
		) {
			return false;
		}
		// check account review
		const userId = Controller.getUserId();
		const curAccountId = dataStorage.accountId;
		unregisterAllMessage(curAccountId);
		this.setLoginUserType(k, () => {
			dataStorage.isChangeAccountFromDrawer = true;
			reloadDataAfterChangeAccount(k.account_id);
			this.isMount &&
				this.setState({ currentAccount: k, flag: 0 }, () => {
					Util.saveLastAccount(userId, k);
					this.closeDrawer();
					// reset listPosition
				});
		});
		// if (dataStorage.currentScreenId === ScreenId.ORDER) {
		// 	fbemit.emit('update_nav', 'update_nav', `${k.account_name || ''} (${k.account_id || ''})`);
		// }
		Animated.timing(this.spinValue, {
			toValue: 0,
			duration: 200,
			easing: Easing.linear,
			useNativeDriver: true
		}).start();
		return true;
	}

	renderListAccountsVertical(k) {
		const condition =
			k.status === 'inactive' &&
			dataStorage.currentScreenId === ScreenId.ORDER;
		if (k && this.state.currentAccount.account_id !== k.account_id) {
			return (
				<NewTouchableOpacity
					disabled={!this.props.app.isConnected}
					key={k.account_id}
					style={{
						opacity: this.props.app.isConnected ? 1 : 0.7,
						flexDirection: 'row',
						alignItems: 'center',
						paddingHorizontal: 16,
						paddingTop: 16
					}}
					onPress={() => {
						this.onPressListAccountsVertical(k);
					}}
				>
					<View style={{ backgroundColor: 'transparent' }}>
						<View
							style={[
								styles.subAccount1,
								{ backgroundColor: k.color }
							]}
						>
							<Text
								allowFontScaling={false}
								style={styles.subShortCutName}
							>
								{getShortcutName(k.account_name)}
							</Text>
						</View>
					</View>
					<Text
						allowFontScaling={false}
						style={[
							CommonStyle.textSubMedium,
							{
								flex: 1,
								paddingHorizontal: 16,
								color: condition
									? CommonStyle.fontDisable1
									: CommonStyle.fontColor
							}
						]}
					>
						{`${k.account_name || ''} (${k.account_id || ''})`}
					</Text>
				</NewTouchableOpacity>
			);
		}
		return true;
	}

	cancelPrompt() {
		this.isMount &&
			this.setState(
				{
					promptVisible: false,
					isLogin: true,
					errorLogin: ''
				},
				() => {
					this.props.actions.loginCancel();
				}
			);
	}

	submitPrompt(value, closeCb, errorCb) {
		// DONT DELETE - Clear accessToken, refreshToken, pin
		this.props.actions.clearToken(); // Clear accessToken, refreshToken, pin
		this.closeCb = closeCb;
		this.errorCb = errorCb;
		if (this.state.isLogin) {
			if (!value) return this.loginError();
			const data = value || {};
			if (!data.username || !data.password) return this.loginError();
			if (this.props.app.isConnected) {
				dataStorage.emailLogin = data.username.toLowerCase().trim();
				this.username = data.username;
				this.password = data.password;
				dataStorage.callbackAfterReconnect =
					this.callbackAfterReconnect;
				this.props.actions.loginRequest(data.username, data.password);
				this.props.actions.setLastEmail(data.username); // Save last email just entered
				setTimeout(() => {
					if (this.props.app.isConnected) {
						dataStorage.isLocked = true;
						this.props.actions.login(
							this.username,
							this.password,
							null,
							this.loginError,
							this.closeSignInPopUp,
							null,
							null,
							this.loginSuccessCallback
						);
					}
				}, 2000);
			} else {
				Alert.alert('', I18n.t('pleaseCheckConnection'), [
					{
						text: I18n.t('dismiss'),
						onPress: () =>
							this.isMount &&
							this.setState({ promptVisible: false }, () => {
								this.closeCb && this.closeCb();
								this.props.actions.loginCancel();
							}),
						style: 'cancel'
					}
				]);
			}
		} else {
			if (!value) return this.loginError();
			const data = value || {};
			if (!data.username) return this.loginError();
			if (this.props.app.isConnected) {
				this.props.actions.forgotPass(
					data.username,
					() => {
						this.closeCb && this.closeCb();
						this.isMount &&
							this.setState(
								{
									promptVisible: false,
									isLogin: true
								},
								() => {
									this.checkEmail();
								}
							);
					},
					this.loginError
				);
			} else {
				Alert.alert('', I18n.t('pleaseCheckConnection'), [
					{
						text: I18n.t('dismiss'),
						onPress: () =>
							this.isMount &&
							this.setState(
								{ promptVisible: false, isLogin: true },
								this.closeCb && this.closeCb()
							),
						style: 'cancel'
					}
				]);
			}
		}
		return true;
	}

	renderListAccount(accountInfo) {
		if (!Controller.getLoginStatus() || !this.state.listAccounts.length) {
			return null;
		}
		return (
			<View style={{ flexDirection: 'row' }}>
				<TouchableOpacity
					style={{
						width: '25%',
						height: '100%',
						backgroundColor: 'transparent'
					}}
					onPress={() => this.switchTab(ENUM.MENU_SELECTED.account)}
				>
					<Animatable.View
						ref={`mainview`}
						animation={this.state.animation3}
						duration={100}
						style={[
							styles.mainAccount,
							{ backgroundColor: CommonStyle.bgCircleDrawer }
						]}
					>
						<Text
							allowFontScaling={false}
							style={styles.mainShortCutName}
						>
							{getShortcutName(accountInfo.account_name)}
						</Text>
					</Animatable.View>
				</TouchableOpacity>
				{/* {
          this.state.flag === 0 && this.state.listAccounts ? <Animatable.View animation={this.state.animation2} style={{ flex: 1, justifyContent: 'flex-end', flexDirection: 'row' }}>
            <FlatList
              extraData={this.state.currentAccount}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={this.state.listAccounts}
              renderItem={({ item }) => this.renderListAccountHorizontal(item)}>
            </FlatList>
          </Animatable.View> : <View />} */}
			</View>
		);
	}

	renderBarShowListAccount(accountInfo, rotate) {
		if (!Controller.getLoginStatus()) return null;
		return (
			<View>
				<View
					style={{
						width: '100%',
						backgroundColor: 'transparent',
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
					{!accountInfo.email ? (
						!this.state.listAccounts.length ||
						this.state.listAccounts.length <= 1 ? (
							<Text
								allowFontScaling={false}
								numberOfLines={2}
								style={[
									CommonStyle.textMainHeaderDrawer,
									{ width: '60%' }
								]}
							>{`${accountInfo.account_name || ''} ${
								dataStorage.accountId
									? `(${dataStorage.accountId})`
									: ''
							}`}</Text>
						) : (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<TouchableOpacity
									disabled={false}
									style={{
										width: '70%',
										backgroundColor: 'transparent',
										justifyContent: 'center'
									}}
									onPress={this.switchTypeMenu}
								>
									<Text
										allowFontScaling={false}
										numberOfLines={2}
										style={CommonStyle.textMainHeaderDrawer}
									>{`${accountInfo.account_name || ''} ${
										dataStorage.accountId
											? `(${dataStorage.accountId})`
											: ''
									}`}</Text>
								</TouchableOpacity>
								<TouchableOpacity
									disabled={false}
									style={{
										width: '30%',
										height: 40,
										borderRadius: 20,
										justifyContent: 'center',
										alignItems: 'flex-start',
										bottom: 0,
										backgroundColor: 'transparent'
									}}
									onPress={this.switchTypeMenu}
								>
									<Animated.View
										style={{ transform: [{ rotate }] }}
									>
										<Icon
											name="chevron-right"
											size={24}
											color="#000"
											style={{
												backgroundColor: 'transparent'
											}}
										/>
									</Animated.View>
								</TouchableOpacity>
							</View>
						)
					) : !this.state.listAccounts.length ||
					  this.state.listAccounts.length <= 1 ? (
						<Text
							allowFontScaling={false}
							numberOfLines={2}
							style={[
								CommonStyle.textMainHeaderDrawer,
								{ width: '60%' }
							]}
						>{`${accountInfo.account_name || ''} ${
							dataStorage.accountId
								? `(${dataStorage.accountId})`
								: ''
						}`}</Text>
					) : (
						<TouchableOpacity
							style={CommonStyle.accountHeaderDrawerContainer}
							onPress={this.switchTypeMenu}
						>
							<Text
								allowFontScaling={false}
								numberOfLines={2}
								style={[
									{ width: '70%' },
									CommonStyle.textMainHeaderDrawer
								]}
							>{`${accountInfo.account_name || ''} ${
								dataStorage.accountId
									? `(${dataStorage.accountId})`
									: ''
							}`}</Text>
							<View style={{ width: '30%' }}>
								<AnimIcon
									name="chevron-right"
									size={24}
									color="#000"
									style={{
										width: 24,
										backgroundColor: 'transparent',
										transform: [{ rotate }]
									}}
								/>
							</View>
						</TouchableOpacity>
					)}
				</View>
				<View
					style={{
						width: '100%',
						backgroundColor: 'transparent',
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
					{accountInfo.email ? (
						!this.state.listAccounts.length ||
						this.state.listAccounts.length <= 1 ? (
							<Text
								allowFontScaling={false}
								style={CommonStyle.textSubHeaderDrawer}
							>
								{accountInfo.email}
							</Text>
						) : (
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<TouchableOpacity
									disabled={false}
									style={{
										width: '100%',
										backgroundColor: 'transparent',
										justifyContent: 'center'
									}}
									onPress={this.switchTypeMenu}
								>
									<Text
										allowFontScaling={false}
										style={CommonStyle.textSubHeaderDrawer}
									>
										{accountInfo.email}
									</Text>
								</TouchableOpacity>
							</View>
						)
					) : (
						<Text
							allowFontScaling={false}
							style={CommonStyle.textSubHeaderDrawer}
						>
							{accountInfo.email}
						</Text>
					)}
				</View>
			</View>
		);
	}

	renderHeaderDrawer() {
		return null;
		const isDemo = Controller.getLoginStatus() && Controller.isDemo();
		const isReview =
			Controller.getLoginStatus() &&
			this.props.app.loginUserType === loginUserType.REVIEW;
		const isNotHaveAccount =
			(Controller.getLoginStatus() && dataStorage.isNotHaveAccount) ||
			isViewOnly();
		const isLocked =
			Controller.getLoginStatus() &&
			this.props.app.loginUserType === loginUserType.LOCKED;
		let warningJSX = [];
		let index = 0;
		if (isDemo) {
			const zIndex = 4 - index;
			index++;
			warningJSX.push(
				<View
					key={`isDemo_${index}`}
					style={[CommonStyle.warningDrawer, { zIndex }]}
				>
					<Text
						allowFontScaling={false}
						style={CommonStyle.textWarningDrawer}
					>
						{this.getDemoText()}
					</Text>
				</View>
			);
		}
		if (isReview) {
			const zIndex = 4 - index;
			index++;
			warningJSX.push(
				<View
					key={`isReview_${index}`}
					style={[CommonStyle.warningDrawer, { zIndex }]}
				>
					<Text
						allowFontScaling={false}
						style={CommonStyle.textWarningDrawer}
					>
						{I18n.t('reviewWarning')}
					</Text>
				</View>
			);
		}
		if (isNotHaveAccount) {
			const zIndex = 4 - index;
			index++;
			warningJSX.push(
				<View
					key={`isNotHaveAccount_${index}`}
					style={[CommonStyle.warningDrawer, { zIndex }]}
				>
					<Text
						allowFontScaling={false}
						style={CommonStyle.textWarningDrawer}
					>
						{I18n.t('viewUpper')}
					</Text>
				</View>
			);
		}
		if (isLocked) {
			const zIndex = 4 - index;
			index++;
			warningJSX.push(
				<View
					key={`isLocked_${index}`}
					style={[CommonStyle.warningDrawer, { zIndex }]}
				>
					<Text
						allowFontScaling={false}
						style={CommonStyle.textWarningDrawer}
					>
						{I18n.t('isLockedAccount')}
					</Text>
				</View>
			);
		}
		return (
			<View
				onLayout={(e) => {
					const height = e.nativeEvent.layout.height;
					this.heightHeaderWithWarning.setValue(height);
				}}
				style={{
					position: 'absolute',
					backgroundColor:
						warningJSX.length === 0
							? 'transparent'
							: CommonStyle.color.warning,
					borderBottomRightRadius: 35,
					flexDirection: 'row'
				}}
			>
				<View
					style={{
						width: warningJSX.length * 4,
						backgroundColor:
							warningJSX.length === 0
								? 'transparent'
								: CommonStyle.color.warning
					}}
				/>
				<View>
					{this.renderBarAccountFake()}
					{warningJSX}
				</View>
			</View>
		);
	}

	renderTextSizeSetting = () => {
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.textSizeSetting;

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.textSizeSetting);
				}}
			>
				<MaterialCommunityIcons
					name="format-size"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`textSizeSetting`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('textSizeSetting')}
				</Text>
			</TouchableOpacity>
		);
	};
	renderNewV2 = () => {
		const { menuSelected } = this.state;
		const selected = menuSelected === ENUM.MENU_SELECTED.news_v3;

		return (
			<TouchableOpacity
				style={styles.botRowContainer}
				onPress={() => {
					this.switchTab(ENUM.MENU_SELECTED.news_v3);
				}}
			>
				<MaterialCommunityIcons
					name="format-size"
					style={
						selected
							? CommonStyle.iconDrawerSelected
							: [CommonStyle.iconDrawer]
					}
				/>
				<Text
					testID={`textSizeSetting`}
					allowFontScaling={false}
					style={
						selected
							? CommonStyle.textMenuDrawerSelected
							: [CommonStyle.textMenuDrawer]
					}
				>
					{I18n.t('news_v3')}
				</Text>
			</TouchableOpacity>
		);
	};
	renderBodyDrawer(warningHeight = 0) {
		return this.state.flag === 1 ? (
			<Animatable.View
				animation={this.state.animation1}
				duration={200}
				onAnimationEnd={() => {
					this.isMount && this.setState({ flag: 0, animation1: '' });
				}}
				ref="multipleAccount"
				style={{
					width: '100%',
					flex: 1,
					backgroundColor: 'transparent'
				}}
			>
				<FlatList
					data={this.state.listAccounts}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) =>
						this.renderListAccountsVertical(item)
					}
				></FlatList>
			</Animatable.View>
		) : (
			<Animatable.View
				animation={this.state.animation2}
				duration={200}
				onAnimationEnd={() => {
					this.isMount && this.setState({ flag: 1, animation2: '' });
				}}
				ref="menu"
				style={[CommonStyle.drawerBodyContainer, { paddingBottom: 8 }]}
			>
				<ScrollView
					testID={`scrollDrawer`}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
				>
					{/* {this.renderAlerts()} */}
					{/* {this.renderWatchlistMultiplePanel()} */}
					{this.renderActivities()}
					{this.renderWatchlist()}
					{/* {this.renderWatchlistMultiplePanel()} */}
					{this.renderNews()}
					{/* {this.renderReports()} */}
					{/* {this.renderInsight()} */}
					{/* {this.renderContractNotes()} */}
					{/* {this.renderActivities()} */}
					{this.renderSetting()}
					{/* {this.renderUserInfo()} */}
					{/* {this.renderAccount()} */}
					{this.renderAboutUs()}
					{/* {this.renderWhatsNew()} */}
					{this.renderTermOfUse()}
					{/* {this.renderHelpCenter()} */}
					{this.renderLogOut()}
				</ScrollView>
			</Animatable.View>
		);
	}

	renderPrompt(title, lostConnectionTitle, listData1) {
		return (
			<View>
				<Prompt
					isAuth={false}
					title={title}
					titleStyle={{ paddingVertical: 0 }}
					titleContainerStyle={{ alignItems: 'center' }}
					// subtitle={subtitle}
					buttonContainerStyle={{ borderTopWidth: 1 }}
					cancelText={
						Platform.OS === 'ios'
							? I18n.t('cancel')
							: I18n.t('cancelUpper')
					}
					submitText={
						this.state.isLogin
							? Platform.OS === 'ios'
								? I18n.t('login')
								: I18n.t('loginUpper')
							: Platform.OS === 'ios'
							? I18n.t('reset')
							: I18n.t('resetUpper')
					}
					subtitleStyle={{
						textAlign: 'center',
						color: this.state.isLogin
							? '#10a8b2'
							: 'rgba(0, 0, 0, 0.87)'
					}}
					lostConnectionTitle={lostConnectionTitle}
					lostConnectionTitleStyle={{
						fontFamily: 'HelveticaNeue-Light',
						fontSize: CommonStyle.fontSizeS,
						color: '#DF0000',
						textAlign: 'center',
						marginBottom: 6
					}}
					errorText={this.state.errorLogin}
					listInput={listData1}
					visible={this.state.promptVisible}
					onCancel={this.cancelPrompt}
					easing={''}
					onSubmit={(value, closeCb, errorCb) => {
						this.submitPrompt(value, closeCb, errorCb);
					}}
				/>
				<PromptNew
					isHideModal={false}
					reloadAfterLoginCallback={this.reloadAfterLoginCallback}
					type={'reviewAccount'}
					onRef={(ref) => (this.reviewPrompt = ref)}
					navigator={this.props.navigator}
				/>
				<PromptNew
					type={'lockedAccount'}
					onRef={(ref) => (this.lockPrompt = ref)}
					navigator={this.props.navigator}
				/>
			</View>
		);
	}

	hideAndroidTouchID() {
		dataStorage.onAuthenticating = false;
		this.setState({
			isAndroidTouchIdModalVisible: false
		});
	}

	showAndroidTouchID(params) {
		dataStorage.dismissAuthen = this.hideAndroidTouchID;
		dataStorage.onAuthenticating = true;
		this.setState({
			isAndroidTouchIdModalVisible: true,
			params
		});
	}

	androidTouchIDFail(callback, numberFingerFailAndroid) {
		this.androidTouchID &&
			this.androidTouchID.authenFail(callback, numberFingerFailAndroid);
	}

	authenByPinFn() {
		const cbFn =
			this.type === 'order' ? this.newOrderFunc : this.switchToSetting;
		this.showFormLogin(cbFn, this.params);
	}
	renderBarAccount = () => {
		const rotate = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '90deg']
		});
		const accountInfo = this.state.currentAccount || {};
		return (
			<View
				style={[
					Platform.OS === 'ios'
						? CommonStyle.headerDrawer
						: CommonStyle.headerDrawerAndroid,
					{
						height: 202,
						paddingTop: 16,
						paddingLeft: 0,
						paddingBottom: 0,
						alignItems: 'center',
						backgroundColor: 'transparent'
					}
				]}
			>
				<Image
					style={{ height: 202 - 16 }}
					source={CommonStyle.images.logo}
					resizeMode={'contain'}
				/>
			</View>
		);
	};
	renderBarAccountFake = () => {
		const rotate = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '90deg']
		});
		const accountInfo = this.state.currentAccount || {};
		return (
			<View
				style={[
					Platform.OS === 'ios'
						? CommonStyle.headerDrawer
						: CommonStyle.headerDrawerAndroid,
					{ opacity: 0, minHeight: 200 }
				]}
			>
				{this.renderListAccount(accountInfo)}
				<View style={{ height: 12 }}></View>
				{this.renderBarShowListAccount(accountInfo, rotate)}
			</View>
		);
	};
	renderWrapperHeader = () => {
		return (
			<Animated.View
				style={{ height: this.heightHeaderWithWarning, minHeight: 200 }}
			>
				{this.renderBarAccount()}
				{this.renderHeaderDrawer()}
			</Animated.View>
		);
	};
	render() {
		let listData1 = [
			{
				placeholder: 'Email',
				defaultValue: this.props.login.lastEmail,
				id: 'username',
				rightIcon: 'md-close'
			},
			{
				placeholder: 'Password',
				defaultValue: '',
				secureTextEntry: true,
				id: 'password',
				rightIcon: 'md-eye'
			}
		];
		let title = 'Sign In to Equix';
		let subtitle = 'Forgot password';
		const lostConnectionTitle = 'Connecting...';
		if (!this.state.isLogin) {
			title = 'Recover Your Password';
			subtitle = 'Please enter your email address';
			listData1 = [
				{
					placeholder: 'Email',
					defaultValue: this.props.login.lastEmail,
					id: 'username'
				}
			];
		}
		const rotate = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '90deg']
		});
		const accountInfo = this.state.currentAccount || {};
		let warningHeight = 0;
		if (Controller.getLoginStatus() && Controller.isDemo()) {
			warningHeight += 24;
		}
		if (
			Controller.getLoginStatus() &&
			this.props.app.loginUserType === loginUserType.REVIEW
		) {
			warningHeight += 24;
		}
		if (
			(Controller.getLoginStatus() && dataStorage.isNotHaveAccount) ||
			isViewOnly()
		) {
			warningHeight += 24;
		}
		if (
			Controller.getLoginStatus() &&
			this.props.app.loginUserType === loginUserType.LOCKED
		) {
			warningHeight += 24;
		}
		const extraHeight = Platform.OS === 'ios' ? 0 : -48;
		return (
			<ImageBackground
				source={pinBackground}
				resizeMode={'cover'}
				style={{
					flex: 1,
					backgroundColor: 'transparent',
					width: WIDTH_DRAWER
				}}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: 'transparent',
						width: WIDTH_DRAWER
					}}
				>
					{this.renderWrapperHeader()}
					<View style={{ flex: 1 }}>
						{this.renderBodyDrawer(extraHeight + warningHeight)}
					</View>
					<AlertCustom
						visible={this.state.visiblePopup}
						close={this.closeModal.bind(this)}
						logoutFunc={this.configLogout.bind(this)}
					/>
					{this.renderPrompt(title, lostConnectionTitle, listData1)}
				</View>
				{this.auth.showLoginForm(
					this.state.isForgotPinModalVisible,
					I18n.t('resetYourPin'),
					I18n.t('pleaseEnterYourPassword'),
					this.state.animationLogin,
					() => {
						this.setState({
							animationLogin: ''
						});
					},
					() => {
						this.setState({
							isForgotPinModalVisible: false
						});
					},
					() => {
						this.props.actions.authError();
						this.setState({
							// animationLogin: 'shake',
							isError: true
						});
					},
					() => {
						this.props.actions.authSuccess();
						this.setState({
							isForgotPinModalVisible: false,
							isError: false
						});
					},
					(accessToken) => {
						this.props.actions.authSuccess();
						this.setState(
							{
								isForgotPinModalVisible: false,
								isError: false
							},
							() => {
								this.forgotPinSuccessCb(accessToken);
							}
						);
					},
					null,
					null,
					this.state.isError,
					true
				)}
				<AuthenByPin
					onForgotPin={this.onForgotPin}
					onChangeAuthenByFingerPrint={
						this.onChangeAuthenByFingerPrint
					}
					onRef={(ref) => (this.authenPin = ref)}
					onPinCompleted={this._onPinCompleted}
				/>
				{Platform.OS === 'android' ? (
					<TouchAlert
						ref={(ref) => (this.androidTouchID = ref)}
						visible={this.state.isAndroidTouchIdModalVisible}
						dismissDialog={this.hideAndroidTouchID}
						authenByPinFn={this.authenByPinFn}
					/>
				) : null}
				<LogDevice />
				<Timer />
			</ImageBackground>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		login: state.login,
		app: state.app,
		notiStatus: state.news.notiStatus,
		unread: state.orders.unread,
		readOverview: state.orders.readOverview,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		appActions: bindActionCreators(appActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
