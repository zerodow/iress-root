import { func, dataStorage } from '../../../storage';
import { logDevice } from '../../../../src/lib/base/functionUtil'

export function setPinRequest() {
    return {
        type: 'SET_PIN_REQUEST'
    };
}
export function setPinSuccess() {
    return {
        type: 'SET_PIN_SUCCESS'
    }
}
export function setPinCancel() {
    return {
        type: 'SET_PIN_CANCEL'
    }
}
export function setPinError() {
    return {
        type: 'SET_PIN_ERROR'
    }
}
export function changePinRequest() {
    return {
        type: 'CHANGE_PIN_REQUEST'
    };
}
export function changePinSuccess() {
    return {
        type: 'CHANGE_PIN_SUCCESS'
    }
}
export function changePinCancel() {
    return {
        type: 'CHANGE_PIN_CANCEL'
    }
}
export function changePinError() {
    return {
        type: 'CHANGE_PIN_ERROR'
    }
}
export function turnOnTouchID() {
    return {
        type: 'TURN_ON_TOUCH_ID'
    }
}
export function turnOffTouchID() {
    return {
        type: 'TURN_OFF_TOUCH_ID'
    }
}
export function setEnableTouchID(enableTouchIDStatus) {
    dataStorage.userPin.enableTouchID = enableTouchIDStatus
    if (enableTouchIDStatus) {
        dataStorage.isLockTouchID = false
    }
    logDevice('info', `Auth setting actions - set data storage "enableTouchID" - dataStorage: ${dataStorage.userPin.enableTouchID} param: ${enableTouchIDStatus}`)
    return {
        type: 'SET_ENABLE_TOUCH_ID',
        enableTouchIDStatus
    }
}
export function backToSetPin(isSettingPin) {
    return {
        type: 'BACK_TO_SET_PIN'
    }
}
