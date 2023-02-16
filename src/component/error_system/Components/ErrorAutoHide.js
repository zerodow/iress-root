import React, { useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import LeftIcon from './LeftIcon'
import RightIcon from './RightIcon'
import Styles from '~/component/error_system/styles.js'
import { getMessage } from '~/component/error_system/Model/ErrorModel.js'
import { setNumRetry } from '~/component/error_system/Model/RecallModel.js'

const ErrorAutoHide = ({ hideError, onReTry }) => {
    const dic = useRef({ numRetry: 0 })
    useLayoutEffect(() => {
        const timeoutHideError = setTimeout(() => {
            hideError && hideError({})
            setTimeout(() => {
                dic.current.numRetry += 1
                setNumRetry(dic.current.numRetry)
                onReTry && onReTry()
            }, 500);
        }, 10 * 1000);
        return () => {
            setTimeout(() => {
                setNumRetry(0)
            }, 3 * 1000);
            timeoutHideError && clearTimeout(timeoutHideError)
        }
    }, [])
    return (
        <View style={Styles.container}>
            <View style={{ flex: 1 }}>
                <Text style={Styles.text}>{`${getMessage()}`}</Text>
            </View>
        </View>
    )
}
ErrorAutoHide.propTypes = {}
ErrorAutoHide.defaultProps = {}
const styles = StyleSheet.create({})
export default ErrorAutoHide
