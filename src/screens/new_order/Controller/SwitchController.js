import React from 'react-native';
import { Navigation } from 'react-native-navigation';
import { INITIAL_STATE } from '~/screens/new_order/Redux/reducer.js';
import OrderTypeString from '~/constants/order_type_string.js';
import DurationString from '~/constants/durationString.js';
import * as Controller from '~/memory/controller';
import {
	initStore,
	setTriggerPrice
} from '~/screens/new_order/Redux/actions.js';
import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import {
	setDisableTabBuySell,
	setTabTrading
} from '~/screens/new_order/Model/TabModel.js';
import {
	setType,
	setOrderDetail
} from '~/screens/new_order/Model/OrderEntryModel.js';
import { setLimitPrice } from '~/screens/new_order/Model/PriceModel.js';
import { dataStorage, func } from '~/storage';
import OrderTypeEnum from '~/constants/order_type';
import ScreenId from '~/constants/screen_id';
import * as ConditionModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
import * as PriceBaseTabModel from '~/screens/new_order/Model/PriceBaseContingentTabModel';
import * as TabModel from '~/screens/new_order/Model/TabModel.js';

const { NAME_PANEL } = Enum;
let now = new Date().getTime() + 1000 * 60 * 60 * 24;
export function getExpriryTimeLocalDate({ expiryTime }) {
	const time = new Date(expiryTime);
	const y = time.getFullYear();
	let m = time.getMonth() + 1;
	m = m < 10 ? '0' + m : m;
	let d = time.getDate();
	d = d < 10 ? '0' + d : d;
	// console.info('date', expiryTime, `${y}-${m}-${d}T00:00:00.000Z`)
	return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}
export function getExpiryTimeUTC({ expiryTime }) {
	const time = new Date(expiryTime);
	const y = time.getFullYear();
	let m = time.getUTCMonth() + 1;
	m = m < 10 ? '0' + m : m;
	let d = time.getUTCDate();
	d = d < 10 ? '0' + d : d;
	// console.info('date', expiryTime, `${y}-${m}-${d}T00:00:00.000Z`)
	return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}
const getExpiryTime = ({ expiryTime }) => {
	return expiryTime
		? getExpiryTimeUTC({ expiryTime })
		: new Date().getTime() + 1000 * 60 * 60 * 24;
};
export function getObjectNewOrderReduxFromOrderDetail({ data }) {
	let {
		account_id: accountId,
		symbol,
		exchange,
		order_type: orderType,
		duration,
		destination,
		account_name: accountName,
		limit_price: limitPrice = null,
		side,
		filled_quantity: filledQuantity,
		order_quantity: quantity,
		stoploss_order_info: stopLossOrderInfo,
		takeprofit_order_info: takeprofitOrderInfo,
		expiry_time: expiryTime
	} = data;
	expiryTime = expiryTime
		? getExpiryTimeUTC({ expiryTime })
		: new Date().getTime() + 1000 * 60 * 60 * 24;
	let {
		takeprofit_order_id: takeprofitOrderId,
		takeprofit_order_price: takeProfitLoss = null,
		takeprofit_trigger_price: takeprofitTriggerPrice = null,
		takeprofit_order_type: takeprofitOrderType,
		takeprofit_life_time: takeprofitLifeTime,
		takeprofit_expiry_time: takeprofitExpiryTime
	} = takeprofitOrderInfo || {};
	takeprofitExpiryTime = getExpiryTime({ expiryTime: takeprofitExpiryTime });

	let {
		stoploss_order_id: stoplossOrderId,
		stoploss_order_price: stopPrice = null,
		stoploss_trigger_price: stoplossTriggerPrice = null,
		stoploss_order_type: stoplossOrderType,
		stoploss_life_time: stoplossLifeTime,
		stoploss_expiry_time: stoplossExpiryTime
	} = stopLossOrderInfo || {};
	stoplossExpiryTime = getExpiryTime({ expiryTime: stoplossExpiryTime });

	orderType === OrderTypeEnum.LIMIT &&
		limitPrice !== null &&
		setLimitPrice(limitPrice);
	return INITIAL_STATE.merge({
		isBuy: side === 'buy',
		limitPrice: limitPrice,
		orderType: {
			key: orderType,
			label: OrderTypeString[orderType]
		},
		duration: {
			key: duration,
			label: DurationString[duration]
		},
		symbol: symbol.split('.')[0],
		exchange,
		quantity: {
			value: quantity,
			isTypeValue: false
		},
		stopPrice: {
			percent: null,
			value: stoplossTriggerPrice,
			isTypeValue: true,
			orderType: {
				key: stoplossOrderType,
				label: OrderTypeString[stoplossOrderType]
			},
			limitPrice: stopPrice,
			duration: {
				key: stoplossLifeTime,
				label: DurationString[stoplossLifeTime]
			},
			expiryTime: stoplossExpiryTime,
			date: stoplossExpiryTime
		},
		takeProfitLoss: {
			percent: null,
			value: takeprofitTriggerPrice,
			isTypeValue: true,
			orderType: {
				key: takeprofitOrderType,
				label: OrderTypeString[takeprofitOrderType]
			},
			limitPrice: takeProfitLoss,
			duration: {
				key: takeprofitLifeTime,
				label: DurationString[takeprofitLifeTime]
			},
			expiryTime: takeprofitExpiryTime,
			date: takeprofitExpiryTime
		},
		forceDisabledButton: true,
		expiryTime
	});
}

function handleInitTabTrading(type, data) {
	let isMoreSL = false;
	let isMoreTP = false;
	if (type === Enum.AMEND_TYPE.AMEND_ORIGINAL) {
		// Neu lenh amend origin ma co trading thi phai check tab trading
		if (data.stoploss_order_info && data.takeprofit_order_info) {
			type = Enum.AMEND_TYPE.AMEND_TRADING_STRATEGIES;
			// isMoreSL = !!data.stoploss_order_info.stoploss_order_type
			// isMoreTP = !!data.takeprofit_order_info.takeprofit_order_type
		}
		if (data.stoploss_order_info && !data.takeprofit_order_info) {
			// isMoreSL = !!data.stoploss_order_info.stoploss_order_type
			type = Enum.AMEND_TYPE.AMEND_TRADING_STOPPRICE;
		}
		if (!data.stoploss_order_info && data.takeprofit_order_info) {
			type = Enum.AMEND_TYPE.AMEND_TRADING_PROFITLOSS;
			// isMoreTP = !!data.takeprofit_order_info.takeprofit_order_type
		}
	} else {
		// isMoreSL = !!data.stoploss_order_info && data.stoploss_order_info.stoploss_order_type
		// isMoreTP = !!data.takeprofit_order_info && data.takeprofit_order_info.takeprofit_order_type
	}
	// STOPLOSS: false,
	//     MORE_STOPLOSS: false,
	//         TAKE_PROFIT: false,
	//             MORE_TAKE_PROFIT: false
	switch (type) {
		case Enum.AMEND_TYPE.AMEND_TRADING_STOPPRICE:
			setTabTrading({
				STOPLOSS: true,
				TAKE_PROFIT: false,
				MORE_STOPLOSS: true,
				MORE_TAKE_PROFIT: isMoreTP
			});
			break;
		case Enum.AMEND_TYPE.AMEND_TRADING_PROFITLOSS:
			setTabTrading({
				STOPLOSS: false,
				TAKE_PROFIT: true,
				MORE_STOPLOSS: isMoreSL,
				MORE_TAKE_PROFIT: true
			});
			break;
		case Enum.AMEND_TYPE.AMEND_TRADING_STRATEGIES:
			setTabTrading({
				STOPLOSS: true,
				TAKE_PROFIT: true,
				MORE_STOPLOSS: true,
				MORE_TAKE_PROFIT: true
			});
			break;
		case Enum.AMEND_TYPE.AMEND_ORIGINAL:
			setTabTrading({
				STOPLOSS: false,
				TAKE_PROFIT: false,
				MORE_STOPLOSS: isMoreSL,
				MORE_TAKE_PROFIT: isMoreTP
			});
			break;
		default:
			setTabTrading({
				STOPLOSS: false,
				TAKE_PROFIT: false,
				MORE_STOPLOSS: isMoreSL,
				MORE_TAKE_PROFIT: isMoreTP
			});
			break;
	}
}
export function handleShowAmendOrderEntry({ data, navigator, amendType }) {
	setOrderDetail(data);
	const stateAmend = getObjectNewOrderReduxFromOrderDetail({ data });
	const dispatch = Controller.dispatch;
	// Change state newOrder
	dispatch(initStore(stateAmend));
	const {
		ct_status: status,
		ct_condition: condition,
		ct_price_base: priceBase,
		ct_trigger_price: triggerPrice
	} = data;
	const isActive = status === 'ACTIVE' || status === 'PRE_ACTIVE';
	// Set default tabs
	TabModel.model.isDisableTab = !!priceBase;
	ConditionModel.model.isDisableCondition = !!priceBase;

	TabModel.model.layout = !!priceBase ? 'ADVANCE' : 'BASIC';
	if (isActive) {
		TabModel.model.layout = 'ADVANCE';
		ConditionModel.model.depth = condition;
		PriceBaseTabModel.model.depth = priceBase;
		ConditionModel.model.isDisableCondition = false;
	}

	//
	handleInitTabTrading(amendType, data);
	setType(amendType);
	Navigation.showModal({
		screen: 'equix.NewOrder',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorModalSpecialNoHeader,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			// hideDetail: props.hideDetail,
			// setSpaceTop: props.setSpaceTop,
			namePanel: NAME_PANEL.NEW_ORDER,
			isSwitchFromQuickButton: false,
			symbol: stateAmend.symbol,
			exchange: stateAmend.exchange,
			contingentData: {
				status,
				condition,
				priceBase,
				triggerPrice
			},
			onHideAll: () => {
				dataStorage.currentScreenId = ScreenId.ORDERS;
				setType(Enum.AMEND_TYPE.DEFAULT);
			}
		}
	});
}
export function handleShowCancelOrder({ data, navigator, amendType }) {
	setOrderDetail(data);
	const stateAmend = getObjectNewOrderReduxFromOrderDetail({ data });
	const dispatch = Controller.dispatch;
	// Change state newOrder
	dispatch(initStore(stateAmend));
	//
	handleInitTabTrading(amendType);
	setType(amendType);
	Navigation.showModal({
		screen: 'equix.ConfirmCancel',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorModalSpecialNoHeader,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			// hideDetail: props.hideDetail,
			// setSpaceTop: props.setSpaceTop,
			namePanel: NAME_PANEL.NEW_ORDER,
			isSwitchFromQuickButton: false,
			dicValueUpdate: {
				symbol: stateAmend.symbol,
				exchange: stateAmend.exchange
			},
			onHideAll: () => {
				dataStorage.currentScreenId = ScreenId.ORDERS;
				setType(Enum.AMEND_TYPE.DEFAULT);
			}
		}
	});
}
export function handleShowNewOrder({ symbol, exchange, onHideAll }) {
	Controller.setStatusModalCurrent(true);
	Navigation.showModal({
		screen: 'equix.NewOrder',
		animated: false,
		animationType: 'none',
		navigatorStyle: {
			...CommonStyle.navigatorModalSpecialNoHeader,
			modalPresentationStyle: 'overCurrentContext'
		},
		passProps: {
			// hideDetail: props.hideDetail,
			// setSpaceTop: props.setSpaceTop,
			namePanel: NAME_PANEL.NEW_ORDER,
			isSwitchFromQuickButton: false,
			symbol,
			exchange,
			onHideAll: () => {
				Controller.setStatusModalCurrent(false);
				dataStorage.currentScreenId = ScreenId.WATCHLIST;
				onHideAll && onHideAll();
			}
		}
	});
}
