import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller';
import { IconClickToRefresh } from '~/component/panel/Icon.js'
const RightIcon = ({ onReTry, isLoading, disabled = false }) => {
    return (
        <IconClickToRefresh isLoading={isLoading} disabled={disabled} color={CommonStyle.fontDark} onClickToRefresh={onReTry} />
    )
}
RightIcon.propTypes = {}
RightIcon.defaultProps = {}
const styles = StyleSheet.create({})
export default RightIcon
