import Immutable from 'seamless-immutable';
import { filter, pickBy, uniqWith, clone, cloneDeep } from 'lodash'
import TYPE from './constants'
import Enum from '~/enum'
const { ID_ELEMENT, SYMBOL_CLASS, SYMBOL_CLASS_QUERY, NAME_PANEL } = Enum;
export const INITIAL_STATE = Immutable({
    isLoading: true,
    textSearch: '',
    classFilter: SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES],
    dicSymbolExchangeSelected: {}
});
const getNewDicSymbolSelected = (dicSymbolExchangeSelected, payload) => {
    const { key, isSelected } = payload
    const tmp = cloneDeep(dicSymbolExchangeSelected)
    if (tmp[key]) {
        delete tmp[key]
    } else {
        tmp[key] = true
    }
    return tmp
}
export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPE.ADD_SYMBOL_CHANGE_LOADING:
            return state.merge({
                isLoading: action.payload
            })
        case TYPE.ADD_SYMBOL_CHANGE_TEXT:
            return state.merge({
                textSearch: action.payload
            })
        case TYPE.ADD_SYMBOL_CHANGE_CLASS_FITLER:
            return state.merge({
                classFilter: action.payload
            })
        case TYPE.ADD_SYMBOL_CHANGE_DIC_SELECTED_SYMBOL:
            return state.merge({
                dicSymbolExchangeSelected: getNewDicSymbolSelected(state.dicSymbolExchangeSelected, action.payload)
            })
        case TYPE.ADD_SYMBOL_INIT_DIC_SELECTED_SYMBOL:
            return state.merge({
                dicSymbolExchangeSelected: action.payload
            })
        default:
            return state
    }
}
