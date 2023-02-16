import React, { useImperativeHandle, useState, forwardRef } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity
	// LayoutAnimation,
	// Platform,
	// UIManager
} from 'react-native';
import Enum from '~/enum';
import Icon from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import { useSelector, shallowEqual } from 'react-redux';

import { useShadow } from '~/component/shadow/SvgShadow';
import { useShadow as useShadowTop } from '~/component/shadow/SvgShadowCustom';

import * as FunctionUtil from '~/lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import * as Business from '~/business';
import isEqual from 'react-fast-compare';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import { getCurrencyByCode } from '~/component/currency/Controller';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
// if (Platform.OS === 'android') {
//     if (UIManager.setLayoutAnimationEnabledExperimental) {
//         UIManager.setLayoutAnimationEnabledExperimental(true);
//     }
// }

const Row = ({ name, value }) => {
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	return (
		<React.Fragment key={name}>
			<Text
				style={[
					CommonStyle.textAlert,
					{ fontSize: CommonStyle.font11 }
				]}
			>
				{name}
			</Text>
			<TextLoading
				isLoading={isLoadingErrorSystem}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite,
					paddingBottom: 8
				}}
			>
				{_.isNil(value) ? '--' : value}
			</TextLoading>
		</React.Fragment>
	);
};

const MarketCap = ({ symbol, exchange }) => {
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const key = `${symbol}#${exchange}`;
	const symbolInfo = useSelector(
		(state) => state.marketInfo.symbolInfo,
		isEqual
	);
	const { marketCap: marketCapSymbol } = symbolInfo[key] || {};
	const marketCapLocal = Business.getMarketCapBySymbolExchange({
		symbol,
		exchange
	});
	const currencyCode = Business.getCurrencyBySymbolExchange({
		symbol,
		exchange
	});
	const marketCap = marketCapSymbol || marketCapLocal;
	const currency = getCurrencyByCode({ currencyCode });
	// const currency = '$'
	const name = I18n.t('Market_Cap');
	return (
		<React.Fragment key={name}>
			<Text
				style={[
					CommonStyle.textAlert,
					{ fontSize: CommonStyle.font11 }
				]}
			>
				{name}
			</Text>
			<TextLoading
				isLoading={isLoadingErrorSystem}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite,
					paddingBottom: 8
				}}
			>
				{(marketCap !== null) & (marketCap !== undefined)
					? `${currency}${FunctionUtil.formatNumberNew2(
							marketCap,
							Enum.PRICE_DECIMAL.VALUE
					  )}`
					: '--'}
			</TextLoading>
		</React.Fragment>
	);
};

const PERatio = ({ symbol, exchange }) => {
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const key = `${symbol}#${exchange}`;
	const symbolInfo = useSelector(
		(state) => state.marketInfo.symbolInfo,
		isEqual
	);
	const { peRatio } = symbolInfo[key] || {};
	const peRatioLocal = Business.getPERatioBySymbolExchange({
		symbol,
		exchange
	});
	const pe = peRatio || peRatioLocal;
	const name = I18n.t('pe_ratio');

	let titleValue = '';
	if (pe === null || pe === undefined || pe === '--') {
		titleValue = '--';
	} else {
		titleValue =
			FunctionUtil.formatNumberNew2(pe, Enum.PRICE_DECIMAL.VALUE) + 'x';
	}

	return (
		<React.Fragment key={name}>
			<Text
				style={[
					CommonStyle.textAlert,
					{ fontSize: CommonStyle.font11 }
				]}
			>
				{name}
			</Text>
			<TextLoading
				isLoading={isLoadingErrorSystem}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite,
					paddingBottom: 8
				}}
			>
				{titleValue}
			</TextLoading>
		</React.Fragment>
	);
};

const YearlyDividend = ({ symbol, exchange }) => {
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const key = `${symbol}#${exchange}`;
	const symbolInfo = useSelector(
		(state) => state.marketInfo.symbolInfo,
		isEqual
	);
	const { yearlyDividend } = symbolInfo[key] || {};
	const yearlyDividendLocal = Business.getYearlyDividendBySymbolExchange({
		symbol,
		exchange
	});
	const name = I18n.t('Dividend_History');
	return (
		<React.Fragment key={name}>
			<Text
				style={[
					CommonStyle.textAlert,
					{ fontSize: CommonStyle.font11 }
				]}
			>
				{name}
			</Text>
			<TextLoading
				isLoading={isLoadingErrorSystem}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontWhite,
					paddingBottom: 8
				}}
			>
				{FunctionUtil.formatNumberNew2(
					yearlyDividend || yearlyDividendLocal,
					Enum.PRICE_DECIMAL.VALUE
				)}
			</TextLoading>
		</React.Fragment>
	);
};

const Column = ({ isLeft, isRight, children }) => {
	let alignItems = 'center';
	if (isLeft) {
		alignItems = 'flex-start';
	}
	if (isRight) {
		alignItems = 'flex-end';
	}

	return (
		<View
			style={{
				flex: 1,
				alignItems,
				paddingLeft: isRight ? 8 : 0,
				paddingRight: isLeft ? 8 : 0
			}}
		>
			{children}
		</View>
	);
};

const MoreButton = ({ isFull, onPress }) => {
	return (
		<TouchableOpacity
			style={{ paddingTop: !isFull ? 4 : 0 }}
			onPress={() => {
				// LayoutAnimation.easeInEaseOut();
				onPress && onPress((p) => !p);
			}}
		>
			<View
				style={{
					alignItems: 'center'
				}}
			>
				{!isFull && (
					<Text
						style={[
							CommonStyle.textAlert,
							{ fontSize: CommonStyle.font10 }
						]}
					>
						{I18n.t('More_Security_Info')}
					</Text>
				)}
				<Icon
					style={{ transform: [{ scaleX: 1.5 }] }}
					name={isFull ? 'ios-arrow-up' : 'ios-arrow-down'}
					size={20}
					color={CommonStyle.fontNearLight6}
				/>
			</View>
		</TouchableOpacity>
	);
};

const formatRange = (from, to, decimal) => {
	if (_.isNil(from) || _.isNil(to)) return '--';
	return (
		FunctionUtil.formatNumberPrice(from, decimal) +
		' - ' +
		FunctionUtil.formatNumberPrice(to, decimal)
	);
};

let TradeInfo = ({ symbol, exchange, isShowMoreButton = true }, ref) => {
	const [fullInfo, changeFullInfo] = useState(false);

	useImperativeHandle(ref, () => ({
		reset: () => changeFullInfo(false)
	}));

	const quote = useSelector(
		(state) => state.quotes.data[symbol + '#' + exchange] || {},
		isEqual
	);

	const [ShadowView, onLayout] = useShadow();
	const [ShadowTop, onLayout2] = useShadowTop();
	const currencyCode = Business.getCurrencyBySymbolExchange({
		symbol,
		exchange
	});
	const currency = getCurrencyByCode({ currencyCode });
	// const currency = '$'
	const decimal = getDecimalPriceBySymbolExchange({
		symbol,
		exchange
	});
	if (fullInfo) {
		return (
			<View style={{ backgroundColor: CommonStyle.color.dark }}>
				<ShadowTop />

				<View
					style={{
						paddingTop: 8,
						paddingHorizontal: 16,
						flexDirection: 'row',
						backgroundColor: CommonStyle.color.dark,
						zIndex: 9999
					}}
					onLayout={(e) => {
						e.nativeEvent.layout.height =
							e.nativeEvent.layout.height - 16;
						onLayout2(e);
					}}
				>
					<Column isLeft>
						<Row
							name={I18n.t('open')}
							value={FunctionUtil.formatNumberPrice(quote.open, decimal)}
						/>
						{/* <Row name={I18n.t('Week_Range')} /> */}
						<Row
							name={I18n.t('todayVolume')}
							value={FunctionUtil.formatNumberNew2(
								quote.volume,
								0
							)}
						/>
						<Row
							name={I18n.t('todayValue')}
							value={
								quote.value_traded !== null &&
								quote.value_traded !== undefined
									? currency +
									  FunctionUtil.formatNumberNew2(
											quote.value_traded,
											2
									  )
									: '--'
							}
						/>
						<Row
							name={I18n.t('market_VWAP')}
							value={FunctionUtil.formatNumberNew2(
								quote.market_vwap,
								Enum.PRICE_DECIMAL.VALUE,
								null,
								false
							)}
						/>
					</Column>

					<Column>
						<Row
							name={I18n.t('Days_Range')}
							value={formatRange(quote.low, quote.high, decimal)}
						/>
						{/* <Row name={I18n.t('Month_Range')} /> */}
						<Row
							name={I18n.t('securityDetailTotalVolume')}
							value={FunctionUtil.formatNumberNew2(
								quote.total_volume,
								0
							)}
						/>
						<Row
							name={I18n.t('securityDetailTotalValue')}
							value={
								quote.total_value !== null &&
								quote.total_value !== undefined
									? currency +
									  FunctionUtil.formatNumberNew2(
											quote.total_value,
											2
									  )
									: '--'
							}
						/>
						<Row
							name={I18n.t('securityDetailTotalVwap')}
							value={FunctionUtil.formatNumberNew2(
								quote.total_vwap,
								Enum.PRICE_DECIMAL.VALUE,
								null,
								false
							)}
						/>
					</Column>

					<Column isRight>
						<Row
							name={I18n.t('previousClose')}
							value={FunctionUtil.formatNumberPrice(quote.previous_close, decimal)}
						/>
						{/* <Row name={'52-' + I18n.t('Week_Range')} /> */}
						<MarketCap symbol={symbol} exchange={exchange} />
						<PERatio symbol={symbol} exchange={exchange} />
						<YearlyDividend symbol={symbol} exchange={exchange} />
					</Column>
				</View>
				{/* <View style={{ width: '100%', height: 1, backgroundColor: CommonStyle.color.dusk }} /> */}
				<View
					style={{
						width: '100%',
						height: 1,
						backgroundColor: '#3A425E'
					}}
				/>

				{isShowMoreButton && (
					<MoreButton isFull={fullInfo} onPress={changeFullInfo} />
				)}
			</View>
		);
	} else {
		return (
			<View>
				<ShadowTop />
				<View
					onLayout={onLayout2}
					style={{
						backgroundColor: CommonStyle.color.dark,
						zIndex: 9999
					}}
				>
					<ShadowView isOnTop />
					<View
						style={{
							paddingTop: 8,
							paddingHorizontal: 16,
							flexDirection: 'row'
						}}
						onLayout={onLayout}
					>
						<Column isLeft>
							<Row
								name={I18n.t('open')}
								value={FunctionUtil.formatNumberPrice(quote.open, decimal)}
							/>
						</Column>
						<Column>
							<Row
								name={I18n.t('Days_Range')}
								value={formatRange(
									quote.low,
									quote.high,
									decimal
								)}
							/>
						</Column>
						<Column isRight>
							<Row
								name={I18n.t('previousClose')}
								value={FunctionUtil.formatNumberPrice(quote.previous_close, decimal)}
							/>
						</Column>
					</View>
					{/* <ShadowView style={{ marginTop: 5 }} /> */}

					{isShowMoreButton && (
						<MoreButton
							isFull={fullInfo}
							onPress={changeFullInfo}
						/>
					)}
				</View>
			</View>
		);
	}
};

TradeInfo = forwardRef(TradeInfo);
export default TradeInfo;

const styles = StyleSheet.create({});
