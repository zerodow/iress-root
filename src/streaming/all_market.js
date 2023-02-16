import * as Api from '../api';
import * as StreamingBusiness from './streaming_business';
import * as Util from '../util';
import Enum from '../enum';
import Nchan from '../nchan.1';
import VietNamQueue from '@lib/vietnam-queue';
import * as StreamingStorage from './streaming_storage'
import * as Lv1 from './lv1'
import * as Lv2 from './lv2'
import * as Cos from './cos'
import * as Url from '../../src/network/http/url'

const { DEFAULT_VAL, KEY_CONVERT_LV1 } = Enum;

let isAIO = false
const nchanObj = {};
const nchanObjTemp = {};
const dicData = {};
const HistoricalQueue = new VietNamQueue();

export const mapDataLv1 = allMarketData => {
	const dataRealtime = {}
	for (const key in allMarketData) {
		const val = allMarketData[key];
		const newKey = KEY_CONVERT_LV1[key];
		if (newKey) {
			dataRealtime[newKey] = val;
		} else {
			dataRealtime[key] = val;
		}
	}
	return dataRealtime
}

const processData = allMarketData => {
	const quoteData = mapDataLv1(isAIO ? allMarketData.quote : allMarketData)
	const depthData = allMarketData && allMarketData.depth ? allMarketData.depth : {} // Lv2
	const tradeData = allMarketData && allMarketData.trades ? allMarketData.trades : [] // Cos
	const symbol = allMarketData && allMarketData.symbol ? allMarketData.symbol : ''
	const exchange = allMarketData && allMarketData.exchange ? allMarketData.exchange : ''
	Object.keys(quoteData).length && Lv1.processData(quoteData)
	if (isAIO) {
		tradeData.length && Cos.processData(tradeData, symbol, exchange)
		if (depthData.ask || depthData.bid) {
			depthData['symbol'] = symbol
			depthData['exchange'] = exchange
			Lv2.processData(depthData)
		}
	}
};

const onChangeNetwork = cnn => {
	const dicSub = StreamingStorage.getDicSub()
	if (dicSub[Enum.STREAMING_MARKET_TYPE.QUOTE]) {
		Lv1.onChangeNetwork(cnn)
	}
	if (dicSub[Enum.STREAMING_MARKET_TYPE.DEPTH]) {
		Lv2.onChangeNetwork(cnn)
	}
	if (dicSub[Enum.STREAMING_MARKET_TYPE.TRADES]) {
		Cos.onChangeNetwork(cnn)
	}
};

const connectNchan = (exchange, stringSymbol) => {
	return new Promise(resolve => {
		const newNchanObj = new Nchan({
			url: isAIO
				? Api.getAllStreamingMarketUrl(stringSymbol)
				: Api.getPriceStreamingMarketUrl(stringSymbol),
			fnGetOption: StreamingBusiness.getOptionStream,
			onData: processData,
			timeout: 20000,
			reconnectTime: 1000,
			onConnect: () => {
				nchanObj[exchange] = nchanObj[exchange] || [];
				nchanObj[exchange].push(newNchanObj);
				resolve();
			},
			onError: () => {
				resolve();
			},
			onChangeNetwork
		});
	});
};

const removeSymbolUnsub = (exchange, listSymbol, idSub) => {
	const dicSub = StreamingStorage.getDicSub()
	const dicSnapshot = StreamingStorage.getDicSnapshot()
	listSymbol.map(symbol => {
		try {
			if (!dicSub || !dicSub[exchange] || !dicSub[exchange][symbol] || !dicSub[exchange][symbol][idSub]) return;

			delete dicSub[exchange][symbol][idSub];

			if (!Util.objHasKeys(dicSub[exchange][symbol])) delete dicSub[exchange][symbol];
			if (!Util.objHasKeys(dicSub[exchange])) delete dicSub[exchange];

			if (dicData && dicData[exchange] && dicData[exchange][symbol]) {
				delete dicData[exchange][symbol];
				if (!Util.objHasKeys(dicData[exchange])) delete dicData[exchange];
			}

			// Delete dicSnapshot QUOTE
			if (
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE] &&
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange] &&
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange][symbol] &&
				(
					!Util.objHasKeys(dicSub[exchange]) ||
					!Util.objHasKeys(dicSub[exchange][symbol])
				)
			) {
				delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange][symbol];
				if (!Util.objHasKeys(dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange])) delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][exchange];
			}
			// Delete dicSnapshot DEPTH
			if (
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH] &&
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange] &&
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange][symbol] &&
				(
					!Util.objHasKeys(dicSub[exchange]) ||
					!Util.objHasKeys(dicSub[exchange][symbol])
				)
			) {
				delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange][symbol];
				if (!Util.objHasKeys(dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange])) delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange];
			}
			// Delete dicSnapshot TRADE
			if (
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES] &&
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange] &&
				dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange][symbol] &&
				(
					!Util.objHasKeys(dicSub[exchange]) ||
					!Util.objHasKeys(dicSub[exchange][symbol])
				)
			) {
				delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange][symbol];
				if (!Util.objHasKeys(dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange])) delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange];
			}
			// Delete all dicSnapshot
			if (!Util.objHasKeys(dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE])) {
				delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE]
			}
			if (!Util.objHasKeys(dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH])) {
				delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH]
			}
			if (!Util.objHasKeys(dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES])) {
				delete dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES]
			}
		} catch (error) {
			console.log(error);
		}
	});
	StreamingStorage.setDicSnapshot(dicSnapshot)
	StreamingStorage.setDicSub(dicSub)
};

const subWithExchange = (exchange, listSymbol, idSub) => {
	return new Promise(resolve => {
		const dicSub = StreamingStorage.getDicSub()
		const isSubAll = StreamingBusiness.checkSymbolSub({
			idSub,
			exchange,
			listSymbol,
			dicObj: dicSub
		});
		if (isSubAll) return resolve();

		const listSymbolString = StreamingBusiness.getStringPriceSubSymbol(exchange, Object.keys(dicSub[exchange]));
		const listPromise = listSymbolString.map(str => connectNchan(exchange, str));
		Promise.all(listPromise).then(() => {
			nchanObjTemp[exchange] && nchanObjTemp[exchange].map(item => {
				item && item.close && item.close();
			});
			nchanObjTemp[exchange] = [];
			resolve();
		});
	});
};

const unsubWithExchange = (exchange, listSymbol, idSub) => {
	return new Promise(resolve => {
		const dicSub = StreamingStorage.getDicSub()
		if (!dicSub[exchange]) return resolve();
		removeSymbolUnsub(exchange, listSymbol, idSub);

		if (Util.objHasKeys(dicSub[exchange])) {
			const listSymbolString = StreamingBusiness.getStringPriceSubSymbol(exchange, Object.keys(dicSub[exchange]));
			const listPromise = listSymbolString.map(str => connectNchan(exchange, str));
			Promise.all(listPromise).then(() => {
				nchanObjTemp[exchange] && nchanObjTemp[exchange].map(item => {
					item && item.close && item.close();
				});
				nchanObjTemp[exchange] = [];
				return resolve();
			});
		} else {
			nchanObjTemp[exchange].map(item => {
				item && item.close && item.close();
			});
			nchanObjTemp[exchange] = [];
			return resolve();
		}
	});
};

const getDataFunc = type => {
	let snapshotFn = Lv1.getLv1Snapshot
	let streamingFn = Lv1.getLv1Streaming
	switch (type) {
		case Enum.STREAMING_MARKET_TYPE.DEPTH:
			snapshotFn = Lv2.getLv2Snapshot
			streamingFn = Lv2.getLv2Streaming
			break;
		case Enum.STREAMING_MARKET_TYPE.TRADES:
			snapshotFn = Cos.getCosSnapshot
			streamingFn = Cos.getCosStreaming
			break;
	}
	return {
		snapshotFn,
		streamingFn
	}
}

export function setIsAIO(status) {
	isAIO = status
}

export function getIsAIO() {
	return isAIO
}

export function getDataAOISnapshot(listObjSymbol) {
	return new Promise((resolve, reject) => {
		if (!Util.arrayHasItem(listObjSymbol)) return resolve([]);

		let { exchange, symbol } = listObjSymbol[0]
		symbol = encodeURIComponent(symbol);
		const url = Api.getPriceAOIUrl(exchange, symbol);

		Api.requestData(url)
			.then(bodyData => resolve(bodyData || []))
			.catch(() => resolve([]));
	});
}
export function getDataAOIStreaming(listObjSymbol) {
	return new Promise((resolve, reject) => {
		if (!Util.arrayHasItem(listObjSymbol)) return resolve([]);

		let { exchange, symbol } = listObjSymbol[0]
		symbol = encodeURIComponent(symbol);
		const url = Api.getPriceAOIUrl(exchange, symbol);

		Api.requestData(url)
			.then(bodyData => {
				const allData = bodyData[0] || {}
				const { quote, depth, trades, exchange, symbol } = allData
				// Quote
				markSnapShotLv1(quote)
				mergeDataQuoteRealtime(quote)
				// Depth
				markSnapShotLv2(exchange, symbol, depth)
				// Trades
				markSnapshotCos(exchange, symbol, trades)
				Cos.updateDicDataAOI(exchange, symbol, trades)
				resolve(bodyData || [])
			})
			.catch(() => resolve([]));
	});
}

export function mergeDataQuoteRealtime(snapshotData) {
	snapshotData && Lv1.mergeDataWithRealtime(snapshotData)
}

export function markSnapShotLv1(quote) {
	if (!quote || !quote.exchange || !quote.symbol) return;
	const dicSnapshot = StreamingStorage.getDicSnapshot()
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE] || {}
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][quote.exchange] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][quote.exchange] || {};
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.QUOTE][quote.exchange][quote.symbol] = true;
	StreamingStorage.setDicSnapshot(dicSnapshot)
}

export function markSnapShotLv2(exchange, symbol, depth) {
	if (!depth || !exchange || !symbol) return;
	const dicSnapshot = StreamingStorage.getDicSnapshot()
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH] || {}
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange] || {};
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.DEPTH][exchange][symbol] = true;
	StreamingStorage.setDicSnapshot(dicSnapshot)
}

export function markSnapshotCos(exchange, symbol, trades) {
	if (!trades || !exchange || !symbol) return;
	const dicSnapshot = StreamingStorage.getDicSnapshot()
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES] || {}
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange] = dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange] || {};
	dicSnapshot[Enum.STREAMING_MARKET_TYPE.TRADES][exchange][symbol] = true;
	StreamingStorage.setDicSnapshot(dicSnapshot)
}

export async function getDataAOIDelay(listObjSymbol) {
	setIsAIO(true)
	return new Promise((resolve) => {
		if (!Util.arrayHasItem(listObjSymbol)) return [];
		const { exchange, symbol } = listObjSymbol[0]
		const url = Url.urlLv1Delay(exchange, symbol);
		Api.requestData(url)
			.then(bodyData => {
				const quote = bodyData[0] || {}
				if (quote) {
					const data = [{
						exchange,
						symbol,
						quote
					}]
					resolve(data)
				} else {
					resolve([])
				}
			})
			.catch(() => resolve([]));
	})
}

export function getDataAOI(listObjSymbol, forceSub) {
	setIsAIO(true)
	return forceSub
		? getDataAOIStreaming(listObjSymbol)
		: getDataAOISnapshot(listObjSymbol)
}

export function getData(type, listObjSymbol, forceSub) {
	setIsAIO(false)
	const { snapshotFn, streamingFn } = getDataFunc(type)
	return forceSub
		? streamingFn(listObjSymbol)
		: snapshotFn(listObjSymbol);
};

function subQueue({ listSymbolObj, idSub, onOpen }) {
	return new Promise(resolve => {
		const dicExchange = {};
		const listPromise = [];

		listSymbolObj.map(obj => {
			const exchange = obj.exchange;
			const symbol = obj.symbol;
			if (!dicExchange[exchange]) dicExchange[exchange] = [];
			dicExchange[exchange].push(symbol);
		});

		Object.keys(dicExchange).map(exchange => {
			nchanObjTemp[exchange] = nchanObj[exchange] || [];
			nchanObj[exchange] = [];
			listPromise.push(subWithExchange(exchange, dicExchange[exchange], idSub));
		});

		Promise.all(listPromise).then(() => {
			resolve();
			onOpen();
		});
	});
};

function unsubQueue({ listSymbolObj, idSub, onOpen }) {
	return new Promise(resolve => {
		const dicExchange = {};
		const listPromise = [];
		listSymbolObj.map(obj => {
			if (!obj || !obj.exchange || !obj.symbol) return;

			const exchange = obj.exchange;
			const symbol = obj.symbol;
			dicExchange[exchange] = dicExchange[exchange] || [];
			dicExchange[exchange].push(symbol);
		});

		Object.keys(dicExchange).map(exchange => {
			nchanObjTemp[exchange] = nchanObj[exchange] || [];
			nchanObj[exchange] = [];
			listPromise.push(unsubWithExchange(exchange, dicExchange[exchange], idSub));
		});

		Promise.all(listPromise).then(() => {
			resolve();
			onOpen();
		});
	});
};

export function sub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
	HistoricalQueue.push(subQueue, { listSymbolObj, idSub, onOpen });

	// onOpen()
	// Util.fakeLv1(listSymbolObj, processData);
	// Util.fakeCos(listSymbolObj, processData);
};

export function unsub(listSymbolObj = [], idSub, onOpen = DEFAULT_VAL.FUNC) {
	HistoricalQueue.push(unsubQueue, { listSymbolObj, idSub, onOpen });
};

export function unsubAll() {
	const listNchanByExchange = Object.keys(nchanObj)
	if (listNchanByExchange && listNchanByExchange.length) {
		listNchanByExchange.map(e => {
			const listNchan = nchanObj[e]
			if (listNchan && listNchan.length) {
				listNchan.map(nchan => {
					nchan.close && nchan.close()
				})
			}
		})
	}
	StreamingStorage.setDicSnapshot()
	StreamingStorage.setDicSub()
}
