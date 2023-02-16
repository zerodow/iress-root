import { call, select, put } from 'redux-saga/effects';
import _ from 'lodash';
import {
	deleteNotiNewsByCode,
	logDevice,
	clearAllItemFromLocalStorage
} from '~/lib/base/functionUtil';
import SearchNewActions from './search_new.reducer';

import * as Util from '~/util';
import * as NewsBusiness from '~/streaming/news';

export function* getNewData({ symbol: symAsParams }) {
	const { pageSize, lastId } = yield select((state) => state.searchNews);
	try {
		let symbol = '';
		if (!symAsParams) {
			symbol = yield select((state) => state.searchDetail.symbol);
		} else symbol = symAsParams;
		const stringQuery = yield call(Util.encodeSymbol, symbol);
		const { code, data: listNews = [], last_id: newLastId } = yield call(
			NewsBusiness.getAllDataNews,
			'All',
			stringQuery,
			lastId,
			pageSize
		);

		yield put(
			SearchNewActions.getNewDataSuccess(listNews, false, newLastId, code)
		); // Update last id để call tiếp
	} catch (error) {
		yield put(SearchNewActions.getNewDataSuccess([], false, lastId)); // Get lỗi vẫn lưu lại lastId để call lại
		logDevice('info', `Universal Search getDataNews Exception: ${error}`);
	}
}
