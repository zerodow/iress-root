import React, { Component } from 'react';
import { Animated, Dimensions } from 'react-native';
import AuthenPin from '~/component/authen_pin/authen_pin';
import * as Controller from '~/memory/controller';
import { func } from '~/storage';
import * as Business from '~/business';
import * as Emitter from '@lib/vietnam-emitter';
import {
	getExchange,
	formatNumberNew2,
	logAndReport,
	logDevice
} from '~/lib/base/functionUtil';
import { showNewOrderModal } from '~/navigation/controller.1';
import * as Channel from '~/streaming/channel';
import SCREEN from './screenEnum';

const { width: WIDTH_DEVICE } = Dimensions.get('window');

export default class WatchListAuth extends Component {
	constructor(props) {
		super(props);
		this.scrollValue = this.props.scrollValue || new Animated.Value(0);
		this.channelAuth = Channel.getChannelRequestCheckAuthen(
			'authWatchList'
		);
	}

	switchToNewOrderScreen = this.switchToNewOrderScreen.bind(this);
	switchToNewOrderScreen() {
		try {
			if (!Controller.getLoginStatus()) return;
			const {
				symbol = '',
				exchange = '',
				change_percent: changePercent,
				ask_price: askPrice = 0,
				bid_price: bidPrice = 0,
				trade_price: tradePrice = 0
			} = this.value || {};
			const exchanges = func.getExchangeSymbol(symbol);
			const isParitech = Business.isParitech(symbol);
			const curChangePercent = changePercent
				? formatNumberNew2(changePercent)
				: 0;
			const curTradePrice = tradePrice
				? formatNumberNew2(tradePrice)
				: null;
			const limitPrice = this.isBuy ? askPrice : bidPrice;
			const { navigator } = this.props;
			showNewOrderModal({
				navigator,
				passProps: {
					displayName: symbol,
					isBuy: this.isBuy,
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
			this.isBuy = undefined;
			this.value = undefined;
		} catch (error) {
			logDevice('info', 'onOrder price exception');
			logAndReport('onOrder price exception', error, 'onOrder price');
			console.catch(error);
		}
	}

	onAuth = this.onAuth.bind(this);
	onAuth(isBuy, value) {
		this.isBuy = isBuy;
		this.value = value;
		Emitter.emit(this.channelAuth);
	}

	render() {
		const { screenSelected, navigator } = this.props;
		return (
			<Animated.View
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					transform: [
						{
							translateX: this.scrollValue.interpolate({
								inputRange: [-1, 0, 1],
								outputRange: [WIDTH_DEVICE, 0, WIDTH_DEVICE]
							})
						}
					]
				}}
				pointerEvents="box-none"
			>
				<AuthenPin
					showQuickButton={screenSelected === SCREEN.WATCHLIST}
					navigator={navigator}
					onAuthSuccess={this.switchToNewOrderScreen}
					channelRequestCheckAuthen={this.channelAuth}
				/>
			</Animated.View>
		);
	}
}
