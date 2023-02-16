import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/Ionicons';

import { formatNumberNew2 } from '~/lib/base/functionUtil'
import { getColorByValue } from '~/business'
import Enum from '~/enum'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
function getIconArrow(colorFlag) {
    let iconContent = null
    if (colorFlag || colorFlag === 0) {
        if (+colorFlag >= 0) {
            iconContent = (
                <CommonStyle.icons.arrowUp
                    name="md-arrow-dropup"
                    size={6}
                    color={CommonStyle.upColor}
                    style={[
                        CommonStyle.iconPickerUp,
                        {
                            color: CommonStyle.upColor,
                            marginHorizontal: 4,
                            alignSelf: 'center'
                        }
                    ]}
                />
            );
        } else {
            iconContent = (
                <CommonStyle.icons.arrowDown
                    name="md-arrow-dropdown"
                    size={6}
                    color={CommonStyle.downColor}
                    style={[
                        CommonStyle.iconPickerDown,
                        {
                            color: CommonStyle.downColor,
                            marginHorizontal: 4,
                            alignSelf: 'center'
                        }
                    ]}
                />
            );
        }
    }
    return iconContent
}

const Index = ({ value, colorFlagValue }) => {
    const { displayValue, color, icon } = useMemo(() => {
        return {
            displayValue: `${formatNumberNew2(value, Enum.PRICE_DECIMAL.PERCENT)}%`,
            color: getColorByValue(colorFlagValue),
            icon: getIconArrow(colorFlagValue)
        }
    }, [value, colorFlagValue])

    return (
        <View style={{
            flexDirection: 'row'
        }}>
            {value && value !== 0 ? icon : <View style={{ width: 4 }} />}
            <Text style={[
                styles.textStyle,
                {
                    color
                }
            ]}>
                {displayValue}
            </Text>
        </View>
    )
}
Index.propTypes = {}
Index.defaultProps = {}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    textStyle: {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeS
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default Index
