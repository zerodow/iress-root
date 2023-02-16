import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

import { logDevice } from '../../lib/base/functionUtil';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	getTopOrderTransaction: ['symbol', 'isUniversalSearch'],
	getTopOrderTransactionSuccess: ['listOrder'],
	updateTopOrderTransactionSuccess: ['newRecord'],
	getTopOrderTransactionFailure: ['error']
});

export const newOrderTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
	isLoading: true,
	listOrder: []
});

/* ------------- Reducers ------------- */
// request the avatar for a user
export const getTopOrderTransaction = state => state.merge({ isLoading: true });
export const getTopOrderTransactionSuccess = (state, { listOrder }) =>
	state.merge({ isLoading: false, listOrder });
export const updateTopOrderTransactionSuccess = (state, { newRecord }) => {
	const listOrder = Immutable.asMutable(state.listOrder, { deep: true });
	listOrder.unshift(newRecord)
	listOrder.length = 5
	return state.merge({ listOrder });
}
export const getTopOrderTransactionFailure = state => state;

export const reducer = createReducer(INITIAL_STATE, {
	[Types.GET_TOP_ORDER_TRANSACTION]: getTopOrderTransaction,
	[Types.GET_TOP_ORDER_TRANSACTION_SUCCESS]: getTopOrderTransactionSuccess,
	[Types.UPDATE_TOP_ORDER_TRANSACTION_SUCCESS]: updateTopOrderTransactionSuccess,
	[Types.GET_TOP_ORDER_TRANSACTION_FAILURE]: getTopOrderTransactionFailure
});
