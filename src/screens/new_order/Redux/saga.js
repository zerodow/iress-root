import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import Actions from '~/screens/new_order/Redux/constants.js'
import { getOrderAttributesV2 } from '~/screens/new_order/Controller/ContentController.js'
/**
 * Get Atribute
 */
export function* getAttribute(action) {
    yield put({
        type: Actions.NEW_ORDER_CHANGE_LOADING_ORDER_ATTRIBUTE,
        payload: true
    });
    try {
        yield call(getOrderAttributesV2, {
            symbol: action.payload.symbol,
            exchange: action.payload.exchange,
            cb: () => {

            }
        })
        console.info('action', action)
        yield put({
            type: Actions.NEW_ORDER_CHANGE_LOADING_ORDER_ATTRIBUTE,
            payload: false
        });
    } catch (error) {
        yield put({
            type: Actions.NEW_ORDER_CHANGE_LOADING_ORDER_ATTRIBUTE,
            payload: false
        });
    }
}
export default function* root() {
    yield all([
        takeLatest(Actions.NEW_ORDER_GET_ATTRIBUTE, getAttribute)
    ])
}
