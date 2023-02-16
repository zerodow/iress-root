import React, { useEffect, useState, useCallback, useMemo, useImperativeHandle } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated from 'react-native-reanimated'
import PropTypes from 'prop-types'
import {
    clamp,
    timing
} from '~/lib/redash/index.js'
import { State } from 'react-native-gesture-handler'
import CommonStyle from '~/theme/theme_controller'
const { height: heightDevices } = Dimensions.get('window')
const { Value, useCode, block, eq, cond, set, or } = Animated

const ConfirmDelete = React.forwardRef(({ renderHeader, renderContent, renderFooter, style }, ref) => {
    const { state, translateY, opacity, translateYBackdrop } = useMemo(() => {
        return {
            state: new Value(State.UNDETERMINED),
            translateY: new Value(heightDevices),
            opacity: new Value(0.8),
            translateYBackdrop: new Value(heightDevices)
        }
    }, [])
    const show = useCallback(() => {
        state.setValue(State.ACTIVE)
    }, [])
    const hide = useCallback(() => {
        state.setValue(State.CANCELLED)
    }, [])
    useCode(block([
        cond(eq(state, State.ACTIVE), [set(translateY, timing({
            from: heightDevices,
            to: 0
        }))], 0),
        cond(eq(state, State.CANCELLED), [set(translateY, timing({
            from: 0,
            to: heightDevices
        }))], 0),
        // cond(or(eq(translateY, 0), eq(translateY, heightDevices)), [set(state, State.UNDETERMINED)], 0)
        cond(eq(translateY, heightDevices), [set(opacity, 0), set(translateYBackdrop, heightDevices)], [set(opacity, 0.8), set(translateYBackdrop, 0)])
    ]), [])
    // useEffect(() => {
    //     show()
    // }, [])
    useImperativeHandle(ref, () => ({
        show,
        hide
    }), []);
    return (
        <Animated.View
            pointerEvents={'box-none'}
            style={[StyleSheet.absoluteFillObject, {
                justifyContent: 'flex-end'
            }, style]}
        >
            <Animated.View style={[
                StyleSheet.absoluteFillObject,
                {
                    opacity: opacity,
                    backgroundColor: CommonStyle.backgroundColor,
                    transform: [
                        {
                            translateY: translateYBackdrop
                        }
                    ]
                }]} />
            <Animated.View style={[{ position: 'absolute', bottom: 0, left: 0, right: 0 }, {
                justifyContent: 'flex-end',
                transform: [{
                    translateY: translateY
                }]
            }]}>
                {
                    renderHeader && renderHeader()
                }
                {
                    renderContent && renderContent()
                }
                {
                    renderFooter && renderFooter()
                }
            </Animated.View>
        </Animated.View>
    )
})
ConfirmDelete.propTypes = {}
ConfirmDelete.defaultProps = {}
export default ConfirmDelete
