import { call, select, put, delay } from 'redux-saga/effects';
import moment from 'moment';
import _ from 'lodash';

import * as api from '~/api';
import { dataStorage } from '~/storage';
import { deleteNotiOrderByCode, logDevice } from '~/lib/base/functionUtil';
import SearchOrderActions from './search_order.reducer';
import filterType from '~/constants/filter_type';

const { CANCELLED, FILLED, WORKING, STOPLOSS } = filterType;

const Tag = {
	WORKING: 'open',
	STOPLOSS: 'stoploss',
	FILLED: 'filled',
	CANCELLED: 'cancelled'
};

const RANGE = 10;

export function* loadDataOrders({ filterType }) {
	const { symbol } = yield select(state => state.searchDetail);
	const { listOrderData } = yield select(state => state.searchOrder);
	const { quantity, listData } = listOrderData[filterType] || {};
	try {
		let orderUrl = '';
		const tag = Tag[filterType];
		const endTime = moment()
			.add(1, 'days')
			.startOf('day')
			.valueOf();
		const startTime = moment(endTime)
			.subtract(1, 'years')
			.startOf('day')
			.valueOf();
		const { accountId } = dataStorage;

		const curPage = Math.max(quantity / RANGE, 1)
		if (filterType === CANCELLED || filterType === FILLED) {
			orderUrl = api.getUrlOrderByTag2(tag, accountId, curPage, RANGE, symbol, startTime, endTime);
		} else {
			orderUrl = api.getUrlOrderByTag2(tag, accountId, curPage, RANGE, symbol);
		}
		let response = null;
		try {
			response = yield call(api.requestData, orderUrl, true);
		} catch (error) {
			logDevice('info', 'get order api failed');
		}
		if (!_.isEmpty(response)) {
			const {
				total_count: totalCount,
				total_pages: totalPage,
				current_page: currentPage,
				data
			} = response

			let newData;
			if (_.isEmpty(listData)) {
				newData = data
			} else newData = data.concat(listData)
			const newListData = _.orderBy(newData, ['updated'], ['desc']);

			yield put(
				SearchOrderActions.setListOrderData(
					{
						quantity,
						listData: newListData,
						isLoading: false,
						isMore: totalCount > quantity
					},
					filterType
				)
			);
			// const listData = _.orderBy(data, ['init_time'], ['desc']);
			// let isMore = false;
			// let listDataOfSymbol = [];

			// _.forEach(listData, element => {
			// 	const { symbol: symbolOfElement } = element;
			// 	if (symbol === symbolOfElement) {
			// 		listDataOfSymbol.push(element);
			// 	}
			// });

			// if (_.size(listDataOfSymbol) > quantity) {
			// 	listDataOfSymbol = listDataOfSymbol.slice(0, quantity);
			// 	isMore = true;
			// }

			// const accountId = dataStorage.accountId;
			// const type = filterType === WORKING ? 'working' : tag;
			// deleteNotiOrderByCode(type, this.symbol, accountId);
			// yield delay(100);
			// yield put(
			// 	SearchOrderActions.setListOrderData(
			// 		{
			// 			quantity,
			// 			listData: listDataOfSymbol,
			// 			isLoading: false,
			// 			isMore
			// 		},
			// 		filterType
			// 	)
			// );
		} else {
			yield delay(100);
			yield put(SearchOrderActions.resetOrderData(filterType));
		}
	} catch (error) {
		yield delay(100);
		yield put(SearchOrderActions.resetOrderData(filterType));
		logDevice(
			'info',
			`Universal Search loadDataWorkingOrders exception: ${error}`
		);
	}
}
