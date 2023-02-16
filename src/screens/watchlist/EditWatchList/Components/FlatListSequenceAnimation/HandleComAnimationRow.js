import React, { PureComponent, Component, useCallback, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
import DraggableFlatList from 'react-native-draggable-flatlist';
import { SquenceView } from '~/screens/watchlist/EditWatchList/Components/FlatListSequenceAnimation/index.js'

import { timing } from '~/lib/redash/index.js'
import { State } from 'react-native-gesture-handler'
export const TYPE_ANIMATION = {
    'FADE_IN': 'FADE_IN',
    'FADE_OUT': 'FADE_OUT',
    'SLIDE_IN_LEFT': 'SLIDE_IN_LEFT',
    'SLIDE_IN_RIGHT': 'SLIDE_IN_RIGHT'
}

const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
const { Extrapolate, block, eq, cond, set, clockRunning, stopClock, Value, not, Clock, call, and, sub } = Animated
export default ({ duration = 1000, progressValue = new Value(0) }) => {
    const { stateAni, clock, needReset } = useMemo(() => {
        return {
            stateAni: new Value(State.UNDETERMINED),
            needReset: new Value(0),
            clock: new Clock()
        }
    }, [])
    useEffect(() => {
        stateAni.setValue(State.ACTIVE)
    }, [])
    return <PureFunction>
        <Animated.Code exec={block([
            cond(not(clockRunning(clock)), [

            ], [
                cond(eq(needReset, 1), [
                    set(needReset, 0),
                    stopClock(clock)
                ], [])
            ]),
            cond(eq(stateAni, State.ACTIVE), [
                set(progressValue, timing({
                    clock: clock,
                    from: 0,
                    to: 1000,
                    duration: 1000
                })),
                cond(eq(progressValue, 1000), [set(stateAni, State.UNDETERMINED)])
            ]),
            call([progressValue], ([a]) => { })
        ])} />
    </PureFunction>
}
const PureFunction = React.memo(({
    children
}) => {
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}, () => true)
