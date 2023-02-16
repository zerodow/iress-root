import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const Title = () => {
    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingLeft: 8,
            paddingRight: 16
        }}>
            <Text style={styles.title}>{'Price'}</Text>
            <Text style={styles.title}>{'Vol'}</Text>
        </View>
    )
}
Title.propTypes = {}
Title.defaultProps = {}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

    title: {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontNearLight4
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
export default Title
