import * as Url from './url'
import Enum from '../../enum'
import * as Http from './http'
import * as PureFunc from '../../utils/pure_func'
import * as Controller from '../../memory/controller'
import { urlLogTest as UrlLogTest } from '../../config'

const METHOD = Enum.METHOD
const MAX_LEN_PATH = Enum.MAX_LEN_PATH
const REQ_KEY = Enum.REQ_KEY

//  #region BASE
function getOption(method, { url, data, timeout, reSend, notHeader, bypassLog }) {
	return {
		url,
		data,
		timeout,
		notHeader,
		bypassLog,
		token: Controller.getAccessToken(),
		reSend: PureFunc.getBooleanable(reSend, false)
	}
}

/*
    option = {
        url: string, require,
        data: any, defaul: null,
        timeout: number, defaul: null,
        reSend: Boolean, defaul: false,
        notHeader: Boolean, defaul: false
        bypassLog: Boolean, defaul: false
    }
*/
function get(opt) {
	const option = getOption(METHOD.GET, opt)
	return Http.get(option)
}
function post(opt) {
	const option = getOption(METHOD.POST, opt)
	return Http.post(option)
}
function put(opt) {
	const option = getOption(METHOD.PUT, opt)
	return Http.put(option)
}
function del(opt) {
	const option = getOption(METHOD.DELETE, opt)
	return Http.del(option)
}
//  #endregion

//  #region POST LOG
export function postLogInfoTest(text) {
	Http.post({
		url: UrlLogTest.info,
		data: text,
		notHeader: true,
		bypassLog: true
	})
}
export function postLogWarningTest(text) {
	Http.post({
		url: UrlLogTest.warning,
		data: text,
		notHeader: true,
		bypassLog: true
	})
}
export function postLogErrorTest(text) {
	Http.post({
		url: UrlLogTest.error,
		data: text,
		notHeader: true,
		bypassLog: true
	})
}
//  #endregion

//  #region PORTFOLIO
export function getPortfolio(accountId) {
	if (!accountId) return Promise.resolve({})
	const option = {
		url: Url.urlPortfolio(accountId)
	}
	return get(option)
}
//  #endregion

//  #region LV1, LV2, COS
export async function getLv1Delay(listSymbolObject) {
	return new Promise(async resolve => {
		try {
			if (!PureFunc.arrayHasItem(listSymbolObject)) return resolve([])

			const dicExchange = {}
			listSymbolObject.map(item => {
				dicExchange[item.exchange] = dicExchange[item.exchange] || []
				dicExchange[item.exchange].push(item.symbol)
			})

			const listPromise = []
			Object.keys(dicExchange).map(exchange => {
				const listSymbol = dicExchange[exchange]
				const listSymbolString = PureFunc.getStringSymbol(listSymbol)

				listSymbolString.map(strSymbol => {
					const option = {
						url: Url.urlLv1Delay(exchange, strSymbol)
					}
					listPromise.push(get(option))
				})
			})

			const response = await Promise.all(listPromise)
			const listPrice = []

			response.map((result = []) => {
				listPrice.push(...result)
			});
			return resolve(listPrice)
		} catch (error) {
			return resolve([])
		}
	})
}
//  #endregion

//  #region WATCHLIST
export function updatePriceBoard(priceboardId, userId, newPriceboard) {
	const option = {
		url: Url.urlUpdatePriceboard(priceboardId, userId),
		data: newPriceboard
	}
	return put(option)
}
//  #endregion

//  #region SYMBOL
export function getSymbol(listSymbol = []) {
	return new Promise(resolve => {
		const listPath = PureFunc.getValidPath(listSymbol, MAX_LEN_PATH)
		const listResult = []
		const listPromise = []
		listPath.map(path => {
			const option = {
				url: Url.urlSymbol(path)
			}
			listPromise.push(get(option))
		})
		Promise.all(listPromise)
			.then((listRes = []) => {
				listRes.map(res => {
					listResult.push(...res)
				})
				resolve(listResult)
			})
			.catch(() => resolve([]))
	})
}
//  #endregion
