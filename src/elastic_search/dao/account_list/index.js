import { and, or, like, equal, getBodyData, sort, gte, lte } from '../commons/search/index';
import * as Controller from '~/memory/controller'

export function getAccountListByAccountIdAndStatus(status = 'active') {
    return (
        getBodyData(
            and(
                equal('status', status),
                or([equal('account_id', '123457'), equal('account_id', '020001')])
            ),
            sort({
                'account_id': 'asc'
            })
        )
    );
}

export function filterAccountByTextSearch(status = 'active', text = '') {
    return (
        getBodyData(
            and(
                equal('status', status),
                or(
                    like('account_id', text),
                    like('account_name', text)
                )
            ),
            sort()
        )
    );
}
/**
 * Get 5 account active of  user operator
 */
export function getTopFiveAcountActive(pageSize, pageId) {
    return `${Controller.getBaseUrl()}/${Controller.getVersion('version')}/search/account?page_size=${pageSize}&page_id=${pageId}`
}
