import {
	getMarketCapBySymbolExchange,
	getPERatioBySymbolExchange,
	getYearlyDividendBySymbolExchange
} from '~/business';
export const changeData = (state, data) => {
	// data is array of quote
	state.data = data || {};

	return state;
};

export const changeSymbolInfo = (state, { symbol, exchange }) => {
	const marketCap = getMarketCapBySymbolExchange({ symbol, exchange });
	const peRatio = getPERatioBySymbolExchange({ symbol, exchange });
	const yearlyDividend = getYearlyDividendBySymbolExchange({
		symbol,
		exchange
	});
	const key = `${symbol}#${exchange}`;
	state.symbolInfo = {
		[key]: {
			marketCap,
			peRatio,
			yearlyDividend
		}
	};
	return state;
};
