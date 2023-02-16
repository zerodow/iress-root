import React, {
    useEffect, useMemo, useRef, useImperativeHandle, useCallback, useState
} from 'react'
import { StyleSheet, Text, View, Dimensions, Platform } from 'react-native'
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import RowLeftExecuted from '~/screens/alertLog/View/AlertList/RowItem/RowLeftExecuted'
import RowRightExecuted from '~/screens/alertLog/View/AlertList/RowItem/RowRightExecuted'
import CommonStyle from '~/theme/theme_controller'
import Animated, { Easing } from 'react-native-reanimated'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Interactable from '~/component/Interactable/'
import ENUM from '~/enum'
import SvgIcon from '~s/watchlist/Component/Icon2'
import { registerInteractable } from '~s/alertLog/Model/AlertLogModel'

const { width: DEVICE_WIDTH } = Dimensions.get('window')

const SNAP_POINT = {
    LEFT: 0,
    MIDDLE: 0,
    RIGHT: -68
}

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

const CancelButton = ({ closeInteractable, onDelete, navigator, data, disabled, updateActiveStatus, _deltaX, index }) => {
    const isConnected = useSelector(state => state.app.isConnected, shallowEqual)
    const dispatch = useDispatch()
    const isDisabled = disabled || !isConnected
    const onSuccess = () => {

    }
    const onError = () => {
    }
    const handleShowDeleteAlert = () => {
        closeInteractable();
        onDelete && onDelete(data, index)
        Platform.OS === 'android' && updateActiveStatus && updateActiveStatus(false);
        dispatch.alertLog.deleteAlertLog({
            alertID: data.alert_id,
            onSuccess,
            onError
        });
    }
    return <View
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 102,
            backgroundColor: CommonStyle.color.sell,
            borderRadius: 8,
            alignItems: 'flex-end'
        }}
        pointerEvents="box-none"
    >
        <TouchableOpacityAnim
            disabled={isDisabled}
            onPress={
                handleShowDeleteAlert
            }
            style={[
                {
                    width: _deltaX.interpolate({
                        inputRange: [SNAP_POINT.RIGHT - 1, SNAP_POINT.RIGHT, 0],
                        outputRange: [-(SNAP_POINT.RIGHT - 1), -SNAP_POINT.RIGHT, -SNAP_POINT.RIGHT]
                    }),
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    opacity: isDisabled ? 0.5 : 1
                }
            ]}
        >
            <View
                style={{
                    transform: [{
                        rotate: '-25deg'
                    }]
                }}
            >
                <CommonStyle.icons.delete
                    color={CommonStyle.fontBlack}
                    size={30}
                    name={'delete'}
                    style={{ width: 30, height: 30 }}
                />
            </View>
        </TouchableOpacityAnim>
    </View>
}

const RowExecuted = ({ data, navigator, updateActiveStatus, index, onDelete }) => {
    const _deltaX = useMemo(() => {
        return new Value(0)
    }, [])
    const refInteractable = useRef()
    const onDrag = useCallback((event) => {
        const { state } = event.nativeEvent
        state === 'start' && registerInteractable({ index, fn: closeInteractable })
    }, [])
    const closeInteractable = useCallback(() => {
        refInteractable.current && refInteractable.current.snapTo && refInteractable.current.snapTo({ index: 1 })
    }, [])
    return (
        <Animated.View style={{
            height: 102,
            marginHorizontal: 8,
            marginTop: 8

        }}>
            <CancelButton
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
                boundaries={{ left: -(DEVICE_WIDTH - 8 * 2 + SNAP_POINT.RIGHT), right: 0, bounce: 0 }}
                onDrag={onDrag}
                ref={refInteractable}
            >
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: CommonStyle.backgroundColorNearDark,
                    height: '100%',
                    borderRadius: 8

                }}>
                    <View style={{ marginLeft: 8 }}>
                        <RowLeftExecuted data={data} index={index} />

                    </View>
                    <View style={{ marginRight: 8 }}>
                        <RowRightExecuted data={data} index={index} />

                    </View>
                </View>
            </Interactable.View>
        </Animated.View>

    )
}

export default RowExecuted

const styles = StyleSheet.create({})
