'use strict';
import Big from 'big.js';
import initialState from '../../reducers/initialState';
import { func, storage } from '../../storage';
import * as api from '../../api';
import { logDevice, mergeArrayOfObject } from '../../lib/base/functionUtil';

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
					listSearch = mergeArrayOfObject(data, listSearch, 'symbol', 30)
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
