'use strict';
import Big from 'big.js';
import initialState from '../../reducers/initialState';
import { func, storage } from '../../storage';
import * as api from '../../api';
import { logDevice } from '../../lib/base/functionUtil';

export const search = (state = initialState.search, action) => {
	switch (action.type) {
		case 'SEARCH_WRITE_DATA_REQUEST':
			return {
				...state,
				isLoading: true
			};
		case 'SEARCH_WRITE_DATA_SUCCESS':
			return {
				...state,
				isLoading: false
			};
		case 'SEARCH_WRITE_DATA_ERROR':
			return {
				...state,
				isLoading: false,
				error: action.payload
			};
		case 'SAVE_HISTORY_UNIVERSAL_SEARCH':
			const userId = func.getUserId();
			const urlGet = api.getUrlUserSettingByUserId(userId, 'get');
			api.requestData(urlGet, true).then(setting => {
				if (setting) {
					const newSetting = setting || {};
					let listSearch = setting.search_history || [];
					const data = action.payload;
					const checkExist = listSearch.filter(function (obj, i) {
						return obj.symbol === data.symbol;
					});
					if (checkExist.length === 0) {
						if (listSearch.length < 10) {
							listSearch = [data, ...listSearch];
						} else {
							listSearch = listSearch.slice(0, 9);
							listSearch = [data, ...listSearch];
						}
					} else {
						listSearch = listSearch.filter(obj => {
							return obj.symbol !== data.symbol;
						});
						listSearch = [data, ...listSearch];
					}
					newSetting['search_history'] = listSearch;
					const urlPut = api.getUrlUserSettingByUserId(userId, 'put');
					api.putData(urlPut, { data: newSetting })
						.then(data => {
							logDevice(
								'info',
								'save code search to order history success'
							);
						})
						.catch(error => {
							logDevice(
								'info',
								'cannot save code search to order history'
							);
						});
					return {
						...state,
						listHistory: listSearch
					};
				}
				return {
					...state,
					listHistory: []
				};
			});
			return state;
		default:
			return state;
	}
};
