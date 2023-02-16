import React from 'react';
import { View, Text } from 'react-native';
import I18n from '~/modules/language/';
import CommonStyle from '~/theme/theme_controller';
import ValueFormat from '~/component/ValueFormat';
import PercentFormat from '~/component/PercentFormat';
import ENUM from '~/enum';
import { useShadow } from '~/component/shadow/SvgShadowCustom';
import { useMarketValueByPortfolioType } from '~s/portfolio/Hook/';
import { getDecimalPriceBySymbolExchange } from '~/screens/new_order/Controller/InputController.js';
const { PRICE_DECIMAL, PORTFOLIO_TYPE } = ENUM;
const VALUE_TYPE = {
	VALUE: 'value',
	PERCENT: 'percent'
};

const MarketValOrIM = React.memo(
	({ currency, marketValue, symbol, exchange }) => {
		const decimal = 2;
		return (
			<ValueFormat
				currencyCode={currency}
				value={marketValue}
				ignorePositiveNumber
				decimal={decimal}
				textStyle={{
					color: CommonStyle.fontColor,
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.font21
				}}
				currencyStyle={{
					color: CommonStyle.fontColor,
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.font17
				}}
			/>
		);
	},
	(prevProps, nextProps) => {
		const { marketValue: prevMarketValue } = prevProps;
		const { marketValue } = nextProps;
		const { currency } = nextProps;
		const { currency: prevcurrency } = prevProps;
		const isChange =
			prevMarketValue !== marketValue || currency !== prevcurrency;
		return !isChange;
	}
);

const TotalPL = React.memo(
	({ data }) => {
		const {
			currency_by_account: currency,
			total_profit_amount: totalProfitAmount,
			total_profit_amount_percent: totalProfitPercent
		} = data;
		return (
			<View>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor,
						opacity: 0.5
					}}
				>
					{I18n.t('totalPL')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={totalProfitAmount}
					decimal={PRICE_DECIMAL.VALUE}
					textStyle={{ fontFamily: CommonStyle.fontPoppinsBold }}
				/>
				<PercentFormat value={totalProfitPercent} />
			</View>
		);
	},
	(prevProps, nextProps) => {
		const {
			total_profit_amount: prevTotalProfitAmount,
			total_profit_percent: prevTotalProfitPercent,
			currency_by_account: prevCurrency
		} = prevProps.data || {};
		const {
			total_profit_amount: totalProfitAmount,
			total_profit_percent: totalProfitPercent,
			currency_by_account: currency
		} = nextProps.data || {};
		const isChange =
			prevTotalProfitAmount !== totalProfitAmount ||
			prevTotalProfitPercent !== totalProfitPercent ||
			prevCurrency !== currency;
		return !isChange;
	}
);

const RealisedPL = React.memo(
	({ data }) => {
		const { currency_by_account: currency } = data;
		const realizePL = data.realized_pnl ? data.realized_pnl : null;
		const realizePLPercent = data.realized_pnl_percent
			? data.realized_pnl_percent
			: null;
		return (
			<View style={{ alignItems: 'center' }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor,
						opacity: 0.5
					}}
				>
					{I18n.t('realisedPL')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={realizePL}
					decimal={PRICE_DECIMAL.VALUE}
					textStyle={{ fontFamily: CommonStyle.fontPoppinsBold }}
				/>
				<PercentFormat value={realizePLPercent} />
			</View>
		);
	},
	(prevProps, nextProps) => {
		const {
			realized_pnl: prevRealizePL,
			realized_pnl_percent: prevRealizePLPercent,
			currency_by_account: prevCurrency
		} = prevProps.data || {};
		const {
			realized_pnl: realizePL,
			realized_pnl_percent: realizePLPercent,
			currency_by_account: currency
		} = nextProps.data || {};
		const isChange =
			prevRealizePL !== realizePL ||
			prevRealizePLPercent !== realizePLPercent ||
			prevCurrency !== currency;
		return !isChange;
	}
);

const DayPL = React.memo(
	({ data }) => {
		const {
			currency_by_account: currency,
			today_upnl: todayUpnl,
			today_upnl_percent: todayUpnlPercent
		} = data;
		return (
			<View style={{ alignItems: 'flex-end' }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor,
						opacity: 0.5
					}}
				>
					{I18n.t('dayPL')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={todayUpnl}
					decimal={PRICE_DECIMAL.VALUE}
					textStyle={{ fontFamily: CommonStyle.fontPoppinsBold }}
				/>
				<PercentFormat value={todayUpnlPercent} />
			</View>
		);
	},
	(prevProps, nextProps) => {
		const {
			today_upnl: prevTodayUpnl,
			today_upnl_percent: prevTodayUpnlPercent,
			currency_by_account: prevCurrency
		} = prevProps.data || {};
		const {
			today_upnl: todayUpnl,
			today_upnl_percent: todayUpnlPercent,
			currency_by_account: currency
		} = nextProps.data || {};
		const isChange =
			prevTodayUpnl !== todayUpnl ||
			prevTodayUpnlPercent !== todayUpnlPercent ||
			prevCurrency !== currency;
		return !isChange;
	}
);

const MainSummary = ({ data, portfolioType, symbol, exchange, ...rest }) => {
	const [marketValue] = useMarketValueByPortfolioType({ data });
	const { currency_by_account: currency } = data;
	const [Shadow, onLayout] = useShadow();
	return (
		<View style={{ paddingVertical: 5 }}>
			<View>
				<Shadow />
				<View
					onLayout={onLayout}
					style={{
						backgroundColor: CommonStyle.color.dark,
						zIndex: 10,
						paddingHorizontal: 16
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: 8
						}}
					>
						<Text
							style={{
								fontFamily: CommonStyle.fontPoppinsRegular,
								fontSize: CommonStyle.font11,
								opacity: 0.5,
								color: CommonStyle.fontColor
							}}
						>
							{portfolioType === PORTFOLIO_TYPE.EQUITY
								? I18n.t('marketValue')
								: I18n.t('initialMargin')}
						</Text>
						<Text
							style={{
								fontSize: CommonStyle.font11,
								fontFamily: CommonStyle.fontPoppinsRegular,
								opacity: 0.7,
								color: CommonStyle.color.modify
							}}
						>
							{currency || '--'}
						</Text>
					</View>
					<MarketValOrIM
						currency={currency}
						{...{ symbol, exchange }}
						marketValue={marketValue}
					/>
					<View
						style={{
							paddingVertical: 8,
							flexDirection: 'row',
							justifyContent: 'space-between'
						}}
					>
						<TotalPL data={data} />
						<RealisedPL {...rest} data={data} />
						<DayPL data={data} />
					</View>
				</View>
			</View>
		</View>
	);
};

const ActualVol = React.memo(
	({ data, style }) => {
		const { volume } = data;
		return (
			<View
				style={[
					{ justifyContent: 'center', alignItems: 'flex-start' },
					style
				]}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('actualVol')}
				</Text>
				<ValueFormat
					value={volume}
					decimal={PRICE_DECIMAL.VOLUME}
					ignorePositiveNumber
					hasCurrency={false}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { volume: prevVolume } = prevProps.data || {};
		const { volume } = nextProps.data || {};
		const isChange = prevVolume !== volume;
		return !isChange;
	}
);

const AvgPrice = React.memo(
	({ data, style }) => {
		const { average_price: avgPrice } = data;
		return (
			<View
				style={[
					{ justifyContent: 'center', alignItems: 'center' },
					style
				]}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('averagePrice')}
				</Text>
				<ValueFormat
					isShowCommand={false}
					value={avgPrice}
					decimal={PRICE_DECIMAL.EXTERNAL}
					ignorePositiveNumber
					hasCurrency={false}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { average_price: prevAvgPrice } = prevProps.data || {};
		const { average_price: avgPrice } = nextProps.data || {};
		const isChange = prevAvgPrice !== avgPrice;
		return !isChange;
	}
);

const CostValue = React.memo(
	({ data, alignItems = 'flex-end', style }) => {
		const { cost_value: costValue, currency_by_account: currency } = data;
		return (
			<View style={[{ justifyContent: 'center', alignItems }, style]}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('costValue')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={costValue}
					ignorePositiveNumber
					decimal={PRICE_DECIMAL.VALUE}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
					currencyStyle={{
						fontSize: CommonStyle.fontTiny
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { cost_value: prevCostValue, currency_by_account: preCurrency } =
			prevProps.data || {};
		const { cost_value: costValue, currency_by_account: currency } =
			nextProps.data || {};
		const isChange =
			prevCostValue !== costValue || preCurrency !== currency;
		return !isChange;
	}
);

const MarketValue = React.memo(
	({ data, alignItems = 'flex-end', style }) => {
		const { market_value: marketValue, currency_by_account: currency } =
			data;
		return (
			<View style={[{ justifyContent: 'center', alignItems }, style]}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('marketValue')}
				</Text>
				<ValueFormat
					currencyCode={currency}
					value={marketValue}
					decimal={PRICE_DECIMAL.VALUE}
					hasPrefix
					ignorePositiveNumber
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
					currencyStyle={{
						fontSize: CommonStyle.fontTiny
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const {
			market_value: prevMarketValue,
			currency_by_account: prevCurrency
		} = prevProps.data || {};
		const { market_value: marketValue, currency_by_account: currency } =
			nextProps.data || {};
		const isChange =
			prevMarketValue !== marketValue || prevCurrency !== currency;
		return !isChange;
	}
);

const PerContractFee = React.memo(
	({ data, style }) => {
		const { contract_fee: perContractFee } = data;
		const noFee = perContractFee === null || perContractFee === undefined;

		return (
			<View
				style={[
					{
						justifyContent: 'center',
						alignItems: 'flex-end',
						opacity: noFee ? 0 : 1
					},
					style
				]}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('perContractFee')}
				</Text>
				<ValueFormat
					value={perContractFee}
					ignorePositiveNumber={true}
					hasCurrency={false}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
					currencyStyle={{
						fontSize: CommonStyle.fontTiny
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { contract_fee: prevPerContractFee } = prevProps.data || {};
		const { contract_fee: perContractFee } = nextProps.data || {};
		const isChange = prevPerContractFee !== perContractFee;
		return !isChange;
	}
);

const MarginPercent = React.memo(
	({ data, style }) => {
		const { margin_percent: marginPercent } = data;
		return (
			<View
				style={[
					{ justifyContent: 'center', alignItems: 'flex-end' },
					style
				]}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						opacity: 0.5,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				>
					{I18n.t('marginPercent')}
				</Text>
				<PercentFormat
					hasPrefix={false}
					value={marginPercent}
					textStyle={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontColor
					}}
				/>
			</View>
		);
	},
	(prevProps, nextProps) => {
		const { margin_percent: prevMarginPercent } = prevProps.data || {};
		const { margin_percent: marginPercent } = nextProps.data || {};
		const isChange = prevMarginPercent !== marginPercent;
		return !isChange;
	}
);

const SubSummary = ({ data, portfolioType }) => {
	return (
		<View>
			<View
				style={{
					paddingVertical: 8,
					paddingHorizontal: 16,
					width: '100%',
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				<ActualVol data={data} style={{ flex: 3.5 }} />
				<AvgPrice data={data} style={{ flex: 3 }} />
				{portfolioType === PORTFOLIO_TYPE.CFD ? (
					<MarginPercent data={data} style={{ flex: 3.5 }} />
				) : (
					<CostValue data={data} style={{ flex: 3.5 }} />
				)}
			</View>
			{portfolioType === PORTFOLIO_TYPE.CFD ? (
				<View
					style={{
						paddingVertical: 8,
						paddingHorizontal: 16,
						width: '100%',
						flexDirection: 'row',
						justifyContent: 'space-between'
					}}
				>
					<MarketValue
						data={data}
						alignItems={'flex-start'}
						style={{ flex: 3.5 }}
					/>
					<CostValue
						data={data}
						alignItems={'center'}
						style={{ flex: 3 }}
					/>
					<PerContractFee data={data} style={{ flex: 3.5 }} />
				</View>
			) : null}
		</View>
	);
};

const PortfolioDetailSummary = (props) => {
	return (
		<View style={{ marginTop: 8 }}>
			<MainSummary {...props} />
			<SubSummary {...props} />
		</View>
	);
};

export default PortfolioDetailSummary;
