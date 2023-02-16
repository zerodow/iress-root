import { func, dataStorage } from '../../storage';
import { logAndReport, convertToUTC, logDevice } from '../../lib/base/functionUtil';
import * as Util from '../../util'
import * as api from '../../api'

export function loadForm() {
    return dispatch => {
        try {
            const userId = func.getUserId();
            const urlGet = api.getUrlUserSettingByUserId(userId, 'get');
            api.requestData(urlGet, true).then(res => {
                if (res) {
                    const setting = res
                    if (!res.news) {
                        setting['news'] = {
                            annoucement: false,
                            priceSensitive: true,
                            allRelated: false,
                            scheduled: true,
                            reset: null,
                            fromHour: 20,
                            fromMinute: 0,
                            toHour: 8,
                            toMinute: 0
                        }
                    } else {
                        const { hour: fromHour, minute: fromMinute } = Util.getHoursMinutesLocal(setting['news']['fromHour'], setting['news']['fromMinute'])
                        const { hour: toHour, minute: toMinute } = Util.getHoursMinutesLocal(setting['news']['toHour'], setting['news']['toMinute'])
                        setting['news']['fromHour'] = fromHour
                        setting['news']['fromMinute'] = fromMinute
                        setting['news']['toHour'] = toHour
                        setting['news']['toMinute'] = toMinute
                    }
                    if (!res.order) {
                        setting['order'] = {
                            user_place: false,
                            on_market: true,
                            partial_fill: false,
                            filled: true,
                            amend: true,
                            reject_amend: true,
                            reject_cancel: true,
                            cancelled: true,
                            rejected: true,
                            expired: true,
                            reset: null
                        }
                    }
                    setting.noti = (res.noti !== null || res.noti !== undefined)
                        ? res.noti
                        : (res.is_notify !== null || res.is_notify !== undefined)
                            ? res.is_notify
                            : true
                    dispatch(settingResponse(setting, userId));
                }
            }).catch(error => {
                logDevice('error', `GET SETTING FOR UID: ${userId} EXCEPTION ${error}`)
            })
        } catch (error) {
            logAndReport('loadForm settingAction exception', error, 'loadForm settingAction');
            logDevice('error', `Save setting exception: ${error}`)
        }
    };
}

export function setHomeScreen(payload) {
    return {
        type: 'SET_HOME_SCREEN',
        payload
    }
}

export function settingResponse(payload, userId) {
    return {
        type: 'SETTING_RESPONSE',
        payload,
        userId
    };
}

export function setLang(payload) {
    return {
        type: 'SET_LANG',
        payload
    };
}

export function setFontSize(payload) {
    return {
        type: 'SET_TEXT_FONT_SIZE',
        payload
    }
}

export function setNotiPreference(payload) {
    return {
        type: 'SET_NOTI_PREFERENCE',
        payload
    };
}

export function setNotiSoundPreference(payload) {
    return {
        type: 'SET_NOTI_SOUND_PREFERENCE',
        payload
    };
}

export function setLoginWithPasswordPreference(payload) {
    return {
        type: 'SET_LOGIN_PASSWORD_PREFERENCE',
        payload
    };
}
export function setVibrationPreference(payload) {
    return {
        type: 'SET_VIBRATION_PREFERENCE',
        payload
    };
}
export function setBiometric(payload) {
    return {
        type: 'SET_BIOMETRIC',
        payload
    };
}
export function setNotificationAlert(payload) {
    return {
        type: 'SET_NOTIFICATION_ALERT',
        payload
    };
}
