import _ from 'lodash';

import * as Api from '~/api';
import { getOptionStream } from '~/streaming/streaming_business';
import Nchan from '~/nchan.1';
import { changeTradesData as wrapData } from './trades.reducers';

const delayDispatchData = (dispatch, rootState) => {
	if (!rootState.trades.timer) {
		const timer = setInterval(() => {
			dispatch.trades.changeTradesData(global.tmpTradesData);
		}, 1000);
		dispatch.trades.storeTimmer({ timer });
	}
};

const onData = (data) => {
	wrapData(
		{
			data: global.tmpTradesData
		},
		[data]
	);
};

export const getSnapshot = async (dispatch, { symbol, exchange }) => {
	const url = Api.getCosSnapshot(
		exchange,
		`${symbol}.${exchange}`.replace(/\.ASX/g, '')
	);
	const response = await Api.requestData1(url);
	dispatch.trades.changeTradesData([response]);
};

const debounceSub = _.debounce(
	(dispatch) => {
		dispatch.trades.handleData();
	},
	300,
	{
		leading: false
	}
);
export const handleData = (dispatch, payload, rootState) => {
	const listSymbolEx = _.keys(rootState.trades.subscribed);
	const strSymbolEx = listSymbolEx.join(',');
	const symbolsAsUrl = strSymbolEx.replace(/#/g, '.');

	if (rootState.trades.nchanConnected[symbolsAsUrl]) return;
	dispatch.trades.unSubAll();

	if (!symbolsAsUrl) return;
	const url = Api.getCosStreamingUrl1(symbolsAsUrl);

	const onConnect = () => {
		delayDispatchData(dispatch, rootState);
	};

	const onError = () => null;
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

	dispatch.trades.storeNchanConnected({
		newNChan,
		key: symbolsAsUrl
	});
};

export const sub = (dispatch, { symbol, exchange }, rootState) => {
	const key = symbol + '#' + exchange;
	dispatch.trades.storeSymbolSubscribed([key]);
	debounceSub(dispatch);
};

export const unSub = (dispatch, payload) => {
	dispatch.trades.unsubscribe(payload);
	debounceSub(dispatch);
};

export const unSubAll = (dispatch) => {
	dispatch.trades.removeNchanConnected({ isAll: true });
	dispatch.trades.unsubscribe({ isAll: true });
};
