import OrderTypeString from '~/constants/order_type_string.js';
import DurationString from '~/constants/durationString.js';
import DestinationString from '~/constants/destinationString.js';
import { forEach, toUpper } from 'lodash';
let model = {
	orderType: new Map(), // {MARKET:{title:'Market Order',value:MARKET}}
	childOrderType: new Map(), // {MARKET:{title:'Market Order',value:MARKET}}
	duration: new Map(), // {EOD:{title:'End Of Day',value:'EOD}},
	childDuration: new Map(), // {EOD:{title:'End Of Day',value:'EOD}},
	destination: new Map(), // {EOD:{title:'End Of Day',value:'EOD}},
	exchange: null,
	symbol: null
};

const reverseMapKey = (data, objectKeys) => {
	const result = new Map();

	const reverseObj = {};

	forEach(objectKeys, (value, key) => {
		reverseObj[toUpper(value)] = key;
	});

	forEach(data, (item) => {
		const key = reverseObj[toUpper(item)];
		result.set(key || item, item);
	});

	return result;
};

export function setMapOrderType(listKeyOrderType = []) {
	// const orderTypeMap = new Map();
	// listKeyOrderType.forEach((el) => {
	// 	orderTypeMap.set(el, OrderTypeString[el]);
	// });
	model.orderType = reverseMapKey(listKeyOrderType, OrderTypeString);
}
export function setMapOrderDuration(listKeyDuration = []) {
	// const orderDurationMap = new Map();
	// listKeyDuration.forEach((el) => {
	// 	orderDurationMap.set(el, DurationString[el]);
	// });

	model.duration = reverseMapKey(listKeyDuration, DurationString);
}
export function initData({
	duration = [],
	order_type: orderType = [],
	destination,
	child_order_type: childOrderType,
	child_duration: childDuration,
	fixed_price_base : fixedPriceBase
}) {
	orderType && setMapOrderType(orderType);
	childOrderType && setMapChildOrderType(childOrderType);
	duration && setMapOrderDuration(duration);
	childDuration && setMapChildOrderDuration(childDuration);
	destination && setMapOrderDestination(destination);
	fixedPriceBase && setMapOrderFixedPrice(fixedPriceBase);
}
export function getDestinations() {
	return model.destination;
}

export function getFixedPriceBase() {
	return model.fixedPriceBase;
}

export function setMapChildOrderType(childOrderType) {
	model.childOrderType = reverseMapKey(childOrderType, OrderTypeString);
}
export function setMapChildOrderDuration(childDuration) {
	model.childDuration = reverseMapKey(childDuration, DurationString);
}
export function setMapOrderDestination(listKeyDestination = []) {
	model.destination = reverseMapKey(listKeyDestination, DestinationString);
}

export function setMapOrderFixedPrice(fixedPriceBase = []) {
	model.fixedPriceBase = fixedPriceBase
}

export function getOrderType(isChild = false) {
	return isChild
		? model.childOrderType || new Map()
		: model.orderType || new Map();
}
export function getOrderDuration(isChild = false) {
	return isChild
		? model.childDuration || new Map()
		: model.duration || new Map();
}
export function getExchange() {
	return model.exchange;
}
export function setExchange(exchange) {
	model.exchange = exchange;
}
export function getSymbol() {
	return model.symbol;
}
export function setSymbol(symbol) {
	model.symbol = symbol;
}
export function detroy() {
	model = {
		orderType: new Map(), // {MARKET:{title:'Market Order',value:MARKET}}
		duration: new Map(), // {EOD:{title:'End Of Day',value:'EOD}},
		destination: new Map(), // {EOD:{title:'End Of Day',value:'EOD}},
		fixedPriceBase : new Map(),
		exchange: null,
		symbol: null
	};
}
export default model;
