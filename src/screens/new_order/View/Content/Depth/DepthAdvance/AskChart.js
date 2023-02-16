import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import PropTypes from 'prop-types'
import Row from '~/screens/new_order/View/Content/Depth/DepthAdvance/components/Row.js'
const AskChart = ({ data = [], disabled }) => {
    const renderItem = useCallback(({ item, index }) => {
        return <Row disabled={disabled} item={item} type='ask' />
    }, [])
    const keyExtractor = useCallback((item, index) => {
        return index
    }, [])
    const renderItemSeparatorComponent = useCallback(() => {
        return <View style={{ height: 1 }} />
    }, [])
    return (
        <FlatList
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
AskChart.propTypes = {}
AskChart.defaultProps = {}
const styles = StyleSheet.create({})
export default AskChart
