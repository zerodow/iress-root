import _ from 'lodash';
import { channel } from 'redux-saga';
import { select, put, call, take } from 'redux-saga/effects';

import { getSymbolInfoApi, searchResponse } from '~/lib/base/functionUtil';
import * as Controller from '~/memory/controller';
import SearchActions from './search_universal.reducer';
import * as actions from '../universal_search.actions';
import { func } from '~/storage';
import * as api from '~/api';

import ENUM from '~/enum';
const { SYMBOL_CLASS_QUERY } = ENUM;

export function* uniSearchSetSymbolClass() {
	const { textSearch } = yield select(state => state.uniSearch);
	yield put(SearchActions.uniSearchGetResult(textSearch, false));
}

function* getClassQuery() {
	const { selectedClass } = yield select(state => state.uniSearch);
	return SYMBOL_CLASS_QUERY[selectedClass];
}

function* searching(textSearch) {
	const classQuery = yield getClassQuery();

	const cbChannel = yield call(channel);
	const cb = listSymbol => cbChannel.put({ listSymbol });
	searchResponse({ textSearch, cb, classQuery });

	const { listSymbol } = yield take(cbChannel);
	if (_.isEmpty(listSymbol)) {
		yield put(SearchActions.uniSearchGetResultSuccess([]));
		return;
	}

	const { symbol, company_name: companyName, company } = listSymbol[0] || {};

	// if (this.unSubRealtimeSearchDetail) {
	// 	this.unSubRealtimeSearchDetail(this.state.symbol);
	// }

	// put
	yield put(SearchActions.uniSearchGetResultSuccess(listSymbol));

	// this.reloadSearchDetail(symbol);
	if (listSymbol.length === 1) {
		yield put(actions.writeDataSuccess());
		const curCompany = companyName || company || '';
		yield put(
			actions.saveHistory({
				symbol,
				company: curCompany
			})
		);
	}
}

function* showSearchHistory() {
	const { selectedClass, historyByClass } = yield select(
		state => state.uniSearch
	);
	const listData = historyByClass[selectedClass] || [];
	yield put(SearchActions.uniSearchGetResultSuccess(listData));
}

export function* uniSearchGetResult({ text }) {
	const textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
	if (textSearch.length > 0) {
		yield searching(textSearch);
	} else {
		yield showSearchHistory();
	}
}

export function* uniSearchGetHistory({ textSearch }) {
	try {
		if (!Controller.getLoginStatus()) {
			throw new Error('user is not login');
		}

		const userId = func.getUserId();
		const urlGet = api.getUrlUserSettingByUserId(userId, 'get');
		const data = yield call(api.requestData, urlGet, true);
		if (!data) {
			throw new Error('response data is Empty');
		}

		const { lang = 'en', search_history: searchHistory = [] } = data || {};
		Controller.setLang(lang);

		// store list history
		yield put(SearchActions.uniSearchFilterHistoryByClass(searchHistory));
		let stringQuery = ``;
		_.map(searchHistory, element => {
			stringQuery += `${element.symbol},`;
		});

		if (stringQuery !== '') {
			const cbChannel = yield call(channel);
			getSymbolInfoApi(stringQuery, () => {
				cbChannel.put('CB_GET_HISTORY_SUCCESS');
			});
			yield take(cbChannel);
			yield put(
				SearchActions.uniSearchGetResult(textSearch, textSearch === '')
			);
		} else {
			yield put(
				SearchActions.uniSearchGetResult(textSearch, textSearch === '')
			);
		}
	} catch (error) {
		yield put(SearchActions.uniSearchGetHistoryFailure(error));
	}
}
