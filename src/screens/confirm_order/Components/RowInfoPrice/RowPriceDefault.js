import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '~/modules/language/'
const RowPriceDefault = ({ title, value, renderValue }) => {
    return (
        <View style={[styles.row]}>
            <View style={{ flex: 7 }}>
                <Text style={[styles.title]}>{title}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: CommonStyle.fontBorder }} />
            <View style={{ flex: 3, alignItems: 'flex-end' }}>
                {renderValue ? renderValue() : <Text style={[styles.value]}>{value}</Text>}
            </View>
        </View>
    )
}
RowPriceDefault.propTypes = {}
RowPriceDefault.defaultProps = {}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    row: {
        borderTopWidth: 1,
        borderTopColor: CommonStyle.fontBorder,
        paddingHorizontal: 8,
        flexDirection: 'row'
    },
    title: {
        color: CommonStyle.fontNearLight6,
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS,
        paddingVertical: 8
    },
    value: {
        color: CommonStyle.fontColor,
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS,
        paddingVertical: 8,
        textAlign: 'right'
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
export default RowPriceDefault
