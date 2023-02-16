import * as Util from '~/util';
import ENUM from '~/enum';
import {
	formatNumber,
	formatNumberNew2,
	formatNumberNew3,
	roundOffFloat,
	formatNumberNew4
} from '~/lib/base/functionUtil';
import * as Controller from '~/memory/controller';
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js';
import * as PriceModel from '~/screens/new_order/Model/PriceModel.js';
import { dataStorage } from '~/storage';
import * as Business from '~/business.js';
import { getIsBuy } from '~/screens/new_order/Model/OrderEntryModel.js';
const { PRICE_DECIMAL, ORDER_INPUT_TYPE } = ENUM;
const getNumberByDecimal = (value, decimal) => {
	return parseFloat(parseFloat(value).toFixed(decimal));
};
/**
 * // Se format gia tri dau vao tu input. Gia tri nay se duoc luu vao redux duoi dang number
 * @param {*} value gia tri chuyen vao tu Input
 * @param {*} decimal // lay bao nhieu so thap phan sau dau phay
 * @param {*} step // buoc nhay gia khi an + or -
 */
export function getValueForRedux(value, decimal, step = 1) {
	if (isNaN(value) || value === '' || value === null || value === undefined) {
		return null;
	}
	let valueNumber = getNumberByDecimal(value, decimal);
	valueNumber = parseFloat(valueNumber.toFixed(decimal));
	return valueNumber;
}
export function getValidateOnBlur(value) {
	if (value === null || value === '' || value === undefined || isNaN(value)) {
		return true;
	}
	if (parseFloat(value) === 0) return true;
	return false;
}
export function formatPriceOnFocus(
	val,
	decimal = PRICE_DECIMAL.PRICE_IRESS,
	roundStep = ENUM.ROUND_STEP.PRICE
) {
	if (val === '') return val;
	if (
		isNaN(parseFloat(val)) ||
		val === null ||
		val === undefined ||
		parseFloat(val) === 0
	)
		return '';
	val = Util.removeZeroCharacterAtStart(val);
	val = parseFloat(Util.clearCommaCharacter(val)).toFixed(decimal);
	val = Util.removeZeroCharacterAtEnd2(val, decimal);
	return val;
}
export function formatOrderValueOnBlur(
	val,
	decimal = PRICE_DECIMAL.PRICE_IRESS,
	step = ENUM.ROUND_STEP.PRICE
) {
	if (
		val === null ||
		val === '' ||
		val === undefined ||
		isNaN(val) ||
		isNaN(parseFloat(val))
	) {
		val = null;
	}
	return formatNumberNew4(val, decimal, null, false, false);
}
export function formatPriceOnBlur(
	val,
	decimal = PRICE_DECIMAL.PRICE_IRESS,
	step = ENUM.ROUND_STEP.PRICE
) {
	if (
		val === null ||
		val === '' ||
		val === undefined ||
		isNaN(val) ||
		isNaN(parseFloat(val))
	) {
		val = null;
	}
	return formatNumberNew4(val, decimal, null, false);
}
export function formatVolumeOnBlur(
	val,
	decimal = PRICE_DECIMAL.VOLUME,
	step = 1
) {
	if (
		val === null ||
		val === '' ||
		val === undefined ||
		isNaN(val) ||
		isNaN(parseFloat(val))
	) {
		val = null;
	}
	return formatNumberNew3(val, decimal, null, false);
}
export function formatVolumeOnFocus(val, decimal = PRICE_DECIMAL.VOLUME) {
	if (val === '') return val;
	if (isNaN(parseFloat(val)) || val === null || val === undefined) return '';
	val = Util.removeZeroCharacterAtStart(val);
	val = parseFloat(Util.clearCommaCharacter(val)).toFixed(decimal);
	val = Util.clearCommaCharacter(val);
	return val;
}
//
export function getPercentForStopPrice(stopPrice) {
	if (stopPrice === null) return null;
	const isBuy = getIsBuy();
	const lastPrice = PriceModel.getLastPrice();
	if (
		(isBuy && lastPrice < stopPrice) ||
		(!isBuy && lastPrice > stopPrice) ||
		lastPrice === null ||
		lastPrice === 0
	)
		return null;
	const percent = (Math.abs(stopPrice - lastPrice) * 100) / lastPrice;
	return percent;
}
export function getValueForStopPrice(
	percent,
	decimal = PRICE_DECIMAL.PRICE_IRESS
) {
	if (percent === null) return null;
	const lastPrice = PriceModel.getLastPrice();
	const isBuy = getIsBuy();
	let value = isBuy
		? parseFloat((lastPrice - (percent * lastPrice) / 100).toFixed(decimal))
		: parseFloat(
				((percent * lastPrice) / 100 + lastPrice).toFixed(decimal)
		  );
	const step = getStepByRuleASX(value);
	value = parseFloat(value.toFixed(decimal));
	return value;
}
//
export function getPercentForTakeProfitLoss(takeProfitLoss) {
	if (takeProfitLoss === null) return null;
	const isBuy = getIsBuy();
	const lastPrice = PriceModel.getLastPrice();
	if (
		(isBuy && lastPrice > takeProfitLoss) ||
		(!isBuy && lastPrice < takeProfitLoss) ||
		lastPrice === null ||
		lastPrice === 0
	)
		return null;
	const percent = (Math.abs(takeProfitLoss - lastPrice) * 100) / lastPrice;
	return percent;
}
export function getValueForTakeProfitLoss(
	percent,
	decimal = PRICE_DECIMAL.PRICE_IRESS
) {
	if (percent === null) return null;
	const lastPrice = PriceModel.getLastPrice();
	const isBuy = getIsBuy();
	let value = isBuy
		? parseFloat((lastPrice + (percent * lastPrice) / 100).toFixed(decimal))
		: parseFloat(
				(lastPrice - (percent * lastPrice) / 100).toFixed(decimal)
		  );
	const step = getStepByRuleASX(value);
	value = parseFloat(value.toFixed(decimal));
	return value;
}
// Duration

export function getTimeByLocation() {
	const timezone = Controller.getTimeZoneAU();
	let now = new Date().getTime() + 1000 * 60 * 60 * 24;
	const timeByLocation = Util.convertToCustomTimezone(now, timezone);
	return timeByLocation;
}
export function getStopPriceObjWhenLimitPriceChange({ state, action }) {
	return {
		...state.stopPrice,
		percent: state.stopPrice.isTypeValue
			? getPercentForStopPrice(state.stopPrice.value)
			: state.stopPrice.percent,
		value: state.stopPrice.isTypeValue
			? state.stopPrice.value
			: getValueForStopPrice(state.stopPrice.percent),
		isTypeValue: state.stopPrice.isTypeValue
	};
}
export function getTakeProfitLossPriceObjWhenLimitPriceChange({
	state,
	action
}) {
	return {
		...state.takeProfitLoss,
		percent: state.takeProfitLoss.isTypeValue
			? getPercentForTakeProfitLoss(state.takeProfitLoss.value)
			: state.takeProfitLoss.percent,
		value: state.takeProfitLoss.isTypeValue
			? state.takeProfitLoss.value
			: getValueForTakeProfitLoss(state.takeProfitLoss.percent),
		isTypeValue: state.takeProfitLoss.isTypeValue
	};
}
export function getStepByRuleSymbolExchange({ exchange, symbol }) {
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	if (exchange === 'SGX') {
		return getStepByRuleSGX(value);
	}
	if (exchange === 'ASX') {
		return getStepByRuleASX(value);
	}
	if (displayPriceMutilple === 1) {
		return getStepByRuleSGX(value);
	}
	if (displayPriceMutilple === 0.01) {
		return getStepByRuleASX(value);
	}
	return getStepByRuleSGX(value);
}
export function getStepByRule(value) {
	const exchange = AttributeModel.getExchange();
	const symbol = AttributeModel.getSymbol();
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	if (exchange === 'SGX') {
		return getStepByRuleSGX(value);
	}
	if (exchange === 'ASX') {
		return getStepByRuleASX(value);
	}
	if (exchange === 'FX') {
		return 0.000005;
	}
	if (displayPriceMutilple === 1) {
		return getStepByRuleSGX(value);
	}
	if (displayPriceMutilple === 0.01) {
		return getStepByRuleASX(value);
	}
	return getStepByRuleSGX(value);
}
// Get Step follow ASX rules
export function getStepByRuleASX(value) {
	if (value < 10 || value === null || value === undefined || isNaN(value)) {
		return 0.1;
	}
	if (value <= 200) {
		return 0.5;
	}
	return 1;
}
// Get Step follow SGX rules
export function getStepByRuleSGX(value) {
	if (value < 0.2 || value === null || value === undefined || isNaN(value)) {
		return 0.001;
	}

	if (value >= 0.2 && value < 1) {
		return 0.005;
	}
	return 0.01;
}
export function getDecimalPriceBySymbolExchange({ exchange, symbol }) {
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	if (exchange === 'SGX') {
		return 3; // => SGX allway 2
	} else if (exchange === 'ASX') {
		return 1; // => ASX allway 1
	} else if (exchange === 'FX') {
		return 6; // => FX allway 6
	} else if (displayPriceMutilple === 1) {
		// =>  other case default with displayPriceMutilple
		return 3;
	} else if (displayPriceMutilple === 0.1) {
		return 2;
	} else if (displayPriceMutilple === 0.01) {
		return 1;
	}

	//  default 3
	return 3;
}
export function getDecimalPriceByRule() {
	const exchange = AttributeModel.getExchange();
	const symbol = AttributeModel.getSymbol();
	return getDecimalPriceBySymbolExchange({ symbol, exchange });
}
export function getDecimalPriceByRuleASX() {
	return 1;
}
export function getDecimalPriceByRuleSGX() {
	return 3;
}
export function getOrderValueByRule({ orderQuantity }) {
	// Phải check theo rule ASX / SGX và price_multiply
	const exchange = AttributeModel.getExchange();
	const symbol = AttributeModel.getSymbol();
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	if (exchange === 'SGX') {
		return parseInt(orderQuantity) * PriceModel.getLastPrice();
	}
	if (exchange === 'ASX') {
		return (parseInt(orderQuantity) * PriceModel.getLastPrice()) / 100;
	}
	if (displayPriceMutilple === 1) {
		return parseInt(orderQuantity) * PriceModel.getLastPrice();
	}
	if (displayPriceMutilple === 0.01) {
		return (parseInt(orderQuantity) * PriceModel.getLastPrice()) / 100;
	}
}
export function getQuantityByOrderValue({ orderValue }) {
	// Phải check theo rule ASX / SGX và price_multiply
	const exchange = AttributeModel.getExchange();
	const symbol = AttributeModel.getSymbol();
	const lastPrice = PriceModel.getLastPrice();
	if (
		lastPrice === null ||
		lastPrice === 0 ||
		lastPrice === undefined ||
		isNaN(lastPrice)
	)
		return null;
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	if (exchange === 'SGX') {
		return Math.round(formatPriceOnFocus(orderValue, 2) / lastPrice);
	}
	if (exchange === 'ASX') {
		return Math.round(
			(formatPriceOnFocus(orderValue, 2) * 100) / lastPrice
		);
	}
	if (displayPriceMutilple === 1) {
		return Math.round(formatPriceOnFocus(orderValue, 2) / lastPrice);
	}
	if (displayPriceMutilple === 0.01) {
		return Math.round(
			(formatPriceOnFocus(orderValue, 2) * 100) / lastPrice
		);
	}
	return Math.round(formatPriceOnFocus(orderValue, 2) / lastPrice);
}
export function getPriceByRule({ price }) {
	// Phải check theo rule ASX / SGX và price_multiply
	const exchange = AttributeModel.getExchange();
	const symbol = AttributeModel.getSymbol();
	const displayPriceMutilple = Business.getPriceDisplayMultiplier({
		symbol,
		exchange
	});
	if (exchange === 'SGX') {
		return price;
	}
	if (exchange === 'ASX') {
		return price / 100;
	}
	if (displayPriceMutilple === 1) {
		return price;
	}
	if (displayPriceMutilple === 0.01) {
		return price / 100;
	}
}

export function getVolAndOrderPriceWhenChangeOrderType({
	volume,
	value,
	type,
	step
}) {
	// Nếu là order value thì có cả value và volume
	// Nếu là order quantity thì chỉ có value
	const result = {
		vol: null,
		value: null
	};
	if (volume === null || volume === undefined) {
		volume = 0;
	}
	let price = PriceModel.getLastPrice();
	price = getPriceByRule({ price });
	if (type === ORDER_INPUT_TYPE.ORDER_VALUE) {
		result.value = value;
		result.vol =
			price === 0 || price === null || price === undefined || isNaN(price)
				? 0
				: value / price;
	} else if (type === ORDER_INPUT_TYPE.ORDER_QUANTITY) {
		result.value = volume * price;
		result.vol = volume;
	} else {
	}
	return result;
}
export function getSmartValueByLotSize({
	volume,
	value,
	type,
	step,
	isIncrease
}) {
	// Nếu là order value thì có cả value và volume
	// Nếu là order quantity thì chỉ có value
	if (volume === null || volume === undefined) {
		volume = 0;
	}
	let price = PriceModel.getLastPrice();
	price = getPriceByRule({ price });
	if (type === ORDER_INPUT_TYPE.ORDER_VALUE) {
		const naturalPart = Math.floor(volume / dataStorage.stepQuantity);
		const remainderPart = volume % dataStorage.stepQuantity;
		if (remainderPart === 0) {
			value = isIncrease
				? (volume + dataStorage.stepQuantity) * price
				: (volume - dataStorage.stepQuantity) * price;
		} else {
			volume = isIncrease
				? naturalPart * dataStorage.stepQuantity +
				  dataStorage.stepQuantity
				: naturalPart * dataStorage.stepQuantity -
				  dataStorage.stepQuantity;
			value = volume * price;
		}
	} else if (type === ORDER_INPUT_TYPE.ORDER_QUANTITY) {
		const naturalPart = Math.floor(value / dataStorage.stepQuantity);
		const remainderPart = value % dataStorage.stepQuantity;
		if (remainderPart === 0) {
			value = isIncrease ? value + step : value - step;
		} else {
			value = isIncrease
				? naturalPart * dataStorage.stepQuantity +
				  dataStorage.stepQuantity
				: naturalPart * dataStorage.stepQuantity -
				  dataStorage.stepQuantity;
		}
	} else {
		value = isIncrease ? value + step : value - step;
	}
	return value;
}
