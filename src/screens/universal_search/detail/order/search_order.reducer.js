import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

import listFilterType from '~/constants/filter_type';

const PAGE = 10;
const initialData = {};
_.forEach(listFilterType, value => {
	initialData[value] = {
		quantity: PAGE,
		listData: [],
		isLoading: true,
		isMore: false
	};
});
/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	loadDataOrders: ['filterType'],
	setListOrderData: ['data', 'filterType'],
	loadMoreOrderData: ['filterType'],
	resetAllQuantityOrder: null,
	resetOrderData: ['filterType'],
	resetStateListOrder: ['filterType']
});

export const SearchOrderTypes = Types;
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	listOrderData: initialData
});

export const setListOrderData = (state, { data, filterType }) => {
	return state.setIn(['listOrderData', filterType], data);
};

export const resetAllQuantityOrder = state => {
	let newState = state;
	_.forEach(listFilterType, value => {
		newState = newState.setIn(['listOrderData', value, 'quantity'], PAGE);
	});
	return newState;
};

export const resetOrderData = (state, { filterType }) => {
	return state.setIn(['listOrderData', filterType, 'isLoading'], false);
};

export const resetStateListOrder = (state, { filterType }) => {
	let newState = state;
	const curList = filterType ? [filterType] : listFilterType;
	_.forEach(curList, value => {
		newState = newState.setIn(['listOrderData', value, 'quantity'], PAGE);
		newState = newState.setIn(['listOrderData', value, 'listData'], []);
		newState = newState.setIn(['listOrderData', value, 'isLoading'], true);
		newState = newState.setIn(['listOrderData', value, 'isMore'], false);
	});
	return newState;
};

export const loadMoreOrderData = (state, { filterType }) => {
	const { quantity: currentQuantity } = state.listOrderData[filterType];
	let newState = state;
	newState = newState.setIn(
		['listOrderData', filterType, 'quantity'],
		currentQuantity + PAGE
	);

	return newState;
};

/* ------------- Reducers ------------- */
export const loadDataOrders = (state, { filterType }) => {
	return state.setIn(['listOrderData', filterType, 'isLoading'], true);
};
export const reducer = createReducer(INITIAL_STATE, {
	[Types.LOAD_DATA_ORDERS]: loadDataOrders,
	[Types.SET_LIST_ORDER_DATA]: setListOrderData,
	[Types.LOAD_MORE_ORDER_DATA]: loadMoreOrderData,
	[Types.RESET_ALL_QUANTITY_ORDER]: resetAllQuantityOrder,
	[Types.RESET_ORDER_DATA]: resetOrderData,
	[Types.RESET_STATE_LIST_ORDER]: resetStateListOrder
});
