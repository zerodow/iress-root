import React, { Component } from 'react';
import {
    Image, View, Text, TouchableOpacity, Dimensions,
    Keyboard, PixelRatio, ScrollView,
    Platform, ActivityIndicator
} from 'react-native';
import {
    logDevice, checkTradingHalt,
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount
} from '../../lib/base/functionUtil';
import * as Lv1 from '../../streaming/lv1';
import * as AllMarket from '../../streaming/all_market'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business'
import styles from './style/order';
import TimeUpdated from '../../component/time_updated/time_updated';
import NotifyOrder from '../../component/notify_order';
import NetworkWarning from '../../component/network_warning/network_warning';
import { connect } from 'react-redux';
import { iconsMap } from '../../utils/AppIcons';
import { bindActionCreators } from 'redux';
import * as newOrderActions from './order.actions';
import userType from '../../constants/user_type';
import { func, dataStorage } from '../../storage';
import { setCurrentScreen } from '../../lib/base/analytics';
import I18n from '../../modules/language/';
import orderType from '../../constants/order_type';
import orderTypeString from '../../constants/order_type_string';
import tradeTypeString from '../../constants/trade_type_string';
import PickerCustom from './new_picker';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import loginUserType from '../../constants/login_user_type'
import PromptNew from '../../component/new_prompt/prompt_new'
import TouchSearchGesture from '../../img/one-touch.png';
import SwipeGesture from '../../img/swipe.png';
import analyticsEnum from '../../constants/analytics';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import * as api from '../../api';
import SwiperMarketDepthRealtime from '../market_depth/swiper_market_depth_realtime';
import SwiperMarketDepth from '../market_depth/swiper_market_depth';
import TenTrade from '../market_depth/swiper_10_trades';
import TenTradeRealtime from '../market_depth/swiper_10_trades_realtime';
import orderConditionString from '../../constants/order_condition_string';
import * as fbEmit from '../../emitter';
import Enum from '../../enum';
import * as Util from '../../util';
import * as Business from '../../business';
import * as appActions from '../../app.actions';
import * as portfolioActions from '~s/portfolio/Redux/actions'
import CustomInputAndroid from '../../component/custom_input/custom_input';
import * as Translate from '../../invert_translate';
import Flashing from '../../component/flashing/flashing';
import XComponent from '../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';
import Uuid from 'react-native-uuid';

const ACTION = Enum.ACTION_ORD;
const CHANNEL = Enum.CHANNEL;
const EVENT = Enum.EVENT;
const SCREEN = Enum.SCREEN;
const ID_ELEMENT = Enum.ID_ELEMENT;
const ICON_NAME = Enum.ICON_NAME;
const CURRENCY = Enum.CURRENCY;
const ACCOUNT_STATE = Enum.ACCOUNT_STATE;
const DURATION_CODE = Enum.DURATION_CODE;
const EXCHANGE_CODE = Enum.EXCHANGE_CODE;
const DEFAULT_VAL = Enum.DEFAULT_VAL;
const DURATION_MAPPING_STRING_CODE = Enum.DURATION_MAPPING_STRING_CODE;
const DURATION_STRING = Enum.DURATION_STRING;
const ORDER_TYPE_SYSTEM = Enum.ORDER_TYPE_SYSTEM;
const TYPE_VALID_CUSTOM_INPUT = Enum.TYPE_VALID_CUSTOM_INPUT;
const KEYBOARD_TYPE = Enum.KEYBOARD_TYPE;
const PTC_CHANNEL = Enum.PTC_CHANNEL;
const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;
const JSON = Util.json;
const DECIMAL_FEE = 2;
const DECIMAL_ORDER_VALUE = 2;
const DECIMAL_TOTAL = 2;
const CONST_STYLE = CommonStyle;
const TIME_OUT_INPUT = 700;
const listCondition = [orderConditionString.None, orderConditionString.StopLoss];
const { width, height } = Dimensions.get('window');
const NOTE_STATE = Enum.NOTE_STATE
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const EXCHANGE_STRING = Enum.EXCHANGE_STRING;

export default class ChangePoint extends XComponent {
    constructor(props) {
        super(props)

        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
    }

    init() {
        this.dic = {
            value: this.props.value || {},
            isLoading: this.props.isLoading,
            id: Util.getRandomKey()
        }
    }

    bindAllFunc() {
        this.onLoading = this.onLoading.bind(this)
        this.onValueChange = this.onValueChange.bind(this)
    }

    componentDidMount() {
        super.componentDidMount()
        Emitter.addListener(this.props.channelLoadingOrder, this.dic.id, this.onLoading)
        Emitter.addListener(this.props.channelPriceOrder, this.dic.id, this.onValueChange)
    }

    onLoading(data) {
        if (this.dic.isLoading === data) return;
        this.dic.isLoading = data;
        this.setStateLowPriority();
    }

    onValueChange({ data, isMerge = true }) {
        if (!data) return;
        if (
            (this.dic.value === undefined ||
                this.dic.value === null ||
                this.dic.value.change_point === undefined ||
                this.dic.value.change_point === null ||
                this.dic.value.change_point !== data.change_point) &&
            data.change_point !== undefined &&
            data.change_point !== null
        ) {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data
            }
            this.setStateLowPriority();
        } else {
            if (isMerge) {
                this.dic.value = { ...this.dic.value, ...data }
            } else {
                this.dic.value = data
            }
        }
    }
    getDisplay = () => {
        if (this.dic.loading) {
            return this.dic.value.change_point !== undefined && this.dic.value.change_point !== null ? formatNumberNew2(this.dic.value.change_point, PRICE_DECIMAL.PRICE) : '0.1440'
        } else {
            return this.dic.value.change_point !== undefined && this.dic.value.change_point !== null ? formatNumberNew2(this.dic.value.change_point, PRICE_DECIMAL.PRICE) : '--'
        }
    }
    render() {
        return (
            <View style={[this.props.containerStyle, { flexDirection: 'row', alignItems: 'center' }]}>
                {
                    this.props.isNoneIcon ? null : (this.dic.value.change_point > 0
                        ? <CommonStyle.icons.arrowUp name='md-arrow-dropup'
                            color={CommonStyle.todayChangeUpTextColor}
                            style={[styles.iconPickerUp, { color: CommonStyle.todayChangeUpTextColor, marginRight: 5 }]} />
                        : this.dic.value.change_point < 0
                            ? <CommonStyle.icons.arrowDown name='md-arrow-dropdown'
                                color={CommonStyle.todayChangeDownTextColor}
                                style={[styles.iconPickerDown, {
                                    color: CommonStyle.todayChangeDownTextColor,
                                    marginRight: 2
                                }]} />
                            : <View />)
                }
                <Text style={[CommonStyle.textSubBlack, {
                    fontSize: CommonStyle.fontSizeM,
                    fontWeight: '300',
                    color: this.dic.value.change_point > 0 ? CommonStyle.todayChangeUpTextColor : this.dic.value.change_point < 0 ? CommonStyle.todayChangeDownTextColor : CommonStyle.todayChangeEqualTextColor
                }, this.props.style]}>{this.getDisplay()}</Text>
            </View>
        )
    }
}
