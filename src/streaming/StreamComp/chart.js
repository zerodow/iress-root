import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import BaseConnecter from './baseConnect';
// import * as Controller from '~/memory/controller';
import * as Util from '~/util';
import * as Api from '~/api';
import streamActions from './reducer';
import Enum from '~/enum';
import scriptLoader from '../WebApi/script.bundle';
import WebApi from '../WebApi/utils';

const BAR_BY_PRICE_TYPE = Enum.BAR_BY_PRICE_TYPE;

const CODE = `
<html>
	<head>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/node-uuid/1.4.8/uuid.min.js"></script>
	</head>
	<body>
        <script>
            ${decodeURI(scriptLoader)}
			true;
		</script>
	</body>
</html>
`;

class ChartStreaming extends BaseConnecter {
	preLoad = [];
	dicRealtime = {};
	dicSymbolRealtime = {};
	componentDidMount() {
		this.web = new WebApi(this.runJS);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.filterType !== this.props.filterType) {
			this.sub();
			// this.getSnapshot();
		}

		if (prevProps.isLoading && this.props.isLoading) {
			setTimeout(() => {
				this.getSnapshot();
			}, 500);
		}
	}

	getUrl(listSymbol, priceType = Enum.PRICE_FILL_TYPE._1D) {
		if (_.isEmpty(listSymbol)) return;

		return Api.getCustomHistorical1({
			listSymbol,
			priceType
		});
	}

	async onSuccess(snap) {
		if (!this.web) return {};
		const result = await this.web.runJS('chart.handleData', snap);
		return result;
	}

	async saveToStore(listData, filterType) {
		const arrPromise = [];
		const obj = {};
		_.forEach(listData, (data, symbol) => {
			obj[symbol] = true;

			const newData = {};
			newData[filterType] = data;

			arrPromise.push(
				storage.save({
					key: 'WatchListChart',
					id: symbol,
					data: newData
				})
			);
		});
		try {
			await Promise.all(arrPromise);
		} catch (error) {}
		return obj;
	}

	async addToStore(symbol, data, filterType) {
		let storeData = {};
		try {
			storeData =
				(await storage.load({
					key: 'WatchListChart',
					id: symbol
				})) || {};
		} catch (error) {}
		try {
			storeData[filterType] = { ...storeData[filterType], ...data };
			await this.saveData(symbol, storeData);
			this.dicSymbolRealtime[symbol] = true;
		} catch (error) {}
	}

	async saveData(symbol, data) {
		await storage.save({
			key: 'WatchListChart',
			id: symbol,
			data
		});
	}

	sleep(milliseconds) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	async handleEachChannelSymbol(symbols, exchange, filterType) {
		const url = this.getUrl(symbols, filterType, exchange);
		const snap = await Api.requestData1(url);
		const listData = await this.onSuccess(snap);
		if (_.isEmpty(listData)) return;
		const obj = await this.saveToStore(listData, filterType);
		this.onChangeLoadingState(false);
		this.props.changeChartData(obj, filterType);
	}

	// async handleFrameSymbols(listSymbol, filterType) {
	// 	const listSymbolGet = _.take(listSymbol, 20);
	// 	const listChannelInfo = await this.groupSymbolAsExchange(listSymbolGet);

	// 	const size = _.size(listChannelInfo);
	// 	const arrayListChannel = _.values(listChannelInfo);
	// 	const arrExchange = _.keys(listChannelInfo);

	// 	for (let i = 0, p = Promise.resolve(); i < size; i++) {
	// 		const { symbols } = arrayListChannel[i];
	// 		const exchange = arrExchange[i];

	// 		p = p.then(() =>
	// 			this.handleEachChannelSymbol(symbols, exchange, filterType)
	// 		);
	// 	}

	// 	const listSymbolWait = _.takeRight(listSymbol, _.size(listSymbol) - 20);
	// 	if (!_.isEmpty(listSymbolWait)) {
	// 		this.handleFrameSymbols(listSymbolWait, filterType);
	// 	} else {
	// 		this.snapping = false;
	// 	}
	// }

	async getSnapshot(props) {
		const {
			listSymbol,
			filterType = Enum.PRICE_FILL_TYPE._1D,
			isLoading
		} = props || this.props;
		if (isLoading || !listSymbol || !listSymbol[0]) return;
		this.onChangeLoadingState(true);
		this.snapping = true;
		// this.handleFrameSymbols(listSymbol, filterType);
		const listChannelInfo = await this.groupSymbolAsExchange(listSymbol);
		await this.handleGetData(listChannelInfo, filterType);
		this.snapping = false;
	}

	async handleGetData(listSymbol, filterType) {
		const curListSymbol = listSymbol;
		const listExchange = _.keys(curListSymbol);
		const firstExchange = listExchange[0];
		if (!firstExchange) return;
		await this.handleEachExchange(
			(curListSymbol[firstExchange] &&
				curListSymbol[firstExchange].symbols) ||
				[],
			firstExchange,
			filterType
		);

		delete curListSymbol[firstExchange];
		await this.handleGetData(curListSymbol, filterType);
	}

	async handleEachExchange(arrSymbol, exchange, filterType) {
		const arrSymbolGet = _.take(arrSymbol, 20);
		if (!_.size(arrSymbolGet)) return;

		await this.handleEachChannelSymbol(arrSymbolGet, exchange, filterType);

		const listSymbolWait = _.takeRight(arrSymbol, _.size(arrSymbol) - 20);
		await this.handleEachExchange(listSymbolWait, exchange, filterType);
	}

	setRef = this.setRef.bind(this);
	setRef(sef) {
		this._web = sef;
	}

	onLoadEnd = this.onLoadEnd.bind(this);
	onLoadEnd() {
		this.loadEnd = true;
		if (this.preLoad) {
			_.forEach(this.preLoad, (funcLoad) => {
				funcLoad();
			});
			this.preLoad = [];
		}
	}

	handleMessage = this.handleMessage.bind(this);
	handleMessage(e) {
		const message = e.nativeEvent.data;
		try {
			const { channel, params } = JSON.parse(message);
			this.web && this.web.onMessage(channel, params);
		} catch (error) {
			console.info('error when json parse', message);
		}
	}

	runJS = this.runJS.bind(this);
	runJS(code) {
		const runJSInBackground = () =>
			this._web && this._web.injectJavaScript(code);

		if (this.loadEnd) runJSInBackground();
		else {
			this.preLoad.push(runJSInBackground);
		}
	}

	async createConnect(props) {
		const { listSymbol, filterType = Enum.PRICE_FILL_TYPE._1D } =
			props || this.props;
		if (_.isEmpty(listSymbol) || !listSymbol[0]) return;

		const listChannelInfo = await this.groupSymbolAsExchange(listSymbol);

		const interval = BAR_BY_PRICE_TYPE[filterType];

		_.forEach(listChannelInfo, ({ symbols }, exchange) => {
			const url = Api.getHistoricalStreamingUrl(
				exchange,
				symbols,
				interval
			);

			this.createNchanConnecter(url, exchange + filterType);
		});

		this.interRealtime && clearInterval(this.interRealtime);
		this.interRealtime = setInterval(() => {
			if (this.snapping || _.isEmpty(this.dicRealtime)) return;
			_.forEach(this.dicRealtime, (data, symbol) => {
				this.addToStore(symbol, data, filterType);
			});

			this.props.changeChartData(this.dicSymbolRealtime, filterType);

			this.dicRealtime = {};
		}, 5 * 60 * 1000);
	}

	onData({ symbol, exchange, time, open, high, close, volume, low }) {
		if (!time) return;
		const timeUpdated = time;
		const curData = this.dicRealtime[symbol] || {};
		const { updated: curUpdated = 0 } = curData;
		if (timeUpdated > curUpdated) {
			this.dicRealtime[symbol] = this.dicRealtime[symbol] || {};
			this.dicRealtime[symbol][timeUpdated] = {
				updated: timeUpdated,
				open,
				high,
				close,
				volume,
				low
			};
		}
	}

	render() {
		return (
			<View style={{ height: 0 }}>
				<WebView
					useWebKit
					originWhitelist={['*']}
					ref={this.setRef}
					source={{ html: CODE }}
					onLoadEnd={this.onLoadEnd}
					onMessage={this.handleMessage}
				/>
			</View>
		);
	}
}

// const mapStateToProps = state => {
// 	const { marketData } = state.streamMarket;
// 	const { newsToday } = state.watchlist3;

// 	return { isLoading: _.isEmpty(marketData) || _.isEmpty(newsToday) };
// };

const mapDispatchToProps = (dispatch) => ({
	changeChartData: (...p) => dispatch(streamActions.changeChartData(...p))
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
	ChartStreaming
);
