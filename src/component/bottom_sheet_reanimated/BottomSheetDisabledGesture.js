import React, { useEffect, useState, useCallback, useMemo, useImperativeHandle } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native'
import Animated from 'react-native-reanimated'
import PropTypes from 'prop-types'
import {
    clamp,
    timing
} from '~/lib/redash/index.js'
import { State } from 'react-native-gesture-handler'
import CommonStyle from '~/theme/theme_controller'
import {
    getItemFromLocalStorage,
    isIphoneXorAbove,
    logDevice,
    saveItemInLocalStorage
} from '~/lib/base/functionUtil'
const { height: heightDevices } = Dimensions.get('window')
const { Value, useCode, block, eq, cond, set, or, Clock, clockRunning, and, call } = Animated

const ConfirmDelete = React.forwardRef(({ renderHeader, renderContent, renderFooter, onShowDone, onHideDone, contentStyle }, ref) => {
    const { state, translateY, opacity, clock, preState } = useMemo(() => {
        return {
            state: new Value(State.UNDETERMINED),
            translateY: new Value(heightDevices),
            opacity: new Value(0.8),
            clock: new Clock(),
            preState: new Value(State.UNDETERMINED)
        }
    }, [])
    const show = useCallback(() => {
        state.setValue(State.ACTIVE)
    }, [])
    const hide = useCallback(() => {
        state.setValue(State.CANCELLED)
    }, [])
    useCode(block([
        cond(eq(state, State.ACTIVE), [
            set(translateY, timing({
                from: heightDevices,
                to: 0
            })),
            cond(eq(translateY, 0), [set(state, State.UNDETERMINED), call([], () => onShowDone && onShowDone())])
        ], 0),
        cond(eq(state, State.CANCELLED), [
            set(translateY, timing({
                from: 0,
                to: heightDevices
            })),
            cond(eq(translateY, heightDevices), [set(state, State.UNDETERMINED), call([], () => onHideDone && onHideDone())])
        ], 0),
        cond(eq(translateY, heightDevices), [set(opacity, 0)], [set(opacity, 0.8)])
    ]), [])
    useEffect(() => {
        show()
    }, [])
    useImperativeHandle(ref, () => ({
        show: show,
        hide: hide
    }), []);
    return (
        <SafeAreaViewComponent>
            <View
                onLayout={e => console.info('Height', e.nativeEvent.layout.height, heightDevices, isIphoneXorAbove())}
                pointerEvents={'box-none'}
                style={[{
                    flex: 1
                }]}
            >
                <Animated.View pointerEvents={'none'} style={[
                    StyleSheet.absoluteFillObject,
                    {
                        opacity: opacity,
                        backgroundColor: CommonStyle.backgroundColor
                    }]} />
                <Animated.View style={[{ marginTop: 32, flex: 1, zIndex: 99, backgroundColor: CommonStyle.backgroundColor }, contentStyle, {
                    justifyContent: 'flex-start',
                    transform: [{
                        translateY: translateY
                    }]
                }]}>
                    <View>
                        {
                            renderHeader && renderHeader()
                        }
                    </View>
                    <View style={{
                        flex: 1
                    }}>
                        {
                            renderContent && renderContent()
                        }
                    </View>
                    <View>
                        {
                            renderFooter && renderFooter()
                        }
                    </View>
                </Animated.View>

            </View>
        </SafeAreaViewComponent>

    )
})
const SafeAreaViewComponent = props => {
    const WrapperComponent = isIphoneXorAbove() ? View : SafeAreaView
    return (
        <WrapperComponent style={styles.SafeArea} {...props} >
            {props.children}
        </WrapperComponent>
    )
};

const styles = StyleSheet.create({
    SafeArea: {
        height: Platform.OS === 'android' ? '100%' : isIphoneXorAbove() ? heightDevices - 46 : '100%',
        marginTop: isIphoneXorAbove() ? 46 : 0
    }
});
ConfirmDelete.propTypes = {}
ConfirmDelete.defaultProps = {}
export default ConfirmDelete
