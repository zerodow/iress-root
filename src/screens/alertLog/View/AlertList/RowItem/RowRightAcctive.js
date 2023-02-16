import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import {
    formatNumberNew2
} from '~/lib/base/functionUtil'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import Enum from '~/enum'
import { getDisplayNameAlertLog } from '~s/alertLog/Controller/AlertController'
const { width: DEVICE_WIDTH } = Dimensions.get('window')
const widthButton = (DEVICE_WIDTH / 2) - 24 - 8
const { TRIGGER_ALERT, ALERT_LOG_TYPE } = Enum
const AlertType = ({ displayAlerttype }) => {
    return (
        <Text style={{
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontColor
        }}>{displayAlerttype}</Text>
    )
}
const Trigger = ({ displayTrigger }) => {
    const check = useMemo(() => {
        switch (displayTrigger) {
            case 'Headline Contains':
                return false
            default:
                return true
        }
    }, [displayTrigger])
    return (
        <View style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
        }}>
            {check && <Text style={{
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontColor
            }}>{' is '}</Text>}
            <Text numberOfLines={1} style={{
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontColor,
                fontWeight: check ? 'bold' : 'normal',
                paddingBottom: check ? 0 : 8,
                maxWidth: displayTrigger === 'Headline Contains' ? DEVICE_WIDTH / 3 : DEVICE_WIDTH / 4

            }}>{displayTrigger}</Text>
        </View>

    )
}
const TargetValue = ({ value, widthButton, textStyle, data }) => {
    return (
        <TouchableOpacityOpt style={{
            width: widthButton,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: data.enable ? CommonStyle.fontDark3 : '#979797'
        }}>
            <Text numberOfLines={3} ellipsizeMode='tail' style={[{
                fontSize: CommonStyle.font11,
                textAlign: 'center',
                padding: 8,
                color: CommonStyle.color.modify
            }, textStyle]}>{value}</Text>
        </TouchableOpacityOpt>
    )
}
const RowItemRight = ({ data }) => {
    const { alert_type: alertType, trigger, value: targetValue, enable } = data
    const displayAlerttype = getDisplayNameAlertLog(alertType)
    const displayTrigger = getDisplayNameAlertLog(trigger)
    const decimal = useMemo(() => {
        switch (alertType) {
            case ALERT_LOG_TYPE.CHANGEPERCENT:
                return -1
            case ALERT_LOG_TYPE.CHANGEPOINT:
                return -1
            default:
                return -1
        }
    }, [alertType])
    const renderContent = useCallback(
        () => {
            switch (trigger) {
                case TRIGGER_ALERT.CONTAINS:
                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            {trigger && <Trigger displayTrigger={displayTrigger} />}
                            <TargetValue
                                data={data}
                                value={targetValue}
                                widthButton={widthButton}
                                textStyle={{
                                    fontSize: CommonStyle.font11,
                                    fontWeight: 'normal'
                                }} />
                        </View>
                    )
                case TRIGGER_ALERT.IS_MARKET_SENSITIVE:
                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <TargetValue
                                data={data}
                                value={'Market Sensitive'}
                                widthButton={widthButton}
                                textStyle={{
                                    fontSize: CommonStyle.font11,
                                    fontWeight: 'normal'
                                }} />
                        </View>
                    )
                default:
                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <View style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                paddingBottom: 8
                            }}>
                                <AlertType displayAlerttype={displayAlerttype} />
                                {trigger && <Trigger displayTrigger={displayTrigger} />}
                            </View>
                            <TargetValue
                                data={data}
                                value={
                                    formatNumberNew2(targetValue, decimal)}
                                widthButton={widthButton} />
                        </View>
                    )
            }
        },
        [trigger, targetValue, alertType, enable]
    )
    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginRight: 8, opacity: enable ? 1 : 0.4 }}>
            {renderContent()}
        </View>
    )
}

export default RowItemRight

const styles = StyleSheet.create({})
