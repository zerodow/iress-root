import React, { useEffect, useState, useCallback } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import CommonStyle from '~/theme/theme_controller'
const Company = ({ displayCompanyName }) => {
    return (
        <Text numberOfLines={1} style={{
            color: CommonStyle.fontNearLight6,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeTen
        }}>{displayCompanyName}</Text>
    )
}
Company.propTypes = {}
Company.defaultProps = {}
export default Company
