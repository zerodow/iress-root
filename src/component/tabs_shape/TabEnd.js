import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import Svg, {
    Path
} from 'react-native-svg';
const TabEnd = ({ isActive, style, title, tabLength, tab, ...rest }) => {
    let {
        tabWidth: width = 87,
        tabHeight: height = 31,
        padding = 2,
        grat = 20,
        fillColorDefault = '#4EDFA5',
        fillColorActive,
        radius = 4,
        styleTextDefault,
        styleTextActive,
        getFillColorActive,
        fillColorDisabled,
        strockColor = rgb(58, 66, 94),
        strockWidth = '1'
    } = rest;
    if (getFillColorActive) {
        fillColorActive = getFillColorActive(tab.key)
    }
    const { forceFillColor = null, disabled } = tab
    const { fillColor = '', textStyle = {}, strockColorByActive = strockColor } = useMemo(() => {
        if (!isActive) {
            return {
                textStyle: styleTextDefault,
                fillColor: fillColorDefault,
                strockColorByActive: strockColor
            };
        }
        return {
            fillColor: forceFillColor || fillColorActive,
            textStyle: styleTextActive,
            strockColorByActive: forceFillColor || fillColorActive
        };
    }, [isActive]);

    const viewBox = `0 0 ${width} ${height}`;
    const d = `M${grat} 0h${
        width - grat - radius
        }q${radius} 0 ${radius},${radius}v${
        height - radius * 2
        }q0 ${radius} -${radius},${radius}H0z`;
    return (
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                left: tabLength > 2 ? -(grat - padding) * 2 : -(grat - padding)
            }}
        >
            <View>
                <Svg height={height} width={width} viewBox={viewBox}>
                    <Path stroke={strockColorByActive}
                        strokeWidth={strockWidth} fill={disabled ? fillColorDisabled : fillColor} d={d} />
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
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
            >
                {isActive ? tab.iconActive : tab.iconDefault}
                <Text style={[{ marginLeft: tab.iconActive ? 8 : 0 }, textStyle]} >
                    {title}
                </Text>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    tabEnd: {
        zIndex: 99,
        width: 100,
        height: 0,
        borderBottomWidth: 50,
        borderBottomColor: 'rgb(58,66,94)',
        borderLeftWidth: 10,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'rgb(58,66,94)',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        transform: [{ rotate: '0deg' }]
    }
});
TabEnd.propTypes = {}
TabEnd.defaultProps = {}
export default TabEnd
