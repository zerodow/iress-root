import React, { Component } from 'react';
import _ from 'lodash';
import { Text, View, Animated, TouchableOpacity, Platform } from 'react-native';
import { connect } from 'react-redux'

import { dataStorage } from '../../../storage';
import CommonStyle from '~/theme/theme_controller'
import {
    logAndReport,
    logDevice
} from '../../../lib/base/functionUtil';
import Icon from 'react-native-vector-icons/Ionicons';
import Flag from '../../../component/flags/flag';

import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import * as api from '~/api';
import History from './history';
import BtnModifyCancel from './buttonModifyCancel';
import OrderDetail from './order/order_detail';
import orderStateEnum from '../../../constants/order_state_enum';
import { bindActionCreators } from 'redux';
import * as authSettingActions from '../../setting/auth_setting/auth_setting.actions';
import * as loginActions from '../../../screens/login/login.actions';
import SearchSymbolDetail from '../detail/symbol/search_symbol_detail'
import LastTradeInfo from './price/last_trade_info'
import LastTradeDetail from './price/last_trade_detail';
class SlidingPanel extends Component {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.dic = {
            isPin: false,
            heightInfoDetail: new Animated.Value(0),
            opacityInfoDetail: new Animated.Value(0),
            heightInfo: new Animated.Value(32),
            opacityInfo: new Animated.Value(1)
        };
        this.androidTouchID = null;
        this.symbolObject = dataStorage.symbolEquity[props.symbol] || {}
        this.init();
        this.scrollValue = new Animated.Value(0)
        this.scrollContainerValue = new Animated.Value(0)
        this.addListenerForContainerScroll()
        this.addListenerForChildrenScroll()
        this.params = {}
        this.state = {
            data: props.data || {},
            listOrder: [],
            exchange: '',
            symbol: ''
        }
        this.isMount = false;
    }
    init() {
        this.handlePressOn = this.handlePressOn.bind(this);
        this.getDataHistory = this.getDataHistory.bind(this);
    }
    componentWillReceiveProps(props) {
        if (props.data) {
            if (props.data.symbol) {
                this.symbolObject = dataStorage.symbolEquity[props.data.symbol] || {}
            }
            this.setState({ data: props.data })
        }
    }
    addListenerForContainerScroll = () => {
        this.scrollContainerValue.addListener(({ value }) => {
            const threshold = 88;
            if (value > threshold && this.props.title === 'orderDetailUpper') {
                this.props.changeTitle && this.props.changeTitle('universalSearch');
            } else if (value <= threshold && this.props.title !== 'orderDetailUpper') {
                this.props.changeTitle && this.props.changeTitle('orderDetailUpper');
            }
        });
    }
    addListenerForChildrenScroll = () => {
        this.scrollValue.addListener(({ value }) => {
            const triggerValue = 68
            if (value > triggerValue && !this.dic.isPin) {
                this.dic.isPin = true;
                // show special price
                this.hideShowPriceAnim(true)
            } else if (value < triggerValue && this.dic.isPin) {
                // show default price
                this.dic.isPin = false;
                this.hideShowPriceAnim(false)
            }
        })
    }

    hideShowPriceAnim(isShow, duration = 250) {
        Animated.parallel([
            Animated.timing(
                this.dic.heightInfoDetail,
                {
                    toValue: isShow ? 52 : 0,
                    duration
                }
            ),
            Animated.timing(
                this.dic.heightInfo,
                {
                    toValue: isShow ? 0 : 32,
                    duration
                }
            ),
            Animated.timing(
                this.dic.opacityInfo,
                {
                    toValue: isShow ? 0 : 1,
                    duration
                }
            ),
            Animated.timing(
                this.dic.opacityInfoDetail,
                {
                    toValue: isShow ? 1 : 0,
                    duration
                }
            )
        ]).start()
    }
    handlePressOn() {
        try {
            this.getDataHistory();
            this.onPressOrder();
        } catch (error) {
            console.log('error handle Press On ', error)
        }
    }
    onPressOrder = () => {
        this.nestedScroll && this.nestedScroll.snapContainerTopTop();
    }
    onClose = (bypass) => {
        !bypass && this.props.changeTitle && this.props.changeTitle('universalSearch');
        this.nestedScroll && this.nestedScroll.hideContainer();
    }
    renderDragIcon = () => {
        return <View style={[CommonStyle.dragIcons, { marginLeft: -(36 - 8) }]} />
    }
    renderEmptyView = () => {
        return <View style={CommonStyle.dragIconsVisible} />
    }
    renderCloseIcon = () => {
        return <TouchableOpacity
            onPress={this.onClose}
            style={{
                height: 24,
                paddingTop: 8
            }}
        >
            <View style={[{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: CommonStyle.fontBgBtnClose,
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <Icon
                    style={{ lineHeight: 24, fontWeight: 'bold' }}
                    name='md-close'
                    color={CommonStyle.fontColor}
                    size={18}
                />
            </View>
        </TouchableOpacity>
    }
    renderClassTag() {
        const classSymbol = this.symbolObject && this.symbolObject.class;
        const classTag = classSymbol ? (classSymbol + '').toUpperCase().slice(0, 2) : '';
        if (!classTag) return null;
        const getClassBackground = () => {
            return CommonStyle.classBackgroundColor[classTag]
        }
        return (
            <View style={{
                width: 13,
                height: 13,
                marginTop: 1,
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getClassBackground()
            }}>
                <Text style={{
                    color: CommonStyle.newsTextColor,
                    fontFamily: CommonStyle.fontFamily,
                    fontSize: CommonStyle.fontSizeXS - 3,
                    textAlign: 'center'
                }}>{classTag}</Text>
            </View>
        );
    }
    renderSymbolName = () => {
        const displayName = this.symbolObject && this.symbolObject.display_name;
        return (
            <View style={{ display: 'flex', width: '70%', alignItems: 'center', flexDirection: 'row', paddingLeft: 16 }}>
                <Text style={[{
                    fontFamily: 'HelveticaNeue-Bold',
                    fontSize: CommonStyle.fontSizeXXL,
                    color: CommonStyle.fontColor,
                    fontWeight: '700'
                }]}>
                    {displayName || ''}
                </Text>
            </View>
        );
    }

    renderCompanyName = () => {
        const { company_name: compName, company, security_name: secName } =
            this.symbolObject || {};
        const companyName = (
            compName ||
            company ||
            secName ||
            ''
        ).toUpperCase();
        return (
            <View style={[{
                flexDirection: 'row',
                paddingHorizontal: 16
            }]}>
                <View style={{ width: '80%', alignItems: 'flex-start' }}>
                    <Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'left', color: CommonStyle.fontColor }]}>{companyName}</Text>
                </View>
                <View style={[{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row'
                }]}>
                    <Flag
                        type={'flat'}
                        code={'AU'}
                        size={20}
                        style={{ marginRight: 8, marginTop: 1.5 }}
                    />
                    {this.renderClassTag()}
                </View>
            </View>
        );
    }
    renderHistory = () => {
        return null
    }

    getDataHistory() {
        try {
            const data = this.state.data;
            const check = this.checkEmptyObject(data);
            if (!check) return;
            let listOrder = [];
            const orderId = data.broker_order_id
            const orderDetailUrl = api.getUrlOrderDetail(orderId);
            if (!orderId) {
                this.setState({
                    listOrder: []
                })
            }
            api.requestData(orderDetailUrl, true).then(res => {
                if (res) {
                    if (res.length) {
                        logDevice('info', `ORDER HISTORY API: ${JSON.stringify(res)}`)
                        listOrder = res.sort(function (a, b) {
                            return b.order_detail_id - a.order_detail_id;
                        });
                        logDevice('info', `ORDER HISTORY API AFTER SORT: ${JSON.stringify(listOrder)}`);
                        this.setState({
                            listOrder,
                            data
                        })
                    } else {
                        this.setState({
                            listOrder: [],
                            data
                        });
                    }
                }
            }).catch(error => {
                console.log('getDataHistory listContent logAndReport exception: ', error)
                logAndReport('getDataHistory listContent exception', error, 'getDataHistory listContent');
                this.setState({ listOrder: [], data }, () => this.onPressOrder());
            })
        } catch (err) {
            console.log('getDataHistory listContent logAndReport exception: ', error)
            logAndReport('getDataHistory listContent exception', err, 'getDataHistory listContent');
            this.setState({ listOrder: [], data }, () => this.onPressOrder());
        }
    }
    checkEmptyObject = (obj) => {
        if (!obj) return false;
        if (obj.constructor === Object && Object.keys(obj).length === 0) return false;
        return true;
    }
    render() {
        const check = this.checkEmptyObject(this.state.data);
        if (!check) return <View />
        return <React.Fragment>
            <NestedScrollView
                scrollContainerValue={this.scrollContainerValue}
                scrollValue={this.scrollValue}
                ref={sef => (this.nestedScroll = sef)}
                style={{ flex: 1 }}
            >
                <ScrollLoadAbs
                    style={{ backgroundColor: CommonStyle.backgroundColor }}
                    scrollValue={this.scrollValue}>
                    <View
                        isAbsolute
                        scrollValue={this.scrollValue}
                        ref={ref => (this.scrollLoad = ref)}
                        style={{ backgroundColor: CommonStyle.backgroundColor }}
                    >
                        <View
                            style={[
                                CommonStyle.dragHandlerNewOrder,
                                CommonStyle.DragBar
                            ]}
                        >
                            {this.renderEmptyView()}
                            {this.renderDragIcon()}
                            {this.renderCloseIcon()}
                        </View>
                        <SearchSymbolDetail
                            notShow={true}
                            symbol={this.state.data && this.state.data.symbol}
                        />
                        <Animated.View style={{
                            justifyContent: 'center',
                            marginHorizontal: 16,
                            height: this.dic.heightInfo,
                            opacity: this.dic.opacityInfo
                        }}>
                            <LastTradeInfo symbol={this.state.data.symbol} exchange={this.state.data.exchange} />
                        </Animated.View>
                        <Animated.View style={{
                            justifyContent: 'center',
                            marginHorizontal: 16,
                            height: this.dic.heightInfoDetail,
                            opacity: this.dic.opacityInfoDetail
                        }}>
                            <LastTradeDetail symbol={this.state.data.symbol} exchange={this.state.data.exchange} />
                        </Animated.View>
                        <BtnModifyCancel
                            data={this.state.data}
                            navigator={this.props.navigator}
                        />
                    </View>
                    <OrderDetail
                        data={this.state.data}
                    />
                    {this.renderHistory()}
                    <View style={{ height: 128 }} />
                </ScrollLoadAbs>
            </NestedScrollView>
        </React.Fragment>
    }
    componentDidMount() {
        this.props.setRef && this.props.setRef(this);
        this.isMount = true;
    }
    componentWillUnmount() {
        this.isMount = false;
    }
}
export default SlidingPanel;
