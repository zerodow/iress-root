import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import PropTypes from 'prop-types'
import Row from '~/screens/new_order/View/Content/Depth/DepthAdvance/components/Row.js'
import * as TabModel from '~/screens/new_order/Model/TabModel.js'
const BidChart = ({ data, disabled }) => {
    const renderItem = useCallback(({ item, index }) => {
        return <Row disabled={disabled} item={item} type='bid' />
    }, [])
    const keyExtractor = useCallback((item, index) => {
        return index
    }, [])
    const renderItemSeparatorComponent = useCallback(() => {
        return <View style={{ height: 1 }} />
    }, [])
    const handleOnLayout = useCallback((e) => {
        TabModel.setHeightDepthRow(e.nativeEvent.layout.height / 10)
        TabModel.model.translateContent && TabModel.model.translateContent()
        console.info('setHeightDepthRow', e.nativeEvent.layout.height, e.nativeEvent.layout.height / 10)
    }, [])
    return (
        <FlatList
            onLayout={handleOnLayout}
            ItemSeparatorComponent={renderItemSeparatorComponent}
            scrollEnabled={false}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            data={data}
            style={{
                marginRight: 8
            }}
        />
    )
}
BidChart.propTypes = {}
BidChart.defaultProps = {}
const styles = StyleSheet.create({})
export default BidChart
