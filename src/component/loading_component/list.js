import React, { useMemo, useCallback, useEffect, useImperativeHandle } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import { useSelector, shallowEqual } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import { getAniStyles, getAnimationType } from '~s/watchlist/Categories/Controller/AnimationController'

const { height: DEVICE_HEIGHT } = Dimensions.get('window')
const {
    Value,
    Code,
    timing,
    cond,
    eq,
    set,
    startClock,
    stopClock,
    block,
    call,
    Clock
} = Animated

const STATE = {
    UNDETERMINE: 0,
    BEGIN: 1,
    ACTIVE: 2,
    END: 3,
    CANCELLED: 4
}

const dataLoading = [0, 1, 2, 3, 4, 5, 6]

const Row = ({ item, index, animStyles }) => {
    return <Animated.View style={[{
        height: 72,
        backgroundColor: CommonStyle.color.dark,
        marginHorizontal: 8,
        marginTop: 8,
        borderRadius: 8
    }, animStyles]}>

    </Animated.View>
}

const AnimationComp = React.memo(({ withTimingBlock }) => {
    return <Code exec={withTimingBlock} />
}, () => true)

let LoadingList = ({ translateY, duration, scrollEnabled, rowLoadingComp }, ref) => {
    const RowComp = rowLoadingComp || Row
    const animationType = useSelector(state => state.loadingList.animationType, shallowEqual)
    const animState = useMemo(() => {
        return new Value(STATE.UNDETERMINE)
    }, [])
    const clock = useMemo(() => {
        return new Clock()
    }, [])
    const timingValue = useMemo(() => {
        return new Value(0)
    }, [])
    useImperativeHandle(ref, () => {
        return {
            start,
            stop
        }
    })
    const runTiming = useCallback((clock, value, dest) => {
        const state = {
            finished: new Value(0),
            position: value,
            time: new Value(0),
            frameTime: new Value(0)
        };

        const config = {
            duration: new Value(dest),
            toValue: new Value(dest),
            easing: Easing.inOut(Easing.ease)
        };

        return block([
            cond(eq(animState, STATE.BEGIN),
                [
                    set(animState, STATE.ACTIVE),
                    set(state.finished, 0),
                    set(state.time, 0),
                    set(state.frameTime, 0),
                    set(state.position, 0),
                    set(config.toValue, dest),
                    startClock(clock)
                ]
            ),
            cond(eq(animState, STATE.CANCELLED), [
                stopClock(clock),
                set(state.time, 0), // Phải có nếu không thì stopClock rồi ko trigger nữa
                set(state.frameTime, 0), // Phải có nếu không thì stopClock rồi ko trigger nữa
                set(value, 0)
            ]),
            // we run the step here that is going to update position
            timing(clock, state, config),
            // if the animation is over we stop the clock
            cond(state.finished, [
                stopClock(clock),
                set(animState, STATE.END)
            ]),
            set(value, state.position),
            // // we made the block return the updated position
            state.position
        ]);
    }, [])
    const start = useCallback(() => {
        translateY.setValue(0)
        animState.setValue(STATE.BEGIN)
    }, [])
    const stop = useCallback(() => {
        translateY.setValue(DEVICE_HEIGHT * 1.3)
        animState.setValue(STATE.CANCELLED)
    }, [])
    return <View style={{ flex: 1 }}>
        <AnimationComp withTimingBlock={runTiming(clock, timingValue, duration)} />
        <ScrollView
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}>
            <View onStartShouldSetResponder={() => true}>
                {
                    dataLoading.map((item, index) => {
                        const options = {
                            duration,
                            numberListDelay: 0, // after number list start ani
                            itemDuration: duration / 6,
                            itemDelay: 50
                        }
                        const animStyles = getAniStyles(timingValue, animationType, index, options)
                        return <RowComp
                            item={item}
                            index={index}
                            animStyles={animStyles} />
                    })
                }
                <View style={{ height: 88 + 8 }} />
            </View>
        </ScrollView>
    </View>
}
LoadingList = React.forwardRef(LoadingList)
LoadingList = React.memo(LoadingList, () => true)
LoadingList.defaultProps = {
    duration: 1000
}
export default LoadingList
