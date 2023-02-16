import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { func, dataStorage } from '../../storage'
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import { getReason as GetReason, logDevice as LogDevice, formatNumberNew2 as FormatNumber2 } from '../../lib/base/functionUtil';
import * as Api from '../../api';
import Time from '../../constants/time';
import * as Util from '../../util';
import ProgressBar from '../../modules/_global/ProgressBar';
import Enum from '../../enum';
import * as Business from '../../business';
import ConfirmOrder from '../../component/confirm_order/confirm_order';
import StyleOrder from './style/order.js';

const Json = Util.json;
const ACTION = Enum.ACTION_ORD;
const STATUS = Enum.STATUS_ORD;
const ERR = Enum.ERROR_CODE;
const CURRENCY = Enum.CURRENCY;
const NAV_EVENT = Enum.NAVIGATOR_EVENT;
const ID_ELEMENT = Enum.ID_ELEMENT;
const ICON_NAME = Enum.ICON_NAME;
const DECIMAL_FEE = 2;
const DECIMAL_ORDER_VALUE = 2;

export function loadDataConfirmPlace(orderObj) {
    return new Promise(async resolve => {
        try {
            // const urlSymbol = Api.getSymbolUrl(false, false, orderObj.code || orderObj.symbol);
            const urlFee = Api.getUrlFee();
            const res = await Promise.all([
                // Api.requestData(urlSymbol),
                Api.postData(urlFee, { data: orderObj }, null, 600)
            ]);
            return resolve({
                symbol: dataStorage.symbolEquity[orderObj.code || orderObj.symbol],
                feeObj: res[0]
            });
        } catch (error) {
            LogDevice('error', `Can't get data loadDataConfirmParitech: ${Json.stringify(error)}`);
            // const urlSymbol = Api.getSymbolUrl(false, false, orderObj.code || orderObj.symbol);
            // const res = await Promise.all([
            //     Api.requestData(urlSymbol)]);
            return resolve({
                symbol: dataStorage.symbolEquity[orderObj.code],
                feeObj: {
                    'estimated_brokerage': null,
                    'estimated_fees': null,
                    'estimated_tax': null,
                    'estimated_value': null,
                    'order_amount_aud': null,
                    'order_amount_usd': null,
                    'price': null,
                    'rate': null,
                    'total': null
                }
            });
        }
    });
}

export function loadDataConfirmCancel(orderObj) {
    return new Promise(async resolve => {
        try {
            // const urlSymbol = Api.getSymbolUrl(false, false, orderObj.code || orderObj.symbol);
            const urlDetail = Api.getUrlOrderDetail(orderObj.broker_order_id);
            const res = await Promise.all([
                // Api.requestData(urlSymbol),
                Api.requestData(urlDetail, null, null, null, 600)
            ]);
            const listDetail = Util.arrayHasItem(res[0])
                ? Util.cloneFn(res[0]).sort((a, b) => a.order_detail_id - b.order_detail_id)
                : [{}];
            return resolve({
                symbol: dataStorage.symbolEquity[orderObj.symbol] || { symbol: orderObj.symbol },
                firstDetail: Json.parse(listDetail[0].order_action) || {},
                firstOrder: listDetail[0] || {},
                currentOrder: listDetail[listDetail.length - 1] || {}
            });
        } catch (error) {
            LogDevice('error', `Can't get data loadDataConfirmParitech: ${Json.stringify(error)}`);
            return resolve({});
        }
    });
}

export function convertToObjFee(
    {
        account_id: accountId,
        symbol: code,
        volume,
        exchange,
        order_type: orderType,
        limit_price: limitPrice,
        stop_price: stopPrice,
        trail_amount: trailAmount,
        trail_percent: trailPercent,
        duration,
        is_buy: isBuy }) {
    return {
        account_id: accountId,
        code,
        volume,
        exchange,
        order_type: orderType || null,
        limit_price: limitPrice || null,
        stop_price: stopPrice || null,
        trail_amount: trailAmount,
        trail_percent: trailPercent,
        duration,
        is_buy: typeof isBuy === 'boolean'
            ? isBuy
            : (isBuy === 1)
    };
};
