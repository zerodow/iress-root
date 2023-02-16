import React, { Component, PureComponent, useEffect } from 'react';
import { View, Text, PixelRatio, ScrollView, Platform, TouchableOpacity } from 'react-native';
import styles from './style/market_depth';
import { formatNumber, formatNumberNew2, getPriceSource, countC2RTimes, logDevice } from '../../lib/base/functionUtil';
import { func, dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import firebase from '../../firebase';
import I18n from '../../modules/language';
import * as Animatable from 'react-native-animatable';
import userType from '../../constants/user_type';
import config from '../../config';
import { getApiUrl, requestData, getFeedUrl, getApiAuction } from '../../api';
import { connect2Nchan, mergeData, register as NchanRegister, unregister } from '../../nchan';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import Enum from '../../enum'
import * as util from '../../util'
import * as Emitter from '@lib/vietnam-emitter'
import * as StreamingBusiness from '../../streaming/streaming_business'
import HighLightText from '../../modules/_global/HighLightText';
import * as Business from '../../business';
import SearchDetail from '../universal_search/detail/search_detail.view';
import PropTypes from 'prop-types'
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import TextLoading from '~/component/loading_component/text.1'
import TransitionView from '~/component/animation_component/transition_view'
import { connect } from 'react-redux'
const PRICE_DECIMAL = Enum.PRICE_DECIMAL
const DURATION = 500

export class Header extends PureComponent {
    componentWillReceiveProps(nextProps) {
        const { from, i } = nextProps.tabInfo
        if (!isNaN(from) && !isNaN(i)) {
            if (i === 1) {
                this.runAnimation(dataStorage.animationDirection)
            }
        }
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
    setRef = (ref) => {
        if (ref) {
            this.refView = ref
        }
    }
    render() {
        console.log('DCM tabInfo', this.props.tabInfo)
        return (
            <Animatable.View
                useNativeDriver
                ref={this.setRef}
                animation={dataStorage.animationDirection}
                duration={600}
                // duration={-1}
                testID='marketDeepthOrderHeader'
                style={[styles.header, { borderBottomWidth: 0 }]} >
                <View style={[styles.headerLeft, { paddingVertical: 9, backgroundColor: 'transparent', borderRightWidth: 0 }]}>
                    <Text style={[CommonStyle.textMainHeaderNoOpacity, styles.col3, { textAlign: 'left' }]}>{I18n.t('numberOfTrades')}</Text>
                    <Text style={[CommonStyle.textMainHeaderNoOpacity, styles.col1, { textAlign: 'right' }]}>{I18n.t('volUpper')}</Text>
                    <Text style={[CommonStyle.textMainHeaderNoOpacity, styles.col2, { paddingRight: 12, textAlign: 'right' }]}>{I18n.t('bidUpper')}</Text>
                </View>
                <View style={[styles.headerRight, { paddingVertical: 9, backgroundColor: 'transparent', borderLeftWidth: 0 }]}>
                    <Text style={[CommonStyle.textMainHeaderNoOpacity, styles.col2, { paddingLeft: 12 }]}>{I18n.t('offerUpper')}</Text>
                    <Text style={[CommonStyle.textMainHeaderNoOpacity, styles.col1]}>{I18n.t('volUpper')}</Text>
                    <Text style={[CommonStyle.textMainHeaderNoOpacity, styles.col3, { textAlign: 'right' }]}>{I18n.t('numberOfTrades')}</Text>
                </View>
            </Animatable.View>
        );
    }
}
const headerMapStateToProps = (state) => {
    return {
        tabInfo: state.order.tabInfo
    }
}
export const HeaderConnected = connect(headerMapStateToProps)(Header)
class RowData extends PureComponent {
    getDelay = (index) => {
        if (index !== null && index !== undefined && typeof index === 'number' && index < 10) {
            return (index) * (DURATION / 4)
        }
        return 0
    }
    shouldComponentUpdate(nextProps) {
        const { from, i } = nextProps.tabInfo
        /** Khong render khi dang dung o tab khac C2R */
        if (i !== 1) return false
        return true
    }
    componentWillReceiveProps(nextProps) {
        // Run Animation when change Tab
        const { from, i } = nextProps.tabInfo
        if (from === this.props.tabInfo.from && i === this.props.tabInfo.i) {
            return
        }
        if (!isNaN(from) && !isNaN(i)) {
            if (i === 1) {
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
                    this.refView && this.refView.fadeIn(DURATION)
                }, this.getDelay(this.props.index));
            }
            if (from === 1) {
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
                animation={'fadeIn'}

                duration={DURATION}
                delay={this.getDelay(this.props.index)}
                style={this.props.style || {}}>
                {this.props.children}
            </Animatable.View>
        )
    }
}

export const RowDataConnected = connect(headerMapStateToProps)(RowData)
class RowBackground extends PureComponent {
    getDelay = (index) => {
        if (index !== null && index !== undefined && typeof index === 'number' && index < 10) {
            const delay = index * (DURATION / 5)
            return delay
        }
        return 0
    }
    componentDidMount() {
        this.tabSelected = this.props.tabInfo.i
    }
    shouldComponentUpdate(nextProps) {
        const { from, i } = nextProps.tabInfo
        if (i !== 1) return false
        return true
    }
    componentWillReceiveProps(nextProps) {
        const { from, i } = nextProps.tabInfo
        this.tabSelected = i
        if ((from === this.props.tabInfo.from && i === this.props.tabInfo.i)) {
            if (i !== 1) return
            if (nextProps.isLoadingOrder !== this.props.isLoadingOrder) {
                if (nextProps.isLoadingOrder) {
                    if (this.timoutAni) {
                        clearTimeout(this.timoutAni)
                    }
                    this.refView && this.refView.stopAnimation()
                    this.refView && this.refView.fadeOut(1)
                } else {
                    this.runAnimation()
                }
            }
            return
        }
        if (!isNaN(from) && !isNaN(i)) {
            if (i === 1) {
                this.runAnimation()
            }
            if (from === 1) {
                if (this.timoutAni) {
                    clearTimeout(this.timoutAni)
                }
                this.refView && this.refView.fadeOut(1)
            }
        }
    }
    runAnimation = () => {
        switch (this.props.animation) {
            case 'fadeInRight':
                this.timoutAni = setTimeout(() => {
                    console.log('DCM start', new Date().getTime(), this.props.index)
                    this.refView && this.refView.fadeInRight(DURATION)
                }, this.getDelay(this.props.index));
                break;
            case 'fadeInLeft':
                console.log('DCM start', new Date().getTime(), this.props.index)
                this.timoutAni = setTimeout(() => {
                    this.refView && this.refView.fadeInLeft(DURATION)
                }, this.getDelay(this.props.index));
                break;
            default:
                break;
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
                animation={this.props.animation}
                duration={DURATION}
                delay={this.getDelay(this.props.index)}
                style={this.props.style || {}}>
                {this.props.children}
            </Animatable.View>
        )
    }
}
export const RowBackgroundConnected = connect(headerMapStateToProps)(RowBackground)
export default class MarketDepth extends PureComponent {
    constructor(props) {
        super(props);
        this.fbPosition = null;
        this.fbBid = null;
        this.isMount = false;
        this.code = this.props.code || '';
        this.idForm = util.getRandomKey();
        this.calculatorData = this.calculatorData.bind(this);
        this.subDepthData = this.subDepthData.bind(this)
        this.getExchange = this.getExchange.bind(this)
        this.getDataRef = this.getDataRef.bind(this);
        this.listDataBid = [];
        this.listDataAsk = [];
        this.currentIndex = this.props.currentIndex || 0;
        this.state = {
            isMore: false,
            listData: [],
            listDataAskCal: [],
            listDataBidCal: [],
            indicativePrice: null,
            surplusVolume: null,
            side: '',
            isLoading: true
        }
        this.registered = false;
        this.objRegister = null;
        this.typeForm = (this.props.isOrder ? 'newOrder' : 'modifyOrder') + '_depth';
        func.setFuncReload(this.typeForm, this.getDataRef.bind(this));
        this.perf = new Perf(performanceEnum.show_swiper_market_depth);
        this.quantity = 10;
        this.props.getReloadFuncLv2 && this.props.getReloadFuncLv2(this.getDataRef);
        this.channelPriceOrder = OrderStreamingBusiness.getChannelPriceOrder();
    }

    componentWillUnmount() {
        this.isMount = false;
        // this.unregisterPrice();
        Emitter.deleteByIdEvent(this.idForm);
        this.idSubLoading && Emitter.deleteByIdEvent(this.idSubLoading);
    }

    unregisterPrice() {
        this.registered = false;
        unregister(this.objRegister)
    }
    // componentWillReceiveProps(nextProps) {
    //     if (this.isMount && (nextProps.code !== this.code)) {
    //         this.code = nextProps.code || '';
    //         this.quantity = 10;
    //         // this.unregisterPrice();
    //         // this.getDataRef();
    //     } else {
    //         if (nextProps.currentIndex === 0 && nextProps.currentIndex !== this.currentIndex) {
    //             // this.getDataRef();
    //             // countC2RTimes(this.typeForm);
    //         }
    //     }
    //     this.currentIndex = nextProps.currentIndex;
    // }
    getDataRef() {
        try {
            this.setState({ listData: null })
            this.perf = new Perf(performanceEnum.get_data_ref);
            this.perf && this.perf.start();
            const stringQuery = util.encodeSymbol(this.code);
            let exchange = (dataStorage.symbolEquity[this.code] && dataStorage.symbolEquity[this.code].exchanges[0]) || 'ASX';
            const url = getApiUrl(func.getUserPriceSource(), `level2/${exchange}/` + stringQuery);

            if (func.getUserPriceSource() === userType.ClickToRefresh) {
                requestData(url).then(bodyData => {
                    this.props.doneLoadData && this.props.doneLoadData(Enum.ID_FORM.MARKET_DEPTH);
                    const dicDataPrice = {};
                    const urlFeed = getFeedUrl(func.getUserPriceSource(), 'level2')
                    dicDataPrice[stringQuery] = bodyData;
                    this.perf && this.perf.stop();
                    mergeData(this.typeForm, urlFeed, dicDataPrice, stringQuery);
                });
            }
            if (!this.registered) {
                this.registered = true;
                const urlFeed = getFeedUrl(func.getUserPriceSource(), 'level2');
                this.objRegister = {
                    type: this.typeForm,
                    pattern: `${urlFeed}`,
                    registerToken: null,
                    code: this.code,
                    callback: listData => {
                        if (!listData || !listData.length) {
                            return
                        }
                        let listAsk = listData[0] && listData[0].Ask ? listData[0].Ask : [];
                        let listBid = listData[0] && listData[0].Bid ? listData[0].Bid : [];
                        listAsk = Object.keys(listAsk).map((k) => listAsk[k]);
                        listBid = Object.keys(listBid).map((k) => listBid[k]);
                        this.listDataAsk = listAsk;
                        this.listDataBid = listBid;
                        this.calculatorData(false);
                    }
                };
                this.objRegister.registerToken = NchanRegister(this.objRegister);
            }
        } catch (error) {
            logDevice('info', `Swiper market depth get data ref exception: ${error}`);
        }
    }

    calculatorData(isMore) {
        try {
            if (this.listDataAsk.length === 0 && this.listDataBid.length === 0) {
                return this.setState({
                    listData: []
                })
            }

            let listDataBidSort = [];
            let listDataAskSort = [];
            for (let i = 0; i < this.listDataBid.length; i++) {
                if (i < this.quantity) {
                    listDataBidSort.push(this.listDataBid[i])
                }
            }

            for (let i = 0; i < this.listDataAsk.length; i++) {
                if (i < this.quantity) {
                    listDataAskSort.push(this.listDataAsk[i])
                }
            }

            const maxBid = listDataBidSort.length > 0 ? Math.max(...listDataBidSort.map(o => o.quantity)) : 0;
            const maxAsk = listDataAskSort.length > 0 ? Math.max(...listDataAskSort.map(o => o.quantity)) : 0;
            const max = Math.max(maxBid, maxAsk);
            const listData = [];
            // Check neu length data < quantity
            // if(li)
            for (let index = 0; index < this.listDataBid.length; index++) {
                const elementAsk = listDataAskSort[index];
                const elementBid = listDataBidSort[index];
                const objTemp = {};
                if (elementAsk) {
                    objTemp['ask'] = elementAsk.price;
                    objTemp['ask_quantity'] = elementAsk.quantity;
                    objTemp['ask_percent'] = elementAsk.quantity / max;
                    objTemp['ask_no'] = elementAsk.number_of_trades;
                }
                if (elementBid) {
                    objTemp['bid'] = elementBid.price;
                    objTemp['bid_quantity'] = elementBid.quantity;
                    objTemp['bid_percent'] = elementBid.quantity / max;
                    objTemp['bid_no'] = elementBid.number_of_trades;
                }
                listData.push(objTemp);
            }
            if (this.isMount) {
                this.setState({
                    listData
                }, () => {
                    if (this.state.listData !== null && this.state.listData.length <= 0) {
                        this.props.calculatorHeightNoData && this.props.calculatorHeightNoData(200)
                    }
                });
            }
        } catch (error) {
            logDevice('info', `MarketDepth calculator exceptiom: ${error}`)
        }
    }

    getExchange(symbol) {
        return func.getExchangeSymbol(symbol) || 'ASX';
    }

    subDepthData() {
        const channel = StreamingBusiness.getChannelDepthAOI()
        Emitter.addListener(channel, this.idForm, depthData => {
            this.listDataAsk = depthData.ask || depthData.Ask || [];
            this.listDataBid = depthData.bid || depthData.Bid || [];
            this.indicativePrice = depthData.indicativePrice;
            this.surplusVolume = depthData.surplusVolume;
            this.side = depthData.side || ''
            this.calculatorData(false);
        })
    }

    componentDidMount() {
        this.isMount = true;
        this.subDepthData()
        this.idSubLoading = Emitter.addListener(this.channelPriceOrder, this.id, priceData => {
            this.setState({
                isLoading: false,
                indicativePrice: priceData.indicative_price,
                surplusVolume: priceData.surplus_volume,
                side: priceData.side || ''
            })
        })
    }
    renderHeader() {
        return (
            <HeaderConnected />
        );
    }

    renderContent(data, index) {
        return (
            <View
                animation={'fadeIn'}
                index={index}
                key={index}
                style={{
                    width: '100%', backgroundColor: CommonStyle.backgroundColor1
                }}>
                <View style={[styles.header, { borderBottomColor: CommonStyle.backgroundColor1 }]}>
                    <View style={[CommonStyle.headerLeft, { backgroundColor: CommonStyle.background1, alignItems: 'center', overflow: 'hidden' }]}>
                        <RowBackgroundConnected isLoadingOrder={this.props.isLoadingOrder} animation={'fadeInRight'} index={index}
                            style={[CommonStyle.fontMarketDepthGreen,
                            {
                                position: 'absolute',
                                width: data.bid_percent ? `${data.bid_percent * 100}%` : 0,
                                top: 0,
                                bottom: 0,
                                marginTop: 1,
                                borderRightWidth: data.bid_percent ? 1 : 0,
                                borderColor: CommonStyle.backgroundColor1,
                                borderBottomLeftRadius: 8,
                                borderTopLeftRadius: 8
                            }]} />
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col3, styles.textWrapper, { alignItems: 'flex-start' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { textAlign: 'left', paddingVertical: 8 }]} formatTextAbs={'12'}>
                                {data.bid_no}
                            </TextLoading>
                        </RowDataConnected>
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col1, styles.textWrapper, { alignItems: 'flex-end' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { textAlign: 'right', paddingVertical: 8 }]} formatTextAbs={'88,88'}>
                                {data.bid_quantity ? formatNumber(data.bid_quantity) : ''}
                            </TextLoading>
                        </RowDataConnected>
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col2, styles.textWrapper, { alignItems: 'flex-end' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { paddingRight: 8, textAlign: 'right', color: CommonStyle.color.buy, paddingVertical: 8 }]} formatTextAbs={'88,88'}>
                                {data.bid ? formatNumberNew2(data.bid, PRICE_DECIMAL.PRICE) : ''}
                            </TextLoading>
                        </RowDataConnected>

                        {/* <TextLoad isLoading={this.props.isLoadingOrder} containerStyle={[styles.col3, styles.textWrapper]} style={[CommonStyle.textSubNormalBlack, { textAlign: 'left' }]}>{data.bid_no}</TextLoad>
                        <TextLoad isLoading={this.props.isLoadingOrder} containerStyle={[styles.col1, styles.textWrapper]} style={[CommonStyle.textSubNormalBlack, { textAlign: 'right' }]}>{data.bid_quantity ? formatNumber(data.bid_quantity) : ''}</TextLoad>
                        <TextLoad isLoading={this.props.isLoadingOrder} containerStyle={[styles.col2, styles.textWrapper]} style={[CommonStyle.textSubNormalBlack, { paddingRight: 8, textAlign: 'right', color: CommonStyle.color.buy }]}>{data.bid ? formatNumberNew2(data.bid, PRICE_DECIMAL.VALUE) : ''}</TextLoad> */}
                    </View>
                    <View style={[CommonStyle.headerRight, { backgroundColor: CommonStyle.backgroundColor1, alignItems: 'center', overflow: 'hidden' }]}>
                        <RowBackgroundConnected isLoadingOrder={this.props.isLoadingOrder} index={index} animation={'fadeInLeft'} index={index} style={[
                            CommonStyle.fontMarketDepthRed,
                            {
                                position: 'absolute',
                                width: data.ask_percent ? `${data.ask_percent * 100}%` : 0,
                                top: 0,
                                bottom: 0,
                                marginTop: 1,
                                borderBottomRightRadius: 8,
                                borderTopRightRadius: 8
                            }]} />
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col2, styles.textWrapper, { alignItems: 'flex-start' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { paddingLeft: 8, textAlign: 'right', color: CommonStyle.color.sell, paddingVertical: 8 }]} formatTextAbs={'88,88'}>
                                {data.ask ? formatNumberNew2(data.ask, PRICE_DECIMAL.PRICE) : ''}
                            </TextLoading>
                        </RowDataConnected>

                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col1, styles.textWrapper, { alignItems: 'flex-start' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { textAlign: 'right', paddingVertical: 8 }]} formatTextAbs={'88,88'}>
                                {data.ask_quantity ? formatNumber(data.ask_quantity) : ''}
                            </TextLoading>
                        </RowDataConnected>
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col3, styles.textWrapper, { alignItems: 'flex-end' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { textAlign: 'right', paddingVertical: 8 }]} formatTextAbs={'12'}>
                                {data.ask_no}
                            </TextLoading>
                        </RowDataConnected>
                    </View>
                </View>
            </View >
        );
    }

    loadMore() {
        this.calculatorData(true);
    }
    checkIndication = () => {
        if (this.props.isLoading === true) return '--'
        return this.state.indicativePrice === null || this.state.indicativePrice === undefined ? '--' : formatNumberNew2(this.state.indicativePrice, PRICE_DECIMAL.PRICE)
    }
    checkSurplus = () => {
        if (this.props.isLoading === true) return '--'
        return this.state.surplusVolume === null || this.state.surplusVolume === undefined
            ? '--'
            : ` ${this.state.side && this.state.side.toUpperCase() === 'S' ? '-' : ''}${this.state.surplusVolume}`
    }
    renderAuctionHeader = () => {
        if ((this.state.indicativePrice === null || this.state.indicativePrice === undefined) && (this.state.surplusVolume === null || this.state.surplusVolume === undefined)) return <View />
        return <View style={CommonStyle.styleViewAuction}>
            <Text style={CommonStyle.textAuctionHeader}>{I18n.t('Indicative_Price')}{this.checkIndication()}</Text>
            <Text style={CommonStyle.textAuctionHeader}>{I18n.t('Surplus_Volume')}{this.checkSurplus()}</Text>
        </View>
    }
    // renderAuctionFooter = () => {
    //     return <View style={CommonStyle.styleViewAuction}>
    //         <View style={{ alignItems: 'center' }}>
    //             <Text style={CommonStyle.textAuctionBottom}>321 {I18n.t('Buyer')}</Text>
    //             <Text style={CommonStyle.textAuctionBottom}>123,145 {I18n.t('Units')}</Text>
    //         </View>
    //         <View style={{ alignItems: 'center' }}>
    //             <Text style={CommonStyle.textAuctionBottom}>321 {I18n.t('Selller')}</Text>
    //             <Text style={CommonStyle.textAuctionBottom}>123,145 {I18n.t('Units')}</Text>
    //         </View>
    //     </View>
    // }
    render() {
        return (
            this.state.listData !== null && this.state.listData.length > 0
                ? <View
                    testID='marketDeepthOrder' style={[{ backgroundColor: CommonStyle.backgroundColor1, overflow: 'hidden' }, this.props.style]}>
                    {this.renderAuctionHeader()}
                    {this.renderHeader()}
                    {
                        this.state.listData.map((e, i) => {
                            return (
                                this.renderContent(e, i)
                            );
                        })
                    }
                    {
                        !this.props.orderScreen && this.state.isMore ? <TouchableOpacity onPress={this.loadMore.bind(this)}
                            style={[styles.rowExpandNews, { width: '100%' }]}>
                            <Text style={{ fontSize: CommonStyle.fontSizeS, color: CommonStyle.fontBlue }}>{I18n.t('more')}</Text>
                        </TouchableOpacity>
                            : <View />
                    }
                </View>
                : <View>
                    {this.renderAuctionHeader()}
                    {this.renderHeader()}
                    <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
                        {
                            <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noMarketDepth')}</Text>
                        }
                    </View>
                </View>
        );
    }
}
