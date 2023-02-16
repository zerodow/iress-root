import React, { useEffect, useCallback, useMemo, useState, useRef, useImperativeHandle } from 'react'
import {
    View, Text, TouchableOpacity
} from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import CommonStyle from '~/theme/theme_controller'
import Animated, { Easing } from 'react-native-reanimated'
import I18n from '~/modules/language/'
import { usePrevious } from '~/component/custom_hook/'

const {
    Value,
    Clock,
    timing,
    block,
    cond,
    clockRunning,
    set,
    debug,
    startClock,
    stopClock,
    call
} = Animated
export const useRefTabView = () => {
    const refTabView = useRef()
    const changeTab = useCallback(({ item, index }) => {
        refTabView.current && refTabView.current.changeTab && refTabView.current.changeTab({ item, index })
    }, [])
    const setTabActive = useCallback((index) => {
        refTabView.current && refTabView.current.setTabActive && refTabView.current.setTabActive(index)
    }, [])
    return { refTabView, changeTab, setTabActive }
}
const TabView = React.forwardRef((props, ref) => {
    /* #region PROPS & STATE & DIC */
    const {
        tabs,
        activeTab: defaultTabActive,
        wrapperStyle,
        tabStyle,
        textTabStyle,
        onChangeTab,
        onLayout = () => { },
        replaceTextTabStyleDefault = {}
    } = props
    const [tabActive, setTabActive] = useState(defaultTabActive)
    const dic = useRef({
        clockWidth: new Clock(),
        clockTransX: new Clock(),
        dicTabLayout: {},
        timeoutLayout: null,
        timoutChangeTab: null,
        preTab: null,
        currentTab: defaultTabActive
    })
    const preTabActive = usePrevious({ tabActive });
    const widthVal = useMemo(() => {
        return new Value(0)
    }, [])
    const translateXVal = useMemo(() => {
        return new Value(0)
    }, [])
    const widthDes = useMemo(() => {
        return new Value(0)
    }, [])
    const translateXDes = useMemo(() => {
        return new Value(0)
    }, [])
    /* #endregion */
    /* #region STYLE */
    const defaultWrapperStyle = {
        backgroundColor: CommonStyle.color.bg,
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
    const defaultTabStyle = useMemo(() => {
        return {
            height: '100%',
            paddingTop: 8,
            paddingBottom: 12,
            paddingHorizontal: 8
        }
    }, [])
    const defaultTextTabStyle = useMemo(() => {
        return {
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.color.modify
        }
    }, [])
    /* #endregion */
    /* #region FUNCTION */
    const changeTab = useCallback(({ item, index }) => {
        dic.current.preTab = tabActive
        dic.current.currentTab = index
        setTabActive(index)
    }, [tabActive])
    const runBottomLineAnim = useCallback(() => {
        const tabActiveLayout = dic.current.dicTabLayout[tabActive] || {}
        const { x, width } = tabActiveLayout
        if (width > 16) {
            widthDes.setValue(width)
            translateXDes.setValue(x)
        }
    }, [tabActive])
    const runTiming = useCallback((clock, value, dest) => {
        const state = {
            finished: new Value(0),
            position: value,
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: 200,
            toValue: dest,
            easing: Easing.inOut(Easing.ease)
        };

        return block([
            cond(clockRunning(clock), 0, [
                // If the clock isn't running we reset all the animation params and start the clock
                set(state.finished, 0),
                set(state.time, 0),
                set(state.position, value),
                set(state.frameTime, 0),
                set(config.toValue, dest),
                startClock(clock)
            ]),
            // we run the step here that is going to update position
            timing(clock, state, config),
            // if the animation is over we stop the clock
            cond(state.finished, stopClock(clock)),
            // we made the block return the updated position
            state.position
        ]);
    }, [])
    const widthAnim = useMemo(() => {
        return runTiming(dic.current.clockWidth, widthVal, widthDes)
    }, [])
    const translateXAnim = useMemo(() => {
        return runTiming(dic.current.clockTransX, translateXVal, translateXDes)
    }, [])
    const renderTab = useCallback((item, index) => {
        const isDisabled = item.isDisabled
        return <TouchableOpacity
            disabled={isDisabled}
            key={item.label}
            onPress={() => changeTab({ item, index })}
            onLayout={(event) => onLayoutTab({ event, index })}
            style={[defaultTabStyle, tabStyle]}>
            {
                isDisabled ? <Text style={[defaultTextTabStyle, textTabStyle, tabActive === index
                    ? {
                        fontFamily: CommonStyle.fontPoppinsBold
                    }
                    : {
                        color: CommonStyle.fontColor,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        opacity: 0.7
                    }, { color: CommonStyle.fontNearLight6 }]}>
                    {I18n.t(item.label)}
                </Text> : <Text style={[defaultTextTabStyle, textTabStyle, tabActive === index
                    ? {
                        fontFamily: CommonStyle.fontPoppinsBold
                    }
                    : {
                        color: CommonStyle.fontColor,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        opacity: 0.7
                    }, tabActive === index ? {} : replaceTextTabStyleDefault]}>
                        {I18n.t(item.label)}
                    </Text>
            }

        </TouchableOpacity>
    }, [tabActive])
    const renderBottomLine = useCallback(() => {
        return <Animated.View style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: widthAnim,
            height: 5,
            borderRadius: 8,
            transform: [{
                translateX: translateXAnim
            }],
            backgroundColor: CommonStyle.color.modify
        }} />
    }, [tabActive])
    /* #endregion */
    /* #region MEASURE */
    const onLayoutTab = useCallback(({ event, index }) => {
        const { layout } = event.nativeEvent
        dic.current.dicTabLayout[index] = layout
        dic.current.timeoutLayout && clearTimeout(dic.current.timeoutLayout)
        dic.current.timeoutLayout = setTimeout(runBottomLineAnim, 100)
    }, [tabActive])
    /* #endregion */

    useEffect(() => {
        if (preTabActive && preTabActive.tabActive !== tabActive) {
            runBottomLineAnim()
            dic.current.timoutChangeTab && clearTimeout(dic.current.timoutChangeTab)
            dic.current.timoutChangeTab = setTimeout(() => {
                onChangeTab(tabActive, dic.current.preTab, dic.current.currentTab)
            }, 0)
        }
    }, [tabActive])
    useImperativeHandle(ref, () => ({
        changeTab,
        setTabActive
    }))
    return <View
        onLayout={onLayout}
        style={[defaultWrapperStyle, wrapperStyle]}>
        {
            tabs.map((item, index) => {
                return renderTab(item, index)
            })
        }
        {renderBottomLine()}
    </View>
})

export default TabView
