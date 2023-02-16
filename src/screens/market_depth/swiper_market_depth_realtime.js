import React, { Component } from 'react';
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
import { getApiUrl, requestData, getFeedUrl } from '../../api';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import * as util from '../../util';
import * as Lv2 from '../../streaming/lv2';
import * as AllMarket from '../../streaming/all_market'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as fbEmit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter'
import Enum from '../../enum';
import * as OrderStreamingBusiness from '../../streaming/order_streaming_business'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import IndicativePrice from '../order/indicative_price'
import SurplusVolume from '../order/surplus_volume'
import TextLoading from '~/component/loading_component/text.1'
import TransitionView from '~/component/animation_component/transition_view'
import { HeaderConnected, RowDataConnected, RowBackgroundConnected } from './swiper_market_depth'
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

class MarketDepth extends Component {
    static propTypes = {
        isLoading: PropTypes.bool
    }
    constructor(props) {
        super(props);

        this.sub = this.sub.bind(this);
        this.subDepthData = this.subDepthData.bind(this)
        this.unsub = this.unsub.bind(this);
        this.reloadData = this.reloadData.bind(this);

        this.idForm = util.getRandomKey();
        this.fbPosition = null;
        this.fbBid = null;
        this.isMount = false;
        this.code = this.props.code || '';
        this.calculatorData = this.calculatorData.bind(this);
        this.listDataBid = [];
        this.listDataAsk = [];
        this.currentIndex = this.props.currentIndex || 0;
        this.state = {
            isMore: false,
            listData: null,
            listDataAskCal: [],
            listDataBidCal: []
        }
        this.typeForm = (this.props.isOrder ? 'newOrder' : 'modifyOrder') + '_depth';
        this.perf = new Perf(performanceEnum.show_swiper_market_depth);
        this.quantity = 10;
        this.channelPriceOrder = OrderStreamingBusiness.getChannelPriceOrder();
    }
    componentWillUnmount() {
        this.isMount = false;
        Emitter.deleteByIdEvent(this.idForm)
    }

    componentWillReceiveProps(nextProps) {
        if (this.isMount && nextProps.code && nextProps.code !== this.code) {
            this.unsub(this.code);
            this.code = nextProps.code
            this.quantity = 10;
            this.sub(this.code);
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

            let listData = [];
            for (let index = 0; index < this.quantity; index++) {
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
                    listData,
                    side: this.side
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

    getExchange(code) {
        return func.getExchangeSymbol(code) || 'ASX';
    }

    subDepthData() {
        const channel = StreamingBusiness.getChannelDepthAOI()
        Emitter.addListener(channel, this.idForm, depthData => {
            this.listDataAsk = depthData.ask || depthData.Ask || [];
            this.listDataBid = depthData.bid || depthData.Bid || [];

            this.calculatorData(false);
        })
    }

    formatIndicativePrice(value, isLoading) {
        if ((value.surplus_volume === null && value.indicative_price === null) || (value.surplus_volume === undefined && value.indicative_price === undefined)) return <View />
        return (
            <View style={{ paddingVertical: 16 }}>
                <Text style={CommonStyle.textAuctionHeader}>
                    {
                        value.indicative_price === undefined
                            ? `${I18n.t('Indicative_Price')} --`
                            : `${I18n.t('Indicative_Price')} ${formatNumberNew2(value.indicative_price, PRICE_DECIMAL.PRICE)}`
                    }
                </Text>
            </View>
        )
    }

    formatSurplusVolume(value, isLoading) {
        if ((value.surplus_volume === null && value.indicative_price === null) || (value.surplus_volume === undefined && value.indicative_price === undefined)) return <View />
        return (
            <View style={{ paddingVertical: 16 }}>
                <Text style={CommonStyle.textAuctionHeader}>
                    {
                        // isLoading
                        //     ? `${I18n.t('Surplus_Volume')} --`
                        //     : value.surplus_volume === undefined
                        //         ? `${I18n.t('Surplus_Volume')} --`
                        //         : `${I18n.t('Surplus_Volume')} ${formatNumberNew2(value.surplus_volume, PRICE_DECIMAL.VOLUME)}`
                        value.surplus_volume === undefined
                            ? `${I18n.t('Surplus_Volume')} --`
                            : `${I18n.t('Surplus_Volume')} ${value.side && value.side.toUpperCase() === 'S' ? '-' : ''}${formatNumberNew2(value.surplus_volume, PRICE_DECIMAL.VOLUME)}`
                    }
                </Text>
            </View>
        )
    }

    renderAuctionHeader = () => {
        const { indicative_price: indicativePrice, surplus_volume: surplusVolume } = this.props.value || {};
        if (indicativePrice !== 0 && surplusVolume !== 0 && !indicativePrice && !surplusVolume) return null;
        return <View style={CommonStyle.styleViewAuction}>
            <IndicativePrice
                value={this.props.value}
                channelLoadingOrder={this.props.channelLoadingOrder}
                channelPriceOrder={this.props.channelPriceOrder}
                isLoading={this.props.isLoading}
                formatFunc={this.formatIndicativePrice}
            />

            <SurplusVolume
                value={this.props.value}
                channelLoadingOrder={this.props.channelLoadingOrder}
                channelPriceOrder={this.props.channelPriceOrder}
                isLoading={this.props.isLoading}
                formatFunc={this.formatSurplusVolume}
            />
        </View>
    }

    sub(code) {
        const exchange = this.getExchange(code);
        const symbol = code;
        const channel = StreamingBusiness.getChannelLv2(exchange, symbol)
        Emitter.addListener(channel, this.idForm, bodyData => {
            this.listDataAsk = bodyData.Ask || bodyData.ask || [];
            this.listDataBid = bodyData.Bid || bodyData.bid || [];
            this.calculatorData(false);
        })
    }

    reloadData(code) {
        const exchange = this.getExchange(code);
        const symbol = code;

        AllMarket.getData(
            Enum.STREAMING_MARKET_TYPE.DEPTH,
            [{
                symbol,
                exchange
            }],
            true)
            .then(bodyData => {
                this.props.doneLoadData && this.props.doneLoadData(Enum.ID_FORM.MARKET_DEPTH);
                if (!util.arrayHasItem(bodyData)) return;
                this.listDataAsk = bodyData[0].Ask;
                this.listDataBid = bodyData[0].Bid;
                this.calculatorData(false);
            });
    }

    unsub(code) {
        const exchange = this.getExchange(code);
        const symbol = code;
        const channel = StreamingBusiness.getChannelLv2(exchange, symbol)
        Emitter.deleteEvent(channel)
    }

    componentDidMount() {
        this.isMount = true;
        this.subDepthData()
        this.sub(this.code)
        Emitter.addListener(this.channelPriceOrder, this.id, priceData => {
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
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { textAlign: 'left' }]} formatTextAbs={'12'}>
                                {data.bid_no}
                            </TextLoading>
                        </RowDataConnected>
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col1, styles.textWrapper, { alignItems: 'flex-end' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { textAlign: 'right' }]} formatTextAbs={'88,88'}>
                                {data.bid_quantity ? formatNumber(data.bid_quantity) : ''}
                            </TextLoading>
                        </RowDataConnected>
                        <RowDataConnected animation={'fadeIn'} index={index} style={[styles.col2, styles.textWrapper, { alignItems: 'flex-end' }]}>
                            <TextLoading numberOfLines={2} isLoading={this.props.isLoadingOrder} style={[CommonStyle.textSubNormalBlack, { paddingRight: 8, textAlign: 'right', color: CommonStyle.color.buy }]} formatTextAbs={'88,88'}>
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

    render() {
        return (
            this.state.listData !== null && this.state.listData.length > 0
                ? <View
                    testID='marketDeepthOrder' style={[{ backgroundColor: CommonStyle.backgroundColor1 }, this.props.style]}>
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
const mapStateToProps = state => ({
    isLoading: state.marketDepth.isLoading
});

const mapDispatchToProps = dispatch => ({
    setTypeForm: (...p) => dispatch(marketActions.setTypeForm(...p)),
    subMarketDepth: (...p) => dispatch(marketActions.subMarketDepth(...p))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MarketDepth);
