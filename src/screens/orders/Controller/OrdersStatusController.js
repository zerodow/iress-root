import CommonStyle from '~/theme/theme_controller';
import { getOrderTag } from '~s/orders/Model/OrdersModel';
import ENUM from '~/enum';
import { TrustDetail } from '~/screens/trust/trust_detail';

const {
	ORDER_TAG,
	SLTP_ORDER_STATUS,
	ST_TP_ORDER_ACTION,
	ACTION_STATUS,
	FILL_STATUS
} = ENUM;
export function getOrderStatusProperty({ orderAction, actionStatus }) {
	actionStatus = (actionStatus + '').toUpperCase();
	let orderStatusString = '';
	let orderStatusBgColor = CommonStyle.fontNearLight6;
	let iconName = '';
	let isShow = true;
	/*
        1. list action status:
            OK
            AUTHORISING
            PENDING
            QUEUED
            DENIED
            FAILED
        2. list order action:
            Create
            Amend
            Cancel
            Purge
    */
	switch (actionStatus) {
		case 'OK':
			orderStatusString = `${orderAction || '--'} OK`;
			switch (orderAction) {
				case 'Create':
					iconName = '';
					orderStatusBgColor = CommonStyle.color.buy;
					break;
				case 'Amend':
					iconName = 'rowSelectedBlack';
					// orderStatusBgColor = '#30FF8F'
					orderStatusBgColor = CommonStyle.color.buy;
					break;
				case 'Purge':
					iconName = 'x';
					// orderStatusBgColor = '#FD3754'
					orderStatusBgColor = CommonStyle.color.buy;
					break;
				default:
					// Cancel
					iconName = 'x';
					// orderStatusBgColor = '#FD3754'
					orderStatusBgColor = CommonStyle.color.buy;
					break;
			}
			if (orderAction === 'Create') {
				isShow = false;
			}
			break;
		case 'AUTHORISING':
			orderStatusString = `${orderAction || '--'} Auth`;
			orderStatusBgColor = CommonStyle.color.modify;
			switch (orderAction) {
				case 'Create':
				case 'Amend':
				case 'Purge':
					iconName = 'pendingState';
					break;
				default:
					// Cancel
					iconName = 'pendingState';
					break;
			}
			break;
		case 'PENDING':
			orderStatusString = `${orderAction || '--'} Pending`;
			orderStatusBgColor = CommonStyle.color.modify;
			switch (orderAction) {
				case 'Create':
				case 'Amend':
				case 'Purge':
					iconName = 'pendingState';
					break;
				default:
					// Cancel
					iconName = 'pendingState';
					break;
			}
			break;
		case 'QUEUED':
			orderStatusString = `${orderAction || '--'} Queued`;
			orderStatusBgColor = CommonStyle.color.modify;
			switch (orderAction) {
				case 'Create':
				case 'Amend':
				case 'Purge':
					iconName = 'pendingState';
					break;
				default:
					// Cancel
					iconName = 'pendingState';
					break;
			}
			break;
		case 'DENIED':
			orderStatusString = `${orderAction || '--'} Denied`;
			orderStatusBgColor = CommonStyle.color.sell;
			switch (orderAction) {
				case 'Create':
				case 'Amend':
				case 'Purge':
					iconName = 'warning';
					break;
				default:
					// Cancel
					iconName = 'warning';
					break;
			}
			break;
		default:
			// Default is FAILED
			orderStatusString = `${orderAction || '--'} Failed`;
			orderStatusBgColor = CommonStyle.color.sell;
			switch (orderAction) {
				case 'Create':
				case 'Amend':
				case 'Purge':
					iconName = 'warning';
					break;
				default:
					// Cancel
					iconName = 'warning';
					break;
			}
			break;
	}
	return {
		text: orderStatusString,
		backgroundColor: orderStatusBgColor,
		iconName,
		isShow
	};
}
export function getTextInsideCircleProperty({
	filledQuantity,
	orderQuantity,
	SLOrderStatus,
	TPOrderStatus,
	isStoploss,
	isTakeProfit,
	orderObject = {},
	contingentStatus
}) {
	if (contingentStatus === 'ACTIVE') {
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.warning
			},
			text: 'Active'
		};
	}
	if (contingentStatus === 'PRE_ACTIVE') {
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.warning
			},
			text: 'Pre-Active'
		};
	}

	if (filledQuantity === 0) {
		// lenh cha chua fillted thi lenh con chua active, hay trigged nen ko can check
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.fontColor,
				opacity: 0.7
			},
			text: 'Unfilled'
		};
	}
	if (checkOrderPartialFill({ orderQuantity, filledQuantity })) {
		// Lenh cha filled mot phan thi neu khong phai lenh Contingent thi hien thi Partially Filled
		// Nguoc lai phai check trang thai chan lenh: Neu chan lenh active thi hien thi la
		if (!isStoploss && !isTakeProfit) {
			// Lenh khong co chan
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font7,
					color: CommonStyle.color.warning
				},
				text: 'Partially Filled'
			};
		}
		if (isStoploss && isTakeProfit) {
			// Lenh 2 chan deu active va lenh cha da fill 1 phan
			const stIsActive = checkOrderLegIsActive({
				orderStatus: SLOrderStatus
			});
			const tpIsActive = checkOrderLegIsActive({
				orderStatus: TPOrderStatus
			});
			if (stIsActive && tpIsActive) {
				return {
					textStyle: {
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font7,
						color: CommonStyle.color.modify
					},
					text: 'Strategy Active'
				};
			}
		}
		const isOrderLegSLTriggered =
			isStoploss &&
			checkOrderLegIsTriggered({ orderStatus: SLOrderStatus });
		if (isOrderLegSLTriggered) {
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font7,
					color: CommonStyle.color.modify
				},
				text: 'Stop Loss Triggered'
			};
		}
		const isOrderLegTPTriggered =
			isTakeProfit &&
			checkOrderLegIsTriggered({ orderStatus: TPOrderStatus });
		if (isOrderLegTPTriggered) {
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font7,
					color: CommonStyle.color.modify
				},
				text: 'Take Profit Triggered'
			};
		}
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.warning
			},
			text: 'Partially Filled'
		};
	}
	if (filledQuantity === orderQuantity) {
		// Neu Lenh cha filled
		// Complete khi thằng cha filled và�SL/TP tổng volume filled (Volume = 100 => SL = 50 TP = 50 SL = 100 hoặc TP = 100)
		// SL / TP cancelled
		// SL / TP purged
		// SL fully filled và TP cancelled / purge(và ngược lại)

		// Lech khong co con va da fill
		if (!isStoploss && !isTakeProfit) {
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font6,
					color: CommonStyle.color.buy
				},
				text: 'Completed'
			};
		}
		if (checkOrderAllLegCancelOrPurged({ item: orderObject })) {
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font6,
					color: CommonStyle.color.buy
				},
				text: 'Completed'
			};
		}
		if (checkOrderContingentHadFilled({ item: orderObject })) {
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font6,
					color: CommonStyle.color.buy
				},
				text: 'Completed'
			};
		}
		if (isStoploss && isTakeProfit) {
			// Lenh 2 chan deu active va lenh cha da filly
			const stIsActive = checkOrderLegIsActive({
				orderStatus: SLOrderStatus
			});
			const tpIsActive = checkOrderLegIsActive({
				orderStatus: TPOrderStatus
			});
			const stIsInActive = checkOrderLegIsInActive({
				orderStatus: SLOrderStatus
			});
			const tpIsInActive = checkOrderLegIsInActive({
				orderStatus: TPOrderStatus
			});
			if (stIsActive && tpIsActive) {
				return {
					textStyle: {
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font7,
						color: CommonStyle.color.modify
					},
					text: 'Strategy Active'
				};
			}
			if (stIsActive && tpIsInActive) {
				return {
					textStyle: {
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font7,
						color: CommonStyle.color.modify
					},
					text: 'Strategy Active'
				};
			}
			if (tpIsActive && stIsInActive) {
				return {
					textStyle: {
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font7,
						color: CommonStyle.color.modify
					},
					text: 'Strategy Active'
				};
			}
		}
		if (checkOrderOnlyHaveOneLeg({ isTakeProfit, isStoploss })) {
			// Lenh 1 chan active va lenh cha da filly
			const stIsActive = checkOrderLegIsActive({
				orderStatus: SLOrderStatus
			});
			const tpIsActive = checkOrderLegIsActive({
				orderStatus: TPOrderStatus
			});
			if (stIsActive || tpIsActive) {
				return {
					textStyle: {
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font7,
						color: CommonStyle.color.modify
					},
					text: 'Strategy Active'
				};
			}
		}
		const isOrderLegSLTriggered =
			isStoploss &&
			checkOrderLegIsTriggered({ orderStatus: SLOrderStatus });
		if (isOrderLegSLTriggered) {
			// Lenh 1 chan active
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font7,
					color: CommonStyle.color.modify
				},
				text: 'Stop Loss Triggered'
			};
		}
		const isOrderLegTPTriggered =
			isTakeProfit &&
			checkOrderLegIsTriggered({ orderStatus: TPOrderStatus });
		if (isOrderLegTPTriggered) {
			// Lenh 1 chan active
			return {
				textStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font7,
					color: CommonStyle.color.modify
				},
				text: 'Take Profit Triggered'
			};
		}
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.buy
			},
			text: 'Filled'
		};
	} else {
		return {
			textStyle: {},
			text: ''
		};
	}
}
export function checkOrderPartialFill({ filledQuantity, orderQuantity }) {
	if (filledQuantity > 0 && filledQuantity < orderQuantity) {
		return true;
	}
	return false;
}
/**
 *
 * @param {Kiem tra xem lenh chi co 1 chan}
 */
export function checkOrderOnlyHaveOneLeg({ isStoploss, isTakeProfit }) {
	if ((isStoploss && !isTakeProfit) || (!isStoploss && isTakeProfit)) {
		return true;
	}
	return false;
}
export function getFillStatusProperty({ filledQuantity, orderQuantity }) {
	/*
        List Fill status
        Unfilled
        Partially Filled
        Filled
        Strategy Active
        Stoploss Triggered
        Take Profit Triggered
     */
	if (filledQuantity === 0) {
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.fontColor,
				opacity: 0.7
			},
			text: 'Unfilled'
		};
	} else if (filledQuantity > 0 && filledQuantity < orderQuantity) {
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.warning
			},
			text: 'Partially Filled'
		};
	} else if (filledQuantity === orderQuantity) {
		return {
			textStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font7,
				color: CommonStyle.color.buy
			},
			text: 'Filled'
		};
	} else {
		return {
			textStyle: {},
			text: ''
		};
	}
}

export function getSLTPOrderStatusProperty({
	orderStatus = '',
	actionStatus = '',
	orderAction = ''
}) {
	// Hard Code check text hien thi
	if (
		orderAction === ST_TP_ORDER_ACTION.CANCEL &&
		actionStatus === ACTION_STATUS.OK
	) {
		return {
			text: 'Cancelled',
			color: CommonStyle.color.sell
		};
	}
	switch (orderStatus) {
		case SLTP_ORDER_STATUS.ACTIVE:
			return {
				text: 'Active',
				color: CommonStyle.color.modify
			};
		case SLTP_ORDER_STATUS.INACTIVE:
			return {
				text: 'Inactive',
				color: CommonStyle.color.sell
			};
		case SLTP_ORDER_STATUS.TRIGGERED:
			return {
				text: 'Triggered',
				color: CommonStyle.color.modify
			};
		case SLTP_ORDER_STATUS.TRIGGERED_INACTIVE:
			if (
				orderAction === ST_TP_ORDER_ACTION.PURGE &&
				actionStatus === ACTION_STATUS.OK
			) {
				return {
					text: 'Triggered Purged',
					color: CommonStyle.color.sell
				};
			}
			if (
				orderAction === ST_TP_ORDER_ACTION.CANCEL &&
				actionStatus === ACTION_STATUS.OK
			) {
				return {
					text: 'Triggered Cancelled',
					color: CommonStyle.color.sell
				};
			}
			return {
				text: 'Triggered Inactive',
				color: CommonStyle.color.sell
			};
		case SLTP_ORDER_STATUS.DELETED:
			if (
				orderAction === ST_TP_ORDER_ACTION.CANCEL &&
				actionStatus === ACTION_STATUS.OK
			) {
				return {
					text: 'Cancelled',
					color: CommonStyle.color.sell
				};
			}
			return {
				text: 'Deleted',
				color: CommonStyle.color.sell
			};
		default:
			return {
				text: '',
				color: CommonStyle.color.sell
			};
	}
}

export function getDisableSLTPProperty({ orderStatus }) {
	if (
		(orderStatus && orderStatus === SLTP_ORDER_STATUS.ACTIVE) ||
		(orderStatus && orderStatus === SLTP_ORDER_STATUS.TRIGGERED)
	) {
		return false;
	}
	return true;
}
export function getDisableSLTPPropertyV2({
	orderStatus,
	orderAction,
	actionStatus
}) {
	let disabled = true;
	if (
		(orderStatus && orderStatus === SLTP_ORDER_STATUS.ACTIVE) ||
		(orderStatus && orderStatus === SLTP_ORDER_STATUS.TRIGGERED)
	) {
		disabled = false;
	}
	/** Hard code check cho case realtime sai: OrderStatus Active nhung Cancel Ok */
	switch (orderAction) {
		case ST_TP_ORDER_ACTION.CANCEL:
			switch (actionStatus) {
				case ACTION_STATUS.OK:
					disabled = true;
					break;
				default:
					// Failed
					break;
			}
			break;
		default:
			break;
	}
	return disabled;
}
export function getDisableAmendCancelProperty({
	orderAction,
	actionStatus,
	filledQuantity
}) {
	actionStatus = (actionStatus + '').toUpperCase();
	const orderTag = getOrderTag();
	let disableAmendAll = true;
	let disableCancelAll = true;
	let disableAmendSLTP = true;
	let disableCanceSLTP = true;
	if (orderTag === ORDER_TAG.INACTIVE) {
		return {
			disableAmendAll: true,
			disableCancelAll: true,
			disableAmendSLTP: true,
			disableCanceSLTP: true
		};
	}
	/*
        1. list action status:
            OK
            AUTHORISING
            PENDING
            QUEUED
            DENIED
            FAILED
        2. list order action:
            Create
            Amend
            Cancel
    */
	switch (orderAction) {
		case 'Create':
			switch (actionStatus) {
				case 'OK':
					if (orderTag !== ORDER_TAG.EXECUTED) {
						disableAmendAll = false;
						disableCancelAll = false;
						disableAmendSLTP = false;
						disableCanceSLTP = false;
					}
					break;
				case 'AUTHORISING':
					disableAmendAll = false;
					disableCancelAll = false;
					disableAmendSLTP = false;
					disableCanceSLTP = false;
					break;
				case 'PENDING':
					break;
				case 'QUEUED':
					break;
				case 'DENIED':
					break;
				default:
					// FAILED
					disableAmendAll = false;
					disableCancelAll = false;
					disableAmendSLTP = false;
					disableCanceSLTP = false;
					break;
			}
			break;
		case 'Amend':
			switch (actionStatus) {
				case 'OK':
					if (orderTag !== ORDER_TAG.EXECUTED) {
						disableAmendAll = false;
						disableCancelAll = false;
						disableAmendSLTP = false;
						disableCanceSLTP = false;
					}
					break;
				case 'AUTHORISING':
					disableAmendAll = false;
					disableCancelAll = filledQuantity === 0 ? false : true;
					disableAmendSLTP = false;
					disableCanceSLTP = false;
					break;
				case 'PENDING':
					break;
				case 'QUEUED':
					break;
				case 'DENIED':
					disableAmendAll = false;
					disableCancelAll = false;
					disableAmendSLTP = false;
					disableCanceSLTP = false;
					break;
				default:
					// FAILED
					disableAmendAll = false;
					disableCancelAll = false;
					disableAmendSLTP = false;
					disableCanceSLTP = false;
					break;
			}
			break;
		case 'Purge':
			switch (actionStatus) {
				case 'OK':
					break;
				case 'AUTHORISING':
					break;
				case 'PENDING':
					break;
				case 'QUEUED':
					break;
				case 'DENIED':
					break;
				default:
					// FAILED
					break;
			}
			break;
		case 'Cancel':
			switch (actionStatus) {
				case 'OK':
					break;
				case 'AUTHORISING':
					disableAmendAll = false;
					disableCancelAll = false;
					disableAmendSLTP = false;
					disableCanceSLTP = false;
					break;
				case 'PENDING':
					break;
				case 'QUEUED':
					break;
				case 'DENIED':
					disableAmendAll = false;
					disableCancelAll = false;
					break;
				default:
					// FAILED
					disableAmendAll = true;
					disableCancelAll = true;
					break;
			}
			break;
		default:
			// Cancel
			break;
	}
	return {
		disableAmendAll,
		disableCancelAll,
		disableAmendSLTP,
		disableCanceSLTP
	};
}
export function getBackgroundColorOvalLegOrder({
	orderStatus,
	orderAction,
	actionStatus
}) {
	if (
		orderAction === ST_TP_ORDER_ACTION.CANCEL &&
		actionStatus === ACTION_STATUS.OK
	) {
		return CommonStyle.fontNearLight3;
	}
	switch (orderStatus) {
		case SLTP_ORDER_STATUS.ACTIVE:
			return CommonStyle.color.modify;
		case SLTP_ORDER_STATUS.INACTIVE:
			return CommonStyle.fontNearLight3;
		case SLTP_ORDER_STATUS.TRIGGERED:
			return CommonStyle.color.modify;
		case 'NOT TRIGGERED':
			return CommonStyle.fontNearLight3;
		case SLTP_ORDER_STATUS.TRIGGERED_INACTIVE:
			return CommonStyle.fontNearLight3;
		case SLTP_ORDER_STATUS.DELETED:
			return CommonStyle.fontNearLight3;
		default:
			return CommonStyle.color.modify;
	}
}
export function checkOrderLegIsTriggered({
	orderStatus = '',
	actionStatus = '',
	orderAction = ''
}) {
	switch (orderStatus) {
		case SLTP_ORDER_STATUS.TRIGGERED_INACTIVE:
		case SLTP_ORDER_STATUS.TRIGGERED:
			return true;
		default:
			return false;
			break;
	}
}
export function checkOrderLegIsInActive({
	orderStatus = '',
	actionStatus = '',
	orderAction = ''
}) {
	switch (orderStatus) {
		case SLTP_ORDER_STATUS.INACTIVE:
			return true;
		case SLTP_ORDER_STATUS.DELETED:
			return true;
		default:
			return false;
	}
}
export function checkOrderLegIsActive({
	orderStatus = '',
	actionStatus = '',
	orderAction = ''
}) {
	switch (orderStatus) {
		case SLTP_ORDER_STATUS.ACTIVE:
			return true;
		default:
			return false;
	}
}
export function getStyleOfOrderLeg({ orderStatus, orderAction, actionStatus }) {
	if (
		orderAction === ST_TP_ORDER_ACTION.CANCEL &&
		actionStatus === ACTION_STATUS.OK
	) {
		return {
			color: CommonStyle.fontNearLight6
		};
	}
	switch (orderStatus) {
		case SLTP_ORDER_STATUS.ACTIVE:
		case SLTP_ORDER_STATUS.TRIGGERED:
			return {
				color: CommonStyle.color.modify
			};
		default:
			return {
				color: CommonStyle.fontNearLight6
			};
	}
}
export function checkOrderContingentHadFilled({ item = {} }) {
	const {
		has_takeprofit: hasTakeProfit,
		has_stoploss: hasStopLoss,
		order_quantity: orderQuantity
	} = item;
	if (hasTakeProfit && hasStopLoss) {
		const {
			stoploss_order_info: stoplossOrderInfo,
			takeprofit_order_info: takeprofitOrderInfo
		} = item;
		const { stoploss_order_filled_quantity: stFilled } = stoplossOrderInfo;
		const { takeprofit_order_filled_quantity: tpFilled } =
			takeprofitOrderInfo;
		if (tpFilled + stFilled === orderQuantity) return true;
	} else if (hasTakeProfit) {
		const { takeprofit_order_info: takeprofitOrderInfo } = item;
		const { takeprofit_order_filled_quantity: tpFilled } =
			takeprofitOrderInfo;
		if (tpFilled === orderQuantity) return true;
	} else if (hasStopLoss) {
		const { stoploss_order_info: stoplossOrderInfo } = item;
		const { stoploss_order_filled_quantity: stFilled } = stoplossOrderInfo;
		if (stFilled === orderQuantity) return true;
	}
	return false;
}
export function checkOrderLegHadCancelledOrPurged({
	orderStatus = '',
	actionStatus = '',
	orderAction = ''
}) {
	switch (orderAction) {
		case ST_TP_ORDER_ACTION.CANCEL:
		case ST_TP_ORDER_ACTION.PURGE:
			if (actionStatus === 'OK') return true;
			return false;
		default:
			return false;
	}
}
export function checkOrderAllLegCancelOrPurged({ item = {} }) {
	const { has_takeprofit: hasTakeProfit, has_stoploss: hasStopLoss } = item;
	if (!hasTakeProfit && !hasStopLoss) return false;
	const {
		stoploss_order_info: stoplossOrderInfo = {},
		takeprofit_order_info: takeprofitOrderInfo = {}
	} = item;
	const {
		stoploss_action_status: stActionStatus,
		stoploss_order_action: stOrderAction
	} = stoplossOrderInfo;
	const {
		takeprofit_action_status: tpActionStatus,
		takeprofit_order_action: tpOrderAction
	} = takeprofitOrderInfo;
	if (hasTakeProfit && hasStopLoss) {
		// Lenh 2 chan thi ca 2 chan deu phai Cancel OK hoac la Purge OK
		const isSTCancelOrPurge = checkOrderLegHadCancelledOrPurged({
			actionStatus: stActionStatus,
			orderAction: stOrderAction
		});
		const isTPCancelOrPurge = checkOrderLegHadCancelledOrPurged({
			actionStatus: tpActionStatus,
			orderAction: tpOrderAction
		});
		if (isSTCancelOrPurge && isTPCancelOrPurge) return true;
	} else if (hasTakeProfit) {
		// Lenh 1 chan thi chan phai Cancel OK hoac la Purge OK
		if (
			checkOrderLegHadCancelledOrPurged({
				actionStatus: tpActionStatus,
				orderAction: tpOrderAction
			})
		)
			return true;
	} else if (hasStopLoss) {
		// Lenh 1 chan thi chan phai Cancel OK hoac la Purge OK
		if (
			checkOrderLegHadCancelledOrPurged({
				actionStatus: stActionStatus,
				orderAction: stOrderAction
			})
		)
			return true;
	}
	return false;
}
export function checkOrderHasCancel({ data }) {
	const {
		fill_status: fillStatus,
		action_status: actionStatus,
		order_action: orderAction
	} = data || {};
	if (orderAction === 'Cancel' && actionStatus === 'Failed') return false;
	if (fillStatus === FILL_STATUS.FILLED) return false;
	return true;
}
