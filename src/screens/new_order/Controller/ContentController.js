import * as Business from '~/business';
import orderTypeEnum from '~/constants/order_type';
import orderTypeString from '~/constants/order_type_string';
import * as Translate from '~/invert_translate';
import * as Util from '~/util';
import ENUM from '~/enum';
import moment from 'moment';
import { dataStorage } from '~/storage';
import I18n from '~/modules/language/';
import * as Emitter from '@lib/vietnam-emitter';
import {
	getChannelChangeOrderError,
	getChannelShowMessageNewOrder
} from '~/streaming/channel';
import { getLastPrice } from '~/screens/new_order/Model/PriceModel.js';
import {
	getIsBuy,
	getType
} from '~/screens/new_order/Model/OrderEntryModel.js';
import {
	formatNumber,
	formatNumberNew2,
	formatNumberNew3
} from '~/lib/base/functionUtil';
import * as api from '~/api';
import {
	updateState,
	changeLoadingOrderAttribute
} from '~/screens/new_order/Redux/actions.js';
import * as Controller from '~/memory/controller';
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';
import * as PriceModel from '~/screens/new_order/Model/PriceModel.js';
import { getTabTrading } from '~/screens/new_order/Model/TabModel.js';
import {
	getAccessMode,
	getAccActive
} from '~/screens/portfolio/Model/PortfolioAccountModel.js';
import { getPortfolioType } from '~/screens/portfolio/Controller/PortfolioAccountController.js';
import OrderType from '~/constants/order_type.js';
import { isNumber } from 'lodash';
import * as ConditionModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
import * as PriceBaseTabModel from '~/screens/new_order/Model/PriceBaseContingentTabModel';
import { ALERT } from '../Components/ContingentBlock';

const {
	EXCHANGE_CODE_MAPPING,
	NOTE_STATE,
	DURATION_CODE,
	ORDER_ACTION,
	RESPONSE_STATUS,
	EXCHANGE_CODE,
	ERROR_CODE,
	PRICE_DECIMAL,
	TYPE_ERROR_ORDER,
	ORDER_TYPE_SYSTEM,
	TYPE_LOT_SIZE
} = ENUM;
export function updateStateNewOrderToRedux(state) {
	Controller.dispatch(updateState(state));
}
export function getFormatData(data) {
	return data.map((val) => {
		return {
			key: val,
			label: Translate.getInvertTranslate(val)
		};
	});
}
export function getOrderType({ isAuBySymbol, classSymbol, isNSXSymbol }) {
	if (isAuBySymbol) {
		return Business.getListOrderTypeByClass(classSymbol, isNSXSymbol);
	} else {
		return Business.getListOrderType(null, classSymbol);
	}
}
export function getDuration({
	isAuBySymbol,
	classSymbol,
	isNSXSymbol,
	symbol,
	orderType,
	isFuture
}) {
	if (isFuture || !isAuBySymbol) {
		// Những mã con của future khi click sau khi expand mình đang không lưu symbol info vào dic -> check AU/US qua currency sẽ trả về AU -> dẫn đến sai list duration
		return Business.getListDurationStringByOrderTypeSystem(
			orderType,
			symbol,
			classSymbol
		);
	} else {
		return Business.getListDurationByClass(
			classSymbol,
			orderType,
			isNSXSymbol
		);
	}
}
export function getExchange({
	isAuBySymbol,
	classSymbol,
	isNSXSymbol,
	symbol,
	orderType,
	duration
}) {
	if (isAuBySymbol) {
		return Business.getListExchangeByClassAndOrderType({
			classSymbol,
			orderType,
			isNSXSymbol,
			duration
		});
	} else {
		return Business.getListTradingMarket(symbol);
	}
}
/**
 * Lay gia tri orderType de map vao objectOrder
 */
export function getOrderTypeValue({ val, isAuBySymbol }) {
	val = Translate.translateCustomLang(val);
	let orderType;
	switch ((val + '').toUpperCase()) {
		case orderTypeString.LIMIT:
			orderType = orderTypeEnum.LIMIT_ORDER;
			break;
		case orderTypeString.MARKET:
		case orderTypeString.MARKETTOLIMIT:
			orderType = isAuBySymbol
				? orderTypeEnum.MARKETTOLIMIT_ORDER
				: orderTypeEnum.MARKET_ORDER;
			break;
		case orderTypeString.STOPLOSS:
			if (isAuBySymbol) {
				// voi ma Uc thi STOPLOSS = STOPLIMIT, nhung khi hien thi van hien thi STOPLOSS
				orderType = orderTypeEnum.STOPLIMIT_ORDER;
			} else {
				orderType = orderTypeEnum.STOPLOSS_ORDER;
			}
			break;
		case orderTypeString.STOPLIMIT:
			orderType = orderTypeEnum.STOPLIMIT_ORDER;
			break;
		default:
			break;
	}
	return orderType;
}
export function validateNumber({ preText, nextText }) {
	try {
		const regex = new RegExp('^[^.][0-9]*[.]?([0-9]{0,4})?$'); // eslint-disable-line no-useless-escape
		if (nextText.toString().match(regex)) {
			return nextText;
		} else {
			return preText;
		}
	} catch (error) {}
}

function getExchangeMappingSendRequest({ symbol, destination }) {
	const symbolInfo = Business.getSymbolInfo({
		symbol
	});
	if (Business.isParitech(symbol)) {
		return destination ? EXCHANGE_CODE_MAPPING[destination] : destination;
	} else return Business.getExchangeCodeSaxo(symbolInfo);
}

function isGoodTillDate({ duration }) {
	return duration === DURATION_CODE.GTD;
}
export function getObjectOrderPlaceFees(newOrder) {
	try {
		let {
			isBuy,
			symbol,
			exchange,
			limitPrice,
			orderType,
			duration,
			destination,
			quantity,
			date = new Date().getTime(),
			stopPrice,
			takeProfitLoss,
			orderValue,
			side
		} = newOrder;
		quantity = parseInt(quantity.value);
		orderValue = parseInt(orderValue.value);
		limitPrice = parseFloat(limitPrice);
		stopPrice = parseFloat(stopPrice.value);
		takeProfitLoss = parseFloat(takeProfitLoss.value);
		// triggerPrice = parseFloat(triggerPrice)
		if (!symbol) return {};
		const accountId = getAccActive();
		let objectOrder = { symbol, exchange };
		const listTabTrading = getTabTrading();
		switch (orderType.key) {
			case OrderType.LIMIT:
				objectOrder['limit_price'] = limitPrice;
				break;
			default:
				break;
		}
		objectOrder['side'] = isBuy;
		objectOrder['volume'] = quantity;
		objectOrder['order_type'] = orderType.key;
		objectOrder['side'] = isBuy ? 'buy' : 'sell';
		objectOrder['account_id'] = accountId;
		// objectOrder['class'] = Business.getClassBySymbolAndExchange({ symbol, exchange })
		objectOrder['destination'] = 'AUTO_TRADE';
		// if (listTabTrading['STOPLOSS']) {
		//     objectOrder['stop_price'] = stopPrice
		// }
		// if (listTabTrading['TAKE_PROFIT']) {
		//     objectOrder['take_profit_price'] = takeProfitLoss
		// }
		return objectOrder;
	} catch (error) {
		console.log('getObjectOrderPlace error', error);
	}
}
export function getObjectAmendOrder({ data, newOrder }) {
	try {
		let {
			stoploss_order_info: stopLossOrderInfo,
			takeprofit_order_info: takeProfitOrderInfo
		} = data;
		let {
			symbol,
			exchange,
			limitPrice,
			duration,
			quantity,
			stopPrice,
			stopPrice: stopPriceInfo,
			takeProfitLoss: takeProfitInfo,
			takeProfitLoss,
			orderType,
			expiryTime,
			isBuy,
			ctTriggerPrice,
			enableContingentBlock,
			isContingentTypePoint,
			templateTriggerPrice,
		} = newOrder;
		const _triggerPrice = ctTriggerPrice.value;

		quantity = quantity.value;
		stopPrice = stopPrice.value;
		takeProfitLoss = takeProfitLoss.value;
		orderType = orderType.key;
		let objectOrder = { symbol, exchange };
		const listTabTrading = getTabTrading();
		switch (orderType) {
			case OrderType.LIMIT:
				objectOrder['limit_price'] = limitPrice;
				break;
			default:
				break;
		}
		objectOrder['side'] = isBuy ? 'buy' : 'sell';
		objectOrder['duration'] = duration.key;
		objectOrder['order_type'] = orderType;
		objectOrder['order_quantity'] = parseInt(quantity);
		objectOrder = handleGetExpiryTime({
			objectOrder,
			duration: duration.key,
			date: expiryTime
		});
		objectOrder = getObjSL({
			stopPrice,
			objectOrder,
			stopPriceInfo: stopPriceInfo,
			stopLossOrderInfo,
			isAmend: true
		});
		objectOrder = getObjTP({
			takeProfitLoss,
			objectOrder,
			takeProfitInfo: takeProfitInfo,
			takeProfitOrderInfo,
			isAmend: true
		});
		// if (stopLossOrderInfo) {
		//     if (listTabTrading['STOPLOSS']) {
		//         stopLossId = stopLossOrderInfo.stoploss_order_id
		//         objectOrder['stoploss_order_id'] = stopLossId
		//         objectOrder['stoploss_order_price'] = stopPrice
		//         // objectOrder['trigger_stop_price'] = stopPrice
		//     }
		// }
		// if (takeProfitOrderInfo) {
		//     if (listTabTrading['TAKE_PROFIT']) {
		//         takeProfitId = takeProfitOrderInfo.takeprofit_order_id
		//         objectOrder['takeprofit_order_id'] = takeProfitId
		//         objectOrder['takeprofit_order_price'] = takeProfitLoss
		//         // objectOrder['trigger_take_profit_price'] = takeProfitLoss
		//     }
		// }

		if (enableContingentBlock) {
			if (isContingentTypePoint) {
				// Use template calcualated price before instead of price trigger when user are using point
				objectOrder['ct_trigger_price'] = parseFloat(templateTriggerPrice);
			} else {
				objectOrder['ct_trigger_price'] = parseFloat(_triggerPrice);
			}
			objectOrder['ct_condition'] = ConditionModel.model.depth;
			objectOrder['ct_price_base'] = PriceBaseTabModel.model.depth;
		}

		return objectOrder;
	} catch (error) {
		console.log('getObjectOrderAmend', error);
	}
}
function handleGetExpiryTime({ objectOrder, duration, date }) {
	switch (duration) {
		case DURATION_CODE.GTD:
		case DURATION_CODE.DATE:
		case DURATION_CODE.GTT:
			objectOrder['expiry_time'] = new Date(date);
			return objectOrder;
		default:
			return objectOrder;
			break;
	}
}
function handleGetExpiryTimeSL({ objectOrder, duration, date }) {
	switch (duration) {
		case DURATION_CODE.GTD:
		case DURATION_CODE.DATE:
		case DURATION_CODE.GTT:
			objectOrder['stoploss_expiry_time'] = new Date(date);
			return objectOrder;
		default:
			return objectOrder;
			break;
	}
}
function handleGetExpiryTimeTP({ objectOrder, duration, date }) {
	switch (duration) {
		case DURATION_CODE.GTD:
		case DURATION_CODE.DATE:
		case DURATION_CODE.GTT:
			objectOrder['takeprofit_expiry_time'] = new Date(date);
			return objectOrder;
		default:
			return objectOrder;
			break;
	}
}

export function getObjSL({
	stopPrice,
	objectOrder,
	stopPriceInfo,
	stopLossOrderInfo,
	isAmend = false
}) {
	const listTabTrading = getTabTrading();
	const { orderType, limitPrice, duration, expiryTime } = stopPriceInfo;
	if (
		listTabTrading['STOPLOSS'] &&
		!listTabTrading['MORE_STOPLOSS'] &&
		!isAmend
	) {
		if (isAmend) {
			objectOrder['stoploss_order_price'] = +stopPrice;
			objectOrder['stoploss_price'] = +stopPrice;
		} else {
			objectOrder['stop_price'] = +stopPrice;
			objectOrder['trigger_stop_price'] = +stopPrice;
		}
		if (isAmend) {
			objectOrder['stoploss_order_id'] =
				stopLossOrderInfo.stoploss_order_id;
			// objectOrder['stoploss_is016'] = stopLossOrderInfo.stoploss_is016;
		}
		objectOrder['stoploss_order_type'] = orderType.key;
	}
	if (
		listTabTrading['STOPLOSS'] &&
		(listTabTrading['MORE_STOPLOSS'] || isAmend)
	) {
		if (isAmend) {
			objectOrder['stoploss_price'] = +stopPrice;
		} else {
			objectOrder['trigger_stop_price'] = +stopPrice;
		}
		switch (orderType.key) {
			case OrderType.LIMIT:
				if (isAmend) {
					objectOrder['stoploss_order_price'] = limitPrice;
				} else {
					objectOrder['stop_price'] = limitPrice;
				}
				break;
			default:
				break;
		}
		objectOrder['stoploss_order_type'] = orderType.key;
		objectOrder['stoploss_duration'] = duration.key;
		if (isAmend) {
			objectOrder['stoploss_order_id'] =
				stopLossOrderInfo.stoploss_order_id;
			// objectOrder['stoploss_is016'] = stopLossOrderInfo.stoploss_is016;
		}
		objectOrder = handleGetExpiryTimeSL({
			objectOrder,
			duration: duration.key,
			date: expiryTime
		});
	}

	return objectOrder;
}
export function getObjTP({
	takeProfitLoss,
	objectOrder,
	takeProfitInfo,
	takeProfitOrderInfo,
	isAmend = false
}) {
	const listTabTrading = getTabTrading();
	const { orderType, limitPrice, duration, expiryTime } = takeProfitInfo;
	if (
		listTabTrading['TAKE_PROFIT'] &&
		!listTabTrading['MORE_TAKE_PROFIT'] &&
		!isAmend
	) {
		if (isAmend) {
			objectOrder['takeprofit_order_price'] = +takeProfitLoss;
			objectOrder['takeprofit_price'] = +takeProfitLoss;
		} else {
			objectOrder['take_profit_price'] = +takeProfitLoss;
			objectOrder['trigger_take_profit_price'] = +takeProfitLoss;
		}
		if (isAmend) {
			objectOrder['takeprofit_order_id'] =
				takeProfitOrderInfo.takeprofit_order_id;
			// objectOrder['takeprofit_is016'] =
			// 	takeProfitOrderInfo.takeprofit_is016;
		}
		objectOrder['takeprofit_order_type'] = orderType.key;
	}
	if (
		listTabTrading['TAKE_PROFIT'] &&
		(listTabTrading['MORE_TAKE_PROFIT'] || isAmend)
	) {
		if (isAmend) {
			objectOrder['takeprofit_price'] = +takeProfitLoss;
		} else {
			objectOrder['trigger_take_profit_price'] = +takeProfitLoss;
		}
		switch (orderType.key) {
			case OrderType.LIMIT:
				if (isAmend) {
					objectOrder['takeprofit_order_price'] = limitPrice;
				} else {
					objectOrder['take_profit_price'] = limitPrice;
				}
				break;
			default:
				break;
		}
		objectOrder['takeprofit_order_type'] = orderType.key;
		objectOrder['takeprofit_duration'] = duration.key;
		if (isAmend) {
			objectOrder['takeprofit_order_id'] =
				takeProfitOrderInfo.takeprofit_order_id;
			// objectOrder['takeprofit_is016'] =
			// 	takeProfitOrderInfo.takeprofit_is016;
		}
		objectOrder = handleGetExpiryTimeTP({
			objectOrder,
			duration: duration.key,
			date: expiryTime
		});
	}

	return objectOrder;
}
export function getObjectOrderPlace(newOrder, confirmBreachAction = false) {
	try {
		let {
			isBuy,
			symbol,
			exchange,
			limitPrice,
			triggerPrice,
			orderType,
			duration,
			destination,
			quantity,
			date = new Date().getTime(),
			stopPrice,
			stopPrice: stopPriceInfo,
			takeProfitLoss,
			takeProfitLoss: takeProfitInfo,
			orderValue,
			expiryTime,
			ctTriggerPrice,
			enableContingentBlock,
			isContingentTypePoint,
			templateTriggerPrice
		} = newOrder;
		quantity = parseInt(quantity.value);
		const _triggerPrice = ctTriggerPrice.value;
		orderValue = parseInt(orderValue.value);
		limitPrice = parseFloat(limitPrice);
		stopPrice = parseFloat(stopPrice.value);
		takeProfitLoss = parseFloat(takeProfitLoss.value);
		// triggerPrice = parseFloat(triggerPrice)
		if (!symbol) return {};
		const accountId = getAccActive();
		let objectOrder = { symbol, exchange };
		const listTabTrading = getTabTrading();
		switch (orderType.key) {
			case OrderType.LIMIT:
				objectOrder['limit_price'] = limitPrice;
				break;
			default:
				break;
		}
		if (enableContingentBlock) {
			if (isContingentTypePoint) {
				// Use template calcualated price before instead of price trigger when user are using point
				objectOrder['ct_trigger_price'] = parseFloat(templateTriggerPrice);
				ALERT('use template price:' + parseFloat(templateTriggerPrice));
			} else {
				objectOrder['ct_trigger_price'] = parseFloat(_triggerPrice);
				ALERT('use trigger price:' + _triggerPrice);
			}
			objectOrder['ct_condition'] = ConditionModel.model.depth;
			objectOrder['ct_price_base'] = PriceBaseTabModel.model.depth;
		}
		objectOrder['duration'] = duration.key;
		objectOrder['volume'] = quantity;
		objectOrder['order_type'] = orderType.key;
		objectOrder['side'] = isBuy ? 'buy' : 'sell';
		objectOrder['account_id'] = accountId;
		objectOrder = handleGetExpiryTime({
			objectOrder,
			duration: duration.key,
			date: expiryTime
		});
		// objectOrder['class'] = Business.getClassBySymbolAndExchange({ symbol, exchange })
		const firstDestination = AttributeModel.getDestinations()
			.entries()
			.next().value;
		objectOrder['destination'] =
			(firstDestination && firstDestination[0]) || 'AUTODESK';
		objectOrder = getObjSL({
			stopPrice,
			objectOrder,
			stopPriceInfo: stopPriceInfo
		});
		objectOrder = getObjTP({
			takeProfitLoss,
			objectOrder,
			takeProfitInfo: takeProfitInfo
		});
		objectOrder['confirm_breach_action'] = confirmBreachAction;
		// if (listTabTrading['STOPLOSS']) {
		//     objectOrder['stop_price'] = stopPrice
		//     objectOrder['trigger_stop_price'] = stopPrice
		// }
		// if (listTabTrading['TAKE_PROFIT']) {
		//     objectOrder['take_profit_price'] = takeProfitLoss
		//     objectOrder['trigger_take_profit_price'] = takeProfitLoss
		// }
		return objectOrder;
	} catch (error) {
		console.log('getObjectOrderPlace error', error);
	}
}

function showVettingError(errorMsg) {
	const channel = getChannelShowMessageNewOrder();
	return (
		errorMsg &&
		Emitter.emit(channel, {
			msg: errorMsg,
			key: TYPE_ERROR_ORDER.DEFAULT_MESSAGE_ERROR_TEXT
		})
	);
}
// Fake Place Order

export function getCashAvailable(accountId) {
	const baseUrl = dataStorage.baseUrl;
	const accessToken = dataStorage.accessToken;
	const url = `https://${baseUrl}/v1/portfolio/total/${accountId}`;
	return new Promise((resolve) => {
		api.requestData(url, true, null, false, false, accessToken).then(
			(data) => {
				this.isFirst = true;
				if (data) {
					resolve(data);
				} else {
					resolve({});
				}
				resolve({});
			}
		);
	});
}

export async function placeOrdIressFake(orderObject, timeout) {
	const accessToken = dataStorage.accessToken;
	const baseUrl = dataStorage.baseUrl;
	const urlPlaceOrder = `https://${baseUrl}/v1/order`;
	return new Promise(async (resolve, reject) => {
		try {
			const data = await api.postData(
				urlPlaceOrder,
				{ data: orderObject },
				timeout,
				false,
				false,
				accessToken
			);
			resolve(data);
		} catch (error) {
			reject();
		}
	});
}
// End Fake
export function checkVettingOrder(orderObj, actionType = ORDER_ACTION.PLACE) {
	return new Promise((resolve, reject) => {
		Business.checkVettingOrder(actionType, orderObj)
			.then((res) => {
				const status = res.status;
				const errorCode = res.errorCode || res.message || '';
				switch (status) {
					case RESPONSE_STATUS.PASS:
						// Pass vetting -> Reset error & push to confirm screen
						resolve(orderObj);
						break;
					case RESPONSE_STATUS.FAIL:
						// Fail vetting -> Set error and show
						const errorMsg = errorCode;
						showVettingError(errorMsg);
						reject();
						break;
					default:
						if (errorCode === ERROR_CODE.TIMEOUT) {
							const errorMsg = I18n.t('timeoutOrder');
							showVettingError(errorMsg);
						}
						reject();
						break;
				}
			})
			.catch((error) => {
				reject();
				console.log('error at checkVettingOrder', error);
			});
	});
}
const validateTakeProfitPrice = ({ triggerTakeProfitPrice }) => {
	const isBuy = getIsBuy();
	const orderType = PriceModel.getOrderType();
	const type = getType();
	if (
		orderType === orderTypeEnum.MARKET ||
		orderType === orderTypeEnum.MARKETTOLIMIT ||
		type === ENUM.AMEND_TYPE.AMEND_TRADING_PROFITLOSS ||
		type === ENUM.AMEND_TYPE.AMEND_TRADING_STOPPRICE
	)
		return false;
	if (
		isNumber(triggerTakeProfitPrice) &&
		isBuy &&
		triggerTakeProfitPrice <= getLastPrice()
	) {
		return {
			msg: 'Take Profit Price must be more than the original order Limit Price',
			key: TYPE_ERROR_ORDER.TAKE_PROFIT_LOSS
		};
	}
	if (
		isNumber(triggerTakeProfitPrice) &&
		!isBuy &&
		triggerTakeProfitPrice >= getLastPrice()
	) {
		return {
			msg: 'Take Profit Price must be less than the original order Limit Price',
			key: TYPE_ERROR_ORDER.TAKE_PROFIT_LOSS
		};
	}
	return false;
};
const validateStopPrice = ({ triggerStopPrice }) => {
	const isBuy = getIsBuy();
	const orderType = PriceModel.getOrderType();
	const type = getType();
	if (
		orderType === orderTypeEnum.MARKET ||
		orderType === orderTypeEnum.MARKETTOLIMIT ||
		type === ENUM.AMEND_TYPE.AMEND_TRADING_PROFITLOSS ||
		type === ENUM.AMEND_TYPE.AMEND_TRADING_STOPPRICE
	)
		return false;
	if (
		isNumber(triggerStopPrice) &&
		isBuy &&
		triggerStopPrice >= getLastPrice()
	) {
		return {
			msg: 'Stop loss Price must be less than the original order Limit Price',
			key: TYPE_ERROR_ORDER.STOP_PRICE_INPUT_ERROR
		};
	}
	if (
		isNumber(triggerStopPrice) &&
		!isBuy &&
		triggerStopPrice <= getLastPrice()
	) {
		return {
			msg: 'Stop loss Price must be more than the original order Limit Price',
			key: TYPE_ERROR_ORDER.STOP_PRICE_INPUT_ERROR
		};
	}
	return false;
};
const validateStopLimitPrice = ({ stopPrice, stoplossOrderType }) => {
	switch (stoplossOrderType) {
		case OrderType.LIMIT:
			if (!stopPrice || stopPrice === 0) {
				return {
					msg: I18n.t('limitPriceValid'),
					key: TYPE_ERROR_ORDER.STOP_LIMIT_PRICE_ERROR
				};
			}
	}
};
const validateTakeProfitLimitPrice = ({ profitLoss, takeprofitOrderType }) => {
	switch (takeprofitOrderType) {
		case OrderType.LIMIT:
			if (!profitLoss || profitLoss === 0) {
				return {
					msg: I18n.t('limitPriceValid'),
					key: TYPE_ERROR_ORDER.TAKE_PROFIT_LIMIT_PRICE_ERROR
				};
			}
	}
};
export function validatePreOrder(newOrder, stateNewOrder) {
	try {
		let {
			symbol,
			limit_price: limitPrice,
			order_type: orderType,
			volume: quantity,
			order_value: orderValue,
			stop_price: stopPrice,
			take_profit_price: profitLoss,
			trigger_stop_price: triggerStopPrice,
			stoploss_order_type: stoplossOrderType,
			trigger_take_profit_price: triggerTakeProfitPrice,
			takeprofit_order_type: takeprofitOrderType
		} = newOrder;
		const { stepQuantity } = stateNewOrder;
		quantity = parseInt(quantity);
		limitPrice = parseFloat(limitPrice);
		orderValue = parseFloat(orderValue);
		stopPrice = parseFloat(stopPrice);
		profitLoss = parseFloat(profitLoss);
		const ctTriggerPrice = parseFloat(stateNewOrder.ctTriggerPrice.value);
		if (stateNewOrder.enableContingentBlock &&
			stateNewOrder.currentInputShown === 0 &&
			!stateNewOrder.isContingentTypePoint) {
			return {
				msg: I18n.t('limitTriggerPriceValid'),
				key: TYPE_ERROR_ORDER.TRIGGER_PRICE_INVALID_ERROR
			};
		}

		if (stateNewOrder.enableContingentBlock &&
			stateNewOrder.currentInputShown === 0 &&
			stateNewOrder.isContingentTypePoint) {
			return {
				msg: I18n.t('pointMustBePositive'),
				key: TYPE_ERROR_ORDER.POINTS_INVALID_ERROR
			};
		}
		if (!symbol) {
			return {
				msg: I18n.t('symbolSelectFirst'),
				key: TYPE_ERROR_ORDER.DEFAULT_MESSAGE_ERROR_TEXT
			};
		}
		if (!quantity) {
			return {
				msg: I18n.t('volumeRequired'),
				key: TYPE_ERROR_ORDER.QUANTITY_INPUT_ERROR
			};
		} else {
			if (quantity % stepQuantity !== 0) {
				const keyError =
					dataStorage.typeLotSize === TYPE_LOT_SIZE.MARGIN
						? 'errorMarginLotSize'
						: 'errorSecurityLotSize';

				return {
					msg: I18n.t(keyError).replace('##VOLUME##', quantity),
					key: TYPE_ERROR_ORDER.QUANTITY_INPUT_ERROR
				};
			}
		}
		switch (orderType) {
			case OrderType.LIMIT:
				if (!limitPrice || limitPrice === 0) {
					return {
						msg: I18n.t('limitPriceValid'),
						key: TYPE_ERROR_ORDER.LIMIT_PRICE_INPUT_ERROR
					};
				}
		}
		const listTabTrading = getTabTrading();
		if (
			(!triggerStopPrice ||
				triggerStopPrice === 0 ||
				isNaN(triggerStopPrice)) &&
			listTabTrading['STOPLOSS']
		) {
			return {
				msg: I18n.t('stopPriceValid'),
				key: TYPE_ERROR_ORDER.STOP_PRICE_INPUT_ERROR
			};
		} else {
			const validateStopLossPrice = validateStopPrice({
				triggerStopPrice
			});
			if (validateStopLossPrice) return validateStopLossPrice;
		}

		if (
			(!triggerTakeProfitPrice ||
				triggerTakeProfitPrice === 0 ||
				isNaN(triggerTakeProfitPrice)) &&
			listTabTrading['TAKE_PROFIT']
		) {
			return {
				msg: I18n.t('takeProfitLossPriceValid'),
				key: TYPE_ERROR_ORDER.TAKE_PROFIT_LOSS
			};
		} else {
			const validateProfitloss = validateTakeProfitPrice({
				triggerTakeProfitPrice
			});
			if (validateProfitloss) {
				return validateProfitloss;
			}
		}
		if (
			validateStopLimitPrice({ stopPrice, stoplossOrderType }) &&
			listTabTrading['STOPLOSS'] &&
			listTabTrading['MORE_STOPLOSS']
		) {
			return validateStopLimitPrice({ stopPrice, stoplossOrderType });
		}
		if (
			validateTakeProfitLimitPrice({ profitLoss, takeprofitOrderType }) &&
			listTabTrading['TAKE_PROFIT'] &&
			listTabTrading['MORE_TAKE_PROFIT']
		) {
			return validateTakeProfitLimitPrice({
				profitLoss,
				takeprofitOrderType
			});
		}
		return null;
	} catch (error) {
		console.log(`Neworder - validatePreOrder with error: ${error}`);
	}
}
export function getOrderAttributes({ symbol, exchange, cb }) {
	const accountId = getAccActive();
	const url = api.getUrlOrderAttributes({
		accountId,
		exchange
	});
	return new Promise((resolve) => {
		Controller.dispatch(changeLoadingOrderAttribute(true));
		api.requestData(url).then((data) => {
			AttributeModel.initData({
				duration: data.duration,
				order_type: data.order_type,
				destination: data.destination,
				child_order_type: data.child_order_type,
				child_duration: data.child_duration,
				child_destination: data.child_destination,
				fixed_price_base: data.fixed_price_base
			});
			Controller.dispatch(changeLoadingOrderAttribute(false));
		});
	});
}

export function getPortfolioTotal(accountId, cb) {
	return new Promise(async (resolve) => {
		const accessMode = getAccessMode();
		let portfolioCode = accountId;
		let listPortfolioType;
		if (!portfolioCode) {
			listPortfolioType = await getPortfolioType();
			const defaultAcc = listPortfolioType[0] || {};
			portfolioCode = defaultAcc.portfolio_id;
		}
		const url = api.getUrlTotalPortfolio({ portfolioCode, accessMode });
		api.requestData(url, true, null, true)
			.then((res) => {
				cb(res);
				resolve();
			})
			.catch((err) => {
				cb({});
				resolve();
			});
	});
}
