import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect, useRef } from 'react'
import { View, Text, Animated, Easing, Platform } from 'react-native'
import PropTypes from 'prop-types'
import ReAnimated from 'react-native-reanimated'
// View
import SymbolInfo from './SymbolInfo'
import AccountManage from '~/screens/new_order/View/Content/AccountManage.js'
import LotsizeManage from '~/screens/new_order/View/Content/LotsizeManage'
import TouchableDismissKeyboard from '~/component/virtual_keyboard/TouchableDismissKeyboard.js'
import LayoutContent from '~/screens/new_order/View/Content/Layout/LayoutContent.js'
import TabsLayout from '~/screens/new_order/View/Content/Layout/TabLayout.js'
import SpacePushContent from '~/component/virtual_keyboard/SpacePushContent.js'

import { useShadow } from '~/component/shadow/SvgShadow'

import HandleGetOrderAttribute from '~/screens/new_order/HandleOrderAttributes.js'

import CommonStyle from '~/theme/theme_controller'
import * as Business from '~/business';
import Enum from '~/enum'
import { useSelector } from 'react-redux'
const { cond, greaterOrEq, lessThan, block, call, multiply, useCode } = ReAnimated
const Comp = ({ index, animatedValue = new Animated.Value(0), children }) => {
    const [isShow, setShow] = useState(false)
    const dic = useRef({ init: true })
    useLayoutEffect(() => {
        animatedValue.addListener(({ value }) => {
            // console.info('DCM animatedValue', value)
            if (value >= index * 100 && dic.current.init) {
                dic.current.init = false
                setShow(true)
            }
        })
    }, [])
    if (!isShow) return null
    return children
}
const A = ({
    params, children
}) => children;

const ShadowPrice = ({ children }) => {
    const layout = useSelector(state => state.newOrder.layout)
    if (layout === Enum.ORDER_LAYOUT.BASIC) return null
    return children
}
const Content = React.memo(({ symbol, exchange, navigator, showSearchAccount }) => {
    const { animatedValue } = useMemo(() => {
        return {
            animatedValue: new Animated.Value(0)
        }
    }, [])
    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 500,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
        })
    }, [])
    const [ShadowRowInfoPrice, onLayout] = useShadow()
    return (
        <TouchableDismissKeyboard>
            <View>
                <HandleGetOrderAttribute {...{ symbol, exchange }} />
                <SpacePushContent>
                    <View style={{
                        backgroundColor: CommonStyle.backgroundColor
                    }}>
                        <View style={{
                            paddingTop: 8,
                            backgroundColor: CommonStyle.backgroundColor
                        }}>
                            <AccountManage {...{ symbol, exchange, showSearchAccount }} />
                        </View>
                        <View>
                            <ShadowPrice>
                                <ShadowRowInfoPrice />
                            </ShadowPrice>
                            <View onLayout={onLayout} style={{
                                flexDirection: 'row',
                                paddingTop: 8,
                                paddingHorizontal: 16
                            }}>
                                <SymbolInfo {...{ symbol, exchange, navigator }} />
                                <TabsLayout {...{ symbol, exchange }} />
                            </View>
                        </View>
                    </View>
                    <LayoutContent {...{ symbol, exchange }} />
                    <View style={{
                        height: Platform.OS === 'android' ? 68 + 16 : 72 + 16 // height button + padding
                    }} />
                </SpacePushContent>
            </View>
        </TouchableDismissKeyboard>
    )
}, (pre, next) => pre.symbol === next.symbol && pre.exchange === next.exchange)
Content.propTypes = {}
Content.defaultProps = {}
export default Content
