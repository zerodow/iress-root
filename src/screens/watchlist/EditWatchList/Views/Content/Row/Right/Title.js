import React, { useEffect, useState, useCallback } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import CommonStyle from '~/theme/theme_controller'
const Title = ({ displayName }) => {
    return (
        <Text style={{
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.fontSizeM,
            fontFamily: CommonStyle.fontPoppinsBold
        }}>{displayName}</Text>
    )
}
Title.propTypes = {}
Title.defaultProps = {}
export default Title
