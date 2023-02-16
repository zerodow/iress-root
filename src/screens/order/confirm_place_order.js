import React, { Component } from 'react';
import { View, ScrollView, Animated, ImageBackground, Platform, Text, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import * as FunctionUtil from '../../lib/base/functionUtil'
import * as Api from '../../api';
import Time from '../../constants/time';
import * as Util from '../../util';
import ProgressBar from '../../modules/_global/ProgressBar';
import Enum from '../../enum';
import * as Business from '../../business';
import * as StreamingBusiness from '../../streaming/streaming_business'
import ConfirmOrder from '../../component/confirm_order/confirm_order';
import StyleOrder from './style/order.js';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import NetworkWarning from '~/component/network_warning/network_warning';
import Styles from '~/component/confirm_order/style/confirm_style';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as ConfirmBusiness from './confirm_business.js';
import * as FbEmit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter'
import { connect } from 'react-redux';
import { dataStorage, func } from '../../storage';
import I18n from '../../modules/language/';
import config from '../../config'
import moment from 'moment'
import ScreenId from '../../constants/screen_id';
import * as Controller from '../../memory/controller'
import * as RoleUser from '../../roleUser';
import * as Cache from '../../cache'
import * as DateTime from '~/lib/base/dateTime.js';
import { getNumberOfLines } from '~/business'
import pinBackground from '~/img/background_mobile/group7.png'
const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window')
const Json = Util.json;
const ACTION = Enum.ACTION_ORD;
const STATUS = Enum.STATUS_ORD;
const ERR = Enum.ERROR_CODE;
const CURRENCY = Enum.CURRENCY;
const NAV_EVENT = Enum.NAVIGATOR_EVENT;
const ID_ELEMENT = Enum.ID_ELEMENT;
const CHANNEL = Enum.CHANNEL;
const DEFAULT_VAL = Enum.DEFAULT_VAL;
const TITLE_NOTI = Enum.TITLE_NOTI;
const DECIMAL_FEE = 3;
const DECIMAL_ORDER_VALUE = 3;
const DECIMAL_TOTAL = 3;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const DURATION_CODE = Enum.DURATION_CODE
class ConfirmOrderCustom extends ConfirmOrder { }
class ConfirmView extends Component {
    static propTypes = {
        loadData: PropTypes.func.isRequired,
        propConfirm: PropTypes.object,
        isLoading: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);
        this.showError = this.showError.bind(this)
    }

    componentDidMount() {
        this.props.loadData && this.props.loadData()
    }

    showError(obj) {
        this.refConfirmOrder && this.refConfirmOrder.showError && this.refConfirmOrder.showError(obj)
    }

    renderLoaded(propConfirm) {
        return <ConfirmOrderCustom {...propConfirm} isLoading={this.props.isLoading} title={I18n.t('confirmOrder')} ref={ref => this.refConfirmOrder = ref} />
    }

    render() {
        return (
            this.renderLoaded(this.props.propConfirm)
        )
    }
}

export class ConfirmPlaceOrder extends Component {
    static propTypes = {
        reqObj: PropTypes.object.isRequired,
        successCb: PropTypes.func,
        actor: PropTypes.string.isRequired
    }
    static defaultProps = {
        reqObj: {},
        successCb: DEFAULT_VAL.FUNC,
        actor: ''
    }

    symbol = {};
    price = {};
    listener = null;
    state = {
        status: STATUS.NONE,
        err: '',
        isLoading: true
    };

    constructor(props) {
        super(props);

        this.isDone = false;
        this.intervalGetLastestOrderDetail = null
        this.timeoutNotiBackend = null
        this.listenerReconnectSSE = null
        this.timeConfirmOrder = null
        this.clientOrderID = null
        this.showError = this.showError.bind(this)
        this.setTimeoutNotiBackend = this.setTimeoutNotiBackend.bind(this)
        this.clearTimeoutNotiBackend = this.clearTimeoutNotiBackend.bind(this)
        this.dismissForm = this.dismissForm.bind(this);
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
        this.eventClickCancel = this.eventClickCancel.bind(this);
        this.getLastestOrderDetail = this.getLastestOrderDetail.bind(this)
        this.setIntervalGetLatestOrderDetail = this.setIntervalGetLatestOrderDetail.bind(this)
        this.placeOrder = this.placeOrder.bind(this);
        this.placeOrdParitech = this.placeOrdParitech.bind(this);
        this.placeOrdIress = this.placeOrdIress.bind(this)
        this.placeOrdSaxo = this.placeOrdSaxo.bind(this);
        this.loadData = this.loadData.bind(this);
        this.resetListener = this.resetListener.bind(this);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.dic = {
            combodityInfo: {}
        }
    }

    changeState(state, cb = DEFAULT_VAL.FUNC) {
        this.setState({ ...state }, cb);
    }

    // componentWillMount() {
    //     this.getCommodityInfoPromise && this.getCommodityInfoPromise()
    // }

    async getCommodityInfoPromise() {
        const symbolObj = this.symbol;
        if (Business.isFuture(symbolObj.class)) {
            const combodityInfoRes = await FunctionUtil.getCommodityInfo(symbolObj.symbol)
            this.dic.combodityInfo = combodityInfoRes
            this.changeState({ isLoading: false });
        }
        // return this.dic.combodityInfo
    }

    genParamLoaded({
        reqObj = {},
        feeObj = {},
        symbolObj = {},
        eventCancel,
        eventConfirm,
        actor = '',
        status,
        error,
        isConnected
    }) {
        const listField = [];
        const isFuture = Business.isFuture(symbolObj.class);
        const symbolCurrency = symbolObj.currency || '';
        const paramContent = {
            action: ACTION.PLACE,
            curOrdObj: reqObj,
            symbolObj: dataStorage.symbolEquity[reqObj.code]
        }
        const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
        const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
        const objCurSym = Util.renderCurBaseOnAccountCur(symbolCurrency);
        if (Business.isParitech(symbolObj.symbol)) {
            listField.push(...[
                {
                    key: I18n.t('userInfo'),
                    value: func.getDisplayAccount()
                },
                {
                    // unitMoney: accountCurrency,
                    key: I18n.t('actor'),
                    value: func.getUserLoginId() == null
                        ? '--'
                        : `${func.getUserLoginId()}`
                },
                {
                    key: I18n.t('duration'),
                    value: Business.getDisplayDuration(reqObj.duration)
                }
            ]);

            if (reqObj.duration === DURATION_CODE.GTD) {
                listField.push({
                    key: I18n.t('date'),
                    value: moment(reqObj.expire_date).format('DD/MM/YYYY')
                })
            }

            listField.push({
                key: I18n.t('exchange_txt'),
                value: this.props.displayExchange
            });

            if (isFuture) {
                listField.push(...[
                    {
                        key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${symbolCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    }, {
                        key: I18n.t('maintenanceMarginImpact') + ` (${symbolCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${accountCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }, {
                        key: I18n.t('maintenanceMarginImpact') + ` (${accountCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                ])
            } else {
                !Util.checkCurrency(accountCurrency, symbolCurrency) && listField.push({
                    key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                    value: feeObj.order_amount_aud == null
                        ? '--'
                        : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                })
                listField.push(
                    {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        unitMoney: accountCurrency,
                        key: I18n.t('estimatedFees') + ` (${accountCurrency})`,
                        value: feeObj.estimated_fees == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }, {
                    unitMoney: accountCurrency,
                    key: I18n.t('estimatedTotal') + ` (${accountCurrency})`,
                    value: feeObj.total_convert == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                }
                )
            }
        } else {
            listField.push(...[
                {
                    key: I18n.t('userInfo'),
                    value: func.getDisplayAccount()
                },
                {
                    // unitMoney: accountCurrency,
                    key: I18n.t('actor'),
                    value: func.getUserLoginId() == null
                        ? '--'
                        : `${func.getUserLoginId()}`
                },
                {
                    key: I18n.t('duration'),
                    value: Business.getDisplayDuration(reqObj.duration)
                }]);

            if (isFuture) {
                if (reqObj.duration === DURATION_CODE.GTD) {
                    listField.push({
                        key: I18n.t('date'),
                        value: moment(reqObj.expire_date).format('DD/MM/YYYY')
                    })
                }
            }

            listField.push({
                key: I18n.t('exchange_txt'),
                value: this.props.displayExchange
            });

            if (isFuture) {
                listField.push(...[
                    {
                        key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                        value: feeObj.order_amount == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${symbolCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('initialMarginImpact') + ` (${accountCurrency})`,
                        width: 50,
                        value: feeObj.initial_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    },
                    {
                        key: I18n.t('maintenanceMarginImpact') + ` (${symbolCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact == null
                            ? '--'
                            : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                    },
                    {
                        key: I18n.t('maintenanceMarginImpact') + ` (${accountCurrency})`,
                        width: 65,
                        value: feeObj.maintenance_margin_impact_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.maintenance_margin_impact_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                ])
            } else {
                !Util.checkCurrency(accountCurrency, symbolCurrency) && listField.push({
                    key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                    value: feeObj.order_amount == null
                        ? '--'
                        : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                })
                listField.push(
                    {
                        key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                        value: feeObj.order_amount_convert == null
                            ? '--'
                            : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                    }
                )
            }
            if (isFuture) {
                if (Array.isArray(symbolCurrency) && !symbolCurrency.includes('XLME')) {
                    listField.push(...[
                        {
                            key: I18n.t('expiryDate2'),
                            value: (paramContent.symbolObj && paramContent.symbolObj.expiry_date && FunctionUtil.renderTime(DateTime.convertToTimeStampWithFormat(paramContent.symbolObj.expiry_date, 'MMDDYY'), 'DD MMM YYYY')) || '--'
                        }
                    ])
                }
                listField.push(...[
                    {
                        key: I18n.t('firstNoticeDay'),
                        value: (paramContent.symbolObj && paramContent.symbolObj.first_noti_day && FunctionUtil.renderTime(DateTime.convertToTimeStampWithFormat(paramContent.symbolObj.first_noti_day), 'DD MMM YYYY')) || '--'
                    },
                    {
                        key: I18n.t('contractSize'),
                        value: (this.dic.combodityInfo && this.dic.combodityInfo.contract_size) || '--'
                    },
                    {
                        key: I18n.t('unit'),
                        value: (this.dic.combodityInfo && this.dic.combodityInfo.unit) || '--'
                    }

                ])
            }
            listField.push(...[
                {
                    key: I18n.t('estimatedFees') + ` (${accountCurrency})`,
                    value: feeObj.estimated_fees == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.estimated_fees, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                }, {
                    key: I18n.t('estimatedTotal') + ` (${accountCurrency})`,
                    value: feeObj.total_convert == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.total_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                }
            ]);
        }
        return {
            eventCancel,
            eventConfirm,
            listField,
            objNotification: Business.getOrdConfirm(status, ACTION.PLACE, error),
            // companyName: symbolObj.company_name || symbolObj.company || symbolObj.security_name || '',
            content: Business.genContentConfirmOrder(paramContent),
            is_buy: reqObj.is_buy,
            disabledCancel: Business.disabledButtonCancelConfirmScreen(status, isConnected),
            disabledConfirm: Business.disabledButtonConfirmConfirmScreen(status, isConnected) || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.CONFIRM_PLACE_BUY_SELL_NEW_ORDER),
            activityConfirm: Business.processingButtonConfirmConfirmScreen(status)
        };
    }

    dismissForm() {
        // this.props.navigator && this.props.navigator.dismissModal();
        this.props.successCb();
    }

    errorOrder(err) {
        const objNotify = Business.getOrdConfirm(STATUS.ERROR, ACTION.PLACE, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.ERROR
        });
    }

    timeoutOrder(err) {
        const objNotify = Business.getOrdConfirm(STATUS.TIMEOUT, ACTION.PLACE, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.TIMEOUT
        });
    }

    processOrder(err = '') {
        const objNotify = Business.getOrdConfirm(STATUS.PROCESS, ACTION.PLACE, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.PROCESS
        });
    }

    successOrder(err = '') {
        const objNotify = Business.getOrdConfirm(STATUS.SUCCESS, ACTION.PLACE, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.SUCCESS
        }, () => {
            setTimeout(this.dismissForm, 500);
        });
    }

    resetListener() {
        this.listenerReconnectSSE && Emitter.deleteEvent(StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.PLACE))
        this.listenerReconnectSSE = null
        this.listener && Emitter.deleteEvent(StreamingBusiness.getChannelOrderClientOrderID(this.clientOrderID))
        this.listener = null;
    }

    placeOrder() {
        this.isDone = false;
        const enableIress = Controller.getIressStatus()
        Business.isParitech(this.props.reqObj.code)
            ? enableIress
                ? this.placeOrdIress()
                : this.placeOrdParitech()
            : this.placeOrdSaxo();
    }

    async placeOrdParitech() {
        try {
            this.processOrder();

            // const data = await Api.postData(Api.getUrlPlaceOrder(), { data: this.props.reqObj }, Time.TIMEOUT);
            // if (data == null) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            // if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            // if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            // if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            // this.successOrder();
        } catch (error) {
            FunctionUtil.logDevice('error', `placeOrder fn err error: ${Json.stringify(error)}`);
            this.errorOrder(ERR.ERR_INTERNAL_CLI);
        }
    }

    clearTimeoutNotiBackend() {
        this.timeoutNotiBackend && clearTimeout(this.timeoutNotiBackend)
    }

    setTimeoutNotiBackend() {
        this.timeoutNotiBackend = setTimeout(() => {
            this.clearIntervalGetLatestOrderDetail()
            return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT_NOTI))
        }, Time.TIMEOUT_NOTI_BACKEND)
    }

    clearIntervalGetLatestOrderDetail() {
        this.intervalGetLastestOrderDetail && clearInterval(this.intervalGetLastestOrderDetail)
    }

    setIntervalGetLatestOrderDetail(clienOrderID) {
        this.intervalGetLastestOrderDetail = setInterval(() => {
            this.getLastestOrderDetail(clienOrderID)
        }, Time.TIME_INTERVAL)
    }

    getLastestOrderDetail(clienOrderID) {
        const url = Api.getUrlLatestOrderDetail(clienOrderID, true)
        Api.requestData(url)
            .then(res => {
                if (res) {
                    try {
                        const data = res[0] || {}
                        const { updated, text } = data
                        if (this.timeConfirmOrder > updated) {
                            return
                        }

                        const details = JSON.parse(text)
                        const { title, text: reasonText } = details
                        const tagOrder = Business.getTagOrderNotification(title);
                        switch (tagOrder) {
                            case TITLE_NOTI.SUCCESS:
                                this.clearIntervalGetLatestOrderDetail()
                                this.clearTimeoutNotiBackend()
                                this.resetListener();
                                // Cache.initCacheOrders() // Cache lại orders list
                                return this.successOrder();
                            case TITLE_NOTI.REJECT:
                                this.clearIntervalGetLatestOrderDetail()
                                this.clearTimeoutNotiBackend()
                                this.resetListener();
                                return this.errorOrder(FunctionUtil.getReason(reasonText))
                            default:
                                break;
                        }
                    } catch (error) {
                        console.log(error)
                        return FunctionUtil.logDevice('error', `PLACE - getLastestOrderDetail exception: ${error}`);
                    }
                }
            })
            .catch(error => {
                console.log(error)
                return FunctionUtil.logDevice('error', `PLACE - getLastestOrderDetail error: ${error}`);
            })
    }

    async placeOrdIress() {
        try {
            this.timeConfirmOrder = new Date().getTime()
            this.resetListener();
            this.processOrder();
            const data = await Api.postData(Api.getUrlPlaceOrder(), { data: this.props.reqObj }, Time.TIMEOUT);
            console.log('PLACE ORDER ERR', data)
            if (data == null) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            const clientOrderID = data.order_id
            this.clientOrderID = clientOrderID
            const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.PLACE)
            const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
            // Sub close form
            this.listener = Emitter.addListener(channelOrderClientOrderID, null, ({ data: dataNoti, title }) => {
                FunctionUtil.logDevice('info', `placeOrder noti: ${Json.stringify(dataNoti)}, title: ${title}`);
                console.log('PLACE ORDER RECEIVE NOTI AFTER PLACE ORDER', Json.stringify(dataNoti))

                const tagOrder = Business.getTagOrderNotification(title);
                if (this.isDone) return {};
                switch (tagOrder) {
                    case TITLE_NOTI.SUCCESS:
                        this.isDone = true;
                        this.resetListener();
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        return this.successOrder();
                    case TITLE_NOTI.TIMEOUT:
                        // TIMEOUT SERVER
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        this.resetListener();
                        return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT_NOTI))
                    case TITLE_NOTI.REJECT:
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        this.resetListener();
                        return this.errorOrder(FunctionUtil.getReason(dataNoti.text))
                    default:
                        break;
                }
            })
            // Sub lose sse connection
            this.listenerReconnectSSE = Emitter.addListener(channelOrderReconnectSSE, null, () => {
                this.clearTimeoutNotiBackend()
                this.clearIntervalGetLatestOrderDetail()
                this.getLastestOrderDetail(clientOrderID)
            })
            // TIMEOUT CLIENT
            this.clearTimeoutNotiBackend()
            this.setTimeoutNotiBackend()
            // INTERVAL 10s GET LATEST ORDER DETAIL
            this.clearIntervalGetLatestOrderDetail()
            this.setIntervalGetLatestOrderDetail(clientOrderID)
        } catch (error) {
            console.log('PLACE ORDER EXCEPTION', error)
            this.clearTimeoutNotiBackend()
            this.clearIntervalGetLatestOrderDetail()
            FunctionUtil.logDevice('error', `placeOrder fn err error: ${Json.stringify(error)}`);
            this.errorOrder(ERR.ERR_INTERNAL_CLI);
        }
    }

    async placeOrdSaxo() {
        try {
            this.timeConfirmOrder = new Date().getTime()
            this.resetListener();
            this.processOrder();
            const data = await Api.postData(Api.getUrlPlaceOrder(), { data: this.props.reqObj }, Time.TIMEOUT);
            if (data == null) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            const clientOrderID = data.order_id
            this.clientOrderID = clientOrderID
            const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.PLACE)
            const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
            // Sub close form
            this.listener = Emitter.addListener(channelOrderClientOrderID, null, ({ data: dataNoti, title }) => {
                FunctionUtil.logDevice('info', `placeOrder noti: ${Json.stringify(dataNoti)}, title: ${title}`);
                const tagOrder = Business.getTagOrderNotification(title);
                if (this.isDone) return {};
                switch (tagOrder) {
                    case TITLE_NOTI.SUCCESS:
                        this.isDone = true;
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        this.resetListener();
                        return this.successOrder();
                    case TITLE_NOTI.TIMEOUT:
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        this.resetListener();
                        return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT_NOTI))
                    case TITLE_NOTI.REJECT:
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        this.resetListener();
                        return this.errorOrder(FunctionUtil.getReason(dataNoti.text))
                    default:
                        break;
                }
            })
            // Sub lose sse connection
            this.listenerReconnectSSE = Emitter.addListener(channelOrderReconnectSSE, null, () => {
                this.clearTimeoutNotiBackend()
                this.clearIntervalGetLatestOrderDetail()
                this.getLastestOrderDetail(clientOrderID)
            })
            // TIMEOUT CLIENT
            this.clearTimeoutNotiBackend()
            this.setTimeoutNotiBackend()
            // INTERVAL 10s GET LATEST ORDER DETAIL
            this.clearIntervalGetLatestOrderDetail()
            this.setIntervalGetLatestOrderDetail(clientOrderID)
        } catch (error) {
            this.clearTimeoutNotiBackend()
            this.clearIntervalGetLatestOrderDetail()
            FunctionUtil.logDevice('error', `placeOrder fn err error: ${Json.stringify(error)}`);
            this.errorOrder(ERR.ERR_INTERNAL_CLI);
        }
    }

    async loadData() {
        const res = await ConfirmBusiness.loadDataConfirmPlace(this.props.reqObj);
        if (res && res.symbol) {
            this.symbol = res.symbol;
            this.feeObj = res.feeObj;
            this.getCommodityInfoPromise && this.getCommodityInfoPromise()
            this.changeState({ isLoading: false });
        } else {
            this.feeObj = {
                'estimated_brokerage': null,
                'estimated_fees': null,
                'estimated_tax': null,
                'estimated_value': null,
                'order_amount_aud': null,
                'order_amount_usd': null,
                'price': null,
                'rate': null,
                'total': null
            };
            this.changeState({ isLoading: false });
        }
    }

    eventClickCancel() {
        this.props.navigator && this.props.navigator.dismissModal({
            animated: true,
            animationType: 'fade'
        });
        func.setCurrentScreenId(ScreenId.ORDER)
    }

    onNavigatorEvent(event) {
        if (event.id === NAV_EVENT.BACK_BUTTON_PRESS) {
            // your logic
            return true;
        }
        if (event.type === NAV_EVENT.NAVBAR_BUTTON_PRESS) {
            switch (event.id) {
                case ID_ELEMENT.BTN_BACK_CONFIRM_ORDER:
                    this.props.navigator.dismissModal();
                    break;
            }
        }
    }

    buttonBack() {
        Business.setButtonBack({
            navigator: this.props.navigator,
            id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
            disabled: Business.disabledButtonBackConfirmScreen(this.state.status, this.props.isConnected)
        });
    }

    componentWillUnmount() {
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.PLACE))
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderClientOrderID(this.clientOrderID))
    }

    componentDidMount() {
        func.setCurrentScreenId(ScreenId.CONFIRM_PLACE_ORDER)
        this.buttonBack();
        // setTimeout(() => {
        //     this.successOrder()
        // }, 10000)
    }

    componentDidUpdate() {
        this.buttonBack();
    }

    showError(obj) {
        this.refConfirmView && this.refConfirmView.showError && this.refConfirmView.showError(obj)
    }

    render() {
        const propConfirm = this.genParamLoaded({
            reqObj: this.props.reqObj,
            feeObj: this.feeObj,
            symbolObj: this.symbol,
            eventCancel: this.eventClickCancel,
            eventConfirm: this.placeOrder,
            actor: this.props.actor,
            status: this.state.status,
            error: this.state.err,
            isConnected: this.props.isConnected
        });
        const propsView = {
            loadData: this.loadData,
            propConfirm: {
                ...propConfirm,
                companyName: this.props.companyName,
                isConnected: this.props.isConnected
            },
            isLoading: this.state.isLoading
        };
        return (
            <ConfirmView isLoading={this.state.isLoading} {...propsView} ref={ref => this.refConfirmView = ref} />
        )
    }
};

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ConfirmPlaceOrder);
