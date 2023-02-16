import React, { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react'
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State, FlatList } from 'react-native-gesture-handler'

const { Value, eq, set, call, onChange, block, useCode, cond, add, divide, round, diff, greaterThan, greaterOrEq, lessThan, multiply, sub, and, or, abs, lessOrEq, floor } = Animated

export const useInitData = () => useMemo(() => {
    return [
        new Value(0),
        new Value(-1),
        new Value(-1),
        new Value(0)
    ]
}, [])
export const useInitGestureValue = () => useMemo(() => {
    return [
        new Value(State.UNDETERMINED),
        new Value(0),
        new Value(0),
        new Value(0),
        new Value(0),
        new Value(0),
        new Value(0)
    ]
}, [])
export const useInitCellData = ({ data, keyExtractor, heightRow }) => useMemo(() => {
    const cellData = new Map()
    data.forEach((element, index) => {
        const offsetY = new Value(index * heightRow)
        const key = keyExtractor(element, index)
        cellData.set(key, { offsetY, currentIndex: index })
    });
    return [cellData]
}, [data, heightRow])
export const useViewabilityConfig = () => useMemo(() => ({
    viewAreaCoveragePercentThreshold: 1
}), [])
