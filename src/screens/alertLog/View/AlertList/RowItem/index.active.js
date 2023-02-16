import React, {
    useEffect, useMemo, useRef, useImperativeHandle, useCallback, useState
} from 'react'
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native'
import RowLeftActive from '~/screens/alertLog/View/AlertList/RowItem/RowLeftActive'
import RowRightAcctive from '~/screens/alertLog/View/AlertList/RowItem/RowRightAcctive'
import CommonStyle from '~/theme/theme_controller'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import Animated, { Easing } from 'react-native-reanimated'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import I18n from '~/modules/language/'
import Interactable from '~/component/Interactable/'
import ENUM from '~/enum'
import SvgIcon from '~s/watchlist/Component/Icon2'
import { registerInteractable } from '~s/alertLog/Model/AlertLogModel'
import ButtonSwipeableRight from '~s/alertLog/View/AlertList/RowItem/ButtonSwipeableRight'
const { width: DEVICE_WIDTH } = Dimensions.get('window')

const SNAP_POINT = {
    LEFT: 0,
    MIDDLE: 0,
    RIGHT: -136
}

const { ORDER_TAG, CANCEL_TYPE, SLTP_ORDER_STATUS } = ENUM

const TouchableOpacityAnim = Animated.createAnimatedComponent(TouchableOpacityOpt)

const {
    block,
    cond,
    set,
    add,
    and,
    or,
    eq,
    Value,
    Code
} = Animated

export const useInteractableActive = () => {
    const refInteractableActive = useRef()
    return { refInteractableActive }
}
const RowActive = ({
    data,
    navigator,
    updateActiveStatus,
    index,
    onDelete
}) => {
    const { enable } = data
    const bgColor = enable ? CommonStyle.backgroundColorNearDark : '#50535D'
    const _deltaX = useMemo(() => {
        return new Value(0)
    }, [])
    const { refInteractableActive } = useInteractableActive()
    const onDrag = useCallback((event) => {
        const { state } = event.nativeEvent
        state === 'start' && registerInteractable({ index, fn: closeInteractable })
    }, [])
    const closeInteractable = useCallback(() => {
        refInteractableActive.current && refInteractableActive.current.snapTo && refInteractableActive.current.snapTo({ index: 1 })
    }, [])
    return (
        <Animated.View style={{
            height: 102,
            marginHorizontal: 8,
            marginTop: 8

        }}>
            < ButtonSwipeableRight
                closeInteractable={closeInteractable}
                navigator={navigator}
                data={data}
                index={index}
                onDelete={onDelete}
                updateActiveStatus={updateActiveStatus}
                _deltaX={_deltaX}
            />
            <Interactable.View
                horizontalOnly={true}
                snapPoints={[{ x: SNAP_POINT.LEFT }, { x: SNAP_POINT.MIDDLE }, { x: SNAP_POINT.RIGHT }]}
                animatedValueX={_deltaX}
                boundaries={{ left: -(DEVICE_WIDTH - 8 * 2 + SNAP_POINT.RIGHT / 2), right: 0, bounce: 0 }}
                onDrag={onDrag}
                ref={refInteractableActive}
            >
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: bgColor,
                    height: '100%',
                    borderRadius: 8
                }}>
                    <View style={{ marginLeft: 8 }}>
                        <RowLeftActive data={data} />

                    </View>
                    <View style={{ marginRight: 8 }}>
                        <RowRightAcctive data={data} />

                    </View>
                </View>
            </Interactable.View>
        </Animated.View >

    )
}

export default RowActive

const styles = StyleSheet.create({})
