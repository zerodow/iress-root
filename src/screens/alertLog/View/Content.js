import React, { useCallback, useRef, useMemo, useEffect } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import AlertList from '~s/alertLog/View/AlertList'
import NotifcationList from '~/screens/alertLog/View/NotificationList'
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import ENUM from '~/enum'
import { getAlertTag, getListAlertID } from '~s/alertLog/Model/AlertLogModel';
import Animated, { Easing } from 'react-native-reanimated'

const { ALERT_TAG } = ENUM
const {
    Value,
    timing
} = Animated
const { width: DEVICE_WIDTH } = Dimensions.get('window')
const Content = ({ navigator, updateActiveStatus, activeTab }) => {
    const renderContent = useCallback(() => {
        switch (activeTab) {
            case ALERT_TAG.ALERT:
                return <AlertList
                    navigator={navigator}
                    updateActiveStatus={updateActiveStatus}
                />
                break;
            case ALERT_TAG.NOTIFICATION:
                return <NotifcationList />
        }
    }, [activeTab])

    return (
        <View style={{ flex: 1 }}>
            {renderContent()}
        </View>
    )
}

export default Content

const styles = StyleSheet.create({})
