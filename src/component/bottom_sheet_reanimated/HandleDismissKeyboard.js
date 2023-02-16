import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, Keyboard } from 'react-native'
import Animated from 'react-native-reanimated'
import PropTypes from 'prop-types'
import {
    State
} from 'react-native-gesture-handler';
import * as Business from '~/business'
const { block, cond, eq, call, or } = Animated
const HandleDismissKeyboard = ({ parentState, childrenState }) => {
    return (
        <React.Fragment>
            <Animated.Code exec={block([
                // call([parentState, childrenState, tabState], ([a, b, c]) => {
                //     console.info('parentState, childrenState', a, b, c)
                // }),
                cond(or(eq(parentState, State.BEGAN), eq(childrenState, State.BEGAN)), [
                    call([], () => {
                        Business.showButtonConfirm()
                    })
                ], [])
            ])} />
        </React.Fragment>
    )
}
HandleDismissKeyboard.propTypes = {}
HandleDismissKeyboard.defaultProps = {}
export default HandleDismissKeyboard
