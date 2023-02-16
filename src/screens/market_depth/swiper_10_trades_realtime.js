import React, { Component } from 'react';
import { View, Text, PixelRatio, ScrollView, Platform, TouchableOpacity } from 'react-native';
import TransitionView from '~/component/animation_component/transition_view'
import styles from './style/market_depth';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { formatNumber, getPriceSource, countC2RTimes, formatNumberNew2, logDevice, convertTimeGMT, renderTime } from '../../lib/base/functionUtil';
import { getDateStringWithFormat, convertToDate, getDateOnly, getMonthBetween, addDaysToTime } from '../../lib/base/dateTime';
import moment from 'moment';
import firebase from '../../firebase';
import I18n from '../../modules/language/';
import { func, dataStorage } from '../../storage';
import config from '../../config';
import ServerEvent from '../../server_event';
import { getApiUrl, requestData, getFeedUrl } from '../../api';
import { connect2Nchan, mergeData } from '../../nchan';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as util from '../../util'
import * as Cos from '../../streaming/cos';
import * as AllMarket from '../../streaming/all_market'
import * as FbEmit from '../../emitter';
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as Emitter from '@lib/vietnam-emitter'
import Enum from '../../enum';
import * as Controller from '../../memory/controller';
import { HeaderCustomConnected, RowDataConnected } from './swiper_10_trades'
import Icon from 'react-native-vector-icons/Ionicons'
import TextLoadingCustom from '~/component/loading_component/text.1';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class TenTrade extends Component {
    constructor(props) {
        super(props);

        this.getFilledData = this.getFilledData.bind(this);
        this.dataCallback = this.dataCallback.bind(this);
        this.sub = this.sub.bind(this);
        this.subCosData = this.subCosData.bind(this)
        this.unSub = this.unSub.bind(this);

        this.code = this.props.code || '';
        this.idForm = util.getRandomKey();
        this.fbPosition = null;
        this.currentIndex = this.props.currentIndex || 1
        this.state = {
            isMore: false,
            listData: []
        };
        this.typeForm = (this.props.isOrder ? 'newOrder' : 'modifyOrder') + '_Cos';
        func.setFuncReload(this.typeForm, this.getFilledData);
        this.perf = new Perf(performanceEnum.show_10_trades);
        this.listDataFull = [];
        this.quantity = 10;

        this.sub(this.code);
    }

    getFilledData() {
        try {
            this.setState({ listData: [] })
            this.perf = new Perf(performanceEnum.get_filled_data);
            this.perf && this.perf.start();
            AllMarket.getData(
                Enum.STREAMING_MARKET_TYPE.TRADES,
                [{
                    exchange: this.getExchange(this.code),
                    symbol: this.code
                }], true).then(snap => {
                    this.props.doneLoadData && this.props.doneLoadData(Enum.ID_FORM.TRADES);
                    this.dataCallback(snap);
                });
        } catch (error) {
            logDevice('info', `Ten trades get filled data exception: ${error}`)
        }
    }

    dataCallback(snap) {
        if (!snap) {
            return
        }
        let listData = snap[0] ? snap[0].data : [];
        let listDataNew = [];
        let isMore = false;
        if (listData.length > 0) {
            listData = listData.sort(function (a, b) {
                return b.id - a.id;
            })
            let isMore = false;
            this.listDataFull = listData;
            listDataNew = this.listDataFull.slice(0, this.quantity);
            if (listData.length > this.quantity) {
                isMore = true;
            }
            this.setState({
                listData: listDataNew, isMore
            });
        } else {
            this.setState({
                listData: [], isMore
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps.code && nextProps.code !== this.code)) {
            this.unSub(this.code);
            this.code = nextProps.code;
            this.sub(this.code);
        }
    }

    getExchange(symbol) {
        return func.getExchangeSymbol(symbol) || 'ASX';
    }

    subCosData() {
        const channel = StreamingBusiness.getChannelCosAOI()
        Emitter.addListener(channel, this.idForm, newData => {
            this.dataCallback(newData)
        })
    }

    sub(symbol) {
        if (!symbol) return;
        const exchange = this.getExchange(symbol);
        const channel = StreamingBusiness.getChannelCos(exchange, symbol)
        Emitter.addListener(channel, this.idForm, newData => {
            this.dataCallback(newData);
        })
    }

    unSub(symbol) {
        if (!symbol) return;
        const exchange = this.getExchange(symbol);
        const channel = StreamingBusiness.getChannelCos(exchange, symbol)
        Emitter.deleteEvent(channel)
    }

    componentDidMount() {
        this.sub();
        this.subCosData()
        if (dataStorage.isInitTabCos) {
            setTimeout(() => {
                dataStorage.isInitTabCos = false
            }, 500);
        }
    }

    componentWillUnmount() {
        Emitter.deleteByIdEvent(this.idForm)
    }

    renderHeader() {
        return (
            <HeaderCustomConnected />
        );
    }

    loadMore() {
        this.quantity += 10;
        let listDataNew = [];
        let isMore = false;
        if (this.quantity >= this.listDataFull.length) {
            this.quantity = this.listDataFull.length;
            isMore = false;
        } else {
            isMore = true;
        }
        listDataNew = this.listDataFull.slice(0, this.quantity);
        this.setState({ isMore, listData: listDataNew });
    }

    renderContent(data, index) {
        let displayTime = renderTime(data.time, 'HH:mm:ss');
        const endTime = getDateOnly(addDaysToTime(new Date(), 1)).getTime() - 1;
        if (data.time > endTime) {
            displayTime = renderTime(data.time, 'DD MMM HH:mm:ss');
        }
        const originIndex = index
        let idx = index
        const tmp = index - (this.quantity - 10)
        if (index > 9 && index >= (this.quantity - 10) && tmp >= 0) {
            idx = tmp
        }
        return (
            <React.Fragment>
                <RowDataConnected
                    index={idx} key={originIndex}
                    style={[styles.rowContainer, { backgroundColor: CommonStyle.backgroundColor1, borderColor: CommonStyle.color.dusk, borderBottomWidth: 1 }]}>
                    <View style={[styles.col21, { alignItems: 'flex-start' }]}>
                        <TextLoadingCustom isLoading={this.props.isLoading} style={[CommonStyle.textMainLight, { paddingRight: 16 }]} formatTextAbs={'00:00:00'}>
                            {displayTime}
                        </TextLoadingCustom>
                    </View>
                    <View style={[styles.col22, { alignItems: 'flex-end' }]}>
                        <TextLoadingCustom isLoading={this.props.isLoading} style={[CommonStyle.textMainNormal, { paddingRight: 16, textAlign: 'right' }]} formatTextAbs={'0000'}>
                            {formatNumber(data.quantity)}
                        </TextLoadingCustom>
                    </View>
                    <View style={[styles.col23, { alignItems: 'flex-end' }]}>
                        <TextLoadingCustom isLoading={this.props.isLoading} style={[CommonStyle.textMain, { textAlign: 'right' }]} formatTextAbs={'00.0000'}>
                            {formatNumberNew2(data.price, PRICE_DECIMAL.PRICE)}
                        </TextLoadingCustom>
                    </View>
                </RowDataConnected>
                {
                    this.props.orderScreen && this.state.isMore && index === this.state.listData.length - 1 ? <RowDataConnected
                        isMore={true}
                        index={idx + 1}
                        key={originIndex + 1 + 'more'}
                        style={[styles.rowContainer, { backgroundColor: CommonStyle.backgroundColor1 }]}>
                        <TouchableOpacity onPress={this.loadMore.bind(this)}
                            style={[styles.rowExpandNews, { width: '100%', backgroundColor: CommonStyle.backgroundColor1, marginHorizontal: 0 }]}>
                            <Text style={{ fontSize: CommonStyle.fontSizeXS, fontFamily: CommonStyle.fontPoppinsBold, opacity: 0.54, color: CommonStyle.fontColor }}>{I18n.t('more_upper')}</Text>
                            <View style={{ width: 4 }} />
                            <Text style={{ fontSize: CommonStyle.fontSizeXS, fontFamily: CommonStyle.fontPoppinsBold, color: CommonStyle.fontColor }}>{(this.code + '').split('.')[0]}</Text>
                            <View style={{ width: 4 }} />
                            <Icon
                                name={'ios-arrow-forward'}
                                size={CommonStyle.fontSizeXS}
                                color={CommonStyle.fontColor} />
                        </TouchableOpacity>
                    </RowDataConnected> : null
                }
            </React.Fragment>
        );
    }
    renderLoading = () => {
        return (
            <React.Fragment>
                {
                    [1, 2, 3, 4, 5, 6].map((el, index) => (
                        <TransitionView
                            index={index}
                            animation={'fadeIn'}
                            style={[styles.rowContainer, { backgroundColor: CommonStyle.backgroundColor1, borderColor: CommonStyle.color.dusk, borderBottomWidth: 1 }]}
                        >
                            <View style={[styles.col21, { alignItems: 'flex-start' }]}>
                                <TextLoadingCustom isLoading={true} formatTextAbs={'00:00:00'}>

                                </TextLoadingCustom>
                            </View>
                            <View style={[styles.col22, { alignItems: 'flex-end', paddingRight: 16 }]}>
                                <TextLoadingCustom isLoading={true} formatTextAbs={'0000'}>

                                </TextLoadingCustom>
                            </View>
                            <View style={[styles.col23, { alignItems: 'flex-end' }]}>
                                <TextLoadingCustom isLoading={true} formatTextAbs={'00.0000'}>

                                </TextLoadingCustom>
                            </View>
                        </TransitionView>
                    ))
                }
            </React.Fragment>
        )
    }
    render() {
        console.log('DCM loading', this.props.isLoading, this.state.listData.length)
        return (
            this.state.listData.length > 0
                ? <View
                    testID={`tenTradeOrder`} style={[{ backgroundColor: CommonStyle.backgroundColor1, overflow: 'hidden' }, this.props.style]}>
                    <View style={{ paddingHorizontal: 16 }}>
                        {this.renderHeader()}
                        {
                            this.state.listData.map((e, i) => {
                                return (
                                    this.renderContent(e, i)
                                );
                            })
                        }
                    </View>
                    {
                        this.state.isLoading
                            ? <ProgressBar />
                            : (this.props.orderScreen && this.state.isMore
                                ? null
                                : <View style={{ height: 16 }} />)
                    }
                </View>
                : <View style={{ paddingHorizontal: 16 }}>
                    {this.renderHeader()}
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        {
                            this.props.isLoading ? (<View>{this.renderLoading()}</View>) : (<Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noCosData')}</Text>)
                        }
                    </View>
                </View>
        );
    }
}
