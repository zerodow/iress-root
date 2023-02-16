import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
    addAnimator: ['aniKey', 'aniElement'],
    removeAnimator: ['aniKey']
});
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
    // animator: {}
})
/* ------------- Reducers ------------- */
export const addAnimator = (state, { aniKey, aniElement }) => {
    let obj = {}
    if (!state[aniKey]) {
        obj[aniKey] = aniElement
    }
    return state.merge(obj)
}

export const removeAnimator = (state, { aniKey, aniElement }) => {
    if (state[aniKey]) {
        return state.without(aniKey);
    }
    return state
}

export const reducer = createReducer(INITIAL_STATE, {
    [Types.ADD_ANIMATOR]: addAnimator,
    [Types.REMOVE_ANIMATOR]: removeAnimator
});
