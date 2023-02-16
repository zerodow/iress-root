import { dataStorage } from './storage';
import apiTypeEnum from './constants/api_config';
import * as api from './api';
import * as AllMarket from './streaming/all_market';
import * as Controller from './memory/controller';
import * as Req from './network/http/request';
import * as MarketRoles from './roles/market_roles'
import * as Business from './business'
import * as Util from './util'
import I18n from './modules/language/'
import Enum from './enum'
import USER_PRICE_SOURCE from '../src/constants/user_price_source.json';

const STREAMING_MARKET_TYPE = Enum.STREAMING_MARKET_TYPE
export const priceSourceType = Enum.PRICE_SOURCE

function loadDataDelay(type, listSymbolObject) {
	switch (type) {
		case STREAMING_MARKET_TYPE.QUOTE:
			return Req.getLv1Delay(listSymbolObject)
		default:
			return Promise.resolve([])
	}
}

export function loadDataPrice(type, listSymbolObject) {
	const listFilterSymbolObject = MarketRoles.filterListSymbol({ listSymbolObject })
	const mkDataType = Controller.getMarketDataType()

	switch (mkDataType) {
		case priceSourceType.streaming:
			return AllMarket.getData(type, listFilterSymbolObject, true)
		case priceSourceType.clicktorefresh:
			return AllMarket.getData(type, listFilterSymbolObject, false)
		case priceSourceType.noAccess:
			return Promise.resolve([])
		default:
			return loadDataDelay(type, listFilterSymbolObject)
	}
}

export function loadDataAOIPrice(listSymbolObject) {
	if (!Util.arrayHasItem(listSymbolObject)) return Promise.resolve([]);
	const { symbol } = listSymbolObject[0]
	const isAuBySymbol = Business.isParitech(symbol)
	const mkDataType = Controller.getMarketDataTypeBySymbol(isAuBySymbol)

	switch (mkDataType) {
		case priceSourceType.streaming:
			return AllMarket.getDataAOI(listSymbolObject, true)
		case priceSourceType.clicktorefresh:
			return AllMarket.getDataAOI(listSymbolObject, false)
		case priceSourceType.noAccess:
			return Promise.resolve([])
		default:
			return AllMarket.getDataAOIDelay(listSymbolObject)
	}
}

export function checkAccessMarketData(symbol) {
	const isAuBySymbol = Business.isParitech(symbol)
	if (isAuBySymbol) return Controller.getMarketDataAU !== 0
	return Controller.getMarketDataUS !== 0
}

export function getUserPriceSourceText() {
	// const mkDataType = Controller.getMarketDataType()
	// IRESS MOBILE IS STREAMING
	const mkDataType = priceSourceType.streaming

	return I18n.t(USER_PRICE_SOURCE.filter(e => e.id === mkDataType)[0].text);
}
