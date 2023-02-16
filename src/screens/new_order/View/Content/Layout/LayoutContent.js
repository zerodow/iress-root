import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { useSelector, shallowEqual } from 'react-redux'
import LayoutBasic from '~/screens/new_order/View/Content/Layout/LayoutBasic.js'
import LayoutAdvance from '~/screens/new_order/View/Content/Layout/LayoutAdvance.js'
import DepthAdvance from '~/screens/new_order/View/Content/Depth/DepthAdvance/DepthAdvance.js'

import Enum from '~/enum'
import CommonStyle from '~/theme/theme_controller'
const LayoutContent = (props) => {
    const layout = useSelector(state => state.newOrder.layout, shallowEqual)
    return (
        <View style={{
            flexDirection: layout === 'basic' ? 'column' : 'row',
            marginTop: 8
        }}>
            {layout === Enum.ORDER_LAYOUT.ADVANCE && <View style={{
                borderColor: CommonStyle.color.dusk,
                borderRightWidth: 1,
                flex: 1
            }} >
                <DepthAdvance {...props} />
            </View>}
            <LayoutBasic layout={layout} {...props} />
        </View>
    )
}
LayoutContent.propTypes = {}
LayoutContent.defaultProps = {}
const styles = StyleSheet.create({})
export default LayoutContent
