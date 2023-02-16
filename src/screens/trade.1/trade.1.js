import React, { PureComponent } from 'react';
import { Text, View, PixelRatio, FlatList } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Uuid from 'react-native-uuid';
import _ from 'lodash';

import * as Channel from '../../streaming/channel';
import { dataStorage, func } from '../../storage';
import config from '../../config';
import styles from './style/trade';
import Enum from '../../enum';
import * as Business from '../../business';
import AuthenPin from '../../component/authen_pin/authen_pin';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as Emitter from '@lib/vietnam-emitter';
import ProgressBar from '../../modules/_global/ProgressBar';
import * as ManageNavigation from '../../manage_navigation';
import Header from './trade_header';
import {
	switchForm,
	getExchange,
	formatNumberNew2,
	logAndReport,
	logDevice,
	pushToVerifyMailScreen
} from '../../lib/base/functionUtil';
import TimeUpdated from '../../component/time_updated/time_updated';
import Warning from '../../component/warning/warning';
import UserType from '../../constants/user_type';
import NetworkWarning from '../../component/network_warning/network_warning';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import * as Controller from '../../memory/controller';
import WatchlistActions from './trade.reducer';
import * as StreamingBusiness from '../../streaming/streaming_business';
import ListPrice from './trade_list_price';
import { showNewOrderModal } from '~/navigation/controller.1'

const SIDE = Enum.SIDE;
const SCREEN = Enum.SCREEN;
const CURRENT_SCREEN = SCREEN.TRADE;
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE;

const LoadingComp = props => (
	<View style={{ flex: 1 }}>
		{props.isConnected ? <View /> : <NetworkWarning />}
		<View style={CommonStyle.progressBarWhite}>
			<ProgressBar />
		</View>
	</View>
);

export class Trade extends PureComponent {
	static propTypes = {
		login: PropTypes.object
	};

	constructor(props) {
		super(props);
		const { setSubTitle, navigator, setNavButton } = this.props;
		setSubTitle(subtitle => navigator.setSubTitle({ subtitle }));
		setNavButton(rightButtons => navigator.setButtons({ rightButtons }));
		this.id = Uuid.v4();

		this.channelRequestCheckAuthen = Channel.getChannelRequestCheckAuthen(
			this.id
		);
		this.channelLoadingTrade = StreamingBusiness.getChannelLoadingTrade();
		this.channelAllowRenderIndex = StreamingBusiness.getChannelAllowRenderIndex(
			this.id
		);

		this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
		this.onShowPriceboard = this.onShowPriceboard.bind(this);
		this.switchToNewOrderScreen = this.switchToNewOrderScreen.bind(this);
		this.receiveRequestPlaceOrder = this.receiveRequestPlaceOrder.bind(
			this
		);
	}

	//  #region REACT AND DEFAULT FUNCTION

	componentDidMount() {
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);

		this.props.init(this.id);
		if (Controller.isPriceStreaming()) {
		}
	}

	componentWillUnmount() {
		this.props.unSubAll();
	}
	//  #endregion

	//  #region HOOK FUNCTION
	receiveRequestPlaceOrder(side, data) {
		try {
			const isErrorPlacingOrderInfo =
				side == null ||
				(side !== SIDE.BUY && side !== SIDE.SELL) ||
				!data ||
				!data.symbol;
			if (isErrorPlacingOrderInfo) return false;

			this.placingOrderObject = { side, data };
			Emitter.emit(this.channelRequestCheckAuthen);

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}
	//  #endregion

	//  #region NAVIGATION
	onNavigatorEvent(event) {
		try {
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
						const {
							watchlist_name: priceBoardName,
							watchlist: priceBoardId
						} = this.props.priceBoardDetail;
						const nextScreenObj = {
							screen: SCREEN.ADDCODE,
							title: 'Edit Watchlist',
							backButtonTitle: ' ',
							animationType: 'slide-up',
							overrideBackPress: true,
							passProps: {
								priceBoardName,
								priceBoardId,
								isConnected: this.props.isConnected
							},
							navigatorStyle: {
								navBarBackgroundColor:
									CommonStyle.statusBarBgColor,
								navBarTranslucent: false,
								drawUnderNavBar: true,
								navBarHideOnScroll: false,
								navBarTextColor: config.color.navigation,
								navBarTextFontFamily: 'HelveticaNeue-Medium',
								navBarTextFontSize: 18,
								navBarButtonColor: config.button.navigation,
								statusBarColor: config.background.statusBar,
								statusBarTextColorScheme: 'light',
								navBarNoBorder: true,
								navBarSubtitleColor: 'white',
								navBarSubtitleFontFamily: 'HelveticaNeue'
							}
						};
						ManageNavigation.pushStepAndShow(
							this.props.navigator,
							nextScreenObj,
							NAVIGATION_TYPE.MODAL
						);
						break;
					case 'left_filter':
						this.onShowPriceboard();
						break;
					case 'trade_refresh':
						this.props.appShowWhenHide();
						break;
				}
			} else {
				switch (event.id) {
					case 'willAppear':
						this.props.setNavButton();
						break;
					case 'didAppear':
						ManageNavigation.checkIsBacking() &&
							ManageNavigation.checkIsDestinationScreenId(
								SCREEN.TRADE
							) &&
							ManageNavigation.doneBacking();
						ManageNavigation.resetStack();
						func.setCurrentScreenId(CURRENT_SCREEN)
						break;
					case 'willDisappear':
						break;
					case 'didDisappear':
						break;
					default:
						break;
				}
			}

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}

	onShowPriceboard() {
		try {
			const nextScreenObj = {
				screen: SCREEN.MANAGE_PRICEBOARD,
				title: 'Watchlist',
				animated: true,
				animationType: 'slide-up',
				subtitle: 'Categories',
				navigatorStyle: {
					navBarBackgroundColor: CommonStyle.statusBarBgColor,
					navBarTranslucent: false,
					drawUnderNavBar: true,
					navBarHideOnScroll: false,
					navBarTextColor: config.color.navigation,
					navBarTextFontFamily: 'HelveticaNeue-Medium',
					navBarTextFontSize: 18,
					navBarButtonColor: config.button.navigation,
					statusBarColor: config.background.statusBar,
					statusBarTextColorScheme: 'light',
					navBarNoBorder: true,
					navBarSubtitleColor: 'white',
					navBarSubtitleFontFamily: 'HelveticaNeue'
				}
			};
			ManageNavigation.pushStepAndShow(
				this.props.navigator,
				nextScreenObj,
				NAVIGATION_TYPE.MODAL
			);

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}
	//  #endregion

	//  #region BUSINESS FUNCTION

	switchToNewOrderScreen() {
		try {
			if (!this.placingOrderObject) return;
			if (!Controller.getLoginStatus()) return;

			const { data, side } = this.placingOrderObject;
			const isBuy = side === SIDE.BUY;
			const symbol = data && data.symbol ? data.symbol : '';
			const exchanges = func.getExchangeSymbol(symbol);
			const isParitech = Business.isParitech(symbol);

			func.setBackNewOrderStatus(false);
			const passProps = {
				displayName: symbol,
				isBuy,
				code: symbol,
				exchange: data && data.exchange ? data.exchange : '',
				isParitech,
				changePercent:
					data && data.change_percent
						? formatNumberNew2(data.change_percent, 2)
						: 0,
				tradePrice:
					data && data.trade_price
						? formatNumberNew2(data.trade_price, 3)
						: null,
				exchanges: getExchange(exchanges),
				limitPrice: isBuy
					? data && data.ask_price
						? data.ask_price
						: 0
					: data && data.bid_price
						? data.bid_price
						: 0,
				stopPrice: data && data.trade_price ? data.trade_price : 0,
				volume: 0,
				isNotShowMenu: true
			}
			showNewOrderModal({
				navigator: this.props.navigator,
				passProps
			})
		} catch (error) {
			logDevice('info', 'onOrder price exception');
			logAndReport('onOrder price exception', error, 'onOrder price');
			console.catch(error);
		}
	}
	//  #endregion

	//  #region EVENT OF ELEMENT
	onRefTimeUpdated(ref) {
		this.dic.timeUpdatedRef = ref;
	}
	//  #endregion

	//  #region RENDER
	renderDelayWarning() {
		if (func.getUserPriceSource() === UserType.Delay) {
			return (
				<Warning
					warningText={I18n.t('delayWarning', {
						locale: this.props.setting.lang
					})}
					isConnected={true}
				/>
			);
		}
		return <View />;
	}

	renderTimeUpdate() {
		if (Controller.isPriceStreaming()) return <View />;

		return <TimeUpdated isShow={true} ref="timeComp" />;
	}

	render() {
		const { isConnected, isLoadingForm } = this.props;
		if (isLoadingForm) {
			return <LoadingComp isConnected={isConnected} />;
		}
		return (
			<View style={{ flex: 1 }}>
				{isConnected ? <View /> : <NetworkWarning />}
				{this.renderDelayWarning()}
				{this.renderTimeUpdate()}
				<Header />
				<ListPrice />
				<AuthenPin
					showQuickButton={true}
					navigator={this.props.navigator}
					channelRequestCheckAuthen={this.channelRequestCheckAuthen}
					onAuthSuccess={this.switchToNewOrderScreen}
				/>
			</View>
		);
	}

	//  #endregion
}

function mapStateToProps(state) {
	return {
		priceBoardDetail: state.watchlist.priceBoardDetail,
		isLoadingForm: state.watchlist.isLoadingForm,
		login: state.login,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

const mapDispatchToProps = dispatch => ({
	unSubAll: (...p) => dispatch(WatchlistActions.unSubAll(...p)),
	init: (...p) => dispatch(WatchlistActions.initWatchlistComp(...p)),
	setSubTitle: (...p) =>
		dispatch(WatchlistActions.setSubTitleWatchlist(...p)),
	setNavButton: (...p) =>
		dispatch(WatchlistActions.setNavButtonWatchlist(...p)),
	listenWatchlist: (...p) => dispatch(WatchlistActions.listenWatchlist(...p)),
	listenPriceboard: (...p) =>
		dispatch(WatchlistActions.listenPriceboard(...p)),
	appShowWhenHide: (...p) =>
		dispatch(WatchlistActions.reloadWatchlistFromBg(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Trade);
