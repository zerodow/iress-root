
import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import * as FunctionUtil from '../../lib/base/functionUtil'
import * as Api from '../../api';
import Time from '../../constants/time';
import PropTypes from 'prop-types';
import * as Util from '../../util';
import ProgressBar from '../../modules/_global/ProgressBar';
import Enum from '../../enum';
import * as Business from '../../business';
import ConfirmOrder from '../../component/confirm_order/confirm_order';
import StyleOrder from './style/order.js';
import * as ConfirmBusiness from './confirm_business.js';
import * as FbEmit from '../../emitter';
import { connect } from 'react-redux';
import { dataStorage, func } from '../../storage';
import I18n from '../../modules/language/';
import config from '../../config'
import moment from 'moment'
import * as Controller from '../../memory/controller'
import * as RoleUser from '../../roleUser';
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Emitter from '@lib/vietnam-emitter'
import ScreenId from '../../constants/screen_id';
import * as Cache from '../../cache'
import * as DateTime from '~/lib/base/dateTime.js';

const Json = Util.json;
const ACTION = Enum.ACTION_ORD;
const STATUS = Enum.STATUS_ORD;
const ERR = Enum.ERROR_CODE;
const CURRENCY = Enum.CURRENCY;
const NAV_EVENT = Enum.NAVIGATOR_EVENT;
const ID_ELEMENT = Enum.ID_ELEMENT;
const CHANNEL = Enum.CHANNEL;
const TITLE_NOTI = Enum.TITLE_NOTI;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const DEFAULT_VAL = Enum.DEFAULT_VAL;
const DURATION_CODE = Enum.DURATION_CODE

class ConfirmView extends Component {
    static propTypes = {
        loadData: PropTypes.func.isRequired,
        propConfirm: PropTypes.object,
        isLoading: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);
        this.showError = this.showError.bind(this)

        this.props = Util.cloneFn(this.props)
    }

    componentDidMount() {
        this.props.loadData && this.props.loadData()
    }

    renderLoading() {
        return (
            <View style={StyleOrder.loadingScreen}>
                <ProgressBar />
            </View>
        );
    }

    showError(obj) {
        this.refConfirmOrder && this.refConfirmOrder.showError && this.refConfirmOrder.showError(obj)
    }

    renderLoaded(propConfirm) {
        return <ConfirmOrder {...propConfirm}
            isLoading={this.props.isLoading}
            title={I18n.t('confirmOrder')}
            ref={ref => this.refConfirmOrder = ref} />
    }

    render() {
        return this.renderLoaded(this.props.propConfirm);
    }
};

export class ConfirmModifyOrder extends Component {
    static propTypes = {
        reqObj: PropTypes.object.isRequired,
        oldOrdObj: PropTypes.object.isRequired,
        successCb: PropTypes.func,
        actor: PropTypes.string.isRequired
    }
    static defaultProps = {
        reqObj: {},
        oldOrdObj: {},
        successCb: DEFAULT_VAL.FUNC,
        actor: ''
    }

    state = {
        status: STATUS.NONE,
        err: '',
        isLoading: true
    };
    listener = null;

    constructor(props) {
        super(props);
        this.props = Util.cloneFn(this.props);
        this.feeObj = {}
        this.isDone = false;
        this.timeoutNotiBackend = null
        this.intervalGetLastestOrderDetail = null
        this.listenerReconnectSSE = null
        this.timeConfirmOrder = null
        this.clientOrderID = null
        this.brokerOrderID = null
        this.showError = this.showError.bind(this)

        this.setTimeoutNotiBackend = this.setTimeoutNotiBackend.bind(this)
        this.clearTimeoutNotiBackend = this.clearTimeoutNotiBackend.bind(this)
        this.dismissForm = this.dismissForm.bind(this);
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
        this.eventClickCancel = this.eventClickCancel.bind(this);
        this.getLastestOrderDetail = this.getLastestOrderDetail.bind(this)
        this.setIntervalGetLatestOrderDetail = this.setIntervalGetLatestOrderDetail.bind(this)
        this.modifyOrder = this.modifyOrder.bind(this);
        this.modifyOrderParitech = this.modifyOrderParitech.bind(this);
        this.modifyOrderIress = this.modifyOrderIress.bind(this)
        this.modifyOrderSaxo = this.modifyOrderSaxo.bind(this);
        this.errorOrder = this.errorOrder.bind(this);
        this.timeoutOrder = this.timeoutOrder.bind(this);
        this.processOrder = this.processOrder.bind(this);

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.curOrdObj = { ...props.oldOrdObj, ...props.reqObj };
        this.symbol = props.symbolObj || {}
    }

    changeState(state, cb = DEFAULT_VAL.FUNC) {
        this.setState({ ...state }, cb);
    }

    onNavigatorEvent(event) {
        if (event.id === NAV_EVENT.BACK_BUTTON_PRESS) {
            // your logic
            return true;
        }
        if (event.type === NAV_EVENT.NAVBAR_BUTTON_PRESS) {
            switch (event.id) {
                case ID_ELEMENT.BTN_BACK_CONFIRM_ORDER:
                    // Reset current screen id to realtime order list
                    func.setCurrentScreenId(ScreenId.ORDERS)
                    this.props.navigator.dismissModal();
                    break;
            }
        }
    }

    dismissForm() {
        // this.props.navigator && this.props.navigator.dismissModal();
        this.props.dismissAllModals && this.props.dismissAllModals()
        this.props.successCb && this.props.successCb();
    }

    buttonBack() {
        Business.setButtonBack({
            navigator: this.props.navigator,
            id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
            disabled: Business.disabledButtonBackConfirmScreen(this.state.status, this.props.isConnected)
        });
    }

    eventClickCancel() {
        // Reset current screen id to realtime order list
        func.setCurrentScreenId(ScreenId.ORDERS)
        this.props.navigator && this.props.navigator.dismissModal({
            animationType: 'none'
        });
    }

    errorOrder(err) {
        const objNotify = Business.getOrdConfirm(STATUS.ERROR, ACTION.MODIFY, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.ERROR
        });
    }

    timeoutOrder(err) {
        const objNotify = Business.getOrdConfirm(STATUS.TIMEOUT, ACTION.MODIFY, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.TIMEOUT
        });
    }

    processOrder(err = '') {
        const objNotify = Business.getOrdConfirm(STATUS.PROCESS, ACTION.MODIFY, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.changeState({
            err,
            status: STATUS.PROCESS
        });
    }

    resetListenerTimeOut() {
        this.listenerTimeOut && Emitter.deleteEvent(StreamingBusiness.getChannelOrderClientOrderID(this.clientOrderID))
        this.listenerTimeOut = null;
    }

    resetListener() {
        this.listenerReconnectSSE && Emitter.deleteEvent(StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.MODIFY))
        this.listenerReconnectSSE = null
        this.listener && Emitter.deleteEvent(StreamingBusiness.getChannelOrderBrokerOrderID(this.brokerOrderID))
        this.listener = null;
    }

    successOrder(err = '') {
        const objNotify = Business.getOrdConfirm(STATUS.SUCCESS, ACTION.MODIFY, err)
        this.showError({ error: objNotify.txt, type: objNotify.type, cb: this.dismissForm })
        this.changeState({
            err,
            status: STATUS.SUCCESS
        });
    }

    loadData = async () => {
        const placeObj = ConfirmBusiness.convertToObjFee(this.curOrdObj);
        const res = await ConfirmBusiness.loadDataConfirmPlace(placeObj);
        if (res && res.symbol) {
            if (Business.isFuture(res.symbol.class)) {
                const commbodityInfo = await FunctionUtil.getCommodityInfo(res.symbol.symbol)
                this.commbodityInfo = commbodityInfo
            }
            this.symbol = res.symbol;
            this.feeObj = res.feeObj;
            this.changeState({ isLoading: false });
        }
    }

    modifyOrder() {
        this.isDone = false;
        const enableIress = Controller.getIressStatus()
        Business.isParitech(this.curOrdObj.symbol)
            ? enableIress
                ? this.modifyOrderIress()
                : this.modifyOrderParitech()
            : this.modifyOrderSaxo();
    }

    genParamLoaded({
        curOrdObj = {},
        symbolObj = {},
        oldOrdObj = {},
        feeObj = {},
        eventCancel,
        eventConfirm,
        status,
        error,
        isConnected,
        commbodityObj = {}
    }) {
        const listField = [];
        const isFuture = Business.isFuture(symbolObj.class);
        const symbolCurrency = symbolObj.currency || '';
        const accountCurrency = (dataStorage.currentAccount && dataStorage.currentAccount.currency) || '';
        const objCurAcc = Util.renderCurBaseOnAccountCur(accountCurrency);
        const objCurSym = Util.renderCurBaseOnAccountCur(symbolCurrency);
        if (Business.isParitech(symbolObj.symbol)) {
            listField.push(...[
                {
                    key: I18n.t('userInfo'),
                    value: func.getDisplayAccount()
                }, {
                    key: I18n.t('actor'),
                    value: func.getUserLoginId()
                }, {
                    key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                    value: feeObj.order_amount == null
                        ? '--'
                        : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                }
            ])

            listField.push(...[{
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
            ])
        } else {
            listField.push(...[
                {
                    key: I18n.t('userInfo'),
                    value: func.getDisplayAccount()
                }, {
                    key: I18n.t('actor'),
                    value: func.getUserLoginId()
                }, {
                    key: I18n.t('orderAmount') + ` (${symbolCurrency})`,
                    value: feeObj.order_amount_convert == null
                        ? '--'
                        : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.order_amount, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                }, {
                    key: I18n.t('orderAmount') + ` (${accountCurrency})`,
                    value: feeObj.order_amount_convert == null
                        ? '--'
                        : `${objCurAcc.symbolCur}${Business.displayMoney(feeObj.order_amount_convert, PRICE_DECIMAL.VALUE, accountCurrency)} ${accountCurrency}`
                }
            ])

            if (isFuture) {
                if (Business.getExchangeString(symbolObj, curOrdObj.duration) === 'LME') {
                    listField.push(...[
                        {
                            key: I18n.t('initialMarginImpact') + ` (${symbolCurrency})`,
                            width: 50,
                            value: feeObj.initial_margin_impact == null
                                ? '--'
                                : `${objCurSym.symbolCur}${Business.displayMoney(feeObj.initial_margin_impact, PRICE_DECIMAL.VALUE, symbolCurrency)} ${symbolCurrency}`
                        }, {
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
                    listField.push(...[
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
                        }, {
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
                }
            }

            listField.push(...[{
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
            ])
            if (isFuture) {
                if (Business.getExchangeString(symbolObj, curOrdObj.duration) === 'LME') {
                    listField.push(...[
                        {
                            key: I18n.t('firstNoticeDay'),
                            value: (symbolObj && symbolObj.first_noti_day && FunctionUtil.renderTime(DateTime.convertToTimeStampWithFormat(symbolObj.first_noti_day), 'DD MMM YYYY')) || '--'
                        }, {
                            key: I18n.t('contractSize'),
                            value: (commbodityObj && commbodityObj.contract_size) || '--'
                        }, {
                            key: I18n.t('unit'),
                            value: (commbodityObj && commbodityObj.unit && this.capitalizeFirstLetter(commbodityObj.unit)) || '--'
                        }
                    ])
                } else {
                    listField.push(...[
                        {
                            key: I18n.t('expiryDate2'),
                            value: (symbolObj && symbolObj.expiry_date && FunctionUtil.renderTime(DateTime.convertToTimeStampWithFormat(symbolObj.expiry_date, 'MMDDYY'), 'MMM YYYY')) || '--'
                        },
                        {
                            key: I18n.t('firstNoticeDay'),
                            value: (symbolObj && symbolObj.first_noti_day && FunctionUtil.renderTime(DateTime.convertToTimeStampWithFormat(symbolObj.first_noti_day), 'DD MMM YYYY')) || '--'
                        }, {
                            key: I18n.t('contractSize'),
                            value: (commbodityObj && commbodityObj.contract_size) || '--'
                        },
                        {
                            key: I18n.t('unit'),
                            value: (commbodityObj && commbodityObj.unit && this.capitalizeFirstLetter(commbodityObj.unit)) || '--'
                        }
                    ])
                }
            }
        }
        const paramContent = {
            action: ACTION.MODIFY,
            curOrdObj,
            symbolObj,
            oldOrdObj
        };
        return {
            eventCancel,
            eventConfirm,
            listField,
            objNotification: Business.getOrdConfirm(status, ACTION.MODIFY, error),
            // companyName: symbolObj.company_name || symbolObj.company || symbolObj.security_name || '',
            content: Business.genContentConfirmOrder(paramContent),
            is_buy: curOrdObj.is_buy,
            disabledCancel: Business.disabledButtonCancelConfirmScreen(status, isConnected) || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.CONFIRM_CANCEL_BUY_OR_SELL_ORDER),
            disabledConfirm: Business.disabledButtonConfirmConfirmScreen(status, isConnected) || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.CONFIRM_MODIFY_BUY_OR_SELL_ORDER),
            activityConfirm: Business.processingButtonConfirmConfirmScreen(status)
        };
    }

    async modifyOrderParitech() {
        try {
            this.processOrder();

            const url = `${Api.getUrlPlaceOrder()}/${this.curOrdObj.broker_order_id}`;
            const data = await Api.putData(url, { data: this.props.reqObj }, Time.TIMEOUT)
            if (!data) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            this.successOrder();
        } catch (error) {
            FunctionUtil.logDevice('error', `Modify fn err error: ${Json.stringify(error)}`);
            this.errorOrder(ERR.ERR_INTERNAL_CLI);
        }
    }
    capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
                                Business.reloadOrderList() // reload order details
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
                        return FunctionUtil.logDevice('error', `MODIFY - getLastestOrderDetail exception: ${error}`);
                    }
                }
            })
            .catch(error => {
                console.log(error)
                return FunctionUtil.logDevice('error', `getLastestOrderDetail error: ${error}`);
            })
    }

    async modifyOrderIress() {
        try {
            this.timeConfirmOrder = new Date().getTime()
            this.resetListener();
            this.processOrder();

            const url = `${Api.getUrlPlaceOrder()}/${this.curOrdObj.broker_order_id}`;
            const data = await Api.putData(url, { data: this.props.reqObj }, Time.TIMEOUT)
            if (!data) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            const clientOrderID = data.order_id
            const brokerOrderID = this.curOrdObj.broker_order_id
            this.clientOrderID = clientOrderID
            this.brokerOrderID = brokerOrderID
            const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.MODIFY)
            const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
            const channelOrderBrokerOrderID = StreamingBusiness.getChannelOrderBrokerOrderID(brokerOrderID)
            // Sub close form
            this.listener = Emitter.addListener(channelOrderBrokerOrderID, null, ({ data: dataNoti, title }) => {
                FunctionUtil.logDevice('info', `ModifyOrderBroker noti: ${Json.stringify(dataNoti)}, title: ${title}`);
                console.log('BROKER ORDER ID CHANNEL - RECEIVE NOTI AFTER MODIFY ORDER', Json.stringify(dataNoti), title)

                const tagOrder = Business.getTagOrderNotification(title);
                if (this.isDone) return {};
                switch (tagOrder) {
                    case TITLE_NOTI.SUCCESS:
                        this.isDone = true;
                        this.resetListener();
                        this.resetListenerTimeOut();
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        return this.successOrder();
                    case TITLE_NOTI.REJECT:
                        this.resetListenerTimeOut();
                        this.resetListener();
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        return this.errorOrder(FunctionUtil.getReason(dataNoti.text));
                    default:
                        break;
                }
            })
            // Sub timeout
            this.listenerTimeOut = Emitter.addListener(channelOrderClientOrderID, null, ({ data: dataNoti, title }) => {
                this.clearTimeoutNotiBackend()
                this.clearIntervalGetLatestOrderDetail()
                FunctionUtil.logDevice('info', `ModifyOrderClient noti: ${Json.stringify(dataNoti)}, title: ${title}`);
                console.log('CLIENT ORDER ID CHANNEL - RECEIVE NOTI AFTER MODIFY ORDER', Json.stringify(dataNoti), title)

                const tagOrder = Business.getTagOrderNotification(title);
                if (this.isDone) return {};
                switch (tagOrder) {
                    case TITLE_NOTI.TIMEOUT:
                        this.resetListener();
                        this.resetListenerTimeOut();
                        return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT_NOTI));
                    default:
                        break;
                }
            })
            // Sub lose sse connect
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
            FunctionUtil.logDevice('error', `Modify fn err error: ${Json.stringify(error)}`);
            this.errorOrder(ERR.ERR_INTERNAL_CLI);
        }
    }

    async modifyOrderSaxo() {
        try {
            this.timeConfirmOrder = new Date().getTime()
            this.resetListener();
            this.processOrder();

            const url = `${Api.getUrlPlaceOrder()}/${this.curOrdObj.broker_order_id}`;
            const data = await Api.putData(url, { data: this.props.reqObj }, Time.TIMEOUT)
            if (!data) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            const clientOrderID = data.order_id
            const brokerOrderID = this.curOrdObj.broker_order_id
            this.clientOrderID = clientOrderID
            this.brokerOrderID = brokerOrderID
            const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.MODIFY)
            const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
            const channelOrderBrokerOrderID = StreamingBusiness.getChannelOrderBrokerOrderID(brokerOrderID)
            // Sub close form
            this.listener = Emitter.addListener(channelOrderBrokerOrderID, null, ({ data: dataNoti, title }) => {
                FunctionUtil.logDevice('info', `ModifyOrderBroker noti: ${Json.stringify(dataNoti)}, title: ${title}`);

                const tagOrder = Business.getTagOrderNotification(title);
                if (this.isDone) return {};
                switch (tagOrder) {
                    case TITLE_NOTI.SUCCESS:
                        this.isDone = true;
                        this.resetListener();
                        this.resetListenerTimeOut();
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        return this.successOrder();
                    case TITLE_NOTI.REJECT:
                        this.resetListenerTimeOut();
                        this.resetListener();
                        this.clearTimeoutNotiBackend()
                        this.clearIntervalGetLatestOrderDetail()
                        return this.errorOrder(FunctionUtil.getReason(dataNoti.text));
                    default:
                        break;
                }
            })
            // Sub time out
            this.listenerTimeOut = Emitter.addListener(channelOrderClientOrderID, null, ({ data: dataNoti, title }) => {
                this.clearTimeoutNotiBackend()
                this.clearIntervalGetLatestOrderDetail()
                FunctionUtil.logDevice('info', `ModifyOrderClient noti: ${Json.stringify(dataNoti)}, title: ${title}`);

                const tagOrder = Business.getTagOrderNotification(title);
                if (this.isDone) return {};
                switch (tagOrder) {
                    case TITLE_NOTI.TIMEOUT:
                        this.isDone = true;
                        this.resetListener();
                        this.resetListenerTimeOut();
                        return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT_NOTI));
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
            FunctionUtil.logDevice('error', `Modify fn err error: ${Json.stringify(error)}`);
            this.errorOrder(ERR.ERR_INTERNAL_CLI);
        }
    }

    componentDidMount() {
        func.setCurrentScreenId(ScreenId.CONFIRM_MODIFY_ORDER)
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
            curOrdObj: this.curOrdObj,
            symbolObj: this.symbol,
            oldOrdObj: this.props.oldOrdObj,
            commbodityObj: this.commbodityInfo,
            feeObj: this.feeObj,
            eventCancel: this.eventClickCancel,
            eventConfirm: this.modifyOrder,
            status: this.state.status,
            error: this.state.err,
            actor: this.props.actor,
            isConnected: this.props.isConnected
        });
        const propsView = {
            loadData: this.loadData,
            propConfirm: {
                ...propConfirm,
                companyName: this.props.companyName,
                isConnected: this.props.isConnected
            }
        };
        return (
            <ConfirmView
                isLoading={this.state.isLoading}
                {...propsView}
                ref={ref => this.refConfirmView = ref} />
        );
    }

    componentWillUnmount() {
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.MODIFY))
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderClientOrderID(this.clientOrderID))
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderBrokerOrderID(this.brokerOrderID))
        this.listener = null
        this.listenerTimeOut = null
        this.listenerReconnectSSE = null
    }
};

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ConfirmModifyOrder);
