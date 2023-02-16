import Immutable from 'seamless-immutable';

import TYPE from './constants'
import Enum from '~/enum'
const { ID_ELEMENT, SYMBOL_CLASS, SYMBOL_CLASS_QUERY, NAME_PANEL } = Enum;
export const INITIAL_STATE = Immutable({
    isLoading: true,
    textSearch: '',
    classFilter: SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES]
});
export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPE.SEARCH_SYMBOL_CHANGE_LOADING:
            return state.merge({
                isLoading: action.payload
            })
        case TYPE.SEARCH_SYMBOL_CHANGE_TEXT:
            return state.merge({
                textSearch: action.payload
            })
        case TYPE.SEARCH_SYMBOL_CHANGE_CLASS_FITLER:
            return state.merge({
                classFilter: action.payload
            })
        case TYPE.SEARCH_SYMBOL_RESET:
            return state.merge({
                isLoading: true,
                textSearch: '',
                classFilter: SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES]
            })
        default:
            return state
    }
}
