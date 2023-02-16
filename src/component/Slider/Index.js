import React, { useMemo, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types'
import { Text, View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { isNumber } from 'lodash'

import CommonStyle, { register } from '~/theme/theme_controller'

import IconCustom from '~/component/svg_icon/SvgIcon.js'
import BoxLoading from '~/component/BoxLoading/BoxLoading.js'
import Cursor from './Cursor'

const {
    Value,
    round,
    divide,
    concat,
    add,
    cond,
    eq,
    floor,
    lessThan,
    modulo,
    set,
    useCode,
    multiply,
    call,
    block
} = Animated;

const { width: widthDevice } = Dimensions.get('window')

function getInitValue({ initValue = 0, minValue, pointSize, step }) {
    if (initValue < minValue) {
        return 0
    }
    return (initValue - minValue) * pointSize / step
}
//
function useInitValue({ minValue, maxValue, widthRange, initValue = 0 }) {
    const step = getStepByMinMax({ minValue, maxValue })
    const points = Math.floor(((maxValue - minValue) / step)) + 1
    const pointSize = widthRange / (points - 1)
    const snapPoints = new Array(points).fill(0).map((e, i) => {
        return {
            x: i * pointSize
        }
    })
    const initTranslateX = getInitValue({ initValue, minValue, pointSize, step })
    const translateX = new Animated.Value(initTranslateX)

    return useMemo(() => {
        return {
            stepAnimated: new Value(0),
            initPoint: {
                x: initTranslateX
            },
            translateX,
            snapPoints,
            index: add(multiply(round(divide(translateX, pointSize)), step), minValue),
            pointSize
        }
    }, [])
}
const CONSTANTS = {
    PADDING: 16,
    KNOB: {
        WIDTH: 25,
        HEIGHT: 20
    }
}
const Index = ({
    minValue,
    maxValue,
    initValue = 0,
    step = 0,
    referenceValue,
    color = 'red',
    widthSlider,
    loadingValue,
    isReset,
    animatedValue,
    cursor = { width: 25, height: 20 }
}) => {
    if (minValue === undefined || maxValue === undefined || !isNumber(minValue) || !isNumber(maxValue) || (minValue === 0 && maxValue === 0) || minValue >= maxValue) {
        return (
            <React.Fragment>
                <View style={{ backgroundColor: CommonStyle.fontNearLight7, width: widthDevice - 8 * 2, height: 4, alignSelf: 'center' }}>
                    <View style={[
                        {
                            height: 20,
                            width: 25,
                            borderRadius: 100,
                            backgroundColor: 'yellow',
                            position: 'absolute',
                            top: -8

                        }
                    ]} >
                        <IconCustom color={CommonStyle.fontBorder} name={'dragSlider'} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <BoxLoading style={{ alignSelf: 'flex-start' }} renderChildren={() => {
                        return (
                            <Text style={{ fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{'--'}</Text>
                        )
                    }} animatedValue={loadingValue} extraData={[minValue]} />
                    <BoxLoading style={{ alignSelf: 'flex-end' }} renderChildren={() => {
                        return (
                            <Text style={{ fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{'--'}</Text>
                        )
                    }} animatedValue={loadingValue} extraData={[maxValue]} />
                </View>
            </React.Fragment>
        )
    }
    return (
        <View>
            <Animated.View style={{ backgroundColor: CommonStyle.fontNearLight7, width: widthSlider, height: 4, alignSelf: 'center' }}>
                <Cursor key={'Cursor#color'} color={color} {...{ maxValue, minValue, animatedValue, widthRange: widthSlider - cursor.width, referenceValue, step, initValue, isReset }} />
            </Animated.View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <BoxLoading style={{ alignSelf: 'flex-start' }} renderChildren={() => {
                    return (
                        <Text style={{ fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{minValue}</Text>
                    )
                }} animatedValue={loadingValue} extraData={[minValue]} />
                <BoxLoading style={{ alignSelf: 'flex-end' }} renderChildren={() => {
                    return (
                        <Text style={{ fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{maxValue}</Text>
                    )
                }} animatedValue={loadingValue} extraData={[maxValue]} />

            </View>
        </View>
    )
};
Index.propTypes = {
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    initValue: PropTypes.number,
    step: PropTypes.number,
    referenceValue: PropTypes.object,
    color: PropTypes.string,
    widthSlider: PropTypes.number,
    loadingValue: PropTypes.object,
    isReset: PropTypes.string,
    animatedValue: PropTypes.object
};
Index.defaultProps = {}
export default Index;
