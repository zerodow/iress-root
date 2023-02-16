import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, FlatList, LayoutAnimation, Platform, UIManager, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import {
    ReText,
    clamp,
    onGestureEvent,
    snapPoint,
    timing
} from '../../libs/redash';
const { Value, eq, set } = Animated
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const exampleData = [...Array(800)].map((d, index) => ({
    key: `item-${index}`, // For example only -- don't use index as your key!
    label: index,
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index *
        5}, ${132})`
}));
const Test = () => {
    const [data, setData] = useState(exampleData)
    const [state, translationX] = useMemo(() => {
        return [
            new Value(State.UNDETERMINED),
            new Value(0)
        ]
    }, [])
    const gestureHandler = onGestureEvent({ state, translationX }, []);
    const tron = useCallback(() => {
        const indexStart = 4
        const indexEnd = 5
        const left = data.slice(0, indexStart - 1)
        const mid = data.slice(indexStart, indexEnd - 1)
        const end = data.slice(indexEnd, exampleData.length)
        const itemTop = data[indexStart - 1]
        const itemBottom = data[indexEnd - 1]
        console.info('left,mid,itemTop', itemTop, itemBottom, left, mid, end)
        const newData = [...left, itemBottom, ...mid, itemTop, ...end]
        console.info('new Date', newData)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear)
        setData(newData)
    }, [data])
    const renderItem = useCallback(({ item, index }) => {
        return (
            <TouchableOpacity onPress={tron} style={{
                height: 100,
                marginTop: 16,
                width: '100%',
                backgroundColor: index % 2 ? 'red' : 'blue'
            }}>
                <Text>{item.label}</Text>
            </TouchableOpacity>
        )
    }, [data])
    return (
        <PanGestureHandler
            {...gestureHandler}
        >
            <View style={{
                flex: 1,
                borderWidth: 1,
                borderColor: 'red'
            }}>
                <AnimatedFlatList
                    data={data}
                    renderItem={renderItem}
                />
            </View>
        </PanGestureHandler>

    )
}
Test.propTypes = {}
Test.defaultProps = {}
export default Test
