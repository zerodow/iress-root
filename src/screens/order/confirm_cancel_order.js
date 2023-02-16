import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import * as FunctionUtil from '../../lib/base/functionUtil'
import * as Api from '../../api';
import Time from '../../constants/time';
import * as Util from '../../util';
import ProgressBar from '../../modules/_global/ProgressBar';
import PropTypes from 'prop-types';
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

const Json = Util.json;
const ACTION = Enum.ACTION_ORD;
const STATUS = Enum.STATUS_ORD;
const ERR = Enum.ERROR_CODE;
const NAV_EVENT = Enum.NAVIGATOR_EVENT;
const ID_ELEMENT = Enum.ID_ELEMENT;
const ICON_NAME = Enum.ICON_NAME;
const CHANNEL = Enum.CHANNEL;
const TITLE_NOTI = Enum.TITLE_NOTI;
const ORDER_STATE_SYSTEM = Enum.ORDER_STATE_SYSTEM;
const DURATION_CODE = Enum.DURATION_CODE

export class ConfirmCancelOrder extends Component {
    static propTypes = {
        oldOrdObj: PropTypes.object.isRequired,
        successCb: PropTypes.func,
        actor: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        this.timeoutNotiBackend = null
        this.intervalGetLastestOrderDetail = null
        this.listenerReconnectSSE = null
        this.timeConfirmOrder = null
        this.showError = this.showError.bind(this)
        this.setTimeoutNotiBackend = this.setTimeoutNotiBackend.bind(this)
        this.clearTimeoutNotiBackend = this.clearTimeoutNotiBackend.bind(this)
        this.dismissForm = this.dismissForm.bind(this);
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
        this.eventClickCancel = this.eventClickCancel.bind(this);
        this.getLastestOrderDetail = this.getLastestOrderDetail.bind(this)
        this.setIntervalGetLatestOrderDetail = this.setIntervalGetLatestOrderDetail.bind(this)
        this.cancelOrd = this.cancelOrd.bind(this);
        this.cancelOrdParitech = this.cancelOrdParitech.bind(this);
        this.cancelOrdIress = this.cancelOrdIress.bind(this)
        this.cancelOrdSaxo = this.cancelOrdSaxo.bind(this);
        this.processOrd = this.processOrd.bind(this);
        this.resetListener = this.resetListener.bind(this);
        this.resetListenerTimeOut = this.resetListenerTimeOut.bind(this);
        this.getTradingMarket = this.getTradingMarket.bind(this)

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.state = {
            status: STATUS.NONE,
            err: '',
            isLoading: true
        };
        this.symbol = props.symbolObj || {};
        this.listener = null;
        this.listenerTimeOut = null;
        this.clientOrderID = null;
        this.brokderOrderID = null;
    }

    componentDidMount() {
        func.setCurrentScreenId(ScreenId.CONFIRM_CANCEL_ORDER)
        this.buttonBack();
    }

    componentDidUpdate() {
        this.buttonBack();
    }

    showError(obj) {
        this.refConfirmOrder && this.refConfirmOrder.showError && this.refConfirmOrder.showError(obj)
    }

    render() {
        const props = this.genParamLoaded({
            firstDetail: this.firstDetail,
            firstOrder: this.firstOrder,
            oldOrdObj: this.currentOrder || this.props.oldOrdObj,
            symbolObj: this.symbol,
            eventCancel: this.eventClickCancel,
            eventConfirm: this.cancelOrd,
            status: this.state.status,
            error: this.state.err,
            actor: this.props.actor,
            isConnected: this.props.isConnected
        })
        if (this.state.isLoading) {
            this.loadData();
        }
        return <ConfirmOrder {...props}
            companyName={this.props.companyName}
            isLoading={this.state.isLoading}
            title={I18n.t('confirmCancelOrder')}
            ref={ref => this.refConfirmOrder = ref} />
    }

    //  #endregion

    //  #region BUSINESS

    errorOrder(err) {
        const objNotify = Business.getOrdConfirm(STATUS.ERROR, ACTION.CANCEL, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.setState({
            err,
            status: STATUS.ERROR
        });
    }

    timeoutOrder(err) {
        const objNotify = Business.getOrdConfirm(STATUS.TIMEOUT, ACTION.CANCEL, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.setState({
            err,
            status: STATUS.TIMEOUT
        });
    }

    processOrd(err = '') {
        const objNotify = Business.getOrdConfirm(STATUS.PROCESS, ACTION.CANCEL, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.setState({
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
        const objNotify = Business.getOrdConfirm(STATUS.SUCCESS, ACTION.CANCEL, err)
        this.showError({ error: objNotify.txt, type: objNotify.type })
        this.setState({
            err,
            status: STATUS.SUCCESS
        }, () => {
            setTimeout(() => this.dismissForm(), 500);
        });
    }

    cancelOrd() {
        const enableIress = Controller.getIressStatus()
        Business.isParitech(this.currentOrder.symbol)
            ? enableIress
                ? this.cancelOrdIress()
                : this.cancelOrdParitech()
            : this.cancelOrdSaxo();
    }

    async cancelOrdParitech() {
        try {
            this.processOrd();

            const url = Api.getUrlOrder(this.currentOrder.broker_order_id);
            const data = await Api.deleteData(url, Time.TIMEOUT);
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
                        return FunctionUtil.logDevice('error', `CANCEL - getLastestOrderDetail exception: ${error}`);
                    }
                }
            })
            .catch(error => {
                console.log(error)
                return FunctionUtil.logDevice('error', `CANCEL - getLastestOrderDetail error: ${error}`);
            })
    }

    async cancelOrdIress() {
        try {
            this.timeConfirmOrder = new Date().getTime()
            this.resetListener();
            this.processOrd();

            // TIMEOUT CLIENT
            this.clearTimeoutNotiBackend()
            this.setTimeoutNotiBackend()
            const url = Api.getUrlOrder(this.currentOrder.broker_order_id);
            const data = await Api.deleteData(url, Time.TIMEOUT);
            if (!data) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            const clientOrderID = data.order_id
            const brokerOrderID = this.props.oldOrdObj.broker_order_id
            this.clientOrderID = clientOrderID
            this.brokerOrderID = brokerOrderID
            const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.CANCEL)
            const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
            const channelOrderBrokerOrderID = StreamingBusiness.getChannelOrderBrokerOrderID(brokerOrderID)
            // Sub close form
            this.listener = Emitter.addListener(channelOrderBrokerOrderID, null, ({ data: dataNoti, title }) => {
                FunctionUtil.logDevice('info', `CancelOrderBroker noti: ${Json.stringify(dataNoti)}, title: ${title}`);
                console.log('BROKER ORDER ID CHANNEL - RECEIVE NOTI AFTER CANCEL ORDER', Json.stringify(dataNoti), title)

                const tagOrder = Business.getTagOrderNotification(title);
                switch (tagOrder) {
                    case TITLE_NOTI.SUCCESS:
                        this.resetListener();
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
                FunctionUtil.logDevice('info', `CancelOrderClient noti: ${Json.stringify(dataNoti)}, title: ${title}`);
                console.log('CLIENT ORDER ID CHANNEL - RECEIVE NOTI AFTER CANCEL ORDER', Json.stringify(dataNoti), title)

                const tagOrder = Business.getTagOrderNotification(title);
                switch (tagOrder) {
                    case TITLE_NOTI.TIMEOUT:
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

    componentWillUnmount() {
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.CANCEL))
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderClientOrderID(this.clientOrderID))
        Emitter.deleteEvent(StreamingBusiness.getChannelOrderBrokerOrderID(this.brokerOrderID))
        this.listenerReconnectSSE = null
        this.listener = null
        this.listenerTimeOut = null
    }

    async cancelOrdSaxo() {
        try {
            this.timeConfirmOrder = new Date().getTime()
            this.resetListener();
            this.processOrd();

            // TIMEOUT CLIENT
            this.clearTimeoutNotiBackend()
            this.setTimeoutNotiBackend()
            const url = Api.getUrlOrder(this.props.oldOrdObj.broker_order_id);
            const data = await Api.deleteData(url, Time.TIMEOUT);
            if (!data) return this.errorOrder(ERR.ERR_INTERNAL_CLI);
            if (data.errorCode === ERR.TIMEOUT) return this.timeoutOrder(FunctionUtil.getReason(ERR.TIMEOUT));
            if (Util.arrayHasItem(data.errorCode)) return this.errorOrder(FunctionUtil.getReason(data.errorCode[0]));
            if (data.errorCode !== ERR.SUCCESS) return this.errorOrder(FunctionUtil.getReason(data.errorCode));

            const clientOrderID = data.order_id
            const brokerOrderID = this.props.oldOrdObj.broker_order_id
            this.clientOrderID = clientOrderID
            this.brokerOrderID = brokerOrderID
            const channelOrderReconnectSSE = StreamingBusiness.getChannelOrderReconnectSSE(Enum.ACTION_ORD.CANCEL)
            const channelOrderClientOrderID = StreamingBusiness.getChannelOrderClientOrderID(clientOrderID)
            const channelOrderBrokerOrderID = StreamingBusiness.getChannelOrderBrokerOrderID(brokerOrderID)
            // Sub close form
            this.listener = Emitter.addListener(channelOrderBrokerOrderID, null, ({ data: dataNoti, title }) => {
                console.log('emitOrder addListener broker id', this.props.oldOrdObj.broker_order_id, dataNoti.text)
                FunctionUtil.logDevice('info', `CancelOrderBroker noti: ${Json.stringify(dataNoti)}, title: ${title}`);

                const tagOrder = Business.getTagOrderNotification(title);
                switch (tagOrder) {
                    case TITLE_NOTI.SUCCESS:
                        this.resetListener();
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
                console.log('emitOrder addListener client id', clientOrderID, dataNoti)
                this.clearTimeoutNotiBackend()
                this.clearIntervalGetLatestOrderDetail()
                FunctionUtil.logDevice('info', `CancelOrderClient noti: ${Json.stringify(dataNoti)}, title: ${title}`);

                const tagOrder = Business.getTagOrderNotification(title);
                switch (tagOrder) {
                    case TITLE_NOTI.TIMEOUT:
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

    dismissForm() {
        // this.props.navigator && this.props.navigator.dismissModal();
        this.props.dismissAllModals && this.props.dismissAllModals()
        this.props.successCb && this.props.successCb();
    }

    async loadData() {
        const res = await ConfirmBusiness.loadDataConfirmCancel(this.props.oldOrdObj);
        if (res && res.symbol) {
            this.symbol = res.symbol;
            this.firstDetail = res.firstDetail;
            this.firstOrder = res.firstOrder;
            this.currentOrder = res.currentOrder;
            this.setState({ isLoading: false });
        }
    }

    eventClickCancel() {
        // Reset current screen id to realtime order list
        func.setCurrentScreenId(ScreenId.ORDERS)
        this.props.navigator && this.props.navigator.dismissModal({
            animationType: 'none'
        });
    }

    getNote(note, symbolObj) {
        try {
            noteObj = JSON.parse(note)
            return Business.getNoteDetail(noteObj, symbolObj)
        } catch (error) {
            console.log(`parse order ation note error ${error}`)
            return note || ''
        }
    }

    getTradingMarket(orderDetail) {
        const tradingMarket = orderDetail.trading_market
        let exchange = tradingMarket
        if (tradingMarket && tradingMarket === 'SAXO_BANK') {
            exchange = orderDetail.exchange
        }
        return exchange
    }

    genParamLoaded({
        oldOrdObj = {},
        symbolObj = {},
        eventCancel,
        eventConfirm,
        status,
        error,
        actor = '--',
        firstDetail = {},
        firstOrder = {},
        isConnected
    }) {
        let listField = []
        listField.push(...[
            {
                key: I18n.t('userInfo'),
                value: func.getDisplayAccount()
            },
            {
                key: I18n.t('actor'),
                value: actor
            }
        ])

        listField.push(...[
            {
                key: I18n.t('orderId'),
                value: `${oldOrdObj.display_order_id}`
            },
            {
                key: I18n.t('Original_Order'),
                value: firstOrder.order_state === ORDER_STATE_SYSTEM.USERPLACE ? this.getNote(firstDetail.note, symbolObj) : '--'
            },
            {
                key: I18n.t('duration'),
                value: this.state.isLoading ? '---' : Business.getDisplayDuration(oldOrdObj.duration)
            }
        ])

        if (oldOrdObj.duration === DURATION_CODE.GTD) {
            listField.push({
                key: I18n.t('date'),
                value: moment(oldOrdObj.expire_date).format('DD/MM/YYYY')
            })
        }

        listField.push(...[
            {
                key: I18n.t('exchange_txt'),
                value: Business.getExchangeName(this.getTradingMarket(oldOrdObj))
            },
            {
                key: I18n.t('Status'),
                value: FunctionUtil.getActionType(oldOrdObj.order_status) || ''
            }, {
                key: I18n.t('Filled'),
                value: oldOrdObj.filled_quantity || 0
            }
        ])

        const paramContent = {
            action: ACTION.CANCEL,
            curOrdObj: oldOrdObj,
            symbolObj
        };
        return {
            eventCancel,
            eventConfirm,
            listField,
            objNotification: Business.getOrdConfirm(status, ACTION.CANCEL, error),
            // companyName: symbolObj.company_name || symbolObj.company || symbolObj.security_name || '',
            content: Business.genContentConfirmOrder(paramContent),
            is_buy: oldOrdObj.is_buy,
            disabledCancel: Business.disabledButtonCancelConfirmScreen(status, isConnected),
            disabledConfirm: Business.disabledButtonConfirmConfirmScreen(status, isConnected) || !RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.CONFIRM_CANCEL_BUY_OR_SELL_ORDER),
            activityConfirm: Business.processingButtonConfirmConfirmScreen(status)
        };
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

    buttonBack() {
        this.props.navigator.setButtons({
            leftButtons: [{
                id: ID_ELEMENT.BTN_BACK_CONFIRM_ORDER,
                icon: Util.getValByPlatform(
                    IconsMap[ICON_NAME.ARROW_BACK.IOS],
                    IconsMap[ICON_NAME.ARROW_BACK.ANDROID]),
                disabled: Business.disabledButtonBackConfirmScreen(this.state.status, this.props.isConnected)
            }]
        });
    }

    //  #endregion
};

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ConfirmCancelOrder);
