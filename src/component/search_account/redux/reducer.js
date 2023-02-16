import Immutable from 'seamless-immutable';

import TYPE from './constants'
export const INITIAL_STATE = Immutable({
    isLoading: true,
    textSearch: '',
    isSearch: false
});
export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPE.SEARCH_ACCOUNT_CHANGE_LOADING:
            return state.merge({
                isLoading: action.payload
            })
        case TYPE.SEARCH_ACCOUNT_CHANGE_TEXT:
            return state.merge({
                textSearch: action.payload
            })
        case TYPE.SEARCH_ACCOUNT_CHANGE_IS_SEARCH:
            return state.merge({
                isSearch: action.payload
            })
        default:
            return state
    }
}
