import React, { useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import LeftIcon from './LeftIcon'
import RightIcon from './RightIcon'
import Styles from '~/component/error_system/styles.js'
import { handleShowPopupForceBack } from '~/component/error_system/Controllers/HandleResponseErrorSystem.js'
import { setNumRetry } from '~/component/error_system/Model/RecallModel.js'
import { useActiveReTry, Time, useOnSetDelayedTime } from './ErrorRetryAndChangeUI'
const useHandleReTry = ({ onReTry, onShowPopUp }) => {
    const dic = useRef({ numRetry: 0 })
    // const [isFailReTry, setFailRetry] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const handleReTry = useCallback(() => {
        dic.current.numRetry += 1
        setNumRetry(dic.current.numRetry)
        setIsLoading(true)
        dic.current.timout = setTimeout(() => {
            setIsLoading(false)
        }, 2000);
        if (isLoading) return
        onReTry && onReTry()
    }, [isLoading])
    useLayoutEffect(() => {
        return () => {
            dic.current.timout && clearTimeout(dic.current.timout)
            setTimeout(() => {
                setNumRetry(0)
            }, 3 * 1000);
        }
    }, [])
    return { numRetry: dic.current.numRetry, handleReTry, isLoading }
}
const ErrorRetryNotLimited = ({ code, onReTry }) => {
    const { handleReTry, isLoading, numRetry } = useHandleReTry({ onReTry, onShowPopUp: handleShowPopupForceBack })
    const { disabled, onAcitve, onDisabled } = useActiveReTry()
    const renderText = useCallback(() => {
        return (
            <React.Fragment>
                <Text style={Styles.text}>{`System Error: Pricing Issues (${code})`}</Text>
                <Time onAcitve={onAcitve} onDisabled={onDisabled} numRetry={numRetry} isShowAttempt={false} />
            </React.Fragment>
        )
    }, [numRetry, isLoading, code])
    return (
        <View style={Styles.container}>
            <LeftIcon />
            <View style={{ flex: 1 }}>
                {renderText()}
            </View>
            <RightIcon disabled={disabled} isLoading={isLoading} onReTry={handleReTry} />
        </View>
    )
}
ErrorRetryNotLimited.propTypes = {}
ErrorRetryNotLimited.defaultProps = {}
const styles = StyleSheet.create({})
export default ErrorRetryNotLimited
