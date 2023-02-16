import React, { Component } from 'react';
import _ from 'lodash';
import { Text, PixelRatio, View } from 'react-native';

// Func
import { func, dataStorage } from '../../../storage';
import I18n from '~/modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import {
    logAndReport, checkPropsStateShouldUpdate, renderTime
} from '../../../lib/base/functionUtil';
import * as Controller from '../../../memory/controller'
import Enum from '../../../enum'
import Icon from 'react-native-vector-icons/Ionicons';
import * as Business from '../../../business';
import orderStateEnum from '../../../constants/order_state_enum';

const {
    USER_TYPE, USER_TYPE_ROLE_SHOW_ORDER_STATE
} = Enum
export class History extends Component {
    constructor(props) {
        super(props);
        this.userId = func.getUserId();
        this.description = '';
        this.isMount = false;
        this.state = {
            check: 0,
            description: '',
            userName: ''
        }
        this.checkRoleUserTypeShowOrderState = this.checkRoleUserTypeShowOrderState.bind(this)
        this.getDescription = this.getDescription.bind(this)
        this.getIcon = this.getIcon.bind(this)
        this.getUserAction = this.getUserAction.bind(this)
        this.getOrderType = this.getOrderType.bind(this)
    }

    getIcon(isBuy, state) {
        try {
            let iconName = 'ios-bookmark';
            switch (state) {
                case orderStateEnum.APPROVE_ACTION_REPLACE:
                case orderStateEnum.APPROVE_ACTION_CANCEL:
                case orderStateEnum.REPLACED:
                    iconName = 'md-checkmark'
                    break;
                case orderStateEnum.REJECT_ACTION_REPLACE:
                case orderStateEnum.REJECT_ACTION_CANCEL:
                    iconName = 'md-close'
                    break;
                case orderStateEnum.UNKNOWN:
                case orderStateEnum.CALCULATED:
                case orderStateEnum.ACCEPTED_FOR_BIDDING:
                case orderStateEnum.NEW:
                case orderStateEnum.DONE_FOR_DAY:
                    iconName = 'ios-flag';
                    break;
                case orderStateEnum.PLACE:
                    iconName = 'ios-person';
                    break;
                case orderStateEnum.PARTIALLY_FILLED:
                case orderStateEnum.FILLED:
                    iconName = isBuy
                        ? 'ios-arrow-up'
                        : 'ios-arrow-down';
                    break;
                case orderStateEnum.REPLACE:
                    iconName = 'ios-person';
                    break;
                case orderStateEnum.STOPPED:
                case orderStateEnum.SUSPENDED:
                    iconName = 'md-information';
                    break;
                case orderStateEnum.CANCELLED:
                case orderStateEnum.REJECTED:
                case orderStateEnum.EXPIRED:
                    iconName = 'md-remove';
                    break;
                case orderStateEnum.AMENDING:
                case orderStateEnum.PENDING_CANCEL:
                case orderStateEnum.PENDING_NEW:
                case orderStateEnum.PENDING_REPLACE:
                    iconName = 'ios-more';
                    break;
                case orderStateEnum.CANCEL:
                    iconName = 'ios-person';
                    break;
            }
            return (
                <View style={{ alignItems: 'center', width: 12 }}>
                    <Icon name={iconName} size={20} color={isBuy ? CommonStyle.fontGreen : CommonStyle.fontRed} />
                </View>
            );
        } catch (error) {
            console.log('getIcon listContent logAndReport exception: ', error)
            logAndReport('getIcon listContent exception', error, 'getIcon listContent');
        }
    }

    getUserAction() {
        try {
            const { data } = this.props;
            if (data.actor_changed) {
                if (data.actor_changed === 'EX-CHANGE') {
                    return I18n.t('exchangeUpper')
                }
                return data.actor_changed;
            } else {
                return Controller.getUserLoginId()
            }
        } catch (error) {
            console.log('getUserAction listContent logAndReport exception: ', error)
            logAndReport('getUserAction listContent exception', error, 'getIcon listContent');
        }
    }

    getOrderType(data) {
        try {
            const type = data.order_type;
            if (type && type === orderType.STOP_ORDER) {
                if (data.trail_amount || data.trail_percent) {
                    return data.limit_price ? orderType.TRAILINGSTOPLIMIT_ORDER : orderType.TRAILINGSTOP_ORDER;
                }
                return data.limit_price ? orderType.STOPLIMIT_ORDER : orderType.STOPLOSS_ORDER;
            }
            return type;
        } catch (error) {
            console.log('getOrderType listContent logAndReport exception: ', error)
            logAndReport('getOrderType listContent exception', error, 'getIcon listContent');
        }
    }

    setPlaceReplaceDescription({ isTrigger, displayName, orderType, orderAction }) {
        const note = orderAction.note;
        try {
            noteObj = JSON.parse(orderAction.note)
            noteObj.displayName = displayName
            noteObj.isTrigger = isTrigger
            if (noteObj && !noteObj.order_type) {
                noteObj.order_type = orderType;
            }
            this.description = Business.getNoteDetail(noteObj)
        } catch (error) {
            this.description = note || ''
            console.log(`parse order ation note error ${error}`)
        }
    }

    setCancelDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteCancel(data)
    }

    setTriggerDescription({ displayName, data }) {
        data.displayName = displayName
        this.description = Business.getNoteTrigger(data)
    }

    setPendingCancelDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNotePendingCancel(data)
    }

    setPendingReplaceDescription({ isTrigger, displayName, data }) {
        // Có note mới nhất để lấy requestQuantity, requestLimitPrice, requestStopPrice
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNotePendingReplace(data)
    }

    setApproveCancelDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteApproveCancel(data)
    }

    setApproveReplaceDescription({ isTrigger, displayName, data }) {
        // Có note mới nhất để lấy requestQuantity, requestLimitPrice, requestStopPrice
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteApproveReplace(data)
    }

    setDenyCancelDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteDenyCancel(data)
    }

    setDenyReplaceDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteDenyReplace(data)
    }

    setNewDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteNew(data)
    }

    setPendingNewDescription({ displayName, data }) {
        data.displayName = displayName
        this.description = Business.getNotePendingNew(data)
    }

    setPartiallyFilledDescription({ displayName, data }) {
        data.displayName = displayName
        this.description = Business.getNotePartiallyFilled(data)
    }

    setFilledDescription({ data }) {
        this.description = Business.getNoteFilled(data)
    }

    setDoneForDayDescription({ displayName, data }) {
        data.displayName = displayName
        this.description = Business.getNoteDoneForDay(data)
    }

    setCancelledDescription({ displayName, data }) {
        data.displayName = displayName
        this.description = Business.getNoteCancelled(data)
    }

    setRejectedDescription({ displayName, data }) {
        data.displayName = displayName
        this.description = Business.getNoteRejected(data)
    }

    setStoppedDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteStopped(data)
    }

    setSuspendedDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteSuspended(data)
    }

    setCalculatedDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteCalculated(data)
    }

    setExpiredDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteExpired(data)
    }

    setAcceptedForBiddingDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNoteAcceptedForBidding(data)
    }

    setPurgedDescription({ isTrigger, displayName, data }) {
        data.displayName = displayName
        data.isTrigger = isTrigger
        this.description = Business.getNotePurged(data)
    }
    pasreJsonString(str) {
        try {
            return JSON.parse(str)
        } catch (error) {
            return {}
        }
    }
    getDescription() {
        try {
            const { data, isPartiallFilled, displayName } = this.props;
            const isTrigger = false
            const filled = parseInt(data.filled_quantity) || 0;
            const volume = parseInt(data.volume);
            const restVolume = volume - filled;
            const limitPrice = data.limit_price || 0;
            const stopPrice = data.stop_price || 0;
            const state = data.order_status;
            const type = (this.state.isParitech ? data.order_type_origin : data.order_type + '').toUpperCase();
            const originType = (data.order_type_origin + '').toUpperCase();
            const orderType = (data.order_type + '').toUpperCase();
            const orderAction = data.order_action ? this.pasreJsonString(data.order_action) : {};
            switch (state) {
                case orderStateEnum.PLACE:
                case orderStateEnum.REPLACE:
                    this.setPlaceReplaceDescription({ isTrigger, displayName, orderType, orderAction })
                    break;
                case orderStateEnum.CANCEL:
                    this.setCancelDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.TRIGGER:
                    this.setTriggerDescription({ displayName, data })
                    break;
                case orderStateEnum.PENDING_CANCEL:
                    this.setPendingCancelDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.PENDING_REPLACE:
                    this.setPendingReplaceDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.APPROVE_ACTION_CANCEL:
                    this.setApproveCancelDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.APPROVE_ACTION_REPLACE:
                case orderStateEnum.REPLACED:
                    this.setApproveReplaceDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.REJECT_ACTION_CANCEL:
                    this.setDenyCancelDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.REJECT_ACTION_REPLACE:
                    this.setDenyReplaceDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.PENDING_NEW:
                    this.setPendingNewDescription({ displayName, data })
                    break;
                case orderStateEnum.NEW:
                    this.setNewDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.PARTIALLY_FILLED:
                    this.setPartiallyFilledDescription({ displayName, data })
                    break;
                case orderStateEnum.FILLED:
                    this.setFilledDescription({ data })
                    break;
                case orderStateEnum.DONE_FOR_DAY:
                    this.setDoneForDayDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.CANCELLED:
                    this.setCancelledDescription({ displayName, data })
                    break;
                case orderStateEnum.STOPPED:
                    this.setStoppedDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.REJECTED:
                    this.setRejectedDescription({ displayName, data })
                    break;
                case orderStateEnum.SUSPENDED:
                    this.setSuspendedDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.CALCULATED:
                    this.setCalculatedDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.EXPIRED:
                    this.setExpiredDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.ACCEPTED_FOR_BIDDING:
                    this.setAcceptedForBiddingDescription({ isTrigger, displayName, data })
                    break;
                case orderStateEnum.PURGED:
                    this.setPurgedDescription({ isTrigger, displayName, data })
                    break;
                default:
                    break;
            }
            this.isMount && this.setState({ description: this.description });
        } catch (error) {
            console.log('getDescription listContent logAndReport exception: ', error)
            logAndReport('getDescription listContent exception', error, 'getIcon listContent');
        }
    }

    checkRoleUserTypeShowOrderState() {
        const { data } = this.props;
        const state = data.order_status;
        const userType = Controller.getUserType()
        if (userType === USER_TYPE.OPERATOR) {
            return true
        }
        if (USER_TYPE_ROLE_SHOW_ORDER_STATE.ADVISOR.includes(state)) {
            return true
        }
        return false
    }

    componentDidMount() {
        try {
            this.isMount = true;
            this.getDescription();
        } catch (error) {
            console.log('componentDidMount listContent logAndReport exception: ', error)
            logAndReport('componentDidMount listContent history', error, 'componentDidMount history');
        }
    }

    componentWillUnmount() {
        this.isMount = false;
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     const listProps = [{
    //         app: ['isConnected'],
    //         data: ['isAlert', 'actor_changed', 'is_buy', 'order_type', 'order_state', 'note', 'limit_price', 'stop_price', 'avg_price',
    //             'volume', 'filled_quantity', 'updated']
    //     }, { setting: ['lang'] }];
    //     const listState = ['check', 'description'];
    //     const check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    //     return check;
    // }

    render() {
        const { data } = this.props;
        const isShowOrderHistory = this.checkRoleUserTypeShowOrderState()
        if (!isShowOrderHistory) return null
        return (
            <View style={{ borderBottomWidth: 1, borderColor: CommonStyle.fontBorderGray, paddingVertical: 4 }}>
                <View style={{ flexDirection: 'row' }}>
                    {
                        this.getIcon(data.is_buy, data.order_status)
                    }
                    <Text style={[CommonStyle.textSubNormalBlack, { marginLeft: 8 }]} numberOfLines={3}>{this.state.description}</Text>
                </View>

                <View style={{ paddingLeft: 8 }}>
                    <Text style={[CommonStyle.textFloatingLabel, { textAlign: 'right' }]} numberOfLines={2}>{this.getUserAction()}</Text>
                    <Text style={[CommonStyle.textFloatingLabel, { textAlign: 'right' }]} numberOfLines={2}>{renderTime(data.updated)}</Text>
                </View>
            </View>
        )
    }
}
export default History;
