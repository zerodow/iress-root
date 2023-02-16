import React from 'react';
import {
	Text, View, PixelRatio, ListView
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { iconsMap } from '../../utils/AppIcons';
import { dataStorage, func } from '../../storage';
import config from '../../config';
import styles from './style/trade';
import Enum from '../../enum'
import * as Business from '../../business'
import XComponent from '../../component/xComponent/xComponent'
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions';
import * as loginActions from '../login/login.actions';
import AuthenPin from '../../component/authen_pin/authen_pin'
import * as Util from '../../util'
import * as AllMarket from '../../streaming/all_market'
import I18n from '../../modules/language'
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Channel from '../../streaming/channel'
import Price from '../price/price.1';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as Emitter from '@lib/vietnam-emitter';
import ProgressBar from '../../modules/_global/ProgressBar';
import * as ManageNavigation from '../../manage_navigation';
import * as Api from '../../api'
import { switchForm, getExchange, formatNumberNew2, logAndReport, logDevice, pushToVerifyMailScreen } from '../../lib/base/functionUtil';
import TimeUpdated from '../../component/time_updated/time_updated';
import Warning from '../../component/warning/warning';
import UserType from '../../constants/user_type';
import StateApp from '../../lib/base/helper/appState';
import NetworkWarning from '../../component/network_warning/network_warning';
import * as NewsBusiness from '../../streaming/news'
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti'
import * as Controller from '../../memory/controller'
import * as UserPriceSource from '../../userPriceSource';
import RnCollapsible from '../../component/rn-collapsible/rn-collapsible'
import PureCollapsible from '../../component/rn-collapsible/pure-collapsible'
import ScreenId from '../../constants/screen_id';
import * as RoleUser from '../../roleUser';
import { showNewOrderModal } from '~/navigation/controller.1'

const { TAB_NEWS } = Enum
const SECTION_ID = 's1';
const SIDE = Enum.SIDE;
const SCREEN = Enum.SCREEN;
const CURRENT_SCREEN = SCREEN.TRADE;
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE;
const PRICEBOARD_STATIC_ID = Enum.PRICEBOARD_STATIC_ID;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export class Trade extends XComponent {
	static propTypes = {
		login: PropTypes.object
	};

	//  #region REACT AND DEFAULT FUNCTION
	/* eslint max-statements: [1, 2000] */
	bindAllFunc() {
		try {
			this.loadData = this.loadData.bind(this)
			this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
			this.renderRow = this.renderRow.bind(this)
			this.setSubtitle = this.setSubtitle.bind(this)
			this.getListCode = this.getListCode.bind(this)
			this.renderFooter = this.renderFooter.bind(this)
			this.setNavButton = this.setNavButton.bind(this)
			this.getSymbolInfo = this.getSymbolInfo.bind(this)
			this.renderLoading = this.renderLoading.bind(this)
			this.rowHasChanged = this.rowHasChanged.bind(this)
			this.getNewestPrice = this.getNewestPrice.bind(this)
			this.subLv1Realtime = this.subLv1Realtime.bind(this)
			this.checkNewsToday = this.checkNewsToday.bind(this)
			this.loadPriceBoard = this.loadPriceBoard.bind(this)
			this.appShowWhenHide = this.appShowWhenHide.bind(this)
			this.onRefTimeUpdated = this.onRefTimeUpdated.bind(this)
			this.unsubLv1Realtime = this.unsubLv1Realtime.bind(this)
			this.onShowPriceboard = this.onShowPriceboard.bind(this)
			this.getPriceSnapshot = this.getPriceSnapshot.bind(this)
			this.renderNoneLoading = this.renderNoneLoading.bind(this)
			this.onChangeVisibleRows = this.onChangeVisibleRows.bind(this)
			this.getLastestPriceBoard = this.getLastestPriceBoard.bind(this)
			this.getCurrentPriceBoard = this.getCurrentPriceBoard.bind(this)
			this.switchToNewOrderScreen = this.switchToNewOrderScreen.bind(this)
			this.createPriceBoardDefault = this.createPriceBoardDefault.bind(this)
			this.processPriceboardStatic = this.processPriceboardStatic.bind(this)
			this.receiveRequestPlaceOrder = this.receiveRequestPlaceOrder.bind(this)
			this.resetDicPlaceOrderObject = this.resetDicPlaceOrderObject.bind(this)
			this.processPriceboardPersonal = this.processPriceboardPersonal.bind(this)
			this.subChannelWatchlistChanged = this.subChannelWatchlistChanged.bind(this)
			this.reloadWhenPriceboardChange = this.reloadWhenPriceboardChange.bind(this)
			this.reloadWhenSelectedPriceboard = this.reloadWhenSelectedPriceboard.bind(this)
			this.subChannelSelectedPriceboard = this.subChannelSelectedPriceboard.bind(this)
			this.checkCurrentPriceboardIsStatic = this.checkCurrentPriceboardIsStatic.bind(this)
			this.getSymbolInfoAndCheckNewsToday = this.getSymbolInfoAndCheckNewsToday.bind(this)
			this.reloadDataWhenSelectedPriceboardOrReconnectSuccess = this.reloadDataWhenSelectedPriceboardOrReconnectSuccess.bind(this)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	init() {
		try {
			this.dic = {
				...this.getDefaultDic(this.id),
				stateApp: Controller.isPriceStreaming()
					? null
					: new StateApp(this.appShowWhenHide, null, CURRENT_SCREEN, false)
			}
			this.state = { isLoadingForm: true }

			this.setNavButton()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	resetDicPlaceOrderObject() {
		this.dic.placingOrderObject = {}
	}

	getDefaultDic(id) {
		try {
			return {
				stateApp: null,
				priceBoard: [],
				visibleRows: {},
				dicNewsToday: {},
				listPriceObject: [],
				priceBoardDetail: {},
				timeUpdatedRef: null,
				isLoadingPrice: false,
				placingOrderObject: {},
				channelWatchlistChanged: '',
				listPriceboardStatic: func.getAllPriceboardStatic() || [],
				channelLoadingTrade: StreamingBusiness.getChannelLoadingTrade(),
				channelRequestCheckAuthen: Channel.getChannelRequestCheckAuthen(id),
				channelAllowRenderIndex: StreamingBusiness.getChannelAllowRenderIndex(id),
				channelChildExpandStatus: StreamingBusiness.getChannelChildExpandStatus(id)
			}
		} catch (error) {
			console.catch(error)
			return {}
		}
	}

	componentDidMount() {
		try {
			super.componentDidMount()
			this.loadData()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	componentWillReceiveProps(nextProps) {
		try {
			const currentPriceBoardId = func.getCurrentPriceboardId()

			this.props.isConnected !== nextProps.isConnected &&
				nextProps.isConnected === true &&
				this.reloadDataWhenSelectedPriceboardOrReconnectSuccess(currentPriceBoardId)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	componentWillUnmount() {
		try {
			console.log('TRADE componentWillUnmount TRY')
			this.dic.stateApp && this.dic.stateApp.removeHandler();
			this.unsubLv1Realtime()
			NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED)

			super.componentWillUnmount()

			return true
		} catch (error) {
			console.log('TRADE componentWillUnmount CATCH')
			console.catch(error)
			return false
		}
	}
	//  #endregion

	//  #region HOOK FUNCTION
	isErrorPlacingOrderInfo(side, data) {
		return side == null || (side !== SIDE.BUY && side !== SIDE.SELL) || !data || !data.symbol
	}

	receiveRequestPlaceOrder(side, data) {
		try {
			if (this.isErrorPlacingOrderInfo(side, data)) return false;

			this.dic.placingOrderObject = { side, data }
			Emitter.emit(this.dic.channelRequestCheckAuthen)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}
	//  #endregion

	//  #region SUBCRIBER
	appShowWhenHide() {
		try {
			this.setNavButton()
			this.getNewestPrice()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	subChannelSelectedPriceboard() {
		try {
			const channelSelectedPriceboard = Channel.getChannelSelectedPriceboard()
			Emitter.addListener(channelSelectedPriceboard, this.id, async (priceboardId) => {
				if (priceboardId === this.dic.priceBoardDetail.watchlist) return

				this.setSubtitle(func.getPriceboardNameInPriceBoard(priceboardId))
				this.setState({ isLoadingForm: true }, this.setNavButton)
				this.reloadDataWhenSelectedPriceboardOrReconnectSuccess(priceboardId)
			})

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	subChannelWatchlistChanged() {
		try {
			this.dic.channelWatchlistChanged && Emitter.deleteListener(this.dic.channelWatchlistChanged, this.id)
			this.dic.channelWatchlistChanged = StreamingBusiness.getChannelWatchlistChanged(this.dic.priceBoardDetail.watchlist)

			Emitter.addListener(this.dic.channelWatchlistChanged, this.id, async () => {
				const priceboardId = this.dic.priceBoardDetail.watchlist
				const currentPriceBoard = func.getPriceboardDetailInPriceBoard(priceboardId)

				if (!Util.compareObject(this.dic.priceBoardDetail, currentPriceBoard)) {
					await this.unsubLv1Realtime()
					this.dic.priceBoardDetail = currentPriceBoard
					this.setSubtitle()
					this.reloadWhenPriceboardChange()
				}
			})

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	subLv1Realtime() {
		try {
			const listSymbol = this.getListCode()
			const isPriceStreaming = Controller.isPriceStreaming()
			const haveSymbol = Util.arrayHasItem(listSymbol)

			if (isPriceStreaming && haveSymbol) {
				const listSymbolObj = listSymbol.map(symbol => ({
					exchange: func.getExchangeSymbol(symbol),
					symbol
				}))
				return new Promise(resolve => {
					AllMarket.setIsAIO(false)
					AllMarket.sub(listSymbolObj, this.id, resolve)
				})
			} else {
				return Promise.resolve()
			}
		} catch (error) {
			console.catch(error)
			return Promise.reject(error)
		}
	}

	unsubLv1Realtime() {
		try {
			const listSymbol = this.getListCode()
			const isPriceStreaming = Controller.isPriceStreaming()
			const haveSymbol = Util.arrayHasItem(listSymbol)

			if (isPriceStreaming && haveSymbol) {
				const listSymbolObj = listSymbol.map(symbol => ({
					exchange: func.getExchangeSymbol(symbol),
					symbol
				}))
				return new Promise(resolve => AllMarket.unsub(listSymbolObj, this.id, resolve))
			} else {
				return Promise.resolve()
			}
		} catch (error) {
			console.catch(error)
			return Promise.reject(error)
		}
	}
	//  #endregion

	//  #region NAVIGATION
	onNavigatorEvent(event) {
		super.onNavEvent(event)

		try {
			if (event.type === 'DeepLink') {
				ManageNavigation.resetStack()
				switchForm(this.props.navigator, event)
			} else if (event.type === 'NavBarButtonPress') {
				switch (event.id) {
					case 'menu_ios':
						this.props.navigator.toggleDrawer({
							side: 'left',
							animated: true
						});
						break;
					case 'add':
						const nextScreenObj = {
							screen: SCREEN.ADDCODE,
							title: I18n.t('editWatchList'),
							backButtonTitle: ' ',
							animationType: 'slide-up',
							overrideBackPress: true,
							passProps: {
								priceBoardName: this.dic.priceBoardDetail.watchlist_name,
								priceBoardId: this.dic.priceBoardDetail.watchlist,
								isConnected: this.props.isConnected
							},
							navigatorStyle: {
								navBarBackgroundColor: CommonStyle.statusBarBgColor,
								navBarTranslucent: false,
								drawUnderNavBar: true,
								navBarHideOnScroll: false,
								navBarTextColor: config.color.navigation,
								navBarTextFontFamily: 'HelveticaNeue-Medium',
								navBarTextFontSize: 18,
								navBarButtonColor: config.button.navigation,
								statusBarColor: CommonStyle.statusBarBgColor,
								statusBarTextColorScheme: 'light',
								navBarNoBorder: true,
								navBarSubtitleColor: 'white',
								navBarSubtitleFontFamily: 'HelveticaNeue'
							}
						}
						ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
						break;
					case 'left_filter':
						this.onShowPriceboard();
						break;
					case 'trade_refresh':
						this.getNewestPrice()
						break;
				}
			} else {
				switch (event.id) {
					case 'willAppear':
						this.resetDicPlaceOrderObject()
						this.setNavButton()
						break;
					case 'didAppear':
						ManageNavigation.checkIsBacking() &&
							ManageNavigation.checkIsDestinationScreenId(SCREEN.TRADE) &&
							ManageNavigation.doneBacking()
						ManageNavigation.resetStack()
						func.setCurrentScreenId(CURRENT_SCREEN)
						break;
					case 'willDisappear':
						break;
					case 'didDisappear':
						console.log('TRADE didDisappear')
						break;
					default:
						break;
				}
			}

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	setSubtitle(title) {
		try {
			if (dataStorage.currentScreenId === ScreenId.UNIVERSAL_SEARCH) {
				return false
			}

			const subtitle = title || func.getPriceboardNameInPriceBoard(this.dic.priceBoardDetail.watchlist)
			this.props.navigator.setSubTitle({ subtitle })

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	setNavButton() {
		try {
			if (dataStorage.currentScreenId === ScreenId.UNIVERSAL_SEARCH) {
				return false
			}

			const BROWSER_OUTLINE_BTN = {
				icon: iconsMap['ios-browsers-outline'],
				id: 'left_filter',
				testID: 'left_filter_button'
			};
			const ADD_BTN = {
				title: 'Add',
				id: 'add',
				icon: iconsMap['ios-create-outline']
			};
			const REFRESH_BTN = {
				title: 'Refresh',
				id: 'trade_refresh',
				icon: iconsMap['ios-refresh-outline'],
				testID: 'trade_refresh'
			};
			const REFRESHING_BTN = {
				id: 'custom-button-watchlist',
				component: 'equix.CustomButtonWatchlist'
			};
			const rightButtons = Controller.isPriceStreaming()
				? [BROWSER_OUTLINE_BTN]
				: this.dic.isLoadingPrice
					? [REFRESHING_BTN, BROWSER_OUTLINE_BTN]
					: [REFRESH_BTN, BROWSER_OUTLINE_BTN]
			if (!this.checkCurrentPriceboardIsStatic() && Controller.getLoginStatus() && RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.C_E_R_WATCHLIST)) {
				rightButtons.push(ADD_BTN)
			}
			this.props.navigator.setButtons({ rightButtons })

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	onShowPriceboard() {
		try {
			const nextScreenObj = {
				screen: SCREEN.MANAGE_PRICEBOARD,
				title: I18n.t('WatchListTitle'),
				animated: true,
				animationType: 'slide-up',
				subtitle: I18n.t('categories'),
				navigatorStyle: {
					navBarBackgroundColor: CommonStyle.statusBarBgColor,
					navBarTranslucent: false,
					drawUnderNavBar: true,
					navBarHideOnScroll: false,
					navBarTextColor: config.color.navigation,
					navBarTextFontFamily: 'HelveticaNeue-Medium',
					navBarTextFontSize: 18,
					navBarButtonColor: config.button.navigation,
					statusBarColor: CommonStyle.statusBarBgColor,
					statusBarTextColorScheme: 'light',
					navBarNoBorder: true,
					navBarSubtitleColor: 'white',
					navBarSubtitleFontFamily: 'HelveticaNeue'
				}
			}
			ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}
	//  #endregion

	//  #region BUSINESS FUNCTION
	async reloadDataWhenSelectedPriceboardOrReconnectSuccess(priceboardId) {
		try {
			await this.unsubLv1Realtime()

			if (this.checkCurrentPriceboardIsStatic(priceboardId)) {
				await this.processPriceboardStatic(priceboardId)
			} else {
				this.dic.priceBoardDetail = func.getPriceboardDetailInPriceBoard(priceboardId)
			}

			this.subChannelWatchlistChanged()
			this.reloadWhenSelectedPriceboard()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	async loadData() {
		try {
			await this.getCurrentPriceBoard()
			this.subChannelWatchlistChanged()
			this.subChannelSelectedPriceboard()
			await this.getSymbolInfoAndCheckNewsToday()
			await this.subLv1Realtime()
			await this.getPriceSnapshot()
			this.setState({ isLoadingForm: false }, this.setNavButton)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	async reloadWhenSelectedPriceboard() {
		try {
			this.dic.listPriceObject = []
			await this.getSymbolInfoAndCheckNewsToday()
			await this.subLv1Realtime()
			await this.getPriceSnapshot()
			this.setState({ isLoadingForm: false }, this.setNavButton)

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	async reloadWhenPriceboardChange() {
		try {
			this.setNavButton()
			this.dic.listPriceObject = []
			await this.getSymbolInfoAndCheckNewsToday()
			await this.subLv1Realtime()
			await this.getPriceSnapshot()
			this.setState()
			this.dic.timeUpdatedRef && this.dic.timeUpdatedRef.setTimeUpdate(new Date().getTime())

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	async getNewestPrice() {
		try {
			this.dic.isLoadingPrice = true
			Emitter.emit(this.dic.channelLoadingTrade, this.dic.isLoadingPrice);
			this.setNavButton()
			await this.getPriceSnapshot()
			this.dic.isLoadingPrice = false
			Emitter.emit(this.dic.channelLoadingTrade, this.dic.isLoadingPrice);
			this.setNavButton()
			this.dic.timeUpdatedRef && this.dic.timeUpdatedRef.setTimeUpdate(new Date().getTime())
			this.setState()

			return true
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	getListCode() {
		try {
			const value = this.dic.priceBoardDetail.value
			return Util.arrayHasItem(value)
				? value.map(item => item.symbol)
				: []
		} catch (error) {
			console.catch(error)
			return []
		}
	}

	async getSymbolInfoAndCheckNewsToday() {
		try {
			await Promise.all([
				this.getSymbolInfo(),
				this.checkNewsToday()
			])
			return Promise.resolve()
		} catch (error) {
			console.catch(error)
			return Promise.reject(error)
		}
	}

	async getSymbolInfo() {
		try {
			await Business.getSymbolInfoMultiExchange(this.getListCode())
			return Promise.resolve()
		} catch (error) {
			console.catch(error)
			return Promise.reject(error)
		}
	}

	checkNewsToday() {
		return new Promise(resolve => {
			const stringQuery = this.getListCode().join(',')

			if (stringQuery) {
				const checkUrl = Api.checkNewsTodayUrl(stringQuery);
				Api.requestData(checkUrl)
					.then(data => {
						if (data) {
							this.dic.dicNewsToday = data
							NewsBusiness.subNewsBySymbol(stringQuery)
						}
						resolve()
					})
					.catch(error => {
						console.catch(error)
						resolve()
					})
			} else {
				resolve()
			}
		})
	}

	async getPriceSnapshot() {
		return new Promise(resolve => {
			try {
				const listSymbol = this.getListCode()
				const isPriceStreaming = Controller.isPriceStreaming()
				const listSymbolObj = listSymbol.map(symbol => ({
					exchange: func.getExchangeSymbol(symbol),
					symbol
				}))

				if (!Util.arrayHasItem(listSymbol)) return resolve()

				UserPriceSource.loadDataPrice(Enum.STREAMING_MARKET_TYPE.QUOTE, listSymbolObj)
					.then(priceSnapshot => {
						const dicPrice = {}
						priceSnapshot.map(item => {
							if (item && item.symbol) dicPrice[item.symbol] = item
						})

						this.dic.listPriceObject = []
						this.dic.priceBoardDetail.value.sort((a, b) => a.rank - b.rank)
						this.dic.priceBoardDetail.value.map(item => {
							this.dic.listPriceObject.push(dicPrice[item.symbol] || { symbol: item.symbol })
						})
						resolve()
					})
					.catch(resolve)
			} catch (error) {
				console.catch(error)
				resolve()
			}
		})
	}

	checkCurrentPriceboardIsStatic(currentId) {
		try {
			if (!currentId && this.dic.priceBoardDetail) currentId = this.dic.priceBoardDetail.watchlist
			if (!currentId) return true

			const priceBoard = this.dic.listPriceboardStatic.find(item => item.watchlist === currentId)
			return priceBoard != null
		} catch (error) {
			console.catch(error)
			return true
		}
	}

	processPriceboardStatic(priceBoardId = this.dic.priceBoardDetail.watchlist) {
		return new Promise(async resolve => {
			Business.getSymbolPriceboardStatic(priceBoardId)
				.then(data => {
					try {
						this.dic.priceBoardDetail = data || {}
						const defaultPriceboardStatic = func.getPriceboardStaticById(priceBoardId)
						this.dic.priceBoardDetail = {
							...defaultPriceboardStatic,
							...this.dic.priceBoardDetail
						}
						resolve()
					} catch (error) {
						console.catch(error)
						resolve()
					}
				})
				.catch(resolve)
		})
	}

	processPriceboardPersonal() {
		return new Promise(async resolve => {
			try {
				let priceBoardDetail = this.dic.priceBoard
					.find(item => item.watchlist === this.dic.priceBoardDetail.watchlist)

				if (priceBoardDetail) {
					this.dic.priceBoardDetail = priceBoardDetail
				} else {
					this.dic.priceBoardDetail = func.getPriceboardDefault()
					priceBoardDetail = this.dic.priceBoard
						.find(item => item.watchlist === this.dic.priceBoardDetail.watchlist)

					if (priceBoardDetail) {
						this.dic.priceBoardDetail = priceBoardDetail
					} else {
						await this.createPriceBoardDefault()
					}
				}

				return resolve()
			} catch (error) {
				console.catch(error)
				return resolve()
			}
		})
	}

	async getCurrentPriceBoard() {
		try {
			await Promise.all([this.loadPriceBoard(), this.getLastestPriceBoard()])

			if (this.checkCurrentPriceboardIsStatic()) {
				await this.processPriceboardStatic()
			} else {
				await this.processPriceboardPersonal()
			}

			func.setCurrentPriceboardId(this.dic.priceBoardDetail.watchlist, true)
			this.setSubtitle()
			return Promise.resolve()
		} catch (error) {
			console.catch(error)
			return Promise.resolve()
		}
	}

	createPriceBoardDefault() {
		const userId = dataStorage.user_id
		return new Promise((resolve, reject) => {
			const item = {
				...func.getPriceboardDefault(),
				user_id: userId,
				value: []
			}
			Business.createPriceBoardDetail(userId, item)
				.then(data => {
					if (data.errorCode) {
						logDevice('info', `createPriceBoardDefault fail with data: ${JSON.stringify(item)}`)
						return resolve()
					}
					this.dic.priceBoardDetail = data
					this.dic.priceBoard.push(data)
					func.storeLastestPriceBoard(userId, data.watchlist)
					resolve()
				})
				.catch(reject)
		})
	}

	async loadPriceBoard() {
		try {
			const priceBoard = await Api.getPriceBoard(dataStorage.user_id)
			if (priceBoard) this.dic.priceBoard = priceBoard.data || []
			return Promise.resolve()
		} catch (error) {
			console.catch(error)
			return Promise.resolve()
		}
	}

	async getLastestPriceBoard() {
		try {
			if (Controller.getLoginStatus()) {
				const priceBoardId = await func.getLastestPriceBoard(dataStorage.user_id)

				this.dic.priceBoardDetail = priceBoardId
					? { watchlist: priceBoardId }
					: func.getPriceboardDefault()
			} else {
				this.dic.priceBoardDetail = { watchlist: PRICEBOARD_STATIC_ID.SP_20 }
			}
			return Promise.resolve()
		} catch (error) {
			console.catch(error)
			return Promise.resolve()
		}
	}

	switchToNewOrderScreen() {
		try {
			if (!this.dic.placingOrderObject) return
			if (!Controller.getLoginStatus()) return;

			const { data, side = SIDE.BUY } = this.dic.placingOrderObject
			const isBuy = side === SIDE.BUY
			const symbol = data && data.symbol ? data.symbol : ''
			const exchanges = func.getExchangeSymbol(symbol);
			const isParitech = Business.isParitech(symbol)

			func.setBackNewOrderStatus(false)
			const passProps = {
				displayName: symbol,
				isBuy,
				code: symbol,
				exchange: data && data.exchange ? data.exchange : '',
				isParitech,
				changePercent: data && data.change_percent ? formatNumberNew2(data.change_percent, 2) : 0,
				tradePrice: data && data.trade_price ? formatNumberNew2(data.trade_price, 3) : null,
				exchanges: getExchange(exchanges),
				limitPrice: isBuy
					? data && data.ask_price ? data.ask_price : 0
					: data && data.bid_price ? data.bid_price : 0,
				stopPrice: data && data.trade_price ? data.trade_price : 0,
				volume: 0,
				isNotShowMenu: true
			}
			showNewOrderModal({
				navigator: this.props.navigator,
				passProps
			})
		} catch (error) {
			logDevice('info', `onOrder price exception: ${error}`)
			logAndReport('onOrder price exception', error, 'onOrder price');
			console.catch(error)
			return false
		}
	}

	onChangeVisibleRows(visibleRows, changedRows) {
		try {
			const isValid = visibleRows && visibleRows[SECTION_ID] &&
				changedRows && changedRows[SECTION_ID]

			if (isValid) {
				this.dic.visibleRows = visibleRows[SECTION_ID];
				Emitter.emit(this.dic.channelAllowRenderIndex, changedRows[SECTION_ID]);

				return true
			} else {
				return false;
			}
		} catch (error) {
			console.catch(error)
			return false
		}
	}

	rowHasChanged() {
		return false
	}
	//  #endregion

	//  #region EVENT OF ELEMENT
	onRefTimeUpdated(ref) {
		this.dic.timeUpdatedRef = ref
	}
	//  #endregion

	//  #region RENDER
	renderHeader() {
		try {
			const isTopValuePriceboard = func.isCurrentPriceboardTopValue()
			const priceBoardId = func.getCurrentPriceboardId()

			return (
				<View style={{
					backgroundColor: 'white',
					flexDirection: 'row',
					marginHorizontal: 16,
					height: 40,
					alignItems: 'center',
					borderBottomWidth: 1,
					borderBottomColor: '#0000001e'
				}} >
					<View style={styles.col1}>
						<Text style={CommonStyle.textMainHeader}>{I18n.t('symbolUpper')}</Text>
						<Text style={CommonStyle.textSubHeader}>{I18n.t('securityUpper')}</Text>
					</View>
					<View style={[styles.col2, { paddingRight: isTopValuePriceboard ? 0 : 4 }]}>
						{
							isTopValuePriceboard
								? <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('valueTradedUpper')}</Text>
								: <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('priceUpper')}</Text>
						}
						{
							isTopValuePriceboard || priceBoardId === Enum.WATCHLIST.TOP_ASX_INDEX
								? <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}></Text>
								: <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('quantityUpper')}</Text>
						}
					</View>
					<View style={styles.col3}>
						<Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('overviewChgP')}</Text>
						<Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('chgUpper')}</Text>
					</View>
				</View>
			)
		} catch (error) {
			console.catch(error)
			return null
		}
	}

	renderFooter() {
		return (
			<View>
				<View style={{ height: CommonStyle.heightTabbar }}></View>
			</View>
		)
	}

	renderRow(rowData, sectionId, rowID) {
		try {
			const symbol = rowData.symbol
			const displayName = func.getDisplayNameSymbol(symbol) || symbol
			const allowRender = Controller.isPriceStreaming()
				? this.dic.visibleRows[rowID] === true
				: true
			const ExpandComponent = this.dic.listPriceObject.length >= 100
				? PureCollapsible
				: RnCollapsible

			return (
				<View testID={`${symbol}WatchListRowData`} key={`${symbol}view`}>
					<Price
						isNewsToday={this.dic.dicNewsToday[symbol] || false}
						channelLoadingTrade={this.dic.channelLoadingTrade}
						symbol={symbol}
						channelAllowRenderIndex={Controller.isPriceStreaming()
							? this.dic.channelAllowRenderIndex
							: null}
						displayName={displayName}
						data={rowData}
						login={this.props.login}
						navigator={this.props.navigator}
						key={symbol}
						isLoading={this.dic.isLoadingPrice}
						rowID={rowID}
						channelChildExpandStatus={this.channelChildExpandStatus}
						allowRender={allowRender}
						placingOrderHookFunc={this.receiveRequestPlaceOrder}
						expandComponent={ExpandComponent}
					/>
					<View style={CommonStyle.borderBelow}></View>
				</View>
			)
		} catch (error) {
			console.catch(error)
			return null
		}
	}

	renderLoading() {
		return <View style={{ flex: 1 }}>
			{this.props.isConnected ? <View /> : <NetworkWarning />}
			<View style={CommonStyle.progressBarWhite}>
				<ProgressBar />
			</View>
		</View>
	}

	renderNoneLoading() {
		try {
			const ds = new ListView.DataSource({ rowHasChanged: this.rowHasChanged });
			const dataSource = ds.cloneWithRows(this.dic.listPriceObject || []);

			return (
				<View style={{ flex: 1 }}>
					{this.props.isConnected ? <View /> : <NetworkWarning />}
					{
						Controller.getUserVerify() === 0
							? <VerifyMailNoti verifyMailFn={() => {
								pushToVerifyMailScreen(this.props.navigator, this.props.setting.lang)
							}} />
							: <View />
					}
					{
						func.getUserPriceSource() === UserType.Delay
							? <Warning warningText={I18n.t('delayWarning')} isConnected={true} />
							: <View />
					}
					{
						Controller.isPriceStreaming()
							? <View />
							: <TimeUpdated isShow={true} onRef={this.onRefTimeUpdated} />
					}
					{this.renderHeader()}
					{
						Util.arrayHasItem(this.dic.listPriceObject)
							? <ListView
								pageSize={30}
								removeClippedSubviews={false}
								keyboardShouldPersistTaps="always"
								dataSource={dataSource}
								renderFooter={this.renderFooter}
								renderRow={this.renderRow}
								onChangeVisibleRows={this.onChangeVisibleRows} />
							: <View />
					}
					<AuthenPin
						showQuickButton={true}
						navigator={this.props.navigator}
						channelRequestCheckAuthen={this.dic.channelRequestCheckAuthen}
						onAuthSuccess={this.switchToNewOrderScreen} />
				</View>
			)
		} catch (error) {
			console.catch(error)
			return null
		}
	}

	render() {
		return this.state.isLoadingForm
			? this.renderLoading()
			: this.renderNoneLoading()
	}
	//  #endregion
}

function mapStateToProps(state) {
	return {
		login: state.login,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(loginActions, dispatch),
		authSettingActions: bindActionCreators(authSettingActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Trade);
