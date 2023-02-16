import React, { Component } from 'react'
import {
    View, Text, TouchableOpacity, ScrollView, Dimensions, Animated,
    Platform, NativeModules, PanResponder, Easing
} from 'react-native'
// Api
import * as Api from '../../api'
// Storage
import ENUM from '../../enum'
import { dataStorage, func } from '../../storage'
// Util
import * as Channel from '../../streaming/channel'
import * as UserPriceSource from '../../userPriceSource'
import * as FunctionUtil from '../../lib/base/functionUtil'
import * as NewsBusiness from '../../streaming/news'
// Emitter
import * as Emitter from '@lib/vietnam-emitter'
// Component
import SlidingUpPanel from 'rn-sliding-up-panel';
import XComponent from '../../component/xComponent/xComponent'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation'
import * as Business from '../../business';
import CommonStyle, { register } from '~/theme/theme_controller'
import Flag from '../../component/flags/flag'

const { width, height } = Dimensions.get('window')
const { STREAMING_MARKET_TYPE, PANEL_POSITION } = ENUM
const { StatusBarManager } = NativeModules;

const styles = {
    containerAndroid: {
        position: 'absolute',
        top: 64,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
        backgroundColor: 'transparent'
    },
    containerIOS: {
        width: '100%',
        // position: 'absolute',
        // bottom: 0,
        zIndex: 1,
        backgroundColor: 'white'
    },
    dragHandler: {
        alignSelf: 'stretch',
        height: 36,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fdfdfd',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    }
}

export default class NewOrderSlidingPanel extends XComponent {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.init();
        this.bindAllFunc();
    }

    init() {
        this.dic = {
            startPointUpDown: null,
            startTransYPointScrollView: null,
            startTransYPointPanel: null,
            atTopPanel: true,
            atTopScrollView: true,
            handlePanelAnim: true,
            preventStatusBarAnim: false,
            preventSnapshot: false,
            position: PANEL_POSITION.BOTTOM,
            scrollPosition: PANEL_POSITION.TOP,
            top: 0,
            bottom: 0,
            middle: 0,
            statusBarHeight: 64,
            heightPanel: 0,
            heightScreen: height,
            heightCanScroll: 0,
            scrollValue: new Animated.Value(0),
            timeoutClearError: null,
            lastPosition: 0,
            lastPositionScroll: 0,
            currentPosition: 0,
            currentPanelPosition: 0,
            currentPositionScroll: 0,
            changePointAnimation: 0,
            draggableRange: {
                top: this.getDragableTop(),
                bottom: 0,
                middle: this.getDragableMiddle()
            },
            isLoadingPrice: false,
            priceObject: {},
            channelLoading: Channel.getChannelAlertLoading(),
            channelPrice: Channel.getChannelAlertPrice(),
            channelSymbolInfo: Channel.getChannelAlertSymbol(),
            channelAllPrice: Channel.getChannellAlertAllPrice(),
            channelNewsToday: Channel.getChannelAlertNewsToday(),
            channelBlurWithPan: Channel.getChannelBlurWithPan(),
            animationScrollDecay: null,
            animationScrollValue: null
        }
        this.dic.animatedValue = new Animated.Value(this.dic.draggableRange.bottom)
        this.dic.minRangeExecAnimation = this.dic.draggableRange.top - 48 - 1
        this.dic.maxRangeExecAnimation = this.dic.draggableRange.top - 48 + 1
        this.state = {
            error: false,
            isShow: false
        }

        this.registerScrollViewAnimation()
    }

    binbAllFunc() {
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    getDragableTop() {
        this.dic.top = Platform.OS === 'ios'
            ? FunctionUtil.isIphoneXorAbove()
                ? height - 64 - (38 - 16)
                : height - 64
            : FunctionUtil.isIphoneXorAbove()
                ? height - 64 - (38 - 16) - StatusBarManager.HEIGHT
                : height - 64 - StatusBarManager.HEIGHT
        return this.dic.top
    }

    getDragableMiddle() {
        this.dic.middle = (Platform.OS === 'ios'
            ? FunctionUtil.isIphoneXorAbove()
                ? height - 64 - (38 - 16)
                : height - 64
            : height - 64) / 2
        return this.dic.middle
    }

    getDragableBottom() {

    }

    componentDidMount() {
        super.componentDidMount()
        this.dic.animatedValue.addListener(this.onAnimatedValueChange.bind(this));
        this.dic.scrollValue.addListener(this.onAnimatedValueScrollChange.bind(this))
    }

    componentWillUnmount() {
        this.dic.animatedValue && this.dic.animatedValue.removeListener(this.onAnimatedValueChange);
        super.componentWillUnmount()
    }

    checkIsScrollUp(dy) {
        let isScrollDown = false
        if (this.dic.startPointUpDown) {
            isScrollDown = dy - this.dic.startPointUpDown > 0
        }
        this.dic.startPointUpDown = dy
        return !isScrollDown
    }

    checkIsUp(value) {
        let isScrollDown = false
        if (this.dic.startPointUpDown) {
            isScrollDown = value - this.dic.startPointUpDown > 0
        }
        return !isScrollDown
    }

    resetPoint() {
        this.dic.startTransYPointPanel = null
        this.dic.startTransYPointScrollView = null
        this.dic.startPointUpDown = null
    }

    updateHandlePanelAnim(handlePanelAnim) {
        this.dic.handlePanelAnim = handlePanelAnim
    }

    updatePreventSnapshot({ preventSnapshot }) {
        this.dic.preventSnapshot = preventSnapshot
    }

    onBlurWithPan() {
        Emitter.emit(this.dic.channelBlurWithPan)
    }

    setScrollValue(newScrollValue) {
        this.dic.scrollValue.setValue(newScrollValue)
    }

    setPanelValue(newPanelValue) {
        this.dic.animatedValue.setValue(newPanelValue)
    }

    execAnimationScrollValue({ duration, toValue }) {
        this.dic.animationScrollValue = Animated.timing(
            this.dic.scrollValue, {
            toValue,
            duration
        }
        )
        this.dic.animationScrollValue.start()
    }

    isAtTopPanel() {
        const panelValue = this.dic.animatedValue._value
        const { top } = this.dic.draggableRange
        return panelValue >= top
    }

    isAtTopScrollView() {
        const scrollValue = this.dic.scrollValue._value
        const heightCanScroll = this.dic.heightCanScroll
        return heightCanScroll <= 0 || (heightCanScroll > 0 && scrollValue === 0)
    }

    isAtBottomScrollView() {
        const scrollValue = this.dic.scrollValue._value
        const absScrollValue = Math.abs(scrollValue)
        const isGoUp = this.checkIsScrollUp(scrollValue)
        const heightCanScroll = this.dic.heightCanScroll
        return isGoUp && absScrollValue > heightCanScroll
    }

    snapShotAfterDecay() {
        this.updateScrollPosition(this.dic.scrollValue._value)
    }

    createVelocityAnimation({ velocity, isAtTopScrollView, isAtTopPanel, isGoUp }) {
        if (isAtTopPanel) {
            if (this.dic.heightCanScroll <= 0) return null
            if (isAtTopScrollView) {
                if (isGoUp) {
                    return Animated.decay(
                        this.dic.scrollValue,
                        {
                            velocity, // velocity from gesture release
                            deceleration: 0.997
                        }
                    )
                }
            } else {
                return Animated.decay(
                    this.dic.scrollValue,
                    {
                        velocity, // velocity from gesture release
                        deceleration: 0.997
                    }
                )
            }
        }
        return null
    }

    movePanel(dy) {
        const extraValue = dy - this.dic.startTransYPointPanel
        const newPanelValue = this.dic.currentPanelPosition - extraValue
        this.setPanelValue(newPanelValue)
    }

    moveScroll(dy) {
        const extraValue = dy - this.dic.startTransYPointScrollView
        const newScrollValue = this.dic.currentPositionScroll + extraValue
        this.setScrollValue(newScrollValue)
    }

    handleMoveAnimation({ dy }) {
        const isAtTopScrollView = this.isAtTopScrollView()
        const isAtTopPanel = this.isAtTopPanel()
        const isGoUp = this.checkIsScrollUp(dy)
        if (!isAtTopPanel) {
            this.movePanel(dy)
        } else {
            const heightCanScroll = this.dic.statusBarHeight + this.dic.heightPanel - (this.dic.draggableRange.top + 40) // 40 là độ cao drag button
            this.updateHeightCanScroll(heightCanScroll)
            if (isAtTopScrollView) {
                // Top scroll && top panel và kéo xuống -> move panel
                if (!isGoUp) {
                    if (!this.dic.startTransYPointPanel) {
                        this.dic.startTransYPointPanel = dy
                    } else {
                        this.movePanel(dy)
                    }
                } else {
                    // Top scroll && top panel và kéo lên -> move scroll
                    if (this.dic.heightCanScroll <= 0) return
                    if (!this.dic.startTransYPointScrollView) {
                        this.dic.startTransYPointScrollView = dy
                    } else {
                        this.moveScroll(dy)
                    }
                }
            } else {
                // Top panel và không ở top scroll -> move scroll (lên và xuống)
                if (this.dic.heightCanScroll <= 0) return
                this.moveScroll(dy)
            }
        }
    }

    handleReleaseAnimation({ dy, vy }) {
        const isAtTopScrollView = this.isAtTopScrollView()
        const isAtTopPanel = this.isAtTopPanel()
        const isGoUp = this.checkIsUp(dy)
        this.dic.animationScrollDecay = this.createVelocityAnimation({ velocity: vy, isAtTopScrollView, isAtTopPanel, isGoUp })
        if (this.dic.animationScrollDecay) {
            this.dic.animationScrollDecay.start(this.snapShotAfterDecay.bind(this))
        } else {
            this.animationThroughHalfPosition(this.dic.animatedValue._value)
        }
    }

    clearAllAnimationScrollView() {
        this.dic.animationScrollValue && this.dic.animationScrollValue.stop()
        this.dic.animationScrollDecay && this.dic.animationScrollDecay.stop()
        this.updateScrollPosition(this.dic.scrollValue._value)
        this.dic.animationScrollValue = null
        this.dic.animationScrollDecay = null
    }

    registerScrollViewAnimation() {
        this.dic.scrollPanResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => false,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                this.updatePreventSnapshot({ preventSnapshot: true })
                this.clearAllAnimationScrollView()
                this.onBlurWithPan()
                return false
            },
            onMoveShouldSetPanResponder: (evt, gestureState) => false,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                const { dy } = gestureState
                return dy > 12 || dy < -12
            },

            onPanResponderGrant: (evt, gestureState) => {
                // The gesture has started. Show visual feedback so the user knows
                // what is happening!
                // gestureState.d{x,y} will be set to zero now
            },
            onPanResponderMove: (evt, gestureState) => {
                this.handleMoveAnimation(gestureState)
                // The most recent move distance is gestureState.move{X,Y}
                // The accumulated gesture distance since becoming responder is
                // gestureState.d{x,y}
            },
            onPanResponderTerminationRequest: (evt, gestureState) => false,
            onPanResponderRelease: (evt, gestureState) => {
                this.resetPoint()
                this.updatePreventSnapshot({ preventSnapshot: false })
                this.handleReleaseAnimation(gestureState)
                // The user has released all touches while this view is the
                // responder. This typically means a gesture has succeeded
            },
            onPanResponderTerminate: (evt, gestureState) => {
                // Another component has become the responder, so this gesture
                // should be cancelled
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
                // Returns whether this component should block native components from becoming the JS
                // responder. Returns true by default. Is currently only supported on android.
                return true;
            }
        });
    }

    clearError() {
        this.setState({
            error: ''
        })
    }

    updateError({ errorCode, error }) {
        this.setState({
            error
        }, () => {
            if (errorCode === 'SUCCESS') {
                setTimeout(this.onClose, 1000)
            } else {
                this.dic.timeoutClearError && clearTimeout(this.dic.timeoutClearError)
                this.dic.timeoutClearError = setTimeout(() => {
                    this.clearError()
                }, 2000)
            }
        })
    }

    updatePosition(position) {
        this.dic.lastPosition = this.dic.currentPosition
        this.dic.currentPosition = position
    }

    updateScrollPosition(position) {
        this.dic.lastPositionScroll = this.dic.currentPositionScroll
        this.dic.currentPositionScroll = position
    }

    animationThroughHalfPosition(position) {
        const { top, bottom, middle } = this.dic.draggableRange
        const halfPosition = middle + ((top - middle) / 2)
        if (position === top || position === middle) return
        if (position >= halfPosition) {
            const cb = () => {
                setTimeout(this.showC2RStatusBar.bind(this), 100)
            }
            this.goTop({ duration: 200, cb })
        } else {
            this.goMiddle({ duration: 200 })
        }
    }

    showC2RStatusBar() {
        // hide search -> show c2r
        const isSearch = false
        this.props.changeStatusBarUI && this.props.changeStatusBarUI(isSearch)
    }

    showSearchStatusBar() {
        // hide c2r -> show search
        const isSearch = true
        this.props.changeStatusBarUI && this.props.changeStatusBarUI(isSearch)
    }

    onAnimatedValueScrollChange({ value }) {
        // Còn phải xử lý khi vuốt nó lên
        const absScrollValue = Math.abs(value)
        const distance = absScrollValue - Math.abs(this.dic.startTransYPointScrollView)
        const isGoUp = this.checkIsUp(value)
        if (distance > this.dic.heightCanScroll) {
            const newScrollValue = isGoUp ? -this.dic.heightCanScroll : this.dic.heightCanScroll
            this.setScrollValue(newScrollValue)
            this.updateScrollPosition(newScrollValue)
        } else if (value > 0) {
            this.setScrollValue(0)
            this.updateScrollPosition(0)
        }
    }

    onAnimatedValueChange({ value }) {
        console.log('onAnimatedValueChange', value)
        this.updatePosition(value)
        const { top, bottom } = this.dic.draggableRange
        if (value >= top) {
            this.updateChangePointAnimation(value)
            const heightCanScroll = this.dic.statusBarHeight + this.dic.heightPanel - (top + 40) // 40 là độ cao drag button
            this.updateHeightCanScroll(heightCanScroll)
            this.updatePositionPanel(PANEL_POSITION.TOP)
        }
        // Đi đến điểm top - 48 -> thực hiện animation
        // Last position < current postion => up
        // Last position > current postion => down
        if (this.dic.preventStatusBarAnim) return; // Đang chạy sliding animation thì không setState statusBar
        if (value >= top - 48) {
            this.showC2RStatusBar()
        } else if (value < top - 48) {
            this.showSearchStatusBar()
        }
    }

    onDragStart(position, gestureState) {
        const { dx, dy, vx, vy } = gestureState
        console.log('PAN - onDragStart position: ', position)
        console.log(`PAN - onDragStart dx: ${dx} - dy: ${dy} - vx: ${vx} - vy: ${vy}`)
    }

    onDragEnd(position, gestureState) {
        const { dx, dy, vx, vy, x0, y0, moveX, moveY } = gestureState
        console.log('PAN - onDragEnd position: ', position)
        console.log(`PAN - onDragEnd dx: ${dx} - dy: ${dy} - vx: ${vx} - vy: ${vy}`)
        this.animationThroughHalfPosition(position)
    }

    onMomentumDragStart(position) {
        console.log('PAN - onMomentumDragStart position: ', position)
    }

    onMomentumDragEnd(position) {
        console.log('PAN - onMomentumDragEnd position: ', position)
        this.animationThroughHalfPosition(position)
    }

    onLayoutScrollWrapper(event) {
        const { x, y, width: w, height: h } = event.nativeEvent.layout;
        this.dic.heightPanel = h
        const heightWrapperPanel = this.getHeightWrapperPanel()
        const heightCanScroll = this.dic.statusBarHeight + this.dic.heightPanel - heightWrapperPanel
        this.updateHeightCanScroll(heightCanScroll)
        console.log('onLayoutScrollWrapper', x, y, w, h)
    }

    updateHeightCanScroll(heightCanScroll) {
        this.dic.heightCanScroll = heightCanScroll
    }

    updateChangePointAnimation(endAnimPosition) {
        const { top, middle, bottom } = this.dic.draggableRange
        let startAnimPosition = bottom
        switch (this.dic.position) {
            case PANEL_POSITION.TOP:
                startAnimPosition = top
                break;
            case PANEL_POSITION.MIDDLE:
                startAnimPosition = middle
                break;
            default:
                startAnimPosition = bottom
                break;
        }
        this.dic.changePointAnimation = endAnimPosition - startAnimPosition
    }

    updatePositionPanel(position) {
        const { top, middle, bottom } = this.dic.draggableRange
        this.dic.currentPanelPosition = bottom
        switch (position) {
            case PANEL_POSITION.TOP:
                this.dic.currentPanelPosition = top
                break;
            case PANEL_POSITION.MIDDLE:
                this.dic.currentPanelPosition = middle
                break;
            default:
                this.dic.currentPanelPosition = bottom
                break;
        }
        this.dic.position = position
    }

    updatePreventStatusBarAnim(preventStatusBarAnim) {
        this.dic.preventStatusBarAnim = preventStatusBarAnim
    }

    getHeightWrapperPanel() {
        const { top, middle, bottom } = this.dic.draggableRange
        switch (this.dic.position) {
            case PANEL_POSITION.TOP:
                return top + 40 // 40 height drag icon
            case PANEL_POSITION.MIDDLE:
                return middle + 40 // 40 height drag icon
            case PANEL_POSITION.BOTTOM:
                return bottom + 40 // 40 height drag icon
            default:
                return this.dic.heightScreen
        }
    }

    goTop({ duration = 300, cb }) {
        this.updatePreventStatusBarAnim(true)
        const { top } = this.dic.draggableRange
        const heightCanScroll = this.dic.statusBarHeight + this.dic.heightPanel - (top + 40) // 40 là độ cao drag button
        this.updateHeightCanScroll(heightCanScroll)
        this.updatePositionPanel(PANEL_POSITION.TOP)
        Animated.timing(
            this.dic.animatedValue,
            {
                toValue: top,
                duration,
                easing: Easing.quad
            }
        ).start(() => {
            this.updatePreventStatusBarAnim(false)
            cb && cb()
        })
    }

    goMiddle({ duration = 300, cb }) {
        const { middle } = this.dic.draggableRange
        const heightCanScroll = this.dic.statusBarHeight + this.dic.heightPanel - (middle + 40) // 40 là độ cao drag button
        this.updateHeightCanScroll(heightCanScroll)
        this.updatePositionPanel(PANEL_POSITION.MIDDLE)
        Animated.timing(
            this.dic.animatedValue,
            {
                toValue: middle,
                duration
            }
        ).start(cb)
    }

    goBottom({ duration = 300, cb }) {
        const { bottom } = this.dic.draggableRange
        Animated.timing(
            this.dic.animatedValue,
            {
                toValue: bottom,
                duration
            }
        ).start(cb)
    }

    show() {
        const cb = () => {
            setTimeout(this.showC2RStatusBar.bind(this), 100)
        }
        this.goTop({ duration: 250, cb })
    }

    hide() {
        const cb = () => {
            setTimeout(this.showSearchStatusBar.bind(this), 100)
        }
        this.goBottom({ duration: 250, cb })
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

    getSnapshot({ symbolObj = {}, isGoTop = true, cb }) {
        this.dic.isLoadingPrice = true
        const { symbol, displayName, company, symbolClass } = symbolObj
        // const fakeData = this.fakeData(symbolObj)

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
                this.dic.isLoadingPrice = false
                cb && cb() // Callback snapshot price done
                isGoTop && this.show()
            })
            .catch(err => {
                console.log(err)
                this.dic.isLoadingPrice = false
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
        Emitter.emit(this.dic.channelPrice, this.dic.priceObject)
    }

    pubNewsToday({ symbol, data }) {
        const isNewsToday = data[symbol]
        Emitter.emit(this.dic.channelNewsToday, isNewsToday)
    }

    onClose() {
        this.hide()
        // return this.props.onCancel()
    }

    renderDragIcon() {
        return <View style={CommonStyle.dragIcons} />
    }

    renderCloseIcon() {
        return <TouchableOpacity
            onPress={() => this.onClose()}
            style={[{
                position: 'absolute',
                zIndex: 2,
                top: 13,
                right: 8
            }]}
        >
            <View style={[{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#ececec',
                justifyContent: 'center',
                alignItems: 'center'
            }]}>
                <Ionicons name='md-close' color={'rgba(0, 0, 0, 0.54)'} size={18} style={{ fontWeight: 'bold' }} />
            </View>
        </TouchableOpacity>
    }

    renderNone() {
        return null
    }

    renderSymbolName() {
        const displayName = this.props.symbolObject && this.props.symbolObject.display_name;
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
                {
                    this.props.isModify ? null : <TouchableOpacity style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                        onPress={() => this.showSearchStatusBar()}>
                        <Ionicons name="ios-search" style={[CommonStyle.iconSearchDark]} />
                    </TouchableOpacity>
                }
            </View>
        );
    }

    renderClassTag() {
        const classSymbol = this.props.symbolObject && this.props.symbolObject.class;
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

    renderCompanyName() {
        const symbolObj = this.props.symbolObject || {}
        const companyName = (symbolObj.company_name || symbolObj.company || symbolObj.security_name || '').toUpperCase();
        return (
            <View style={[{
                flexDirection: 'row',
                paddingHorizontal: 16
            }]}>
                <View style={{ width: '80%', alignItems: 'flex-start' }}>
                    <Text numberOfLines={2} style={[CommonStyle.textAlert, { textAlign: 'left', color: CommonStyle.fontNearDark2 }]}>{companyName}</Text>
                </View>
                <View style={[{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row'
                }]}>
                    <Flag
                        type={'flat'}
                        code={this.props.code ? Business.getFlag(this.props.code) : ''}
                        size={18}
                        style={{ marginRight: 8 }}
                    />
                    {this.renderClassTag()}
                </View>
            </View>
        );
    }

    renderSliding() {
        const container = Platform.OS === 'ios' ? styles.containerIOS : styles.containerAndroid
        return <View style={container} pointerEvents={'box-none'}>
            <SlidingUpPanel
                showBackdrop={false}
                draggableRange={this.dic.draggableRange}
                animatedValue={this.dic.animatedValue}
                onDragStart={this.onDragStart}
                onDragEnd={this.onDragEnd}
                onMomentumDragStart={this.onMomentumDragStart}
                onMomentumDragEnd={this.onMomentumDragEnd}
                ref={ref => this._panel = ref}>
                {dragHandler => (
                    <View style={[{
                        flex: 1,
                        zIndex: 1,
                        backgroundColor: CommonStyle.colorBgNewAlert
                    }, Platform.OS === 'android'
                        ? {
                            overflow: 'hidden',
                            borderTopLeftRadius: this.props.isModify ? 0 : 20,
                            borderTopRightRadius: this.props.isModify ? 0 : 20
                        }
                        : {}
                    ]}>
                        <View style={[
                            CommonStyle.dragHandlerNewOrder,
                            {
                                flexDirection: 'row',
                                marginTop: Platform.OS === 'ios' ? 4 : 0,
                                shadowColor: CommonStyle.fontColor,
                                shadowOffset: {
                                    width: 0,
                                    height: -4
                                },
                                shadowOpacity: 0.1
                            }]} {...dragHandler}>
                            {this.props.isModify || this.renderDragIcon()}
                            {this.props.isModify || this.renderCloseIcon()}
                        </View>
                        {this.props.error || null}
                        {this.renderSymbolName()}
                        {this.renderCompanyName()}
                        {this.props.subTitle || null}
                        {this.props.children}
                    </View>
                )}
            </SlidingUpPanel>
        </View>
    }

    render() {
        return this.renderSliding()
    }
}
