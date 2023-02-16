import React, { Component, PureComponent } from 'react'
import {
    View, Text, TouchableOpacity, Dimensions, Image, Keyboard,
    Platform, NativeModules, TouchableWithoutFeedback
} from 'react-native'
import Animated from 'react-native-reanimated'
// Api
import * as Api from '../../api'
// Storage
import ENUM from '../../enum'
import { dataStorage, func } from '../../storage'
// Util
import * as Channel from '../../streaming/channel'
import * as UserPriceSource from '../../userPriceSource'
import {
    isIphoneXorAbove
} from '~/lib/base/functionUtil';
// Emitter
import * as Emitter from '@lib/vietnam-emitter'
// Component
import XComponent from '../../component/xComponent/xComponent'
import AlertPrice from './alert_price'
import { Navigation } from 'react-native-navigation'
import CommonStyle, { register } from '~/theme/theme_controller'
import AlertPriceHeader from './alert_price_top'
import { TYPE } from './components/ButtonConfirm'
import NestedScrollView from '~/screens/watchlist/Component/NestedScroll/WatchlistNested.js';
import { HeaderPanner } from '~/screens/watchlist/Detail/components/HeaderPanner.js'
import { LoadingIcon, RefreshIcon, CloseIcon } from '~/screens/watchlist/Detail/components/index.js'
// Common
import I18n from '~/modules/language';
import * as Controller from '~/memory/controller'
export const DEFAULT_HEGIHT = Platform.OS === 'android' ? 16 + 16 : isIphoneXorAbove() ? 16 + 46 : 16 + 32
export class HeaderPannerCustom extends HeaderPanner {
    constructor(props) {
        super(props)
        this.state = {
            true: false
        }
    }
    componentDidMount() {
        this.subLoading()
    }
    subLoading = this.subLoading.bind(this)
    subLoading() {
        this.idSubLoading = Emitter.addListener(Channel.getChannelAlertLoading(), null, isLoading => {
            if (this.state.isLoading !== isLoading) {
                this.setState({
                    isLoading
                })
            }
        })
    }
    componentWillUnmount() {
        this.idSubLoading && Emitter.deleteByIdEvent(this.idSubLoading)
    }
    renderC2RIcon() {
        const isStreaming = Controller.isPriceStreaming()
        const { notShowClickToRefresh } = this.props
        if (isStreaming || notShowClickToRefresh) return null;
        return (
            <View style={[{ marginRight: 16 }]} >
                {
                    this.state.isLoading
                        ? <LoadingIcon />
                        : <RefreshIcon onPress={this.props.onRefresh} />
                }
            </View>
        )
    }
}
const { width, height: heightDevice } = Dimensions.get('window')
const { STREAMING_MARKET_TYPE, PANEL_POSITION } = ENUM
const {
    lessThan,
    greaterThan,
    sub,
    Value,
    cond,
    and,
    block,
    set,
    not,
    multiply
} = Animated;

export default class AlertSlidingPanel extends XComponent {
    init() {
        this.dic = {
            refAlertPriceHeader: React.createRef(),
            refWrapperHeader: React.createRef(),
            statusBarHeight: 64,
            _scrollValue: this.props._scrollValue || new Value(0),
            _scrollContainer: this.props._scrollContainer || new Value(heightDevice),

            _isScrollContent: new Value(0),
            timeoutClearError: null,
            isLoadingPrice: false,
            priceObject: {},
            channelLoading: Channel.getChannelAlertLoading(),
            channelPrice: Channel.getChannelAlertPrice(),
            channelSymbolInfo: Channel.getChannelAlertSymbol(),
            channelAllPrice: Channel.getChannellAlertAllPrice(),
            channelNewsToday: Channel.getChannelAlertNewsToday(),
            channelBlurWithPan: Channel.getChannelBlurWithPan(),
            isPin: false
        }
        this.state = {
            error: false,
            isShow: false,
            isRender: false
        }
    }

    componentDidMount() {
        super.componentDidMount()
        setTimeout(() => {
            this.setState({
                isRender: true
            }, () => {
                const { symbolSelected } = this.props
                if (symbolSelected) {
                    this.props.handleShowDetailAlertFromWatchList && this.props.handleShowDetailAlertFromWatchList()
                }
            })
        }, 100);
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.timeoutUpdateError && clearTimeout(this.timeoutUpdateError)
        this.dic.timeOutSuccess && clearTimeout(this.dic.timeOutSuccess)
    }

    clearError() {
        this.setState({
            error: ''
        })
    }

    updateError({ errorCode, error }) {
        if (errorCode === 'SUCCESS') {
            this.dic.refAlertPriceHeader.current && this.dic.refAlertPriceHeader.current.updateError({ type: ENUM.TYPE_MESSAGE.WARNING, text: error }, () => {
                this.dic.timeOutSuccess && clearTimeout(this.dic.timeOutSuccess)
                this.dic.timeOutSuccess = setTimeout(this.props.handleCancelSearch, 1000)
            })
        } else {
            this.dic.refAlertPriceHeader.current && this.dic.refAlertPriceHeader.current.updateError({ type: ENUM.TYPE_MESSAGE.ERROR, text: error })
            this.timeoutUpdateError = setTimeout(() => {
                this.dic.refAlertPriceHeader.current && this.dic.refAlertPriceHeader.current.hideError()
            }, 3000);
        }
    }

    fakeData(symbolObj = {}) {
        const { symbol, displayName, company, symbolClass } = symbolObj
        // Call Api get price
        const fakeEquityEtfMf = {
            symbol,
            symbolClass,
            displayName,
            company,
            trade_price: 30.12,
            trade_size: 1234,
            change_point: 1.85,
            change_percent: 1.23,
            open: 30.12,
            high: 32.23,
            low: 30.1,
            close: 31,
            previous_close: 30.1,
            bid_price: 30.12,
            bid_size: 1234,
            ask_price: 30.24,
            ask_size: 1233,
            volume: 5790000
        }

        const fakeFutures = {
            symbol,
            symbolClass,
            displayName,
            company,
            trade_price: 30.12,
            trade_size: 1234,
            change_point: 1.85,
            change_percent: 1.23,
            open: 30.12,
            high: 32.23,
            low: 30.1,
            close: 31,
            previous_close: 30.1,
            bid_price: 30.12,
            bid_size: 1234,
            ask_price: 30.24,
            ask_size: 1233,
            volume: 5790000,
            settlement_price: 30.24,
            expiry: '02/05/2019'
        }

        const fakeWarrantOption = {

        }
        return fakeEquityEtfMf
    }
    pubDataToAlertNullPrice() {
        Emitter.emit(this.dic.channelAllPrice, {})
    }
    pubSymbolToNullpoint(status) {
        Emitter.emit(this.dic.channelLoading, status)
    }
    getSnapshot({ symbolObj = {}, isGoTop = true, cb }) {
        this.symbolObj = symbolObj
        this.pubSymbolToNullpoint(true)
        const { symbol, displayName, company, symbolClass } = symbolObj
        listSymbolObj = [{
            symbol,
            exchange: dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].exchanges ? dataStorage.symbolEquity[symbol].exchanges[0] : 'ASX'
        }]

        UserPriceSource.loadDataPrice(STREAMING_MARKET_TYPE.QUOTE, listSymbolObj)
            .then(res => {
                if (res) {
                    if (res.length) {
                        const priceObject = res[0]
                        priceObject['symbol'] = symbol
                        priceObject['displayName'] = displayName
                        priceObject['company'] = company
                        priceObject['symbolClass'] = symbolClass
                        this.updateData(priceObject)
                        this.pubDataToAlertPrice(priceObject)
                    } else {
                        const priceObject = {
                            symbol,
                            displayName,
                            company,
                            symbolClass
                        }
                        this.updateData(priceObject)
                        this.pubDataToAlertPrice(priceObject)
                    }
                } else {
                    const priceObject = {
                        symbol,
                        displayName,
                        company,
                        symbolClass
                    }
                    this.updateData(priceObject)
                    this.pubDataToAlertPrice(priceObject)
                }
                this.pubSymbolToNullpoint(false)
                cb && cb() // Callback snapshot price done
            })
            .catch(err => {
                cb && cb() // Callback snapshot price done
            })
    }

    async getNewsToday(symbol) {
        if (symbol) {
            const checkUrl = Api.checkNewsTodayUrl(symbol)
            try {
                const data = await Api.requestData(checkUrl)
                if (data) {
                    this.pubNewsToday({ symbol, data })
                }
            } catch (error) {
                console.catch(error)
            }
        }
    }

    updateData(data) {
        this.dic.priceObject = data
        this.pubSymbolToChild(this.dic.priceObject)
        this.pubDataToChild(this.dic.priceObject)
    }

    pubDataToAlertPrice() {
        Emitter.emit(this.dic.channelAllPrice, this.dic.priceObject)
    }

    pubSymbolToChild() {
        Emitter.emit(this.dic.channelSymbolInfo, this.dic.priceObject)
    }

    pubDataToChild() {
        Emitter.emit(this.dic.channelPrice, { data: this.dic.priceObject, isMerge: false })
    }

    pubNewsToday({ symbol, data }) {
        const isNewsToday = data[symbol]
        Emitter.emit(this.dic.channelNewsToday, isNewsToday)
    }

    onClose() {
        this.clearError()
        this.hide && this.hide()
    }

    setHeightTriggerPinPrice = (height) => {
        setTimeout(() => {
            this.dic.refAlertPriceHeader && this.dic.refAlertPriceHeader.current.setHeightTriggerPinPrice(height)
        }, 300);
    }
    handleClickToRefresh = () => {
        if (!this.symbolObj) return
        Controller.setShouldSetDefault(false)
        this.getSnapshot({ symbolObj: this.symbolObj })
        this.getNewsToday(this.symbolObj.symbol)
    }
    renderHeader = () => {
        const { _scrollValue } = this.dic
        let translateY = 0;
        translateY = multiply(_scrollValue, -1)
        return (
            <Animated.View
                pointerEvents={'box-none'}
                style={{
                    zIndex: 99,
                    transform: [
                        { translateY }
                    ]
                }}
            >
                <AlertPriceHeader
                    onRefresh={this.handleClickToRefresh}
                    _scrollValue={_scrollValue}
                    ref={this.dic.refAlertPriceHeader}
                    onClose={this.onClose}
                    updateError={this.updateError}
                    priceObject={this.dic.priceObject}
                    channelBlurWithPan={this.dic.channelBlurWithPan}
                    channelLoading={this.dic.channelLoading}
                    channelNewsToday={this.dic.channelNewsToday}
                    channelSymbolInfo={this.dic.channelSymbolInfo}
                    channelAllPrice={this.dic.channelAllPrice}
                    channelPrice={this.dic.channelPrice}
                />
            </Animated.View>

        )
    }
    setRefAlertPrice = this.setRefAlertPrice.bind(this)
    setRefAlertPrice(ref) {
        this.refAlertPrice = ref
    }
    resetError = () => {
        this.refAlertPrice && this.refAlertPrice.resetError()
    }
    renderContent = () => {
        return (
            <View>
                <AlertPrice
                    ref={this.setRefAlertPrice}
                    setHeightTriggerPinPrice={this.setHeightTriggerPinPrice}
                    updateError={this.updateError}
                    priceObject={this.dic.priceObject}
                    channelBlurWithPan={this.dic.channelBlurWithPan}
                    channelLoading={this.dic.channelLoading}
                    channelNewsToday={this.dic.channelNewsToday}
                    channelSymbolInfo={this.dic.channelSymbolInfo}
                    channelAllPrice={this.dic.channelAllPrice}
                    channelPrice={this.dic.channelPrice}
                />
                <View onMoveShouldSetResponder={Keyboard.dismiss} style={{ height: 300 }} />
            </View>
        )
    }
    renderHeaderPanner = this.renderHeaderPanner.bind(this)
    renderHeaderPanner() {
        return (
            // Tren con mi. Noi giua 2 view ma co mot gach trong suot lam cho khi vuot hien bi chop chop
            <View style={{ backgroundColor: CommonStyle.backgroundColor }}>
                <HeaderPannerCustom
                    notShowClickToRefresh={true}
                    styleContent={{ paddingTop: 8, paddingBottom: 2, paddingVertical: 0 }}
                    title={I18n.t('newAlert')}
                    onClose={this.onClose}
                    onRefresh={this.handleClickToRefresh}
                />
                <View style={{ height: 1 }} />
            </View>
        )
    }
    setRefNested = this.setRefNested.bind(this)
    setRefNested(sef) {
        this._nested = sef
    }
    hide = this.hide.bind(this)
    hide() {
        this._nested && this._nested.hide()
    }
    show = this.show.bind(this)
    show() {
        this._nested && this._nested.show()
    }
    hideCallBack = this.hideCallBack.bind(this)
    hideCallBack() {
        this.props.callBackHideDetail && this.props.callBackHideDetail()
        this.resetError()
    }
    render() {
        if (!this.state.isRender) return null // Lazy loading
        return (
            <NestedScrollView
                _isScrollContent={this.dic._isScrollContent}
                _scrollValue={this.dic._scrollValue}
                _scrollContainer={this.dic._scrollContainer}
                ref={this.setRefNested}
                renderHeaderPanner={this.renderHeaderPanner}
                spaceTop={DEFAULT_HEGIHT}
                hideCallback={this.hideCallBack}
            >
                <View style={{
                    position: 'absolute',
                    height: '150%',
                    width: '100%',
                    // paddingTop: 33,
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24
                }} />
                {this.renderHeader()}
                {this.renderContent()}
            </NestedScrollView>
        )
    }
}
