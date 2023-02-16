import { Navigation } from 'react-native-navigation';
import { Platform, Dimensions } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import * as Controller from '../../src/memory/controller';
import config from '../config';
import I18n from '../modules/language/';
import { iconsMap } from '../utils/AppIcons';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import ENUM from '~/enum'
const { WIDTH_DRAWER } = ENUM
const { height: HEIGHT_DEVICE, width: WIDTH_DEVICE } = Dimensions.get('window');
const drawerWidthPercent = WIDTH_DRAWER * 100 / WIDTH_DEVICE
export function showBusyBoxScreen(passProps) {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.BusyBox',
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
		passProps,
		animationType: 'none'
	});
	SplashScreen.hide();
}

export function showSetPinModal(objParam, token) {
	Navigation.showModal({
		screen: 'equix.SetPin',
		animated: true,
		animationType: 'slide-up',
		navigatorStyle: {
			statusBarColor: config.background.statusBar,
			statusBarTextColorScheme: 'light',
			navBarHidden: true,
			navBarHideOnScroll: false,
			navBarTextFontSize: 18,
			drawUnderNavBar: true,
			navBarNoBorder: true,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			type: 'new',
			isShowCancel: true,
			token,
			objParam
		}
	});
	SplashScreen.hide();
}

export function showUpdateMeScreen() {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.UpdateMe',
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
		animationType: 'none',
		passProps: {}
	});
}

export function showAutoLogin(passProps) {
	Navigation.showModal({
		screen: 'equix.AutoLogin',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			statusBarColor: config.background.statusBar,
			statusBarTextColorScheme: 'light',
			navBarHidden: true,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps
	});
}

export function showNewOverViewScreen() {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.NewOverview',
			title: I18n.t('overview'),
			navigatorStyle: CommonStyle.navigatorSpecial,
			navigatorButtons: {
				leftButtons: [
					{
						title: 'menu',
						id: 'menu_ios',
						icon: iconsMap['md-menu'],
						testID: 'menu_ios'
					}
				]
			}
		},
		appStyle: {
			orientation: 'portrait'
		},
		drawer: {
			left: {
				screen: 'equix.DrawerIOS',
				passProps: {},
				// disableOpenGesture: true,
				fixedWidth: 500
			},
			style: {
				drawerShadow: false,
				contentOverlayColor: 'rgba(0,0,0,0.25)',
				leftDrawerWidth: drawerWidthPercent
			},
			type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
			animationType: 'parallax' // optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
			// for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
			// disableOpenGesture: true // optional, can the drawer, both right and left, be opened with a swipe instead of button
		}
	});
}

export function showHomePageScreen() {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.Home',
			navigatorStyle: {
				screenBackgroundColor: 'black',
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
		animationType: 'fade'
	});
}

export function showPromptNewScreen() {
	Navigation.showModal({
		screen: 'equix.PromptNew',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			navBarHidden: true,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			type: 'changedToken',
			isShow: true
		}
	});
}

export function showSearchDetailScreen(navigator, title, symbol) {
	const refreshButton = [
		{
			title: 'Refresh',
			id: 'search_refresh',
			icon: iconsMap['ios-refresh-outline']
		}
	];
	navigator.push({
		screen: 'equix.SearchDetail',
		title,
		backButtonTitle: '',
		animated: true,
		animationType: 'slide-horizontal',
		passProps: {
			isBackground: false,
			symbol
		},
		navigatorButtons: {
			leftButtons: [
				{
					title: '',
					id: 'back_button',
					icon:
						Platform.OS === 'ios'
							? iconsMap['ios-arrow-back']
							: iconsMap['md-arrow-back']
				}
			],
			rightButtons: !Controller.isPriceStreaming() ? refreshButton : []
		},
		navigatorStyle: CommonStyle.navigatorSpecial
	});
}

export function showSearchScreen({
	navigator,
	symbol,
	displayName,
	showOnInit
}) {
	navigator.showModal({
		animated: true,
		animationType: 'slide-up',
		screen: 'equix.Search',
		backButtonTitle: '',
		passProps: {
			symbol,
			displayName,
			typeNews: 'all',
			isLoading: true,
			disabledSuggestCode: true,
			showOnInit
		},
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}
