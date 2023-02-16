import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native'

import PropTypes from 'prop-types'
/**
 * Tren android TextInput luon co 1 padding
 */
const TextInputCustom = ({ style, forwardRef, styleWrapper, ...props }) => {
    const [height, setHeight] = useState(-1)
    const refTextInput = useRef()
    const calHeightText = useCallback((e) => {
        const ref = forwardRef || refTextInput
        const { height } = e.nativeEvent.layout
        Platform.OS === 'android' && ref.current.setNativeProps && ref.current.setNativeProps && ref.current.setNativeProps({ style: { height: height } })
    }, [])
    return (
        <View pointerEvents={'box-none'} style={[{
            flex: 1
        }, styleWrapper]}>
            <Text onLayout={calHeightText} style={[{ position: 'absolute' }, style, { opacity: 0 }]}>A</Text>
            <TextInput ref={forwardRef || refTextInput} style={[style, { height: height }]} {...props} />
        </View>
    )
}
TextInputCustom.propTypes = {}
TextInputCustom.defaultProps = {}
export default TextInputCustom
