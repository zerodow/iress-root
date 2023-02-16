import { AppState, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { func, dataStorage } from '../../../storage';
import firebase from '../../../firebase';
import { logDevice, getLastTimeRenewToken } from '../functionUtil';
export default class StateApp {
    constructor(registerFn, unregisterFn, typeForm, isLoadFirst = true) {
        this.registerFn = registerFn;
        this.isActive = true;
        this.state = true;
        this.currentState = 'active'
        this.typeForm = typeForm;
        this.unregisterFn = unregisterFn;
        isLoadFirst && this.registerFn && this.registerFn();
        this.currentScreen = null;
        AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    }

    removeHandler() {
    }

    countC2R() {
        const type = this.typeForm ? this.typeForm : '';
        if (dataStorage.currentScreenId === type) {
            logDevice('info', `getData ${type} from appState`);
            this.state = true;
            getLastTimeRenewToken(() => {
                this.registerFn && this.registerFn();
            })
        }
    }

    handleAppStateChange(nextAppState) {
        const isChangeState = nextAppState !== this.currentState
        if (isChangeState) {
            this.currentState = nextAppState
            if (nextAppState === 'active') {
                if (!this.state) {
                    this.state = true;
                    this.countC2R();
                }
            } else if (nextAppState === 'background' ||
                nextAppState === 'inactive') {
                this.state = false;
                this.unregisterFn && this.unregisterFn();
            }
        }
    }
}
