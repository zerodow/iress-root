import * as Api from '~/api'
import { getAccessMode, getAccActive } from '../Model/PortfolioAccountModel'
import { getPortfolioType } from './PortfolioAccountController'
import { dispatch } from '~/memory/controller'
import { storePortfolioTotal } from '../Redux/actions'
import { isErrorSystemByCode } from '~/component/error_system/Controllers/ErrorSystem.js'
export function getPortfolioTotal(accountId) {
    dispatch(storePortfolioTotal({}));
    return new Promise(async resolve => {
        const accessMode = getAccessMode()
        let portfolioCode = accountId
        let listPortfolioType
        if (!portfolioCode && portfolioCode !== '') {
            listPortfolioType = await getPortfolioType()
            const defaultAcc = listPortfolioType[0] || {}
            portfolioCode = defaultAcc.portfolio_id
        }
        const url = Api.getUrlTotalPortfolio({ portfolioCode, accessMode })
        Api.requestData(url, true, null, true)
            .then(res => {
                if (accountId !== getAccActive()) return
                // res.currency = 'KRW' // Fake currency
                resolve(res)
                if (isErrorSystemByCode(res)) return
                dispatch(storePortfolioTotal(res))
            })
            .catch(err => {
                if (accountId !== getAccActive()) return
                resolve(res)
            })
    })
}
export function getPortfolioBalance(accountId, symbol, exchange) {
    const url = Api.getUrlPortfolioBalace({ accountId, symbol, exchange })
    return new Promise((resolve) => {
        Api.requestData(url, true, null, true)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                resolve({})
            })
    })
}
