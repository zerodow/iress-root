import { call, put } from 'redux-saga/effects';
import _ from 'lodash';
import { logAndReport, logDevice } from '../../lib/base/functionUtil';
import { dataStorage } from '../../storage';
import * as api from '../../api';
import OpenPriceActions from './new_open_price.reducer';

export function* getTopOrderTransaction({ symbol, isUniversalSearch }) {
	logDevice('info', `OpenPrice getDataHistory func`);
	try {
		const urlOrderTransaction = yield call(
			api.getUrlTopOrderTransaction,
			dataStorage.accountId,
			symbol
		);

		const val = yield call(api.requestData, urlOrderTransaction, true);

		logDevice('info', `OpenPrice getDataHistory result: ${val}`);

		let listOrder = val || [];

		listOrder = _.orderBy(listOrder, ['updated'], ['desc']);
		if (isUniversalSearch) {
			listOrder = _.slice(listOrder, 0, 5);
		}
		yield put(OpenPriceActions.getTopOrderTransactionSuccess(listOrder));
	} catch (error) {
		yield put(OpenPriceActions.getTopOrderTransactionFailure(error));
		logAndReport(
			'componentDidMount openPrice exception',
			error,
			'componentDidMount openPrice'
		);
		logDevice('info', `componentDidMount openPrice exception: ${error}`);
	}
}
