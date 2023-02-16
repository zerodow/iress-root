import * as Api from '~/api.js'
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'
import { size, uniq } from 'lodash'
import ENUM from '~/enum'
import { dataStorage, func } from '~/storage'
import { getStartDay, getEndDay } from '~/lib/base/functionUtil'
import * as Controller from '~/memory/controller'
import * as WrapperHeaderController from './wrapper_header_controller'
import { isErrorSystemByCode } from '~/component/error_system/Controllers/ErrorSystem.js'
import { getRandomKey } from '~/util'
import I18n from '~/modules/language/'
const { TIME_OPEN_NEWS } = ENUM

let requestID = null

function genRequestID() {
    requestID = getRandomKey()
    return requestID
}

function getVendorQuery() {
    try {
        let vendorCode = 'vendor_code='
        const listVendorId = HeaderModel.getListVendorIdSelected()
        if (size(listVendorId) === 0) return ''
        const listVenderIdQuery = Object.keys(listVendorId).toString()
        vendorCode = `${vendorCode}${listVenderIdQuery}`
        return vendorCode
    } catch (error) {
        return ''
    }
}
export function getTimeByDuration(duration = HeaderModel.CONSTANTS.DURATION.WEEK) {
    let fromGTD = getStartDay(-6)
    let toGTD = getEndDay(0)
    switch (duration) {
        case HeaderModel.CONSTANTS.DURATION.DAY:
            fromGTD = getStartDay(0)
            toGTD = getEndDay(0)
            break;
        case HeaderModel.CONSTANTS.DURATION.WEEK:
            fromGTD = getStartDay(-6)
            toGTD = getEndDay(0)
            break
        case HeaderModel.CONSTANTS.DURATION.MONTH:
            fromGTD = getStartDay(-30)
            toGTD = getEndDay(0)
            break
        case HeaderModel.CONSTANTS.DURATION.QUARTER:
            fromGTD = getStartDay(-30 * 3)
            toGTD = getEndDay(0)
            break
        case HeaderModel.CONSTANTS.DURATION.YEAR:
            fromGTD = getStartDay(-365)
            toGTD = getEndDay(0)
            break
        default:
            fromGTD = new Date(1)
            toGTD = getEndDay(0)
            break;
    }
    return {
        fromGTD,
        toGTD
    }
}
function getDurationQuery() {
    const duration = HeaderModel.getDuration()
    let { fromGTD, toGTD } = getTimeByDuration(duration)
    fromGTD = fomatDate(new Date(fromGTD))
    toGTD = fomatDate(new Date(toGTD))
    if (duration === HeaderModel.CONSTANTS.DURATION.CUSTOM) return ''
    return `from_date=${fromGTD}&to_date=${toGTD}`
}
function getCategoryQuery() {
    try {
        let categoryIdQuery = 'category_id='
        const categorySelect = HeaderModel.getListCategorySelected()
        if (size(categorySelect) === 0) return ''
        const categoryData = HeaderModel.getDataCategory()
        const parent = WrapperHeaderController.getParent(categoryData)
        const dataCategoryObj = WrapperHeaderController.formatDataWithParent2(categoryData, parent)
        const filtered = Object.keys(categorySelect)
            .filter(key => {
                console.log(key)
                return (categorySelect[key] && !dataCategoryObj[key]) || (categorySelect[key] && dataCategoryObj[key].children.length === 0)
            }).toString()
        return `${categoryIdQuery}${filtered}`
    } catch (error) {
        return ''
    }
}
export function fomatDate(dateTime = new Date()) {
    let date = dateTime.getDate()
    let month = dateTime.getMonth() + 1
    date = date < 10 ? `0${date}` : date
    month = month < 10 ? `0${month}` : month
    return `${dateTime.getFullYear()}-${month}-${date}`
}
function getCustomDateQuery() {
    const duration = HeaderModel.getDuration()
    if (duration !== HeaderModel.CONSTANTS.DURATION.CUSTOM) return ''
    const fromGTD = fomatDate(new Date(HeaderModel.getFromGTD()))
    const toGTD = fomatDate(new Date(HeaderModel.getToGTD()))
    console.log('DCM search getCustomDateQuery', fromGTD, toGTD)
    return `from_date=${fromGTD}&to_date=${toGTD}`
}
function getFilterQuery() {
    let filterQuery = 'text_filter='
    const filter = encodeURIComponent(HeaderModel.getFilter())
    if (!filter) return ''
    return `${filterQuery}${filter}`
}

function createStringQuery() {
    let stringQuery = ''
    const vendorQuery = getVendorQuery()
    const durationQuery = getDurationQuery()
    const categoryQuery = getCategoryQuery()
    const filterQuery = getFilterQuery()
    const customDateQuery = getCustomDateQuery()
    if (vendorQuery) {
        stringQuery = `${stringQuery}&${vendorQuery}`
    }
    if (durationQuery) {
        stringQuery = `${stringQuery}&${durationQuery}`
    }
    if (categoryQuery) {
        stringQuery = `${stringQuery}&${categoryQuery}`
    }
    if (filterQuery) {
        stringQuery = `${stringQuery}&${filterQuery}`
    }
    if (customDateQuery) {
        stringQuery = `${stringQuery}&${customDateQuery}`
    }

    console.info('VENDOR', vendorQuery)
    console.info('CATEGORY', categoryQuery)
    if (!vendorQuery || !categoryQuery) return '' // Untick all vendor / category thì trả luôn nodata
    return stringQuery.slice(1)
}
const getErrorCode = (code) => {
    if (code === -1) {
        return I18n.t('novendor')
    } else if (code === 1) {
        return I18n.t('newsInvalidCodeExchange')
    } else if (code === 2) {
        return I18n.t('newsInvalidCode')
    } else if (code === 3) {
        return I18n.t('newsInvalidExchange')
    } else if (code === 5) {
        return I18n.t('newsNoAccess')
    }
    return ''
}
export function search(errorCb, hideErrorFn) {
    const newRequestID = genRequestID()
    hideErrorFn && hideErrorFn({ type: 'error' })
    const stringQuery = createStringQuery()
    const url = Api.getNewsIress(stringQuery)
    console.log('URL', url)
    if (!stringQuery) return Promise.resolve([]) // Untick all vendor / category thì trả luôn nodata
    // const dataError = {
    //     'code': 2,
    //     'errorMessage': 'Unable to retrieve News Invalid Code'
    // }
    return new Promise((resolve, reject) => {
        Api.requestDataWithRequestID(url, false, null, false, false, newRequestID).then(data => {
            if (data) {
                const { errorCode, requestID: requestIDResponse, code } = data
                // const { code } = dataError
                // if (requestIDResponse !== requestID) {
                //     console.log('SEARCH RESPONSE !== REQUESTID', requestIDResponse, requestID)
                //     return
                // }
                if (isErrorSystemByCode({ code })) return
                if (code) {
                    errorCb && errorCb(getErrorCode(code))
                    reject()
                } else {
                    resolve(data)
                }
            } else {
                reject()
            }
        }).catch(e => {
            const { errorCode, requestID: requestIDResponse } = e
            if (requestIDResponse !== requestID) {
                console.log('SEARCH RESPONSE !== REQUESTID', requestIDResponse, requestID)
                return
            }
            if (errorCode && ((errorCode + '').toUpperCase() === 'CANCELLED' || (errorCode + '').toUpperCase() === 'CANCELED')) {
                errorCb && errorCb(I18n.t('timeoutUpperCodeErr'))
            } else {
                const { message } = e
                message && errorCb && errorCb(message)
            }
            reject()
        })
    })
}

export function loadMore({ pageSize, lastId }) {
    let stringQuery = createStringQuery()
    if (lastId) {
        stringQuery += `&last_id=${lastId}`
    }
    if (pageSize) {
        stringQuery += `&page_size=${pageSize}`
    }
    const url = Api.getNewsIress(stringQuery)
    console.log('LOG URL LOAD', url, stringQuery)
    console.log('DCM search url', url)
    return new Promise((resolve, reject) => {
        Api.requestData(url).then(data => {
            console.log('LOG DATA LOAD', data)
            if (data) {
                console.log('DCM search new data ', data)
                if (data.errorCode) {
                    reject()
                } else {
                    resolve(data)
                }
            } else {
                reject()
            }
        }).catch(e => {
            reject()
            console.log('DCM search new error ', e)
        })
    })
}
export function checkAndGetTimeUnavailable(data) {
    const liveNews = Controller.getLiveNewStatus()
    if (liveNews) {
        return {
            available: true,
            timeToAvailable: -8888
        }
    }
    const { upGTDd } = data
    const now = new Date().getTime()
    const timeUpdate = new Date(upGTDd).getTime()
    console.log('NEW CONTROLLER checkNewAvailable', now, timeUpdate)
    const distanceToNow = now - timeUpdate
    if (distanceToNow >= TIME_OPEN_NEWS) {
        return {
            available: true,
            timeToAvailable: distanceToNow
        }
    }
    return {
        available: false,
        timeToAvailable: distanceToNow
    }
}
export async function getIressFeedSnapshot(listSymbol = []) {
    const stringQuery = listSymbol.toString()
    const url = Api.getUrlIressFeedSnapshot(stringQuery)
    return Api.requestData(url)
}
export function mapObjectSymboInfo(listSymbol, relatedExchanges) {
    listSymbol = listSymbol.split(',')
    listExchange = relatedExchanges.split(',')
    return listSymbol.map((el, key) => {
        return `${listExchange[key]}#${el}`
    })
}
export function addSymbolInfoToDic(data) {
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element.symbol_info) {
            func.addSymbol({
                ...element.symbol_info
            })
        }
    }
}
export function getListSymbolAndSymbolWithExchange(data) {
    let listSymbol = ''
    let listSymbolWithExchange = []
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const listRelatedSymbol = element.related_symbols || ''
        const listRelatedExchanges = element.related_exchanges || ''
        listSymbolWithExchange = listSymbolWithExchange.concat(mapObjectSymboInfo(listRelatedSymbol, listRelatedExchanges))
        if (listSymbol === '') {
            listSymbol = listSymbol + listRelatedSymbol
        } else {
            listSymbol = listSymbol + ',' + listRelatedSymbol
        }
    }
    return {
        listSymbol: uniq(listSymbol.split(',')),
        listSymbolWithExchange: uniq(listSymbolWithExchange)
    }
}
export function getListSymbolUniq(data) {
    let listSymbol = []
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const listRelatedSymbol = element.related_symbols || []
        listSymbol = listSymbol.concat(listRelatedSymbol)
    }
    return uniq(listSymbol)
}
export function getObjectDataSnapShot(data) {
    let result = {}
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element.price) {
            const {
                symbol, exchange, price: { change_percent: changePercent, change_point: changePoint }
            } = element
            result[`${exchange}#${symbol}`] = {
                symbol: symbol,
                changePercent: changePercent,
                changePoint: changePoint,
                exchange: exchange
            }
        }
    }
    return result
}
