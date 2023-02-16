import _ from 'lodash';
import memorize from 'fast-memoize';

import * as Api from '~/api';
import { getOptionStream } from '~/streaming/streaming_business';
import Nchan from '~/nchan.1';
import { changeQuotesData as wrapData } from './quotes.reducers';
import { logDevice } from '~/lib/base/functionUtil';

const MAX_LENGTH_URL = 1000;

const groupListSymbolAsUrl = (dispatch, listSymbol) => {
	const result = [];
	const exchangeUrl = {};
	const listSymbols = {};
	const listSplitSymbolsEx = {};

	dispatch.priceBoard.getSymbolInfo(listSymbol);

	_.forEach(listSymbol, (item) => {
		const { symbol, exchange } = item || {};
		if (!exchange || !symbol) return;
		// if (!result[exchange]) result[exchange] = [];

		const curKey = `${symbol}.${exchange}`;
		if (!exchangeUrl[exchange]) {
			exchangeUrl[exchange] = curKey;
			listSymbols[exchange] = [item];
			listSplitSymbolsEx[exchange] = [symbol + '#' + exchange];
		} else {
			exchangeUrl[exchange] = exchangeUrl[exchange] + ',' + curKey;
			listSymbols[exchange].push(item);
			listSplitSymbolsEx[exchange].push(symbol + '#' + exchange);
		}

		if (_.size(exchangeUrl[exchange]) >= MAX_LENGTH_URL) {
			result.push({
				symbolsAsUrl: exchangeUrl[exchange],
				symbols: listSymbols[exchange],
				symbolsEx: listSplitSymbolsEx[exchange],
				exchange
			});
			exchangeUrl[exchange] = null;
			listSymbols[exchange] = null;
			listSplitSymbolsEx[exchange] = null;
		}
	});

	_.forEach(
		exchangeUrl,
		(lastUrl, exchange) =>
			lastUrl &&
			result.push({
				symbolsAsUrl: lastUrl,
				symbols: listSymbols[exchange],
				symbolsEx: listSplitSymbolsEx[exchange],
				exchange
			})
	);

	return result;
};

const groupWithoutExchange = (dispatch, listSymbol) => {
	const result = [];
	let exchangeUrl = '';
	let listSplitSymbolsEx = [];

	dispatch.priceBoard.getSymbolInfo(listSymbol);

	_.forEach(listSymbol, (item) => {
		const { symbol, exchange } = item || {};
		if (!exchange || !symbol) return;
		// if (!result[exchange]) result[exchange] = [];

		const curKey = `${symbol}.${exchange}`;
		if (!exchangeUrl) {
			exchangeUrl = curKey;
			listSplitSymbolsEx = [symbol + '#' + exchange];
		} else {
			exchangeUrl = exchangeUrl + ',' + curKey;
			listSplitSymbolsEx.push(symbol + '#' + exchange);
		}

		if (_.size(exchangeUrl) >= MAX_LENGTH_URL) {
			result.push({
				symbolsAsUrl: exchangeUrl,
				symbolsEx: listSplitSymbolsEx
			});
			exchangeUrl = '';
		}
	});

	exchangeUrl &&
		result.push({
			symbolsAsUrl: exchangeUrl,
			symbolsEx: listSplitSymbolsEx
		});

	return result;
};

const onData = (data) => {
	wrapData(
		{
			data: global.tmpQuotesData
		},
		data
	);
};

export const getSnapshot = async (dispatch, { listSymbol, cb }) => {
	const memoized = memorize((p) => groupWithoutExchange(dispatch, p));
	const listChannelInfo = memoized(listSymbol);
	const size = _.size(listChannelInfo);
	for (let index = 0; index < size; index++) {
		const { symbolsAsUrl } = listChannelInfo[index];
		const url = Api.getLv1SnapshotAllExchange(symbolsAsUrl);
		const response = await Api.requestData1(url);
		dispatch.quotes.changeQuotesData(response);
	}

	cb && cb();
};

const debounceSub = _.debounce(
	(dispatch) => {
		dispatch.quotes.handleData();
	},
	300,
	{
		leading: false
	}
);

export const handleData = (dispatch, payload, rootState) => {
	const listSymbolEx = _.keys(rootState.quotes.subscribed);
	const strSymbolEx = listSymbolEx.join(',');
	const symbolsAsUrl = strSymbolEx.replace(/#/g, '.');

	if (rootState.quotes.nchanConnected[symbolsAsUrl]) return;

	dispatch.quotes.unSubAll();

	if (!symbolsAsUrl) return;

	const url = Api.getLv1StreamingUrl(symbolsAsUrl);
	const onConnect = () => {
		dispatch.quotes.storeTimmer({ dispatch });
	};
	const onError = (e) => {};

	const onChangeNetwork = () => null;
	const newNChan = new Nchan({
		url,
		fnGetOption: getOptionStream,
		onData,
		timeout: 20000,
		reconnectTime: 1000,
		onConnect,
		onError,
		onChangeNetwork
	});

	dispatch.quotes.storeNchanConnected({
		newNChan,
		key: symbolsAsUrl
	});
};

export const subMultiply = (dispatch, { listSymbol }, rootState) => {
	const memoized = memorize((p) => groupWithoutExchange(dispatch, p));
	const listChannelInfo = memoized(listSymbol);
	_.forEach(listChannelInfo, ({ symbolsEx }) => {
		dispatch.quotes.storeSymbolSubscribed(symbolsEx);
	});

	debounceSub(dispatch);
};

export const unSubMultiply = (dispatch, { listSymbol }, rootState) => {
	const memoized = memorize((p) => groupWithoutExchange(dispatch, p));
	const listChannelInfo = memoized(listSymbol);
	dispatch.quotes.unsubscribe({ listChannelInfo });
	debounceSub(dispatch);
};

export const unSubAll = (dispatch) => {
	dispatch.quotes.removeNchanConnected({ isAll: true });
	dispatch.quotes.unsubscribe({ isAll: true });
};

export const sub = (dispatch, { symbol, exchange }, rootState) => {
	const key = symbol + '#' + exchange;
	dispatch.quotes.storeSymbolSubscribed([key]);
	debounceSub(dispatch);
};

export const unSub = (dispatch, payload) => {
	dispatch.quotes.unsubscribe(payload);
	debounceSub(dispatch);
};
