import React, { Component, PureComponent } from 'react';
import { View, Text, Platform } from 'react-native';
import TransitionView from '~/component/animation_component/transition_view'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import TextLoadingCustom from '~/component/loading_component/text.1'
import * as Animatable from 'react-native-animatable';
import ViewLoadingReAni from '~/component/loading_component/view1'

import { func, dataStorage } from '~/storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Business from '~/business';
import * as Util from '~/util';
import Enum from '~/enum';
import I18n from '~/modules/language';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel'
import * as DateTime from '~/lib/base/dateTime.js';
import { connect } from 'react-redux'
import {
    logDevice,
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime
} from '~/lib/base/functionUtil';
const {
    PRICE_DECIMAL, ACTION_ORD: ACTION
} = Enum;
const DURATION = 500
export class RowData extends PureComponent {
    getDelay = (index) => {
        if (index !== null && index !== undefined && typeof index === 'number' && index < 10) {
            return DURATION + (index) * (DURATION / 4)
        }
        return 0
    }
    runAnimation = (type) => {
        switch (type) {
            case 'fadeInRight':
                this.refView && this.refView.fadeInRight(DURATION)
                break;
            case 'fadeInLeft':
                this.refView && this.refView.fadeInLeft(DURATION)
                break;
            case 'fadeIn':
                this.refView && this.refView.fadeIn(DURATION)
                break;
            default:
                break;
        }
    }
    componentWillReceiveProps(nextProps) {
        // Run Animation when change Tab
        const { from, i } = nextProps.tabInfo
        if (from === this.props.tabInfo.from && i === this.props.tabInfo.i) {
            return
        }
        if (!isNaN(from) && !isNaN(i)) {
            if (i === 0) {
                this.refView && this.refView.animate({
                    easing: 'linear',
                    0: {
                        opacity: 0
                    },
                    1: {
                        opacity: 0
                    }
                })
                this.timeoutAni = setTimeout(() => {
                    this.runAnimation(dataStorage.animationDirection)
                }, this.getDelay(this.props.index));
            }
            if (from === 0) {
                this.timeoutAni && clearTimeout(this.timeoutAni)
                this.refView && this.refView.animate(
                    {
                        easing: 'linear',
                        0: {
                            opacity: 0
                        },
                        1: {
                            opacity: 0
                        }
                    }
                )
            }
        }
    }
    setRef = (ref) => {
        if (ref) {
            this.refView = ref
        }
    }
    render() {
        return (
            <Animatable.View
                useNativeDriver
                ref={this.setRef}
                animation={'fadeInLeft'}
                duration={DURATION}
                delay={this.getDelay(this.props.index)}
                style={this.props.style || {}}>
                {this.props.children}
            </Animatable.View>
        )
    }
}
const headerMapStateToProps = (state) => {
    return {
        tabInfo: state.order.tabInfo
    }
}
export const RowDataConnected = connect(headerMapStateToProps)(RowData)
export default class Summary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isChangeTab: false
        };
        this.subLoading()
    }
    subLoading = () => {
        const { channelLoading } = this.props
        this.idSubLoading = Emitter.addListener(channelLoading, this.idSubLoading, this.onChangeLoading)
    }
    onChangeLoading = (isLoading) => {
        if (isLoading !== this.state.isLoading) {
            this.setState({
                isLoading
            })
        }
    }
    componentWillUnmount() {
        this.unSub()
    }
    unSub = () => {
        Emitter.deleteByIdEvent(this.idSubLoading);
    }
    renderRowData = this.renderRowData.bind(this)
    renderRowData(listField) {
        const listInfoAcc = ['Account', 'Actor', 'Duration', 'Exchange', 'orderAmountUsd']
        let result = []
        for (let index = 0; index < listField.length; index += 2) {
            const element1 = listField[index];
            const element2 = listField[index + 1];
            let dataRow = []
            if (element1 && element2) {
                dataRow = [
                    {
                        title: `${element1.key}${(element1.unitMoney && !listInfoAcc.includes(element1.key)) ? ' (' + element1.unitMoney + ')' : ''}`,
                        value: element1.value
                    },
                    {
                        title: `${element2.key}${(element2.unitMoney && !listInfoAcc.includes(element2.key)) ? ' (' + element2.unitMoney + ')' : ''}`,
                        value: element2.value
                    }
                ]
                result.push(
                    <React.Fragment>
                        <RowDataConnected index={index} style={{ flexDirection: 'row', marginTop: 16 }}>
                            <Text style={[
                                CommonStyle.textSubNormalBlack,
                                {
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    opacity: 0.4,
                                    flex: 1,
                                    marginRight: 8
                                }
                            ]}>
                                {dataRow[0].title}
                            </Text>
                            <Text style={[
                                CommonStyle.textSubNormalBlack,
                                {
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    opacity: 0.4,
                                    flex: 1
                                }
                            ]}>
                                {dataRow[1].title}
                            </Text>
                        </RowDataConnected>
                        <RowDataConnected index={index} style={{ flexDirection: 'row' }} testID='value'>
                            <ViewLoadingReAni styleContainer={{ flex: 1, marginRight: 8 }} isLoading={this.state.isLoading}>
                                <Text id={`text_2_${index}`} key={`text_2_${index}`} numberOfLines={2} ellipsizeMode={Platform.select({ ios: 'middle', android: 'tail' })} style={[
                                    CommonStyle.textMainNormal,
                                    {
                                        textAlign: 'left',
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        lineHeight: CommonStyle.fontSizeS + 8
                                    }
                                ]}>
                                    {dataRow[0].value}
                                </Text>
                            </ViewLoadingReAni>
                            <ViewLoadingReAni styleContainer={{ flex: 1 }} isLoading={this.state.isLoading}>
                                <Text id={`text_2_${index}`} key={`text_2_${index}`} numberOfLines={2} ellipsizeMode={Platform.select({ ios: 'middle', android: 'tail' })} style={[
                                    CommonStyle.textMainNormal,
                                    {
                                        textAlign: 'left',
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        lineHeight: CommonStyle.fontSizeS + 8
                                    }
                                ]}>
                                    {dataRow[1].value}
                                </Text>
                            </ViewLoadingReAni>
                        </RowDataConnected>
                    </React.Fragment>
                )
            } else if (!element2) {
                dataRow = [
                    {
                        title: `${element1.key}${(element1.unitMoney && !listInfoAcc.includes(element1.key)) ? ' (' + element1.unitMoney + ')' : ''}`,
                        value: element1.value
                    },
                    {}
                ]
                result.push(
                    <React.Fragment>
                        <RowDataConnected index={index} style={{ flexDirection: 'row', marginTop: 16 }}>
                            <Text style={[
                                CommonStyle.textSubNormalBlack,
                                {
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    opacity: 0.4,
                                    flex: 1,
                                    marginRight: 8
                                }
                            ]}>
                                {dataRow[0].title}
                            </Text>
                            <Text style={[
                                CommonStyle.textSubNormalBlack,
                                {
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    opacity: 0.4,
                                    flex: 1
                                }
                            ]}>

                            </Text>
                        </RowDataConnected>
                        <RowDataConnected index={index} style={{ flexDirection: 'row' }} testID='value'>
                            <ViewLoadingReAni styleContainer={{ flex: 1, marginRight: 8 }} isLoading={this.state.isLoading}>
                                <Text id={`text_2_${index}`} key={`text_2_${index}`} numberOfLines={2} ellipsizeMode={Platform.select({ ios: 'middle', android: 'tail' })} style={[
                                    CommonStyle.textMainNormal,
                                    {
                                        textAlign: 'left',
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        lineHeight: CommonStyle.fontSizeS + 8
                                    }
                                ]}>
                                    {dataRow[0].value}
                                </Text>
                            </ViewLoadingReAni>
                            <ViewLoadingReAni styleContainer={{ flex: 1 }} isLoading={false}>
                                <Text id={`text_2_${index}`} key={`text_2_${index}`} numberOfLines={2} ellipsizeMode={Platform.select({ ios: 'middle', android: 'tail' })} style={[
                                    CommonStyle.textMainNormal,
                                    {
                                        textAlign: 'left',
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        lineHeight: CommonStyle.fontSizeS + 8
                                    }
                                ]}>

                                </Text>
                            </ViewLoadingReAni>
                        </RowDataConnected>
                    </React.Fragment>
                )
            }
        }
        return result
    }
    renderContentDetail() {
        const {
            symbolObject = {},
            getObjectOrderPlace,
            getDisplayAccount,
            feeObj: feeData,
            classSelectedSymbol,
            combodityInfo,
            positions,
            code,
            renderCloseNetPosition
        } = this.props
        const exchange = symbolObject && symbolObject.exchanges
        const orderObj = getObjectOrderPlace();
        const feeObj = feeData || {};
        // if (orderObj == null ||
        //     feeObj == null ||
        //     Object.keys(orderObj).length === 0) return this.renderFakeSummary()

        const listField = [];
        const symbolCurrency = symbolObject.currency || '';
        const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
        const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
        const objCurSym = Util.renderCurBaseOnAccountCur(symbolCurrency);
        const time = new Date()
        const paramContent = {
            action: ACTION.PLACE,
            curOrdObj: orderObj,
            symbolObj: dataStorage.symbolEquity[orderObj.code]
        }
        if (Business.isParitech(orderObj.code)) {
            // if (this.isGoodTillDate()) {
            // 	listField.push({
            // 		key: I18n.t('date'),
            // 		value: moment(new Date(this.dic.date)).format('DD/MM/YYYY')
            // 	})
            // }
            if (Business.isFuture(classSelectedSymbol)) {
                listField.push(...[
                    {
                        unitMoney: symbolCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        unitMoney: accountCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        unitMoney: symbolCurrency,
                        key: I18n.t('initialMarginImpact'),
                        width: 50,
                        value: feeObj.initial_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        unitMoney: symbolCurrency,
                        key: I18n.t('maintenanceMarginImpact'),
                        width: 65,
                        value: feeObj.maintenance_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        unitMoney: accountCurrency,
                        key: I18n.t('maintenanceMarginImpact'),
                        width: 65,
                        value: feeObj.maintenance_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                ])
            } else {
                listField.push({
                    unitMoney: accountCurrency,
                    key: I18n.t('orderAmount'),
                    value: feeObj.order_amount_convert == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                })
                if (accountCurrency !== symbolCurrency) {
                    listField.push({
                        unitMoney: symbolCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    })
                }
            }

            listField.push(...[{
                unitMoney: accountCurrency,
                key: I18n.t('estimatedFees'),
                value: feeObj.estimated_fees == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }, {
                unitMoney: accountCurrency,
                key: I18n.t('estimatedTotal'),
                value: feeObj.total_convert == null
                    ? '--'
                    : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            }
            ])
        } else {
            if (Business.isFuture(classSelectedSymbol)) {
                listField.push(...[
                    {
                        unitMoney: symbolCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        unitMoney: accountCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        unitMoney: symbolCurrency,
                        key: I18n.t('initialMarginImpact'),
                        width: 50,
                        value: feeObj.initial_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        unitMoney: accountCurrency,
                        key: I18n.t('initialMarginImpact'),
                        width: 50,
                        value: feeObj.initial_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        unitMoney: symbolCurrency,
                        key: I18n.t('maintenanceMarginImpact'),
                        width: 65,
                        value: feeObj.maintenance_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        unitMoney: accountCurrency,
                        key: I18n.t('maintenanceMarginImpact'),
                        width: 65,
                        value: feeObj.maintenance_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }

                ])
            } else {
                Util.checkCurrency(symbolCurrency, accountCurrency)
                    ? listField.push({
                        unitMoney: accountCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    })
                    : listField.push({
                        unitMoney: symbolCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    }, {
                        unitMoney: accountCurrency,
                        key: I18n.t('orderAmount'),
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    })
            }

            // if (Business.isFuture(this.dic.classSelectedSymbol)) {
            // 	if (Array.isArray(exchange) && !exchange.includes('XLME')) {
            // 		listField.push(...[
            // 			{
            // 				unitMoney: accountCurrency,
            // 				key: I18n.t('orderAmount'),
            // 				value: feeObj.order_amount_convert == null
            // 					? '--'
            // 					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            // 			},
            // 			{
            // 				unitMoney: accountCurrency,
            // 				key: I18n.t('initialMarginImpact'),
            // 				width: 50,
            // 				value: feeObj.initial_margin_impact_convert == null
            // 					? '--'
            // 					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            // 			}, {
            // 				unitMoney: accountCurrency,
            // 				key: I18n.t('maintenanceMarginImpact'),
            // 				width: 65,
            // 				value: feeObj.maintenance_margin_impact_convert == null
            // 					? '--'
            // 					: `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
            // 			}
            // 		])
            // 	}
            // }

            listField.push(...[
                {
                    unitMoney: accountCurrency,
                    key: I18n.t('estimatedFees'),
                    value: feeObj.estimated_fees == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                }, {
                    unitMoney: accountCurrency,
                    key: I18n.t('estimatedTotal'),
                    value: feeObj.total_convert == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                }
            ]);
        }

        if (Business.isFuture(classSelectedSymbol)) {
            if (Array.isArray(exchange) && !exchange.includes('XLME')) {
                listField.push(...[
                    {
                        key: I18n.t('expiryDate2'),
                        value: (paramContent.symbolObj && paramContent.symbolObj.expiry_date && renderTime(DateTime.convertToTimeStampWithFormat(paramContent.symbolObj.expiry_date, 'MMDDYY'), 'DD MMM YYYY')) || '--'
                    }
                ])
            }
            listField.push(...[
                {
                    key: I18n.t('firstNoticeDay'),
                    value: (paramContent.symbolObj && paramContent.symbolObj.first_noti_day && renderTime(DateTime.convertToTimeStampWithFormat(paramContent.symbolObj.first_noti_day), 'DD MMM YYYY')) || '--'
                },
                {
                    key: I18n.t('contractSize'),
                    value: (combodityInfo && combodityInfo.contract_size) || '--'
                },
                {
                    key: I18n.t('unit'),
                    value: (combodityInfo && combodityInfo.unit) || '--'
                }

            ])
            const checkNetPosition = !!positions[code];
            listField.push(...[
                {
                    key: I18n.t('netPosition'),
                    value: (checkNetPosition && positions[code].netPosition) || '--',
                    button: checkNetPosition ? renderCloseNetPosition && renderCloseNetPosition() : ''
                }, {
                    key: I18n.t('profitLoss'),
                    value: (positions[code] && positions[code].profitLoss) || '--'
                }
            ]);
        }
        // chen 2 truong vao dau list
        listField.unshift(...[
            {
                unitMoney: accountCurrency,
                key: I18n.t('userInfo'),
                value: func.getDisplayAccount() == null
                    ? '--'
                    : `${func.getDisplayAccount()}`
            }, {
                unitMoney: accountCurrency,
                key: I18n.t('actor'),
                value: func.getUserLoginId() == null
                    ? '--'
                    : `${func.getUserLoginId()}`
            }
        ]);

        return <View style={{
            paddingHorizontal: 16,
            paddingBottom: 16
        }}>
            {
                listField.length === 0 ? (
                    <View style={{ height: 200 }} />
                ) : (
                        this.renderRowData(listField)
                    )
            }
        </View>
    }
    render() {
        return (
            <React.Fragment>
                {
                    this.renderContentDetail()
                }
            </React.Fragment>
        );
    }
}
