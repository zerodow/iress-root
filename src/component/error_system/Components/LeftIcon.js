import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import SvgIcon from '~/component/svg_icon/SvgIcon.js'
const LeftIcon = () => {
    return (
        <SvgIcon size={18} style={{ paddingRight: 8 }} name="noun_maintenance" />
    )
}
LeftIcon.propTypes = {}
LeftIcon.defaultProps = {}
const styles = StyleSheet.create({})
export default LeftIcon
