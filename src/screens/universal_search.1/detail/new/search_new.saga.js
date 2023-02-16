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
import ENUM from '~/enum';
const { NEWS_STATUS_CODE } = ENUM;
export function* getNewData({ symbol: symAsParams }) {
	const { pageSize, lastId, isMoreNews } = yield select(
		(state) => state.searchNews
	);
	try {
		let symbol = '';
		if (!symAsParams) {
			symbol = yield select((state) => state.searchDetail.symbol);
		} else symbol = symAsParams;
		const stringQuery = yield call(Util.encodeSymbol, symbol);
		const {
			data: listNews = [],
			last_id: newLastId,
			status_code: statusCode,
			code
		} = yield call(
			NewsBusiness.getAllDataNews,
			'All',
			stringQuery,
			lastId,
			pageSize
		);
		const isNoMore =
			statusCode === NEWS_STATUS_CODE.END_SESSION ||
			_.size(listNews) < pageSize;
		yield put(
			SearchNewActions.getNewDataSuccess(
				listNews,
				!isNoMore,
				newLastId,
				code
			)
		); // Update last id để call tiếp
	} catch (error) {
		yield put(SearchNewActions.getNewDataSuccess([], isMoreNews, lastId)); // Get lỗi vẫn lưu lại lastId để call lại
		logDevice('info', `Universal Search getDataNews Exception: ${error}`);
	}
}
