import { channel } from 'redux-saga';
import { call, select, put, take } from 'redux-saga/effects';
import _ from 'lodash';

import * as api from '~/api';
import { dataStorage } from '~/storage';
import { logDevice } from '~/lib/base/functionUtil';
import PortfolioActions from './search_portfolio.reducer';

export function* getDataPortfolio() {
	const { symbol } = yield select(state => state.searchDetail);
	try {
		const url = api.getNewTotalPortfolio(dataStorage.accountId);

		const cbChannel = yield channel();
		api.requestData(url, true).then(data => {
			cbChannel.put(data);
		});
		const data = yield take(cbChannel);
		logDevice('info', `Universal Search getDataPortfolio data: ${data}`);

		// const data = yield call(api.requestData, url, true);
		if (!_.isEmpty(data)) {
			let dataPorfolio = {};
			const {
				positions,
				profitPercent,
				today_change_val: listTodayChangeVal = {},
				today_change_percent: listTodayChangePercent = {},
				profitVal: listProfitVal = {},
				profitPercent: listProfitPercent = {}
			} = data;

			dataPorfolio =
				_.filter(positions, value => value.symbol === symbol)[0] || {};

			if (!_.isEmpty(dataPorfolio)) {
				dataPorfolio['profitPercent'] =
					(profitPercent && profitPercent[symbol]) || 0;

				dataPorfolio['listTodayChangeVal'] = listTodayChangeVal;

				dataPorfolio['listTodayChangePercent'] = listTodayChangePercent;

				dataPorfolio['listProfitVal'] = listProfitVal;

				dataPorfolio['listProfitPercent'] = listProfitPercent;

				dataPorfolio['book_value'] = dataPorfolio['book_value'] || null;

				dataPorfolio['book_value_aud'] = dataPorfolio['book_value_aud'] || null;

				dataPorfolio['symbol'] = symbol;
				dataPorfolio['isEmptyDataPort'] = false;
			} else {
				dataPorfolio = {
					isEmptyDataPort: true,
					symbol,
					profitPercent: 0,
					listTodayChangeVal,
					listTodayChangePercent,
					listProfitVal,
					listProfitPercent,
					book_value: dataPorfolio['book_value'] || null,
					book_value_aud: dataPorfolio['book_value_aud'] || null
				};
			}

			// put
			yield put(PortfolioActions.getDataPortfolioSuccess(dataPorfolio));
		} else {
			yield call(putDefaultPortfolio, symbol);
			logDevice(
				'info',
				`Universal Search getDataPortfolio data is null: ${
				data ? JSON.stringify(data) : ''
				}`
			);
		}
	} catch (error) {
		yield call(putDefaultPortfolio, symbol);
		logDevice(
			'info',
			`Universal Search getDataPortfolio exception: ${error}`
		);
	}
}

function* putDefaultPortfolio(symbol) {
	const dataPorfolio = {
		symbol,
		profitPercent: 0,
		listTodayChangeVal: {},
		listTodayChangePercent: {},
		listProfitVal: {},
		listProfitPercent: {},
		book_value: null,
		book_value_aud: null
	};
	// put
	yield put(PortfolioActions.getDataPortfolioSuccess(dataPorfolio));
}
