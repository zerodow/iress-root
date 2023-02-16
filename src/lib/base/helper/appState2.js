import { AppState } from 'react-native';
import _ from 'lodash';
import { getLastTimeRenewToken } from '../functionUtil';
export default class StateApp {
    constructor(registerFn, inactiveFn) {
        this._handleAppStateChange = this._handleAppStateChange.bind(this);
        this.registerFn = registerFn || (() => null);
        this.inactiveFn = inactiveFn || (() => null);
        this.preStateApp = AppState.currentState;
    }
    addListenerAppState() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    removeListenerAppState() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange(nextAppState) {
        if (
            this.preStateApp.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            getLastTimeRenewToken(this.registerFn);
        } else {
            this.inactiveFn();
        }

        this.preStateApp = nextAppState;
    }
}
