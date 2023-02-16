import _ from 'lodash';

import * as Api from '~/api';
import { getOptionStream } from '~/streaming/streaming_business';
import Nchan from '~/nchan.1';
import { changeQuotesData as wrapData } from './quotes.reducers';

const delayDispatchData = (dispatch, rootState) => {
	if (!rootState.depths.timer) {
		const timer = setInterval(() => {
			dispatch.depths.changeDepthsData(global.tmpDepthsData);
		}, 1000);
		dispatch.depths.storeTimmer({ timer });
	}
};

const onData = (data) => {
	wrapData(
		{
			data: global.tmpDepthsData
		},
		[data]
	);
};

export const getSnapshot = async (dispatch, { symbol, exchange }) => {
	dispatch.depths.changeLoadingDepths(true);
	const url = Api.getLv2Snapshot(
		exchange,
		`${symbol}.${exchange}`.replace(/\.ASX/g, '')
	);
	const response = await Api.requestData1(url);
	dispatch.depths.changeDepthsData([response]);
};

const debounceSub = _.debounce(
	(dispatch) => {
		dispatch.depths.handleData();
	},
	300,
	{
		leading: false
	}
);

export const handleData = (dispatch, payload, rootState) => {
	const listSymbolEx = _.keys(rootState.depths.subscribed);
	const strSymbolEx = listSymbolEx.join(',');
	const symbolsAsUrl = strSymbolEx.replace(/#/g, '.');

	if (rootState.depths.nchanConnected[symbolsAsUrl]) return;
	dispatch.depths.unSubAll();

	if (!symbolsAsUrl) return;
	const url = Api.getLv2StreamingUrl1(symbolsAsUrl);

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

	dispatch.depths.storeNchanConnected({
		newNChan,
		key: symbolsAsUrl
	});
};

export const sub = (dispatch, { symbol, exchange }, rootState) => {
	const key = symbol + '#' + exchange;
	dispatch.depths.storeSymbolSubscribed([key]);
	debounceSub(dispatch);
};

export const unSub = (dispatch, payload) => {
	dispatch.depths.unsubscribe(payload);
	debounceSub(dispatch);
};

export const unSubAll = (dispatch) => {
	dispatch.depths.removeNchanConnected({ isAll: true });
	dispatch.depths.unsubscribe({ isAll: true });
};
