import React from 'react-native'
import { setType, setOrderDetail } from '~/screens/confirm_order/ConfirmCancelOrder/Model/CancelModel'
import { getObjectNewOrderReduxFromOrderDetail } from '~/screens/new_order/Controller/SwitchController'
import { Navigation } from 'react-native-navigation';
import CommonStyle from '~/theme/theme_controller'
import Enum from '~/enum'
const { NAME_PANEL } = Enum

export function handleShowCancelOrder({ data, navigator, cancelType, cbCancelSuccess }) {
    setOrderDetail(data)
    const stateAmend = getObjectNewOrderReduxFromOrderDetail({ data })
    setType(cancelType)
    Navigation.showModal({
        screen: 'equix.ConfirmCancel',
        animated: false,
        animationType: 'none',
        navigatorStyle: {
            ...CommonStyle.navigatorModalSpecialNoHeader,
            modalPresentationStyle: 'overCurrentContext'
        },
        passProps: {
            dicValueUpdate: { symbol: stateAmend.symbol, exchange: stateAmend.exchange },
            onHideAll: () => {
                dataStorage.currentScreenId = ScreenId.ORDERS
                setType(Enum.AMEND_TYPE.DEFAULT)
            },
            cbCancelSuccess
        }
    })
}
export function showErrorHandlingOrder({ error, breachAction, errorCode }) {
    Navigation.showModal({
        screen: 'equix.ErrorHandlingOrder',
        animated: false,
        animationType: 'none',
        navigatorStyle: {
            ...CommonStyle.navigatorModalSpecialNoHeader,
            modalPresentationStyle: 'overCurrentContext'
        },
        passProps: {
            error, breachAction, errorCode
        }
    })
}
