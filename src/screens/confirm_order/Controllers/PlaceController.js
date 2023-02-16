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
import * as StreamingBusiness from '~/streaming/streaming_business';
import * as Controller from '~/memory/controller';
import { logDevice, getReason } from '~/lib/base/functionUtil';

import * as Api from '~/api';
import Time from '~/constants/time';
const ERR = ENUM.ERROR_CODE;
const ACTION = ENUM.ACTION_ORD;
const STATUS = ENUM.STATUS_ORD;
const TITLE_NOTI = ENUM.TITLE_NOTI;
const Json = Util.json;
export function placeOrder({ objectOrder, cbError, cbSuccess }) {
	placeOrdIress({
		objectOrder,
		cbError,
		cbSuccess
	});
}

export async function placeOrdIress({ objectOrder, cbError, cbSuccess }) {
	try {
		const urlPlaceOrder = Api.getUrlPlaceOrder();
		const data = await Api.postData(
			urlPlaceOrder,
			{ data: objectOrder },
			Time.TIMEOUT
		);
		if (data == null) return cbError && cbError(ERR.ERR_INTERNAL_CLI);
		if (data.errorCode === '200') {
			if (+data.breach_action === 6 || +data.breach_action === 7) {
				return (
					cbError &&
					cbError({
						error: data.breach_message || data.error_message,
						breachAction: data.breach_action,
						errorCode: data.errorCode
					})
				);
			}
			return cbSuccess({
				error:
					Business.getOrdConfirm(STATUS.SUCCESS, ACTION.PLACE).txt ||
					'Place success',
				orderId: data.order_id
			});
		}

		if (data.errorCode === ERR.TIMEOUT)
			return cbError && cbError({ error: getReason(ERR.TIMEOUT) });
		if (Util.arrayHasItem(data.errorCode))
			return cbError && cbError({ error: getReason(data.errorCode[0]) });
		if (data.errorCode !== ERR.SUCCESS)
			return (
				cbError &&
				cbError({
					error: data.error_message || data.message,
					breachAction: data.breach_action,
					errorCode: data.errorCode
				})
			);
		return;
		// const clientOrderID = data.order_id
		// // const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(ENUM.ACTION_ORD.PLACE)
		// const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)

		// Emitter.addListener(channelOrderClientOrderID, null, ({ data: dataNoti, title }) => {
		//     logDevice('info', `placeOrder noti: ${Json.stringify(dataNoti)}, title: ${title}`);
		//     const tagOrder = Business.getTagOrderNotification(title);
		//     switch (tagOrder) {
		//         case TITLE_NOTI.SUCCESS:
		//             return cbSuccess({ error: Business.getOrdConfirm(STATUS.SUCCESS, ACTION.PLACE).txt || 'Place success' })
		//         case TITLE_NOTI.TIMEOUT:
		//             return cbError && cbError({ error: getReason(ERR.TIMEOUT_NOTI) });
		//         case TITLE_NOTI.REJECT:
		//             return cbError && cbError({ error: getReason(dataNoti.text) });
		//         default:
		//             break;
		//     }
		// })
	} catch (error) {
		return cbError && cbError({ error: getReason(ERR.ERR_INTERNAL_CLI) });
	}
}
export async function placeOrdParitech(objectOrder, timeout) {
	return new Promise(async (resolve, reject) => {
		try {
			const urlPlaceOrder = Api.getUrlPlaceOrder();
			const data = await Api.postData(
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

export async function placeOrdSaxo(orderObj) {
	const timeConfirmOrder = new Date().getTime();
	try {
		const urlPlaceOrder = Api.getUrlPlaceOrder();
		setTimeout(() => {
			cbError && cbError({ error: getReason(ERR.TIMEOUT) });
		}, 2000);
		return;
		const data = await Api.postData(
			urlPlaceOrder,
			{ data: objectOrder },
			Time.TIMEOUT
		);
		if (data == null) return cbError && cbError(ERR.ERR_INTERNAL_CLI);
		if (data.errorCode === ERR.TIMEOUT)
			return cbError && cbError({ error: getReason(ERR.TIMEOUT) });
		if (Util.arrayHasItem(data.errorCode))
			return cbError && cbError({ error: getReason(data.errorCode[0]) });
		if (data.errorCode !== ERR.SUCCESS)
			return cbError && cbError({ error: getReason(data.errorCode) });
		return cbSuccess({
			error:
				Business.getOrdConfirm(STATUS.SUCCESS, ACTION.PLACE).txt ||
				'Place success'
		});
	} catch (error) {
		return cbShowError(ERR.ERR_INTERNAL_CLI);
	}
}
export function subNotiPlaceOrder(responsePlaceOrder) {
	const clientOrderID = responsePlaceOrder.order_id;

	const channelOrderReconnectSSE =
		StreamingBusiness.getChannelOrderReconnectSSE(ENUM.ACTION_ORD.PLACE);
	const channelOrderClientOrderID =
		StreamingBusiness.getChannelOrderClientOrderID(clientOrderID);
	const listenerReconnectSSE = Emitter.addListener(
		channelOrderReconnectSSE,
		null,
		() => {
			clearTimeoutNotiBackend();
			clearIntervalGetLatestOrderDetail();
			getLastestOrderDetail(clientOrderID);
		}
	);
	const listenerClient = Emitter.addListener(
		channelOrderClientOrderID,
		null,
		({ data: dataNoti, title }) => {
			logDevice(
				'info',
				`placeOrder noti: ${Util.json.stringify(
					dataNoti
				)}, title: ${title}`
			);
			console.log(
				'PLACE ORDER RECEIVE NOTI AFTER PLACE ORDER',
				Util.json.stringify(dataNoti)
			);

			const tagOrder = Business.getTagOrderNotification(title);
			switch (tagOrder) {
				case TITLE_NOTI.SUCCESS:
					resetListener(
						listenerClient,
						listenerReconnectSSE,
						clientOrderID
					);
					this.clearTimeoutNotiBackend();
					this.clearIntervalGetLatestOrderDetail();
					return this.successOrder();
				case TITLE_NOTI.TIMEOUT:
					// TIMEOUT SERVER
					resetListener(
						listenerClient,
						listenerReconnectSSE,
						clientOrderID
					);
					this.clearTimeoutNotiBackend();
					this.clearIntervalGetLatestOrderDetail();
					this.resetListener();
					return this.timeoutOrder(
						FunctionUtil.getReason(ERR.TIMEOUT_NOTI)
					);
				case TITLE_NOTI.REJECT:
					resetListener(
						listenerClient,
						listenerReconnectSSE,
						clientOrderID
					);
					this.clearTimeoutNotiBackend();
					this.clearIntervalGetLatestOrderDetail();
					this.resetListener();
					return this.errorOrder(
						FunctionUtil.getReason(dataNoti.text)
					);
				default:
					break;
			}
		}
	);
}

export function resetListener(
	listenerClient,
	listenerReconnectSSE,
	clientOrderID
) {
	Emitter.deleteEvent(
		StreamingBusiness.getChannelOrderReconnectSSE(ENUM.ACTION_ORD.PLACE)
	);
	Emitter.deleteEvent(
		StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
	);
}
export function clearTimeoutNotiBackend() {}
export function clearIntervalGetLatestOrderDetail() {}
