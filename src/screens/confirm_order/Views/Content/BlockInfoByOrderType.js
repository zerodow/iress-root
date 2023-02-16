import React, { useEffect, useState, useCallback } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import RowPriceDefault from '~/screens/confirm_order/Components/RowInfoPrice/RowPriceDefault.js'
import CommonStyle from '~/theme/theme_controller'
const BlockInfoByOrderType = () => {
    return (
        <View>
            <RowPriceDefault title={''} />
        </View>
    )
}
BlockInfoByOrderType.propTypes = {}
BlockInfoByOrderType.defaultProps = {}
export default BlockInfoByOrderType
