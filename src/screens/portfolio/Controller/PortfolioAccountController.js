import * as Api from '~/api'
import {
    getAccessMode, getListPortfolioType, setListPortfolioType,
    getLastAccActive, setLastAccActive, setAccActive, setReduxAccActive,
    getDicPortfolioType, setIsSearchAccount, getIsSearchAccount, filterListPortfolioType
} from '../Model/PortfolioAccountModel'
import { dataStorage, func } from '~/storage'
import AsyncStorage from '~/manage/manageLocalStorage';
import * as Controller from '~/memory/controller'
export function setAccActiveLocalStorage(acc) {
    if (!acc) return
    const key = `portfolio_last_acc_${dataStorage.emailLogin}`
    const value = acc.toString()
    AsyncStorage.setItem(key, value, (err) => {
        console.log('SET LAST ACC PORTFOLIO', err)
    })
}

export function getAccActiveLocalStorage() {
    return new Promise(resolve => {
        const lastAccount = getLastAccActive()
        if (lastAccount) return resolve(lastAccount)
        const key = `portfolio_last_acc_${dataStorage.emailLogin}`
        AsyncStorage.getItem(key)
            .then(res => {
                console.log('GET LAST ACC PORTFOLIO', res)
                resolve(res)
            })
            .catch(err => {
                console.log('GET LAST ACC PORTFOLIO ERROR', err)
                resolve(null)
            })
    })
}
export function getPortfolioTypeAll() {
    return new Promise((resolve) => {
        const listPortfolioType = getListPortfolioType()
        if (listPortfolioType) return resolve(listPortfolioType)
        const accessMode = getAccessMode()
        const url = Api.getUrlPortfolioType(accessMode)
        Api.requestData(url, true, null, true)
            .then(res => {
                setListPortfolioType(res.data)
                resolve(res.data)
            })
            .catch(err => {
                resolve(null)
            })
    })
}
export function getPortfolioType() {
    return new Promise((resolve) => {
        const listPortfolioType = getListPortfolioType()
        if (listPortfolioType) return resolve(listPortfolioType)
        const accessMode = getAccessMode()
        const url = Api.getUrlPortfolioType(accessMode, `page_size=7`)
        Api.requestData(url, true, null, true)
            .then(res => {
                setListPortfolioType(res.data)
                resolve(res.data)
            })
            .catch(err => {
                resolve(null)
            })
    })
}
export function searchAccount({ textFilter = '' }) {
    return new Promise((resolve) => {
        const accessMode = getAccessMode()
        const url = Api.getUrlPortfolioType(accessMode, `text_filter=${textFilter}`)
        Api.requestData(url, true, null, true)
            .then(res => {
                if (res && res.data && res.data.length > 0) {
                    return resolve(res.data)
                }
                return resolve([])
            })
            .catch(err => {
                resolve([])
            })
    })
}
export function checkAccountHaveMapping({ accountId }) {
    return new Promise((resolve) => {
        const listPortfolioType = getListPortfolioType()
        if (listPortfolioType) return resolve(listPortfolioType)
        const accessMode = getAccessMode()
        const url = Api.getUrlPortfolioType(accessMode, `text_filter=${accountId}`)
        Api.requestData(url, true, null, true)
            .then(res => {
                if (res && res.data && res.data.length > 0) {
                    return resolve(res.data)
                }
                return resolve([])
            })
            .catch(err => {
                resolve([])
            })
    })
}
export function checkIsSearchAccount(listPortfolioType = []) {
    const length = listPortfolioType.length
    if (length > 5) {
        return setIsSearchAccount(true)
    }
    return setIsSearchAccount(false)
}
export function checkLassAccountHaveMapping(lastAccount) {

}
const merge = (arr1, arr2, prop) => {
    const resultMap = new Map(arr1.map((item) => [item[prop], item]));
    arr2.forEach((item) => {
        const mapItem = resultMap.get(item[prop]);
        if (mapItem) Object.assign(mapItem, item);
        else resultMap.set(item[prop], item);
    });
    return [...resultMap.values()];
};
export function updateListPortfolioType(item) {
    const tmp = merge(getListPortfolioType(), [item], 'portfolio_id')
    setListPortfolioType(tmp, false)
}
export async function getPortfolioTypeAndLastAccount() {
    console.info('TOken', Controller.getAccessToken())
    return new Promise((resolve, reject) => {
        getAccActiveLocalStorage().then(lastAccount => {
            Promise.all([
                getPortfolioType(),
                checkAccountHaveMapping({ accountId: lastAccount })
            ])
                .then(res => {
                    let [listPortfolioType, isHaveMapping, allAccount] = res
                    if (listPortfolioType) {
                        checkIsSearchAccount(listPortfolioType)
                        if (isHaveMapping.length > 0) {
                            const tmp = merge(listPortfolioType, isHaveMapping, 'portfolio_id')
                            setListPortfolioType(tmp)
                        } else {
                            setListPortfolioType(listPortfolioType)
                        }
                        setReduxAccActive((listPortfolioType[0] || {}).portfolio_id)
                        setAccActive((listPortfolioType[0] || {}).portfolio_id)
                    }
                    const isAccountMapping = isHaveMapping.length > 0
                    if (lastAccount && isAccountMapping) {
                        setLastAccActive(lastAccount)
                        setReduxAccActive(lastAccount)
                        setAccActive(lastAccount)
                    } else {
                        setLastAccActive((listPortfolioType[0] || {}).portfolio_id)
                    }
                    resolve()
                })
                .catch(err => {
                    resolve()
                })
        })
    })
}
