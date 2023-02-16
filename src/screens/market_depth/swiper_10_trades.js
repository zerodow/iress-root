import React, { Component, PureComponent } from 'react';
import { View, Text, PixelRatio, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
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
import Enum from '../../enum'
import * as util from '../../util'
import * as Emitter from '@lib/vietnam-emitter'
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Controller from '../../memory/controller';
import TextLoadingCustom from '~/component/loading_component/text.1';
import * as Animatable from 'react-native-animatable';
import { Header } from './swiper_market_depth'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'

const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const DURATION = 500
class HeaderCustom extends Header {
    componentWillReceiveProps(nextProps) {
        const { from, i } = nextProps.tabInfo
        if (!isNaN(from) && !isNaN(i)) {
            if (i === 2) {
                this.runAnimation(dataStorage.animationDirection)
            }
        }
    }
    render() {
        return (
            <Animatable.View
                useNativeDriver
                ref={this.setRef}
                animation={dataStorage.animationDirection}
                duration={600}
                // duration={-1}
                testID='marketDeepthOrderHeader'
                style={{ borderBottomWidth: 1, borderColor: CommonStyle.color.dusk }} >
                <View testID='tenTradeOrderHeader' style={[styles.header2, { paddingVertical: 9 }]}>
                    <Text testID={`newOrderFilledTimeLabel`} style={[styles.textHeaderSecond, styles.col21, { paddingRight: 16 }]}>{I18n.t('filledTimeUpper')}</Text>
                    <Text testID={`newOrderVolumeLabel`} style={[styles.textHeaderSecond, styles.col22, { paddingRight: 16, textAlign: 'right' }]}>{I18n.t('quantityUpper')}</Text>
                    <Text testID={`newOrderFilledLabel`} style={[styles.textHeaderSecond, styles.col23, { textAlign: 'right' }]}>{I18n.t('filledCoS')}</Text>
                </View>
            </Animatable.View>
        )
    }
}
const headerMapStateToProps = (state) => {
    return {
        tabInfo: state.order.tabInfo
    }
}
export const HeaderCustomConnected = connect(headerMapStateToProps)(HeaderCustom)

export class RowData extends PureComponent {
    getDelay = (index) => {
        if (index !== null && index !== undefined && typeof index === 'number' && (index < 15 || this.props.isMore)) {
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
    shouldComponentUpdate(nextProps) {
        const { from, i } = nextProps.tabInfo
        /** Khong render khi dang dung o tab khac C2R */
        if (i !== 2) return false
        return true
    }
    componentWillReceiveProps(nextProps) {
        // Run Animation when change Tab
        const { from, i } = nextProps.tabInfo
        if (from === this.props.tabInfo.from && i === this.props.tabInfo.i) {
            return
        }
        if (!isNaN(from) && !isNaN(i)) {
            if (i === 2) {
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
                    // this.refView && this.refView.fadeIn(DURATION)
                }, this.getDelay(this.props.index));
            }
            if (from === 2) {
                this.timeoutAni && clearTimeout(this.timeoutAni)
                this.refView && this.refView.animate({
                    easing: 'linear',
                    0: {
                        opacity: 0
                    },
                    1: {
                        opacity: 0
                    }
                })
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
                animation={!dataStorage.isInitTabCos ? 'fadeIn' : 'fadeInRight'}
                duration={!dataStorage.isInitTabCos ? 1 : DURATION}
                delay={!dataStorage.isInitTabCos ? 0 : this.getDelay(this.props.index)}
                style={this.props.style || {}}>
                {this.props.children}
            </Animatable.View>
        )
    }
}
export const RowDataConnected = connect(headerMapStateToProps)(RowData)
export default class TenTrade extends Component {
    constructor(props) {
        super(props);
        this.code = this.props.code || '';
        this.fbPosition = null;
        this.getFilledData = this.getFilledData.bind(this);
        this.subCosData = this.subCosData.bind(this)
        this.getExchange = this.getExchange.bind(this)
        this.registerParentReload = this.registerParentReload.bind(this);
        this.currentIndex = this.props.currentIndex || 1
        this.state = {
            isMore: false,
            listData: []
        };
        this.idForm = util.getRandomKey();
        this.typeForm = (this.props.isOrder ? 'newOrder' : 'modifyOrder') + '_Cos';
        func.setFuncReload(this.typeForm, this.getFilledData.bind(this));
        this.perf = new Perf(performanceEnum.show_10_trades);
        this.listDataFull = [];
        this.quantity = 10;
        this.props.getReloadFuncCos && this.props.getReloadFuncCos(this.getFilledData);
        this.registerParentReload();
    }

    getExchange(symbol) {
        return func.getExchangeSymbol(symbol) || 'ASX';
    }

    subCosData() {
        const channel = StreamingBusiness.getChannelCosAOI()
        Emitter.addListener(channel, this.idForm, bodyData => {
            this.props.doneLoadData && this.props.doneLoadData(Enum.ID_FORM.TRADES);
            this.dataCallback(bodyData)
        })
    }

    getFilledData() {
        try {
            this.setState({ listData: [] })
            this.perf = new Perf(performanceEnum.get_filled_data);
            this.perf && this.perf.start();
            const stringQuery = util.encodeSymbol(this.code);
            let exchange = (dataStorage.symbolEquity[this.code] && dataStorage.symbolEquity[this.code].exchanges[0]) || 'ASX';
            const url = getApiUrl(func.getUserPriceSource(), `cos/${exchange}/` + stringQuery);
            requestData(url).then(bodyData => {
                this.props.doneLoadData && this.props.doneLoadData(Enum.ID_FORM.TRADES);
                this.dataCallback(bodyData)
            });
        } catch (error) {
            logDevice('info', `Ten trades get filled data exception: ${error}`)
        }
    }

    componentWillUnmount() {
        Emitter.deleteByIdEvent(this.idForm);
    }

    dataCallback(snap) {
        if (!snap) {
            return this.setState({
                listData: []
            })
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

    // componentWillReceiveProps(nextProps) {
    //     if ((nextProps.code && nextProps.code !== this.code)) {
    //         this.code = nextProps.code;
    //         this.getFilledData();
    //     } else {
    //         if (nextProps.currentIndex === 1 && nextProps.currentIndex !== this.currentIndex) {
    //             this.getFilledData();
    //             // countC2RTimes(this.typeForm);
    //         }
    //     }
    //     this.currentIndex = nextProps.currentIndex;
    // }

    registerParentReload() {
        if (!this.props.parentChannel) return;
        Emitter.addListener(this.props.parentChannel, this.idForm, () => {
            this.getFilledData();
        });
    }

    componentDidMount() {
        this.subCosData()
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
        const endTime = getDateOnly(addDaysToTime(new Date(), 1)).getTime() - 1;
        let format = 'HH:mm:ss'
        if (data.time > endTime) {
            format = 'DD MMM HH:mm:ss'
        }
        const originIndex = index
        let idx = index
        const displayTime = renderTime(data.time, format);
        const tmp = index - (this.quantity - 10)
        if (index > 9 && index >= (this.quantity - 10) && tmp >= 0) {
            idx = tmp
        }
        return (
            <React.Fragment>
                <RowDataConnected
                    // animation={dataStorage.animationDirection}
                    index={idx}
                    key={originIndex}
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
                        (
                            this.props.orderScreen && this.state.isMore
                                ? null
                                : <View style={{ height: 16 }} />
                        )
                    }
                </View >
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
