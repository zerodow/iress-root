import TYPE from './constants';
export function updateState(state) {
	return {
		type: TYPE.NEW_ORDER_UPDATE_STATE,
		payload: state
	};
}
export function changeBuySell(isBuy) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_BUY_SELL,
		payload: isBuy
	};
}

export function changeOrderType(orderType) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_ORDER_TYPE,
		payload: orderType
	};
}
export function changeOrderTypeSL(orderType) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_ORDER_TYPE_SL,
		payload: orderType
	};
}
export function changeOrderTypeTP(orderType) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_ORDER_TYPE_TP,
		payload: orderType
	};
}
export function changeOrderTypeObjectSelected(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_ORDER_TYPE_OBJECT,
		payload: payload
	};
}
export function changeOrderQuantity(quantity) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_QUANTITY,
		payload: quantity
	};
}
export function changeOrderPrice(price) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_PRICE,
		payload: price
	};
}
export function changeLimitPrice(price) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LIMIT_PRICE,
		payload: price
	};
}
export function changeLimitPriceSL(price) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LIMIT_PRICE_SL,
		payload: price
	};
}
export function changeLimitPriceTP(price) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LIMIT_PRICE_TP,
		payload: price
	};
}
export function changeSymbolExchange(payload = { symbol: '', exchange: '' }) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_SYMBOL_EXCHANGE,
		payload: payload
	};
}
export function changeDuration(duration) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DURATION,
		payload: duration
	};
}
export function changeDurationSL(duration) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DURATION_SL,
		payload: duration
	};
}
export function changeDurationTP(duration) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DURATION_TP,
		payload: duration
	};
}
export function changeDestination(destination) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DESTINATION,
		payload: destination
	};
}
export function changeDatePeriod(datePeriod) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DATE_PERIOD,
		payload: datePeriod
	};
}
export function changeDatePeriodSL(datePeriod) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DATE_PERIOD_SL,
		payload: datePeriod
	};
}
export function changeDatePeriodTP(datePeriod) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DATE_PERIOD_TP,
		payload: datePeriod
	};
}
export function changeTextSearch(textSearch) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_TEXT_SEARCH,
		payload: textSearch
	};
}
export function changeLoading(isLoading) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LOADING,
		payload: isLoading
	};
}
export function changeLoadingBoxAccount(isLoading) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LOADING_BOX_ACCOUNT,
		payload: isLoading
	};
}
export function changeLoadingSearch(isLoading) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LOADING_SEARCH,
		payload: isLoading
	};
}
export function changeLoadingCheckVetting(isLoadingCheckVetting) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LOADING_CHECK_VETTING,
		payload: isLoadingCheckVetting
	};
}
export function changePositionAffected(position) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_POSITION_AFFECTED,
		payload: position
	};
}
export function changeBuySellAndPositionAffected({ isBuy, position, volume }) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_BUY_SELL_AND_POSITION_AFFECTED,
		payload: { isBuy, position, volume }
	};
}
export function resetStateNewOrder() {
	return {
		type: TYPE.NEW_ORDER_RESET_STATE
	};
}
export function resetStateObjectNewOrder() {
	return {
		type: TYPE.NEW_ORDER_RESET_OBJECT_ORDER
	};
}
export function changeLayout(layout) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LAYOUT,
		payload: layout
	};
}

// Show/hide first Contingent strategry which let block of contingent show or not
export function toggleContingent(enable) {
	return {
		type: TYPE.NEW_ORDER_TOGGLE_CONTINGENT,
		payload: enable
	};
}

// Display block of contingent
export function activeContingent(enable) {
	return {
		type: TYPE.NEW_ORDER_TOGGLE_CONTINGENT_BLOCK,
		payload: enable
	};
}

export function setTemplatePriceValue(price) {
	return {
		type: TYPE.NEW_ORDER_SET_TEMPLATE_PRICE_POINT_VALUE,
		payload: price
	};
}

export function changeLoadingOrderAttribute(isLoading = true) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_LOADING_ORDER_ATTRIBUTE,
		payload: isLoading
	};
}
export function changeFocusInput(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_FOCUS_INPUT,
		payload
	};
}
export function changeTypeInputOrderValueVolume(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_TYPE_INPUT_ORDER_VALUE_VOLUME,
		payload
	};
}
export function changeTypeInputOrderContingent(payload) {
	return {
		type: TYPE.NEW_ORDER_CONTIGENT_TYPE,
		payload
	};
}
export function changeInputText(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_INPUT_TEXT,
		payload
	};
}
export function toggleIgnoreType(payload) {
	return {
		type: TYPE.NEW_ORDER_TOGGLE_IGNORE_TYPE,
		payload
	};
}
export function updateCurrentInputShown(payload) {
	return {
		type: TYPE.NEW_ORDER_UPDATE_CURRENT_INPUT_SHOWN,
		payload
	};
}
export function setTriggerPrice(payload) {
	return {
		type: TYPE.NEW_ORDER_SET_TRIGGER_PRICE,
		payload
	};
}
export function forceCalculateTriggerPrice(payload) {
	return {
		type: TYPE.NEW_ORDER_CALCULATE_TRIGGER_PRICE,
		payload
	};
}
export function changeTypeInputStopPrice(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_TYPE_INPUT_STOP_PRICE,
		payload
	};
}
export function changeTypeInputTakeProfitLoss(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_TYPE_INPUT_TAKE_PROFIT_LOSS,
		payload
	};
}
export function changeOrderValue(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_ORDER_VALUE,
		payload
	};
}
export function changeStopPrice(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_STOP_PRICE,
		payload
	};
}
export function changeTakeProfitLoss(payload) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_TAKE_PROFIT_LOSS,
		payload
	};
}
export function initStore(payload) {
	return {
		type: TYPE.NEW_ORDER_INIT_STORE,
		payload
	};
}
export function changeStatusButtonConfirm(disabled) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_DISABLED_BUTTON_CONFIRM,
		payload: disabled
	};
}
export function changeStepQuantity(step) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_STEP_QUANTITY,
		payload: step
	};
}
export function changeStepOrderValue(step) {
	return {
		type: TYPE.NEW_ORDER_CHANGE_STEP_ORDER_VALUE,
		payload: step
	};
}
export function resetStateWhenChangeAccount() {
	return {
		type: TYPE.NEW_ORDER_RESET_STATE_WHEN_CHANGE_ACCOUNT
	};
}
export function getAttribute({ symbol, exchange }) {
	return {
		type: TYPE.NEW_ORDER_GET_ATTRIBUTE,
		payload: {
			symbol,
			exchange
		}
	};
}
