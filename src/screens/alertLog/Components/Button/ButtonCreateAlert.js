import React, { useMemo, useCallback, useState } from 'react'
import { StyleSheet, Text, View, Dimensions, Keyboard, ActivityIndicator } from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { Navigation } from 'react-native-navigation';
import { getChannelChangeOrderError } from '~/streaming/channel'
import * as Emitter from '@lib/vietnam-emitter';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { getBodyCreateAlert } from '../../Controller/AlertController';
import Enum from '~/enum'

const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const { TRIGGER_ALERT } = Enum
const ButtonCreateAlert = ({ backgroundColor, title, symbol, exchange, styleAlertLog }) => {
    const [isLoading, setIsLoading] = useState(false)
    const { alertType, trigger, targetValue, isConnected } = useSelector((state) => {
        return {
            alertType: state.alertLog.alertType,
            trigger: state.alertLog.trigger,
            targetValue: state.alertLog.targetValue,
            isConnected: state.app.isConnected
        };
    }, shallowEqual);
    const dispatch = useDispatch()
    const disabled = useMemo(() => {
        if (!symbol || !exchange || !isConnected || isLoading) {
            return true
        } else {
            return false
        }
    }, [symbol, exchange, isConnected, isLoading])
    const onSuccess = () => {
        Keyboard.dismiss()
        dispatch.alertLog.resetBodyAlert()
        dispatch.alertLog.handleDeleteExcuted(false)
        Navigation.dismissAllModals({
            animated: false,
            animationType: 'none'
        })
    };
    const onError = () => {
        setIsLoading(false)
        const channel = getChannelChangeOrderError()
        Emitter.emit(channel, {
            msg: 'Create New Alert Failed!',
            autoHide: true,
            type: Enum.TYPE_MESSAGE.ERROR
        })
        // setLoading(false);
        // errorCb && errorCb();
        // if (!keepScreen) navigation.goBack();
    };
    const onCreateNewAlert = useCallback(() => {
        const body = getBodyCreateAlert({
            symbol,
            exchange,
            alertType,
            trigger,
            targetValue
        })
        setIsLoading(true)
        if (trigger.key === TRIGGER_ALERT.CONTAINS) {
            if (targetValue) {
                dispatch.alertLog.createAlertLog({
                    body,
                    onSuccess,
                    onError
                });
            } else {
                setIsLoading(false)
                dispatch.alertLog.changeTargetValue('')
            }
        } else {
            dispatch.alertLog.createAlertLog({
                body,
                onSuccess,
                onError
            });
        }
    }, [symbol,
        exchange,
        alertType,
        trigger,
        targetValue])
    return (
        <View style={styleAlertLog} >
            <TouchableOpacityOpt
                disabled={disabled}
                onPress={onCreateNewAlert}
                style={[{
                    flexDirection: 'row',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    alignItems: 'center',
                    backgroundColor: disabled ? CommonStyle.color.fontdusk_disable : backgroundColor,
                    paddingHorizontal: 32
                }]}>
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    {isLoading ? (
                        <ActivityIndicator
                            size="small"
                            color="black"
                            style={{ paddingRight: 8 }}
                        />
                    ) : null}
                    <Text style={{
                        color: disabled ? CommonStyle.fontNearLight6 : CommonStyle.fontBlack,
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeXL,
                        paddingVertical: 18
                    }}>{I18n.t('createAlert')}</Text>
                </View>
                <Ionicons name={'md-send'} size={26} color={CommonStyle.fontBlack} />
            </TouchableOpacityOpt>
        </View >
    )
}

export default ButtonCreateAlert

const styles = StyleSheet.create({})
