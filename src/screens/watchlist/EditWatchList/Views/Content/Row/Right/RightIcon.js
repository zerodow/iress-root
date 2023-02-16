import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import SvgIcon from '~/component/svg_icon/SvgIcon.js'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo'

import IconGoToTop from '~/img/icon/noun_uploads.png'
import CommonStyle from '~/theme/theme_controller'
const ButtonGoToTop = ({ onPress }) => {
    return (
        <TouchableOpacity hitSlop={{
            top: 16, left: 16, right: 16, bottom: 16
        }} onPress={onPress}>
            <CommonStyle.icons.iconGoToTop style={{
                width: 15,
                height: 15,
                marginRight: 16
            }} width={15} height={15} />
        </TouchableOpacity>
    )
    return (
        <Ionicons onPress={onPress} style={{
            marginRight: 16
        }} name={'md-checkmark'} size={15} color={CommonStyle.fontColor} />
    )
}
const ButtonDrag = () => {
    return (
        <Entypo name={'menu'} size={15} color={CommonStyle.fontColor} />
    )
}
// Example keyTop = ASX#A2M preKey = ASX#XJO
const shoulRenderUpdate = (pre, next) => {
    if (next.keyTopIndex === next.item.key) {
        return false
    } else if (next.preTopIndex === next.item.key) {
        return false
    } else {
        return true
    }
}
const RightIconMemo = React.memo(({ dragGoToTop, item, index, keyTopIndex, preTopIndex }) => {
    const handleGoToTop = useCallback(() => {
        dragGoToTop && dragGoToTop({ item, index, isActive: false })
    })
    return (
        <View style={{
            flexDirection: 'row'
        }}>
            {`${item['exchange']}#${item['symbol']}` !== keyTopIndex && <ButtonGoToTop {...{ item, index, keyTopIndex }} onPress={handleGoToTop} />}
            <ButtonDrag />
        </View>
    )
}, shoulRenderUpdate)
const RightIcon = ({ dragGoToTop, item, index }) => {
    const { keyTopIndex, preTopIndex } = useSelector(state => ({
        keyTopIndex: state.editWatchlist.keyTopIndex,
        preTopIndex: state.editWatchlist.preTopIndex
    }))

    return <RightIconMemo
        {...{ dragGoToTop, item, index, keyTopIndex, preTopIndex }}
    />
}
RightIcon.propTypes = {}
RightIcon.defaultProps = {}
export default RightIcon
