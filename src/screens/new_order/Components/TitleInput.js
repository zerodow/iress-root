import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'

import CommonStyle from '~/theme/theme_controller'
const TitleInput = ({ title }) => {
    return (
        <Text style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.fontNearLight6
        }}>{title}</Text>
    )
}
TitleInput.propTypes = {}
TitleInput.defaultProps = {}
const styles = StyleSheet.create({})
export default TitleInput
