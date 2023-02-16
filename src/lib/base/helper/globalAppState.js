import {
    AppState
} from 'react-native'

export default class GlobalAppState {
    constructor(activeCb, inActiveCb, backgroundCb) {
        this.activeCb = activeCb || null
        this.inActiveCb = inActiveCb || null
        this.backgroundCb = backgroundCb || null
        this.updateInformation = this.updateInformation.bind(this)
        this.handleAppStateChange = this.handleAppStateChange.bind(this)
        AppState.addEventListener('change', this.handleAppStateChange)
    }
    updateInformation(activeCb, inActiveCb, backgroundCb) {
        if (this.activeCb) {
            this.activeCb = activeCb
        }
        if (this.inActiveCb) {
            this.inActiveCb = inActiveCb
        }
        if (this.backgroundCb) {
            this.backgroundCb = this.backgroundCb
        }
    }

    handleAppStateChange(event) {
        if (event.id === 'active') {
            this.activeCb && this.activeCb();
        } else if (event.id === 'background') {
            this.backgroundCb && this.backgroundCb();
        } else if (event.id === 'inactive') {
            this.inActiveCb && this.inActiveCb();
        }
    }
}
