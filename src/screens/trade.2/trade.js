import * as Emitter from '@lib/vietnam-emitter';
import React, { PureComponent } from 'react';
import { View, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { func } from '../../storage';
import {
	getExchange,
	formatNumberNew2,
	logAndReport,
	logDevice
} from '../../lib/base/functionUtil';
import * as Business from '../../business';
import * as Controller from '../../memory/controller';
import * as PureFunc from '~/utils/pure_func';
import AuthenPin from '../../component/authen_pin/authen_pin';
import CommonStyle from '~/theme/theme_controller';
import Enum from '../../enum';
import NetworkWarningRealtime from '../../component/network_warning/network_realtime_warning';
import Price from './price';
import TradeList from './TradeList.1';
import {
	Header,
	Time,
	DelayWarning,
	VerifyMail,
	Loading
} from './trade_component';
import { showNewOrderModal } from '~/navigation/controller.1';
import HandleDataComp from './trade_handleData';
import TradeActions from './trade.reducer';

const SIDE = Enum.SIDE;

class Trade extends PureComponent {
	constructor(props) {
		super(props);
		this.dic = {};
		this.state = {
			isLoadingForm: true
		};
		this.setState = this.setState.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.resetExpand = this.resetExpand.bind(this);
		this.getAllowRender = this.getAllowRender.bind(this);
		this.switchToNewOrderScreen = this.switchToNewOrderScreen.bind(this);
		this.manualReCalculateVisibleRows = this.manualReCalculateVisibleRows.bind(
			this
		);
	}

	//	#region BUSINESS

	moveToDefaultNewOrder() {
		const { navigator } = this.props;
		showNewOrderModal({
			navigator,
			passProps: {
				code: '',
				volume: 0,
				stopPrice: 0,
				limitPrice: 0,
				exchanges: [],
				isDefault: true,
				changePercent: 0,
				isNotShowMenu: true
			}
		});
	}

	switchToNewOrderScreen() {
		try {
			const { placingOrderObject } = this.dic;
			if (!placingOrderObject) {
				this.moveToDefaultNewOrder();
				return;
			}
			if (!Controller.getLoginStatus()) return;

			const {
				side,
				value: {
					symbol = '',
					exchange = '',
					change_percent: changePercent,
					ask_price: askPrice = 0,
					bid_price: bidPrice = 0,
					trade_price: tradePrice = 0
				} = {}
			} = PureFunc.clone(placingOrderObject);

			this.dic.placingOrderObject = null;
			func.setBackNewOrderStatus(false);

			const isBuy = side === SIDE.BUY;
			const exchanges = func.getExchangeSymbol(symbol);
			const isParitech = Business.isParitech(symbol);
			const curChangePercent = changePercent
				? formatNumberNew2(changePercent)
				: 0;
			const curTradePrice = tradePrice
				? formatNumberNew2(tradePrice)
				: null;
			const limitPrice = isBuy ? askPrice : bidPrice;

			const { navigator } = this.props;
			showNewOrderModal({
				navigator,
				passProps: {
					displayName: symbol,
					isBuy,
					code: symbol,
					exchange,
					isParitech,
					changePercent: curChangePercent,
					tradePrice: curTradePrice,
					exchanges: getExchange(exchanges),
					limitPrice,
					stopPrice: tradePrice,
					volume: 0,
					isNotShowMenu: true
				}
			});
		} catch (error) {
			logDevice('info', 'onOrder price exception');
			logAndReport('onOrder price exception', error, 'onOrder price');
			console.catch(error);
		}
	}
	//	#endregion

	//	#region RENDER
	manualReCalculateVisibleRows() {
		if (!this.dic.listViewRef || !this.dic.listViewRef.scrollProperties) {
			return;
		}
		const currentPosition = this.dic.listViewRef.scrollProperties.offset;
		this.dic.listViewRef.scrollTo({
			y: currentPosition === 0 ? currentPosition + 1 : currentPosition - 1
		});
	}

	onChangeVisibleRows(visibleRows, changedRows) {
		try {
			const isValid = visibleRows && changedRows;

			if (isValid) {
				this.dic.visibleRows = visibleRows;
				Emitter.emit(this.dic.channelAllowRender, changedRows);
			}
		} catch (error) {
			console.catch(error);
		}
	}

	getAllowRender(indexInList) {
		return this.dic.visibleRows[indexInList] === true;
	}

	renderRow(rowData, rowID) {
		try {
			const symbol = rowData.symbol;
			// const ExpandComponent =
			// 	this.dic.listPriceObject.length >= 100
			// 		? PureCollapsible
			// 		: RnCollapsible;
			const allowRenderInfo = {
				channelAllowRender: this.dic.channelAllowRender,
				fnGetAllowRender: this.getAllowRender
			};
			// const expandInfo = {
			// 	channelExpandingChange: this.dic.channelExpandingChange
			// };
			const loadingInfo = {
				isLoading: this.dic.isLoadingPrice,
				channelLoading: this.dic.channelLoading
			};

			return (
				<React.Fragment key={symbol}>
					<Price
						data={rowData}
						indexInList={rowID}
						// expandInfo={expandInfo}
						// autoControlExpand={true}
						loadingInfo={loadingInfo}
						navigator={this.props.navigator}
						allowRenderInfo={allowRenderInfo}
						// expandComponent={ExpandComponent}
						channelPlaceOrder={this.dic.channelPlaceOrder}
						isNewsToday={this.dic.dicNewsToday[symbol] || false}
						manualReCalculateVisibleRows={
							this.manualReCalculateVisibleRows
						}
					/>
					<View style={CommonStyle.borderBelow} />
				</React.Fragment>
			);
		} catch (error) {
			console.catch(error);
			return <View />;
		}
	}

	renderTradeList() {
		if (_.isEmpty(this.dic.listPriceObject)) return null;
		return (
			<TradeList
				listPriceObject={this.dic.listPriceObject}
				renderRow={this.renderRow}
				renderFooter={() => <View style={{ height: CommonStyle.heightTabbar }} />}
			/>
		);
	}

	renderContent() {
		if (this.state.isLoadingForm) {
			return <Loading />;
		}
		try {
			return (
				<React.Fragment>
					<VerifyMail
						navigator={this.props.navigator}
						lang={this.props.setting.lang}
					/>
					<DelayWarning />
					<Time onRef={sef => (this.dic.timeUpdatedRef = sef)} />
					<Header />
					{this.renderTradeList()}
					<AuthenPin
						showQuickButton={true}
						navigator={this.props.navigator}
						onAuthSuccess={this.switchToNewOrderScreen}
						channelRequestCheckAuthen={
							this.dic.channelRequestCheckAuthen
						}
					/>
				</React.Fragment>
			);
		} catch (error) {
			console.catch(error);
			return null;
		}
	}

	resetExpand() {
		this.props.setExpandIndex && this.props.setExpandIndex(-1);
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
				<HandleDataComp
					setDic={childDic => (this.dic = childDic)}
					dic={this.dic}
					navigator={this.props.navigator}
					navigatorID={this.props.navigatorID}
					isConnected={this.props.isConnected}
					setStateParent={(...p) => {
						!_.isEmpty(p)
							? this.setState(...p)
							: this.forceUpdate();
					}}
					resetExpand={this.resetExpand}
				/>
				<NetworkWarningRealtime />
				{this.renderContent()}
			</View>
		);
	}
	//	#endregion
}

function mapStateToProps(state) {
	return {
		setting: state.setting
	};
}

const mapDispatchToProps = dispatch => ({
	setExpandIndex: (...p) => dispatch(TradeActions.setExpandIndex(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Trade);
