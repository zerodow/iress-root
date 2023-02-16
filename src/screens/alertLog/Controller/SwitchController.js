import React from 'react-native'
import { Navigation } from 'react-native-navigation';
import * as Controller from '~/memory/controller';
import CommonStyle from '~/theme/theme_controller'

export function handleShowAlertLog({ symbol, exchange }) {
    // Controller.setStatusModalCurrent(true)
    Navigation.showModal({
        screen: 'equix.CreateNewAlerts',
        animated: false,
        animationType: 'none',
        navigatorStyle: {
            ...CommonStyle.navigatorModalSpecialNoHeader,
            modalPresentationStyle: 'overCurrentContext'
        },
        passProps: {
            symbol,
            exchange,
            isBackToSearch: true,
            isSwitchFromQuickButton: true
        }
    })
}
