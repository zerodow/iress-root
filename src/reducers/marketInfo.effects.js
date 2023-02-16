import _ from 'lodash';

import * as Api from '~/api';
import { getOptionStream } from '~/streaming/streaming_business';
import Nchan from '~/nchan.1';
import { getSymbolInfoApi } from '~/lib/base/functionUtil'

export const getMarketInfo = async (
	dispatch,
	{ symbol, exchange },
	rootState
) => {
	const url = Api.getExchangeUrl();
	const response = await Api.requestData1(`${url}?exchange=${exchange}`);
	dispatch.marketInfo.changeData(response && response[0]);
};

export const getSymbolInfo = async (dispatch, { symbol, exchange }) => {
	// Call api market-info/symbol to get market_cap / pe_ratio / yearlyend_dividend
	const stringQuery = `${symbol}.${exchange}`
	const byPassCache = true
	const forceUpdate = true
	const cb = () => {
		if (!symbol || !exchange) return
		dispatch.marketInfo.changeSymbolInfo({ symbol, exchange });
	}
	getSymbolInfoApi(stringQuery, cb, byPassCache, forceUpdate)
}
