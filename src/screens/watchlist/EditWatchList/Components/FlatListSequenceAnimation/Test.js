import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import PropTypes from 'prop-types'
import SortableList from '~/component/sort_able/index'
import RowSymbol from '~/screens/watchlist/EditWatchList/Views/Content/Row/Index.js'
import { SquenceView, TYPE_ANIMATION } from '~/screens/watchlist/EditWatchList/Components/FlatListSequenceAnimation/index.js'
import HandleAnimation from '~/screens/watchlist/EditWatchList/Components/FlatListSequenceAnimation/HandleComAnimationRow.js'
import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js'

import { useDispatch } from 'react-redux'
import { updateKeyTopIndex as updateTopIndex, updateListSymbol } from '~/screens/watchlist/EditWatchList/Redux/actions.js'
import { TouchableOpacity } from 'react-native-gesture-handler'
const { Extrapolate, block, eq, cond, set, clockRunning, stopClock, Value, not, Clock, call, and, sub } = Animated

const Test = ({
    data = []
}) => {
    const dispatch = useDispatch()

    const { progressValue } = useMemo(() => {
        return {
            progressValue: new Value(0)
        }
    }, [])
    const keyExtractor = (item, index) => {
        return `${item.exchange}#${item.symbol}`
    }

    const handleUpdateTopIndex = useCallback(({ newData = [], keyTopIndex }) => {
        PriceBoardModel.setListSymbol(newData)
        dispatch(updateTopIndex({ keyTopIndex, listSymbol: newData }))
    }, [])
    const handleDragEnd = useCallback((listSymbol) => {
        PriceBoardModel.setListSymbol(listSymbol)
        dispatch(updateListSymbol(listSymbol))
    }, [])
    const extraData = PriceBoardModel.getPriceBoardCurrentPriceBoard().value.map(el => (
        {
            ...el,
            key: keyExtractor(el)
        }
    ))
    return useMemo(() => {
        const renderItem = ({ item, index, isHover, onDrag, dragGoToTop }) => {
            const WrapperComp = index <= 10 ? isHover ? View : SquenceView : View
            return (
                <WrapperComp
                    style={{
                        flex: 1,
                        width: '100%'
                    }}
                    progressValue={progressValue}
                    type={TYPE_ANIMATION.FADE_IN}
                    index={index}
                    totalCountData={10}
                >
                    <RowSymbol
                        dragGoToTop={dragGoToTop}
                        onDrag={onDrag}
                        index={index}
                        item={item}
                    />
                </WrapperComp>
            )
        }

        return <View style={{
            flex: 1
        }}>
            <SortableList
                data={extraData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onChangeKeyTopIndex={handleUpdateTopIndex}
                onDragEnd={handleDragEnd}
            />
            <HandleAnimation progressValue={progressValue} />
        </View>
    }, [data])
}
Test.propTypes = {}
Test.defaultProps = {}
export default Test
