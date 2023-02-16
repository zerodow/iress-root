import _ from 'lodash';
import { call, select, put, take, flush, race } from 'redux-saga/effects';
import { channel, buffers } from 'redux-saga';
import * as Emitter from '@lib/vietnam-emitter';

import * as AllMarket from '../../streaming/all_market';
import * as StreamingBusiness from '../../streaming/streaming_business';
import Enum from '../../enum';
import SwiperActions from './swiper_10_trades.reducer';
import { logDevice } from '../../lib/base/functionUtil';
import { func } from '../../storage';
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

const changeSwiper10Trade = function*({ data: dataOfListSymbol }) {
	const { data } = dataOfListSymbol[0] || {};
	yield put(SwiperActions.updateSwiperTenTrade(data));
};

export function* subSwiper10Trade({ id }) {
	if (!Controller.isPriceStreaming()) return;
	const { symbol } = yield select(state => state.searchDetail);
	let exchange = yield call(func.getExchangeSymbol, symbol);
	exchange = exchange || 'ASX';

	const cbChannel = yield call(channel, buffers.sliding(3));

	Emitter.deleteByIdEvent(id);
	Emitter.addListener(
		StreamingBusiness.getChannelCos(exchange, symbol),
		id,
		bodyData => {
			cbChannel.put({
				type: 'CB_SWIPER_10_TRADE',
				data: bodyData || {}
			});
		}
	);

	yield takeEvery(cbChannel, changeSwiper10Trade);
}

export function* updateSwiper10Trade({ data }) {
	yield put(SwiperActions.changeSwiperTenTrade(_.values(data)));
}

export function* getSnapshotSwiper10Trade() {
	const { symbol } = yield select(state => state.searchDetail);
	let exchange = yield call(func.getExchangeSymbol, symbol);
	exchange = exchange || 'ASX';

	try {
		const snap = yield call(
			AllMarket.getData,
			Enum.STREAMING_MARKET_TYPE.TRADES,
			[
				{
					exchange,
					symbol
				}
			],
			true
		);

		yield put(SwiperActions.updateSwiperTenTrade(snap));
	} catch (error) {
		logDevice('info', `Ten trades get filled data exception: ${error}`);
	}
}
