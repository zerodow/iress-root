import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import Flag from '~/component/flags/flagIress.js'
import Title from './Title'
import Company from './Company'
import RightIcon from './RightIcon'

import * as Business from '~/business'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const Right = ({
    symbol,
    exchange,
    dragGoToTop,
    item,
    index
}) => {
    const displayName = useMemo(() => Business.getDisplayName({
        symbol,
        exchange
    }), [symbol, exchange])
    const displayCompanyName = useMemo(() => Business.getCompanyName({
        symbol,
        exchange
    }), [symbol, exchange])

    return useMemo(() => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row'
            }}>
                <View style={[styles.rowContent, {}]}>
                    <Flag {...{ symbol, exchange }} />
                    <View style={{
                        flex: 1
                    }}>
                        <Title displayName={displayName} />
                        <Company displayCompanyName={displayCompanyName} />
                    </View>
                    <RightIcon {...{ item, index }} dragGoToTop={dragGoToTop} />
                </View>

            </View>
        )
    }, [symbol, exchange])
}
Right.propTypes = {}
Right.defaultProps = {}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    rowWrapper: {

    },
    rowContent: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: CommonStyle.fontDark3,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
export default Right
