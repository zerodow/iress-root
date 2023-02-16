// import I18n from 'react-native-i18n';
// import React, { Component } from 'react';
// import { View, Text } from 'react-native';
// import _ from 'lodash';
// import Icon from 'react-native-vector-icons/Ionicons';

// import XComponent from '../../component/xComponent/xComponent';
// import styles from './style/order';
// import Flashing from '../../component/flashing/flashing';
// import { formatNumber, formatNumberNew2 } from '../../lib/base/functionUtil';
// import Enum from '../../enum';

// const PTC_CHANNEL = Enum.PTC_CHANNEL;
// const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;

// // class Flashing extends InternalFlashing {
// // 	componentWillReceiveProps = nextProps => {
// // 		if (
// // 			this.props.value !== nextProps.value &&
// // 			!_.isNull(nextProps.value)
// // 		) {
// // 			this.value = nextProps.value;
// // 		}
// // 	};
// // }

// export default class LastTrade extends XComponent {
// 	state = {
// 		priceObject: {}
// 	};
// 	id = this.props.parentID;

// 	onParentCall({ type, data }) {
// 		if (type === PTC_CHANNEL.PRICE_OBJ) {
// 			if (!_.isEmpty(data)) {
// 				this.setState({
// 					priceObject: data
// 				});
// 			}
// 		}
// 	}

// 	showValue(isLoading, value, isFormat = true) {
// 		if (isLoading || value === null || value === undefined) {
// 			return '--';
// 		} else {
// 			return isFormat ? formatNumberNew2(value, 3) : value;
// 		}
// 	}

// 	renderText(textKey) {
// 		const { lang: locale } = this.props;
// 		return I18n.t(textKey, { locale });
// 	}

// 	getColor(changePoint) {
// 		if (changePoint > 0) return 'green';
// 		if (changePoint < 0) return 'red';
// 		return 'black';
// 	}

// 	renderIconChange(changePoint) {
// 		if (changePoint > 0) {
// 			return (
// 				<Icon
// 					name="md-arrow-dropup"
// 					style={[
// 						styles.iconPickerUp,
// 						{
// 							color: 'green',
// 							marginRight: 5
// 						}
// 					]}
// 				/>
// 			);
// 		}

// 		if (changePoint < 0) {
// 			return (
// 				<Icon
// 					name="md-arrow-dropdown"
// 					style={[
// 						styles.iconPickerDown,
// 						{
// 							color: 'red',
// 							marginRight: 2
// 						}
// 					]}
// 				/>
// 			);
// 		}

// 		return <View />;
// 	}

// 	renderLastTrade() {
// 		const { isLoading } = this.props;
// 		const {
// 			trade_size: tradeSize,
// 			trade_price: tradePrice
// 		} = this.state.priceObject;

// 		const key = `${this.renderText('lastTrade')}(${this.renderText(
// 			'quantity'
// 		)})`;

// 		const value = `(${this.showValue(isLoading, tradeSize, false)})`;
// 		return (
// 			<View style={styles.rowExpandWithBackground}>
// 				<View style={styles.rowOfValue}>
// 					<Text style={styles.textKey}>{key}</Text>

// 					<View style={{ flexDirection: 'row' }}>
// 						<Flashing
// 							value={tradePrice}
// 							parentID={this.id}
// 							field={PTC_CHANNEL.TRADE_PRICE}
// 							typeFormRealtime={
// 								TYPE_FORM_REALTIME.NEW_ORDER_TRADE_PRICE
// 							}
// 						/>
// 						<Text style={styles.textValue}>{value}</Text>
// 					</View>
// 				</View>
// 			</View>
// 		);
// 	}

// 	renderTodayChange() {
// 		const { isLoading } = this.props;
// 		const {
// 			trade_price: tradePrice,
// 			change_percent: changePercent,
// 			change_point: changePoint
// 		} = this.state.priceObject;
// 		const key = `${this.renderText('todayChange')}`;
// 		let value = '--';
// 		if (!isLoading && tradePrice) {
// 			value = formatNumberNew2(changePercent, 2);
// 		}
// 		value = `(${value}%)`;

// 		return (
// 			<View style={styles.rowExpandWithBackground}>
// 				<View style={styles.rowOfValue}>
// 					<Text style={styles.textKey}>{key}</Text>

// 					<View style={{ flexDirection: 'row' }}>
// 						{this.renderIconChange(changePoint)}
// 						<Text
// 							style={[
// 								styles.textValue,
// 								{ color: this.getColor(changePoint) }
// 							]}
// 						>
// 							{value}
// 						</Text>
// 					</View>
// 				</View>
// 			</View>
// 		);
// 	}

// 	renderBidVol() {
// 		const { isLoading } = this.props;
// 		const { bid_size } = this.state.priceObject;
// 		let value = '--';
// 		if (!isLoading && !_.isNull(bid_size)) {
// 			value = formatNumber(bid_size);
// 		}
// 		return (
// 			<View style={{ flex: 1 }}>
// 				<Text style={[styles.textKey, { marginBottom: 7 }]}>
// 					{this.renderText('bidVol')}
// 				</Text>
// 				<Text style={styles.textValue}>{value}</Text>
// 			</View>
// 		);
// 	}

// 	renderBidPrice() {
// 		const { isLoading } = this.props;
// 		const { bid_price: bidPrice } = this.state.priceObject;
// 		return (
// 			<View style={{ flex: 1 }}>
// 				<Text
// 					style={[
// 						styles.textKey,
// 						{
// 							marginBottom: 7,
// 							paddingLeft: 4
// 						}
// 					]}
// 				>
// 					{this.renderText('bidPrice')}
// 				</Text>
// 				<Flashing
// 					value={bidPrice}
// 					parentID={this.id}
// 					field={PTC_CHANNEL.BID_PRICE}
// 					typeFormRealtime={TYPE_FORM_REALTIME.NEW_ORDER_BID_PRICE}
// 				/>
// 			</View>
// 		);
// 	}

// 	renderOfferPrice() {
// 		const { isLoading } = this.props;
// 		const { ask_price: askPrice } = this.state.priceObject;
// 		return (
// 			<View style={{ flex: 1 }}>
// 				<Text
// 					style={[
// 						styles.textKey,
// 						{
// 							marginBottom: 7,
// 							textAlign: 'right',
// 							paddingRight: 4
// 						}
// 					]}
// 				>
// 					{this.renderText('offerPrice')}
// 				</Text>
// 				<Flashing
// 					value={askPrice}
// 					parentID={this.id}
// 					field={PTC_CHANNEL.ASK_PRICE}
// 					typeFormRealtime={TYPE_FORM_REALTIME.NEW_ORDER_TRADE_PRICE}
// 				/>
// 			</View>
// 		);
// 	}

// 	renderAskVol() {
// 		const { isLoading } = this.props;
// 		const { ask_size } = this.state.priceObject;
// 		let value = '--';
// 		if (!isLoading && !_.isNull(ask_size)) {
// 			value = formatNumber(ask_size);
// 		}
// 		return (
// 			<View style={{ flex: 1 }}>
// 				<Text
// 					style={[
// 						styles.textKey,
// 						{
// 							marginBottom: 7,
// 							textAlign: 'right'
// 						}
// 					]}
// 				>
// 					{this.renderText('askVol')}
// 				</Text>
// 				<Text style={[styles.textValue, { textAlign: 'right' }]}>
// 					{value}
// 				</Text>
// 			</View>
// 		);
// 	}

// 	render() {
// 		const { code } = this.props;

// 		if (!code) return <View />;
// 		return (
// 			<View style={styles.lastTradeContainer}>
// 				{this.renderLastTrade()}
// 				{this.renderTodayChange()}
// 				<View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
// 					{this.renderBidVol()}
// 					{this.renderBidPrice()}
// 					{this.renderOfferPrice()}
// 					{this.renderAskVol()}
// 				</View>
// 			</View>
// 		);
// 	}
// }
