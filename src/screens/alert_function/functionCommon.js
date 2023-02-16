import React, { Component } from 'react';
import {
    TouchableOpacity, Image, Text
} from 'react-native';
import TagNew from '~/constants/newsTag'
import { forEach, size } from 'lodash'
import buyBackIcon from '~/img/iconVer2/buyBack/img370582.png';
import { CapReconstuction, Dividend, HaltLifted, Halted, Interest, Report, Sensitive, Takeover, Transaction, Issuance, BuyBack } from '~/screens/alert_function/components/TagNews/IconCom/index.js'
import capIcon from '~/img/iconVer2/capRecontruction/combinedShapeCopy3.png';
import dividendIcon from '~/img/iconVer2/Devidend/nounAnnouncement2389887.png';
import haltLiftedIcon from '~/img/iconVer2/haltLIfed/notStop1724970.png';
import haltedIcon from '~/img/iconVer2/halt/nounStop1724970.png';
import interestIcon from '~/img/iconVer2/interested/combinedShapeCopy.png';
import issuanceIcon from '~/img/iconVer2/issuance/issuing958233.png';
import reportIcon from '~/img/iconVer2/report/path2.png';
import sensitiveIcon from '~/img/iconVer2/sensitive/nounImportant545264Copy.png';
import takeoverIcon from '~/img/iconVer2/takover/combinedShapeCopy2.png';
import transactionIcon from '~/img/iconVer2/transaction/img262195.png';
export function getAllTagNewSelected() {
    let result = {}
    forEach(TagNew, (el, key) => {
        result[key] = key
    })
    return result
}
export function isSelectAll(listSelected) {
    return size(listSelected) === size(TagNew)
}
export function getSourceIcon(name) {
    switch (name) {
        case 'BUY_BACK':
            return BuyBack
        case 'CAP_RECONSTRUCTION':
            return CapReconstuction
        case 'DIVIDEND':
            return Dividend
        case 'HALT_LIFTED':
            return HaltLifted
        case 'HALTED':
            return Halted
        case 'INTEREST':
            return Interest
        case 'ISSUANCE':
            return Issuance
        case 'REPORT':
            return Report
        case 'SENSITIVE':
            return Sensitive
        case 'TAKEOVER':
            return Takeover
        case 'TRANSACTION':
            return Transaction
        default:
            return null;
    }
}
/* get Icon tag news base on Tag
 how to use :
    -params name : name of icon example
        +BUY_BACK
        +CAP_RECONSTRUCTION
        +DIVIDEND
        +HALT_LIFTED
        +HALTED
        +INTEREST
        +ISSUANCE
        +REPORT
        +SENSITIVE
        +TAKEOVER
        +TRANSACTION
    -onPress: onPress Icon
    -style : object style to overwrite
    return JSX element is Image show on.
*/
export function getIcon(name, onPress, style) {
    const ICON = getSourceIcon(name)
    if (!name) return <Text style={{ fontSize: 24, fontWeight: 'bold' }}>?</Text>
    return <TouchableOpacity
        onPress={() => {
            onPress && onPress()
        }}
    >
        <ICON />
    </TouchableOpacity>
}
