import { setCode, getCode, setMessage } from '~/component/error_system/Model/ErrorModel.js'
import * as Emitter from '@lib/vietnam-emitter';
import { getChannelShowErrorSystem, getChannelHideErrorSystem } from '~/streaming/channel.js'
import { TYPE_ERROR_SYSTEM, ERROR_SYSTEM } from '~/component/error_system/Constants.js'
import { changeErrorSystemLoading } from '~/component/error_system/Redux/actions.js'
import { kickOut } from '~/api.js'
import * as Controller from '~/memory/controller'
import {
    logDevice
} from '~/lib/base/functionUtil';
import { oktaSignOutWithBrowser } from '~/manage/manageOktaAuth'
import { dataStorage } from '~/storage'
const channelShowError = getChannelShowErrorSystem()
const channelHideErrorSystem = getChannelHideErrorSystem()
export function handleErrorSystem(data) {
    const { code, message = '' } = data
    const isLogin = Controller.getLoginStatus()
    const type = ERROR_SYSTEM[code]
    if (!type || !isLogin || code === -1) return
    switch (type) {
        case TYPE_ERROR_SYSTEM.RETRY_FAIL_AND_CHANGE_UI:
        case TYPE_ERROR_SYSTEM.RETRY_FAIL_AND_POP_BACK_LOGIN:
        case TYPE_ERROR_SYSTEM.RETRY_FAIL_AND_INFINITED:
        case TYPE_ERROR_SYSTEM.SHOW_AUTO_HIDE:
            setCode(code)
            setMessage(message)
            return handleShowMessage(code)
        case TYPE_ERROR_SYSTEM.SHOW_POPUP:
            logDevice('info', `handleErrorSystem: ${JSON.stringify(data)}`);
            setCode(code)
            setMessage(message)
            return handleShowPopupForceBack(true)
        default:
            break;
    }
}
export function handleShowPopupForceBack(isHideMessage = false) {
    isHideMessage && handleHideMessage({ isUpdateLoading: false })
    Controller.dispatch(changeErrorSystemLoading(true))
    // Signout okta
    kickOut()
}
export function handleShowMessage(code) {
    Emitter.emit(channelShowError, code)
}
export function handleHideMessage(p = { isUpdateLoading: true }) {
    const { isUpdateLoading } = p
    isUpdateLoading && setCode(null)
    Emitter.emit(channelHideErrorSystem, p)
}
