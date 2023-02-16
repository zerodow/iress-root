import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
    View, Text
} from 'react-native'
import TabView from '~/component/tabview4/'
import CommonStyle from '~/theme/theme_controller'
import { useShadow } from '~/component/shadow/SvgShadow';
import { clearInteractable } from '~/screens/marketActivity/Models/MarketActivityModel.js'
import { useDispatch } from 'react-redux'
import { setAlertTag, getListAlertID } from '~s/alertLog/Model/AlertLogModel';

const TABS = [
    {
        label: 'alertlable',
        isDisabled: false
    },
    {
        label: 'notification',
        isDisabled: false
    }

    // {
    //     label: 'Orders',
    //     isDisabled: true
    // }
]

const TabAlertLog = () => {
    const [Shadow, onLayout] = useShadow()
    const [activeTab, setActiveTab] = useState(0)
    const listAlertId = getListAlertID()

    const dispatch = useDispatch()
    const dic = useRef({
        timeout: null,
        timeoutAnimationType: null
    })
    const onSuccess = () => {
        console.info('SUCCESS DELETE NOTI')
    }
    const onError = () => {
        console.info('ERROR DELETE NOTI')
    }

    const onChangeTabTabView = useCallback((activeTab) => {
        clearInteractable()
        setAlertTag(activeTab)
        setActiveTab(activeTab)
        // dispatch.alertLog.changeAlertTab(activeTab)
        dic.current.timeoutAnimationType && clearTimeout(dic.current.timeoutAnimationType)
        dic.current.timeoutAnimationType = setTimeout(() => {
            dispatch.alertLog.changeAnimationType()
            dispatch.alertLog.readNotification({
                listAlertId: listAlertId,
                onSuccess,
                onError
            });
            // dispatch.alertLog.changeAlertTab(activeTab)
        }, 200)
        dic.current.timeout && clearTimeout(dic.current.timeout)
        dic.current.timeout = setTimeout(() => {
        }, 300)
    }, [])
    unMount = useCallback(() => {
        dic.current.timeout && clearTimeout(dic.current.timeout)
        dic.current.timeoutAnimationType && clearTimeout(dic.current.timeoutAnimationType)
    }, [])
    useEffect(() => {
        return unMount
    }, [])
    return <View style={{ backgroundColor: CommonStyle.color.dark, paddingBottom: 5 }}>
        <View>
            <Shadow />
            <View onLayout={onLayout} style={{ zIndex: 10 }}>
                <TabView
                    tabs={TABS}
                    activeTab={activeTab}
                    onChangeTab={onChangeTabTabView}
                    wrapperStyle={{
                        backgroundColor: CommonStyle.color.dark,
                        justifyContent: 'space-around',
                        zIndex: 9
                    }}
                    textTabStyle={{ fontSize: CommonStyle.font13 }}
                />
            </View>
        </View>
    </View>
}

export default TabAlertLog
