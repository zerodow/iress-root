import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { Navigation } from 'react-native-navigation';
import {
    formatNumberNew2
} from '~/lib/base/functionUtil';
import TargetValueInput from '~/screens/alertLog/View/CreateNewAlerts/TargetValueInput'
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import SelectionButton from '~s/alertLog/Components/Selection/SelectionButton'
import { listAlertType, listTriggerDefault, listTriggerMovement, listTriggerNew } from '~s/alertLog/Components/Selection/listAlert'
import Enum from '~/enum';
import * as Business from '~/business'

const BASIC = 'BASIC'
const defaulTriggerNew = {
    label: 'Market Sensitive',
    key: 'IS_MARKET_SENSITIVE'
}
const defaultTrigger = {
    label: 'At',
    key: 'AT'
}
const { ALERT_LOG_TYPE, PRICE_DECIMAL, TRIGGER_ALERT } = Enum
const ChooseAlerts = ({ symbol, exchange }) => {
    const dispatch = useDispatch()
    const { alertType, trigger, targetValue } = useSelector((state) => {
        return {
            alertType: state.alertLog.alertType,
            trigger: state.alertLog.trigger,
            targetValue: state.alertLog.targetValue
        };
    }, shallowEqual);
    const listTriggerByAlerType = useMemo(() => {
        switch (alertType.key) {
            case ALERT_LOG_TYPE.NEWS:
                return listTriggerNew
            case ALERT_LOG_TYPE.CHANGEPERCENT:
                return listTriggerMovement
            case ALERT_LOG_TYPE.CHANGEPOINT:
                return listTriggerMovement
            default:
                return listTriggerDefault
        }
    }, [alertType])
    const keyBoardTypeByTrigger = useMemo(() => {
        switch (trigger.key) {
            case TRIGGER_ALERT.CONTAINS:
                return 'default'
            default:
                return 'phone-pad';
        }
    }, [trigger])
    const triggerDefault = useMemo(() => {
        if (alertType.key === ALERT_LOG_TYPE.NEWS) {
            dispatch.alertLog.changeTrigger(defaulTriggerNew)
            return defaulTriggerNew
        } else {
            if (trigger.key === TRIGGER_ALERT.CONTAINS || trigger.key === TRIGGER_ALERT.IS_MARKET_SENSITIVE) {
                dispatch.alertLog.changeTrigger(defaultTrigger)
                return defaultTrigger
            } else {
                if (trigger.label === 'AT') {
                    return defaultTrigger
                } else {
                    return trigger
                }
            }
        }
    }, [alertType])
    return (
        <View>
            <View style={{ backgroundColor: CommonStyle.backgroundColor, marginHorizontal: 16 }}>
                <SelectionButton
                    disabled={false}
                    layout={BASIC}
                    data={listAlertType}
                    title={I18n.t('alertTypeLabel')}
                    onShow={() => { }}
                    onHide={() => { }}
                    defaultValue={alertType}
                    onCbSelect={(value, selectedObject) => {
                        Business.hideKeyboard();
                        dispatch.alertLog.changeAlertType(selectedObject)
                        dispatch.alertLog.changeTargetValue('0')
                    }} />
                <SelectionButton
                    disabled={false}
                    layout={BASIC}
                    data={listTriggerByAlerType}
                    title={I18n.t('trigger')}
                    onShow={() => { }}
                    onHide={() => { }}
                    defaultValue={triggerDefault}
                    onCbSelect={(value, selectedObject) => {
                        dispatch.alertLog.changeTrigger(selectedObject)
                    }} />
                {trigger.key !== TRIGGER_ALERT.IS_MARKET_SENSITIVE
                    ? <TargetValueInput symbol={symbol} exchange={exchange} targetValue={targetValue} /> : null}
            </View>
        </View>
    )
}
export default ChooseAlerts

const styles = StyleSheet.create({})
