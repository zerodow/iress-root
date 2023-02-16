import _ from 'lodash';

import { iconsMap } from '../../utils/AppIcons';
import { dataStorage, func } from '../../storage';
import { logDevice, switchForm } from '../../lib/base/functionUtil';
import * as Api from '../../api';
import * as Util from '../../util';
import * as Business from '../../business';
import * as Emitter from '@lib/vietnam-emitter';
import * as RoleUser from '../../roleUser';
import * as Channel from '../../streaming/channel';
import * as NewsBusiness from '../../streaming/news';
import * as Controller from '../../memory/controller';
import * as AllMarket from '../../streaming/all_market';
import * as UserPriceSource from '../../userPriceSource';
import * as StreamingBusiness from '../../streaming/streaming_business';
import Enum from '../../enum';
import XComponent from '../../component/xComponent/xComponent';
import * as ManageConection from '../../manage/manageConnection';
import ScreenId from '../../constants/screen_id';
import * as ManageNavigation from '../../manage_navigation';
import config from '../../config';
import I18n from '../../modules/language';
import StateApp from '../../lib/base/helper/appState';
import CommonStyle from '~/theme/theme_controller';

const { TAB_NEWS } = Enum
const SIDE = Enum.SIDE;
const PRICEBOARD_STATIC_ID = Enum.PRICEBOARD_STATIC_ID;
const SCREEN = Enum.SCREEN;
const CURRENT_SCREEN = ScreenId.TRADE;
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE;

export default class HandleDataComp extends XComponent {
	init() {
		// this.dic = this.props.dic;
		this.changeStateParent = this.props.setStateParent;

		this.getNewestPrice = this.getNewestPrice.bind(this);
		this.onSelectedPriceboard = this.onSelectedPriceboard.bind(this);
		this.setNavButton = this.setNavButton.bind(this);
		this.onWatchlistChange = this.onWatchlistChange.bind(this);

		this.dic = {
			visibleRows: {},
			dicNewsToday: {},
			listViewRef: null,
			listPriceObject: [],
			priceBoardDetail: {},
			timeUpdatedRef: null,
			isPlacingOrder: false,
			isLoadingPrice: false,
			placingOrderObject: null,
			channelPriceboardChanged: '',
			channelLoading: Channel.getChannelLoadingChild(this.id),
			channelPlaceOrder: Channel.getChannelPlaceOrder(this.id),
			channelAllowRender: Channel.getChannelAllowRender(this.id),
			channelExpandingChange: Channel.getChannelExpandChange(this.id),
			channelRequestCheckAuthen: Channel.getChannelRequestCheckAuthen(
				this.id
			)
		};
		if (this.props.setDic) {
			this.props.setDic(this.dic);
		}
		func.setCurrentScreenId(ScreenId.TRADE)
		if (!Controller.isPriceStreaming()) {
			this.stateApp = new StateApp(
				this.getNewestPrice,
				null,
				ScreenId.TRADE,
				false
			);
		}
	}

	componentDidMount() {
		super.componentDidMount();

		this.subChannelPlaceOrder();
		this.firstLoading();

		ManageConection.setScreenId(ScreenId.TRADE);
		ManageConection.dicConnection.getSnapshot = this.getNewestPrice;
	}

	onNavigatorEvent(event) {
		super.onNavEvent(event);

		if (event.type === 'DeepLink') {
			ManageNavigation.resetStack();
			switchForm(this.props.navigator, event);
		} else if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'menu_ios':
					this.props.navigator.toggleDrawer({
						side: 'left',
						animated: true
					});
					break;
				case 'add':
					this.moveToAddcode();
					break;
				case 'left_filter':
					this.moveToManagePriceboard();
					break;
				case 'trade_refresh':
					this.getNewestPrice();
					break;
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					this.props.resetExpand && this.props.resetExpand();
					this.navigatorID = this.props.navigatorID;
					this.setNavButton();
					break;
				case 'didAppear':
					this.dic.isPlacingOrder = false;
					ManageNavigation.checkIsBacking() &&
						ManageNavigation.checkIsDestinationScreenId(
							SCREEN.TRADE
						) &&
						ManageNavigation.doneBacking();
					ManageNavigation.resetStack();
					func.setCurrentScreenId(CURRENT_SCREEN)
					break;
				case 'didDisappear':
					this.navigatorID = '';
					break;
				default:
					break;
			}
		}
	}

	moveToAddcode() {
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
			navigatorStyle: { ...CommonStyle.navigatorSpecial, ...{ drawUnderNavBar: true } }
		};
		ManageNavigation.pushStepAndShow(
			this.props.navigator,
			nextScreenObj,
			NAVIGATION_TYPE.MODAL
		);
	}

	moveToManagePriceboard() {
		const nextScreenObj = {
			screen: SCREEN.MANAGE_PRICEBOARD,
			title: I18n.t('WatchListTitle'),
			animated: true,
			animationType: 'slide-up',
			subtitle: I18n.t('categories'),
			navigatorStyle: { ...CommonStyle.navigatorSpecial, ...{ drawUnderNavBar: true } }
		};
		ManageNavigation.pushStepAndShow(
			this.props.navigator,
			nextScreenObj,
			NAVIGATION_TYPE.MODAL
		);
	}

	async getNewestPrice() {
		try {
			const {
				channelLoading,
				timeUpdatedRef = {},
				listPriceObject
			} = this.dic;

			this.dic.isLoadingPrice = true;
			Emitter.emit(channelLoading, true);
			this.setNavButton();

			await this.getPriceSnapshot();

			this.dic.isLoadingPrice = false;
			Emitter.emit(channelLoading, false);
			this.setNavButton();

			timeUpdatedRef.setTimeUpdate &&
				timeUpdatedRef.setTimeUpdate(new Date().getTime());

			this.dic.listPriceObject.map(item => {
				const symbol = item.symbol;
				const exchange = func.getExchangeSymbol(symbol);
				const channel = StreamingBusiness.getChannelLv1(
					exchange,
					symbol
				);
				Emitter.emit(channel, item);
			});
		} catch (error) {
			console.catch(error);
		}
	}

	setNavButton() {
		if (this.navigatorID !== this.props.navigatorID) return;
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

		let rightButtons = [REFRESH_BTN, BROWSER_OUTLINE_BTN];
		if (this.dic.isLoadingPrice) {
			rightButtons = [REFRESHING_BTN, BROWSER_OUTLINE_BTN];
		}
		if (Controller.isPriceStreaming()) {
			rightButtons = [BROWSER_OUTLINE_BTN];
		}

		const { watchlist: id } = this.dic.priceBoardDetail;
		if (
			!func.checkCurrentPriceboardIsStatic(id) &&
			Controller.getLoginStatus() &&
			RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.C_E_R_WATCHLIST)
		) {
			rightButtons.push(ADD_BTN);
		}

		this.setRightBtnNav(rightButtons);
	}

	async componentWillUnmount() {
		try {
			NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED);
			ManageConection.unRegisterSnapshot(ScreenId.TRADE);
			await this.unsubLv1Realtime();
		} catch (error) { }
		super.componentWillUnmount();
	}

	subChannelPlaceOrder() {
		const {
			channelPlaceOrder,
			channelRequestCheckAuthen,
			isPlacingOrder
		} = this.dic;
		const cb = ({ side, value }) => {
			const isError =
				side == null ||
				(side !== SIDE.BUY && side !== SIDE.SELL) ||
				!value ||
				!value.symbol;
			if (isError || isPlacingOrder) return;

			this.setTimeout(() => {
				this.dic.isPlacingOrder = false;
			}, 1000);

			this.dic.placingOrderObject = { side, value };
			Emitter.emit(channelRequestCheckAuthen);
		};

		Emitter.addListener(channelPlaceOrder, this.id, cb);
	}

	async firstLoading() {
		try {
			await this.getCurrentPriceBoard();

			this.subChannelWatchlistChanged();
			this.subChannelSelectedPriceboard();

			await Promise.all([this.getSymbolInfo(), this.checkNewsToday()]);

			await this.subLv1Realtime();
			await this.getPriceSnapshot();
			this.changeStateParent({ isLoadingForm: false }, this.setNavButton);
		} catch (error) {
			console.catch(error);
		}
	}

	async getCurrentPriceBoard() {
		try {
			await Promise.all([
				this.loadAllPriceBoard(),
				this.getLastestPriceBoard()
			]);

			const id = this.dic.priceBoardDetail.watchlist;
			func.checkCurrentPriceboardIsStatic(id)
				? await this.processPriceboardStatic()
				: await this.processPriceboardPersonal();

			const newId = this.dic.priceBoardDetail.watchlist;
			func.setCurrentPriceboardId(newId, true);

			this.setSubtitle();
		} catch (error) {
			console.catch(error);
		}
	}

	async loadAllPriceBoard() {
		try {
			const userId = Controller.getUserId();
			await Api.getPriceBoard(userId);
		} catch (error) {
			console.catch(error);
		}
	}

	async getLastestPriceBoard() {
		if (Controller.getLoginStatus()) {
			const userId = Controller.getUserId();
			const priceBoardId = await func.getLastestPriceBoard(userId);

			this.dic.priceBoardDetail = priceBoardId
				? { watchlist: priceBoardId }
				: func.getPriceboardDefault();
		} else {
			this.dic.priceBoardDetail = {
				watchlist: PRICEBOARD_STATIC_ID.SP_20
			};
		}
	}

	async processPriceboardStatic(id = this.dic.priceBoardDetail.watchlist) {
		const data = (await Business.getSymbolPriceboardStatic(id)) || {};
		try {
			this.dic.priceBoardDetail = {
				...func.getPriceboardStaticById(id),
				...data
			};
		} catch (error) {
			console.catch(error);
		}
	}

	async processPriceboardPersonal() {
		try {
			let id = this.dic.priceBoardDetail.watchlist;
			let priceBoardDetail = func.getPriceboardPersonalById(id);

			if (priceBoardDetail) {
				this.dic.priceBoardDetail = priceBoardDetail;
			} else {
				id = func.getPriceboardDefault().watchlist;
				priceBoardDetail = func.getPriceboardPersonalById(id);

				if (priceBoardDetail) {
					this.dic.priceBoardDetail = priceBoardDetail;
				} else {
					await this.createPriceBoardDefault();
				}
			}
		} catch (error) {
			console.catch(error);
		}
	}

	setSubtitle(title) {
		const id = this.dic.priceBoardDetail.watchlist;
		const subtitle = title || func.getPriceboardNameInPriceBoard(id);
		this.xSetSubtitleNav(subtitle);
	}

	subChannelWatchlistChanged() {
		const {
			channelPriceboardChanged,
			priceBoardDetail: { watchlist } = {}
		} = this.dic;

		if (channelPriceboardChanged) {
			Emitter.deleteListener(channelPriceboardChanged, this.id);
		}

		this.dic.channelPriceboardChanged = StreamingBusiness.getChannelWatchlistChanged(
			watchlist
		);

		Emitter.addListener(
			this.dic.channelPriceboardChanged,
			this.id,
			this.onWatchlistChange
		);
	}

	subChannelSelectedPriceboard() {
		const channelSelectedPriceboard = Channel.getChannelSelectedPriceboard();
		Emitter.addListener(
			channelSelectedPriceboard,
			this.id,
			this.onSelectedPriceboard
		);
	}

	async onWatchlistChange() {
		try {
			const { priceBoardDetail, timeUpdatedRef = {} } = this.dic;
			const { watchlist: id } = priceBoardDetail || {};
			const currentPriceBoard = func.getPriceboardDetailInPriceBoard(id);

			if (_.isEqual(priceBoardDetail, currentPriceBoard)) return;

			NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED);
			await this.unsubLv1Realtime();
			this.dic.priceBoardDetail = currentPriceBoard;

			this.setSubtitle();
			await Promise.all([this.getSymbolInfo(), this.checkNewsToday()]);

			await this.subLv1Realtime();
			await this.getPriceSnapshot();
			this.changeStateParent();
			timeUpdatedRef.setTimeUpdate &&
				timeUpdatedRef.setTimeUpdate(new Date().getTime());
		} catch (error) {
			console.catch(error);
		}
	}

	unsubLv1Realtime() {
		const listSymbol = this.getListCode();
		const isPriceStreaming = Controller.isPriceStreaming();

		if (isPriceStreaming && listSymbol.length > 0) {
			const listSymbolObj = listSymbol.map(symbol => ({
				symbol,
				exchange: func.getExchangeSymbol(symbol)
			}));
			return new Promise(resolve =>
				AllMarket.unsub(listSymbolObj, this.id, resolve)
			);
		} else {
			return Promise.resolve();
		}
	}

	getListCode() {
		try {
			const { value = {} } = this.dic.priceBoardDetail || {};
			return value.map(item => item.symbol);
		} catch (error) {
			console.catch(error);
			return [];
		}
	}

	async getSymbolInfo() {
		try {
			await Business.getSymbolInfoMultiExchange(this.getListCode());
		} catch (error) {
			console.catch(error);
		}
	}

	async checkNewsToday() {
		const stringQuery = this.getListCode().join(',');

		if (stringQuery) {
			const checkUrl = Api.checkNewsTodayUrl(stringQuery);
			try {
				const data = await Api.requestData(checkUrl);
				if (data) {
					this.dic.dicNewsToday = data;
					NewsBusiness.subNewsBySymbol(stringQuery);
				}
			} catch (error) {
				console.catch(error);
			}
		}
	}

	async getPriceSnapshot() {
		try {
			this.dic.listPriceObject = [];
			const listSymbol = this.getListCode();
			if (!Util.arrayHasItem(listSymbol)) return;

			const listSymbolObj = listSymbol.map(symbol => ({
				exchange: func.getExchangeSymbol(symbol),
				symbol
			}));

			const priceSnapshot = await UserPriceSource.loadDataPrice(
				Enum.STREAMING_MARKET_TYPE.QUOTE,
				listSymbolObj
			);
			const dicPrice = {};
			priceSnapshot.map(item => {
				if (item && item.symbol) dicPrice[item.symbol] = item;
			});

			const { value = [] } = this.dic.priceBoardDetail || {};
			const valueSorted = _.sortBy(value, p => p.rank);

			this.dic.listPriceObject = _.map(
				valueSorted,
				({ symbol }) => dicPrice[symbol] || { symbol }
			);
		} catch (error) {
			this.dic.listPriceObject = [];
			console.catch(error);
		}
	}

	async onSelectedPriceboard(priceboardId) {
		try {
			if (priceboardId === this.dic.priceBoardDetail.watchlist) return;

			this.setSubtitle(func.getPriceboardNameInPriceBoard(priceboardId));
			this.changeStateParent({ isLoadingForm: true }, this.setNavButton);

			await this.unsubLv1Realtime();

			if (func.checkCurrentPriceboardIsStatic(priceboardId)) {
				await this.processPriceboardStatic(priceboardId);
			} else {
				this.dic.priceBoardDetail = func.getPriceboardPersonalById(
					priceboardId
				);
			}

			this.subChannelWatchlistChanged();
			await Promise.all([this.getSymbolInfo(), this.checkNewsToday()]);
			await this.subLv1Realtime();
			await this.getPriceSnapshot();

			this.props.resetExpand && this.props.resetExpand();
			this.changeStateParent({ isLoadingForm: false }, this.setNavButton);
		} catch (error) {
			console.catch(error);
		}
	}

	subLv1Realtime() {
		const listSymbol = this.getListCode();
		const isPriceStreaming = Controller.isPriceStreaming();

		if (isPriceStreaming && listSymbol.length > 0) {
			const listSymbolObj = listSymbol.map(symbol => ({
				exchange: func.getExchangeSymbol(symbol),
				symbol
			}));
			return new Promise(resolve => {
				AllMarket.setIsAIO(false)
				AllMarket.sub(listSymbolObj, this.id, resolve)
			});
		} else {
			return Promise.resolve();
		}
	}

	async createPriceBoardDefault() {
		const userId = Controller.getUserId();
		const item = {
			...func.getPriceboardDefault(),
			user_id: userId,
			value: []
		};
		try {
			const data = await Business.createPriceBoardDetail(userId, item);
			if (data.errorCode) {
				logDevice(
					'info',
					`createPriceBoardDefault fail with data: ${JSON.stringify(
						item
					)}`
				);
				return;
			}
			this.dic.priceBoardDetail = data;
			func.storeLastestPriceBoard(userId, data.watchlist);
		} catch (error) {
			console.catch(error);
		}
	}

	render() {
		return null;
	}
}
