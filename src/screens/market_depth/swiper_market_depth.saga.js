import { call, select, put, take, race, flush } from 'redux-saga/effects';
import { channel, buffers } from 'redux-saga';
import _ from 'lodash';

import { logDevice } from '../../lib/base/functionUtil';
import * as Util from '../../util';
import { func } from '../../storage';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as AllMarket from '../../streaming/all_market';
import Enum from '../../enum';
import * as Emitter from '@lib/vietnam-emitter';
import marketActions from './swiper_market_depth.reducer';
import * as Controller from '~/memory/controller';

function* takeEvery(requestChan, cb) {
	while (true) {
		const action = yield take(requestChan);
		const { task, cancel } = yield race({
			task: call(cb, action),
			cancel: take(requestChan)
		});

		if (cancel !== undefined) {
			const actions = yield flush(requestChan);
			// Don't need these actions, do nothing.
		}
	}
}

const changeMarketDepth = function*({ data: { Ask, ask, Bid, bid } }) {
	yield put(marketActions.setListAskBid(Ask || ask, Bid || bid));
	yield put(marketActions.updateMarketDepth());
};
export function* subMarketDepth({ id }) {
	if (!Controller.isPriceStreaming()) return;

	const { symbol } = yield select(state => state.searchDetail);
	let exchange = yield call(func.getExchangeSymbol, symbol);
	exchange = exchange || 'ASX';

	Emitter.deleteByIdEvent(id);

	const cbChannel = yield call(channel, buffers.sliding(3));
	Emitter.addListener(
		StreamingBusiness.getChannelLv2(exchange, symbol),
		id,
		bodyData => {
			cbChannel.put({
				type: 'CB_SUB_MARKET_DEPTH',
				data: bodyData || {}
			});
		}
	);

	yield takeEvery(cbChannel, changeMarketDepth);
}

export function* updateMarketDepth() {
	try {
		const { listAsk, listBid, quantity } = yield select(
			state => state.marketDepth
		);
		const listDataAskSort = _.take(_.values(listAsk), quantity);
		const listDataBidSort = _.take(_.values(listBid), quantity);

		if (_.isEmpty(listDataAskSort) && _.isEmpty(listDataBidSort)) {
			yield put(marketActions.changeMarketDepthData([]));
			return;
		}

		const { quantity: maxAsk = 0 } =
			_.maxBy(listDataAskSort, o => o.quantity) || {};
		const { quantity: maxBid = 0 } =
			_.maxBy(listDataBidSort, o => o.quantity) || {};
		const max = Math.max(maxBid, maxAsk);

		const listData = [];
		for (let index = 0; index < quantity; index++) {
			const elementAsk = listDataAskSort[index];
			const elementBid = listDataBidSort[index];
			const objTemp = {};
			if (elementAsk) {
				objTemp['ask'] = elementAsk.price;
				objTemp['ask_quantity'] = elementAsk.quantity;
				objTemp['ask_percent'] = elementAsk.quantity / max;
				objTemp['ask_no'] = elementAsk.number_of_trades;
			}
			if (elementBid) {
				objTemp['bid'] = elementBid.price;
				objTemp['bid_quantity'] = elementBid.quantity;
				objTemp['bid_percent'] = elementBid.quantity / max;
				objTemp['bid_no'] = elementBid.number_of_trades;
			}
			listData.push(objTemp);
		}

		yield put(marketActions.changeMarketDepthData(listData));
	} catch (error) {
		logDevice('info', `MarketDepth calculator exceptiom: ${error}`);
	}
}

export function* getMarketSnapshot() {
	const { symbol } = yield select(state => state.searchDetail);
	let exchange = yield call(func.getExchangeSymbol, symbol);
	exchange = exchange || 'ASX';

	const bodyData = yield call(
		AllMarket.getData,
		Enum.STREAMING_MARKET_TYPE.DEPTH,
		[
			{
				symbol,
				exchange
			}
		]
	);
	if (!Util.arrayHasItem(bodyData)) return;
	const { Ask, ask, Bid, bid } = bodyData[0];
	yield put(marketActions.setListAskBid(Ask || ask, Bid || bid));
	yield put(marketActions.updateMarketDepth());
}
