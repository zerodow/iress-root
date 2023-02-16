import Immutable from 'seamless-immutable';
import Enum from '~/enum';
import TYPE from './constants';
import _ from 'lodash';

import {
	getLastPrice,
	setLimitPrice,
	setOrderType,
	reset as resetPriceModel,
	resetPriceModelWhenChangeAccount,
	getOrderPriceAndVolWhenChangeOrderType
} from '~/screens/new_order/Model/PriceModel.js';
import * as TabModel from '~/screens/new_order/Model/TabModel.js';
import { setIsBuy } from '~/screens/new_order/Model/OrderEntryModel.js';
import {
	formatPriceOnFocus,
	getValueForStopPrice,
	getPercentForStopPrice,
	getValueForTakeProfitLoss,
	getPercentForTakeProfitLoss,
	getValueForRedux,
	getStopPriceObjWhenLimitPriceChange,
	getTakeProfitLossPriceObjWhenLimitPriceChange,
	getDecimalPriceByRule,
	getOrderValueByRule,
	getQuantityByOrderValue
} from '~/screens/new_order/Controller/InputController.js';
import OrderTypeEnum from '~/constants/order_type';
import { resetContingentCondition } from '../Model/PriceBaseContingentConditionModel';
import { resetContingentPricebase } from '../Model/PriceBaseContingentTabModel';
const { STATE_BUY_SELL, PRICE_DECIMAL } = Enum;
let now = new Date().getTime() + 1000 * 60 * 60 * 24;
export const INITIAL_STATE = Immutable({
	isBuy: true,
	limitPrice: null,
	triggerPrice: '0',
	orderType: {}, // {key:'LIMIT',label:'Limit'}
	orderTypeObjectSelected: null, // Tam thoi luu 2 gia tri order. Gia tri nay de map vao selection. Nguyen nhan tu orderType la orderTypeEnum khong the map nguoc lai OrderTypeString
	duration: {}, // {  }
	destination: null,
	symbol: '',
	exchange: '',
	date: now,
	textSearch: '',
	isLoading: true,
	isLoadingSearch: true,
	isloadingCheckVetting: false, // Loading when check vetting
	positionAffected: {},
	layout: Enum.ORDER_LAYOUT.BASIC,
	isLoadingOrderAttribute: true,
	isShowOrderValue: false, // tru show orderValue else show volume
	quantity: {
		value: null,
		isTypeValue: false
	},
	ctTriggerPrice: {
		value: 0,
		isTypeValue: false
	},
	orderValue: {
		value: null,
		isTypeValue: false
	},
	stopPrice: {
		percent: null,
		value: null,
		isTypeValue: true, // tru is enter $ else enter percent
		orderType: {},
		limitPrice: null,
		duration: {
			key: 'EOD',
			label: 'End Of Day'
		},
		expiryTime: now,
		date: now
	},
	takeProfitLoss: {
		percent: null,
		value: null,
		isTypeValue: true,
		orderType: {},
		limitPrice: null,
		duration: {
			key: 'EOD',
			label: 'End Of Day'
		},
		expiryTime: now,
		date: now
	},
	textChanged: undefined,
	inputFocus: null,
	type: 'NEW_ORDER',
	forceDisabledButton: false,
	stepQuantity: 1,
	stepOrderValue: 1,
	toggleIgnoreType: undefined,
	expiryTime: now,
	enableContingent: false, // enable or disable contingent strategy,
	enableContingentBlock: false, // enable or disable contingent strategy block which let user abble to input,
	isContingentTypePoint: true, // type Points / Price when keyboard show on input of ContingentBlock,
	calculateTriggerPrice: undefined, // POINTS/PRICE/undefined,
	templateTriggerPrice: 0,
	currentInputShown: 0
});
export default function reducer(state = INITIAL_STATE, action) {
	switch (action.type) {
		case TYPE.NEW_ORDER_CHANGE_DISABLED_BUTTON_CONFIRM:
			return state.merge({
				forceDisabledButton: action.payload
			});
		case TYPE.NEW_ORDER_INIT_STORE:
			setIsBuy(action.payload.isBuy);
			return action.payload;
		case TYPE.NEW_ORDER_UPDATE_STATE:
			return state.merge(action.payload);
		case TYPE.NEW_ORDER_CHANGE_BUY_SELL:
			setIsBuy(action.payload);
			return state.merge({ isBuy: action.payload });
		case TYPE.NEW_ORDER_CHANGE_ORDER_TYPE:
			setOrderType(action.payload.key); // Luu lai order type de check gia trigger
			if (action.payload.key !== OrderTypeEnum.LIMIT) {
				setLimitPrice(0);
				let tmpValue = getOrderPriceAndVolWhenChangeOrderType({
					quantity: state.quantity.value,
					orderPrice: state.orderValue.value,
					isTypeValue: state.quantity.isTypeValue
				});
				return state.merge({
					limitPrice: null,
					orderType: action.payload,
					orderValue: { ...state.orderValue, value: tmpValue.value },
					quantity: { ...state.quantity, value: tmpValue.vol }
				});
			}
			setLimitPrice(state.limitPrice);
			let tmpValue = getOrderPriceAndVolWhenChangeOrderType({
				quantity: state.quantity.value,
				orderPrice: state.orderValue.value,
				isTypeValue: state.quantity.isTypeValue
			});
			return state.merge({
				orderType: action.payload,
				orderValue: { ...state.orderValue, value: tmpValue.value },
				quantity: { ...state.quantity, value: tmpValue.vol }
			});
		case TYPE.NEW_ORDER_CHANGE_ORDER_TYPE_OBJECT:
			return state.merge({
				orderObjectSelected: action.payload
			});
		case TYPE.NEW_ORDER_UPDATE_CURRENT_INPUT_SHOWN:
			return state.merge({
				currentInputShown: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_SYMBOL_EXCHANGE:
			return state.merge({
				symbol: action.payload.symbol,
				exchange: action.payload.exchange
			});
		case TYPE.NEW_ORDER_CHANGE_QUANTITY:
			const value = getOrderValueByRule({
				orderQuantity: action.payload
			});
			const orderValue = {
				value: value,
				isTypeValue: state.quantity.isTypeValue
			};
			return state.merge({
				quantity: {
					value: action.payload,
					isTypeValue: state.quantity.isTypeValue
				},
				orderValue
			});
		case TYPE.NEW_ORDER_CHANGE_PRICE:
			return state.merge(action.payload);
		case TYPE.NEW_ORDER_CHANGE_LIMIT_PRICE:
			// Khi limitPrice thay doi cung phai thay doi ca orderValue
			return state.merge({
				limitPrice: action.payload,
				orderValue: {
					value: state.quantity.isTypeValue
						? state.orderValue.value
						: getOrderValueByRule({
							orderQuantity: state.quantity.value
						}), // 100 cent = 1 $
					isTypeValue: state.quantity.isTypeValue
				},
				quantity: {
					value: state.quantity.isTypeValue
						? getQuantityByOrderValue({
							orderValue: state.orderValue.value
						})
						: state.quantity.value,
					isTypeValue: state.quantity.isTypeValue
				},
				stopPrice: getStopPriceObjWhenLimitPriceChange({ state }),
				takeProfitLoss: getTakeProfitLossPriceObjWhenLimitPriceChange({
					state
				})
			});
		case TYPE.NEW_ORDER_CHANGE_DURATION:
			return state.merge({
				duration: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_DATE_PERIOD:
			return state.merge({
				date: action.payload,
				expiryTime: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_DESTINATION:
			return state.merge({
				destination: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_TEXT_SEARCH:
			return state.merge({
				textSearch: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_LOADING:
			return state.merge({
				isLoading: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_LOADING_BOX_ACCOUNT:
			return state.merge({
				isLoadingBoxAccount: action.payload
			});

		case TYPE.NEW_ORDER_CHANGE_LOADING_SEARCH:
			return state.merge({
				isLoadingSearch: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_LOADING_CHECK_VETTING:
			return state.merge({
				isloadingCheckVetting: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_POSITION_AFFECTED:
			const listPosition = action.payload;
			const { symbol, exchange } = state;
			const position =
				listPosition.find((el) => el.symbol === symbol) || {};
			return state.merge({
				positionAffected: position
			});
		case TYPE.NEW_ORDER_CHANGE_BUY_SELL_AND_POSITION_AFFECTED: // Mo order tu portfolio thi khi chuyen side sang sell thi fill holding position
			return resetStateOrderWhenChangeSideToSell(state, action);
		case TYPE.NEW_ORDER_RESET_STATE:
			TabModel.reset();
			resetPriceModel();
			return resetAllStateOrder();
		case TYPE.NEW_ORDER_RESET_OBJECT_ORDER:
			return resetAllStateOrder();
		case TYPE.NEW_ORDER_CHANGE_LAYOUT:
			return state.merge({
				layout: action.payload
			});
		case TYPE.NEW_ORDER_TOGGLE_CONTINGENT:
			return state.merge({
				enableContingent: action.payload
			});
		case TYPE.NEW_ORDER_TOGGLE_CONTINGENT_BLOCK:
			return state.merge({
				enableContingentBlock: action.payload
			});
		case TYPE.NEW_ORDER_SET_TEMPLATE_PRICE_POINT_VALUE:
			return state.merge({
				templateTriggerPrice: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_LOADING_ORDER_ATTRIBUTE:
			return state.merge({
				isLoadingOrderAttribute: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_FOCUS_INPUT:
			return state.merge({
				inputFocus: action.payload
			});
		// Action khi change type input volume on keyboard
		case TYPE.NEW_ORDER_CHANGE_TYPE_INPUT_ORDER_VALUE_VOLUME:
			return state.merge({
				quantity: {
					value: state.quantity.value,
					isTypeValue: action.payload
				},
				orderValue: {
					value: action.payload
						? getOrderValueByRule({
							orderQuantity: state.quantity.value
						})
						: state.orderValue.value, // 100 cent = 1 $
					isTypeValue: action.payload
				}
			});
		case TYPE.NEW_ORDER_CONTIGENT_TYPE:
			return state.merge({
				isContingentTypePoint: action.payload
			});
		case TYPE.NEW_ORDER_CALCULATE_TRIGGER_PRICE:
			return state.merge({
				calculateTriggerPrice: action.payload
			});
		case TYPE.NEW_ORDER_SET_TRIGGER_PRICE:
			return state.merge({
				ctTriggerPrice: {
					value: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_ORDER_VALUE:
			const quantity = {
				value: getQuantityByOrderValue({ orderValue: action.payload }),
				isTypeValue: state.quantity.isTypeValue
			};
			return state.merge({
				quantity,
				orderValue: {
					value: action.payload,
					isTypeValue: state.orderValue.isTypeValue
				}
			});
		// Handle change stopPrice
		case TYPE.NEW_ORDER_CHANGE_TYPE_INPUT_STOP_PRICE: // Action khi change type input on keyboard
			return state.merge({
				stopPrice: {
					...state.stopPrice,
					percent: action.payload
						? state.stopPrice.percent
						: getPercentForStopPrice(state.stopPrice.value),
					value: action.payload
						? getValueForStopPrice(
							state.stopPrice.percent,
							getDecimalPriceByRule()
						)
						: state.stopPrice.value,
					isTypeValue: action.payload // tru is enter $ else enter percent
				}
			});
		case TYPE.NEW_ORDER_CHANGE_STOP_PRICE:
			return state.merge({
				stopPrice: {
					...state.stopPrice,
					percent: state.stopPrice.isTypeValue
						? getPercentForStopPrice(action.payload)
						: action.payload,
					value: state.stopPrice.isTypeValue
						? action.payload
						: getValueForStopPrice(
							action.payload,
							getDecimalPriceByRule()
						),
					isTypeValue: state.stopPrice.isTypeValue // tru is enter $ else enter percent
				}
			});
		// Handle change takeProfitLoss
		case TYPE.NEW_ORDER_CHANGE_TYPE_INPUT_TAKE_PROFIT_LOSS: // Action khi change type input on keyboard
			return state.merge({
				takeProfitLoss: {
					...state.takeProfitLoss,
					percent: action.payload
						? state.takeProfitLoss.percent
						: getPercentForTakeProfitLoss(
							state.takeProfitLoss.value
						),
					value: action.payload
						? getValueForTakeProfitLoss(
							state.takeProfitLoss.percent,
							getDecimalPriceByRule()
						)
						: state.takeProfitLoss.value,
					isTypeValue: action.payload // tru is enter $ else enter percent
				}
			});
		case TYPE.NEW_ORDER_CHANGE_TAKE_PROFIT_LOSS: // Action khi change type input on keyboard
			return state.merge({
				takeProfitLoss: {
					...state.takeProfitLoss,
					percent: state.takeProfitLoss.isTypeValue
						? getPercentForTakeProfitLoss(action.payload)
						: action.payload,
					value: state.takeProfitLoss.isTypeValue
						? action.payload
						: getValueForTakeProfitLoss(
							action.payload,
							getDecimalPriceByRule()
						),
					isTypeValue: state.takeProfitLoss.isTypeValue // tru is enter $ else enter percent
				}
			});
		case TYPE.NEW_ORDER_CHANGE_STEP_QUANTITY:
			return state.merge({
				stepQuantity: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_STEP_ORDER_VALUE:
			return state.merge({
				stepOrderValue: action.payload
			});
		case TYPE.NEW_ORDER_RESET_STATE_WHEN_CHANGE_ACCOUNT:
			resetPriceModelWhenChangeAccount();
			TabModel.reset();
			return resetStateNewOrderWhenChangeAccount({ state });
		case TYPE.NEW_ORDER_CHANGE_ORDER_TYPE_SL:
			return state.merge({
				stopPrice: {
					...state.stopPrice,
					orderType: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_ORDER_TYPE_TP:
			return state.merge({
				takeProfitLoss: {
					...state.takeProfitLoss,
					orderType: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_INPUT_TEXT:
			return state.merge({
				textChanged: action.payload
			});
		case TYPE.NEW_ORDER_TOGGLE_IGNORE_TYPE:
			return state.merge({
				toggleIgnoreType: action.payload
			});
		case TYPE.NEW_ORDER_CHANGE_LIMIT_PRICE_SL:
			return state.merge({
				stopPrice: {
					...state.stopPrice,
					limitPrice: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_LIMIT_PRICE_TP:
			return state.merge({
				takeProfitLoss: {
					...state.takeProfitLoss,
					limitPrice: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_DURATION_SL:
			return state.merge({
				stopPrice: {
					...state.stopPrice,
					duration: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_DURATION_TP:
			return state.merge({
				takeProfitLoss: {
					...state.takeProfitLoss,
					duration: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_DATE_PERIOD_SL:
			return state.merge({
				stopPrice: {
					...state.stopPrice,
					date: action.payload,
					expiryTime: action.payload
				}
			});
		case TYPE.NEW_ORDER_CHANGE_DATE_PERIOD_TP:
			return state.merge({
				takeProfitLoss: {
					...state.takeProfitLoss,
					date: action.payload,
					expiryTime: action.payload
				}
			});
		default:
			return state;
	}
}
function resetStateOrderWhenChangeSideToSell(state, action) {
	setIsBuy(action.payload.isBuy);
	resetContingentCondition();
	resetContingentPricebase();
	return state.merge({
		limitPrice: null,
		triggerPrice: 0,
		orderType: {},
		orderObjectSelected: null,
		duration: {}, // GTD
		destination: null,
		// symbol: '',
		// exchange: '',
		date: now,
		textSearch: '',
		isLoadingSearch: true,
		isloadingCheckVetting: false,
		orderTypeObjectSelected: null,
		layout: Enum.ORDER_LAYOUT.BASIC,
		textChanged: undefined,
		toggleIgnoreType: undefined,
		orderValue: {
			value: null,
			isTypeValue: false
		},
		stopPrice: {
			percent: null,
			value: null,
			isTypeValue: true, // tru is enter $ else enter percent
			orderType: {},
			limitPrice: null,
			duration: {
				key: 'EOD',
				label: 'End Of Day'
			},
			expiryTime: now,
			date: now
		},
		takeProfitLoss: {
			percent: null,
			value: null,
			isTypeValue: true,
			orderType: {},
			limitPrice: null,
			duration: {
				key: 'EOD',
				label: 'End Of Day'
			},
			expiryTime: now,
			date: now
		},
		inputFocus: null,
		positionAffected: action.payload.position,
		isBuy: action.payload.isBuy,
		quantity: {
			value: action.payload.volume,
			isTypeValue: false
		},
		stepQuantity: 1,
		stepOrderValue: 1,
		ctTriggerPrice: {
			value: 0,
			isTypeValue: false
		},
		currentInputShown: 0,
		enableContingent: false, // enable or disable contingent strategy,
		enableContingentBlock: false, // enable or disable contingent strategy block which let user abble to input,
		isContingentTypePoint: true, // type Points / Price when keyboard show on input of ContingentBlock
		calculateTriggerPrice: undefined, // POINTS/PRICE/undefined
		templateTriggerPrice: 0
	});
}
function resetAllStateOrder(state) {
	setLimitPrice(0);
	setIsBuy(true);
	resetContingentCondition();
	resetContingentPricebase();
	return Immutable({
		limitPrice: null,
		triggerPrice: 0,
		orderType: {},
		orderObjectSelected: null,
		duration: {}, // GTD
		destination: null,
		symbol: '',
		exchange: '',
		date: now,
		textSearch: '',
		isLoading: true,
		isLoadingSearch: true,
		isloadingCheckVetting: false,
		orderTypeObjectSelected: null,
		layout: Enum.ORDER_LAYOUT.BASIC,
		toggleIgnoreType: undefined,
		isBuy: true,
		quantity: {
			value: null,
			isTypeValue: false
		},
		orderValue: {
			value: null,
			isTypeValue: false
		},
		stopPrice: {
			percent: null,
			value: null,
			isTypeValue: true, // tru is enter $ else enter percent
			orderType: {},
			limitPrice: null,
			duration: {
				key: 'EOD',
				label: 'End Of Day'
			},
			expiryTime: now,
			date: now
		},
		takeProfitLoss: {
			percent: null,
			value: null,
			isTypeValue: true,
			orderType: {},
			limitPrice: null,
			duration: {
				key: 'EOD',
				label: 'End Of Day'
			},
			expiryTime: now,
			date: now
		},
		textChanged: undefined,
		inputFocus: null,
		positionAffected: {},
		forceDisabledButton: false,
		stepQuantity: 1,
		stepOrderValue: 1,
		expiryTime: now,
		ctTriggerPrice: {
			value: 0,
			isTypeValue: false
		},
		currentInputShown: 0,
		enableContingent: false, // enable or disable contingent strategy,
		enableContingentBlock: false, // enable or disable contingent strategy block which let user abble to input,
		isContingentTypePoint: true, // type Points / Price when keyboard show on input of ContingentBlock
		calculateTriggerPrice: undefined, // POINTS/PRICE/undefined
		templateTriggerPrice: 0
	});
}
function resetStateNewOrderWhenChangeAccount({ state }) {
	setLimitPrice(0);
	setIsBuy(true);
	resetContingentCondition();
	resetContingentPricebase();
	return state.merge({
		limitPrice: null,
		triggerPrice: 0,
		orderType: {},
		orderObjectSelected: null,
		duration: {}, // GTD
		destination: null,
		textChanged: undefined,
		// symbol: '',
		// exchange: '',
		date: now,
		textSearch: '',
		// isLoading: true,
		isLoadingSearch: true,
		isloadingCheckVetting: false,
		orderTypeObjectSelected: null,
		layout: Enum.ORDER_LAYOUT.BASIC,
		toggleIgnoreType: undefined,
		isBuy: true,
		quantity: {
			value: null,
			isTypeValue: false
		},
		orderValue: {
			value: null,
			isTypeValue: false
		},
		stopPrice: {
			percent: null,
			value: null,
			isTypeValue: true, // tru is enter $ else enter percent
			orderType: {},
			limitPrice: null,
			duration: {
				key: 'EOD',
				label: 'End Of Day'
			},
			expiryTime: now,
			date: now
		},
		takeProfitLoss: {
			percent: null,
			value: null,
			isTypeValue: true,
			orderType: {},
			limitPrice: null,
			duration: {
				key: 'EOD',
				label: 'End Of Day'
			},
			expiryTime: now,
			date: now
		},
		inputFocus: null,
		positionAffected: {},
		forceDisabledButton: false,
		stepQuantity: 1,
		stepOrderValue: 1,
		expiryTime: now,
		ctTriggerPrice: {
			value: 0,
			isTypeValue: false
		},
		enableContingent: false, // enable or disable contingent strategy,
		enableContingentBlock: false, // enable or disable contingent strategy block which let user abble to input,
		isContingentTypePoint: true, // type Points / Price when keyboard show on input of ContingentBlock
		calculateTriggerPrice: undefined, // POINTS/PRICE/undefined
		templateTriggerPrice: 0,
		currentInputShown: 0
	});
}
