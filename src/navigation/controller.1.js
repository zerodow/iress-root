import { Navigation } from 'react-native-navigation';
import { Platform, Dimensions } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import * as Controller from '../../src/memory/controller';
import config from '../config';
import I18n from '../modules/language/';
import { iconsMap } from '../utils/AppIcons';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { func, dataStorage } from '~/storage';
import { getIOSVersion } from '~/lib/base/functionUtil';
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js';
import ENUM from '~/enum'

const { WIDTH_DRAWER } = ENUM
const { height: HEIGHT_DEVICE, width: WIDTH_DEVICE } = Dimensions.get('window');
const drawerWidthPercent = WIDTH_DRAWER * 100 / WIDTH_DEVICE
const iOSVersion = getIOSVersion();

const getPercentDrawer = (width) => {
	/*
		WIDTH_DEVICE 100
		200	          ?
	*/
	const percent = WIDTH_DRAWER * 100 / WIDTH_DEVICE
	return percent
}
function checkIOS13() {
	return iOSVersion > 12;
}

export function pushScreenToCurrentTab({
	screen,
	title,
	backMore,
	passProps = {}
}) {
	/*
		1. Nếu đang ở tab watchlist mà click watchlist trên drawer thì pop to root
		2. Nếu đang ở tab khác watchlist mà click watchlist trên drawer thì chuyển tab sang watchlist
	*/
	// Reset textFilter news
	HeaderModel.resetTextFilter();
	if (screen === 'equix.TradeDrawer') {
		if (dataStorage.tabIndexSelected === 1 && screen === 'equix.TradeDrawer') {
			dataStorage.navigatorGlobal && dataStorage.navigatorGlobal.popToRoot({
				animated: false,
				navigatorStyle: CommonStyle.navigatorStyleTab
			});
		} else {
			dataStorage.refBottomTabBar && dataStorage.refBottomTabBar.changeTabActive(screen === 'equix.TradeDrawer' ? 1 : 0); // Change tab to watchlist
		}
	} else {
		// const isLogin = Controller.getLoginStatus();
		// const tabIndex = dataStorage.tabIndexSelected || 0;
		// const isResetSelected = true;
		// const tabActiveTemp = isLogin ? 2 : 1;
		// if (tabIndex !== tabActiveTemp) {
		// 	func.setTabActive(tabActiveTemp);
		// 	dataStorage.setTabActive[tabIndex] &&
		// 		dataStorage.setTabActive[tabIndex](tabActiveTemp, isResetSelected);
		// }

		if (backMore) {
			dataStorage.navigatorGlobal &&
				dataStorage.navigatorGlobal.push({
					screen,
					navigatorStyle: {
						disabledBackGesture: true,
						...CommonStyle.navigatorSpecial
					},
					title,
					passProps: {
						onCheck: dataStorage.disclaimerOncheck,
						onAccept: dataStorage.disclaimerAccept,
						backMore: true,
						...passProps
					},
					animationType: 'none',
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
				});
		} else {
			dataStorage.navigatorGlobal &&
				dataStorage.navigatorGlobal.push({
					screen,
					navigatorStyle: {
						disabledBackGesture: true,
						...CommonStyle.navigatorSpecial
					},
					title,
					passProps,
					animated: true,
					animationType: 'fade',
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
				});
		}
	}
}

export function switchToTabswitchToTab(tabIndex = 0) {
	Navigation.switchToTab({
		tabIndex
	});
}

export function showBusyBoxScreen(passProps) {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.BusyBox',
			navigatorStyle: {
				drawUnderNavBar: true,
				navBarHidden: true,
				tabBarHidden: true,
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
}

export function showAutoLoginScreen(passProps) {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.AutoLogin',
			navigatorStyle: {
				tabBarHidden: true,
				drawUnderNavBar: true,
				navBarHidden: true,
				navBarHideOnScroll: false,
				navBarNoBorder: true,
				statusBarTextColorScheme: 'light',
				screenBackgroundColor: CommonStyle.backgroundColor
			}
		},
		appStyle: {
			orientation: 'portrait'
		},
		passProps,
		animationType: 'none'
	});
}

// export function showNewOverViewScreen() {
// 	Navigation.startSingleScreenApp({
// 		screen: {
// 			screen: 'equix.NewOverview',
// 			title: I18n.t('overview'),
// 			navigatorStyle: CommonStyle.navigatorSpecial,
// 			navigatorButtons: {
// 				leftButtons: [
// 					{
// 						title: 'menu',
// 						id: 'menu_ios',
// 						icon: iconsMap['md-menu'],
// 						testID: 'menu_ios'
// 					}
// 				]
// 			}
// 		},
// 		appStyle: {
// 			orientation: 'portrait'
// 		},
// 		drawer: {
// 			left: {
// 				screen: 'equix.DrawerIOS',
// 				passProps: {},
// 				// disableOpenGesture: true,
// 				fixedWidth: 500
// 			},
// 			style: {
// 				drawerShadow: false,
// 				contentOverlayColor: 'rgba(0,0,0,0.25)',
// 				leftDrawerWidth: drawerWidthPercent
// 			},
// 			type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
// 			animationType: 'parallax', // optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
// 			// for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
// 			disableOpenGesture: true // optional, can the drawer, both right and left, be opened with a swipe instead of button
// 		}
// 	});
// }

export function showNewOverViewScreen() {
	func.setTabActive(0);
	let drawer = null;
	if (Platform.OS === 'ios') {
		drawer = {
			left: {
				screen: 'equix.DrawerIOS',
				passProps: {},
				// disableOpenGesture: true,
				fixedWidth: 500
			},
			style: {
				drawerShadow: false,
				contentOverlayColor: 'rgba(38,43,62,0.85)',
				leftDrawerWidth: drawerWidthPercent
			},
			type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
			animationType: 'parallax', // optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
			// for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
			disableOpenGesture: true // optional, can the drawer, both right and left, be opened with a swipe instead of button
		};
	} else {
		drawer = {
			left: {
				screen: 'equix.DrawerAndroid'
			},
			style: {
				leftDrawerWidth: drawerWidthPercent
			}
		};
	}
	Navigation.startTabBasedApp({
		tabs: [
			{
				label: 'One',
				screen: 'equix.NewOverview',
				icon: iconsMap['md-menu'],
				selectedIcon: iconsMap['md-menu'],
				navigatorStyle: CommonStyle.navigatorStyleTab,
				navigatorButtons: {}
			},
			{
				label: 'Drawer',
				screen: 'equix.StackDrawer',
				icon: iconsMap['md-menu'],
				selectedIcon: iconsMap['md-menu'],
				passProps: {
					tabIndex: 0
				},
				navigatorStyle: CommonStyle.navigatorStyleTab
			},
			{
				label: 'Two',
				screen: 'equix.Trade',
				icon: iconsMap['md-menu'],
				selectedIcon: iconsMap['md-menu'],
				navigatorStyle: CommonStyle.navigatorStyleTab,
				navigatorButtons: {}
			}
		],
		appStyle: {
			orientation: 'portrait',
			tabBarHidden: true,
			initialTabIndex: checkIOS13() ? 1 : dataStorage.tabIndexSelected
		},
		tabsStyle: {
			initialTabIndex: checkIOS13() ? 1 : dataStorage.tabIndexSelected
		},
		drawer
	});
}

export function showMainAppScreen({
	tabIndex,
	activeTab,
	originActiveTab = 0
}) {
	try {
		let drawer = null;
		const isSearchAcc = Controller.getIsSearchAccount();
		if (Platform.OS === 'ios') {
			const screen = isSearchAcc
				? 'equix.DrawerManagementIOS'
				: 'equix.DrawerIOS';

			drawer = {
				left: {
					screen,
					passProps: {},
					// disableOpenGesture: true,
					fixedWidth: 500
				},
				style: {
					drawerShadow: false,
					contentOverlayColor: 'rgba(38,43,62,0.85)',
					leftDrawerWidth: drawerWidthPercent
				},
				type: 'MMDrawer', // optional, iOS only, types: 'TheSideBar', 'MMDrawer' default: 'MMDrawer'
				animationType: 'parallax', // optional, iOS only, for MMDrawer: 'door', 'parallax', 'slide', 'slide-and-scale'
				// for TheSideBar: 'airbnb', 'facebook', 'luvocracy','wunder-list'
				disableOpenGesture: true // optional, can the drawer, both right and left, be opened with a swipe instead of button
			};
		} else {
			const screen = isSearchAcc
				? 'equix.DrawerManagementAndroid'
				: 'equix.DrawerAndroid';
			drawer = {
				left: {
					screen
				},
				style: {
					leftDrawerWidth: drawerWidthPercent
				}
			};
		}
		console.log('DCM OPTIMIZE SHOW HOME_SCREEN', new Date());
		Navigation.startTabBasedApp({
			tabs: [
				{
					label: '',
					screen: 'equix.Activities',
					icon: iconsMap['md-menu'],
					selectedIcon: iconsMap['md-menu'],
					navigatorStyle: CommonStyle.navigatorStyleTab,
					navigatorButtons: {}
				},
				{
					label: '',
					screen: 'equix.Trade',
					icon: iconsMap['md-menu'],
					selectedIcon: iconsMap['md-menu'],
					navigatorStyle: CommonStyle.navigatorStyleTab,
					navigatorButtons: {}
				},
				{
					label: '',
					screen: 'equix.StackDrawer',
					icon: iconsMap['md-menu'],
					selectedIcon: iconsMap['md-menu'],
					passProps: {
						tabIndex
					},
					navigatorStyle: CommonStyle.navigatorStyleTab
				},
				{
					label: '',
					screen: 'equix.Portfolio',
					icon: iconsMap['md-menu'],
					selectedIcon: iconsMap['md-menu'],
					navigatorStyle: CommonStyle.navigatorStyleTab,
					passProps: {
						activeTab: originActiveTab
					},
					navigatorButtons: {}
				},
				{
					label: '',
					screen: 'equix.Orders',
					icon: iconsMap['md-menu'],
					selectedIcon: iconsMap['md-menu'],
					navigatorStyle: CommonStyle.navigatorStyleTab,
					passProps: {
						activeTab
					},
					navigatorButtons: {}
				}
			],
			appStyle: {
				tabBarHidden: true,
				tabBarTranslucent: true,
				drawUnderTabBar: true,
				navBarHidden: true,
				modalPresentationStyle: 'fullScreen',
				orientation: 'portrait',
				initialTabIndex: checkIOS13() ? 2 : tabIndex
			},
			tabsStyle: {
				tabBarHidden: true,
				tabBarTranslucent: true,
				drawUnderTabBar: true,
				navBarHidden: true,
				modalPresentationStyle: 'fullScreen',
				initialTabIndex: checkIOS13() ? 2 : tabIndex
			},
			drawer
		});
	} catch (error) {
		console.info('SHOW MAIN APP SCREEN EXCEPTION', error)
	}
}
export function showUpdateMeScreen() {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.UpdateMe',
			navigatorStyle: {
				tabBarHidden: true,
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
export function showDisclaimerScreen(passProps) {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.Disclaimer',
			title: I18n.t('disclaimer'),
			navigatorStyle: {
				navBarBackgroundColor: CommonStyle.fontBlue,
				navBarTranslucent: false,
				drawUnderNavBar: false,
				tabBarHidden: true,
				navBarHideOnScroll: false,
				navBarTextColor: config.color.navigation,
				navBarTextFontFamily: 'HelveticaNeue-Medium',
				navBarTextFontSize: 18,
				navBarTransparent: true,
				navBarButtonColor: config.button.navigation,
				statusBarColor: config.background.statusBar,
				statusBarTextColorScheme: 'light',
				drawUnderTabBar: true,
				navBarNoBorder: true,
				navBarSubtitleColor: 'white',
				navBarSubtitleFontFamily: 'HelveticaNeue',
				navBarHidden: true
			}
		},
		passProps,
		animationType: 'none'
	});
}
export function showHomePageScreen() {
	Navigation.startSingleScreenApp({
		screen: {
			screen: 'equix.Home',
			navigatorStyle: {
				screenBackgroundColor: CommonStyle.backgroundColor,
				drawUnderNavBar: true,
				tabBarHidden: true,
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

// modal
export function showAutoLoginModal(passProps) {
	Navigation.showModal({
		screen: 'equix.AutoLogin',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: passProps.isTransparentBackgroundColor
				? 'transparent'
				: CommonStyle.backgroundColor,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps
	});
}
export function showPromptNewModal(passProps) {
	Navigation.showModal({
		screen: 'equix.PromptNew',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			navBarHidden: true,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps
	});
}

export function showTokenWasChangedModal(passProps) {
	Navigation.showModal({
		screen: 'equix.TokenWasChanged',
		animated: true,
		animationType: 'fade',
		navigatorStyle: {
			navBarHidden: true,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps
	});
}

export function showSetPinModal(passProps, navigator) {
	(navigator || Navigation).showModal({
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
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps
	});
}

export function showSearchModal({ navigator, title }) {
	navigator.showModal({
		screen: 'equix.Search',
		title,
		backButtonTitle: '',
		animated: true,
		animationType: 'slide-up',
		navigatorStyle: CommonStyle.navigatorSpecialNoHeader
	});
}

export function showNewAlertModal({ navigator, passProps }) {
	navigator.showModal({
		screen: 'equix.NewAlert',
		title: I18n.t('newAlertUpper'),
		backButtonTitle: '',
		animated: true,
		subtitle: null,
		animationType: 'slide-up',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			...{ drawUnderNavBar: true },
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps
	});
}

export function showNewOrderModal({ navigator, passProps }) {
	navigator.showModal({
		screen: 'equix.Order',
		title: I18n.t('newOrder'),
		overrideBackPress: true,
		backButtonTitle: '',
		animated: false,
		animationType: 'none',
		passProps: {
			...passProps,
			isNotShowMenu: true,
			navigatorEventIDParents: navigator.navigatorEventID
		},
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			screenBackgroundColor: 'transparent',
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}

export function showWatchlistScreen({ navigator, passProps }) {
	(navigator || Navigation).push({
		animated: true,
		backButtonTitle: ' ',
		screen: 'equix.Trade',
		animationType: 'slide-horizontal',
		passProps
	});
}

export function showSearchCodeModal({ navigator, passProps }) {
	navigator.showModal({
		screen: 'equix.SearchCode',
		backButtonTitle: '',
		animated: true,
		animationType: 'slide-up',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			...{ drawUnderNavBar: true },
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}

export function showSearchCodeModal2({ navigator, passProps }) {
	navigator.showModal({
		screen: 'equix.SearchCode2',
		backButtonTitle: '',
		animated: true,
		animationType: 'slide-up',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			...{ drawUnderNavBar: true },
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}

export function showSearchWatchlistModal({ navigator }) {
	navigator.showModal({
		screen: 'equix.FindWatchlist',
		title: '',
		backButtonTitle: '',
		animated: true,
		animationType: 'slide-up',
		navigatorStyle: {
			...CommonStyle.navigatorSpecialNoHeader,
			...{ drawUnderNavBar: true },
			modalPresentationStyle: 'overCurrentContext'
		}
	});
}
export function showOrders({ navigator }) {
	navigator.push({
		screen: 'equix.Orders',
		navigatorButtons: {
		},
		appStyle: {
			orientation: 'portrait'
		},
		passProps: {},
		navigatorStyle: CommonStyle.navigatorSpecial,
		animationType: 'none'
	});

	// dataStorage.refBottomTabBar.changeTabActive(4)
}
