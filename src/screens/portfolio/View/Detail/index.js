import React, { useMemo, useState, useCallback, useRef, useImperativeHandle, useEffect } from 'react'
import {
    View, Text, Dimensions, StyleSheet
} from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import BackDropView from '~s/watchlist/Component/BackDropView2';
import NestedScrollView from '~s/watchlist/Component/NestedScroll/WatchlistNested';
import PortfolioDetail from './PortfolioDetail';
import I18n from '~/modules/language/';
import HeaderPanner from '~s/watchlist/Detail/components/HeaderPanner';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { getCompanyName } from '~/business'
import { useShadow } from '~/component/shadow/SvgShadow';
import { usePaddingTop, useSpaceTop, useCheckPanelStatus } from '~s/portfolio/Hook/'
import BottomSheet from '~/component/bottom_sheet_reanimated/index.js'
import { FakeView, useRefFakeView } from '~/screens/portfolio/View/AddToWL/index.js'
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js'
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const {
    interpolate,
    Value
} = Animated
const Detail = React.forwardRef(({
    updateActiveStatus,
    navigator,
    showHideTabbar,
    showHideBuySell,
    showAddToWl,
    setSymbolExchange,
    zIndex
}, ref) => {
    const [ShadowHeaderPanner, onLayout] = useShadow()
    const panelPaddingTop = usePaddingTop()
    const _scrollValue = useMemo(() => new Value(0), [])
    const _scrollContainer = useMemo(() => new Value(DEVICE_HEIGHT * 1.3), [])
    const scrollValue = useMemo(() => new Value(0), [])
    const _isScrollContent = useMemo(() => new Value(0), [])
    const [_spaceTop, setSpaceTop] = useSpaceTop(panelPaddingTop)

    const [symbolInfo, setSymbolInfo] = useState({})
    const [data, setData] = useState({})
    const refNested = useRef({
        isShow: false
    })
    const { refFakeView, show, hide } = useRefFakeView()
    const changeSymbol = useCallback((symbol, exchange, data = {}) => {
        refNested.current.isShow = true
        refNested.current && refNested.current.show && refNested.current.show()
        setTimeout(() => {
            setSymbolExchange({ symbol, exchange, position: data })
            setSymbolInfo({ symbol, exchange });
            setData(data)
        }, 10);
    }, [])
    const updateDataRealtime = useCallback((positions = [], totalMarketValue, currency) => {
        const isShowPanel = useCheckPanelStatus(refNested) // Nếu đang không hiển thị panel thì không ghi nhận realtime
        if (!positions.length || !symbolInfo.symbol || !symbolInfo.exchange || !isShowPanel) return
        const filterData = positions.filter(position => {
            const { symbol, exchange } = position
            return symbol === symbolInfo.symbol && exchange === symbolInfo.exchange
        })
        const newData = filterData[0]
        if (!newData) return
        newData['total_market_value'] = totalMarketValue // Mapping thêm total_market_value trong positions
        newData['currency_account'] = currency // Mapping thêm currency by account trong positions
        setData(newData)
    }, [symbolInfo.symbol, symbolInfo.exchange])
    useImperativeHandle(ref, () => {
        return {
            updateDataRealtime,
            changeSymbol,
            onCloseDetail,
            setSpaceTop
        }
    })
    const renderHeaderPanner = useCallback(() => {
        const { company = '' } = data || {}
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22
                }}
            >
                {/* <ShadowHeaderPanner /> */}
                <HeaderPanner
                    title={company}
                    styleContent={{ borderBottomWidth: 0 }}
                    onLayout={onLayout}
                    onClose={onCloseDetail}
                    onRefresh={onRefresh}
                />
                {/* <View style={{ height: 1 }} /> */}
            </View>
        );
    }, [symbolInfo.symbol, symbolInfo.exchange, data.company])
    const onCloseDetailByScroll = useCallback(() => {
        const isQuick = true
        refNested.current.isShow = false
        showHideTabbar && showHideTabbar(1)
        showHideBuySell && showHideBuySell(0, isQuick)
        hide()
    }, [])
    const onCloseDetail = useCallback(() => {
        refNested.current && refNested.current.hide && refNested.current.hide()
        refNested.current.isShow = false
        showHideTabbar && showHideTabbar(1)
        showHideBuySell && showHideBuySell(0)
    }, [])
    const onRefresh = useCallback(() => {

    }, [])
    const onOpenEnd = () => {
        show()
    }
    const renderContent = useCallback(() => {
        return <PortfolioDetail
            navigator={navigator}
            updateActiveStatus={updateActiveStatus}
            showAddToWl={showAddToWl}
            symbol={symbolInfo.symbol}
            exchange={symbolInfo.exchange}
            data={data}
            navigator={navigator}
            onClose={onCloseDetail}
        />
    }, [symbolInfo, data])
    return (
        <React.Fragment>
            <FakeView ref={refFakeView} />
            <BottomSheet
                zIndex={zIndex}
                keyExtractor={data}
                ref={refNested}
                onCloseEnd={onCloseDetailByScroll}
                onOpenEnd={onOpenEnd}
                // onCloseStart={onCloseDetailByScroll}
                // onOpenStart={() => console.info('onOpenStart')}
                snapPoints={[DEVICE_HEIGHT < 720 ? DEVICE_HEIGHT - 66 : 720 - 48, -100]}
                scrollValue={scrollValue}
                renderContent={renderContent}
                renderHeader={renderHeaderPanner}
            />
        </React.Fragment>
    )
    return <React.Fragment>
        <BackDropView
            spaceTop={_spaceTop}
            _scrollValue={_scrollContainer}
            _isScrollContent={_isScrollContent}
            opacityInterpolate={translateY =>
                interpolate(translateY, {
                    inputRange: [-1, 0, DEVICE_HEIGHT, DEVICE_HEIGHT + 1],
                    outputRange: [0.85, 0.85, 0, 0]
                })
            }
        />

        <NestedScrollView
            ref={refNested}
            _isScrollContent={_isScrollContent}
            _scrollValue={_scrollValue}
            _scrollContainer={_scrollContainer}
            spaceTop={_spaceTop}
            renderHeaderPanner={renderHeaderPanner}
            beginHideCallback={onCloseDetailByScroll}
        >
            <View style={styles.bg} />
            <PortfolioDetail
                navigator={navigator}
                updateActiveStatus={updateActiveStatus}
                showAddToWl={showAddToWl}
                symbol={symbolInfo.symbol}
                exchange={symbolInfo.exchange}
                data={data}
                navigator={navigator}
                onClose={onCloseDetail}
            />
        </NestedScrollView>
    </React.Fragment>
})

const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
        bg: {
            position: 'absolute',
            height: '150%',
            width: '100%',
            paddingTop: 33,
            backgroundColor: CommonStyle.backgroundColor
        }
    });
    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default Detail
