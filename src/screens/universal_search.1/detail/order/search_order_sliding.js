import React, { PureComponent } from 'react';
import { FlatList, View, Text, TouchableOpacity, Platform } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import styles from '@unis/style/universal_search';
import * as Controller from '~/memory/controller';
import moment from 'moment';
import {
	formatNumber, logDevice, getOrderIdByType, getDisplayName, logAndReport, checkTradingHalt,
	formatNumberNew2
} from '~/lib/base/functionUtil';
import OrderActions from './search_order.reducer';
import I18n from '~/modules/language';
import Enum from '~/enum';
import * as RoleUser from '~/roleUser';
import LoadingComp from '~/component/loadingComp';
import AppState from '~/lib/base/helper/appState2';
import * as Business from '~/business';
import { func, dataStorage } from '~/storage';
import filterType from '~/constants/filter_type';
import Flag from '~/component/flags/flag';
import orderStateEnum from '~/constants/order_state_enum';

const lastCodeOrders = {};
const registerOrders = {};
const {
	USER_TYPE, SCREEN, TITLE_FORM, ID_ELEMENT, ICON_NAME,
	SPECIAL_STRING, PRICE_DECIMAL, USER_TYPE_ROLE_SHOW_ORDER_STATE
} = Enum
export class Header extends PureComponent {
	getText(text) {
		return I18n.t(text, {
			locale: this.props.language
		});
	}
	render() {
		return (
			<View
				style={{
					marginHorizontal: 14,
					alignItems: 'center',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingVertical: 6,
					borderBottomWidth: 1,
					borderColor: CommonStyle.fontBorderGray
				}}
			>
				<View style={{ flexDirection: 'row' }}>
					<Text style={[styles.col21, CommonStyle.textMainHeader]}>
						{this.getText('symbolUpper')}
					</Text>
					<Text
						style={[
							styles.col22,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('quantityUpper')}
					</Text>
					<Text
						style={[
							styles.col23,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('limitPriceUpper')}
					</Text>
					<Text
						style={[
							styles.col24,
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('FilledPriceUpper')}
					</Text>
				</View>
				<View style={{ paddingTop: 1, flexDirection: 'row' }}>
					<Text style={[styles.col21, CommonStyle.textSubHeader]}>
						{this.getText('sideUpper')}
					</Text>
					<Text
						style={[
							styles.col22,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('FilledUpper')}
					</Text>
					<Text
						style={[
							styles.col23,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('stopPriceUpper')}
					</Text>
					<Text
						style={[
							styles.col24,
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{this.getText('DurationUpper')}
					</Text>
				</View>
			</View>
		);
	}
}
class MoreComp extends PureComponent {
	constructor(props) {
		super(props);
		this.loadMore = this.loadMore.bind(this);
	}
	loadMore() {
		const { filterType, loadMoreOrderData } = this.props;
		loadMoreOrderData(filterType);
	}
	render() {
		const { isMore } = this.props;
		if (isMore) {
			return (
				<TouchableOpacity
					onPress={this.loadMore}
					style={[styles.rowExpandNews, { width: '100%', backgroundColor: CommonStyle.backgroundColor }]}
				>
					<Text
						style={{
							fontSize: CommonStyle.fontSizeS,
							color: CommonStyle.fontBlue
						}}
					>
						{I18n.t('more', {
							locale: this.props.language
						})}
					</Text>
				</TouchableOpacity>
			);
		}

		return <View style={{ height: 16 }} />;
	}
}

export const More = connect(
	(state, ownProps) => {
		const { filterType } = ownProps;
		const { listOrderData } = state.searchOrder;
		const { isMore } = listOrderData[filterType];
		return { isMore };
	},
	dispatch => ({
		loadMoreOrderData: (...p) =>
			dispatch(OrderActions.loadMoreOrderData(...p))
	})
)(MoreComp);
export class SearchOrderSliding extends PureComponent {
	constructor(props) {
		super(props);
		const { filterType: type } = this.props;
		lastCodeOrders[type] = '';
		registerOrders[type] = {};

		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.getSnapshot(type);
		});
		this.state = {
			tradingHalt: false
		}
	}

	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol, filterType } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;
		if (changeNerworkState || changeSymbol) {
			this.props.getSnapshot(filterType);
		}
		if (changeSymbol) {
			nextProps.resetData(filterType);
		}
	};

	componentDidMount = () => {
		const { filterType } = this.props;
		this.props.resetData(filterType);
		this.props.getSnapshot(filterType);
	};

	onNavigatorEvent(event) {
		const { filterType } = this.props;
		switch (event.id) {
			case 'search_refresh':
				this.props.getSnapshot(filterType);
				break;
			case 'willAppear':
				this.props.resetData(filterType);
				this.props.getSnapshot(filterType);
				break;
			case 'didAppear':
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}
	getListUnread() {
		let listUnread = [];
		switch (this.props.typeFilter) {
			case filterType.WORKING: listUnread = dataStorage.list_working_unread; break;
			case filterType.FILLED: listUnread = dataStorage.list_filled_unread; break;
			case filterType.CANCELLED: listUnread = dataStorage.list_cancelled_unread; break;
			case filterType.STOPLOSS: listUnread = dataStorage.list_stoploss_unread; break;
			default: listUnread = dataStorage.list_working_unread;
		}
		return listUnread;
	}
	checkOrder(state, brokerId) {
		switch (state) {
			case orderStateEnum.AMEND: case orderStateEnum.REJECT: case orderStateEnum.CANCEL:
			case orderStateEnum.PLACE: case orderStateEnum.TRIGGERED: case orderStateEnum.CANCELLED:
				if (!brokerId) return true;
				else return false;
			default: return false;
		}
	}
	renderHeader(data, index) {
		try {
			// const { data } = this.state;
			if (!data) return <View></View>;
			checkTradingHalt(data.symbol).then(snap => {
				const tradingHalt = snap ? snap.trading_halt : false;
				this.isMount && this.setState({ tradingHalt }, () => {
					logDevice('info', `Updated Halt of ${this.state.data.symbol}: ${tradingHalt}`)
				});
			});
			const orderId = getOrderIdByType(data);

			const exchange = data.trading_market || '--';
			const displayExchange = dataStorage.symbolEquity[data.symbol] && dataStorage.symbolEquity[data.symbol].display_exchange ? dataStorage.symbolEquity[data.symbol].display_exchange : (this.state.exchange || exchange)
			const symbolCurrency = dataStorage.symbolEquity[data.symbol] && dataStorage.symbolEquity[data.symbol].display_exchange ? dataStorage.symbolEquity[data.symbol].currency : ''
			const flagIcon = symbolCurrency ? Business.getFlagByCurrency(symbolCurrency) : Business.getFlagByExchange(this.getTradingMarket(data), displayExchange)

			const volume = formatNumber(data.volume);
			const listUnread = this.getListUnread();
			const check = listUnread[orderId];
			const displayName = getDisplayName(data.symbol);
			return (
				<TouchableOpacity
					onPress={() => {
						this.props.openSlider && this.props.openSlider(data)
					}}
					key={index}
				>
					<View testID={`orderCollapse-${orderId}`} style={[CommonStyle.headerBorder]}>
						{
							check && this.state.unread ? (
								<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#df0000', position: 'absolute', left: 4, top: 12, zIndex: 9999 }}></View>
							) : null
						}
						<View style={styles.headerContainer}>
							<View style={[{ width: '25%', backgroundColor: 'transparent', flexDirection: 'row' }]}>
								<Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text>
								<Text testID={`${orderId}SymbolValue`} style={CommonStyle.textSymbolName}>{(displayName + '').length > 8 ? Business.convertDisplayName(displayName) : `${displayName}`}</Text>
							</View>
							<View style={[{ width: '5%', alignItems: 'flex-end' }]}>
								<Flag
									type={'flat'}
									code={flagIcon}
									size={18}
								/>
							</View>
							{
								Platform.OS === 'ios'
									? <Text testID={`${orderId}SizeValue`} style={[styles.col2, CommonStyle.textSymbolName, { textAlign: 'right', backgroundColor: 'transparent', paddingLeft: 0 }]}>{volume}</Text>
									: <Text testID={`${orderId}SizeValue`} style={[styles.col2, CommonStyle.textMain2, { textAlign: 'right', backgroundColor: 'transparent' }]} >{volume}</Text>
							}
							<Text testID={`${orderId}LimitPriceValue`} style={[styles.col3, CommonStyle.textSymbolName, { textAlign: 'right' }]}>{data.limit_price ? formatNumberNew2(data.limit_price, PRICE_DECIMAL.PRICE) : '--'}</Text>
							<Text testID={`${orderId}FilledPriceValue`} style={[styles.col4, CommonStyle.textSymbolName, { textAlign: 'right' }]}>{data.avg_price ? formatNumberNew2(data.avg_price, PRICE_DECIMAL.PRICE) : '--'}</Text>
						</View>
						<View style={styles.headerContainer}>
							{
								this.checkOrder(data.order_status, orderId)
									? <View style={[styles.col1, { flexDirection: 'row' }]}>
										<Text testID={`${orderId}PrefixBS`} style={[CommonStyle.textSubNoColor, { width: '10%', color: '#df0000' }]}>!</Text>
										<Text testID={`${orderId}BS`} style={[CommonStyle.textSubNoColor, { width: '90%', color: data.is_buy ? '#00b800' : '#df0000' }]} numberOfLines={1}>{data.is_buy ? I18n.t('buyUpper', { locale: this.props.setting.lang }) : I18n.t('sellUpper', { locale: this.props.setting.lang })}</Text>
									</View> : <Text testID={`${orderId}BS`} style={[styles.col1, CommonStyle.textSubNoColor, { color: data.is_buy ? '#00b800' : '#df0000' }]} numberOfLines={1}>{data.is_buy ? I18n.t('buyUpper', { locale: this.props.setting.lang }) : I18n.t('sellUpper', { locale: this.props.setting.lang })}</Text>
							}
							<Text testID={`${orderId}FilledValue`} style={[styles.col2, CommonStyle.textVolume, { textAlign: 'right' }]}>{data.filled_quantity === null ? '0' : formatNumber(data.filled_quantity)}</Text>
							{
								this.props.typeFilter === 'Working'
									? <Text testID={`${orderId}StopPriceValue`} style={[styles.col3, CommonStyle.textVolume, { textAlign: 'right' }]}>{}</Text>
									: <Text testID={`${orderId}StopPriceValue`} style={[styles.col3, CommonStyle.textVolume, { textAlign: 'right' }]}>{data.stop_price ? formatNumberNew2(data.stop_price, PRICE_DECIMAL.PRICE) : '--'}</Text>
							}
							<Text testID={`${orderId}Duration`} style={[styles.col4, CommonStyle.textVolume, { textAlign: 'right' }]}>{this.getDuration(data)}</Text>
						</View>
					</View>
				</TouchableOpacity>
			);
		} catch (error) {
			console.log('renderHeader listContent logAndReport exception: ', error)
			logAndReport('renderHeader listContent exception', error, 'getIcon listContent');
		}
	}
	getDuration = (data) => {
		const duration = data.duration
		const expireDate = data.expire_date

		if (duration === Enum.DURATION_CODE.GTD) {
			if (!expireDate) return ''
			return moment(expireDate).format('DD/MM/YYYY')
		}
		return duration
	}
	registerChangeOrders(code, cb) {
		const { filterType } = this.props;
		if (!registerOrders[filterType]) registerOrders[filterType] = {};
		registerOrders[filterType][code] = cb;
	}
	renderContent() {
		const hasRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.VIEW_ORDERS_UNIVERSALSEARCH
		);

		const { filterType: type } = this.props;
		const isLogged = Controller.getLoginStatus();
		const { lang } = this.props.setting;

		const { listData } = this.props;
		const list = _.values(listData)
		if (!listData) return <View></View>
		if (isLogged && hasRole && !_.isEmpty(listData)) {
			return list.map((item, index) => this.renderHeader(item, index));
		}
		return (
			<View
				style={{
					height: 50,
					paddingHorizontal: 16,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				{<Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('noData')}</Text>}
			</View>
		);
	}

	render() {
		const { lang } = this.props.setting;
		return (
			<React.Fragment>
				<Header language={lang} />
				<LoadingComp isLoading={this.props.isLoading}>
					{this.renderContent()}
				</LoadingComp>
			</React.Fragment>
		);
	}
	componentDidMount() {
		// checkTradingHalt(this.state.data.symbol).then(snap => {
		// 	const tradingHalt = snap ? snap.trading_halt : false;
		// 	this.isMount && this.setState({ tradingHalt }, () => {
		// 		logDevice('info', `Updated Halt of ${this.state.data.symbol}: ${tradingHalt}`)
		// 	});
		// });
	}
}

const mapStateToProps = (state, ownProps) => {
	const { filterType } = ownProps;
	const { listOrderData } = state.searchOrder;
	const { listData, isLoading } = listOrderData[filterType];
	return {
		isLoading,
		listData,
		setting: state.setting,
		isConnected: state.app.isConnected,
		symbol: state.searchDetail.symbol,
		login: state.login
	};
};

const mapDispatchToProps = dispatch => ({
	resetData: (...p) => dispatch(OrderActions.resetStateListOrder(...p)),
	getSnapshot: (...p) => dispatch(OrderActions.loadDataOrders(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchOrderSliding);
