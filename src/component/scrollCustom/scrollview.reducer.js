import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	SvMeasureResetStack: null,
	SvMeasureSetChildShowed: ['key', 'isShowed'],
	SvMeasureAddChildToStack: ['key', 'child'],
	SvMeasureRemoveChildToStack: ['key']
});

export const ScrollViewTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
	stackChild: {},
	childStatus: {}
});

/* ------------- Reducers ------------- */
// request the avatar for a user
export const SvMeasureResetStack = state =>
	state.merge({ stackChild: {}, childStatus: {} });
export const SvMeasureSetChildShowed = (state, { key, isShowed }) => {
	const childStatus = Immutable.asMutable(state.childStatus);
	childStatus[key] = isShowed;
	return state.merge({ childStatus });
};
export const SvMeasureaddChildToStack = (state, { key, child }) => {
	const stack = Immutable.asMutable(state.stackChild);
	stack[key] = child;
	return state.merge({ stackChild: stack });
};

export const SvMeasureRemoveChildToStack = (state, { key }) => {
	const stack = Immutable.asMutable(state.stackChild);
	return state.merge({ stackChild: _.omit(stack, [key]) });
};

export const reducer = createReducer(INITIAL_STATE, {
	[Types.SV_MEASURE_RESET_STACK]: SvMeasureResetStack,

	[Types.SV_MEASURE_SET_CHILD_SHOWED]: SvMeasureSetChildShowed,
	[Types.SV_MEASURE_ADD_CHILD_TO_STACK]: SvMeasureaddChildToStack,
	[Types.SV_MEASURE_REMOVE_CHILD_TO_STACK]: SvMeasureRemoveChildToStack
});
