import Enum from '~/enum'
import { Keyboard } from 'react-native'
import * as api from '~/api';
import { func, dataStorage } from '~/storage';
import * as Controller from '~/memory/controller'
import { getAccActive, getDicPortfolioType, setReduxAccActive, setAccActive } from '~/screens/portfolio/Model/PortfolioAccountModel.js'
import { setAccActiveLocalStorage } from '~s/portfolio/Controller/PortfolioAccountController'
import { changeLoadingState, resetPLState } from '~s/portfolio/Redux/actions'
import { dispatch } from '~/memory/controller'
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController'
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js'
import { changeAccount } from '~/component/search_account/redux/actions'
let timeout = null

export function handleSelectAccount({ portfolio_name: accountName, portfolio_id: accountId, key, ...rest }) {
    Keyboard.dismiss()
    if (accountName == null) return;
    const preAccountActive = getAccActive()
    if (preAccountActive === accountId) {
        func.setReccentAccount({
            portfolio_name: accountName,
            portfolio_id: accountId,
            ...rest
        })
        return
    }

    dispatch(resetStateNewOrder())
    dispatch(changeAccount(accountId))
    setReduxAccActive(accountId)
    setAccActive(accountId)
    setAccActiveLocalStorage(accountId)
    setTimeout(() => {
        dispatch(changeLoadingState(true))
        dispatch(resetPLState())
        getPortfolioTotal(accountId)
    }, 100)
    // Sub and unsub account reloadApp
    // Controller.subAndPubAccount(accountId)
    // // Set new Account
    // dataStorage.currentAccount = { account_name: accountName, account_id: accountId, ...rest }
    func.setReccentAccount({
        portfolio_name: accountName,
        portfolio_id: accountId,
        ...rest
    })
}
