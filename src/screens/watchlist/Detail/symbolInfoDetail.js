import React, { Component, useCallback, useRef } from 'react';
import { View, Text, Platform } from 'react-native';
import { connect, useSelector } from 'react-redux';
import _ from 'lodash';
import isEqual from 'react-fast-compare';

import * as Business from '~/business';
import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import * as FuncUtil from '~/lib/base/functionUtil';
import Icon, { objInfo } from '../Component/Icon2';
import NewAlertButton from './components/NewAlertButton';
import AddToWatchlist from './components/AddToWatchlist';
import { dataStorage } from '~/storage';
import PriceValue from '../Component/PriceValue';
import SymbolStatus from './SymbolStatus';
import MPRCInfo from './mprcInfo';
import NetworkWarning from '~/component/network_warning/network_warning_basic';
import * as Controller from '~/memory/controller';
import { CurrencyText } from '~/component/currency/';

import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import {
	DEFAULT_COLOR,
	UP_COLOR,
	DOWN_COLOR,
	NORMAL_COLOR
} from '../Component/Progressbar';

import PricePercent from '../Component/PricePercent';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const DelayedIcon = ({ changeAllowUnmount }) => {
	const dic = useRef({
		time: null
	});
	const { isPayPerview, isDelayed } = useSelector(
		(state) => ({
			isPayPerview: state.marketInfo.data.royalty_pay_per_view,
			isDelayed: state.marketInfo.data.price_delay_period
		}),
		isEqual
	);

	const result = [];
	const showDelayedMarketDataPopup = useCallback(() => {
		Platform.OS === 'android' &&
			changeAllowUnmount &&
			changeAllowUnmount(false);
		Controller.showDelayedMarketDataPopup(dic.current.time);
	}, []);

	if (isDelayed) {
		dic.current.time = new Date();
		result.push(
			<CommonStyle.icons.delayed
				color={CommonStyle.colorProduct}
				onPress={showDelayedMarketDataPopup}
				style={{ paddingLeft: 10, top: 2 }}
				color={CommonStyle.colorProduct}
			/>
		);
	}

	if (isPayPerview) {
		dic.current.time = new Date();
		result.push(
			<Icon
				name="payPerview"
				size={20}
				color={CommonStyle.colorProduct}
				style={{ paddingLeft: 10, top: 1 }}
			/>
		);
	}
	return result;
};

export class SymbolInfoDetail extends Component {
	renderHaltIcon() {
		const { symbol, exchange } = this.props;
		const key = `${symbol}#${exchange}`;
		const { trading_halt: istradingHalt } =
			dataStorage.symbolEquity[key] || {};

		if (!istradingHalt) return null;

		return (
			<Icon
				name="tradingHaltTag"
				color={CommonStyle.fontShadowRed}
				size={16}
				style={{ paddingRight: 8 }}
			/>
		);
	}
	handleShowAddWl = this.handleShowAddWl.bind(this);
	handleShowAddWl() {
		const { symbol, exchange, showAddToWl } = this.props;
		showAddToWl && showAddToWl({ symbol, exchange });
	}
	renderFirstLeft() {
		const { symbol, exchange, isErrorSystem, changeAllowUnmount } =
			this.props;
		let symbolName = Business.getDisplayName({ symbol, exchange });
		if (!symbol || !exchange) symbolName = '--';

		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				{this.renderHaltIcon()}
				<ViewLoading
					isLoading={isErrorSystem}
					childrenStyle={{ flexDirection: 'row' }}
				>
					<Text
						style={{
							fontFamily: CommonStyle.fontPoppinsBold,
							fontSize: CommonStyle.font15,
							color: CommonStyle.fontColor
						}}
						numberOfLines={1}
					>
						{symbolName}
					</Text>
					<DelayedIcon changeAllowUnmount={changeAllowUnmount} />
					{/* <CurrencyText
						symbol={symbol}
						exchange={exchange}
						style={{ marginLeft: 8 }} /> */}
				</ViewLoading>
			</View>
		);
	}

	renderFirstRight() {
		const { navigator, symbol, exchange } = this.props;

		return (
			<View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
				<AddToWatchlist onPress={this.handleShowAddWl} />

				<NewAlertButton
					navigator={navigator}
					exchange={exchange}
					symbol={symbol}
				/>
			</View>
		);
	}

	renderFirstRow() {
		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingBottom: 4
				}}
			>
				{this.renderFirstLeft()}

				{this.renderFirstRight()}
			</View>
		);
	}

	renderPrice(tradePrice) {
		const { symbol, exchange } = this.props;

		return (
			<PriceValue
				resetFlag={symbol + exchange}
				style={{
					fontFamily: CommonStyle.fontPoppinsMedium,
					fontSize: CommonStyle.font21,
					color: CommonStyle.fontWhite
				}}
				value={tradePrice}
				symbol={symbol}
				exchange={exchange}
			/>
		);
	}

	renderChange(changePoint, changePercent) {
		let color = DEFAULT_COLOR;
		const { symbol, exchange } = this.props;
		// const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange })
		const decimal = getDecimalPriceBySymbolExchange({ symbol, exchange });
		let showValue = FuncUtil.formatNumberPrice(changePoint, decimal);
		if (changePoint || changePoint === 0) {
			if (changePoint === 0) {
				color = NORMAL_COLOR;
			} else if (+changePoint > 0) {
				color = CommonStyle.fontOceanGreen;
				showValue = '+' + showValue;
			} else {
				color = CommonStyle.fontNewRed;
			}
		}

		return (
			<View style={{ flexDirection: 'row' }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font13,
						color
					}}
				>
					{`${showValue} `}
				</Text>
				<PricePercent
					value={changePercent}
					colorFlag={changePoint}
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font13
					}}
				/>
			</View>
		);
	}

	renderSymbolStatus(isMPRC) {
		const { exchange, isErrorSystem } = this.props;
		return (
			<SymbolStatus
				isErrorSystem={isErrorSystem}
				exchange={exchange}
				isMPRC={isMPRC}
			/>
		);
	}
	renderAllPrice() {
		const { symbol, exchange, quote, isErrorSystem } = this.props;
		const {
			trade_price: tradePrice,
			change_point: changePoint,
			change_percent: changePercent,
			match_pct_movement: mprc
		} = quote || {};
		if (isErrorSystem) {
			return (
				<React.Fragment>
					<TextLoading
						style={{
							fontFamily: CommonStyle.fontPoppinsMedium,
							fontSize: CommonStyle.font21,
							color: CommonStyle.fontWhite
						}}
						isLoading={true}
					>
						00.00
					</TextLoading>
					<View style={{ height: 4 }} />
					<TextLoading
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.font13
						}}
						isLoading={true}
					>
						00.00
					</TextLoading>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				{this.renderPrice(tradePrice)}
				{/* {this.renderChange(changePoint, changePercent)} */}
			</React.Fragment>
		);
	}
	renderSecondRow() {
		const { symbol, exchange, quote } = this.props;
		const {
			trade_price: tradePrice,
			change_point: changePoint,
			change_percent: changePercent,
			match_pct_movement: mprc
		} = quote || {};

		const isMPRC = !_.isNil(mprc);

		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				<View>
					{this.renderAllPrice()}
					<MPRCInfo
						exchange={exchange}
						mprc={mprc}
						symbol={symbol}
						changePoint={changePoint}
						changePercent={changePercent}
					/>
				</View>

				{this.renderSymbolStatus(isMPRC)}
			</View>
		);
	}

	renderPanel() {
		const {
			symbol,
			exchange,
			isPanel,
			quote,
			isShowDetail = true
		} = this.props;

		const {
			trade_price: tradePrice,
			change_point: changePoint,
			change_percent: changePercent,
			match_pct_movement: mprc
		} = quote || {};

		const isMPRC = !_.isNil(mprc);

		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				<View>
					{this.renderPrice(tradePrice)}
					{/* {this.renderChange(changePoint, changePercent)} */}
					<MPRCInfo
						exchange={exchange}
						mprc={mprc}
						symbol={symbol}
						changePoint={changePoint}
						changePercent={changePercent}
					/>
				</View>
				{isShowDetail && (
					<View>
						{this.renderFirstRight()}
						<SymbolStatus
							isPanel={isPanel}
							exchange={exchange}
							isMPRC={isMPRC}
						/>
					</View>
				)}
			</View>
		);
	}

	render() {
		const { isShowConnecting = true } = this.props;

		if (!this.props.isPanel) {
			// this.renderFirstRight()
			return (
				<View>
					{isShowConnecting && <NetworkWarning />}
					<View
						style={{
							paddingHorizontal: 16,
							paddingVertical: 8,
							backgroundColor: CommonStyle.color.dark
						}}
					>
						{this.renderPanel()}
					</View>
				</View>
			);
		}
		return (
			<View>
				{isShowConnecting && <NetworkWarning />}
				<View
					style={{
						paddingHorizontal: 16,
						paddingVertical: 8,
						backgroundColor: CommonStyle.color.dark
					}}
				>
					{this.renderFirstRow()}
					{this.renderSecondRow()}
				</View>
			</View>
		);
	}
}

const mapStateToProps = (state, { symbol, exchange }) => ({
	quote: state.quotes.data[symbol + '#' + exchange],
	isErrorSystem: state.errorSystem.isLoadingErrorSystem
});

export default connect(mapStateToProps)(SymbolInfoDetail);
