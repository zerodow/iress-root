import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux'
import Left from './Left'
import Right from './Right/Right'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'

import { updateDataSelected } from '~/screens/watchlist/EditWatchList/Redux/actions.js'
export const Index = React.memo(({ item, index, dragGoToTop, onDrag }) => {
    const key = useMemo(() => {
        return `${item.exchange}#${item.symbol}`
    }, [item])
    const refView = useRef()

    const dispatch = useDispatch()
    const dataSelected = useSelector(state => state.editWatchlist.dataSelected)
    const dic = useRef({
        dataSelected
    })
    const [isSelected, updateSelected] = useState(!!dataSelected[key])

    const { symbol, exchange } = item

    const handleOnPress = useCallback(() => {
        const key = `${exchange}#${symbol}`
        let tmp = { ...dic.current.dataSelected }
        tmp[key] = !isSelected
        // update state to redux
        dispatch(updateDataSelected(tmp))
        dic.current.dataSelected = tmp
        // update state local row
        updateSelected(!isSelected)
    }, [isSelected])

    const handleDragGoToTop = useCallback(() => {
        dragGoToTop && dragGoToTop()
        // refView.current && refView.current.measure((x, y, width, height, pageX, pageY) => {

        // })
    }, [])
    useEffect(() => {
        dic.current.dataSelected = dataSelected
    }, [dataSelected])
    return useMemo(() => {
        return (
            <TouchableOpacity style={{
                flex: 1,
                width: '100%'
            }}
                onLongPress={onDrag}
                onPress={handleOnPress}>
                <View
                    collapsable={false}
                    ref={refView} style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: CommonStyle.backgroundColor,
                        flex: 1
                    }}>
                    <Left isSelected={isSelected} exchange={exchange} symbol={symbol} />
                    <Right
                        index={index}
                        item={item}
                        dragGoToTop={handleDragGoToTop}
                        exchange={exchange}
                        symbol={symbol} />
                </View>
            </TouchableOpacity>
        )
    }, [symbol, exchange, isSelected])
}, (pre, next) => pre.item.symbol === next.item.symbol && pre.item.exchange === next.item.exchange && next.isActive === pre.isActive)
Index.propTypes = {}
Index.defaultProps = {}

export default Index
