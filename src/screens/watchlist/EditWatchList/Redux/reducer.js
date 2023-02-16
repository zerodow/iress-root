import Immutable from 'seamless-immutable';

import TYPE from './constants'
import { Data } from '~/screens/watchlist/EditWatchList/data.js'
const INITIAL_STATE = Immutable({
    dataSelected: {},
    priceBoard: {
        watchlist: null,
        watchlist_name: null,
        init_time: null,
        value: [],
        use_id: null
    },
    keyTopIndex: null,
    preTopIndex: null
})
export default function reducer(state = INITIAL_STATE, action) {
    try {
        switch (action.type) {
            case TYPE.UPDATE_PRICEBOARD:
                // state.getIn()
                return state.merge({ priceBoard: action.payload })
            case TYPE.UPDATE_LIST_SYMBOL:
                return state.setIn(['priceBoard', 'value'], action.payload)
            case TYPE.UPDATE_LIST_SYMBOL_BY_DELETE:
                return state.setIn(['priceBoard', 'value'], action.payload.listSymbol)
                    .setIn(['dataSelected'], {})
                    .setIn(['preTopIndex'], state.getIn(['keyTopIndex']))
                    .setIn(['keyTopIndex'], action.payload.keyTop)
            case TYPE.UPDATE_SELECTED:
                return state.merge({ dataSelected: action.payload })
            case TYPE.UPDATE_TOP_INDEX:
                const preTopIndex = state.getIn(['keyTopIndex'])
                return state
                    .setIn(['priceBoard', 'value'], action.payload.listSymbol)
                    .merge({ keyTopIndex: action.payload.keyTopIndex, preTopIndex: preTopIndex })
            case TYPE.INITIAL_STATE:
                return state.merge(action.payload)
            case TYPE.RESET_STATE:
                return Immutable({
                    dataSelected: {},
                    priceBoard: {
                        watchlist: null,
                        watchlist_name: null,
                        init_time: null,
                        value: [],
                        use_id: null
                    },
                    keyTopIndex: null,
                    preTopIndex: null
                })
            default:
                return state
        }
    } catch (error) {
        return state
    }
}
