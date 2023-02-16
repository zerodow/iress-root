import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import ValueFormat from '~/component/ValueFormat/';
import PercentFormat from '~/component/PercentFormat/';
import I18n from '~/modules/language/';
import ENUM from '~/enum';
import {
	getAccActive,
	getPorfolioTypeByCode
} from '~s/portfolio/Model/PortfolioAccountModel';
import { useSelector } from 'react-redux';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import ProgressChart from '~s/orders/Component/ProgressChart';
import Animated from 'react-native-reanimated';

const { Value } = Animated;
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const HEIGHT = 238.5;
const VALUE_TYPE = {
	VALUE: 'value',
	PERCENT: 'percent'
};
const { PRICE_DECIMAL, PORTFOLIO_TYPE } = ENUM;
const Item = React.memo(
	({
		currencyCode,
		label,
		value,
		decimal = PRICE_DECIMAL.VALUE,
		type = VALUE_TYPE.VALUE,
		position = 'left',
		ignorePositiveNumber = false,
		hasPrefix = false
	}) => {
		const positionStyle =
			position === 'right'
				? 'flex-end'
				: position === 'center'
				? 'center'
				: 'flex-start';
		const valueProps = {
			value,
			decimal,
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font13,
				color: CommonStyle.fontColor
			}
		};
		return (
			<View style={{ alignItems: positionStyle }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{label}
				</Text>
				{type === VALUE_TYPE.VALUE ? (
					<ValueFormat
						currencyCode={currencyCode}
						{...valueProps}
						hasPrefix={hasPrefix}
						ignorePositiveNumber={ignorePositiveNumber}
					/>
				) : (
					<PercentFormat {...valueProps} iconStyle={{ opacity: 0 }} />
				)}
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { value: prevValue } = prevProps;
		const { value } = nextProps;
		const { currencyCode: preCurrencyCode } = prevProps;
		const { currencyCode: nextCurrencyCode } = nextProps;
		const isChange =
			prevValue !== value || preCurrencyCode !== nextCurrencyCode;
		return !isChange;
	}
);

const Left = ({ data, currency }) => {
	const {
		available_balance: availableBalance,
		free_equity: freeEquity,
		unsettled_buy: unsettledBuy,
		open_order: openOrder,
		total_market_value: totalMarketValue,
		yearly_dividend: annualDividend
	} = data;
	return (
		<View
			style={{
				width: '50%',
				borderRightWidth: 1,
				borderRightColor: CommonStyle.color.dusk_tabbar
			}}
		>
			<Item
				currencyCode={currency}
				label={I18n.t('availableBalances')}
				hasPrefix={true}
				ignorePositiveNumber={true}
				value={availableBalance}
			/>
			<View style={{ height: 16 }} />
			<Item
				currencyCode={currency}
				label={I18n.t('unsettledPurchases')}
				value={unsettledBuy}
			/>
			<View style={{ height: 8 }} />
			<Item
				currencyCode={currency}
				label={I18n.t('inMarketBuy')}
				value={openOrder}
			/>
			<View style={{ height: 8 }} />
			<Item
				currencyCode={currency}
				label={I18n.t('marketValue')}
				value={totalMarketValue}
				decimal={PRICE_DECIMAL.VALUE}
			/>
			<View style={{ height: 8 }} />
			<Item
				currencyCode={currency}
				label={I18n.t('annualDividend')}
				value={annualDividend}
			/>
		</View>
	);
};

const Right = ({ data, currency }) => {
	const {
		cash_balance: cashBalance,
		unsettled_sell: unsettledSell,
		sell_open_order: sellOpenOrder,
		total_cost_value: securitiesAtCost,
		yearly_dividend_percent: annualDividendPercent
	} = data;
	const position = 'right';
	return (
		<View
			style={{
				width: '50%',
				alignItems: 'flex-end'
			}}
		>
			<Item
				currencyCode={currency}
				position={position}
				label={I18n.t('startOfDayBalance')}
				value={cashBalance}
			/>
			<View style={{ height: 16 }} />
			<Item
				currencyCode={currency}
				position={position}
				label={I18n.t('unsettledSales')}
				value={unsettledSell}
			/>
			<View style={{ height: 8 }} />
			<Item
				currencyCode={currency}
				position={position}
				label={I18n.t('inMarketSell')}
				value={sellOpenOrder}
			/>
			<View style={{ height: 8 }} />
			<Item
				currencyCode={currency}
				position={position}
				label={I18n.t('costValue')}
				value={securitiesAtCost}
				hasPrefix
				ignorePositiveNumber
				decimal={PRICE_DECIMAL.VALUE}
			/>
			<View style={{ height: 8 }} />
			<Item
				currencyCode={currency}
				position={position}
				label={I18n.t('annualDividendPercent')}
				value={annualDividendPercent}
				type={VALUE_TYPE.PERCENT}
			/>
		</View>
	);
};

const InitialMargin = React.memo(
	({ data, currency }) => {
		const { total_initial_margin: initalMargin } = data;
		return (
			<View>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font11,
						opacity: 0.5
					}}
				>
					{I18n.t('initialMargin')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={initalMargin}
					decimal={PRICE_DECIMAL.VALUE}
					hasPrefix={false}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13
					}}
					currencyStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.fontTiny
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { total_initial_margin: prevTotalMargin } = prevProps.data || {};
		const { total_initial_margin: totalMargin } = nextProps.data || {};
		const isChange = prevTotalMargin !== totalMargin;
		return !isChange;
	}
);

const FreeEquity = React.memo(
	({ data }) => {
		const { free_equity: freeEquity, currency } = data;
		return (
			<View
				style={{
					alignItems: 'flex-start',
					flex: 1,
					borderRightWidth: 1,
					borderRightColor: CommonStyle.color.dusk_tabbar
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font11,
						opacity: 0.5
					}}
				>
					{I18n.t('freeEquityBalance')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={freeEquity}
					decimal={PRICE_DECIMAL.VALUE}
					ignorePositiveNumber={true}
					// hasPrefix={false}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13
					}}
					currencyStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.fontTiny
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { free_equity: prevFreeEquity } = prevProps.data || {};
		const { free_equity: freeEquity } = nextProps.data || {};
		const isChange = prevFreeEquity !== freeEquity;
		return !isChange;
	}
);
const SodBalance = React.memo(
	({ data, currency }) => {
		const { cash_balance: sodBalance } = data;
		return (
			<View style={{ flex: 1, alignItems: 'flex-end' }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font11,
						opacity: 0.5
					}}
				>
					{I18n.t('startOfDayBalance')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={sodBalance}
					decimal={PRICE_DECIMAL.VALUE}
					hasPrefix={false}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.font13
					}}
					currencyStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontColor,
						fontSize: CommonStyle.fontTiny
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { cash_balance: prevCashBalance } = prevProps.data || {};
		const { cash_balance: cashBalance } = nextProps.data || {};
		const isChange = prevCashBalance !== cashBalance;
		return !isChange;
	}
);

const ActiveChart = ({ marginPercent }) => {
	const percent = !marginPercent ? 0 : marginPercent / 100;
	if (!percent) return null;
	if (percent === 1)
		return (
			<View
				style={{
					width: percent * (DEVICE_WIDTH - 32 + 4),
					backgroundColor: CommonStyle.color.modify,
					borderRadius: 4,
					height: 8
				}}
			/>
		);
	return (
		<View
			style={[
				styles.trapeZoidLeft,
				{ width: percent * (DEVICE_WIDTH - 32 + 4) }
			]}
		/>
	);
};

const InactiveChart = ({ marginPercent }) => {
	const percent = !marginPercent ? 1 : 1 - marginPercent / 100;
	if (!percent) return null;
	if (percent === 1)
		return (
			<View
				style={{
					width: percent * (DEVICE_WIDTH - 32 + 4),
					backgroundColor: CommonStyle.color.dusk,
					borderRadius: 4,
					height: 8
				}}
			/>
		);
	return (
		<View
			style={[
				styles.trapeZoidRight,
				{ width: percent * (DEVICE_WIDTH - 32 + 4) }
			]}
		/>
	);
};
const Chart = ({ marginPercent }) => {
	const widthAnimated = useMemo(() => {
		return new Value(0);
	}, []);
	useEffect(() => {
		const percent =
			!marginPercent || marginPercent < 0
				? 0
				: marginPercent > 100
				? 1
				: marginPercent / 100;
		widthAnimated.setValue(percent * (DEVICE_WIDTH - 32));
	}, [marginPercent]);
	return (
		<ProgressChart
			widthAnimated={widthAnimated}
			maxWidth={DEVICE_WIDTH - 32}
			inProgressColor={CommonStyle.color.modify}
			outProgressColor={CommonStyle.color.dusk_tabbar}
			height={8}
		/>
	);
};
const NoteChart = ({ marginPercent }) => {
	const initialMarginUsed = !marginPercent
		? formatNumberNew2(0, PRICE_DECIMAL.PERCENT)
		: formatNumberNew2(marginPercent, PRICE_DECIMAL.PERCENT);
	return (
		<Text
			style={{
				marginTop: 4,
				textAlign: 'center',
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font11,
				color: CommonStyle.color.modify
			}}
		>
			{`${initialMarginUsed}% Initial Margin Used`}
		</Text>
	);
};

const InitialMarginChart = React.memo(
	({ data = {} }) => {
		const { initial_margin_used_percent: marginPercent } = data;
		return (
			<React.Fragment>
				<View
					style={{
						width: '100%',
						flexDirection: 'row',
						marginTop: 24
					}}
				>
					<Chart marginPercent={marginPercent} />
					{/* <InactiveChart marginPercent={50} /> */}
				</View>
				<NoteChart marginPercent={marginPercent} />
			</React.Fragment>
		);
	},
	(prevProps, nextProps) => {
		const { initial_margin_used_percent: prevMarginPercent } =
			prevProps.data || {};
		const { initial_margin_used_percent: marginPercent } =
			nextProps.data || {};
		const isChange = prevMarginPercent !== marginPercent;
		return !isChange;
	}
);

const CFDSummary = (props) => {
	return (
		<View style={{ width: '100%', justifyContent: 'center' }}>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				<InitialMargin {...props} />
			</View>
			<InitialMarginChart {...props} />
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					marginTop: 32
				}}
			>
				<FreeEquity {...props} />
				<SodBalance {...props} />
			</View>
		</View>
	);
};

const PortfolioFirstTab = () => {
	const [cacheCurrency, setCacheCurrency] = useState('');
	const accActive = getAccActive();
	const portfolioType = getPorfolioTypeByCode(accActive);
	const data = useSelector((state) => state.portfolio.data) || {};
	const { currency } = data || {};
	useEffect(() => {
		if (currency !== '') {
			setCacheCurrency(currency);
		}
	}, [accActive, currency]);

	return (
		<View
			style={{
				paddingVertical: 8,
				paddingHorizontal: 16,
				width: DEVICE_WIDTH,
				flexDirection: 'row'
			}}
		>
			{portfolioType === PORTFOLIO_TYPE.EQUITY ? (
				<React.Fragment>
					<Left data={data} currency={cacheCurrency} />
					<Right data={data} currency={cacheCurrency} />
				</React.Fragment>
			) : (
				<CFDSummary data={data} currency={cacheCurrency} />
			)}
		</View>
	);
};

const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		trapeZoidLeft: {
			zIndex: 99,
			width: 87,
			height: 0,
			borderBottomWidth: 8,
			borderBottomColor: CommonStyle.color.modify,
			borderLeftWidth: 12,
			borderLeftColor: 'transparent',
			borderRightWidth: 50,
			borderRightColor: CommonStyle.color.modify,
			borderStyle: 'solid',
			borderTopRightRadius: 4,
			borderBottomRightRadius: 4,
			transform: [{ rotate: '180deg' }]
		},
		trapeZoidRight: {
			zIndex: 99,
			width: 87,
			height: 0,
			borderBottomWidth: 8,
			borderBottomColor: CommonStyle.color.dusk_tabbar,
			borderLeftWidth: 12,
			borderLeftColor: 'transparent',
			borderRightWidth: 50,
			borderRightColor: CommonStyle.color.dusk_tabbar,
			borderStyle: 'solid',
			borderTopRightRadius: 4,
			borderBottomRightRadius: 4,
			left: -4
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

export default PortfolioFirstTab;
