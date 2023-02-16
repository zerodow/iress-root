import firebase from '../../firebase';
import { logAndReport, logDevice } from '../../lib/base/functionUtil';
import { dataStorage } from '../../storage';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';

var perf = null;

export function loadForm(orderId) {
    return dispatch => {
        try {
            perf = new Perf(performanceEnum.load_order_history);
            perf && perf.start();
            dispatch(loadFormRequest());
            const path = `order_history/${orderId}`;
            // console.log('path: ', path);
            const ref = firebase.database().ref(path);
            // console.log('ref: ', ref)
            return ref.orderByChild('updated').on('value', function (snapshot) {
                const data = snapshot.val();
                let arr = [];
                if (data) {
                    arr = Object.keys(data).map((k) => data[k]);
                }
                dispatch(orderHistoryResponse(arr));
                perf && perf.stop();
            });
        } catch (error) {
            logAndReport('loadForm pickerAction exception', error, 'loadForm pickerAction');
            logDevice('indo', `loadForm pickerAction exception ${error}`);
        }
    };
}

export function loadFormRequest() {
    return {
        type: 'ORDER_HISTORY_REQUEST'
    };
}
export function orderHistoryResponse(listData) {
    return {
        type: 'ORDER_HISTORY_RESPONSE',
        listData
    };
}
