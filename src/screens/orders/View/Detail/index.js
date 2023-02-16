import React, { useMemo, useState, useCallback, useRef, useImperativeHandle, useEffect } from 'react'
import {
    View, Text, Dimensions, StyleSheet
} from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import BackDropView from '~s/watchlist/Component/BackDropView2';
import BottomSheet from '~/component/bottom_sheet_reanimated/index.js'
import OrdersDetail from './OrdersDetail';
import HeaderPanner from '~s/watchlist/Detail/components/HeaderPanner';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { useShadow } from '~/component/shadow/SvgShadow';
import { usePaddingTop, useSpaceTop, useCheckPanelStatus } from '~s/portfolio/Hook/'
import { getDataRealtimeByKey } from '~s/orders/Model/OrdersStreaming'
import { changeSyncDataStatus } from '~s/orders/Redux/actions'
import * as Emitter from '@lib/vietnam-emitter'
import * as Channel from '~/streaming/channel'
import { getMarginTopDevice } from '~/lib/base/functionUtil';
import { FakeView, useRefFakeView } from '~/screens/portfolio/View/AddToWL/index.js'
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const marginTopPanel = getMarginTopDevice() + 32
const {
    interpolate,
    Value
} = Animated
const Detail = React.forwardRef(({
    updateActiveStatus,
    navigator,
    showHideTabbar
}, ref) => {
    const [ShadowHeaderPanner, onLayout] = useShadow()
    // const panelPaddingTop = usePaddingTop()
    const panelPaddingTop = 88
    const [_spaceTop, setSpaceTop] = useSpaceTop(panelPaddingTop)
    const _scrollValue = useMemo(() => new Value(0), [])
    const _scrollContainer = useMemo(() => new Value(DEVICE_HEIGHT * 1.3), [])
    const scrollValue = useMemo(() => new Value(0), [])
    const _isScrollContent = useMemo(() => new Value(0), [])

    const [data, setData] = useState({})
    const dispatch = useDispatch()
    const refNested = useRef({
        orderID: null,
        isShow: false
    })
    const { refFakeView, show, hide } = useRefFakeView()
    const changeOrderDetail = useCallback((data = {}) => {
        refNested.current.isShow = true
        refNested.current && refNested.current.show && refNested.current.show()
        setTimeout(() => {
            refNested.current.orderID = data.order_id
            setData(data)
        }, 10);
    }, [])
    const updateDataRealtime = useCallback(() => {

    }, [])
    useImperativeHandle(ref, () => {
        return {
            updateDataRealtime,
            changeOrderDetail,
            onCloseDetail,
            setSpaceTop
        }
    })
    const renderHeaderPanner = useCallback(() => {
        const title = `${I18n.t('orderIdLabel')}: ${data.order_id}`
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22
                }}
            >
                <ShadowHeaderPanner />
                <HeaderPanner
                    title={title}
                    styleContent={{ borderBottomWidth: 0 }}
                    onLayout={onLayout}
                    onClose={onCloseDetail}
                    onRefresh={onRefresh}
                />
            </View>
        );
    }, [data.order_id])
    const onCloseDetailByScroll = useCallback(() => {
        refNested.current.isShow = false
        showHideTabbar && showHideTabbar(1)
        hide()
    }, [])
    const onCloseDetail = useCallback(() => {
        try {
            refNested.current && refNested.current.hide && refNested.current.hide()
            refNested.current.isShow = false
            showHideTabbar && showHideTabbar(1)
        } catch (error) {

        }
    }, [])
    const onRefresh = useCallback(() => {

    }, [])
    const onOpenEnd = () => {
        show()
    }
    useEffect(() => {
        const channel = Channel.getChannelUpdateOrderDetail()
        const emitterUpdateRealtimeOrderDetail = Emitter.addListener(channel, null, () => {
            console.log('ORDER DETAIL REALTIME')
            if (refNested.current && refNested.current.isShow) {
                const data = getDataRealtimeByKey({ key: refNested.current.orderID })
                if (!data) return
                setData(data)
            }
        })
        return () => {
            Emitter.deleteListener(channel, emitterUpdateRealtimeOrderDetail) // Neu minh khong unSub thi tai cac listenerFunc đã đăng kí nhưng orderDetail bị unmount thì refNested=  null
        }
    }, [])
    const renderContent = useCallback(() => {
        return <OrdersDetail
            updateActiveStatus={updateActiveStatus}
            data={data}
            navigator={navigator}
            onClose={onCloseDetail}
        />
    }, [data])
    return (
        <React.Fragment>
            <FakeView ref={refFakeView} />
            <BottomSheet
                keyExtractor={data}
                ref={refNested}
                onCloseEnd={onCloseDetailByScroll}
                onOpenEnd={onOpenEnd}
                // onCloseStart={onCloseDetailByScroll}
                // onOpenStart={() => console.info('onOpenStart')}
                snapPoints={[DEVICE_HEIGHT - marginTopPanel, -100]}
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
            <OrdersDetail
                updateActiveStatus={updateActiveStatus}
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
