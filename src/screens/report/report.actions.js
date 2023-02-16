import firebase from '../../firebase';
import { func } from '../../storage';
import FirebaseManager from '../../lib/base/firebase_manager';
let firebaseManager;
let newItems = false;

export function setLang(payload) {
    return {
        type: 'SET_LANG',
        payload
    };
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
export function setVibrationPreference(payload) {
    return {
        type: 'SET_VIBRATION_PREFERENCE',
        payload
    };
}
