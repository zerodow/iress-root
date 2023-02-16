import React, { useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import LeftIcon from './LeftIcon'
import RightIcon from './RightIcon'
import Styles from '~/component/error_system/styles.js'
import { TIME_DELAYED, MAX_NUM_RETRY } from '~/component/error_system/Constants.js'
import { setNumRetry } from '~/component/error_system/Model/RecallModel.js'
const useHandleReTry = ({ onReTry }) => {
    const dic = useRef({ numRetry: 0 })
    const [isFailReTry, setFailRetry] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const handleReTry = useCallback(() => {
        dic.current.numRetry += 1
        setNumRetry(dic.current.numRetry)
        setIsLoading(true)
        dic.current.timout = setTimeout(() => {
            setIsLoading(false)
        }, 2000);
        if (isLoading) return
        if (dic.current.numRetry > (MAX_NUM_RETRY - 1)) {
            dic.current.timoutSetFail = setTimeout(() => {
                setFailRetry(true)
            }, 2000);
        } else {
            onReTry && onReTry()
        }
    }, [isLoading])
    useLayoutEffect(() => {
        return () => {
            dic.current.timoutSetFail && clearTimeout(dic.current.timoutSetFail)
            dic.current.timout && clearTimeout(dic.current.timout)
            setTimeout(() => {
                setNumRetry(0)
            }, 3 * 1000);
        }
    }, [])
    return { numRetry: dic.current.numRetry, handleReTry, isFailReTry, isLoading }
}
const useOnActiveReTry = ({ time, dic, onAcitve }) => {
    return useEffect(() => {
        if (time <= 0) {
            dic.current.interval && clearInterval(dic.current.interval)
            onAcitve()
        }
    }, [time])
}
export const useOnSetDelayedTime = ({ numRetry, dic, onDisabled, setTime }) => {
    return useEffect(() => {
        if (numRetry > 0) {
            dic.current.time = TIME_DELAYED + 1
            onDisabled()
            dic.current.interval = setInterval(() => {
                setTime(dic.current.time - 1)
                dic.current.time = dic.current.time - 1
            }, 1 * 1000);
        }
    }, [numRetry])
}
export const Time = ({ onAcitve, onDisabled, numRetry, isShowAttempt = true }) => {
    const [time, setTime] = useState(0)
    const dic = useRef({ time: 0 })
    useOnActiveReTry({ dic, time, onAcitve })
    useOnSetDelayedTime({ dic, numRetry, onDisabled, setTime })
    return (
        <Text style={[Styles.text, { fontSize: 10 }]}>{`Retry in ${time} seconds`.toString()}{isShowAttempt && <Text>{`(Attempt ${numRetry}/3)`}</Text>}</Text>
    )
}
export const useActiveReTry = () => {
    const [disabled, setDisabled] = useState(false)
    const onAcitve = useCallback(() => {
        setDisabled(false)
    }, [])
    const onDisabled = useCallback(() => {
        setDisabled(true)
    }, [])
    return { disabled, onAcitve, onDisabled }
}
const ErrorRetryAndChangeUI = ({ code, onReTry }) => {
    const { isFailReTry, isLoading, numRetry, handleReTry } = useHandleReTry({ onReTry })
    const { disabled, onAcitve, onDisabled } = useActiveReTry()
    const renderText = useCallback(() => {
        if (isFailReTry) {
            return (
                <React.Fragment>
                    <Text style={Styles.text}>{`Unable to connect to IOS+`}</Text>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <Text style={Styles.text}>{`Lost Connection to IOS+ (${code})`}</Text>
                    <Time onAcitve={onAcitve} onDisabled={onDisabled} numRetry={numRetry} />
                </React.Fragment>
            )
        }
    }, [isFailReTry, numRetry, isLoading, code])
    return (
        <View style={Styles.container}>
            <LeftIcon />
            <View style={{ flex: 1 }}>
                {renderText()}
            </View>
            {!isFailReTry && <RightIcon disabled={disabled} isLoading={isLoading} onReTry={handleReTry} />}
        </View>
    )
}
ErrorRetryAndChangeUI.propTypes = {}
ErrorRetryAndChangeUI.defaultProps = {}
const styles = StyleSheet.create({})
export default ErrorRetryAndChangeUI
