import Enum from '~/enum'
import * as api from '~/api';
import { func, dataStorage } from '~/storage';
import { filterAccountByTextSearch } from '~/elastic_search/dao/account_list/index'
import { filterListPortfolioType, getListPortfolioType, getIsSearchAccount } from '~s/portfolio/Model/PortfolioAccountModel'
import { searchAccount } from '~/screens/portfolio/Controller/PortfolioAccountController.js'
let timeout = null
export function getAllListPortfolioType(resolve) {
    setTimeout(() => {
        resolve(getListPortfolioType())
    }, 300);
}
export function search({
    textSearch
}) {
    if (textSearch === '') {
        return new Promise(resolve => {
            /**
             * Neu search thi se lay list recent. Nguoc lai se lay all list local
             */
            if (getIsSearchAccount()) {
                func.getReccentAccount().then(data => {
                    resolve(data)
                }).catch(e => {
                    resolve([])
                })
            } else {
                getAllListPortfolioType(resolve)
            }
        })
    }
    /**
     * Neu khong phai search account thi se search local
     */
    if (!getIsSearchAccount()) {
        const listPortfolioType = filterListPortfolioType(textSearch)
        return new Promise((resolve) => {
            if (timeout) clearTimeout(timeout)
            timeout = setTimeout(() => {
                resolve(listPortfolioType)
            }, 500);
        })
    }
    return new Promise((resolve) => {
        searchAccount({ textFilter: textSearch }).then(data => resolve(data)).catch(e => resolve([]))
    })
    /**
         * Neu la search thi se search thong qua api
    */
    const pageID = 1;
    const pageSize = 30;
    const url = api.getURLTopAccountActive(pageSize, pageID)
    const bodyData = filterAccountByTextSearch(Enum.STATUS_ACCOUNT.ACTIVE, textSearch)
    return new Promise(resolve => {
        api.postData(url, bodyData)
            .then(res => {
                let listAccounts = res.data || []
                if (listAccounts.length) {
                    listAccounts = listAccounts.filter(e => {
                        const status = e.status || 'active'
                        return status === 'active'
                    })
                }
                return resolve(listAccounts)
            })
            .catch(err => {
                resolve([])
            })
    })
}
