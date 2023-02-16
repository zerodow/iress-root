import { call, select, put, delay } from 'redux-saga/effects';
import moment from 'moment';
import _ from 'lodash';

import * as api from '../../../../api';
import { dataStorage } from '~/storage';
import { deleteNotiOrderByCode, logDevice } from '~/lib/base/functionUtil';
import SearchOrderActions from './search_order.reducer';
import filterType from '~/constants/filter_type';
import * as ESOrder from '../../../../elastic_search/dao/order_list/index'; // Elasetic search for order list

const { CANCELLED, FILLED, WORKING, STOPLOSS } = filterType;

const RANGE = 10;

const Tag = {
	WORKING: 'open',
	STOPLOSS: 'stoploss',
	FILLED: 'filled',
	CANCELLED: 'cancelled'
};

// Uncomment this part to switch to elastic search
// export function* loadDataOrders({ filterType }) {
// 	const { symbol } = yield select(state => state.searchDetail);
// 	const { listOrderData } = yield select(state => state.searchOrder);
// 	const { quantity, listData } = listOrderData[filterType] || {};
// 	let dataBody = null;
// 	try {
// 		let orderUrl = '';
// 		const tag = Tag[filterType];
// 		const endTime = moment()
// 			.add(1, 'days')
// 			.startOf('day')
// 			.valueOf();
// 		const startTime = moment(endTime)
// 			.subtract(1, 'years')
// 			.startOf('day')
// 			.valueOf();
// 		const { accountId } = dataStorage;
//
// 		const curPage = Math.max(quantity / RANGE, 1);
// 		orderUrl = ESOrder.getOrderUrl(RANGE, curPage);
// 		if (filterType === CANCELLED || filterType === FILLED) {
// 			dataBody = ESOrder.getOrderListByAccountId(symbol, accountId, tag, startTime, endTime)
// 		} else {
// 			dataBody = ESOrder.getOrderListByAccountId(symbol, accountId, tag)
// 		}
// 		let response = null;
// 		try {
// 			response = yield call(api.requestDataWithBody, orderUrl, dataBody, true);
// 		} catch (error) {
// 			logDevice('info', 'get order api failed');
// 		}
// 		logDevice(
// 			'info',
// 			`Universal Search loadDataOrders response: ${response} url: ${orderUrl}`
// 		);
// 		if (!_.isEmpty(response)) {
// 			let {
// 				total_count: totalCount,
// 				total_pages: totalPage,
// 				current_page: currentPage,
// 				data
// 			} = response
// 			try {
// 				symbol && (data = data.filter(e => e.symbol === symbol))
// 			} catch (error) {
// 				logDevice(
// 					'info',
// 					`Universal Search filter list data loadDataWorkingOrders exception: ${error}`
// 				);
// 			}
// 			let newData;
// 			if (_.isEmpty(listData)) {
// 				newData = data || []
// 			} else {
// 				newData = data.concat(listData)
// 			}
// 			yield put(
// 				SearchOrderActions.setListOrderData(
// 					{
// 						quantity,
// 						listData: newData,
// 						isLoading: false,
// 						isMore: totalCount > quantity
// 					},
// 					filterType
// 				)
// 			);
// 		} else {
// 			yield delay(100);
// 			yield put(SearchOrderActions.resetOrderData(filterType));
// 		}
// 	} catch (error) {
// 		yield delay(100);
// 		yield put(SearchOrderActions.resetOrderData(filterType));
// 		logDevice(
// 			'info',
// 			`Universal Search loadDataWorkingOrders exception: ${error}`
// 		);
// 	}
// }

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
		// console.log('orderUrl = ', orderUrl, symbol)
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
			symbol && (response = response.filter(e => e.symbol === symbol))
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
