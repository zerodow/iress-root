import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, Dimensions } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Slider from '~/component/Slider/Index.js'
function getStepByMinMax({ minValue, maxValue }) {
    if (!minValue || !maxValue) return 0
    const detal = maxValue - minValue
    if (detal >= 50) {
        return 1
    } else if (detal < 50 && detal >= 1) {
        return 0.1
    } else if (detal < 1 && detal >= 0.01) {
        return 0.01
    } else if (detal < 0.01 && detal >= 0.0001) {
        return 0.0001
    }
    return 0.0001
}
const Padding = 8
const { width: widthDevice } = Dimensions.get('window')
const DragSlider = ({ high, low, initValue, loadingValue, referenceValue, color, extractData }) => {
    return (
        <View style={{
            paddingHorizontal: Padding
        }}>
            <Slider
                referenceValue={referenceValue}
                widthSlider={widthDevice - 2 * Padding}
                initValue={initValue}
                color={color}
                isReset={extractData}
                loadingValue={loadingValue}
                widthSlider={widthDevice - 2 * Padding}
                step={getStepByMinMax({ minValue: low, maxValue: high })}
                {...{ minValue: low, maxValue: high }}
            />
        </View>
    )
}
DragSlider.propTypes = {}
DragSlider.defaultProps = {}
function mapStateToProps(state, { symbol, exchange }) {
    const { marketData } = state.streamMarket;
    const data =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    const { high, low } = data.quote || {}
    return { high, low }
}
export default connect(mapStateToProps)(DragSlider)
