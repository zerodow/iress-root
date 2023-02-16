import React, { Component } from 'react';
import { Text, View, ScrollView, Modal, ActivityIndicator, Animated, Dimensions, PixelRatio, ListView, FlatList } from 'react-native';
import styles from '../trade/style/trade';
import { func, dataStorage } from '../../storage';
import { iconsMap } from '../../utils/AppIcons';
import ProgressBar from '../../modules/_global/ProgressBar';
import TimeUpdated from '../../component/time_updated/time_updated';
import NetworkWarning from '../../component/network_warning/network_warning';
import timer from 'react-native-timer';
import Price from '../price/price';
import firebase from '../../firebase';
import userType from '../../constants/user_type';
import { logAndReport, countC2RTimes, getSymbolInfoApi, getDisplayName, getPriceMultiExchange, logDevice, checkNewsToday } from '../../lib/base/functionUtil';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import * as tradeActions from './../trade/trade.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCurrentScreen } from '../../lib/base/analytics';
import { initData } from '../../server_event';
import { getApiUrl, requestData, getFeedUrl, getSymbolUrl } from '../../api';
import { connect2Nchan, mergeData } from '../../nchan';
import StateApp from '../../lib/base/helper/appState';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import { newEmitter, addListener, emit, deleteEmitter } from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import Warning from '../../component/warning/warning';
import * as Util from '../../util'
import * as Business from '../../business'
import * as Lv1 from '../../streaming/lv1';
import ScreenId from '../../constants/screen_id';
import * as Controller from '../../memory/controller';

const { height, width } = Dimensions.get('window');

export class MarketCaps extends Component {
    constructor(props) {
        super(props);
                this.label = ['Code', 'Last', 'No. of Share', 'Market Caps']
        this.idForm = Util.getRandomKey();
        // this.listSymbol = [];
        this.list = [];
        this.isOpen = true;
        this.setAnimationTab = this.props.setAnimationTab;
        this.setAnimationUpdated = null;
        this.register = {};
        this.registerDataChart = {};
        this.setTimeUpdate = null;
        this.startPosition = null;
        this.endPosition = null;
        this.isMount = false;
        this.isLoaded = false;
        this.setAnimation = this.setAnimation.bind(this);
        this.changeIndex = this.changeIndex.bind(this);
        this.registerChange = this.registerChange.bind(this);
        this._renderRow = this._renderRow.bind(this)
        this.getLv1 = this.getLv1.bind(this)
        this.lastCode = '';
        this.symbols = {};
        this.stateApp = null;
        this.channelUpdateTrade = `top##${this.idForm}`;
        this.startIndex = null;
        this.endIndex = null;
        newEmitter(this.props.type);
        this.state = {
            isLoading: false,
            listData: [],
            timeUpdate: new Date().getTime(),
            heighWarning: new Animated.Value(25),
            offset: 40,
            dataSource: []
        }
        func.setFuncReload(this.props.type, this._retrieveTradeList.bind(this));
        this.showHeader = this.showHeader.bind(this);
        this.hideHeader = this.hideHeader.bind(this);
        this.typeForm = this.props.type;
        this.perf = new Perf(performanceEnum.show_form_top_value);
        this.registerGetDataChart = this.registerGetDataChart.bind(this)
        this.registerSetTimeUpdate = this.registerSetTimeUpdate.bind(this)
        this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
    }

    registerSetTimeUpdate(setTimeUpdate) {
        if (setTimeUpdate) {
            this.setTimeUpdate = setTimeUpdate
        }
    }

    registerGetDataChart(symbol, cb) {
        this.registerDataChart[symbol] = cb
    }

    registerChange(symbol, cb) {
        this.register[symbol] = cb;
    }

    changeIndex(symbol, isOpen) {
        try {
            const cb = this.register[symbol];
            if (cb) {
                const preCode = this.lastCode;
                if (isOpen) {
                    this.lastCode = symbol;
                } else {
                    this.lastCode = '';
                }
                cb(isOpen);
                if (preCode !== symbol) {
                    const preCb = this.register[preCode];
                    if (preCb) preCb(false)
                }
            }
        } catch (error) {
            console.log('changeIndex market logAndReport exception: ', error)
            logAndReport('changeIndex market exception', error, 'changeIndex market');
        }
    }

    componentDidMount() {
        this.props.onRef && this.props.onRef(this)
        try {
            setCurrentScreen(`top_${this.props.topType}`);
            this.isMount = true;
            const userId = func.getUserId();
            this.dataUserWatchListChange = this.dataUserWatchListChange.bind(this);
        } catch (error) {
            console.log('componentDidMount market logAndReport exception: ', error)
            logAndReport('componentDidMount market exception', error, 'componentDidMount market')
        }
    }
    showHeader() {
        this.isOpen = true;
        this.props.setAnimation && this.props.setAnimation(this.isOpen);
        !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(true, this.props.type)
        this.marketTimeUpdateRef && this.marketTimeUpdateRef.showHide(true);
        this.setAnimationUpdated && this.setAnimationUpdated();
    }
    hideHeader() {
        this.isOpen = false;
        this.props.setAnimation && this.props.setAnimation(this.isOpen);
        !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(false, this.props.type)
        this.marketTimeUpdateRef && this.marketTimeUpdateRef.showHide(false);
        this.setAnimationUpdated && this.setAnimationUpdated();
    }

    getLv1(listSymbols, symbolSubQuery) {
        const isPriceStreaming = Controller.isPriceStreaming();
        // Get symbol and add to dataStorage.symbolEquity
        const numberSymbolUserWatchList = listSymbols.length;
        let expireSymbol = [];
        let isContain = false;
        // Sub symbol
        const listSymbolObject = Util.getListSymbolObject(symbolSubQuery);
        if (isPriceStreaming) {
            // Unsub before sub
            Business.unSubByScreen('watchlist')
            const ID_FORM = Util.getRandomKey();
            const type = dataStorage.tabWatchList
            // Set dic IDFORM nad listSymbolObject by name
            func.setDicIDForm('watchlist', ID_FORM)
            func.setDicListSymbolObject('watchlist', listSymbolObject)
            Business.subNewSymbol(listSymbolObject, ID_FORM)
                .then(() => {
                    Lv1.getLv1(listSymbolObject, Controller.isPriceStreaming())
                        .then(bodyData => {
                            let newData = [];
                            if (bodyData.length !== numberSymbolUserWatchList) {
                                // Không lấy được đủ giá của thằng personal -> fill object fake
                                expireSymbol = listSymbols.filter((v, k) => {
                                    const userWatchListSymbol = v.symbol;
                                    for (let i = 0; i < bodyData.length; i++) {
                                        const priceSymbol = bodyData[i].symbol;
                                        if (userWatchListSymbol === priceSymbol) {
                                            isContain = true
                                        }
                                    }
                                    if (isContain) {
                                        isContain = false;
                                        return false
                                    }
                                    return true
                                })
                            }
                            newData = [...bodyData, ...expireSymbol];
                            // sort lai theo user watchlist
                            let bodyDataSortByUserWatchList = []
                            for (let i = 0; i < listSymbols.length; i++) {
                                const symbol = listSymbols[i].symbol;
                                const arr = newData.filter((e, i) => {
                                    return e.symbol === symbol;
                                })
                                bodyDataSortByUserWatchList.push(arr[0]);
                            }
                            let listDataPrice = [];
                            if (bodyDataSortByUserWatchList && bodyDataSortByUserWatchList.length) {
                                listDataPrice = bodyDataSortByUserWatchList;
                            }
                            logDevice('info', `${this.props.type} - LIST PRICE`)
                            const state = {
                                listData: listDataPrice,
                                dataSource: listDataPrice,
                                isLoading: false
                            }
                            listDataPrice && listDataPrice.length > 0 && this.setState(state, () => {
                                const indexTab = this.props.type === 'topVolume' ? 2 : 1
                                dataStorage.setButtonWatchlist && dataStorage.setButtonWatchlist({ i: indexTab }, false)
                                this.props.actions.writeDataSuccess();
                                this.perf && this.perf.stop();
                            });
                        })
                        .catch(err => {
                            console.log(`GET PRICE ERROR: ${err}`)
                            this.props.actions.writeDataError();
                        })
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            Lv1.getLv1(listSymbolObject, Controller.isPriceStreaming())
                .then(bodyData => {
                    let newData = [];
                    if (bodyData.length !== numberSymbolUserWatchList) {
                        // Không lấy được đủ giá của thằng personal -> fill object fake
                        expireSymbol = listSymbols.filter((v, k) => {
                            const userWatchListSymbol = v.symbol;
                            for (let i = 0; i < bodyData.length; i++) {
                                const priceSymbol = bodyData[i].symbol;
                                if (userWatchListSymbol === priceSymbol) {
                                    isContain = true
                                }
                            }
                            if (isContain) {
                                isContain = false;
                                return false
                            }
                            return true
                        })
                    }
                    newData = [...bodyData, ...expireSymbol];
                    // sort lai theo user watchlist
                    let bodyDataSortByUserWatchList = []
                    for (let i = 0; i < listSymbols.length; i++) {
                        const symbol = listSymbols[i].symbol;
                        const arr = newData.filter((e, i) => {
                            return e.symbol === symbol;
                        })
                        bodyDataSortByUserWatchList.push(arr[0]);
                    }
                    let listDataPrice = [];
                    if (bodyDataSortByUserWatchList && bodyDataSortByUserWatchList.length) {
                        listDataPrice = bodyDataSortByUserWatchList;
                    }
                    logDevice('info', `${this.props.type} - LIST PRICE`)
                    const state = {
                        isLoading: false,
                        listData: listDataPrice,
                        dataSource: listDataPrice
                    }
                    listDataPrice && listDataPrice.length > 0 && this.setState(state, () => {
                        const indexTab = this.props.type === 'topVolume' ? 2 : 1
                        dataStorage.setButtonWatchlist && dataStorage.setButtonWatchlist({ i: indexTab }, false)
                        this.props.actions.writeDataSuccess();
                        this.perf && this.perf.stop();
                    });
                })
                .catch(err => {
                    console.log(`GET PRICE ERROR: ${err}`)
                    this.props.actions.writeDataError();
                })
        }
    }

    dataUserWatchListChange(data) {
        try {
            if (!data || data.length < 1) {
                this.props.actions.writeDataError();
                return
            }
            this.perf = new Perf(performanceEnum.load_data_top_value_item);
            this.perf && this.perf.start();
            let listData = [];
            const val = data || [];
            listData = val.sort((a, b) => a.rank - b.rank);
            let stringQuery = '';
            let symbolQuery = '';
            let symbolSubQuery = '';
            for (let index = 0; index < listData.length; index++) {
                const element = listData[index];
                let symbol = element.symbol;
                if (Controller.isPriceStreaming()) {
                    if (symbol.indexOf('/') < 0) {
                        symbolSubQuery += symbol + ',';
                    }
                } else {
                    symbolSubQuery += symbol + ',';
                }
                stringQuery += symbol + ',';
                // query get multi symbol
                if (!dataStorage.symbolEquity[symbol]) {
                    symbolQuery += symbol + ',';
                }
            }

            if (stringQuery) {
                stringQuery = stringQuery.replace(/.$/, '');
            }
            if (symbolQuery) {
                symbolQuery = symbolQuery.replace(/.$/, '');
            }
            if (symbolSubQuery) {
                symbolSubQuery = symbolSubQuery.replace(/.$/, '')
            }
            // check new trong ngay
            checkNewsToday(stringQuery)
                .then(() => {
                    logDevice('info', `CHECK NEWS TO DAY TRADE SCREEN SUCCESS`)
                })
                .catch(error => {
                    logDevice('error', `CHECK NEWS TO DAY TRADE SCREEN FAILED`)
                });
            getSymbolInfoApi(symbolQuery, () => {
                this.getLv1(data, symbolSubQuery)
                logDevice('info', `${this.props.type} - GET SYMBOL INFO SUCCESS`)
                this.perf = new Perf(performanceEnum.load_data_top_value_item);
                this.perf && this.perf.start();
            })
        } catch (error) {
            logDevice('error', `${this.props.type} EXCEPTION - ${error}`)
            console.log('dataUserWatchListChange market logAndReport exception: ', error)
            logAndReport('dataUserWatchListChange market exception', error, 'dataUserWatchListChange market');
        }
    }

    _retrieveTradeList() {
        // if (!Controller.isPriceStreaming()) {
        this.setState({
            isLoading: true
        })
        // }
        this.perf = new Perf(performanceEnum.load_data_top_value);
        this.perf && this.perf.start();
        this.setTimeUpdate && this.setTimeUpdate(new Date().getTime())
        let type = '';
        switch (this.props.type) {
            case 'topVolume':
                type = 'top-price-market-value';
                break;
            case 'topGainers':
                type = 'top-price-gainer';
                break;
            case 'topLosers':
                type = 'top-price-loser';
                break;
            default:
                break;
        }
        const url = `${getApiUrl(null, type, true)}/0`;
        logDevice('info', `GET ${type} - URL: ${url}`)
        requestData(url)
            .then(bodyData => {
                if (!bodyData) {
                    logDevice('info', `${this.props.type} IS NULL`)
                    this.props.actions.writeDataSuccess();
                    return
                }
                const listData = bodyData && bodyData ? bodyData.value : [];
                const data = listData || [];
                logDevice('info', `GET ${this.props.type} SUCCESS`)
                this.dataUserWatchListChange(data);
                this.perf && this.perf.stop();
            })
            .catch(error => {
                this.props.actions.writeDataError();
            });
        this.isLoaded = true;
    }

    componentWillReceiveProps() {
        this.showHeader();
    }

    setAnimation(cb) {
        this.setAnimationUpdated = cb;
    }

    componentWillUnmount() {
        if (Controller.isPriceStreaming()) {
            // Unsub realtime price
            Business.unSubByScreen('watchlist')
        }
        // this.props.onRef && this.props.onRef(undefined)
        this.isMount = false;
        deleteEmitter(this.props.type);
    }

    renderHeader() {
        return (
            <Animated.View style={{
                backgroundColor: 'white',
                flexDirection: 'row',
                marginHorizontal: 16,
                height: 40,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#0000001e',
                marginTop: (this.props.type === 'topGainers' || this.props.type === 'topLosers') ? 8 : (!this.isOpen ? 8 : 0)
            }}>
                <View testID='topVolumeWatchList' style={styles.col1}>
                    <Text style={CommonStyle.textMainHeader}>{I18n.t('symbolUpper', { locale: this.props.setting.lang })}</Text>
                    <Text style={CommonStyle.textSubHeader}>{I18n.t('securityUpper', { locale: this.props.setting.lang })}</Text>
                </View>
                <View style={[styles.col2, { paddingRight: 4 }]}>
                    {
                        this.props.type === 'topVolume'
                            ? <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('valueTradedUpper', { locale: this.props.setting.lang })}</Text>
                            : <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('priceUpper', { locale: this.props.setting.lang })}</Text>
                    }
                    {
                        this.props.type === 'topVolume'
                            ? <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}></Text>
                            : <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('quantityUpper', { locale: this.props.setting.lang })}</Text>
                    }
                </View>
                <View style={styles.col3}>
                    <Text style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}>{I18n.t('overviewChgP', { locale: this.props.setting.lang })}</Text>
                    <Text style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}>{I18n.t('chgUpper', { locale: this.props.setting.lang })}</Text>
                </View>
            </Animated.View>
        );
    }

    onScrollEndDrag() {
        if (this.startPosition < this.endPosition) {
            if (this.props.setAnimation && this.isOpen) {
                this.isOpen = false;
                this.props.setAnimation && this.props.setAnimation(this.isOpen);
                !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(false, this.props.type)
                this.marketTimeUpdateRef && this.marketTimeUpdateRef.showHide(false);
                // this.setAnimationUpdated && this.setAnimationUpdated();
            }
        } else {
            if (this.props.setAnimation && !this.isOpen) {
                this.isOpen = true;
                this.props.setAnimation && this.props.setAnimation(this.isOpen);
                !Controller.getLoginStatus() && this.props.showHideWarningFn && this.props.showHideWarningFn(true, this.props.type)
                this.marketTimeUpdateRef && this.marketTimeUpdateRef.showHide(true);
                // this.setAnimationUpdated && this.setAnimationUpdated();
            }
            this.startPosition = null;
            this.endPosition = null;
        }
    }

    onScrollBeginDrag() {
        this.startPosition = null;
        this.endPosition = null;
    }

    onScroll(evt) {
        const offsetY = evt.nativeEvent.contentOffset.y || 0;
        if (!this.startPosition && this.startPosition !== 0) {
            this.startPosition = offsetY;
        }
        this.endPosition = offsetY;
    }

    _renderRow(rowData, index) {
        const symbol = rowData.symbol
        const displayName = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name ? dataStorage.symbolEquity[symbol].display_name : symbol
        return (
            <View key={rowData.symbol}>
                <Price
                    symbol={symbol}
                    displayName={displayName}
                    data={rowData}
                    navigator={this.props.navigator}
                    isLoading={this.state.isLoading}
                    isConnected={this.props.isConnected}
                    login={this.props.login}
                    type={this.props.type}
                    typePrice={false}
                    registerChange={this.registerChange}
                    registerGetDataChart={this.registerGetDataChart}
                    changeIndex={this.changeIndex}
                    key={rowData.symbol}
                    typeForm={this.props.type}
                    channelUpdateIndex={Controller.isPriceStreaming() ? this.channelUpdateTrade : null}
                    currentIndex={index}
                    startIndex={this.startIndex}
                    endIndex={this.endIndex}
                />
                <View style={CommonStyle.borderBelow}></View>
            </View>
        )
    }

    _renderFooter() {
        return (
            <View>
                <View style={{ height: 86 }}></View>
            </View>
        )
    }

    onViewableItemsChanged({ viewableItems }) {
        if (!Util.arrayHasItem(viewableItems)) return;
        const startIndex = viewableItems[0].index;
        const endIndex = viewableItems[viewableItems.length - 1].index;
        Emitter.emit(this.channelUpdateTrade, { startIndex, endIndex });
        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }

    renderLoading() {
        return (
            <View style={{
                backgroundColor: 'transparent',
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <ProgressBar />
            </View>
        )
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {func.getUserPriceSource() === userType.Delay && this.props.type === 'topVolume' ? <Warning ref={ref => this.tradeTab = ref} warningText={I18n.t('delayWarning', { locale: this.props.setting.lang })} isConnected={true} /> : null}
                {
                    !Controller.isPriceStreaming() ? <TimeUpdated onRef={ref => this.marketTimeUpdateRef = ref} type={this.props.type} isShow={true} registerSetTimeUpdate={this.registerSetTimeUpdate} /> : null
                }
                {this.renderHeader()}
                {
                    this.state.dataSource && this.state.dataSource.length ? <FlatList
                        ref={ref => this.flatlist = ref}
                        keyboardShouldPersistTaps={'always'}
                        removeClippedSubviews={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={this.state.dataSource || []}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        keyExtractor={(item, index) => item.symbol}
                        onViewableItemsChanged={this.onViewableItemsChanged}
                        renderItem={({ item, index }) =>
                            this._renderRow(item, index)
                        }
                    /> : <View />
                }

                {
                    Controller.isPriceStreaming() && (this.state.isLoading || !(this.state.dataSource && this.state.dataSource.length)) ? this.renderLoading() : null
                }

                {/* <ListView
                    renderScrollComponent={props => <InvertibleScrollView
                        testID={`${this.props.topType}ScrollViewWatchList`}
                        keyboardShouldPersistTaps={'always'}
                        {...props}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                    // onMomentumScrollBegin={this.onScrollBeginDrag.bind(this)}
                    // onMomentumScrollEnd={this.onScrollEndDrag.bind(this)}
                    // onScrollBeginDrag={this.onScrollBeginDrag.bind(this)}
                    // onScrollEndDrag={this.onScrollEndDrag.bind(this)}
                    />}
                    // onScroll={this.onScroll.bind(this)}
                    removeClippedSubviews={false}
                    keyboardShouldPersistTaps="always"
                    enableEmptySections
                    automaticallyAdjustContentInsets={false}
                    dataSource={this.state.dataSource}
                    initialListSize={20}
                    pageSize={30}
                    renderFooter={this._renderFooter.bind(this)}
                    renderRow={this._renderRow.bind(this)}
                /> */}
            </View>
        );
        // }
    }
}

function mapStateToProps(state, ownProps) {
    return {
        login: state.login,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(tradeActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketCaps);
