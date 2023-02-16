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

const SNAP_POINT = {
    LEFT: 0,
    MIDDLE: 0,
    RIGHT: -136
}
const TouchableOpacityAnim = Animated.createAnimatedComponent(TouchableOpacityOpt)
const { width: DEVICE_WIDTH } = Dimensions.get('window')
const ButtonSwipeableRight = ({
    closeInteractable,
    onDelete,
    navigator,
    data,
    disabled,
    updateActiveStatus,
    _deltaX,
    index
}) => {
    const listData = useSelector((state) => state.alertLog.data || [], shallowEqual);
    const { enable } = data
    const bgButtonColor = enable ? CommonStyle.borderBottomGray : CommonStyle.color.modify
    const isConnected = useSelector(state => state.app.isConnected, shallowEqual)
    // const isDisabled = disabled || !isConnected || !checkOrderHasCancel({ data })
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
            alertID: data.alert_id

        });
    }
    const handleDisableNotification = () => {
        // closeInteractable();
        // onDisableNotification && onDisableNotification(data, index)
        Platform.OS === 'android' && updateActiveStatus && updateActiveStatus(false);
        const body = {
            alert_type: data.alert_type,
            symbol: data.symbol,
            trigger: data.trigger,
            value: data.value,
            enable: !enable
        }
        dispatch.alertLog.putNotificationAlerts({
            alertID: data.alert_id,
            body: body,
            onSuccess,
            onError
        });
        const list = JSON.parse(JSON.stringify(listData))
        const newListData = list.map((item) => {
            if (data.alert_id === item.alert_id) {
                item.enable = !item.enable
            }
            return item
        })
        dispatch.alertLog.changeDataAlertLog(newListData)
    }
    return <View
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderRadius: 8,
            alignItems: 'flex-end'
        }}
        pointerEvents="box-none"
    >
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <TouchableOpacityAnim
                disabled={isDisabled}
                onPress={
                    handleDisableNotification
                }
                style={[
                    {
                        width: _deltaX.interpolate({
                            inputRange: [SNAP_POINT.RIGHT - 1, SNAP_POINT.RIGHT, 0],
                            outputRange: [-(SNAP_POINT.RIGHT / 2 - 1), -SNAP_POINT.RIGHT / 2, -SNAP_POINT.RIGHT]
                        }),
                        height: 102,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        opacity: isDisabled ? 0.5 : 1,
                        backgroundColor: bgButtonColor
                    }
                ]}
            >
                <View
                    style={{
                        transform: [{
                            rotate: '-0deg'
                        }]
                    }}
                >
                    {enable ? <SvgIcon
                        color={CommonStyle.fontBlack}
                        size={30}
                        name={'notificationDeactivated'}
                    /> : <SvgIcon
                        color={CommonStyle.fontBlack}
                        size={30}
                        name={'notificationActive'}
                    />
                    }
                </View>
            </TouchableOpacityAnim>
            <TouchableOpacityAnim
                disabled={isDisabled}
                onPress={
                    handleShowDeleteAlert
                }
                style={[
                    {
                        width: _deltaX.interpolate({
                            inputRange: [SNAP_POINT.RIGHT - 1, SNAP_POINT.RIGHT / 2, SNAP_POINT.RIGHT / 2],
                            outputRange: [-(SNAP_POINT.RIGHT / 2 - 1), -SNAP_POINT.RIGHT / 2, -SNAP_POINT.RIGHT]
                        }),
                        height: 102,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        opacity: isDisabled ? 0.5 : 1,
                        backgroundColor: CommonStyle.color.sell,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8

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
    </View>
}

export default ButtonSwipeableRight

const styles = StyleSheet.create({})
