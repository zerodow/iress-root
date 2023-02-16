import { func, dataStorage } from './../../storage';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import { requestData, getReportUrl } from '../../api';
import apiReportEnum from '../../constants/api_report_enum';
import { logAndReport, logDevice } from '../../lib/base/functionUtil';

var perf = null;

export function loadDataFrom(fromDate, toDate, now) {
    return dispatch => {
        try {
            perf = new Perf(performanceEnum.load_data_report_cash_summary);
            perf && perf.start();
            dispatch(loadFromRequest());
            const url = `${getReportUrl(apiReportEnum.CASH, dataStorage.accountId, fromDate, toDate)}`;
            requestData(url).then(data => {
                const dataReport = data || {};
                loadFormResponse(dataReport, dispatch);
            });
        } catch (error) {
            logAndReport(`Report Cash Account Summary Error ${error}`);
            logDevice('info', `Report Cash Account Summary Error ${error}`);
        }
    };
}
export function loadFromRequest() {
    return {
        type: 'CASH_ACCOUNT_SUMMARY_LOAD_FORM_REQUEST'
    };
}

export function loadFormResponse(data, dispatch) {
    perf && perf.stop();
    dispatch(loadFormResponseEvent(data));
}

export function loadFormResponseEvent(payload) {
    return {
        type: 'CASH_ACCOUNT_SUMMARY_LOAD_FORM_RESPONSE',
        payload
    };
}
