import Immutable from 'seamless-immutable';
import TYPE from './constants'
export const INITIAL_STATE = Immutable({
    isLoadingErrorSystem: false
});
export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case TYPE.ERROR_SYSTEM_CHANGE_LOADING:
            return state.merge({
                isLoadingErrorSystem: action.payload
            })
        default:
            return state
    }
}
