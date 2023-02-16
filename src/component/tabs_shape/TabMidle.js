import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import Svg, {
    Path
} from 'react-native-svg';
const TabMidle = ({ isActive, title, style, tab, ...rest }) => {
    let {
        tabWidth: width = 87,
        tabHeight: height = 31,
        padding = 2,
        grat = 20,
        fillColorDefault = '#4EDFA5',
        fillColorActive,
        styleTextDefault,
        styleTextActive,
        getFillColorActive,
        strockColor = rgb(58, 66, 94),
        strockWidth = '1'
    } = rest;
    if (getFillColorActive) {
        fillColorActive = getFillColorActive(tab.key)
    }
    const { fillColor = '', textStyle = {}, strockColorByActive = strockColor } = useMemo(() => {
        if (!isActive) {
            return {
                textStyle: styleTextDefault,
                fillColor: fillColorDefault,
                strockColorByActive: strockColor
            };
        }
        return {
            fillColor: fillColorActive,
            textStyle: styleTextActive,
            strockColorByActive: fillColorActive
        };
    }, [isActive]);
    const viewBox = `0 0 ${width} ${height}`;
    const d = `m${grat} 0 h${width - grat} l-${grat} ${height} h-${
        width - grat
        } z`;
    return (
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                left: -(grat - padding)
            }}
        >
            <View>
                <Svg height={height} width={width} viewBox={viewBox}>
                    <Path stroke={strockColorByActive} strokeWidth={strockWidth} fill={fillColor} d={d} />
                </Svg>
            </View>
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text
                    style={textStyle}
                >
                    {title}
                </Text>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    tabMidle: {
        width: 100,
        height: 50,
        backgroundColor: 'rgb(23,27,41)',
        borderWidth: 1,
        borderColor: 'rgb(58,66,94)',
        transform: [
            {
                skewX: '-18deg'
            }
        ]
    }
});
TabMidle.propTypes = {}
TabMidle.defaultProps = {}
export default TabMidle
